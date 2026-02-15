
# 🏗️ 도파민 공작소 홈 리뉴얼 개발 의뢰서

## 1. 개요 (Overview)
*   **목표**: 기존 배너 슬라이더를 제거하고, 'Shopify Editions' 스타일의 **고급스러운 책장(Shelf) UI**로 전면 교체
*   **컨셉**: 디지털 매거진 / 프리미엄 편집샵 느낌의 3D 오브제 진열
*   **타겟 페이지**: `index.html` (메인 홈)

---

## 2. 레이아웃 변경 사항 (Structural Changes)

### 2-1. [삭제] 상단 배너 섹션 (Hero Section)
*   **대상**: `.home-banner-section` 및 내부 캐러셀 슬라이더 전체 삭제
*   **이유**: 모바일 친화적이지 않으며, 브랜드 이미지를 단순하게 만듦

### 2-2. [신설] 책장 섹션 (Shelf Hero)
*   **위치**: 최상단 헤더(GNB) 바로 아래
*   **구조 (HTML Structure)**:
    ```html
    <section class="shelf-hero">
      <div class="shelf-container">
        <!-- 헤드라인 -->
        <div class="shelf-header-text">
          <h1 class="shelf-main-title">Dopamine Editions</h1>
          <p class="shelf-sub-title">Every drop of joy tailored for you</p>
        </div>

        <!-- 책장 (Flex / Grid) -->
        <div class="the-shelf">
          <!-- 아이템 (Card) -->
          <a href="/service-url" class="shelf-item">
            <div class="shelf-item-cover">
              <img src="/path/to/og-image.png" alt="Service Name" class="shelf-img">
              <span class="shelf-info-badge">NEW</span>
            </div>
            <div class="shelf-item-title">서비스명</div>
          </a>
          <!-- ... 반복 ... -->
        </div>
      </div>
    </section>
    ```

---

## 3. 스타일 가이드 (CSS Specifications)

### 3-1. 섹션 디자인 (Section Style)
*   **배경**: `linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)`
*   **텍스처**: 배경에 은은한 **노이즈(Grain)** 필터 적용 (SVG 필터 사용 권장)
*   **여백**: 상단 60px, 하단 80px (모바일/PC 반응형 패딩 적용)

### 3-2. 책장 및 아이템 (Shelf & Items)
*   **책장 바닥(Shelf Base)**:
    *   `border-bottom: 12px solid #e5e7eb` (두께감 표현)
    *   `box-shadow`: 하단에 부드럽게 퍼지는 그림자 적용
*   **아이템 카드 (Card)**:
    *   **비율**: 1:1 정사각형 (Aspect Ratio 1/1)
    *   **크기**:
        *   Mobile: `140px` (가로 스크롤)
        *   Tablet: `180px`
        *   Desktop: `220px`
    *   **모서리**: `border-radius: 4px` (LP판 커버 느낌)
    *   **그림자**: 기본 상태에서도 약한 그림자(Elevation 1) 적용

### 3-3. 인터랙션 (Micro-interactions)
*   **Hover State (마우스 오버 시)**:
    *   **Lift Up**: `transform: translateY(-15px)` (공중부양 효과)
    *   **Shadow Drop**: `box-shadow`: 그림자가 더 진하고 넓게 퍼짐 (거리감 표현)
    *   **Scale Up**: `transform: scale(1.05)` (살짝 커짐)
    *   **Badge Reveal**: 숨겨져 있던 `NEW`, `HOT` 배지가 부드럽게 나타남 (`opacity: 1`)

---

## 4. 자산 (Assets)
*   **이미지 소스**: 각 서비스 폴더 내의 `og-image.png` (공유 이미지)를 공통으로 사용
    *   타로: `/dunsmile/tarot-reading/og-image.png` (우선 적용)
    *   로또/관상 등: 기존 배너 이미지를 크롭하거나 신규 생성 필요 (현재는 CSS 그라데이션으로 대체 가능)

## 5. 반응형 전략 (Responsive Strategy)
*   **Mobile (< 768px)**:
    *   책장 아이템들을 **가로 스크롤(Horizontal Scroll)**로 배치 (`overflow-x: auto`)
    *   스크롤 스냅(`scroll-snap-type: x mandatory`) 적용하여 한 장씩 딱딱 넘어가게 구현
*   **Desktop (>= 1024px)**:
    *   중앙 정렬된 **Flex/Grid** 레이아웃으로 한눈에 모든 카드가 보이도록 배치

---

## 6. 개발 주의사항
*   기존 `home-grid-section`(하단 아이콘 리스트)은 **삭제하지 말고 유지**할 것.
*   Tailwind CSS 클래스(`w-full`, `shadow-xl`, `hover:-translate-y-2`)를 적극 활용하여 커스텀 CSS 최소화 권장.
