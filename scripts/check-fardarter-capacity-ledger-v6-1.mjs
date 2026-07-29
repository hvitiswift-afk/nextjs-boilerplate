import { readFile } from "node:fs/promises";

const paths = {
  ledger: "receipts/revenue/FARDARTER-DRIVE-CAPACITY-LEDGER-V6-1.json",
  schema: "schemas/revenue/fardarter-drive-capacity-ledger-v6-1.schema.json",
  publicReader: "src/lib/revenue/public-capacity-ledger.ts",
  api: "app/api/revenue/capacity/route.ts",
  template: ".github/ISSUE_TEMPLATE/fardarter-capacity-override.yml",
  workflow: ".github/workflows/fardarter-capacity-request-v6.yml",
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const text = Object.fromEntries(
  await Promise.all(
    Object.entries(paths).map(async ([key, path]) => [key, await readFile(path, "utf8")]),
  ),
);
const ledger = JSON.parse(text.ledger);
const schema = JSON.parse(text.schema);

assert(schema.$schema === "https://json-schema.org/draft/2020-12/schema", "ledger schema must use draft 2020-12");
assert(schema.additionalProperties === false, "ledger schema must reject undeclared root fields");
assert(ledger.ledgerId === "FARDARTER-DRIVE-CAPACITY-LEDGER-V6-1", "ledger ID mismatch");
assert(ledger.driveId === "FARDARTER-DRIVE-V6", "drive ID mismatch");
assert(ledger.authorityVersion === "6.0.0", "authority version mismatch");
assert(ledger.controllingIssue === 153, "controlling issue must be 153");

const capacity = ledger.canonicalCapacity;
assert(capacity.totalPlanningSlots === 1000, "total planning slots must be 1,000");
assert(capacity.standardActiveCeiling === 100, "standard active ceiling must be 100");
assert(capacity.effectiveActiveCeiling === 100, "baseline effective active ceiling must be 100");
assert(capacity.activeDeliveries === 0, "baseline active deliveries must be zero");
assert(capacity.orders === 0, "baseline orders must be zero");
assert(capacity.activeHeadroom === 100, "baseline active headroom must be 100");
assert(capacity.above100Allowed === true, "above-100 capacity must be allowed");
assert(capacity.overrideState === "INACTIVE_NO_RECEIPT", "baseline override state must be inactive");

assert(ledger.financialEvidence.verifiedGrossRevenueUsd === 0, "gross revenue baseline must remain zero");
assert(ledger.financialEvidence.verifiedSettledCashUsd === 0, "settled cash baseline must remain zero");
assert(ledger.financialEvidence.receivedCashRequires === "PAID_SETTLED", "cash evidence gate mismatch");
assert(ledger.stateLedger.length === 13, "state ledger must contain thirteen explicit states");
assert(new Set(ledger.stateLedger.map((entry) => entry.state)).size === 13, "state ledger entries must be unique");
assert(ledger.stateLedger.find((entry) => entry.state === "ACTIVE")?.usesActiveCapacity === true, "ACTIVE must use capacity");
assert(ledger.stateLedger.find((entry) => entry.state === "FIT_APPROVED_FOR_SCOPE_DRAFT")?.countsAsOrder === false, "fit approval must not count as an order");

for (const key of [
  "requestChangesEffectiveCeiling",
  "workflowApprovalChangesEffectiveCeiling",
]) assert(ledger.overrideBoundary[key] === false, `${key} must remain false`);
for (const key of [
  "activeOverrideRequiresCompletePrivateEvidence",
  "activeOverrideRequiresJpAuthorization",
  "activeOverrideRequiresCanonicalMerge",
  "activeOverrideRequiresReadback",
]) assert(ledger.overrideBoundary[key] === true, `${key} must remain true`);

for (const value of Object.values(ledger.claims)) assert(value === false, "all ledger claims flags must remain false");
assert(ledger.googleDriveContinuity.state === "CONNECTED_PRIVATE", "Drive continuity must be connected private");
assert(ledger.googleDriveContinuity.publicUrlExposed === false, "private Drive URL must not be exposed");
assert(ledger.googleDriveContinuity.publicFileIdExposed === false, "private Drive file ID must not be exposed");

for (const requiredText of [
  "GITHUB_PUBLIC_READ_TOKEN",
  "fit-approved-for-scope-draft",
  "fd-active-delivery",
  "[FD capacity override]:",
  "countsAreCommercialEvidence: false",
]) assert(text.publicReader.includes(requiredText), `public reader missing: ${requiredText}`);

for (const requiredText of [
  "schemaVersion: \"1.0.0\"",
  "standardActiveHeadroom",
  "effectiveActiveHeadroom",
  "approvedNotActiveActivatesCapacity: false",
  "capacityEqualsRevenue: false",
]) assert(text.api.includes(requiredText), `capacity API missing: ${requiredText}`);

for (const requiredText of [
  "Requested ACTIVE ceiling",
  "Expiration date or required review condition",
  "Rollback ceiling",
  "APPROVED_NOT_ACTIVE",
]) assert(text.template.includes(requiredText), `override template missing: ${requiredText}`);

for (const requiredText of [
  "startsWith(github.event.issue.title, '[FD capacity override]:')",
  "jp-fardarter-capacity-request-v6",
  "capacity-override-approved-not-active",
  "Effective capacity changed: **NO**",
  "CAPACITY_OVERRIDE_ACTIVE",
]) assert(text.workflow.includes(requiredText), `override workflow missing: ${requiredText}`);
assert(text.workflow.match(/createComment/g)?.length === 1, "override workflow must have one comment creation path");
assert(!text.workflow.includes("contents: write"), "override triage must remain repository read-only");
assert(!text.workflow.includes("payments: write"), "override triage must not request payment permissions");

console.log("Fardarter Drive v6.1 capacity ledger: PASS");
console.log("Canonical capacity: 1,000 total / 100 standard ACTIVE / 100 effective ACTIVE");
console.log("Override baseline: INACTIVE_NO_RECEIPT; public approval cannot activate capacity");
console.log("Financial evidence: 0 orders / $0 gross / $0 settled");
