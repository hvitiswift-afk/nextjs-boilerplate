import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";

const paths = {
  manifest: "receipts/revenue/FARDARTER-DRIVE-CROSS-LAYER-RECEIPT-IDEMPOTENCY-V6-24.json",
  schema: "schemas/revenue/fardarter-drive-cross-layer-receipt-idempotency-v6-24.schema.json",
  predecessor: "receipts/revenue/FARDARTER-DRIVE-HISTORICAL-WRITER-RETIREMENT-V6-23.json",
  publicProjection: "receipts/revenue/FARDARTER-DRIVE-PUBLIC-CONTROL-HEAD-PROJECTION-V6-22.json",
  currentHead: "receipts/revenue/FARDARTER-DRIVE-CURRENT-CONTROL-HEAD-V6-21.json",
  application: "receipts/revenue/FARDARTER-DRIVE-APPLICATION-CONTROL-PROJECTION-V6-20.json",
  production: "receipts/revenue/FARDARTER-DRIVE-PRODUCTION-RECONCILIATION-V6-12.json",
  dedicatedWorkflow: ".github/workflows/fardarter-cross-layer-receipt-idempotency-v6-24.yml",
  docs: "docs/revenue/FARDARTER-DRIVE-CROSS-LAYER-RECEIPT-IDEMPOTENCY-V6-24.md",
  package: "package.json",
  revenue: ".github/workflows/revenue-experiment.yml",
};
const duplicateManifestPath =
  "receipts/revenue/FARDARTER-DRIVE-RECEIPT-IDEMPOTENCY-V6-24.json";

const text = Object.fromEntries(
  await Promise.all(
    Object.entries(paths).map(async ([key, path]) => [key, await readFile(path, "utf8")]),
  ),
);
const parse = (key) => JSON.parse(text[key]);
const manifest = parse("manifest");
const schema = parse("schema");
const predecessor = parse("predecessor");
const publicProjection = parse("publicProjection");
const currentHead = parse("currentHead");
const application = parse("application");
const production = parse("production");
const pkg = parse("package");

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const stable = (value) =>
  Array.isArray(value)
    ? `[${value.map(stable).join(",")}]`
    : value && typeof value === "object"
      ? `{${Object.keys(value)
          .sort()
          .map((key) => `${JSON.stringify(key)}:${stable(value[key])}`)
          .join(",")}}`
      : JSON.stringify(value);
const sha256Text = (value) =>
  createHash("sha256").update(value, "utf8").digest("hex");
const noDigest = structuredClone(manifest);
delete noDigest.manifestDigest;

assert(
  manifest.controlId ===
      "FARDARTER-DRIVE-CROSS-LAYER-RECEIPT-IDEMPOTENCY-V6-24" &&
    manifest.controllerVersion === "6.24.0" &&
    manifest.controllingIssue === 232 &&
    manifest.implementationIssue === 233,
  "v6.24 identity mismatch",
);
assert(
  sha256Text(stable(noDigest)) === manifest.manifestDigest &&
    manifest.manifestDigest ===
      "56cb6b6395262f095d5888f2f45837b30fb7da5ca4f53c17c9238c9571b6d056",
  "v6.24 manifest digest mismatch",
);
assert(
  schema.type === "object" && stable(schema.const) === stable(manifest),
  "v6.24 strict schema mismatch",
);

let duplicateManifestExists = true;
try {
  await access(duplicateManifestPath);
} catch {
  duplicateManifestExists = false;
}
assert(!duplicateManifestExists, "duplicate v6.24 governance manifest remains");

assert(
  predecessor.manifestDigest ===
      manifest.predecessors.historicalWriterRetirement.digest &&
    predecessor.repository.postMergeState ===
      manifest.predecessors.historicalWriterRetirement.state &&
    publicProjection.manifestDigest ===
      manifest.predecessors.publicControlHeadProjection.digest &&
    currentHead.manifestDigest === manifest.predecessors.currentControlHead.digest &&
    application.manifestDigest ===
      manifest.predecessors.applicationControlProjection.digest &&
    production.manifestDigest === manifest.predecessors.production.digest &&
    Object.values(manifest.predecessors).every(
      (item) => item.preservedImmutable === true,
    ),
  "v6.24 predecessor linkage mismatch",
);
assert(
  manifest.repository.baseHead ===
      "f564ab950998aec1317ea095a1700d61b7409fa9" &&
    manifest.repository.targetBranch ===
      "agent/fardarter-drive-v6-24-receipt-idempotency" &&
    manifest.repository.governanceBefore ===
      "FARDARTER-DRIVE-HISTORICAL-WRITER-RETIREMENT-V6-23" &&
    manifest.repository.governanceAfter ===
      "FARDARTER-DRIVE-CROSS-LAYER-RECEIPT-IDEMPOTENCY-V6-24" &&
    manifest.repository.historyRewriteAllowed === false &&
    manifest.repository.preparedState ===
      "PREPARED_SOURCE_ONLY_PENDING_REVIEWED_MERGE" &&
    manifest.repository.postMergeState ===
      "CROSS_LAYER_RECEIPT_IDEMPOTENCY_RECONCILED",
  "v6.24 repository contract mismatch",
);

const keyContract = manifest.receiptKeyContract;
const materialFields = [
  "controlId",
  "manifestDigest",
  "reviewedHead",
  "mergeReadbackCommit",
  "destinationClass",
  "receiptPurpose",
];
assert(
  keyContract.version === "1.0.0" &&
    keyContract.algorithm === "SHA-256" &&
    keyContract.canonicalization === "JSON_SORTED_KEYS_UTF8" &&
    stable(keyContract.orderedMaterialFields) === stable(materialFields) &&
    keyContract.keyEncoding === "LOWERCASE_HEX",
  "v6.24 receipt-key contract mismatch",
);
const receiptKey = (input) =>
  sha256Text(
    stable(Object.fromEntries(materialFields.map((field) => [field, input[field]]))),
  );
for (const vector of keyContract.testVectors) {
  assert(
    receiptKey(vector.material) === vector.expectedReceiptKey,
    `v6.24 receipt-key test vector failed: ${vector.name}`,
  );
}
const volatileBase = structuredClone(keyContract.testVectors[0].material);
const volatileA = {
  ...volatileBase,
  runId: 1,
  generatedAt: "2026-01-01T00:00:00Z",
  readRevisionId: "revision-a",
  commentId: 1,
  providerGeneratedObjectId: "object-a",
};
const volatileB = {
  ...volatileBase,
  runId: 999,
  generatedAt: "2099-01-01T00:00:00Z",
  readRevisionId: "revision-b",
  commentId: 999,
  providerGeneratedObjectId: "object-b",
};
assert(
  receiptKey(volatileA) === receiptKey(volatileB),
  "volatile provider metadata changed the material receipt key",
);
for (const excluded of [
  "runId",
  "timestamp",
  "generatedAt",
  "readRevisionId",
  "commentId",
  "providerGeneratedObjectId",
  "providerCursor",
  "workflowRunId",
  "artifactId",
]) {
  assert(
    keyContract.excludedFromMaterialFingerprint.includes(excluded),
    `missing volatile exclusion: ${excluded}`,
  );
}

const protocol = manifest.doubleReadProtocol;
assert(
  protocol.steps.join(",") ===
      [
        "SEARCH_EXACT_CONTROL_MARKER_AND_EVIDENCE_TUPLE",
        "FRESH_PROVIDER_READ",
        "REPEAT_EXACT_CONTROL_MARKER_AND_EVIDENCE_TUPLE_SEARCH",
        "VERIFY_PROVIDER_STATE_TOKEN_OR_REVISION_IS_FRESH",
        "WRITE_ONCE_ONLY_IF_BOTH_SEARCHES_EQUAL_ZERO",
        "FRESH_POST_WRITE_PROVIDER_READ",
        "COUNT_EXACT_MARKER_AND_EVIDENCE_TUPLE",
        "COMPLETE_IF_ONE_OR_QUARANTINE_IF_MORE_THAN_ONE",
      ].join(",") &&
    protocol.firstSearchRequired === true &&
    protocol.freshReadBetweenSearchesRequired === true &&
    protocol.secondSearchRequired === true &&
    protocol.zeroCountRequiredForWrite === true &&
    protocol.revisionConflictAction === "RESTART_FROM_FIRST_SEARCH" &&
    protocol.staleWriteDirectRetryAllowed === false &&
    protocol.postWriteReadbackRequired === true &&
    protocol.postWriteExactCountRequired === true &&
    protocol.writeAttemptsPerFreshProtocolMaximum === 1,
  "v6.24 double-read protocol mismatch",
);

const github = manifest.destinationControls.githubPublicIssue;
assert(
  github.destinationClass === "GITHUB_PUBLIC_ISSUE" &&
    github.searchTargets.includes("EXACT_CONTROL_MARKER") &&
    github.searchTargets.includes("EXACT_RECEIPT_KEY_MARKER") &&
    github.searchTargets.includes("EXACT_EVIDENCE_TUPLE") &&
    github.freshReadSurface === "COMPLETE_ISSUE_COMMENT_TIMELINE" &&
    github.ephemeralConcurrencyEvidenceIncludedInReceiptKey === false &&
    github.existingAnyExactMarkerOrTupleAction === "SUPPRESS_WRITE" &&
    github.crossedMessageDetectedAction === "RESTART_FROM_FIRST_SEARCH" &&
    github.duplicateCountGreaterThanOneAction ===
      "PRESERVE_HISTORY_STOP_WRITES_AND_QUARANTINE" &&
    github.maximumCorrectionRecordsPerDestinationAndReceiptKey === 1 &&
    github.deleteOrRewriteHistoricalCommentsAllowed === false,
  "v6.24 GitHub destination control mismatch",
);
const drive = manifest.destinationControls.privateDriveRegister;
assert(
  drive.destinationClass === "PRIVATE_DRIVE_REGISTER" &&
    drive.searchTargets.includes("EXACT_RECEIPT_HEADING") &&
    drive.searchTargets.includes("EXACT_EVIDENCE_TUPLE") &&
    drive.searchTargets.includes("EXACT_RECEIPT_KEY") &&
    drive.freshReadSurface === "FULL_NATIVE_DOCUMENT_WITH_REVISION_ID" &&
    drive.requiredWriteControl === "REQUIRED_REVISION_ID" &&
    drive.existingAnyExactMarkerOrTupleAction === "SUPPRESS_WRITE" &&
    drive.revisionConflictAction === "RESTART_FROM_FIRST_SEARCH" &&
    drive.staleRevisionRetryAllowed === false &&
    drive.duplicateCountGreaterThanOneAction ===
      "PRESERVE_HISTORY_STOP_WRITES_AND_QUARANTINE" &&
    drive.maximumCorrectionRecordsPerDestinationAndReceiptKey === 1 &&
    drive.deleteOrRewriteHistoricalDocumentContentAllowed === false,
  "v6.24 private-register destination control mismatch",
);

assert(
  manifest.authoritativeReceiptRule.selection ===
      "FIRST_PROVIDER_VISIBLE_COMPLETE_EXACT_EVIDENCE_TUPLE_IN_PROVIDER_ORDER" &&
    manifest.authoritativeReceiptRule.laterExactDuplicatesRemainHistorical === true &&
    manifest.authoritativeReceiptRule.deleteDuplicateAllowed === false &&
    manifest.authoritativeReceiptRule.rewriteDuplicateAllowed === false &&
    manifest.authoritativeReceiptRule.ambiguousProviderOrderAction ===
      "QUARANTINE_FOR_JP_REVIEW" &&
    manifest.authoritativeReceiptRule
      .authoritativeDesignationCreatesSecondControlTransition === false,
  "v6.24 authoritative receipt rule mismatch",
);
assert(
  manifest.duplicateAndNotification.duplicateClassification ===
      "CROSSED_MESSAGE_DUPLICATE_RECEIPT" &&
    manifest.duplicateAndNotification.sameReceiptKeyAction ===
      "SUPPRESS_NOTIFICATION_AND_WRITE" &&
    manifest.duplicateAndNotification.maximumMaterialNotificationsPerReceiptKey ===
      1 &&
    manifest.duplicateAndNotification
      .maximumCorrectionRecordsPerDestinationAndReceiptKey === 1 &&
    manifest.duplicateAndNotification.publicFingerprintExposureAllowed === false &&
    manifest.duplicateAndNotification.providerGeneratedMetadataExcluded === true,
  "v6.24 duplicate and notification policy mismatch",
);

assert(
  manifest.observedRaces.githubIssue160.issueNumber === 160 &&
    manifest.observedRaces.githubIssue160.authoritativeRepairMarkerCount === 1 &&
    manifest.observedRaces.githubIssue160.crossedMessageCorrectionMarkerCount === 1 &&
    manifest.observedRaces.githubIssue160.historicalCommentsPreserved === true &&
    manifest.observedRaces.githubIssue160.secondControlTransitionCreated === false &&
    manifest.observedRaces.privateRegister.transientExactTupleCountObserved === 2 &&
    manifest.observedRaces.privateRegister.finalAuthoritativeTupleCount === 1 &&
    manifest.observedRaces.privateRegister.ownerOnly === true &&
    manifest.observedRaces.privateRegister.shared === false &&
    manifest.observedRaces.privateRegister.publicReferenceExposed === false,
  "v6.24 observed race projection mismatch",
);

assert(
  manifest.currentTruth.issue133.integrityState ===
      "EXACT_CURRENT_OFFER_INTACT" &&
    manifest.currentTruth.issue141.role ===
      "HISTORICAL_STRATEGY_AND_STAGE_GOVERNANCE_RAIL" &&
    manifest.currentTruth.issue160.classification ===
      "HISTORICAL_WORKFLOW_STALE_FALSE_CONFLICT" &&
    manifest.currentTruth.canonical.eventHeadSequence === 1 &&
    manifest.currentTruth.canonical.eventCount === 2 &&
    manifest.currentTruth.canonical.canonicalBusinessEventCount === 1 &&
    manifest.currentTruth.canonical.reconciliationSequence === 1 &&
    manifest.currentTruth.canonical.scopeDrafted === 1 &&
    manifest.currentTruth.canonical.humanAccepted === 0 &&
    manifest.currentTruth.canonical.active === 0 &&
    manifest.currentTruth.canonical.event2Present === false &&
    manifest.currentTruth.consent.packageState === "NO_PACKAGE" &&
    manifest.currentTruth.capacity.totalPlanningSlots === 1000 &&
    manifest.currentTruth.capacity.effectiveActiveCeiling === 100 &&
    manifest.currentTruth.capacity.activeDeliveries === 0 &&
    manifest.currentTruth.capacity.activeHeadroom === 100 &&
    manifest.currentTruth.money.orders === 0 &&
    manifest.currentTruth.money.verifiedGrossRevenueUsd === 0 &&
    manifest.currentTruth.money.verifiedSettledCashUsd === 0 &&
    manifest.currentTruth.privateContinuity.knownDocumentCount === 17 &&
    manifest.currentTruth.privateContinuity.ownerOnly === true &&
    manifest.currentTruth.privateContinuity.shared === false,
  "v6.24 current truth mismatch",
);
assert(
  Object.values(manifest.actualEffects).every((value) => value === 0) &&
    Object.values(manifest.projectedEffects).every((value) => value === 0) &&
    Object.values(manifest.consequentialEffects).every((value) => value === false),
  "v6.24 consequential effects mismatch",
);
assert(
  manifest.decision.replacesCurrentControlHead === false &&
    manifest.decision.automaticDeploymentAllowed === false &&
    manifest.decision.automaticCanonicalAdvanceAllowed === false &&
    manifest.decision.automaticHistoricalRewriteAllowed === false,
  "v6.24 authority boundary mismatch",
);

assert(
  pkg.scripts["fardarter:receipt-idempotency:check"] ===
      "node scripts/check-fardarter-cross-layer-receipt-idempotency-v6-24.mjs" &&
    pkg.scripts["revenue:verify"].includes(
      "npm run fardarter:receipt-idempotency:check",
    ) &&
    pkg.scripts["revenue:verify"].includes(
      "npm run fardarter:application-control-projection:check && npm run fardarter:public-control-head-projection:check && npm run fardarter:current-control-head:check",
    ) &&
    pkg.scripts["revenue:verify"].includes(
      "npm run fardarter:public-control-head-projection:check && npm run fardarter:current-control-head:check && npm run fardarter:historical-writer-retirement:check && npm run fardarter:strategy-rail:check",
    ) &&
    pkg.scripts["revenue:verify"].endsWith(
      "npm run fardarter:strategy-rail:check",
    ),
  "v6.24 package integration mismatch",
);
const nonCommentRevenue = text.revenue
  .split("\n")
  .filter((line) => !line.trimStart().startsWith("#"));
assert(
  nonCommentRevenue.some(
    (line) =>
      line.trim() === "name: Verify Fardarter Drive v6.21 current control head",
  ),
  "v6.21 must remain the active top-level control head",
);

for (const required of [
  "name: Fardarter Cross-Layer Receipt Idempotency v6.24",
  "permissions:\n  contents: read",
  "npm run fardarter:receipt-idempotency:check",
  "FARDARTER-DRIVE-CROSS-LAYER-RECEIPT-IDEMPOTENCY-V6-24.json",
  "fardarter-drive-cross-layer-receipt-idempotency-v6-24.schema.json",
]) {
  assert(
    text.dedicatedWorkflow.includes(required),
    `v6.24 dedicated workflow missing ${required}`,
  );
}
for (const prohibited of [
  "issues: write",
  "netlify deploy",
  "deploy --",
  "send_email",
  "gmail",
  "curl ",
  "wget ",
]) {
  assert(
    !text.dedicatedWorkflow.toLowerCase().includes(prohibited),
    `v6.24 dedicated workflow is not read-only: ${prohibited}`,
  );
}
for (const required of [
  "Fardarter Drive™ v6.24",
  "CROSS_LAYER_RECEIPT_IDEMPOTENCY_RECONCILED",
  "CROSSED_MESSAGE_DUPLICATE_RECEIPT",
  "RESTART_FROM_FIRST_SEARCH",
  "56cb6b6395262f095d5888f2f45837b30fb7da5ca4f53c17c9238c9571b6d056",
  "No private Google Drive URL or file ID",
]) {
  assert(
    text.docs.includes(required),
    `v6.24 documentation missing ${required}`,
  );
}

const publicSource = [
  text.manifest,
  text.schema,
  text.dedicatedWorkflow,
  text.docs,
].join("\n");
assert(
  !/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(publicSource),
  "v6.24 public email exposure",
);
for (const token of [
  "docs.google.com",
  "drive.google.com",
  '"fileId"',
  '"folderId"',
  '"documentId"',
]) {
  assert(
    !publicSource.includes(token),
    `v6.24 private reference exposure: ${token}`,
  );
}

console.log(
  JSON.stringify(
    {
      status: "PASS",
      control: manifest.controlId,
      manifestDigest: manifest.manifestDigest,
      currentHead: `${manifest.predecessors.currentControlHead.version}/${manifest.predecessors.currentControlHead.state}`,
      governancePredecessor: `${manifest.predecessors.historicalWriterRetirement.version}/${manifest.predecessors.historicalWriterRetirement.state}`,
      receiptKeyVectors: keyContract.testVectors.map(
        (vector) => vector.expectedReceiptKey,
      ),
      revisionConflict: protocol.revisionConflictAction,
      duplicateClassification:
        manifest.duplicateAndNotification.duplicateClassification,
      canonical: `${manifest.currentTruth.canonical.eventHeadSequence}/${manifest.currentTruth.canonical.reconciliationSequence}`,
      consequentialEffects: "ZERO",
      next: manifest.decision.nextControlledAction,
    },
    null,
    2,
  ),
);
