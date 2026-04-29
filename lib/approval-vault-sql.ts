import type { ApprovalRecord } from "./hyperscript";
import type { SqlStatement } from "./memory-vault-sql";

export function insertApprovalRecord(record: ApprovalRecord): SqlStatement {
  return {
    text: `
      insert into approval_records (id, task_id, risk, requested_action, status, created_at, decided_at)
      values ($1, $2, $3, $4, $5, $6::timestamptz, $7::timestamptz)
      on conflict (id) do update set
        task_id = excluded.task_id,
        risk = excluded.risk,
        requested_action = excluded.requested_action,
        status = excluded.status,
        decided_at = excluded.decided_at
      returning *;
    `,
    values: [
      record.id,
      record.taskId,
      record.risk,
      record.requestedAction,
      record.status,
      record.createdAt,
      record.decidedAt ?? null
    ]
  };
}

export function listApprovalRecords(limit = 50): SqlStatement {
  return {
    text: `
      select id, task_id, risk, requested_action, status, created_at, decided_at
      from approval_records
      order by created_at desc
      limit $1;
    `,
    values: [limit]
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

export function mapApprovalRow(row: Record<string, unknown>): ApprovalRecord {
  return {
    id: String(row.id),
    taskId: String(row.task_id),
    risk: row.risk as ApprovalRecord["risk"],
    requestedAction: String(row.requested_action),
    status: row.status as ApprovalRecord["status"],
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    decidedAt: row.decided_at instanceof Date ? row.decided_at.toISOString() : typeof row.decided_at === "string" ? row.decided_at : undefined
  };
}

export const APPROVAL_VAULT_SQL_LAW = [
  "Approval records are stored separately from memory notes.",
  "Read-only approval may auto-pass, but consequence-bearing work remains gated.",
  "Decisions are timestamped when approval status is known.",
  "No silent approval for needs-approval tasks."
] as const;
