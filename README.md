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
- `examples/griploom-id-barcoder.sample.json`: sample hat, shirt, and scanner IDs with shape, barcode, QR, scanner route, and BLACKLETTER fields.

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
- `examples/griploom-id-barcoder.sample.json`

Verified credits in. Production geometry out.
