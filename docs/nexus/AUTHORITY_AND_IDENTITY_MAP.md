# Nexus Authority and Identity Map

**Control:** `NEXUS-AUTHORITY-MAP-V1`  
**Record date:** 2026-08-01 (America/Detroit)  
**Scope:** Fardarter / V# / MATADATA / Nexus documentation and repository governance

## Core rule

Authority follows a verified human or legal source; it does not arise from a project name, persona, model output, repository label, imagined transfer, future claim, or technical capability.

## Identity classes

| Class | Current identity | May describe or propose | May make consequential decisions | Required boundary |
|---|---|---:|---:|---|
| Human principal | Justin Lee Rackham (JP) | Yes | Yes, within law and provider authority | Final explicit approval and receipt |
| House-brand track | Fardarter Company | Yes | No independent agency | Acts only through an authorized human or verified legal entity |
| Business-entity track | Fardarter Gaming LLC | Yes, with status qualification | Only after current legal existence and representative authority are verified | Official registry or signed governing evidence |
| Project system | V#, MATADATA, Nexus, Phoenix Suite, Center Processing Nexus, User Authority Core, Evidence Council, Continuity Sandbox, Territory systems | Yes | No independent legal or human authority | Treat as project lanes, architectures, or artifacts |
| Fictional persona | Veyrion Prime | Yes, when labeled fictional | Never | Not a person, signer, witness, account holder, owner, or autonomous speaker |
| AI-assistance source | OpenAI ChatGPT | Yes, under human direction | No independent authority | Tool output requires human review and may not imply partnership |
| External provider or rightsholder | OpenAI, Microsoft, Amazon, Verizon, GitHub, other third parties | Only from verified sources | Only through their authorized systems and representatives | No ownership, partnership, endorsement, or control claim without evidence |

## Authority invariants

1. **JP gate:** JP remains the final human approver for merge and consequential use.
2. **Exact-action gate:** Approval for one action does not authorize a broader, repeated, modified, or future action.
3. **Provider gate:** Account, payment, submission, deployment, or publication actions require an authorized provider surface.
4. **Identity gate:** A fictional persona, project system, AI model, or brand label cannot satisfy a human identity, signature, witness, or legal-authority requirement.
5. **Evidence gate:** Repository text is evidence of repository text. It is not proof of an external event unless the external event has its own reliable receipt.
6. **No retroactive authority:** A successful technical result cannot retroactively create missing consent, rights, or authorization.
7. **No silent delegation:** Human approval may not be inferred from inactivity, prior broad enthusiasm, a saved preference, or a generated statement.
8. **No money movement:** Financial actions require exact amount, recipient, provider, source account, confirmation, and receipt.

## Decision matrix

| Action class | AI may prepare | AI may execute through a connected tool | JP confirmation required | External receipt required |
|---|---:|---:|---:|---:|
| Read public repository state | Yes | Yes | No | Repository object or API response |
| Draft public-safe documentation | Yes | Yes, on a dedicated review branch | Standing task scope is sufficient | Commit and pull request |
| Modify application code | Yes | Yes, when explicitly in scope | Required before merge or consequential release | Commit, checks, and pull request |
| Merge a pull request | May recommend | Only with exact merge authorization | Yes | Merge commit |
| Publish or deploy | May prepare | Only through an authorized provider and exact scope | Yes | Provider deployment receipt and public readback |
| Submit an application or form | May prepare | Only through the authorized form and exact one-submit gate | Yes | Confirmation receipt |
| Send external communications | May draft | Only through authorized account and recipient resolution | Yes unless the exact sending instruction is already explicit | Sent-message receipt |
| Change account, billing, domain, OAuth, or security settings | May explain or prepare | Only through authorized provider tools | Yes | Provider receipt |
| Move money or create a financial obligation | May analyze | No without an authorized financial provider action and exact confirmation | Always | Provider transaction receipt |
| Assert legal entity, ownership, license, endorsement, or partnership | May summarize evidence | No unsupported assertion | Yes, supported by current reliable evidence | Registry, signed agreement, license, or equivalent |

## Statement-source labels

Project material should use one of these labels when the source class matters:

- `VERIFIED_REPOSITORY_FACT`
- `VERIFIED_PROVIDER_FACT`
- `DIRECT_HUMAN_STATEMENT`
- `USER_PROVIDED_ASSERTION_UNVERIFIED`
- `AI_ASSISTED_DRAFT`
- `INFERENCE`
- `PLAN_OR_TARGET`
- `FICTIONAL_OR_SIMULATED`
- `UNKNOWN_OR_DISPUTED`

A statement may move to a stronger class only when the required evidence is preserved.

## Real-person representation

A real person's position, quote, consent, approval, authorship, or contribution may be represented only through:

- their direct, attributable statement;
- a verified repository or provider record;
- a signed or otherwise reliable record;
- a clearly identified quotation with source context; or
- a fictional or AI-generated label that prevents confusion with a real statement.

Similarity of style, an inferred intention, or a persona role is insufficient.

## Precedence

For the exact fact being decided, use this order:

1. Current verified external-provider or official-registry evidence.
2. Signed agreements, licenses, or direct attributable human instructions.
3. Current reviewed repository source and receipts.
4. Earlier repository history with explicit supersession status.
5. User-provided assertions labeled unverified.
6. Inference, simulation, plan, fiction, or unknown material.

Higher precedence for one fact does not grant authority over unrelated facts.

## JUSTIN gate

Before a consequential action, the final review should state:

```text
TARGET:
ACTION:
AUTHORITY SOURCE:
RIGHTS BASIS:
SAFETY / PRIVACY CHECK:
EXPECTED RESULT:
ROLLBACK OR REVOCATION:
RECEIPT DESTINATION:
JP CONFIRMATION:
```

Missing fields cause a stop, downgrade to preparation-only, or return for evidence.
