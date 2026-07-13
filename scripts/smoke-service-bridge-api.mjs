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
const approvalMission = { ...mission, id: "XYZ-SMOKE-APPROVAL", title: "Prepare application submission", action: "Apply after final user approval", state: "awaiting-approval" };
const blockedMission = { ...mission, id: "XYZ-SMOKE-BLOCK", title: "Use bank account secret", action: "Transfer using bank account credentials" };
const checks = [];

async function request(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  let body;
  try { body = await response.json(); } catch { body = null; }
  return { response, body };
}
const post = (path, body) => request(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
const check = (name, passed, detail = "") => {
  checks.push({ name, passed });
  console.log(`${passed ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const manifest = await request("/api/service-bridge/manifest");
check("manifest responds", manifest.response.ok, `status ${manifest.response.status}`);
check("manifest version 12", manifest.body?.version === 12, `version ${manifest.body?.version}`);
check("manifest orchestration modes", manifest.body?.orchestration?.modes?.join(",") === "single,batch");
check("manifest recovery stages", manifest.body?.recovery?.stages?.join(",") === "event-chain,verify,project,reconcile,explicit-authority-decision");
check("manifest silent overwrite disabled", manifest.body?.recovery?.silentOverwriteAllowed === false);
check("manifest external boundary", manifest.body?.approvalLaw?.externalActionCompletedByManifest === false);

const openapi = await request("/api/service-bridge/openapi");
check("OpenAPI responds", openapi.response.ok, `status ${openapi.response.status}`);
check("OpenAPI version 12", openapi.body?.info?.version === "12.0.0", `version ${openapi.body?.info?.version}`);
for (const path of [
  "/api/service-bridge/orchestrate",
  "/api/service-bridge/orchestrate-batch",
  "/api/service-bridge/events/project",
  "/api/service-bridge/events/reconcile",
]) check(`OpenAPI documents ${path}`, Boolean(openapi.body?.paths?.[path]));
check("OpenAPI silent overwrite disabled", openapi.body?.["x-silent-overwrite-allowed"] === false);

const health = await request("/api/service-bridge/health");
check("health responds", health.response.ok, `status ${health.response.status}`);
check("health external boundary", health.body?.externalActionCompleted === false);

const validation = await post("/api/service-bridge/validate", mission);
check("validation responds", validation.response.ok, `status ${validation.response.status}`);
check("validation readiness", validation.body?.readiness === 100, `readiness ${validation.body?.readiness}`);

const preparePolicy = await post("/api/service-bridge/policy/evaluate", mission);
const approvalPolicy = await post("/api/service-bridge/policy/evaluate", approvalMission);
const blockedPolicy = await post("/api/service-bridge/policy/evaluate", blockedMission);
check("prepare policy allows", preparePolicy.body?.decision === "ALLOW_PREPARE");
check("approval policy holds", approvalPolicy.body?.decision === "HOLD_FOR_APPROVAL");
check("high-risk policy blocks", blockedPolicy.body?.decision === "BLOCK");

const orchestration = await post("/api/service-bridge/orchestrate", mission);
check("orchestration responds", orchestration.response.ok, `status ${orchestration.response.status}`);
check("orchestration planning allowed", orchestration.body?.route?.planningAllowed === true);
check("orchestration receipt digest", /^[a-f0-9]{64}$/.test(orchestration.body?.receiptDigest || ""));
check("orchestration external boundary", orchestration.body?.externalActionCompleted === false);

const approvalOrchestration = await post("/api/service-bridge/orchestrate", approvalMission);
const blockedOrchestration = await post("/api/service-bridge/orchestrate", blockedMission);
check("approval route opening denied", approvalOrchestration.body?.route?.openingAllowed === false);
check("blocked planning denied", blockedOrchestration.body?.route?.planningAllowed === false);

const batch = await post("/api/service-bridge/orchestrate-batch", { missions: [mission, approvalMission, blockedMission] });
check("batch orchestration responds", batch.response.ok, `status ${batch.response.status}`);
check("batch orchestration total", batch.body?.summary?.total === 3);
check("batch orchestration prepare", batch.body?.summary?.prepare === 1);
check("batch orchestration hold", batch.body?.summary?.hold === 1);
check("batch orchestration blocked", batch.body?.summary?.blocked === 1);
check("batch orchestration average readiness", batch.body?.summary?.averageReadiness === 100);
check("single and batch prepare parity", batch.body?.results?.[0]?.policy?.decision === orchestration.body?.policy?.decision);
check("single and batch receipt parity", batch.body?.results?.[0]?.receiptDigest === orchestration.body?.receiptDigest);

const oversized = await post("/api/service-bridge/orchestrate-batch", { missions: Array.from({ length: 101 }, (_, index) => ({ ...mission, id: `XYZ-OVER-${index}` })) });
check("batch orchestration limit enforced", oversized.response.status === 413, `status ${oversized.response.status}`);

const missionReceipt = await post("/api/service-bridge/receipt/mission", mission);
check("mission receipt responds", missionReceipt.response.ok);
check("mission receipt digest", /^[a-f0-9]{64}$/.test(missionReceipt.body?.integrity?.digest || ""));
const verifiedReceipt = await post("/api/service-bridge/receipt/verify", missionReceipt.body);
check("mission receipt verifies", verifiedReceipt.response.ok && verifiedReceipt.body?.valid === true);
const changedReceipt = structuredClone(missionReceipt.body);
changedReceipt.mission.title = "Tampered title";
const rejectedReceipt = await post("/api/service-bridge/receipt/verify", changedReceipt);
check("receipt tamper detected", rejectedReceipt.response.status === 422 && rejectedReceipt.body?.valid === false);

const genesis = await post("/api/service-bridge/events/append", { missionId: mission.id, type: "MISSION_CREATED", actor: "JP", data: mission });
const continuation = await post("/api/service-bridge/events/append", { missionId: mission.id, type: "FIELD_UPDATED", actor: "JP", data: { next: "Updated next" }, previousEvent: genesis.body?.event });
check("genesis event created", genesis.response.ok);
check("continuation event created", continuation.response.ok);
const events = [genesis.body?.event, continuation.body?.event];
const chain = await post("/api/service-bridge/events/verify", { events });
check("event chain verifies", chain.response.ok && chain.body?.valid === true);
const changedEvents = structuredClone(events);
changedEvents[0].data.title = "Changed event title";
const rejectedChain = await post("/api/service-bridge/events/verify", { events: changedEvents });
check("event-chain tamper detected", rejectedChain.response.status === 422 && rejectedChain.body?.valid === false);

const projection = await post("/api/service-bridge/events/project", { events });
check("projection responds", projection.response.ok);
check("projection rebuilds updated state", projection.body?.state?.next === "Updated next");
const reconciliation = await post("/api/service-bridge/events/reconcile", { snapshot: mission, events });
check("reconciliation conflict detected", reconciliation.response.status === 409);
check("reconciliation reports difference", reconciliation.body?.differences?.some((item) => item.field === "next") === true);
check("reconciliation external boundary", reconciliation.body?.externalActionCompleted === false);

const failed = checks.filter((item) => !item.passed);
console.log("\nJP / Hviti Service Bridge Smoke Receipt");
console.log(`Checks: ${checks.length}`);
console.log(`Passed: ${checks.length - failed.length}`);
console.log(`Failed: ${failed.length}`);
console.log("Silent overwrite: DISALLOWED");
console.log("External-action boundary: PRESERVED");
if (failed.length) process.exit(1);
