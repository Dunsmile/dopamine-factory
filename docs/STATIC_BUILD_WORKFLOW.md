# Static Build Workflow

## Goal
- Keep service metadata centralized in `fe/src/data/services.manifest.json`
- Render content-heavy pages to full HTML at build time for SEO/AdSense stability
- Stop relying on runtime `service-shell.js` for these pages

## Source of truth
- `fe/src/data/services.manifest.json`
- `fe/src/data/services.schema.json`
- `fe/src/data/related-services.json`
- `fe/src/data/shell-ui.json`
- `fe/src/data/site-settings.json`
- `fe/src/pages/dunsmile/daily-fortune/template.html`
- `fe/src/pages/dunsmile/daily-fortune/body.html`
- `fe/src/pages/dunsmile/rich-face/template.html`
- `fe/src/pages/dunsmile/rich-face/body.html`
- `fe/src/pages/dunsmile/balance-game/{template,content,actions}.html`
- `fe/src/pages/dunsmile/name-compatibility/{template,content,actions}.html`
- `fe/src/pages/dunsmile/wealth-dna-test/{template,content,actions}.html`
- `fe/src/pages/dunsmile/hoxy-number/template.html`
- `fe/src/pages/dunsmile/hoxy-number/body.html`
- `fe/src/pages/dunsmile/tarot-reading/template.html`
- `fe/src/pages/dunsmile/tarot-reading/body.html`
- `fe/src/pages/dunsmile/market-sentiment/template.html`
- `fe/src/pages/dunsmile/market-sentiment/body.html`
- `fe/src/ssg/static-pages.json`

## Build commands
- `npm run check:service-data`
- `npm run build:tailwind`
- `npm run build:pages`
- `npm run build:pages:inc`
- `npm run test:build`
- `npm run test:home-ux`
- `npm run test:service-template`
- `npm run build`
- `npm run build:watch`
- `npm run create:service -- --help`
- `npm run create:service -- <id> --dry-run --name <name> --full-name <title> --category experimental --emoji ✨ --desc <desc>`
- `npm run settings:update -- --home-skin A|B`
- `npm run settings:update -- --home-reference testmoa|poomang`
- `npm run settings:update -- --home-banner-mode auto|manual`
- `npm run settings:update -- --home-banner-primary-service <id> --home-banner-secondary-services <id1,id2>`
- `npm run settings:update -- --home-banner-fallback auto|strict --home-banner-max-secondary 0|1|2`
- `npm run settings:update -- --home-banner1-service <id> --home-banner2-service <id> (legacy alias)`
- `npm run settings:update -- --service-shell-default-skin A|B`
- `npm run settings:update -- --all-service-skin A|B`
- `npm run settings:update -- --service <service-id> --service-skin A|B`
- `npm run settings:update -- --service <service-id> --service-hero /dunsmile/assets/<file>`

## Output
- `fe/public/dunsmile/services.manifest.json`
- `fe/public/dunsmile/services.schema.json`
- `fe/public/dunsmile/site-settings.json`
- `fe/public/dunsmile/daily-fortune/index.html`
- `fe/public/dunsmile/rich-face/index.html`
- `fe/public/dunsmile/balance-game/index.html`
- `fe/public/dunsmile/name-compatibility/index.html`
- `fe/public/dunsmile/hoxy-number/index.html`
- `fe/public/dunsmile/tarot-reading/index.html`
- `fe/public/dunsmile/market-sentiment/index.html`
- `fe/public/dunsmile/wealth-dna-test/index.html`

## Rule
- New content-first service pages must be added to `fe/src/ssg/static-pages.json` and generated via `build:pages`.
- Runtime shell (`service-shell.js`) is allowed for interactive utility pages, not for primary SEO/AdSense landing content.
- Service manifest/schema must be edited in `fe/src/data` only. `fe/public/dunsmile/*.json` are generated files.
- `check:service-data`는 manifest/ssg 외에 `related-services.json`, `shell-ui.json` 링크 정합성까지 검증한다.
- 홈/서비스 스킨, 배너/이미지 교체는 `fe/src/data/site-settings.json` 또는 `npm run settings:update`로 관리한다.
- `fe/public` HTML는 generated 파일이며 수동 수정하지 않는다.
