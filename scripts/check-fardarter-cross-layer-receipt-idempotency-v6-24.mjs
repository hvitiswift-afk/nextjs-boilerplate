import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const paths = {
  manifest: "receipts/revenue/FARDARTER-DRIVE-CROSS-LAYER-RECEIPT-IDEMPOTENCY-V6-24.json",
  schema: "schemas/revenue/fardarter-drive-cross-layer-receipt-idempotency-v6-24.schema.json",
  predecessor: "receipts/revenue/FARDARTER-DRIVE-HISTORICAL-WRITER-RETIREMENT-V6-23.json",
  publicProjection: "receipts/revenue/FARDARTER-DRIVE-PUBLIC-CONTROL-HEAD-PROJECTION-V6-22.json",
  currentHead: "receipts/revenue/FARDARTER-DRIVE-CURRENT-CONTROL-HEAD-V6-21.json",
  docs: "docs/revenue/FARDARTER-DRIVE-CROSS-LAYER-RECEIPT-IDEMPOTENCY-V6-24.md",
  workflow: ".github/workflows/fardarter-cross-layer-receipt-idempotency-v6-24.yml",
  package: "package.json",
  revenue: ".github/workflows/revenue-experiment.yml",
  predecessorVerifier: "scripts/check-fardarter-historical-writer-retirement-v6-23.mjs",
};

const text = Object.fromEntries(
  await Promise.all(Object.entries(paths).map(async ([key, path]) => [key, await readFile(path, "utf8")])),
);
const parse = (key) => JSON.parse(text[key]);
const manifest = parse("manifest");
const schema = parse("schema");
const predecessor = parse("predecessor");
const publicProjection = parse("publicProjection");
const currentHead = parse("currentHead");
const pkg = parse("package");

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const stable = (value) =>
  Array.isArray(value)
    ? `[${value.map(stable).join(",")}]`
    : value && typeof value === "object"
      ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`
      : JSON.stringify(value);
const sha256 = (value) => createHash("sha256").update(value, "utf8").digest("hex");
const withoutDigest = structuredClone(manifest);
delete withoutDigest.manifestDigest;

assert(
  manifest.controlId === "FARDARTER-DRIVE-CROSS-LAYER-RECEIPT-IDEMPOTENCY-V6-24" &&
    manifest.controllerVersion === "6.24.0" &&
    manifest.controllingIssue === 232 &&
    manifest.implementationIssue === 233,
  "v6.24 identity mismatch",
);
assert(
  sha256(stable(withoutDigest)) === manifest.manifestDigest &&
    manifest.manifestDigest === "56cb6b6395262f095d5888f2f45837b30fb7da5ca4f53c17c9238c9571b6d056",
  "v6.24 manifest digest mismatch",
);
assert(schema.type === "object" && stable(schema.const) === stable(manifest), "v6.24 strict schema mismatch");

assert(
  predecessor.controlId === manifest.predecessors.historicalWriterRetirement.controlId &&
    predecessor.manifestDigest === manifest.predecessors.historicalWriterRetirement.digest &&
    predecessor.manifestDigest === "c4be1a809473b0eeaf31a98ff0777f0bab82b46ee4985c528d55da495f89dc76" &&
    predecessor.repository.postMergeState === "HISTORICAL_PUBLIC_WRITER_RETIRED" &&
    publicProjection.manifestDigest === manifest.predecessors.publicControlHeadProjection.digest &&
    currentHead.manifestDigest === manifest.predecessors.currentControlHead.digest &&
    currentHead.repository.postMergeState === "CURRENT_CONTROL_HEAD_RECONCILED" &&
    manifest.predecessors.currentControlHead.remainsActiveTopLevelHead === true &&
    Object.values(manifest.predecessors).every((item) => item.preservedImmutable === true),
  "v6.24 predecessor linkage mismatch",
);

const keyContract = manifest.receiptKeyContract;
assert(
  keyContract.algorithm === "SHA-256" &&
    keyContract.canonicalization === "JSON_SORTED_KEYS_UTF8" &&
    keyContract.orderedMaterialFields.join(",") ===
      "controlId,manifestDigest,reviewedHead,mergeReadbackCommit,destinationClass,receiptPurpose" &&
    keyContract.keyEncoding === "LOWERCASE_HEX",
  "v6.24 receipt key contract mismatch",
);
for (const vector of keyContract.testVectors) {
  assert(sha256(stable(vector.material)) === vector.expectedReceiptKey, `test vector mismatch: ${vector.name}`);
  assert(Object.keys(vector.material).sort().join(",") === [...keyContract.orderedMaterialFields].sort().join(","), `test vector fields mismatch: ${vector.name}`);
}
const baseMaterial = structuredClone(keyContract.testVectors[0].material);
const baseKey = sha256(stable(baseMaterial));
for (const [index, excluded] of keyContract.excludedFromMaterialFingerprint.entries()) {
  const envelopeA = { material: baseMaterial, [excluded]: `A-${index}` };
  const envelopeB = { material: baseMaterial, [excluded]: `B-${index}` };
  assert(
    sha256(stable(envelopeA.material)) === baseKey && sha256(stable(envelopeB.material)) === baseKey,
    `excluded metadata changed material key: ${excluded}`,
  );
}

assert(
  manifest.doubleReadProtocol.steps.join(",") ===
    "SEARCH_EXACT_CONTROL_MARKER_AND_EVIDENCE_TUPLE,FRESH_PROVIDER_READ,REPEAT_EXACT_CONTROL_MARKER_AND_EVIDENCE_TUPLE_SEARCH,VERIFY_PROVIDER_STATE_TOKEN_OR_REVISION_IS_FRESH,WRITE_ONCE_ONLY_IF_BOTH_SEARCHES_EQUAL_ZERO,FRESH_POST_WRITE_PROVIDER_READ,COUNT_EXACT_MARKER_AND_EVIDENCE_TUPLE,COMPLETE_IF_ONE_OR_QUARANTINE_IF_MORE_THAN_ONE" &&
    manifest.doubleReadProtocol.revisionConflictAction === "RESTART_FROM_FIRST_SEARCH" &&
    manifest.doubleReadProtocol.staleWriteDirectRetryAllowed === false &&
    manifest.doubleReadProtocol.writeAttemptsPerFreshProtocolMaximum === 1,
  "v6.24 double-read protocol mismatch",
);
assert(
  manifest.destinationControls.githubPublicIssue.existingAnyExactMarkerOrTupleAction === "SUPPRESS_WRITE" &&
    manifest.destinationControls.githubPublicIssue.maximumCorrectionRecordsPerDestinationAndReceiptKey === 1 &&
    manifest.destinationControls.githubPublicIssue.deleteOrRewriteHistoricalCommentsAllowed === false &&
    manifest.destinationControls.privateDriveRegister.requiredWriteControl === "REQUIRED_REVISION_ID" &&
    manifest.destinationControls.privateDriveRegister.revisionConflictAction === "RESTART_FROM_FIRST_SEARCH" &&
    manifest.destinationControls.privateDriveRegister.staleRevisionRetryAllowed === false &&
    manifest.destinationControls.privateDriveRegister.deleteOrRewriteHistoricalDocumentContentAllowed === false,
  "v6.24 destination controls mismatch",
);
assert(
  manifest.authoritativeReceiptRule.selection === "FIRST_PROVIDER_VISIBLE_COMPLETE_EXACT_EVIDENCE_TUPLE_IN_PROVIDER_ORDER" &&
    manifest.authoritativeReceiptRule.laterExactDuplicatesRemainHistorical === true &&
    manifest.authoritativeReceiptRule.deleteDuplicateAllowed === false &&
    manifest.authoritativeReceiptRule.rewriteDuplicateAllowed === false &&
    manifest.duplicateAndNotification.duplicateClassification === "CROSSED_MESSAGE_DUPLICATE_RECEIPT" &&
    manifest.duplicateAndNotification.maximumMaterialNotificationsPerReceiptKey === 1,
  "v6.24 authoritative/duplicate contract mismatch",
);

assert(
  manifest.observedRaces.githubIssue160.authoritativeRepairMarkerCount === 1 &&
    manifest.observedRaces.githubIssue160.crossedMessageCorrectionMarkerCount === 1 &&
    manifest.observedRaces.githubIssue160.secondControlTransitionCreated === false &&
    manifest.observedRaces.privateRegister.transientExactTupleCountObserved === 2 &&
    manifest.observedRaces.privateRegister.finalAuthoritativeTupleCount === 1 &&
    manifest.observedRaces.privateRegister.ownerOnly === true &&
    manifest.observedRaces.privateRegister.shared === false,
  "v6.24 observed race evidence mismatch",
);
assert(
  manifest.currentTruth.issue133.integrityState === "EXACT_CURRENT_OFFER_INTACT" &&
    manifest.currentTruth.issue141.role === "HISTORICAL_STRATEGY_AND_STAGE_GOVERNANCE_RAIL" &&
    manifest.currentTruth.issue160.authoritativeRepairMarkerCount === 1 &&
    manifest.currentTruth.canonical.eventHeadSequence === 1 &&
    manifest.currentTruth.canonical.eventCount === 2 &&
    manifest.currentTruth.canonical.canonicalBusinessEventCount === 1 &&
    manifest.currentTruth.canonical.reconciliationSequence === 1 &&
    manifest.currentTruth.canonical.scopeDrafted === 1 &&
    manifest.currentTruth.canonical.humanAccepted === 0 &&
    manifest.currentTruth.canonical.active === 0 &&
    manifest.currentTruth.consent.packageState === "NO_PACKAGE" &&
    manifest.currentTruth.capacity.totalPlanningSlots === 1000 &&
    manifest.currentTruth.capacity.effectiveActiveCeiling === 100 &&
    manifest.currentTruth.capacity.activeDeliveries === 0 &&
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
    manifest.decision.postMergeState === "CROSS_LAYER_RECEIPT_IDEMPOTENCY_RECONCILED" &&
    manifest.decision.automaticDeploymentAllowed === false &&
    manifest.decision.automaticCanonicalAdvanceAllowed === false &&
    manifest.decision.automaticHistoricalRewriteAllowed === false,
  "v6.24 decision mismatch",
);

assert(
  pkg.scripts["fardarter:receipt-idempotency:check"] ===
      "node scripts/check-fardarter-cross-layer-receipt-idempotency-v6-24.mjs" &&
    pkg.scripts["revenue:verify"].includes(
      "npm run fardarter:application-control-projection:check && npm run fardarter:receipt-idempotency:check && npm run fardarter:public-control-head-projection:check",
    ) &&
    pkg.scripts["revenue:verify"].includes(
      "npm run fardarter:public-control-head-projection:check && npm run fardarter:current-control-head:check && npm run fardarter:historical-writer-retirement:check && npm run fardarter:strategy-rail:check",
    ) &&
    pkg.scripts["revenue:verify"].endsWith("npm run fardarter:strategy-rail:check"),
  "v6.24 package integration mismatch",
);
assert(
  text.predecessorVerifier.includes("FARDARTER-DRIVE-HISTORICAL-WRITER-RETIREMENT-V6-23") &&
    text.predecessorVerifier.includes("fardarter:historical-writer-retirement:check"),
  "v6.23 verifier was not preserved",
);
const nonCommentRevenue = text.revenue.split("\n").filter((line) => !line.trimStart().startsWith("#"));
assert(
  nonCommentRevenue.some((line) => line.trim() === "name: Verify Fardarter Drive v6.21 current control head"),
  "v6.21 is no longer active top-level head",
);

for (const required of [
  "name: Fardarter Cross-Layer Receipt Idempotency v6.24",
  "permissions:\n  contents: read",
  "npm run fardarter:receipt-idempotency:check",
  "FARDARTER-DRIVE-CROSS-LAYER-RECEIPT-IDEMPOTENCY-V6-24.json",
  "fardarter-drive-cross-layer-receipt-idempotency-v6-24.schema.json",
]) {
  assert(text.workflow.includes(required), `v6.24 workflow missing ${required}`);
}
for (const prohibited of ["issues: write", "netlify deploy", "deploy --", "send_email", "gmail", "curl ", "wget "]) {
  assert(!text.workflow.toLowerCase().includes(prohibited), `v6.24 workflow is not read-only: ${prohibited}`);
}
for (const required of [
  "Fardarter Drive™ v6.24",
  "CROSS_LAYER_RECEIPT_IDEMPOTENCY_RECONCILED",
  "CROSSED_MESSAGE_DUPLICATE_RECEIPT",
  "56cb6b6395262f095d5888f2f45837b30fb7da5ca4f53c17c9238c9571b6d056",
  "RESTART_FROM_FIRST_SEARCH",
  "No private Google Drive URL or file ID",
]) {
  assert(text.docs.includes(required), `v6.24 documentation missing ${required}`);
}

const publicSource = [text.manifest, text.schema, text.docs, text.workflow].join("\n");
assert(!/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(publicSource), "v6.24 public email exposure");
for (const token of ["docs.google.com", "drive.google.com", '"fileId"', '"folderId"', '"documentId"']) {
  assert(!publicSource.includes(token), `v6.24 private reference exposure: ${token}`);
}

console.log(JSON.stringify({
  status: "PASS",
  control: manifest.controlId,
  manifestDigest: manifest.manifestDigest,
  postMergeState: manifest.repository.postMergeState,
  receiptKeyVersion: manifest.receiptKeyContract.version,
  testVectors: manifest.receiptKeyContract.testVectors.length,
  revisionConflictAction: manifest.doubleReadProtocol.revisionConflictAction,
  duplicateClassification: manifest.duplicateAndNotification.duplicateClassification,
  activeTopLevelHead: manifest.predecessors.currentControlHead.controlId,
  consequentialEffects: "ZERO",
  next: manifest.decision.nextControlledAction,
}, null, 2));
