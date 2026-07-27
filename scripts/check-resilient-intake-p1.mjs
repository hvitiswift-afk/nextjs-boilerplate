import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {
  SubmissionState,
  TransactionalIdempotencyLedger,
  buildConfirmationBundle,
  createMemoryIntakeRepository,
  createReferenceId,
  sha256,
  stableJson,
  summarizeBlockers,
  verifyConfirmationParity,
  verifyReceiptEvents,
} from "../lib/intake/index.mjs";

const fixedNow = "2026-07-27T08:00:00.000Z";
const readiness = {
  ready: true,
  phase: SubmissionState.READY,
  digest: sha256("matadata-p1-readiness"),
  blockers: [],
};
const payloadDigest = sha256(
  stableJson({
    schemaDigest: sha256("matadata-intake/1.0.0"),
    draftDigest: sha256("reviewed-non-confidential-draft"),
    acknowledgmentDigest: sha256("personally-affirmed-current-terms"),
  }),
);

const repository = createMemoryIntakeRepository();
const ledger = new TransactionalIdempotencyLedger(repository);
const concurrentAttempts = 24;
const attempts = await Promise.all(
  Array.from({ length: concurrentAttempts }, () =>
    ledger.begin({
      key: "matadata-p1-concurrent-001",
      payloadDigest,
      readiness,
      now: fixedNow,
    }),
  ),
);

assert.equal(attempts.filter((attempt) => attempt.action === "SUBMIT").length, 1);
assert.equal(attempts.filter((attempt) => attempt.action === "REPLAY").length, concurrentAttempts - 1);
assert.ok(attempts.every((attempt) => attempt.record?.submissionActions === 1));

const started = await ledger.get("matadata-p1-concurrent-001");
assert.equal(started.state, SubmissionState.SUBMITTING);
assert.equal(started.submissionActions, 1);
assert.equal(started.version, 1);

await assert.rejects(
  () =>
    ledger.begin({
      key: "matadata-p1-concurrent-001",
      payloadDigest: sha256("different-payload"),
      readiness,
      now: fixedNow,
    }),
  /different payload/,
);

const referenceId = createReferenceId({
  namespace: "MTD",
  now: "2026-07-27T08:01:00.000Z",
  entropy: "matadata-p1-reference-test",
});
const confirmed = await ledger.confirm({
  key: "matadata-p1-concurrent-001",
  referenceId,
  confirmation: {
    text: "Thank you",
    controlsDisappeared: true,
    trustedOrigin: true,
  },
  evidence: {
    confirmationPage: true,
    destinationReceipt: true,
  },
  now: "2026-07-27T08:01:01.000Z",
});
assert.equal(confirmed.state, SubmissionState.SUBMITTED);
assert.equal(confirmed.referenceId, referenceId);
assert.equal(confirmed.submissionActions, 1);
assert.equal(confirmed.version, 2);

const confirmedReplay = await ledger.begin({
  key: "matadata-p1-concurrent-001",
  payloadDigest,
  readiness,
  now: "2026-07-27T08:02:00.000Z",
});
assert.equal(confirmedReplay.action, "REPLAY");
assert.equal(confirmedReplay.record.state, SubmissionState.SUBMITTED);
assert.equal(confirmedReplay.record.submissionActions, 1);

const confirmationBundle = buildConfirmationBundle({
  record: confirmed,
  applicantEmail: "jp@example.test",
  confirmationBaseUrl: "https://intake.example.test/matadata/intake/confirmation",
});
const parity = verifyConfirmationParity(confirmationBundle);
assert.equal(parity.ok, true, JSON.stringify(parity.blockers, null, 2));
assert.equal(parity.referenceId, referenceId);
assert.ok(confirmationBundle.email.subject.includes(referenceId));
assert.ok(confirmationBundle.email.bodyText.includes(referenceId));
assert.ok(confirmationBundle.page.pageUrl.endsWith(`/${referenceId}`));

const tamperedBundle = structuredClone(confirmationBundle);
tamperedBundle.email.referenceId = createReferenceId({
  namespace: "MTD",
  now: "2026-07-27T08:01:00.000Z",
  entropy: "different-reference",
});
const tamperedParity = verifyConfirmationParity(tamperedBundle);
assert.equal(tamperedParity.ok, false);
assert.ok(tamperedParity.blockers.some((blocker) => blocker.code === "CONFIRMATION_REFERENCE_MISMATCH"));

const confirmedEvents = await ledger.events("matadata-p1-concurrent-001");
const confirmedEventVerification = verifyReceiptEvents(confirmedEvents);
assert.equal(confirmedEventVerification.ok, true, JSON.stringify(confirmedEventVerification.failures, null, 2));
assert.deepEqual(
  confirmedEvents.map((event) => event.type),
  ["SUBMISSION_STARTED", "SUBMISSION_CONFIRMED"],
);

const unknownStart = await ledger.begin({
  key: "matadata-p1-unknown-001",
  payloadDigest,
  readiness,
  now: "2026-07-27T08:03:00.000Z",
});
assert.equal(unknownStart.action, "SUBMIT");
const unknown = await ledger.markUnknown({
  key: "matadata-p1-unknown-001",
  evidence: { disconnectedAfterRequest: true, positiveConfirmation: false },
  now: "2026-07-27T08:03:30.000Z",
});
assert.equal(unknown.state, SubmissionState.SUBMISSION_STATUS_UNKNOWN);
assert.equal(unknown.submissionActions, 1);
const unknownReplay = await ledger.begin({
  key: "matadata-p1-unknown-001",
  payloadDigest,
  readiness,
  now: "2026-07-27T08:04:00.000Z",
});
assert.equal(unknownReplay.action, "REPLAY");
assert.equal(unknownReplay.record.state, SubmissionState.SUBMISSION_STATUS_UNKNOWN);
assert.equal(unknownReplay.record.submissionActions, 1);

const unknownEvents = await ledger.events("matadata-p1-unknown-001");
const unknownEventVerification = verifyReceiptEvents(unknownEvents);
assert.equal(unknownEventVerification.ok, true);
assert.deepEqual(
  unknownEvents.map((event) => event.type),
  ["SUBMISSION_STARTED", "SUBMISSION_STATUS_UNKNOWN"],
);

const blockerSummary = summarizeBlockers([
  { code: "FIELD_INVALID", field: "email", validationMessage: "Enter a valid email address." },
  { code: "HUMAN_VERIFICATION_REQUIRED" },
  { code: "SUBMISSION_STATUS_UNKNOWN_NO_RETRY" },
]);
assert.equal(blockerSummary.blockerCount, 3);
assert.equal(blockerSummary.requiresHumanAction, true);
assert.equal(blockerSummary.blindRetryProhibited, true);
assert.equal(blockerSummary.counts.critical, 1);
assert.ok(blockerSummary.blockers.every((blocker) => blocker.title && blocker.nextAction));

const sql = await fs.readFile(new URL("../infra/matadata-intake.sql", import.meta.url), "utf8");
assert.match(sql, /idempotency_key text primary key/i);
assert.match(sql, /submission_actions smallint not null default 1 check \(submission_actions = 1\)/i);
assert.match(sql, /reference_id text unique/i);
assert.match(sql, /unique \(idempotency_key, sequence\)/i);
assert.match(sql, /state <> 'SUBMITTED'[\s\S]+reference_id is not null[\s\S]+confirmation_digest is not null/i);
assert.doesNotMatch(sql, /\n\s+(proposal|funding|email|captcha_answer|signature)\s+/i);

const postgresSource = await fs.readFile(
  new URL("../lib/intake/postgres-repository.mjs", import.meta.url),
  "utf8",
);
assert.match(postgresSource, /begin isolation level serializable/i);
assert.match(postgresSource, /on conflict \(idempotency_key\) do nothing/i);
assert.match(postgresSource, /for update/i);
assert.match(postgresSource, /version = \$9[\s\S]+version = \$10/i);
assert.match(postgresSource, /error\?\.code === "40001"/i);

const receipt = {
  product: "MATADATA Resilient Intake",
  version: "1.1.0",
  status: "PASS",
  persistentIdempotency: {
    concurrentAttempts,
    submitActionsCreated: attempts.filter((attempt) => attempt.action === "SUBMIT").length,
    replayResponses: attempts.filter((attempt) => attempt.action === "REPLAY").length,
    finalSubmissionActions: confirmed.submissionActions,
    confirmedState: confirmed.state,
    unknownState: unknown.state,
    blindRetryAfterUnknown: false,
    postgresSerializableTransactionContract: true,
    optimisticVersionCheck: true,
  },
  confirmationParity: {
    referenceId,
    pageEmailReceiptMatch: parity.ok,
    mismatchedReferenceRejected: !tamperedParity.ok,
    confirmationDigest: parity.confirmationDigest,
  },
  blockerPresentation: {
    structuredCatalog: true,
    humanActionIdentified: blockerSummary.requiresHumanAction,
    blindRetryProhibitionIdentified: blockerSummary.blindRetryProhibited,
  },
  receiptChains: {
    confirmed: confirmedEventVerification,
    unknown: unknownEventVerification,
  },
  privacyBoundary: {
    proposalBodiesStoredInPersistenceSchema: false,
    receiptEventsUseDigestsAndStateEvidence: true,
  },
};

console.log(JSON.stringify(receipt, null, 2));
