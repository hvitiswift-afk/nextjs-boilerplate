# Fardarter Drive™ v6.17 — Owner Routing and Material-Notification Idempotency

## State

`OWNER_ROUTING_RECONCILED` after reviewed merge.

This control links the v6.16 aggregate head to one deterministic routing map for public-offer integrity, GitHub intake and first response, private work packages, verified Gmail cases, consent, proposals, previews, capacity, conflict/stage review, and provider evidence.

## Why this layer exists

Earlier controls established the evidence, authority, and privacy boundaries. They did not yet provide one exact repository contract for who owns each case, what may happen automatically, when JP may be notified, and when the controller must stay silent.

v6.17 defines **notify once** with a private decision fingerprint. The same fingerprint is suppressed; a changed fingerprint is reevaluated for materiality. Fingerprints, Gmail message keys, evidence references, and detailed conflict reasons remain private.

## Owner routing

- Issue #133 integrity: connected Fardarter control plane, read-only comparison only.
- Exact-prefix external audit intake: connected Fardarter control plane.
- Automatic GitHub first response: `NATIVE_V6_9_WORKFLOW` only.
- Private work package: owner-only Google Drive.
- Routine verified email: `CONNECTED_GMAIL_CONTROLLER`.
- Consent, proposals, previews, capacity, and stage/conflict decisions: their bounded connected reviewers.
- Provider evidence and provider mutation: `FARDARTER_DRIVE_LIVE_WATCH` only.
- Canonical application: reviewed append-only merge only.

Issue #133 is not rewritten by this control.

## Material notifications

JP may be notified only for:

1. a genuinely new external request;
2. a verified native GitHub first response;
3. a blocked contact, public-offer, or cross-layer conflict;
4. a created private work package;
5. a verified Gmail message or reply;
6. a new consent, proposal, preview, or capacity decision;
7. a provider-evidence change from the separate owner;
8. a material stage change.

The maximum is one notification per private decision fingerprint.

## Silence and suppression

The disposition is silent for no material change, unchanged point-in-time scans, duplicate fingerprints, repeated HOLD states, historical comments only, owner/bot self-tests, provider statuses without new provider evidence, an existing native first response, or an already-sent Gmail duplicate key.

The current external-input disposition is `SILENT_NO_MATERIAL_EXTERNAL_CHANGE`.

## Current truth

```text
Issue #133 integrity         EXACT_CURRENT_OFFER_INTACT
Public offer                 OPEN_FOR_VERIFIED_FIT_CHECKS
Application source state     SOURCE_MERGED_NOT_DEPLOYED
Production                   DEPLOYED_AND_VERIFIED / RECONCILED
Repository/live relationship CONTROL_AHEAD_OF_DEPLOYED_APPLICATION_SOURCE
Canonical event/reconcile    1 / 1
SCOPE_DRAFTED                1
HUMAN_ACCEPTED / ACTIVE      0 / 0
Capacity                     1,000 planning / 100 effective / 0 ACTIVE
Consent                      NO_PACKAGE / AWAITING_COUNTERPARTY_EVIDENCE
Money                        0 orders / $0 gross / $0 settled
Private continuity           CONNECTED_PRIVATE / 17 / owner-only / unshared
```

## Private decision fingerprint

The fingerprint uses SHA-256 over sorted-key UTF-8 JSON covering the route, case, source object and identity, channel, source receipt, repository and canonical heads, consent, capacity, money, decision, and blocker code.

Only the private reconciliation register stores the receipt. Public source exposes neither the fingerprint ledger nor private references.

## Zero-consequence boundary

This control creates no deployment, provider mutation, external contact, email, consent, canonical event, HUMAN_ACCEPTED, order, contract, payment, revenue, work start, ACTIVE use, capacity change, legal term, private-reference exposure, or irreversible action.

The next controlled decision remains:

`HOLD_FOR_GENUINE_EXTERNAL_INPUT_OR_SEPARATELY_AUTHORIZED_EXACT_PRODUCTION_PROMOTION`.
