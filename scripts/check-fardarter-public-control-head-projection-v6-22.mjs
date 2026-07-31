import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const paths = {
  manifest: "receipts/revenue/FARDARTER-DRIVE-PUBLIC-CONTROL-HEAD-PROJECTION-V6-22.json",
  schema: "schemas/revenue/fardarter-drive-public-control-head-projection-v6-22.schema.json",
  page: "app/github-control-tower-audit/control-head/page.tsx",
  api: "app/api/revenue/control-head/route.ts",
  currentHead: "receipts/revenue/FARDARTER-DRIVE-CURRENT-CONTROL-HEAD-V6-21.json",
  application: "receipts/revenue/FARDARTER-DRIVE-APPLICATION-CONTROL-PROJECTION-V6-20.json",
  v620Page: "app/github-control-tower-audit/current/page.tsx",
  v620Api: "app/api/revenue/pilot/current/route.ts",
  nextConfig: "next.config.ts",
  strategy: "receipts/revenue/FARDARTER-DRIVE-STRATEGY-RAIL-V6-19.json",
  standing: "receipts/revenue/FARDARTER-DRIVE-CONTROL-HEAD-V6-18.json",
  offer: "receipts/revenue/FARDARTER-DRIVE-PUBLIC-OFFER-V6-14.json",
  production: "receipts/revenue/FARDARTER-DRIVE-PRODUCTION-RECONCILIATION-V6-12.json",
  revenue: ".github/workflows/revenue-experiment.yml",
  workflow: ".github/workflows/fardarter-public-control-head-projection-v6-22.yml",
  docs: "docs/revenue/FARDARTER-DRIVE-PUBLIC-CONTROL-HEAD-PROJECTION-V6-22.md",
  package: "package.json",
};

const text = Object.fromEntries(
  await Promise.all(
    Object.entries(paths).map(async ([key, path]) => [key, await readFile(path, "utf8")]),
  ),
);
const json = (key) => JSON.parse(text[key]);
const manifest = json("manifest");
const schema = json("schema");
const currentHead = json("currentHead");
const application = json("application");
const strategy = json("strategy");
const standing = json("standing");
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
  manifest.controlId === "FARDARTER-DRIVE-PUBLIC-CONTROL-HEAD-PROJECTION-V6-22" &&
    manifest.controllerVersion === "6.22.0" &&
    manifest.controllingIssue === 226 &&
    manifest.implementationIssue === 227,
  "v6.22 identity mismatch",
);
assert(
  sha256(stable(noDigest)) === manifest.manifestDigest &&
    manifest.manifestDigest === "f2a7344f1a437174e9abc4adfcb2a18a4a80ed2d952a88afd4e55c61993ebc36",
  "v6.22 manifest digest mismatch",
);
assert(schema.type === "object" && stable(schema.const) === stable(manifest), "v6.22 strict schema mismatch");

assert(
  sha256(text.page) === "52a7baa2f4fa35f4060d807c5dfedb2dc0fa51e867fd2064aa73bc2c689ddf4a" &&
    manifest.surface.pageSha256 === "52a7baa2f4fa35f4060d807c5dfedb2dc0fa51e867fd2064aa73bc2c689ddf4a",
  "v6.22 page hash mismatch",
);
assert(
  sha256(text.api) === "bdcd8d954ce8d0777338d705e499fb39eba4d6c4ed949e25528f59f36f9d52ff" &&
    manifest.surface.apiSha256 === "bdcd8d954ce8d0777338d705e499fb39eba4d6c4ed949e25528f59f36f9d52ff",
  "v6.22 API hash mismatch",
);

assert(
  currentHead.manifestDigest === manifest.predecessors.currentControlHead.digest &&
    currentHead.controlId === manifest.predecessors.currentControlHead.controlId &&
    currentHead.repository.postMergeState === "CURRENT_CONTROL_HEAD_RECONCILED" &&
    application.manifestDigest === manifest.predecessors.applicationControlProjection.digest &&
    strategy.manifestDigest === manifest.predecessors.strategyAuthority.digest &&
    standing.manifestDigest === manifest.predecessors.standingControl.digest &&
    offer.manifestDigest === manifest.predecessors.publicOffer.digest &&
    production.manifestDigest === manifest.predecessors.production.digest &&
    Object.values(manifest.predecessors).every((item) => item.preservedImmutable === true),
  "v6.22 predecessor linkage mismatch",
);

assert(
  sha256(text.v620Page) === "249ba20fffaa208330b416d9a42335508bd393c0d722848a5fc2e66febf76fcc" &&
    sha256(text.v620Api) === "23f00e6d2714257405f193b1c1272070258e2592c9cf1eb141ad0210678742eb" &&
    sha256(text.nextConfig) === "6b52b272308e66ecd7b828db0c80e532d70ed8d6ee38b42b08d3044a467043e5",
  "v6.20 immutable source lock changed",
);
assert(
  manifest.surface.modifiesV620StableRoutes === false &&
    manifest.surface.modifiesV620Rewrite === false &&
    manifest.surface.sourceUpdateCreatesDeployment === false &&
    manifest.surface.repositorySourceEqualsDeployedApplicationSource === false &&
    manifest.surface.apiSchemaVersion === "1.8.0",
  "v6.22 source boundary mismatch",
);

const current = manifest.currentTruth;
assert(
  current.issue133.integrityState === "EXACT_CURRENT_OFFER_INTACT" &&
    current.issue133.publicState === "OPEN_FOR_VERIFIED_FIT_CHECKS" &&
    current.issue133.automaticRewriteAllowed === false &&
    current.issue141.role === "HISTORICAL_STRATEGY_AND_STAGE_GOVERNANCE_RAIL" &&
    current.issue141.bodyState === "HISTORICAL_BODY_PRESERVED" &&
    current.issue141.automaticBodyRewriteAllowed === false,
  "v6.22 public authority mismatch",
);
assert(
  current.applicationSource.state === "SOURCE_MERGED_NOT_DEPLOYED" &&
    current.applicationSource.apiSchemaVersion === "1.7.0" &&
    current.applicationSource.rewriteMode === "NEXT_BEFORE_FILES_INTERNAL_REWRITE" &&
    current.applicationSource.repositorySourceEqualsDeployedApplicationSource === false &&
    current.applicationSource.sourceUpdateCreatesDeployment === false,
  "v6.22 application-source mismatch",
);
assert(
  current.production.applicationState === "DEPLOYED_AND_VERIFIED" &&
    current.production.controlState === "RECONCILED" &&
    current.production.repositoryRelationship === "CONTROL_AHEAD_OF_DEPLOYED_APPLICATION_SOURCE" &&
    current.production.sourceGap === "EXPECTED_CONTROL_ONLY_GAP" &&
    current.production.verifiedRouteCount === 18 &&
    current.production.exactBodyMatchCount === 18,
  "v6.22 production boundary mismatch",
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
  "v6.22 canonical or consent mismatch",
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
  "v6.22 capacity or money mismatch",
);
assert(
  current.privateContinuity.state === "CONNECTED_PRIVATE" &&
    current.privateContinuity.knownDocumentCount === 17 &&
    current.privateContinuity.ownerOnly === true &&
    current.privateContinuity.shared === false &&
    current.privateContinuity.publicPrivateReferencesExposed === false,
  "v6.22 private continuity mismatch",
);

assert(
  manifest.pointInTimeScan.newRepositoryCommits === 0 &&
    manifest.pointInTimeScan.openExternalAuditRequests === 0 &&
    manifest.pointInTimeScan.relevantInboundCounterpartyMessages === 0 &&
    manifest.pointInTimeScan.newConsentPackages === 0 &&
    manifest.pointInTimeScan.newEventProposals === 0 &&
    manifest.pointInTimeScan.newPreviews === 0 &&
    manifest.pointInTimeScan.newCapacityRequests === 0 &&
    manifest.pointInTimeScan.materialConflict === "PUBLIC_SOURCE_OMITS_V6_21_CURRENT_CONTROL_HEAD" &&
    manifest.pointInTimeScan.externalInputDisposition === "SILENT_NO_MATERIAL_EXTERNAL_CHANGE",
  "v6.22 point-in-time scan mismatch",
);
assert(
  Object.values(manifest.actualEffects).every((value) => value === 0) &&
    Object.values(manifest.projectedEffects).every((value) => value === 0) &&
    Object.values(manifest.consequentialEffects).every((value) => value === false),
  "v6.22 consequential effect mismatch",
);

for (const required of [
  "FARDARTER-DRIVE-PUBLIC-CONTROL-HEAD-PROJECTION-V6-22",
  "FARDARTER-DRIVE-CURRENT-CONTROL-HEAD-V6-21",
  "currentHead.repository.postMergeState",
  "current.applicationSource.state",
  "schemaVersion: \"1.8.0\"",
  "/github-control-tower-audit/control-head",
  "/api/revenue/control-head",
  "modifiesV620StableRoutes: false",
  "FARDARTER_DRIVE_LIVE_WATCH",
  "HOLD_FOR_GENUINE_EXTERNAL_INPUT_OR_SEPARATELY_AUTHORIZED_EXACT_PRODUCTION_PROMOTION",
]) {
  assert(text.page.includes(required) || text.api.includes(required), `v6.22 public source missing ${required}`);
}

const nonCommentRevenue = text.revenue.split("\n").filter((line) => !line.trimStart().startsWith("#"));
assert(
  nonCommentRevenue.some((line) => line.trim() === "name: Verify Fardarter Drive v6.21 current control head"),
  "v6.21 must remain the active top-level Revenue Experiment head",
);
assert(
  !nonCommentRevenue.some((line) => line.includes("v6.22")),
  "v6.22 must not replace the active Revenue Experiment head",
);

assert(
  pkg.scripts["fardarter:public-control-head-projection:check"] ===
      "node scripts/check-fardarter-public-control-head-projection-v6-22.mjs" &&
    pkg.scripts["revenue:verify"].includes("npm run fardarter:application-control-projection:check && npm run fardarter:public-control-head-projection:check && npm run fardarter:current-control-head:check") &&
    pkg.scripts["revenue:verify"].endsWith("npm run fardarter:strategy-rail:check"),
  "v6.22 package integration mismatch",
);

for (const required of [
  "name: Fardarter Public Control Head Projection v6.22",
  "permissions:\n  contents: read",
  "npm run fardarter:public-control-head-projection:check",
  "FARDARTER-DRIVE-PUBLIC-CONTROL-HEAD-PROJECTION-V6-22.json",
  "fardarter-drive-public-control-head-projection-v6-22.schema.json",
]) {
  assert(text.workflow.includes(required), `v6.22 dedicated workflow missing ${required}`);
}
for (const prohibited of ["issues: write", "netlify deploy", "deploy --", "send_email", "gmail", "curl ", "wget "]) {
  assert(!text.workflow.toLowerCase().includes(prohibited), `v6.22 workflow is not read-only: ${prohibited}`);
}

for (const required of [
  "Fardarter Drive™ v6.22",
  "PUBLIC_CONTROL_HEAD_SOURCE_RECONCILED",
  "CURRENT_CONTROL_HEAD_RECONCILED",
  "SOURCE_MERGED_NOT_DEPLOYED",
  "No private Google Drive URL or file ID",
  "f2a7344f1a437174e9abc4adfcb2a18a4a80ed2d952a88afd4e55c61993ebc36",
  "52a7baa2f4fa35f4060d807c5dfedb2dc0fa51e867fd2064aa73bc2c689ddf4a",
  "bdcd8d954ce8d0777338d705e499fb39eba4d6c4ed949e25528f59f36f9d52ff",
]) {
  assert(text.docs.includes(required), `v6.22 documentation missing ${required}`);
}

const publicSource = [text.manifest, text.schema, text.page, text.api, text.docs, text.workflow].join("\n");
assert(!/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(publicSource), "v6.22 public email exposure");
for (const token of ["docs.google.com", "drive.google.com", '"fileId"', '"folderId"', '"documentId"']) {
  assert(!publicSource.includes(token), `v6.22 private reference exposure: ${token}`);
}

console.log(JSON.stringify({
  status: "PASS",
  control: manifest.controlId,
  controllerVersion: manifest.controllerVersion,
  manifestDigest: manifest.manifestDigest,
  pageSha256: manifest.surface.pageSha256,
  apiSha256: manifest.surface.apiSha256,
  apiSchemaVersion: manifest.surface.apiSchemaVersion,
  currentHead: `${manifest.predecessors.currentControlHead.version}/${manifest.predecessors.currentControlHead.state}`,
  application: `${manifest.predecessors.applicationControlProjection.version}/${current.applicationSource.state}`,
  production: `${current.production.applicationState}/${current.production.controlState}`,
  canonical: `${current.canonical.eventHeadSequence}/${current.canonical.reconciliationSequence}`,
  consent: `${current.consent.packageState}/${current.consent.decision}`,
  money: current.money,
  consequentialEffects: "ZERO",
  next: manifest.decision.nextControlledAction,
}, null, 2));
