/* 도파민 공작소 홈 - home.js */

const {
  SERVICE_CATEGORIES,
  CATEGORY_CONTENT,
  CONTENT_UPDATE_LOG,
  SERVICES,
  FORTUNE_SERVICES,
  makeDummyArt,
  serviceBanner,
  serviceStartMeta,
  serviceContentGuide,
  categoryPillLabel,
  latestServiceTags,
} = window.HomeData || {};

const HERO_AUTOPLAY_MS = 5000;
let heroAutoplayTimer = null;
const SERVICE_TONE_BY_CATEGORY = {
  personality: 'violet',
  fortune: 'violet',
  money: 'emerald',
  utility: 'amber',
  love: 'violet',
  lab: 'blue',
  play: 'blue',
};

function getServiceById(serviceId) {
  if (!Array.isArray(SERVICES)) return null;
  return SERVICES.find((service) => service.id === serviceId) || null;
}

function buildPlayQueryHref(serviceId) {
  return `/?play=${encodeURIComponent(serviceId)}`;
}

function buildPlayPrettyPath(serviceId) {
  return `/play/${encodeURIComponent(serviceId)}`;
}

function parsePlayRoute() {
  const match = (window.location.pathname || '').match(/^\/play\/([a-z0-9-]+)\/?$/i);
  if (match && match[1]) return decodeURIComponent(match[1]);
  const params = new URLSearchParams(window.location.search);
  return params.get('play');
}

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', initHome);

function initHome() {
  if (!SERVICES || !FORTUNE_SERVICES || !makeDummyArt || !serviceBanner || !serviceStartMeta || !serviceContentGuide || !categoryPillLabel || !latestServiceTags || !SERVICE_CATEGORIES || !CATEGORY_CONTENT || !CONTENT_UPDATE_LOG) {
    console.error('[home] HomeData module is not loaded.');
    return;
  }
  ensurePlayIntroView();
  ensureServiceDirectoryView();
  initThemeToggle();
  renderCompactHome();
  renderSidebar();
  initActionDelegates();
  initSearch();
  initGlobalHotkeys();
  initBottomNav();
  initSidebarToggle();
  initRouting();
}



function ensurePlayIntroView() {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent || document.getElementById('viewPlayIntro')) return;

  const playView = document.createElement('div');
  playView.id = 'viewPlayIntro';
  playView.className = 'view-section';
  playView.innerHTML = '<div class="home-view-section"><div id="playIntroContent"></div></div>';
  mainContent.insertBefore(playView, document.getElementById('viewFortune'));
}

function ensureServiceDirectoryView() {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent || document.getElementById('viewServices')) return;

  const directoryView = document.createElement('div');
  directoryView.id = 'viewServices';
  directoryView.className = 'view-section';
  directoryView.innerHTML = '<div class="home-view-section"><div id="serviceDirectoryContent"></div></div>';
  mainContent.insertBefore(directoryView, document.getElementById('viewFortune'));
}

function renderServiceDirectory() {
  const container = document.getElementById('serviceDirectoryContent');
  if (!container) return;
  const favorites = getFavorites();
  const groups = listCategoryOptions();
  const logs = Array.isArray(CONTENT_UPDATE_LOG) ? CONTENT_UPDATE_LOG : [];

  container.innerHTML = `
    <section class="nx-directory">
      <div class="nx-directory-top">
        <button type="button" class="nx-intro-back" data-action="switch-view" data-view="viewHome">← 홈으로</button>
        <h2>서비스 디렉토리</h2>
        <p class="nx-directory-lead">
          도파민 공작소는 카테고리별 목적에 맞춰 서비스를 운영합니다. 각 섹션 안내와 업데이트 기록을 확인한 뒤 테스트를 시작해 보세요.
        </p>
      </div>
      ${groups.map((group) => {
        const items = getCatalogItemsByCategory(group.key);
        const content = CATEGORY_CONTENT[group.key];
        const infoId = `directory-info-${group.key}`;
        if (!items.length) return '';
        return `
          <section class="nx-directory-group">
            <div class="nx-directory-group-head">
              <h3>${group.label}</h3>
              ${content ? `
                <button
                  type="button"
                  class="nx-directory-info-btn"
                  data-action="toggle-category-info"
                  data-target="${infoId}"
                  aria-expanded="false"
                  aria-label="${group.label} 카테고리 설명 보기"
                >?</button>
              ` : ''}
            </div>
            ${content ? `
              <div id="${infoId}" class="nx-directory-copy" hidden>
                <h4>${content.title}</h4>
                <p>${content.body}</p>
                <ul>
                  ${(content.highlights || []).map((point) => `<li>${point}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            <div class="nx-directory-grid">
              ${items.map((service) => renderCatalogItem(service, { isFavorite: favorites.includes(service.id), toneByCategory: SERVICE_TONE_BY_CATEGORY })).join('')}
            </div>
          </section>
        `;
      }).join('')}
      <section class="nx-directory-log">
        <h3>콘텐츠 업데이트 로그</h3>
        <ul>
          ${logs.map((log) => `<li><strong>${log.date}</strong><span>${log.text}</span></li>`).join('')}
        </ul>
      </section>
    </section>
  `;
  enhanceHomeFeedMedia(container);
}

function renderPlayIntro(service) {
  const container = document.getElementById('playIntroContent');
  if (!container) return;
  const meta = serviceStartMeta(service);
  const contentGuide = serviceContentGuide(service);
  const categoryContent = CATEGORY_CONTENT[service.category];
  const introTags = meta.tags.map((tag) => `#${tag}`).join(' ');
  const similar = SERVICES.filter((item) => item.id !== service.id).slice(0, 4);

  container.innerHTML = `
    <section class="nx-play-intro">
      <button type="button" class="nx-intro-back" data-action="switch-view" data-view="viewHome">← 홈으로</button>
      <article class="nx-intro-card">
        <div class="nx-intro-media">
          ${renderServiceImage(service, SERVICE_TONE_BY_CATEGORY, { loading: 'eager' })}
        </div>
        <div class="nx-intro-main">
          <h1 class="nx-intro-title">${service.fullName}</h1>
          <div class="nx-intro-meta">
            <p><span>제작</span><strong>${meta.author}</strong></p>
            <p><span>플레이</span><strong>${meta.plays}</strong></p>
            <p><span>소요시간</span><strong>${meta.duration}</strong></p>
          </div>
          <p class="nx-intro-desc">${service.desc}</p>
          <p class="nx-intro-tags">${introTags}</p>
          <a href="${service.url}" class="nx-btn nx-btn-primary nx-intro-start-btn">테스트 시작</a>
        </div>
      </article>
      <section class="nx-intro-recommend">
        <h2>비슷한 테스트</h2>
        <div class="nx-intro-recommend-grid">
          ${similar.map((item) => `
            <a href="${buildPlayQueryHref(item.id)}" class="nx-intro-mini-card" data-action="open-service-intro" data-service-id="${item.id}">
              ${renderServiceImage(item, SERVICE_TONE_BY_CATEGORY)}
              <span>${item.fullName}</span>
            </a>
          `).join('')}
        </div>
      </section>

      <section class="nx-intro-info-grid">
        ${categoryContent ? `
          <article class="nx-intro-info-card nx-intro-context">
            <h3>${categoryContent.title}</h3>
            <p>${categoryContent.body}</p>
            <ul>
              ${(categoryContent.highlights || []).slice(0, 2).map((point) => `<li>${point}</li>`).join('')}
            </ul>
          </article>
        ` : ''}
        <article class="nx-intro-info-card">
          <h3>자주 묻는 질문</h3>
          <div class="nx-intro-faq-list">
            ${contentGuide.faq.map((item) => `
              <details>
                <summary>${item.q}</summary>
                <p>${item.a}</p>
              </details>
            `).join('')}
          </div>
        </article>
        <article class="nx-intro-info-card">
          <h3>콘텐츠 제작 기준</h3>
          <p>${contentGuide.policy}</p>
          <p class="nx-intro-updated">최근 업데이트: ${contentGuide.updatedAt}</p>
        </article>
      </section>
    </section>
  `;

  enhanceHomeFeedMedia(container);
}

function openServiceIntro(serviceId, { pushHistory = false } = {}) {
  const service = getServiceById(serviceId);
  if (!service) {
    showToast('서비스 정보를 불러오지 못했습니다');
    switchView('viewHome');
    return;
  }

  switchView('viewPlayIntro');
  renderPlayIntro(service);
  updateNavigationState('viewHome');

  if (pushHistory) {
    const prettyPath = buildPlayPrettyPath(service.id);
    window.history.pushState({ view: 'play', serviceId: service.id }, '', prettyPath);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderTabServiceCard(service, { removable = false } = {}) {
  return `
    <a href="${buildPlayQueryHref(service.id)}" class="nx-tab-card ${removable ? 'has-remove' : ''}" data-action="open-service-intro" data-service-id="${service.id}">
      <div class="nx-tab-thumb">
        ${renderServiceImage(service, SERVICE_TONE_BY_CATEGORY)}
        <span class="nx-service-pill">${categoryPillLabel(service.category)}</span>
      </div>
      <div class="nx-tab-body">
        <h3>${service.fullName}</h3>
        <p>${service.desc}</p>
      </div>
      ${removable ? `<button type="button" class="nx-remove-btn" data-action="remove-favorite" data-service-id="${service.id}">관심 해제</button>` : ''}
    </a>
  `;
}

// ===== 운세 서비스 리스트 (하단탭 운세) =====
function showFortuneList() {
  const container = document.getElementById('fortuneList');
  if (!container) return;
  container.innerHTML = `
    <div class="nx-tab-grid">
      ${FORTUNE_SERVICES.map((s) => renderTabServiceCard(s)).join('')}
    </div>
  `;
  enhanceHomeFeedMedia(container);

  if (FORTUNE_SERVICES.length === 0) {
    container.innerHTML = '<p class="nx-tab-empty">운세 서비스가 준비 중입니다</p>';
  }
}
window.showFortuneList = showFortuneList;

// ===== 관심 서비스 (MY) =====
function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem('dopamine_favorites')) || [];
  } catch { return []; }
}

function saveFavorites(favs) {
  localStorage.setItem('dopamine_favorites', JSON.stringify(favs));
}

function toggleFavorite(serviceId) {
  let favs = getFavorites();
  if (favs.includes(serviceId)) {
    favs = favs.filter(f => f !== serviceId);
    showToast('관심 서비스에서 해제했습니다');
  } else {
    favs.push(serviceId);
    showToast('관심 서비스에 등록했습니다');
  }
  saveFavorites(favs);
  if (document.getElementById('viewHome')?.classList.contains('active')) {
    renderCompactHome();
  }
}
window.toggleFavorite = toggleFavorite;

function showFavorites() {
  const favs = getFavorites();
  const container = document.getElementById('favList');
  if (!container) return;

  if (favs.length === 0) {
    container.innerHTML = '<p class="nx-tab-empty">관심 서비스를 등록해보세요. 홈 카드에서 빠르게 추가할 수 있습니다.</p>';
    return;
  }

  const favServices = SERVICES.filter(s => favs.includes(s.id));
  container.innerHTML = `
    <div class="nx-tab-grid">
      ${favServices.map((s) => renderTabServiceCard(s, { removable: true })).join('')}
    </div>
  `;
  enhanceHomeFeedMedia(container);
}
window.showFavorites = showFavorites;

// ===== 프로필 =====
function showProfile() {
  const container = document.getElementById('profileContent');
  if (!container) return;

  const userName = localStorage.getItem('user_name') || localStorage.getItem('userName');
  const userBirth = localStorage.getItem('user_birth') || localStorage.getItem('userBirth');
  const fortuneData = localStorage.getItem('daily_fortune_user') || localStorage.getItem('dailyFortuneUser');

  let profileRows = '';

  if (userName || userBirth || fortuneData) {
    if (userName) profileRows += `<p class="nx-profile-row"><span>이름</span><strong>${userName}</strong></p>`;
    if (userBirth) profileRows += `<p class="nx-profile-row"><span>생년월일</span><strong>${userBirth}</strong></p>`;
    if (fortuneData) {
      try {
        const fd = JSON.parse(fortuneData);
        if (fd.name) profileRows += `<p class="nx-profile-row"><span>이름</span><strong>${fd.name}</strong></p>`;
        if (fd.birthDate) profileRows += `<p class="nx-profile-row"><span>생년월일</span><strong>${fd.birthDate}</strong></p>`;
        if (fd.zodiac) profileRows += `<p class="nx-profile-row"><span>별자리</span><strong>${fd.zodiac}</strong></p>`;
      } catch {}
    }
  } else {
    profileRows = '<p class="nx-profile-empty">저장된 정보가 없습니다.</p>';
  }

  const records = [];
  const lottoHistory = localStorage.getItem('lotto_history') || localStorage.getItem('lottoHistory');
  if (lottoHistory) {
    try {
      const arr = JSON.parse(lottoHistory);
      records.push(`🎱 HOXY NUMBER: ${Array.isArray(arr) ? arr.length : 0}회 생성`);
    } catch {}
  }
  const faceResult = localStorage.getItem('rich_face_result') || localStorage.getItem('richFaceResult');
  if (faceResult) records.push('👤 부자상 테스트: 이용 완료');
  const fortuneResult = localStorage.getItem('daily_fortune_result') || localStorage.getItem('dailyFortuneResult');
  if (fortuneResult) records.push('🔮 오늘의 운세: 이용 완료');
  const tarotResult = localStorage.getItem('tarot_result') || localStorage.getItem('tarotResult');
  if (tarotResult) records.push('🃏 타로 리딩: 이용 완료');

  const recordsHtml = records.length > 0
    ? `<ul class="nx-profile-records">${records.map((r) => `<li>${r}</li>`).join('')}</ul>`
    : '<p class="nx-profile-empty">아직 이용 기록이 없습니다.</p>';

  container.innerHTML = `
    <section class="nx-profile-grid">
      <article class="nx-profile-card">
        <h3>기본 정보</h3>
        ${profileRows}
      </article>
      <article class="nx-profile-card">
        <h3>서비스 이용 기록</h3>
        ${recordsHtml}
      </article>
    </section>
  `;
}
window.showProfile = showProfile;

// ===== 토스트 =====
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}
window.showToast = showToast;
