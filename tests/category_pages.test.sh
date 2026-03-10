#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INDEX_FILE="${ROOT_DIR}/fe/public/index.html"

assert_file() {
  local file="$1"
  if [[ ! -f "$file" ]]; then
    echo "[FAIL] Missing file: $file"
    exit 1
  fi
  echo "[PASS] File exists: $file"
}

assert_contains() {
  local pattern="$1"
  local file="$2"
  if ! grep -Fq "$pattern" "$file"; then
    echo "[FAIL] '$pattern' not found in $file"
    exit 1
  fi
  echo "[PASS] '$pattern' found in $file"
}

assert_file "${ROOT_DIR}/fe/public/js/category-ui.js"
assert_file "${ROOT_DIR}/fe/public/js/netflix-shell.js"
assert_file "${ROOT_DIR}/fe/public/js/home.data.js"
assert_file "${ROOT_DIR}/fe/public/assets/css/category.css"
assert_file "${ROOT_DIR}/fe/public/category/fortune/index.html"
assert_file "${ROOT_DIR}/fe/public/category/fun/index.html"
assert_file "${ROOT_DIR}/fe/public/category/luck/index.html"
assert_file "${ROOT_DIR}/fe/public/category/finance/index.html"
assert_file "${ROOT_DIR}/fe/public/category/experimental/index.html"

assert_contains "/category/fortune/" "$INDEX_FILE"
assert_contains "/category/fun/" "$INDEX_FILE"
assert_contains "/category/luck/" "$INDEX_FILE"
assert_contains "/category/finance/" "$INDEX_FILE"
assert_contains "/category/experimental/" "$INDEX_FILE"

assert_contains "data-category=\"fortune\"" "${ROOT_DIR}/fe/public/category/fortune/index.html"
assert_contains "data-category=\"fun\"" "${ROOT_DIR}/fe/public/category/fun/index.html"
assert_contains "/js/home.data.js" "${ROOT_DIR}/fe/public/category/fortune/index.html"
assert_contains "/js/netflix-shell.js" "${ROOT_DIR}/fe/public/category/fortune/index.html"
assert_contains "/js/category-ui.js" "${ROOT_DIR}/fe/public/category/fortune/index.html"
assert_contains "/assets/css/category.css" "${ROOT_DIR}/fe/public/category/fortune/index.html"
assert_contains "id=\"nflx-hero\"" "${ROOT_DIR}/fe/public/category/fortune/index.html"
assert_contains "id=\"categoryRails\"" "${ROOT_DIR}/fe/public/category/fortune/index.html"
assert_contains "nflx-footer" "${ROOT_DIR}/fe/public/category/fortune/index.html"
assert_contains "NetflixShell.renderRailSection" "${ROOT_DIR}/fe/public/js/category-ui.js"
assert_contains "HomeData.CATEGORY_META" "${ROOT_DIR}/fe/public/js/category-ui.js"
assert_contains "nflx-poster-wrap" "${ROOT_DIR}/fe/public/js/netflix-shell.js"
assert_contains "service.ogImage" "${ROOT_DIR}/fe/public/js/netflix-shell.js"

echo "[PASS] category page checks complete"
