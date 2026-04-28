import { NextRequest, NextResponse } from "next/server";

type FabianRequest = {
  intent?: string;
  scale?: 0 | 1 | 2 | 3 | 4 | 5;
  risk?: "read-only" | "draft" | "needs-approval";
};

export async function GET() {
  return NextResponse.json({
    ok: true,
    system: "Fabian LLM / Hyperscript Architect",
    law: ["listen", "decompose", "script", "test", "verify", "hand-back", "approval"],
    role: "planner-not-deployer",
    outpost: "2099-2100"
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as FabianRequest;
  const intent = body.intent?.trim() || "No intent supplied";
  const scale = body.scale ?? 0;
  const risk = body.risk ?? "draft";

  return NextResponse.json({
    ok: true,
    fabian: true,
    intent,
    scale,
    risk,
    approvalRequired: risk !== "read-only",
    hyperscript: {
      planner: "fabian",
      router: "goblin",
      steps: [
        "decompose intent",
        "choose scale level",
        "draft scripts",
        "write verification checks",
        "return to Goblin router",
        "wait for human approval"
      ],
      safety: [
        "no silent deploys",
        "no hidden payments",
        "no secret keys in source",
        "no irreversible action without approval"
      ]
    }
  });
}
