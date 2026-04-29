import type { SqlStatement } from "./memory-vault-sql";

export type VaultLedgerKind = "memory" | "approval" | "progress" | "outpost" | "receipt";

export type VaultLedgerRow = {
  id: string;
  kind: VaultLedgerKind;
  title: string;
  status?: string;
  sourceTable: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

export function listVaultLedger(limit = 100): SqlStatement {
  return {
    text: `
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
      order by created_at desc
      limit $1;
    `,
    values: [limit]
  };
}

export function listVaultLedgerByKind(kind: VaultLedgerKind, limit = 100): SqlStatement {
  return {
    text: `
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
          jsonb_build_object('taskId', task_id, 'risk', risk, 'requestedAction', requested_action, 'status', status, 'decidedAt', decided_at) as payload,
          created_at
        from approval_records

        union all

        select
          id,
          'progress' as kind,
          message as title,
          status,
          'progress_events' as source_table,
          jsonb_build_object('taskId', task_id, 'step', step, 'status', status, 'message', message) as payload,
          created_at
        from progress_events

        union all

        select
          id,
          'outpost' as kind,
          kind || ' ' || direction as title,
          direction as status,
          'outpost_entries' as source_table,
          jsonb_build_object('entryKind', kind, 'direction', direction, 'origin', origin, 'destination', destination, 'returnPath', return_path, 'payload', payload) as payload,
          created_at
        from outpost_entries

        union all

        select
          id,
          'receipt' as kind,
          description as title,
          status,
          'receipt_records' as source_table,
          jsonb_build_object('source', source, 'status', status, 'amount', amount, 'currency', currency, 'description', description, 'outpostReturnUrl', outpost_return_url) as payload,
          created_at
        from receipt_records
      ) ledger
      where kind = $1
      order by created_at desc
      limit $2;
    `,
    values: [kind, limit]
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
  "The unified ledger exists so the Enclave can see time-ordered memory, approval, progress, outpost, and receipt records together."
] as const;
