import { NextRequest, NextResponse } from "next/server";

import type { ServiceMission } from "@/lib/service-bridge";
import { getLaunchUrl, validateMission } from "@/lib/service-bridge";
import { evaluateMissionPolicy } from "@/lib/service-bridge-policy";
import { createMissionReceipt } from "@/lib/service-bridge-receipts";

export async function POST(request: NextRequest) {
  try {
    const mission = (await request.json()) as ServiceMission;
    const validation = validateMission(mission);
    const policy = evaluateMissionPolicy(mission);
    const route = getLaunchUrl(mission);

    const readiness = validation.readiness;
    const allowedToPlan = validation.valid && policy.decision !== "BLOCK";
    const allowedToOpenRoute = validation.valid && policy.decision === "ALLOW_PREPARE";

    const receipt = createMissionReceipt({
      schema: "jp-hviti-service-bridge-receipt/v1",
      issuedAt: new Date().toISOString(),
      mission,
      validation: {
        readiness: validation.readiness,
        verdict: validation.verdict,
        missing: validation.missing,
        warnings: validation.warnings,
        launchUrl: validation.launchUrl,
        externalActionCompleted: false,
      },
      approvalBoundary: {
        explicitApprovalRequired: true,
        externalActionCompleted: false,
      },
    });

    const nextAction = policy.decision === "BLOCK"
      ? policy.nextAction
      : !validation.valid
        ? "Complete the missing mission fields before planning or opening a route."
        : policy.decision === "HOLD_FOR_APPROVAL"
          ? "Prepare the exact action preview and wait for final user approval."
          : "Continue preparation and evidence collection. Opening the official route remains user-controlled.";

    return NextResponse.json({
      orchestratedAt: new Date().toISOString(),
      missionId: mission?.id ?? null,
      readiness,
      validation,
      policy,
      route: {
        url: route,
        planningAllowed: allowedToPlan,
        openingAllowed: allowedToOpenRoute,
        externalActionCompleted: false,
      },
      receipt,
      nextAction,
      externalActionCompleted: false,
    }, { status: validation.valid ? 200 : 422 });
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON mission payload." },
      { status: 400 },
    );
  }
}
