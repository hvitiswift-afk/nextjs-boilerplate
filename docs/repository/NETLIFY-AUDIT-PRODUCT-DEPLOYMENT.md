# Netlify Audit Product Deployment Lane

**Target site:** `lichburn-v0-2-8`  
**Site ID:** `21d3bb41-3a69-4a7d-b6c6-e873cde8ee2f`  
**Primary URL:** `https://lichburn-v0-2-8.netlify.app`  
**Controlling recovery issue:** `#136`

## Purpose

Deploy the merged GitHub Control Tower Audit product surface from GitHub-hosted infrastructure and verify the immutable deploy before claiming the public route is live.

## Trigger model

- Pull request: validation only.
- Push to `main`: validation, production deploy to the confirmed existing site, immutable deploy readback, and artifact receipt.
- Manual dispatch: same controlled deployment path.

The workflow never creates a Netlify site. It fails when the required GitHub Actions secret is absent or the site ID differs from the confirmed target.

## Required validations

```text
npm ci
npm run revenue:verify
npm run build
```

## Required readback

The immutable deploy URL must return:

- `/` containing a link to `/github-control-tower-audit`;
- `/github-control-tower-audit` containing the fixed-scope audit offer and fit-check action;
- `/api/revenue/pilot` containing `JP-REV-001`, `PUBLISHED`, five available slots, zero orders, zero verified revenue, zero settled cash, Issue `#133`, and the `PAID_SETTLED` evidence requirement.

## Receipt rule

The workflow uploads a 30-day artifact containing:

- deployment result JSON when available;
- rendered route readback files;
- a machine-readable deployment receipt;
- commit, run, site, deploy, route, and money-state evidence.

A deployment is complete only when the receipt result is `DEPLOYED_AND_VERIFIED`.

## Exclusions

No new-site creation, domain change, billing change, credential change, payment execution, customer contact, database setup, form enablement, or access-control change is performed by this lane.
