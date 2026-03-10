(function initBalanceGameModule(global) {
  const SHARE_CARD_SCRIPT = '/dunsmile/js/share-card.js';
  const LOGIC_SCRIPT = '/dunsmile/js/balance-game.js';

  function loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
      const exists = document.querySelector(`script[data-balance-src="${src}"]`);
      if (exists) {
        if (exists.dataset.loaded === 'true') return resolve();
        exists.addEventListener('load', () => resolve(), { once: true });
        exists.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.dataset.balanceSrc = src;
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
      <section class="svc-card">
        <p id="questionText" class="svc-result-title svc-balance-question">오늘의 질문</p>
        <div class="svc-option-grid">
          <button id="optionAButton" type="button" onclick="chooseOption('A')" class="svc-option">
            <p class="svc-option-label">선택 A</p>
            <p id="optionAText" class="svc-option-text">-</p>
          </button>
          <button id="optionBButton" type="button" onclick="chooseOption('B')" class="svc-option">
            <p class="svc-option-label">선택 B</p>
            <p id="optionBText" class="svc-option-text">-</p>
          </button>
        </div>
      </section>

      <section id="resultCard" class="svc-card svc-hidden">
        <div class="svc-result-head">
          <p class="svc-result-title">실시간 선택 통계</p>
          <p id="selectedBadge" class="svc-tag">내 선택</p>
        </div>

        <div class="svc-result-rows">
          <div class="svc-result-row">
            <div class="svc-result-row-head">
              <span id="resultALabel">A</span>
              <span id="resultAPercent">50%</span>
            </div>
            <div class="svc-result-progress">
              <div id="resultABar" class="svc-result-progress-bar svc-result-progress-bar-a"></div>
            </div>
          </div>
          <div class="svc-result-row">
            <div class="svc-result-row-head">
              <span id="resultBLabel">B</span>
              <span id="resultBPercent">50%</span>
            </div>
            <div class="svc-result-progress">
              <div id="resultBBar" class="svc-result-progress-bar svc-result-progress-bar-b"></div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function buildActions() {
    return `
      <button type="button" onclick="nextQuestion()" class="svc-button svc-button-primary">다음 밸런스 게임</button>
      <button type="button" onclick="shareResult()" class="svc-button svc-button-outline">친구에게 공유하기</button>
      <button type="button" onclick="downloadBalanceShareCard()" class="svc-button svc-button-outline">결과 이미지 카드 저장</button>
    `;
  }

  async function mount(root) {
    if (!global.DunsmileTemplate || typeof global.DunsmileTemplate.renderShell !== 'function') {
      throw new Error('DunsmileTemplate is not ready');
    }

    root.innerHTML = global.DunsmileTemplate.renderShell({
      activeServiceId: 'balance-game',
      themeClass: 'svc-theme-balance',
      pageTitle: '밸런스 게임',
      heroEyebrow: '오늘의 선택',
      heroTitle: '두 가지 중 하나를 고르고\n전체 선택 비율을 확인해보세요',
      mainContent: buildContent(),
      actions: buildActions(),
    });

    await loadScriptOnce(SHARE_CARD_SCRIPT);
    await loadScriptOnce(LOGIC_SCRIPT);
  }

  global.DunsmileModules = global.DunsmileModules || {};
  global.DunsmileModules['balance-game'] = { mount };
})(window);
