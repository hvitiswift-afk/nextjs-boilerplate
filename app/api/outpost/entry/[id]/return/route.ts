import { NextResponse } from "next/server";
import { hasDatabaseUrl, query } from "../../../../../../lib/db";
import { fromOutpost } from "../../../../../../lib/outpost-entry";
import { createOutpostEntry, getOutpostEntry, insertOutpostEntry, mapOutpostRow } from "../../../../../../lib/outpost-vault-sql";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const returned = fromOutpost({
    id: `${id}:return`,
    kind: "log",
    payload: {
      originalEntryId: id,
      message: "Entry returned from Outpost 2099-2100 to the enclave."
    },
    createdAt: new Date().toISOString()
  });

  const returnEntry = createOutpostEntry({
    id: returned.id,
    kind: returned.kind,
    direction: returned.direction,
    origin: returned.origin,
    destination: returned.destination,
    payload: returned.payload as Record<string, unknown>,
    returnPath: `/api/outpost/entry/${id}/return`
  });

  if (hasDatabaseUrl()) {
    try {
      const originalRows = await query(getOutpostEntry(id));
      const savedRows = await query(insertOutpostEntry(returnEntry));

      return NextResponse.json({
        ok: true,
        system: "Returning Ledger",
        returned,
        original: originalRows[0] ? mapOutpostRow(originalRows[0]) : null,
        entry: savedRows[0] ? mapOutpostRow(savedRows[0]) : returnEntry,
        persistentStorage: true
      });
    } catch (error) {
      return NextResponse.json({
        ok: false,
        system: "Returning Ledger",
        returned,
        entry: returnEntry,
        persistentStorage: true,
        error: error instanceof Error ? error.message : "Unknown database error"
      }, { status: 503 });
    }
  }

  return NextResponse.json({
    ok: true,
    system: "Returning Ledger",
    returned,
    entry: returnEntry,
    persistentStorage: false
  });
}
