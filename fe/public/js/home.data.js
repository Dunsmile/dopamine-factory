/* 도파민 공작소 홈 - manifest-driven shared data */
(function initHomeData(global) {
  const HOME_MANIFEST_URL = '/dunsmile/services.manifest.json';
  const SITE_SETTINGS_URL = '/dunsmile/site-settings.json';
  const CATEGORY_META = {
    fortune: { label: '운세/사주', summary: '오늘의 운세, 타로, 궁합처럼 해석과 몰입이 중심인 서비스를 한 번에 탐색하세요.', tone: 'fuchsia' },
    fun: { label: '재미/밸런스', summary: '가볍게 시작해서 바로 결과를 확인할 수 있는 게임형 테스트를 모았습니다.', tone: 'rose' },
    luck: { label: '행운/번호', summary: '번호 추천과 행운 요소를 중심으로 빠르게 즐길 수 있는 서비스를 모았습니다.', tone: 'indigo' },
    finance: { label: '시장/데이터', summary: '시장 반응과 데이터 해석처럼 정보 탐색형 콘텐츠를 한곳에 모았습니다.', tone: 'emerald' },
    experimental: { label: '실험실', summary: '새로운 포맷과 실험적인 시도를 먼저 볼 수 있는 카테고리입니다.', tone: 'amber' }
  };
  const CATEGORY_ORDER = ['fortune', 'fun', 'luck', 'finance', 'experimental'];

  const FALLBACK_SERVICES = [
    { id: 'hoxy-number', name: 'HOXY', emoji: '🎱', url: '/dunsmile/hoxy-number/', desc: '무료 로또 번호 생성기 - 행운의 번호를 추천받고 당첨 확인까지', fullName: 'HOXY NUMBER', category: 'luck', estimatedDuration: 3, questionCount: 0, trendingScore: 97, tags: ['행운', '번호'], ogImage: '/dunsmile/assets/og-image.png' },
    { id: 'rich-face', name: '부자상?', emoji: '👤', url: '/dunsmile/rich-face/', desc: 'AI 관상 분석으로 알아보는 나의 부자 확률', fullName: '부자가 될 상인가?', category: 'fortune', estimatedDuration: 3, questionCount: 8, trendingScore: 95, tags: ['관상', '심리'], ogImage: '/dunsmile/assets/og-image.png' },
    { id: 'daily-fortune', name: '운세', emoji: '🔮', url: '/dunsmile/daily-fortune/', desc: '별자리, 띠, 사주로 보는 오늘의 종합 운세', fullName: '오늘의 운세', category: 'fortune', estimatedDuration: 3, questionCount: 6, trendingScore: 96, tags: ['운세', '오늘'], ogImage: '/dunsmile/assets/og-image.png' },
    { id: 'balance-game', name: '밸런스', emoji: '⚖️', url: '/dunsmile/balance-game/', desc: '두 선택 중 하나를 고르고, 전체 선택 비율을 확인해보세요', fullName: '오늘의 밸런스 게임', category: 'fun', estimatedDuration: 2, questionCount: 6, trendingScore: 90, tags: ['게임', '선택'], ogImage: '/dunsmile/assets/og-image.png' },
    { id: 'name-compatibility', name: '이름궁합', emoji: '💞', url: '/dunsmile/name-compatibility/', desc: '두 이름을 입력하면 케미 점수와 궁합 키워드를 확인할 수 있어요', fullName: '이름 궁합 테스트', category: 'fortune', estimatedDuration: 2, questionCount: 0, trendingScore: 91, tags: ['궁합', '이름'], ogImage: '/dunsmile/assets/og-image.png' },
    { id: 'market-sentiment', name: '시장감성', emoji: '📈', url: '/dunsmile/market-sentiment/', desc: '펨코·디씨 게시글 기반 주식/코인 커뮤니티 감성 분석', fullName: '시장 감성 레이더', category: 'finance', estimatedDuration: 2, questionCount: 0, trendingScore: 88, tags: ['시장', '데이터'], ogImage: '/dunsmile/assets/og-image.png' },
    { id: 'tarot-reading', name: '타로', emoji: '🃏', url: '/dunsmile/tarot-reading/', desc: '78장 타로 카드가 전하는 오늘의 메시지, 무료 타로 리딩', fullName: 'ONE DAY MY CARD', category: 'fortune', estimatedDuration: 3, questionCount: 5, trendingScore: 93, tags: ['타로', '리딩'], ogImage: '/dunsmile/assets/og-image.png' },
    { id: 'wealth-dna-test', name: '부자 DNA', emoji: '💰', url: '/dunsmile/wealth-dna-test/', desc: '내가 부자가 될 수 있을까? MBTI 기반 부자 DNA 테스트', fullName: '부자 DNA 테스트', category: 'fun', estimatedDuration: 4, questionCount: 8, trendingScore: 92, tags: ['MBTI', '자산성향'], ogImage: '/dunsmile/assets/og-image.png' }
  ];

  function normalizeService(raw) {
    const social = raw.socialProof || {};
    return {
      id: raw.id,
      name: raw.name,
      emoji: raw.emoji || '✨',
      url: raw.route || raw.url || '#',
      desc: raw.desc || '',
      fullName: raw.fullName || raw.name || raw.id,
      category: raw.category || 'fun',
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      questionCount: Number(raw.questionCount || 0),
      estimatedDuration: Number(raw.estimatedDuration || 0),
      trendingScore: Number(raw.trendingScore || 0),
      views: Number(social.views || raw.views || 0),
      likes: Number(social.likes || raw.likes || 0),
      ogImage: raw.ogImage || '/dunsmile/assets/og-image.png',
    };
  }

  async function loadServices() {
    // 1) Firestore 우선 (어드민 실시간 반영)
    try {
      const db = window.__db;
      if (db) {
        const snap = await db.collection('siteConfig').doc('services').get();
        if (snap.exists) {
          const data = snap.data();
          const items = Array.isArray(data.services) ? data.services : [];
          const activeHome = items
            .filter((s) => s && s.status !== 'disabled' && s.status !== 'trashed' && s.homeVisible !== false)
            .map(normalizeService);
          if (activeHome.length > 0) return activeHome;
        }
      }
    } catch (_e) { /* Firestore 실패 시 fallback */ }

    // 2) 정적 JSON fallback
    try {
      const response = await fetch(HOME_MANIFEST_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`manifest ${response.status}`);
      const payload = await response.json();
      const items = Array.isArray(payload.services) ? payload.services : [];
      const activeHome = items
        .filter((service) => service && service.status !== 'disabled' && service.status !== 'trashed' && service.homeVisible !== false)
        .map(normalizeService);
      if (activeHome.length > 0) return activeHome;
    } catch (_e) { /* ignore */ }

    return FALLBACK_SERVICES;
  }

  async function loadSiteSettings() {
    // 1) Firestore 우선
    try {
      const db = window.__db;
      if (db) {
        const snap = await db.collection('siteConfig').doc('settings').get();
        if (snap.exists) {
          const { updatedAt, ...rest } = snap.data();
          if (Object.keys(rest).length > 0) return rest;
        }
      }
    } catch (_e) { /* fallback */ }

    // 2) 정적 JSON fallback
    try {
      const response = await fetch(SITE_SETTINGS_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`site-settings ${response.status}`);
      const payload = await response.json();
      if (!payload || typeof payload !== 'object') return {};
      return payload;
    } catch (_e) {
      return {};
    }
  }

  global.HomeData = {
    loadServices,
    loadSiteSettings,
    FALLBACK_SERVICES,
    CATEGORY_META,
    CATEGORY_ORDER
  };
})(window);
