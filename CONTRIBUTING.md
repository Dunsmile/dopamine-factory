# Contributing

이 저장소는 Git Flow 기반으로 운영합니다.

## 브랜치 규칙

- `main`: 운영 배포
- `develop`: 통합 개발
- `feature/*`: 기능 개발
- `fix/*`: 일반 버그 수정
- `hotfix/*`: 운영 긴급 수정

브랜치 네이밍:

- 프론트엔드: `feature/fe-<task>`, `fix/fe-<task>`
- 백엔드: `feature/be-<task>`, `fix/be-<task>`

## 기본 개발 흐름

1. `develop` 최신 동기화
2. `develop`에서 작업 브랜치 생성
3. 기능 개발 + 로컬 테스트
4. PR 생성 (`target: develop`)
5. CI 통과 + 리뷰 후 머지
6. 배포 시 `release/*` -> `main` 머지
7. `main` 변경을 `develop`으로 역반영

## 예시 명령어

```bash
git checkout develop
git pull origin develop
git checkout -b feature/fe-home-redesign
```

작업 후:

```bash
bash tests/run_hoxy_refactor_checks.sh
# 또는
npm run test:hoxy
```

세부 점검만 필요한 경우:

```bash
bash tests/run_hoxy_style_checks.sh
bash tests/run_hoxy_structure_checks.sh
bash tests/run_hoxy_logic_checks.sh
bash tests/structure.test.sh
bash tests/dopamine_features.test.sh
bash tests/frontend_optimization.test.sh
```

백엔드 변경 시:

```bash
bash tests/market_sentiment.test.sh
```

## 보호 규칙

- `main`, `develop` 직접 push 금지
- PR + 리뷰(최소 1명) 필수
- CI 통과 후 머지
- Squash merge 권장

## 경로/배포 규칙

- FE 배포 루트: `fe/public`
- BE 배포 루트: `be`
- FE 변경: `fe/**`
- BE 변경: `be/**`

## 프론트 협업 규칙

- 상세 기준: `docs/FRONTEND_COLLAB_RULES.md`
- 리팩토링은 `Style -> Structure -> Logic` 순서로 진행
- 각 단계는 별도 PR로 분리

## 스타일 규칙 (FE, 요약)

- 가능하면 시맨틱 클래스 중심 작성 (`dp-*`, 서비스 접두사)
- 공통 스타일은 `fe/public/dunsmile/css/style.css`에 반영
- Tailwind 변경 시 `npm run build:tailwind` 실행
