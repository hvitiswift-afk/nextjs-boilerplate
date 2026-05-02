import fs from "node:fs";

const receiptPath = process.argv[2] ?? "examples/griploom-launch.receipt.sample.json";
const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));

function line(label, value) {
  return `${label.padEnd(28)} ${value ?? "pending"}`;
}

function section(title) {
  return `\n## ${title}`;
}

const output = [
  "# GRIPLOOM Launch Receipt Summary",
  "",
  line("receipt", receipt.id),
  line("kind", receipt.kind),
  line("law", receipt.law),
  section("Release"),
  line("name", receipt.release?.name),
  line("date", receipt.release?.date),
  line("branch", receipt.release?.branch),
  line("commit", receipt.release?.commit_sha),
  section("Verification"),
  line("local command", receipt.verification?.local_command),
  line("local result", receipt.verification?.local_result),
  line("workflow", receipt.verification?.github_actions_workflow),
  line("workflow result", receipt.verification?.github_actions_result),
  section("Hosting"),
  line("primary host", receipt.hosting?.primary_host),
  line("site", receipt.hosting?.site_name),
  line("live url", receipt.hosting?.live_url),
  line("deploy result", receipt.hosting?.deploy_result),
  line("vercel status", receipt.hosting?.vercel_status),
  section("Smoke Tests"),
  line("ml score", receipt.api_smoke_tests?.ml_score?.result),
  line("same tick", receipt.api_smoke_tests?.same_tick?.result),
  section("Decision"),
  line("launch status", receipt.decision?.launch_status),
  line("next action", receipt.decision?.next_action)
].join("\n");

console.log(output);
