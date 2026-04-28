import type { ProviderName } from "./hyperscript";

export type ProviderCapability =
  | "chat"
  | "planning"
  | "routing"
  | "summarizing"
  | "code-draft"
  | "local-only";

export type ProviderAdapter = {
  name: ProviderName;
  title: string;
  envKey?: string;
  baseUrl?: string;
  capabilities: ProviderCapability[];
  enabled: boolean;
  safety: {
    requiresApprovalForExecution: boolean;
    storesSecretsInSource: false;
    mayUseExternalService: boolean;
  };
};

export type ProviderRouteRequest = {
  id: string;
  intent: string;
  preferredProvider?: ProviderName;
  requiredCapability?: ProviderCapability;
};

export type ProviderRouteDecision = {
  requestId: string;
  provider: ProviderName;
  reason: string;
  approvalRequired: boolean;
};

export function getProviderAdapters(env: NodeJS.ProcessEnv = process.env): ProviderAdapter[] {
  return [
    {
      name: "openai",
      title: "OpenAI Adapter",
      envKey: "OPENAI_API_KEY",
      capabilities: ["chat", "planning", "summarizing", "code-draft"],
      enabled: Boolean(env.OPENAI_API_KEY),
      safety: {
        requiresApprovalForExecution: true,
        storesSecretsInSource: false,
        mayUseExternalService: true
      }
    },
    {
      name: "anthropic",
      title: "Anthropic Adapter",
      envKey: "ANTHROPIC_API_KEY",
      capabilities: ["chat", "planning", "summarizing", "code-draft"],
      enabled: Boolean(env.ANTHROPIC_API_KEY),
      safety: {
        requiresApprovalForExecution: true,
        storesSecretsInSource: false,
        mayUseExternalService: true
      }
    },
    {
      name: "grok",
      title: "Grok / xAI Adapter",
      envKey: "XAI_API_KEY",
      capabilities: ["chat", "summarizing", "code-draft"],
      enabled: Boolean(env.XAI_API_KEY),
      safety: {
        requiresApprovalForExecution: true,
        storesSecretsInSource: false,
        mayUseExternalService: true
      }
    },
    {
      name: "local",
      title: "Local LLM Adapter",
      envKey: "LOCAL_LLM_URL",
      baseUrl: env.LOCAL_LLM_URL,
      capabilities: ["chat", "summarizing", "local-only"],
      enabled: Boolean(env.LOCAL_LLM_URL),
      safety: {
        requiresApprovalForExecution: true,
        storesSecretsInSource: false,
        mayUseExternalService: false
      }
    },
    {
      name: "fabian",
      title: "Fabian Architect Adapter",
      envKey: "FABIAN_LLM_URL",
      baseUrl: env.FABIAN_LLM_URL,
      capabilities: ["planning", "code-draft", "local-only"],
      enabled: true,
      safety: {
        requiresApprovalForExecution: true,
        storesSecretsInSource: false,
        mayUseExternalService: false
      }
    },
    {
      name: "goblin",
      title: "Goblin Router Adapter",
      capabilities: ["routing", "summarizing", "local-only"],
      enabled: true,
      safety: {
        requiresApprovalForExecution: true,
        storesSecretsInSource: false,
        mayUseExternalService: false
      }
    }
  ];
}

export function chooseProvider(request: ProviderRouteRequest, env: NodeJS.ProcessEnv = process.env): ProviderRouteDecision {
  const adapters = getProviderAdapters(env);
  const enabled = adapters.filter((adapter) => adapter.enabled);

  const preferred = request.preferredProvider
    ? enabled.find((adapter) => adapter.name === request.preferredProvider)
    : undefined;

  const capable = enabled.find((adapter) =>
    request.requiredCapability ? adapter.capabilities.includes(request.requiredCapability) : true
  );

  const selected = preferred ?? capable ?? enabled.find((adapter) => adapter.name === "goblin") ?? adapters[adapters.length - 1];

  return {
    requestId: request.id,
    provider: selected.name,
    reason: preferred
      ? `Preferred provider ${preferred.title} is enabled.`
      : capable
        ? `${capable.title} matched the requested capability.`
        : "Fallback to Goblin routing layer.",
    approvalRequired: selected.safety.requiresApprovalForExecution
  };
}

export const PROVIDER_ADAPTER_LAW = [
  "Secrets stay in environment variables.",
  "Provider execution is routed, logged, and approval-gated.",
  "Local providers may run without external service calls.",
  "Goblin routes; Fabian plans; external LLMs draft only inside the Open Loop."
] as const;
