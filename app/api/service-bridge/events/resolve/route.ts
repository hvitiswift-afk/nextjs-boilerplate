import { NextRequest, NextResponse } from "next/server";

import type { ServiceMission } from "@/lib/service-bridge";
import type { ServiceBridgeEvent } from "@/lib/service-bridge-events";
import {
  createReconciliationResolution,
  type ResolutionAuthority,
} from "@/lib/service-bridge-resolution";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const snapshot = payload?.snapshot as ServiceMission;
    const events = payload?.events as ServiceBridgeEvent[];
    const authority = payload?.authority as ResolutionAuthority;
    const actor = String(payload?.actor ?? "");
    const reason = String(payload?.reason ?? "");
    const manualState = payload?.manualState as Partial<ServiceMission> | undefined;

    if (!snapshot || !Array.isArray(events)) {
      return NextResponse.json(
        { error: "Provide a snapshot and an events array." },
        { status: 400 },
      );
    }

    if (!["snapshot", "projection", "manual"].includes(authority)) {
      return NextResponse.json(
        { error: "Authority must be snapshot, projection, or manual." },
        { status: 400 },
      );
    }

    const resolution = createReconciliationResolution({
      snapshot,
      events,
      authority,
      actor,
      reason,
      manualState,
    });

    return NextResponse.json(resolution, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid resolution payload." },
      { status: 400 },
    );
  }
}
