/* 도파민 공작소 홈 데이터 - 조립 및 헬퍼 */
(function initHomeData(global) {
  const parts = global.__HOME_DATA_PARTS || {};
  const SERVICE_BANNERS = {
    'hoxy-number': '/assets/banners/banner-hoxy-number.svg',
    'rich-face': '/assets/banners/banner-rich-face.svg',
    'daily-fortune': '/assets/banners/banner-daily-fortune.svg',
    'balance-game': '/assets/banners/banner-balance-game.svg',
    'name-compatibility': '/assets/banners/banner-name-compatibility.svg',
    'market-sentiment': '/assets/banners/banner-market-sentiment.svg',
    'tarot-reading': '/assets/banners/banner-tarot-reading.svg',
    'dopamine-lab': '/assets/banners/banner-dopamine-lab.svg',
  };

  const SERVICE_START_META = {
    'hoxy-number': { author: '도파민 공작소', plays: '4.1만', duration: '약 1분', tags: ['유틸', '랜덤번호'] },
    'rich-face': { author: '도파민 공작소', plays: '3.6만', duration: '약 2분', tags: ['운세', 'AI관상'] },
    'daily-fortune': { author: '도파민 공작소', plays: '5.4만', duration: '약 1분', tags: ['운세', '오늘운세'] },
    'balance-game': { author: '도파민 공작소', plays: '2.8만', duration: '약 1분', tags: ['플레이', '밸런스'] },
    'name-compatibility': { author: '도파민 공작소', plays: '3.2만', duration: '약 2분', tags: ['운세', '이름궁합'] },
    'market-sentiment': { author: '도파민 공작소', plays: '1.2만', duration: '약 2분', tags: ['데이터', '시장감성'] },
    'tarot-reading': { author: '도파민 공작소', plays: '2.4만', duration: '약 2분', tags: ['운세', '타로'] },
    'dopamine-lab': { author: '도파민 랩', plays: '베타', duration: '약 1분', tags: ['플레이', '프리뷰'] },
    'mbti-wealth-dna': { author: '도파민 공작소', plays: '준비 중', duration: '약 2분', tags: ['심리', 'MBTI'] },
    'past-life-mbti': { author: '도파민 공작소', plays: '준비 중', duration: '약 2분', tags: ['심리', '전생'] },
    'love-chat-style': { author: '도파민 공작소', plays: '준비 중', duration: '약 2분', tags: ['연애', '대화톤'] },
    'breakup-recovery': { author: '도파민 공작소', plays: '준비 중', duration: '약 2분', tags: ['연애', '회복력'] },
    'weekly-opportunity': { author: '도파민 공작소', plays: '준비 중', duration: '약 1분', tags: ['운세', '주간'] },
    'monthly-money-fortune': { author: '도파민 공작소', plays: '준비 중', duration: '약 1분', tags: ['운세', '재물'] },
    'balance-game-love': { author: '도파민 공작소', plays: '준비 중', duration: '약 1분', tags: ['플레이', '연애편'] },
    'balance-game-work': { author: '도파민 공작소', plays: '준비 중', duration: '약 1분', tags: ['플레이', '직장편'] },
    'habit-starter': { author: '도파민 공작소', plays: '준비 중', duration: '약 2분', tags: ['유틸', '습관'] },
    'procrastination-type': { author: '도파민 공작소', plays: '준비 중', duration: '약 2분', tags: ['유틸', '생산성'] },
    'spending-impulse': { author: '도파민 공작소', plays: '준비 중', duration: '약 2분', tags: ['데이터', '소비'] },
    'side-hustle-fit': { author: '도파민 공작소', plays: '준비 중', duration: '약 2분', tags: ['데이터', '부업'] },
  };

  const DEFAULT_FAQ = [
    { q: '결과는 정확한 진단인가요?', a: '이 테스트는 재미와 자기 점검을 위한 콘텐츠이며, 참고용으로 활용해 주세요.' },
    { q: '데이터는 저장되나요?', a: '서비스 개선 목적의 비식별 사용 로그만 활용하며, 민감한 개인정보는 저장하지 않습니다.' },
  ];

  const SERVICE_CONTENT_GUIDES = {
    'hoxy-number': {
      policy: '로또 번호 생성 로직과 사용 흐름을 명확히 안내하고, 결과 화면에 추가 설명을 제공합니다.',
      updatedAt: '2026-02-18',
      faq: [
        { q: '생성된 번호는 당첨을 보장하나요?', a: '아니요. 무작위 추천 도구이며, 당첨 확률을 보장하지 않습니다.' },
        { q: '번호는 다시 생성할 수 있나요?', a: '네. 언제든지 재생성 가능하며 생성 이력도 확인할 수 있습니다.' },
      ],
    },
    'balance-game': {
      policy: '질문 문구를 점진적으로 확장하고, 중복/자극 문구를 주기적으로 정리합니다.',
      updatedAt: '2026-02-18',
      faq: [
        { q: '선택 비율은 어떻게 계산되나요?', a: '로컬 저장된 익명 투표 합산값을 기반으로 비율을 보여줍니다.' },
        { q: '질문 수는 몇 개인가요?', a: '현재 100문항이 반영되어 있으며, 품질 점검 후 추가 확장합니다.' },
      ],
    },
  };

  function makeDummyArt(title, tone = 'blue') {
    const palette = {
      blue: ['#0f172a', '#172554', '#2563eb'],
      violet: ['#180f2f', '#312e81', '#7c3aed'],
      emerald: ['#06231a', '#064e3b', '#10b981'],
      amber: ['#261507', '#78350f', '#f59e0b'],
    };
    const [base, mid, accent] = palette[tone] || palette.blue;
    const safeTitle = encodeURIComponent(title);
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 780'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='${encodeURIComponent(base)}'/%3E%3Cstop offset='55%25' stop-color='${encodeURIComponent(mid)}'/%3E%3Cstop offset='100%25' stop-color='${encodeURIComponent(accent)}'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='780' fill='url(%23g)'/%3E%3Ccircle cx='982' cy='92' r='180' fill='white' fill-opacity='0.09'/%3E%3Ccircle cx='260' cy='670' r='240' fill='white' fill-opacity='0.05'/%3E%3Ctext x='72' y='660' fill='white' fill-opacity='0.88' font-size='74' font-family='Pretendard, Noto Sans KR, sans-serif' font-weight='700'%3E${safeTitle}%3C/text%3E%3C/svg%3E`;
  }

  function serviceBanner(service) {
    return SERVICE_BANNERS[service.id] || '/assets/banners/banner-hoxy-number.svg';
  }

  function categoryPillLabel(category) {
    const map = { fortune: '운세', personality: '심리', money: '데이터', utility: '유틸', love: '연애', lab: '랩', play: '플레이' };
    return map[category] || '플레이';
  }

  function latestServiceTags(service) {
    const tags = {
      'hoxy-number': ['유틸', '랜덤번호'],
      'rich-face': ['운세', 'AI관상'],
      'daily-fortune': ['운세', '오늘운세'],
      'balance-game': ['플레이', '밸런스'],
      'name-compatibility': ['운세', '이름궁합'],
      'market-sentiment': ['데이터', '시장감성'],
      'tarot-reading': ['운세', '타로'],
      'dopamine-lab': ['플레이', '프리뷰'],
    };
    return tags[service.id] || [categoryPillLabel(service.category)];
  }

  function serviceStartMeta(service) {
    const meta = SERVICE_START_META[service.id] || {};
    return {
      author: meta.author || '도파민 공작소',
      plays: meta.plays || '신규',
      duration: meta.duration || '약 1분',
      tags: Array.isArray(meta.tags) && meta.tags.length ? meta.tags : latestServiceTags(service),
    };
  }

  function serviceContentGuide(service) {
    const guide = SERVICE_CONTENT_GUIDES[service.id] || {};
    return {
      policy: guide.policy || '각 서비스는 고유 설명, 결과 해설, 업데이트 이력을 포함하도록 운영합니다.',
      updatedAt: guide.updatedAt || '2026-02-18',
      faq: Array.isArray(guide.faq) && guide.faq.length ? guide.faq : DEFAULT_FAQ,
    };
  }

  global.HomeData = {
    ...parts,
    SERVICE_BANNERS,
    makeDummyArt,
    serviceBanner,
    serviceStartMeta,
    serviceContentGuide,
    categoryPillLabel,
    latestServiceTags,
  };
})(window);
