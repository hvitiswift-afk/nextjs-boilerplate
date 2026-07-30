import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const paths = {
  proposals: "receipts/revenue/FARDARTER-DRIVE-EVENT-PROPOSALS-V6-3.json",
  proposalSchema: "schemas/revenue/fardarter-drive-event-proposal-v6-3.schema.json",
  proposalsSchema: "schemas/revenue/fardarter-drive-event-proposals-v6-3.schema.json",
  snapshot: "receipts/revenue/FARDARTER-DRIVE-RECONCILIATION-V6-3.json",
  snapshotSchema: "schemas/revenue/fardarter-drive-reconciliation-v6-3.schema.json",
  machine: "receipts/revenue/FARDARTER-DRIVE-STATE-MACHINE-V6-2.json",
  events: "receipts/revenue/FARDARTER-DRIVE-STATE-EVENTS-V6-2.json",
  capacity: "receipts/revenue/FARDARTER-DRIVE-CAPACITY-LEDGER-V6-1.json",
  gdrive: "receipts/revenue/FARDARTER-DRIVE-GDRIVE-V6.json",
  gdriveSchema: "schemas/revenue/fardarter-drive-gdrive-v6.schema.json",
  proposalForm: ".github/ISSUE_TEMPLATE/fardarter-event-proposal.yml",
  proposalWorkflow: ".github/workflows/fardarter-event-proposal-v6-3.yml",
  reconciliationWorkflow: ".github/workflows/fardarter-reconciliation-v6-3.yml",
  readbackWorkflow: ".github/workflows/fardarter-reconciliation-readback-v6-3.yml",
  api: "app/api/revenue/reconciliation/route.ts",
  dashboard: "app/github-control-tower-audit/reconciliation/page.tsx",
  publicLedger: "src/lib/revenue/public-reconciliation-ledger.ts",
  operatingDoc: "docs/repository/FARDARTER-DRIVE-V6-3-RECONCILIATION.md",
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

const proposals = parse(text.proposals, "proposal ledger");
const proposalSchema = parse(text.proposalSchema, "proposal schema");
const proposalsSchema = parse(text.proposalsSchema, "proposal-ledger schema");
const snapshot = parse(text.snapshot, "reconciliation snapshot");
const snapshotSchema = parse(text.snapshotSchema, "reconciliation schema");
const machine = parse(text.machine, "state machine");
const events = parse(text.events, "event chain");
const capacity = parse(text.capacity, "capacity ledger");
const gdrive = parse(text.gdrive, "Google Drive continuity");
const gdriveSchema = parse(text.gdriveSchema, "Google Drive schema");
const packageJson = parse(text.package, "package.json");

const lifecycle = [
  "PROPOSED",
  "READY_FOR_REVIEW",
  "QUARANTINED",
  "REJECTED",
  "CANONICALIZED_BY_REVIEWED_MERGE",
];
const states = machine.states.map((state) => state.stateId);

assert(proposals.schemaVersion === "1.0.0", "proposal ledger schema version is incorrect");
assert(proposals.proposalLedgerId === "FARDARTER-DRIVE-EVENT-PROPOSALS-V6-3", "proposal ledger ID is incorrect");
assert(proposals.controllerVersion === "6.3.0" && proposals.controllingIssue === 160, "proposal controller is incorrect");
assert(proposals.canonicalHead.chainId === events.chainId, "proposal ledger chain reference is incorrect");
assert(proposals.canonicalHead.sequence === 0 && proposals.canonicalHead.digest === events.headDigest, "proposal canonical head is incorrect");
assert(proposals.canonicalHead.canonicalBusinessEventCount === 0, "proposal ledger must preserve genesis-only chain");
assert(proposals.lifecycle.join(",") === lifecycle.join(","), "proposal lifecycle is incorrect");
assert(proposals.proposalCount === proposals.proposals.length, "proposal count mismatch");
assert(Object.values(proposals.decisionCounts).reduce((sum, value) => sum + value, 0) === proposals.proposalCount, "proposal decision counts do not reconcile");
assert(proposals.proposalCount === 0, "baseline proposal ledger must be empty");
assert(digestWithout(proposals, "ledgerDigest") === proposals.ledgerDigest, "proposal ledger digest mismatch");
assert(proposals.ledgerDigest === "3c85fe2fc195d5a0c9de45b679f9ef3a5589f36f948ea4a8acc0720483a6dc9e", "proposal ledger digest is not locked");
assert(proposals.quarantinePolicy.freezeCanonicalMutation === true, "quarantine must freeze canonical mutation");
assert(proposals.quarantinePolicy.canonicalEventMayBeAppendedByWorkflow === false, "workflow must not append canonical events");
assert(proposals.evidenceBoundary.canonicalizationRequiresReviewedMerge === true, "reviewed merge gate is missing");
assert(proposals.evidenceBoundary.receivedCashRequires === "PAID_SETTLED", "cash gate is incorrect");
assert(proposalsSchema.properties?.proposalLedgerId?.const === proposals.proposalLedgerId, "proposal schema must lock ledger ID");
assert(proposalsSchema.properties?.ledgerDigest?.const === proposals.ledgerDigest, "proposal schema must lock ledger digest");
assert(proposalSchema.properties?.canonical?.const === false, "individual proposal must be noncanonical");
assert(proposalSchema.properties?.proposalDigest?.pattern === "^[a-f0-9]{64}$", "proposal digest must be SHA-256");

assert(snapshot.schemaVersion === "1.0.0", "snapshot schema version is incorrect");
assert(snapshot.snapshotId === "FARDARTER-RECONCILIATION-GENESIS-V6-3", "snapshot ID is incorrect");
assert(snapshot.sequence === 0 && snapshot.previousSnapshotDigest === null, "genesis snapshot linkage is incorrect");
assert(snapshot.controllerVersion === "6.3.0" && snapshot.controllingIssue === 160, "snapshot controller is incorrect");
assert(digestWithout(snapshot, "snapshotDigest") === snapshot.snapshotDigest, "snapshot digest mismatch");
assert(snapshot.snapshotDigest === "4035cd406a5db019c4f3b9122e0021b2fb3fcbb23e7e10b040333fdedeb41a22", "snapshot digest is not locked");
assert(snapshot.sources.stateMachine.blob === "43aa8859d04bf0242c33851cc51e283c02ad5cdc", "state-machine blob reference changed");
assert(snapshot.sources.eventChain.blob === "3a2e915b13387e47b732da2c6772d30f1838d7e2", "event-chain blob reference changed");
assert(snapshot.sources.capacityLedger.blob === "0fb885bf155dc2bd491f898e8a65697f404e35c2", "capacity-ledger blob reference changed");
assert(snapshot.sources.proposalLedger.ledgerDigest === proposals.ledgerDigest, "snapshot proposal digest mismatch");
assert(snapshot.sources.eventChain.headDigest === events.headDigest && snapshot.sources.eventChain.headSequence === events.headSequence, "snapshot event head mismatch");
assert(snapshot.canonical.eventChainHealthy === true && snapshot.canonical.canonicalBusinessEventCount === 0, "snapshot chain baseline is incorrect");
assert(Object.values(snapshot.canonical.stateCounts).every((value) => value === 0), "snapshot canonical counts must remain zero");
assert(snapshot.canonical.totalPlanningSlots === 1000 && snapshot.canonical.effectiveActiveCeiling === 100, "snapshot capacity is incorrect");
assert(snapshot.canonical.activeDeliveries === 0 && snapshot.canonical.activeHeadroom === 100, "snapshot active state is incorrect");
assert(snapshot.canonical.orders === 0 && snapshot.canonical.verifiedGrossRevenueUsd === 0 && snapshot.canonical.verifiedSettledCashUsd === 0, "snapshot money must remain zero");
assert(snapshot.canonical.receivedCashRequires === "PAID_SETTLED", "snapshot cash gate is incorrect");
assert(snapshot.proposals.proposalCount === 0 && snapshot.conflicts.total === 0, "snapshot proposal/conflict baseline is incorrect");
assert(snapshot.deployment.state === "UNVERIFIED", "snapshot deployment must remain unverified");
assert(snapshot.reviewStatus === "PREPARED_NOT_MERGED", "snapshot review status is incorrect");
assert(snapshotSchema.properties?.snapshotDigest?.const === snapshot.snapshotDigest, "snapshot schema must lock digest");

assert(events.headSequence === 0 && events.canonicalBusinessEventCount === 0, "canonical chain must remain genesis-only");
assert(events.headDigest === "4c401dd352d4263786ac22072d616f67775761656a771ea8815e4623a7a3975b", "canonical head digest changed");
assert(capacity.canonicalCapacity.totalPlanningSlots === 1000, "capacity must remain 1,000");
assert(capacity.canonicalCapacity.effectiveActiveCeiling === 100, "effective ACTIVE ceiling must remain 100");
assert(capacity.canonicalCapacity.activeDeliveries === 0 && capacity.canonicalCapacity.orders === 0, "canonical activity must remain zero");
assert(capacity.financialEvidence.verifiedGrossRevenueUsd === 0 && capacity.financialEvidence.verifiedSettledCashUsd === 0, "canonical money must remain zero");
assert(states.length === 13, "state machine must contain 13 states");

for (const title of [
  "Fardarter Drive™ v6.3 — Event Proposal and Reconciliation Charter",
  "Fardarter Drive™ v6.3 — Proposal Quarantine and Reconciliation Register",
]) {
  assert(gdrive.documents.some((document) => document.title === title), `Drive receipt missing: ${title}`);
}
assert(gdrive.documents.length >= 7, "Drive continuity must contain at least seven documents");
assert(gdrive.automation.maintainProposalReconciliation === true, "proposal reconciliation automation is missing");
assert(gdrive.automation.maintainProposalQuarantineRegister === true, "proposal quarantine automation is missing");
assert(gdrive.privacyBoundary.proposalEvidencePublic === false && gdrive.privacyBoundary.quarantineEvidencePublic === false, "proposal/quarantine evidence must remain private");
assert(gdriveSchema.properties?.documents?.minItems >= 7, "Drive schema must require v6.3 documents");

for (const required of ["[FD event proposal]:", "Public-safe idempotency key", "READY_FOR_REVIEW", "QUARANTINED", "PAID_SETTLED"]) {
  assert(text.proposalForm.includes(required), `proposal form missing: ${required}`);
}
for (const required of ["jp-fardarter-proposal-v6-3-", "Duplicate proposal suppressed", "READY_FOR_REVIEW", "QUARANTINED", "GENESIS_ONLY", "contents: read", "issues: write"]) {
  assert(text.proposalWorkflow.includes(required), `proposal workflow missing: ${required}`);
}
assert(!text.proposalWorkflow.includes("contents: write"), "proposal workflow must not write canonical source");
assert(text.proposalWorkflow.indexOf("comments.some") < text.proposalWorkflow.indexOf("fd-proposal-ready-for-review"), "proposal idempotency guard must precede decision mutation");
for (const required of ["schedule:", "fardarter-reconciliation-runtime-v6-3.json", "DUPLICATE_PROPOSAL_KEY", "PUBLIC_CANONICAL_DRIFT", "ACTIVE_CAPACITY_OVERFLOW", "BROKEN_EVENT_CHAIN", "canonicalBusinessEventCount"]) {
  assert(text.reconciliationWorkflow.includes(required), `reconciliation workflow missing: ${required}`);
}
assert(!text.reconciliationWorkflow.includes("contents: write"), "reconciliation workflow must remain source read-only");

for (const required of ["FARDARTER-DRIVE-EVENT-PROPOSALS-V6-3.json", "FARDARTER-DRIVE-RECONCILIATION-V6-3.json", "getPublicReconciliationSignals", "proposalMayBecomeCanonicalAutomatically: false", "canonicalEventRequiresReviewedMerge: true", "receivedCashRequires: \"PAID_SETTLED\""]) {
  assert(text.api.includes(required), `reconciliation API missing: ${required}`);
}
for (const required of ["Fardarter Drive™ v6.3", "READY_FOR_REVIEW", "QUARANTINED", "CANONICALIZED_BY_REVIEWED_MERGE", "GENESIS_ONLY", "Create event proposal"]) {
  assert(text.dashboard.includes(required), `reconciliation dashboard missing: ${required}`);
}
for (const required of ["openProposalRequests", "readyForReview", "quarantined", "countsAreCanonicalEvidence: false", "countsAreCommercialEvidence: false", "UNAVAILABLE"]) {
  assert(text.publicLedger.includes(required), `public reconciliation ledger missing: ${required}`);
}
for (const required of ["api/revenue/reconciliation", "4035cd406a5db019c4f3b9122e0021b2fb3fcbb23e7e10b040333fdedeb41a22", "3c85fe2fc195d5a0c9de45b679f9ef3a5589f36f948ea4a8acc0720483a6dc9e", "READY_FOR_REVIEW", "QUARANTINED"]) {
  assert(text.readbackWorkflow.includes(required), `reconciliation readback missing: ${required}`);
}
assert(text.operatingDoc.includes("A proposal never becomes canonical automatically"), "operating doc must preserve canonicalization boundary");
assert(text.operatingDoc.includes("Proposal ledger   3c85fe2f"), "operating doc must record proposal digest");
assert(text.sitemap.includes("/github-control-tower-audit/reconciliation"), "sitemap must include reconciliation dashboard");

assert(packageJson.scripts["fardarter:reconciliation:check"] === "node scripts/check-fardarter-reconciliation-v6-3.mjs", "package reconciliation script is missing");
assert(packageJson.scripts["revenue:verify"].includes("fardarter:reconciliation:check"), "unified verifier must include reconciliation check");
assert(text.revenueWorkflow.includes("FARDARTER-DRIVE-EVENT-PROPOSALS-V6-3.json"), "revenue workflow must validate proposal JSON");
assert(text.revenueWorkflow.includes("FARDARTER-DRIVE-RECONCILIATION-V6-3.json"), "revenue workflow must validate reconciliation JSON");

const forbidden = /(?:drive\.google\.com|docs\.google\.com|providerTransactionId|routingNumber|bankAccount|privateKey|customerEmail|customerName)/i;
for (const [label, value] of [
  ["proposals", text.proposals],
  ["snapshot", text.snapshot],
  ["api", text.api],
  ["proposal workflow", text.proposalWorkflow],
  ["reconciliation workflow", text.reconciliationWorkflow],
]) {
  assert(!forbidden.test(value), `${label} exposes a forbidden private field or reference`);
}

console.log("Fardarter Drive v6.3 reconciliation: PASS");
console.log(`Proposal ledger digest: ${proposals.ledgerDigest}`);
console.log(`Snapshot digest: ${snapshot.snapshotDigest}`);
console.log(`Canonical head: ${events.headSequence} / ${events.headDigest}`);
console.log("Canonical business events: 0 / orders: 0 / settled cash: $0");
