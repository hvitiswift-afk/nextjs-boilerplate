import { NextRequest, NextResponse } from "next/server";

import {
  createSchedulerPlan,
  type SchedulerKind,
  type SchedulerTask,
} from "@/lib/service-bridge-scheduler";

export function GET() {
  return NextResponse.json({
    schema: "jp-hviti-service-bridge-scheduler-capabilities/v1",
    kinds: ["cron", "slurm", "bash"],
    exactConfirmation: "APPROVE SCHEDULER PLAN <plan-id>",
    controls: {
      automaticInstallAllowed: false,
      automaticSubmissionAllowed: false,
      automaticExecutionAllowed: false,
      shellMetacharactersBlocked: true,
      boundedTimeout: true,
      boundedRetries: true,
    },
    externalActionCompleted: false,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const result = createSchedulerPlan({
      planId: String(payload?.planId ?? ""),
      kind: String(payload?.kind ?? "bash") as SchedulerKind,
      task: payload?.task as SchedulerTask,
      cronExpression:
        typeof payload?.cronExpression === "string"
          ? payload.cronExpression
          : undefined,
      slurm:
        payload?.slurm && typeof payload.slurm === "object"
          ? payload.slurm
          : undefined,
      shell: payload?.shell === "sh" ? "sh" : "bash",
      confirmation: String(payload?.confirmation ?? ""),
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid scheduler planning request.",
        planCreated: false,
        filesWritten: false,
        cronInstalled: false,
        slurmSubmitted: false,
        bashExecuted: false,
        externalActionCompleted: false,
      },
      { status: 400 },
    );
  }
}
