export type ProviderName = "openai" | "anthropic" | "grok" | "local" | "goblin" | "fabian";

export type RiskLevel = "read-only" | "draft" | "needs-approval";

export type ScaleLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type ProgressStatus = "waiting" | "ready" | "running" | "complete" | "blocked" | "failed";

export type ProgressEvent = {
  id: string;
  taskId: string;
  step: "listen" | "classify" | "decompose" | "route" | "draft" | "verify" | "approve" | "deploy" | "log";
  status: ProgressStatus;
  message: string;
  createdAt: string;
};

export type ApprovalRecord = {
  id: string;
  taskId: string;
  risk: RiskLevel;
  requestedAction: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  decidedAt?: string;
};

export type Hyperscript = {
  id: string;
  intent: string;
  planner: "fabian";
  router: "goblin";
  provider: ProviderName;
  scale: ScaleLevel;
  risk: RiskLevel;
  steps: string[];
  verification: string[];
  approvalRequired: boolean;
};

export const HYPERSCALE_LEVELS: Record<ScaleLevel, string> = {
  0: "Local enclave",
  1: "Cloudflare edge bridge",
  2: "AWS server tower",
  3: "Worker swarm",
  4: "LLM mesh",
  5: "Outpost 2099-2100"
};

export function requiresApproval(risk: RiskLevel): boolean {
  return risk !== "read-only";
}

export function createHyperscript(input: {
  id: string;
  intent: string;
  provider?: ProviderName;
  scale?: ScaleLevel;
  risk?: RiskLevel;
}): Hyperscript {
  const risk = input.risk ?? "needs-approval";
  return {
    id: input.id,
    intent: input.intent,
    planner: "fabian",
    router: "goblin",
    provider: input.provider ?? "local",
    scale: input.scale ?? 0,
    risk,
    steps: ["listen", "decompose", "draft", "verify", "hand-back", "approve"],
    verification: ["source check", "risk check", "secret check", "human approval gate"],
    approvalRequired: requiresApproval(risk)
  };
}
