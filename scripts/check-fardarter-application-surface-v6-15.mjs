import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const paths = {
  manifest: "receipts/revenue/FARDARTER-DRIVE-APPLICATION-SURFACE-V6-15.json",
  schema: "schemas/revenue/fardarter-drive-application-surface-v6-15.schema.json",
  page: "app/github-control-tower-audit/page.tsx",
  api: "app/api/revenue/pilot/route.ts",
  publicOffer: "receipts/revenue/FARDARTER-DRIVE-PUBLIC-OFFER-V6-14.json",
  unified: "receipts/revenue/FARDARTER-DRIVE-UNIFIED-CONTROL-V6-13.json",
  production: "receipts/revenue/FARDARTER-DRIVE-PRODUCTION-RECONCILIATION-V6-12.json",
  legacyDrive: "receipts/revenue/FARDARTER-DRIVE-V6.json",
  legacyGdrive: "receipts/revenue/FARDARTER-DRIVE-GDRIVE-V6.json",
  documentation: "docs/revenue/FARDARTER-DRIVE-APPLICATION-SURFACE-V6-15.md",
  workflow: ".github/workflows/fardarter-application-surface-v6-15.yml",
  productVerifier: "scripts/check-revenue-product-surface-v6.mjs",
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
const sha256Text = (value) =>
  createHash("sha256").update(value, "utf8").digest("hex");
const without = (object, key) => {
  const copy = structuredClone(object);
  delete copy[key];
  return copy;
};

const manifest = parse(text.manifest, "v6.15 manifest");
const schema = parse(text.schema, "v6.15 schema");
const publicOffer = parse(text.publicOffer, "v6.14 public offer");
const unified = parse(text.unified, "v6.13 unified control");
const production = parse(text.production, "v6.12 production reconciliation");
const legacyDrive = parse(text.legacyDrive, "legacy v6 drive");
const legacyGdrive = parse(text.legacyGdrive, "legacy v6 Drive continuity");
const pkg = parse(text.package, "package");

assert(
  manifest.controlId === "FARDARTER-DRIVE-APPLICATION-SURFACE-V6-15" &&
    manifest.controllerVersion === "6.15.0" &&
    manifest.controllingIssue === 203 &&
    manifest.implementationIssue === 204,
  "v6.15 application-surface identity mismatch",
);

assert(
  sha256Stable(without(manifest, "manifestDigest")) === manifest.manifestDigest &&
    manifest.manifestDigest ===
      "73ea8a261ade625ef740aa95007a403a55159d864b37c7191f66f50e6528a0de",
  "v6.15 manifest digest mismatch",
);

assert(
  schema.type === "object" && stable(schema.const) === stable(manifest),
  "v6.15 exact schema does not lock the manifest",
);

assert(
  manifest.repository.baseHead === "f461e7dc0724010265bbb439b4cfb857660c095f" &&
    manifest.repository.publicOfferDigest === publicOffer.manifestDigest &&
    publicOffer.manifestDigest ===
      "b16a39679d1baea0c34b11f1544f0c4fa3aa0702d0187a51b6965853fa93a836" &&
    manifest.repository.unifiedControlDigest === unified.manifestDigest &&
    unified.manifestDigest ===
      "2f33a58938a480b70ce9ea26e24c74677e6294e93729412e3fb81db006e5e29c" &&
    manifest.repository.productionReconciliationDigest === production.manifestDigest &&
    production.manifestDigest ===
      "1e8aa2af8bb3af332185b7419c63e2c1ad8c19c866e45b62fe04a2fc969932ee",
  "v6.15 predecessor linkage mismatch",
);

assert(
  sha256Text(text.page) === manifest.surface.pageSha256 &&
    manifest.surface.pageSha256 ===
      "8a0b7d95e87ac30c8e970c6cf74d4760c1c7135beb032d4d0bbc02bd22eccb3b",
  "v6.15 page source digest mismatch",
);
assert(
  sha256Text(text.api) === manifest.surface.apiSha256 &&
    manifest.surface.apiSha256 ===
      "4396640551cf5c6b1227d21f174cda8f890215904bd728884f36daa90870ba9c",
  "v6.15 API source digest mismatch",
);

assert(
  manifest.surface.apiSchemaVersion === "1.6.0" &&
    manifest.surface.projectionState ===
      "REPOSITORY_SOURCE_ONLY_PENDING_SEPARATE_PROVIDER_PROMOTION" &&
    manifest.surface.apiRetainsLegacyCompatibility === true &&
    manifest.surface.sourceUpdateCreatesDeployment === false &&
    manifest.surface.repositorySourceEqualsDeployedApplicationSource === false,
  "v6.15 source/deployment projection contract mismatch",
);

assert(
  manifest.publicOffer.issueNumber === publicOffer.publicOfferIssue &&
    manifest.publicOffer.state === publicOffer.offer.publicState &&
    manifest.publicOffer.state === "OPEN_FOR_VERIFIED_FIT_CHECKS" &&
    manifest.publicOffer.primaryAuditPriceUsd === 100 &&
    manifest.publicOffer.fitApprovalBinding === false,
  "v6.15 public-offer truth mismatch",
);

assert(
  manifest.production.applicationSource ===
      production.repository.deployedApplicationSource &&
    manifest.production.deployId === production.verifiedProduction.deployId &&
    manifest.production.applicationState ===
      production.stateClassification.productionApplication &&
    manifest.production.controlState ===
      production.stateClassification.productionControlState &&
    manifest.production.repositoryRelationship ===
      production.stateClassification.repositoryHead &&
    manifest.production.sourceGap === production.stateClassification.sourceGap &&
    manifest.production.applicationState === "DEPLOYED_AND_VERIFIED" &&
    manifest.production.controlState === "RECONCILED" &&
    manifest.production.verifiedRouteCount === 18 &&
    manifest.production.exactBodyMatchCount === 18 &&
    manifest.production.futurePromotionOwner === "FARDARTER_DRIVE_LIVE_WATCH" &&
    manifest.production.futurePromotionRequiresSeparateAuthorization === true,
  "v6.15 production/source distinction mismatch",
);

assert(
  manifest.contact.identityModel === publicOffer.contact.identityModel &&
    manifest.contact.channelModel === publicOffer.contact.channelModel &&
    manifest.contact.identityModel === "GITHUB_ISSUE_AUTHOR" &&
    manifest.contact.channelModel === "EXACT_GITHUB_ISSUE_THREAD" &&
    manifest.contact.nativeWorkflowSoleWriter === true &&
    manifest.contact.maxAutomaticFirstResponsesPerIssue === 1 &&
    manifest.contact.publicEmailRequired === false &&
    manifest.contact.deliveryOrSilenceProvesConsent === false,
  "v6.15 contact projection mismatch",
);

assert(
  manifest.drive.state === unified.drive.state &&
    manifest.drive.knownDocumentCount === unified.drive.knownDocumentCount &&
    manifest.drive.state === "CONNECTED_PRIVATE" &&
    manifest.drive.knownDocumentCount === 17 &&
    manifest.drive.ownerOnly === true &&
    manifest.drive.shared === false &&
    manifest.drive.publicPrivateReferencesExposed === false,
  "v6.15 private continuity mismatch",
);

assert(
  manifest.canonical.eventHeadSequence === unified.canonical.eventHeadSequence &&
    manifest.canonical.eventHeadDigest === unified.canonical.eventHeadDigest &&
    manifest.canonical.reconciliationSequence ===
      unified.canonical.reconciliationSequence &&
    manifest.canonical.reconciliationDigest ===
      unified.canonical.reconciliationDigest &&
    manifest.canonical.scopeDrafted === 1 &&
    manifest.canonical.humanAccepted === 0 &&
    manifest.canonical.active === 0 &&
    manifest.canonical.event2Present === false,
  "v6.15 canonical truth mismatch",
);

assert(
  manifest.consent.packageState === unified.consent.packageState &&
    manifest.consent.decision === unified.consent.decision &&
    manifest.consent.packageState === "NO_PACKAGE" &&
    manifest.consent.decision === "AWAITING_COUNTERPARTY_EVIDENCE" &&
    manifest.consent.independentVerificationPerformed === false &&
    manifest.consent.eligibleForCanonicalApplication === false &&
    manifest.consent.publicOfferOrContactProvesConsent === false,
  "v6.15 consent boundary mismatch",
);

assert(
  manifest.capacity.totalPlanningSlots === 1000 &&
    manifest.capacity.effectiveActiveCeiling === 100 &&
    manifest.capacity.activeDeliveries === 0 &&
    manifest.capacity.activeHeadroom === 100 &&
    manifest.capacity.overrideState === "INACTIVE_NO_RECEIPT" &&
    manifest.capacity.automaticOverrideActivationAllowed === false &&
    manifest.money.orders === 0 &&
    manifest.money.verifiedGrossRevenueUsd === 0 &&
    manifest.money.verifiedSettledCashUsd === 0 &&
    manifest.money.receivedCashRequires === "PAID_SETTLED",
  "v6.15 capacity or money truth mismatch",
);

for (const required of [
  "FARDARTER-DRIVE-PUBLIC-OFFER-V6-14.json",
  "FARDARTER-DRIVE-UNIFIED-CONTROL-V6-13.json",
  "FARDARTER-DRIVE-PRODUCTION-RECONCILIATION-V6-12.json",
  "source projection v",
  "One offer. Separate source, production, consent, and money truth.",
  "Repository application source",
  "Verified production",
  "Canonical and consent",
  "GitHub contact",
  "Google Drive continuity",
  "SOURCE_ONLY",
  "This repository source is not itself proof of a new deployment.",
  "SCOPE_DRAFTED=1",
  "HUMAN_ACCEPTED=0",
  "AWAITING_COUNTERPARTY_EVIDENCE",
  "CONNECTED_PRIVATE",
  "Request a public-safe fit check",
  "$100,000",
  "$1 quadrillion",
  "not indemnity-proof",
]) {
  assert(text.page.includes(required), `v6.15 page missing ${required}`);
}

for (const required of [
  'schemaVersion: "1.6.0"',
  'controlId: "FARDARTER-DRIVE-APPLICATION-SURFACE-V6-15"',
  'version: "6.15.0"',
  'state: "REPOSITORY_SOURCE_ONLY_PENDING_SEPARATE_PROVIDER_PROMOTION"',
  "sourceEqualsDeployedApplicationSource: false",
  "sourceUpdateCreatesDeployment: false",
  "repositorySourceIsCurrentlyDeployed: false",
  "futurePromotionRequiresSeparateProviderEvidence: true",
  "publicOfferOrContactProvesConsent: false",
  "repositorySourceEqualsDeployedApplicationSource: false",
  "applicationSurfaceUpdateCreatesDeployment: false",
  "legacyCompatibility",
  "knownDocumentCount",
  "PAID_SETTLED",
]) {
  assert(text.api.includes(required), `v6.15 API missing ${required}`);
}
assert(!text.api.includes('schemaVersion: "1.5.0"'), "stale API schema 1.5.0 remains");

for (const stale of [
  'title: "GitHub Control Tower Audit + Fardarter Drive™ v6 | JP Systems"',
  "Public Netlify deployment   UNVERIFIED",
  "Fit-approved canonical base 0",
  "repositorySourceIsCurrentlyDeployed: true",
  "sourceEqualsDeployedApplicationSource: true",
  "applicationSurfaceUpdateCreatesDeployment: true",
]) {
  assert(
    !`${text.page}\n${text.api}`.includes(stale),
    `stale or unsafe surface claim remains: ${stale}`,
  );
}

const publicCombined = `${text.page}\n${text.api}\n${text.documentation}\n${text.manifest}`;
const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
assert(!emailPattern.test(publicCombined), "v6.15 public source exposes an email address");
for (const privateRef of [
  "docs.google.com",
  "drive.google.com",
  '"fileId"',
  '"folderId"',
  '"documentId"',
]) {
  assert(!publicCombined.includes(privateRef), `v6.15 public source exposes ${privateRef}`);
}

assert(
  legacyDrive.capacityModel.totalPlanningCapacity === 1000 &&
    legacyDrive.capacityModel.standardActiveCeiling === 100 &&
    legacyDrive.capacityModel.aboveStandardAllowed === true &&
    legacyGdrive.state === "CONNECTED_PRIVATE" &&
    legacyGdrive.publicFolderUrlExposed === false &&
    legacyGdrive.publicFileIdsExposed === false,
  "v6.15 legacy compatibility boundary mismatch",
);

assert(
  manifest.pointInTimeScan.openExternalAuditRequests === 0 &&
    manifest.pointInTimeScan.relevantInboundCounterpartyMessages === 0 &&
    manifest.pointInTimeScan.newConsentPackages === 0 &&
    manifest.pointInTimeScan.contactConflicts === 0 &&
    manifest.pointInTimeScan.notBackgroundMonitoringGuarantee === true,
  "v6.15 point-in-time scan mismatch",
);

assert(
  manifest.decision.state === "READY_FOR_REVIEWED_SOURCE_RECONCILIATION" &&
    manifest.decision.postMergeState === "SOURCE_MERGED_NOT_DEPLOYED" &&
    manifest.decision.automaticDeploymentAllowed === false &&
    manifest.decision.automaticCanonicalAdvanceAllowed === false &&
    Object.values(manifest.consequentialEffects).every((value) => value === false),
  "v6.15 decision or zero-effect boundary mismatch",
);

for (const required of [
  "name: Fardarter Application Surface v6.15",
  "permissions:\n  contents: read",
  "npm run fardarter:application-surface:check",
  "FARDARTER-DRIVE-APPLICATION-SURFACE-V6-15.json",
  "fardarter-drive-application-surface-v6-15.schema.json",
]) {
  assert(text.workflow.includes(required), `v6.15 workflow missing ${required}`);
}
for (const prohibited of [
  "issues: write",
  "netlify deploy",
  "deploy --",
  "send_email",
  "gmail",
  "curl ",
  "wget ",
]) {
  assert(
    !text.workflow.toLowerCase().includes(prohibited.toLowerCase()),
    `v6.15 workflow must remain read-only: ${prohibited}`,
  );
}

assert(
  text.productVerifier.includes('schemaVersion: "1.6.0"') &&
    text.productVerifier.includes("FARDARTER-DRIVE-PUBLIC-OFFER-V6-14.json") &&
    text.productVerifier.includes("FARDARTER-DRIVE-UNIFIED-CONTROL-V6-13.json") &&
    text.productVerifier.includes(
      "FARDARTER-DRIVE-PRODUCTION-RECONCILIATION-V6-12.json",
    ) &&
    text.productVerifier.includes("REPOSITORY_SOURCE_ONLY_PENDING_SEPARATE_PROVIDER_PROMOTION"),
  "legacy product verifier is not reconciled to the v6.15 projection",
);

assert(
  pkg.scripts["fardarter:application-surface:check"] ===
      "node scripts/check-fardarter-application-surface-v6-15.mjs" &&
    pkg.scripts["revenue:verify"].includes(
      "npm run fardarter:application-surface:check",
    ),
  "v6.15 verifier is not integrated into package/revenue verification",
);

console.log(
  JSON.stringify(
    {
      status: "PASS",
      control: manifest.controlId,
      manifestDigest: manifest.manifestDigest,
      pageSha256: manifest.surface.pageSha256,
      apiSha256: manifest.surface.apiSha256,
      apiSchemaVersion: manifest.surface.apiSchemaVersion,
      publicOffer: `${manifest.publicOffer.issueNumber}/${manifest.publicOffer.state}`,
      production: `${manifest.production.applicationState}/${manifest.production.controlState}`,
      relationship: manifest.production.repositoryRelationship,
      sourceProjection: manifest.surface.projectionState,
      canonical: `${manifest.canonical.eventHeadSequence}/${manifest.canonical.reconciliationSequence}`,
      consent: `${manifest.consent.packageState}/${manifest.consent.decision}`,
      privateContinuity: `${manifest.drive.state}/${manifest.drive.knownDocumentCount}`,
      money: `${manifest.money.orders}/$${manifest.money.verifiedGrossRevenueUsd}/$${manifest.money.verifiedSettledCashUsd}`,
      next: manifest.decision.nextControlledAction,
      consequentialEffects: "ZERO",
    },
    null,
    2,
  ),
);
