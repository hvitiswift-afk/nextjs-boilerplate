import { NextRequest, NextResponse } from "next/server";

import type { ServiceMission } from "@/lib/service-bridge";
import { evaluateMissionPolicy } from "@/lib/service-bridge-policy";

export async function POST(request: NextRequest) {
  try {
    const mission = (await request.json()) as ServiceMission;
    const evaluation = evaluateMissionPolicy(mission);

    return NextResponse.json({
      evaluatedAt: new Date().toISOString(),
      missionId: mission?.id ?? null,
      ...evaluation,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON mission payload." },
      { status: 400 },
    );
  }
}
