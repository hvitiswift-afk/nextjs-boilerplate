import type { ServiceMission } from "@/lib/service-bridge";

export type LifecycleProjectionSnapshot = {
  schema: "jp-hviti-service-bridge-lifecycle-projection/v1";
  missionId: string | null;
  journalValid: boolean;
  state: {
    persisted: boolean;
    rolledBack: boolean;
    unresolvedPlan: boolean;
  };
  externalActionCompleted: false;
};

export function createLifecycleProjectionApplyPlan(input: {
  projection: LifecycleProjectionSnapshot;
  currentMissions: ServiceMission[];
  projectedMission: ServiceMission;
  confirmation: string;
}) {
  if (!input.projection.journalValid) {
    throw new Error("Lifecycle projection must come from a valid journal.");
  }
  if (!input.projection.missionId) {
    throw new Error("Lifecycle projection mission ID is required.");
  }
  if (input.projectedMission.id !== input.projection.missionId) {
    throw new Error("Projected mission ID must match the lifecycle projection.");
  }

  const expectedConfirmation = `APPLY PROJECTION ${input.projection.missionId}`;
  if (input.confirmation.trim() !== expectedConfirmation) {
    throw new Error(`Confirmation must exactly equal: ${expectedConfirmation}`);
  }

  const index = input.currentMissions.findIndex(
    (mission) => mission.id === input.projection.missionId,
  );
  if (index < 0) throw new Error("Current mission snapshot was not found.");

  const previousMission = input.currentMissions[index];
  const nextMission = {
    ...input.projectedMission,
    id: input.projection.missionId,
    updatedAt: new Date().toISOString(),
  } as ServiceMission;
  const nextMissions = [...input.currentMissions];
  nextMissions[index] = nextMission;

  return {
    schema: "jp-hviti-service-bridge-lifecycle-projection-apply-plan/v1",
    plannedAt: new Date().toISOString(),
    missionId: input.projection.missionId,
    expectedConfirmation,
    previousMission,
    nextMission,
    nextMissions,
    storageKey: "jp-hviti-service-bridge-v2",
    projectionMutationAllowed: true as const,
    projectionMutationApplied: false as const,
    explicitConfirmationRequired: true as const,
    localPersistenceAllowed: true as const,
    externalPersistenceAllowed: false as const,
    externalActionCompleted: false as const,
  };
}
