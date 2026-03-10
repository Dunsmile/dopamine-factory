    const MARKET_SENTIMENT_ROUTE = '/dunsmile/market-sentiment/';

    // ==================== 데이터 관리 ====================
    
    const STORAGE_KEYS = {
      QUOTA: 'hoxy_quota',
      RECENT: 'hoxy_recent',
      SAVED: 'hoxy_saved',
      WINNING: 'hoxy_winning',
      LUCKY: 'hoxy_lucky',
      MANUAL_INPUTS: 'hoxy_manual_inputs',
      PAGES_UNLOCKED: 'hoxy_pages_unlocked',
      SAVED_PAGES_UNLOCKED: 'hoxy_saved_pages_unlocked',
      SHARE_DATE: 'hoxy_share_date',
      RECENT_SLOTS: 'hoxy_recent_slots',
      AD_QUOTA_LIMIT: 'hoxy_ad_quota_limit'  // 광고 횟수 제한 (12시간 3회)
    };

    let winningData = {
      drawNumber: 1199,
      drawDate: '2025-11-22',
      numbers: [16, 24, 25, 30, 31, 32],
      bonus: 7,
      firstPrize: '1,695,609,839',
      prizes: null  // API에서 로드 시 채워짐 (win1~win5)
    };

    let manualInputLineCount = 1;
    let currentPageIndex = 0;
    let maxPages = 5;
    let itemsPerPage = 10;
    let unlockedPages = 1; // 처음에는 1페이지만 잠금 해제
    
    // 최근 생성 번호 슬롯 시스템
    let recentSlots = 5; // 기본 5개 슬롯

    // 저장된 번호 페이지네이션
    let savedCurrentPageIndex = 0;
    let savedMaxPages = 5;
    let savedItemsPerPage = 10;
    let savedUnlockedPages = 1;

    async function initApp() {
      renderGenerateConfirmModal();
      renderGenerationFlowModals();
      renderAdminLoginModal();
      renderAboutModal();
      renderPrivacyModal();
      renderTermsModal();
      renderDisclaimerBoxes();
      renderActionConfirmModals();
      renderPageAddConfirmModals();
      renderChargeModals();
      await loadWinningNumbers();
      initQuota();
      await initDrawSelect();
      initManualInputs();
      
      // 잠금 해제된 페이지 수 로드 (최근 생성 번호)
      const stored = localStorage.getItem(STORAGE_KEYS.PAGES_UNLOCKED);
      if (stored) {
        unlockedPages = parseInt(stored);
      }
      
      // 잠금 해제된 페이지 수 로드 (저장된 번호)
      const savedStored = localStorage.getItem(STORAGE_KEYS.SAVED_PAGES_UNLOCKED);
      if (savedStored) {
        savedUnlockedPages = parseInt(savedStored);
      }
      
      // 최근 생성 번호 슬롯 수 로드
      const slotsStored = localStorage.getItem(STORAGE_KEYS.RECENT_SLOTS);
      if (slotsStored) {
        recentSlots = parseInt(slotsStored);
      }
      
      updateUI();
      updateActiveUsers();
      checkWinnings();
      updateWinningStats();
      initStatsCarousel();

      setInterval(updateActiveUsers, 60000);
      setInterval(checkDateReset, 60000);
    }

    function renderDisclaimerBoxes() {
      const mounts = ['homeDisclaimerMount', 'savedDisclaimerMount', 'checkDisclaimerMount'];
      const disclaimerItems = [
        '생성된 번호는 참고용이며 실제 로또 당첨을 보장하지 않습니다.',
        '본 서비스의 번호는 무작위 추출 결과와 동일한 확률을 가집니다.',
        '개인의 책임 하에 이용 바랍니다.'
      ];

      const disclaimerHtml = `
        <div class="font-semibold text-gray-800 mb-1.5">⚠️ 면책 조항</div>
        <ul class="space-y-0.5 list-disc list-inside text-xs">
          ${disclaimerItems.map((item) => `<li>${item}</li>`).join('')}
        </ul>
      `;

      mounts.forEach((id) => {
        const mount = document.getElementById(id);
        if (mount) {
          mount.innerHTML = disclaimerHtml;
        }
      });
    }

    function renderGenerateConfirmModal() {
      const mount = document.getElementById('generateConfirmModalMount');
      if (!mount) return;

      mount.innerHTML = `
        <div id="generateConfirmModal" class="modal-backdrop">
          <div class="hoxy-modal-panel hoxy-modal-w-400 hoxy-modal-pad-5">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <div class="text-sm font-semibold text-gray-700 mb-1">하루 생성할 수 있는 번호는 최대 10회</div>
                <div class="text-2xl font-black text-blue-600 mb-1"><span id="confirmRemaining">10</span>/<span id="confirmTotal">10</span>번 남았습니다.</div>
                <div class="text-xs text-gray-600">번호를 생성하시겠습니까?</div>
              </div>
              <button onclick="closeGenerateConfirm()" class="hoxy-modal-close-btn">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <label id="option5Times" class="hoxy-generate-option hoxy-generate-option-default">
              <input type="checkbox" id="generate5Times" class="hoxy-generate-option-check hoxy-generate-option-check-blue">
              <span class="hoxy-generate-option-text">연속 5회 뽑기</span>
            </label>

            <label id="optionRemaining" class="hidden hoxy-generate-option hoxy-generate-option-remaining">
              <input type="checkbox" id="generateRemaining" class="hoxy-generate-option-check hoxy-generate-option-check-purple">
              <span class="hoxy-generate-option-text-remaining">남은 <span id="remainingDrawCount">4</span>회 모두 뽑기</span>
            </label>

            <div class="flex gap-2">
              <button onclick="closeGenerateConfirm()" class="hoxy-modal-btn-cancel-sm">
                취소
              </button>
              <button onclick="confirmGenerate()" class="hoxy-modal-btn-primary-blue-sm" data-analytics="feature_use|hoxy_number|modal|confirm_generate|">
                생성하기
              </button>
            </div>
          </div>
        </div>
      `;
    }

    function renderGenerationFlowModals() {
      const generatingMount = document.getElementById('generatingModalMount');
      if (generatingMount) {
        generatingMount.innerHTML = `
          <div id="generatingModal" class="modal-backdrop">
            <div class="hoxy-modal-panel hoxy-modal-w-480 hoxy-modal-pad-8">
              <div class="text-center">
                <div class="text-lg font-bold text-gray-900 mb-6">번호 생성 중</div>

                <div class="hoxy-loading-progress-track">
                  <div id="loadingProgressBar" class="hoxy-loading-progress-bar is-width-zero"></div>
                </div>

                <div class="text-4xl font-bold text-blue-600 mb-6">
                  <span id="loadingPercent">0</span>%
                </div>

                <div class="flex justify-center mb-6">
                  <div class="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full spinner"></div>
                </div>

                <div id="loadingMessage" class="text-sm text-gray-600">
                  완전 랜덤으로 서플 중...
                </div>
              </div>
            </div>
          </div>
        `;
      }

      const generatedMount = document.getElementById('generatedModalMount');
      if (generatedMount) {
        generatedMount.innerHTML = `
          <div id="generatedModal" class="modal-backdrop">
            <div class="hoxy-modal-panel hoxy-modal-w-480 hoxy-modal-pad-8">
              <div class="text-center">
                <div class="text-lg font-bold text-gray-900 mb-4">번호 생성 중</div>

                <div class="hoxy-loading-progress-track">
                  <div class="hoxy-loading-progress-bar hoxy-progress-full"></div>
                </div>

                <div class="text-4xl font-bold text-blue-600 mb-8">100%</div>

                <div class="flex justify-center mb-6">
                  <div class="hoxy-generated-icon-wrap">
                    <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>

                <div class="text-base text-gray-600 mb-6">
                  당신에게 행운이 깃들길...
                </div>

                <button onclick="closeGeneratedModal()" class="hoxy-cta-btn hoxy-cta-btn-primary hoxy-cta-btn-sm">
                  내 번호 확인하기
                </button>
              </div>
            </div>
          </div>
        `;
      }
    }

    function renderAdminLoginModal() {
      const mount = document.getElementById('adminLoginModalMount');
      if (!mount) return;

      mount.innerHTML = `
        <div id="adminLoginModal" class="modal-backdrop" onclick="if(event.target === this) closeAdminLoginModal()">
          <div class="hoxy-modal-panel hoxy-modal-w-360 hoxy-modal-pad-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-gray-900">관리자 로그인</h3>
              <button onclick="closeAdminLoginModal()" class="hoxy-modal-close-btn">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div class="space-y-4">
              <div>
                <label class="text-sm font-semibold text-gray-700 block mb-2">ID</label>
                <input type="text" id="adminIdInput" class="hoxy-input-field" placeholder="아이디 입력">
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-700 block mb-2">PW</label>
                <input type="password" id="adminPwInput" class="hoxy-input-field" placeholder="비밀번호 입력" onkeypress="if(event.key === 'Enter') adminLogin()">
              </div>
              <div id="adminLoginError" class="text-sm text-red-500 text-center hidden">
                아이디 또는 비밀번호가 일치하지 않습니다.
              </div>
              <button onclick="adminLogin()" class="hoxy-cta-btn hoxy-cta-btn-primary hoxy-cta-btn-sm">
                로그인
              </button>
            </div>
          </div>
        </div>
      `;
    }

    function renderAboutModal() {
      const mount = document.getElementById('aboutModalMount');
      if (!mount) return;

      mount.innerHTML = `
        <div id="aboutModal" class="modal-backdrop" onclick="if(event.target === this) closeAboutModal()">
          <div class="hoxy-modal-panel hoxy-modal-w-480 hoxy-modal-pad-6 hoxy-modal-scroll">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-gray-900">서비스 소개</h3>
              <button onclick="closeAboutModal()" class="hoxy-modal-close-btn">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div class="text-sm text-gray-600 space-y-4">
              <div>
                <h4 class="font-bold text-gray-900 mb-2">HOXY NUMBER란?</h4>
                <p>HOXY NUMBER는 무료로 로또 번호를 생성하고 당첨 여부를 확인할 수 있는 서비스입니다. 매주 새로운 행운의 번호를 추천받고, 간편하게 당첨 결과를 확인해보세요.</p>
              </div>
              <div>
                <h4 class="font-bold text-gray-900 mb-2">주요 기능</h4>
                <ul class="list-disc list-inside space-y-1">
                  <li>로또 번호 자동 생성 (1~45 중 6개)</li>
                  <li>오늘의 럭키 넘버 제공</li>
                  <li>생성 번호 저장 및 관리</li>
                  <li>실시간 당첨 확인 (동행복권 연동)</li>
                  <li>등수별 당첨금 정보 제공</li>
                </ul>
              </div>
              <div>
                <h4 class="font-bold text-gray-900 mb-2">서비스 운영</h4>
                <p>본 서비스는 무료로 제공되며, 광고 수익을 통해 운영됩니다.</p>
                <p class="mt-2">문의: poilkjmnb122@gmail.com</p>
              </div>
              <div class="pt-2 border-t text-xs text-gray-400">
                <p>버전: v1.7</p>
                <p>최종 업데이트: 2026년 2월</p>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    function renderPrivacyModal() {
      const mount = document.getElementById('privacyModalMount');
      if (!mount) return;

      mount.innerHTML = `
        <div id="privacyModal" class="modal-backdrop" onclick="if(event.target === this) closePrivacyModal()">
          <div class="hoxy-modal-panel hoxy-modal-w-480 hoxy-modal-pad-6 hoxy-modal-scroll">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-gray-900">개인정보처리방침</h3>
              <button onclick="closePrivacyModal()" class="hoxy-modal-close-btn">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div class="text-sm text-gray-600 space-y-4">
              <p class="text-xs text-gray-400">시행일: 2026년 2월 5일</p>

              <div>
                <h4 class="font-bold text-gray-900 mb-2">1. 수집하는 개인정보</h4>
                <p>HOXY NUMBER는 서비스 제공을 위해 최소한의 정보만을 수집합니다.</p>
                <ul class="list-disc list-inside mt-2 space-y-1">
                  <li>자동 수집: 기기 정보, 브라우저 유형, 접속 로그</li>
                  <li>서비스 이용 기록: 생성된 번호, 저장된 번호 (로컬 저장)</li>
                </ul>
              </div>

              <div>
                <h4 class="font-bold text-gray-900 mb-2">2. 개인정보 이용 목적</h4>
                <ul class="list-disc list-inside space-y-1">
                  <li>서비스 제공 및 운영</li>
                  <li>서비스 개선 및 통계 분석</li>
                  <li>광고 게재 (Google AdSense)</li>
                </ul>
              </div>

              <div>
                <h4 class="font-bold text-gray-900 mb-2">3. 개인정보 보관 및 파기</h4>
                <p>사용자가 생성한 번호는 브라우저의 LocalStorage에 저장되며, 사용자가 직접 삭제하거나 브라우저 데이터 초기화 시 파기됩니다.</p>
              </div>

              <div>
                <h4 class="font-bold text-gray-900 mb-2">4. 쿠키 및 분석/광고</h4>
                <p>본 서비스는 Google Analytics를 사용하여 서비스 이용 통계를 수집하며, Google AdSense를 통해 광고를 게재합니다. 이 과정에서 쿠키 또는 유사한 식별자가 사용될 수 있습니다.</p>
                <p class="mt-2">Google의 데이터 처리 방식: <a href="https://policies.google.com/technologies/partner-sites" target="_blank" class="text-blue-600 underline">Google 파트너 사이트 정책</a></p>
                <p class="mt-2">광고 개인화 설정: <a href="https://www.google.com/settings/ads" target="_blank" class="text-blue-600 underline">Google 광고 설정</a></p>
                <p class="mt-2">Analytics 수집 거부: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" class="text-blue-600 underline">Google Analytics Opt-out Add-on</a></p>
              </div>

              <div>
                <h4 class="font-bold text-gray-900 mb-2">5. 제3자 제공</h4>
                <p>개인정보는 제3자에게 제공되지 않습니다. 단, 법령에 따른 요청이 있는 경우 예외로 합니다.</p>
              </div>

              <div>
                <h4 class="font-bold text-gray-900 mb-2">6. 문의</h4>
                <p>개인정보 관련 문의: poilkjmnb122@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    function renderTermsModal() {
      const mount = document.getElementById('termsModalMount');
      if (!mount) return;

      mount.innerHTML = `
        <div id="termsModal" class="modal-backdrop" onclick="if(event.target === this) closeTermsModal()">
          <div class="hoxy-modal-panel hoxy-modal-w-480 hoxy-modal-pad-6 hoxy-modal-scroll">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-gray-900">이용약관</h3>
              <button onclick="closeTermsModal()" class="hoxy-modal-close-btn">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div class="text-sm text-gray-600 space-y-4">
              <p class="text-xs text-gray-400">시행일: 2026년 2월 5일</p>

              <div>
                <h4 class="font-bold text-gray-900 mb-2">제1조 (목적)</h4>
                <p>본 약관은 HOXY NUMBER(이하 "서비스")의 이용에 관한 조건 및 절차를 규정함을 목적으로 합니다.</p>
              </div>

              <div>
                <h4 class="font-bold text-gray-900 mb-2">제2조 (서비스 내용)</h4>
                <p>서비스는 다음의 기능을 제공합니다.</p>
                <ul class="list-disc list-inside mt-2 space-y-1">
                  <li>로또 번호 무작위 생성</li>
                  <li>생성 번호 저장 및 관리</li>
                  <li>당첨 번호 조회 및 결과 확인</li>
                </ul>
              </div>

              <div>
                <h4 class="font-bold text-gray-900 mb-2">제3조 (면책사항)</h4>
                <ul class="list-disc list-inside space-y-1">
                  <li>본 서비스에서 생성된 번호는 무작위 추출 결과이며, 로또 당첨을 보장하지 않습니다.</li>
                  <li>번호 선택 및 복권 구매는 사용자 본인의 책임입니다.</li>
                  <li>서비스 이용으로 인한 직접적, 간접적 손해에 대해 책임지지 않습니다.</li>
                </ul>
              </div>

              <div>
                <h4 class="font-bold text-gray-900 mb-2">제4조 (서비스 이용)</h4>
                <ul class="list-disc list-inside space-y-1">
                  <li>서비스는 무료로 제공됩니다.</li>
                  <li>일일 생성 횟수 제한이 적용될 수 있습니다.</li>
                  <li>무료 충전을 통해 추가 기능을 이용할 수 있습니다.</li>
                </ul>
              </div>

              <div>
                <h4 class="font-bold text-gray-900 mb-2">제5조 (금지 행위)</h4>
                <ul class="list-disc list-inside space-y-1">
                  <li>서비스의 정상적 운영을 방해하는 행위</li>
                  <li>타인의 권리를 침해하는 행위</li>
                  <li>서비스를 상업적 목적으로 무단 이용하는 행위</li>
                </ul>
              </div>

              <div>
                <h4 class="font-bold text-gray-900 mb-2">제6조 (약관 변경)</h4>
                <p>본 약관은 서비스 정책에 따라 변경될 수 있으며, 변경 시 서비스 내 공지합니다.</p>
              </div>

              <div>
                <h4 class="font-bold text-gray-900 mb-2">제7조 (문의)</h4>
                <p>서비스 관련 문의: poilkjmnb122@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    function renderActionConfirmModals() {
      const configs = [
        {
          mountId: 'saveConfirmModalMount',
          modalId: 'saveConfirmModal',
          closeHandler: 'closeSaveConfirm',
          confirmHandler: 'confirmSaveNumber',
          numbersId: 'saveConfirmNumbers',
          icon: '💾',
          title: '저장하시겠습니까?',
          numbersBgClass: 'hoxy-modal-numbers-blue',
          confirmBtnClass: 'hoxy-modal-btn-primary-blue-sm',
          confirmLabel: '저장하기',
          analytics: 'cta_click|hoxy_number|modal|confirm_save_number|'
        },
        {
          mountId: 'deleteConfirmModalMount',
          modalId: 'deleteConfirmModal',
          closeHandler: 'closeDeleteConfirm',
          confirmHandler: 'confirmDeleteNumber',
          numbersId: 'deleteConfirmNumbers',
          icon: '🗑️',
          title: '삭제하시겠습니까?',
          numbersBgClass: 'hoxy-modal-numbers-red',
          confirmBtnClass: 'hoxy-modal-btn-primary-red-sm',
          confirmLabel: '삭제하기',
          analytics: 'cta_click|hoxy_number|modal|confirm_delete_number|'
        }
      ];

      configs.forEach((config) => {
        const mount = document.getElementById(config.mountId);
        if (!mount) return;

        mount.innerHTML = `
          <div id="${config.modalId}" class="modal-backdrop" onclick="if(event.target === this) ${config.closeHandler}()">
            <div class="hoxy-modal-panel hoxy-modal-w-360 hoxy-modal-pad-5">
              <div class="text-center mb-4">
                <div class="text-3xl mb-2">${config.icon}</div>
                <div class="hoxy-modal-confirm-title">${config.title}</div>
                <div id="${config.numbersId}" class="flex gap-1 justify-center p-3 ${config.numbersBgClass} rounded-xl"></div>
              </div>
              <div class="flex gap-2">
                <button onclick="${config.closeHandler}()" class="hoxy-modal-btn-cancel-sm">
                  취소
                </button>
                <button onclick="${config.confirmHandler}()" class="${config.confirmBtnClass}" data-analytics="${config.analytics}">
                  ${config.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        `;
      });
    }

    function renderPageAddConfirmModals() {
      const configs = [
        {
          mountId: 'pageAddConfirmModalMount',
          modalId: 'pageAddConfirmModal',
          closeHandler: 'closePageAddConfirm',
          confirmHandler: 'confirmPageAdd',
          pageLabelId: 'nextPageNum',
          analytics: 'ad_charge_click|hoxy_number|modal|confirm_page_add|'
        },
        {
          mountId: 'savedPageAddConfirmModalMount',
          modalId: 'savedPageAddConfirmModal',
          closeHandler: 'closeSavedPageAddConfirm',
          confirmHandler: 'confirmSavedPageAdd',
          pageLabelId: 'nextSavedPageNum',
          analytics: 'ad_charge_click|hoxy_number|modal|confirm_saved_page_add|'
        }
      ];

      configs.forEach((config) => {
        const mount = document.getElementById(config.mountId);
        if (!mount) return;

        mount.innerHTML = `
          <div id="${config.modalId}" class="modal-backdrop">
            <div class="hoxy-modal-panel hoxy-modal-w-480 hoxy-modal-pad-6">
              <div class="text-center mb-6">
                <div class="text-lg font-bold text-gray-900 mb-4"><span id="${config.pageLabelId}">2</span>페이지 추가하기</div>
                <div class="text-sm text-gray-600">다음 페이지가 추가됩니다!</div>
              </div>

              <div class="flex gap-3">
                <button onclick="${config.closeHandler}()" class="hoxy-modal-btn-cancel">
                  취소하기
                </button>
                <button onclick="${config.confirmHandler}()" class="hoxy-modal-btn-primary-blue flex items-center justify-center gap-2" data-analytics="${config.analytics}">
                  <span class="text-lg">📄</span>
                  페이지 추가
                </button>
              </div>
            </div>
          </div>
        `;
      });
    }

    function renderChargeModals() {
      const configs = [
        {
          mountId: 'adForQuotaModalMount',
          modalId: 'adForQuotaModal',
          closeHandler: 'closeAdForQuotaModal',
          confirmHandler: 'confirmAdForQuota',
          analytics: 'ad_charge_click|hoxy_number|modal|confirm_free_charge|',
          contentHtml: `
            <div class="text-center mb-6">
              <div class="text-3xl mb-3">🎁</div>
              <div class="text-2xl font-bold text-gray-900 mb-4">무료 횟수 +5회 충전</div>
              <div class="text-sm text-gray-600 mb-2">생성 횟수 5회가 무료로 추가됩니다!</div>
              <div class="text-xs text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full inline-block">
                남은 충전 횟수: <span id="adQuotaRemaining" class="font-bold">3</span>/3회 (12시간 주기)
              </div>
            </div>
          `,
          confirmBtnClass: 'hoxy-modal-btn-primary-blue hoxy-modal-btn-icon',
          confirmIcon: '🎁',
          confirmLabel: '무료 충전',
          cancelLabel: '취소하기'
        },
        {
          mountId: 'expandSlotsModalMount',
          modalId: 'expandSlotsModal',
          closeHandler: 'closeExpandSlotsModal',
          confirmHandler: 'confirmExpandSlots',
          analytics: 'ad_charge_click|hoxy_number|modal|confirm_expand_slots|',
          contentHtml: `
            <div class="text-center mb-6">
              <div class="text-3xl mb-4">📦</div>
              <div class="text-lg font-bold text-gray-900 mb-2">슬롯 +5개 추가</div>
              <div class="text-sm text-gray-600 mb-4">최근 생성 번호 슬롯이 5개 추가됩니다!</div>
              <div class="bg-purple-50 rounded-xl p-3 text-sm">
                <div class="text-gray-700">현재 슬롯: <span class="font-bold text-purple-700"><span id="currentSlotsDisplay">5</span>개</span></div>
                <div class="text-gray-700">추가 후: <span class="font-bold text-purple-700"><span id="afterSlotsDisplay">10</span>개</span></div>
              </div>
            </div>
          `,
          confirmBtnClass: 'hoxy-modal-btn-primary-purple hoxy-modal-btn-icon',
          confirmIcon: '📦',
          confirmLabel: '슬롯 추가',
          cancelLabel: '취소'
        }
      ];

      configs.forEach((config) => {
        const mount = document.getElementById(config.mountId);
        if (!mount) return;

        mount.innerHTML = `
          <div id="${config.modalId}" class="modal-backdrop">
            <div class="hoxy-modal-panel hoxy-modal-w-480 hoxy-modal-pad-6">
              ${config.contentHtml}
              <div class="flex gap-3">
                <button onclick="${config.closeHandler}()" class="hoxy-modal-btn-cancel">
                  ${config.cancelLabel}
                </button>
                <button onclick="${config.confirmHandler}()" class="${config.confirmBtnClass}" data-analytics="${config.analytics}">
                  <span class="text-lg">${config.confirmIcon}</span>
                  ${config.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        `;
      });
    }

    // ==================== 토스트 메시지 ====================
    
    function showToast(message, duration = 2000) {
      const toast = document.getElementById('toast');
      const toastMessage = document.getElementById('toastMessage');
      
      if (!toast || !toastMessage) return;
      
      toastMessage.textContent = message;
      setClassActive(toast, 'show', true);
      
      setTimeout(() => {
        setClassActive(toast, 'show', false);
      }, duration);
    }

    // ==================== 로또 번호 생성 ====================
    
    function generateLottoNumbers() {
      const numbers = [];
      while (numbers.length < 6) {
        const num = Math.floor(Math.random() * 45) + 1;
        if (!numbers.includes(num)) {
          numbers.push(num);
        }
      }
      return numbers.sort((a, b) => a - b);
    }

    // ==================== 생성 확인 모달 ====================
    
    function showGenerateConfirm() {
      const quota = getQuota();
      if (quota.remaining <= 0) {
        // 할당량이 0이면 광고 시청 모달 표시
        showAdForQuotaModal();
        return;
      }

      const confirmRemainingEl = document.getElementById('confirmRemaining');
      const confirmTotalEl = document.getElementById('confirmTotal');
      const option5TimesEl = document.getElementById('option5Times');
      const optionRemainingEl = document.getElementById('optionRemaining');
      const remainingCountEl = document.getElementById('remainingDrawCount');

      if (confirmRemainingEl) confirmRemainingEl.textContent = quota.remaining;
      if (confirmTotalEl) confirmTotalEl.textContent = quota.total;

      // 할당량에 따라 옵션 표시 변경
      if (quota.remaining >= 5) {
        // 5회 이상: 5회 연속 뽑기 옵션
        setHidden(option5TimesEl, false);
        setHidden(optionRemainingEl, true);
      } else {
        // 4회 이하: 남은 횟수 모두 뽑기 옵션
        setHidden(option5TimesEl, true);
        setHidden(optionRemainingEl, false);
        if (remainingCountEl) remainingCountEl.textContent = quota.remaining;
      }

      setModalActive('generateConfirmModal', true);
    }

    function closeGenerateConfirm() {
      const checkboxEl = document.getElementById('generate5Times');
      const checkboxRemainingEl = document.getElementById('generateRemaining');

      setModalActive('generateConfirmModal', false);
      if (checkboxEl) checkboxEl.checked = false;
      if (checkboxRemainingEl) checkboxRemainingEl.checked = false;
    }

    function confirmGenerate() {
      const checkboxEl = document.getElementById('generate5Times');
      const checkboxRemainingEl = document.getElementById('generateRemaining');
      const is5Times = checkboxEl ? checkboxEl.checked : false;
      const isRemaining = checkboxRemainingEl ? checkboxRemainingEl.checked : false;

      const quota = getQuota();
      let count = 1;

      if (is5Times) {
        count = 5;
      } else if (isRemaining) {
        count = quota.remaining;
      }

      if (quota.remaining < count) {
        showToast(`남은 횟수가 부족합니다! (${quota.remaining}회)`, 3000);
        return;
      }

      closeGenerateConfirm();
      showGeneratingAnimation(count);
    }

    // ==================== 무료 횟수 충전 모달 ====================

    function showAdForQuotaModal() {
      // 충전 횟수 제한 체크
      if (!canUseAdQuota()) {
        const remaining = getRemainingAdQuota();
        showToast(`무료 충전 횟수를 모두 사용했습니다. (12시간 후 초기화)`, 3000);
        return;
      }

      // 남은 충전 횟수 표시 업데이트
      const remainingEl = document.getElementById('adQuotaRemaining');
      if (remainingEl) {
        remainingEl.textContent = getRemainingAdQuota();
      }

      setModalActive('adForQuotaModal', true);
    }

    function closeAdForQuotaModal() {
      setModalActive('adForQuotaModal', false);
    }

    function confirmAdForQuota() {
      // 충전 횟수 제한 체크
      if (!canUseAdQuota()) {
        closeAdForQuotaModal();
        showToast('무료 충전 횟수를 모두 사용했습니다.', 2000);
        return;
      }

      closeAdForQuotaModal();
      showToast('충전 중...', 2000);

      setTimeout(() => {
        useAdQuota();  // 충전 횟수 사용
        addQuota(5);
        updateUI();
        const remaining = getRemainingAdQuota();
        showToast(`생성 횟수 5회가 추가되었습니다! (남은 충전: ${remaining}회)`, 2500);
      }, 3000);
    }

    // ==================== 5줄 확장 확인 모달 ====================
    
    function showExpandSlotsModal() {
      if (recentSlots >= 50) {
        showToast('이미 최대 슬롯(50개)입니다', 2000);
        return;
      }
      
      const currentEl = document.getElementById('currentSlotsDisplay');
      const afterEl = document.getElementById('afterSlotsDisplay');
      if (currentEl) currentEl.textContent = recentSlots;
      if (afterEl) afterEl.textContent = Math.min(recentSlots + 5, 50);
      setModalActive('expandSlotsModal', true);
    }

    function closeExpandSlotsModal() {
      setModalActive('expandSlotsModal', false);
    }

    function confirmExpandSlots() {
      closeExpandSlotsModal();
      showToast('슬롯 추가 중...', 1500);
      
      setTimeout(() => {
        recentSlots = Math.min(recentSlots + 5, 50);
        localStorage.setItem(STORAGE_KEYS.RECENT_SLOTS, recentSlots.toString());
        
        const countEl = document.getElementById('recentSlotsCount');
        if (countEl) countEl.textContent = recentSlots;
        
        updateUI();
        showToast(`슬롯이 ${recentSlots}개로 확장되었습니다!`, 2000);
      }, 1500);
    }

    // ==================== 페이지네이션 ====================
    
    function updatePagination() {
      const recent = getRecent();
      const totalItems = recent.length;
      const totalPages = Math.min(Math.ceil(totalItems / itemsPerPage), maxPages);
      
      const currentPageEl = document.getElementById('currentPage');
      const totalPagesEl = document.getElementById('totalPages');
      const dotsContainer = document.getElementById('paginationDots');
      const btnPrevPage = document.getElementById('btnPrevPage');
      const btnNextPage = document.getElementById('btnNextPage');
      
      if (currentPageEl) currentPageEl.textContent = currentPageIndex + 1;
      if (totalPagesEl) totalPagesEl.textContent = maxPages;
      
      // 페이지 dots 생성
      if (dotsContainer) {
        dotsContainer.innerHTML = '';
        
        for (let i = 0; i < maxPages; i++) {
          const dot = document.createElement('div');
          dot.className = 'pagination-dot' + (i === currentPageIndex ? ' active' : '');
          dot.onclick = () => goToPage(i);
          dotsContainer.appendChild(dot);
        }
      }
      
      // 이전/다음 버튼 상태
      if (btnPrevPage) btnPrevPage.disabled = currentPageIndex === 0;
      if (btnNextPage) btnNextPage.disabled = currentPageIndex >= maxPages - 1;
      
      renderCurrentPage();
    }

    function renderCurrentPage() {
      const recent = getRecent();
      const container = document.getElementById('recentNumbersList');
      
      if (!container) return;
      
      // 슬롯 시스템: recentSlots 만큼만 표시
      const displayItems = recent.slice(0, recentSlots);
      
      // 빈 슬롯 생성
      const slots = [];
      for (let i = 0; i < recentSlots; i++) {
        if (i < displayItems.length) {
          // 실제 데이터가 있는 슬롯
          slots.push({
            type: 'filled',
            data: displayItems[i],
            index: i
          });
        } else {
          // 빈 슬롯
          slots.push({
            type: 'empty',
            index: i
          });
        }
      }
      
      container.innerHTML = slots.map(slot => {
        if (slot.type === 'empty') {
          return `
            <div class="hoxy-slot-empty-row hoxy-slot-empty-row-center">
              <span class="hoxy-slot-empty-index">#${slot.index + 1}</span>
              <div class="hoxy-slot-empty-balls hoxy-slot-empty-balls-center">
                <div class="hoxy-slot-empty-ball"></div>
                <div class="hoxy-slot-empty-ball"></div>
                <div class="hoxy-slot-empty-ball"></div>
                <div class="hoxy-slot-empty-ball"></div>
                <div class="hoxy-slot-empty-ball"></div>
                <div class="hoxy-slot-empty-ball"></div>
              </div>
            </div>
          `;
        } else {
          return `
            <div class="swipe-item relative group" data-index="${slot.index}" data-numbers='${JSON.stringify(slot.data.numbers)}' data-target-draw="${slot.data.targetDraw || getNextDrawNumber()}">
              <div class="swipe-content hoxy-swipe-content ${slot.index === 0 ? 'hoxy-swipe-content-top' : 'hoxy-swipe-content-default'}">
                <span class="hoxy-swipe-index ${slot.index === 0 ? 'hoxy-swipe-index-top' : 'hoxy-swipe-index-default'}">#${slot.index + 1}</span>
                <div class="flex gap-1 justify-center flex-1">
                  ${renderNumberBalls(slot.data.numbers)}
                </div>
                <!-- PC 호버 버튼 -->
                <div class="hoxy-hover-actions">
                  <button onclick="hoverSave(${slot.index})" class="hoxy-icon-action-btn hoxy-icon-action-save" title="저장">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                    </svg>
                  </button>
                  <button onclick="hoverDelete(${slot.index})" class="hoxy-icon-action-btn hoxy-icon-action-delete" title="삭제">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          `;
        }
      }).join('');
      
      // 스와이프 이벤트 리스너 추가
      initSwipeListeners();
    }

    function prevPage() {
      if (currentPageIndex > 0) {
        currentPageIndex--;
        updatePagination();
      }
    }

    function nextPage() {
      const nextPageIndex = currentPageIndex + 1;
      
      // 다음 페이지가 잠겨있는지 확인
      if (nextPageIndex >= unlockedPages) {
        showPageAddConfirm(nextPageIndex + 1);
        return;
      }
      
      if (nextPageIndex < maxPages) {
        currentPageIndex = nextPageIndex;
        updatePagination();
      }
    }

    function goToPage(pageIndex) {
      // 해당 페이지가 잠겨있는지 확인
      if (pageIndex >= unlockedPages) {
        showPageAddConfirm(pageIndex + 1);
        return;
      }
      
      currentPageIndex = pageIndex;
      updatePagination();
    }

    function showPageAddConfirm(pageNum) {
      const pageNumEl = document.getElementById('nextPageNum');
      if (pageNumEl) pageNumEl.textContent = pageNum;
      setModalActive('pageAddConfirmModal', true);
    }

    function closePageAddConfirm() {
      setModalActive('pageAddConfirmModal', false);
    }

    function confirmPageAdd() {
      closePageAddConfirm();
      showToast('페이지 추가 중...', 1500);
      
      setTimeout(() => {
        // 페이지 잠금 해제
        unlockedPages++;
        localStorage.setItem(STORAGE_KEYS.PAGES_UNLOCKED, unlockedPages.toString());
        
        // 해당 페이지로 이동
        currentPageIndex = unlockedPages - 1;
        updatePagination();
        showToast(`${unlockedPages}페이지가 추가되었습니다!`, 2000);
      }, 1500);
    }

    // ==================== 생성 애니메이션 ====================
    
    function showGeneratingAnimation(count) {
      const modalEl = document.getElementById('generatingModal');
      if (!modalEl) return;
      
      setModalActive('generatingModal', true);
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          setTimeout(() => {
            setModalActive('generatingModal', false);
            showGeneratedComplete(count);
          }, 500);
        }
        
        updateGeneratingProgressUI(progress);
      }, 250);
    }

    function updateGeneratingProgressUI(progress) {
      const percentEl = document.getElementById('loadingPercent');
      const barEl = document.getElementById('loadingProgressBar');
      const messageEl = document.getElementById('loadingMessage');

      if (percentEl) percentEl.textContent = Math.round(progress);
      if (barEl) barEl.style.width = progress + '%';
      if (messageEl) messageEl.textContent = getLoadingMessage(progress);
    }

    function getLoadingMessage(progress) {
      if (progress < 20) {
        return '랜덤 번호 생성 중...';
      }
      if (progress < 40) {
        return '행운의 조합 찾는 중...';
      }
      if (progress < 60) {
        return '당첨 확률 계산 중...';
      }
      if (progress < 80) {
        return '마지막 검증 중...';
      }
      return '완료!';
    }

    function showGeneratedComplete(count) {
      for (let i = 0; i < count; i++) {
        const numbers = generateLottoNumbers();
        addToRecent(numbers);

        // Firebase에 저장
        saveToFirebase(numbers);
      }
      useQuota(count);
      updateUI();

      setModalActive('generatedModal', true);
    }

    // 다음 추첨 회차 계산
    // - 발표된 회차(winning.drawNumber) + 1 = 다음 회차
    // - 지금 생성하는 번호는 다음 추첨을 위한 것
    function getNextDrawNumber() {
      const winning = getWinningNumbers();
      return winning.drawNumber + 1;
    }

    // Firebase에 번호 저장 (다음 회차로 저장)
    function saveToFirebase(numbers) {
      try {
        const nextDraw = getNextDrawNumber();
        db.collection('generated_numbers').add({
          numbers: numbers,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          week: nextDraw,  // 다음 회차로 저장
          createdAt: new Date().toISOString()
        });
        console.log(`번호가 Firebase에 저장되었습니다 (${nextDraw}회차):`, numbers);
      } catch (error) {
        console.error('Firebase 저장 오류:', error);
      }
    }

    function closeGeneratedModal() {
      setModalActive('generatedModal', false);
      
      setTimeout(() => {
        currentPageIndex = 0;
        updatePagination();
        const recentSection = document.getElementById('recentNumbersList');
        if (recentSection) {
          recentSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }

    // ==================== 할당량 관리 ====================
    
    function initQuota() {
      const today = new Date().toDateString();
      const stored = localStorage.getItem(STORAGE_KEYS.QUOTA);
      
      if (!stored) {
        const quota = { date: today, total: 10, used: 0 };
        localStorage.setItem(STORAGE_KEYS.QUOTA, JSON.stringify(quota));
        return;
      }

      const quota = JSON.parse(stored);
      if (quota.date !== today) {
        quota.date = today;
        quota.total = 10;  // total도 10으로 리셋
        quota.used = 0;
        localStorage.setItem(STORAGE_KEYS.QUOTA, JSON.stringify(quota));
      }
    }

    function getQuota() {
      const stored = localStorage.getItem(STORAGE_KEYS.QUOTA);
      const quota = stored ? JSON.parse(stored) : { date: new Date().toDateString(), total: 10, used: 0 };
      
      // used가 total을 초과하는 경우 수정
      if (quota.used > quota.total) {
        quota.used = quota.total;
      }
      
      return {
        total: quota.total,
        used: quota.used,
        remaining: Math.max(0, quota.total - quota.used)
      };
    }

    function useQuota(count) {
      const stored = localStorage.getItem(STORAGE_KEYS.QUOTA);
      const quota = JSON.parse(stored);
      
      // used가 total을 초과하지 않도록 제한
      quota.used = Math.min(quota.used + count, quota.total);
      
      localStorage.setItem(STORAGE_KEYS.QUOTA, JSON.stringify(quota));
    }

    // 12시간 주기 ID 계산
    function getAdPeriodId() {
      const now = new Date();
      const hour = now.getHours();
      const dateStr = now.toDateString();

      // 0~11시: 오전 주기, 12~23시: 오후 주기
      return hour < 12 ? dateStr + '_AM' : dateStr + '_PM';
    }

    // 광고 횟수 제한 확인 (12시간 3회)
    function getAdQuotaLimit() {
      const periodId = getAdPeriodId();
      const stored = localStorage.getItem(STORAGE_KEYS.AD_QUOTA_LIMIT);

      if (stored) {
        const data = JSON.parse(stored);
        if (data.periodId === periodId) {
          return data;
        }
      }

      // 새 주기 시작
      return { periodId: periodId, count: 0, max: 3 };
    }

    // 광고 횟수 사용
    function useAdQuota() {
      const data = getAdQuotaLimit();
      data.count++;
      localStorage.setItem(STORAGE_KEYS.AD_QUOTA_LIMIT, JSON.stringify(data));
      return data;
    }

    // 광고 횟수 제한 체크
    function canUseAdQuota() {
      const data = getAdQuotaLimit();
      return data.count < data.max;
    }

    // 남은 광고 횟수
    function getRemainingAdQuota() {
      const data = getAdQuotaLimit();
      return Math.max(0, data.max - data.count);
    }

    function addQuota(count) {
      const stored = localStorage.getItem(STORAGE_KEYS.QUOTA);
      const quota = JSON.parse(stored);

      // total은 항상 10으로 고정
      quota.total = 10;

      // used를 감소시켜서 remaining 증가 (음수 방지)
      quota.used = Math.max(0, quota.used - count);

      localStorage.setItem(STORAGE_KEYS.QUOTA, JSON.stringify(quota));
    }

    function resetQuota() {
      if (confirm('할당량을 초기화하시겠습니까?')) {
        const today = new Date().toDateString();
        const quota = { date: today, total: 10, used: 0 };
        localStorage.setItem(STORAGE_KEYS.QUOTA, JSON.stringify(quota));
        updateUI();
        showToast('할당량이 초기화되었습니다!');
      }
    }
    
    // 전역으로 명시적 노출
    window.resetQuota = resetQuota;

    function checkDateReset() {
      const today = new Date().toDateString();
      const stored = localStorage.getItem(STORAGE_KEYS.QUOTA);
      if (stored) {
        const quota = JSON.parse(stored);
        if (quota.date !== today) {
          initQuota();
          updateUI();
        }
      }
    }

    // ==================== 최근 번호 관리 ====================

    function addToRecent(numbers) {
      const recent = getRecent();
      const targetDraw = getNextDrawNumber(); // 다음 회차용 번호

      // 최대 50개까지만 저장
      if (recent.length >= 50) {
        recent.pop();
      }

      recent.unshift({ numbers, timestamp: Date.now(), targetDraw });
      localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(recent));
    }

    function getRecent() {
      const stored = localStorage.getItem(STORAGE_KEYS.RECENT);
      return stored ? JSON.parse(stored) : [];
    }

    function clearRecentNumbers() {
      if (confirm('최근 생성된 모든 번호를 삭제하시겠습니까?')) {
        localStorage.removeItem(STORAGE_KEYS.RECENT);
        renderCurrentPage();
        showToast('최근 생성 번호가 모두 삭제되었습니다', 2000);
      }
    }
    
    // 전역으로 명시적 노출
    window.clearRecentNumbers = clearRecentNumbers;

    function deleteRecentNumber(index) {
      const recent = getRecent();
      recent.splice(index, 1);
      localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(recent));

      renderCurrentPage();
      updateRecentNumbersPreview();  // 내 번호 탭 프리뷰도 업데이트
      showToast('삭제되었습니다', 1500);
    }
    
    // 전역으로 명시적 노출
    window.deleteRecentNumber = deleteRecentNumber;

    // 액션 관련 변수
    let currentActionIndex = null;
    let currentActionNumbers = null;
    let currentActionTargetDraw = null;

    // 스와이프 상태 변수 (이벤트 위임용)
    let swipeState = {
      item: null,
      content: null,
      startX: 0,
      startY: 0,
      currentX: 0,
      isSwiping: false
    };

    // 스와이프 상태 초기화
    function resetSwipe() {
      if (swipeState.content) {
        swipeState.content.style.transform = 'translateX(0)';
      }
      if (swipeState.item) {
        setClassActive(swipeState.item, 'swiping', false);
      }
      swipeState = {
        item: null,
        content: null,
        startX: 0,
        startY: 0,
        currentX: 0,
        isSwiping: false
      };
    }

    // 이벤트 위임 방식으로 스와이프 처리 (한 번만 등록)
    function initSwipeListeners() {
      const container = document.getElementById('recentNumbersList');
      if (!container || container.dataset.swipeInit === 'true') return;

      container.dataset.swipeInit = 'true';

      // 터치 시작
      container.addEventListener('touchstart', (e) => {
        const item = e.target.closest('.swipe-item');
        if (!item) return;

        const content = item.querySelector('.swipe-content');
        if (!content) return;

        swipeState.item = item;
        swipeState.content = content;
        swipeState.startX = e.touches[0].clientX;
        swipeState.startY = e.touches[0].clientY;
        swipeState.currentX = swipeState.startX;
        swipeState.isSwiping = true;

        setClassActive(item, 'swiping', true);
      }, { passive: true });

      // 터치 이동
      container.addEventListener('touchmove', (e) => {
        if (!swipeState.isSwiping || !swipeState.item) return;

        swipeState.currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = swipeState.currentX - swipeState.startX;
        const diffY = Math.abs(currentY - swipeState.startY);

        // 세로 스크롤 시 스와이프 취소
        if (diffY > 30) {
          resetSwipe();
          return;
        }

        // 양방향 스와이프 (최대 ±80px)
        if (swipeState.content) {
          const translateX = Math.max(-80, Math.min(80, diffX));
          swipeState.content.style.transform = `translateX(${translateX}px)`;
        }
      }, { passive: true });

      // 터치 종료
      container.addEventListener('touchend', () => {
        if (!swipeState.isSwiping || !swipeState.item) {
          resetSwipe();
          return;
        }

        const diffX = swipeState.currentX - swipeState.startX;
        const item = swipeState.item;

        // 50px 이상 우측 스와이프 (좌→우) = 저장 확인
        if (diffX > 50) {
          if (navigator.vibrate) navigator.vibrate(30);
          openSaveConfirm(item);
          resetSwipe();
          return;
        }

        // 50px 이상 좌측 스와이프 (우→좌) = 삭제 확인
        if (diffX < -50) {
          if (navigator.vibrate) navigator.vibrate(30);
          openDeleteConfirm(item);
          resetSwipe();
          return;
        }

        resetSwipe();
      });

      // 터치 취소
      container.addEventListener('touchcancel', () => {
        resetSwipe();
      });
    }

    // 저장 확인 모달 열기 (스와이프용)
    function openSaveConfirm(item) {
      currentActionIndex = parseInt(item.dataset.index);
      currentActionNumbers = JSON.parse(item.dataset.numbers);
      currentActionTargetDraw = parseInt(item.dataset.targetDraw) || getNextDrawNumber();

      const numbersEl = document.getElementById('saveConfirmNumbers');

      if (numbersEl && currentActionNumbers) {
        numbersEl.innerHTML = renderNumberBalls(currentActionNumbers);
      }

      setModalActive('saveConfirmModal', true);
    }

    // 저장 확인 모달 닫기
    function closeSaveConfirm() {
      setModalActive('saveConfirmModal', false);
      currentActionIndex = null;
      currentActionNumbers = null;
      currentActionTargetDraw = null;
    }

    // 저장 확인
    function confirmSaveNumber() {
      if (currentActionNumbers) {
        saveNumber(currentActionNumbers, currentActionTargetDraw);
      }
      closeSaveConfirm();
    }

    // 삭제 확인 모달 열기 (스와이프용)
    function openDeleteConfirm(item) {
      currentActionIndex = parseInt(item.dataset.index);
      currentActionNumbers = JSON.parse(item.dataset.numbers);

      const numbersEl = document.getElementById('deleteConfirmNumbers');

      if (numbersEl && currentActionNumbers) {
        numbersEl.innerHTML = renderNumberBalls(currentActionNumbers);
      }

      setModalActive('deleteConfirmModal', true);
    }

    // 삭제 확인 모달 닫기
    function closeDeleteConfirm() {
      setModalActive('deleteConfirmModal', false);
      currentActionIndex = null;
      currentActionNumbers = null;
    }

    // 삭제 확인
    function confirmDeleteNumber() {
      if (currentActionIndex !== null) {
        deleteRecentNumber(currentActionIndex);
      }
      closeDeleteConfirm();
    }

    // PC 호버 버튼 - 저장
    function hoverSave(index) {
      const recent = getRecent();
      if (recent[index]) {
        saveNumber(recent[index].numbers, recent[index].targetDraw);
      }
    }

    // PC 호버 버튼 - 삭제
    function hoverDelete(index) {
      deleteRecentNumber(index);
    }

    // 전역 함수 등록
    window.openSaveConfirm = openSaveConfirm;
    window.closeSaveConfirm = closeSaveConfirm;
    window.confirmSaveNumber = confirmSaveNumber;
    window.openDeleteConfirm = openDeleteConfirm;
    window.closeDeleteConfirm = closeDeleteConfirm;
    window.confirmDeleteNumber = confirmDeleteNumber;
    window.hoverSave = hoverSave;
    window.hoverDelete = hoverDelete;

    // ==================== 저장된 번호 관리 ====================
    
    function saveNumber(numbers, targetDraw = null) {
      const saved = getSaved();
      // 저장 가능한 최대 수량 = 잠금해제된 페이지 * 페이지당 항목 수
      const maxSavable = savedUnlockedPages * savedItemsPerPage;

      if (saved.length >= maxSavable) {
        showToast(`저장 공간이 부족합니다. 내 번호 탭에서 페이지를 확장해주세요 (${saved.length}/${maxSavable})`, 2000);
        return;
      }

      // targetDraw가 없으면 다음 회차로 설정
      const drawNumber = targetDraw || getNextDrawNumber();

      const exists = saved.some(item => JSON.stringify(item.numbers) === JSON.stringify(numbers));

      if (exists) {
        showToast('이미 저장된 번호입니다!', 2000);
        return;
      }

      saved.push({ numbers, timestamp: Date.now(), targetDraw: drawNumber });
      localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(saved));
      updateUI();
      updateWinningStats();
      showToast('✅ 저장되었습니다', 2000);
    }

    function saveAllRecentNumbers() {
      // 확장된 슬롯 수만큼만 가져오기 (recentSlots 기준)
      const recent = getRecent().slice(0, recentSlots);
      if (recent.length === 0) {
        showToast('저장할 번호가 없습니다', 2000);
        return;
      }

      const saved = getSaved();
      // 저장 가능한 최대 수량 = 잠금해제된 페이지 * 페이지당 항목 수
      const maxSavable = savedUnlockedPages * savedItemsPerPage;

      if (saved.length >= maxSavable) {
        showToast(`저장 공간이 부족합니다. 내 번호 탭에서 페이지를 확장해주세요`, 2000);
        return;
      }

      const availableSlots = maxSavable - saved.length;
      let savedCount = 0;

      for (const item of recent) {
        if (savedCount >= availableSlots) {
          showToast(`저장 공간 부족으로 ${savedCount}개만 저장되었습니다`, 2000);
          break;
        }

        const exists = saved.some(s => JSON.stringify(s.numbers) === JSON.stringify(item.numbers));
        if (!exists) {
          // targetDraw가 있으면 유지, 없으면 다음 회차
          const targetDraw = item.targetDraw || getNextDrawNumber();
          saved.push({ numbers: item.numbers, timestamp: Date.now(), targetDraw });
          savedCount++;
        }
      }

      if (savedCount > 0) {
        localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(saved));
        updateUI();
        updateWinningStats();
        showToast(`✅ ${savedCount}개 번호가 저장되었습니다`, 2000);
      } else {
        showToast('모든 번호가 이미 저장되어 있습니다', 2000);
      }
    }

    function getSaved() {
      const stored = localStorage.getItem(STORAGE_KEYS.SAVED);
      return stored ? JSON.parse(stored) : [];
    }

    function deleteSaved(index) {
      if (confirm('저장된 번호를 삭제하시겠습니까?')) {
        const saved = getSaved();
        saved.splice(index, 1);
        localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(saved));

        // 현재 페이지가 비었으면 이전 페이지로
        const startIndex = savedCurrentPageIndex * savedItemsPerPage;
        if (startIndex >= saved.length && savedCurrentPageIndex > 0) {
          savedCurrentPageIndex--;
        }

        updateUI();
        updateWinningStats();
        showToast('삭제되었습니다');
      }
    }

    // ==================== 직접 번호 입력 ====================

    function onManualNumberInput(input, index) {
      // 숫자만 허용
      input.value = input.value.replace(/[^0-9]/g, '');

      // 중복 체크 및 경고 표시
      checkManualDuplicate(input, index);

      // 2자리 입력 시 다음 칸으로 자동 이동
      if (input.value.length === 2 && index < 6) {
        const nextInput = document.getElementById(`manualNum${index + 1}`);
        if (nextInput) nextInput.focus();
      }

      // 저장 버튼 상태 업데이트
      updateManualSaveButton();
    }

    // 포커스 벗어날 때 중복 체크 (길이 상관없이)
    function onManualNumberBlur(input, index) {
      checkManualDuplicateOnBlur(input, index);
    }

    function checkManualDuplicateOnBlur(currentInput, currentIndex) {
      const hintEl = document.getElementById('manualNumberHint');
      if (!hintEl) return;

      const currentValue = currentInput.value;
      if (!currentValue) {
        setInputErrorState(currentInput, false);
        return;
      }

      const currentNum = parseInt(currentValue);

      // 다른 입력칸과 중복 체크 (숫자 값으로 비교)
      let hasDuplicate = false;
      for (let i = 1; i <= 6; i++) {
        if (i === currentIndex) continue;
        const otherInput = document.getElementById(`manualNum${i}`);
        if (otherInput && otherInput.value) {
          const otherNum = parseInt(otherInput.value);
          if (currentNum === otherNum) {
            hasDuplicate = true;
            break;
          }
        }
      }

      if (hasDuplicate) {
        hintEl.textContent = '⚠️ 중복된 번호입니다. 다시 입력해주세요.';
        hintEl.className = 'text-xs text-center text-red-500 font-medium mb-3';
        setInputErrorState(currentInput, true);
      } else {
        resetManualHint();
        setInputErrorState(currentInput, false);
      }
    }

    window.onManualNumberBlur = onManualNumberBlur;

    function checkManualDuplicate(currentInput, currentIndex) {
      const hintEl = document.getElementById('manualNumberHint');
      if (!hintEl) return;

      const currentValue = currentInput.value;
      if (!currentValue) {
        // 입력값이 없으면 기본 힌트로 복원
        resetManualHint();
        setInputErrorState(currentInput, false);
        return;
      }

      // 1자리 입력 중이면 아직 체크하지 않음 (10-19 등 입력 중일 수 있음)
      // 2자리 완성 시에만 중복 체크
      if (currentValue.length < 2) {
        setInputErrorState(currentInput, false);
        resetManualHint();
        return;
      }

      const currentNum = parseInt(currentValue);

      // 다른 입력칸과 중복 체크 (숫자 값으로 비교)
      let hasDuplicate = false;
      for (let i = 1; i <= 6; i++) {
        if (i === currentIndex) continue;
        const otherInput = document.getElementById(`manualNum${i}`);
        if (otherInput && otherInput.value) {
          const otherNum = parseInt(otherInput.value);
          if (currentNum === otherNum) {
            hasDuplicate = true;
            break;
          }
        }
      }

      if (hasDuplicate) {
        // 중복 경고 표시
        hintEl.textContent = '⚠️ 중복된 번호입니다. 다시 입력해주세요.';
        hintEl.className = 'text-xs text-center text-red-500 font-medium mb-3';
        setInputErrorState(currentInput, true);
      } else {
        // 정상 상태로 복원
        resetManualHint();
        setInputErrorState(currentInput, false);
      }
    }

    function resetManualHint() {
      const hintEl = document.getElementById('manualNumberHint');
      if (hintEl) {
        hintEl.textContent = '1~45 사이 숫자, 중복 불가';
        hintEl.className = 'text-xs text-center text-gray-400 mb-3';
      }
    }

    function getManualNumbers() {
      const numbers = [];
      for (let i = 1; i <= 6; i++) {
        const input = document.getElementById(`manualNum${i}`);
        if (input && input.value) {
          numbers.push(parseInt(input.value));
        }
      }
      return numbers;
    }

    function validateManualNumbers() {
      const numbers = getManualNumbers();

      // 6개 모두 입력되었는지 확인
      if (numbers.length !== 6) return { valid: false, message: '6개 번호를 모두 입력해주세요' };

      // 1~45 범위 체크
      for (const num of numbers) {
        if (num < 1 || num > 45) {
          return { valid: false, message: '1~45 사이 숫자만 입력 가능합니다' };
        }
      }

      // 중복 체크
      const unique = new Set(numbers);
      if (unique.size !== 6) {
        return { valid: false, message: '중복된 번호가 있습니다' };
      }

      return { valid: true, numbers: numbers.sort((a, b) => a - b) };
    }

    function updateManualSaveButton() {
      const btn = document.getElementById('saveManualNumberBtn');
      if (!btn) return;

      const validation = validateManualNumbers();

      if (validation.valid) {
        btn.disabled = false;
        btn.className = 'w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all text-sm cursor-pointer shadow-lg';
      } else {
        btn.disabled = true;
        btn.className = 'w-full py-3 bg-gray-300 text-gray-500 font-bold rounded-xl transition-all text-sm cursor-not-allowed';
      }
    }

    function saveManualNumber() {
      const validation = validateManualNumbers();

      if (!validation.valid) {
        showToast(validation.message, 2000);
        return;
      }

      const targetDraw = getNextDrawNumber();

      // 최근 생성 번호에 추가 (사용자가 '생성'한 것으로 처리)
      addToRecent(validation.numbers);

      // 내 번호에 저장 (동일한 targetDraw 사용)
      saveNumber(validation.numbers, targetDraw);

      // UI 업데이트
      updateUI();

      // 입력창 초기화
      clearManualInputs();
    }

    function clearManualInputs() {
      for (let i = 1; i <= 6; i++) {
        const input = document.getElementById(`manualNum${i}`);
        if (input) {
          input.value = '';
          setInputErrorState(input, false, true);
        }
      }
      resetManualHint();
      updateManualSaveButton();
    }

    window.onManualNumberInput = onManualNumberInput;
    window.saveManualNumber = saveManualNumber;

    // ==================== 당첨 통계 업데이트 ====================

    async function updateWinningStats() {
      try {
        const winning = getWinningNumbers();
        if (!winning || !winning.drawNumber) {
          console.log('당첨 번호 정보가 없습니다');
          return;
        }

        // 회차 표시 업데이트
        updateElement('weeklyDrawNumber', winning.drawNumber);
        updateElement('mobileWeeklyDraw', winning.drawNumber);

        // 캐시된 주간 통계 확인
        const weeklyDocRef = db.collection('winning_stats').doc(`weekly_${winning.drawNumber}`);
        const weeklyDoc = await weeklyDocRef.get();

        let weeklyStats;

        if (weeklyDoc.exists) {
          // 캐시된 통계 사용
          weeklyStats = weeklyDoc.data();
          console.log('캐시된 주간 통계 사용:', weeklyStats);
        } else {
          // 새로 계산
          weeklyStats = await calculateWeeklyStats(winning);

          // Firestore에 캐시 저장
          if (weeklyStats.total > 0) {
            await weeklyDocRef.set({
              ...weeklyStats,
              drawNumber: winning.drawNumber,
              calculatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('주간 통계 캐시 저장 완료');
          }
        }

        const weeklyTotal = (weeklyStats.rank1 || 0) + (weeklyStats.rank2 || 0) +
                           (weeklyStats.rank3 || 0) + (weeklyStats.rank4 || 0) +
                           (weeklyStats.rank5 || 0);

        // 이번주 통계 UI 업데이트 (PC 사이드바)
        updateElement('weeklyRank1', weeklyStats.rank1 || 0);
        updateElement('weeklyRank2', weeklyStats.rank2 || 0);
        updateElement('weeklyRank3', weeklyStats.rank3 || 0);
        updateElement('weeklyRank4', weeklyStats.rank4 || 0);
        updateElement('weeklyRank5', weeklyStats.rank5 || 0);
        updateElement('weeklyTotalWinners', weeklyTotal);

        // 이번주 통계 UI 업데이트 (모바일 배너)
        updateElement('mobileWeeklyTotal', weeklyTotal);

        console.log('이번주 통계 업데이트 완료:', weeklyStats);

        // 역대 통계 로드
        await loadAllTimeStats();

      } catch (error) {
        console.error('통계 업데이트 오류:', error);
      }
    }

    // 주간 통계 계산
    async function calculateWeeklyStats(winning) {
      const snapshot = await db.collection('generated_numbers')
        .where('week', '==', winning.drawNumber)
        .get();

      let stats = {
        rank1: 0,
        rank2: 0,
        rank3: 0,
        rank4: 0,
        rank5: 0,
        total: snapshot.size
      };

      snapshot.forEach(doc => {
        const data = doc.data();
        if (!data.numbers || !Array.isArray(data.numbers)) return;

        const matchCount = countMatches(data.numbers, winning.numbers);
        const hasBonus = data.numbers.includes(winning.bonus);

        if (matchCount === 6) {
          stats.rank1++;
        } else if (matchCount === 5 && hasBonus) {
          stats.rank2++;
        } else if (matchCount === 5) {
          stats.rank3++;
        } else if (matchCount === 4) {
          stats.rank4++;
        } else if (matchCount === 3) {
          stats.rank5++;
        }
      });

      return stats;
    }

    // 역대 통계 로드 (모든 주간 통계 합산)
    async function loadAllTimeStats() {
      try {
        // 모든 주간 통계 문서 조회
        const snapshot = await db.collection('winning_stats')
          .where('drawNumber', '>', 0)
          .get();

        let allTime = { rank1: 0, rank2: 0, rank3: 0 };

        snapshot.forEach(doc => {
          const data = doc.data();
          allTime.rank1 += data.rank1 || 0;
          allTime.rank2 += data.rank2 || 0;
          allTime.rank3 += data.rank3 || 0;
        });

        // PC 사이드바
        updateElement('allTimeRank1', allTime.rank1);
        updateElement('allTimeRank2', allTime.rank2);
        updateElement('allTimeRank3', allTime.rank3);

        // 모바일 배너
        updateElement('mobileAllTimeR1', allTime.rank1);

        console.log('역대 통계 로드 완료:', allTime);

      } catch (error) {
        console.error('역대 통계 로드 오류:', error);
        // 에러 시 0으로 표시
        updateElement('allTimeRank1', 0);
        updateElement('allTimeRank2', 0);
        updateElement('allTimeRank3', 0);
        updateElement('mobileAllTimeR1', 0);
      }
    }

    // 요소 텍스트 업데이트 헬퍼
    function updateElement(id, value) {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    }

    function setElementDisplay(element, displayValue) {
      if (!element || !element.style) return;
      element.style.display = displayValue;
    }

    function setHidden(element, shouldHide) {
      if (!element || !element.classList) return;
      element.classList.toggle('hidden', shouldHide);
    }

    function setClassActive(element, className, isActive) {
      if (!element || !element.classList) return;
      element.classList.toggle(className, isActive);
    }

    function setElementClasses(element, classesToAdd = [], classesToRemove = []) {
      if (!element || !element.classList) return;
      if (classesToRemove.length > 0) {
        element.classList.remove(...classesToRemove);
      }
      if (classesToAdd.length > 0) {
        element.classList.add(...classesToAdd);
      }
    }

    function setInputErrorState(inputEl, hasError, includeDefaultBorder = false) {
      if (!inputEl || !inputEl.classList) return;
      if (hasError) {
        setElementClasses(inputEl, ['border-red-500'], ['border-gray-300', 'border-blue-500']);
        return;
      }
      setClassActive(inputEl, 'border-red-500', false);
      if (includeDefaultBorder) {
        setClassActive(inputEl, 'border-gray-300', true);
      }
    }

    // 일치하는 번호 개수 계산
    function countMatches(numbers, winningNumbers) {
      return numbers.filter(n => winningNumbers.includes(n)).length;
    }

    function closeWinningStatsCard() {
      // Green card 삭제로 인해 비활성화됨
    }

    // ==================== 모바일 통계 배너 ====================

    const STATS_HIDDEN_KEY = 'hoxy_stats_hidden_date';

    // 배너 초기화
    function initStatsCarousel() {
      // 오늘 숨김 여부 확인
      const hiddenDate = localStorage.getItem(STATS_HIDDEN_KEY);
      const today = new Date().toDateString();

      if (hiddenDate === today) {
        const banner = document.getElementById('mobileStatsBanner');
        setElementDisplay(banner, 'none');
      }
    }

    // 오늘 하루 숨김
    function hideStatsToday() {
      const today = new Date().toDateString();
      localStorage.setItem(STATS_HIDDEN_KEY, today);

      const banner = document.getElementById('mobileStatsBanner');
      if (banner) {
        banner.style.opacity = '0';
        banner.style.transform = 'scale(0.95)';
        setTimeout(() => {
          setElementDisplay(banner, 'none');
        }, 200);
      }

      showToast('오늘 하루 숨김', 1500);
    }

    // 전역 노출
    window.hideStatsToday = hideStatsToday;

    // ==================== 당첨 번호 관리 ====================

    // 로또 API에서 당첨 번호 가져오기 (JSONP 사용)
    async function fetchLotteryData(drawNo = null) {
      return new Promise((resolve) => {
        try {
          let settled = false;
          // JSONP를 사용하여 CORS 우회
          const callbackName = 'lottoCallback_' + Date.now();
          let apiUrl = `https://api.lotto-haru.kr/win/analysis.js?callback=${callbackName}`;

          // 특정 회차 지정 시
          if (drawNo) {
            apiUrl += `&chasu=${drawNo}`;
          }

          const script = document.createElement('script');
          let timeoutId = null;

          function finish(result) {
            if (settled) return;
            settled = true;
            delete window[callbackName];
            if (timeoutId) clearTimeout(timeoutId);
            if (script.parentNode) script.parentNode.removeChild(script);
            resolve(result);
          }

          // 전역 콜백 함수 등록
          window[callbackName] = function(data) {
            // 데이터 처리
            try {
              // 데이터 구조: { data: [{ball: [...], bonusBall: ..., chasu: ..., ...}] }
              const latestDraw = data.data ? data.data[0] : null;

              if (!latestDraw) {
                console.warn('데이터 파싱 실패, 구조:', data);
                throw new Error('데이터 없음');
              }

              // 등수별 당첨금 추출 (API 구조: win.win1~win5.payoutStr)
              const prizes = {};
              for (let i = 1; i <= 5; i++) {
                const winKey = `win${i}`;
                if (latestDraw.win?.[winKey]?.payoutStr) {
                  prizes[winKey] = latestDraw.win[winKey].payoutStr;
                } else if (latestDraw.win?.[winKey]?.payout) {
                  prizes[winKey] = parseInt(latestDraw.win[winKey].payout).toLocaleString();
                } else {
                  prizes[winKey] = '0';
                }
              }

              // 데이터 변환
              const result = {
                drawNumber: parseInt(latestDraw.chasu),
                drawDate: latestDraw.date,
                numbers: latestDraw.ball.map(n => parseInt(n)),
                bonus: parseInt(latestDraw.bonusBall),
                firstPrize: prizes.win1,
                prizes: prizes  // 모든 등수별 당첨금
              };

              finish(result);
            } catch (error) {
              console.warn('데이터 파싱 오류:', error);
              finish(null);
            }
          };

          // script 태그 생성 및 추가
          script.src = apiUrl;
          script.onerror = function() {
            console.warn('로또 API 호출 실패');
            finish(null);
          };
          document.body.appendChild(script);
          timeoutId = setTimeout(() => {
            console.warn('로또 API 타임아웃');
            finish(null);
          }, 8000);

        } catch (error) {
          console.warn('로또 API 호출 오류:', error);
          resolve(null);
        }
      });
    }

    // 최신 회차 번호 계산
    function getLatestDrawNumber() {
      // 로또 1회: 2002-12-07 (토), 한국 추첨 기준으로 계산
      const firstDrawUtcMs = Date.UTC(2002, 11, 7, 0, 0, 0); // 2002-12-07T00:00:00Z
      const now = new Date();

      // KST(+09:00) 기준 현재 시각을 UTC ms로 계산
      const kstOffsetMs = 9 * 60 * 60 * 1000;
      const nowKstMs = now.getTime() + kstOffsetMs;
      const nowKst = new Date(nowKstMs);

      // 기본 회차 계산 (KST 날짜 기준)
      const weeksDiff = Math.floor((nowKstMs - firstDrawUtcMs) / (7 * 24 * 60 * 60 * 1000));
      let drawNo = weeksDiff + 1;

      // 토요일 추첨 전(20:45 KST 이전)에는 아직 이번 회차가 미발표이므로 -1
      const day = nowKst.getUTCDay(); // KST 시각을 UTC getter로 읽으면 KST day/hour 값과 동일
      const hour = nowKst.getUTCHours();
      const minute = nowKst.getUTCMinutes();
      const beforeDrawCutoff = day === 6 && (hour < 20 || (hour === 20 && minute < 45));
      if (beforeDrawCutoff) drawNo -= 1;

      return Math.max(1, drawNo);
    }

    // 당첨 번호 로드 (API 우선, 실패시 폴백)
    async function loadWinningNumbers() {
      // LocalStorage에서 캐시된 데이터 확인
      const cached = localStorage.getItem(STORAGE_KEYS.WINNING);
      const cachedData = cached ? JSON.parse(cached) : null;

      // API에서 최신 당첨 번호 가져오기
      console.log('최신 당첨 번호 가져오는 중...');
      const apiData = await fetchLotteryData();

      if (apiData) {
        // 캐시된 데이터와 비교
        if (cachedData && cachedData.drawNumber === apiData.drawNumber) {
          winningData = cachedData;
          console.log('✅ 캐시된 데이터가 최신입니다:', cachedData.drawNumber);
          return;
        }

        // API 성공: 새로운 데이터 업데이트
        winningData = apiData;
        localStorage.setItem(STORAGE_KEYS.WINNING, JSON.stringify(apiData));
        console.log('✅ 최신 당첨 번호 업데이트 완료:', apiData.drawNumber, '회차');
        console.log('   당첨번호:', apiData.numbers.join(', '), '+ 보너스:', apiData.bonus);
      } else if (cachedData) {
        // API 실패 but 캐시 있음: 캐시 사용
        winningData = cachedData;
        console.log('⚠️ API 실패, 캐시된 데이터 사용:', cachedData.drawNumber);
      } else {
        // API 실패 & 캐시 없음: 하드코딩된 폴백 데이터 사용
        localStorage.setItem(STORAGE_KEYS.WINNING, JSON.stringify(winningData));
        console.log('⚠️ API 실패, 폴백 데이터 사용:', winningData.drawNumber);
      }
    }

    function getWinningNumbers() {
      const stored = localStorage.getItem(STORAGE_KEYS.WINNING);
      return stored ? JSON.parse(stored) : winningData;
    }

    // Firestore에 당첨 번호 저장
    async function saveWinningToFirestore(data) {
      try {
        await db.collection('winning_numbers').doc(String(data.drawNumber)).set({
          drawNumber: data.drawNumber,
          drawDate: data.drawDate,
          numbers: data.numbers,
          bonus: data.bonus,
          firstPrize: data.firstPrize,
          prizes: data.prizes || null,  // 등수별 당첨금 (win1~win5)
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ ${data.drawNumber}회차 당첨 정보 Firestore 저장 완료`);
      } catch (error) {
        console.error('Firestore 저장 오류:', error);
      }
    }

    // Firestore에서 당첨 번호 목록 로드
    async function loadWinningListFromFirestore() {
      try {
        const snapshot = await db.collection('winning_numbers')
          .orderBy('drawNumber', 'desc')
          .limit(10)
          .get();

        const list = [];
        snapshot.forEach(doc => {
          list.push(doc.data());
        });
        console.log(`✅ Firestore에서 ${list.length}개 회차 로드됨`);
        return list;
      } catch (error) {
        console.error('Firestore 로드 오류:', error);
        return [];
      }
    }

    // 드롭다운 초기화 (Firestore에서 로드) + 이벤트 리스너 등록
    async function initDrawSelect() {
      const select = document.getElementById('drawSelect');
      if (!select) return;

      select.innerHTML = '<option value="">불러오는 중...</option>';

      // Firestore에서 당첨 번호 목록 로드
      let winningList = await loadWinningListFromFirestore();

      // Firestore에 데이터가 없거나 부족하면 API에서 가져와서 저장
      // loadWinningNumbers()에서 검증된 최신 회차를 우선 사용해 미발표 회차 호출을 방지
      const latestDraw = (winningData && winningData.drawNumber) || getLatestDrawNumber();
      if (winningList.length === 0 || winningList[0].drawNumber < latestDraw) {
        console.log('🔄 최신 데이터 API에서 가져오는 중...');

        // 최근 10회차 API에서 가져오기
        for (let i = 0; i < 10; i++) {
          const drawNo = latestDraw - i;
          if (drawNo < 1) break;

          // 이미 있는지 확인
          const exists = winningList.find(w => w.drawNumber === drawNo);
          if (!exists) {
            const data = await fetchLotteryData(drawNo);
            if (data) {
              await saveWinningToFirestore(data);
              winningList.push(data);
            }
          }
        }

        // 다시 정렬
        winningList.sort((a, b) => b.drawNumber - a.drawNumber);
        winningList = winningList.slice(0, 10);
      }

      // 드롭다운 옵션 생성
      select.innerHTML = '';
      winningList.forEach(item => {
        const option = document.createElement('option');
        option.value = item.drawNumber;
        option.textContent = `${item.drawNumber}회차 (${item.drawDate})`;
        select.appendChild(option);
      });

      // 이벤트 리스너 등록
      select.addEventListener('change', async function() {
        const drawNo = parseInt(this.value);
        await loadDrawData(drawNo);
      });

      console.log('✅ 드롭다운 초기화 완료');
    }

    // 당첨 데이터 로드 (Firestore 우선, 없으면 API)
    async function loadDrawData(drawNo) {
      showToast('당첨 정보 불러오는 중...', 1500);

      // Firestore에서 먼저 확인
      try {
        const doc = await db.collection('winning_numbers').doc(String(drawNo)).get();
        if (doc.exists) {
          const data = doc.data();

          // 당첨금 정보가 유효한지 확인 (없거나 '0'이면 API에서 다시 가져오기)
          const hasValidPrize = data.firstPrize && data.firstPrize !== '0' && data.firstPrize !== '정보 없음';
          const hasAllPrizes = data.prizes && data.prizes.win1;

          if (hasValidPrize && hasAllPrizes) {
            winningData = {
              drawNumber: data.drawNumber,
              drawDate: data.drawDate,
              numbers: data.numbers,
              bonus: data.bonus,
              firstPrize: data.firstPrize,
              prizes: data.prizes
            };
            localStorage.setItem(STORAGE_KEYS.WINNING, JSON.stringify(winningData));
            updateCheckUI();
            updateWinningStats();
            showToast(`${drawNo}회차 당첨 정보 로드 완료`, 2000);
            return;
          } else {
            console.log('⚠️ 당첨금 정보 불완전, API에서 다시 가져옵니다...');
          }
        }
      } catch (error) {
        console.error('Firestore 조회 오류:', error);
      }

      // Firestore에 없거나 불완전하면 API에서 가져오기
      const data = await fetchLotteryData(drawNo);
      if (data) {
        winningData = {
          drawNumber: data.drawNumber,
          drawDate: data.drawDate,
          numbers: data.numbers,
          bonus: data.bonus,
          firstPrize: data.firstPrize,
          prizes: data.prizes
        };

        // Firestore에 저장 (업데이트)
        await saveWinningToFirestore(data);

        localStorage.setItem(STORAGE_KEYS.WINNING, JSON.stringify(winningData));
        updateCheckUI();
        updateWinningStats();
        showToast(`${drawNo}회차 당첨 정보 로드 완료`, 2000);
      } else {
        showToast('당첨 정보를 불러올 수 없습니다', 2000);
      }
    }

    // ==================== 직접 번호 입력 ====================
    
    function initManualInputs() {
      // 기본 한 줄 자동 생성하지 않음
    }

    function addManualInputLine() {
      if (manualInputLineCount >= 5) {
        showToast('최대 5줄까지 입력 가능합니다', 2000);
        return;
      }

      const container = document.getElementById('manualInputLines');
      if (!container) return;

      const lineDiv = document.createElement('div');
      lineDiv.className = 'flex items-center gap-2';
      lineDiv.dataset.lineNum = manualInputLineCount;
      lineDiv.innerHTML = `
        <span class="text-xs text-gray-500 w-5 flex-shrink-0">#${manualInputLineCount}</span>
        ${[1,2,3,4,5,6].map(i => `
          <input type="text" maxlength="2" inputmode="numeric" pattern="[0-9]*"
                 class="hoxy-manual-line-input"
                 id="manual_${manualInputLineCount}_${i}"
                 oninput="onCheckManualInput(this, ${manualInputLineCount}, ${i})"
                 onblur="onCheckManualBlur(this, ${manualInputLineCount}, ${i})"
                 placeholder="${i}">
        `).join('')}
        <button onclick="removeManualInputLine(this)" class="hoxy-manual-line-remove">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      `;

      container.appendChild(lineDiv);
      manualInputLineCount++;
    }

    function removeManualInputLine(button) {
      if (!button || !button.parentElement) return;
      
      const line = button.parentElement;
      line.remove();
      manualInputLineCount--;
    }

    function validateManualInput(input) {
      if (!input) return;

      const value = parseInt(input.value);

      if (value < 1 || value > 45) {
        input.value = '';
        showToast('1~45 사이의 숫자를 입력해주세요', 2000);
        return;
      }

      if (input.value) {
        setClassActive(input, 'filled', true);
      } else {
        setClassActive(input, 'filled', false);
      }
    }

    // 당첨 확인 탭 직접 입력 핸들러 (한 줄 내 중복 불가)
    function onCheckManualInput(input, lineNum, fieldNum) {
      // 숫자만 허용
      input.value = input.value.replace(/[^0-9]/g, '');

      // 범위 체크 (1~45)
      if (input.value) {
        const value = parseInt(input.value);
        if (value > 45) {
          input.value = '45';
        } else if (value < 1 && input.value.length === 2) {
          input.value = '1';
        }
      }

      // 같은 줄 내 중복 체크
      checkLineDuplicate(input, lineNum, fieldNum);

      // 2자리 입력 시 다음 칸으로 자동 이동
      if (input.value.length === 2 && fieldNum < 6) {
        const nextInput = document.getElementById(`manual_${lineNum}_${fieldNum + 1}`);
        if (nextInput) nextInput.focus();
      }
    }

    function checkLineDuplicate(currentInput, lineNum, currentFieldNum) {
      const currentValue = currentInput.value;
      if (!currentValue) {
        setInputErrorState(currentInput, false, true);
        return;
      }

      // 2자리 입력 완료 시에만 중복 체크
      if (currentValue.length < 2) {
        setInputErrorState(currentInput, false);
        return;
      }

      const currentNum = parseInt(currentValue);

      // 같은 줄의 다른 입력값과 비교 (숫자 값으로 비교)
      let hasDuplicate = false;
      for (let i = 1; i <= 6; i++) {
        if (i === currentFieldNum) continue;
        const otherInput = document.getElementById(`manual_${lineNum}_${i}`);
        if (otherInput && otherInput.value) {
          const otherNum = parseInt(otherInput.value);
          if (currentNum === otherNum) {
            hasDuplicate = true;
            break;
          }
        }
      }

      if (hasDuplicate) {
        setInputErrorState(currentInput, true);
        showToast('⚠️ 중복된 번호입니다', 1500);
      } else {
        setInputErrorState(currentInput, false);
      }
    }

    window.onCheckManualInput = onCheckManualInput;

    // 포커스 벗어날 때 중복 체크 (길이 상관없이)
    function onCheckManualBlur(input, lineNum, fieldNum) {
      const currentValue = input.value;
      if (!currentValue) {
        setInputErrorState(input, false, true);
        return;
      }

      const currentNum = parseInt(currentValue);

      // 같은 줄의 다른 입력값과 비교
      let hasDuplicate = false;
      for (let i = 1; i <= 6; i++) {
        if (i === fieldNum) continue;
        const otherInput = document.getElementById(`manual_${lineNum}_${i}`);
        if (otherInput && otherInput.value) {
          const otherNum = parseInt(otherInput.value);
          if (currentNum === otherNum) {
            hasDuplicate = true;
            break;
          }
        }
      }

      if (hasDuplicate) {
        setInputErrorState(input, true);
        showToast('⚠️ 중복된 번호입니다', 1500);
      } else {
        setInputErrorState(input, false);
      }
    }

    window.onCheckManualBlur = onCheckManualBlur;

    function checkManualNumbers() {
      const lines = document.querySelectorAll('#manualInputLines > div');
      const allNumbers = [];
      let hasDuplicateError = false;

      lines.forEach((line, lineIndex) => {
        const inputs = line.querySelectorAll('input');
        const numbers = [];

        inputs.forEach(input => {
          if (input.value) {
            numbers.push(parseInt(input.value));
          }
        });

        if (numbers.length === 6) {
          // 한 줄 내 중복 체크
          const uniqueNumbers = new Set(numbers);
          if (uniqueNumbers.size !== 6) {
            hasDuplicateError = true;
            // 중복된 입력칸에 빨간 테두리 표시
            const seen = new Set();
            inputs.forEach(input => {
              const num = parseInt(input.value);
              if (seen.has(num)) {
                setInputErrorState(input, true);
              } else {
                seen.add(num);
              }
            });
          } else {
            allNumbers.push({ line: lineIndex + 1, numbers: numbers.sort((a, b) => a - b) });
          }
        }
      });

      if (hasDuplicateError) {
        showToast('⚠️ 중복된 번호가 있습니다. 수정해주세요.', 2000);
        return;
      }

      if (allNumbers.length === 0) {
        showToast('번호를 입력해주세요', 2000);
        return;
      }

      // 저장 없이 바로 결과 표시
      const winning = getWinningNumbers();
      let bestWin = null;
      const results = [];

      allNumbers.forEach(item => {
        const match = checkMatch(item.numbers, winning.numbers, winning.bonus);
        const rankInfo = getMatchRank(match.count, match.hasBonus);
        const matchedNums = item.numbers.filter(n => winning.numbers.includes(n));

        results.push({
          numbers: item.numbers,
          match,
          rankInfo,
          matchedNums
        });

        if (rankInfo && (!bestWin || rankInfo.rank < bestWin.rank)) {
          bestWin = {
            rank: rankInfo.rank,
            rankInfo: rankInfo,
            matchedNumbers: matchedNums
          };
        }
      });

      // 직접 입력 결과 표시 영역 업데이트
      showDirectCheckResults(results, winning);

      // 입력창 초기화
      document.querySelectorAll('#manualInputLines input').forEach(input => {
        if (input) {
          input.value = '';
          if (input.classList) {
            setClassActive(input, 'filled', false);
            setInputErrorState(input, false, true);
          }
        }
      });

      showToast(`${allNumbers.length}개 번호 확인 완료!`, 2000);

      // 당첨 시 축하 팝업
      if (bestWin) {
        setTimeout(() => {
          showCongratsModal(winning.drawNumber, bestWin.rankInfo, bestWin.matchedNumbers);
        }, 500);
      }
    }

    // 직접 입력 번호 확인 결과 표시
    function showDirectCheckResults(results, winning) {
      // 결과 표시 영역 생성 또는 가져오기
      let resultContainer = document.getElementById('directCheckResults');
      if (!resultContainer) {
        const manualSection = document.querySelector('#manualInputLines').parentElement;
        const resultDiv = document.createElement('div');
        resultDiv.id = 'directCheckResults';
        resultDiv.className = 'mt-3 space-y-2';
        manualSection.insertBefore(resultDiv, manualSection.querySelector('button[onclick="addManualInputLine()"]'));
        resultContainer = resultDiv;
      }

      resultContainer.innerHTML = `
        <div class="text-xs font-bold text-gray-700 mb-2">📋 확인 결과 (${winning.drawNumber}회차 기준)</div>
        ${results.map((item, index) => {
          let rankClass = 'hoxy-check-card-default';
          let badgeClass = 'hoxy-check-badge hoxy-check-badge-gray';

          if (item.rankInfo) {
            rankClass = `rank-${item.rankInfo.rank}`;
            if (item.rankInfo.rank === 1) badgeClass = 'hoxy-check-badge hoxy-check-badge-rank1';
            else if (item.rankInfo.rank === 2) badgeClass = 'hoxy-check-badge hoxy-check-badge-rank2';
            else if (item.rankInfo.rank === 3) badgeClass = 'hoxy-check-badge hoxy-check-badge-rank3';
            else badgeClass = 'hoxy-check-badge hoxy-check-badge-rank4';
          }

          return `
            <div class="hoxy-check-card ${rankClass}">
              <div class="hoxy-check-row">
                <span class="hoxy-check-index hoxy-check-index-default">#${index + 1}</span>
                <div class="flex gap-1 flex-1 justify-center">
                  ${item.numbers.map(num => {
                    const isMatch = winning.numbers.includes(num);
                    return renderBall(num, isMatch ? 'matched' : 'normal');
                  }).join('')}
                </div>
              </div>
              ${item.rankInfo ? `
                <div class="text-center">
                  <div class="${badgeClass}">
                    ${item.rankInfo.rank <= 3 ? '🏆' : '🎉'} ${item.match.count}개 - ${item.rankInfo.text}
                  </div>
                </div>
              ` : `
                <div class="hoxy-check-miss">
                  ${item.match.count}개 일치 - 미당첨
                </div>
              `}
            </div>
          `;
        }).join('')}
      `;
    }

    // ==================== 오늘의 행운 번호 ====================

    // 12:00 기준 주기 ID 계산 (매일 12:00에 갱신)
    function getLuckyPeriodId() {
      const now = new Date();
      const hour = now.getHours();
      const dateStr = now.toDateString();

      // 12:00 이전이면 전날 오후 주기, 12:00 이후면 오늘 오후 주기
      if (hour < 12) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toDateString() + '_PM';
      }
      return dateStr + '_PM';
    }

    function getLuckyNumber() {
      const periodId = getLuckyPeriodId();
      const stored = localStorage.getItem(STORAGE_KEYS.LUCKY);

      if (stored) {
        const lucky = JSON.parse(stored);
        if (lucky.periodId === periodId) {
          return lucky;
        }
      }

      // 새로운 주기 - 완전 랜덤 번호 생성
      const numbers = [];
      while (numbers.length < 6) {
        const num = Math.floor(Math.random() * 45) + 1;
        if (!numbers.includes(num)) {
          numbers.push(num);
        }
      }

      const lucky = {
        periodId: periodId,
        date: new Date().toDateString(),
        numbers: numbers.sort((a, b) => a - b),
        revealed: false,
        message: getLuckyMessage()
      };

      localStorage.setItem(STORAGE_KEYS.LUCKY, JSON.stringify(lucky));
      return lucky;
    }

    function mulberry32(seed) {
      return function() {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      };
    }

    function getLuckyMessage() {
      const messages = [
        '✨ 새로운 시작의 날',
        '🍀 행운이 가득한 날',
        '🌟 희망찬 하루',
        '💫 특별한 기운이 느껴지는 날',
        '🎯 집중력이 높아지는 날',
        '🌈 긍정적인 에너지가 넘치는 날',
        '🔥 열정이 불타오르는 날',
        '💎 빛나는 기회의 날',
        '🎪 신나는 일이 생기는 날',
        '🌸 아름다운 인연의 날',
        '⭐ 별처럼 빛나는 날',
        '🎁 뜻밖의 선물이 오는 날'
      ];
      // 완전 랜덤 선택
      return messages[Math.floor(Math.random() * messages.length)];
    }

    function revealLuckyNumber() {
      const loadingEl = document.getElementById('luckyModalLoading');
      const readyEl = document.getElementById('luckyModalReady');

      if (!loadingEl || !readyEl) return;

      // 모달 열기 (로딩 상태)
      setHidden(loadingEl, false);
      setHidden(readyEl, true);
      setModalActive('luckyRevealModal', true);

      // 3초 후 준비 완료 상태로 전환
      setTimeout(() => {
        setHidden(loadingEl, true);
        setHidden(readyEl, false);
      }, 3000);
    }

    function confirmLuckyReveal() {
      const revealEl = document.getElementById('luckyNumberReveal');
      const blurredEl = document.getElementById('luckyNumberBlurred');
      const actionsEl = document.getElementById('luckyNumberActions');
      const cardEl = document.getElementById('luckyNumberCard');

      // 모달 닫기
      setModalActive('luckyRevealModal', false);

      // 럭키넘버 데이터 저장
      const lucky = getLuckyNumber();
      lucky.revealed = true;
      localStorage.setItem(STORAGE_KEYS.LUCKY, JSON.stringify(lucky));

      // 홈 화면 럭키넘버 공개 애니메이션
      if (blurredEl) {
        blurredEl.style.filter = 'none';
        blurredEl.innerHTML = renderNumberBalls(lucky.numbers);
        setClassActive(blurredEl, 'lucky-reveal-animation', true);
      }

      if (revealEl) {
        setElementDisplay(revealEl, 'none');
      }

      // 저장 버튼 표시
      if (actionsEl) {
        setHidden(actionsEl, false);
        setClassActive(actionsEl, 'lucky-actions-show', true);
      }

      // 카드 강조 효과
      if (cardEl) {
        setClassActive(cardEl, 'lucky-reveal-animation', true);
      }

      showToast('오늘의 럭키 넘버가 공개되었습니다! 🍀', 2000);
    }

    function saveLuckyNumber() {
      const lucky = getLuckyNumber();
      if (!lucky || !lucky.numbers) {
        showToast('저장할 럭키넘버가 없습니다', 2000);
        return;
      }

      saveNumber(lucky.numbers);
      showToast('럭키넘버가 저장되었습니다! 🍀', 2000);

      // 저장 버튼 비활성화 (중복 저장 방지)
      const actionsEl = document.getElementById('luckyNumberActions');
      if (actionsEl) {
        actionsEl.innerHTML = `
          <div class="hoxy-save-complete">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            저장 완료
          </div>
        `;
      }
    }

    // 전역 함수 등록
    window.revealLuckyNumber = revealLuckyNumber;
    window.confirmLuckyReveal = confirmLuckyReveal;
    window.saveLuckyNumber = saveLuckyNumber;

    // ==================== 당첨 확인 ====================
    
    function checkWinnings() {
      const saved = getSaved();
      const winning = getWinningNumbers();
      
      let hasWinning = false;
      saved.forEach(item => {
        const match = checkMatch(item.numbers, winning.numbers, winning.bonus);
        if (match.count >= 3) {
          hasWinning = true;
        }
      });

      if (hasWinning) {
        showWinningCard();
      }
    }

    function checkMatch(numbers, winningNumbers, bonusNumber = null) {
      const matches = numbers.filter(n => winningNumbers.includes(n));
      return {
        count: matches.length,
        numbers: matches,
        hasBonus: bonusNumber ? numbers.includes(bonusNumber) : false
      };
    }

    function showWinningCard() {
      const cardEl = document.getElementById('winningCard');
      setElementDisplay(cardEl, 'block');
    }

    function closeWinningCard() {
      const cardEl = document.getElementById('winningCard');
      setElementDisplay(cardEl, 'none');
    }

    function closeStatsCard() {
      const cardEl = document.getElementById('statsCard');
      setElementDisplay(cardEl, 'none');
    }

    // ==================== UI 업데이트 ====================
    
    function updateUI() {
      updateQuotaUI();
      renderCurrentPage();  // 슬롯 시스템 렌더링
      updateSavedUI();
      updateCheckUI();
      updateWinningUI();
      updateLuckyUI();
      
      // 슬롯 카운터 업데이트
      const slotsCountEl = document.getElementById('recentSlotsCount');
      if (slotsCountEl) {
        slotsCountEl.textContent = recentSlots;
      }
    }

    function updateQuotaUI() {
      const quota = getQuota();
      
      // 진행률을 0-100% 범위로 제한
      let percent = Math.round((quota.remaining / quota.total) * 100);
      percent = Math.max(0, Math.min(100, percent));
      
      const remainingEl = document.getElementById('remainingQuota');
      const progressBarEl = document.getElementById('quotaProgressBar');
      const progressTextEl = document.getElementById('quotaProgressText');
      const settingsEl = document.getElementById('settingsQuota');
      const generateBtnEl = document.getElementById('generateButton');
      const depletedMsgEl = document.getElementById('quotaDepletedMessage');
      
      if (remainingEl) remainingEl.textContent = quota.remaining;
      if (progressBarEl) progressBarEl.style.width = percent + '%';
      if (progressTextEl) progressTextEl.textContent = quota.remaining + '회';
      if (settingsEl) settingsEl.textContent = quota.total;
      
      // 할당량에 따라 버튼 텍스트 및 안내 메시지 변경
      if (generateBtnEl && depletedMsgEl) {
        if (quota.remaining <= 0) {
          generateBtnEl.innerHTML = '🎁 무료 횟수 +5회 충전하기';
          setElementDisplay(depletedMsgEl, 'block');
        } else {
          generateBtnEl.textContent = '로또 번호 생성하기';
          setElementDisplay(depletedMsgEl, 'none');
        }
      }

      // 공유 배너: 할당량 0일 때만 표시
      const shareBannerEl = document.getElementById('shareBanner');
      if (shareBannerEl) {
        if (quota.remaining <= 0) {
          setHidden(shareBannerEl, false);
        } else {
          setHidden(shareBannerEl, true);
        }
      }
    }

    function updateSavedUI() {
      updateSavedPagination();
      updateRecentNumbersPreview();
    }

    // 내 번호 탭 상단에 최근 뽑은 번호 5개 표시
    function updateRecentNumbersPreview() {
      const recent = getRecent();
      const container = document.getElementById('recentNumbersPreview');

      if (!container) return;

      const previewItems = recent.slice(0, 5);

      if (previewItems.length === 0) {
        container.innerHTML = `
          <div class="text-center py-4">
            <div class="text-gray-400 text-xs">최근 생성된 번호가 없습니다</div>
            <div class="text-gray-400 text-xs mt-1">홈에서 번호를 생성해보세요!</div>
          </div>
        `;
        return;
      }

      container.innerHTML = previewItems.map((item, index) => `
        <div class="flex items-center gap-1 p-1.5 bg-white rounded-lg">
          <span class="text-xs text-gray-400 w-4">#${index + 1}</span>
          <div class="flex gap-1 flex-1 justify-center">
            ${renderNumberBalls(item.numbers)}
          </div>
          <button onclick="saveNumber(${JSON.stringify(item.numbers).replace(/"/g, '&quot;')}, ${item.targetDraw || getNextDrawNumber()})" class="p-1 text-blue-500 hover:bg-blue-100 rounded transition-colors" title="저장">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
            </svg>
          </button>
        </div>
      `).join('');
    }

    function updateSavedPagination() {
      const saved = getSaved();
      const totalItems = saved.length;
      const totalPages = Math.min(Math.ceil(totalItems / savedItemsPerPage), savedMaxPages);
      const maxSavable = savedUnlockedPages * savedItemsPerPage;

      const currentPageEl = document.getElementById('savedCurrentPage');
      const totalPagesEl = document.getElementById('savedTotalPages');
      const savedCountEl = document.getElementById('savedCount');
      const savedMaxCountEl = document.getElementById('savedMaxCount');
      const dotsContainer = document.getElementById('savedPaginationDots');
      const btnPrev = document.getElementById('btnPrevSaved');
      const btnNext = document.getElementById('btnNextSaved');

      if (currentPageEl) currentPageEl.textContent = savedCurrentPageIndex + 1;
      if (totalPagesEl) totalPagesEl.textContent = savedMaxPages;
      // 저장 현황 업데이트
      if (savedCountEl) savedCountEl.textContent = totalItems;
      if (savedMaxCountEl) savedMaxCountEl.textContent = maxSavable;
      
      // 페이지 dots 생성
      if (dotsContainer) {
        dotsContainer.innerHTML = '';
        
        for (let i = 0; i < savedMaxPages; i++) {
          const dot = document.createElement('div');
          dot.className = 'pagination-dot' + (i === savedCurrentPageIndex ? ' active' : '');
          dot.onclick = () => goToSavedPage(i);
          dotsContainer.appendChild(dot);
        }
      }
      
      // 이전/다음 버튼 상태
      if (btnPrev) btnPrev.disabled = savedCurrentPageIndex === 0;
      if (btnNext) btnNext.disabled = savedCurrentPageIndex >= savedMaxPages - 1;
      
      renderSavedCurrentPage();
    }

    function renderSavedCurrentPage() {
      const saved = getSaved();
      const container = document.getElementById('savedNumbersList');
      
      if (!container) return;
      
      const startIndex = savedCurrentPageIndex * savedItemsPerPage;
      const endIndex = startIndex + savedItemsPerPage;
      const pageItems = saved.slice(startIndex, endIndex);
      
      // 현재 페이지가 잠겨있는지 확인
      const isLocked = savedCurrentPageIndex >= savedUnlockedPages;
      
      if (isLocked) {
        container.innerHTML = `
          <div class="locked-overlay flex items-center justify-center bg-gray-50 rounded-xl py-8">
          </div>
        `;
        return;
      }
      
      if (pageItems.length === 0 && savedCurrentPageIndex === 0) {
        container.innerHTML = `
          <div class="text-center py-8">
            <div class="text-6xl mb-4">📋</div>
            <div class="text-gray-500 font-medium">저장된 번호가 없습니다</div>
            <div class="text-sm text-gray-400 mt-2">홈에서 번호를 생성하고 저장해보세요!</div>
          </div>
        `;
        return;
      }

      // 슬롯 시스템: 페이지당 10개 슬롯 (채워진 것 + 빈 슬롯)
      const slots = [];
      for (let i = 0; i < savedItemsPerPage; i++) {
        const globalIndex = startIndex + i;
        if (i < pageItems.length) {
          slots.push({ type: 'filled', index: globalIndex, data: pageItems[i] });
        } else {
          slots.push({ type: 'empty', index: globalIndex });
        }
      }

      container.innerHTML = slots.map(slot => {
        if (slot.type === 'empty') {
          return `
            <div class="hoxy-slot-empty-row">
              <span class="hoxy-slot-empty-index">#${slot.index + 1}</span>
              <div class="hoxy-slot-empty-balls hoxy-slot-empty-balls-fill">
                <div class="hoxy-slot-empty-ball"></div>
                <div class="hoxy-slot-empty-ball"></div>
                <div class="hoxy-slot-empty-ball"></div>
                <div class="hoxy-slot-empty-ball"></div>
                <div class="hoxy-slot-empty-ball"></div>
                <div class="hoxy-slot-empty-ball"></div>
              </div>
              <div class="w-5 h-5 shrink-0"></div>
            </div>
          `;
        } else {
          return `
            <div class="hoxy-saved-slot-filled">
              <span class="hoxy-saved-slot-index">#${slot.index + 1}</span>
              <div class="flex gap-1 flex-1 justify-center overflow-hidden">
                ${renderNumberBalls(slot.data.numbers)}
              </div>
              <button onclick="deleteSaved(${slot.index})" class="hoxy-manual-line-remove hoxy-saved-slot-delete">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          `;
        }
      }).join('');
    }

    function prevSavedPage() {
      if (savedCurrentPageIndex > 0) {
        savedCurrentPageIndex--;
        updateSavedPagination();
      }
    }

    function nextSavedPage() {
      const nextIndex = savedCurrentPageIndex + 1;
      
      if (nextIndex >= savedUnlockedPages) {
        showSavedPageAddConfirm(nextIndex + 1);
        return;
      }
      
      if (nextIndex < savedMaxPages) {
        savedCurrentPageIndex = nextIndex;
        updateSavedPagination();
      }
    }

    function goToSavedPage(pageIndex) {
      if (pageIndex >= savedUnlockedPages) {
        showSavedPageAddConfirm(pageIndex + 1);
        return;
      }
      savedCurrentPageIndex = pageIndex;
      updateSavedPagination();
    }

    function showSavedPageAddConfirm(pageNum) {
      const pageNumEl = document.getElementById('nextSavedPageNum');
      if (pageNumEl) pageNumEl.textContent = pageNum;
      setModalActive('savedPageAddConfirmModal', true);
    }

    function closeSavedPageAddConfirm() {
      setModalActive('savedPageAddConfirmModal', false);
    }

    function confirmSavedPageAdd() {
      closeSavedPageAddConfirm();
      showToast('페이지 추가 중...', 1500);
      
      setTimeout(() => {
        savedUnlockedPages++;
        localStorage.setItem(STORAGE_KEYS.SAVED_PAGES_UNLOCKED, savedUnlockedPages.toString());
        
        savedCurrentPageIndex = savedUnlockedPages - 1;
        updateSavedPagination();
        showToast(`${savedUnlockedPages}페이지가 추가되었습니다!`, 2000);
      }, 1500);
    }

    function showSavedExpandConfirm() {
      const saved = getSaved();
      if (saved.length >= 50) {
        showToast('최대 50개까지만 저장할 수 있습니다', 2000);
        return;
      }
      
      showSavedPageAddConfirm(savedUnlockedPages + 1);
    }

    function clearSavedNumbers() {
      if (confirm('저장된 모든 번호를 삭제하시겠습니까?')) {
        localStorage.removeItem(STORAGE_KEYS.SAVED);
        savedCurrentPageIndex = 0;
        updateSavedPagination();
        updateCheckUI();
        updateWinningStats();
        showToast('저장된 번호가 모두 삭제되었습니다', 2000);
      }
    }

    function updateCheckUI() {
      const saved = getSaved();
      const winning = getWinningNumbers();
      const container = document.getElementById('savedNumbersCheck');
      const noSaved = document.getElementById('noSavedForCheck');

      // 해당 회차용 번호만 필터링 (targetDraw 기준)
      const filteredSaved = saved.filter(item => item.targetDraw === winning.drawNumber);

      // 내 번호 탭에서 잠금해제된 범위만 표시 (광고 수익화 보호)
      const maxVisible = savedUnlockedPages * savedItemsPerPage;
      const visibleSaved = filteredSaved.slice(0, maxVisible);

      const drawNumberEl = document.getElementById('checkDrawNumber');
      const drawDateEl = document.getElementById('checkDrawDate');
      const firstPrizeEl = document.getElementById('checkFirstPrize');
      const winningNumbersEl = document.getElementById('checkWinningNumbers');
      const savedCheckCountEl = document.getElementById('savedCheckCount');

      if (drawNumberEl) drawNumberEl.textContent = winning.drawNumber;
      if (drawDateEl) drawDateEl.textContent = winning.drawDate;
      if (firstPrizeEl) firstPrizeEl.textContent = formatPrize(winning.firstPrize);
      if (winningNumbersEl) winningNumbersEl.innerHTML = renderNumberBalls(winning.numbers, winning.bonus);
      // 해당 회차 번호만 카운트
      if (savedCheckCountEl) savedCheckCountEl.textContent = visibleSaved.length;

      if (!container || !noSaved) return;

      if (visibleSaved.length === 0) {
        setElementDisplay(container, 'none');
        setElementDisplay(noSaved, 'block');
        return;
      }

      setElementDisplay(container, 'block');
      setElementDisplay(noSaved, 'none');

      container.innerHTML = visibleSaved.map((item, index) => {
        const match = checkMatch(item.numbers, winning.numbers, winning.bonus);
        const rankInfo = getMatchRank(match.count, match.hasBonus);

        // 등수별 스타일 클래스
        let rankClass = 'hoxy-check-card-default';
        let badgeClass = 'hoxy-check-badge hoxy-check-badge-gray';
        let clickable = '';

        if (rankInfo) {
          rankClass = `rank-${rankInfo.rank}`;
          clickable = 'hoxy-check-card-clickable';

          if (rankInfo.rank === 1) badgeClass = 'hoxy-check-badge hoxy-check-badge-rank1';
          else if (rankInfo.rank === 2) badgeClass = 'hoxy-check-badge hoxy-check-badge-rank2';
          else if (rankInfo.rank === 3) badgeClass = 'hoxy-check-badge hoxy-check-badge-rank3';
          else badgeClass = 'hoxy-check-badge hoxy-check-badge-rank4';
        }

        const matchedNums = item.numbers.filter(n => winning.numbers.includes(n));

        const checkIndexClass = rankInfo && rankInfo.rank <= 3
          ? 'hoxy-check-index-rank'
          : 'hoxy-check-index-default';

        return `
          <div class="hoxy-check-card ${rankClass} ${clickable}"
               ${rankInfo ? `onclick="showCongratsModal(${winning.drawNumber}, {rank: ${rankInfo.rank}, text: '${rankInfo.text}'}, ${JSON.stringify(matchedNums)})"` : ''}>
            <div class="hoxy-check-row">
              <span class="hoxy-check-index ${checkIndexClass}">#${index + 1}</span>
              <div class="flex gap-1 flex-1 justify-center">
                ${item.numbers.map(num => {
                  const isMatch = winning.numbers.includes(num);
                  return renderBall(num, isMatch ? 'matched' : 'normal');
                }).join('')}
              </div>
            </div>
            ${rankInfo ? `
              <div class="text-center">
                <div class="${badgeClass}">
                  ${rankInfo.rank <= 3 ? '🏆' : '🎉'} ${match.count}개 - ${rankInfo.text}
                </div>
              </div>
            ` : `
              <div class="hoxy-check-miss">
                ${match.count}개 일치 - 미당첨
              </div>
            `}
          </div>
        `;
      }).join('');
    }

    function updateWinningUI() {
      const winning = getWinningNumbers();
      
      const drawNumberEl = document.getElementById('drawNumber');
      const drawDateEl = document.getElementById('drawDate');
      const firstPrizeEl = document.getElementById('firstPrize');
      const winningNumbersEl = document.getElementById('winningNumbers');
      
      if (drawNumberEl) drawNumberEl.textContent = winning.drawNumber;
      if (drawDateEl) drawDateEl.textContent = winning.drawDate;
      if (firstPrizeEl) firstPrizeEl.textContent = formatPrize(winning.firstPrize);
      if (winningNumbersEl) winningNumbersEl.innerHTML = renderNumberBalls(winning.numbers, winning.bonus);
    }

    function updateLuckyUI() {
      const lucky = getLuckyNumber();
      const messageEl = document.getElementById('luckyMessage');
      const blurredEl = document.getElementById('luckyNumberBlurred');
      const revealEl = document.getElementById('luckyNumberReveal');
      const actionsEl = document.getElementById('luckyNumberActions');

      if (messageEl) messageEl.textContent = lucky.message;

      if (lucky.revealed) {
        // 공개 상태: 블러 제거, 버튼 숨김, 저장 버튼 표시
        if (blurredEl) {
          blurredEl.style.filter = 'none';
          blurredEl.innerHTML = renderNumberBalls(lucky.numbers);
        }
        if (revealEl) {
          setElementDisplay(revealEl, 'none');
        }
        if (actionsEl) {
          setHidden(actionsEl, false);
        }
      } else {
        // 미공개 상태: 블러 적용, 버튼 표시, 저장 버튼 숨김
        if (blurredEl) {
          blurredEl.style.filter = 'blur(8px)';
          blurredEl.innerHTML = `
            <div class="number-ball hoxy-ball-yellow"></div>
            <div class="number-ball hoxy-ball-blue"></div>
            <div class="number-ball hoxy-ball-red"></div>
            <div class="number-ball hoxy-ball-gray"></div>
            <div class="number-ball hoxy-ball-green"></div>
            <div class="number-ball hoxy-ball-bonus"></div>
          `;
        }
        if (revealEl) {
          setElementDisplay(revealEl, 'flex');
          revealEl.innerHTML = `
            <button onclick="revealLuckyNumber()" class="hoxy-lucky-reveal-btn">
              <span>🍀</span>
              오늘의 럭키 넘버는?!
            </button>
          `;
        }
        if (actionsEl) {
          setHidden(actionsEl, true);
        }
      }
    }

    function updateActiveUsers() {
      const users = Math.floor(Math.random() * 1000) + 1000;
      const usersEl = document.getElementById('activeUsers');
      if (usersEl) usersEl.textContent = users.toLocaleString();
    }

    // ==================== 렌더링 함수 ====================
    
    function renderNumberBalls(numbers, bonus = null) {
      return numbers.map(num => renderBall(num, 'normal')).join('') +
             (bonus ? renderBall(bonus, 'bonus') : '');
    }

    function renderBall(num, type = 'normal') {
      if (type === 'bonus') {
        return `<div class="number-ball hoxy-ball-base hoxy-ball-bonus hoxy-ball-border">${num}</div>`;
      }

      let colorClass = 'hoxy-ball-green';
      if (type === 'matched') {
        colorClass = 'hoxy-ball-green';
      } else {
        if (num <= 10) colorClass = 'hoxy-ball-yellow';
        else if (num <= 20) colorClass = 'hoxy-ball-blue';
        else if (num <= 30) colorClass = 'hoxy-ball-red';
        else if (num <= 40) colorClass = 'hoxy-ball-gray';
        else colorClass = 'hoxy-ball-green';
      }

      return `<div class="number-ball hoxy-ball-base ${colorClass}">${num}</div>`;
    }

    function getMatchRank(count, hasBonus = false) {
      if (count === 6) return { rank: 1, text: '1등 당첨!' };
      if (count === 5 && hasBonus) return { rank: 2, text: '2등 당첨!' };
      if (count === 5) return { rank: 3, text: '3등 당첨!' };
      if (count === 4) return { rank: 4, text: '4등 당첨!' };
      if (count === 3) return { rank: 5, text: '5등 당첨!' };
      return null;
    }

    // 등수별 실제 당첨금 (현재 선택된 회차 기준)
    function getActualPrize(rank) {
      const winning = getWinningNumbers();

      // 실제 당첨금 데이터가 있으면 사용
      if (winning.prizes) {
        const prizeKey = `win${rank}`;
        const prizeValue = winning.prizes[prizeKey];
        if (prizeValue && prizeValue !== '0') {
          return formatPrize(prizeValue);
        }
      }

      // 실제 데이터가 없으면 고정값 (fallback)
      const fallbackPrizes = {
        1: '약 20억원',
        2: '약 5천만원',
        3: '약 150만원',
        4: '50,000원',
        5: '5,000원'
      };
      return fallbackPrizes[rank] || '0원';
    }

    function formatPrize(prize) {
      if (!prize || prize === '0') return '정보 없음';
      const num = String(prize).replace(/,/g, '');
      const parsed = parseInt(num);
      if (isNaN(parsed) || parsed === 0) return '정보 없음';
      return parsed.toLocaleString() + '원';
    }

    // ==================== 축하 팝업 ====================

    function showCongratsModal(drawNumber, rankInfo, matchedNumbers) {
      const modal = document.getElementById('congratsModal');
      const drawNumEl = document.getElementById('congratsDrawNumber');
      const rankEl = document.getElementById('congratsRank');
      const numbersEl = document.getElementById('congratsMatchedNumbers');
      const prizeEl = document.getElementById('congratsPrize');
      const confettiEl = document.getElementById('confettiContainer');

      if (drawNumEl) drawNumEl.textContent = drawNumber;
      if (rankEl) rankEl.textContent = rankInfo.rank + '등';
      if (numbersEl) numbersEl.innerHTML = matchedNumbers.map(num => renderBall(num, 'matched')).join('');
      if (prizeEl) prizeEl.textContent = getActualPrize(rankInfo.rank);

      // 등수별 아이콘 변경
      const iconEl = modal.querySelector('.congrats-icon');
      if (iconEl) {
        if (rankInfo.rank === 1) iconEl.textContent = '🏆';
        else if (rankInfo.rank <= 3) iconEl.textContent = '🎉';
        else iconEl.textContent = '🎊';
      }

      // 컨페티 생성 (1~3등만)
      if (confettiEl && rankInfo.rank <= 3) {
        confettiEl.innerHTML = '';
        for (let i = 0; i < 30; i++) {
          const piece = document.createElement('div');
          piece.className = 'confetti-piece';
          piece.style.left = Math.random() * 100 + '%';
          piece.style.animationDelay = Math.random() * 2 + 's';
          piece.style.animationDuration = (2 + Math.random() * 2) + 's';
          confettiEl.appendChild(piece);
        }
      } else if (confettiEl) {
        confettiEl.innerHTML = '';
      }

      setModalActive('congratsModal', true);
    }

    function closeCongratsModal() {
      setModalActive('congratsModal', false);
    }

    window.showCongratsModal = showCongratsModal;
    window.closeCongratsModal = closeCongratsModal;

    // ==================== 탭 전환 ====================
    
    function switchTab(tabId) {
      // 모든 탭 비활성화
      document.querySelectorAll('.tab-content').forEach(tab => {
        setClassActive(tab, 'active', false);
      });

      // 모바일 네비게이션 버튼 초기화
      ['btnHome', 'btnSaved', 'btnCheck'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
          setElementClasses(btn, ['text-gray-400'], ['text-blue-600']);
          const span = btn.querySelector('span');
          setClassActive(span, 'font-bold', false);
        }
      });

      // 데스크톱 네비게이션 버튼 초기화
      ['btnHomeDesktop', 'btnSavedDesktop', 'btnCheckDesktop'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
          setElementClasses(btn, ['text-gray-500'], ['text-blue-600', 'bg-blue-50']);
        }
      });

      // 선택된 탭 활성화
      const tabEl = document.getElementById(tabId);
      setClassActive(tabEl, 'active', true);

      // 선택된 버튼 활성화 (모바일)
      const btnId = tabId.replace('Tab', '');
      const btnMap = { home: 'btnHome', saved: 'btnSaved', check: 'btnCheck' };
      const btn = document.getElementById(btnMap[btnId]);

      if (btn) {
        setElementClasses(btn, ['text-blue-600'], ['text-gray-400']);
        const span = btn.querySelector('span');
        setClassActive(span, 'font-bold', true);
      }

      // 선택된 버튼 활성화 (데스크톱)
      const btnMapDesktop = { home: 'btnHomeDesktop', saved: 'btnSavedDesktop', check: 'btnCheckDesktop' };
      const btnDesktop = document.getElementById(btnMapDesktop[btnId]);

      if (btnDesktop) {
        setElementClasses(btnDesktop, ['text-blue-600', 'bg-blue-50'], ['text-gray-500']);
      }

      if (tabId === 'checkTab') {
        updateCheckUI();
      }
    }

    // ==================== 설정 ====================

    function setModalActive(modalId, isActive) {
      const modalEl = document.getElementById(modalId);
      if (!modalEl || !modalEl.classList) return null;
      modalEl.classList.toggle('active', isActive);
      return modalEl;
    }
    
    function openSettings() {
      setModalActive('settingsModal', true);
    }

    function closeSettings() {
      setModalActive('settingsModal', false);
    }

    // ==================== 기타 정보 모달 ====================

    function openAboutModal() {
      setModalActive('aboutModal', true);
    }

    function closeAboutModal() {
      setModalActive('aboutModal', false);
    }

    function openPrivacyModal() {
      setModalActive('privacyModal', true);
    }

    function closePrivacyModal() {
      setModalActive('privacyModal', false);
    }

    function openTermsModal() {
      setModalActive('termsModal', true);
    }

    function closeTermsModal() {
      setModalActive('termsModal', false);
    }

    // ==================== 관리자 로그인 ====================

    const ADMIN_CREDENTIALS = {
      id: 'dunsmile',
      pw: 'a123'
    };

    let isAdminLoggedIn = false;

    function openAdminLoginModal() {
      const modalEl = setModalActive('adminLoginModal', true);
      if (modalEl) {
        const adminLoginErrorEl = document.getElementById('adminLoginError');
        document.getElementById('adminIdInput').value = '';
        document.getElementById('adminPwInput').value = '';
        setHidden(adminLoginErrorEl, true);
      }
    }

    function closeAdminLoginModal() {
      setModalActive('adminLoginModal', false);
    }

    function adminLogin() {
      const idInput = document.getElementById('adminIdInput').value;
      const pwInput = document.getElementById('adminPwInput').value;
      const errorEl = document.getElementById('adminLoginError');

      if (idInput === ADMIN_CREDENTIALS.id && pwInput === ADMIN_CREDENTIALS.pw) {
        isAdminLoggedIn = true;
        closeAdminLoginModal();
        updateAdminUI();
        showToast('관리자 로그인 성공', 1500);
      } else {
        setHidden(errorEl, false);
      }
    }

    function adminLogout() {
      isAdminLoggedIn = false;
      updateAdminUI();
      showToast('로그아웃 되었습니다', 1500);
    }

    function updateAdminUI() {
      const adminSection = document.getElementById('adminSection');
      const loginBtn = document.getElementById('adminLoginBtn');
      const logoutBtn = document.getElementById('adminLogoutBtn');

      if (isAdminLoggedIn) {
        setHidden(adminSection, false);
        setHidden(loginBtn, true);
        setHidden(logoutBtn, false);
      } else {
        setHidden(adminSection, true);
        setHidden(loginBtn, false);
        setHidden(logoutBtn, true);
      }
    }

    function clearAllData() {
      if (confirm('모든 데이터를 삭제하시겠습니까?\n\n다음 항목이 초기화됩니다:\n- 오늘 남은 생성 횟수 (10회로 초기화)\n- 최근 생성 번호 리스트\n- 저장된 번호 리스트\n- 오늘의 럭키넘버 (다시 공개 필요)\n- 무료 충전 횟수 (3회로 초기화)\n- 통계 배너 숨김 상태')) {
        // 할당량 초기화 (10회)
        const today = new Date().toDateString();
        const quota = { date: today, total: 10, used: 0 };
        localStorage.setItem(STORAGE_KEYS.QUOTA, JSON.stringify(quota));

        // 최근 생성 번호 초기화
        localStorage.removeItem(STORAGE_KEYS.RECENT);

        // 저장된 번호 초기화
        localStorage.removeItem(STORAGE_KEYS.SAVED);

        // 최근 생성 번호 슬롯 초기화
        recentSlots = 5;
        localStorage.setItem(STORAGE_KEYS.RECENT_SLOTS, '5');

        // 최근 생성 번호 페이지 초기화
        currentPageIndex = 0;
        unlockedPages = 1;
        localStorage.setItem(STORAGE_KEYS.PAGES_UNLOCKED, '1');

        // 저장된 번호 페이지 초기화
        savedCurrentPageIndex = 0;
        savedUnlockedPages = 1;
        localStorage.setItem(STORAGE_KEYS.SAVED_PAGES_UNLOCKED, '1');

        // 럭키넘버 초기화 (다시 공개 필요)
        localStorage.removeItem(STORAGE_KEYS.LUCKY);

        // 무료 충전 횟수 초기화 (12시간 3회)
        localStorage.removeItem(STORAGE_KEYS.AD_QUOTA_LIMIT);

        // 통계 배너 숨김 상태 초기화
        localStorage.removeItem('hoxy_stats_hidden_date');

        // UI 업데이트
        updateUI();
        showToast('모든 데이터가 초기화되었습니다!', 2000);
        closeSettings();
      }
    }
    
    // 전역으로 명시적 노출
    window.clearAllData = clearAllData;

    // ==================== 공유하기 ====================
    
    function shareApp() {
      // 오늘 이미 공유했는지 체크 (한국 시간 기준)
      const today = new Date().toDateString();
      const lastShareDate = localStorage.getItem(STORAGE_KEYS.SHARE_DATE);
      
      if (lastShareDate === today) {
        showToast('오늘은 이미 공유 보너스를 받으셨습니다! 내일 다시 시도해주세요.', 3000);
        return;
      }
      
      if (navigator.share) {
        navigator.share({
          title: 'HOXY NUMBER',
          text: '무료 로또 번호 생성기! 오늘의 행운 번호를 받아보세요!',
          url: window.location.href
        }).then(() => {
          const quota = getQuota();
          if (quota.remaining >= 10) {
            showToast('이미 최대 횟수(10회)입니다!', 2000);
            return;
          }
          
          addQuota(5);
          localStorage.setItem(STORAGE_KEYS.SHARE_DATE, today);
          updateUI();
          showToast('공유해주셔서 감사합니다! +5회가 추가되었습니다!', 3000);
        });
      } else {
        const quota = getQuota();
        if (quota.remaining >= 10) {
          showToast('이미 최대 횟수(10회)입니다!', 2000);
          navigator.clipboard.writeText(window.location.href);
          showToast('링크가 복사되었습니다!', 2000);
          return;
        }
        
        navigator.clipboard.writeText(window.location.href);
        addQuota(5);
        localStorage.setItem(STORAGE_KEYS.SHARE_DATE, today);
        updateUI();
        showToast('링크가 복사되었습니다! +5회가 추가되었습니다!', 3000);
      }
    }

    async function downloadHoxyShareCard() {
      if (!window.DopaminShareCard) {
        showToast('공유 카드 기능을 불러오지 못했습니다', 2000);
        return;
      }

      const recent = getRecent();
      const latest = recent.length > 0 ? recent[0] : null;
      const lucky = getLuckyNumber();
      const numbers = latest ? latest.numbers : lucky.numbers;
      const targetDraw = latest && latest.targetDraw ? latest.targetDraw : getNextDrawNumber();

      await window.DopaminShareCard.download({
        title: 'HOXY NUMBER',
        subtitle: '오늘의 행운 번호',
        highlight: `${targetDraw}회차 도전`,
        numbers: numbers,
        tags: ['행운번호', '로또추천', '도파민공작소'],
        footer: 'dopamine-factory.pages.dev/dunsmile/hoxy-number/',
        fromColor: '#2563eb',
        toColor: '#7c3aed',
        filePrefix: 'hoxy-number'
      });
      showToast('결과 이미지 카드가 저장되었습니다!', 2000);
    }

    // ==================== 서비스 메뉴 ====================

    function bindSidebarSearch() {
      const input = document.getElementById('serviceMenuSearch');
      const groupsRoot = document.getElementById('serviceMenuGroups');
      if (!input || !groupsRoot || input.dataset.bound === '1') return;

      const emptyState = document.getElementById('serviceMenuSearchEmpty');
      const items = Array.from(groupsRoot.querySelectorAll('[data-service-item="1"]'));
      const groups = Array.from(groupsRoot.querySelectorAll('.dp-side-group'));
      const baseOrder = new Map(items.map((item, index) => [item, index]));

      function rankItem(item, keyword) {
        const text = String(item.getAttribute('data-service-search') || '');
        const exact = text === keyword ? 0 : 1;
        const starts = text.startsWith(keyword) ? 0 : 1;
        const matchIndex = text.indexOf(keyword);
        const indexScore = matchIndex === -1 ? Number.MAX_SAFE_INTEGER : matchIndex;
        return {
          exact,
          starts,
          indexScore,
          length: text.length,
          base: baseOrder.get(item) || 0,
        };
      }

      function applyFilter() {
        const keyword = String(input.value || '').trim().toLowerCase();
        let visibleCount = 0;

        items.forEach((item) => {
          const text = item.getAttribute('data-service-search') || '';
          const isVisible = keyword === '' || text.includes(keyword);
          setClassActive(item, 'dp-side-hidden', !isVisible);
          if (isVisible) visibleCount += 1;
        });

        groups.forEach((group) => {
          const visibleItems = Array.from(group.querySelectorAll('[data-service-item="1"]:not(.dp-side-hidden)'));
          const hasVisible = visibleItems.length > 0;
          setClassActive(group, 'dp-side-hidden', !hasVisible);
          if (!hasVisible) return;

          if (keyword !== '') {
            group.open = true;
            visibleItems
              .sort((a, b) => {
                const ra = rankItem(a, keyword);
                const rb = rankItem(b, keyword);
                if (ra.exact !== rb.exact) return ra.exact - rb.exact;
                if (ra.starts !== rb.starts) return ra.starts - rb.starts;
                if (ra.indexScore !== rb.indexScore) return ra.indexScore - rb.indexScore;
                if (ra.length !== rb.length) return ra.length - rb.length;
                return ra.base - rb.base;
              })
              .forEach((item) => item.parentNode.appendChild(item));
          } else {
            visibleItems
              .sort((a, b) => (baseOrder.get(a) || 0) - (baseOrder.get(b) || 0))
              .forEach((item) => item.parentNode.appendChild(item));
          }
        });

        if (emptyState) {
          setClassActive(emptyState, 'show', visibleCount === 0);
        }
      }

      input.addEventListener('input', applyFilter);
      input.dataset.bound = '1';
      applyFilter();
    }

    function openServiceMenu() {
      const backdrop = document.getElementById('serviceMenuBackdrop');
      const sidebar = document.getElementById('serviceMenuSidebar');
      if (backdrop && sidebar) {
        setClassActive(backdrop, 'open', true);
        setClassActive(sidebar, 'open', true);
        bindSidebarSearch();
      }
    }

    function closeServiceMenu() {
      const backdrop = document.getElementById('serviceMenuBackdrop');
      const sidebar = document.getElementById('serviceMenuSidebar');
      if (backdrop && sidebar) {
        setClassActive(backdrop, 'open', false);
        setClassActive(sidebar, 'open', false);
      }
    }

    // ==================== 전역 함수 노출 (onclick 지원) ====================
    // 이미 노출된 함수들: resetQuota, clearRecentNumbers, deleteRecentNumber, clearAllData

    window.openServiceMenu = openServiceMenu;
    window.closeServiceMenu = closeServiceMenu;
    window.openSettings = openSettings;
    window.closeSettings = closeSettings;
    window.openAboutModal = openAboutModal;
    window.closeAboutModal = closeAboutModal;
    window.openPrivacyModal = openPrivacyModal;
    window.closePrivacyModal = closePrivacyModal;
    window.openTermsModal = openTermsModal;
    window.closeTermsModal = closeTermsModal;
    window.openAdminLoginModal = openAdminLoginModal;
    window.closeAdminLoginModal = closeAdminLoginModal;
    window.adminLogin = adminLogin;
    window.adminLogout = adminLogout;
    window.showGenerateConfirm = showGenerateConfirm;
    window.closeGenerateConfirm = closeGenerateConfirm;
    window.confirmGenerate = confirmGenerate;
    window.showAdForQuotaModal = showAdForQuotaModal;
    window.closeAdForQuotaModal = closeAdForQuotaModal;
    window.confirmAdForQuota = confirmAdForQuota;
    window.shareApp = shareApp;
    window.downloadHoxyShareCard = downloadHoxyShareCard;
    window.switchTab = switchTab;
    window.revealLuckyNumber = revealLuckyNumber;
    window.prevPage = prevPage;
    window.nextPage = nextPage;
    window.goToPage = goToPage;
    window.showExpandSlotsModal = showExpandSlotsModal;
    window.closeExpandSlotsModal = closeExpandSlotsModal;
    window.confirmExpandSlots = confirmExpandSlots;
    window.showPageAddConfirm = showPageAddConfirm;
    window.closePageAddConfirm = closePageAddConfirm;
    window.confirmPageAdd = confirmPageAdd;
    window.addManualInputLine = addManualInputLine;
    window.removeManualInputLine = removeManualInputLine;
    window.checkManualNumbers = checkManualNumbers;
    window.validateManualInput = validateManualInput;
    window.closeWinningStatsCard = closeWinningStatsCard;
    window.closeStatsCard = closeStatsCard;
    window.closeWinningCard = closeWinningCard;
    window.saveNumber = saveNumber;
    window.saveAllRecentNumbers = saveAllRecentNumbers;
    window.deleteSaved = deleteSaved;
    window.closeGeneratedModal = closeGeneratedModal;

    // 저장된 번호 페이지네이션
    window.prevSavedPage = prevSavedPage;
    window.nextSavedPage = nextSavedPage;
    window.goToSavedPage = goToSavedPage;
    window.showSavedPageAddConfirm = showSavedPageAddConfirm;
    window.closeSavedPageAddConfirm = closeSavedPageAddConfirm;
    window.confirmSavedPageAdd = confirmSavedPageAdd;
    window.showSavedExpandConfirm = showSavedExpandConfirm;
    window.clearSavedNumbers = clearSavedNumbers;

    // ==================== 초기화 실행 ====================

    initApp();
