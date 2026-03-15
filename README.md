# 도파민 공작소 (Dopamine Factory)

운세, 행운, 재미를 한 곳에서!

**Live**: https://dopamine-factory.pages.dev

문서 인덱스: `docs/README.md`

## 구조 원칙

- 서비스별 최상위 폴더가 아니라 `be/`(백엔드), `fe/`(프론트엔드)로 분리
- Git workflow 기반으로 브랜치/릴리즈/핫픽스 전략 운영
- 배포 대상도 `fe`, `be` 단위로 독립 관리

## 프로젝트 구조

```text
dopamin/
├── .github/                 (CI / workflow)
├── be/                      (백엔드 코드/인프라)
├── fe/
│   ├── README.md
│   └── public/              (Cloudflare Pages 배포 루트)
│       ├── index.html       (포털 랜딩 페이지)
│       ├── robots.txt, sitemap.xml, ads.txt, _headers
│       ├── dunsmile/        (현재 운영 서비스)
│       ├── teammate/        (팀원 서비스 - 준비 중)
│       └── assets/          (공용 리소스)
├── docs/
│   ├── GIT_WORKFLOW.md
│   └── reports/             (운영 리포트 / 체크리스트 산출물)
├── scripts/                 (빌드 / 운영 / 자동화 스크립트)
├── skills/                  (저장소 내 공용 에이전트 스킬)
├── tests/
│   └── structure.test.sh
└── package.json             (공용 스크립트 진입점)
```

## 서비스 경로 (운영 URL)

| 서비스 | 경로 | 설명 |
|--------|------|------|
| 포털 | `/` | 도파민 공작소 메인 랜딩 |
| HOXY NUMBER | `/dunsmile/hoxy-number/` | 무료 로또 번호 생성기 |
| 부자가 될 상인가? | `/dunsmile/rich-face/` | AI 관상 분석 부자 확률 테스트 |
| 오늘의 운세 | `/dunsmile/daily-fortune/` | 별자리, 띠, 사주 종합 운세 |
| 타로 카드 | `/dunsmile/tarot-reading/` | 오늘의 타로 운세 |
| 밸런스 게임 | `/dunsmile/balance-game/` | 실시간 선택 비율 밸런스 게임 |
| 이름 궁합 | `/dunsmile/name-compatibility/` | 이름 기반 케미 지수 분석 |
| 시장 감성 | `/dunsmile/market-sentiment/` | 실시간 국내 시장 감성 분석 |
| 부자 DNA 테스트 | `/dunsmile/wealth-dna-test/` | 3분 자산 성향 테스트 |
| 도파민 랩 | `/dunsmile/about/` | 신규 실험형 서비스 프리뷰 라운지 |

## 로컬 실행

```bash
python3 -m http.server 8080 --directory fe/public
# http://localhost:8080/ 에서 확인
```

## 로컬 스킬 정리

```bash
npm run skills:check
npm run skills:normalize
```

- 저장소 내 스킬 원본은 `skills/` 하나만 사용한다.
- 툴별 로컬 숨김 디렉터리의 `skills`는 `skills/`를 가리키는 링크로 정리한다.

## Git Workflow

브랜치 전략과 배포 규칙은 `docs/GIT_WORKFLOW.md`를 참고하세요.

## 라이센스

MIT License
