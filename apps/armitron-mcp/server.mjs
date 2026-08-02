#!/usr/bin/env node

import http from 'node:http';
import { createHash, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { appendReceipt } from '../../tools/armitron/v23/armitron-clock.mjs';

const MCP_PROTOCOL_VERSION = '2025-11-25';
const DEFAULT_PORT = 8787;
const DEFINITION_PATH = path.resolve('tools/armitron/v24/armitron-definition.json');
const LISTING_PATH = path.resolve('examples/google-cloud/matadata-marketplace.profile.json');

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
  return new Set(String(env.JP_ARMITRON_MCP_ORIGIN_ALLOWLIST ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean));
}

export function validateOrigin(origin, env = process.env) {
  if (!origin) return true;
  const allowlist = allowedOrigins(env);
  if (allowlist.size === 0) return false;
  return allowlist.has(origin);
}

function resourceUrl(request, env = process.env) {
  if (env.JP_ARMITRON_MCP_RESOURCE_URL) return env.JP_ARMITRON_MCP_RESOURCE_URL.replace(/\/$/, '');
  const host = request.headers.host ?? `127.0.0.1:${DEFAULT_PORT}`;
  const protocol = request.socket.encrypted ? 'https' : 'http';
  return `${protocol}://${host}`;
}

export function protectedResourceMetadata(request, env = process.env) {
  const resource = resourceUrl(request, env);
  const issuer = env.JP_ARMITRON_MCP_AUTHORIZATION_SERVER ?? null;
  return {
    resource: `${resource}/mcp`,
    authorization_servers: issuer ? [issuer] : [],
    bearer_methods_supported: ['header'],
    scopes_supported: [
      'armitron.status.read',
      'matadata.recall.read',
      'matadata.auth.read',
      'matadata.marketplace.read',
      'matadata.notes.write'
    ],
    resource_name: 'Armitron MATADATA Digital Human MCP',
    documentation: `${resource}/docs/armitron`
  };
}

function bearerToken(request) {
  const header = request.headers.authorization ?? '';
  const match = String(header).match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

export function authorizeRequest(request, env = process.env) {
  const expectedHash = env.JP_ARMITRON_MCP_STATIC_TOKEN_SHA256 ?? null;
  const issuer = env.JP_ARMITRON_MCP_AUTHORIZATION_SERVER ?? null;
  const token = bearerToken(request);

  if (expectedHash) {
    if (!token) return { allowed: false, status: 401, reason: 'missing_bearer_token' };
    const actual = Buffer.from(sha256(token), 'hex');
    const expected = Buffer.from(expectedHash, 'hex');
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      return { allowed: false, status: 401, reason: 'invalid_bearer_token' };
    }
    return {
      allowed: true,
      mode: 'STATIC_HASH_TEST_OR_PRIVATE_DEPLOYMENT',
      scopes: new Set(String(env.JP_ARMITRON_MCP_STATIC_SCOPES ?? 'armitron.status.read matadata.recall.read matadata.auth.read matadata.marketplace.read')
        .split(/\s+/)
        .filter(Boolean))
    };
  }

  if (issuer) {
    return {
      allowed: false,
      status: 503,
      reason: 'OIDC_VERIFIER_NOT_CONFIGURED',
      issuer
    };
  }

  return {
    allowed: false,
    status: 503,
    reason: 'AUTHORIZATION_SERVER_NOT_CONFIGURED'
  };
}

const TOOLS = Object.freeze([
  {
    name: 'armitron_status',
    description: 'Read the current Armitron v24 umbrella definition and truth boundaries.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: {
      title: 'Armitron status',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    },
    requiredScope: 'armitron.status.read'
  },
  {
    name: 'matadata_recall_readiness',
    description: 'Report microscope recall capabilities and encrypted-note readiness without returning note content.',
    inputSchema: {
      type: 'object',
      properties: {
        zoom: { type: 'string', enum: ['macro', 'meso', 'micro', 'nano'] }
      },
      additionalProperties: false
    },
    annotations: {
      title: 'MATADATA recall readiness',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    },
    requiredScope: 'matadata.recall.read'
  },
  {
    name: 'matadata_authentication_readiness',
    description: 'Report native app authentication, Google delegation, deployment, and provider-readback readiness.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: {
      title: 'MATADATA authentication readiness',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    },
    requiredScope: 'matadata.auth.read'
  },
  {
    name: 'matadata_google_listing_readiness',
    description: 'Read the MATADATA Google Cloud Marketplace readiness profile and distinguish it from Model Garden publication.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: {
      title: 'MATADATA Google listing readiness',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    },
    requiredScope: 'matadata.marketplace.read'
  }
]);

function toolByName(name) {
  return TOOLS.find((tool) => tool.name === name) ?? null;
}

function rpcResult(id, result) {
  return { jsonrpc: '2.0', id, result };
}

function rpcError(id, code, message, data) {
  return { jsonrpc: '2.0', id: id ?? null, error: { code, message, ...(data ? { data } : {}) } };
}

function textContent(value) {
  return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }], structuredContent: value };
}

async function callTool(name, args, auth, env = process.env) {
  const tool = toolByName(name);
  if (!tool) return { error: `Unknown tool: ${name}` };
  if (!auth.scopes.has(tool.requiredScope)) {
    return {
      insufficientScope: true,
      requiredScope: tool.requiredScope
    };
  }

  if (name === 'armitron_status') {
    const definition = JSON.parse(await readFile(DEFINITION_PATH, 'utf8'));
    return textContent({
      componentId: definition.componentId,
      version: definition.version,
      definition: definition.definition,
      subsystems: Object.keys(definition.subsystems),
      humanOnlyGates: definition.humanOnlyGates,
      nonClaims: definition.nonClaims,
      truthLaw: definition.truthLaw
    });
  }

  if (name === 'matadata_recall_readiness') {
    return textContent({
      state: env.JP_BROWSER_BRIDGE_NOTES_KEY ? 'ENCRYPTED_KEY_PRESENT' : 'ENCRYPTED_KEY_NOT_PRESENT',
      zoomRequested: args?.zoom ?? null,
      zoomLevels: ['macro', 'meso', 'micro', 'nano'],
      noteDirection: 'backward-looking',
      appendOnly: true,
      noteContentInPublicReceipts: false,
      credentialMaterialAllowedInNotes: false
    });
  }

  if (name === 'matadata_authentication_readiness') {
    return textContent({
      remoteMcpApp: 'CODE_PRESENT_NOT_DEPLOYED',
      protectedResourceMetadata: 'IMPLEMENTED',
      authorizationServerConfigured: Boolean(env.JP_ARMITRON_MCP_AUTHORIZATION_SERVER),
      oidcVerifierConfigured: false,
      staticHashModeConfigured: Boolean(env.JP_ARMITRON_MCP_STATIC_TOKEN_SHA256),
      googleOAuthClientConfigured: Boolean(env.JP_GOOGLE_OAUTH_CLIENT_ID),
      googleDelegatedAccounts: 'NOT_READABLE_FROM_REMOTE_MCP_WITHOUT_PROVIDER_TOKEN_STORE',
      chatGptAppConfigured: false,
      nativePhoneOAuthPossibleAfterRemoteDeployment: true,
      currentTruth: 'PREPARED_NOT_CONNECTED'
    });
  }

  if (name === 'matadata_google_listing_readiness') {
    let profile;
    try {
      profile = JSON.parse(await readFile(LISTING_PATH, 'utf8'));
    } catch {
      profile = { state: 'PROFILE_NOT_YET_CREATED' };
    }
    return textContent(profile);
  }

  return { error: 'Tool implementation missing.' };
}

async function handleRpc(request, response, auth, body) {
  if (!body || body.jsonrpc !== '2.0' || typeof body.method !== 'string') {
    return json(response, 400, rpcError(body?.id, -32600, 'Invalid Request'));
  }

  if (body.method === 'initialize') {
    return json(response, 200, rpcResult(body.id, {
      protocolVersion: MCP_PROTOCOL_VERSION,
      capabilities: { tools: { listChanged: false } },
      serverInfo: {
        name: 'armitron-matadata-digital-human',
        version: '24.0.0',
        description: 'Armitron umbrella runtime for MATADATA Digital Human browser, recall, authentication, and listing readiness.'
      },
      instructions: 'Use read tools to inspect verified readiness. Protected human actions and provider authentication remain external gates.'
    }));
  }

  if (body.method === 'notifications/initialized') {
    response.writeHead(202, { 'cache-control': 'no-store' });
    response.end();
    return;
  }

  if (body.method === 'ping') return json(response, 200, rpcResult(body.id, {}));

  if (body.method === 'tools/list') {
    return json(response, 200, rpcResult(body.id, {
      tools: TOOLS.map(({ requiredScope, ...tool }) => tool)
    }));
  }

  if (body.method === 'tools/call') {
    const name = body.params?.name;
    const args = body.params?.arguments ?? {};
    const called = await callTool(name, args, auth);
    if (called.insufficientScope) {
      const base = resourceUrl(request);
      return json(response, 403, rpcError(body.id, -32003, 'Insufficient scope', called), {
        'www-authenticate': `Bearer error="insufficient_scope", scope="${called.requiredScope}", resource_metadata="${base}/.well-known/oauth-protected-resource"`
      });
    }
    if (called.error) return json(response, 200, rpcResult(body.id, { isError: true, content: [{ type: 'text', text: called.error }] }));
    await appendReceipt({
      lane: 'remote_mcp_app',
      action: `MCP_TOOL_${String(name).toUpperCase()}`,
      status: 'READ_COMPLETED',
      details: { tool: name, argumentKeys: Object.keys(args), noteContentReturned: false }
    });
    return json(response, 200, rpcResult(body.id, called));
  }

  return json(response, 200, rpcError(body.id, -32601, 'Method not found'));
}

export function createArmitronMcpServer(env = process.env) {
  return http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);

      if (!validateOrigin(request.headers.origin, env)) {
        return json(response, 403, { error: 'invalid_origin' });
      }

      if (url.pathname === '/health') {
        return json(response, 200, {
          service: 'armitron-matadata-digital-human',
          version: '24.0.0',
          authorizationServerConfigured: Boolean(env.JP_ARMITRON_MCP_AUTHORIZATION_SERVER),
          staticHashModeConfigured: Boolean(env.JP_ARMITRON_MCP_STATIC_TOKEN_SHA256),
          deploymentTruth: 'SERVER_RUNNING_DOES_NOT_PROVE_CHATGPT_APP_CONNECTION'
        });
      }

      if (url.pathname === '/.well-known/oauth-protected-resource' || url.pathname === '/.well-known/oauth-protected-resource/mcp') {
        return json(response, 200, protectedResourceMetadata(request, env));
      }

      if (url.pathname !== '/mcp') return json(response, 404, { error: 'not_found' });

      if (request.method === 'GET') {
        response.writeHead(200, {
          'content-type': 'text/event-stream; charset=utf-8',
          'cache-control': 'no-cache, no-store',
          connection: 'keep-alive'
        });
        response.write(': armitron-mcp-ready\n\n');
        response.end();
        return;
      }

      if (request.method !== 'POST') {
        response.writeHead(405, { allow: 'GET, POST' });
        response.end();
        return;
      }

      const auth = authorizeRequest(request, env);
      if (!auth.allowed) {
        const base = resourceUrl(request, env);
        return json(response, auth.status, { error: auth.reason }, {
          'www-authenticate': `Bearer resource_metadata="${base}/.well-known/oauth-protected-resource"`
        });
      }

      const chunks = [];
      for await (const chunk of request) chunks.push(chunk);
      if (Buffer.concat(chunks).length > 1_000_000) return json(response, 413, { error: 'request_too_large' });
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      return handleRpc(request, response, auth, body);
    } catch (error) {
      return json(response, 500, { error: 'server_error', message: error.message });
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? DEFAULT_PORT);
  const server = createArmitronMcpServer(process.env);
  server.listen(port, '127.0.0.1', () => {
    console.log(`Armitron MCP listening on http://127.0.0.1:${port}`);
  });
}
