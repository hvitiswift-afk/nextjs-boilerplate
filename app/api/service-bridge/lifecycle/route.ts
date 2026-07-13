import { NextRequest, NextResponse } from "next/server";

import {
  createLifecycleEntry,
  verifyLifecycleJournal,
  type LifecycleEntry,
  type LifecycleEntryType,
} from "@/lib/service-bridge-lifecycle";

const lifecycleTypes: LifecycleEntryType[] = [
  "RESOLUTION_CREATED",
  "PERSISTENCE_PLANNED",
  "LOCAL_PERSISTENCE_APPLIED",
  "ROLLBACK_PLANNED",
  "LOCAL_ROLLBACK_APPLIED",
];

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const operation = String(payload?.operation ?? "append");

    if (operation === "verify") {
      const entries = payload?.entries as LifecycleEntry[];
      if (!Array.isArray(entries)) {
        return NextResponse.json({ error: "Provide an entries array." }, { status: 400 });
      }
      const verification = verifyLifecycleJournal(entries);
      return NextResponse.json(verification, { status: verification.valid ? 200 : 422 });
    }

    const missionId = String(payload?.missionId ?? "");
    const type = payload?.type as LifecycleEntryType;
    const actor = String(payload?.actor ?? "");
    const data = (payload?.data ?? {}) as Record<string, unknown>;
    const previousEntry = (payload?.previousEntry ?? null) as LifecycleEntry | null;

    if (!lifecycleTypes.includes(type)) {
      return NextResponse.json({ error: "Unsupported lifecycle entry type." }, { status: 400 });
    }

    const entry = createLifecycleEntry({ missionId, type, actor, data, previousEntry });
    return NextResponse.json({ entry, externalActionCompleted: false });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid lifecycle payload." },
      { status: 400 },
    );
  }
}
