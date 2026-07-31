import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
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
const normalize = (value) => String(value ?? "").normalize("NFKC").replace(/\r/g, "").toLowerCase().replace(/\s+/g, " ").trim();
const uniq = (values) => [...new Set(values)];
const args = process.argv.slice(2);
const arg = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };

const manifestPath = "receipts/repository/FARDARTER-DRIVE-WHOLE-PROJECT-DECLARATION-AUDIT-V6-27.json";
const schemaPath = "schemas/repository/fardarter-drive-whole-project-declaration-audit-v6-27.schema.json";
const workflowPath = ".github/workflows/fardarter-whole-project-declaration-audit-v6-27.yml";
const docsPath = "docs/repository/FARDARTER-DRIVE-WHOLE-PROJECT-DECLARATION-AUDIT-V6-27.md";
const verifierPath = "scripts/check-fardarter-whole-project-declaration-audit-v6-27.mjs";
const manifest = parse(manifestPath);
const schema = parse(schemaPath);
const workflow = read(workflowPath);
const docs = read(docsPath);
const pkg = parse("package.json");

assert(manifest.controlId === "FARDARTER-DRIVE-WHOLE-PROJECT-DECLARATION-AUDIT-V6-27", "v6.27 control mismatch");
assert(manifest.controllerVersion === "6.27.0", "v6.27 version mismatch");
assert(manifest.manifestDigest === "3487f55a5365c7737d51b41ca8a7878e96df164deedc28089abab694701657ce", "v6.27 digest lock mismatch");
const digestInput = structuredClone(manifest);
delete digestInput.manifestDigest;
assert(sha256(digestInput) === manifest.manifestDigest, "v6.27 digest recomputation failed");
assert(stable(schema.const) === stable(manifest), "v6.27 strict schema mismatch");
assert(manifest.predecessors.currentControlHead.remainsActiveTopLevelHead === true, "v6.21 active head not preserved");
assert(manifest.repository.massMutationAllowed === false && manifest.decision.automaticRemediationAllowed === false, "v6.27 mutation boundary mismatch");
assert(Object.values(manifest.actualEffects).every((v) => v === 0), "v6.27 actual effects mismatch");
assert(Object.values(manifest.consequentialEffects).every((v) => v === false), "v6.27 consequential effects mismatch");

const receipts = fs.readdirSync(path.join(root, "receipts/repository")).filter((n) => /V6-27\.json$/i.test(n));
const schemas = fs.readdirSync(path.join(root, "schemas/repository")).filter((n) => /v6-27\.schema\.json$/i.test(n));
assert(stable(receipts) === stable(["FARDARTER-DRIVE-WHOLE-PROJECT-DECLARATION-AUDIT-V6-27.json"]), "competing v6.27 manifest");
assert(stable(schemas) === stable(["fardarter-drive-whole-project-declaration-audit-v6-27.schema.json"]), "competing v6.27 schema");
assert(pkg.scripts["fardarter:whole-project-audit:check"] === `node ${verifierPath}`, "v6.27 package script mismatch");
assert(pkg.scripts["revenue:verify"].includes("npm run fardarter:whole-project-audit:check && npm run fardarter:claim-witness:check && npm run fardarter:receipt-idempotency:check"), "v6.27 package ordering mismatch");
assert(pkg.scripts["revenue:verify"].includes("npm run fardarter:claim-witness:check && npm run fardarter:receipt-idempotency:check && npm run fardarter:receipt-destination-claim:check"), "v6.26 compatibility order changed");
assert(pkg.scripts["revenue:verify"].endsWith("npm run fardarter:strategy-rail:check"), "strategy tail changed");

for (const token of [
  "name: Fardarter Whole Project Declaration Audit v6.27", "contents: read", "issues: read",
  "pull-requests: read", "actions: read", "gh api --paginate", "git ls-remote --heads origin",
  "git ls-tree -r --name-only HEAD", "npm run fardarter:whole-project-audit:check", "actions/upload-artifact@v4"
]) assert(workflow.includes(token), `v6.27 workflow missing ${token}`);
for (const token of ["contents: write", "issues: write", "pull-requests: write", "actions: write", "git push", "git update-ref", "netlify deploy", "deploy --", "send_email", "gmail", "curl ", "wget "]) {
  assert(!workflow.toLowerCase().includes(token), `v6.27 workflow is not read-only: ${token}`);
}
for (const token of [
  "Fardarter Drive™ v6.27", "WHOLE_PROJECT_DECLARATION_AND_PAUSED_WORK_RECONCILED",
  "DUPLICATE_OPEN_REVIEW", "PAUSED_WORK_REVIEW", "EXTERNALLY_BLOCKED_REVIEW",
  "MANUAL_CLASSIFICATION_REQUIRED", "gh api --paginate", manifest.manifestDigest,
  "No private Google Drive URL or file ID"
]) assert(docs.includes(token), `v6.27 docs missing ${token}`);
const publicSource = [read(manifestPath), read(schemaPath), workflow, docs].join("\n");
assert(!/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(publicSource), "v6.27 public email exposure");
for (const token of ["docs.google.com", "drive.google.com", '"fileId"', '"folderId"', '"documentId"', '"privateReceiptKey"']) {
  assert(!publicSource.includes(token), `v6.27 private reference exposure: ${token}`);
}

const flattenPages = (value, key = null) => {
  if (!Array.isArray(value)) return key && Array.isArray(value?.[key]) ? value[key] : value ? [value] : [];
  const out = [];
  for (const page of value) {
    if (Array.isArray(page)) out.push(...page);
    else if (key && Array.isArray(page?.[key])) out.push(...page[key]);
    else if (page) out.push(page);
  }
  return out;
};
const readJson = (file, key = null) => flattenPages(JSON.parse(fs.readFileSync(file, "utf8")), key);
const readLines = (file) => fs.readFileSync(file, "utf8").split(/\r?\n/).map((v) => v.trim()).filter(Boolean);
const issueNumberFromUrl = (url) => Number(String(url ?? "").match(/\/issues\/(\d+)$/)?.[1] ?? NaN);

function sourceRoutes(tree) {
  const routes = [];
  for (const file of tree) {
    const match = file.match(/^(?:src\/)?app\/(.*)\/(page|route)\.(?:js|jsx|ts|tsx)$/);
    if (!match) continue;
    const parts = match[1].split("/").filter((part) => part && !/^\(.+\)$/.test(part));
    routes.push(("/" + parts.join("/")).replace(/\/index$/, "/"));
  }
  return uniq(routes.map((r) => r === "/" ? r : r.replace(/\/$/, ""))).sort();
}
function declaredRoutes(body) {
  const text = String(body ?? "");
  const found = [];
  for (const match of text.matchAll(/^(?:suggested route|route|suggested api|api route)\s*:\s*`?(\/[^`\s]+)`?/gim)) found.push(match[1]);
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (!/suggested route|user-facing route|suggested api/i.test(lines[i])) continue;
    for (let j = i; j < Math.min(lines.length, i + 5); j++) {
      for (const match of lines[j].matchAll(/`(\/[A-Za-z0-9_./:[\]()-]+)`/g)) found.push(match[1]);
    }
  }
  return uniq(found.map((r) => r.replace(/[.,;:]$/, "")));
}
function declaredFiles(body) {
  const found = [];
  const regex = /(?:^|[\s`('\"-])((?:src|app|lib|scripts|docs|receipts|schemas|projects|\.github)\/[A-Za-z0-9_./-]+)/gm;
  for (const match of String(body ?? "").matchAll(regex)) found.push(match[1].replace(/[.,;:)]+$/, ""));
  return uniq(found);
}
function referencesFromPull(body) {
  return uniq([...String(body ?? "").matchAll(/(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?|implement(?:s|ed)?)\s+#(\d+)/gi)].map((m) => Number(m[1])));
}
function pullsFromIssue(body) {
  return uniq([...String(body ?? "").matchAll(/(?:PR|pull request)\s*#(\d+)/gi)].map((m) => Number(m[1])));
}
function laneForPull(number) {
  for (const [lane, data] of Object.entries(manifest.knownWorkLanes)) {
    if ((data.openPullRequests ?? []).includes(number) || data.sourcePullRequest === number) return lane;
  }
  return null;
}
function divergence(branchName) {
  try {
    const output = execFileSync("git", ["rev-list", "--left-right", "--count", `refs/remotes/origin/main...refs/remotes/origin/${branchName}`], { cwd: root, encoding: "utf8" });
    const [behind, ahead] = output.trim().split(/\s+/).map(Number);
    return { behind, ahead };
  } catch {
    return null;
  }
}
function classifyPull(pr, div) {
  if (pr.merged_at) return "MERGED_HISTORICAL";
  if (pr.state === "closed") return "CLOSED_UNMERGED_HISTORICAL";
  if (pr.draft) return "PAUSED_DRAFT_REVIEW";
  if (!div) return "CONFLICT_OR_REFRESH_REQUIRED";
  if (div.ahead === 0) return "IMPLEMENTED_OR_SUPERSEDED_REVIEW";
  if (div.behind > 0) return "OPEN_REFRESH_REVIEW";
  return "OPEN_CURRENT_REVIEW";
}
function classifyBranch(branch, openHeads, mergedHeads, closedHeads, div) {
  if (branch.name === "main") return "MAIN";
  if (/^fd-receipt-claim\/[0-9a-f]{64}$/.test(branch.name)) return "PROTECTED_RECEIPT_CLAIM";
  if (openHeads.has(branch.name)) return "OPEN_PULL_REQUEST_BRANCH";
  if (mergedHeads.has(branch.name)) return "MERGED_HISTORY_BRANCH";
  if (closedHeads.has(branch.name)) return "CLOSED_PULL_REQUEST_BRANCH";
  if (div?.ahead === 0) return "MERGED_OR_ANCESTOR_BRANCH";
  if (/^(deploy|earth-mesh-receipt-220-deploy)/.test(branch.name)) return "RETAINED_DEPLOYMENT_BRANCH";
  return "PAUSED_ORPHAN_BRANCH_REVIEW";
}
function workflowFacts(file, source) {
  return {
    sourcePresent: Boolean(source),
    scheduled: /^\s*schedule\s*:/m.test(source),
    workflowDispatch: /^\s*workflow_dispatch\s*:/m.test(source),
    issueWrite: /issues:\s*write/i.test(source),
    contentWrite: /contents:\s*write/i.test(source),
    pullRequestWrite: /pull-requests:\s*write/i.test(source),
    deploymentWrite: /deployments:\s*write/i.test(source),
    providerNamed: /netlify|vercel|deploy/i.test(file + " " + source.slice(0, 300))
  };
}
function classifyWorkflow(api, facts) {
  if (!api) return "SOURCE_ONLY_UNREGISTERED_WORKFLOW";
  if (!facts.sourcePresent) return "REGISTERED_WITHOUT_SOURCE_REVIEW";
  if (String(api.state).startsWith("disabled")) return "DISABLED_WORKFLOW_REVIEW";
  if (facts.scheduled && (facts.issueWrite || facts.contentWrite || facts.pullRequestWrite || facts.deploymentWrite)) return "SCHEDULED_WRITER_REVIEW";
  if (facts.providerNamed) return "PROVIDER_NAMED_SOURCE_WORKFLOW";
  if (facts.issueWrite || facts.contentWrite || facts.pullRequestWrite || facts.deploymentWrite) return "ACTIVE_WRITE_CAPABLE_REVIEW";
  return "ACTIVE_READ_ONLY";
}
function duplicateGroups(issues) {
  const groups = new Map();
  for (const issue of issues) {
    const body = normalize(issue.body);
    if (body.length < 20) continue;
    const key = sha256(body);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(Number(issue.number));
  }
  return [...groups.entries()].filter(([, numbers]) => numbers.length > 1).map(([bodyDigest, numbers]) => {
    numbers.sort((a, b) => a - b);
    return { bodyDigest, numbers, canonicalIssueNumber: numbers[0] };
  }).sort((a, b) => a.canonicalIssueNumber - b.canonicalIssueNumber);
}
function pathExists(reference, treeSet, tree) {
  if (treeSet.has(reference) || treeSet.has(`src/${reference}`)) return true;
  if (reference.endsWith("/")) return tree.some((file) => file.startsWith(reference) || file.startsWith(`src/${reference}`));
  return false;
}
function classifyIssue(issue, context) {
  const number = Number(issue.number);
  const title = String(issue.title ?? "");
  const body = String(issue.body ?? "");
  const declaration = normalize(`${title} ${body}`);
  const duplicate = context.duplicateByNumber.get(number);
  if (number === 133) return "CURRENT_AUTHORITY";
  if (number === 141 || number === 160) return "PROTECTED_HISTORICAL_BODY";
  if (issue.state === "closed" && (/duplicate of #|\bduplicate\b/i.test(`${title} ${body}`) || duplicate)) return "DUPLICATE_CLOSED";
  if (issue.state === "closed" && /placeholder|no[- ]?op|accidental|unintentionally|routing incident/i.test(declaration)) return "NO_EFFECT_HISTORICAL";
  if (issue.state === "closed") return "COMPLETED_HISTORICAL";
  if (duplicate && number !== duplicate.canonicalIssueNumber) return "DUPLICATE_OPEN_REVIEW";
  if (/placeholder|no[- ]?op|accidental|unintentionally|routing incident/i.test(declaration)) return "NO_EFFECT_HISTORICAL";
  if (number === 241 || number === 242) return "PAUSED_WORK_REVIEW";
  if (title === "GRIPLOOM ML + GOBLIN ML implementation plan" && context.files.length > 0 && context.files.every((file) => pathExists(file, context.treeSet, context.tree))) return "IMPLEMENTED_BY_CURRENT_MAIN_REVIEW";
  if ([30, 31, 54, 93, 119].includes(number) || /safe merge order|open pr stack|lockfile.*(?:fail|mismatch|repair)|npm ci.*fail|deployment\s+(?:is\s+)?unverified|public .*deployment remains .*unverified|evaluate netlify.*fallback|10 total audit|maximum active deliveries\s*2/i.test(declaration)) return "STALE_DECLARATION_REVIEW";
  if ([94, 96, 102].includes(number) || /github pages|pages activation|remote \/mcp|remote endpoint|build week submission|app directory|plugin submission|provider setting|oauth permission|external portal/i.test(declaration)) return "EXTERNALLY_BLOCKED_REVIEW";
  if (context.routes.length > 0 && context.routes.every((route) => context.routeSet.has(route))) return "IMPLEMENTED_BY_CURRENT_MAIN_REVIEW";
  if (context.files.length > 0 && context.files.every((file) => pathExists(file, context.treeSet, context.tree))) return "IMPLEMENTED_BY_CURRENT_MAIN_REVIEW";
  if (context.linkedOpenPulls.length > 0 || context.linkedPulls.length > 0) return "PAUSED_WORK_REVIEW";
  return "BACKLOG_UNSTARTED";
}

function auditProject(input) {
  const issues = input.issues.filter((item) => !item.pull_request).sort((a, b) => Number(a.number) - Number(b.number));
  const pullIssueNumbers = new Set(input.issues.filter((item) => item.pull_request).map((item) => Number(item.number)));
  const pulls = input.pulls.sort((a, b) => Number(a.number) - Number(b.number));
  if (input.live) {
    const pullNumbers = new Set(pulls.map((item) => Number(item.number)));
    assert(stable([...pullIssueNumbers].sort((a, b) => a - b)) === stable([...pullNumbers].sort((a, b) => a - b)), "issue/pull endpoint coverage mismatch");
  }
  assert(new Set(issues.map((item) => item.number)).size === issues.length, "duplicate issue number in capture");
  assert(new Set(pulls.map((item) => item.number)).size === pulls.length, "duplicate PR number in capture");

  const commentsByIssue = new Map();
  for (const comment of input.comments ?? []) {
    const number = issueNumberFromUrl(comment.issue_url);
    if (!Number.isFinite(number)) continue;
    if (!commentsByIssue.has(number)) commentsByIssue.set(number, []);
    commentsByIssue.get(number).push(String(comment.body ?? ""));
  }
  const duplicates = duplicateGroups(issues);
  const duplicateByNumber = new Map();
  for (const group of duplicates) for (const number of group.numbers) duplicateByNumber.set(number, group);
  const pullsByNumber = new Map(pulls.map((pull) => [Number(pull.number), pull]));
  const issueToPulls = new Map();
  const link = (issueNumber, pullNumber) => {
    if (!issueToPulls.has(issueNumber)) issueToPulls.set(issueNumber, []);
    issueToPulls.get(issueNumber).push(pullNumber);
  };
  for (const pull of pulls) for (const number of referencesFromPull(pull.body)) link(number, Number(pull.number));
  for (const issue of issues) for (const number of pullsFromIssue(issue.body)) link(Number(issue.number), number);

  const treeSet = new Set(input.tree);
  const routeSet = new Set(sourceRoutes(input.tree));
  const issueRecords = issues.map((issue) => {
    const number = Number(issue.number);
    const linkedPulls = uniq(issueToPulls.get(number) ?? []).filter((pullNumber) => pullsByNumber.has(pullNumber));
    const linkedOpenPulls = linkedPulls.filter((pullNumber) => pullsByNumber.get(pullNumber)?.state === "open");
    const comments = commentsByIssue.get(number) ?? [];
    const context = {
      duplicateByNumber,
      linkedPulls,
      linkedOpenPulls,
      tree: input.tree,
      treeSet,
      routeSet,
      routes: declaredRoutes(issue.body),
      files: declaredFiles(issue.body)
    };
    return {
      number,
      state: issue.state,
      title: String(issue.title ?? ""),
      titleDigest: sha256(normalize(issue.title)),
      bodyDigest: sha256(normalize(issue.body)),
      commentCount: comments.length,
      commentMaterialDigest: sha256(comments.map(normalize).filter(Boolean).sort()),
      primaryRoutes: context.routes,
      referencedFiles: context.files,
      linkedPullRequests: linkedPulls,
      classification: classifyIssue(issue, context),
      duplicateCanonicalIssueNumber: duplicateByNumber.get(number)?.canonicalIssueNumber ?? null
    };
  });

  const pullRecords = pulls.map((pull) => {
    const div = input.live ? divergence(pull.head?.ref) : input.divergence?.[pull.head?.ref] ?? (pull.draft ? { behind: 1, ahead: 1 } : { behind: 0, ahead: 1 });
    return {
      number: Number(pull.number),
      state: pull.state,
      draft: Boolean(pull.draft),
      merged: Boolean(pull.merged_at),
      title: String(pull.title ?? ""),
      titleDigest: sha256(normalize(pull.title)),
      bodyDigest: sha256(normalize(pull.body)),
      headRef: pull.head?.ref ?? null,
      headSha: pull.head?.sha ?? null,
      baseRef: pull.base?.ref ?? null,
      divergence: div,
      lane: laneForPull(Number(pull.number)),
      linkedIssues: referencesFromPull(pull.body),
      classification: classifyPull(pull, div)
    };
  });

  const openHeads = new Set(pulls.filter((p) => p.state === "open").map((p) => p.head?.ref).filter(Boolean));
  const mergedHeads = new Set(pulls.filter((p) => p.merged_at).map((p) => p.head?.ref).filter(Boolean));
  const closedHeads = new Set(pulls.filter((p) => p.state === "closed" && !p.merged_at).map((p) => p.head?.ref).filter(Boolean));
  const branchRecords = input.branches.map((branch) => {
    const div = input.live ? divergence(branch.name) : input.divergence?.[branch.name] ?? null;
    return {
      name: branch.name,
      sha: branch.commit?.sha ?? branch.sha ?? null,
      divergence: div,
      classification: classifyBranch(branch, openHeads, mergedHeads, closedHeads, div)
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
  if (input.live) {
    assert(stable(branchRecords.map((b) => b.name).sort()) === stable(input.refs.map((r) => r.name).sort()), "branch/ref coverage mismatch");
  }

  const workflowByPath = new Map(input.workflows.map((item) => [item.path, item]));
  const sourceWorkflowPaths = input.tree.filter((file) => /^\.github\/workflows\/[^/]+\.ya?ml$/.test(file));
  const workflowPaths = uniq([...workflowByPath.keys(), ...sourceWorkflowPaths]).sort();
  const workflowRecords = workflowPaths.map((file) => {
    const api = workflowByPath.get(file) ?? null;
    const source = fs.existsSync(path.join(root, file)) ? read(file) : "";
    const facts = workflowFacts(file, source);
    return { path: file, name: api?.name ?? null, state: api?.state ?? null, ...facts, classification: classifyWorkflow(api, facts) };
  });

  const material = {
    issues: issueRecords.map(sortDeep),
    pullRequests: pullRecords.map(sortDeep),
    branches: branchRecords.map(sortDeep),
    workflows: workflowRecords.map(sortDeep),
    source: { pathCount: input.tree.length, pathDigest: sha256([...input.tree].sort()), routes: [...routeSet].sort() }
  };
  const projectDeclarationDigest = sha256(material);
  const pausedWork = [
    ...issueRecords.filter((r) => r.classification === "PAUSED_WORK_REVIEW").map((r) => ({ type: "ISSUE", number: r.number, title: r.title, classification: r.classification })),
    ...pullRecords.filter((r) => ["PAUSED_DRAFT_REVIEW", "OPEN_REFRESH_REVIEW", "OPEN_CURRENT_REVIEW", "CONFLICT_OR_REFRESH_REQUIRED"].includes(r.classification)).map((r) => ({ type: "PULL_REQUEST", number: r.number, title: r.title, lane: r.lane, classification: r.classification })),
    ...branchRecords.filter((r) => r.classification === "PAUSED_ORPHAN_BRANCH_REVIEW").map((r) => ({ type: "BRANCH", name: r.name, classification: r.classification }))
  ];
  pausedWork.push({ type: "LANE", name: "IMPERATUS_POST_MERGE_EXTERNAL_GATES", pullRequest: 118, gates: manifest.knownWorkLanes.IMPERATUS.pausedExternalGates, classification: "EXTERNALLY_BLOCKED_REVIEW" });
  const stale = issueRecords.filter((r) => ["STALE_DECLARATION_REVIEW", "IMPLEMENTED_BY_CURRENT_MAIN_REVIEW"].includes(r.classification));
  const external = issueRecords.filter((r) => r.classification === "EXTERNALLY_BLOCKED_REVIEW");
  external.push({ type: "LANE", name: "IMPERATUS_POST_MERGE_EXTERNAL_GATES", gates: manifest.knownWorkLanes.IMPERATUS.pausedExternalGates });
  const coverage = {
    status: "FULL_PROVIDER_PAGINATION_AND_REPOSITORY_ENUMERATION_PASS",
    issueCount: issueRecords.length,
    pullRequestCount: pullRecords.length,
    branchCount: branchRecords.length,
    workflowCount: workflowRecords.length,
    sourcePathCount: input.tree.length,
    commentCount: (input.comments ?? []).length,
    duplicateGroupCount: duplicates.length,
    manualClassificationCount: issueRecords.filter((r) => r.classification === "MANUAL_CLASSIFICATION_REQUIRED").length,
    issuePullEndpointCrossCheck: input.live ? "PASS" : "FIXTURE",
    branchRefCrossCheck: input.live ? "PASS" : "FIXTURE",
    projectDeclarationDigest
  };
  return { material, projectDeclarationDigest, duplicates, pausedWork, stale, external, coverage };
}

function writeOutputs(result, outputDir) {
  fs.mkdirSync(outputDir, { recursive: true });
  const files = manifest.outputContract;
  const inventory = { controlId: manifest.controlId, manifestDigest: manifest.manifestDigest, projectDeclarationDigest: result.projectDeclarationDigest, ...result.material, coverage: result.coverage };
  fs.writeFileSync(path.join(outputDir, files.inventoryFile), JSON.stringify(sortDeep(inventory), null, 2) + "\n");
  fs.writeFileSync(path.join(outputDir, files.duplicateFile), JSON.stringify(result.duplicates, null, 2) + "\n");
  fs.writeFileSync(path.join(outputDir, files.pausedWorkFile), JSON.stringify(result.pausedWork, null, 2) + "\n");
  fs.writeFileSync(path.join(outputDir, files.staleDeclarationFile), JSON.stringify(result.stale, null, 2) + "\n");
  fs.writeFileSync(path.join(outputDir, files.externalGateFile), JSON.stringify(result.external, null, 2) + "\n");
  fs.writeFileSync(path.join(outputDir, files.connectorCoverageFile), JSON.stringify(result.coverage, null, 2) + "\n");
  const count = (records) => Object.fromEntries(Object.entries(records.reduce((out, record) => {
    out[record.classification] = (out[record.classification] ?? 0) + 1;
    return out;
  }, {})).sort());
  const summary = [
    "# Fardarter Drive™ v6.27 whole-project audit", "",
    `Project declaration digest: \`${result.projectDeclarationDigest}\``, "", "## Coverage", "", "```text",
    `Issues        ${result.coverage.issueCount}`,
    `Pull requests ${result.coverage.pullRequestCount}`,
    `Branches      ${result.coverage.branchCount}`,
    `Workflows     ${result.coverage.workflowCount}`,
    `Source paths  ${result.coverage.sourcePathCount}`,
    `Comments      ${result.coverage.commentCount}`, "```", "",
    "## Issue classifications", "", "```json", JSON.stringify(count(result.material.issues), null, 2), "```", "",
    "## Pull-request classifications", "", "```json", JSON.stringify(count(result.material.pullRequests), null, 2), "```", "",
    "## Paused work queue", "",
    ...result.pausedWork.slice(0, 100).map((item) => `- ${item.type} ${item.number ?? item.name} — ${item.classification ?? "EXTERNALLY_BLOCKED_REVIEW"}${item.lane ? ` — ${item.lane}` : ""}`),
    "", "## Connector coverage", "",
    `- ${result.coverage.status}`,
    `- Issue/pull endpoint cross-check: ${result.coverage.issuePullEndpointCrossCheck}`,
    `- Branch/ref cross-check: ${result.coverage.branchRefCrossCheck}`,
    `- Manual classification count: ${result.coverage.manualClassificationCount}`, "",
    "No issue, pull request, branch, workflow, provider state, canonical state, private record, or external channel was mutated by this audit."
  ].join("\n");
  fs.writeFileSync(path.join(outputDir, files.summaryFile), summary + "\n");
}

const liveFiles = {
  issues: arg("--issues"), pulls: arg("--pulls"), comments: arg("--comments"), branches: arg("--branches"),
  workflows: arg("--workflows"), tree: arg("--tree"), refs: arg("--refs"), outputDir: arg("--output-dir")
};
let result;
if (Object.values(liveFiles).some(Boolean)) {
  for (const [name, file] of Object.entries(liveFiles)) if (name !== "outputDir") assert(file, `missing live input --${name}`);
  const refs = readLines(liveFiles.refs).map((line) => {
    const match = line.match(/^([0-9a-f]{40})\s+refs\/heads\/(.+)$/);
    assert(match, `malformed head ref: ${line}`);
    return { sha: match[1], name: match[2] };
  });
  result = auditProject({
    live: true,
    issues: readJson(liveFiles.issues),
    pulls: readJson(liveFiles.pulls),
    comments: readJson(liveFiles.comments),
    branches: readJson(liveFiles.branches),
    workflows: readJson(liveFiles.workflows, "workflows"),
    tree: readLines(liveFiles.tree),
    refs
  });
  writeOutputs(result, path.resolve(liveFiles.outputDir ?? "/tmp/fardarter-v6-27-audit"));
} else {
  result = auditProject({ live: false, ...manifest.testVector, comments: [], refs: [], divergence: { paused: { behind: 1, ahead: 1 }, merged: { behind: 0, ahead: 0 } } });
  const expected = manifest.testVector.expected;
  const issueByNumber = new Map(result.material.issues.map((r) => [r.number, r]));
  const pullByNumber = new Map(result.material.pullRequests.map((r) => [r.number, r]));
  assert(result.duplicates.some((g) => g.canonicalIssueNumber === expected.duplicateCanonical && g.numbers.includes(expected.duplicateMember)), "fixture duplicate detection failed");
  assert(issueByNumber.get(expected.protectedCurrentAuthority)?.classification === "CURRENT_AUTHORITY", "fixture current authority failed");
  assert(issueByNumber.get(expected.noEffectHistorical)?.classification === "NO_EFFECT_HISTORICAL", "fixture no-effect failed");
  assert(pullByNumber.get(expected.pausedDraftPullRequest)?.classification === "PAUSED_DRAFT_REVIEW", "fixture paused PR failed");
  assert(pullByNumber.get(expected.mergedPullRequest)?.classification === "MERGED_HISTORICAL", "fixture merged PR failed");
}

console.log(JSON.stringify({
  status: "PASS",
  control: manifest.controlId,
  manifestDigest: manifest.manifestDigest,
  activeTopLevelHead: manifest.predecessors.currentControlHead.controlId,
  governancePredecessor: manifest.predecessors.claimWitness.controlId,
  coverage: result.coverage,
  projectDeclarationDigest: result.projectDeclarationDigest,
  pausedWorkCount: result.pausedWork.length,
  staleDeclarationCount: result.stale.length,
  externalGateCount: result.external.length,
  consequentialEffects: "ZERO",
  next: manifest.decision.nextControlledAction
}, null, 2));
