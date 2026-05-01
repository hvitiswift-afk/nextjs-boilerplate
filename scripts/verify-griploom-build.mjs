import { spawn } from "node:child_process";

const steps = [
  { name: "GRIPLOOM sample checks", command: "npm", args: ["run", "griploom:checks"] },
  { name: "Next.js build", command: "npm", args: ["run", "build"] }
];

function runStep(step) {
  return new Promise((resolve) => {
    const child = spawn(step.command, step.args, {
      stdio: "inherit",
      shell: process.platform === "win32"
    });

    child.on("close", (code) => {
      resolve({ ...step, code });
    });
  });
}

const startedAt = new Date().toISOString();
const results = [];

for (const step of steps) {
  console.log(`\n=== ${step.name} ===`);
  const result = await runStep(step);
  results.push(result);

  if (result.code !== 0) {
    break;
  }
}

const failed = results.find((result) => result.code !== 0);
const receipt = {
  id: "receipt-griploom-build-verify-001",
  kind: "griploom-build-verify",
  status: failed ? "failed" : "passed",
  startedAt,
  finishedAt: new Date().toISOString(),
  steps: results.map((result) => ({ name: result.name, code: result.code })),
  law: "GRIPLOOM is launch-ready only when sample receipts pass and the Next.js build completes."
};

console.log(`\n${JSON.stringify(receipt, null, 2)}`);

if (failed) {
  process.exitCode = failed.code || 1;
}
