import type { ServiceMission } from "@/lib/service-bridge";
import type { ServiceBridgeEvent } from "@/lib/service-bridge-events";
import { projectMissionFromEvents } from "@/lib/service-bridge-projection";

const missionFields: Array<keyof ServiceMission> = [
  "id",
  "title",
  "service",
  "target",
  "action",
  "owner",
  "state",
  "priority",
  "budget",
  "permission",
  "evidence",
  "fallback",
  "next",
  "query",
  "location",
  "updatedAt",
];

export function reconcileMissionSnapshot(
  snapshot: ServiceMission,
  events: ServiceBridgeEvent[],
) {
  const projection = projectMissionFromEvents(events);
  const differences = missionFields.flatMap((field) => {
    const snapshotValue = snapshot?.[field];
    const projectedValue = projection.state?.[field];

    if (JSON.stringify(snapshotValue) === JSON.stringify(projectedValue)) return [];

    return [{
      field,
      snapshotValue: snapshotValue ?? null,
      projectedValue: projectedValue ?? null,
    }];
  });

  return {
    missionId: snapshot?.id ?? projection.missionId,
    consistent: projection.chainValid && differences.length === 0,
    chainValid: projection.chainValid,
    differences,
    projectedState: projection.state,
    snapshot,
    appliedEvents: projection.appliedEvents,
    ignoredEvents: projection.ignoredEvents,
    headDigest: projection.headDigest,
    recommendedAction:
      !projection.chainValid
        ? "Repair or replace the invalid event chain before reconciliation."
        : differences.length
          ? "Review each difference and explicitly choose whether the snapshot or verified projection is authoritative."
          : "No reconciliation action is required.",
    externalActionCompleted: false as const,
  };
}
