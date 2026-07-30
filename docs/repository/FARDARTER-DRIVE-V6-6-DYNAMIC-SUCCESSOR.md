# Fardarter Drive™ v6.6 — Dynamic-head successor control

## Current source

```text
Event head                 1
Event digest               3859eac9c63bef83624111704d38cf217b0c1a4ece6df874e72a76e9fb1ffc3b
Reconciliation head        1
Reconciliation digest      9f4f878cc0f8f2ddfa7bbdb594d2b9164064acd8901301404aed57b4065eca0f
Application digest         f2285c4c02c10f4403302600f092926b519d0c2e2c5d0d3e9d078fbf7828be3d
SCOPE_DRAFTED              1
ACTIVE                     0
Orders / gross / settled   0 / $0 / $0
```

## Dynamic derivation

The successor controller reads the current event and reconciliation heads from canonical source. The next event is always `headSequence + 1`; its previous digest is the current head digest. The next reconciliation sequence is always `current sequence + 1`; its previous digest is the current reconciliation digest. Hard-coded or stale head values are rejected.

## Controlled blocked review

The prepared v6.6 bundle reviews `SCOPE_DRAFTED → HUMAN_ACCEPTED`.

The transition exists, but its authority gate is `HUMAN_APPROVAL_AND_BUYER_CONSENT`. The review is therefore `BLOCKED_MISSING_GATE_EVIDENCE` because exact application approval, buyer consent, and binding scope acceptance are absent.

A valid later application would project one order because `HUMAN_ACCEPTED` counts as an order. That projection is not current truth. Actual orders, revenue, settled cash, ACTIVE work, and capacity use remain zero.

## Digests

```text
Successor control     d9e2ecfb97b33e547e87c7c092c25ef37f251e91e7549c1e23f41782987db1ae
Blocked review bundle 8f3312568414fcad5d33bc8ee44d4c04f6d54117dce250c62d31c4491b6638f2
Candidate event       6e9ec1a02d85b2894d8388bfc3bcc7d4d79147703d3ea68b2bbc9b358a3829b2
Candidate snapshot    5891a56c76f102573461c64d281f4cac6e785d2737b3ec8d5b5d170cfbd7b245
```

## Boundaries

The blocked review creates no customer, order, contract, invoice, payment obligation, payment proof, paid work start, ACTIVE use, capacity-ceiling change, refund, dispute result, legal term, or indemnity result. Broad system-development authorization cannot substitute for another party's consent.

Any later event 2 requires a fresh proposal, dynamic preview against the then-current head, private evidence reconciliation, a separately reviewed merge, green repository checks, immutable source blobs, and post-merge readback.

Public deployment remains `UNVERIFIED` until Netlify provides a real deploy ID and immutable route/API readback from the confirmed existing site.
