import { NextRequest, NextResponse } from "next/server";
import { createMemoryRecord, createMemoryVault, type MemoryVaultKind } from "../../../lib/memory-vault";

const allowedKinds: MemoryVaultKind[] = ["hyperscript", "progress", "approval", "receipt", "outpost-entry", "uv7", "health", "ledger", "note"];

function isMemoryKind(value: unknown): value is MemoryVaultKind {
  return typeof value === "string" && allowedKinds.includes(value as MemoryVaultKind);
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
  return NextResponse.json({ ok: true, system: "Memory Vault", vault: seeded });
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

  return NextResponse.json({
    ok: true,
    system: "Memory Vault",
    record,
    persistentStorage: false
  });
}
