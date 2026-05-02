import { execFileSync } from "node:child_process";

const output = execFileSync(
  process.execPath,
  ["scripts/print-griploom-launch-receipt.mjs", "examples/griploom-launch.receipt.sample.json"],
  { encoding: "utf8" }
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(output.includes("# GRIPLOOM Launch Receipt Summary"), "printer must emit summary heading");
assert(output.includes("receipt-griploom-launch-001"), "printer must emit receipt id");
assert(output.includes("griploom-launch-receipt"), "printer must emit receipt kind");
assert(output.includes("No hidden launch. Every launch gets a receipt."), "printer must emit launch law");
assert(output.includes("Netlify"), "printer must emit primary host");
assert(output.includes("blocked-account"), "printer must emit Vercel blocker status");
assert(output.includes("launch status"), "printer must emit launch status row");

console.log(JSON.stringify({
  id: "check-griploom-launch-printer",
  status: "passed",
  command: "node scripts/print-griploom-launch-receipt.mjs examples/griploom-launch.receipt.sample.json"
}, null, 2));
