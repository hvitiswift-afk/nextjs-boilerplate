#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${SERVICE_BRIDGE_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
cd "$ROOT_DIR"

mkdir -p logs artifacts
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
LOG="logs/service-bridge-verify-${STAMP}.log"

{
  echo "JP / Hviti Service Bridge scheduled verification"
  echo "Started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  npm run service-bridge:check:all
  npm run build
  echo "Finished: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "External action completed: false"
} 2>&1 | tee "$LOG"
