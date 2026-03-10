/* 도파민 공작소 홈 - 테마/네비게이션 */

function initThemeToggle() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('dopamine_theme');
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  applyTheme(savedTheme || (prefersLight ? 'light' : 'dark'));
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
    viewServices: 'home',
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

function handleViewParam() {
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  if (!view) return false;

  let handled = true;
  if (view === 'fortune') {
    switchView('viewFortune');
    showFortuneList();
  } else if (view === 'my') {
    switchView('viewFavorites');
    showFavorites();
  } else if (view === 'search') {
    window.openSearch();
  } else if (view === 'profile') {
    switchView('viewProfile');
    showProfile();
  } else if (view === 'services') {
    switchView('viewServices');
    renderServiceDirectory();
  } else {
    handled = false;
  }

  params.delete('view');
  const query = params.toString();
  const basePath = window.location.pathname || '/';
  window.history.replaceState({}, '', query ? `${basePath}?${query}` : basePath);
  return handled;
}

function initBottomNav() {
  const navItems = document.querySelectorAll('#bottomNav .nav-item');
  if (!navItems.length) return;
  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const nav = item.dataset.nav;
      if (nav === 'home') {
        switchView('viewHome');
      } else if (nav === 'fortune') {
        switchView('viewFortune');
        showFortuneList();
      } else if (nav === 'my') {
        switchView('viewFavorites');
        showFavorites();
      } else if (nav === 'search') {
        window.openSearch();
        return;
      } else if (nav === 'profile') {
        switchView('viewProfile');
        showProfile();
      }
      navItems.forEach((n) => n.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

function switchView(viewId) {
  const targetView = document.getElementById(viewId);
  if (!targetView) return;
  document.querySelectorAll('.view-section').forEach((v) => v.classList.remove('active'));
  targetView.classList.add('active');
  if (viewId !== 'viewPlayIntro' && /^\/play\/[a-z0-9-]+\/?$/i.test(window.location.pathname || '')) {
    window.history.replaceState({}, '', '/');
  }
  if (viewId === 'viewServices') {
    if (window.location.search !== '?view=services') window.history.replaceState({ view: 'services' }, '', '/?view=services');
  } else if (window.location.search.includes('view=services')) {
    window.history.replaceState({}, '', '/');
  }
  updateNavigationState(viewId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.switchView = switchView;
