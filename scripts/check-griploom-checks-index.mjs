import fs from "node:fs";

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const indexPath = "docs/GRIPLOOM-CHECKS-INDEX.md";
const index = fs.readFileSync(indexPath, "utf8");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const requiredScripts = [
  "security:secrets:check",
  "griploom:id:check",
  "griploom:screenplay:check",
  "griploom:ml:check",
  "griploom:tick:check",
  "griploom:launch:check",
  "griploom:launch:print",
  "griploom:launch:print:check",
  "griploom:science:check",
  "griploom:checks:index",
  "griploom:checks",
  "griploom:verify"
];

const requiredFiles = [
  "examples/griploom-id-barcoder.sample.json",
  "examples/griploom-screenplay-industry-id.sample.json",
  "examples/griploom-ml-score.sample.json",
  "examples/griploom-tick.sample.json",
  "examples/griploom-launch.receipt.sample.json",
  "examples/griploom-science-source-rail.sample.json",
  "scripts/check-secret-boundaries.mjs",
  "scripts/check-griploom-id-barcoder-sample.mjs",
  "scripts/check-griploom-screenplay-industry-id-sample.mjs",
  "scripts/check-griploom-ml-score-sample.mjs",
  "scripts/check-griploom-tick-sample.mjs",
  "scripts/check-griploom-launch-receipt-sample.mjs",
  "scripts/check-griploom-launch-printer.mjs",
  "scripts/check-griploom-science-source-rail-sample.mjs",
  "scripts/check-griploom-checks-index.mjs",
  "scripts/verify-griploom-build.mjs"
];

for (const scriptName of requiredScripts) {
  assert(packageJson.scripts?.[scriptName], `package.json missing script ${scriptName}`);
  assert(index.includes(`npm run ${scriptName}`), `${indexPath} missing command npm run ${scriptName}`);
}

for (const filePath of requiredFiles) {
  assert(fs.existsSync(filePath), `missing checked file ${filePath}`);
  assert(index.includes(filePath), `${indexPath} missing file reference ${filePath}`);
}

assert(
  packageJson.scripts["griploom:checks"].includes("npm run security:secrets:check"),
  "griploom:checks must start with or include the secret boundary check"
);
assert(
  packageJson.scripts["griploom:checks"].includes("npm run griploom:science:check"),
  "griploom:checks must include the science source rail check"
);
assert(
  packageJson.scripts["griploom:checks"].includes("npm run griploom:checks:index"),
  "griploom:checks must include the checks index consistency check"
);

console.log(JSON.stringify({
  id: "check-griploom-checks-index",
  status: "passed",
  file: indexPath,
  scripts_checked: requiredScripts.length,
  files_checked: requiredFiles.length
}, null, 2));
