#!/usr/bin/env bash
set -euo pipefail
mkdir -p /tmp/pathfinder-node /tmp/ms-playwright
cd /tmp/pathfinder-node
npm init -y >/dev/null
PLAYWRIGHT_BROWSERS_PATH=/tmp/ms-playwright npm install --no-audit --no-fund playwright@1.55.0
PLAYWRIGHT_BROWSERS_PATH=/tmp/ms-playwright npx playwright install --with-deps chromium
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y xvfb
curl --fail --location --silent --show-error \
  https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 \
  --output /tmp/cloudflared
chmod +x /tmp/cloudflared
/tmp/cloudflared version
