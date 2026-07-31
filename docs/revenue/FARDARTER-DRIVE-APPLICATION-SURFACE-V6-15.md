# Fardarter Drive™ v6.15 — Application Surface Truth Projection

## Purpose

Fardarter Drive™ v6.15 reconciles the repository source for the buyer-facing GitHub Control Tower Audit page and the `/api/revenue/pilot` endpoint with the reviewed public, production, canonical, consent, capacity, money, contact, and private-continuity controls.

This is a repository-source projection. It is not a provider deployment, production promotion, rollback, customer acceptance, consent receipt, order, payment, revenue event, work start, capacity activation, or canonical event.

## Control chain

```text
Repository base at preparation   f461e7dc0724010265bbb439b4cfb857660c095f
Public offer                     v6.14 / b16a39679d1baea0c34b11f1544f0c4fa3aa0702d0187a51b6965853fa93a836
Unified control                  v6.13 / 2f33a58938a480b70ce9ea26e24c74677e6294e93729412e3fb81db006e5e29c
Private continuity               v6.13 / 8680243c828c6503d2aadd76b361cfea41482ec17f8fa29018947abcef3f3ea4
Production reconciliation        v6.12 / 1e8aa2af8bb3af332185b7419c63e2c1ad8c19c866e45b62fe04a2fc969932ee
Application surface              v6.15 / 73ea8a261ade625ef740aa95007a403a55159d864b37c7191f66f50e6528a0de
```

## Surface projection

The page at `/github-control-tower-audit` displays separate truth layers:

- current public offer: `OPEN_FOR_VERIFIED_FIT_CHECKS`;
- repository application source: `6.15.0 / SOURCE_ONLY`;
- verified production: `DEPLOYED_AND_VERIFIED / RECONCILED`;
- canonical state: event/reconciliation `1 / 1`, `SCOPE_DRAFTED=1`, `HUMAN_ACCEPTED=0`, `ACTIVE=0`;
- consent: `NO_PACKAGE / AWAITING_COUNTERPARTY_EVIDENCE`;
- GitHub contact: `GITHUB_ISSUE_AUTHOR / EXACT_GITHUB_ISSUE_THREAD`, one native first response maximum;
- private continuity: `CONNECTED_PRIVATE / 17` known documents;
- capacity/money: 1,000 planning slots, 100 effective ACTIVE ceiling, 0 active, 0 orders, $0 gross, $0 settled.

The page keeps legacy v6 capacity and scale-horizon data for compatibility, but it no longer treats those original receipts as the complete current truth.

## API projection

`/api/revenue/pilot` advances to schema `1.6.0`.

New top-level projections include:

- `applicationSurface`;
- `publicOffer`;
- `production`;
- `canonical`;
- `consent`;
- `contact`;
- `privateContinuity`.

Legacy fields remain available under the existing offer, availability, capacity, authority, execution, Drive, publication, and evidence-boundary structures, with an explicit `legacyCompatibility` object.

The API states:

```text
repository source equals deployed application source  false
source update creates deployment                       false
repository source currently deployed                   false
future promotion requires provider evidence            true
public offer/contact proves consent                     false
```

## Verified production boundary

The separately verified production state remains:

```text
Provider                       NETLIFY
Site                           lichburn-v0-2-8
Deployed application source    88bd8dc89a0bd95f42c7e1a21dccc56fe9dc7334
Deploy ID                      6a6ba0366ebec6650d843ac3
Application state              DEPLOYED_AND_VERIFIED
Control state                  RECONCILED
Route readback                 18/18 PASS
Exact-body matches             18/18
Repository relationship        CONTROL_AHEAD_OF_DEPLOYED_APPLICATION_SOURCE
Source gap                     EXPECTED_CONTROL_ONLY_GAP
```

A later production promotion remains owned by `FARDARTER_DRIVE_LIVE_WATCH` and requires exact target locking, provider deploy evidence, authoritative immutable URL, full route readback, rollback preservation, no private-reference exposure, and separate authorization.

## Privacy

The repository projection may expose public issue numbers, control versions, hashes, production source/deploy identifiers, status classifications, canonical counts, capacity, money, contact model, private-continuity state, and document count.

It must not expose private Google Drive URLs or IDs, buyer identities, consent text, signatures, authentication evidence, provider account secrets, banking data, counsel notes, private deliberations, or the authenticated Gmail address.

## Verification

Run:

```bash
npm run fardarter:application-surface:check
npm run revenue:surface:check
npm run revenue:verify
npm run build
```

The deterministic verifier checks:

- exact manifest digest and const schema;
- page and API SHA-256 locks;
- v6.14/v6.13/v6.12 predecessor links;
- source-versus-production distinctions;
- API schema `1.6.0`;
- legacy compatibility;
- canonical, consent, capacity, and money locks;
- GitHub contact and private-continuity boundaries;
- stale-claim and private-reference rejection;
- read-only CI and package integration;
- zero consequential effects.

## Decision

Before reviewed merge: `READY_FOR_REVIEWED_SOURCE_RECONCILIATION`.

After reviewed merge: `SOURCE_MERGED_NOT_DEPLOYED`.

The next controlled action remains `HOLD_FOR_GENUINE_EXTERNAL_INPUT_OR_SEPARATELY_AUTHORIZED_EXACT_PRODUCTION_PROMOTION`.
