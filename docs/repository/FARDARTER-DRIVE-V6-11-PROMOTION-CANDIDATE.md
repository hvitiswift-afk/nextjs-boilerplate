# Fardarter Drive™ v6.11 — Exact Promotion Candidate

## Purpose

Fardarter Drive™ v6.11 prepares one exact application source for a later, separately authorized production promotion. It does not deploy anything by itself.

The candidate is intentionally separated from the control artifacts that describe it. The target application source remains immutable even if this control branch is reviewed or merged.

## Exact candidate

```text
Application version       6.10.0
Target source commit      88bd8dc89a0bd95f42c7e1a21dccc56fe9dc7334
State                     PREPARED_NOT_DEPLOYED
Latest/live claim         NOT ALLOWED
Provider                  NETLIFY
Fixed site                21d3bb41-3a69-4a7d-b6c6-e873cde8ee2f / lichburn-v0-2-8
Promotion decision        HOLD_FOR_EXACT_DEPLOY_AND_READBACK
```

The source was the `main` head when Issue #192 and the promotion packet were created. If `main` moves, the source is still immutable, but human reauthorization is required before promotion.

## Control-plane separation

```text
Target source             exact commit 88bd8dc…
Control branch            feature/fardarter-v6-11-promotion-candidate
Control artifacts         out-of-band evidence
Control merge             does not rewrite the target source
Automatic promotion       prohibited
Human approval            required
```

Human approval remains required at execution time. The target must still be authorized when a provider upload is attempted.

## Verified rollback anchor

The last independently verified production deployment remains:

```text
Application version       6.4.0
Source commit             e482004bfff1bb90aba2d67b8da62a524f18cdb4
Deploy ID                 6a6b6a709e0a6d5ff2ca7759
Immutable URL             https://6a6b6a709e0a6d5ff2ca7759--lichburn-v0-2-8.netlify.app
State                     DEPLOYED_AND_VERIFIED
Verified routes           12
```

That deploy is the rollback reference. A new deployment does not erase or rewrite it.

## 18 required routes

Every promotion attempt must read back all 18 required routes from the authoritative immutable deploy URL:

1. `/`
2. `/github-control-tower-audit`
3. `/github-control-tower-audit/operations`
4. `/github-control-tower-audit/reconciliation`
5. `/github-control-tower-audit/canonicalization-preview`
6. `/github-control-tower-audit/canonicalization-application`
7. `/github-control-tower-audit/successor-readiness`
8. `/github-control-tower-audit/consent-evidence`
9. `/api/revenue/pilot`
10. `/api/revenue/capacity`
11. `/api/revenue/operations`
12. `/api/revenue/reconciliation`
13. `/api/revenue/canonicalization-preview`
14. `/api/revenue/canonicalization-application`
15. `/api/revenue/successor-readiness`
16. `/api/revenue/consent-evidence`
17. `/sitemap.xml`
18. `/robots.txt`

HTTP success alone is insufficient. Every response body must be nonempty, APIs require deterministic semantic validation, and sitemap/robots discovery must remain present.

## Promotion completion gate

Promotion is complete only when all of the following are true:

- target commit existence is independently confirmed;
- target remains authorized at execution time;
- all repository verifiers pass against the exact target;
- Netlify returns a real provider deploy ID;
- Netlify returns the authoritative immutable URL;
- every required route passes readback and semantic validation;
- the verified v6.4 rollback reference is preserved;
- durable receipts are written to Issues #192, #190, #141, and #133;
- No private Google Drive URL or ID is exposed;
- human approval remains present;
- automatic promotion remains disabled.

A build, upload, provider timestamp, branch URL, or deploy ID without complete readback is not a completed promotion.

## Current preflight state

```text
Target commit exists                   YES
Target was main head at creation       YES
Predecessor review PR                  #191
Repository-owned predecessor gates     PASS
Post-merge target reverification       REQUIRED
Provider deploy ID                     UNAVAILABLE
Immutable URL                          UNAVAILABLE
Completed route readbacks              0 / 18
Decision                               HOLD_FOR_EXACT_DEPLOY_AND_READBACK
```

## Canonical and commercial boundary

The candidate creates no operational or commercial effect:

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

This packet does not accept scope, create an order, reserve capacity, confirm payment, recognize revenue, prove consent, start work, expose private Drive references, or change canonical state.

## Control artifacts

- Manifest: `receipts/revenue/FARDARTER-DRIVE-PROMOTION-CANDIDATE-V6-11.json`
- Schema: `schemas/revenue/fardarter-drive-promotion-candidate-v6-11.schema.json`
- Verifier: `scripts/check-fardarter-promotion-candidate-v6-11.mjs`
- CI: `.github/workflows/fardarter-promotion-candidate-v6-11.yml`
- Controlling issue: #192
