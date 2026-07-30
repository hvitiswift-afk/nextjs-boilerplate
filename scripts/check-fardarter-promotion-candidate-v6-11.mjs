import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";

const paths = {
  manifest: "receipts/revenue/FARDARTER-DRIVE-PROMOTION-CANDIDATE-V6-11.json",
  schema: "schemas/revenue/fardarter-drive-promotion-candidate-v6-11.schema.json",
  lineage: "receipts/revenue/FARDARTER-DRIVE-DEPLOYMENT-LINEAGE-V6-10.json",
  chain: "receipts/revenue/FARDARTER-DRIVE-STATE-EVENTS-V6-2.json",
  reconciliation: "receipts/revenue/FARDARTER-DRIVE-RECONCILIATION-V6-5.json",
  docs: "docs/repository/FARDARTER-DRIVE-V6-11-PROMOTION-CANDIDATE.md",
  workflow: ".github/workflows/fardarter-promotion-candidate-v6-11.yml",
  package: "package.json",
};

const routeSources = new Map([
  ["/", "app/page.tsx"],
  ["/github-control-tower-audit", "app/github-control-tower-audit/page.tsx"],
  ["/github-control-tower-audit/operations", "app/github-control-tower-audit/operations/page.tsx"],
  ["/github-control-tower-audit/reconciliation", "app/github-control-tower-audit/reconciliation/page.tsx"],
  ["/github-control-tower-audit/canonicalization-preview", "app/github-control-tower-audit/canonicalization-preview/page.tsx"],
  ["/github-control-tower-audit/canonicalization-application", "app/github-control-tower-audit/canonicalization-application/page.tsx"],
  ["/github-control-tower-audit/successor-readiness", "app/github-control-tower-audit/successor-readiness/page.tsx"],
  ["/github-control-tower-audit/consent-evidence", "app/github-control-tower-audit/consent-evidence/page.tsx"],
  ["/api/revenue/pilot", "app/api/revenue/pilot/route.ts"],
  ["/api/revenue/capacity", "app/api/revenue/capacity/route.ts"],
  ["/api/revenue/operations", "app/api/revenue/operations/route.ts"],
  ["/api/revenue/reconciliation", "app/api/revenue/reconciliation/route.ts"],
  ["/api/revenue/canonicalization-preview", "app/api/revenue/canonicalization-preview/route.ts"],
  ["/api/revenue/canonicalization-application", "app/api/revenue/canonicalization-application/route.ts"],
  ["/api/revenue/successor-readiness", "app/api/revenue/successor-readiness/route.ts"],
  ["/api/revenue/consent-evidence", "app/api/revenue/consent-evidence/route.ts"],
  ["/sitemap.xml", "app/sitemap.ts"],
  ["/robots.txt", "app/robots.ts"],
]);

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

const manifest = parse(text.manifest, "promotion candidate manifest");
const schema = parse(text.schema, "promotion candidate schema");
const lineage = parse(text.lineage, "deployment lineage");
const chain = parse(text.chain, "canonical event chain");
const reconciliation = parse(text.reconciliation, "canonical reconciliation");
const pkg = parse(text.package, "package");

assert(
  manifest.controlId === "FARDARTER-DRIVE-PROMOTION-CANDIDATE-V6-11" &&
    manifest.controllerVersion === "6.11.0" &&
    manifest.controllingIssue === 192,
  "v6.11 identity mismatch",
);
assert(
  digestWithout(manifest, "manifestDigest") === manifest.manifestDigest,
  "v6.11 manifest digest mismatch",
);
assert(
  manifest.manifestDigest === "4c8b682e9d52905f20a8cef8ef4f78d937bfd11f850f27df79498739ff032dad",
  "v6.11 manifest digest lock mismatch",
);
assert(
  schema.properties?.manifestDigest?.const === manifest.manifestDigest &&
    schema.properties?.controlId?.const === manifest.controlId &&
    schema.properties?.controllerVersion?.const === manifest.controllerVersion &&
    schema.properties?.controllingIssue?.const === manifest.controllingIssue &&
    schema.properties?.candidate?.properties?.targetSourceCommit?.const ===
      manifest.candidate.targetSourceCommit,
  "v6.11 schema lock mismatch",
);

assert(
  manifest.candidate.applicationVersion === "6.10.0" &&
    manifest.candidate.targetSourceCommit === "88bd8dc89a0bd95f42c7e1a21dccc56fe9dc7334" &&
    manifest.candidate.candidateState === "PREPARED_NOT_DEPLOYED" &&
    manifest.candidate.latestClaimAllowed === false &&
    manifest.candidate.targetMustRemainAuthorizedAtExecution === true &&
    manifest.candidate.reauthorizationRequiredIfMainMoves === true,
  "v6.11 candidate boundary mismatch",
);
assert(
  manifest.controlPlane.controlArtifactsAreOutOfBandFromTargetSource === true &&
    manifest.controlPlane.controlMergeDoesNotRewriteTargetSource === true,
  "v6.11 control-plane separation mismatch",
);
assert(
  manifest.providerTarget.provider === "NETLIFY" &&
    manifest.providerTarget.siteId === "21d3bb41-3a69-4a7d-b6c6-e873cde8ee2f" &&
    manifest.providerTarget.siteName === "lichburn-v0-2-8" &&
    manifest.providerTarget.newSiteCreationAllowed === false &&
    manifest.providerTarget.providerDeployId === null &&
    manifest.providerTarget.immutableUrl === null,
  "v6.11 provider target mismatch",
);
assert(
  manifest.rollbackAnchor.sourceCommit === "e482004bfff1bb90aba2d67b8da62a524f18cdb4" &&
    manifest.rollbackAnchor.deployId === "6a6b6a709e0a6d5ff2ca7759" &&
    manifest.rollbackAnchor.verificationState === "DEPLOYED_AND_VERIFIED" &&
    manifest.rollbackAnchor.verifiedRouteCount === 12,
  "v6.11 rollback anchor mismatch",
);

const expectedRoutes = [...routeSources.keys()];
assert(
  manifest.routeContract.requiredRouteCount === expectedRoutes.length &&
    manifest.routeContract.routes.length === expectedRoutes.length &&
    manifest.routeContract.routes.every((route, index) => route === expectedRoutes[index]) &&
    new Set(manifest.routeContract.routes).size === expectedRoutes.length,
  "v6.11 route contract mismatch",
);
for (const [route, source] of routeSources) {
  await access(source);
  const sourceText = await readFile(source, "utf8");
  assert(sourceText.trim().length > 0, `v6.11 route source empty: ${route} -> ${source}`);
}
assert(
  manifest.routeContract.allRoutesRequireHttpSuccess === true &&
    manifest.routeContract.allBodiesRequireNonemptyReadback === true &&
    manifest.routeContract.apiBodiesRequireDeterministicValidation === true &&
    manifest.routeContract.sitemapAndRobotsRequired === true,
  "v6.11 route evidence policy mismatch",
);

assert(
  manifest.promotionGate.requiresTargetCommitExistence === true &&
    manifest.promotionGate.requiresTargetStillAuthorizedAtExecution === true &&
    manifest.promotionGate.requiresAllRepositoryVerifiers === true &&
    manifest.promotionGate.requiresProviderDeployId === true &&
    manifest.promotionGate.requiresAuthoritativeImmutableUrl === true &&
    manifest.promotionGate.requiresCompleteRouteReadback === true &&
    manifest.promotionGate.requiresRollbackReference === true &&
    manifest.promotionGate.requiresDurableReceipts === true &&
    manifest.promotionGate.requiresNoPrivateReferenceExposure === true &&
    manifest.promotionGate.requiresHumanApproval === true &&
    manifest.promotionGate.automaticPromotionAllowed === false &&
    manifest.promotionGate.requiredReceiptIssues.join("|") === "192|190|141|133",
  "v6.11 promotion gate mismatch",
);
assert(
  manifest.preflight.reviewedPredecessorPr === 191 &&
    manifest.preflight.reviewedPredecessorMerge === manifest.candidate.targetSourceCommit &&
    manifest.preflight.repositoryOwnedGatesAtPredecessorReview === "PASS" &&
    manifest.preflight.postMergeTargetReverificationRequired === true &&
    manifest.preflight.providerDeployIdAvailable === false &&
    manifest.preflight.immutableUrlAvailable === false &&
    manifest.preflight.completedRouteReadbacks === 0 &&
    manifest.preflight.promotionDecision === "HOLD_FOR_EXACT_DEPLOY_AND_READBACK",
  "v6.11 preflight state mismatch",
);

assert(
  lineage.controllerVersion === "6.10.0" &&
    lineage.verifiedHistoricalDeployment.deployId === manifest.rollbackAnchor.deployId &&
    lineage.verifiedHistoricalDeployment.verificationState === "DEPLOYED_AND_VERIFIED",
  "v6.11 predecessor lineage mismatch",
);
assert(
  chain.headSequence === manifest.canonicalBoundaries.canonicalEventHeadSequence &&
    chain.headDigest === manifest.canonicalBoundaries.canonicalEventHeadDigest &&
    chain.currentCanonicalCounts.SCOPE_DRAFTED === 1 &&
    chain.currentCanonicalCounts.HUMAN_ACCEPTED === 0 &&
    chain.currentCanonicalCounts.ACTIVE === 0,
  "v6.11 canonical head mismatch",
);
assert(
  reconciliation.sequence === manifest.canonicalBoundaries.reconciliationSequence &&
    reconciliation.snapshotDigest === manifest.canonicalBoundaries.reconciliationDigest,
  "v6.11 reconciliation mismatch",
);
assert(
  chain.financialEvidence.orders === 0 &&
    chain.financialEvidence.verifiedGrossRevenueUsd === 0 &&
    chain.financialEvidence.verifiedSettledCashUsd === 0 &&
    chain.financialEvidence.receivedCashRequires === "PAID_SETTLED",
  "v6.11 financial boundary mismatch",
);
assert(
  Object.values(manifest.actualEffects).every((value) => value === false),
  "v6.11 candidate created an actual effect",
);

assert(
  pkg.scripts?.["fardarter:promotion-candidate:check"] ===
    "node scripts/check-fardarter-promotion-candidate-v6-11.mjs" &&
    pkg.scripts?.["revenue:verify"]?.includes("fardarter:promotion-candidate:check"),
  "v6.11 package integration mismatch",
);
for (const required of [
  "PREPARED_NOT_DEPLOYED",
  "HOLD_FOR_EXACT_DEPLOY_AND_READBACK",
  "88bd8dc89a0bd95f42c7e1a21dccc56fe9dc7334",
  "6a6b6a709e0a6d5ff2ca7759",
  "18 required routes",
  "No private Google Drive URL or ID",
  "Human approval remains required",
]) {
  assert(text.docs.includes(required), `v6.11 documentation missing ${required}`);
}
for (const required of [
  "name: Fardarter Promotion Candidate v6.11",
  "permissions:",
  "contents: read",
  "npm run fardarter:promotion-candidate:check",
]) {
  assert(text.workflow.includes(required), `v6.11 workflow missing ${required}`);
}
assert(
  !text.workflow.includes("NETLIFY_AUTH_TOKEN") &&
    !text.workflow.includes("deploy-site") &&
    !text.workflow.includes("issues: write"),
  "v6.11 candidate CI must remain read-only and credential-free",
);

console.log("Fardarter Drive v6.11 promotion candidate: PASS");
console.log(`Target source: ${manifest.candidate.targetSourceCommit}`);
console.log(`Required routes: ${manifest.routeContract.requiredRouteCount}`);
console.log(`Decision: ${manifest.preflight.promotionDecision}`);
