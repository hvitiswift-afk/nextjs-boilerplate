#!/usr/bin/env node

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  loadRegistry,
  registerUniverse,
  resolveLink,
  resolveUniverse,
  universeId,
  validateRegistry
} from '../tools/armitron/v25/world-registry.mjs';
import {
  ACTIVITY_TYPES,
  CSHARP_FENCES,
  appendArrivalReceipt,
  appendClosureReceipt,
  createCurrentEventPayload,
  createEnvelope,
  createTradeProposalPayload,
  evaluateTenFences,
  fenceEnvelope
} from '../tools/armitron/v25/exchange-engine.mjs';
import {
  activityLinkScope,
  authorizeA2a,
  createA2aServer,
  validateA2aOrigin
} from '../apps/armitron-a2a/server.mjs';

function sha256(value) {
  return createHash('sha256').update(String(value)).digest('hex');
}

const registry = await loadRegistry();
const registryResult = validateRegistry(registry);
assert.equal(registryResult.universeCount, 3);
assert.equal(registryResult.linkCount, 3);
assert.deepEqual(Object.keys(registry.worlds), ['V#', 'T#', 'C#']);
assert.notEqual(registry.worlds['V#'].name, registry.worlds['T#'].name);
assert.notEqual(registry.worlds['T#'].name, registry.worlds['C#'].name);

assert.equal(
  universeId({ world: 'V#', number: 2, name: 'Evidence Exchange', version: 1 }),
  'UNI-V-000002-EVIDENCE-EXCHANGE-V1'
);
assert.throws(() => universeId({ world: 'X#', number: 1, name: 'Bad' }), /Unsupported world/);
assert.throws(() => universeId({ world: 'V#', number: 0, name: 'Bad' }), /1 through 999999/);

const extended = registerUniverse(registry, {
  world: 'V#',
  number: 2,
  name: 'Evidence Exchange',
  aliases: ['V#-EVIDENCE', 'V-000002']
});
assert.equal(extended.universes.length, 4);
assert.equal(resolveUniverse(extended, 'V#-EVIDENCE').number, 2);
assert.throws(
  () => registerUniverse(extended, {
    world: 'T#',
    number: 2,
    name: 'Alias Conflict',
    aliases: ['V#-EVIDENCE']
  }),
  /Duplicate universe alias/
);

assert.equal(resolveUniverse(registry, 'V#-ROOT').world, 'V#');
assert.equal(resolveUniverse(registry, 'T#-ROOT').world, 'T#');
assert.equal(resolveUniverse(registry, 'C#-ROOT').world, 'C#');
assert.equal(resolveLink(registry, 'UNI-V-000001-VALUES-CONTINUITY-ROOT-V1', 'UNI-C-000001-CONTROL-CLOSURE-ROOT-V1', 'message').linkId, 'LINK-VC-000001');

assert.deepEqual(CSHARP_FENCES, [
  'TRUTH_PROVENANCE',
  'IDENTITY_TARGET',
  'PRIVACY_MINIMIZATION',
  'CAPABILITY',
  'REVERSIBILITY',
  'CONSEQUENCE',
  'HUMAN_GATE',
  'DUPLICATE_IDEMPOTENCY',
  'READBACK',
  'CLOSURE'
]);
assert.equal(CSHARP_FENCES.length, 10);

assert.equal(activityLinkScope('message'), 'message');
assert.equal(activityLinkScope('current_event'), 'evidence');
assert.equal(activityLinkScope('code_patch'), 'artifact');
assert.equal(activityLinkScope('trade_proposal'), 'proposal');
assert.equal(activityLinkScope('closure_receipt'), 'closure');
assert.throws(() => activityLinkScope('unknown'), /No world-link scope mapping/);

const currentEvent = createCurrentEventPayload({
  sourceUrl: 'https://example.test/event',
  headline: 'Example event',
  publisher: 'Example Publisher',
  eventOccurredAt: '2026-08-02T20:00:00Z',
  observedAt: '2026-08-02T20:05:00Z',
  factSummary: 'A sourced event was observed.',
  inference: 'No inference required.',
  confidence: 'HIGH'
});
assert.equal(currentEvent.headline, 'Example event');
assert.equal(currentEvent.observedAt, '2026-08-02T20:05:00Z');
assert.throws(() => createCurrentEventPayload({ headline: 'Missing source' }), /requires sourceUrl/);

const tradeProposal = createTradeProposalPayload({
  instrument: 'TEST',
  market: 'SIMULATED',
  thesis: 'Test the proposal rail only.',
  side: 'BUY',
  quantity: 1,
  simulationOnly: true
});
assert.equal(tradeProposal.simulationOnly, true);
assert.equal(tradeProposal.executionAuthority, 'JP_TARGET_SPECIFIC_REQUIRED');

const temporary = await mkdtemp(path.join(os.tmpdir(), 'armitron-vtc-p5-'));
const ledgerPath = path.join(temporary, 'exchange.jsonl');
const receiptsPath = path.join(temporary, 'armitron.jsonl');
const priorReceiptEnv = process.env.JP_ARMITRON_RECEIPTS;
process.env.JP_ARMITRON_RECEIPTS = receiptsPath;

try {
  assert.throws(
    () => createEnvelope(registry, {
      activityType: 'message',
      sourceUniverse: 'V#-ROOT',
      targetUniverse: 'C#-ROOT',
      subject: 'No transform',
      payload: { text: 'blocked' },
      idempotencyKey: 'missing-transform'
    }),
    /explicit transformPlan/
  );

  const messageEnvelope = createEnvelope(registry, {
    activityType: 'message',
    sourceUniverse: 'V#-ROOT',
    targetUniverse: 'C#-ROOT',
    linkActivity: 'message',
    subject: 'Continuity message',
    payload: { text: 'Preserve the source identity and validate the destination.' },
    transformPlan: 'Translate the V# continuity message into a C# control record.',
    evidenceClass: 'LOCAL_VERIFIED',
    idempotencyKey: 'message-once'
  });
  assert.equal(messageEnvelope.source.world, 'V#');
  assert.equal(messageEnvelope.target.world, 'C#');
  assert.equal(messageEnvelope.transferGate, 'V-10_TRANSVERSE_TRANSFER_TRANSFORM');

  const messageRecord = await fenceEnvelope(registry, messageEnvelope, {
    ledgerPath,
    sourceTruth: true,
    targetVerified: true,
    minimumPrivateData: true,
    capabilityAvailable: true,
    reversible: true,
    readbackAvailable: true,
    closurePlan: true
  });
  assert.equal(messageRecord.settlementState, 'AUTHORIZED_PRIVATE');
  assert.equal(messageRecord.controlDecision.overallStatus, 'PASS');
  assert.equal(messageRecord.controlDecision.fenceResults.length, 10);

  const duplicateEnvelope = createEnvelope(registry, {
    activityType: 'message',
    sourceUniverse: 'V#-ROOT',
    targetUniverse: 'C#-ROOT',
    linkActivity: 'message',
    subject: 'Duplicate continuity message',
    payload: { text: 'Must be blocked as duplicate.' },
    transformPlan: 'Translate to C#.',
    evidenceClass: 'LOCAL_VERIFIED',
    idempotencyKey: 'message-once'
  });
  const duplicateRecord = await fenceEnvelope(registry, duplicateEnvelope, { ledgerPath });
  assert.equal(duplicateRecord.settlementState, 'BLOCKED');
  assert.equal(
    duplicateRecord.controlDecision.fenceResults.find((item) => item.fence === 'DUPLICATE_IDEMPOTENCY').status,
    'BLOCK'
  );

  const noClosureEnvelope = createEnvelope(registry, {
    activityType: 'forecast',
    sourceUniverse: 'V#-ROOT',
    targetUniverse: 'T#-ROOT',
    linkActivity: 'forecast',
    subject: 'Scenario forecast',
    payload: { scenario: 'Test only' },
    transformPlan: 'Map V# values to a T# scenario timeline.',
    evidenceClass: 'ASSUMPTION_LABELED',
    idempotencyKey: 'forecast-no-closure'
  });
  const noClosureRecord = await fenceEnvelope(registry, noClosureEnvelope, {
    ledgerPath,
    closurePlan: false,
    readbackAvailable: true
  });
  assert.equal(noClosureRecord.settlementState, 'HANDOFF_REQUIRED');
  assert.equal(noClosureRecord.controlDecision.overallStatus, 'HOLD');
  assert.equal(
    noClosureRecord.controlDecision.fenceResults.find((item) => item.fence === 'CLOSURE').status,
    'HOLD'
  );

  const eventEnvelope = createEnvelope(registry, {
    activityType: 'current_event',
    sourceUniverse: 'V#-ROOT',
    targetUniverse: 'T#-ROOT',
    linkActivity: 'evidence',
    subject: currentEvent.headline,
    payload: currentEvent,
    transformPlan: 'Preserve the source and map occurrence, observation, expiry, and correction timing into T#.',
    evidenceClass: 'SOURCED_CURRENT_EVENT',
    sourceOccurredAt: currentEvent.eventOccurredAt,
    observedAt: currentEvent.observedAt,
    idempotencyKey: 'event-once'
  });
  const eventRecord = await fenceEnvelope(registry, eventEnvelope, { ledgerPath });
  assert.equal(eventRecord.settlementState, 'AUTHORIZED_PRIVATE');
  assert.equal(eventRecord.payload.publisher, 'Example Publisher');

  const codeEnvelope = createEnvelope(registry, {
    activityType: 'code_patch',
    sourceUniverse: 'V#-ROOT',
    targetUniverse: 'C#-ROOT',
    linkActivity: 'artifact',
    subject: 'Tested code patch',
    payload: {
      repository: 'hvitiswift-afk/nextjs-boilerplate',
      branch: 'agent/armitron-vtc-universe-exchange-p5',
      patchHash: sha256('patch'),
      testState: 'PASS'
    },
    transformPlan: 'Convert the V# continuity artifact into a C# validation and closure record.',
    evidenceClass: 'GITHUB_PROVIDER_READBACK',
    idempotencyKey: 'code-once'
  });
  const codeRecord = await fenceEnvelope(registry, codeEnvelope, { ledgerPath });
  assert.equal(codeRecord.settlementState, 'AUTHORIZED_PRIVATE');
  assert.equal(codeRecord.activityType, 'code_patch');

  const tradeProposalEnvelope = createEnvelope(registry, {
    activityType: 'trade_proposal',
    sourceUniverse: 'V#-ROOT',
    targetUniverse: 'C#-ROOT',
    linkActivity: 'proposal',
    subject: 'Simulation-only proposal',
    payload: tradeProposal,
    transformPlan: 'Map the market thesis into a C# risk and approval object without broker submission.',
    evidenceClass: 'SIMULATION_ONLY',
    idempotencyKey: 'trade-proposal-once'
  });
  const tradeProposalRecord = await fenceEnvelope(registry, tradeProposalEnvelope, { ledgerPath });
  assert.equal(tradeProposalRecord.settlementState, 'AUTHORIZED_PRIVATE');
  assert.equal(tradeProposalRecord.payload.simulationOnly, true);

  const blockedExecutionEnvelope = createEnvelope(registry, {
    activityType: 'trade_execution_receipt',
    sourceUniverse: 'V#-ROOT',
    targetUniverse: 'C#-ROOT',
    linkActivity: 'proposal',
    subject: 'Unconfirmed execution attempt',
    payload: {
      instrument: 'TEST',
      side: 'BUY',
      orderType: 'MARKET',
      quantity: 1,
      timeInForce: 'DAY'
    },
    transformPlan: 'Evaluate a purported provider receipt without submitting an order.',
    evidenceClass: 'USER_REPORTED',
    idempotencyKey: 'execution-blocked'
  });
  const blockedExecution = await fenceEnvelope(registry, blockedExecutionEnvelope, {
    ledgerPath,
    jpTargetSpecificApproval: false,
    providerReadback: false
  });
  assert.equal(blockedExecution.settlementState, 'BLOCKED');
  assert.equal(blockedExecution.controlDecision.financialExecutionProtected, true);
  assert.equal(blockedExecution.controlDecision.financialExecutionFieldsComplete, false);

  const completeReceiptDecision = evaluateTenFences({
    activityType: 'trade_execution_receipt',
    targetUniverseId: 'UNI-C-000001-CONTROL-CLOSURE-ROOT-V1',
    payload: {
      brokerProvider: 'TEST_BROKER',
      accountReference: 'ACCOUNT_HASH_REFERENCE',
      instrument: 'TEST',
      side: 'BUY',
      orderType: 'LIMIT',
      quantity: 1,
      timeInForce: 'DAY',
      providerOrderReference: 'ORDER-READBACK-1'
    },
    sourceTruth: true,
    targetVerified: true,
    minimumPrivateData: true,
    capabilityAvailable: true,
    reversible: false,
    externalAction: false,
    paymentEffect: true,
    humanGate: true,
    jpTargetSpecificApproval: true,
    duplicateClear: true,
    idempotencyKeyHash: sha256('confirmed-execution'),
    readbackAvailable: true,
    providerReadback: true,
    closurePlan: true,
    returnRoute: true,
    evidenceClass: 'BROKER_PROVIDER_READBACK'
  });
  assert.equal(completeReceiptDecision.overallStatus, 'PASS');
  assert.equal(completeReceiptDecision.financialExecutionFieldsComplete, true);

  const arrival = await appendArrivalReceipt(messageRecord, {
    destinationAccepted: true,
    providerReadback: true,
    arrivalSummary: 'C# accepted the transformed message and recorded its control state.'
  }, { ledgerPath });
  assert.equal(arrival.settlementState, 'ARRIVED');
  const closure = await appendClosureReceipt(messageRecord, arrival, {
    destinationReadbackConfirmed: true,
    returnRouteRecorded: true
  }, { ledgerPath });
  assert.equal(closure.terminalState, 'CLOSED');
  assert.equal(closure.envelopeId, messageRecord.envelopeId);

  const ledgerRecords = (await readFile(ledgerPath, 'utf8')).trim().split('\n').map(JSON.parse);
  assert.ok(ledgerRecords.length >= 9);
  for (let index = 1; index < ledgerRecords.length; index += 1) {
    assert.equal(ledgerRecords[index].priorDigest, ledgerRecords[index - 1].recordDigest);
  }
  assert.doesNotMatch(await readFile(ledgerPath, 'utf8'), /password|refreshToken|private key/i);

  const a2aToken = 'p5-a2a-test';
  const a2aEnv = {
    ...process.env,
    JP_ARMITRON_A2A_ORIGIN_ALLOWLIST: 'https://chatgpt.com',
    JP_ARMITRON_A2A_PUBLIC_URL: 'https://armitron.example.test',
    JP_ARMITRON_A2A_AUTHORIZATION_ISSUER: 'https://auth.example.test',
    JP_ARMITRON_A2A_STATIC_TOKEN_SHA256: sha256(a2aToken),
    JP_VTC_EXCHANGE_LEDGER: path.join(temporary, 'a2a-ledger.jsonl'),
    JP_ARMITRON_RECEIPTS: receiptsPath
  };
  assert.equal(validateA2aOrigin('https://chatgpt.com', a2aEnv), true);
  assert.equal(validateA2aOrigin('https://evil.example', a2aEnv), false);
  assert.equal(authorizeA2a({ headers: { authorization: `Bearer ${a2aToken}` } }, a2aEnv).allowed, true);
  assert.equal(authorizeA2a({ headers: { authorization: 'Bearer wrong' } }, a2aEnv).allowed, false);

  const server = createA2aServer(a2aEnv);
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  try {
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const base = `http://127.0.0.1:${address.port}`;

    const denied = await fetch(`${base}/health`, { headers: { Origin: 'https://evil.example' } });
    assert.equal(denied.status, 403);

    const cardResponse = await fetch(`${base}/.well-known/agent-card.json`, {
      headers: { Origin: 'https://chatgpt.com' }
    });
    assert.equal(cardResponse.status, 200);
    const card = await cardResponse.json();
    assert.equal(card.version, '25.0.0');
    assert.equal(card.supportedInterfaces[0].protocolVersion, '1.0');
    assert.equal(card.supportedInterfaces[0].url, 'https://armitron.example.test/a2a');
    assert.ok(card.skills.some((skill) => skill.id === 'market-observation-and-proposal'));

    const sendResponse = await fetch(`${base}/a2a`, {
      method: 'POST',
      headers: {
        Origin: 'https://chatgpt.com',
        Authorization: `Bearer ${a2aToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/a2a+json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'SendMessage',
        params: {
          message: {
            messageId: 'a2a-message-once',
            contextId: 'p5-context',
            role: 'user',
            parts: [
              { text: 'Preserve this V# message in C# with closure.' },
              {
                data: {
                  activityType: 'message',
                  sourceUniverse: 'V#-ROOT',
                  targetUniverse: 'C#-ROOT',
                  evidenceClass: 'USER_REPORTED',
                  transformPlan: 'Transform the message into a C# control record.'
                }
              }
            ]
          }
        }
      })
    });
    assert.equal(sendResponse.status, 200);
    const sendBody = await sendResponse.json();
    assert.equal(sendBody.result.task.status.state, 'TASK_STATE_COMPLETED');
    assert.equal(sendBody.result.task.artifacts[0].name, 'V# T# C# exchange receipt');

    const tradeResponse = await fetch(`${base}/a2a`, {
      method: 'POST',
      headers: {
        Origin: 'https://chatgpt.com',
        Authorization: `Bearer ${a2aToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/a2a+json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'message/send',
        params: {
          message: {
            messageId: 'a2a-trade-execution-blocked',
            role: 'user',
            parts: [
              {
                data: {
                  activityType: 'trade_execution_receipt',
                  sourceUniverse: 'V#-ROOT',
                  targetUniverse: 'C#-ROOT',
                  evidenceClass: 'USER_REPORTED',
                  payload: {
                    instrument: 'TEST',
                    side: 'BUY',
                    orderType: 'MARKET',
                    quantity: 1,
                    timeInForce: 'DAY'
                  }
                }
              }
            ]
          }
        }
      })
    });
    const tradeBody = await tradeResponse.json();
    assert.equal(tradeBody.result.task.status.state, 'TASK_STATE_FAILED');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  const dockerfile = await readFile('apps/armitron-a2a/Dockerfile', 'utf8');
  const deployWorkflow = await readFile('.github/workflows/google-cloud-armitron-p5-deploy.yml', 'utf8');
  const enterprise = JSON.parse(await readFile('enterprise/github-enterprise-p5.json', 'utf8'));
  const marketplace = JSON.parse(await readFile('examples/google-cloud/armitron-a2a-marketplace.profile.json', 'utf8'));
  const documentation = await readFile('docs/armitron/ARMITRON_V25_VTC_MULTIVERSE.md', 'utf8');

  assert.match(dockerfile, /USER armitron/);
  assert.match(dockerfile, /0\.0\.0\.0|PORT=8080/);
  assert.match(deployWorkflow, /id-token: write/);
  assert.match(deployWorkflow, /google-github-actions\/auth@v3/);
  assert.match(deployWorkflow, /google-github-actions\/setup-gcloud@v3/);
  assert.match(deployWorkflow, /google-github-actions\/deploy-cloudrun@v3/);
  assert.match(deployWorkflow, /PRODUCTION_AUTH_VERIFIER_READY/);
  assert.match(deployWorkflow, /Static Google credential files are prohibited/);
  assert.equal(enterprise.connectorReadback.state, 'PERSONAL_REPOSITORY_VISIBLE_ORGANIZATION_NOT_YET_VISIBLE');
  assert.equal(enterprise.googleOidcSubjectPolicy.serviceAccountKeysProhibited, true);
  assert.equal(marketplace.currentTruth.cloudRunService, 'NOT_DEPLOYED');
  assert.equal(marketplace.currentTruth.marketplaceSubmission, 'NOT_SUBMITTED');
  assert.equal(marketplace.currentTruth.marketplaceApproval, 'NOT_APPROVED');
  assert.match(marketplace.catalogObservation.openAiManagedPartnerLane, /NOT_LOCATED/);
  assert.match(documentation, /Closure an explicit tenth fence|explicit tenth fence/);
  assert.match(documentation, /does not autonomously submit live financial orders/);

  await stat(receiptsPath);

  const verification = {
    schemaVersion: 'armitron.vtc.multiverse.verification.v25',
    componentId: 'VSHARP-COMP-ARMITRON-001',
    status: 'PASS',
    tests: {
      distinctWorlds: true,
      universeNamingAndNumbering: true,
      uniqueIdsAndAliases: true,
      v10ScopedLinks: true,
      explicitTransformPlan: true,
      tenCSharpFences: true,
      messageExchange: true,
      currentEventEvidence: true,
      forecastClosureHold: true,
      codeArtifactTransfer: true,
      genericMarketProposal: true,
      liveTradeBoundary: true,
      duplicatePrevention: true,
      arrivalAndClosure: true,
      digestChainedLedger: true,
      a2aAgentCard: true,
      a2aMessageExchange: true,
      a2aTradeExecutionBlocked: true,
      cloudRunContainer: true,
      githubGoogleOidcWorkflow: true,
      enterpriseTruthState: true,
      googleMarketplaceTruthState: true
    },
    activityTypes: ACTIVITY_TYPES,
    currentTruth: {
      githubOrganizationVisibility: 'NOT_VISIBLE',
      googleProject: 'NOT_CONFIRMED',
      cloudRunDeployment: 'NOT_DEPLOYED',
      a2aAgentCardGoogleValidation: 'NOT_RUN',
      marketplaceSubmission: 'NOT_SUBMITTED',
      marketplaceApproval: 'NOT_APPROVED',
      liveFinancialTrading: 'NOT_AUTHORIZED_AUTOMATICALLY'
    },
    generatedAt: new Date().toISOString()
  };
  await writeFile('armitron-vtc-p5-verification.json', `${JSON.stringify(verification, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(verification, null, 2));
} finally {
  if (priorReceiptEnv === undefined) delete process.env.JP_ARMITRON_RECEIPTS;
  else process.env.JP_ARMITRON_RECEIPTS = priorReceiptEnv;
  await rm(temporary, { recursive: true, force: true });
}
