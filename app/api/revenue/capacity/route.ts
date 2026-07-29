import capacityLedger from "@/receipts/revenue/FARDARTER-DRIVE-CAPACITY-LEDGER-V6-1.json";
import overrideBaseline from "@/receipts/revenue/FARDARTER-DRIVE-CAPACITY-OVERRIDE-V6.sample.json";
import { getPublicCapacityCounts } from "@/lib/revenue/public-capacity-ledger";

export const dynamic = "force-static";
export const revalidate = 900;

export async function GET() {
  const publicCounts = await getPublicCapacityCounts();
  const capacity = capacityLedger.canonicalCapacity;
  const slotsRemaining = Math.max(capacity.totalPlanningSlots - capacity.orders, 0);
  const standardActiveHeadroom = Math.max(
    capacity.standardActiveCeiling - capacity.activeDeliveries,
    0,
  );
  const effectiveActiveHeadroom = Math.max(
    capacity.effectiveActiveCeiling - capacity.activeDeliveries,
    0,
  );

  return Response.json(
    {
      schemaVersion: "1.0.0",
      ledgerId: capacityLedger.ledgerId,
      driveId: capacityLedger.driveId,
      authorityVersion: capacityLedger.authorityVersion,
      controllingIssue: capacityLedger.controllingIssue,
      canonical: {
        totalPlanningSlots: capacity.totalPlanningSlots,
        slotsRemaining,
        standardActiveCeiling: capacity.standardActiveCeiling,
        effectiveActiveCeiling: capacity.effectiveActiveCeiling,
        activeDeliveries: capacity.activeDeliveries,
        standardActiveHeadroom,
        effectiveActiveHeadroom,
        above100Allowed: capacity.above100Allowed,
        overrideState: capacity.overrideState,
        backpressureActive:
          capacity.activeDeliveries >= capacity.effectiveActiveCeiling,
      },
      publicCounts,
      commercialEvidence: {
        orders: capacity.orders,
        verifiedGrossRevenueUsd:
          capacityLedger.financialEvidence.verifiedGrossRevenueUsd,
        verifiedSettledCashUsd:
          capacityLedger.financialEvidence.verifiedSettledCashUsd,
        settlementState: capacityLedger.financialEvidence.settlementState,
        receivedCashRequires:
          capacityLedger.financialEvidence.receivedCashRequires,
      },
      overrideRail: {
        currentState: overrideBaseline.state,
        requestedActiveCeiling: overrideBaseline.requestedActiveCeiling,
        approvedActiveCeiling: overrideBaseline.approvedActiveCeiling,
        requestMayReturnApprovedNotActive:
          capacityLedger.overrideBoundary.requestMayReturnApprovedNotActive,
        requestChangesEffectiveCeiling:
          capacityLedger.overrideBoundary.requestChangesEffectiveCeiling,
        workflowApprovalChangesEffectiveCeiling:
          capacityLedger.overrideBoundary.workflowApprovalChangesEffectiveCeiling,
        activeOverrideRequiresCompletePrivateEvidence:
          capacityLedger.overrideBoundary
            .activeOverrideRequiresCompletePrivateEvidence,
        activeOverrideRequiresJpAuthorization:
          capacityLedger.overrideBoundary.activeOverrideRequiresJpAuthorization,
        activeOverrideRequiresCanonicalMerge:
          capacityLedger.overrideBoundary.activeOverrideRequiresCanonicalMerge,
        activeOverrideRequiresReadback:
          capacityLedger.overrideBoundary.activeOverrideRequiresReadback,
      },
      stateLedger: capacityLedger.stateLedger,
      googleDriveContinuity: capacityLedger.googleDriveContinuity,
      evidenceBoundary: {
        publicCountsCreateOrders: false,
        publicCountsReserveCapacity: false,
        publicCountsProvePrivateEvidence: false,
        overrideRequestActivatesCapacity: false,
        approvedNotActiveActivatesCapacity: false,
        driveFileCreatesContract: false,
        driveFileProvesPayment: false,
        capacityEqualsDemand: false,
        capacityEqualsCustomers: false,
        capacityEqualsRevenue: false,
        futureOutcomesGuaranteed: false,
      },
      nextControlledAction: capacityLedger.nextControlledAction,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
      },
    },
  );
}
