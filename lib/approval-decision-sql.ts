import type { ApprovalRecord } from "./hyperscript";
import type { SqlStatement } from "./memory-vault-sql";

export type ApprovalDecisionStatus = "approved" | "rejected";

export type ApprovalDecisionInput = {
  id: string;
  status: ApprovalDecisionStatus;
  decidedBy: string;
  note?: string;
  decidedAt?: string;
};

export type ApprovalDecisionRecord = ApprovalRecord & {
  decidedBy?: string;
  decisionNote?: string;
};

export function isApprovalDecisionStatus(value: unknown): value is ApprovalDecisionStatus {
  return value === "approved" || value === "rejected";
}

export function createApprovalDecision(input: {
  id?: string;
  status?: unknown;
  decidedBy?: string;
  note?: string;
}): ApprovalDecisionInput {
  return {
    id: input.id && input.id.trim().length > 0 ? input.id.trim() : "missing-approval-id",
    status: isApprovalDecisionStatus(input.status) ? input.status : "rejected",
    decidedBy: input.decidedBy && input.decidedBy.trim().length > 0 ? input.decidedBy.trim() : "manual-operator",
    note: input.note && input.note.trim().length > 0 ? input.note.trim() : undefined,
    decidedAt: new Date().toISOString()
  };
}

export function decideApprovalRecord(decision: ApprovalDecisionInput): SqlStatement {
  return {
    text: `
      update approval_records
      set
        status = $2,
        decided_at = $3::timestamptz
      where id = $1
      returning *;
    `,
    values: [decision.id, decision.status, decision.decidedAt]
  };
}

export function getApprovalRecord(id: string): SqlStatement {
  return {
    text: `
      select id, task_id, risk, requested_action, status, created_at, decided_at
      from approval_records
      where id = $1
      limit 1;
    `,
    values: [id]
  };
}

export function createApprovalDecisionMemoryPayload(decision: ApprovalDecisionInput, approval: ApprovalRecord | null) {
  return {
    decision: {
      id: decision.id,
      status: decision.status,
      decidedBy: decision.decidedBy,
      note: decision.note,
      decidedAt: decision.decidedAt
    },
    approval,
    law: [
      "Approval decisions must be explicit.",
      "Decision evidence does not hide the approver.",
      "Rejected decisions keep Violet Gate closed.",
      "Approved decisions can unlock only the matching gated task."
    ]
  };
}

export const APPROVAL_DECISION_SQL_LAW = [
  "Only approved or rejected are valid decision outcomes.",
  "Unknown decision status falls back to rejected.",
  "Every decision requires visible decidedBy evidence.",
  "Approval decisions update approval_records but do not silently execute work."
] as const;
