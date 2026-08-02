# Human ↔ Agent Browser Bridge

Status: `P0_PREPARED_NOT_EXECUTING`

Issue: `#258`

First mission: GitHub Enterprise Cloud signup for the connected GitHub identity `hvitiswift-afk` and the proposed Fardarter Company enterprise.

## Purpose

The Human ↔ Agent Browser Bridge is a resumable browser-work protocol for tasks that need both automation and personal human participation.

It is intended for workflows in which:

- an agent can prepare, navigate, fill, verify, compare, and record ordinary fields;
- a human must retain control of credentials, identity, CAPTCHA, signatures, legal acknowledgments, payments, and other personal attestations;
- a provider can rerender controls, reject values, require a new verification step, or return an ambiguous outcome;
- the final receipt must distinguish preparation from execution and execution from confirmation.

The bridge is not a claim that the current ChatGPT session can control every browser. It is a protocol and implementation surface for browser runtimes that actually support authenticated human handoff.

## Relationship model

```text
HUMAN
  owns identity, credentials, personal attestations, legal acceptance,
  payment decisions, final consequence review, and emergency stop

AGENT
  owns preparation, allowlisted navigation, stable control resolution,
  non-sensitive field entry, rerender recovery, value verification,
  blocker explanation, exactly-once enforcement, and receipts

PROVIDER
  owns authoritative controls, validation, account creation,
  billing state, and positive confirmation evidence

SYSTEM
  owns state sequencing, expiry, logs, privacy boundaries,
  replay prevention, and terminal failure behavior
```

The relationship is cooperative rather than substitutive. The agent does not impersonate the human, and the human does not have to repeat work the agent can safely perform.

## State rail

```text
DRAFT
→ PREPARED
→ BROWSER_OPENING
→ HANDOFF_REQUIRED
→ AUTHENTICATED
→ FILLING
→ FILLED_VERIFIED
→ HUMAN_APPROVAL_REQUIRED
→ SUBMIT_AUTHORIZED
→ SUBMITTING
→ CONFIRMED
```

Safe terminal states:

```text
BLOCKED
OUTCOME_UNKNOWN
CANCELLED
```

The bridge must reject invalid sequencing. In particular:

- `PREPARED` is not account creation.
- `AUTHENTICATED` is not consent to accept terms.
- `FILLED_VERIFIED` is not submission.
- `SUBMITTING` is not confirmation.
- `OUTCOME_UNKNOWN` forbids blind retry.
- `CONFIRMED` requires positive provider evidence.

## Actor handoff

### Agent → human

The agent pauses and presents:

- provider and allowlisted origin;
- mission and exact requested consequence;
- fields already prepared;
- current blocker or verification requirement;
- controls the human must personally complete;
- what the agent will do after control returns;
- a clear cancel path.

### Human → agent

The human returns control only after the browser reflects the completed human-only step. The handoff event must not contain a password, passkey, one-time code, CAPTCHA answer, recovery code, payment-card number, or signature material.

The agent then re-resolves the live controls. It must not depend on stale DOM element identifiers captured before the human step.

## Field contract

Every agent-fillable field needs:

- a stable semantic key;
- a reviewed source;
- an allowlisted provider origin;
- a sensitivity classification;
- a live-control resolution strategy;
- a post-entry readback rule;
- a mismatch behavior;
- a record of whether the value may be committed publicly.

Values must be read back from the live control after entry and again after any provider rerender.

Private runtime values may be referenced by source name, but their actual values must not be committed to this public repository.

## Human-only gates

The P0 protocol always reserves these for the human:

- password;
- passkey;
- two-factor authentication;
- CAPTCHA or human verification;
- account recovery;
- identity attestation;
- legal-terms acceptance;
- signature;
- payment method;
- paid-plan conversion.

A future provider-specific policy may reserve additional controls. It may not silently remove these gates.

## Exactly-once behavior

A consequence-bearing action has one mission identifier and one submission counter.

```text
submitActions = 0 before SUBMITTING
submitActions = 1 when entering SUBMITTING
submitActions > 1 is rejected
```

If the browser or network fails after the create action begins, the mission enters `OUTCOME_UNKNOWN`. The bridge must reconcile through provider readback before allowing another action.

## Confirmation evidence

A successful browser click is not sufficient.

For GitHub Enterprise signup, confirmation should include at least:

1. an authenticated GitHub confirmation or enterprise settings page;
2. the selected enterprise slug visible on GitHub;
3. `hvitiswift-afk` shown as owner or authorized administrator;
4. no evidence of a duplicate create action.

Email may supplement confirmation, but it should not override conflicting authenticated provider state.

## GitHub Enterprise mission

The P0 mission is stored at:

```text
examples/browser-bridge/github-enterprise-signup.mission.json
```

The target is:

```text
https://github.com/account/enterprises/new
```

Allowed origin:

```text
https://github.com
```

Current truth state:

```text
BLOCKED_REQUIRES_SHARED_AUTHENTICATED_BROWSER
```

This is based on current evidence:

- the connected GitHub app can perform supported repository writes;
- it does not expose enterprise-account creation;
- the current isolated Chromium runtime returned `ERR_BLOCKED_BY_ADMINISTRATOR` for the signup URL;
- no organization or enterprise account is currently visible through the connector.

The mission is therefore prepared, not submitted.

## Browser runtime requirements

An execution-capable runtime must provide:

- authenticated human handoff without recording secrets;
- TLS-protected transport;
- access control stronger than an unguessable public URL alone;
- an ephemeral browser profile;
- no password or payment logging;
- no screenshots during credential, CAPTCHA, identity, signature, or payment entry;
- allowlisted navigation and redirect checks;
- fresh control discovery after every navigation or rerender;
- a visible emergency stop;
- bounded session expiry;
- a privacy-reviewed receipt path;
- positive provider readback.

## Remote tunnel boundary

A public remote-desktop tunnel is not automatically safe enough for credentials. P0 does not deploy one.

A future remote browser implementation must use authenticated access, session expiry, secret-redaction controls, and a reviewed threat model before it is used for GitHub login or payment data.

A local browser companion is preferred when available because the human keeps credentials inside a browser profile they control while the agent receives only permitted page state and actions.

## Local companion target

The preferred mature architecture is:

```text
JP browser profile
↕ consent-scoped local companion
Browser Bridge protocol
↕ approved action and observation stream
Agent
↕ receipts and code changes
GitHub
```

The companion should expose semantic browser operations, not raw credential storage:

- open allowlisted URL;
- list visible form controls;
- fill approved non-sensitive value;
- click approved non-legal action;
- pause for human;
- resume after human signal;
- read provider confirmation;
- stop and clear session.

## GitHub relationship

GitHub is both:

- the provider for the first enterprise-signup mission; and
- the durable engineering and receipt layer for the bridge implementation.

The GitHub connector remains useful for code, issues, pull requests, reviews, branches, and supported repository actions. Browser-only account administration remains a separate capability until GitHub exposes an authorized API action or a shared authenticated browser is available.

## P0 files

```text
app/browser-bridge/page.tsx
lib/browser-bridge/protocol.ts
examples/browser-bridge/github-enterprise-signup.mission.json
scripts/check-browser-bridge.mjs
.github/workflows/browser-bridge-verify.yml
```

## Current completion boundary

P0 can establish and verify the mission contract. It cannot honestly claim the GitHub Enterprise signup is completed.

The signup mission advances only when one of these becomes available:

1. a shared browser surface in which JP authenticates and the agent can resume;
2. an approved local browser companion;
3. a GitHub API or connector action that explicitly supports enterprise creation.

Until then, the correct state is blocked with a specific repair path—not simulated completion.
