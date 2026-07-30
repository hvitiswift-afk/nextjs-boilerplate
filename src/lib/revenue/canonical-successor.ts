import capacityLedger from "@/receipts/revenue/FARDARTER-DRIVE-CAPACITY-LEDGER-V6-1.json";
import application from "@/receipts/revenue/FARDARTER-DRIVE-CANONICALIZATION-APPLICATION-V6-5.json";
import reconciliation from "@/receipts/revenue/FARDARTER-DRIVE-RECONCILIATION-V6-5.json";
import eventChain from "@/receipts/revenue/FARDARTER-DRIVE-STATE-EVENTS-V6-2.json";

export function getCanonicalSuccessorState() {
  const head = eventChain.events.at(-1);
  if (!head) throw new Error("Canonical event chain has no head.");
  if (head.sequence !== eventChain.headSequence || head.eventDigest !== eventChain.headDigest) {
    throw new Error("Canonical event-chain head does not match the final event.");
  }
  if (reconciliation.sequence !== eventChain.headSequence) {
    throw new Error("Reconciliation sequence is not aligned with the event-chain head.");
  }
  if (reconciliation.application.eventDigest !== eventChain.headDigest) {
    throw new Error("Reconciliation application digest does not match the event-chain head.");
  }

  return {
    current: {
      eventSequence: eventChain.headSequence,
      eventDigest: eventChain.headDigest,
      eventCount: eventChain.eventCount,
      canonicalBusinessEventCount: eventChain.canonicalBusinessEventCount,
      reconciliationSequence: reconciliation.sequence,
      reconciliationDigest: reconciliation.snapshotDigest,
      applicationDigest: application.applicationDigest,
      stateCounts: eventChain.currentCanonicalCounts,
      totalPlanningSlots: capacityLedger.canonicalCapacity.totalPlanningSlots,
      effectiveActiveCeiling: capacityLedger.canonicalCapacity.effectiveActiveCeiling,
      activeDeliveries: capacityLedger.canonicalCapacity.activeDeliveries,
      activeHeadroom: capacityLedger.arithmetic.effectiveActiveHeadroom,
      orders: capacityLedger.canonicalCapacity.orders,
      verifiedGrossRevenueUsd: capacityLedger.financialEvidence.verifiedGrossRevenueUsd,
      verifiedSettledCashUsd: capacityLedger.financialEvidence.verifiedSettledCashUsd,
      overrideState: capacityLedger.canonicalCapacity.overrideState,
      receivedCashRequires: capacityLedger.financialEvidence.receivedCashRequires,
    },
    next: {
      eventSequence: eventChain.headSequence + 1,
      previousEventDigest: eventChain.headDigest,
      reconciliationSequence: reconciliation.sequence + 1,
      previousSnapshotDigest: reconciliation.snapshotDigest,
    },
  };
}
