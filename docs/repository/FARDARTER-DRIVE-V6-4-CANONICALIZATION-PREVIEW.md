# Fardarter Drive™ v6.4 — Canonicalization Preview and Review Bundles

## Purpose

Fardarter Drive v6.4 converts a `READY_FOR_REVIEW` proposal into a deterministic **candidate** event and **candidate** reconciliation snapshot before any canonical repository change. The preview is nonbinding, noncanonical, unapplied, reversible, and evidence-first.

A preview never creates an order, contract, signature, invoice, payment obligation, settlement, paid work start, ACTIVE-capacity use, accepted delivery, refund, dispute resolution, admission, waiver, release, valuation, revenue claim, or legal protection.

## Canonical baseline

```text
Planning slots              1,000
Effective ACTIVE ceiling    100
Active deliveries           0
Active headroom             100
Orders                      0
Verified gross revenue      $0 USD
Verified settled cash       $0 USD
Capacity override           INACTIVE_NO_RECEIPT
Canonical head sequence     0
Canonical business events   0
Deployment                  UNVERIFIED
```

## Locked digests

```text
Canonical event head  4c401dd352d4263786ac22072d616f67775761656a771ea8815e4623a7a3975b
Proposal ledger       3c85fe2fc195d5a0c9de45b679f9ef3a5589f36f948ea4a8acc0720483a6dc9e
Reconciliation        4035cd406a5db019c4f3b9122e0021b2fb3fcbb23e7e10b040333fdedeb41a22
Candidate event       2e369ed175bfbd2d2a9ae8cc35ab29a48afc7e25adbfc9591b0127fc2b3fb174
Candidate snapshot    4e7e2ead4c466704ad0559fed73cc01cf028722d701ffe47669626858a96c8de
Review bundle         3198341aebdf82e95d8cd0de680a16553cf9c3b3c2e4fd4824d197de79aa6ef2
Preview ledger        9294df7c63b535b292f163bc1bbc183883d05f7bd99329ed845db9d62e2e7a8c
```

All v6.4 digests use SHA-256 over sorted-key UTF-8 JSON after excluding the digest field being computed.

## Preview lifecycle

```text
PREPARED
PREVIEW_READY
BLOCKED
EXPIRED
REJECTED
APPLIED_BY_REVIEWED_MERGE
```

`PREVIEW_READY` means only that the dry-run is internally consistent. It does not authorize or imply application.

## Issue #162 prepared bundle

```text
Source proposal       Issue #162 / READY_FOR_REVIEW
Source entity         Issue #159
Public signal         FIT_APPROVED_FOR_SCOPE_DRAFT
Candidate state       SCOPE_DRAFTED
Candidate sequence    1
Previous event digest v6.2 genesis head
ACTIVE delta          0
Order delta           0
Gross delta           $0
Settled-cash delta    $0
Canonical             false
Applied               false
```

The candidate projection places one entity in `SCOPE_DRAFTED` **if and only if** a future reviewed merge applies the event. Current canonical counts remain all zero.

## Evidence matrix

Every bundle records:

- public proposal receipt;
- source public-state signal;
- canonical event head and source blob;
- proposal and reconciliation digests;
- private review location state;
- verification, expiry, contradiction, classification, and privacy status.

Missing, expired, contradicted, or private evidence posted publicly returns `BLOCKED`.

## Authority matrix

Preview computation is authorized as nonbinding preparation. Canonical event application is not authorized by a preview.

A future application requires:

1. JP review and exact merge authorization;
2. a separately reviewed pull request;
3. a locked head SHA;
4. recomputed event, bundle, and snapshot digests;
5. reconciled state counts, capacity, orders, gross revenue, and settled cash;
6. all applicable buyer, provider, capacity, delivery, acceptance, refund, dispute, insurance, tax/accounting, security/privacy, and counsel gates;
7. passing repository-owned checks;
8. immutable source blobs and post-merge readback.

## Preview controller

The GitHub workflow listens to `opened`, `edited`, `reopened`, and `labeled` issue events. It qualifies requests inside the script by exact title prefix and approval label.

Before mutation, it verifies:

- one shared idempotency marker does not already exist;
- source proposal has `READY_FOR_REVIEW` and noncanonical evidence;
- source entity has exactly one expected `fd-state-*` label;
- the state transition is allowed;
- review time is valid and in the future;
- public inputs contain no apparent sensitive evidence;
- candidate capacity does not exceed the effective ceiling.

The controller has `contents: read` and `issues: write`. It cannot write canonical repository source.

## BLOCKED conditions

- source proposal or entity unavailable;
- proposal receipt missing or not ready;
- source public-state mismatch;
- unknown, backwards, or skipped transition;
- duplicate idempotency key or marker;
- invalid bundle ID;
- expired review time;
- sensitive public content;
- broken canonical or reconciliation digest;
- unsupported order, revenue, settled-cash, or capacity delta;
- active-capacity overflow;
- public/private evidence mismatch.

`BLOCKED` freezes application and applies `needs-jp-review` without changing canonical source.

## Public surfaces

```text
/api/revenue/canonicalization-preview
/github-control-tower-audit/canonicalization-preview
```

The API separates:

- the prepared static review bundle;
- live public preview-request counts;
- current canonical state;
- candidate projections;
- source and candidate digests;
- private Google Drive continuity;
- application and evidence boundaries.

Public counts are operational signals, not canonical or commercial evidence. GitHub read failures return `UNAVAILABLE` and `null`, never invented zero.

## Private Google Drive

The private Fardarter Drive™ folder contains:

- `Fardarter Drive™ v6.4 — Canonicalization Preview and Review Charter`;
- `Fardarter Drive™ v6.4 — Canonicalization Review Bundle Register`.

Public repository source exposes document titles and `CONNECTED_PRIVATE` only. Drive URLs, file IDs, identities, signatures, provider records, bank or payout data, counsel notes, insurance, tax/accounting, confidential delivery evidence, disputes, and review deliberations remain private.

## Controlled self-test

After merge:

1. create one `[FD preview]:` issue using Issue #162 and Issue #159;
2. require `PREVIEW_READY`;
3. verify candidate event sequence `1` and previous digest equals the genesis head;
4. verify candidate ACTIVE/order/gross/settled deltas remain `0 / 0 / $0 / $0`;
5. re-emit the identical approval or edit;
6. require no second preview receipt;
7. read `main` and prove the canonical chain is still sequence `0`, genesis-only;
8. store the private self-test receipt in the review-bundle register.

## Deployment boundary

Source validation and builds do not prove public deployment. A real Netlify deploy ID, immutable deploy URL, API/dashboard/sitemap readback, and uploaded deployment receipt are required before the preview surface is described as publicly deployed.
