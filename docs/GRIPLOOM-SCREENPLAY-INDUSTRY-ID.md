# GRIPLOOM Screenplay Industry ID

Receipt: `receipt-griploom-screenplay-industry-id-038`

This rail maps screenplay units, production roles, credits, departments, scenes, locations, props, wardrobe, hats, mesh, barcodes, QR codes, and scanner events into GRIPLOOM IDs.

Important boundary: GRIPLOOM IDs are internal production, receipt, inventory, and collaboration-signal identifiers. They are not official SAG-AFTRA, IATSE, studio, guild, legal, payroll, or employment credentials.

## Core equation

```txt
SCREENPLAY_ID = work + unit + department + role + scene + object + batch + check
```

```txt
GL-FILM-ID(x) = screenplay(x) + credit_layer(x) + barcode(x) + qr(x) + scan_receipt(x)
```

## Industry namespaces

Use namespaces to separate internal GRIPLOOM meaning from external industry references.

| Namespace | Meaning | Allowed use | Forbidden use |
|---|---|---|---|
| `GL` | GRIPLOOM internal ID | inventory, receipt, scanner route | pretending to be official guild ID |
| `WORK` | screenplay / movie / episode | work-level grouping | copyright or ownership claim without source |
| `SCN` | scene | scene, shot, continuity | private or unreleased leak if not authorized |
| `DEPT` | department | camera, grip, electric, wardrobe, art, sound, VFX | employment guarantee |
| `ROLE` | role code | actor, stunt, grip, gaffer, editor, designer | union membership claim |
| `SAG-AFTRA-REF` | performer/guild reference boundary | optional compatibility field only | official credential claim |
| `IATSE-REF` | crew/guild reference boundary | optional compatibility field only | official credential claim |

## Screenplay ID format

```txt
GL-WORK-{WORK}-{UNIT}-{DEPT}-{ROLE}-{SCENE}-{OBJECT}-{SERIAL}-{CHECK}
```

Examples:

```txt
GL-WORK-NEONRIVER-U1-DEPT-CAMERA-ROLE-AC-SCN-012-CAMSLATE-0001-K7
GL-WORK-NEONRIVER-U1-DEPT-WARDROBE-ROLE-DESIGN-SCN-012-HATFIELD-0002-Q4
GL-WORK-NEONRIVER-U2-DEPT-GRIP-ROLE-KEYGRIP-SCN-020-CSTAND-0003-R9
```

## Screenplay object layers

```txt
work        = screenplay, movie, episode, short, pilot
unit        = main, second_unit, splinter, VFX, pickup, archival
scene       = scene number + revision color + page range
role        = performer, stunt, grip, electric, camera, wardrobe, art, sound, VFX, post
object      = script page, slate, prop, wardrobe piece, hat, scanner, badge, release receipt
scan event  = scan_in, scan_out, continuity_check, fitting_check, wrap_check, audit_check
```

## Barcode and QR payload

```json
{
  "id": "GL-WORK-NEONRIVER-U1-DEPT-WARDROBE-ROLE-DESIGN-SCN-012-HATFIELD-0002-Q4",
  "kind": "griploom-screenplay-industry-id",
  "work": {
    "slug": "NEONRIVER",
    "type": "screenplay",
    "unit": "U1",
    "scene": "012"
  },
  "department": {
    "code": "WARDROBE",
    "role": "DESIGN",
    "industryRefs": {
      "sagAftraRef": null,
      "iatseRef": "compatibility-field-only-not-official"
    }
  },
  "object": {
    "type": "hat",
    "surface": "front_patch",
    "shape": "crown_arc"
  },
  "barcode": {
    "symbology": "code128",
    "payload": "GL-WORK-NEONRIVER-U1-DEPT-WARDROBE-ROLE-DESIGN-SCN-012-HATFIELD-0002-Q4"
  },
  "qr": {
    "payloadType": "json-url",
    "url": "https://hviti.com/griploom/work/NEONRIVER/id/GL-WORK-NEONRIVER-U1-DEPT-WARDROBE-ROLE-DESIGN-SCN-012-HATFIELD-0002-Q4",
    "privacy": "public-id-only"
  },
  "scanner": {
    "route": "/api/tick",
    "eventType": "continuity_check",
    "idempotencyKey": "GL-WORK-NEONRIVER-U1-DEPT-WARDROBE-ROLE-DESIGN-SCN-012-HATFIELD-0002-Q4-CONTINUITY"
  },
  "blackletter": {
    "status": "requires_review",
    "rule": "Do not claim guild membership, employment, payroll status, legal status, authorship, ownership, or official certification."
  }
}
```

## SAG-AFTRA and IATSE boundary

GRIPLOOM may include optional reference fields for workflow interoperability:

```txt
sagAftraRef = null | external_reference_provided_by_authorized_source
iatseRef    = null | external_reference_provided_by_authorized_source
```

But GRIPLOOM must not invent or imply:

```txt
guild membership
union jurisdiction
employment status
contract status
payroll status
health/pension status
legal clearance
studio authorization
```

## Whole-industry scan graph

```txt
screenplay → scene → department → role → object → barcode/QR → scanner → SAME-TICK receipt → BLACKLETTER gate
```

```txt
actor/performance rail  → SAG-AFTRA reference boundary → consent/source required
crew/department rail    → IATSE reference boundary      → consent/source required
studio/production rail  → internal production code      → authorization required
public product rail     → public QR URL                 → no private facts
```

## Release gate

```txt
screenplay/work slug approved
scene and revision source approved
department and role code approved
barcode payload approved
QR payload approved
scanner route approved
SAG-AFTRA/IATSE fields blank or source-authorized
BLACKLETTER claim gate approved
receipt sample created
```

## Receipt

```json
{
  "id": "receipt-griploom-screenplay-industry-id-038",
  "kind": "griploom-screenplay-industry-id-doc",
  "status": "active",
  "law": "Whole-industry IDs are valid only when screenplay, department, role, barcode, QR, scanner route, source authorization, and BLACKLETTER gates agree."
}
```
