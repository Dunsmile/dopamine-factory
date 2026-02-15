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

# structure mounts in HTML
assert_contains "${INDEX_FILE}" "id=\"saveConfirmModalMount\""
assert_contains "${INDEX_FILE}" "id=\"deleteConfirmModalMount\""

# duplicated static action modal markup removed from HTML
assert_not_contains "${INDEX_FILE}" "id=\"saveConfirmModal\" class=\"modal-backdrop\""
assert_not_contains "${INDEX_FILE}" "id=\"deleteConfirmModal\" class=\"modal-backdrop\""

# action modal template renderer exists in JS
assert_contains "${APP_FILE}" "function renderActionConfirmModals()"
assert_contains "${APP_FILE}" "saveConfirmModalMount"
assert_contains "${APP_FILE}" "deleteConfirmModalMount"
assert_contains "${APP_FILE}" "saveConfirmModal"
assert_contains "${APP_FILE}" "deleteConfirmModal"
