# Fardarter Drive™ v6.24 — Cross-Layer Receipt Idempotency

**Control:** `FARDARTER-DRIVE-RECEIPT-IDEMPOTENCY-V6-24`  
**State after reviewed merge:** `CROSS_LAYER_RECEIPT_IDEMPOTENCY_RECONCILED`  
**Manifest digest:** `bc40c24523b4a2b8bffcc5403b7b6ed18be8251b5653abecaaaf266c74e8e69b`

## Purpose

v6.24 hardens append-only completion receipts against crossed-message and concurrent-write races across GitHub comments and the owner-only private reconciliation register. It is an idempotency governance layer. It does not replace the active v6.21 current control head, change v6.22 public source projection, change v6.20 application source, or create provider evidence.

## Verified race evidence

Issue #160 contains one authoritative v6.23 historical-writer repair marker and one later crossed-message correction. The correction is preserved as history and does not create a second control transition.

The owner-only reconciliation register currently contains one authoritative v6.23 manifest-digest occurrence in its latest reconciled revision. A transient crossed write was observed earlier. Revision history remains preserved.

No private Google Drive URL or file ID is included in public source.

## Stable completion-receipt key

Contract version: `fd.receipt-key.v1`

The key is SHA-256 over UTF-8 JSON with recursively sorted object keys and exactly these six fields:

1. `controlId`
2. `manifestDigest`
3. `reviewedHead`
4. `mergeReadbackCommit`
5. `destinationClass`
6. `receiptPurpose`

The key excludes run IDs, timestamps, generated times, read revision IDs, comment IDs, provider object IDs, provider-generated IDs, artifact digests, and artifact-only metadata.

Public markers use:

```text
<!-- jp-fardarter-receipt-{receiptKey} -->
```

Correction or quarantine markers use:

```text
<!-- jp-fardarter-receipt-correction-{receiptKey} -->
```

Receipt keys and private decision fingerprints remain private unless the receipt is explicitly public-safe.

## Deterministic test vectors

```text
V6_23_GITHUB_ISSUE_160_REPAIR
cb8805d9d544eb4aa914a91ec5ad7176ab30648c1b4ec394432c6c180310c47e

V6_23_PRIVATE_REGISTER_COMPLETION
5f7fce2a6e8cdf695b3a2e43a573a101e10694dfa57332bb285c6f3438a61a06
```

Changing volatile provider metadata must not change either material key. Changing any of the six material tuple fields must change the key.

## Double-read write protocol

Every append follows the same sequence:

1. Search for the exact marker or all six exact tuple values.
2. Perform a fresh provider read.
3. Repeat the exact marker and tuple search.
4. Write only with the destination lock:
   - GitHub: latest thread snapshot plus exact marker search.
   - Private register: `requiredRevisionId`.
5. Read back and count the exact marker and exact tuple.

A revision conflict requires `RESTART_FROM_FIRST_SEARCH`. A stale write is never retried directly.

When an exact marker or exact tuple already exists, the append is suppressed.

## Duplicate handling

A successful append must read back with count `1`.

A count above one is classified:

```text
CROSSED_MESSAGE_DUPLICATE_RECEIPT
```

Required actions:

- preserve all history;
- stop further writes;
- designate `EARLIEST_VALID_EXACT_TUPLE` as authoritative;
- add at most one stable correction or quarantine record per destination and receipt key;
- suppress duplicate material notification.

Deletion and automatic history rewrite are prohibited.

## Preserved authority and truth

```text
Active current control head   v6.21 / CURRENT_CONTROL_HEAD_RECONCILED
Public source projection      v6.22 / PUBLIC_CONTROL_HEAD_SOURCE_RECONCILED
Historical writer retirement  v6.23 / HISTORICAL_PUBLIC_WRITER_RETIRED
Application source            v6.20 / SOURCE_MERGED_NOT_DEPLOYED
Production                    DEPLOYED_AND_VERIFIED / RECONCILED
Canonical event/reconcile     1 / 1
Canonical business events     1
SCOPE_DRAFTED                 1
HUMAN_ACCEPTED / ACTIVE       0 / 0
Consent                       NO_PACKAGE / AWAITING_COUNTERPARTY_EVIDENCE
Capacity                      1,000 / 100 / 0 / 100
Orders / gross / settled      0 / $0 / $0
Private continuity            CONNECTED_PRIVATE / 17 / OWNER_ONLY / UNSHARED
```

## Boundaries

This control changes repository governance source only. It does not delete or rewrite GitHub or Drive history, rewrite Issue #133 or Issue #141, alter Issue #160 historical comments, deploy, promote, mutate a provider, contact a requester, send Gmail, infer consent, append a canonical event, create `HUMAN_ACCEPTED`, create an order or contract, confirm payment, recognize revenue or settled cash, start work, activate capacity, select legal terms, disclose private references, or perform an irreversible action.

The decision remains `HOLD_FOR_GENUINE_EXTERNAL_INPUT_OR_SEPARATELY_AUTHORIZED_EXACT_PRODUCTION_PROMOTION`.
