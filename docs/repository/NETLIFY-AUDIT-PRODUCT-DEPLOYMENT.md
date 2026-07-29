# Netlify Audit Authority Product Deployment Lane

**Target site:** `lichburn-v0-2-8`  
**Site ID:** `21d3bb41-3a69-4a7d-b6c6-e873cde8ee2f`  
**Primary URL:** `https://lichburn-v0-2-8.netlify.app`  
**Controlling recovery issue:** `#136`  
**Authority receipt:** `receipts/revenue/JP-REV-001-AUTHORITY.json`

## Purpose

Deploy the merged GitHub Control Tower Audit product and authority surface from GitHub-hosted infrastructure, then verify the immutable deploy before claiming the public route is live.

## Trigger model

- Pull request: validation only.
- Push to `main`: validation, production deploy to the confirmed existing site, immutable deploy readback, and artifact receipt.
- Manual dispatch: the same controlled deployment path.

The workflow never creates a Netlify site. It fails when the required GitHub Actions secret is absent or the site ID differs from the confirmed target.

## Required validations

```text
npm ci
npm run revenue:verify
npm run build
```

The verifier must prove authority version `3.0.0`, exact-prefix intake automation, ten total slots, two maximum active deliveries, the $500 first milestone, the $1,000 expanded gross target, zero orders, zero verified revenue, and zero settled cash.

## Required readback

The immutable deploy URL must return:

- `/` containing a link to `/github-control-tower-audit`;
- `/github-control-tower-audit` containing the fixed-scope audit offer, fit-check action, active-delivery limit, first milestone, and expanded target;
- `/api/revenue/pilot` containing:
  - `schemaVersion: 1.2.0`;
  - `experimentId: JP-REV-001`;
  - `status: PUBLISHED`;
  - `$100 USD` price;
  - `$500 USD` first milestone;
  - `$1,000 USD` gross target;
  - `10` total slots;
  - `2` maximum active deliveries;
  - `0` orders;
  - `10` slots remaining in the baseline;
  - `0` verified revenue and settled cash;
  - Issue `#133`;
  - authority version `3.0.0`;
  - exact-prefix automated intake marked `AUTHORIZED_ACTIVE`;
  - direct outreach marked `NOT_AUTHORIZED`;
  - contract and delivery start marked `HUMAN_APPROVAL_REQUIRED`;
  - payment execution marked `EXTERNAL_PROVIDER_ONLY`;
  - `PAID_SETTLED` as the received-cash evidence requirement;
  - public issues, labels, and automated acknowledgements denied as order, reservation, payment, scope acceptance, or work-start evidence;
- `/sitemap.xml` containing the product route;
- `/robots.txt` identifying the sitemap.

## Receipt rule

The workflow uploads a 30-day artifact containing:

- deployment result JSON when available;
- rendered route readback files;
- a machine-readable deployment receipt;
- commit, run, site, deploy, route, capacity, authority, automation, and money-state evidence.

A deployment is complete only when the receipt result is `DEPLOYED_AND_VERIFIED`.

## Exclusions

No new-site creation, domain change, billing change, credential change, payment execution, customer targeting, contract acceptance, delivery start, refund action, database setup, form enablement, or access-control change is performed by this lane.
