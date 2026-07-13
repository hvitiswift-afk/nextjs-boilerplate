import { createHash } from "node:crypto";

import type { ServiceMission } from "@/lib/service-bridge";

export type MissionReceiptPayload = {
  schema: "jp-hviti-service-bridge-receipt/v1";
  issuedAt: string;
  mission: ServiceMission;
  validation: {
    readiness: number;
    verdict: string;
    missing: string[];
    warnings: string[];
    launchUrl: string;
    externalActionCompleted: false;
  };
  approvalBoundary: {
    explicitApprovalRequired: true;
    externalActionCompleted: false;
  };
};

export function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;

  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, item]) => `${JSON.stringify(key)}:${canonicalize(item)}`);

  return `{${entries.join(",")}}`;
}

export function sha256(value: unknown): string {
  return createHash("sha256").update(canonicalize(value)).digest("hex");
}

export function createMissionReceipt(payload: MissionReceiptPayload) {
  return {
    ...payload,
    integrity: {
      algorithm: "SHA-256",
      canonicalization: "sorted-json-v1",
      digest: sha256(payload),
      scope: "content-integrity-only",
      signature: null,
      notary: null,
    },
  };
}

export function verifyMissionReceipt(receipt: ReturnType<typeof createMissionReceipt>) {
  const { integrity, ...payload } = receipt;
  const calculatedDigest = sha256(payload);

  return {
    valid: calculatedDigest === integrity?.digest,
    expectedDigest: integrity?.digest ?? null,
    calculatedDigest,
    signed: false,
    notarized: false,
    limitation:
      "This verifies deterministic content integrity only. It is not a digital signature, identity proof, timestamp authority, blockchain record, or external-action receipt.",
    externalActionCompleted: false as const,
  };
}
