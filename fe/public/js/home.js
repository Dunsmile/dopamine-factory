/* 도파민 공작소 홈 v3.2 */

const { loadServices } = window.HomeData || {};

const homeState = {
  services: [],
  category: 'all',
  keyword: '',
};

/* --- Utilities --- */
function sortByTrending(services) {
  return [...services].sort((a, b) => Number(b.trendingScore || 0) - Number(a.trendingScore || 0));
}

function sortByNewest(services) {
  return [...services].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* --- Component Renderers --- */

/**
 * 🛤️ [Dual Rails] Side-by-side New/Popular (PC only, stacks on Mobile)
 */
function renderDualRails(services) {
  const newRoot = document.getElementById('homeNewServicesRoot');
  const popularRoot = document.getElementById('homePopularServicesRoot');
  if (!newRoot || !popularRoot) return;

  const newest = sortByNewest(services).slice(0, 4);
  const popular = sortByTrending(services).slice(0, 4);

  const renderItem = (s) => `
    <a href="${escapeHtml(s.url)}" class="rail-item-small dds-spring">
      <img src="${escapeHtml(s.ogImage)}" class="rail-thumb-small" alt="" />
      <div class="rail-info">
        <strong class="title">${escapeHtml(s.name)}</strong>
        <p class="tag">#${s.tags[0] || '추천'}</p>
      </div>
    </a>
  `;

  newRoot.innerHTML = newest.map(renderItem).join('');
  popularRoot.innerHTML = popular.map(renderItem).join('');
}

/**
 * 🍱 [Laboh Grid] High Density 4x3 Grid
 */
function renderBentoGridV3(services) {
  const root = document.getElementById('homeBentoRootV3');
  if (!root) return;

  const filtered = homeState.category === 'all' 
    ? services 
    : services.filter(s => s.category === homeState.category);
    
  const displayList = sortByTrending(filtered).slice(0, 12);

  root.innerHTML = displayList.map(s => `
    <a href="${escapeHtml(s.url)}" class="premium-border-card dds-spring">
      <div class="thumb-wrap">
        <img src="${escapeHtml(s.ogImage)}" alt="" loading="lazy" />
      </div>
      <div class="info">
        <strong class="title">${escapeHtml(s.name)}</strong>
        <p class="desc">${escapeHtml(s.desc.substring(0, 25))}...</p>
      </div>
    </a>
  `).join('');
}

/**
 * 🎪 [Mesh Hero] Refined Hero
 */
function renderMeshHero(services) {
  const spotlightRoot = document.getElementById('homeHeroSpotlightRoot');
  if (!services.length) return;

  const top = sortByTrending(services)[0];
  
  if (spotlightRoot) {
    spotlightRoot.innerHTML = `
      <div class="hero-spotlight dds-glass">
        <span class="spotlight-label">PREMIUM PICK</span>
        <strong class="spotlight-title">${escapeHtml(top.name)}</strong>
      </div>
    `;
  }
}

/**
 * 📄 [Feed] Final Catalog
 */
function renderFeed(services) {
  const root = document.getElementById('homeFeedRoot');
  const countEl = document.getElementById('homeResultCount');
  if (!root) return;

  if (countEl) countEl.textContent = `${services.length} SERVICES FOUND`;

  root.innerHTML = services.map(s => `
    <a href="${escapeHtml(s.url)}" class="home-card-premium dds-spring">
      <div class="card-visual">
        <img src="${escapeHtml(s.ogImage)}" alt="" loading="lazy"/>
      </div>
      <div class="card-body">
        <h3 class="card-title">${escapeHtml(s.name)}</h3>
        <p class="card-desc">${escapeHtml(s.desc)}</p>
      </div>
    </a>
  `).join('');
}

/* --- Orchestration --- */

function updateUI() {
  const keyword = String(homeState.keyword || '').trim();
  const all = keyword
    ? homeState.services.filter((s) => {
        const text = [s.name, s.fullName, s.desc, ...(Array.isArray(s.tags) ? s.tags : [])]
          .join(' ')
          .toLowerCase();
        return text.includes(keyword);
      })
    : homeState.services;

  renderMeshHero(all);
  renderDualRails(all);
  renderBentoGridV3(all);
  renderFeed(all);
}

function bindEvents() {
  // Bento Tabs
  const tabs = document.querySelectorAll('.bento-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const next = String(tab.dataset.cat || 'all');
      homeState.category = next === 'mbti' ? 'fun' : next;
      renderBentoGridV3(homeState.services);
    });
  });

  // Search
  const search = document.getElementById('homeSearchInput');
  if (search) {
    search.addEventListener('input', (e) => {
      homeState.keyword = String(e.target.value || '').toLowerCase();
      updateUI();
    });
  }

  const sidebar = document.getElementById('serviceMenuSidebar');
  if (sidebar && typeof window.closeServiceMenu === 'function') {
    sidebar.addEventListener('click', (event) => {
      const target = event.target && event.target.closest('a');
      if (target) window.closeServiceMenu();
    });
  }
}

function renderSidebarServices(services) {
  const root = document.getElementById('serviceMenuGroups');
  if (!root) return;
  const top = sortByTrending(services).slice(0, 6);
  root.innerHTML = `
    <details class="dp-side-group" open>
      <summary class="dp-side-group-title"><span>🔥 인기 서비스</span><span class="dp-side-group-count">${top.length}</span></summary>
      <div class="dp-side-group-body">
        ${top.map((s) => `
          <a href="${escapeHtml(s.url)}" class="dp-menu-item" data-service-item="1" data-service-search="${escapeHtml(String(s.name || '').toLowerCase())}"><span>${escapeHtml(s.emoji || '✨')}</span><span>${escapeHtml(s.name)}</span></a>
        `).join('')}
      </div>
    </details>
  `;
}

async function initHome() {
  const services = typeof loadServices === 'function' ? await loadServices() : [];
  homeState.services = services;

  bindEvents();
  updateUI();
  renderSidebarServices(services);
}

document.addEventListener('DOMContentLoaded', initHome);
