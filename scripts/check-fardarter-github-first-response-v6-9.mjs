import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const paths = {
  manifest: "receipts/revenue/FARDARTER-DRIVE-GITHUB-FIRST-RESPONSE-V6-9.json",
  schema: "schemas/revenue/fardarter-drive-github-first-response-v6-9.schema.json",
  workflow: ".github/workflows/audit-request-github-first-response-v6-9.yml",
  intake: ".github/workflows/audit-request-intake.yml",
  template: ".github/ISSUE_TEMPLATE/control-tower-audit-request.yml",
  outreach: "templates/github-control-tower-audit-outreach.md",
  doc: "docs/repository/FARDARTER-DRIVE-V6-9-GITHUB-FIRST-RESPONSE.md",
  chain: "receipts/revenue/FARDARTER-DRIVE-STATE-EVENTS-V6-2.json",
  reconciliation: "receipts/revenue/FARDARTER-DRIVE-RECONCILIATION-V6-5.json",
  package: "package.json",
};

const text = Object.fromEntries(
  await Promise.all(
    Object.entries(paths).map(async ([key, path]) => [key, await readFile(path, "utf8")]),
  ),
);

const parse = (value, label) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error(`${label} invalid JSON: ${error.message}`);
  }
};
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const stable = (value) =>
  Array.isArray(value)
    ? `[${value.map(stable).join(",")}]`
    : value && typeof value === "object"
      ? `{${Object.keys(value)
          .sort()
          .map((key) => `${JSON.stringify(key)}:${stable(value[key])}`)
          .join(",")}}`
      : JSON.stringify(value);
const sha256 = (value) => createHash("sha256").update(stable(value), "utf8").digest("hex");
const digestWithout = (object, key) => {
  const copy = structuredClone(object);
  delete copy[key];
  return sha256(copy);
};

const manifest = parse(text.manifest, "manifest");
const schema = parse(text.schema, "schema");
const chain = parse(text.chain, "event chain");
const reconciliation = parse(text.reconciliation, "reconciliation");
const pkg = parse(text.package, "package");

assert(
  manifest.controlId === "FARDARTER-DRIVE-GITHUB-FIRST-RESPONSE-V6-9" &&
    manifest.controllerVersion === "6.9.0" &&
    manifest.controllingIssue === 185,
  "v6.9 manifest identity mismatch",
);
assert(
  digestWithout(manifest, "manifestDigest") === manifest.manifestDigest,
  "v6.9 manifest digest mismatch",
);
assert(
  manifest.manifestDigest === "af6e9fd7c97dcb97f511f92b5d1f8baf907d6ea8b45c3ccdeef00a2d18eef3d9",
  "v6.9 manifest digest lock mismatch",
);
assert(
  schema.properties?.manifestDigest?.const === manifest.manifestDigest &&
    schema.properties?.controlId?.const === manifest.controlId &&
    schema.properties?.controllerVersion?.const === manifest.controllerVersion &&
    schema.properties?.controllingIssue?.const === manifest.controllingIssue,
  "v6.9 schema lock mismatch",
);

assert(
  manifest.predecessor.controllerVersion === "6.8.0" &&
    manifest.predecessor.implementationMerge === "4cb63ed2e480e3719c1015e28db007b09aad7f30" &&
    manifest.predecessor.identityModel === "GITHUB_ISSUE_AUTHOR" &&
    manifest.predecessor.channelModel === "EXACT_GITHUB_ISSUE_THREAD",
  "v6.9 predecessor linkage mismatch",
);
assert(
  chain.headSequence === 1 &&
    chain.headDigest === "3859eac9c63bef83624111704d38cf217b0c1a4ece6df874e72a76e9fb1ffc3b",
  "canonical event head changed",
);
assert(
  reconciliation.sequence === 1 &&
    reconciliation.snapshotDigest ===
      "9f4f878cc0f8f2ddfa7bbdb594d2b9164064acd8901301404aed57b4065eca0f",
  "canonical reconciliation changed",
);
assert(
  manifest.currentCanonical.eventHeadSequence === chain.headSequence &&
    manifest.currentCanonical.eventHeadDigest === chain.headDigest &&
    manifest.currentCanonical.reconciliationSequence === reconciliation.sequence &&
    manifest.currentCanonical.reconciliationDigest === reconciliation.snapshotDigest,
  "v6.9 manifest is stale against canonical heads",
);
assert(
  chain.currentCanonicalCounts.SCOPE_DRAFTED === 1 &&
    chain.currentCanonicalCounts.HUMAN_ACCEPTED === 0 &&
    chain.currentCanonicalCounts.ACTIVE === 0,
  "canonical state baseline changed",
);
assert(
  chain.financialEvidence.orders === 0 &&
    chain.financialEvidence.verifiedGrossRevenueUsd === 0 &&
    chain.financialEvidence.verifiedSettledCashUsd === 0 &&
    chain.financialEvidence.receivedCashRequires === "PAID_SETTLED",
  "canonical financial baseline changed",
);
assert(
  Object.values(manifest.actualEffects).every((value) => value === false),
  "v6.9 implementation created an actual effect",
);

assert(
  manifest.trigger.events.join("|") ===
    "issues.opened|issues.edited|issues.reopened|issues.labeled|issue_comment.created",
  "v6.9 trigger contract mismatch",
);
assert(
  manifest.eligibility.issueMustBeOpen === true &&
    manifest.eligibility.pullRequestAllowed === false &&
    manifest.eligibility.authorType === "User" &&
    manifest.eligibility.repositoryOwnerAllowed === false &&
    manifest.eligibility.botsAllowed === false &&
    manifest.eligibility.authorizationReceiptRequired === true &&
    manifest.eligibility.sensitivePublicContentAllowed === false,
  "v6.9 eligibility contract mismatch",
);
assert(
  manifest.response.maxResponsesPerIssue === 1 &&
    manifest.response.maxClarificationItems === 6 &&
    manifest.response.emailRequired === false &&
    manifest.response.emailAllowed === false &&
    manifest.response.repeatedUnsolicitedFollowUpAllowed === false &&
    manifest.response.acceptsScope === false &&
    manifest.response.createsOrder === false &&
    manifest.response.reservesCapacity === false &&
    manifest.response.confirmsPayment === false &&
    manifest.response.startsWork === false &&
    manifest.response.provesConsent === false,
  "v6.9 response consequence boundary mismatch",
);
assert(
  manifest.decisionLabels.replied === "contact-github-replied" &&
    manifest.decisionLabels.blocked === "contact-github-reply-blocked" &&
    manifest.decisionLabels.mutuallyExclusive === true,
  "v6.9 decision-label contract mismatch",
);

for (const required of [
  "issues:",
  "issue_comment:",
  "- labeled",
  "- created",
  "startsWith(github.event.issue.title, '[Audit request]:')",
  "const responseMarker = '<!-- jp-audit-github-first-response-v1 -->';",
  "const contactMarker = '<!-- jp-audit-github-contact-v1 -->';",
  "issue.state !== 'open'",
  "issue.pull_request",
  "labels.has('audit-fit-check')",
  "labels.has('contact-github-authorized')",
  "!labels.has('contact-channel-unresolved')",
  "author?.type === 'User'",
  "normalizedLogin !== owner.toLowerCase()",
  "normalizedLogin.endsWith('[bot]')",
  "publicEmail",
  "credentialAssignment",
  "privateKeyBlock",
  "providerIdentifier",
  "bankingNumber",
  "contact-github-replied",
  "contact-github-reply-blocked",
  "const limitedClarifications = clarifications.slice(0, 6);",
  "No repeated unsolicited follow-up will be sent.",
]) {
  assert(text.workflow.includes(required), `v6.9 workflow missing ${required}`);
}

const duplicateCheckIndex = text.workflow.indexOf(
  "if (comments.some((comment) => comment.body?.includes(responseMarker)))",
);
const responseBodyIndex = text.workflow.indexOf("body: `${responseMarker}");
assert(
  duplicateCheckIndex >= 0 && responseBodyIndex > duplicateCheckIndex,
  "v6.9 duplicate check must precede the bounded response body",
);
assert(
  text.workflow.split("body: `${responseMarker}").length - 1 === 1,
  "v6.9 workflow must define exactly one automatic response body",
);
assert(
  text.workflow.includes("labels: ['contact-github-replied']") &&
    text.workflow.includes("await removeLabel('contact-github-reply-blocked')") &&
    text.workflow.includes("labels: ['contact-github-reply-blocked', 'needs-jp-review']") &&
    text.workflow.includes("await removeLabel('contact-github-replied')"),
  "v6.9 decision labels are not mutually exclusive",
);
assert(
  !text.workflow.includes("send_email") &&
    !text.workflow.includes("Gmail") &&
    !text.workflow.includes("mailto:") &&
    !text.workflow.includes("fetch('http"),
  "v6.9 workflow must not email, scrape, or call an external target",
);
assert(
  text.workflow.includes("const problem = section('Current operating problem');") &&
    text.workflow.includes("const outcome = section('Desired outcome');") &&
    !text.workflow.includes("Problem: ${problem}") &&
    !text.workflow.includes("Outcome: ${outcome}") &&
    !text.workflow.includes("Priorities: ${") &&
    !text.workflow.includes("Notes: ${"),
  "v6.9 workflow must validate but never echo free-form issue text",
);

for (const required of [
  "<!-- jp-audit-github-contact-v1 -->",
  "contact-github-authorized",
  "contact-channel-unresolved",
  "Verified identity: the GitHub issue author.",
  "Authorized channel: this GitHub issue only.",
]) {
  assert(text.intake.includes(required), `v6.8 intake dependency missing ${required}`);
}
for (const required of [
  "id: contact_channel",
  "id: contact_permission",
  "I authorize one bounded, public-safe reply in this GitHub issue",
  "I will not post private email addresses",
]) {
  assert(text.template.includes(required), `request template missing ${required}`);
}
for (const required of [
  "## GitHub-native request reply",
  "one bounded clarification",
  "Do not post private email addresses",
  "I will not send repeated unsolicited follow-up",
]) {
  assert(text.outreach.includes(required), `outreach pack missing ${required}`);
}
for (const required of [
  "Fardarter Drive™ v6.9",
  "GITHUB_ISSUE_AUTHOR",
  "EXACT_GITHUB_ISSUE_THREAD",
  "contact-github-replied",
  "contact-github-reply-blocked",
  "No live self-test",
]) {
  assert(text.doc.includes(required), `v6.9 documentation missing ${required}`);
}

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const section = (body, label) => {
  const match = body.match(
    new RegExp(`###\\s+${escapeRegex(label)}\\s*\\n+([\\s\\S]*?)(?=\\n###\\s+|$)`, "i"),
  );
  const value = match?.[1]?.trim() || "";
  return value === "_No response_" ? "" : value;
};
const fixture = `### Repository URL

https://github.com/example/project

### Your relationship to the repository

Owner or administrator

### Current operating problem

Several checks are unclear.

### Desired outcome

A prioritized operating map.

### Approximate review size

Up to 10 open pull requests and 25 open issues

### Timing or deadline

No fixed deadline

### Package being considered

$100 USD Control Tower Audit
`;
assert(
  section(fixture, "Repository URL") === "https://github.com/example/project" &&
    section(fixture, "Your relationship to the repository") === "Owner or administrator" &&
    section(fixture, "Package being considered") === "$100 USD Control Tower Audit",
  "v6.9 public issue-form parser fixture failed",
);

const publicEmail = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const credentialAssignment =
  /(?:api[_ -]?key|access[_ -]?token|secret|password|passwd|client[_ -]?secret)\s*[:=]\s*(?!\[(?:redacted|removed)\])\S+/i;
const privateKeyBlock = /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/i;
const providerIdentifier =
  /(?:provider|payment|transaction)[ _-]?(?:id|identifier|reference)\s*[:=]\s*\S+/i;
const bankingNumber =
  /(?:routing|account|iban|swift)[ _-]?(?:number|code)?\s*[:=]\s*[A-Z0-9-]{4,}/i;
const sensitive = [
  publicEmail,
  credentialAssignment,
  privateKeyBlock,
  providerIdentifier,
  bankingNumber,
];
const safeBoundaryLanguage =
  "I have not posted credentials, payment records, provider transaction IDs, private email addresses, banking data, or private keys.";
assert(
  sensitive.every((pattern) => !pattern.test(safeBoundaryLanguage)),
  "v6.9 safety scanner falsely blocks ordinary boundary language",
);
for (const unsafeFixture of [
  "contact me at person@example.com",
  "api_key = live-secret-value",
  "-----BEGIN PRIVATE KEY-----",
  "transaction id: abc-123",
  "routing number: 123456789",
]) {
  assert(
    sensitive.some((pattern) => pattern.test(unsafeFixture)),
    `v6.9 safety scanner missed ${unsafeFixture}`,
  );
}

assert(
  pkg.scripts?.["fardarter:first-response:check"] ===
    "node scripts/check-fardarter-github-first-response-v6-9.mjs",
  "package is missing the v6.9 first-response verifier command",
);
assert(
  pkg.scripts?.["revenue:verify"]?.includes("npm run fardarter:first-response:check"),
  "unified revenue verifier does not run v6.9 first-response checks",
);

console.log(
  JSON.stringify(
    {
      status: "PASS",
      control: manifest.controlId,
      manifestDigest: manifest.manifestDigest,
      identity: manifest.predecessor.identityModel,
      channel: manifest.predecessor.channelModel,
      maxResponsesPerIssue: manifest.response.maxResponsesPerIssue,
      externalRequesterContactedByImplementation:
        manifest.actualEffects.externalRequesterContactedByImplementation,
      canonicalEventHead: `${chain.headSequence} / ${chain.headDigest}`,
      reconciliation: `${reconciliation.sequence} / ${reconciliation.snapshotDigest}`,
      actualEffects: "0 / 0 / 0 / $0 / $0",
    },
    null,
    2,
  ),
);
