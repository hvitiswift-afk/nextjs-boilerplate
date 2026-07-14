import { createHash } from "node:crypto";

export type SchedulerKind = "cron" | "slurm" | "bash";

export type SchedulerTask = {
  id: string;
  command: string;
  cwd?: string;
  env?: Record<string, string>;
  timeoutSeconds?: number;
  retries?: number;
};

export type SchedulerPlanInput = {
  planId: string;
  kind: SchedulerKind;
  task: SchedulerTask;
  cronExpression?: string;
  slurm?: {
    partition?: string;
    account?: string;
    qos?: string;
    nodes?: number;
    ntasks?: number;
    cpusPerTask?: number;
    memory?: string;
    timeLimit?: string;
    jobName?: string;
  };
  shell?: "bash" | "sh";
  confirmation: string;
};

const SAFE_COMMAND_PATTERN = /^[a-zA-Z0-9_./:=+@%,-]+(?:\s+[a-zA-Z0-9_./:=+@%,-]+)*$/;

function shellEscape(value: string) {
  return `'${value.replace(/'/g, `'"'"'`)}'`;
}

function validateTask(task: SchedulerTask) {
  if (!task.id.trim()) throw new Error("task.id is required.");
  if (!task.command.trim()) throw new Error("task.command is required.");
  if (/[;&|`$<>\n\r]/.test(task.command)) {
    throw new Error("task.command contains blocked shell metacharacters.");
  }
  if (!SAFE_COMMAND_PATTERN.test(task.command.trim())) {
    throw new Error("task.command contains unsupported characters.");
  }
  if ((task.timeoutSeconds ?? 300) < 1 || (task.timeoutSeconds ?? 300) > 86400) {
    throw new Error("timeoutSeconds must be between 1 and 86400.");
  }
  if ((task.retries ?? 0) < 0 || (task.retries ?? 0) > 10) {
    throw new Error("retries must be between 0 and 10.");
  }
}

function bashScript(input: SchedulerPlanInput) {
  const shell = input.shell ?? "bash";
  const task = input.task;
  const envLines = Object.entries(task.env ?? {}).map(
    ([key, value]) => `export ${key}=${shellEscape(value)}`,
  );
  const cwd = task.cwd ? `cd ${shellEscape(task.cwd)}` : null;
  const command = `timeout ${task.timeoutSeconds ?? 300}s ${task.command}`;
  const retryCount = task.retries ?? 0;

  return [
    `#!/usr/bin/env ${shell}`,
    "set -euo pipefail",
    ...envLines,
    ...(cwd ? [cwd] : []),
    `attempt=0`,
    `max_retries=${retryCount}`,
    "until " + command + "; do",
    "  status=$?",
    "  if [ \"$attempt\" -ge \"$max_retries\" ]; then exit \"$status\"; fi",
    "  attempt=$((attempt + 1))",
    "  sleep $((attempt * 5))",
    "done",
  ].join("\n");
}

function cronLine(input: SchedulerPlanInput, scriptPath: string) {
  const expression = input.cronExpression?.trim();
  if (!expression) throw new Error("cronExpression is required for cron plans.");
  const fields = expression.split(/\s+/);
  if (fields.length !== 5) throw new Error("cronExpression must have exactly five fields.");
  return `${expression} ${scriptPath} >> logs/${input.planId}.log 2>&1`;
}

function slurmScript(input: SchedulerPlanInput, body: string) {
  const slurm = input.slurm ?? {};
  const directives = [
    `#SBATCH --job-name=${slurm.jobName ?? input.planId}`,
    `#SBATCH --nodes=${slurm.nodes ?? 1}`,
    `#SBATCH --ntasks=${slurm.ntasks ?? 1}`,
    `#SBATCH --cpus-per-task=${slurm.cpusPerTask ?? 1}`,
    `#SBATCH --mem=${slurm.memory ?? "1G"}`,
    `#SBATCH --time=${slurm.timeLimit ?? "00:30:00"}`,
    ...(slurm.partition ? [`#SBATCH --partition=${slurm.partition}`] : []),
    ...(slurm.account ? [`#SBATCH --account=${slurm.account}`] : []),
    ...(slurm.qos ? [`#SBATCH --qos=${slurm.qos}`] : []),
    `#SBATCH --output=logs/${input.planId}-%j.out`,
    `#SBATCH --error=logs/${input.planId}-%j.err`,
  ];
  return ["#!/usr/bin/env bash", ...directives, "set -euo pipefail", body.split("\n").slice(2).join("\n")].join("\n");
}

export function createSchedulerPlan(input: SchedulerPlanInput) {
  const planId = input.planId.trim();
  if (!planId) throw new Error("planId is required.");
  validateTask(input.task);

  const expected = `APPROVE SCHEDULER PLAN ${planId}`;
  if (input.confirmation.trim() !== expected) {
    throw new Error(`Exact confirmation required: ${expected}`);
  }

  const scriptPath = `scheduler/${planId}.sh`;
  const baseScript = bashScript(input);
  const generated =
    input.kind === "slurm"
      ? slurmScript(input, baseScript)
      : baseScript;
  const schedule =
    input.kind === "cron" ? cronLine(input, scriptPath) : null;
  const digest = createHash("sha256")
    .update(JSON.stringify({ planId, kind: input.kind, generated, schedule }))
    .digest("hex");

  return {
    schema: "jp-hviti-service-bridge-scheduler-plan/v1",
    createdAt: new Date().toISOString(),
    planId,
    kind: input.kind,
    task: input.task,
    artifacts: {
      scriptPath,
      script: generated,
      cronEntry: schedule,
      slurmSubmitCommand:
        input.kind === "slurm" ? `sbatch ${scriptPath}` : null,
      bashRunCommand:
        input.kind === "bash" ? `bash ${scriptPath}` : null,
    },
    digestAlgorithm: "SHA-256",
    digest,
    controls: {
      shellMetacharactersBlocked: true,
      boundedTimeout: true,
      boundedRetries: true,
      secretsEmbedded: false,
      automaticInstallAllowed: false,
      automaticSubmissionAllowed: false,
      automaticExecutionAllowed: false,
    },
    truthBoundary: {
      planCreated: true,
      filesWritten: false,
      cronInstalled: false,
      slurmSubmitted: false,
      bashExecuted: false,
      externalActionCompleted: false,
    },
  };
}
