# GitHub Enterprise Readiness and Migration Guide

**Owner:** JP (`@hvitiswift-afk`)  
**Repository:** `hvitiswift-afk/nextjs-boilerplate`  
**Control state:** preparation and verification only  
**Last reviewed:** 2026-08-02

## Purpose

This guide separates GitHub Enterprise preparation from verified GitHub administrative state. It provides a controlled path from the current personal-account repository into an authorized GitHub organization and enterprise account without treating an intended name, completed form, connector authorization, or document as proof that the target account exists or controls the repository.

## Verified connector state on 2026-08-02

The connected GitHub app reported:

```text
Authenticated GitHub account     hvitiswift-afk
Repository admin permission      VERIFIED for hvitiswift-afk/nextjs-boilerplate
Repository push permission       VERIFIED
Organization memberships         NONE VISIBLE TO CONNECTOR
Organization app installations   NONE VISIBLE TO CONNECTOR
Personal app installation        VERIFIED
Enterprise account               NOT DIRECTLY VERIFIABLE BY CURRENT CONNECTOR
Enterprise slug                  UNVERIFIED
Repository transfer              NOT PERFORMED
Billing or trial status          UNVERIFIED
```

These observations are connector readbacks, not a claim that an enterprise was or was not created through the GitHub website. An enterprise can exist before an organization is created or before the GitHub app is installed on that organization.

## Target structure

```text
GitHub Enterprise account
└── Fardarter organization
    ├── nextjs-boilerplate / JP Systems Hub
    ├── shared .github governance repository
    ├── security and dependency policies
    ├── teams and least-privilege roles
    └── verified Actions, Pages, packages, releases, and audit evidence
```

Names and slugs remain proposals until they are shown in authenticated GitHub readback.

## Readiness already present

The repository already includes:

- a GitHub-primary source and verification strategy;
- owner-controlled `CODEOWNERS` rules;
- issue and pull-request templates;
- GitHub Actions verification lanes;
- a public/private boundary;
- release and publication gates;
- append-only evidence and receipt concepts;
- explicit restrictions against false deployment, authority, partnership, payment, and legal-state claims.

This readiness pack adds:

- `SECURITY.md` for private vulnerability reporting and sensitive-data boundaries;
- `CONTRIBUTING.md` for issue-to-PR lifecycle and claim discipline;
- `.github/dependabot.yml` for bounded weekly dependency maintenance;
- `.github/workflows/governance-baseline.yml` for governance-file integrity checks.

## Phase 1 — Verify the enterprise account

In the authenticated GitHub website, record without publishing secrets:

- enterprise display name;
- enterprise slug and authenticated URL;
- account type: personal accounts or managed users;
- owner identity and role;
- trial or billing state;
- data-residency selection, if any;
- exact organizations owned by the enterprise.

A screenshot or exported administrative receipt may be retained privately. Do not commit billing details, invoices, contact records, session data, or account-recovery information.

**Gate:** mark `ENTERPRISE_ACCOUNT_VERIFIED` only after authenticated GitHub readback shows the enterprise settings page.

## Phase 2 — Create or attach an organization

Use an organization controlled by the enterprise. The intended organization may be named `Fardarter`, `Fardarter Company`, or another available approved name, but its final login must be copied from GitHub rather than inferred.

Before repository transfer:

1. Verify JP is both an organization owner and an authorized enterprise owner.
2. Install the ChatGPT GitHub app on the organization only when the requested repository and permission scope are visible.
3. Prefer selected repositories during initial validation; expand to all repositories only when required.
4. Verify organization membership and app installation through connector readback.
5. Establish at least one recovery-safe human owner account.

**Gate:** mark `ORGANIZATION_VERIFIED` only when the connector or authenticated GitHub API lists the organization and JP's owner membership.

## Phase 3 — Establish organization governance

Create or configure:

- an organization `.github` repository for default community-health files;
- teams for owners, maintainers, developers, auditors, and automation;
- least-privilege repository roles;
- two-factor authentication requirements;
- approved Actions and reusable-workflow policy;
- secret-scanning and push-protection settings where available;
- Dependabot alerts and security updates;
- branch rules or repository rulesets for `main`;
- audit-log retention and review procedure;
- emergency access and owner-recovery procedure.

Recommended `main` protections:

- pull request required;
- required status checks;
- conversation resolution required;
- CODEOWNERS review required when multiple qualified reviewers exist;
- force pushes and branch deletion blocked;
- bypass limited to explicitly documented recovery cases.

Do not enable a rule that permanently locks out the only human owner. Single-owner projects need a recovery-safe sequence before requiring approvals that the same owner cannot satisfy.

## Phase 4 — Transfer the repository

Before transfer:

1. Confirm the destination organization and repository name.
2. Verify Pages, Actions, packages, environments, webhooks, deploy keys, secrets, and external integrations.
3. Preserve a current repository inventory and release/readback receipt.
4. Review public/private boundaries again.
5. Confirm expected URL redirects and package-name consequences.
6. Record the rollback or recovery path.
7. Obtain explicit JP approval for the exact transfer target.

After transfer:

1. Verify the new repository URL and redirect from the old URL.
2. Verify default branch and history integrity.
3. Reinstall or reauthorize required GitHub apps.
4. Recheck secrets, environments, Actions permissions, Pages, packages, releases, and branch rules.
5. Run primary verification.
6. Update documentation only after successful authenticated readback.

Suggested checks:

```bash
npm run security:secrets:check
npm run griploom:checks
npm run griploom:verify
npm run service-bridge:verify
npm run revenue:verify
npm run build
```

**Gate:** mark `REPOSITORY_TRANSFER_VERIFIED` only when source, permissions, automation, public readback, and required integrations are confirmed at the destination.

## Phase 5 — Enterprise operating baseline

Once the repository and organization are verified:

- define quarterly access reviews;
- review outside collaborators and dormant accounts;
- require traceable issues and pull requests for consequential changes;
- review Dependabot and code-scanning findings;
- retain release, deployment, and publication receipts;
- monitor failed workflows and permission changes;
- keep legal, billing, identity, banking, medical, and confidential invention records outside public repositories;
- preserve human approval for payment, legal acceptance, production secrets, account recovery, and external submission.

## Truth-state vocabulary

Use these exact distinctions where practical:

```text
PROPOSED        named or planned but not created
PREPARED        files or settings plan created locally or in a branch
CONNECTED       connector authorization exists
VISIBLE         object appears in authenticated connector readback
VERIFIED        expected properties confirmed by authenticated evidence
APPROVED        JP approved the exact consequential action
EXECUTED        action completed by an authorized system or person
VALIDATED       result tested after execution
RECEIPTED       durable evidence recorded
```

Never collapse `PREPARED`, `CONNECTED`, or `VISIBLE` into `EXECUTED`.

## Current next gate

The immediate next administrative gate is:

```text
VERIFY ENTERPRISE SETTINGS PAGE
→ IDENTIFY EXACT ENTERPRISE SLUG
→ CREATE OR ATTACH ORGANIZATION
→ INSTALL GITHUB APP ON ORGANIZATION
→ VERIFY ORGANIZATION MEMBERSHIP THROUGH CONNECTOR
→ REVIEW TRANSFER PLAN
```

No repository transfer, billing action, legal acceptance, or enterprise-policy activation is authorized merely by this guide.
