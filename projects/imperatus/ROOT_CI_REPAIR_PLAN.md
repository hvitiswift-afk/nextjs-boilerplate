# Root CI Repair Evidence

The repository root lockfile was reconciled in GitHub Actions against the declared `package.json` dependencies.

## Repaired

- Added `pg` to the root lock dependency set.
- Added `@types/pg` to the root lock development dependency set.
- Regenerated the required PostgreSQL dependency graph.
- Verified a clean `npm ci --ignore-scripts` inside the one-time reconciliation workflow.
- Removed the one-time write-enabled workflow after use.

## Preserved controls

- The ordinary Build Check still uses `npm ci`.
- GRIPLOOM Verify still uses `npm ci`.
- The dedicated Imperatus Review remains isolated and simulated-only.
- No dependency was removed merely to make CI pass.

## Remaining gates

1. Build Check must complete on the reconciled branch head.
2. GRIPLOOM Verify must complete on the reconciled branch head.
3. Imperatus Review must complete on the reconciled branch head.
4. PR #118 remains draft until the results are preserved.
5. Netlify deployment and remote `/mcp` testing remain separate gates.

No merge, deployment, application submission, app approval, provider connection, carrier delivery, or live SMS is claimed.
