/* 도파민 공작소 홈 데이터 - 카탈로그 메타 */
(function initHomeDataCatalog(global) {
  const parts = global.__HOME_DATA_PARTS || {};

  const SERVICE_TYPES = Object.freeze({
    SINGLE_RESULT: 'single-result',
    MULTI_STEP: 'multi-step',
    BALANCE: 'balance',
    DAILY_CARD: 'daily-card',
    PREVIEW: 'preview',
  });

  const SERVICE_CATEGORIES = Object.freeze([
    { key: 'all', label: '전체' },
    { key: 'personality', label: '심리' },
    { key: 'fortune', label: '운세' },
    { key: 'play', label: '플레이' },
    { key: 'utility', label: '유틸' },
    { key: 'money', label: '데이터' },
    { key: 'love', label: '연애' },
    { key: 'lab', label: '랩' },
  ]);

  const CATEGORY_CONTENT = {
    personality: {
      title: '심리/MBTI 카테고리 안내',
      body: '성향 테스트는 의학적 진단이 아닌 자기이해용 콘텐츠입니다. 질문 흐름을 통해 의사결정 스타일, 감정 처리 방식, 관계 패턴을 점검할 수 있도록 구성했습니다.',
      highlights: ['자기이해 중심 문항', '결과별 행동 가이드', '관련 테스트 추천 동선'],
    },
    fortune: {
      title: '운세 카테고리 안내',
      body: '운세/타로 콘텐츠는 재미와 루틴 정리를 위한 참고 정보입니다. 오늘 집중할 포인트를 짧고 명확하게 제시하고, 과도한 단정 표현을 피하도록 운영합니다.',
      highlights: ['일/주/월 단위 흐름', '과몰입 방지 문구 포함', '가벼운 해석 + 실행 팁'],
    },
    play: {
      title: '플레이 카테고리 안내',
      body: '밸런스/선택형 콘텐츠는 참여와 공유 경험에 초점을 둡니다. 현재 밸런스 게임은 100문항 풀을 제공하며, 중복되거나 품질이 낮은 항목은 주기적으로 교체합니다.',
      highlights: ['참여형 질문 구조', '문구 품질 점검 루틴', '결과 공유 지원'],
    },
    utility: {
      title: '유틸 카테고리 안내',
      body: '유틸 서비스는 즉시 사용할 수 있는 실용 기능을 목표로 합니다. 복잡한 설정 없이 빠르게 결과를 확인할 수 있도록 최소 단계 UX를 유지합니다.',
      highlights: ['짧은 입력 흐름', '명확한 결과 전달', '재사용 가능한 도구형 UI'],
    },
    money: {
      title: '데이터/머니 카테고리 안내',
      body: '소비/재테크 관련 테스트는 개인 판단 보조를 위한 참고 콘텐츠입니다. 투자 권유가 아닌 패턴 점검과 습관 개선 관점에서 설계했습니다.',
      highlights: ['리스크 고지 문구', '지출 패턴 진단', '실행 가능한 개선 팁'],
    },
    love: {
      title: '연애 카테고리 안내',
      body: '연애/관계 테스트는 대화 방식과 선호 차이를 확인하는 목적입니다. 관계의 정답을 제시하기보다 서로의 합의 포인트를 찾도록 돕습니다.',
      highlights: ['관계 대화 문항 중심', '갈등 완화 가이드', '연관 테스트 연결'],
    },
    lab: {
      title: '랩 카테고리 안내',
      body: '랩은 신규 실험형 서비스를 먼저 공개하는 영역입니다. 베타 상태의 아이디어를 빠르게 검증하고, 피드백을 바탕으로 정식 서비스로 전환합니다.',
      highlights: ['베타 우선 공개', '피드백 기반 개선', '정식 전환 후보 관리'],
    },
  };

  const CONTENT_UPDATE_LOG = [
    { date: '2026-02-18', text: '홈 공통 시작 포맷에 FAQ/가이드/업데이트 표기를 추가했습니다.' },
    { date: '2026-02-18', text: '신규 서비스 12종(총 20종) 데이터와 카테고리 체계를 정비했습니다.' },
    { date: '2026-02-18', text: '밸런스 게임 질문 풀을 100문항으로 확장하고 단계 확장(20→50→75→100)을 완료했습니다.' },
  ];

  global.__HOME_DATA_PARTS = {
    ...parts,
    SERVICE_TYPES,
    SERVICE_CATEGORIES,
    CATEGORY_CONTENT,
    CONTENT_UPDATE_LOG,
  };
})(window);
