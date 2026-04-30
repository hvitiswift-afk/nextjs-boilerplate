# Goblin LLM Observer Route Release Runbook

Receipt: `receipt-observer-route-release-021`

This runbook turns the observer route rail into a repeatable release ritual.

## Preflight

```bash
npm install
npm run build
npm run observer:routes
```

## Local gate

Start the app:

```bash
npm run dev
```

Then run the route checker in another terminal:

```bash
npm run observer:routes:check
```

## CI gate

The GitHub Actions workflow is:

```txt
.github/workflows/observer-routes.yml
```

It builds the app, starts it, waits for `/api/llm/observer-constellations`, and runs:

```bash
npm run observer:routes:check
```

## Release rule

A release may proceed when:

```txt
build passes
observer route checker passes
CI workflow passes
README points to the rail
```

## Receipt shape

```json
{
  "id": "receipt-observer-route-release-021",
  "kind": "llm-observer-route-release-runbook",
  "status": "active",
  "localCommand": "npm run observer:routes:check",
  "workflow": ".github/workflows/observer-routes.yml",
  "law": "A route rail is releasable only when docs, command, checker, and CI agree."
}
```
