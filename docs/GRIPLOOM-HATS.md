# GRIPLOOM Hats

Receipt: `receipt-griploom-hats-032`

Hats are head-level production geometry artifacts for GRIPLOOM: wearable signals that can be scored, challenged, and permitted like shirts, mesh, and beams.

## Hat rail

```txt
HAT = crown + brim + patch + stitch + mesh + beam
```

Each hat can carry a visible claim surface while still passing the same safety rule as other GRIPLOOM outputs:

```txt
GRIPLOOM ranks.
GOBLIN challenges.
BLACKLETTER permits.
```

## Hat types

| Hat | Function | Beam role | Claim safety |
|---|---|---|---|
| Field Cap | daily operator cap | soft identity beam | no private facts |
| Mesh Trucker | crew/network hat | visible mesh beam | no causation claims |
| Watch Cap | night/maintenance hat | low-profile continuity beam | no implied authority |
| Hard Hat Skin | site/production overlay | safety-site marker | must not replace PPE certification |
| Crown Cap | ceremonial release hat | release/receipt beam | symbolic only |
| Scanner Visor | event-intake hat | barcode/QR sightline beam | source must be logged |

## Patch grammar

```txt
front_patch  = product mark
left_patch   = role / crew layer
right_patch  = receipt id / batch id
back_patch   = safety law
underbrim    = private operator note, not public claim
```

## Beam fields

```json
{
  "hatId": "GL-HAT-FIELD-001",
  "kind": "griploom-hat",
  "layer": ["headwear", "crew", "receipt"],
  "beam": {
    "surface": "front_patch",
    "signal": "GRIPLOOM",
    "confidence": 0.9,
    "claim": "production geometry artifact"
  },
  "blackletter": {
    "status": "requires_review",
    "rule": "Do not claim employment, legal status, certification, causation, or private affiliation."
  }
}
```

## Hat scoring

```txt
hat_score = material_score + patch_score + mesh_score + receipt_score - overclaim_risk
```

Where:

```txt
material_score  = durability + comfort + washability
patch_score     = legibility + alignment + repeatability
mesh_score      = ventilation + visibility + production fit
receipt_score   = batch_id + source_log + approval_state
overclaim_risk  = authority_claim + privacy_risk + certification_confusion
```

## Release gate

A GRIPLOOM hat can move to release only when:

```txt
visual mockup approved
patch grammar approved
claim safety approved
receipt id assigned
batch source logged
```

## Receipt

```json
{
  "id": "receipt-griploom-hats-032",
  "kind": "griploom-hats-doc",
  "status": "active",
  "law": "Hats become beams only after patch, mesh, receipt, and BLACKLETTER gates agree."
}
```
