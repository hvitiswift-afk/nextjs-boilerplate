const fs = require('node:fs');
const path = require('node:path');

const root = process.argv[2] || 'artifacts';
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const json = (name) => JSON.parse(read(name));

const preview = json('canonicalization-preview.json');
const pilot = json('pilot.json');
const capacity = json('capacity.json');
const operations = json('operations.json');
const reconciliation = json('reconciliation.json');
const pages = {
  home: read('home.html'),
  audit: read('audit.html'),
  operations: read('operations.html'),
  reconciliation: read('reconciliation.html'),
  preview: read('canonicalization-preview.html'),
  sitemap: read('sitemap.xml'),
  robots: read('robots.txt'),
};

const GENESIS = '4c401dd352d4263786ac22072d616f67775761656a771ea8815e4623a7a3975b';
const PROPOSAL = '3c85fe2fc195d5a0c9de45b679f9ef3a5589f36f948ea4a8acc0720483a6dc9e';
const RECONCILIATION = '4035cd406a5db019c4f3b9122e0021b2fb3fcbb23e7e10b040333fdedeb41a22';
const CANDIDATE_EVENT = '2e369ed175bfbd2d2a9ae8cc35ab29a48afc7e25adbfc9591b0127fc2b3fb174';
const CANDIDATE_SNAPSHOT = '4e7e2ead4c466704ad0559fed73cc01cf028722d701ffe47669626858a96c8de';
const REVIEW_BUNDLE = '3198341aebdf82e95d8cd0de680a16553cf9c3b3c2e4fd4824d197de79aa6ef2';
const PREVIEW_LEDGER = '9294df7c63b535b292f163bc1bbc183883d05f7bd99329ed845db9d62e2e7a8c';
const validCount = (value) => value === null || (Number.isInteger(value) && value >= 0);
const checks = [];
const check = (condition, label) => checks.push([Boolean(condition), label]);

check(preview.schemaVersion === '1.0.0', 'preview.schemaVersion');
check(preview.controllerVersion === '6.4.0', 'preview.controllerVersion');
check(preview.controllingIssue === 165, 'preview.controllingIssue');
check(preview.previewLedger?.id === 'FARDARTER-DRIVE-CANONICALIZATION-PREVIEWS-V6-4', 'preview.ledger.id');
check(preview.previewLedger?.digest === PREVIEW_LEDGER, 'preview.ledger.digest');
check(preview.previewLedger?.previewCount === 1, 'preview.ledger.previewCount');
check(preview.previewLedger?.decisionCounts?.PREPARED === 1, 'preview.ledger.preparedCount');
for (const state of ['PREPARED', 'PREVIEW_READY', 'BLOCKED', 'EXPIRED', 'REJECTED', 'APPLIED_BY_REVIEWED_MERGE']) {
  check(preview.previewLedger?.lifecycle?.includes(state), `preview.lifecycle.${state}`);
}
check(preview.previewLedger?.applicationPolicy?.automaticCanonicalization === false, 'preview.automaticCanonicalization');
check(preview.previewLedger?.applicationPolicy?.reviewedMergeRequired === true, 'preview.reviewedMergeRequired');

const bundle = preview.preparedReviewBundle;
check(bundle?.id === 'FARDARTER-CANONICALIZATION-BUNDLE-ISSUE-162-V6-4', 'bundle.id');
check(bundle?.source?.proposalIssue === 162, 'bundle.source.proposalIssue');
check(bundle?.source?.entityIssue === 159, 'bundle.source.entityIssue');
check(bundle?.state === 'PREPARED', 'bundle.state');
check(bundle?.expectedDecision === 'PREVIEW_READY', 'bundle.expectedDecision');
check(bundle?.digest === REVIEW_BUNDLE, 'bundle.digest');
check(bundle?.candidateEvent?.sequence === 1, 'candidate.sequence');
check(bundle?.candidateEvent?.previousEventDigest === GENESIS, 'candidate.previousGenesis');
check(bundle?.candidateEvent?.digest === CANDIDATE_EVENT, 'candidate.digest');
check(bundle?.candidateEvent?.canonical === false, 'candidate.canonicalFalse');
check(bundle?.candidateEvent?.applied === false, 'candidate.appliedFalse');
check(bundle?.candidateEvent?.capacityEffect?.activeDelta === 0, 'candidate.activeDelta');
check(bundle?.candidateEvent?.financialEffect?.createsOrder === false, 'candidate.orderDelta');
check(bundle?.candidateEvent?.financialEffect?.grossRevenueDeltaUsd === 0, 'candidate.grossDelta');
check(bundle?.candidateEvent?.financialEffect?.settledCashDeltaUsd === 0, 'candidate.settledDelta');
check(bundle?.candidateProjection?.activeDeliveries === 0, 'projection.active');
check(bundle?.candidateProjection?.orders === 0, 'projection.orders');
check(bundle?.candidateProjection?.verifiedGrossRevenueUsd === 0, 'projection.gross');
check(bundle?.candidateProjection?.verifiedSettledCashUsd === 0, 'projection.settled');
check(bundle?.candidateReconciliation?.sequence === 1, 'candidateSnapshot.sequence');
check(bundle?.candidateReconciliation?.previousSnapshotDigest === RECONCILIATION, 'candidateSnapshot.previous');
check(bundle?.candidateReconciliation?.digest === CANDIDATE_SNAPSHOT, 'candidateSnapshot.digest');

const current = preview.canonicalCurrentState;
check(current?.headSequence === 0, 'canonical.headSequence');
check(current?.headDigest === GENESIS, 'canonical.headDigest');
check(current?.eventCount === 1, 'canonical.oneGenesisEvent');
check(current?.canonicalBusinessEventCount === 0, 'canonical.zeroBusinessEvents');
check(current?.healthy === true && current?.genesisOnly === true, 'canonical.genesisHealth');
check(Object.values(current?.stateCounts || {}).every((value) => value === 0), 'canonical.allStateCountsZero');
check(current?.totalPlanningSlots === 1000, 'canonical.totalPlanningSlots');
check(current?.effectiveActiveCeiling === 100, 'canonical.effectiveActiveCeiling');
check(current?.activeDeliveries === 0, 'canonical.activeDeliveries');
check(current?.activeHeadroom === 100, 'canonical.activeHeadroom');
check(current?.orders === 0, 'canonical.orders');
check(current?.verifiedGrossRevenueUsd === 0, 'canonical.gross');
check(current?.verifiedSettledCashUsd === 0, 'canonical.settled');
check(current?.receivedCashRequires === 'PAID_SETTLED', 'canonical.cashGate');

check(preview.sourceDigests?.canonicalEventHead === GENESIS, 'digests.canonicalHead');
check(preview.sourceDigests?.proposalLedger === PROPOSAL, 'digests.proposal');
check(preview.sourceDigests?.reconciliation === RECONCILIATION, 'digests.reconciliation');
check(preview.sourceDigests?.preparedCandidateEvent === CANDIDATE_EVENT, 'digests.candidateEvent');
check(preview.sourceDigests?.preparedCandidateSnapshot === CANDIDATE_SNAPSHOT, 'digests.candidateSnapshot');
check(preview.sourceDigests?.preparedReviewBundle === REVIEW_BUNDLE, 'digests.reviewBundle');
check(preview.sourceDigests?.previewLedger === PREVIEW_LEDGER, 'digests.previewLedger');

const counts = preview.publicCounts || {};
check(['AVAILABLE', 'UNAVAILABLE'].includes(counts.sourceState), 'publicCounts.sourceState');
for (const key of ['openPreviewRequests', 'previewReady', 'blocked', 'needsReview']) {
  check(validCount(counts[key]), `publicCounts.${key}`);
}
check(counts.countsAreCanonicalEvidence === false, 'publicCounts.noncanonical');
check(counts.countsAreCommercialEvidence === false, 'publicCounts.noncommercial');

const drive = preview.googleDriveContinuity || {};
check(drive.state === 'CONNECTED_PRIVATE', 'drive.state');
check(drive.publicFolderUrlExposed === false, 'drive.noPublicUrl');
check(drive.publicFileIdsExposed === false, 'drive.noPublicIds');
check(drive.canonicalizationPreviewsMaintained === true, 'drive.previewMaintenance');
check(drive.reviewBundlesMaintained === true, 'drive.bundleMaintenance');
check(drive.automaticCanonicalEventApplication === false, 'drive.noAutomaticApplication');
check(preview.evidenceBoundary?.applicationRequiresReviewedMerge === true, 'boundary.reviewedMergeRequired');
check(preview.evidenceBoundary?.templateIsIndemnityProof === false, 'boundary.notIndemnityProof');

check(pilot && typeof pilot === 'object', 'api.pilot.json');
check(capacity && typeof capacity === 'object', 'api.capacity.json');
check(operations && typeof operations === 'object', 'api.operations.json');
check(reconciliation && typeof reconciliation === 'object', 'api.reconciliation.json');
check(pages.home.includes('/github-control-tower-audit') || pages.home.includes('GitHub Control Tower'), 'page.home');
check(pages.audit.includes('Fardarter Drive'), 'page.audit');
check(pages.operations.toLowerCase().includes('operations'), 'page.operations');
check(pages.reconciliation.toLowerCase().includes('reconciliation'), 'page.reconciliation');
check(pages.preview.toLowerCase().includes('canonicalization'), 'page.preview');
for (const route of [
  '/github-control-tower-audit',
  '/github-control-tower-audit/operations',
  '/github-control-tower-audit/reconciliation',
  '/github-control-tower-audit/canonicalization-preview',
]) {
  check(pages.sitemap.includes(route), `sitemap.${route}`);
}
check(pages.robots.includes('/sitemap.xml') || pages.robots.toLowerCase().includes('sitemap:'), 'robots.sitemap');

const failed = checks.filter(([ok]) => !ok).map(([, label]) => label);
if (failed.length) {
  throw new Error(`Exact v6.4 immutable readback failed: ${failed.join(', ')}`);
}

const receipt = {
  schemaVersion: '1.0.0',
  result: 'DEPLOYED_AND_VERIFIED',
  repository: process.env.GITHUB_REPOSITORY,
  sourceCommit: process.env.EXACT_SOURCE_COMMIT,
  runId: process.env.GITHUB_RUN_ID,
  siteId: process.env.NETLIFY_SITE_ID,
  deployId: process.env.DEPLOY_ID,
  immutableUrl: process.env.IMMUTABLE_URL,
  blobs: {
    previewLedger: '99a4bb840df5630efdf55d7e5fd4d6bdd0b62996',
    preparedReviewBundle: 'e55188c34b34dddbe22652442b1ed6d0d932f25b',
    privateDriveContinuity: 'bd24a05b0372ef77c97d520609baef73d0b778c6',
    previewApi: '95cf068221fd49fc6ddba755f8d47f72dc3da55e',
    previewController: '6d2a32710a00bdb2a8fa49275447699fe8e2c7b3',
  },
  digests: {
    canonicalHead: GENESIS,
    proposal: PROPOSAL,
    reconciliation: RECONCILIATION,
    candidateEvent: CANDIDATE_EVENT,
    candidateSnapshot: CANDIDATE_SNAPSHOT,
    reviewBundle: REVIEW_BUNDLE,
    previewLedger: PREVIEW_LEDGER,
  },
  routes: [
    '/',
    '/github-control-tower-audit',
    '/github-control-tower-audit/operations',
    '/github-control-tower-audit/reconciliation',
    '/github-control-tower-audit/canonicalization-preview',
    '/api/revenue/pilot',
    '/api/revenue/capacity',
    '/api/revenue/operations',
    '/api/revenue/reconciliation',
    '/api/revenue/canonicalization-preview',
    '/sitemap.xml',
    '/robots.txt',
  ],
  verifiedAt: new Date().toISOString(),
};
fs.writeFileSync(path.join(root, 'fardarter-v6-4-secure-deploy-receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
console.log('Exact Fardarter Drive v6.4 immutable readback: PASS');
