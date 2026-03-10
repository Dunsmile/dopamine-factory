/* 도파민 공작소 홈 - 사이드바 */

function buildSidebarHTML(isPC) {
  const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
  const menuItem = (icon, label, attrs = '') =>
    `<a ${attrs} class="sidebar-menu-item"><span class="sidebar-item-icon">${icon}</span><span class="sidebar-item-label">${label}</span></a>`;
  let html = menuItem('🏠', '홈', 'href="/"');

  if (isPC) {
    html += menuItem('🔮', '운세', 'href="#" data-action="sidebar-view" data-view="viewFortune"');
    html += menuItem('♥', 'MY 관심', 'href="#" data-action="sidebar-view" data-view="viewFavorites"');
    html += menuItem('🔍', '검색', 'href="#" data-action="open-search-close-sidebar"');
    html += menuItem('👤', '프로필', 'href="#" data-action="sidebar-view" data-view="viewProfile"');
  }
  html += '<div class="sidebar-divider"></div><div class="sidebar-section-title">서비스</div>';

  SERVICES.forEach((service) => {
    html += menuItem(
      service.emoji,
      service.fullName,
      `href="${buildPlayQueryHref(service.id)}" data-action="open-service-intro" data-service-id="${service.id}"`,
    );
  });

  html += '<div class="sidebar-divider"></div>';
  html += menuItem('🎉', '이벤트', 'href="#" data-action="show-toast" data-message="준비 중입니다"');
  html += menuItem('📢', '공지사항', 'href="#" data-action="show-toast" data-message="준비 중입니다"');
  html += menuItem('💬', '고객센터', 'href="#" data-action="show-toast" data-message="준비 중입니다"');
  html += '<div class="sidebar-divider"></div><div class="sidebar-theme-wrap"><p class="sidebar-theme-title">화면 모드</p><div class="sidebar-theme-actions">';
  html += `<button type="button" class="sidebar-theme-btn ${currentTheme === 'dark' ? 'active' : ''}" data-action="set-theme" data-theme="dark">다크</button>`;
  html += `<button type="button" class="sidebar-theme-btn ${currentTheme === 'light' ? 'active' : ''}" data-action="set-theme" data-theme="light">화이트</button>`;
  html += '</div></div><div class="sidebar-spacer"></div><div class="sidebar-divider sidebar-divider-top"></div><div class="sidebar-footer-links">';
  html += '<a href="/dunsmile/terms/" class="sidebar-footer-link">이용약관</a><span class="sidebar-footer-sep">|</span>';
  html += '<a href="/dunsmile/about/" class="sidebar-footer-link">서비스 소개</a><span class="sidebar-footer-sep">|</span>';
  html += '<a href="/dunsmile/privacy/" class="sidebar-footer-link">개인정보처리방침</a>';
  html += '<p class="sidebar-footer-meta">Dopamine Factory</p></div>';
  return html;
}

function renderSidebar() {
  const nav = document.getElementById('mobileSidebarNav');
  if (!nav) return;
  nav.innerHTML = buildSidebarHTML(true);
  updateSidebarThemeState(document.body.classList.contains('light-theme') ? 'light' : 'dark');
}

function initSidebarToggle() {
  const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
  if (!sidebarToggleBtn) return;
  sidebarToggleBtn.addEventListener('click', openSidebar);
}

function openSidebar() {
  const overlay = document.getElementById('mobileSidebarOverlay');
  const sidebar = document.getElementById('mobileSidebar');
  if (!overlay || !sidebar) return;
  overlay.classList.add('open');
  sidebar.classList.add('open');
}

window.closeSidebar = function closeSidebar() {
  const overlay = document.getElementById('mobileSidebarOverlay');
  const sidebar = document.getElementById('mobileSidebar');
  if (!overlay || !sidebar) return;
  overlay.classList.remove('open');
  sidebar.classList.remove('open');
};
