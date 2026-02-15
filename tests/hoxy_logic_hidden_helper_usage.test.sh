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

assert_contains "function setHidden(element, shouldHide)"
assert_contains "setHidden(option5TimesEl, false)"
assert_contains "setHidden(optionRemainingEl, true)"
assert_contains "setHidden(option5TimesEl, true)"
assert_contains "setHidden(optionRemainingEl, false)"
assert_contains "setHidden(shareBannerEl, false)"
assert_contains "setHidden(shareBannerEl, true)"
assert_contains "setHidden(adminSection, false)"
assert_contains "setHidden(loginBtn, true)"
assert_contains "setHidden(logoutBtn, false)"
assert_contains "setHidden(loadingEl, false)"
assert_contains "setHidden(readyEl, true)"
assert_contains "setHidden(loadingEl, true)"
assert_contains "setHidden(readyEl, false)"
assert_contains "setHidden(actionsEl, false)"
assert_contains "setHidden(actionsEl, true)"
assert_contains "setHidden(adminLoginErrorEl, true)"
assert_contains "setHidden(errorEl, false)"
