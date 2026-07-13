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

const approvalMission = {
  ...mission,
  id: "XYZ-SMOKE-APPROVAL",
  title: "Prepare application submission",
  action: "Apply after final user approval",
  state: "awaiting-approval",
};

const blockedMission = {
  ...mission,
  id: "XYZ-SMOKE-BLOCK",
  title: "Use bank account secret",
  action: "Transfer using bank account credentials",
};

const checks = [];

async function request(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  let body;
  try { body = await response.json(); } catch { body = null; }
  return { response, body };
}

function check(name, passed, detail) {
  checks.push({ name, passed, detail });
  console.log(`${passed ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}

const postMission = (path, payload = mission) => request(path, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(payload),
});

const manifest = await request("/api/service-bridge/manifest");
check("manifest responds", manifest.response.ok, `status ${manifest.response.status}`);
check("manifest version", manifest.body?.version >= 10, `version ${manifest.body?.version}`);
check("manifest approval boundary", manifest.body?.approvalLaw?.externalActionsRequireExplicitApproval === true);
check("manifest orchestration stages", manifest.body?.orchestration?.stages?.join(",") === "validate,policy,route,receipt,next-action");

const openapi = await request("/api/service-bridge/openapi");
check("OpenAPI responds", openapi.response.ok, `status ${openapi.response.status}`);
check("OpenAPI version", openapi.body?.info?.version === "10.0.0", `version ${openapi.body?.info?.version}`);
check("OpenAPI documents policy", Boolean(openapi.body?.paths?.["/api/service-bridge/policy/evaluate"]));
check("OpenAPI documents orchestration", Boolean(openapi.body?.paths?.["/api/service-bridge/orchestrate"]));
check("OpenAPI documents events", Boolean(openapi.body?.paths?.["/api/service-bridge/events/verify"]));

const health = await request("/api/service-bridge/health");
check("health responds", health.response.ok, `status ${health.response.status}`);
check("health external boundary", health.body?.externalActionCompleted === false);

const validation = await postMission("/api/service-bridge/validate");
check("single validation responds", validation.response.ok, `status ${validation.response.status}`);
check("single validation readiness", validation.body?.readiness === 100, `readiness ${validation.body?.readiness}`);
check("single validation external boundary", validation.body?.externalActionCompleted === false);

const preparePolicy = await postMission("/api/service-bridge/policy/evaluate");
check("prepare policy responds", preparePolicy.response.ok, `status ${preparePolicy.response.status}`);
check("prepare policy allows preparation", preparePolicy.body?.decision === "ALLOW_PREPARE", `decision ${preparePolicy.body?.decision}`);
check("prepare policy external boundary", preparePolicy.body?.externalActionCompleted === false);

const approvalPolicy = await postMission("/api/service-bridge/policy/evaluate", approvalMission);
check("approval policy holds", approvalPolicy.body?.decision === "HOLD_FOR_APPROVAL", `decision ${approvalPolicy.body?.decision}`);

const blockedPolicy = await postMission("/api/service-bridge/policy/evaluate", blockedMission);
check("high-risk policy blocks", blockedPolicy.body?.decision === "BLOCK", `decision ${blockedPolicy.body?.decision}`);

const orchestration = await postMission("/api/service-bridge/orchestrate");
check("orchestration responds", orchestration.response.ok, `status ${orchestration.response.status}`);
check("orchestration readiness", orchestration.body?.readiness === 100, `readiness ${orchestration.body?.readiness}`);
check("orchestration policy", orchestration.body?.policy?.decision === "ALLOW_PREPARE", `decision ${orchestration.body?.policy?.decision}`);
check("orchestration planning allowed", orchestration.body?.route?.planningAllowed === true);
check("orchestration receipt digest", /^[a-f0-9]{64}$/.test(orchestration.body?.receipt?.integrity?.digest || ""));
check("orchestration external boundary", orchestration.body?.externalActionCompleted === false);

const approvalOrchestration = await postMission("/api/service-bridge/orchestrate", approvalMission);
check("approval orchestration holds", approvalOrchestration.body?.policy?.decision === "HOLD_FOR_APPROVAL");
check("approval route opening denied", approvalOrchestration.body?.route?.openingAllowed === false);

const blockedOrchestration = await postMission("/api/service-bridge/orchestrate", blockedMission);
check("blocked orchestration blocks", blockedOrchestration.body?.policy?.decision === "BLOCK");
check("blocked planning denied", blockedOrchestration.body?.route?.planningAllowed === false);

const batch = await request("/api/service-bridge/validate-batch", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ missions: [mission] }) });
check("batch validation responds", batch.response.ok, `status ${batch.response.status}`);
check("batch count", batch.body?.summary?.total === 1, `total ${batch.body?.summary?.total}`);

const plan = await postMission("/api/service-bridge/plan");
check("plan responds", plan.response.ok, `status ${plan.response.status}`);
check("plan has route", typeof plan.body?.route === "string" && plan.body.route.includes("indeed.com"));
check("plan external boundary", plan.body?.externalActionCompleted === false);

const queue = await request("/api/service-bridge/queue", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ missions: [mission] }) });
check("queue responds", queue.response.ok, `status ${queue.response.status}`);
check("queue ranks mission", queue.body?.nextMissionId === mission.id, `next ${queue.body?.nextMissionId}`);
check("queue external boundary", queue.body?.externalActionCompleted === false);

const systemReceipt = await request("/api/service-bridge/receipt");
check("system receipt responds", systemReceipt.response.ok, `status ${systemReceipt.response.status}`);
check("system receipt external boundary", systemReceipt.body?.externalActionCompleted === false);

const missionReceipt = await postMission("/api/service-bridge/receipt/mission");
check("mission receipt responds", missionReceipt.response.ok, `status ${missionReceipt.response.status}`);
check("mission receipt SHA-256 digest", /^[a-f0-9]{64}$/.test(missionReceipt.body?.integrity?.digest || ""));

const validReceipt = await request("/api/service-bridge/receipt/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(missionReceipt.body) });
check("mission receipt verifies", validReceipt.response.ok && validReceipt.body?.valid === true, `status ${validReceipt.response.status}`);

const changedReceiptPayload = structuredClone(missionReceipt.body);
changedReceiptPayload.mission.title = "Tampered title";
const changedReceipt = await request("/api/service-bridge/receipt/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(changedReceiptPayload) });
check("receipt tamper detected", changedReceipt.response.status === 422 && changedReceipt.body?.valid === false, `status ${changedReceipt.response.status}`);

const genesis = await request("/api/service-bridge/events/append", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ missionId: mission.id, type: "MISSION_CREATED", actor: "JP", data: { title: mission.title } }) });
check("genesis event created", genesis.response.ok, `status ${genesis.response.status}`);

const continuation = await request("/api/service-bridge/events/append", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ missionId: mission.id, type: "APPROVAL_RECORDED", actor: "JP", data: { permission: mission.permission }, previousEvent: genesis.body?.event }) });
check("continuation event created", continuation.response.ok, `status ${continuation.response.status}`);

const validChain = await request("/api/service-bridge/events/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ events: [genesis.body?.event, continuation.body?.event] }) });
check("event chain verifies", validChain.response.ok && validChain.body?.valid === true, `status ${validChain.response.status}`);
check("event chain external boundary", validChain.body?.externalActionCompleted === false);

const changedChainEvents = structuredClone([genesis.body?.event, continuation.body?.event]);
changedChainEvents[0].data.title = "Changed event title";
const changedChain = await request("/api/service-bridge/events/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ events: changedChainEvents }) });
check("event-chain tamper detected", changedChain.response.status === 422 && changedChain.body?.valid === false, `status ${changedChain.response.status}`);

const failed = checks.filter((item) => !item.passed);
console.log("\nJP / Hviti Service Bridge Smoke Receipt");
console.log(`Base URL: ${baseUrl}`);
console.log(`Checks: ${checks.length}`);
console.log(`Passed: ${checks.length - failed.length}`);
console.log(`Failed: ${failed.length}`);
console.log(`Generated: ${new Date().toISOString()}`);
console.log("External-action boundary: PRESERVED");
if (failed.length) process.exit(1);
