import { readFile } from "node:fs/promises";

const samplePath = process.argv[2] ?? "examples/revenue-experiment.sample.json";
const fundingPath = process.argv[3] ?? ".github/FUNDING.yml";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertNonNegativeNumber(value, label) {
  assert(Number.isFinite(value) && value >= 0, `${label} must be a non-negative number`);
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

const [sampleText, fundingText] = await Promise.all([
  readFile(samplePath, "utf8"),
  readFile(fundingPath, "utf8")
]);

const sample = JSON.parse(sampleText);

assert(sample.schemaVersion === "1.0.0", "schemaVersion must be 1.0.0");
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

const { offer, channel, metrics, money, claims, authority, fundingUrls } = sample;

assert(offer?.name && offer?.type, "offer name and type are required");
assertNonNegativeNumber(offer.priceUsd, "offer.priceUsd");
assert(offer.priceUsd > 0, "offer.priceUsd must be greater than zero");
assert(Number.isInteger(offer.quantityTarget) && offer.quantityTarget > 0, "offer.quantityTarget must be a positive integer");
assert(Number.isInteger(offer.capacity) && offer.capacity > 0, "offer.capacity must be a positive integer");
assert(offer.grossTargetUsd === offer.priceUsd * offer.quantityTarget, "gross target must equal price times quantity target");
assert(Array.isArray(offer.deliverables) && offer.deliverables.length >= 3, "at least three deliverables are required");
assert(Array.isArray(offer.exclusions) && offer.exclusions.length >= 3, "at least three exclusions are required");

assert(channel?.publicationAuthorized === false, "sample publication must remain unauthorized");
assert(channel?.outreachAuthorized === false, "sample outreach must remain unauthorized");

for (const [key, value] of Object.entries(metrics ?? {})) {
  assertNonNegativeNumber(value, `metrics.${key}`);
}

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

const forbiddenKey = /^(password|secret|token|routingNumber|bankAccount|accountNumber|donorIdentity|customerEmail|payoutData)$/i;
for (const key of collectKeys(sample)) {
  assert(!forbiddenKey.test(key), `forbidden sensitive field in public sample: ${key}`);
}

assert(
  typeof sample.nextControlledAction === "string" && sample.nextControlledAction.length >= 20,
  "nextControlledAction is required"
);

console.log("Revenue experiment sample: PASS");
console.log(`Experiment: ${sample.experimentId}`);
console.log(`Gross target: $${offer.grossTargetUsd}`);
console.log(`Authority: ${authority.publication}/${authority.outreach}`);
console.log(`Funding URLs verified: ${fundingUrls.length}`);
