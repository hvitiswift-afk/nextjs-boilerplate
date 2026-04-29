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

## Durable tables

```txt
approval_records
approval_decision_audit_records
```

## Purpose

The decision route updates an existing pending approval record to either `approved` or `rejected`, then writes a durable audit note for the transition.

Approval creation, approval decision, and approval audit are intentionally separate visible acts.

```txt
POST /api/approval
→ creates approval evidence
```

```txt
POST /api/approval/decision
→ decides pending approval evidence
→ writes approval decision audit evidence
```

```txt
GET /api/vault/ledger?kind=approval-audit
→ inspects approval decision audit evidence
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
→ createApprovalDecisionAuditInput()
→ insertApprovalDecisionAuditRecord()
→ write approval_decision_audit_records
→ return approval + audit + memoryPayload evidence
```

## Audit payload

Each persisted decision receives an audit row with:

```txt
id
approval_id
task_id
previous_status
decision_status
decided_by
note
payload
created_at
```

Audit payload includes the normalized decision, updated approval record, and decision law.

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

```txt
audit insert fails
→ 503
→ decision response is not reported as complete
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

## Example audit inspection

```bash
curl http://localhost:3000/api/vault/ledger?kind=approval-audit&limit=25
curl http://localhost:3000/api/vault/ledger?approvalId=approval-demo-gated&limit=25
curl http://localhost:3000/api/vault/ledger?kind=approval-audit&status=approved&limit=25
curl http://localhost:3000/api/vault/ledger?kind=approval-audit&status=rejected&limit=25
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

```txt
audit row visible
≠ executed
```

## Law

```txt
Only approved or rejected are valid decision outcomes.
Unknown decision status falls back to rejected.
Every decision requires visible decidedBy evidence.
Every persisted decision receives a durable audit note.
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
→ Approval Decision Audit Vault
→ Approval Decision Manual
→ Approval Vault Persistence
→ Unified Vault Ledger Audit Rows
→ Violet Gate
→ Outpost 2099-2100
→ Return Door
→ Enclave
```
