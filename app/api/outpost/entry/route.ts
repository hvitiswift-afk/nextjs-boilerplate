import { NextRequest, NextResponse } from "next/server";
import { hasDatabaseUrl, query } from "../../../../lib/db";
import { roundTrip, type OutpostEntryKind } from "../../../../lib/outpost-entry";
import { createOutpostEntry, insertOutpostEntry, listOutpostEntries, mapOutpostRow } from "../../../../lib/outpost-vault-sql";

const entryKinds: OutpostEntryKind[] = [
  "hyperscript",
  "progress",
  "approval",
  "receipt",
  "log",
  "memory",
  "deployment"
];

function isEntryKind(value: unknown): value is OutpostEntryKind {
  return typeof value === "string" && entryKinds.includes(value as OutpostEntryKind);
}

export async function GET() {
  if (hasDatabaseUrl()) {
    try {
      const rows = await query(listOutpostEntries(50));
      return NextResponse.json({
        ok: true,
        system: "Outpost Entry Bridge",
        outpost: "2099-2100",
        route: "/api/outpost/entry",
        accepts: entryKinds,
        persistentStorage: true,
        entries: rows.map(mapOutpostRow),
        law: "Every entry receives a round-trip return path."
      });
    } catch (error) {
      return NextResponse.json({
        ok: false,
        system: "Outpost Entry Bridge",
        persistentStorage: true,
        error: error instanceof Error ? error.message : "Unknown database error"
      }, { status: 503 });
    }
  }

  return NextResponse.json({
    ok: true,
    system: "Outpost Entry Bridge",
    outpost: "2099-2100",
    route: "/api/outpost/entry",
    accepts: entryKinds,
    persistentStorage: false,
    law: "Every entry receives a round-trip return path."
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  const id = typeof body.id === "string" && body.id.trim().length > 0
    ? body.id.trim()
    : `entry-${Date.now()}`;

  const kind = isEntryKind(body.kind) ? body.kind : "log";
  const payload = typeof body.payload === "object" && body.payload !== null
    ? body.payload as Record<string, unknown>
    : { message: "Outpost entry created without explicit payload." };

  const trip = roundTrip({
    id,
    kind,
    payload,
    createdAt: new Date().toISOString()
  });

  const outbound = createOutpostEntry({
    id: trip.outbound.id,
    kind: trip.outbound.kind,
    direction: trip.outbound.direction,
    origin: trip.outbound.origin,
    destination: trip.outbound.destination,
    payload,
    returnPath: trip.outbound.returnPath
  });

  const inbound = createOutpostEntry({
    id: trip.inbound.id,
    kind: trip.inbound.kind,
    direction: trip.inbound.direction,
    origin: trip.inbound.origin,
    destination: trip.inbound.destination,
    payload,
    returnPath: `/api/outpost/entry/${id}/return`
  });

  if (hasDatabaseUrl()) {
    try {
      const outboundRows = await query(insertOutpostEntry(outbound));
      const inboundRows = await query(insertOutpostEntry(inbound));

      return NextResponse.json({
        ok: true,
        system: "Returning Ledger",
        trip,
        entries: {
          outbound: outboundRows[0] ? mapOutpostRow(outboundRows[0]) : outbound,
          inbound: inboundRows[0] ? mapOutpostRow(inboundRows[0]) : inbound
        },
        returnUrl: `/api/outpost/entry/${id}/return`,
        persistentStorage: true
      });
    } catch (error) {
      return NextResponse.json({
        ok: false,
        system: "Returning Ledger",
        trip,
        entries: { outbound, inbound },
        returnUrl: `/api/outpost/entry/${id}/return`,
        persistentStorage: true,
        error: error instanceof Error ? error.message : "Unknown database error"
      }, { status: 503 });
    }
  }

  return NextResponse.json({
    ok: true,
    system: "Returning Ledger",
    trip,
    entries: { outbound, inbound },
    returnUrl: `/api/outpost/entry/${id}/return`,
    persistentStorage: false
  });
}
