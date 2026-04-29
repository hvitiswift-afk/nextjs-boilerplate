# Stone Vault Quickstart

This quickstart gives the shortest path for running the current Goblin + Fabian Stone Vault locally.

## 1. Configure environment

Create a local environment file with a Postgres connection string when durable storage is wanted.

```bash
DATABASE_URL=postgres://user:password@localhost:5432/goblin_vault
```

Without `DATABASE_URL`, the APIs still respond, but they return seeded or transient records.

## 2. Apply schema

Run the vault schema against Postgres.

```bash
psql "$DATABASE_URL" -f infra/memory-vault.sql
```

This creates:

```txt
memory_records
approval_records
progress_events
outpost_entries
receipt_records
```

## 3. Start the app

```bash
npm install
npm run dev
```

The local server should expose the Next.js API routes.

## 4. Discover routes

```bash
curl http://localhost:3000/api/vault/manifest
```

This returns the route map, law, and spine.

## 5. Check storage health

```bash
curl http://localhost:3000/api/vault/health
```

Expected with Postgres connected:

```txt
persistentStorage: true
ok: true when every table check succeeds
```

Expected without Postgres:

```txt
persistentStorage: false
DATABASE_URL is not configured
```

## 6. Submit an execution intent

Read-only example:

```bash
curl -X POST http://localhost:3000/api/execute \
  -H "content-type: application/json" \
  -d '{
    "id": "execute-demo-readonly",
    "title": "Read the manifest",
    "description": "Inspect available Stone Vault routes.",
    "risk": "read-only",
    "requestedBy": "manual"
  }'
```

Consequence-bearing example:

```bash
curl -X POST http://localhost:3000/api/execute \
  -H "content-type: application/json" \
  -d '{
    "id": "execute-demo-gated",
    "title": "Deploy gated work",
    "description": "Attempt work that requires visible approval before execution.",
    "risk": "needs-approval",
    "requestedBy": "manual"
  }'
```

The second example should route to `/api/approval` unless an approval identifier is present.

## 7. Create an approval record

```bash
curl -X POST http://localhost:3000/api/approval \
  -H "content-type: application/json" \
  -d '{
    "id": "approval-demo-gated",
    "taskId": "execute-demo-gated",
    "risk": "needs-approval",
    "requestedAction": "Approve the gated demo execution."
  }'
```

Approval records are visible evidence. Silent approval is not allowed for `needs-approval` work.

## 8. Decide the approval record

Approve example:

```bash
curl -X POST http://localhost:3000/api/approval/decision \
  -H "content-type: application/json" \
  -d '{
    "id": "approval-demo-gated",
    "status": "approved",
    "decidedBy": "manual-operator",
    "note": "Approved after reviewing the gated demo execution."
  }'
```

Reject example:

```bash
curl -X POST http://localhost:3000/api/approval/decision \
  -H "content-type: application/json" \
  -d '{
    "id": "approval-demo-gated",
    "status": "rejected",
    "decidedBy": "manual-operator",
    "note": "Rejected because the request was not ready."
  }'
```

Approval decisions update pending approval records. They do not silently execute work.

## 9. Record progress

```bash
curl -X POST http://localhost:3000/api/progress \
  -H "content-type: application/json" \
  -d '{
    "id": "progress-demo-verify",
    "taskId": "execute-demo-gated",
    "step": "verify",
    "status": "complete",
    "message": "Verified the gated execution path."
  }'
```

Progress records are evidence, not approval.

## 10. Send an Outpost round trip

```bash
curl -X POST http://localhost:3000/api/outpost/entry \
  -H "content-type: application/json" \
  -d '{
    "id": "outpost-demo-trip",
    "kind": "memory",
    "payload": {
      "message": "Carry this record to Outpost 2099-2100 and back."
    }
  }'
```

The response includes a return URL.

## 11. Inspect the unified ledger

```bash
curl http://localhost:3000/api/vault/ledger?limit=25
```

Filter by kind:

```bash
curl http://localhost:3000/api/vault/ledger?kind=approval&limit=25
curl http://localhost:3000/api/vault/ledger?kind=progress&limit=25
curl http://localhost:3000/api/vault/ledger?kind=outpost&limit=25
```

## Quick law

```txt
Manifest is discovery.
Health is diagnosis.
Ledger is evidence.
Approval creation is evidence.
Approval decision is explicit Violet Gate action.
Progress is evidence.
Outpost routing is evidence.
Only Violet Gate can approve consequence-bearing execution.
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
→ Stone Vault Quickstart
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
