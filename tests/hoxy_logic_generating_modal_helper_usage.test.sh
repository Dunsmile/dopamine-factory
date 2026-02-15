#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_FILE="${ROOT_DIR}/fe/public/dunsmile/js/app.js"

assert_contains() {
  local pattern="$1"
  if ! grep -q "${pattern}" "${APP_FILE}"; then
    echo "[FAIL] '${pattern}' not found in fe/public/dunsmile/js/app.js"
    exit 1
  fi
  echo "[PASS] '${pattern}' found"
}

assert_contains "setModalActive('generatingModal', true)"
assert_contains "setModalActive('generatingModal', false)"
