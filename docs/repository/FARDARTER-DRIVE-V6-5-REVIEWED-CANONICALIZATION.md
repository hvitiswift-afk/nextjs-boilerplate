# Fardarter Drive™ v6.5 — Reviewed canonicalization

## Current canonical truth

The append-only chain now contains immutable genesis plus one reviewed public-safe business event for the controlled self-test entity, GitHub Issue #159.

```text
Canonical head sequence       1
Canonical business events     1
SCOPE_DRAFTED canonical count 1
ACTIVE deliveries             0
ACTIVE headroom               100
Orders                         0
Verified gross revenue        $0 USD
Verified settled cash         $0 USD
Capacity override             INACTIVE_NO_RECEIPT
Public deployment             UNVERIFIED
```

## Applied transition

```text
FIT_APPROVED_FOR_SCOPE_DRAFT → SCOPE_DRAFTED
```

This internal canonical state receipt is not a customer, order, reservation, contract, invoice, payment, settlement, revenue event, paid work start, active delivery, accepted delivery, refund, dispute result, legal term, or indemnity result.

## Locked receipt chain

```text
Genesis event       4c401dd352d4263786ac22072d616f67775761656a771ea8815e4623a7a3975b
Canonical event     3859eac9c63bef83624111704d38cf217b0c1a4ece6df874e72a76e9fb1ffc3b
v6.3 snapshot       4035cd406a5db019c4f3b9122e0021b2fb3fcbb23e7e10b040333fdedeb41a22
v6.5 snapshot       7c7f47f40868f4879942406274b01710af74539d5b840f0edb18d24400ddbdf3
Application receipt 6692334b17fae5e26d973b92d6476a52d4f316489e085eba76971173f03f156f
```

Short receipt anchors: `3859eac9`, `7c7f47f4`, and `6692334b`.

## Historical preview evidence

The v6.4 prepared and runtime preview records remain noncanonical historical evidence. Their digests are not reused as the applied event digest.

```text
Prepared candidate event    2e369ed175bfbd2d2a9ae8cc35ab29a48afc7e25adbfc9591b0127fc2b3fb174
Prepared candidate snapshot 4e7e2ead4c466704ad0559fed73cc01cf028722d701ffe47669626858a96c8de
Prepared review bundle      3198341aebdf82e95d8cd0de680a16553cf9c3b3c2e4fd4824d197de79aa6ef2
Prepared preview ledger     9294df7c63b535b292f163bc1bbc183883d05f7bd99329ed845db9d62e2e7a8c
Runtime preview event       7190d54bcefbe94e28c000912e37085ff15edce05a60b65fb3b6f622a74846e9
Runtime preview snapshot    d914b9d5a73a3caa3869cd03d13e055b0769ca4e2f094c589fba08b0650eb486
Runtime review bundle       e10840594ba62657c47b83cc86b07ee4279d5346d93350cc77e60645c8cb33bd
```

## Evidence and authority

Source evidence includes Issues #159, #162, #167, #168, and the reviewed v6.5 merge. The authority gate is `JP_REVIEWED_MERGE`. Repository-owned checks, exact-head merge protection, immutable source blobs, and post-merge readback are mandatory.

Received cash still requires provider-confirmed `PAID_SETTLED` evidence. Capacity still does not equal demand, customers, orders, revenue, valuation, or guaranteed outcomes.

## Append-only recovery

Genesis and event 1 are immutable. Any later correction, cancellation, recovery, reversal, or state advance must create a new append-only event linked to the current head. History is never silently edited or deleted.

## Private continuity

The unshared Google Drive layer contains the v6.5 Canonical Event Application Charter and Canonical Event Application Register. Public source exposes document titles and public-safe digests only, never private Drive references, identities, signatures, provider receipts, counsel notes, private review deliberations, or confidential evidence.

## Deployment boundary

All source, schema, verifier, application, reconciliation, API, dashboard, and build evidence may pass while public deployment remains `UNVERIFIED`. A public-live claim requires a real Netlify deploy ID, immutable deploy URL, and successful route/API readback from the confirmed existing site.

## Current law

One canonical `SCOPE_DRAFTED` self-test entity exists; there are zero orders, zero ACTIVE deliveries, zero verified gross revenue, and zero settled cash. Every later consequence requires its own evidence and append-only reviewed event.
