import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const paths = {
  manifest: "receipts/revenue/FARDARTER-DRIVE-DEPLOYMENT-LINEAGE-V6-10.json",
  schema: "schemas/revenue/fardarter-drive-deployment-lineage-v6-10.schema.json",
  workflow: ".github/workflows/fardarter-deployment-lineage-v6-10.yml",
  doc: "docs/repository/FARDARTER-DRIVE-V6-10-DEPLOYMENT-LINEAGE.md",
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

const manifest = parse(text.manifest, "deployment lineage manifest");
const schema = parse(text.schema, "deployment lineage schema");
const chain = parse(text.chain, "canonical event chain");
const reconciliation = parse(text.reconciliation, "canonical reconciliation");
const pkg = parse(text.package, "package");

assert(
  manifest.controlId === "FARDARTER-DRIVE-DEPLOYMENT-LINEAGE-V6-10" &&
    manifest.controllerVersion === "6.10.0" &&
    manifest.controllingIssue === 190,
  "v6.10 deployment lineage identity mismatch",
);
assert(
  digestWithout(manifest, "manifestDigest") === manifest.manifestDigest,
  "v6.10 deployment lineage digest mismatch",
);
assert(
  manifest.manifestDigest === "a63ea73acbb8bc1ec06dfdda7721333ad54cd8492ac163aebf3d15d4ed14556e",
  "v6.10 deployment lineage digest lock mismatch",
);
assert(
  schema.properties?.controlId?.const === manifest.controlId &&
    schema.properties?.controllerVersion?.const === manifest.controllerVersion &&
    schema.properties?.controllingIssue?.const === manifest.controllingIssue &&
    schema.properties?.manifestDigest?.const === manifest.manifestDigest,
  "v6.10 schema identity lock mismatch",
);

const historical = manifest.verifiedHistoricalDeployment;
assert(
  historical.applicationVersion === "6.4.0" &&
    historical.sourceCommit === "e482004bfff1bb90aba2d67b8da62a524f18cdb4" &&
    historical.provider === "NETLIFY" &&
    historical.siteId === "21d3bb41-3a69-4a7d-b6c6-e873cde8ee2f" &&
    historical.siteName === "lichburn-v0-2-8",
  "verified historical deployment identity mismatch",
);
assert(
  historical.deployId === "6a6b6a709e0a6d5ff2ca7759" &&
    historical.immutableUrl ===
      "https://6a6b6a709e0a6d5ff2ca7759--lichburn-v0-2-8.netlify.app" &&
    historical.workflowRunId === 30554925086 &&
    historical.artifactName === "fardarter-v6-4-static-materialized-30554925086" &&
    historical.artifactId === 8764697374 &&
    historical.artifactDigest ===
      "sha256:e45290adf2e8b85089d0bf9a375ca63154859ddfd451d3977aa49c297fee5dd2",
  "verified historical provider evidence mismatch",
);
assert(
  historical.verificationState === "DEPLOYED_AND_VERIFIED" &&
    historical.verifiedRouteCount === 12 &&
    historical.readbackContractVersion === "6.4.0" &&
    historical.materializationMode === "NETLIFY_V1_ROUTE_BLOBS_TO_STATIC_PACKAGE" &&
    historical.runtimeFunctionsRequiredForVerifiedRoutes === false,
  "verified historical route contract mismatch",
);

const latest = manifest.latestApplicationTarget;
assert(
  manifest.createdFromApplicationHead === "760d198316c392a7de3af36faffa93df42ecca64" &&
    latest.applicationVersion === "6.9.0" &&
    latest.sourceCommit === manifest.createdFromApplicationHead &&
    latest.capability === "AUTHORIZED_GITHUB_FIRST_RESPONSE" &&
    latest.repositoryState === "MERGED",
  "latest application target mismatch",
);
assert(
  latest.productionPromotionState === "NOT_PROMOTED" &&
    latest.providerDeployId === null &&
    latest.immutableUrl === null &&
    latest.routeReadbackState === "NOT_PERFORMED" &&
    latest.claimLiveAllowed === false,
  "latest target must remain explicitly not promoted",
);

assert(
  Object.keys(manifest.lineageDistinctions).length === 6 &&
    Object.values(manifest.lineageDistinctions).every((value) => value === false),
  "deployment lineage distinctions must all deny equivalence",
);
assert(
  manifest.stateClassification.historicalDeployment === "VERIFIED_HISTORICAL" &&
    manifest.stateClassification.latestRepository === "MERGED_NOT_DEPLOYED" &&
    manifest.stateClassification.latestProduction === "UNVERIFIED" &&
    manifest.stateClassification.drift === "EXPECTED_VERSION_GAP",
  "deployment lineage state classification mismatch",
);

const gate = manifest.promotionGate;
for (const requiredTrue of [
  "requiresExactTargetCommit",
  "requiresAllRepositoryVerifiers",
  "requiresProviderDeployId",
  "requiresImmutableUrl",
  "requiresRouteByRouteReadback",
  "requiresDurableIssueReceipts",
  "requiresRollbackReference",
  "requiresNoPrivateReferenceExposure",
  "humanApprovalRequired",
]) {
  assert(gate[requiredTrue] === true, `promotion gate missing ${requiredTrue}`);
}
assert(
  gate.requiredReceiptIssues.join("|") === "190|141|133" &&
    gate.automaticPromotionAllowed === false,
  "latest promotion receipt or authority gate mismatch",
);

assert(
  chain.headSequence === 1 &&
    chain.headDigest === "3859eac9c63bef83624111704d38cf217b0c1a4ece6df874e72a76e9fb1ffc3b" &&
    reconciliation.sequence === 1 &&
    reconciliation.snapshotDigest ===
      "9f4f878cc0f8f2ddfa7bbdb594d2b9164064acd8901301404aed57b4065eca0f",
  "canonical heads changed",
);
assert(
  manifest.canonicalBoundaries.canonicalEventHeadSequence === chain.headSequence &&
    manifest.canonicalBoundaries.canonicalEventHeadDigest === chain.headDigest &&
    manifest.canonicalBoundaries.reconciliationSequence === reconciliation.sequence &&
    manifest.canonicalBoundaries.reconciliationDigest === reconciliation.snapshotDigest,
  "lineage manifest is stale against canonical heads",
);
assert(
  chain.currentCanonicalCounts.SCOPE_DRAFTED === 1 &&
    chain.currentCanonicalCounts.HUMAN_ACCEPTED === 0 &&
    chain.currentCanonicalCounts.ACTIVE === 0 &&
    manifest.canonicalBoundaries.scopeDrafted === 1 &&
    manifest.canonicalBoundaries.humanAccepted === 0 &&
    manifest.canonicalBoundaries.active === 0,
  "canonical state boundary changed",
);
assert(
  chain.financialEvidence.orders === 0 &&
    chain.financialEvidence.verifiedGrossRevenueUsd === 0 &&
    chain.financialEvidence.verifiedSettledCashUsd === 0 &&
    chain.financialEvidence.receivedCashRequires === "PAID_SETTLED" &&
    manifest.canonicalBoundaries.orders === 0 &&
    manifest.canonicalBoundaries.verifiedGrossRevenueUsd === 0 &&
    manifest.canonicalBoundaries.verifiedSettledCashUsd === 0 &&
    manifest.canonicalBoundaries.receivedCashRequires === "PAID_SETTLED",
  "canonical financial boundary changed",
);
assert(
  Object.keys(manifest.actualEffects).length === 10 &&
    Object.values(manifest.actualEffects).every((value) => value === false),
  "v6.10 lineage control created an actual effect",
);

for (const required of [
  "Verified historical deployment",
  "Latest merged application target",
  "Verified historical deploy ≠ latest repository state",
  "MERGED_NOT_DEPLOYED",
  "NOT_PROMOTED",
  "provider deploy ID",
  "immutable route readback",
  "rollback reference",
  "PAID_SETTLED",
  "No private Google Drive URL or ID",
]) {
  assert(text.doc.includes(required), `v6.10 documentation missing ${required}`);
}
for (const required of [
  "name: Fardarter Deployment Lineage v6.10",
  "npm run fardarter:deployment-lineage:check",
  "contents: read",
]) {
  assert(text.workflow.includes(required), `v6.10 workflow missing ${required}`);
}
assert(
  !text.workflow.includes("netlify deploy") &&
    !text.workflow.includes("NETLIFY_AUTH_TOKEN") &&
    !text.workflow.includes("proxy-path") &&
    !text.workflow.includes("issues: write"),
  "v6.10 lineage CI must not deploy, mutate issues, or consume Netlify credentials",
);
assert(
  pkg.scripts?.["fardarter:deployment-lineage:check"] ===
    "node scripts/check-fardarter-deployment-lineage-v6-10.mjs",
  "package is missing the v6.10 deployment lineage verifier",
);
assert(
  pkg.scripts?.["revenue:verify"]?.includes("npm run fardarter:deployment-lineage:check"),
  "revenue verifier does not include the v6.10 deployment lineage check",
);

console.log("Fardarter Drive v6.10 deployment lineage: PASS");
