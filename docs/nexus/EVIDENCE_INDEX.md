# Nexus Evidence Index

**Control:** `NEXUS-EVIDENCE-INDEX-V1`  
**Snapshot:** 2026-08-01 13:37 America/Detroit  
**Repository:** `hvitiswift-afk/nextjs-boilerplate`  
**Pull request:** `#255`  
**Branch:** `agent/nexus-project-summary`  
**Baseline:** `main@65715ff2a849fb4142e0db91c00aaebe8e878b05`

## Evidence classes

| Class | Meaning | Example |
|---|---|---|
| `VERIFIED_PROVIDER_FACT` | Returned by the authoritative provider for the exact fact | GitHub PR metadata or workflow conclusion |
| `VERIFIED_REPOSITORY_FACT` | Exact commit, tree, blob, path, diff, or receipt in the repository | Baseline commit or file blob SHA |
| `DIRECT_HUMAN_STATEMENT` | An attributable instruction or statement from the human principal | JP's handoff and continuation direction |
| `USER_PROVIDED_ASSERTION_UNVERIFIED` | A claim supplied by the user but not independently verified | Legal-entity status pending registry evidence |
| `AI_ASSISTED_DRAFT` | Material produced with AI assistance under human direction | This documentation packet |
| `INFERENCE` | A reasoned conclusion that is not directly stated by the evidence | A recommended clearance state |
| `PLAN_OR_TARGET` | Intended future state, not a completed event | Future publication or registration |
| `FICTIONAL_OR_SIMULATED` | Deliberately non-real or test material | Veyrion Prime persona |
| `UNKNOWN_OR_DISPUTED` | Insufficient, contradictory, or unresolved evidence | Unverified rights or ownership claims |

## Baseline repository objects

| Path | Git blob SHA | Evidence use |
|---|---|---|
| `README.md` | `f2f5a145199e0718cefd1c7c447084a4732f3786` | Repository purpose, GitHub-primary authority, verification, and public/private rules |
| `package.json` | `6e92afe79f657badd5279bb18fa5fb07811f8093` | Next.js dependencies and repository-owned checks |
| `docs/repository/PROJECT-MAP.md` | `28b7b8731d9c6a9b1e8c67493d0bc9c1ad6ddb44` | Project lanes and private-canonical separation |
| `docs/repository/STATUS.md` | `8cc3c84eb9bb03eee20bd12482137b4a5f2933db` | Status vocabulary and pull-request hygiene |
| `docs/repository/PUBLIC-PRIVATE-BOUNDARY.md` | `c2a9cb604bcf0610edc2d6bf402287aeb22b148f` | Restricted-data and external-action controls |

## Pull-request evidence before V2 expansion

At head `6a6e73d41a89387fec3f60c072462affda14754a`, GitHub reported PR #255 open, draft, and mergeable, with no review threads.

The following pull-request-triggered workflow runs completed successfully on that head:

| Workflow | Run ID | Run number | Conclusion |
|---|---:|---:|---|
| Build Check | `30710251018` | `727` | `success` |
| GRIPLOOM Verify | `30710251031` | `802` | `success` |
| Fardarter Deployment Lineage v6.10 | `30710251006` | `73` | `success` |
| Fardarter Promotion Candidate v6.11 | `30710251013` | `71` | `success` |
| Fardarter Production Reconciliation v6.12 | `30710251025` | `70` | `success` |

These conclusions verify that exact prior head. New commits require a new current-head check cycle.

## Controlled documentation

| Path | Function |
|---|---|
| `docs/nexus/PROJECT_SUMMARY.md` | Concise system identity, workflow, and reality boundary |
| `docs/nexus/AUTHORITY_AND_IDENTITY_MAP.md` | Authority sources, action gates, and statement-source labels |
| `docs/nexus/PROVENANCE.md` | Contributor, source, evidence, privacy, correction, and supersession rules |
| `docs/nexus/RIGHTS_CLEARANCE_MATRIX.md` | Material classes, rights dimensions, clearance states, and release gate |
| `docs/nexus/EVIDENCE_INDEX.md` | Dated source objects, check evidence, evidence classes, and limitations |
| `docs/nexus/RECEIPT.json` | Machine-readable hashes, source object IDs, exclusions, and approval boundary |

The receipt is the authoritative file-hash list for this packet. Its self-hash is excluded to avoid an undefined recursive digest.

## Claim-to-evidence rule

Every consequential claim should identify:

```text
CLAIM:
EVIDENCE CLASS:
SOURCE:
DATE / TIMEZONE:
OBJECT ID OR HASH:
SCOPE:
LIMITATIONS:
REVIEWER:
```

A claim is limited to what its evidence directly proves.

## Chain-of-custody rule

1. Preserve the source artifact or provider response.
2. Record its path, object ID, commit, run ID, or hash.
3. Record the retrieval or creation date and timezone.
4. Separate raw evidence from interpretation.
5. Record transformations, redactions, or normalization.
6. Preserve correction and supersession links.
7. Obtain JP approval before consequential use.

## Limitations at this snapshot

- The repository and PR prove repository state, not external legal ownership, partnership, endorsement, funding, deployment, or publication.
- Fardarter Gaming LLC legal status remains subject to current official verification.
- No current official trademark, patent, copyright-registration, license, or entity-registry evidence was added by this branch.
- No provider account, deployment, payment, submission, or money action was performed.
- No real person other than JP is attributed as a contributor or speaker without direct source evidence.
- The prior successful checks do not automatically cover later commits; current-head checks must be reviewed separately.

## Receipt route

```text
SOURCE OBJECTS
→ HUMAN / TOOL ATTRIBUTION
→ RIGHTS AND PRIVACY CLASSIFICATION
→ DEDICATED BRANCH
→ EXACT DIFF
→ CURRENT-HEAD CHECKS
→ DRAFT PR
→ JP REVIEW
→ MERGE OR CORRECTION RECEIPT
```
