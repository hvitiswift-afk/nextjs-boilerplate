# Fardarter Drive™ v6.10 — Deployment Lineage

## Purpose

Fardarter Drive™ v6.10 separates four states that must never be collapsed into one claim:

1. a verified historical production deployment;
2. the latest merged application target;
3. a latest-target production promotion;
4. drift between the deployed and repository versions.

The lineage control is evidence classification. It does not deploy, accept scope, create an order, reserve capacity, confirm payment, prove consent, start work, expose private records, or change canonical state.

## Verified historical deployment

The fixed Netlify site has one independently verified historical deployment:

```text
Application version       6.4.0
Exact source commit       e482004bfff1bb90aba2d67b8da62a524f18cdb4
Provider                  NETLIFY
Site ID                   21d3bb41-3a69-4a7d-b6c6-e873cde8ee2f
Site name                 lichburn-v0-2-8
Deploy ID                 6a6b6a709e0a6d5ff2ca7759
Immutable URL             https://6a6b6a709e0a6d5ff2ca7759--lichburn-v0-2-8.netlify.app
Workflow run              30554925086
Verified routes           12
Verification state        DEPLOYED_AND_VERIFIED
```

The verified package was materialized from Netlify v1 route blobs into a static package. The requested route set did not require runtime functions. Static materialization preserved the locked v6.4 application evidence; it did not create a new application version.

## Latest merged application target

At v6.10 control creation, the latest merged application target is:

```text
Application version       6.9.0
Source commit             760d198316c392a7de3af36faffa93df42ecca64
Capability                AUTHORIZED_GITHUB_FIRST_RESPONSE
Repository state          MERGED
Production promotion      NOT_PROMOTED
Provider deploy ID        none
Immutable URL             none
Route readback            NOT_PERFORMED
Live claim allowed        NO
```

This means the repository contains v6.9 while the independently verified production receipt remains v6.4.

## Required distinctions

```text
Verified historical deploy ≠ latest repository state
Merged repository state    ≠ deployed state
Provider deploy ID          ≠ route verification by itself
Project timestamp           ≠ immutable deployment receipt
Static materialization      ≠ mutation of locked application evidence
Deployment receipt          ≠ order, payment, revenue, consent, or work start
```

The correct current classification is:

```text
Historical deployment      VERIFIED_HISTORICAL
Latest repository          MERGED_NOT_DEPLOYED
Latest production          UNVERIFIED
Drift                      EXPECTED_VERSION_GAP
```

The version gap is not automatically a failure. It becomes a claim defect only when someone describes the historical deployment as the latest application or describes the merged application as live without provider evidence.

## Latest promotion gate

A latest-target production promotion is complete only when every gate passes:

- exact target commit locked;
- all repository verifiers pass;
- real provider deploy ID returned;
- authoritative immutable URL returned;
- immutable route readback passes route by route;
- rollback reference is recorded;
- durable receipts are posted to Issues #190, #141, and #133;
- no private Google Drive URL or ID is exposed;
- human approval remains present;
- automatic promotion remains prohibited.

A changed project timestamp, successful repository build, provider upload, or provider deploy ID without complete readback is insufficient.

## Canonical and financial boundary

The v6.10 lineage control preserves the existing canonical heads and evidence state:

```text
Canonical event head       sequence 1
SCOPE_DRAFTED              1
HUMAN_ACCEPTED             0
ACTIVE                     0
Orders                     0
Verified gross revenue     $0 USD
Verified settled cash      $0 USD
Received-cash gate         PAID_SETTLED
```

No lineage record can prove demand, acceptance, payment, settlement, revenue, valuation, consent, work start, delivery, or capacity use.

## Control artifacts

- Manifest: `receipts/revenue/FARDARTER-DRIVE-DEPLOYMENT-LINEAGE-V6-10.json`
- Schema: `schemas/revenue/fardarter-drive-deployment-lineage-v6-10.schema.json`
- Verifier: `scripts/check-fardarter-deployment-lineage-v6-10.mjs`
- CI: `.github/workflows/fardarter-deployment-lineage-v6-10.yml`
- Controlling issue: #190
