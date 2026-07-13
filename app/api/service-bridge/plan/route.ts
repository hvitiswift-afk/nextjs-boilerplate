import { NextRequest, NextResponse } from "next/server";

import { getService, ServiceMission, validateMission } from "@/lib/service-bridge";

export async function POST(request: NextRequest) {
  try {
    const mission = (await request.json()) as ServiceMission;
    const validation = validateMission(mission);
    const service = getService(mission.service);

    const plan = {
      missionId: mission.id || null,
      generatedAt: new Date().toISOString(),
      service: service
        ? {
            id: service.id,
            name: service.name,
            kind: service.kind,
            capabilities: service.capabilities,
            notes: service.notes,
          }
        : null,
      route: validation.launchUrl,
      verdict: validation.verdict,
      readiness: validation.readiness,
      missing: validation.missing,
      warnings: validation.warnings,
      steps: [
        "Review target, action, owner, cost, permission, evidence, and fallback.",
        "Resolve every missing field and warning.",
        "Confirm the service route is official and appropriate.",
        "Obtain explicit user approval for any external action.",
        "Open the route without implying completion.",
        "Let the user complete any booking, order, payment, application, or submission.",
        "Capture evidence or receipt and update the mission state.",
      ],
      approvalGate: {
        required: service?.externalAction ?? true,
        satisfied: Boolean(mission.permission.trim()),
      },
      externalActionCompleted: false,
    };

    const status = validation.valid ? 200 : 422;
    return NextResponse.json(plan, { status });
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON mission payload." },
      { status: 400 },
    );
  }
}
