#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INDEX_FILE="${ROOT_DIR}/fe/public/index.html"
HOME_JS_FILE="${ROOT_DIR}/fe/public/js/home.js"
HOME_CSS_FILE="${ROOT_DIR}/fe/public/assets/css/home.css"

assert_contains() {
  local pattern="$1"
  local file="$2"
  if ! grep -Fq "$pattern" "$file"; then
    echo "[FAIL] '${pattern}' not found in ${file}"
    exit 1
  fi
  echo "[PASS] '${pattern}' found in ${file}"
}

assert_not_contains() {
  local pattern="$1"
  local file="$2"
  if grep -Fq "$pattern" "$file"; then
    echo "[FAIL] '${pattern}' should not exist in ${file}"
    exit 1
  fi
  echo "[PASS] '${pattern}' not found in ${file}"
}

assert_order() {
  local first="$1"
  local second="$2"
  local file="$3"
  local first_line second_line
  first_line=$(grep -n "$first" "$file" | head -n1 | cut -d: -f1 || true)
  second_line=$(grep -n "$second" "$file" | head -n1 | cut -d: -f1 || true)
  if [[ -z "${first_line}" || -z "${second_line}" ]]; then
    echo "[FAIL] order check missing token(s): '${first}' '${second}' in ${file}"
    exit 1
  fi
  if (( first_line >= second_line )); then
    echo "[FAIL] order check failed: '${first}' should appear before '${second}' in ${file}"
    exit 1
  fi
  echo "[PASS] order check: '${first}' before '${second}' in ${file}"
}

assert_contains 'class="home-nav dds-glass"' "$INDEX_FILE"
assert_contains 'href="/dunsmile/css/components.css"' "$INDEX_FILE"
assert_contains 'id="navSearchBtn"' "$INDEX_FILE"
assert_contains 'id="navMenuBtn"' "$INDEX_FILE"
assert_contains 'button type="button" id="navMenuBtn"' "$INDEX_FILE"
assert_contains 'onclick="openServiceMenu()"' "$INDEX_FILE"
assert_contains 'id="serviceMenuBackdrop"' "$INDEX_FILE"
assert_contains 'id="serviceMenuSidebar"' "$INDEX_FILE"
assert_contains 'id="serviceMenuGroups"' "$INDEX_FILE"
assert_contains 'id="serviceMenuSearch"' "$INDEX_FILE"
assert_contains 'id="serviceMenuSearchEmpty"' "$INDEX_FILE"
assert_not_contains 'href="/dunsmile/about/" id="navMenuBtn"' "$INDEX_FILE"
assert_contains 'id="homeHeroSpotlightRoot"' "$INDEX_FILE"
assert_contains 'id="homeHeroImage"' "$INDEX_FILE"
assert_contains 'id="homeFeedRoot"' "$INDEX_FILE"
assert_contains 'id="homeSearchInput"' "$INDEX_FILE"
assert_contains 'class="home-footer-v3"' "$INDEX_FILE"
assert_contains 'href="/dunsmile/about/"' "$INDEX_FILE"
assert_contains 'href="/dunsmile/terms/"' "$INDEX_FILE"
assert_contains 'href="/dunsmile/privacy/"' "$INDEX_FILE"
assert_contains 'class="mobile-tab-bar dds-glass"' "$INDEX_FILE"
assert_contains 'class="home-logo dp-header-home"' "$INDEX_FILE"
assert_not_contains 'id="homeHeroCtaRoot"' "$INDEX_FILE"
assert_order 'class="home-nav dds-glass"' 'class="home-feed-v3" id="viewHome"' "$INDEX_FILE"
assert_order 'class="home-feed-v3" id="viewHome"' 'class="home-footer-v3"' "$INDEX_FILE"

assert_contains 'function renderMeshHero' "$HOME_JS_FILE"
assert_contains 'function renderFeed' "$HOME_JS_FILE"
assert_contains 'function updateUI' "$HOME_JS_FILE"
assert_contains 'homeState.keyword' "$HOME_JS_FILE"
assert_contains 'homeSearchInput' "$HOME_JS_FILE"
assert_contains 'updateUI();' "$HOME_JS_FILE"
assert_contains 'renderSidebarServices' "$HOME_JS_FILE"
assert_contains 'serviceMenuSidebar' "$HOME_JS_FILE"
assert_contains 'serviceMenuGroups' "$HOME_JS_FILE"
assert_not_contains 'renderNoblesseSeries' "$HOME_JS_FILE"
assert_not_contains 'renderArtnowSection' "$HOME_JS_FILE"
assert_not_contains 'EXPERIENCE NOW' "$HOME_JS_FILE"
assert_not_contains 'ALL SERVICES' "$HOME_JS_FILE"

assert_contains 'overflow-x: hidden;' "$HOME_CSS_FILE"
assert_contains '.home-nav {' "$HOME_CSS_FILE"
assert_contains '.home-header-v3 {' "$HOME_CSS_FILE"
assert_contains '.home-hero-banner {' "$HOME_CSS_FILE"
assert_contains '.home-hero-image-v3 {' "$HOME_CSS_FILE"
assert_contains '.home-feed-v3 {' "$HOME_CSS_FILE"
assert_contains '.home-card-grid-v3 {' "$HOME_CSS_FILE"
assert_contains '.home-footer-v3 {' "$HOME_CSS_FILE"
assert_contains '.mobile-tab-bar {' "$HOME_CSS_FILE"
assert_contains '@media (max-width: 768px)' "$HOME_CSS_FILE"
assert_not_contains 'width: 100vw;' "$HOME_CSS_FILE"

echo "[PASS] home UX guard checks completed"
