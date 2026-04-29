import type { ProgressEvent } from "./hyperscript";
import type { SqlStatement } from "./memory-vault-sql";

export function insertProgressEvent(event: ProgressEvent): SqlStatement {
  return {
    text: `
      insert into progress_events (id, task_id, step, status, message, created_at)
      values ($1, $2, $3, $4, $5, $6::timestamptz)
      on conflict (id) do update set
        task_id = excluded.task_id,
        step = excluded.step,
        status = excluded.status,
        message = excluded.message
      returning *;
    `,
    values: [event.id, event.taskId, event.step, event.status, event.message, event.createdAt]
  };
}

export function listProgressEvents(limit = 50): SqlStatement {
  return {
    text: `
      select id, task_id, step, status, message, created_at
      from progress_events
      order by created_at desc
      limit $1;
    `,
    values: [limit]
  };
}

export function listProgressEventsForTask(taskId: string, limit = 50): SqlStatement {
  return {
    text: `
      select id, task_id, step, status, message, created_at
      from progress_events
      where task_id = $1
      order by created_at desc
      limit $2;
    `,
    values: [taskId, limit]
  };
}

export function mapProgressRow(row: Record<string, unknown>): ProgressEvent {
  return {
    id: String(row.id),
    taskId: String(row.task_id),
    step: row.step as ProgressEvent["step"],
    status: row.status as ProgressEvent["status"],
    message: String(row.message),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at)
  };
}

export const PROGRESS_VAULT_SQL_LAW = [
  "Progress events are append-visible and queryable.",
  "Progress does not imply approval.",
  "Blocked, ready, running, complete, and failed states are all durable evidence.",
  "Every progress event can be paired with Memory Vault and Outpost return records."
] as const;
