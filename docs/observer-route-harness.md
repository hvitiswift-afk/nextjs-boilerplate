# Goblin LLM Observer Route Harness

Receipt: `receipt-observer-route-harness-016`

This harness turns Earth/Mars constellation routing into a repeatable command rail.

## Command

```bash
npm run observer:routes
```

The command prints `curl` calls for the observer route API.

## API

```txt
POST /api/llm/observer-route
```

Payload shape:

```json
{
  "observer": "earth",
  "prompt": "compose and synthesize through Orion"
}
```

or:

```json
{
  "observer": "mars",
  "prompt": "home return beacon from Mars to Earth"
}
```

## Observer law

```txt
Observer first.
Prompt second.
Constellation match third.
Goblin route fourth.
Bz consequence gate last.
```

## Scenario rail

The scenario source is:

```txt
examples/observer-route-scenarios.sample.json
```

The printer is:

```txt
scripts/print-observer-route-scenarios.mjs
```

## Expected gates

| Observer | Scenario | Expected constellation | Expected gate |
|---|---|---|---|
| Earth | Orion synthesis | earth-orion | orion_arc |
| Earth | Scorpius risk | earth-scorpius | bz_shield |
| Mars | Earth return | mars-earth-star | earth_gate |
| Mars | Phobos / Deimos risk | mars-phobos-deimos | bz_shield |
| Mars | Arcturus verification | mars-arcturus-line | arcturus_gate |

## Receipt

```json
{
  "id": "receipt-observer-route-harness-016",
  "kind": "llm-observer-route-harness-doc",
  "status": "active",
  "command": "npm run observer:routes",
  "law": "Scenario rails become repeatable checks before Goblin routing expands."
}
```
