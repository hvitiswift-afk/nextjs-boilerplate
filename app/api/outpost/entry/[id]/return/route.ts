import { NextResponse } from "next/server";
import { fromOutpost } from "../../../../../../lib/outpost-entry";

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

  return NextResponse.json({
    ok: true,
    system: "Returning Ledger",
    returned
  });
}
