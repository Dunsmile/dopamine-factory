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

# modal open/close logic should use shared helper
assert_contains "setModalActive('generateConfirmModal', true)"
assert_contains "setModalActive('generateConfirmModal', false)"
assert_contains "setModalActive('adForQuotaModal', true)"
assert_contains "setModalActive('adForQuotaModal', false)"
assert_contains "setModalActive('expandSlotsModal', true)"
assert_contains "setModalActive('expandSlotsModal', false)"
assert_contains "setModalActive('pageAddConfirmModal', true)"
assert_contains "setModalActive('pageAddConfirmModal', false)"
assert_contains "setModalActive('savedPageAddConfirmModal', true)"
assert_contains "setModalActive('savedPageAddConfirmModal', false)"
assert_contains "setModalActive('generatedModal', true)"
assert_contains "setModalActive('generatedModal', false)"
