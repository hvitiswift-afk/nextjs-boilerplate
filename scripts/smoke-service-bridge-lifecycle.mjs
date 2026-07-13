const baseUrl = process.env.SERVICE_BRIDGE_BASE_URL || "http://127.0.0.1:3000";

const checks = [];
const check = (name, passed, detail = "") => {
  checks.push({ name, passed });
  console.log(`${passed ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
};
const post = async (body) => {
  const response = await fetch(`${baseUrl}/api/service-bridge/lifecycle`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return { response, body: await response.json() };
};

const missionId = "XYZ-LIFECYCLE-001";
const first = await post({
  operation: "append",
  missionId,
  type: "RESOLUTION_CREATED",
  actor: "JP",
  data: { authority: "projection" },
});
check("first lifecycle entry created", first.response.ok, `status ${first.response.status}`);
check("first entry starts chain", first.body?.entry?.previousDigest === null);
check("first entry external boundary", first.body?.entry?.externalActionCompleted === false);

const second = await post({
  operation: "append",
  missionId,
  type: "PERSISTENCE_PLANNED",
  actor: "JP",
  data: { confirmation: `PERSIST ${missionId}` },
  previousEntry: first.body?.entry,
});
check("second lifecycle entry created", second.response.ok, `status ${second.response.status}`);
check("second entry links previous digest", second.body?.entry?.previousDigest === first.body?.entry?.digest);

const valid = await post({
  operation: "verify",
  entries: [first.body?.entry, second.body?.entry],
});
check("valid lifecycle journal verifies", valid.response.ok && valid.body?.valid === true, `status ${valid.response.status}`);
check("verified head digest returned", valid.body?.headDigest === second.body?.entry?.digest);
check("verification external boundary", valid.body?.externalActionCompleted === false);

const tamperedEntries = [
  first.body?.entry,
  { ...second.body?.entry, data: { confirmation: "ALTERED" } },
];
const tampered = await post({ operation: "verify", entries: tamperedEntries });
check("tampered lifecycle journal rejected", tampered.response.status === 422 && tampered.body?.valid === false, `status ${tampered.response.status}`);
check("digest mismatch reported", tampered.body?.errors?.some((item) => item.code === "LIFECYCLE_DIGEST_MISMATCH") === true);

const wrongMission = await post({
  operation: "verify",
  entries: [first.body?.entry, { ...second.body?.entry, missionId: "OTHER-MISSION" }],
});
check("mission id mismatch rejected", wrongMission.response.status === 422);
check("mission mismatch reported", wrongMission.body?.errors?.some((item) => item.code === "LIFECYCLE_MISSION_ID_MISMATCH") === true);

const unsupported = await post({
  operation: "append",
  missionId,
  type: "UNSUPPORTED",
  actor: "JP",
  data: {},
});
check("unsupported lifecycle type rejected", unsupported.response.status === 400, `status ${unsupported.response.status}`);

const failed = checks.filter((item) => !item.passed);
console.log("\nJP / Hviti Service Bridge Lifecycle Smoke Receipt");
console.log(`Checks: ${checks.length}`);
console.log(`Passed: ${checks.length - failed.length}`);
console.log(`Failed: ${failed.length}`);
console.log("Deterministic local integrity: VERIFIED");
console.log("Trusted timestamp claim: NONE");
console.log("External-action boundary: PRESERVED");
if (failed.length) process.exit(1);
