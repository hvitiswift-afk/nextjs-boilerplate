#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const definition = JSON.parse(await readFile('tools/armitron/v25/armitron-definition.json', 'utf8'));
const registry = JSON.parse(await readFile('examples/armitron/v25/universe-registry.json', 'utf8'));
const enterprise = JSON.parse(await readFile('enterprise/github-enterprise-p5.json', 'utf8'));
const marketplace = JSON.parse(await readFile('examples/google-cloud/armitron-a2a-marketplace.profile.json', 'utf8'));

assert.equal(definition.componentId, 'VSHARP-COMP-ARMITRON-001');
assert.equal(definition.version, '25.0.0');
assert.deepEqual(Object.keys(definition.worldSystem).slice(0, 3), ['V#', 'T#', 'C#']);
assert.equal(definition.universeSystem.linkGate, 'V-10_TRANSVERSE_TRANSFER_TRANSFORM');
assert.equal(definition.exchangeSystem.cSharpFences.length, 10);
assert.ok(definition.exchangeSystem.activities.includes('current_event'));
assert.ok(definition.exchangeSystem.activities.includes('code_patch'));
assert.ok(definition.exchangeSystem.activities.includes('trade_proposal'));
assert.ok(definition.exchangeSystem.activities.includes('trade_execution_receipt'));
assert.match(definition.exchangeSystem.financialBoundary, /Live financial orders are never automatic/);
assert.equal(definition.googleCloudSystem.currentTruth, 'PREPARED_NOT_DEPLOYED_NOT_SUBMITTED_NOT_APPROVED');
assert.equal(definition.githubEnterpriseSystem.connectorReadback, 'PERSONAL_INSTALLATION_ONLY_NO_ORGANIZATION_VISIBLE');
assert.ok(definition.protectedHumanOnly.includes('live financial order authorization'));
assert.ok(definition.nonClaims.includes('no automatic live financial trading'));
assert.ok(definition.nonClaims.includes('no physical alternate-universe claim'));

assert.deepEqual(Object.keys(registry.worlds), ['V#', 'T#', 'C#']);
assert.equal(registry.links.every((link) => link.gate === definition.universeSystem.linkGate), true);
assert.equal(enterprise.connectorReadback.state, 'PERSONAL_REPOSITORY_VISIBLE_ORGANIZATION_NOT_YET_VISIBLE');
assert.equal(marketplace.currentTruth.cloudRunService, 'NOT_DEPLOYED');
assert.equal(marketplace.currentTruth.marketplaceApproval, 'NOT_APPROVED');

console.log(JSON.stringify({
  schemaVersion: 'armitron.definition.verification.v25',
  status: 'PASS',
  componentId: definition.componentId,
  worlds: Object.keys(registry.worlds),
  cSharpFenceCount: definition.exchangeSystem.cSharpFences.length,
  activityCount: definition.exchangeSystem.activities.length,
  googleCloudState: definition.googleCloudSystem.currentTruth,
  githubEnterpriseState: definition.githubEnterpriseSystem.currentTruth
}, null, 2));
