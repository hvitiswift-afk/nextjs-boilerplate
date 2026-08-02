#!/usr/bin/env node

import http from 'node:http';
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { loadRegistry } from '../../tools/armitron/v25/world-registry.mjs';
import {
  createCurrentEventPayload,
  createEnvelope,
  createTradeProposalPayload,
  fenceEnvelope
} from '../../tools/armitron/v25/exchange-engine.mjs';

const DEFAULT_PORT = 8080;
const AGENT_CARD_PATH = new URL('./agent-card.json', import.meta.url);

function sha256(value) {
  return createHash('sha256').update(String(value)).digest('hex');
}

function json(response, status, payload, headers = {}) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...headers
  });
  response.end(JSON.stringify(payload));
}

function allowedOrigins(env = process.env) {
  return new Set(String(env.JP_ARMITRON_A2A_ORIGIN_ALLOWLIST ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean));
}

export function validateA2aOrigin(origin, env = process.env) {
  if (!origin) return true;
  const allowlist = allowedOrigins(env);
  return allowlist.size > 0 && allowlist.has(origin);
}

function bearer(request) {
  const match = String(request.headers.authorization ?? '').match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

export function authorizeA2a(request, env = process.env) {
  const expectedHash = env.JP_ARMITRON_A2A_STATIC_TOKEN_SHA256;
  const issuer = env.JP_ARMITRON_A2A_AUTHORIZATION_ISSUER;
  if (expectedHash) {
    const token = bearer(request);
    if (!token) return { allowed: false, status: 401, reason: 'missing_bearer_token' };
    const actual = Buffer.from(sha256(token), 'hex');
    const expected = Buffer.from(expectedHash, 'hex');
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      return { allowed: false, status: 401, reason: 'invalid_bearer_token' };
    }
    return { allowed: true, mode: 'STATIC_HASH_TEST_OR_PRIVATE_DEPLOYMENT' };
  }
  if (issuer) return { allowed: false, status: 503, reason: 'OIDC_VERIFIER_NOT_CONFIGURED' };
  return { allowed: false, status: 503, reason: 'AUTHORIZATION_ISSUER_NOT_CONFIGURED' };
}

function textParts(message) {
  const parts = message?.parts ?? [];
  return parts.filter((part) => typeof part?.text === 'string').map((part) => part.text);
}

function dataParts(message) {
  const parts = message?.parts ?? [];
  return parts.filter((part) => part?.data && typeof part.data === 'object').map((part) => part.data);
}

export function activityLinkScope(activityType) {
  if (['message', 'reply'].includes(activityType)) return 'message';
  if (['current_event', 'market_observation', 'warning', 'outcome'].includes(activityType)) return 'evidence';
  if (activityType === 'forecast') return 'forecast';
  if (activityType === 'backcast') return 'backcast';
  if (activityType === 'commitment') return 'commitment';
  if (['proposal', 'generic_exchange', 'trade_proposal', 'trade_execution_receipt'].includes(activityType)) return 'proposal';
  if (['code_patch', 'code_commit', 'test_result', 'artifact_transfer'].includes(activityType)) return 'artifact';
  if (activityType === 'control') return 'control';
  if (activityType === 'arrival_receipt') return 'receipt';
  if (activityType === 'closure_receipt') return 'closure';
  throw new Error(`No world-link scope mapping exists for activity type: ${activityType}`);
}

function parseExchangeRequest(params) {
  const message = params?.message ?? params;
  const data = dataParts(message)[0] ?? message?.metadata?.exchange ?? params?.exchange ?? {};
  const text = textParts(message).join('\n').trim();
  const activityType = data.activityType ?? 'message';
  let payload = data.payload ?? { text };
  if (activityType === 'current_event') payload = createCurrentEventPayload(payload);
  if (activityType === 'trade_proposal') payload = createTradeProposalPayload(payload);
  return {
    activityType,
    sourceUniverse: data.sourceUniverse ?? 'V#-ROOT',
    targetUniverse: data.targetUniverse ?? 'C#-ROOT',
    linkActivity: data.linkActivity ?? activityLinkScope(activityType),
    subject: data.subject || text.slice(0, 120) || activityType,
    payload,
    transformPlan: data.transformPlan ?? `Transform ${activityType} into the destination world's declared schema without erasing source identity.`,
    evidenceClass: data.evidenceClass ?? 'USER_REPORTED_OR_LOCAL_OBSERVATION',
    evidence: data.evidence ?? [],
    sourceOccurredAt: data.sourceOccurredAt ?? null,
    observedAt: data.observedAt ?? new Date().toISOString(),
    triggerAt: data.triggerAt ?? null,
    expiresAt: data.expiresAt ?? null,
    idempotencyKey: data.idempotencyKey ?? message?.messageId ?? randomUUID()
  };
}

function taskResponse(id, contextId, envelopeRecord) {
  return {
    jsonrpc: '2.0',
    id,
    result: {
      task: {
        id: envelopeRecord.envelopeId,
        contextId,
        status: {
          state: envelopeRecord.settlementState === 'AUTHORIZED_PRIVATE'
            ? 'TASK_STATE_COMPLETED'
            : envelopeRecord.settlementState === 'HANDOFF_REQUIRED'
              ? 'TASK_STATE_INPUT_REQUIRED'
              : 'TASK_STATE_FAILED',
          timestamp: new Date().toISOString(),
          message: {
            role: 'agent',
            parts: [
              {
                text: `Exchange ${envelopeRecord.envelopeId}: ${envelopeRecord.settlementState}; C# authority=${envelopeRecord.controlDecision.finalAuthority}.`
              },
              {
                data: {
                  envelopeId: envelopeRecord.envelopeId,
                  source: envelopeRecord.source,
                  target: envelopeRecord.target,
                  activityType: envelopeRecord.activityType,
                  settlementState: envelopeRecord.settlementState,
                  controlDecision: envelopeRecord.controlDecision,
                  digest: envelopeRecord.recordDigest
                }
              }
            ]
          }
        },
        artifacts: [
          {
            artifactId: `ART-${envelopeRecord.envelopeId}`,
            name: 'V# T# C# exchange receipt',
            description: 'Digest-chained fenced exchange receipt.',
            parts: [
              {
                data: {
                  envelopeId: envelopeRecord.envelopeId,
                  recordDigest: envelopeRecord.recordDigest,
                  idempotencyKeyHash: envelopeRecord.idempotencyKeyHash,
                  truthBoundary: envelopeRecord.truthBoundary
                }
              }
            ]
          }
        ]
      }
    }
  };
}

export function createA2aServer(env = process.env) {
  return http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
      if (!validateA2aOrigin(request.headers.origin, env)) return json(response, 403, { error: 'invalid_origin' });

      if (url.pathname === '/health') {
        return json(response, 200, {
          service: 'matadata-armitron-vtc-a2a',
          version: '25.0.0',
          deploymentTruth: 'SERVER_RUNNING_DOES_NOT_PROVE_GOOGLE_MARKETPLACE_LISTING',
          authorizationIssuerConfigured: Boolean(env.JP_ARMITRON_A2A_AUTHORIZATION_ISSUER),
          staticHashModeConfigured: Boolean(env.JP_ARMITRON_A2A_STATIC_TOKEN_SHA256)
        });
      }

      if (url.pathname === '/.well-known/agent-card.json') {
        const card = JSON.parse(await readFile(AGENT_CARD_PATH, 'utf8'));
        const publicUrl = env.JP_ARMITRON_A2A_PUBLIC_URL?.replace(/\/$/, '');
        if (publicUrl) {
          card.supportedInterfaces = card.supportedInterfaces.map((item) => ({ ...item, url: `${publicUrl}/a2a` }));
          if (env.JP_ARMITRON_A2A_AUTHORIZATION_ISSUER) {
            card.securitySchemes.jpOidc.openIdConnectSecurityScheme.openIdConnectUrl = `${env.JP_ARMITRON_A2A_AUTHORIZATION_ISSUER.replace(/\/$/, '')}/.well-known/openid-configuration`;
          }
        }
        return json(response, 200, card, { 'content-type': 'application/a2a+json; charset=utf-8' });
      }

      if (url.pathname !== '/a2a') return json(response, 404, { error: 'not_found' });
      if (request.method !== 'POST') {
        response.writeHead(405, { allow: 'POST' });
        response.end();
        return;
      }

      const auth = authorizeA2a(request, env);
      if (!auth.allowed) return json(response, auth.status, { error: auth.reason }, { 'www-authenticate': 'Bearer' });

      const chunks = [];
      for await (const chunk of request) chunks.push(chunk);
      const bytes = Buffer.concat(chunks);
      if (bytes.length > 1_000_000) return json(response, 413, { error: 'request_too_large' });
      const body = JSON.parse(bytes.toString('utf8'));
      if (body.jsonrpc !== '2.0' || !['SendMessage', 'message/send'].includes(body.method)) {
        return json(response, 200, { jsonrpc: '2.0', id: body.id ?? null, error: { code: -32601, message: 'Method not found' } });
      }

      const registry = await loadRegistry(env.JP_ARMITRON_UNIVERSE_REGISTRY ?? undefined);
      const exchangeRequest = parseExchangeRequest(body.params ?? {});
      const envelope = createEnvelope(registry, exchangeRequest);
      const record = await fenceEnvelope(registry, envelope, {
        ledgerPath: env.JP_VTC_EXCHANGE_LEDGER,
        sourceTruth: exchangeRequest.evidenceClass !== 'UNLABELED',
        targetVerified: true,
        minimumPrivateData: true,
        capabilityAvailable: true,
        reversible: exchangeRequest.activityType !== 'trade_execution_receipt',
        humanGate: exchangeRequest.activityType === 'trade_execution_receipt',
        paymentEffect: exchangeRequest.activityType === 'trade_execution_receipt',
        jpTargetSpecificApproval: false,
        readbackAvailable: true,
        providerReadback: false,
        closurePlan: true
      });
      return json(response, 200, taskResponse(body.id, body.params?.message?.contextId ?? randomUUID(), record), {
        'content-type': 'application/a2a+json; charset=utf-8'
      });
    } catch (error) {
      return json(response, 500, { error: 'server_error', message: error.message });
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? DEFAULT_PORT);
  createA2aServer(process.env).listen(port, '0.0.0.0', () => {
    console.log(`MATADATA Armitron A2A listening on 0.0.0.0:${port}`);
  });
}
