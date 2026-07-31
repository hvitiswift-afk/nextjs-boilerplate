import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import os from "node:os";
import { execFileSync, spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const parse = (p) => JSON.parse(read(p));
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const sortDeep = (value) => {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortDeep(value[key])]));
  }
  return value;
};
const stable = (value) => JSON.stringify(sortDeep(value));
const sha256 = (value) => crypto.createHash("sha256").update(typeof value === "string" ? value : stable(value)).digest("hex");
const args = process.argv.slice(2);
const arg = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };

const manifestPath = "receipts/repository/FARDARTER-DRIVE-GITHUB-PAGES-CONDITION-WATCH-V6-30.json";
const schemaPath = "schemas/repository/fardarter-drive-github-pages-condition-watch-v6-30.schema.json";
const docsPath = "docs/repository/FARDARTER-DRIVE-GITHUB-PAGES-CONDITION-WATCH-V6-30.md";
const workflowPath = ".github/workflows/fardarter-github-pages-condition-watch-v6-30.yml";
const publishPath = ".github/workflows/fardarter-pages.yml";
const publicVerifierPath = "scripts/verify-fardarter-pages-publication.mjs";
const manifest = parse(manifestPath);
const schema = parse(schemaPath);
const docs = read(docsPath);
const workflow = read(workflowPath);
const publish = read(publishPath);
const publicVerifier = read(publicVerifierPath);
const pkg = parse("package.json");

assert(manifest.controlId === "FARDARTER-DRIVE-GITHUB-PAGES-CONDITION-WATCH-V6-30", "control mismatch");
assert(manifest.controllerVersion === "6.30.0", "version mismatch");
assert(manifest.manifestDigest === "f16015510093429e1aef5535c7e5d186454c0af1f6559d1d8611defbe0d17a97", "digest lock mismatch");
const digestInput = structuredClone(manifest);
delete digestInput.manifestDigest;
assert(sha256(digestInput) === manifest.manifestDigest, "digest recomputation failed");
assert(stable(schema.const) === stable(manifest), "strict schema mismatch");
assert(manifest.predecessors.currentControlHead.remainsActiveTopLevelHead === true, "v6.21 active head not preserved");
assert(manifest.predecessors.githubPrimaryAuthority.preservedImmutable === true, "v6.28 not preserved");
assert(manifest.predecessors.pagesOneRun.preservedImmutable === true, "v6.29 not preserved");
assert(manifest.predecessors.pagesOneRun.mergeReadback === "b7adac65667a3dcfcafe5bcc7f713fae57770c3a", "v6.29 merge readback mismatch");
assert(manifest.provenGap.repeatWorkflowBeforeV630.scheduleTrigger === false, "schedule gap mismatch");
assert(manifest.conditionWatchDesign.schedule === "17 * * * *", "condition-watch schedule mismatch");
assert(manifest.conditionWatchDesign.frequency === "HOURLY", "condition-watch frequency mismatch");
assert(manifest.conditionWatchDesign.cancelInProgress === false, "concurrency cancellation mismatch");
assert(manifest.conditionWatchDesign.sourceEvidenceEveryRun === true, "source-evidence rule mismatch");
assert(manifest.conditionWatchDesign.postDeployVerification.requiresExpectedSourceCommit === true, "expected-source rule missing");
assert(manifest.conditionWatchDesign.humanActionRemaining.assistantCanPerform === false, "human Pages setting overclaim");
assert(manifest.evidenceClasses.liveClaimAllowed === false, "live claim overreach");
assert(Object.values(manifest.actualEffects).every((value) => value === false), "actual effects mismatch");

const receiptNames = fs.readdirSync(path.join(root, "receipts/repository")).filter((n) => /V6-30\.json$/i.test(n));
const schemaNames = fs.readdirSync(path.join(root, "schemas/repository")).filter((n) => /v6-30\.schema\.json$/i.test(n));
assert(stable(receiptNames) === stable(["FARDARTER-DRIVE-GITHUB-PAGES-CONDITION-WATCH-V6-30.json"]), "competing v6.30 manifest");
assert(stable(schemaNames) === stable(["fardarter-drive-github-pages-condition-watch-v6-30.schema.json"]), "competing v6.30 schema");

assert(pkg.scripts["fardarter:pages-condition-watch:check"] === "node scripts/check-fardarter-github-pages-condition-watch-v6-30.mjs", "package script mismatch");
assert(pkg.scripts["revenue:verify"].includes("npm run fardarter:owner-routing:check && npm run fardarter:pages-condition-watch:check && npm run fardarter:control-head:check && npm run fardarter:pages-one-run:check && npm run fardarter:github-primary:check"), "v6.30 package order mismatch");
assert(pkg.scripts["revenue:verify"].includes("npm run fardarter:pages-one-run:check && npm run fardarter:github-primary:check && npm run fardarter:whole-project-audit:check && npm run fardarter:claim-witness:check"), "predecessor order changed");
assert(pkg.scripts["revenue:verify"].endsWith("npm run fardarter:strategy-rail:check"), "strategy tail changed");

for (const token of [
  'schedule:',
  'cron: "17 * * * *"',
  'pages: write',
  'id-token: write',
  'actions: read',
  'cancel-in-progress: false',
  'Verify source artifact and expected commit',
  '--expected-source-commit "${GITHUB_SHA}"',
  'Probe current GitHub Pages configuration and live source',
  'PAGES_CONFIGURATION_ABSENT_OR_NOT_VISIBLE',
  'PAGES_CONFIGURATION_PRESENT_NON_WORKFLOW_SOURCE',
  'PAGES_CONFIGURATION_PRESENT_WORKFLOW_SOURCE',
  'already_current',
  'Block non-workflow Pages source',
  'Record idempotent no-deploy result',
  "needs.source-readiness.outputs.already_current != 'true'",
  'Verify public URL, required content, and exact source commit',
  'Upload operational publication receipt'
]) assert(publish.includes(token), `repeat workflow missing ${token}`);
for (const forbidden of ["GH_ADMIN_TOKEN", "enablement: true", "administration: write"]) {
  assert(!publish.toLowerCase().includes(forbidden.toLowerCase()), `repeat workflow crosses admin boundary: ${forbidden}`);
}

for (const token of [
  'const expectedSourceCommit = arg("--expected-source-commit")',
  'checks["status.sourceCommit"]',
  'status.sourceCommit === expectedSourceCommit',
  'expectedSourceCommit,'
]) assert(publicVerifier.includes(token), `public verifier missing ${token}`);

for (const token of [
  "name: Fardarter GitHub Pages Condition Watch v6.30",
  "contents: read",
  "issues: read",
  "actions: read",
  "Capture bounded issue state",
  "Capture GitHub Pages state",
  "npm run fardarter:pages-condition-watch:check",
  "actions/upload-artifact@v4"
]) assert(workflow.includes(token), `v6.30 workflow missing ${token}`);
for (const token of ["contents: write", "issues: write", "pages: write", "deploy-pages", "git push", "GH_ADMIN_TOKEN"]) {
  assert(!workflow.toLowerCase().includes(token.toLowerCase()), `v6.30 control workflow is not read-only: ${token}`);
}

for (const token of [
  "PAGES_CONFIGURATION_ABSENT_OR_NOT_VISIBLE",
  "PAGES_CONFIGURATION_PRESENT_NON_WORKFLOW_SOURCE",
  "PAGES_CONFIGURATION_PRESENT_WORKFLOW_SOURCE",
  "ENABLE_PAGES_WITH_GITHUB_ACTIONS_ONCE",
  "IDEMPOTENT_NO_DEPLOY",
  manifest.manifestDigest
]) assert(docs.includes(token), `docs missing ${token}`);

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "fardarter-v630-control-"));
try {
  execFileSync(process.execPath, [
    "scripts/build-fardarter-github-pages.mjs",
    "--output", temp,
    "--source-commit", "V630_CONTROL_FIXTURE"
  ], { cwd: root, stdio: "inherit" });
  execFileSync(process.execPath, [
    "scripts/verify-fardarter-pages-publication.mjs",
    "--fixture-dir", temp,
    "--expected-source-commit", "V630_CONTROL_FIXTURE",
    "--receipt-file", path.join(temp, "verification.json")
  ], { cwd: root, stdio: "inherit" });
  const mismatch = spawnSync(process.execPath, [
    "scripts/verify-fardarter-pages-publication.mjs",
    "--fixture-dir", temp,
    "--expected-source-commit", "WRONG_SOURCE_COMMIT",
    "--receipt-file", path.join(temp, "negative-verification.json")
  ], { cwd: root, encoding: "utf8" });
  assert(mismatch.status !== 0, "wrong source commit was not rejected");
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}

const issuesFile = arg("--issues");
const pagesFile = arg("--pages");
let live = null;
if (issuesFile || pagesFile) {
  assert(issuesFile && pagesFile, "both live inputs are required");
  const issues = JSON.parse(fs.readFileSync(issuesFile, "utf8"));
  const pages = JSON.parse(fs.readFileSync(pagesFile, "utf8"));
  const byNumber = new Map(issues.map((issue) => [Number(issue.number), issue]));
  for (const number of [102, 249, 250, 252, 253]) assert(byNumber.has(number), `missing issue ${number}`);
  assert(byNumber.get(102).state === "open", "#102 must remain open until operational publication readback");
  assert(byNumber.get(102).title === "Enable GitHub Pages as the primary project publication rail", "#102 title mismatch");
  assert(byNumber.get(249).state === "closed", "#249 source completion must remain closed");
  assert(byNumber.get(250).state === "closed", "#250 source completion must remain closed");
  assert(byNumber.get(252).title.startsWith("Fardarter Drive™ v6.30"), "#252 title mismatch");
  assert(byNumber.get(253).title.startsWith("Fardarter Drive™ v6.30"), "#253 title mismatch");

  const pagesPresent = Boolean(pages && !pages.error && (pages.html_url || pages.status || pages.build_type || pages.source));
  const buildType = pagesPresent ? (pages.build_type || pages.source?.build_type || "") : "";
  const pagesState = !pagesPresent
    ? "PAGES_CONFIGURATION_ABSENT_OR_NOT_VISIBLE"
    : buildType === "workflow"
      ? "PAGES_CONFIGURATION_PRESENT_WORKFLOW_SOURCE"
      : "PAGES_CONFIGURATION_PRESENT_NON_WORKFLOW_SOURCE";
  live = {
    status: "GITHUB_PAGES_CONDITION_WATCH_LIVE_DECLARATIONS_PASS",
    issue102: { state: byNumber.get(102).state, title: byNumber.get(102).title },
    controlIssue: { state: byNumber.get(252).state, title: byNumber.get(252).title },
    implementationIssue: { state: byNumber.get(253).state, title: byNumber.get(253).title },
    pagesState,
    pagesLiveClaim: false
  };
}

console.log(JSON.stringify({
  status: "PASS",
  control: manifest.controlId,
  manifestDigest: manifest.manifestDigest,
  activeTopLevelHead: manifest.predecessors.currentControlHead.controlId,
  githubPrimaryAuthority: manifest.predecessors.githubPrimaryAuthority.controlId,
  pagesSourcePredecessor: manifest.predecessors.pagesOneRun.controlId,
  sourceState: manifest.decision.state,
  schedule: manifest.conditionWatchDesign.schedule,
  live,
  consequentialEffects: "ZERO_PROVIDER_EFFECTS",
  next: manifest.decision.nextControlledAction
}, null, 2));
