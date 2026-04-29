# Stone Vault Operator Dashboard

The Stone Vault Operator Dashboard is the first Phase 3 inspection page for the Goblin + Fabian Stone Vault.

## Connected page

```txt
/vault
```

## Source file

```txt
app/vault/page.tsx
```

## Home link

```txt
app/page.tsx
→ Vault Dashboard
→ /vault
```

## Purpose

The dashboard gives an operator visible doors into the Vault without requiring curl for every inspection.

```txt
manifest
health
ledger
approval ledger filters
approval audit filters
progress filters
outpost filters
receipt filters
```

## Read doors

```txt
GET /api/vault/manifest
GET /api/vault/health
GET /api/vault/ledger?limit=25
```

## Ledger filter doors

```txt
/api/vault/ledger?kind=approval&limit=25
/api/vault/ledger?kind=approval-audit&limit=25
/api/vault/ledger?status=pending&limit=25
/api/vault/ledger?status=approved&limit=25
/api/vault/ledger?status=rejected&limit=25
/api/vault/ledger?kind=progress&limit=25
/api/vault/ledger?kind=outpost&limit=25
/api/vault/ledger?kind=receipt&limit=25
```

## Operator cards

```txt
Violet Gate
→ explicit approval only
```

```txt
Audit Vault
→ transition evidence
```

```txt
Ledger View
→ evidence only
```

## Dashboard is not approval

The dashboard helps an operator inspect the Vault, but it does not authorize consequence-bearing work.

```txt
dashboard visible
≠ approved
```

```txt
health ok
≠ approved
```

```txt
ledger row visible
≠ approved
```

```txt
audit row visible
≠ executed
```

Approval still belongs to Violet Gate.

## Operator law

```txt
Dashboard visibility does not authorize execution.
Health is diagnostic, not approval.
Ledger rows are evidence, not approval.
Approval decision audit rows are transition evidence, not execution.
Only Violet Gate authorizes consequence-bearing work.
```

## Current spine

```txt
HyperIntent
→ Provider Adapter Hall
→ Provider Memory
→ Memory Vault
→ Stone Vault Schema Indexes
→ Unified Vault Ledger Read Model
→ Ledger Status Filters
→ Ledger Task Filters
→ Ledger Approval Filters
→ Approval Decision Audit Records
→ Unified Vault Ledger API
→ Stone Vault Health API
→ Vault Manifest
→ Stone Vault Index
→ Stone Vault Quickstart
→ Stone Vault Acceptance Checklist
→ Stone Vault Roadmap
→ Phase 2 Complete
→ Phase 3 Operator Dashboard
→ Home Page Vault Link
→ /vault Dashboard Page
→ Violet Gate
→ Outpost 2099-2100
→ Return Door
→ Enclave
```
