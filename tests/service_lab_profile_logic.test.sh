#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNNERS_FILE="${ROOT_DIR}/fe/public/dunsmile/js/service-lab.runners.js"
ENGINE_FILE="${ROOT_DIR}/fe/public/dunsmile/js/service-lab.js"

assert_contains() {
  local pattern="$1"
  local target="$2"
  if ! grep -q "${pattern}" "${target}"; then
    echo "[FAIL] '${pattern}' not found in ${target}"
    exit 1
  fi
  echo "[PASS] '${pattern}' found"
}

assert_contains "mbti-wealth-dna" "${RUNNERS_FILE}"
assert_contains "past-life-mbti" "${RUNNERS_FILE}"
assert_contains "\"love-chat-style\": makeProfileRunner" "${RUNNERS_FILE}"
assert_contains "\"habit-starter\": makeProfileRunner" "${RUNNERS_FILE}"
assert_contains "\"side-hustle-fit\": makeProfileRunner" "${RUNNERS_FILE}"
assert_contains "makeProfileRunner" "${RUNNERS_FILE}"
assert_contains "dimension:" "${RUNNERS_FILE}"
assert_contains "resolveRunnerResult" "${ENGINE_FILE}"
assert_contains "runner.profiles" "${ENGINE_FILE}"
