import { createHash, randomUUID } from "node:crypto";

export type PolystructureIdChainEntry = {
  schema: "jp-hviti-service-bridge-polystructure-id-chain-entry/v1";
  entryId: string;
  compactId: string;
  operation: "ISSUED" | "VERIFIED" | "REGISTER_PLANNED" | "REVOKED";
  recordedAt: string;
  actor: string;
  reason?: string;
  previousDigest: string | null;
  digest: string;
  externalActionCompleted: false;
};

function canonical(entry: Omit<PolystructureIdChainEntry, "digest">): string {
  return JSON.stringify({
    actor: entry.actor,
    compactId: entry.compactId,
    entryId: entry.entryId,
    externalActionCompleted: entry.externalActionCompleted,
    operation: entry.operation,
    previousDigest: entry.previousDigest,
    reason: entry.reason ?? null,
    recordedAt: entry.recordedAt,
    schema: entry.schema,
  });
}

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function appendPolystructureIdChainEntry(input: {
  compactId: string;
  operation: PolystructureIdChainEntry["operation"];
  actor: string;
  reason?: string;
  previousEntry?: PolystructureIdChainEntry | null;
}) {
  const compactId = input.compactId.trim();
  const actor = input.actor.trim();
  if (!compactId || !actor) throw new Error("compactId and actor are required.");
  if (input.operation === "REVOKED" && !input.reason?.trim()) {
    throw new Error("Revocation requires a reason.");
  }

  const unsigned: Omit<PolystructureIdChainEntry, "digest"> = {
    schema: "jp-hviti-service-bridge-polystructure-id-chain-entry/v1",
    entryId: randomUUID(),
    compactId,
    operation: input.operation,
    recordedAt: new Date().toISOString(),
    actor,
    reason: input.reason?.trim() || undefined,
    previousDigest: input.previousEntry?.digest ?? null,
    externalActionCompleted: false,
  };

  return {
    ...unsigned,
    digest: hash(canonical(unsigned)),
  } satisfies PolystructureIdChainEntry;
}

export function verifyPolystructureIdChain(entries: PolystructureIdChainEntry[]) {
  const errors: string[] = [];
  entries.forEach((entry, index) => {
    const expectedPrevious = index === 0 ? null : entries[index - 1].digest;
    if (entry.previousDigest !== expectedPrevious) {
      errors.push(`Entry ${index} previousDigest mismatch.`);
    }
    const { digest, ...unsigned } = entry;
    if (hash(canonical(unsigned)) !== digest) {
      errors.push(`Entry ${index} digest mismatch.`);
    }
  });

  return {
    schema: "jp-hviti-service-bridge-polystructure-id-chain-verification/v1",
    checkedAt: new Date().toISOString(),
    entryCount: entries.length,
    valid: errors.length === 0,
    errors,
    latestDigest: entries.at(-1)?.digest ?? null,
    trustedTimestamp: false,
    signed: false,
    notarized: false,
    externalRegistryChecked: false,
    externalActionCompleted: false as const,
  };
}
