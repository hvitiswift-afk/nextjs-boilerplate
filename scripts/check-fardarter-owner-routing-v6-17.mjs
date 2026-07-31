import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const paths = {
  manifest: "receipts/revenue/FARDARTER-DRIVE-OWNER-ROUTING-V6-17.json",
  schema: "schemas/revenue/fardarter-drive-owner-routing-v6-17.schema.json",
  aggregate: "receipts/revenue/FARDARTER-DRIVE-AGGREGATE-RECEIPT-V6-16.json",
  unified: "receipts/revenue/FARDARTER-DRIVE-UNIFIED-CONTROL-V6-13.json",
  firstResponse: "receipts/revenue/FARDARTER-DRIVE-GITHUB-FIRST-RESPONSE-V6-9.json",
  publicOffer: "receipts/revenue/FARDARTER-DRIVE-PUBLIC-OFFER-V6-14.json",
  documentation: "docs/revenue/FARDARTER-DRIVE-OWNER-ROUTING-V6-17.md",
  workflow: ".github/workflows/fardarter-owner-routing-v6-17.yml",
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
const without = (object, key) => {
  const copy = structuredClone(object);
  delete copy[key];
  return copy;
};

const manifest = parse(text.manifest, "v6.17 owner-routing manifest");
const schema = parse(text.schema, "v6.17 owner-routing schema");
const aggregate = parse(text.aggregate, "v6.16 aggregate receipt");
const unified = parse(text.unified, "v6.13 unified control");
const firstResponse = parse(text.firstResponse, "v6.9 first-response control");
const publicOffer = parse(text.publicOffer, "v6.14 public offer");
const pkg = parse(text.package, "package");

assert(
  manifest.controlId === "FARDARTER-DRIVE-OWNER-ROUTING-V6-17" &&
    manifest.controllerVersion === "6.17.0" &&
    manifest.controllingIssue === 209 &&
    manifest.implementationIssue === 210,
  "v6.17 owner-routing identity mismatch",
);
assert(
  sha256Stable(without(manifest, "manifestDigest")) === manifest.manifestDigest &&
    manifest.manifestDigest === "ccd7761970cb3d48c8c4e9aeb06f40e691247088266ad2644b7ec00cd211a0d4",
  "v6.17 owner-routing digest mismatch",
);
assert(
  schema.type === "object" && stable(schema.const) === stable(manifest),
  "v6.17 exact schema does not lock the manifest",
);

assert(
  manifest.repository.repositoryFullName === "hvitiswift-afk/nextjs-boilerplate" &&
    manifest.repository.baseHead === "5c21c5216bdccc149960a1694b4528bb83a4ed49" &&
    manifest.repository.predecessorAggregateControl === aggregate.controlId &&
    manifest.repository.predecessorAggregateDigest === aggregate.manifestDigest &&
    aggregate.manifestDigest ===
      "f70fa832c62264fcdf8f24d9067246e5ecdeb0ae5dc5bf211ee3041d7bf13a7e" &&
    manifest.repository.sourceState === "PREPARED_SOURCE_ONLY_PENDING_REVIEWED_MERGE" &&
    manifest.repository.postMergeState === "OWNER_ROUTING_RECONCILED",
  "v6.17 predecessor or repository state mismatch",
);

assert(
  manifest.currentTruth.issue133.integrityState === "EXACT_CURRENT_OFFER_INTACT" &&
    manifest.currentTruth.issue133.publicState === publicOffer.offer.publicState &&
    manifest.currentTruth.issue133.bodySha256 === publicOffer.publicIssue.bodySha256 &&
    manifest.currentTruth.issue133.automaticRewriteAllowed === false &&
    manifest.currentTruth.applicationSourceState === "SOURCE_MERGED_NOT_DEPLOYED",
  "v6.17 Issue #133 or application-source truth mismatch",
);
assert(
  manifest.currentTruth.production.applicationState ===
      aggregate.production.applicationState &&
    manifest.currentTruth.production.controlState === aggregate.production.controlState &&
    manifest.currentTruth.production.deployedApplicationSource ===
      aggregate.production.applicationSource &&
    manifest.currentTruth.production.deployId === aggregate.production.deployId &&
    manifest.currentTruth.production.repositoryRelationship ===
      "CONTROL_AHEAD_OF_DEPLOYED_APPLICATION_SOURCE" &&
    manifest.currentTruth.production.sourceGap === "EXPECTED_CONTROL_ONLY_GAP",
  "v6.17 production/source separation mismatch",
);
assert(
  stable(manifest.currentTruth.canonical) === stable({
    eventHeadSequence: aggregate.canonical.eventHeadSequence,
    eventHeadDigest: aggregate.canonical.eventHeadDigest,
    reconciliationSequence: aggregate.canonical.reconciliationSequence,
    reconciliationDigest: aggregate.canonical.reconciliationDigest,
    scopeDrafted: aggregate.canonical.scopeDrafted,
    humanAccepted: aggregate.canonical.humanAccepted,
    active: aggregate.canonical.active,
    event2Present: aggregate.canonical.event2Present,
  }) &&
    manifest.currentTruth.consent.packageState === "NO_PACKAGE" &&
    manifest.currentTruth.consent.decision === "AWAITING_COUNTERPARTY_EVIDENCE" &&
    manifest.currentTruth.consent.independentVerificationPerformed === false &&
    manifest.currentTruth.capacity.totalPlanningSlots === 1000 &&
    manifest.currentTruth.capacity.effectiveActiveCeiling === 100 &&
    manifest.currentTruth.capacity.activeDeliveries === 0 &&
    manifest.currentTruth.capacity.activeHeadroom === 100 &&
    manifest.currentTruth.capacity.overrideState === "INACTIVE_NO_RECEIPT" &&
    manifest.currentTruth.money.orders === 0 &&
    manifest.currentTruth.money.verifiedGrossRevenueUsd === 0 &&
    manifest.currentTruth.money.verifiedSettledCashUsd === 0 &&
    manifest.currentTruth.money.receivedCashRequires === "PAID_SETTLED",
  "v6.17 canonical, consent, capacity, or money truth mismatch",
);
assert(
  manifest.currentTruth.privateContinuity.state === "CONNECTED_PRIVATE" &&
    manifest.currentTruth.privateContinuity.knownDocumentCount === 17 &&
    manifest.currentTruth.privateContinuity.ownerOnly === true &&
    manifest.currentTruth.privateContinuity.shared === false &&
    manifest.currentTruth.privateContinuity.publicPrivateReferencesExposed === false,
  "v6.17 private continuity mismatch",
);

assert(
  manifest.writeOwnership.issue133Rewrite ===
      "NEW_VERSIONED_CONTROL_ISSUE_REVIEWED_MERGE_EXACT_ONE_TIME_UPDATE" &&
    manifest.writeOwnership.githubAutomaticFirstResponse === "NATIVE_V6_9_WORKFLOW" &&
    manifest.writeOwnership.gmailRoutineCommunication === "CONNECTED_GMAIL_CONTROLLER" &&
    manifest.writeOwnership.privateContinuity === "OWNER_ONLY_GOOGLE_DRIVE" &&
    manifest.writeOwnership.providerEvidenceAndMutation ===
      "FARDARTER_DRIVE_LIVE_WATCH" &&
    manifest.writeOwnership.canonicalApplication === "REVIEWED_APPEND_ONLY_MERGE",
  "v6.17 write ownership mismatch",
);

const expectedRouteIds = ["ISSUE_133_INTEGRITY", "GITHUB_AUDIT_INTAKE", "GITHUB_NATIVE_FIRST_RESPONSE", "PRIVATE_WORK_PACKAGE", "GMAIL_COUNTERPARTY", "CONSENT_EVIDENCE", "EVENT_PROPOSAL", "CANONICAL_PREVIEW", "CAPACITY_OVERRIDE", "CONFLICT_AND_STAGE_REVIEW", "PROVIDER_EVIDENCE"];
assert(
  manifest.routes.map((route) => route.routeId).join("|") === expectedRouteIds.join("|") &&
    new Set(manifest.routes.map((route) => route.routeId)).size === expectedRouteIds.length,
  "v6.17 route set or ordering mismatch",
);
const routes = new Map(manifest.routes.map((route) => [route.routeId, route]));
assert(
  routes.get("ISSUE_133_INTEGRITY").owner === "CONNECTED_FARDARTER_CONTROL_PLANE" &&
    routes.get("ISSUE_133_INTEGRITY").forbiddenAutomaticActions.includes("REWRITE_ISSUE_133") &&
    routes.get("GITHUB_AUDIT_INTAKE").notificationEvent ===
      "GENUINELY_NEW_EXTERNAL_REQUEST" &&
    routes.get("GITHUB_NATIVE_FIRST_RESPONSE").owner === "NATIVE_V6_9_WORKFLOW" &&
    routes.get("GITHUB_NATIVE_FIRST_RESPONSE").forbiddenAutomaticActions.includes(
      "CONNECTED_CONTROLLER_SYNTHETIC_REPLY",
    ) &&
    routes.get("PRIVATE_WORK_PACKAGE").owner === "OWNER_ONLY_GOOGLE_DRIVE" &&
    routes.get("GMAIL_COUNTERPARTY").owner === "CONNECTED_GMAIL_CONTROLLER" &&
    routes.get("GMAIL_COUNTERPARTY").senderValuePubliclyRepeated === false &&
    routes.get("CONSENT_EVIDENCE").forbiddenAutomaticActions.includes("SELF_VERIFY") &&
    routes.get("EVENT_PROPOSAL").forbiddenAutomaticActions.includes(
      "APPEND_CANONICAL_EVENT",
    ) &&
    routes.get("CANONICAL_PREVIEW").forbiddenAutomaticActions.includes("SELF_APPLY") &&
    routes.get("CAPACITY_OVERRIDE").forbiddenAutomaticActions.includes(
      "ACTIVATE_OVERRIDE",
    ) &&
    routes.get("CONFLICT_AND_STAGE_REVIEW").permittedAutomaticActions.includes(
      "QUARANTINE",
    ) &&
    routes.get("PROVIDER_EVIDENCE").owner === "FARDARTER_DRIVE_LIVE_WATCH",
  "v6.17 route ownership or action boundary mismatch",
);
assert(
  manifest.routes.every((route) => route.noChangeDisposition === "SILENT"),
  "every v6.17 route must remain silent without material change",
);

const expectedAllowedEvents = ["GENUINELY_NEW_EXTERNAL_REQUEST", "VERIFIED_NATIVE_GITHUB_FIRST_RESPONSE", "BLOCKED_CONTACT_PUBLIC_OFFER_OR_CROSS_LAYER_CONFLICT", "CREATED_PRIVATE_WORK_PACKAGE", "VERIFIED_GMAIL_MESSAGE_OR_REPLY", "NEW_CONSENT_PROPOSAL_PREVIEW_OR_CAPACITY_DECISION", "PROVIDER_EVIDENCE_CHANGE_FROM_SEPARATE_OWNER", "MATERIAL_STAGE_CHANGE"];
const expectedSilenceConditions = ["NO_MATERIAL_CHANGE", "UNCHANGED_POINT_IN_TIME_SCAN", "DUPLICATE_DECISION_FINGERPRINT", "REPEATED_HOLD_STATE", "HISTORICAL_COMMENT_ONLY", "OWNER_OR_BOT_SELF_TEST_ONLY", "EXTERNAL_PROVIDER_STATUS_WITHOUT_NEW_PROVIDER_EVIDENCE", "NATIVE_FIRST_RESPONSE_ALREADY_PRESENT", "GMAIL_DUPLICATE_KEY_ALREADY_SENT"];
assert(
  manifest.notificationPolicy.allowedEvents.join("|") ===
      expectedAllowedEvents.join("|") &&
    manifest.notificationPolicy.silenceConditions.join("|") ===
      expectedSilenceConditions.join("|") &&
    manifest.notificationPolicy.maximumNotificationsPerFingerprint === 1 &&
    manifest.notificationPolicy.sameFingerprintAction === "SUPPRESS_NOTIFICATION" &&
    manifest.notificationPolicy.changedFingerprintAction === "REEVALUATE_MATERIALITY" &&
    manifest.notificationPolicy.nothingMaterialChangedDisposition === "SILENT",
  "v6.17 notification materiality or suppression mismatch",
);

const expectedFingerprintFields = ["routeId", "caseId", "sourceObjectId", "sourceIdentity", "channel", "sourceReceiptDigest", "repositoryHead", "issue133BodySha256", "canonicalEventHeadDigest", "reconciliationHeadDigest", "consentLifecycle", "capacityState", "moneyState", "decision", "blockerCode"];
assert(
  manifest.decisionFingerprint.algorithm === "SHA-256" &&
    manifest.decisionFingerprint.canonicalization === "JSON_SORTED_KEYS_UTF8" &&
    manifest.decisionFingerprint.fields.join("|") ===
      expectedFingerprintFields.join("|") &&
    manifest.decisionFingerprint.receiptStorage ===
      "OWNER_ONLY_PUBLIC_PRIVATE_RECONCILIATION_REGISTER" &&
    manifest.decisionFingerprint.publicExposureAllowed === false &&
    manifest.decisionFingerprint.rawGmailMessageKeysPublic === false &&
    manifest.decisionFingerprint.privateEvidenceReferencesPublic === false &&
    manifest.decisionFingerprint.conflictReasonDetailsPublic === false,
  "v6.17 decision-fingerprint privacy contract mismatch",
);

const expectedGmailKeyFields = ["threadId", "newestIncomingMessageId", "recipient", "action", "bodyFingerprint", "attachmentFingerprints"];
assert(
  manifest.duplicateControls.github.nativeResponseMarker ===
      firstResponse.response.responseMarker &&
    manifest.duplicateControls.github.authorizationMarker ===
      firstResponse.trigger.authorizationReceiptMarker &&
    manifest.duplicateControls.github.soleAutomaticWriter ===
      "NATIVE_V6_9_WORKFLOW" &&
    manifest.duplicateControls.github.responseAlreadyPresentAction ===
      "RECONCILE_LABELS_AND_DO_NOT_REPLY" &&
    manifest.duplicateControls.gmail.duplicateKeyFields.join("|") ===
      expectedGmailKeyFields.join("|") &&
    manifest.duplicateControls.gmail.duplicateKeyStorage === "PRIVATE_ONLY" &&
    manifest.duplicateControls.gmail.alreadySentAction === "DO_NOT_SEND" &&
    manifest.duplicateControls.gmail.sentVerificationRequired === true &&
    unified.gmail.duplicatePreventionRequired === true &&
    unified.gmail.verifiedRecipientRequired === true &&
    unified.gmail.verifiedThreadRequired === true,
  "v6.17 GitHub or Gmail duplicate controls mismatch",
);

assert(
  manifest.pointInTimeScan.issue133Integrity === "EXACT_CURRENT_OFFER_INTACT" &&
    manifest.pointInTimeScan.openExternalAuditRequests === 0 &&
    manifest.pointInTimeScan.relevantInboundCounterpartyMessages === 0 &&
    manifest.pointInTimeScan.newConsentPackages === 0 &&
    manifest.pointInTimeScan.newEventProposals === 0 &&
    manifest.pointInTimeScan.newPreviews === 0 &&
    manifest.pointInTimeScan.newCapacityRequests === 0 &&
    manifest.pointInTimeScan.materialConflicts === 0 &&
    manifest.pointInTimeScan.externalInputDisposition ===
      "SILENT_NO_MATERIAL_EXTERNAL_CHANGE" &&
    manifest.pointInTimeScan.notBackgroundMonitoringGuarantee === true,
  "v6.17 point-in-time scan mismatch",
);
assert(
  manifest.decision.state ===
      "READY_FOR_REVIEWED_OWNER_ROUTING_RECONCILIATION" &&
    manifest.decision.postMergeState === "OWNER_ROUTING_RECONCILED" &&
    manifest.decision.nextControlledAction ===
      "HOLD_FOR_GENUINE_EXTERNAL_INPUT_OR_SEPARATELY_AUTHORIZED_EXACT_PRODUCTION_PROMOTION" &&
    manifest.decision.automaticIssue133RewriteAllowed === false &&
    manifest.decision.automaticDeploymentAllowed === false &&
    manifest.decision.automaticCanonicalAdvanceAllowed === false &&
    Object.values(manifest.consequentialEffects).every((value) => value === false),
  "v6.17 decision or zero-effect boundary mismatch",
);

for (const required of [
  "Fardarter Drive™ v6.17",
  "OWNER_ROUTING_RECONCILED",
  "notify once",
  "SILENT_NO_MATERIAL_EXTERNAL_CHANGE",
  "NATIVE_V6_9_WORKFLOW",
  "CONNECTED_GMAIL_CONTROLLER",
  "FARDARTER_DRIVE_LIVE_WATCH",
  "private decision fingerprint",
  "Issue #133 is not rewritten",
  "0 orders / $0 gross / $0 settled",
]) {
  assert(text.documentation.includes(required), `v6.17 documentation missing ${required}`);
}

for (const required of [
  "name: Fardarter Owner Routing v6.17",
  "permissions:\n  contents: read",
  "npm run fardarter:owner-routing:check",
  "FARDARTER-DRIVE-OWNER-ROUTING-V6-17.json",
  "fardarter-drive-owner-routing-v6-17.schema.json",
]) {
  assert(text.workflow.includes(required), `v6.17 workflow missing ${required}`);
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
    `v6.17 workflow must remain read-only: ${prohibited}`,
  );
}

assert(
  pkg.scripts["fardarter:owner-routing:check"] ===
      "node scripts/check-fardarter-owner-routing-v6-17.mjs" &&
    pkg.scripts["revenue:verify"].includes("npm run fardarter:owner-routing:check"),
  "v6.17 package integration mismatch",
);

const publicSource = [
  text.manifest,
  text.schema,
  text.documentation,
  text.workflow,
].join("\n");
for (const prohibited of [
  "docs.google.com",
  "drive.google.com",
  '"fileId"',
  '"folderId"',
  '"documentId"',
  "justin.rackham@gmail.com",
]) {
  assert(
    !publicSource.includes(prohibited),
    `v6.17 public source exposes prohibited private value: ${prohibited}`,
  );
}

console.log(
  JSON.stringify(
    {
      status: "PASS",
      control: manifest.controlId,
      manifestDigest: manifest.manifestDigest,
      routes: manifest.routes.length,
      allowedNotifications: manifest.notificationPolicy.allowedEvents.length,
      silenceConditions: manifest.notificationPolicy.silenceConditions.length,
      currentDisposition: manifest.pointInTimeScan.externalInputDisposition,
      postMergeState: manifest.decision.postMergeState,
      consequentialEffects: "ZERO",
    },
    null,
    2,
  ),
);
