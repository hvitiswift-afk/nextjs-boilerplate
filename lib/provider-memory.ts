import { createMemoryRecord, type MemoryVaultRecord } from "./memory-vault";
import type { ProviderRouteDecision, ProviderRouteRequest } from "./provider-adapters";

export type ProviderMemoryPayload = {
  request: ProviderRouteRequest;
  decision: ProviderRouteDecision;
  openLoop: true;
  approvalPath: "/api/approval";
  progressPath: "/api/progress";
};

export function providerDecisionToMemory(input: {
  request: ProviderRouteRequest;
  decision: ProviderRouteDecision;
}): MemoryVaultRecord<ProviderMemoryPayload> {
  const id = `provider-memory-${input.request.id}`;

  return createMemoryRecord({
    id,
    kind: "note",
    title: `Provider decision for ${input.request.id}`,
    payload: {
      request: input.request,
      decision: input.decision,
      openLoop: true,
      approvalPath: "/api/approval",
      progressPath: "/api/progress"
    },
    tags: ["provider", "adapter", input.decision.provider, "open-loop"],
    outpostReturnUrl: `/api/outpost/entry/${id}/return`
  });
}

export const PROVIDER_MEMORY_LAW = [
  "Every provider decision can become a Memory Vault record.",
  "Provider choices are visible before execution.",
  "Approval remains required before consequence-bearing actions.",
  "Each provider decision receives an Outpost return path."
] as const;
