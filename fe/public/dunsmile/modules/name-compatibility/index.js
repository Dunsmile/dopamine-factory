(function initNameCompatibilityModule(global) {
  const SHARE_CARD_SCRIPT = '/dunsmile/js/share-card.js';
  const LOGIC_SCRIPT = '/dunsmile/js/name-compatibility.js';

  function loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
      const exists = document.querySelector(`script[data-name-compat-src="${src}"]`);
      if (exists) {
        if (exists.dataset.loaded === 'true') return resolve();
        exists.addEventListener('load', () => resolve(), { once: true });
        exists.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.dataset.nameCompatSrc = src;
      script.onload = () => {
        script.dataset.loaded = 'true';
        resolve();
      };
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.body.appendChild(script);
    });
  }

  function buildContent() {
    return `
      <section class="svc-card svc-stack-12">
        <div class="svc-field">
          <label for="nameA" class="svc-label">첫 번째 이름</label>
          <input id="nameA" type="text" maxlength="12" class="svc-input" placeholder="예: 민지" />
        </div>
        <div class="svc-field">
          <label for="nameB" class="svc-label">두 번째 이름</label>
          <input id="nameB" type="text" maxlength="12" class="svc-input" placeholder="예: 준호" />
        </div>
        <button type="button" onclick="runCompatibility()" class="svc-button svc-button-primary">궁합 결과 보기</button>
      </section>

      <section id="resultCard" class="svc-card svc-hidden svc-name-result">
        <p id="resultPair" class="svc-result-title svc-name-pair">민지 ♥ 준호</p>
        <p class="svc-result-score"><span id="resultScore">88</span><span class="svc-result-score-unit">점</span></p>
        <p id="resultType" class="svc-result-title">찰떡 케미 타입</p>
        <p id="resultDesc" class="svc-result-summary">서로의 텐션을 잘 맞추고, 대화 호흡이 빠른 타입입니다.</p>
        <div id="resultTags" class="svc-tags svc-tags-center"></div>
      </section>
    `;
  }

  function buildActions() {
    return `
      <button type="button" onclick="shareResult()" class="svc-button svc-button-outline">친구에게 결과 공유하기</button>
      <button type="button" onclick="downloadNameShareCard()" class="svc-button svc-button-outline">결과 이미지 카드 저장</button>
    `;
  }

  async function mount(root) {
    if (!global.DunsmileTemplate || typeof global.DunsmileTemplate.renderShell !== 'function') {
      throw new Error('DunsmileTemplate is not ready');
    }

    root.innerHTML = global.DunsmileTemplate.renderShell({
      activeServiceId: 'name-compatibility',
      themeClass: 'svc-theme-compat',
      pageTitle: '이름 궁합',
      heroEyebrow: '케미 지수 분석',
      heroTitle: '두 이름으로 보는 오늘의 궁합',
      mainContent: buildContent(),
      actions: buildActions(),
    });

    await loadScriptOnce(SHARE_CARD_SCRIPT);
    await loadScriptOnce(LOGIC_SCRIPT);
  }

  global.DunsmileModules = global.DunsmileModules || {};
  global.DunsmileModules['name-compatibility'] = { mount };
})(window);
