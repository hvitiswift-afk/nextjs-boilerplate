import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const paths = {
  manifest: "receipts/revenue/FARDARTER-DRIVE-RECEIPT-IDEMPOTENCY-V6-24.json",
  schema: "schemas/revenue/fardarter-drive-receipt-idempotency-v6-24.schema.json",
  predecessor: "receipts/revenue/FARDARTER-DRIVE-HISTORICAL-WRITER-RETIREMENT-V6-23.json",
  currentHead: "receipts/revenue/FARDARTER-DRIVE-CURRENT-CONTROL-HEAD-V6-21.json",
  publicProjection: "receipts/revenue/FARDARTER-DRIVE-PUBLIC-CONTROL-HEAD-PROJECTION-V6-22.json",
  application: "receipts/revenue/FARDARTER-DRIVE-APPLICATION-CONTROL-PROJECTION-V6-20.json",
  production: "receipts/revenue/FARDARTER-DRIVE-PRODUCTION-RECONCILIATION-V6-12.json",
  predecessorVerifier: "scripts/check-fardarter-historical-writer-retirement-v6-23.mjs",
  docs: "docs/revenue/FARDARTER-DRIVE-RECEIPT-IDEMPOTENCY-V6-24.md",
  workflow: ".github/workflows/fardarter-receipt-idempotency-v6-24.yml",
  package: "package.json",
  revenue: ".github/workflows/revenue-experiment.yml",
};

const text = Object.fromEntries(
  await Promise.all(Object.entries(paths).map(async ([key, path]) => [key, await readFile(path, "utf8")])),
);
const parse = (key) => JSON.parse(text[key]);
const manifest = parse("manifest");
const schema = parse("schema");
const predecessor = parse("predecessor");
const currentHead = parse("currentHead");
const publicProjection = parse("publicProjection");
const application = parse("application");
const production = parse("production");
const pkg = parse("package");

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const stable = (value) =>
  Array.isArray(value)
    ? `[${value.map(stable).join(",")}]`
    : value && typeof value === "object"
      ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`
      : JSON.stringify(value);
const sha256 = (value) => createHash("sha256").update(value, "utf8").digest("hex");
const noDigest = structuredClone(manifest);
delete noDigest.manifestDigest;

assert(
  manifest.controlId === "FARDARTER-DRIVE-RECEIPT-IDEMPOTENCY-V6-24" &&
    manifest.controllerVersion === "6.24.0" &&
    manifest.controllingIssue === 232 &&
    manifest.implementationIssue === 233,
  "v6.24 identity mismatch",
);
assert(
  sha256(stable(noDigest)) === manifest.manifestDigest &&
    manifest.manifestDigest === "bc40c24523b4a2b8bffcc5403b7b6ed18be8251b5653abecaaaf266c74e8e69b",
  "v6.24 digest mismatch",
);
assert(schema.type === "object" && stable(schema.const) === stable(manifest), "v6.24 strict schema mismatch");

assert(
  predecessor.controlId === manifest.predecessors.historicalWriterRetirement.controlId &&
    predecessor.manifestDigest === manifest.predecessors.historicalWriterRetirement.digest &&
    predecessor.manifestDigest === "c4be1a809473b0eeaf31a98ff0777f0bab82b46ee4985c528d55da495f89dc76" &&
    predecessor.decision.postMergeState === "HISTORICAL_PUBLIC_WRITER_RETIRED" &&
    currentHead.manifestDigest === manifest.predecessors.currentControlHead.digest &&
    currentHead.repository.postMergeState === "CURRENT_CONTROL_HEAD_RECONCILED" &&
    publicProjection.manifestDigest === manifest.predecessors.publicControlHeadProjection.digest &&
    application.manifestDigest === manifest.predecessors.applicationControlProjection.digest &&
    production.manifestDigest === manifest.predecessors.production.digest &&
    Object.values(manifest.predecessors).every((item) => item.preservedImmutable === true),
  "v6.24 predecessor linkage mismatch",
);
assert(
  text.predecessorVerifier.includes("FARDARTER-DRIVE-HISTORICAL-WRITER-RETIREMENT-V6-23") &&
    text.predecessorVerifier.includes("c4be1a809473b0eeaf31a98ff0777f0bab82b46ee4985c528d55da495f89dc76"),
  "v6.23 verifier was repointed or weakened",
);

assert(
  manifest.observedRaceEvidence.githubIssue160.issueNumber === 160 &&
    manifest.observedRaceEvidence.githubIssue160.authoritativeRepairMarkerCount === 1 &&
    manifest.observedRaceEvidence.githubIssue160.crossedMessageCorrectionMarkerCount === 1 &&
    manifest.observedRaceEvidence.githubIssue160.classification ===
      "ONE_AUTHORITATIVE_RECEIPT_PLUS_CROSSED_MESSAGE_CORRECTION" &&
    manifest.observedRaceEvidence.githubIssue160.correctionCreatesSecondControlTransition === false &&
    manifest.observedRaceEvidence.githubIssue160.commentsPreserved === true &&
    manifest.observedRaceEvidence.privateRegister.v623ManifestDigestOccurrenceCount === 1 &&
    manifest.observedRaceEvidence.privateRegister.transientDuplicateObserved === true &&
    manifest.observedRaceEvidence.privateRegister.latestRevisionReconciled === true &&
    manifest.observedRaceEvidence.privateRegister.ownerOnly === true &&
    manifest.observedRaceEvidence.privateRegister.shared === false,
  "v6.24 observed race evidence mismatch",
);

const contract = manifest.receiptKeyContract;
assert(
  contract.contractVersion === "fd.receipt-key.v1" &&
    contract.algorithm === "SHA-256" &&
    contract.canonicalization === "JSON_SORTED_KEYS_UTF8" &&
    contract.fields.join(",") ===
      "controlId,manifestDigest,reviewedHead,mergeReadbackCommit,destinationClass,receiptPurpose" &&
    contract.exactTupleRequired === true &&
    contract.publicFingerprintExposureAllowed === false,
  "v6.24 receipt-key contract mismatch",
);
assert(
  contract.excludes.join(",") ===
    "RUN_ID,TIMESTAMP,GENERATED_AT,READ_REVISION_ID,COMMENT_ID,PROVIDER_OBJECT_ID,PROVIDER_GENERATED_ID,ARTIFACT_DIGEST,ARTIFACT_ONLY_METADATA",
  "v6.24 receipt-key volatility exclusions mismatch",
);

const receiptKey = (value) => {
  const exact = Object.fromEntries(contract.fields.map((field) => [field, value[field]]));
  for (const field of contract.fields) assert(typeof exact[field] === "string" && exact[field].length > 0, `missing receipt-key field ${field}`);
  return sha256(stable(exact));
};
for (const vector of manifest.testVectors) {
  const key = receiptKey(vector.tuple);
  assert(key === vector.expectedReceiptKey, `receipt-key vector mismatch: ${vector.name}`);
  assert(vector.expectedMarker === `<!-- jp-fardarter-receipt-${key} -->`, `receipt marker mismatch: ${vector.name}`);
}
const volatileBase = manifest.testVectors.find((item) => item.name === manifest.volatilityTest.baseVectorName);
assert(volatileBase, "volatility base vector missing");
assert(
  receiptKey({ ...volatileBase.tuple, ...manifest.volatilityTest.ignoredMetadata }) === volatileBase.expectedReceiptKey &&
    manifest.volatilityTest.expectedReceiptKeyUnchanged === true,
  "volatile provider metadata changed the material receipt key",
);
assert(
  receiptKey({ ...volatileBase.tuple, receiptPurpose: "HISTORICAL_REPAIR_RECEIPT" }) !== volatileBase.expectedReceiptKey,
  "material receipt-purpose change did not change the receipt key",
);

const protocol = manifest.writeProtocol;
assert(
  protocol.phases.join(",") ===
    "SEARCH_EXACT_MARKER_OR_TUPLE,FRESH_PROVIDER_READ,REPEAT_EXACT_MARKER_OR_TUPLE_SEARCH,WRITE_WITH_DESTINATION_LOCK,POST_WRITE_READBACK_AND_EXACT_COUNT" &&
    protocol.exactTupleSearchImmediatelyBeforeAppend === true &&
    protocol.freshProviderReadAfterInitialSearch === true &&
    protocol.repeatSearchBeforeWrite === true &&
    protocol.revisionConflictAction === "RESTART_FROM_FIRST_SEARCH" &&
    protocol.staleWriteDirectRetryAllowed === false &&
    protocol.suppressWhenExactMarkerExists === true &&
    protocol.suppressWhenExactTupleExists === true &&
    protocol.postWriteSuccessCount === 1 &&
    protocol.countGreaterThanOneClassification === "CROSSED_MESSAGE_DUPLICATE_RECEIPT" &&
    protocol.authoritativeReceiptSelection === "EARLIEST_VALID_EXACT_TUPLE" &&
    protocol.maximumCorrectionRecordsPerDestinationPerReceiptKey === 1 &&
    protocol.automaticDeletionAllowed === false &&
    protocol.automaticHistoryRewriteAllowed === false,
  "v6.24 write protocol mismatch",
);
for (const action of [
  "PRESERVE_ALL_HISTORY",
  "STOP_FURTHER_WRITES",
  "DESIGNATE_ONE_AUTHORITATIVE_RECEIPT",
  "ADD_AT_MOST_ONE_STABLE_CORRECTION_OR_QUARANTINE_RECORD_PER_DESTINATION",
  "SUPPRESS_DUPLICATE_MATERIAL_NOTIFICATION",
]) {
  assert(protocol.countGreaterThanOneActions.includes(action), `v6.24 duplicate action missing ${action}`);
}

assert(
  manifest.duplicateFingerprintContract.sameMaterialFingerprintAction ===
      "SUPPRESS_DUPLICATE_CORRECTION_AND_NOTIFICATION" &&
    manifest.duplicateFingerprintContract.changedMaterialFingerprintAction ===
      "REEVALUATE_FOR_ONE_CORRECTION_OR_QUARANTINE_RECORD" &&
    manifest.duplicateFingerprintContract.excludes.includes("RUN_ID") &&
    manifest.duplicateFingerprintContract.excludes.includes("READ_REVISION_ID") &&
    manifest.duplicateFingerprintContract.excludes.includes("COMMENT_ID"),
  "v6.24 duplicate-fingerprint contract mismatch",
);

assert(
  manifest.currentTruth.issue160.authoritativeV623RepairReceiptCount === 1 &&
    manifest.currentTruth.issue160.crossedMessageCorrectionCount === 1 &&
    manifest.currentTruth.canonical.eventHeadSequence === 1 &&
    manifest.currentTruth.canonical.eventCount === 2 &&
    manifest.currentTruth.canonical.canonicalBusinessEventCount === 1 &&
    manifest.currentTruth.canonical.scopeDrafted === 1 &&
    manifest.currentTruth.canonical.humanAccepted === 0 &&
    manifest.currentTruth.canonical.active === 0 &&
    manifest.currentTruth.canonical.event2Present === false &&
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
  pkg.scripts["fardarter:receipt-idempotency:check"] ===
      "node scripts/check-fardarter-receipt-idempotency-v6-24.mjs" &&
    pkg.scripts["revenue:verify"].startsWith(
      "npm run fardarter:receipt-idempotency:check && npm run revenue:experiment:check",
    ) &&
    pkg.scripts["revenue:verify"].includes("npm run fardarter:historical-writer-retirement:check") &&
    pkg.scripts["revenue:verify"].endsWith("npm run fardarter:strategy-rail:check"),
  "v6.24 package integration mismatch",
);
const nonCommentRevenue = text.revenue.split("\n").filter((line) => !line.trimStart().startsWith("#"));
assert(
  nonCommentRevenue.some((line) => line.trim() === "name: Verify Fardarter Drive v6.21 current control head"),
  "v6.21 must remain the active top-level control head",
);
assert(
  !nonCommentRevenue.some((line) => line.includes("v6.24")),
  "v6.24 governance layer must not replace the active Revenue Experiment head",
);

for (const required of [
  "name: Fardarter Receipt Idempotency v6.24",
  "permissions:\n  contents: read",
  "npm run fardarter:receipt-idempotency:check",
  "FARDARTER-DRIVE-RECEIPT-IDEMPOTENCY-V6-24.json",
  "fardarter-drive-receipt-idempotency-v6-24.schema.json",
]) {
  assert(text.workflow.includes(required), `v6.24 dedicated workflow missing ${required}`);
}
for (const prohibited of ["issues: write", "netlify deploy", "deploy --", "send_email", "gmail", "curl ", "wget "]) {
  assert(!text.workflow.toLowerCase().includes(prohibited), `v6.24 workflow is not read-only: ${prohibited}`);
}

for (const required of [
  "Fardarter Drive™ v6.24",
  "CROSS_LAYER_RECEIPT_IDEMPOTENCY_RECONCILED",
  "CROSSED_MESSAGE_DUPLICATE_RECEIPT",
  "RESTART_FROM_FIRST_SEARCH",
  "EARLIEST_VALID_EXACT_TUPLE",
  "bc40c24523b4a2b8bffcc5403b7b6ed18be8251b5653abecaaaf266c74e8e69b",
  "cb8805d9d544eb4aa914a91ec5ad7176ab30648c1b4ec394432c6c180310c47e",
  "5f7fce2a6e8cdf695b3a2e43a573a101e10694dfa57332bb285c6f3438a61a06",
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
  postMergeState: manifest.decision.postMergeState,
  receiptKeyContract: manifest.receiptKeyContract.contractVersion,
  githubVector: manifest.testVectors[0].expectedReceiptKey,
  driveVector: manifest.testVectors[1].expectedReceiptKey,
  duplicateClassification: manifest.writeProtocol.countGreaterThanOneClassification,
  activeControlHead: manifest.repository.activeControlHead,
  canonical: `${manifest.currentTruth.canonical.eventHeadSequence}/${manifest.currentTruth.canonical.reconciliationSequence}`,
  consequentialEffects: "ZERO",
  next: manifest.decision.nextControlledAction,
}, null, 2));
