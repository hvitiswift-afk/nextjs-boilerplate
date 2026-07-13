import { NextRequest, NextResponse } from "next/server";

import type { ServiceMission } from "@/lib/service-bridge";
import { getLaunchUrl, validateMission } from "@/lib/service-bridge";
import { evaluateMissionPolicy } from "@/lib/service-bridge-policy";
import { createMissionReceipt } from "@/lib/service-bridge-receipts";

const MAX_BATCH = 100;

function orchestrateMission(mission: ServiceMission) {
  const validation = validateMission(mission);
  const policy = evaluateMissionPolicy(mission);
  const routeUrl = getLaunchUrl(mission);

  const planningAllowed = validation.valid && policy.decision !== "BLOCK";
  const openingAllowed = validation.valid && policy.decision === "ALLOW_PREPARE";

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

  return {
    missionId: mission.id,
    readiness: validation.readiness,
    validation,
    policy,
    route: {
      url: routeUrl,
      planningAllowed,
      openingAllowed,
      externalActionCompleted: false,
    },
    receiptDigest: receipt.integrity.digest,
    nextAction:
      policy.decision === "BLOCK"
        ? policy.nextAction
        : !validation.valid
          ? "Complete missing mission fields."
          : policy.decision === "HOLD_FOR_APPROVAL"
            ? "Prepare the exact action preview and wait for final approval."
            : "Continue preparation and evidence collection.",
    externalActionCompleted: false,
  };
}

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
    const summary = {
      total: results.length,
      valid: results.filter((item) => item.validation.valid).length,
      prepare: results.filter((item) => item.policy.decision === "ALLOW_PREPARE").length,
      hold: results.filter((item) => item.policy.decision === "HOLD_FOR_APPROVAL").length,
      blocked: results.filter((item) => item.policy.decision === "BLOCK").length,
      planningAllowed: results.filter((item) => item.route.planningAllowed).length,
      routeOpeningAllowed: results.filter((item) => item.route.openingAllowed).length,
    };

    return NextResponse.json({
      orchestratedAt: new Date().toISOString(),
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
