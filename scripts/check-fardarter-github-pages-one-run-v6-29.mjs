import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import os from "node:os";
import { execFileSync } from "node:child_process";

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

const manifestPath = "receipts/repository/FARDARTER-DRIVE-GITHUB-PAGES-ONE-RUN-PUBLICATION-V6-29.json";
const schemaPath = "schemas/repository/fardarter-drive-github-pages-one-run-publication-v6-29.schema.json";
const docsPath = "docs/repository/FARDARTER-DRIVE-GITHUB-PAGES-ONE-RUN-PUBLICATION-V6-29.md";
const workflowPath = ".github/workflows/fardarter-github-pages-one-run-v6-29.yml";
const manifest = parse(manifestPath);
const schema = parse(schemaPath);
const docs = read(docsPath);
const workflow = read(workflowPath);
const enable = read(".github/workflows/enable-fardarter-pages.yml");
const publish = read(".github/workflows/fardarter-pages.yml");
const readinessWorkflow = read(".github/workflows/fardarter-pages-readiness.yml");
const readiness = parse("config/fardarter-pages-readiness.json");
const pkg = parse("package.json");

assert(manifest.controlId === "FARDARTER-DRIVE-GITHUB-PAGES-ONE-RUN-PUBLICATION-V6-29", "control mismatch");
assert(manifest.controllerVersion === "6.29.0", "version mismatch");
assert(manifest.manifestDigest === "e729a5b31f853723918d63a0dfa759f34f0671fb67beb04cc994e1d5d617fde8", "digest lock mismatch");
const digestInput = structuredClone(manifest);
delete digestInput.manifestDigest;
assert(sha256(digestInput) === manifest.manifestDigest, "digest recomputation failed");
assert(stable(schema.const) === stable(manifest), "strict schema mismatch");
assert(manifest.predecessors.currentControlHead.remainsActiveTopLevelHead === true, "v6.21 active head not preserved");
assert(manifest.predecessors.githubPrimaryAuthority.preservedImmutable === true, "v6.28 not preserved");
assert(manifest.provenGap.pagesProbe === "PAGES_NOT_ENABLED_OR_NOT_VISIBLE", "Pages gap mismatch");
assert(manifest.provenGap.connectorCapabilities.createRepositorySecret === false, "secret capability overclaim");
assert(manifest.provenGap.connectorCapabilities.configurePagesSetting === false, "Pages capability overclaim");
assert(manifest.provenGap.connectorCapabilities.dispatchNewManualWorkflow === false, "dispatch capability overclaim");
assert(manifest.provenGap.staleBranch.disposition === "STALE_MIXED_HISTORY_NOT_CONTINUATION_SOURCE", "stale branch mismatch");
assert(manifest.publicationDesign.publicIntake.primaryChannel === "GITHUB_ISSUES", "GitHub intake mismatch");
assert(manifest.evidenceClasses.liveClaimAllowed === false, "live claim overreach");
assert(Object.values(manifest.actualEffects).every((value) => value === false), "actual effects mismatch");

const receiptNames = fs.readdirSync(path.join(root, "receipts/repository")).filter((n) => /V6-29\.json$/i.test(n));
const schemaNames = fs.readdirSync(path.join(root, "schemas/repository")).filter((n) => /v6-29\.schema\.json$/i.test(n));
assert(stable(receiptNames) === stable(["FARDARTER-DRIVE-GITHUB-PAGES-ONE-RUN-PUBLICATION-V6-29.json"]), "competing v6.29 manifest");
assert(stable(schemaNames) === stable(["fardarter-drive-github-pages-one-run-publication-v6-29.schema.json"]), "competing v6.29 schema");

assert(pkg.scripts["fardarter:pages-one-run:check"] === "node scripts/check-fardarter-github-pages-one-run-v6-29.mjs", "package script mismatch");
assert(pkg.scripts["revenue:verify"].includes("npm run fardarter:pages-one-run:check && npm run fardarter:github-primary:check && npm run fardarter:whole-project-audit:check"), "v6.29 package order mismatch");
assert(pkg.scripts["revenue:verify"].includes("npm run fardarter:github-primary:check && npm run fardarter:whole-project-audit:check && npm run fardarter:claim-witness:check"), "v6.28 compatibility order changed");
assert(pkg.scripts["revenue:verify"].endsWith("npm run fardarter:strategy-rail:check"), "strategy tail changed");

for (const file of ["index.html", "privacy.html", "projects.html"]) {
  const text = read(`fardarter-startup/${file}`);
  assert(!/mailto:/i.test(text), `mailto remains in ${file}`);
  assert(!/fardarter\.systems/i.test(text), `unverified domain remains in ${file}`);
}
assert(read("fardarter-startup/index.html").includes("GitHub-primary human-controlled AI operations."), "index marker missing");
assert(read("fardarter-startup/privacy.html").includes("GitHub-first privacy boundary"), "privacy marker missing");
assert(read("fardarter-startup/projects.html").includes("Public project map"), "project marker missing");

assert(readiness.version === "2.0", "readiness version mismatch");
assert(readiness.authority_control === manifest.controlId, "readiness control mismatch");
assert(readiness.authority_digest === manifest.manifestDigest, "readiness digest mismatch");
assert(readiness.contact_channel === "GITHUB_ISSUES", "readiness contact mismatch");
assert(readiness.pages_live_claim === false, "readiness live overclaim");

for (const token of [
  "name: Enable and Publish Fardarter GitHub Pages",
  "Preflight private admin capability",
  "Verify Pages source readiness",
  "Build deterministic static artifact",
  "enablement: true",
  "actions/upload-pages-artifact@v3",
  "actions/deploy-pages@v4",
  "Verify public URL and required content",
  "Upload operational publication receipt"
]) assert(enable.includes(token), `initial workflow missing ${token}`);
for (const token of [
  "name: Publish Fardarter GitHub Pages",
  "Build deterministic static artifact",
  "Probe current GitHub Pages configuration",
  "if: needs.source-readiness.outputs.pages_configured == 'true'",
  "actions/upload-pages-artifact@v3",
  "actions/deploy-pages@v4",
  "Verify public URL and required content",
  "Upload operational publication receipt"
]) assert(publish.includes(token), `repeat workflow missing ${token}`);
for (const token of [
  "name: Verify Fardarter Pages Source Readiness",
  "contents: read",
  "Verify source readiness",
  "Build preview artifact",
  "Verify preview artifact",
  "Upload preview evidence"
]) assert(readinessWorkflow.includes(token), `readiness workflow missing ${token}`);

for (const token of [
  "name: Fardarter GitHub Pages One Run v6.29",
  "contents: read", "issues: read", "actions: read",
  "Capture bounded issue state", "Capture GitHub Pages state",
  "npm run fardarter:pages-one-run:check", "actions/upload-artifact@v4"
]) assert(workflow.includes(token), `v6.29 workflow missing ${token}`);
for (const token of ["contents: write", "issues: write", "pages: write", "deploy-pages", "git push", "send_email", "gmail"]) {
  assert(!workflow.toLowerCase().includes(token), `v6.29 control workflow is not read-only: ${token}`);
}

for (const token of [
  "PAGES_NOT_ENABLED_OR_NOT_VISIBLE",
  "SOURCE_READY",
  "GITHUB_ISSUES",
  "STALE_MIXED_HISTORY_NOT_CONTINUATION_SOURCE",
  manifest.manifestDigest
]) assert(docs.includes(token), `docs missing ${token}`);

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "fardarter-v629-control-"));
try {
  execFileSync(process.execPath, [
    "scripts/build-fardarter-github-pages.mjs",
    "--output", temp,
    "--source-commit", "V629_CONTROL_FIXTURE"
  ], { cwd: root, stdio: "inherit" });
  execFileSync(process.execPath, [
    "scripts/verify-fardarter-pages-publication.mjs",
    "--fixture-dir", temp,
    "--receipt-file", path.join(temp, "verification.json")
  ], { cwd: root, stdio: "inherit" });
  const built = fs.readdirSync(temp).sort();
  for (const required of manifest.publicationDesign.publicFiles) {
    assert(built.includes(required), `built artifact missing ${required}`);
  }
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
  for (const number of [102, 249, 250]) assert(byNumber.has(number), `missing issue ${number}`);
  assert(byNumber.get(102).state === "open", "#102 must remain open until public readback");
  assert(byNumber.get(102).title === "Enable GitHub Pages as the primary project publication rail", "#102 title mismatch");
  assert(byNumber.get(249).title.startsWith("Fardarter Drive™ v6.29"), "#249 title mismatch");
  assert(byNumber.get(250).title.startsWith("Fardarter Drive™ v6.29"), "#250 title mismatch");
  const pagesPresent = Boolean(pages && !pages.error && (pages.html_url || pages.status || pages.build_type));
  live = {
    status: "GITHUB_PAGES_ONE_RUN_LIVE_DECLARATIONS_PASS",
    issue102: { state: byNumber.get(102).state, title: byNumber.get(102).title },
    controlIssue: { state: byNumber.get(249).state, title: byNumber.get(249).title },
    implementationIssue: { state: byNumber.get(250).state, title: byNumber.get(250).title },
    pagesProbe: pagesPresent ? "PAGES_CONFIGURATION_PRESENT_PUBLIC_READBACK_REQUIRED" : "PAGES_NOT_ENABLED_OR_NOT_VISIBLE",
    pagesLiveClaim: false
  };
}

console.log(JSON.stringify({
  status: "PASS",
  control: manifest.controlId,
  manifestDigest: manifest.manifestDigest,
  activeTopLevelHead: manifest.predecessors.currentControlHead.controlId,
  githubPrimaryAuthority: manifest.predecessors.githubPrimaryAuthority.controlId,
  sourceState: manifest.decision.state,
  pagesState: manifest.currentTruth.pagesState,
  staleBranchDisposition: manifest.provenGap.staleBranch.disposition,
  contactChannel: manifest.publicationDesign.publicIntake.primaryChannel,
  live,
  consequentialEffects: "ZERO_PROVIDER_EFFECTS",
  next: manifest.decision.nextControlledAction
}, null, 2));
