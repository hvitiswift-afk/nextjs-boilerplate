import { readFile } from "node:fs/promises";

const paths = {
  sample: process.argv[2] ?? "examples/revenue-experiment.sample.json",
  funding: process.argv[3] ?? ".github/FUNDING.yml",
  auditReceipt: process.argv[4] ?? "examples/github-control-tower-audit-receipt.sample.json",
  experimentSchema: process.argv[5] ?? "schemas/revenue/revenue-experiment.schema.json",
  auditReceiptSchema: process.argv[6] ?? "schemas/revenue/audit-receipt.schema.json",
  publicationReceipt: process.argv[7] ?? "receipts/revenue/JP-REV-001-PUBLICATION.json",
  publicationReceiptSchema: process.argv[8] ?? "schemas/revenue/publication-receipt.schema.json",
  authorityReceipt: process.argv[9] ?? "receipts/revenue/JP-REV-001-AUTHORITY.json",
  authorityReceiptSchema: process.argv[10] ?? "schemas/revenue/authority-receipt.schema.json",
  intakeWorkflow: process.argv[11] ?? ".github/workflows/audit-request-intake.yml",
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
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

function grantMap(receipt) {
  return new Map((receipt.grants ?? []).map((grant) => [grant.grantId, grant]));
}

const texts = await Promise.all([
  readFile(paths.sample, "utf8"),
  readFile(paths.funding, "utf8"),
  readFile(paths.auditReceipt, "utf8"),
  readFile(paths.experimentSchema, "utf8"),
  readFile(paths.auditReceiptSchema, "utf8"),
  readFile(paths.publicationReceipt, "utf8"),
  readFile(paths.publicationReceiptSchema, "utf8"),
  readFile(paths.authorityReceipt, "utf8"),
  readFile(paths.authorityReceiptSchema, "utf8"),
  readFile(paths.intakeWorkflow, "utf8"),
]);

const [
  sampleText,
  fundingText,
  auditReceiptText,
  experimentSchemaText,
  auditReceiptSchemaText,
  publicationReceiptText,
  publicationReceiptSchemaText,
  authorityReceiptText,
  authorityReceiptSchemaText,
  intakeWorkflowText,
] = texts;

const sample = JSON.parse(sampleText);
const auditReceipt = JSON.parse(auditReceiptText);
const publicationReceipt = JSON.parse(publicationReceiptText);
const authorityReceipt = JSON.parse(authorityReceiptText);
const experimentSchema = JSON.parse(experimentSchemaText);
const auditReceiptSchema = JSON.parse(auditReceiptSchemaText);
const publicationReceiptSchema = JSON.parse(publicationReceiptSchemaText);
const authorityReceiptSchema = JSON.parse(authorityReceiptSchemaText);

assertSchemaContract(experimentSchema, {
  label: "revenue experiment schema",
  version: "1.2.0",
  idSuffix: "/schemas/revenue/revenue-experiment.schema.json",
  requiredFields: [
    "experimentId",
    "status",
    "offer",
    "proofPackage",
    "authorityReceiptPath",
    "channel",
    "money",
    "authority",
  ],
});
assertSchemaContract(auditReceiptSchema, {
  label: "audit receipt schema",
  version: "1.0.0",
  idSuffix: "/schemas/revenue/audit-receipt.schema.json",
  requiredFields: ["auditId", "experimentId", "agreement", "payment", "delivery", "publicDataBoundary"],
});
assertSchemaContract(publicationReceiptSchema, {
  label: "publication receipt schema",
  version: "1.0.0",
  idSuffix: "/schemas/revenue/publication-receipt.schema.json",
  requiredFields: ["receiptId", "experimentId", "issueNumber", "publicationUrl", "publicationAuthorized", "publicDataBoundary"],
});
assertSchemaContract(authorityReceiptSchema, {
  label: "authority receipt schema",
  version: "1.0.0",
  idSuffix: "/schemas/revenue/authority-receipt.schema.json",
  requiredFields: ["receiptId", "experimentId", "authorityVersion", "authorizedBy", "grants", "guardrails", "revoked"],
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
    "UNKNOWN",
  ].includes(sample.status),
  "unsupported experiment status",
);

const { offer, proofPackage, authorityReceiptPath, channel, metrics, money, claims, authority, fundingUrls } = sample;

assert(offer?.name && offer?.type, "offer name and type are required");
assert(offer.priceUsd === 100, "pilot price must remain $100 USD");
assert(offer.quantityTarget === 10, "expanded quantity target must be ten");
assert(offer.firstMilestoneUsd === 500, "first milestone must remain $500 USD");
assert(offer.grossTargetUsd === 1000, "expanded gross target must be $1,000 USD");
assert(offer.capacity === 10, "expanded total capacity must be ten audits");
assert(offer.maxConcurrentDeliveries === 2, "active delivery capacity must remain two");
assert(offer.grossTargetUsd === offer.priceUsd * offer.quantityTarget, "gross target must equal price times quantity target");
assert(offer.firstMilestoneUsd === offer.priceUsd * 5, "first milestone must equal five audits at the pilot price");
assert(offer.capacity === offer.quantityTarget, "total capacity must equal the expanded quantity target");
assert(offer.maxConcurrentDeliveries <= offer.capacity, "active delivery limit cannot exceed total capacity");
assertPositiveInteger(offer.deliveryWindowBusinessDays, "offer.deliveryWindowBusinessDays");
assert(Number.isInteger(offer.clarificationWindowDays) && offer.clarificationWindowDays >= 0, "offer.clarificationWindowDays must be non-negative");
assert(Array.isArray(offer.deliverables) && offer.deliverables.length >= 5, "at least five deliverables are required");
assert(Array.isArray(offer.exclusions) && offer.exclusions.length >= 5, "at least five exclusions are required");
for (const [key, value] of Object.entries(offer.scopeLimits ?? {})) {
  assertPositiveInteger(value, `offer.scopeLimits.${key}`);
}
assert(offer.scopeLimits.repositories === 1, "pilot scope must remain limited to one repository");
assert(offer.scopeLimits.maxOpenPullRequests <= 25, "pilot scope must not exceed 25 open pull requests");
assert(offer.scopeLimits.maxOpenIssues <= 50, "pilot scope must not exceed 50 open issues");

assert(Array.isArray(proofPackage) && proofPackage.length >= 11, "published proof package must contain the authority and automation assets");
assert(new Set(proofPackage).size === proofPackage.length, "proofPackage paths must be unique");
for (const [index, proofPath] of proofPackage.entries()) {
  assertPublicRelativePath(proofPath, `proofPackage[${index}]`);
  const proofText = await readFile(proofPath, "utf8");
  assert(proofText.trim().length >= 40, `proof package file is empty or incomplete: ${proofPath}`);
}
assert(proofPackage.includes(channel?.inboundRequestPath), "inbound request path must be part of the proof package");
assert(proofPackage.includes(paths.publicationReceipt), "publication receipt must be part of the proof package");
assert(proofPackage.includes(paths.authorityReceipt), "authority receipt must be part of the proof package");
assert(proofPackage.includes(paths.intakeWorkflow), "intake automation must be part of the proof package");
assert(proofPackage.includes("docs/repository/REVENUE-AUTHORITY-CAPACITY-V3.md"), "v3 authority document must be part of the proof package");
assert(authorityReceiptPath === paths.authorityReceipt, "authorityReceiptPath must identify the canonical authority receipt");
assert(channel?.outreachAuthorized === false, "direct outreach must remain unauthorized");

if (sample.status === "PUBLISHED") {
  assert(channel.publicationAuthorized === true, "published sample must record publication authorization");
  assert(authority?.publication === "authorized", "published sample publication authority must be authorized");
  assert(channel.name === "GitHub inbound issue #133", "published channel must identify GitHub Issue #133");
} else {
  throw new Error("this public baseline supports the PUBLISHED experiment state");
}

for (const [key, value] of Object.entries(metrics ?? {})) assertNonNegativeNumber(value, `metrics.${key}`);
assert(metrics.orders <= offer.quantityTarget, "orders must not exceed the expanded quantity target");
assert(metrics.orders <= offer.capacity, "orders must not exceed total capacity");
assert(metrics.deliveriesAccepted <= metrics.orders, "accepted deliveries must not exceed orders");

for (const key of ["grossRevenueUsd", "feesUsd", "refundsUsd", "netCashUsd"]) {
  assertNonNegativeNumber(money?.[key], `money.${key}`);
}
assert(money.netCashUsd === money.grossRevenueUsd - money.feesUsd - money.refundsUsd, "net cash arithmetic is inconsistent");
assert(["UNKNOWN", "PAID_PENDING", "PAID_SETTLED", "REFUNDED", "DISPUTED"].includes(money.settlementState), "unsupported settlement state");
if (money.settlementState !== "PAID_SETTLED") assert(money.grossRevenueUsd === 0, "unsettled sample must not count gross revenue");

for (const [key, value] of Object.entries(claims ?? {})) assert(value === false, `claims.${key} must remain false`);
assert(authority?.offerPreparation === "authorized", "offer preparation must be authorized");
for (const key of ["outreach", "contract", "delivery"]) {
  assert(authority?.[key] === "not_authorized", `authority.${key} must remain not_authorized in the public baseline`);
}
assert(authority?.paymentExecution === "external_provider_only", "payment execution must remain with an external provider");

assert(Array.isArray(fundingUrls) && fundingUrls.length >= 1 && fundingUrls.length <= 4, "fundingUrls must contain one to four URLs");
const fundingFileUrls = fundingText.match(/https:\/\/[^"\s]+/g) ?? [];
for (const urlText of fundingUrls) {
  const url = new URL(urlText);
  assert(url.protocol === "https:", `funding URL must use HTTPS: ${urlText}`);
  assert(fundingFileUrls.includes(urlText), `funding URL missing from FUNDING.yml: ${urlText}`);
}

assert(auditReceipt.schemaVersion === auditReceiptSchema.properties.schemaVersion.const, "audit receipt schemaVersion mismatch");
assert(/^JP-AUDIT-[A-Z0-9-]+$/.test(auditReceipt.auditId), "auditId must use the JP-AUDIT namespace");
assert(auditReceipt.experimentId === sample.experimentId, "audit receipt must reference the revenue experiment");
assert(auditReceipt.agreement?.priceUsd === offer.priceUsd, "audit receipt price must match the offer price");
assert(auditReceipt.agreement?.state === "NOT_AGREED", "prepared audit receipt must not claim an agreement");
assert(auditReceipt.payment?.settlementState === "UNKNOWN", "prepared audit receipt must not claim settled money");
for (const key of ["grossUsd", "feesUsd", "refundsUsd", "netCashUsd"]) {
  assertNonNegativeNumber(auditReceipt.payment?.[key], `auditReceipt.payment.${key}`);
}
assert(auditReceipt.payment.netCashUsd === auditReceipt.payment.grossUsd - auditReceipt.payment.feesUsd - auditReceipt.payment.refundsUsd, "audit receipt net cash arithmetic is inconsistent");
assert(auditReceipt.payment.externalProviderReceiptStoredPrivately === false, "prepared audit receipt must not claim a stored provider receipt");
assert(auditReceipt.delivery?.state === "NOT_STARTED", "prepared audit receipt must not claim delivery");
assert(proofPackage.includes(auditReceipt.delivery?.templatePath), "audit receipt delivery template must be in the proof package");
assert(Array.isArray(auditReceipt.externalActionsPerformed) && auditReceipt.externalActionsPerformed.length === 0, "prepared audit receipt must record no client external actions");
for (const [key, value] of Object.entries(auditReceipt.claims ?? {})) assert(value === false, `auditReceipt.claims.${key} must be false`);
for (const [key, value] of Object.entries(auditReceipt.publicDataBoundary ?? {})) assert(value === false, `auditReceipt.publicDataBoundary.${key} must be false`);

assert(publicationReceipt.schemaVersion === publicationReceiptSchema.properties.schemaVersion.const, "publication receipt schemaVersion mismatch");
assert(publicationReceipt.experimentId === sample.experimentId, "publication receipt must reference the revenue experiment");
assert(publicationReceipt.result === "PUBLISHED", "publication receipt result must be PUBLISHED");
assert(publicationReceipt.channel === "GITHUB_INBOUND_ISSUE", "publication receipt channel is incorrect");
assert(publicationReceipt.issueNumber === 133, "publication receipt must reference Issue #133");
assert(publicationReceipt.publicationAuthorized === true, "publication receipt must record authorization");
assert(publicationReceipt.directOutreachSent === 0, "publication receipt must record zero direct outreach");
assert(publicationReceipt.orders === metrics.orders, "publication receipt orders must match experiment metrics");
assert(publicationReceipt.grossRevenueUsd === money.grossRevenueUsd, "publication receipt gross revenue must match experiment money");
assert(publicationReceipt.settledCashUsd === money.netCashUsd, "publication receipt settled cash must match experiment net cash");

assert(authorityReceipt.schemaVersion === authorityReceiptSchema.properties.schemaVersion.const, "authority receipt schemaVersion mismatch");
assert(authorityReceipt.experimentId === sample.experimentId, "authority receipt must reference the revenue experiment");
assert(authorityReceipt.receiptId === "JP-REV-001-AUTHORITY-2026-07-29", "authority receipt ID is incorrect");
assert(authorityReceipt.authorityVersion === "3.0.0", "authority version must be 3.0.0");
assert(authorityReceipt.authorizedBy === "JP", "authority receipt must identify JP");
assert(authorityReceipt.revoked === false, "authority receipt must remain active");
assert(Array.isArray(authorityReceipt.grants) && authorityReceipt.grants.length >= 10, "authority receipt must contain the complete grant map");

const grants = grantMap(authorityReceipt);
const expectedGrants = {
  CAPACITY_EXPANSION: ["AUTHORIZED_ACTIVE", false],
  GITHUB_INBOUND_PUBLICATION: ["AUTHORIZED_ACTIVE", true],
  GITHUB_INTAKE_AUTOMATION: ["AUTHORIZED_ACTIVE", true],
  VERIFIED_MERGE: ["AUTHORIZED_CONDITIONAL", false],
  FIXED_SITE_DEPLOYMENT: ["AUTHORIZED_CONDITIONAL", true],
  DIRECT_OUTREACH: ["NOT_AUTHORIZED", false],
  CONTRACT_ACCEPTANCE: ["HUMAN_APPROVAL_REQUIRED", false],
  PAYMENT_EXECUTION: ["EXTERNAL_PROVIDER_ONLY", false],
  DELIVERY_START: ["HUMAN_APPROVAL_REQUIRED", false],
  REFUND_OR_DISPUTE_ACTION: ["HUMAN_APPROVAL_REQUIRED", false],
};
for (const [grantId, [state, automated]] of Object.entries(expectedGrants)) {
  const grant = grants.get(grantId);
  assert(grant, `authority receipt missing grant: ${grantId}`);
  assert(grant.state === state, `${grantId} authority state is incorrect`);
  assert(grant.automated === automated, `${grantId} automation state is incorrect`);
  assert(Array.isArray(grant.scope) && grant.scope.length >= 1, `${grantId} scope is required`);
  assert(Array.isArray(grant.evidenceRequired) && grant.evidenceRequired.length >= 1, `${grantId} evidence is required`);
}
for (const [key, value] of Object.entries(authorityReceipt.guardrails ?? {})) {
  assert(value === false, `authorityReceipt.guardrails.${key} must remain false`);
}

for (const requiredText of [
  "issues:",
  "startsWith(github.event.issue.title, '[Audit request]:')",
  "issues: write",
  "jp-audit-intake-v1",
  "audit-fit-check",
  "needs-jp-review",
  "not-an-order",
  "not an order, capacity reservation, contract, invoice, proof of payment",
  "PAID_SETTLED",
]) {
  assert(intakeWorkflowText.includes(requiredText), `intake workflow is missing boundary text: ${requiredText}`);
}
assert(intakeWorkflowText.match(/createComment/g)?.length === 1, "intake workflow must contain exactly one comment-creation path");
assert(intakeWorkflowText.includes("comments.some"), "intake workflow must check for the idempotency marker");
assert(!intakeWorkflowText.includes("pull_request_target"), "intake workflow must not use pull_request_target");
assert(!intakeWorkflowText.includes("payments: write"), "intake workflow must not request payment permissions");

const forbiddenKey = /^(password|secret|token|routingNumber|bankAccount|accountNumber|donorIdentity|customerName|customerEmail|buyerIdentity|providerTransactionId|payoutData)$/i;
for (const key of [
  ...collectKeys(sample),
  ...collectKeys(auditReceipt),
  ...collectKeys(publicationReceipt),
  ...collectKeys(authorityReceipt),
]) {
  assert(!forbiddenKey.test(key), `forbidden sensitive field in public evidence: ${key}`);
}

for (const [label, value] of [
  ["experiment", sample.nextControlledAction],
  ["audit receipt", auditReceipt.nextControlledAction],
  ["publication receipt", publicationReceipt.nextControlledAction],
  ["authority receipt", authorityReceipt.nextControlledAction],
]) {
  assert(typeof value === "string" && value.length >= 20, `${label} nextControlledAction is required`);
}

console.log("Revenue experiment authority package: PASS");
console.log(`Experiment: ${sample.experimentId}/${sample.status}`);
console.log(`Price: $${offer.priceUsd}`);
console.log(`First milestone: $${offer.firstMilestoneUsd}`);
console.log(`Expanded gross target: $${offer.grossTargetUsd}`);
console.log(`Total slots: ${offer.capacity}`);
console.log(`Maximum active deliveries: ${offer.maxConcurrentDeliveries}`);
console.log(`Authority version: ${authorityReceipt.authorityVersion}`);
console.log(`Automated intake: ${grants.get("GITHUB_INTAKE_AUTOMATION").state}`);
console.log(`Orders: ${metrics.orders}`);
console.log(`Verified settled cash: $${money.netCashUsd}`);
