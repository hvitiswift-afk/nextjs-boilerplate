import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const paths = {
  manifest: "receipts/revenue/FARDARTER-DRIVE-AGGREGATE-RECEIPT-V6-16.json",
  schema: "schemas/revenue/fardarter-drive-aggregate-receipt-v6-16.schema.json",
  production: "receipts/revenue/FARDARTER-DRIVE-PRODUCTION-RECONCILIATION-V6-12.json",
  unified: "receipts/revenue/FARDARTER-DRIVE-UNIFIED-CONTROL-V6-13.json",
  privateContinuity: "receipts/revenue/FARDARTER-DRIVE-GDRIVE-V6-13.json",
  publicOffer: "receipts/revenue/FARDARTER-DRIVE-PUBLIC-OFFER-V6-14.json",
  publicOfferTemplate: "templates/fardarter-drive-public-offer-v6-14.md",
  applicationSurface: "receipts/revenue/FARDARTER-DRIVE-APPLICATION-SURFACE-V6-15.json",
  revenueWorkflow: ".github/workflows/revenue-experiment.yml",
  dedicatedWorkflow: ".github/workflows/fardarter-aggregate-receipt-v6-16.yml",
  documentation: "docs/revenue/FARDARTER-DRIVE-AGGREGATE-RECEIPT-V6-16.md",
  package: "package.json",
  historicalVerifier: "scripts/check-fardarter-revenue-receipt-v6-13.mjs",
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

const manifest = parse(text.manifest, "v6.16 aggregate manifest");
const schema = parse(text.schema, "v6.16 aggregate schema");
const production = parse(text.production, "v6.12 production");
const unified = parse(text.unified, "v6.13 unified control");
const privateContinuity = parse(text.privateContinuity, "v6.13 private continuity");
const publicOffer = parse(text.publicOffer, "v6.14 public offer");
const applicationSurface = parse(text.applicationSurface, "v6.15 application surface");
const pkg = parse(text.package, "package");

assert(
  manifest.controlId === "FARDARTER-DRIVE-AGGREGATE-RECEIPT-V6-16" &&
    manifest.controllerVersion === "6.16.0" &&
    manifest.controllingIssue === 206 &&
    manifest.implementationIssue === 207,
  "v6.16 aggregate identity mismatch",
);
assert(
  sha256Stable(without(manifest, "manifestDigest")) === manifest.manifestDigest &&
    manifest.manifestDigest === "f70fa832c62264fcdf8f24d9067246e5ecdeb0ae5dc5bf211ee3041d7bf13a7e",
  "v6.16 aggregate digest mismatch",
);
assert(
  schema.type === "object" && stable(schema.const) === stable(manifest),
  "v6.16 exact schema does not lock the manifest",
);

assert(
  manifest.repository.repositoryFullName === "hvitiswift-afk/nextjs-boilerplate" &&
    manifest.repository.baseHeadAtPreparation ===
      "7635c698d7d5fbee3d648a66556df7dbceffd3e0" &&
    manifest.repository.aggregateReceiptBefore ===
      "FARDARTER-DRIVE-REVENUE-RECEIPT-V6-13" &&
    manifest.repository.aggregateReceiptAfter ===
      "FARDARTER-DRIVE-AGGREGATE-RECEIPT-V6-16" &&
    manifest.repository.aggregateDriftVerified === true &&
    manifest.repository.historyRewriteAllowed === false &&
    manifest.repository.applicationSourceState === "SOURCE_MERGED_NOT_DEPLOYED",
  "v6.16 repository or aggregate-drift contract mismatch",
);

assert(
  production.manifestDigest === manifest.predecessors.production.digest &&
    production.manifestDigest ===
      "1e8aa2af8bb3af332185b7419c63e2c1ad8c19c866e45b62fe04a2fc969932ee" &&
    unified.manifestDigest === manifest.predecessors.unifiedControl.digest &&
    unified.manifestDigest ===
      "2f33a58938a480b70ce9ea26e24c74677e6294e93729412e3fb81db006e5e29c" &&
    privateContinuity.receiptDigest === manifest.predecessors.privateContinuity.digest &&
    privateContinuity.receiptDigest ===
      "8680243c828c6503d2aadd76b361cfea41482ec17f8fa29018947abcef3f3ea4" &&
    publicOffer.manifestDigest === manifest.predecessors.publicOffer.digest &&
    publicOffer.manifestDigest ===
      "b16a39679d1baea0c34b11f1544f0c4fa3aa0702d0187a51b6965853fa93a836" &&
    applicationSurface.manifestDigest === manifest.predecessors.applicationSurface.digest &&
    applicationSurface.manifestDigest ===
      "73ea8a261ade625ef740aa95007a403a55159d864b37c7191f66f50e6528a0de",
  "v6.16 predecessor linkage mismatch",
);
assert(
  sha256Text(text.publicOfferTemplate) ===
      manifest.predecessors.publicOffer.issue133BodySha256 &&
    manifest.predecessors.publicOffer.issue133BodySha256 ===
      "369338fda0fe9e2236eecd68a1321635e025e85365eb701e10ee1d8bb3c405e0",
  "v6.16 Issue #133 body-template digest mismatch",
);
assert(
  applicationSurface.surface.pageSha256 ===
      manifest.predecessors.applicationSurface.pageSha256 &&
    applicationSurface.surface.apiSha256 ===
      manifest.predecessors.applicationSurface.apiSha256 &&
    applicationSurface.surface.apiSchemaVersion ===
      manifest.predecessors.applicationSurface.apiSchemaVersion &&
    applicationSurface.repository.applicationSurfaceState ===
      "PREPARED_SOURCE_ONLY_PENDING_REVIEWED_MERGE" &&
    applicationSurface.decision.postMergeState === "SOURCE_MERGED_NOT_DEPLOYED",
  "v6.16 application-surface linkage mismatch",
);

assert(
  manifest.issue133.issueNumber === 133 &&
    manifest.issue133.integrityState === "EXACT_CURRENT_OFFER_INTACT" &&
    manifest.issue133.title === publicOffer.publicIssue.targetTitle &&
    manifest.issue133.bodyMarker === publicOffer.publicIssue.bodyMarker &&
    manifest.issue133.activationMarker ===
      "<!-- jp-fardarter-public-offer-v6-14-complete -->" &&
    manifest.issue133.publicState === publicOffer.offer.publicState &&
    manifest.issue133.publicState === "OPEN_FOR_VERIFIED_FIT_CHECKS" &&
    manifest.issue133.automaticRewriteAllowed === false &&
    manifest.issue133.historicalCommentsAppendOnly === true,
  "v6.16 Issue #133 integrity contract mismatch",
);

assert(
  manifest.production.applicationSource ===
      production.repository.deployedApplicationSource &&
    manifest.production.deployId === production.verifiedProduction.deployId &&
    manifest.production.applicationState === "DEPLOYED_AND_VERIFIED" &&
    manifest.production.controlState === "RECONCILED" &&
    manifest.production.verifiedRouteCount === 18 &&
    manifest.production.exactBodyMatchCount === 18 &&
    manifest.production.repositoryRelationship ===
      "CONTROL_AHEAD_OF_DEPLOYED_APPLICATION_SOURCE" &&
    manifest.production.sourceGap === "EXPECTED_CONTROL_ONLY_GAP" &&
    manifest.production.providerMutationOwnedHere === false &&
    manifest.production.futurePromotionOwner === "FARDARTER_DRIVE_LIVE_WATCH",
  "v6.16 production/source separation mismatch",
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
    manifest.canonical.event2Present === false &&
    manifest.canonical.candidateEvent === null &&
    manifest.canonical.candidateReconciliation === null,
  "v6.16 canonical head mismatch",
);
assert(
  manifest.consent.packageState === "NO_PACKAGE" &&
    manifest.consent.decision === "AWAITING_COUNTERPARTY_EVIDENCE" &&
    manifest.consent.independentVerificationPerformed === false &&
    manifest.consent.eligibleForCanonicalApplication === false &&
    manifest.capacity.totalPlanningSlots === 1000 &&
    manifest.capacity.effectiveActiveCeiling === 100 &&
    manifest.capacity.activeDeliveries === 0 &&
    manifest.capacity.activeHeadroom === 100 &&
    manifest.capacity.overrideState === "INACTIVE_NO_RECEIPT" &&
    manifest.capacity.automaticActivationAllowed === false &&
    manifest.money.orders === 0 &&
    manifest.money.verifiedGrossRevenueUsd === 0 &&
    manifest.money.verifiedSettledCashUsd === 0 &&
    manifest.money.receivedCashRequires === "PAID_SETTLED",
  "v6.16 consent/capacity/money truth mismatch",
);
assert(
  manifest.contact.identityModel === "GITHUB_ISSUE_AUTHOR" &&
    manifest.contact.channelModel === "EXACT_GITHUB_ISSUE_THREAD" &&
    manifest.contact.nativeWorkflowSoleAutomaticWriter === true &&
    manifest.contact.maxAutomaticFirstResponsesPerIssue === 1 &&
    manifest.contact.newExternalAuditRequests === 0 &&
    manifest.contact.newRelevantInboundCounterpartyMessages === 0 &&
    manifest.contact.contactConflicts === 0,
  "v6.16 contact truth mismatch",
);
assert(
  manifest.privateContinuity.state === "CONNECTED_PRIVATE" &&
    manifest.privateContinuity.knownDocumentCount === 17 &&
    manifest.privateContinuity.ownerOnly === true &&
    manifest.privateContinuity.shared === false &&
    manifest.privateContinuity.publicPrivateReferencesExposed === false &&
    manifest.privateContinuity.v614ReceiptPresent === true &&
    manifest.privateContinuity.v615ReceiptPresent === true,
  "v6.16 private continuity mismatch",
);
assert(
  Object.values(manifest.actualEffects).every((value) => value === 0) &&
    Object.values(manifest.projectedEffects).every((value) => value === 0) &&
    Object.values(manifest.consequentialEffects).every((value) => value === false),
  "v6.16 created or projected a consequential effect",
);
assert(
  manifest.decision.state ===
      "READY_FOR_REVIEWED_AGGREGATE_RECEIPT_RECONCILIATION" &&
    manifest.decision.postMergeState === "RECONCILED_AGGREGATE_HEAD" &&
    manifest.decision.nextControlledAction ===
      "HOLD_FOR_GENUINE_EXTERNAL_INPUT_OR_SEPARATELY_AUTHORIZED_EXACT_PRODUCTION_PROMOTION" &&
    manifest.decision.automaticIssue133RewriteAllowed === false &&
    manifest.decision.automaticDeploymentAllowed === false &&
    manifest.decision.automaticCanonicalAdvanceAllowed === false,
  "v6.16 decision mismatch",
);

for (const required of [
  "name: Verify Fardarter Drive v6.16 aggregate control",
  "npm run revenue:verify",
  "FARDARTER-DRIVE-AGGREGATE-RECEIPT-V6-16.json",
  "FARDARTER-DRIVE-PUBLIC-OFFER-V6-14.json",
  "FARDARTER-DRIVE-APPLICATION-SURFACE-V6-15.json",
  "fardarter-drive-aggregate-receipt-v6-16.schema.json",
  "fardarter-drive-public-offer-v6-14.schema.json",
  "fardarter-drive-application-surface-v6-15.schema.json",
  "controller_version=6.16.0",
  "issue_133_integrity=EXACT_CURRENT_OFFER_INTACT",
  "application_source_state=SOURCE_MERGED_NOT_DEPLOYED",
  "aggregate_manifest_digest=f70fa832c62264fcdf8f24d9067246e5ecdeb0ae5dc5bf211ee3041d7bf13a7e",
  "public_offer_manifest_digest=b16a39679d1baea0c34b11f1544f0c4fa3aa0702d0187a51b6965853fa93a836",
  "application_surface_manifest_digest=73ea8a261ade625ef740aa95007a403a55159d864b37c7191f66f50e6528a0de",
  "control_decision=HOLD_FOR_GENUINE_EXTERNAL_INPUT_OR_SEPARATELY_AUTHORIZED_EXACT_PRODUCTION_PROMOTION",
  "permissions:\n  contents: read",
]) {
  assert(text.revenueWorkflow.includes(required), `v6.16 revenue workflow missing ${required}`);
}
for (const stale of [
  "name: Verify Fardarter Drive v6.13 unified control",
  "controller_version=6.13.0",
  "control_decision=HOLD_FOR_GENUINE_EXTERNAL_INPUT\n",
]) {
  assert(!text.revenueWorkflow.includes(stale), `stale aggregate receipt remains: ${stale}`);
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
    !text.revenueWorkflow.toLowerCase().includes(prohibited.toLowerCase()),
    `v6.16 aggregate workflow must remain read-only: ${prohibited}`,
  );
}

for (const required of [
  "name: Fardarter Aggregate Receipt v6.16",
  "permissions:\n  contents: read",
  "npm run fardarter:revenue-receipt:check",
]) {
  assert(text.dedicatedWorkflow.includes(required), `v6.16 dedicated workflow missing ${required}`);
}
for (const prohibited of ["issues: write", "netlify deploy", "deploy --", "send_email", "gmail", "curl ", "wget "]) {
  assert(
    !text.dedicatedWorkflow.toLowerCase().includes(prohibited.toLowerCase()),
    `v6.16 dedicated workflow must remain read-only: ${prohibited}`,
  );
}

assert(
  pkg.scripts["fardarter:revenue-receipt:check"] ===
      "node scripts/check-fardarter-revenue-receipt-v6-16.mjs" &&
    pkg.scripts["revenue:verify"].includes("npm run fardarter:revenue-receipt:check") &&
    !pkg.scripts["fardarter:revenue-receipt:check"].includes("v6-13"),
  "v6.16 package integration mismatch",
);
assert(
  text.historicalVerifier.includes("FARDARTER-DRIVE-REVENUE-RECEIPT-V6-13") &&
    text.historicalVerifier.includes("controllerVersion: \"6.13.0\""),
  "v6.13 aggregate receipt history was not preserved",
);

const publicSource = [
  text.manifest,
  text.schema,
  text.documentation,
  text.revenueWorkflow,
  text.dedicatedWorkflow,
].join("\n");
for (const privateRef of [
  "docs.google.com",
  "drive.google.com",
  '"fileId"',
  '"folderId"',
  '"documentId"',
]) {
  assert(!publicSource.includes(privateRef), `v6.16 public source exposes ${privateRef}`);
}

console.log(
  JSON.stringify(
    {
      status: "PASS",
      control: manifest.controlId,
      manifestDigest: manifest.manifestDigest,
      issue133: manifest.issue133.integrityState,
      aggregate: manifest.decision.postMergeState,
      source: manifest.repository.applicationSourceState,
      production: `${manifest.production.applicationState}/${manifest.production.controlState}`,
      canonical: `${manifest.canonical.eventHeadSequence}/${manifest.canonical.reconciliationSequence}`,
      consent: `${manifest.consent.packageState}/${manifest.consent.decision}`,
      actual: manifest.actualEffects,
      projected: manifest.projectedEffects,
      privacy: "OWNER_ONLY_UNSHARED_NO_PUBLIC_REFERENCE",
      consequentialEffects: "ZERO",
      next: manifest.decision.nextControlledAction,
    },
    null,
    2,
  ),
);
