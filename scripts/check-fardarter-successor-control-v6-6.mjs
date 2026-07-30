import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const paths = {
  control: "receipts/revenue/FARDARTER-DRIVE-SUCCESSOR-CONTROL-V6-6.json",
  controlSchema: "schemas/revenue/fardarter-drive-successor-control-v6-6.schema.json",
  bundle: "receipts/revenue/FARDARTER-DRIVE-SUCCESSOR-REVIEW-BUNDLE-V6-6.sample.json",
  bundleSchema: "schemas/revenue/fardarter-drive-successor-review-bundle-v6-6.schema.json",
  chain: "receipts/revenue/FARDARTER-DRIVE-STATE-EVENTS-V6-2.json",
  reconciliation: "receipts/revenue/FARDARTER-DRIVE-RECONCILIATION-V6-5.json",
  capacity: "receipts/revenue/FARDARTER-DRIVE-CAPACITY-LEDGER-V6-1.json",
  machine: "receipts/revenue/FARDARTER-DRIVE-STATE-MACHINE-V6-2.json",
  gdrive: "receipts/revenue/FARDARTER-DRIVE-GDRIVE-V6.json",
  lib: "src/lib/revenue/canonical-successor.ts",
  api: "app/api/revenue/successor-readiness/route.ts",
  page: "app/github-control-tower-audit/successor-readiness/page.tsx",
  template: ".github/ISSUE_TEMPLATE/fardarter-successor-review.yml",
  workflow: ".github/workflows/fardarter-successor-review-v6-6.yml",
  readback: ".github/workflows/fardarter-successor-readback-v6-6.yml",
  doc: "docs/repository/FARDARTER-DRIVE-V6-6-DYNAMIC-SUCCESSOR.md",
  package: "package.json",
  sitemap: "app/sitemap.ts",
};
const text = Object.fromEntries(await Promise.all(Object.entries(paths).map(async ([k,p]) => [k, await readFile(p,"utf8")])));
const parse = (v,l) => { try { return JSON.parse(v); } catch(e) { throw new Error(`${l} invalid JSON: ${e.message}`); } };
const assert = (c,m) => { if(!c) throw new Error(m); };
const stable = (v) => Array.isArray(v) ? `[${v.map(stable).join(",")}]` : v && typeof v === "object" ? `{${Object.keys(v).sort().map(k => `${JSON.stringify(k)}:${stable(v[k])}`).join(",")}}` : JSON.stringify(v);
const digest = (obj,key) => { const x=structuredClone(obj); delete x[key]; return createHash("sha256").update(stable(x),"utf8").digest("hex"); };

const control=parse(text.control,"control"), controlSchema=parse(text.controlSchema,"control schema");
const bundle=parse(text.bundle,"bundle"), bundleSchema=parse(text.bundleSchema,"bundle schema");
const chain=parse(text.chain,"chain"), rec=parse(text.reconciliation,"reconciliation"), capacity=parse(text.capacity,"capacity"), machine=parse(text.machine,"machine"), gdrive=parse(text.gdrive,"gdrive"), pkg=parse(text.package,"package");

assert(control.controlId==="FARDARTER-DRIVE-SUCCESSOR-CONTROL-V6-6" && control.controllerVersion==="6.6.0" && control.controllingIssue===173,"control identity mismatch");
assert(digest(control,"controlDigest")===control.controlDigest,"control digest mismatch");
assert(digest(bundle,"bundleDigest")===bundle.bundleDigest,"bundle digest mismatch");
assert(digest(bundle.candidateEvent,"candidateDigest")===bundle.candidateEvent.candidateDigest,"candidate event digest mismatch");
assert(digest(bundle.candidateReconciliation,"snapshotDigest")===bundle.candidateReconciliation.snapshotDigest,"candidate snapshot digest mismatch");
assert(control.controlDigest==="d9e2ecfb97b33e547e87c7c092c25ef37f251e91e7549c1e23f41782987db1ae","control digest lock mismatch");
assert(bundle.bundleDigest==="8f3312568414fcad5d33bc8ee44d4c04f6d54117dce250c62d31c4491b6638f2","bundle digest lock mismatch");
assert(bundle.candidateEvent.candidateDigest==="6e9ec1a02d85b2894d8388bfc3bcc7d4d79147703d3ea68b2bbc9b358a3829b2","candidate event lock mismatch");
assert(bundle.candidateReconciliation.snapshotDigest==="5891a56c76f102573461c64d281f4cac6e785d2737b3ec8d5b5d170cfbd7b245","candidate snapshot lock mismatch");
assert(controlSchema.properties?.controlDigest?.const===control.controlDigest,"control schema digest mismatch");
assert(bundleSchema.properties?.bundleDigest?.const===bundle.bundleDigest,"bundle schema digest mismatch");

assert(chain.headSequence===1 && chain.headDigest==="3859eac9c63bef83624111704d38cf217b0c1a4ece6df874e72a76e9fb1ffc3b","current event head mismatch");
assert(rec.sequence===1 && rec.snapshotDigest==="9f4f878cc0f8f2ddfa7bbdb594d2b9164064acd8901301404aed57b4065eca0f","current reconciliation mismatch");
assert(control.currentCanonical.headSequence===chain.headSequence && control.currentCanonical.headDigest===chain.headDigest,"control does not derive current head");
assert(control.currentCanonical.reconciliationSequence===rec.sequence && control.currentCanonical.reconciliationDigest===rec.snapshotDigest,"control reconciliation mismatch");
assert(control.nextCandidate.eventSequence===chain.headSequence+1 && control.nextCandidate.previousEventDigest===chain.headDigest,"next event is not dynamic head + 1");
assert(control.nextCandidate.reconciliationSequence===rec.sequence+1 && control.nextCandidate.previousSnapshotDigest===rec.snapshotDigest,"next snapshot is not dynamic head + 1");
assert(control.nextCandidate.deriveAtRuntime===true && control.nextCandidate.hardcodedHeadAllowed===false && control.nextCandidate.automaticCanonicalization===false,"dynamic-head boundary mismatch");

assert(chain.currentCanonicalCounts.SCOPE_DRAFTED===1 && Object.entries(chain.currentCanonicalCounts).filter(([k])=>k!=="SCOPE_DRAFTED").every(([,v])=>v===0),"canonical state baseline mismatch");
assert(capacity.canonicalCapacity.orders===0 && capacity.canonicalCapacity.activeDeliveries===0 && capacity.financialEvidence.verifiedGrossRevenueUsd===0 && capacity.financialEvidence.verifiedSettledCashUsd===0,"actual commercial baseline changed");
const transition=machine.allowedTransitions.find(x=>x.fromState==="SCOPE_DRAFTED"&&x.toState==="HUMAN_ACCEPTED");
assert(transition?.gate==="HUMAN_APPROVAL_AND_BUYER_CONSENT","successor gate mismatch");
assert(bundle.state==="BLOCKED" && bundle.decision==="BLOCKED_MISSING_GATE_EVIDENCE","review must be blocked");
assert(bundle.candidateEvent.sequence===2 && bundle.candidateEvent.previousEventDigest===chain.headDigest,"candidate event linkage mismatch");
assert(bundle.candidateEvent.financialEffect.createsOrder===true && bundle.candidateEvent.financialEffect.orderDelta===1,"projection must disclose order effect if applied");
assert(bundle.candidateReconciliation.projectionIfApplied.orders===1 && bundle.actualEffects.orderCreated===false,"projected order must not become actual");
assert(Object.values(bundle.actualEffects).every(v=>v===false),"blocked review must have zero actual effects");
assert(bundle.review.unresolvedBlockers.includes("BUYER_CONSENT") && bundle.review.unresolvedBlockers.includes("BINDING_SCOPE_ACCEPTANCE"),"buyer gates missing");
assert(control.evidenceBoundary.systemAuthorizationEqualsBuyerConsent===false,"system authorization must not equal buyer consent");

for (const title of ["Fardarter Drive™ v6.6 — Dynamic Head and Successor Event Charter","Fardarter Drive™ v6.6 — Successor Review and Gate Register"]) assert(gdrive.documents.some(d=>d.title===title),`Drive receipt missing ${title}`);
assert(gdrive.automation.maintainDynamicHeadSuccessorControl===true && gdrive.automation.maintainSuccessorGateRegister===true && gdrive.automation.applySuccessorWithoutReviewedMerge===false,"Drive successor automation mismatch");
assert(gdrive.privacyBoundary.successorGateEvidencePublic===false && gdrive.privacyBoundary.buyerConsentEvidencePublic===false,"successor evidence privacy mismatch");

for (const required of ["eventChain.headSequence + 1","reconciliation.sequence + 1","eventChain.headDigest","reconciliation.snapshotDigest"]) assert(text.lib.includes(required),`dynamic library missing ${required}`);
for (const required of ["successorBundle.decision","matchesCanonicalControl","hardcodedHeadAllowed: false","actualEffects"]) assert(text.api.includes(required),`API missing ${required}`);
for (const required of ["Dynamic-head successor control","bundle.decision","Projection is not current truth","Broad system-development authorization is not buyer consent"]) assert(text.page.includes(required),`page missing ${required}`);
for (const required of ["[FD successor review]:","Expected current canonical state","HUMAN_ACCEPTED requires exact human approval and buyer consent"]) assert(text.template.includes(required),`template missing ${required}`);
for (const required of ["chain.headSequence + 1","reconciliation.sequence + 1","BLOCKED_HUMAN_GATE_REQUIRED","Canonical event appended: **NO**","contents: read","issues: write"]) assert(text.workflow.includes(required),`workflow missing ${required}`);
assert(!text.workflow.includes("contents: write"),"successor workflow must not write canonical source");
assert(pkg.scripts["fardarter:successor:check"]==="node scripts/check-fardarter-successor-control-v6-6.mjs","successor script missing");
assert(pkg.scripts["revenue:verify"].includes("fardarter:successor:check"),"revenue verifier must include successor check");
assert(text.readback.includes("/api/revenue/successor-readiness") && text.readback.includes("/github-control-tower-audit/successor-readiness"),"successor immutable readback routes missing");
assert(text.sitemap.includes("/github-control-tower-audit/successor-readiness"),"sitemap successor route missing");
assert(text.doc.includes(control.controlDigest) && text.doc.includes(bundle.bundleDigest),"operating doc digest receipt missing");

const publicSourceForbidden=/(?:drive\.google\.com|docs\.google\.com|providerTransactionId|routingNumber|bankAccount|customerEmail|customerName|buyerEmail|signatureValue|privateKey)/i;
for (const [name,value] of [["control",text.control],["bundle",text.bundle],["api",text.api]]) assert(!publicSourceForbidden.test(value),`${name} exposes private data or references`);
assert(!/(?:drive\.google\.com|docs\.google\.com)/i.test(text.workflow),"workflow exposes private Drive references");
const embeddedSecretValue=/(?:providerTransactionId|routingNumber|bankAccount|customerEmail|customerName|buyerEmail|signatureValue)\s*[:=]\s*["'`][^"'`\n]+/i;
assert(!embeddedSecretValue.test(text.workflow),"workflow embeds a private value rather than a detector");

console.log("Fardarter Drive v6.6 dynamic successor control: PASS");
console.log(`Current head: ${chain.headSequence} / ${chain.headDigest}`);
console.log(`Next candidate: ${control.nextCandidate.eventSequence} / previous ${control.nextCandidate.previousEventDigest}`);
console.log(`Decision: ${bundle.decision}; actual orders/gross/settled remain 0/$0/$0`);
