#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${ROOT_DIR}/fe/public/dunsmile/hoxy-number/index.html"
APP_TARGET="${ROOT_DIR}/fe/public/dunsmile/js/app.js"

assert_contains() {
  local pattern="$1"
  if ! grep -q "${pattern}" "${TARGET}"; then
    echo "[FAIL] '${pattern}' not found in fe/public/dunsmile/hoxy-number/index.html"
    exit 1
  fi
  echo "[PASS] '${pattern}' found"
}

assert_not_contains() {
  local pattern="$1"
  if grep -q "${pattern}" "${TARGET}"; then
    echo "[FAIL] '${pattern}' still found in fe/public/dunsmile/hoxy-number/index.html"
    exit 1
  fi
  echo "[PASS] '${pattern}' removed"
}

assert_contains_in_html_or_js() {
  local pattern="$1"
  if grep -q "${pattern}" "${TARGET}" || grep -q "${pattern}" "${APP_TARGET}"; then
    echo "[PASS] '${pattern}' found in html/js"
    return
  fi
  echo "[FAIL] '${pattern}' not found in html/js"
  exit 1
}

# Shell-level semantic classes
assert_contains "class=\"hoxy-page\""
assert_contains "class=\"hoxy-app-shell\""
assert_contains "class=\"hoxy-top-nav\""
assert_contains "class=\"hoxy-top-nav-inner\""
assert_contains "class=\"hoxy-brand-title\""
assert_contains "class=\"hoxy-top-actions\""
assert_contains "class=\"hoxy-icon-btn\""
assert_contains "hoxy-home-stack"
assert_contains "class=\"hoxy-lucky-card\""
assert_contains "class=\"hoxy-generator-card\""
assert_contains "class=\"hoxy-generator-title\""
assert_contains "class=\"hoxy-generator-desc\""
assert_contains "class=\"tab-content tab-padding hoxy-tab-stack\""
assert_contains "class=\"hoxy-saved-top-card\""
assert_contains "class=\"hoxy-check-top-card\""
assert_contains "class=\"hoxy-pill-btn hoxy-pill-btn-blue\""
assert_contains "class=\"hoxy-pill-btn hoxy-pill-btn-red\""
assert_contains "class=\"hoxy-pill-badge\""
assert_contains "class=\"hoxy-panel-card\""
assert_contains "class=\"hoxy-desktop-tab-btn text-blue-600 bg-blue-50\""
assert_contains "class=\"hoxy-desktop-tab-btn text-gray-500 hover:bg-gray-100\""
assert_contains "class=\"hoxy-desktop-tab-icon\""
assert_contains "class=\"hoxy-desktop-tab-label\""
assert_contains "class=\"hoxy-mobile-bottom-nav bottom-nav md:hidden\""
assert_contains "class=\"hoxy-mobile-bottom-grid\""
assert_contains "class=\"hoxy-mobile-tab-btn text-blue-600\""
assert_contains "class=\"hoxy-mobile-tab-btn text-gray-400 hover:text-gray-600\""
assert_contains "class=\"hoxy-mobile-tab-icon\""
assert_contains "class=\"hoxy-mobile-tab-label\""
assert_contains "class=\"hoxy-pagination-btn hoxy-pagination-btn-prev\""
assert_contains "class=\"hoxy-pagination-btn hoxy-pagination-btn-next\""
assert_contains "class=\"hoxy-inline-action-btn\""
assert_contains "class=\"hoxy-cta-btn hoxy-cta-btn-primary hoxy-cta-btn-lg\""
assert_contains "hoxy-cta-btn hoxy-cta-btn-outline-blue"
assert_contains "hoxy-cta-btn hoxy-cta-btn-white-purple hoxy-cta-btn-sm"
assert_contains "hoxy-cta-btn hoxy-cta-btn-soft-purple hoxy-cta-btn-sm hoxy-cta-btn-with-icon"
assert_contains "hoxy-cta-btn hoxy-cta-btn-primary hoxy-cta-btn-sm"
assert_contains_in_html_or_js "hoxy-modal-confirm-title"
assert_contains_in_html_or_js "hoxy-cta-btn hoxy-cta-btn-primary hoxy-cta-btn-sm"
assert_contains_in_html_or_js "hoxy-cta-btn hoxy-cta-btn-white-purple hoxy-cta-btn-sm hoxy-cta-btn-with-icon"
assert_contains_in_html_or_js "hoxy-cta-btn hoxy-cta-btn-primary-mix hoxy-cta-btn-sm"
assert_contains "class=\"hoxy-select-field\""
assert_contains_in_html_or_js "hoxy-input-field"
assert_contains "class=\"hoxy-carousel-title\""
assert_contains "class=\"hoxy-carousel-indicator\""
assert_contains "class=\"hoxy-carousel-indicator-dot active\""
assert_contains "class=\"hoxy-disclaimer-box\""

# Remove targeted utility chains from shell blocks
assert_not_contains "class=\"bg-white md:bg-gray-50\""
assert_not_contains "class=\"max-w-md md:max-w-xl mx-auto min-h-screen bg-white relative\""
assert_not_contains "class=\"sticky top-0 bg-white border-b border-gray-200 z-10 shadow-sm\""
assert_not_contains "class=\"flex items-center justify-between px-4 h-14\""
assert_not_contains "class=\"text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap\""
assert_not_contains "class=\"p-2 hover:bg-gray-100 rounded-lg transition-colors\""
assert_not_contains "class=\"tab-content active tab-padding space-y-3 pb-24\""
assert_not_contains "class=\"tab-content tab-padding space-y-3 pb-24\""
assert_not_contains "class=\"bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 rounded-2xl p-3 shadow-lg border-2 border-purple-200\""
assert_not_contains "class=\"bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-3 border-2 border-blue-200\""
assert_not_contains "class=\"text-xl font-bold text-gray-900 mb-1\""
assert_not_contains "class=\"text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-0.5 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors\""
assert_not_contains "class=\"text-xs text-red-600 hover:text-red-700 font-medium px-2 py-0.5 bg-red-50 rounded-full hover:bg-red-100 transition-colors\""
assert_not_contains "class=\"text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium\""
assert_not_contains "class=\"bg-white rounded-2xl p-3 shadow-lg border border-gray-200\""
assert_not_contains "class=\"flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-blue-600 bg-blue-50 font-medium text-sm whitespace-nowrap transition-colors cursor-pointer select-none\""
assert_not_contains "class=\"flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-100 font-medium text-sm whitespace-nowrap transition-colors cursor-pointer select-none\""
assert_not_contains "class=\"w-4 h-4 pointer-events-none flex-shrink-0\""
assert_not_contains "class=\"pointer-events-none\""
assert_not_contains "class=\"fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg bottom-nav md:hidden\""
assert_not_contains "class=\"grid grid-cols-3 h-16\""
assert_not_contains "class=\"flex flex-col items-center justify-center text-blue-600 transition-colors\""
assert_not_contains "class=\"flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 transition-colors\""
assert_not_contains "class=\"w-6 h-6 mb-1\""
assert_not_contains "class=\"text-xs font-bold\""
assert_not_contains "class=\"text-xs\""
assert_not_contains "class=\"p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30\""
assert_not_contains "class=\"p-1.5 text-gray-600 hover:text-gray-900\""
assert_not_contains "class=\"w-full mt-2 py-2.5 bg-gray-50 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 border border-gray-200 text-sm\""
assert_not_contains "class=\"w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-base\""
assert_not_contains "class=\"w-full mt-2 py-3 bg-white border-2 border-blue-200 text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all\""
assert_not_contains "class=\"w-full bg-white text-purple-600 font-bold py-2.5 rounded-xl hover:bg-purple-50 transition-colors shadow-lg text-sm\""
assert_not_contains "class=\"w-full mt-3 py-2.5 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 font-bold rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all flex items-center justify-center gap-1.5 border-2 border-purple-200 shadow-sm text-sm\""
assert_not_contains "class=\"w-full mt-2 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg text-sm\""
assert_not_contains "class=\"text-lg font-bold text-gray-900 mb-3\""
assert_not_contains "class=\"w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg\""
assert_not_contains "class=\"w-full py-3 bg-white text-purple-700 font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2\""
assert_not_contains "class=\"w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all\""
assert_not_contains "class=\"w-full p-2.5 border-2 border-gray-200 rounded-xl font-semibold text-gray-900 focus:border-blue-500 focus:outline-none text-sm\""
assert_not_contains "class=\"w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none\""
assert_not_contains "class=\"flex justify-center gap-2 mt-3\""
assert_not_contains "class=\"w-6 h-1.5 rounded-full bg-purple-400\""
assert_not_contains "class=\"w-6 h-1.5 rounded-full bg-gray-200\""
assert_not_contains "class=\"bg-gray-50 rounded-xl p-3 text-xs text-gray-600 border border-gray-200\""
