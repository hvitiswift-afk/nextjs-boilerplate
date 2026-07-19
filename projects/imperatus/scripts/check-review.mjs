import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const required = [
  "README.md",
  "netlify.toml",
  "netlify/functions/mcp.mts",
  "public/index.html",
  "public/privacy.html",
  "public/terms.html",
  "public/support.html",
  "REVIEW_TEST_PLAN.json"
];

const failures = [];
for (const rel of required) {
  if (!fs.existsSync(path.join(root, rel))) failures.push(`missing:${rel}`);
}

const mcp = fs.readFileSync(path.join(root, "netlify/functions/mcp.mts"), "utf8");
for (const tool of [
  "sms_prepare",
  "sms_preview",
  "sms_authorize",
  "sms_send_simulated",
  "sms_status",
  "sms_cancel"
]) {
  if (!mcp.includes(`name: \"${tool}\"`)) failures.push(`missing-tool:${tool}`);
}

for (const marker of [
  "SIMULATED_ONLY",
  "live_sms: false",
  "provider_contacted: false",
  "carrier_contacted: false",
  'carrier_delivery: "UNVERIFIED"'
]) {
  if (!mcp.includes(marker)) failures.push(`missing-boundary:${marker}`);
}

const tests = JSON.parse(fs.readFileSync(path.join(root, "REVIEW_TEST_PLAN.json"), "utf8"));
if (tests.positive_cases?.length !== 5) failures.push("positive-count-not-5");
if (tests.negative_cases?.length !== 3) failures.push("negative-count-not-3");

for (const rel of ["README.md", "public/index.html", "public/privacy.html", "public/terms.html", "public/support.html"]) {
  const text = fs.readFileSync(path.join(root, rel), "utf8");
  if (/\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(text)) {
    failures.push(`phone-like-value:${rel}`);
  }
  if (/\b(?:sk|ghp|github_pat|xox[baprs]|AKIA)[A-Za-z0-9_-]{12,}\b/.test(text)) {
    failures.push(`token-like-value:${rel}`);
  }
}

const result = {
  suite: "imperatus-review-static-v117",
  result: failures.length === 0 ? "PASS" : "FAIL",
  checks: 8 + 6 + 5 + 2 + 10,
  failures
};

console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
