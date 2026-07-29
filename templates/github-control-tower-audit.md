# GitHub Control Tower Audit

> Use this template for the bounded $100 USD pilot deliverable. Remove all instructional text before delivery. Keep secrets, credentials, payment data, customer-private information, and confidential records out of public repositories.

## 1. Audit identity

| Field | Value |
|---|---|
| Audit ID | `JP-AUDIT-...` |
| Repository | `owner/repository` |
| Repository visibility | public / authorized private read-only |
| Buyer or requester | private receipt reference; do not expose personal data publicly |
| Scope accepted | YYYY-MM-DD |
| Audit snapshot time | YYYY-MM-DDTHH:MM:SSZ |
| Default branch |  |
| Head SHA reviewed |  |
| Delivery due date | YYYY-MM-DD |
| Delivery date | YYYY-MM-DD |
| Auditor | JP (`@hvitiswift-afk`) |

## 2. Scope lock

### Included

- one repository;
- up to 25 open pull requests;
- up to 50 open issues;
- visible checks, workflows, repository guidance, and deployment boundaries;
- one report and one clarification round.

### Explicitly excluded

- credentials, secret rotation, or account recovery;
- destructive cleanup, merging, branch deletion, or repository-setting changes;
- code-level penetration testing or security certification;
- production deployment, domains, billing, or payment execution;
- legal, tax, investment, or intellectual-property opinions;
- work outside the written scope.

## 3. Executive result

**Overall state:** PASS / HOLD / REPAIR / BLOCKED / REFERENCE  
**Primary constraint:**  
**Highest-value next action:**  
**Evidence confidence:** high / medium / low  

Summarize the repository's current operating condition in five sentences or fewer. Separate observed facts from recommendations and unknowns.

## 4. Repository and workflow map

| Lane or component | Current state | Evidence | Owner | Verification path | Next controlled action |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

## 5. Top five priority findings

### Finding 1 — [title]

- **Observed:**
- **Why it matters:**
- **Evidence:**
- **Risk:** low / moderate / high
- **Recommended action:**
- **Authority required:**
- **Receipt required:**

### Finding 2 — [title]

- **Observed:**
- **Why it matters:**
- **Evidence:**
- **Risk:** low / moderate / high
- **Recommended action:**
- **Authority required:**
- **Receipt required:**

### Finding 3 — [title]

- **Observed:**
- **Why it matters:**
- **Evidence:**
- **Risk:** low / moderate / high
- **Recommended action:**
- **Authority required:**
- **Receipt required:**

### Finding 4 — [title]

- **Observed:**
- **Why it matters:**
- **Evidence:**
- **Risk:** low / moderate / high
- **Recommended action:**
- **Authority required:**
- **Receipt required:**

### Finding 5 — [title]

- **Observed:**
- **Why it matters:**
- **Evidence:**
- **Risk:** low / moderate / high
- **Recommended action:**
- **Authority required:**
- **Receipt required:**

## 6. Pull-request triage

Use exactly one recommended outcome per reviewed pull request.

| PR | Purpose | Current checks | Dependencies | Conflict or supersession | Recommended outcome | Next action |
|---|---|---|---|---|---|---|
|  |  |  |  |  | merge / repair / supersede / close / hold |  |

## 7. Issue triage

| Issue | Problem represented | Duplicate or dependency | Evidence quality | Priority | Recommended action |
|---|---|---|---|---|---|
|  |  |  |  | P0 / P1 / P2 / reference |  |

## 8. Check and deployment boundary

| Check or deployment lane | State | Repository-owned or external | Blocking reason | Next controlled action |
|---|---|---|---|---|
|  | pass / fail / queued / blocked / unknown |  |  |  |

Do not describe prepared workflows as deployed systems. Do not describe external account, billing, domain, or permission failures as repository code failures without evidence.

## 9. Recommended action sequence

### First 24 hours

1. 
2. 
3. 

### Next seven days

1. 
2. 
3. 

### Hold until authorized or unblocked

1. 
2. 

## 10. Ownership and approval map

| Consequential action | Proposed owner | Approval required | Evidence before action | Receipt after action |
|---|---|---|---|---|
|  |  |  |  |  |

## 11. Risk and rollback

| Risk | Trigger | Prevention | Rollback or recovery |
|---|---|---|---|
|  |  |  |  |

## 12. Unknowns and limitations

List missing access, incomplete history, unavailable logs, ambiguous ownership, private dependencies, or other limits. Unknown must remain unknown; do not convert it into a confident claim.

## 13. One-page control-tower plan

```text
mission → controlling issue → branch → draft PR → checks → review
        → explicit approval → merge → readback → receipt
```

- **Mission:**
- **Controlling issue:**
- **Active implementation branch:**
- **Current reviewable PR or PR chain:**
- **Required checks:**
- **External-action gate:**
- **Final approval point:**
- **Post-action readback:**
- **Receipt path:**

## 14. Delivery and acceptance

- **Promised sections present:** yes / no
- **Clarification window ends:** YYYY-MM-DD
- **Buyer response:** pending / accepted / missing promised section / scope expansion requested
- **Revision required under original scope:** yes / no
- **New work requires separate scope:** yes / no

## 15. Audit receipt

```text
Audit ID:
Repository:
Snapshot SHA:
Scope version:
Delivery artifact hash or immutable reference:
Price agreed: $100 USD / other separately agreed amount
Payment settlement evidence: private external-provider receipt reference
Delivery state: DELIVERED / ACCEPTED / REVISED / CANCELLED
External actions performed: exact list or NONE
Acceptance state:
Next controlled action:
```

This report is an operations and repository-governance review based on the stated evidence boundary. It is not a legal opinion, tax opinion, security certification, ownership determination, earnings guarantee, deployment guarantee, or authorization for an excluded action.
