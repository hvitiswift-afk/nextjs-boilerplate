#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const chatgpt = JSON.parse(await readFile('examples/openai/armitron-chatgpt-app.profile.json', 'utf8'));
const google = JSON.parse(await readFile('examples/google-cloud/matadata-marketplace.profile.json', 'utf8'));
const googleDraft = await readFile('docs/google-cloud/MATADATA_MARKETPLACE_APPLICATION_DRAFT.md', 'utf8');

assert.equal(chatgpt.currentTruth.remoteDeployment, 'NOT_DEPLOYED');
assert.equal(chatgpt.currentTruth.oauthIssuer, 'NOT_CONNECTED');
assert.equal(chatgpt.currentTruth.chatGptDeveloperModeConfiguration, 'NOT_CREATED');
assert.equal(chatgpt.currentTruth.toolScan, 'NOT_RUN');
assert.equal(chatgpt.currentTruth.appDirectorySubmission, 'NOT_SUBMITTED');
assert.equal(chatgpt.currentTruth.appDirectoryApproval, 'NOT_APPROVED');
assert.equal(chatgpt.writeActions.state, 'NOT_EXPOSED_IN_REMOTE_APP');
assert.match(chatgpt.truthLaw, /not a connected or published ChatGPT app/i);

assert.equal(google.currentTruth.legalEntity, 'UNVERIFIED');
assert.equal(google.currentTruth.googleCloudPartner, 'NOT_VERIFIED');
assert.equal(google.currentTruth.marketplaceVendor, 'NOT_ONBOARDED');
assert.equal(google.currentTruth.producerPortal, 'NOT_ACCESSED');
assert.equal(google.currentTruth.remoteProductDeployment, 'NOT_DEPLOYED');
assert.equal(google.currentTruth.marketplaceSubmission, 'NOT_SUBMITTED');
assert.equal(google.currentTruth.marketplaceApproval, 'NOT_APPROVED');
assert.equal(google.currentTruth.modelGardenPublisherRelationship, 'NOT_ESTABLISHED');
assert.match(google.notCandidateClaim, /does not claim.*foundation model/i);
assert.match(google.positioningBoundary.realisticPath, /AI agent or SaaS/i);
assert.match(google.positioningBoundary.openAiBoundary, /must not claim OpenAI affiliation/i);

assert.match(googleDraft, /Primary route: AI agent/);
assert.match(googleDraft, /Not asserted: foundation-model or Model Garden publisher listing/);
assert.match(googleDraft, /Legal entity\s+UNVERIFIED/);
assert.match(googleDraft, /Listing\s+NOT SUBMITTED/);
assert.match(googleDraft, /Approval\s+NOT APPROVED/);
assert.match(googleDraft, /Their availability in a platform catalog does not prove MATADATA affiliation/);

const combined = JSON.stringify({ chatgpt, google }) + googleDraft;
assert.doesNotMatch(combined, /MATADATA is (approved|listed|a Google partner|an OpenAI partner)/i);
assert.doesNotMatch(combined, /Google (approved|endorsed) MATADATA/i);

console.log(JSON.stringify({
  schemaVersion: 'armitron.publication-readiness.verification.v24',
  status: 'PASS',
  chatGptApp: {
    codeProfile: 'PRESENT',
    deployed: false,
    connected: false,
    submitted: false,
    approved: false
  },
  googleCloudMarketplace: {
    candidateRoute: ['AI agent', 'integrated SaaS'],
    legalEntityVerified: false,
    vendorOnboarded: false,
    submitted: false,
    approved: false,
    modelGardenPublisher: false
  }
}, null, 2));
