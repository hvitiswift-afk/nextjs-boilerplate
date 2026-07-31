import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const paths = {
  manifest: "receipts/revenue/FARDARTER-DRIVE-CONTROL-HEAD-V6-18.json",
  schema: "schemas/revenue/fardarter-drive-control-head-v6-18.schema.json",
  aggregate: "receipts/revenue/FARDARTER-DRIVE-AGGREGATE-RECEIPT-V6-16.json",
  aggregateSchema: "schemas/revenue/fardarter-drive-aggregate-receipt-v6-16.schema.json",
  ownerRouting: "receipts/revenue/FARDARTER-DRIVE-OWNER-ROUTING-V6-17.json",
  ownerRoutingSchema: "schemas/revenue/fardarter-drive-owner-routing-v6-17.schema.json",
  publicOffer: "receipts/revenue/FARDARTER-DRIVE-PUBLIC-OFFER-V6-14.json",
  publicOfferTemplate: "templates/fardarter-drive-public-offer-v6-14.md",
  applicationSurface: "receipts/revenue/FARDARTER-DRIVE-APPLICATION-SURFACE-V6-15.json",
  production: "receipts/revenue/FARDARTER-DRIVE-PRODUCTION-RECONCILIATION-V6-12.json",
  unified: "receipts/revenue/FARDARTER-DRIVE-UNIFIED-CONTROL-V6-13.json",
  privateContinuity: "receipts/revenue/FARDARTER-DRIVE-GDRIVE-V6-13.json",
  revenueWorkflow: ".github/workflows/revenue-experiment.yml",
  dedicatedWorkflow: ".github/workflows/fardarter-control-head-v6-18.yml",
  documentation: "docs/revenue/FARDARTER-DRIVE-CONTROL-HEAD-V6-18.md",
  package: "package.json",
  historicalAggregateVerifier: "scripts/check-fardarter-revenue-receipt-v6-16.mjs",
  ownerRoutingVerifier: "scripts/check-fardarter-owner-routing-v6-17.mjs",
};

const text = Object.fromEntries(
  await Promise.all(
    Object.entries(paths).map(async ([key, path]) => [key, await readFile(path, "utf8")]),
  ),
);

const parse = (value, label) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error(`${label} invalid JSON: ${error.message}`);
  }
};
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
const sha256Stable = (value) =>
  createHash("sha256").update(stable(value), "utf8").digest("hex");
const sha256Text = (value) =>
  createHash("sha256").update(value, "utf8").digest("hex");
const without = (object, key) => {
  const copy = structuredClone(object);
  delete copy[key];
  return copy;
};

const manifest = parse(text.manifest, "v6.18 control head");
const schema = parse(text.schema, "v6.18 control-head schema");
const aggregate = parse(text.aggregate, "v6.16 aggregate");
const aggregateSchema = parse(text.aggregateSchema, "v6.16 aggregate schema");
const ownerRouting = parse(text.ownerRouting, "v6.17 owner routing");
const ownerRoutingSchema = parse(text.ownerRoutingSchema, "v6.17 owner-routing schema");
const publicOffer = parse(text.publicOffer, "v6.14 public offer");
const applicationSurface = parse(text.applicationSurface, "v6.15 application surface");
const production = parse(text.production, "v6.12 production");
const unified = parse(text.unified, "v6.13 unified control");
const privateContinuity = parse(text.privateContinuity, "v6.13 private continuity");
const pkg = parse(text.package, "package");

assert(
  manifest.controlId === "FARDARTER-DRIVE-CONTROL-HEAD-V6-18" &&
    manifest.controllerVersion === "6.18.0" &&
    manifest.controllingIssue === 212 &&
    manifest.implementationIssue === 213,
  "v6.18 control-head identity mismatch",
);
assert(
  sha256Stable(without(manifest, "manifestDigest")) === manifest.manifestDigest &&
    manifest.manifestDigest ===
      "80764bd177469742831497a96290a8d74518035d632d4908f669006c3bf45f7c",
  "v6.18 control-head digest mismatch",
);
assert(
  schema.type === "object" && stable(schema.const) === stable(manifest),
  "v6.18 exact schema does not lock the manifest",
);

assert(
  manifest.repository.repositoryFullName === "hvitiswift-afk/nextjs-boilerplate" &&
    manifest.repository.baseHead ===
      "2a4b4c0dea29a90010b911425d57aa3f8133f000" &&
    manifest.repository.standingControlBefore ===
      "FARDARTER-DRIVE-AGGREGATE-RECEIPT-V6-16" &&
    manifest.repository.standingControlAfter ===
      "FARDARTER-DRIVE-CONTROL-HEAD-V6-18" &&
    manifest.repository.driftVerified === true &&
    manifest.repository.historyRewriteAllowed === false &&
    manifest.repository.sourceState ===
      "PREPARED_SOURCE_ONLY_PENDING_REVIEWED_MERGE" &&
    manifest.repository.postMergeState ===
      "STANDING_CONTROL_HEAD_RECONCILED",
  "v6.18 repository/head contract mismatch",
);

assert(
  aggregate.manifestDigest === manifest.predecessors.aggregate.digest &&
    aggregate.manifestDigest ===
      "f70fa832c62264fcdf8f24d9067246e5ecdeb0ae5dc5bf211ee3041d7bf13a7e" &&
    aggregate.controlId === manifest.predecessors.aggregate.controlId &&
    aggregateSchema.type === "object" &&
    stable(aggregateSchema.const) === stable(aggregate) &&
    manifest.predecessors.aggregate.preservedImmutable === true,
  "v6.18 aggregate predecessor mismatch",
);
assert(
  ownerRouting.manifestDigest === manifest.predecessors.ownerRouting.digest &&
    ownerRouting.manifestDigest ===
      "ccd7761970cb3d48c8c4e9aeb06f40e691247088266ad2644b7ec00cd211a0d4" &&
    ownerRouting.controlId === manifest.predecessors.ownerRouting.controlId &&
    ownerRouting.repository.postMergeState ===
      manifest.predecessors.ownerRouting.postMergeState &&
    ownerRoutingSchema.type === "object" &&
    stable(ownerRoutingSchema.const) === stable(ownerRouting) &&
    manifest.predecessors.ownerRouting.preservedImmutable === true,
  "v6.18 owner-routing predecessor mismatch",
);

assert(
  ownerRouting.routes.length === 11 &&
    ownerRouting.notificationPolicy.allowedEvents.length === 8 &&
    ownerRouting.notificationPolicy.silenceConditions.length === 9 &&
    ownerRouting.notificationPolicy.maximumNotificationsPerFingerprint === 1 &&
    ownerRouting.decisionFingerprint.algorithm === "SHA-256" &&
    ownerRouting.decisionFingerprint.canonicalization ===
      "JSON_SORTED_KEYS_UTF8" &&
    manifest.predecessors.ownerRouting.routeCount === 11 &&
    manifest.predecessors.ownerRouting.notificationEventCount === 8 &&
    manifest.predecessors.ownerRouting.silenceConditionCount === 9 &&
    manifest.predecessors.ownerRouting.maximumNotificationsPerFingerprint === 1,
  "v6.18 owner-routing policy summary mismatch",
);

assert(
  sha256Text(text.publicOfferTemplate) ===
      manifest.currentTruth.issue133.bodySha256 &&
    manifest.currentTruth.issue133.bodySha256 ===
      "369338fda0fe9e2236eecd68a1321635e025e85365eb701e10ee1d8bb3c405e0" &&
    manifest.currentTruth.issue133.title === publicOffer.publicIssue.targetTitle &&
    manifest.currentTruth.issue133.bodyMarker ===
      publicOffer.publicIssue.bodyMarker &&
    manifest.currentTruth.issue133.integrityState ===
      "EXACT_CURRENT_OFFER_INTACT" &&
    manifest.currentTruth.issue133.publicState ===
      "OPEN_FOR_VERIFIED_FIT_CHECKS" &&
    manifest.currentTruth.issue133.automaticRewriteAllowed === false,
  "v6.18 Issue #133 integrity mismatch",
);

assert(
  manifest.currentTruth.applicationSource.state ===
      "SOURCE_MERGED_NOT_DEPLOYED" &&
    manifest.currentTruth.applicationSource.manifestDigest ===
      applicationSurface.manifestDigest &&
    manifest.currentTruth.applicationSource.pageSha256 ===
      applicationSurface.surface.pageSha256 &&
    manifest.currentTruth.applicationSource.apiSha256 ===
      applicationSurface.surface.apiSha256 &&
    manifest.currentTruth.applicationSource.apiSchemaVersion ===
      applicationSurface.surface.apiSchemaVersion,
  "v6.18 application-source truth mismatch",
);

assert(
  manifest.currentTruth.production.applicationState ===
      "DEPLOYED_AND_VERIFIED" &&
    manifest.currentTruth.production.controlState === "RECONCILED" &&
    manifest.currentTruth.production.deployedApplicationSource ===
      production.repository.deployedApplicationSource &&
    manifest.currentTruth.production.deployId ===
      production.verifiedProduction.deployId &&
    manifest.currentTruth.production.verifiedRouteCount === 18 &&
    manifest.currentTruth.production.exactBodyMatchCount === 18 &&
    manifest.currentTruth.production.repositoryRelationship ===
      "CONTROL_AHEAD_OF_DEPLOYED_APPLICATION_SOURCE" &&
    manifest.currentTruth.production.sourceGap ===
      "EXPECTED_CONTROL_ONLY_GAP" &&
    manifest.currentTruth.production.owner ===
      "FARDARTER_DRIVE_LIVE_WATCH",
  "v6.18 production/source relationship mismatch",
);

assert(
  manifest.currentTruth.canonical.eventHeadSequence ===
      unified.canonical.eventHeadSequence &&
    manifest.currentTruth.canonical.eventHeadDigest ===
      unified.canonical.eventHeadDigest &&
    manifest.currentTruth.canonical.reconciliationSequence ===
      unified.canonical.reconciliationSequence &&
    manifest.currentTruth.canonical.reconciliationDigest ===
      unified.canonical.reconciliationDigest &&
    manifest.currentTruth.canonical.scopeDrafted === 1 &&
    manifest.currentTruth.canonical.humanAccepted === 0 &&
    manifest.currentTruth.canonical.active === 0 &&
    manifest.currentTruth.canonical.event2Present === false &&
    manifest.currentTruth.canonical.candidateEvent === null &&
    manifest.currentTruth.canonical.candidateReconciliation === null,
  "v6.18 canonical truth mismatch",
);

assert(
  manifest.currentTruth.consent.packageState === "NO_PACKAGE" &&
    manifest.currentTruth.consent.decision ===
      "AWAITING_COUNTERPARTY_EVIDENCE" &&
    manifest.currentTruth.consent.independentVerificationPerformed === false &&
    manifest.currentTruth.consent.eligibleForCanonicalApplication === false &&
    manifest.currentTruth.capacity.totalPlanningSlots === 1000 &&
    manifest.currentTruth.capacity.effectiveActiveCeiling === 100 &&
    manifest.currentTruth.capacity.activeDeliveries === 0 &&
    manifest.currentTruth.capacity.activeHeadroom === 100 &&
    manifest.currentTruth.capacity.overrideState === "INACTIVE_NO_RECEIPT" &&
    manifest.currentTruth.capacity.automaticActivationAllowed === false &&
    manifest.currentTruth.money.orders === 0 &&
    manifest.currentTruth.money.verifiedGrossRevenueUsd === 0 &&
    manifest.currentTruth.money.verifiedSettledCashUsd === 0 &&
    manifest.currentTruth.money.receivedCashRequires === "PAID_SETTLED",
  "v6.18 consent/capacity/money mismatch",
);

assert(
  manifest.currentTruth.privateContinuity.state ===
      privateContinuity.state &&
    manifest.currentTruth.privateContinuity.state === "CONNECTED_PRIVATE" &&
    manifest.currentTruth.privateContinuity.knownDocumentCount === 17 &&
    manifest.currentTruth.privateContinuity.ownerOnly === true &&
    manifest.currentTruth.privateContinuity.shared === false &&
    manifest.currentTruth.privateContinuity.publicPrivateReferencesExposed === false,
  "v6.18 private continuity mismatch",
);

assert(
  manifest.standingControl.state ===
      "READY_FOR_REVIEWED_STANDING_CONTROL_HEAD_RECONCILIATION" &&
    manifest.standingControl.postMergeState ===
      "STANDING_CONTROL_HEAD_RECONCILED" &&
    manifest.standingControl.aggregateControl === aggregate.controlId &&
    manifest.standingControl.ownerRoutingControl === ownerRouting.controlId &&
    manifest.standingControl.topLevelWorkflowTargetVersion === "6.18.0" &&
    manifest.standingControl.historicalV616CompatibilityAnchorsRequired ===
      true &&
    manifest.standingControl.historicalV616VerifierRepointAllowed === false &&
    manifest.standingControl.ownerRoutingRequiredInUnifiedVerification === true,
  "v6.18 standing-control contract mismatch",
);

assert(
  manifest.routingAndNotification.routeCount === 11 &&
    manifest.routingAndNotification.notificationEventCount === 8 &&
    manifest.routingAndNotification.silenceConditionCount === 9 &&
    manifest.routingAndNotification.maximumNotificationsPerFingerprint === 1 &&
    manifest.routingAndNotification.sameFingerprintAction ===
      "SUPPRESS_NOTIFICATION" &&
    manifest.routingAndNotification.nothingMaterialChangedDisposition ===
      "SILENT" &&
    manifest.routingAndNotification.nativeGitHubFirstResponseOwner ===
      "NATIVE_V6_9_WORKFLOW" &&
    manifest.routingAndNotification.providerEvidenceAndMutationOwner ===
      "FARDARTER_DRIVE_LIVE_WATCH" &&
    manifest.routingAndNotification.publicFingerprintExposureAllowed === false,
  "v6.18 routing/notification projection mismatch",
);

assert(
  manifest.pointInTimeScan.issue133Integrity ===
      "EXACT_CURRENT_OFFER_INTACT" &&
    manifest.pointInTimeScan.openExternalAuditRequests === 0 &&
    manifest.pointInTimeScan.relevantInboundCounterpartyMessages === 0 &&
    manifest.pointInTimeScan.newConsentPackages === 0 &&
    manifest.pointInTimeScan.newEventProposals === 0 &&
    manifest.pointInTimeScan.newPreviews === 0 &&
    manifest.pointInTimeScan.newCapacityRequests === 0 &&
    manifest.pointInTimeScan.materialConflicts === 0 &&
    manifest.pointInTimeScan.externalInputDisposition ===
      "SILENT_NO_MATERIAL_EXTERNAL_CHANGE" &&
    manifest.pointInTimeScan.notBackgroundMonitoringGuarantee === true,
  "v6.18 point-in-time scan mismatch",
);

assert(
  Object.values(manifest.actualEffects).every((value) => value === 0) &&
    Object.values(manifest.projectedEffects).every((value) => value === 0) &&
    Object.values(manifest.consequentialEffects).every((value) => value === false),
  "v6.18 created or projected a consequential effect",
);

assert(
  manifest.decision.state ===
      "READY_FOR_REVIEWED_STANDING_CONTROL_HEAD_RECONCILIATION" &&
    manifest.decision.postMergeState ===
      "STANDING_CONTROL_HEAD_RECONCILED" &&
    manifest.decision.nextControlledAction ===
      "HOLD_FOR_GENUINE_EXTERNAL_INPUT_OR_SEPARATELY_AUTHORIZED_EXACT_PRODUCTION_PROMOTION" &&
    manifest.decision.automaticIssue133RewriteAllowed === false &&
    manifest.decision.automaticDeploymentAllowed === false &&
    manifest.decision.automaticCanonicalAdvanceAllowed === false,
  "v6.18 decision mismatch",
);

for (const required of [
  "name: Verify Fardarter Drive v6.18 standing control head",
  "npm run revenue:verify",
  "FARDARTER-DRIVE-CONTROL-HEAD-V6-18.json",
  "FARDARTER-DRIVE-OWNER-ROUTING-V6-17.json",
  "fardarter-drive-control-head-v6-18.schema.json",
  "fardarter-drive-owner-routing-v6-17.schema.json",
  "controller_version=6.18.0",
  "standing_control=FARDARTER-DRIVE-CONTROL-HEAD-V6-18",
  "control_head_manifest_digest=80764bd177469742831497a96290a8d74518035d632d4908f669006c3bf45f7c",
  "aggregate_manifest_digest=f70fa832c62264fcdf8f24d9067246e5ecdeb0ae5dc5bf211ee3041d7bf13a7e",
  "owner_routing_manifest_digest=ccd7761970cb3d48c8c4e9aeb06f40e691247088266ad2644b7ec00cd211a0d4",
  "owner_routing_state=OWNER_ROUTING_RECONCILED",
  "routing_notification_policy=11/8/9/1",
  "notification_disposition=SILENT_NO_MATERIAL_EXTERNAL_CHANGE",
  "permissions:\n  contents: read",
]) {
  assert(text.revenueWorkflow.includes(required), `v6.18 revenue workflow missing ${required}`);
}
const nonCommentRevenueLines = text.revenueWorkflow
  .split("\n")
  .filter((line) => !line.trimStart().startsWith("#"));
assert(
  nonCommentRevenueLines.some((line) =>
    line.includes("name: Verify Fardarter Drive v6.18 standing control head"),
  ),
  "v6.18 active revenue job identity missing",
);
assert(
  !nonCommentRevenueLines.some((line) =>
    line.includes("name: Verify Fardarter Drive v6.16 aggregate control"),
  ),
  "v6.16 aggregate identity remains active instead of historical",
);
assert(
  text.revenueWorkflow.includes("Historical v6.16 compatibility anchors") &&
    text.revenueWorkflow.includes("name: Verify Fardarter Drive v6.16 aggregate control"),
  "v6.16 compatibility anchors were not preserved",
);

for (const required of [
  "name: Fardarter Control Head v6.18",
  "permissions:\n  contents: read",
  "npm run fardarter:control-head:check",
  "FARDARTER-DRIVE-CONTROL-HEAD-V6-18.json",
  "fardarter-drive-control-head-v6-18.schema.json",
]) {
  assert(text.dedicatedWorkflow.includes(required), `v6.18 dedicated workflow missing ${required}`);
}

for (const workflow of [text.revenueWorkflow, text.dedicatedWorkflow]) {
  for (const prohibited of [
    "issues: write",
    "netlify deploy",
    "deploy --",
    "send_email",
    "curl ",
    "wget ",
  ]) {
    assert(
      !workflow.toLowerCase().includes(prohibited.toLowerCase()),
      `v6.18 workflows must remain read-only: ${prohibited}`,
    );
  }
}

assert(
  pkg.scripts["fardarter:revenue-receipt:check"] ===
      "node scripts/check-fardarter-revenue-receipt-v6-16.mjs" &&
    pkg.scripts["fardarter:control-head:check"] ===
      "node scripts/check-fardarter-control-head-v6-18.mjs" &&
    pkg.scripts["revenue:verify"].includes("npm run fardarter:owner-routing:check") &&
    pkg.scripts["revenue:verify"].includes("npm run fardarter:control-head:check"),
  "v6.18 package integration mismatch",
);
assert(
  text.historicalAggregateVerifier.includes(
    "FARDARTER-DRIVE-AGGREGATE-RECEIPT-V6-16",
  ) &&
    text.historicalAggregateVerifier.includes(
      "fardarter:revenue-receipt:check",
    ) &&
    text.ownerRoutingVerifier.includes(
      "FARDARTER-DRIVE-OWNER-ROUTING-V6-17",
    ),
  "v6.16/v6.17 predecessor source was not preserved",
);

for (const required of [
  "Fardarter Drive™ v6.18",
  "STANDING_CONTROL_HEAD_RECONCILED",
  "v6.16",
  "v6.17",
  "11 owner routes",
  "eight material notification classes",
  "nine silence and suppression conditions",
  "SILENT_NO_MATERIAL_EXTERNAL_CHANGE",
  "SOURCE_MERGED_NOT_DEPLOYED",
  "DEPLOYED_AND_VERIFIED",
  "No private Google Drive URL or file ID",
]) {
  assert(text.documentation.includes(required), `v6.18 documentation missing ${required}`);
}

const publicSource = [
  text.manifest,
  text.schema,
  text.documentation,
  text.revenueWorkflow,
  text.dedicatedWorkflow,
].join("\n");
const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
assert(!emailPattern.test(publicSource), "v6.18 public source exposes an email address");
for (const privateRef of [
  "docs.google.com",
  "drive.google.com",
  '"fileId"',
  '"folderId"',
  '"documentId"',
]) {
  assert(!publicSource.includes(privateRef), `v6.18 public source exposes ${privateRef}`);
}

console.log(
  JSON.stringify(
    {
      status: "PASS",
      control: manifest.controlId,
      controllerVersion: manifest.controllerVersion,
      manifestDigest: manifest.manifestDigest,
      standingState: manifest.standingControl.postMergeState,
      aggregate: `${aggregate.controllerVersion}/${aggregate.manifestDigest}`,
      ownerRouting: `${ownerRouting.controllerVersion}/${ownerRouting.manifestDigest}`,
      routingPolicy: `${ownerRouting.routes.length}/${ownerRouting.notificationPolicy.allowedEvents.length}/${ownerRouting.notificationPolicy.silenceConditions.length}/${ownerRouting.notificationPolicy.maximumNotificationsPerFingerprint}`,
      issue133: manifest.currentTruth.issue133.integrityState,
      source: manifest.currentTruth.applicationSource.state,
      production: `${manifest.currentTruth.production.applicationState}/${manifest.currentTruth.production.controlState}`,
      canonical: `${manifest.currentTruth.canonical.eventHeadSequence}/${manifest.currentTruth.canonical.reconciliationSequence}`,
      consent: `${manifest.currentTruth.consent.packageState}/${manifest.currentTruth.consent.decision}`,
      money: `${manifest.currentTruth.money.orders}/$${manifest.currentTruth.money.verifiedGrossRevenueUsd}/$${manifest.currentTruth.money.verifiedSettledCashUsd}`,
      notificationDisposition:
        manifest.pointInTimeScan.externalInputDisposition,
      consequentialEffects: "ZERO",
    },
    null,
    2,
  ),
);
