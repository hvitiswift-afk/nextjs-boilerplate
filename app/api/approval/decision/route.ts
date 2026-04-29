import { NextRequest, NextResponse } from "next/server";
import { createApprovalDecision, createApprovalDecisionMemoryPayload, decideApprovalRecord, getApprovalRecord } from "../../../../lib/approval-decision-sql";
import { mapApprovalRow } from "../../../../lib/approval-vault-sql";
import { hasDatabaseUrl, query } from "../../../../lib/db";
import type { ApprovalRecord } from "../../../../lib/hyperscript";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const decision = createApprovalDecision({
    id: typeof body.id === "string" ? body.id : undefined,
    status: body.status,
    decidedBy: typeof body.decidedBy === "string" ? body.decidedBy : undefined,
    note: typeof body.note === "string" ? body.note : undefined
  });

  if (decision.id === "missing-approval-id") {
    return NextResponse.json({
      ok: false,
      system: "Violet Gate Decision",
      decision,
      persistentStorage: false,
      message: "Approval id is required before Violet Gate can decide."
    }, { status: 400 });
  }

  if (!hasDatabaseUrl()) {
    const simulatedApproval: ApprovalRecord = {
      id: decision.id,
      taskId: typeof body.taskId === "string" ? body.taskId : "manual-task",
      risk: "needs-approval",
      requestedAction: typeof body.requestedAction === "string" ? body.requestedAction : "Simulated approval decision without DATABASE_URL.",
      status: decision.status,
      createdAt: new Date().toISOString(),
      decidedAt: decision.decidedAt
    };

    return NextResponse.json({
      ok: true,
      system: "Violet Gate Decision",
      decision,
      approval: simulatedApproval,
      memoryPayload: createApprovalDecisionMemoryPayload(decision, simulatedApproval),
      persistentStorage: false,
      message: "DATABASE_URL is not configured. Decision was normalized but not persisted."
    });
  }

  try {
    const existingRows = await query(getApprovalRecord(decision.id));
    const existingApproval = existingRows[0] ? mapApprovalRow(existingRows[0]) : null;

    if (!existingApproval) {
      return NextResponse.json({
        ok: false,
        system: "Violet Gate Decision",
        decision,
        approval: null,
        persistentStorage: true,
        message: "Approval record was not found. Violet Gate remains closed."
      }, { status: 404 });
    }

    if (existingApproval.status !== "pending") {
      return NextResponse.json({
        ok: false,
        system: "Violet Gate Decision",
        decision,
        approval: existingApproval,
        memoryPayload: createApprovalDecisionMemoryPayload(decision, existingApproval),
        persistentStorage: true,
        message: "Approval record has already been decided. Violet Gate will not silently overwrite it."
      }, { status: 409 });
    }

    const updatedRows = await query(decideApprovalRecord(decision));
    const updatedApproval = updatedRows[0] ? mapApprovalRow(updatedRows[0]) : existingApproval;

    return NextResponse.json({
      ok: true,
      system: "Violet Gate Decision",
      decision,
      approval: updatedApproval,
      memoryPayload: createApprovalDecisionMemoryPayload(decision, updatedApproval),
      persistentStorage: true,
      message: decision.status === "approved"
        ? "Approval was explicitly approved. Only the matching gated task may use this evidence."
        : "Approval was explicitly rejected. Violet Gate remains closed."
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      system: "Violet Gate Decision",
      decision,
      persistentStorage: true,
      error: error instanceof Error ? error.message : "Unknown database error",
      message: "Decision could not be persisted. Violet Gate remains closed."
    }, { status: 503 });
  }
}
