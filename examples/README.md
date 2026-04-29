# GRIPLOOM Examples

Run the app locally:

```bash
npm install
npm run dev
```

## Test GRIPLOOM ML scoring

```bash
curl -X POST http://localhost:3000/api/ml/score \
  -H "content-type: application/json" \
  --data @examples/griploom-ml-score.sample.json
```

Expected behavior:

- The Shawn Ensign / Joseph Dianda beam should score as a strong or core repeat signal.
- The weak candidate beam should receive GOBLIN flags.
- BLACKLETTER should approve, caution, or block based on evidence and flags.

## Test SAME-TICK intake

```bash
curl -X POST http://localhost:3000/api/tick \
  -H "content-type: application/json" \
  --data @examples/griploom-tick.sample.json
```

Expected behavior:

- The API returns a mock stored tick ID.
- Required fields are validated.
- The response includes the stored event shape and the SAME-TICK rule.

## Product rule

GRIPLOOM ML ranks. GOBLIN ML challenges. BLACKLETTER permits. Only sourced, non-causal collaboration signals publish.
