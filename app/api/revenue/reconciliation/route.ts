import capacityLedger from "@/receipts/revenue/FARDARTER-DRIVE-CAPACITY-LEDGER-V6-1.json";
import proposalLedger from "@/receipts/revenue/FARDARTER-DRIVE-EVENT-PROPOSALS-V6-3.json";
import googleDriveReceipt from "@/receipts/revenue/FARDARTER-DRIVE-GDRIVE-V6.json";
import reconciliation from "@/receipts/revenue/FARDARTER-DRIVE-RECONCILIATION-V6-3.json";
import eventChain from "@/receipts/revenue/FARDARTER-DRIVE-STATE-EVENTS-V6-2.json";
import stateMachine from "@/receipts/revenue/FARDARTER-DRIVE-STATE-MACHINE-V6-2.json";
import { getPublicReconciliationSignals } from "@/lib/revenue/public-reconciliation-ledger";
import { getPublicStateLedger } from "@/lib/revenue/public-state-ledger";

export const dynamic = "force-static";
export const revalidate = 900;

export async function GET() {
  const [publicStates, publicProposals] = await Promise.all([
    getPublicStateLedger(),
    getPublicReconciliationSignals(),
  ]);
  const canonicalHeadHealthy =
    eventChain.eventCount === eventChain.events.length &&
    eventChain.headSequence === eventChain.events.at(-1)?.sequence &&
    eventChain.headDigest === eventChain.events.at(-1)?.eventDigest &&
    eventChain.canonicalBusinessEventCount === 0;

  return Response.json(
    {
      schemaVersion: "1.0.0",
      controllerVersion: reconciliation.controllerVersion,
      controllingIssue: reconciliation.controllingIssue,
      snapshot: {
        id: reconciliation.snapshotId,
        sequence: reconciliation.sequence,
        previousSnapshotDigest: reconciliation.previousSnapshotDigest,
        digest: reconciliation.snapshotDigest,
        reviewStatus: reconciliation.reviewStatus,
        generatedAt: reconciliation.generatedAt,
      },
      canonicalHead: {
        stateMachineId: stateMachine.stateMachineId,
        eventChainId: eventChain.chainId,
        sequence: eventChain.headSequence,
        digest: eventChain.headDigest,
        eventCount: eventChain.eventCount,
        canonicalBusinessEventCount: eventChain.canonicalBusinessEventCount,
        healthy: canonicalHeadHealthy,
        genesisOnly: eventChain.canonicalBusinessEventCount === 0,
      },
      capacity: {
        totalPlanningSlots: capacityLedger.canonicalCapacity.totalPlanningSlots,
        effectiveActiveCeiling:
          capacityLedger.canonicalCapacity.effectiveActiveCeiling,
        activeDeliveries: capacityLedger.canonicalCapacity.activeDeliveries,
        activeHeadroom: capacityLedger.arithmetic.effectiveActiveHeadroom,
        overrideState: capacityLedger.canonicalCapacity.overrideState,
        backpressureActive: capacityLedger.arithmetic.backpressureActive,
      },
      proposalLedger: {
        id: proposalLedger.proposalLedgerId,
        digest: proposalLedger.ledgerDigest,
        lifecycle: proposalLedger.lifecycle,
        proposalCount: proposalLedger.proposalCount,
        decisionCounts: proposalLedger.decisionCounts,
        quarantinePolicy: proposalLedger.quarantinePolicy,
      },
      publicSignals: {
        states: publicStates,
        proposals: publicProposals,
        createCanonicalEvents: false,
        createCommercialEvidence: false,
      },
      canonicalCounts: eventChain.currentCanonicalCounts,
      conflicts: reconciliation.conflicts,
      commercialEvidence: {
        orders: capacityLedger.canonicalCapacity.orders,
        verifiedGrossRevenueUsd:
          capacityLedger.financialEvidence.verifiedGrossRevenueUsd,
        verifiedSettledCashUsd:
          capacityLedger.financialEvidence.verifiedSettledCashUsd,
        settlementState: capacityLedger.financialEvidence.settlementState,
        receivedCashRequires:
          capacityLedger.financialEvidence.receivedCashRequires,
      },
      deployment: reconciliation.deployment,
      googleDriveContinuity: {
        state: googleDriveReceipt.state,
        folderTitle: googleDriveReceipt.folderTitle,
        documentTitles: googleDriveReceipt.documents.map(
          (document) => document.title,
        ),
        publicFolderUrlExposed: googleDriveReceipt.publicFolderUrlExposed,
        publicFileIdsExposed: googleDriveReceipt.publicFileIdsExposed,
        proposalReconciliationMaintained:
          googleDriveReceipt.automation.maintainProposalReconciliation,
        quarantineRegisterMaintained:
          googleDriveReceipt.automation.maintainProposalQuarantineRegister,
      },
      reconciliationPolicy: {
        proposalMayBecomeCanonicalAutomatically: false,
        canonicalEventRequiresReviewedMerge: true,
        snapshotUsesSha256: true,
        snapshotLinksToPreviousDigest: true,
        quarantineFreezesCanonicalMutation: true,
        quarantineIsReversible: true,
      },
      evidenceBoundary: {
        proposalIsCanonicalEvent: false,
        readyForReviewCreatesOrder: false,
        readyForReviewCreatesContract: false,
        readyForReviewProvesPayment: false,
        readyForReviewStartsPaidWork: false,
        publicSignalProvesPrivateEvidence: false,
        pendingTransferEqualsSettledCash: false,
        receivedCashRequires: "PAID_SETTLED",
        driveFileCreatesContract: false,
        automaticPaidWorkStart: false,
        templateIsIndemnityProof: false,
      },
      nextControlledAction: proposalLedger.nextControlledAction,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
      },
    },
  );
}
