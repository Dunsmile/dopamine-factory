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
  if ! rg -n -- "${pattern}" "${ROOT_DIR}/${path}" >/dev/null; then
    echo "[FAIL] '${pattern}' not found in ${path}"
    exit 1
  fi
  echo "[PASS] '${pattern}' found in ${path}"
}

assert_json_key() {
  local path="$1"
  local key="$2"
  node -e "const fs=require('fs');const x=JSON.parse(fs.readFileSync('${ROOT_DIR}/${path}','utf8'));if(!(Object.prototype.hasOwnProperty.call(x,'${key}')))process.exit(1);" \
    || { echo "[FAIL] key '${key}' not found in ${path}"; exit 1; }
  echo "[PASS] key '${key}' found in ${path}"
}

assert_file "docs/SCALING_EXECUTION_CHECKLIST.md"
assert_file "fe/public/dunsmile/services.manifest.json"
assert_file "fe/public/dunsmile/services.schema.json"
assert_file "fe/src/data/services.manifest.json"
assert_file "fe/src/data/services.schema.json"
assert_file "fe/src/data/related-services.json"
assert_file "fe/public/dunsmile/js/service-shell.js"
assert_file "fe/public/dunsmile/js/service-ui.js"
assert_file "fe/public/dunsmile/js/module-layout.js"
assert_file "fe/public/dunsmile/service-shell/index.html"
assert_file "scripts/create-service.js"
assert_file "scripts/build-static-pages.js"
assert_file "scripts/build-watch.js"
assert_file "fe/src/ssg/static-pages.json"
assert_file "fe/src/ssg/partials/header.html"
assert_file "fe/src/ssg/partials/sidebar.html"
assert_file "fe/src/ssg/partials/settings-modal.html"
assert_file "fe/src/ssg/partials/related-card.html"
assert_file "fe/src/ssg/partials/related-carousel.html"
assert_file "fe/public/dunsmile/templates/fortune-layout.html"
assert_file "fe/public/dunsmile/templates/tarot-layout.html"
assert_file "fe/public/dunsmile/templates/face-layout.html"
assert_file "fe/src/pages/dunsmile/daily-fortune/template.html"
assert_file "fe/src/pages/dunsmile/daily-fortune/body.html"
assert_file "fe/src/pages/dunsmile/rich-face/template.html"
assert_file "fe/src/pages/dunsmile/rich-face/body.html"
assert_file "fe/src/pages/dunsmile/balance-game/template.html"
assert_file "fe/src/pages/dunsmile/balance-game/content.html"
assert_file "fe/src/pages/dunsmile/balance-game/actions.html"
assert_file "fe/src/pages/dunsmile/name-compatibility/template.html"
assert_file "fe/src/pages/dunsmile/name-compatibility/content.html"
assert_file "fe/src/pages/dunsmile/name-compatibility/actions.html"
assert_file "fe/src/pages/dunsmile/hoxy-number/template.html"
assert_file "fe/src/pages/dunsmile/hoxy-number/body.html"
assert_file "fe/src/pages/dunsmile/tarot-reading/template.html"
assert_file "fe/src/pages/dunsmile/tarot-reading/body.html"
assert_file "fe/src/pages/dunsmile/market-sentiment/template.html"
assert_file "fe/src/pages/dunsmile/market-sentiment/body.html"

assert_contains "package.json" "\"create:service\""
assert_contains "package.json" "\"build:pages\""
assert_contains "package.json" "\"build:pages:inc\""
assert_contains "package.json" "\"build:watch\""
assert_contains "package.json" "\"test:build\""
assert_contains "package.json" "\"dev\""
assert_contains "fe/public/js/home.data.js" "services.manifest.json"
assert_contains "fe/public/js/home.data.js" "loadServices"
assert_contains "fe/public/js/home.js" "await loadServices"
assert_contains "fe/public/dunsmile/js/service-shell.js" "MANIFEST_URL"
assert_contains "fe/public/dunsmile/css/style.css" "module-templates.css"
assert_contains "scripts/create-service.js" "\\{\\{RELATED_CAROUSEL\\}\\}"

node -e "const { renderRelatedCarousel } = require('${ROOT_DIR}/fe/src/ssg/render-shell'); const html = renderRelatedCarousel('auto-generated-demo'); if (!html || !html.includes('data-related-carousel-service=\"auto-generated-demo\"')) process.exit(1);" \
  || { echo "[FAIL] renderRelatedCarousel fallback generation failed"; exit 1; }
echo "[PASS] renderRelatedCarousel fallback generation works"

assert_json_key "fe/public/dunsmile/services.manifest.json" "services"
assert_json_key "fe/public/dunsmile/services.schema.json" "properties"

assert_file "fe/public/dunsmile/modules/balance-game/index.js"
assert_contains "fe/public/dunsmile/balance-game/index.html" "밸런스 게임"
assert_contains "fe/public/dunsmile/balance-game/index.html" "/dunsmile/js/balance-game.js"
assert_contains "fe/public/dunsmile/services.manifest.json" "\"id\": \"balance-game\""
assert_contains "fe/public/dunsmile/services.manifest.json" "\"type\": \"legacy-page\""
assert_contains "fe/public/dunsmile/services.manifest.json" "/dunsmile/balance-game/index.html"
assert_file "fe/public/dunsmile/modules/name-compatibility/index.js"
assert_contains "fe/public/dunsmile/name-compatibility/index.html" "이름 궁합"
assert_contains "fe/public/dunsmile/name-compatibility/index.html" "/dunsmile/js/name-compatibility.js"
assert_contains "fe/public/dunsmile/services.manifest.json" "\"id\": \"name-compatibility\""
assert_contains "fe/public/dunsmile/services.manifest.json" "/dunsmile/name-compatibility/index.html"
assert_file "fe/public/dunsmile/modules/daily-fortune/index.js"
assert_contains "fe/public/dunsmile/daily-fortune/index.html" "오늘의 운세 풀이"
assert_contains "fe/public/dunsmile/daily-fortune/index.html" "/dunsmile/js/daily-fortune.js"
assert_contains "fe/public/dunsmile/services.manifest.json" "\"id\": \"daily-fortune\""
assert_contains "fe/public/dunsmile/services.manifest.json" "/dunsmile/daily-fortune/index.html"
assert_file "fe/public/dunsmile/modules/rich-face/index.js"
assert_contains "fe/public/dunsmile/rich-face/index.html" "AI 관상 테스트"
assert_contains "fe/public/dunsmile/rich-face/index.html" "/dunsmile/js/face-test.js"
assert_contains "fe/public/dunsmile/services.manifest.json" "\"id\": \"rich-face\""
assert_contains "fe/public/dunsmile/services.manifest.json" "/dunsmile/rich-face/index.html"
assert_contains "fe/public/dunsmile/services.manifest.json" "\"id\": \"hoxy-number\""
assert_contains "fe/public/dunsmile/services.manifest.json" "/dunsmile/hoxy-number/index.html"
assert_contains "fe/public/dunsmile/services.manifest.json" "\"id\": \"tarot-reading\""
assert_contains "fe/public/dunsmile/services.manifest.json" "/dunsmile/tarot-reading/index.html"
assert_contains "fe/public/dunsmile/services.manifest.json" "\"id\": \"market-sentiment\""
assert_contains "fe/public/dunsmile/services.manifest.json" "/dunsmile/market-sentiment/index.html"
assert_contains "fe/public/dunsmile/services.manifest.json" "\"id\": \"wealth-dna-test\""
assert_contains "fe/public/dunsmile/services.manifest.json" "/dunsmile/wealth-dna-test/index.html"

(cd "${ROOT_DIR}" && npm run create:service -- demo-service --dry-run >/dev/null)
echo "[PASS] create-service dry-run works"
(cd "${ROOT_DIR}" && npm run build:pages >/dev/null)
echo "[PASS] build:pages works"
(cd "${ROOT_DIR}" && npm run test:build >/dev/null)
echo "[PASS] test:build works"
