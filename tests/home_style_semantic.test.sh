#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${ROOT_DIR}/fe/public/index.html"

assert_contains() {
  local pattern="$1"
  if ! grep -q "${pattern}" "${TARGET}"; then
    echo "[FAIL] '${pattern}' not found in fe/public/index.html"
    exit 1
  fi
  echo "[PASS] '${pattern}' found"
}

assert_not_contains() {
  local pattern="$1"
  if grep -q "${pattern}" "${TARGET}"; then
    echo "[FAIL] '${pattern}' still found in fe/public/index.html"
    exit 1
  fi
  echo "[PASS] '${pattern}' removed"
}

# Style phase: semantic classes must exist on home shell blocks
assert_contains "class=\"home-body\""
assert_contains "class=\"home-header\""
assert_contains "class=\"home-header-inner\""
assert_contains "class=\"home-logo\""
assert_contains "class=\"home-header-search-btn\""
assert_contains "class=\"home-mobile-icon-btn\""
assert_contains "class=\"home-mobile-menu-btn\""
assert_contains "class=\"search-bar\""
assert_contains "class=\"search-close-btn\""
assert_contains "class=\"search-input\""
assert_contains "class=\"search-results\""
assert_contains "class=\"home-banner-section\""
assert_contains "banner-image"
assert_contains "class=\"carousel-dots\""
assert_contains "class=\"home-view-section\""
assert_contains "class=\"home-view-title\""
assert_contains "class=\"home-profile-links\""
assert_contains "class=\"home-profile-link\""
assert_contains "class=\"footer-inner\""
assert_contains "class=\"footer-company-text\""
assert_contains "class=\"footer-copy\""
assert_contains "class=\"home-sidebar-inner\""
assert_contains "class=\"home-sidebar-header\""
assert_contains "class=\"home-sidebar-title\""
assert_contains "class=\"home-sidebar-close-btn\""
assert_contains "class=\"home-bottom-nav\""
assert_contains "home-bottom-nav-item nav-item active"
assert_contains "home-bottom-nav-icon"

# Remove targeted Tailwind utility chains from shell blocks
assert_not_contains "class=\"bg-gray-50 min-h-screen\""
assert_not_contains "class=\"z-header bg-white border-b border-gray-100\""
assert_not_contains "class=\"w-10 h-10 flex items-center justify-center text-gray-500 hover:text-purple-600 rounded-full hover:bg-gray-100\""
assert_not_contains "class=\"w-8 h-8 flex items-center justify-center text-gray-600\""
assert_not_contains "class=\"w-8 h-8 flex items-center justify-center text-gray-600 hover:text-purple-600\""
assert_not_contains "class=\"p-4\""
assert_not_contains "class=\"flex items-center justify-between mb-4\""
assert_not_contains "class=\"text-base font-bold text-purple-600\""
assert_not_contains "class=\"w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600\""
