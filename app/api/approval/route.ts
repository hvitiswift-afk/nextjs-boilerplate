import { NextRequest, NextResponse } from "next/server";
import type { ApprovalRecord, RiskLevel } from "../../../lib/hyperscript";

const approvals: ApprovalRecord[] = [
  {
    id: "approval-outpost-demo",
    taskId: "outpost-demo",
    risk: "needs-approval",
    requestedAction: "Authorize reversible Outpost 2099-2100 round trip for the demo hyperscript.",
    status: "pending",
    createdAt: new Date().toISOString()
  }
];

function isRiskLevel(value: unknown): value is RiskLevel {
  return value === "read-only" || value === "draft" || value === "needs-approval";
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    system: "Open Loop Approval Gate",
    approvals
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const risk: RiskLevel = isRiskLevel(body.risk) ? body.risk : "needs-approval";
  const taskId = typeof body.taskId === "string" ? body.taskId : "manual-task";
  const requestedAction = typeof body.requestedAction === "string" ? body.requestedAction : "Manual approval request.";

  const approval: ApprovalRecord = {
    id: `approval-${Date.now()}`,
    taskId,
    risk,
    requestedAction,
    status: risk === "read-only" ? "approved" : "pending",
    createdAt: new Date().toISOString(),
    decidedAt: risk === "read-only" ? new Date().toISOString() : undefined
  };

  return NextResponse.json({
    ok: true,
    system: "Open Loop Approval Gate",
    approval,
    message: risk === "read-only" ? "Read-only request auto-approved." : "Approval created. Consequence-bearing execution remains blocked until approved."
  });
}
