# Netlify Fardarter Drive™ Product Deployment Lane

**Target site:** `lichburn-v0-2-8`  
**Site ID:** `21d3bb41-3a69-4a7d-b6c6-e873cde8ee2f`  
**Primary URL:** `https://lichburn-v0-2-8.netlify.app`  
**Controlling recovery issue:** `#136`  
**Rollout issue:** `#143`  
**Authority receipt:** `receipts/revenue/FARDARTER-DRIVE-AUTHORITY-V4.json`  
**Scale record:** `receipts/revenue/FARDARTER-DRIVE-V4.json`

## Purpose

Deploy the merged GitHub Control Tower Audit and Fardarter Drive™ authority surface from GitHub-hosted infrastructure, then verify the immutable deploy before claiming the public route is live.

A successful repository build is not a deployment receipt. A changed Netlify project timestamp or alias is not enough. Completion requires a deploy ID, immutable deploy URL, route readback, and a machine-readable result of `DEPLOYED_AND_VERIFIED`.

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

The verifier must prove:

- Fardarter Drive ID `FARDARTER-DRIVE-V4`;
- authority version `4.0.0`;
- exact #133–#140 object/commit chain;
- ten total audit slots and two maximum active deliveries;
- zero orders, zero verified gross revenue, and zero settled cash;
- document drafting authorized but nonbinding;
- exact outreach conditional;
- contract acceptance and work start human-gated;
- payment external-provider-only;
- indemnity and liability terms counsel-gated;
- $1M, $1B, $1T, and $1 quadrillion horizons unachieved and nonforecast;
- no indemnity-proof claim.

## Required readback

The immutable deploy URL must return:

- `/` containing a link to `/github-control-tower-audit`;
- `/github-control-tower-audit` containing:
  - the fixed-scope audit offer and fit-check action;
  - Fardarter Drive™;
  - current gross and settled-cash evidence;
  - “Aspirational horizons — not achieved revenue”;
  - “not indemnity-proof”;
- `/api/revenue/pilot` containing:
  - `schemaVersion: 1.3.0`;
  - `experimentId: JP-REV-001` and `status: PUBLISHED`;
  - `$100 USD` price, `$500 USD` first milestone, and `$1,000 USD` current gross target;
  - `10` total slots, `2` maximum active deliveries, `0` orders, and `10` slots remaining in the baseline;
  - `0` verified gross revenue and settled cash;
  - Fardarter Drive controlling issues `141`, `142`, and `143`;
  - the five exact stage IDs and amount strings:
    - `FD-001K` / `1000`;
    - `FD-001M` / `1000000`;
    - `FD-001B` / `1000000000`;
    - `FD-001T` / `1000000000000`;
    - `FD-001Q` / `1000000000000000`;
  - every horizon marked `achieved: false`, `forecast: false`, and `guaranteed: false`;
  - authority version `4.0.0`;
  - document drafts `AUTHORIZED_ACTIVE`;
  - relevant exact outreach `AUTHORIZED_CONDITIONAL`;
  - contract acceptance and delivery start `HUMAN_APPROVAL_REQUIRED`;
  - indemnity/liability terms `COUNSEL_REVIEW_REQUIRED`;
  - payment execution `EXTERNAL_PROVIDER_ONLY`;
  - chain receipt `CHAIN_RESOLVED`, first object `133`, last object `140`, count `8`;
  - `PAID_SETTLED` as the received-cash requirement;
  - public issues, labels, drafts, invoices, horizons, and automated acknowledgements denied as order, reservation, contract, payment, valuation, or work-start evidence;
  - `templateIsIndemnityProof: false` and counsel/buyer-consent gates;
- `/sitemap.xml` containing the product route;
- `/robots.txt` identifying the sitemap.

## Receipt rule

The workflow uploads a 30-day artifact containing:

- deployment result JSON when available;
- rendered route readback files;
- a machine-readable Fardarter Drive deployment receipt;
- commit, run, site, deploy, route, capacity, horizon, authority, chain, legal-boundary, automation, and money-state evidence.

## Claims boundary

The deployment receipt does not prove:

- any horizon has been achieved;
- current revenue, valuation, customer count, or market size beyond the canonical evidence;
- legal enforceability of a contract or indemnity clause;
- absence of all liability;
- payment settlement without the external provider receipt.

## Exclusions

No new-site creation, domain change, billing change, credential change, payment execution, autonomous customer targeting, contract acceptance, delivery start, refund/dispute response, bank or payout change, database setup, form enablement, or access-control change is performed by this lane.
