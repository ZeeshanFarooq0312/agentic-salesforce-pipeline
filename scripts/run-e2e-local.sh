#!/usr/bin/env bash
# Runs the full local stack and the cross-system Playwright spec against your dev org.
#   scripts/run-e2e-local.sh [org-alias]      (default alias: dev)
# Needs: sf CLI (Node 22+), jq, dotnet 8 SDK, npm. The access token stays in this
# process's environment only; it is never written to disk.
set -euo pipefail
cd "$(dirname "$0")/.."
org="${1:-dev}"
export PATH="$HOME/.dotnet:$PATH"

for c in sf jq dotnet npm; do command -v "$c" >/dev/null || { echo "missing: $c" >&2; exit 1; }; done

info="$(sf org display --target-org "$org" --verbose --json)"
export SF_INSTANCE_URL="$(jq -r '.result.instanceUrl' <<<"$info")"
export SF_ACCESS_TOKEN="$(jq -r '.result.accessToken' <<<"$info")"
export AllowedOrigin="http://localhost:5173"
export REACT_URL="http://localhost:5173"
export VITE_API_URL="http://localhost:5000"

pids=()
cleanup() { for p in "${pids[@]:-}"; do kill "$p" 2>/dev/null || true; done; }
trap cleanup EXIT

echo "==> Starting .NET API on :5000"
ASPNETCORE_URLS="http://localhost:5000" dotnet run --project apps/dotnet-api/src/Api >/tmp/e2e-api.log 2>&1 &
pids+=($!)

echo "==> Starting React on :5173"
(cd apps/react-web && npm install --no-audit --no-fund >/dev/null && npx vite --port 5173 --strictPort >/tmp/e2e-web.log 2>&1) &
pids+=($!)

echo "==> Waiting for services"
for url in http://localhost:5000/health http://localhost:5173; do
  for _ in $(seq 1 60); do curl -fs "$url" >/dev/null 2>&1 && break; sleep 1; done
  curl -fs "$url" >/dev/null || { echo "service did not start: $url (see /tmp/e2e-*.log)" >&2; exit 1; }
done

echo "==> Playwright"
npm install --no-audit --no-fund >/dev/null
npx playwright install chromium >/dev/null
npx playwright test tests/e2e/account-wizard.spec.ts
