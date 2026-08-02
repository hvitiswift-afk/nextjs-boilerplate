# Armitron v25 — V# T# C# Multiverse Exchange

## Purpose

Armitron v25 adds a distinct-world and named-universe exchange system to the
verified MATADATA Digital Human stack.

The words **world**, **universe**, **transfer**, and **multiverse** refer to
software namespaces, governance domains, ledgers, schemas, and internal models.
They do not claim physical alternate universes, time travel, future observation,
backward information transmission, consciousness transfer, biological identity
transfer, legal identity transfer, or automatic consent.

JP remains the human final authority under `SELF-JP-001`.

## Recovered V# T# C# lineage

The earlier fenced exchange established these separate worlds:

### V# — Values and Continuity World

V# carries:

- values;
- authority;
- identity labels;
- commitments;
- evidence;
- continuity.

V# answers: **what matters, who has authority, what was committed, and what
proof or continuity must be preserved?**

### T# — Temporal and Phase World

T# carries:

- timelines and branches;
- triggers and review times;
- phases;
- forecasts;
- expiry;
- backcasts and return-to-present summaries.

T# answers: **when did it happen, when should it be reviewed, what scenario is
being modeled, and when does it expire?**

Forecasts are scenarios. Backcasts are planning analyses. Neither is evidence
of observing the future or transmitting information backward.

### C# — Control and Closure World

C# applies ten ordered fences:

1. Truth and provenance
2. Identity and exact target
3. Privacy minimization
4. Capability
5. Reversibility
6. Consequence
7. Human gate
8. Duplicate and idempotency
9. Readback
10. Closure

The recovered v0.2 engine implemented layers 0 through 8 and carried closure in
its broader semantics. V25 makes Closure an explicit tenth fence. A transfer is
not complete until arrival, destination acceptance, readback, the return route,
and terminal closure are recorded.

## Universe identity

Every universe belongs to exactly one world and receives a stable identifier:

```text
UNI-{WORLD_CODE}-{NUMBER_6_DIGITS}-{NAME_SLUG}-V{VERSION}
```

Examples:

```text
UNI-V-000001-VALUES-CONTINUITY-ROOT-V1
UNI-T-000001-TEMPORAL-BRANCH-ROOT-V1
UNI-C-000001-CONTROL-CLOSURE-ROOT-V1
```

Each universe preserves its own:

- world identity;
- number and name;
- aliases;
- version;
- governance;
- privacy state;
- append-only history;
- receipts;
- rollback or correction references;
- local authority.

Universe numbers are unique within a world. IDs and aliases are unique in the
registry. Corrections create new versions or receipts; they do not silently
rewrite prior identity.

## Links and V-10

Cross-world routes are explicit registry links. Every link declares:

- source and target universe;
- direction;
- allowed activity scopes;
- revocability;
- isolation support;
- return-route requirement;
- active or inactive status.

The gate is:

```text
V-10_TRANSVERSE_TRANSFER_TRANSFORM
```

V-10 means the payload may be copied, translated, transformed, or ported into a
destination schema while retaining source identity, source digest, and return
route. It does not merge worlds or erase source history.

## Exchange envelope

An exchange envelope records:

- source world and universe;
- destination world and universe;
- link and V-10 gate;
- activity type;
- subject;
- redacted payload plus payload digest;
- transform plan;
- evidence class and evidence pointers;
- source occurrence time, observation time, trigger time, and expiry;
- idempotency hash;
- settlement state;
- return route;
- envelope and record digests.

Supported activities include:

- messages and replies;
- sourced current-event observations;
- forecasts and backcasts;
- commitments, proposals, warnings, and outcomes;
- code patches and commits;
- test results and artifacts;
- generic exchanges;
- market observations;
- simulation-first trade proposals;
- provider-confirmed trade execution receipts;
- controls, arrival receipts, and closure receipts.

## Current events

A current-event envelope separates:

- publisher and source URL;
- headline;
- event occurrence time when known;
- time observed by the exchange;
- fact summary;
- inference;
- confidence;
- correction reference.

The event enters V# as evidence and continuity, T# as timing and expiry, and C#
for provenance, privacy, consequence, readback, and closure.

## Code and artifacts

Code exchange may include:

- patch hash;
- commit SHA;
- branch and repository identity;
- test run and artifact identity;
- build result;
- destination transform plan;
- destination acceptance;
- closure receipt.

A code envelope is not a deployment receipt. Deployment remains a separately
controlled external action with provider readback.

## Messages and ordinary exchange

Messages can move between registered universes when:

- the route permits `message`;
- the target is exact;
- private data is minimized;
- the exchange is reversible or internal;
- the idempotency key is clear;
- destination readback is available;
- a return route and closure plan exist.

External email, publication, or third-party contact still requires the exact
recipient and requested effect. A private internal message envelope does not
itself send an external message.

## Markets and trading

### Allowed exchange objects

- sourced market observations;
- price or volatility snapshots;
- thesis and risk notes;
- simulated scenarios;
- simulation-first trade proposals;
- broker/provider execution receipts supplied after an authorized order.

### Real financial order boundary

The multiverse exchange does not autonomously submit live financial orders.
A provider-confirmed execution receipt requires:

- exact broker provider;
- exact account reference;
- instrument;
- side;
- order type;
- quantity;
- price or limit when applicable;
- time in force;
- risk review;
- JP target-specific approval;
- broker authentication;
- provider order reference and readback;
- duplicate clearance;
- settlement and closure records.

Without those fields and evidence, C# blocks the execution envelope.

## Google Cloud A2A lane

The P5 Google lane includes:

- an A2A 1.0-style Agent Card at `/.well-known/agent-card.json`;
- a JSON-RPC A2A endpoint at `/a2a`;
- skills for messages, current events, code/artifact transfer, and market
  observation/trade proposals;
- a non-root Cloud Run container;
- strict Origin validation;
- authentication that fails closed until production OIDC verification exists;
- a Google Cloud Marketplace AI-agent readiness profile.

The Agent Card, container, and endpoint code do not prove deployment,
validation, Marketplace submission, listing, or approval.

## GitHub enterprise and Google deployment

The repository includes an enterprise target policy and a manual keyless
deployment workflow.

The intended identity chain is:

```text
protected GitHub environment
→ GitHub Actions OIDC token
→ Google Workload Identity Federation
→ scoped Google service account
→ Artifact Registry
→ Cloud Run
→ provider deployment readback
```

Static Google service-account key files are prohibited. Production deployment is
blocked until:

- the GitHub environment is configured and approved;
- Google project and region are verified;
- the Workload Identity pool and provider are verified;
- the service account and subject restrictions are verified;
- Artifact Registry and Cloud Run names are verified;
- production access-token verification exists;
- the exact workflow run receives `DEPLOY` confirmation.

JP reports GitHub Enterprise capability, but the connected GitHub app currently
shows only the personal `hvitiswift-afk` installation and no organization
membership. No organization transfer or enterprise installation is claimed.

## Catalog positioning

Official Google documentation reviewed for this build describes managed partner
lanes for Anthropic Claude and xAI Grok. This build did not locate an official
Google managed-partner Model Garden lane for OpenAI models.

That observation does not establish a right to publish MATADATA as a foundation
model. The prepared route is a Google Cloud Marketplace AI-agent/SaaS product
using A2A and a validated Agent Card.

## Legacy recovery receipt

Recovered sources:

- Gmail exchange thread: `V# ↔ T# ↔ C# Fenced Exchange — Automated Handoff`;
- Gmail bootstrap: `V# T# C# Cross-Account Exchange Bootstrap`;
- Drive ledger: `V# T# C# Note Exchange — Live Ledger`;
- Python engine: `vsharp_tsharp_csharp_exchange.py`;
- protocol: `V#_T#_C#_FENCED_EXCHANGE_V0.2`.

V25 preserves the recovered definitions, phase model, append-only receipt law,
private/reversible autonomy boundary, and “no receipt means not verified” rule.
It extends them with named/numbered universes, explicit V-10 routes, a tenth
Closure fence, A2A discovery, Cloud Run readiness, and enterprise deployment
policy.
