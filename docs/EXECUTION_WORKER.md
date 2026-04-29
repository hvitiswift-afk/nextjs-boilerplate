# Approval-Gated Execution Worker

The Execution Worker is the Enclave boundary for deciding whether an intent can proceed.

## API

```txt
GET  /api/execute
POST /api/execute
```

## Core module

```txt
lib/execution-worker.ts
```

## Risk levels

```txt
read-only
```

Read-only work can proceed directly into progress logging.

```txt
draft
```

Draft-only work can proceed when it creates no external consequence.

```txt
needs-approval
```

Consequence-bearing work must have a Violet Gate approval record first.

## POST example

```bash
curl -X POST http://localhost:3000/api/execute \
  -H "content-type: application/json" \
  -d '{
    "id": "execute-demo",
    "title": "Draft deployment receipt",
    "description": "Create a reversible deployment plan without publishing it.",
    "risk": "draft",
    "requestedBy": "fabian"
  }'
```

## Approval-required example

```bash
curl -X POST http://localhost:3000/api/execute \
  -H "content-type: application/json" \
  -d '{
    "id": "execute-live-demo",
    "title": "Deploy live site",
    "description": "Publish the current app to a live provider.",
    "risk": "needs-approval",
    "requestedBy": "provider"
  }'
```

This returns:

```txt
ok: false
next: /api/approval
```

## Approved example

```bash
curl -X POST http://localhost:3000/api/execute \
  -H "content-type: application/json" \
  -d '{
    "id": "execute-live-approved-demo",
    "title": "Deploy live site after approval",
    "description": "Publish only after Violet Gate approval exists.",
    "risk": "needs-approval",
    "requestedBy": "provider",
    "approvalId": "approval-demo"
  }'
```

This returns:

```txt
ok: true
next: /api/progress
```

## Decision flow

```txt
ExecutionIntent
→ decideExecution()
→ ExecutionDecision
→ /api/progress or /api/approval
```

## Law

```txt
Read-only work can proceed into progress logging.
Draft work can proceed when it creates no external consequence.
Consequence-bearing execution requires Violet Gate approval.
Every execution decision is visible before action.
```

## Current spine

```txt
HyperIntent
→ Provider Adapter Hall
→ Provider Memory
→ Memory Vault
→ Stone Vault
→ Execution Worker API
→ Violet Gate
→ Progress Lantern
→ Outpost 2099-2100
→ Return Door
→ Enclave
```
