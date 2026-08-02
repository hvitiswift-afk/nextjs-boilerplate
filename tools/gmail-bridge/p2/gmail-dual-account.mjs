#!/usr/bin/env node
import { createHash, randomBytes } from 'node:crypto';
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import {
  generateVaultKey,
  parseVaultKey,
  readEncryptedVault,
  writeEncryptedVault,
} from './crypto-vault.mjs';

const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const USERINFO_ENDPOINT = 'https://openidconnect.googleapis.com/v1/userinfo';
const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me';
const SCOPES = [
  'openid',
  'email',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.settings.basic',
];
const DEFAULT_VAULT = '.gmail-bridge/accounts.enc.json';
const DEFAULT_RECEIPTS = '.gmail-bridge/receipts/send-attempts.jsonl';
const REDACTED = '[REDACTED]';

export function parseArgs(argv) {
  const [command = 'help', ...rest] = argv;
  const options = {};
  const positionals = [];

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (!token.startsWith('--')) {
      positionals.push(token);
      continue;
    }
    const [rawKey, inlineValue] = token.slice(2).split('=', 2);
    const next = rest[index + 1];
    if (inlineValue !== undefined) {
      options[rawKey] = inlineValue;
    } else if (next !== undefined && !next.startsWith('--')) {
      options[rawKey] = next;
      index += 1;
    } else {
      options[rawKey] = true;
    }
  }

  return { command, options, positionals };
}

function requiredOption(options, name) {
  const value = options[name];
  if (!value || value === true) {
    throw new Error(`--${name} is required.`);
  }
  return String(value);
}

function runtimePaths(options = {}) {
  return {
    vaultPath: path.resolve(String(options.vault ?? process.env.JP_GMAIL_BRIDGE_VAULT ?? DEFAULT_VAULT)),
    receiptsPath: path.resolve(String(options.receipts ?? process.env.JP_GMAIL_BRIDGE_RECEIPTS ?? DEFAULT_RECEIPTS)),
  };
}

function clientConfig() {
  const clientId = process.env.JP_GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.JP_GOOGLE_OAUTH_CLIENT_SECRET ?? '';
  if (!clientId) {
    throw new Error('JP_GOOGLE_OAUTH_CLIENT_ID is required. Use a Google OAuth Desktop app client.');
  }
  return { clientId, clientSecret };
}

export function base64Url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function cleanHeader(value, field) {
  const text = String(value ?? '');
  if (/[\r\n]/u.test(text)) {
    throw new Error(`${field} must not contain line breaks.`);
  }
  return text.trim();
}

export function normalizeAddressList(value) {
  const addresses = String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  if (addresses.length === 0) {
    throw new Error('At least one recipient is required.');
  }
  for (const address of addresses) {
    if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/u.test(address)) {
      throw new Error(`Invalid recipient address: ${address}`);
    }
  }
  return addresses;
}

export function selectAcceptedFromAddress(accountEmail, aliases, requestedAlias) {
  const requested = (requestedAlias || accountEmail).toLowerCase();
  const matching = aliases.find((alias) => String(alias.sendAsEmail).toLowerCase() === requested);
  if (!matching) {
    throw new Error(`Requested From address is not registered for this Google account: ${requested}`);
  }
  const isUsable = matching.isPrimary || matching.verificationStatus === 'accepted';
  if (!isUsable) {
    throw new Error(`Requested From address is not verified for sending: ${requested}`);
  }
  return matching.sendAsEmail;
}

export function buildRawMessage({ from, to, cc = [], bcc = [], subject, body, messageId }) {
  const lines = [
    `From: ${cleanHeader(from, 'From')}`,
    `To: ${to.map((address) => cleanHeader(address, 'To')).join(', ')}`,
  ];
  if (cc.length > 0) lines.push(`Cc: ${cc.map((address) => cleanHeader(address, 'Cc')).join(', ')}`);
  if (bcc.length > 0) lines.push(`Bcc: ${bcc.map((address) => cleanHeader(address, 'Bcc')).join(', ')}`);
  lines.push(
    `Subject: ${cleanHeader(subject, 'Subject')}`,
    `Message-ID: <${cleanHeader(messageId, 'Message-ID')}>`,
    `Date: ${new Date().toUTCString()}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    String(body),
  );
  return base64Url(Buffer.from(lines.join('\r\n'), 'utf8'));
}

async function readBody(bodyFile) {
  if (bodyFile === '-') {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    return Buffer.concat(chunks).toString('utf8');
  }
  return readFile(path.resolve(bodyFile), 'utf8');
}

function openBrowser(url) {
  const platform = process.platform;
  let command;
  let args;
  if (platform === 'win32') {
    command = 'cmd';
    args = ['/c', 'start', '', url];
  } else if (platform === 'darwin') {
    command = 'open';
    args = [url];
  } else {
    command = 'xdg-open';
    args = [url];
  }
  const child = spawn(command, args, { detached: true, stdio: 'ignore' });
  child.unref();
}

async function startOAuthCallbackServer(expectedState) {
  let resolveResult;
  let rejectResult;
  const result = new Promise((resolve, reject) => {
    resolveResult = resolve;
    rejectResult = reject;
  });

  const server = http.createServer((request, response) => {
    const url = new URL(request.url, 'http://127.0.0.1');
    if (url.pathname !== '/oauth2/callback') {
      response.writeHead(404).end('Not found');
      return;
    }
    const error = url.searchParams.get('error');
    const state = url.searchParams.get('state');
    const code = url.searchParams.get('code');
    if (error) {
      response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Google authorization was not completed. You may close this tab.');
      rejectResult(new Error(`Google authorization error: ${error}`));
      return;
    }
    if (!code || state !== expectedState) {
      response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Invalid OAuth callback. You may close this tab.');
      rejectResult(new Error('OAuth state or authorization code did not validate.'));
      return;
    }
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Gmail bridge authorization received. You may close this tab and return to the terminal.');
    resolveResult(code);
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  if (!address || typeof address === 'string') {
    server.close();
    throw new Error('Could not allocate the local OAuth callback port.');
  }
  const redirectUri = `http://127.0.0.1:${address.port}/oauth2/callback`;
  const timeout = setTimeout(() => rejectResult(new Error('OAuth authorization timed out.')), 5 * 60 * 1000);
  timeout.unref?.();

  return {
    redirectUri,
    codePromise: result.finally(() => {
      clearTimeout(timeout);
      server.close();
    }),
  };
}

async function postForm(url, fields) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`OAuth token request failed (${response.status}): ${payload.error_description ?? payload.error ?? 'unknown error'}`);
  }
  return payload;
}

async function fetchJson(url, accessToken, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers ?? {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Google API request failed (${response.status}): ${payload.error?.message ?? payload.error_description ?? 'unknown error'}`);
  }
  return payload;
}

async function authorizeAccount(options) {
  const role = requiredOption(options, 'role');
  const expectedEmail = options['expect-email'] ? String(options['expect-email']).toLowerCase() : null;
  const loginHint = options['login-hint'] ? String(options['login-hint']) : expectedEmail;
  const { vaultPath } = runtimePaths(options);
  const key = parseVaultKey(process.env.JP_GMAIL_BRIDGE_VAULT_KEY);
  const { clientId, clientSecret } = clientConfig();

  const state = base64Url(randomBytes(32));
  const verifier = base64Url(randomBytes(64));
  const challenge = base64Url(createHash('sha256').update(verifier).digest());
  const callback = await startOAuthCallbackServer(state);
  const authUrl = new URL(AUTH_ENDPOINT);
  authUrl.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callback.redirectUri,
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline',
    include_granted_scopes: 'true',
    prompt: 'consent select_account',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    ...(loginHint ? { login_hint: loginHint } : {}),
  }).toString();

  console.log(`Opening Google authorization for role "${role}" on loopback only.`);
  console.log('Complete Google sign-in, consent, MFA, and any human verification in the browser yourself.');
  openBrowser(authUrl.toString());
  const code = await callback.codePromise;
  const token = await postForm(TOKEN_ENDPOINT, {
    client_id: clientId,
    ...(clientSecret ? { client_secret: clientSecret } : {}),
    code,
    code_verifier: verifier,
    redirect_uri: callback.redirectUri,
    grant_type: 'authorization_code',
  });
  const profile = await fetchJson(USERINFO_ENDPOINT, token.access_token);
  if (!profile.email || profile.email_verified !== true) {
    throw new Error('Google did not return a verified account email.');
  }
  const email = String(profile.email).toLowerCase();
  if (expectedEmail && email !== expectedEmail) {
    throw new Error(`Authorized ${email}, but --expect-email required ${expectedEmail}. Nothing was stored.`);
  }

  const vault = await readEncryptedVault(vaultPath, key);
  const prior = vault.accounts[role];
  const refreshToken = token.refresh_token ?? (prior?.email === email ? prior.refreshToken : null);
  if (!refreshToken) {
    throw new Error('Google did not return a refresh token. Revoke prior app access or retry with consent; nothing was stored.');
  }
  vault.accounts[role] = {
    email,
    refreshToken,
    scopes: String(token.scope ?? SCOPES.join(' ')).split(' ').filter(Boolean),
    authorizedAt: new Date().toISOString(),
    tokenType: token.token_type ?? 'Bearer',
  };
  await writeEncryptedVault(vaultPath, key, vault);
  console.log(JSON.stringify({ role, email, state: 'AUTHORIZED_AND_ENCRYPTED_LOCALLY' }, null, 2));
}

async function accessTokenFor(account) {
  const { clientId, clientSecret } = clientConfig();
  const token = await postForm(TOKEN_ENDPOINT, {
    client_id: clientId,
    ...(clientSecret ? { client_secret: clientSecret } : {}),
    refresh_token: account.refreshToken,
    grant_type: 'refresh_token',
  });
  if (!token.access_token) throw new Error('Google did not return an access token.');
  return token.access_token;
}

async function loadRole(options) {
  const role = requiredOption(options, 'role');
  const { vaultPath } = runtimePaths(options);
  const key = parseVaultKey(process.env.JP_GMAIL_BRIDGE_VAULT_KEY);
  const vault = await readEncryptedVault(vaultPath, key);
  const account = vault.accounts[role];
  if (!account) throw new Error(`No authorized account is stored for role: ${role}`);
  return { role, account, vault, key, vaultPath };
}

async function listAccounts(options) {
  const { vaultPath } = runtimePaths(options);
  const key = parseVaultKey(process.env.JP_GMAIL_BRIDGE_VAULT_KEY);
  const vault = await readEncryptedVault(vaultPath, key);
  const accounts = Object.entries(vault.accounts).map(([role, account]) => ({
    role,
    email: account.email,
    authorizedAt: account.authorizedAt,
    scopes: account.scopes,
  }));
  console.log(JSON.stringify({ accounts }, null, 2));
}

async function listAliasesForAccount(account, accessToken) {
  const payload = await fetchJson(`${GMAIL_API}/settings/sendAs`, accessToken);
  return payload.sendAs ?? [];
}

async function listAliases(options) {
  const { role, account } = await loadRole(options);
  const accessToken = await accessTokenFor(account);
  const aliases = await listAliasesForAccount(account, accessToken);
  console.log(JSON.stringify({
    role,
    authenticatedEmail: account.email,
    aliases: aliases.map(({ sendAsEmail, displayName, isPrimary, isDefault, verificationStatus }) => ({
      sendAsEmail,
      displayName,
      isPrimary,
      isDefault,
      verificationStatus,
      usable: Boolean(isPrimary || verificationStatus === 'accepted'),
    })),
  }, null, 2));
}

async function readReceipts(receiptsPath) {
  try {
    const text = await readFile(receiptsPath, 'utf8');
    return text.split('\n').filter(Boolean).map((line) => JSON.parse(line));
  } catch (error) {
    if (error?.code === 'ENOENT') return [];
    throw error;
  }
}

async function appendReceipt(receiptsPath, receipt) {
  await mkdir(path.dirname(receiptsPath), { recursive: true, mode: 0o700 });
  await appendFile(receiptsPath, `${JSON.stringify(receipt)}\n`, { mode: 0o600 });
}

export function latestReceiptForKey(receipts, keyHash) {
  return receipts.filter((receipt) => receipt.idempotencyKeyHash === keyHash).at(-1) ?? null;
}

function assertSendMayProceed(latest) {
  if (!latest) return;
  if (latest.status === 'provider-confirmed') {
    const duplicate = new Error('This idempotency key already has a provider-confirmed send. No duplicate was sent.');
    duplicate.code = 'ALREADY_CONFIRMED';
    duplicate.receipt = latest;
    throw duplicate;
  }
  throw new Error(`This idempotency key is locked by prior status "${latest.status}". Reconcile it before using a new key; no blind retry is allowed.`);
}

async function sendMessage(options) {
  const { role, account } = await loadRole(options);
  const to = normalizeAddressList(requiredOption(options, 'to'));
  const cc = options.cc ? normalizeAddressList(options.cc) : [];
  const bcc = options.bcc ? normalizeAddressList(options.bcc) : [];
  const subject = requiredOption(options, 'subject');
  const bodyFile = requiredOption(options, 'body-file');
  const idempotencyKey = requiredOption(options, 'idempotency-key');
  const body = await readBody(bodyFile);
  const { receiptsPath } = runtimePaths(options);
  const keyHash = sha256(idempotencyKey);
  const receipts = await readReceipts(receiptsPath);
  assertSendMayProceed(latestReceiptForKey(receipts, keyHash));

  const accessToken = await accessTokenFor(account);
  const aliases = await listAliasesForAccount(account, accessToken);
  const from = selectAcceptedFromAddress(account.email, aliases, options.from ? String(options.from) : null);
  const messageId = `${sha256(`${idempotencyKey}\0${from}`).slice(0, 40)}@gmail-bridge.local`;
  const summary = {
    role,
    authenticatedEmail: account.email,
    from,
    toCount: to.length,
    ccCount: cc.length,
    bccCount: bcc.length,
    subjectHash: sha256(subject),
    bodyHash: sha256(body),
    recipientHash: sha256(JSON.stringify({ to, cc, bcc })),
    idempotencyKeyHash: keyHash,
    messageId,
  };

  if (options['dry-run']) {
    console.log(JSON.stringify({ state: 'DRY_RUN_NO_SEND', ...summary }, null, 2));
    return;
  }
  if (options['confirm-send'] !== 'SEND') {
    throw new Error('Protected send requires --confirm-send SEND after human review.');
  }

  const attemptId = cryptoRandomId();
  await appendReceipt(receiptsPath, {
    schemaVersion: 'gmail-bridge.send-receipt.v1',
    attemptId,
    status: 'intent-recorded',
    createdAt: new Date().toISOString(),
    ...summary,
  });

  const raw = buildRawMessage({ from, to, cc, bcc, subject, body, messageId });
  let response;
  try {
    response = await fetch(`${GMAIL_API}/messages/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    });
  } catch (error) {
    await appendReceipt(receiptsPath, {
      schemaVersion: 'gmail-bridge.send-receipt.v1',
      attemptId,
      status: 'provider-outcome-unknown',
      createdAt: new Date().toISOString(),
      idempotencyKeyHash: keyHash,
      errorClass: error?.name ?? 'Error',
    });
    throw new Error('The provider outcome is unknown. Do not retry this idempotency key until Gmail Sent Mail is reconciled.');
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    await appendReceipt(receiptsPath, {
      schemaVersion: 'gmail-bridge.send-receipt.v1',
      attemptId,
      status: 'provider-rejected',
      createdAt: new Date().toISOString(),
      idempotencyKeyHash: keyHash,
      providerStatus: response.status,
      providerErrorHash: sha256(JSON.stringify(payload)),
    });
    throw new Error(`Gmail rejected the send (${response.status}). No blind retry is allowed for this key.`);
  }

  const receipt = {
    schemaVersion: 'gmail-bridge.send-receipt.v1',
    attemptId,
    status: 'provider-confirmed',
    createdAt: new Date().toISOString(),
    idempotencyKeyHash: keyHash,
    providerMessageId: payload.id,
    providerThreadId: payload.threadId ?? null,
    from,
    role,
  };
  await appendReceipt(receiptsPath, receipt);
  console.log(JSON.stringify({ state: 'SENT_AND_PROVIDER_CONFIRMED', receipt }, null, 2));
}

function cryptoRandomId() {
  return base64Url(randomBytes(18));
}

async function revokeLocal(options) {
  const role = requiredOption(options, 'role');
  const { vaultPath } = runtimePaths(options);
  const key = parseVaultKey(process.env.JP_GMAIL_BRIDGE_VAULT_KEY);
  const vault = await readEncryptedVault(vaultPath, key);
  if (!vault.accounts[role]) {
    console.log(JSON.stringify({ role, state: 'NOT_PRESENT' }, null, 2));
    return;
  }
  delete vault.accounts[role];
  await writeEncryptedVault(vaultPath, key, vault);
  console.log(JSON.stringify({ role, state: 'REMOVED_FROM_LOCAL_VAULT', note: 'Google-side access was not revoked.' }, null, 2));
}

async function showReceipts(options) {
  const { receiptsPath } = runtimePaths(options);
  const receipts = await readReceipts(receiptsPath);
  console.log(JSON.stringify({ receipts }, null, 2));
}

function printHelp() {
  console.log(`Gmail Dual-Account Bridge P2\n\nCommands:\n  key\n  authorize --role <name> [--expect-email <address>] [--login-hint <address>]\n  accounts\n  aliases --role <name>\n  send --role <name> --to <addresses> --subject <text> --body-file <path|-> --idempotency-key <key> [--from <accepted-alias>] [--cc <addresses>] [--bcc <addresses>] [--dry-run] [--confirm-send SEND]\n  receipts\n  revoke-local --role <name>\n\nEnvironment:\n  JP_GOOGLE_OAUTH_CLIENT_ID       Google OAuth Desktop app client ID\n  JP_GOOGLE_OAUTH_CLIENT_SECRET   Desktop client secret, when supplied by Google\n  JP_GMAIL_BRIDGE_VAULT_KEY       Base64 32-byte local encryption key\n  JP_GMAIL_BRIDGE_VAULT           Optional vault path\n  JP_GMAIL_BRIDGE_RECEIPTS        Optional receipt path\n\nSafety:\n  Each mailbox must complete its own Google OAuth consent. The bridge never accepts passwords, MFA codes, recovery codes, or copied cookies. Sends require explicit --confirm-send SEND and a fresh idempotency key.\n`);
}

export async function main(argv = process.argv.slice(2)) {
  const { command, options } = parseArgs(argv);
  switch (command) {
    case 'key':
      console.log(generateVaultKey());
      break;
    case 'authorize':
      await authorizeAccount(options);
      break;
    case 'accounts':
      await listAccounts(options);
      break;
    case 'aliases':
      await listAliases(options);
      break;
    case 'send':
      await sendMessage(options);
      break;
    case 'receipts':
      await showReceipts(options);
      break;
    case 'revoke-local':
      await revokeLocal(options);
      break;
    case 'help':
    case '--help':
    case '-h':
      printHelp();
      break;
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  main().catch((error) => {
    const output = {
      state: error?.code === 'ALREADY_CONFIRMED' ? 'NO_DUPLICATE_SENT' : 'ERROR',
      message: error?.message ?? String(error),
      receipt: error?.receipt ?? undefined,
      secrets: REDACTED,
    };
    console.error(JSON.stringify(output, null, 2));
    process.exitCode = 1;
  });
}
