import { readFile } from "node:fs/promises";

const paths = {
  page: "app/github-control-tower-audit/page.tsx",
  api: "app/api/revenue/pilot/route.ts",
  experiment: "examples/revenue-experiment.sample.json",
  drive: "receipts/revenue/FARDARTER-DRIVE-V5.json",
  authority: "receipts/revenue/FARDARTER-DRIVE-AUTHORITY-V5.json",
  gdrive: "receipts/revenue/FARDARTER-DRIVE-GDRIVE-V5.json",
  publication: "receipts/revenue/JP-REV-001-PUBLICATION.json",
  interest: "src/lib/revenue/public-audit-interest.ts",
  fitWorkflow: ".github/workflows/fardarter-fit-acceptance-v5.yml",
  executionWorkflow: ".github/workflows/fardarter-approved-execution-v5.yml",
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
const publication = JSON.parse(text.publication);

const slotsRemaining = Math.max(experiment.offer.capacity - experiment.metrics.orders, 0);
assert(experiment.offer.capacity === 100, "product capacity must be 100");
assert(experiment.offer.maxConcurrentDeliveries === 10, "active delivery limit must be 10");
assert(slotsRemaining === 100, "baseline must show 100 remaining slots");
assert(experiment.offer.grossTargetUsd === 10000, "gross target must be $10,000");
assert(experiment.money.netCashUsd === 0, "surface must not claim settled cash");
assert(drive.driveId === "FARDARTER-DRIVE-V5", "surface must use Fardarter Drive v5");
assert(authority.authorityVersion === "5.0.0", "surface must use authority v5");
assert(gdrive.state === "CONNECTED_PRIVATE", "surface must expose private connected Drive state");
assert(publication.issueNumber === 133, "surface must link Issue #133");

for (const requiredText of [
  "FARDARTER-DRIVE-V5.json",
  "FARDARTER-DRIVE-AUTHORITY-V5.json",
  "FARDARTER-DRIVE-GDRIVE-V5.json",
  "getPublicAuditInterest",
  "schemaVersion: \"1.4.0\"",
  "FIT_APPROVED_FOR_SCOPE_DRAFT",
  "CONNECTED_PRIVATE",
  "workPackageCreatesContract: false",
  "workPackageCreatesPaymentObligation: false",
  "workPackageStartsPaidDelivery: false",
  "receivedCashRequires: \"PAID_SETTLED\"",
]) assert(text.api.includes(requiredText), `API missing: ${requiredText}`);

for (const requiredText of [
  "Fardarter Drive™ v5",
  "100 total slots",
  "10 active",
  "FIT_APPROVED_FOR_SCOPE_DRAFT",
  "Google Drive continuity",
  "CONNECTED_PRIVATE",
  "nonbinding",
  "not indemnity-proof",
  "Current evidence",
  "$10,000",
  "$1 quadrillion",
  "Request a public-safe fit check",
]) assert(text.page.includes(requiredText), `product page missing: ${requiredText}`);

for (const requiredText of [
  "startsWith(github.event.issue.title, '[Audit request]:')",
  "fit-approved-for-scope-draft",
  "needs-scope-draft",
  "jp-fardarter-fit-v5",
]) assert(text.fitWorkflow.includes(requiredText), `fit workflow missing: ${requiredText}`);

for (const requiredText of [
  "fd-execute-approved",
  "[FD execute]:",
  "npm run revenue:verify",
  "npm run build",
  "externalActionsPerformed: []",
]) assert(text.executionWorkflow.includes(requiredText), `execution workflow missing: ${requiredText}`);

assert(text.interest.includes("countedAsOrders: false"), "public interest must not count as orders");
assert(text.interest.includes("reservesCapacity: false"), "public interest must not reserve capacity");
assert(!text.page.toLowerCase().includes("guaranteed revenue"), "page must not claim guaranteed revenue");
assert(!text.page.toLowerCase().includes("indemnity-proof system"), "page must not claim an indemnity-proof system");

console.log("Revenue product surface v5: PASS");
console.log("Route: /github-control-tower-audit");
console.log("Status API: /api/revenue/pilot");
console.log(`Capacity: ${slotsRemaining}/${experiment.offer.capacity} slots remaining`);
console.log(`Active delivery limit: ${experiment.offer.maxConcurrentDeliveries}`);
console.log(`Acceptance: ${drive.acceptanceModel.automatedState} / binding=${drive.acceptanceModel.binding}`);
console.log(`Execution: ${drive.executionModel.state}`);
console.log(`Google Drive: ${gdrive.state}`);
console.log(`Current settled cash: $${experiment.money.netCashUsd}`);
