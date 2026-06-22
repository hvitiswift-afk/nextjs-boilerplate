# Lichburn and Norstein MMORPG Improvements

Receipt: `TJP-V54562-LICHBURN-NORSTEIN-MMORPG-IMPROVEMENTS`

This file expands the Lichburn project with Norstein Bekkler and the AR/MMORPG bridge.

## Current source state

- Lichburn is preserved as the existing project spine.
- Norstein Bekkler Seal source is committed.
- Command Center, Gato self-check, AI-assisted JP systems, Blue Helper receipts, Final Ledger, and Pages notes are committed.
- Hosting activation remains a separate gate.

## Improvement plan

### Phase 1: Source bridge

Create public-safe docs and static front-door files that connect Lichburn to Norstein Bekkler.

Status: `IN PROGRESS / SOURCE PASS`

### Phase 2: Route bridge

Candidate routes:

```txt
/norstein
/norstein-bekkler
/world-egg
/barcode-center
/blue-helper
/oracle-comments
```

Status: `READY DRAFT`

### Phase 3: Comment and Oracle bridge

Use GitHub issues and comments as public-safe intake for Norstein Bekkler and MMORPG feature ideas. Comments become receipts through Blue Helper and Gato.

Status: `READY DRAFT`

### Phase 4: Busy-night hardening

Static-first front door, CDN caching, API separation, rate limits, receipt queues, and rollback plan.

Status: `PLAN WRITTEN`

### Phase 5: Netlify bridge

Netlify can host the source after exact deploy support is available. Prior Netlify tool calls were blocked, so GitHub remains the current source-of-truth rail.

Status: `SOURCE READY / DEPLOY GATE HOLD`

## Boundary

Do not claim stadium or town readiness until hosting is live and load testing has been performed.
