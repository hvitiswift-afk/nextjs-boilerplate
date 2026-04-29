# Progress Vault

The Progress Vault is the durable record layer for the Progress Lantern.

## Connected API

```txt
GET  /api/progress
POST /api/progress
```

## Core modules

```txt
lib/progress-vault-sql.ts
lib/progress-event-builder.ts
```

## Database table

```txt
progress_events
```

## GET behavior

```txt
No DATABASE_URL
→ returns seeded progress events
→ optional taskId filter
→ persistentStorage: false
```

```txt
DATABASE_URL present
→ listProgressEvents(50) or listProgressEventsForTask(taskId, 50)
→ progress_events table
→ mapProgressRow()
→ persistentStorage: true
```

## POST behavior

```txt
raw request body
→ createProgressEvent()
→ normalized ProgressEvent
→ insertProgressEvent()
→ progress_events table
→ mapProgressRow()
→ response
```

## Event normalization

Unknown or missing values are made safe before storage.

```txt
unknown step
→ log
```

```txt
unknown status
→ ready
```

```txt
missing taskId
→ manual-task
```

```txt
missing message
→ Progress event recorded.
```

## Example write

```bash
curl -X POST http://localhost:3000/api/progress \
  -H "content-type: application/json" \
  -d '{
    "id": "progress-demo-write",
    "taskId": "outpost-demo",
    "step": "verify",
    "status": "complete",
    "message": "Verified the Progress Lantern write path."
  }'
```

## Progress is not approval

A progress event is evidence of state. It does not authorize consequence-bearing execution.

```txt
progress ready
≠ approved
```

```txt
progress complete
≠ approved
```

Approval still belongs to Violet Gate.

## Law

```txt
Progress input is normalized before storage.
Unknown steps fall back to log.
Unknown statuses fall back to ready.
Progress events remain evidence, not approval.
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
→ Progress Lantern Read Persistence
→ Progress Lantern Write Persistence
→ Progress Vault Manual
→ Violet Gate
→ Outpost 2099-2100
→ Return Door
→ Enclave
```
