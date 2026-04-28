import { NextRequest, NextResponse } from "next/server";
import { hasDatabaseUrl, query } from "../../../lib/db";
import { createMemoryRecord, createMemoryVault, type MemoryVaultKind, type MemoryVaultRecord } from "../../../lib/memory-vault";
import { insertMemoryRecord, listMemoryRecords } from "../../../lib/memory-vault-sql";

const allowedKinds: MemoryVaultKind[] = ["hyperscript", "progress", "approval", "receipt", "outpost-entry", "uv7", "health", "ledger", "note"];

function isMemoryKind(value: unknown): value is MemoryVaultKind {
  return typeof value === "string" && allowedKinds.includes(value as MemoryVaultKind);
}

function mapDbRow(row: Record<string, unknown>): MemoryVaultRecord {
  return {
    id: String(row.id),
    kind: row.kind as MemoryVaultKind,
    title: String(row.title),
    payload: row.payload ?? {},
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    outpostReturnUrl: typeof row.outpost_return_url === "string" ? row.outpost_return_url : undefined,
    tags: Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === "string") : []
  };
}

const seeded = createMemoryVault([
  createMemoryRecord({
    id: "memory-status",
    kind: "health",
    title: "Seed status record",
    payload: { ready: true, openLoop: true },
    tags: ["status"],
    outpostReturnUrl: "/api/outpost/entry/memory-status/return"
  })
]);

export async function GET() {
  if (hasDatabaseUrl()) {
    try {
      const rows = await query(listMemoryRecords(50));
      return NextResponse.json({
        ok: true,
        system: "Memory Vault",
        persistentStorage: true,
        vault: createMemoryVault(rows.map(mapDbRow))
      });
    } catch (error) {
      return NextResponse.json({
        ok: false,
        system: "Memory Vault",
        persistentStorage: true,
        fallback: seeded,
        error: error instanceof Error ? error.message : "Unknown database error"
      }, { status: 503 });
    }
  }

  return NextResponse.json({ ok: true, system: "Memory Vault", persistentStorage: false, vault: seeded });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" && body.id.trim().length > 0 ? body.id.trim() : `memory-${Date.now()}`;
  const kind = isMemoryKind(body.kind) ? body.kind : "note";
  const title = typeof body.title === "string" && body.title.trim().length > 0 ? body.title.trim() : "Untitled record";
  const payload = body.payload ?? { message: "Record created." };
  const tags = Array.isArray(body.tags) ? body.tags.filter((tag: unknown) => typeof tag === "string") : [];

  const record = createMemoryRecord({
    id,
    kind,
    title,
    payload,
    tags,
    outpostReturnUrl: `/api/outpost/entry/${id}/return`
  });

  if (hasDatabaseUrl()) {
    try {
      const rows = await query(insertMemoryRecord(record));
      return NextResponse.json({
        ok: true,
        system: "Memory Vault",
        persistentStorage: true,
        record: rows[0] ? mapDbRow(rows[0]) : record
      });
    } catch (error) {
      return NextResponse.json({
        ok: false,
        system: "Memory Vault",
        persistentStorage: true,
        record,
        error: error instanceof Error ? error.message : "Unknown database error"
      }, { status: 503 });
    }
  }

  return NextResponse.json({
    ok: true,
    system: "Memory Vault",
    record,
    persistentStorage: false
  });
}
