# Fardarter Drive™ v6.18 — Standing Control Head

## State

`STANDING_CONTROL_HEAD_RECONCILED` after reviewed merge.

Fardarter Drive™ v6.18 reconciles the top-level Revenue Experiment receipt with the two current predecessor controls:

- v6.16 aggregate control: immutable historical aggregate truth;
- v6.17 owner-routing control: current write ownership, notification materiality, silence, and duplicate-suppression truth.

The v6.16 and v6.17 receipts remain unchanged. v6.18 is a successor control head, not a history rewrite.

## Reconciled control chain

```text
v6.12 production reconciliation
  ↓
v6.13 unified and private continuity
  ↓
v6.14 public offer
  ↓
v6.15 repository application-source projection
  ↓
v6.16 aggregate receipt
  ↓
v6.17 owner routing and material notification
  ↓
v6.18 standing control head
```

The current routing projection contains **11 owner routes**, **eight material notification classes**, **nine silence and suppression conditions**, and a maximum of one notification per private decision fingerprint.

The current point-in-time notification disposition is `SILENT_NO_MATERIAL_EXTERNAL_CHANGE`.

## Current truth

```text
Issue #133 integrity          EXACT_CURRENT_OFFER_INTACT
Public offer                  OPEN_FOR_VERIFIED_FIT_CHECKS
Repository source             SOURCE_MERGED_NOT_DEPLOYED
Production application        DEPLOYED_AND_VERIFIED
Production control            RECONCILED
Repository/live relationship  CONTROL_AHEAD_OF_DEPLOYED_APPLICATION_SOURCE
Source gap                    EXPECTED_CONTROL_ONLY_GAP

Canonical event/reconcile     1 / 1
SCOPE_DRAFTED                 1
HUMAN_ACCEPTED / ACTIVE       0 / 0
Consent                       NO_PACKAGE / AWAITING_COUNTERPARTY_EVIDENCE

Planning / effective ACTIVE   1,000 / 100
ACTIVE / headroom             0 / 100
Capacity override             INACTIVE_NO_RECEIPT
Orders / gross / settled      0 / $0 / $0
Private continuity            CONNECTED_PRIVATE / 17 / OWNER_ONLY / UNSHARED
```

## Ownership

- Native GitHub first response: `NATIVE_V6_9_WORKFLOW`.
- Routine verified email communication: connected Gmail controller under v6.13 authority.
- Private receipts and decision fingerprints: owner-only Google Drive register.
- Provider evidence and mutation: `FARDARTER_DRIVE_LIVE_WATCH`.
- Canonical application: reviewed append-only merge and immutable readback only.

The public repository stores only public-safe control facts. **No private Google Drive URL or file ID** is exposed.

## Historical compatibility

The Revenue Experiment workflow advances its active receipt identity to v6.18 but retains explicit commented v6.16 compatibility anchors. This allows the historical v6.16 verifier to continue proving its original receipt without remaining the active standing-control identity.

The package keeps `fardarter:revenue-receipt:check` pointed to the historical v6.16 verifier and adds a separate `fardarter:control-head:check` for v6.18.

## Consequence boundary

This reconciliation does not rewrite Issue #133, deploy, alter provider state, contact a requester, send email, infer consent, append a canonical event, create `HUMAN_ACCEPTED`, create an order or contract, confirm payment, recognize revenue or settled cash, start work, change ACTIVE capacity, select legal terms, expose private references, or perform an irreversible action.

## Decision

`HOLD_FOR_GENUINE_EXTERNAL_INPUT_OR_SEPARATELY_AUTHORIZED_EXACT_PRODUCTION_PROMOTION`
