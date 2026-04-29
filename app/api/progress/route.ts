import { NextRequest, NextResponse } from "next/server";
import { hasDatabaseUrl, query } from "../../../lib/db";
import type { ProgressEvent } from "../../../lib/hyperscript";
import { listProgressEvents, listProgressEventsForTask, mapProgressRow } from "../../../lib/progress-vault-sql";

const now = new Date().toISOString();

const progress: ProgressEvent[] = [
  {
    id: "progress-listen",
    taskId: "outpost-demo",
    step: "listen",
    status: "complete",
    message: "HyperIntent received by Goblin Enclave.",
    createdAt: now
  },
  {
    id: "progress-fabian",
    taskId: "outpost-demo",
    step: "decompose",
    status: "complete",
    message: "Fabian decomposed the intent into a reversible hyperscript.",
    createdAt: now
  },
  {
    id: "progress-outpost",
    taskId: "outpost-demo",
    step: "log",
    status: "ready",
    message: "Entry is ready for Outpost 2099-2100 round trip.",
    createdAt: now
  }
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get("taskId");

  if (hasDatabaseUrl()) {
    try {
      const rows = await query(taskId ? listProgressEventsForTask(taskId, 50) : listProgressEvents(50));
      return NextResponse.json({
        ok: true,
        system: "Progress Lantern",
        persistentStorage: true,
        events: rows.map(mapProgressRow)
      });
    } catch (error) {
      return NextResponse.json({
        ok: false,
        system: "Progress Lantern",
        persistentStorage: true,
        fallback: progress,
        error: error instanceof Error ? error.message : "Unknown database error"
      }, { status: 503 });
    }
  }

  return NextResponse.json({
    ok: true,
    system: "Progress Lantern",
    persistentStorage: false,
    events: taskId ? progress.filter((event) => event.taskId === taskId) : progress
  });
}
