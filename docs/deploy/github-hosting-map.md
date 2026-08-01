# GitHub Hosting Map

This document compares what can be built on GitHub with what platforms such as Vercel and Netlify commonly provide.

## Current state

- Build check workflow exists on `main`.
- This branch prepares a GitHub Pages readiness workflow only.
- This branch does not publish a production site.

## What GitHub can cover

GitHub can cover several hosting-adjacent functions:

- source control
- pull request review
- build checks with GitHub Actions
- artifact creation
- static site hosting with GitHub Pages
- release notes and tagged releases
- simple deployment receipts

## What GitHub Pages can host well

GitHub Pages is best for static output:

- static documentation
- static generated sites
- exported front-end assets
- project pages
- public documentation portals

## What Vercel and Netlify usually add

Vercel and Netlify commonly add production hosting features that GitHub alone may not replace directly:

- managed preview deployments per pull request
- production deployment promotion
- serverless or edge functions
- domain and HTTPS automation
- environment variable management
- build logs linked to deploy previews
- redirects and headers controls
- rollbacks or deploy promotion flows
- framework-aware Next.js hosting

## GitHub-based approximation

A GitHub-only version can approximate parts of that stack:

| Platform feature | GitHub approximation |
| --- | --- |
| Build checks | GitHub Actions |
| Preview review | Pull requests plus artifacts |
| Static production hosting | GitHub Pages |
| Release receipts | GitHub Releases or docs receipts |
| Rollback record | revert commits or redeploy prior artifact |
| Deploy logs | GitHub Actions logs |

## Gaps to keep visible

For a Next.js app, GitHub Pages usually requires static export compatibility. If the app uses server rendering, API routes, database-backed server code, middleware, or dynamic server features, Vercel or Netlify may be a better production target.

## Safe next step

Use this branch as a review point. Do not treat it as a production deployment until a real Pages deploy workflow, repository Pages settings, and successful deployment result exist.
