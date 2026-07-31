import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";

const paths = {
  manifest: "receipts/revenue/FARDARTER-DRIVE-RECEIPT-DESTINATION-CLAIM-V6-25.json",
  schema: "schemas/revenue/fardarter-drive-receipt-destination-claim-v6-25.schema.json",
  predecessor: "receipts/revenue/FARDARTER-DRIVE-CROSS-LAYER-RECEIPT-IDEMPOTENCY-V6-24.json",
  historicalWriter: "receipts/revenue/FARDARTER-DRIVE-HISTORICAL-WRITER-RETIREMENT-V6-23.json",
  publicProjection: "receipts/revenue/FARDARTER-DRIVE-PUBLIC-CONTROL-HEAD-PROJECTION-V6-22.json",
  currentHead: "receipts/revenue/FARDARTER-DRIVE-CURRENT-CONTROL-HEAD-V6-21.json",
  application: "receipts/revenue/FARDARTER-DRIVE-APPLICATION-CONTROL-PROJECTION-V6-20.json",
  production: "receipts/revenue/FARDARTER-DRIVE-PRODUCTION-RECONCILIATION-V6-12.json",
  docs: "docs/revenue/FARDARTER-DRIVE-RECEIPT-DESTINATION-CLAIM-V6-25.md",
  workflow: ".github/workflows/fardarter-receipt-destination-claim-v6-25.yml",
  package: "package.json",
  revenue: ".github/workflows/revenue-experiment.yml",
  predecessorVerifier: "scripts/check-fardarter-cross-layer-receipt-idempotency-v6-24.mjs",
};

const text = Object.fromEntries(
  await Promise.all(
    Object.entries(paths).map(async ([key, path]) => [key, await readFile(path, "utf8")]),
  ),
);
const parse = (key) => JSON.parse(text[key]);
const manifest = parse("manifest");
const schema = parse("schema");
const predecessor = parse("predecessor");
const historicalWriter = parse("historicalWriter");
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
const sha256 = (value) =>
  createHash("sha256").update(value, "utf8").digest("hex");

const noDigest = structuredClone(manifest);
delete noDigest.manifestDigest;

assert(
  manifest.controlId === "FARDARTER-DRIVE-RECEIPT-DESTINATION-CLAIM-V6-25" &&
    manifest.controllerVersion === "6.25.0" &&
    manifest.controllingIssue === 235 &&
    manifest.implementationIssue === 236,
  "v6.25 identity mismatch",
);
assert(
  sha256(stable(noDigest)) === manifest.manifestDigest &&
    manifest.manifestDigest === "52b032dcbaee35ef4039a82285cb37b9aaa0abbd8a30f97a555a76372f7d26e6",
  "v6.25 manifest digest mismatch",
);
assert(
  schema.type === "object" && stable(schema.const) === stable(manifest),
  "v6.25 strict schema mismatch",
);

const receiptFiles = (await readdir("receipts/revenue")).filter((name) =>
  name.includes("V6-25"),
);
const schemaFiles = (await readdir("schemas/revenue")).filter((name) =>
  name.includes("v6-25"),
);
assert(
  receiptFiles.length === 1 &&
    receiptFiles[0] === "FARDARTER-DRIVE-RECEIPT-DESTINATION-CLAIM-V6-25.json",
  `v6.25 competing receipt identities: ${receiptFiles.join(",")}`,
);
assert(
  schemaFiles.length === 1 &&
    schemaFiles[0] === "fardarter-drive-receipt-destination-claim-v6-25.schema.json",
  `v6.25 competing schema identities: ${schemaFiles.join(",")}`,
);

assert(
  predecessor.controlId === manifest.predecessors.receiptIdempotency.controlId &&
    predecessor.manifestDigest === manifest.predecessors.receiptIdempotency.digest &&
    predecessor.repository.postMergeState ===
      manifest.predecessors.receiptIdempotency.state &&
    historicalWriter.manifestDigest ===
      manifest.predecessors.historicalWriterRetirement.digest &&
    publicProjection.manifestDigest ===
      manifest.predecessors.publicControlHeadProjection.digest &&
    currentHead.manifestDigest ===
      manifest.predecessors.currentControlHead.digest &&
    application.manifestDigest ===
      manifest.predecessors.applicationControlProjection.digest &&
    production.manifestDigest === manifest.predecessors.production.digest &&
    Object.values(manifest.predecessors).every(
      (predecessorItem) => predecessorItem.preservedImmutable === true,
    ),
  "v6.25 predecessor linkage mismatch",
);
assert(
  manifest.predecessors.currentControlHead.remainsActiveTopLevelHead === true &&
    currentHead.repository.postMergeState === "CURRENT_CONTROL_HEAD_RECONCILED" &&
    application.repository.postMergeState === "SOURCE_MERGED_NOT_DEPLOYED",
  "v6.25 active-head/source boundary mismatch",
);

const preserved = manifest.materialReceiptKeyContract;
const oldKey = predecessor.receiptKeyContract;
assert(
  preserved.preservedFromVersion === oldKey.version &&
    preserved.algorithm === oldKey.algorithm &&
    preserved.canonicalization === oldKey.canonicalization &&
    preserved.orderedMaterialFields.join(",") ===
      oldKey.orderedMaterialFields.join(",") &&
    preserved.destinationAddressIncluded === false &&
    preserved.issueNumberIncluded === false &&
    preserved.commentIdIncluded === false &&
    preserved.revisionIdIncluded === false &&
    preserved.timestampIncluded === false &&
    preserved.providerGeneratedMetadataIncluded === false &&
    preserved.identityChangeAllowed === false,
  "v6.25 material receipt key was not preserved",
);
for (const prohibitedField of [
  "issueNumber",
  "commentId",
  "documentId",
  "revisionId",
  "timestamp",
  "runId",
  "providerObjectId",
]) {
  assert(
    !preserved.orderedMaterialFields.includes(prohibitedField),
    `v6.25 prohibited material key field: ${prohibitedField}`,
  );
}

assert(
  manifest.observedDuplicate.materialReceiptKey ===
      "eee942e246454fc6626f35967fa12dd3a50e34d4502e0811043e0fa08f78cdb2" &&
    manifest.observedDuplicate.authoritative.issueNumber === 232 &&
    manifest.observedDuplicate.authoritative.commentId === 5144541544 &&
    manifest.observedDuplicate.laterDuplicate.issueNumber === 233 &&
    manifest.observedDuplicate.laterDuplicate.commentId === 5144555821 &&
    manifest.observedDuplicate.correction.commentId === 5144591638 &&
    manifest.observedDuplicate.correction.classification ===
      "CROSSED_MESSAGE_DUPLICATE_RECEIPT" &&
    manifest.observedDuplicate.correction.controlTransitionCount === 1 &&
    manifest.observedDuplicate.rootCause ===
      "PER_DESTINATION_DOUBLE_READ_WITHOUT_CLASS_WIDE_CANONICAL_DESTINATION_AND_ATOMIC_CLAIM" &&
    manifest.observedDuplicate.historyPreserved === true &&
    manifest.observedDuplicate.secondControlTransitionCreated === false,
  "v6.25 observed duplicate evidence mismatch",
);

const registry = manifest.canonicalDestinationRegistry;
assert(
  registry.publicControlCompletion.destinationClass === "GITHUB_PUBLIC_ISSUE" &&
    registry.publicControlCompletion.receiptPurpose === "CONTROL_COMPLETION" &&
    registry.publicControlCompletion.canonicalRole === "CONTROLLING_ISSUE" &&
    registry.publicControlCompletion.canonicalIssueNumber === 235 &&
    registry.publicControlCompletion.candidateIssueNumbersForClassWideSearch.join(",") ===
      "235,236" &&
    registry.publicControlCompletion.implementationIssueCompletionReceiptAllowed ===
      false &&
    registry.publicControlCompletion.implementationIssueMetadataOnly === true,
  "v6.25 public completion destination mismatch",
);
assert(
  registry.publicDuplicateQuarantine.receiptPurpose ===
      "DUPLICATE_QUARANTINE" &&
    registry.publicDuplicateQuarantine.canonicalRole === "IMPLEMENTATION_ISSUE" &&
    registry.publicDuplicateQuarantine.canonicalIssueNumber === 236 &&
    registry.publicDuplicateQuarantine.maximumRecordsPerReceiptKey === 1 &&
    registry.publicDuplicateQuarantine.requiresDuplicateCountGreaterThanOne ===
      true,
  "v6.25 quarantine destination mismatch",
);
assert(
  registry.privateControlCompletion.destinationClass ===
      "PRIVATE_DRIVE_REGISTER" &&
    registry.privateControlCompletion.receiptPurpose === "CONTROL_COMPLETION" &&
    registry.privateControlCompletion.canonicalRole ===
      "OWNER_ONLY_RECONCILIATION_REGISTER" &&
    registry.privateControlCompletion.publicDocumentIdAllowed === false &&
    registry.privateControlCompletion.publicReceiptKeyAllowed === false &&
    registry.privateControlCompletion.ownerOnly === true &&
    registry.privateControlCompletion.shared === false,
  "v6.25 private destination mismatch",
);

const claim = manifest.publicAtomicClaim;
assert(
  claim.scope === "PUBLIC_GITHUB_RECEIPTS_ONLY" &&
    claim.branchPrefix === "fd-receipt-claim/" &&
    claim.branchNameTemplate === "fd-receipt-claim/{receiptKey}" &&
    claim.atomicOperation === "GIT_REF_CREATE_ONLY" &&
    claim.branchSource === "EXACT_MERGE_READBACK_COMMIT" &&
    claim.firstSuccessfulCreateState === "PUBLIC_WRITER_CLAIM_HELD" &&
    claim.alreadyExistsState === "SUPPRESS_PUBLIC_WRITE" &&
    claim.forceUpdateAllowed === false &&
    claim.normalUpdateAllowed === false &&
    claim.automaticDeleteAllowed === false &&
    claim.privateReceiptKeyBranchAllowed === false &&
    claim.classWideSearchBeforeClaimRequired === true &&
    claim.classWideSearchAfterClaimRequired === true &&
    claim.freshPostClaimProviderReadRequired === true &&
    claim.existingReceiptAfterClaimAction ===
      "SUPPRESS_PUBLIC_WRITE_AND_PRESERVE_CLAIM" &&
    claim.claimAuthorizesOnlyExactReceipt === true &&
    claim.claimCreatesControlTransition === false &&
    claim.claimCreatesBusinessEffect === false,
  "v6.25 public atomic claim mismatch",
);
assert(
  `${claim.branchPrefix}${claim.testVector.receiptKey}` ===
      claim.testVector.expectedBranchName &&
    claim.testVector.expectedBranchName ===
      "fd-receipt-claim/eee942e246454fc6626f35967fa12dd3a50e34d4502e0811043e0fa08f78cdb2" &&
    claim.testVector.expectedSourceCommit ===
      "0f2d1d4405ac676374fd8c95823716babca001ac",
  "v6.25 public claim test vector mismatch",
);

const publicProtocol = manifest.publicWriteProtocol;
assert(
  publicProtocol.steps.join(",") ===
    [
      "RESOLVE_CANONICAL_DESTINATION",
      "CLASS_WIDE_SEARCH_ALL_DECLARED_CANDIDATE_ISSUES",
      "FRESH_READ_ALL_DECLARED_CANDIDATE_ISSUES",
      "REPEAT_CLASS_WIDE_SEARCH",
      "CREATE_ATOMIC_PUBLIC_CLAIM_BRANCH",
      "FRESH_POST_CLAIM_CLASS_WIDE_READ",
      "REPEAT_CLASS_WIDE_SEARCH_AFTER_CLAIM",
      "WRITE_ONCE_TO_CANONICAL_DESTINATION_ONLY_IF_ZERO",
      "FRESH_POST_WRITE_CLASS_WIDE_READ",
      "COUNT_EXACT_KEY_AND_TUPLE_ACROSS_CLASS",
      "COMPLETE_IF_ONE_OR_QUARANTINE_IF_MORE_THAN_ONE",
    ].join(",") &&
    publicProtocol.candidateIssueRoles.join(",") ===
      "CONTROLLING_ISSUE,IMPLEMENTATION_ISSUE" &&
    publicProtocol.claimRequiredBeforeWrite === true &&
    publicProtocol.writeAttemptsPerClaimMaximum === 1 &&
    publicProtocol.noncanonicalDestinationWriteAllowed === false &&
    publicProtocol.crossedMessageAction ===
      "RESTART_FROM_CLASS_WIDE_SEARCH" &&
    publicProtocol.claimExistsAction === "SUPPRESS_PUBLIC_WRITE" &&
    publicProtocol.postClaimReceiptFoundAction ===
      "SUPPRESS_PUBLIC_WRITE_AND_PRESERVE_CLAIM" &&
    publicProtocol.maximumCorrectionRecordsPerReceiptKey === 1,
  "v6.25 public write protocol mismatch",
);

const simulatedWriters = [
  { writer: "A", createResult: "CREATED" },
  { writer: "B", createResult: "ALREADY_EXISTS" },
];
const holders = simulatedWriters.filter(
  (writer) => writer.createResult === "CREATED",
);
const suppressed = simulatedWriters.filter(
  (writer) => writer.createResult === "ALREADY_EXISTS",
);
assert(
  holders.length === 1 &&
    suppressed.length === 1 &&
    claim.firstSuccessfulCreateState === "PUBLIC_WRITER_CLAIM_HELD" &&
    claim.alreadyExistsState === "SUPPRESS_PUBLIC_WRITE",
  "v6.25 atomic claim simulation mismatch",
);

const privateClaim = manifest.privateAtomicClaim;
assert(
  privateClaim.scope === "PRIVATE_DRIVE_REGISTER_ONLY" &&
    privateClaim.primitive ===
      "REQUIRED_REVISION_ID_ON_SINGLE_COMPLETION_APPEND" &&
    privateClaim.separateClaimRecordRequired === false &&
    privateClaim.publicBranchAllowed === false &&
    privateClaim.privateReceiptKeyPublicExposureAllowed === false &&
    privateClaim.firstSearchRequired === true &&
    privateClaim.freshNativeDocumentReadRequired === true &&
    privateClaim.secondSearchRequired === true &&
    privateClaim.revisionConflictAction ===
      "RESTART_FROM_FIRST_PRIVATE_SEARCH" &&
    privateClaim.staleWriteDirectRetryAllowed === false &&
    privateClaim.postWriteExactCountRequired === true,
  "v6.25 private atomic claim mismatch",
);

assert(
  manifest.authorityBoundaries.v621RemainsActiveTopLevelHead === true &&
    manifest.authorityBoundaries.v625ReplacesCurrentControlHead === false &&
    manifest.authorityBoundaries.publicClaimBranchIsProviderDeploymentEvidence ===
      false &&
    manifest.authorityBoundaries.publicClaimBranchAuthorizesProviderMutation ===
      false &&
    manifest.authorityBoundaries.publicClaimBranchAuthorizesCanonicalAdvance ===
      false &&
    manifest.authorityBoundaries.publicClaimBranchAuthorizesCommercialEffect ===
      false &&
    manifest.authorityBoundaries.privateClaimCreatesPublicReference === false,
  "v6.25 authority boundary mismatch",
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
  "v6.25 current truth mismatch",
);
assert(
  Object.values(manifest.actualEffects).every((value) => value === 0) &&
    Object.values(manifest.projectedEffects).every((value) => value === 0) &&
    Object.values(manifest.consequentialEffects).every(
      (value) => value === false,
    ),
  "v6.25 consequential effects mismatch",
);
assert(
  manifest.decision.postMergeState ===
      "RECEIPT_DESTINATION_AND_CLAIM_RECONCILED" &&
    manifest.decision.automaticDeploymentAllowed === false &&
    manifest.decision.automaticCanonicalAdvanceAllowed === false &&
    manifest.decision.automaticHistoricalRewriteAllowed === false,
  "v6.25 decision mismatch",
);

assert(
  pkg.scripts["fardarter:receipt-destination-claim:check"] ===
      "node scripts/check-fardarter-receipt-destination-claim-v6-25.mjs" &&
    pkg.scripts["revenue:verify"].includes(
      "npm run fardarter:receipt-idempotency:check && npm run fardarter:receipt-destination-claim:check && npm run fardarter:application-control-projection:check",
    ) &&
    pkg.scripts["revenue:verify"].includes(
      "npm run fardarter:application-control-projection:check && npm run fardarter:public-control-head-projection:check && npm run fardarter:current-control-head:check",
    ) &&
    pkg.scripts["revenue:verify"].endsWith(
      "npm run fardarter:strategy-rail:check",
    ),
  "v6.25 package integration mismatch",
);
assert(
  text.predecessorVerifier.includes(
    "FARDARTER-DRIVE-CROSS-LAYER-RECEIPT-IDEMPOTENCY-V6-24",
  ) &&
    text.predecessorVerifier.includes(
      "fardarter:receipt-idempotency:check",
    ),
  "v6.24 verifier was not preserved",
);
const nonCommentRevenue = text.revenue
  .split("\n")
  .filter((line) => !line.trimStart().startsWith("#"));
assert(
  nonCommentRevenue.some(
    (line) =>
      line.trim() === "name: Verify Fardarter Drive v6.21 current control head",
  ),
  "v6.21 is no longer the active top-level head",
);

for (const required of [
  "name: Fardarter Receipt Destination Claim v6.25",
  "permissions:\n  contents: read",
  "npm run fardarter:receipt-destination-claim:check",
  "FARDARTER-DRIVE-RECEIPT-DESTINATION-CLAIM-V6-25.json",
  "fardarter-drive-receipt-destination-claim-v6-25.schema.json",
]) {
  assert(
    text.workflow.includes(required),
    `v6.25 workflow missing ${required}`,
  );
}
for (const prohibited of [
  "contents: write",
  "issues: write",
  "netlify deploy",
  "deploy --",
  "send_email",
  "gmail",
  "curl ",
  "wget ",
]) {
  assert(
    !text.workflow.toLowerCase().includes(prohibited),
    `v6.25 workflow is not read-only: ${prohibited}`,
  );
}
for (const required of [
  "Fardarter Drive v6.25",
  "RECEIPT_DESTINATION_AND_CLAIM_RECONCILED",
  "GIT_REF_CREATE_ONLY",
  "RESTART_FROM_CLASS_WIDE_SEARCH",
  "RESTART_FROM_FIRST_PRIVATE_SEARCH",
  "PER_DESTINATION_DOUBLE_READ_WITHOUT_CLASS_WIDE_CANONICAL_DESTINATION_AND_ATOMIC_CLAIM",
  "52b032dcbaee35ef4039a82285cb37b9aaa0abbd8a30f97a555a76372f7d26e6",
  "No private Google Drive URL or file ID",
]) {
  assert(
    text.docs.includes(required),
    `v6.25 documentation missing ${required}`,
  );
}

const publicSource = [
  text.manifest,
  text.schema,
  text.workflow,
  text.docs,
].join("\n");
assert(
  !/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(publicSource),
  "v6.25 public email exposure",
);
for (const token of [
  "docs.google.com",
  "drive.google.com",
  '"fileId"',
  '"folderId"',
  '"documentId"',
  '"privateReceiptKey"',
]) {
  assert(
    !publicSource.includes(token),
    `v6.25 private reference exposure: ${token}`,
  );
}

console.log(
  JSON.stringify(
    {
      status: "PASS",
      control: manifest.controlId,
      manifestDigest: manifest.manifestDigest,
      activeTopLevelHead: manifest.predecessors.currentControlHead.controlId,
      governancePredecessor: manifest.predecessors.receiptIdempotency.controlId,
      canonicalPublicDestination:
        manifest.canonicalDestinationRegistry.publicControlCompletion
          .canonicalIssueNumber,
      publicClaimBranch:
        manifest.publicAtomicClaim.testVector.expectedBranchName,
      publicConflictAction:
        manifest.publicWriteProtocol.crossedMessageAction,
      privateConflictAction:
        manifest.privateAtomicClaim.revisionConflictAction,
      consequentialEffects: "ZERO",
      next: manifest.decision.nextControlledAction,
    },
    null,
    2,
  ),
);
