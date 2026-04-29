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
progress_events
outpost_entries
receipt_records
```

Each source table remains authoritative for its own record type. The ledger is a read model, not a replacement storage table.

## Ledger kinds

```txt
memory
approval
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
```

```txt
DATABASE_URL present
→ listVaultLedger() or listVaultLedgerByKind()
→ query()
→ mapVaultLedgerRow()
→ chronological ledger response
```

## Filters

```txt
/api/vault/ledger?kind=memory
/api/vault/ledger?kind=approval
/api/vault/ledger?kind=progress
/api/vault/ledger?kind=outpost
/api/vault/ledger?kind=receipt
/api/vault/ledger?limit=50
```

The `limit` parameter is bounded from 1 to 250.

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

## Example filtered read

```bash
curl http://localhost:3000/api/vault/ledger?kind=approval&limit=25
```

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

Approval still belongs to Violet Gate.

## Law

```txt
The ledger is a read model over durable vault tables.
Ledger rows are evidence, not approval.
Each source table remains the authority for its own record type.
The unified ledger exists so the Enclave can see time-ordered memory, approval, progress, outpost, and receipt records together.
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
