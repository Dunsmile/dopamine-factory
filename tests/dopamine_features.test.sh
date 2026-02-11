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

# New feature pages
assert_file "fe/public/dunsmile/balance-game/index.html"
assert_file "fe/public/dunsmile/name-compatibility/index.html"

# Shared share-card utility
assert_file "fe/public/dunsmile/js/share-card.js"

# Portal links
assert_contains "fe/public/index.html" "/dunsmile/balance-game/"
assert_contains "fe/public/index.html" "/dunsmile/name-compatibility/"

# Service menu links on core pages
assert_contains "fe/public/dunsmile/hoxy-number/index.html" "/dunsmile/balance-game/"
assert_contains "fe/public/dunsmile/hoxy-number/index.html" "/dunsmile/name-compatibility/"
assert_contains "fe/public/dunsmile/rich-face/index.html" "/dunsmile/balance-game/"
assert_contains "fe/public/dunsmile/rich-face/index.html" "/dunsmile/name-compatibility/"
assert_contains "fe/public/dunsmile/daily-fortune/index.html" "/dunsmile/balance-game/"
assert_contains "fe/public/dunsmile/daily-fortune/index.html" "/dunsmile/name-compatibility/"

# Share card integration on existing result pages
assert_contains "fe/public/dunsmile/hoxy-number/index.html" "../js/share-card.js"
assert_contains "fe/public/dunsmile/rich-face/index.html" "../js/share-card.js"
assert_contains "fe/public/dunsmile/daily-fortune/index.html" "../js/share-card.js"

assert_contains "fe/public/dunsmile/js/app.js" "downloadHoxyShareCard"
assert_contains "fe/public/dunsmile/js/face-test.js" "downloadFaceShareCard"
assert_contains "fe/public/dunsmile/js/daily-fortune.js" "downloadFortuneShareCard"
