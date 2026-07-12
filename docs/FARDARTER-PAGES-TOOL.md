# Fardarter GitHub Pages Enablement Tool

This tool converts the final repository-setting blocker into a repeatable, receiptable workflow.

## Files

- `scripts/enable-fardarter-pages.mjs`
- `.github/workflows/enable-fardarter-pages.yml`
- `.github/workflows/fardarter-pages.yml`

## Required secret

Create a repository Actions secret named `GH_ADMIN_TOKEN` containing a fine-grained GitHub personal access token restricted to this repository with **Administration: Read and write** permission.

Do not commit the token. Do not place it in issues, logs, source files, or workflow inputs.

## Run sequence

1. Add the `GH_ADMIN_TOKEN` repository secret.
2. Open **Actions → Enable Fardarter GitHub Pages → Run workflow**.
3. Confirm the run reports `created` or `updated` with `build_type: workflow`.
4. Run **Publish Fardarter Startup Site**.
5. Verify `https://hvitiswift-afk.github.io/nextjs-boilerplate/`.
6. Save the Actions run URL and live URL in issue #102, then close it.

## Boundaries

The tool only configures GitHub Pages for the current repository. It does not register domains, create email accounts, purchase services, submit an OpenAI application, or claim OpenAI affiliation.
