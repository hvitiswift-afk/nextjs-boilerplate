import { NextRequest, NextResponse } from "next/server";
import { chooseProvider, getProviderAdapters, type ProviderCapability } from "../../../lib/provider-adapters";
import type { ProviderName } from "../../../lib/hyperscript";

const providerNames: ProviderName[] = ["openai", "anthropic", "grok", "local", "fabian", "goblin"];
const capabilities: ProviderCapability[] = ["chat", "planning", "routing", "summarizing", "code-draft", "local-only"];

function isProviderName(value: unknown): value is ProviderName {
  return typeof value === "string" && providerNames.includes(value as ProviderName);
}

function isProviderCapability(value: unknown): value is ProviderCapability {
  return typeof value === "string" && capabilities.includes(value as ProviderCapability);
}

export async function GET() {
  const adapters = getProviderAdapters().map((adapter) => ({
    name: adapter.name,
    title: adapter.title,
    envKey: adapter.envKey,
    baseUrlConfigured: Boolean(adapter.baseUrl),
    capabilities: adapter.capabilities,
    enabled: adapter.enabled,
    safety: adapter.safety
  }));

  return NextResponse.json({
    ok: true,
    system: "Provider Adapter Hall",
    providers: adapters,
    law: [
      "Secrets stay in environment variables.",
      "Provider execution is routed, logged, and approval-gated.",
      "Local providers may run without external service calls.",
      "Goblin routes; Fabian plans; external LLMs draft only inside the Open Loop."
    ]
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" && body.id.trim().length > 0 ? body.id.trim() : `provider-${Date.now()}`;
  const intent = typeof body.intent === "string" && body.intent.trim().length > 0 ? body.intent.trim() : "Route this request through the safest available provider.";
  const preferredProvider = isProviderName(body.preferredProvider) ? body.preferredProvider : undefined;
  const requiredCapability = isProviderCapability(body.requiredCapability) ? body.requiredCapability : undefined;

  const decision = chooseProvider({
    id,
    intent,
    preferredProvider,
    requiredCapability
  });

  return NextResponse.json({
    ok: true,
    system: "Provider Adapter Hall",
    decision,
    next: decision.approvalRequired ? "/api/approval" : "/api/progress"
  });
}
