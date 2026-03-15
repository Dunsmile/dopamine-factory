# Frontend Collaboration Rules

목적: 개인 스타일 차이로 인한 유지보수 비용을 줄이고, 오류를 빠르게 찾을 수 있는 공통 기준을 만든다.

## 1) 기본 원칙

- 규칙은 "금지"보다 "유지보수성" 기준으로 판단한다.
- 한 PR에서는 한 가지 목적만 다룬다. (`style` / `structure` / `logic`)
- 동작 변경이 없는 리팩토링은 반드시 명시한다.

## 2) 스타일 규칙 (Style)

- 긴 Tailwind 유틸리티 체인은 HTML에 직접 나열하지 않는다.
- 의미 있는 시맨틱 클래스를 우선 사용한다.
  - 공통 접두사: `dp-*`, 홈 전용: `home-*`, 서비스 전용: `hoxy-*`, `fortune-*` 등
- Tailwind 유틸리티는 보조 용도만 허용한다.
  - 예: `hidden`, `mt-2`, `sr-only`
- 색상/간격/타이포는 가능하면 CSS 클래스에 모아 관리한다.

## 3) 구조 규칙 (Structure)

- 반복되는 HTML 블록은 템플릿/렌더 함수로 공통화한다.
- 파일 내 섹션은 역할 단위로 구분한다.
  - 헤더, 네비, 배너, 카드, 모달, 푸터
- DOM id는 상태 제어용으로만 사용하고, 스타일 목적으로 사용하지 않는다.

## 4) 로직 규칙 (Logic)

- 기능 단위로 파일을 나눈다.
  - 예: `search`, `sidebar`, `carousel`, `analytics`
- 함수는 한 가지 책임만 가진다.
- 네이밍은 동사+대상 형태를 우선한다.
  - `openSearch`, `renderServiceCards`, `bindBottomNav`
- 전역 상태는 최소화하고, 상태 객체/모듈로 관리한다.

## 5) 테스트 규칙

- 리팩토링 전/후로 스모크 테스트를 유지한다.
- 리팩토링 기본 묶음 검증은 아래 스크립트를 우선 사용한다.
  - `npm run check:service-data`
  - `npm run test:build`
  - `npm run test:home-ux`
  - `npm run test:service-template`
  - `npm run ops:doctor:strict`
  - `npm run check:font`
  - `npm run check:governance`
  - `bash tests/service_platform_scaling.test.sh`
  - `bash tests/static_generation.test.sh`
- 구조 검증: `tests/structure.test.sh`
- 프론트 기본 검증: `tests/frontend_optimization.test.sh`
- 리팩토링 범위별 테스트를 추가한다.
  - 예: `tests/home_style_semantic.test.sh`

## 6) PR 규칙

- PR 설명에 아래 4가지를 반드시 적는다.
1. 변경 범위 (`style` / `structure` / `logic`)
2. 사용자 체감 변화 여부 (있음/없음)
3. 테스트 실행 결과
4. 다음 PR에서 다룰 항목
- 광고 변경이 포함되면 `docs/ADSENSE_POLICY_GUARDRAILS.md` 검토 결과를 반드시 첨부한다.
- 신규 토큰/컴포넌트 추가 시 `docs/DESIGN_CHANGE_LOG.md`에 기록한다.
- 광고 리스크 롤백 수행 시 `docs/ADSENSE_INCIDENT_ROLLBACK_LOG.md`에 기록한다.

## 7) 점진적 리팩토링 순서

1. Style: 클래스 정리, 인라인 유틸 축소
2. Structure: 반복 마크업 분리
3. Logic: 이벤트/상태/렌더 로직 분리

각 단계는 별도 PR로 진행한다.

## 8) 서비스 생성 운영

- 신규 서비스 생성 전: `npm run create:service -- --help`
- 리허설(무변경 검증): `npm run create:service -- <service-id> --dry-run ...`
- 실제 생성 후: `npm run build:pages`, `npm run test:build`, `npm run check:service-data`
- 홈/스킨/배너 운영은 `/teammate/` 생성 명령 또는 `npm run settings:update -- ...`만 사용한다.

## 9) 에이전트 스킬 디렉터리 규칙

- 저장소 내 스킬 원본은 `skills/` 하나만 유지한다.
- 툴별 숨김 디렉터리(`.claude`, `.continue`, `.qwen` 등)는 저장소 루트에 두지 않는다.
- 에이전트/툴별 로컬 설정이 필요하면 각 개발자의 홈 디렉터리 또는 툴 전용 설정 경로에서 관리한다.
- 새 스킬을 추가하거나 수정할 때는 `skills/`만 변경한다.
- 저장소 안에 `skills/` 외 추가 스킬 복제본을 만들지 않는다.
- 로컬 툴 디렉터리에 `skills`가 다시 생기면 `npm run skills:normalize`로 `skills/` 링크 구조를 복구한다.

## 10) 로컬 산출물 정리 규칙

- 아래 경로는 로컬 작업 산출물로 취급하고 버전에 포함하지 않는다.
  - `screenshots/`
  - `.npm-cache/`
  - `.worktrees/`
  - `build_error.log`
- 검증 중 생성된 산출물이 필요 없으면 커밋 전에 정리한다.

## 11) 루트 디렉터리 기준

- 저장소 루트의 정식 디렉터리는 `be/`, `fe/`, `scripts/`, `tests/`, `docs/`, `skills/`, `.github/` 기준으로 유지한다.
- 운영 리포트는 루트 `reports/`가 아니라 `docs/reports/`에 둔다.
- 새 최상위 디렉터리를 추가해야 하면 목적과 유지 주체를 문서화한 뒤 추가한다.
