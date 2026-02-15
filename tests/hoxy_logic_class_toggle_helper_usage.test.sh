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

assert_contains "function setClassActive(element, className, isActive)"
assert_contains "function setElementClasses(element, classesToAdd = [], classesToRemove = [])"
assert_contains "setClassActive(tab, 'active', false)"
assert_contains "setClassActive(tabEl, 'active', true)"
assert_contains "setClassActive(span, 'font-bold', false)"
assert_contains "setClassActive(span, 'font-bold', true)"
assert_contains "setElementClasses(btn, ['text-gray-400'], ['text-blue-600'])"
assert_contains "setElementClasses(btn, ['text-blue-600'], ['text-gray-400'])"
assert_contains "setElementClasses(btn, ['text-gray-500'], ['text-blue-600', 'bg-blue-50'])"
assert_contains "setElementClasses(btnDesktop, ['text-blue-600', 'bg-blue-50'], ['text-gray-500'])"
assert_contains "setClassActive(toast, 'show', true)"
assert_contains "setClassActive(toast, 'show', false)"
assert_contains "setClassActive(swipeState.item, 'swiping', false)"
assert_contains "setClassActive(item, 'swiping', true)"
assert_contains "setClassActive(blurredEl, 'lucky-reveal-animation', true)"
assert_contains "setClassActive(actionsEl, 'lucky-actions-show', true)"
assert_contains "setClassActive(cardEl, 'lucky-reveal-animation', true)"
assert_contains "setClassActive(backdrop, 'open', true)"
assert_contains "setClassActive(sidebar, 'open', true)"
assert_contains "setClassActive(backdrop, 'open', false)"
assert_contains "setClassActive(sidebar, 'open', false)"
assert_contains "setClassActive(input, 'filled', true)"
assert_contains "setClassActive(input, 'filled', false)"
