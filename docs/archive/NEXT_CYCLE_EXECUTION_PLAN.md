# Next Cycle Execution Plan (Home + Template + Ops)

목적: 기존 Phase A~D 완료 이후, 홈 고도화/서비스 템플릿 재사용/운영 안정화를 다음 사이클로 관리한다.

운영 원칙:
- 토큰 우선: 신규 색/간격/타이포 하드코딩 금지, 기존 토큰 재사용
- 템플릿 우선: 서비스별 독립 스타일 증식 금지, 쉘/모듈 템플릿 우선
- 데이터 우선: UI 분기/콘텐츠는 설정(JSON)으로 관리

## Track 1. Platform Guard (구조 안정성)

- [x] `render-shell.js` 문자열 블록을 partial 기반으로 단계 분리 (화살표 SVG partial + shell UI JSON 외부화)
- [x] 캐러셀/사이드바 데이터 소스 완전 외부화 점검 (`fe/src/data/related-services.json`, `fe/src/data/shell-ui.json` + `check:service-data` 검증)
- [x] 빌드 산출물 필수 태그 검증 강화 (`scripts/test-build.js`: canonical/OG/Twitter/Adsense/placeholder 검증)
- [x] 증분 빌드 실사용 점검 (`npm run build:pages:inc` + full/inc 산출물 해시 diff 0건)

완료 기준:
- [x] full build + incremental build 결과 diff 0건
- [x] 누락 메타/광고 슬롯 회귀 0건 (`test:build` + 메타/Adsense 가드)

## Track 2. Home UX Upgrade (레퍼런스 흡수형)

- [x] 홈 IA를 `home.referencePreset` + 배너 설정으로만 제어 가능하게 고정
- [x] 관리자 패널(`/teammate/`)에서 홈 배너/스킨/셸 스킨 전환 완결
- [x] 홈 Hero/큐레이션/랩존 섹션 모바일 overflow 회귀 점검 (`npm run test:home-ux`)
- [x] 홈 검색/카테고리/탭 탐색 UX 점검 (모바일/데스크탑, `npm run test:home-ux`)

완료 기준:
- [x] 홈 주요 동선(Home -> Service -> Test Start) 3-step 클릭 경로 유지 (`test:home-ux` 동선/CTA 가드)
- [x] 모바일 가로 스크롤 깨짐 0건 (`test:home-ux` 가드 기준)

## Track 3. Service Template Standard (7개 서비스 고정)

- [x] `daily-fortune`, `tarot-reading`, `rich-face` 기준 레이아웃을 공통 프리셋으로 고정 (`test:service-template` 시그니처 가드)
- [x] `balance-game`, `name-compatibility` 토큰/간격/캐러셀 위치 재검증 (`test:service-template`)
- [x] 서비스 시작 화면은 집중 흐름 우선(추천 캐러셀은 결과 화면 전용, `test:service-template`)
- [x] 서비스별 ad-slot 임시 UI 문구 제거/비활성 정책 재검증 (`test:service-template` 광고 placeholder 가드)

완료 기준:
- [x] 서비스 7개 공통 프레임 정책(legacy=`dp-service-frame`, shell=`svc-shell`) 일관성 확보 (`test:service-template`)
- [x] 결과 화면 캐러셀 노출 정책 100% 일치 (`test:service-template`)

## Track 4. Ops Automation (팀 협업 운영)

- [x] 주간 리포트 루틴 고정: `npm run ops:sync`
- [x] 운영 정합성 루틴 고정: `npm run ops:doctor:strict`
- [x] 신규 서비스 생성 루틴 검증: `npm run create:service -- --help` + 샘플 생성/삭제 리허설(dry-run)
- [x] 문서 동기화: `docs/STATIC_BUILD_WORKFLOW.md`, `docs/FRONTEND_COLLAB_RULES.md`

완료 기준:
- [x] 체크리스트/리포트 간 pending 불일치 0건 (`ops:sync` + `ops:doctor:strict`)
- [x] 팀원이 `/teammate/` + 명령어만으로 동일 결과 재현 가능 (`settings:update`/`teammate` 운영 경로 문서화)

## Immediate Execution Checklist (이번 턴 실행)

- [x] `npm run report:checklist`
- [x] `npm run test:build`
- [x] `npm run ops:doctor`
- [x] 결과를 `reports/` 기준으로 기록/공유
