# Fardarter Drive™ v6.2 — Receipt Mesh and State Controller

## Canonical baseline

```text
Total planning slots        1,000
Standard ACTIVE ceiling     100
Effective ACTIVE ceiling    100
Active headroom             100
Active deliveries           0
Orders                      0
Verified gross revenue      $0 USD
Verified settled cash       $0 USD
Override state              INACTIVE_NO_RECEIPT
Deployment                  UNVERIFIED
```

Capacity is not demand, customers, orders, revenue, valuation, funding, market size, or a guarantee.

## Two ledgers, two meanings

The **public signal ledger** is derived from open GitHub issue labels. It is operational visibility only.

The **canonical event chain** is an append-only source file. A public signal is not a canonical event. A workflow comment is not a canonical event. A Drive document is not a canonical event. A canonical event requires a reviewed merge whose digest and previous-event link pass verification.

## Genesis-only canonical chain

The v6.2 baseline contains one genesis event and zero canonical business events.

```text
Sequence              0
Event                  FARDARTER-STATE-GENESIS-V6-2
Digest algorithm       SHA-256
Canonicalization       JSON_SORTED_KEYS_UTF8
Head digest            4c401dd352d4263786ac22072d616f67775761656a771ea8815e4623a7a3975b
Business events        0
```

## State sequence

```text
REQUESTED
→ FIT_APPROVED_FOR_SCOPE_DRAFT
→ SCOPE_DRAFTED
→ HUMAN_ACCEPTED
→ PAID_PENDING
→ PAID_SETTLED
→ WORK_START_APPROVED
→ ACTIVE
→ DELIVERED
→ ACCEPTED
```

Recovery and consequence states are `CANCELLED`, `REFUNDED`, and `DISPUTED`.

Only `ACTIVE` consumes active-delivery capacity. `HUMAN_ACCEPTED` and later commercial states may count as orders only when supported by their exact canonical receipts.

## Automated public transitions

Only these transitions may update public signal labels automatically:

```text
REQUESTED → FIT_APPROVED_FOR_SCOPE_DRAFT
FIT_APPROVED_FOR_SCOPE_DRAFT → SCOPE_DRAFTED
```

Both are nonbinding and `SIGNAL_ONLY`. Neither creates an order, contract, invoice, payment obligation, received cash, paid work start, or active capacity.

Every identical transition uses a transition-specific idempotency marker. A repeat approval is suppressed before label mutation or receipt creation.

## Consequential gates

- `SCOPE_DRAFTED → HUMAN_ACCEPTED`: identified parties, buyer authority, informed consent, exact terms, and JP approval.
- `HUMAN_ACCEPTED → PAID_PENDING`: external-provider event.
- `PAID_PENDING → PAID_SETTLED`: provider-confirmed settlement.
- `PAID_SETTLED → WORK_START_APPROVED`: locked scope, effective headroom, and JP approval.
- `WORK_START_APPROVED → ACTIVE`: approved start receipt.
- `ACTIVE → DELIVERED`: delivery receipt.
- `DELIVERED → ACCEPTED`: buyer acceptance receipt.
- Refunds and disputes retain human/provider gates.
- Indemnity, liability, governing law, arbitration, insurance, admissions, waivers, and releases retain counsel or human review.

## Conflict handling

These conditions freeze canonical mutation and enter `NEEDS_JP_REVIEW`:

- multiple state labels;
- backwards transition;
- skipped gate;
- duplicate idempotency key;
- broken digest chain;
- ACTIVE capacity overflow;
- order without human acceptance;
- settlement without provider evidence;
- work start without approval;
- public/private evidence mismatch;
- sensitive public content.

The previous canonical digest remains authoritative until a validated recovery event is merged.

## Public operations API

`/api/revenue/operations` exposes:

- state definitions and allowed transitions;
- canonical state counts;
- public signal counts and source availability;
- receipt-chain head and connectivity;
- capacity and money evidence;
- conflict policy;
- private Drive continuity status without private references;
- evidence boundaries.

GitHub read failure returns `UNAVAILABLE` and null public counts rather than fabricated zeros.

## Private Google Drive continuity

The private Fardarter Drive folder contains:

- `Fardarter Drive™ v6.2 — Receipt Mesh and State Transition Charter`;
- `Fardarter Drive™ v6.2 — Transition and Conflict Register`.

Public repository source exposes document titles and `CONNECTED_PRIVATE` status only. Identities, signatures, provider receipts, counsel notes, confidential delivery materials, dispute evidence, conflict evidence, and private Drive references remain private.

## Truth boundary

`PAID_PENDING` is not `PAID_SETTLED`.
A label is not a receipt.
A receipt request is not an accepted receipt.
A public signal is not a canonical event.
A canonical event is not received cash unless its settlement evidence is `PAID_SETTLED`.
The package is evidence- and liability-ready for review, not indemnity-proof.
