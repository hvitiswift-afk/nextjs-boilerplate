import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const MANIFEST = "receipts/revenue/FARDARTER-DRIVE-PRODUCTION-RECONCILIATION-V6-12.json";
const SCHEMA = "schemas/revenue/fardarter-drive-production-reconciliation-v6-12.schema.json";
const DOC = "docs/revenue/FARDARTER-DRIVE-PRODUCTION-RECONCILIATION-V6-12.md";
const WORKFLOW = ".github/workflows/fardarter-production-reconciliation-v6-12.yml";
const PACKAGE = "package.json";

const canonicalize = (value) => {
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
};
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
const schema = JSON.parse(await readFile(SCHEMA, "utf8"));
const doc = await readFile(DOC, "utf8");
const workflow = await readFile(WORKFLOW, "utf8");
const pkg = JSON.parse(await readFile(PACKAGE, "utf8"));

const expectedDigest = manifest.manifestDigest;
const unsigned = structuredClone(manifest);
delete unsigned.manifestDigest;
assert(sha256(canonicalize(unsigned)) === expectedDigest, "manifest digest mismatch");
assert(manifest.controlId === "FARDARTER-DRIVE-PRODUCTION-RECONCILIATION-V6-12", "control id mismatch");
assert(manifest.controllerVersion === "6.12.0", "controller version mismatch");
assert(manifest.controllingIssue === 195, "controlling issue mismatch");
assert(manifest.repository.reconciliationBaseHead === "f5d3261bb513764fe14601ef9d0fc53e71ea83b3", "base head mismatch");
assert(manifest.repository.deployedApplicationSource === "88bd8dc89a0bd95f42c7e1a21dccc56fe9dc7334", "deployed source mismatch");
assert(manifest.verifiedProduction.deployId === "6a6ba0366ebec6650d843ac3", "deploy id mismatch");
assert(manifest.verifiedProduction.immutableUrl === "https://6a6ba0366ebec6650d843ac3--lichburn-v0-2-8.netlify.app", "immutable URL mismatch");
assert(manifest.verifiedProduction.providerState === "READY", "provider state mismatch");
assert(manifest.verifiedProduction.requiredRouteCount === 18, "required route count mismatch");
assert(manifest.verifiedProduction.verifiedRouteCount === 18, "verified route count mismatch");
assert(manifest.verifiedProduction.exactBodyMatchCount === 18, "exact body match count mismatch");
assert(manifest.verifiedProduction.verificationState === "DEPLOYED_AND_VERIFIED", "verification state mismatch");
assert(manifest.verifiedProduction.runtimeFunctionsRequiredForVerifiedRoutes === false, "runtime-function boundary mismatch");
assert(manifest.rollbackAnchor.deployId === "6a6b6a709e0a6d5ff2ca7759", "rollback deploy mismatch");
assert(manifest.rollbackAnchor.verificationState === "DEPLOYED_AND_VERIFIED", "rollback state mismatch");
assert(manifest.stateClassification.productionControlState === "RECONCILED", "reconciliation state mismatch");
assert(manifest.stateClassification.liveClaimAllowed === true, "live claim should be allowed");
assert(manifest.truthDistinctions.reconciliationCreatesNewDeployment === false, "reconciliation may not claim a new deploy");
assert(manifest.futurePromotionGate.automaticPromotionAllowed === false, "automatic promotion must remain disabled");
assert(manifest.futurePromotionGate.humanApprovalRequired === true, "future human approval must remain required");

const boundary = manifest.canonicalBoundaries;
assert(boundary.canonicalEventHeadSequence === 1, "canonical sequence changed");
assert(boundary.humanAccepted === 0 && boundary.active === 0 && boundary.orders === 0, "canonical business counts changed");
assert(boundary.verifiedGrossRevenueUsd === 0 && boundary.verifiedSettledCashUsd === 0, "money state changed");
assert(boundary.receivedCashRequires === "PAID_SETTLED", "cash gate changed");

const effects = manifest.actualEffects;
for (const key of [
  "providerDeploymentCreatedByReconciliation",
  "providerDeploymentChangedByReconciliation",
  "canonicalMutation",
  "orderCreated",
  "capacityReserved",
  "paymentConfirmed",
  "revenueRecognized",
  "settledCashRecognized",
  "buyerConsentProven",
  "workStarted",
  "privateDriveReferenceExposed"
]) assert(effects[key] === false, `${key} must remain false`);
assert(effects.recordsExistingVerifiedProduction === true, "existing production must be recorded");

const serialized = JSON.stringify(manifest);
assert(!serialized.includes("drive.google.com") && !serialized.includes("docs.google.com"), "public private-reference URL detected");
assert(schema.properties.manifestDigest.const === expectedDigest, "schema digest mismatch");
assert(doc.includes("DEPLOYED_AND_VERIFIED"), "documentation missing verified state");
assert(doc.includes("CONTROL_AHEAD_OF_DEPLOYED_APPLICATION_SOURCE"), "documentation missing source-gap classification");
assert(workflow.includes("npm run fardarter:production-reconciliation:check"), "workflow command missing");
assert(pkg.scripts["fardarter:production-reconciliation:check"] === "node scripts/check-fardarter-production-reconciliation-v6-12.mjs", "package command mismatch");
assert(pkg.scripts["revenue:verify"].includes("fardarter:production-reconciliation:check"), "unified verifier integration missing");

console.log("Fardarter Drive v6.12 production reconciliation: PASS");
console.log(`Production deploy: ${manifest.verifiedProduction.deployId}`);
console.log(`Immutable verification: ${manifest.verifiedProduction.verifiedRouteCount}/${manifest.verifiedProduction.requiredRouteCount}`);
console.log(`Manifest: ${expectedDigest}`);
console.log("Boundary: reconciliation records verified production without creating commercial or canonical effects.");
