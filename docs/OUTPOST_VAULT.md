# Outpost Vault

The Outpost Vault is the durable record layer for Outpost 2099-2100 round trips.

## Connected API

```txt
GET  /api/outpost/entry
POST /api/outpost/entry
```

## Core modules

```txt
lib/outpost-entry.ts
lib/outpost-vault-sql.ts
```

## Database table

```txt
outpost_entries
```

## Entry directions

```txt
to-outpost
from-outpost
round-trip
```

## GET behavior

```txt
No DATABASE_URL
→ returns bridge status
→ persistentStorage: false
```

```txt
DATABASE_URL present
→ listOutpostEntries(50)
→ outpost_entries table
→ mapOutpostRow()
→ persistentStorage: true
```

## POST behavior

```txt
raw entry body
→ roundTrip()
→ outbound entry
→ inbound return entry
→ optional insertOutpostEntry()
→ returnUrl
```

## Durable round trip

```txt
Outpost payload
→ outbound: enclave → outpost-2099-2100
→ inbound: outpost-2099-2100 → enclave
→ outpost_entries table
→ /api/outpost/entry/{id}/return
```

## Example write

```bash
curl -X POST http://localhost:3000/api/outpost/entry \
  -H "content-type: application/json" \
  -d '{
    "id": "outpost-demo-trip",
    "kind": "memory",
    "payload": {
      "message": "Carry this record to the Outpost and back."
    }
  }'
```

## Outpost is not approval

An Outpost entry is evidence of routing and return. It does not authorize consequence-bearing execution.

```txt
outpost entry complete
≠ approved
```

Approval still belongs to Violet Gate.

## Law

```txt
Every Outpost entry has a direction.
Round trips carry a return path.
Outpost records are durable evidence, not approval.
The Enclave can always ask where an entry came from and where it returns.
```

## Current spine

```txt
HyperIntent
→ Provider Adapter Hall
→ Provider Memory
→ Memory Vault
→ Stone Vault
→ Execution Worker API
→ Execution Memory Persistence
→ Approval Vault SQL Adapter
→ Approval Gate Persistence
→ Progress Vault SQL Adapter
→ Progress Event Builder
→ Progress Lantern Read/Write Persistence
→ Outpost Vault SQL Adapter
→ Outpost Entry Bridge Persistence
→ Outpost Vault Manual
→ Violet Gate
→ Outpost 2099-2100
→ Return Door
→ Enclave
```
