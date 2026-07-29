import { readFile } from "node:fs/promises";

const workflowPath = ".github/workflows/fardarter-approved-execution-v5.yml";
const workflow = await readFile(workflowPath, "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const requiredText of [
  "concurrency:",
  "group: fardarter-execution-v5-",
  "Enforce one execution receipt per issue",
  "comments.some",
  "<!-- jp-fardarter-execution-v5-",
  "should_run",
  "prior_receipt",
  "Execution suppressed for issue",
  "steps.guard.outputs.should_run == 'true'",
  "oneShotPerIssue: true",
  "idempotencyKey:",
  "jp-fardarter-execution-v5-one-shot",
]) assert(workflow.includes(requiredText), `execution workflow missing idempotency control: ${requiredText}`);

assert(workflow.match(/createComment/g)?.length === 1, "execution workflow must have exactly one comment creation path");
assert(workflow.includes("cancel-in-progress: false"), "same-issue runs must serialize instead of racing");
assert(workflow.indexOf("Enforce one execution receipt per issue") < workflow.indexOf("Checkout repository"), "idempotency guard must run before checkout");
assert(workflow.indexOf("Enforce one execution receipt per issue") < workflow.indexOf("Install dependencies"), "idempotency guard must run before dependency installation");
assert(workflow.indexOf("Enforce one execution receipt per issue") < workflow.indexOf("Verify Fardarter and revenue package"), "idempotency guard must run before validation");
assert(workflow.indexOf("Enforce one execution receipt per issue") < workflow.indexOf("Build application"), "idempotency guard must run before build");
assert(!workflow.includes("contents: write"), "execution workflow must remain repository read-only");
assert(!workflow.includes("pull_request_target"), "execution workflow must not use pull_request_target");
assert(!workflow.includes("payments: write"), "execution workflow must not request payment permission");

console.log("Fardarter execution idempotency v5: PASS");
console.log("Policy: one execution receipt per controlling issue");
console.log("Duplicate label events: suppressed before checkout/install/verify/build");
