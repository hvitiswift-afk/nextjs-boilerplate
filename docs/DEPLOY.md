# GRIPLOOM Deploy Checklist

GRIPLOOM is a deployable production-geometry console for scoring repeat collaboration beams, challenging them with GOBLIN ML, gating claims with BLACKLETTER, and recording operational pulses with SAME-TICK.

## Target

Current Netlify project:

```text
name: lichburn-v0-2-8
site_id: 21d3bb41-3a69-4a7d-b6c6-e873cde8ee2f
primary_url: http://lichburn-v0-2-8.netlify.app
```

## Local development

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
http://localhost:3000/griploom
```

## Netlify local development

Use Netlify Dev when testing Netlify behavior locally:

```bash
netlify dev
```

Do not commit secrets. Store production secrets in Netlify environment variables.

## Build

```bash
npm run build
```

Pass condition:

```text
Next.js build completes without type or route errors.
```

## Deploy to Netlify

Run from the repository root with the current Netlify MCP upload command generated for the site:

```bash
npx -y @netlify/mcp@latest --site-id 21d3bb41-3a69-4a7d-b6c6-e873cde8ee2f --proxy-path "<generated-proxy-path>"
```

For a non-blocking upload:

```bash
npx -y @netlify/mcp@latest --site-id 21d3bb41-3a69-4a7d-b6c6-e873cde8ee2f --proxy-path "<generated-proxy-path>" --no-wait
```

## Live routes

```text
/
/griploom
/api/ml/score
/api/tick
```

## Smoke test: GRIPLOOM ML score

```bash
curl -X POST https://lichburn-v0-2-8.netlify.app/api/ml/score \
  -H "content-type: application/json" \
  --data @examples/griploom-ml-score.sample.json
```

Expected response fields:

```text
product
rule
mesh
field
results
```

Pass condition:

```text
The route returns beam scores, GOBLIN flags, BLACKLETTER decisions, mesh density, and vitality field values.
```

## Smoke test: SAME-TICK

```bash
curl -X POST https://lichburn-v0-2-8.netlify.app/api/tick \
  -H "content-type: application/json" \
  --data @examples/griploom-tick.sample.json
```

Expected response fields:

```text
ok: true
tick_id
status: stored_mock
metrics_updated: true
```

## Browser verification

Open:

```text
https://lichburn-v0-2-8.netlify.app/griploom
```

Checklist:

```text
Home link works.
Run ML Sample works.
Send SAME-TICK works.
Graph preview appears.
Polarity styling appears.
Mesh scorecard appears.
Vitality field appears.
Repeat beam cards appear.
Raw Results opens.
No visible client crash.
```

## Troubleshooting

### Build fails

Check:

```text
TypeScript errors
missing imports
incorrect route path
Next.js app directory conflicts
package install failures
```

Then run:

```bash
npm run build
```

### API route fails

Check:

```text
request method is POST
content-type is application/json
sample JSON is valid
route path is /api/ml/score or /api/tick
```

### Netlify deploy command expires

Generate a fresh deploy command through the connected Netlify project deploy operation.

### Secrets needed

Use Netlify environment variables. Do not commit secrets to the repo.

## Launch rule

```text
Deploy, open, score, tick, verify.
```

## System mantra

```text
GRIPLOOM: score, challenge, permit, pulse, publish.
```
