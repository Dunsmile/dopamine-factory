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

assert_contains "${INDEX_FILE}" "id=\"generatingModalMount\""
assert_contains "${INDEX_FILE}" "id=\"generatedModalMount\""

assert_not_contains "${INDEX_FILE}" "id=\"generatingModal\" class=\"modal-backdrop\""
assert_not_contains "${INDEX_FILE}" "id=\"generatedModal\" class=\"modal-backdrop\""

assert_contains "${APP_FILE}" "function renderGenerationFlowModals()"
assert_contains "${APP_FILE}" "generatingModalMount"
assert_contains "${APP_FILE}" "generatedModalMount"
assert_contains "${APP_FILE}" "loadingProgressBar"
assert_contains "${APP_FILE}" "loadingPercent"
assert_contains "${APP_FILE}" "loadingMessage"
