import { createMemoryRecord, type MemoryVaultRecord } from "./memory-vault";
import type { ExecutionDecision, ExecutionIntent } from "./execution-worker";

export type ExecutionMemoryPayload = {
  intent: ExecutionIntent;
  decision: ExecutionDecision;
  openLoop: true;
  approvalPath: "/api/approval";
  progressPath: "/api/progress";
  executePath: "/api/execute";
};

export function executionDecisionToMemory(input: {
  intent: ExecutionIntent;
  decision: ExecutionDecision;
}): MemoryVaultRecord<ExecutionMemoryPayload> {
  const id = `execution-memory-${input.intent.id}`;

  return createMemoryRecord({
    id,
    kind: "progress",
    title: `Execution decision for ${input.intent.id}`,
    payload: {
      intent: input.intent,
      decision: input.decision,
      openLoop: true,
      approvalPath: "/api/approval",
      progressPath: "/api/progress",
      executePath: "/api/execute"
    },
    tags: [
      "execution",
      "worker",
      input.intent.risk,
      input.decision.gate,
      input.decision.canExecute ? "can-execute" : "blocked"
    ],
    outpostReturnUrl: `/api/outpost/entry/${id}/return`
  });
}

export const EXECUTION_MEMORY_LAW = [
  "Every execution decision can become a Memory Vault record.",
  "Blocked decisions are remembered as clearly as approved decisions.",
  "Consequence-bearing work remains approval-gated.",
  "Each execution memory receives an Outpost return path."
] as const;
