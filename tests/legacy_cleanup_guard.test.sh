#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

assert_not_contains() {
  local path="$1"
  local pattern="$2"
  if rg -n -- "${pattern}" "${ROOT_DIR}/${path}" >/dev/null; then
    echo "[FAIL] '${pattern}' should not exist in ${path}"
    exit 1
  fi
  echo "[PASS] '${pattern}' not found in ${path}"
}

assert_contains() {
  local path="$1"
  local pattern="$2"
  if ! rg -n -- "${pattern}" "${ROOT_DIR}/${path}" >/dev/null; then
    echo "[FAIL] '${pattern}' not found in ${path}"
    exit 1
  fi
  echo "[PASS] '${pattern}' found in ${path}"
}

assert_not_contains "fe/src/pages/dunsmile/daily-fortune/body.html" "<style>"
assert_not_contains "fe/src/pages/dunsmile/daily-fortune/body.html" "scrollbar-width: none"
assert_not_contains "fe/src/pages/dunsmile/tarot-reading/body.html" "<style>"
assert_not_contains "fe/src/pages/dunsmile/tarot-reading/body.html" "scrollbar-width: none"
assert_not_contains "fe/src/pages/dunsmile/hoxy-number/body.html" "<style>"
assert_not_contains "fe/src/pages/dunsmile/hoxy-number/body.html" "style=\""
assert_not_contains "fe/src/pages/dunsmile/market-sentiment/template.html" "<style>"
assert_not_contains "fe/src/pages/dunsmile/market-sentiment/body.html" "style=\""

assert_contains "fe/src/pages/dunsmile/daily-fortune/body.html" "\\{\\{RELATED_CAROUSEL\\}\\}"
assert_contains "fe/src/pages/dunsmile/tarot-reading/body.html" "\\{\\{RELATED_CAROUSEL\\}\\}"
assert_contains "fe/src/pages/dunsmile/hoxy-number/body.html" "\\{\\{RELATED_CAROUSEL\\}\\}"
assert_contains "fe/src/pages/dunsmile/rich-face/body.html" "\\{\\{RELATED_CAROUSEL\\}\\}"
assert_not_contains "fe/src/pages/dunsmile/daily-fortune/body.html" "step p-4"
assert_not_contains "fe/src/pages/dunsmile/tarot-reading/body.html" "step p-4"
assert_not_contains "fe/src/pages/dunsmile/rich-face/body.html" "step p-4"
assert_contains "fe/src/pages/dunsmile/daily-fortune/body.html" "dp-service-step"
assert_contains "fe/src/pages/dunsmile/tarot-reading/body.html" "dp-service-step"
assert_contains "fe/src/pages/dunsmile/rich-face/body.html" "dp-service-step"
assert_contains "fe/src/pages/dunsmile/market-sentiment/body.html" "main-container dp-shell-no-edge"
assert_contains "fe/src/pages/dunsmile/market-sentiment/body.html" "dp-service-frame"
assert_contains "fe/src/pages/dunsmile/market-sentiment/body.html" "ms-pulse-orbit"
assert_contains "fe/src/pages/dunsmile/market-sentiment/body.html" "ms-history-line"

echo "[PASS] legacy cleanup guard checks complete"
