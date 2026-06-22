# Stadium and Town Scaling Plan

Receipt: `TJP-V54562-STADIUM-TOWN-SCALING-PLAN`

This plan answers the broadcast strength question for Lichburn, Norstein Bekkler, and the AR/MMORPG bridge.

## Current status

Source files are committed in GitHub. Hosting activation and capacity validation are separate gates. Do not claim full live production readiness until the hosting path is active and load tested.

## Broadcast strength levels

```txt
LEVEL 0  Source only      code and docs committed; not hosted or load tested
LEVEL 1  Personal venue   JP demo, local use, small audience
LEVEL 2  Room venue       small event or table use
LEVEL 3  Busy night       dozens to hundreds of visitors with caching and static pages
LEVEL 4  Stadium plan     thousands of visitors only after CDN, caching, monitoring, and load test
LEVEL 5  Town plan        large civic traffic only after production hosting, rate limits, queueing, incident response, and budget approval
```

## Current verdict

```txt
Current level: LEVEL 0 to LEVEL 1, source committed.
Not yet verified for stadium or whole-town traffic.
```

## Required upgrades for busy nights

- static-first pages
- CDN caching
- low-JavaScript landing page path
- separate API path from static route path
- rate limiting for APIs
- queue or backpressure for comment intake
- monitoring and uptime checks
- deploy receipt for each release
- rollback plan
- no secrets in client code
- no payment credentials in repository

## Norstein Bekkler / Lichburn improvement target

The safest large-volume path is static-first for public lore and route pages, with API features separated and rate-limited. The Norstein Bekkler Seal can be the low-load public front door while Lichburn keeps heavier GRIPLOOM/Goblin functions behind verified routes.
