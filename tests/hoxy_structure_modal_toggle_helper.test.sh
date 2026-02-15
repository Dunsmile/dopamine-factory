#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_FILE="${ROOT_DIR}/fe/public/dunsmile/js/app.js"

assert_contains() {
  local file="$1"
  local pattern="$2"
  if ! grep -q "${pattern}" "${file}"; then
    echo "[FAIL] '${pattern}' not found in ${file#${ROOT_DIR}/}"
    exit 1
  fi
  echo "[PASS] '${pattern}' found in ${file#${ROOT_DIR}/}"
}

# modal toggle helper exists
assert_contains "${APP_FILE}" "function setModalActive(modalId, isActive)"

# settings/info modal wrappers use helper
assert_contains "${APP_FILE}" "setModalActive('settingsModal', true)"
assert_contains "${APP_FILE}" "setModalActive('settingsModal', false)"
assert_contains "${APP_FILE}" "setModalActive('aboutModal', true)"
assert_contains "${APP_FILE}" "setModalActive('aboutModal', false)"
assert_contains "${APP_FILE}" "setModalActive('privacyModal', true)"
assert_contains "${APP_FILE}" "setModalActive('privacyModal', false)"
assert_contains "${APP_FILE}" "setModalActive('termsModal', true)"
assert_contains "${APP_FILE}" "setModalActive('termsModal', false)"
