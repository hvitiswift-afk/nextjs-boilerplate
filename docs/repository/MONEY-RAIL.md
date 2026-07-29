# JP Systems Money Rail v1

**Repository:** `hvitiswift-afk/nextjs-boilerplate`  
**Status:** prepared for review  
**Controlling fundraiser issue:** `#100`  
**Final approval:** JP (`@hvitiswift-afk`)

## Objective

Turn public project work into ethical, measurable revenue opportunities without confusing repository preparation, attention, pledges, or checkout clicks with earned and received money.

```text
useful proof → clear offer → qualified buyer → explicit agreement
             → payment provider receipt → bounded delivery
             → acceptance → revenue receipt → follow-up
```

No earnings result is guaranteed. GitHub does not process the work itself, verify a buyer, create a contract, deliver a service, or confirm that funds settled.

## Money lanes

### 1. Paid service revenue — first priority

The fastest controlled path is a small fixed-scope service that uses work already demonstrated in this repository.

#### Offer A — GitHub Control Tower Audit

- **Test price:** $100
- **Initial capacity:** 5 buyers
- **Gross target:** $500
- **Buyer:** an individual creator, small company, or project owner with a messy GitHub repository
- **Problem:** unclear priorities, stale pull requests, duplicate issues, weak review gates, and no durable execution receipts
- **Deliverable:**
  - repository and workflow map;
  - top five priority findings;
  - PR/issue triage table;
  - one-page control-tower action plan;
  - safety, authority, and external-action boundaries;
  - dated delivery receipt.
- **Explicit exclusions:** no credential access, production deployment, secret rotation, destructive cleanup, payment handling, legal opinion, security guarantee, or automatic merging.

#### Offer B — GitHub Control Tower Implementation Pack

- **Test price:** $250
- **Initial capacity:** 2 buyers
- **Gross target:** $500
- **Deliverable:** the audit plus a reviewable branch and draft pull request containing agreed templates, repository guidance, and validation files.
- **Execution boundary:** any settings change, merge, deployment, external publication, or account action remains with the buyer unless separately authorized and supported.

Only one offer should be the active primary experiment at a time. Offer A is the lower-friction starting test; Offer B is the upgrade path after a buyer requests implementation.

### 2. Voluntary project support

GitHub's funding configuration may expose the already-published PayPal and campaign links.

- Contributions are voluntary.
- No repayment, equity, ownership, employment, product-delivery, investment-return, or tax-deductibility claim is made.
- Donor identities, payout information, bank data, and payment records must not enter the public repository.
- A visible funding link is not evidence that a contribution occurred.

### 3. Reusable products — later lane

Possible later products include repository templates, verification packs, receipt schemas, and public-safe documentation systems. A product should not be offered for sale until its scope, ownership, license, delivery format, support boundary, refund policy, and buyer-facing description are reviewed.

## First $500 experiment

### Hypothesis

At least one small-project owner will pay for a bounded GitHub cleanup and control-tower deliverable when the offer shows an exact outcome, fixed price, public-safe proof, and no demand for credentials.

### Primary test

```text
5 audits × $100 = $500 gross target
```

This is a target, not a forecast or guarantee.

### Minimum proof package

- PR `#129` as a public example of repository governance work;
- this Money Rail and its machine-checkable sample;
- a redacted sample audit showing the expected structure;
- a one-page description of deliverables and exclusions;
- a delivery receipt template.

### Acquisition sequence

1. Prepare one exact offer page or message.
2. Identify one approved channel and exact intended audience.
3. Publish or send only with the required approval and tool receipt.
4. Record qualified responses without storing sensitive data in GitHub.
5. Before accepting money, confirm scope, price, delivery date, refund/cancellation terms, and payment method.
6. Deliver only the agreed bounded artifact.
7. Record payment status as provider-confirmed, pending, refunded, disputed, or unknown.
8. Compare results with the stop/revise rule.

## Revenue experiment ledger

Each experiment should record:

| Field | Meaning |
|---|---|
| Experiment ID | Stable identifier for one offer/channel/price test |
| Offer | Exact deliverable being sold or supported |
| Audience | Intended buyer or supporter |
| Price | Test price, not a guaranteed value |
| Quantity target | Sales required for the gross target |
| Capacity | Maximum concurrent buyers or deliveries |
| Channel | Exact approved acquisition surface |
| Views | People exposed to the offer when measurable |
| Qualified conversations | People with a relevant need and plausible ability to buy |
| Offers sent | Exact offers delivered with receipts |
| Orders | Explicit accepted purchases |
| Gross revenue | Provider-confirmed payments before fees/refunds |
| Fees | Payment and marketplace fees |
| Refunds/disputes | Money returned or contested |
| Net cash | Gross revenue minus confirmed fees and refunds; taxes not assumed |
| Delivery state | Not started, active, delivered, accepted, revised, cancelled |
| Next action | Continue, revise, hold, or stop |

## Stop and revise rules

- **No qualified conversations after 20 relevant exposures:** revise audience or problem statement.
- **Qualified conversations but no purchases after 5 exact offers:** revise deliverable, proof, price, or trust boundary.
- **Delivery exceeds the promised scope or capacity:** stop selling until the process is repaired.
- **Refund, dispute, or misunderstanding appears:** pause new sales and clarify terms before resuming.
- **Any request requires credentials, impersonation, hidden access, unsupported claims, or unsafe execution:** decline or redesign the work.

## Money receipt states

```text
PREPARED       offer and proof exist; not published
PUBLISHED      exact offer is live with a publication receipt
INTEREST       response exists; no agreement or money yet
AGREED         scope and price accepted; payment may still be pending
PAID_PENDING   provider shows payment but settlement is not confirmed
PAID_SETTLED   provider confirms available funds
DELIVERED      bounded deliverable sent
ACCEPTED       buyer accepts or the agreed review window closes
REFUNDED       money returned
DISPUTED       payment or delivery contested
CANCELLED      work stopped by agreement
UNKNOWN        evidence is insufficient; do not count as revenue
```

Only `PAID_SETTLED` amounts count toward received cash. A donation or sale must remain separate from GitHub stars, clicks, form starts, verbal interest, or unverified screenshots.

## Public claims boundary

Allowed statements must be factual and supportable, such as:

- the repository contains public examples of GitHub governance work;
- a fixed-scope audit is available at a stated test price;
- voluntary support links exist;
- an experiment has a gross target.

Do not claim guaranteed earnings, guaranteed sales, tax deductibility, investment returns, verified legal status, customer counts, funds received, partnerships, certifications, or production deployments without current evidence.

## Verification

Run the repository-neutral checker:

```bash
node scripts/check-revenue-experiment.mjs
```

The checker validates the sample experiment's required fields, arithmetic, claim boundaries, authority states, and public funding URLs. It does not verify a payment, customer, tax treatment, legal entity, live campaign state, or external publication.

## Next controlled action

Review the offer wording and delivery capacity, then choose exactly one acquisition channel for a separately approved first test. No automatic outreach, checkout, invoice, payment, or publication is authorized by this document.
