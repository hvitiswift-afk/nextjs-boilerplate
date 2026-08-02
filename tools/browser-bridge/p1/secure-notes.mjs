// Concept origin and project direction: Justin Lee Rackham (JP), MATADATA.
// Backward-looking notes preserve verified history; they do not create future
// authority, rewrite provider evidence, or expose credentials.

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";

const ALGORITHM = "aes-256-gcm";
const KEY_ENV = "JP_BROWSER_BRIDGE_NOTES_KEY";

export function notesKeyFromEnvironment(env = process.env) {
  const encoded = env[KEY_ENV];
  if (!encoded) {
    throw new Error(`${KEY_ENV} is required and must contain a base64-encoded 32-byte key.`);
  }
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) {
    throw new Error(`${KEY_ENV} must decode to exactly 32 bytes.`);
  }
  return key;
}

function digestObject(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function encryptJson(value, key) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const plaintext = Buffer.from(JSON.stringify(value), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    algorithm: ALGORITHM,
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    ciphertext: ciphertext.toString("base64")
  };
}

function decryptJson(record, key) {
  if (record.algorithm !== ALGORITHM) throw new Error(`Unsupported notes algorithm: ${record.algorithm}`);
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(record.iv, "base64"));
  decipher.setAuthTag(Buffer.from(record.tag, "base64"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(record.ciphertext, "base64")),
    decipher.final()
  ]);
  return JSON.parse(plaintext.toString("utf8"));
}

async function readLines(path) {
  try {
    return (await readFile(path, "utf8"))
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

export async function appendBackwardLookingNote({
  path,
  missionId,
  text,
  evidence = [],
  truthState = "RETROSPECTIVE_UNVERIFIED",
  env = process.env,
  now = new Date()
}) {
  if (!String(text).trim()) throw new Error("A backward-looking note cannot be empty.");
  const key = notesKeyFromEnvironment(env);
  const existing = await readLines(path);
  const previousDigest = existing.at(-1)?.recordDigest ?? null;
  const payload = {
    schemaVersion: "browser-bridge.backward-note.v1",
    createdAt: now.toISOString(),
    missionId,
    direction: "backward-looking",
    truthState,
    text: String(text),
    evidence: Array.isArray(evidence) ? evidence.map(String) : [],
    previousDigest
  };
  const encrypted = encryptJson(payload, key);
  const record = {
    schemaVersion: "browser-bridge.encrypted-note.v1",
    createdAt: payload.createdAt,
    missionId,
    previousDigest,
    ...encrypted
  };
  record.recordDigest = digestObject(record);
  await mkdir(dirname(path), { recursive: true });
  await appendFile(path, `${JSON.stringify(record)}\n`, { mode: 0o600 });
  return {
    createdAt: record.createdAt,
    missionId,
    recordDigest: record.recordDigest,
    previousDigest,
    encrypted: true,
    noteContentReceipted: false
  };
}

export async function readBackwardLookingNotes({ path, env = process.env }) {
  const key = notesKeyFromEnvironment(env);
  const records = await readLines(path);
  const notes = [];
  let expectedPrevious = null;

  for (const record of records) {
    const storedDigest = record.recordDigest;
    const digestInput = { ...record };
    delete digestInput.recordDigest;
    const calculatedDigest = digestObject(digestInput);
    if (storedDigest !== calculatedDigest) throw new Error("Encrypted note record digest mismatch.");
    if (record.previousDigest !== expectedPrevious) throw new Error("Encrypted note chain is not append-only.");
    const payload = decryptJson(record, key);
    if (payload.previousDigest !== expectedPrevious) throw new Error("Decrypted note chain mismatch.");
    notes.push(payload);
    expectedPrevious = storedDigest;
  }

  return notes;
}

export function generateNotesKey() {
  return randomBytes(32).toString("base64");
}
