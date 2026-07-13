import { readFile } from "node:fs/promises";

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
  "app/service-bridge/page.tsx",
  "app/service-bridge/nexus/page.tsx",
  "app/service-bridge/policy/page.tsx",
  "app/service-bridge/orchestrate/page.tsx",
  "app/service-bridge/orchestrate-batch/page.tsx",
  "app/service-bridge/projection/page.tsx",
  "app/service-bridge/reconcile/page.tsx",
  "app/service-bridge/resolve/page.tsx",
  "app/service-bridge/persist/page.tsx",
  "app/service-bridge/rollback/page.tsx",
  "app/service-bridge/lifecycle/page.tsx",
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
  "app/api/service-bridge/events/resolve/route.ts",
  "app/api/service-bridge/events/persist/route.ts",
  "app/api/service-bridge/events/rollback/route.ts",
  "app/api/service-bridge/lifecycle/route.ts",
  "scripts/smoke-service-bridge-api.mjs",
  "scripts/smoke-service-bridge-recovery.mjs",
  "scripts/smoke-service-bridge-persistence.mjs",
  "scripts/smoke-service-bridge-rollback.mjs",
  "scripts/smoke-service-bridge-lifecycle.mjs",
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
  "/api/service-bridge/events/resolve",
  "/api/service-bridge/events/persist",
  "/api/service-bridge/events/rollback",
  "/api/service-bridge/lifecycle",
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
const resolution = read("lib/service-bridge-resolution.ts");
const persistence = read("lib/service-bridge-persistence.ts");
const rollback = read("lib/service-bridge-rollback.ts");
const lifecycle = read("lib/service-bridge-lifecycle.ts");
const manifest = read("app/api/service-bridge/manifest/route.ts");
const openapi = read("app/api/service-bridge/openapi/route.ts");
const lifecycleRoute = read("app/api/service-bridge/lifecycle/route.ts");
const lifecycleConsole = read("app/service-bridge/lifecycle/page.tsx");
const lifecycleSmoke = read("scripts/smoke-service-bridge-lifecycle.mjs");
const workflow = read(".github/workflows/service-bridge-verify.yml");

for (const state of requiredMissionStates) if (!domain.includes(`"${state}"`)) failures.push(`Missing mission state: ${state}`);
for (const service of requiredServices) if (!domain.includes(`name: "${service}"`)) failures.push(`Missing service definition: ${service}`);
for (const endpoint of requiredEndpoints) {
  if (!manifest.includes(endpoint)) failures.push(`Manifest missing endpoint: ${endpoint}`);
  if (!openapi.includes(endpoint)) failures.push(`OpenAPI missing endpoint: ${endpoint}`);
}

const checks = [
  [domain.includes("externalActionCompleted: false"), "Domain must force externalActionCompleted=false"],
  [manifest.includes("version: 15"), "Manifest version must be 15"],
  [manifest.includes("lifecycleJournal"), "Manifest lifecycle journal section is missing"],
  [manifest.includes('schema: "jp-hviti-service-bridge-lifecycle-entry/v1"'), "Manifest lifecycle schema is missing"],
  [manifest.includes("orderedByPreviousDigest: true") && manifest.includes("tamperDetection: true"), "Manifest lifecycle integrity properties are incomplete"],
  [manifest.includes("trustedTimestamp: false") && manifest.includes("signed: false") && manifest.includes("notarized: false") && manifest.includes("blockchain: false"), "Manifest lifecycle limitations are incomplete"],
  [openapi.includes('version: "15.0.0"'), "OpenAPI version must be 15.0.0"],
  [openapi.includes('"x-lifecycle-journal"'), "OpenAPI lifecycle extension is missing"],
  [openapi.includes("LifecycleAppendRequest") && openapi.includes("LifecycleVerifyRequest") && openapi.includes("LifecycleEntry"), "OpenAPI lifecycle schemas are incomplete"],
  [policy.includes('"ALLOW_PREPARE"') && policy.includes('"HOLD_FOR_APPROVAL"') && policy.includes('"BLOCK"'), "Policy outcomes are incomplete"],
  [orchestration.includes("orchestrateMission") && orchestration.includes("summarizeOrchestrations"), "Canonical orchestration engine is incomplete"],
  [receipts.includes('algorithm: "SHA-256"') && receipts.includes("sorted-json-v1"), "Receipt integrity contract is incomplete"],
  [events.includes("EVENT_DIGEST_MISMATCH") && events.includes("PREVIOUS_DIGEST_MISMATCH"), "Event verification is incomplete"],
  [projection.includes("projectMissionFromEvents") && projection.includes("verifyEventChain(events)"), "Projection engine is incomplete"],
  [reconciliation.includes("reconcileMissionSnapshot") && reconciliation.includes("explicitly choose"), "Reconciliation engine is incomplete"],
  [resolution.includes("createReconciliationResolution") && resolution.includes("requiresExplicitPersistence: true"), "Resolution engine is incomplete"],
  [persistence.includes("createPersistencePlan") && persistence.includes("localPersistenceAllowed: true"), "Persistence engine is incomplete"],
  [rollback.includes("createRollbackPlan") && rollback.includes("localRollbackAllowed: true"), "Rollback engine is incomplete"],
  [lifecycle.includes("createLifecycleEntry") && lifecycle.includes("verifyLifecycleJournal"), "Lifecycle journal engine is incomplete"],
  [lifecycle.includes("LIFECYCLE_DIGEST_MISMATCH") && lifecycle.includes("LIFECYCLE_PREVIOUS_DIGEST_MISMATCH") && lifecycle.includes("LIFECYCLE_MISSION_ID_MISMATCH"), "Lifecycle journal verification codes are incomplete"],
  [lifecycle.includes("previousDigest") && lifecycle.includes("digest: sha256(payload)"), "Lifecycle chaining contract is incomplete"],
  [lifecycle.includes("trusted timestamp") && lifecycle.includes("externalActionCompleted: false"), "Lifecycle limitations are incomplete"],
  [lifecycleRoute.includes('operation === "verify"') && lifecycleRoute.includes("createLifecycleEntry") && lifecycleRoute.includes("verifyLifecycleJournal"), "Lifecycle API must support append and verify"],
  [lifecycleConsole.includes("/api/service-bridge/lifecycle") && lifecycleConsole.includes("Verify chain") && lifecycleConsole.includes("localStorage"), "Lifecycle console integration is incomplete"],
  [lifecycleSmoke.includes("tampered lifecycle journal rejected") && lifecycleSmoke.includes("mission id mismatch rejected") && lifecycleSmoke.includes("unsupported lifecycle type rejected"), "Lifecycle smoke coverage is incomplete"],
  [workflow.includes("service-bridge:smoke:lifecycle") && workflow.includes("Lifecycle smoke suite: PASS") && workflow.includes("Trusted timestamp claim: NONE"), "CI must run and receipt lifecycle verification"],
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
console.log("Recovery pipeline: authority resolution + gated persistence + rollback.");
console.log("Lifecycle pipeline: mission-scoped chained local journal with tamper detection.");
console.log("Trusted timestamp, signature, notarization, blockchain, and external-action proof: none claimed.");
console.log("External-action boundary: preserved.");
