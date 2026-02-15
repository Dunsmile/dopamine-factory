#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

assert_contains() {
  local path="$1"
  local pattern="$2"
  if ! grep -q "${pattern}" "${ROOT_DIR}/${path}"; then
    echo "[FAIL] '${pattern}' not found in ${path}"
    exit 1
  fi
  echo "[PASS] '${pattern}' found in ${path}"
}

assert_not_contains() {
  local path="$1"
  local pattern="$2"
  if grep -q "${pattern}" "${ROOT_DIR}/${path}"; then
    echo "[FAIL] '${pattern}' still found in ${path}"
    exit 1
  fi
  echo "[PASS] '${pattern}' removed from ${path}"
}

assert_path_not_exists() {
  local path="$1"
  if [[ -e "${ROOT_DIR}/${path}" ]]; then
    echo "[FAIL] Path must be removed: ${path}"
    exit 1
  fi
  echo "[PASS] Removed path: ${path}"
}

assert_contains "fe/public/sitemap.xml" "https://dopamine-factory.pages.dev/dunsmile/about/"
assert_contains "fe/public/sitemap.xml" "https://dopamine-factory.pages.dev/dunsmile/privacy/"
assert_contains "fe/public/sitemap.xml" "https://dopamine-factory.pages.dev/dunsmile/terms/"

assert_not_contains "fe/public/sitemap.xml" "https://dopamine-factory.pages.dev/dunsmile/about.html"
assert_not_contains "fe/public/sitemap.xml" "https://dopamine-factory.pages.dev/dunsmile/privacy.html"
assert_not_contains "fe/public/sitemap.xml" "https://dopamine-factory.pages.dev/dunsmile/terms.html"

assert_not_contains "fe/public/dunsmile/about/index.html" "dunsmile/about.html"
assert_not_contains "fe/public/dunsmile/privacy/index.html" "dunsmile/privacy.html"
assert_not_contains "fe/public/dunsmile/terms/index.html" "dunsmile/terms.html"

assert_path_not_exists "fe/public/dunsmile/about.html"
assert_path_not_exists "fe/public/dunsmile/privacy.html"
assert_path_not_exists "fe/public/dunsmile/terms.html"
