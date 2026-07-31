import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const files = {
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
const text = Object.fromEntries(await Promise.all(Object.entries(files).map(async ([k, p]) => [k, await readFile(p, "utf8")])));
const j = (k) => JSON.parse(text[k]);
const m = j("manifest"), s = j("schema"), strategy = j("strategy"), standing = j("standing"), routing = j("routing"), surface = j("surface"), offer = j("offer"), production = j("production"), pkg = j("pkg");
const ok = (x, message) => { if (!x) throw new Error(message); };
const stable = (v) => Array.isArray(v) ? `[${v.map(stable).join(",")}]` : v && typeof v === "object" ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${stable(v[k])}`).join(",")}}` : JSON.stringify(v);
const sha = (v) => createHash("sha256").update(v, "utf8").digest("hex");
const noDigest = structuredClone(m); delete noDigest.manifestDigest;

ok(m.controlId === "FARDARTER-DRIVE-APPLICATION-CONTROL-PROJECTION-V6-20" && m.controllerVersion === "6.20.0" && m.controllingIssue === 220 && m.implementationIssue === 221, "identity mismatch");
ok(sha(stable(noDigest)) === m.manifestDigest && m.manifestDigest === "6e1145e5088761f54f2c1c0d320aa2ba349f91f18b9a0ee6c5c2060f49cbfc16", "manifest digest mismatch");
ok(s.type === "object" && stable(s.const) === stable(m), "strict schema mismatch");
ok(sha(text.oldPage) === surface.surface.pageSha256 && sha(text.oldApi) === surface.surface.apiSha256, "historical v6.15 source changed");
ok(sha(text.page) === m.surface.pageSha256 && m.surface.pageSha256 === "249ba20fffaa208330b416d9a42335508bd393c0d722848a5fc2e66febf76fcc", "successor page hash mismatch");
ok(sha(text.api) === m.surface.apiSha256 && m.surface.apiSha256 === "23f00e6d2714257405f193b1c1272070258e2592c9cf1eb141ad0210678742eb", "successor API hash mismatch");
ok(sha(text.config) === m.surface.nextConfigSha256 && m.surface.nextConfigSha256 === "6b52b272308e66ecd7b828db0c80e532d70ed8d6ee38b42b08d3044a467043e5", "next config hash mismatch");

ok(m.predecessors.strategyAuthority.digest === strategy.manifestDigest && m.predecessors.standingControl.digest === standing.manifestDigest && m.predecessors.ownerRouting.digest === routing.manifestDigest && m.predecessors.applicationSurface.digest === surface.manifestDigest && m.predecessors.publicOffer.digest === offer.manifestDigest && m.predecessors.production.digest === production.manifestDigest, "predecessor linkage mismatch");
ok(Object.values(m.predecessors).every((x) => x.preservedImmutable === true), "predecessor immutability mismatch");
ok(m.repository.sourceState === "PREPARED_SOURCE_ONLY_PENDING_REVIEWED_MERGE" && m.repository.postMergeState === "SOURCE_MERGED_NOT_DEPLOYED" && m.repository.historyRewriteAllowed === false, "prepared/post-merge state mismatch");
ok(m.surface.apiSchemaVersion === "1.7.0" && m.surface.rewriteMode === "NEXT_BEFORE_FILES_INTERNAL_REWRITE" && m.surface.sourceUpdateCreatesDeployment === false && m.surface.repositorySourceEqualsDeployedApplicationSource === false && m.surface.futurePromotionOwner === "FARDARTER_DRIVE_LIVE_WATCH", "source/deployment boundary mismatch");

const c = m.currentTruth;
ok(c.strategyAuthority.state === "STRATEGY_RAIL_RECONCILED" && c.standingControl.state === "STANDING_CONTROL_HEAD_RECONCILED", "strategy/standing state mismatch");
ok(c.issue133.integrityState === "EXACT_CURRENT_OFFER_INTACT" && c.issue133.publicState === "OPEN_FOR_VERIFIED_FIT_CHECKS" && c.issue133.automaticRewriteAllowed === false, "Issue #133 mismatch");
ok(c.issue141.role === "HISTORICAL_STRATEGY_AND_STAGE_GOVERNANCE_RAIL" && c.issue141.bodyState === "HISTORICAL_BODY_PRESERVED" && c.issue141.automaticBodyRewriteAllowed === false, "Issue #141 mismatch");
ok(c.production.applicationState === "DEPLOYED_AND_VERIFIED" && c.production.controlState === "RECONCILED" && c.production.repositoryRelationship === "CONTROL_AHEAD_OF_DEPLOYED_APPLICATION_SOURCE" && c.production.sourceGap === "EXPECTED_CONTROL_ONLY_GAP", "production mismatch");
ok(c.canonical.eventHeadSequence === 1 && c.canonical.reconciliationSequence === 1 && c.canonical.scopeDrafted === 1 && c.canonical.humanAccepted === 0 && c.canonical.active === 0 && c.canonical.event2Present === false, "canonical mismatch");
ok(c.consent.packageState === "NO_PACKAGE" && c.consent.decision === "AWAITING_COUNTERPARTY_EVIDENCE" && c.consent.eligibleForCanonicalApplication === false, "consent mismatch");
ok(c.capacity.totalPlanningSlots === 1000 && c.capacity.effectiveActiveCeiling === 100 && c.capacity.activeDeliveries === 0 && c.capacity.activeHeadroom === 100 && c.capacity.overrideState === "INACTIVE_NO_RECEIPT", "capacity mismatch");
ok(c.money.orders === 0 && c.money.verifiedGrossRevenueUsd === 0 && c.money.verifiedSettledCashUsd === 0 && c.money.receivedCashRequires === "PAID_SETTLED", "money mismatch");
ok(c.privateContinuity.state === "CONNECTED_PRIVATE" && c.privateContinuity.knownDocumentCount === 17 && c.privateContinuity.ownerOnly === true && c.privateContinuity.shared === false && c.privateContinuity.publicPrivateReferencesExposed === false, "privacy mismatch");

ok(m.routingAndNotification.routeCount === 11 && m.routingAndNotification.notificationEventCount === 8 && m.routingAndNotification.silenceConditionCount === 9 && m.routingAndNotification.maximumNotificationsPerFingerprint === 1 && m.routingAndNotification.sameFingerprintAction === "SUPPRESS_NOTIFICATION" && m.routingAndNotification.nativeGitHubFirstResponseOwner === "NATIVE_V6_9_WORKFLOW" && m.routingAndNotification.providerEvidenceAndMutationOwner === "FARDARTER_DRIVE_LIVE_WATCH" && m.routingAndNotification.publicFingerprintExposureAllowed === false, "routing mismatch");
ok(Object.values(m.actualEffects).every((x) => x === 0) && Object.values(m.projectedEffects).every((x) => x === 0) && Object.values(m.consequentialEffects).every((x) => x === false), "zero-consequence mismatch");

for (const token of ["Current authority, without pretending source is production.", "Historical strategy rail", "FARDARTER_DRIVE_LIVE_WATCH", "SOURCE_ONLY"]) ok(text.page.includes(token), `page missing ${token}`);
for (const token of ['schemaVersion: "1.7.0"', "strategyAuthority", "standingControl", "historicalStrategyRail", "routingAndNotification", "legacyCompatibility"]) ok(text.api.includes(token), `API missing ${token}`);
for (const token of ['source: "/github-control-tower-audit"', 'destination: "/github-control-tower-audit/current"', 'source: "/api/revenue/pilot"', 'destination: "/api/revenue/pilot/current"']) ok(text.config.includes(token), `rewrite missing ${token}`);
const publicText = [text.manifest, text.schema, text.page, text.api, text.docs, text.workflow].join("\n");
ok(!/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(publicText), "public email exposure");
for (const token of ["docs.google.com", "drive.google.com", '"fileId"', '"folderId"', '"documentId"']) ok(!publicText.includes(token), `private reference exposure ${token}`);
for (const token of ["issues: write", "netlify deploy", "deploy --", "send_email", "gmail", "curl ", "wget "]) ok(!text.workflow.toLowerCase().includes(token), `workflow write capability ${token}`);
ok(pkg.scripts["fardarter:application-control-projection:check"] === "node scripts/check-fardarter-application-control-projection-v6-20-final.mjs" && pkg.scripts["revenue:verify"].includes("npm run fardarter:application-control-projection:check") && pkg.scripts["revenue:verify"].endsWith("npm run fardarter:strategy-rail:check"), "package integration mismatch");

console.log(JSON.stringify({ status: "PASS", control: m.controlId, manifestDigest: m.manifestDigest, source: `${m.surface.pageSha256}/${m.surface.apiSha256}`, strategy: c.strategyAuthority.state, standing: c.standingControl.state, production: `${c.production.applicationState}/${c.production.controlState}`, canonical: `${c.canonical.eventHeadSequence}/${c.canonical.reconciliationSequence}`, consent: `${c.consent.packageState}/${c.consent.decision}`, money: `${c.money.orders}/$${c.money.verifiedGrossRevenueUsd}/$${c.money.verifiedSettledCashUsd}`, consequentialEffects: "ZERO" }, null, 2));
