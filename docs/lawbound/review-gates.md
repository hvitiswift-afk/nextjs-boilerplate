# Lawbound Review Gates

## Gate 1 — Current baseline

The branch must originate from the current `main` at creation time.

## Gate 2 — Exact scope

The packet contains exactly five files:

- `docs/lawbound/github-tasking-rail.md`
- `docs/lawbound/review-gates.md`
- `docs/lawbound/black-glass-ledger.md`
- `docs/lawbound/tasking-versions.md`
- `docs/lawbound/tasking-receipt.json`

No YAML mirror is included in this revision.

## Gate 3 — Receipt integrity

The receipt records the five-file packet count, one canonical version range, the source branch, and a Merkle scope that covers the four non-receipt documents. The receipt file is excluded from its own Merkle tree to avoid self-reference.

## Gate 4 — Verification

Run:

```bash
npm ci
npm run griploom:verify
npm run build
```

Record the exact head SHA and results before readiness.

## Gate 5 — JP approval

Ready-for-review and merge remain separate actions. Merge requires exact JP approval after the refreshed diff and checks are reviewed.

## External boundary

This packet does not authorize deployment, Pages, hosting, credentials, billing, domains, publication, submissions, outreach, payments, or movement of private Norstein source.
