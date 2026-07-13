import { NextRequest, NextResponse } from "next/server";

import { createServiceBridgeEvent, ServiceBridgeEvent } from "@/lib/service-bridge-events";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const previous = (payload?.previousEvent ?? null) as ServiceBridgeEvent | null;

    if (!payload?.missionId || !payload?.type || !payload?.actor) {
      return NextResponse.json(
        { error: "missionId, type, and actor are required." },
        { status: 400 },
      );
    }

    const event = createServiceBridgeEvent({
      id: payload.id || `EVT-${Date.now()}`,
      missionId: String(payload.missionId),
      type: payload.type,
      occurredAt: payload.occurredAt || new Date().toISOString(),
      actor: String(payload.actor),
      data: typeof payload.data === "object" && payload.data ? payload.data : {},
      previousDigest: previous?.digest ?? payload.previousDigest ?? null,
    });

    return NextResponse.json({
      event,
      chainPosition: previous ? "continuation" : "genesis",
      externalActionCompleted: false,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON event payload." },
      { status: 400 },
    );
  }
}
