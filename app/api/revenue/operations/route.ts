import capacityLedger from "@/receipts/revenue/FARDARTER-DRIVE-CAPACITY-LEDGER-V6-1.json";
import eventChain from "@/receipts/revenue/FARDARTER-DRIVE-STATE-EVENTS-V6-2.json";
import googleDriveReceipt from "@/receipts/revenue/FARDARTER-DRIVE-GDRIVE-V6.json";
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
      schemaVersion: "1.0.0",
      stateMachineId: stateMachine.stateMachineId,
      chainId: eventChain.chainId,
      driveId: stateMachine.driveId,
      authorityVersion: stateMachine.authorityVersion,
      controllerVersion: stateMachine.controllerVersion,
      controllingIssue: stateMachine.controllingIssue,
      canonicalBaseline: stateMachine.baseline,
      capacity: {
        totalPlanningSlots: capacityLedger.canonicalCapacity.totalPlanningSlots,
        standardActiveCeiling:
          capacityLedger.canonicalCapacity.standardActiveCeiling,
        effectiveActiveCeiling:
          capacityLedger.canonicalCapacity.effectiveActiveCeiling,
        activeDeliveries: capacityLedger.canonicalCapacity.activeDeliveries,
        activeHeadroom:
          capacityLedger.canonicalCapacity.effectiveActiveCeiling -
          capacityLedger.canonicalCapacity.activeDeliveries,
        backpressureActive: false,
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
      },
      evidenceBoundary: {
        publicSignalCreatesCanonicalEvent: false,
        publicStateLabelCreatesOrder: false,
        transitionWorkflowCreatesContract: false,
        transitionWorkflowProvesPayment: false,
        transitionWorkflowStartsPaidWork: false,
        driveFileCreatesContract: false,
        publicCommentProvesPrivateEvidence: false,
        canonicalEventRequiresReviewedMerge: true,
        receivedCashRequires: "PAID_SETTLED",
        activeStateRequiresCapacityHeadroom: true,
        automaticPaidWorkStart: false,
        templateIsIndemnityProof: false,
      },
      nextControlledAction: stateMachine.nextControlledAction,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
      },
    },
  );
}
