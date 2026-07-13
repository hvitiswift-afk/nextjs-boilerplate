import { NextRequest, NextResponse } from "next/server";

import type { ServiceMission } from "@/lib/service-bridge";
import {
  orchestrateMission,
  summarizeOrchestrations,
} from "@/lib/service-bridge-orchestration";

const MAX_BATCH = 100;

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const missions = (Array.isArray(payload) ? payload : payload?.missions) as ServiceMission[];

    if (!Array.isArray(missions)) {
      return NextResponse.json(
        { error: "Provide an array or an object with a missions array." },
        { status: 400 },
      );
    }

    if (missions.length > MAX_BATCH) {
      return NextResponse.json(
        { error: `Maximum batch size is ${MAX_BATCH}.` },
        { status: 413 },
      );
    }

    const results = missions.map(orchestrateMission);

    return NextResponse.json({
      orchestratedAt: new Date().toISOString(),
      summary: summarizeOrchestrations(results),
      results: results.map((item) => ({
        missionId: item.missionId,
        readiness: item.readiness,
        validation: item.validation,
        policy: item.policy,
        route: item.route,
        receiptDigest: item.receiptDigest,
        nextAction: item.nextAction,
        externalActionCompleted: false,
      })),
      externalActionCompleted: false,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON batch payload." },
      { status: 400 },
    );
  }
}
