# Stone Vault Health

Stone Vault Health is the diagnostic door for durable storage.

## Connected API

```txt
GET /api/vault/health
```

## Checked tables

```txt
memory_records
approval_records
progress_events
outpost_entries
receipt_records
```

## GET behavior

```txt
No DATABASE_URL
→ persistentStorage: false
→ every table reports DATABASE_URL not configured
```

```txt
DATABASE_URL present
→ each table is counted independently
→ ok: true only when every table check succeeds
→ status 503 when any table check fails
```

## Response shape

```txt
ok
system
persistentStorage
checks
law
```

Each check contains:

```txt
table
label
ok
count
error
```

## Example read

```bash
curl http://localhost:3000/api/vault/health
```

## Health is not approval

Health confirms that storage can be inspected. It does not authorize consequence-bearing execution.

```txt
vault health ok
≠ approved
```

```txt
table count visible
≠ approved
```

Approval still belongs to Violet Gate.

## Law

```txt
Health is diagnostic, not approval.
Missing database configuration is visible.
Each durable table reports independently.
Violet Gate still controls consequence-bearing execution.
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
→ Unified Vault Ledger Manual
→ Stone Vault Health API
→ Stone Vault Health Manual
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
