#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="${1:-$PWD/pathfinder-preflight}"
TMP="${TMPDIR:-/tmp}/matadata-v22-preflight"
RUNNER_SHA256='d7fabf86cd9aa63644e9d09c5c0d2201b205503c2a0072502ee7cd1644faaf2b'
APPLICATION_SHA256='6ca7dd6f4ca13f04923a48896e51badeb7967f1fbde6b686a4b1759d90cfe340'
SUBMISSION_ID='matadata-openai-cybersecurity-grant-v1'

rm -rf "$TMP"
mkdir -p "$TMP" "$OUT"
cp "$ROOT/runner.cjs.gz" "$TMP/runner.cjs.gz"
gzip --test "$TMP/runner.cjs.gz"
gzip --decompress --stdout "$TMP/runner.cjs.gz" > "$TMP/runner.cjs"
echo "$RUNNER_SHA256  $TMP/runner.cjs" | sha256sum --check
node --check "$TMP/runner.cjs"
sha256sum "$TMP/runner.cjs" "$TMP/runner.cjs.gz" > "$OUT/SHA256SUMS.txt"

python - "$TMP/runner.cjs" "$TMP/client.js" <<'PY'
from pathlib import Path
import re, sys
source = Path(sys.argv[1]).read_text(encoding='utf-8')
match = re.search(r'<script>(.*?)</script>', source, re.S)
if not match:
    raise SystemExit('Embedded mobile client script was not found.')
Path(sys.argv[2]).write_text(match.group(1), encoding='utf-8')
PY
node --check "$TMP/client.js"

printf 'module.exports={chromium:{}};\n' > "$TMP/mock-playwright.cjs"
PATHFINDER_SELF_TEST='1' \
PATHFINDER_TOKEN='offline-preflight-token-000000000000' \
PATHFINDER_ARTIFACT_DIR="$OUT" \
PATHFINDER_SUBMISSION_ID="$SUBMISSION_ID" \
PATHFINDER_RUNNER_SHA256="$RUNNER_SHA256" \
PLAYWRIGHT_MODULE="$TMP/mock-playwright.cjs" \
node "$TMP/runner.cjs"

python - "$OUT/selftest.json" "$ROOT/MANIFEST.json" <<'PY'
import json, sys
from pathlib import Path
result = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
manifest = json.loads(Path(sys.argv[2]).read_text(encoding='utf-8'))
tests = {item['name']: item['ok'] for item in result.get('tests', [])}
required = {
    'field-spec-count', 'application-keys', 'proposal-limit', 'problem-limit',
    'authorization-language', 'html-token-removal', 'direct-submit-block',
    'acknowledgment-proxy-panel', 'acknowledgment-proxy-endpoint',
    'acknowledgment-text-validation', 'acknowledgment-affirmation-gate',
    'personal-affirmation-submit-precondition', 'trusted-origin-gate',
    'candidate-submission-classifier', 'cookie-reconnect-client',
    'screen-etag-and-token', 'low-bandwidth-profile',
    'stale-screen-token-guard', 'acknowledgment-stability-sampling',
    'tamper-evident-event-chain', 'positive-candidate-network-evidence',
    'browser-health-watchdog', 'event-chain-runtime',
}
failed = sorted(name for name in required if tests.get(name) is not True)
if not result.get('passed') or failed:
    raise SystemExit(f'V2.2 self-test failed: {failed}')
if result.get('runnerVersion') != '2.2.0':
    raise SystemExit('Unexpected runner version.')
if result.get('applicationSha256') != '6ca7dd6f4ca13f04923a48896e51badeb7967f1fbde6b686a4b1759d90cfe340':
    raise SystemExit('Application content changed unexpectedly.')
if manifest.get('version') != '2.2.0':
    raise SystemExit('Unexpected manifest version.')
if manifest.get('runner_sha256') != 'd7fabf86cd9aa63644e9d09c5c0d2201b205503c2a0072502ee7cd1644faaf2b':
    raise SystemExit('Manifest runner checksum mismatch.')
if manifest.get('application_sha256') != '6ca7dd6f4ca13f04923a48896e51badeb7967f1fbde6b686a4b1759d90cfe340':
    raise SystemExit('Manifest application checksum mismatch.')
if manifest.get('live_execution') is not False:
    raise SystemExit('Staged manifest must not claim live execution.')
print(json.dumps({'status': 'PREFLIGHT_PASSED', 'selftest': result, 'manifest': manifest}, indent=2))
PY
