# Fardarter Pages Tool V2

The Pages enablement workflow now uses GitHub's official `actions/configure-pages@v6` action with `enablement: true`.

## Required secret

`GH_ADMIN_TOKEN`

Use a fine-grained token restricted to `hvitiswift-afk/nextjs-boilerplate` with the repository permissions required by GitHub Pages enablement. Keep it only as an Actions secret.

## Run order

1. Add the `GH_ADMIN_TOKEN` Actions secret.
2. Run **Enable Fardarter GitHub Pages**.
3. Confirm the workflow prints the Pages base URL.
4. Run **Publish Fardarter Startup Site**.
5. Verify the public site and privacy page.
6. Add the run URL and live URL to issue #102.

## Current boundary

The tool, workflows, site files, and documentation are created. The token itself is a private GitHub credential and is not generated, stored, or exposed by this repository.
