# Home Netflix Dark Restore Design

## Goal

홈 랜딩을 현재의 밝은 카드형 UI에서 이전 넷플릭스 다크 UI로 정확히 복구한다.

## Scope

- 복구 대상은 홈 전용 파일 3개로 제한한다.
  - `fe/public/index.html`
  - `fe/public/assets/css/home.css`
  - `fe/public/js/netflix-ui.js`
- 기준 버전은 `33d8192 Refine home and category Netflix-style UI`다.
- 현재 다른 서비스 페이지, 어드민 패널, 리포트 변경은 건드리지 않는다.

## Approach

기준 커밋의 홈 3개 파일을 그대로 복구한다. 현재 홈은 Tailwind 기반 밝은 레이아웃과 인라인 스타일이 섞여 있지만, 이전 넷플릭스 다크 홈은 `netflix-shell.js`와 `home.css` 중심 구조가 분리되어 있어 정확 복구가 가장 안전하다.

## Verification

- 복구 후 `git diff`로 대상 파일 3개만 변경됐는지 확인한다.
- `fe/public/index.html`이 다크 넷플릭스 구조(`html.dark`, `nflx-page`, `nflx-hero`)로 돌아왔는지 확인한다.
- `fe/public/assets/css/home.css`와 `fe/public/js/netflix-ui.js`가 기준 커밋과 동일한지 확인한다.
