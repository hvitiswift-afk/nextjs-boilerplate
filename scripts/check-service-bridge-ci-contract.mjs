import { readFile } from "node:fs/promises";

const packageJson = await readFile("package.json", "utf8");
const workflow = await readFile(".github/workflows/service-bridge-verify.yml", "utf8");
const runner = await readFile("scripts/run-service-bridge-smoke-all.mjs", "utf8");
const architectureContract = await readFile("scripts/check-service-bridge-contract.mjs", "utf8");
const runtimeContract = await readFile("scripts/check-service-bridge-runtime-contract.mjs", "utf8");

const failures = [];
const requireCheck = (passed, message) => {
  if (!passed) failures.push(message);
};

requireCheck(packageJson.includes('"service-bridge:check:all"'), "Combined contract command is missing.");
requireCheck(packageJson.includes('"service-bridge:smoke:all"'), "Unified smoke command is missing.");
requireCheck(packageJson.includes('"service-bridge:verify": "npm run service-bridge:check:all && npm run build"'), "Verify command must run all contracts before build.");

requireCheck(workflow.includes("npm run service-bridge:check:all"), "CI must run the combined contract command.");
requireCheck(workflow.includes("npm run service-bridge:smoke:all"), "CI must run the unified smoke command.");
requireCheck(workflow.includes("Smoke suites completed: 7/7"), "CI receipt must record seven completed smoke suites.");
requireCheck(workflow.includes("Architecture contract: PASS"), "CI receipt must record architecture contract status.");
requireCheck(workflow.includes("Runtime metadata contract: PASS"), "CI receipt must record runtime contract status.");
requireCheck(workflow.includes("Projection mutation permission: EXPLICIT"), "CI receipt must record projection mutation permission.");
requireCheck(workflow.includes("Automatic projection mutation: DISALLOWED"), "CI receipt must prohibit automatic projection mutation.");
requireCheck(workflow.includes("External persistence: DISALLOWED"), "CI receipt must prohibit external persistence.");
requireCheck(workflow.includes("External-action boundary: PRESERVED"), "CI receipt must preserve the external-action boundary.");

const suitePaths = [
  "scripts/smoke-service-bridge-api.mjs",
  "scripts/smoke-service-bridge-recovery.mjs",
  "scripts/smoke-service-bridge-persistence.mjs",
  "scripts/smoke-service-bridge-rollback.mjs",
  "scripts/smoke-service-bridge-lifecycle.mjs",
  "scripts/smoke-service-bridge-lifecycle-projection.mjs",
  "scripts/smoke-service-bridge-lifecycle-apply.mjs",
];
for (const path of suitePaths) {
  requireCheck(runner.includes(path), `Unified smoke runner missing suite: ${path}`);
}

requireCheck(runner.includes("if (!passed)"), "Unified smoke runner must stop after a failed suite.");
requireCheck(runner.includes("externalActionCompleted: false"), "Unified smoke receipt must preserve externalActionCompleted=false.");
requireCheck(runner.includes("automaticProjectionMutationAllowed: false"), "Unified smoke receipt must prohibit automatic projection mutation.");
requireCheck(architectureContract.includes("Manifest/OpenAPI contract: version 16 aligned."), "Architecture contract must remain version 16 aligned.");
requireCheck(runtimeContract.includes("SERVICE BRIDGE RUNTIME CONTRACT: PASS"), "Runtime metadata contract completion receipt is missing.");

if (failures.length) {
  console.error("SERVICE BRIDGE CI CONTRACT: FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SERVICE BRIDGE CI CONTRACT: PASS");
console.log("Contract rail: architecture + runtime metadata.");
console.log("Build rail: production Next.js build.");
console.log("Smoke rail: unified fail-fast runner with 7 suites.");
console.log("Projection mutation: explicit local only.");
console.log("External persistence and external action: disallowed.");
