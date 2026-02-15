#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

assert_file() {
  local path="$1"
  if [[ ! -f "${ROOT_DIR}/${path}" ]]; then
    echo "[FAIL] Missing file: ${path}"
    exit 1
  fi
  echo "[PASS] File exists: ${path}"
}

assert_contains() {
  local path="$1"
  local pattern="$2"
  if ! grep -q "${pattern}" "${ROOT_DIR}/${path}"; then
    echo "[FAIL] '${pattern}' not found in ${path}"
    exit 1
  fi
  echo "[PASS] '${pattern}' found in ${path}"
}

# Worker app structure
assert_file "be/apps/market-sentiment-worker/wrangler.toml"
assert_file "be/apps/market-sentiment-worker/package.json"
assert_file "be/apps/market-sentiment-worker/src/index.ts"
assert_file "be/apps/market-sentiment-worker/src/crawlers/dcinside.ts"
assert_file "be/apps/market-sentiment-worker/src/crawlers/fmkorea.ts"
assert_file "be/apps/market-sentiment-worker/src/analyzer/keyword-score.ts"
assert_file "be/apps/market-sentiment-worker/src/matcher/assets.ts"
assert_file "be/apps/market-sentiment-worker/src/firebase/firestore-rest.ts"

# Worker API routes
assert_contains "be/apps/market-sentiment-worker/src/index.ts" "/api/market/assets"
assert_contains "be/apps/market-sentiment-worker/src/index.ts" "/api/market/sentiment/current"
assert_contains "be/apps/market-sentiment-worker/src/index.ts" "/api/market/sentiment/history"
assert_contains "be/apps/market-sentiment-worker/src/index.ts" "/api/market/posts"
assert_contains "be/apps/market-sentiment-worker/src/index.ts" "/api/market/pipeline/run"
assert_contains "be/apps/market-sentiment-worker/src/index.ts" "/api/market/health"

# Cron schedule
assert_contains "be/apps/market-sentiment-worker/wrangler.toml" "*/15 * * * *"

# New frontend page
assert_file "fe/public/dunsmile/market-sentiment/index.html"
assert_file "fe/public/dunsmile/js/market-sentiment.js"
assert_contains "fe/public/dunsmile/market-sentiment/index.html" "market-sentiment.js"
assert_contains "fe/public/dunsmile/market-sentiment/index.html" "/api/market/sentiment/current"

# Navigation exposure
assert_contains "fe/public/index.html" "/dunsmile/market-sentiment/"
assert_contains "fe/public/dunsmile/hoxy-number/index.html" "/dunsmile/market-sentiment/"
assert_contains "fe/public/dunsmile/rich-face/index.html" "/dunsmile/market-sentiment/"
assert_contains "fe/public/dunsmile/daily-fortune/index.html" "/dunsmile/market-sentiment/"
assert_contains "fe/public/dunsmile/balance-game/index.html" "/dunsmile/market-sentiment/"
assert_contains "fe/public/dunsmile/name-compatibility/index.html" "/dunsmile/market-sentiment/"

# Run worker unit tests
if [[ -f "${ROOT_DIR}/be/apps/market-sentiment-worker/package.json" ]]; then
  if [[ ! -d "${ROOT_DIR}/be/apps/market-sentiment-worker/node_modules" ]]; then
    (cd "${ROOT_DIR}/be/apps/market-sentiment-worker" && npm install --silent)
  fi
  (cd "${ROOT_DIR}/be/apps/market-sentiment-worker" && npm test -- --run)
fi

echo "[PASS] market sentiment feature checks complete"
