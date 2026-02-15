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

assert_contains "${INDEX_FILE}" "id=\"adminLoginModalMount\""
assert_not_contains "${INDEX_FILE}" "id=\"adminLoginModal\" class=\"modal-backdrop\""

assert_contains "${APP_FILE}" "function renderAdminLoginModal()"
assert_contains "${APP_FILE}" "adminLoginModalMount"
assert_contains "${APP_FILE}" "adminLoginModal"
assert_contains "${APP_FILE}" "adminIdInput"
assert_contains "${APP_FILE}" "adminPwInput"
