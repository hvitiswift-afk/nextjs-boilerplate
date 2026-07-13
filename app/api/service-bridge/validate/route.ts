import { NextRequest, NextResponse } from "next/server";

import { ServiceMission, validateMission } from "@/lib/service-bridge";

export async function POST(request: NextRequest) {
  try {
    const mission = (await request.json()) as ServiceMission;

    if (!mission || typeof mission !== "object") {
      return NextResponse.json(
        { error: "A mission object is required." },
        { status: 400 },
      );
    }

    const result = validateMission(mission);

    return NextResponse.json({
      missionId: mission.id || null,
      checkedAt: new Date().toISOString(),
      ...result,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON mission payload." },
      { status: 400 },
    );
  }
}
