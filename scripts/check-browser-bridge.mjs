import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const missionPath = path.join(root, "examples/browser-bridge/github-enterprise-signup.mission.json");
const protocolPath = path.join(root, "lib/browser-bridge/protocol.ts");
const pagePath = path.join(root, "app/browser-bridge/page.tsx");
const docsPath = path.join(root, "docs/browser-bridge/HUMAN_AGENT_BROWSER_BRIDGE.md");
const p1DocsPath = path.join(root, "docs/browser-bridge/P1_LOCAL_COMPANION_AND_DIGITAL_HUMAN.md");
const receiptPath = path.join(root, "artifacts/browser-bridge/P0_VERIFICATION_RECEIPT.json");

const [missionText, protocolText, pageText, docsText, p1DocsText] = await Promise.all([
  readFile(missionPath, "utf8"),
  readFile(protocolPath, "utf8"),
  readFile(pagePath, "utf8"),
  readFile(docsPath, "utf8"),
  readFile(p1DocsPath, "utf8").catch((error) => {
    if (error?.code === "ENOENT") return "";
    throw error;
  })
]);

const mission = JSON.parse(missionText);
const checks = [];

function check(name, condition, detail) {
  const ok = Boolean(condition);
  checks.push({ name, ok, detail });
  if (!ok) throw new Error(`${name}: ${detail}`);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

const requiredHumanGates = [
  "password",
  "passkey",
  "two_factor_authentication",
  "captcha_or_human_verification",
  "account_recovery",
  "identity_attestation",
  "legal_terms_acceptance",
  "signature",
  "payment_method",
  "paid_plan_conversion"
];

const forbiddenAgentFieldKeys = new Set([
  "password",
  "passkey",
  "two_factor_authentication",
  "captcha",
  "captcha_or_human_verification",
  "recovery_code",
  "account_recovery",
  "signature",
  "payment_method",
  "card_number",
  "cvv",
  "legal_terms_acceptance"
]);

const acceptedPreConfirmationStates = new Set([
  "BLOCKED|BLOCKED_REQUIRES_SHARED_AUTHENTICATED_BROWSER",
  "READY_FOR_LOCAL_HANDOFF|NOT_SUBMITTED_LOCAL_AUTHENTICATED_RUN_REQUIRED"
]);

check("schema-version", mission.schemaVersion === "browser-bridge.mission.v1", "Mission schema must be v1.");
check("mission-id", mission.missionId === "github-enterprise-signup-fardarter-v1", "Mission ID must remain stable.");
check("provider", mission.provider === "GitHub", "Provider must be GitHub.");
check("account-login", mission.accountLogin === "hvitiswift-afk", "Connected account must be explicit.");
check(
  "truth-state",
  acceptedPreConfirmationStates.has(`${mission.currentState}|${mission.truthState}`),
  "Mission must remain blocked or explicitly not submitted before authenticated provider readback."
);
check("no-confirmed-claim", !/CONFIRMED|SUBMITTED_SUCCESS/i.test(mission.truthState), "Mission cannot claim signup completion.");

const target = new URL(mission.targetUrl);
check("https-target", target.protocol === "https:", "Target must use HTTPS.");
check("target-origin", target.origin === "https://github.com", "Target origin must be github.com.");
check(
  "origin-allowlist",
  Array.isArray(mission.allowedOrigins) && mission.allowedOrigins.length === 1 && mission.allowedOrigins[0] === target.origin,
  "Mission must allow only the exact GitHub origin."
);

check("exactly-once", mission.authorization?.exactlyOnce === true, "Create action must be exactly once.");
check("human-legal-gate", mission.authorization?.legalAcceptanceByHumanOnly === true, "Legal acceptance must remain human-only.");
check("human-payment-gate", mission.authorization?.paymentByHumanOnly === true, "Payment must remain human-only.");

const humanGates = new Set(mission.humanOnlyGates);
for (const gate of requiredHumanGates) {
  check(`human-gate:${gate}`, humanGates.has(gate), `Missing human-only gate ${gate}.`);
}

const fieldKeys = mission.fields.map((field) => field.key);
check("unique-field-keys", new Set(fieldKeys).size === fieldKeys.length, "Mission field keys must be unique.");

for (const field of mission.fields) {
  check(`agent-fill-boolean:${field.key}`, typeof field.agentFillAllowed === "boolean", "agentFillAllowed must be explicit.");
  check(
    `no-sensitive-agent-field:${field.key}`,
    !(field.agentFillAllowed && forbiddenAgentFieldKeys.has(field.key)),
    `Sensitive field ${field.key} cannot be agent-fillable.`
  );
  if (field.privateRuntimeSource) {
    check(`private-not-committed:${field.key}`, field.valueCommitted === false, "Private runtime values must not be committed.");
    check(`private-no-public-value:${field.key}`, !("publicValue" in field), "Private runtime fields cannot include a public value.");
  }
  if (field.candidateValues) {
    check(
      `unique-candidates:${field.key}`,
      new Set(field.candidateValues).size === field.candidateValues.length,
      "Candidate values must be unique."
    );
  }
}

const requiredStates = [
  "DRAFT",
  "PREPARED",
  "BROWSER_OPENING",
  "HANDOFF_REQUIRED",
  "AUTHENTICATED",
  "FILLING",
  "FILLED_VERIFIED",
  "HUMAN_APPROVAL_REQUIRED",
  "SUBMIT_AUTHORIZED",
  "SUBMITTING",
  "CONFIRMED",
  "BLOCKED",
  "OUTCOME_UNKNOWN",
  "CANCELLED"
];

for (const state of requiredStates) {
  check(`protocol-state:${state}`, protocolText.includes(`\"${state}\"`), `Protocol is missing ${state}.`);
}

check("transition-guard", protocolText.includes("Invalid browser-bridge transition"), "Protocol must reject invalid transitions.");
check("exactly-once-guard", protocolText.includes("rejected a second submission action"), "Protocol must reject a second submit action.");
check("operator-page-mission", pageText.includes("Human ↔ Agent Browser Bridge"), "Operator page title is missing.");
check("operator-page-provider-link", pageText.includes("Open GitHub signup"), "Operator page must expose the provider handoff link.");
check(
  "operator-page-no-secret-claim",
  pageText.includes("No passwords or payment data are committed") || pageText.includes("Private email resolves from the local environment"),
  "Operator page must state the secret boundary."
);
check(
  "docs-truth-state",
  docsText.includes(mission.truthState) || p1DocsText.includes(mission.truthState) || p1DocsText.includes("NOT_SUBMITTED"),
  "Architecture documentation must preserve the current pre-confirmation truth state."
);
check("docs-outcome-unknown", `${docsText}\n${p1DocsText}`.includes("OUTCOME_UNKNOWN") || `${docsText}\n${p1DocsText}`.includes("OUTCOME UNKNOWN"), "Architecture documentation must define ambiguous outcomes.");
check("docs-local-companion", `${docsText}\n${p1DocsText}`.includes("local browser companion") || `${docsText}\n${p1DocsText}`.includes("local companion"), "Architecture documentation must include the local companion target.");

const receipt = {
  schemaVersion: "browser-bridge.verification.v1",
  status: "PASSED",
  missionId: mission.missionId,
  truthState: mission.truthState,
  checkedAt: new Date().toISOString(),
  checks,
  digests: {
    mission: `sha256:${sha256(missionText)}`,
    protocol: `sha256:${sha256(protocolText)}`,
    operatorPage: `sha256:${sha256(pageText)}`,
    architecture: `sha256:${sha256(`${docsText}\n${p1DocsText}`)}`
  },
  boundaries: {
    liveBrowserOpened: false,
    authenticatedSessionAcquired: false,
    signupSubmitted: false,
    enterpriseConfirmed: false
  }
};

await mkdir(path.dirname(receiptPath), { recursive: true });
await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
console.log(JSON.stringify(receipt, null, 2));
