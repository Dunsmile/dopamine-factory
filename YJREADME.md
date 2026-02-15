# YJ 작업 계획서

## 작업 목적

도파민 공작소에 아래 3가지 기능을 추가한다.

- `2` 밸런스 게임
- `5` 이름 궁합
- `8` 결과 공유 카드 자동 생성

## Git Workflow

- 기준 브랜치: `codex/develop`
- 작업 브랜치: `codex/feature-dopamine-pack`
- 작업 순서:
  1. `develop` 생성
  2. `feature` 브랜치 생성
  3. 기능 구현
  4. 테스트 통과
  5. PR 준비

## 구현 범위

### 신규 페이지

- `fe/public/dunsmile/balance-game/index.html`
- `fe/public/dunsmile/name-compatibility/index.html`

### 공통 유틸

- `fe/public/dunsmile/js/share-card.js`

### 기존 기능 확장

- `HOXY NUMBER`: 결과 카드 이미지 저장
- `부자가 될 상인가?`: 결과 카드 이미지 저장
- `오늘의 운세`: 결과 카드 이미지 저장

### 내비게이션/노출

- 메인 포털(`fe/public/index.html`)에 신규 서비스 카드 추가
- 기존 서비스 메뉴(`hoxy-number`, `rich-face`, `daily-fortune`)에 신규 서비스 링크 추가
- `fe/public/sitemap.xml`에 신규 URL 추가

## 테스트 계획 (TDD)

1. RED: `tests/dopamine_features.test.sh` 작성 및 실패 확인
2. GREEN: 기능 구현 후 동일 테스트 통과
3. 스모크: 로컬 서버에서 주요 경로 응답 확인

## 완료 기준

- 신규 2개 서비스 페이지 접근 가능
- 기존 3개 서비스에서 결과 카드 이미지 저장 가능
- 포털 및 서비스 메뉴에서 신규 서비스로 진입 가능
- 테스트 스크립트 통과
