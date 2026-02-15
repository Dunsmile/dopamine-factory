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

assert_contains "function getLoadingMessage(progress)"
assert_contains "return '랜덤 번호 생성 중...'"
assert_contains "return '행운의 조합 찾는 중...'"
assert_contains "return '당첨 확률 계산 중...'"
assert_contains "return '마지막 검증 중...'"
assert_contains "return '완료!'"
assert_contains "messageEl.textContent = getLoadingMessage(progress)"
