import type { SqlStatement } from "./memory-vault-sql";

export type VaultLedgerKind = "memory" | "approval" | "progress" | "outpost" | "receipt";

export type VaultLedgerFilter = {
  kind?: VaultLedgerKind;
  status?: string;
  taskId?: string;
  limit?: number;
};

export type VaultLedgerRow = {
  id: string;
  kind: VaultLedgerKind;
  title: string;
  status?: string;
  sourceTable: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

function vaultLedgerSelectSql() {
  return `
    select * from (
      select
        id,
        'memory' as kind,
        title,
        null::text as status,
        'memory_records' as source_table,
        payload,
        created_at
      from memory_records

      union all

      select
        id,
        'approval' as kind,
        requested_action as title,
        status,
        'approval_records' as source_table,
        jsonb_build_object(
          'taskId', task_id,
          'risk', risk,
          'requestedAction', requested_action,
          'status', status,
          'decidedAt', decided_at
        ) as payload,
        created_at
      from approval_records

      union all

      select
        id,
        'progress' as kind,
        message as title,
        status,
        'progress_events' as source_table,
        jsonb_build_object(
          'taskId', task_id,
          'step', step,
          'status', status,
          'message', message
        ) as payload,
        created_at
      from progress_events

      union all

      select
        id,
        'outpost' as kind,
        kind || ' ' || direction as title,
        direction as status,
        'outpost_entries' as source_table,
        jsonb_build_object(
          'entryKind', kind,
          'direction', direction,
          'origin', origin,
          'destination', destination,
          'returnPath', return_path,
          'payload', payload
        ) as payload,
        created_at
      from outpost_entries

      union all

      select
        id,
        'receipt' as kind,
        description as title,
        status,
        'receipt_records' as source_table,
        jsonb_build_object(
          'source', source,
          'status', status,
          'amount', amount,
          'currency', currency,
          'description', description,
          'outpostReturnUrl', outpost_return_url
        ) as payload,
        created_at
      from receipt_records
    ) ledger
  `;
}

export function listVaultLedger(limit = 100): SqlStatement {
  return listVaultLedgerFiltered({ limit });
}

export function listVaultLedgerByKind(kind: VaultLedgerKind, limit = 100): SqlStatement {
  return listVaultLedgerFiltered({ kind, limit });
}

export function listVaultLedgerFiltered(filter: VaultLedgerFilter = {}): SqlStatement {
  const values: unknown[] = [];
  const where: string[] = [];

  if (filter.kind) {
    values.push(filter.kind);
    where.push(`kind = $${values.length}`);
  }

  if (filter.status) {
    values.push(filter.status);
    where.push(`status = $${values.length}`);
  }

  if (filter.taskId) {
    values.push(filter.taskId);
    where.push(`payload ->> 'taskId' = $${values.length}`);
  }

  const limit = filter.limit ?? 100;
  values.push(limit);

  return {
    text: `
      ${vaultLedgerSelectSql()}
      ${where.length > 0 ? `where ${where.join(" and ")}` : ""}
      order by created_at desc
      limit $${values.length};
    `,
    values
  };
}

export function mapVaultLedgerRow(row: Record<string, unknown>): VaultLedgerRow {
  return {
    id: String(row.id),
    kind: row.kind as VaultLedgerKind,
    title: String(row.title),
    status: typeof row.status === "string" ? row.status : undefined,
    sourceTable: String(row.source_table),
    payload: typeof row.payload === "object" && row.payload !== null ? row.payload as Record<string, unknown> : {},
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at)
  };
}

export const VAULT_LEDGER_SQL_LAW = [
  "The ledger is a read model over durable vault tables.",
  "Ledger rows are evidence, not approval.",
  "Each source table remains the authority for its own record type.",
  "Status and task filters narrow evidence without changing authorization.",
  "The unified ledger exists so the Enclave can see time-ordered memory, approval, progress, outpost, and receipt records together."
] as const;
