# Fardarter Drive™ v6.22 — Public Current-Control-Head Source Projection

**Control issue:** #226  
**Implementation issue:** #227  
**Repository base:** `606a42545e8c1638b8a90e9522295d61be6cb6ab`

## Purpose

v6.22 adds a separate public-safe source page and read-only API that project the reconciled v6.21 current control head. It does not modify the immutable v6.20 stable buyer-facing page, pilot API, internal rewrite, manifest, schema, verifier, or exact source hashes.

## Exact source package

```text
Control              FARDARTER-DRIVE-PUBLIC-CONTROL-HEAD-PROJECTION-V6-22
Manifest digest      f2a7344f1a437174e9abc4adfcb2a18a4a80ed2d952a88afd4e55c61993ebc36
Page path             /github-control-tower-audit/control-head
Page SHA-256          52a7baa2f4fa35f4060d807c5dfedb2dc0fa51e867fd2064aa73bc2c689ddf4a
API path              /api/revenue/control-head
API SHA-256           bdcd8d954ce8d0777338d705e499fb39eba4d6c4ed949e25528f59f36f9d52ff
API schema            1.8.0
Prepared state        PREPARED_SOURCE_ONLY_PENDING_REVIEWED_MERGE
Post-merge state      PUBLIC_CONTROL_HEAD_SOURCE_RECONCILED
```

## Authority layers

```text
Current control head          v6.21 / CURRENT_CONTROL_HEAD_RECONCILED
Buyer-facing source control   v6.20 / SOURCE_MERGED_NOT_DEPLOYED
Strategy authority            v6.19 / STRATEGY_RAIL_RECONCILED
Standing operational control  v6.18 / STANDING_CONTROL_HEAD_RECONCILED
Issue #133                    EXACT_CURRENT_OFFER_INTACT
Issue #141                    HISTORICAL_STRATEGY_AND_STAGE_GOVERNANCE_RAIL
Production                    DEPLOYED_AND_VERIFIED / RECONCILED
Repository/live relationship  CONTROL_AHEAD_OF_DEPLOYED_APPLICATION_SOURCE
```

The top-level Revenue Experiment remains v6.21. v6.22 is a separate source projection, not a replacement standing head and not provider evidence.

## Canonical, consent, capacity, and money

```text
Event / reconciliation       1 / 1
SCOPE_DRAFTED                1
HUMAN_ACCEPTED / ACTIVE      0 / 0
Event 2                      absent
Consent                      NO_PACKAGE / AWAITING_COUNTERPARTY_EVIDENCE
Planning / effective ACTIVE  1,000 / 100
Active / headroom            0 / 100
Override                     INACTIVE_NO_RECEIPT
Orders / gross / settled     0 / $0 / $0
```

## Privacy and execution boundaries

Private continuity remains `CONNECTED_PRIVATE`, owner-only and unshared across 17 known documents. No private Google Drive URL or file ID, identity evidence, signature, banking record, provider-private evidence, counsel note, deliberation, or private decision fingerprint is included.

The package does not deploy, promote, redeploy, roll back, mutate a provider, rewrite Issue #133 or Issue #141, alter v6.20 stable routes, contact a requester, send Gmail, prove consent, append a canonical event, create HUMAN_ACCEPTED, create an order or contract, confirm payment, recognize revenue or cash, start work, activate capacity, select legal terms, or perform an irreversible action.

Provider evidence and mutation remain exclusively owned by `FARDARTER_DRIVE_LIVE_WATCH`.

## Decision

`HOLD_FOR_GENUINE_EXTERNAL_INPUT_OR_SEPARATELY_AUTHORIZED_EXACT_PRODUCTION_PROMOTION`
