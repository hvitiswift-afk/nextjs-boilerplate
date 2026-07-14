import { access, readFile } from "node:fs/promises";

const requiredFiles = [
  "lib/service-bridge.ts",
  "lib/service-bridge-policy.ts",
  "lib/service-bridge-receipts.ts",
  "lib/service-bridge-events.ts",
  "lib/service-bridge-orchestration.ts",
  "lib/service-bridge-projection.ts",
  "lib/service-bridge-reconciliation.ts",
  "lib/service-bridge-resolution.ts",
  "lib/service-bridge-persistence.ts",
  "lib/service-bridge-rollback.ts",
  "lib/service-bridge-lifecycle.ts",
  "lib/service-bridge-lifecycle-projection.ts",
  "lib/service-bridge-lifecycle-apply.ts",
  "lib/service-bridge-contract-catalog.ts",
  "lib/service-bridge-polystructure.ts",
  "lib/service-bridge-id-barcode.ts",
  "lib/service-bridge-id-registry.ts",
  "lib/service-bridge-id-chain.ts",
  "lib/service-bridge-concatenate.ts",
  "lib/service-bridge-polystructure-bundle.ts",
  "lib/service-bridge-polystructure-bundle-verify.ts",
  "lib/service-bridge-merkle.ts",
  "lib/service-bridge-polystructure-release.ts",
  "lib/service-bridge-polystructure-release-verify.ts",
  "app/api/service-bridge/manifest/route.ts",
  "app/api/service-bridge/health/route.ts",
  "app/api/service-bridge/openapi/route.ts",
  "app/api/service-bridge/receipt/route.ts",
  "app/api/service-bridge/contracts/route.ts",
  ".github/workflows/service-bridge-verify.yml",
];

const failures = [];
for (const path of requiredFiles) {
  try {
    await access(path);
  } catch (error) {
    failures.push(`Missing required file: ${path} (${error.message})`);
  }
}

const read = async (path) => readFile(path, "utf8");
const [
  domain,
  policy,
  receipts,
  events,
  orchestration,
  projection,
  reconciliation,
  resolution,
  persistence,
  rollback,
  lifecycle,
  lifecycleProjection,
  lifecycleApply,
  catalog,
  manifest,
  openapi,
  workflow,
] = await Promise.all([
  read("lib/service-bridge.ts"),
  read("lib/service-bridge-policy.ts"),
  read("lib/service-bridge-receipts.ts"),
  read("lib/service-bridge-events.ts"),
  read("lib/service-bridge-orchestration.ts"),
  read("lib/service-bridge-projection.ts"),
  read("lib/service-bridge-reconciliation.ts"),
  read("lib/service-bridge-resolution.ts"),
  read("lib/service-bridge-persistence.ts"),
  read("lib/service-bridge-rollback.ts"),
  read("lib/service-bridge-lifecycle.ts"),
  read("lib/service-bridge-lifecycle-projection.ts"),
  read("lib/service-bridge-lifecycle-apply.ts"),
  read("lib/service-bridge-contract-catalog.ts"),
  read("app/api/service-bridge/manifest/route.ts"),
  read("app/api/service-bridge/openapi/route.ts"),
  read(".github/workflows/service-bridge-verify.yml"),
]);

const requireCheck = (passed, message) => {
  if (!passed) failures.push(message);
};

for (const state of ["draft", "preflight", "awaiting-approval", "ready", "verified", "closed"]) {
  requireCheck(domain.includes(`"${state}"`), `Missing mission state: ${state}`);
}
for (const service of ["Indeed", "Uber", "Grubhub", "Gmail", "Google Calendar", "GitHub", "Norstein", "V# MAIN"]) {
  requireCheck(domain.includes(`name: "${service}"`), `Missing service definition: ${service}`);
}

requireCheck(catalog.includes("SERVICE_BRIDGE_CONTRACT_VERSION = 19"), "Contract catalog must report version 19.");
requireCheck(catalog.includes("polystructure-release-verification"), "Release verification contract is missing.");
requireCheck(manifest.includes("SERVICE_BRIDGE_CONTRACT_VERSION"), "Manifest must derive version from the catalog.");
requireCheck(openapi.includes("SERVICE_BRIDGE_CONTRACT_VERSION"), "OpenAPI must derive version from the catalog.");
requireCheck(openapi.includes('"x-lifecycle-projection-apply"'), "OpenAPI lifecycle projection extension is missing.");
requireCheck(openapi.includes('"x-automatic-deployment-allowed": false'), "OpenAPI must disallow automatic deployment.");
requireCheck(policy.includes('"ALLOW_PREPARE"') && policy.includes('"HOLD_FOR_APPROVAL"') && policy.includes('"BLOCK"'), "Policy outcomes are incomplete.");
requireCheck(orchestration.includes("orchestrateMission"), "Canonical orchestration engine is incomplete.");
requireCheck(receipts.includes('algorithm: "SHA-256"') && receipts.includes("sorted-json-v1"), "Receipt integrity contract is incomplete.");
requireCheck(events.includes("EVENT_DIGEST_MISMATCH") && events.includes("PREVIOUS_DIGEST_MISMATCH"), "Event verification is incomplete.");
requireCheck(projection.includes("projectMissionFromEvents"), "Projection engine is incomplete.");
requireCheck(reconciliation.includes("reconcileMissionSnapshot"), "Reconciliation engine is incomplete.");
requireCheck(resolution.includes("createReconciliationResolution"), "Resolution engine is incomplete.");
requireCheck(persistence.includes("createPersistencePlan"), "Persistence engine is incomplete.");
requireCheck(rollback.includes("createRollbackPlan"), "Rollback engine is incomplete.");
requireCheck(lifecycle.includes("createLifecycleEntry") && lifecycle.includes("verifyLifecycleJournal"), "Lifecycle journal engine is incomplete.");
requireCheck(lifecycleProjection.includes("projectLifecycleJournal"), "Lifecycle projection engine is incomplete.");
requireCheck(lifecycleApply.includes("createLifecycleProjectionApplyPlan"), "Lifecycle apply engine is incomplete.");
requireCheck(manifest.includes("explicitProjectionMutationAllowed: true"), "Manifest must explicitly allow confirmed local projection mutation.");
requireCheck(manifest.includes("automaticProjectionMutationAllowed: false"), "Manifest must disallow automatic projection mutation.");
requireCheck(manifest.includes("automaticDeploymentAllowed: false"), "Manifest must disallow automatic deployment.");
requireCheck(workflow.includes("npm run service-bridge:check:all"), "CI must run all contract checks.");
requireCheck(workflow.includes("npm run service-bridge:smoke:all"), "CI must run unified smoke verification.");
requireCheck(workflow.includes("Contract catalog version: 19"), "CI receipt must record contract version 19.");
requireCheck(domain.includes("externalActionCompleted: false"), "Domain must preserve externalActionCompleted=false.");

if (failures.length) {
  console.error("SERVICE BRIDGE CONTRACT: FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SERVICE BRIDGE CONTRACT: PASS");
console.log(`Verified ${requiredFiles.length} required architecture files.`);
console.log("Core orchestration and recovery pipelines: present.");
console.log("Polystructure identity, integrity, and release pipelines: present.");
console.log("Manifest/OpenAPI contract: version 19 catalog-aligned.");
console.log("Automatic deployment and external action: disallowed.");
