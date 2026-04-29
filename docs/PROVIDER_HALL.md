# Provider Hall

Provider Hall is Phase 4 of the Goblin + Fabian Stone Vault.

It defines how model/provider calls enter the system without leaking secrets, skipping receipts, or bypassing Violet Gate.

## Purpose

```txt
Provider Hall = adapter boundary + request evidence + response evidence + receipt evidence + approval boundary
```

The Provider Hall does not make model output sovereign.

```txt
model output
≠ approval
```

```txt
provider receipt
≠ execution authorization
```

## Phase 4 goals

```txt
[ ] Define provider adapter interface.
[ ] Add local mock provider adapter.
[ ] Add OpenAI-compatible adapter boundary without committing secrets.
[ ] Add model/provider memory records.
[ ] Record provider receipts in receipt_records.
[ ] Connect provider receipts to the ML evidence lane.
```

## Adapter interface draft

```ts
type ProviderRisk = "low" | "needs-approval" | "blocked";

type ProviderRequest = {
  id: string;
  taskId: string;
  provider: string;
  model: string;
  purpose: string;
  inputSummary: string;
  risk: ProviderRisk;
  requestedBy: string;
};

type ProviderResponse = {
  id: string;
  taskId: string;
  provider: string;
  model: string;
  outputSummary: string;
  receiptId: string;
  status: "complete" | "failed" | "pending";
  createdAt: string;
};

type ProviderReceipt = {
  id: string;
  taskId: string;
  provider: string;
  model: string;
  status: "complete" | "failed" | "pending";
  requestId: string;
  responseId?: string;
  costEstimate?: string;
  note?: string;
  createdAt: string;
};
```

## Adapter laws

```txt
No provider adapter receives secrets from source code.
No provider adapter writes hidden execution.
No provider adapter converts model output into approval.
No provider adapter bypasses approval records.
No provider adapter bypasses receipts.
No provider adapter stores full sensitive payloads when summaries are enough.
```

## Local mock provider

The first adapter should be local and deterministic.

```txt
mock-provider
→ accepts a ProviderRequest
→ returns a ProviderResponse
→ writes a ProviderReceipt
→ never calls an external model
→ never requires secrets
```

This gives the Vault a safe rehearsal path before any external provider is connected.

## OpenAI-compatible adapter boundary

The external adapter boundary should remain secret-free in source.

```txt
OPENAI_API_KEY
→ environment variable only
→ never committed
→ never echoed in receipts
→ never returned to dashboard
```

The adapter may record:

```txt
provider name
model name
request id
response id
task id
status
createdAt
cost estimate when available
summary of input/output
```

The adapter must not record:

```txt
secret values
raw credentials
private tokens
unbounded sensitive prompts
unbounded sensitive completions
```

## ML evidence lane connection

Provider receipts must become visible through the existing ML evidence lane.

```txt
/vault
→ ML evidence lane
→ ML provider receipts
→ /api/vault/ledger?kind=receipt&limit=25
```

## Violet Gate boundary

Provider Hall can propose, summarize, and return evidence.

Provider Hall cannot authorize consequence-bearing work.

```txt
provider proposes
operator reviews
Violet Gate decides
ledger records
receipt reconciles
```

## Acceptance checks

```txt
[ ] Mock provider can return a deterministic response without secrets.
[ ] Provider request contains a taskId.
[ ] Provider response contains a receiptId.
[ ] Provider receipt appears in the unified ledger.
[ ] ML evidence lane can inspect provider receipt rows.
[ ] Needs-approval provider tasks require Violet Gate before consequence-bearing execution.
[ ] Secrets are not stored in source, memory rows, receipts, or dashboard output.
```

## Current spine

```txt
HyperIntent
→ Provider Adapter Hall
→ Provider Memory
→ Memory Vault
→ Provider Hall
→ Provider Adapter Interface
→ Local Mock Provider
→ Provider Receipts
→ ML Evidence Lane
→ Violet Gate
→ Stone Vault Dashboard
→ Enclave
```
