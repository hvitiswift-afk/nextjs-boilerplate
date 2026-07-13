const baseUrl = process.env.SERVICE_BRIDGE_BASE_URL || "http://127.0.0.1:3000";

const previousMission = {
  id: "XYZ-ROLLBACK-001",
  title: "Rollback source mission",
  service: "GitHub",
  target: "Service Bridge",
  action: "Verify rollback plan",
  owner: "JP",
  state: "preflight",
  priority: 7,
  budget: "None",
  permission: "Local restore only",
  evidence: "Persistence receipt",
  fallback: "Manual restore",
  next: "Previous next",
  query: "",
  location: "",
  updatedAt: "2026-07-13T00:00:00.000Z",
};

const currentMission = {
  ...previousMission,
  next: "Current next",
  updatedAt: "2026-07-13T01:00:00.000Z",
};

const persistenceReceipt = {
  schema: "jp-hviti-service-bridge-local-persistence-receipt/v1",
  appliedAt: "2026-07-13T01:00:00.000Z",
  missionId: previousMission.id,
  storageKey: "jp-hviti-service-bridge-v2",
  previousMission,
  nextMission: currentMission,
  localMutationApplied: true,
  externalPersistenceApplied: false,
  externalActionCompleted: false,
};

const checks = [];
const check = (name, passed, detail = "") => {
  checks.push({ name, passed });
  console.log(`${passed ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
};
const post = async (path, body) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return { response, body: await response.json() };
};

const wrongConfirmation = await post("/api/service-bridge/events/rollback", {
  receipt: persistenceReceipt,
  currentMissions: [currentMission],
  confirmation: "ROLLBACK LOCAL WRONG-ID",
});
check("rollback rejects wrong confirmation", wrongConfirmation.response.status === 400, `status ${wrongConfirmation.response.status}`);

const plan = await post("/api/service-bridge/events/rollback", {
  receipt: persistenceReceipt,
  currentMissions: [currentMission],
  confirmation: `ROLLBACK LOCAL ${previousMission.id}`,
});
check("rollback plan created", plan.response.ok, `status ${plan.response.status}`);
check("rollback restores previous field", plan.body?.rollbackMission?.next === "Previous next");
check("rollback preserves mission id", plan.body?.rollbackMission?.id === previousMission.id);
check("rollback queue contains restored mission", plan.body?.rollbackMissions?.[0]?.next === "Previous next");
check("rollback remains unapplied", plan.body?.rollbackApplied === false);
check("local rollback allowed", plan.body?.localRollbackAllowed === true);
check("external rollback denied", plan.body?.externalRollbackAllowed === false);
check("rollback external boundary", plan.body?.externalActionCompleted === false);
check("rollback storage key preserved", plan.body?.storageKey === persistenceReceipt.storageKey);

const invalidSchema = await post("/api/service-bridge/events/rollback", {
  receipt: { ...persistenceReceipt, schema: "unsupported" },
  currentMissions: [currentMission],
  confirmation: `ROLLBACK LOCAL ${previousMission.id}`,
});
check("rollback rejects unsupported receipt schema", invalidSchema.response.status === 400, `status ${invalidSchema.response.status}`);

const missingMission = await post("/api/service-bridge/events/rollback", {
  receipt: persistenceReceipt,
  currentMissions: [],
  confirmation: `ROLLBACK LOCAL ${previousMission.id}`,
});
check("rollback requires current mission", missingMission.response.status === 400, `status ${missingMission.response.status}`);

const failed = checks.filter((item) => !item.passed);
console.log("\nJP / Hviti Service Bridge Rollback Smoke Receipt");
console.log(`Checks: ${checks.length}`);
console.log(`Passed: ${checks.length - failed.length}`);
console.log(`Failed: ${failed.length}`);
console.log("Automatic rollback: DISALLOWED");
console.log("External rollback: DISALLOWED");
console.log("External-action boundary: PRESERVED");
if (failed.length) process.exit(1);
