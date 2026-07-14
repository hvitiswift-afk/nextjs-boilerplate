import { NextRequest, NextResponse } from "next/server";

import type { ServiceMission } from "@/lib/service-bridge";
import {
  createLifecycleProjectionApplyPlan,
  type LifecycleProjectionSnapshot,
} from "@/lib/service-bridge-lifecycle-apply";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const projection = payload?.projection as LifecycleProjectionSnapshot;
    const currentMissions = payload?.currentMissions as ServiceMission[];
    const projectedMission = payload?.projectedMission as ServiceMission;
    const confirmation = String(payload?.confirmation ?? "");

    if (!projection || !Array.isArray(currentMissions) || !projectedMission) {
      return NextResponse.json(
        {
          error:
            "Provide projection, currentMissions, projectedMission, and confirmation.",
        },
        { status: 400 },
      );
    }

    const plan = createLifecycleProjectionApplyPlan({
      projection,
      currentMissions,
      projectedMission,
      confirmation,
    });

    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid lifecycle projection apply payload.",
      },
      { status: 400 },
    );
  }
}
