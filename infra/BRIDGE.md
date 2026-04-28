# Goblin Bridge Coordination

This bridge coordinates the remainders between GitHub, AWS, Cloudflare, PayPal, LLM providers, and human approval.

## Bridge law

```txt
request -> edge -> app -> model router -> scripts -> approval -> deploy/log/receipt
```

## Remainder checklist

### 1. AWS account and hosting

Create or open your AWS account, then choose one hosting path:

- AWS Amplify for fastest Next.js deployment.
- S3 + CloudFront for static hosting after converting the app to static export.
- ECS/App Runner/Lambda for a larger server-backed version later.

Use `infra/aws-amplify.yml` as the Amplify build spec.

### 2. Cloudflare account and edge

Create or open your Cloudflare account, add your domain, and set nameservers at the registrar.

Use `infra/cloudflare-worker-goblin.js` as the first Goblin edge Worker.

### 3. Domain bridge

Point DNS through Cloudflare. Then route traffic to AWS:

```txt
Domain registrar -> Cloudflare DNS -> AWS Amplify/CloudFront -> Next.js Goblin site
```

### 4. Secrets and environment variables

Never commit secrets. Add them only in AWS/Cloudflare dashboards.

Suggested environment variable names:

```txt
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
XAI_API_KEY=
PAYPAL_CLIENT_ID=
PAYPAL_WEBHOOK_ID=
APPROVAL_REQUIRED=true
```

### 5. PayPal receipt spine

Use PayPal checkout links or PayPal app/webhooks. Do not store card numbers.

```txt
payment -> webhook -> verify -> receipt log -> unlock feature
```

### 6. Human approval gate

All consequence-bearing actions should wait for approval:

- payments
- deploys
- outbound email
- data deletion
- model-agent actions
- infrastructure changes

### 7. Logs

Minimum logs:

```txt
timestamp
request_id
actor
model/tool
risk_level
approval_status
result
receipt_id
```

## Goblin algorithm

```txt
listen -> classify -> route -> draft -> verify -> approve -> deploy
```

## Remainder owners

```txt
JP: account ownership, payment approval, final deployment approval
GitHub: source of truth
AWS: server tower
Cloudflare: edge gate and DNS
PayPal: receipt spine
LLMs: language lanterns
Goblin: router and progress lantern
```

## Safety line

No hidden debt. No secret keys in GitHub. No action without approval.
