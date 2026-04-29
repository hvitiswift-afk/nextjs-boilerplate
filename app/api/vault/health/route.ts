import { NextResponse } from "next/server";
import { hasDatabaseUrl, query } from "../../../../lib/db";

const checks = [
  { table: "memory_records", label: "Memory Vault" },
  { table: "approval_records", label: "Approval Vault" },
  { table: "approval_decision_audit_records", label: "Approval Decision Audit Vault" },
  { table: "progress_events", label: "Progress Vault" },
  { table: "outpost_entries", label: "Outpost Vault" },
  { table: "receipt_records", label: "Receipt Vault" }
] as const;

type VaultHealthCheck = {
  table: string;
  label: string;
  ok: boolean;
  count?: number;
  error?: string;
};

async function countTable(table: string) {
  const rows = await query({
    text: `select count(*)::int as count from ${table};`,
    values: []
  });

  const value = rows[0]?.count;
  return typeof value === "number" ? value : Number(value ?? 0);
}

export async function GET() {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({
      ok: true,
      system: "Stone Vault Health",
      persistentStorage: false,
      checks: checks.map((check) => ({
        table: check.table,
        label: check.label,
        ok: false,
        error: "DATABASE_URL is not configured."
      })),
      law: [
        "Health is diagnostic, not approval.",
        "Missing database configuration is visible.",
        "Each durable table reports independently.",
        "Approval decision audit health is evidence, not authorization.",
        "Violet Gate still controls consequence-bearing execution."
      ]
    });
  }

  const results: VaultHealthCheck[] = [];

  for (const check of checks) {
    try {
      results.push({
        table: check.table,
        label: check.label,
        ok: true,
        count: await countTable(check.table)
      });
    } catch (error) {
      results.push({
        table: check.table,
        label: check.label,
        ok: false,
        error: error instanceof Error ? error.message : "Unknown database error"
      });
    }
  }

  const allOk = results.every((result) => result.ok);

  return NextResponse.json({
    ok: allOk,
    system: "Stone Vault Health",
    persistentStorage: true,
    checks: results,
    law: [
      "Health is diagnostic, not approval.",
      "Missing database configuration is visible.",
      "Each durable table reports independently.",
      "Approval decision audit health is evidence, not authorization.",
      "Violet Gate still controls consequence-bearing execution."
    ]
  }, { status: allOk ? 200 : 503 });
}
