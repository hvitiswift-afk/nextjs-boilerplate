import type { ServiceMission } from "@/lib/service-bridge";

export type ResolutionPacket = {
  schema: "jp-hviti-service-bridge-resolution/v1";
  missionId: string;
  authority: "snapshot" | "projection" | "manual";
  actor: string;
  reason: string;
  resolvedState: Partial<ServiceMission>;
  mutationApplied: false;
  requiresExplicitPersistence: true;
  externalActionCompleted: false;
};

export function createPersistencePlan(input: {
  resolution: ResolutionPacket;
  currentMissions: ServiceMission[];
  confirmation: string;
}) {
  const confirmation = input.confirmation.trim();
  const expectedConfirmation = `PERSIST ${input.resolution.missionId}`;

  if (input.resolution.schema !== "jp-hviti-service-bridge-resolution/v1") {
    throw new Error("Unsupported resolution schema.");
  }
  if (confirmation !== expectedConfirmation) {
    throw new Error(`Confirmation must exactly equal: ${expectedConfirmation}`);
  }

  const index = input.currentMissions.findIndex(
    (mission) => mission.id === input.resolution.missionId,
  );
  if (index < 0) throw new Error("Mission snapshot was not found.");

  const previousMission = input.currentMissions[index];
  const nextMission = {
    ...previousMission,
    ...input.resolution.resolvedState,
    id: previousMission.id,
    updatedAt: new Date().toISOString(),
  } as ServiceMission;

  const nextMissions = [...input.currentMissions];
  nextMissions[index] = nextMission;

  return {
    schema: "jp-hviti-service-bridge-persistence-plan/v1",
    plannedAt: new Date().toISOString(),
    missionId: input.resolution.missionId,
    expectedConfirmation,
    previousMission,
    nextMission,
    nextMissions,
    storageKey: "jp-hviti-service-bridge-v2",
    mutationApplied: false as const,
    localPersistenceAllowed: true as const,
    externalPersistenceAllowed: false as const,
    externalActionCompleted: false as const,
  };
}
