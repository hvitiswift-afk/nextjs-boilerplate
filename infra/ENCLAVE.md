# Goblin Enclave

Own the control plane. Rent outer compute only when useful.

## Outpost

Goblin Enclave / 2099-2100 Outpost

## Layers

- Next.js command console
- API route for Goblin tasks
- LLM router: OpenAI, Anthropic, Grok-compatible, local model
- Memory vault: Postgres or SQLite
- Script runner for controlled jobs
- Cloudflare Worker edge bridge
- AWS Amplify server tower
- PayPal receipt spine
- Human approval gate

## Law

No secrets in GitHub.
No hidden debt.
No silent automation.
No irreversible action without approval.
Model output is draft until verified.

## First build

1. Run the site locally.
2. Add /api/goblin.
3. Add docker-compose for local Postgres and Ollama-compatible LLM endpoint.
4. Deploy web to AWS Amplify.
5. Put Cloudflare in front.
6. Add PayPal webhooks later.
