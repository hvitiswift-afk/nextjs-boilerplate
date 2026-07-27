# MATADATA Pathfinder — Public Release and License Plan

## Goal

The intended release should let other teams reuse the reliability lessons without exposing personal data, live credentials, private proposal text, or a mechanism for bypassing human verification.

The public-benefit release should be technically useful, easy to cite, and clear about authorship and non-affiliation.

## Proposed release structure

### 1. Generic workflow engine

A provider-neutral engine for:

- explicit human handoffs;
- revision-checked remote interaction;
- fail-closed state transitions;
- exactly-once action locks;
- positive multi-signal confirmation;
- append-only event chains;
- low-bandwidth mobile views;
- primary/fallback connection paths; and
- redacted diagnostics.

### 2. Form adapter interface

A narrow interface for provider-specific field contracts, validation APIs, acknowledgment semantics, and success signals. OpenAI-specific selectors or behaviors should remain in a separate adapter rather than being embedded in the generic engine.

### 3. Regression fixtures

Local fixtures should reproduce the failure classes identified during development:

- complete DOM rerender after partial entry;
- helper text mistaken for a second field;
- field representation changes such as line endings or one terminal formatting code point;
- terms-text-only acknowledgment;
- a visible disabled button while the native form library independently reports valid and submittable state;
- stale screenshots and stale taps;
- link failure and reconnect;
- ambiguous post-action state; and
- duplicate-run prevention.

### 4. Evidence schema

A public schema should preserve:

- source and application hashes;
- field names, lengths, and canonical comparison results;
- trust-boundary snapshots;
- acknowledgment mode and stable-observation count;
- action count;
- confirmation signals;
- event-chain head; and
- redacted network fingerprints.

The schema should not include proposal bodies, personal information, session tokens, cookies, CAPTCHA data, or credentials.

## Security and ethics boundary

The public version must not:

- automate or bypass CAPTCHA or equivalent human-verification systems;
- impersonate a person;
- reuse another person’s authenticated session;
- force-enable a provider’s disabled control;
- override a provider’s validation or consent gate;
- make a second action after an ambiguous first action;
- conceal automation from the responsible operator; or
- claim provider approval or affiliation.

The responsible human must personally complete verification, identity, signature, consent, and acknowledgment steps whenever required.

## Attribution requirements to preserve

Every release should retain:

- `CITATION.cff`;
- `CONTRIBUTORS.md`;
- the authorship statement for Justin Lee Rackham (JP) / MATADATA;
- the AI-assistance disclosure for Radio / ChatGPT;
- the independent-project and no-affiliation disclaimer; and
- links to the relevant immutable release or commit.

## License decision

No broad public license is granted merely by this plan. JP should explicitly select and approve a license before a general release.

### Option A — Apache License 2.0 for code; CC BY 4.0 for documentation

Best when broad commercial and noncommercial reuse is desired and an explicit patent-license framework is acceptable. This is often the strongest public-benefit option for infrastructure software, but JP should review the patent implications before approval.

### Option B — MIT License for code; CC BY 4.0 for documentation

Simpler and shorter. It permits broad reuse but does not contain Apache 2.0’s detailed patent provisions.

### Option C — Dual licensing

A public open-source license for the generic engine, with a separate commercial or negotiated license for selected adapters, hosted services, trademarks, support, or specialized integrations.

### Trademark boundary

A software license should not automatically grant rights to MATADATA™, V#™, Entropy Glove™, or other project names and marks. A separate trademark notice and usage policy should define permitted descriptive references and prohibited branding or endorsement claims.

## Recommended release sequence

1. Remove all tokens, credentials, personal data, and private application text.
2. Extract a provider-neutral engine.
3. Build deterministic local fixtures for every recorded failure class.
4. Add a threat model and security boundary.
5. Select the code, documentation, and trademark terms.
6. Tag an immutable release and publish its checksums.
7. Invite issue reports and narrowly scoped contributions.
8. Maintain a changelog and contributor ledger.

## Continuing improvement roadmap

Near-term work should focus on:

- accessibility testing with screen readers and keyboard-only interaction;
- automated mobile reconnect and tunnel-health simulation;
- a smaller, auditable state machine;
- property-based exactly-once tests;
- deterministic evidence bundles;
- provider-adapter conformance tests;
- reduced retention of screenshots and logs;
- a formal privacy and threat model; and
- a reproducible demonstration that never contacts a live third-party form.

## Acknowledgment request when reused

A downstream project that materially incorporates these patterns should use language substantially similar to:

> This workflow incorporates reliability and safety patterns developed by Justin Lee Rackham (JP) through the independent MATADATA Pathfinder project, with AI-assisted engineering through ChatGPT under JP’s direction.

This request does not create an affiliation, endorsement, payment, partnership, or legal obligation. It makes the desired credit explicit so organizations can acknowledge the work accurately and voluntarily.
