import type { ProgressEvent, ProgressStatus } from "./hyperscript";

const steps: ProgressEvent["step"][] = ["listen", "classify", "decompose", "route", "draft", "verify", "approve", "deploy", "log"];
const statuses: ProgressStatus[] = ["waiting", "ready", "running", "complete", "blocked", "failed"];

export function isProgressStep(value: unknown): value is ProgressEvent["step"] {
  return typeof value === "string" && steps.includes(value as ProgressEvent["step"]);
}

export function isProgressStatus(value: unknown): value is ProgressStatus {
  return typeof value === "string" && statuses.includes(value as ProgressStatus);
}

export function createProgressEvent(input: {
  id?: string;
  taskId?: string;
  step?: unknown;
  status?: unknown;
  message?: string;
}): ProgressEvent {
  return {
    id: input.id && input.id.trim().length > 0 ? input.id.trim() : `progress-${Date.now()}`,
    taskId: input.taskId && input.taskId.trim().length > 0 ? input.taskId.trim() : "manual-task",
    step: isProgressStep(input.step) ? input.step : "log",
    status: isProgressStatus(input.status) ? input.status : "ready",
    message: input.message && input.message.trim().length > 0 ? input.message.trim() : "Progress event recorded.",
    createdAt: new Date().toISOString()
  };
}

export const PROGRESS_EVENT_BUILDER_LAW = [
  "Progress input is normalized before storage.",
  "Unknown steps fall back to log.",
  "Unknown statuses fall back to ready.",
  "Progress events remain evidence, not approval."
] as const;
