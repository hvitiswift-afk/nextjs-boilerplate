import { sha256, stableJson } from "./contract.mjs";

export const SubmissionState = Object.freeze({
  DRAFT: "DRAFT",
  HUMAN_VERIFICATION_REQUIRED: "HUMAN_VERIFICATION_REQUIRED",
  ACKNOWLEDGMENT_REQUIRED: "ACKNOWLEDGMENT_REQUIRED",
  READY: "READY",
  SUBMITTING: "SUBMITTING",
  SUBMITTED: "SUBMITTED",
  SUBMISSION_STATUS_UNKNOWN: "SUBMISSION_STATUS_UNKNOWN",
  BLOCKED: "BLOCKED",
});

export function evaluateReadiness({
  contract,
  acknowledgment,
  humanVerification,
  currentOrigin,
  trustedOrigins = [],
  priorState = SubmissionState.DRAFT,
}) {
  const blockers = [];
  const trusted = trustedOrigins.includes(currentOrigin);

  if (!trusted) blockers.push({ code: "UNTRUSTED_ORIGIN", currentOrigin, trustedOrigins });
  if (!humanVerification?.complete) blockers.push({ code: "HUMAN_VERIFICATION_REQUIRED" });
  if (!contract?.ok) blockers.push(...(contract?.blockers || [{ code: "FIELD_CONTRACT_FAILED" }]));
  if (!acknowledgment?.ok) blockers.push(...(acknowledgment?.blockers || [{ code: "ACKNOWLEDGMENT_REQUIRED" }]));
  if (priorState === SubmissionState.SUBMITTING) blockers.push({ code: "SUBMISSION_ALREADY_IN_PROGRESS" });
  if (priorState === SubmissionState.SUBMITTED) blockers.push({ code: "SUBMISSION_ALREADY_CONFIRMED" });
  if (priorState === SubmissionState.SUBMISSION_STATUS_UNKNOWN) {
    blockers.push({ code: "SUBMISSION_STATUS_UNKNOWN_NO_RETRY" });
  }

  const ready = blockers.length === 0;
  const result = {
    ready,
    phase: ready
      ? SubmissionState.READY
      : !humanVerification?.complete
        ? SubmissionState.HUMAN_VERIFICATION_REQUIRED
        : !acknowledgment?.ok
          ? SubmissionState.ACKNOWLEDGMENT_REQUIRED
          : SubmissionState.BLOCKED,
    trustedOrigin: trusted,
    currentOrigin,
    humanVerificationComplete: Boolean(humanVerification?.complete),
    contractDigest: contract?.digest || null,
    acknowledgmentDigest: acknowledgment?.digest || null,
    blockers,
  };
  return { ...result, digest: sha256(stableJson(result)) };
}

export class IdempotencyLedger {
  #records = new Map();

  begin({ key, payloadDigest, readiness, now = new Date().toISOString() }) {
    if (!key || typeof key !== "string") throw new Error("An idempotency key is required.");
    if (!payloadDigest || typeof payloadDigest !== "string") throw new Error("A payload digest is required.");

    const existing = this.#records.get(key);
    if (existing) {
      if (existing.payloadDigest !== payloadDigest) {
        throw new Error("An idempotency key cannot be reused for a different payload.");
      }
      return { action: "REPLAY", record: structuredClone(existing) };
    }

    if (!readiness?.ready) {
      return {
        action: "BLOCKED",
        blockers: readiness?.blockers || [{ code: "READINESS_NOT_PROVIDED" }],
      };
    }

    const record = {
      key,
      payloadDigest,
      state: SubmissionState.SUBMITTING,
      submissionActions: 1,
      createdAt: now,
      updatedAt: now,
      readinessDigest: readiness.digest,
      referenceId: null,
      confirmationDigest: null,
      evidence: null,
    };
    this.#records.set(key, record);
    return { action: "SUBMIT", record: structuredClone(record) };
  }

  confirm({ key, referenceId, confirmation, evidence, now = new Date().toISOString() }) {
    const record = this.#requireRecord(key);
    if (record.state === SubmissionState.SUBMITTED) return structuredClone(record);
    if (record.state !== SubmissionState.SUBMITTING) {
      throw new Error(`Cannot confirm a submission in state ${record.state}.`);
    }
    record.state = SubmissionState.SUBMITTED;
    record.referenceId = String(referenceId || "").trim() || null;
    record.confirmationDigest = sha256(stableJson(confirmation || {}));
    record.evidence = evidence || null;
    record.updatedAt = now;
    return structuredClone(record);
  }

  markUnknown({ key, evidence, now = new Date().toISOString() }) {
    const record = this.#requireRecord(key);
    if (record.state === SubmissionState.SUBMITTED) return structuredClone(record);
    if (record.state !== SubmissionState.SUBMITTING) {
      throw new Error(`Cannot mark an outcome unknown from state ${record.state}.`);
    }
    record.state = SubmissionState.SUBMISSION_STATUS_UNKNOWN;
    record.evidence = evidence || null;
    record.updatedAt = now;
    return structuredClone(record);
  }

  get(key) {
    const record = this.#records.get(key);
    return record ? structuredClone(record) : null;
  }

  snapshot() {
    return [...this.#records.values()].map((record) => structuredClone(record));
  }

  #requireRecord(key) {
    const record = this.#records.get(key);
    if (!record) throw new Error(`Unknown idempotency key: ${key}.`);
    return record;
  }
}
