import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const parse = (p) => JSON.parse(read(p));
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };
const sortDeep = (v) => Array.isArray(v)
  ? v.map(sortDeep)
  : v && typeof v === "object"
    ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortDeep(v[k])]))
    : v;
const stable = (v) => JSON.stringify(sortDeep(v));
const digest = (v) => crypto.createHash("sha256").update(v, "utf8").digest("hex");

const manifestPath = "receipts/revenue/FARDARTER-DRIVE-CLAIM-WITNESS-REF-INTEGRITY-V6-26.json";
const schemaPath = "schemas/revenue/fardarter-drive-claim-witness-ref-integrity-v6-26.schema.json";
const docsPath = "docs/revenue/FARDARTER-DRIVE-CLAIM-WITNESS-REF-INTEGRITY-V6-26.md";
const workflowPath = ".github/workflows/fardarter-claim-witness-ref-integrity-v6-26.yml";
const verifierPath = "scripts/check-fardarter-claim-witness-ref-integrity-v6-26.mjs";

const manifest = parse(manifestPath);
const schema = parse(schemaPath);
const v625 = parse("receipts/revenue/FARDARTER-DRIVE-RECEIPT-DESTINATION-CLAIM-V6-25.json");
const v624 = parse("receipts/revenue/FARDARTER-DRIVE-CROSS-LAYER-RECEIPT-IDEMPOTENCY-V6-24.json");
const pkg = parse("package.json");
const docs = read(docsPath);
const workflow = read(workflowPath);
const revenue = read(".github/workflows/revenue-experiment.yml");

const unsigned = structuredClone(manifest);
delete unsigned.manifestDigest;
assert(digest(stable(unsigned)) === manifest.manifestDigest, "v6.26 manifest digest mismatch");
assert(stable(schema.const) === stable(manifest), "v6.26 strict const schema mismatch");

assert(
  manifest.controlId === "FARDARTER-DRIVE-CLAIM-WITNESS-REF-INTEGRITY-V6-26" &&
  manifest.controllerVersion === "6.26.0" &&
  manifest.controllingIssue === 238 &&
  manifest.implementationIssue === 239 &&
  manifest.repository.baseHead === "0423ea38c5b65b3bdda585f51c21e43cfe2918fe" &&
  manifest.repository.preparedState === "PREPARED_SOURCE_ONLY_PENDING_REVIEWED_MERGE" &&
  manifest.repository.postMergeState === "CLAIM_WITNESS_AND_REF_INTEGRITY_RECONCILED" &&
  manifest.repository.historyRewriteAllowed === false,
  "v6.26 repository/control lock mismatch",
);
assert(
  v625.manifestDigest === "52b032dcbaee35ef4039a82285cb37b9aaa0abbd8a30f97a555a76372f7d26e6" &&
  manifest.predecessors.receiptDestinationClaim.digest === v625.manifestDigest &&
  manifest.predecessors.receiptDestinationClaim.repositoryMergeReadback === "0423ea38c5b65b3bdda585f51c21e43cfe2918fe" &&
  v624.manifestDigest === "56cb6b6395262f095d5888f2f45837b30fb7da5ca4f53c17c9238c9571b6d056" &&
  manifest.predecessors.receiptIdempotency.digest === v624.manifestDigest &&
  manifest.predecessors.currentControlHead.controlId === "FARDARTER-DRIVE-CURRENT-CONTROL-HEAD-V6-21" &&
  manifest.predecessors.currentControlHead.remainsActiveTopLevelHead === true,
  "v6.26 predecessor mismatch",
);
assert(
  stable(manifest.materialReceiptKeyContract.orderedMaterialFields) === stable([
    "controlId","manifestDigest","reviewedHead","mergeReadbackCommit","destinationClass","receiptPurpose"
  ]) && manifest.materialReceiptKeyContract.identityChangeAllowed === false,
  "v6.24 receipt identity changed",
);
assert(
  manifest.claimNamespace.branchPrefix === "fd-receipt-claim/" &&
  manifest.claimNamespace.suffixPattern === "^[0-9a-f]{64}$" &&
  manifest.claimNamespace.privateReceiptKeyAllowed === false &&
  ["normalUpdateAllowed","forceUpdateAllowed","automaticDeleteAllowed","automaticRecreateAllowed","automaticReplacementAllowed"]
    .every((k) => manifest.claimNamespace[k] === false),
  "v6.26 claim namespace mismatch",
);

const known = manifest.knownClaimWitness;
const knownMaterial = {
  receiptKey: known.receiptKey,
  branchName: known.branchName,
  targetCommit: known.expectedTargetCommit,
  controlId: known.controlId,
  mergeReadbackCommit: known.expectedTargetCommit,
  destinationClass: known.destinationClass,
  receiptPurpose: known.receiptPurpose,
  canonicalIssueNumber: known.canonicalIssueNumber,
  classification: known.expectedClassification,
};
assert(
  known.receiptKey === "ec7e499f89db4e25f244b9cf54934485f293807272443e58ece5d6593f13f427" &&
  known.branchName === `fd-receipt-claim/${known.receiptKey}` &&
  known.expectedTargetCommit === "0423ea38c5b65b3bdda585f51c21e43cfe2918fe" &&
  known.canonicalIssueNumber === 235 &&
  known.authoritativeCommentId === 5144962740 &&
  known.expectedClassification === "CLAIM_BOUND_COMPLETE" &&
  digest(stable(knownMaterial)) === known.expectedWitnessDigest,
  "v6.25 known witness mismatch",
);
const legacy = manifest.legacyPreclaimExceptions[0];
assert(
  manifest.legacyPreclaimExceptions.length === 1 &&
  legacy.receiptKey === "eee942e246454fc6626f35967fa12dd3a50e34d4502e0811043e0fa08f78cdb2" &&
  legacy.classification === "LEGACY_PRECLAIM_DUPLICATE_RECONCILED" &&
  legacy.controlTransitionCount === 1 &&
  legacy.claimRequired === false &&
  legacy.historyPreserved === true,
  "v6.24 legacy exception mismatch",
);

for (const code of [
  "MISSING_CLAIM_REF","REPOINTED_CLAIM_REF","ORPHAN_CLAIM_REF","MALFORMED_CLAIM_REF",
  "CLAIM_WITHOUT_RECEIPT","RECEIPT_WITHOUT_CLAIM","CLAIM_BOUND_DUPLICATE_RECEIPT",
  "PRIVATE_DESTINATION_PUBLIC_CLAIM","DUPLICATE_CLAIM_REGISTRY_ENTRY"
]) assert(Object.values(manifest.conflictClassifications).includes(code), `missing ${code}`);

assert(
  manifest.conflictAction.preserveHistory === true &&
  manifest.conflictAction.stopFurtherWritesForReceiptKey === true &&
  manifest.conflictAction.quarantine === true &&
  manifest.conflictAction.notifyMaximumPerChangedMaterialFingerprint === 1 &&
  ["automaticClaimRecreateAllowed","automaticClaimRepointAllowed","automaticClaimDeleteAllowed","automaticReceiptRewriteAllowed"]
    .every((k) => manifest.conflictAction[k] === false) &&
  manifest.claimWitnessDigestContract.isReceiptKey === false &&
  manifest.claimWitnessDigestContract.altersMaterialReceiptIdentity === false,
  "v6.26 conflict/digest boundary mismatch",
);
assert(
  manifest.currentTruth.canonical.eventHeadSequence === 1 &&
  manifest.currentTruth.canonical.reconciliationSequence === 1 &&
  manifest.currentTruth.canonical.canonicalBusinessEventCount === 1 &&
  manifest.currentTruth.canonical.humanAccepted === 0 &&
  manifest.currentTruth.canonical.active === 0 &&
  manifest.currentTruth.consent.packageState === "NO_PACKAGE" &&
  manifest.currentTruth.capacity.activeDeliveries === 0 &&
  manifest.currentTruth.money.orders === 0 &&
  manifest.currentTruth.money.verifiedGrossRevenueUsd === 0 &&
  manifest.currentTruth.money.verifiedSettledCashUsd === 0 &&
  manifest.currentTruth.privateContinuity.ownerOnly === true &&
  manifest.currentTruth.privateContinuity.shared === false &&
  Object.values(manifest.actualEffects).every((v) => v === 0) &&
  Object.values(manifest.projectedEffects).every((v) => v === 0) &&
  Object.values(manifest.consequentialEffects).every((v) => v === false),
  "v6.26 truth/effects mismatch",
);
assert(
  manifest.decision.replacesCurrentControlHead === false &&
  manifest.decision.automaticDeploymentAllowed === false &&
  manifest.decision.automaticCanonicalAdvanceAllowed === false &&
  manifest.decision.automaticHistoricalRewriteAllowed === false &&
  manifest.decision.automaticClaimRepairAllowed === false,
  "v6.26 authority boundary mismatch",
);

const receiptFiles = fs.readdirSync(path.join(root, "receipts/revenue")).filter((n) => /V6-26\.json$/i.test(n));
const schemaFiles = fs.readdirSync(path.join(root, "schemas/revenue")).filter((n) => /v6-26\.schema\.json$/i.test(n));
assert(
  stable(receiptFiles) === stable(["FARDARTER-DRIVE-CLAIM-WITNESS-REF-INTEGRITY-V6-26.json"]) &&
  stable(schemaFiles) === stable(["fardarter-drive-claim-witness-ref-integrity-v6-26.schema.json"]),
  "competing v6.26 manifest or schema detected",
);

assert(
  pkg.scripts["fardarter:claim-witness:check"] === `node ${verifierPath}` &&
  pkg.scripts["revenue:verify"].includes(
    "npm run fardarter:claim-witness:check && npm run fardarter:receipt-idempotency:check && npm run fardarter:receipt-destination-claim:check && npm run fardarter:application-control-projection:check"
  ) &&
  pkg.scripts["revenue:verify"].includes(
    "npm run fardarter:receipt-idempotency:check && npm run fardarter:receipt-destination-claim:check && npm run fardarter:application-control-projection:check"
  ) &&
  pkg.scripts["revenue:verify"].endsWith("npm run fardarter:strategy-rail:check"),
  "v6.26 package integration mismatch",
);
assert(
  revenue.split("\n").filter((l) => !l.trimStart().startsWith("#"))
    .some((l) => l.trim() === "name: Verify Fardarter Drive v6.21 current control head"),
  "v6.21 active top-level head changed",
);
for (const token of [
  "name: Fardarter Claim Witness Ref Integrity v6.26",
  "permissions:\n  contents: read\n  issues: read",
  "git ls-remote --heads origin 'refs/heads/fd-receipt-claim/*'",
  "gh api --paginate",
  "npm run fardarter:claim-witness:check",
  "FARDARTER-DRIVE-CLAIM-WITNESS-REF-INTEGRITY-V6-26.json",
  "fardarter-drive-claim-witness-ref-integrity-v6-26.schema.json",
]) assert(workflow.includes(token), `workflow missing ${token}`);
for (const token of ["contents: write","issues: write","git push","git update-ref","netlify deploy","deploy --","send_email","gmail","curl ","wget "])
  assert(!workflow.toLowerCase().includes(token), `workflow is not read-only: ${token}`);
for (const token of [
  "Fardarter Drive™ v6.26","CLAIM_WITNESS_AND_REF_INTEGRITY_RECONCILED",
  "CLAIM_BOUND_COMPLETE","LEGACY_PRECLAIM_DUPLICATE_RECONCILED",
  "MISSING_CLAIM_REF","REPOINTED_CLAIM_REF",manifest.manifestDigest,
  known.expectedWitnessDigest,"No private Google Drive URL or file ID",
]) assert(docs.includes(token), `documentation missing ${token}`);

const publicSource = [read(manifestPath),read(schemaPath),workflow,docs].join("\n");
assert(!/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(publicSource), "public email exposure");
for (const token of ["docs.google.com","drive.google.com",'"fileId"','"folderId"','"documentId"','"privateReceiptKey"'])
  assert(!publicSource.includes(token), `private reference exposure: ${token}`);

const args = process.argv.slice(2);
const arg = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i+1] : null; };
const refsFile = arg("--refs");
const commentsFile = arg("--comments");
const flatten = (v) => Array.isArray(v) ? v.flatMap(flatten) : [v];
const field = (body,name) => body.match(new RegExp(`^${name}\\s+([^\\n\\r]+)$`,"m"))?.[1]?.trim() ?? null;
const version = (id) => Number(String(id ?? "").match(/V6-(\d+)$/)?.[1] ?? NaN);

let live = null;
if (refsFile || commentsFile) {
  assert(refsFile && commentsFile, "both --refs and --comments are required");
  const refs = fs.readFileSync(refsFile,"utf8").split(/\r?\n/).map((l)=>l.trim()).filter(Boolean).map((line)=>{
    const m = line.match(/^([0-9a-f]{40})\s+refs\/heads\/fd-receipt-claim\/(.+)$/);
    assert(m, `MALFORMED_CLAIM_REF: ${line}`);
    assert(/^[0-9a-f]{64}$/.test(m[2]), `MALFORMED_CLAIM_REF: ${m[2]}`);
    return {targetCommit:m[1],receiptKey:m[2],branchName:`fd-receipt-claim/${m[2]}`};
  });
  assert(new Set(refs.map((r)=>r.receiptKey)).size === refs.length, "DUPLICATE_CLAIM_REGISTRY_ENTRY");

  const comments = flatten(JSON.parse(fs.readFileSync(commentsFile,"utf8")))
    .filter((c)=>c && typeof c.body === "string");
  const completions = [];
  const corrections = [];
  for (const c of comments) {
    const issueNumber = Number(String(c.issue_url ?? "").match(/\/issues\/(\d+)$/)?.[1] ?? NaN);
    for (const m of c.body.matchAll(/<!-- jp-fardarter-receipt-v1:([0-9a-f]{64}) -->/g)) {
      completions.push({
        receiptKey:m[1],issueNumber,commentId:c.id ?? null,
        controlId:field(c.body,"controlId"),
        mergeReadbackCommit:field(c.body,"mergeReadbackCommit"),
        destinationClass:field(c.body,"destinationClass"),
        receiptPurpose:field(c.body,"receiptPurpose"),
        canonicalIssueNumber:Number(field(c.body,"canonicalIssue")) || null,
      });
    }
    for (const m of c.body.matchAll(/<!-- jp-fardarter-receipt-correction-v1:([0-9a-f]{64}) -->/g))
      corrections.push({receiptKey:m[1],issueNumber,commentId:c.id ?? null});
  }

  const old = completions.filter((x)=>x.receiptKey === legacy.receiptKey);
  const oldCorrections = corrections.filter((x)=>x.receiptKey === legacy.receiptKey);
  assert(
    old.length === 2 && oldCorrections.length === 1 &&
    old.some((x)=>x.issueNumber===legacy.authoritativeIssueNumber && x.commentId===legacy.authoritativeCommentId) &&
    old.some((x)=>x.issueNumber===legacy.laterDuplicateIssueNumber && x.commentId===legacy.laterDuplicateCommentId) &&
    oldCorrections[0].issueNumber===legacy.correctionIssueNumber &&
    oldCorrections[0].commentId===legacy.correctionCommentId,
    "legacy v6.24 witness mismatch",
  );

  const modern = completions.filter((x)=>version(x.controlId) >= 25);
  const records = refs.map((ref)=>{
    const matches = modern.filter((x)=>x.receiptKey===ref.receiptKey);
    assert(matches.length > 0, `CLAIM_WITHOUT_RECEIPT: ${ref.receiptKey}`);
    assert(matches.length === 1, `CLAIM_BOUND_DUPLICATE_RECEIPT: ${ref.receiptKey}`);
    const r = matches[0];
    assert(r.destinationClass === "GITHUB_PUBLIC_ISSUE", `PRIVATE_DESTINATION_PUBLIC_CLAIM: ${ref.receiptKey}`);
    assert(r.receiptPurpose === "CONTROL_COMPLETION", `ORPHAN_CLAIM_REF: ${ref.receiptKey}`);
    assert(r.mergeReadbackCommit === ref.targetCommit, `REPOINTED_CLAIM_REF: ${ref.receiptKey}`);
    assert(r.canonicalIssueNumber === r.issueNumber, `ORPHAN_CLAIM_REF: noncanonical ${ref.receiptKey}`);
    return {
      receiptKey:ref.receiptKey,branchName:ref.branchName,targetCommit:ref.targetCommit,
      controlId:r.controlId,mergeReadbackCommit:r.mergeReadbackCommit,
      destinationClass:r.destinationClass,receiptPurpose:r.receiptPurpose,
      canonicalIssueNumber:r.canonicalIssueNumber,classification:"CLAIM_BOUND_COMPLETE",
    };
  });
  for (const r of modern)
    assert(refs.filter((x)=>x.receiptKey===r.receiptKey).length===1, `RECEIPT_WITHOUT_CLAIM: ${r.receiptKey}`);

  const knownLive = records.find((r)=>r.receiptKey===known.receiptKey);
  assert(knownLive && stable(knownLive)===stable(knownMaterial) && digest(stable(knownLive))===known.expectedWitnessDigest,
    "known v6.25 live witness mismatch");
  live = {
    status:"LIVE_CLAIM_WITNESS_PASS",
    claimCount:refs.length,
    postV625ReceiptCount:modern.length,
    legacyExceptionCount:1,
    witnessDigest:digest(stable(records.map(sortDeep).sort((a,b)=>a.receiptKey.localeCompare(b.receiptKey)))),
    records,
  };
}

console.log(JSON.stringify({
  status:"PASS",control:manifest.controlId,manifestDigest:manifest.manifestDigest,
  activeTopLevelHead:manifest.predecessors.currentControlHead.controlId,
  governancePredecessor:manifest.predecessors.receiptDestinationClaim.controlId,
  knownClaim:known.branchName,knownWitnessDigest:known.expectedWitnessDigest,
  live,consequentialEffects:"ZERO",next:manifest.decision.nextControlledAction,
},null,2));
