# Execution Memory

Execution Memory records every decision made by the Approval-Gated Execution Worker.

## Core module

```txt
lib/execution-memory.ts
```

## Connected API

```txt
POST /api/execute
```

## Purpose

The Execution Worker decides whether an intent can proceed. Execution Memory makes that decision durable and inspectable.

```txt
ExecutionIntent
→ decideExecution()
→ ExecutionDecision
→ executionDecisionToMemory()
→ MemoryVaultRecord
→ optional insertMemoryRecord()
→ memory_records
```

## Stored payload

Each execution memory contains:

```txt
intent
decision
openLoop: true
approvalPath: /api/approval
progressPath: /api/progress
executePath: /api/execute
```

## Tags

Execution records are tagged with:

```txt
execution
worker
risk level
gate state
can-execute or blocked
```

## Persistence behavior

```txt
No DATABASE_URL
→ POST /api/execute returns memory in the response
→ persistentStorage: false
```

```txt
DATABASE_URL present
→ POST /api/execute writes memory to memory_records
→ persistentStorage: true
```

## Why blocked decisions are stored

Blocked work is important evidence. It shows the gate was active, the risk was detected, and the next path was approval rather than silent execution.

```txt
needs-approval without approvalId
→ blocked
→ memory record created
→ next: /api/approval
```

## Why approved decisions are stored

Approved work is also evidence. It shows that execution crossed Violet Gate with an approval identifier.

```txt
needs-approval with approvalId
→ violet-gate
→ memory record created
→ next: /api/progress
```

## Law

```txt
Every execution decision can become a Memory Vault record.
Blocked decisions are remembered as clearly as approved decisions.
Consequence-bearing work remains approval-gated.
Each execution memory receives an Outpost return path.
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
→ Violet Gate
→ Progress Lantern
→ Outpost 2099-2100
→ Return Door
→ Enclave
```
