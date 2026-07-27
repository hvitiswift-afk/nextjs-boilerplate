#!/usr/bin/env bash
set -euo pipefail
WORKSPACE="${GITHUB_WORKSPACE:?GITHUB_WORKSPACE is required}"
PID="$(cat /tmp/pathfinder-live/pathfinder.pid)"
for _ in $(seq 1 720); do
  if ! kill -0 "$PID" 2>/dev/null; then break; fi
  sleep 5
done
if kill -0 "$PID" 2>/dev/null; then
  kill -TERM "$PID" 2>/dev/null || true
  echo 'Pathfinder exceeded the live interaction window.'
  exit 1
fi
cat /tmp/pathfinder-live/pathfinder.log
python - "$WORKSPACE" <<'PY'
import json, re, sys
from pathlib import Path
workspace = Path(sys.argv[1])
receipt_path = workspace / 'pathfinder-artifacts' / 'receipt.json'
if not receipt_path.exists():
    raise SystemExit('No Pathfinder receipt was produced.')
receipt = json.loads(receipt_path.read_text(encoding='utf-8'))
print(json.dumps(receipt, indent=2))
if receipt.get('status') != 'SUBMITTED' or receipt.get('submitClicks') != 1:
    raise SystemExit('Submission was not positively confirmed exactly once.')
if receipt.get('runnerVersion') != '2.2.0':
    raise SystemExit('Unexpected runner version in receipt.')
if receipt.get('runnerSourceSha256') != 'd7fabf86cd9aa63644e9d09c5c0d2201b205503c2a0072502ee7cd1644faaf2b':
    raise SystemExit('Runner checksum missing or unexpected in receipt.')
if receipt.get('acknowledgmentPersonallyAffirmed') is not True:
    raise SystemExit('Personal applicant acknowledgment was not recorded.')
if int(receipt.get('acknowledgmentStableSamples') or 0) < 3:
    raise SystemExit('Underlying acknowledgment stability was not established.')
if receipt.get('trustedOriginVerified') is not True:
    raise SystemExit('Trusted OpenAI origin was not verified.')
if not re.fullmatch(r'[a-f0-9]{64}', str(receipt.get('eventChainHead') or '')):
    raise SystemExit('Tamper-evident event-chain head is missing.')
if not receipt.get('confirmationEvidence'):
    raise SystemExit('Positive confirmation evidence is missing.')
lock = {
    'status': 'SUBMITTED',
    'submissionId': receipt.get('submissionId'),
    'sessionId': receipt.get('sessionId'),
    'runnerVersion': receipt.get('runnerVersion'),
    'runnerSourceSha256': receipt.get('runnerSourceSha256'),
    'timestamp': receipt.get('timestamp'),
    'applicationSha256': receipt.get('applicationSha256'),
    'acknowledgmentTextSha256': receipt.get('acknowledgmentTextSha256'),
    'eventChainHead': receipt.get('eventChainHead'),
    'confirmationText': receipt.get('confirmationText'),
    'confirmationEvidence': receipt.get('confirmationEvidence'),
    'submitClicks': receipt.get('submitClicks'),
}
(workspace / 'pathfinder-lock' / 'submission-lock.json').write_text(json.dumps(lock, indent=2), encoding='utf-8')
PY
