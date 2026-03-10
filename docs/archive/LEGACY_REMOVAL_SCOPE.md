# Legacy Removal Scope

목표: Phase B에서 삭제 가능한 레거시를 범위화하고, 정리 순서를 고정한다.

## In Scope (정리 대상)

1. `fe/src/pages/dunsmile/balance-game/content.html`
- 인라인 스타일 제거 및 공통 클래스 전환 (완료)

2. `fe/src/pages/dunsmile/tarot-reading/template.html`
- `<style>` 블록 제거, 공통 스타일 파일로 이관 (완료)

3. `fe/src/pages/dunsmile/daily-fortune/body.html`
- 캐러셀 반복 `<style>`/인라인 스크롤 스타일 제거, 공통 클래스 전환 (완료)
- 상단 네비 블록 공통 partial 전환 (예정)

4. `fe/src/pages/dunsmile/tarot-reading/body.html`
- 캐러셀 반복 `<style>`/인라인 스크롤 스타일 제거, 공통 클래스 전환 (완료)
- 상단 네비 블록 공통 partial 전환 (예정)

## Out of Scope (현재 유지)

1. `fe/public/dunsmile/js/service-shell.js`
- SEO 랜딩 본문에는 사용하지 않지만, 유틸리티 페이지 호환을 위해 유지

2. `fe/public/dunsmile/modules/*`
- 기존 테스트/호환 경로에서 참조 중이므로 일괄 삭제 금지

3. `fe/public/dunsmile/templates/*`
- 기존 템플릿 자산 보존. 신규 개발 기준은 `fe/src/pages` 사용

## Deletion Rule

1. 먼저 `fe/src` 기준으로 대체 구조를 적용한다.
2. `npm run build` + 테스트 통과 후 삭제한다.
3. 삭제 커밋은 기능 커밋과 분리한다.
