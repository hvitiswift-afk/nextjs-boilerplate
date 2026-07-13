const baseUrl = process.env.SERVICE_BRIDGE_BASE_URL || "http://127.0.0.1:3000";

const snapshot = {
  id: "XYZ-RECOVERY-001",
  title: "Recovered mission",
  service: "GitHub",
  target: "Service Bridge repository",
  action: "Review recovery state",
  owner: "JP",
  state: "preflight",
  priority: 8,
  budget: "None",
  permission: "Local review only",
  evidence: "Verified event chain",
  fallback: "Manual comparison",
  next: "Review differences",
  query: "",
  location: "",
  updatedAt: "2026-07-13T00:00:00.000Z",
};

const checks = [];
const request = async (path, body) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return { response, body: await response.json() };
};
const check = (name, passed, detail = "") => {
  checks.push({ name, passed });
  console.log(`${passed ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const genesis = await request("/api/service-bridge/events/append", {
  missionId: snapshot.id,
  type: "MISSION_CREATED",
  actor: "JP",
  data: snapshot,
});
check("recovery genesis created", genesis.response.ok, `status ${genesis.response.status}`);

const update = await request("/api/service-bridge/events/append", {
  missionId: snapshot.id,
  type: "FIELD_UPDATED",
  actor: "JP",
  data: { next: "Projected next action" },
  previousEvent: genesis.body?.event,
});
check("recovery update created", update.response.ok, `status ${update.response.status}`);

const events = [genesis.body?.event, update.body?.event];
const projection = await request("/api/service-bridge/events/project", { events });
check("projection responds", projection.response.ok, `status ${projection.response.status}`);
check("projection chain valid", projection.body?.chainValid === true);
check("projection applies two events", projection.body?.appliedEvents === 2);
check("projection rebuilds field", projection.body?.state?.next === "Projected next action");
check("projection external boundary", projection.body?.externalActionCompleted === false);

const conflict = await request("/api/service-bridge/events/reconcile", { snapshot, events });
check("reconciliation conflict returns 409", conflict.response.status === 409, `status ${conflict.response.status}`);
check("reconciliation detects next difference", conflict.body?.differences?.some((item) => item.field === "next") === true);
check("reconciliation preserves explicit decision", /explicitly choose/i.test(conflict.body?.recommendedAction || ""));
check("reconciliation external boundary", conflict.body?.externalActionCompleted === false);

const alignedSnapshot = { ...snapshot, next: "Projected next action" };
const aligned = await request("/api/service-bridge/events/reconcile", { snapshot: alignedSnapshot, events });
check("aligned reconciliation responds", aligned.response.ok, `status ${aligned.response.status}`);
check("aligned reconciliation consistent", aligned.body?.consistent === true);

const tamperedEvents = structuredClone(events);
tamperedEvents[0].data.title = "Tampered recovery title";
const tamperedProjection = await request("/api/service-bridge/events/project", { events: tamperedEvents });
check("tampered projection rejected", tamperedProjection.response.status === 422, `status ${tamperedProjection.response.status}`);
check("tampered projection reports invalid chain", tamperedProjection.body?.chainValid === false);

const failed = checks.filter((item) => !item.passed);
console.log("\nJP / Hviti Service Bridge Recovery Smoke Receipt");
console.log(`Checks: ${checks.length}`);
console.log(`Passed: ${checks.length - failed.length}`);
console.log(`Failed: ${failed.length}`);
console.log("Silent overwrite: DISALLOWED");
console.log("External-action boundary: PRESERVED");
if (failed.length) process.exit(1);
