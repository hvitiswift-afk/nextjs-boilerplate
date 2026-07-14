const baseUrl = process.argv[2] || process.env.SERVICE_BRIDGE_PUBLIC_URL;

if (!baseUrl) {
  console.error("Usage: node scripts/verify-service-bridge-deployment.mjs <https://public-url>");
  process.exit(1);
}

let normalized;
try {
  normalized = new URL(baseUrl);
} catch {
  console.error("Public deployment URL is invalid.");
  process.exit(1);
}

if (normalized.protocol !== "https:") {
  console.error("Public deployment verification requires HTTPS.");
  process.exit(1);
}

const targets = [
  ["health", "/api/service-bridge/health"],
  ["manifest", "/api/service-bridge/manifest"],
  ["openapi", "/api/service-bridge/openapi"],
  ["deployment", "/api/service-bridge/deployment"],
  ["nexus", "/service-bridge/nexus"],
  ["deployment-console", "/service-bridge/deployment"],
];

const results = [];
let allPassed = true;

for (const [name, path] of targets) {
  const url = new URL(path, normalized).toString();
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": "jp-hviti-service-bridge-deployment-verifier/1" },
    });
    const contentType = response.headers.get("content-type") || "";
    const passed = response.ok;
    results.push({ name, path, url, status: response.status, contentType, passed });
    if (!passed) allPassed = false;
  } catch (error) {
    allPassed = false;
    results.push({
      name,
      path,
      url,
      status: null,
      contentType: null,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

const receipt = {
  schema: "jp-hviti-service-bridge-public-deployment-verification/v1",
  verifiedAt: new Date().toISOString(),
  baseUrl: normalized.toString(),
  checksExpected: targets.length,
  checksCompleted: results.length,
  allPassed,
  publicDeploymentVerified: allPassed,
  productionUrlVerified: allPassed,
  results,
  boundaries: {
    repositoryCommitEqualsDeploymentSuccess: false,
    ciSuccessEqualsDeploymentSuccess: false,
    buildSuccessEqualsDeploymentSuccess: false,
    verificationRequiresReachableHttpsEndpoints: true,
    externalActionCompleted: false,
  },
  externalActionCompleted: false,
};

console.log(JSON.stringify(receipt, null, 2));
if (!allPassed) process.exit(1);
