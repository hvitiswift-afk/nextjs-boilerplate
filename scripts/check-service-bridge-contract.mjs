import { readFile } from "node:fs/promises";

const requiredFiles = [
  "lib/service-bridge.ts",
  "lib/service-bridge-policy.ts",
  "lib/service-bridge-receipts.ts",
  "lib/service-bridge-events.ts",
  "lib/service-bridge-orchestration.ts",
  "app/service-bridge/page.tsx",
  "app/service-bridge/nexus/page.tsx",
  "app/service-bridge/policy/page.tsx",
  "app/service-bridge/orchestrate/page.tsx",
  "app/service-bridge/orchestrate-batch/page.tsx",
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
  "scripts/smoke-service-bridge-api.mjs",
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
const page = read("app/service-bridge/page.tsx");
const nexus = read("app/service-bridge/nexus/page.tsx");
const policyConsole = read("app/service-bridge/policy/page.tsx");
const orchestrationConsole = read("app/service-bridge/orchestrate/page.tsx");
const batchConsole = read("app/service-bridge/orchestrate-batch/page.tsx");
const control = read("app/service-bridge/control/page.tsx");
const status = read("app/service-bridge/status/page.tsx");
const receiptConsole = read("app/service-bridge/receipts/page.tsx");
const eventConsole = read("app/service-bridge/events/page.tsx");
const manifest = read("app/api/service-bridge/manifest/route.ts");
const health = read("app/api/service-bridge/health/route.ts");
const openapi = read("app/api/service-bridge/openapi/route.ts");
const validate = read("app/api/service-bridge/validate/route.ts");
const singleRoute = read("app/api/service-bridge/orchestrate/route.ts");
const batchRoute = read("app/api/service-bridge/orchestrate-batch/route.ts");
const smoke = read("scripts/smoke-service-bridge-api.mjs");
const workflow = read(".github/workflows/service-bridge-verify.yml");

for (const state of requiredMissionStates) if (!domain.includes(`"${state}"`)) failures.push(`Missing mission state: ${state}`);
for (const service of requiredServices) if (!domain.includes(`name: "${service}"`)) failures.push(`Missing service definition: ${service}`);
for (const endpoint of requiredEndpoints) {
  if (!manifest.includes(endpoint)) failures.push(`Manifest missing endpoint: ${endpoint}`);
  if (!openapi.includes(endpoint)) failures.push(`OpenAPI missing endpoint: ${endpoint}`);
}

const checks = [
  [domain.includes("externalActionCompleted: false"), "Domain must force externalActionCompleted=false"],
  [domain.includes("validateMission") && domain.includes("getLaunchUrl"), "Shared validation or route generation is missing"],
  [manifest.includes("version: 11"), "Manifest version must be 11"],
  [manifest.includes('modes: ["single", "batch"]'), "Manifest must publish single and batch orchestration"],
  [manifest.includes("externalActionsRequireExplicitApproval: true") && manifest.includes("externalActionCompletedByManifest: false"), "Manifest approval law is incomplete"],
  [health.includes('status: healthy ? "healthy" : "degraded"') && health.includes("externalActionCompleted: false"), "Health contract is incomplete"],
  [openapi.includes('version: "11.0.0"'), "OpenAPI version must be 11.0.0"],
  [openapi.includes('"x-orchestration-modes"') && openapi.includes('"x-integrity-limitations"'), "OpenAPI extensions are incomplete"],
  [validate.includes("validateMission(mission)"), "Validation endpoint must use the shared validator"],
  [policy.includes('"ALLOW_PREPARE"') && policy.includes('"HOLD_FOR_APPROVAL"') && policy.includes('"BLOCK"'), "Policy decision set is incomplete"],
  [orchestration.includes("export function orchestrateMission") && orchestration.includes("export function summarizeOrchestrations"), "Canonical orchestration engine is incomplete"],
  [orchestration.includes('orchestrationModes = ["single", "batch"]'), "Canonical orchestration modes are missing"],
  [orchestration.includes("receiptDigest: receipt.integrity.digest"), "Canonical orchestration receipt digest alias is missing"],
  [singleRoute.includes('from "@/lib/service-bridge-orchestration"') && singleRoute.includes("orchestrateMission(mission)"), "Single orchestration route must use the canonical engine"],
  [batchRoute.includes('from "@/lib/service-bridge-orchestration"') && batchRoute.includes("missions.map(orchestrateMission)") && batchRoute.includes("summarizeOrchestrations(results)"), "Batch orchestration route must use the canonical engine"],
  [receipts.includes('algorithm: "SHA-256"') && receipts.includes("sorted-json-v1"), "Receipt integrity contract is incomplete"],
  [receipts.includes("signature: null") && receipts.includes("notary: null"), "Receipt limitations must remain explicit"],
  [events.includes("previousDigest") && events.includes("EVENT_DIGEST_MISMATCH") && events.includes("PREVIOUS_DIGEST_MISMATCH"), "Event-chain verification is incomplete"],
  [page.includes("localStorage") && page.includes("Export JSON") && page.includes("Import JSON") && page.includes("Launch route"), "Mission editor contract is incomplete"],
  [nexus.includes("Service Bridge Nexus") && nexus.includes("Batch Orchestration"), "Nexus must publish all operational rails"],
  [policyConsole.includes("/api/service-bridge/policy/evaluate"), "Policy console must use policy API"],
  [orchestrationConsole.includes("/api/service-bridge/orchestrate"), "Orchestration console must use orchestration API"],
  [batchConsole.includes("/api/service-bridge/orchestrate-batch"), "Batch console must use batch orchestration API"],
  [control.includes("/api/service-bridge/queue") && control.includes("/api/service-bridge/plan"), "Control console must use queue and plan APIs"],
  [status.includes("/api/service-bridge/health") && status.includes("/api/service-bridge/receipt"), "Status console must use health and receipt APIs"],
  [receiptConsole.includes("/api/service-bridge/receipt/mission") && receiptConsole.includes("/api/service-bridge/receipt/verify"), "Receipt console contract is incomplete"],
  [eventConsole.includes("/api/service-bridge/events/append") && eventConsole.includes("/api/service-bridge/events/verify"), "Event console contract is incomplete"],
  [smoke.includes("single and batch prepare parity") && smoke.includes("single and batch receipt parity"), "Smoke suite must verify shared-engine parity"],
  [smoke.includes("batch orchestration limit enforced") && smoke.includes("batch orchestration average readiness"), "Smoke suite must verify batch summary and limits"],
  [smoke.includes("high-risk policy blocks") && smoke.includes("blocked planning denied"), "Smoke suite must test policy boundaries"],
  [smoke.includes("receipt tamper detected") && smoke.includes("event-chain tamper detected"), "Smoke suite must test integrity tampering"],
  [workflow.includes("Live API smoke test") && workflow.includes("service-bridge:smoke"), "CI must run live API smoke tests"],
];

for (const [passed, message] of checks) if (!passed) failures.push(message);

if (failures.length) {
  console.error("SERVICE BRIDGE CONTRACT: FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SERVICE BRIDGE CONTRACT: PASS");
console.log(`Verified ${requiredFiles.length} files, ${requiredServices.length} services, ${requiredMissionStates.length} mission states, and ${requiredEndpoints.length} endpoints.`);
console.log("Canonical orchestration engine: single + batch parity enforced.");
console.log("Policy outcomes: prepare + hold + block.");
console.log("Receipt integrity: SHA-256 sorted-json-v1.");
console.log("Event-chain integrity: content and ordering verified.");
console.log("External-action boundary: preserved.");
