import { readFile } from "node:fs/promises";

const paths = {
  drive: "receipts/revenue/FARDARTER-DRIVE-V5.json",
  driveSchema: "schemas/revenue/fardarter-drive-v5.schema.json",
  authority: "receipts/revenue/FARDARTER-DRIVE-AUTHORITY-V5.json",
  authoritySchema: "schemas/revenue/fardarter-drive-authority-v5.schema.json",
  gdrive: "receipts/revenue/FARDARTER-DRIVE-GDRIVE-V5.json",
  gdriveSchema: "schemas/revenue/fardarter-drive-gdrive-v5.schema.json",
  experiment: "examples/revenue-experiment.sample.json",
  fitWorkflow: ".github/workflows/fardarter-fit-acceptance-v5.yml",
  executionWorkflow: ".github/workflows/fardarter-approved-execution-v5.yml",
  operatingDoc: "docs/repository/FARDARTER-DRIVE-V5-ACCEPT-EXECUTE-GDRIVE.md",
  api: "app/api/revenue/pilot/route.ts",
  page: "app/github-control-tower-audit/page.tsx",
  revenueWorkflow: ".github/workflows/revenue-experiment.yml",
  deployWorkflow: ".github/workflows/netlify-audit-product-deploy.yml",
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function parseJson(text, label) {
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

const drive = parseJson(text.drive, "Fardarter Drive v5 record");
const driveSchema = parseJson(text.driveSchema, "Fardarter Drive v5 schema");
const authority = parseJson(text.authority, "authority v5 receipt");
const authoritySchema = parseJson(text.authoritySchema, "authority v5 schema");
const gdrive = parseJson(text.gdrive, "Google Drive continuity receipt");
const gdriveSchema = parseJson(text.gdriveSchema, "Google Drive continuity schema");
const experiment = parseJson(text.experiment, "revenue experiment");

assert(drive.driveId === "FARDARTER-DRIVE-V5", "driveId must be FARDARTER-DRIVE-V5");
assert(drive.name === "Fardarter Drive™", "drive name is incorrect");
assert(JSON.stringify(drive.controllingIssues) === JSON.stringify([141, 143, 146]), "controlling issues must be 141, 143, and 146");
assert(driveSchema?.properties?.driveId?.const === drive.driveId, "drive schema must lock driveId");
assert(driveSchema?.properties?.currentEvidence?.properties?.capacity?.const === 100, "drive schema must lock capacity 100");
assert(driveSchema?.properties?.currentEvidence?.properties?.maxConcurrentDeliveries?.const === 10, "drive schema must lock active limit 10");

const evidence = drive.currentEvidence;
assert(evidence.priceUsd === 100, "price must remain $100 USD");
assert(evidence.quantityTarget === 100, "quantity target must be 100");
assert(evidence.firstMilestoneUsd === 1000, "first milestone must be $1,000");
assert(evidence.grossTargetUsd === 10000, "gross target must be $10,000");
assert(evidence.capacity === 100, "capacity must be 100");
assert(evidence.maxConcurrentDeliveries === 10, "active delivery limit must be 10");
assert(evidence.activeDeliveries === 0, "baseline must record zero active deliveries");
assert(evidence.fitApprovedRequests === 0, "baseline must record zero fit-approved requests");
assert(evidence.orders === 0, "baseline must record zero orders");
assert(evidence.verifiedGrossRevenueUsd === 0, "baseline must record zero gross revenue");
assert(evidence.verifiedSettledCashUsd === 0, "baseline must record zero settled cash");
assert(evidence.googleDriveContinuity === "CONNECTED_PRIVATE", "Google Drive continuity must be private and connected");
assert(evidence.receivedCashRequires === "PAID_SETTLED", "received cash must require PAID_SETTLED");
assert(evidence.grossTargetUsd === evidence.priceUsd * evidence.quantityTarget, "gross target arithmetic is inconsistent");

assert(drive.acceptanceModel.automatedState === "FIT_APPROVED_FOR_SCOPE_DRAFT", "automated fit state is incorrect");
assert(drive.acceptanceModel.binding === false, "automated fit acceptance must be nonbinding");
assert(drive.acceptanceModel.criteria.length >= 5, "fit criteria are incomplete");
assert(drive.acceptanceModel.prohibitedConsequences.includes("contract formation"), "fit acceptance must prohibit contract formation");
assert(drive.acceptanceModel.prohibitedConsequences.includes("work start"), "fit acceptance must prohibit work start");

assert(drive.executionModel.state === "AUTHORIZED_BOUNDED", "execution state must be AUTHORIZED_BOUNDED");
assert(drive.executionModel.automaticWorkStart === false, "paid work start must not be automatic");
assert(drive.executionModel.backpressure.activeLimit === 10, "backpressure active limit must be 10");
assert(drive.executionModel.backpressure.pauseNewWorkStartsAtLimit === true, "backpressure must pause work starts");
assert(drive.executionModel.backpressure.continueIntakeAndDraftingAtLimit === true, "intake and drafting should continue at the active limit");

const expectedStages = [
  ["FD-001K", "1000", "MILESTONE_TARGET"],
  ["FD-010K", "10000", "CURRENT_EXPERIMENT_TARGET"],
  ["FD-001M", "1000000", "ASPIRATIONAL_HORIZON"],
  ["FD-001B", "1000000000", "ASPIRATIONAL_HORIZON"],
  ["FD-001T", "1000000000000", "ASPIRATIONAL_HORIZON"],
  ["FD-001Q", "1000000000000000", "SYMBOLIC_POSSIBILITY_HORIZON"],
];
assert(drive.horizons.length === expectedStages.length, "exactly six v5 horizons are required");
for (const [index, [stageId, amountUsd, classification]] of expectedStages.entries()) {
  const stage = drive.horizons[index];
  assert(stage.stageId === stageId, `${stageId} stage is missing or out of order`);
  assert(stage.amountUsd === amountUsd, `${stageId} amount is incorrect`);
  assert(stage.classification === classification, `${stageId} classification is incorrect`);
  assert(stage.achieved === false && stage.forecast === false && stage.guaranteed === false, `${stageId} must remain unachieved, nonforecast, and nonguaranteed`);
  if (index > 0) assert(BigInt(stage.amountUsd) > BigInt(drive.horizons[index - 1].amountUsd), "horizon amounts must increase strictly");
}
assert(drive.progressionRules.automaticStagePromotion === false, "automatic stage promotion must remain disabled");
assert(drive.progressionRules.slotOrActiveLimitIncreaseProvesDemand === false, "capacity expansion must not prove demand");
assert(drive.progressionRules.manualCapacityMayBeMultipliedToClaimHigherStage === false, "manual capacity must not prove a higher horizon");
for (const value of Object.values(drive.claims)) assert(value === false, "all drive claims must remain false");

assert(authority.authorityVersion === "5.0.0", "authority version must be 5.0.0");
assert(authority.driveId === drive.driveId, "authority must reference Fardarter Drive v5");
assert(authority.experimentId === "JP-REV-001", "authority experiment ID is incorrect");
assert(authority.authorizedBy === "JP", "authority must identify JP");
assert(authority.revoked === false, "authority must remain active");
assert(authoritySchema?.properties?.authorityVersion?.const === "5.0.0", "authority schema must lock version 5.0.0");

const grants = new Map(authority.grants.map((grant) => [grant.grantId, grant]));
const expectedGrantStates = {
  CAPACITY_100: ["AUTHORIZED_ACTIVE", false],
  ACTIVE_DELIVERY_LIMIT_10: ["AUTHORIZED_ACTIVE", true],
  NONBINDING_FIT_ACCEPTANCE: ["AUTHORIZED_ACTIVE", true],
  PREAPPROVED_REVERSIBLE_EXECUTION: ["AUTHORIZED_ACTIVE", true],
  GOOGLE_DRIVE_PRIVATE_CONTINUITY: ["AUTHORIZED_ACTIVE", true],
  DOCUMENT_DRAFT_AUTOMATION: ["AUTHORIZED_ACTIVE", true],
  RELEVANT_EXACT_OUTREACH: ["AUTHORIZED_CONDITIONAL", false],
  VERIFIED_MERGE: ["AUTHORIZED_CONDITIONAL", false],
  FIXED_SITE_DEPLOYMENT: ["AUTHORIZED_CONDITIONAL", true],
  CONTRACT_ACCEPTANCE: ["HUMAN_APPROVAL_REQUIRED", false],
  INDEMNITY_AND_LIABILITY_TERMS: ["COUNSEL_REVIEW_REQUIRED", false],
  PAYMENT_EXECUTION: ["EXTERNAL_PROVIDER_ONLY", false],
  PAID_DELIVERY_START: ["HUMAN_APPROVAL_REQUIRED", false],
  REFUND_DISPUTE_ADMISSION_OR_IRREVERSIBLE_ACTION: ["HUMAN_APPROVAL_REQUIRED", false],
};
for (const [grantId, [state, automated]] of Object.entries(expectedGrantStates)) {
  const grant = grants.get(grantId);
  assert(grant, `missing authority grant: ${grantId}`);
  assert(grant.state === state, `${grantId} state is incorrect`);
  assert(grant.automated === automated, `${grantId} automation setting is incorrect`);
}
for (const value of Object.values(authority.guardrails)) assert(value === false, "authority guardrails must remain false");

assert(gdrive.state === "CONNECTED_PRIVATE", "Google Drive state must be CONNECTED_PRIVATE");
assert(gdrive.folderTitle === "Fardarter Drive™", "Google Drive folder title is incorrect");
assert(gdrive.folderReferenceStoredPrivately === true, "folder reference must be private");
assert(gdrive.publicFolderUrlExposed === false, "public Drive folder URL must not be exposed");
assert(gdrive.publicFileIdsExposed === false, "public Drive file IDs must not be exposed");
assert(gdrive.documents.length >= 2, "at least two private continuity documents are required");
assert(gdrive.automation.createPrivateWorkPackageAfterFitApproval === true, "private work-package automation must be enabled");
assert(gdrive.automation.workPackageCreatesContract === false, "Drive work package must not create a contract");
assert(gdrive.automation.workPackageCreatesPaymentObligation === false, "Drive work package must not create payment obligations");
assert(gdrive.automation.workPackageStartsPaidDelivery === false, "Drive work package must not start paid delivery");
assert(gdriveSchema?.properties?.state?.const === "CONNECTED_PRIVATE", "Google Drive schema must lock private connected state");
const gdriveSerialized = JSON.stringify(gdrive);
assert(!gdriveSerialized.includes("drive.google.com"), "public receipt must not contain a Drive folder URL");
assert(!gdriveSerialized.includes("docs.google.com"), "public receipt must not contain a Google Doc URL");

assert(experiment.offer.quantityTarget === 100, "revenue experiment quantity target must be 100");
assert(experiment.offer.firstMilestoneUsd === 1000, "revenue experiment first milestone must be $1,000");
assert(experiment.offer.grossTargetUsd === 10000, "revenue experiment gross target must be $10,000");
assert(experiment.offer.capacity === 100, "revenue experiment capacity must be 100");
assert(experiment.offer.maxConcurrentDeliveries === 10, "revenue experiment active limit must be 10");
assert(experiment.metrics.orders === 0, "revenue experiment must not claim orders");
assert(experiment.money.netCashUsd === 0, "revenue experiment must not claim settled cash");

for (const requiredText of [
  "FIT_APPROVED_FOR_SCOPE_DRAFT",
  "jp-fardarter-fit-v5",
  "fit-approved-for-scope-draft",
  "needs-scope-draft",
  "not-an-order",
  "PAID_SETTLED",
]) assert(text.fitWorkflow.includes(requiredText), `fit workflow missing: ${requiredText}`);
assert(text.fitWorkflow.match(/createComment/g)?.length === 1, "fit workflow must have one comment path");
assert(!text.fitWorkflow.includes("payments: write"), "fit workflow must not request payment permissions");
assert(!text.fitWorkflow.includes("pull_request_target"), "fit workflow must not use pull_request_target");

for (const requiredText of [
  "fd-execute-approved",
  "VERIFY_AND_BUILD",
  "npm run revenue:verify",
  "npm run build",
  "externalActionsPerformed: []",
  "contract_acceptance",
  "payment_execution",
  "paid_work_start",
  "googleDriveUrlExposed: false",
]) assert(text.executionWorkflow.includes(requiredText), `execution workflow missing: ${requiredText}`);
assert(!text.executionWorkflow.includes("contents: write"), "execution workflow must not have repository write permission");
assert(!text.executionWorkflow.includes("payments: write"), "execution workflow must not request payment permissions");

assert(text.operatingDoc.includes("100"), "operating document must show 100 slots");
assert(text.operatingDoc.includes("10"), "operating document must show active limit 10");
assert(text.operatingDoc.includes("Google Drive"), "operating document must cover Google Drive continuity");
assert(text.operatingDoc.includes("nonbinding fit acceptance"), "operating document must explain nonbinding fit acceptance");
assert(text.api.includes("FARDARTER-DRIVE-V5.json"), "API must import the v5 drive record");
assert(text.api.includes("FARDARTER-DRIVE-AUTHORITY-V5.json"), "API must import v5 authority");
assert(text.api.includes("FARDARTER-DRIVE-GDRIVE-V5.json"), "API must import Google Drive continuity");
assert(text.page.includes("Fardarter Drive™ v5"), "product page must display v5");
assert(text.page.includes("100 total slots"), "product page must display 100 total slots");
assert(text.page.includes("10 active"), "product page must display active limit 10");
assert(text.revenueWorkflow.includes("check-fardarter-drive-v5.mjs"), "revenue workflow must run the v5 validator");
assert(text.deployWorkflow.includes("FARDARTER-DRIVE-V5"), "deployment workflow must verify v5");
assert(text.deployWorkflow.includes("googleDriveContinuity"), "deployment workflow must verify Google Drive continuity state");

const forbiddenSensitiveKey = /^(password|secret|token|routingNumber|bankAccount|accountNumber|customerEmail|customerName|providerTransactionId|payoutData|taxId|driveFolderId|driveFileId)$/i;
for (const key of [
  ...collectKeys(drive),
  ...collectKeys(authority),
  ...collectKeys(gdrive),
]) assert(!forbiddenSensitiveKey.test(key), `forbidden sensitive public field: ${key}`);

console.log("Fardarter Drive v5: PASS");
console.log(`Drive: ${drive.driveId}`);
console.log(`Authority: ${authority.authorityVersion}`);
console.log(`Capacity: ${evidence.capacity} total / ${evidence.maxConcurrentDeliveries} active`);
console.log(`Acceptance: ${drive.acceptanceModel.automatedState} / binding=${drive.acceptanceModel.binding}`);
console.log(`Execution: ${drive.executionModel.state} / automaticWorkStart=${drive.executionModel.automaticWorkStart}`);
console.log(`Google Drive: ${gdrive.state} / public URLs exposed=${gdrive.publicFolderUrlExposed}`);
console.log(`Current evidence: ${evidence.orders} orders / $${evidence.verifiedGrossRevenueUsd} gross / $${evidence.verifiedSettledCashUsd} settled`);
