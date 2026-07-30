import application from "@/receipts/revenue/FARDARTER-DRIVE-CANONICALIZATION-APPLICATION-V6-5.json";
import capacityLedger from "@/receipts/revenue/FARDARTER-DRIVE-CAPACITY-LEDGER-V6-1.json";
import eventChain from "@/receipts/revenue/FARDARTER-DRIVE-STATE-EVENTS-V6-2.json";
import googleDriveReceipt from "@/receipts/revenue/FARDARTER-DRIVE-GDRIVE-V6.json";
import reconciliation from "@/receipts/revenue/FARDARTER-DRIVE-RECONCILIATION-V6-5.json";

export const dynamic = "force-static";
export const revalidate = 900;

export async function GET() {
  const head = eventChain.events.at(-1);
  const chainHealthy =
    eventChain.eventCount === eventChain.events.length &&
    eventChain.headSequence === head?.sequence &&
    eventChain.headDigest === head?.eventDigest &&
    eventChain.canonicalBusinessEventCount === 1;

  return Response.json(
    {
      schemaVersion: "1.0.0",
      controllerVersion: application.controllerVersion,
      applicationId: application.applicationId,
      applicationDigest: application.applicationDigest,
      controllingIssues: application.controllingIssues,
      source: application.source,
      review: application.review,
      canonicalEvent: application.canonicalEvent,
      reconciliation: application.reconciliation,
      previewEvidence: application.previewEvidence,
      effects: application.effects,
      evidenceBoundary: application.evidenceBoundary,
      currentCanonicalState: {
        chainId: eventChain.chainId,
        headSequence: eventChain.headSequence,
        headDigest: eventChain.headDigest,
        eventCount: eventChain.eventCount,
        canonicalBusinessEventCount: eventChain.canonicalBusinessEventCount,
        chainHealthy,
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
      currentReconciliation: {
        id: reconciliation.snapshotId,
        sequence: reconciliation.sequence,
        previousSnapshotDigest: reconciliation.previousSnapshotDigest,
        digest: reconciliation.snapshotDigest,
        conflicts: reconciliation.conflicts,
        deployment: reconciliation.deployment,
      },
      googleDriveContinuity: {
        state: googleDriveReceipt.state,
        documentTitles: application.googleDriveContinuity.documentTitles,
        publicReferencesExposed:
          application.googleDriveContinuity.publicReferencesExposed,
        canonicalApplicationsMaintained:
          googleDriveReceipt.automation.maintainCanonicalEventApplications,
      },
      appendOnlyPolicy: {
        genesisImmutable: true,
        currentEventImmutable: true,
        correctionRequiresNewEvent: true,
        automaticApplication: false,
        reviewedMergeRequired: true,
        deploymentReadbackRequiredForPublicLiveClaim: true,
      },
      deployment: reconciliation.deployment,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
      },
    },
  );
}
