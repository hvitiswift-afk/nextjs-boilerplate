const baseUrl = process.env.SERVICE_BRIDGE_BASE_URL || "http://127.0.0.1:3000";

const checks = [];
const check = (name, passed, detail = "") => {
  checks.push({ name, passed });
  console.log(`${passed ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
};
const post = async (body) => {
  const response = await fetch(`${baseUrl}/api/service-bridge/lifecycle/apply`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return { response, body: await response.json() };
};

const missionId = "XYZ-LIFECYCLE-APPLY-001";
const currentMission = {
  id: missionId,
  title: "Current lifecycle apply mission",
  service: "GitHub",
  target: "Service Bridge",
  action: "Verify lifecycle projection application",
  owner: "JP",
  state: "preflight",
  priority: 8,
  budget: "None",
  permission: "Explicit local projection application",
  evidence: "Lifecycle projection apply receipt",
  fallback: "Rollback local projection",
  next: "Current next",
  query: "",
  location: "",
  updatedAt: "2026-07-13T00:00:00.000Z",
};
const projectedMission = {
  ...currentMission,
  state: "ready",
  next: "Projected next",
};
const validProjection = {
  schema: "jp-hviti-service-bridge-lifecycle-projection/v1",
  missionId,
  journalValid: true,
  state: { persisted: true, rolledBack: false, unresolvedPlan: false },
  externalActionCompleted: false,
};

const wrongConfirmation = await post({
  projection: validProjection,
  currentMissions: [currentMission],
  projectedMission,
  confirmation: "APPLY PROJECTION WRONG-ID",
});
check("projection apply rejects wrong confirmation", wrongConfirmation.response.status === 400, `status ${wrongConfirmation.response.status}`);

const invalidJournal = await post({
  projection: { ...validProjection, journalValid: false },
  currentMissions: [currentMission],
  projectedMission,
  confirmation: `APPLY PROJECTION ${missionId}`,
});
check("projection apply rejects invalid journal", invalidJournal.response.status === 400, `status ${invalidJournal.response.status}`);

const mismatchedMission = await post({
  projection: validProjection,
  currentMissions: [currentMission],
  projectedMission: { ...projectedMission, id: "OTHER-ID" },
  confirmation: `APPLY PROJECTION ${missionId}`,
});
check("projection apply rejects mission id mismatch", mismatchedMission.response.status === 400, `status ${mismatchedMission.response.status}`);

const missingCurrent = await post({
  projection: validProjection,
  currentMissions: [],
  projectedMission,
  confirmation: `APPLY PROJECTION ${missionId}`,
});
check("projection apply requires current mission", missingCurrent.response.status === 400, `status ${missingCurrent.response.status}`);

const plan = await post({
  projection: validProjection,
  currentMissions: [currentMission],
  projectedMission,
  confirmation: `APPLY PROJECTION ${missionId}`,
});
check("projection apply plan created", plan.response.ok, `status ${plan.response.status}`);
check("projection mutation explicitly allowed", plan.body?.projectionMutationAllowed === true);
check("projection mutation remains unapplied", plan.body?.projectionMutationApplied === false);
check("explicit confirmation remains required", plan.body?.explicitConfirmationRequired === true);
check("next mission preserves mission id", plan.body?.nextMission?.id === missionId);
check("projected mission fields carried forward", plan.body?.nextMission?.next === "Projected next");
check("local persistence allowed", plan.body?.localPersistenceAllowed === true);
check("external persistence denied", plan.body?.externalPersistenceAllowed === false);
check("external action boundary preserved", plan.body?.externalActionCompleted === false);

const failed = checks.filter((item) => !item.passed);
console.log("\nJP / Hviti Service Bridge Lifecycle Apply Smoke Receipt");
console.log(`Checks: ${checks.length}`);
console.log(`Passed: ${checks.length - failed.length}`);
console.log(`Failed: ${failed.length}`);
console.log("Projection mutation permission: EXPLICIT");
console.log("Automatic projection mutation: DISALLOWED");
console.log("External persistence: DISALLOWED");
console.log("External-action boundary: PRESERVED");
if (failed.length) process.exit(1);
