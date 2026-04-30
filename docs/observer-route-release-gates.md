# Observer Route Release Gates

Receipt: `receipt-observer-route-release-gates-030`

This file is the verified checklist for moving the observer route rail from working state to release-ready state.

## Local gates

- [ ] `npm install`
- [ ] `npm run build`
- [ ] `npm run observer:routes`
- [ ] `npm run dev`
- [ ] `npm run observer:routes:check`
- [ ] `npm run observer:release:receipt`

## CI gates

- [ ] GitHub Actions workflow `Observer Routes` runs.
- [ ] Route scenario checker passes.
- [ ] Release receipt printer runs in CI.

## Documentation gates

- [ ] README points to observer route commands.
- [ ] README points to scenario sample.
- [ ] README points to release receipt sample.
- [ ] README points to release receipt printer.
- [ ] Release runbook includes the release receipt command.

## Release rule

```txt
Local gates pass.
CI gates pass.
Documentation gates pass.
Release receipt prints status ready.
```

## Receipt shape

```json
{
  "id": "receipt-observer-route-release-gates-030",
  "kind": "llm-observer-route-release-gates",
  "status": "active",
  "command": "npm run observer:release:receipt",
  "law": "A release gate is trusted only when it is checkable, printable, and visible from the README."
}
```
