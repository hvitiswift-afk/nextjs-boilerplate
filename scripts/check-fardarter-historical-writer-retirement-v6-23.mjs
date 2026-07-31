import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const paths = {
  manifest: "receipts/revenue/FARDARTER-DRIVE-HISTORICAL-WRITER-RETIREMENT-V6-23.json",
  schema: "schemas/revenue/fardarter-drive-historical-writer-retirement-v6-23.schema.json",
  historicalWorkflow: ".github/workflows/fardarter-reconciliation-v6-3.yml",
  dedicatedWorkflow: ".github/workflows/fardarter-historical-writer-retirement-v6-23.yml",
  events: "receipts/revenue/FARDARTER-DRIVE-STATE-EVENTS-V6-2.json",
  currentHead: "receipts/revenue/FARDARTER-DRIVE-CURRENT-CONTROL-HEAD-V6-21.json",
  publicProjection: "receipts/revenue/FARDARTER-DRIVE-PUBLIC-CONTROL-HEAD-PROJECTION-V6-22.json",
  application: "receipts/revenue/FARDARTER-DRIVE-APPLICATION-CONTROL-PROJECTION-V6-20.json",
  production: "receipts/revenue/FARDARTER-DRIVE-PRODUCTION-RECONCILIATION-V6-12.json",
  docs: "docs/revenue/FARDARTER-DRIVE-HISTORICAL-WRITER-RETIREMENT-V6-23.md",
  package: "package.json",
  revenue: ".github/workflows/revenue-experiment.yml",
};

const text = Object.fromEntries(
  await Promise.all(Object.entries(paths).map(async ([key, path]) => [key, await readFile(path, "utf8")])),
);
const parse = (key) => JSON.parse(text[key]);
const manifest = parse("manifest");
const schema = parse("schema");
const events = parse("events");
const currentHead = parse("currentHead");
const publicProjection = parse("publicProjection");
const application = parse("application");
const production = parse("production");
const pkg = parse("package");

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const stable = (value) =>
  Array.isArray(value)
    ? `[${value.map(stable).join(",")}]`
    : value && typeof value === "object"
      ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`
      : JSON.stringify(value);
const sha256 = (value) => createHash("sha256").update(value, "utf8").digest("hex");
const noDigest = structuredClone(manifest);
delete noDigest.manifestDigest;

assert(
  manifest.controlId === "FARDARTER-DRIVE-HISTORICAL-WRITER-RETIREMENT-V6-23" &&
    manifest.controllerVersion === "6.23.0" &&
    manifest.controllingIssue === 229 &&
    manifest.implementationIssue === 230,
  "v6.23 identity mismatch",
);
assert(
  sha256(stable(noDigest)) === manifest.manifestDigest &&
    manifest.manifestDigest === "c4be1a809473b0eeaf31a98ff0777f0bab82b46ee4985c528d55da495f89dc76",
  "v6.23 digest mismatch",
);
assert(schema.type === "object" && stable(schema.const) === stable(manifest), "v6.23 strict schema mismatch");
assert(
  sha256(text.historicalWorkflow) === "4dc07ea9c0c227dcac426af691d2a0da124197a11224f9a66f19397f201d5153" &&
    manifest.repository.hardenedWorkflowSha256 === "4dc07ea9c0c227dcac426af691d2a0da124197a11224f9a66f19397f201d5153",
  "v6.23 hardened workflow hash mismatch",
);

assert(
  manifest.historicalConflict.issueNumber === 160 &&
    manifest.historicalConflict.bodyPreserved === true &&
    manifest.historicalConflict.commentsPreserved === true &&
    manifest.historicalConflict.repeatedFalseConflictReceiptCount === 4 &&
    manifest.historicalConflict.historicalMarkerDigests.length === 4 &&
    manifest.historicalConflict.classification === "HISTORICAL_WORKFLOW_STALE_FALSE_CONFLICT" &&
    manifest.historicalConflict.currentAuthorityFromConflictAllowed === false,
  "v6.23 historical conflict contract mismatch",
);
assert(
  currentHead.manifestDigest === manifest.predecessors.currentControlHead.digest &&
    publicProjection.manifestDigest === manifest.predecessors.publicControlHeadProjection.digest &&
    application.manifestDigest === manifest.predecessors.applicationControlProjection.digest &&
    production.manifestDigest === manifest.predecessors.production.digest &&
    Object.values(manifest.predecessors).every((item) => item.preservedImmutable === true),
  "v6.23 predecessor linkage mismatch",
);

const workflow = text.historicalWorkflow;
for (const prohibited of [
  "schedule:",
  "issues: write",
  "issues.createComment",
  "rest.issues.createComment",
  "context.runId",
  "jp-fardarter-reconciliation-v6-3-${snapshot.snapshotDigest}",
]) {
  assert(!workflow.includes(prohibited), `v6.23 retired workflow still contains ${prohibited}`);
}
for (const required of [
  "workflow_dispatch:",
  "issues: read",
  "npm run fardarter:historical-writer-retirement:check",
  "Generate read-only current-chain diagnostic artifact",
  "EVENT_COUNT_MISMATCH",
  "EVENT_SEQUENCE_GAP",
  "PREVIOUS_DIGEST_LINK_MISMATCH",
  "HEAD_SEQUENCE_MISMATCH",
  "HEAD_DIGEST_MISMATCH",
  "CANONICAL_BUSINESS_EVENT_COUNT_MISMATCH",
  "derivedBusinessEventCount",
  "materialFingerprint: digest(material)",
  "generatedAt: new Date().toISOString()",
  "publicIssueMutationPerformed: false",
  "canonicalMutationPerformed: false",
  "providerMutationPerformed: false",
  "fardarter-reconciliation-v6-3-readonly.json",
]) {
  assert(workflow.includes(required), `v6.23 retired workflow missing ${required}`);
}
assert(
  workflow.indexOf("const material = {") < workflow.indexOf("generatedAt: new Date().toISOString()"),
  "generatedAt must remain outside the stable material fingerprint",
);
assert(
  manifest.retirement.scheduledTriggerRemoved === true &&
    manifest.retirement.issuesWritePermissionRemoved === true &&
    manifest.retirement.automaticPublicCommentWriterRemoved === true &&
    manifest.retirement.manualReadOnlyDiagnosticPreserved === true &&
    manifest.retirement.manualDiagnosticWritesIssues === false &&
    manifest.retirement.manualDiagnosticMutatesCanonicalSource === false &&
    manifest.retirement.manualDiagnosticMutatesProvider === false,
  "v6.23 retirement state mismatch",
);
assert(
  manifest.retirement.materialFingerprint.excludes.join(",") ===
    "RUN_ID,GENERATED_AT,ARTIFACT_DIGEST,ARTIFACT_ONLY_METADATA",
  "v6.23 fingerprint exclusions mismatch",
);

assert(
  events.eventCount === events.events.length &&
    events.headSequence === events.events.at(-1)?.sequence &&
    events.headDigest === events.events.at(-1)?.eventDigest &&
    events.canonicalBusinessEventCount ===
      events.events.filter((event) => event.canonical === true && event.classification === "CANONICAL_BUSINESS_EVENT").length,
  "current event chain is not structurally healthy",
);
for (let index = 0; index < events.events.length; index += 1) {
  const event = events.events[index];
  assert(event.sequence === index, `event sequence mismatch at ${index}`);
  assert(event.canonical === true, `noncanonical event in canonical chain at ${index}`);
  if (index === 0) assert(event.previousEventDigest === null, "genesis previous digest must be null");
  if (index > 0) assert(event.previousEventDigest === events.events[index - 1].eventDigest, `event link mismatch at ${index}`);
}
assert(
  manifest.currentTruth.canonical.eventHeadSequence === 1 &&
    manifest.currentTruth.canonical.eventCount === 2 &&
    manifest.currentTruth.canonical.canonicalBusinessEventCount === 1 &&
    manifest.currentTruth.canonical.scopeDrafted === 1 &&
    manifest.currentTruth.canonical.humanAccepted === 0 &&
    manifest.currentTruth.canonical.active === 0 &&
    manifest.currentTruth.canonical.event2Present === false,
  "v6.23 canonical truth mismatch",
);
assert(
  manifest.currentTruth.consent.packageState === "NO_PACKAGE" &&
    manifest.currentTruth.capacity.totalPlanningSlots === 1000 &&
    manifest.currentTruth.capacity.effectiveActiveCeiling === 100 &&
    manifest.currentTruth.capacity.activeDeliveries === 0 &&
    manifest.currentTruth.money.orders === 0 &&
    manifest.currentTruth.money.verifiedGrossRevenueUsd === 0 &&
    manifest.currentTruth.money.verifiedSettledCashUsd === 0 &&
    manifest.currentTruth.privateContinuity.knownDocumentCount === 17 &&
    manifest.currentTruth.privateContinuity.ownerOnly === true &&
    manifest.currentTruth.privateContinuity.shared === false,
  "v6.23 consent/capacity/money/privacy mismatch",
);
assert(
  Object.values(manifest.actualEffects).every((value) => value === 0) &&
    Object.values(manifest.projectedEffects).every((value) => value === 0) &&
    Object.values(manifest.consequentialEffects).every((value) => value === false),
  "v6.23 consequential effects mismatch",
);

assert(
  pkg.scripts["fardarter:historical-writer-retirement:check"] ===
      "node scripts/check-fardarter-historical-writer-retirement-v6-23.mjs" &&
    pkg.scripts["revenue:verify"].includes(
      "npm run fardarter:public-control-head-projection:check && npm run fardarter:historical-writer-retirement:check && npm run fardarter:current-control-head:check",
    ) &&
    pkg.scripts["revenue:verify"].endsWith("npm run fardarter:strategy-rail:check"),
  "v6.23 package integration mismatch",
);
const nonCommentRevenue = text.revenue.split("\n").filter((line) => !line.trimStart().startsWith("#"));
assert(
  nonCommentRevenue.some((line) => line.trim() === "name: Verify Fardarter Drive v6.21 current control head"),
  "v6.21 must remain the active top-level control head",
);

for (const required of [
  "name: Fardarter Historical Writer Retirement v6.23",
  "permissions:\n  contents: read",
  "npm run fardarter:historical-writer-retirement:check",
  "FARDARTER-DRIVE-HISTORICAL-WRITER-RETIREMENT-V6-23.json",
  "fardarter-drive-historical-writer-retirement-v6-23.schema.json",
]) {
  assert(text.dedicatedWorkflow.includes(required), `v6.23 dedicated workflow missing ${required}`);
}
for (const prohibited of ["issues: write", "netlify deploy", "deploy --", "send_email", "gmail", "curl ", "wget "]) {
  assert(!text.dedicatedWorkflow.toLowerCase().includes(prohibited), `v6.23 dedicated workflow is not read-only: ${prohibited}`);
}

for (const required of [
  "Fardarter Drive™ v6.23",
  "HISTORICAL_PUBLIC_WRITER_RETIRED",
  "HISTORICAL_WORKFLOW_STALE_FALSE_CONFLICT",
  "c4be1a809473b0eeaf31a98ff0777f0bab82b46ee4985c528d55da495f89dc76",
  "4dc07ea9c0c227dcac426af691d2a0da124197a11224f9a66f19397f201d5153",
  "No private Google Drive URL or file ID",
]) {
  assert(text.docs.includes(required), `v6.23 documentation missing ${required}`);
}

const publicSource = [text.manifest, text.schema, text.historicalWorkflow, text.dedicatedWorkflow, text.docs].join("\n");
assert(!/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(publicSource), "v6.23 public email exposure");
for (const token of ["docs.google.com", "drive.google.com", '"fileId"', '"folderId"', '"documentId"']) {
  assert(!publicSource.includes(token), `v6.23 private reference exposure: ${token}`);
}

console.log(JSON.stringify({
  status: "PASS",
  control: manifest.controlId,
  manifestDigest: manifest.manifestDigest,
  workflowSha256: manifest.repository.hardenedWorkflowSha256,
  historicalConflict: manifest.historicalConflict.classification,
  scheduledWriter: "RETIRED",
  publicIssueMutation: false,
  currentHead: `${manifest.predecessors.currentControlHead.version}/${manifest.predecessors.currentControlHead.state}`,
  canonical: `${manifest.currentTruth.canonical.eventHeadSequence}/${manifest.currentTruth.canonical.reconciliationSequence}`,
  canonicalBusinessEvents: manifest.currentTruth.canonical.canonicalBusinessEventCount,
  consequentialEffects: "ZERO",
  next: manifest.decision.nextControlledAction,
}, null, 2));
