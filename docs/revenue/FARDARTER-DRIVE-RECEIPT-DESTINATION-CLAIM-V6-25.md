# Fardarter Drive v6.25 - Canonical Receipt Destination and Atomic Writer Claim

**Control:** `FARDARTER-DRIVE-RECEIPT-DESTINATION-CLAIM-V6-25`  
**Controlling issues:** #235 and #236  
**Manifest digest:** `52b032dcbaee35ef4039a82285cb37b9aaa0abbd8a30f97a555a76372f7d26e6`  
**Prepared against:** `0f2d1d4405ac676374fd8c95823716babca001ac`  
**Post-merge state:** `RECEIPT_DESTINATION_AND_CLAIM_RECONCILED`

## Purpose

v6.24 detects, preserves, and reconciles duplicate completion receipts. v6.25 prevents the known cross-issue race earlier by binding each receipt purpose to one canonical destination and requiring an atomic public writer claim before any GitHub completion comment.

The material receipt key remains unchanged. Issue number, comment ID, document revision, timestamp, run ID, provider-generated metadata, and destination address remain outside material identity.

## Verified incident

The v6.24 public completion key `eee942e246454fc6626f35967fa12dd3a50e34d4502e0811043e0fa08f78cdb2` appeared first on Issue #232 and later on Issue #233. One correction record preserved both comments and classified the later write as `CROSSED_MESSAGE_DUPLICATE_RECEIPT`.

The root cause is:

`PER_DESTINATION_DOUBLE_READ_WITHOUT_CLASS_WIDE_CANONICAL_DESTINATION_AND_ATOMIC_CLAIM`

A per-issue search can be clean on two different issues at the same time. v6.25 adds a class-wide destination registry and an atomic claim.

## Canonical destination registry

```text
Public CONTROL_COMPLETION     controlling issue only
Public DUPLICATE_QUARANTINE   implementation issue only, maximum one
Implementation completion     title/state metadata only
Private CONTROL_COMPLETION    owner-only reconciliation register only
```

For v6.25, Issue #235 is the canonical public completion destination. Issue #236 may receive completion metadata and, only after a proven duplicate count above one, one correction/quarantine record. It must not receive a second completion receipt.

## Public atomic claim

The public claim is a unique Git branch ref:

```text
fd-receipt-claim/{receiptKey}
```

It is created with `GIT_REF_CREATE_ONLY` from the exact merge/readback commit. The first successful create holds the bounded claim. An already-existing branch means `SUPPRESS_PUBLIC_WRITE`.

The claim branch:

- may never be force-updated;
- may never be normally updated;
- may never be automatically deleted;
- applies only to public GitHub receipts;
- may never encode or expose a private receipt key;
- authorizes only the exact receipt key, purpose, and canonical destination;
- creates no control transition, contract, consent, payment, work start, capacity use, deployment, or canonical event.

Test vector:

```text
receipt key   eee942e246454fc6626f35967fa12dd3a50e34d4502e0811043e0fa08f78cdb2
claim branch  fd-receipt-claim/eee942e246454fc6626f35967fa12dd3a50e34d4502e0811043e0fa08f78cdb2
source        0f2d1d4405ac676374fd8c95823716babca001ac
```

## Public protocol

1. Resolve the canonical destination.
2. Search all declared candidate issues for the exact key, control marker, evidence tuple, and correction marker.
3. Fresh-read every candidate issue.
4. Repeat the class-wide search.
5. Create the atomic public claim branch.
6. Fresh-read every candidate issue again.
7. Repeat the class-wide search after claim.
8. Write once to the canonical destination only when the class-wide count is zero.
9. Fresh-read the class after write.
10. Count the exact key and tuple across the class.
11. Complete at one; preserve, stop, and quarantine above one.

A crossed message requires `RESTART_FROM_CLASS_WIDE_SEARCH`. An existing claim or a receipt found after claim suppresses the public write.

## Private protocol

Private receipt keys never become public branch names. The private atomic claim remains the Google Docs `REQUIRED_REVISION_ID` bound to the single completion append in the owner-only register.

A private revision conflict requires `RESTART_FROM_FIRST_PRIVATE_SEARCH`. A stale write may not be retried directly. No separate private claim record is required.

## Preserved truth

```text
Active current control head   v6.21 / CURRENT_CONTROL_HEAD_RECONCILED
Public source projection      v6.22 / PUBLIC_CONTROL_HEAD_SOURCE_RECONCILED
Historical writer retirement  v6.23 / HISTORICAL_PUBLIC_WRITER_RETIRED
Receipt idempotency           v6.24 / CROSS_LAYER_RECEIPT_IDEMPOTENCY_RECONCILED
Application source            v6.20 / SOURCE_MERGED_NOT_DEPLOYED
Issue #133                    EXACT_CURRENT_OFFER_INTACT
Issue #141                    HISTORICAL_STRATEGY_AND_STAGE_GOVERNANCE_RAIL
Issue #160                    HISTORICAL_WORKFLOW_STALE_FALSE_CONFLICT
Canonical event/reconcile     1 / 1
Canonical business events     1
SCOPE_DRAFTED                 1
HUMAN_ACCEPTED / ACTIVE       0 / 0
Consent                       NO_PACKAGE / AWAITING_COUNTERPARTY_EVIDENCE
Capacity                      1,000 / 100 / 0 / 100
Orders / gross / settled      0 / $0 / $0
Production                    DEPLOYED_AND_VERIFIED / RECONCILED
Private continuity            CONNECTED_PRIVATE / 17 / OWNER_ONLY / UNSHARED
```

No private Google Drive URL or file ID is present in this package. No historical record is deleted or rewritten. No deployment, provider mutation, external contact, Gmail send, consent inference, canonical append, order, contract, payment, revenue, work start, capacity activation, legal selection, private-reference exposure, or irreversible action is created.

**Decision:** `HOLD_FOR_GENUINE_EXTERNAL_INPUT_OR_SEPARATELY_AUTHORIZED_EXACT_PRODUCTION_PROMOTION`.
