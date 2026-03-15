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

  /* ══════════════════════════════════════════════════════
     동적 사이드바 빌더
     — services.manifest.json 에서 서비스 목록을 읽어
       #serviceMenuGroups 를 자동 생성합니다.
     — 서비스 추가/제거 시 manifest 한 곳만 수정하면 됩니다.
  ══════════════════════════════════════════════════════ */
  const SIDEBAR_CAT_META = {
    fortune:      { label: '🔮 운세/심리' },
    fun:          { label: '🎯 놀이/테스트' },
    luck:         { label: '🍀 행운/번호' },
    finance:      { label: '📈 시장/데이터' },
    experimental: { label: '🧪 실험실' },
  };
  const SIDEBAR_CAT_ORDER = ['fortune', 'fun', 'luck', 'finance', 'experimental'];
  // 홈에서 강제 제외된 서비스는 사이드바에도 노출하지 않음
  const SIDEBAR_BLOCKED   = ['market-sentiment'];

  function esc(val) {
    return String(val || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function buildSidebarHTML(services, currentServiceId) {
    const byCategory = {};
    services.forEach((s) => {
      const cat = s.category || 'fun';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(s);
    });

    return SIDEBAR_CAT_ORDER.map((cat) => {
      const items = byCategory[cat];
      if (!items || items.length === 0) return '';
      const meta   = SIDEBAR_CAT_META[cat] || { label: cat };
      const isOpen = items.some((s) => s.id === currentServiceId);
      const rows   = items.map((s) => {
        const active  = s.id === currentServiceId;
        const route   = s.route || `/dunsmile/${s.id}/`;
        const search  = `${s.fullName || s.name || s.id} ${(s.tags || []).join(' ')}`.toLowerCase();
        return `<a href="${esc(route)}" class="dp-menu-item${active ? ' active' : ''}" data-service-item="1" data-service-search="${esc(search)}"><span>${esc(s.emoji || '✨')}</span><span>${esc(s.fullName || s.name)}</span></a>`;
      }).join('');
      return `<details class="dp-side-group"${isOpen ? ' open' : ''}><summary class="dp-side-group-title"><span>${meta.label}</span><span class="dp-side-group-count">${items.length}</span></summary><div class="dp-side-group-body">${rows}</div></details>`;
    }).join('');
  }

  function initDynamicSidebar() {
    const groupsRoot = document.getElementById('serviceMenuGroups');
    // 이미 정적 콘텐츠가 있거나 data-static 속성이면 동적 빌드 건너뜀
    if (!groupsRoot || groupsRoot.dataset.static === '1') return;
    // 정적 링크가 하나라도 있으면 이미 하드코딩된 것으로 간주하고 건너뜀
    if (groupsRoot.querySelector('a[href]')) return;

    const shell         = document.querySelector('.svc-shell[data-service-id]');
    const currentSvcId  = shell ? (shell.dataset.serviceId || '') : '';

    fetch('/dunsmile/services.manifest.json', { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((payload) => {
        const services = (payload.services || []).filter((s) =>
          s && s.status !== 'disabled' && s.homeVisible !== false && !SIDEBAR_BLOCKED.includes(s.id)
        );
        groupsRoot.innerHTML = buildSidebarHTML(services, currentSvcId)
          || '<p style="padding:8px 12px;font-size:13px;color:#9ca3af;">서비스 목록을 불러올 수 없습니다.</p>';
        // 사이드바 검색 기능 재초기화
        bindSidebarSearch();
      })
      .catch(() => { /* 실패 시 기존 정적 콘텐츠 유지 */ });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { track('impression'); initDynamicSidebar(); });
  } else {
    track('impression');
    initDynamicSidebar();
  }
})(window);
