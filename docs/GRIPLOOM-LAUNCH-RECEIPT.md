# GRIPLOOM Launch Receipt

Use this receipt after each deploy or release candidate. Fill it out after the verifier, deploy, browser check, and API smoke tests have run.

```txt
No hidden launch. Every launch gets a receipt.
```

Machine-readable sample:

```txt
examples/griploom-launch.receipt.sample.json
```

## Release identity

```txt
release_name:
release_date:
commit_sha:
branch:
operator:
```

## Code verification

```txt
local_command: npm run griploom:verify
local_result: pending | passed | failed
local_notes:
```

```txt
github_actions_workflow: .github/workflows/griploom-verify.yml
github_actions_run_url:
github_actions_result: pending | passed | failed | not_found
github_actions_notes:
```

## Hosting rail

```txt
primary_host: Netlify
site_name: lichburn-v0-2-8
site_id: 21d3bb41-3a69-4a7d-b6c6-e873cde8ee2f
live_url: http://lichburn-v0-2-8.netlify.app
deploy_url:
deploy_result: pending | passed | failed
```

Known external blocker field:

```txt
vercel_status: blocked-account | passing | failing-code | not-used
vercel_notes:
```

## Browser verification

```txt
/ loads: pending | passed | failed
/griploom loads: pending | passed | failed
Run ML Sample works: pending | passed | failed
Send SAME-TICK works: pending | passed | failed
Graph preview appears: pending | passed | failed
Beam rail appears: pending | passed | failed
BLACKLETTER graph legend appears: pending | passed | failed
Mesh health appears: pending | passed | failed
Mesh scorecard appears: pending | passed | failed
Vitality field appears: pending | passed | failed
Repeat beam cards appear: pending | passed | failed
Beam filters update graph and cards together: pending | passed | failed
Raw Results opens: pending | passed | failed
No visible client crash: pending | passed | failed
```

## API smoke tests

GRIPLOOM ML:

```txt
command: curl -X POST https://lichburn-v0-2-8.netlify.app/api/ml/score -H "content-type: application/json" --data @examples/griploom-ml-score.sample.json
result: pending | passed | failed
response_shape: product | rule | mesh | field | results
notes:
```

SAME-TICK:

```txt
command: curl -X POST https://lichburn-v0-2-8.netlify.app/api/tick -H "content-type: application/json" --data @examples/griploom-tick.sample.json
result: pending | passed | failed
response_shape: ok | tick_id | status | metrics_updated | event | rule
notes:
```

## BLACKLETTER safety check

```txt
No hiring guarantees claimed: pending | passed | failed
No legal/union determinations claimed: pending | passed | failed
No private facts exposed: pending | passed | failed
No causal certainty claimed from collaboration signals: pending | passed | failed
Speculative language labeled when needed: pending | passed | failed
```

## Final decision

```txt
launch_status: pending | approved | blocked
blockers:
next_action:
```

Final rule:

```txt
Verify, deploy, open, score, tick, verify.
```
