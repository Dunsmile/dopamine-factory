/* 도파민 공작소 홈 - home.js */

// 서비스 데이터
const SERVICES = [
  { id: 'hoxy-number', name: 'HOXY', emoji: '🎱', bg: '#dbeafe', url: '/dunsmile/hoxy-number/', desc: '무료 로또 번호 생성기 - 행운의 번호를 추천받고 당첨 확인까지', fullName: 'HOXY NUMBER', category: 'luck' },
  { id: 'rich-face', name: '부자상?', emoji: '👤', bg: '#fef3c7', url: '/dunsmile/rich-face/', desc: 'AI 관상 분석으로 알아보는 나의 부자 확률', fullName: '부자가 될 상인가?', category: 'fortune' },
  { id: 'daily-fortune', name: '운세', emoji: '🔮', bg: '#f3e8ff', url: '/dunsmile/daily-fortune/', desc: '별자리, 띠, 사주로 보는 오늘의 종합 운세', fullName: '오늘의 운세', category: 'fortune' },
  { id: 'balance-game', name: '밸런스', emoji: '⚖️', bg: '#ffedd5', url: '/dunsmile/balance-game/', desc: '두 선택 중 하나를 고르고, 전체 선택 비율을 확인해보세요', fullName: '오늘의 밸런스 게임', category: 'fun' },
  { id: 'name-compatibility', name: '이름궁합', emoji: '💞', bg: '#cffafe', url: '/dunsmile/name-compatibility/', desc: '두 이름을 입력하면 케미 점수와 궁합 키워드를 확인할 수 있어요', fullName: '이름 궁합 테스트', category: 'fortune' },
  { id: 'market-sentiment', name: '시장감성', emoji: '📈', bg: '#d1fae5', url: '/dunsmile/market-sentiment/', desc: '펨코·디씨 게시글 기반 주식/코인 커뮤니티 감성 분석', fullName: '시장 감성 레이더', category: 'finance' },
  { id: 'tarot-reading', name: '타로', emoji: '🃏', bg: '#e0e7ff', url: '/dunsmile/tarot-reading/', desc: '78장 타로 카드가 전하는 오늘의 메시지, 무료 타로 리딩', fullName: 'ONE DAY MY CARD', category: 'fortune' },
];

// 운세 관련 서비스 (운세 탭에 표시할 것)
const FORTUNE_SERVICES = SERVICES.filter(s => s.category === 'fortune');

// 서비스 카드 그리드 (잠금 슬롯 포함 시 최소 8칸)
const GRID_TOTAL = 8;

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', initHome);

function initHome() {
  renderIconGrid();
  renderPopularList();
  renderSidebar();
  initCarousel();
  initSearch();
  initBottomNav();
  initSidebarToggle();
  initGameTab();
  handleViewParam();
}

// ===== URL 파라미터 뷰 전환 (?view=fortune 등) =====
function handleViewParam() {
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  if (!view) return;

  const navItems = document.querySelectorAll('#bottomNav .nav-item');

  switch (view) {
    case 'fortune':
      switchView('viewFortune');
      showFortuneList();
      navItems.forEach(n => n.classList.remove('active'));
      document.querySelector('#bottomNav .nav-item[data-nav="fortune"]')?.classList.add('active');
      break;
    case 'my':
      switchView('viewFavorites');
      showFavorites();
      navItems.forEach(n => n.classList.remove('active'));
      document.querySelector('#bottomNav .nav-item[data-nav="my"]')?.classList.add('active');
      break;
    case 'search':
      window.openSearch();
      break;
    case 'profile':
      switchView('viewProfile');
      showProfile();
      navItems.forEach(n => n.classList.remove('active'));
      document.querySelector('#bottomNav .nav-item[data-nav="profile"]')?.classList.add('active');
      break;
  }

  // URL에서 파라미터 제거 (뒤로가기 깔끔하게)
  window.history.replaceState({}, '', '/');
}

// ===== 사이드바 렌더링 =====
function buildSidebarHTML(isPC) {
  let html = '';

  // 네비게이션 (모바일 하단 네비와 동일)
  html += '<a href="/" class="sidebar-menu-item font-bold"><span>🏠</span><span>홈</span></a>';
  if (isPC) {
    html += `<a href="#" class="sidebar-menu-item" onclick="event.preventDefault();closeSidebar();switchView('viewFortune');showFortuneList()"><span>🔮</span><span>운세</span></a>`;
    html += `<a href="#" class="sidebar-menu-item" onclick="event.preventDefault();closeSidebar();switchView('viewFavorites');showFavorites()"><span>♥</span><span>MY 관심</span></a>`;
    html += `<a href="#" class="sidebar-menu-item" onclick="event.preventDefault();closeSidebar();window.openSearch()"><span>🔍</span><span>검색</span></a>`;
    html += `<a href="#" class="sidebar-menu-item" onclick="event.preventDefault();closeSidebar();switchView('viewProfile');showProfile()"><span>👤</span><span>프로필</span></a>`;
  }
  html += '<div class="sidebar-divider"></div>';

  // 서비스 리스트
  html += '<div class="sidebar-section-title">서비스</div>';
  SERVICES.forEach(s => {
    html += `<a href="${s.url}" class="sidebar-menu-item"><span>${s.emoji}</span><span>${s.fullName}</span></a>`;
  });

  html += '<div class="sidebar-divider"></div>';

  // 이벤트 / 공지사항 / 고객센터
  html += '<a href="#" class="sidebar-menu-item" onclick="event.preventDefault();showToast(\'준비 중입니다\')"><span>🎉</span><span>이벤트</span></a>';
  html += '<a href="#" class="sidebar-menu-item" onclick="event.preventDefault();showToast(\'준비 중입니다\')"><span>📢</span><span>공지사항</span></a>';
  html += '<a href="#" class="sidebar-menu-item" onclick="event.preventDefault();showToast(\'준비 중입니다\')"><span>💬</span><span>고객센터</span></a>';

  // 하단 푸터 링크
  html += '<div style="flex:1"></div>';
  html += '<div class="sidebar-divider" style="margin-top:16px"></div>';
  html += '<div style="padding:8px 12px;">';
  html += '<a href="/dunsmile/terms/" class="sidebar-footer-link">이용약관</a><span style="color:#d1d5db;margin:0 6px;">|</span>';
  html += '<a href="/dunsmile/about/" class="sidebar-footer-link">서비스 소개</a><span style="color:#d1d5db;margin:0 6px;">|</span>';
  html += '<a href="/dunsmile/privacy/" class="sidebar-footer-link">개인정보처리방침</a>';
  html += '<p style="margin-top:8px;font-size:11px;color:#d1d5db;">Dopamine Factory</p>';
  html += '</div>';

  return html;
}

function renderSidebar() {
  const el = document.getElementById('mobileSidebarNav');
  if (el) el.innerHTML = buildSidebarHTML(true);
}

// ===== 사이드바 토글 (모바일: 우측 슬라이드 / PC: 사이드바는 항상 보임이므로 토글 불필요) =====
function initSidebarToggle() {
  document.getElementById('sidebarToggleBtn').addEventListener('click', () => {
    // PC에서는 사이드바가 항상 보이므로, 모바일에서만 열기
    openSidebar();
  });
}

function openSidebar() {
  document.getElementById('mobileSidebarOverlay').classList.add('open');
  document.getElementById('mobileSidebar').classList.add('open');
}

window.closeSidebar = function() {
  document.getElementById('mobileSidebarOverlay').classList.remove('open');
  document.getElementById('mobileSidebar').classList.remove('open');
};

// ===== 서비스 카드 그리드 =====
function renderIconGrid() {
  const grid = document.getElementById('iconGrid');
  const favs = getFavorites();
  let html = '';

  SERVICES.forEach(s => {
    const isFav = favs.includes(s.id);
    html += `
      <a href="${s.url}" class="service-card" data-id="${s.id}">
        <span class="fav-btn ${isFav ? 'active' : ''}" onclick="event.preventDefault();event.stopPropagation();toggleFavorite('${s.id}')">
          ${isFav ? '❤️' : '🤍'}
        </span>
        <div class="service-card-icon" style="background:${s.bg}">${s.emoji}</div>
        <span class="service-card-name">${s.fullName}</span>
        <span class="service-card-desc">${s.desc}</span>
      </a>`;
  });

  for (let i = SERVICES.length; i < GRID_TOTAL; i++) {
    html += `
      <div class="service-card" style="opacity:0.5;cursor:default;" onclick="showToast('곧 새로운 서비스가 찾아옵니다!')">
        <div class="service-card-icon" style="background:#f3f4f6">🔒</div>
        <span class="service-card-name" style="color:#9ca3af">준비중</span>
        <span class="service-card-desc">곧 새로운 서비스가 찾아옵니다!</span>
      </div>`;
  }

  grid.innerHTML = html;
}

// ===== 인기 서비스 리스트 =====
function renderPopularList() {
  const list = document.getElementById('popularList');
  list.innerHTML = SERVICES.map(s => `
    <a href="${s.url}" class="popular-card flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style="background:${s.bg}">${s.emoji}</div>
      <div class="flex-1 min-w-0">
        <h3 class="font-bold text-gray-900 text-sm">${s.fullName}</h3>
        <p class="text-gray-500 text-xs mt-0.5 truncate">${s.desc}</p>
      </div>
      <span class="text-gray-300 text-lg shrink-0">&rsaquo;</span>
    </a>
  `).join('');
}

// ===== 배너 캐러셀 =====
function initCarousel() {
  const track = document.getElementById('carouselTrack');
  const slides = track.querySelectorAll('.carousel-slide');
  const dotsContainer = document.getElementById('carouselDots');
  let currentIndex = 0;
  let autoTimer = null;

  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = `inline-block w-2 h-2 rounded-full cursor-pointer ${i === 0 ? 'bg-purple-500' : 'bg-gray-300'}`;
    dot.onclick = () => goTo(i);
    dotsContainer.appendChild(dot);
  });

  function goTo(index) {
    currentIndex = index;
    const slide = slides[index];
    track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: 'smooth' });
    updateDots();
  }

  function updateDots() {
    dotsContainer.querySelectorAll('span').forEach((dot, i) => {
      dot.className = `inline-block w-2 h-2 rounded-full cursor-pointer ${i === currentIndex ? 'bg-purple-500' : 'bg-gray-300'}`;
    });
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      goTo(currentIndex);
    }, 4000);
  }

  function stopAuto() {
    if (autoTimer) clearInterval(autoTimer);
  }

  let scrollTimeout;
  track.addEventListener('scroll', () => {
    stopAuto();
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const scrollLeft = track.scrollLeft;
      let closest = 0;
      let minDist = Infinity;
      slides.forEach((slide, i) => {
        const dist = Math.abs(slide.offsetLeft - track.offsetLeft - scrollLeft);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      currentIndex = closest;
      updateDots();
      startAuto();
    }, 150);
  });

  document.getElementById('carouselPrev').onclick = () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    goTo(currentIndex);
  };
  document.getElementById('carouselNext').onclick = () => {
    currentIndex = (currentIndex + 1) % slides.length;
    goTo(currentIndex);
  };

  startAuto();
}

// ===== 검색 =====
function initSearch() {
  const overlay = document.getElementById('searchOverlay');
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');

  document.getElementById('searchCloseBtn').onclick = () => {
    overlay.classList.remove('open');
  };

  input.addEventListener('input', () => {
    renderSearchResults(input.value.trim());
  });

  function renderSearchResults(query) {
    const filtered = query
      ? SERVICES.filter(s =>
          s.name.includes(query) || s.fullName.includes(query) || s.desc.includes(query)
        )
      : SERVICES;

    if (filtered.length === 0) {
      results.innerHTML = '<p class="text-gray-400 text-sm text-center py-8">검색 결과가 없습니다</p>';
      return;
    }

    results.innerHTML = filtered.map(s => `
      <a href="${s.url}" class="flex items-center gap-3 py-3 border-b border-gray-50">
        <span class="text-xl">${s.emoji}</span>
        <div>
          <div class="text-sm font-bold text-gray-900">${s.fullName}</div>
          <div class="text-xs text-gray-500">${s.desc}</div>
        </div>
      </a>
    `).join('');
  }

  // 전역 함수: 검색 열기
  window.openSearch = function() {
    overlay.classList.add('open');
    input.value = '';
    input.focus();
    renderSearchResults('');
  };
}

// ===== 하단 네비바 =====
function initBottomNav() {
  const navItems = document.querySelectorAll('#bottomNav .nav-item');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const nav = item.dataset.nav;

      switch (nav) {
        case 'home':
          switchView('viewHome');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          break;
        case 'fortune':
          switchView('viewFortune');
          showFortuneList();
          break;
        case 'my':
          switchView('viewFavorites');
          showFavorites();
          break;
        case 'search':
          window.openSearch();
          return; // 검색은 오버레이이므로 탭 활성화 불필요
        case 'profile':
          switchView('viewProfile');
          showProfile();
          break;
      }

      // 활성 탭 업데이트
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

// ===== GAME 탭 =====
function initGameTab() {
  document.getElementById('tabGame').onclick = () => {
    showToast('Game 카테고리는 준비 중입니다!');
  };
}

// ===== 뷰 전환 =====
function switchView(viewId) {
  document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
  document.getElementById(viewId).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.switchView = switchView;

// ===== 운세 서비스 리스트 (하단탭 운세) =====
function showFortuneList() {
  const container = document.getElementById('fortuneList');
  container.innerHTML = FORTUNE_SERVICES.map(s => `
    <a href="${s.url}" class="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3 popular-card">
      <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style="background:${s.bg}">${s.emoji}</div>
      <div class="flex-1 min-w-0">
        <h3 class="font-bold text-gray-900 text-sm">${s.fullName}</h3>
        <p class="text-gray-500 text-xs mt-0.5 truncate">${s.desc}</p>
      </div>
      <span class="text-gray-300 text-lg shrink-0">&rsaquo;</span>
    </a>
  `).join('');

  if (FORTUNE_SERVICES.length === 0) {
    container.innerHTML = '<p class="text-gray-400 text-sm text-center py-12">운세 서비스가 준비 중입니다</p>';
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
  renderIconGrid();
}
window.toggleFavorite = toggleFavorite;

function showFavorites() {
  const favs = getFavorites();
  const container = document.getElementById('favList');

  if (favs.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12">
        <div class="text-4xl mb-3">💜</div>
        <p class="text-gray-400 text-sm">관심 서비스를 등록해보세요!</p>
        <p class="text-gray-300 text-xs mt-1">아이콘 위의 하트를 눌러 등록할 수 있어요</p>
      </div>`;
    return;
  }

  const favServices = SERVICES.filter(s => favs.includes(s.id));
  container.innerHTML = favServices.map(s => `
    <a href="${s.url}" class="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3">
      <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style="background:${s.bg}">${s.emoji}</div>
      <div class="flex-1 min-w-0">
        <h3 class="font-bold text-gray-900 text-sm">${s.fullName}</h3>
        <p class="text-gray-500 text-xs mt-0.5 truncate">${s.desc}</p>
      </div>
      <button onclick="event.preventDefault();toggleFavorite('${s.id}');showFavorites();" class="text-red-400 text-lg shrink-0">❤️</button>
    </a>
  `).join('');
}
window.showFavorites = showFavorites;

// ===== 프로필 =====
function showProfile() {
  const container = document.getElementById('profileContent');
  let html = '';

  const userName = localStorage.getItem('user_name') || localStorage.getItem('userName');
  const userBirth = localStorage.getItem('user_birth') || localStorage.getItem('userBirth');
  const fortuneData = localStorage.getItem('daily_fortune_user') || localStorage.getItem('dailyFortuneUser');

  html += '<div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">';
  html += '<h3 class="font-bold text-gray-900 text-sm mb-3">기본 정보</h3>';

  if (userName || userBirth || fortuneData) {
    if (userName) html += `<p class="text-sm text-gray-600 mb-1">이름: ${userName}</p>`;
    if (userBirth) html += `<p class="text-sm text-gray-600 mb-1">생년월일: ${userBirth}</p>`;
    if (fortuneData) {
      try {
        const fd = JSON.parse(fortuneData);
        if (fd.name) html += `<p class="text-sm text-gray-600 mb-1">이름: ${fd.name}</p>`;
        if (fd.birthDate) html += `<p class="text-sm text-gray-600 mb-1">생년월일: ${fd.birthDate}</p>`;
        if (fd.zodiac) html += `<p class="text-sm text-gray-600 mb-1">별자리: ${fd.zodiac}</p>`;
      } catch {}
    }
  } else {
    html += '<p class="text-sm text-gray-400">저장된 정보가 없습니다</p>';
  }
  html += '</div>';

  html += '<div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">';
  html += '<h3 class="font-bold text-gray-900 text-sm mb-3">서비스 이용 기록</h3>';

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

  if (records.length > 0) {
    html += records.map(r => `<p class="text-sm text-gray-600 mb-1">${r}</p>`).join('');
  } else {
    html += '<p class="text-sm text-gray-400">아직 이용 기록이 없습니다</p>';
  }
  html += '</div>';

  container.innerHTML = html;
}
window.showProfile = showProfile;

// ===== 토스트 =====
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}
window.showToast = showToast;
