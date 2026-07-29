# Fardarter Drive™ v6 — Capacity 1,000 / Standard ACTIVE 100

## Authoritative standard state

```text
Total planning capacity       1,000 slots
Standard ACTIVE ceiling       100
Effective ACTIVE ceiling      100
Above 100 allowed             YES — receipted override only
Override state                INACTIVE_NO_RECEIPT
Current active deliveries     0
Current orders                0
Verified gross revenue        $0 USD
Verified settled cash         $0 USD
Received-cash evidence        PAID_SETTLED
Google Drive continuity       CONNECTED_PRIVATE
```

Capacity is authority to organize a queue. It is not evidence of demand, customers, orders, revenue, valuation, funding, market size, or outcomes.

## Capacity layers

### Total planning capacity

The system may organize up to 1,000 separately scoped slots. A slot is not an order or reservation until the independent commercial evidence states are satisfied.

### Standard ACTIVE ceiling

Up to 100 deliveries may be `ACTIVE` under the standard model. New work starts pause at the effective active ceiling.

### Effective ACTIVE ceiling

The effective ceiling is the actual backpressure threshold. It begins at 100. It may exceed 100 only after a complete capacity-override receipt is approved and a canonical activation change is merged and read back.

## Above 100 is allowed

Above 100 is allowed through the override lifecycle:

```text
PROPOSED
  → READINESS_REVIEW
  → APPROVED_NOT_ACTIVE
  → CANONICAL_ACTIVATION_REVIEW
  → CAPACITY_OVERRIDE_ACTIVE
  → PAUSED / EXPIRED / REVOKED / ROLLED_BACK / CLOSED
```

`APPROVED_NOT_ACTIVE` is not `CAPACITY_OVERRIDE_ACTIVE`.

A complete override identifies:

- exact requested and approved active ceiling;
- scope and work classes;
- effective conditions;
- expiration or review point;
- staffing or automation capacity;
- quality-control and acceptance controls;
- security and privacy readiness;
- insurance, legal, accounting, and tax readiness;
- support and incident readiness;
- backpressure and rollback procedure;
- JP authorization;
- immutable receipt.

The ceiling cannot exceed the 1,000-slot total without a separate total-capacity change. An incomplete, expired, revoked, contradicted, or unsupported override returns to its rollback ceiling.

## Acceptance

A qualifying public-safe request may enter `FIT_APPROVED_FOR_SCOPE_DRAFT`. This is nonbinding and creates no order, reservation, contract, signature, invoice, payment obligation, deadline, waiver, release, indemnity agreement, or paid work start.

## Execution

Issue-triggered approved execution is one-shot. Permitted classes include validation, production builds, receipt generation, non-destructive preparation, private Drive drafting, read-only analysis, capacity-headroom checks, and confirmed-target deployment after validation and immutable readback.

Execution may validate and receipt a proposed override. It may not silently activate one, invent readiness evidence, create a contract, execute payment, start paid work without separate gates, choose legal terms, refund, settle a dispute, admit liability, or change bank, payout, billing, domains, credentials, or access controls.

## Backpressure

When active deliveries reach the effective ceiling:

- new paid work starts pause;
- intake may continue;
- fit review may continue;
- public-safe analysis may continue;
- private proposal, scope, agreement, invoice, delivery, and receipt drafts may continue;
- queued work remains non-active until headroom and all independent work-start gates exist.

## Google Drive continuity

Private Google Drive stores the v6 Capacity and Override Charter, Active Capacity Override Register, work packages, signatures, provider receipts, counsel notes, private readiness evidence, confidential delivery records, and disputes where appropriate.

Public GitHub exposes only safe state, titles, and nonfinancial receipts. No public Drive URL or file ID is required for operation.

## Commercial gates

```text
REQUESTED
FIT_APPROVED_FOR_SCOPE_DRAFT
SCOPE_DRAFTED
HUMAN_ACCEPTED
PAID_PENDING
PAID_SETTLED
WORK_START_APPROVED
ACTIVE
DELIVERED
ACCEPTED / CANCELLED / REFUNDED / DISPUTED
```

Each state requires its own evidence. Capacity does not skip the sequence.

## Legal boundary

Contract acceptance and paid work starts require human approval. Payment remains with the agreed external provider. Indemnity and liability terms require counsel review. Refunds, disputes, admissions, waivers, releases, banking, billing, domains, credentials, access controls, and destructive actions require exact approval and receipts.

Fardarter Drive v6 is evidence- and control-ready. It is not indemnity-proof and does not guarantee revenue or outcomes.

## Scale horizons

```text
FD-001K   $1,000
FD-010K   $10,000
FD-100K   $100,000
FD-001M   $1,000,000
FD-001B   $1,000,000,000
FD-001T   $1,000,000,000,000
FD-001Q   $1,000,000,000,000,000
```

All remain unachieved, nonforecast, and nonguaranteed until independently evidenced.
