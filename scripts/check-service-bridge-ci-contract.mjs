import { readFile } from "node:fs/promises";

const packageJson = await readFile("package.json", "utf8");
const workflow = await readFile(".github/workflows/service-bridge-verify.yml", "utf8");
const runner = await readFile("scripts/run-service-bridge-smoke-all.mjs", "utf8");
const architectureContract = await readFile("scripts/check-service-bridge-contract.mjs", "utf8");
const runtimeContract = await readFile("scripts/check-service-bridge-runtime-contract.mjs", "utf8");
const catalog = await readFile("lib/service-bridge-contract-catalog.ts", "utf8");

const failures = [];
const requireCheck = (passed, message) => {
  if (!passed) failures.push(message);
};

requireCheck(packageJson.includes('"service-bridge:check:all"'), "Combined contract command is missing.");
requireCheck(packageJson.includes('"service-bridge:smoke:all"'), "Unified smoke command is missing.");
requireCheck(packageJson.includes('"service-bridge:smoke:deployment"'), "Deployment smoke command is missing.");
requireCheck(packageJson.includes('"service-bridge:deployment:verify"'), "Public deployment verification command is missing.");
requireCheck(packageJson.includes('"service-bridge:verify": "npm run service-bridge:check:all && npm run build"'), "Verify command must run all contracts before build.");

requireCheck(workflow.includes("npm run service-bridge:check:all"), "CI must run the combined contract command.");
requireCheck(workflow.includes("npm run service-bridge:smoke:all"), "CI must run the unified smoke command.");
requireCheck(workflow.includes("Smoke suites completed: 8/8"), "CI receipt must record eight completed smoke suites.");
requireCheck(workflow.includes("Contract catalog version: 19"), "CI receipt must record contract catalog version 19.");
requireCheck(workflow.includes("Architecture contract: PASS"), "CI receipt must record architecture contract status.");
requireCheck(workflow.includes("Runtime metadata contract: PASS"), "CI receipt must record runtime contract status.");
requireCheck(workflow.includes("Automatic deployment: DISALLOWED"), "CI receipt must prohibit automatic deployment.");
requireCheck(workflow.includes("Public deployment verified: NO"), "CI receipt must avoid claiming public deployment verification.");
requireCheck(workflow.includes("External-action boundary: PRESERVED"), "CI receipt must preserve the external-action boundary.");
requireCheck(workflow.includes("/api/service-bridge/contracts"), "CI must verify the live contract catalog endpoint.");

const suitePaths = [
  "scripts/smoke-service-bridge-api.mjs",
  "scripts/smoke-service-bridge-recovery.mjs",
  "scripts/smoke-service-bridge-persistence.mjs",
  "scripts/smoke-service-bridge-rollback.mjs",
  "scripts/smoke-service-bridge-lifecycle.mjs",
  "scripts/smoke-service-bridge-lifecycle-projection.mjs",
  "scripts/smoke-service-bridge-lifecycle-apply.mjs",
  "scripts/smoke-service-bridge-deployment.mjs",
];
for (const path of suitePaths) {
  requireCheck(runner.includes(path), `Unified smoke runner missing suite: ${path}`);
}

requireCheck(runner.includes("if (!passed)"), "Unified smoke runner must stop after a failed suite.");
requireCheck(runner.includes("externalActionCompleted: false"), "Unified smoke receipt must preserve externalActionCompleted=false.");
requireCheck(runner.includes("automaticProjectionMutationAllowed: false"), "Unified smoke receipt must prohibit automatic projection mutation.");
requireCheck(runner.includes("automaticDeploymentAllowed: false"), "Unified smoke receipt must prohibit automatic deployment.");
requireCheck(runner.includes("publicDeploymentVerified: false"), "Unified smoke receipt must not claim public deployment verification.");
requireCheck(architectureContract.includes("version 19 catalog-aligned"), "Architecture contract must be version 19 catalog-aligned.");
requireCheck(runtimeContract.includes("Version surfaces aligned through catalog version 19"), "Runtime metadata contract must be version 19 aligned.");
requireCheck(catalog.includes("SERVICE_BRIDGE_CONTRACT_VERSION = 19"), "Contract catalog must report version 19.");

if (failures.length) {
  console.error("SERVICE BRIDGE CI CONTRACT: FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SERVICE BRIDGE CI CONTRACT: PASS");
console.log("Contract rail: architecture + runtime metadata + CI structure, version 19.");
console.log("Build rail: production Next.js build.");
console.log("Smoke rail: unified fail-fast runner with 8 suites.");
console.log("Contract catalog rail: source and live endpoint verification.");
console.log("Automatic deployment and external action: disallowed.");
