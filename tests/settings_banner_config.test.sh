#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_SETTINGS="${ROOT_DIR}/fe/src/data/site-settings.json"
HOME_JS_FILE="${ROOT_DIR}/fe/public/js/home.js"
UPDATE_SCRIPT="${ROOT_DIR}/scripts/update-site-settings.js"
WORKFLOW_DOC="${ROOT_DIR}/docs/STATIC_BUILD_WORKFLOW.md"

assert_contains() {
  local pattern="$1"
  local file="$2"
  if ! grep -Fq -- "$pattern" "$file"; then
    echo "[FAIL] '${pattern}' not found in ${file}"
    exit 1
  fi
  echo "[PASS] '${pattern}' found in ${file}"
}

node -e "const fs=require('fs'); const x=JSON.parse(fs.readFileSync('${SRC_SETTINGS}','utf8')); const b=((x||{}).home||{}).banner||{}; if(!b||typeof b!=='object') process.exit(1); if(typeof b.mode!=='string') process.exit(2); if(typeof b.fallback!=='string') process.exit(3); if(!Number.isInteger(b.maxSecondary)) process.exit(4); if(typeof b.primaryServiceId!=='string') process.exit(5); if(!Array.isArray(b.secondaryServiceIds)) process.exit(6); if(b.maxSecondary<0||b.maxSecondary>2) process.exit(7); console.log('[PASS] site-settings banner schema-like keys validated');" \
  || { echo "[FAIL] invalid banner configuration in fe/src/data/site-settings.json"; exit 1; }

assert_contains "primaryServiceId" "$HOME_JS_FILE"
assert_contains "secondaryServiceIds" "$HOME_JS_FILE"
assert_contains "fallback" "$HOME_JS_FILE"
assert_contains "maxSecondary" "$HOME_JS_FILE"

assert_contains "--home-banner-primary-service" "$UPDATE_SCRIPT"
assert_contains "--home-banner-secondary-services" "$UPDATE_SCRIPT"
assert_contains "--home-banner-fallback" "$UPDATE_SCRIPT"
assert_contains "--home-banner-max-secondary" "$UPDATE_SCRIPT"

assert_contains "--home-banner-primary-service" "$WORKFLOW_DOC"
assert_contains "--home-banner-secondary-services" "$WORKFLOW_DOC"
assert_contains "--home-banner-fallback" "$WORKFLOW_DOC"
assert_contains "--home-banner-max-secondary" "$WORKFLOW_DOC"

echo "[PASS] settings banner config checks completed"
