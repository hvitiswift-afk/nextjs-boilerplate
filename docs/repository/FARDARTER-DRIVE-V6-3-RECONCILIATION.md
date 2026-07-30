# Fardarter Drive™ v6.3 — Proposal, Reconciliation, and Quarantine

## Purpose

v6.3 adds a noncanonical proposal queue, deterministic reconciliation snapshots, drift detection, and reversible quarantine above the v6.2 append-only event chain.

It does not append a supported business event merely because a public label, comment, proposal, invoice, pending transfer, screenshot, or Drive file exists.

## Canonical baseline

```text
Total planning slots        1,000
Effective ACTIVE ceiling    100
Active headroom             100
Active deliveries           0
Orders                      0
Verified gross revenue      $0 USD
Verified settled cash       $0 USD
Override state              INACTIVE_NO_RECEIPT
Canonical chain             GENESIS_ONLY
Deployment                  UNVERIFIED
```

## Proposal lifecycle

1. `PROPOSED`
2. `READY_FOR_REVIEW`
3. `QUARANTINED`
4. `REJECTED`
5. `CANONICALIZED_BY_REVIEWED_MERGE`

`READY_FOR_REVIEW` proves only structural and evidence consistency. It does not create an order, contract, payment, settlement, paid work start, active-capacity use, delivery, acceptance, refund, or dispute resolution.

## Proposal requirements

Every proposal records:

- a stable idempotency key;
- source entity;
- expected public signal;
- proposed canonical transition;
- current canonical head sequence and digest;
- public-safe evidence references;
- authority gate;
- capacity and financial effects;
- review-by or expiry time;
- SHA-256 proposal digest;
- public-safe and sensitive-data classifications.

## Canonicalization rule

A proposal never becomes canonical automatically.

A reviewed merge must:

1. verify the public signal and private evidence;
2. verify the canonical transition and authority gate;
3. verify settlement and capacity where applicable;
4. construct the append-only event;
5. recompute its SHA-256 digest;
6. link it to the prior event digest;
7. update canonical state counts, capacity, and money effects;
8. generate a new reconciliation snapshot;
9. pass CI and immutable deployment readback.

## Reconciliation snapshot

The v6.3 snapshot binds:

- state-machine source;
- event-chain source and head digest;
- capacity-ledger source;
- proposal-ledger digest;
- canonical state counts;
- public state signals;
- proposal decision counts;
- conflicts and quarantine counts;
- active headroom and backpressure;
- orders, gross revenue, settled cash, and settlement state;
- deployment state;
- private Drive continuity.

Snapshots use SHA-256 over sorted-key UTF-8 JSON and link to the previous snapshot digest.

## Quarantine

Quarantine is reversible, noncommercial, and evidence-preserving.

Quarantine freezes canonical mutation for:

- multiple or unknown state labels;
- invalid, backwards, or skipped-gate transitions;
- duplicate proposal or event keys;
- stale or expired proposals;
- broken event or snapshot chains;
- active-capacity overflow;
- order without human acceptance;
- settlement without provider evidence;
- work start without approval;
- public/private evidence mismatch;
- sensitive public content;
- deployment evidence mismatch.

Quarantine may add public-safe labels and one idempotent receipt and may create a private recovery note. It cannot append a canonical event or create any commercial, financial, legal, or work-start consequence.

## Runtime reconciliation

The scheduled/manual reconciler:

- scans open public issues;
- counts known state signals;
- identifies unknown or multiple state labels;
- evaluates proposal keys, expiry, decisions, transitions, and target-state alignment;
- checks active-signal headroom;
- validates the genesis-only canonical source;
- emits a public-safe artifact with a runtime digest;
- comments on Issue #160 only for a new conflict digest.

The runtime artifact is operational evidence, not canonical source.

## Public surfaces

- `/api/revenue/reconciliation`
- `/github-control-tower-audit/reconciliation`

Both separate public signals, proposals, canonical source, capacity, money, conflicts, deployment, and private continuity.

## Private Google Drive

Private connected records:

- `Fardarter Drive™ v6.3 — Event Proposal and Reconciliation Charter`
- `Fardarter Drive™ v6.3 — Proposal Quarantine and Reconciliation Register`

Public source exposes titles and `CONNECTED_PRIVATE` only.

## Initial digests

```text
Proposal ledger   3c85fe2fc195d5a0c9de45b679f9ef3a5589f36f948ea4a8acc0720483a6dc9e
Snapshot          4035cd406a5db019c4f3b9122e0021b2fb3fcbb23e7e10b040333fdedeb41a22
Canonical head    4c401dd352d4263786ac22072d616f67775761656a771ea8815e4623a7a3975b
```

## Self-test

After merge, propose Issue #159 from `FIT_APPROVED_FOR_SCOPE_DRAFT` to `SCOPE_DRAFTED`.

Expected:

- `READY_FOR_REVIEW`;
- one proposal receipt;
- duplicate approval suppressed;
- no canonical event;
- canonical chain remains genesis-only;
- active deliveries, orders, verified gross revenue, and settled cash remain `0 / 0 / $0 / $0`.
