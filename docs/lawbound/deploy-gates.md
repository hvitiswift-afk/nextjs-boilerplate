# Lawbound Review Gates

These gates define the review path for the Lawbound and HvitiOS GitHub tasking packet.

## Gate 1: Branch Review

All work begins on a dedicated branch. The default branch remains unchanged until a separate approval exists.

## Gate 2: Documentation Review

This packet is documentation-only. It is meant to make tasking visible, reviewable, and reversible.

## Gate 3: Check Review

Review the existing repository checks before any later promotion path is considered.

Expected local or CI commands:

```bash
npm ci
npm run griploom:verify
npm run build
```

## Gate 4: Receipt Review

Each review step should record:

- branch
- changed files
- check status
- blockers
- rollback path
- next approval needed

## Gate 5: Hold for JP Approval

Merge, release, publication, hosting connection, account setting changes, and platform configuration changes are separate actions. They require separate exact JP approval.
