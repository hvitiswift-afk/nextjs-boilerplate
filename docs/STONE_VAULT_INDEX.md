# Stone Vault Index

This index links the current Goblin + Fabian Stone Vault manuals into one operating map.

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
```

## Database schema

```txt
infra/memory-vault.sql
```

Tables:

```txt
memory_records
approval_records
progress_events
outpost_entries
receipt_records
```

## API law

```txt
Manifest is discovery.
Health is diagnosis.
Ledger is evidence.
Approval creation is evidence.
Approval decision is explicit Violet Gate action.
Progress is evidence.
Outpost routing is evidence.
Receipts are evidence.
Only Violet Gate can approve consequence-bearing execution.
```

## Operating loop

```txt
1. Read /api/vault/manifest to discover available routes.
2. Read /api/vault/health to confirm durable tables are connected.
3. Submit work to /api/execute.
4. If the worker says needs approval, use /api/approval to create approval evidence.
5. Use /api/approval/decision to explicitly approve or reject the pending approval.
6. Record visible state with /api/progress.
7. Route round-trip records with /api/outpost/entry.
8. Inspect the total timeline with /api/vault/ledger.
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
→ Execution Worker API
→ Execution Memory Persistence
→ Approval Vault Persistence
→ Approval Decision API
→ Progress Vault Persistence
→ Outpost Vault Persistence
→ Receipt Records
→ Violet Gate
→ Outpost 2099-2100
→ Return Door
→ Enclave
```
