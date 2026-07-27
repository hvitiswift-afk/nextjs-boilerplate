import { sha256, stableJson } from "./contract.mjs";
import { SubmissionState } from "./state-machine.mjs";

const ZERO_HASH = "0".repeat(64);

function clone(value) {
  return value == null ? value : structuredClone(value);
}

function requireText(value, label) {
  const normalized = String(value || "").trim();
  if (!normalized) throw new Error(`${label} is required.`);
  return normalized;
}

function receiptBody({ idempotencyKey, sequence, at, type, data, previousHash }) {
  return { idempotencyKey, sequence, at, type, data, previousHash };
}

async function appendReceiptEvent(tx, { idempotencyKey, type, data = {}, at }) {
  const previous = await tx.getLastReceiptEventForUpdate(idempotencyKey);
  const sequence = previous ? previous.sequence + 1 : 0;
  const previousHash = previous ? previous.hash : ZERO_HASH;
  const body = receiptBody({ idempotencyKey, sequence, at, type, data, previousHash });
  const entry = { ...body, hash: sha256(stableJson(body)) };
  await tx.insertReceiptEvent(entry);
  return clone(entry);
}

export function verifyReceiptEvents(events = []) {
  let previousHash = ZERO_HASH;
  const failures = [];
  events.forEach((entry, index) => {
    const body = receiptBody({
      idempotencyKey: entry.idempotencyKey,
      sequence: entry.sequence,
      at: entry.at,
      type: entry.type,
      data: entry.data,
      previousHash: entry.previousHash,
    });
    const expectedHash = sha256(stableJson(body));
    if (entry.sequence !== index) failures.push({ sequence: index, code: "SEQUENCE_MISMATCH" });
    if (entry.previousHash !== previousHash) failures.push({ sequence: index, code: "PREVIOUS_HASH_MISMATCH" });
    if (entry.hash !== expectedHash) failures.push({ sequence: index, code: "EVENT_HASH_MISMATCH" });
    previousHash = entry.hash;
  });
  return {
    ok: failures.length === 0,
    eventCount: events.length,
    head: events.at(-1)?.hash || ZERO_HASH,
    failures,
  };
}

export class TransactionalIdempotencyLedger {
  constructor(repository) {
    if (!repository || typeof repository.transact !== "function") {
      throw new Error("A transactional intake repository is required.");
    }
    this.repository = repository;
  }

  async begin({ key, payloadDigest, readiness, now = new Date().toISOString() }) {
    const idempotencyKey = requireText(key, "An idempotency key");
    const digest = requireText(payloadDigest, "A payload digest");

    if (!readiness?.ready) {
      return {
        action: "BLOCKED",
        blockers: clone(readiness?.blockers || [{ code: "READINESS_NOT_PROVIDED" }]),
      };
    }

    return this.repository.transact(async (tx) => {
      const candidate = {
        key: idempotencyKey,
        payloadDigest: digest,
        state: SubmissionState.SUBMITTING,
        submissionActions: 1,
        readinessDigest: requireText(readiness.digest, "A readiness digest"),
        referenceId: null,
        confirmationDigest: null,
        evidence: null,
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      const inserted = await tx.insertSubmissionIfAbsent(candidate);
      if (inserted) {
        await appendReceiptEvent(tx, {
          idempotencyKey,
          type: "SUBMISSION_STARTED",
          data: {
            payloadDigest: digest,
            readinessDigest: candidate.readinessDigest,
            submissionActions: candidate.submissionActions,
          },
          at: now,
        });
        return { action: "SUBMIT", record: clone(candidate) };
      }

      const existing = await tx.getSubmissionForUpdate(idempotencyKey);
      if (!existing) throw new Error("The idempotency record disappeared during a transactional replay.");
      if (existing.payloadDigest !== digest) {
        throw new Error("An idempotency key cannot be reused for a different payload.");
      }
      return { action: "REPLAY", record: clone(existing) };
    });
  }

  async confirm({ key, referenceId, confirmation, evidence, now = new Date().toISOString() }) {
    const idempotencyKey = requireText(key, "An idempotency key");
    const normalizedReference = requireText(referenceId, "A confirmation reference ID");
    return this.repository.transact(async (tx) => {
      const existing = await tx.getSubmissionForUpdate(idempotencyKey);
      if (!existing) throw new Error(`Unknown idempotency key: ${idempotencyKey}.`);
      if (existing.state === SubmissionState.SUBMITTED) {
        if (existing.referenceId !== normalizedReference) {
          throw new Error("A confirmed idempotency record cannot be assigned a different reference ID.");
        }
        return clone(existing);
      }
      if (existing.state !== SubmissionState.SUBMITTING) {
        throw new Error(`Cannot confirm a submission in state ${existing.state}.`);
      }

      const confirmationDigest = sha256(stableJson(confirmation || {}));
      const next = {
        ...existing,
        state: SubmissionState.SUBMITTED,
        referenceId: normalizedReference,
        confirmationDigest,
        evidence: clone(evidence || null),
        updatedAt: now,
        version: existing.version + 1,
      };
      const stored = await tx.updateSubmission(next, existing.version);
      await appendReceiptEvent(tx, {
        idempotencyKey,
        type: "SUBMISSION_CONFIRMED",
        data: {
          referenceId: normalizedReference,
          confirmationDigest,
          evidenceDigest: sha256(stableJson(evidence || {})),
          submissionActions: stored.submissionActions,
        },
        at: now,
      });
      return clone(stored);
    });
  }

  async markUnknown({ key, evidence, now = new Date().toISOString() }) {
    const idempotencyKey = requireText(key, "An idempotency key");
    return this.repository.transact(async (tx) => {
      const existing = await tx.getSubmissionForUpdate(idempotencyKey);
      if (!existing) throw new Error(`Unknown idempotency key: ${idempotencyKey}.`);
      if (existing.state === SubmissionState.SUBMITTED || existing.state === SubmissionState.SUBMISSION_STATUS_UNKNOWN) {
        return clone(existing);
      }
      if (existing.state !== SubmissionState.SUBMITTING) {
        throw new Error(`Cannot mark an outcome unknown from state ${existing.state}.`);
      }

      const next = {
        ...existing,
        state: SubmissionState.SUBMISSION_STATUS_UNKNOWN,
        evidence: clone(evidence || null),
        updatedAt: now,
        version: existing.version + 1,
      };
      const stored = await tx.updateSubmission(next, existing.version);
      await appendReceiptEvent(tx, {
        idempotencyKey,
        type: "SUBMISSION_STATUS_UNKNOWN",
        data: {
          evidenceDigest: sha256(stableJson(evidence || {})),
          submissionActions: stored.submissionActions,
          retryPermitted: false,
        },
        at: now,
      });
      return clone(stored);
    });
  }

  async get(key) {
    return clone(await this.repository.getSubmission(requireText(key, "An idempotency key")));
  }

  async events(key) {
    return clone(await this.repository.getReceiptEvents(requireText(key, "An idempotency key")));
  }
}
