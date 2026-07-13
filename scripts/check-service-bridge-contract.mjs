import { readFile } from "node:fs/promises";

const requiredFiles = [
  "lib/service-bridge.ts",
  "app/service-bridge/page.tsx",
  "app/api/service-bridge/manifest/route.ts",
  "app/api/service-bridge/validate/route.ts",
];

const requiredServices = [
  "Indeed",
  "Uber",
  "Grubhub",
  "Gmail",
  "Google Calendar",
  "GitHub",
  "Norstein",
  "V# MAIN",
];

const requiredMissionStates = [
  "draft",
  "preflight",
  "awaiting-approval",
  "ready",
  "verified",
  "closed",
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
const page = files.get("app/service-bridge/page.tsx") ?? "";
const manifest = files.get("app/api/service-bridge/manifest/route.ts") ?? "";
const validate = files.get("app/api/service-bridge/validate/route.ts") ?? "";

for (const state of requiredMissionStates) {
  if (!domain.includes(`"${state}"`)) failures.push(`Missing mission state: ${state}`);
}

for (const service of requiredServices) {
  if (!domain.includes(`name: "${service}"`)) failures.push(`Missing service definition: ${service}`);
}

const contractChecks = [
  [domain.includes("externalActionCompleted: false"), "Domain validation must force externalActionCompleted=false"],
  [domain.includes("validateMission"), "Domain validation function is missing"],
  [domain.includes("getLaunchUrl"), "Launch URL generator is missing"],
  [manifest.includes("externalActionsRequireExplicitApproval: true"), "Manifest approval law is missing"],
  [manifest.includes("externalActionCompletedByManifest: false"), "Manifest must not claim external execution"],
  [validate.includes("validateMission(mission)"), "Validation endpoint is not using the shared validator"],
  [page.includes("localStorage"), "Application route must preserve local-first mission continuity"],
  [page.includes("Export JSON") && page.includes("Import JSON"), "Application route must support portable mission data"],
  [page.includes("Launch route"), "Application route must expose controlled service launchers"],
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
console.log(`Verified ${requiredFiles.length} files, ${requiredServices.length} services, and ${requiredMissionStates.length} mission states.`);
console.log("External-action boundary: preserved.");
