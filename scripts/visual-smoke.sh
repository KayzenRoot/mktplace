#!/usr/bin/env bash
set -Eeuo pipefail
mkdir -p artifacts
export ALLOW_PUBLIC_DEMO=true
export NODE_ENV=production
npm run start >/tmp/mktplace-preview.log 2>&1 &
server_pid=$!
trap 'kill "$server_pid" 2>/dev/null || true' EXIT
for i in $(seq 1 60); do
  if curl --silent --fail --output /dev/null http://127.0.0.1:3000; then break; fi
  sleep 1
done
curl -fsS http://127.0.0.1:3000/ > /tmp/mktplace-home.html
curl -fsS http://127.0.0.1:3000/settings/integrations > /tmp/mktplace-settings.html
grep -q 'MODO DEMO' /tmp/mktplace-home.html
grep -q 'Conectar Bling' /tmp/mktplace-settings.html
grep -q 'disabled' /tmp/mktplace-settings.html
chrome=$(command -v google-chrome || command -v chromium || command -v chromium-browser || true)
if [[ -z "$chrome" ]]; then echo 'Chrome not installed on runner' >&2; exit 1; fi
"$chrome" --headless --no-sandbox --disable-dev-shm-usage --disable-gpu --hide-scrollbars --no-first-run --screenshot=artifacts/dashboard-desktop.png --window-size=1440,900 http://127.0.0.1:3000/ >/tmp/chrome-dashboard.log 2>&1
"$chrome" --headless --no-sandbox --disable-dev-shm-usage --disable-gpu --hide-scrollbars --no-first-run --screenshot=artifacts/integrations-desktop.png --window-size=1440,900 http://127.0.0.1:3000/settings/integrations >/tmp/chrome-integrations.log 2>&1
"$chrome" --headless --no-sandbox --disable-dev-shm-usage --disable-gpu --hide-scrollbars --no-first-run --screenshot=artifacts/dashboard-mobile.png --window-size=390,844 --force-device-scale-factor=1 http://127.0.0.1:3000/ >/tmp/chrome-mobile.log 2>&1
for screenshot in artifacts/*.png; do test -s "$screenshot" || exit 1; done
printf '%s\n' 'Visual snapshots and SSR smoke succeeded (demo only).'
