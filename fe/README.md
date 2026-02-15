# Frontend (`fe`)

## 디렉터리

- `public/`: 정적 사이트 배포 루트

## 로컬 실행

```bash
npm install
npm run build:tailwind
python3 -m http.server 8080 --directory fe/public
```

## 스타일 빌드

- Tailwind CSS는 런타임 CDN이 아니라 빌드 산출물(`/assets/css/tailwind-built.css`)을 사용합니다.
- 유틸리티 클래스 변경 후에는 `npm run build:tailwind`를 다시 실행하세요.

## 배포

- Cloudflare Pages 기준 `Root directory`를 `fe/public`으로 설정
- `main` 브랜치 머지 시 프론트엔드 배포
