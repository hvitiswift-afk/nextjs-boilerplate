import { readFile } from "node:fs/promises";

const workflowPath = ".github/workflows/fardarter-successor-review-v6-6.yml";
const workflow = await readFile(workflowPath, "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(workflow.includes("name: Fardarter Successor Review v6.6.2"), "workflow version must be v6.6.2");
assert(workflow.includes("match(/#?(\\d+)/)"), "workflow must use the real digit-class parser");
assert(!workflow.includes("match(/#?(\\\\d+)/)"), "workflow must not use an over-escaped digit parser");
assert(workflow.includes("jp-fardarter-successor-v6-6-2-"), "workflow must use the v6.6.2 receipt marker");
assert(workflow.includes("BLOCKED_HUMAN_GATE_REQUIRED"), "workflow must preserve the human-gate decision");
assert(workflow.includes("HUMAN_APPROVAL_AND_BUYER_CONSENT") || workflow.includes("transition?.gate"), "workflow must surface the exact transition gate");
assert(!workflow.includes("contents: write"), "workflow must remain read-only for canonical source");

const body = `### Source entity issue

Issue #159

### Expected current canonical state

SCOPE_DRAFTED

### Candidate successor state

HUMAN_ACCEPTED

### Public-safe successor idempotency key

issue-159-scope-to-human-accepted-v6-6-self-test

### Public-safe evidence references

Issue #159; Issue #173

### Review-by or expiry time

2026-08-03T23:59:59Z
`;
const section = (label) => {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = body.match(new RegExp(`### ${escaped}\\s*\\n+([\\s\\S]*?)(?=\\n### |$)`));
  return match?.[1]?.trim() || "";
};
const issueNumber = Number((section("Source entity issue").match(/#?(\d+)/) || [])[1]);
const expectedState = section("Expected current canonical state").split(/\s+/)[0];
const candidateState = section("Candidate successor state").split(/\s+/)[0];

assert(issueNumber === 159, "sample issue number must parse as 159");
assert(expectedState === "SCOPE_DRAFTED", "sample expected state parse failed");
assert(candidateState === "HUMAN_ACCEPTED", "sample candidate state parse failed");

console.log("Fardarter Drive v6.6.2 successor parser: PASS");
console.log(`Parsed source issue: ${issueNumber}`);
console.log(`Expected blocked transition: ${expectedState} -> ${candidateState}`);
