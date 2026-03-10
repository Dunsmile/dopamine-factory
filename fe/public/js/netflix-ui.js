document.addEventListener('DOMContentLoaded', async () => {
  const railsContainer = document.getElementById('nflx-rails');
  const heroContent = document.getElementById('hero-content');
  const nav = document.getElementById('nflx-nav');

  if (!railsContainer || !heroContent || !nav || !window.HomeData || !window.NetflixShell) return;

  window.NetflixShell.setupNav(nav);

  try {
    const allServices = await window.HomeData.loadServices();
    const grouped = groupByCategory(allServices, window.HomeData.CATEGORY_ORDER || []);
    const featured = pickFeaturedService(allServices);

    if (featured) updateHero(featured);
    renderRails(grouped);
    window.NetflixShell.bindRailInteractions(railsContainer);
  } catch (error) {
    console.error('Error loading services:', error);
    railsContainer.innerHTML = '<div class="text-center text-white p-10">서비스를 불러오는데 실패했습니다.</div>';
  }

  function pickFeaturedService(services) {
    return [...services].sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0))[0] || null;
  }

  function groupByCategory(services, order) {
    const bucket = new Map();
    order.forEach((category) => bucket.set(category, []));
    services.forEach((service) => {
      const key = service.category || 'fun';
      if (!bucket.has(key)) bucket.set(key, []);
      bucket.get(key).push(service);
    });
    return Array.from(bucket.entries()).filter(([, items]) => items.length > 0);
  }

  function updateHero(service) {
    const categoryLabel = window.NetflixShell.getCategoryLabel(service.category);
    const href = service.url || '#';
    const description = window.NetflixShell.escapeHtml(service.desc || '');
    const title = window.NetflixShell.escapeHtml(service.fullName || service.name || service.id);

    heroContent.innerHTML = `
      <div class="flex items-center gap-2 mb-2">
        <span class="nflx-accent-text text-sm font-bold tracking-widest drop-shadow-md">ORIGINAL</span>
      </div>
      <h2 class="nflx-hero-title text-4xl md:text-5xl lg:text-7xl font-black text-white mb-2 leading-tight drop-shadow-lg">${title}</h2>
      <div class="flex items-center gap-3 text-sm font-bold text-white mb-4 drop-shadow">
        <span class="nflx-accent-score font-bold">${service.trendingScore || 98}% 일치</span>
        <span class="border border-gray-400 bg-gray-600/50 px-1 rounded text-[10px] text-gray-200">${window.NetflixShell.escapeHtml(categoryLabel)}</span>
        <span class="text-gray-300">지금 화제</span>
      </div>
      <p class="nflx-copy-glow text-white text-base md:text-lg lg:text-xl font-medium leading-snug mb-6 max-w-xl pb-2">${description}</p>
      <div class="flex gap-3">
        <a href="${window.NetflixShell.escapeHtml(href)}" class="bg-white text-black px-6 py-2 md:px-8 md:py-3 rounded md:rounded-md font-bold text-base md:text-lg flex items-center justify-center gap-2 hover:bg-white/80 transition hover:scale-105 transform">
          <svg class="w-6 h-6 md:w-8 md:h-8 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          실행하기
        </a>
        <a href="/category/${window.NetflixShell.escapeHtml(service.category || 'fun')}/" class="bg-gray-500/60 text-white px-6 py-2 md:px-8 md:py-3 rounded md:rounded-md font-bold text-base md:text-lg flex items-center justify-center gap-2 hover:bg-gray-500/40 transition">
          <svg class="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          카테고리 보기
        </a>
      </div>
    `;
  }

  function renderRails(groupedCategories) {
    railsContainer.innerHTML = groupedCategories.map(([category, items], railIndex) => {
      return window.NetflixShell.renderRailSection({
        title: window.NetflixShell.getCategoryLabel(category),
        services: items,
        railId: `rail-${railIndex}`,
        moreLabel: '모두 보기',
        moreHref: `/category/${category}/`,
        topBadgeResolver: (_service, index) => index === 0,
        subtitleResolver: (service) => (service.tags || []).slice(0, 3).join(' · '),
        hrefResolver: (service) => service.url
      });
    }).join('');
  }
});
