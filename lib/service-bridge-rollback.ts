import type { ServiceMission } from "@/lib/service-bridge";

export type LocalPersistenceReceipt = {
  schema: "jp-hviti-service-bridge-local-persistence-receipt/v1";
  missionId: string;
  storageKey: string;
  previousMission: ServiceMission;
  nextMission: ServiceMission;
  localMutationApplied: true;
  externalPersistenceApplied: false;
  externalActionCompleted: false;
};

export function createRollbackPlan(input: {
  receipt: LocalPersistenceReceipt;
  currentMissions: ServiceMission[];
  confirmation: string;
}) {
  const expectedConfirmation = `ROLLBACK LOCAL ${input.receipt.missionId}`;
  if (input.receipt.schema !== "jp-hviti-service-bridge-local-persistence-receipt/v1") {
    throw new Error("Unsupported local persistence receipt schema.");
  }
  if (input.confirmation.trim() !== expectedConfirmation) {
    throw new Error(`Confirmation must exactly equal: ${expectedConfirmation}`);
  }

  const index = input.currentMissions.findIndex(
    (mission) => mission.id === input.receipt.missionId,
  );
  if (index < 0) throw new Error("Current mission snapshot was not found.");

  const currentMission = input.currentMissions[index];
  const rollbackMission = {
    ...input.receipt.previousMission,
    id: input.receipt.missionId,
    updatedAt: new Date().toISOString(),
  } as ServiceMission;

  const rollbackMissions = [...input.currentMissions];
  rollbackMissions[index] = rollbackMission;

  return {
    schema: "jp-hviti-service-bridge-rollback-plan/v1",
    plannedAt: new Date().toISOString(),
    missionId: input.receipt.missionId,
    expectedConfirmation,
    currentMission,
    rollbackMission,
    rollbackMissions,
    storageKey: input.receipt.storageKey,
    rollbackApplied: false as const,
    localRollbackAllowed: true as const,
    externalRollbackAllowed: false as const,
    externalActionCompleted: false as const,
  };
}
