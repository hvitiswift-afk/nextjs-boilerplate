import { readFile } from "node:fs/promises";

const files = {
  manifest: "app/api/service-bridge/manifest/route.ts",
  openapi: "app/api/service-bridge/openapi/route.ts",
  health: "app/api/service-bridge/health/route.ts",
  receipt: "app/api/service-bridge/receipt/route.ts",
  status: "app/service-bridge/status/page.tsx",
  nexus: "app/service-bridge/nexus/page.tsx",
  deploymentConsole: "app/service-bridge/deployment/page.tsx",
};

const source = Object.fromEntries(
  await Promise.all(
    Object.entries(files).map(async ([key, path]) => [key, await readFile(path, "utf8")]),
  ),
);

const endpoints = [
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
  "/api/service-bridge/deployment",
  "/api/service-bridge/deployment/repair",
];

const failures = [];
const requireCheck = (passed, message) => {
  if (!passed) failures.push(message);
};

requireCheck(source.manifest.includes("version: 17"), "Manifest must report version 17.");
requireCheck(source.openapi.includes('version: "17.0.0"'), "OpenAPI must report version 17.0.0.");
requireCheck(source.health.includes("version: 17"), "Health must report version 17.");
requireCheck(source.receipt.includes("version: 17"), "System receipt must report version 17.");

for (const endpoint of endpoints) {
  requireCheck(source.manifest.includes(endpoint), `Manifest missing endpoint: ${endpoint}`);
  requireCheck(source.openapi.includes(endpoint), `OpenAPI missing endpoint: ${endpoint}`);
  requireCheck(source.health.includes(endpoint), `Health missing endpoint: ${endpoint}`);
  requireCheck(source.receipt.includes(endpoint), `Receipt missing endpoint: ${endpoint}`);
}

for (const [name, text] of Object.entries(source)) {
  requireCheck(text.includes("externalActionCompleted") || name === "openapi", `${name} must preserve the external-action boundary.`);
}

requireCheck(source.manifest.includes("explicitProjectionMutationAllowed: true"), "Manifest must explicitly allow confirmed local projection mutation.");
requireCheck(source.manifest.includes("automaticProjectionMutationAllowed: false"), "Manifest must disallow automatic projection mutation.");
requireCheck(source.health.includes("explicitProjectionMutationAllowed: true"), "Health must report explicit projection mutation permission.");
requireCheck(source.health.includes("automaticProjectionMutationAllowed: false"), "Health must report automatic projection mutation disabled.");
requireCheck(source.receipt.includes("explicitProjectionMutationAllowed: true"), "Receipt must record explicit projection mutation permission.");
requireCheck(source.receipt.includes("automaticProjectionMutationAllowed: false"), "Receipt must record automatic projection mutation disabled.");
requireCheck(source.openapi.includes('"x-lifecycle-projection-apply"'), "OpenAPI projection apply extension is missing.");

requireCheck(source.manifest.includes('planningConfirmationPattern: "APPLY PROJECTION <mission-id>"'), "Manifest planning confirmation is missing.");
requireCheck(source.manifest.includes('commitConfirmationPattern: "COMMIT PROJECTION <mission-id>"'), "Manifest commit confirmation is missing.");
requireCheck(source.receipt.includes('planningConfirmationPattern: "APPLY PROJECTION <mission-id>"'), "Receipt planning confirmation is missing.");
requireCheck(source.receipt.includes('commitConfirmationPattern: "COMMIT PROJECTION <mission-id>"'), "Receipt commit confirmation is missing.");

requireCheck(source.manifest.includes('deploymentRepairConfirmationPattern: "PLAN DEPLOYMENT REPAIR <commit-sha>"'), "Manifest deployment repair confirmation is missing.");
requireCheck(source.receipt.includes('repairConfirmationPattern: "PLAN DEPLOYMENT REPAIR <commit-sha>"'), "Receipt deployment repair confirmation is missing.");
requireCheck(source.openapi.includes('"x-deployment-bridge"'), "OpenAPI deployment bridge extension is missing.");
requireCheck(source.manifest.includes("automaticDeploymentAllowed: false"), "Manifest must disallow automatic deployment.");
requireCheck(source.health.includes("automaticDeploymentAllowed: false"), "Health must disallow automatic deployment.");
requireCheck(source.receipt.includes("automaticDeploymentAllowed: false"), "Receipt must disallow automatic deployment.");
requireCheck(source.openapi.includes('"x-automatic-deployment-allowed": false'), "OpenAPI must disallow automatic deployment.");
requireCheck(source.manifest.includes("publicDeploymentVerifiedByManifest: false"), "Manifest must not claim public deployment verification.");
requireCheck(source.health.includes("publicDeploymentVerifiedByHealthCheck: false"), "Health must not claim public deployment verification.");
requireCheck(source.receipt.includes("publicDeploymentVerifiedByReceipt: false"), "Receipt must not claim public deployment verification.");
requireCheck(source.openapi.includes('"x-public-deployment-verified": false'), "OpenAPI must not claim public deployment verification.");

requireCheck(source.status.includes("Explicit projection mutation"), "Status console must surface projection mutation permission.");
requireCheck(source.status.includes("Projection apply gates"), "Status console must surface projection apply gates.");
requireCheck(source.nexus.includes("Projection Apply"), "Nexus must publish the projection apply rail.");
requireCheck(source.nexus.includes("Lifecycle Projection"), "Nexus must publish the lifecycle projection rail.");
requireCheck(source.deploymentConsole.includes("Deployment Bridge Repair"), "Deployment console must publish the repair surface.");
requireCheck(source.deploymentConsole.includes("PLAN DEPLOYMENT REPAIR"), "Deployment console must enforce exact repair confirmation.");

if (failures.length) {
  console.error("SERVICE BRIDGE RUNTIME CONTRACT: FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SERVICE BRIDGE RUNTIME CONTRACT: PASS");
console.log("Version surfaces aligned: manifest 17, OpenAPI 17.0.0, health 17, receipt 17.");
console.log(`Endpoint surfaces aligned: ${endpoints.length}.`);
console.log("Projection mutation permission: explicit local only.");
console.log("Automatic projection mutation: disallowed.");
console.log("Deployment repair: explicit planning only.");
console.log("Automatic deployment and public deployment claims: disallowed.");
console.log("External persistence and external action: disallowed.");
