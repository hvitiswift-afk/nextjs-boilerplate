import { sha256 } from "@/lib/service-bridge-receipts";

export type LifecycleEntryType =
  | "RESOLUTION_CREATED"
  | "PERSISTENCE_PLANNED"
  | "LOCAL_PERSISTENCE_APPLIED"
  | "ROLLBACK_PLANNED"
  | "LOCAL_ROLLBACK_APPLIED";

export type LifecycleEntry = {
  schema: "jp-hviti-service-bridge-lifecycle-entry/v1";
  id: string;
  missionId: string;
  type: LifecycleEntryType;
  recordedAt: string;
  actor: string;
  data: Record<string, unknown>;
  previousDigest: string | null;
  digest: string;
  externalActionCompleted: false;
};

export function createLifecycleEntry(input: {
  missionId: string;
  type: LifecycleEntryType;
  actor: string;
  data: Record<string, unknown>;
  previousEntry?: LifecycleEntry | null;
}): LifecycleEntry {
  if (!input.missionId?.trim()) throw new Error("Mission ID is required.");
  if (!input.actor?.trim()) throw new Error("Actor is required.");

  const payload = {
    schema: "jp-hviti-service-bridge-lifecycle-entry/v1" as const,
    id: crypto.randomUUID(),
    missionId: input.missionId.trim(),
    type: input.type,
    recordedAt: new Date().toISOString(),
    actor: input.actor.trim(),
    data: input.data,
    previousDigest: input.previousEntry?.digest ?? null,
    externalActionCompleted: false as const,
  };

  return {
    ...payload,
    digest: sha256(payload),
  };
}

export function verifyLifecycleJournal(entries: LifecycleEntry[]) {
  const errors: Array<{ index: number; code: string }> = [];

  entries.forEach((entry, index) => {
    const { digest, ...payload } = entry;
    if (sha256(payload) !== digest) {
      errors.push({ index, code: "LIFECYCLE_DIGEST_MISMATCH" });
    }

    const expectedPrevious = index === 0 ? null : entries[index - 1]?.digest ?? null;
    if (entry.previousDigest !== expectedPrevious) {
      errors.push({ index, code: "LIFECYCLE_PREVIOUS_DIGEST_MISMATCH" });
    }

    if (index > 0 && entry.missionId !== entries[0]?.missionId) {
      errors.push({ index, code: "LIFECYCLE_MISSION_ID_MISMATCH" });
    }
  });

  return {
    valid: errors.length === 0,
    entries: entries.length,
    missionId: entries[0]?.missionId ?? null,
    headDigest: entries.at(-1)?.digest ?? null,
    errors,
    limitation: "This verifies local deterministic content and ordering only. It is not identity proof, notarization, a trusted timestamp, blockchain evidence, or proof of external execution.",
    externalActionCompleted: false as const,
  };
}
