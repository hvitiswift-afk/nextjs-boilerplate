import { readFile } from "node:fs/promises";

const paths = {
  experiment: "examples/revenue-experiment.sample.json",
  schema: "schemas/revenue/revenue-experiment.schema.json",
  funding: ".github/FUNDING.yml",
  authority: "receipts/revenue/FARDARTER-DRIVE-AUTHORITY-V6.json",
  drive: "receipts/revenue/FARDARTER-DRIVE-V6.json",
  override: "receipts/revenue/FARDARTER-DRIVE-CAPACITY-OVERRIDE-V6.sample.json",
  fitWorkflow: ".github/workflows/fardarter-fit-acceptance-v6.yml",
  executionWorkflow: ".github/workflows/fardarter-approved-execution-v6.yml",
  overrideWorkflow: ".github/workflows/fardarter-capacity-override-v6.yml",
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function nonNegative(value, label) {
  assert(Number.isFinite(value) && value >= 0, `${label} must be non-negative`);
}

function safePath(path, label) {
  assert(typeof path === "string" && path.length > 0, `${label} is required`);
  assert(!path.startsWith("/") && !path.includes("..") && !path.includes(":"), `${label} must be repository-relative`);
}

const entries = await Promise.all(
  Object.entries(paths).map(async ([key, path]) => [key, await readFile(path, "utf8")]),
);
const text = Object.fromEntries(entries);
const experiment = JSON.parse(text.experiment);
const schema = JSON.parse(text.schema);
const authority = JSON.parse(text.authority);
const drive = JSON.parse(text.drive);
const override = JSON.parse(text.override);

assert(schema.$schema === "https://json-schema.org/draft/2020-12/schema", "revenue schema must use draft 2020-12");
assert(schema.additionalProperties === false, "revenue schema must reject undeclared root fields");
assert(schema.properties?.schemaVersion?.const === "1.3.0", "revenue schema must be 1.3.0");
assert(experiment.schemaVersion === "1.3.0", "experiment schemaVersion must be 1.3.0");
assert(experiment.experimentId === "JP-REV-001", "experiment ID is incorrect");
assert(experiment.status === "PUBLISHED", "experiment must remain PUBLISHED");

const { offer, metrics, money, claims, authority: publicAuthority } = experiment;
assert(offer.priceUsd === 100, "price must remain $100");
assert(offer.quantityTarget === 1000, "quantity target must be 1,000");
assert(offer.capacity === 1000, "capacity must be 1,000");
assert(offer.maxConcurrentDeliveries === 100, "standard active ceiling must be 100");
assert(offer.firstMilestoneUsd === 1000, "first milestone must be $1,000");
assert(offer.grossTargetUsd === 100000, "gross capacity target must be $100,000");
assert(offer.grossTargetUsd === offer.priceUsd * offer.quantityTarget, "gross target arithmetic is inconsistent");
assert(offer.maxConcurrentDeliveries <= offer.capacity, "active ceiling cannot exceed total capacity");
assert(offer.scopeLimits.repositories === 1, "scope must remain one repository");
assert(offer.scopeLimits.maxOpenPullRequests <= 25, "scope must not exceed 25 PRs");
assert(offer.scopeLimits.maxOpenIssues <= 50, "scope must not exceed 50 issues");
assert(Array.isArray(offer.deliverables) && offer.deliverables.length >= 5, "at least five deliverables are required");
assert(Array.isArray(offer.exclusions) && offer.exclusions.length >= 5, "at least five exclusions are required");

assert(Array.isArray(experiment.proofPackage) && experiment.proofPackage.length >= 15, "v6 proof package is incomplete");
assert(new Set(experiment.proofPackage).size === experiment.proofPackage.length, "proof package paths must be unique");
for (const [index, proofPath] of experiment.proofPackage.entries()) {
  safePath(proofPath, `proofPackage[${index}]`);
  const source = await readFile(proofPath, "utf8");
  assert(source.trim().length >= 20, `proof package file is empty: ${proofPath}`);
}
for (const required of [
  paths.authority,
  paths.drive,
  paths.override,
  paths.fitWorkflow,
  paths.executionWorkflow,
  paths.overrideWorkflow,
  "receipts/revenue/FARDARTER-DRIVE-GDRIVE-V6.json",
  "docs/repository/FARDARTER-DRIVE-V6-CAPACITY-1000-100.md",
]) assert(experiment.proofPackage.includes(required), `proof package missing: ${required}`);

assert(experiment.authorityReceiptPath === paths.authority, "experiment must point to v6 authority");
assert(experiment.channel.name === "GitHub inbound issue #133", "publication channel is incorrect");
assert(experiment.channel.publicationAuthorized === true, "publication must remain authorized");
assert(experiment.channel.outreachAuthorized === false, "public baseline must not claim direct outreach");

for (const [key, value] of Object.entries(metrics)) nonNegative(value, `metrics.${key}`);
assert(metrics.orders === 0 && metrics.deliveriesAccepted === 0, "baseline must not claim orders or accepted deliveries");
assert(metrics.orders <= offer.capacity, "orders cannot exceed capacity");
for (const key of ["grossRevenueUsd", "feesUsd", "refundsUsd", "netCashUsd"]) nonNegative(money[key], `money.${key}`);
assert(money.grossRevenueUsd === 0 && money.netCashUsd === 0, "baseline money must remain zero");
assert(money.settlementState === "UNKNOWN", "baseline settlement must remain UNKNOWN");
for (const [key, value] of Object.entries(claims)) assert(value === false, `claim ${key} must remain false`);
assert(publicAuthority.offerPreparation === "authorized" && publicAuthority.publication === "authorized", "offer/publication authority is incorrect");
assert(publicAuthority.contract === "not_authorized" && publicAuthority.delivery === "not_authorized", "public baseline must not claim contract or delivery authority");
assert(publicAuthority.paymentExecution === "external_provider_only", "payment must remain external-provider-only");

assert(authority.authorityVersion === "6.0.0" && authority.revoked === false, "v6 authority is not active");
assert(drive.currentEvidence.capacity === 1000, "drive and experiment capacity must agree");
assert(drive.currentEvidence.standardMaxConcurrentDeliveries === 100, "drive and experiment active limit must agree");
assert(drive.currentEvidence.grossTargetUsd === 100000, "drive and experiment target must agree");
assert(drive.currentEvidence.orders === metrics.orders, "drive and experiment orders must agree");
assert(drive.currentEvidence.verifiedSettledCashUsd === money.netCashUsd, "drive and experiment cash must agree");
assert(override.state === "INACTIVE_NO_RECEIPT" && override.above100Allowed === true, "baseline override must be inactive but allowed");

for (const required of ["jp-fardarter-fit-v6", "1,000", "100 deliveries may be ACTIVE"]) assert(text.fitWorkflow.includes(required), `fit workflow missing: ${required}`);
for (const required of ["jp-fardarter-execution-v6-", "capacity: 1000", "standardActiveCeiling: 100", "oneShotPerIssue: true"]) assert(text.executionWorkflow.includes(required), `execution workflow missing: ${required}`);
for (const required of ["requested_active_ceiling", "APPROVED_NOT_ACTIVE", "CAPACITY_OVERRIDE_ACTIVE", "activationRequiresCanonicalMerge"]) assert(text.overrideWorkflow.includes(required), `override workflow missing: ${required}`);
assert(!text.executionWorkflow.includes("contents: write"), "execution workflow must remain read-only");
assert(!text.overrideWorkflow.includes("contents: write"), "override workflow must not silently change source");

assert(Array.isArray(experiment.fundingUrls) && experiment.fundingUrls.length >= 1, "funding URLs are required");
const fundingUrls = text.funding.match(/https:\/\/[^"\s]+/g) ?? [];
for (const url of experiment.fundingUrls) {
  assert(new URL(url).protocol === "https:", "funding URL must use HTTPS");
  assert(fundingUrls.includes(url), `funding URL missing from FUNDING.yml: ${url}`);
}

console.log("Revenue experiment v6: PASS");
console.log("Capacity: 1,000 slots / 100 standard ACTIVE / $100,000 capacity target");
console.log("Above-100 capacity: ALLOWED_WITH_RECEIPT / current override INACTIVE_NO_RECEIPT");
console.log("Financial evidence: 0 orders / $0 gross / $0 settled");
