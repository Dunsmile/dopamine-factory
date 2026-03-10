(function initModuleLayout(global) {
  const SERVICE_LINKS = [
    { id: 'hoxy-number', icon: '🎱', label: 'HOXY NUMBER', href: '/dunsmile/hoxy-number/', category: 'luck', featuredRank: 1 },
    { id: 'rich-face', icon: '👤', label: '부자가 될 상인가?', href: '/dunsmile/rich-face/', category: 'fortune', featuredRank: 2 },
    { id: 'daily-fortune', icon: '🔮', label: '오늘의 운세', href: '/dunsmile/daily-fortune/', category: 'fortune', featuredRank: 3 },
    { id: 'balance-game', icon: '⚖️', label: '오늘의 밸런스 게임', href: '/dunsmile/balance-game/', category: 'fun', featuredRank: 4 },
    { id: 'name-compatibility', icon: '💞', label: '이름 궁합 테스트', href: '/dunsmile/name-compatibility/', category: 'fortune', featuredRank: 5 },
    { id: 'market-sentiment', icon: '📈', label: '시장 감성 레이더', href: '/dunsmile/market-sentiment/', category: 'finance', featuredRank: 6 },
    { id: 'tarot-reading', icon: '🃏', label: 'ONE DAY MY CARD', href: '/dunsmile/tarot-reading/', category: 'fortune', featuredRank: 7 }
  ];

  const CATEGORY_META = {
    fortune: { label: '운세/심리', icon: '🔮' },
    fun: { label: '놀이/테스트', icon: '🎯' },
    luck: { label: '행운/번호', icon: '🍀' },
    finance: { label: '시장/데이터', icon: '📈' },
    other: { label: '기타', icon: '🗂️' }
  };

  function renderMenuLink(service, activeId) {
    const activeClass = service.id === activeId ? ' active' : '';
    const searchText = `${service.label}`.toLowerCase();
    return `<a href="${service.href}" class="dp-menu-item${activeClass}" data-service-item="1" data-service-search="${searchText}"><span>${service.icon}</span><span>${service.label}</span></a>`;
  }

  function renderCategorySections(activeId) {
    const groups = new Map();
    SERVICE_LINKS.forEach((service) => {
      const key = service.category || 'other';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(service);
    });
    return [...groups.keys()].map((key) => {
      const meta = CATEGORY_META[key] || CATEGORY_META.other;
      const links = (groups.get(key) || []).map((service) => renderMenuLink(service, activeId)).join('');
      return `<details class="dp-side-group">
  <summary class="dp-side-group-title"><span>${meta.icon} ${meta.label}</span><span class="dp-side-group-count">${groups.get(key).length}</span></summary>
  <div class="dp-side-group-body">${links}</div>
</details>`;
    }).join('');
  }

  function renderShell(opts) {
    const themeClass = opts.themeClass || '';
    const heroEyebrow = opts.heroEyebrow || '';
    const heroTitle = opts.heroTitle || '';
    const mainContent = opts.mainContent || '';
    const actions = opts.actions || '';

    return `
      <div id="toast" class="toast"><span id="toastMessage"></span></div>

      <div class="svc-shell ${themeClass}">
        <div class="svc-shell-inner">
          <header class="svc-topbar">
            <div class="svc-topbar-row">
              <div class="svc-topbar-brand">
                <a href="/" class="dp-header-home">도파민 공작소</a><span class="dp-header-sep">›</span>
                <h1 class="svc-topbar-title">${opts.pageTitle || ''}</h1>
              </div>
              <div class="svc-topbar-actions">
                <button type="button" class="svc-icon-btn" onclick="openSettings()" aria-label="설정 열기">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </button>
                <button type="button" class="svc-icon-btn" onclick="openServiceMenu()" aria-label="서비스 메뉴 열기">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </header>

          <main class="svc-body">
            <section class="svc-hero">
              <p class="svc-hero-eyebrow">${heroEyebrow}</p>
              <h2 class="svc-hero-title">${heroTitle}</h2>
            </section>
            ${mainContent}
            <section class="svc-button-group">${actions}</section>
          </main>
        </div>
      </div>

      <div id="serviceMenuBackdrop" class="dp-sidebar-overlay" onclick="closeServiceMenu()"></div>
      <aside id="serviceMenuSidebar" class="dp-sidebar">
        <div class="p-4">
          <div class="flex items-center justify-between mb-4">
            <span class="text-base font-bold text-purple-600">도파민 공작소</span>
            <button onclick="closeServiceMenu()" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600">&times;</button>
          </div>
          <nav>
            <a href="/" class="dp-menu-item font-bold"><span>🏠</span><span>홈</span></a>
            <div class="dp-divider"></div>
            <div class="dp-side-search-wrap">
              <input id="serviceMenuSearch" type="search" class="dp-side-search" placeholder="서비스 검색" aria-label="서비스 검색">
              <div id="serviceMenuSearchEmpty" class="dp-side-search-empty">검색 결과가 없습니다.</div>
            </div>
      <div class="dp-section-title">전체 서비스</div>
            <div id="serviceMenuGroups">
              ${renderCategorySections(opts.activeServiceId)}
            </div>
            <div class="dp-divider"></div>
            <a href="/dunsmile/about/" class="dp-menu-item"><span>📋</span><span>서비스 소개</span></a>
            <a href="/dunsmile/privacy/" class="dp-menu-item"><span>🔒</span><span>개인정보처리방침</span></a>
            <a href="/dunsmile/terms/" class="dp-menu-item"><span>📜</span><span>이용약관</span></a>
          </nav>
        </div>
      </aside>

      <div id="settingsModal" class="modal-backdrop" onclick="if(event.target === this) closeSettings()">
        <div class="hoxy-settings-modal">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-900">설정</h3>
            <button onclick="closeSettings()" class="hoxy-settings-close-btn" aria-label="설정 닫기">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="space-y-2">
            <a href="/dunsmile/about/" class="svc-settings-link">서비스 소개</a>
            <a href="/dunsmile/privacy/" class="svc-settings-link">개인정보처리방침</a>
            <a href="/dunsmile/terms/" class="svc-settings-link">이용약관</a>
          </div>
        </div>
      </div>
    `;
  }

  global.DunsmileTemplate = {
    renderShell,
  };
})(window);
