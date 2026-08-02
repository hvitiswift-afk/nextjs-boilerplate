# Armitron v24 — MATADATA Digital Human Umbrella

## Definition

`VSHARP-COMP-ARMITRON-001` is the umbrella runtime for JP's MATADATA
human-agent system. Armitron no longer refers only to clocks or watch-style
semantics. It coordinates:

- time sources, timer modes, watchdogs, deadlines, cooldowns, lockouts, and
  digest-chained receipts;
- Human ↔ Agent Browser Bridge missions;
- MATADATA pressure intent and protected-step handoffs;
- Digital Human composition: Mind System, Body System, Digital Self, and Agent
  Continuity Bridge;
- authentication, authorization, consent, account, session, expiry, recovery,
  and provider-readback states;
- backward-looking encrypted notes and microscope recall;
- browser, email, GitHub, Calendar, remote MCP app, and Google Marketplace
  readiness lanes.

The root identity is `SELF-JP-001`. JP remains the human final authority.

## Holistic Human System

### Mind System

The Mind System helps with mission framing, context selection, reasoning,
option comparison, risk detection, truth-state separation, and micro-to-macro
synthesis. It is advisory. It does not read unspoken thoughts or independently
consent.

### Body System

The Body System is the visible browser and interaction surface. It may discover
redacted controls, enter reviewed ordinary fields, map MATADATA pressure intent,
and pause for protected human steps. It does not capture a biological body or
perform hidden actions.

### Digital Self

The Digital Self may plan, summarize, route, record, recall, prepare artifacts,
and maintain continuity pointers. It is not a legal identity or independent
person.

### Agent Continuity Bridge

The Agent Bridge connects explicitly authorized context across browser, email,
GitHub, Calendar, and encrypted notes. It detects unresolved gates and duplicate
or contradictory action. It operates only through available tools and approved
scopes.

## Authorized human context

Armitron may use deliberately shared thoughts, declared feelings, reported body
states, accessibility needs, authorized memories, user-selected artifacts, and
provider-visible account or browser state.

It may not claim access to unspoken thoughts, neural signals without an explicit
verified device, unreported biological state, automatic consent, hidden
surveillance, identity overwrite, legal identity transfer, or independent legal
authority.

## Microscope Recall

Armitron Microscope Recall is backward-looking and encrypted.

| Zoom | Purpose |
| --- | --- |
| Macro | Project, mission, outcome, and major unresolved issue |
| Meso | Stage, decision, actor, dependency, risk, and handoff |
| Micro | Browser page, control, ordinary action, pressure state, and validation |
| Nano | Event pointer, timing, digest, redacted evidence reference, and correction link |

Notes are append-only. Corrections reference earlier notes instead of deleting or
rewriting them. Public receipts store hashes, scope keys, and pointers; they do
not store note text.

Credential material is prohibited even inside the encrypted note store. This
includes passwords, passkeys, OAuth tokens, cookies, MFA codes, CAPTCHA answers,
recovery codes, private keys, and payment-card information.

## Authentication

Authentication is represented by an explicit state machine:

```text
UNAUTHENTICATED
→ AUTHENTICATION_REQUIRED
→ HUMAN_AUTHENTICATING
→ AUTHENTICATED_PROVIDER_READBACK_PENDING
→ AUTHENTICATED_PROVIDER_CONFIRMED
```

Failure, expiry, and revocation are separate states. Protected authentication
must be performed by JP. Provider confirmation requires a provider, principal,
and provider session reference. Local intent or user report alone cannot create
a provider-confirmed state.

## Browser P4 operator

```bash
node tools/browser-bridge/p4/armitron-digital-human.mjs start
node tools/browser-bridge/p4/armitron-digital-human.mjs pressure \
  --session SESSION_ID \
  --pressure 1/4 \
  --target-category ordinary \
  --stable-ms 300 \
  --released
node tools/browser-bridge/p4/armitron-digital-human.mjs note \
  --session SESSION_ID \
  --zoom micro \
  --scope MATADATA/MISSION/browser/step \
  --summary "What happened"
node tools/browser-bridge/p4/armitron-digital-human.mjs recall \
  --mission MISSION_ID \
  --format timeline
node tools/browser-bridge/p4/armitron-digital-human.mjs run \
  --session SESSION_ID \
  doctor
```

The notes key remains local in `JP_BROWSER_BRIDGE_NOTES_KEY`.

## Remote ChatGPT-native app path

`apps/armitron-mcp/server.mjs` is a host-neutral Streamable HTTP MCP resource
server. It includes:

- strict Origin allowlisting;
- OAuth protected-resource metadata;
- bearer-token challenges and scope challenges;
- deterministic tool definitions and annotations;
- Armitron receipts for tool calls;
- read tools for Armitron definition, recall readiness, authentication
  readiness, and Google listing readiness.

This code is not yet a connected ChatGPT app. Native use requires:

1. a remote HTTPS deployment;
2. an OAuth 2.1 or OpenID Connect authorization issuer with refresh support;
3. access-token audience validation in the resource server;
4. ChatGPT developer-mode app configuration and tool scan;
5. user authorization and ChatGPT readback;
6. plan/workspace support for the intended read or write actions.

A remote web OAuth flow can work from a phone after deployment. The current
local Desktop App loopback Gmail flow cannot.

Google delegated access remains a separate provider grant. A remote MCP login
does not automatically grant Gmail access.

## Google Cloud listing path

The realistic publication target is a Google Cloud Marketplace AI-agent or
integrated-SaaS listing. This requires partner/vendor onboarding, legal and
contracting authority, a Google Cloud project, Producer Portal, pricing and
technical review, security and privacy readiness, deployment, and provider
approval.

The presence of Claude, Grok, or other third-party models in a Google model or
agent catalog does not create a self-service foundation-model listing route for
MATADATA. MATADATA is currently positioned as an agent/SaaS system, not a
foundation model.

Current listing truth:

```text
Legal entity                 UNVERIFIED
Google Cloud partner         NOT VERIFIED
Marketplace vendor           NOT ONBOARDED
Producer Portal              NOT ACCESSED
Remote product               NOT DEPLOYED
Marketplace submission       NOT SUBMITTED
Marketplace approval         NOT APPROVED
Model Garden publisher       NOT ESTABLISHED
```

## Truth laws

- User report is not provider readback.
- Prepared code is not a deployed or connected app.
- OAuth design is not an OAuth grant.
- Enterprise signup is not organization connector visibility.
- Marketplace readiness is not listing approval.
- Full pressure is ordinary confirmation or protected handoff, never protected
  authorization.
- Digital Human is a symbolic user-controlled software and accessibility layer,
  not mind reading, consciousness transfer, body capture, legal identity
  transfer, automatic consent, or independent personhood.
