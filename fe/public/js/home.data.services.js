/* 도파민 공작소 홈 데이터 - 서비스 목록 */
(function initHomeDataServices(global) {
  const parts = global.__HOME_DATA_PARTS || {};
  const types = parts.SERVICE_TYPES || {
    SINGLE_RESULT: 'single-result',
    MULTI_STEP: 'multi-step',
    BALANCE: 'balance',
    DAILY_CARD: 'daily-card',
    PREVIEW: 'preview',
  };

  const SERVICES = [
    { id: 'hoxy-number', name: 'HOXY', emoji: '🎱', url: '/dunsmile/hoxy-number/', desc: '무료 로또 번호 생성기 - 행운의 번호를 추천받고 당첨 확인까지', fullName: 'HOXY NUMBER', category: 'utility', type: types.SINGLE_RESULT },
    { id: 'rich-face', name: '부자상?', emoji: '👤', url: '/dunsmile/rich-face/', desc: 'AI 관상 분석으로 알아보는 나의 부자 확률', fullName: '부자가 될 상인가?', category: 'fortune', type: types.SINGLE_RESULT },
    { id: 'daily-fortune', name: '운세', emoji: '🔮', url: '/dunsmile/daily-fortune/', desc: '별자리, 띠, 사주로 보는 오늘의 종합 운세', fullName: '오늘의 운세', category: 'fortune', type: types.DAILY_CARD },
    { id: 'balance-game', name: '밸런스', emoji: '⚖️', url: '/dunsmile/balance-game/', desc: '두 선택 중 하나를 고르고, 전체 선택 비율을 확인해보세요', fullName: '오늘의 밸런스 게임', category: 'play', type: types.BALANCE },
    { id: 'name-compatibility', name: '이름궁합', emoji: '💞', url: '/dunsmile/name-compatibility/', desc: '두 이름을 입력하면 케미 점수와 궁합 키워드를 확인할 수 있어요', fullName: '이름 궁합 테스트', category: 'love', type: types.SINGLE_RESULT },
    { id: 'market-sentiment', name: '시장감성', emoji: '📈', url: '/dunsmile/market-sentiment/', desc: '펨코·디씨 게시글 기반 주식/코인 커뮤니티 감성 분석', fullName: '시장 감성 레이더', category: 'money', type: types.MULTI_STEP },
    { id: 'tarot-reading', name: '타로', emoji: '🃏', url: '/dunsmile/tarot-reading/', desc: '78장 타로 카드가 전하는 오늘의 메시지, 무료 타로 리딩', fullName: 'ONE DAY MY CARD', category: 'fortune', type: types.DAILY_CARD },
    { id: 'dopamine-lab', name: '실험실', emoji: '🧪', url: '/dunsmile/about/', desc: '신규 실험형 서비스를 가장 먼저 만나보는 프리뷰 라운지', fullName: '도파민 랩 프리뷰', category: 'lab', type: types.PREVIEW },
    { id: 'mbti-wealth-dna', name: 'DNA 부자력', emoji: '🧬', url: '/dunsmile/service-play/?service=mbti-wealth-dna', desc: '질문 흐름 기반으로 나의 자산 축적 성향과 소비 패턴을 분석합니다', fullName: '내 DNA 속 부자력', category: 'personality', type: types.MULTI_STEP },
    { id: 'past-life-mbti', name: '전생 MBTI', emoji: '🕰️', url: '/dunsmile/service-play/?service=past-life-mbti', desc: '전생 캐릭터 유형과 현재 성향을 연결해보는 스토리형 테스트', fullName: '전생 테스트 MBTI', category: 'personality', type: types.MULTI_STEP },
    { id: 'love-chat-style', name: '연애 대화톤', emoji: '💬', url: '/dunsmile/service-play/?service=love-chat-style', desc: '썸/연애 상황에서 자주 쓰는 말투와 반응 패턴을 진단합니다', fullName: '연애 대화톤 테스트', category: 'love', type: types.MULTI_STEP },
    { id: 'breakup-recovery', name: '이별 회복력', emoji: '🫶', url: '/dunsmile/service-play/?service=breakup-recovery', desc: '관계 회복 탄력성과 감정 정리 속도를 점검하는 심리 테스트', fullName: '이별 회복력 테스트', category: 'love', type: types.SINGLE_RESULT },
    { id: 'weekly-opportunity', name: '주간 기회', emoji: '📅', url: '/dunsmile/service-play/?service=weekly-opportunity', desc: '이번 주 집중해야 할 기회 포인트를 영역별로 안내합니다', fullName: '주간 기회 운세', category: 'fortune', type: types.DAILY_CARD },
    { id: 'monthly-money-fortune', name: '재물 운세', emoji: '💸', url: '/dunsmile/service-play/?service=monthly-money-fortune', desc: '월간 소비/수입 흐름을 바탕으로 재물 운을 해석합니다', fullName: '월간 재물 운세', category: 'fortune', type: types.DAILY_CARD },
    { id: 'balance-game-love', name: '연애 밸런스', emoji: '💕', url: '/dunsmile/service-play/?service=balance-game-love', desc: '연애 상황 중심 질문으로 취향 선택 데이터를 확인합니다', fullName: '밸런스 게임 연애편', category: 'play', type: types.BALANCE },
    { id: 'balance-game-work', name: '직장 밸런스', emoji: '🧑‍💼', url: '/dunsmile/service-play/?service=balance-game-work', desc: '직장/커리어 선택 질문으로 나의 우선순위를 점검합니다', fullName: '밸런스 게임 직장편', category: 'play', type: types.BALANCE },
    { id: 'habit-starter', name: '습관 스타터', emoji: '✅', url: '/dunsmile/service-play/?service=habit-starter', desc: '나에게 맞는 습관 시작 강도와 루틴 리듬을 추천합니다', fullName: '습관 스타터 테스트', category: 'utility', type: types.SINGLE_RESULT },
    { id: 'procrastination-type', name: '미루기 유형', emoji: '⏳', url: '/dunsmile/service-play/?service=procrastination-type', desc: '미루는 원인을 유형별로 분석하고 실행 팁을 제공합니다', fullName: '미루기 유형 진단', category: 'utility', type: types.MULTI_STEP },
    { id: 'spending-impulse', name: '충동구매', emoji: '🛍️', url: '/dunsmile/service-play/?service=spending-impulse', desc: '충동구매 트리거를 분석해 지출 패턴을 점검합니다', fullName: '충동구매 경보 테스트', category: 'money', type: types.MULTI_STEP },
    { id: 'side-hustle-fit', name: '부업 적합도', emoji: '📊', url: '/dunsmile/service-play/?service=side-hustle-fit', desc: '시간/성향/리스크 선호도를 바탕으로 부업 유형을 추천합니다', fullName: '부업 적합도 테스트', category: 'money', type: types.MULTI_STEP },
  ];

  global.__HOME_DATA_PARTS = {
    ...parts,
    SERVICES,
    FORTUNE_SERVICES: SERVICES.filter((service) => service.category === 'fortune'),
  };
})(window);
