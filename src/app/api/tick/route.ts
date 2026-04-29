import { NextResponse } from "next/server";

type TickRequest = {
  idempotency_key?: string;
  timestamp?: string;
  production_id?: string;
  event_type?: string;
  layer?: string[];
  actor?: Record<string, unknown>;
  object?: Record<string, unknown>;
  location?: Record<string, unknown>;
  source?: Record<string, unknown>;
};

const REQUIRED_FIELDS: Array<keyof TickRequest> = [
  "idempotency_key",
  "timestamp",
  "production_id",
  "event_type",
  "source"
];

function validateTick(body: TickRequest) {
  const missing = REQUIRED_FIELDS.filter((field) => !body[field]);

  if (missing.length) {
    return {
      ok: false,
      missing
    };
  }

  return { ok: true, missing: [] as string[] };
}

export async function POST(req: Request) {
  const body = (await req.json()) as TickRequest;
  const validation = validateTick(body);

  if (!validation.ok) {
    return NextResponse.json(
      {
        ok: false,
        status: "rejected",
        reason: "Missing required SAME-TICK fields.",
        missing: validation.missing
      },
      { status: 400 }
    );
  }

  const tickId = `GL-TICK-${Date.now()}`;

  return NextResponse.json({
    ok: true,
    tick_id: tickId,
    status: "stored_mock",
    metrics_updated: true,
    event: {
      idempotency_key: body.idempotency_key,
      timestamp: body.timestamp,
      production_id: body.production_id,
      event_type: body.event_type,
      layer: body.layer ?? [],
      actor: body.actor ?? null,
      object: body.object ?? null,
      location: body.location ?? null,
      source: body.source
    },
    rule: "Every event enters once. Every event has a source. Every event can update the geometry."
  });
}
