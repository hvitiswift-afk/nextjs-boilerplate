import { NextRequest, NextResponse } from "next/server";
import { hasDatabaseUrl, query } from "../../../lib/db";
import { executionDecisionToMemory } from "../../../lib/execution-memory";
import { createExecutionIntent, decideExecution, type ExecutionRisk } from "../../../lib/execution-worker";
import { insertMemoryRecord } from "../../../lib/memory-vault-sql";

const risks: ExecutionRisk[] = ["read-only", "draft", "needs-approval"];

function isExecutionRisk(value: unknown): value is ExecutionRisk {
  return typeof value === "string" && risks.includes(value as ExecutionRisk);
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    system: "Approval-Gated Execution Worker",
    route: "/api/execute",
    accepts: risks,
    persistentStorageAvailable: hasDatabaseUrl(),
    law: [
      "Read-only work can proceed into progress logging.",
      "Draft work can proceed when it creates no external consequence.",
      "Consequence-bearing execution requires Violet Gate approval.",
      "Every execution decision is visible before action."
    ]
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  const id = typeof body.id === "string" && body.id.trim().length > 0 ? body.id.trim() : `execute-${Date.now()}`;
  const title = typeof body.title === "string" && body.title.trim().length > 0 ? body.title.trim() : "Untitled execution intent";
  const description = typeof body.description === "string" && body.description.trim().length > 0
    ? body.description.trim()
    : "Execution intent created without an explicit description.";
  const risk = isExecutionRisk(body.risk) ? body.risk : "needs-approval";
  const approvalId = typeof body.approvalId === "string" && body.approvalId.trim().length > 0 ? body.approvalId.trim() : undefined;

  const intent = createExecutionIntent({
    id,
    title,
    description,
    risk,
    requestedBy: body.requestedBy === "goblin" || body.requestedBy === "fabian" || body.requestedBy === "provider" ? body.requestedBy : "manual",
    approvalId
  });

  const decision = decideExecution(intent);
  const memory = executionDecisionToMemory({ intent, decision });

  if (hasDatabaseUrl()) {
    try {
      await query(insertMemoryRecord(memory));
      return NextResponse.json({
        ok: decision.canExecute,
        system: "Approval-Gated Execution Worker",
        intent,
        decision,
        memory,
        persistentStorage: true,
        next: decision.next
      }, { status: decision.canExecute ? 200 : 202 });
    } catch (error) {
      return NextResponse.json({
        ok: false,
        system: "Approval-Gated Execution Worker",
        intent,
        decision,
        memory,
        persistentStorage: true,
        error: error instanceof Error ? error.message : "Unknown database error",
        next: "/api/approval"
      }, { status: 503 });
    }
  }

  return NextResponse.json({
    ok: decision.canExecute,
    system: "Approval-Gated Execution Worker",
    intent,
    decision,
    memory,
    persistentStorage: false,
    next: decision.next
  }, { status: decision.canExecute ? 200 : 202 });
}
