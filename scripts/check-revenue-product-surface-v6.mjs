import { readFile } from "node:fs/promises";

const paths = {
  page: "app/github-control-tower-audit/page.tsx",
  api: "app/api/revenue/pilot/route.ts",
  experiment: "examples/revenue-experiment.sample.json",
  drive: "receipts/revenue/FARDARTER-DRIVE-V6.json",
  authority: "receipts/revenue/FARDARTER-DRIVE-AUTHORITY-V6.json",
  gdrive: "receipts/revenue/FARDARTER-DRIVE-GDRIVE-V6.json",
  override: "receipts/revenue/FARDARTER-DRIVE-CAPACITY-OVERRIDE-V6.sample.json",
  fitWorkflow: ".github/workflows/fardarter-fit-acceptance-v6.yml",
  executionWorkflow: ".github/workflows/fardarter-approved-execution-v6.yml",
  overrideWorkflow: ".github/workflows/fardarter-capacity-override-v6.yml",
  form: ".github/ISSUE_TEMPLATE/control-tower-audit-request.yml",
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const entries = await Promise.all(
  Object.entries(paths).map(async ([key, path]) => [key, await readFile(path, "utf8")]),
);
const text = Object.fromEntries(entries);
const experiment = JSON.parse(text.experiment);
const drive = JSON.parse(text.drive);
const authority = JSON.parse(text.authority);
const gdrive = JSON.parse(text.gdrive);
const override = JSON.parse(text.override);

assert(experiment.offer.capacity === 1000, "surface capacity must be 1,000");
assert(experiment.offer.maxConcurrentDeliveries === 100, "surface standard active ceiling must be 100");
assert(experiment.offer.grossTargetUsd === 100000, "surface target must be $100,000");
assert(drive.driveId === "FARDARTER-DRIVE-V6", "surface must use v6 drive");
assert(authority.authorityVersion === "6.0.0", "surface must use authority v6");
assert(gdrive.state === "CONNECTED_PRIVATE", "surface must use private Drive continuity");
assert(override.state === "INACTIVE_NO_RECEIPT", "surface baseline override must be inactive");
assert(override.above100Allowed === true, "surface must permit above-100 override");

for (const required of [
  "FARDARTER-DRIVE-V6.json",
  "FARDARTER-DRIVE-AUTHORITY-V6.json",
  "FARDARTER-DRIVE-GDRIVE-V6.json",
  "FARDARTER-DRIVE-CAPACITY-OVERRIDE-V6.sample.json",
  "schemaVersion: \"1.5.0\"",
  "standardActiveCeiling",
  "effectiveActiveCeiling",
  "above100Allowed",
  "activationTarget: \"CAPACITY_OVERRIDE_ACTIVE\"",
  "capacityOverrideActivatesWithoutReceipt: false",
  "receivedCashRequires: \"PAID_SETTLED\"",
]) assert(text.api.includes(required), `API missing v6 source or boundary: ${required}`);

for (const required of [
  "Fardarter Drive™ v6",
  "1,000 total slots",
  "100 standard ACTIVE",
  "Above 100 is allowed",
  "CAPACITY_OVERRIDE_ACTIVE",
  "INACTIVE_NO_RECEIPT",
  "FIT_APPROVED_FOR_SCOPE_DRAFT",
  "Google Drive continuity",
  "CONNECTED_PRIVATE",
  "$100,000",
  "$1 quadrillion",
  "not indemnity-proof",
  "Request a public-safe fit check",
]) assert(text.page.includes(required), `product page missing: ${required}`);

for (const required of [
  "jp-fardarter-fit-v6",
  "fit-approved-for-scope-draft",
  "needs-scope-draft",
  "1,000 total planning slots",
  "100 deliveries may be ACTIVE",
  "above 100 requires an active capacity override receipt",
]) assert(text.fitWorkflow.includes(required), `v6 fit workflow missing: ${required}`);

for (const required of [
  "fd-execute-approved-v6",
  "jp-fardarter-execution-v6-",
  "Enforce one execution receipt per issue",
  "oneShotPerIssue: true",
  "capacity: 1000",
  "standardActiveCeiling: 100",
  "effectiveActiveCeiling: 100",
  "above100Allowed: true",
]) assert(text.executionWorkflow.includes(required), `v6 execution workflow missing: ${required}`);
assert(!text.executionWorkflow.includes("contents: write"), "v6 execution workflow must remain read-only");

for (const required of [
  "requested_active_ceiling",
  "standardActiveCeiling: 100",
  "totalPlanningCapacity: 1000",
  "APPROVED_NOT_ACTIVE",
  "CAPACITY_OVERRIDE_ACTIVE",
  "activationRequiresCanonicalMerge: true",
  "does not change the canonical effective ceiling",
]) assert(text.overrideWorkflow.includes(required), `override workflow missing: ${required}`);
assert(!text.overrideWorkflow.includes("contents: write"), "override workflow must not write canonical source");

for (const required of [
  "1,000 total slots",
  "100 ACTIVE deliveries",
  "above 100 requires a complete active capacity-override receipt",
  "FIT_APPROVED_FOR_SCOPE_DRAFT",
]) assert(text.form.includes(required), `request form missing v6 disclosure: ${required}`);

assert(drive.capacityModel.aboveStandardAllowed === true, "above-standard capacity must be allowed");
assert(drive.capacityModel.automaticActivation === false, "capacity override must not self-activate");
assert(drive.capacityModel.overrideMayExceedTotalPlanningCapacity === false, "override must stay within total capacity");
assert(gdrive.publicFolderUrlExposed === false && gdrive.publicFileIdsExposed === false, "Drive references must remain private");
assert(gdrive.automation.activateOverrideWithoutCompleteReceipt === false, "Drive automation must not activate incomplete override");
assert(Object.values(override.claims).every((value) => value === false), "override sample must make no demand or financial claims");

const combined = `${text.page}\n${text.api}\n${text.fitWorkflow}\n${text.executionWorkflow}\n${text.overrideWorkflow}`.toLowerCase();
for (const forbidden of [
  "guaranteed revenue",
  "guaranteed income",
  "capacity proves demand",
  "automatic contract acceptance",
  "automatic payment settlement",
  "indemnity-proof system",
]) assert(!combined.includes(forbidden), `forbidden public claim found: ${forbidden}`);

console.log("Revenue product surface v6: PASS");
console.log("Page/API: 1,000 total / 100 standard ACTIVE / above-100 receipt rail");
console.log("Google Drive: CONNECTED_PRIVATE / no public URLs or IDs");
console.log("Money: 0 orders / $0 gross / $0 settled");
