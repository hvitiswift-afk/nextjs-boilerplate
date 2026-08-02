# Contributing to JP Systems Hub

Thank you for helping improve this repository. Contributions should strengthen the code, documentation, verification, or operational clarity without overstating what has been deployed, approved, paid for, accepted, or legally established.

## Before starting

1. Search existing issues and pull requests for overlapping work.
2. Open or identify one issue that states the target result, owner, scope, risks, and acceptance checks.
3. Create a dedicated branch from the current `main` branch.
4. Keep one pull request focused on one coherent mission.

Suggested branch names:

```text
feature/<short-name>
fix/<short-name>
docs/<short-name>
security/<short-name>
chore/<short-name>
```

## Development

Install dependencies and run the local application:

```bash
npm install
npm run dev
```

Run the checks relevant to the change. The primary repository checks include:

```bash
npm run security:secrets:check
npm run griploom:checks
npm run griploom:verify
npm run service-bridge:verify
npm run revenue:verify
npm run build
```

A contributor does not need to run every long-running check when it is clearly unrelated, but the pull request must state what was and was not run, why, and the observed result.

## Pull requests

Use the repository pull-request template. A pull request should include:

- the exact target and intended result;
- included and excluded scope;
- related issue, evidence, or receipt;
- verification commands and results;
- risk level and rollback path;
- any human-only or provider-only step still required;
- a truthful authority state such as `prepared`, `reviewed`, `approved`, or `executed`.

Do not describe prepared code as deployed, a draft as approved, a connector as an account owner, or a workflow run as proof of an external business, legal, financial, or provider decision.

## Security and sensitive information

Follow `SECURITY.md`. Never commit credentials, private keys, access tokens, session data, banking information, personal records, legal or medical records, private connector output, customer-private information, or confidential invention details.

Use placeholders and documented environment-variable names instead of real secrets. Any value that grants access must remain outside the repository.

## Review and ownership

`CODEOWNERS` identifies the required review owner. Review ownership does not automatically authorize merge, deployment, publication, billing, payment, account settings, repository transfer, enterprise administration, or external submission.

Final consequential approval remains with JP (`@hvitiswift-afk`) unless a later verified governance record explicitly delegates a narrower authority.

## Public/private and claim discipline

Repository evidence may prove source content, Git history, review, automated checks, release artifacts, and verified public readback. It does not by itself prove:

- legal entity status;
- partnership or provider endorsement;
- grant acceptance or award;
- payment, delivery, consent, or work start;
- production deployment outside GitHub;
- organization or enterprise ownership;
- transfer of identity, authority, or intellectual property.

Keep claims bounded to evidence that can be independently read back.

## Merge and release

Preferred lifecycle:

```text
issue -> branch -> pull request -> checks -> review -> approved merge -> post-merge verification -> release or publication receipt
```

Do not bypass required checks or merge unrelated changes merely to clear a branch. Releases and public publication require their own verified gates and receipts.
