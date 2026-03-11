# 100-Service Scaling Execution Checklist

이 문서는 현재 SSG 구조에서 100개 서비스 확장을 위한 실행 기준이다.

자동 집계 리포트:
- `npm run report:checklist`
- 출력: `docs/reports/scaling-checklist-status.json`, `docs/reports/scaling-checklist-status.md`

## Baseline (Completed)

- [x] src-first 구조 고정 (`fe/src` 작성, `fe/public` 생성물)
- [x] `scripts/build-static-pages.js` 기반 정적 생성
- [x] `scripts/create-service.js` 기반 신규 서비스 스캐폴드
- [x] 7개 운영 서비스 정적 생성 전환
- [x] manifest/schema 소스 단일화 (`fe/src/data`)

## Phase A (이번 주) - 디자인 시스템/안전 가드

- [x] `render-shell` 광고 슬롯 변수화 (`top`, `bottom`)
- [x] 광고 슬롯 기본 UI/스타일 컴포넌트 추가
- [x] 애드센스 정책 가드 문서화 (`docs/ADSENSE_POLICY_GUARDRAILS.md`)
- [x] Pretendard 폰트 경로/적용 상태 최종 점검
- [x] 핵심 CTA 애니메이션만 제한 적용 (공유/다음)

완료 기준(수치):
- [x] 모바일 LCP < 2.5s (`docs/reports/kpi-baseline.md`)
- [x] CLS < 0.1 (`docs/reports/kpi-baseline.md`)
- [x] 콘솔 오류 0건 (블로킹 기준, `docs/reports/kpi-baseline.md`)

## Phase B (다음 주) - 파일럿 이관/레거시 정리

- [x] `daily-fortune`, `tarot-reading`, `balance-game` 템플릿 표준화 1차 점검
- [x] 삭제 대상 레거시 목록 확정 (`docs/LEGACY_REMOVAL_SCOPE.md`)
- [x] `balance-game` 인라인 스타일 제거
- [x] `tarot-reading` 템플릿 인라인 스타일 제거
- [x] `daily-fortune`/`tarot-reading` body 반복 캐러셀 인라인 스타일 제거
- [x] 공통 셸 분석 이벤트 점검 (`impression`, `click`, `start`, `complete`, `share`)
- [x] 레거시 인라인 스타일 재유입 방지 테스트 추가 (`tests/legacy_cleanup_guard.test.sh`)
- [x] Phase B 퍼널 KPI 자동 판정 리포트 도입 (`npm run report:phaseb-kpi`)

완료 기준(수치):
- [x] 카드 진입 CTR +10%
- [x] 시작률 +10%
- [x] 상위 3개 서비스 완료율 +5%

## Phase C (3주차) - 분기점 판단

- [x] KPI 자동 측정 스크립트 도입 (`npm run measure:kpi`)
- [x] 운영 리포트 자동 생성 도입 (`npm run report:weekly`)
- [x] Astro Go/No-Go 판정 스크립트 도입 (`npm run check:astro-gate`)
- [x] 운영 지표 리뷰 (오류율, 속도, 공유율)
- [x] Astro 제한 파일럿 Go/No-Go 실제 판정
- [x] Go 시 신규 1개 서비스만 별도 경로 파일럿

Go 조건:
- [x] 개발 생산성 +20% 이상
- [x] 성능 지표 동등 이상
- [x] SEO/광고 안정성 저하 없음
- [x] 운영 복잡도 증가 없음

## Phase D (4주차+) - 대량 생산 체제

- [x] `create-service` 고도화 유지 (SEO/FAQ/analytics 기본 포함)
- [x] `npm run check:service-data`를 CI 품질 게이트로 유지
- [x] 주간 배포 페이스 점검 자동화 (`npm run report:cadence`)
- [x] 주당 1~2개 신규 서비스 배포 루틴 정착

완료 기준(수치):
- [x] 신규 서비스 게시 리드타임 15분 이내
- [x] 생성/배포 실패율 0%
- [x] 월 8개 이상 안정 배포

## Governance

- [x] PR 템플릿 체크 항목 준수 (토큰 재사용, 신규 토큰 승인 여부)
- [x] 신규 토큰/컴포넌트 추가 시 근거 기록
- [x] 광고 정책 리스크 발견 시 즉시 롤백

## Home V3 Cleanup (2026-02-27)

- [x] 홈 상단 Nav를 dunsmile 공통 스타일(`components.css`, `dp-header-home`)과 정합
- [x] 모바일 탭(`mobile-tab-bar`)을 공통 메뉴 톤(`dp-menu-item`)과 정합
- [x] 상단 히어로 텍스트/CTA 제거 후 배너만 유지
- [x] 홈 과밀 섹션 정리(삭제 완료: Noblesse, Artnow)
- [x] 홈 미사용 JS 제거(`renderNoblesseSeries`, `renderArtnowSection`)
- [x] 홈 미사용 CSS 제거(Artnow/Noblesse 블록, 잔여 미디어 규칙)
- [x] Footer 플레이스홀더 링크(`#`) 제거 및 실제 경로 연결
- [x] 홈 검색 인풋을 피드 렌더 필터와 연결
- [x] 홈 UX 가드 테스트를 현행 구조 기준으로 갱신
