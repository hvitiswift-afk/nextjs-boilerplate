export type ExecutionRisk = "read-only" | "draft" | "needs-approval";

export type ExecutionIntent = {
  id: string;
  title: string;
  description: string;
  risk: ExecutionRisk;
  requestedBy: "goblin" | "fabian" | "provider" | "manual";
  approvalId?: string;
  createdAt: string;
};

export type ExecutionDecision = {
  intentId: string;
  canExecute: boolean;
  gate: "open" | "violet-gate" | "blocked";
  reason: string;
  next: "/api/progress" | "/api/approval" | "/api/memory";
};

export function decideExecution(intent: ExecutionIntent): ExecutionDecision {
  if (intent.risk === "read-only") {
    return {
      intentId: intent.id,
      canExecute: true,
      gate: "open",
      reason: "Read-only intent may proceed into progress logging.",
      next: "/api/progress"
    };
  }

  if (intent.risk === "draft") {
    return {
      intentId: intent.id,
      canExecute: true,
      gate: "open",
      reason: "Draft-only intent may proceed because it does not create external consequence.",
      next: "/api/progress"
    };
  }

  if (intent.risk === "needs-approval" && intent.approvalId) {
    return {
      intentId: intent.id,
      canExecute: true,
      gate: "violet-gate",
      reason: "Approval identifier is present; execution may continue through the approved path.",
      next: "/api/progress"
    };
  }

  return {
    intentId: intent.id,
    canExecute: false,
    gate: "blocked",
    reason: "Consequence-bearing execution requires a Violet Gate approval record first.",
    next: "/api/approval"
  };
}

export function createExecutionIntent(input: {
  id: string;
  title: string;
  description: string;
  risk?: ExecutionRisk;
  requestedBy?: ExecutionIntent["requestedBy"];
  approvalId?: string;
}): ExecutionIntent {
  return {
    id: input.id,
    title: input.title,
    description: input.description,
    risk: input.risk ?? "needs-approval",
    requestedBy: input.requestedBy ?? "manual",
    approvalId: input.approvalId,
    createdAt: new Date().toISOString()
  };
}

export const EXECUTION_WORKER_LAW = [
  "Read-only work can proceed into progress logging.",
  "Draft work can proceed when it creates no external consequence.",
  "Consequence-bearing execution requires Violet Gate approval.",
  "Every execution decision is visible before action."
] as const;
