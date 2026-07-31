# Fardarter Drive™ v6.24 — Cross-Layer Receipt Idempotency

**Control:** `FARDARTER-DRIVE-CROSS-LAYER-RECEIPT-IDEMPOTENCY-V6-24`  
**Controlling issues:** #232 and #233  
**Manifest digest:** `56cb6b6395262f095d5888f2f45837b30fb7da5ca4f53c17c9238c9571b6d056`  
**Prepared against:** `f564ab950998aec1317ea095a1700d61b7409fa9`

## Purpose

v6.24 defines one deterministic completion-receipt identity across public GitHub issue comments and the owner-only private reconciliation register. It governs how a completion receipt is searched, written once, read back, counted, suppressed, or quarantined. It does not replace the v6.21 current control head and does not deploy or mutate a provider.

## Verified race evidence

Issue #160 contains one authoritative v6.23 repair marker and one later append-only crossed-message correction. The correction is not a second control transition. The private register transiently exposed two exact v6.23 tuples during concurrent append/readback and later reconciled to one authoritative current receipt.

Historical records are preserved. v6.24 does not delete or rewrite either destination.

## Receipt key

The receipt key is lowercase hexadecimal SHA-256 over sorted-key UTF-8 JSON containing exactly:

```text
controlId
manifestDigest
reviewedHead
mergeReadbackCommit
destinationClass
receiptPurpose
```

Destination classes are `GITHUB_PUBLIC_ISSUE` and `PRIVATE_DRIVE_REGISTER`.

Run IDs, timestamps, generated times, read revision IDs, comment IDs, provider-generated object IDs, provider cursors, workflow-run IDs, and artifact IDs are excluded. Changing those values cannot create a new material receipt identity.

## Double-read protocol

1. Search the exact control marker and exact evidence tuple.
2. Perform a fresh provider read.
3. Repeat the exact marker and tuple search.
4. Verify the provider cursor or document revision is fresh.
5. Write once only when both searches return zero.
6. Perform a fresh post-write provider read.
7. Count exact marker and tuple occurrences.
8. Complete when the count is one; quarantine when it exceeds one.

A Google Docs revision conflict or a GitHub crossed message restarts from the first search. A stale write is never retried directly.

## Destination controls

### GitHub

Search the complete issue timeline for the exact control marker, receipt-key marker, and evidence tuple. Any match suppresses the write. If more than one exact receipt becomes visible, preserve all comments, stop further writes, classify `CROSSED_MESSAGE_DUPLICATE_RECEIPT`, and permit at most one append-only correction per destination and receipt key.

### Private register

Search the exact heading, evidence tuple, and receipt key. Read the full native document and bind the write to its fresh revision ID. A revision mismatch restarts the entire double-read protocol. More than one exact receipt stops writes and enters quarantine; no historical document content may be deleted or rewritten.

## Authoritative receipt

The first provider-visible complete exact evidence tuple in provider order is authoritative. Later exact duplicates remain historical. An append-only designation may identify the authoritative receipt, but it does not create another control transition. Ambiguous provider order requires JP review.

## Preserved truth

```text
Current control head          v6.21 / CURRENT_CONTROL_HEAD_RECONCILED
Public source projection      v6.22 / PUBLIC_CONTROL_HEAD_SOURCE_RECONCILED
Historical writer retirement  v6.23 / HISTORICAL_PUBLIC_WRITER_RETIRED
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

No private Google Drive URL or file ID is present in this package. No deployment, provider mutation, external contact, Gmail send, consent inference, canonical append, order, contract, payment, revenue, work start, capacity activation, legal selection, deletion, rewrite, or irreversible action is created.

**Decision:** `HOLD_FOR_GENUINE_EXTERNAL_INPUT_OR_SEPARATELY_AUTHORIZED_EXACT_PRODUCTION_PROMOTION`.
