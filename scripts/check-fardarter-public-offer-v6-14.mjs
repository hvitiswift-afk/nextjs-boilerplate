import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const paths = {
  manifest: "receipts/revenue/FARDARTER-DRIVE-PUBLIC-OFFER-V6-14.json",
  schema: "schemas/revenue/fardarter-drive-public-offer-v6-14.schema.json",
  template: "templates/fardarter-drive-public-offer-v6-14.md",
  documentation: "docs/revenue/FARDARTER-DRIVE-PUBLIC-OFFER-V6-14.md",
  unified: "receipts/revenue/FARDARTER-DRIVE-UNIFIED-CONTROL-V6-13.json",
  production: "receipts/revenue/FARDARTER-DRIVE-PRODUCTION-RECONCILIATION-V6-12.json",
  contact: "receipts/revenue/FARDARTER-DRIVE-GITHUB-FIRST-RESPONSE-V6-9.json",
  chain: "receipts/revenue/FARDARTER-DRIVE-STATE-EVENTS-V6-2.json",
  reconciliation: "receipts/revenue/FARDARTER-DRIVE-RECONCILIATION-V6-5.json",
  issueForm: ".github/ISSUE_TEMPLATE/control-tower-audit-request.yml",
  workflow: ".github/workflows/fardarter-public-offer-v6-14.yml",
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

const sha256Stable = (value) =>
  createHash("sha256").update(stable(value), "utf8").digest("hex");
const sha256Text = (value) => createHash("sha256").update(value, "utf8").digest("hex");
const without = (object, key) => {
  const copy = structuredClone(object);
  delete copy[key];
  return copy;
};

const manifest = parse(text.manifest, "public-offer manifest");
const schema = parse(text.schema, "public-offer schema");
const unified = parse(text.unified, "v6.13 unified control");
const production = parse(text.production, "v6.12 production reconciliation");
const contact = parse(text.contact, "v6.9 contact manifest");
const chain = parse(text.chain, "canonical event chain");
const reconciliation = parse(text.reconciliation, "canonical reconciliation");
const pkg = parse(text.package, "package");

assert(
  manifest.controlId === "FARDARTER-DRIVE-PUBLIC-OFFER-V6-14" &&
    manifest.controllerVersion === "6.14.0" &&
    manifest.controllingIssue === 200 &&
    manifest.implementationIssue === 201 &&
    manifest.publicOfferIssue === 133,
  "v6.14 public-offer identity mismatch",
);
assert(
  sha256Stable(without(manifest, "manifestDigest")) === manifest.manifestDigest &&
    manifest.manifestDigest === "b16a39679d1baea0c34b11f1544f0c4fa3aa0702d0187a51b6965853fa93a836",
  "v6.14 manifest digest mismatch",
);
assert(
  schema.type === "object" && stable(schema.const) === stable(manifest),
  "v6.14 exact schema does not lock the manifest",
);
assert(
  manifest.repository.baseHead === "d284510c179a4ac38a0459c18cea23b474973605" &&
    manifest.repository.unifiedControlVersion === "6.13.0" &&
    manifest.repository.unifiedControlDigest === unified.manifestDigest &&
    unified.manifestDigest === "2f33a58938a480b70ce9ea26e24c74677e6294e93729412e3fb81db006e5e29c" &&
    manifest.repository.publicOfferState === "PREPARED_PENDING_REVIEWED_MERGE_AND_ISSUE_UPDATE",
  "v6.14 repository/unified-control link mismatch",
);

assert(
  sha256Text(text.template) === manifest.publicIssue.bodySha256 &&
    manifest.publicIssue.bodySha256 === "369338fda0fe9e2236eecd68a1321635e025e85365eb701e10ee1d8bb3c405e0" &&
    text.template.startsWith(manifest.publicIssue.bodyMarker) &&
    manifest.publicIssue.targetTitle ===
      "GitHub Control Tower Audit + Fardarter Drive™ v6.14 — verified production / public-safe intake open" &&
    manifest.publicIssue.operatingSurface ===
      "MUTABLE_CURRENT_TRUTH_WITH_APPEND_ONLY_COMPLETION_RECEIPTS" &&
    manifest.publicIssue.historicalCommentsPreserved === true &&
    manifest.publicIssue.exactPostMergeUpdateRequired === true,
  "v6.14 exact Issue #133 body/title contract mismatch",
);

assert(
  manifest.production.reconciliationDigest === production.manifestDigest &&
    production.manifestDigest === "1e8aa2af8bb3af332185b7419c63e2c1ad8c19c866e45b62fe04a2fc969932ee" &&
    manifest.production.applicationSource === production.verifiedProduction.deployedApplicationSource &&
    manifest.production.deployId === production.verifiedProduction.deployId &&
    manifest.production.applicationState === "DEPLOYED_AND_VERIFIED" &&
    manifest.production.controlState === "RECONCILED" &&
    manifest.production.verifiedRouteCount === 18 &&
    manifest.production.exactBodyMatchCount === 18 &&
    manifest.production.repositoryRelationship === "CONTROL_AHEAD_OF_DEPLOYED_APPLICATION_SOURCE" &&
    manifest.production.publicOfferUpdateCreatesDeployment === false &&
    manifest.production.futurePromotionOwnedBySeparateLiveWatch === true,
  "v6.14 production/source distinction mismatch",
);

assert(
  manifest.contact.identityModel === contact.predecessor.identityModel &&
    manifest.contact.channelModel === contact.predecessor.channelModel &&
    manifest.contact.identityModel === "GITHUB_ISSUE_AUTHOR" &&
    manifest.contact.channelModel === "EXACT_GITHUB_ISSUE_THREAD" &&
    manifest.contact.nativeWorkflowSoleWriter === true &&
    manifest.contact.maxAutomaticFirstResponsesPerIssue === 1 &&
    manifest.contact.publicEmailRequired === false &&
    manifest.contact.repeatedUnsolicitedFollowUpAllowed === false &&
    manifest.contact.deliveryOrSilenceProvesConsent === false,
  "v6.14 contact boundary mismatch",
);

assert(
  manifest.drive.state === unified.drive.state &&
    manifest.drive.receiptDigest === unified.drive.receiptDigest &&
    manifest.drive.knownDocumentCount === 17 &&
    manifest.drive.ownerOnly === true &&
    manifest.drive.shared === false &&
    manifest.drive.publicPrivateReferencesExposed === false,
  "v6.14 private Drive boundary mismatch",
);

assert(
  chain.headSequence === 1 &&
    chain.headDigest === manifest.canonical.eventHeadDigest &&
    reconciliation.sequence === 1 &&
    reconciliation.snapshotDigest === manifest.canonical.reconciliationDigest &&
    chain.currentCanonicalCounts.SCOPE_DRAFTED === 1 &&
    chain.currentCanonicalCounts.HUMAN_ACCEPTED === 0 &&
    chain.currentCanonicalCounts.ACTIVE === 0 &&
    manifest.canonical.event2Present === false,
  "v6.14 canonical truth mismatch",
);
assert(
  manifest.consent.packageState === "NO_PACKAGE" &&
    manifest.consent.decision === "AWAITING_COUNTERPARTY_EVIDENCE" &&
    manifest.consent.independentVerificationPerformed === false &&
    manifest.consent.publicOfferOrContactProvesConsent === false,
  "v6.14 consent boundary mismatch",
);
assert(
  manifest.capacity.totalPlanningSlots === 1000 &&
    manifest.capacity.effectiveActiveCeiling === 100 &&
    manifest.capacity.activeDeliveries === 0 &&
    manifest.capacity.activeHeadroom === 100 &&
    manifest.capacity.overrideState === "INACTIVE_NO_RECEIPT" &&
    manifest.capacity.automaticOverrideActivationAllowed === false,
  "v6.14 capacity truth mismatch",
);
assert(
  manifest.money.orders === 0 &&
    manifest.money.verifiedGrossRevenueUsd === 0 &&
    manifest.money.verifiedSettledCashUsd === 0 &&
    manifest.money.receivedCashRequires === "PAID_SETTLED",
  "v6.14 money truth mismatch",
);
assert(
  manifest.offer.publicState === "OPEN_FOR_VERIFIED_FIT_CHECKS" &&
    manifest.offer.openExternalAuditRequestsAtPreparation === 0 &&
    manifest.offer.dynamicFitCheckCountIsOrderCount === false &&
    manifest.offer.fitApprovalBinding === false &&
    manifest.pointInTimeScan.openExternalAuditRequests === 0 &&
    manifest.pointInTimeScan.relevantInboundCounterpartyMessages === 0 &&
    manifest.pointInTimeScan.newConsentPackages === 0 &&
    manifest.pointInTimeScan.contactConflicts === 0 &&
    manifest.pointInTimeScan.financingSolicitationExcludedAsCounterpartyCase === true &&
    manifest.pointInTimeScan.notBackgroundMonitoringGuarantee === true,
  "v6.14 external-input preparation state mismatch",
);

for (const required of [
  "<!-- jp-fardarter-public-offer-v6-14 -->",
  "OPEN_FOR_VERIFIED_FIT_CHECKS",
  "DEPLOYED_AND_VERIFIED",
  "Production control           RECONCILED",
  "CONTROL_AHEAD_OF_DEPLOYED_APPLICATION_SOURCE",
  "SCOPE_DRAFTED                1",
  "HUMAN_ACCEPTED               0",
  "Orders                       0",
  "Verified gross revenue       $0 USD",
  "Verified settled cash        $0 USD",
  "Consent package              NO_PACKAGE",
  "AWAITING_COUNTERPARTY_EVIDENCE",
  "CONNECTED_PRIVATE / 17 known documents",
  "one** public-safe clarification",
  "never counted as orders or reserved capacity",
  "This offer update does not deploy anything.",
]) {
  assert(text.template.includes(required), `v6.14 public template missing ${required}`);
}

for (const stale of [
  "Fit-approved canonical base 0",
  "Public Netlify deployment   UNVERIFIED",
  "UNVERIFIED until #136/#143",
  "Direct outreach remains `NOT_AUTHORIZED`",
  "Current canonical money state remains unchanged:\n\n```text\nPilot price: $100 USD\nCapacity: 5",
]) {
  assert(!text.template.includes(stale), `stale public-offer claim remains: ${stale}`);
}

const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
for (const publicText of [text.template, text.documentation, text.manifest]) {
  assert(!emailPattern.test(publicText), "public v6.14 source must not expose an email address");
  assert(!publicText.includes("docs.google.com"), "public v6.14 source exposes a private Docs URL");
  assert(!publicText.includes("drive.google.com"), "public v6.14 source exposes a private Drive URL");
  assert(!/\b(?:fileId|folderId|documentId)\b/.test(publicText), "public v6.14 source exposes a private reference field");
}

for (const required of [
  "title: \"[Audit request]: \"",
  "id: contact_channel",
  "id: contact_permission",
  "I authorize one bounded, public-safe reply in this GitHub issue",
  "I will not post private email addresses",
]) {
  assert(text.issueForm.includes(required), `v6.14 request-form dependency missing ${required}`);
}

assert(
  manifest.decision.state === "READY_FOR_REVIEWED_PUBLIC_RECONCILIATION" &&
    manifest.decision.postMergeAction ===
      "UPDATE_ISSUE_133_EXACTLY_ONCE_AND_APPEND_COMPLETION_RECEIPT" &&
    manifest.decision.automaticCanonicalAdvanceAllowed === false,
  "v6.14 decision contract mismatch",
);
assert(
  Object.values(manifest.consequentialEffects).every((value) => value === false),
  "v6.14 preparation created a consequential effect",
);

for (const required of [
  "name: Fardarter Public Offer v6.14",
  "permissions:\n  contents: read",
  "npm run fardarter:public-offer:check",
  "FARDARTER-DRIVE-PUBLIC-OFFER-V6-14.json",
  "fardarter-drive-public-offer-v6-14.schema.json",
]) {
  assert(text.workflow.includes(required), `v6.14 workflow missing ${required}`);
}
for (const prohibited of ["issues: write", "netlify deploy", "deploy --", "send_email", "gmail", "curl ", "wget "]) {
  assert(!text.workflow.toLowerCase().includes(prohibited.toLowerCase()), `v6.14 workflow must remain read-only: ${prohibited}`);
}
assert(
  pkg.scripts["fardarter:public-offer:check"] ===
    "node scripts/check-fardarter-public-offer-v6-14.mjs" &&
    pkg.scripts["revenue:verify"].includes("npm run fardarter:public-offer:check"),
  "v6.14 verifier is not integrated into package/revenue verification",
);

console.log(
  JSON.stringify(
    {
      status: "PASS",
      control: manifest.controlId,
      manifestDigest: manifest.manifestDigest,
      publicIssue: manifest.publicOfferIssue,
      bodySha256: manifest.publicIssue.bodySha256,
      offer: manifest.offer.publicState,
      production: `${manifest.production.applicationState}/${manifest.production.controlState}`,
      relationship: manifest.production.repositoryRelationship,
      contact: `${manifest.contact.identityModel}/${manifest.contact.channelModel}`,
      canonical: `${manifest.canonical.eventHeadSequence}/${manifest.canonical.reconciliationSequence}`,
      consent: `${manifest.consent.packageState}/${manifest.consent.decision}`,
      money: `${manifest.money.orders}/$${manifest.money.verifiedGrossRevenueUsd}/$${manifest.money.verifiedSettledCashUsd}`,
      next: manifest.decision.postMergeAction,
      consequentialEffects: "ZERO",
    },
    null,
    2,
  ),
);
