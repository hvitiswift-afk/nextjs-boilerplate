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

## Goblin observer routes

Earth/Mars observer routing is documented, CI-gated, release-gated, receipt-sampled, release-receipt printable, and release-gates tracked.

```bash
npm run observer:routes
npm run observer:routes:check
npm run observer:release:receipt
```

Observer route rails:

- `docs/observer-route-harness.md`
- `docs/observer-route-ci.md`
- `docs/observer-route-release.md`
- `docs/observer-route-release-gates.md`
- `.github/workflows/observer-routes.yml`
- `examples/observer-route-scenarios.sample.json`
- `examples/observer-route-release.receipt.sample.json`
- `scripts/print-observer-route-release-receipt.mjs`

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

---

# GRIPLOOM AI

Production Geometry from Verified Credits.

```txt
GRIPLOOM ML ranks.
GOBLIN ML challenges.
BLACKLETTER permits.
Only sourced, non-causal collaboration signals publish.
```

## GRIPLOOM modules

- `GRIPLOOM ML`: scores repeat beams and production geometry signals.
- `GOBLIN ML`: flags weak beams, low confidence, duplicates, gaps, and overclaim risk.
- `BLACKLETTER`: evidence and claim-safety gate.
- `SAME-TICK`: event intake for scanner/barcode/QR/inventory/credit events.

## GRIPLOOM product rails

- `docs/GRIPLOOM-HATS.md`: headwear beams, patch grammar, mesh/crown roles, and release gates.
- `docs/GRIPLOOM-ID-BARCODER.md`: function-shaped IDs, barcode/QR payloads, scanner routing, and SAME-TICK receipts.
- `docs/GRIPLOOM-SCREENPLAY-INDUSTRY-ID.md`: whole-industry screenplay IDs for work, unit, department, role, scene, object, SAG-AFTRA/IATSE reference boundaries, barcode, QR, and scanner receipts.
- `docs/GRIPLOOM-SCIENCE-SOURCE-RAIL.md`: Phys.org, IFLScience, and unverified FTLScience source-intake boundaries.
- `docs/GRIPLOOM-CHECKS-INDEX.md`: explicit command, sample, and verifier index for checked GRIPLOOM rails.
- `docs/GRIPLOOM-DEPLOYMENT-STATUS.md`: source, Netlify, and Vercel billing/account status receipt.
- `docs/VERCEL-API-TOKEN-SETUP.md`: safe Vercel token creation, secret storage, and no-commit rules.
- `docs/VERCEL-BILLING-BLOCKER.md`: Vercel account/billing blocker note for expected Vercel check failures.
- `examples/griploom-id-barcoder.sample.json`: sample hat, shirt, and scanner IDs with shape, barcode, QR, scanner route, and BLACKLETTER fields.
- `examples/griploom-screenplay-industry-id.sample.json`: sample performer, wardrobe, and grip screenplay IDs with guild-boundary safety fields.

## GRIPLOOM science source rail

```txt
Read → tag → compare → cite → label uncertainty → publish only sourced summaries.
```

Source rail:

```txt
Phys.org     active science news and research-reporting source
IFLScience   active popular-science news and explainer source
FTLScience   unverified candidate until a canonical URL is confirmed
```

Science intake document:

```txt
docs/GRIPLOOM-SCIENCE-SOURCE-RAIL.md
```

Science rule:

```txt
Science news opens the gate. Primary evidence carries the beam.
```

## GRIPLOOM checks

Full checks index:

```txt
docs/GRIPLOOM-CHECKS-INDEX.md
```

```bash
npm run security:secrets:check
npm run griploom:id:check
npm run griploom:screenplay:check
npm run griploom:ml:check
npm run griploom:tick:check
npm run griploom:launch:check
npm run griploom:launch:print
npm run griploom:launch:print:check
npm run griploom:checks
npm run griploom:verify
```

Check rails:

```txt
security:secrets:check     verifies secret ignore rules and scans for committed token-looking values
griploom:id:check          verifies GRIPLOOM ID/barcode/QR sample shape
griploom:screenplay:check  verifies screenplay industry ID sample shape
griploom:ml:check          verifies ML score sample beam/vitality shape
griploom:tick:check        verifies SAME-TICK event sample shape
griploom:launch:check      verifies launch receipt sample shape
griploom:launch:print      prints the launch receipt operator summary
griploom:launch:print:check verifies the launch receipt printer output
griploom:checks            runs secret-boundary and sample receipt checks
griploom:verify            runs sample receipts, then Next.js build
```

GitHub Actions verification:

```txt
.github/workflows/griploom-verify.yml
```

The workflow runs `npm ci` and `npm run griploom:verify` on pushes to `main`, pull requests to `main`, and manual workflow dispatch.

Launch checklist:

```txt
docs/GRIPLOOM-LAUNCH-CHECKLIST.md
```

Use the checklist for the full verify → deploy → browser → API smoke-test receipt path.

Deployment status receipt:

```txt
docs/GRIPLOOM-DEPLOYMENT-STATUS.md
```

Use the deployment status receipt to separate source verification, Netlify deployment, and Vercel account/billing gates.

Launch receipt template:

```txt
docs/GRIPLOOM-LAUNCH-RECEIPT.md
```

Use the receipt template to record each deploy/release candidate result.

Machine-readable launch receipt sample:

```txt
examples/griploom-launch.receipt.sample.json
```

Validate it with:

```bash
npm run griploom:launch:check
```

Print the operator summary with:

```bash
npm run griploom:launch:print
```

Check the printer with:

```bash
npm run griploom:launch:print:check
```

## Vercel API token setup

Generate Vercel API tokens in the Vercel dashboard, not in this repo.

```txt
docs/VERCEL-API-TOKEN-SETUP.md
```

Token rule:

```txt
A token is a key, not a receipt. Receipts can be committed. Keys cannot.
```

Use secret storage such as local `.env.local`, Vercel environment variables, or GitHub Actions secrets. Never commit token values.

Check a locally stored token without printing it:

```bash
VERCEL_TOKEN="your-token-here" npm run vercel:token:check
```

Check repository secret boundaries:

```bash
npm run security:secrets:check
```

The checker calls the Vercel user API and reports whether authentication works while keeping the token hidden. The secret-boundary checker verifies `.env*`, `.vercel`, and `*.pem` ignore rules and scans committed files for token-looking values.

## API: score beams

```http
POST /api/ml/score
```

Example request:

```json
{
  "beams": [
    {
      "id": "GL-BEAM-SHAWN-JOSEPH",
      "people": ["Shawn Ensign", "Joseph Dianda"],
      "sharedProductions": [
        "The Usual Suspects",
        "Boogie Nights",
        "Gun Shy",
        "The Truth About Cats & Dogs",
        "The Trigger Effect",
        "Wag the Dog"
      ],
      "repeatCount": 6,
      "layer": "crew",
      "confidence": 0.95,
      "status": "CORE"
    }
  ]
}
```

Example response shape:

```json
{
  "product": "GRIPLOOM ML + GOBLIN ML",
  "rule": "GRIPLOOM ranks. GOBLIN challenges. BLACKLETTER permits.",
  "results": [
    {
      "beam": {},
      "griploom": { "beamId": "GL-BEAM-SHAWN-JOSEPH", "score": 5.7, "label": "STRONG" },
      "goblin": { "beamId": "GL-BEAM-SHAWN-JOSEPH", "flags": [] },
      "blackletter": { "status": "APPROVED" }
    }
  ]
}
```

## API: SAME-TICK event intake

```http
POST /api/tick
```

Example request:

```json
{
  "idempotency_key": "GL-20260429-CAM-BATT-001-SCANOUT",
  "timestamp": "2026-04-29T12:00:00Z",
  "production_id": "GL-FACE-BOOGIE-NIGHTS",
  "event_type": "scan_out",
  "layer": ["🛠️", "🧾"],
  "actor": {
    "type": "crew",
    "id": "GL-CREW-0001",
    "role": "camera assistant"
  },
  "object": {
    "type": "equipment",
    "id": "CAM-BATT-001",
    "barcode": "GL-BARCODE-CAM-BATT-001"
  },
  "location": {
    "type": "cad_zone",
    "id": "GL-CAD-CAMERA-CART"
  },
  "source": {
    "type": "scanner",
    "id": "SCANNER-001"
  }
}
```

## BLACKLETTER publication rule

GRIPLOOM outputs are credit-based collaboration signals. They must not claim hiring guarantees, performance outcomes, legal conclusions, union determinations, private facts, or causation.

## Netlify deployment

Netlify is the primary GRIPLOOM deploy rail for this repo.

Deployment status receipt:

```txt
docs/GRIPLOOM-DEPLOYMENT-STATUS.md
```

Current Netlify project target:

```txt
name: lichburn-v0-2-8
site_id: 21d3bb41-3a69-4a7d-b6c6-e873cde8ee2f
primary_url: http://lichburn-v0-2-8.netlify.app
```

Vercel checks may show deployment failures when the connected Vercel account is blocked. Treat those as hosting-account failures, not GRIPLOOM code failures, unless build logs show a TypeScript, Next.js, or package error.

Vercel billing blocker note:

```txt
docs/VERCEL-BILLING-BLOCKER.md
```

Local development:

```bash
npm install
npm run dev
```

Netlify local development:

```bash
netlify dev
```

Build verification:

```bash
npm run griploom:verify
```

Build:

```bash
npm run build
```

Deploy from the repository root using the generated Netlify MCP upload command for the site:

```bash
npx -y @netlify/mcp@latest --site-id 21d3bb41-3a69-4a7d-b6c6-e873cde8ee2f --proxy-path "<generated-proxy-path>"
```

Live routes to verify after deployment:

```txt
/
/griploom
/api/ml/score
/api/tick
```

Smoke test GRIPLOOM ML:

```bash
curl -X POST https://lichburn-v0-2-8.netlify.app/api/ml/score \
  -H "content-type: application/json" \
  --data @examples/griploom-ml-score.sample.json
```

Smoke test SAME-TICK:

```bash
curl -X POST https://lichburn-v0-2-8.netlify.app/api/tick \
  -H "content-type: application/json" \
  --data @examples/griploom-tick.sample.json
```

Browser checklist:

```txt
Home page loads.
/griploom loads.
Run ML Sample works.
Send SAME-TICK works.
Graph preview appears.
Polarity styling appears.
BLACKLETTER graph legend appears.
Mesh health appears.
Mesh scorecard appears.
Vitality field appears.
Repeat beam cards appear.
Beam filters work.
Raw Results opens.
No visible client crash.
```

Launch rule:

```txt
Verify, deploy, open, score, tick, verify.
```

## Documentation

- `docs/WHITEPAPER.md`
- `docs/BREACH-PLAN.md`
- `docs/CONTRACT-PACK.md`
- `docs/observer-route-harness.md`
- `docs/observer-route-ci.md`
- `docs/observer-route-release.md`
- `docs/observer-route-release-gates.md`
- `docs/GRIPLOOM-HATS.md`
- `docs/GRIPLOOM-ID-BARCODER.md`
- `docs/GRIPLOOM-SCREENPLAY-INDUSTRY-ID.md`
- `docs/GRIPLOOM-LAUNCH-CHECKLIST.md`
- `docs/GRIPLOOM-LAUNCH-RECEIPT.md`
- `docs/GRIPLOOM-SCIENCE-SOURCE-RAIL.md`
- `docs/GRIPLOOM-CHECKS-INDEX.md`
- `docs/GRIPLOOM-DEPLOYMENT-STATUS.md`
- `docs/VERCEL-API-TOKEN-SETUP.md`
- `docs/VERCEL-BILLING-BLOCKER.md`
- `examples/griploom-id-barcoder.sample.json`
- `examples/griploom-screenplay-industry-id.sample.json`
- `examples/griploom-ml-score.sample.json`
- `examples/griploom-tick.sample.json`
- `examples/griploom-launch.receipt.sample.json`
- `scripts/check-griploom-id-barcoder-sample.mjs`
- `scripts/check-griploom-screenplay-industry-id-sample.mjs`
- `scripts/check-griploom-ml-score-sample.mjs`
- `scripts/check-griploom-tick-sample.mjs`
- `scripts/check-griploom-launch-receipt-sample.mjs`
- `scripts/check-griploom-launch-printer.mjs`
- `scripts/check-secret-boundaries.mjs`
- `scripts/check-vercel-token-env.mjs`
- `scripts/print-griploom-launch-receipt.mjs`
- `scripts/verify-griploom-build.mjs`
- `.github/workflows/griploom-verify.yml`

Verified credits in. Production geometry out.
