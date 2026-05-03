# F-WAD Campaign Rail

F-WAD grows from one four-cube proof arena into a planetary campaign rail.

```txt
MAP01 Quadflare Hollow
MAP02 Gladiator Arena
MAP03 Hyperboreum
MAP04 Imperial Gate
MAP05 Alpha Mars
MAP06 Omega Mars
MAP07 Venus
```

## Core rule

```txt
Divergence names the room.
Curl animates the swirl.
Polarity chooses control.
Stokes verifies capture.
Goblin routes the flow.
Griploom logs the proof.
```

## Field classifier

```txt
D(x)>epsilon      -> Elysium
|D(x)|<=epsilon   -> Asphodel
D(x)<-epsilon     -> Gehenna
|div T|<=epsilon and |curl T|>omega -> Pluto
```

The field realm and world skin combine as a two-axis campaign tag:

```txt
Z = FieldRealm x WorldTag
```

Examples:

```txt
(Elysium, Hyperboreum)
(Asphodel, Imperial Gate)
(Gehenna, Omega Mars)
(Pluto, Gladiator Arena)
(Asphodel, Venus)
```

## World rail

### MAP01 Quadflare Hollow

The base proof arena. Four cubes surround a Pluto hub and route swirls through field classification.

```txt
C1 Intake -> C2 Classify -> C3 Verify -> H Balance -> C4 Output
```

### MAP02 Gladiator Arena

A combat bowl for proof under pressure.

```txt
outer stands -> polarity ring -> combat bowl -> center seal
```

Use: duels, timed capture loops, crowd flare pressure, and Stokes verification during motion.

### MAP03 Hyperboreum

A polar luminous clarity realm.

```txt
Hyperboreum Gate -> Polar Arches -> Aurora Observatory -> Ice Vault
```

Use: weather reading, antenna clarity, long sight lines, and crystal beam routing.

### MAP04 Imperial Gate

A Constantinople-style crossroads hub.

```txt
Imperial Wall -> Dome Forum -> Harbor Gate -> Vault Quarter -> Arena Quarter
```

Use: transit, receipt markets, campaign routing, and vault access.

### MAP05 Alpha Mars

Beginning Mars, frontier outpost.

```txt
Alpha Outpost -> Red Dust Field -> Beacon Tower -> Fort Gate
```

Use: outpost defense, beacon chains, mobility, and first-campaign proofs.

### MAP06 Omega Mars

Ending Mars, terminal ruin basin.

```txt
Omega Ruin -> Black Basin -> Buried Machine -> Final Vault
```

Use: sink swirls, hard verification, ruin labyrinths, and heavy proof weight.

### MAP07 Venus

Chromatic mist and refraction realm.

```txt
Venus Cloud Dock -> Copper Garden -> Mist Palace -> Acid Reflection Basin
```

Use: fog puzzles, chromatic locks, atmospheric drift, and beauty-hazard duality.

## Palette rail from field photo

The photographed cyan fragment on synthetically reproduced red becomes a campaign palette token:

```txt
natural cyan shard + synthetic red field + white reflective border + gray metal post
```

Use this as the F-WAD sign/arena palette:

```txt
cyan = natural shard / player-held proof fragment
red = synthetic arena field / warning surface / Mars rail
white = reflective receipt boundary
gray = metal infrastructure / gate post
```

## Implementation files

```txt
app/f-wad/page.tsx
lib/f-wad/field.ts
lib/f-wad/goblin-router.ts
lib/f-wad/swirl.ts
lib/f-wad/worlds.ts
scripts/check-f-wad-sample.mjs
```

## Local verification

```bash
npm run f-wad:check
npm run griploom:checks
npm run griploom:verify
```

## Campaign lock

```txt
The Arena gives contest.
Hyperboreum gives clarity.
The Imperial Gate gives connection.
Alpha Mars gives beginning.
Omega Mars gives ending.
Venus gives chromatic atmosphere.
```
