/* 도파민 공작소 홈 - 라우팅/액션 */

function initRouting() {
  handleInitialRoute();
  window.addEventListener('popstate', handleInitialRoute);
}

function handleInitialRoute() {
  const playServiceId = parsePlayRoute();
  if (playServiceId) {
    openServiceIntro(playServiceId, { pushHistory: false });
    return;
  }
  const handled = handleViewParam();
  if (!handled) switchView('viewHome');
}

function initActionDelegates() {
  document.addEventListener('click', (event) => {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;
    const { action } = actionEl.dataset;
    if (!action) return;
    if (actionEl.tagName === 'A' || actionEl.tagName === 'BUTTON') event.preventDefault();

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
    if (action === 'open-service-intro') {
      const serviceId = actionEl.dataset.serviceId;
      if (!serviceId) return;
      if (typeof window.closeSearch === 'function') window.closeSearch();
      if (typeof window.closeSidebar === 'function') window.closeSidebar();
      openServiceIntro(serviceId, { pushHistory: true });
      return;
    }
    if (action === 'open-service-directory') {
      switchView('viewServices');
      renderServiceDirectory();
      return;
    }
    if (action === 'toggle-category-info') {
      const targetId = actionEl.dataset.target;
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target) return;
      const nextOpen = target.hasAttribute('hidden');
      if (nextOpen) target.removeAttribute('hidden');
      else target.setAttribute('hidden', 'hidden');
      actionEl.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
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
      showToast(actionEl.dataset.message || '준비 중입니다');
      return;
    }
    if (action === 'set-theme') {
      applyTheme(actionEl.dataset.theme === 'light' ? 'light' : 'dark');
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
