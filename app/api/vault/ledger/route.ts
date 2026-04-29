import { NextRequest, NextResponse } from "next/server";
import { hasDatabaseUrl, query } from "../../../../lib/db";
import { listVaultLedgerFiltered, mapVaultLedgerRow, type VaultLedgerKind } from "../../../../lib/vault-ledger-sql";

const ledgerKinds: VaultLedgerKind[] = ["memory", "approval", "approval-audit", "progress", "outpost", "receipt"];

function isVaultLedgerKind(value: unknown): value is VaultLedgerKind {
  return typeof value === "string" && ledgerKinds.includes(value as VaultLedgerKind);
}

function readLimit(value: string | null): number {
  const parsed = value ? Number.parseInt(value, 10) : 100;
  if (Number.isNaN(parsed)) return 100;
  return Math.min(Math.max(parsed, 1), 250);
}

function readOptionalText(value: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind");
  const status = readOptionalText(searchParams.get("status"));
  const taskId = readOptionalText(searchParams.get("taskId"));
  const approvalId = readOptionalText(searchParams.get("approvalId"));
  const limit = readLimit(searchParams.get("limit"));
  const filter = {
    kind: isVaultLedgerKind(kind) ? kind : undefined,
    status,
    taskId,
    approvalId,
    limit
  };

  if (!hasDatabaseUrl()) {
    return NextResponse.json({
      ok: true,
      system: "Unified Vault Ledger",
      persistentStorage: false,
      rows: [],
      accepts: {
        kinds: ledgerKinds,
        filters: ["kind", "status", "taskId", "approvalId", "limit"]
      },
      filter,
      message: "DATABASE_URL is not configured. The unified ledger is available when the Stone Vault database is connected."
    });
  }

  try {
    const rows = await query(listVaultLedgerFiltered(filter));

    return NextResponse.json({
      ok: true,
      system: "Unified Vault Ledger",
      persistentStorage: true,
      filter,
      limit,
      rows: rows.map(mapVaultLedgerRow),
      law: [
        "The ledger is a read model over durable vault tables.",
        "Ledger rows are evidence, not approval.",
        "Each source table remains the authority for its own record type.",
        "Status, task, and approval filters narrow evidence without changing authorization.",
        "Approval decision audit rows show Violet Gate transition evidence.",
        "The unified ledger exists so the Enclave can see time-ordered memory, approval, audit, progress, outpost, and receipt records together."
      ]
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      system: "Unified Vault Ledger",
      persistentStorage: true,
      filter,
      error: error instanceof Error ? error.message : "Unknown database error"
    }, { status: 503 });
  }
}
