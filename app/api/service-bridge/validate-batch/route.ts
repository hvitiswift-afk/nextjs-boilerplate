import { NextRequest, NextResponse } from "next/server";

import { ServiceMission, validateMission } from "@/lib/service-bridge";

const MAX_BATCH_SIZE = 100;

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const missions = Array.isArray(payload) ? payload : payload?.missions;

    if (!Array.isArray(missions)) {
      return NextResponse.json(
        { error: "Provide an array of missions or an object with a missions array." },
        { status: 400 },
      );
    }

    if (missions.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        { error: `Batch size exceeds the ${MAX_BATCH_SIZE}-mission limit.` },
        { status: 413 },
      );
    }

    const checkedAt = new Date().toISOString();
    const results = missions.map((mission: ServiceMission, index: number) => ({
      index,
      missionId: mission?.id || null,
      ...validateMission(mission),
    }));

    const summary = results.reduce(
      (acc, result) => {
        acc.total += 1;
        acc[result.verdict] += 1;
        if (result.valid) acc.valid += 1;
        else acc.invalid += 1;
        return acc;
      },
      {
        total: 0,
        valid: 0,
        invalid: 0,
        hold: 0,
        "ready-for-user-action": 0,
        verified: 0,
        closed: 0,
      },
    );

    return NextResponse.json({
      checkedAt,
      maxBatchSize: MAX_BATCH_SIZE,
      summary,
      results,
      externalActionCompleted: false,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON batch payload." },
      { status: 400 },
    );
  }
}
