import { NextRequest, NextResponse } from "next/server";

import type { ServiceBridgeEvent } from "@/lib/service-bridge-events";
import { projectMissionFromEvents } from "@/lib/service-bridge-projection";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const events = (Array.isArray(payload) ? payload : payload?.events) as ServiceBridgeEvent[];

    if (!Array.isArray(events)) {
      return NextResponse.json(
        { error: "Provide an event array or an object with an events array." },
        { status: 400 },
      );
    }

    const projection = projectMissionFromEvents(events);

    return NextResponse.json(
      {
        projectedAt: new Date().toISOString(),
        ...projection,
      },
      { status: projection.chainValid ? 200 : 422 },
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON event-chain payload." },
      { status: 400 },
    );
  }
}
