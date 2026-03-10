# Git Workflow 전략

## 브랜치 역할

- `main`: 운영 배포 브랜치 (production)
- `develop`: 통합 개발 브랜치 (staging)
- `feature/*`: 기능 개발 브랜치
- `release/*`: 릴리즈 준비 브랜치
- `hotfix/*`: 운영 긴급 수정 브랜치

## 브랜치 네이밍 규칙

- 프론트엔드: `feature/fe-<task>`
- 백엔드: `feature/be-<task>`
- 버그픽스: `fix/fe-<task>`, `fix/be-<task>`
- 긴급수정: `hotfix/<task>`

## 작업 흐름

1. `develop`에서 작업 브랜치 생성
2. 기능 개발 후 PR 생성 (`target: develop`)
3. CI 통과 + 리뷰 완료 후 머지
4. 배포 시점에 `release/*` 브랜치 생성 후 안정화
5. `release/*`를 `main`에 머지해 운영 배포
6. `main` 머지 내용을 `develop`으로 역병합

## 핫픽스 흐름

1. `main`에서 `hotfix/*` 생성
2. 수정 후 `main`으로 PR/머지
3. 동일 커밋을 `develop`에도 반영

## 배포 전략

- FE 배포 단위: `fe/public`
- BE 배포 단위: `be`
- 현재 CI는 단일 파이프라인으로 운영 (fe/be 구분 없이 전체 실행)
- 향후 개선: `fe/**` / `be/**` 경로 기반 파이프라인 분리 예정
  - FE 배포 단위: `fe/public`
  - BE 배포 단위: `be`

## 필수 보호 규칙 (권장)

- `main`, `develop` 직접 push 금지
- PR 필수 + 최소 1명 리뷰
- CI 필수 통과 후 머지
- Squash merge 사용 (히스토리 단순화)
