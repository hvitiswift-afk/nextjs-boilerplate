import fs from "node:fs";

const receiptPath = "examples/griploom-launch.receipt.sample.json";
const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(receipt.id === "receipt-griploom-launch-001", "receipt id is required");
assert(receipt.kind === "griploom-launch-receipt", "receipt kind must be griploom-launch-receipt");
assert(receipt.release?.branch === "main", "release branch must be main");
assert(receipt.verification?.local_command === "npm run griploom:verify", "local verifier command must be npm run griploom:verify");
assert(receipt.verification?.github_actions_workflow === ".github/workflows/griploom-verify.yml", "GitHub Actions workflow path is required");
assert(receipt.hosting?.primary_host === "Netlify", "primary host must be Netlify");
assert(receipt.hosting?.site_id === "21d3bb41-3a69-4a7d-b6c6-e873cde8ee2f", "Netlify site id must match the GRIPLOOM deploy rail");
assert(receipt.browser?.["/griploom loads"], "/griploom browser check is required");
assert(Array.isArray(receipt.api_smoke_tests?.ml_score?.expected_shape), "ML score expected shape must be an array");
assert(receipt.api_smoke_tests.ml_score.expected_shape.includes("results"), "ML score shape must include results");
assert(Array.isArray(receipt.api_smoke_tests?.same_tick?.expected_shape), "SAME-TICK expected shape must be an array");
assert(receipt.api_smoke_tests.same_tick.expected_shape.includes("tick_id"), "SAME-TICK shape must include tick_id");
assert(receipt.blackletter_safety?.no_hiring_guarantees_claimed, "BLACKLETTER hiring guarantee check is required");
assert(receipt.decision?.launch_status === "pending", "sample launch status should remain pending");
assert(receipt.law === "No hidden launch. Every launch gets a receipt.", "launch law must match the receipt rail");

console.log(JSON.stringify({
  id: "check-griploom-launch-receipt-sample",
  status: "passed",
  file: receiptPath,
  law: receipt.law
}, null, 2));
