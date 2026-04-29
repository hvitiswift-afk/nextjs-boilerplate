# Approval Vault

The Approval Vault is the durable record layer for Violet Gate decisions.

## Connected API

```txt
GET  /api/approval
POST /api/approval
```

## Core adapter

```txt
lib/approval-vault-sql.ts
```

## Database table

```txt
approval_records
```

## GET behavior

```txt
No DATABASE_URL
→ returns seeded approval records
→ persistentStorage: false
```

```txt
DATABASE_URL present
→ listApprovalRecords(50)
→ approval_records table
→ mapApprovalRow()
→ persistentStorage: true
```

## POST behavior

```txt
ApprovalRecord
→ insertApprovalRecord()
→ approval_records table
→ saved approval returned
```

## Risk behavior

```txt
read-only
→ status: approved
→ decidedAt set immediately
```

```txt
draft
→ status: pending
→ requires visible approval path before consequence-bearing execution
```

```txt
needs-approval
→ status: pending
→ Violet Gate remains closed until an approval is explicitly decided
```

## Safety law

```txt
Approval records are stored separately from memory notes.
Read-only approval may auto-pass, but consequence-bearing work remains gated.
Decisions are timestamped when approval status is known.
No silent approval for needs-approval tasks.
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
→ Violet Gate
→ Progress Lantern
→ Outpost 2099-2100
→ Return Door
→ Enclave
```
