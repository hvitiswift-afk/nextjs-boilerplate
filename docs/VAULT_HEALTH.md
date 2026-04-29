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
approval_decision_audit_records
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

## Current labels

```txt
Memory Vault
Approval Vault
Approval Decision Audit Vault
Progress Vault
Outpost Vault
Receipt Vault
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

```txt
approval_decision_audit_records healthy
≠ executed
```

Approval still belongs to Violet Gate.

## Audit health

The Approval Decision Audit Vault check confirms that decision transition records can be counted.

```txt
approval_decision_audit_records
→ durable audit notes for Violet Gate decisions
→ diagnostic evidence only
```

A missing or failing audit table means local readiness is incomplete because persisted approval decisions are expected to leave an audit trail.

## Law

```txt
Health is diagnostic, not approval.
Missing database configuration is visible.
Each durable table reports independently.
Approval decision audit health is evidence, not authorization.
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
→ Approval Decision Audit Vault
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
