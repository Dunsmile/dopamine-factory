#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
JS_TARGET="${ROOT_DIR}/fe/public/dunsmile/js/service-lab.js"
CSS_TARGET="${ROOT_DIR}/fe/public/dunsmile/css/style.css"

assert_contains() {
  local pattern="$1"
  local target="$2"
  if ! grep -q "${pattern}" "${target}"; then
    echo "[FAIL] '${pattern}' not found in ${target}"
    exit 1
  fi
  echo "[PASS] '${pattern}' found"
}

assert_contains "hoxy-lab-card" "${JS_TARGET}"
assert_contains "hoxy-lab-kicker" "${JS_TARGET}"
assert_contains "hoxy-lab-title" "${JS_TARGET}"
assert_contains "hoxy-lab-subtitle" "${JS_TARGET}"
assert_contains "hoxy-lab-meta" "${JS_TARGET}"
assert_contains "hoxy-lab-answer" "${JS_TARGET}"
assert_contains "hoxy-lab-result" "${JS_TARGET}"
assert_contains "hoxy-lab-guide" "${JS_TARGET}"
assert_contains "hoxy-lab-related" "${JS_TARGET}"

assert_contains ".hoxy-lab-card" "${CSS_TARGET}"
assert_contains ".hoxy-lab-answer" "${CSS_TARGET}"
assert_contains ".hoxy-lab-cta" "${CSS_TARGET}"
assert_contains ".hoxy-lab-cta-primary" "${CSS_TARGET}"
assert_contains ".hoxy-lab-cta-outline" "${CSS_TARGET}"
