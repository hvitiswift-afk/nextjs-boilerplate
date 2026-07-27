import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const schemaPath = path.join(root, "infra", "matadata-intake.sql");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required. Refusing to migrate an unspecified database.");
  process.exit(1);
}

const sql = await fs.readFile(schemaPath, "utf8");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

try {
  await pool.query(sql);
  console.log("MATADATA intake migration complete.");
  console.log("Tables prepared: matadata_intake_submissions, matadata_intake_receipt_events.");
} catch (error) {
  console.error("MATADATA intake migration failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
