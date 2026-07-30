import { readFile } from "node:fs/promises";

const paths = {
  template: ".github/ISSUE_TEMPLATE/control-tower-audit-request.yml",
  workflow: ".github/workflows/audit-request-intake.yml",
  outreach: "templates/github-control-tower-audit-outreach.md",
  chain: "receipts/revenue/FARDARTER-DRIVE-STATE-EVENTS-V6-2.json",
  reconciliation: "receipts/revenue/FARDARTER-DRIVE-RECONCILIATION-V6-5.json",
  package: "package.json",
};

const text = Object.fromEntries(
  await Promise.all(
    Object.entries(paths).map(async ([key, path]) => [key, await readFile(path, "utf8")]),
  ),
);

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const chain = JSON.parse(text.chain);
const reconciliation = JSON.parse(text.reconciliation);
const pkg = JSON.parse(text.package);

const permissionPhrase =
  "I authorize one bounded, public-safe reply in this GitHub issue";
const authorizedLabel = "contact-github-authorized";
const unresolvedLabel = "contact-channel-unresolved";
const contactMarker = "<!-- jp-audit-github-contact-v1 -->";

for (const required of [
  "id: contact_channel",
  "id: contact_permission",
  permissionPhrase,
  "GitHub issue only (recommended)",
  "does not authorize email",
  "I will not post private email addresses",
]) {
  assert(text.template.includes(required), `audit request template missing ${required}`);
}

for (const required of [
  "const contactPermissionPhrase =",
  permissionPhrase,
  authorizedLabel,
  unresolvedLabel,
  contactMarker,
  "githubContactAuthorized",
  "github.rest.issues.removeLabel",
  "Verified identity: the GitHub issue author.",
  "Authorized channel: this GitHub issue only.",
  "Email outreach authorized by this receipt: **NO**.",
  "Repeated unsolicited follow-up: **NOT AUTHORIZED**.",
]) {
  assert(text.workflow.includes(required), `audit intake workflow missing ${required}`);
}

assert(
  text.workflow.indexOf(contactMarker) <
    text.workflow.indexOf("createComment({", text.workflow.indexOf(contactMarker)),
  "contact marker must be defined before contact receipt creation",
);
assert(
  text.workflow.includes("githubContactAuthorized &&") &&
    text.workflow.includes(
      "!comments.some((comment) => comment.body?.includes(contactMarker))",
    ),
  "GitHub contact receipt is not idempotent",
);
assert(
  text.workflow.includes("? 'contact-github-authorized'") &&
    text.workflow.includes(": 'contact-channel-unresolved'") &&
    text.workflow.includes("? 'contact-channel-unresolved'") &&
    text.workflow.includes(": 'contact-github-authorized'"),
  "contact labels are not mutually exclusive",
);
assert(
  !text.workflow.includes("send_email") &&
    !text.workflow.includes("Gmail") &&
    !text.workflow.includes("mailto:"),
  "GitHub-native contact workflow must not send or infer email",
);

for (const required of [
  "## GitHub-native request reply",
  "one bounded clarification",
  "Do not post private email addresses",
  "I will not send repeated unsolicited follow-up",
  "without exposing an email address",
]) {
  assert(text.outreach.includes(required), `outreach pack missing ${required}`);
}

assert(
  chain.headSequence === 1 &&
    chain.headDigest ===
      "3859eac9c63bef83624111704d38cf217b0c1a4ece6df874e72a76e9fb1ffc3b",
  "canonical event head changed",
);
assert(
  reconciliation.sequence === 1 &&
    reconciliation.snapshotDigest ===
      "9f4f878cc0f8f2ddfa7bbdb594d2b9164064acd8901301404aed57b4065eca0f",
  "canonical reconciliation changed",
);
assert(
  chain.currentCanonicalCounts.SCOPE_DRAFTED === 1 &&
    chain.currentCanonicalCounts.HUMAN_ACCEPTED === 0 &&
    chain.currentCanonicalCounts.ACTIVE === 0,
  "canonical state counts changed",
);
assert(
  chain.financialEvidence.orders === 0 &&
    chain.financialEvidence.verifiedGrossRevenueUsd === 0 &&
    chain.financialEvidence.verifiedSettledCashUsd === 0,
  "canonical financial evidence changed",
);

assert(
  pkg.scripts["fardarter:contact:check"] ===
    "node scripts/check-fardarter-github-contact-v6-8.mjs",
  "package contact verifier command missing",
);
assert(
  pkg.scripts["revenue:verify"].includes("npm run fardarter:contact:check"),
  "unified revenue verifier does not run the contact contract",
);

console.log(
  JSON.stringify(
    {
      status: "PASS",
      control: "FARDARTER-DRIVE-GITHUB-CONTACT-V6-8",
      identity: "GITHUB_ISSUE_AUTHOR",
      channel: "EXACT_GITHUB_ISSUE_THREAD",
      contactReceiptIdempotent: true,
      contactLabelsMutuallyExclusive: true,
      emailRequired: false,
      emailSent: false,
      repeatedUnsolicitedFollowup: false,
      canonicalEventHead: chain.headSequence,
      canonicalEventDigest: chain.headDigest,
      reconciliationHead: reconciliation.sequence,
      reconciliationDigest: reconciliation.snapshotDigest,
      event2Appended: false,
      humanAccepted: chain.currentCanonicalCounts.HUMAN_ACCEPTED,
      orders: chain.financialEvidence.orders,
      active: chain.currentCanonicalCounts.ACTIVE,
      grossUsd: chain.financialEvidence.verifiedGrossRevenueUsd,
      settledUsd: chain.financialEvidence.verifiedSettledCashUsd,
    },
    null,
    2,
  ),
);
