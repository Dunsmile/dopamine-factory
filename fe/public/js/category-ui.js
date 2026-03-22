(function initCategoryPage() {
  const CATEGORY_META = (window.HomeData && window.HomeData.CATEGORY_META) || {};
  const pageCategory = document.body.dataset.category || 'fortune';
  const heroTitle = document.getElementById('categoryHeroTitle');
  const heroSummary = document.getElementById('categoryHeroSummary');
  const heroCount = document.getElementById('categoryHeroCount');
  const heroRailLabel = document.getElementById('categoryRailLabel');
  const railsRoot = document.getElementById('categoryRails');
  const nav = document.getElementById('nflx-nav');
  const navLinks = document.querySelectorAll('[data-category-link]');

  if (!heroTitle || !heroSummary || !heroCount || !heroRailLabel || !railsRoot || !window.NetflixShell || !window.HomeData) return;

  window.NetflixShell.setupNav(nav);

  loadAndRender();

  async function loadAndRender() {
    const [services, siteSettings] = await Promise.all([
      window.HomeData.loadServices(),
      window.HomeData.loadSiteSettings()
    ]);
    const managedMeta = ((siteSettings.categories || {})[pageCategory]) || {};
    const meta = {
      ...(CATEGORY_META[pageCategory] || CATEGORY_META.fortune || {}),
      ...managedMeta
    };
    const filtered = services.filter((service) => service.category === pageCategory);

    document.title = `${meta.label} | 도파민 공작소`;
    heroTitle.textContent = meta.label;
    heroSummary.textContent = meta.summary;
    heroRailLabel.textContent = `${meta.label} 전체`;
    heroCount.textContent = `${filtered.length}개 서비스`;
    navLinks.forEach((link) => {
      if (link.getAttribute('data-category-link') === pageCategory) {
        link.classList.add('font-bold', 'text-white');
      }
    });

    if (filtered.length === 0) {
      railsRoot.innerHTML = '<div class="category-empty">이 카테고리에 등록된 서비스가 아직 없습니다.</div>';
      return;
    }

    railsRoot.innerHTML = window.NetflixShell.renderRailSection({
      title: meta.label,
      services: filtered,
      railId: 'categoryRailTrack',
      moreLabel: `${filtered.length}개 서비스`,
      tone: meta.tone,
      badgeResolver: (service) => service.estimatedDuration > 0 ? `${service.estimatedDuration}분` : '바로 시작',
      subtitleResolver: (service) => (service.tags || []).slice(0, 3).join(' · ') || meta.label,
      hrefResolver: (service) => service.url,
      asLinks: true
    });

    window.NetflixShell.bindRailInteractions(railsRoot);
  }
})();
