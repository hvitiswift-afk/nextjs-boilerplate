# Fardarter Drive™ v6.26 — Live Claim Witness and Ref Integrity

**Control:** `FARDARTER-DRIVE-CLAIM-WITNESS-REF-INTEGRITY-V6-26`  
**Controlling issues:** #238 and #239  
**Manifest digest:** `e90f270d50ea5e4bab10663204b6c07118b2effe5b9d82d5bbccc6c3d572164c`  
**Post-merge state:** `CLAIM_WITNESS_AND_REF_INTEGRITY_RECONCILED`  
**Prepared against:** `0423ea38c5b65b3bdda585f51c21e43cfe2918fe`

## Purpose

v6.25 prevents two public writers from creating the same material completion receipt by binding the receipt to one canonical issue and one create-only claim branch. v6.26 makes that claim durable and auditable. It reconstructs the live public claim witness graph from public Git refs and public repository issue comments and classifies any mismatch before another receipt write is attempted.

v6.21 remains the active top-level current control head. v6.26 is a claim-witness governance layer only.

## Live witness inputs

The dedicated read-only workflow captures:

```text
git ls-remote --heads origin refs/heads/fd-receipt-claim/*
gh api --paginate repos/${GITHUB_REPOSITORY}/issues/comments?per_page=100 --slurp
```

The workflow has `contents: read` and `issues: read` only. It cannot create, move, delete, or repair refs or comments.

## Correlation rules

Every public completion receipt at v6.25 or later must satisfy all of the following:

1. Its exact receipt-key marker appears in exactly one authoritative completion comment.
2. Exactly one branch exists at `fd-receipt-claim/{receiptKey}`.
3. The branch suffix equals the receipt key.
4. The branch target equals the exact `mergeReadbackCommit` in the receipt.
5. The receipt has `destinationClass GITHUB_PUBLIC_ISSUE`.
6. The comment's issue equals its declared `canonicalIssue`.
7. Corrections do not create claims.
8. Private receipt keys never enter the public claim namespace.

The current bound witness is:

```text
controlId             FARDARTER-DRIVE-RECEIPT-DESTINATION-CLAIM-V6-25
receiptKey            ec7e499f89db4e25f244b9cf54934485f293807272443e58ece5d6593f13f427
branch                fd-receipt-claim/ec7e499f89db4e25f244b9cf54934485f293807272443e58ece5d6593f13f427
target                 0423ea38c5b65b3bdda585f51c21e43cfe2918fe
canonical issue        235
classification         CLAIM_BOUND_COMPLETE
witness digest         697ac2dab1fa4cd64aa334b59584daefd9fc790a36531b1601eb607ff7118a3d
```

## Bounded legacy exception

v6.24 predates the public claim protocol. Its exact key remains a bounded explicit exception:

```text
receiptKey             eee942e246454fc6626f35967fa12dd3a50e34d4502e0811043e0fa08f78cdb2
authoritative          Issue #232 / comment 5144541544
later duplicate        Issue #233 / comment 5144555821
correction             Issue #233 / comment 5144591638
classification         LEGACY_PRECLAIM_DUPLICATE_RECONCILED
control transitions    1
```

No other post-v6.25 receipt may use the legacy exception.

## Conflict classifications

```text
MISSING_CLAIM_REF
REPOINTED_CLAIM_REF
ORPHAN_CLAIM_REF
MALFORMED_CLAIM_REF
CLAIM_WITHOUT_RECEIPT
RECEIPT_WITHOUT_CLAIM
CLAIM_BOUND_DUPLICATE_RECEIPT
PRIVATE_DESTINATION_PUBLIC_CLAIM
DUPLICATE_CLAIM_REGISTRY_ENTRY
```

A conflict preserves every ref and comment, stops further writes for the receipt key, enters quarantine, and allows at most one changed-material notification. A missing or compromised claim is never automatically recreated, repointed, deleted, or replaced.

## Witness digest

The claim-witness digest is SHA-256 over sorted public material fields:

```text
receiptKey
branchName
targetCommit
controlId
mergeReadbackCommit
destinationClass
receiptPurpose
canonicalIssueNumber
classification
```

Comment IDs, timestamps, workflow-run IDs, cursors, and other provider-generated metadata are excluded. The witness digest is not a receipt key and does not alter the v6.24 material receipt identity.

## Preserved truth

```text
Current control head          v6.21 / CURRENT_CONTROL_HEAD_RECONCILED
Public source projection      v6.22 / PUBLIC_CONTROL_HEAD_SOURCE_RECONCILED
Historical writer retirement  v6.23 / HISTORICAL_PUBLIC_WRITER_RETIRED
Receipt idempotency           v6.24 / CROSS_LAYER_RECEIPT_IDEMPOTENCY_RECONCILED
Destination and claim         v6.25 / RECEIPT_DESTINATION_AND_CLAIM_RECONCILED
Application source            v6.20 / SOURCE_MERGED_NOT_DEPLOYED
Issue #133                    EXACT_CURRENT_OFFER_INTACT
Issue #141                    HISTORICAL_STRATEGY_AND_STAGE_GOVERNANCE_RAIL
Issue #160                    HISTORICAL_WORKFLOW_STALE_FALSE_CONFLICT
Canonical event/reconcile     1 / 1
Canonical business events     1
SCOPE_DRAFTED                 1
HUMAN_ACCEPTED / ACTIVE       0 / 0
Consent                       NO_PACKAGE / AWAITING_COUNTERPARTY_EVIDENCE
Capacity                      1,000 / 100 / 0 / 100
Orders / gross / settled      0 / $0 / $0
Production                    DEPLOYED_AND_VERIFIED / RECONCILED
Private continuity            CONNECTED_PRIVATE / 17 / OWNER_ONLY / UNSHARED
```

No private Google Drive URL or file ID is present. No private receipt key is public. No deployment, provider mutation, external contact, Gmail send, consent inference, canonical append, order, contract, payment, revenue, work start, capacity activation, legal selection, deletion, rewrite, or irreversible action is created.

**Decision:** `HOLD_FOR_GENUINE_EXTERNAL_INPUT_OR_SEPARATELY_AUTHORIZED_EXACT_PRODUCTION_PROMOTION`.
