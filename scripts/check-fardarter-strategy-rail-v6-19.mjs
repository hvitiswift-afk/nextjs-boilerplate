import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const p = {
  m: "receipts/revenue/FARDARTER-DRIVE-STRATEGY-RAIL-V6-19.json",
  s: "schemas/revenue/fardarter-drive-strategy-rail-v6-19.schema.json",
  pred: "receipts/revenue/FARDARTER-DRIVE-CONTROL-HEAD-V6-18.json",
  predS: "schemas/revenue/fardarter-drive-control-head-v6-18.schema.json",
  strategy: "docs/repository/FARDARTER-DRIVE.md",
  docs: "docs/revenue/FARDARTER-DRIVE-STRATEGY-RAIL-V6-19.md",
  revenue: ".github/workflows/revenue-experiment.yml",
  workflow: ".github/workflows/fardarter-strategy-rail-v6-19.yml",
  pkg: "package.json",
  predV: "scripts/check-fardarter-control-head-v6-18.mjs",
};
const t = Object.fromEntries(await Promise.all(Object.entries(p).map(async ([k,v]) => [k, await readFile(v,"utf8")])));
const j = (k) => { try { return JSON.parse(t[k]); } catch(e) { throw new Error(`${k} invalid JSON: ${e.message}`); } };
const m=j("m"), s=j("s"), pred=j("pred"), predS=j("predS"), pkg=j("pkg");
const ok=(x,msg)=>{if(!x)throw new Error(msg)};
const stable=(v)=>Array.isArray(v)?`[${v.map(stable)}]`:v&&typeof v==="object"?`{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${stable(v[k])}`)}}`:JSON.stringify(v);
const sha=(x)=>createHash("sha256").update(x,"utf8").digest("hex");
const noDigest=structuredClone(m); delete noDigest.manifestDigest;
const subset=(actual, expected, path="manifest")=>{
  for(const [k,v] of Object.entries(expected)){
    const a=actual?.[k], q=`${path}.${k}`;
    if(v&&typeof v==="object"&&!Array.isArray(v)) subset(a,v,q);
    else ok(stable(a)===stable(v),`${q} mismatch`);
  }
};

ok(m.controlId==="FARDARTER-DRIVE-STRATEGY-RAIL-V6-19"&&m.controllerVersion==="6.19.0"&&m.controllingIssue===217&&m.implementationIssue===218,"identity mismatch");
ok(sha(stable(noDigest))==="2f17be6563d67a1a724731ea8c541f29daf1cda1e1cfaf490bcf8c50f77ac022"&&m.manifestDigest==="2f17be6563d67a1a724731ea8c541f29daf1cda1e1cfaf490bcf8c50f77ac022","digest mismatch");
ok(s.type==="object"&&stable(s.const)===stable(m),"schema mismatch");
ok(pred.controlId===m.predecessor.controlId&&pred.controllerVersion===m.predecessor.version&&pred.manifestDigest==="80764bd177469742831497a96290a8d74518035d632d4908f669006c3bf45f7c"&&m.predecessor.digest===pred.manifestDigest&&pred.repository.postMergeState==="STANDING_CONTROL_HEAD_RECONCILED"&&predS.type==="object"&&stable(predS.const)===stable(pred),"predecessor mismatch");

subset(m,{
 repository:{repositoryFullName:"hvitiswift-afk/nextjs-boilerplate",baseHead:"b796ff7fd1851ef88544abb294f288fb4cd04258",standingControlBefore:"FARDARTER-DRIVE-CONTROL-HEAD-V6-18",standingControlAfter:"FARDARTER-DRIVE-STRATEGY-RAIL-V6-19",driftVerified:true,historyRewriteAllowed:false,postMergeState:"STRATEGY_RAIL_RECONCILED"},
 publicAuthorityMap:{protectedOfferIssue:133,historicalStrategyIssue:141,currentSourceAuthority:"FARDARTER-DRIVE-STRATEGY-RAIL-V6-19",currentStrategyDocument:"docs/repository/FARDARTER-DRIVE.md",providerEvidenceOwner:"FARDARTER_DRIVE_LIVE_WATCH",conflictingOlderTextAction:"PRESERVE_AS_HISTORY_AND_USE_NEWEST_REVIEWED_EVIDENCE"},
 issue141:{issueNumber:141,state:"OPEN",role:"HISTORICAL_STRATEGY_AND_STAGE_GOVERNANCE_RAIL",bodyState:"HISTORICAL_BODY_PRESERVED",automaticBodyRewriteAllowed:false,currentAuthorityFromOriginalBodyAllowed:false,originalV4OperatingBase:{totalPilotCapacity:10,maximumActiveDeliveries:2,deploymentState:"UNVERIFIED_HISTORICAL"},appendOnlyReceiptsThrough:"V6.12",postMergeCompletionMarker:"<!-- jp-fardarter-strategy-rail-v6-19-complete -->"},
 strategyDocument:{path:"docs/repository/FARDARTER-DRIVE.md",state:"CURRENT_STRATEGY_AND_AUTHORITY_MAP",version:"6.19.0",sha256:"6396928240bfec30f3e366615fd43c4602e3a3c9966ffc3051d9ef86b8998990"},
 currentTruth:{
  issue133:{integrityState:"EXACT_CURRENT_OFFER_INTACT",publicState:"OPEN_FOR_VERIFIED_FIT_CHECKS",bodySha256:"369338fda0fe9e2236eecd68a1321635e025e85365eb701e10ee1d8bb3c405e0",automaticRewriteAllowed:false},
  applicationSource:{state:"SOURCE_MERGED_NOT_DEPLOYED"},
  production:{applicationState:"DEPLOYED_AND_VERIFIED",controlState:"RECONCILED",deployedApplicationSource:"88bd8dc89a0bd95f42c7e1a21dccc56fe9dc7334",deployId:"6a6ba0366ebec6650d843ac3",providerState:"READY_CURRENT",verifiedRouteCount:18,exactBodyMatchCount:18,repositoryRelationship:"CONTROL_AHEAD_OF_DEPLOYED_APPLICATION_SOURCE",sourceGap:"EXPECTED_CONTROL_ONLY_GAP"},
  canonical:{eventHeadSequence:1,eventHeadDigest:"3859eac9c63bef83624111704d38cf217b0c1a4ece6df874e72a76e9fb1ffc3b",reconciliationSequence:1,reconciliationDigest:"9f4f878cc0f8f2ddfa7bbdb594d2b9164064acd8901301404aed57b4065eca0f",scopeDrafted:1,humanAccepted:0,active:0,event2Present:false,candidateEvent:null,candidateReconciliation:null},
  consent:{packageState:"NO_PACKAGE",decision:"AWAITING_COUNTERPARTY_EVIDENCE",independentVerificationPerformed:false,eligibleForCanonicalApplication:false},
  capacity:{totalPlanningSlots:1000,effectiveActiveCeiling:100,activeDeliveries:0,activeHeadroom:100,overrideState:"INACTIVE_NO_RECEIPT",automaticActivationAllowed:false},
  money:{orders:0,verifiedGrossRevenueUsd:0,verifiedSettledCashUsd:0,receivedCashRequires:"PAID_SETTLED"},
  privateContinuity:{state:"CONNECTED_PRIVATE",knownDocumentCount:17,ownerOnly:true,shared:false,publicPrivateReferencesExposed:false},
 },
 routingAndNotification:{routeCount:11,notificationEventCount:8,silenceConditionCount:9,maximumNotificationsPerFingerprint:1,sameFingerprintAction:"SUPPRESS_NOTIFICATION",nothingMaterialChangedDisposition:"SILENT",nativeGitHubFirstResponseOwner:"NATIVE_V6_9_WORKFLOW",providerEvidenceAndMutationOwner:"FARDARTER_DRIVE_LIVE_WATCH",publicFingerprintExposureAllowed:false},
 pointInTimeScan:{repositoryHead:"b796ff7fd1851ef88544abb294f288fb4cd04258",newRepositoryCommits:0,openExternalAuditRequests:0,relevantInboundCounterpartyMessages:0,newConsentPackages:0,newEventProposals:0,newPreviews:0,newCapacityRequests:0,providerEvidenceChange:false,materialConflict:"PUBLIC_STRATEGY_AUTHORITY_MAP_STALE",externalInputDisposition:"SILENT_NO_MATERIAL_EXTERNAL_CHANGE"},
 decision:{state:"READY_FOR_REVIEWED_STRATEGY_RAIL_RECONCILIATION",postMergeState:"STRATEGY_RAIL_RECONCILED",nextControlledAction:"HOLD_FOR_GENUINE_EXTERNAL_INPUT_OR_SEPARATELY_AUTHORIZED_EXACT_PRODUCTION_PROMOTION",automaticIssue133RewriteAllowed:false,automaticIssue141BodyRewriteAllowed:false,automaticDeploymentAllowed:false,automaticCanonicalAdvanceAllowed:false},
});

ok(sha(t.strategy)==="6396928240bfec30f3e366615fd43c4602e3a3c9966ffc3051d9ef86b8998990","strategy document hash mismatch");
ok(m.scaleHorizons.length===5&&m.scaleHorizons.map(x=>x.stage).join()==="FD-001K,FD-001M,FD-001B,FD-001T,FD-001Q"&&m.scaleHorizons.every(x=>["NOT_ACHIEVED","ASPIRATIONAL_NOT_ACHIEVED","SYMBOLIC_UNLESS_INDEPENDENTLY_EVIDENCED"].includes(x.status)),"scale classification mismatch");
ok(Object.values(m.actualEffects).every(x=>x===0)&&Object.values(m.projectedEffects).every(x=>x===0)&&Object.values(m.consequentialEffects).every(x=>x===false),"consequential effect mismatch");

const requiredRevenue=["name: Verify Fardarter Drive v6.19 strategy authority map","npm run revenue:verify","FARDARTER-DRIVE-STRATEGY-RAIL-V6-19.json","FARDARTER-DRIVE-CONTROL-HEAD-V6-18.json","fardarter-drive-strategy-rail-v6-19.schema.json","controller_version=6.19.0","strategy_control=FARDARTER-DRIVE-STRATEGY-RAIL-V6-19","strategy_manifest_digest=2f17be6563d67a1a724731ea8c541f29daf1cda1e1cfaf490bcf8c50f77ac022","strategy_document_sha256=6396928240bfec30f3e366615fd43c4602e3a3c9966ffc3051d9ef86b8998990","issue_141_role=HISTORICAL_STRATEGY_AND_STAGE_GOVERNANCE_RAIL","standing_control=FARDARTER-DRIVE-CONTROL-HEAD-V6-18","control_head_manifest_digest=80764bd177469742831497a96290a8d74518035d632d4908f669006c3bf45f7c","permissions:\n  contents: read"];
requiredRevenue.forEach(x=>ok(t.revenue.includes(x),`revenue workflow missing ${x}`));
const lines=t.revenue.split("\n");
ok(lines.some(x=>x.trim()==="name: Verify Fardarter Drive v6.19 strategy authority map"),"active v6.19 job missing");
ok(!lines.some(x=>x.trim()==="name: Verify Fardarter Drive v6.18 standing control head"),"v6.18 remains active YAML job");
ok(t.revenue.includes("Historical v6.18 compatibility anchors")&&t.revenue.includes("historical_job_identity=name: Verify Fardarter Drive v6.18 standing control head")&&t.revenue.includes("Historical v6.16 compatibility anchors"),"compatibility anchors missing");

["name: Fardarter Strategy Rail v6.19","permissions:\n  contents: read","npm run fardarter:strategy-rail:check","FARDARTER-DRIVE-STRATEGY-RAIL-V6-19.json","fardarter-drive-strategy-rail-v6-19.schema.json","docs/repository/FARDARTER-DRIVE.md"].forEach(x=>ok(t.workflow.includes(x),`dedicated workflow missing ${x}`));
for(const w of [t.revenue,t.workflow])for(const x of ["issues: write","netlify deploy","deploy --","send_email","gmail","curl ","wget "])ok(!w.toLowerCase().includes(x),`workflow is not read-only: ${x}`);

ok(pkg.scripts["fardarter:control-head:check"]==="node scripts/check-fardarter-control-head-v6-18.mjs"&&pkg.scripts["fardarter:strategy-rail:check"]==="node scripts/check-fardarter-strategy-rail-v6-19.mjs"&&pkg.scripts["revenue:verify"].includes("npm run fardarter:control-head:check")&&pkg.scripts["revenue:verify"].endsWith("npm run fardarter:strategy-rail:check"),"package integration mismatch");
ok(t.predV.includes("FARDARTER-DRIVE-CONTROL-HEAD-V6-18")&&t.predV.includes("fardarter:control-head:check"),"predecessor verifier not preserved");

["Fardarter Drive™ v6.19","Current Strategy and Authority Map","FARDARTER-DRIVE-STRATEGY-RAIL-V6-19","FARDARTER-DRIVE-CONTROL-HEAD-V6-18","Issue #133","Issue #141","HISTORICAL_STRATEGY_AND_STAGE_GOVERNANCE_RAIL","1,000","Effective ACTIVE ceiling      100","DEPLOYED_AND_VERIFIED","SOURCE_MERGED_NOT_DEPLOYED","SILENT_NO_MATERIAL_EXTERNAL_CHANGE","<!-- jp-fardarter-strategy-rail-v6-19-complete -->","HOLD_FOR_GENUINE_EXTERNAL_INPUT_OR_SEPARATELY_AUTHORIZED_EXACT_PRODUCTION_PROMOTION"].forEach(x=>ok(t.strategy.includes(x),`strategy document missing ${x}`));
["# Fardarter Drive™ v4","**Controlling issues:** `#141`, `#142`, `#143`","Total pilot capacity        10 audits","Maximum active deliveries   2","Deployment                  UNVERIFIED until immutable readback"].forEach(x=>ok(!t.strategy.includes(x),`stale strategy text remains ${x}`));
["Fardarter Drive™ v6.19","STRATEGY_RAIL_RECONCILED","historical strategy and stage-governance record","ten planned audits","two maximum active deliveries","Issue #141","Issue #133","unachieved planning classifications","No private Google Drive URL or file ID","2f17be6563d67a1a724731ea8c541f29daf1cda1e1cfaf490bcf8c50f77ac022","6396928240bfec30f3e366615fd43c4602e3a3c9966ffc3051d9ef86b8998990"].forEach(x=>ok(t.docs.includes(x),`documentation missing ${x}`));

const pub=[t.m,t.s,t.strategy,t.docs,t.revenue,t.workflow].join("\n");
ok(!/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(pub),"public source exposes email");
["docs.google.com","drive.google.com",'"fileId"','"folderId"','"documentId"'].forEach(x=>ok(!pub.includes(x),`public source exposes private token ${x}`));

console.log("Fardarter Drive v6.19 strategy rail: PASS");
console.log(`control_id=${m.controlId}`);
console.log(`manifest_digest=${m.manifestDigest}`);
console.log(`strategy_document_sha256=${m.strategyDocument.sha256}`);
console.log(`issue_141_role=${m.issue141.role}`);
console.log(`post_merge_state=${m.decision.postMergeState}`);
console.log(`next_action=${m.decision.nextControlledAction}`);
