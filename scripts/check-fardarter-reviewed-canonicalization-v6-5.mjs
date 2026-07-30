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

const text = Object.fromEntries(
  await Promise.all(
    Object.entries(paths).map(async ([key, path]) => [key, await readFile(path, "utf8")]),
  ),
);

const parse = (value, label) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error(`${label} must be valid JSON: ${error.message}`);
  }
};
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const stableStringify = (value) => {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
};
const digestWithout = (value, key) => {
  const clone = structuredClone(value);
  delete clone[key];
  return createHash("sha256").update(stableStringify(clone), "utf8").digest("hex");
};

const events = parse(text.events, "event chain");
const eventSchema = parse(text.eventSchema, "event schema");
const eventsSchema = parse(text.eventsSchema, "event-chain schema");
const capacity = parse(text.capacity, "capacity ledger");
const historicalSnapshot = parse(text.historicalSnapshot, "historical reconciliation");
const currentSnapshot = parse(text.currentSnapshot, "current reconciliation");
const currentSnapshotSchema = parse(text.currentSnapshotSchema, "current reconciliation schema");
const proposalLedger = parse(text.proposalLedger, "proposal ledger");
const previewLedger = parse(text.previewLedger, "preview ledger");
const previewBundle = parse(text.previewBundle, "preview bundle");
const application = parse(text.application, "application receipt");
const applicationSchema = parse(text.applicationSchema, "application schema");
const gdrive = parse(text.gdrive, "Google Drive continuity");
const gdriveSchema = parse(text.gdriveSchema, "Google Drive schema");
const packageJson = parse(text.package, "package.json");

const GENESIS = "4c401dd352d4263786ac22072d616f67775761656a771ea8815e4623a7a3975b";
const EVENT = "3859eac9c63bef83624111704d38cf217b0c1a4ece6df874e72a76e9fb1ffc3b";
const HISTORICAL_SNAPSHOT = "4035cd406a5db019c4f3b9122e0021b2fb3fcbb23e7e10b040333fdedeb41a22";
const CURRENT_SNAPSHOT = "7c7f47f40868f4879942406274b01710af74539d5b840f0edb18d24400ddbdf3";
const APPLICATION = "6692334b17fae5e26d973b92d6476a52d4f316489e085eba76971173f03f156f";
const PROPOSAL = "3c85fe2fc195d5a0c9de45b679f9ef3a5589f36f948ea4a8acc0720483a6dc9e";
const PREVIEW_LEDGER = "9294df7c63b535b292f163bc1bbc183883d05f7bd99329ed845db9d62e2e7a8c";
const PREPARED_EVENT = "2e369ed175bfbd2d2a9ae8cc35ab29a48afc7e25adbfc9591b0127fc2b3fb174";
const PREPARED_SNAPSHOT = "4e7e2ead4c466704ad0559fed73cc01cf028722d701ffe47669626858a96c8de";
const PREPARED_BUNDLE = "3198341aebdf82e95d8cd0de680a16553cf9c3b3c2e4fd4824d197de79aa6ef2";

assert(events.digestAlgorithm === "SHA-256" && events.canonicalization === "JSON_SORTED_KEYS_UTF8", "event digest policy changed");
assert(events.appendOnly === true, "event chain must remain append-only");
assert(events.events.length === 2 && events.eventCount === 2, "event chain must contain genesis plus one event");
assert(events.headSequence === 1 && events.canonicalBusinessEventCount === 1, "current chain counts are incorrect");
assert(events.headDigest === EVENT, "current event head digest changed");
assert(events.events[0].eventDigest === GENESIS && events.events[0].eventType === "GENESIS", "genesis was altered");
assert(events.events[1].eventId === "FARDARTER-CANONICAL-ISSUE-159-V6-5", "canonical event ID changed");
assert(events.events[1].idempotencyKey === "issue-159-fit-to-scope-canonical-v6-5", "canonical event idempotency changed");
assert(events.events[1].fromState === "FIT_APPROVED_FOR_SCOPE_DRAFT" && events.events[1].toState === "SCOPE_DRAFTED", "canonical transition changed");
assert(events.events[1].previousEventDigest === GENESIS, "canonical event is not linked to genesis");
assert(events.events[1].classification === "CANONICAL_BUSINESS_EVENT" && events.events[1].authorityGate === "JP_REVIEWED_MERGE", "canonical event authority changed");
assert(events.events[1].capacityEffect.activeDelta === 0 && events.events[1].capacityEffect.usesActiveCapacity === false, "canonical event capacity effect changed");
assert(events.events[1].financialEffect.createsOrder === false && events.events[1].financialEffect.grossRevenueDeltaUsd === 0 && events.events[1].financialEffect.settledCashDeltaUsd === 0, "canonical event financial effect changed");

const keys = new Set();
for (const [index, event] of events.events.entries()) {
  assert(event.sequence === index, `event sequence mismatch at ${index}`);
  assert(!keys.has(event.idempotencyKey), `duplicate idempotency key: ${event.idempotencyKey}`);
  keys.add(event.idempotencyKey);
  assert(event.previousEventDigest === (index === 0 ? null : events.events[index - 1].eventDigest), `previous digest mismatch at ${index}`);
  assert(digestWithout(event, "eventDigest") === event.eventDigest, `event digest mismatch at ${index}`);
  assert(event.canonical === true && event.publicSafe === true && event.sensitiveDataPresent === false, `event ${index} violates public/canonical boundary`);
}
assert(events.events[1].eventDigest === EVENT, "reviewed event digest is not locked");
assert(events.headDigest === events.events.at(-1).eventDigest, "head digest does not match last event");
assert(events.currentCanonicalCounts.SCOPE_DRAFTED === 1, "SCOPE_DRAFTED count must be one");
assert(Object.entries(events.currentCanonicalCounts).filter(([state]) => state !== "SCOPE_DRAFTED").every(([, value]) => value === 0), "all other canonical counts must remain zero");
assert(events.financialEvidence.orders === 0 && events.financialEvidence.verifiedGrossRevenueUsd === 0 && events.financialEvidence.verifiedSettledCashUsd === 0, "event chain claims money or orders");
assert(events.capacityEvidence.activeDeliveries === 0 && events.capacityEvidence.activeHeadroom === 100, "event chain capacity changed");
assert(eventSchema.properties?.canonical?.const === true && eventSchema.properties?.eventDigest?.pattern === "^[a-f0-9]{64}$", "event schema boundary changed");
assert(eventsSchema.properties?.chainId?.const === events.chainId, "event-chain schema ID changed");

assert(capacity.canonicalCapacity.totalPlanningSlots === 1000 && capacity.canonicalCapacity.effectiveActiveCeiling === 100, "capacity envelope changed");
assert(capacity.canonicalCapacity.activeDeliveries === 0 && capacity.canonicalCapacity.activeHeadroom === 100, "active capacity changed");
assert(capacity.canonicalCapacity.orders === 0, "capacity ledger claims an order");
assert(capacity.stateLedger.find((entry) => entry.state === "SCOPE_DRAFTED")?.canonicalCount === 1, "capacity ledger did not reconcile SCOPE_DRAFTED");
assert(capacity.stateLedger.reduce((sum, entry) => sum + entry.canonicalCount, 0) === 1, "capacity ledger canonical counts do not reconcile");
assert(capacity.stateLedger.find((entry) => entry.state === "SCOPE_DRAFTED")?.countsAsOrder === false, "SCOPE_DRAFTED cannot count as an order");
assert(capacity.financialEvidence.verifiedGrossRevenueUsd === 0 && capacity.financialEvidence.verifiedSettledCashUsd === 0 && capacity.financialEvidence.receivedCashRequires === "PAID_SETTLED", "capacity money boundary changed");

assert(digestWithout(historicalSnapshot, "snapshotDigest") === historicalSnapshot.snapshotDigest, "v6.3 historical snapshot digest changed");
assert(historicalSnapshot.snapshotDigest === HISTORICAL_SNAPSHOT && historicalSnapshot.sequence === 0, "v6.3 historical snapshot is not locked");
assert(digestWithout(proposalLedger, "ledgerDigest") === proposalLedger.ledgerDigest && proposalLedger.ledgerDigest === PROPOSAL, "proposal ledger digest changed");
assert(digestWithout(previewLedger, "ledgerDigest") === previewLedger.ledgerDigest && previewLedger.ledgerDigest === PREVIEW_LEDGER, "preview ledger digest changed");
assert(digestWithout(previewBundle.candidateEvent, "eventDigest") === previewBundle.candidateEvent.eventDigest && previewBundle.candidateEvent.eventDigest === PREPARED_EVENT, "prepared event digest changed");
assert(digestWithout(previewBundle.candidateReconciliation, "snapshotDigest") === previewBundle.candidateReconciliation.snapshotDigest && previewBundle.candidateReconciliation.snapshotDigest === PREPARED_SNAPSHOT, "prepared snapshot digest changed");
assert(digestWithout(previewBundle, "bundleDigest") === previewBundle.bundleDigest && previewBundle.bundleDigest === PREPARED_BUNDLE, "prepared bundle digest changed");
assert(previewBundle.candidateEvent.canonical === false && previewBundle.candidateEvent.applied === false, "historical preview must remain noncanonical");

assert(digestWithout(currentSnapshot, "snapshotDigest") === currentSnapshot.snapshotDigest, "v6.5 snapshot digest mismatch");
assert(currentSnapshot.snapshotDigest === CURRENT_SNAPSHOT && currentSnapshot.sequence === 1 && currentSnapshot.previousSnapshotDigest === HISTORICAL_SNAPSHOT, "v6.5 snapshot linkage changed");
assert(currentSnapshot.canonical.canonicalBusinessEventCount === 1 && currentSnapshot.canonical.stateCounts.SCOPE_DRAFTED === 1, "v6.5 snapshot canonical state changed");
assert(currentSnapshot.canonical.activeDeliveries === 0 && currentSnapshot.canonical.orders === 0 && currentSnapshot.canonical.verifiedSettledCashUsd === 0, "v6.5 snapshot claims commercial activity");
assert(currentSnapshot.application.eventDigest === EVENT && currentSnapshot.application.reviewStatus === "APPROVED_AND_APPLIED_TO_SOURCE", "v6.5 snapshot application changed");
assert(currentSnapshotSchema.properties?.snapshotDigest?.const === CURRENT_SNAPSHOT, "v6.5 snapshot schema digest changed");

assert(digestWithout(application, "applicationDigest") === application.applicationDigest, "application receipt digest mismatch");
assert(application.applicationDigest === APPLICATION, "application digest is not locked");
assert(application.source.entityIssue === 159 && application.source.proposalIssue === 162 && application.source.previewIssue === 167, "application source changed");
assert(application.review.decision === "APPROVED_FOR_REVIEWED_MERGE" && application.review.decisionMaker === "JP", "application review changed");
assert(application.canonicalEvent.sequence === 1 && application.canonicalEvent.eventDigest === EVENT && application.canonicalEvent.previousEventDigest === GENESIS, "application event linkage changed");
assert(application.canonicalEvent.canonical === true && application.canonicalEvent.applied === true, "application event is not applied canonical source");
assert(application.reconciliation.snapshotDigest === CURRENT_SNAPSHOT && application.reconciliation.previousSnapshotDigest === HISTORICAL_SNAPSHOT, "application snapshot linkage changed");
assert(application.previewEvidence.preparedCandidateEventDigest === PREPARED_EVENT && application.previewEvidence.runtimeCandidateEventDigest === "7190d54bcefbe94e28c000912e37085ff15edce05a60b65fb3b6f622a74846e9", "preview evidence changed");
assert(application.previewEvidence.runtimeDuplicateSuppressed === true, "runtime preview duplicate proof is missing");
assert(application.effects.stateCountDelta.SCOPE_DRAFTED === 1 && application.effects.activeDeliveryDelta === 0 && application.effects.orderDelta === 0 && application.effects.grossRevenueDeltaUsd === 0 && application.effects.settledCashDeltaUsd === 0, "application effects changed");
for (const [key, value] of Object.entries(application.evidenceBoundary)) {
  if (key === "receivedCashRequires") assert(value === "PAID_SETTLED", "cash gate changed");
  else assert(value === false, `${key} must remain false`);
}
assert(applicationSchema.properties?.applicationDigest?.const === APPLICATION, "application schema digest changed");
assert(applicationSchema.properties?.canonicalEvent?.properties?.eventDigest?.const === EVENT, "application schema event changed");

for (const title of [
  "Fardarter Drive™ v6.5 — Canonical Event Application Charter",
  "Fardarter Drive™ v6.5 — Canonical Event Application Register",
]) assert(gdrive.documents.some((document) => document.title === title), `Drive receipt missing: ${title}`);
assert(gdrive.documents.length >= 11, "Drive continuity must include eleven documents");
assert(gdrive.automation.maintainCanonicalEventApplications === true, "Drive application maintenance is missing");
assert(gdrive.automation.applyCanonicalEventWithoutReviewedMerge === false, "Drive cannot auto-apply canonical events");
assert(gdrive.privacyBoundary.canonicalApplicationEvidencePublic === false, "application evidence must remain private");
assert(gdriveSchema.properties?.documents?.minItems >= 11, "Drive schema must require v6.5 documents");

for (const required of ["FARDARTER-DRIVE-CANONICALIZATION-APPLICATION-V6-5.json", "FARDARTER-DRIVE-RECONCILIATION-V6-5.json", "headSequence", "SCOPE_DRAFTED", "laterStateChangeRequiresNewAppendOnlyEvent", "PAID_SETTLED"]) assert(text.operationsApi.includes(required), `operations API missing: ${required}`);
for (const required of ["historicalReconciliation", "FARDARTER-DRIVE-RECONCILIATION-V6-5.json", "canonicalBusinessEventCount === 1", "reviewedApplicationCreatesOrder: false"]) assert(text.reconciliationApi.includes(required), `reconciliation API missing: ${required}`);
for (const required of ["reviewedApplication", "historicalReconciliation", "currentReconciliation", "applicationWasReviewedMerge: true", "laterApplicationRequiresNewReviewedMerge: true"]) assert(text.previewApi.includes(required), `preview API missing: ${required}`);
for (const required of ["applicationDigest", "chainHealthy", "correctionRequiresNewEvent", "deploymentReadbackRequiredForPublicLiveClaim"]) assert(text.applicationApi.includes(required), `application API missing: ${required}`);
for (const [label, source, required] of [
  ["operations page", text.operationsPage, ["Fardarter Drive™ v6.5", "SCOPE_DRAFTED", "Later changes require a new event"]],
  ["reconciliation page", text.reconciliationPage, ["Historical snapshot, current reconciliation", "Reviewed merge applied", "PAID_SETTLED"]],
  ["preview page", text.previewPage, ["Historical preview, reviewed application", "Preview digest reused as canonical digest: FALSE"]],
  ["application page", text.applicationPage, ["Reviewed canonicalization application", "Append-only recovery", "Indemnity-proof result: FALSE"]],
]) for (const value of required) assert(source.includes(value), `${label} missing: ${value}`);

assert(packageJson.scripts["fardarter:current:check"] === "node scripts/check-fardarter-reviewed-canonicalization-v6-5.mjs", "current verifier package command is missing");
assert(packageJson.scripts["fardarter:state:check"] === "npm run fardarter:current:check", "state alias is stale");
assert(packageJson.scripts["fardarter:reconciliation:check"] === "npm run fardarter:current:check", "reconciliation alias is stale");
assert(packageJson.scripts["fardarter:preview:check"] === "npm run fardarter:current:check", "preview alias is stale");
assert(packageJson.scripts["revenue:verify"].includes("fardarter:current:check"), "unified verifier does not run v6.5 current check");

for (const required of ["FARDARTER-DRIVE-CANONICALIZATION-APPLICATION-V6-5.json", "FARDARTER-DRIVE-RECONCILIATION-V6-5.json", EVENT, CURRENT_SNAPSHOT, APPLICATION, "canonical_business_events=1", "scope_drafted=1"]) assert(text.revenueWorkflow.includes(required), `revenue workflow missing: ${required}`);
for (const required of ["api/revenue/canonicalization-application", EVENT, CURRENT_SNAPSHOT, APPLICATION, "SCOPE_DRAFTED", "canonicalBusinessEventCount === 1"]) assert(text.applicationReadback.includes(required), `application readback missing: ${required}`);
assert(text.netlifyWorkflow.includes("app/api/revenue/**"), "Netlify workflow must cover all revenue APIs");
assert(text.sitemap.includes("/github-control-tower-audit/canonicalization-application"), "sitemap is missing the v6.5 application page");
for (const required of ["3859eac9", "7c7f47f4", "6692334b", "zero orders", "append-only"]) assert(text.operatingDoc.includes(required), `v6.5 operating document missing: ${required}`);

const forbidden = /(?:drive\.google\.com|docs\.google\.com|providerTransactionId|routingNumber|bankAccount|privateKey|customerEmail|customerName)/i;
for (const [label, value] of [
  ["events", text.events],
  ["current snapshot", text.currentSnapshot],
  ["application", text.application],
  ["operations API", text.operationsApi],
  ["reconciliation API", text.reconciliationApi],
  ["preview API", text.previewApi],
  ["application API", text.applicationApi],
]) assert(!forbidden.test(value), `${label} exposes a forbidden private reference or field`);

console.log("Fardarter Drive v6.5 reviewed canonicalization: PASS");
console.log(`Canonical event: 1 / ${EVENT}`);
console.log(`Reconciliation: 1 / ${CURRENT_SNAPSHOT}`);
console.log(`Application: ${APPLICATION}`);
console.log("Canonical state: SCOPE_DRAFTED=1 / ACTIVE=0 / orders=0 / settled=$0");
