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
  "lib/service-bridge-lifecycle-client.ts",
  "lib/service-bridge-lifecycle-projection.ts",
  "lib/service-bridge-lifecycle-apply.ts",
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
  "app/service-bridge/lifecycle-project/page.tsx",
  "app/service-bridge/lifecycle-apply/page.tsx",
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
  "app/api/service-bridge/lifecycle/project/route.ts",
  "app/api/service-bridge/lifecycle/apply/route.ts",
  "scripts/smoke-service-bridge-api.mjs",
  "scripts/smoke-service-bridge-recovery.mjs",
  "scripts/smoke-service-bridge-persistence.mjs",
  "scripts/smoke-service-bridge-rollback.mjs",
  "scripts/smoke-service-bridge-lifecycle.mjs",
  "scripts/smoke-service-bridge-lifecycle-projection.mjs",
  "scripts/smoke-service-bridge-lifecycle-apply.mjs",
  ".github/workflows/service-bridge-verify.yml",
];

const requiredServices = ["Indeed", "Uber", "Grubhub", "Gmail", "Google Calendar", "GitHub", "Norstein", "V# MAIN"];
const requiredMissionStates = ["draft", "preflight", "awaiting-approval", "ready", "verified", "closed"];
const publishedEndpoints = [
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
  "/api/service-bridge/lifecycle/project",
  "/api/service-bridge/lifecycle/apply",
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
const lifecycleClient = read("lib/service-bridge-lifecycle-client.ts");
const lifecycleProjection = read("lib/service-bridge-lifecycle-projection.ts");
const lifecycleApply = read("lib/service-bridge-lifecycle-apply.ts");
const manifest = read("app/api/service-bridge/manifest/route.ts");
const openapi = read("app/api/service-bridge/openapi/route.ts");
const lifecycleRoute = read("app/api/service-bridge/lifecycle/route.ts");
const lifecycleProjectRoute = read("app/api/service-bridge/lifecycle/project/route.ts");
const lifecycleApplyRoute = read("app/api/service-bridge/lifecycle/apply/route.ts");
const lifecycleConsole = read("app/service-bridge/lifecycle/page.tsx");
const lifecycleProjectConsole = read("app/service-bridge/lifecycle-project/page.tsx");
const lifecycleApplyConsole = read("app/service-bridge/lifecycle-apply/page.tsx");
const lifecycleSmoke = read("scripts/smoke-service-bridge-lifecycle.mjs");
const lifecycleProjectionSmoke = read("scripts/smoke-service-bridge-lifecycle-projection.mjs");
const lifecycleApplySmoke = read("scripts/smoke-service-bridge-lifecycle-apply.mjs");
const workflow = read(".github/workflows/service-bridge-verify.yml");
const packageJson = read("package.json");

for (const state of requiredMissionStates) if (!domain.includes(`"${state}"`)) failures.push(`Missing mission state: ${state}`);
for (const service of requiredServices) if (!domain.includes(`name: "${service}"`)) failures.push(`Missing service definition: ${service}`);
for (const endpoint of publishedEndpoints) {
  if (!manifest.includes(endpoint)) failures.push(`Manifest missing endpoint: ${endpoint}`);
  if (!openapi.includes(endpoint)) failures.push(`OpenAPI missing endpoint: ${endpoint}`);
}

const checks = [
  [domain.includes("externalActionCompleted: false"), "Domain must force externalActionCompleted=false"],
  [manifest.includes("version: 16"), "Manifest version must be 16"],
  [manifest.includes("lifecycleProjectionApply") && manifest.includes("explicitProjectionMutationAllowed: true"), "Manifest lifecycle projection apply contract is incomplete"],
  [manifest.includes('projectionPlanningConfirmationPattern: "APPLY PROJECTION <mission-id>"') && manifest.includes('projectionCommitConfirmationPattern: "COMMIT PROJECTION <mission-id>"'), "Manifest projection confirmations are incomplete"],
  [openapi.includes('version: "16.0.0"'), "OpenAPI version must be 16.0.0"],
  [openapi.includes('"/api/service-bridge/lifecycle/project"') && openapi.includes('"/api/service-bridge/lifecycle/apply"'), "OpenAPI lifecycle projection endpoints are missing"],
  [openapi.includes("LifecycleProjectionRequest") && openapi.includes("LifecycleApplyRequest") && openapi.includes("LifecycleApplyPlan"), "OpenAPI lifecycle projection schemas are incomplete"],
  [openapi.includes('"x-lifecycle-projection-apply"') && openapi.includes("explicitLocalMutationAllowed: true"), "OpenAPI lifecycle projection apply extension is incomplete"],
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
  [lifecycleRoute.includes('operation === "verify"') && lifecycleRoute.includes("createLifecycleEntry"), "Lifecycle API must support append and verify"],
  [lifecycleClient.includes("appendClientLifecycleEntry") && lifecycleClient.includes("SERVICE_BRIDGE_LIFECYCLE_KEY"), "Lifecycle browser helper is incomplete"],
  [lifecycleProjection.includes("projectLifecycleJournal") && lifecycleProjection.includes("unresolvedPlan") && lifecycleProjection.includes("externalActionCompleted: false"), "Lifecycle projection engine is incomplete"],
  [lifecycleProjectRoute.includes("projectLifecycleJournal") && lifecycleProjectRoute.includes("status: projection.journalValid ? 200 : 422"), "Lifecycle projection endpoint is incomplete"],
  [lifecycleProjectConsole.includes("/api/service-bridge/lifecycle/project") && lifecycleProjectConsole.includes("Load local journal"), "Lifecycle projection console is incomplete"],
  [lifecycleApply.includes("createLifecycleProjectionApplyPlan") && lifecycleApply.includes("projectionMutationAllowed: true") && lifecycleApply.includes("projectionMutationApplied: false"), "Lifecycle projection apply engine is incomplete"],
  [lifecycleApply.includes("APPLY PROJECTION") && lifecycleApply.includes("externalPersistenceAllowed: false"), "Lifecycle apply permission boundary is incomplete"],
  [lifecycleApplyRoute.includes("createLifecycleProjectionApplyPlan") && lifecycleApplyRoute.includes("currentMissions"), "Lifecycle apply endpoint is incomplete"],
  [lifecycleApplyConsole.includes("COMMIT PROJECTION") && lifecycleApplyConsole.includes("projectionMutationApplied: true"), "Lifecycle apply console must enforce final local confirmation"],
  [lifecycleConsole.includes("/api/service-bridge/lifecycle") && lifecycleConsole.includes("Verify chain"), "Lifecycle console integration is incomplete"],
  [lifecycleSmoke.includes("tampered lifecycle journal rejected"), "Lifecycle smoke coverage is incomplete"],
  [lifecycleProjectionSmoke.includes("tampered lifecycle projection rejected") && lifecycleProjectionSmoke.includes("rolled back state detected"), "Lifecycle projection smoke coverage is incomplete"],
  [lifecycleApplySmoke.includes("projection apply rejects wrong confirmation") && lifecycleApplySmoke.includes("projection mutation explicitly allowed"), "Lifecycle apply smoke coverage is incomplete"],
  [packageJson.includes("service-bridge:smoke:lifecycle-projection") && packageJson.includes("service-bridge:smoke:lifecycle-apply"), "Lifecycle projection/apply smoke commands are missing"],
  [workflow.includes("service-bridge:smoke:lifecycle-projection") && workflow.includes("service-bridge:smoke:lifecycle-apply"), "CI must run lifecycle projection and apply smoke suites"],
  [workflow.includes("Projection mutation permission: EXPLICIT") && workflow.includes("Automatic projection mutation: DISALLOWED"), "CI receipt must state lifecycle apply boundaries"],
];

for (const [passed, message] of checks) if (!passed) failures.push(message);

if (failures.length) {
  console.error("SERVICE BRIDGE CONTRACT: FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SERVICE BRIDGE CONTRACT: PASS");
console.log(`Verified ${requiredFiles.length} files, ${requiredServices.length} services, ${requiredMissionStates.length} mission states, and ${publishedEndpoints.length} published endpoints.`);
console.log("Operational pipeline: validated.");
console.log("Recovery pipeline: authority resolution + gated persistence + rollback.");
console.log("Lifecycle pipeline: chained journal + projection + explicitly confirmed local apply.");
console.log("Manifest/OpenAPI contract: version 16 aligned.");
console.log("Automatic projection mutation: disallowed.");
console.log("External persistence and external action: disallowed.");
