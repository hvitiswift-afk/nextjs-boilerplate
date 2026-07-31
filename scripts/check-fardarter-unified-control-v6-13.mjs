import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const paths = {
  control: "receipts/revenue/FARDARTER-DRIVE-UNIFIED-CONTROL-V6-13.json",
  controlSchema: "schemas/revenue/fardarter-drive-unified-control-v6-13.schema.json",
  drive: "receipts/revenue/FARDARTER-DRIVE-GDRIVE-V6-13.json",
  driveSchema: "schemas/revenue/fardarter-drive-gdrive-v6-13.schema.json",
  historicalDrive: "receipts/revenue/FARDARTER-DRIVE-GDRIVE-V6.json",
  production: "receipts/revenue/FARDARTER-DRIVE-PRODUCTION-RECONCILIATION-V6-12.json",
  contact: "receipts/revenue/FARDARTER-DRIVE-GITHUB-FIRST-RESPONSE-V6-9.json",
  consent: "receipts/revenue/FARDARTER-DRIVE-CONSENT-EVIDENCE-V6-7.json",
  chain: "receipts/revenue/FARDARTER-DRIVE-STATE-EVENTS-V6-2.json",
  reconciliation: "receipts/revenue/FARDARTER-DRIVE-RECONCILIATION-V6-5.json",
  doc: "docs/revenue/FARDARTER-DRIVE-UNIFIED-CONTROL-V6-13.md",
  workflow: ".github/workflows/fardarter-unified-control-v6-13.yml",
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

const control = parse(text.control, "unified control");
const controlSchema = parse(text.controlSchema, "unified control schema");
const drive = parse(text.drive, "Drive continuity");
const driveSchema = parse(text.driveSchema, "Drive continuity schema");
const historicalDrive = parse(text.historicalDrive, "historical Drive continuity");
const production = parse(text.production, "production reconciliation");
const contact = parse(text.contact, "GitHub first response");
const consent = parse(text.consent, "consent evidence");
const chain = parse(text.chain, "canonical event chain");
const reconciliation = parse(text.reconciliation, "canonical reconciliation");
const pkg = parse(text.package, "package");

assert(
  control.controlId === "FARDARTER-DRIVE-UNIFIED-CONTROL-V6-13" &&
    control.controllerVersion === "6.13.0" &&
    control.controllingIssue === 197 &&
    control.implementationIssue === 198,
  "v6.13 control identity mismatch",
);
assert(
  digestWithout(control, "manifestDigest") === control.manifestDigest &&
    control.manifestDigest === "2f33a58938a480b70ce9ea26e24c74677e6294e93729412e3fb81db006e5e29c",
  "v6.13 unified manifest digest mismatch",
);
assert(stable(controlSchema.const) === stable(control), "v6.13 unified schema lock mismatch");

assert(
  drive.schemaVersion === "1.1.0" &&
    drive.controllerVersion === "6.13.0" &&
    drive.controllingIssue === 197 &&
    drive.state === "CONNECTED_PRIVATE",
  "v6.13 Drive identity mismatch",
);
assert(
  digestWithout(drive, "receiptDigest") === drive.receiptDigest &&
    drive.receiptDigest === "8680243c828c6503d2aadd76b361cfea41482ec17f8fa29018947abcef3f3ea4",
  "v6.13 Drive receipt digest mismatch",
);
assert(stable(driveSchema.const) === stable(drive), "v6.13 Drive schema lock mismatch");
assert(
  drive.previousReceipt.path === paths.historicalDrive &&
    drive.previousReceipt.historicalDocumentCount === 15 &&
    historicalDrive.documents.length === 15 &&
    drive.previousReceipt.preservedImmutable === true,
  "historical Drive continuity mismatch",
);
const expectedTitles = [
  "Fardarter Drive™ v6.13 — Unified Control Plane Charter",
  "Fardarter Drive™ v6.13 — Public-Private Reconciliation Register",
];
assert(
  drive.newDocuments.map((document) => document.title).join("|") === expectedTitles.join("|") &&
    drive.newDocuments.every(
      (document) =>
        document.nativeGoogleDoc === true &&
        document.referenceStoredPrivately === true &&
        document.publicUrlExposed === false &&
        document.ownerOnlyVerified === true &&
        document.shared === false,
    ),
  "v6.13 private document contract mismatch",
);
assert(
  drive.continuity.newDocumentCount === 2 &&
    drive.continuity.totalKnownDocumentCount === 17 &&
    drive.continuity.repositoryAdvancedThrough === "6.12.0" &&
    drive.continuity.privateContinuityAdvancedThrough === "6.13.0" &&
    drive.continuity.crossLayerDriftReconciled === true,
  "v6.13 Drive continuity arithmetic mismatch",
);

assert(
  production.controlId === "FARDARTER-DRIVE-PRODUCTION-RECONCILIATION-V6-12" &&
    production.controllerVersion === "6.12.0" &&
    production.manifestDigest === control.repository.productionReconciliationDigest,
  "v6.12 production linkage mismatch",
);
assert(
  control.repository.baseHead === "a18f1ba0537a104e708927c178eac815a4d09e04" &&
    control.repository.productionControlVersion === "6.12.0" &&
    control.repository.productionReconciliationPath === paths.production &&
    control.repository.unifiedControlState === "RECONCILED_PENDING_MERGE",
  "v6.13 repository control mismatch",
);
assert(
  control.production.deployedApplicationSource === production.repository.deployedApplicationSource &&
    control.production.deploymentControlMerge === production.repository.deploymentControlMerge &&
    control.production.deployId === production.verifiedProduction.deployId &&
    control.production.verificationState === "DEPLOYED_AND_VERIFIED" &&
    control.production.productionControlState === "RECONCILED" &&
    control.production.requiredRouteCount === 18 &&
    control.production.verifiedRouteCount === 18 &&
    control.production.exactBodyMatchCount === 18 &&
    control.production.ownedByUnifiedController === false &&
    control.production.ownedBySeparateLiveWatch === true,
  "v6.13 production authority separation mismatch",
);

assert(
  contact.controlId === "FARDARTER-DRIVE-GITHUB-FIRST-RESPONSE-V6-9" &&
    contact.manifestDigest === control.contact.firstResponseManifestDigest &&
    control.contact.contactGateMerge === "4cb63ed2e480e3719c1015e28db007b09aad7f30" &&
    control.contact.firstResponseMerge === "760d198316c392a7de3af36faffa93df42ecca64" &&
    control.contact.identityModel === "GITHUB_ISSUE_AUTHOR" &&
    control.contact.channelModel === "EXACT_GITHUB_ISSUE_THREAD" &&
    control.contact.nativeWorkflowSoleWriter === true &&
    control.contact.maxAutomaticFirstResponsesPerIssue === 1 &&
    control.contact.emailRequired === false &&
    control.contact.deliveryOrSilenceProvesConsent === false,
  "v6.13 contact control mismatch",
);
assert(
  control.gmail.authenticatedSender === "justin.rackham@gmail.com" &&
    control.gmail.automaticRoutineNonbindingSendReplyAllowed === true &&
    control.gmail.verifiedRecipientRequired === true &&
    control.gmail.verifiedThreadRequired === true &&
    control.gmail.caseAndScopeRequired === true &&
    control.gmail.minimumNecessaryPrivacyRequired === true &&
    control.gmail.duplicatePreventionRequired === true &&
    control.gmail.githubChannelPreferenceMustBeHonored === true &&
    [
      control.gmail.contractAcceptanceAllowed,
      control.gmail.consentCertificationAllowed,
      control.gmail.paymentOrSettlementConfirmationAllowed,
      control.gmail.workStartAllowed,
      control.gmail.capacityActivationAllowed,
      control.gmail.legalPositionAllowed,
    ].every((value) => value === false),
  "v6.13 Gmail authority mismatch",
);
assert(
  control.drive.state === "CONNECTED_PRIVATE" &&
    control.drive.receiptPath === paths.drive &&
    control.drive.receiptDigest === drive.receiptDigest &&
    control.drive.historicalReceiptPreserved === paths.historicalDrive &&
    control.drive.knownDocumentCount === 17 &&
    control.drive.newPrivateDocumentTitles.join("|") === expectedTitles.join("|") &&
    control.drive.ownerOnlyVerified === true &&
    control.drive.shared === false &&
    control.drive.publicReferencesExposed === false,
  "v6.13 unified Drive linkage mismatch",
);

assert(
  chain.headSequence === 1 &&
    chain.headDigest === "3859eac9c63bef83624111704d38cf217b0c1a4ece6df874e72a76e9fb1ffc3b" &&
    reconciliation.sequence === 1 &&
    reconciliation.snapshotDigest ===
      "9f4f878cc0f8f2ddfa7bbdb594d2b9164064acd8901301404aed57b4065eca0f",
  "canonical head mismatch",
);
assert(
  control.canonical.eventHeadSequence === chain.headSequence &&
    control.canonical.eventHeadDigest === chain.headDigest &&
    control.canonical.reconciliationSequence === reconciliation.sequence &&
    control.canonical.reconciliationDigest === reconciliation.snapshotDigest &&
    control.canonical.scopeDrafted === 1 &&
    control.canonical.humanAccepted === 0 &&
    control.canonical.active === 0 &&
    control.canonical.event2Present === false,
  "v6.13 canonical boundary mismatch",
);
assert(
  consent.manifestDigest === control.consent.manifestDigest &&
    control.consent.packageState === "NO_PACKAGE" &&
    control.consent.decision === "AWAITING_COUNTERPARTY_EVIDENCE" &&
    control.consent.independentVerificationPerformed === false &&
    control.consent.eligibleForCanonicalApplication === false,
  "v6.13 consent boundary mismatch",
);
assert(
  control.capacity.totalPlanningSlots === 1000 &&
    control.capacity.effectiveActiveCeiling === 100 &&
    control.capacity.activeDeliveries === 0 &&
    control.capacity.activeHeadroom === 100 &&
    control.capacity.overrideState === "INACTIVE_NO_RECEIPT" &&
    control.capacity.automaticOverrideActivationAllowed === false,
  "v6.13 capacity mismatch",
);
assert(
  control.money.orders === 0 &&
    control.money.verifiedGrossRevenueUsd === 0 &&
    control.money.verifiedSettledCashUsd === 0 &&
    control.money.receivedCashRequires === "PAID_SETTLED",
  "v6.13 money mismatch",
);

assert(
  control.pointInTimeScan.openExternalAuditRequests === 0 &&
    control.pointInTimeScan.relevantInboundGmailMessages === 0 &&
    control.pointInTimeScan.newPrivateConsentPackages === 0 &&
    control.pointInTimeScan.newPrivateWorkPackagesRequired === 0 &&
    control.pointInTimeScan.contactConflicts === 0 &&
    control.pointInTimeScan.notBackgroundMonitoringGuarantee === true,
  "v6.13 point-in-time scan receipt mismatch",
);
assert(
  control.authoritySeparation.deploymentVerificationOwner === "FARDARTER_DRIVE_LIVE_WATCH" &&
    control.authoritySeparation.githubFirstResponseOwner === "NATIVE_V6_9_WORKFLOW" &&
    control.authoritySeparation.gmailRoutineCommunicationOwner === "CONNECTED_GMAIL_CONTROLLER" &&
    control.authoritySeparation.privateContinuityOwner === "OWNER_ONLY_GOOGLE_DRIVE",
  "v6.13 authority separation mismatch",
);
assert(
  control.decision.state === "HOLD_FOR_GENUINE_EXTERNAL_INPUT" &&
    control.decision.nextAcceptableInputs.join("|") ===
      "EXTERNAL_AUDIT_REQUEST|VERIFIED_COUNTERPARTY_EMAIL|PRIVATE_COUNTERPARTY_CONSENT_EVIDENCE" &&
    control.decision.automaticCanonicalAdvanceAllowed === false,
  "v6.13 decision mismatch",
);
assert(
  Object.values(control.administrativeEffects).every((value) => value === true),
  "v6.13 administrative receipt incomplete",
);
assert(
  Object.values(control.consequentialEffects).every((value) => value === false),
  "v6.13 created a consequential effect",
);
const allowedDriveTrueEffects = new Set(["privateCharterCreated", "privateRegisterCreated"]);
for (const [key, value] of Object.entries(drive.actualEffects)) {
  assert(
    allowedDriveTrueEffects.has(key) ? value === true : value === false,
    `unexpected v6.13 Drive effect ${key}=${value}`,
  );
}

for (const [key, value] of Object.entries(drive.privacyBoundary)) {
  assert(value === false, `private Drive privacy boundary changed: ${key}`);
}
assert(
  drive.automation.nativeGitHubFirstResponseSoleWriter === true &&
    drive.automation.maintainRoutineGmailRail === true &&
    drive.automation.sendEmailToUnverifiedRecipient === false &&
    drive.automation.duplicateNativeGitHubFirstResponse === false &&
    drive.automation.applyCanonicalEventWithoutReviewedMerge === false &&
    drive.automation.verifyConsentWithoutIndependentReview === false &&
    drive.automation.applyHumanAcceptedWithoutVerifiedConsent === false,
  "v6.13 private automation boundary mismatch",
);

for (const required of [
  "Fardarter Drive™ v6.13",
  "a18f1ba0537a104e708927c178eac815a4d09e04",
  "DEPLOYED_AND_VERIFIED",
  "GITHUB_ISSUE_AUTHOR",
  "justin.rackham@gmail.com",
  "CONNECTED_PRIVATE",
  "HOLD_FOR_GENUINE_EXTERNAL_INPUT",
  "No private Google Drive URL or file ID",
]) {
  assert(text.doc.includes(required), `v6.13 documentation missing ${required}`);
}
assert(
  text.workflow.includes("permissions:\n  contents: read") &&
    !text.workflow.includes("issues: write") &&
    !text.workflow.includes("deploy") &&
    !text.workflow.includes("netlify") &&
    !text.workflow.includes("send_email"),
  "v6.13 CI must be read-only and non-deploying",
);
assert(
  pkg.scripts["fardarter:unified-control:check"] ===
    "node scripts/check-fardarter-unified-control-v6-13.mjs" &&
    pkg.scripts["revenue:verify"].includes("npm run fardarter:unified-control:check"),
  "v6.13 package integration missing",
);

const publicSource = [text.control, text.controlSchema, text.drive, text.driveSchema, text.doc, text.workflow].join("\n");
for (const prohibited of [
  "docs.google.com/document/d/",
  "drive.google.com/drive/folders/",
  "1pe7VnDtmxJOCADSrf6BFTjPDTI0HQmWgnPWbJSnAjkY",
  "1RPaikmsQLjnHXFVACMDVVlhJzIRE_PdYscDLfGEvvNY",
  "1GHaGAn7JpEgN6KT1T-1HsdWchtV5IAk3",
]) {
  assert(!publicSource.includes(prohibited), `private Drive reference exposed: ${prohibited}`);
}

console.log(
  JSON.stringify(
    {
      status: "PASS",
      control: control.controlId,
      manifestDigest: control.manifestDigest,
      driveReceiptDigest: drive.receiptDigest,
      repositoryBaseHead: control.repository.baseHead,
      production: `${control.production.verificationState}/${control.production.productionControlState}`,
      contact: `${control.contact.identityModel}/${control.contact.channelModel}`,
      drive: `${control.drive.state}/${control.drive.knownDocumentCount}`,
      canonical: `${control.canonical.eventHeadSequence}/${control.canonical.reconciliationSequence}`,
      consent: `${control.consent.packageState}/${control.consent.decision}`,
      decision: control.decision.state,
      consequentialEffects: "ZERO",
    },
    null,
    2,
  ),
);
