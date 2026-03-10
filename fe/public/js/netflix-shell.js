(function initNetflixShell(global) {
  const DEFAULT_CATEGORY_LABEL = '추천 서비스';

  function setupNav(nav) {
    if (!nav) return;

    const updateNav = () => {
      if (window.scrollY > 0) {
        nav.classList.remove('from-black/80', 'to-transparent');
        nav.classList.add('bg-[#141414]', 'shadow-md');
      } else {
        nav.classList.remove('bg-[#141414]', 'shadow-md');
        nav.classList.add('from-black/80', 'to-transparent');
      }
    };

    updateNav();
    window.addEventListener('scroll', updateNav, { passive: true });
  }

  function getCategoryMeta(categoryKey) {
    const meta = global.HomeData && global.HomeData.CATEGORY_META;
    return (meta && meta[categoryKey]) || null;
  }

  function getCategoryLabel(categoryKey) {
    const meta = getCategoryMeta(categoryKey);
    return meta ? meta.label : DEFAULT_CATEGORY_LABEL;
  }

  function getToneForService(service, fallbackTone) {
    const metaTone = getCategoryMeta(service.category || '')?.tone;
    if (metaTone) return metaTone;
    if (fallbackTone) return fallbackTone;

    const source = String(service.color || service.style?.color || '');
    if (source.includes('rose') || source.includes('red')) return 'rose';
    if (source.includes('blue') || source.includes('indigo')) return 'indigo';
    if (source.includes('green') || source.includes('emerald')) return 'emerald';
    if (source.includes('yellow') || source.includes('amber')) return 'amber';
    if (source.includes('purple') || source.includes('fuchsia')) return 'fuchsia';
    return 'zinc';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderPosterCard(service, options) {
    const {
      tone,
      badgeText,
      categoryLabel,
      subtitle,
      href,
      showTopBadge,
      asLink = false
    } = options;

    const wrapperTag = asLink ? 'a' : 'div';
    const hrefAttr = asLink ? ` href="${escapeHtml(href || service.url || '#')}"` : '';
    const icon = escapeHtml(service.emoji || service.style?.icon || '✨');
    const title = escapeHtml(service.fullName || service.title || service.name || service.id);
    const image = escapeHtml(service.ogImage || '/dunsmile/assets/og-image.png');

    return `
      <${wrapperTag} class="nflx-poster-wrap"${hrefAttr} data-service-id="${escapeHtml(service.id)}" ${!asLink ? `data-href="${escapeHtml(href || service.url || '#')}"` : ''}>
        <div class="nflx-poster nflx-poster--tone-${escapeHtml(tone)}">
          <img class="nflx-poster-thumb" src="${image}" alt="${title} 썸네일" loading="lazy" decoding="async">
          <div class="nflx-poster-overlay"></div>
          <div class="absolute top-2 left-2 flex gap-1 z-10">
            ${showTopBadge ? '<span class="nflx-top-badge text-white text-[8px] font-bold px-1 rounded shadow">TOP 10</span>' : ''}
            ${badgeText ? `<span class="bg-white/15 text-white text-[8px] font-bold px-1 rounded shadow">${escapeHtml(badgeText)}</span>` : ''}
          </div>
          <div class="nflx-poster-icon text-4xl md:text-6xl mb-2 z-10">${icon}</div>
          <h3 class="text-white font-bold text-lg md:text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,1)] tracking-tight leading-tight z-10 w-full px-2">${title}</h3>
          <div class="nflx-play-badge z-20">
            <svg class="w-6 h-6 ml-1 text-white fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
          <div class="nflx-poster-details z-20">
            <div class="flex items-center gap-2 text-[10px] font-bold text-white mb-1">
              <span class="nflx-accent-score">${escapeHtml(String(service.trendingScore || 90))}% 일치</span>
              <span class="border border-gray-400 px-1 text-gray-300 rounded">${escapeHtml(categoryLabel || DEFAULT_CATEGORY_LABEL)}</span>
            </div>
            <div class="flex flex-wrap gap-1">
              <span class="text-[9px] text-gray-300">${escapeHtml(subtitle || '')}</span>
            </div>
          </div>
        </div>
      </${wrapperTag}>
    `;
  }

  function renderRailSection(options) {
    const {
      title,
      services,
      railId,
      moreLabel,
      moreHref,
      tone,
      badgeResolver,
      subtitleResolver,
      hrefResolver,
      topBadgeResolver,
      asLinks = false
    } = options;
    const count = services.length;
    const label = escapeHtml(title || DEFAULT_CATEGORY_LABEL);
    const detailMarkup = moreHref
      ? `<a class="nflx-accent-link text-sm font-bold flex items-center" href="${escapeHtml(moreHref)}">${escapeHtml(moreLabel || '모두 보기')}<svg class="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg></a>`
      : `<span class="nflx-accent-link text-sm font-bold flex items-center">${escapeHtml(moreLabel || `${count}개 서비스`)}</span>`;

    return `
      <section class="w-full mb-8 relative group">
        <div class="px-[4vw] mb-2 flex items-baseline justify-between">
          <h2 class="text-xl md:text-2xl font-bold text-[#e5e5e5] flex items-center gap-2 md:gap-3 lg:gap-4">${label}</h2>
          ${detailMarkup}
        </div>
        <button class="nflx-rail-paddle nflx-rail-paddle--left" type="button" aria-label="${label} 이전 보기">
          <svg class="w-8 h-8 pointer-events-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button class="nflx-rail-paddle nflx-rail-paddle--right" type="button" aria-label="${label} 다음 보기">
          <svg class="w-8 h-8 pointer-events-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" /></svg>
        </button>
        <div class="nflx-rail scrollbar-hide" id="${escapeHtml(railId)}" data-rail-track>
          ${services.map((service, index) => renderPosterCard(service, {
            tone: getToneForService(service, tone),
            badgeText: badgeResolver ? badgeResolver(service, index) : '',
            categoryLabel: getCategoryLabel(service.category),
            subtitle: subtitleResolver ? subtitleResolver(service, index) : '',
            href: hrefResolver ? hrefResolver(service, index) : service.url,
            showTopBadge: topBadgeResolver ? topBadgeResolver(service, index) : false,
            asLink: asLinks
          })).join('')}
        </div>
      </section>
    `;
  }

  function bindRailInteractions(root) {
    const scope = root || document;
    const sections = Array.from(scope.querySelectorAll('.group'));

    sections.forEach((section) => {
      const railTrack = section.querySelector('[data-rail-track]');
      if (!railTrack || railTrack.dataset.bound === 'true') return;
      railTrack.dataset.bound = 'true';

      const left = section.querySelector('.nflx-rail-paddle--left');
      const right = section.querySelector('.nflx-rail-paddle--right');
      if (left) {
        left.addEventListener('click', () => {
          railTrack.scrollBy({ left: -window.innerWidth * 0.7, behavior: 'smooth' });
        });
      }
      if (right) {
        right.addEventListener('click', () => {
          railTrack.scrollBy({ left: window.innerWidth * 0.7, behavior: 'smooth' });
        });
      }

      Array.from(railTrack.children).forEach((posterWrap) => {
        let hoverTimer;
        const href = posterWrap.getAttribute('href');

        posterWrap.addEventListener('mouseenter', () => {
          hoverTimer = window.setTimeout(() => {
            posterWrap.classList.add('is-hovered');
            const posters = Array.from(railTrack.children);
            const hoverIndex = posters.indexOf(posterWrap);
            const railRect = railTrack.getBoundingClientRect();
            const hoverRect = posterWrap.getBoundingClientRect();
            const leftEdge = hoverIndex === 0 || hoverRect.left - railRect.left < 50;
            const rightEdge = hoverRect.right > railRect.right - 50;

            if (leftEdge) posterWrap.style.transformOrigin = 'left center';
            else if (rightEdge) posterWrap.style.transformOrigin = 'right center';
            else posterWrap.style.transformOrigin = 'center center';

            posters.forEach((poster, index) => {
              if (index === hoverIndex) return;
              if (leftEdge && index > hoverIndex) poster.style.transform = 'translate3d(35%, 0, 0)';
              if (rightEdge && index < hoverIndex) poster.style.transform = 'translate3d(-35%, 0, 0)';
              if (!leftEdge && !rightEdge) {
                if (index < hoverIndex) poster.style.transform = 'translate3d(-17.5%, 0, 0)';
                if (index > hoverIndex) poster.style.transform = 'translate3d(17.5%, 0, 0)';
              }
            });
          }, 400);
        });

        posterWrap.addEventListener('mouseleave', () => {
          window.clearTimeout(hoverTimer);
          posterWrap.classList.remove('is-hovered');
          posterWrap.style.transformOrigin = 'center center';
          Array.from(railTrack.children).forEach((poster) => {
            poster.style.transform = 'translate3d(0, 0, 0)';
          });
        });

        if (!href) {
          posterWrap.addEventListener('click', () => {
            const targetHref = posterWrap.dataset.href;
            if (targetHref) window.location.href = targetHref;
          });
        }
      });
    });
  }

  global.NetflixShell = {
    setupNav,
    getCategoryMeta,
    getCategoryLabel,
    getToneForService,
    renderRailSection,
    bindRailInteractions,
    escapeHtml
  };
})(window);
