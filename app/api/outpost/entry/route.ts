import { NextRequest, NextResponse } from "next/server";
import { roundTrip, type OutpostEntryKind } from "../../../../lib/outpost-entry";

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
  return NextResponse.json({
    ok: true,
    system: "Outpost Entry Bridge",
    outpost: "2099-2100",
    route: "/api/outpost/entry",
    accepts: entryKinds,
    law: "Every entry receives a round-trip return path."
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  const id = typeof body.id === "string" && body.id.trim().length > 0
    ? body.id.trim()
    : `entry-${Date.now()}`;

  const kind = isEntryKind(body.kind) ? body.kind : "log";
  const payload = body.payload ?? {
    message: "Outpost entry created without explicit payload."
  };

  const trip = roundTrip({
    id,
    kind,
    payload,
    createdAt: new Date().toISOString()
  });

  return NextResponse.json({
    ok: true,
    system: "Returning Ledger",
    trip,
    returnUrl: `/api/outpost/entry/${id}/return`
  });
}
