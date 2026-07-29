# First $500 Execution Board

**Experiment:** `JP-REV-001`  
**Offer:** GitHub Control Tower Audit  
**Test price:** $100 USD  
**Target:** five settled pilot orders = $500 gross revenue  
**Total pilot capacity:** five audits  
**Maximum active deliveries:** two at one time  
**Status:** prepared; no acquisition channel has been authorized or activated

## Operating equation

```text
relevant exposure → qualified conversation → exact offer → written agreement
                  → provider-confirmed settlement → bounded delivery
                  → acceptance → receipt → referral request
```

The target is an experiment parameter, not a forecast or earnings guarantee.

## Five-slot board

Use anonymous lead IDs in public records. Store identities, contact details, payment records, and private delivery information outside the public repository.

| Slot | Lead ID | Fit state | Offer state | Money state | Delivery state | Gross USD | Next controlled action |
|---|---|---|---|---|---|---:|---|
| 1 | `LEAD-001` | UNASSESSED | NOT_SENT | UNKNOWN | NOT_STARTED | 0 | Select approved channel |
| 2 | `LEAD-002` | UNASSESSED | NOT_SENT | UNKNOWN | NOT_STARTED | 0 | Hold until capacity opens |
| 3 | `LEAD-003` | UNASSESSED | NOT_SENT | UNKNOWN | NOT_STARTED | 0 | Hold until capacity opens |
| 4 | `LEAD-004` | UNASSESSED | NOT_SENT | UNKNOWN | NOT_STARTED | 0 | Hold until capacity opens |
| 5 | `LEAD-005` | UNASSESSED | NOT_SENT | UNKNOWN | NOT_STARTED | 0 | Hold until capacity opens |

### Allowed fit states

```text
UNASSESSED → RELEVANT → QUALIFIED → NOT_FIT → DECLINED
```

### Allowed offer states

```text
NOT_SENT → SENT → QUESTIONS → AGREED → DECLINED → EXPIRED
```

### Allowed money states

```text
UNKNOWN → PAID_PENDING → PAID_SETTLED → REFUNDED → DISPUTED
```

### Allowed delivery states

```text
NOT_STARTED → ACTIVE → DELIVERED → ACCEPTED → REVISED → CANCELLED
```

Only `PAID_SETTLED` counts toward received cash. Do not count stars, reactions, issue comments, pledges, verbal interest, invoices, pending transfers, or screenshots.

## Channel decision gate

Select exactly one primary channel for the first test. Do not activate all channels at once; otherwise conversion evidence becomes ambiguous and delivery demand can exceed capacity.

| Candidate channel | Speed | Trust | Public-data risk | Fees | Prepared asset | Authority required |
|---|---|---|---|---|---|---|
| Existing professional network | high | high | low when handled privately | none | warm message template | explicit outreach approval |
| Relevant direct email | medium | medium | low when recipient is verified | none | direct message template | exact-recipient approval |
| GitHub inbound request | low initially | high proof value | public issue requires strict data boundary | none | audit request issue form | merge and publication approval |
| Professional marketplace | medium | marketplace-dependent | platform-dependent | likely | offer and delivery package | account, listing, and fee approval |
| Public social post | medium | variable | public claims require care | none | public post template | explicit publication approval |

### Recommended first-channel test

Use **one to five relevant people in JP's existing professional network** as the first candidate channel because trust is already present and no marketplace setup is required. This is a recommendation only. No message is authorized or sent by this board.

## Seven-day pilot sequence

### Day 0 — gate

- Review and merge PR `#129` before or with PR `#130`.
- Confirm the $100 USD price, three-business-day delivery window, and two-active-client limit.
- Select one acquisition channel.
- Record explicit publication or outreach authority.

### Day 1 — proof and first offers

- Verify the buyer-facing offer file renders correctly.
- Select no more than five highly relevant prospects.
- Send no more than three exact offers during the first batch.
- Create a receipt for each sent offer without storing personal data publicly.

### Day 2 — qualification

- Answer fit and scope questions.
- Decline work that requires credentials, hidden access, destructive action, unsupported claims, or work outside capacity.
- Confirm repository size and delivery requirements before agreement.

### Day 3 — decision

- If there are no relevant responses, improve the audience or opening sentence before sending more.
- If qualified prospects object to price, identify whether the objection is proof, scope, trust, urgency, or affordability before changing the price.
- Do not discount automatically.

### Days 4–5 — first delivery

- Start no more than two audits after written agreement and provider-confirmed settlement.
- Capture the repository head SHA and scope before analysis.
- Deliver using `templates/github-control-tower-audit.md`.

### Days 6–7 — acceptance and learning

- Record delivery, clarification, acceptance, refund, or dispute state.
- Ask an accepted buyer for one factual testimonial or referral, with permission before publication.
- Compare actual conversion and delivery time with the stop/revise rules.

## Conversion dashboard

| Metric | Current | First decision threshold |
|---|---:|---:|
| Relevant exposures | 0 | 20 |
| Qualified conversations | 0 | at least 1 before 20 exposures |
| Exact offers sent | 0 | maximum 5 before offer revision |
| Written agreements | 0 | review after 5 offers |
| Paid settled orders | 0 | pilot target 5 |
| Gross revenue | $0 | pilot target $500 |
| Fees | $0 | record provider-confirmed amount |
| Refunds and disputes | $0 | pause on first material event |
| Net cash before taxes | $0 | gross minus fees and refunds |
| Delivered | 0 | never exceed two active at once |
| Accepted | 0 | record acceptance evidence |

## Unit economics worksheet

Fill these values only from actual evidence.

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

- **Continue:** at least one paid settled order and delivery remains inside scope and capacity.
- **Revise proof:** relevant prospects understand the problem but do not trust the result.
- **Revise scope:** prospects want a smaller or more concrete deliverable.
- **Review price:** qualified prospects consistently value the outcome but cannot accept the pilot price; do not infer this from silence alone.
- **Hold:** delivery capacity reaches two active audits.
- **Stop:** work creates recurring misunderstanding, refund/dispute risk, unsafe access requests, or delivery time that makes the offer uneconomic.

## Receipt chain

Each slot should preserve references for:

```text
channel authority
exact message or publication version
offer sent
scope agreement
external provider settlement
repository snapshot
report delivery
clarification or revision
acceptance, refund, dispute, or cancellation
referral or testimonial permission
```

## Next controlled action

After the stacked governance and money PRs are ready, choose one acquisition channel and authorize one small first batch. No outreach, publication, contract, invoice, payment, delivery, or testimonial request is authorized by this board alone.
