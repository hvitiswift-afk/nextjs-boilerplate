import type { SqlStatement } from "./memory-vault-sql";

export type OutpostDirection = "to-outpost" | "from-outpost" | "round-trip";

export type OutpostEntryRecord = {
  id: string;
  kind: string;
  direction: OutpostDirection;
  origin: string;
  destination: string;
  payload: Record<string, unknown>;
  returnPath?: string;
  createdAt: string;
};

export function createOutpostEntry(input: {
  id?: string;
  kind?: string;
  direction?: OutpostDirection;
  origin?: string;
  destination?: string;
  payload?: Record<string, unknown>;
  returnPath?: string;
}): OutpostEntryRecord {
  const id = input.id && input.id.trim().length > 0 ? input.id.trim() : `outpost-${Date.now()}`;

  return {
    id,
    kind: input.kind && input.kind.trim().length > 0 ? input.kind.trim() : "entry",
    direction: input.direction ?? "round-trip",
    origin: input.origin && input.origin.trim().length > 0 ? input.origin.trim() : "enclave",
    destination: input.destination && input.destination.trim().length > 0 ? input.destination.trim() : "outpost-2099-2100",
    payload: input.payload ?? {},
    returnPath: input.returnPath ?? `/api/outpost/entry/${id}/return`,
    createdAt: new Date().toISOString()
  };
}

export function insertOutpostEntry(record: OutpostEntryRecord): SqlStatement {
  return {
    text: `
      insert into outpost_entries (id, kind, direction, origin, destination, payload, return_path, created_at)
      values ($1, $2, $3, $4, $5, $6::jsonb, $7, $8::timestamptz)
      on conflict (id) do update set
        kind = excluded.kind,
        direction = excluded.direction,
        origin = excluded.origin,
        destination = excluded.destination,
        payload = excluded.payload,
        return_path = excluded.return_path
      returning *;
    `,
    values: [
      record.id,
      record.kind,
      record.direction,
      record.origin,
      record.destination,
      JSON.stringify(record.payload),
      record.returnPath ?? null,
      record.createdAt
    ]
  };
}

export function listOutpostEntries(limit = 50): SqlStatement {
  return {
    text: `
      select id, kind, direction, origin, destination, payload, return_path, created_at
      from outpost_entries
      order by created_at desc
      limit $1;
    `,
    values: [limit]
  };
}

export function getOutpostEntry(id: string): SqlStatement {
  return {
    text: `
      select id, kind, direction, origin, destination, payload, return_path, created_at
      from outpost_entries
      where id = $1
      limit 1;
    `,
    values: [id]
  };
}

export function mapOutpostRow(row: Record<string, unknown>): OutpostEntryRecord {
  const payload = typeof row.payload === "object" && row.payload !== null
    ? row.payload as Record<string, unknown>
    : {};

  return {
    id: String(row.id),
    kind: String(row.kind),
    direction: row.direction as OutpostDirection,
    origin: String(row.origin),
    destination: String(row.destination),
    payload,
    returnPath: typeof row.return_path === "string" ? row.return_path : undefined,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at)
  };
}

export const OUTPOST_VAULT_SQL_LAW = [
  "Every Outpost entry has a direction.",
  "Round trips carry a return path.",
  "Outpost records are durable evidence, not approval.",
  "The Enclave can always ask where an entry came from and where it returns."
] as const;
