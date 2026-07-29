# Revenue Authority and Capacity v3

**Experiment:** `JP-REV-001`  
**Authority receipt:** `receipts/revenue/JP-REV-001-AUTHORITY.json`  
**Authorized by:** JP  
**Authorized at:** 2026-07-29T20:18:00Z  
**Status:** prepared for verified merge

## Capacity decision

The fixed-scope GitHub Control Tower Audit remains priced at **$100 USD**.

```text
first milestone        5 settled audits × $100 = $500 gross
expanded pilot target 10 settled audits × $100 = $1,000 gross
maximum active work    2 deliveries at one time
```

The $500 amount remains the first evidence milestone. The $1,000 amount is the expanded gross target, not an earnings forecast, profit claim, or guarantee.

Public fit checks, issue comments, labels, reactions, stars, pledges, invoices, pending transfers, and screenshots do not consume a slot. A slot is counted as an order only after written agreement and the separately maintained order evidence. Received cash remains zero unless an external provider confirms `PAID_SETTLED`.

## Authority model

### Authorized and active

- Maintain the public GitHub inbound offer through Issue `#133`.
- Expose the controlled audit-request issue form.
- Publish factual price, capacity, public-interest, order, and money states.
- Expand total pilot capacity to ten fixed-scope audits.
- Run the exact-prefix GitHub audit-request intake automation.
- Add bounded labels and one idempotent acknowledgement to matching issues.

### Authorized only when conditions pass

- Merge revenue-governance changes when the current head is unchanged, repository-owned checks pass, and review blockers are absent.
- Deploy to the confirmed Netlify site only after validation, using the fixed existing site ID and immutable route readback.

### Human approval required

- Accepting a buyer or repository as a fit.
- Confirming scope, price, due date, cancellation terms, and delivery destination.
- Starting delivery.
- Publishing a testimonial or identifiable customer reference.
- Issuing or responding to a refund or dispute.

### External provider only

- Payment initiation, authorization, processing, settlement, refund execution, and dispute processing.
- Only provider-confirmed `PAID_SETTLED` evidence counts as received cash.

### Not authorized

- Automated direct email, direct messages, social posting, marketplace prospecting, or recipient targeting.
- Automatic contract acceptance, order creation, capacity reservation, invoice execution, payment execution, delivery start, refund, dispute response, merge, settings change, domain change, billing change, or new-site creation outside the stated conditional rails.

## Automated GitHub intake

Workflow: `.github/workflows/audit-request-intake.yml`

The workflow runs only when an issue title begins exactly:

```text
[Audit request]:
```

It may:

1. create or reuse the bounded labels `audit-fit-check`, `needs-jp-review`, and `not-an-order`;
2. add those labels to the matching issue;
3. post one acknowledgement containing the hidden marker `jp-audit-intake-v1`;
4. explain that the issue is not an order, reservation, contract, invoice, payment receipt, or delivery commitment;
5. direct the requester not to post sensitive information.

It may not:

- repeat the acknowledgement after the marker exists;
- echo requester content;
- approve fit or scope;
- promise a due date;
- request or handle payment;
- count the issue as an order;
- reduce available capacity;
- start work.

## Ten-slot operating board

| Wave | Slots | State | Release rule |
|---|---:|---|---|
| Milestone A | 1–5 | available | Standard fixed-scope gate |
| Expansion B | 6–10 | available | Same gate; never exceed two active deliveries |

The total capacity may be ten while active delivery capacity remains two. New written agreements must pause whenever two deliveries are active unless a future receipt explicitly changes that limit.

## Verification requirements

The revenue verifier must fail unless all of these remain true:

- schema version and authority receipt agree;
- ten total slots and two concurrent deliveries are encoded;
- `10 × $100 USD = $1,000 USD`;
- the first milestone remains `$500 USD`;
- direct outreach remains unauthorized;
- public fit checks do not create orders or reserve capacity;
- GitHub labels and screenshots cannot prove payment;
- the intake automation is exact-prefix, idempotent, and public-safe;
- no sensitive identity, credential, bank, payout, or provider transaction data appears in public evidence.

## Receipt chain

```text
JP authorization
→ authority receipt
→ reviewable branch and PR
→ repository-owned checks
→ merge receipt
→ fixed-site deployment/readback receipt
→ automated inbound acknowledgement receipt
→ human fit and scope decision
→ private external-provider settlement evidence
→ delivery and acceptance receipt
```

## Current evidence

```text
price                    $100 USD
first milestone          $500 USD
expanded gross target    $1,000 USD
total slots              10
maximum active delivery  2
orders                    0
verified gross revenue   $0 USD
verified settled cash    $0 USD
direct outreach          not authorized
```

## Next controlled action

Review and merge this capacity and authority packet only after all repository-owned checks pass. After merge, update Issue `#133`, preserve the first-$500 milestone, activate the exact-prefix intake acknowledgement, and monitor new public-safe fit checks without treating them as orders, reservations, or money.
