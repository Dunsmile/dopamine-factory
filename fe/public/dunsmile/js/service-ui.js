(function initServiceUi(global) {
  function pushDataLayer(payload) {
    global.dataLayer = global.dataLayer || [];
    global.dataLayer.push(payload);
  }

  function track(eventName, detail) {
    const root = document.querySelector('.svc-shell');
    const serviceId = (detail && detail.serviceId)
      || (root && root.dataset && root.dataset.serviceId)
      || 'unknown';
    pushDataLayer({
      event: 'dunsmile_event',
      eventName,
      serviceId,
      detail: detail || {},
      ts: Date.now(),
    });
  }

  function showToast(message, duration) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), Number(duration || 2000));
  }

  function openServiceMenu() {
    const backdrop = document.getElementById('serviceMenuBackdrop');
    const sidebar = document.getElementById('serviceMenuSidebar');
    if (backdrop && sidebar) {
      backdrop.classList.add('open');
      sidebar.classList.add('open');
    }
    bindSidebarSearch();
  }

  function closeServiceMenu() {
    const backdrop = document.getElementById('serviceMenuBackdrop');
    const sidebar = document.getElementById('serviceMenuSidebar');
    if (backdrop && sidebar) {
      backdrop.classList.remove('open');
      sidebar.classList.remove('open');
    }
  }

  function openSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) modal.classList.add('active');
  }

  function closeSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) modal.classList.remove('active');
  }

  function focusRelatedCarousel(options) {
    const opts = options || {};
    const selector = typeof opts.selector === 'string' && opts.selector
      ? opts.selector
      : '.svc-related-section';
    const container = document.querySelector(selector);
    if (!container) return false;

    const delay = Number(opts.delay || 120);
    setTimeout(() => {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      container.classList.add('is-attention');
      setTimeout(() => container.classList.remove('is-attention'), 900);
    }, delay);
    return true;
  }

  global.DunsmileUI = {
    showToast,
    openServiceMenu,
    closeServiceMenu,
    openSettings,
    closeSettings,
    focusRelatedCarousel,
    track,
  };

  global.openServiceMenu = openServiceMenu;
  global.closeServiceMenu = closeServiceMenu;
  global.openSettings = openSettings;
  global.closeSettings = closeSettings;
  global.trackServiceEvent = track;

  function bindSidebarSearch() {
    const input = document.getElementById('serviceMenuSearch');
    const groupsRoot = document.getElementById('serviceMenuGroups');
    if (!input || !groupsRoot || input.dataset.bound === '1') return;

    const emptyState = document.getElementById('serviceMenuSearchEmpty');
    const items = Array.from(groupsRoot.querySelectorAll('[data-service-item="1"]'));
    const groups = Array.from(groupsRoot.querySelectorAll('.dp-side-group'));
    const baseOrder = new Map(items.map((item, index) => [item, index]));

    function rankItem(item, keyword) {
      const text = String(item.getAttribute('data-service-search') || '');
      const exact = text === keyword ? 0 : 1;
      const starts = text.startsWith(keyword) ? 0 : 1;
      const matchIndex = text.indexOf(keyword);
      const indexScore = matchIndex === -1 ? Number.MAX_SAFE_INTEGER : matchIndex;
      return {
        exact,
        starts,
        indexScore,
        length: text.length,
        base: baseOrder.get(item) || 0,
      };
    }

    function applyFilter() {
      const keyword = String(input.value || '').trim().toLowerCase();
      let visibleCount = 0;

      items.forEach((item) => {
        const text = item.getAttribute('data-service-search') || '';
        const isVisible = keyword === '' || text.includes(keyword);
        item.classList.toggle('dp-side-hidden', !isVisible);
        if (isVisible) visibleCount += 1;
      });

      groups.forEach((group) => {
        const visibleItems = Array.from(group.querySelectorAll('[data-service-item="1"]:not(.dp-side-hidden)'));
        const hasVisible = visibleItems.length > 0;
        group.classList.toggle('dp-side-hidden', !hasVisible);
        if (!hasVisible) return;

        if (keyword !== '') {
          group.open = true;
          visibleItems
            .sort((a, b) => {
              const ra = rankItem(a, keyword);
              const rb = rankItem(b, keyword);
              if (ra.exact !== rb.exact) return ra.exact - rb.exact;
              if (ra.starts !== rb.starts) return ra.starts - rb.starts;
              if (ra.indexScore !== rb.indexScore) return ra.indexScore - rb.indexScore;
              if (ra.length !== rb.length) return ra.length - rb.length;
              return ra.base - rb.base;
            })
            .forEach((item) => item.parentNode.appendChild(item));
        } else {
          visibleItems
            .sort((a, b) => (baseOrder.get(a) || 0) - (baseOrder.get(b) || 0))
            .forEach((item) => item.parentNode.appendChild(item));
        }
      });

      if (emptyState) emptyState.classList.toggle('show', visibleCount === 0);
    }

    input.addEventListener('input', applyFilter);
    input.dataset.bound = '1';
    applyFilter();
  }

  document.addEventListener('click', (event) => {
    const target = event.target && event.target.closest('[data-analytics-event]');
    if (!target) return;
    track(String(target.getAttribute('data-analytics-event')), {
      source: target.tagName.toLowerCase(),
    });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => track('impression'));
  } else {
    track('impression');
  }
})(window);
