import { Pool, type QueryResultRow } from "pg";
import type { SqlStatement } from "./memory-vault-sql";

let pool: Pool | undefined;

export function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);
}

export function getPool(): Pool {
  if (!hasDatabaseUrl()) {
    throw new Error("DATABASE_URL is not configured. Memory Vault persistence is unavailable.");
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: Number(process.env.DB_POOL_MAX ?? 5),
      idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS ?? 30_000),
      connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS ?? 5_000),
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined
    });
  }

  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(statement: SqlStatement): Promise<T[]> {
  const client = await getPool().connect();
  try {
    const result = await client.query<T>(statement.text, statement.values);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}

export const DB_LAW = [
  "DATABASE_URL stays in the environment, never in source.",
  "All queries use parameterized statements.",
  "Persistence can be disabled safely when no database is configured.",
  "No payment secrets or card data are stored in the Memory Vault."
] as const;
