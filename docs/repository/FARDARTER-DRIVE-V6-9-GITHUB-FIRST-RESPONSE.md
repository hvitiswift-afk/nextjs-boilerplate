# Fardarter Drive™ v6.9 — Authorized GitHub First Response

## Purpose

Fardarter Drive™ v6.9 turns the v6.8 contact gate into one deterministic, public-safe first response for a genuine external Control Tower Audit requester. The requester’s GitHub account is the verified identity (`GITHUB_ISSUE_AUTHOR`) and the exact audit-request issue is the authorized channel (`EXACT_GITHUB_ISSUE_THREAD`).

The response is a clarification receipt only. It is not acceptance, an order, a reservation, a contract, an invoice, payment proof, work start, delivery acceptance, buyer consent, or a canonical event.

## Required gate

The controller requires all of the following before it may post:

1. An open issue, not a pull request.
2. Exact title prefix `[Audit request]:`.
3. Labels `audit-fit-check` and `contact-github-authorized`.
4. No `contact-channel-unresolved` label.
5. The v6.8 marker `<!-- jp-audit-github-contact-v1 -->` already present.
6. An external human GitHub author. The repository owner, bots, and automation users are blocked.
7. No detected public email address, credential assignment, private-key block, provider transaction identifier, or banking-number disclosure.
8. No existing v6.9 response marker.

## One-response rule

The controller may post no more than one response per issue. The immutable marker is:

```text
<!-- jp-audit-github-first-response-v1 -->
```

A duplicate issue, edit, label event, or comment event cannot create another response after the marker exists. The controller adds `contact-github-replied` after a successful response and removes `contact-github-reply-blocked`.

When an authorized case fails an external-human or public-safety gate, the controller adds `contact-github-reply-blocked` and `needs-jp-review`, removes `contact-github-replied`, and posts no automatic public explanation.

## Public field handling

The workflow may validate and summarize only bounded form fields:

- exact GitHub repository URL;
- enumerated repository relationship;
- enumerated review size;
- enumerated package choice;
- whether the timing field was provided.

The operating problem, desired outcome, priorities, timing text, and additional notes are never echoed automatically. They may be checked for presence or public-safety conditions only.

## Clarification behavior

The single response may request correction of an invalid repository URL, missing authority, missing problem or outcome, an unsupported review size, missing timing, or an invalid package choice. It may also explain that larger-than-published scope or implementation work requires a separate scope decision.

No automatic follow-up is permitted. A later incoming message may be handled only through separately authorized controls.

## Privacy and consequence boundaries

The controller never:

- scrapes or guesses an email address;
- sends email;
- contacts a different GitHub account or issue;
- echoes free-form private or sensitive text;
- accepts or changes scope;
- confirms payment or settlement;
- starts work or consumes ACTIVE capacity;
- selects legal terms or resolves a dispute;
- treats delivery, silence, labels, reactions, files, or message text as buyer consent;
- appends event 2 or changes canonical state.

## Canonical baseline

```text
Event head                 1
Event digest               3859eac9c63bef83624111704d38cf217b0c1a4ece6df874e72a76e9fb1ffc3b
Reconciliation head        1
Reconciliation digest      9f4f878cc0f8f2ddfa7bbdb594d2b9164064acd8901301404aed57b4065eca0f
SCOPE_DRAFTED              1
HUMAN_ACCEPTED             0
ACTIVE                     0
Orders / gross / settled   0 / $0 / $0
```

## Verification and rollout

The manifest digest is `af6e9fd7c97dcb97f511f92b5d1f8baf907d6ea8b45c3ccdeef00a2d18eef3d9`. The deterministic verifier checks the manifest, schema, workflow source, v6.8 dependency, issue template, outreach wording, parser fixtures, sensitive-data fixtures, package wiring, canonical heads, and zero-effect boundaries.

No live self-test may message a requester. The workflow remains dormant until a genuine external audit request independently satisfies every gate.
