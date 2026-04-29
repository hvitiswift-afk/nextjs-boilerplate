# Stone Vault Index

This index links the current Goblin + Fabian Stone Vault manuals into one operating map.

## Operator page

```txt
/vault
```

The operator dashboard links visible doors for manifest, health, ledger, approval, approval-audit, progress, outpost, and receipt evidence.

## Read doors

```txt
GET /api/vault/manifest
GET /api/vault/health
GET /api/vault/ledger
```

## Write doors

```txt
POST /api/execute
POST /api/approval
POST /api/approval/decision
POST /api/progress
POST /api/outpost/entry
GET  /api/outpost/entry/{id}/return
```

## Manuals

```txt
docs/VAULT_MANIFEST.md
docs/VAULT_HEALTH.md
docs/VAULT_LEDGER.md
docs/MEMORY_VAULT.md
docs/EXECUTION_MEMORY.md
docs/APPROVAL_VAULT.md
docs/APPROVAL_DECISION.md
docs/PROGRESS_VAULT.md
docs/OUTPOST_VAULT.md
docs/STONE_VAULT_DASHBOARD.md
```

## Database schema

```txt
infra/memory-vault.sql
```

Tables:

```txt
memory_records
approval_records
approval_decision_audit_records
progress_events
outpost_entries
receipt_records
```

## API law

```txt
Manifest is discovery.
Health is diagnosis.
Dashboard is visibility.
Ledger is evidence.
Approval creation is evidence.
Approval decision is explicit Violet Gate action.
Approval decision audit is transition evidence.
Progress is evidence.
Outpost routing is evidence.
Receipts are evidence.
Only Violet Gate can approve consequence-bearing execution.
```

## Operating loop

```txt
1. Open /vault for the operator dashboard.
2. Read /api/vault/manifest to discover available routes.
3. Read /api/vault/health to confirm durable tables are connected.
4. Submit work to /api/execute.
5. If the worker says needs approval, use /api/approval to create approval evidence.
6. Use /api/approval/decision to explicitly approve or reject the pending approval.
7. Inspect approval-audit rows through /api/vault/ledger?kind=approval-audit.
8. Record visible state with /api/progress.
9. Route round-trip records with /api/outpost/entry.
10. Inspect the total timeline with /api/vault/ledger.
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
→ Stone Vault Dashboard Manual
→ Stone Vault Operator Dashboard
→ Execution Worker API
→ Execution Memory Persistence
→ Approval Vault Persistence
→ Approval Decision API
→ Approval Decision Audit Vault
→ Progress Vault Persistence
→ Outpost Vault Persistence
→ Receipt Records
→ Violet Gate
→ Outpost 2099-2100
→ Return Door
→ Enclave
```
