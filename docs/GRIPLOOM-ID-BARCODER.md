# GRIPLOOM ID Barcoder

Receipt: `receipt-griploom-id-barcoder-033`

GRIPLOOM ID Barcoder turns hats, shirts, mesh, gear, beams, receipts, and scanner events into function-shaped identifiers with barcode and QR surfaces.

## Core identity equation

```txt
GRIPLOOM_ID = prefix + layer + object + batch + check
```

For wearable and production artifacts:

```txt
GL-ID(object) = shape(object) + beam(object) + barcode(object) + qr(object) + scan_receipt(object)
```

## Function shapes

Function shapes define how the ID should appear and how scanners should interpret it.

| Shape | Symbol | Use | Scan function |
|---|---:|---|---|
| Patch Rectangle | ▭ | hat/shirt front patch | primary product scan |
| Sleeve Rail | ━ | shirt sleeve / strap | side identity scan |
| Crown Arc | ◠ | hat crown / cap front | headwear identity scan |
| Mesh Cell | ◇ | mesh/grid artifacts | repeated beam scan |
| Tag Loop | ⌁ | hanging tag / label | inventory scan |
| Shield Plate | ⬟ | BLACKLETTER approval mark | safety-gate scan |
| Receipt Square | □ | receipt or batch card | audit scan |
| QR Portal | ⧉ | URL / JSON payload scan | deep-link scan |

## ID format

```txt
GL-{LAYER}-{OBJECT}-{BATCH}-{SERIAL}-{CHECK}
```

Examples:

```txt
GL-HAT-FIELD-20260430-0001-K7
GL-SHIRT-MESH-20260430-0002-Q4
GL-GEAR-SCANNER-20260430-0003-R9
```

## Barcode payload

```json
{
  "id": "GL-HAT-FIELD-20260430-0001-K7",
  "kind": "griploom-id",
  "shape": "crown_arc",
  "barcode": {
    "symbology": "code128",
    "payload": "GL-HAT-FIELD-20260430-0001-K7",
    "surface": "front_patch"
  },
  "qr": {
    "payloadType": "json-url",
    "url": "https://hviti.com/griploom/id/GL-HAT-FIELD-20260430-0001-K7"
  },
  "scanner": {
    "eventType": "scan_in",
    "route": "/api/tick",
    "idempotencyKey": "GL-HAT-FIELD-20260430-0001-K7-SCANIN"
  }
}
```

## Scanner function

```txt
SCAN(input) = read → normalize → validate_check → route → receipt
```

Where:

```txt
read            = barcode | QR | manual entry
normalize       = uppercase + trim + hyphen discipline
validate_check  = checksum(ID) == CHECK
route           = /api/tick or /api/ml/score
receipt         = SAME-TICK event record
```

## QR rule

QR codes may carry a URL or compact JSON, but public QR payloads should not expose private facts.

```txt
public QR  = URL + public ID + batch receipt
private QR = internal only + access-gated metadata
```

## BLACKLETTER safety

IDs, barcodes, and QR codes must not claim employment, certification, legal status, union status, private affiliation, or causation.

## Release gate

```txt
ID format approved
shape assigned
barcode payload approved
QR payload approved
scanner route approved
BLACKLETTER claim gate approved
receipt sample created
```

## Receipt

```json
{
  "id": "receipt-griploom-id-barcoder-033",
  "kind": "griploom-id-barcoder-doc",
  "status": "active",
  "law": "Every GRIPLOOM object gets an ID only after shape, barcode, QR, scanner route, and BLACKLETTER gates agree."
}
```
