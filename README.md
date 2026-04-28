# Goblin — Lichburn Commercial GeneralAI Console

A Next.js site for the Lichburn Goblin cloud brain: commercial LLM routing, ML pattern engines, script goblins, progress lanterns, AWS hosting, Cloudflare edge routing, and PayPal-ready receipt rails.

## Core algorithm

```txt
GOBLIN(request) = listen → classify → route → draft → verify → approve → deploy
```

The Goblin algorithm keeps an Open Loop: every consequential action needs human approval, logs, and receipts.

## Stack

- Next.js 15 / React 19
- GitHub source control
- AWS hosting path: AWS Amplify, or S3 + CloudFront + Route 53
- Cloudflare edge path: DNS, cache, firewall, Workers algorithm layer
- LLM router: OpenAI / Anthropic / Grok-compatible APIs / local models
- Payments: PayPal checkout links or PayPal webhooks

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## AWS deploy option A: Amplify

1. Open AWS Amplify Hosting.
2. Connect this GitHub repository.
3. Choose branch `main`.
4. Build command: `npm run build`.
5. Start/deploy using Amplify's Next.js preset.
6. Add environment variables for any model APIs or PayPal webhooks.

## AWS deploy option B: S3 + CloudFront

This app currently uses Next.js. For fully static export, update the Next config for static output, then deploy the exported build to S3 and front it with CloudFront.

## Cloudflare Goblin edge algorithm

A Cloudflare Worker can sit in front of API traffic:

```js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const risk = request.method === "POST" ? "needs-approval" : "read-only";
    return new Response(JSON.stringify({
      algorithm: "Goblin",
      path: url.pathname,
      rule: "listen-classify-route-verify-approve",
      risk
    }), { headers: { "content-type": "application/json" } });
  }
}
```

## PayPal boundary

Payments should be processed by PayPal checkout or invoices, then recorded as receipts. Do not store card numbers in this app.

## Lichburn law

- Fluency is tinder. Verification is fire.
- Progress must be visible.
- Receipts, not hidden debt.
- Human approval before consequence.
