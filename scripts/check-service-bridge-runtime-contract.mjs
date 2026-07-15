import { access, readFile } from "node:fs/promises";

const version = 19;
const files = {
  catalog: "lib/service-bridge-contract-catalog.ts",
  manifest: "app/api/service-bridge/manifest/route.ts",
  openapi: "app/api/service-bridge/openapi/route.ts",
  health: "app/api/service-bridge/health/route.ts",
  receipt: "app/api/service-bridge/receipt/route.ts",
};

const source = Object.fromEntries(
  await Promise.all(
    Object.entries(files).map(async ([key, path]) => [key, await readFile(path, "utf8")]),
  ),
);

const failures = [];
const requireCheck = (passed, message) => {
  if (!passed) failures.push(message);
};

requireCheck(
  source.catalog.includes(`SERVICE_BRIDGE_CONTRACT_VERSION = ${version}`),
  `Contract catalog must report version ${version}.`,
);
requireCheck(source.openapi.includes("SERVICE_BRIDGE_CONTRACT_VERSION"), "OpenAPI must derive its version from the contract catalog.");
requireCheck(source.health.includes("SERVICE_BRIDGE_CONTRACT_VERSION"), "Health must derive its version from the contract catalog.");
requireCheck(source.receipt.includes("SERVICE_BRIDGE_CONTRACT_VERSION"), "Receipt must derive its version from the contract catalog.");
requireCheck(source.manifest.includes("SERVICE_BRIDGE_CONTRACT_VERSION"), "Manifest must derive its version from the contract catalog.");

const contractCallMatches = [
  ...source.catalog.matchAll(
    /contract\(\s*"[^"]+"\s*,\s*"[^"]+"\s*,\s*"([^"]+)"/g,
  ),
];
const legacyPathMatches = [...source.catalog.matchAll(/path:\s*"([^"]+)"/g)];
const endpoints = [
  ...new Set([
    ...contractCallMatches.map((match) => match[1]),
    ...legacyPathMatches.map((match) => match[1]),
  ]),
];
requireCheck(endpoints.length >= 48, `Contract catalog must publish at least 48 endpoints; found ${endpoints.length}.`);

requireCheck(source.manifest.includes("serviceBridgeContracts"), "Manifest must publish catalog endpoints.");
requireCheck(source.openapi.includes("serviceBridgeContracts"), "OpenAPI must publish catalog endpoints.");
requireCheck(source.health.includes("serviceBridgeContracts"), "Health must publish catalog endpoints.");
requireCheck(source.receipt.includes("serviceBridgeContracts"), "Receipt must publish catalog endpoints.");

for (const endpoint of endpoints) {
  const routePath = `${endpoint.replace(/^\//, "app/")}/route.ts`;
  try {
    await access(routePath);
  } catch {
    failures.push(`Missing route file for catalog endpoint: ${endpoint} (${routePath})`);
  }
}

for (const [name, text] of Object.entries(source)) {
  requireCheck(
    text.includes("externalActionCompleted") || name === "openapi",
    `${name} must preserve the external-action boundary.`,
  );
}

requireCheck(source.manifest.includes("explicitProjectionMutationAllowed: true"), "Manifest must explicitly allow confirmed local projection mutation.");
requireCheck(source.manifest.includes("automaticProjectionMutationAllowed: false"), "Manifest must disallow automatic projection mutation.");
requireCheck(source.health.includes("explicitProjectionMutationAllowed: true"), "Health must report explicit projection mutation permission.");
requireCheck(source.health.includes("automaticProjectionMutationAllowed: false"), "Health must report automatic projection mutation disabled.");
requireCheck(source.receipt.includes("explicitProjectionMutationAllowed: true"), "Receipt must record explicit projection mutation permission.");
requireCheck(source.receipt.includes("automaticProjectionMutationAllowed: false"), "Receipt must record automatic projection mutation disabled.");
requireCheck(source.openapi.includes('"x-lifecycle-projection-apply"'), "OpenAPI projection apply extension is missing.");

requireCheck(source.manifest.includes("automaticDeploymentAllowed: false"), "Manifest must disallow automatic deployment.");
requireCheck(source.health.includes("automaticDeploymentAllowed: false"), "Health must disallow automatic deployment.");
requireCheck(source.receipt.includes("automaticDeploymentAllowed: false"), "Receipt must disallow automatic deployment.");
requireCheck(source.openapi.includes('"x-automatic-deployment-allowed": false'), "OpenAPI must disallow automatic deployment.");
requireCheck(source.manifest.includes("publicDeploymentVerifiedByManifest: false"), "Manifest must not claim public deployment verification.");
requireCheck(source.health.includes("publicDeploymentVerifiedByHealthCheck: false"), "Health must not claim public deployment verification.");
requireCheck(source.receipt.includes("publicDeploymentVerifiedByReceipt: false"), "Receipt must not claim public deployment verification.");
requireCheck(source.openapi.includes('"x-public-deployment-verified": false'), "OpenAPI must not claim public deployment verification.");

const requiredAdvancedEndpoints = [
  "/api/service-bridge/contracts",
  "/api/service-bridge/polyglot/hypercube",
  "/api/service-bridge/polyglot/hypercube/route-plan",
  "/api/service-bridge/polyglot/polystructure",
  "/api/service-bridge/polyglot/polystructure/id",
  "/api/service-bridge/polyglot/polystructure/id/verify",
  "/api/service-bridge/polyglot/polystructure/id/chain",
  "/api/service-bridge/polyglot/polystructure/concatenate",
  "/api/service-bridge/polyglot/polystructure/bundle",
  "/api/service-bridge/polyglot/polystructure/bundle/verify",
  "/api/service-bridge/polyglot/polystructure/merkle",
  "/api/service-bridge/polyglot/polystructure/release",
  "/api/service-bridge/polyglot/polystructure/release/verify",
];

for (const endpoint of requiredAdvancedEndpoints) {
  requireCheck(endpoints.includes(endpoint), `Advanced endpoint missing from catalog: ${endpoint}`);
}

if (failures.length) {
  console.error("SERVICE BRIDGE RUNTIME CONTRACT: FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SERVICE BRIDGE RUNTIME CONTRACT: PASS");
console.log(`Version surfaces aligned through catalog version ${version}.`);
console.log(`Catalog endpoint surfaces checked: ${endpoints.length}.`);
console.log("Projection mutation permission: explicit local only.");
console.log("Automatic deployment and public deployment claims: disallowed.");
console.log("Polystructure identity, bundle, Merkle, and release routes: present.");
console.log("External action remains uncompleted by contract surfaces.");
