# Backend (`be`)

백엔드 API/배치/인프라 코드를 이 디렉터리에 둡니다.

## 권장 구조

```text
be/
├── apps/         # 실행 가능한 API/Worker
├── packages/     # 공통 라이브러리
└── infra/        # 배포/인프라 코드
```

## 현재 앱

- `apps/market-sentiment-worker`: Cloudflare Worker 기반 시장 감성 수집/분석 API

## 운영 원칙

- 프론트엔드와 릴리즈 주기를 분리
- `be/**` 변경은 백엔드 파이프라인에서 독립 검증/배포
