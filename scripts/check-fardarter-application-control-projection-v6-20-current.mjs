import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const paths = {
  manifest: "receipts/revenue/FARDARTER-DRIVE-APPLICATION-CONTROL-PROJECTION-V6-20.json",
  schema: "schemas/revenue/fardarter-drive-application-control-projection-v6-20.schema.json",
  page: "app/github-control-tower-audit/current/page.tsx",
  api: "app/api/revenue/pilot/current/route.ts",
  config: "next.config.ts",
  oldPage: "app/github-control-tower-audit/page.tsx",
  oldApi: "app/api/revenue/pilot/route.ts",
  strategy: "receipts/revenue/FARDARTER-DRIVE-STRATEGY-RAIL-V6-19.json",
  standing: "receipts/revenue/FARDARTER-DRIVE-CONTROL-HEAD-V6-18.json",
  routing: "receipts/revenue/FARDARTER-DRIVE-OWNER-ROUTING-V6-17.json",
  surface: "receipts/revenue/FARDARTER-DRIVE-APPLICATION-SURFACE-V6-15.json",
  offer: "receipts/revenue/FARDARTER-DRIVE-PUBLIC-OFFER-V6-14.json",
  production: "receipts/revenue/FARDARTER-DRIVE-PRODUCTION-RECONCILIATION-V6-12.json",
  workflow: ".github/workflows/fardarter-application-control-projection-v6-20.yml",
  docs: "docs/revenue/FARDARTER-DRIVE-APPLICATION-CONTROL-PROJECTION-V6-20.md",
  pkg: "package.json",
};

const text = Object.fromEntries(
  await Promise.all(
    Object.entries(paths).map(async ([key, path]) => [key, await readFile(path, "utf8")]),
  ),
);
const json = (key) => JSON.parse(text[key]);
const manifest = json("manifest");
const schema = json("schema");
const strategy = json("strategy");
const standing = json("standing");
const routing = json("routing");
const surface = json("surface");
const offer = json("offer");
const production = json("production");
const pkg = json("pkg");

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
const withoutDigest = structuredClone(manifest);
delete withoutDigest.manifestDigest;

assert(
  manifest.controlId === "FARDARTER-DRIVE-APPLICATION-CONTROL-PROJECTION-V6-20" &&
    manifest.controllerVersion === "6.20.0" &&
    manifest.controllingIssue === 220 &&
    manifest.implementationIssue === 221,
  "v6.20 identity mismatch",
);
assert(
  sha256(stable(withoutDigest)) === manifest.manifestDigest &&
    manifest.manifestDigest === "6e1145e5088761f54f2c1c0d320aa2ba349f91f18b9a0ee6c5c2060f49cbfc16",
  "v6.20 manifest digest mismatch",
);
assert(
  schema.type === "object" && stable(schema.const) === stable(manifest),
  "v6.20 strict schema mismatch",
);

assert(
  sha256(text.oldPage) === surface.surface.pageSha256 &&
    surface.surface.pageSha256 === "8a0b7d95e87ac30c8e970c6cf74d4760c1c7135beb032d4d0bbc02bd22eccb3b" &&
    sha256(text.oldApi) === surface.surface.apiSha256 &&
    surface.surface.apiSha256 === "4396640551cf5c6b1227d21f174cda8f890215904bd728884f36daa90870ba9c",
  "v6.20 historical v6.15 source changed",
);
assert(
  sha256(text.page) === manifest.surface.pageSha256 &&
    manifest.surface.pageSha256 === "249ba20fffaa208330b416d9a42335508bd393c0d722848a5fc2e66febf76fcc" &&
    sha256(text.api) === manifest.surface.apiSha256 &&
    manifest.surface.apiSha256 === "23f00e6d2714257405f193b1c1272070258e2592c9cf1eb141ad0210678742eb" &&
    sha256(text.config) === manifest.surface.nextConfigSha256 &&
    manifest.surface.nextConfigSha256 === "6b52b272308e66ecd7b828db0c80e532d70ed8d6ee38b42b08d3044a467043e5",
  "v6.20 successor source hash mismatch",
);

assert(
  manifest.predecessors.strategyAuthority.digest === strategy.manifestDigest &&
    manifest.predecessors.standingControl.digest === standing.manifestDigest &&
    manifest.predecessors.ownerRouting.digest === routing.manifestDigest &&
    manifest.predecessors.applicationSurface.digest === surface.manifestDigest &&
    manifest.predecessors.publicOffer.digest === offer.manifestDigest &&
    manifest.predecessors.production.digest === production.manifestDigest &&
    Object.values(manifest.predecessors).every((item) => item.preservedImmutable === true),
  "v6.20 predecessor linkage mismatch",
);
assert(
  manifest.repository.sourceState === "PREPARED_SOURCE_ONLY_PENDING_REVIEWED_MERGE" &&
    manifest.repository.postMergeState === "SOURCE_MERGED_NOT_DEPLOYED" &&
    manifest.repository.historyRewriteAllowed === false &&
    manifest.surface.apiSchemaVersion === "1.7.0" &&
    manifest.surface.rewriteMode === "NEXT_BEFORE_FILES_INTERNAL_REWRITE" &&
    manifest.surface.sourceUpdateCreatesDeployment === false &&
    manifest.surface.repositorySourceEqualsDeployedApplicationSource === false &&
    manifest.surface.futurePromotionOwner === "FARDARTER_DRIVE_LIVE_WATCH",
  "v6.20 source/deployment boundary mismatch",
);

const current = manifest.currentTruth;
assert(
  current.strategyAuthority.state === "STRATEGY_RAIL_RECONCILED" &&
    current.standingControl.state === "STANDING_CONTROL_HEAD_RECONCILED" &&
    current.issue133.integrityState === "EXACT_CURRENT_OFFER_INTACT" &&
    current.issue133.publicState === "OPEN_FOR_VERIFIED_FIT_CHECKS" &&
    current.issue141.role === "HISTORICAL_STRATEGY_AND_STAGE_GOVERNANCE_RAIL" &&
    current.issue141.bodyState === "HISTORICAL_BODY_PRESERVED" &&
    current.production.applicationState === "DEPLOYED_AND_VERIFIED" &&
    current.production.controlState === "RECONCILED" &&
    current.production.repositoryRelationship === "CONTROL_AHEAD_OF_DEPLOYED_APPLICATION_SOURCE",
  "v6.20 authority or production truth mismatch",
);
assert(
  current.canonical.eventHeadSequence === 1 &&
    current.canonical.reconciliationSequence === 1 &&
    current.canonical.scopeDrafted === 1 &&
    current.canonical.humanAccepted === 0 &&
    current.canonical.active === 0 &&
    current.canonical.event2Present === false &&
    current.consent.packageState === "NO_PACKAGE" &&
    current.consent.decision === "AWAITING_COUNTERPARTY_EVIDENCE" &&
    current.capacity.totalPlanningSlots === 1000 &&
    current.capacity.effectiveActiveCeiling === 100 &&
    current.capacity.activeDeliveries === 0 &&
    current.capacity.overrideState === "INACTIVE_NO_RECEIPT" &&
    current.money.orders === 0 &&
    current.money.verifiedGrossRevenueUsd === 0 &&
    current.money.verifiedSettledCashUsd === 0,
  "v6.20 canonical, consent, capacity, or money truth mismatch",
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
  "v6.20 routing or suppression mismatch",
);
assert(
  Object.values(manifest.actualEffects).every((value) => value === 0) &&
    Object.values(manifest.projectedEffects).every((value) => value === 0) &&
    Object.values(manifest.consequentialEffects).every((value) => value === false),
  "v6.20 consequential effect mismatch",
);

for (const required of [
  'source: "/github-control-tower-audit"',
  'destination: "/github-control-tower-audit/current"',
  'source: "/api/revenue/pilot"',
  'destination: "/api/revenue/pilot/current"',
]) assert(text.config.includes(required), `next.config missing ${required}`);
for (const required of [
  "Current authority, without pretending source is production.",
  "HISTORICAL_STRATEGY_AND_STAGE_GOVERNANCE_RAIL",
  "FARDARTER_DRIVE_LIVE_WATCH",
  "SOURCE_ONLY",
]) assert(text.page.includes(required), `v6.20 page missing ${required}`);
for (const required of [
  'schemaVersion: "1.7.0"',
  "strategyAuthority",
  "standingControl",
  "historicalStrategyRail",
  "routingAndNotification",
  "legacyCompatibility",
]) assert(text.api.includes(required), `v6.20 API missing ${required}`);

const publicCombined = [text.manifest, text.schema, text.page, text.api, text.docs, text.workflow].join("\n");
assert(!/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(publicCombined), "v6.20 public source exposes email");
for (const token of ["docs.google.com", "drive.google.com", '"fileId"', '"folderId"', '"documentId"']) {
  assert(!publicCombined.includes(token), `v6.20 public source exposes ${token}`);
}
for (const prohibited of ["issues: write", "netlify deploy", "deploy --", "send_email", "gmail", "curl ", "wget "]) {
  assert(!text.workflow.toLowerCase().includes(prohibited), `v6.20 workflow is not read-only: ${prohibited}`);
}
assert(
  pkg.scripts["fardarter:application-control-projection:check"] ===
    "node scripts/check-fardarter-application-control-projection-v6-20-current.mjs" &&
    pkg.scripts["revenue:verify"].includes("npm run fardarter:strategy-rail:check") &&
    pkg.scripts["revenue:verify"].includes("npm run fardarter:application-control-projection:check"),
  "v6.20 package integration mismatch",
);

console.log(JSON.stringify({
  status: "PASS",
  control: manifest.controlId,
  manifestDigest: manifest.manifestDigest,
  historicalSource: `${surface.surface.pageSha256}/${surface.surface.apiSha256}`,
  successorSource: `${manifest.surface.pageSha256}/${manifest.surface.apiSha256}`,
  strategy: current.strategyAuthority.state,
  standing: current.standingControl.state,
  production: `${current.production.applicationState}/${current.production.controlState}`,
  canonical: `${current.canonical.eventHeadSequence}/${current.canonical.reconciliationSequence}`,
  consent: `${current.consent.packageState}/${current.consent.decision}`,
  money: `${current.money.orders}/$${current.money.verifiedGrossRevenueUsd}/$${current.money.verifiedSettledCashUsd}`,
  consequentialEffects: "ZERO",
}, null, 2));
