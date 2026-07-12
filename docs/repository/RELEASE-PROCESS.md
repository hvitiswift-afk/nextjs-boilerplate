# Release Process

## 1. Intake

Start from an issue or exact task that names the lane, target, desired change, public/private classification, acceptance checks, external-action boundary, rollback, and required receipt.

## 2. Branch

Create a dedicated branch from the current approved base. Do not make unrelated changes on the release branch.

## 3. Draft pull request

Open a draft pull request early. The pull request should state scope, exclusions, verification commands, risks, rollback, and whether any external account action remains.

## 4. Verification

Run the repository-owned checks appropriate to the affected lane. Record failures as failures; do not substitute deployment, billing, or account blockers for code verification results.

## 5. Review gate

Before merge, confirm:

- exact files and diff reviewed
- public/private boundary preserved
- no secrets or private records added
- checks complete or blockers explicitly recorded
- rollback path understood
- JP final merge approval received

## 6. Merge receipt

Record the pull request number, merge commit, date, checks, reviewer or approval state, and unresolved external actions.

## 7. External release

Deployment, Pages activation, domain changes, credential creation, billing changes, submissions, outreach, or publication remain separate actions. Each requires its own exact approval and execution receipt.
