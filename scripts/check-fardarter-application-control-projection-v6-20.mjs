import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const paths = {
  manifest: "receipts/revenue/FARDARTER-DRIVE-APPLICATION-CONTROL-PROJECTION-V6-20.json",
  schema: "schemas/revenue/fardarter-drive-application-control-projection-v6-20.schema.json",
  page: "app/github-control-tower-audit/current/page.tsx",
  api: "app/api/revenue/pilot/current/route.ts",
  oldPage: "app/github-control-tower-audit/page.tsx",
  oldApi: "app/api/revenue/pilot/route.ts",
  config: "next.config.ts",
  strategy: "receipts/revenue/FARDARTER-DRIVE-STRATEGY-RAIL-V6-19.json",
  standing: "receipts/revenue/FARDARTER-DRIVE-CONTROL-HEAD-V6-18.json",
  routing: "receipts/revenue/FARDARTER-DRIVE-OWNER-ROUTING-V6-17.json",
  surface: "receipts/revenue/FARDARTER-DRIVE-APPLICATION-SURFACE-V6-15.json",
  offer: "receipts/revenue/FARDARTER-DRIVE-PUBLIC-OFFER-V6-14.json",
  production: "receipts/revenue/FARDARTER-DRIVE-PRODUCTION-RECONCILIATION-V6-12.json",
  docs: "docs/revenue/FARDARTER-DRIVE-APPLICATION-CONTROL-PROJECTION-V6-20.md",
  workflow: ".github/workflows/fardarter-application-control-projection-v6-20.yml",
  package: "package.json",
};

const text = Object.fromEntries(
  await Promise.all(Object.entries(paths).map(async ([key, path]) => [key, await readFile(path, "utf8")])),
);
const json = (key) => JSON.parse(text[key]);
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const stable = (value) =>
  Array.isArray(value)
    ? `[${value.map(stable).join(",")}]`
    : value && typeof value === "object"
      ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`
      : JSON.stringify(value);
const hashText = (value) => createHash("sha256").update(value, "utf8").digest("hex");
const without = (value, key) => {
  const copy = structuredClone(value);
  delete copy[key];
  return copy;
};
const hasAll = (value, required, label) => {
  for (const item of required) assert(value.includes(item), `${label} missing ${item}`);
};

const manifest = json("manifest");
const schema = json("schema");
const strategy = json("strategy");
const standing = json("standing");
const routing = json("routing");
const surface = json("surface");
const offer = json("offer");
const production = json("production");
const pkg = json("package");

assert(
  manifest.controlId === "FARDARTER-DRIVE-APPLICATION-CONTROL-PROJECTION-V6-20" &&
    manifest.controllerVersion === "6.20.0" &&
    manifest.controllingIssue === 220 &&
    manifest.implementationIssue === 221,
  "v6.20 identity mismatch",
);
assert(
  hashText(stable(without(manifest, "manifestDigest"))) === manifest.manifestDigest &&
    manifest.manifestDigest === "e2be32a3bd3531f932acfed100a911b23213b73f78c1a8683d7a4f3df99eb31b",
  "v6.20 manifest digest mismatch",
);
assert(schema.type === "object" && stable(schema.const) === stable(manifest), "v6.20 schema mismatch");

assert(
  strategy.manifestDigest === manifest.predecessors.strategyAuthority.digest &&
    standing.manifestDigest === manifest.predecessors.standingControl.digest &&
    routing.manifestDigest === manifest.predecessors.ownerRouting.digest &&
    surface.manifestDigest === manifest.predecessors.applicationSurface.digest &&
    offer.manifestDigest === manifest.predecessors.publicOffer.digest &&
    production.manifestDigest === manifest.predecessors.production.digest,
  "v6.20 predecessor linkage mismatch",
);
assert(
  Object.values(manifest.predecessors).every((item) => item.preservedImmutable === true),
  "v6.20 predecessor immutability mismatch",
);

assert(
  hashText(text.oldPage) === surface.surface.pageSha256 &&
    hashText(text.oldApi) === surface.surface.apiSha256,
  "v6.20 altered historical v6.15 source evidence",
);
assert(
  hashText(text.page) === manifest.surface.pageSha256 &&
    manifest.surface.pageSha256 === "9ead161311fe67fdd01ccc4a56b40328e56e2c928ad457380b6e089f0a62ab20" &&
    hashText(text.api) === manifest.surface.apiSha256 &&
    manifest.surface.apiSha256 === "23f00e6d2714257405f193b1c1272070258e2592c9cf1eb141ad0210678742eb" &&
    hashText(text.config) === manifest.surface.nextConfigSha256 &&
    manifest.surface.nextConfigSha256 === "6b52b272308e66ecd7b828db0c80e532d70ed8d6ee38b42b08d3044a467043e5",
  "v6.20 successor source digest mismatch",
);
assert(
  manifest.surface.apiSchemaVersion === "1.7.0" &&
    manifest.surface.rewriteMode === "NEXT_BEFORE_FILES_INTERNAL_REWRITE" &&
    manifest.surface.historicalV615SourcePreserved === true &&
    manifest.surface.sourceUpdateCreatesDeployment === false &&
    manifest.surface.repositorySourceEqualsDeployedApplicationSource === false,
  "v6.20 source/deployment boundary mismatch",
);

hasAll(text.config, [
  'source: "/github-control-tower-audit"',
  'destination: "/github-control-tower-audit/current"',
  'source: "/api/revenue/pilot"',
  'destination: "/api/revenue/pilot/current"',
  "beforeFiles",
], "v6.20 rewrite config");
hasAll(text.page, [
  "Current strategy authority",
  "Standing operational control",
  "Reviewed public offer",
  "Historical strategy rail",
  "Repository application source",
  "Verified production",
  "Routing and notification",
  "Canonical and consent",
  "Capacity and money",
  "Private continuity",
  "Request a public-safe fit check",
  "HOLD_FOR_GENUINE_EXTERNAL_INPUT_OR_SEPARATELY_AUTHORIZED_EXACT_PRODUCTION_PROMOTION",
], "v6.20 page");
hasAll(text.api, [
  'schemaVersion: "1.7.0"',
  'controlId: "FARDARTER-DRIVE-APPLICATION-CONTROL-PROJECTION-V6-20"',
  "strategyAuthority",
  "standingControl",
  "historicalStrategyRail",
  "routingAndNotification",
  "legacyCompatibility",
  "historicalV615SourcePreserved: true",
  "sourceUpdateCreatesDeployment: false",
  "repositorySourceIsCurrentlyDeployed: false",
  "futurePromotionRequiresSeparateProviderEvidence: true",
  'receivedCashRequires: "PAID_SETTLED"',
], "v6.20 API");
assert(!text.api.includes('schemaVersion: "1.5.0"'), "v6.20 API schema regression");

assert(
  manifest.currentTruth.strategyAuthority.state === "STRATEGY_RAIL_RECONCILED" &&
    manifest.currentTruth.standingControl.state === "STANDING_CONTROL_HEAD_RECONCILED" &&
    manifest.currentTruth.issue133.integrityState === "EXACT_CURRENT_OFFER_INTACT" &&
    manifest.currentTruth.issue133.publicState === "OPEN_FOR_VERIFIED_FIT_CHECKS" &&
    manifest.currentTruth.issue141.role === "HISTORICAL_STRATEGY_AND_STAGE_GOVERNANCE_RAIL" &&
    manifest.currentTruth.issue141.bodyState === "HISTORICAL_BODY_PRESERVED",
  "v6.20 authority projection mismatch",
);
assert(
  manifest.currentTruth.production.applicationState === "DEPLOYED_AND_VERIFIED" &&
    manifest.currentTruth.production.controlState === "RECONCILED" &&
    manifest.currentTruth.production.repositoryRelationship === "CONTROL_AHEAD_OF_DEPLOYED_APPLICATION_SOURCE" &&
    manifest.currentTruth.production.sourceGap === "EXPECTED_CONTROL_ONLY_GAP",
  "v6.20 production projection mismatch",
);
assert(
  manifest.currentTruth.canonical.eventHeadSequence === 1 &&
    manifest.currentTruth.canonical.reconciliationSequence === 1 &&
    manifest.currentTruth.canonical.scopeDrafted === 1 &&
    manifest.currentTruth.canonical.humanAccepted === 0 &&
    manifest.currentTruth.canonical.active === 0 &&
    manifest.currentTruth.canonical.event2Present === false &&
    manifest.currentTruth.consent.packageState === "NO_PACKAGE" &&
    manifest.currentTruth.consent.decision === "AWAITING_COUNTERPARTY_EVIDENCE" &&
    manifest.currentTruth.capacity.totalPlanningSlots === 1000 &&
    manifest.currentTruth.capacity.effectiveActiveCeiling === 100 &&
    manifest.currentTruth.capacity.activeDeliveries === 0 &&
    manifest.currentTruth.capacity.activeHeadroom === 100 &&
    manifest.currentTruth.money.orders === 0 &&
    manifest.currentTruth.money.verifiedGrossRevenueUsd === 0 &&
    manifest.currentTruth.money.verifiedSettledCashUsd === 0,
  "v6.20 canonical/consent/capacity/money mismatch",
);
assert(
  routing.routes.length === 11 &&
    routing.notificationPolicy.allowedEvents.length === 8 &&
    routing.notificationPolicy.silenceConditions.length === 9 &&
    routing.notificationPolicy.maximumNotificationsPerFingerprint === 1,
  "v6.20 routing summary mismatch",
);
assert(
  manifest.pointInTimeScan.materialConflict === "BUYER_FACING_SOURCE_STALE_AT_V6_15" &&
    manifest.pointInTimeScan.openExternalAuditRequests === 0 &&
    manifest.pointInTimeScan.relevantInboundCounterpartyMessages === 0 &&
    manifest.pointInTimeScan.newConsentPackages === 0 &&
    manifest.pointInTimeScan.newEventProposals === 0 &&
    manifest.pointInTimeScan.newPreviews === 0 &&
    manifest.pointInTimeScan.newCapacityRequests === 0 &&
    manifest.pointInTimeScan.notBackgroundMonitoringGuarantee === true,
  "v6.20 point-in-time scan mismatch",
);
assert(
  Object.values(manifest.actualEffects).every((value) => value === 0) &&
    Object.values(manifest.projectedEffects).every((value) => value === 0) &&
    Object.values(manifest.consequentialEffects).every((value) => value === false),
  "v6.20 consequential-effect mismatch",
);

hasAll(text.workflow, [
  "name: Fardarter Application Control Projection v6.20",
  "permissions:\n  contents: read",
  "npm run fardarter:application-control-projection:check",
  "FARDARTER-DRIVE-APPLICATION-CONTROL-PROJECTION-V6-20.json",
], "v6.20 workflow");
for (const prohibited of ["issues: write", "netlify deploy", "deploy --", "send_email", "curl ", "wget "]) {
  assert(!text.workflow.toLowerCase().includes(prohibited), `v6.20 workflow contains ${prohibited}`);
}
assert(
  pkg.scripts["fardarter:application-control-projection:check"] ===
      "node scripts/check-fardarter-application-control-projection-v6-20.mjs" &&
    pkg.scripts["revenue:verify"].includes("npm run fardarter:application-control-projection:check"),
  "v6.20 package integration mismatch",
);
hasAll(text.docs, [
  "Fardarter Drive™ v6.20",
  "SOURCE_MERGED_NOT_DEPLOYED",
  "STRATEGY_RAIL_RECONCILED",
  "STANDING_CONTROL_HEAD_RECONCILED",
  "HISTORICAL_STRATEGY_AND_STAGE_GOVERNANCE_RAIL",
  "schema 1.7.0",
  "v6.15 source hashes remain historical evidence",
  "No private Google Drive URL or file ID",
  "FARDARTER_DRIVE_LIVE_WATCH",
], "v6.20 docs");

const publicSource = [text.page, text.api, text.docs, text.workflow, text.manifest].join("\n");
assert(!/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(publicSource), "v6.20 public email exposure");
for (const privateRef of ["docs.google.com", "drive.google.com", '"fileId"', '"folderId"', '"documentId"']) {
  assert(!publicSource.includes(privateRef), `v6.20 private reference exposure: ${privateRef}`);
}

console.log(JSON.stringify({
  status: "PASS",
  control: manifest.controlId,
  controllerVersion: manifest.controllerVersion,
  manifestDigest: manifest.manifestDigest,
  pageSha256: manifest.surface.pageSha256,
  apiSha256: manifest.surface.apiSha256,
  nextConfigSha256: manifest.surface.nextConfigSha256,
  apiSchemaVersion: manifest.surface.apiSchemaVersion,
  strategy: manifest.currentTruth.strategyAuthority.state,
  standing: manifest.currentTruth.standingControl.state,
  issue133: manifest.currentTruth.issue133.integrityState,
  issue141: manifest.currentTruth.issue141.role,
  source: manifest.decision.postMergeState,
  production: `${manifest.currentTruth.production.applicationState}/${manifest.currentTruth.production.controlState}`,
  routing: "11/8/9/1",
  consequentialEffects: "ZERO",
}, null, 2));
