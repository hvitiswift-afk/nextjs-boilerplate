export type ClientLifecycleEntry = Record<string, unknown> & {
  digest: string;
  missionId: string;
};

export const SERVICE_BRIDGE_LIFECYCLE_KEY =
  "jp-hviti-service-bridge-lifecycle-v1";

export async function appendClientLifecycleEntry(input: {
  missionId: string;
  type:
    | "PERSISTENCE_PLANNED"
    | "LOCAL_PERSISTENCE_APPLIED"
    | "ROLLBACK_PLANNED"
    | "LOCAL_ROLLBACK_APPLIED";
  actor?: string;
  data: Record<string, unknown>;
}) {
  const journal = JSON.parse(
    localStorage.getItem(SERVICE_BRIDGE_LIFECYCLE_KEY) || "[]",
  ) as ClientLifecycleEntry[];

  const previousEntry =
    journal.filter((entry) => entry.missionId === input.missionId).at(-1) ??
    null;

  const response = await fetch("/api/service-bridge/lifecycle", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      operation: "append",
      missionId: input.missionId,
      type: input.type,
      actor: input.actor || "JP",
      data: input.data,
      previousEntry,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Lifecycle journal append failed.");
  }

  localStorage.setItem(
    SERVICE_BRIDGE_LIFECYCLE_KEY,
    JSON.stringify([...journal, payload.entry]),
  );

  return payload.entry as ClientLifecycleEntry;
}
