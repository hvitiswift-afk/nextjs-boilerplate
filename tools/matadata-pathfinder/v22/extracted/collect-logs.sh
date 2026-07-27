#!/usr/bin/env bash
set -euo pipefail
WORKSPACE="${GITHUB_WORKSPACE:?GITHUB_WORKSPACE is required}"
mkdir -p "$WORKSPACE/pathfinder-artifacts/logs"
for file in \
  pathfinder.log cloudflared-primary.log cloudflared-backup.log watchdog.log xvfb.log \
  local-health.json primary-health.json backup-health.json tunnel-warnings.log healthy-urls.txt; do
  cp "/tmp/pathfinder-live/$file" "$WORKSPACE/pathfinder-artifacts/logs/" 2>/dev/null || true
done
