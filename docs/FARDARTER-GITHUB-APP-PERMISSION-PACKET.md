# Fardarter GitHub App Permission Packet

## Goal

Allow a trusted connector to enable and manage GitHub Pages for this repository without asking JP to paste a long-lived personal token into chat.

## Recommended architecture

1. Create a private GitHub App from the manifest template in `config/fardarter-github-app-manifest.example.json`.
2. Replace the placeholder callback/webhook URLs with a real secure service before app creation.
3. Install the app only on `hvitiswift-afk/nextjs-boilerplate`.
4. Keep the app private and repository-scoped.
5. Store the App ID, installation ID, and private key in a secure external credential vault—not in this repository or chat.
6. Mint short-lived installation access tokens only when an exact approved action is being executed.
7. Use the installation token to enable Pages, dispatch the publish workflow, verify the live URL, and save receipts.

## Requested repository permissions

- `metadata: read` — identify the repository and installation.
- `contents: read` — read the site and workflow files.
- `actions: write` — dispatch and inspect approved workflows.
- `administration: write` — change the repository Pages setting when needed.
- `pages: write` — configure and deploy the Pages site.

These are intentionally limited to the Pages workflow. Broader permissions should not be added without a new review.

## Connector actions to expose

A future trusted connector should provide narrowly scoped actions:

- `get_pages_status(repository)`
- `enable_pages(repository, build_type="workflow")`
- `dispatch_workflow(repository, workflow, ref)`
- `get_workflow_run(repository, run_id)`
- `verify_public_url(url, expected_title)`
- `record_deployment_receipt(issue_number, run_url, live_url, commit_sha)`

The connector should not expose the private key or installation token to the assistant or user-visible logs.

## Exact approval flow

**JP approval → connector authorization → short-lived installation token → exact action preview → execution → receipt → token expiry**

## Token helper

`scripts/mint-github-app-installation-token.mjs` demonstrates how a secure backend can mint a short-lived installation token using:

- `GITHUB_APP_ID`
- `GITHUB_APP_INSTALLATION_ID`
- `GITHUB_APP_PRIVATE_KEY`

The helper prints a token for development/testing. In production, the token should remain inside the trusted backend and should never be displayed in chat or logs.

## Current limitation

The present ChatGPT GitHub connector does not expose GitHub App creation, repository Pages settings, Actions-secret management, or arbitrary workflow dispatch. This packet prepares the repository side; an external OAuth/GitHub App integration still has to be created and connected by the platform or a trusted service.

## Safety boundaries

- Never commit the app private key, installation token, PAT, or Actions secret.
- Install the app only on the intended repository.
- Use short token lifetimes and least privilege.
- Require exact JP approval for settings changes and publication.
- Preserve workflow run URLs, commit SHAs, and public URL verification as receipts.
- Revoke the app installation or rotate the private key if compromise is suspected.
