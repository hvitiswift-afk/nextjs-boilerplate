import application from "@/receipts/revenue/FARDARTER-DRIVE-CANONICALIZATION-APPLICATION-V6-5.json";
import capacityLedger from "@/receipts/revenue/FARDARTER-DRIVE-CAPACITY-LEDGER-V6-1.json";
import eventChain from "@/receipts/revenue/FARDARTER-DRIVE-STATE-EVENTS-V6-2.json";
import googleDriveReceipt from "@/receipts/revenue/FARDARTER-DRIVE-GDRIVE-V6.json";
import reconciliation from "@/receipts/revenue/FARDARTER-DRIVE-RECONCILIATION-V6-5.json";
import stateMachine from "@/receipts/revenue/FARDARTER-DRIVE-STATE-MACHINE-V6-2.json";
import { getPublicStateLedger } from "@/lib/revenue/public-state-ledger";

type EventLink = {
  sequence: number;
  eventDigest: string;
  previousEventDigest: string | null;
};

export const dynamic = "force-static";
export const revalidate = 900;

export async function GET() {
  const publicSignals = await getPublicStateLedger();
  const events = eventChain.events as EventLink[];
  const digestChainConnected = events.every((event, index) =>
    index === 0
      ? event.previousEventDigest === null
      : event.previousEventDigest === events[index - 1]?.eventDigest,
  );
  const headMatches =
    eventChain.headSequence === events.at(-1)?.sequence &&
    eventChain.headDigest === events.at(-1)?.eventDigest;

  return Response.json(
    {
      schemaVersion: "1.1.0",
      stateMachineId: stateMachine.stateMachineId,
      chainId: eventChain.chainId,
      driveId: stateMachine.driveId,
      authorityVersion: stateMachine.authorityVersion,
      stateControllerVersion: stateMachine.controllerVersion,
      applicationControllerVersion: application.controllerVersion,
      controllingIssues: {
        stateMachine: stateMachine.controllingIssue,
        canonicalApplication: application.controllingIssues,
      },
      planningBaseline: stateMachine.baseline,
      capacity: {
        totalPlanningSlots: capacityLedger.canonicalCapacity.totalPlanningSlots,
        standardActiveCeiling:
          capacityLedger.canonicalCapacity.standardActiveCeiling,
        effectiveActiveCeiling:
          capacityLedger.canonicalCapacity.effectiveActiveCeiling,
        activeDeliveries: capacityLedger.canonicalCapacity.activeDeliveries,
        activeHeadroom: capacityLedger.arithmetic.effectiveActiveHeadroom,
        backpressureActive: capacityLedger.arithmetic.backpressureActive,
        overrideState: capacityLedger.canonicalCapacity.overrideState,
      },
      receiptChain: {
        digestAlgorithm: eventChain.digestAlgorithm,
        canonicalization: eventChain.canonicalization,
        appendOnly: eventChain.appendOnly,
        eventCount: eventChain.eventCount,
        canonicalBusinessEventCount: eventChain.canonicalBusinessEventCount,
        headSequence: eventChain.headSequence,
        headDigest: eventChain.headDigest,
        digestChainConnected,
        headMatches,
        genesisOnly: eventChain.canonicalBusinessEventCount === 0,
        currentStage: "SEQUENCE_1_APPLIED",
      },
      currentApplication: {
        id: application.applicationId,
        digest: application.applicationDigest,
        decision: application.review.decision,
        source: application.source,
        canonicalEvent: application.canonicalEvent,
        reconciliation: application.reconciliation,
        effects: application.effects,
        evidenceBoundary: application.evidenceBoundary,
      },
      currentReconciliation: {
        id: reconciliation.snapshotId,
        sequence: reconciliation.sequence,
        digest: reconciliation.snapshotDigest,
        previousSnapshotDigest: reconciliation.previousSnapshotDigest,
        application: reconciliation.application,
      },
      canonicalCounts: eventChain.currentCanonicalCounts,
      stateDefinitions: stateMachine.states,
      allowedTransitions: stateMachine.allowedTransitions,
      automatedPublicTransitions: stateMachine.automatedPublicTransitions,
      publicSignals,
      conflictPolicy: stateMachine.conflictPolicy,
      commercialEvidence: eventChain.financialEvidence,
      googleDriveContinuity: {
        state: googleDriveReceipt.state,
        folderTitle: googleDriveReceipt.folderTitle,
        documentTitles: googleDriveReceipt.documents.map(
          (document) => document.title,
        ),
        publicFolderUrlExposed: googleDriveReceipt.publicFolderUrlExposed,
        publicFileIdsExposed: googleDriveReceipt.publicFileIdsExposed,
        receiptMeshMaintained:
          googleDriveReceipt.automation.maintainAppendOnlyReceiptMesh,
        conflictRegisterMaintained:
          googleDriveReceipt.automation.maintainTransitionConflictRegister,
        canonicalApplicationsMaintained:
          googleDriveReceipt.automation.maintainCanonicalEventApplications,
      },
      evidenceBoundary: {
        publicSignalCreatesCanonicalEvent: false,
        publicStateLabelCreatesOrder: false,
        transitionWorkflowCreatesContract: false,
        transitionWorkflowProvesPayment: false,
        transitionWorkflowStartsPaidWork: false,
        reviewedApplicationCreatedOrder: false,
        reviewedApplicationProvedPayment: false,
        reviewedApplicationStartedPaidWork: false,
        driveFileCreatesContract: false,
        publicCommentProvesPrivateEvidence: false,
        laterStateChangeRequiresNewAppendOnlyEvent: true,
        receivedCashRequires: "PAID_SETTLED",
        activeStateRequiresCapacityHeadroom: true,
        automaticPaidWorkStart: false,
        templateIsIndemnityProof: false,
      },
      deployment: reconciliation.deployment,
      nextControlledAction:
        "Preserve sequence 1 and reconcile any later change through a new reviewed append-only event.",
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
      },
    },
  );
}
