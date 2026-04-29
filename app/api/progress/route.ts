import { NextRequest, NextResponse } from "next/server";
import { hasDatabaseUrl, query } from "../../../lib/db";
import { createProgressEvent } from "../../../lib/progress-event-builder";
import type { ProgressEvent } from "../../../lib/hyperscript";
import { insertProgressEvent, listProgressEvents, listProgressEventsForTask, mapProgressRow } from "../../../lib/progress-vault-sql";

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

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const event = createProgressEvent({
    id: typeof body.id === "string" ? body.id : undefined,
    taskId: typeof body.taskId === "string" ? body.taskId : undefined,
    step: body.step,
    status: body.status,
    message: typeof body.message === "string" ? body.message : undefined
  });

  if (hasDatabaseUrl()) {
    try {
      const rows = await query(insertProgressEvent(event));
      return NextResponse.json({
        ok: true,
        system: "Progress Lantern",
        event: rows[0] ? mapProgressRow(rows[0]) : event,
        persistentStorage: true
      });
    } catch (error) {
      return NextResponse.json({
        ok: false,
        system: "Progress Lantern",
        event,
        persistentStorage: true,
        error: error instanceof Error ? error.message : "Unknown database error"
      }, { status: 503 });
    }
  }

  return NextResponse.json({
    ok: true,
    system: "Progress Lantern",
    event,
    persistentStorage: false
  });
}
