import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const paths = {
  events: "receipts/revenue/FARDARTER-DRIVE-STATE-EVENTS-V6-2.json",
  eventSchema: "schemas/revenue/fardarter-drive-state-event-v6-2.schema.json",
  eventsSchema: "schemas/revenue/fardarter-drive-state-events-v6-2.schema.json",
  capacity: "receipts/revenue/FARDARTER-DRIVE-CAPACITY-LEDGER-V6-1.json",
  historicalSnapshot: "receipts/revenue/FARDARTER-DRIVE-RECONCILIATION-V6-3.json",
  currentSnapshot: "receipts/revenue/FARDARTER-DRIVE-RECONCILIATION-V6-5.json",
  currentSnapshotSchema: "schemas/revenue/fardarter-drive-reconciliation-v6-5.schema.json",
  proposalLedger: "receipts/revenue/FARDARTER-DRIVE-EVENT-PROPOSALS-V6-3.json",
  previewLedger: "receipts/revenue/FARDARTER-DRIVE-CANONICALIZATION-PREVIEWS-V6-4.json",
  previewBundle: "receipts/revenue/FARDARTER-DRIVE-CANONICALIZATION-REVIEW-BUNDLE-V6-4.sample.json",
  application: "receipts/revenue/FARDARTER-DRIVE-CANONICALIZATION-APPLICATION-V6-5.json",
  applicationSchema: "schemas/revenue/fardarter-drive-canonicalization-application-v6-5.schema.json",
  gdrive: "receipts/revenue/FARDARTER-DRIVE-GDRIVE-V6.json",
  gdriveSchema: "schemas/revenue/fardarter-drive-gdrive-v6.schema.json",
  operationsApi: "app/api/revenue/operations/route.ts",
  reconciliationApi: "app/api/revenue/reconciliation/route.ts",
  previewApi: "app/api/revenue/canonicalization-preview/route.ts",
  applicationApi: "app/api/revenue/canonicalization-application/route.ts",
  operationsPage: "app/github-control-tower-audit/operations/page.tsx",
  reconciliationPage: "app/github-control-tower-audit/reconciliation/page.tsx",
  previewPage: "app/github-control-tower-audit/canonicalization-preview/page.tsx",
  applicationPage: "app/github-control-tower-audit/canonicalization-application/page.tsx",
  package: "package.json",
  revenueWorkflow: ".github/workflows/revenue-experiment.yml",
  applicationReadback: ".github/workflows/fardarter-canonicalization-application-readback-v6-5.yml",
  netlifyWorkflow: ".github/workflows/netlify-audit-product-deploy.yml",
  sitemap: "app/sitemap.ts",
  operatingDoc: "docs/repository/FARDARTER-DRIVE-V6-5-REVIEWED-CANONICALIZATION.md",
};

const text = Object.fromEntries(await Promise.all(Object.entries(paths).map(async ([key, path]) => [key, await readFile(path, "utf8")])));
const parse = (value, label) => { try { return JSON.parse(value); } catch (error) { throw new Error(`${label} must be valid JSON: ${error.message}`); } };
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const stableStringify = (value) => {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
};
const digestWithout = (value, key) => { const clone = structuredClone(value); delete clone[key]; return createHash("sha256").update(stableStringify(clone), "utf8").digest("hex"); };

const events = parse(text.events, "event chain");
const eventSchema = parse(text.eventSchema, "event schema");
const eventsSchema = parse(text.eventsSchema, "event-chain schema");
const capacity = parse(text.capacity, "capacity ledger");
const historicalSnapshot = parse(text.historicalSnapshot, "historical snapshot");
const currentSnapshot = parse(text.currentSnapshot, "current snapshot");
const currentSnapshotSchema = parse(text.currentSnapshotSchema, "current snapshot schema");
const proposalLedger = parse(text.proposalLedger, "proposal ledger");
const previewLedger = parse(text.previewLedger, "preview ledger");
const previewBundle = parse(text.previewBundle, "preview bundle");
const application = parse(text.application, "application receipt");
const applicationSchema = parse(text.applicationSchema, "application schema");
const gdrive = parse(text.gdrive, "Drive continuity");
const gdriveSchema = parse(text.gdriveSchema, "Drive schema");
const packageJson = parse(text.package, "package.json");

const GENESIS = "4c401dd352d4263786ac22072d616f67775761656a771ea8815e4623a7a3975b";
const EVENT = "3859eac9c63bef83624111704d38cf217b0c1a4ece6df874e72a76e9fb1ffc3b";
const HISTORICAL = "4035cd406a5db019c4f3b9122e0021b2fb3fcbb23e7e10b040333fdedeb41a22";
const PROPOSAL = "3c85fe2fc195d5a0c9de45b679f9ef3a5589f36f948ea4a8acc0720483a6dc9e";
const PREVIEW_LEDGER = "9294df7c63b535b292f163bc1bbc183883d05f7bd99329ed845db9d62e2e7a8c";
const PREPARED_EVENT = "2e369ed175bfbd2d2a9ae8cc35ab29a48afc7e25adbfc9591b0127fc2b3fb174";
const PREPARED_SNAPSHOT = "4e7e2ead4c466704ad0559fed73cc01cf028722d701ffe47669626858a96c8de";
const PREPARED_BUNDLE = "3198341aebdf82e95d8cd0de680a16553cf9c3b3c2e4fd4824d197de79aa6ef2";
const CURRENT_SNAPSHOT = digestWithout(currentSnapshot, "snapshotDigest");
const APPLICATION = digestWithout(application, "applicationDigest");

assert(events.appendOnly && events.eventCount === 2 && events.canonicalBusinessEventCount === 1 && events.headSequence === 1 && events.headDigest === EVENT, "current event-chain head is incorrect");
assert(events.events.length === 2 && events.events[0].eventDigest === GENESIS && events.events[0].eventType === "GENESIS", "genesis changed");
const ids = new Set();
for (const [index, event] of events.events.entries()) {
  assert(event.sequence === index, `event sequence mismatch at ${index}`);
  assert(event.previousEventDigest === (index === 0 ? null : events.events[index - 1].eventDigest), `event link mismatch at ${index}`);
  assert(digestWithout(event, "eventDigest") === event.eventDigest, `event digest mismatch at ${index}`);
  assert(!ids.has(event.idempotencyKey), `duplicate event key: ${event.idempotencyKey}`); ids.add(event.idempotencyKey);
  assert(event.canonical && event.publicSafe && !event.sensitiveDataPresent, `event ${index} boundary changed`);
}
const applied = events.events[1];
assert(applied.eventDigest === EVENT && applied.eventId === "FARDARTER-CANONICAL-ISSUE-159-V6-5", "reviewed event changed");
assert(applied.fromState === "FIT_APPROVED_FOR_SCOPE_DRAFT" && applied.toState === "SCOPE_DRAFTED" && applied.authorityGate === "JP_REVIEWED_MERGE", "reviewed transition changed");
assert(!applied.capacityEffect.usesActiveCapacity && applied.capacityEffect.activeDelta === 0, "reviewed event uses capacity");
assert(!applied.financialEffect.createsOrder && applied.financialEffect.grossRevenueDeltaUsd === 0 && applied.financialEffect.settledCashDeltaUsd === 0, "reviewed event claims money");
assert(events.currentCanonicalCounts.SCOPE_DRAFTED === 1 && Object.entries(events.currentCanonicalCounts).filter(([state]) => state !== "SCOPE_DRAFTED").every(([, value]) => value === 0), "canonical counts changed");
assert(events.financialEvidence.orders === 0 && events.financialEvidence.verifiedGrossRevenueUsd === 0 && events.financialEvidence.verifiedSettledCashUsd === 0, "event chain claims commercial state");
assert(events.capacityEvidence.activeDeliveries === 0 && events.capacityEvidence.activeHeadroom === 100, "event capacity changed");
assert(eventSchema.properties?.canonical?.const === true && eventsSchema.properties?.chainId?.const === events.chainId, "event schemas changed");

assert(capacity.canonicalCapacity.totalPlanningSlots === 1000 && capacity.canonicalCapacity.effectiveActiveCeiling === 100 && capacity.canonicalCapacity.activeDeliveries === 0 && capacity.canonicalCapacity.orders === 0, "capacity envelope changed");
assert(capacity.stateLedger.find((entry) => entry.state === "SCOPE_DRAFTED")?.canonicalCount === 1 && capacity.stateLedger.reduce((sum, entry) => sum + entry.canonicalCount, 0) === 1, "capacity state ledger did not reconcile");
assert(capacity.financialEvidence.verifiedGrossRevenueUsd === 0 && capacity.financialEvidence.verifiedSettledCashUsd === 0 && capacity.financialEvidence.receivedCashRequires === "PAID_SETTLED", "capacity money boundary changed");

assert(digestWithout(historicalSnapshot, "snapshotDigest") === historicalSnapshot.snapshotDigest && historicalSnapshot.snapshotDigest === HISTORICAL, "historical snapshot changed");
assert(digestWithout(proposalLedger, "ledgerDigest") === proposalLedger.ledgerDigest && proposalLedger.ledgerDigest === PROPOSAL, "proposal ledger changed");
assert(digestWithout(previewLedger, "ledgerDigest") === previewLedger.ledgerDigest && previewLedger.ledgerDigest === PREVIEW_LEDGER, "preview ledger changed");
assert(digestWithout(previewBundle.candidateEvent, "eventDigest") === PREPARED_EVENT && digestWithout(previewBundle.candidateReconciliation, "snapshotDigest") === PREPARED_SNAPSHOT && digestWithout(previewBundle, "bundleDigest") === PREPARED_BUNDLE, "historical preview digests changed");
assert(!previewBundle.candidateEvent.canonical && !previewBundle.candidateEvent.applied, "historical preview became canonical");

assert(currentSnapshot.snapshotDigest === CURRENT_SNAPSHOT, `v6.5 snapshot digest mismatch: expected ${CURRENT_SNAPSHOT}`);
assert(currentSnapshot.sequence === 1 && currentSnapshot.previousSnapshotDigest === HISTORICAL && currentSnapshot.canonical.canonicalBusinessEventCount === 1 && currentSnapshot.canonical.stateCounts.SCOPE_DRAFTED === 1, "v6.5 snapshot state changed");
assert(currentSnapshot.canonical.activeDeliveries === 0 && currentSnapshot.canonical.orders === 0 && currentSnapshot.canonical.verifiedSettledCashUsd === 0, "v6.5 snapshot claims commercial activity");
assert(currentSnapshotSchema.properties?.snapshotDigest?.const === CURRENT_SNAPSHOT, "snapshot schema is not locked to committed payload");
assert(application.applicationDigest === APPLICATION, `application digest mismatch: expected ${APPLICATION}`);
assert(application.review.decision === "APPROVED_FOR_REVIEWED_MERGE" && application.review.decisionMaker === "JP", "application review changed");
assert(application.canonicalEvent.eventDigest === EVENT && application.canonicalEvent.sequence === 1 && application.canonicalEvent.canonical && application.canonicalEvent.applied, "application event changed");
assert(application.reconciliation.snapshotDigest === CURRENT_SNAPSHOT && application.reconciliation.previousSnapshotDigest === HISTORICAL, "application snapshot linkage changed");
assert(application.previewEvidence.runtimeDuplicateSuppressed === true, "preview duplicate proof missing");
assert(application.effects.stateCountDelta.SCOPE_DRAFTED === 1 && application.effects.activeDeliveryDelta === 0 && application.effects.orderDelta === 0 && application.effects.grossRevenueDeltaUsd === 0 && application.effects.settledCashDeltaUsd === 0, "application effects changed");
for (const [key, value] of Object.entries(application.evidenceBoundary)) key === "receivedCashRequires" ? assert(value === "PAID_SETTLED", "cash gate changed") : assert(value === false, `${key} must remain false`);
assert(applicationSchema.properties?.applicationDigest?.const === APPLICATION && applicationSchema.properties?.reconciliation?.properties?.snapshotDigest?.const === CURRENT_SNAPSHOT, "application schema locks changed");

for (const title of ["Fardarter Drive™ v6.5 — Canonical Event Application Charter", "Fardarter Drive™ v6.5 — Canonical Event Application Register"]) assert(gdrive.documents.some((document) => document.title === title), `Drive receipt missing: ${title}`);
assert(gdrive.documents.length >= 11 && gdrive.automation.maintainCanonicalEventApplications && !gdrive.automation.applyCanonicalEventWithoutReviewedMerge, "Drive application controls changed");
assert(!gdrive.privacyBoundary.canonicalApplicationEvidencePublic && gdriveSchema.properties?.documents?.minItems >= 11, "Drive privacy/schema changed");

for (const required of ["FARDARTER-DRIVE-CANONICALIZATION-APPLICATION-V6-5.json", "FARDARTER-DRIVE-RECONCILIATION-V6-5.json", "SCOPE_DRAFTED", "PAID_SETTLED"]) assert(text.operationsApi.includes(required), `operations API missing ${required}`);
for (const required of ["historicalReconciliation", "FARDARTER-DRIVE-RECONCILIATION-V6-5.json", "canonicalBusinessEventCount === 1"]) assert(text.reconciliationApi.includes(required), `reconciliation API missing ${required}`);
for (const required of ["reviewedApplication", "historicalReconciliation", "currentReconciliation", "applicationWasReviewedMerge: true"]) assert(text.previewApi.includes(required), `preview API missing ${required}`);
for (const required of ["applicationDigest", "chainHealthy", "correctionRequiresNewEvent"]) assert(text.applicationApi.includes(required), `application API missing ${required}`);
for (const [label, source, required] of [["operations page", text.operationsPage, ["Fardarter Drive™ v6.5", "Later changes require a new event"]], ["reconciliation page", text.reconciliationPage, ["Historical snapshot, current reconciliation", "Reviewed merge applied"]], ["preview page", text.previewPage, ["Historical preview, reviewed application", "Preview digest reused as canonical digest: FALSE"]], ["application page", text.applicationPage, ["Reviewed canonicalization application", "Append-only recovery"]]]) for (const value of required) assert(source.includes(value), `${label} missing ${value}`);

assert(packageJson.scripts["fardarter:current:check"] === "node scripts/check-fardarter-reviewed-canonicalization-v6-5.mjs", "current package command missing");
for (const alias of ["fardarter:state:check", "fardarter:reconciliation:check", "fardarter:preview:check"]) assert(packageJson.scripts[alias] === "npm run fardarter:current:check", `${alias} is stale`);
assert(packageJson.scripts["revenue:verify"].includes("fardarter:current:check"), "unified verifier is stale");
for (const required of ["FARDARTER-DRIVE-CANONICALIZATION-APPLICATION-V6-5.json", "FARDARTER-DRIVE-RECONCILIATION-V6-5.json", "canonical_business_events=1", "scope_drafted=1"]) assert(text.revenueWorkflow.includes(required), `revenue workflow missing ${required}`);
for (const required of ["api/revenue/canonicalization-application", "SCOPE_DRAFTED", "canonicalBusinessEventCount === 1"]) assert(text.applicationReadback.includes(required), `application readback missing ${required}`);
assert(text.netlifyWorkflow.includes("app/api/revenue/**"), "Netlify API path coverage missing");
assert(text.sitemap.includes("/github-control-tower-audit/canonicalization-application"), "application sitemap route missing");
for (const required of ["3859eac9", "zero orders", "append-only"]) assert(text.operatingDoc.includes(required), `operating document missing ${required}`);

const forbidden = /(?:drive\.google\.com|docs\.google\.com|providerTransactionId|routingNumber|bankAccount|privateKey|customerEmail|customerName)/i;
for (const [label, value] of [["events", text.events], ["snapshot", text.currentSnapshot], ["application", text.application], ["operations API", text.operationsApi], ["application API", text.applicationApi]]) assert(!forbidden.test(value), `${label} exposes a forbidden private reference`);

console.log("Fardarter Drive v6.5 reviewed canonicalization: PASS");
console.log(`Canonical event: 1 / ${EVENT}`);
console.log(`Reconciliation: 1 / ${CURRENT_SNAPSHOT}`);
console.log(`Application: ${APPLICATION}`);
console.log("Canonical state: SCOPE_DRAFTED=1 / ACTIVE=0 / orders=0 / settled=$0");
