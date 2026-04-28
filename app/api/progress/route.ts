import { NextResponse } from "next/server";
import type { ProgressEvent } from "../../../lib/hyperscript";

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

export async function GET() {
  return NextResponse.json({
    ok: true,
    system: "Progress Lantern",
    events: progress
  });
}
