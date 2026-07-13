import { NextRequest, NextResponse } from "next/server";

import type { ServiceMission } from "@/lib/service-bridge";
import type { ServiceBridgeEvent } from "@/lib/service-bridge-events";
import { reconcileMissionSnapshot } from "@/lib/service-bridge-reconciliation";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const snapshot = payload?.snapshot as ServiceMission;
    const events = payload?.events as ServiceBridgeEvent[];

    if (!snapshot || !Array.isArray(events)) {
      return NextResponse.json(
        { error: "Provide a snapshot and an events array." },
        { status: 400 },
      );
    }

    const result = reconcileMissionSnapshot(snapshot, events);

    return NextResponse.json(
      {
        reconciledAt: new Date().toISOString(),
        ...result,
      },
      { status: result.consistent ? 200 : 409 },
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON reconciliation payload." },
      { status: 400 },
    );
  }
}
