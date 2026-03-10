# 💎 도파민 공작소 v3.1: 프리미엄 디자인 시스템 & 홈 UI 스펙 (The Bible)

단순한 '예쁜 UI'를 넘어, 푸망과 방구석연구소의 성공 공식을 훔쳐와 **"클릭할 수밖에 없고 공유하고 싶어지는"** 압도적 수준의 디자인 시스템과 구현 명세를 작성합니다.

---

## 1. 디자인 시스템: Dopamine Design System (DDS) v3.1

전문가 수준의 디자인은 '규칙'에서 나옵니다. 모든 요소는 아래 토큰을 따릅니다.

### 🎨 (1) Color Palette (Emotional Logic)

메인 컬러는 유저의 도파민을 자극하되, 배경은 콘텐츠에 집중할 수 있도록 구성합니다.

| 분류             | 토큰명         | HSL / Hex               | 용도                                |
| :--------------- | :------------- | :---------------------- | :---------------------------------- |
| **Primary**      | `DDS-P-500`    | `#7C3AED`               | 브랜드 아이덴티티, 주요 CTA 버튼    |
| **Accent**       | `DDS-A-500`    | `#10B981`               | 신규/성공/긍정적 뱃지               |
| **Background**   | `DDS-BG-Main`  | `#F9FAFB`               | 사이트 전체 배경 (눈의 피로도 감소) |
| **Card BG**      | `DDS-BG-Glass` | `rgba(255,255,255,0.7)` | 유리 질감 콘텐츠 카드 배경          |
| **Text Primary** | `DDS-T-900`    | `#111827`               | 제목, 본문                          |
| **Deep Mesh**    | `DDS-Gradient` | `Linear-Mesh`           | Hero 섹션의 환상적 분위기 조성      |

### 🖋️ (2) Typography (Hierarchy of Information)

기본 시스템 폰트를 버리고 `Pretendard`를 고정 배포합니다.

- **Display (Hero Title)**: `Pretendard-Bold`, `32px`, `Line-height: 1.3`, `Letter-spacing: -0.02em`
- **Heading (Section Title)**: `Pretendard-SemiBold`, `20px`, `Line-height: 1.4`
- **Body (Card Desc)**: `Pretendard-Medium`, `14px`, `Text-Gray-600`
- **Label (Badge)**: `Pretendard-Bold`, `11px`, `Uppercase`

### 📐 (3) Layout Scale (The 4px Grid)

- **Container**: Mobile Max `480px`, Desktop Max `1200px` (Center align)
- **Radius**: `Extra-Premium`: `28px` (카드), `Standard`: `12px` (버튼)
- **Shadow**: `DDS-Shadow-Floating`: `0 20px 50px -12px rgba(0,0,0,0.08)`

---

## 2. 시각적 언어 (Visual Language) & 스킬

### 🧬 (1) Mesh Gradients (움직이는 배경)

배경이 단순히 멈춰있지 않고 은은하게 순환하는 미적 효과를 줍니다.

```css
/* CSS Houdini 또는 CSS 애니메이션 활용 */
.hero-mesh {
  background-color: #7c3aed;
  background-image:
    radial-gradient(at 0% 0%, hsla(253, 16%, 7%, 1) 0, transparent 50%),
    radial-gradient(at 50% 0%, hsla(225, 39%, 30%, 1) 0, transparent 50%),
    radial-gradient(at 100% 0%, hsla(339, 49%, 30%, 1) 0, transparent 50%);
  filter: blur(80px);
  animation: mesh-move 20s infinite alternate;
}
@keyframes mesh-move {
  from {
    transform: scale(1) translate(0, 0);
  }
  to {
    transform: scale(1.2) translate(5%, 5%);
  }
}
```

### 🪟 (2) Premium Glassmorphism

단순한 반투명색이 아닌, 테두리와 블러의 조화입니다.

```css
.premium-card {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
}
```

---

## 3. 홈 화면 컴포넌트 아키텍처 (Blueprint)

### 🎪 (1) Dynamic Hero Banner

- **기능**: 서비스 접속 시 가장 큰 면적 차지. "오늘의 픽" 노출.
- **디자인**: 좌측 텍스트(핵심 카피), 우측 3D 스타일 이미지 또는 캐릭터 일러스트.
- **애니메이션**: 스크롤 시 배너 내부 요소들의 시차(Parallax) 효과.

### 📱 (2) Advanced Bottom Navigation (Mobile Only)

사용자의 엄지손가락이 닿는 곳에 핵심 기능을 배치합니다.

- **아이콘**: 일반 선형 아이콘이 아닌, 활성화 시 **색상이 채워지며 통통 튀는** 애니메이션 아이콘.
- **Blur Path**: 하단 바 뒤로 배경이 비쳐 보이게 처리.

### 🍱 (3) Bento Grid & Horizontal Curation

100개 서비스를 넷플릭스처럼 분류합니다.

- **인기 순위(Ranking Labels)**: 1, 2, 3 숫자를 카드 모서리에 크게/고급스럽게 노출.
- **Tied-up Groups**: "썸 타는 중이라면?", "직장 상사랑 싸웠을 때" 등 상황별 그룹핑.

---

## 4. 심리적 UX 트리거 (Psychological Triggers)

레퍼런스들이 유저를 가둬둠(Retention) 방식입니다.

1.  **FOMO (Fear Of Missing Out)**:
    - "지금 이 테스트에 [231]명이 참여하고 있어요" (실시간 카운터).
    - "오늘만 무료 공개" 또는 "한정판 결과 카드" 문구 사용.
2.  **Instant Reward (즉각적 보상)**:
    - 테스트 시작 버튼에 은은한 **'빛나는(Glow)'** 효과를 주어 클릭 욕구 자극.
3.  **Viral Loop**:
    - 결과 페이지 하단에 **"인스타그램 스토리용 이미지 다운로드"** 버튼을 디자인적으로 매우 강조.

---

## 5. 기술적 구현 및 협업 가이드 (Code Strategy)

1.  **Tailwind Config 고도화**: 모든 디자인 토큰을 `tailwind.config.js`에 주입하여 일관성 유지.
2.  **Component Driven Development (CDD)**: `render-shell.js`에서 각 조각을 독립된 함수(또는 파일)로 관리.
3.  **Lottie & Framer Motion**: 고퀄리티 애니메이션을 위해 가벼운 Lottie 파일이나 Framer Motion(또는 바닐라 JS 최적화 모션) 도입.

---

### 📝 결론: 우리가 나아갈 방향

**"현재의 디자인은 '기능'을 보여주고 있지만, v3.1 디자인은 '감정'을 팝니다."**

이 리포트에 담긴 모든 수치는 단순한 예시가 아니라, 100만 유저 급 서비스들이 사용하는 **황금비율**입니다. 이제 이 설계도('The Bible')를 바탕으로 홈 화면의 첫 번째 조각인 **"프리미엄 메쉬 그라데이션 Hero 배너"**부터 코딩을 집도할까요? 🛠️💎
