# Root README Migration

This migration promotes the approved `README.front-door.md` content to the top of the root `README.md` without manually copying or rewriting the existing technical body.

## Safety model

The migration tool reads both files directly from the repository, removes only the staging-only `## Technical documentation` section from the front-door candidate, inserts a divider, and appends the current root README exactly as stored.

The tool verifies that the migrated result ends with the original README content byte-for-byte and prints SHA-256 hashes, byte counts, source paths, output path, and the preservation result.

## Preview

```bash
node scripts/prepare-root-readme-migration.mjs
```

This creates `README.migrated.preview.md` and does not replace the root README.

## Exact root update

```bash
node scripts/prepare-root-readme-migration.mjs --write-root
```

This replaces `README.md` only after the invariant check succeeds.

## Review gate

Before committing the root update:

1. Compare the preview against `README.md`.
2. Confirm the original README hash and byte count in the printed receipt.
3. Verify that all original technical sections remain present after the divider.
4. Commit the root update on a dedicated branch.
5. Open a separate pull request and obtain JP final merge approval.

## Rollback

Revert the single README migration commit. The original technical body remains recoverable from the prior commit and from the preservation receipt.

No Pages, hosting, deployment, credential, billing, domain, submission, outreach, payment, or publication action is included in this migration.
