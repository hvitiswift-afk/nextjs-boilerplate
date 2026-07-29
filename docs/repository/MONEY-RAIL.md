# JP Systems Money Rail v3

**Repository:** `hvitiswift-afk/nextjs-boilerplate`  
**Experiment:** `JP-REV-001`  
**Status:** published through GitHub inbound Issue `#133`  
**Controlling fundraiser issue:** `#100`  
**Authority receipt:** `receipts/revenue/JP-REV-001-AUTHORITY.json`  
**Final authority:** JP (`@hvitiswift-afk`)

## Objective

Turn public project work into ethical, measurable revenue opportunities without confusing publication, automated acknowledgement, attention, pledges, labels, or checkout activity with orders or received money.

```text
useful proof → public-safe request → automated bounded acknowledgement
             → human fit decision → written agreement
             → external-provider PAID_SETTLED receipt
             → JP work-start approval → bounded delivery
             → acceptance → revenue receipt → optional follow-up
```

No earnings result is guaranteed. GitHub does not verify buyers, create contracts, reserve capacity, process payments, deliver services, or confirm settlement.

## Active offer

### GitHub Control Tower Audit

- **Price:** $100 USD.
- **Total capacity:** 10 audits.
- **Maximum active deliveries:** 2.
- **First milestone:** 5 settled audits / $500 USD gross.
- **Expanded target:** 10 settled audits / $1,000 USD gross.
- **Buyer:** individual creators, maintainers, small companies, and project owners with disorganized GitHub repositories.
- **Problem:** unclear priorities, stale pull requests, duplicate issues, weak review gates, confusing checks, and missing durable receipts.
- **Deliverable:** repository/workflow map, five priority findings, PR/issue triage, action sequence, authority boundaries, and dated delivery/acceptance receipt.
- **Exclusions:** credentials, destructive cleanup, automatic merges, settings, production deployment, payment handling, legal/tax advice, penetration testing, or guarantees.

The $500 amount remains the first experiment milestone. The $1,000 amount is the expanded gross target. Neither is a forecast, profit claim, or guarantee.

### Implementation Pack — separate upgrade

- **Proposed test price:** $250 USD.
- **Capacity:** separately scoped; never inferred from audit slots.
- **Deliverable:** audit plus an agreed reviewable branch and draft PR.
- **Boundary:** settings, merge, deployment, credentials, external publication, and account actions require separate authorization.

The audit remains the active primary offer. The implementation pack is not automatically included or accepted.

## Authority rail

### Authorized active

- Public GitHub inbound publication through Issue `#133`.
- Ten total fixed-scope audit slots.
- Exact-prefix intake labels and one idempotent acknowledgement.
- Factual product/API/sitemap/robots publication.

### Authorized conditionally

- Merge only after current repository-owned checks pass and review blockers are absent.
- Deploy only to the confirmed existing Netlify site after validation and immutable readback.

### Human approval required

- Fit acceptance.
- Scope, price, due date, cancellation terms, and delivery destination.
- Order recognition.
- Delivery start.
- Testimonial or referral publication.
- Refund/dispute decisions.

### External provider only

- Payment authorization, execution, settlement, refund execution, and dispute processing.
- Only provider-confirmed `PAID_SETTLED` evidence counts as received cash.

### Not authorized

- Automatic direct email, direct messages, social posts, marketplace targeting, recipient discovery, contract acceptance, order creation, capacity reservation, invoices, payment execution, delivery start, refunds, or dispute responses.

## Automated GitHub intake

Workflow: `.github/workflows/audit-request-intake.yml`

The workflow runs only for issue titles beginning `[Audit request]:` and may:

- create/reuse `audit-fit-check`, `needs-jp-review`, and `not-an-order` labels;
- apply those labels;
- post one public-safe boundary acknowledgement;
- preserve an idempotency marker.

It may not:

- echo requester content;
- approve fit or scope;
- create an order;
- reserve capacity;
- request or process payment;
- start work;
- post duplicate acknowledgements.

## Capacity model

```text
total offered slots        10
maximum active deliveries   2
public requests              informational only
written agreements           separate evidence
orders                       separate accepted-purchase evidence
received cash                PAID_SETTLED only
```

Public requests, stars, reactions, labels, automated comments, pledges, invoices, pending transfers, or screenshots do not reduce the ten-slot count.

When two deliveries are active, additional work starts pause even when unused total slots remain.

## Revenue experiment ledger

Each experiment record must separate:

| Field | Meaning |
|---|---|
| Experiment ID | Stable offer/channel test |
| Price | Stated test price |
| First milestone | Interim evidence goal, not forecast |
| Expanded gross target | Price × quantity target |
| Total capacity | Maximum orders in the pilot |
| Active-delivery cap | Simultaneous work limit |
| Public requests | Fit-check interest; not orders |
| Qualified conversations | Human-reviewed fit evidence |
| Written agreements | Explicit accepted scope and terms |
| Orders | Accepted purchase state with separate evidence |
| Gross revenue | Provider-confirmed settled payments before fees/refunds |
| Fees | Provider-confirmed charges |
| Refunds/disputes | Returned or contested money |
| Net cash | Gross minus confirmed fees/refunds; taxes not assumed |
| Delivery state | Not started, active, delivered, accepted, revised, cancelled |
| Authority state | Active, conditional, human-gated, external-provider-only, or not authorized |
| Next action | Continue, revise, pause, or stop |

## Receipt states

```text
PREPARED       offer and proof exist; not published
PUBLISHED      offer is live with publication receipt
INTEREST       response exists; no agreement, order, or money
AGREED         written scope/price accepted; settlement may be pending
PAID_PENDING   provider shows activity; settlement not confirmed
PAID_SETTLED   provider confirms available settled funds
DELIVERED      bounded artifact sent
ACCEPTED       buyer acceptance or agreed review window completed
REFUNDED       money returned
DISPUTED       payment or delivery contested
CANCELLED      work stopped by agreement
UNKNOWN        evidence is insufficient; do not count it
```

Only `PAID_SETTLED` counts toward received cash.

## Decision rules

- **Continue:** settled order exists and delivery remains inside scope and the two-active limit.
- **Pause work starts:** two deliveries are active.
- **Revise proof:** relevant prospects understand the problem but do not trust the result.
- **Revise scope:** qualified prospects need a smaller or more concrete output.
- **Review price:** qualified prospects consistently value the outcome but cannot accept the price; do not infer this from silence.
- **Pause sales:** a material refund, dispute, repeated misunderstanding, or capacity failure occurs.
- **Decline:** a request requires credentials, impersonation, hidden authority, unsupported claims, or unsafe execution.

## Public claims boundary

Allowed factual statements include:

- a fixed-scope audit is published at $100 USD;
- total capacity is ten and active delivery is capped at two;
- $500 is the first milestone and $1,000 is the expanded gross target;
- public requests are reported separately from orders and money;
- GitHub funding links exist;
- repository verification and authority receipts exist.

Do not claim guaranteed earnings, guaranteed sales, tax deductibility, profit, customer counts, orders, funds received, partnerships, certifications, or deployments without current evidence.

## Verification

```bash
npm run revenue:verify
```

The verifier checks schemas, arithmetic, capacity, authority receipt, automation boundaries, proof paths, publication state, sensitive-data exclusions, product surfaces, and deployment readback contracts. It does not independently verify a buyer, agreement, private provider settlement, tax treatment, legal entity, or completed delivery.

## Next controlled action

Merge the ten-slot authority packet only after the current repository-owned checks pass. Then update Issue `#133`, activate the exact-prefix intake acknowledgement, and monitor public-safe requests without converting them into orders, capacity reservations, or money evidence.
