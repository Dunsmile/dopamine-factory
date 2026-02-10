# 도파민 공작소 (Dopamine Factory)

운세, 행운, 재미를 한 곳에서!

**Live**: https://dopamine-factory.pages.dev

## 서비스

| 서비스 | 경로 | 설명 |
|--------|------|------|
| 포털 | `/` | 도파민 공작소 메인 랜딩 |
| HOXY NUMBER | `/dunsmile/hoxy-number/` | 무료 로또 번호 생성기 |
| 부자가 될 상인가? | `/dunsmile/rich-face/` | AI 관상 분석 부자 확률 테스트 |
| 오늘의 운세 | `/dunsmile/daily-fortune/` | 별자리, 띠, 사주 종합 운세 |

## 프로젝트 구조

```
dopamine-factory/
├── index.html              (포털 랜딩 페이지)
├── robots.txt, sitemap.xml, ads.txt, _headers
├── dunsmile/                (Dunsmile 서비스)
│   ├── hoxy-number/         (HOXY NUMBER)
│   │   ├── index.html
│   │   └── guide/index.html
│   ├── rich-face/           (관상 테스트)
│   │   ├── index.html
│   │   └── guide/index.html
│   ├── daily-fortune/       (오늘의 운세)
│   │   ├── index.html
│   │   └── guide/index.html
│   ├── css/, js/            (공유 스타일/스크립트)
│   ├── about.html, privacy.html, terms.html
│   └── favicons, og-images
├── teammate/                (팀원 서비스 - 준비 중)
└── assets/                  (공용 리소스)
```

## 기술 스택

- HTML5, CSS3 (Tailwind CDN), Vanilla JavaScript
- Firebase Firestore (공유 카운터)
- Cloudflare Pages 호스팅

## 로컬 실행

```bash
python3 -m http.server 8080
# http://localhost:8080/ 에서 확인
```

## 라이센스

MIT License
