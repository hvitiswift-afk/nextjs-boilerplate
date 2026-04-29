import { NextRequest, NextResponse } from "next/server";
import { hasDatabaseUrl, query } from "../../../../lib/db";
import { listVaultLedger, listVaultLedgerByKind, mapVaultLedgerRow, type VaultLedgerKind } from "../../../../lib/vault-ledger-sql";

const ledgerKinds: VaultLedgerKind[] = ["memory", "approval", "progress", "outpost", "receipt"];

function isVaultLedgerKind(value: unknown): value is VaultLedgerKind {
  return typeof value === "string" && ledgerKinds.includes(value as VaultLedgerKind);
}

function readLimit(value: string | null): number {
  const parsed = value ? Number.parseInt(value, 10) : 100;
  if (Number.isNaN(parsed)) return 100;
  return Math.min(Math.max(parsed, 1), 250);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind");
  const limit = readLimit(searchParams.get("limit"));

  if (!hasDatabaseUrl()) {
    return NextResponse.json({
      ok: true,
      system: "Unified Vault Ledger",
      persistentStorage: false,
      rows: [],
      accepts: ledgerKinds,
      message: "DATABASE_URL is not configured. The unified ledger is available when the Stone Vault database is connected."
    });
  }

  try {
    const rows = await query(isVaultLedgerKind(kind) ? listVaultLedgerByKind(kind, limit) : listVaultLedger(limit));

    return NextResponse.json({
      ok: true,
      system: "Unified Vault Ledger",
      persistentStorage: true,
      filter: isVaultLedgerKind(kind) ? { kind } : null,
      limit,
      rows: rows.map(mapVaultLedgerRow),
      law: [
        "The ledger is a read model over durable vault tables.",
        "Ledger rows are evidence, not approval.",
        "Each source table remains the authority for its own record type.",
        "The unified ledger exists so the Enclave can see time-ordered memory, approval, progress, outpost, and receipt records together."
      ]
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      system: "Unified Vault Ledger",
      persistentStorage: true,
      error: error instanceof Error ? error.message : "Unknown database error"
    }, { status: 503 });
  }
}
