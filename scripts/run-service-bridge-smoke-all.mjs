import { spawn } from "node:child_process";

const suites = [
  ["api", "scripts/smoke-service-bridge-api.mjs"],
  ["recovery", "scripts/smoke-service-bridge-recovery.mjs"],
  ["persistence", "scripts/smoke-service-bridge-persistence.mjs"],
  ["rollback", "scripts/smoke-service-bridge-rollback.mjs"],
  ["lifecycle", "scripts/smoke-service-bridge-lifecycle.mjs"],
  ["lifecycle-projection", "scripts/smoke-service-bridge-lifecycle-projection.mjs"],
  ["lifecycle-apply", "scripts/smoke-service-bridge-lifecycle-apply.mjs"],
  ["deployment", "scripts/smoke-service-bridge-deployment.mjs"],
  ["polystructure-v19", "scripts/smoke-service-bridge-polystructure.mjs"],
];

const receipt = [];

function runSuite(name, path) {
  return new Promise((resolve) => {
    const startedAt = new Date().toISOString();
    const child = spawn(process.execPath, [path], {
      stdio: "inherit",
      env: process.env,
    });

    child.on("error", (error) => {
      receipt.push({ name, path, startedAt, finishedAt: new Date().toISOString(), status: "ERROR", detail: error.message });
      resolve(false);
    });

    child.on("exit", (code, signal) => {
      const passed = code === 0;
      receipt.push({
        name,
        path,
        startedAt,
        finishedAt: new Date().toISOString(),
        status: passed ? "PASS" : "FAIL",
        exitCode: code,
        signal,
      });
      resolve(passed);
    });
  });
}

let allPassed = true;
for (const [name, path] of suites) {
  console.log(`\n=== SERVICE BRIDGE SMOKE: ${name.toUpperCase()} ===`);
  const passed = await runSuite(name, path);
  if (!passed) {
    allPassed = false;
    break;
  }
}

console.log("\nJP / Hviti Service Bridge Unified Smoke Receipt");
console.log(JSON.stringify({
  schema: "jp-hviti-service-bridge-unified-smoke-receipt/v2",
  generatedAt: new Date().toISOString(),
  contractVersion: 19,
  baseUrl: process.env.SERVICE_BRIDGE_BASE_URL || "http://127.0.0.1:3000",
  suitesExpected: suites.length,
  suitesCompleted: receipt.length,
  allPassed,
  receipt,
  automaticMutationAllowed: false,
  automaticRollbackAllowed: false,
  automaticProjectionMutationAllowed: false,
  automaticDeploymentAllowed: false,
  externalPersistenceAllowed: false,
  publicDeploymentVerified: false,
  externalActionCompleted: false,
}, null, 2));

if (!allPassed) process.exit(1);
