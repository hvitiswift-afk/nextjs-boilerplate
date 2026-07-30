# Fardarter Drive™ v6.7 — Counterparty Consent Evidence Attestation

## Purpose

v6.7 defines the evidence required before `SCOPE_DRAFTED → HUMAN_ACCEPTED` can be considered. It does not infer consent, contact a buyer, expose private evidence, append event 2, or create an order, contract, payment, revenue, paid work, ACTIVE delivery, capacity change, legal term, waiver, release, or indemnity result.

## Current canonical truth

```text
Event head                 1
Event digest               3859eac9c63bef83624111704d38cf217b0c1a4ece6df874e72a76e9fb1ffc3b
Reconciliation head        1
Reconciliation digest      9f4f878cc0f8f2ddfa7bbdb594d2b9164064acd8901301404aed57b4065eca0f
SCOPE_DRAFTED              1
HUMAN_ACCEPTED             0
ACTIVE                     0
Orders / gross / settled   0 / $0 / $0
```

## Evidence lifecycle

1. `NO_PACKAGE`
2. `PRIVATE_PACKAGE_PREPARED`
3. `INDEPENDENTLY_VERIFIED`
4. `APPLIED_BY_REVIEWED_MERGE`

The first three states are noncanonical. Even a verified package requires a separate reviewed append-only merge and immutable readback.

## Required private evidence

- Counterparty identity.
- Authority and capacity to consent.
- Exact scope presented.
- Affirmative consent to the exact scope.
- Consent timestamp and collection channel.
- Authentication or signature evidence.
- Revocation and contradiction review.
- Expiry validity.
- Correct source-entity linkage.
- Independent reviewer attestation.

Automation may validate structure, hashes, timestamps, state alignment, and completeness. It may not determine whether a human truly consented.

## Public-safe attestation

A public attestation contains metadata and evidence states only. It excludes identity, contact data, signatures, authentication data, consent text, contract text, private file identifiers, evidence contents, and reviewer deliberations.

```text
Consent manifest digest
6d13d80a7034533b0f155a0d522ce8b2afb34586ff9e8ca2f90c0d355bb5c878

Public attestation digest
0026a05117e349524c51e7000adffc773c5be4986149c4636c111306b8dbe7e8

Attestation receipt digest
27c8fb452b3b7112d9f714449a232b9416e66718677b8595c0a0eda438078a7d
```

A digest proves only that a specific metadata object was reviewed. It does not prove consent by itself.

## Current decision

```text
Package state                 NO_PACKAGE
Decision                      AWAITING_COUNTERPARTY_EVIDENCE
Eligible for application      NO
Canonical event 2             NOT APPENDED
HUMAN_ACCEPTED / order        0 / 0
ACTIVE / gross / settled      0 / $0 / $0
```

## Authority boundary

JP's authority to design, automate, test, or operate Fardarter Drive is not another party's consent. `HUMAN_ACCEPTED` requires `HUMAN_APPROVAL_AND_BUYER_CONSENT` supported by genuine private evidence and independent verification.

## Privacy boundary

Private Drive stores evidence and reviewer records. Public GitHub source stores only titles, states, nonreversible digests, canonical head references, and zero-effect receipts. Public source never stores a buyer identity, contact detail, signature, consent text, private Drive URL, file ID, provider identifier, banking record, or counsel note.

## Dynamic application rule

Any later application must re-read the then-current event and reconciliation heads, calculate the next sequences and previous digests, revalidate the evidence package and revocation state, produce a new application receipt, pass every repository-owned check on one locked head, merge through human review, and complete immutable deployment readback.

## Deployment

The fixed Netlify project remains `UNVERIFIED` until a real provider deploy ID and immutable route readback exist. Repository validation is not substituted for provider deployment evidence.
