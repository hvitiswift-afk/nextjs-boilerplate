import { createHash } from "node:crypto";

import type { PolystructureIdentityPayload } from "@/lib/service-bridge-id-registry";
import { verifyPolystructureIdentity } from "@/lib/service-bridge-id-registry";

export type LocalRegistryRecord = {
  key: string;
  registryId: string;
  identity: PolystructureIdentityPayload;
  registeredAt: string;
  previousRecordDigest: string | null;
  recordDigest: string;
  externalActionCompleted: false;
};

function canonical(value: unknown) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, canonical(child)]),
    );
  }
  return value;
}

function digest(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(canonical(value)))
    .digest("hex");
}

export function applyLocalRegistryRecord(input: {
  registryId: string;
  identity: PolystructureIdentityPayload;
  existingRecords?: LocalRegistryRecord[];
  confirmation: string;
}) {
  const registryId = input.registryId.trim();
  if (!registryId) throw new Error("registryId is required.");

  const expectedConfirmation = `COMMIT POLYSTRUCTURE ID ${input.identity.compactId}`;
  if (input.confirmation.trim() !== expectedConfirmation) {
    throw new Error(`Exact confirmation required: ${expectedConfirmation}`);
  }

  const verification = verifyPolystructureIdentity(input.identity);
  if (!verification.checks.valid) {
    throw new Error("Identity payload failed integrity verification.");
  }

  const records = input.existingRecords ?? [];
  const duplicate = records.find(
    (record) => record.identity.compactId === input.identity.compactId,
  );
  if (duplicate) {
    return {
      schema: "jp-hviti-service-bridge-polystructure-local-registry-apply/v1",
      operation: "NOOP_DUPLICATE",
      registryId,
      record: duplicate,
      localMutationApplied: false,
      externalRegistryWritten: false,
      externalActionCompleted: false as const,
    };
  }

  const previous = records.at(-1) ?? null;
  const registeredAt = new Date().toISOString();
  const baseRecord = {
    key: `polystructure:${input.identity.compactId}`,
    registryId,
    identity: input.identity,
    registeredAt,
    previousRecordDigest: previous?.recordDigest ?? null,
    externalActionCompleted: false as const,
  };

  const record: LocalRegistryRecord = {
    ...baseRecord,
    recordDigest: digest(baseRecord),
  };

  return {
    schema: "jp-hviti-service-bridge-polystructure-local-registry-apply/v1",
    operation: "LOCAL_INSERT",
    registryId,
    record,
    nextRecords: [...records, record],
    localMutationApplied: true,
    externalRegistryWritten: false,
    trustedTimestamp: false,
    signed: false,
    notarized: false,
    blockchain: false,
    externalActionCompleted: false as const,
  };
}

export function verifyLocalRegistryChain(records: LocalRegistryRecord[]) {
  const failures: string[] = [];

  records.forEach((record, index) => {
    const previous = index === 0 ? null : records[index - 1].recordDigest;
    if (record.previousRecordDigest !== previous) {
      failures.push(`Record ${index} previousRecordDigest mismatch.`);
    }

    const { recordDigest, ...baseRecord } = record;
    if (digest(baseRecord) !== recordDigest) {
      failures.push(`Record ${index} recordDigest mismatch.`);
    }

    if (!verifyPolystructureIdentity(record.identity).checks.valid) {
      failures.push(`Record ${index} identity verification failed.`);
    }
  });

  return {
    schema: "jp-hviti-service-bridge-polystructure-local-registry-verification/v1",
    checkedAt: new Date().toISOString(),
    recordCount: records.length,
    valid: failures.length === 0,
    failures,
    trustedTimestampVerified: false,
    externalRegistryChecked: false,
    externalActionCompleted: false as const,
  };
}
