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

assert_contains_any() {
  local pattern="$1"
  shift
  for path in "$@"; do
    if grep -q "${pattern}" "${ROOT_DIR}/${path}"; then
      echo "[PASS] '${pattern}' found in ${path}"
      return 0
    fi
  done
  echo "[FAIL] '${pattern}' not found in any target files: $*"
  exit 1
}

# New feature pages
assert_file "fe/public/dunsmile/balance-game/index.html"
assert_file "fe/public/dunsmile/name-compatibility/index.html"

# Shared share-card utility
assert_file "fe/public/dunsmile/js/share-card.js"

# Portal links
assert_contains "fe/public/dunsmile/services.manifest.json" "\"id\": \"balance-game\""
assert_contains "fe/public/dunsmile/services.manifest.json" "\"id\": \"name-compatibility\""

# Service menu links on core pages
assert_contains_any "/dunsmile/balance-game/" \
  "fe/public/dunsmile/hoxy-number/index.html" \
  "fe/public/dunsmile/modules/balance-game/index.js"
assert_contains_any "/dunsmile/name-compatibility/" \
  "fe/public/dunsmile/hoxy-number/index.html" \
  "fe/public/dunsmile/modules/name-compatibility/index.js"
assert_contains_any "/dunsmile/balance-game/" \
  "fe/public/dunsmile/rich-face/index.html" \
  "fe/public/dunsmile/modules/rich-face/index.js" \
  "fe/public/dunsmile/js/module-layout.js"
assert_contains_any "/dunsmile/name-compatibility/" \
  "fe/public/dunsmile/rich-face/index.html" \
  "fe/public/dunsmile/modules/rich-face/index.js" \
  "fe/public/dunsmile/js/module-layout.js"
assert_contains_any "/dunsmile/balance-game/" \
  "fe/public/dunsmile/daily-fortune/index.html" \
  "fe/public/dunsmile/modules/daily-fortune/index.js" \
  "fe/public/dunsmile/js/module-layout.js"
assert_contains_any "/dunsmile/name-compatibility/" \
  "fe/public/dunsmile/daily-fortune/index.html" \
  "fe/public/dunsmile/modules/daily-fortune/index.js" \
  "fe/public/dunsmile/js/module-layout.js"

# Share card integration on existing result pages
assert_contains "fe/public/dunsmile/hoxy-number/index.html" "../js/share-card.js"
assert_contains_any "share-card.js" \
  "fe/public/dunsmile/rich-face/index.html" \
  "fe/public/dunsmile/modules/rich-face/index.js"
assert_contains_any "share-card.js" \
  "fe/public/dunsmile/daily-fortune/index.html" \
  "fe/public/dunsmile/modules/daily-fortune/index.js"

assert_contains "fe/public/dunsmile/js/app.js" "downloadHoxyShareCard"
assert_contains "fe/public/dunsmile/js/face-test.js" "downloadFaceShareCard"
assert_contains "fe/public/dunsmile/js/daily-fortune.js" "downloadFortuneShareCard"
