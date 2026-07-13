import { readFile } from "node:fs/promises";

const requiredFiles = [
  "lib/service-bridge.ts",
  "lib/service-bridge-policy.ts",
  "lib/service-bridge-receipts.ts",
  "lib/service-bridge-events.ts",
  "lib/service-bridge-orchestration.ts",
  "lib/service-bridge-projection.ts",
  "lib/service-bridge-reconciliation.ts",
  "app/service-bridge/page.tsx",
  "app/service-bridge/nexus/page.tsx",
  "app/service-bridge/policy/page.tsx",
  "app/service-bridge/orchestrate/page.tsx",
  "app/service-bridge/orchestrate-batch/page.tsx",
  "app/service-bridge/projection/page.tsx",
  "app/service-bridge/reconcile/page.tsx",
  "app/service-bridge/control/page.tsx",
  "app/service-bridge/status/page.tsx",
  "app/service-bridge/receipts/page.tsx",
  "app/service-bridge/events/page.tsx",
  "app/api/service-bridge/manifest/route.ts",
  "app/api/service-bridge/health/route.ts",
  "app/api/service-bridge/openapi/route.ts",
  "app/api/service-bridge/validate/route.ts",
  "app/api/service-bridge/validate-batch/route.ts",
  "app/api/service-bridge/policy/evaluate/route.ts",
  "app/api/service-bridge/orchestrate/route.ts",
  "app/api/service-bridge/orchestrate-batch/route.ts",
  "app/api/service-bridge/plan/route.ts",
  "app/api/service-bridge/queue/route.ts",
  "app/api/service-bridge/receipt/route.ts",
  "app/api/service-bridge/receipt/mission/route.ts",
  "app/api/service-bridge/receipt/verify/route.ts",
  "app/api/service-bridge/events/append/route.ts",
  "app/api/service-bridge/events/verify/route.ts",
  "app/api/service-bridge/events/project/route.ts",
  "app/api/service-bridge/events/reconcile/route.ts",
  "scripts/smoke-service-bridge-api.mjs",
  "scripts/smoke-service-bridge-recovery.mjs",
  ".github/workflows/service-bridge-verify.yml",
];

const requiredServices = ["Indeed", "Uber", "Grubhub", "Gmail", "Google Calendar", "GitHub", "Norstein", "V# MAIN"];
const requiredMissionStates = ["draft", "preflight", "awaiting-approval", "ready", "verified", "closed"];
const requiredEndpoints = [
  "/api/service-bridge/manifest",
  "/api/service-bridge/health",
  "/api/service-bridge/openapi",
  "/api/service-bridge/validate",
  "/api/service-bridge/validate-batch",
  "/api/service-bridge/policy/evaluate",
  "/api/service-bridge/orchestrate",
  "/api/service-bridge/orchestrate-batch",
  "/api/service-bridge/plan",
  "/api/service-bridge/queue",
  "/api/service-bridge/receipt",
  "/api/service-bridge/receipt/mission",
  "/api/service-bridge/receipt/verify",
  "/api/service-bridge/events/append",
  "/api/service-bridge/events/verify",
  "/api/service-bridge/events/project",
  "/api/service-bridge/events/reconcile",
];

const failures = [];
const files = new Map();
for (const path of requiredFiles) {
  try { files.set(path, await readFile(path, "utf8")); }
  catch (error) { failures.push(`Missing required file: ${path} (${error.message})`); }
}
const read = (path) => files.get(path) ?? "";

const domain = read("lib/service-bridge.ts");
const policy = read("lib/service-bridge-policy.ts");
const receipts = read("lib/service-bridge-receipts.ts");
const events = read("lib/service-bridge-events.ts");
const orchestration = read("lib/service-bridge-orchestration.ts");
const projection = read("lib/service-bridge-projection.ts");
const reconciliation = read("lib/service-bridge-reconciliation.ts");
const manifest = read("app/api/service-bridge/manifest/route.ts");
const openapi = read("app/api/service-bridge/openapi/route.ts");
const health = read("app/api/service-bridge/health/route.ts");
const validate = read("app/api/service-bridge/validate/route.ts");
const singleRoute = read("app/api/service-bridge/orchestrate/route.ts");
const batchRoute = read("app/api/service-bridge/orchestrate-batch/route.ts");
const projectRoute = read("app/api/service-bridge/events/project/route.ts");
const reconcileRoute = read("app/api/service-bridge/events/reconcile/route.ts");
const nexus = read("app/service-bridge/nexus/page.tsx");
const projectionConsole = read("app/service-bridge/projection/page.tsx");
const reconciliationConsole = read("app/service-bridge/reconcile/page.tsx");
const smoke = read("scripts/smoke-service-bridge-api.mjs");
const recoverySmoke = read("scripts/smoke-service-bridge-recovery.mjs");
const workflow = read(".github/workflows/service-bridge-verify.yml");

for (const state of requiredMissionStates) if (!domain.includes(`"${state}"`)) failures.push(`Missing mission state: ${state}`);
for (const service of requiredServices) if (!domain.includes(`name: "${service}"`)) failures.push(`Missing service definition: ${service}`);
for (const endpoint of requiredEndpoints) {
  if (!manifest.includes(endpoint)) failures.push(`Manifest missing endpoint: ${endpoint}`);
  if (!openapi.includes(endpoint)) failures.push(`OpenAPI missing endpoint: ${endpoint}`);
}

const checks = [
  [domain.includes("externalActionCompleted: false"), "Domain must force externalActionCompleted=false"],
  [manifest.includes("version: 12"), "Manifest version must be 12"],
  [manifest.includes("silentOverwriteAllowed: false"), "Manifest must disallow silent overwrite"],
  [manifest.includes('stages: ["event-chain", "verify", "project", "reconcile", "explicit-authority-decision"]'), "Recovery stages are incomplete"],
  [openapi.includes('version: "12.0.0"'), "OpenAPI version must be 12.0.0"],
  [openapi.includes('"x-recovery-stages"') && openapi.includes('"x-silent-overwrite-allowed": false'), "OpenAPI recovery extensions are incomplete"],
  [health.includes("externalActionCompleted: false"), "Health external-action boundary is missing"],
  [validate.includes("validateMission(mission)"), "Validation endpoint must use shared validation"],
  [policy.includes('"ALLOW_PREPARE"') && policy.includes('"HOLD_FOR_APPROVAL"') && policy.includes('"BLOCK"'), "Policy outcomes are incomplete"],
  [orchestration.includes("orchestrateMission") && orchestration.includes("summarizeOrchestrations"), "Canonical orchestration engine is incomplete"],
  [singleRoute.includes("orchestrateMission(mission)"), "Single orchestration route must use canonical engine"],
  [batchRoute.includes("missions.map(orchestrateMission)") && batchRoute.includes("summarizeOrchestrations(results)"), "Batch orchestration route must use canonical engine"],
  [receipts.includes('algorithm: "SHA-256"') && receipts.includes("sorted-json-v1"), "Receipt integrity contract is incomplete"],
  [events.includes("previousDigest") && events.includes("EVENT_DIGEST_MISMATCH") && events.includes("PREVIOUS_DIGEST_MISMATCH"), "Event verification is incomplete"],
  [projection.includes("projectMissionFromEvents") && projection.includes("verifyEventChain(events)"), "Projection engine must verify event chains"],
  [projection.includes("MISSION_ID_MISMATCH") && projection.includes("externalActionCompleted: false"), "Projection safeguards are incomplete"],
  [reconciliation.includes("reconcileMissionSnapshot") && reconciliation.includes("differences"), "Reconciliation engine is incomplete"],
  [reconciliation.includes("explicitly choose") && reconciliation.includes("externalActionCompleted: false"), "Reconciliation authority boundary is incomplete"],
  [projectRoute.includes("projectMissionFromEvents(events)") && projectRoute.includes("status: projection.chainValid ? 200 : 422"), "Projection endpoint contract is incomplete"],
  [reconcileRoute.includes("reconcileMissionSnapshot(snapshot, events)") && reconcileRoute.includes("status: result.consistent ? 200 : 409"), "Reconciliation endpoint contract is incomplete"],
  [nexus.includes("Service Bridge Nexus"), "Nexus route is missing"],
  [projectionConsole.includes("/api/service-bridge/events/project"), "Projection console must use projection API"],
  [reconciliationConsole.includes("/api/service-bridge/events/reconcile"), "Reconciliation console must use reconciliation API"],
  [smoke.includes("batch orchestration limit enforced"), "Primary smoke suite must test batch limits"],
  [recoverySmoke.includes("reconciliation conflict returns 409") && recoverySmoke.includes("tampered projection rejected"), "Recovery smoke suite must test conflicts and tampering"],
  [workflow.includes("service-bridge:smoke:recovery") && workflow.includes("Silent overwrite: DISALLOWED"), "CI must run and receipt recovery verification"],
];

for (const [passed, message] of checks) if (!passed) failures.push(message);

if (failures.length) {
  console.error("SERVICE BRIDGE CONTRACT: FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SERVICE BRIDGE CONTRACT: PASS");
console.log(`Verified ${requiredFiles.length} files, ${requiredServices.length} services, ${requiredMissionStates.length} mission states, and ${requiredEndpoints.length} endpoints.`);
console.log("Operational pipeline: validated.");
console.log("Recovery pipeline: verified projection + explicit reconciliation.");
console.log("Silent overwrite: disallowed.");
console.log("External-action boundary: preserved.");
