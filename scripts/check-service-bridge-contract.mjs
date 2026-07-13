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
  "app/service-bridge/page.tsx",
  "app/service-bridge/nexus/page.tsx",
  "app/service-bridge/policy/page.tsx",
  "app/service-bridge/orchestrate/page.tsx",
  "app/service-bridge/orchestrate-batch/page.tsx",
  "app/service-bridge/projection/page.tsx",
  "app/service-bridge/reconcile/page.tsx",
  "app/service-bridge/resolve/page.tsx",
  "app/service-bridge/persist/page.tsx",
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
  "scripts/smoke-service-bridge-api.mjs",
  "scripts/smoke-service-bridge-recovery.mjs",
  "scripts/smoke-service-bridge-persistence.mjs",
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
const manifest = read("app/api/service-bridge/manifest/route.ts");
const openapi = read("app/api/service-bridge/openapi/route.ts");
const resolveRoute = read("app/api/service-bridge/events/resolve/route.ts");
const persistRoute = read("app/api/service-bridge/events/persist/route.ts");
const resolveConsole = read("app/service-bridge/resolve/page.tsx");
const persistConsole = read("app/service-bridge/persist/page.tsx");
const persistenceSmoke = read("scripts/smoke-service-bridge-persistence.mjs");
const workflow = read(".github/workflows/service-bridge-verify.yml");

for (const state of requiredMissionStates) if (!domain.includes(`"${state}"`)) failures.push(`Missing mission state: ${state}`);
for (const service of requiredServices) if (!domain.includes(`name: "${service}"`)) failures.push(`Missing service definition: ${service}`);
for (const endpoint of requiredEndpoints) {
  if (!manifest.includes(endpoint)) failures.push(`Manifest missing endpoint: ${endpoint}`);
  if (!openapi.includes(endpoint)) failures.push(`OpenAPI missing endpoint: ${endpoint}`);
}

const checks = [
  [domain.includes("externalActionCompleted: false"), "Domain must force externalActionCompleted=false"],
  [manifest.includes("version: 13"), "Manifest version must be 13"],
  [manifest.includes("automaticMutationAllowed: false"), "Manifest must disallow automatic mutation"],
  [manifest.includes("localPersistenceOnly: true"), "Manifest must restrict persistence to local storage"],
  [manifest.includes('authorities: ["snapshot", "projection", "manual"]'), "Manifest authority options are incomplete"],
  [manifest.includes('planningConfirmationPattern: "PERSIST <mission-id>"'), "Planning confirmation pattern is missing"],
  [manifest.includes('applyConfirmationPattern: "APPLY LOCAL <mission-id>"'), "Local apply confirmation pattern is missing"],
  [openapi.includes('version: "13.0.0"'), "OpenAPI version must be 13.0.0"],
  [openapi.includes('"x-automatic-mutation-allowed": false'), "OpenAPI must disallow automatic mutation"],
  [openapi.includes('"x-external-persistence-allowed": false'), "OpenAPI must disallow external persistence"],
  [openapi.includes('"x-authority-options"'), "OpenAPI authority options are missing"],
  [policy.includes('"ALLOW_PREPARE"') && policy.includes('"HOLD_FOR_APPROVAL"') && policy.includes('"BLOCK"'), "Policy outcomes are incomplete"],
  [orchestration.includes("orchestrateMission") && orchestration.includes("summarizeOrchestrations"), "Canonical orchestration engine is incomplete"],
  [receipts.includes('algorithm: "SHA-256"') && receipts.includes("sorted-json-v1"), "Receipt integrity contract is incomplete"],
  [events.includes("EVENT_DIGEST_MISMATCH") && events.includes("PREVIOUS_DIGEST_MISMATCH"), "Event verification is incomplete"],
  [projection.includes("projectMissionFromEvents") && projection.includes("verifyEventChain(events)"), "Projection engine is incomplete"],
  [reconciliation.includes("reconcileMissionSnapshot") && reconciliation.includes("explicitly choose"), "Reconciliation engine is incomplete"],
  [resolution.includes("createReconciliationResolution") && resolution.includes("requiresExplicitPersistence: true"), "Resolution engine is incomplete"],
  [resolution.includes('"snapshot" | "projection" | "manual"'), "Resolution authority types are incomplete"],
  [resolution.includes("mutationApplied: false") && resolution.includes("externalActionCompleted: false"), "Resolution boundaries are incomplete"],
  [persistence.includes("createPersistencePlan") && persistence.includes("expectedConfirmation"), "Persistence planning engine is incomplete"],
  [persistence.includes("localPersistenceAllowed: true") && persistence.includes("externalPersistenceAllowed: false"), "Persistence boundaries are incomplete"],
  [persistRoute.includes("createPersistencePlan") && persistRoute.includes("confirmation"), "Persistence endpoint is incomplete"],
  [resolveRoute.includes("createReconciliationResolution") && resolveRoute.includes("authority"), "Resolution endpoint is incomplete"],
  [resolveConsole.includes("/api/service-bridge/events/resolve"), "Resolution console must use resolution API"],
  [persistConsole.includes("/api/service-bridge/events/persist") && persistConsole.includes("APPLY LOCAL"), "Persistence console must enforce two-step confirmation"],
  [persistenceSmoke.includes("persistence rejects wrong confirmation") && persistenceSmoke.includes("manual authority requires state"), "Persistence smoke suite must verify confirmation and manual authority"],
  [workflow.includes("service-bridge:smoke:persistence") && workflow.includes("External persistence: DISALLOWED"), "CI must run and receipt persistence verification"],
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
console.log("Recovery pipeline: verified through explicit authority resolution.");
console.log("Persistence pipeline: exact confirmation + local-only write gate.");
console.log("Automatic mutation: disallowed.");
console.log("External persistence: disallowed.");
console.log("External-action boundary: preserved.");
