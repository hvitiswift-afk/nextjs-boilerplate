# Fardarter Drive™ v6.29 — one-run GitHub Pages publication

Control: `FARDARTER-DRIVE-GITHUB-PAGES-ONE-RUN-PUBLICATION-V6-29`  
Manifest digest: `e729a5b31f853723918d63a0dfa759f34f0671fb67beb04cc994e1d5d617fde8`  
Controlling issue: `#249`  
Implementation issue: `#250`  
Base: `0c294ff4a9281fa4722b4806bd2d76da84f383ed`

## X — exact gap

The project is GitHub-primary at v6.28, but GitHub Pages remains `PAGES_NOT_ENABLED_OR_NOT_VISIBLE`.

The connected GitHub capability can read repository state and rerun an existing job. It cannot currently:

- create `GH_ADMIN_TOKEN`;
- modify the repository Pages setting;
- dispatch a new `workflow_dispatch` run.

The repository source also required correction:

- initial enablement and publication were two separate manual runs;
- publication had no deterministic artifact builder;
- publication had no bounded public URL/content verifier;
- no durable operational publication receipt was uploaded;
- the static site used an unverified mailbox and domain rather than GitHub intake;
- historical branch `prepare-github-pages-deploy-253` is 678 commits behind current `main`, 20 ahead of its merge base, and mixes unrelated Oracle/Earth-Mesh material.

## Y — one-run source design

One authorized initial dispatch now has source for:

```text
PREFLIGHT_ADMIN_SECRET
VERIFY_SOURCE_READINESS
BUILD_DETERMINISTIC_STATIC_ARTIFACT
ENABLE_GITHUB_PAGES
UPLOAD_PAGES_ARTIFACT
DEPLOY_GITHUB_PAGES
VERIFY_PUBLIC_URL_AND_REQUIRED_CONTENT
UPLOAD_OPERATIONAL_RECEIPT
```

The repeat publication workflow always builds and verifies source evidence. It deploys only after the repository Pages configuration is observable, preventing a pre-enable push from being misclassified as a failed publication.

The source artifact contains:

```text
.nojekyll
index.html
privacy.html
projects.html
publication-source-receipt.json
robots.txt
sitemap.xml
status.json
styles.css
```

## Z — truth boundary

Current source state:

```text
GitHub source/review/actions        GITHUB_PRIMARY_INTENDED
Pages source package                SOURCE_READY
Private admin capability            NOT OBSERVED
Pages configuration                 NOT VERIFIED
Workflow execution                  NOT PERFORMED
Pages deployment                    NOT VERIFIED
Public URL                           NOT VERIFIED
Live claim                           FALSE
```

GitHub Pages remains static-only. Existing server and API routes are not automatically included.

The static site uses GitHub Issues (`GITHUB_ISSUES`) and the reviewed public offer as its public contact rail. It no longer publishes the unverified `founder@fardarter.systems` mailbox.

## Stale branch quarantine

`prepare-github-pages-deploy-253` is preserved as historical evidence with disposition `STALE_MIXED_HISTORY_NOT_CONTINUATION_SOURCE`.

```text
behind current main       678
ahead of merge base        20
mixed unrelated material   yes
automatic merge            no
automatic delete           no
continuation source        no
```

## ChatGPT / Radio

Current state remains:

`CONNECTED_USER_DIRECTED_ASSISTANT_BACKING_GITHUB_RAIL`

Future target remains:

`PROVIDER_NEUTRAL_EXPORTABLE_USER_CONTROLLED_AGENT_PORTABILITY`

Neither statement grants current credential ownership, repository ownership, legal identity, hosting authority, consent authority, or unrestricted irreversible action.

## Completion and execution boundary

This package may be merged after unchanged-head review. Merge is source reconciliation only.

Actual publication still requires:

1. a private repository-scoped admin capability or supported Pages action;
2. one exact authorized workflow dispatch;
3. successful Pages configuration and deploy jobs;
4. exact public URL readback;
5. a durable operational publication receipt.

No source, workflow, candidate URL, or artifact is itself a live-site receipt.
