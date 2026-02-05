# HOXY 프로젝트 컨텍스트

## 프로젝트 개요
HOXY는 다양한 운세/행운 관련 서비스를 제공하는 플랫폼입니다.

## 서비스 목록
1. **HOXY NUMBER** - 로또 번호 생성기 (index.html)
2. **부자가 될 상인가?** - AI 관상 테스트 (face-test.html)
3. 준비 중 - 추후 공개
4. 준비 중 - 추후 공개

## 기술 스택
- **Frontend**: HTML, CSS (Tailwind CDN), Vanilla JavaScript
- **Storage**: LocalStorage + Firebase Firestore
- **Backend**: Firebase (Firestore Database)
- **Hosting**: Cloudflare Pages
  - Repository: https://github.com/Dunsmile/hoxy-number.git
  - Live URL: https://hoxy-number.pages.dev

## 주요 파일
- `index.html` - HOXY NUMBER (로또 번호 생성기)
- `face-test.html` - 관상 테스트 페이지
- `js/app.js` - 로또 앱 로직
- `js/face-test.js` - 관상 테스트 로직
- `css/style.css` - 공통 스타일

## 핵심 기능
1. **로또 번호 생성** - 1~45 중 6개 랜덤 생성
2. **일일 할당량 시스템** - 기본 10회/일, 광고 시청 시 +5회 추가
3. **연속 5회 뽑기** - 광고 시청으로 한 번에 5개 번호 생성
4. **슬롯 시스템** - 최근 생성 번호 저장 (기본 5슬롯, 광고로 +5 확장, 최대 50)
5. **번호 관리** - 저장 번호 페이지네이션 (페이지당 10개), 빈 슬롯 표시
6. **당첨 확인** - 1등~5등 당첨 등수 표시 + 실제 당첨금 표시
7. **오늘의 행운 번호** - 매일 자정 갱신, 광고 시청 후 공개
8. **스와이프 액션시트** - 좌측 스와이프 → iOS 스타일 액션시트 (저장/삭제 선택)
9. **당첨 회차 선택** - 최근 10회차 드롭다운 (Firestore 캐싱)
10. **당첨 보상 시스템** - 등수별 화려한 UI + 축하 팝업 + 실제 당첨금

## 코딩 스타일
- 한국어 주석 사용
- 함수명: camelCase
- 이모지 사용 (사용자 선호)
- 모바일 우선 반응형 디자인

## 최근 작업 이력
- ✅ Firebase 백엔드 통합 완료 (commit: 575f300)
- ✅ GitHub Pages 퍼블리싱 완료
- ✅ Git 저장소 초기화 및 설정 완료
- ✅ v1.2 UI/UX 대규모 개선 (2026-02-03)
- ✅ v1.3 버그 수정 및 기능 개선 (2026-02-03)
- ✅ v1.4 SEO 최적화 및 Google AdSense 연동 (2026-02-05)
- ✅ v1.5 관상 테스트 서비스 추가 (2026-02-05)

## Firebase 설정
- **Project ID**: hoxy-number
- **Auth Domain**: hoxy-number.firebaseapp.com
- **Database**: Firestore
- **Storage**: hoxy-number.firebasestorage.app

### Firestore 컬렉션
- `generated_numbers`: 사용자가 생성한 번호 저장
- `winning_numbers`: 당첨 번호 캐시 (회차별 당첨 정보 + 등수별 당첨금)
- `face_test_results`: 관상 테스트 결과 (이름, 성별, 생년월일, 결과해시)

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

## 디자인 특징
- 그라데이션 UI (생동감 있는 효과)
- 부드러운 애니메이션과 트랜지션
- 직관적이고 터치 친화적인 인터페이스
- 모달 최대 너비 480px로 최적화
- PC/모바일 반응형 레이아웃

## 프로젝트 정보
- **버전**: v1.5 (2026-02-05 관상 테스트 서비스 추가)
- **이전 버전**: v1.4, v1.3, v1.2, v1.1, v1.0
- **개발자**: 스티브 (UX/UI Designer & Developer)
- **연락처**: poilkjmnb122@gmail.com
- **라이센스**: MIT License

## 🎯 비즈니스 모델 & 수익화 전략

### 핵심 전략
**소셜 프루프 기반 사용자 유입 퍼널**
- 홈페이지에 "이 사이트에서 당첨자 X명 배출!" 카드 UI 표시
- 신규 방문자들이 실제 당첨 사례를 보고 신뢰하여 서비스 사용 유도
- 로또 → 사주/운세 서비스로 확장 예정

### 수익화 방식
1. **1단계 (현재)**: 완전 무료 + Google AdSense 광고
   - 사용자가 "광고 보기" 클릭 → 광고 시청 → 추가 기능 이용
   - 할당량 추가, 슬롯 확장, 연속 5회 뽑기, 행운 번호 공개
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
- 광고 시청 UI 구현 완료 (실제 광고 미연동)
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
- **URL**: /face-test.html
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

### 🔄 진행 중
- Google AdSense 승인 대기
- 당첨자 통계 계산 로직
- 홈페이지 당첨자 카드 UI

### 📋 다음 단계별 작업 계획

**Phase 1: 핵심 기능 완성** ✅ 완료
1. ✅ 동행복권 API 연동
2. ✅ SEO 최적화 및 메타 태그
3. ✅ Google AdSense 코드 연동

**Phase 2: 서비스 확장** ✅ 완료
4. ✅ 관상 테스트 서비스 추가
5. ✅ 서비스 메뉴 (햄버거 메뉴) 구현
6. ✅ 교차 홍보 배너

**Phase 3: 수익화 (진행 중)**
7. ⏳ Google AdSense 승인 대기
8. ⬜ 실제 광고 연동 및 보상 지급 로직
9. ⬜ 당첨자 통계 시스템

**Phase 4: 추가 서비스 (계획)**
10. ⬜ 새로운 운세 서비스 추가
11. ⬜ 통계 대시보드
12. ⬜ 프리미엄 기능

## 🔗 외부 API 연동
- **동행복권 API** (lotto-haru.kr): 당첨 번호 + 등수별 당첨금
  - 응답 구조: `win.win1~win5.payoutStr`
- **Google AdSense**: 광고 수익화 (미연동)

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
