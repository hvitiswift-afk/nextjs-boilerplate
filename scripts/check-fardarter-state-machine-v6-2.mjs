import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const paths = {
  machine: "receipts/revenue/FARDARTER-DRIVE-STATE-MACHINE-V6-2.json",
  machineSchema: "schemas/revenue/fardarter-drive-state-machine-v6-2.schema.json",
  events: "receipts/revenue/FARDARTER-DRIVE-STATE-EVENTS-V6-2.json",
  eventSchema: "schemas/revenue/fardarter-drive-state-event-v6-2.schema.json",
  eventsSchema: "schemas/revenue/fardarter-drive-state-events-v6-2.schema.json",
  capacity: "receipts/revenue/FARDARTER-DRIVE-CAPACITY-LEDGER-V6-1.json",
  gdrive: "receipts/revenue/FARDARTER-DRIVE-GDRIVE-V6.json",
  transitionForm: ".github/ISSUE_TEMPLATE/fardarter-state-transition.yml",
  transitionWorkflow: ".github/workflows/fardarter-state-transition-v6-2.yml",
  api: "app/api/revenue/operations/route.ts",
  publicLedger: "src/lib/revenue/public-state-ledger.ts",
  package: "package.json",
  revenueWorkflow: ".github/workflows/revenue-experiment.yml",
  operatingDoc: "docs/repository/FARDARTER-DRIVE-V6-2-RECEIPT-MESH.md",
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

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}
const digestEvent = (event) => {
  const { eventDigest: _ignored, ...payload } = event;
  return createHash("sha256").update(stableStringify(payload), "utf8").digest("hex");
};

const machine = parse(text.machine, "state machine");
const machineSchema = parse(text.machineSchema, "state-machine schema");
const chain = parse(text.events, "event chain");
const eventSchema = parse(text.eventSchema, "event schema");
const eventsSchema = parse(text.eventsSchema, "event-chain schema");
const capacity = parse(text.capacity, "capacity ledger");
const gdrive = parse(text.gdrive, "Google Drive continuity receipt");
const packageJson = parse(text.package, "package.json");

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

assert(machine.schemaVersion === "1.0.0", "state-machine schema version must be 1.0.0");
assert(machine.stateMachineId === "FARDARTER-DRIVE-STATE-MACHINE-V6-2", "stateMachineId is incorrect");
assert(machine.driveId === "FARDARTER-DRIVE-V6", "driveId must remain v6");
assert(machine.authorityVersion === "6.0.0" && machine.controllerVersion === "6.2.0", "authority/controller version mismatch");
assert(machine.controllingIssue === 156, "controlling issue must be #156");
assert(machineSchema.properties?.controllingIssue?.const === 156, "schema must lock issue #156");
assert(machine.baseline.totalPlanningSlots === 1000, "total capacity must remain 1,000");
assert(machine.baseline.standardActiveCeiling === 100 && machine.baseline.effectiveActiveCeiling === 100, "active ceilings must remain 100 / 100");
assert(machine.baseline.activeDeliveries === 0 && machine.baseline.orders === 0, "baseline active/orders must remain zero");
assert(machine.baseline.verifiedGrossRevenueUsd === 0 && machine.baseline.verifiedSettledCashUsd === 0, "baseline money must remain zero");
assert(machine.baseline.overrideState === "INACTIVE_NO_RECEIPT", "override must remain inactive");

assert(machine.states.length === expectedStates.length, "exactly 13 states are required");
assert(machine.states.map((state) => state.stateId).join(",") === expectedStates.join(","), "state order is incorrect");
assert(new Set(machine.states.map((state) => state.publicLabel)).size === expectedStates.length, "state labels must be unique");
const active = machine.states.find((state) => state.stateId === "ACTIVE");
assert(active?.usesActiveCapacity === true && active?.countsAsOrder === true, "ACTIVE must use capacity and count as an order");
for (const state of machine.states.filter((entry) => entry.stateId !== "ACTIVE")) {
  assert(state.usesActiveCapacity === false, `${state.stateId} must not use active capacity`);
}

const automated = machine.automatedPublicTransitions.map((item) => `${item.fromState}->${item.toState}`);
assert(automated.join(",") === "REQUESTED->FIT_APPROVED_FOR_SCOPE_DRAFT,FIT_APPROVED_FOR_SCOPE_DRAFT->SCOPE_DRAFTED", "only two nonbinding transitions may be automated");
assert(machine.allowedTransitions.length >= 20, "transition map is incomplete");
assert(new Set(machine.allowedTransitions.map((item) => `${item.fromState}->${item.toState}`)).size === machine.allowedTransitions.length, "allowed transitions must be unique");
assert(machine.receiptMesh.appendOnly === true, "receipt mesh must be append-only");
assert(machine.receiptMesh.canonicalEventRequiresReviewedMerge === true, "canonical events must require reviewed merges");
assert(machine.receiptMesh.publicWorkflowReceiptsAreCanonical === false, "workflow receipts must remain noncanonical");
assert(machine.receiptMesh.duplicateIdempotencyKeyAllowed === false, "duplicate idempotency keys must be prohibited");
assert(machine.conflictPolicy.freezeCanonicalMutation === true && machine.conflictPolicy.state === "NEEDS_JP_REVIEW", "conflicts must freeze canonical mutation");
for (const conflict of ["MULTIPLE_STATE_LABELS","BACKWARDS_TRANSITION","SKIPPED_GATE","DUPLICATE_IDEMPOTENCY_KEY","BROKEN_DIGEST_CHAIN","ACTIVE_CAPACITY_OVERFLOW","SETTLEMENT_WITHOUT_PROVIDER_EVIDENCE"]) {
  assert(machine.conflictPolicy.types.includes(conflict), `missing conflict type: ${conflict}`);
}

assert(chain.chainId === "FARDARTER-DRIVE-STATE-EVENTS-V6-2", "event chain ID is incorrect");
assert(chain.digestAlgorithm === "SHA-256" && chain.canonicalization === "JSON_SORTED_KEYS_UTF8", "digest policy is incorrect");
assert(chain.appendOnly === true, "event chain must be append-only");
assert(chain.eventCount === chain.events.length, "eventCount must equal events length");
assert(chain.canonicalBusinessEventCount === 0, "baseline chain must contain no business events");
assert(chain.events.length === 1 && chain.events[0].eventType === "GENESIS", "baseline chain must be genesis-only");
const idempotencyKeys = new Set();
for (const [index, event] of chain.events.entries()) {
  assert(!idempotencyKeys.has(event.idempotencyKey), `duplicate idempotency key: ${event.idempotencyKey}`);
  idempotencyKeys.add(event.idempotencyKey);
  assert(event.sequence === index, `event sequence mismatch at ${index}`);
  const expectedPrevious = index === 0 ? null : chain.events[index - 1].eventDigest;
  assert(event.previousEventDigest === expectedPrevious, `broken previous digest at ${index}`);
  assert(digestEvent(event) === event.eventDigest, `event digest mismatch at ${index}`);
  assert(event.canonical === true && event.publicSafe === true && event.sensitiveDataPresent === false, `event ${index} violates canonical/public boundary`);
}
assert(chain.headSequence === chain.events.at(-1).sequence, "head sequence mismatch");
assert(chain.headDigest === chain.events.at(-1).eventDigest, "head digest mismatch");
assert(chain.headDigest === "4c401dd352d4263786ac22072d616f67775761656a771ea8815e4623a7a3975b", "genesis digest is not locked");
assert(Object.values(chain.currentCanonicalCounts).every((value) => value === 0), "canonical state counts must remain zero");
assert(chain.financialEvidence.orders === 0 && chain.financialEvidence.verifiedSettledCashUsd === 0, "event chain must not claim orders or cash");
assert(chain.capacityEvidence.activeDeliveries === 0 && chain.capacityEvidence.activeHeadroom === 100, "event chain capacity baseline is incorrect");
assert(eventSchema.properties?.eventDigest?.pattern === "^[a-f0-9]{64}$", "event schema must validate SHA-256 digests");
assert(eventsSchema.properties?.chainId?.const === chain.chainId, "event-chain schema must lock chain ID");

assert(capacity.canonicalCapacity.totalPlanningSlots === 1000, "capacity ledger must remain 1,000");
assert(capacity.canonicalCapacity.effectiveActiveCeiling === 100, "effective ceiling must remain 100");
assert(capacity.canonicalCapacity.activeDeliveries === 0 && capacity.canonicalCapacity.orders === 0, "capacity ledger must remain zero activity");
assert(gdrive.state === "CONNECTED_PRIVATE", "Drive continuity must remain private");
for (const title of ["Fardarter Drive™ v6.2 — Receipt Mesh and State Transition Charter","Fardarter Drive™ v6.2 — Transition and Conflict Register"]) {
  assert(gdrive.documents.some((document) => document.title === title), `Drive receipt missing: ${title}`);
}
assert(gdrive.automation.maintainAppendOnlyReceiptMesh === true, "Drive receipt mesh automation is missing");
assert(gdrive.automation.maintainTransitionConflictRegister === true, "Drive conflict register automation is missing");
assert(gdrive.privacyBoundary.transitionConflictEvidencePublic === false, "conflict evidence must remain private");

for (const required of ["[FD transition]:", "Current public signal state", "Requested next public signal state", "SIGNAL_ONLY", "PAID_SETTLED", "NEEDS_JP_REVIEW"]) {
  assert(text.transitionForm.includes(required), `transition form missing: ${required}`);
}
for (const required of ["jp-fardarter-transition-v6-2-", "Duplicate transition suppressed", "REQUESTED->FIT_APPROVED_FOR_SCOPE_DRAFT", "FIT_APPROVED_FOR_SCOPE_DRAFT->SCOPE_DRAFTED", "HUMAN_GATE_REQUIRED", "GENESIS_ONLY", "contents: read", "issues: write"]) {
  assert(text.transitionWorkflow.includes(required), `transition workflow missing: ${required}`);
}
assert(!text.transitionWorkflow.includes("contents: write"), "transition workflow must not write canonical source");
assert(text.transitionWorkflow.indexOf("comments.some") < text.transitionWorkflow.indexOf("removeLabel"), "idempotency guard must precede state mutation");

for (const required of ["FARDARTER-DRIVE-STATE-MACHINE-V6-2.json", "FARDARTER-DRIVE-STATE-EVENTS-V6-2.json", "getPublicStateLedger", "digestChainConnected", "genesisOnly", "canonicalEventRequiresReviewedMerge", "receivedCashRequires: \"PAID_SETTLED\""]) {
  assert(text.api.includes(required), `operations API missing: ${required}`);
}
for (const required of ["fardarterStateIds", "countsAreCanonicalEvidence: false", "countsAreCommercialEvidence: false", "UNAVAILABLE"]) {
  assert(text.publicLedger.includes(required), `public state ledger missing: ${required}`);
}
assert(packageJson.scripts["fardarter:state:check"] === "node scripts/check-fardarter-state-machine-v6-2.mjs", "package script is missing");
assert(packageJson.scripts["revenue:verify"].includes("fardarter:state:check"), "unified verifier must include state-machine check");
assert(text.revenueWorkflow.includes("FARDARTER-DRIVE-STATE-MACHINE-V6-2.json"), "revenue workflow must validate state-machine JSON");
assert(text.revenueWorkflow.includes("FARDARTER-DRIVE-STATE-EVENTS-V6-2.json"), "revenue workflow must validate event-chain JSON");
assert(text.operatingDoc.includes("Genesis-only canonical chain"), "operating doc must state genesis-only baseline");
assert(text.operatingDoc.includes("public signal is not a canonical event"), "operating doc must preserve signal boundary");

const forbidden = /(?:drive\.google\.com|docs\.google\.com|providerTransactionId|routingNumber|bankAccount|privateKey|customerEmail|customerName)/i;
for (const [label, value] of [["machine",text.machine],["events",text.events],["api",text.api],["workflow",text.transitionWorkflow]]) {
  assert(!forbidden.test(value), `${label} exposes a forbidden private field or reference`);
}

console.log("Fardarter Drive v6.2 receipt mesh: PASS");
console.log(`Genesis digest: ${chain.headDigest}`);
console.log("Canonical business events: 0");
console.log("Baseline: 1,000 total / 100 effective ACTIVE / 0 orders / $0 settled");
