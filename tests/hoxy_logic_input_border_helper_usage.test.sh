#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_FILE="${ROOT_DIR}/fe/public/dunsmile/js/app.js"

assert_contains() {
  local pattern="$1"
  if ! grep -Fq "${pattern}" "${APP_FILE}"; then
    echo "[FAIL] '${pattern}' not found in fe/public/dunsmile/js/app.js"
    exit 1
  fi
  echo "[PASS] '${pattern}' found"
}

assert_contains "function setInputErrorState(inputEl, hasError, includeDefaultBorder = false)"
assert_contains "setElementClasses(inputEl, ['border-red-500'], ['border-gray-300', 'border-blue-500'])"
assert_contains "setClassActive(inputEl, 'border-red-500', false)"
assert_contains "setClassActive(inputEl, 'border-gray-300', true)"
assert_contains "setInputErrorState(currentInput, true)"
assert_contains "setInputErrorState(currentInput, false)"
assert_contains "setInputErrorState(input, true)"
assert_contains "setInputErrorState(input, false, true)"
