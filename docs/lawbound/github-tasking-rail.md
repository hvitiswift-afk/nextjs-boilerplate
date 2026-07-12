# Lawbound GitHub Tasking Rail

This document defines the GitHub-first review rail for the Lawbound and HvitiOS workstream.

## Purpose

GitHub is the reviewable control surface for branches, pull requests, receipts, verification, rollback planning, and JP approval before any separate release action.

## Canonical flow

1. Start from current `main`.
2. Use a dedicated branch.
3. Keep the change reviewable and reversible.
4. Record exact changed files, checks, blockers, rollback, and next approval.
5. Keep merge, deployment, publication, hosting, credentials, billing, domains, outreach, payments, and private-source movement separately gated.

## Current packet

- Packet ID: `lawbound-github-tasking-v2`
- Branch: `jp/lawbound-tasking-refresh-v2`
- Canonical version range: `V121-V380`
- Canonical changed-file count: `5`
- Packet type: documentation-only

## Required repository checks

```bash
npm ci
npm run griploom:verify
npm run build
```

A pull request may not move to ready-for-review until its current head has passed the required repository checks or an exact blocker receipt explains why a check is external and non-code-related.
