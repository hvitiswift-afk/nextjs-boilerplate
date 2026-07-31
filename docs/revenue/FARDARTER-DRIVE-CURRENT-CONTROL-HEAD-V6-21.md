# Fardarter Drive™ v6.21 — Current Control Head

## State

`CURRENT_CONTROL_HEAD_RECONCILED` after reviewed merge.

Fardarter Drive™ v6.21 reconciles the top-level Revenue Experiment active identity with the merged v6.20 buyer-facing current-control source. It preserves v6.19 strategy authority, v6.18 standing operational control, v6.17 owner routing, v6.16 aggregate history, the exact v6.14 public offer, and v6.12 production evidence.

## Current head

```text
Current control head          v6.21 / CURRENT_CONTROL_HEAD_RECONCILED
Buyer-facing source control   v6.20 / SOURCE_MERGED_NOT_DEPLOYED
Strategy authority            v6.19 / STRATEGY_RAIL_RECONCILED
Standing operational control  v6.18 / STANDING_CONTROL_HEAD_RECONCILED
Owner routing                 v6.17 / OWNER_ROUTING_RECONCILED
Historical aggregate          v6.16 / RECONCILED_AGGREGATE_HEAD
```

Manifest digest:

```text
55dc7f97ec74aac059d758296870ba8a80297a978d5be7167dc0409dc4cba2b5
```

The top-level Revenue Experiment workflow identifies `Verify Fardarter Drive v6.21 current control head` as the active job. v6.19, v6.18, and v6.16 remain explicit historical compatibility identities and are not rewritten as current.

## v6.20 source lock

```text
Control ID       FARDARTER-DRIVE-APPLICATION-CONTROL-PROJECTION-V6-20
Manifest digest  6e1145e5088761f54f2c1c0d320aa2ba349f91f18b9a0ee6c5c2060f49cbfc16
Page SHA-256     249ba20fffaa208330b416d9a42335508bd393c0d722848a5fc2e66febf76fcc
API SHA-256      23f00e6d2714257405f193b1c1272070258e2592c9cf1eb141ad0210678742eb
Config SHA-256   6b52b272308e66ecd7b828db0c80e532d70ed8d6ee38b42b08d3044a467043e5
API schema       1.7.0
Rewrite mode     NEXT_BEFORE_FILES_INTERNAL_REWRITE
```

The original v6.15 source files and hashes remain immutable historical evidence.

## Public, canonical, capacity, and money truth

```text
Issue #133                   EXACT_CURRENT_OFFER_INTACT
Public offer                 OPEN_FOR_VERIFIED_FIT_CHECKS
Issue #141                   HISTORICAL_STRATEGY_AND_STAGE_GOVERNANCE_RAIL
Canonical event/reconcile    1 / 1
SCOPE_DRAFTED                1
HUMAN_ACCEPTED / ACTIVE      0 / 0
Event 2                      absent
Consent                      NO_PACKAGE / AWAITING_COUNTERPARTY_EVIDENCE
Planning / effective ACTIVE  1,000 / 100
ACTIVE / headroom            0 / 100
Capacity override            INACTIVE_NO_RECEIPT
Orders / gross / settled     0 / $0 / $0
Private continuity           CONNECTED_PRIVATE / 17 / OWNER_ONLY / UNSHARED
```

## Production boundary

```text
Repository source             SOURCE_MERGED_NOT_DEPLOYED
Production application        DEPLOYED_AND_VERIFIED
Production control            RECONCILED
Deployed application source   88bd8dc89a0bd95f42c7e1a21dccc56fe9dc7334
Verified deploy               6a6ba0366ebec6650d843ac3
Repository/live relationship  CONTROL_AHEAD_OF_DEPLOYED_APPLICATION_SOURCE
Source gap                    EXPECTED_CONTROL_ONLY_GAP
```

A PR build, artifact, source validation, or Netlify-named GitHub workflow is not provider evidence. Provider evidence and mutation remain exclusively owned by `FARDARTER_DRIVE_LIVE_WATCH`.

## Privacy and execution boundary

No private Google Drive URL or file ID is present in public source. The private register remains owner-only and unshared.

This current-head reconciliation does not rewrite Issue #133 or Issue #141, deploy, promote, mutate provider state, contact a requester, send email, infer consent, append canonical event 2, create `HUMAN_ACCEPTED`, create an order or contract, confirm payment, recognize revenue or settled cash, start work, use or change ACTIVE capacity, select legal terms, expose private references, or perform an irreversible action.

## Decision

`HOLD_FOR_GENUINE_EXTERNAL_INPUT_OR_SEPARATELY_AUTHORIZED_EXACT_PRODUCTION_PROMOTION`
