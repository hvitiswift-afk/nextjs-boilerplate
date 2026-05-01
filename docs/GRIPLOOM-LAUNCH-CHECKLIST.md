# GRIPLOOM Launch Checklist

GRIPLOOM launches only after receipts, build, deploy, browser check, and smoke tests agree.

```txt
Verify, deploy, open, score, tick, verify.
```

## 1. Local receipt checks

Run all deterministic sample checks:

```bash
npm run griploom:checks
```

Expected receipt rail:

```txt
griploom:id:check          passes
griploom:screenplay:check  passes
griploom:ml:check          passes
griploom:tick:check        passes
```

## 2. Build verifier

Run the full local launch gate:

```bash
npm run griploom:verify
```

This runs:

```txt
1. npm run griploom:checks
2. npm run build
```

Launch law:

```txt
GRIPLOOM is launch-ready only when sample receipts pass and the Next.js build completes.
```

## 3. GitHub Actions verifier

Workflow:

```txt
.github/workflows/griploom-verify.yml
```

Expected workflow steps:

```txt
checkout
setup Node 20
npm ci
npm run griploom:verify
```

Use this as the code-proof rail. Vercel blocked-account statuses are hosting/account failures unless their logs show a TypeScript, Next.js, or dependency error.

## 4. Primary deploy rail

Use Netlify as the primary GRIPLOOM deployment rail.

```txt
name: lichburn-v0-2-8
site_id: 21d3bb41-3a69-4a7d-b6c6-e873cde8ee2f
primary_url: http://lichburn-v0-2-8.netlify.app
```

Deploy from the repository root with the generated Netlify MCP upload command:

```bash
npx -y @netlify/mcp@latest --site-id 21d3bb41-3a69-4a7d-b6c6-e873cde8ee2f --proxy-path "<generated-proxy-path>"
```

## 5. Browser checklist

Open the live site and verify:

```txt
/ loads
/griploom loads
Run ML Sample works
Send SAME-TICK works
Graph preview appears
Beam rail appears
BLACKLETTER graph legend appears
Mesh health appears
Mesh scorecard appears
Vitality field appears
Repeat beam cards appear
Beam filters update graph and cards together
Raw Results opens
No visible client crash
```

## 6. API smoke tests

GRIPLOOM ML:

```bash
curl -X POST https://lichburn-v0-2-8.netlify.app/api/ml/score \
  -H "content-type: application/json" \
  --data @examples/griploom-ml-score.sample.json
```

SAME-TICK:

```bash
curl -X POST https://lichburn-v0-2-8.netlify.app/api/tick \
  -H "content-type: application/json" \
  --data @examples/griploom-tick.sample.json
```

Expected smoke-test shape:

```txt
/api/ml/score returns product, rule, mesh, field, and results
/api/tick returns ok/status/tick receipt fields or a clear validation error
```

## 7. Final launch receipt

After verification and smoke tests, record:

```txt
commit_sha
GitHub Actions result
Netlify deploy URL
/griploom browser check result
/api/ml/score smoke result
/api/tick smoke result
known blockers
```

Final rule:

```txt
No hidden launch. Every launch gets a receipt.
```
