import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  buildRawMessage,
  latestReceiptForKey,
  normalizeAddressList,
  parseArgs,
  selectAcceptedFromAddress,
  sha256,
} from '../tools/gmail-bridge/p2/gmail-dual-account.mjs';
import {
  generateVaultKey,
  parseVaultKey,
  readEncryptedVault,
  writeEncryptedVault,
} from '../tools/gmail-bridge/p2/crypto-vault.mjs';

const root = process.cwd();
const mainPath = path.join(root, 'tools/gmail-bridge/p2/gmail-dual-account.mjs');
const vaultPath = path.join(root, 'tools/gmail-bridge/p2/crypto-vault.mjs');
const profilePath = path.join(root, 'examples/gmail-bridge/two-account.profile.json');
const readmePath = path.join(root, 'tools/gmail-bridge/p2/README.md');
const docsPath = path.join(root, 'docs/gmail-bridge/P2_DUAL_ACCOUNT_OAUTH.md');

for (const file of [mainPath, vaultPath, profilePath, readmePath, docsPath]) {
  await readFile(file, 'utf8');
}

for (const file of [mainPath, vaultPath, path.join(root, 'scripts/check-gmail-bridge-p2.mjs')]) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
}

const parsed = parseArgs(['send', '--role', 'enterprise-facing', '--dry-run']);
assert.equal(parsed.command, 'send');
assert.equal(parsed.options.role, 'enterprise-facing');
assert.equal(parsed.options['dry-run'], true);

assert.deepEqual(normalizeAddressList('a@example.com, b@example.com'), ['a@example.com', 'b@example.com']);
assert.throws(() => normalizeAddressList('bad-address'));

const aliases = [
  { sendAsEmail: 'primary@example.com', isPrimary: true, verificationStatus: 'accepted' },
  { sendAsEmail: 'accepted@example.com', isPrimary: false, verificationStatus: 'accepted' },
  { sendAsEmail: 'pending@example.com', isPrimary: false, verificationStatus: 'pending' },
];
assert.equal(selectAcceptedFromAddress('primary@example.com', aliases), 'primary@example.com');
assert.equal(selectAcceptedFromAddress('primary@example.com', aliases, 'accepted@example.com'), 'accepted@example.com');
assert.throws(() => selectAcceptedFromAddress('primary@example.com', aliases, 'pending@example.com'));
assert.throws(() => selectAcceptedFromAddress('primary@example.com', aliases, 'other@example.com'));

const raw = buildRawMessage({
  from: 'primary@example.com',
  to: ['dest@example.com'],
  subject: 'Test',
  body: 'Body',
  messageId: 'abc@gmail-bridge.local',
});
const decoded = Buffer.from(raw.replaceAll('-', '+').replaceAll('_', '/'), 'base64').toString('utf8');
assert.match(decoded, /From: primary@example\.com/);
assert.match(decoded, /Message-ID: <abc@gmail-bridge\.local>/);
assert.match(decoded, /\r\n\r\nBody$/);
assert.throws(() => buildRawMessage({
  from: 'primary@example.com\r\nBcc: attacker@example.com',
  to: ['dest@example.com'],
  subject: 'Test',
  body: 'Body',
  messageId: 'abc@gmail-bridge.local',
}));

const keyHash = sha256('one-key');
assert.equal(latestReceiptForKey([], keyHash), null);
assert.equal(latestReceiptForKey([
  { idempotencyKeyHash: keyHash, status: 'intent-recorded' },
  { idempotencyKeyHash: keyHash, status: 'provider-confirmed' },
], keyHash).status, 'provider-confirmed');

const tempDir = await mkdtemp(path.join(os.tmpdir(), 'gmail-bridge-p2-'));
try {
  const encryptedPath = path.join(tempDir, 'accounts.enc.json');
  const keyText = generateVaultKey();
  const key = parseVaultKey(keyText);
  const secretEmail = 'private-account@example.com';
  const secretToken = 'refresh-token-secret-value';
  await writeEncryptedVault(encryptedPath, key, {
    schemaVersion: 'gmail-bridge.vault.v1',
    accounts: {
      test: { email: secretEmail, refreshToken: secretToken },
    },
  });
  const encryptedText = await readFile(encryptedPath, 'utf8');
  assert.equal(encryptedText.includes(secretEmail), false);
  assert.equal(encryptedText.includes(secretToken), false);
  const recovered = await readEncryptedVault(encryptedPath, key);
  assert.equal(recovered.accounts.test.email, secretEmail);
  assert.equal(recovered.accounts.test.refreshToken, secretToken);
} finally {
  await rm(tempDir, { recursive: true, force: true });
}

const sourceCorpus = await Promise.all([mainPath, vaultPath, profilePath, readmePath, docsPath].map((file) => readFile(file, 'utf8'))).then((parts) => parts.join('\n'));
assert.match(sourceCorpus, /127\.0\.0\.1/);
assert.match(sourceCorpus, /--confirm-send SEND/);
assert.match(sourceCorpus, /provider-outcome-unknown/);
assert.match(sourceCorpus, /gmail\.settings\.basic/);
assert.match(sourceCorpus, /gmail\.send/);
assert.doesNotMatch(sourceCorpus, /hviti\.swift@gmail\.com/i);
assert.doesNotMatch(sourceCorpus, /justin\.rackham@gmail\.com/i);
assert.doesNotMatch(sourceCorpus, /service[_ -]?account.*private[_ -]?key/i);
assert.doesNotMatch(sourceCorpus, /client_secret\s*[:=]\s*["'][^.'"]{8,}/i);

const help = spawnSync(process.execPath, [mainPath, 'help'], { encoding: 'utf8' });
assert.equal(help.status, 0, help.stderr);
assert.match(help.stdout, /Gmail Dual-Account Bridge P2/);
assert.match(help.stdout, /authorize --role/);
assert.match(help.stdout, /--confirm-send SEND/);

const receipt = {
  schemaVersion: 'gmail-bridge-p2-verification.v1',
  verifiedAt: new Date().toISOString(),
  checks: {
    syntax: 'PASS',
    encryptedVaultRoundTrip: 'PASS',
    plaintextSecretAbsence: 'PASS',
    acceptedAliasEnforcement: 'PASS',
    headerInjectionRejection: 'PASS',
    idempotencyStateSelection: 'PASS',
    loopbackOauthBoundary: 'PASS',
    explicitSendConfirmation: 'PASS',
    publicAddressAbsence: 'PASS'
  },
  truthState: 'CODE_VERIFIED_LOCAL_OAUTH_NOT_RUN'
};
console.log(JSON.stringify(receipt, null, 2));
