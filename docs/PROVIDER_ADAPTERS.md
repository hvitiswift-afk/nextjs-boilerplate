# Provider Adapter Hall

The Provider Adapter Hall routes model work through explicit, inspectable decisions before any consequence-bearing execution.

## API

```txt
GET  /api/provider
POST /api/provider
```

## Providers

```txt
openai
anthropic
grok
local
fabian
goblin
```

## Capabilities

```txt
chat
planning
routing
summarizing
code-draft
local-only
```

## GET behavior

`GET /api/provider` returns configured providers, enabled status, capabilities, safety metadata, and whether persistent storage is available.

```txt
persistentStorageAvailable: true | false
```

## POST behavior

`POST /api/provider` accepts an intent and optional routing hints.

```json
{
  "id": "provider-demo",
  "intent": "Plan a reversible deployment draft.",
  "preferredProvider": "fabian",
  "requiredCapability": "planning"
}
```

It returns:

```txt
decision
memory
persistentStorage
next
```

## Decision flow

```txt
ProviderRouteRequest
→ chooseProvider()
→ ProviderRouteDecision
→ providerDecisionToMemory()
→ MemoryVaultRecord
→ optional insertMemoryRecord()
→ /api/approval or /api/progress
```

## Persistence behavior

```txt
No DATABASE_URL
→ decision is returned as a MemoryVaultRecord
→ persistentStorage: false
```

```txt
DATABASE_URL present
→ decision is returned as a MemoryVaultRecord
→ insertMemoryRecord(memory)
→ memory_records table
→ persistentStorage: true
```

## Open Loop law

```txt
Secrets stay in environment variables.
Provider execution is routed, logged, and approval-gated.
Local providers may run without external service calls.
Goblin routes; Fabian plans; external LLMs draft only inside the Open Loop.
```

## Example curl

```bash
curl -X POST http://localhost:3000/api/provider \
  -H "content-type: application/json" \
  -d '{
    "id": "provider-first-stone",
    "intent": "Draft a safe reversible deployment plan.",
    "preferredProvider": "fabian",
    "requiredCapability": "planning"
  }'
```

## Return path

Every provider decision memory receives an Outpost return path:

```txt
/api/outpost/entry/provider-memory-{id}/return
```

## Current spine

```txt
HyperIntent
→ Provider Adapter Hall
→ Provider Memory
→ Memory Vault
→ Stone Vault
→ Violet Gate
→ Progress Lantern
→ Outpost 2099-2100
→ Return Door
→ Enclave
```
