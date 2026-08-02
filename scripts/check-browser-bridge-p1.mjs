import { randomBytes } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { appendBackwardLookingNote, readBackwardLookingNotes } from "../tools/browser-bridge/p1/secure-notes.mjs";
import { evaluatePressureIntent } from "../tools/browser-bridge/p1/pressure-policy.mjs";

const requiredFiles = [
  "tools/browser-bridge/p1/local-companion.mjs",
  "tools/browser-bridge/p1/pressure-policy.mjs",
  "tools/browser-bridge/p1/secure-notes.mjs",
  "tools/browser-bridge/p1/README.md",
  "examples/browser-bridge/digital-human.profile.json",
  "examples/browser-bridge/github-enterprise-signup.mission.json"
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function text(path) {
  const value = await readFile(path, "utf8");
  assert(value.trim().length > 0, `${path} is empty.`);
  return value;
}

const contents = Object.fromEntries(await Promise.all(requiredFiles.map(async (path) => [path, await text(path)])));
const missionText = contents["examples/browser-bridge/github-enterprise-signup.mission.json"];
const mission = JSON.parse(missionText);
const profile = JSON.parse(contents["examples/browser-bridge/digital-human.profile.json"]);
const companion = contents["tools/browser-bridge/p1/local-companion.mjs"];
const notesSource = contents["tools/browser-bridge/p1/secure-notes.mjs"];
const pressureSource = contents["tools/browser-bridge/p1/pressure-policy.mjs"];
const readme = contents["tools/browser-bridge/p1/README.md"];
const safeguardCorpus = [companion, notesSource, pressureSource, missionText, readme].join("\n");

assert(mission.schemaVersion === "browser-bridge.mission.v1", "Mission schema mismatch.");
assert(mission.currentState === "READY_FOR_LOCAL_HANDOFF", "Mission is not staged for local handoff.");
assert(mission.truthState === "NOT_SUBMITTED_LOCAL_AUTHENTICATED_RUN_REQUIRED", "Mission must not claim signup completion.");
assert(mission.localCompanion.endpoint === "http://127.0.0.1:9222", "Companion endpoint must be exact loopback.");
assert(mission.localCompanion.loopbackOnly === true, "Loopback-only flag is required.");
assert(mission.localCompanion.externalTunnel === false, "External tunnel must remain disabled.");
assert(mission.allowedOrigins.length === 1 && mission.allowedOrigins[0] === "https://github.com", "GitHub must be the sole mission origin.");
assert(mission.targetUrl.startsWith("https://github.com/"), "Target must remain on GitHub.");
assert(mission.authorization.exactlyOnce === true, "Exactly-once authorization is required.");
assert(mission.authorization.protectedSubmitByHumanOnly === true, "Protected final action must remain human-only.");

const requiredGates = [
  "password",
  "passkey",
  "two_factor_authentication",
  "captcha_or_human_verification",
  "identity_attestation",
  "legal_terms_acceptance",
  "signature",
  "payment_method",
  "paid_plan_conversion",
  "final_create_action_when_bound_to_terms_or_billing"
];
for (const gate of requiredGates) {
  assert(mission.humanOnlyGates.includes(gate), `Missing human-only gate: ${gate}`);
}

const sensitivePattern = /(password|passkey|otp|2fa|mfa|captcha|cvv|cvc|card|payment|signature|legal|terms|recovery|identity.?verification)/i;
for (const field of mission.fields) {
  assert(field.key && field.label, "Mission field missing key or label.");
  assert(!sensitivePattern.test(`${field.key} ${field.label}`), `Sensitive field committed as ordinary field: ${field.key}`);
  if (field.privateRuntimeSource) {
    assert(field.valueCommitted === false, `${field.key} must state valueCommitted=false.`);
    assert(!Object.hasOwn(field, "publicValue"), `${field.key} cannot have both runtime and public values.`);
  }
}

assert(profile.schemaVersion === "matadata.digital-human.v1", "Digital Human profile schema mismatch.");
assert(profile.principal.preferredName === "JP", "JP must remain the named principal.");
assert(profile.principal.authority === "human-principal-and-final-approver", "Human authority boundary changed.");
assert(profile.digitalHuman.identityState === "symbolic-user-controlled-software-layer", "Digital Human identity boundary changed.");
for (const boundary of ["mind-reading", "automatic consent", "independent legal authority"]) {
  const joined = JSON.stringify(profile).toLowerCase();
  assert(joined.includes(boundary), `Missing Digital Human nonclaim: ${boundary}`);
}
assert(profile.notesPolicy.direction === "backward-looking-only", "Notes must remain backward-looking.");
assert(profile.notesPolicy.contentInReceipts === false, "Note content cannot enter receipts.");
assert(profile.pressurePolicy.rawSensorStorage === false, "Raw pressure storage must remain disabled.");
assert(profile.pressurePolicy.protectedStepBehavior === "pause-and-handoff", "Protected pressure behavior changed.");

for (const requiredSnippet of [
  "127.0.0.1",
  "assertLoopbackEndpoint",
  "PROTECTED_CONTROL_PATTERN",
  "valuesStored: false",
  "SUBMISSION_STATUS_UNKNOWN",
  "blindRetryAllowed: false",
  "JP_GITHUB_CONTACT_EMAIL",
  "JP_BROWSER_BRIDGE_NOTES_KEY"
]) {
  assert(safeguardCorpus.includes(requiredSnippet), `Missing P1 safeguard: ${requiredSnippet}`);
}
assert(!companion.includes("--remote-allow-origins=*"), "Companion must not open Chrome debugging to every origin.");
assert(!companion.includes("0.0.0.0"), "Companion must not bind to all interfaces.");
assert(!companion.includes("screenshot"), "P1 must not capture screenshots by default.");
assert(notesSource.includes("aes-256-gcm"), "Encrypted notes must use AES-256-GCM.");
assert(notesSource.includes("appendFile"), "Notes must use append-only writes.");
assert(pressureSource.includes("pause-and-handoff"), "Pressure policy must preserve protected handoff.");

const syntaxFiles = [
  "tools/browser-bridge/p1/local-companion.mjs",
  "tools/browser-bridge/p1/secure-notes.mjs",
  "tools/browser-bridge/p1/pressure-policy.mjs",
  "scripts/check-browser-bridge-p1.mjs"
];
for (const path of syntaxFiles) {
  const result = spawnSync(process.execPath, ["--check", path], { encoding: "utf8" });
  assert(result.status === 0, `Syntax check failed for ${path}: ${result.stderr}`);
}

const ordinaryPressure = evaluatePressureIntent({
  pressure: "1/4",
  targetCategory: "ordinary",
  stableForMs: 300,
  released: true
});
assert(ordinaryPressure.allowed === true && ordinaryPressure.disposition === "activate", "Ordinary pressure activation failed.");

const protectedPressure = evaluatePressureIntent({
  pressure: "full",
  targetCategory: "legal-terms",
  stableForMs: 1_000,
  released: true
});
assert(protectedPressure.allowed === false && protectedPressure.disposition === "pause-and-handoff", "Protected pressure action was not blocked.");

const notesDir = await mkdtemp(join(tmpdir(), "browser-bridge-p1-"));
try {
  const notesPath = join(notesDir, "notes.enc.jsonl");
  const env = { JP_BROWSER_BRIDGE_NOTES_KEY: randomBytes(32).toString("base64") };
  const first = await appendBackwardLookingNote({
    path: notesPath,
    missionId: mission.missionId,
    text: "First verified retrospective note.",
    truthState: "RETROSPECTIVE_VERIFIED",
    evidence: ["test:first"],
    env,
    now: new Date("2026-08-02T20:00:00.000Z")
  });
  const second = await appendBackwardLookingNote({
    path: notesPath,
    missionId: mission.missionId,
    text: "Second note preserves the first without rewriting it.",
    truthState: "RETROSPECTIVE_VERIFIED",
    evidence: ["test:second"],
    env,
    now: new Date("2026-08-02T20:01:00.000Z")
  });
  const decoded = await readBackwardLookingNotes({ path: notesPath, env });
  assert(decoded.length === 2, "Encrypted note count mismatch.");
  assert(second.previousDigest === first.recordDigest, "Encrypted note chain did not link.");
  assert(decoded[0].direction === "backward-looking", "Note direction changed.");
} finally {
  await rm(notesDir, { recursive: true, force: true });
}

for (const phrase of [
  "Digital Human",
  "GitHub Enterprise Cloud free trial",
  "No public remote desktop or tunnel",
  "OUTCOME UNKNOWN = NO BLIND RETRY",
  "Tuesday, August 4, 2026"
]) {
  assert(readme.includes(phrase), `README missing required phrase: ${phrase}`);
}

const receipt = {
  schemaVersion: "browser-bridge.p1.verification.v1",
  status: "PASS",
  verifiedAt: new Date().toISOString(),
  missionId: mission.missionId,
  truthState: mission.truthState,
  requiredFiles: requiredFiles.length,
  ordinaryFieldCount: mission.fields.length,
  humanOnlyGateCount: mission.humanOnlyGates.length,
  localEndpoint: mission.localCompanion.endpoint,
  externalTunnel: mission.localCompanion.externalTunnel,
  pressureOrdinary: ordinaryPressure.disposition,
  pressureProtected: protectedPressure.disposition,
  encryptedNotesRoundTrip: "PASS",
  syntaxChecks: syntaxFiles.length,
  signupCompleted: false,
  nextState: "LOCAL_RUN_WITH_JP_REQUIRED"
};

await import("node:fs/promises").then(({ writeFile }) =>
  writeFile("browser-bridge-p1-verification.json", `${JSON.stringify(receipt, null, 2)}\n`, "utf8")
);
console.log(JSON.stringify(receipt, null, 2));
