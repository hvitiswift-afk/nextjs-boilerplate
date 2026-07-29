# GitHub Audit Product Surface v2

## Objective

Make the active GitHub Control Tower Audit easier to discover and independently inspect while preserving the evidence boundary between public interest, orders, reserved capacity, revenue, and settled cash.

## Added capabilities

- Live public fit-check count sourced from open GitHub issues using the controlled `[Audit request]:` title prefix.
- Explicit machine-readable states declaring that fit checks are not orders and do not reserve capacity.
- Service and FAQ structured data on the product page.
- Generated Open Graph image derived from canonical price and capacity data.
- Sitemap and robots discovery surfaces.
- Fifteen-minute bounded revalidation with graceful `UNAVAILABLE` state when the public GitHub API cannot be read.
- Expanded repository and Netlify deployment verification.

## Evidence boundary

```text
PUBLIC_FIT_CHECK != QUALIFIED_CONVERSATION != ORDER
PUBLIC_FIT_CHECK != CAPACITY_RESERVATION
ORDER != PAYMENT_PENDING != PAID_SETTLED
PAID_SETTLED is required before received cash is counted
```

The public count is a discoverable interest signal only. It never mutates the canonical order, revenue, or settlement records.

## Current canonical money state

```text
Pilot price: $100 USD
Capacity: 5
Orders: 0
Slots remaining: 5
Verified gross revenue: $0 USD
Verified settled cash: $0 USD
```

## Verification

The unified `npm run revenue:verify` command now checks:

- canonical experiment and publication records;
- GitHub issue-source filtering;
- pull-request exclusion;
- non-order and non-reservation flags;
- page and API linkage;
- structured data;
- sitemap, robots, and Open Graph source;
- sensitive-data and unsupported-claim boundaries;
- confirmed Netlify fallback origin.

The Netlify deployment workflow additionally reads back the product page, JSON API, sitemap, and robots policy from the immutable deploy URL.
