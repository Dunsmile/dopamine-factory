#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

assert_file() {
  local path="$1"
  if [[ ! -f "${ROOT_DIR}/${path}" ]]; then
    echo "[FAIL] Missing file: ${path}"
    exit 1
  fi
  echo "[PASS] File exists: ${path}"
}

assert_contains() {
  local path="$1"
  local pattern="$2"
  if ! grep -q "${pattern}" "${ROOT_DIR}/${path}"; then
    echo "[FAIL] '${pattern}' not found in ${path}"
    exit 1
  fi
  echo "[PASS] '${pattern}' found in ${path}"
}

assert_not_contains_project() {
  local pattern="$1"
  if rg -n "${pattern}" "${ROOT_DIR}/fe/public" -S >/dev/null; then
    echo "[FAIL] Pattern still exists in fe/public: ${pattern}"
    exit 1
  fi
  echo "[PASS] Pattern removed from fe/public: ${pattern}"
}

# 1) Tailwind runtime CDN 제거 + 빌드 산출물 추가
assert_file "fe/public/assets/css/tailwind-built.css"
assert_not_contains_project "https://cdn.tailwindcss.com"

# 2) 신규 페이지 OG/Twitter 메타 추가
assert_contains "fe/public/dunsmile/balance-game/index.html" "property=\"og:title\""
assert_contains "fe/public/dunsmile/balance-game/index.html" "name=\"twitter:card\""
assert_contains "fe/public/dunsmile/name-compatibility/index.html" "property=\"og:title\""
assert_contains "fe/public/dunsmile/name-compatibility/index.html" "name=\"twitter:card\""

# 3) 과도한 keywords 축소 확인
KEYWORDS_LEN=$(perl -ne 'if (/<meta name="keywords" content="([^"]*)">/) { print length($1); exit }' "${ROOT_DIR}/fe/public/dunsmile/hoxy-number/index.html")
if [[ "${KEYWORDS_LEN}" -gt 600 ]]; then
  echo "[FAIL] keywords metadata too long (${KEYWORDS_LEN} chars)"
  exit 1
fi
echo "[PASS] keywords metadata length optimized (${KEYWORDS_LEN} chars)"
