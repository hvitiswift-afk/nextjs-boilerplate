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
[x] Add approval decision endpoint.
[x] Record approved/rejected transitions with decidedAt.
[x] Require explicit approver evidence for needs-approval tasks.
[x] Document approval creation and approval decision as separate visible acts.
[x] Add acceptance checks for decision safety behavior.
[x] Add ledger filters for status and taskId.
[x] Document ledger filters for approval decision inspection.
[x] Add audit notes for every decision transition.
[x] Add approval_decision_audit_records to schema.
[x] Add approval-audit rows to the unified ledger.
[x] Add approvalId ledger filter for audit inspection.
[x] Add audit table health checks.
[x] Add audit checks to acceptance.
```

Exit condition:

```txt
Violet Gate can create, decide, and audit approval records without silent authorization.
```

Current Phase 2 state:

```txt
Complete.
Approval creation exists.
Approval decision exists.
Decision docs exist.
Ledger status filters exist.
Ledger taskId filters exist.
Ledger approvalId filters exist.
Approval decision audit rows exist.
The health door checks audit storage.
The ledger manual teaches decision and audit inspection.
Manifest, index, quickstart, and acceptance checklist know the decision door.
Next road: Phase 3 Operator Dashboard.
```

## Phase 3 — Operator dashboard

```txt
[x] Add a dashboard page for health, manifest, and ledger.
[x] Link the dashboard from the home page.
[x] Add a dashboard manual.
[x] Add dashboard manual to the Stone Vault index.
[x] Add approval decision audit cards.
[x] Add approval review cards.
[x] Document approval review cards.
[x] Add progress timeline cards.
[x] Document progress timeline cards.
[x] Add ML evidence lane cards.
[x] Document ML evidence lane cards.
[x] Add Outpost round-trip cards.
[x] Document Outpost round-trip cards.
[ ] Add receipt cards.
[ ] Add interactive operator forms for approval creation and approval decisions.
```

Exit condition:

```txt
An operator can inspect the Vault without using curl.
```

Current Phase 3 state:

```txt
In progress.
The /vault dashboard page exists.
The home page links to /vault.
The dashboard manual exists.
The Stone Vault index links the dashboard manual.
The dashboard has manifest, health, ledger, approval review, command examples, approval-audit visibility, progress timeline cards, an ML evidence lane, and Outpost round-trip cards.
Progress timeline cards inspect task-specific, all-progress, and complete-step evidence.
ML evidence cards inspect model memory, provider receipts, and gated ML task traces.
Outpost round-trip cards inspect outbound entries, inbound returns, and continuity traces.
Next stone: receipt cards.
```

## Phase 4 — Provider hall

```txt
[ ] Define provider adapter interface.
[ ] Add local mock provider adapter.
[ ] Add OpenAI-compatible adapter boundary without committing secrets.
[ ] Add model/provider memory records.
[ ] Record provider receipts in receipt_records.
[ ] Connect provider receipts to the ML evidence lane.
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
Dashboard visibility does not authorize execution.
Approval review is visibility, not authorization.
Progress timeline cards are evidence, not approval.
ML evidence cards are receipts and memory, not approval.
Outpost round-trip cards are continuity evidence, not approval.
Ledger filters narrow evidence without granting authorization.
Approval creation does not execute.
Approval decision does not silently execute.
Approval decision audit does not execute.
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
→ Ledger Status Filters
→ Ledger Task Filters
→ Ledger Approval Filters
→ Approval Decision Audit Records
→ Unified Vault Ledger API
→ Stone Vault Health API
→ Vault Manifest
→ Vault Manifest API
→ Vault Manifest Manual
→ Stone Vault Index
→ Stone Vault Quickstart
→ Stone Vault Acceptance Checklist
→ Stone Vault Roadmap
→ Phase 2 Complete
→ Phase 3 Operator Dashboard
→ Home Page Vault Link
→ Stone Vault Dashboard Manual
→ Stone Vault Operator Dashboard
→ Approval Review Cards
→ Approval Command Blocks
→ Progress Timeline Cards
→ ML Evidence Lane
→ ML Memory Filter
→ ML Provider Receipts
→ ML Gated Task Trace
→ Outpost Round-Trip Cards
→ Outpost Continuity Trace
→ Execution Worker API
→ Execution Memory Persistence
→ Approval Vault Persistence
→ Approval Decision API
→ Approval Decision Docs
→ Approval Decision Audit Vault
→ Progress Vault Persistence
→ Outpost Vault Persistence
→ Receipt Records
→ Violet Gate
→ Outpost 2099-2100
→ Return Door
→ Enclave
```
