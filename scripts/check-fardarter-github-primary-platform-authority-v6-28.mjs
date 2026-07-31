import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

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

const manifestPath = "receipts/repository/FARDARTER-DRIVE-GITHUB-PRIMARY-PLATFORM-AUTHORITY-V6-28.json";
const schemaPath = "schemas/repository/fardarter-drive-github-primary-platform-authority-v6-28.schema.json";
const docsPath = "docs/repository/FARDARTER-DRIVE-GITHUB-PRIMARY-PLATFORM-AUTHORITY-V6-28.md";
const workflowPath = ".github/workflows/fardarter-github-primary-platform-authority-v6-28.yml";
const verifierPath = "scripts/check-fardarter-github-primary-platform-authority-v6-28.mjs";
const manifest = parse(manifestPath);
const schema = parse(schemaPath);
const docs = read(docsPath);
const workflow = read(workflowPath);
const readme = read("README.md");
const deploy = read("docs/DEPLOY.md");
const vercel = read("docs/VERCEL-BILLING-BLOCKER.md");
const netlify = read("docs/repository/NETLIFY-AUDIT-PRODUCT-DEPLOYMENT.md");
const pkg = parse("package.json");

assert(manifest.controlId === "FARDARTER-DRIVE-GITHUB-PRIMARY-PLATFORM-AUTHORITY-V6-28", "control mismatch");
assert(manifest.controllerVersion === "6.28.0", "version mismatch");
assert(manifest.manifestDigest === "08f24213e0cb980f726a30d5fc58574430dfe4a3ad19715d7469d2ef97ed16aa", "digest lock mismatch");
const digestInput = structuredClone(manifest);
delete digestInput.manifestDigest;
assert(sha256(digestInput) === manifest.manifestDigest, "manifest digest recomputation failed");
assert(stable(schema.const) === stable(manifest), "strict schema const mismatch");
assert(manifest.predecessors.currentControlHead.remainsActiveTopLevelHead === true, "v6.21 active head not preserved");
assert(manifest.platformAuthority.intendedPrimaryPlatform === "GITHUB", "GitHub is not primary");
assert(manifest.platformAuthority.providerClassifications.vercel === "VERCEL_RETIRED_NOT_PLANNED", "Vercel retirement mismatch");
assert(manifest.platformAuthority.providerClassifications.netlify === "NETLIFY_TRANSITIONAL_HISTORICAL_READBACK", "Netlify transition mismatch");
assert(manifest.githubPagesBoundary.staticHostingOnly === true, "Pages static boundary missing");
assert(manifest.githubPagesBoundary.serverOrApiRoutesAutomaticallyLive === false, "server/API overclaim");
assert(manifest.chatgptBridge.independentRepositoryAuthority === false, "ChatGPT independence overclaim");
assert(manifest.chatgptBridge.futureTargetIsCurrentFact === false, "future portability presented as current fact");
assert(manifest.actualEffects.providerMutated === false && manifest.actualEffects.pagesEnabled === false && manifest.actualEffects.sitePublished === false, "provider effect mismatch");

const receiptNames = fs.readdirSync(path.join(root, "receipts/repository")).filter((n) => /V6-28\.json$/i.test(n));
const schemaNames = fs.readdirSync(path.join(root, "schemas/repository")).filter((n) => /v6-28\.schema\.json$/i.test(n));
assert(stable(receiptNames) === stable(["FARDARTER-DRIVE-GITHUB-PRIMARY-PLATFORM-AUTHORITY-V6-28.json"]), "competing v6.28 manifest");
assert(stable(schemaNames) === stable(["fardarter-drive-github-primary-platform-authority-v6-28.schema.json"]), "competing v6.28 schema");

assert(pkg.scripts["fardarter:github-primary:check"] === `node ${verifierPath}`, "package script mismatch");
assert(pkg.scripts["revenue:verify"].includes("npm run fardarter:github-primary:check && npm run fardarter:whole-project-audit:check && npm run fardarter:claim-witness:check"), "v6.28 package order mismatch");
assert(pkg.scripts["revenue:verify"].includes("npm run fardarter:whole-project-audit:check && npm run fardarter:claim-witness:check && npm run fardarter:receipt-idempotency:check"), "v6.27 compatibility order changed");
assert(pkg.scripts["revenue:verify"].endsWith("npm run fardarter:strategy-rail:check"), "strategy tail changed");

for (const token of [
  "name: Fardarter GitHub Primary Platform Authority v6.28",
  "contents: read", "issues: read", "actions: read",
  "Capture bounded issue state", "Capture GitHub Pages state",
  "npm run fardarter:github-primary:check", "actions/upload-artifact@v4"
]) assert(workflow.includes(token), `workflow missing ${token}`);
for (const token of [
  "contents: write", "issues: write", "pages: write", "deploy-pages",
  "git push", "netlify deploy", "deploy-site", "vercel deploy", "send_email", "gmail"
]) {
  assert(!workflow.toLowerCase().includes(token), `workflow is not read-only: ${token}`);
}

for (const token of [
  "GITHUB_PRIMARY_INTENDED", "GITHUB_PAGES_PUBLICATION_PENDING_VERIFICATION",
  "NETLIFY_TRANSITIONAL_HISTORICAL_READBACK", "VERCEL_RETIRED_NOT_PLANNED",
  "CONNECTED_USER_DIRECTED_ASSISTANT_BACKING_GITHUB_RAIL",
  "PROVIDER_NEUTRAL_EXPORTABLE_USER_CONTROLLED_AGENT_PORTABILITY",
  "GitHub Pages is static hosting", manifest.manifestDigest
]) assert(docs.includes(token), `authority doc missing ${token}`);

assert(readme.indexOf("## Current platform authority — GitHub primary") >= 0, "README GitHub-primary declaration missing");
assert(readme.indexOf("## Current platform authority — GitHub primary") < readme.indexOf("## Start here"), "README current declaration is not front-loaded");
assert(deploy.startsWith("# Current deployment authority — GitHub primary"), "deploy guide current authority not first");
assert(vercel.startsWith("# Historical Vercel record — retired from intended path"), "Vercel history marker missing");
assert(netlify.startsWith("# Transitional Netlify record — nonpreferred historical readback"), "Netlify transition marker missing");

const publicSource = [read(manifestPath), read(schemaPath), docs, workflow].join("\n");
for (const token of ["docs.google.com", "drive.google.com", "\"privateReceiptKey\"", "\"documentId\"", "\"fileId\""]) {
  assert(!publicSource.includes(token), `private reference exposure: ${token}`);
}

function loadJson(file) {
  if (!file) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
const issuesFile = arg("--issues");
const commentsFile = arg("--comments");
const pagesFile = arg("--pages");
let live = null;

if (issuesFile || commentsFile || pagesFile) {
  assert(issuesFile && commentsFile && pagesFile, "all live inputs are required");
  const issues = loadJson(issuesFile);
  const comments = loadJson(commentsFile);
  const pages = loadJson(pagesFile);
  const byNumber = new Map(issues.map((issue) => [Number(issue.number), issue]));
  const required = [14, 16, 17, 20, 22, 25, 102];
  for (const number of required) assert(byNumber.has(number), `missing issue ${number}`);

  assert(byNumber.get(14).state === "open", "#14 must remain open");
  assert(byNumber.get(16).state === "closed" && byNumber.get(16).state_reason === "duplicate", "#16 duplicate state mismatch");
  assert(byNumber.get(17).state === "closed" && byNumber.get(17).state_reason === "not_planned", "#17 retired state mismatch");
  assert(byNumber.get(17).title === "Historical Vercel account-blocked statuses — superseded by GitHub-primary strategy", "#17 title mismatch");
  assert(byNumber.get(20).state === "closed" && byNumber.get(20).state_reason === "duplicate", "#20 duplicate state mismatch");
  assert(byNumber.get(22).state === "closed" && byNumber.get(22).state_reason === "duplicate", "#22 duplicate state mismatch");
  assert(byNumber.get(25).state === "open", "#25 must remain open");
  assert(byNumber.get(102).state === "open", "#102 must remain open");
  assert(byNumber.get(102).title === "Enable GitHub Pages as the primary project publication rail", "#102 title mismatch");

  const commentText = comments.map((comment) => String(comment.body ?? "")).join("\n");
  for (const token of [
    "Current platform declaration — GitHub primary",
    "Platform decision — Vercel repair retired",
    "Current project-wide platform declaration — GitHub primary"
  ]) assert(commentText.includes(token), `live declaration comment missing ${token}`);

  const pagesEnabled = Boolean(pages && !pages.error && (pages.html_url || pages.status || pages.build_type));
  live = {
    status: "GITHUB_PRIMARY_LIVE_DECLARATIONS_PASS",
    issueStates: Object.fromEntries(required.map((n) => [String(n), { state: byNumber.get(n).state, reason: byNumber.get(n).state_reason ?? null, title: byNumber.get(n).title }])),
    pagesProbe: pagesEnabled ? "PAGES_CONFIGURATION_PRESENT_PUBLIC_READBACK_STILL_REQUIRED" : "PAGES_NOT_ENABLED_OR_NOT_VISIBLE",
    pagesLiveClaim: false
  };
}

console.log(JSON.stringify({
  status: "PASS",
  control: manifest.controlId,
  manifestDigest: manifest.manifestDigest,
  activeTopLevelHead: manifest.predecessors.currentControlHead.controlId,
  intendedPrimaryPlatform: manifest.platformAuthority.intendedPrimaryPlatform,
  pagesState: manifest.githubPagesBoundary.liveState,
  vercel: manifest.platformAuthority.providerClassifications.vercel,
  netlify: manifest.platformAuthority.providerClassifications.netlify,
  chatgptState: manifest.chatgptBridge.currentState,
  futureAgentTarget: manifest.chatgptBridge.futureTarget,
  live,
  consequentialEffects: "ZERO_PROVIDER_EFFECTS",
  next: manifest.decision.nextControlledAction
}, null, 2));
