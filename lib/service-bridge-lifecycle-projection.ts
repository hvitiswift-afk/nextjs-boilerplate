import {
  verifyLifecycleJournal,
  type LifecycleEntry,
  type LifecycleEntryType,
} from "@/lib/service-bridge-lifecycle";

const expectedOrder: LifecycleEntryType[] = [
  "RESOLUTION_CREATED",
  "PERSISTENCE_PLANNED",
  "LOCAL_PERSISTENCE_APPLIED",
  "ROLLBACK_PLANNED",
  "LOCAL_ROLLBACK_APPLIED",
];

export function projectLifecycleJournal(entries: LifecycleEntry[]) {
  const verification = verifyLifecycleJournal(entries);
  const counts = Object.fromEntries(
    expectedOrder.map((type) => [
      type,
      entries.filter((entry) => entry.type === type).length,
    ]),
  ) as Record<LifecycleEntryType, number>;

  const latest = entries.at(-1) ?? null;
  const latestType = latest?.type ?? null;
  const persisted = counts.LOCAL_PERSISTENCE_APPLIED > counts.LOCAL_ROLLBACK_APPLIED;
  const rolledBack = counts.LOCAL_ROLLBACK_APPLIED > 0 && !persisted;
  const unresolvedPlan =
    counts.PERSISTENCE_PLANNED > counts.LOCAL_PERSISTENCE_APPLIED ||
    counts.ROLLBACK_PLANNED > counts.LOCAL_ROLLBACK_APPLIED;

  const warnings: string[] = [];
  if (counts.LOCAL_PERSISTENCE_APPLIED > counts.PERSISTENCE_PLANNED) {
    warnings.push("Persistence application exists without a matching persistence plan.");
  }
  if (counts.LOCAL_ROLLBACK_APPLIED > counts.ROLLBACK_PLANNED) {
    warnings.push("Rollback application exists without a matching rollback plan.");
  }
  if (counts.PERSISTENCE_PLANNED > 0 && counts.RESOLUTION_CREATED === 0) {
    warnings.push("Persistence planning exists without a recorded resolution entry.");
  }

  return {
    schema: "jp-hviti-service-bridge-lifecycle-projection/v1",
    projectedAt: new Date().toISOString(),
    missionId: verification.missionId,
    journalValid: verification.valid,
    entries: entries.length,
    headDigest: verification.headDigest,
    latestType,
    counts,
    state: {
      persisted,
      rolledBack,
      unresolvedPlan,
    },
    warnings,
    verificationErrors: verification.errors,
    limitation:
      "This is a derived local lifecycle view. It does not prove identity, legal authority, trusted time, external persistence, external rollback, or third-party execution.",
    externalActionCompleted: false as const,
  };
}
