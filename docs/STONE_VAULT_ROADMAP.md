# Stone Vault Roadmap

This roadmap lists the next build layers for the Goblin + Fabian Stone Vault after the local readiness path.

## Phase 1 — Local durability

```txt
[x] Memory Vault schema
[x] Approval Vault persistence
[x] Progress Vault persistence
[x] Outpost Vault persistence
[x] Unified Vault Ledger
[x] Health, Manifest, Index, Quickstart, Acceptance docs
```

Exit condition:

```txt
Local Postgres can store, read, and inspect memory, approval, progress, outpost, and receipt evidence.
```

## Phase 2 — Decision records

```txt
[ ] Add approval decision endpoint.
[ ] Record approved/rejected transitions with decidedAt.
[ ] Require explicit approver evidence for needs-approval tasks.
[ ] Add ledger filters for status and taskId.
[ ] Add audit notes for every decision transition.
```

Exit condition:

```txt
Violet Gate can create, decide, and audit approval records without silent authorization.
```

## Phase 3 — Operator dashboard

```txt
[ ] Add a dashboard page for health, manifest, and ledger.
[ ] Add approval review cards.
[ ] Add progress timeline cards.
[ ] Add Outpost round-trip cards.
[ ] Add receipt cards.
```

Exit condition:

```txt
An operator can inspect the Vault without using curl.
```

## Phase 4 — Provider hall

```txt
[ ] Define provider adapter interface.
[ ] Add local mock provider adapter.
[ ] Add OpenAI-compatible adapter boundary without committing secrets.
[ ] Add model/provider memory records.
[ ] Record provider receipts in receipt_records.
```

Exit condition:

```txt
Provider calls are routed through explicit adapters with receipts and no secrets in source.
```

## Phase 5 — Deployment gate

```txt
[ ] Add deployment intent classification.
[ ] Require approval before production deploys.
[ ] Add dry-run deployment records.
[ ] Add deployment receipt records.
[ ] Add rollback return paths.
```

Exit condition:

```txt
Deployments become visible, reversible, and gated by Violet Gate.
```

## Phase 6 — Hosted enclave

```txt
[ ] Add deployment platform documentation.
[ ] Add environment variable checklist.
[ ] Add managed Postgres setup notes.
[ ] Add domain and DNS checklist.
[ ] Add production health checklist.
```

Exit condition:

```txt
The Stone Vault can run as a hosted enclave with durable storage and visible health checks.
```

## Phase 7 — Long ledger memory

```txt
[ ] Add pagination cursors for ledger reads.
[ ] Add export endpoints for JSONL evidence.
[ ] Add backup/restore notes.
[ ] Add retention policy notes.
[ ] Add hash/checksum receipts for critical records.
```

Exit condition:

```txt
The Vault can preserve, export, and verify long-running evidence trails.
```

## Roadmap law

```txt
Every phase preserves the evidence boundary.
No phase turns health into approval.
No phase turns progress into approval.
No phase turns routing into approval.
Only Violet Gate authorizes consequence-bearing execution.
```

## Current spine

```txt
HyperIntent
→ Provider Adapter Hall
→ Provider Memory
→ Memory Vault
→ Stone Vault Schema Indexes
→ Unified Vault Ledger Read Model
→ Unified Vault Ledger API
→ Stone Vault Health API
→ Vault Manifest
→ Vault Manifest API
→ Vault Manifest Manual
→ Stone Vault Index
→ Stone Vault Quickstart
→ Stone Vault Acceptance Checklist
→ Stone Vault Roadmap
→ Execution Worker API
→ Execution Memory Persistence
→ Approval Vault Persistence
→ Progress Vault Persistence
→ Outpost Vault Persistence
→ Receipt Records
→ Violet Gate
→ Outpost 2099-2100
→ Return Door
→ Enclave
```
