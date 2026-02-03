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
      RECENT_SLOTS: 'hoxy_recent_slots'
    };

    let winningData = {
      drawNumber: 1199,
      drawDate: '2025-11-22',
      numbers: [16, 24, 25, 30, 31, 32],
      bonus: 7,
      firstPrize: '1,695,609,839'
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
      
      if (confirmRemainingEl) confirmRemainingEl.textContent = quota.remaining;
      if (confirmTotalEl) confirmTotalEl.textContent = quota.total;
      if (modalEl) modalEl.classList.add('active');
    }

    function closeGenerateConfirm() {
      const modalEl = document.getElementById('generateConfirmModal');
      const checkboxEl = document.getElementById('generate5Times');
      
      if (modalEl) modalEl.classList.remove('active');
      if (checkboxEl) checkboxEl.checked = false;
    }

    function confirmGenerate() {
      const checkboxEl = document.getElementById('generate5Times');
      const is5Times = checkboxEl ? checkboxEl.checked : false;
      const count = is5Times ? 5 : 1;
      
      const quota = getQuota();
      if (quota.remaining < count) {
        showToast(`남은 횟수가 부족합니다! (${quota.remaining}회)`, 3000);
        return;
      }

      closeGenerateConfirm();
      showGeneratingAnimation(count);
    }

    // ==================== 광고 보고 +5회 받기 모달 ====================
    
    function showAdForQuotaModal() {
      const modalEl = document.getElementById('adForQuotaModal');
      if (modalEl) modalEl.classList.add('active');
    }

    function closeAdForQuotaModal() {
      const modalEl = document.getElementById('adForQuotaModal');
      if (modalEl) modalEl.classList.remove('active');
    }

    function confirmAdForQuota() {
      closeAdForQuotaModal();
      showToast('광고를 시청합니다...', 2000);
      
      setTimeout(() => {
        addQuota(5);
        updateUI();
        showToast('생성 횟수 5회가 추가되었습니다!', 2000);
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
      showToast('광고를 시청합니다...', 1500);
      
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
            <div class="flex items-center justify-center gap-1 p-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl opacity-50">
              <span class="text-xs text-gray-400 w-6 shrink-0">#${slot.index + 1}</span>
              <div class="flex gap-1 justify-center">
                <div class="w-8 h-8 rounded-full bg-gray-200"></div>
                <div class="w-8 h-8 rounded-full bg-gray-200"></div>
                <div class="w-8 h-8 rounded-full bg-gray-200"></div>
                <div class="w-8 h-8 rounded-full bg-gray-200"></div>
                <div class="w-8 h-8 rounded-full bg-gray-200"></div>
                <div class="w-8 h-8 rounded-full bg-gray-200"></div>
              </div>
            </div>
          `;
        } else {
          return `
            <div class="swipe-item relative" data-index="${slot.index}">
              <div class="swipe-save-btn" onclick="saveNumber(${JSON.stringify(slot.data.numbers)})">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                저장
              </div>
              <div class="swipe-delete-btn" onclick="deleteRecentNumber(${slot.index})">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                삭제
              </div>
              <div class="swipe-content flex items-center justify-center gap-1 p-3 ${slot.index === 0 ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200' : 'bg-gray-50'} rounded-xl">
                <span class="text-xs ${slot.index === 0 ? 'text-blue-600 font-bold' : 'text-gray-500'} w-6 shrink-0">#${slot.index + 1}</span>
                <div class="flex gap-1 justify-center">
                  ${renderNumberBalls(slot.data.numbers)}
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
      showToast('광고를 시청합니다...', 1500);
      
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

    // Firebase에 번호 저장
    function saveToFirebase(numbers) {
      try {
        const winning = getWinningNumbers();
        db.collection('generated_numbers').add({
          numbers: numbers,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          week: winning.drawNumber,
          createdAt: new Date().toISOString()
        });
        console.log('번호가 Firebase에 저장되었습니다:', numbers);
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
      
      // 최대 50개까지만 저장
      if (recent.length >= 50) {
        recent.pop();
      }
      
      recent.unshift({ numbers, timestamp: Date.now() });
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
      showToast('삭제되었습니다', 1500);
    }
    
    // 전역으로 명시적 노출
    window.deleteRecentNumber = deleteRecentNumber;

    function initSwipeListeners() {
      const swipeItems = document.querySelectorAll('.swipe-item');

      swipeItems.forEach(item => {
        let startX = 0;
        let currentX = 0;
        let isSwiping = false;

        const content = item.querySelector('.swipe-content');
        if (!content) return;

        // 스와이프 상태 초기화
        function resetSwipe() {
          content.style.transform = 'translateX(0)';
          item.classList.remove('swiped-left', 'swiped-right', 'swiping');
        }

        // 터치 시작
        item.addEventListener('touchstart', (e) => {
          startX = e.touches[0].clientX;
          currentX = startX;
          isSwiping = true;
          item.classList.add('swiping');
          // 다른 아이템의 스와이프 상태 초기화
          document.querySelectorAll('.swipe-item').forEach(other => {
            if (other !== item) {
              const otherContent = other.querySelector('.swipe-content');
              if (otherContent) otherContent.style.transform = 'translateX(0)';
              other.classList.remove('swiped-left', 'swiped-right');
            }
          });
        });

        // 터치 이동
        item.addEventListener('touchmove', (e) => {
          if (!isSwiping) return;

          currentX = e.touches[0].clientX;
          const diffX = currentX - startX;

          // 양방향 스와이프 (최대 70px)
          const translateX = Math.max(-70, Math.min(70, diffX));
          content.style.transform = `translateX(${translateX}px)`;
        });

        // 터치 종료
        item.addEventListener('touchend', () => {
          if (!isSwiping) return;

          const diffX = currentX - startX;
          item.classList.remove('swiping');

          // 40px 이상 스와이프하면 버튼 표시
          if (diffX > 40) {
            content.style.transform = 'translateX(70px)';
            item.classList.add('swiped-left');
            item.classList.remove('swiped-right');
          } else if (diffX < -40) {
            content.style.transform = 'translateX(-70px)';
            item.classList.add('swiped-right');
            item.classList.remove('swiped-left');
          } else {
            resetSwipe();
          }

          isSwiping = false;
        });

        // 마우스 이벤트 (데스크톱)
        item.addEventListener('mousedown', (e) => {
          startX = e.clientX;
          currentX = startX;
          isSwiping = true;
          item.classList.add('swiping');
        });

        item.addEventListener('mousemove', (e) => {
          if (!isSwiping) return;

          currentX = e.clientX;
          const diffX = currentX - startX;
          const translateX = Math.max(-70, Math.min(70, diffX));
          content.style.transform = `translateX(${translateX}px)`;
        });

        item.addEventListener('mouseup', () => {
          if (!isSwiping) return;

          const diffX = currentX - startX;
          item.classList.remove('swiping');

          if (diffX > 40) {
            content.style.transform = 'translateX(70px)';
            item.classList.add('swiped-left');
            item.classList.remove('swiped-right');
          } else if (diffX < -40) {
            content.style.transform = 'translateX(-70px)';
            item.classList.add('swiped-right');
            item.classList.remove('swiped-left');
          } else {
            resetSwipe();
          }

          isSwiping = false;
        });

        item.addEventListener('mouseleave', () => {
          if (isSwiping) {
            resetSwipe();
            isSwiping = false;
          }
        });
      });
    }

    // ==================== 저장된 번호 관리 ====================
    
    function saveNumber(numbers) {
      const saved = getSaved();

      if (saved.length >= 50) {
        showToast('저장된 번호는 최대 50개까지 가능합니다', 2000);
        return;
      }

      const exists = saved.some(item => JSON.stringify(item.numbers) === JSON.stringify(numbers));

      if (exists) {
        showToast('이미 저장된 번호입니다!', 2000);
        return;
      }

      saved.push({ numbers, timestamp: Date.now() });
      localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(saved));
      updateUI();
      updateWinningStats();
      showToast('✅ 저장되었습니다', 2000);
    }

    function saveAllRecentNumbers() {
      const recent = getRecent();
      if (recent.length === 0) {
        showToast('저장할 번호가 없습니다', 2000);
        return;
      }

      const saved = getSaved();
      let savedCount = 0;

      for (const item of recent) {
        if (saved.length >= 50) {
          showToast(`저장 공간이 부족합니다 (${savedCount}개 저장됨)`, 2000);
          break;
        }

        const exists = saved.some(s => JSON.stringify(s.numbers) === JSON.stringify(item.numbers));
        if (!exists) {
          saved.push({ numbers: item.numbers, timestamp: Date.now() });
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

    // ==================== 당첨 통계 업데이트 ====================
    
    async function updateWinningStats() {
      try {
        const winning = getWinningNumbers();

        // Firebase에서 현재 회차 데이터 가져오기
        const snapshot = await db.collection('generated_numbers')
          .where('week', '==', winning.drawNumber)
          .get();

        let stats = {
          total: 0,
          rank3: 0,  // 5등 (3개 일치)
          rank4: 0,  // 4등 (4개 일치)
          rank5: 0   // 3등 (5개 일치)
        };

        snapshot.forEach(doc => {
          const data = doc.data();
          const matchCount = countMatches(data.numbers, winning.numbers);

          if (matchCount >= 3) {
            stats.total++;
            if (matchCount === 3) stats.rank3++;
            if (matchCount === 4) stats.rank4++;
            if (matchCount === 5) stats.rank5++;
          }
        });

        // UI 업데이트
        const totalEl = document.getElementById('totalWinners');
        const winners5thEl = document.getElementById('winners5th');
        const winners4thEl = document.getElementById('winners4th');
        const winners3rdEl = document.getElementById('winners3rd');

        if (totalEl) totalEl.textContent = stats.total;
        if (winners5thEl) winners5thEl.textContent = stats.rank3;
        if (winners4thEl) winners4thEl.textContent = stats.rank4;
        if (winners3rdEl) winners3rdEl.textContent = stats.rank5;

        console.log('통계 업데이트 완료:', stats);
      } catch (error) {
        console.error('통계 업데이트 오류:', error);
      }
    }

    // 일치하는 번호 개수 계산
    function countMatches(numbers, winningNumbers) {
      return numbers.filter(n => winningNumbers.includes(n)).length;
    }

    function closeWinningStatsCard() {
      // Green card 삭제로 인해 비활성화됨
    }

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

              // 데이터 변환
              const result = {
                drawNumber: parseInt(latestDraw.chasu),
                drawDate: latestDraw.date,
                numbers: latestDraw.ball.map(n => parseInt(n)),
                bonus: parseInt(latestDraw.bonusBall),
                firstPrize: latestDraw.win?.win1?.wonmoney ? parseInt(latestDraw.win.win1.wonmoney).toLocaleString() : '0'
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
          winningData = {
            drawNumber: data.drawNumber,
            drawDate: data.drawDate,
            numbers: data.numbers,
            bonus: data.bonus,
            firstPrize: data.firstPrize
          };
          localStorage.setItem(STORAGE_KEYS.WINNING, JSON.stringify(winningData));
          updateCheckUI();
          updateWinningStats();
          showToast(`${drawNo}회차 당첨 정보 로드 완료`, 2000);
          return;
        }
      } catch (error) {
        console.error('Firestore 조회 오류:', error);
      }

      // Firestore에 없으면 API에서 가져오기
      const data = await fetchLotteryData(drawNo);
      if (data) {
        winningData = {
          drawNumber: data.drawNumber,
          drawDate: data.drawDate,
          numbers: data.numbers,
          bonus: data.bonus,
          firstPrize: data.firstPrize
        };

        // Firestore에 저장
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
      addManualInputLine();
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
      lineDiv.innerHTML = `
        <span class="text-xs text-gray-500 w-6">#${manualInputLineCount}</span>
        ${[1,2,3,4,5,6].map(i => `
          <input type="number" min="1" max="45" 
                 class="number-input" 
                 id="manual_${manualInputLineCount}_${i}"
                 onchange="validateManualInput(this)">
        `).join('')}
        <button onclick="removeManualInputLine(this)" class="text-red-500 hover:text-red-700 ml-auto">
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

    function checkManualNumbers() {
      const lines = document.querySelectorAll('#manualInputLines > div');
      const allNumbers = [];
      
      lines.forEach((line, lineIndex) => {
        const inputs = line.querySelectorAll('input');
        const numbers = [];
        
        inputs.forEach(input => {
          if (input.value) {
            numbers.push(parseInt(input.value));
          }
        });
        
        if (numbers.length === 6) {
          allNumbers.push({ line: lineIndex + 1, numbers: numbers.sort((a, b) => a - b) });
        }
      });

      if (allNumbers.length === 0) {
        showToast('번호를 입력해주세요', 2000);
        return;
      }

      allNumbers.forEach(item => {
        saveNumber(item.numbers);
      });

      document.querySelectorAll('#manualInputLines input').forEach(input => {
        if (input) {
          input.value = '';
          if (input.classList) {
            input.classList.remove('filled');
          }
        }
      });

      showToast(`${allNumbers.length}줄이 저장되었습니다!`, 2000);
      
      setTimeout(() => {
        updateCheckUI();
      }, 100);
    }

    // ==================== 오늘의 행운 번호 ====================
    
    function getLuckyNumber() {
      const today = new Date().toDateString();
      const stored = localStorage.getItem(STORAGE_KEYS.LUCKY);
      
      if (stored) {
        const lucky = JSON.parse(stored);
        if (lucky.date === today) {
          return lucky;
        }
      }

      const seed = new Date().getDate() + new Date().getMonth() * 31;
      const rng = mulberry32(seed);
      const numbers = [];
      
      while (numbers.length < 6) {
        const num = Math.floor(rng() * 45) + 1;
        if (!numbers.includes(num)) {
          numbers.push(num);
        }
      }
      
      const lucky = {
        date: today,
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
        '🌈 긍정적인 에너지가 넘치는 날'
      ];
      return messages[new Date().getDate() % messages.length];
    }

    function revealLuckyNumber() {
      showToast('광고를 시청합니다...', 1000);
      
      setTimeout(() => {
        const lucky = getLuckyNumber();
        lucky.revealed = true;
        localStorage.setItem(STORAGE_KEYS.LUCKY, JSON.stringify(lucky));
        
        const blurredEl = document.getElementById('luckyNumberBlurred');
        const revealEl = document.getElementById('luckyNumberReveal');
        
        if (blurredEl) {
          blurredEl.style.filter = 'none';
          blurredEl.innerHTML = renderNumberBalls(lucky.numbers);
        }
        
        if (revealEl) {
          revealEl.style.display = 'none';
        }
      }, 1000);
    }

    // ==================== 당첨 확인 ====================
    
    function checkWinnings() {
      const saved = getSaved();
      const winning = getWinningNumbers();
      
      let hasWinning = false;
      saved.forEach(item => {
        const match = checkMatch(item.numbers, winning.numbers);
        if (match.count >= 3) {
          hasWinning = true;
        }
      });

      if (hasWinning) {
        showWinningCard();
      }
    }

    function checkMatch(numbers, winningNumbers) {
      const matches = numbers.filter(n => winningNumbers.includes(n));
      return {
        count: matches.length,
        numbers: matches
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
          generateBtnEl.innerHTML = '📺 광고 보고 +5회 더 생성하기';
          depletedMsgEl.style.display = 'block';
        } else {
          generateBtnEl.textContent = '로또 번호 생성하기';
          depletedMsgEl.style.display = 'none';
        }
      }
    }

    function updateSavedUI() {
      updateSavedPagination();
    }

    function updateSavedPagination() {
      const saved = getSaved();
      const totalItems = saved.length;
      const totalPages = Math.min(Math.ceil(totalItems / savedItemsPerPage), savedMaxPages);
      
      const currentPageEl = document.getElementById('savedCurrentPage');
      const totalPagesEl = document.getElementById('savedTotalPages');
      const dotsContainer = document.getElementById('savedPaginationDots');
      const btnPrev = document.getElementById('btnPrevSaved');
      const btnNext = document.getElementById('btnNextSaved');
      
      if (currentPageEl) currentPageEl.textContent = savedCurrentPageIndex + 1;
      if (totalPagesEl) totalPagesEl.textContent = savedMaxPages;
      
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

      container.innerHTML = pageItems.map((item, index) => {
        const globalIndex = startIndex + index;
        return `
          <div class="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 overflow-hidden">
            <span class="text-xs text-blue-600 font-bold w-6 shrink-0">#${globalIndex + 1}</span>
            <div class="flex gap-1 flex-1 min-w-0">
              ${renderNumberBalls(item.numbers)}
            </div>
            <button onclick="deleteSaved(${globalIndex})" class="text-red-600 text-xs font-bold hover:text-red-700 shrink-0">삭제</button>
          </div>
        `;
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
      showToast('광고를 시청합니다...', 1500);
      
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
      
      const drawNumberEl = document.getElementById('checkDrawNumber');
      const drawDateEl = document.getElementById('checkDrawDate');
      const firstPrizeEl = document.getElementById('checkFirstPrize');
      const winningNumbersEl = document.getElementById('checkWinningNumbers');
      const savedCheckCountEl = document.getElementById('savedCheckCount');
      
      if (drawNumberEl) drawNumberEl.textContent = winning.drawNumber;
      if (drawDateEl) drawDateEl.textContent = winning.drawDate;
      if (firstPrizeEl) firstPrizeEl.textContent = formatPrize(winning.firstPrize);
      if (winningNumbersEl) winningNumbersEl.innerHTML = renderNumberBalls(winning.numbers, winning.bonus);
      if (savedCheckCountEl) savedCheckCountEl.textContent = saved.length;
      
      if (!container || !noSaved) return;
      
      if (saved.length === 0) {
        container.style.display = 'none';
        noSaved.style.display = 'block';
        return;
      }

      container.style.display = 'block';
      noSaved.style.display = 'none';
      
      container.innerHTML = saved.map((item, index) => {
        const match = checkMatch(item.numbers, winning.numbers);
        const rank = getMatchRank(match.count);
        
        return `
          <div class="p-4 rounded-xl ${rank ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300' : 'bg-gray-50 border border-gray-200'}">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-xs text-gray-500 font-medium">#${index + 1}</span>
              <div class="flex gap-1.5 flex-1">
                ${item.numbers.map(num => {
                  const isMatch = winning.numbers.includes(num);
                  return renderBall(num, isMatch ? 'matched' : 'normal');
                }).join('')}
              </div>
            </div>
            ${rank ? `
              <div class="text-center">
                <div class="inline-block bg-green-600 text-white px-4 py-2 rounded-full font-bold text-sm">
                  🎉 ${match.count}개 일치 - ${rank}
                </div>
              </div>
            ` : `
              <div class="text-center text-sm text-gray-500">
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
      
      if (messageEl) messageEl.textContent = lucky.message;
      
      if (lucky.revealed && blurredEl && revealEl) {
        blurredEl.style.filter = 'none';
        blurredEl.innerHTML = renderNumberBalls(lucky.numbers);
        revealEl.style.display = 'none';
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
        return `<div class="w-8 h-8 shrink-0 bg-gradient-to-br ${colorClass} rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md border-2 border-white">${num}</div>`;
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

      return `<div class="w-8 h-8 shrink-0 bg-gradient-to-br ${colorClass} rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">${num}</div>`;
    }

    function getMatchRank(count) {
      if (count === 6) return '1등 당첨!';
      if (count === 5) return '3등 당첨!';
      if (count === 4) return '4등 당첨!';
      if (count === 3) return '5등 당첨!';
      return null;
    }

    function formatPrize(prize) {
      const num = prize.replace(/,/g, '');
      return parseInt(num).toLocaleString() + '원';
    }

    // ==================== 탭 전환 ====================
    
    function switchTab(tabId) {
      // 모든 탭 비활성화
      document.querySelectorAll('.tab-content').forEach(tab => {
        if (tab && tab.classList) {
          tab.classList.remove('active');
        }
      });
      
      // 모든 버튼 비활성화
      document.querySelectorAll('[id^="btn"]').forEach(btn => {
        if (!btn || !btn.classList) return;
        
        btn.classList.remove('text-blue-600');
        btn.classList.add('text-gray-400');
        
        const span = btn.querySelector('span');
        if (span && span.classList) {
          span.classList.remove('font-bold');
        }
      });
      
      // 선택된 탭 활성화
      const tabEl = document.getElementById(tabId);
      if (tabEl && tabEl.classList) {
        tabEl.classList.add('active');
      }
      
      // 선택된 버튼 활성화
      const btnId = tabId.replace('Tab', '');
      const btnMap = { home: 'btnHome', saved: 'btnSaved', check: 'btnCheck' };
      const btn = document.getElementById(btnMap[btnId]);
      
      if (btn && btn.classList) {
        btn.classList.remove('text-gray-400');
        btn.classList.add('text-blue-600');
        
        const span = btn.querySelector('span');
        if (span && span.classList) {
          span.classList.add('font-bold');
        }
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

    function clearAllData() {
      if (confirm('모든 데이터를 삭제하시겠습니까?\n\n다음 항목이 초기화됩니다:\n- 오늘 남은 생성 횟수 (10회로 초기화)\n- 최근 생성 번호 리스트\n- 저장된 번호 리스트')) {
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

    // ==================== 전역 함수 노출 (onclick 지원) ====================
    // 이미 노출된 함수들: resetQuota, clearRecentNumbers, deleteRecentNumber, clearAllData

    window.openSettings = openSettings;
    window.closeSettings = closeSettings;
    window.showGenerateConfirm = showGenerateConfirm;
    window.closeGenerateConfirm = closeGenerateConfirm;
    window.confirmGenerate = confirmGenerate;
    window.showAdForQuotaModal = showAdForQuotaModal;
    window.closeAdForQuotaModal = closeAdForQuotaModal;
    window.confirmAdForQuota = confirmAdForQuota;
    window.shareApp = shareApp;
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
