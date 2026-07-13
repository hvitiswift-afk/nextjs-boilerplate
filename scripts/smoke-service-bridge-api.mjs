const baseUrl = process.env.SERVICE_BRIDGE_BASE_URL || "http://127.0.0.1:3000";

const mission = {
  id: "XYZ-SMOKE-001",
  title: "Smoke-test CAD search mission",
  service: "Indeed",
  target: "CAD Designer III roles near Grand Rapids",
  action: "Search and prepare a shortlist",
  owner: "JP",
  state: "preflight",
  priority: 10,
  budget: "No application fee",
  permission: "User review required before application",
  evidence: "Job URL, employer, pay range, and status",
  fallback: "LinkedIn or employer career pages",
  next: "Review shortlist",
  query: "CAD Designer III",
  location: "Grand Rapids, Michigan",
  updatedAt: new Date().toISOString(),
};

const checks = [];

async function request(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  let body;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { response, body };
}

function check(name, passed, detail) {
  checks.push({ name, passed, detail });
  console.log(`${passed ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}

const manifest = await request("/api/service-bridge/manifest");
check("manifest responds", manifest.response.ok, `status ${manifest.response.status}`);
check("manifest approval boundary", manifest.body?.approvalLaw?.externalActionsRequireExplicitApproval === true);

const health = await request("/api/service-bridge/health");
check("health responds", health.response.ok, `status ${health.response.status}`);
check("health external boundary", health.body?.externalActionCompleted === false);

const validation = await request("/api/service-bridge/validate", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(mission),
});
check("single validation responds", validation.response.ok, `status ${validation.response.status}`);
check("single validation readiness", validation.body?.readiness === 100, `readiness ${validation.body?.readiness}`);
check("single validation external boundary", validation.body?.externalActionCompleted === false);

const batch = await request("/api/service-bridge/validate-batch", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ missions: [mission] }),
});
check("batch validation responds", batch.response.ok, `status ${batch.response.status}`);
check("batch count", batch.body?.summary?.total === 1, `total ${batch.body?.summary?.total}`);

const plan = await request("/api/service-bridge/plan", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(mission),
});
check("plan responds", plan.response.ok, `status ${plan.response.status}`);
check("plan has route", typeof plan.body?.route === "string" && plan.body.route.includes("indeed.com"));
check("plan external boundary", plan.body?.externalActionCompleted === false);

const queue = await request("/api/service-bridge/queue", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ missions: [mission] }),
});
check("queue responds", queue.response.ok, `status ${queue.response.status}`);
check("queue ranks mission", queue.body?.nextMissionId === mission.id, `next ${queue.body?.nextMissionId}`);
check("queue external boundary", queue.body?.externalActionCompleted === false);

const receipt = await request("/api/service-bridge/receipt");
check("receipt responds", receipt.response.ok, `status ${receipt.response.status}`);
check("receipt external boundary", receipt.body?.externalActionCompleted === false);

const failed = checks.filter((item) => !item.passed);

console.log("\nJP / Hviti Service Bridge Smoke Receipt");
console.log(`Base URL: ${baseUrl}`);
console.log(`Checks: ${checks.length}`);
console.log(`Passed: ${checks.length - failed.length}`);
console.log(`Failed: ${failed.length}`);
console.log(`Generated: ${new Date().toISOString()}`);
console.log("External-action boundary: PRESERVED");

if (failed.length) process.exit(1);
