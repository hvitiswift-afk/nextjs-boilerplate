const baseUrl = process.env.SERVICE_BRIDGE_BASE_URL || "http://127.0.0.1:3000";

const snapshot = {
  id: "XYZ-PERSIST-001",
  title: "Persistence smoke mission",
  service: "GitHub",
  target: "Service Bridge",
  action: "Verify persistence gate",
  owner: "JP",
  state: "preflight",
  priority: 9,
  budget: "None",
  permission: "Local write only",
  evidence: "Resolution and persistence receipts",
  fallback: "Manual recovery",
  next: "Original next",
  query: "",
  location: "",
  updatedAt: "2026-07-13T00:00:00.000Z",
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

const genesis = await post("/api/service-bridge/events/append", {
  missionId: snapshot.id,
  type: "MISSION_CREATED",
  actor: "JP",
  data: snapshot,
});
const update = await post("/api/service-bridge/events/append", {
  missionId: snapshot.id,
  type: "FIELD_UPDATED",
  actor: "JP",
  data: { next: "Projected next" },
  previousEvent: genesis.body?.event,
});
const events = [genesis.body?.event, update.body?.event];
check("persistence events created", genesis.response.ok && update.response.ok);

const missingReason = await post("/api/service-bridge/events/resolve", {
  snapshot,
  events,
  authority: "projection",
  actor: "JP",
  reason: "",
});
check("resolution requires reason", missingReason.response.status === 400, `status ${missingReason.response.status}`);

const resolution = await post("/api/service-bridge/events/resolve", {
  snapshot,
  events,
  authority: "projection",
  actor: "JP",
  reason: "Verified event history governs the recovered next action.",
});
check("resolution packet created", resolution.response.ok, `status ${resolution.response.status}`);
check("resolution authority recorded", resolution.body?.authority === "projection");
check("resolution proposes projected state", resolution.body?.resolvedState?.next === "Projected next");
check("resolution mutation remains unapplied", resolution.body?.mutationApplied === false);
check("resolution requires persistence", resolution.body?.requiresExplicitPersistence === true);
check("resolution external boundary", resolution.body?.externalActionCompleted === false);

const wrongConfirmation = await post("/api/service-bridge/events/persist", {
  resolution: resolution.body,
  currentMissions: [snapshot],
  confirmation: "PERSIST WRONG-ID",
});
check("persistence rejects wrong confirmation", wrongConfirmation.response.status === 400, `status ${wrongConfirmation.response.status}`);

const persistence = await post("/api/service-bridge/events/persist", {
  resolution: resolution.body,
  currentMissions: [snapshot],
  confirmation: `PERSIST ${snapshot.id}`,
});
check("persistence plan created", persistence.response.ok, `status ${persistence.response.status}`);
check("persistence preserves mission id", persistence.body?.nextMission?.id === snapshot.id);
check("persistence applies projected field in plan", persistence.body?.nextMission?.next === "Projected next");
check("persistence plan remains unapplied", persistence.body?.mutationApplied === false);
check("local persistence allowed", persistence.body?.localPersistenceAllowed === true);
check("external persistence denied", persistence.body?.externalPersistenceAllowed === false);
check("persistence external boundary", persistence.body?.externalActionCompleted === false);
check("storage key fixed", persistence.body?.storageKey === "jp-hviti-service-bridge-v2");

const manualWithoutState = await post("/api/service-bridge/events/resolve", {
  snapshot,
  events,
  authority: "manual",
  actor: "JP",
  reason: "Manual decision test.",
});
check("manual authority requires state", manualWithoutState.response.status === 400, `status ${manualWithoutState.response.status}`);

const failed = checks.filter((item) => !item.passed);
console.log("\nJP / Hviti Service Bridge Persistence Smoke Receipt");
console.log(`Checks: ${checks.length}`);
console.log(`Passed: ${checks.length - failed.length}`);
console.log(`Failed: ${failed.length}`);
console.log("Automatic mutation: DISALLOWED");
console.log("External persistence: DISALLOWED");
console.log("External-action boundary: PRESERVED");
if (failed.length) process.exit(1);
