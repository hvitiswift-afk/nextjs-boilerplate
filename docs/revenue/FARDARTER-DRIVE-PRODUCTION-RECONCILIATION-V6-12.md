# Fardarter Drive™ v6.12 — Production Reconciliation

## Purpose

v6.12 reconciles the already verified v6.11 Netlify production promotion into repository truth. It does not upload, redeploy, roll back, create a provider resource, or change application behavior.

## Reconciled production

```text
Application source        88bd8dc89a0bd95f42c7e1a21dccc56fe9dc7334
Control merge             f5d3261bb513764fe14601ef9d0fc53e71ea83b3
Provider                  NETLIFY
Site                      21d3bb41-3a69-4a7d-b6c6-e873cde8ee2f / lichburn-v0-2-8
Deploy ID                 6a6ba0366ebec6650d843ac3
Immutable URL             https://6a6ba0366ebec6650d843ac3--lichburn-v0-2-8.netlify.app
Provider state            READY
Immutable readback        18 / 18 PASS
Exact body matches        18 / 18
Production state          DEPLOYED_AND_VERIFIED
```

## Repository and production distinction

The deployed application source is the v6.10 lineage merge. The later v6.11 control merge records authorization and promotion controls but is not the application source uploaded to Netlify.

```text
Production application    DEPLOYED_AND_VERIFIED
Production control state  RECONCILED
Repository head           CONTROL_AHEAD_OF_DEPLOYED_APPLICATION_SOURCE
Source gap                EXPECTED_CONTROL_ONLY_GAP
Live claim allowed        YES
```

A control commit is not automatically an application deployment. A provider-ready state alone is not complete verification. The live claim is permitted here only because the exact uploaded artifact passed all 18 immutable byte-for-byte readbacks.

## Evidence

```text
Provider upload run       30572898948
Verification run          30573526190
Static package SHA-256    d8a876dfc9b5156bef118fae6487c18358c884d4aa326235286152e38dddb104
Readback evidence SHA-256 d0a5f072f7b6dd544f47eeba28c93461aeab2ccb9cedd85b00ead83d19eb23ee
Artifact                  fardarter-v6-11-deployed-and-verified-30573526190
Artifact ID               8771747385
Artifact digest           sha256:009217308c48b1cfbc4cc00ab46f2b9199d72617ff1ed32dc8b367f29785a981
```

## Rollback anchor

The verified v6.4 deploy `6a6b6a709e0a6d5ff2ca7759`, sourced from `e482004bfff1bb90aba2d67b8da62a524f18cdb4`, remains preserved as the rollback reference.

## Future promotion boundary

Future production changes remain manually authorized and must again provide an exact target commit, provider deploy ID, authoritative immutable URL, complete route readback, rollback reference, and no private-reference exposure. Automatic promotion remains prohibited.

## Canonical and commercial boundary

```text
Canonical event head      sequence 1
SCOPE_DRAFTED             1
HUMAN_ACCEPTED            0
ACTIVE                    0
Orders                    0
Verified gross revenue    $0 USD
Verified settled cash     $0 USD
Received-cash gate        PAID_SETTLED
```

This reconciliation records deployment evidence only. It does not accept scope, create an order, reserve capacity, prove payment or consent, start work, expose private Drive references, or recognize revenue.

## Control artifacts

- Manifest: `receipts/revenue/FARDARTER-DRIVE-PRODUCTION-RECONCILIATION-V6-12.json`
- Schema: `schemas/revenue/fardarter-drive-production-reconciliation-v6-12.schema.json`
- Verifier: `scripts/check-fardarter-production-reconciliation-v6-12.mjs`
- CI: `.github/workflows/fardarter-production-reconciliation-v6-12.yml`
- Controlling issue: #195
- Manifest digest: `1e8aa2af8bb3af332185b7419c63e2c1ad8c19c866e45b62fe04a2fc969932ee`
