import { readFile } from "node:fs/promises";

const paths = {
  page: "app/github-control-tower-audit/page.tsx",
  api: "app/api/revenue/pilot/route.ts",
  experiment: "examples/revenue-experiment.sample.json",
  drive: "receipts/revenue/FARDARTER-DRIVE-V6.json",
  authority: "receipts/revenue/FARDARTER-DRIVE-AUTHORITY-V6.json",
  gdrive: "receipts/revenue/FARDARTER-DRIVE-GDRIVE-V6.json",
  override: "receipts/revenue/FARDARTER-DRIVE-CAPACITY-OVERRIDE-V6.sample.json",
  publicOffer: "receipts/revenue/FARDARTER-DRIVE-PUBLIC-OFFER-V6-14.json",
  unified: "receipts/revenue/FARDARTER-DRIVE-UNIFIED-CONTROL-V6-13.json",
  production: "receipts/revenue/FARDARTER-DRIVE-PRODUCTION-RECONCILIATION-V6-12.json",
  applicationSurface:
    "receipts/revenue/FARDARTER-DRIVE-APPLICATION-SURFACE-V6-15.json",
  fitWorkflow: ".github/workflows/fardarter-fit-acceptance-v6.yml",
  executionWorkflow: ".github/workflows/fardarter-approved-execution-v6.yml",
  overrideWorkflow: ".github/workflows/fardarter-capacity-override-v6.yml",
  form: ".github/ISSUE_TEMPLATE/control-tower-audit-request.yml",
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const entries = await Promise.all(
  Object.entries(paths).map(async ([key, path]) => [key, await readFile(path, "utf8")]),
);
const text = Object.fromEntries(entries);
const experiment = JSON.parse(text.experiment);
const drive = JSON.parse(text.drive);
const authority = JSON.parse(text.authority);
const gdrive = JSON.parse(text.gdrive);
const override = JSON.parse(text.override);
const publicOffer = JSON.parse(text.publicOffer);
const unified = JSON.parse(text.unified);
const production = JSON.parse(text.production);
const applicationSurface = JSON.parse(text.applicationSurface);

assert(experiment.offer.capacity === 1000, "surface capacity must be 1,000");
assert(
  experiment.offer.maxConcurrentDeliveries === 100,
  "surface standard active ceiling must be 100",
);
assert(experiment.offer.grossTargetUsd === 100000, "surface target must be $100,000");
assert(drive.driveId === "FARDARTER-DRIVE-V6", "surface must retain v6 drive compatibility");
assert(authority.authorityVersion === "6.0.0", "surface must retain authority v6");
assert(gdrive.state === "CONNECTED_PRIVATE", "surface must use private Drive continuity");
assert(override.state === "INACTIVE_NO_RECEIPT", "surface baseline override must be inactive");
assert(override.above100Allowed === true, "surface must permit above-100 override");

assert(
  publicOffer.offer.publicState === "OPEN_FOR_VERIFIED_FIT_CHECKS" &&
    publicOffer.production.applicationState === "DEPLOYED_AND_VERIFIED" &&
    publicOffer.production.controlState === "RECONCILED",
  "surface must project reviewed v6.14 public and production truth",
);
assert(
  unified.canonical.eventHeadSequence === 1 &&
    unified.canonical.reconciliationSequence === 1 &&
    unified.canonical.scopeDrafted === 1 &&
    unified.canonical.humanAccepted === 0 &&
    unified.canonical.active === 0 &&
    unified.consent.packageState === "NO_PACKAGE" &&
    unified.consent.decision === "AWAITING_COUNTERPARTY_EVIDENCE",
  "surface must project canonical and consent truth",
);
assert(
  production.repository.deployedApplicationSource ===
      "88bd8dc89a0bd95f42c7e1a21dccc56fe9dc7334" &&
    production.verifiedProduction.deployId === "6a6ba0366ebec6650d843ac3" &&
    production.stateClassification.repositoryHead ===
      "CONTROL_AHEAD_OF_DEPLOYED_APPLICATION_SOURCE",
  "surface must preserve deployed-source and repository relationship",
);
assert(
  applicationSurface.controllerVersion === "6.15.0" &&
    applicationSurface.surface.apiSchemaVersion === "1.6.0" &&
    applicationSurface.surface.projectionState ===
      "REPOSITORY_SOURCE_ONLY_PENDING_SEPARATE_PROVIDER_PROMOTION" &&
    applicationSurface.surface.sourceUpdateCreatesDeployment === false &&
    applicationSurface.surface.repositorySourceEqualsDeployedApplicationSource === false,
  "surface must use v6.15 source-only projection",
);

for (const required of [
  "FARDARTER-DRIVE-V6.json",
  "FARDARTER-DRIVE-AUTHORITY-V6.json",
  "FARDARTER-DRIVE-GDRIVE-V6.json",
  "FARDARTER-DRIVE-CAPACITY-OVERRIDE-V6.sample.json",
  "FARDARTER-DRIVE-PUBLIC-OFFER-V6-14.json",
  "FARDARTER-DRIVE-UNIFIED-CONTROL-V6-13.json",
  "FARDARTER-DRIVE-PRODUCTION-RECONCILIATION-V6-12.json",
  'schemaVersion: "1.6.0"',
  'controlId: "FARDARTER-DRIVE-APPLICATION-SURFACE-V6-15"',
  'state: "REPOSITORY_SOURCE_ONLY_PENDING_SEPARATE_PROVIDER_PROMOTION"',
  "sourceEqualsDeployedApplicationSource: false",
  "sourceUpdateCreatesDeployment: false",
  "repositorySourceIsCurrentlyDeployed: false",
  "futurePromotionRequiresSeparateProviderEvidence: true",
  "legacyCompatibility",
  "standardActiveCeiling",
  "effectiveActiveCeiling",
  "above100Allowed",
  'activationTarget: "CAPACITY_OVERRIDE_ACTIVE"',
  "capacityOverrideActivatesWithoutReceipt: false",
  'receivedCashRequires: "PAID_SETTLED"',
]) {
  assert(text.api.includes(required), `API missing source or boundary: ${required}`);
}

for (const required of [
  "Fardarter Drive™ v6",
  "source projection v",
  "One offer. Separate source, production, consent, and money truth.",
  "Repository application source",
  "Verified production",
  "Canonical and consent",
  "GitHub contact",
  "Google Drive continuity",
  "SOURCE_ONLY",
  "This repository source is not itself proof of a new deployment.",
  "1,000 total slots",
  "100 standard ACTIVE",
  "Above 100 is allowed",
  "CAPACITY_OVERRIDE_ACTIVE",
  "INACTIVE_NO_RECEIPT",
  "FIT_APPROVED_FOR_SCOPE_DRAFT",
  "CONNECTED_PRIVATE",
  "AWAITING_COUNTERPARTY_EVIDENCE",
  "$100,000",
  "$1 quadrillion",
  "not indemnity-proof",
  "Request a public-safe fit check",
]) {
  assert(text.page.includes(required), `product page missing: ${required}`);
}

for (const required of [
  "jp-fardarter-fit-v6",
  "fit-approved-for-scope-draft",
  "needs-scope-draft",
  "1,000 total planning slots",
  "100 deliveries may be ACTIVE",
  "above 100 requires an active capacity override receipt",
]) {
  assert(text.fitWorkflow.includes(required), `v6 fit workflow missing: ${required}`);
}

for (const required of [
  "fd-execute-approved-v6",
  "jp-fardarter-execution-v6-",
  "Enforce one execution receipt per issue",
  "oneShotPerIssue: true",
  "capacity: 1000",
  "standardActiveCeiling: 100",
  "effectiveActiveCeiling: 100",
  "above100Allowed: true",
]) {
  assert(
    text.executionWorkflow.includes(required),
    `v6 execution workflow missing: ${required}`,
  );
}
assert(
  !text.executionWorkflow.includes("contents: write"),
  "v6 execution workflow must remain read-only",
);

for (const required of [
  "requested_active_ceiling",
  "standardActiveCeiling: 100",
  "totalPlanningCapacity: 1000",
  "APPROVED_NOT_ACTIVE",
  "CAPACITY_OVERRIDE_ACTIVE",
  "activationRequiresCanonicalMerge: true",
  "does not change the canonical effective ceiling",
]) {
  assert(
    text.overrideWorkflow.includes(required),
    `override workflow missing: ${required}`,
  );
}
assert(
  !text.overrideWorkflow.includes("contents: write"),
  "override workflow must not write canonical source",
);

for (const required of [
  "1,000 total slots",
  "100 ACTIVE deliveries",
  "above 100 requires a complete active capacity-override receipt",
  "FIT_APPROVED_FOR_SCOPE_DRAFT",
]) {
  assert(text.form.includes(required), `request form missing v6 disclosure: ${required}`);
}

assert(drive.capacityModel.aboveStandardAllowed === true, "above-standard capacity must be allowed");
assert(drive.capacityModel.automaticActivation === false, "capacity override must not self-activate");
assert(
  drive.capacityModel.overrideMayExceedTotalPlanningCapacity === false,
  "override must stay within total capacity",
);
assert(
  gdrive.publicFolderUrlExposed === false && gdrive.publicFileIdsExposed === false,
  "Drive references must remain private",
);
assert(
  gdrive.automation.activateOverrideWithoutCompleteReceipt === false,
  "Drive automation must not activate incomplete override",
);
assert(
  Object.values(override.claims).every((value) => value === false),
  "override sample must make no demand or financial claims",
);

const combined =
  `${text.page}\n${text.api}\n${text.fitWorkflow}\n${text.executionWorkflow}\n${text.overrideWorkflow}`.toLowerCase();
for (const forbidden of [
  "guaranteed revenue",
  "guaranteed income",
  "capacity proves demand",
  "automatic contract acceptance",
  "automatic payment settlement",
  "indemnity-proof system",
  "repository source is currently deployed: true",
]) {
  assert(!combined.includes(forbidden), `forbidden public claim found: ${forbidden}`);
}

assert(!text.api.includes('schemaVersion: "1.5.0"'), "stale API schema 1.5.0 remains");
assert(
  !text.page.includes(
    'title: "GitHub Control Tower Audit + Fardarter Drive™ v6 | JP Systems"',
  ),
  "stale page metadata remains",
);

console.log("Revenue product surface v6 + v6.15 projection: PASS");
console.log(
  "Page/API: public offer v6.14 / source projection v6.15 / verified production v6.12",
);
console.log(
  "Canonical/consent: 1/1 / SCOPE_DRAFTED=1 / NO_PACKAGE / AWAITING_COUNTERPARTY_EVIDENCE",
);
console.log("Google Drive: CONNECTED_PRIVATE / 17 known / no public URLs or IDs");
console.log("Money: 0 orders / $0 gross / $0 settled");
