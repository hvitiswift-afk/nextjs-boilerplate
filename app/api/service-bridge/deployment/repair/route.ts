import { NextRequest, NextResponse } from "next/server";

import { createDeploymentRepairPlan } from "@/lib/service-bridge-deployment-repair";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const plan = createDeploymentRepairPlan({
      commitSha: String(payload?.commitSha ?? ""),
      providers: Array.isArray(payload?.providers) ? payload.providers : [],
      preferredStrategy: payload?.preferredStrategy,
      confirmation: String(payload?.confirmation ?? ""),
    });
    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid deployment repair request.",
      },
      { status: 400 },
    );
  }
}
