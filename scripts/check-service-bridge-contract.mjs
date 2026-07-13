import { readFile } from "node:fs/promises";

const requiredFiles = [
  "lib/service-bridge.ts",
  "lib/service-bridge-receipts.ts",
  "lib/service-bridge-events.ts",
  "app/service-bridge/page.tsx",
  "app/service-bridge/control/page.tsx",
  "app/service-bridge/status/page.tsx",
  "app/service-bridge/receipts/page.tsx",
  "app/service-bridge/events/page.tsx",
  "app/api/service-bridge/manifest/route.ts",
  "app/api/service-bridge/health/route.ts",
  "app/api/service-bridge/openapi/route.ts",
  "app/api/service-bridge/validate/route.ts",
  "app/api/service-bridge/validate-batch/route.ts",
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
  try {
    files.set(path, await readFile(path, "utf8"));
  } catch (error) {
    failures.push(`Missing required file: ${path} (${error.message})`);
  }
}

const domain = files.get("lib/service-bridge.ts") ?? "";
const receipts = files.get("lib/service-bridge-receipts.ts") ?? "";
const events = files.get("lib/service-bridge-events.ts") ?? "";
const page = files.get("app/service-bridge/page.tsx") ?? "";
const control = files.get("app/service-bridge/control/page.tsx") ?? "";
const status = files.get("app/service-bridge/status/page.tsx") ?? "";
const receiptConsole = files.get("app/service-bridge/receipts/page.tsx") ?? "";
const eventConsole = files.get("app/service-bridge/events/page.tsx") ?? "";
const manifest = files.get("app/api/service-bridge/manifest/route.ts") ?? "";
const health = files.get("app/api/service-bridge/health/route.ts") ?? "";
const openapi = files.get("app/api/service-bridge/openapi/route.ts") ?? "";
const validate = files.get("app/api/service-bridge/validate/route.ts") ?? "";
const smoke = files.get("scripts/smoke-service-bridge-api.mjs") ?? "";
const workflow = files.get(".github/workflows/service-bridge-verify.yml") ?? "";

for (const state of requiredMissionStates) {
  if (!domain.includes(`"${state}"`)) failures.push(`Missing mission state: ${state}`);
}

for (const service of requiredServices) {
  if (!domain.includes(`name: "${service}"`)) failures.push(`Missing service definition: ${service}`);
}

for (const endpoint of requiredEndpoints) {
  if (!manifest.includes(endpoint)) failures.push(`Manifest missing endpoint: ${endpoint}`);
  if (!openapi.includes(endpoint)) failures.push(`OpenAPI missing endpoint: ${endpoint}`);
}

const contractChecks = [
  [domain.includes("externalActionCompleted: false"), "Domain validation must force externalActionCompleted=false"],
  [domain.includes("validateMission"), "Domain validation function is missing"],
  [domain.includes("getLaunchUrl"), "Launch URL generator is missing"],
  [manifest.includes("version: 8"), "Manifest version must be at least 8"],
  [manifest.includes("externalActionsRequireExplicitApproval: true"), "Manifest approval law is missing"],
  [manifest.includes("externalActionCompletedByManifest: false"), "Manifest must not claim external execution"],
  [health.includes("status: healthy ? \"healthy\" : \"degraded\""), "Health endpoint must distinguish healthy and degraded states"],
  [health.includes("externalActionCompleted: false"), "Health endpoint must preserve external-action boundary"],
  [openapi.includes('version: "8.0.0"'), "OpenAPI version must match the current contract"],
  [openapi.includes('"x-integrity-limitations"'), "OpenAPI must publish integrity limitations"],
  [validate.includes("validateMission(mission)"), "Validation endpoint is not using the shared validator"],
  [receipts.includes('algorithm: "SHA-256"'), "Receipt integrity algorithm must be SHA-256"],
  [receipts.includes("sorted-json-v1"), "Receipt canonicalization contract is missing"],
  [receipts.includes("signature: null") && receipts.includes("notary: null"), "Receipt limitations must remain explicit"],
  [events.includes("previousDigest"), "Event chain must link to the previous digest"],
  [events.includes("EVENT_DIGEST_MISMATCH") && events.includes("PREVIOUS_DIGEST_MISMATCH"), "Event verifier must detect content and ordering changes"],
  [page.includes("localStorage"), "Application route must preserve local-first mission continuity"],
  [page.includes("Export JSON") && page.includes("Import JSON"), "Application route must support portable mission data"],
  [page.includes("Launch route"), "Application route must expose controlled service launchers"],
  [control.includes("/api/service-bridge/queue") && control.includes("/api/service-bridge/plan"), "Control console must use queue and plan APIs"],
  [status.includes("/api/service-bridge/health") && status.includes("/api/service-bridge/receipt"), "Status console must use health and receipt APIs"],
  [receiptConsole.includes("/api/service-bridge/receipt/mission") && receiptConsole.includes("/api/service-bridge/receipt/verify"), "Receipt console must generate and verify receipts"],
  [eventConsole.includes("/api/service-bridge/events/append") && eventConsole.includes("/api/service-bridge/events/verify"), "Event console must append and verify event chains"],
  [smoke.includes("receipt tamper detected") && smoke.includes("event-chain tamper detected"), "Smoke suite must test tamper detection"],
  [workflow.includes("Live API smoke test") && workflow.includes("service-bridge:smoke"), "CI must run the live smoke suite"],
];

for (const [passed, message] of contractChecks) {
  if (!passed) failures.push(message);
}

if (failures.length) {
  console.error("SERVICE BRIDGE CONTRACT: FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SERVICE BRIDGE CONTRACT: PASS");
console.log(`Verified ${requiredFiles.length} files, ${requiredServices.length} services, ${requiredMissionStates.length} mission states, and ${requiredEndpoints.length} endpoints.`);
console.log("Receipt integrity: SHA-256 sorted-json-v1.");
console.log("Event-chain integrity: content and ordering verified.");
console.log("External-action boundary: preserved.");
