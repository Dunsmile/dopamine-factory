#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
. "${ROOT_DIR}/tests/_search.sh"

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
  if ! search_contains "${pattern}" "${ROOT_DIR}/${path}"; then
    echo "[FAIL] '${pattern}' not found in ${path}"
    exit 1
  fi
  echo "[PASS] '${pattern}' found in ${path}"
}

assert_not_contains() {
  local path="$1"
  local pattern="$2"
  if search_contains "${pattern}" "${ROOT_DIR}/${path}"; then
    echo "[FAIL] '${pattern}' should not exist in ${path}"
    exit 1
  fi
  echo "[PASS] '${pattern}' not found in ${path}"
}

assert_file "docs/FE_CODE_STANDARDS.md"
assert_file "fe/public/dunsmile/css/tokens.css"
assert_file "fe/public/dunsmile/css/components.css"
assert_file "fe/public/dunsmile/css/components-core.css"
assert_file "fe/public/dunsmile/css/components-hoxy.css"
assert_file "fe/public/assets/css/home.css"
assert_file "fe/public/dunsmile/templates/service-template.html"
assert_file "fe/public/dunsmile/templates/service-schema.json"

assert_contains "fe/public/dunsmile/css/tokens.css" "--font-family-base"
assert_contains "fe/public/dunsmile/css/tokens.css" "Pretendard"
assert_contains "fe/public/dunsmile/css/tokens.css" "--font-size-10"
assert_contains "fe/public/dunsmile/css/tokens.css" "--font-size-20"
assert_contains "fe/public/dunsmile/css/tokens.css" "--space-4"
assert_not_contains "fe/public/dunsmile/css/tokens.css" "--color-brand:"
assert_not_contains "fe/public/dunsmile/css/tokens.css" "--color-brand-soft:"
assert_contains "fe/public/dunsmile/css/style.css" "@import url\('/dunsmile/css/tokens.css'\)"
assert_contains "fe/public/dunsmile/css/style.css" "@import url\('/dunsmile/css/components.css'\)"
assert_contains "fe/public/dunsmile/css/components.css" "@import url\('/dunsmile/css/components-core.css'\)"
assert_contains "fe/public/dunsmile/css/components.css" "@import url\('/dunsmile/css/components-hoxy.css'\)"

assert_file "fe/public/js/netflix-ui.js"
assert_file "fe/public/js/netflix-shell.js"
assert_contains "fe/public/index.html" "/assets/css/home.css"
assert_contains "fe/public/index.html" "/js/home.data.js"
assert_contains "fe/public/index.html" "/js/netflix-shell.js"
assert_contains "fe/public/index.html" "/js/netflix-ui.js"
assert_not_contains "fe/public/index.html" "<style>"
assert_not_contains "fe/public/index.html" "style=\""
assert_contains "fe/public/js/netflix-shell.js" "nflx-poster-wrap"
assert_not_contains "fe/public/js/netflix-ui.js" "style=\""
assert_not_contains "fe/public/dunsmile/js/balance-game.js" "MARKET_SENTIMENT_ROUTE"
assert_not_contains "fe/public/dunsmile/js/name-compatibility.js" "MARKET_SENTIMENT_ROUTE"
assert_not_contains "fe/public/dunsmile/js/daily-fortune.js" "MARKET_SENTIMENT_ROUTE"
assert_not_contains "fe/public/dunsmile/js/face-test.js" "MARKET_SENTIMENT_ROUTE"
assert_not_contains "fe/public/dunsmile/js/balance-game.js" "function openServiceMenu"
assert_not_contains "fe/public/dunsmile/js/name-compatibility.js" "function openServiceMenu"
assert_not_contains "fe/public/dunsmile/js/daily-fortune.js" "function openServiceMenu"
assert_not_contains "fe/public/dunsmile/js/face-test.js" "function openServiceMenu"
assert_not_contains "fe/src/pages/dunsmile/balance-game/content.html" "style=\""
assert_not_contains "fe/src/pages/dunsmile/name-compatibility/content.html" "style=\""
assert_not_contains "fe/public/dunsmile/modules/balance-game/index.js" "style=\""
assert_not_contains "fe/public/dunsmile/modules/name-compatibility/index.js" "style=\""
assert_not_contains "fe/src/pages/dunsmile/market-sentiment/template.html" "<style>"
assert_not_contains "fe/src/pages/dunsmile/market-sentiment/body.html" "style=\""
assert_not_contains "fe/public/dunsmile/js/market-sentiment.js" "style=\"animation-delay"
assert_not_contains "fe/public/dunsmile/js/market-sentiment.js" "style=\"width:"
assert_not_contains "fe/public/dunsmile/js/market-sentiment.js" "bg-"
assert_not_contains "fe/public/dunsmile/js/market-sentiment.js" "text-"
assert_not_contains "fe/src/pages/dunsmile/hoxy-number/body.html" "style=\""
assert_contains "fe/src/pages/dunsmile/balance-game/content.html" "svc-result-head"
assert_contains "fe/src/pages/dunsmile/name-compatibility/content.html" "svc-name-result"
assert_contains "fe/src/pages/dunsmile/hoxy-number/body.html" "\\{\\{RELATED_CAROUSEL\\}\\}"
assert_contains "fe/public/dunsmile/css/module-templates.css" "svc-balance-question"
assert_contains "fe/public/dunsmile/css/module-templates.css" "svc-name-result"
assert_contains "fe/public/dunsmile/css/module-templates.css" "ms-pulse-orbit"
assert_contains "fe/public/dunsmile/css/module-templates.css" "ms-line-dot"
assert_contains "fe/public/dunsmile/css/components-hoxy.css" "hoxy-lucky-blur"
assert_contains "fe/public/dunsmile/css/components-hoxy.css" "hoxy-progress-full"
assert_contains "fe/public/dunsmile/css/components-hoxy.css" "hoxy-modal-btn-primary-red-sm"
assert_contains "fe/public/dunsmile/css/components-hoxy.css" "hoxy-modal-btn-primary-purple"
assert_contains "fe/public/dunsmile/css/components-core.css" "dp-menu-item"
assert_contains "fe/public/dunsmile/css/components-core.css" "svc-related-card"
assert_not_contains "fe/public/dunsmile/css/components-hoxy.css" "hoxy-service-carousel"
assert_not_contains "fe/public/dunsmile/css/components-hoxy.css" "hoxy-service-card-head-fortune"
assert_not_contains "fe/public/dunsmile/css/components-hoxy.css" "action-sheet-backdrop"
assert_not_contains "fe/public/dunsmile/css/components-hoxy.css" "number-input"
assert_not_contains "fe/public/dunsmile/css/components-hoxy.css" "card-compact"
assert_not_contains "fe/public/dunsmile/css/components-hoxy.css" "dp-market-shell"
assert_not_contains "fe/public/dunsmile/css/module-templates.css" "card-glow"
assert_not_contains "fe/public/dunsmile/css/module-templates.css" "card-shuffle"
assert_contains "fe/public/dunsmile/js/app.js" "hoxy-lucky-reveal-btn"
assert_contains "fe/public/dunsmile/js/app.js" "hoxy-manual-line-input"
assert_contains "fe/public/dunsmile/js/market-sentiment.js" "ms-status-badge"
assert_contains "fe/public/dunsmile/js/market-sentiment.js" "ms-source-badge"
assert_not_contains "fe/public/dunsmile/daily-fortune/index.html" "빠른 접근"
assert_not_contains "fe/public/dunsmile/hoxy-number/index.html" "빠른 접근"

echo "[PASS] code authoring rules checks complete"
