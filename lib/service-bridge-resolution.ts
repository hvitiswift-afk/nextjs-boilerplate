import type { ServiceMission } from "@/lib/service-bridge";
import type { ServiceBridgeEvent } from "@/lib/service-bridge-events";
import { reconcileMissionSnapshot } from "@/lib/service-bridge-reconciliation";

export type ResolutionAuthority = "snapshot" | "projection" | "manual";

export function createReconciliationResolution(input: {
  snapshot: ServiceMission;
  events: ServiceBridgeEvent[];
  authority: ResolutionAuthority;
  actor: string;
  reason: string;
  manualState?: Partial<ServiceMission>;
}) {
  const reconciliation = reconcileMissionSnapshot(input.snapshot, input.events);

  if (!input.actor?.trim()) throw new Error("Actor is required.");
  if (!input.reason?.trim()) throw new Error("Reason is required.");
  if (input.authority === "manual" && !input.manualState) {
    throw new Error("Manual authority requires manualState.");
  }

  const resolvedState = input.authority === "snapshot"
    ? input.snapshot
    : input.authority === "projection"
      ? { ...input.snapshot, ...reconciliation.projectedState }
      : { ...input.snapshot, ...input.manualState };

  return {
    schema: "jp-hviti-service-bridge-resolution/v1",
    resolvedAt: new Date().toISOString(),
    missionId: input.snapshot.id,
    authority: input.authority,
    actor: input.actor.trim(),
    reason: input.reason.trim(),
    chainValid: reconciliation.chainValid,
    differencesReviewed: reconciliation.differences,
    previousSnapshot: input.snapshot,
    projectedState: reconciliation.projectedState,
    resolvedState,
    mutationApplied: false as const,
    requiresExplicitPersistence: true as const,
    externalActionCompleted: false as const,
  };
}
