/* 도파민 공작소 홈 - home.js */

const {
  SERVICES,
  FORTUNE_SERVICES,
  makeDummyArt,
  serviceBanner,
  categoryPillLabel,
  latestServiceTags,
} = window.HomeData || {};

const HERO_AUTOPLAY_MS = 5000;
let heroAutoplayTimer = null;
const SERVICE_TONE_BY_CATEGORY = {
  fortune: 'violet',
  finance: 'emerald',
  luck: 'amber',
  fun: 'blue',
};

function resolveServiceTone(service, toneByCategory = SERVICE_TONE_BY_CATEGORY) {
  return toneByCategory[service.category] || 'blue';
}

function renderServiceImage(service, toneByCategory, { loading = 'lazy', id = '' } = {}) {
  const idAttr = id ? ` id="${id}"` : '';
  const tone = resolveServiceTone(service, toneByCategory);
  return `<img${idAttr} src="${serviceBanner(service)}" data-fallback="${makeDummyArt(service.fullName, tone)}" alt="${service.fullName}" loading="${loading}">`;
}

function renderFavoriteToggle(serviceId, isFavorite) {
  return `<button type="button" class="nx-fav-btn ${isFavorite ? 'active' : ''}" data-action="toggle-favorite" data-service-id="${serviceId}" aria-label="${isFavorite ? 'MY에서 제거' : 'MY에 추가'}">${isFavorite ? '♥' : '♡'}</button>`;
}

function renderLatestItem(service, { isFavorite, toneByCategory }) {
  return `
    <a href="${service.url}" class="nx-latest-item">
      <div class="nx-latest-thumb">
        ${renderServiceImage(service, toneByCategory)}
        ${renderFavoriteToggle(service.id, isFavorite)}
      </div>
      <div class="nx-latest-meta">
        <p>${service.fullName}</p>
        <span class="nx-latest-tags">${latestServiceTags(service).map((tag) => `#${tag}`).join(' ')}</span>
      </div>
    </a>
  `;
}

function renderCatalogItem(service, { isFavorite, toneByCategory }) {
  return `
    <a href="${service.url}" class="nx-service-card" data-service-category="${service.category}">
      <div class="nx-service-thumb">
        ${renderServiceImage(service, toneByCategory)}
        <span class="nx-service-pill">${categoryPillLabel(service.category)}</span>
        ${renderFavoriteToggle(service.id, isFavorite)}
      </div>
      <div class="nx-service-body">
        <h3>${service.fullName}</h3>
        <p>${service.desc}</p>
      </div>
    </a>
  `;
}

function enhanceHomeFeedMedia(root) {
  root.querySelectorAll('img').forEach((img) => {
    img.decoding = 'async';
    img.loading = img.loading || 'lazy';
    img.addEventListener('error', () => {
      if (img.dataset.fallbackApplied === '1') return;
      img.dataset.fallbackApplied = '1';
      img.src = img.dataset.fallback || makeDummyArt('DOPAMINE FACTORY', 'blue');
    }, { once: true });
  });
}

function renderCompactHome() {
  const root = document.getElementById('homeFeedRoot');
  if (!root) return;
  const favorites = getFavorites();

  if (heroAutoplayTimer) {
    clearInterval(heroAutoplayTimer);
    heroAutoplayTimer = null;
  }

  const heroSlides = SERVICES.slice(0, 4);
  const hero = heroSlides[0];
  const heroStack = heroSlides.slice(1, 4);
  const latest = SERVICES.slice(0, 4);
  const categories = [
    { key: 'all', label: '전체' },
    { key: 'fortune', label: '운세' },
    { key: 'fun', label: '플레이' },
    { key: 'luck', label: '유틸' },
    { key: 'finance', label: '데이터' },
  ];
  const toneByCategory = SERVICE_TONE_BY_CATEGORY;

  root.innerHTML = `
    <section class="nx-home-shell">
      <div class="nx-home-wrap">
        <section class="nx-hero">
          <div class="nx-hero-copy">
            <p class="nx-eyebrow" id="heroEyebrow">DOPAMINE FACTORY</p>
            <h1 id="heroTitle">${hero.fullName}</h1>
            <p id="heroDesc" class="nx-hero-desc">${hero.desc}</p>
            <div class="nx-hero-cta">
              <a href="${hero.url}" id="heroStartBtn" class="nx-btn nx-btn-primary">시작하기</a>
            </div>
          </div>
          <div class="nx-hero-visual">
            <a href="${hero.url}" id="heroMainLink" class="nx-hero-main-card">
              ${renderServiceImage(hero, toneByCategory, { loading: 'eager', id: 'heroMainImage' })}
            </a>
            <div class="nx-hero-stack" id="heroStack">
              ${heroStack.map((s, i) => `
                <a href="${s.url}" class="nx-stack-card offset-${i}">
                  ${renderServiceImage(s, toneByCategory)}
                </a>
              `).join('')}
            </div>
          </div>
          <div class="nx-hero-progress nx-hero-progress-bottom" id="heroProgress" aria-label="메인 배너 페이지">
            ${heroSlides.map((s, i) => `
              <button type="button" class="nx-hero-progress-btn ${i === 0 ? 'active' : ''}" data-hero-index="${i}" aria-label="배너 ${i + 1}: ${s.fullName}">
                <span class="nx-hero-progress-bar"></span>
              </button>
            `).join('')}
          </div>
        </section>

        <section class="nx-latest">
          <div class="nx-section-head">
            <h2>◆ 새로 나왔어요!</h2>
          </div>
          <div class="nx-latest-grid">
            ${latest.map((s) => {
              const isFavorite = favorites.includes(s.id);
              return renderLatestItem(s, { isFavorite, toneByCategory });
            }).join('')}
          </div>
        </section>

        <section class="nx-highlight-bar">
          <div class="nx-highlight-text">지금 이 순간에도 ${SERVICES.length}개의 서비스를 플레이 중입니다.</div>
        </section>

        <section class="nx-catalog">
          <div class="nx-catalog-head">
            <div class="nx-filter-tabs" role="tablist" aria-label="서비스 카테고리 필터">
              ${categories.map((c, i) => `
                <button type="button" class="nx-filter-tab ${i === 0 ? 'active' : ''}" data-category="${c.key}" role="tab" aria-selected="${i === 0 ? 'true' : 'false'}">${c.label}</button>
              `).join('')}
            </div>
          </div>

          <div class="nx-service-grid">
            ${SERVICES.map((s) => {
              const isFavorite = favorites.includes(s.id);
              return renderCatalogItem(s, { isFavorite, toneByCategory });
            }).join('')}
          </div>

        </section>

        <section class="nx-cta-panel">
          <div>
            <h3>새로운 기능 제안이 있나요?</h3>
            <p>원하는 실험형 서비스를 남겨주세요. 도파민 랩에서 다음 스프린트로 반영합니다.</p>
          </div>
          <button class="nx-btn nx-btn-primary" type="button" data-action="show-toast" data-message="제안 폼은 준비 중입니다">아이디어 보내기</button>
        </section>
      </div>
    </section>
  `;

  const tabs = root.querySelectorAll('.nx-filter-tab');
  const cards = root.querySelectorAll('.nx-service-card');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const category = tab.dataset.category || 'all';
      tabs.forEach((button) => {
        const active = button === tab;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      cards.forEach((card) => {
        const match = category === 'all' || card.dataset.serviceCategory === category;
        card.classList.toggle('hidden-card', !match);
      });
    });
  });

  enhanceHomeFeedMedia(root);
  initHeroCarousel(root, heroSlides, toneByCategory);
}

function initHeroCarousel(root, heroSlides, toneByCategory) {
  const titleEl = root.querySelector('#heroTitle');
  const descEl = root.querySelector('#heroDesc');
  const startBtnEl = root.querySelector('#heroStartBtn');
  const mainLinkEl = root.querySelector('#heroMainLink');
  const mainImageEl = root.querySelector('#heroMainImage');
  const stackEl = root.querySelector('#heroStack');
  const progressButtons = Array.from(root.querySelectorAll('.nx-hero-progress-btn'));

  if (!titleEl || !descEl || !startBtnEl || !mainLinkEl || !mainImageEl || !stackEl || !progressButtons.length) return;

  let currentIndex = 0;

  const renderStack = (activeIndex) => {
    const stackSlides = heroSlides
      .map((slide, index) => ({ slide, index }))
      .filter((item) => item.index !== activeIndex)
      .slice(0, 3);

    stackEl.innerHTML = stackSlides.map((item, stackIndex) => `
      <a href="${item.slide.url}" class="nx-stack-card offset-${stackIndex}">
        ${renderServiceImage(item.slide, toneByCategory)}
      </a>
    `).join('');
  };

  const renderSlide = (index) => {
    const slide = heroSlides[index];
    if (!slide) return;

    currentIndex = index;
    titleEl.textContent = slide.fullName;
    descEl.textContent = slide.desc;
    startBtnEl.href = slide.url;
    mainLinkEl.href = slide.url;
    mainImageEl.src = serviceBanner(slide);
    mainImageEl.alt = slide.fullName;
    mainImageEl.dataset.fallback = makeDummyArt(slide.fullName, resolveServiceTone(slide, toneByCategory));
    renderStack(index);
    enhanceHomeFeedMedia(root);

    progressButtons.forEach((button, btnIndex) => {
      button.classList.remove('active');
      button.setAttribute('aria-current', 'false');
      if (btnIndex === index) {
        void button.offsetWidth;
        button.classList.add('active');
        button.setAttribute('aria-current', 'true');
      }
    });
  };

  const nextSlide = () => {
    const nextIndex = (currentIndex + 1) % heroSlides.length;
    renderSlide(nextIndex);
  };

  const restartAutoplay = () => {
    if (heroAutoplayTimer) clearInterval(heroAutoplayTimer);
    heroAutoplayTimer = setInterval(nextSlide, HERO_AUTOPLAY_MS);
  };

  progressButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextIndex = Number(button.dataset.heroIndex || '0');
      if (!Number.isFinite(nextIndex)) return;
      renderSlide(nextIndex);
      restartAutoplay();
    });
  });

  renderSlide(0);
  restartAutoplay();
}

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', initHome);

function initHome() {
  if (!SERVICES || !FORTUNE_SERVICES || !makeDummyArt || !serviceBanner || !categoryPillLabel || !latestServiceTags) {
    console.error('[home] HomeData module is not loaded.');
    return;
  }
  initThemeToggle();
  renderCompactHome();
  renderSidebar();
  initActionDelegates();
  initSearch();
  initGlobalHotkeys();
  initBottomNav();
  initSidebarToggle();
  handleViewParam();
  updateNavigationState('viewHome');
}

function initActionDelegates() {
  document.addEventListener('click', (event) => {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;

    const { action } = actionEl.dataset;
    if (!action) return;

    if (actionEl.tagName === 'A' || actionEl.tagName === 'BUTTON') {
      event.preventDefault();
    }

    if (action === 'open-search') {
      if (typeof window.openSearch === 'function') window.openSearch();
      return;
    }

    if (action === 'close-sidebar') {
      if (typeof window.closeSidebar === 'function') window.closeSidebar();
      return;
    }

    if (action === 'switch-view') {
      const viewId = actionEl.dataset.view;
      if (!viewId) return;
      switchView(viewId);
      if (viewId === 'viewHome') window.scrollTo({ top: 0, behavior: 'smooth' });
      if (viewId === 'viewFortune') showFortuneList();
      if (viewId === 'viewFavorites') showFavorites();
      if (viewId === 'viewProfile') showProfile();
      return;
    }

    if (action === 'sidebar-view') {
      const viewId = actionEl.dataset.view;
      if (!viewId) return;
      if (typeof window.closeSidebar === 'function') window.closeSidebar();
      switchView(viewId);
      if (viewId === 'viewFortune') showFortuneList();
      if (viewId === 'viewFavorites') showFavorites();
      if (viewId === 'viewProfile') showProfile();
      return;
    }

    if (action === 'open-search-close-sidebar') {
      if (typeof window.closeSidebar === 'function') window.closeSidebar();
      if (typeof window.openSearch === 'function') window.openSearch();
      return;
    }

    if (action === 'show-toast') {
      const message = actionEl.dataset.message || '준비 중입니다';
      showToast(message);
      return;
    }

    if (action === 'set-theme') {
      const theme = actionEl.dataset.theme === 'light' ? 'light' : 'dark';
      applyTheme(theme);
      return;
    }

    if (action === 'toggle-favorite') {
      const serviceId = actionEl.dataset.serviceId;
      if (!serviceId) return;
      event.stopPropagation();
      toggleFavorite(serviceId);
      return;
    }

    if (action === 'remove-favorite') {
      const serviceId = actionEl.dataset.serviceId;
      if (!serviceId) return;
      toggleFavorite(serviceId);
      showFavorites();
    }
  });
}

function initThemeToggle() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('dopamine_theme');
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  const initialTheme = savedTheme || (prefersLight ? 'light' : 'dark');

  applyTheme(initialTheme);

  if (!themeToggleBtn) return;
  themeToggleBtn.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
    applyTheme(nextTheme);
  });
}

function applyTheme(theme) {
  const isLight = theme === 'light';
  document.body.classList.toggle('light-theme', isLight);
  localStorage.setItem('dopamine_theme', isLight ? 'light' : 'dark');

  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    themeToggleBtn.textContent = isLight ? '다크' : '화이트';
    themeToggleBtn.setAttribute('aria-label', isLight ? '다크 모드 전환' : '화이트 모드 전환');
  }

  updateSidebarThemeState(isLight ? 'light' : 'dark');
}

function updateSidebarThemeState(theme) {
  document.querySelectorAll('.sidebar-theme-btn').forEach((btn) => {
    const active = btn.dataset.theme === theme;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

function updateNavigationState(viewId) {
  const navKeyMap = {
    viewHome: 'home',
    viewFortune: 'fortune',
    viewFavorites: 'my',
    viewProfile: 'profile',
  };
  const navKey = navKeyMap[viewId];
  if (!navKey) return;

  document.querySelectorAll('.top-nav-link').forEach((link) => {
    const isActive = link.dataset.navTarget === navKey;
    link.classList.toggle('active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  document.querySelectorAll('#bottomNav .nav-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.nav === navKey);
  });
}

// ===== URL 파라미터 뷰 전환 (?view=fortune 등) =====
function handleViewParam() {
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  if (!view) return;

  switch (view) {
    case 'fortune':
      switchView('viewFortune');
      showFortuneList();
      break;
    case 'my':
      switchView('viewFavorites');
      showFavorites();
      break;
    case 'search':
      window.openSearch();
      break;
    case 'profile':
      switchView('viewProfile');
      showProfile();
      break;
  }

  // view 파라미터만 제거하고 나머지는 유지
  params.delete('view');
  const query = params.toString();
  window.history.replaceState({}, '', query ? `/?${query}` : '/');
}

// ===== 사이드바 렌더링 =====
function buildSidebarHTML(isPC) {
  const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
  let html = '';
  const menuItem = (icon, label, attrs = '') =>
    `<a ${attrs} class="sidebar-menu-item"><span class="sidebar-item-icon">${icon}</span><span class="sidebar-item-label">${label}</span></a>`;

  // 네비게이션 (모바일 하단 네비와 동일)
  html += menuItem('🏠', '홈', 'href="/"');
  if (isPC) {
    html += menuItem('🔮', '운세', 'href="#" data-action="sidebar-view" data-view="viewFortune"');
    html += menuItem('♥', 'MY 관심', 'href="#" data-action="sidebar-view" data-view="viewFavorites"');
    html += menuItem('🔍', '검색', 'href="#" data-action="open-search-close-sidebar"');
    html += menuItem('👤', '프로필', 'href="#" data-action="sidebar-view" data-view="viewProfile"');
  }
  html += '<div class="sidebar-divider"></div>';

  // 서비스 리스트
  html += '<div class="sidebar-section-title">서비스</div>';
  SERVICES.forEach(s => {
    html += menuItem(s.emoji, s.fullName, `href="${s.url}"`);
  });

  html += '<div class="sidebar-divider"></div>';

  // 이벤트 / 공지사항 / 고객센터
  html += menuItem('🎉', '이벤트', 'href="#" data-action="show-toast" data-message="준비 중입니다"');
  html += menuItem('📢', '공지사항', 'href="#" data-action="show-toast" data-message="준비 중입니다"');
  html += menuItem('💬', '고객센터', 'href="#" data-action="show-toast" data-message="준비 중입니다"');

  // 테마 전환
  html += '<div class="sidebar-divider"></div>';
  html += '<div class="sidebar-theme-wrap">';
  html += '<p class="sidebar-theme-title">화면 모드</p>';
  html += '<div class="sidebar-theme-actions">';
  html += `<button type="button" class="sidebar-theme-btn ${currentTheme === 'dark' ? 'active' : ''}" data-action="set-theme" data-theme="dark">다크</button>`;
  html += `<button type="button" class="sidebar-theme-btn ${currentTheme === 'light' ? 'active' : ''}" data-action="set-theme" data-theme="light">화이트</button>`;
  html += '</div>';
  html += '</div>';

  // 하단 푸터 링크
  html += '<div class="sidebar-spacer"></div>';
  html += '<div class="sidebar-divider sidebar-divider-top"></div>';
  html += '<div class="sidebar-footer-links">';
  html += '<a href="/dunsmile/terms/" class="sidebar-footer-link">이용약관</a><span class="sidebar-footer-sep">|</span>';
  html += '<a href="/dunsmile/about/" class="sidebar-footer-link">서비스 소개</a><span class="sidebar-footer-sep">|</span>';
  html += '<a href="/dunsmile/privacy/" class="sidebar-footer-link">개인정보처리방침</a>';
  html += '<p class="sidebar-footer-meta">Dopamine Factory</p>';
  html += '</div>';

  return html;
}

function renderSidebar() {
  const el = document.getElementById('mobileSidebarNav');
  if (el) {
    el.innerHTML = buildSidebarHTML(true);
    const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    updateSidebarThemeState(currentTheme);
  }
}

// ===== 사이드바 토글 (모바일: 우측 슬라이드 / PC: 사이드바는 항상 보임이므로 토글 불필요) =====
function initSidebarToggle() {
  const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
  if (!sidebarToggleBtn) return;
  sidebarToggleBtn.addEventListener('click', () => {
    // PC에서는 사이드바가 항상 보이므로, 모바일에서만 열기
    openSidebar();
  });
}

function openSidebar() {
  const overlay = document.getElementById('mobileSidebarOverlay');
  const sidebar = document.getElementById('mobileSidebar');
  if (!overlay || !sidebar) return;
  overlay.classList.add('open');
  sidebar.classList.add('open');
}

window.closeSidebar = function() {
  const overlay = document.getElementById('mobileSidebarOverlay');
  const sidebar = document.getElementById('mobileSidebar');
  if (!overlay || !sidebar) return;
  overlay.classList.remove('open');
  sidebar.classList.remove('open');
};

// ===== 검색 =====
function initSearch() {
  const overlay = document.getElementById('searchOverlay');
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  const closeBtn = document.getElementById('searchCloseBtn');
  let activeResultIndex = -1;
  let lastFocusedElement = null;

  if (!overlay || !input || !results || !closeBtn) {
    window.openSearch = function() {};
    window.closeSearch = function() {};
    return;
  }

  function getOverlayFocusable() {
    return Array.from(overlay.querySelectorAll('a[href], button, input, [tabindex]:not([tabindex="-1"])'))
      .filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');
  }

  function trapOverlayFocus(event) {
    if (event.key !== 'Tab' || !overlay.classList.contains('open')) return;
    const focusables = getOverlayFocusable();
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  closeBtn.onclick = () => {
    window.closeSearch();
  };

  input.addEventListener('input', () => {
    renderSearchResults(input.value.trim());
  });

  input.addEventListener('keydown', (event) => {
    if (!overlay.classList.contains('open')) return;
    const links = getResultLinks();
    if (!links.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveResult(activeResultIndex + 1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveResult(activeResultIndex - 1);
      return;
    }

    if (event.key === 'Enter' && activeResultIndex >= 0) {
      event.preventDefault();
      links[activeResultIndex]?.click();
    }
  });

  results.addEventListener('mouseover', (event) => {
    const row = event.target.closest('[data-search-result-index]');
    if (!row) return;
    const index = Number(row.dataset.searchResultIndex);
    if (Number.isFinite(index)) setActiveResult(index, false);
  });

  function getResultLinks() {
    return Array.from(results.querySelectorAll('[data-search-result-index]'));
  }

  function setActiveResult(index, shouldScroll = true) {
    const links = getResultLinks();
    if (!links.length) {
      activeResultIndex = -1;
      return;
    }

    const len = links.length;
    activeResultIndex = ((index % len) + len) % len;

    links.forEach((link, i) => {
      const isActive = i === activeResultIndex;
      link.classList.toggle('is-active', isActive);
    });

    if (shouldScroll) {
      links[activeResultIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  function renderSearchResults(query) {
    const score = (service) => {
      const q = query.toLowerCase();
      if (!q) return 1;
      const n = service.name.toLowerCase();
      const f = service.fullName.toLowerCase();
      const d = service.desc.toLowerCase();
      if (f.startsWith(q) || n.startsWith(q)) return 100;
      if (f.includes(q) || n.includes(q)) return 70;
      if (d.includes(q)) return 40;
      return 0;
    };

    let filtered = SERVICES
      .map((s) => ({ ...s, _score: score(s) }))
      .filter((s) => (query ? s._score > 0 : true));

    filtered.sort((a, b) => b._score - a._score);
    let html = '';

    if (filtered.length === 0) {
      activeResultIndex = -1;
      results.innerHTML = `${html}<p class="search-empty">검색 결과가 없습니다</p>`;
      return;
    }

    html += `<div class="search-result-list">`;
    html += filtered.map((s, i) => `
      <a href="${s.url}" data-search-result-index="${i}" class="search-result-row">
        <span class="search-rank">${i + 1}</span>
        <div class="search-main">
          <div class="search-title">${s.fullName}</div>
          <div class="search-desc">${s.desc}</div>
        </div>
      </a>
    `).join('');
    html += `</div>`;

    results.innerHTML = html;
    setActiveResult(0, false);
  }

  // 전역 함수: 검색 열기
  window.openSearch = function() {
    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.classList.add('search-open');
    overlay.classList.add('open');
    input.value = '';
    input.focus();
    renderSearchResults('');
  };

  window.closeSearch = function() {
    overlay.classList.remove('open');
    document.body.classList.remove('search-open');
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  };

  overlay.addEventListener('keydown', trapOverlayFocus);
}

function initGlobalHotkeys() {
  document.addEventListener('keydown', (event) => {
    const activeTag = (document.activeElement?.tagName || '').toLowerCase();
    const isTypingContext = ['input', 'textarea', 'select'].includes(activeTag) || document.activeElement?.isContentEditable;
    const hasOpenSearch = document.getElementById('searchOverlay')?.classList.contains('open');

    if (event.key === 'Escape') {
      if (hasOpenSearch && typeof window.closeSearch === 'function') window.closeSearch();
      if (typeof window.closeSidebar === 'function') window.closeSidebar();
      return;
    }

    if (isTypingContext) return;

    const isSlashOpen = event.key === '/';
    const isCommandK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
    if (isSlashOpen || isCommandK) {
      event.preventDefault();
      if (typeof window.openSearch === 'function') window.openSearch();
    }
  });
}

// ===== 하단 네비바 =====
function initBottomNav() {
  const navItems = document.querySelectorAll('#bottomNav .nav-item');
  if (!navItems.length) return;

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const nav = item.dataset.nav;

      switch (nav) {
        case 'home':
          switchView('viewHome');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          break;
        case 'fortune':
          switchView('viewFortune');
          showFortuneList();
          break;
        case 'my':
          switchView('viewFavorites');
          showFavorites();
          break;
        case 'search':
          window.openSearch();
          return; // 검색은 오버레이이므로 탭 활성화 불필요
        case 'profile':
          switchView('viewProfile');
          showProfile();
          break;
      }

      // 활성 탭 업데이트
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

// ===== 뷰 전환 =====
function switchView(viewId) {
  const targetView = document.getElementById(viewId);
  if (!targetView) return;
  document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
  targetView.classList.add('active');
  updateNavigationState(viewId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.switchView = switchView;

function renderTabServiceCard(service, { removable = false } = {}) {
  return `
    <a href="${service.url}" class="nx-tab-card ${removable ? 'has-remove' : ''}">
      <div class="nx-tab-thumb">
        ${renderServiceImage(service, SERVICE_TONE_BY_CATEGORY)}
        <span class="nx-service-pill">${categoryPillLabel(service.category)}</span>
      </div>
      <div class="nx-tab-body">
        <h3>${service.fullName}</h3>
        <p>${service.desc}</p>
      </div>
      ${removable ? `<button type="button" class="nx-remove-btn" data-action="remove-favorite" data-service-id="${service.id}">관심 해제</button>` : ''}
    </a>
  `;
}

// ===== 운세 서비스 리스트 (하단탭 운세) =====
function showFortuneList() {
  const container = document.getElementById('fortuneList');
  if (!container) return;
  container.innerHTML = `
    <div class="nx-tab-grid">
      ${FORTUNE_SERVICES.map((s) => renderTabServiceCard(s)).join('')}
    </div>
  `;
  enhanceHomeFeedMedia(container);

  if (FORTUNE_SERVICES.length === 0) {
    container.innerHTML = '<p class="nx-tab-empty">운세 서비스가 준비 중입니다</p>';
  }
}
window.showFortuneList = showFortuneList;

// ===== 관심 서비스 (MY) =====
function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem('dopamine_favorites')) || [];
  } catch { return []; }
}

function saveFavorites(favs) {
  localStorage.setItem('dopamine_favorites', JSON.stringify(favs));
}

function toggleFavorite(serviceId) {
  let favs = getFavorites();
  if (favs.includes(serviceId)) {
    favs = favs.filter(f => f !== serviceId);
    showToast('관심 서비스에서 해제했습니다');
  } else {
    favs.push(serviceId);
    showToast('관심 서비스에 등록했습니다');
  }
  saveFavorites(favs);
  if (document.getElementById('viewHome')?.classList.contains('active')) {
    renderCompactHome();
  }
}
window.toggleFavorite = toggleFavorite;

function showFavorites() {
  const favs = getFavorites();
  const container = document.getElementById('favList');
  if (!container) return;

  if (favs.length === 0) {
    container.innerHTML = '<p class="nx-tab-empty">관심 서비스를 등록해보세요. 홈 카드에서 빠르게 추가할 수 있습니다.</p>';
    return;
  }

  const favServices = SERVICES.filter(s => favs.includes(s.id));
  container.innerHTML = `
    <div class="nx-tab-grid">
      ${favServices.map((s) => renderTabServiceCard(s, { removable: true })).join('')}
    </div>
  `;
  enhanceHomeFeedMedia(container);
}
window.showFavorites = showFavorites;

// ===== 프로필 =====
function showProfile() {
  const container = document.getElementById('profileContent');
  if (!container) return;

  const userName = localStorage.getItem('user_name') || localStorage.getItem('userName');
  const userBirth = localStorage.getItem('user_birth') || localStorage.getItem('userBirth');
  const fortuneData = localStorage.getItem('daily_fortune_user') || localStorage.getItem('dailyFortuneUser');

  let profileRows = '';

  if (userName || userBirth || fortuneData) {
    if (userName) profileRows += `<p class="nx-profile-row"><span>이름</span><strong>${userName}</strong></p>`;
    if (userBirth) profileRows += `<p class="nx-profile-row"><span>생년월일</span><strong>${userBirth}</strong></p>`;
    if (fortuneData) {
      try {
        const fd = JSON.parse(fortuneData);
        if (fd.name) profileRows += `<p class="nx-profile-row"><span>이름</span><strong>${fd.name}</strong></p>`;
        if (fd.birthDate) profileRows += `<p class="nx-profile-row"><span>생년월일</span><strong>${fd.birthDate}</strong></p>`;
        if (fd.zodiac) profileRows += `<p class="nx-profile-row"><span>별자리</span><strong>${fd.zodiac}</strong></p>`;
      } catch {}
    }
  } else {
    profileRows = '<p class="nx-profile-empty">저장된 정보가 없습니다.</p>';
  }

  const records = [];
  const lottoHistory = localStorage.getItem('lotto_history') || localStorage.getItem('lottoHistory');
  if (lottoHistory) {
    try {
      const arr = JSON.parse(lottoHistory);
      records.push(`🎱 HOXY NUMBER: ${Array.isArray(arr) ? arr.length : 0}회 생성`);
    } catch {}
  }
  const faceResult = localStorage.getItem('rich_face_result') || localStorage.getItem('richFaceResult');
  if (faceResult) records.push('👤 부자상 테스트: 이용 완료');
  const fortuneResult = localStorage.getItem('daily_fortune_result') || localStorage.getItem('dailyFortuneResult');
  if (fortuneResult) records.push('🔮 오늘의 운세: 이용 완료');
  const tarotResult = localStorage.getItem('tarot_result') || localStorage.getItem('tarotResult');
  if (tarotResult) records.push('🃏 타로 리딩: 이용 완료');

  const recordsHtml = records.length > 0
    ? `<ul class="nx-profile-records">${records.map((r) => `<li>${r}</li>`).join('')}</ul>`
    : '<p class="nx-profile-empty">아직 이용 기록이 없습니다.</p>';

  container.innerHTML = `
    <section class="nx-profile-grid">
      <article class="nx-profile-card">
        <h3>기본 정보</h3>
        ${profileRows}
      </article>
      <article class="nx-profile-card">
        <h3>서비스 이용 기록</h3>
        ${recordsHtml}
      </article>
    </section>
  `;
}
window.showProfile = showProfile;

// ===== 토스트 =====
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}
window.showToast = showToast;
