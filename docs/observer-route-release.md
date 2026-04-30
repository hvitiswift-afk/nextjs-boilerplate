# Goblin LLM Observer Route Release Runbook

Receipt: `receipt-observer-route-release-028`

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

## Release receipt gate

Print the repo-state release receipt:

```bash
npm run observer:release:receipt
```

This checks for the printer, checker, CI workflow, README link, release runbook, and sample release receipt.

## Release rule

A release may proceed when:

```txt
build passes
observer route checker passes
CI workflow passes
README points to the rail
release receipt prints ready
```

## Receipt shape

```json
{
  "id": "receipt-observer-route-release-028",
  "kind": "llm-observer-route-release-runbook",
  "status": "active",
  "localCommand": "npm run observer:routes:check",
  "releaseReceiptCommand": "npm run observer:release:receipt",
  "workflow": ".github/workflows/observer-routes.yml",
  "law": "A route rail is releasable only when docs, command, checker, CI, and release receipt agree."
}
```
