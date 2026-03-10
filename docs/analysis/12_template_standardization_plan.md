# 서비스 템플릿 표준화 계획 보고서

> 작성일: 2026-02-24
> 목적: 현재 혼재된 T1/T2 구조를 진단하고, T1(운세/관상/타로)을 공식 표준 템플릿으로 확정 및 이관 방안 제시
> 범위: fe/public/dunsmile/ 전체 서비스

---

## 목차

1. [현재 서비스 분류 현황](#1-현재-서비스-분류-현황)
2. [T1 vs T2 구조 정밀 비교](#2-t1-vs-t2-구조-정밀-비교)
3. [왜 T2가 표준이 되면 안 되는가](#3-왜-t2가-표준이-되면-안-되는가)
4. [T1을 공식 표준으로 확정하는 이유](#4-t1을-공식-표준으로-확정하는-이유)
5. [표준 T1 스펙 정의 (The Contract)](#5-표준-t1-스펙-정의-the-contract)
6. [T2 서비스 이관 방안](#6-t2-서비스-이관-방안)
7. [신규 서비스 개발 가이드](#7-신규-서비스-개발-가이드)
8. [진행 방향 로드맵](#8-진행-방향-로드맵)
9. [활용 스킬 및 참고 자료](#9-활용-스킬-및-참고-자료)

---

## 1. 현재 서비스 분류 현황

### 서비스 타입 맵

```
┌─────────────────────────────────────────────────────────────┐
│                     독립 구조 (건드리지 않음)                  │
├─────────────────────────────────────────────────────────────┤
│  hoxy-number       자체 쿼터/저장/광고 시스템, 고유 UX       │
│  market-sentiment  BE Worker + Firestore, 실시간 데이터      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Template 1 (T1) — 목표 표준                     │
├─────────────────────────────────────────────────────────────┤
│  daily-fortune     step0~3 기반, 복잡 입력, 리치 결과        │
│  rich-face         step0~3 기반, 사진 업로드, 퍼센트 결과    │
│  tarot-reading     step0~3 기반, 카드 선택, 리치 결과        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Template 2 (T2) — 현재 진행 중 (문제)           │
├─────────────────────────────────────────────────────────────┤
│  name-compatibility  svc-shell 기반, 섹션 토글, 즉시 결과   │
│  balance-game        svc-shell 기반, 섹션 토글, 즉시 결과   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              미분류 / Beta (방향 결정 필요)                   │
├─────────────────────────────────────────────────────────────┤
│  wealth-dna-test   beta 상태, 어느 템플릿인지 불명확         │
│  dopamine-lab      실험적, 독립 or T1 방향 미결정            │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. T1 vs T2 구조 정밀 비교

### 2-1. HTML 구조

**T1 (daily-fortune 기준)**
```html
<!-- Step 기반: 각 단계가 독립 DOM 노드 -->
<div id="step0" class="step dp-service-step">  <!-- 웰컴 -->
<div id="step1" class="step dp-service-step">  <!-- 입력 폼 -->
<div id="step2" class="step dp-service-step">  <!-- 로딩 -->
<div id="step3" class="step dp-service-step pb-8">  <!-- 결과 -->

<!-- 결과 카드 구조 -->
<div class="svc-result-hero svc-result-hero-amber">
  <div class="svc-result-hero-score">87</div>
  <div class="svc-result-hero-label">행운 지수</div>
</div>
<div class="svc-score-bar svc-score-bar-amber">
```

**T2 (name-compatibility 기준)**
```html
<!-- Shell 기반: CSS hidden으로 섹션 토글 -->
<div class="svc-shell svc-theme-compat svc-skin-b" data-service-id="name-compatibility">
  <header class="svc-topbar">...</header>
  <main class="svc-body">
    <section class="svc-hero svc-hero-preset-core">...</section>
    <section class="svc-card">  <!-- 입력 -->
    <section id="resultCard" class="svc-card svc-hidden">  <!-- 결과 (hidden) -->
    <section class="svc-button-group">
```

### 2-2. JavaScript 모듈 구조

**T1 (direct script loading)**
```javascript
// index.html 내 스크립트 태그로 직접 로드
<script src="/dunsmile/js/service-ui.js"></script>
<script src="/dunsmile/js/share-card.js"></script>
<script src="/dunsmile/js/daily-fortune.js"></script>

// daily-fortune.js 내부
function startFortune() {
  showStep(2);  // 로딩
  setTimeout(() => {
    const result = calculateFortune(...);
    renderResult(result);
    showStep(3);  // 결과
  }, 2000);
}
```

**T2 (module mount pattern)**
```javascript
// modules/name-compatibility/index.js
(function initNameCompatibilityModule(global) {
  async function mount(root) {
    root.innerHTML = global.DunsmileTemplate.renderShell({...});
    await loadScriptOnce(LOGIC_SCRIPT);
  }
  global.DunsmileModules = global.DunsmileModules || {};
  global.DunsmileModules['name-compatibility'] = { mount };
})(window);
```

### 2-3. CSS 시스템

**T1 (서비스별 컬러 변형)**
```css
/* 서비스별 컬러 identity 존재 */
.svc-result-hero-amber { background: amber gradient; }
.svc-result-hero-purple { background: purple gradient; }
.svc-score-bar-amber { background: amber; }
.svc-input-text-amber { border-color: amber; }
```

**T2 (단일 스킨 시스템)**
```css
/* CSS 변수 기반 단일 테마 */
.svc-shell.svc-skin-b {
  --svc-accent: var(--svc-theme-color);
}
.svc-button-primary { background: var(--svc-accent); }
/* 컬러 변형 없음 */
```

### 2-4. 사용자 경험(UX) 차이

| UX 요소 | T1 | T2 |
|---------|----|----|
| 입력 필드 수 | 3~5개 (이름, 성별, 생년월일, 선택 등) | 1~2개 |
| 로딩 단계 | 있음 (2~3초 진행 애니메이션) | 없음 (즉시 결과) |
| 결과 풍부도 | 고품질 (다수 카드, 점수, 분석, 차트) | 단순 (점수 + 한 줄 설명) |
| 공유 기능 | 이미지 다운로드 + 링크 공유 | 링크 공유 |
| 체류 시간 | 길다 (입력 + 로딩 + 결과 탐색) | 짧다 |
| AdSense 친화성 | 높음 (콘텐츠 밀도 높음) | 낮음 (콘텐츠 얇음) |

### 2-5. Firebase/데이터 처리

**T1**
```html
<!-- HTML에 Firebase SDK 직접 로드 -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
<script>
  firebase.initializeApp(firebaseConfig);
  window.db = firebase.firestore();
</script>
```

**T2**
- Firebase 직접 참조 없음
- 로직이 순수 클라이언트 사이드 계산에 의존

---

## 3. 왜 T2가 표준이 되면 안 되는가

### 3-1. 콘텐츠 밀도 문제 (AdSense 직결)

```
T2 페이지의 실제 텍스트 콘텐츠량:
- Hero 섹션: 제목 1줄 + 설명 2줄
- 입력 폼: 라벨 + 입력 필드
- 결과: 점수 + 설명 1~2줄

→ Google AdSense "박한 콘텐츠(thin content)" 판정 위험
→ AdSense 심사 거절 또는 광고 제한의 주요 원인
```

T1은 결과 페이지에만 수백 단어의 분석, 세부 카드, 인사이트가 포함되어 콘텐츠 밀도 기준을 충족함.

### 3-2. 브랜드 정체성 희석

T2의 `svc-skin-b` 단일 스킨 시스템은 모든 서비스를 동일하게 보이게 만듦.
도파민 공작소의 핵심 가치인 **"각 서비스의 독특한 분위기"** 가 사라짐.

```
daily-fortune  → 따뜻한 앰버/골드 감성
rich-face      → 프리미엄 퍼플 감성
tarot-reading  → 신비로운 다크 감성

name-compatibility → 그냥 svc-skin-b
balance-game       → 그냥 svc-skin-b  ← 차별화 없음
```

### 3-3. 체류 시간 = 광고 수익

```
T1 사용자 행동:
1. 정보 입력 (30초~1분)
2. 로딩 화면 시청 (2~3초)
3. 결과 카드 탐색 (2~5분)
4. 다른 서비스 클릭 (카루셀)
→ 페이지 체류 시간: 평균 3~7분

T2 사용자 행동:
1. 입력 (10~20초)
2. 즉시 결과 (5초 탐색)
3. 이탈
→ 페이지 체류 시간: 평균 30초~1분
```

광고 수익은 체류 시간, 페이지뷰와 직결됨. T2 구조로는 AdSense 수익화 목표 달성이 어렵다.

### 3-4. 모듈 mount() 패턴의 복잡성

T2의 `DunsmileModules['service-id'] = { mount }` 패턴은 깔끔해 보이지만:
- service-shell.js와의 암묵적 계약이 많음
- 디버깅 스택 트레이스가 복잡해짐
- 새 개발자가 "어디서 렌더링이 시작되는지" 파악하기 어려움
- T1의 직접 스크립트 로딩이 오히려 추적이 쉬움

### 3-5. T2가 진행 중인 지금이 전환 비용이 가장 낮다

현재 T2는 name-compatibility, balance-game 2개뿐.
이 시점에 표준을 T1으로 확정하지 않으면:
- 신규 개발자가 T2로 새 서비스를 계속 만들게 됨
- 5~10개가 쌓이면 이관 비용이 수십 배 증가
- **지금 결정이 가장 저렴한 시점**

---

## 4. T1을 공식 표준으로 확정하는 이유

### 4-1. AdSense 최적화 구조

| 기준 | T1 | T2 |
|------|----|----|
| 콘텐츠 밀도 | ✅ 풍부 | ❌ 박함 |
| 페이지 체류 시간 | ✅ 길다 | ❌ 짧다 |
| 광고 배치 공간 | ✅ 자연스러운 위치 다수 | ❌ 제한적 |
| 콘텐츠 고유성 | ✅ 서비스별 다름 | ❌ 획일적 |

### 4-2. 서비스 정체성 강화

운세/관상/심리테스트 장르는 **"몰입감"** 이 핵심 가치.
T1의 단계별 진행(입력 → 로딩 → 리치 결과)은 이 몰입감을 구조적으로 제공함.

### 4-3. 이미 검증된 패턴

daily-fortune, rich-face, tarot-reading이 T1으로 운영되고 있고,
이 서비스들이 트렌딩 점수 상위권. 이미 시장에서 검증된 구조.

### 4-4. 확장이 쉬운 결과 레이어

T1의 결과 화면(step3)은 카드를 추가/제거/순서 변경이 자유로움.
서비스별로 결과의 풍부도를 독립적으로 조절 가능.

---

## 5. 표준 T1 스펙 정의 (The Contract)

### 5-1. 필수 HTML 구조

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <!-- 필수: 서비스 고유 메타 -->
  <title>[서비스명] | 도파민 공작소</title>
  <meta name="description" content="[서비스 설명 50자 이상]">

  <!-- 필수: OG 태그 -->
  <meta property="og:title" content="[서비스명]">
  <meta property="og:image" content="/assets/og/[service-id].jpg">

  <!-- 필수: AdSense -->
  <meta name="google-adsense-account" content="ca-pub-XXXXXXXXXXXXXXXX">

  <!-- 필수: 공통 CSS (로드 순서 고정) -->
  <link rel="stylesheet" href="/assets/css/tailwind-built.css">
  <link rel="stylesheet" href="/dunsmile/css/tokens.css">
  <link rel="stylesheet" href="/dunsmile/css/components-core.css">
  <link rel="stylesheet" href="/dunsmile/css/service-shell.css">
  <!-- 선택: 서비스별 추가 CSS -->
  <link rel="stylesheet" href="/dunsmile/css/[service-id].css">
</head>
<body>
  <!-- GTM noscript (필수) -->

  <!-- 필수: 4단계 구조 -->
  <div id="step0" class="step dp-service-step">  <!-- 웰컴/재방문 -->
  <div id="step1" class="step dp-service-step">  <!-- 입력 폼 -->
  <div id="step2" class="step dp-service-step">  <!-- 로딩 -->
  <div id="step3" class="step dp-service-step pb-8">  <!-- 결과 -->

  <!-- 필수: AdSense 광고 슬롯 (결과 하단) -->
  <div class="dp-ad-slot dp-ad-slot-result-bottom">
    <!-- 광고 코드 -->
  </div>

  <!-- 필수: 다른 서비스 캐러셀 -->
  <div class="dp-other-services-carousel">

  <!-- 필수: 스크립트 로드 순서 -->
  <script src="/dunsmile/js/service-ui.js"></script>
  <script src="/dunsmile/js/share-card.js"></script>
  <script src="/dunsmile/js/[service-id].js"></script>
</body>
```

### 5-2. 필수 Step 구성

```
step0 (웰컴): 선택 사항
  - 이전 결과 재확인 or 새로 시작 분기
  - 재방문자 UX 개선용

step1 (입력): 필수
  - 서비스별 고유 컬러 테마 적용
  - 최소 2개 이상의 입력 필드
  - CTA 버튼 (data-analytics 속성 필수)

step2 (로딩): 필수
  - 최소 1.5초 이상의 진행 애니메이션
  - 재미있는 로딩 카피 (예: "운명의 실마리를 풀고 있어요...")
  - 프로그레스 바 또는 단계별 텍스트 변화

step3 (결과): 필수
  - svc-result-hero 컴포넌트 (서비스 컬러 적용)
  - 최소 3개 이상의 분석 카드
  - 공유 버튼 (이미지 저장 + 링크 복사)
  - 다른 서비스 카루셀 (dp-other-services-carousel)
  - 하단 광고 슬롯
```

### 5-3. 서비스별 컬러 할당 규칙

```javascript
// 서비스 컬러 팔레트 (신규 서비스 추가 시 여기서 배정)
const SERVICE_COLORS = {
  'daily-fortune':      'amber',    // 따뜻한 황금
  'rich-face':          'purple',   // 프리미엄 바이올렛
  'tarot-reading':      'indigo',   // 신비로운 남색
  // --- 신규 서비스 할당 예시 ---
  '[new-service-1]':    'rose',     // 로맨틱 핑크
  '[new-service-2]':    'teal',     // 청록 생동감
  '[new-service-3]':    'orange',   // 활기찬 오렌지
};
// 중복 컬러 금지. 서비스 identity를 차별화.
```

### 5-4. 필수 분석 트래킹

```javascript
// 모든 CTA 버튼에 data-analytics 필수
data-analytics="cta_click|[service-id]|[section]|[action]|"

// 필수 트래킹 이벤트:
// - 서비스 시작 (step1 → step2)
// - 결과 노출 (step2 → step3)
// - 공유 클릭
// - 캐러셀 클릭
```

### 5-5. 공통 유틸 의존 목록

```javascript
// service-ui.js 가 제공하는 필수 함수들
showStep(n)          // 단계 전환
showToast(msg)       // 알림 토스트
showError(msg)       // 에러 표시

// share-card.js 가 제공하는 필수 함수들
downloadResultImage(el)   // 결과 이미지 저장
copyResultLink(url)        // 링크 복사

// 이 함수들은 직접 재구현 금지 (공통 파일에서만 사용)
```

---

## 6. T2 서비스 이관 방안

### 6-1. 이관 대상

| 서비스 | 현재 | 목표 | 우선순위 |
|--------|------|------|---------|
| name-compatibility | T2 | T1 | 높음 |
| balance-game | T2 | T1 | 높음 |
| wealth-dna-test | Beta/미분류 | T1 | 중간 |
| dopamine-lab | 실험적 | 독립 유지 | 낮음 |

### 6-2. 이관 전략: "점진적 업그레이드"

T2 서비스를 한 번에 T1으로 바꾸는 것은 위험. 다음 순서를 따른다.

```
Phase 1: 콘텐츠 보강 (코드 변경 최소)
  → 현재 T2 HTML에 텍스트 콘텐츠 추가
  → AdSense thin content 위험 즉시 해소
  → 작업 시간: 서비스당 2~4시간

Phase 2: 결과 화면 리치화
  → step3 스타일의 결과 카드 추가
  → svc-result-hero 컴포넌트 적용
  → 서비스 고유 컬러 테마 적용
  → 작업 시간: 서비스당 1~2일

Phase 3: 입력 → 로딩 → 결과 흐름 적용
  → 즉시 결과 → 2초 로딩 추가
  → step 구조로 HTML 재구성
  → 작업 시간: 서비스당 1일

Phase 4: 공유 기능 강화
  → 이미지 저장 기능 추가
  → 캐러셀 추가
  → 작업 시간: 서비스당 반나절
```

### 6-3. name-compatibility 이관 상세 계획

**현재 구조 (T2)**:
```
입력: 이름 두 개
처리: 즉시 계산
결과: 점수 + 한 줄 설명
```

**목표 구조 (T1)**:
```
step1 - 입력:
  - 이름 A (텍스트)
  - 이름 B (텍스트)
  - 생년월일 A (선택, 더 정밀한 결과)
  - 생년월일 B (선택)
  - 시작 버튼

step2 - 로딩:
  - "두 사람의 운명을 읽고 있어요..."
  - 진행 바 애니메이션 (2초)

step3 - 결과:
  - [svc-result-hero-rose] 궁합 지수 87점
  - 카드 1: 감정 궁합 분석
  - 카드 2: 성격 상성 분석
  - 카드 3: 함께하면 좋은 활동
  - 카드 4: 주의해야 할 부분
  - 공유 버튼
  - 다른 운세 서비스 카루셀
  - 하단 광고
```

### 6-4. balance-game 이관 상세 계획

balance-game은 T1 변환보다 **독립 구조로 격상**이 더 적합할 수 있음.

**이유**: balance-game의 핵심 UX는 "빠른 연속 선택"이므로 로딩 단계 삽입이 UX를 해침.

**대안 방향**:
```
Option A: T1 변환
  - 각 라운드 시작 시 로딩 없이 즉시 다음 질문
  - 최종 결과 화면만 T1 step3 스타일로 리치화
  - 중간 선택 과정은 현행 유지

Option B: 독립 구조 격상
  - hoxy-number처럼 서비스 특성에 맞는 독립 구조 인정
  - 결과 화면만 AdSense 기준 충족하도록 보강
  - T2 코드 그대로 유지, 결과 레이어만 업그레이드
```

**권고**: Option A 선택. balance-game의 "연속 선택" UX는 살리되, 최종 결과를 T1 스타일로 리치화.

---

## 7. 신규 서비스 개발 가이드

### 7-1. 신규 서비스 의사결정 트리

```
새 서비스 아이디어 발생
         │
         ▼
  [서비스 성격 판단]
         │
    ┌────┴────┐
    │         │
사용자가     실시간 데이터/
입력하고     복잡한 백엔드
결과 받음    처리 필요?
    │              │
    ▼              ▼
  T1 템플릿    독립 구조
  (표준 경로)  (별도 설계)
```

### 7-2. 신규 서비스 생성 순서

```bash
# 1. 서비스 스캐폴딩
npm run create:service

# 2. 입력 정보:
#    - service-id: [kebab-case]
#    - 컬러 테마: [T1 컬러 팔레트에서 미사용 컬러 선택]
#    - 카테고리: fortune | fun | ai | utility

# 3. 생성 확인 목록
#    ✅ dunsmile/[service-id]/index.html  (T1 템플릿 기반)
#    ✅ dunsmile/js/[service-id].js       (로직 파일)
#    ✅ services.manifest.json 항목 추가
#    ✅ OG 이미지 슬롯 예약 (assets/og/[service-id].jpg)
```

### 7-3. 금지 사항 (Anti-patterns)

```javascript
// ❌ 금지: T2 svc-shell 패턴으로 신규 서비스 생성
<div class="svc-shell svc-skin-b">

// ❌ 금지: DunsmileModules mount() 패턴으로 신규 서비스 등록
DunsmileModules['new-service'] = { mount };

// ❌ 금지: 즉시 결과 (로딩 단계 없음)
function showResult() {
  resultEl.classList.remove('hidden'); // 즉시 토글
}

// ❌ 금지: 공통 함수 재구현
function myShowToast(msg) { ... }  // service-ui.js의 showToast 재구현

// ✅ 허용: T1 step 패턴
function startService() {
  showStep(2);  // 로딩
  setTimeout(() => {
    const result = calculate();
    renderResult(result);
    showStep(3);  // 결과
  }, 2000);
}
```

---

## 8. 진행 방향 로드맵

### 8-1. 즉시 (이번 주)

```
[ ] T2 금지 선언
    → CONTRIBUTING.md에 "신규 서비스는 T1 패턴만 사용" 명문화
    → FE_CODE_STANDARDS.md에 Anti-patterns 섹션 추가

[ ] T1 표준 스펙 문서 배포
    → 이 문서(12번)를 팀 공유
    → create:service 스크립트가 T1 기본 템플릿 생성하는지 확인

[ ] wealth-dna-test 방향 결정
    → T1으로 이관할지, 독립 구조로 완성할지 결정
    → Beta 상태인 채로 서비스 계속 추가 금지
```

### 8-2. 단기 (2~4주)

```
[ ] name-compatibility T1 이관
    → Phase 1~4 순서대로 진행
    → 이관 후 AdSense 광고 슬롯 추가

[ ] balance-game 결과 화면 리치화
    → Option A 방향으로 최종 결과 화면만 T1 스타일 적용

[ ] T1 공통 유틸 강화
    → service-ui.js에 공통 함수 확충
    → 각 서비스의 중복 구현 제거
```

### 8-3. 중기 (1~2개월)

```
[ ] 신규 서비스 3~5개 T1으로 추가
    → 이 로드맵 검증
    → 각 서비스 AdSense 콘텐츠 밀도 기준 충족 확인

[ ] AdSense 신청
    → T1 표준 서비스 최소 5개 이상 완성 후
    → 각 서비스 텍스트 콘텐츠 100단어 이상 확인
    → Privacy, Terms, About 페이지 최신화

[ ] create:service 스크립트 T1 템플릿 자동화 강화
    → 컬러 선택 → CSS 변수 자동 생성
    → 4단계 step 구조 자동 생성
    → manifest 자동 등록
```

---

## 9. 활용 스킬 및 참고 자료

### 9-1. 이관 작업 시 활용할 Claude Code 스킬

#### `/frontend-design` 스킬
**사용 시점**: name-compatibility, balance-game의 T1 변환 시 결과 화면 디자인
```
활용 예시:
"name-compatibility 서비스의 T1 결과 화면을 디자인해줘.
 컬러: rose, 궁합 지수 87점, 감정/성격/활동/주의 4개 분석 카드 포함"
```

#### `/web-design-guidelines` 스킬
**사용 시점**: 이관 완료 후 AdSense 심사 전 점검
```
활용 예시:
"name-compatibility 이관된 페이지 AdSense 기준으로 리뷰해줘"
"각 서비스 페이지 접근성 및 콘텐츠 밀도 체크해줘"
```

#### `/systematic-debugging` 스킬
**사용 시점**: T2 → T1 이관 중 기존 기능이 깨질 때
```
활용 예시:
"name-compatibility T1 변환 후 점수 계산이 안 되는 버그"
"balance-game 최종 결과 화면이 표시되지 않는 문제"
```

#### `/test-driven-development` 스킬
**사용 시점**: 이관 작업 전 현재 동작을 테스트로 고정하고 싶을 때
```
활용 예시:
"name-compatibility 이관 전에 현재 계산 로직 테스트 작성해줘"
```

### 9-2. 참고할 내부 문서

| 문서 | 참고 시점 |
|------|---------|
| `docs/FE_CODE_STANDARDS.md` | 컴포넌트 작성 기준 확인 |
| `docs/FRONTEND_COLLAB_RULES.md` | 브랜치 및 PR 규칙 |
| `docs/ADSENSE_POLICY_GUARDRAILS.md` | 광고 배치 기준 |
| `docs/analysis/09_home_design_makeover.md` | DDS 컬러/타이포 토큰 기준 |
| `docs/analysis/10_master_design_spec_v3.md` | 전체 디자인 시스템 레퍼런스 |
| `docs/SCALING_EXECUTION_CHECKLIST.md` | 서비스 추가 전 체크리스트 |

### 9-3. T1 구현 레퍼런스 (내부 Best Practice)

이미 완성된 T1 서비스 중 참고 우선순위:

```
1순위: daily-fortune
   → 가장 완성도 높은 T1 구현
   → step 구조, 컬러 시스템, 로딩, 결과 카드 모두 표준적
   → 새 서비스 만들 때 복사 기점으로 사용

2순위: rich-face
   → 사진 업로드 + Firebase 연동 참고
   → 더 복잡한 입력 처리 패턴 참고

3순위: tarot-reading
   → 카드 선택 인터랙션 참고
   → 독특한 결과 표현 방식 참고
```

### 9-4. 외부 참고 사례 (경쟁 서비스 분석)

T1 구조의 방향성을 확인하고 싶을 때 참고할 서비스 유형:

```
국내 성공 사례 분석 포인트:
- 푸망 (pumang.co.kr): 단계별 진행, 리치 결과, 공유 최적화
- 방구석연구소: 심리 테스트, 긴 결과 텍스트, AdSense 밀도
- 16personalities: 로딩 몰입감, 카테고리별 상세 결과

공통점:
✅ 입력 → 로딩 → 결과의 명확한 3단계
✅ 결과 페이지의 높은 텍스트 밀도
✅ 서비스별 고유한 컬러/무드
✅ 소셜 공유 최적화 (OG 이미지 특히 중요)
✅ 관련 서비스 크로스셀링
```

### 9-5. AdSense 통과를 위한 콘텐츠 체크리스트

```
각 T1 서비스가 충족해야 할 AdSense 기준:

콘텐츠 양:
  [ ] 서비스 설명 텍스트 50자 이상 (step1 상단)
  [ ] 결과 설명 텍스트 각 카드당 30자 이상
  [ ] 전체 결과 페이지 텍스트 200자 이상

페이지 구조:
  [ ] Privacy Policy 링크 (footer 또는 설정)
  [ ] About/운영자 정보 접근 가능
  [ ] 광고 슬롯이 콘텐츠와 혼동되지 않음

기술:
  [ ] 페이지 로딩 3초 이내
  [ ] 모바일 반응형 완전 지원
  [ ] 깨진 이미지/링크 없음
  [ ] HTTPS 적용 (Cloudflare 기본)
```

---

## 최종 결론

```
현재 상황:
  T1 (표준 목표): 3개 서비스 (daily-fortune, rich-face, tarot-reading)
  T2 (즉시 중단): 2개 서비스 (name-compatibility, balance-game)
  독립 구조 (유지): 2개 서비스 (hoxy-number, market-sentiment)
  미결정: 2개 서비스 (wealth-dna-test, dopamine-lab)

즉시 조치:
  1. 신규 서비스 T2 패턴 사용 금지 (문서화)
  2. name-compatibility T1 이관 착수
  3. balance-game 결과 화면 T1 스타일 리치화
  4. wealth-dna-test 완성 방향 결정

핵심 원칙:
  "도파민 공작소의 모든 서비스는 사용자를 몰입시키고
   충분한 콘텐츠로 AdSense 기준을 충족해야 한다.
   T1 패턴은 이 두 가지를 동시에 달성하는 유일한 검증된 구조다."
```
