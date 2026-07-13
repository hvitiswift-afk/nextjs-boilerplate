import { NextRequest, NextResponse } from "next/server";

import type { ServiceMission } from "@/lib/service-bridge";
import {
  createPersistencePlan,
  type ResolutionPacket,
} from "@/lib/service-bridge-persistence";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const resolution = payload?.resolution as ResolutionPacket;
    const currentMissions = payload?.currentMissions as ServiceMission[];
    const confirmation = String(payload?.confirmation ?? "");

    if (!resolution || !Array.isArray(currentMissions)) {
      return NextResponse.json(
        { error: "Provide a resolution and currentMissions array." },
        { status: 400 },
      );
    }

    const plan = createPersistencePlan({
      resolution,
      currentMissions,
      confirmation,
    });

    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid persistence payload." },
      { status: 400 },
    );
  }
}
