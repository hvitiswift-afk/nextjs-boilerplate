# Unified Vault Ledger

The Unified Vault Ledger is the read door for the Stone Vault.

## Connected API

```txt
GET /api/vault/ledger
```

## Core module

```txt
lib/vault-ledger-sql.ts
```

## Source tables

The ledger reads across these durable vault tables:

```txt
memory_records
approval_records
approval_decision_audit_records
progress_events
outpost_entries
receipt_records
```

Each source table remains authoritative for its own record type. The ledger is a read model, not a replacement storage table.

## Ledger kinds

```txt
memory
approval
approval-audit
progress
outpost
receipt
```

## GET behavior

```txt
No DATABASE_URL
→ rows: []
→ persistentStorage: false
→ explanatory message returned
→ accepted filters are returned
```

```txt
DATABASE_URL present
→ listVaultLedgerFiltered()
→ query()
→ mapVaultLedgerRow()
→ filtered chronological ledger response
```

## Filters

```txt
/api/vault/ledger?kind=memory
/api/vault/ledger?kind=approval
/api/vault/ledger?kind=approval-audit
/api/vault/ledger?kind=progress
/api/vault/ledger?kind=outpost
/api/vault/ledger?kind=receipt
/api/vault/ledger?status=pending
/api/vault/ledger?status=approved
/api/vault/ledger?status=rejected
/api/vault/ledger?taskId=execute-demo-gated
/api/vault/ledger?approvalId=approval-demo-gated
/api/vault/ledger?kind=approval&status=approved
/api/vault/ledger?kind=approval-audit&status=approved
/api/vault/ledger?kind=approval-audit&approvalId=approval-demo-gated
/api/vault/ledger?kind=progress&taskId=execute-demo-gated
/api/vault/ledger?limit=50
```

The `limit` parameter is bounded from 1 to 250.

## Filter meaning

```txt
kind
→ narrows by ledger row type
```

```txt
status
→ narrows by row status evidence
```

```txt
taskId
→ narrows rows whose payload.taskId matches the requested task
```

```txt
approvalId
→ narrows rows whose payload.approvalId matches the requested approval record
```

```txt
limit
→ narrows the number of returned rows
```

Filters narrow evidence. They do not grant approval.

## Row shape

```txt
id
kind
title
status
sourceTable
payload
createdAt
```

## Example read

```bash
curl http://localhost:3000/api/vault/ledger?limit=25
```

## Example filtered reads

```bash
curl http://localhost:3000/api/vault/ledger?kind=approval&limit=25
curl http://localhost:3000/api/vault/ledger?kind=approval-audit&limit=25
curl http://localhost:3000/api/vault/ledger?status=pending&limit=25
curl http://localhost:3000/api/vault/ledger?taskId=execute-demo-gated&limit=25
curl http://localhost:3000/api/vault/ledger?approvalId=approval-demo-gated&limit=25
curl http://localhost:3000/api/vault/ledger?kind=approval&status=approved&limit=25
curl http://localhost:3000/api/vault/ledger?kind=approval-audit&status=rejected&limit=25
curl http://localhost:3000/api/vault/ledger?kind=progress&taskId=execute-demo-gated&limit=25
```

## Approval decision inspection

Approval decisions can be inspected through approval ledger rows and audit ledger rows.

```txt
kind=approval&status=pending
→ pending approval evidence
```

```txt
kind=approval&status=approved
→ explicitly approved approval evidence
```

```txt
kind=approval&status=rejected
→ explicitly rejected approval evidence
```

```txt
kind=approval-audit
→ decision transition audit evidence
```

```txt
kind=approval-audit&approvalId=approval-demo-gated
→ audit trail for one approval record
```

```txt
kind=approval-audit&status=approved
→ approved decision transitions
```

```txt
kind=approval-audit&status=rejected
→ rejected decision transitions
```

```txt
taskId=execute-demo-gated
→ evidence trail for the matching task across source tables that emit taskId
```

## Approval audit payload

Approval audit rows include:

```txt
approvalId
taskId
previousStatus
decisionStatus
decidedBy
note
payload
```

The audit payload shows what Violet Gate changed and who made the decision.

## Ledger is not approval

The ledger can show approval records, but it does not grant approval.

```txt
ledger row visible
≠ approved
```

```txt
progress complete in ledger
≠ approved
```

```txt
outpost return recorded in ledger
≠ approved
```

```txt
status filter says approved
≠ executed
```

```txt
audit row visible
≠ executed
```

Approval still belongs to Violet Gate.

## Law

```txt
The ledger is a read model over durable vault tables.
Ledger rows are evidence, not approval.
Each source table remains the authority for its own record type.
Status, task, and approval filters narrow evidence without changing authorization.
Approval decision audit rows show Violet Gate transition evidence.
The unified ledger exists so the Enclave can see time-ordered memory, approval, audit, progress, outpost, and receipt records together.
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
→ Approval Decision Audit Ledger Rows
→ Unified Vault Ledger API
→ Unified Vault Ledger Manual
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
