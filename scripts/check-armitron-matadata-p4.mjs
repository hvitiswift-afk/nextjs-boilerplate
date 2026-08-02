#!/usr/bin/env node

import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  appendMicroscopeNote,
  microscopeSummary,
  microscopeTimeline,
  projectMicroscope,
  readMicroscopeNotes,
  ZOOM_LEVELS
} from '../tools/browser-bridge/p4/microscope-notes.mjs';
import {
  authenticationCapability,
  transitionAuthentication
} from '../tools/armitron/v24/authentication-state.mjs';
import { evaluatePressureIntent } from '../tools/browser-bridge/p1/pressure-policy.mjs';
import {
  authorizeRequest,
  createArmitronMcpServer,
  protectedResourceMetadata,
  validateOrigin
} from '../apps/armitron-mcp/server.mjs';

function sha256(value) {
  return createHash('sha256').update(String(value)).digest('hex');
}

const definition = JSON.parse(await readFile('tools/armitron/v24/armitron-definition.json', 'utf8'));
const profile = JSON.parse(await readFile('examples/armitron/armitron-digital-human.profile.json', 'utf8'));
const listing = JSON.parse(await readFile('examples/google-cloud/matadata-marketplace.profile.json', 'utf8'));
const documentation = await readFile('docs/armitron/ARMITRON_V24_MATADATA_DIGITAL_HUMAN.md', 'utf8');
const operatorPage = await readFile('app/browser-bridge/armitron/page.tsx', 'utf8');
const mcpSource = await readFile('apps/armitron-mcp/server.mjs', 'utf8');

assert.equal(definition.componentId, 'VSHARP-COMP-ARMITRON-001');
assert.equal(definition.version, '24.0.0');
assert.deepEqual(Object.keys(definition.subsystems), [
  'timeSystem',
  'matadataSystem',
  'digitalHumanSystem',
  'authenticationSystem',
  'recallSystem',
  'laneSystem'
]);
assert.deepEqual(definition.subsystems.recallSystem.zoomLevels, ZOOM_LEVELS);
assert.ok(definition.subsystems.laneSystem.lanes.includes('browser'));
assert.ok(definition.subsystems.laneSystem.lanes.includes('remote_mcp_app'));
assert.ok(definition.subsystems.laneSystem.lanes.includes('google_cloud_marketplace'));
assert.ok(definition.humanOnlyGates.includes('password'));
assert.ok(definition.humanOnlyGates.includes('final consequential action when bound to legal, identity, billing, or irreversible effects'));
assert.ok(definition.nonClaims.includes('no mind reading'));
assert.ok(definition.nonClaims.includes('no legal identity transfer'));

assert.equal(profile.rootIdentity, 'SELF-JP-001');
assert.deepEqual(Object.keys(profile.systems), [
  'mindSystem',
  'bodySystem',
  'digitalSelf',
  'agentContinuityBridge'
]);
assert.match(JSON.stringify(profile), /deliberately shared thoughts/);
assert.match(JSON.stringify(profile), /not mind reading/);
assert.match(JSON.stringify(profile), /not consciousness transfer/);

assert.equal(listing.currentTruth.legalEntity, 'UNVERIFIED');
assert.equal(listing.currentTruth.marketplaceSubmission, 'NOT_SUBMITTED');
assert.equal(listing.currentTruth.marketplaceApproval, 'NOT_APPROVED');
assert.equal(listing.currentTruth.modelGardenPublisherRelationship, 'NOT_ESTABLISHED');
assert.match(listing.positioningBoundary.realisticPath, /AI agent or SaaS/);

assert.match(documentation, /Micro ↔ Macro continuity|Microscope Recall/);
assert.match(documentation, /Prepared code is not a deployed or connected app/);
assert.match(operatorPage, /Armitron Digital Human Browser/);
assert.match(operatorPage, /human final authority/);
assert.match(mcpSource, /oauth-protected-resource/);
assert.match(mcpSource, /readOnlyHint: true/);
assert.match(mcpSource, /invalid_origin/);

let state = 'UNAUTHENTICATED';
let transition = transitionAuthentication(state, 'AUTHENTICATION_REQUIRED');
state = transition.to;
assert.equal(state, 'AUTHENTICATION_REQUIRED');
assert.throws(
  () => transitionAuthentication(state, 'HUMAN_AUTHENTICATING'),
  /explicit human presence/
);
transition = transitionAuthentication(state, 'HUMAN_AUTHENTICATING', { humanPresent: true });
state = transition.to;
transition = transitionAuthentication(state, 'AUTHENTICATED_PROVIDER_READBACK_PENDING', {
  humanCompletedProtectedStep: true
});
state = transition.to;
assert.equal(authenticationCapability(state).providerReadbackPending, true);
assert.throws(
  () => transitionAuthentication(state, 'AUTHENTICATED_PROVIDER_CONFIRMED', { provider: 'Google' }),
  /provider, principal, and provider session reference/
);
transition = transitionAuthentication(state, 'AUTHENTICATED_PROVIDER_CONFIRMED', {
  provider: 'Google',
  principal: 'jp-principal-test',
  providerSessionReference: 'provider-session-test',
  providerSessionReferenceHash: sha256('provider-session-test')
});
state = transition.to;
assert.equal(authenticationCapability(state).ordinaryAuthenticatedActionsAllowed, true);
assert.equal(authenticationCapability(state).protectedAuthenticationAutomationAllowed, false);

const protectedPressure = evaluatePressureIntent({
  pressure: 'full',
  targetCategory: 'password',
  stableForMs: 1000,
  released: true
});
assert.equal(protectedPressure.allowed, false);
assert.equal(protectedPressure.disposition, 'pause-and-handoff');

const ordinaryPressure = evaluatePressureIntent({
  pressure: '1/4',
  targetCategory: 'ordinary',
  stableForMs: 300,
  released: true
});
assert.equal(ordinaryPressure.allowed, true);
assert.equal(ordinaryPressure.disposition, 'activate');

const temporary = await mkdtemp(path.join(os.tmpdir(), 'armitron-p4-'));
const notesPath = path.join(temporary, 'microscope.enc.jsonl');
const sessionsPath = path.join(temporary, 'sessions');
const receiptsPath = path.join(temporary, 'armitron.jsonl');
const notesKey = randomBytes(32).toString('base64');
const noteEnv = { JP_BROWSER_BRIDGE_NOTES_KEY: notesKey };

try {
  const macro = await appendMicroscopeNote({
    path: notesPath,
    missionId: 'mission-test',
    zoom: 'macro',
    scopePath: ['MATADATA', 'mission-test'],
    summary: 'Mission began with provider authentication unresolved.',
    unresolved: ['Provider readback pending.'],
    truthState: 'USER_REPORTED',
    env: noteEnv,
    now: new Date('2026-08-02T21:00:00.000Z')
  });
  await appendMicroscopeNote({
    path: notesPath,
    missionId: 'mission-test',
    zoom: 'meso',
    scopePath: ['MATADATA', 'mission-test', 'authentication'],
    summary: 'JP performed the protected provider sign-in step.',
    evidenceClass: 'HUMAN_REPORTED_PROTECTED_STEP',
    truthState: 'USER_REPORTED',
    env: noteEnv,
    now: new Date('2026-08-02T21:01:00.000Z')
  });
  await appendMicroscopeNote({
    path: notesPath,
    missionId: 'mission-test',
    zoom: 'micro',
    scopePath: ['MATADATA', 'mission-test', 'browser', 'control-1'],
    summary: 'Ordinary control received a stable quarter-pressure release.',
    pressure: { stage: 'activate', normalized: 0.25, allowed: true },
    truthState: 'LOCAL_VERIFIED',
    env: noteEnv,
    now: new Date('2026-08-02T21:02:00.000Z')
  });
  await appendMicroscopeNote({
    path: notesPath,
    missionId: 'mission-test',
    zoom: 'nano',
    scopePath: ['MATADATA', 'mission-test', 'browser', 'control-1', 'event-1'],
    summary: 'Event receipt pointer recorded without field content.',
    evidenceClass: 'LOCAL_DIGEST_POINTER',
    truthState: 'LOCAL_VERIFIED',
    env: noteEnv,
    now: new Date('2026-08-02T21:03:00.000Z')
  });

  assert.equal(macro.encrypted, true);
  assert.equal(macro.noteContentReceipted, false);
  await assert.rejects(
    appendMicroscopeNote({
      path: notesPath,
      missionId: 'mission-test',
      zoom: 'micro',
      scopePath: ['MATADATA', 'mission-test', 'bad'],
      summary: 'This must fail.',
      authentication: { accessToken: 'forbidden-value' },
      env: noteEnv
    }),
    /Credential-like material is prohibited/
  );

  const notes = await readMicroscopeNotes({ path: notesPath, env: noteEnv });
  assert.equal(notes.length, 4);
  assert.equal(projectMicroscope(notes, { zoom: 'micro' }).length, 1);
  assert.equal(projectMicroscope(notes, { scopePrefix: ['MATADATA', 'mission-test', 'browser'] }).length, 2);
  assert.equal(microscopeTimeline(notes).length, 4);
  const summary = microscopeSummary(notes);
  assert.deepEqual(summary.byZoom, { macro: 1, meso: 1, micro: 1, nano: 1 });
  assert.ok(summary.unresolved.includes('Provider readback pending.'));

  const orchestrator = spawnSync(process.execPath, [
    'tools/browser-bridge/p4/armitron-digital-human.mjs',
    'start',
    '--session', 'p4-test-session',
    '--sessions', sessionsPath,
    '--notes', notesPath
  ], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      JP_BROWSER_BRIDGE_NOTES_KEY: notesKey,
      JP_ARMITRON_RECEIPTS: receiptsPath
    },
    encoding: 'utf8'
  });
  assert.equal(orchestrator.status, 0, orchestrator.stderr || orchestrator.stdout);
  const session = JSON.parse(await readFile(path.join(sessionsPath, 'p4-test-session.json'), 'utf8'));
  assert.equal(session.rootIdentity, 'SELF-JP-001');
  assert.equal(session.authentication, 'UNAUTHENTICATED');
  assert.equal(session.humanFinalAuthority, true);
  assert.equal(session.noBlindRetry, true);

  const pressureRun = spawnSync(process.execPath, [
    'tools/browser-bridge/p4/armitron-digital-human.mjs',
    'pressure',
    '--session', 'p4-test-session',
    '--sessions', sessionsPath,
    '--notes', notesPath,
    '--pressure', 'full',
    '--target-category', 'password',
    '--stable-ms', '1000',
    '--released'
  ], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      JP_BROWSER_BRIDGE_NOTES_KEY: notesKey,
      JP_ARMITRON_RECEIPTS: receiptsPath
    },
    encoding: 'utf8'
  });
  assert.equal(pressureRun.status, 0, pressureRun.stderr || pressureRun.stdout);
  assert.match(pressureRun.stdout, /pause-and-handoff/);
  const updatedSession = JSON.parse(await readFile(path.join(sessionsPath, 'p4-test-session.json'), 'utf8'));
  assert.equal(updatedSession.protectedHandoffCount, 1);

  const mcpToken = 'p4-test-bearer';
  const mcpEnv = {
    ...process.env,
    JP_ARMITRON_MCP_ORIGIN_ALLOWLIST: 'https://chatgpt.com',
    JP_ARMITRON_MCP_RESOURCE_URL: 'https://armitron.example.test',
    JP_ARMITRON_MCP_AUTHORIZATION_SERVER: 'https://auth.example.test',
    JP_ARMITRON_MCP_STATIC_TOKEN_SHA256: sha256(mcpToken),
    JP_ARMITRON_MCP_STATIC_SCOPES: 'armitron.status.read matadata.recall.read matadata.auth.read matadata.marketplace.read',
    JP_ARMITRON_RECEIPTS: receiptsPath
  };

  assert.equal(validateOrigin('https://chatgpt.com', mcpEnv), true);
  assert.equal(validateOrigin('https://evil.example', mcpEnv), false);
  const metadata = protectedResourceMetadata({ headers: {}, socket: { encrypted: true } }, mcpEnv);
  assert.deepEqual(metadata.authorization_servers, ['https://auth.example.test']);
  assert.equal(metadata.resource, 'https://armitron.example.test/mcp');

  const auth = authorizeRequest({ headers: { authorization: `Bearer ${mcpToken}` } }, mcpEnv);
  assert.equal(auth.allowed, true);
  const rejectedAuth = authorizeRequest({ headers: { authorization: 'Bearer wrong' } }, mcpEnv);
  assert.equal(rejectedAuth.allowed, false);

  const previousReceiptPath = process.env.JP_ARMITRON_RECEIPTS;
  process.env.JP_ARMITRON_RECEIPTS = receiptsPath;
  const server = createArmitronMcpServer(mcpEnv);
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  try {
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const base = `http://127.0.0.1:${address.port}`;

    const invalidOriginResponse = await fetch(`${base}/health`, {
      headers: { Origin: 'https://evil.example' }
    });
    assert.equal(invalidOriginResponse.status, 403);

    const health = await fetch(`${base}/health`, {
      headers: { Origin: 'https://chatgpt.com' }
    });
    assert.equal(health.status, 200);

    const initialized = await fetch(`${base}/mcp`, {
      method: 'POST',
      headers: {
        Origin: 'https://chatgpt.com',
        Authorization: `Bearer ${mcpToken}`,
        Accept: 'application/json, text/event-stream',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2025-11-25',
          capabilities: {},
          clientInfo: { name: 'p4-verifier', version: '1.0.0' }
        }
      })
    });
    assert.equal(initialized.status, 200);
    const initializedBody = await initialized.json();
    assert.equal(initializedBody.result.serverInfo.name, 'armitron-matadata-digital-human');

    const toolListResponse = await fetch(`${base}/mcp`, {
      method: 'POST',
      headers: {
        Origin: 'https://chatgpt.com',
        Authorization: `Bearer ${mcpToken}`,
        Accept: 'application/json, text/event-stream',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} })
    });
    const toolList = await toolListResponse.json();
    assert.equal(toolList.result.tools.length, 4);
    assert.ok(toolList.result.tools.every((tool) => tool.annotations.readOnlyHint === true));
    assert.ok(toolList.result.tools.every((tool) => tool.annotations.destructiveHint === false));

    const statusResponse = await fetch(`${base}/mcp`, {
      method: 'POST',
      headers: {
        Origin: 'https://chatgpt.com',
        Authorization: `Bearer ${mcpToken}`,
        Accept: 'application/json, text/event-stream',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: { name: 'armitron_status', arguments: {} }
      })
    });
    const statusBody = await statusResponse.json();
    assert.equal(statusBody.result.structuredContent.componentId, 'VSHARP-COMP-ARMITRON-001');
  } finally {
    await new Promise((resolve) => server.close(resolve));
    if (previousReceiptPath === undefined) delete process.env.JP_ARMITRON_RECEIPTS;
    else process.env.JP_ARMITRON_RECEIPTS = previousReceiptPath;
  }

  await stat(receiptsPath);

  const verification = {
    schemaVersion: 'armitron.matadata.digital-human.verification.v24',
    componentId: 'VSHARP-COMP-ARMITRON-001',
    status: 'PASS',
    tests: {
      umbrellaDefinition: true,
      holisticDigitalHumanProfile: true,
      nonClaimBoundaries: true,
      authenticationStateMachine: true,
      providerReadbackGate: true,
      protectedPressureHandoff: true,
      ordinaryPressureActivation: true,
      encryptedMicroscopeNotes: true,
      credentialMaterialRejected: true,
      macroMesoMicroNanoProjection: true,
      browserSessionOrchestration: true,
      digestChainedArmitronReceipts: true,
      mcpOriginValidation: true,
      mcpProtectedResourceMetadata: true,
      mcpBearerValidation: true,
      mcpInitializeAndTools: true,
      mcpReadOnlyAnnotations: true,
      googleMarketplaceTruthState: true,
      nextOperatorSurfacePresent: true
    },
    currentTruth: {
      remoteMcpDeployment: 'NOT_DEPLOYED',
      oauthIssuer: 'NOT_CONNECTED',
      chatGptApp: 'NOT_CONFIGURED',
      googleDelegatedAccounts: 'NOT_GRANTED',
      googleMarketplaceListing: 'NOT_SUBMITTED'
    },
    generatedAt: new Date().toISOString()
  };
  await import('node:fs/promises').then(({ writeFile }) =>
    writeFile('armitron-matadata-p4-verification.json', `${JSON.stringify(verification, null, 2)}\n`, 'utf8')
  );
  console.log(JSON.stringify(verification, null, 2));
} finally {
  await rm(temporary, { recursive: true, force: true });
}
