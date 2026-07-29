# First $500 Milestone and $1,000 Expansion Board

**Experiment:** `JP-REV-001`  
**Offer:** GitHub Control Tower Audit  
**Test price:** $100 USD  
**First milestone:** five settled orders = $500 USD gross  
**Expanded target:** ten settled orders = $1,000 USD gross  
**Total pilot capacity:** ten audits  
**Maximum active deliveries:** two at one time  
**Active channel:** GitHub inbound Issue `#133`  
**Automated intake:** exact-prefix label and boundary acknowledgement only

## Operating equation

```text
public-safe request → automated acknowledgement → human fit decision
                    → written agreement → provider-confirmed settlement
                    → JP work-start approval → bounded delivery
                    → acceptance → receipt → optional referral request
```

Targets are experiment parameters, not forecasts or guarantees.

## Ten-slot board

Use anonymous lead IDs in public records. Store identities, contact details, payment records, agreements, and private delivery information outside the public repository.

| Slot | Lead ID | Fit state | Agreement state | Money state | Delivery state | Gross USD | Next controlled action |
|---|---|---|---|---|---|---:|---|
| 1 | `LEAD-001` | UNASSESSED | NOT_AGREED | UNKNOWN | NOT_STARTED | 0 | Await public-safe fit check |
| 2 | `LEAD-002` | UNASSESSED | NOT_AGREED | UNKNOWN | NOT_STARTED | 0 | Available |
| 3 | `LEAD-003` | UNASSESSED | NOT_AGREED | UNKNOWN | NOT_STARTED | 0 | Available |
| 4 | `LEAD-004` | UNASSESSED | NOT_AGREED | UNKNOWN | NOT_STARTED | 0 | Available |
| 5 | `LEAD-005` | UNASSESSED | NOT_AGREED | UNKNOWN | NOT_STARTED | 0 | First-milestone wave |
| 6 | `LEAD-006` | UNASSESSED | NOT_AGREED | UNKNOWN | NOT_STARTED | 0 | Expansion wave |
| 7 | `LEAD-007` | UNASSESSED | NOT_AGREED | UNKNOWN | NOT_STARTED | 0 | Expansion wave |
| 8 | `LEAD-008` | UNASSESSED | NOT_AGREED | UNKNOWN | NOT_STARTED | 0 | Expansion wave |
| 9 | `LEAD-009` | UNASSESSED | NOT_AGREED | UNKNOWN | NOT_STARTED | 0 | Expansion wave |
| 10 | `LEAD-010` | UNASSESSED | NOT_AGREED | UNKNOWN | NOT_STARTED | 0 | Expanded target wave |

### Allowed fit states

```text
UNASSESSED → RELEVANT → QUALIFIED → NOT_FIT → DECLINED
```

### Allowed agreement states

```text
NOT_AGREED → QUESTIONS → AGREED → DECLINED → EXPIRED → CANCELLED
```

### Allowed money states

```text
UNKNOWN → PAID_PENDING → PAID_SETTLED → REFUNDED → DISPUTED
```

### Allowed delivery states

```text
NOT_STARTED → ACTIVE → DELIVERED → ACCEPTED → REVISED → CANCELLED
```

Only `PAID_SETTLED` counts toward received cash. Public issues, automated comments, labels, stars, reactions, pledges, invoices, pending transfers, and screenshots do not create orders, reserve slots, or prove settlement.

## Capacity gate

```text
total slots            10
maximum active work     2
public fit checks       do not consume slots
written agreements      may consume a slot only with separate evidence
work start              requires PAID_SETTLED + JP approval
```

When two deliveries are `ACTIVE`, all additional work starts must remain on hold even when total unused slots remain.

## Authority states

| Action | State | Automatic? | Required evidence |
|---|---|---:|---|
| Keep Issue #133 public | AUTHORIZED_ACTIVE | yes | publication receipt |
| Label exact-prefix audit requests | AUTHORIZED_ACTIVE | yes | workflow run |
| Post one bounded acknowledgement | AUTHORIZED_ACTIVE | yes | marker + workflow run |
| Direct email or message | NOT_AUTHORIZED | no | exact recipient/channel approval |
| Accept fit or scope | HUMAN_APPROVAL_REQUIRED | no | JP decision |
| Create an order | HUMAN_APPROVAL_REQUIRED | no | written agreement |
| Count received cash | EXTERNAL_PROVIDER_ONLY | no | provider-confirmed PAID_SETTLED |
| Start delivery | HUMAN_APPROVAL_REQUIRED | no | settlement + JP approval |
| Merge revenue changes | AUTHORIZED_CONDITIONAL | no | current green checks |
| Deploy fixed Netlify site | AUTHORIZED_CONDITIONAL | yes | validation + immutable readback |
| Refund or dispute response | HUMAN_APPROVAL_REQUIRED | no | provider record + JP approval |

Canonical authority receipt:

```text
receipts/revenue/JP-REV-001-AUTHORITY.json
```

## Automated intake behavior

The workflow may run only for issue titles beginning `[Audit request]:`.

Allowed:

- create/reuse `audit-fit-check`, `needs-jp-review`, and `not-an-order` labels;
- apply the labels;
- post one public-safe boundary acknowledgement;
- preserve an idempotency marker.

Not allowed:

- echo requester content;
- approve fit, scope, price, or deadline;
- create an order or reserve capacity;
- request or process payment;
- start delivery;
- post repeated acknowledgements.

## Conversion dashboard

| Metric | Current | First milestone | Expanded target |
|---|---:|---:|---:|
| Public fit-check requests | self-reporting / unavailable | informational | informational |
| Qualified conversations | 0 | evidence only | evidence only |
| Written agreements | 0 | 5 | 10 |
| Paid settled orders | 0 | 5 | 10 |
| Gross revenue | $0 | $500 | $1,000 |
| Fees | $0 | provider-confirmed | provider-confirmed |
| Refunds/disputes | $0 | pause on material event | pause on material event |
| Net cash before taxes | $0 | gross minus fees/refunds | gross minus fees/refunds |
| Active deliveries | 0 | maximum 2 | maximum 2 |
| Accepted deliveries | 0 | record evidence | record evidence |

## Unit economics worksheet

Fill only from actual evidence.

```text
price per audit                         $100
provider fee per audit                  $___
other direct cost per audit             $___
net cash before tax per settled audit   $___
actual delivery hours                   ___
effective cash per delivery hour        $___
refund/dispute reserve                   $___
```

Do not call gross revenue profit. Taxes, labor value, tools, platform fees, refunds, and business expenses may reduce available cash.

## Decision rules

- **Continue:** at least one `PAID_SETTLED` order and delivery remains inside scope and the two-active limit.
- **Pause work starts:** two deliveries are active.
- **Revise proof:** relevant prospects understand the problem but do not trust the result.
- **Revise scope:** prospects request a smaller or more concrete deliverable.
- **Review price:** qualified prospects consistently value the outcome but cannot accept the pilot price; do not infer this from silence.
- **Pause sales:** a material refund, dispute, repeated misunderstanding, or capacity failure occurs.
- **Stop:** work requires unsafe access, unsupported claims, hidden authority, or delivery effort that makes the offer uneconomic.

## Receipt chain

Each slot should preserve references for:

```text
channel authority
automated intake receipt when applicable
human fit decision
written scope and agreement
external provider settlement
JP work-start approval
repository snapshot
report delivery
clarification or revision
acceptance, refund, dispute, or cancellation
referral or testimonial permission
```

## Next controlled action

Merge the ten-slot authority packet only after the current repository-owned checks pass. Then update Issue `#133`, activate exact-prefix acknowledgement, and monitor inbound fit checks without treating them as orders, reservations, or money.
