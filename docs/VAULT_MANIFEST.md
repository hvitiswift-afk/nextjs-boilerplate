# Stone Vault Manifest

The Stone Vault Manifest is the discoverability map for the Goblin + Fabian Stone Vault.

## Connected API

```txt
GET /api/vault/manifest
```

## Core module

```txt
lib/vault-manifest.ts
```

## Purpose

The manifest lists the durable routes, their methods, their purposes, and whether they carry approval authority.

```txt
getVaultManifest()
→ system
→ version
→ endpoints
→ law
→ spine
```

## Endpoint shape

Each manifest endpoint contains:

```txt
name
method
path
purpose
approvalAuthority
```

## Current manifest routes

```txt
GET  /api/vault/health
GET  /api/vault/ledger
POST /api/execute
POST /api/approval
POST /api/progress
POST /api/outpost/entry
GET  /api/outpost/entry/{id}/return
```

## Approval authority

Only the Approval Gate / Violet Gate carries approval authority.

```txt
/api/approval
→ approvalAuthority: true
```

All other manifest routes are evidence, diagnostics, routing, or discoverability.

```txt
health
ledger
execute
progress
outpost
return
manifest
≠ approval by themselves
```

## Example read

```bash
curl http://localhost:3000/api/vault/manifest
```

## Law

```txt
The manifest is a map, not an authorization.
Only Violet Gate can approve consequence-bearing execution.
Health, ledger, progress, outpost, and receipt records are evidence.
Every durable route should be discoverable without guessing.
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
→ Execution Worker API
→ Execution Memory Persistence
→ Approval Vault Persistence
→ Progress Vault Persistence
→ Outpost Vault Persistence
→ Receipt Records
→ Violet Gate
→ Outpost 2099-2100
→ Return Door
→ Enclave
```
