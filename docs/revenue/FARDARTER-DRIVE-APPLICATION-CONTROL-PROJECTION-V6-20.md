# Fardarter Drive™ v6.20 — Buyer-Facing Current-Control Source Projection

## State

`SOURCE_MERGED_NOT_DEPLOYED` after reviewed merge.

Fardarter Drive™ v6.20 projects the reviewed v6.19 strategy authority and v6.18 standing operational control into versioned buyer-facing repository source without rewriting the original v6.15 page/API files and without claiming a provider deployment.

## Source model

The stable public paths remain:

```text
/github-control-tower-audit
/api/revenue/pilot
```

A `beforeFiles` internal rewrite maps them to versioned successor source:

```text
/github-control-tower-audit/current
/api/revenue/pilot/current
```

This preserves the exact v6.15 source hashes as historical evidence while allowing the current repository source to present the reviewed v6.19/v6.18 control hierarchy.

The v6.20 API uses schema 1.7.0.

## Current authority hierarchy

```text
Current strategy authority    v6.19 / STRATEGY_RAIL_RECONCILED
Standing operational control  v6.18 / STANDING_CONTROL_HEAD_RECONCILED
Owner routing                 v6.17 / OWNER_ROUTING_RECONCILED
Historical source projection  v6.15 / immutable source hashes
Public offer                  v6.14 / OPEN_FOR_VERIFIED_FIT_CHECKS
Production evidence           v6.12 / DEPLOYED_AND_VERIFIED / RECONCILED
```

Issue #133 remains the exact reviewed public offer and is not rewritten.

Issue #141 remains open as `HISTORICAL_STRATEGY_AND_STAGE_GOVERNANCE_RAIL`. Its original v4 body is preserved as historical evidence and does not override newer reviewed authority.

## Exact source locks

```text
Successor page SHA-256
9ead161311fe67fdd01ccc4a56b40328e56e2c928ad457380b6e089f0a62ab20

Successor API SHA-256
23f00e6d2714257405f193b1c1272070258e2592c9cf1eb141ad0210678742eb

next.config.ts SHA-256
6b52b272308e66ecd7b828db0c80e532d70ed8d6ee38b42b08d3044a467043e5

Manifest digest
e2be32a3bd3531f932acfed100a911b23213b73f78c1a8683d7a4f3df99eb31b
```

The v6.15 source hashes remain historical evidence:

```text
Page  8a0b7d95e87ac30c8e970c6cf74d4760c1c7135beb032d4d0bbc02bd22eccb3b
API   4396640551cf5c6b1227d21f174cda8f890215904bd728884f36daa90870ba9c
```

## Current business and evidence truth

```text
Canonical event/reconcile     1 / 1
SCOPE_DRAFTED                 1
HUMAN_ACCEPTED / ACTIVE       0 / 0
Consent                       NO_PACKAGE / AWAITING_COUNTERPARTY_EVIDENCE
Planning / effective ACTIVE   1,000 / 100
ACTIVE / headroom             0 / 100
Capacity override             INACTIVE_NO_RECEIPT
Orders / gross / settled      0 / $0 / $0
Private continuity            CONNECTED_PRIVATE / 17 / OWNER_ONLY / UNSHARED
```

Routing remains 11 owner routes, eight material notification classes, nine silence/suppression conditions, and one notification maximum per private decision fingerprint.

## Production boundary

Repository application source remains separate from production.

```text
Repository source             SOURCE_MERGED_NOT_DEPLOYED
Production application        DEPLOYED_AND_VERIFIED
Production control            RECONCILED
Deployed application source   88bd8dc89a0bd95f42c7e1a21dccc56fe9dc7334
Verified deploy               6a6ba0366ebec6650d843ac3
Repository/live relationship  CONTROL_AHEAD_OF_DEPLOYED_APPLICATION_SOURCE
```

Provider evidence and mutation remain exclusively owned by `FARDARTER_DRIVE_LIVE_WATCH`.

## Privacy and consequence boundary

No private Google Drive URL or file ID is present in public source. Buyer identity, consent contents, signatures, authentication evidence, provider-private records, banking information, counsel notes, private deliberations, and decision fingerprints remain private.

This reconciliation does not rewrite Issue #133 or Issue #141, deploy, promote, mutate provider state, contact a requester, send email, infer consent, append canonical event 2, create `HUMAN_ACCEPTED`, create an order or contract, confirm payment, recognize revenue or settled cash, start work, use or change ACTIVE capacity, select legal terms, expose private references, or perform an irreversible action.

## Decision

`HOLD_FOR_GENUINE_EXTERNAL_INPUT_OR_SEPARATELY_AUTHORIZED_EXACT_PRODUCTION_PROMOTION`
