#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INDEX_FILE="${ROOT_DIR}/fe/public/dunsmile/hoxy-number/index.html"
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

assert_not_contains() {
  local file="$1"
  local pattern="$2"
  if grep -q "${pattern}" "${file}"; then
    echo "[FAIL] '${pattern}' still found in ${file#${ROOT_DIR}/}"
    exit 1
  fi
  echo "[PASS] '${pattern}' removed from ${file#${ROOT_DIR}/}"
}

# structure mount in HTML
assert_contains "${INDEX_FILE}" "id=\"generateConfirmModalMount\""

# static generate confirm modal markup removed from HTML
assert_not_contains "${INDEX_FILE}" "id=\"generateConfirmModal\" class=\"modal-backdrop\""

# renderer exists in JS
assert_contains "${APP_FILE}" "function renderGenerateConfirmModal()"
assert_contains "${APP_FILE}" "generateConfirmModalMount"
assert_contains "${APP_FILE}" "generateConfirmModal"
assert_contains "${APP_FILE}" "confirmRemaining"
assert_contains "${APP_FILE}" "remainingDrawCount"
