# Fardarter OAuth Connector Packet

## Goal

Provide a user-approved OAuth path for a trusted external service to manage the Fardarter GitHub Pages workflow without asking JP to paste a token into chat.

## Authorization flow

1. JP opens the connector's GitHub authorization screen.
2. The connector requests only the scopes needed for the selected repository and Pages workflow.
3. JP reviews the repository and requested permissions.
4. GitHub redirects to the connector callback with a short-lived authorization code.
5. The connector exchanges the code server-side and stores the resulting credential in a secure vault.
6. Before each consequential action, the connector presents the exact target, action, repository, and expected result.
7. After JP approval, the connector enables Pages, dispatches the workflow, verifies the site, and stores receipts.
8. JP can revoke the authorization from GitHub at any time.

## Required connector endpoints

- `GET /auth/github/start`
- `GET /auth/github/callback`
- `POST /github/pages/enable`
- `POST /github/workflows/dispatch`
- `GET /github/workflows/:runId`
- `POST /github/pages/verify`
- `DELETE /auth/github/revoke`

## Recommended connector actions

- `get_repository_permission(repository)`
- `get_pages_status(repository)`
- `enable_pages(repository, build_type="workflow")`
- `dispatch_workflow(repository, workflow, ref)`
- `get_workflow_run(repository, run_id)`
- `verify_public_url(url, expected_title)`
- `record_deployment_receipt(issue_number, run_url, live_url, commit_sha)`

## Security requirements

- OAuth state and PKCE protection.
- Server-side code exchange only.
- Encrypted credential storage.
- No tokens in URLs, chat, issues, commits, workflow inputs, or client logs.
- Repository allowlist limited to `hvitiswift-afk/nextjs-boilerplate` unless JP approves another repository.
- Exact-action preview before settings changes or publication.
- Token rotation and revocation support.
- Audit receipts for authorization, execution, result, and revocation.

## Scope boundary

The OAuth route may enable and verify the existing Fardarter Pages workflows. It does not authorize domain purchases, billing, mailbox creation, OpenAI submissions, payment changes, or unrelated repository administration.

## Current limitation

The current connected GitHub tool does not expose an OAuth client-registration action or a secure callback service. This packet defines the integration contract for a future platform connector or trusted external service.
