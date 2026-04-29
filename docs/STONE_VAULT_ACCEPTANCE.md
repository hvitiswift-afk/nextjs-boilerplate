# Stone Vault Acceptance Checklist

This checklist defines what must be true before the Goblin + Fabian Stone Vault is considered locally ready.

## Environment

```txt
[ ] DATABASE_URL is present when durable storage is required.
[ ] DATABASE_URL is absent only when transient seeded responses are acceptable.
[ ] No secrets are committed to source.
```

## Schema

```txt
[ ] infra/memory-vault.sql applies cleanly.
[ ] memory_records exists.
[ ] approval_records exists.
[ ] progress_events exists.
[ ] outpost_entries exists.
[ ] receipt_records exists.
[ ] indexes exist for chronological and filtered reads.
```

## Discovery

```txt
[ ] GET /api/vault/manifest returns ok: true.
[ ] Manifest lists health, ledger, execute, approval, approval decision, progress, outpost, and return routes.
[ ] Manifest marks /api/approval as approval-authority route for creating approval evidence.
[ ] Manifest marks /api/approval/decision as approval-authority route for explicit decisions.
[ ] Manifest does not treat health, ledger, progress, outpost, return, or manifest as approval.
```

## Health

```txt
[ ] GET /api/vault/health returns persistentStorage: true when DATABASE_URL is configured.
[ ] Each durable table returns an independent count.
[ ] Any table failure returns visible error evidence.
[ ] Health is not treated as approval.
```

## Execution

```txt
[ ] POST /api/execute accepts a read-only intent.
[ ] Read-only intent can proceed without approval.
[ ] POST /api/execute accepts a needs-approval intent.
[ ] Needs-approval intent without approvalId is blocked.
[ ] Blocked execution produces memory evidence.
[ ] Approved execution requires an approval identifier.
```

## Approval creation

```txt
[ ] GET /api/approval lists durable approval records when DATABASE_URL is configured.
[ ] POST /api/approval creates an approval record.
[ ] read-only approvals may auto-pass.
[ ] draft and needs-approval records remain pending unless explicitly decided.
[ ] Approval creation is visible evidence, not silent execution.
[ ] No silent approval occurs for needs-approval work.
```

## Approval decision

```txt
[ ] POST /api/approval/decision requires an approval id.
[ ] POST /api/approval/decision requires decidedBy evidence.
[ ] approved is accepted as a valid decision outcome.
[ ] rejected is accepted as a valid decision outcome.
[ ] unknown decision status falls back to rejected.
[ ] missing approval id returns 400.
[ ] missing approval record returns 404 when DATABASE_URL is configured.
[ ] already-decided approval returns 409 when DATABASE_URL is configured.
[ ] decided approval updates approval_records.status.
[ ] decided approval updates approval_records.decided_at.
[ ] Approval decision is explicit Violet Gate action, not silent execution.
```

## Progress

```txt
[ ] GET /api/progress returns durable progress events when DATABASE_URL is configured.
[ ] GET /api/progress?taskId=... filters by task.
[ ] POST /api/progress normalizes unknown step to log.
[ ] POST /api/progress normalizes unknown status to ready.
[ ] Progress records remain evidence, not approval.
```

## Outpost

```txt
[ ] POST /api/outpost/entry creates an outbound record.
[ ] POST /api/outpost/entry creates an inbound return record.
[ ] Response includes returnUrl.
[ ] GET /api/outpost/entry/{id}/return creates a return-door record.
[ ] Outpost records remain evidence, not approval.
```

## Ledger

```txt
[ ] GET /api/vault/ledger reads across memory_records.
[ ] GET /api/vault/ledger reads across approval_records.
[ ] GET /api/vault/ledger reads across progress_events.
[ ] GET /api/vault/ledger reads across outpost_entries.
[ ] GET /api/vault/ledger reads across receipt_records.
[ ] kind filters work for memory, approval, progress, outpost, and receipt.
[ ] approval decision transitions are visible through approval ledger rows.
[ ] limit is bounded.
[ ] Ledger rows remain evidence, not approval.
```

## Documentation

```txt
[ ] docs/STONE_VAULT_INDEX.md links the manuals.
[ ] docs/STONE_VAULT_QUICKSTART.md gives a first-run path.
[ ] docs/VAULT_MANIFEST.md documents discovery.
[ ] docs/VAULT_HEALTH.md documents diagnostics.
[ ] docs/VAULT_LEDGER.md documents unified reads.
[ ] docs/EXECUTION_MEMORY.md documents execution memory.
[ ] docs/APPROVAL_VAULT.md documents Violet Gate persistence.
[ ] docs/APPROVAL_DECISION.md documents explicit approval decisions.
[ ] docs/PROGRESS_VAULT.md documents Progress Lantern persistence.
[ ] docs/OUTPOST_VAULT.md documents Outpost round trips.
```

## Release law

```txt
Discovery does not authorize.
Health does not authorize.
Ledger visibility does not authorize.
Approval creation does not execute.
Approval decision does not silently execute.
Progress does not authorize.
Outpost return does not authorize.
Only Violet Gate can authorize consequence-bearing execution.
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
→ Stone Vault Acceptance Checklist
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
