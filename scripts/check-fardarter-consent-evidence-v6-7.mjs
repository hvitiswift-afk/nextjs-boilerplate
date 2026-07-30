import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const paths = {
  manifest: "receipts/revenue/FARDARTER-DRIVE-CONSENT-EVIDENCE-V6-7.json",
  manifestSchema: "schemas/revenue/fardarter-drive-consent-evidence-v6-7.schema.json",
  attestation: "receipts/revenue/FARDARTER-DRIVE-CONSENT-ATTESTATION-V6-7.sample.json",
  attestationSchema: "schemas/revenue/fardarter-drive-consent-attestation-v6-7.schema.json",
  chain: "receipts/revenue/FARDARTER-DRIVE-STATE-EVENTS-V6-2.json",
  reconciliation: "receipts/revenue/FARDARTER-DRIVE-RECONCILIATION-V6-5.json",
  gdrive: "receipts/revenue/FARDARTER-DRIVE-GDRIVE-V6.json",
  gdriveSchema: "schemas/revenue/fardarter-drive-gdrive-v6.schema.json",
  lib: "src/lib/revenue/canonical-consent-evidence.ts",
  api: "app/api/revenue/consent-evidence/route.ts",
  page: "app/github-control-tower-audit/consent-evidence/page.tsx",
  template: ".github/ISSUE_TEMPLATE/fardarter-consent-evidence.yml",
  workflow: ".github/workflows/fardarter-consent-evidence-v6-7.yml",
  readback: ".github/workflows/fardarter-consent-evidence-readback-v6-7.yml",
  doc: "docs/repository/FARDARTER-DRIVE-V6-7-CONSENT-EVIDENCE.md",
  package: "package.json",
  sitemap: "app/sitemap.ts",
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

const manifest = parse(text.manifest, "manifest");
const manifestSchema = parse(text.manifestSchema, "manifest schema");
const attestation = parse(text.attestation, "attestation");
const attestationSchema = parse(text.attestationSchema, "attestation schema");
const chain = parse(text.chain, "event chain");
const reconciliation = parse(text.reconciliation, "reconciliation");
const gdrive = parse(text.gdrive, "Drive continuity");
const gdriveSchema = parse(text.gdriveSchema, "Drive schema");
const pkg = parse(text.package, "package");

assert(
  manifest.controlId === "FARDARTER-DRIVE-CONSENT-EVIDENCE-V6-7" &&
    manifest.controllerVersion === "6.7.0" &&
    manifest.controllingIssue === 180,
  "consent manifest identity mismatch",
);
assert(
  digestWithout(manifest, "manifestDigest") === manifest.manifestDigest,
  "consent manifest digest mismatch",
);
assert(
  manifest.manifestDigest === "6d13d80a7034533b0f155a0d522ce8b2afb34586ff9e8ca2f90c0d355bb5c878",
  "consent manifest digest lock mismatch",
);
assert(
  digestWithout(attestation, "attestationReceiptDigest") === attestation.attestationReceiptDigest,
  "attestation receipt digest mismatch",
);
assert(
  attestation.attestationReceiptDigest === "27c8fb452b3b7112d9f714449a232b9416e66718677b8595c0a0eda438078a7d",
  "attestation receipt digest lock mismatch",
);
const publicAttestationObject = {
  attestationId: attestation.attestationId,
  source: attestation.source,
  packageState: attestation.package.state,
  evidenceChecklist: attestation.evidenceChecklist,
  review: attestation.review,
  nextCandidate: attestation.nextCandidate,
};
assert(
  sha256(publicAttestationObject) === attestation.publicSafeAttestation.attestationDigest,
  "public-safe attestation digest mismatch",
);
assert(
  attestation.publicSafeAttestation.attestationDigest ===
    "0026a05117e349524c51e7000adffc773c5be4986149c4636c111306b8dbe7e8",
  "public-safe attestation digest lock mismatch",
);
assert(
  manifestSchema.properties?.manifestDigest?.const === manifest.manifestDigest,
  "manifest schema digest mismatch",
);
assert(
  attestationSchema.properties?.attestationReceiptDigest?.const ===
    attestation.attestationReceiptDigest,
  "attestation schema digest mismatch",
);

assert(
  chain.headSequence === 1 &&
    chain.headDigest === "3859eac9c63bef83624111704d38cf217b0c1a4ece6df874e72a76e9fb1ffc3b",
  "canonical event head mismatch",
);
assert(
  reconciliation.sequence === 1 &&
    reconciliation.snapshotDigest ===
      "9f4f878cc0f8f2ddfa7bbdb594d2b9164064acd8901301404aed57b4065eca0f",
  "canonical reconciliation mismatch",
);
assert(
  manifest.currentCanonical.eventHeadSequence === chain.headSequence &&
    manifest.currentCanonical.eventHeadDigest === chain.headDigest &&
    manifest.currentCanonical.reconciliationSequence === reconciliation.sequence &&
    manifest.currentCanonical.reconciliationDigest === reconciliation.snapshotDigest,
  "consent manifest is stale against canonical heads",
);
assert(
  attestation.source.eventHeadSequence === chain.headSequence &&
    attestation.source.eventHeadDigest === chain.headDigest &&
    attestation.source.reconciliationSequence === reconciliation.sequence &&
    attestation.source.reconciliationDigest === reconciliation.snapshotDigest,
  "attestation is stale against canonical heads",
);
assert(
  chain.currentCanonicalCounts.SCOPE_DRAFTED === 1 &&
    chain.currentCanonicalCounts.HUMAN_ACCEPTED === 0 &&
    chain.currentCanonicalCounts.ACTIVE === 0,
  "canonical state baseline mismatch",
);
assert(
  chain.financialEvidence.orders === 0 &&
    chain.financialEvidence.verifiedGrossRevenueUsd === 0 &&
    chain.financialEvidence.verifiedSettledCashUsd === 0 &&
    chain.financialEvidence.receivedCashRequires === "PAID_SETTLED",
  "canonical financial evidence changed",
);

assert(
  manifest.lifecycle.map((item) => item.state).join("|") ===
    "NO_PACKAGE|PRIVATE_PACKAGE_PREPARED|INDEPENDENTLY_VERIFIED|APPLIED_BY_REVIEWED_MERGE",
  "consent lifecycle mismatch",
);
const expectedEvidence = [
  "COUNTERPARTY_IDENTITY",
  "AUTHORITY_AND_CAPACITY_TO_CONSENT",
  "EXACT_SCOPE_PRESENTED",
  "AFFIRMATIVE_CONSENT_TO_EXACT_SCOPE",
  "CONSENT_TIMESTAMP_AND_CHANNEL",
  "AUTHENTICATION_OR_SIGNATURE_EVIDENCE",
  "REVOCATION_AND_CONTRADICTION_CHECK",
  "EXPIRY_VALIDITY",
  "SOURCE_ENTITY_LINKAGE",
  "INDEPENDENT_REVIEWER_ATTESTATION",
];
assert(
  manifest.requiredEvidence.map((item) => item.evidenceId).join("|") ===
    expectedEvidence.join("|"),
  "required consent evidence mismatch",
);
assert(
  manifest.verificationSeparation.packageAssemblerMaySelfVerify === false &&
    manifest.verificationSeparation.automationMayVerifyStructureAndHashes === true &&
    manifest.verificationSeparation.automationMayDecideHumanConsent === false &&
    manifest.verificationSeparation.independentHumanOrApprovedVerificationRequired === true,
  "verification separation mismatch",
);
assert(
  manifest.decision.packageState === "NO_PACKAGE" &&
    manifest.decision.decision === "AWAITING_COUNTERPARTY_EVIDENCE" &&
    manifest.decision.eligibleForApplicationReview === false &&
    manifest.decision.canonicalEventAppended === false,
  "baseline consent decision mismatch",
);
assert(
  manifest.decision.nextCandidateEventSequence === chain.headSequence + 1 &&
    manifest.decision.nextCandidatePreviousDigest === chain.headDigest &&
    manifest.decision.nextCandidateReconciliationSequence === reconciliation.sequence + 1 &&
    manifest.decision.nextCandidatePreviousSnapshotDigest === reconciliation.snapshotDigest,
  "dynamic consent candidate linkage mismatch",
);
assert(
  attestation.package.state === "NO_PACKAGE" &&
    attestation.review.decision === "AWAITING_COUNTERPARTY_EVIDENCE" &&
    attestation.review.independentVerificationPerformed === false &&
    attestation.review.eligibleForHumanApplicationReview === false,
  "attestation baseline mismatch",
);
assert(
  attestation.evidenceChecklist.filter((item) => item.state === "VERIFIED").length === 1 &&
    attestation.evidenceChecklist.find((item) => item.evidenceId === "SOURCE_ENTITY_LINKAGE")?.state ===
      "VERIFIED",
  "unexpected verified private evidence",
);
assert(
  Object.values(manifest.actualEffects).every((value) => value === false) &&
    Object.values(attestation.actualEffects).every((value) => value === false),
  "consent evidence created an actual effect",
);
assert(
  manifest.evidenceBoundaries.systemAuthorizationEqualsBuyerConsent === false &&
    manifest.evidenceBoundaries.attestationDigestAloneCreatesConsent === false &&
    manifest.evidenceBoundaries.verifiedPackageCreatesCanonicalEvent === false &&
    manifest.evidenceBoundaries.automaticApplication === false &&
    manifest.evidenceBoundaries.reviewedMergeRequired === true,
  "consent evidence boundary mismatch",
);

for (const title of [
  "Fardarter Drive™ v6.7 — Counterparty Consent Evidence Charter",
  "Fardarter Drive™ v6.7 — Counterparty Consent Intake Register",
]) {
  assert(gdrive.documents.some((document) => document.title === title), `Drive receipt missing ${title}`);
}
assert(gdrive.documents.length >= 15, "Drive continuity must contain at least 15 private documents");
assert(
  gdrive.automation.maintainCounterpartyConsentEvidence === true &&
    gdrive.automation.maintainConsentAttestationReceipts === true &&
    gdrive.automation.verifyConsentWithoutIndependentReview === false &&
    gdrive.automation.applyHumanAcceptedWithoutVerifiedConsent === false,
  "Drive consent automation boundary mismatch",
);
assert(
  gdrive.privacyBoundary.counterpartyIdentityEvidencePublic === false &&
    gdrive.privacyBoundary.consentTextPublic === false &&
    gdrive.privacyBoundary.authenticationEvidencePublic === false &&
    gdrive.privacyBoundary.consentAttestationPrivateEvidencePublic === false &&
    gdrive.privacyBoundary.reviewerIdentityPublic === false,
  "Drive consent privacy mismatch",
);
assert(gdriveSchema.properties?.documents?.minItems === 15, "Drive schema document minimum mismatch");

for (const required of [
  "eventChain.headSequence",
  "reconciliation.sequence",
  "missingRequiredEvidence",
  "publicClaimCanCreateConsent: false",
  "attestationDigestAloneProvesConsent: false",
  "automaticApplication: false",
]) {
  assert(text.lib.includes(required), `canonical consent resolver missing ${required}`);
}
for (const required of [
  "manifestDigest",
  "publicSafeAttestationDigest",
  "requiredEvidence",
  "actualEffects",
  "publicReferencesExposed: false",
]) {
  assert(text.api.includes(required), `consent API missing ${required}`);
}
for (const required of [
  "Counterparty consent evidence attestation",
  "AWAITING_COUNTERPARTY_EVIDENCE",
  "System-development authorization is not buyer consent",
  "HUMAN_ACCEPTED 0",
  "digest alone does not prove consent",
]) {
  assert(text.page.includes(required), `consent dashboard missing ${required}`);
}
for (const required of [
  "[FD consent evidence]:",
  "Claimed private package state",
  "Public-safe attestation digest",
  "system-development authorization is not buyer consent",
]) {
  assert(text.template.includes(required), `consent issue form missing ${required}`);
}
for (const required of [
  "match(/#?(\\d+)/)",
  "AWAITING_COUNTERPARTY_EVIDENCE",
  "AWAITING_INDEPENDENT_VERIFICATION",
  "PRIVATE_ATTESTATION_REVIEW_REQUIRED",
  "BLOCKED_APPLICATION_CLAIM_REQUIRES_CANONICAL_EVENT",
  "Canonical event appended: **NO**",
  "contents: read",
  "issues: write",
]) {
  assert(text.workflow.includes(required), `consent workflow missing ${required}`);
}
assert(!text.workflow.includes("contents: write"), "consent workflow must not write canonical source");
assert(
  pkg.scripts["fardarter:consent:check"] ===
    "node scripts/check-fardarter-consent-evidence-v6-7.mjs",
  "consent verifier script missing",
);
assert(pkg.scripts["revenue:verify"].includes("fardarter:consent:check"), "unified revenue verifier omits consent check");
assert(
  text.readback.includes("/api/revenue/consent-evidence") &&
    text.readback.includes("/github-control-tower-audit/consent-evidence"),
  "consent immutable readback routes missing",
);
assert(text.sitemap.includes("/github-control-tower-audit/consent-evidence"), "sitemap consent route missing");
assert(
  text.doc.includes(manifest.manifestDigest) &&
    text.doc.includes(attestation.publicSafeAttestation.attestationDigest) &&
    text.doc.includes(attestation.attestationReceiptDigest),
  "operating document digest receipt missing",
);

const rawUrl = /https?:\/\/(?:drive\.google\.com|docs\.google\.com)/i;
for (const [name, value] of [
  ["manifest", text.manifest],
  ["attestation", text.attestation],
  ["api", text.api],
  ["page", text.page],
  ["workflow", text.workflow],
]) {
  assert(!rawUrl.test(value), `${name} exposes a private Drive reference`);
}
const actualIdentity = /(?:buyer|customer|counterparty)(?:Name|Email|Phone)\s*[:=]\s*["'`][^"'`\n]+/i;
for (const [name, value] of [
  ["manifest", text.manifest],
  ["attestation", text.attestation],
  ["api", text.api],
]) {
  assert(!actualIdentity.test(value), `${name} embeds counterparty identity`);
}

console.log("Fardarter Drive v6.7 counterparty consent evidence: PASS");
console.log(`Manifest: ${manifest.manifestDigest}`);
console.log(`Public attestation: ${attestation.publicSafeAttestation.attestationDigest}`);
console.log(`Decision: ${attestation.review.decision}; actual HUMAN_ACCEPTED/orders/ACTIVE/gross/settled remain 0/0/0/$0/$0`);
