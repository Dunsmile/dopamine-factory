# 도파민 공작소 서비스 구조 종합 분석 보고서

> 작성일: 2026-02-24
> 분석 범위: 전체 프로젝트 구조, 코드 패턴, 유지보수성, 확장성, 협업, AdSense 대응
> 목적: 서비스 확장을 앞두고 현재 구조의 강점/약점/위험요소를 식별하고 개선 방향을 제시

---

## 목차

1. [전체 구조 요약](#1-전체-구조-요약)
2. [현재 구조의 강점](#2-현재-구조의-강점)
3. [문제점 및 기술 부채](#3-문제점-및-기술-부채)
4. [서비스 확장 시 우려사항](#4-서비스-확장-시-우려사항)
5. [AdSense 통과 관점 분석](#5-adsense-통과-관점-분석)
6. [유지보수 관점 분석](#6-유지보수-관점-분석)
7. [코드 재활용 관점 분석](#7-코드-재활용-관점-분석)
8. [폴더 및 파일 관리 분석](#8-폴더-및-파일-관리-분석)
9. [협업 관점 분석](#9-협업-관점-분석)
10. [우선순위별 개선 권고사항](#10-우선순위별-개선-권고사항)

---

## 1. 전체 구조 요약

```
hoxy-number/
├── fe/public/              # 정적 사이트 (Cloudflare Pages 배포)
│   ├── index.html          # 홈 포털
│   ├── js/                 # 홈 전용 공통 스크립트
│   ├── assets/             # 전역 정적 리소스
│   └── dunsmile/           # 서비스 허브
│       ├── js/             # 서비스 쉘 공통 스크립트
│       ├── css/            # 공통 스타일시트
│       ├── modules/        # 서비스 모듈 구현체
│       ├── [service-id]/   # 각 서비스 디렉토리 (9개)
│       ├── services.manifest.json
│       └── site-settings.json
├── be/                     # 백엔드 (Cloudflare Workers)
│   └── apps/market-sentiment-worker/
├── scripts/                # 빌드/운영 자동화 (40+개)
├── tests/                  # 자동화 테스트 스크립트
└── docs/                   # 문서 (워크플로우, 가이드 등)
```

**현재 서비스 수**: 9개 (hoxy-number, rich-face, daily-fortune, balance-game, name-compatibility, market-sentiment, tarot-reading, dopamine-lab, wealth-dna-test)

**기술 스택**:
- Frontend: Vanilla JS + Tailwind CSS + 정적 HTML (프레임워크 없음)
- Backend: TypeScript + Cloudflare Workers
- DB: Firestore (REST API)
- 배포: Cloudflare Pages / Workers
- CI: GitHub Actions

---

## 2. 현재 구조의 강점

### 2-1. 배포 인프라가 탄탄함
- Cloudflare Pages + Workers 조합은 **무료 티어로 고트래픽 감당 가능**
- CDN 엣지 캐싱이 기본 적용되어 전 세계 응답속도 우수
- 별도 서버 운영 없이 확장 가능한 서버리스 구조

### 2-2. services.manifest.json 기반 서비스 레지스트리
- 서비스 메타데이터(이름, 라우트, 노출 순위, 트렌딩 점수 등)가 단일 파일로 관리됨
- 새 서비스 추가 시 홈 UI가 자동으로 반영되는 구조
- 좋은 방향이며 확장 초기에 적합한 설계

### 2-3. 문서화 수준이 높음
- GIT_WORKFLOW, CONTRIBUTING, FE_CODE_STANDARDS, ADSENSE_POLICY_GUARDRAILS 등 문서가 잘 갖춰져 있음
- 협업 규칙이 명문화되어 있어 팀 온보딩에 유리

### 2-4. 자동화 스크립트 생태계
- `create:service` 스크립트로 서비스 스캐폴딩 자동화
- KPI 측정, 주간 리포트 생성 등 운영 자동화 구비
- 40개 이상의 스크립트로 반복 작업 최소화

### 2-5. 백엔드 코드 품질
- TypeScript strict 모드, Vitest 단위 테스트 구비
- 파이프라인 설계가 명확하고 모듈화 잘 됨
- 크롤러별 책임 분리, 타입 정의 분리

---

## 3. 문제점 및 기술 부채

### 🔴 심각 (즉시 개선 권고)

#### 3-1. 프론트엔드 전역 window 오염 패턴
```javascript
// 현재 패턴 - 모든 모듈이 window에 함수를 직접 노출
window.HomeData = { loadServices, loadSiteSettings };
window.initRichFaceModule = function() { ... };
```

**문제**: 서비스가 늘어날수록 전역 네임스페이스 충돌 위험이 기하급수적으로 증가.
현재 9개 서비스 수준에서는 관리되지만, 20~30개 서비스가 되면 디버깅이 극도로 어려워짐.

#### 3-2. 모듈과 서비스 디렉토리 이중 구조
```
dunsmile/
├── modules/rich-face/index.js   ← 실제 구현
└── rich-face/index.html         ← HTML 진입점
```

**문제**: 동일 서비스의 구현체가 두 위치에 분산됨. 신규 개발자가 어느 쪽을 수정해야 하는지 즉시 파악하기 어려움.
일부 서비스는 modules/에 있고 일부는 없는 **불일치 상태** 존재.

#### 3-3. CSS 아키텍처의 파편화
```
dunsmile/css/
├── tokens.css
├── components-core.css
├── components-hoxy.css
├── module-templates.css
└── service-shell.css
```

**문제**: CSS 파일이 5개로 분리되어 있으나 각 파일의 로딩 순서와 의존관계가 불명확함.
서비스별 인라인 스타일이 일부 섞여 있고(FE_CODE_STANDARDS 위반), Tailwind 클래스와 커스텀 CSS의 경계가 불분명함.

#### 3-4. 서비스간 구현 수준 불균형
- `hoxy-number`는 로컬스토리지 상태관리, 광고 쿼터 시스템, 페이지네이션까지 완성도 높음
- `wealth-dna-test`는 beta 상태로 미완성
- 서비스별로 코드 패턴이 통일되지 않아 유지보수 기준이 서비스마다 다름

---

### 🟡 중간 (단기 내 개선 권고)

#### 3-5. scripts/ 디렉토리 비대화 (40개 이상)
```
scripts/
├── build-static-pages.js
├── build-watch.js
├── build-service-nav.js
├── build-seo-pages.js
├── build-sitemap.js
├── *-ops-*.js  (운영 관련 다수)
... (총 40개 이상)
```

**문제**: 스크립트 수가 너무 많아 어떤 스크립트가 주요 빌드 파이프라인에 속하고 어떤 것이 일회성 유틸인지 구분이 어려움.
실제로 사용되지 않는 스크립트가 섞여 있을 가능성 높음.

#### 3-6. 백엔드 단일 Worker 구조
```
be/apps/
└── market-sentiment-worker/  ← 현재 서비스는 1개뿐
```

**문제**: 현재는 market-sentiment 서비스 1개만 백엔드를 사용하지만, rich-face(AI 분석) 같은 서비스는 Firebase 직접 연동 중. 백엔드 확장 전략이 명확하지 않음.
서비스가 늘어날 때 개별 Worker를 만들 것인지, 하나의 Worker에 라우트를 추가할 것인지 정책이 없음.

#### 3-7. 로컬스토리지 키 관리 정책 부재
```javascript
// 서비스마다 다른 prefix 사용 우려
localStorage.setItem('hoxyNumber_saved', ...)
localStorage.setItem('richFace_result', ...)
```

**문제**: 서비스가 늘어날수록 키 충돌 및 스토리지 과용 위험. 중앙화된 스토리지 관리 전략 필요.

---

### 🟢 낮음 (장기적으로 개선)

#### 3-8. 테스트 커버리지 불균형
- 백엔드(BE)는 Vitest 단위 테스트 구비
- 프론트엔드(FE)는 셸 스크립트 기반 구조 검증 테스트만 존재
- 실제 UI 동작(사용자 플로우, 상호작용)에 대한 테스트 없음

#### 3-9. 이미지 최적화 전략 부재
- OG 이미지, 서비스 썸네일이 최적화 없이 배포
- Cloudflare Images 또는 WebP 변환 파이프라인 없음

#### 3-10. dopamine-factory/ 이중 클론 존재
```
/Users/steve/Downloads/files/
├── hoxy-number/    ← 실제 작업 디렉토리
└── dopamine-factory/   ← 이중 클론 (권고되지 않음)
```

**문제**: 로컬 환경에 동일 프로젝트의 두 클론이 존재. 실수로 잘못된 디렉토리에서 작업할 위험.

---

## 4. 서비스 확장 시 우려사항

### 4-1. services.manifest.json 스케일 한계

**현재**: 9개 서비스를 단일 JSON으로 관리
**예상 시점**: 서비스 20개 초과 시 단일 JSON 로딩이 UX 저하 요인이 될 수 있음

```json
// 현재 구조 - 홈에서 전체 manifest를 한 번에 로드
fetch('/dunsmile/services.manifest.json')
```

**위험**: 모든 서비스 메타데이터를 매 페이지 로드마다 fetch함. 서비스가 50개가 되면 JSON 크기와 파싱 비용이 증가.

**권고**: 현재는 유지하되, 30개 이상이 되면 카테고리별 분할 또는 Cloudflare KV 기반 API 전환 검토.

---

### 4-2. 서비스 추가 시 디렉토리 폭발

```
dunsmile/
├── hoxy-number/
├── rich-face/
├── daily-fortune/
├── balance-game/
├── name-compatibility/
├── market-sentiment/
├── tarot-reading/
├── dopamine-lab/
├── wealth-dna-test/
├── [새 서비스 1]/
├── [새 서비스 2]/
...  ← 서비스 30개가 되면 dunsmile/ 에 30개 폴더
```

**위험**: 서비스가 많아질수록 dunsmile/ 디렉토리가 비대해져 탐색성이 낮아짐.

**권고**: 서비스를 카테고리별 서브디렉토리로 분리 고려
```
dunsmile/
├── fortune/          (daily-fortune, tarot-reading, name-compatibility)
├── fun/              (balance-game, dopamine-lab, wealth-dna-test)
├── utility/          (hoxy-number, market-sentiment)
└── ai/               (rich-face)
```

---

### 4-3. 서비스 쉘 단일 진입점의 부담

```javascript
// service-shell.js - 모든 서비스의 로딩을 단일 파일이 처리
// 서비스가 늘어날수록 이 파일의 복잡도 증가
```

**위험**: service-shell.js의 버그 하나가 **전체 서비스**에 영향을 미침. 서비스별 독립 진입점 없이 단일 로더에 의존하는 구조는 중앙 실패 지점(Single Point of Failure).

---

### 4-4. 백엔드 서비스별 Worker 분리 전략 부재

서비스가 늘어나면서 각 서비스가 백엔드 연산을 필요로 할 가능성이 높음:
- rich-face → AI 분석 API 필요
- name-compatibility → 서버 사이드 계산 가능
- tarot-reading → 결과 저장/공유 기능 추가 시 DB 필요

**현재**: 이런 경우 Firebase SDK를 프론트엔드에서 직접 호출하는 패턴 사용
**위험**: Firebase 보안 규칙 관리가 복잡해지고, API 키가 클라이언트에 노출됨

**권고**: 백엔드 API Gateway Worker를 설계하고 모든 외부 API 호출을 Worker를 통해 처리

---

### 4-5. SEO 및 OG 메타 관리 부담

현재 서비스별 HTML 파일에 OG 메타 태그가 하드코딩된 경우 존재.
서비스 30개가 되면 OG 이미지 30개, meta description 30개를 개별 관리해야 함.

**권고**: `build-static-pages.js`를 통한 메타 태그 자동 생성이 이미 일부 있으나, 이를 더 강화하여 manifest에서 자동 생성되도록 통합.

---

## 5. AdSense 통과 관점 분석

### 5-1. 유리한 요소들

| 요소 | 상태 | 평가 |
|------|------|------|
| HTTPS 기본 적용 | Cloudflare 기본 제공 | ✅ 통과 |
| Privacy Policy 페이지 | `/dunsmile/privacy/` 존재 | ✅ 통과 |
| Terms of Service 페이지 | `/dunsmile/terms/` 존재 | ✅ 통과 |
| About 페이지 | `/dunsmile/about/` 존재 | ✅ 통과 |
| 콘텐츠 다양성 | 9개 독립 서비스 | ✅ 유리 |
| 페이지 로딩 속도 | Cloudflare CDN 기본 적용 | ✅ 유리 |
| ADSENSE_POLICY_GUARDRAILS.md | 별도 가이드라인 존재 | ✅ 의식 있음 |

### 5-2. 우려되는 요소들

#### 콘텐츠 독창성 및 깊이 부족 위험
```
현재 서비스 대부분이 "결과를 보여주는" 단방향 경험
→ 사용자 생성 콘텐츠(UGC) 없음
→ 페이지당 텍스트 콘텐츠가 적음
→ AdSense는 "박한 콘텐츠(thin content)" 판정에 엄격
```

**권고**: 각 서비스에 설명 섹션, FAQ, 결과 해석 가이드 등 텍스트 콘텐츠 보강.

#### 광고 밀도 관리
```javascript
// hoxy-number에 이미 광고 쿼터 시스템 존재
// 12시간 내 3회 제한 등 구현됨
```

**위험**: 광고 쿼터 시스템이 서비스마다 일관되게 적용되지 않으면 일부 페이지에서 광고 밀도 위반 가능.

**권고**: 광고 배치 기준을 `services.manifest.json`에 서비스별로 명시하고, 공통 광고 컴포넌트로 일괄 관리.

#### 복수 서비스 간 콘텐츠 중복
fortune 관련 서비스들(daily-fortune, tarot-reading, name-compatibility)이 유사한 결과 패턴을 가질 경우 AdSense가 중복 콘텐츠로 판정할 가능성.

**권고**: 각 서비스의 결과 표현, 설명 방식, 인터랙션 패턴을 차별화. 동일한 서비스 쉘 컴포넌트를 사용하더라도 콘텐츠 레이어는 독립적으로 구성.

#### 메타 태그 품질
AdSense 심사 시 페이지별 title, description의 고유성과 품질을 검토.

**권고**: 서비스별 meta description이 일반적인 문구를 사용하지 않도록 검토. build-static-pages.js에서 생성하는 메타 태그의 품질 기준 강화.

---

## 6. 유지보수 관점 분석

### 6-1. 현재 유지보수 구조

```
서비스 수정 시 관여 파일:
1. dunsmile/[service-id]/index.html  (진입점)
2. dunsmile/modules/[service]/index.js  (로직)
3. dunsmile/css/  (스타일)
4. dunsmile/services.manifest.json  (메타데이터)
5. scripts/build-static-pages.js  (빌드 파이프라인)
```

### 6-2. 핵심 위험: 암묵적 의존 관계

```javascript
// service-shell.js가 다음을 암묵적으로 기대:
// - services.manifest.json의 특정 스키마
// - modules/ 디렉토리의 존재
// - 특정 HTML 요소 ID (#service-root 등)

// 이 계약이 문서화되지 않으면 신규 서비스 개발 시 반복 실수 발생
```

**권고**: 서비스 쉘과 모듈 간의 인터페이스 계약(Contract)을 명시적으로 문서화.
`templates/` 디렉토리의 JSON 스키마를 더 상세하게 정의하고, 위반 시 CI에서 검출되도록 구성.

### 6-3. 레거시 서비스 관리 부재

서비스가 계속 추가되면 오래된 서비스의 코드 패턴이 낡아지는 문제 발생.
현재 `LEGACY_REMOVAL_SCOPE.md`가 존재하나 실행 기준이 명확하지 않음.

**권고**: 서비스별 "코드 나이(code age)" 및 "패턴 버전"을 manifest에 기록하고, 분기별 레거시 리뷰 프로세스 수립.

### 6-4. 핫픽스 위험

모든 서비스가 동일한 service-shell.js, service-ui.js를 공유하므로
공통 파일 변경 시 전체 서비스에 영향. 현재 공통 파일 변경에 대한 특별한 리뷰 프로세스가 보이지 않음.

**권고**: 공통 파일(service-shell.js, service-ui.js, tokens.css 등)을 "코어 레이어"로 지정하고,
이 파일들의 PR은 반드시 전체 서비스 시나리오 체크리스트를 통과하도록 규칙화.

---

## 7. 코드 재활용 관점 분석

### 7-1. 현재 재활용 구조 (잘 된 부분)

```
공통 재활용 레이어:
├── service-shell.js      (서비스 로딩/라우팅)
├── service-ui.js         (공통 UI 컴포넌트)
├── module-layout.js      (레이아웃 시스템)
├── tokens.css            (디자인 토큰)
└── components-core.css   (공통 컴포넌트)
```

레이어 분리 방향은 올바름. 신규 서비스는 이 공통 레이어를 상속받아 빠르게 개발 가능.

### 7-2. 서비스 간 로직 중복 (개선 필요)

각 서비스 모듈이 유사한 패턴을 **각자 재구현**하고 있음:

```javascript
// 각 서비스마다 반복되는 패턴들:

// (1) 결과 공유 기능
function shareResult(text) { navigator.share({...}) }

// (2) 진행 애니메이션
function animateProgress(el, target) { ... }

// (3) 결과 화면 전환
function showResult(data) { ... }

// (4) 에러 처리 토스트
function showError(msg) { ... }

// (5) Firebase 동적 로드
function loadFirebaseSDK() { ... }
```

**권고**: 위 패턴들을 `service-ui.js` 또는 별도 `service-utils.js`로 추출하고
모든 서비스 모듈이 이를 의존하도록 통일.

### 7-3. HTML 템플릿 재활용 수준 낮음

현재 각 서비스의 index.html이 각각 독립적으로 작성됨.
head 태그(meta, link, script)가 서비스마다 수동으로 관리.

**권고**: `build-static-pages.js`를 통한 템플릿 기반 HTML 생성을 강화:
```
templates/
├── service-head.html    (공통 head - meta, analytics, AdSense)
├── service-body.html    (공통 body 구조)
└── service-footer.html  (공통 footer)
```

이렇게 하면 Analytics 코드나 AdSense 코드 업데이트 시 단일 파일만 수정하면 전체 서비스에 적용됨.

---

## 8. 폴더 및 파일 관리 분석

### 8-1. 현재 구조 평가

```
양호한 부분:
✅ fe/와 be/의 명확한 분리
✅ docs/와 scripts/의 분리
✅ 서비스별 독립 디렉토리

개선 필요:
⚠️ scripts/ 40개 이상으로 비대
⚠️ modules/와 [service]/ 이중 구조
⚠️ reports/ 자동 생성 파일이 git에 추적될 위험
⚠️ tests/ 셸 스크립트와 JS 테스트 혼재
```

### 8-2. 권고 디렉토리 구조 (중장기)

```
hoxy-number/
├── fe/
│   └── public/
│       ├── index.html
│       ├── assets/
│       │   ├── css/
│       │   ├── fonts/
│       │   └── images/
│       ├── js/               (홈 전용 스크립트)
│       └── dunsmile/
│           ├── _core/        (service-shell, service-ui 등 핵심 공통)
│           ├── _shared/      (서비스간 공유 CSS, 유틸)
│           ├── fortune/      (카테고리별 서브폴더)
│           │   ├── daily-fortune/
│           │   ├── tarot-reading/
│           │   └── name-compatibility/
│           ├── fun/
│           │   ├── balance-game/
│           │   └── wealth-dna-test/
│           ├── utility/
│           │   ├── hoxy-number/
│           │   └── market-sentiment/
│           └── ai/
│               └── rich-face/
│
├── be/
│   └── apps/
│       ├── market-sentiment-worker/
│       └── [future-workers]/    (서비스별 Worker 분리 대비)
│
├── scripts/
│   ├── build/               (빌드 관련 스크립트만)
│   ├── ops/                 (운영 관련 스크립트)
│   └── dev/                 (개발 유틸 스크립트)
│
├── tests/
│   ├── unit/                (단위 테스트)
│   └── integration/         (통합 테스트)
│
└── docs/
    ├── analysis/            (분석 문서)
    ├── guides/              (개발 가이드)
    └── specs/               (서비스 스펙)
```

### 8-3. .gitignore 점검

`reports/` 디렉토리에 자동 생성된 JSON 파일들이 있음.
이런 파일이 git에 추적되면 매 실행마다 불필요한 커밋이 발생.

**권고**:
```gitignore
# .gitignore에 추가 권고
reports/*.json       # 자동 생성 리포트
reports/!/.gitkeep   # 디렉토리는 유지
```

---

## 9. 협업 관점 분석

### 9-1. 현재 협업 구조 강점

- Git Flow 기반 브랜치 전략 명문화
- CONTRIBUTING.md, FRONTEND_COLLAB_RULES.md 등 규칙 문서화
- GitHub Actions CI 파이프라인 구비
- 서비스 스캐폴딩 자동화(`create:service`)

### 9-2. 협업 구조 약점

#### 서비스 소유권(Ownership) 정의 없음
현재 문서에 각 서비스를 누가 담당하는지 명시가 없음.
서비스가 늘어나면 "이 서비스는 누가 리뷰하나?" 문제 발생.

**권고**: `CODEOWNERS` 파일 생성:
```
# .github/CODEOWNERS
/fe/public/dunsmile/rich-face/     @member-a
/fe/public/dunsmile/market-sentiment/  @member-b
/fe/public/dunsmile/_core/         @tech-lead  # 코어는 테크리드 필수 리뷰
```

#### 서비스 개발 체크리스트 미흡
신규 서비스 개발 완료 기준이 불명확함.
"AdSense 준수", "OG 이미지 등록", "manifest 등록", "모바일 테스트" 등의 정의된 완료 기준 필요.

**권고**: Pull Request 템플릿에 체크리스트 추가:
```markdown
## 신규 서비스 체크리스트
- [ ] services.manifest.json 등록
- [ ] OG 이미지 추가 (1200x630)
- [ ] Privacy/Terms 링크 페이지 내 존재
- [ ] 모바일 반응형 확인
- [ ] AdSense 광고 배치 가이드라인 준수
- [ ] 공통 서비스 쉘 사용 확인
- [ ] 로딩/에러 상태 처리 확인
```

#### 배포 후 검증 프로세스 없음
현재 배포 후 자동화된 smoke test나 모니터링 알림이 없음.

**권고**: Cloudflare Pages의 Preview URL을 활용한 배포 전 확인 단계 추가.
GitHub Actions에 배포 후 주요 페이지 200 응답 확인 스텝 추가.

---

## 10. 우선순위별 개선 권고사항

### 🔴 즉시 (현 서비스 규모에서 이미 문제)

| 번호 | 개선 항목 | 예상 작업량 |
|------|-----------|------------|
| 1 | `service-utils.js` 생성: 공유 로직 추출 (공유, 애니메이션, 에러 처리) | 중 (1-2일) |
| 2 | modules/와 서비스 디렉토리 이중 구조 통일 | 중 (1-2일) |
| 3 | `.github/CODEOWNERS` 생성 | 소 (2시간) |
| 4 | PR 템플릿 서비스 체크리스트 추가 | 소 (2시간) |
| 5 | `reports/` .gitignore 처리 | 소 (30분) |

### 🟡 단기 (서비스 15개 도달 전)

| 번호 | 개선 항목 | 예상 작업량 |
|------|-----------|------------|
| 6 | HTML 템플릿 통합 (head, footer 공통화) | 중 (2-3일) |
| 7 | scripts/ 디렉토리 정리 및 분류 | 소 (반나절) |
| 8 | 백엔드 API Gateway Worker 설계 (클라이언트의 Firebase 직접 호출 제거) | 대 (1주) |
| 9 | AdSense 광고 공통 컴포넌트 통합 관리 | 중 (1-2일) |
| 10 | 각 서비스 텍스트 콘텐츠 보강 (AdSense thin content 방지) | 중 (서비스당 반나절) |

### 🟢 중장기 (서비스 25개 도달 전)

| 번호 | 개선 항목 | 예상 작업량 |
|------|-----------|------------|
| 11 | dunsmile/ 카테고리별 서브폴더 구조로 리팩토링 | 대 (3-5일) |
| 12 | services.manifest.json 분할 또는 API 전환 | 대 (1주) |
| 13 | 프론트엔드 E2E 테스트 도입 (Playwright) | 대 (1주+) |
| 14 | 이미지 최적화 파이프라인 구축 | 중 (2-3일) |
| 15 | 서비스 쉘 단일 실패 지점 해소 (서비스별 독립 진입점 지원) | 대 (1주+) |

---

## 종합 평가

```
현재 구조 성숙도 평가:

배포 인프라        ████████░░  8/10  (Cloudflare 기반 탁월)
문서화             ███████░░░  7/10  (문서는 많으나 최신성 확인 필요)
코드 재활용        █████░░░░░  5/10  (방향은 맞으나 실행 불완전)
확장성             █████░░░░░  5/10  (9개 서비스에는 충분, 30개는 불안)
유지보수성         █████░░░░░  5/10  (공통 파일 변경 위험 존재)
협업 구조          ██████░░░░  6/10  (규칙 있으나 실행 도구 부족)
AdSense 대응       ██████░░░░  6/10  (구조는 OK, 콘텐츠 보강 필요)
테스트 커버리지    ███░░░░░░░  3/10  (BE는 양호, FE는 부족)
```

**현 시점 평가**: 9개 서비스 규모에서는 잘 작동하는 구조.
그러나 서비스를 빠르게 추가할수록 기술 부채가 선형이 아닌 **지수적으로 증가**할 위험.

**가장 중요한 한 가지**: 서비스를 추가하기 전에 **service-utils.js 공통 레이어 강화**와 **modules/ 이중 구조 통일**을 먼저 완료할 것을 강력 권고.
이 두 가지가 선행되지 않으면 서비스 15개 이후부터 유지보수 비용이 급격히 상승함.
