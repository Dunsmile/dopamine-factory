#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_FILE="${ROOT_DIR}/fe/public/dunsmile/js/app.js"

assert_not_contains() {
  local pattern="$1"
  if grep -Fq "${pattern}" "${APP_FILE}"; then
    echo "[FAIL] disallowed direct class toggle found: ${pattern}"
    exit 1
  fi
  echo "[PASS] disallowed pattern not found: ${pattern}"
}

assert_not_contains "classList.add('show')"
assert_not_contains "classList.remove('show')"
assert_not_contains "classList.add('swiping')"
assert_not_contains "classList.remove('swiping')"
assert_not_contains "classList.add('lucky-reveal-animation')"
assert_not_contains "classList.add('lucky-actions-show')"
