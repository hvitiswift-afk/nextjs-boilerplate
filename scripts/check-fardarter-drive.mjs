import { readFile } from "node:fs/promises";

const paths = {
  drive: "receipts/revenue/FARDARTER-DRIVE-V4.json",
  driveSchema: "schemas/revenue/fardarter-drive.schema.json",
  authority: "receipts/revenue/FARDARTER-DRIVE-AUTHORITY-V4.json",
  authoritySchema: "schemas/revenue/fardarter-drive-authority-v4.schema.json",
  chain: "receipts/revenue/JP-REV-001-CHAIN-133-140.json",
  chainSchema: "schemas/revenue/chain-133-140.schema.json",
  automation: "receipts/revenue/FARDARTER-DRIVE-V4-AUTOMATION.json",
  experiment: "examples/revenue-experiment.sample.json",
  operatingDoc: "docs/repository/FARDARTER-DRIVE.md",
  legalReadiness: "docs/repository/INDEMNITY-LIABILITY-READINESS.md",
  agreementDraft: "templates/fardarter-drive-service-agreement-draft.md",
  proposalDraft: "templates/fardarter-drive-proposal-scope-draft.md",
  invoiceDraft: "templates/fardarter-drive-invoice-draft.md",
  deliveryDraft: "templates/fardarter-drive-delivery-acceptance-draft.md",
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

function assertDraftBoundary(text, label) {
  assert(text.includes("DRAFT"), `${label} must visibly identify itself as a draft`);
  assert(/Binding effect|Creates an order|Creates a new scope|Payment due/.test(text), `${label} must state a consequence boundary`);
  assert(/NO|none|no/i.test(text), `${label} must preserve a no-action baseline`);
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

const entries = await Promise.all(
  Object.entries(paths).map(async ([key, path]) => [key, await readFile(path, "utf8")]),
);
const text = Object.fromEntries(entries);

const drive = parseJson(text.drive, "Fardarter Drive record");
const driveSchema = parseJson(text.driveSchema, "Fardarter Drive schema");
const authority = parseJson(text.authority, "authority v4 receipt");
const authoritySchema = parseJson(text.authoritySchema, "authority v4 schema");
const chain = parseJson(text.chain, "chain receipt");
const chainSchema = parseJson(text.chainSchema, "chain schema");
const automation = parseJson(text.automation, "automation receipt");
const experiment = parseJson(text.experiment, "revenue experiment");

assert(drive.schemaVersion === "1.0.0", "Fardarter Drive schemaVersion must be 1.0.0");
assert(drive.driveId === "FARDARTER-DRIVE-V4", "driveId must be FARDARTER-DRIVE-V4");
assert(drive.name === "Fardarter Drive™", "drive name is incorrect");
assert(JSON.stringify(drive.controllingIssues) === JSON.stringify([141, 142, 143]), "controlling issues must be 141, 142, and 143");

assert(driveSchema?.properties?.driveId?.const === drive.driveId, "drive schema must lock driveId");
assert(driveSchema?.properties?.name?.const === drive.name, "drive schema must lock the display name");
assert(driveSchema?.properties?.currentEvidence?.properties?.capacity?.const === 10, "drive schema must lock ten-slot capacity");
assert(driveSchema?.properties?.legalRisk?.properties?.indemnityProofClaimed?.const === false, "drive schema must deny indemnity-proof claims");

const expectedStages = [
  ["FD-001K", "1000", "CURRENT_EXPERIMENT_TARGET"],
  ["FD-001M", "1000000", "ASPIRATIONAL_HORIZON"],
  ["FD-001B", "1000000000", "ASPIRATIONAL_HORIZON"],
  ["FD-001T", "1000000000000", "ASPIRATIONAL_HORIZON"],
  ["FD-001Q", "1000000000000000", "SYMBOLIC_POSSIBILITY_HORIZON"],
];
assert(drive.horizons.length === expectedStages.length, "exactly five scale horizons are required");
for (const [index, [stageId, amountUsd, classification]] of expectedStages.entries()) {
  const stage = drive.horizons[index];
  assert(stage.stageId === stageId, `horizon ${index} stageId is incorrect`);
  assert(stage.amountUsd === amountUsd, `${stageId} amount is incorrect`);
  assert(stage.classification === classification, `${stageId} classification is incorrect`);
  assert(stage.achieved === false, `${stageId} must remain unachieved`);
  assert(stage.forecast === false, `${stageId} must not be a forecast`);
  assert(stage.guaranteed === false, `${stageId} must not be guaranteed`);
  assert(Array.isArray(stage.requirements) && stage.requirements.length >= 3, `${stageId} requires stage gates`);
  if (index > 0) {
    assert(BigInt(stage.amountUsd) > BigInt(drive.horizons[index - 1].amountUsd), "horizon amounts must increase strictly");
  }
}

assert(drive.currentEvidence.priceUsd === experiment.offer.priceUsd, "drive price must match the experiment");
assert(drive.currentEvidence.capacity === experiment.offer.capacity, "drive capacity must match the experiment");
assert(drive.currentEvidence.maxConcurrentDeliveries === experiment.offer.maxConcurrentDeliveries, "drive active-delivery limit must match the experiment");
assert(drive.currentEvidence.orders === experiment.metrics.orders, "drive orders must match the experiment");
assert(drive.currentEvidence.verifiedGrossRevenueUsd === experiment.money.grossRevenueUsd, "drive gross revenue must match the experiment");
assert(drive.currentEvidence.verifiedSettledCashUsd === experiment.money.netCashUsd, "drive settled cash must match the experiment");
assert(drive.currentEvidence.deploymentState === "UNVERIFIED", "deployment must remain unverified until immutable readback exists");
assert(drive.currentEvidence.receivedCashRequires === "PAID_SETTLED", "received cash must require PAID_SETTLED");

for (const value of Object.values(drive.progressionRules)) {
  assert(typeof value === "boolean", "progression rules must be boolean");
}
assert(drive.progressionRules.automaticStagePromotion === false, "automatic stage promotion must be disabled");
assert(drive.progressionRules.manualAuditCapacityMayBeMultipliedToClaimHigherStage === false, "manual pilot capacity must not prove a higher horizon");

for (const [key, value] of Object.entries(drive.claims)) {
  assert(value === false, `drive claim ${key} must remain false`);
}
assert(drive.legalRisk.indemnityProofClaimed === false, "indemnity-proof claim must remain false");
assert(drive.legalRisk.bindingAgreementRequired === true, "binding agreement must be required");
assert(drive.legalRisk.buyerConsentRequired === true, "buyer consent must be required");
assert(drive.legalRisk.counselReviewRequiredForIndemnityAndLiabilityTerms === true, "counsel review gate is required");
assert(drive.legalRisk.willfulMisconductOrBadFaithAutomaticallyExcused === false, "misconduct or bad faith must not be automatically excused");
assert(drive.legalRisk.templateCreatesBindingContract === false, "templates must not create binding contracts");

assert(authority.authorityVersion === "4.0.0", "authority version must be 4.0.0");
assert(authority.driveId === drive.driveId, "authority must reference Fardarter Drive v4");
assert(authority.authorizedBy === "JP", "authority must identify JP");
assert(authority.revoked === false, "authority receipt must not be revoked");
assert(authoritySchema?.properties?.authorityVersion?.const === "4.0.0", "authority schema must lock version 4.0.0");

const grantMap = new Map(authority.grants.map((grant) => [grant.grantId, grant]));
const expectedGrantStates = {
  SCALE_HORIZON_PUBLICATION: "AUTHORIZED_ACTIVE",
  REPOSITORY_IMPLEMENTATION_AND_RECEIPTS: "AUTHORIZED_ACTIVE",
  DOCUMENT_DRAFT_AUTOMATION: "AUTHORIZED_ACTIVE",
  RELEVANT_EXACT_OUTREACH: "AUTHORIZED_CONDITIONAL",
  GITHUB_INBOUND_AUTOMATION: "AUTHORIZED_ACTIVE",
  VERIFIED_MERGE: "AUTHORIZED_CONDITIONAL",
  FIXED_SITE_DEPLOYMENT: "AUTHORIZED_CONDITIONAL",
  CONTRACT_ACCEPTANCE: "HUMAN_APPROVAL_REQUIRED",
  INDEMNITY_AND_LIABILITY_TERMS: "COUNSEL_REVIEW_REQUIRED",
  PAYMENT_EXECUTION: "EXTERNAL_PROVIDER_ONLY",
  DELIVERY_START: "HUMAN_APPROVAL_REQUIRED",
  REFUND_DISPUTE_OR_ADMISSION: "HUMAN_APPROVAL_REQUIRED",
  BANK_BILLING_DOMAIN_CREDENTIAL_OR_DESTRUCTIVE_ACTION: "HUMAN_APPROVAL_REQUIRED",
};
for (const [grantId, state] of Object.entries(expectedGrantStates)) {
  assert(grantMap.get(grantId)?.state === state, `${grantId} must be ${state}`);
}
assert(grantMap.get("DOCUMENT_DRAFT_AUTOMATION")?.automated === true, "document draft automation must be active");
assert(grantMap.get("RELEVANT_EXACT_OUTREACH")?.automated === false, "external outreach must not be autonomous");
assert(grantMap.get("CONTRACT_ACCEPTANCE")?.automated === false, "contract acceptance must not be automated");
assert(grantMap.get("PAYMENT_EXECUTION")?.automated === false, "payment execution must not be automated");
assert(grantMap.get("DELIVERY_START")?.automated === false, "delivery start must not be automated");
for (const [key, value] of Object.entries(authority.guardrails)) {
  assert(value === false, `authority guardrail ${key} must remain false`);
}

assert(chain.result === "CHAIN_RESOLVED", "chain result must be CHAIN_RESOLVED");
assert(chain.driveId === drive.driveId, "chain must reference Fardarter Drive v4");
assert(chain.chain.length === 8, "chain must contain #133 through #140");
const expectedChain = [
  [133, "ISSUE", "OPEN", null, "ACTIVE"],
  [134, "PULL_REQUEST", "MERGED", "3393562796868dbe4eee3b9bd3d7896602b3229a", "MERGED"],
  [135, "PULL_REQUEST", "MERGED", "e4332853b4f4a05db9eddf7aaa999fd1fd152572", "MERGED"],
  [136, "ISSUE", "OPEN", null, "RECEIPT_REQUIRED"],
  [137, "PULL_REQUEST", "MERGED", "28329eb4e5144cc39f5860e33d665e7e297e5443", "MERGED"],
  [138, "PULL_REQUEST", "MERGED", "2c08a8d3c9710844a6cc0fc183413d3123d2ff04", "MERGED"],
  [139, "PULL_REQUEST", "MERGED", "814b26a8d59baf8e1279a8eaeca378f7088fe7f9", "MERGED"],
  [140, "ISSUE", "CLOSED", null, "PASS"],
];
for (const [index, [number, objectType, state, mergeCommitSha, evidenceState]] of expectedChain.entries()) {
  const item = chain.chain[index];
  assert(item.number === number, `chain item ${index} number is incorrect`);
  assert(item.objectType === objectType, `#${number} object type is incorrect`);
  assert(item.state === state, `#${number} state is incorrect`);
  assert(item.mergeCommitSha === mergeCommitSha, `#${number} merge SHA is incorrect`);
  assert(item.evidenceState === evidenceState, `#${number} evidence state is incorrect`);
}
assert(chainSchema?.properties?.chain?.minItems === 8, "chain schema must require eight objects");
assert(chain.financialEvidence.orders === 0, "chain must record zero orders");
assert(chain.financialEvidence.verifiedGrossRevenueUsd === 0, "chain must record zero verified gross revenue");
assert(chain.financialEvidence.verifiedSettledCashUsd === 0, "chain must record zero settled cash");
for (const value of Object.values(chain.claims)) assert(value === false, "chain claims must remain false");

assert(automation.result === "PREPARED_FOR_VERIFIED_MERGE", "automation receipt must remain prepared until merge");
assert(automation.prohibitedAutomaticActions.includes("CONTRACT_ACCEPTANCE"), "automation receipt must prohibit automatic contract acceptance");
assert(automation.prohibitedAutomaticActions.includes("PAYMENT_EXECUTION_OR_SETTLEMENT_CLAIM"), "automation receipt must prohibit automatic payment execution");
assert(automation.prohibitedAutomaticActions.includes("CLAIM_TEMPLATE_IS_INDEMNITY_PROOF"), "automation receipt must prohibit indemnity-proof claims");
for (const value of Object.values(automation.publicDataBoundary)) assert(value === false, "automation public-data boundaries must remain false");

assertDraftBoundary(text.agreementDraft, "service agreement draft");
assertDraftBoundary(text.proposalDraft, "proposal draft");
assertDraftBoundary(text.invoiceDraft, "invoice draft");
assertDraftBoundary(text.deliveryDraft, "delivery draft");
assert(text.agreementDraft.includes("COUNSEL MUST SELECT AND COMPLETE"), "agreement draft must counsel-gate indemnity and liability terms");
assert(text.agreementDraft.includes("No option is effective until completed and accepted"), "agreement indemnity options must remain nonbinding");
assert(/\*{0,2}Indemnity-proof claim:\*{0,2}\s+prohibited/i.test(text.legalReadiness), "legal-readiness document must prohibit indemnity-proof claims");
assert(text.legalReadiness.includes("No automated system may"), "legal-readiness document must define automation prohibitions");
assert(text.operatingDoc.includes("$1,000,000,000,000,000"), "operating document must display the quadrillion horizon");
assert(text.operatingDoc.includes("Automatic stage promotion is prohibited"), "operating document must prohibit automatic stage promotion");

assert(text.api.includes("FARDARTER-DRIVE-V4.json"), "API must import the Fardarter Drive record");
assert(text.api.includes("FARDARTER-DRIVE-AUTHORITY-V4.json"), "API must import authority v4");
assert(text.api.includes("JP-REV-001-CHAIN-133-140.json"), "API must import the chain receipt");
assert(text.api.includes("fardarterDrive"), "API must expose Fardarter Drive data");
assert(text.page.includes("Fardarter Drive™"), "product page must display Fardarter Drive");
assert(text.page.includes("Aspirational horizons — not achieved revenue"), "product page must preserve horizon boundaries");
assert(text.page.includes("not indemnity-proof"), "product page must preserve the indemnity boundary");
assert(text.revenueWorkflow.includes("check-fardarter-drive.mjs"), "revenue workflow must run the Fardarter Drive validator");
assert(text.deployWorkflow.includes("FD-001Q"), "deployment readback must verify the quadrillion horizon stage");
assert(text.deployWorkflow.includes("templateIsIndemnityProof"), "deployment readback must verify the indemnity-proof boundary");

const forbiddenSensitiveKey = /^(password|secret|token|routingNumber|bankAccount|accountNumber|customerEmail|customerName|providerTransactionId|payoutData|taxId)$/i;
for (const key of [
  ...collectKeys(drive),
  ...collectKeys(authority),
  ...collectKeys(chain),
  ...collectKeys(automation),
]) {
  assert(!forbiddenSensitiveKey.test(key), `forbidden sensitive public field: ${key}`);
}

console.log("Fardarter Drive v4: PASS");
console.log(`Drive: ${drive.driveId}`);
console.log(`Authority: ${authority.authorityVersion}`);
console.log(`Chain: #${chain.chain[0].number}–#${chain.chain.at(-1).number}/${chain.result}`);
console.log(`Current evidence: ${drive.currentEvidence.orders} orders / $${drive.currentEvidence.verifiedGrossRevenueUsd} gross / $${drive.currentEvidence.verifiedSettledCashUsd} settled`);
console.log(`Horizons: ${drive.horizons.map((stage) => stage.amountUsd).join(", ")}`);
console.log("Indemnity status: counsel-gated / not indemnity-proof");
