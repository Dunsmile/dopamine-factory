# FE Code Standards

## Mandatory Authoring Rules

1. 스타일은 반드시 토큰화하고 재사용한다.
2. UI는 컴포넌트 단위로 분리하고 재사용한다.
3. 반복 마크업은 템플릿으로 분리하고 재사용한다.
4. `index.html`에 `<style>`을 작성하지 않는다. CSS 파일로 분리한다.
5. 서비스 추가 시 Tailwind 클래스를 무한 증식시키지 않는다.
6. 신규 서비스는 기존 Tailwind/시맨틱 클래스를 우선 재사용한다.
7. 기존 시스템으로 표현 불가한 신규 UI 요소는 먼저 합의 후 토큰/컴포넌트를 추가한다.

## Maintainability Rules

1. 구현이 200줄 이상일 때, 기존 컴포넌트/토큰/템플릿 재사용으로 50줄 수준 축소가 가능하면 즉시 리팩토링한다.
2. 단일 기능 변경에서 500줄을 초과하면 작성 직후 구조 분석 후 리팩토링을 반드시 수행한다.
3. 리팩토링 기준은 `중복 제거`, `책임 분리`, `재사용성`, `테스트 가능성`이다.

## Design System Baseline

### Typography

- 기본 폰트: `Pretendard`
- 허용 크기 토큰: `10, 11, 12, 13, 14, 15, 16, 17, 18, 20`

### Spacing / Radius (4-base scale)

- 패딩/마진은 4배수 토큰만 사용: `4, 8, 12, 16, 20, 24, 28, 32`
- 라운드 토큰: `4, 8, 12, 16, 20`

### Color / Components

- 색상은 하드코딩보다 컬러 토큰 우선
- 공통 컴포넌트(버튼, 카드, 입력, 모달)는 토큰 기반 클래스 조합으로 유지

## File Layout Policy

- 소스 데이터: `fe/src/data/services.manifest.json`, `fe/src/data/services.schema.json`
- 캐러셀 데이터: `fe/src/data/related-services.json` (로직 파일에 하드코딩 금지)
- 운영 스킨/배너 설정: `fe/src/data/site-settings.json`
- 서비스 소스: `fe/src/pages/dunsmile/<service-id>/template.html`, `content.html`, `actions.html`
- SSG 설정: `fe/src/ssg/static-pages.json`
- SSG partial: `fe/src/ssg/partials/*.html`
- 토큰: `fe/public/dunsmile/css/tokens.css`
- 공통 컴포넌트 인덱스: `fe/public/dunsmile/css/components.css`
- 공통 컴포넌트 베이스: `fe/public/dunsmile/css/components-core.css`
- HOXY 서비스 컴포넌트: `fe/public/dunsmile/css/components-hoxy.css`
- 엔트리 스타일: `fe/public/dunsmile/css/style.css` (`@import`만 유지)
- 홈 스타일: `fe/public/assets/css/home.css`
- 배포 산출물: `fe/public/**` (직접 수정 금지)

## Mobile Layout Rule

1. 서비스 페이지 래퍼는 `main-container dp-shell-no-edge`를 사용해 외곽 중복 패딩을 제거한다.
2. 내부 프레임은 `dp-service-frame`을 사용한다.
3. 각 단계 컨테이너는 `step dp-service-step`을 사용한다.
4. 서비스 본문에서 `step p-4` 직접 사용을 금지한다.
5. `{{RELATED_CAROUSEL}}`는 시작/입력 단계에 두지 않고 결과 단계(결과 카드/결과 액션)에서만 노출한다.

## Service Hero Preset Rule

1. 셸 기반 서비스의 제목 영역은 `svc-hero svc-hero-preset-core`를 공통 프리셋으로 사용한다.
2. `fe/src/ssg/static-pages.json`의 shell 설정에서 `heroEyebrow`, `heroTitle`, `heroSummary`를 채운다.
3. 서비스별 신규 색상 클래스를 추가하지 말고 기존 `svc-theme-*`와 토큰만 재사용한다.

## New Service Template Strategy

1. 신규 서비스는 `npm run create:service -- <service-id>`로 생성한다.
2. 스킨 지정이 필요하면 `npm run create:service -- <service-id> --skin A|B`를 사용한다.
3. 생성 후 `fe/src/pages/dunsmile/<service-id>/content.html`에서 서비스 UI를 구현한다.
4. 메타/OG/접근성/공통 CSS/공통 JS 경로는 생성된 `template.html` 기준으로 유지한다.
5. 신규 manifest 항목(`updatedAt`, `estimatedDuration`, `questionCount`, `featuredRank`, `trendingScore`)을 유지한다.
6. 신규 UI가 기존 토큰/컴포넌트로 표현 가능한지 먼저 검토한다.
7. 불가한 경우 토큰/컴포넌트 확장을 제안하고 승인 후 반영한다.
8. 변경 반영은 `npm run check:service-data` 후 `npm run build` 또는 `npm run build:pages`로 수행한다.
