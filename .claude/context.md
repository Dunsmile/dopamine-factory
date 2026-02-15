# 도파민 공작소 (Dopamine Factory) 프로젝트 컨텍스트

## 프로젝트 개요
도파민 공작소는 운세/행운 관련 서비스를 제공하는 팀 협업 플랫폼입니다.
운세 서비스(오늘의 운세, 관상 테스트)를 통해 매일 접속을 유도하고, 로또·타로 등 다양한 콘텐츠로 체류 시간을 확보하는 구조입니다.
레포가 fe/be 모노레포 구조 + Git Flow 워크플로우로 재편되었습니다 (v3.1, 2026-02-11).

## 서비스 목록

### ✅ 운영 중
1. **HOXY NUMBER** - 로또 번호 생성기 (fe/public/dunsmile/hoxy-number/)
2. **부자가 될 상인가?** - AI 관상 테스트 (fe/public/dunsmile/rich-face/)
3. **오늘의 운세 풀이** - 별자리·띠·사주 운세, 매일 새 결과로 재방문 유도 (fe/public/dunsmile/daily-fortune/)

### 📋 개발 예정
4. **ONE DAY MY CARD** - 타로 카드 오늘의 운세 (1순위)
5. **부자 DNA MBTI** - 재테크 성향 MBTI 테스트 (2순위)
6. **부자 손금 테스트** - 손금 속 재물운 분석 (2순위)

## 기술 스택
- **Frontend**: HTML, CSS (Tailwind CDN), Vanilla JavaScript
- **Storage**: LocalStorage + Firebase Firestore
- **Backend**: Firebase (Firestore Database)
- **Hosting**: Cloudflare Pages (배포 루트: `fe/public`)
  - Repository: https://github.com/Dunsmile/dopamine-factory.git
  - Live URL: https://dopamine-factory.pages.dev
- **CI/CD**: GitHub Actions (`.github/workflows/ci.yml`)
- **Git Workflow**: Git Flow (docs/GIT_WORKFLOW.md 참고)

## 폴더 구조
```
dopamine-factory/
├── fe/                          (프론트엔드)
│   ├── README.md
│   └── public/                  (Cloudflare Pages 배포 루트)
│       ├── index.html           (포털 랜딩 페이지)
│       ├── robots.txt, sitemap.xml, ads.txt, _headers
│       ├── dunsmile/            (Dunsmile 서비스)
│       │   ├── hoxy-number/     (HOXY NUMBER)
│       │   │   ├── index.html
│       │   │   └── guide/index.html
│       │   ├── rich-face/       (관상 테스트)
│       │   │   ├── index.html
│       │   │   └── guide/index.html
│       │   ├── daily-fortune/   (오늘의 운세)
│       │   │   ├── index.html
│       │   │   └── guide/index.html
│       │   ├── css/, js/        (공유 스타일/스크립트)
│       │   ├── about.html, privacy.html, terms.html
│       │   └── favicons, og-images
│       ├── teammate/            (팀원 서비스 - 준비 중)
│       └── assets/              (공용 리소스)
├── be/                          (백엔드 - 준비 중)
│   └── README.md
├── docs/
│   └── GIT_WORKFLOW.md          (브랜치 전략 문서)
├── tests/
│   └── structure.test.sh        (폴더 구조 검증)
└── .github/workflows/ci.yml    (CI 파이프라인)
```

## 주요 파일
- `fe/public/index.html` - 도파민 공작소 포털 랜딩
- `fe/public/dunsmile/hoxy-number/index.html` - HOXY NUMBER (로또 번호 생성기)
- `fe/public/dunsmile/rich-face/index.html` - 관상 테스트 페이지
- `fe/public/dunsmile/daily-fortune/index.html` - 오늘의 운세 풀이 페이지
- `fe/public/dunsmile/js/app.js` - 로또 앱 로직
- `fe/public/dunsmile/js/face-test.js` - 관상 테스트 로직
- `fe/public/dunsmile/js/daily-fortune.js` - 오늘의 운세 풀이 로직
- `fe/public/dunsmile/css/style.css` - 공통 스타일
- `docs/GIT_WORKFLOW.md` - Git Flow 브랜치 전략

## 핵심 기능
1. **로또 번호 생성** - 1~45 중 6개 랜덤 생성
2. **일일 할당량 시스템** - 기본 10회/일, 무료 충전 시 +5회 추가 (12시간 3회 제한)
3. **연속 5회 뽑기** - 한 번에 5개 번호 생성
4. **슬롯 시스템** - 최근 생성 번호 저장 (기본 5슬롯, +5 확장, 최대 50)
5. **번호 관리** - 저장 번호 페이지네이션 (페이지당 10개), 빈 슬롯 표시
6. **당첨 확인** - 1등~5등 당첨 등수 표시 + 실제 당첨금 표시
7. **오늘의 럭키 넘버** - 12시간 주기 갱신, 모달 애니메이션 후 공개, 저장 가능
8. **양방향 스와이프** - 좌→우: 저장, 우→좌: 삭제 (확인 모달)
9. **당첨 회차 선택** - 최근 10회차 드롭다운 (Firestore 캐싱)
10. **당첨 보상 시스템** - 등수별 화려한 UI + 축하 팝업 + 실제 당첨금

## 코딩 스타일
- 한국어 주석 사용
- 함수명: camelCase
- 이모지 사용 (사용자 선호)
- 모바일 우선 반응형 디자인

### CSS 작성 규칙 (필수)
- **Tailwind 유틸리티 클래스를 HTML에 직접 나열하지 않는다**
- 대신 `style.css`에 **시맨틱(의미 있는) 클래스명**을 정의하고 HTML에서는 그 클래스만 사용한다
- 기존 패턴 참고: `dp-header-home`, `dp-sidebar`, `dp-menu-item` 등

```css
/* style.css - 의미 있는 이름으로 정의 */
.tab-btn { display:flex; align-items:center; gap:6px; padding:8px 12px; ... }
.tab-btn.active { color:#2563eb; background:#eff6ff; }
```
```html
<!-- HTML - 클래스명만으로 역할을 알 수 있게 -->
<button class="tab-btn active">홈</button>
```

- **이유**: Tailwind 인라인은 수정 시 어떤 요소인지 파악이 어렵고, 시맨틱 클래스는 한 곳(style.css)만 수정하면 전체 반영됨
- **네이밍**: `dp-` 접두사(공통) 또는 서비스별 접두사 사용 (예: `hoxy-`, `fortune-`)
- **예외**: 단순 레이아웃 보조 (예: `mt-2`, `hidden`)는 인라인 Tailwind 허용

## 최근 작업 이력
- ✅ Firebase 백엔드 통합 완료 (commit: 575f300)
- ✅ Cloudflare Pages 배포 완료
- ✅ Git 저장소 초기화 및 설정 완료
- ✅ v1.2 UI/UX 대규모 개선 (2026-02-03)
- ✅ v1.3 버그 수정 및 기능 개선 (2026-02-03)
- ✅ v1.4 SEO 최적화 및 Google AdSense 연동 (2026-02-05)
- ✅ v1.5 관상 테스트 서비스 추가 (2026-02-05)
- ✅ v1.8 UX 개선 + 럭키넘버 기능 강화 (2026-02-06)
- ✅ v1.9 직접 번호 입력 + targetDraw 기반 당첨 확인 (2026-02-06)
- ✅ GTM(Google Tag Manager) 설치 및 GA4 수집을 GTM으로 전환 (2026-02-06)
- ✅ GA4/AdSense 고지 문구 보강 (HOXY NUMBER + 관상 테스트) (2026-02-06)
- ✅ 관상 테스트 결과 콘텐츠 대폭 강화 (인물 풀 확장, 상세 분석 300자+, 키워드/타입, 명언/그래프 콜아웃) (2026-02-06)
- ✅ 관상 테스트 상단 설정 모달 및 정책 모달 추가 (서비스 소개/개인정보/약관) (2026-02-06)
- ✅ 관상 테스트 결과 문구 리듬 개선 및 가독성 줄바꿈 보강 (2026-02-06)
- ✅ 관상 테스트 그래프 UI 업그레이드 + 애니메이션 적용 (2026-02-06)
- ✅ 관상 테스트 그래프 레이블 단순화 (#결단/#협업 능력/#타고난 운) (2026-02-06)
- ✅ 로또 가이드 링크를 설정 모달로 이동 (2026-02-06)
- ✅ 정책/가이드 페이지 생성 및 사이트맵 반영 (about/privacy/terms + lotto/face-test guide) (2026-02-07)
- ✅ 당첨 확인 탭 직접 입력: 기본 한 줄 자동 생성 제거 (2026-02-07)
- ✅ v2.0 오늘의 운세 풀이 서비스 추가 (2026-02-07)
  - 별자리(12개) · 띠(12지신) · 사주(천간지지) · 오행 종합 분석
  - 5대 카테고리 운세 (총운/애정운/금전운/건강운/직장운)
  - 행운 요소 (숫자, 아이템, 색상, 방향)
  - 해시 기반 일일 갱신 (사용자정보+날짜 → 매일 다른 결과, 동일 사용자 동일 날짜 = 동일 결과)
  - 운세 텍스트 풀: 총운 30, 애정 20, 금전 20, 건강 15, 직장 20 (총 105개)
  - 운세 가이드 페이지 (12별자리/12띠/천간지지/오행 해설) - AdSense 콘텐츠 보강
  - 캐러셀 카드 UI (관상 테스트 / 로또 번호 교차 퍼널)
  - Firebase `daily_fortune_results` 컬렉션 저장
  - 앰버/오렌지 테마 (기존 서비스와 차별화)
- ✅ 오늘의 운세 → 오늘의 운세 풀이 명칭 통일 + daily-fortune GTM/AdSense 중복 제거 (2026-02-08)
- ✅ 확장자 없는 경로 대응을 위해 index 경로 구성 + guide 페이지 GTM 보강 (2026-02-08)
- ✅ v2.01 사이드 탭 스크롤 및 카드 밀도 조정 + 모바일 GNB 배경 비침 방지 (2026-02-08)
- ✅ v2.02 관상 입력 페이지에 서비스 설명/알 수 있는 것들/FAQ 섹션 추가 (2026-02-08)
- ✅ v2.03 오늘의 운세 "내 정보 기억하기" 기능 추가 (2026-02-08)
  - [선택] 체크 시 localStorage에 이름/성별/생년월일 저장
  - 재방문 시 Step 0 환영 화면 (이름 표시 + 바로 운세 확인)
  - 같은 날 재방문: 캐시된 결과 즉시 표시 / 새로운 날: 로딩 후 새 결과
- ✅ v3.0 도파민 공작소 팀 플랫폼 구조 재편 (2026-02-10)
  - hoxy-number 레포 → dopamine-factory로 rename
  - 서비스 파일을 dunsmile/ 폴더로 이동 (팀원별 폴더 구조)
  - 서비스별 클린 URL 경로: /dunsmile/hoxy-number/, /dunsmile/rich-face/, /dunsmile/daily-fortune/
  - 가이드 페이지 서비스 폴더 내 guide/로 이동
  - 포털 랜딩 페이지 생성 (index.html)
  - 팀원 폴더 (teammate/) + 공용 폴더 (assets/) 준비
  - 모든 절대경로, 도메인 URL, 상대경로 일괄 변경
  - Cloudflare Pages 새 프로젝트 생성 (dopamine-factory.pages.dev)
  - Google Search Console 새 도메인 등록 + 사이트맵 제출
  - AdSense 새 도메인 등록
- ✅ v3.1 fe/be 모노레포 + Git Flow 도입 (2026-02-11)
  - 팀원이 레포 구조 재편: 서비스 파일 → fe/public/ 하위로 이동
  - be/ 백엔드 폴더 생성 (준비 중)
  - docs/GIT_WORKFLOW.md 브랜치 전략 문서 추가
  - .github/workflows/ci.yml CI 파이프라인 추가
  - tests/structure.test.sh 폴더 구조 검증 테스트 추가
  - Git Flow: main(배포) / develop(개발) / feature·fix·hotfix 브랜치 전략
  - Cloudflare Pages 배포 루트: fe/public

## Firebase 설정
- **Project ID**: hoxy-number
- **Auth Domain**: hoxy-number.firebaseapp.com
- **Database**: Firestore
- **Storage**: hoxy-number.firebasestorage.app

### Firestore 컬렉션
- `generated_numbers`: 사용자가 생성한 번호 저장
- `winning_numbers`: 당첨 번호 캐시 (회차별 당첨 정보 + 등수별 당첨금)
- `face_test_results`: 관상 테스트 결과 (이름, 성별, 생년월일, 결과해시)
- `daily_fortune_results`: 오늘의 운세 풀이 결과 (이름, 성별, 생년월일, 날짜, 별자리, 띠, 오행, 종합점수)

## 중요 설정값
```javascript
const DEFAULT_QUOTA = 10;        // 일일 생성 횟수
let recentSlots = 5;             // 기본 슬롯 수 (최대 50)
let savedUnlockedPages = 1;      // 저장 번호 잠금해제 페이지 수
let savedItemsPerPage = 10;      // 페이지당 항목 수
```

## LocalStorage 키
- `hoxy_quota`: 일일 생성 할당량
- `hoxy_recent`: 최근 생성 번호
- `hoxy_saved`: 저장된 번호
- `hoxy_lucky`: 오늘의 행운 번호
- `hoxy_winning`: 현재 선택된 당첨 정보 (prizes 포함)
- `hoxy_recent_slots`: 슬롯 개수
- `hoxy_pages_unlocked`: 최근 번호 페이지 잠금 해제 수
- `hoxy_saved_pages_unlocked`: 저장 번호 페이지 잠금 해제 수
- `hoxy_fortune_user`: 운세 사용자 정보 (이름, 성별, 생년월일)
- `hoxy_fortune_result`: 캐시된 운세 결과 (date 포함)
- `hoxy_fortune_remember`: 기억하기 플래그 ('true' 또는 없음)

## 디자인 특징
- 그라데이션 UI (생동감 있는 효과)
- 부드러운 애니메이션과 트랜지션
- 직관적이고 터치 친화적인 인터페이스
- 모달 최대 너비 480px로 최적화
- PC/모바일 반응형 레이아웃

## 프로젝트 정보
- **버전**: v3.1 (2026-02-11) - fe/be 모노레포 + Git Flow 도입
- **이전 버전**: v2.03, v2.0, v1.9, v1.8.1, v1.8, v1.7, v1.6, v1.5, v1.4, v1.3, v1.2, v1.1, v1.0
- **개발자**: 스티브 (UX/UI Designer & Developer)
- **연락처**: poilkjmnb122@gmail.com
- **라이센스**: MIT License

## 🏭 도파민 공작소 플랫폼 구조

### 서비스 URL (운영)
| 서비스 | URL | 로컬 파일 |
|--------|-----|-----------|
| 포털 랜딩 | `/` | `fe/public/index.html` |
| HOXY NUMBER | `/dunsmile/hoxy-number/` | `fe/public/dunsmile/hoxy-number/index.html` |
| 관상 테스트 | `/dunsmile/rich-face/` | `fe/public/dunsmile/rich-face/index.html` |
| 오늘의 운세 | `/dunsmile/daily-fortune/` | `fe/public/dunsmile/daily-fortune/index.html` |

### Git Flow 작업 방식
- **main**: 최종 배포 버전만 (직접 push 금지)
- **develop**: 통합 개발 브랜치 (PR 타겟)
- **feature/fe-xxx**: 프론트엔드 기능 개발
- **feature/be-xxx**: 백엔드 기능 개발
- **fix/fe-xxx, fix/be-xxx**: 버그 수정
- **hotfix/xxx**: 운영 긴급 수정 (main에서 분기)

### 작업 흐름
1. develop에서 feature 브랜치 생성
2. 기능 개발 후 PR 생성 (target: develop)
3. CI 통과 + 리뷰 후 머지
4. 배포 시점에 release 브랜치 → main 머지

### 협업 구조
| 영역 | 담당자 | 권한 |
|------|--------|------|
| fe/public/dunsmile/ | Dunsmile (Steve) | 전용 |
| fe/public/ (포털) | 공동 | 협업 |
| fe/public/teammate/ | 팀원 | 본인 서비스 전용 |
| be/ | 공동 | 협업 |

### 로컬 실행
```bash
python3 -m http.server 8080 --directory fe/public
```

## 🎯 비즈니스 모델 & 수익화 전략

### 핵심 전략
**소셜 프루프 기반 사용자 유입 퍼널**
- 홈페이지에 "이 사이트에서 당첨자 X명 배출!" 카드 UI 표시
- 신규 방문자들이 실제 당첨 사례를 보고 신뢰하여 서비스 사용 유도
- 로또 → 관상·운세·타로 서비스로 확장 (운세/관상 완료, 타로 예정)

### 수익화 방식
1. **1단계 (현재)**: 완전 무료 + Google AdSense 배너 광고
   - 페이지 내 자연스러운 광고 배치
   - "무료 충전" 기능으로 사용자 편의 제공 (광고 강제 아님)
   - 할당량 추가, 슬롯 확장 등 편의 기능
2. **2단계 (추후)**: 프리미엄 서비스
   - 무제한 생성, 고급 통계, 사주/운세 서비스 등

### 저장 로직 통일 (광고 수익 보호)
- **홈 탭**: `recentSlots` 기준으로만 저장 가능
- **내 번호 탭**: `savedUnlockedPages * 10` 기준으로만 저장/표시
- **당첨 확인 탭**: 내 번호 탭과 동일한 범위만 표시

## 🚧 현재 개발 상태

### ✅ 완료된 작업
- Firebase Firestore 설정 완료
- 번호 생성 시 DB 저장 구현 완료
- 개발자 모드에서 데이터 저장 확인 완료
- 광고 시청 UI 구현 완료 (AdSense 새 도메인 등록 완료, 심사 대기 중)
- 동행복권 API 연동 완료 (최신 회차 당첨 번호 자동 업데이트)
- 당첨 회차 드롭다운 개선 (Firestore 캐싱)

### ✅ v1.2 업데이트 (2026-02-03)

#### 스와이프 UX 개선
- 양방향 스와이프 → **좌측 스와이프만** 활성화
- 스와이프 시 **iOS 스타일 액션시트** 표시 (저장/삭제/취소)
- 스와이프 힌트 화살표 애니메이션 추가

#### PC/모바일 반응형 네비게이션
- **PC (768px+)**: 상단 GNB에 탭 네비게이션
- **모바일**: 하단 FNB 유지
- 콘텐츠 최대 너비: 모바일 448px / PC 576px

#### PC 반응형 요소 크기 조정
- 숫자 공: 32px → 40px (PC)
- 텍스트: xs → sm (PC)
- 간격/패딩 증가 (PC)

#### 당첨 보상 시스템
- **등수별 카드 스타일**: 1등(금), 2등(은), 3등(동), 4-5등(초록)
- **축하 팝업 모달**: 회차, 등수, 일치 번호, 당첨금 표시
- **컨페티 효과**: 1~3등 당첨 시

### ✅ v1.3 업데이트 (2026-02-03)

#### 버그 수정
- **GNB 탭 클릭 영역**: 텍스트/아이콘에 `pointer-events-none` 적용
- **전체 저장 버그**: `recentSlots` 기준으로만 저장 (확장된 슬롯만)
- **저장 제한**: `savedUnlockedPages * 10` 초과 시 저장 불가 + 안내 메시지
- **당첨 확인 탭**: 잠금해제된 페이지 범위만 표시 (광고 수익 보호)
- **당첨금 API 필드**: `wonmoney` → `payoutStr` 수정

#### 기능 개선
- **저장된 번호 빈 슬롯 표시**: 저장 가능 공간 시각화
- **저장 현황 카운터**: "n/m개 저장됨" 표시
- **실제 당첨금 표시**: 고정값 → API 실제 데이터 (win1~win5)
- **Firestore prizes 저장**: 등수별 당첨금 전체 저장

### ✅ v1.4 업데이트 (2026-02-05)

#### SEO 최적화
- 메타 태그 추가 (description, keywords, robots, author)
- Open Graph 태그 (Facebook, KakaoTalk 공유)
- Twitter Card 태그
- JSON-LD 구조화 데이터 (검색 리치 스니펫)
- robots.txt, sitemap.xml 생성
- og-image.png 생성 (1200x630)

#### Google AdSense 연동
- 메타 태그: `google-adsense-account`
- 스크립트: `adsbygoogle.js`
- ads.txt 생성
- Publisher ID: `ca-pub-7301223136166743`

#### 필수 페이지 추가 (설정 > 기타)
- 서비스 소개
- 개인정보처리방침
- 이용약관

#### 관리자 기능
- 관리자 로그인 (설정 > 기타 > 관리자)
- ID: dunsmile / PW: a123
- 로그인 후 관리 기능 표시 (할당량 초기화, 데이터 삭제)

### ✅ v1.5 업데이트 (2026-02-05)

#### 관상 테스트 서비스 추가
- **URL**: /dunsmile/rich-face/
- **서비스명**: "부자가 될 상인가?"

#### 서비스 메뉴 (햄버거 메뉴)
- GNB 좌측 햄버거 버튼 (☰)
- 사이드바에서 서비스 간 이동
- 각 서비스에 교차 홍보 배너 추가

#### 관상 테스트 기능
- 입력: 이름, 성별, 생년월일, 사진(5MB 이하)
- 분석 로딩 애니메이션
- 결과 화면: 부자 확률, 유명인 매칭, 분석 텍스트
- 해시 기반 일관된 결과 (동일 정보 = 동일 결과, 사진 무관)
- 20가지 행운 메시지 랜덤 표시
- 10명 유명인 매칭 (정주영, 빌게이츠 등)
- Firebase 저장 (사진 제외)
- 공유하기 기능

#### 관상 테스트 데이터 구조
```javascript
{
  name: '홍길동',
  gender: 'male',
  birthDate: '1990-01-15',
  resultHash: 123456789,
  richPercent: 87,      // 65~94%
  luckPercent: 73,      // 50~89%
  celebrity: '정주영',
  createdAt: timestamp
}
```

### ✅ v1.6 업데이트 (2026-02-05) - UT 피드백 반영

#### 스와이프/롱프레스 UX 변경
- **모바일**: 스와이프 → 삭제만 (저장 버튼 제거)
- **모바일**: 롱프레스(0.8초) → 저장 확인 모달
- **PC**: 호버 시 저장/삭제 버튼 표시

#### 간격 최적화 (4px 그리드)
- 전체 패딩/마진 축소 (p-5 → p-3, gap-4 → gap-1 등)
- 모바일 레이아웃 타이트하게 조정
- 375px 이하 초소형 디바이스 지원

#### 남은 횟수 모두 뽑기 기능
- 할당량 4회 이하일 때 "광고 보고 남은 N회 모두 뽑기" 옵션 표시
- 기존 "5회 연속 뽑기"와 조건부 전환

#### 내 번호 탭 상단에 최근 번호 표시
- "최근 뽑은 번호" 섹션 추가 (최대 5개)
- 저장하지 않아도 최근 번호 확인 가능

#### 모바일 반응형 최적화 (375px 기준)
- 숫자 공 크기: 28px (모바일) / 32px (400px+) / 36px (PC)
- 폰트 크기 전체 축소
- 요소 overflow 방지

### ✅ v1.7 업데이트 (2026-02-06) - 당첨 통계 UI

#### 당첨 통계 시스템
- **PC 우측 사이드바**: 이번주 당첨 현황 + 역대 당첨 기록 카드
- **모바일 상단 배너**: 한 줄 미니멀 통계 ("이번주 N명 당첨! | 역대 1등 N명 배출")
- **오늘 하루 숨김**: X 버튼으로 당일 숨김 (localStorage)

#### 당첨 통계 데이터 구조
- `winning_stats/weekly_{회차}`: 주간 통계 (1~5등)
- `winning_stats/all_time`: 역대 통계 (1~3등만)
- Firestore에서 실시간 로드

#### 스와이프/롱프레스 버그 수정
- 이벤트 위임 방식으로 변경 (DOM 재생성 시에도 동작)
- 스와이프 → 삭제, 롱프레스(0.8초) → 저장

#### UI 개선
- 하단 FNB z-index: 50 추가 (콘텐츠 위에 표시)
- 내 번호 탭 "홈에서 더 보기" 버튼 제거
- 모바일 스와이프 안내 텍스트 PC에서 숨김

### ✅ v1.8 업데이트 (2026-02-06) - UX 개선 + 럭키넘버 강화

#### UI 문구 변경 (AdSense 정책 준수)
- "광고 보고 +5회" → "🎁 무료 횟수 +5회 충전"
- "광고 시청" → "무료 충전"
- "광고보고 연속 5회 뽑기" → "연속 5회 뽑기"
- 슬롯/페이지 추가 버튼 문구에서 "광고" 제거

#### 스와이프 기능 개선 (양방향)
- **좌→우 스와이프**: 저장 확인 모달
- **우→좌 스와이프**: 삭제 확인 모달
- **롱프레스 기능 제거** (심플화)
- 힌트 텍스트: "← 삭제 | 저장 →"

#### 럭키넘버 기능 강화
- **모달 애니메이션**: "행운을 불러오는 중..." (3초)
- **번호 확인하기 버튼**: 모달에서 클릭 후 홈 화면 공개
- **공개 애니메이션**: 카드 scale + fade-in 효과
- **저장 버튼 추가**: 럭키넘버를 내 번호에 저장 가능
- **저장 완료 처리**: 중복 저장 방지 UI

#### 버그 수정
- 홈에서 최근 번호 삭제 시 내 번호 탭 프리뷰 동기화

#### CSS 애니메이션 추가
- `.lucky-bounce`: 럭키넘버 아이콘 바운스
- `.lucky-dot`: 로딩 점 애니메이션
- `.lucky-reveal-animation`: 공개 시 scale 효과
- `.lucky-actions-show`: 저장 버튼 슬라이드

### ✅ v1.9 업데이트 (2026-02-06) - 직접 번호 입력 + targetDraw 시스템

#### 직접 번호 입력 기능 (홈 탭)
- 최근 생성 번호 위에 6개 텍스트 박스 추가
- 1~45 사이 숫자만 입력 가능, 2자리 자동 제한
- 중복 불가 (실시간 + blur 이벤트 체크)
- 6개 모두 입력 시 "내 번호 저장하기" 버튼 활성화
- 저장 시 최근 생성 번호에도 추가됨

#### targetDraw 기반 당첨 확인 시스템
- **문제 해결**: 과거 회차 당첨 번호를 현재 저장해도 1등으로 표시되는 논리적 오류 수정
- **저장 시**: 다음 회차(getNextDrawNumber)를 targetDraw로 함께 저장
- **당첨 확인 시**: 선택한 회차와 targetDraw가 일치하는 번호만 필터링
- **데이터 구조**: `{ numbers, timestamp, targetDraw }`

#### 당첨 확인 탭 직접 입력 개선
- 스타일 통일: 홈 탭과 동일한 6자리 텍스트 박스 UI
- **저장 제거**: 직접 입력은 조회만 가능 (저장 안 함)
- 당첨 결과만 확인하고 저장하지 않음

#### 중복 체크 개선 (onblur 이벤트)
- **oninput**: 2자리 입력 시에만 중복 체크 (12 입력 중 1 중복 오인 방지)
- **onblur**: 텍스트 필드 벗어날 때 모든 길이에서 중복 체크
- 중복 시 빨간 테두리 + 경고 메시지 표시

#### UI/UX 변경사항
- **공유 배너 조건부 표시**: quota = 0일 때만 "친구에게 공유하기" 배너 표시
- **UI 순서 변경**: "오늘 남은 생성 횟수" → "로또 번호 생성하기" 버튼 순서로 변경
- **저장 아이콘 변경**: 체크마크 → 북마크 아이콘으로 통일

#### 기술적 변경사항
```javascript
// targetDraw를 포함한 저장 구조
function addToRecent(numbers) {
  const targetDraw = getNextDrawNumber();
  recent.unshift({ numbers, timestamp: Date.now(), targetDraw });
}

// 당첨 확인 시 targetDraw 필터링
function updateCheckUI() {
  const filteredSaved = saved.filter(item => item.targetDraw === winning.drawNumber);
}
```

### ✅ v2.0 업데이트 (2026-02-07) - 오늘의 운세 풀이 서비스

#### 오늘의 운세 풀이 서비스 추가
- **URL**: /dunsmile/daily-fortune/
- **서비스명**: "오늘의 운세 풀이"
- **테마 컬러**: 앰버/오렌지 그라데이션

#### 운세 분석 체계
- **별자리** (12개): 생월일 기반 서양 점성술
- **띠** (12지신): 생년 기반 동양 역학
- **사주** (천간·지지): 생년 기반 년주 계산
- **오행** (목화토금수): 천간 기반 원소 분석

#### 운세 카테고리 (5개)
- 총운 (30개 텍스트), 애정운 (20개), 금전운 (20개), 건강운 (15개), 직장/학업운 (20개)

#### 행운 요소
- 행운의 숫자 (2개), 아이템 (20종), 색상 (10종+의미), 방향 (8방위)
- 오늘의 조언 (20개)

#### 운세 생성 로직
- `사용자정보 + 오늘날짜` → 해시 → 텍스트 풀에서 결정적 선택
- 매일 자정 갱신 (날짜 변경으로 해시값 변동)
- 동일 사용자 + 동일 날짜 = 항상 동일 결과

#### UI/UX
- 3단계 플로우: 입력 → 로딩 애니메이션 → 결과
- 종합 점수 (0~100점) + 카테고리별 등급 (최고/좋음/보통)
- 캐러셀 카드 UI (관상 테스트 / 로또 번호 교차 퍼널)
- 하단 콘텐츠: FAQ, 서비스 설명 (AdSense 보강)

#### 가이드 페이지 (fe/public/dunsmile/daily-fortune/guide/)
- 12별자리 상세 해설 (원소, 수호성, 성격)
- 12띠 상세 해설 (오행, 지지, 성격)
- 사주팔자 기초 (천간 10개, 지지 12개)
- 오행 상생상극 해설
- 운세 활용 팁, FAQ

#### 데이터 구조
```javascript
{
  name: '홍길동',
  gender: 'male',
  birthYear: '1990',
  birthMonth: '03',
  birthDay: '15',
  date: '2026-02-07',
  zodiac: '물고기자리',
  chineseZodiac: '말띠',
  mainElement: '목(木)',
  overallScore: 85,
  createdAt: timestamp
}
```

### 🔄 진행 중
- Google AdSense 새 도메인(dopamine-factory.pages.dev) 등록 완료, 심사 대기 중
- Cloud Function으로 당첨 통계 자동 계산 (Firebase Blaze 요금제 필요)

## 🚨 AdSense 정책 대응 플랜

### 문제 진단
**정책 위반 유형**: "콘텐츠 없음" 또는 "얇은 콘텐츠"
- 현재 서비스가 기능 중심이라 텍스트 콘텐츠 부족
- Google은 "사용자에게 가치를 제공하는 읽을거리"를 요구함

### 해결 전략
**각 서비스마다 읽을거리 콘텐츠 추가**

| 서비스 | 추가할 콘텐츠 | 예상 분량 |
|--------|--------------|----------|
| HOXY NUMBER | 로또 가이드, 당첨 전략, FAQ | 3-5 페이지 |
| 관상 테스트 | 관상학 소개, 유명인 분석 사례 | 2-3 페이지 |
| 오늘의 운세 풀이 | 별자리/띠별 운세 해설 | 자동 생성 |
| 타로 카드 | 카드별 의미, 해석 가이드 | 5-10 페이지 |

### 필수 조건
1. **고유 콘텐츠**: 복사가 아닌 직접 작성한 글
2. **사용자 가치**: 정보성 + 재미 요소
3. **적절한 분량**: 페이지당 최소 500자 이상
4. **정기 업데이트**: 운세 등 날마다 새 콘텐츠

### 📋 다음 단계별 작업 계획

**Phase 1~2: 완료** ✅

**Phase 3: 콘텐츠 보강 (완료)** ✅
7. ✅ HOXY NUMBER 가이드 페이지 (fe/public/dunsmile/hoxy-number/guide/)
8. ✅ 관상 테스트 가이드 페이지 (fe/public/dunsmile/rich-face/guide/)
9. ✅ 오늘의 운세 풀이 가이드 페이지 (fe/public/dunsmile/daily-fortune/guide/)
10. ✅ 정책 페이지 (fe/public/dunsmile/about.html, privacy.html, terms.html)

**Phase 4: 서비스 확장**
11. ✅ **오늘의 운세 풀이** (dunsmile/daily-fortune/) - 별자리·띠·사주·오행 종합 운세
12. ⬜ **ONE DAY MY CARD** - 타로 카드 운세
    - 78장 타로 카드 데이터베이스
    - 카드별 상세 해석 콘텐츠

**Phase 5: 서비스 확장 (2순위)**
13. ⬜ **부자 DNA MBTI** - 재테크 성향 테스트
    - MBTI 16가지 유형별 해설
    - 투자 성향 분석 콘텐츠
14. ⬜ **부자 손금 테스트** - 손금 속 재물운
    - 손금 기초 가이드
    - 재물선 해석 콘텐츠

**Phase 6: 수익화**
15. 🔄 Google AdSense 새 도메인 등록 완료 (dopamine-factory.pages.dev), 심사 대기 중
16. ⬜ 실제 광고 연동
17. ⬜ 프리미엄 기능 검토

## 🔗 외부 연동
- **동행복권 API** (lotto-haru.kr): 당첨 번호 + 등수별 당첨금
  - 응답 구조: `win.win1~win5.payoutStr`
- **Google AdSense**: Publisher ID `ca-pub-7301223136166743` (새 도메인 등록 완료, 심사 대기 중)
- **GTM (Google Tag Manager)**:
  - 서비스 페이지: `GTM-TD8GQFFB`
  - 포털 페이지: `GTM-WX7LLGBZ`
- **Google Search Console**: dopamine-factory.pages.dev 등록 완료, 사이트맵 제출 완료

## 📱 반응형 브레이크포인트
- **모바일**: < 768px (max-w-md: 448px)
- **PC**: >= 768px (max-w-xl: 576px)

## 🎨 CSS 클래스 (등수별 스타일)
```css
.rank-1  /* 1등 - 금색, 반짝임 */
.rank-2  /* 2등 - 은색, 글로우 */
.rank-3  /* 3등 - 동색 */
.rank-4  /* 4등 - 초록 */
.rank-5  /* 5등 - 연초록 */
```

## 📊 winningData 구조
```javascript
{
  drawNumber: 1209,
  drawDate: '2026-01-31',
  numbers: [2, 17, 20, 35, 37, 39],
  bonus: 24,
  firstPrize: '1,371,910,466',
  prizes: {
    win1: '1,371,910,466',  // 1등 당첨금
    win2: '68,908,745',     // 2등 당첨금
    win3: '1,601,509',      // 3등 당첨금
    win4: '50,000',         // 4등 당첨금
    win5: '5,000'           // 5등 당첨금
  }
}
```
