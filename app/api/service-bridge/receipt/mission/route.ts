import { NextRequest, NextResponse } from "next/server";

import { ServiceMission, validateMission } from "@/lib/service-bridge";
import { createMissionReceipt } from "@/lib/service-bridge-receipts";

export async function POST(request: NextRequest) {
  try {
    const mission = (await request.json()) as ServiceMission;
    const validation = validateMission(mission);

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

    return NextResponse.json(receipt, { status: validation.valid ? 200 : 422 });
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON mission payload." },
      { status: 400 },
    );
  }
}
