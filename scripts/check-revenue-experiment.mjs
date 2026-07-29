import { readFile } from "node:fs/promises";

const samplePath = process.argv[2] ?? "examples/revenue-experiment.sample.json";
const fundingPath = process.argv[3] ?? ".github/FUNDING.yml";
const receiptPath = process.argv[4] ?? "examples/github-control-tower-audit-receipt.sample.json";
const experimentSchemaPath = process.argv[5] ?? "schemas/revenue/revenue-experiment.schema.json";
const receiptSchemaPath = process.argv[6] ?? "schemas/revenue/audit-receipt.schema.json";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertNonNegativeNumber(value, label) {
  assert(Number.isFinite(value) && value >= 0, `${label} must be a non-negative number`);
}

function assertPositiveInteger(value, label) {
  assert(Number.isInteger(value) && value > 0, `${label} must be a positive integer`);
}

function collectKeys(value, output = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectKeys(item, output);
    return output;
  }

  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      output.push(key);
      collectKeys(child, output);
    }
  }

  return output;
}

function assertPublicRelativePath(pathText, label) {
  assert(typeof pathText === "string" && pathText.length > 0, `${label} must be a non-empty string`);
  assert(!pathText.startsWith("/"), `${label} must be repository-relative`);
  assert(!pathText.includes(".."), `${label} must not traverse directories`);
  assert(!pathText.includes(":"), `${label} must not be a URL or drive path`);
}

function assertSchemaContract(schema, { label, version, idSuffix, requiredFields }) {
  assert(schema?.$schema === "https://json-schema.org/draft/2020-12/schema", `${label} must use JSON Schema draft 2020-12`);
  assert(typeof schema?.$id === "string" && schema.$id.endsWith(idSuffix), `${label} $id is incorrect`);
  assert(schema?.type === "object", `${label} root type must be object`);
  assert(schema?.additionalProperties === false, `${label} must reject undeclared root fields`);
  assert(schema?.properties?.schemaVersion?.const === version, `${label} schemaVersion contract must be ${version}`);
  assert(Array.isArray(schema?.required), `${label} required fields must be declared`);
  for (const field of requiredFields) {
    assert(schema.required.includes(field), `${label} is missing required field: ${field}`);
  }
}

const [sampleText, fundingText, receiptText, experimentSchemaText, receiptSchemaText] = await Promise.all([
  readFile(samplePath, "utf8"),
  readFile(fundingPath, "utf8"),
  readFile(receiptPath, "utf8"),
  readFile(experimentSchemaPath, "utf8"),
  readFile(receiptSchemaPath, "utf8")
]);

const sample = JSON.parse(sampleText);
const receipt = JSON.parse(receiptText);
const experimentSchema = JSON.parse(experimentSchemaText);
const receiptSchema = JSON.parse(receiptSchemaText);

assertSchemaContract(experimentSchema, {
  label: "revenue experiment schema",
  version: "1.1.0",
  idSuffix: "/schemas/revenue/revenue-experiment.schema.json",
  requiredFields: ["experimentId", "status", "offer", "proofPackage", "channel", "money", "authority"]
});
assertSchemaContract(receiptSchema, {
  label: "audit receipt schema",
  version: "1.0.0",
  idSuffix: "/schemas/revenue/audit-receipt.schema.json",
  requiredFields: ["auditId", "experimentId", "agreement", "payment", "delivery", "publicDataBoundary"]
});

assert(sample.schemaVersion === experimentSchema.properties.schemaVersion.const, "sample schemaVersion must match the revenue schema");
assert(/^JP-REV-[A-Z0-9-]+$/.test(sample.experimentId), "experimentId must use the JP-REV namespace");
assert(
  [
    "PREPARED",
    "PUBLISHED",
    "INTEREST",
    "AGREED",
    "PAID_PENDING",
    "PAID_SETTLED",
    "DELIVERED",
    "ACCEPTED",
    "REFUNDED",
    "DISPUTED",
    "CANCELLED",
    "UNKNOWN"
  ].includes(sample.status),
  "unsupported experiment status"
);

const { offer, proofPackage, channel, metrics, money, claims, authority, fundingUrls } = sample;

assert(offer?.name && offer?.type, "offer name and type are required");
assertNonNegativeNumber(offer.priceUsd, "offer.priceUsd");
assert(offer.priceUsd > 0, "offer.priceUsd must be greater than zero");
assertPositiveInteger(offer.quantityTarget, "offer.quantityTarget");
assertPositiveInteger(offer.capacity, "offer.capacity");
assertPositiveInteger(offer.deliveryWindowBusinessDays, "offer.deliveryWindowBusinessDays");
assertPositiveInteger(offer.clarificationWindowDays, "offer.clarificationWindowDays");
assert(offer.grossTargetUsd === offer.priceUsd * offer.quantityTarget, "gross target must equal price times quantity target");
assert(Array.isArray(offer.deliverables) && offer.deliverables.length >= 5, "at least five deliverables are required");
assert(Array.isArray(offer.exclusions) && offer.exclusions.length >= 5, "at least five exclusions are required");

for (const [key, value] of Object.entries(offer.scopeLimits ?? {})) {
  assertPositiveInteger(value, `offer.scopeLimits.${key}`);
}
assert(Object.keys(offer.scopeLimits ?? {}).length >= 4, "offer.scopeLimits must define the pilot boundary");
assert(offer.scopeLimits.repositories === 1, "pilot scope must remain limited to one repository");
assert(offer.scopeLimits.maxOpenPullRequests <= 25, "pilot scope must not exceed 25 open pull requests");
assert(offer.scopeLimits.maxOpenIssues <= 50, "pilot scope must not exceed 50 open issues");

assert(Array.isArray(proofPackage) && proofPackage.length >= 6, "proofPackage must contain at least six files");
assert(new Set(proofPackage).size === proofPackage.length, "proofPackage paths must be unique");
for (const [index, proofPath] of proofPackage.entries()) {
  assertPublicRelativePath(proofPath, `proofPackage[${index}]`);
  const proofText = await readFile(proofPath, "utf8");
  assert(proofText.trim().length >= 40, `proof package file is empty or incomplete: ${proofPath}`);
}

assert(channel?.publicationAuthorized === false, "sample publication must remain unauthorized");
assert(channel?.outreachAuthorized === false, "sample outreach must remain unauthorized");
assertPublicRelativePath(channel?.inboundRequestPath, "channel.inboundRequestPath");
assert(proofPackage.includes(channel.inboundRequestPath), "inbound request path must be part of the proof package");

for (const [key, value] of Object.entries(metrics ?? {})) {
  assertNonNegativeNumber(value, `metrics.${key}`);
}
assert(metrics.orders <= offer.quantityTarget, "orders must not exceed the experiment quantity target");
assert(metrics.deliveriesAccepted <= metrics.orders, "accepted deliveries must not exceed orders");

for (const key of ["grossRevenueUsd", "feesUsd", "refundsUsd", "netCashUsd"]) {
  assertNonNegativeNumber(money?.[key], `money.${key}`);
}

assert(
  money.netCashUsd === money.grossRevenueUsd - money.feesUsd - money.refundsUsd,
  "net cash arithmetic is inconsistent"
);
assert(
  ["UNKNOWN", "PAID_PENDING", "PAID_SETTLED", "REFUNDED", "DISPUTED"].includes(money.settlementState),
  "unsupported settlement state"
);
if (money.settlementState !== "PAID_SETTLED") {
  assert(money.grossRevenueUsd === 0, "unsettled prepared sample must not count gross revenue");
}

for (const [key, value] of Object.entries(claims ?? {})) {
  assert(value === false, `claims.${key} must be false in the prepared sample`);
}

assert(authority?.offerPreparation === "authorized", "offer preparation must be authorized");
for (const key of ["publication", "outreach", "contract", "delivery"]) {
  assert(authority?.[key] === "not_authorized", `authority.${key} must remain not_authorized`);
}
assert(authority?.paymentExecution === "external_provider_only", "payment execution must remain with an external provider");

assert(Array.isArray(fundingUrls) && fundingUrls.length >= 1 && fundingUrls.length <= 4, "fundingUrls must contain one to four URLs");
const fundingFileUrls = fundingText.match(/https:\/\/[^"\s]+/g) ?? [];
for (const urlText of fundingUrls) {
  const url = new URL(urlText);
  assert(url.protocol === "https:", `funding URL must use HTTPS: ${urlText}`);
  assert(fundingFileUrls.includes(urlText), `funding URL missing from FUNDING.yml: ${urlText}`);
}

assert(receipt.schemaVersion === receiptSchema.properties.schemaVersion.const, "receipt schemaVersion must match the audit receipt schema");
assert(/^JP-AUDIT-[A-Z0-9-]+$/.test(receipt.auditId), "auditId must use the JP-AUDIT namespace");
assert(receipt.experimentId === sample.experimentId, "audit receipt must reference the revenue experiment");
assert(receipt.agreement?.priceUsd === offer.priceUsd, "audit receipt price must match the offer price");
assert(receipt.agreement?.state === "NOT_AGREED", "prepared receipt must not claim an agreement");
assert(receipt.payment?.settlementState === "UNKNOWN", "prepared receipt must not claim settled money");
for (const key of ["grossUsd", "feesUsd", "refundsUsd", "netCashUsd"]) {
  assertNonNegativeNumber(receipt.payment?.[key], `receipt.payment.${key}`);
}
assert(
  receipt.payment.netCashUsd === receipt.payment.grossUsd - receipt.payment.feesUsd - receipt.payment.refundsUsd,
  "audit receipt net cash arithmetic is inconsistent"
);
assert(receipt.payment.externalProviderReceiptStoredPrivately === false, "prepared receipt must not claim a stored provider receipt");
assert(receipt.delivery?.state === "NOT_STARTED", "prepared receipt must not claim delivery");
assert(proofPackage.includes(receipt.delivery?.templatePath), "audit receipt delivery template must be in the proof package");
assert(Array.isArray(receipt.externalActionsPerformed) && receipt.externalActionsPerformed.length === 0, "prepared receipt must record no external actions");
for (const [key, value] of Object.entries(receipt.claims ?? {})) {
  assert(value === false, `receipt.claims.${key} must be false in the prepared sample`);
}
for (const [key, value] of Object.entries(receipt.publicDataBoundary ?? {})) {
  assert(value === false, `receipt.publicDataBoundary.${key} must be false in the public sample`);
}

const forbiddenKey = /^(password|secret|token|routingNumber|bankAccount|accountNumber|donorIdentity|customerName|customerEmail|buyerIdentity|providerTransactionId|payoutData)$/i;
for (const key of [...collectKeys(sample), ...collectKeys(receipt)]) {
  assert(!forbiddenKey.test(key), `forbidden sensitive field in public sample: ${key}`);
}

assert(
  typeof sample.nextControlledAction === "string" && sample.nextControlledAction.length >= 20,
  "nextControlledAction is required"
);
assert(
  typeof receipt.nextControlledAction === "string" && receipt.nextControlledAction.length >= 20,
  "audit receipt nextControlledAction is required"
);

console.log("Revenue experiment package: PASS");
console.log(`Experiment: ${sample.experimentId}`);
console.log(`Gross target: $${offer.grossTargetUsd}`);
console.log(`Authority: ${authority.publication}/${authority.outreach}`);
console.log(`Funding URLs verified: ${fundingUrls.length}`);
console.log(`Proof files verified: ${proofPackage.length}`);
console.log(`Schemas verified: ${experimentSchema.title}/${receiptSchema.title}`);
console.log(`Audit receipt: ${receipt.auditId}/${receipt.result}`);
