import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const paths = {
  manifest: "receipts/revenue/FARDARTER-DRIVE-CURRENT-CONTROL-HEAD-V6-21.json",
  schema: "schemas/revenue/fardarter-drive-current-control-head-v6-21.schema.json",
  application: "receipts/revenue/FARDARTER-DRIVE-APPLICATION-CONTROL-PROJECTION-V6-20.json",
  strategy: "receipts/revenue/FARDARTER-DRIVE-STRATEGY-RAIL-V6-19.json",
  standing: "receipts/revenue/FARDARTER-DRIVE-CONTROL-HEAD-V6-18.json",
  routing: "receipts/revenue/FARDARTER-DRIVE-OWNER-ROUTING-V6-17.json",
  aggregate: "receipts/revenue/FARDARTER-DRIVE-AGGREGATE-RECEIPT-V6-16.json",
  offer: "receipts/revenue/FARDARTER-DRIVE-PUBLIC-OFFER-V6-14.json",
  production: "receipts/revenue/FARDARTER-DRIVE-PRODUCTION-RECONCILIATION-V6-12.json",
  revenue: ".github/workflows/revenue-experiment.yml",
  workflow: ".github/workflows/fardarter-current-control-head-v6-21.yml",
  docs: "docs/revenue/FARDARTER-DRIVE-CURRENT-CONTROL-HEAD-V6-21.md",
  package: "package.json",
  strategyVerifier: "scripts/check-fardarter-strategy-rail-v6-19.mjs",
};

const text = Object.fromEntries(
  await Promise.all(
    Object.entries(paths).map(async ([key, path]) => [key, await readFile(path, "utf8")]),
  ),
);
const json = (key) => JSON.parse(text[key]);
const manifest = json("manifest");
const schema = json("schema");
const application = json("application");
const strategy = json("strategy");
const standing = json("standing");
const routing = json("routing");
const aggregate = json("aggregate");
const offer = json("offer");
const production = json("production");
const pkg = json("package");

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
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
  manifest.controlId === "FARDARTER-DRIVE-CURRENT-CONTROL-HEAD-V6-21" &&
    manifest.controllerVersion === "6.21.0" &&
    manifest.controllingIssue === 223 &&
    manifest.implementationIssue === 224,
  "v6.21 identity mismatch",
);
assert(
  sha256(stable(noDigest)) === manifest.manifestDigest &&
    manifest.manifestDigest === "55dc7f97ec74aac059d758296870ba8a80297a978d5be7167dc0409dc4cba2b5",
  "v6.21 manifest digest mismatch",
);
assert(schema.type === "object" && stable(schema.const) === stable(manifest), "v6.21 strict schema mismatch");

assert(
  application.manifestDigest === manifest.predecessors.applicationControlProjection.digest &&
    strategy.manifestDigest === manifest.predecessors.strategyAuthority.digest &&
    standing.manifestDigest === manifest.predecessors.standingControl.digest &&
    routing.manifestDigest === manifest.predecessors.ownerRouting.digest &&
    aggregate.manifestDigest === manifest.predecessors.aggregateReceipt.digest &&
    offer.manifestDigest === manifest.predecessors.publicOffer.digest &&
    production.manifestDigest === manifest.predecessors.production.digest &&
    Object.values(manifest.predecessors).every((item) => item.preservedImmutable === true),
  "v6.21 predecessor linkage mismatch",
);

assert(
  manifest.repository.baseHead === "3558da800dbaf253f2a48636b939856b62bc8d5b" &&
    manifest.repository.activeControlBefore === "FARDARTER-DRIVE-STRATEGY-RAIL-V6-19" &&
    manifest.repository.activeControlAfter === "FARDARTER-DRIVE-CURRENT-CONTROL-HEAD-V6-21" &&
    manifest.repository.currentHeadDriftVerified === true &&
    manifest.repository.historyRewriteAllowed === false &&
    manifest.repository.preparedState === "PREPARED_SOURCE_ONLY_PENDING_REVIEWED_MERGE" &&
    manifest.repository.postMergeState === "CURRENT_CONTROL_HEAD_RECONCILED",
  "v6.21 repository current-head mismatch",
);

assert(
  manifest.predecessors.applicationControlProjection.apiSchemaVersion === "1.7.0" &&
    manifest.predecessors.applicationControlProjection.rewriteMode === "NEXT_BEFORE_FILES_INTERNAL_REWRITE" &&
    manifest.predecessors.applicationControlProjection.pageSha256 === "249ba20fffaa208330b416d9a42335508bd393c0d722848a5fc2e66febf76fcc" &&
    manifest.predecessors.applicationControlProjection.apiSha256 === "23f00e6d2714257405f193b1c1272070258e2592c9cf1eb141ad0210678742eb" &&
    manifest.predecessors.applicationControlProjection.nextConfigSha256 === "6b52b272308e66ecd7b828db0c80e532d70ed8d6ee38b42b08d3044a467043e5",
  "v6.21 v6.20 source lock mismatch",
);

const current = manifest.currentTruth;
assert(
  current.issue133.integrityState === "EXACT_CURRENT_OFFER_INTACT" &&
    current.issue133.publicState === "OPEN_FOR_VERIFIED_FIT_CHECKS" &&
    current.issue133.automaticRewriteAllowed === false &&
    current.issue141.role === "HISTORICAL_STRATEGY_AND_STAGE_GOVERNANCE_RAIL" &&
    current.issue141.bodyState === "HISTORICAL_BODY_PRESERVED" &&
    current.issue141.automaticBodyRewriteAllowed === false,
  "v6.21 public authority mismatch",
);
assert(
  current.applicationSource.state === "SOURCE_MERGED_NOT_DEPLOYED" &&
    current.applicationSource.apiSchemaVersion === "1.7.0" &&
    current.applicationSource.rewriteMode === "NEXT_BEFORE_FILES_INTERNAL_REWRITE" &&
    current.applicationSource.repositorySourceEqualsDeployedApplicationSource === false &&
    current.applicationSource.sourceUpdateCreatesDeployment === false,
  "v6.21 application-source mismatch",
);
assert(
  current.production.applicationState === "DEPLOYED_AND_VERIFIED" &&
    current.production.controlState === "RECONCILED" &&
    current.production.repositoryRelationship === "CONTROL_AHEAD_OF_DEPLOYED_APPLICATION_SOURCE" &&
    current.production.sourceGap === "EXPECTED_CONTROL_ONLY_GAP" &&
    current.production.verifiedRouteCount === 18 &&
    current.production.exactBodyMatchCount === 18,
  "v6.21 production boundary mismatch",
);
assert(
  current.canonical.eventHeadSequence === 1 &&
    current.canonical.reconciliationSequence === 1 &&
    current.canonical.scopeDrafted === 1 &&
    current.canonical.humanAccepted === 0 &&
    current.canonical.active === 0 &&
    current.canonical.event2Present === false &&
    current.canonical.candidateEvent === null &&
    current.canonical.candidateReconciliation === null &&
    current.consent.packageState === "NO_PACKAGE" &&
    current.consent.decision === "AWAITING_COUNTERPARTY_EVIDENCE" &&
    current.consent.eligibleForCanonicalApplication === false,
  "v6.21 canonical or consent mismatch",
);
assert(
  current.capacity.totalPlanningSlots === 1000 &&
    current.capacity.effectiveActiveCeiling === 100 &&
    current.capacity.activeDeliveries === 0 &&
    current.capacity.activeHeadroom === 100 &&
    current.capacity.overrideState === "INACTIVE_NO_RECEIPT" &&
    current.capacity.automaticActivationAllowed === false &&
    current.money.orders === 0 &&
    current.money.verifiedGrossRevenueUsd === 0 &&
    current.money.verifiedSettledCashUsd === 0 &&
    current.money.receivedCashRequires === "PAID_SETTLED",
  "v6.21 capacity or money mismatch",
);
assert(
  current.privateContinuity.state === "CONNECTED_PRIVATE" &&
    current.privateContinuity.knownDocumentCount === 17 &&
    current.privateContinuity.ownerOnly === true &&
    current.privateContinuity.shared === false &&
    current.privateContinuity.publicPrivateReferencesExposed === false,
  "v6.21 private continuity mismatch",
);

assert(
  manifest.routingAndNotification.routeCount === 11 &&
    manifest.routingAndNotification.notificationEventCount === 8 &&
    manifest.routingAndNotification.silenceConditionCount === 9 &&
    manifest.routingAndNotification.maximumNotificationsPerFingerprint === 1 &&
    manifest.routingAndNotification.sameFingerprintAction === "SUPPRESS_NOTIFICATION" &&
    manifest.routingAndNotification.nativeGitHubFirstResponseOwner === "NATIVE_V6_9_WORKFLOW" &&
    manifest.routingAndNotification.providerEvidenceAndMutationOwner === "FARDARTER_DRIVE_LIVE_WATCH" &&
    manifest.routingAndNotification.publicFingerprintExposureAllowed === false,
  "v6.21 routing mismatch",
);
assert(
  manifest.pointInTimeScan.newRepositoryCommits === 0 &&
    manifest.pointInTimeScan.openExternalAuditRequests === 0 &&
    manifest.pointInTimeScan.relevantInboundCounterpartyMessages === 0 &&
    manifest.pointInTimeScan.newConsentPackages === 0 &&
    manifest.pointInTimeScan.newEventProposals === 0 &&
    manifest.pointInTimeScan.newPreviews === 0 &&
    manifest.pointInTimeScan.newCapacityRequests === 0 &&
    manifest.pointInTimeScan.materialConflict === "TOP_LEVEL_REVENUE_ACTIVE_IDENTITY_STALE_AT_V6_19" &&
    manifest.pointInTimeScan.externalInputDisposition === "SILENT_NO_MATERIAL_EXTERNAL_CHANGE",
  "v6.21 point-in-time scan mismatch",
);
assert(
  Object.values(manifest.actualEffects).every((value) => value === 0) &&
    Object.values(manifest.projectedEffects).every((value) => value === 0) &&
    Object.values(manifest.consequentialEffects).every((value) => value === false),
  "v6.21 consequential effect mismatch",
);

for (const required of [
  "name: Verify Fardarter Drive v6.21 current control head",
  "npm run revenue:verify",
  "FARDARTER-DRIVE-CURRENT-CONTROL-HEAD-V6-21.json",
  "FARDARTER-DRIVE-APPLICATION-CONTROL-PROJECTION-V6-20.json",
  "fardarter-drive-current-control-head-v6-21.schema.json",
  "fardarter-drive-application-control-projection-v6-20.schema.json",
  "controller_version=6.21.0",
  "current_control=FARDARTER-DRIVE-CURRENT-CONTROL-HEAD-V6-21",
  "current_control_manifest_digest=55dc7f97ec74aac059d758296870ba8a80297a978d5be7167dc0409dc4cba2b5",
  "application_control=FARDARTER-DRIVE-APPLICATION-CONTROL-PROJECTION-V6-20",
  "application_control_manifest_digest=6e1145e5088761f54f2c1c0d320aa2ba349f91f18b9a0ee6c5c2060f49cbfc16",
  "application_api_schema=1.7.0",
  "application_rewrite_mode=NEXT_BEFORE_FILES_INTERNAL_REWRITE",
  "permissions:\n  contents: read",
]) {
  assert(text.revenue.includes(required), `v6.21 revenue workflow missing ${required}`);
}
const nonCommentLines = text.revenue.split("\n").filter((line) => !line.trimStart().startsWith("#"));
assert(
  nonCommentLines.some((line) => line.trim() === "name: Verify Fardarter Drive v6.21 current control head"),
  "v6.21 active job missing",
);
assert(
  !nonCommentLines.some((line) => line.trim() === "name: Verify Fardarter Drive v6.19 strategy authority map"),
  "v6.19 remains active instead of historical",
);
for (const anchor of [
  "Historical v6.19 compatibility anchors",
  "Historical v6.18 compatibility anchors",
  "Historical v6.16 compatibility anchors",
]) {
  assert(text.revenue.includes(anchor), `v6.21 compatibility anchor missing ${anchor}`);
}

for (const required of [
  "name: Fardarter Current Control Head v6.21",
  "permissions:\n  contents: read",
  "npm run fardarter:current-control-head:check",
  "FARDARTER-DRIVE-CURRENT-CONTROL-HEAD-V6-21.json",
  "fardarter-drive-current-control-head-v6-21.schema.json",
]) {
  assert(text.workflow.includes(required), `v6.21 dedicated workflow missing ${required}`);
}
for (const workflowText of [text.revenue, text.workflow]) {
  for (const prohibited of ["issues: write", "netlify deploy", "deploy --", "send_email", "gmail", "curl ", "wget "]) {
    assert(!workflowText.toLowerCase().includes(prohibited), `v6.21 workflow is not read-only: ${prohibited}`);
  }
}

assert(
  pkg.scripts["fardarter:current-control-head:check"] ===
      "node scripts/check-fardarter-current-control-head-v6-21.mjs" &&
    pkg.scripts["revenue:verify"].includes("npm run fardarter:current-control-head:check") &&
    pkg.scripts["revenue:verify"].includes("npm run fardarter:application-control-projection:check") &&
    pkg.scripts["revenue:verify"].endsWith("npm run fardarter:strategy-rail:check"),
  "v6.21 package integration mismatch",
);
assert(
  text.strategyVerifier.includes("Historical v6.19 compatibility anchors") &&
    text.strategyVerifier.includes("Verify Fardarter Drive v6.21 current control head") &&
    text.strategyVerifier.includes("fardarter:current-control-head:check"),
  "v6.19 verifier compatibility was not reconciled",
);

for (const required of [
  "Fardarter Drive™ v6.21",
  "CURRENT_CONTROL_HEAD_RECONCILED",
  "SOURCE_MERGED_NOT_DEPLOYED",
  "STRATEGY_RAIL_RECONCILED",
  "STANDING_CONTROL_HEAD_RECONCILED",
  "NEXT_BEFORE_FILES_INTERNAL_REWRITE",
  "schema       1.7.0",
  "No private Google Drive URL or file ID",
  "FARDARTER_DRIVE_LIVE_WATCH",
]) {
  assert(text.docs.includes(required), `v6.21 documentation missing ${required}`);
}

const publicSource = [text.manifest, text.schema, text.docs, text.revenue, text.workflow].join("\n");
assert(!/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(publicSource), "v6.21 public email exposure");
for (const token of ["docs.google.com", "drive.google.com", '"fileId"', '"folderId"', '"documentId"']) {
  assert(!publicSource.includes(token), `v6.21 private reference exposure: ${token}`);
}

console.log(JSON.stringify({
  status: "PASS",
  control: manifest.controlId,
  controllerVersion: manifest.controllerVersion,
  manifestDigest: manifest.manifestDigest,
  application: `${manifest.predecessors.applicationControlProjection.version}/${current.applicationSource.state}`,
  strategy: `${manifest.predecessors.strategyAuthority.version}/${manifest.predecessors.strategyAuthority.state}`,
  standing: `${manifest.predecessors.standingControl.version}/${manifest.predecessors.standingControl.state}`,
  production: `${current.production.applicationState}/${current.production.controlState}`,
  canonical: `${current.canonical.eventHeadSequence}/${current.canonical.reconciliationSequence}`,
  consent: `${current.consent.packageState}/${current.consent.decision}`,
  money: `${current.money.orders}/$${current.money.verifiedGrossRevenueUsd}/$${current.money.verifiedSettledCashUsd}`,
  consequentialEffects: "ZERO",
}, null, 2));
