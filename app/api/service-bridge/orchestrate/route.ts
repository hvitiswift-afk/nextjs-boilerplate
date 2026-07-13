import { NextRequest, NextResponse } from "next/server";

import type { ServiceMission } from "@/lib/service-bridge";
import { orchestrateMission } from "@/lib/service-bridge-orchestration";

export async function POST(request: NextRequest) {
  try {
    const mission = (await request.json()) as ServiceMission;
    const result = orchestrateMission(mission);

    return NextResponse.json(result, {
      status: result.validation.valid ? 200 : 422,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON mission payload." },
      { status: 400 },
    );
  }
}
