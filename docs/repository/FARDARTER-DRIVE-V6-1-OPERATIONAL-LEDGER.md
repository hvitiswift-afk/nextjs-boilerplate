# Fardarter Drive™ v6.1 — Operational Capacity Ledger

## Purpose

Fardarter Drive v6.1 turns the 1,000-slot / 100-standard-ACTIVE authority model into a public-safe operational ledger without treating GitHub activity as commercial or financial evidence.

## Canonical baseline

```text
Total planning slots        1,000
Standard ACTIVE ceiling     100
Effective ACTIVE ceiling    100
Above 100 allowed           yes, complete receipted override only
Override state              INACTIVE_NO_RECEIPT
Active deliveries           0
Orders                      0
Verified gross revenue      $0 USD
Verified settled cash       $0 USD
```

## Public dynamic counts

The capacity API may read these public GitHub signals every 15 minutes:

- open `[Audit request]:` issues;
- open issues labeled `fit-approved-for-scope-draft`;
- open issues labeled `fd-active-delivery`;
- open `[FD capacity override]:` issues.

These counts are operational signals only. They do not create orders, reserve capacity, prove private evidence, prove payment, or establish customer counts.

If GitHub search is unavailable or rate-limited, the API returns `UNAVAILABLE` and `null` counts rather than inventing zero.

## Commercial state sequence

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
→ ACCEPTED / CANCELLED / REFUNDED / DISPUTED
```

Only `ACTIVE` uses the effective ACTIVE ceiling. Public requests and fit approval do not use or reserve capacity.

## Capacity arithmetic

```text
slots remaining            = 1,000 − canonical orders
standard active headroom   = 100 − ACTIVE deliveries
effective active headroom  = effective ceiling − ACTIVE deliveries
```

Backpressure activates when `ACTIVE` deliveries equal or exceed the effective ceiling.

## Override request rail

The public request form captures:

- exact requested ceiling from 101 through 1,000;
- exact scope or work class;
- expiration date or required review condition;
- rollback ceiling from 1 through 100;
- public-safe JP authorization or controlling receipt reference;
- explicit privacy and evidence acknowledgements.

Automated triage may return `APPROVED_NOT_ACTIVE`. It cannot produce `CAPACITY_OVERRIDE_ACTIVE`, edit canonical capacity, accept a contract, execute payment, or start work.

Activation requires complete private readiness evidence, JP authorization, canonical merge, and readback.

## Private Google Drive ledger

The private document titled `Fardarter Drive™ v6.1 — Operational Capacity Ledger` stores the evidence-state definitions and private/public boundary. Its URL and file ID remain private from repository source and public issue receipts.

## Evidence boundaries

- Capacity is not demand, customers, orders, revenue, valuation, funding, market size, or guaranteed outcomes.
- A GitHub issue, label, comment, workflow receipt, Drive folder, proposal, agreement draft, invoice, pending transfer, or screenshot does not prove settlement.
- Only provider-confirmed `PAID_SETTLED` evidence counts as received cash.
- An override approval does not activate capacity.
- A Drive file does not create a contract, signature, payment obligation, or paid work start.

## Controlled self-test

After merge, create one public-safe request for a 250-ACTIVE ceiling. The expected state is:

```text
Decision                    APPROVED_NOT_ACTIVE
Requested ceiling           250
Standard ceiling            100
Effective ceiling           100
Orders                      0
Verified gross revenue      $0 USD
Verified settled cash       $0 USD
```

Close the self-test after public receipt, private readiness-draft creation, and confirmation that no canonical capacity changed.
