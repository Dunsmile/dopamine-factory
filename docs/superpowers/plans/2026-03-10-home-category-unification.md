# Home Category Unification Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 홈과 카테고리 탭의 텍스트, 클래스, 레일 렌더링, 프레임 구조를 공통화해 유지보수성과 협업 효율을 높인다.

**Architecture:** 홈과 카테고리 페이지는 동일한 넷플릭스형 UI 프레임을 사용하고, 데이터만 다르게 주입한다. 공통 메타와 포스터 레일 렌더링은 공유 JS 모듈로 분리하고, 카테고리 페이지는 최소한의 HTML 껍데기만 유지한다.

**Tech Stack:** Static HTML, Vanilla JS, Tailwind utility classes, shared CSS, manifest-driven data

---

## Chunk 1: Shared Metadata And Renderer

### Task 1: 공통 카테고리 메타 이동

**Files:**
- Modify: `fe/public/js/home.data.js`
- Modify: `fe/public/js/netflix-ui.js`
- Modify: `fe/public/js/category-ui.js`
- Test: `tests/home_simplified.test.sh`
- Test: `tests/category_pages.test.sh`

- [ ] `fe/public/js/home.data.js`에 카테고리 라벨/설명/정렬/tone 메타를 추가한다.
- [ ] `window.HomeData`가 `CATEGORY_META`, `CATEGORY_ORDER`를 노출하도록 수정한다.
- [ ] `fe/public/js/netflix-ui.js`의 하드코딩 카테고리 메타를 제거하고 `HomeData`를 사용하도록 바꾼다.
- [ ] `fe/public/js/category-ui.js`의 하드코딩 카테고리 메타를 제거하고 `HomeData`를 사용하도록 바꾼다.
- [ ] `bash tests/home_simplified.test.sh`를 실행한다.
- [ ] `bash tests/category_pages.test.sh`를 실행한다.

### Task 2: 공통 포스터 레일 렌더러 추출

**Files:**
- Create: `fe/public/js/netflix-shell.js`
- Modify: `fe/public/js/netflix-ui.js`
- Modify: `fe/public/js/category-ui.js`
- Modify: `fe/public/index.html`
- Modify: `fe/public/category/fortune/index.html`
- Modify: `fe/public/category/fun/index.html`
- Modify: `fe/public/category/luck/index.html`
- Modify: `fe/public/category/finance/index.html`
- Modify: `fe/public/category/experimental/index.html`
- Test: `tests/home_simplified.test.sh`
- Test: `tests/category_pages.test.sh`

- [ ] `fe/public/js/netflix-shell.js`를 만들어 아래 함수를 옮긴다.
- [ ] 공통 함수: nav scroll 상태 적용, 포스터 카드 HTML 생성, hover 확장 로직, 레일 제목 행 렌더, 레일 전체 렌더.
- [ ] 홈 전용 로직은 `featured service 선정`과 `홈 히어로 카피 결정`만 남긴다.
- [ ] 카테고리 전용 로직은 `카테고리 필터`와 `카테고리 히어로 텍스트 결정`만 남긴다.
- [ ] 홈과 카테고리 HTML에 `/js/netflix-shell.js`를 먼저 로드한다.
- [ ] `bash tests/home_simplified.test.sh`를 실행한다.
- [ ] `bash tests/category_pages.test.sh`를 실행한다.

## Chunk 2: HTML Simplification

### Task 3: 카테고리 페이지 HTML 최소화

**Files:**
- Modify: `fe/public/category/fortune/index.html`
- Modify: `fe/public/category/fun/index.html`
- Modify: `fe/public/category/luck/index.html`
- Modify: `fe/public/category/finance/index.html`
- Modify: `fe/public/category/experimental/index.html`
- Modify: `tests/category_pages.test.sh`

- [ ] 카테고리 HTML 다섯 개를 동일한 구조로 정리한다.
- [ ] 페이지별 차이는 `title`, `description`, `body[data-category]`만 남긴다.
- [ ] 상단 내비/히어로/풋터 마크업은 홈과 같은 클래스와 텍스트 어휘를 유지한다.
- [ ] 카테고리 페이지에 홈과 다른 전용 텍스트가 필요하면 JS에서 주입한다.
- [ ] `bash tests/category_pages.test.sh`를 실행한다.

### Task 4: 공통 풋터/내비 링크 일관화

**Files:**
- Modify: `fe/public/index.html`
- Modify: `fe/public/category/fortune/index.html`
- Modify: `fe/public/category/fun/index.html`
- Modify: `fe/public/category/luck/index.html`
- Modify: `fe/public/category/finance/index.html`
- Modify: `fe/public/category/experimental/index.html`
- Test: `tests/home_simplified.test.sh`
- Test: `tests/category_pages.test.sh`

- [ ] 홈과 카테고리의 상단 탭 텍스트, 순서, URL을 완전히 동일하게 맞춘다.
- [ ] 풋터 `서비스` 컬럼 링크도 홈과 카테고리에서 동일한 순서와 텍스트로 맞춘다.
- [ ] `bash tests/home_simplified.test.sh`를 실행한다.
- [ ] `bash tests/category_pages.test.sh`를 실행한다.

## Chunk 3: CSS Responsibilities

### Task 5: 공통 CSS와 카테고리 오버라이드 경계 정리

**Files:**
- Modify: `fe/public/assets/css/home.css`
- Modify: `fe/public/assets/css/category.css`
- Test: `tests/home_simplified.test.sh`
- Test: `tests/category_pages.test.sh`

- [ ] `home.css`에는 홈/카테고리 공통 넷플릭스 프레임 규칙만 둔다.
- [ ] `category.css`에는 카테고리 전용 스타일만 남긴다.
- [ ] 카테고리에서 홈과 완전히 동일한 클래스는 새 이름을 만들지 않고 그대로 재사용한다.
- [ ] `bash tests/home_simplified.test.sh`를 실행한다.
- [ ] `bash tests/category_pages.test.sh`를 실행한다.

## Chunk 4: Dead Code And Ownership Cleanup

### Task 6: 미사용 홈 코드 점검

**Files:**
- Inspect: `fe/public/js/home.js`
- Inspect: `fe/public/js/store-ui.js`
- Inspect: `tests/home_ux_guard.test.sh`
- Inspect: `tests/service_platform_scaling.test.sh`
- Inspect: `tests/settings_banner_config.test.sh`

- [ ] `fe/public/js/home.js`가 현재 런타임에서 실제로 필요한지 확인한다.
- [ ] `fe/public/js/home.js`가 미사용이면 참조 테스트를 먼저 갱신한다.
- [ ] `fe/public/js/home.js`가 일부 테스트에서만 쓰이면, 테스트 목적을 분리할지 유지할지 결정한다.
- [ ] `store-ui.js`와 현재 홈 구조의 관계를 확인한다.

### Task 7: 미사용 홈 코드 정리

**Files:**
- Modify or Delete: `fe/public/js/home.js`
- Modify: `tests/home_ux_guard.test.sh`
- Modify: `tests/service_platform_scaling.test.sh`
- Modify: `tests/settings_banner_config.test.sh`
- Modify: `tests/code_authoring_rules.test.sh`

- [ ] 미사용으로 확인된 홈 JS를 제거하거나 legacy로 명시한다.
- [ ] 테스트가 현재 넷플릭스 홈 구조를 기준으로 동작하도록 정리한다.
- [ ] 홈 구현과 무관한 오래된 기대값은 삭제한다.

## Chunk 5: Verification

### Task 8: 전체 검증

**Files:**
- Verify: `tests/home_simplified.test.sh`
- Verify: `tests/category_pages.test.sh`
- Verify: `tests/code_authoring_rules.test.sh`

- [ ] `bash tests/home_simplified.test.sh` 실행
- [ ] `bash tests/category_pages.test.sh` 실행
- [ ] `bash tests/code_authoring_rules.test.sh` 실행
- [ ] 홈과 무관한 기존 실패가 있으면 해당 실패를 별도 항목으로 기록한다.
