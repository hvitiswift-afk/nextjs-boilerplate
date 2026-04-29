import { NextRequest, NextResponse } from "next/server";
import { insertApprovalRecord, listApprovalRecords, mapApprovalRow } from "../../../lib/approval-vault-sql";
import { hasDatabaseUrl, query } from "../../../lib/db";
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
  if (hasDatabaseUrl()) {
    try {
      const rows = await query(listApprovalRecords(50));
      return NextResponse.json({
        ok: true,
        system: "Open Loop Approval Gate",
        persistentStorage: true,
        approvals: rows.map(mapApprovalRow)
      });
    } catch (error) {
      return NextResponse.json({
        ok: false,
        system: "Open Loop Approval Gate",
        persistentStorage: true,
        fallback: approvals,
        error: error instanceof Error ? error.message : "Unknown database error"
      }, { status: 503 });
    }
  }

  return NextResponse.json({
    ok: true,
    system: "Open Loop Approval Gate",
    persistentStorage: false,
    approvals
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const risk: RiskLevel = isRiskLevel(body.risk) ? body.risk : "needs-approval";
  const taskId = typeof body.taskId === "string" ? body.taskId : "manual-task";
  const requestedAction = typeof body.requestedAction === "string" ? body.requestedAction : "Manual approval request.";

  const approval: ApprovalRecord = {
    id: typeof body.id === "string" && body.id.trim().length > 0 ? body.id.trim() : `approval-${Date.now()}`,
    taskId,
    risk,
    requestedAction,
    status: risk === "read-only" ? "approved" : "pending",
    createdAt: new Date().toISOString(),
    decidedAt: risk === "read-only" ? new Date().toISOString() : undefined
  };

  if (hasDatabaseUrl()) {
    try {
      const rows = await query(insertApprovalRecord(approval));
      const savedApproval = rows[0] ? mapApprovalRow(rows[0]) : approval;
      return NextResponse.json({
        ok: true,
        system: "Open Loop Approval Gate",
        approval: savedApproval,
        persistentStorage: true,
        message: risk === "read-only" ? "Read-only request auto-approved." : "Approval created. Consequence-bearing execution remains blocked until approved."
      });
    } catch (error) {
      return NextResponse.json({
        ok: false,
        system: "Open Loop Approval Gate",
        approval,
        persistentStorage: true,
        error: error instanceof Error ? error.message : "Unknown database error",
        message: "Approval was built but could not be persisted. Consequence-bearing execution remains blocked."
      }, { status: 503 });
    }
  }

  return NextResponse.json({
    ok: true,
    system: "Open Loop Approval Gate",
    approval,
    persistentStorage: false,
    message: risk === "read-only" ? "Read-only request auto-approved." : "Approval created. Consequence-bearing execution remains blocked until approved."
  });
}
