import { NextRequest, NextResponse } from "next/server";

import { ServiceMission, validateMission } from "@/lib/service-bridge";

const MAX_QUEUE_SIZE = 250;

function priorityScore(mission: ServiceMission) {
  const validation = validateMission(mission);
  const stateWeight: Record<ServiceMission["state"], number> = {
    draft: 10,
    preflight: 20,
    "awaiting-approval": 35,
    ready: 50,
    verified: 5,
    closed: 0,
  };

  const readinessWeight = validation.readiness;
  const priorityWeight = Math.max(1, Math.min(10, Number(mission.priority) || 1)) * 10;
  const missingPenalty = validation.missing.length * 8;
  const warningPenalty = validation.warnings.length * 5;

  return stateWeight[mission.state] + readinessWeight + priorityWeight - missingPenalty - warningPenalty;
}

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

    if (missions.length > MAX_QUEUE_SIZE) {
      return NextResponse.json(
        { error: `Queue size exceeds the ${MAX_QUEUE_SIZE}-mission limit.` },
        { status: 413 },
      );
    }

    const ranked = missions
      .map((mission: ServiceMission) => {
        const validation = validateMission(mission);
        return {
          mission,
          validation,
          score: priorityScore(mission),
          nextAction:
            validation.verdict === "hold"
              ? `Complete: ${validation.missing.join(", ") || validation.warnings.join(", ") || "required checks"}`
              : validation.verdict === "ready-for-user-action"
                ? "Request or confirm final user approval, then open the official route."
                : validation.verdict === "verified"
                  ? "Attach final receipt and prepare closure."
                  : "No further action required unless reopened.",
        };
      })
      .sort((a, b) => b.score - a.score || b.validation.readiness - a.validation.readiness);

    const grouped = ranked.reduce<Record<string, number>>((acc, item) => {
      acc[item.mission.state] = (acc[item.mission.state] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      analyzedAt: new Date().toISOString(),
      maxQueueSize: MAX_QUEUE_SIZE,
      total: ranked.length,
      byState: grouped,
      nextMissionId: ranked[0]?.mission.id || null,
      queue: ranked,
      externalActionCompleted: false,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON queue payload." },
      { status: 400 },
    );
  }
}
