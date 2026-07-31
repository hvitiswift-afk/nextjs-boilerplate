import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const parse = (p) => JSON.parse(read(p));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sortDeep = (value) => {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value && typeof value === "object")
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortDeep(value[key])]));
  return value;
};
const stable = (value) => JSON.stringify(sortDeep(value));
const digest = (value) => crypto.createHash("sha256").update(typeof value === "string" ? value : stable(value)).digest("hex");
const normalize = (value) => String(value ?? "").normalize("NFKC").replace(/\r/g, "").toLowerCase().replace(/\s+/g, " ").trim();
const uniq = (values) => [...new Set(values)];
const byNumber = (a,b) => Number(a.number)-Number(b.number);
const args = process.argv.slice(2);
const arg = (name) => { const i=args.indexOf(name); return i>=0 ? args[i+1] : null; };

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
assert(manifest.manifestDigest === "3487f55a5365c7737d51b41ca8a7878e96df164deedc28089abab694701657ce", "v6.27 manifest digest lock mismatch");
const digestInput = structuredClone(manifest); delete digestInput.manifestDigest;
assert(digest(digestInput) === manifest.manifestDigest, "v6.27 manifest digest recomputation failed");
assert(stable(schema.const) === stable(manifest), "v6.27 strict schema const mismatch");
assert(manifest.predecessors.currentControlHead.remainsActiveTopLevelHead === true, "v6.21 active head was not preserved");
assert(manifest.repository.massMutationAllowed === false && manifest.decision.automaticRemediationAllowed === false, "v6.27 mutation boundary mismatch");
assert(Object.values(manifest.actualEffects).every((v)=>v===0), "v6.27 actual effects mismatch");
assert(Object.values(manifest.consequentialEffects).every((v)=>v===false), "v6.27 consequential effects mismatch");

const receiptDir = path.join(root, "receipts/repository");
const schemaDir = path.join(root, "schemas/repository");
const receipts = fs.readdirSync(receiptDir).filter((n)=>/V6-27\.json$/i.test(n));
const schemas = fs.readdirSync(schemaDir).filter((n)=>/v6-27\.schema\.json$/i.test(n));
assert(stable(receipts) === stable(["FARDARTER-DRIVE-WHOLE-PROJECT-DECLARATION-AUDIT-V6-27.json"]), "competing v6.27 manifest detected");
assert(stable(schemas) === stable(["fardarter-drive-whole-project-declaration-audit-v6-27.schema.json"]), "competing v6.27 schema detected");
assert(pkg.scripts["fardarter:whole-project-audit:check"] === `node ${verifierPath}`, "v6.27 package script mismatch");
assert(pkg.scripts["revenue:verify"].includes("npm run fardarter:whole-project-audit:check && npm run fardarter:claim-witness:check && npm run fardarter:receipt-idempotency:check"), "v6.27 package ordering mismatch");
assert(pkg.scripts["revenue:verify"].includes("npm run fardarter:claim-witness:check && npm run fardarter:receipt-idempotency:check && npm run fardarter:receipt-destination-claim:check"), "v6.26 compatibility ordering changed");
assert(pkg.scripts["revenue:verify"].endsWith("npm run fardarter:strategy-rail:check"), "strategy-rail tail changed");

for (const token of [
  "name: Fardarter Whole Project Declaration Audit v6.27",
  "contents: read", "issues: read", "pull-requests: read", "actions: read",
  "gh api --paginate", "git ls-remote --heads origin", "git ls-tree -r --name-only HEAD",
  "npm run fardarter:whole-project-audit:check", "actions/upload-artifact@v4"
]) assert(workflow.includes(token), `v6.27 workflow missing ${token}`);
for (const token of ["contents: write","issues: write","pull-requests: write","actions: write","git push","git update-ref","netlify deploy","deploy --","send_email","gmail","curl ","wget "])
  assert(!workflow.toLowerCase().includes(token), `v6.27 workflow is not read-only: ${token}`);
for (const token of [
  "Fardarter Drive™ v6.27","WHOLE_PROJECT_DECLARATION_AND_PAUSED_WORK_RECONCILED",
  "DUPLICATE_OPEN_REVIEW","PAUSED_WORK_REVIEW","EXTERNALLY_BLOCKED_REVIEW",
  "MANUAL_CLASSIFICATION_REQUIRED","gh api --paginate",manifest.manifestDigest,
  "No private Google Drive URL or file ID"
]) assert(docs.includes(token), `v6.27 documentation missing ${token}`);

const publicSource = [read(manifestPath),read(schemaPath),workflow,docs].join("\n");
assert(!/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(publicSource), "v6.27 public email exposure");
for (const token of ["docs.google.com","drive.google.com",'"fileId"','"folderId"','"documentId"','"privateReceiptKey"'])
  assert(!publicSource.includes(token), `v6.27 private reference exposure: ${token}`);

const flattenPages = (value, collectionKey=null) => {
  if (!Array.isArray(value)) {
    if (collectionKey && value && Array.isArray(value[collectionKey])) return value[collectionKey];
    return value ? [value] : [];
  }
  const out=[];
  for (const page of value) {
    if (Array.isArray(page)) out.push(...page);
    else if (collectionKey && page && Array.isArray(page[collectionKey])) out.push(...page[collectionKey]);
    else if (page) out.push(page);
  }
  return out;
};
const readJsonInput = (file, key=null) => flattenPages(JSON.parse(fs.readFileSync(file,"utf8")), key);
const readLines = (file) => fs.readFileSync(file,"utf8").split(/\r?\n/).map((x)=>x.trim()).filter(Boolean);
const issueNumberFromUrl = (url) => Number(String(url ?? "").match(/\/issues\/(\d+)$/)?.[1] ?? NaN);

function routesFromTree(tree) {
  const routes=[];
  for (const file of tree) {
    const m=file.match(/^(?:src\/)?app\/(.*)\/(page|route)\.(?:js|jsx|ts|tsx)$/);
    if (!m) continue;
    const parts=m[1].split("/").filter((x)=>x && !/^\(.+\)$/.test(x));
    const route="/"+parts.join("/");
    routes.push(route.replace(/\/index$/,"/"));
  }
  return uniq(routes.map((r)=>r==="/"?r:r.replace(/\/$/,""))).sort();
}
function primaryRoutes(body) {
  const text=String(body ?? "");
  const found=[];
  const direct=/^(?:suggested route|route|suggested api|api route)\s*:\s*`?(\/[^`\s]+)`?/gim;
  for (const m of text.matchAll(direct)) found.push(m[1].replace(/[.,;:]$/,""));
  const blocks=text.split(/\r?\n/);
  for (let i=0;i<blocks.length;i++) if (/suggested route|user-facing route|suggested api/i.test(blocks[i]))
    for (let j=i;j<Math.min(blocks.length,i+4);j++)
      for (const m of blocks[j].matchAll(/`(\/[A-Za-z0-9_./:[\]()-]+)`/g)) found.push(m[1]);
  return uniq(found);
}
function referencedFiles(body) {
  return uniq([...String(body ?? "").matchAll(/`((?:src|app|lib|scripts|docs|receipts|schemas|projects|\.github)\/[A-Za-z0-9_./-]+)`/g)].map((m)=>m[1]));
}
function issueReferencesFromPull(body) {
  const out=[];
  for (const m of String(body ?? "").matchAll(/(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?|implement(?:s|ed)?)\s+#(\d+)/gi)) out.push(Number(m[1]));
  return uniq(out);
}
function pullReferencesFromIssue(body) {
  return uniq([...String(body ?? "").matchAll(/(?:PR|pull request)\s*#(\d+)/gi)].map((m)=>Number(m[1])));
}
function laneForPull(number) {
  for (const [lane,data] of Object.entries(manifest.knownWorkLanes))
    if ((data.openPullRequests ?? []).includes(number) || data.sourcePullRequest===number) return lane;
  return null;
}
function classifyPull(pr, divergence) {
  if (pr.merged_at) return "MERGED_HISTORICAL";
  if (pr.state === "closed") return "CLOSED_UNMERGED_HISTORICAL";
  if (pr.draft) return "PAUSED_DRAFT_REVIEW";
  if (!divergence) return "CONFLICT_OR_REFRESH_REQUIRED";
  if (divergence.ahead===0) return "IMPLEMENTED_OR_SUPERSEDED_REVIEW";
  if (divergence.behind>0) return "OPEN_REFRESH_REVIEW";
  return "OPEN_CURRENT_REVIEW";
}
function classifyBranch(branch, openPrByHead, mergedPrByHead, closedPrByHead, divergence) {
  if (branch.name === "main") return "MAIN";
  if (/^fd-receipt-claim\/[0-9a-f]{64}$/.test(branch.name)) return "PROTECTED_RECEIPT_CLAIM";
  if (openPrByHead.has(branch.name)) return "OPEN_PULL_REQUEST_BRANCH";
  if (mergedPrByHead.has(branch.name)) return "MERGED_HISTORY_BRANCH";
  if (closedPrByHead.has(branch.name)) return "CLOSED_PULL_REQUEST_BRANCH";
  if (divergence && divergence.ahead===0) return "MERGED_OR_ANCESTOR_BRANCH";
  if (/^(deploy|earth-mesh-receipt-220-deploy)/.test(branch.name)) return "RETAINED_DEPLOYMENT_BRANCH";
  return "PAUSED_ORPHAN_BRANCH_REVIEW";
}
function workflowSourceFacts(file, source) {
  return {
    sourcePresent:Boolean(source),
    scheduled:/^\s*schedule\s*:/m.test(source),
    workflowDispatch:/^\s*workflow_dispatch\s*:/m.test(source),
    issueWrite:/issues:\s*write/i.test(source),
    contentWrite:/contents:\s*write/i.test(source),
    pullRequestWrite:/pull-requests:\s*write/i.test(source),
    deploymentWrite:/deployments:\s*write/i.test(source),
    providerNamed:/netlify|vercel|deploy/i.test(file+" "+source.slice(0,300))
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
  const map=new Map();
  for (const issue of issues) {
    const body=normalize(issue.body);
    if (body.length<20) continue;
    const key=digest(body);
    if (!map.has(key)) map.set(key,[]);
    map.get(key).push(issue.number);
  }
  return [...map.entries()].filter(([,numbers])=>numbers.length>1)
    .map(([bodyDigest,numbers])=>({bodyDigest,numbers:numbers.sort((a,b)=>a-b),canonicalIssueNumber:Math.min(...numbers)}))
    .sort((a,b)=>a.canonicalIssueNumber-b.canonicalIssueNumber);
}
function classifyIssue(issue, context) {
  const number=Number(issue.number);
  const title=String(issue.title ?? "");
  const body=String(issue.body ?? "");
  const combined=normalize(title+" "+body+" "+(context.commentText ?? ""));
  const duplicate=context.duplicateByNumber.get(number);
  if (number===133) return "CURRENT_AUTHORITY";
  if (number===141 || number===160) return "PROTECTED_HISTORICAL_BODY";
  if (issue.state==="closed" && (/duplicate of #|duplicate\b/i.test(title+" "+body) || duplicate)) return "DUPLICATE_CLOSED";
  if (issue.state==="closed" && /placeholder|no[- ]?op|accidental|unintentionally|routing incident/i.test(combined)) return "NO_EFFECT_HISTORICAL";
  if (issue.state==="closed") return "COMPLETED_HISTORICAL";
  if (duplicate && number!==duplicate.canonicalIssueNumber) return "DUPLICATE_OPEN_REVIEW";
  if (/placeholder|no[- ]?op|accidental|unintentionally|routing incident/i.test(combined)) return "NO_EFFECT_HISTORICAL";
  if (context.primaryRoutes.length && context.primaryRoutes.every((r)=>context.routeSet.has(r))) return "IMPLEMENTED_BY_CURRENT_MAIN_REVIEW";
  if (context.referencedFiles.length && context.referencedFiles.every((f)=>context.treeSet.has(f))) return "IMPLEMENTED_BY_CURRENT_MAIN_REVIEW";
  if (context.linkedOpenPulls.length) return "PAUSED_WORK_REVIEW";
  if (/github pages|pages activation|remote \/mcp|remote endpoint|build week submission|app directory|plugin submission|provider setting|oauth permission|external portal/i.test(combined)) return "EXTERNALLY_BLOCKED_REVIEW";
  if ([93,119].includes(number) || /lockfile.*(?:fail|mismatch|repair)|npm ci.*fail|deployment\s+(?:is\s+)?unverified|public .*deployment remains .*unverified|10 total audit|maximum active deliveries\s*2/i.test(combined))
    return "STALE_DECLARATION_REVIEW";
  if (context.linkedPulls.length) return "PAUSED_WORK_REVIEW";
  if (!context.linkedPulls.length) return "BACKLOG_UNSTARTED";
  return "MANUAL_CLASSIFICATION_REQUIRED";
}
function gitDivergence(branchName) {
  try {
    const remote=`refs/remotes/origin/${branchName}`;
    const out=execFileSync("git",["rev-list","--left-right","--count",`refs/remotes/origin/main...${remote}`],{cwd:root,encoding:"utf8"}).trim().split(/\s+/).map(Number);
    return {behind:out[0],ahead:out[1]};
  } catch { return null; }
}
function auditProject(input) {
  const issues=input.issues.filter((x)=>!x.pull_request).sort(byNumber);
  const pullIssueNumbers=new Set(input.issues.filter((x)=>x.pull_request).map((x)=>Number(x.number)));
  const pulls=input.pulls.sort(byNumber);
  if (input.live) {
    const pullNumbers=new Set(pulls.map((x)=>Number(x.number)));
    assert(stable([...pullIssueNumbers].sort((a,b)=>a-b))===stable([...pullNumbers].sort((a,b)=>a-b)), "connector coverage mismatch between issues and pulls endpoints");
  }
  assert(new Set(issues.map((x)=>x.number)).size===issues.length, "duplicate issue number in provider capture");
  assert(new Set(pulls.map((x)=>x.number)).size===pulls.length, "duplicate pull number in provider capture");

  const commentsByIssue=new Map();
  for (const c of input.comments ?? []) {
    const n=issueNumberFromUrl(c.issue_url);
    if (!Number.isFinite(n)) continue;
    if (!commentsByIssue.has(n)) commentsByIssue.set(n,[]);
    commentsByIssue.get(n).push(String(c.body ?? ""));
  }
  const duplicate=duplicateGroups(issues);
  const duplicateByNumber=new Map();
  for (const group of duplicate) for (const n of group.numbers) duplicateByNumber.set(n,group);
  const pullsByNumber=new Map(pulls.map((p)=>[Number(p.number),p]));
  const issueToPulls=new Map();
  for (const pr of pulls) for (const n of issueReferencesFromPull(pr.body)) {
    if (!issueToPulls.has(n)) issueToPulls.set(n,[]);
    issueToPulls.get(n).push(Number(pr.number));
  }
  for (const issue of issues) for (const n of pullReferencesFromIssue(issue.body)) {
    if (!issueToPulls.has(Number(issue.number))) issueToPulls.set(Number(issue.number),[]);
    issueToPulls.get(Number(issue.number)).push(n);
  }

  const treeSet=new Set(input.tree);
  const routeSet=new Set(routesFromTree(input.tree));
  const issueRecords=issues.map((issue)=>{
    const linkedPulls=uniq(issueToPulls.get(Number(issue.number)) ?? []).filter((n)=>pullsByNumber.has(n));
    const linkedOpenPulls=linkedPulls.filter((n)=>pullsByNumber.get(n)?.state==="open");
    const comments=commentsByIssue.get(Number(issue.number)) ?? [];
    const context={
      duplicateByNumber,linkedPulls,linkedOpenPulls,treeSet,routeSet,
      primaryRoutes:primaryRoutes(issue.body),referencedFiles:referencedFiles(issue.body),
      commentText:comments.join("\n")
    };
    const classification=classifyIssue(issue,context);
    return {
      number:Number(issue.number),state:issue.state,title:String(issue.title ?? ""),
      titleDigest:digest(normalize(issue.title)),bodyDigest:digest(normalize(issue.body)),
      commentCount:comments.length,commentMaterialDigest:digest(comments.map(normalize).filter(Boolean).sort()),
      primaryRoutes:context.primaryRoutes,referencedFiles:context.referencedFiles,
      linkedPullRequests:linkedPulls,classification,
      duplicateCanonicalIssueNumber:duplicateByNumber.get(Number(issue.number))?.canonicalIssueNumber ?? null
    };
  });

  const pullRecords=pulls.map((pr)=>{
    const divergence=input.live ? gitDivergence(pr.head?.ref) : input.divergence?.[pr.head?.ref] ?? (pr.draft?{behind:1,ahead:1}:{behind:0,ahead:1});
    return {
      number:Number(pr.number),state:pr.state,draft:Boolean(pr.draft),merged:Boolean(pr.merged_at),
      title:String(pr.title ?? ""),titleDigest:digest(normalize(pr.title)),bodyDigest:digest(normalize(pr.body)),
      headRef:pr.head?.ref ?? null,headSha:pr.head?.sha ?? null,baseRef:pr.base?.ref ?? null,
      divergence,lane:laneForPull(Number(pr.number)),linkedIssues:issueReferencesFromPull(pr.body),
      classification:classifyPull(pr,divergence)
    };
  });

  const openPrByHead=new Set(pulls.filter((p)=>p.state==="open").map((p)=>p.head?.ref).filter(Boolean));
  const mergedPrByHead=new Set(pulls.filter((p)=>p.merged_at).map((p)=>p.head?.ref).filter(Boolean));
  const closedPrByHead=new Set(pulls.filter((p)=>p.state==="closed"&&!p.merged_at).map((p)=>p.head?.ref).filter(Boolean));
  const branchRecords=input.branches.map((branch)=>{
    const divergence=input.live ? gitDivergence(branch.name) : input.divergence?.[branch.name] ?? null;
    return {name:branch.name,sha:branch.commit?.sha ?? branch.sha ?? null,divergence,
      classification:classifyBranch(branch,openPrByHead,mergedPrByHead,closedPrByHead,divergence)};
  }).sort((a,b)=>a.name.localeCompare(b.name));

  if (input.live) {
    const apiBranches=branchRecords.map((b)=>b.name).sort();
    const refBranches=input.refs.map((r)=>r.name).sort();
    assert(stable(apiBranches)===stable(refBranches), "connector coverage mismatch between branches endpoint and all head refs");
  }

  const workflowApiByPath=new Map(input.workflows.map((w)=>[w.path,w]));
  const sourceWorkflowPaths=input.tree.filter((p)=>/^\.github\/workflows\/[^/]+\.ya?ml$/.test(p));
  const allWorkflowPaths=uniq([...workflowApiByPath.keys(),...sourceWorkflowPaths]).sort();
  const workflowRecords=allWorkflowPaths.map((file)=>{
    const api=workflowApiByPath.get(file) ?? null;
    const source=fs.existsSync(path.join(root,file)) ? read(file) : "";
    const facts=workflowSourceFacts(file,source);
    return {path:file,name:api?.name ?? null,state:api?.state ?? null,...facts,classification:classifyWorkflow(api,facts)};
  });

  const material={
    issues:issueRecords.map((r)=>sortDeep(r)),
    pullRequests:pullRecords.map((r)=>sortDeep(r)),
    branches:branchRecords.map((r)=>sortDeep(r)),
    workflows:workflowRecords.map((r)=>sortDeep(r)),
    source:{pathCount:input.tree.length,pathDigest:digest([...input.tree].sort()),routes:[...routeSet].sort()}
  };
  const projectDeclarationDigest=digest(material);
  const pausedWork=[
    ...issueRecords.filter((r)=>r.classification==="PAUSED_WORK_REVIEW").map((r)=>({type:"ISSUE",number:r.number,title:r.title,classification:r.classification})),
    ...pullRecords.filter((r)=>["PAUSED_DRAFT_REVIEW","OPEN_REFRESH_REVIEW","OPEN_CURRENT_REVIEW","CONFLICT_OR_REFRESH_REQUIRED"].includes(r.classification)).map((r)=>({type:"PULL_REQUEST",number:r.number,title:r.title,lane:r.lane,classification:r.classification})),
    ...branchRecords.filter((r)=>r.classification==="PAUSED_ORPHAN_BRANCH_REVIEW").map((r)=>({type:"BRANCH",name:r.name,classification:r.classification}))
  ];
  pausedWork.push({type:"LANE",name:"IMPERATUS_POST_MERGE_EXTERNAL_GATES",pullRequest:118,gates:manifest.knownWorkLanes.IMPERATUS.pausedExternalGates,classification:"EXTERNALLY_BLOCKED_REVIEW"});
  const stale=issueRecords.filter((r)=>["STALE_DECLARATION_REVIEW","IMPLEMENTED_BY_CURRENT_MAIN_REVIEW"].includes(r.classification));
  const external=issueRecords.filter((r)=>r.classification==="EXTERNALLY_BLOCKED_REVIEW");
  external.push({type:"LANE",name:"IMPERATUS_POST_MERGE_EXTERNAL_GATES",gates:manifest.knownWorkLanes.IMPERATUS.pausedExternalGates});
  const coverage={
    status:"FULL_PROVIDER_PAGINATION_AND_REPOSITORY_ENUMERATION_PASS",
    issueCount:issueRecords.length,pullRequestCount:pullRecords.length,branchCount:branchRecords.length,
    workflowCount:workflowRecords.length,sourcePathCount:input.tree.length,commentCount:(input.comments??[]).length,
    duplicateGroupCount:duplicate.length,manualClassificationCount:issueRecords.filter((r)=>r.classification==="MANUAL_CLASSIFICATION_REQUIRED").length,
    issuePullEndpointCrossCheck:input.live?"PASS":"FIXTURE",
    branchRefCrossCheck:input.live?"PASS":"FIXTURE",
    projectDeclarationDigest
  };
  return {material,projectDeclarationDigest,duplicate,pausedWork,stale,external,coverage};
}
function writeOutputs(result, outputDir) {
  fs.mkdirSync(outputDir,{recursive:true});
  const files=manifest.outputContract;
  const inventory={controlId:manifest.controlId,manifestDigest:manifest.manifestDigest,projectDeclarationDigest:result.projectDeclarationDigest,...result.material,coverage:result.coverage};
  fs.writeFileSync(path.join(outputDir,files.inventoryFile),JSON.stringify(sortDeep(inventory),null,2)+"\n");
  fs.writeFileSync(path.join(outputDir,files.duplicateFile),JSON.stringify(result.duplicate,null,2)+"\n");
  fs.writeFileSync(path.join(outputDir,files.pausedWorkFile),JSON.stringify(result.pausedWork,null,2)+"\n");
  fs.writeFileSync(path.join(outputDir,files.staleDeclarationFile),JSON.stringify(result.stale,null,2)+"\n");
  fs.writeFileSync(path.join(outputDir,files.externalGateFile),JSON.stringify(result.external,null,2)+"\n");
  fs.writeFileSync(path.join(outputDir,files.connectorCoverageFile),JSON.stringify(result.coverage,null,2)+"\n");
  const counts=(records,key="classification")=>Object.fromEntries(Object.entries(records.reduce((a,r)=>(a[r[key]]=(a[r[key]]??0)+1,a),{})).sort());
  const md=[
    "# Fardarter Drive™ v6.27 whole-project audit",
    "",
    `Project declaration digest: \`${result.projectDeclarationDigest}\``,
    "",
    "## Coverage",
    "",
    "```text",
    `Issues        ${result.coverage.issueCount}`,
    `Pull requests ${result.coverage.pullRequestCount}`,
    `Branches      ${result.coverage.branchCount}`,
    `Workflows     ${result.coverage.workflowCount}`,
    `Source paths  ${result.coverage.sourcePathCount}`,
    `Comments      ${result.coverage.commentCount}`,
    "```",
    "",
    "## Issue classifications","",
    "```json",JSON.stringify(counts(result.material.issues),null,2),"```","",
    "## Pull-request classifications","",
    "```json",JSON.stringify(counts(result.material.pullRequests),null,2),"```","",
    "## Paused work queue","",
    ...result.pausedWork.slice(0,100).map((x)=>`- ${x.type} ${x.number??x.name} — ${x.classification??"EXTERNALLY_BLOCKED_REVIEW"}${x.lane?` — ${x.lane}`:""}`),
    "",
    "## Connector coverage","",
    `- ${result.coverage.status}`,
    `- Issue/pull endpoint cross-check: ${result.coverage.issuePullEndpointCrossCheck}`,
    `- Branch/ref cross-check: ${result.coverage.branchRefCrossCheck}`,
    `- Manual classification count: ${result.coverage.manualClassificationCount}`,
    "",
    "No issue, pull request, branch, workflow, provider state, canonical state, private record, or external channel was mutated by this audit."
  ].join("\n");
  fs.writeFileSync(path.join(outputDir,files.summaryFile),md+"\n");
}

const liveFiles={
  issues:arg("--issues"),pulls:arg("--pulls"),comments:arg("--comments"),branches:arg("--branches"),
  workflows:arg("--workflows"),tree:arg("--tree"),refs:arg("--refs"),outputDir:arg("--output-dir")
};
let result;
if (Object.values(liveFiles).some(Boolean)) {
  for (const [name,file] of Object.entries(liveFiles)) if (name!=="outputDir") assert(file, `missing live input --${name}`);
  const refs=readLines(liveFiles.refs).map((line)=>{
    const m=line.match(/^([0-9a-f]{40})\s+refs\/heads\/(.+)$/);
    assert(m, `malformed head ref: ${line}`);
    return {sha:m[1],name:m[2]};
  });
  result=auditProject({
    live:true,
    issues:readJsonInput(liveFiles.issues),
    pulls:readJsonInput(liveFiles.pulls),
    comments:readJsonInput(liveFiles.comments),
    branches:readJsonInput(liveFiles.branches),
    workflows:readJsonInput(liveFiles.workflows,"workflows"),
    tree:readLines(liveFiles.tree),refs
  });
  writeOutputs(result,path.resolve(liveFiles.outputDir ?? "/tmp/fardarter-v6-27-audit"));
} else {
  result=auditProject({live:false,...manifest.testVector,comments:[],refs:[],divergence:{paused:{behind:1,ahead:1},merged:{behind:0,ahead:0}}});
  const expected=manifest.testVector.expected;
  const issueByNumber=new Map(result.material.issues.map((r)=>[r.number,r]));
  const prByNumber=new Map(result.material.pullRequests.map((r)=>[r.number,r]));
  assert(result.duplicate.some((g)=>g.canonicalIssueNumber===expected.duplicateCanonical&&g.numbers.includes(expected.duplicateMember)), "fixture duplicate detection failed");
  assert(issueByNumber.get(expected.protectedCurrentAuthority)?.classification==="CURRENT_AUTHORITY", "fixture current authority failed");
  assert(issueByNumber.get(expected.noEffectHistorical)?.classification==="NO_EFFECT_HISTORICAL", "fixture no-effect classification failed");
  assert(prByNumber.get(expected.pausedDraftPullRequest)?.classification==="PAUSED_DRAFT_REVIEW", "fixture paused PR classification failed");
  assert(prByNumber.get(expected.mergedPullRequest)?.classification==="MERGED_HISTORICAL", "fixture merged PR classification failed");
}

console.log(JSON.stringify({
  status:"PASS",
  control:manifest.controlId,
  manifestDigest:manifest.manifestDigest,
  activeTopLevelHead:manifest.predecessors.currentControlHead.controlId,
  governancePredecessor:manifest.predecessors.claimWitness.controlId,
  coverage:result.coverage,
  projectDeclarationDigest:result.projectDeclarationDigest,
  pausedWorkCount:result.pausedWork.length,
  staleDeclarationCount:result.stale.length,
  externalGateCount:result.external.length,
  consequentialEffects:"ZERO",
  next:manifest.decision.nextControlledAction
},null,2));
