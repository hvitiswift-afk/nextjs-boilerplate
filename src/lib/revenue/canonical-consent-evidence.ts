import consentManifest from "../../../receipts/revenue/FARDARTER-DRIVE-CONSENT-EVIDENCE-V6-7.json";
import consentAttestation from "../../../receipts/revenue/FARDARTER-DRIVE-CONSENT-ATTESTATION-V6-7.sample.json";
import eventChain from "../../../receipts/revenue/FARDARTER-DRIVE-STATE-EVENTS-V6-2.json";
import reconciliation from "../../../receipts/revenue/FARDARTER-DRIVE-RECONCILIATION-V6-5.json";

export function getCanonicalConsentEvidence() {
  const matchesCanonicalHead =
    consentManifest.currentCanonical.eventHeadSequence === eventChain.headSequence &&
    consentManifest.currentCanonical.eventHeadDigest === eventChain.headDigest &&
    consentManifest.currentCanonical.reconciliationSequence === reconciliation.sequence &&
    consentManifest.currentCanonical.reconciliationDigest === reconciliation.snapshotDigest;

  const attestationMatchesHead =
    consentAttestation.source.eventHeadSequence === eventChain.headSequence &&
    consentAttestation.source.eventHeadDigest === eventChain.headDigest &&
    consentAttestation.source.reconciliationSequence === reconciliation.sequence &&
    consentAttestation.source.reconciliationDigest === reconciliation.snapshotDigest;

  const missingRequiredEvidence = consentAttestation.evidenceChecklist
    .filter((item) => item.state !== "VERIFIED")
    .map((item) => item.evidenceId);

  return {
    manifest: consentManifest,
    attestation: consentAttestation,
    canonical: {
      eventHeadSequence: eventChain.headSequence,
      eventHeadDigest: eventChain.headDigest,
      reconciliationSequence: reconciliation.sequence,
      reconciliationDigest: reconciliation.snapshotDigest,
      humanAcceptedCount: eventChain.currentCanonicalCounts.HUMAN_ACCEPTED,
      activeDeliveries: eventChain.capacityEvidence.activeDeliveries,
      activeHeadroom: eventChain.capacityEvidence.activeHeadroom,
      orders: eventChain.financialEvidence.orders,
      verifiedGrossRevenueUsd: eventChain.financialEvidence.verifiedGrossRevenueUsd,
      verifiedSettledCashUsd: eventChain.financialEvidence.verifiedSettledCashUsd,
      receivedCashRequires: eventChain.financialEvidence.receivedCashRequires,
    },
    derived: {
      matchesCanonicalHead,
      attestationMatchesHead,
      missingRequiredEvidence,
      allRequiredEvidenceVerified: missingRequiredEvidence.length === 0,
      packageState: consentAttestation.package.state,
      decision: consentAttestation.review.decision,
      eligibleForHumanApplicationReview:
        consentAttestation.review.eligibleForHumanApplicationReview &&
        missingRequiredEvidence.length === 0 &&
        matchesCanonicalHead &&
        attestationMatchesHead,
      publicClaimCanCreateConsent: false,
      attestationDigestAloneProvesConsent: false,
      automaticApplication: false,
      reviewedMergeRequired: true,
    },
  };
}
