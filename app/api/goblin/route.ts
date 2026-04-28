import { NextRequest, NextResponse } from "next/server";

type Provider = "openai" | "anthropic" | "grok" | "local";

type GoblinRequest = {
  prompt?: string;
  provider?: Provider;
  risk?: "read-only" | "draft" | "needs-approval";
};

const providers: Provider[] = ["openai", "anthropic", "grok", "local"];

function selectProvider(input?: Provider): Provider {
  if (input && providers.includes(input)) return input;
  if (process.env.LOCAL_LLM_URL) return "local";
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.XAI_API_KEY) return "grok";
  return "local";
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    system: "Goblin Enclave / 2099-2100 Outpost",
    law: ["listen", "classify", "route", "draft", "verify", "approve", "deploy"],
    openLoop: true,
    providers,
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as GoblinRequest;
  const provider = selectProvider(body.provider);
  const risk = body.risk ?? "needs-approval";
  const prompt = body.prompt?.trim() ?? "";

  return NextResponse.json({
    ok: true,
    outpost: "2099-2100",
    enclave: true,
    provider,
    risk,
    approvalRequired: risk !== "read-only",
    progress: [
      { step: "listen", status: "complete" },
      { step: "classify", status: "complete" },
      { step: "route", status: "complete", provider },
      { step: "draft", status: prompt ? "ready" : "waiting-for-prompt" },
      { step: "verify", status: "pending" },
      { step: "approve", status: risk === "read-only" ? "not-required" : "required" },
      { step: "deploy", status: "blocked-until-approved" }
    ],
    message: "Goblin route is scaffolded. Connect provider SDKs behind this route when keys are configured in the enclave environment."
  });
}
