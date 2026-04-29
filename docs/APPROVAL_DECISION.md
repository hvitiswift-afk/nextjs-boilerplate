# Approval Decision

Approval Decision is the explicit decision layer for Violet Gate.

## Connected API

```txt
POST /api/approval/decision
```

## Core module

```txt
lib/approval-decision-sql.ts
```

## Purpose

The decision route updates an existing pending approval record to either `approved` or `rejected`.

Approval creation and approval decision are intentionally separate.

```txt
POST /api/approval
→ creates approval evidence
```

```txt
POST /api/approval/decision
→ decides pending approval evidence
```

## Decision outcomes

```txt
approved
rejected
```

Unknown decision status safely falls back to:

```txt
rejected
```

## Decision flow

```txt
raw request body
→ createApprovalDecision()
→ normalize approved/rejected
→ require approval id
→ require decidedBy evidence
→ getApprovalRecord()
→ block missing approvals
→ block already-decided approvals
→ decideApprovalRecord()
→ update approval_records.status
→ update approval_records.decided_at
→ return memoryPayload evidence
```

## Safety behavior

```txt
missing id
→ 400
→ Violet Gate cannot decide
```

```txt
approval not found
→ 404
→ Violet Gate remains closed
```

```txt
approval already decided
→ 409
→ no silent overwrite
```

```txt
unknown status
→ rejected
```

## Example approve

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

## Example reject

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

## Decision is not execution

An approved decision is evidence that a matching gated task may proceed. It does not silently execute the task.

```txt
approval approved
≠ executed
```

```txt
approval rejected
→ Violet Gate remains closed
```

## Law

```txt
Only approved or rejected are valid decision outcomes.
Unknown decision status falls back to rejected.
Every decision requires visible decidedBy evidence.
Approval decisions update approval_records but do not silently execute work.
```

## Current spine

```txt
HyperIntent
→ Provider Adapter Hall
→ Provider Memory
→ Memory Vault
→ Stone Vault Schema Indexes
→ Unified Vault Ledger Read Model
→ Stone Vault Roadmap
→ Phase 2 Decision Records
→ Approval Decision SQL Helpers
→ Approval Decision API
→ Approval Decision Manual
→ Approval Vault Persistence
→ Violet Gate
→ Outpost 2099-2100
→ Return Door
→ Enclave
```
