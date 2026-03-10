#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INDEX_FILE="${ROOT_DIR}/fe/public/index.html"
HOME_JS_FILE="${ROOT_DIR}/fe/public/js/netflix-ui.js"
SHELL_JS_FILE="${ROOT_DIR}/fe/public/js/netflix-shell.js"
DATA_JS_FILE="${ROOT_DIR}/fe/public/js/home.data.js"

assert_contains() {
  local pattern="$1"
  local file="$2"
  if ! grep -Fq "$pattern" "$file"; then
    echo "[FAIL] '${pattern}' not found in ${file}"
    exit 1
  fi
  echo "[PASS] '${pattern}' found in ${file}"
}

assert_not_contains() {
  local pattern="$1"
  local file="$2"
  if grep -Fq "$pattern" "$file"; then
    echo "[FAIL] '${pattern}' should not exist in ${file}"
    exit 1
  fi
  echo "[PASS] '${pattern}' not found in ${file}"
}

assert_contains "/assets/css/home.css" "$INDEX_FILE"
assert_contains "/js/home.data.js" "$INDEX_FILE"
assert_contains "/js/netflix-shell.js" "$INDEX_FILE"
assert_contains "/js/netflix-ui.js" "$INDEX_FILE"
assert_contains "id=\"nflx-hero\"" "$INDEX_FILE"
assert_contains "id=\"nflx-rails\"" "$INDEX_FILE"
assert_contains "nflx-footer" "$INDEX_FILE"
assert_contains "서비스" "$INDEX_FILE"
assert_contains "이용안내" "$INDEX_FILE"
assert_contains "브랜드" "$INDEX_FILE"
assert_contains "CATEGORY_META" "$DATA_JS_FILE"
assert_contains "fortune: { label: '운세/사주'" "$DATA_JS_FILE"
assert_contains "fun: { label: '재미/밸런스'" "$DATA_JS_FILE"
assert_contains "renderRailSection" "$SHELL_JS_FILE"
assert_contains "bindRailInteractions" "$SHELL_JS_FILE"
assert_contains "nflx-poster-wrap" "$SHELL_JS_FILE"
assert_contains "HomeData.loadServices" "$HOME_JS_FILE"
assert_contains "NetflixShell.renderRailSection" "$HOME_JS_FILE"
assert_not_contains "while (displayItems.length < 8" "$HOME_JS_FILE"
assert_not_contains "<style>" "$INDEX_FILE"
assert_not_contains "style=\"" "$INDEX_FILE"
assert_not_contains "style=\"" "$HOME_JS_FILE"
