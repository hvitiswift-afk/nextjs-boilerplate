import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const schemaPath = path.join(root, "infra", "memory-vault.sql");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required. Refusing to run migration without an explicit database target.");
  process.exit(1);
}

const sql = await fs.readFile(schemaPath, "utf8");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined
});

try {
  await pool.query(sql);
  console.log("Memory Vault migration complete.");
  console.log("Tables prepared: memory_records, approval_records, progress_events, outpost_entries, receipt_records.");
} catch (error) {
  console.error("Memory Vault migration failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
