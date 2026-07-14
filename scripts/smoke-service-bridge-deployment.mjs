const baseUrl = process.env.SERVICE_BRIDGE_BASE_URL || "http://127.0.0.1:3000";
const commitSha = "db5e5cccab42f0503a5ca87f8de38d2ea02188c3";

async function request(path, init) {
  const response = await fetch(new URL(path, baseUrl), init);
  const body = await response.json();
  return { response, body };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
  console.log(`PASS: ${message}`);
}

const readiness = await request(`/api/service-bridge/deployment?commit=${commitSha}`);
assert(readiness.response.ok, "deployment readiness endpoint responds");
assert(readiness.body.commitSha === commitSha, "deployment readiness preserves commit SHA");
assert(readiness.body.summary.publicDeploymentVerified === false, "deployment readiness does not claim public deployment");
assert(readiness.body.boundaries.repositoryCommitEqualsDeploymentSuccess === false, "commit is not treated as deployment success");
assert(readiness.body.externalActionCompleted === false, "deployment readiness preserves external action boundary");

const providers = [
  {
    provider: "vercel",
    configured: true,
    deploymentVerified: false,
    blocked: true,
    detail: "Blocked Vercel deployment status.",
  },
  {
    provider: "netlify",
    configured: false,
    deploymentVerified: false,
    blocked: null,
    detail: "Alternate provider not yet configured.",
  },
];

const wrong = await request("/api/service-bridge/deployment/repair", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    commitSha,
    providers,
    confirmation: "PLAN DEPLOYMENT REPAIR wrong",
  }),
});
assert(wrong.response.status === 400, "deployment repair rejects wrong confirmation");

const valid = await request("/api/service-bridge/deployment/repair", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    commitSha,
    providers,
    confirmation: `PLAN DEPLOYMENT REPAIR ${commitSha}`,
  }),
});
assert(valid.response.ok, "deployment repair accepts exact confirmation");
assert(valid.body.strategy === "bridge-to-netlify", "blocked Vercel infers Netlify bridge");
assert(valid.body.execution.automaticDeploymentAllowed === false, "automatic deployment remains disallowed");
assert(valid.body.execution.deploymentCompleted === false, "repair plan does not claim deployment completion");
assert(valid.body.boundaries.providerMutationApplied === false, "repair plan does not claim provider mutation");
assert(valid.body.externalActionCompleted === false, "deployment repair preserves external action boundary");

console.log("SERVICE BRIDGE DEPLOYMENT SMOKE: PASS");
