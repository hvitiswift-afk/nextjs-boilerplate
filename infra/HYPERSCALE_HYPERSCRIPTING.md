# Hyperscale Hyperscripting

Hyperscripting is the Goblin Enclave language for scaling work without losing human approval.

## Chain

```txt
HyperIntent -> Fabian plan -> Goblin route -> Script runner -> Verify -> Approve -> Deploy
```

## Scale levels

```txt
0 Local enclave: Next.js, Postgres, local Goblin LLM, local Fabian LLM.
1 Edge bridge: Cloudflare Worker classifies risk and routes traffic.
2 Server tower: AWS Amplify hosts the app.
3 Worker swarm: queued scripts fetch, clean, route, check, notify, deploy.
4 LLM mesh: OpenAI, Anthropic, Grok-compatible, Goblin, Fabian, local models.
5 2099-2100 Outpost: durable receipts, audit trails, approvals, reversible infrastructure.
```

## Hyperscript object

```ts
type Hyperscript = {
  id: string;
  intent: string;
  planner: "fabian";
  router: "goblin";
  scale: 0 | 1 | 2 | 3 | 4 | 5;
  risk: "read-only" | "draft" | "needs-approval";
  steps: string[];
  verification: string[];
  approvalRequired: boolean;
};
```

## Division

```txt
Fabian writes the plan and hyperscript.
Goblin routes, tracks, and verifies.
Human approval authorizes consequences.
Servers execute only approved steps.
```

## Safety line

No silent deploys. No hidden payments. No secrets in source. No irreversible action without approval. No model output treated as final truth.
