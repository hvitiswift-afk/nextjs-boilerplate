import { readFile } from "node:fs/promises";

const paths = {
  drive: "receipts/revenue/FARDARTER-DRIVE-V6.json",
  driveSchema: "schemas/revenue/fardarter-drive-v6.schema.json",
  authority: "receipts/revenue/FARDARTER-DRIVE-AUTHORITY-V6.json",
  authoritySchema: "schemas/revenue/fardarter-drive-authority-v6.schema.json",
  gdrive: "receipts/revenue/FARDARTER-DRIVE-GDRIVE-V6.json",
  gdriveSchema: "schemas/revenue/fardarter-drive-gdrive-v6.schema.json",
  override: "receipts/revenue/FARDARTER-DRIVE-CAPACITY-OVERRIDE-V6.sample.json",
  overrideSchema: "schemas/revenue/fardarter-drive-capacity-override-v6.schema.json",
  experiment: "examples/revenue-experiment.sample.json",
  fitWorkflow: ".github/workflows/fardarter-fit-acceptance-v6.yml",
  executionWorkflow: ".github/workflows/fardarter-approved-execution-v6.yml",
  overrideWorkflow: ".github/workflows/fardarter-capacity-override-v6.yml",
  revenueWorkflow: ".github/workflows/revenue-experiment.yml",
  deployWorkflow: ".github/workflows/netlify-audit-product-deploy.yml",
  api: "app/api/revenue/pilot/route.ts",
  page: "app/github-control-tower-audit/page.tsx",
  operatingDoc: "docs/repository/FARDARTER-DRIVE-V6-CAPACITY-1000-100.md",
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function parse(text, label) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label} must be valid JSON: ${error.message}`);
  }
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
const drive = parse(text.drive, "v6 drive record");
const driveSchema = parse(text.driveSchema, "v6 drive schema");
const authority = parse(text.authority, "v6 authority receipt");
const authoritySchema = parse(text.authoritySchema, "v6 authority schema");
const gdrive = parse(text.gdrive, "v6 Drive receipt");
const gdriveSchema = parse(text.gdriveSchema, "v6 Drive schema");
const override = parse(text.override, "v6 override sample");
const overrideSchema = parse(text.overrideSchema, "v6 override schema");
const experiment = parse(text.experiment, "revenue experiment");

assert(drive.driveId === "FARDARTER-DRIVE-V6", "driveId must be v6");
assert(drive.schemaVersion === "1.0.0", "drive schema version must be 1.0.0");
assert(JSON.stringify(drive.controllingIssues) === JSON.stringify([141, 143, 151]), "v6 controlling issues are incorrect");
assert(driveSchema.properties?.driveId?.const === drive.driveId, "drive schema must lock v6 driveId");
assert(driveSchema.properties?.controllingIssues?.const?.join(",") === "141,143,151", "drive schema must lock controlling issues");

const evidence = drive.currentEvidence;
assert(evidence.priceUsd === 100, "price must remain $100");
assert(evidence.quantityTarget === 1000, "quantity target must be 1,000");
assert(evidence.capacity === 1000, "capacity must be 1,000");
assert(evidence.standardMaxConcurrentDeliveries === 100, "standard active ceiling must be 100");
assert(evidence.effectiveMaxConcurrentDeliveries === 100, "baseline effective ceiling must be 100");
assert(evidence.capacityAbove100Allowed === true, "capacity above 100 must be allowed");
assert(evidence.capacityOverrideState === "INACTIVE_NO_RECEIPT", "baseline override state must be inactive");
assert(evidence.firstMilestoneUsd === 1000, "first milestone must be $1,000");
assert(evidence.grossTargetUsd === 100000, "gross capacity target must be $100,000");
assert(evidence.activeDeliveries === 0 && evidence.fitApprovedRequests === 0 && evidence.orders === 0, "baseline activity states must be zero");
assert(evidence.verifiedGrossRevenueUsd === 0 && evidence.verifiedSettledCashUsd === 0, "baseline money must remain zero");
assert(evidence.receivedCashRequires === "PAID_SETTLED", "cash must require PAID_SETTLED");

const capacity = drive.capacityModel;
assert(capacity.standardActiveCeiling === 100, "standard active ceiling must be 100");
assert(capacity.effectiveActiveCeiling === 100, "effective baseline ceiling must be 100");
assert(capacity.totalPlanningCapacity === 1000, "total planning capacity must be 1,000");
assert(capacity.aboveStandardAllowed === true && capacity.overrideMayExceed100 === true, "above-100 override must be allowed");
assert(capacity.activationRequiresCompleteReceipt === true, "override must require a complete receipt");
assert(capacity.automaticActivation === false, "override activation must not be automatic");
assert(capacity.overrideMayExceedTotalPlanningCapacity === false, "override must not exceed total capacity");
assert(capacity.pauseNewStartsAtEffectiveCeiling === true, "backpressure must use effective ceiling");
assert(capacity.rollbackCeiling === 100, "baseline rollback ceiling must be 100");

assert(drive.acceptanceModel.automatedState === "FIT_APPROVED_FOR_SCOPE_DRAFT", "fit state is incorrect");
assert(drive.acceptanceModel.binding === false, "fit approval must be nonbinding");
assert(drive.executionModel.state === "AUTHORIZED_BOUNDED_ONE_SHOT", "execution state is incorrect");
assert(drive.executionModel.oneShotPerIssue === true, "execution must be one-shot per issue");
assert(drive.executionModel.automaticPaidWorkStart === false, "execution must not start paid work automatically");

const expectedHorizons = [
  ["FD-001K", "1000", "MILESTONE_TARGET"],
  ["FD-010K", "10000", "EXPANSION_MILESTONE"],
  ["FD-100K", "100000", "CURRENT_EXPERIMENT_TARGET"],
  ["FD-001M", "1000000", "ASPIRATIONAL_HORIZON"],
  ["FD-001B", "1000000000", "ASPIRATIONAL_HORIZON"],
  ["FD-001T", "1000000000000", "ASPIRATIONAL_HORIZON"],
  ["FD-001Q", "1000000000000000", "SYMBOLIC_POSSIBILITY_HORIZON"],
];
assert(drive.horizons.length === expectedHorizons.length, "exactly seven horizons are required");
for (const [index, [stageId, amountUsd, classification]] of expectedHorizons.entries()) {
  const stage = drive.horizons[index];
  assert(stage.stageId === stageId, `${stageId} stage order is incorrect`);
  assert(stage.amountUsd === amountUsd, `${stageId} amount is incorrect`);
  assert(stage.classification === classification, `${stageId} classification is incorrect`);
  assert(stage.achieved === false && stage.forecast === false && stage.guaranteed === false, `${stageId} must remain unachieved, nonforecast, and nonguaranteed`);
  if (index > 0) assert(BigInt(stage.amountUsd) > BigInt(drive.horizons[index - 1].amountUsd), "horizons must increase strictly");
}

assert(authority.authorityVersion === "6.0.0", "authority version must be 6.0.0");
assert(authority.authorizedBy === "JP" && authority.revoked === false, "v6 authority must remain active for JP");
assert(authoritySchema.properties?.authorityVersion?.const === "6.0.0", "authority schema must lock v6");
const grants = new Map(authority.grants.map((grant) => [grant.grantId, grant]));
const expectedGrants = {
  CAPACITY_1000: "AUTHORIZED_ACTIVE",
  STANDARD_ACTIVE_LIMIT_100: "AUTHORIZED_ACTIVE",
  ABOVE_100_ACTIVE_OVERRIDE: "AUTHORIZED_ACTIVE",
  NONBINDING_FIT_ACCEPTANCE: "AUTHORIZED_ACTIVE",
  PREAPPROVED_REVERSIBLE_EXECUTION: "AUTHORIZED_ACTIVE",
  GOOGLE_DRIVE_PRIVATE_CONTINUITY: "AUTHORIZED_ACTIVE",
  RELEVANT_EXACT_OUTREACH: "AUTHORIZED_CONDITIONAL",
  VERIFIED_MERGE: "AUTHORIZED_CONDITIONAL",
  FIXED_SITE_DEPLOYMENT: "AUTHORIZED_CONDITIONAL",
  CONTRACT_ACCEPTANCE: "HUMAN_APPROVAL_REQUIRED",
  INDEMNITY_AND_LIABILITY_TERMS: "COUNSEL_REVIEW_REQUIRED",
  PAYMENT_EXECUTION: "EXTERNAL_PROVIDER_ONLY",
  PAID_DELIVERY_START: "HUMAN_APPROVAL_REQUIRED",
  REFUND_DISPUTE_ADMISSION_OR_IRREVERSIBLE_ACTION: "HUMAN_APPROVAL_REQUIRED",
};
for (const [grantId, state] of Object.entries(expectedGrants)) {
  assert(grants.get(grantId)?.state === state, `${grantId} must be ${state}`);
}
assert(grants.get("ABOVE_100_ACTIVE_OVERRIDE")?.automated === false, "above-100 override must not self-activate");
assert(authority.guardrails.above100CapacityProhibited === false, "authority must permit above-100 capacity");
assert(authority.guardrails.overrideActivatesWithoutReceipt === false, "unreceipted override activation must remain false");

assert(gdrive.state === "CONNECTED_PRIVATE", "Google Drive must remain CONNECTED_PRIVATE");
assert(gdrive.publicFolderUrlExposed === false && gdrive.publicFileIdsExposed === false, "public Drive references must remain hidden");
assert(gdrive.automation.validateCapacityOverride === true, "Drive rail must validate overrides");
assert(gdrive.automation.activateOverrideWithoutCompleteReceipt === false, "Drive rail must not activate incomplete override");
assert(gdriveSchema.properties?.state?.const === "CONNECTED_PRIVATE", "Drive schema must lock private state");

assert(override.state === "INACTIVE_NO_RECEIPT", "override sample must remain inactive");
assert(override.standardActiveCeiling === 100 && override.totalPlanningCapacity === 1000, "override sample capacity is incorrect");
assert(override.above100Allowed === true, "override sample must allow above 100");
assert(override.requestedActiveCeiling === null && override.approvedActiveCeiling === null, "baseline override must not claim a ceiling");
assert(Object.values(override.readiness).every((value) => value === false), "baseline readiness must remain false");
assert(Object.values(override.claims).every((value) => value === false), "override claims must remain false");
assert(overrideSchema.properties?.above100Allowed?.const === true, "override schema must allow above 100");

assert(experiment.offer.capacity === 1000, "experiment capacity must be 1,000");
assert(experiment.offer.maxConcurrentDeliveries === 100, "experiment standard active ceiling must be 100");
assert(experiment.offer.grossTargetUsd === 100000, "experiment target must be $100,000");
assert(experiment.authorityReceiptPath === paths.authority, "experiment must use v6 authority");
assert(experiment.metrics.orders === 0 && experiment.money.netCashUsd === 0, "experiment must not claim orders or cash");

for (const required of ["jp-fardarter-fit-v6", "1,000", "100 deliveries may be ACTIVE", "above 100 requires an active capacity override receipt"]) {
  assert(text.fitWorkflow.includes(required), `v6 fit workflow missing: ${required}`);
}
for (const required of ["jp-fardarter-execution-v6-", "oneShotPerIssue: true", "capacity: 1000", "standardActiveCeiling: 100", "effectiveActiveCeiling: 100"]) {
  assert(text.executionWorkflow.includes(required), `v6 execution workflow missing: ${required}`);
}
assert(!text.executionWorkflow.includes("contents: write"), "execution workflow must remain repository read-only");
for (const required of ["CAPACITY_OVERRIDE_ACTIVE", "APPROVED_NOT_ACTIVE", "activationRequiresCanonicalMerge", "requested_active_ceiling"]) {
  assert(text.overrideWorkflow.includes(required), `override workflow missing: ${required}`);
}
assert(!text.overrideWorkflow.includes("contents: write"), "override workflow must not change canonical source directly");
assert(text.revenueWorkflow.includes("npm run revenue:verify"), "revenue workflow must run the unified v6 verifier");
assert(text.deployWorkflow.includes("FARDARTER-DRIVE-V6"), "deployment workflow must verify v6");
assert(text.deployWorkflow.includes("CAPACITY_OVERRIDE_ACTIVE"), "deployment workflow must verify override state");

for (const required of ["FARDARTER-DRIVE-V6.json", "FARDARTER-DRIVE-AUTHORITY-V6.json", "FARDARTER-DRIVE-GDRIVE-V6.json", "FARDARTER-DRIVE-CAPACITY-OVERRIDE-V6.sample.json", "schemaVersion: \"1.5.0\""]) {
  assert(text.api.includes(required), `API missing v6 source: ${required}`);
}
for (const required of ["Fardarter Drive™ v6", "1,000 total slots", "100 standard ACTIVE", "Above 100 is allowed", "CAPACITY_OVERRIDE_ACTIVE", "INACTIVE_NO_RECEIPT", "$100,000", "$1 quadrillion", "not indemnity-proof"]) {
  assert(text.page.includes(required), `page missing v6 boundary: ${required}`);
}
assert(text.operatingDoc.includes("1,000"), "operating doc must state 1,000 slots");
assert(text.operatingDoc.includes("Above 100 is allowed"), "operating doc must permit above-100 override");

const forbiddenKey = /^(password|secret|token|routingNumber|bankAccount|accountNumber|customerEmail|customerName|providerTransactionId|payoutData|taxId|driveFolderId|driveFileId)$/i;
for (const key of [...collectKeys(drive), ...collectKeys(authority), ...collectKeys(gdrive), ...collectKeys(override)]) {
  assert(!forbiddenKey.test(key), `forbidden sensitive public field: ${key}`);
}

console.log("Fardarter Drive v6: PASS");
console.log("Capacity: 1,000 total / 100 standard ACTIVE / 100 effective baseline");
console.log("Above 100: ALLOWED_WITH_COMPLETE_RECEIPT / baseline INACTIVE_NO_RECEIPT");
console.log("Current evidence: 0 orders / $0 gross / $0 settled");
