const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname);
const PARTIAL_DIR = path.join(ROOT, 'partials');
const MANIFEST_PATH = path.join(ROOT, '..', 'data', 'services.manifest.json');
const RELATED_SERVICES_PATH = path.join(ROOT, '..', 'data', 'related-services.json');
const SITE_SETTINGS_PATH = path.join(ROOT, '..', 'data', 'site-settings.json');
const SHELL_UI_PATH = path.join(ROOT, '..', 'data', 'shell-ui.json');

const HEADER_PARTIAL = fs.readFileSync(path.join(PARTIAL_DIR, 'header.html'), 'utf8');
const SIDEBAR_PARTIAL = fs.readFileSync(path.join(PARTIAL_DIR, 'sidebar.html'), 'utf8');
const SETTINGS_PARTIAL = fs.readFileSync(path.join(PARTIAL_DIR, 'settings-modal.html'), 'utf8');
const RELATED_CARD_PARTIAL = fs.readFileSync(path.join(PARTIAL_DIR, 'related-card.html'), 'utf8');
const RELATED_CAROUSEL_PARTIAL = fs.readFileSync(path.join(PARTIAL_DIR, 'related-carousel.html'), 'utf8');
const CAROUSEL_ARROW_ICON = fs.readFileSync(path.join(PARTIAL_DIR, 'carousel-arrow-icon.html'), 'utf8').trim();

const DEFAULT_SHELL_UI = {
  fallbackServiceLinks: [
    { id: 'hoxy-number', icon: '🎱', label: 'HOXY NUMBER', href: '/dunsmile/hoxy-number/', category: 'luck' },
    { id: 'rich-face', icon: '👤', label: '부자가 될 상인가?', href: '/dunsmile/rich-face/', category: 'fortune' },
    { id: 'daily-fortune', icon: '🔮', label: '오늘의 운세', href: '/dunsmile/daily-fortune/', category: 'fortune' },
    { id: 'balance-game', icon: '⚖️', label: '오늘의 밸런스 게임', href: '/dunsmile/balance-game/', category: 'fun' },
    { id: 'name-compatibility', icon: '💞', label: '이름 궁합 테스트', href: '/dunsmile/name-compatibility/', category: 'fortune' },
    { id: 'market-sentiment', icon: '📈', label: '시장 감성 레이더', href: '/dunsmile/market-sentiment/', category: 'finance' },
    { id: 'tarot-reading', icon: '🃏', label: 'ONE DAY MY CARD', href: '/dunsmile/tarot-reading/', category: 'fortune' },
  ],
  categoryMeta: {
    fortune: { label: '운세/심리', icon: '🔮' },
    fun: { label: '놀이/테스트', icon: '🎯' },
    luck: { label: '행운/번호', icon: '🍀' },
    finance: { label: '시장/데이터', icon: '📈' },
    experimental: { label: '실험실', icon: '🧪' },
    other: { label: '기타', icon: '🗂️' },
  },
  categoryStyleMeta: {
    luck:         { borderClass: 'svc-related-card-luck',         headClass: 'svc-related-head-luck',         linkClass: 'svc-related-link-luck' },
    finance:      { borderClass: 'svc-related-card-finance',      headClass: 'svc-related-head-finance',      linkClass: 'svc-related-link-finance' },
    fortune:      { borderClass: 'svc-related-card-fortune',      headClass: 'svc-related-head-fortune',      linkClass: 'svc-related-link-fortune' },
    fun:          { borderClass: 'svc-related-card-fun',          headClass: 'svc-related-head-fun',          linkClass: 'svc-related-link-fun' },
    utility:      { borderClass: 'svc-related-card-utility',      headClass: 'svc-related-head-utility',      linkClass: 'svc-related-link-utility' },
    experimental: { borderClass: 'svc-related-card-experimental', headClass: 'svc-related-head-experimental', linkClass: 'svc-related-link-experimental' },
    other:        { borderClass: 'svc-related-card-other',        headClass: 'svc-related-head-other',        linkClass: 'svc-related-link-other' },
  },
  carousel: { targetCount: 6 },
};

function loadShellUiConfig() {
  try {
    const parsed = JSON.parse(fs.readFileSync(SHELL_UI_PATH, 'utf8'));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return DEFAULT_SHELL_UI;
    return {
      fallbackServiceLinks: Array.isArray(parsed.fallbackServiceLinks)
        ? parsed.fallbackServiceLinks
        : DEFAULT_SHELL_UI.fallbackServiceLinks,
      categoryMeta: parsed.categoryMeta && typeof parsed.categoryMeta === 'object'
        ? { ...DEFAULT_SHELL_UI.categoryMeta, ...parsed.categoryMeta }
        : DEFAULT_SHELL_UI.categoryMeta,
      categoryStyleMeta: parsed.categoryStyleMeta && typeof parsed.categoryStyleMeta === 'object'
        ? { ...DEFAULT_SHELL_UI.categoryStyleMeta, ...parsed.categoryStyleMeta }
        : DEFAULT_SHELL_UI.categoryStyleMeta,
      carousel: parsed.carousel && typeof parsed.carousel === 'object'
        ? { ...DEFAULT_SHELL_UI.carousel, ...parsed.carousel }
        : DEFAULT_SHELL_UI.carousel,
    };
  } catch (_error) {
    return DEFAULT_SHELL_UI;
  }
}

const SHELL_UI = loadShellUiConfig();
const FALLBACK_SERVICE_LINKS = SHELL_UI.fallbackServiceLinks;
const CATEGORY_META = SHELL_UI.categoryMeta;
const CATEGORY_STYLE_META = SHELL_UI.categoryStyleMeta;
const RELATED_CAROUSEL_TARGET_COUNT = Number(SHELL_UI.carousel.targetCount || 6);

function esc(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function loadServiceLinks() {
  try {
    const parsed = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    const services = Array.isArray(parsed.services) ? parsed.services : [];
    const normalized = services
      .filter((service) => service && service.status !== 'archived')
      .map((service) => ({
        id: service.id,
        icon: service.emoji || '✨',
        emoji: service.emoji || '✨',
        name: service.name || service.id,
        fullName: service.fullName || service.name || service.id,
        desc: service.desc || '도파민 공작소 추천 서비스',
        label: service.fullName || service.name || service.id,
        href: service.route || `/dunsmile/${service.id}/`,
        category: service.category || 'other',
        tags: Array.isArray(service.tags) ? service.tags : [],
        featuredRank: Number(service.featuredRank || 999),
        trendingScore: Number(service.trendingScore || 0),
      }));
    return normalized.length > 0 ? normalized : FALLBACK_SERVICE_LINKS;
  } catch (_error) {
    return FALLBACK_SERVICE_LINKS;
  }
}

const SERVICE_LINKS = loadServiceLinks();

function loadRelatedCarouselConfig() {
  try {
    const parsed = JSON.parse(fs.readFileSync(RELATED_SERVICES_PATH, 'utf8'));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed;
  } catch (_error) {
    return {};
  }
}

const RELATED_CAROUSEL_CONFIG = loadRelatedCarouselConfig();

function loadSiteSettings() {
  try {
    const parsed = JSON.parse(fs.readFileSync(SITE_SETTINGS_PATH, 'utf8'));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed;
  } catch (_error) {
    return {};
  }
}

const SITE_SETTINGS = loadSiteSettings();

function resolveServiceSkinClass(serviceId) {
  const serviceShell = SITE_SETTINGS.serviceShell || {};
  const skinMap = serviceShell.skins || {};
  const serviceOverride = (SITE_SETTINGS.services && SITE_SETTINGS.services[serviceId]) || {};
  const skinKey = serviceOverride.skin || serviceShell.defaultSkin || 'A';
  const skinMeta = skinMap[skinKey] || {};
  return skinMeta.className || '';
}

function renderServiceHeroMedia(serviceId) {
  const serviceOverride = (SITE_SETTINGS.services && SITE_SETTINGS.services[serviceId]) || {};
  const src = String(serviceOverride.heroImage || '').trim();
  if (!src) return '';
  return `<img src="${esc(src)}" alt="" class="svc-hero-media" loading="lazy" decoding="async">`;
}

function renderMenuLink(service, activeId) {
  const activeClass = service.id === activeId ? ' active' : '';
  const searchText = `${service.label} ${service.tags.join(' ')}`.trim();
  return `<a href="${esc(service.href)}" class="dp-menu-item${activeClass}" data-service-item="1" data-service-search="${esc(searchText.toLowerCase())}"><span>${esc(service.icon)}</span><span>${esc(service.label)}</span></a>`;
}

function renderCategorySections(activeId) {
  const activeService = SERVICE_LINKS.find((service) => service.id === activeId);
  const activeCategory = activeService ? activeService.category : '';

  const groups = new Map();
  for (const service of SERVICE_LINKS) {
    const categoryKey = service.category || 'other';
    if (!groups.has(categoryKey)) groups.set(categoryKey, []);
    groups.get(categoryKey).push(service);
  }

  const orderedCategories = [...groups.keys()].sort((a, b) => {
    if (a === activeCategory) return -1;
    if (b === activeCategory) return 1;
    return a.localeCompare(b);
  });

  return orderedCategories.map((categoryKey) => {
    const meta = CATEGORY_META[categoryKey] || CATEGORY_META.other;
    const services = groups.get(categoryKey) || [];
    services.sort((a, b) => b.trendingScore - a.trendingScore);
    const isOpen = categoryKey === activeCategory ? ' open' : '';
    const links = services.map((service) => renderMenuLink(service, activeId)).join('');

    return `<details class="dp-side-group"${isOpen}>
  <summary class="dp-side-group-title"><span>${esc(meta.icon)} ${esc(meta.label)}</span><span class="dp-side-group-count">${services.length}</span></summary>
  <div class="dp-side-group-body">${links}</div>
</details>`;
  }).join('');
}

function fillTemplate(template, values) {
  return template.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_m, key) => {
    const value = values[key];
    return value == null ? '' : String(value);
  });
}

function renderRelatedCard(card) {
  return fillTemplate(RELATED_CARD_PARTIAL, {
    href: esc(card.href),
    borderClass: esc(card.borderClass),
    analytics: esc(card.analytics),
    headClass: esc(card.headClass),
    emoji: esc(card.emoji),
    title: esc(card.title),
    subtitle: esc(card.subtitle),
    label: esc(card.label),
    description: esc(card.description),
    linkClass: esc(card.linkClass),
    linkText: esc(card.linkText),
    arrowIcon: CAROUSEL_ARROW_ICON,
  });
}

function toAnalyticsKey(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function summarizeText(text, maxLen) {
  const raw = String(text || '').trim();
  if (raw.length <= maxLen) return raw;
  return `${raw.slice(0, Math.max(0, maxLen - 1)).trim()}…`;
}

function getRelatedServiceCandidates(serviceId) {
  return [...SERVICE_LINKS]
    .filter((service) => service && service.id !== serviceId && String(service.href || '').startsWith('/dunsmile/'))
    .sort((a, b) => {
      const aIsNew = a.tags.includes('new') ? 1 : 0;
      const bIsNew = b.tags.includes('new') ? 1 : 0;
      if (bIsNew !== aIsNew) return bIsNew - aIsNew;
      if (b.trendingScore !== a.trendingScore) return b.trendingScore - a.trendingScore;
      return a.featuredRank - b.featuredRank;
    });
}

function buildFallbackCard(service, serviceKey) {
  const style = CATEGORY_STYLE_META[service.category] || CATEGORY_STYLE_META.other;
  const targetKey = toAnalyticsKey(service.id) || 'service';
  return {
    href: service.href,
    borderClass: style.borderClass,
    headClass: style.headClass,
    emoji: service.emoji || service.icon || '✨',
    title: service.fullName || service.label,
    subtitle: summarizeText(service.desc || '도파민 공작소 추천 서비스', 26),
    label: service.name || service.label,
    description: summarizeText(service.desc || '지금 바로 확인해보세요.', 52),
    linkText: '서비스 보러 가기',
    linkClass: style.linkClass,
    analytics: `cta_click|${serviceKey}|carousel|go_to_${targetKey}|`,
  };
}

function buildFallbackCarouselConfig(serviceId) {
  const source = getRelatedServiceCandidates(serviceId).slice(0, RELATED_CAROUSEL_TARGET_COUNT);

  if (source.length === 0) return null;

  const serviceKey = toAnalyticsKey(serviceId) || 'service';
  const cards = source.map((service) => buildFallbackCard(service, serviceKey));

  return {
    title: '다른 서비스도 확인해보세요!',
    cards,
  };
}

function renderRelatedCarousel(serviceId) {
  const customConfig = RELATED_CAROUSEL_CONFIG[serviceId];
  const fallbackConfig = buildFallbackCarouselConfig(serviceId);
  const baseConfig = customConfig || fallbackConfig;
  if (!baseConfig) return '';
  const config = {
    title: baseConfig.title,
    cards: Array.isArray(baseConfig.cards) ? [...baseConfig.cards] : [],
  };

  if (customConfig && fallbackConfig) {
    const serviceKey = toAnalyticsKey(serviceId) || 'service';
    const used = new Set(config.cards.map((card) => {
      const href = String(card.href || '');
      const matched = href.match(/\/dunsmile\/([^/]+)\//);
      return matched ? matched[1] : href;
    }));
    const candidates = getRelatedServiceCandidates(serviceId);

    const fillCards = [];
    // Ensure the latest added service is visible in carousel at least once.
    const latestService = [...candidates].sort((a, b) => b.featuredRank - a.featuredRank)[0];
    if (latestService && !used.has(latestService.id) && config.cards.length < RELATED_CAROUSEL_TARGET_COUNT) {
      fillCards.push(buildFallbackCard(latestService, serviceKey));
      used.add(latestService.id);
    }

    for (const service of candidates) {
      if (used.has(service.id)) continue;
      fillCards.push(buildFallbackCard(service, serviceKey));
      if ((config.cards.length + fillCards.length) >= RELATED_CAROUSEL_TARGET_COUNT) break;
    }

    config.cards = [...config.cards, ...fillCards];
  }

  const cards = config.cards.map((card) => renderRelatedCard(card)).join('\n');
  const indicators = config.cards.map((_, index) => (
    `<button type="button" class="svc-carousel-dot${index === 0 ? ' is-active' : ''}" data-carousel-dot="${index}" aria-label="캐러셀 ${index + 1}번 카드로 이동"></button>`
  )).join('\n');

  return fillTemplate(RELATED_CAROUSEL_PARTIAL, {
    serviceId: esc(serviceId),
    title: esc(config.title),
    cards,
    indicators,
  });
}

function renderShell(opts) {
  const themeClass = [opts.themeClass || '', resolveServiceSkinClass(opts.activeServiceId || '')].join(' ').trim();
  const heroEyebrow = opts.heroEyebrow || '';
  const heroTitle = opts.heroTitle || '';
  const heroSummary = opts.heroSummary || '';
  const heroPresetClass = opts.heroPresetClass || 'svc-hero-preset-core';
  const heroMedia = renderServiceHeroMedia(opts.activeServiceId || '');
  const mainContent = opts.mainContent || '';
  const actions = opts.actions || '';
  const adSlotTop = opts.adSlotTop || '';
  const adSlotBottom = opts.adSlotBottom || '';
  const postMainContent = opts.postMainContent || '';

  const header = fillTemplate(HEADER_PARTIAL, {
    serviceId: opts.activeServiceId || '',
    themeClass,
    pageTitle: opts.pageTitle || '',
    heroEyebrow,
    heroTitle,
    heroSummary,
    heroPresetClass,
    heroMedia,
    mainContent,
    adSlotTop,
    adSlotBottom,
    actions,
    postMainContent,
  });

  const sidebar = fillTemplate(SIDEBAR_PARTIAL, {
    sidebarCategorySections: renderCategorySections(opts.activeServiceId),
  });

  return `${header}\n${sidebar}\n${SETTINGS_PARTIAL}`;
}

function renderSidebar(activeServiceId) {
  return fillTemplate(SIDEBAR_PARTIAL, {
    sidebarCategorySections: renderCategorySections(activeServiceId),
  });
}

module.exports = { renderShell, renderRelatedCarousel, renderSidebar };
