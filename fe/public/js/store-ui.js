/**
 * store-ui.js
 * SaaS App Directory 스타일의 홈 렌더링 및 필터링/인터랙션 로직
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. DOM Elements
  const els = {
    gridRoot: document.getElementById('serviceGridRoot'),
    emptyState: document.getElementById('emptyState'),
    categoryBtns: document.querySelectorAll('.sidebar-filter__btn'),
    searchInput: document.getElementById('searchInput'),
    searchForm: document.getElementById('searchForm'),
  };

  // 2. State
  let allServices = [];
  let currentFilter = 'all'; // category filter
  let currentQuery = '';     // search filter

  // 3. Initialize Data & Render
  try {
    // window.__HOME_DATA__ is populated by home.data.js
    if (window.__HOME_DATA__ && Array.isArray(window.__HOME_DATA__.services)) {
      // Sort by popularity (trendingScore or featuredRank fallback)
      allServices = [...window.__HOME_DATA__.services].sort((a, b) => {
        const scoreA = Number(a.trendingScore || 0);
        const scoreB = Number(b.trendingScore || 0);
        return scoreB - scoreA;
      });
      renderGrid();
    } else {
      console.warn('[store-ui] No service data found in __HOME_DATA__');
      els.gridRoot.innerHTML = ''; // Clear skeletons
    }
  } catch (error) {
    console.error('[store-ui] Error loading services:', error);
  }

  // 4. Event Listeners
  
  // Category Filtering
  els.categoryBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // Update Active UI
      els.categoryBtns.forEach(b => b.classList.remove('sidebar-filter__btn--active'));
      btn.classList.add('sidebar-filter__btn--active');
      
      // Update State & Render
      currentFilter = btn.dataset.filter || 'all';
      renderGrid();
    });
  });

  // Search Input Filtering
  if (els.searchInput) {
    els.searchInput.addEventListener('input', (e) => {
      currentQuery = e.target.value.trim().toLowerCase();
      renderGrid();
    });
  }

  // 5. Render Logic
  function renderGrid() {
    if (!els.gridRoot) return;

    // Filter data
    const filtered = allServices.filter(svc => {
      // 1) Category check
      const passCategory = currentFilter === 'all' || svc.category === currentFilter;
      // 2) Search check (title, desc, tags)
      const searchableStr = `${svc.fullName || ''} ${svc.name || ''} ${svc.desc || ''} ${(svc.tags || []).join(' ')}`.toLowerCase();
      const passSearch = currentQuery === '' || searchableStr.includes(currentQuery);
      
      return passCategory && passSearch && svc.homeVisible !== false;
    });

    // Update DOM
    if (filtered.length === 0) {
      els.gridRoot.innerHTML = '';
      if (els.emptyState) els.emptyState.classList.remove('hidden');
    } else {
      if (els.emptyState) els.emptyState.classList.add('hidden');
      els.gridRoot.innerHTML = filtered.map(svc => createCardHTML(svc)).join('');
      attachCardInteractions();
    }
  }

  function createCardHTML(svc) {
    const title = svc.fullName || svc.name || svc.id;
    const desc = svc.desc || '도파민 공작소 추천 콘텐츠';
    const emoji = svc.emoji || '✨';
    const route = svc.route || `/dunsmile/${svc.id}/`;
    
    // Tag map for friendly display
    const catMap = { 
      'fortune': '운세', 'luck': '행운', 'finance': '투자', 'fun': '심리', 'experimental': '실험' 
    };
    const catName = catMap[svc.category] || '일반';
    
    // Fake views for demo (in real app, use svc.socialProof)
    const views = Math.floor(Math.random() * 50) + 10;

    return `
      <article class="service-card group" data-service-id="${svc.id}">
        <div class="service-card__icon">${emoji}</div>
        <h3 class="service-card__title">${escapeHTML(title)}</h3>
        <p class="service-card__desc">${escapeHTML(desc)}</p>
        
        <div class="service-card__footer">
          <span class="service-card__tag">${catName}</span>
          <div class="service-card__stats">
            <span>🔥</span>
            <span>${views}k+</span>
          </div>
        </div>
        <!-- Full card click target -->
        <a href="${escapeHTML(route)}" class="absolute inset-0" aria-label="${escapeHTML(title)} 바로가기"></a>
      </article>
    `;
  }

  function attachCardInteractions() {
    const cards = document.querySelectorAll('.service-card');
    
    // Vanilla JS Zero-Runtime CSS variables interaction (Mouse Tracking Tilt)
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        // Calculate mouse position relative to card center (-1 to 1)
        const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        
        // Use CSS variables attached to inline style
        card.style.setProperty('--card-rotate-y', `${x * 4}deg`);
        card.style.setProperty('--card-rotate-x', `${y * -4}deg`);
        // Subtle glare effect based on cursor
        card.style.setProperty('--card-glare-x', `${(e.clientX - rect.left) / rect.width * 100}%`);
        card.style.setProperty('--card-glare-y', `${(e.clientY - rect.top) / rect.height * 100}%`);
      });

      card.addEventListener('mouseleave', () => {
        // Reset properties
        card.style.setProperty('--card-rotate-x', '0deg');
        card.style.setProperty('--card-rotate-y', '0deg');
        card.style.setProperty('--card-glare-x', '50%');
        card.style.setProperty('--card-glare-y', '50%');
      });
    });
  }

  // 6. Utils
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        }[tag] || tag)
    );
  }
});
