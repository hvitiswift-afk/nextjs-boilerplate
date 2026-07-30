import { readFile } from "node:fs/promises";

const workflowPath = ".github/workflows/fardarter-event-proposal-v6-3.yml";
const workflow = await readFile(workflowPath, "utf8");

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

for (const eventType of ["opened", "edited", "reopened", "labeled"]) {
  assert(workflow.includes(`- ${eventType}`), `proposal workflow missing issue event: ${eventType}`);
}

for (const required of [
  "github.event_name == 'workflow_dispatch' || github.event_name == 'issues'",
  "issueLabels.includes('fd-proposal-approved-v6-3')",
  "title.startsWith('[FD event proposal]:')",
  "if (!approved || !titleMatches)",
  "Proposal controller skipped issue",
  "jp-fardarter-proposal-v6-3-",
  "Duplicate proposal suppressed",
  "fd-proposal-ready-for-review",
  "fd-proposal-quarantined",
  "READY_FOR_REVIEW",
  "QUARANTINED",
  "Canonical event appended: **NO**",
  "Canonical chain remains: **GENESIS_ONLY**",
  "contents: read",
  "issues: write",
]) {
  assert(workflow.includes(required), `proposal trigger workflow missing: ${required}`);
}

assert(!workflow.includes("contents: write"), "proposal trigger must never write canonical source");

const qualificationIndex = workflow.indexOf("if (!approved || !titleMatches)");
const bodyIndex = workflow.indexOf("const body = issuePayload.body");
const markerGuardIndex = workflow.indexOf("comments.some");
const readyMutationIndex = workflow.indexOf("labels: ['fd-proposal-ready-for-review'");
const quarantineMutationIndex = workflow.indexOf("labels: ['fd-proposal-quarantined'");

assert(qualificationIndex >= 0 && qualificationIndex < bodyIndex, "approval/title qualification must precede proposal parsing");
assert(markerGuardIndex >= 0, "proposal marker guard is missing");
assert(markerGuardIndex < readyMutationIndex, "marker guard must precede READY_FOR_REVIEW mutation");
assert(markerGuardIndex < quarantineMutationIndex, "marker guard must precede QUARANTINED mutation");

console.log("Fardarter Drive v6.3 proposal trigger hardening: PASS");
console.log("Events: opened / edited / reopened / labeled");
console.log("Canonical source permission: read-only");
