import previewLedger from "@/receipts/revenue/FARDARTER-DRIVE-CANONICALIZATION-PREVIEWS-V6-4.json";
import reviewBundle from "@/receipts/revenue/FARDARTER-DRIVE-CANONICALIZATION-REVIEW-BUNDLE-V6-4.sample.json";
import capacityLedger from "@/receipts/revenue/FARDARTER-DRIVE-CAPACITY-LEDGER-V6-1.json";
import proposalLedger from "@/receipts/revenue/FARDARTER-DRIVE-EVENT-PROPOSALS-V6-3.json";
import googleDriveReceipt from "@/receipts/revenue/FARDARTER-DRIVE-GDRIVE-V6.json";
import reconciliation from "@/receipts/revenue/FARDARTER-DRIVE-RECONCILIATION-V6-3.json";
import eventChain from "@/receipts/revenue/FARDARTER-DRIVE-STATE-EVENTS-V6-2.json";
import { getPublicCanonicalizationPreviewCounts } from "@/lib/revenue/public-canonicalization-preview";

export const dynamic = "force-static";
export const revalidate = 900;

export async function GET() {
  const publicCounts = await getPublicCanonicalizationPreviewCounts();
  const canonicalHeadHealthy =
    eventChain.eventCount === eventChain.events.length &&
    eventChain.headSequence === eventChain.events.at(-1)?.sequence &&
    eventChain.headDigest === eventChain.events.at(-1)?.eventDigest &&
    eventChain.canonicalBusinessEventCount === 0;

  return Response.json(
    {
      schemaVersion: "1.0.0",
      controllerVersion: previewLedger.controllerVersion,
      controllingIssue: previewLedger.controllingIssue,
      previewLedger: {
        id: previewLedger.previewLedgerId,
        digest: previewLedger.ledgerDigest,
        lifecycle: previewLedger.lifecycle,
        previewCount: previewLedger.previewCount,
        decisionCounts: previewLedger.decisionCounts,
        applicationPolicy: previewLedger.applicationPolicy,
      },
      preparedReviewBundle: {
        id: reviewBundle.bundleId,
        state: reviewBundle.state,
        expectedDecision: reviewBundle.expectedDecision,
        digest: reviewBundle.bundleDigest,
        source: reviewBundle.source,
        candidateEvent: {
          id: reviewBundle.candidateEvent.eventId,
          sequence: reviewBundle.candidateEvent.sequence,
          type: reviewBundle.candidateEvent.eventType,
          idempotencyKey: reviewBundle.candidateEvent.idempotencyKey,
          sourcePublicState: reviewBundle.candidateEvent.sourcePublicState,
          fromState: reviewBundle.candidateEvent.fromState,
          toState: reviewBundle.candidateEvent.toState,
          previousEventDigest: reviewBundle.candidateEvent.previousEventDigest,
          digest: reviewBundle.candidateEvent.eventDigest,
          capacityEffect: reviewBundle.candidateEvent.capacityEffect,
          financialEffect: reviewBundle.candidateEvent.financialEffect,
          canonical: reviewBundle.candidateEvent.canonical,
          applied: reviewBundle.candidateEvent.applied,
        },
        candidateProjection: reviewBundle.candidateProjection,
        evidenceMatrixRows: reviewBundle.evidenceMatrix.length,
        authorityMatrixRows: reviewBundle.authorityMatrix.length,
        review: reviewBundle.review,
        candidateReconciliation: {
          id: reviewBundle.candidateReconciliation.snapshotId,
          sequence: reviewBundle.candidateReconciliation.sequence,
          previousSnapshotDigest:
            reviewBundle.candidateReconciliation.previousSnapshotDigest,
          digest: reviewBundle.candidateReconciliation.snapshotDigest,
          reviewStatus: reviewBundle.candidateReconciliation.reviewStatus,
          sourceEvent: reviewBundle.candidateReconciliation.sourceEvent,
          canonicalProjection:
            reviewBundle.candidateReconciliation.canonicalProjection,
        },
      },
      canonicalCurrentState: {
        eventChainId: eventChain.chainId,
        headSequence: eventChain.headSequence,
        headDigest: eventChain.headDigest,
        eventCount: eventChain.eventCount,
        canonicalBusinessEventCount: eventChain.canonicalBusinessEventCount,
        healthy: canonicalHeadHealthy,
        genesisOnly: eventChain.canonicalBusinessEventCount === 0,
        stateCounts: eventChain.currentCanonicalCounts,
        totalPlanningSlots: capacityLedger.canonicalCapacity.totalPlanningSlots,
        effectiveActiveCeiling:
          capacityLedger.canonicalCapacity.effectiveActiveCeiling,
        activeDeliveries: capacityLedger.canonicalCapacity.activeDeliveries,
        activeHeadroom: capacityLedger.arithmetic.effectiveActiveHeadroom,
        orders: capacityLedger.canonicalCapacity.orders,
        verifiedGrossRevenueUsd:
          capacityLedger.financialEvidence.verifiedGrossRevenueUsd,
        verifiedSettledCashUsd:
          capacityLedger.financialEvidence.verifiedSettledCashUsd,
        settlementState: capacityLedger.financialEvidence.settlementState,
        receivedCashRequires:
          capacityLedger.financialEvidence.receivedCashRequires,
        overrideState: capacityLedger.canonicalCapacity.overrideState,
      },
      sourceDigests: {
        proposalLedger: proposalLedger.ledgerDigest,
        reconciliation: reconciliation.snapshotDigest,
        canonicalEventHead: eventChain.headDigest,
        preparedCandidateEvent: reviewBundle.candidateEvent.eventDigest,
        preparedCandidateSnapshot:
          reviewBundle.candidateReconciliation.snapshotDigest,
        preparedReviewBundle: reviewBundle.bundleDigest,
        previewLedger: previewLedger.ledgerDigest,
      },
      publicCounts,
      googleDriveContinuity: {
        state: googleDriveReceipt.state,
        folderTitle: googleDriveReceipt.folderTitle,
        documentTitles: googleDriveReceipt.documents.map(
          (document) => document.title,
        ),
        publicFolderUrlExposed: googleDriveReceipt.publicFolderUrlExposed,
        publicFileIdsExposed: googleDriveReceipt.publicFileIdsExposed,
        canonicalizationPreviewsMaintained:
          googleDriveReceipt.automation.maintainCanonicalizationPreviews,
        reviewBundlesMaintained:
          googleDriveReceipt.automation.maintainCanonicalizationReviewBundles,
        automaticCanonicalEventApplication:
          googleDriveReceipt.automation.applyCanonicalEventWithoutReviewedMerge,
      },
      evidenceBoundary: {
        preparedBundleIsCanonical: false,
        publicPreviewReceiptIsCanonical: false,
        previewCreatesOrder: false,
        previewCreatesContract: false,
        previewProvesPayment: false,
        previewStartsPaidWork: false,
        previewConsumesActiveCapacity: false,
        previewActivatesCapacityOverride: false,
        applicationRequiresReviewedMerge: true,
        applicationRequiresRecomputedDigests: true,
        applicationRequiresReconciledCountsCapacityMoney: true,
        receivedCashRequires: "PAID_SETTLED",
        driveFileCreatesContract: false,
        templateIsIndemnityProof: false,
      },
      nextControlledAction: previewLedger.nextControlledAction,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
      },
    },
  );
}
