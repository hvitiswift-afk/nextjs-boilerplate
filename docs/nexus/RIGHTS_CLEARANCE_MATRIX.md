# Nexus Rights and Clearance Matrix

**Control:** `NEXUS-RIGHTS-CLEARANCE-V1`  
**Record date:** 2026-08-01 (America/Detroit)  
**Scope:** Public release, repository inclusion, publication, licensing, and external use

## Purpose

This matrix separates creative or technical provenance from legal clearance. Authorship direction, repository possession, AI generation, or conceptual similarity does not automatically establish a right to publish or license every included element.

## Material classes

| Class | Minimum evidence | Default repository treatment | Release decision |
|---|---|---|---|
| Original work — verified | Creator, date, source artifact, and available history or hash | Public-safe inclusion may proceed | `PUBLIC_OK`, subject to privacy and other rights |
| Original work — asserted | Direct JP assertion with no corroborating history yet | Preserve with qualification | `REVIEW_BEFORE_BROAD_LICENSE` |
| Recovered work | Recovery source, date, uncertainty, and relationship to prior work | Preserve separately from verified originals | `REVIEW_AND_RECONCILE` |
| AI-assisted material | Human director, tool/provider, date, prompt or task context where appropriate, and human review | Include with AI-assistance disclosure when material | `PUBLIC_OK_WITH_DISCLOSURE` unless inputs or output create other rights issues |
| Broad genre or stylistic influence | High-level influence description | Avoid claims of endorsement or exact derivation | `PUBLIC_OK_WITH_BOUNDARY` |
| Licensed third-party material | License text, licensor, version, scope, term, attribution, modification, and redistribution requirements | Include only within license scope | `PUBLIC_WITH_LICENSE_COMPLIANCE` |
| Public-domain material | Source, jurisdiction, date, and basis for determination | Include with source note when useful | `PUBLIC_OK_WITH_SOURCE_BASIS` |
| Third-party reference | Minimal nominative or descriptive use with source context | Use only as necessary and non-confusing | `PUBLIC_WITH_REVIEW` |
| Third-party material requiring clearance | No adequate license, permission, exception, or public-domain basis | Quarantine from release | `HOLD_FOR_CLEARANCE_OR_REPLACE` |
| Fictional or simulated material | Clear fictional or simulated label | Include only without real-world misrepresentation | `PUBLIC_OK_IF_CLEARLY_LABELED` |
| Unknown or disputed material | Unresolved source, owner, license, or authenticity | Preserve in a restricted review area | `DO_NOT_RELEASE` |

## Rights dimensions

Each release candidate should be reviewed across the dimensions that apply:

| Dimension | Question | Sufficient evidence examples |
|---|---|---|
| Copyright | Who created the protected expression, and what use is authorized? | Original history, assignment, license, public-domain basis, applicable exception analysis |
| Trademark | Could the use imply source, sponsorship, affiliation, or endorsement? | Permission, careful nominative use, non-confusing presentation, clearance review |
| Patent | Does publication or implementation affect patent strategy or practice claimed inventions? | Inventor review, filing strategy, counsel guidance where appropriate |
| Trade secret / confidentiality | Was the material kept secret and subject to confidentiality duties? | Publication approval, confidentiality release, redaction, separate private canonical source |
| Publicity / personality | Does the use exploit or impersonate a real person's identity, likeness, voice, or endorsement? | Direct permission, licensed asset, clearly lawful editorial context |
| Contract / platform terms | Do provider terms, contributor agreements, or licenses restrict use? | Current terms, signed agreement, contributor record |
| Privacy | Does the material expose unnecessary personal or sensitive data? | Minimization, consent where required, redaction, public-source justification |
| Data and model rights | Are datasets, weights, outputs, or generated assets subject to restrictions? | Dataset license, model terms, output review, provenance record |

## Project-specific boundaries

- **OpenAI and ChatGPT:** Technology providers and AI-assistance sources. No partnership, co-ownership, endorsement, employment, or attribution obligation is claimed without a signed agreement.
- **Microsoft, Amazon, Verizon, GitHub, and other providers:** Their names and services remain theirs. Technical compatibility or use does not establish ownership or affiliation.
- **Celebrities and real people:** No generated or fictional statement should be attributed to them as real. Likeness, voice, quotation, endorsement, and publicity uses require appropriate sourcing and clearance.
- **Franchises, characters, music, images, and fictional settings:** Treat as third-party material unless a reliable license, public-domain basis, or applicable exception is documented.
- **Veyrion Prime:** Internal fictional project persona; not a real person or external rightsholder.
- **Fardarter Company / Fardarter Gaming LLC:** Internal house-brand and business-entity tracks. Legal status, registration, ownership, and trademark claims require current official evidence.

## Clearance states

Use one state per release candidate:

```text
PUBLIC_OK
PUBLIC_OK_WITH_DISCLOSURE
PUBLIC_WITH_ATTRIBUTION
PUBLIC_WITH_LICENSE_COMPLIANCE
PUBLIC_WITH_BOUNDARY
REVIEW_BEFORE_BROAD_LICENSE
REVIEW_AND_RECONCILE
HOLD_FOR_CLEARANCE_OR_REPLACE
PRIVATE_CANONICAL_ONLY
DO_NOT_RELEASE
UNKNOWN
```

A release candidate cannot be promoted from a restrictive state by AI confidence, repetition, aesthetic transformation alone, or an internal project declaration.

## Release gate

Before public release or broad licensing, record:

```text
ITEM:
SOURCE CLASS:
CREATOR / RIGHTSHOLDER:
SOURCE ARTIFACT:
DATE:
HASH OR OBJECT ID:
LICENSE / PERMISSION / EXCEPTION:
ATTRIBUTION:
MODIFICATION STATUS:
PRIVACY CHECK:
TRADE-SECRET CHECK:
CLEARANCE STATE:
REVIEWER:
JP APPROVAL:
```

## Separation of questions

Keep these questions distinct:

1. **Who directed or created the work?**
2. **What evidence supports that provenance?**
3. **Who owns or controls each relevant right?**
4. **What permission or legal basis authorizes this specific use?**
5. **What privacy, safety, contractual, or reputational limits remain?**
6. **Who approved the final release?**

A strong answer to one question does not substitute for the others.

## Legal-status boundary

This matrix is a repository governance control, not a legal opinion. High-value, disputed, regulated, or commercially consequential releases may require qualified legal review.
