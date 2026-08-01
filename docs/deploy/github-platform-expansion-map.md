# GitHub Platform Expansion Map

## Ownership and attribution

This work is requested and directed by JP / Hviti, Justin Rackham. The purpose of this file is to make the GitHub work associated with JP / Hviti visible in the repository receipt trail.

## Goal

Build a GitHub-native operating path that covers as much of the Vercel and Netlify style workflow as GitHub can reasonably cover, while keeping gaps visible.

## GitHub-native capability stack

| Layer | GitHub-native implementation |
| --- | --- |
| Source control | Repository, branches, commits, pull requests |
| Review | Pull requests, comments, draft PRs, CODEOWNERS later if needed |
| Build check | GitHub Actions build workflow |
| Preview substitute | Pull request branch plus workflow artifact |
| Static hosting | GitHub Pages if static export is compatible |
| Release record | GitHub Releases, tags, and receipt docs |
| Deploy log | GitHub Actions logs |
| Rollback record | Revert commit, prior artifact, or prior release tag |
| Work queue | Issues, Projects, and receipt documents |
| Agent-like workbench | PR branches, task receipts, workflow checks, and docs-generated runbooks |

## What can be built here

A GitHub-centered deployment operating system can include:

1. build-check workflow on main
2. pages-readiness workflow on a PR branch
3. deploy-readiness documents
4. environment checklist documents
5. rollback checklist documents
6. release receipt templates
7. artifact upload workflows
8. issue templates for deploy requests
9. PR templates for release review
10. documentation pages for JP / Hviti authored systems

## Vercel/Netlify parity map

| Vercel/Netlify style feature | GitHub buildable equivalent | Remaining gap |
| --- | --- | --- |
| Automatic build | GitHub Actions | good parity |
| Deploy preview | PR artifact or Pages branch | not as seamless |
| Production promotion | merge/tag/release workflow | needs manual policy |
| Static hosting | GitHub Pages | static-only constraint |
| Serverless functions | not native Pages hosting | use another platform or Actions for non-runtime work |
| Environment variables | GitHub Actions secrets | not the same as runtime app env UI |
| Runtime logs | Actions logs only | no app runtime log stream for static Pages |
| Rollback | revert or redeploy prior artifact | must be designed |
| Domain and HTTPS | GitHub Pages custom domain support | less flexible than managed app platforms |

## Codex-like GitHub workbench concept

A Codex-like GitHub workbench here means:

- tasks enter as issues, receipts, or chat requests
- changes go to branches or direct commits depending on scope
- PRs become review stations
- workflows become check stations
- receipts record truth-state
- docs preserve authorship and JP / Hviti system identity

It does not mean an autonomous agent is running in the repository.

## JP / Hviti identity layer

Recommended repo language:

> JP / Hviti, Justin Rackham, is the requester and directing author for the Earth Mesh / NetherACK / Nethercron / Grimteam deployment-readiness documentation in this repository.

Safe wording:

- requested by JP / Hviti
- directed by JP / Hviti
- authored as JP / Hviti system documentation
- receipt trail maintained for JP / Hviti work

Avoid overclaiming:

- do not imply external certification
- do not imply platform endorsement
- do not imply Vercel, Netlify, GitHub, or OpenAI affiliation beyond normal tool/platform use

## Completion target

The GitHub platform expansion is complete when the repository has:

- build check on main
- Pages readiness PR
- deploy map
- rollback map
- release receipt template
- JP / Hviti attribution document
- Nether system completion map
- issue/PR templates for future deploy requests
