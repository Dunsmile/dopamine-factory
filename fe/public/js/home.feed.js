/* 도파민 공작소 홈 - 피드 렌더/배너 캐러셀 */

function renderCompactHome() {
  const root = document.getElementById('homeFeedRoot');
  if (!root) return;
  if (!Array.isArray(SERVICES) || SERVICES.length === 0) {
    root.innerHTML = '<section class="nx-home-shell"><div class="nx-home-wrap"><p class="nx-tab-empty">서비스 데이터가 비어 있습니다.</p></div></section>';
    return;
  }
  const favorites = getFavorites();
  if (heroAutoplayTimer) {
    clearInterval(heroAutoplayTimer);
    heroAutoplayTimer = null;
  }

  const heroSlides = SERVICES.slice(0, 4);
  const hero = heroSlides[0];
  const heroStack = heroSlides.slice(1, 4);
  const latest = SERVICES.slice(0, 4);
  const categories = Array.isArray(SERVICE_CATEGORIES) ? SERVICE_CATEGORIES : [{ key: 'all', label: '전체' }];
  const toneByCategory = SERVICE_TONE_BY_CATEGORY;

  root.innerHTML = `
    <section class="nx-home-shell">
      <div class="nx-home-wrap">
        <section class="nx-hero">
          <div class="nx-hero-copy">
            <p class="nx-eyebrow" id="heroEyebrow">DOPAMINE FACTORY</p>
            <h1 id="heroTitle">${hero.fullName}</h1>
            <p id="heroDesc" class="nx-hero-desc">${hero.desc}</p>
            <div class="nx-hero-cta">
              <a href="${buildPlayQueryHref(hero.id)}" id="heroStartBtn" class="nx-btn nx-btn-primary" data-action="open-service-intro" data-service-id="${hero.id}">시작하기</a>
            </div>
          </div>
          <div class="nx-hero-visual">
            <a href="${buildPlayQueryHref(hero.id)}" id="heroMainLink" class="nx-hero-main-card" data-action="open-service-intro" data-service-id="${hero.id}">
              ${renderServiceImage(hero, toneByCategory, { loading: 'eager', id: 'heroMainImage' })}
            </a>
            <div class="nx-hero-stack" id="heroStack">
              ${heroStack.map((s, i) => `<a href="${buildPlayQueryHref(s.id)}" class="nx-stack-card offset-${i}" data-action="open-service-intro" data-service-id="${s.id}">${renderServiceImage(s, toneByCategory)}</a>`).join('')}
            </div>
          </div>
          <div class="nx-hero-progress nx-hero-progress-bottom" id="heroProgress" aria-label="메인 배너 페이지">
            ${heroSlides.map((s, i) => `<button type="button" class="nx-hero-progress-btn ${i === 0 ? 'active' : ''}" data-hero-index="${i}" aria-label="배너 ${i + 1}: ${s.fullName}"><span class="nx-hero-progress-bar"></span></button>`).join('')}
          </div>
        </section>

        <section class="nx-latest">
          <div class="nx-section-head"><h2>◆ 새로 나왔어요!</h2></div>
          <div class="nx-latest-grid">
            ${latest.map((s) => renderLatestItem(s, { isFavorite: favorites.includes(s.id), toneByCategory })).join('')}
          </div>
        </section>

        <section class="nx-highlight-bar">
          <div class="nx-highlight-text">지금 이 순간에도 ${SERVICES.length}개의 서비스를 플레이 중입니다.</div>
        </section>

        <section class="nx-catalog">
          <div class="nx-catalog-head">
            <div class="nx-filter-tabs" role="tablist" aria-label="서비스 카테고리 필터">
              ${categories.map((c, i) => `<button type="button" class="nx-filter-tab ${i === 0 ? 'active' : ''}" data-category="${c.key}" role="tab" aria-selected="${i === 0 ? 'true' : 'false'}">${c.label}</button>`).join('')}
            </div>
          </div>
          <div class="nx-service-grid" id="catalogGrid">${renderCatalogGridMarkup('all', { favorites, toneByCategory })}</div>
          <div class="nx-catalog-helper">
            <button type="button" class="nx-catalog-btn" data-action="open-service-directory">더보기</button>
          </div>
        </section>

        <section class="nx-cta-panel">
          <div>
            <h3>새로운 기능 제안이 있나요?</h3>
            <p>원하는 실험형 서비스를 남겨주세요. 도파민 랩에서 다음 스프린트로 반영합니다.</p>
          </div>
          <button class="nx-btn nx-btn-primary" type="button" data-action="show-toast" data-message="제안 폼은 준비 중입니다">아이디어 보내기</button>
        </section>
      </div>
    </section>
  `;

  const tabs = root.querySelectorAll('.nx-filter-tab');
  const catalogGrid = root.querySelector('#catalogGrid');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const category = tab.dataset.category || 'all';
      tabs.forEach((button) => {
        const active = button === tab;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      if (!catalogGrid) return;
      catalogGrid.innerHTML = renderCatalogGridMarkup(category, { favorites: getFavorites(), toneByCategory });
      enhanceHomeFeedMedia(catalogGrid);
    });
  });

  enhanceHomeFeedMedia(root);
  initHeroCarousel(root, heroSlides, toneByCategory);
}

function initHeroCarousel(root, heroSlides, toneByCategory) {
  const titleEl = root.querySelector('#heroTitle');
  const descEl = root.querySelector('#heroDesc');
  const startBtnEl = root.querySelector('#heroStartBtn');
  const mainLinkEl = root.querySelector('#heroMainLink');
  const mainImageEl = root.querySelector('#heroMainImage');
  const stackEl = root.querySelector('#heroStack');
  const progressButtons = Array.from(root.querySelectorAll('.nx-hero-progress-btn'));
  if (!titleEl || !descEl || !startBtnEl || !mainLinkEl || !mainImageEl || !stackEl || !progressButtons.length) return;

  let currentIndex = 0;
  const renderStack = (activeIndex) => {
    const stackSlides = heroSlides.map((slide, index) => ({ slide, index })).filter((item) => item.index !== activeIndex).slice(0, 3);
    stackEl.innerHTML = stackSlides.map((item, stackIndex) => `<a href="${buildPlayQueryHref(item.slide.id)}" class="nx-stack-card offset-${stackIndex}" data-action="open-service-intro" data-service-id="${item.slide.id}">${renderServiceImage(item.slide, toneByCategory)}</a>`).join('');
  };

  const renderSlide = (index) => {
    const slide = heroSlides[index];
    if (!slide) return;
    currentIndex = index;
    titleEl.textContent = slide.fullName;
    descEl.textContent = slide.desc;
    startBtnEl.href = buildPlayQueryHref(slide.id);
    startBtnEl.dataset.serviceId = slide.id;
    mainLinkEl.href = buildPlayQueryHref(slide.id);
    mainLinkEl.dataset.serviceId = slide.id;
    mainImageEl.src = serviceBanner(slide);
    mainImageEl.alt = slide.fullName;
    mainImageEl.dataset.fallback = makeDummyArt(slide.fullName, resolveServiceTone(slide, toneByCategory));
    renderStack(index);
    enhanceHomeFeedMedia(root);
    progressButtons.forEach((button, btnIndex) => {
      button.classList.remove('active');
      button.setAttribute('aria-current', 'false');
      if (btnIndex === index) {
        void button.offsetWidth;
        button.classList.add('active');
        button.setAttribute('aria-current', 'true');
      }
    });
  };

  const restartAutoplay = () => {
    if (heroAutoplayTimer) clearInterval(heroAutoplayTimer);
    heroAutoplayTimer = setInterval(() => {
      renderSlide((currentIndex + 1) % heroSlides.length);
    }, HERO_AUTOPLAY_MS);
  };

  progressButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextIndex = Number(button.dataset.heroIndex || '0');
      if (!Number.isFinite(nextIndex)) return;
      renderSlide(nextIndex);
      restartAutoplay();
    });
  });

  renderSlide(0);
  restartAutoplay();
}
