import { readFile } from "node:fs/promises";

const paths = {
  sample: "examples/revenue-experiment.sample.json",
  schema: "schemas/revenue/revenue-experiment.schema.json",
  funding: ".github/FUNDING.yml",
  auditReceipt: "examples/github-control-tower-audit-receipt.sample.json",
  publicationReceipt: "receipts/revenue/JP-REV-001-PUBLICATION.json",
  drive: "receipts/revenue/FARDARTER-DRIVE-V5.json",
  authority: "receipts/revenue/FARDARTER-DRIVE-AUTHORITY-V5.json",
  gdrive: "receipts/revenue/FARDARTER-DRIVE-GDRIVE-V5.json",
  fitWorkflow: ".github/workflows/fardarter-fit-acceptance-v5.yml",
  executionWorkflow: ".github/workflows/fardarter-approved-execution-v5.yml",
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function collectKeys(value, output = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectKeys(item, output);
  } else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      output.push(key);
      collectKeys(child, output);
    }
  }
  return output;
}

const entries = await Promise.all(
  Object.entries(paths).map(async ([key, path]) => [key, await readFile(path, "utf8")]),
);
const text = Object.fromEntries(entries);
const sample = JSON.parse(text.sample);
const schema = JSON.parse(text.schema);
const auditReceipt = JSON.parse(text.auditReceipt);
const publicationReceipt = JSON.parse(text.publicationReceipt);
const drive = JSON.parse(text.drive);
const authority = JSON.parse(text.authority);
const gdrive = JSON.parse(text.gdrive);

assert(schema?.properties?.schemaVersion?.const === sample.schemaVersion, "revenue schema version mismatch");
assert(sample.experimentId === "JP-REV-001", "experiment ID is incorrect");
assert(sample.status === "PUBLISHED", "experiment must remain PUBLISHED");

const offer = sample.offer;
assert(offer.name === "GitHub Control Tower Audit", "offer name is incorrect");
assert(offer.priceUsd === 100, "price must remain $100 USD");
assert(offer.quantityTarget === 100, "quantity target must be 100");
assert(offer.firstMilestoneUsd === 1000, "first milestone must be $1,000");
assert(offer.grossTargetUsd === 10000, "gross target must be $10,000");
assert(offer.capacity === 100, "capacity must be 100");
assert(offer.maxConcurrentDeliveries === 10, "maximum active deliveries must be 10");
assert(offer.grossTargetUsd === offer.priceUsd * offer.quantityTarget, "gross target arithmetic is inconsistent");
assert(offer.firstMilestoneUsd === offer.priceUsd * 10, "first milestone must equal ten audits at the pilot price");
assert(offer.capacity === offer.quantityTarget, "capacity must equal quantity target");
assert(offer.maxConcurrentDeliveries < offer.capacity, "active limit must remain below total capacity");

assert(sample.metrics.orders === 0, "public baseline must record zero orders");
assert(sample.metrics.deliveriesAccepted === 0, "public baseline must record zero accepted deliveries");
assert(sample.money.grossRevenueUsd === 0, "public baseline must record zero gross revenue");
assert(sample.money.netCashUsd === 0, "public baseline must record zero settled cash");
assert(sample.money.settlementState === "UNKNOWN", "public baseline settlement state must remain UNKNOWN");
for (const value of Object.values(sample.claims)) assert(value === false, "all public claims must remain false");

assert(sample.authorityReceiptPath === paths.authority, "experiment must link authority v5");
assert(sample.channel.name === "GitHub inbound issue #133", "channel must remain Issue #133");
assert(sample.channel.publicationAuthorized === true, "publication must remain authorized");
assert(sample.channel.outreachAuthorized === false, "public baseline must not claim autonomous outreach");
assert(sample.authority.offerPreparation === "authorized", "offer preparation must be authorized");
assert(sample.authority.publication === "authorized", "publication must be authorized");
assert(sample.authority.outreach === "not_authorized", "simple public baseline must keep outreach not_authorized");
assert(sample.authority.contract === "not_authorized", "simple public baseline must keep contract not_authorized");
assert(sample.authority.paymentExecution === "external_provider_only", "payment must remain external-provider-only");
assert(sample.authority.delivery === "not_authorized", "simple public baseline must keep delivery not_authorized");

const requiredProofs = [
  paths.authority,
  paths.drive,
  paths.gdrive,
  paths.fitWorkflow,
  paths.executionWorkflow,
  "docs/repository/FARDARTER-DRIVE-V5-ACCEPT-EXECUTE-GDRIVE.md",
  "receipts/revenue/JP-REV-001-PUBLICATION.json",
  ".github/ISSUE_TEMPLATE/control-tower-audit-request.yml",
  "templates/github-control-tower-audit.md",
];
for (const path of requiredProofs) {
  assert(sample.proofPackage.includes(path), `proof package missing: ${path}`);
  const proof = await readFile(path, "utf8");
  assert(proof.trim().length >= 40, `proof file is incomplete: ${path}`);
}
assert(new Set(sample.proofPackage).size === sample.proofPackage.length, "proof package paths must be unique");

assert(drive.currentEvidence.capacity === offer.capacity, "drive and experiment capacity differ");
assert(drive.currentEvidence.maxConcurrentDeliveries === offer.maxConcurrentDeliveries, "drive and experiment active limits differ");
assert(drive.currentEvidence.grossTargetUsd === offer.grossTargetUsd, "drive and experiment targets differ");
assert(authority.authorityVersion === "5.0.0", "authority v5 is required");
assert(authority.revoked === false, "authority v5 must remain active");
assert(gdrive.state === "CONNECTED_PRIVATE", "private Google Drive continuity is required");
assert(gdrive.publicFolderUrlExposed === false && gdrive.publicFileIdsExposed === false, "public proof must not expose Drive references");

assert(auditReceipt.experimentId === sample.experimentId, "audit receipt experiment mismatch");
assert(auditReceipt.agreement?.state === "NOT_AGREED", "sample audit must not claim agreement");
assert(auditReceipt.payment?.settlementState === "UNKNOWN", "sample audit must not claim settlement");
assert(auditReceipt.delivery?.state === "NOT_STARTED", "sample audit must not claim work start");
assert(publicationReceipt.experimentId === sample.experimentId, "publication receipt experiment mismatch");
assert(publicationReceipt.issueNumber === 133, "publication receipt must reference Issue #133");
assert(publicationReceipt.orders === 0 && publicationReceipt.grossRevenueUsd === 0 && publicationReceipt.settledCashUsd === 0, "publication receipt money baseline is inconsistent");

const fundingUrls = text.funding.match(/https:\/\/[^"\s]+/g) ?? [];
for (const url of sample.fundingUrls) assert(fundingUrls.includes(url), `funding URL missing from FUNDING.yml: ${url}`);

for (const requiredText of ["FIT_APPROVED_FOR_SCOPE_DRAFT", "not-an-order", "PAID_SETTLED"]) {
  assert(text.fitWorkflow.includes(requiredText), `fit workflow missing ${requiredText}`);
}
for (const requiredText of ["VERIFY_AND_BUILD", "npm run revenue:verify", "npm run build", "externalActionsPerformed: []"]) {
  assert(text.executionWorkflow.includes(requiredText), `execution workflow missing ${requiredText}`);
}

const forbiddenKey = /^(password|secret|token|routingNumber|bankAccount|accountNumber|customerName|customerEmail|providerTransactionId|payoutData|driveFolderId|driveFileId)$/i;
for (const key of [
  ...collectKeys(sample),
  ...collectKeys(drive),
  ...collectKeys(authority),
  ...collectKeys(gdrive),
]) assert(!forbiddenKey.test(key), `forbidden sensitive public field: ${key}`);

console.log("Revenue experiment v5: PASS");
console.log(`Price: $${offer.priceUsd}`);
console.log(`First milestone: $${offer.firstMilestoneUsd}`);
console.log(`Gross capacity target: $${offer.grossTargetUsd}`);
console.log(`Capacity: ${offer.capacity} total / ${offer.maxConcurrentDeliveries} active`);
console.log(`Authority: ${authority.authorityVersion}`);
console.log(`Google Drive: ${gdrive.state}`);
console.log(`Current evidence: ${sample.metrics.orders} orders / $${sample.money.grossRevenueUsd} gross / $${sample.money.netCashUsd} settled`);
