import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const paths = {
  ledger: "receipts/revenue/FARDARTER-DRIVE-CANONICALIZATION-PREVIEWS-V6-4.json",
  ledgerSchema: "schemas/revenue/fardarter-drive-canonicalization-previews-v6-4.schema.json",
  bundle: "receipts/revenue/FARDARTER-DRIVE-CANONICALIZATION-REVIEW-BUNDLE-V6-4.sample.json",
  bundleSchema: "schemas/revenue/fardarter-drive-canonicalization-review-bundle-v6-4.schema.json",
  events: "receipts/revenue/FARDARTER-DRIVE-STATE-EVENTS-V6-2.json",
  proposals: "receipts/revenue/FARDARTER-DRIVE-EVENT-PROPOSALS-V6-3.json",
  reconciliation: "receipts/revenue/FARDARTER-DRIVE-RECONCILIATION-V6-3.json",
  capacity: "receipts/revenue/FARDARTER-DRIVE-CAPACITY-LEDGER-V6-1.json",
  gdrive: "receipts/revenue/FARDARTER-DRIVE-GDRIVE-V6.json",
  gdriveSchema: "schemas/revenue/fardarter-drive-gdrive-v6.schema.json",
  form: ".github/ISSUE_TEMPLATE/fardarter-canonicalization-preview.yml",
  workflow: ".github/workflows/fardarter-canonicalization-preview-v6-4.yml",
  readback: ".github/workflows/fardarter-canonicalization-preview-readback-v6-4.yml",
  api: "app/api/revenue/canonicalization-preview/route.ts",
  dashboard: "app/github-control-tower-audit/canonicalization-preview/page.tsx",
  publicLedger: "src/lib/revenue/public-canonicalization-preview.ts",
  operatingDoc: "docs/repository/FARDARTER-DRIVE-V6-4-CANONICALIZATION-PREVIEW.md",
  package: "package.json",
  revenueWorkflow: ".github/workflows/revenue-experiment.yml",
  sitemap: "app/sitemap.ts",
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

const ledger = parse(text.ledger, "preview ledger");
const ledgerSchema = parse(text.ledgerSchema, "preview-ledger schema");
const bundle = parse(text.bundle, "review bundle");
const bundleSchema = parse(text.bundleSchema, "review-bundle schema");
const events = parse(text.events, "canonical event chain");
const proposals = parse(text.proposals, "proposal ledger");
const reconciliation = parse(text.reconciliation, "reconciliation snapshot");
const capacity = parse(text.capacity, "capacity ledger");
const gdrive = parse(text.gdrive, "Google Drive continuity");
const gdriveSchema = parse(text.gdriveSchema, "Google Drive schema");
const packageJson = parse(text.package, "package.json");

const lifecycle = [
  "PREPARED",
  "PREVIEW_READY",
  "BLOCKED",
  "EXPIRED",
  "REJECTED",
  "APPLIED_BY_REVIEWED_MERGE",
];
const expectedStates = [
  "REQUESTED",
  "FIT_APPROVED_FOR_SCOPE_DRAFT",
  "SCOPE_DRAFTED",
  "HUMAN_ACCEPTED",
  "PAID_PENDING",
  "PAID_SETTLED",
  "WORK_START_APPROVED",
  "ACTIVE",
  "DELIVERED",
  "ACCEPTED",
  "CANCELLED",
  "REFUNDED",
  "DISPUTED",
];

assert(ledger.schemaVersion === "1.0.0", "preview-ledger schema version is incorrect");
assert(ledger.previewLedgerId === "FARDARTER-DRIVE-CANONICALIZATION-PREVIEWS-V6-4", "preview-ledger ID is incorrect");
assert(ledger.driveId === "FARDARTER-DRIVE-V6", "drive ID changed");
assert(ledger.controllerVersion === "6.4.0" && ledger.controllingIssue === 165, "preview controller identity is incorrect");
assert(ledger.canonicalHead.sequence === events.headSequence, "preview ledger canonical sequence drifted");
assert(ledger.canonicalHead.digest === events.headDigest, "preview ledger canonical digest drifted");
assert(ledger.canonicalHead.canonicalBusinessEventCount === events.canonicalBusinessEventCount, "preview ledger canonical event count drifted");
assert(ledger.proposalLedgerDigest === proposals.ledgerDigest, "proposal-ledger digest mismatch");
assert(ledger.reconciliationDigest === reconciliation.snapshotDigest, "reconciliation digest mismatch");
assert(ledger.lifecycle.join(",") === lifecycle.join(","), "preview lifecycle is incorrect");
assert(ledger.previewCount === ledger.bundles.length && ledger.previewCount === 1, "preview count must equal the one prepared bundle");
assert(Object.values(ledger.decisionCounts).reduce((sum, value) => sum + value, 0) === ledger.previewCount, "preview decision counts do not reconcile");
assert(ledger.decisionCounts.PREPARED === 1 && Object.entries(ledger.decisionCounts).filter(([key]) => key !== "PREPARED").every(([, value]) => value === 0), "prepared ledger baseline is incorrect");
assert(ledger.applicationPolicy.automaticCanonicalization === false, "automatic canonicalization must be disabled");
assert(ledger.applicationPolicy.reviewedMergeRequired === true, "reviewed merge gate is missing");
assert(ledger.applicationPolicy.recomputeDigestsAtMerge === true, "merge digest recomputation is missing");
assert(ledger.applicationPolicy.reconcileCountsCapacityMoney === true, "merge reconciliation is missing");
assert(ledger.applicationPolicy.immutableReadbackRequired === true, "immutable readback gate is missing");
assert(digestWithout(ledger, "ledgerDigest") === ledger.ledgerDigest, "preview-ledger digest mismatch");
assert(ledger.ledgerDigest === "9294df7c63b535b292f163bc1bbc183883d05f7bd99329ed845db9d62e2e7a8c", "preview-ledger digest is not locked");
assert(ledgerSchema.properties?.ledgerDigest?.const === ledger.ledgerDigest, "preview schema must lock the ledger digest");

assert(bundle.schemaVersion === "1.0.0", "bundle schema version is incorrect");
assert(bundle.bundleId === "FARDARTER-CANONICALIZATION-BUNDLE-ISSUE-162-V6-4", "bundle ID is incorrect");
assert(bundle.controllerVersion === "6.4.0" && bundle.controllingIssue === 165, "bundle controller identity is incorrect");
assert(bundle.state === "PREPARED" && bundle.expectedDecision === "PREVIEW_READY", "bundle preparation state is incorrect");
assert(bundle.source.proposalIssue === 162 && bundle.source.entityIssue === 159, "bundle source issues are incorrect");
assert(bundle.source.proposalDecision === "READY_FOR_REVIEW", "source proposal must remain ready for review");
assert(bundle.source.expectedPublicState === "FIT_APPROVED_FOR_SCOPE_DRAFT", "source public state is incorrect");
assert(bundle.source.proposalLedgerDigest === proposals.ledgerDigest, "bundle proposal digest mismatch");
assert(bundle.source.reconciliationDigest === reconciliation.snapshotDigest, "bundle reconciliation digest mismatch");
assert(bundle.source.canonicalHeadSequence === events.headSequence && bundle.source.canonicalHeadDigest === events.headDigest, "bundle canonical head mismatch");

const event = bundle.candidateEvent;
assert(event.sequence === events.headSequence + 1, "candidate event sequence must be canonical head plus one");
assert(event.previousEventDigest === events.headDigest, "candidate previous digest must equal the canonical head");
assert(event.eventType === "STATE_CANONICALIZATION_PREVIEW", "candidate event type is incorrect");
assert(event.fromState === "FIT_APPROVED_FOR_SCOPE_DRAFT" && event.toState === "SCOPE_DRAFTED", "candidate transition is incorrect");
assert(event.canonical === false && event.applied === false, "candidate event must remain noncanonical and unapplied");
assert(event.publicSafe === true && event.sensitiveDataPresent === false, "candidate event violates public/private boundary");
assert(event.capacityEffect.usesActiveCapacity === false && event.capacityEffect.activeDelta === 0, "candidate event must not consume capacity");
assert(event.financialEffect.createsOrder === false, "candidate event must not create an order");
assert(event.financialEffect.grossRevenueDeltaUsd === 0 && event.financialEffect.settledCashDeltaUsd === 0, "candidate event money deltas must remain zero");
assert(digestWithout(event, "eventDigest") === event.eventDigest, "candidate event digest mismatch");
assert(event.eventDigest === "2e369ed175bfbd2d2a9ae8cc35ab29a48afc7e25adbfc9591b0127fc2b3fb174", "candidate event digest is not locked");

assert(Object.keys(bundle.candidateProjection.stateCounts).join(",") === expectedStates.join(","), "candidate state-count key order changed");
assert(bundle.candidateProjection.stateCounts.SCOPE_DRAFTED === 1, "candidate projection must place one entity in SCOPE_DRAFTED");
assert(Object.entries(bundle.candidateProjection.stateCounts).filter(([state]) => state !== "SCOPE_DRAFTED").every(([, value]) => value === 0), "all other candidate state counts must remain zero");
assert(bundle.candidateProjection.activeDeliveries === 0 && bundle.candidateProjection.activeHeadroom === 100, "candidate active-capacity projection is incorrect");
assert(bundle.candidateProjection.orders === 0 && bundle.candidateProjection.verifiedGrossRevenueUsd === 0 && bundle.candidateProjection.verifiedSettledCashUsd === 0, "candidate commercial projection must remain zero");
assert(bundle.evidenceMatrix.length >= 4 && bundle.authorityMatrix.length >= 6, "bundle matrices are incomplete");
assert(bundle.evidenceMatrix.some((row) => row.classification === "PRIVATE" && row.privateLocationRequired === true), "bundle must preserve a private evidence row");
assert(bundle.authorityMatrix.some((row) => row.gate === "CANONICAL_EVENT_APPEND" && row.status === "NOT_AUTHORIZED_BY_PREVIEW"), "canonical append gate is missing");
assert(bundle.review.unresolvedBlockers.includes("NO_REVIEWED_CANONICALIZATION_MERGE"), "reviewed-merge blocker is missing");

const candidateSnapshot = bundle.candidateReconciliation;
assert(candidateSnapshot.sequence === reconciliation.sequence + 1, "candidate snapshot sequence must be previous snapshot plus one");
assert(candidateSnapshot.previousSnapshotDigest === reconciliation.snapshotDigest, "candidate previous snapshot digest mismatch");
assert(candidateSnapshot.sourceEvent.eventDigest === event.eventDigest && candidateSnapshot.sourceEvent.applied === false, "candidate snapshot source-event boundary is incorrect");
assert(candidateSnapshot.canonicalProjection.currentHeadSequence === events.headSequence && candidateSnapshot.canonicalProjection.currentHeadDigest === events.headDigest, "candidate snapshot current head mismatch");
assert(candidateSnapshot.canonicalProjection.candidateHeadSequence === event.sequence && candidateSnapshot.canonicalProjection.candidateHeadDigest === event.eventDigest, "candidate snapshot projected head mismatch");
assert(candidateSnapshot.canonicalProjection.canonicalBusinessEventCountIfApplied === 1, "candidate snapshot business-event count is incorrect");
assert(candidateSnapshot.canonicalProjection.totalPlanningSlots === 1000 && candidateSnapshot.canonicalProjection.effectiveActiveCeiling === 100, "candidate snapshot capacity baseline is incorrect");
assert(candidateSnapshot.canonicalProjection.activeDeliveriesIfApplied === 0 && candidateSnapshot.canonicalProjection.activeHeadroomIfApplied === 100, "candidate snapshot active projection is incorrect");
assert(candidateSnapshot.canonicalProjection.ordersIfApplied === 0 && candidateSnapshot.canonicalProjection.verifiedGrossRevenueUsdIfApplied === 0 && candidateSnapshot.canonicalProjection.verifiedSettledCashUsdIfApplied === 0, "candidate snapshot money projection is incorrect");
assert(candidateSnapshot.canonicalProjection.receivedCashRequires === "PAID_SETTLED", "candidate snapshot cash gate is incorrect");
assert(candidateSnapshot.reviewStatus === "PREVIEW_ONLY_NOT_APPLIED", "candidate snapshot review state is incorrect");
assert(digestWithout(candidateSnapshot, "snapshotDigest") === candidateSnapshot.snapshotDigest, "candidate snapshot digest mismatch");
assert(candidateSnapshot.snapshotDigest === "4e7e2ead4c466704ad0559fed73cc01cf028722d701ffe47669626858a96c8de", "candidate snapshot digest is not locked");

assert(bundle.applicationBoundary.previewCreatesCanonicalEvent === false, "bundle cannot create a canonical event");
assert(bundle.applicationBoundary.previewCreatesOrder === false && bundle.applicationBoundary.previewCreatesContract === false, "bundle cannot create commercial obligations");
assert(bundle.applicationBoundary.previewProvesPayment === false && bundle.applicationBoundary.previewStartsPaidWork === false, "bundle cannot prove payment or start work");
assert(bundle.applicationBoundary.applicationRequiresReviewedMerge === true && bundle.applicationBoundary.canonicalSourceChanged === false, "bundle application boundary is incorrect");
assert(Object.values(bundle.privacyBoundary).every((value) => value === false), "bundle privacy boundary must expose nothing");
assert(digestWithout(bundle, "bundleDigest") === bundle.bundleDigest, "review-bundle digest mismatch");
assert(bundle.bundleDigest === "3198341aebdf82e95d8cd0de680a16553cf9c3b3c2e4fd4824d197de79aa6ef2", "review-bundle digest is not locked");
assert(ledger.bundles[0].bundleDigest === bundle.bundleDigest, "ledger bundle reference mismatch");
assert(bundleSchema.properties?.candidateEvent?.properties?.canonical?.const === false, "bundle schema must prohibit canonical candidates");
assert(bundleSchema.properties?.applicationBoundary?.properties?.applicationRequiresReviewedMerge?.const === true, "bundle schema must require reviewed merge");

assert(events.headSequence === 0 && events.canonicalBusinessEventCount === 0 && events.eventCount === 1, "canonical event chain must remain genesis-only");
assert(events.headDigest === "4c401dd352d4263786ac22072d616f67775761656a771ea8815e4623a7a3975b", "canonical head digest changed");
assert(Object.values(events.currentCanonicalCounts).every((value) => value === 0), "current canonical state counts must remain zero");
assert(capacity.canonicalCapacity.totalPlanningSlots === 1000 && capacity.canonicalCapacity.effectiveActiveCeiling === 100, "canonical capacity changed");
assert(capacity.canonicalCapacity.activeDeliveries === 0 && capacity.canonicalCapacity.orders === 0, "canonical activity changed");
assert(capacity.financialEvidence.verifiedGrossRevenueUsd === 0 && capacity.financialEvidence.verifiedSettledCashUsd === 0, "canonical money changed");

for (const title of [
  "Fardarter Drive™ v6.4 — Canonicalization Preview and Review Charter",
  "Fardarter Drive™ v6.4 — Canonicalization Review Bundle Register",
]) {
  assert(gdrive.documents.some((document) => document.title === title), `Drive receipt missing: ${title}`);
}
assert(gdrive.documents.length >= 9, "Drive continuity must include at least nine documents");
assert(gdrive.automation.maintainCanonicalizationPreviews === true, "Drive preview automation is missing");
assert(gdrive.automation.maintainCanonicalizationReviewBundles === true, "Drive review-bundle automation is missing");
assert(gdrive.automation.applyCanonicalEventWithoutReviewedMerge === false, "Drive automation must not apply canonical events");
assert(gdrive.privacyBoundary.canonicalizationPreviewEvidencePublic === false && gdrive.privacyBoundary.reviewBundleEvidencePublic === false && gdrive.privacyBoundary.privateReviewDeliberationsPublic === false, "v6.4 private evidence must remain private");
assert(gdriveSchema.properties?.documents?.minItems >= 9, "Drive schema must require v6.4 documents");

for (const required of ["[FD preview]:", "Source READY_FOR_REVIEW proposal issue", "Review bundle ID", "Public-safe preview idempotency key", "PREVIEW_READY", "BLOCKED", "PAID_SETTLED"]) {
  assert(text.form.includes(required), `preview form missing: ${required}`);
}
for (const required of ["opened", "edited", "reopened", "labeled", "fd-preview-approved-v6-4", "jp-fardarter-preview-v6-4-", "Duplicate preview suppressed", "PREVIEW_READY", "BLOCKED", "stableStringify", "digestWithout", "contents: read", "issues: write", "GENESIS_ONLY"]) {
  assert(text.workflow.includes(required), `preview workflow missing: ${required}`);
}
assert(!text.workflow.includes("contents: write"), "preview workflow must not write canonical source");
assert(text.workflow.indexOf("comments.some") < text.workflow.indexOf("fd-preview-ready"), "preview idempotency guard must precede ready mutation");
assert(text.workflow.indexOf("comments.some") < text.workflow.indexOf("fd-preview-blocked"), "preview idempotency guard must precede blocked mutation");
assert(text.workflow.indexOf("!title.startsWith('[FD preview]:')") < text.workflow.indexOf("const section"), "preview qualification must precede parsing");

for (const required of ["FARDARTER-DRIVE-CANONICALIZATION-PREVIEWS-V6-4.json", "FARDARTER-DRIVE-CANONICALIZATION-REVIEW-BUNDLE-V6-4.sample.json", "getPublicCanonicalizationPreviewCounts", "preparedBundleIsCanonical: false", "applicationRequiresReviewedMerge: true", "receivedCashRequires: \"PAID_SETTLED\""]) {
  assert(text.api.includes(required), `preview API missing: ${required}`);
}
for (const required of ["Fardarter Drive™ v6.4", "Canonicalization preview", "Candidate sequence", "PREVIEW_READY", "Create preview request", "Canonical source changed"] ) {
  assert(text.dashboard.includes(required), `preview dashboard missing: ${required}`);
}
for (const required of ["openPreviewRequests", "previewReady", "blocked", "needsReview", "countsAreCanonicalEvidence: false", "countsAreCommercialEvidence: false", "UNAVAILABLE"]) {
  assert(text.publicLedger.includes(required), `public preview ledger missing: ${required}`);
}
assert(text.operatingDoc.includes("A preview never creates an order"), "operating document must preserve zero-effect boundary");
assert(text.operatingDoc.includes("Candidate event       2e369ed1"), "operating document must record the candidate digest");
assert(text.sitemap.includes("/github-control-tower-audit/canonicalization-preview"), "sitemap must include preview dashboard");

assert(packageJson.scripts["fardarter:preview:check"] === "node scripts/check-fardarter-canonicalization-preview-v6-4.mjs", "package preview script is missing");
assert(packageJson.scripts["revenue:verify"].includes("fardarter:preview:check"), "unified verifier must include preview check");
assert(text.revenueWorkflow.includes("FARDARTER-DRIVE-CANONICALIZATION-PREVIEWS-V6-4.json"), "revenue workflow must validate the preview ledger");
assert(text.revenueWorkflow.includes("FARDARTER-DRIVE-CANONICALIZATION-REVIEW-BUNDLE-V6-4.sample.json"), "revenue workflow must validate the review bundle");
for (const required of ["api/revenue/canonicalization-preview", "9294df7c63b535b292f163bc1bbc183883d05f7bd99329ed845db9d62e2e7a8c", "3198341aebdf82e95d8cd0de680a16553cf9c3b3c2e4fd4824d197de79aa6ef2", "2e369ed175bfbd2d2a9ae8cc35ab29a48afc7e25adbfc9591b0127fc2b3fb174", "4e7e2ead4c466704ad0559fed73cc01cf028722d701ffe47669626858a96c8de", "PREVIEW_READY", "BLOCKED"]) {
  assert(text.readback.includes(required), `preview readback missing: ${required}`);
}

const forbidden = /(?:drive\.google\.com|docs\.google\.com|providerTransactionId|routingNumber|bankAccount|privateKey|customerEmail|customerName)/i;
for (const [label, value] of [
  ["ledger", text.ledger],
  ["bundle", text.bundle],
  ["api", text.api],
  ["workflow", text.workflow],
  ["dashboard", text.dashboard],
]) {
  assert(!forbidden.test(value), `${label} exposes a forbidden private reference or field`);
}

console.log("Fardarter Drive v6.4 canonicalization preview: PASS");
console.log(`Candidate event digest: ${event.eventDigest}`);
console.log(`Candidate snapshot digest: ${candidateSnapshot.snapshotDigest}`);
console.log(`Review bundle digest: ${bundle.bundleDigest}`);
console.log(`Preview ledger digest: ${ledger.ledgerDigest}`);
console.log("Canonical business events: 0 / active: 0 / orders: 0 / settled cash: $0");
