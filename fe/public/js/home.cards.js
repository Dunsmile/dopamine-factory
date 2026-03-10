/* 도파민 공작소 홈 - 카드/카탈로그 렌더 유틸 */

function resolveServiceTone(service, toneByCategory = SERVICE_TONE_BY_CATEGORY) {
  return toneByCategory[service.category] || 'blue';
}

function renderServiceImage(service, toneByCategory, { loading = 'lazy', id = '' } = {}) {
  const idAttr = id ? ` id="${id}"` : '';
  const tone = resolveServiceTone(service, toneByCategory);
  return `<img${idAttr} src="${serviceBanner(service)}" data-fallback="${makeDummyArt(service.fullName, tone)}" alt="${service.fullName}" loading="${loading}">`;
}

function renderFavoriteToggle(serviceId, isFavorite) {
  return `<button type="button" class="nx-fav-btn ${isFavorite ? 'active' : ''}" data-action="toggle-favorite" data-service-id="${serviceId}" aria-label="${isFavorite ? 'MY에서 제거' : 'MY에 추가'}">${isFavorite ? '♥' : '♡'}</button>`;
}

function renderLatestItem(service, { isFavorite, toneByCategory }) {
  return `
    <a href="${buildPlayQueryHref(service.id)}" class="nx-latest-item" data-action="open-service-intro" data-service-id="${service.id}">
      <div class="nx-latest-thumb">
        ${renderServiceImage(service, toneByCategory)}
        ${renderFavoriteToggle(service.id, isFavorite)}
      </div>
      <div class="nx-latest-meta">
        <p>${service.fullName}</p>
        <span class="nx-latest-tags">${latestServiceTags(service).map((tag) => `#${tag}`).join(' ')}</span>
      </div>
    </a>
  `;
}

function renderCatalogItem(service, { isFavorite, toneByCategory }) {
  return `
    <a href="${buildPlayQueryHref(service.id)}" class="nx-service-card" data-action="open-service-intro" data-service-id="${service.id}" data-service-category="${service.category}">
      <div class="nx-service-thumb">
        ${renderServiceImage(service, toneByCategory)}
        <span class="nx-service-pill">${categoryPillLabel(service.category)}</span>
        ${renderFavoriteToggle(service.id, isFavorite)}
      </div>
      <div class="nx-service-body">
        <h3>${service.fullName}</h3>
        <p>${service.desc}</p>
      </div>
    </a>
  `;
}

function listCategoryOptions() {
  return (Array.isArray(SERVICE_CATEGORIES) ? SERVICE_CATEGORIES : [])
    .filter((item) => item.key !== 'all');
}

function getCatalogItemsByCategory(category) {
  if (category === 'all') return SERVICES.slice(0, 8);
  return SERVICES.filter((service) => service.category === category).slice(0, 8);
}

function renderCatalogGridMarkup(category, options) {
  const items = getCatalogItemsByCategory(category);
  if (!items.length) {
    return '<p class="nx-tab-empty">해당 카테고리 서비스가 아직 없습니다.</p>';
  }
  return items.map((service) => {
    const isFavorite = options.favorites.includes(service.id);
    return renderCatalogItem(service, { isFavorite, toneByCategory: options.toneByCategory });
  }).join('');
}

function enhanceHomeFeedMedia(root) {
  root.querySelectorAll('img').forEach((img) => {
    img.decoding = 'async';
    img.loading = img.loading || 'lazy';
    img.addEventListener('error', () => {
      if (img.dataset.fallbackApplied === '1') return;
      img.dataset.fallbackApplied = '1';
      img.src = img.dataset.fallback || makeDummyArt('DOPAMINE FACTORY', 'blue');
    }, { once: true });
  });
}
