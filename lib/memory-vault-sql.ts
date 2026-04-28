import type { MemoryVaultRecord } from "./memory-vault";

export type SqlStatement = {
  text: string;
  values: unknown[];
};

export function insertMemoryRecord(record: MemoryVaultRecord): SqlStatement {
  return {
    text: `
      insert into memory_records (id, kind, title, payload, tags, outpost_return_url)
      values ($1, $2, $3, $4::jsonb, $5::text[], $6)
      on conflict (id) do update set
        kind = excluded.kind,
        title = excluded.title,
        payload = excluded.payload,
        tags = excluded.tags,
        outpost_return_url = excluded.outpost_return_url,
        updated_at = now()
      returning *;
    `,
    values: [
      record.id,
      record.kind,
      record.title,
      JSON.stringify(record.payload),
      record.tags,
      record.outpostReturnUrl ?? null
    ]
  };
}

export function listMemoryRecords(limit = 50): SqlStatement {
  return {
    text: `
      select id, kind, title, payload, tags, outpost_return_url, created_at, updated_at
      from memory_records
      order by created_at desc
      limit $1;
    `,
    values: [limit]
  };
}

export function getMemoryRecord(id: string): SqlStatement {
  return {
    text: `
      select id, kind, title, payload, tags, outpost_return_url, created_at, updated_at
      from memory_records
      where id = $1
      limit 1;
    `,
    values: [id]
  };
}

export function searchMemoryRecordsByTag(tag: string, limit = 50): SqlStatement {
  return {
    text: `
      select id, kind, title, payload, tags, outpost_return_url, created_at, updated_at
      from memory_records
      where $1 = any(tags)
      order by created_at desc
      limit $2;
    `,
    values: [tag, limit]
  };
}

export const MEMORY_VAULT_SQL_LAW = [
  "Parameterized queries only.",
  "No secrets in source.",
  "No hidden payments.",
  "No irreversible action without approval.",
  "Every durable record may carry an Outpost return path."
] as const;
