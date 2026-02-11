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

    // ==================== 토스트 메시지 ====================
    
    function showToast(message, duration = 2000) {
      const toast = document.getElementById('toast');
      const toastMessage = document.getElementById('toastMessage');
      
      if (!toast || !toastMessage) return;
      
      toastMessage.textContent = message;
      toast.classList.add('show');
      
      setTimeout(() => {
        if (toast && toast.classList) {
          toast.classList.remove('show');
        }
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
      const modalEl = document.getElementById('generateConfirmModal');
      const option5TimesEl = document.getElementById('option5Times');
      const optionRemainingEl = document.getElementById('optionRemaining');
      const remainingCountEl = document.getElementById('remainingDrawCount');

      if (confirmRemainingEl) confirmRemainingEl.textContent = quota.remaining;
      if (confirmTotalEl) confirmTotalEl.textContent = quota.total;

      // 할당량에 따라 옵션 표시 변경
      if (quota.remaining >= 5) {
        // 5회 이상: 5회 연속 뽑기 옵션
        if (option5TimesEl) option5TimesEl.classList.remove('hidden');
        if (optionRemainingEl) optionRemainingEl.classList.add('hidden');
      } else {
        // 4회 이하: 남은 횟수 모두 뽑기 옵션
        if (option5TimesEl) option5TimesEl.classList.add('hidden');
        if (optionRemainingEl) optionRemainingEl.classList.remove('hidden');
        if (remainingCountEl) remainingCountEl.textContent = quota.remaining;
      }

      if (modalEl) modalEl.classList.add('active');
    }

    function closeGenerateConfirm() {
      const modalEl = document.getElementById('generateConfirmModal');
      const checkboxEl = document.getElementById('generate5Times');
      const checkboxRemainingEl = document.getElementById('generateRemaining');

      if (modalEl) modalEl.classList.remove('active');
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

      const modalEl = document.getElementById('adForQuotaModal');
      if (modalEl) modalEl.classList.add('active');
    }

    function closeAdForQuotaModal() {
      const modalEl = document.getElementById('adForQuotaModal');
      if (modalEl) modalEl.classList.remove('active');
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
      const modalEl = document.getElementById('expandSlotsModal');
      
      if (currentEl) currentEl.textContent = recentSlots;
      if (afterEl) afterEl.textContent = Math.min(recentSlots + 5, 50);
      if (modalEl) modalEl.classList.add('active');
    }

    function closeExpandSlotsModal() {
      const modalEl = document.getElementById('expandSlotsModal');
      if (modalEl) modalEl.classList.remove('active');
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
            <div class="flex items-center justify-center gap-1 p-2 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl opacity-50">
              <span class="text-xs text-gray-400 w-5 shrink-0">#${slot.index + 1}</span>
              <div class="flex gap-1 justify-center">
                <div class="w-7 h-7 rounded-full bg-gray-200"></div>
                <div class="w-7 h-7 rounded-full bg-gray-200"></div>
                <div class="w-7 h-7 rounded-full bg-gray-200"></div>
                <div class="w-7 h-7 rounded-full bg-gray-200"></div>
                <div class="w-7 h-7 rounded-full bg-gray-200"></div>
                <div class="w-7 h-7 rounded-full bg-gray-200"></div>
              </div>
            </div>
          `;
        } else {
          return `
            <div class="swipe-item relative group" data-index="${slot.index}" data-numbers='${JSON.stringify(slot.data.numbers)}' data-target-draw="${slot.data.targetDraw || getNextDrawNumber()}">
              <div class="swipe-content flex items-center justify-between gap-1 p-2 ${slot.index === 0 ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200' : 'bg-gray-50'} rounded-xl">
                <span class="text-xs ${slot.index === 0 ? 'text-blue-600 font-bold' : 'text-gray-500'} w-5 shrink-0">#${slot.index + 1}</span>
                <div class="flex gap-1 justify-center flex-1">
                  ${renderNumberBalls(slot.data.numbers)}
                </div>
                <!-- PC 호버 버튼 -->
                <div class="hidden md:flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onclick="hoverSave(${slot.index})" class="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors" title="저장">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                    </svg>
                  </button>
                  <button onclick="hoverDelete(${slot.index})" class="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors" title="삭제">
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
      const modalEl = document.getElementById('pageAddConfirmModal');
      
      if (pageNumEl) pageNumEl.textContent = pageNum;
      if (modalEl) modalEl.classList.add('active');
    }

    function closePageAddConfirm() {
      const modalEl = document.getElementById('pageAddConfirmModal');
      if (modalEl) modalEl.classList.remove('active');
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
      
      modalEl.classList.add('active');
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          setTimeout(() => {
            modalEl.classList.remove('active');
            showGeneratedComplete(count);
          }, 500);
        }
        
        const percentEl = document.getElementById('loadingPercent');
        const barEl = document.getElementById('loadingProgressBar');
        const messageEl = document.getElementById('loadingMessage');
        
        if (percentEl) percentEl.textContent = Math.round(progress);
        if (barEl) barEl.style.width = progress + '%';
        
        if (messageEl) {
          if (progress < 20) {
            messageEl.textContent = '랜덤 번호 생성 중...';
          } else if (progress < 40) {
            messageEl.textContent = '행운의 조합 찾는 중...';
          } else if (progress < 60) {
            messageEl.textContent = '당첨 확률 계산 중...';
          } else if (progress < 80) {
            messageEl.textContent = '마지막 검증 중...';
          } else {
            messageEl.textContent = '완료!';
          }
        }
      }, 250);
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

      const modalEl = document.getElementById('generatedModal');
      if (modalEl) modalEl.classList.add('active');
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
      const modalEl = document.getElementById('generatedModal');
      if (modalEl) modalEl.classList.remove('active');
      
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
        swipeState.item.classList.remove('swiping');
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

        item.classList.add('swiping');
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

      const modal = document.getElementById('saveConfirmModal');
      const numbersEl = document.getElementById('saveConfirmNumbers');

      if (numbersEl && currentActionNumbers) {
        numbersEl.innerHTML = renderNumberBalls(currentActionNumbers);
      }

      if (modal) {
        modal.classList.add('active');
      }
    }

    // 저장 확인 모달 닫기
    function closeSaveConfirm() {
      const modal = document.getElementById('saveConfirmModal');
      if (modal) {
        modal.classList.remove('active');
      }
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

      const modal = document.getElementById('deleteConfirmModal');
      const numbersEl = document.getElementById('deleteConfirmNumbers');

      if (numbersEl && currentActionNumbers) {
        numbersEl.innerHTML = renderNumberBalls(currentActionNumbers);
      }

      if (modal) {
        modal.classList.add('active');
      }
    }

    // 삭제 확인 모달 닫기
    function closeDeleteConfirm() {
      const modal = document.getElementById('deleteConfirmModal');
      if (modal) {
        modal.classList.remove('active');
      }
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
        currentInput.classList.remove('border-red-500');
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
        currentInput.classList.add('border-red-500');
        currentInput.classList.remove('border-gray-300', 'border-blue-500');
      } else {
        resetManualHint();
        currentInput.classList.remove('border-red-500');
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
        currentInput.classList.remove('border-red-500');
        return;
      }

      // 1자리 입력 중이면 아직 체크하지 않음 (10-19 등 입력 중일 수 있음)
      // 2자리 완성 시에만 중복 체크
      if (currentValue.length < 2) {
        currentInput.classList.remove('border-red-500');
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
        currentInput.classList.add('border-red-500');
        currentInput.classList.remove('border-gray-300', 'border-blue-500');
      } else {
        // 정상 상태로 복원
        resetManualHint();
        currentInput.classList.remove('border-red-500');
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
          input.classList.remove('border-red-500');
          input.classList.add('border-gray-300');
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
        if (banner) banner.style.display = 'none';
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
          banner.style.display = 'none';
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
          // JSONP를 사용하여 CORS 우회
          const callbackName = 'lottoCallback_' + Date.now();
          let apiUrl = `https://api.lotto-haru.kr/win/analysis.js?callback=${callbackName}`;

          // 특정 회차 지정 시
          if (drawNo) {
            apiUrl += `&chasu=${drawNo}`;
          }

          // 전역 콜백 함수 등록
          window[callbackName] = function(data) {
            // 데이터 처리
            try {
              // 데이터 구조: { data: [{ball: [...], bonusBall: ..., chasu: ..., ...}] }
              const latestDraw = data.data ? data.data[0] : null;

              if (!latestDraw) {
                console.error('데이터 파싱 실패, 구조:', data);
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

              // 정리
              delete window[callbackName];
              document.body.removeChild(script);

              resolve(result);
            } catch (error) {
              console.error('데이터 파싱 오류:', error);
              delete window[callbackName];
              document.body.removeChild(script);
              resolve(null);
            }
          };

          // script 태그 생성 및 추가
          const script = document.createElement('script');
          script.src = apiUrl;
          script.onerror = function() {
            console.error('로또 API 호출 실패');
            delete window[callbackName];
            document.body.removeChild(script);
            resolve(null);
          };
          document.body.appendChild(script);

        } catch (error) {
          console.error('로또 API 호출 오류:', error);
          resolve(null);
        }
      });
    }

    // 최신 회차 번호 계산
    function getLatestDrawNumber() {
      // 로또 1회: 2002년 12월 7일 (토요일)
      const firstDrawDate = new Date('2002-12-07');
      const today = new Date();

      // 밀리초를 주 단위로 변환
      const weeksDiff = Math.floor((today - firstDrawDate) / (7 * 24 * 60 * 60 * 1000));

      return weeksDiff + 1;
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
      const latestDraw = getLatestDrawNumber();
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
                 class="w-10 h-10 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                 id="manual_${manualInputLineCount}_${i}"
                 oninput="onCheckManualInput(this, ${manualInputLineCount}, ${i})"
                 onblur="onCheckManualBlur(this, ${manualInputLineCount}, ${i})"
                 placeholder="${i}">
        `).join('')}
        <button onclick="removeManualInputLine(this)" class="text-red-500 hover:text-red-700 flex-shrink-0 ml-1">
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
        input.classList.add('filled');
      } else {
        input.classList.remove('filled');
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
        currentInput.classList.remove('border-red-500');
        currentInput.classList.add('border-gray-300');
        return;
      }

      // 2자리 입력 완료 시에만 중복 체크
      if (currentValue.length < 2) {
        currentInput.classList.remove('border-red-500');
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
        currentInput.classList.add('border-red-500');
        currentInput.classList.remove('border-gray-300', 'border-blue-500');
        showToast('⚠️ 중복된 번호입니다', 1500);
      } else {
        currentInput.classList.remove('border-red-500');
      }
    }

    window.onCheckManualInput = onCheckManualInput;

    // 포커스 벗어날 때 중복 체크 (길이 상관없이)
    function onCheckManualBlur(input, lineNum, fieldNum) {
      const currentValue = input.value;
      if (!currentValue) {
        input.classList.remove('border-red-500');
        input.classList.add('border-gray-300');
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
        input.classList.add('border-red-500');
        input.classList.remove('border-gray-300', 'border-blue-500');
        showToast('⚠️ 중복된 번호입니다', 1500);
      } else {
        input.classList.remove('border-red-500');
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
                input.classList.add('border-red-500');
                input.classList.remove('border-gray-300');
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
            input.classList.remove('filled', 'border-red-500');
            input.classList.add('border-gray-300');
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
          let rankClass = 'bg-gray-50 border border-gray-200';
          let badgeClass = 'bg-gray-400';

          if (item.rankInfo) {
            rankClass = `rank-${item.rankInfo.rank}`;
            if (item.rankInfo.rank === 1) badgeClass = 'bg-gradient-to-r from-yellow-500 to-orange-500';
            else if (item.rankInfo.rank === 2) badgeClass = 'bg-gradient-to-r from-gray-400 to-gray-500';
            else if (item.rankInfo.rank === 3) badgeClass = 'bg-gradient-to-r from-orange-400 to-orange-600';
            else badgeClass = 'bg-green-600';
          }

          return `
            <div class="p-2 rounded-xl ${rankClass}">
              <div class="flex items-center gap-1 mb-1.5">
                <span class="text-xs text-gray-500 font-medium w-5 shrink-0">#${index + 1}</span>
                <div class="flex gap-1 flex-1 justify-center">
                  ${item.numbers.map(num => {
                    const isMatch = winning.numbers.includes(num);
                    return renderBall(num, isMatch ? 'matched' : 'normal');
                  }).join('')}
                </div>
              </div>
              ${item.rankInfo ? `
                <div class="text-center">
                  <div class="inline-block ${badgeClass} text-white px-2 py-1 rounded-full font-bold text-xs shadow-md">
                    ${item.rankInfo.rank <= 3 ? '🏆' : '🎉'} ${item.match.count}개 - ${item.rankInfo.text}
                  </div>
                </div>
              ` : `
                <div class="text-center text-xs text-gray-500">
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
      const modal = document.getElementById('luckyRevealModal');
      const loadingEl = document.getElementById('luckyModalLoading');
      const readyEl = document.getElementById('luckyModalReady');

      if (!modal || !loadingEl || !readyEl) return;

      // 모달 열기 (로딩 상태)
      loadingEl.classList.remove('hidden');
      readyEl.classList.add('hidden');
      modal.classList.add('active');

      // 3초 후 준비 완료 상태로 전환
      setTimeout(() => {
        loadingEl.classList.add('hidden');
        readyEl.classList.remove('hidden');
      }, 3000);
    }

    function confirmLuckyReveal() {
      const modal = document.getElementById('luckyRevealModal');
      const revealEl = document.getElementById('luckyNumberReveal');
      const blurredEl = document.getElementById('luckyNumberBlurred');
      const actionsEl = document.getElementById('luckyNumberActions');
      const cardEl = document.getElementById('luckyNumberCard');

      // 모달 닫기
      if (modal) modal.classList.remove('active');

      // 럭키넘버 데이터 저장
      const lucky = getLuckyNumber();
      lucky.revealed = true;
      localStorage.setItem(STORAGE_KEYS.LUCKY, JSON.stringify(lucky));

      // 홈 화면 럭키넘버 공개 애니메이션
      if (blurredEl) {
        blurredEl.style.filter = 'none';
        blurredEl.innerHTML = renderNumberBalls(lucky.numbers);
        blurredEl.classList.add('lucky-reveal-animation');
      }

      if (revealEl) {
        revealEl.style.display = 'none';
      }

      // 저장 버튼 표시
      if (actionsEl) {
        actionsEl.classList.remove('hidden');
        actionsEl.classList.add('lucky-actions-show');
      }

      // 카드 강조 효과
      if (cardEl) {
        cardEl.classList.add('lucky-reveal-animation');
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
          <div class="w-full py-2 bg-gray-200 text-gray-500 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5">
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
      if (cardEl) cardEl.style.display = 'block';
    }

    function closeWinningCard() {
      const cardEl = document.getElementById('winningCard');
      if (cardEl) cardEl.style.display = 'none';
    }

    function closeStatsCard() {
      const cardEl = document.getElementById('statsCard');
      if (cardEl) cardEl.style.display = 'none';
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
          depletedMsgEl.style.display = 'block';
        } else {
          generateBtnEl.textContent = '로또 번호 생성하기';
          depletedMsgEl.style.display = 'none';
        }
      }

      // 공유 배너: 할당량 0일 때만 표시
      const shareBannerEl = document.getElementById('shareBanner');
      if (shareBannerEl) {
        if (quota.remaining <= 0) {
          shareBannerEl.classList.remove('hidden');
        } else {
          shareBannerEl.classList.add('hidden');
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
            <div class="flex items-center gap-1 p-2 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl opacity-50">
              <span class="text-xs text-gray-400 w-5 shrink-0">#${slot.index + 1}</span>
              <div class="flex gap-1 flex-1 justify-center">
                <div class="w-7 h-7 rounded-full bg-gray-200"></div>
                <div class="w-7 h-7 rounded-full bg-gray-200"></div>
                <div class="w-7 h-7 rounded-full bg-gray-200"></div>
                <div class="w-7 h-7 rounded-full bg-gray-200"></div>
                <div class="w-7 h-7 rounded-full bg-gray-200"></div>
                <div class="w-7 h-7 rounded-full bg-gray-200"></div>
              </div>
              <div class="w-5 h-5 shrink-0"></div>
            </div>
          `;
        } else {
          return `
            <div class="flex items-center gap-1 p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <span class="text-xs text-blue-600 font-bold w-5 shrink-0">#${slot.index + 1}</span>
              <div class="flex gap-1 flex-1 justify-center overflow-hidden">
                ${renderNumberBalls(slot.data.numbers)}
              </div>
              <button onclick="deleteSaved(${slot.index})" class="text-red-500 hover:text-red-700 shrink-0 p-1">
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
      const modalEl = document.getElementById('savedPageAddConfirmModal');
      
      if (pageNumEl) pageNumEl.textContent = pageNum;
      if (modalEl) modalEl.classList.add('active');
    }

    function closeSavedPageAddConfirm() {
      const modalEl = document.getElementById('savedPageAddConfirmModal');
      if (modalEl) modalEl.classList.remove('active');
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
        container.style.display = 'none';
        noSaved.style.display = 'block';
        return;
      }

      container.style.display = 'block';
      noSaved.style.display = 'none';

      container.innerHTML = visibleSaved.map((item, index) => {
        const match = checkMatch(item.numbers, winning.numbers, winning.bonus);
        const rankInfo = getMatchRank(match.count, match.hasBonus);

        // 등수별 스타일 클래스
        let rankClass = 'bg-gray-50 border border-gray-200';
        let badgeClass = 'bg-gray-400';
        let clickable = '';

        if (rankInfo) {
          rankClass = `rank-${rankInfo.rank}`;
          clickable = `cursor-pointer hover:scale-[1.02] transition-transform`;

          if (rankInfo.rank === 1) badgeClass = 'bg-gradient-to-r from-yellow-500 to-orange-500';
          else if (rankInfo.rank === 2) badgeClass = 'bg-gradient-to-r from-gray-400 to-gray-500';
          else if (rankInfo.rank === 3) badgeClass = 'bg-gradient-to-r from-orange-400 to-orange-600';
          else badgeClass = 'bg-green-600';
        }

        const matchedNums = item.numbers.filter(n => winning.numbers.includes(n));

        return `
          <div class="p-2 rounded-xl ${rankClass} ${clickable}"
               ${rankInfo ? `onclick="showCongratsModal(${winning.drawNumber}, {rank: ${rankInfo.rank}, text: '${rankInfo.text}'}, ${JSON.stringify(matchedNums)})"` : ''}>
            <div class="flex items-center gap-1 mb-1.5">
              <span class="text-xs ${rankInfo && rankInfo.rank <= 3 ? 'text-gray-700 font-bold' : 'text-gray-500'} font-medium w-5 shrink-0">#${index + 1}</span>
              <div class="flex gap-1 flex-1 justify-center">
                ${item.numbers.map(num => {
                  const isMatch = winning.numbers.includes(num);
                  return renderBall(num, isMatch ? 'matched' : 'normal');
                }).join('')}
              </div>
            </div>
            ${rankInfo ? `
              <div class="text-center">
                <div class="inline-block ${badgeClass} text-white px-2 py-1 rounded-full font-bold text-xs shadow-md">
                  ${rankInfo.rank <= 3 ? '🏆' : '🎉'} ${match.count}개 - ${rankInfo.text}
                </div>
              </div>
            ` : `
              <div class="text-center text-xs text-gray-500">
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
          revealEl.style.display = 'none';
        }
        if (actionsEl) {
          actionsEl.classList.remove('hidden');
        }
      } else {
        // 미공개 상태: 블러 적용, 버튼 표시, 저장 버튼 숨김
        if (blurredEl) {
          blurredEl.style.filter = 'blur(8px)';
          blurredEl.innerHTML = `
            <div class="number-ball bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full"></div>
            <div class="number-ball bg-gradient-to-br from-blue-400 to-blue-600 rounded-full"></div>
            <div class="number-ball bg-gradient-to-br from-red-400 to-red-600 rounded-full"></div>
            <div class="number-ball bg-gradient-to-br from-gray-400 to-gray-600 rounded-full"></div>
            <div class="number-ball bg-gradient-to-br from-green-400 to-green-600 rounded-full"></div>
            <div class="number-ball bg-gradient-to-br from-green-500 to-green-700 rounded-full"></div>
          `;
        }
        if (revealEl) {
          revealEl.style.display = 'flex';
          revealEl.innerHTML = `
            <button onclick="revealLuckyNumber()" class="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2.5 rounded-full font-bold text-xs shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all flex items-center gap-1.5">
              <span>🍀</span>
              오늘의 럭키 넘버는?!
            </button>
          `;
        }
        if (actionsEl) {
          actionsEl.classList.add('hidden');
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
      let colorClass;

      if (type === 'bonus') {
        colorClass = 'from-green-400 to-green-600';
        return `<div class="number-ball bg-gradient-to-br ${colorClass} rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-white">${num}</div>`;
      }

      if (type === 'matched') {
        colorClass = 'from-green-400 to-green-600';
      } else {
        if (num <= 10) colorClass = 'from-yellow-400 to-orange-500';
        else if (num <= 20) colorClass = 'from-blue-400 to-blue-600';
        else if (num <= 30) colorClass = 'from-red-400 to-red-600';
        else if (num <= 40) colorClass = 'from-gray-400 to-gray-600';
        else colorClass = 'from-green-400 to-green-600';
      }

      return `<div class="number-ball bg-gradient-to-br ${colorClass} rounded-full flex items-center justify-center text-white font-bold shadow-md">${num}</div>`;
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

      if (modal) modal.classList.add('active');
    }

    function closeCongratsModal() {
      const modal = document.getElementById('congratsModal');
      if (modal) modal.classList.remove('active');
    }

    window.showCongratsModal = showCongratsModal;
    window.closeCongratsModal = closeCongratsModal;

    // ==================== 탭 전환 ====================
    
    function switchTab(tabId) {
      // 모든 탭 비활성화
      document.querySelectorAll('.tab-content').forEach(tab => {
        if (tab && tab.classList) {
          tab.classList.remove('active');
        }
      });

      // 모바일 네비게이션 버튼 초기화
      ['btnHome', 'btnSaved', 'btnCheck'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
          btn.classList.remove('text-blue-600');
          btn.classList.add('text-gray-400');
          const span = btn.querySelector('span');
          if (span) span.classList.remove('font-bold');
        }
      });

      // 데스크톱 네비게이션 버튼 초기화
      ['btnHomeDesktop', 'btnSavedDesktop', 'btnCheckDesktop'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
          btn.classList.remove('text-blue-600', 'bg-blue-50');
          btn.classList.add('text-gray-500');
        }
      });

      // 선택된 탭 활성화
      const tabEl = document.getElementById(tabId);
      if (tabEl && tabEl.classList) {
        tabEl.classList.add('active');
      }

      // 선택된 버튼 활성화 (모바일)
      const btnId = tabId.replace('Tab', '');
      const btnMap = { home: 'btnHome', saved: 'btnSaved', check: 'btnCheck' };
      const btn = document.getElementById(btnMap[btnId]);

      if (btn) {
        btn.classList.remove('text-gray-400');
        btn.classList.add('text-blue-600');
        const span = btn.querySelector('span');
        if (span) span.classList.add('font-bold');
      }

      // 선택된 버튼 활성화 (데스크톱)
      const btnMapDesktop = { home: 'btnHomeDesktop', saved: 'btnSavedDesktop', check: 'btnCheckDesktop' };
      const btnDesktop = document.getElementById(btnMapDesktop[btnId]);

      if (btnDesktop) {
        btnDesktop.classList.remove('text-gray-500');
        btnDesktop.classList.add('text-blue-600', 'bg-blue-50');
      }

      if (tabId === 'checkTab') {
        updateCheckUI();
      }
    }

    // ==================== 설정 ====================
    
    function openSettings() {
      const modalEl = document.getElementById('settingsModal');
      if (modalEl) modalEl.classList.add('active');
    }

    function closeSettings() {
      const modalEl = document.getElementById('settingsModal');
      if (modalEl) modalEl.classList.remove('active');
    }

    // ==================== 기타 정보 모달 ====================

    function openAboutModal() {
      const modalEl = document.getElementById('aboutModal');
      if (modalEl) modalEl.classList.add('active');
    }

    function closeAboutModal() {
      const modalEl = document.getElementById('aboutModal');
      if (modalEl) modalEl.classList.remove('active');
    }

    function openPrivacyModal() {
      const modalEl = document.getElementById('privacyModal');
      if (modalEl) modalEl.classList.add('active');
    }

    function closePrivacyModal() {
      const modalEl = document.getElementById('privacyModal');
      if (modalEl) modalEl.classList.remove('active');
    }

    function openTermsModal() {
      const modalEl = document.getElementById('termsModal');
      if (modalEl) modalEl.classList.add('active');
    }

    function closeTermsModal() {
      const modalEl = document.getElementById('termsModal');
      if (modalEl) modalEl.classList.remove('active');
    }

    // ==================== 관리자 로그인 ====================

    const ADMIN_CREDENTIALS = {
      id: 'dunsmile',
      pw: 'a123'
    };

    let isAdminLoggedIn = false;

    function openAdminLoginModal() {
      const modalEl = document.getElementById('adminLoginModal');
      if (modalEl) {
        modalEl.classList.add('active');
        document.getElementById('adminIdInput').value = '';
        document.getElementById('adminPwInput').value = '';
        document.getElementById('adminLoginError').classList.add('hidden');
      }
    }

    function closeAdminLoginModal() {
      const modalEl = document.getElementById('adminLoginModal');
      if (modalEl) modalEl.classList.remove('active');
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
        errorEl.classList.remove('hidden');
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
        adminSection.classList.remove('hidden');
        loginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
      } else {
        adminSection.classList.add('hidden');
        loginBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
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

    function openServiceMenu() {
      const backdrop = document.getElementById('serviceMenuBackdrop');
      const sidebar = document.getElementById('serviceMenuSidebar');
      if (backdrop && sidebar) {
        backdrop.classList.remove('hidden');
        sidebar.classList.remove('-translate-x-full');
      }
    }

    function closeServiceMenu() {
      const backdrop = document.getElementById('serviceMenuBackdrop');
      const sidebar = document.getElementById('serviceMenuSidebar');
      if (backdrop && sidebar) {
        backdrop.classList.add('hidden');
        sidebar.classList.add('-translate-x-full');
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
