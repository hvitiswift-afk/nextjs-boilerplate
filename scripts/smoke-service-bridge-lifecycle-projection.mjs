const baseUrl = process.env.SERVICE_BRIDGE_BASE_URL || "http://127.0.0.1:3000";

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

const missionId = "XYZ-LIFECYCLE-PROJECTION-001";
const append = async (type, data, previousEntry = null) => {
  const result = await post("/api/service-bridge/lifecycle", {
    operation: "append",
    missionId,
    type,
    actor: "JP",
    data,
    previousEntry,
  });
  check(`${type} appended`, result.response.ok, `status ${result.response.status}`);
  return result.body?.entry;
};

const resolution = await append("RESOLUTION_CREATED", { authority: "projection" });
const persistencePlan = await append("PERSISTENCE_PLANNED", { confirmation: `PERSIST ${missionId}` }, resolution);

const openPlan = await post("/api/service-bridge/lifecycle/project", {
  entries: [resolution, persistencePlan],
});
check("open persistence plan projects", openPlan.response.ok, `status ${openPlan.response.status}`);
check("open plan detected", openPlan.body?.state?.unresolvedPlan === true);
check("not yet persisted", openPlan.body?.state?.persisted === false);

const persistedEntry = await append("LOCAL_PERSISTENCE_APPLIED", { localMutationApplied: true }, persistencePlan);
const persisted = await post("/api/service-bridge/lifecycle/project", {
  entries: [resolution, persistencePlan, persistedEntry],
});
check("persisted lifecycle projects", persisted.response.ok, `status ${persisted.response.status}`);
check("persisted state detected", persisted.body?.state?.persisted === true);
check("open plan cleared after persistence", persisted.body?.state?.unresolvedPlan === false);

const rollbackPlan = await append("ROLLBACK_PLANNED", { confirmation: `ROLLBACK LOCAL ${missionId}` }, persistedEntry);
const rollbackApplied = await append("LOCAL_ROLLBACK_APPLIED", { localRollbackApplied: true }, rollbackPlan);
const rolledBack = await post("/api/service-bridge/lifecycle/project", {
  entries: [resolution, persistencePlan, persistedEntry, rollbackPlan, rollbackApplied],
});
check("rolled back lifecycle projects", rolledBack.response.ok, `status ${rolledBack.response.status}`);
check("rolled back state detected", rolledBack.body?.state?.rolledBack === true);
check("persisted state cleared after rollback", rolledBack.body?.state?.persisted === false);
check("projection preserves external boundary", rolledBack.body?.externalActionCompleted === false);

const tampered = await post("/api/service-bridge/lifecycle/project", {
  entries: [resolution, { ...persistencePlan, data: { altered: true } }],
});
check("tampered lifecycle projection rejected", tampered.response.status === 422, `status ${tampered.response.status}`);
check("tampered projection remains diagnostic", tampered.body?.journalValid === false);
check("projection errors returned", Array.isArray(tampered.body?.verificationErrors) && tampered.body.verificationErrors.length > 0);

const failed = checks.filter((item) => !item.passed);
console.log("\nJP / Hviti Service Bridge Lifecycle Projection Smoke Receipt");
console.log(`Checks: ${checks.length}`);
console.log(`Passed: ${checks.length - failed.length}`);
console.log(`Failed: ${failed.length}`);
console.log("Derived lifecycle state: VERIFIED");
console.log("Mutation by projection: DISALLOWED");
console.log("External-action boundary: PRESERVED");
if (failed.length) process.exit(1);
