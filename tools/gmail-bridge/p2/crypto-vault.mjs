import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { chmod, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ALGORITHM = 'aes-256-gcm';
const KEY_BYTES = 32;

export function generateVaultKey() {
  return randomBytes(KEY_BYTES).toString('base64');
}

export function parseVaultKey(value) {
  if (!value) {
    throw new Error('JP_GMAIL_BRIDGE_VAULT_KEY is required. Generate one with the key command.');
  }

  const key = Buffer.from(value, 'base64');
  if (key.length !== KEY_BYTES) {
    throw new Error('JP_GMAIL_BRIDGE_VAULT_KEY must be a base64-encoded 32-byte key.');
  }
  return key;
}

export async function readEncryptedVault(filePath, key) {
  let text;
  try {
    text = await readFile(filePath, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return { schemaVersion: 'gmail-bridge.vault.v1', accounts: {} };
    }
    throw error;
  }

  const envelope = JSON.parse(text);
  if (envelope.schemaVersion !== 'gmail-bridge.envelope.v1') {
    throw new Error('Unsupported Gmail bridge vault envelope.');
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(envelope.iv, 'base64'),
  );
  decipher.setAuthTag(Buffer.from(envelope.authTag, 'base64'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(envelope.ciphertext, 'base64')),
    decipher.final(),
  ]);
  const vault = JSON.parse(plaintext.toString('utf8'));

  if (vault.schemaVersion !== 'gmail-bridge.vault.v1' || typeof vault.accounts !== 'object') {
    throw new Error('Unsupported Gmail bridge vault payload.');
  }
  return vault;
}

export async function writeEncryptedVault(filePath, key, vault) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const plaintext = Buffer.from(JSON.stringify(vault), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const envelope = {
    schemaVersion: 'gmail-bridge.envelope.v1',
    algorithm: ALGORITHM,
    iv: iv.toString('base64'),
    authTag: cipher.getAuthTag().toString('base64'),
    ciphertext: ciphertext.toString('base64'),
  };

  await mkdir(path.dirname(filePath), { recursive: true, mode: 0o700 });
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(envelope, null, 2)}\n`, { mode: 0o600 });
  await chmod(tempPath, 0o600);
  await rename(tempPath, filePath);
  await chmod(filePath, 0o600);
}
