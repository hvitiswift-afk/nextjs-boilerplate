#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKSPACE="${GITHUB_WORKSPACE:?GITHUB_WORKSPACE is required}"
RUNNER_SHA256='d7fabf86cd9aa63644e9d09c5c0d2201b205503c2a0072502ee7cd1644faaf2b'
SUBMISSION_ID='matadata-openai-cybersecurity-grant-v1'

mkdir -p "$WORKSPACE/pathfinder-session" "$WORKSPACE/pathfinder-artifacts" "$WORKSPACE/pathfinder-lock" /tmp/pathfinder-live /tmp/matadata-v22
TOKEN="$(openssl rand -hex 24)"
SESSION_ID="$(openssl rand -hex 16)"
printf '%s' "$TOKEN" > /tmp/pathfinder-live/token
printf '%s' "$SESSION_ID" > /tmp/pathfinder-live/session-id

cp "$ROOT/runner.cjs.gz" /tmp/matadata-v22/runner.cjs.gz
gzip --test /tmp/matadata-v22/runner.cjs.gz
gzip --decompress --stdout /tmp/matadata-v22/runner.cjs.gz > /tmp/matadata-v22/runner.cjs
echo "$RUNNER_SHA256  /tmp/matadata-v22/runner.cjs" | sha256sum --check
node --check /tmp/matadata-v22/runner.cjs

RUNNER_TRACKING_ID='' nohup Xvfb :99 -screen 0 1280x900x24 -ac -noreset \
  >/tmp/pathfinder-live/xvfb.log 2>&1 &
sleep 2

RUNNER_TRACKING_ID='' DISPLAY=:99 \
PATHFINDER_TOKEN="$TOKEN" \
PATHFINDER_PORT='6080' \
PATHFINDER_READY_FILE='/tmp/matadata-pathfinder-ready' \
PATHFINDER_ARTIFACT_DIR="$WORKSPACE/pathfinder-artifacts" \
PATHFINDER_TERMINAL_HOLD_MS='60000' \
PATHFINDER_SESSION_TTL_MS='3000000' \
PATHFINDER_SUBMISSION_ID="$SUBMISSION_ID" \
PATHFINDER_RUNNER_SHA256="$RUNNER_SHA256" \
PATHFINDER_SESSION_ID="$SESSION_ID" \
PLAYWRIGHT_MODULE='/tmp/pathfinder-node/node_modules/playwright' \
PLAYWRIGHT_BROWSERS_PATH='/tmp/ms-playwright' \
nohup node /tmp/matadata-v22/runner.cjs \
  >/tmp/pathfinder-live/pathfinder.log 2>&1 &
echo $! > /tmp/pathfinder-live/pathfinder.pid

for _ in $(seq 1 90); do
  [[ -f /tmp/matadata-pathfinder-ready ]] && break
  if ! kill -0 "$(cat /tmp/pathfinder-live/pathfinder.pid)" 2>/dev/null; then
    cat /tmp/pathfinder-live/pathfinder.log
    exit 1
  fi
  sleep 1
done
test -f /tmp/matadata-pathfinder-ready

: > /tmp/pathfinder-live/healthy-urls.txt
for NAME in primary backup; do
  RUNNER_TRACKING_ID='' nohup /tmp/cloudflared tunnel --protocol http2 --no-autoupdate \
    --url http://127.0.0.1:6080 \
    >"/tmp/pathfinder-live/cloudflared-${NAME}.log" 2>&1 &
  echo $! > "/tmp/pathfinder-live/cloudflared-${NAME}.pid"
done

for NAME in primary backup; do
  URL=''
  for _ in $(seq 1 90); do
    URL="$(grep -Eo 'https://[-a-z0-9]+\.trycloudflare\.com' "/tmp/pathfinder-live/cloudflared-${NAME}.log" | head -n1 || true)"
    [[ -n "$URL" ]] && break
    sleep 1
  done
  if [[ -z "$URL" ]]; then
    echo "$NAME tunnel did not publish a URL" >> /tmp/pathfinder-live/tunnel-warnings.log
    continue
  fi
  HEALTHY=''
  for _ in $(seq 1 30); do
    if curl --fail --silent --show-error --max-time 10 "$URL/health?token=$TOKEN" >"/tmp/pathfinder-live/${NAME}-health.json"; then
      HEALTHY='yes'
      break
    fi
    sleep 2
  done
  if [[ "$HEALTHY" == 'yes' ]]; then
    printf '%s\n' "$URL" >> /tmp/pathfinder-live/healthy-urls.txt
  else
    echo "$NAME tunnel failed its health check" >> /tmp/pathfinder-live/tunnel-warnings.log
  fi
done

mapfile -t URLS < /tmp/pathfinder-live/healthy-urls.txt
if (( ${#URLS[@]} == 0 )); then
  cat /tmp/pathfinder-live/cloudflared-primary.log || true
  cat /tmp/pathfinder-live/cloudflared-backup.log || true
  exit 1
fi

python - "$TOKEN" "$SESSION_ID" "${URLS[@]}" <<'PY'
import json, os, sys
from datetime import datetime, timedelta, timezone
token, session_id, *urls = sys.argv[1:]
links = []
for index, url in enumerate(urls):
    links.append({
        'name': 'primary' if index == 0 else f'fallback-{index}',
        'standard_url': f'{url}/?token={token}&profile=normal',
        'low_bandwidth_url': f'{url}/?token={token}&profile=low',
    })
payload = {
    'status': 'LIVE_HUMAN_VERIFICATION_AND_ACKNOWLEDGMENT',
    'runner_version': '2.2.0',
    'submission_id': 'matadata-openai-cybersecurity-grant-v1',
    'session_id': session_id,
    'primary_url': links[0]['standard_url'],
    'primary_low_bandwidth_url': links[0]['low_bandwidth_url'],
    'fallback_url': links[1]['standard_url'] if len(links) > 1 else None,
    'fallback_low_bandwidth_url': links[1]['low_bandwidth_url'] if len(links) > 1 else None,
    'links': links,
    'purpose': 'JP completes OpenAI human verification and personally records the applicant acknowledgment. Radio fills the reviewed non-confidential proposal and submits exactly once.',
    'recovery': [
        'Refresh an already-opened link in the same browser; a secure same-site cookie preserves the session.',
        'Use the low-bandwidth URL on slow mobile data.',
        'Use the fallback URL if the primary public tunnel does not connect.',
    ],
    'run_id': os.environ.get('GITHUB_RUN_ID'),
    'run_attempt': os.environ.get('GITHUB_RUN_ATTEMPT'),
    'expires_at': (datetime.now(timezone.utc) + timedelta(minutes=50)).isoformat(),
}
with open(os.path.join(os.environ['GITHUB_WORKSPACE'], 'pathfinder-session', 'session.json'), 'w', encoding='utf-8') as fh:
    json.dump(payload, fh, indent=2)
PY

{
  while kill -0 "$(cat /tmp/pathfinder-live/pathfinder.pid)" 2>/dev/null; do
    printf '%s ' "$(date -u +%FT%TZ)"
    curl --silent --show-error --max-time 8 "http://127.0.0.1:6080/health?token=$TOKEN" || true
    printf '\n'
    while IFS= read -r url; do
      printf '%s %s ' "$(date -u +%FT%TZ)" "$url"
      curl --silent --show-error --max-time 8 "$url/health?token=$TOKEN" || true
      printf '\n'
    done < /tmp/pathfinder-live/healthy-urls.txt
    sleep 20
  done
} > /tmp/pathfinder-live/watchdog.log 2>&1 &
echo $! > /tmp/pathfinder-live/watchdog.pid
