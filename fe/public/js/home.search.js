/* 도파민 공작소 홈 - 검색 */

function initSearch() {
  const overlay = document.getElementById('searchOverlay');
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  const closeBtn = document.getElementById('searchCloseBtn');
  let activeResultIndex = -1;
  let lastFocusedElement = null;

  if (!overlay || !input || !results || !closeBtn) {
    window.openSearch = function openSearch() {};
    window.closeSearch = function closeSearch() {};
    return;
  }

  const getResultLinks = () => Array.from(results.querySelectorAll('[data-search-result-index]'));
  const getOverlayFocusable = () => Array.from(overlay.querySelectorAll('a[href], button, input, [tabindex]:not([tabindex="-1"])'))
    .filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');

  function setActiveResult(index, shouldScroll = true) {
    const links = getResultLinks();
    if (!links.length) {
      activeResultIndex = -1;
      return;
    }
    const len = links.length;
    activeResultIndex = ((index % len) + len) % len;
    links.forEach((link, i) => link.classList.toggle('is-active', i === activeResultIndex));
    if (shouldScroll) links[activeResultIndex].scrollIntoView({ block: 'nearest' });
  }

  function renderSearchResults(query) {
    const score = (service) => {
      const q = query.toLowerCase();
      if (!q) return 1;
      const name = service.name.toLowerCase();
      const fullName = service.fullName.toLowerCase();
      const desc = service.desc.toLowerCase();
      if (fullName.startsWith(q) || name.startsWith(q)) return 100;
      if (fullName.includes(q) || name.includes(q)) return 70;
      if (desc.includes(q)) return 40;
      return 0;
    };
    const filtered = SERVICES.map((s) => ({ ...s, _score: score(s) })).filter((s) => (query ? s._score > 0 : true)).sort((a, b) => b._score - a._score);
    if (!filtered.length) {
      activeResultIndex = -1;
      results.innerHTML = '<p class="search-empty">검색 결과가 없습니다</p>';
      return;
    }
    results.innerHTML = `<div class="search-result-list">${filtered.map((s, i) => `
      <a href="${buildPlayQueryHref(s.id)}" data-action="open-service-intro" data-service-id="${s.id}" data-search-result-index="${i}" class="search-result-row">
        <span class="search-rank">${i + 1}</span>
        <div class="search-main">
          <div class="search-title">${s.fullName}</div>
          <div class="search-desc">${s.desc}</div>
        </div>
      </a>`).join('')}</div>`;
    setActiveResult(0, false);
  }

  function trapOverlayFocus(event) {
    if (event.key !== 'Tab' || !overlay.classList.contains('open')) return;
    const focusables = getOverlayFocusable();
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  closeBtn.onclick = () => window.closeSearch();
  input.addEventListener('input', () => renderSearchResults(input.value.trim()));
  input.addEventListener('keydown', (event) => {
    if (!overlay.classList.contains('open')) return;
    const links = getResultLinks();
    if (!links.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveResult(activeResultIndex + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveResult(activeResultIndex - 1);
    } else if (event.key === 'Enter' && activeResultIndex >= 0) {
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

  window.openSearch = function openSearch() {
    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.classList.add('search-open');
    overlay.classList.add('open');
    input.value = '';
    input.focus();
    renderSearchResults('');
  };

  window.closeSearch = function closeSearch() {
    overlay.classList.remove('open');
    document.body.classList.remove('search-open');
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') lastFocusedElement.focus();
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
