# Goblin LLM Observer Route CI Plan

Receipt: `receipt-observer-route-ci-017`

This file defines the next verification layer after the observer route harness.

## Purpose

Turn the observer route scenario rail into a CI-ready check without adding a test framework yet.

## Current command

```bash
npm run observer:routes
```

This prints the curl commands for manual route checks.

## Next CI shape

1. Start the Next.js app.
2. Call `POST /api/llm/observer-route` for each scenario in `examples/observer-route-scenarios.sample.json`.
3. Assert the returned `matchedConstellationId` equals `expectedConstellationId`.
4. Assert the returned `route` equals `expectedRoute`.
5. Emit one receipt per scenario.

## Future command

```bash
npm run observer:routes:check
```

## Receipt shape

```json
{
  "id": "receipt-observer-route-ci-017",
  "kind": "llm-observer-route-ci-plan",
  "status": "planned",
  "source": "examples/observer-route-scenarios.sample.json",
  "api": "/api/llm/observer-route",
  "law": "Every observer route scenario should be executable, checkable, and receipt-bound."
}
```
