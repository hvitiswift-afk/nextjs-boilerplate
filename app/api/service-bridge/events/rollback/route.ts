import { NextRequest, NextResponse } from "next/server";

import type { ServiceMission } from "@/lib/service-bridge";
import {
  createRollbackPlan,
  type LocalPersistenceReceipt,
} from "@/lib/service-bridge-rollback";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const receipt = payload?.receipt as LocalPersistenceReceipt;
    const currentMissions = payload?.currentMissions as ServiceMission[];
    const confirmation = String(payload?.confirmation ?? "");

    if (!receipt || !Array.isArray(currentMissions)) {
      return NextResponse.json(
        { error: "Provide a local persistence receipt and currentMissions array." },
        { status: 400 },
      );
    }

    const plan = createRollbackPlan({ receipt, currentMissions, confirmation });
    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid rollback payload." },
      { status: 400 },
    );
  }
}
