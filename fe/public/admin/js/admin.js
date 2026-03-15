/* ── 도파민 공작소 어드민 메인 JS ── */

(function initAdmin() {
  const SESSION_KEY  = 'dp_admin_token';
  const MANIFEST_URL = '/dunsmile/services.manifest.json';
  const SETTINGS_URL = '/dunsmile/site-settings.json';
  const LS_SERVICES  = 'dp_admin_services';
  const LS_SETTINGS  = 'dp_admin_settings';
  const LS_DIRTY     = 'dp_admin_dirty';

  // ── Firebase 초기화 ──
  const FIREBASE_CONFIG = {
    apiKey:            'AIzaSyDw9j_3Di_Zn1kI_5KyQbGUV5o3I2APwkI',
    authDomain:        'hoxy-number.firebaseapp.com',
    projectId:         'hoxy-number',
    storageBucket:     'hoxy-number.firebasestorage.app',
    messagingSenderId: '311606639114',
    appId:             '1:311606639114:web:ea5d008da413abb9d33df3',
  };
  if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
  const db = firebase.firestore();

  // 미인증 시 홈으로 리다이렉트
  if (!sessionStorage.getItem(SESSION_KEY)) {
    window.location.href = '/';
    return;
  }

  // ── 전역 상태 ──
  let allServices     = [];
  let siteSettings    = {};
  let allServiceStats = {}; // { serviceId: { totalClicks, totalViews, daily: { "2025-03-11": N }, ... } }

  // ── DOM refs ──
  const contentEl = document.getElementById('adm-content');
  const pageTitleEl = document.getElementById('adm-page-title');
  const navItems = document.querySelectorAll('.adm-nav-item[data-page]');

  // ── 페이지 라우팅 ──
  const PAGES = {
    dashboard:  { title: '대시보드',      render: renderDashboard },
    services:   { title: '서비스 관리',   render: renderServices },
    categories: { title: '카테고리 & 탭', render: renderCategories },
    home:       { title: '홈 관리',       render: renderHomeManagement },
    builder:    { title: '서비스 만들기', render: renderBuilder },
    settings:   { title: '사이트 설정',   render: renderSettings },
  };

  function navigate(page, params = {}) {
    if (!PAGES[page]) return;
    if (pageTitleEl) pageTitleEl.textContent = PAGES[page].title;
    navItems.forEach((item) => item.classList.toggle('is-active', item.dataset.page === page));
    if (contentEl) {
      contentEl.innerHTML = '<div class="adm-empty"><div class="adm-spinner"></div></div>';
      PAGES[page].render(params);
    }
    history.replaceState({ page, params }, '', `/admin/?page=${page}`);
  }

  navItems.forEach((item) => item.addEventListener('click', () => navigate(item.dataset.page)));

  // 로그아웃
  const logoutBtn = document.getElementById('adm-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem(SESSION_KEY);
      window.location.href = '/';
    });
  }

  // ── Firestore 저장 ──
  async function persistData() {
    try {
      const ts = firebase.firestore.FieldValue.serverTimestamp();
      await Promise.all([
        db.collection('siteConfig').doc('services').set({
          services:  allServices,
          updatedAt: ts,
        }),
        db.collection('siteConfig').doc('settings').set({
          ...siteSettings,
          updatedAt: ts,
        }),
      ]);
      return true;
    } catch (e) {
      console.error('Firestore save error:', e);
      showToast('저장 실패. 네트워크 또는 Firestore 권한을 확인해 주세요.');
      return false;
    }
  }

  // ── 데이터 로드 (Firestore 우선, 정적 JSON fallback) ──
  async function loadData() {
    // 1) Firestore에서 로드 시도
    try {
      const [svcsSnap, stgsSnap] = await Promise.all([
        db.collection('siteConfig').doc('services').get(),
        db.collection('siteConfig').doc('settings').get(),
      ]);
      if (svcsSnap.exists) {
        const data = svcsSnap.data();
        allServices = Array.isArray(data.services) ? data.services : [];
      }
      if (stgsSnap.exists) {
        const { updatedAt, ...rest } = stgsSnap.data();
        siteSettings = rest;
      }
      if (allServices.length > 0) return; // Firestore 데이터 있으면 완료
    } catch (e) {
      console.warn('Firestore 로드 실패, 정적 JSON으로 대체:', e);
    }

    // 2) 정적 JSON fallback
    try {
      const [mRes, sRes] = await Promise.all([
        fetch(MANIFEST_URL, { cache: 'no-store' }),
        fetch(SETTINGS_URL, { cache: 'no-store' }),
      ]);
      const manifest = mRes.ok ? await mRes.json() : {};
      const settings = sRes.ok ? await sRes.json() : {};
      allServices  = Array.isArray(manifest.services) ? manifest.services : [];
      siteSettings = settings;
    } catch (e) {
      console.error('Admin data load error:', e);
    }
  }

  // ── 서비스 트래픽 통계 로드 ──
  async function loadServiceStats() {
    try {
      const snap = await db.collection('serviceStats').get();
      allServiceStats = {};
      snap.forEach((doc) => { allServiceStats[doc.id] = doc.data(); });
    } catch (e) { /* ignore */ }
  }

  // 최근 7일 가중 클릭 합산 (오늘=7배, 6일전=1배)
  function calcWeeklyScore(stats) {
    if (!stats) return 0;
    const today = new Date();
    let weighted = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      weighted += ((stats.daily && stats.daily[key]) || 0) * (7 - i);
    }
    return weighted;
  }

  // trendingScore를 실제 트래픽 기반으로 자동 계산 (로그 스케일)
  // 클릭 없는 서비스는 기존 점수 유지
  function applyAutoTrending() {
    let changed = false;
    allServices.forEach((svc) => {
      const raw = calcWeeklyScore(allServiceStats[svc.id]);
      if (raw > 0) {
        const score = Math.min(100, Math.round(Math.log1p(raw) * 20));
        if (svc.trendingScore !== score) {
          svc.trendingScore = score;
          changed = true;
        }
      }
    });
    return changed;
  }

  // 강제 재로드
  window.__admReloadFromServer = async function() {
    allServices     = [];
    siteSettings    = {};
    allServiceStats = {};
    await loadData();
    await loadServiceStats();
    if (applyAutoTrending()) await persistData();
    showToast('Firestore에서 재로드 완료.');
    navigate('dashboard');
  };

  // ── 서비스별 Firestore config 저장/로드 ──
  async function saveServiceConfig(key, data) {
    try {
      await db.collection('siteConfig').doc(key).set({
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      showToast('✓ 저장 완료 — 즉시 반영됩니다.');
      return true;
    } catch (e) {
      console.error('Firestore save error:', e);
      showToast('저장 실패. 네트워크를 확인해 주세요.');
      return false;
    }
  }

  async function loadServiceConfig(key) {
    try {
      const snap = await db.collection('siteConfig').doc(key).get();
      if (snap.exists) {
        const { updatedAt, ...rest } = snap.data();
        return rest;
      }
    } catch (e) { /* ignore */ }
    return null;
  }

  // ════════════════════════════════════════
  // 대시보드
  // ════════════════════════════════════════
  function renderDashboard() {
    const total  = allServices.filter((s) => s.status !== 'trashed').length;
    const active = allServices.filter((s) => s.status !== 'disabled' && s.status !== 'trashed').length;
    const todayKey = new Date().toISOString().slice(0, 10);

    // 트래픽 집계
    let todayClicks = 0, totalClicks = 0, totalViews = 0;
    Object.values(allServiceStats).forEach((s) => {
      todayClicks += (s.daily && s.daily[todayKey]) || 0;
      totalClicks += s.totalClicks || 0;
      totalViews  += s.totalViews  || 0;
    });

    // 트렌딩 Top 3
    const topServices = [...allServices]
      .filter((s) => s.status !== 'trashed' && (allServiceStats[s.id]?.totalClicks || 0) > 0)
      .sort((a, b) => calcWeeklyScore(allServiceStats[b.id]) - calcWeeklyScore(allServiceStats[a.id]))
      .slice(0, 3);

    contentEl.innerHTML = `
      <div class="adm-stats-grid">
        ${statCard('전체 서비스', total, '등록된 서비스 수')}
        ${statCard('활성 서비스', active, '홈에 노출 중')}
        ${statCard('오늘 클릭', todayClicks || '-', '홈 서비스 클릭')}
        ${statCard('누적 클릭', totalClicks > 9999 ? (totalClicks/10000).toFixed(1)+'만' : totalClicks || '-', '전체 서비스 합산')}
      </div>

      ${topServices.length > 0 ? `
      <div class="adm-panel" style="margin-bottom:20px;">
        <div class="adm-panel__header">
          <h2 class="adm-panel__title">🔥 이번 주 트렌딩</h2>
          <span style="font-size:12px;color:var(--adm-text-muted);">최근 7일 클릭 기반 자동 집계</span>
        </div>
        <div style="padding:0;">
          <table class="adm-table">
            <thead><tr><th>순위</th><th>서비스</th><th>7일 클릭(가중)</th><th>오늘</th><th>누적</th><th>트렌딩</th></tr></thead>
            <tbody>
              ${topServices.map((s, i) => {
                const st = allServiceStats[s.id] || {};
                const weekly = calcWeeklyScore(st);
                const today_ = (st.daily && st.daily[todayKey]) || 0;
                const medals = ['🥇','🥈','🥉'];
                return `<tr>
                  <td style="font-size:18px;">${medals[i]||i+1}</td>
                  <td><span style="margin-right:6px;">${escHtml(s.emoji||'')}</span><strong>${escHtml(s.name)}</strong></td>
                  <td><strong>${weekly}</strong></td>
                  <td>${today_}</td>
                  <td>${st.totalClicks || 0}</td>
                  <td><span class="adm-badge adm-badge--active">${s.trendingScore || 0}점</span></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>` : ''}

      <div class="adm-panel">
        <div class="adm-panel__header">
          <h2 class="adm-panel__title">서비스 현황</h2>
          <button class="adm-btn adm-btn--primary" onclick="window.__admNavigate('services')">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            전체 관리
          </button>
        </div>
        <div style="padding:0;">
          <table class="adm-table">
            <thead><tr><th>서비스명</th><th>카테고리</th><th>상태</th><th>트렌딩</th><th></th></tr></thead>
            <tbody>
              ${allServices.filter((s) => s.status !== 'trashed').map((s) => `
                <tr>
                  <td><span style="font-size:16px;margin-right:6px;">${escHtml(s.emoji||'')}</span><strong>${escHtml(s.name||s.id)}</strong></td>
                  <td><span class="adm-badge adm-badge--hot">${escHtml(s.category||'-')}</span></td>
                  <td><span class="adm-badge adm-badge--${s.status==='disabled'?'inactive':'active'}">${s.status==='disabled'?'비활성':'활성'}</span></td>
                  <td>${s.trendingScore||'-'}</td>
                  <td><button class="adm-btn adm-btn--ghost" style="padding:4px 10px;font-size:12px;" onclick="window.__admOpenDetail('${escHtml(s.id)}')">편집</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function statCard(label, value, sub) {
    return `<div class="adm-stat-card">
      <div class="adm-stat-card__label">${label}</div>
      <div class="adm-stat-card__value">${value}</div>
      <div class="adm-stat-card__sub">${sub}</div>
    </div>`;
  }

  // ════════════════════════════════════════
  // 서비스 관리 목록
  // ════════════════════════════════════════
  function renderServices(initialTab) {
    const activeList  = allServices.filter((s) => s.status !== 'trashed');
    const trashedList = allServices.filter((s) => s.status === 'trashed');

    contentEl.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
        <div class="adm-tabs" id="svc-main-tabs" style="margin-bottom:0;">
          <button class="adm-tab is-active" data-svc-tab="active">서비스 목록 (${activeList.length}개)</button>
          <button class="adm-tab" data-svc-tab="trash">🗑 휴지통 (${trashedList.length}개)</button>
        </div>
        <button class="adm-btn adm-btn--primary" onclick="window.__admNavigate('builder')">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          새 서비스 만들기
        </button>
      </div>
      <div id="svc-tab-body"></div>
    `;

    const tabBtns = contentEl.querySelectorAll('.adm-tab[data-svc-tab]');
    const bodyEl  = document.getElementById('svc-tab-body');

    function activateSvcTab(tabId) {
      tabBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.svcTab === tabId));
      bodyEl.innerHTML = tabId === 'trash'
        ? renderTrashList(trashedList)
        : renderActiveList(activeList);
      bindSvcToggleListeners();
    }

    tabBtns.forEach((btn) => btn.addEventListener('click', () => activateSvcTab(btn.dataset.svcTab)));
    activateSvcTab(initialTab || 'active');
  }

  function renderActiveList(services) {
    return `
      <div class="adm-panel">
        <div style="padding:0;">
          <table class="adm-table">
            <thead>
              <tr><th style="width:32px;"></th><th>서비스명</th><th>카테고리</th><th>홈 노출</th><th>트렌딩</th><th>액션</th></tr>
            </thead>
            <tbody>
              ${services.map((s, i) => `
                <tr>
                  <td style="color:var(--adm-text-muted);font-size:12px;">${i+1}</td>
                  <td>
                    <div style="display:flex;align-items:center;gap:10px;">
                      <div style="background:var(--adm-surface-2);border-radius:8px;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">
                        ${escHtml(s.emoji||'✨')}
                      </div>
                      <div>
                        <div style="font-weight:600;font-size:13px;">${escHtml(s.name||s.id)}</div>
                        <div style="font-size:11px;color:var(--adm-text-muted);">${escHtml(s.id)}</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="adm-badge adm-badge--hot">${escHtml(s.category||'-')}</span></td>
                  <td>
                    <label class="adm-toggle">
                      <input type="checkbox" class="svc-toggle" data-id="${escHtml(s.id)}" ${s.homeVisible!==false&&s.status!=='disabled'?'checked':''}>
                      <span class="adm-toggle__track"></span>
                    </label>
                  </td>
                  <td>${s.trendingScore||'-'}</td>
                  <td>
                    <div style="display:flex;gap:6px;">
                      ${s.builderMade ? `
                        <button class="adm-btn adm-btn--primary" style="padding:5px 12px;font-size:12px;" onclick="window.__bldEditService('${escHtml(s.id)}')">
                          ✏️ 편집
                        </button>
                      ` : `
                        <button class="adm-btn adm-btn--primary" style="padding:5px 12px;font-size:12px;" onclick="window.__admOpenDetail('${escHtml(s.id)}')">
                          상세 관리 →
                        </button>
                      `}
                      <button class="adm-btn adm-btn--ghost" style="padding:5px 10px;font-size:13px;color:var(--adm-danger);border-color:var(--adm-danger-border);" title="휴지통으로 이동" onclick="window.__admTrashService('${escHtml(s.id)}')">
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderTrashList(services) {
    if (services.length === 0) {
      return `
        <div class="adm-empty" style="padding:60px 20px;">
          <div style="font-size:48px;margin-bottom:12px;">🗑</div>
          <div style="font-size:15px;font-weight:600;margin-bottom:6px;">휴지통이 비어 있습니다</div>
          <div style="font-size:13px;color:var(--adm-text-muted);">삭제된 서비스가 여기에 표시됩니다</div>
        </div>
      `;
    }
    return `
      <div class="adm-panel">
        <div class="adm-panel__header">
          <h2 class="adm-panel__title">휴지통 (${services.length}개)</h2>
          <span style="font-size:12px;color:var(--adm-text-muted);">휴지통의 서비스는 사이트에 표시되지 않습니다</span>
        </div>
        <div style="padding:0;">
          <table class="adm-table">
            <thead>
              <tr><th>서비스명</th><th>카테고리</th><th>서비스 경로</th><th>액션</th></tr>
            </thead>
            <tbody>
              ${services.map((s) => `
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:10px;opacity:0.6;">
                      <div style="background:var(--adm-surface-2);border-radius:8px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">
                        ${escHtml(s.emoji||'✨')}
                      </div>
                      <div>
                        <div style="font-weight:600;font-size:13px;text-decoration:line-through;">${escHtml(s.name||s.id)}</div>
                        <div style="font-size:11px;color:var(--adm-text-muted);">${escHtml(s.id)}</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="adm-badge adm-badge--inactive">${escHtml(s.category||'-')}</span></td>
                  <td><code style="font-size:11px;color:var(--adm-text-muted);">fe/public/dunsmile/${escHtml(s.id)}/</code></td>
                  <td>
                    <div style="display:flex;gap:6px;">
                      <button class="adm-btn adm-btn--ghost" style="padding:5px 12px;font-size:12px;" onclick="window.__admRestoreService('${escHtml(s.id)}')">
                        ↩ 복원
                      </button>
                      <button class="adm-btn adm-btn--ghost" style="padding:5px 12px;font-size:12px;color:var(--adm-danger);border-color:var(--adm-danger-border);" onclick="window.__admDeleteService('${escHtml(s.id)}')">
                        최종 삭제
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div style="padding:14px 20px;border-top:1px solid var(--adm-border);display:flex;align-items:center;gap:8px;font-size:12px;color:var(--adm-text-muted);">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:14px;height:14px;flex-shrink:0;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          최종 삭제 시 Firestore에서 서비스 데이터가 제거됩니다. 페이지 파일 삭제 명령어는 클립보드에 복사됩니다.
        </div>
      </div>
    `;
  }

  function bindSvcToggleListeners() {
    contentEl.querySelectorAll('.svc-toggle').forEach((toggle) => {
      toggle.addEventListener('change', async (e) => {
        const svc = allServices.find((s) => s.id === e.target.dataset.id);
        if (svc) {
          svc.homeVisible = e.target.checked;
          svc.status = e.target.checked ? 'active' : 'disabled';
          const ok = await persistData();
          if (ok) showToast(`✓ ${svc.name} ${e.target.checked ? '활성화' : '비활성화'} — 즉시 반영됩니다.`);
        }
      });
    });
  }

  // ── 휴지통으로 이동 ──
  window.__admTrashService = async function(id) {
    const svc = allServices.find((s) => s.id === id);
    if (!svc) return;
    if (!confirm(`"${svc.name}" 을(를) 휴지통으로 이동할까요?\n홈에서 즉시 숨겨집니다.`)) return;
    svc.status = 'trashed';
    svc.homeVisible = false;
    const ok = await persistData();
    if (ok) showToast(`🗑 "${svc.name}" 을 휴지통으로 이동했습니다.`);
    renderServices('active');
  };

  // ── 휴지통에서 복원 ──
  window.__admRestoreService = async function(id) {
    const svc = allServices.find((s) => s.id === id);
    if (!svc) return;
    svc.status = 'active';
    svc.homeVisible = true;
    const ok = await persistData();
    if (ok) showToast(`✓ "${svc.name}" 복원 완료 — 홈에 다시 표시됩니다.`);
    renderServices('trash');
  };

  // ── 최종 삭제 ──
  window.__admDeleteService = async function(id) {
    const svc = allServices.find((s) => s.id === id);
    if (!svc) return;
    const serviceDir = `fe/public/dunsmile/${id}/`;
    const deleteCmd  = `rm -rf ${serviceDir}`;
    if (!confirm(`"${svc.name}" 을(를) 완전히 삭제합니다.\n\n⚠️ 이 작업은 되돌릴 수 없습니다.\nFirestore에서 서비스 데이터가 영구 삭제됩니다.\n\n계속할까요?`)) return;
    allServices = allServices.filter((s) => s.id !== id);
    const ok = await persistData();
    if (ok) {
      navigator.clipboard.writeText(deleteCmd).catch(() => {});
      showToast(`🗑 "${svc.name}" 삭제 완료.\n\n페이지 파일 삭제 명령어:\n${deleteCmd}\n(클립보드에 복사됐습니다)`);
    }
    renderServices('trash');
  };

  // ════════════════════════════════════════
  // 서비스 상세 관리 (탭 구조)
  // ════════════════════════════════════════
  window.__admOpenDetail = function(id) {
    const svc = allServices.find((s) => s.id === id);
    if (!svc) return;
    if (pageTitleEl) pageTitleEl.textContent = `${svc.emoji||''} ${svc.name} 관리`;
    navItems.forEach((item) => item.classList.toggle('is-active', item.dataset.page === 'services'));
    renderServiceDetail(svc);
    history.replaceState({}, '', `/admin/?page=services&id=${id}`);
  };

  function renderServiceDetail(svc) {
    const tabs = getServiceTabs(svc);
    contentEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
        <button class="adm-btn adm-btn--ghost" onclick="window.__admNavigate('services')" style="padding:6px 10px;">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:14px;height:14px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          목록으로
        </button>
        <span style="font-size:22px;">${escHtml(svc.emoji||'')}</span>
        <h2 style="margin:0;font-size:18px;font-weight:800;">${escHtml(svc.fullName||svc.name)}</h2>
        <span class="adm-badge adm-badge--${svc.status==='disabled'?'inactive':'active'}">${svc.status==='disabled'?'비활성':'활성'}</span>
        <button class="adm-btn adm-btn--ghost" style="margin-left:auto;padding:5px 12px;font-size:12px;color:var(--adm-danger);border-color:var(--adm-danger-border);" onclick="window.__admTrashService('${escHtml(svc.id)}')">
          🗑 휴지통으로
        </button>
      </div>

      <!-- 탭 네비 -->
      <div class="adm-tabs" id="svc-detail-tabs">
        ${tabs.map((t,i) => `
          <button class="adm-tab${i===0?' is-active':''}" data-tab="${t.id}">${t.label}</button>
        `).join('')}
      </div>

      <!-- 탭 콘텐츠 -->
      <div id="svc-detail-body" style="margin-top:16px;"></div>
    `;

    // 탭 이벤트
    const tabBtns = contentEl.querySelectorAll('.adm-tab');
    const bodyEl = document.getElementById('svc-detail-body');

    function activateTab(tabId) {
      tabBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.tab === tabId));
      const tab = tabs.find((t) => t.id === tabId);
      if (tab) bodyEl.innerHTML = tab.render();
      if (tab && tab.afterRender) tab.afterRender();
    }

    tabBtns.forEach((btn) => btn.addEventListener('click', () => activateTab(btn.dataset.tab)));
    activateTab(tabs[0].id);
  }

  // 서비스별 탭 정의
  function getServiceTabs(svc) {
    const common = [
      { id: 'info',      label: '기본 정보',  render: () => tabBasicInfo(svc) },
      { id: 'stats',     label: '📊 트래픽',  render: () => tabTrafficStats(svc) },
      { id: 'thumbnail', label: '홈 썸네일',  render: () => tabThumbnail(svc) },
      { id: 'preview',   label: '미리보기',   render: () => tabPreview(svc) },
    ];

    // 서비스별 콘텐츠 탭 삽입
    const contentTab = getContentTab(svc);
    if (contentTab) {
      common.splice(2, 0, contentTab); // 썸네일 탭 다음에 삽입
    }

    return common;
  }

  function getContentTab(svc) {
    const map = {
      'tarot-reading':     { id: 'content', label: '🃏 카드 이미지', render: () => tabTarotImages(svc) },
      'rich-face':         { id: 'content', label: '👤 관상 이미지', render: () => tabRichFaceImages(svc), afterRender: initRichFaceEditor },
      'balance-game':      { id: 'content', label: '⚖️ 문항 관리',  render: () => tabBalanceQuestions(svc), afterRender: initBalanceEditor },
      'daily-fortune':     { id: 'content', label: '🔮 운세 텍스트', render: () => tabFortuneContent(svc), afterRender: initFortuneEditor },
      'wealth-dna-test':   { id: 'content', label: '💰 MBTI 문항',  render: () => tabWealthDNA(svc), afterRender: initWealthDNAEditor },
      'name-compatibility':{ id: 'content', label: '💞 결과 메시지', render: () => tabNameCompat(svc), afterRender: initNameCompatEditor },
      'hoxy-number':       { id: 'content', label: '🎱 번호 설정',  render: () => tabHoxyNumber(svc), afterRender: initHoxyNumberEditor },
      'market-sentiment':  { id: 'content', label: '📈 데이터 설정', render: () => tabMarketSentiment(svc) },
    };
    return map[svc.id] || null;
  }

  // ── 탭: 기본 정보 ──
  function tabBasicInfo(svc) {
    return `
      <div class="adm-panel">
        <div class="adm-panel__header"><h2 class="adm-panel__title">기본 정보</h2></div>
        <div class="adm-panel__body" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          ${field('서비스명 (단축)', `<input class="adm-input" id="fi-name" value="${escHtml(svc.name||'')}">`)}
          ${field('이모지', `<input class="adm-input" id="fi-emoji" value="${escHtml(svc.emoji||'')}" style="font-size:20px;">`)}
          ${field('풀네임 (서비스 헤더)', `<input class="adm-input" id="fi-fullname" value="${escHtml(svc.fullName||'')}">`)}
          ${field('카테고리', `<select class="adm-input adm-select" id="fi-category">
            ${['fortune','fun','luck','finance','experimental'].map((c)=>`<option value="${c}" ${svc.category===c?'selected':''}>${c}</option>`).join('')}
          </select>`)}
          ${field('상태', `<select class="adm-input adm-select" id="fi-status">
            <option value="active" ${svc.status!=='disabled'?'selected':''}>활성</option>
            <option value="disabled" ${svc.status==='disabled'?'selected':''}>비활성</option>
          </select>`)}
          <div>
            <label style="font-size:12px;color:var(--adm-text-muted);display:block;margin-bottom:6px;">트렌딩 점수</label>
            <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--adm-surface-2);border-radius:8px;border:1px solid var(--adm-border);">
              <span style="font-size:22px;font-weight:800;color:var(--adm-accent);">${svc.trendingScore || 0}</span>
              <span style="font-size:12px;color:var(--adm-text-muted);">자동계산 — 📊 트래픽 탭에서 상세 확인</span>
            </div>
          </div>
          ${field('예상 소요 시간 (분)', `<input class="adm-input" id="fi-duration" type="number" min="1" value="${svc.estimatedDuration||3}">`)}
          ${field('문항 수', `<input class="adm-input" id="fi-qcount" type="number" min="0" value="${svc.questionCount||0}">`)}
          <div style="grid-column:1/-1;">
            ${field('태그 (쉼표 구분)', `<input class="adm-input" id="fi-tags" value="${escHtml((svc.tags||[]).join(', '))}">`)}
          </div>
          <div style="grid-column:1/-1;">
            ${field('서비스 설명 (홈 카드·히어로)', `<textarea class="adm-input adm-textarea" id="fi-desc">${escHtml(svc.desc||'')}</textarea>`)}
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;padding:0 20px 20px;">
          <button class="adm-btn adm-btn--primary" onclick="window.__admSaveBasicInfo('${escHtml(svc.id)}')">저장</button>
        </div>
      </div>
    `;
  }

  window.__admSaveBasicInfo = async function(id) {
    const svc = allServices.find((s) => s.id === id);
    if (!svc) return;
    svc.name           = v('fi-name');
    svc.emoji          = v('fi-emoji');
    svc.fullName       = v('fi-fullname');
    svc.category       = v('fi-category');
    svc.status            = v('fi-status');
    svc.estimatedDuration = parseInt(v('fi-duration'), 10) || 3;
    svc.questionCount  = parseInt(v('fi-qcount'), 10) || 0;
    svc.desc           = v('fi-desc');
    svc.tags           = v('fi-tags').split(',').map((t) => t.trim()).filter(Boolean);
    const ok = await persistData();
    if (ok) showToast('✓ 저장 완료 — 홈에 즉시 반영됩니다.');
    renderServiceDetail(svc);
  };

  // ── 탭: 트래픽 통계 ──
  function tabTrafficStats(svc) {
    const stats    = allServiceStats[svc.id] || {};
    const today    = new Date().toISOString().slice(0, 10);
    const todayClicks = (stats.daily && stats.daily[today]) || 0;
    const todayViews  = (stats.dailyViews && stats.dailyViews[today]) || 0;
    const weekly   = calcWeeklyScore(stats);
    const autoScore = weekly > 0 ? Math.min(100, Math.round(Math.log1p(weekly) * 20)) : (svc.trendingScore || 0);

    // 최근 14일 일별 클릭 바 차트
    const days = [];
    let maxDay = 1;
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const clicks = (stats.daily && stats.daily[key]) || 0;
      const views  = (stats.dailyViews && stats.dailyViews[key]) || 0;
      if (clicks > maxDay) maxDay = clicks;
      if (views  > maxDay) maxDay = views;
      days.push({ key, label: key.slice(5), clicks, views });
    }

    return `
      <div style="display:grid;gap:16px;">

        <!-- 요약 카드 -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
          ${[
            ['오늘 클릭', todayClicks, '홈 링크 클릭'],
            ['오늘 뷰', todayViews, '서비스 페이지 방문'],
            ['7일 가중클릭', weekly, '최근 7일 (최신일 7배)'],
            ['트렌딩 점수', autoScore, '자동 계산값'],
          ].map(([label, val, sub]) => `
            <div style="background:var(--adm-surface-2);border-radius:12px;padding:16px;text-align:center;border:1px solid var(--adm-border);">
              <div style="font-size:11px;color:var(--adm-text-muted);margin-bottom:4px;">${label}</div>
              <div style="font-size:28px;font-weight:800;color:var(--adm-accent);">${val}</div>
              <div style="font-size:11px;color:var(--adm-text-muted);margin-top:4px;">${sub}</div>
            </div>
          `).join('')}
        </div>

        <!-- 14일 바 차트 -->
        <div class="adm-panel">
          <div class="adm-panel__header">
            <h2 class="adm-panel__title">최근 14일 일별 트래픽</h2>
            <div style="display:flex;gap:12px;font-size:11px;color:var(--adm-text-muted);align-items:center;">
              <span><span style="display:inline-block;width:10px;height:10px;background:var(--adm-accent);border-radius:2px;margin-right:4px;"></span>클릭</span>
              <span><span style="display:inline-block;width:10px;height:10px;background:var(--adm-accent-soft);border-radius:2px;margin-right:4px;"></span>뷰</span>
            </div>
          </div>
          <div class="adm-panel__body" style="padding-bottom:8px;">
            <div style="display:flex;align-items:flex-end;gap:4px;height:100px;padding:0 4px;">
              ${days.map((d) => `
                <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;">
                  <div style="width:100%;display:flex;flex-direction:column;align-items:center;gap:1px;justify-content:flex-end;height:80px;">
                    <div title="${d.views} 뷰" style="width:60%;background:var(--adm-accent-soft);border-radius:2px 2px 0 0;height:${maxDay > 0 ? Math.max(2, Math.round((d.views/maxDay)*76)) : 0}px;"></div>
                    <div title="${d.clicks} 클릭" style="width:100%;background:var(--adm-accent);border-radius:2px 2px 0 0;height:${maxDay > 0 ? Math.max(d.clicks > 0 ? 2 : 0, Math.round((d.clicks/maxDay)*76)) : 0}px;"></div>
                  </div>
                  <div style="font-size:9px;color:var(--adm-text-muted);transform:rotate(-45deg);transform-origin:top left;margin-top:4px;white-space:nowrap;">${d.label}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- 누적 통계 -->
        <div class="adm-panel">
          <div class="adm-panel__header"><h2 class="adm-panel__title">누적 통계</h2></div>
          <div class="adm-panel__body">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;">
              <div style="padding:12px;background:var(--adm-surface-2);border-radius:8px;">
                <div style="color:var(--adm-text-muted);font-size:11px;margin-bottom:4px;">총 클릭 (홈→서비스)</div>
                <div style="font-size:20px;font-weight:700;">${stats.totalClicks || 0}</div>
              </div>
              <div style="padding:12px;background:var(--adm-surface-2);border-radius:8px;">
                <div style="color:var(--adm-text-muted);font-size:11px;margin-bottom:4px;">총 뷰 (서비스 페이지)</div>
                <div style="font-size:20px;font-weight:700;">${stats.totalViews || 0}</div>
              </div>
            </div>
            <div style="margin-top:12px;padding:10px 14px;border-radius:8px;background:var(--adm-accent-glow-soft);border:1px solid var(--adm-border-accent);font-size:12px;color:var(--adm-text-muted);">
              💡 트렌딩 점수는 관리자 로드 시 자동으로 재계산되어 Firestore에 저장됩니다. 홈 페이지 서비스 순서에 반영됩니다.
            </div>
          </div>
        </div>

      </div>
    `;
  }

  // ── 탭: 홈 썸네일 ──
  function tabThumbnail(svc) {
    const currentOg = svc.ogImage || '/dunsmile/assets/og-image.png';
    return `
      <div class="adm-panel">
        <div class="adm-panel__header">
          <h2 class="adm-panel__title">홈 카드 썸네일</h2>
          <span style="font-size:12px;color:var(--adm-text-muted);">홈 레일과 히어로 OG 이미지에 사용됩니다</span>
        </div>
        <div class="adm-panel__body" style="display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start;">
          <div>
            <div style="margin-bottom:16px;">
              ${field('현재 OG 이미지 경로', `<input class="adm-input" id="th-ogimage" value="${escHtml(currentOg)}">`)}
            </div>
            <div style="margin-bottom:16px;">
              <label style="font-size:12px;color:var(--adm-text-muted);display:block;margin-bottom:6px;">새 이미지 업로드</label>
              <input type="file" id="th-file" accept="image/*,image/svg+xml" style="display:none;" onchange="window.__admHandleThumbUpload('${escHtml(svc.id)}', this)">
              <button class="adm-btn adm-btn--ghost" onclick="document.getElementById('th-file').click()">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                파일 선택 (PNG·SVG·JPG)
              </button>
              <p style="font-size:11px;color:var(--adm-text-muted);margin-top:8px;">
                권장 크기: 1200×630px (OG), 400×600px (포스터)<br>
                업로드 후 <code>/dunsmile/assets/</code> 경로에 저장됩니다.
              </p>
            </div>
            <button class="adm-btn adm-btn--primary" onclick="window.__admSaveThumb('${escHtml(svc.id)}')">경로 저장</button>
          </div>

          <!-- 미리보기 -->
          <div>
            <div style="font-size:12px;color:var(--adm-text-muted);margin-bottom:8px;">홈 카드 미리보기</div>
            <div id="thumb-preview" style="border-radius:8px;overflow:hidden;background:var(--adm-surface-2);width:160px;">
              <div style="height:100px;background:var(--adm-surface-2);display:flex;align-items:center;justify-content:center;font-size:36px;">${escHtml(svc.emoji||'✨')}</div>
              <div style="padding:10px;">
                <div style="font-size:11px;font-weight:700;color:var(--adm-text);margin-bottom:4px;">${escHtml(svc.name)}</div>
                <div style="font-size:10px;color:var(--adm-text-muted);line-height:1.4;">${escHtml((svc.desc||'').slice(0,40))}…</div>
              </div>
            </div>
            <div style="margin-top:12px;font-size:12px;color:var(--adm-text-muted);">현재 OG 이미지</div>
            <img id="og-preview" src="${escHtml(currentOg)}" alt="OG 이미지" onerror="this.style.display='none'"
              style="margin-top:8px;width:100%;border-radius:6px;border:1px solid var(--adm-border);">
          </div>
        </div>
      </div>
    `;
  }

  window.__admSaveThumb = async function(id) {
    const svc = allServices.find((s) => s.id === id);
    const path = v('th-ogimage');
    if (svc && path) {
      svc.ogImage = path;
      const img = document.getElementById('og-preview');
      if (img) img.src = path;
      const ok = await persistData();
      if (ok) showToast('✓ 썸네일 저장 완료 — 즉시 반영됩니다.');
    }
  };

  window.__admHandleThumbUpload = function(id, input) {
    const file = input.files[0];
    if (!file) return;
    const suggested = `/dunsmile/assets/og-image-${id}.${file.name.split('.').pop()}`;
    const pathInput = document.getElementById('th-ogimage');
    if (pathInput) pathInput.value = suggested;
    showToast(`파일 선택됨: ${file.name} → ${suggested}\n실제 업로드는 서버 배포 후 반영됩니다.`);
  };

  // ── 탭: 타로 카드 이미지 ──
  function tabTarotImages(svc) {
    const suits = [
      { key: 'major', label: '메이저 아르카나 (22장)', count: 22 },
      { key: 'cups',  label: '컵 (14장)', count: 14 },
      { key: 'wands', label: '완드 (14장)', count: 14 },
      { key: 'swords',label: '소드 (14장)', count: 14 },
      { key: 'pentacles', label: '펜타클 (14장)', count: 14 },
    ];
    return `
      <div class="adm-panel">
        <div class="adm-panel__header">
          <h2 class="adm-panel__title">타로 카드 이미지 덱 관리</h2>
          <span style="font-size:12px;color:var(--adm-text-muted);">경로: /dunsmile/tarot-reading/images/{suit}/</span>
        </div>
        <div class="adm-panel__body">
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">
            ${suits.map((suit) => `
              <div style="border:1px solid var(--adm-border);border-radius:10px;padding:14px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                  <div>
                    <div style="font-weight:700;font-size:13px;">${suit.label}</div>
                    <div style="font-size:11px;color:var(--adm-text-muted);">${suit.count}장</div>
                  </div>
                  <button class="adm-btn adm-btn--ghost" style="padding:4px 8px;font-size:11px;" onclick="window.__admViewTarotSuit('${suit.key}', '${suit.label}')">
                    이미지 보기
                  </button>
                </div>
                <div style="display:flex;gap:4px;flex-wrap:wrap;">
                  ${Array.from({length:Math.min(suit.count,5)},(_,i)=>`
                    <img src="/dunsmile/tarot-reading/images/${suit.key}/${suit.key==='major'?String(i).padStart(2,'0')+'-':''}${['fool','magician','high-priestess','empress','emperor'][i]||String(i+1).padStart(2,'0')}.png"
                      onerror="this.style.opacity='0.3'"
                      style="width:28px;height:44px;border-radius:3px;object-fit:cover;background:var(--adm-surface-2);">
                  `).join('')}
                  <span style="font-size:10px;color:var(--adm-text-muted);align-self:center;">+${suit.count-5}장</span>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="margin-top:20px;border-radius:10px;padding:16px;background:var(--adm-surface-2);">
            <div style="font-weight:700;margin-bottom:8px;">🃏 카드 뒷면 이미지</div>
            <div style="display:flex;align-items:center;gap:16px;">
              <img src="/dunsmile/tarot-reading/images/back.png" onerror="this.style.display='none'"
                style="width:50px;height:80px;border-radius:4px;object-fit:cover;border:1px solid var(--adm-border);">
              <div>
                <div style="font-size:12px;color:var(--adm-text-muted);">경로: /dunsmile/tarot-reading/images/back.png</div>
                <label style="display:inline-flex;align-items:center;gap:6px;margin-top:8px;" class="adm-btn adm-btn--ghost" style="cursor:pointer;">
                  <input type="file" accept="image/*" style="display:none;" onchange="showToast('back.png 교체: 서버에 직접 업로드 필요')">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:13px;height:13px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"/></svg>
                  뒷면 교체
                </label>
              </div>
            </div>
          </div>

          <p style="margin-top:16px;font-size:12px;color:var(--adm-text-muted);">
            ℹ️ 이미지 교체 시 동일한 파일명으로 서버에 직접 업로드하세요.<br>
            major: 00-fool.png ~ 21-world.png 형식 / cups·wands·swords·pentacles: 01.png~14.png 형식
          </p>
        </div>
      </div>

      <div id="tarot-suit-modal"></div>
    `;
  }

  window.__admViewTarotSuit = function(suitKey, label) {
    const majorNames = ['fool','magician','high-priestess','empress','emperor','hierophant','lovers','chariot','strength','hermit','wheel-of-fortune','justice','hanged-man','death','temperance','devil','tower','star','moon','sun','judgement','world'];
    const count = suitKey === 'major' ? 22 : 14;
    const modal = document.getElementById('tarot-suit-modal');
    if (!modal) return;
    modal.innerHTML = `
      <div style="position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:100;overflow-y:auto;padding:40px 20px;" onclick="if(event.target===this)this.innerHTML=''">
        <div style="max-width:800px;margin:0 auto;background:var(--adm-surface);border-radius:16px;padding:24px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:20px;">
            <h3 style="margin:0;font-size:16px;font-weight:800;">${label}</h3>
            <button class="adm-btn adm-btn--ghost" style="padding:4px 10px;" onclick="document.getElementById('tarot-suit-modal').innerHTML=''">닫기</button>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:10px;">
            ${Array.from({length:count},(_,i)=>{
              const src = suitKey==='major'
                ? `/dunsmile/tarot-reading/images/major/${String(i).padStart(2,'0')}-${majorNames[i]||i}.png`
                : `/dunsmile/tarot-reading/images/${suitKey}/${String(i+1).padStart(2,'0')}.png`;
              return `
                <div style="text-align:center;">
                  <img src="${src}" onerror="this.src=''" style="width:60px;height:96px;object-fit:cover;border-radius:4px;border:1px solid var(--adm-border);background:var(--adm-surface-2);">
                  <div style="font-size:10px;color:var(--adm-text-muted);margin-top:4px;">${i+1}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  };

  // ── 탭: 관상 이미지 (rich-face) ──
  function tabRichFaceImages(svc) {
    const faceTypes = [
      { id: 'high',   label: '부자상 HIGH',   desc: '70%+ 부자 확률 결과 이미지' },
      { id: 'mid',    label: '부자상 MID',    desc: '40-70% 결과 이미지' },
      { id: 'low',    label: '부자상 LOW',    desc: '40% 미만 결과 이미지' },
      { id: 'intro',  label: '인트로 이미지', desc: '서비스 시작 화면 일러스트' },
    ];
    return `
      <div class="adm-panel">
        <div class="adm-panel__header">
          <h2 class="adm-panel__title">관상 이미지 관리</h2>
        </div>
        <div class="adm-panel__body">
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;">
            ${faceTypes.map((ft) => `
              <div style="border:1px solid var(--adm-border);border-radius:10px;padding:14px;">
                <div style="font-weight:700;font-size:13px;margin-bottom:4px;">${ft.label}</div>
                <div style="font-size:11px;color:var(--adm-text-muted);margin-bottom:12px;">${ft.desc}</div>
                <div style="width:100%;height:100px;border-radius:8px;background:var(--adm-surface-2);display:flex;align-items:center;justify-content:center;margin-bottom:10px;font-size:32px;">👤</div>
                <div style="font-size:11px;color:var(--adm-text-muted);margin-bottom:8px;">경로: /dunsmile/rich-face/images/${ft.id}.png</div>
                <input type="file" accept="image/*" style="display:none;" id="face-file-${ft.id}" onchange="showToast('이미지 업로드: 서버에 직접 배포 필요')">
                <button class="adm-btn adm-btn--ghost" style="width:100%;padding:6px;" onclick="document.getElementById('face-file-${ft.id}').click()">
                  이미지 교체
                </button>
              </div>
            `).join('')}
          </div>
          <div style="margin-top:16px;padding:14px;border-radius:10px;background:var(--adm-surface-2);">
            <div style="font-weight:700;font-size:13px;margin-bottom:8px;">관상 판단 기준 텍스트</div>
            <div style="display:grid;gap:10px;">
              ${[
                { id: 'rf-high-title', label: '높은 부자 확률 제목', val: '당신은 부자가 될 상입니다!' },
                { id: 'rf-mid-title',  label: '중간 부자 확률 제목', val: '잠재력이 있는 상입니다' },
                { id: 'rf-low-title',  label: '낮은 부자 확률 제목', val: '노력형 부자 타입입니다' },
              ].map((item) => field(item.label, `<input class="adm-input" id="${item.id}" value="${escHtml(item.val)}">`)).join('')}
            </div>
            <div style="display:flex;justify-content:flex-end;margin-top:12px;">
              <button class="adm-btn adm-btn--primary" onclick="window.__admSaveRichFace()">저장</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function initRichFaceEditor() {
    loadServiceConfig('richFace').then((data) => {
      if (!data) return;
      if (data.highTitle) { const el = document.getElementById('rf-high-title'); if (el) el.value = data.highTitle; }
      if (data.midTitle)  { const el = document.getElementById('rf-mid-title');  if (el) el.value = data.midTitle; }
      if (data.lowTitle)  { const el = document.getElementById('rf-low-title');  if (el) el.value = data.lowTitle; }
    });
  }

  window.__admSaveRichFace = async function() {
    await saveServiceConfig('richFace', {
      highTitle: v('rf-high-title'),
      midTitle:  v('rf-mid-title'),
      lowTitle:  v('rf-low-title'),
    });
  };

  // ── 탭: 밸런스 게임 문항 편집 ──
  function tabBalanceQuestions(svc) {
    return `
      <div class="adm-panel">
        <div class="adm-panel__header">
          <h2 class="adm-panel__title">밸런스 게임 문항</h2>
          <button class="adm-btn adm-btn--primary" onclick="window.__admAddBalanceQ()">+ 문항 추가</button>
        </div>
        <div class="adm-panel__body" style="padding:0;" id="balance-q-list">
          <div class="adm-empty"><div class="adm-spinner"></div></div>
        </div>
        <div style="padding:16px 20px;border-top:1px solid var(--adm-border);display:flex;justify-content:flex-end;gap:10px;">
          <button class="adm-btn adm-btn--ghost" onclick="initBalanceEditor()">취소</button>
          <button class="adm-btn adm-btn--primary" onclick="window.__admSaveBalanceQ()">저장</button>
        </div>
      </div>
    `;
  }

  function initBalanceEditor() {
    // Firestore 우선 로드
    loadServiceConfig('balanceGame').then((data) => {
      if (data && Array.isArray(data.questions) && data.questions.length > 0) {
        window.__admBalanceQuestions = data.questions;
        renderBalanceList();
        return;
      }
      // fallback: balance-game.js에서 로드
      if (window.BALANCE_QUESTIONS) {
        window.__admBalanceQuestions = JSON.parse(JSON.stringify(window.BALANCE_QUESTIONS));
        renderBalanceList();
        return;
      }
      const script = document.createElement('script');
      script.src = '/dunsmile/js/balance-game.js';
      script.onload = () => {
        window.__admBalanceQuestions = JSON.parse(JSON.stringify(window.BALANCE_QUESTIONS || []));
        renderBalanceList();
      };
      script.onerror = () => {
        window.__admBalanceQuestions = [{ id: 'q1', question: '야식 vs 디저트', optionA: '야식', optionB: '디저트' }];
        renderBalanceList();
      };
      document.body.appendChild(script);
    });
  }

  function renderBalanceList() {
    const listEl = document.getElementById('balance-q-list');
    if (!listEl) return;
    const qs = window.__admBalanceQuestions || [];
    listEl.innerHTML = `
      <table class="adm-table">
        <thead><tr><th>#</th><th>질문</th><th>선택 A</th><th>선택 B</th><th></th></tr></thead>
        <tbody>
          ${qs.map((q,i) => `
            <tr id="bq-row-${i}">
              <td style="color:var(--adm-text-muted);">${i+1}</td>
              <td><input class="adm-input" style="min-width:200px;" id="bq-q-${i}" value="${escHtml(q.question)}"></td>
              <td><input class="adm-input" style="min-width:100px;" id="bq-a-${i}" value="${escHtml(q.optionA)}"></td>
              <td><input class="adm-input" style="min-width:100px;" id="bq-b-${i}" value="${escHtml(q.optionB)}"></td>
              <td><button class="adm-btn adm-btn--danger" style="padding:4px 8px;font-size:12px;" onclick="window.__admDeleteBalanceQ(${i})">삭제</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  window.__admAddBalanceQ = function() {
    if (!window.__admBalanceQuestions) window.__admBalanceQuestions = [];
    const i = window.__admBalanceQuestions.length;
    window.__admBalanceQuestions.push({ id: `q${i+1}`, question: '새 질문', optionA: '선택 A', optionB: '선택 B' });
    renderBalanceList();
  };

  window.__admDeleteBalanceQ = function(index) {
    if (!window.__admBalanceQuestions) return;
    window.__admBalanceQuestions.splice(index, 1);
    renderBalanceList();
  };

  window.__admSaveBalanceQ = async function() {
    const qs = window.__admBalanceQuestions || [];
    qs.forEach((_, i) => {
      const q = document.getElementById(`bq-q-${i}`);
      const a = document.getElementById(`bq-a-${i}`);
      const b = document.getElementById(`bq-b-${i}`);
      if (q) qs[i].question = q.value;
      if (a) qs[i].optionA  = a.value;
      if (b) qs[i].optionB  = b.value;
    });
    await saveServiceConfig('balanceGame', { questions: qs });
  };

  // ── 탭: 오늘의 운세 텍스트 ──
  function tabFortuneContent(svc) {
    return `
      <div class="adm-panel">
        <div class="adm-panel__header"><h2 class="adm-panel__title">운세 항목 관리</h2></div>
        <div class="adm-panel__body">
          <div style="display:grid;gap:14px;">
            ${[
              { id: 'fc-love',   label: '애정운 텍스트 템플릿' },
              { id: 'fc-money',  label: '금전운 텍스트 템플릿' },
              { id: 'fc-work',   label: '직업운 텍스트 템플릿' },
              { id: 'fc-health', label: '건강운 텍스트 템플릿' },
            ].map((item) => field(item.label, `<textarea class="adm-input adm-textarea" id="${item.id}" placeholder="메시지를 입력하세요..."></textarea>`)).join('')}
          </div>
          <div style="display:flex;justify-content:flex-end;margin-top:16px;">
            <button class="adm-btn adm-btn--primary" onclick="window.__admSaveFortune()">저장</button>
          </div>
        </div>
      </div>
    `;
  }

  function initFortuneEditor() {
    loadServiceConfig('dailyFortune').then((data) => {
      if (!data) return;
      ['love','money','work','health'].forEach((key) => {
        const el = document.getElementById(`fc-${key}`);
        if (el && data[key]) el.value = data[key];
      });
    });
  }

  window.__admSaveFortune = async function() {
    await saveServiceConfig('dailyFortune', {
      love:   v('fc-love'),
      money:  v('fc-money'),
      work:   v('fc-work'),
      health: v('fc-health'),
    });
  };

  // ── 탭: 부자 DNA 테스트 MBTI 문항 ──
  function tabWealthDNA(svc) {
    return `
      <div class="adm-panel">
        <div class="adm-panel__header">
          <h2 class="adm-panel__title">MBTI 문항 관리</h2>
          <button class="adm-btn adm-btn--primary" onclick="window.__admAddWealthQ()">+ 문항 추가</button>
        </div>
        <div class="adm-panel__body" style="padding:0;" id="wealth-q-list">
          <div class="adm-empty"><div class="adm-spinner"></div></div>
        </div>
        <div style="padding:14px 20px;border-top:1px solid var(--adm-border);display:flex;justify-content:flex-end;">
          <button class="adm-btn adm-btn--primary" onclick="window.__admSaveWealthDNA()">저장</button>
        </div>
      </div>
    `;
  }

  function initWealthDNAEditor() {
    loadServiceConfig('wealthDNA').then((data) => {
      window.__admWealthQuestions = (data && Array.isArray(data.questions)) ? data.questions : [
        { q: '돈이 생기면 제일 먼저?', a: '투자한다', b: '저축한다', weight: 'investor+1' },
        { q: '재테크 공부 스타일은?', a: '책·강의로 체계적으로', b: '실전에서 배운다', weight: 'saver+1' },
      ];
      renderWealthList();
    });
  }

  function renderWealthList() {
    const listEl = document.getElementById('wealth-q-list');
    if (!listEl) return;
    const qs = window.__admWealthQuestions || [];
    listEl.innerHTML = `
      <table class="adm-table">
        <thead><tr><th>#</th><th>질문</th><th>A 선택지</th><th>B 선택지</th><th>가중치</th><th></th></tr></thead>
        <tbody>
          ${qs.map((q, i) => `
            <tr>
              <td style="color:var(--adm-text-muted);">${i + 1}</td>
              <td><input class="adm-input" id="wq-q-${i}" value="${escHtml(q.q)}" style="min-width:180px;"></td>
              <td><input class="adm-input" id="wq-a-${i}" value="${escHtml(q.a)}"></td>
              <td><input class="adm-input" id="wq-b-${i}" value="${escHtml(q.b)}"></td>
              <td><input class="adm-input" id="wq-w-${i}" value="${escHtml(q.weight||'')}" style="width:100px;" placeholder="investor+1"></td>
              <td><button class="adm-btn adm-btn--danger" style="padding:4px 8px;font-size:12px;" onclick="window.__admDeleteWealthQ(${i})">삭제</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  window.__admAddWealthQ = function() {
    if (!window.__admWealthQuestions) window.__admWealthQuestions = [];
    window.__admWealthQuestions.push({ q: '새 질문', a: '선택 A', b: '선택 B', weight: '' });
    renderWealthList();
  };

  window.__admDeleteWealthQ = function(index) {
    if (!window.__admWealthQuestions) return;
    window.__admWealthQuestions.splice(index, 1);
    renderWealthList();
  };

  window.__admSaveWealthDNA = async function() {
    const qs = window.__admWealthQuestions || [];
    qs.forEach((_, i) => {
      const q = document.getElementById(`wq-q-${i}`);
      const a = document.getElementById(`wq-a-${i}`);
      const b = document.getElementById(`wq-b-${i}`);
      const w = document.getElementById(`wq-w-${i}`);
      if (q) qs[i].q = q.value;
      if (a) qs[i].a = a.value;
      if (b) qs[i].b = b.value;
      if (w) qs[i].weight = w.value;
    });
    await saveServiceConfig('wealthDNA', { questions: qs });
  };

  // ── 탭: 이름 궁합 결과 메시지 ──
  function tabNameCompat(svc) {
    return `
      <div class="adm-panel">
        <div class="adm-panel__header"><h2 class="adm-panel__title">궁합 결과 메시지 템플릿</h2></div>
        <div class="adm-panel__body">
          <div style="display:grid;gap:14px;">
            ${[
              { id: 'nc-high', label: '90점 이상 메시지' },
              { id: 'nc-mid',  label: '70-89점 메시지' },
              { id: 'nc-low',  label: '50-69점 메시지' },
              { id: 'nc-bad',  label: '49점 이하 메시지' },
            ].map((item) => field(item.label, `<textarea class="adm-input adm-textarea" id="${item.id}" style="min-height:60px;"></textarea>`)).join('')}
          </div>
          <div style="display:flex;justify-content:flex-end;margin-top:16px;">
            <button class="adm-btn adm-btn--primary" onclick="window.__admSaveNameCompat()">저장</button>
          </div>
        </div>
      </div>
    `;
  }

  function initNameCompatEditor() {
    const defaults = {
      high: '완벽한 인연! 두 분은 전생에도 함께였을 거예요.',
      mid:  '좋은 궁합이에요. 조금만 더 노력하면 완벽해질 수 있어요.',
      low:  '무난한 관계예요. 서로 이해하면 좋아질 거예요.',
      bad:  '도전적인 관계네요. 노력이 필요하지만 극복할 수 있어요.',
    };
    loadServiceConfig('nameCompat').then((data) => {
      const d = data || defaults;
      ['high','mid','low','bad'].forEach((key) => {
        const el = document.getElementById(`nc-${key}`);
        if (el) el.value = d[key] || defaults[key];
      });
    });
  }

  window.__admSaveNameCompat = async function() {
    await saveServiceConfig('nameCompat', {
      high: v('nc-high'),
      mid:  v('nc-mid'),
      low:  v('nc-low'),
      bad:  v('nc-bad'),
    });
  };

  // ── 탭: HOXY 번호 설정 ──
  function tabHoxyNumber(svc) {
    return `
      <div class="adm-panel">
        <div class="adm-panel__header"><h2 class="adm-panel__title">번호 생성 설정</h2></div>
        <div class="adm-panel__body">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            ${field('번호 범위 최솟값', `<input class="adm-input" id="hn-min" type="number" value="1">`)}
            ${field('번호 범위 최댓값', `<input class="adm-input" id="hn-max" type="number" value="45">`)}
            ${field('추출 개수', `<input class="adm-input" id="hn-count" type="number" value="6">`)}
            ${field('보너스 번호', `<select class="adm-input adm-select" id="hn-bonus"><option value="include">포함</option><option value="exclude">제외</option></select>`)}
          </div>
          <div style="margin-top:16px;">
            ${field('결과 메시지 템플릿', `<textarea class="adm-input adm-textarea" id="hn-msg">오늘의 행운 번호는 {numbers}입니다. 행운을 빕니다!</textarea>`)}
          </div>
          <div style="display:flex;justify-content:flex-end;margin-top:16px;">
            <button class="adm-btn adm-btn--primary" onclick="window.__admSaveHoxyNumber()">저장</button>
          </div>
        </div>
      </div>
    `;
  }

  function initHoxyNumberEditor() {
    loadServiceConfig('hoxyNumber').then((data) => {
      if (!data) return;
      const set = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) el.value = val; };
      set('hn-min',   data.min   ?? 1);
      set('hn-max',   data.max   ?? 45);
      set('hn-count', data.count ?? 6);
      set('hn-bonus', data.bonus ?? 'include');
      set('hn-msg',   data.msgTemplate ?? '오늘의 행운 번호는 {numbers}입니다. 행운을 빕니다!');
    });
  }

  window.__admSaveHoxyNumber = async function() {
    await saveServiceConfig('hoxyNumber', {
      min:         parseInt(v('hn-min'), 10)   || 1,
      max:         parseInt(v('hn-max'), 10)   || 45,
      count:       parseInt(v('hn-count'), 10) || 6,
      bonus:       v('hn-bonus'),
      msgTemplate: v('hn-msg'),
    });
  };

  // ── 탭: 시장 감성 데이터 설정 ──
  function tabMarketSentiment(svc) {
    return `
      <div class="adm-panel">
        <div class="adm-panel__header"><h2 class="adm-panel__title">데이터 소스 설정</h2></div>
        <div class="adm-panel__body">
          <div style="display:grid;gap:14px;">
            ${field('API 엔드포인트', `<input class="adm-input" id="ms-api" value="/api/market-sentiment">`)}
            ${field('갱신 주기 (분)', `<input class="adm-input" id="ms-interval" type="number" value="30">`)}
            ${field('분석 대상 커뮤니티', `
              <div id="ms-communities" style="display:flex;gap:10px;flex-wrap:wrap;margin-top:4px;">
                ${['펨코','디씨','네이버 증권','주식갤러리','코인 갤러리'].map((c) => `
                  <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;">
                    <input type="checkbox" data-value="${c}" checked> ${c}
                  </label>
                `).join('')}
              </div>
            `)}
          </div>
          <div style="display:flex;justify-content:flex-end;margin-top:16px;">
            <button class="adm-btn adm-btn--primary" onclick="window.__admSaveMarketSentiment()">저장</button>
          </div>
        </div>
      </div>
    `;
  }

  window.__admSaveMarketSentiment = async function() {
    const communities = Array.from(document.querySelectorAll('#ms-communities input[type=checkbox]:checked'))
      .map((cb) => cb.dataset.value);
    await saveServiceConfig('marketSentiment', {
      apiEndpoint:      v('ms-api'),
      intervalMinutes:  parseInt(v('ms-interval'), 10) || 30,
      communities,
    });
  };

  // ── 탭: 미리보기 ──
  function tabPreview(svc) {
    const url = svc.route || `/${svc.id}/`;
    return `
      <div class="adm-panel">
        <div class="adm-panel__header">
          <h2 class="adm-panel__title">서비스 미리보기</h2>
          <a href="${escHtml(url)}" target="_blank" rel="noopener" class="adm-btn adm-btn--ghost" style="font-size:12px;">새 탭으로 열기 ↗</a>
        </div>
        <div style="border-radius:0 0 12px 12px;overflow:hidden;background:#000;">
          <div style="display:flex;align-items:center;gap:8px;padding:10px 16px;background:var(--adm-surface-2);">
            <div style="display:flex;gap:5px;">
              <span style="width:10px;height:10px;border-radius:50%;background:var(--adm-danger);display:block;"></span>
              <span style="width:10px;height:10px;border-radius:50%;background:#f59e0b;display:block;"></span>
              <span style="width:10px;height:10px;border-radius:50%;background:#22c55e;display:block;"></span>
            </div>
            <div style="flex:1;background:var(--adm-surface);border-radius:6px;padding:4px 10px;font-size:12px;color:var(--adm-text-muted);">
              ${escHtml(url)}
            </div>
          </div>
          <iframe
            src="${escHtml(url)}"
            style="width:100%;height:600px;border:none;display:block;"
            title="${escHtml(svc.name)} 미리보기"
            sandbox="allow-scripts allow-same-origin allow-forms">
          </iframe>
        </div>
      </div>
    `;
  }

  // ════════════════════════════════════════
  // 카테고리 & 탭 관리
  // ════════════════════════════════════════
  // 카테고리 순서를 전역으로 관리 (↑↓ 버튼용)
  let categoryOrder = ['fortune', 'fun', 'luck', 'finance', 'experimental'];

  const CATEGORY_DEFAULTS = {
    fortune:      { label: '운세/사주',   emoji: '🔮' },
    fun:          { label: '재미/밸런스', emoji: '⚖️' },
    luck:         { label: '행운/번호',   emoji: '🎱' },
    finance:      { label: '시장/데이터', emoji: '📈' },
    experimental: { label: '실험실',      emoji: '🧪' },
  };

  function renderCategories() {
    // siteSettings.categories가 있으면 저장된 값 사용, 없으면 기본값
    const saved = siteSettings.categories || {};

    // 저장된 순서가 있으면 사용
    if (siteSettings.categoryOrder && Array.isArray(siteSettings.categoryOrder)) {
      categoryOrder = siteSettings.categoryOrder;
    }

    renderCategoryTable();
  }

  function renderCategoryTable() {
    const saved = siteSettings.categories || {};

    contentEl.innerHTML = `
      <div class="adm-panel">
        <div class="adm-panel__header">
          <h2 class="adm-panel__title">카테고리 설정</h2>
          <span style="font-size:12px;color:var(--adm-text-muted);">표시 이름과 이모지를 수정하고 저장하세요</span>
        </div>
        <div style="padding:0;">
          <table class="adm-table" id="cat-table">
            <thead><tr><th>순서</th><th>ID</th><th>표시 이름</th><th>이모지</th><th>서비스 수</th></tr></thead>
            <tbody>
              ${categoryOrder.map((key, i) => {
                const def = CATEGORY_DEFAULTS[key] || {};
                const m   = saved[key] || def;
                const cnt = allServices.filter((s) => s.category === key).length;
                return `
                  <tr data-key="${key}">
                    <td>
                      <div style="display:flex;gap:4px;">
                        ${i > 0
                          ? `<button class="adm-btn adm-btn--ghost" style="padding:2px 8px;font-size:13px;" onclick="window.__admMoveCat(${i}, -1)">↑</button>`
                          : '<span style="width:30px;display:inline-block;"></span>'}
                        ${i < categoryOrder.length - 1
                          ? `<button class="adm-btn adm-btn--ghost" style="padding:2px 8px;font-size:13px;" onclick="window.__admMoveCat(${i}, 1)">↓</button>`
                          : ''}
                      </div>
                    </td>
                    <td><code style="font-size:12px;color:var(--adm-accent);">${key}</code></td>
                    <td><input class="adm-input" style="max-width:160px;" value="${escHtml(m.label || def.label || key)}" id="cat-label-${key}"></td>
                    <td><input class="adm-input" style="max-width:60px;font-size:18px;text-align:center;" value="${escHtml(m.emoji || def.emoji || '')}" id="cat-emoji-${key}"></td>
                    <td><span class="adm-badge adm-badge--hot">${cnt}개</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        <div style="padding:14px 20px;border-top:1px solid var(--adm-border);display:flex;justify-content:flex-end;">
          <button class="adm-btn adm-btn--primary" onclick="window.__admSaveCategories()">저장</button>
        </div>
      </div>

      <!-- 미리보기 -->
      <div class="adm-panel">
        <div class="adm-panel__header">
          <h2 class="adm-panel__title">홈 네비게이션 탭 미리보기</h2>
        </div>
        <div class="adm-panel__body">
          <div id="cat-preview" style="display:flex;flex-wrap:wrap;gap:8px;padding:12px;background:var(--adm-bg);border-radius:8px;">
            ${renderCatPreview(saved)}
          </div>
        </div>
      </div>
    `;
  }

  function renderCatPreview(saved) {
    const s = saved || siteSettings.categories || {};
    return `<span style="padding:6px 16px;border-radius:999px;background:var(--adm-accent);color:#fff;font-size:13px;font-weight:600;">홈</span>` +
      categoryOrder.map((key) => {
        const m = s[key] || CATEGORY_DEFAULTS[key] || {};
        return `<span style="padding:6px 16px;border-radius:999px;background:rgba(255,255,255,0.06);border:1px solid var(--adm-border);color:var(--adm-text-muted);font-size:13px;font-weight:500;">${m.emoji || ''} ${m.label || key}</span>`;
      }).join('');
  }

  // ↑↓ 순서 이동
  window.__admMoveCat = function(index, dir) {
    const swapIdx = index + dir;
    if (swapIdx < 0 || swapIdx >= categoryOrder.length) return;
    [categoryOrder[index], categoryOrder[swapIdx]] = [categoryOrder[swapIdx], categoryOrder[index]];
    renderCategoryTable();
  };

  window.__admSaveCategories = async function() {
    if (!siteSettings.categories) siteSettings.categories = {};
    categoryOrder.forEach((key) => {
      siteSettings.categories[key] = {
        label: v(`cat-label-${key}`) || CATEGORY_DEFAULTS[key]?.label || key,
        emoji: v(`cat-emoji-${key}`) || CATEGORY_DEFAULTS[key]?.emoji || '',
      };
    });
    siteSettings.categoryOrder = [...categoryOrder];
    const ok = await persistData();
    if (ok) {
      showToast('✓ 카테고리 저장 완료 — 즉시 반영됩니다.');
      // 미리보기 갱신
      const preview = document.getElementById('cat-preview');
      if (preview) preview.innerHTML = renderCatPreview(siteSettings.categories);
    }
  };

  // ════════════════════════════════════════
  // 서비스 만들기 — 비주얼 페이지 빌더
  // ════════════════════════════════════════

  // 빌더 전역 상태
  let _bldDef     = null;  // 현재 편집 중인 서비스 정의
  let _bldPageIdx = 0;     // 선택된 페이지 인덱스
  let _bldElIdx   = null;  // 선택된 요소 인덱스

  // 요소 타입 정의
  const BLD_EL_TYPES = [
    { type: 'heading', label: '제목',       icon: 'T'  },
    { type: 'text',    label: '설명 텍스트', icon: '¶'  },
    { type: 'emoji',   label: '이모지',      icon: '✨' },
    { type: 'image',   label: '이미지',      icon: '🖼' },
    { type: 'button',  label: '버튼',        icon: '▶' },
    { type: 'choice',  label: '선택지',      icon: '◉' },
    { type: 'input',   label: '텍스트 입력', icon: '✎' },
    { type: 'spacer',  label: '여백',        icon: '↕' },
  ];

  function bldNewEl(type) {
    const id = 'e' + Date.now() + Math.random().toString(36).slice(2, 5);
    const map = {
      heading: { id, type: 'heading', text: '새 제목을 입력하세요', align: 'center' },
      text:    { id, type: 'text',    text: '설명 텍스트를 입력하세요.', align: 'center' },
      emoji:   { id, type: 'emoji',   value: '✨', size: 'xl' },
      image:   { id, type: 'image',   url: '', alt: '' },
      button:  { id, type: 'button',  text: '다음 →', style: 'primary', action: 'next' },
      choice:  { id, type: 'choice',  options: [
        { id: 'c1', text: '선택지 A', action: 'next' },
        { id: 'c2', text: '선택지 B', action: 'next' },
      ]},
      input:   { id, type: 'input',   label: '이름', placeholder: '입력하세요', inputType: 'text', key: 'k_' + Date.now() },
      spacer:  { id, type: 'spacer',  height: 32 },
    };
    return map[type] || { id, type };
  }

  function bldNewPage(pageType) {
    const id = 'p' + Date.now();
    if (pageType === 'intro') return {
      id, title: '인트로', type: 'intro', bg: '#6366f1',
      elements: [bldNewEl('emoji'), bldNewEl('heading'), bldNewEl('text'), bldNewEl('button')],
    };
    if (pageType === 'question') return {
      id, title: '질문', type: 'question', bg: '#ffffff',
      elements: [bldNewEl('heading'), bldNewEl('choice')],
    };
    if (pageType === 'result') return {
      id, title: '결과', type: 'result', bg: '#f0fdf4',
      elements: [bldNewEl('emoji'), bldNewEl('heading'), bldNewEl('text')],
    };
    return { id, title: '새 페이지', type: 'blank', bg: '#ffffff', elements: [] };
  }

  function bldElIcon(el) {
    if (el.type === 'emoji') return el.value || '✨';
    return { heading: 'T', text: '¶', image: '🖼', button: '▶', choice: '◉', input: '✎', spacer: '↕' }[el.type] || '?';
  }
  function bldElLabel(el) {
    return { heading: '제목', text: '설명', emoji: '이모지', image: '이미지', button: '버튼', choice: '선택지', input: '텍스트 입력', spacer: '여백' }[el.type] || el.type;
  }
  function bldElPreview(el) {
    if (el.type === 'heading' || el.type === 'text') return el.text || '';
    if (el.type === 'emoji')  return el.value || '✨';
    if (el.type === 'button') return el.text || '';
    if (el.type === 'choice') return (el.options || []).map((o) => o.text).join(' / ');
    if (el.type === 'image')  return el.url || '(이미지 URL 없음)';
    if (el.type === 'input')  return el.label || '';
    if (el.type === 'spacer') return el.height + 'px 여백';
    return '';
  }
  function propField(label, inputHtml) {
    return `<div><label style="font-size:11px;color:var(--adm-text-muted);display:block;margin-bottom:5px;font-weight:600;">${label}</label>${inputHtml}</div>`;
  }

  // ── 진입점 ──
  function renderBuilder() {
    if (_bldDef) {
      renderBuilderEditor();
    } else {
      renderBuilderCreateForm();
    }
  }

  // Step 1: 기본 정보 입력
  function renderBuilderCreateForm() {
    contentEl.innerHTML = `
      <div style="max-width:560px;margin:0 auto;">
        <div style="text-align:center;margin-bottom:28px;">
          <div style="font-size:48px;margin-bottom:12px;">🛠</div>
          <h2 style="margin:0 0 8px;font-size:22px;font-weight:800;">새 서비스 만들기</h2>
          <p style="margin:0;color:var(--adm-text-muted);font-size:13px;">기본 정보를 입력하면 비주얼 에디터가 열립니다</p>
        </div>
        <div class="adm-panel">
          <div class="adm-panel__body" style="display:grid;gap:14px;">
            ${field('서비스 ID (영문 소문자·숫자·하이픈)', '<input class="adm-input" id="bld-id" placeholder="my-quiz">')}
            <div style="display:grid;grid-template-columns:1fr auto;gap:12px;align-items:start;">
              ${field('서비스명', '<input class="adm-input" id="bld-name" placeholder="내 퀴즈">')}
              ${field('이모지', '<input class="adm-input" id="bld-emoji" value="✨" style="font-size:22px;text-align:center;width:60px;">')}
            </div>
            ${field('카테고리', `<select class="adm-input adm-select" id="bld-category">
              ${['fortune','fun','luck','finance','experimental'].map((c)=>`<option>${c}</option>`).join('')}
            </select>`)}
            ${field('설명 (홈 카드에 표시)', '<textarea class="adm-input adm-textarea" id="bld-desc" placeholder="클릭 한 번으로 알아보는..."></textarea>')}
          </div>
          <div style="padding:0 20px 20px;display:flex;justify-content:flex-end;">
            <button class="adm-btn adm-btn--primary" style="padding:11px 28px;font-size:14px;" onclick="window.__bldInitNew()">
              에디터 열기 →
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Step 2: 비주얼 에디터 (3컬럼)
  function renderBuilderEditor() {
    const def = _bldDef;
    if (!def) { renderBuilderCreateForm(); return; }
    const route = `/dunsmile/service-app/?s=${encodeURIComponent(def.id)}`;

    contentEl.innerHTML = `
      <!-- 상단 바 -->
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;flex-wrap:wrap;">
        <button class="adm-btn adm-btn--ghost" onclick="window.__bldExit()" style="padding:6px 12px;font-size:12px;">← 나가기</button>
        <span style="font-size:20px;">${escHtml(def.emoji)}</span>
        <strong style="font-size:15px;">${escHtml(def.name)}</strong>
        <code style="font-size:11px;color:var(--adm-text-muted);background:var(--adm-surface-2);padding:3px 8px;border-radius:4px;">${route}</code>
        <div style="margin-left:auto;display:flex;gap:8px;">
          <a href="${route}" target="_blank" class="adm-btn adm-btn--ghost" style="font-size:12px;">미리보기 ↗</a>
          <button class="adm-btn adm-btn--primary" onclick="window.__bldPublish()">저장 & 게시</button>
        </div>
      </div>

      <!-- 3컬럼 -->
      <div style="display:grid;grid-template-columns:210px 1fr 270px;gap:10px;min-height:72vh;">
        <div id="bld-page-list" style="background:var(--adm-surface);border:1px solid var(--adm-border);border-radius:12px;overflow-y:auto;"></div>
        <div id="bld-canvas"    style="background:var(--adm-surface);border:1px solid var(--adm-border);border-radius:12px;overflow-y:auto;display:flex;flex-direction:column;"></div>
        <div id="bld-props"     style="background:var(--adm-surface);border:1px solid var(--adm-border);border-radius:12px;overflow-y:auto;"></div>
      </div>
    `;
    renderBldPageList();
    renderBldCanvas();
    renderBldProps();
  }

  // ── 왼쪽: 페이지 목록 ──
  function renderBldPageList() {
    const panel = document.getElementById('bld-page-list');
    if (!panel || !_bldDef) return;
    const pageTypeEmoji = { intro: '🏠', question: '❓', result: '🎉', blank: '📄' };
    panel.innerHTML = `
      <div style="padding:12px 14px;border-bottom:1px solid var(--adm-border);">
        <div style="font-size:11px;font-weight:700;color:var(--adm-text-muted);letter-spacing:.04em;margin-bottom:8px;">페이지 목록</div>
        ${_bldDef.pages.map((page, i) => `
          <div onclick="window.__bldSelectPage(${i})" style="
            display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;cursor:pointer;margin-bottom:3px;
            background:${i === _bldPageIdx ? 'rgba(99,102,241,0.12)' : 'transparent'};
            border:1px solid ${i === _bldPageIdx ? 'var(--adm-accent)' : 'transparent'};
            transition:all 0.1s;
          ">
            <span style="font-size:13px;">${pageTypeEmoji[page.type] || '📄'}</span>
            <div style="flex:1;min-width:0;">
              <div style="font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtml(page.title)}</div>
              <div style="font-size:10px;color:var(--adm-text-muted);">${page.elements.length}개 요소</div>
            </div>
            ${_bldDef.pages.length > 1 ? `<button onclick="event.stopPropagation();window.__bldDeletePage(${i})" style="background:none;border:none;color:var(--adm-text-muted);cursor:pointer;padding:2px;font-size:15px;line-height:1;opacity:0.5;" title="삭제">×</button>` : ''}
          </div>
        `).join('')}
      </div>
      <div style="padding:12px 14px;">
        <div style="font-size:11px;font-weight:700;color:var(--adm-text-muted);letter-spacing:.04em;margin-bottom:8px;">+ 페이지 추가</div>
        ${[['intro','🏠','인트로'],['question','❓','질문'],['result','🎉','결과'],['blank','📄','빈 페이지']].map(([type, emoji, label]) => `
          <button onclick="window.__bldAddPage('${type}')" style="
            display:flex;align-items:center;gap:7px;width:100%;
            background:none;border:1px dashed var(--adm-border);border-radius:8px;
            padding:7px 10px;cursor:pointer;color:var(--adm-text-muted);font-size:12px;
            margin-bottom:4px;transition:all 0.1s;text-align:left;
          " onmouseenter="this.style.borderColor='var(--adm-accent)';this.style.color='var(--adm-text)'"
             onmouseleave="this.style.borderColor='var(--adm-border)';this.style.color='var(--adm-text-muted)'">
            <span>${emoji}</span>${label}
          </button>
        `).join('')}
      </div>
    `;
  }

  // ── 가운데: 캔버스 ──
  function renderBldCanvas() {
    const panel = document.getElementById('bld-canvas');
    if (!panel || !_bldDef) return;
    const page = _bldDef.pages[_bldPageIdx];
    if (!page) return;

    panel.innerHTML = `
      <div style="padding:12px 16px;border-bottom:1px solid var(--adm-border);display:flex;align-items:center;gap:10px;">
        <input style="flex:1;background:none;border:none;font-size:14px;font-weight:700;color:var(--adm-text);outline:none;"
          value="${escHtml(page.title)}" onchange="window.__bldUpdatePage('title',this.value)" placeholder="페이지 이름">
        <span style="font-size:11px;color:var(--adm-text-muted);">${page.elements.length}개 요소</span>
      </div>

      <!-- 요소 목록 -->
      <div style="padding:10px;flex:1;display:flex;flex-direction:column;gap:5px;min-height:160px;">
        ${page.elements.length === 0 ? `
          <div style="text-align:center;padding:40px 20px;color:var(--adm-text-muted);font-size:13px;border:2px dashed var(--adm-border);border-radius:10px;margin:8px;">
            아래 팔레트에서 요소를 추가하세요
          </div>
        ` : page.elements.map((el, i) => `
          <div onclick="window.__bldSelectEl(${i})" style="
            display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;cursor:pointer;
            border:2px solid ${i === _bldElIdx ? '#6366f1' : 'var(--adm-border)'};
            background:${i === _bldElIdx ? 'rgba(99,102,241,0.07)' : 'var(--adm-surface-2)'};
            transition:all 0.1s;
          ">
            <span style="font-size:15px;flex-shrink:0;width:20px;text-align:center;">${bldElIcon(el)}</span>
            <div style="flex:1;min-width:0;">
              <div style="font-size:12px;font-weight:600;color:var(--adm-text);">${bldElLabel(el)}</div>
              <div style="font-size:11px;color:var(--adm-text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:260px;">${escHtml(bldElPreview(el))}</div>
            </div>
            <div style="display:flex;gap:1px;flex-shrink:0;">
              ${i > 0 ? `<button onclick="event.stopPropagation();window.__bldMoveEl(${i},-1)" style="background:none;border:none;color:var(--adm-text-muted);cursor:pointer;padding:3px 5px;font-size:11px;">↑</button>` : ''}
              ${i < page.elements.length-1 ? `<button onclick="event.stopPropagation();window.__bldMoveEl(${i},1)" style="background:none;border:none;color:var(--adm-text-muted);cursor:pointer;padding:3px 5px;font-size:11px;">↓</button>` : ''}
              <button onclick="event.stopPropagation();window.__bldDeleteEl(${i})" style="background:none;border:none;color:var(--adm-danger);cursor:pointer;padding:3px 6px;font-size:14px;opacity:0.6;">×</button>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- 요소 추가 팔레트 -->
      <div style="padding:12px;border-top:1px solid var(--adm-border);">
        <div style="font-size:11px;font-weight:700;color:var(--adm-text-muted);letter-spacing:.04em;margin-bottom:8px;">+ 요소 추가</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;">
          ${BLD_EL_TYPES.map(({ type, label, icon }) => `
            <button onclick="window.__bldAddEl('${type}')" style="
              display:flex;align-items:center;gap:6px;padding:7px 10px;
              background:var(--adm-surface-2);border:1px solid var(--adm-border);border-radius:8px;
              cursor:pointer;color:var(--adm-text);font-size:12px;transition:all 0.1s;text-align:left;
            " onmouseenter="this.style.background='rgba(99,102,241,0.1)'" onmouseleave="this.style.background='var(--adm-surface-2)'">
              <span style="font-size:13px;">${icon}</span>${label}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ── 오른쪽: 속성 패널 ──
  function renderBldProps() {
    const panel = document.getElementById('bld-props');
    if (!panel || !_bldDef) return;
    const page = _bldDef.pages[_bldPageIdx];
    const el   = (page && _bldElIdx !== null) ? page.elements[_bldElIdx] : null;

    if (!el) {
      panel.innerHTML = `
        <div style="padding:14px 16px;border-bottom:1px solid var(--adm-border);">
          <div style="font-size:13px;font-weight:700;">속성 편집</div>
        </div>
        <div style="padding:20px;text-align:center;color:var(--adm-text-muted);font-size:12px;line-height:1.8;margin-top:32px;">
          가운데 패널에서<br>요소를 클릭하면<br>속성을 편집할 수 있습니다
        </div>
      `;
      return;
    }

    // 페이지 이동 옵션 공통 생성
    const pageOpts = (_bldDef.pages || []).map((p, i) =>
      `<option value="page:${p.id}">${i+1}. ${escHtml(p.title)}</option>`
    ).join('');

    let propsHtml = '';

    if (el.type === 'heading') {
      propsHtml = `
        ${propField('텍스트', `<textarea class="adm-input adm-textarea" style="min-height:72px;" oninput="window.__bldProp('text',this.value)">${escHtml(el.text||'')}</textarea>`)}
        ${propField('정렬', `<select class="adm-input adm-select" onchange="window.__bldProp('align',this.value)">
          <option value="center" ${el.align==='center'?'selected':''}>가운데</option>
          <option value="left"   ${el.align==='left'?'selected':''}>왼쪽</option>
          <option value="right"  ${el.align==='right'?'selected':''}>오른쪽</option>
        </select>`)}
      `;
    } else if (el.type === 'text') {
      propsHtml = `
        ${propField('텍스트', `<textarea class="adm-input adm-textarea" style="min-height:72px;" oninput="window.__bldProp('text',this.value)">${escHtml(el.text||'')}</textarea>`)}
        ${propField('정렬', `<select class="adm-input adm-select" onchange="window.__bldProp('align',this.value)">
          <option value="center" ${el.align==='center'?'selected':''}>가운데</option>
          <option value="left"   ${el.align==='left'?'selected':''}>왼쪽</option>
          <option value="right"  ${el.align==='right'?'selected':''}>오른쪽</option>
        </select>`)}
      `;
    } else if (el.type === 'emoji') {
      propsHtml = `
        ${propField('이모지', `<input class="adm-input" style="font-size:28px;text-align:center;" value="${escHtml(el.value||'✨')}" oninput="window.__bldProp('value',this.value)">`)}
        ${propField('크기', `<select class="adm-input adm-select" onchange="window.__bldProp('size',this.value)">
          <option value="md" ${el.size==='md'?'selected':''}>보통</option>
          <option value="lg" ${el.size==='lg'?'selected':''}>크게</option>
          <option value="xl" ${el.size==='xl'?'selected':''}>매우 크게</option>
        </select>`)}
      `;
    } else if (el.type === 'image') {
      propsHtml = `
        ${propField('이미지 URL', `<input class="adm-input" value="${escHtml(el.url||'')}" placeholder="https://..." oninput="window.__bldProp('url',this.value)">`)}
        ${propField('대체 텍스트(alt)', `<input class="adm-input" value="${escHtml(el.alt||'')}" oninput="window.__bldProp('alt',this.value)">`)}
      `;
    } else if (el.type === 'button') {
      propsHtml = `
        ${propField('버튼 텍스트', `<input class="adm-input" value="${escHtml(el.text||'')}" oninput="window.__bldProp('text',this.value)">`)}
        ${propField('스타일', `<select class="adm-input adm-select" onchange="window.__bldProp('style',this.value)">
          <option value="primary" ${el.style==='primary'?'selected':''}>기본 (채움)</option>
          <option value="ghost"   ${el.style==='ghost'?'selected':''}>아웃라인</option>
          <option value="text"    ${el.style==='text'?'selected':''}>텍스트만</option>
        </select>`)}
        ${propField('클릭 시 이동', `<select class="adm-input adm-select" onchange="window.__bldProp('action',this.value)">
          <option value="next"    ${el.action==='next'?'selected':''}>다음 페이지</option>
          <option value="prev"    ${el.action==='prev'?'selected':''}>이전 페이지</option>
          <option value="end"     ${el.action==='end'?'selected':''}>완료 / 결과</option>
          <option value="restart" ${el.action==='restart'?'selected':''}>처음부터 다시</option>
          ${pageOpts}
        </select>`)}
      `;
    } else if (el.type === 'choice') {
      propsHtml = `
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${(el.options||[]).map((opt, oi) => `
            <div style="border:1px solid var(--adm-border);border-radius:8px;padding:10px;background:var(--adm-surface-2);">
              <div style="font-size:10px;font-weight:700;color:var(--adm-text-muted);margin-bottom:6px;">선택지 ${oi+1}</div>
              <input class="adm-input" style="margin-bottom:6px;" value="${escHtml(opt.text||'')}" placeholder="선택지 텍스트"
                oninput="window.__bldChoiceText(${oi},this.value)">
              <select class="adm-input adm-select" onchange="window.__bldChoiceAction(${oi},this.value)">
                <option value="next"    ${opt.action==='next'?'selected':''}>다음 페이지</option>
                <option value="end"     ${opt.action==='end'?'selected':''}>완료</option>
                <option value="restart" ${opt.action==='restart'?'selected':''}>처음부터</option>
                ${pageOpts}
              </select>
              ${el.options.length > 2 ? `<button onclick="window.__bldRemoveChoiceOpt(${oi})" style="margin-top:6px;background:none;border:none;color:var(--adm-danger);cursor:pointer;font-size:11px;padding:0;">× 삭제</button>` : ''}
            </div>
          `).join('')}
          ${(el.options||[]).length < 4 ? `
            <button class="adm-btn adm-btn--ghost" style="font-size:12px;" onclick="window.__bldAddChoiceOpt()">+ 선택지 추가</button>
          ` : ''}
        </div>
      `;
    } else if (el.type === 'input') {
      propsHtml = `
        ${propField('레이블', `<input class="adm-input" value="${escHtml(el.label||'')}" oninput="window.__bldProp('label',this.value)">`)}
        ${propField('플레이스홀더', `<input class="adm-input" value="${escHtml(el.placeholder||'')}" oninput="window.__bldProp('placeholder',this.value)">`)}
        ${propField('입력 타입', `<select class="adm-input adm-select" onchange="window.__bldProp('inputType',this.value)">
          <option value="text"   ${(!el.inputType||el.inputType==='text')?'selected':''}>텍스트</option>
          <option value="number" ${el.inputType==='number'?'selected':''}>숫자</option>
          <option value="date"   ${el.inputType==='date'?'selected':''}>날짜</option>
        </select>`)}
      `;
    } else if (el.type === 'spacer') {
      propsHtml = propField('높이 (px)', `<input class="adm-input" type="number" min="4" max="200" value="${el.height||32}" oninput="window.__bldProp('height',parseInt(this.value)||32)">`);
    }

    panel.innerHTML = `
      <div style="padding:12px 14px;border-bottom:1px solid var(--adm-border);display:flex;align-items:center;gap:8px;">
        <span style="font-size:16px;">${bldElIcon(el)}</span>
        <div style="font-size:13px;font-weight:700;">${bldElLabel(el)}</div>
      </div>
      <div style="padding:14px;display:flex;flex-direction:column;gap:12px;">
        ${propsHtml || '<div style="font-size:12px;color:var(--adm-text-muted);">편집 가능한 속성이 없습니다.</div>'}
      </div>
    `;
  }

  // ── 빌더 액션 핸들러 ──

  window.__bldInitNew = function() {
    const id   = v('bld-id').trim().replace(/[^a-z0-9-]/g, '-');
    const name = v('bld-name').trim();
    if (!id || !name) { showToast('서비스 ID와 이름을 입력해 주세요.'); return; }
    if (allServices.find((s) => s.id === id && !s.builderMade)) {
      showToast('이미 같은 ID의 서비스가 있습니다.'); return;
    }
    _bldDef = {
      id, name,
      emoji:    v('bld-emoji') || '✨',
      category: v('bld-category'),
      desc:     v('bld-desc'),
      pages: [bldNewPage('intro'), bldNewPage('result')],
    };
    _bldPageIdx = 0;
    _bldElIdx   = null;
    renderBuilderEditor();
  };

  window.__bldSelectPage = function(idx) {
    _bldPageIdx = idx;
    _bldElIdx   = null;
    renderBldPageList();
    renderBldCanvas();
    renderBldProps();
  };

  window.__bldAddPage = function(type) {
    _bldDef.pages.push(bldNewPage(type));
    _bldPageIdx = _bldDef.pages.length - 1;
    _bldElIdx   = null;
    renderBldPageList();
    renderBldCanvas();
    renderBldProps();
  };

  window.__bldDeletePage = function(idx) {
    if (_bldDef.pages.length <= 1) { showToast('페이지가 1개이면 삭제할 수 없습니다.'); return; }
    _bldDef.pages.splice(idx, 1);
    if (_bldPageIdx >= _bldDef.pages.length) _bldPageIdx = _bldDef.pages.length - 1;
    _bldElIdx = null;
    renderBldPageList();
    renderBldCanvas();
    renderBldProps();
  };

  window.__bldUpdatePage = function(key, value) {
    const page = _bldDef.pages[_bldPageIdx];
    if (page) { page[key] = value; renderBldPageList(); }
  };

  window.__bldSelectEl = function(idx) {
    _bldElIdx = (_bldElIdx === idx) ? null : idx; // 재클릭 시 해제
    renderBldCanvas();
    renderBldProps();
  };

  window.__bldAddEl = function(type) {
    const page = _bldDef.pages[_bldPageIdx];
    if (!page) return;
    page.elements.push(bldNewEl(type));
    _bldElIdx = page.elements.length - 1;
    renderBldCanvas();
    renderBldProps();
  };

  window.__bldDeleteEl = function(idx) {
    const page = _bldDef.pages[_bldPageIdx];
    if (!page) return;
    page.elements.splice(idx, 1);
    if (_bldElIdx !== null && _bldElIdx >= page.elements.length) {
      _bldElIdx = page.elements.length > 0 ? page.elements.length - 1 : null;
    }
    renderBldCanvas();
    renderBldProps();
  };

  window.__bldMoveEl = function(idx, dir) {
    const page = _bldDef.pages[_bldPageIdx];
    if (!page) return;
    const swap = idx + dir;
    if (swap < 0 || swap >= page.elements.length) return;
    [page.elements[idx], page.elements[swap]] = [page.elements[swap], page.elements[idx]];
    if (_bldElIdx === idx) _bldElIdx = swap;
    renderBldCanvas();
  };

  window.__bldProp = function(key, value) {
    const page = _bldDef.pages[_bldPageIdx];
    if (!page || _bldElIdx === null) return;
    const el = page.elements[_bldElIdx];
    if (el) { el[key] = value; renderBldCanvas(); }
  };

  window.__bldChoiceText = function(oi, value) {
    const page = _bldDef.pages[_bldPageIdx];
    if (!page || _bldElIdx === null) return;
    const el = page.elements[_bldElIdx];
    if (el && el.options && el.options[oi]) { el.options[oi].text = value; renderBldCanvas(); }
  };

  window.__bldChoiceAction = function(oi, value) {
    const page = _bldDef.pages[_bldPageIdx];
    if (!page || _bldElIdx === null) return;
    const el = page.elements[_bldElIdx];
    if (el && el.options && el.options[oi]) el.options[oi].action = value;
  };

  window.__bldAddChoiceOpt = function() {
    const page = _bldDef.pages[_bldPageIdx];
    if (!page || _bldElIdx === null) return;
    const el = page.elements[_bldElIdx];
    if (!el || !el.options || el.options.length >= 4) return;
    el.options.push({ id: 'c' + Date.now(), text: '새 선택지', action: 'next' });
    renderBldCanvas();
    renderBldProps();
  };

  window.__bldRemoveChoiceOpt = function(oi) {
    const page = _bldDef.pages[_bldPageIdx];
    if (!page || _bldElIdx === null) return;
    const el = page.elements[_bldElIdx];
    if (!el || !el.options || el.options.length <= 2) return;
    el.options.splice(oi, 1);
    renderBldCanvas();
    renderBldProps();
  };

  window.__bldExit = function() {
    if (_bldDef && !confirm('에디터를 나가면 저장되지 않은 변경사항이 사라집니다.\n계속할까요?')) return;
    _bldDef     = null;
    _bldPageIdx = 0;
    _bldElIdx   = null;
    navigate('services');
  };

  window.__bldPublish = async function() {
    if (!_bldDef) return;
    const def   = _bldDef;
    const route = '/dunsmile/service-app/?s=' + encodeURIComponent(def.id);
    try {
      await db.collection('siteConfig').doc('builderService-' + def.id).set({
        ...def,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      const existing = allServices.find((s) => s.id === def.id);
      if (existing) {
        Object.assign(existing, { name: def.name, emoji: def.emoji, category: def.category, desc: def.desc, route, builderMade: true });
      } else {
        allServices.push({
          id: def.id, name: def.name, fullName: def.name,
          emoji: def.emoji, category: def.category, desc: def.desc,
          status: 'active', homeVisible: true,
          route, trendingScore: 50, tags: [], builderMade: true,
        });
      }
      await persistData();
      showToast(`✓ "${def.name}" 저장 & 게시 완료!\n주소: ${route}`);
    } catch (e) {
      showToast('저장 실패. 네트워크를 확인해 주세요.');
    }
  };

  // 기존 빌더 서비스 편집 진입점
  window.__bldEditService = async function(id) {
    try {
      const snap = await db.collection('siteConfig').doc('builderService-' + id).get();
      if (snap.exists) {
        _bldDef     = snap.data();
        _bldPageIdx = 0;
        _bldElIdx   = null;
        navigate('builder');
      } else {
        showToast('서비스 정의를 찾을 수 없습니다.');
      }
    } catch (e) {
      showToast('로드 실패.');
    }
  };

  // ════════════════════════════════════════
  // 홈 관리
  // ════════════════════════════════════════
  function renderHomeManagement() {
    const h = siteSettings.home || {};
    const skinA = (h.skins || {}).A || {};
    const skinB = (h.skins || {}).B || {};
    const banner = h.banner || {};
    const activeSkin = h.activeSkin || 'A';

    // 히어로 로테이션용 서비스 목록 (trendingScore 순)
    const rotationList = [...allServices]
      .filter((s) => s.status !== 'disabled' && s.homeVisible !== false)
      .sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0));

    contentEl.innerHTML = `
      <!-- 탭 네비 -->
      <div class="adm-tabs" id="home-tabs" style="margin-bottom:0;">
        <button class="adm-tab is-active" data-tab="hero">히어로 텍스트</button>
        <button class="adm-tab" data-tab="rotation">히어로 로테이션</button>
        <button class="adm-tab" data-tab="banner">배너 설정</button>
        <button class="adm-tab" data-tab="nav">홈 nav 텍스트</button>
        <button class="adm-tab" data-tab="fallback">Fallback 서비스 목록</button>
      </div>
      <div id="home-tab-body" style="margin-top:16px;"></div>
    `;

    // ── 탭 정의 ──
    const homeTabs = {
      hero: () => renderHeroTextTab(skinA, skinB, activeSkin),
      rotation: () => renderRotationTab(rotationList),
      banner: () => renderBannerTab(banner, rotationList),
      nav: () => renderNavTab(h),
      fallback: () => renderFallbackTab(),
    };

    const tabBtns = contentEl.querySelectorAll('.adm-tab[data-tab]');
    const bodyEl = document.getElementById('home-tab-body');

    function activateHomeTab(tabId) {
      tabBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.tab === tabId));
      bodyEl.innerHTML = homeTabs[tabId] ? homeTabs[tabId]() : '';
      // afterRender 훅
      if (tabId === 'rotation') initRotationDrag();
    }

    tabBtns.forEach((btn) => btn.addEventListener('click', () => activateHomeTab(btn.dataset.tab)));
    activateHomeTab('hero');
  }

  // ── 히어로 텍스트 탭 ──
  function renderHeroTextTab(skinA, skinB, activeSkin) {
    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start;">

        <!-- 스킨 A -->
        <div class="adm-panel">
          <div class="adm-panel__header">
            <h2 class="adm-panel__title">스킨 A ${activeSkin==='A'?'<span class="adm-badge adm-badge--active" style="margin-left:6px;">현재 적용</span>':''}</h2>
            <button class="adm-btn adm-btn--${activeSkin==='A'?'ghost':'primary'}" style="font-size:12px;"
              onclick="window.__admSetActiveSkin('A')">
              ${activeSkin==='A'?'적용 중':'스킨 A 적용'}
            </button>
          </div>
          <div class="adm-panel__body" style="display:grid;gap:12px;">
            ${field('Kicker 문구 (작은 상단 레이블)', `<input class="adm-input" id="sa-kicker" value="${escHtml(skinA.kicker||'')}">`)}
            ${field('메인 제목', `<input class="adm-input" id="sa-title" value="${escHtml(skinA.title||'')}">`)}
            ${field('부제목', `<textarea class="adm-input adm-textarea" id="sa-subtitle" style="min-height:60px;">${escHtml(skinA.subtitle||'')}</textarea>`)}
            ${field('히어로 이미지 경로', `<input class="adm-input" id="sa-hero" value="${escHtml(skinA.heroImage||'')}">`)}
            <div>
              <label style="font-size:12px;color:var(--adm-text-muted);display:block;margin-bottom:6px;">Flow Steps (줄바꿈 구분)</label>
              <textarea class="adm-input adm-textarea" id="sa-steps" style="min-height:70px;">${escHtml((skinA.flowSteps||[]).join('\n'))}</textarea>
            </div>
            <button class="adm-btn adm-btn--primary" onclick="window.__admSaveSkin('A')">스킨 A 저장</button>
          </div>
        </div>

        <!-- 스킨 B -->
        <div class="adm-panel">
          <div class="adm-panel__header">
            <h2 class="adm-panel__title">스킨 B ${activeSkin==='B'?'<span class="adm-badge adm-badge--active" style="margin-left:6px;">현재 적용</span>':''}</h2>
            <button class="adm-btn adm-btn--${activeSkin==='B'?'ghost':'primary'}" style="font-size:12px;"
              onclick="window.__admSetActiveSkin('B')">
              ${activeSkin==='B'?'적용 중':'스킨 B 적용'}
            </button>
          </div>
          <div class="adm-panel__body" style="display:grid;gap:12px;">
            ${field('Kicker 문구', `<input class="adm-input" id="sb-kicker" value="${escHtml(skinB.kicker||'')}">`)}
            ${field('메인 제목', `<input class="adm-input" id="sb-title" value="${escHtml(skinB.title||'')}">`)}
            ${field('부제목', `<textarea class="adm-input adm-textarea" id="sb-subtitle" style="min-height:60px;">${escHtml(skinB.subtitle||'')}</textarea>`)}
            ${field('히어로 이미지 경로', `<input class="adm-input" id="sb-hero" value="${escHtml(skinB.heroImage||'')}">`)}
            <div>
              <label style="font-size:12px;color:var(--adm-text-muted);display:block;margin-bottom:6px;">Flow Steps (줄바꿈 구분)</label>
              <textarea class="adm-input adm-textarea" id="sb-steps" style="min-height:70px;">${escHtml((skinB.flowSteps||[]).join('\n'))}</textarea>
            </div>
            <button class="adm-btn adm-btn--primary" onclick="window.__admSaveSkin('B')">스킨 B 저장</button>
          </div>
        </div>
      </div>

      <!-- 저장 안내 -->
      <div style="margin-top:16px;padding:14px 18px;border-radius:10px;background:var(--adm-accent-glow-soft);border:1px solid var(--adm-border-accent);font-size:12px;color:var(--adm-text-muted);">
        💡 <strong style="color:var(--adm-text);">저장 방식</strong> — "저장" 클릭 시 Firestore에 즉시 저장되며 홈 페이지에 바로 반영됩니다.
      </div>
    `;
  }

  window.__admSetActiveSkin = async function(skin) {
    if (!siteSettings.home) siteSettings.home = {};
    siteSettings.home.activeSkin = skin;
    const ok = await persistData();
    if (ok) showToast(`✓ 스킨 ${skin} 적용 완료 — 즉시 반영됩니다.`);
    navigate('home');
  };

  window.__admSaveSkin = async function(skinKey) {
    if (!siteSettings.home) siteSettings.home = {};
    if (!siteSettings.home.skins) siteSettings.home.skins = {};
    const prefix = skinKey === 'A' ? 'sa' : 'sb';
    siteSettings.home.skins[skinKey] = {
      kicker:    v(`${prefix}-kicker`),
      title:     v(`${prefix}-title`),
      subtitle:  v(`${prefix}-subtitle`),
      heroImage: v(`${prefix}-hero`),
      flowSteps: v(`${prefix}-steps`).split('\n').map((s) => s.trim()).filter(Boolean),
    };
    const ok = await persistData();
    if (ok) showToast(`✓ 스킨 ${skinKey} 저장 완료 — 즉시 반영됩니다.`);
  };

  // ── 히어로 로테이션 탭 ──
  function renderRotationTab(services) {
    window.__admRotationOrder = services.map((s) => s.id);
    return `
      <div class="adm-panel">
        <div class="adm-panel__header">
          <h2 class="adm-panel__title">히어로 자동 로테이션 순서</h2>
          <span style="font-size:12px;color:var(--adm-text-muted);">trendingScore 상위 5개가 자동 순환됩니다. 순서를 드래그로 조정하세요.</span>
        </div>
        <div class="adm-panel__body" style="padding:0;">
          <ul id="rotation-list" style="list-style:none;margin:0;padding:0;">
            ${services.slice(0, 8).map((s, i) => `
              <li data-id="${escHtml(s.id)}" style="display:flex;align-items:center;gap:12px;padding:12px 20px;border-bottom:1px solid var(--adm-border);cursor:grab;transition:background 0.1s;"
                onmouseenter="this.style.background='rgba(255,255,255,0.04)'"
                onmouseleave="this.style.background=''">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:16px;height:16px;color:var(--adm-text-muted);flex-shrink:0;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"/>
                </svg>
                <span class="adm-badge adm-badge--${i < 5 ? 'active' : 'inactive'}" style="width:24px;text-align:center;flex-shrink:0;">${i+1}</span>
                <span style="font-size:18px;flex-shrink:0;">${escHtml(s.emoji||'')}</span>
                <div style="flex:1;">
                  <div style="font-weight:600;font-size:13px;">${escHtml(s.name)}</div>
                  <div style="font-size:11px;color:var(--adm-text-muted);">${escHtml(s.category)} · 트렌딩 ${s.trendingScore||0}</div>
                </div>
                ${i < 5
                  ? `<span style="font-size:11px;padding:3px 8px;border-radius:999px;background:var(--adm-accent-soft);color:var(--adm-accent);">로테이션 포함</span>`
                  : `<span style="font-size:11px;color:var(--adm-text-muted);">대기</span>`}
                <div style="display:flex;gap:4px;">
                  ${i > 0 ? `<button class="adm-btn adm-btn--ghost" style="padding:3px 7px;font-size:11px;" onclick="window.__admMoveRotation(${i}, -1)">↑</button>` : ''}
                  ${i < services.slice(0,8).length - 1 ? `<button class="adm-btn adm-btn--ghost" style="padding:3px 7px;font-size:11px;" onclick="window.__admMoveRotation(${i}, 1)">↓</button>` : ''}
                </div>
              </li>
            `).join('')}
          </ul>
        </div>
        <div style="padding:14px 20px;border-top:1px solid var(--adm-border);display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:12px;color:var(--adm-text-muted);">1~5위 서비스가 히어로에 자동 표시됩니다 (trendingScore 자동 반영)</span>
          <button class="adm-btn adm-btn--primary" onclick="window.__admSaveRotation()">순서 저장 (trendingScore 반영)</button>
        </div>
      </div>
    `;
  }

  function initRotationDrag() { /* 드래그 기능 — 향후 확장 */ }

  window.__admMoveRotation = function(index, dir) {
    const list = document.getElementById('rotation-list');
    if (!list) return;
    const items = Array.from(list.querySelectorAll('li'));
    const target = items[index];
    const swap = items[index + dir];
    if (!target || !swap) return;
    if (dir === -1) list.insertBefore(target, swap);
    else list.insertBefore(swap, target);
    // 순위 배지 갱신
    Array.from(list.querySelectorAll('li')).forEach((li, i) => {
      const badge = li.querySelector('.adm-badge');
      if (badge) badge.textContent = String(i + 1);
      badge.className = `adm-badge adm-badge--${i < 5 ? 'active' : 'inactive'}`;
    });
  };

  window.__admSaveRotation = async function() {
    const list = document.getElementById('rotation-list');
    if (!list) return;
    const orderedIds = Array.from(list.querySelectorAll('li[data-id]')).map((li) => li.dataset.id);
    orderedIds.forEach((id, i) => {
      const svc = allServices.find((s) => s.id === id);
      if (svc) svc.trendingScore = Math.max(50, 97 - i);
    });
    const ok = await persistData();
    if (ok) showToast('✓ 로테이션 순서 저장 완료 — 홈 히어로에 즉시 반영됩니다.');
  };

  // ── 배너 설정 탭 ──
  function renderBannerTab(banner, services) {
    const svcOptions = services.map((s) =>
      `<option value="${escHtml(s.id)}" ${banner.primaryServiceId===s.id?'selected':''}>${escHtml(s.emoji||'')} ${escHtml(s.name)}</option>`
    ).join('');

    return `
      <div class="adm-panel">
        <div class="adm-panel__header"><h2 class="adm-panel__title">배너 설정</h2></div>
        <div class="adm-panel__body" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          ${field('배너 모드', `<select class="adm-input adm-select" id="ban-mode">
            <option value="auto" ${banner.mode==='auto'?'selected':''}>auto (trendingScore 자동)</option>
            <option value="manual" ${banner.mode==='manual'?'selected':''}>manual (직접 지정)</option>
          </select>`)}
          ${field('배너 뱃지 텍스트', `<input class="adm-input" id="ban-badge" value="${escHtml(banner.badgeText||'오늘의 픽')}">`)}
          ${field('CTA 버튼 텍스트', `<input class="adm-input" id="ban-cta" value="${escHtml(banner.ctaText||'지금 해보기')}">`)}
          ${field('최대 서브 서비스 수', `<select class="adm-input adm-select" id="ban-max">
            ${[0,1,2].map((n)=>`<option ${banner.maxSecondary===n?'selected':''}>${n}</option>`).join('')}
          </select>`)}
          <div style="grid-column:1/-1;">
            ${field('메인 배너 서비스 (manual 모드)', `<select class="adm-input adm-select" id="ban-primary">${svcOptions}</select>`)}
          </div>
          <div style="grid-column:1/-1;">
            <label style="font-size:12px;color:var(--adm-text-muted);display:block;margin-bottom:8px;">서브 배너 서비스 (최대 2개)</label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              <select class="adm-input adm-select" id="ban-sec1">
                <option value="">- 없음 -</option>
                ${services.map((s)=>`<option value="${escHtml(s.id)}" ${(banner.secondaryServiceIds||[])[0]===s.id?'selected':''}>${escHtml(s.emoji||'')} ${escHtml(s.name)}</option>`).join('')}
              </select>
              <select class="adm-input adm-select" id="ban-sec2">
                <option value="">- 없음 -</option>
                ${services.map((s)=>`<option value="${escHtml(s.id)}" ${(banner.secondaryServiceIds||[])[1]===s.id?'selected':''}>${escHtml(s.emoji||'')} ${escHtml(s.name)}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>
        <div style="padding:0 20px 20px;display:flex;justify-content:flex-end;">
          <button class="adm-btn adm-btn--primary" onclick="window.__admSaveBanner()">배너 설정 저장</button>
        </div>
      </div>

      <!-- 미리보기 -->
      <div class="adm-panel">
        <div class="adm-panel__header"><h2 class="adm-panel__title">배너 미리보기</h2></div>
        <div class="adm-panel__body">
          <div style="border-radius:10px;overflow:hidden;border:1px solid var(--adm-border);">
            <iframe src="/" style="width:100%;height:300px;border:none;pointer-events:none;transform:scale(0.6);transform-origin:top left;width:166%;height:500px;" title="홈 미리보기"></iframe>
          </div>
          <a href="/" target="_blank" class="adm-btn adm-btn--ghost" style="margin-top:10px;font-size:12px;">실제 홈 새 탭으로 열기 ↗</a>
        </div>
      </div>
    `;
  }

  window.__admSaveBanner = async function() {
    if (!siteSettings.home) siteSettings.home = {};
    const sec = [v('ban-sec1'), v('ban-sec2')].filter(Boolean);
    siteSettings.home.banner = {
      ...((siteSettings.home.banner) || {}),
      mode:                v('ban-mode').split(' ')[0],
      badgeText:           v('ban-badge'),
      ctaText:             v('ban-cta'),
      maxSecondary:        parseInt(v('ban-max'), 10) || 0,
      primaryServiceId:    v('ban-primary'),
      secondaryServiceIds: sec,
    };
    const ok = await persistData();
    if (ok) showToast('✓ 배너 설정 저장 완료 — 즉시 반영됩니다.');
  };

  // ── 홈 nav 텍스트 탭 ──
  function renderNavTab(homeSettings) {
    const featured = homeSettings.featured || {};
    return `
      <div class="adm-panel">
        <div class="adm-panel__header">
          <h2 class="adm-panel__title">홈 섹션 텍스트</h2>
          <span style="font-size:12px;color:var(--adm-text-muted);">site-settings.json home.featured 기준</span>
        </div>
        <div class="adm-panel__body" style="display:grid;gap:14px;">
          ${field('추천 섹션 제목 (Featured 레일 타이틀)', `<input class="adm-input" id="nav-feat-title" value="${escHtml(featured.title||'지금 인기 서비스')}">`)}
          ${field('추천 섹션 부제목', `<input class="adm-input" id="nav-feat-sub" value="${escHtml(featured.subtitle||'조회/트렌드 기준으로 먼저 시작해보세요.')}">`)}
          <button class="adm-btn adm-btn--primary" onclick="window.__admSaveFeatured()" style="justify-self:end;">저장</button>
        </div>
      </div>

      <div class="adm-panel" style="margin-top:16px;">
        <div class="adm-panel__header">
          <h2 class="adm-panel__title">홈 정적 텍스트 안내</h2>
        </div>
        <div class="adm-panel__body">
          <div style="display:grid;gap:12px;font-size:13px;">
            ${[
              ['히어로 제목 (fallback)', 'index.html #hero-content h2', '히어로 텍스트 탭에서 스킨 A/B 수정'],
              ['네비 카테고리명', 'index.html nav ul > li', '카테고리 & 탭 메뉴에서 수정 후 index.html에 반영'],
              ['Fallback 서비스 목록', 'index.html noscript', 'Fallback 탭에서 수정'],
              ['푸터 브랜드 설명', 'index.html .nflx-footer__copy', '직접 index.html 편집 필요'],
            ].map(([label, location, action]) => `
              <div style="display:grid;grid-template-columns:160px 1fr 1fr;gap:10px;align-items:center;padding:10px 14px;border-radius:8px;background:var(--adm-surface-2);">
                <div style="font-weight:600;color:var(--adm-text);">${label}</div>
                <div><code style="font-size:11px;color:var(--adm-accent);">${location}</code></div>
                <div style="font-size:12px;color:var(--adm-text-muted);">${action}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  window.__admSaveFeatured = async function() {
    if (!siteSettings.home) siteSettings.home = {};
    siteSettings.home.featured = {
      title:    v('nav-feat-title'),
      subtitle: v('nav-feat-sub'),
    };
    const ok = await persistData();
    if (ok) showToast('✓ 섹션 텍스트 저장 완료 — 즉시 반영됩니다.');
  };

  // ── Fallback 서비스 목록 탭 ──
  function renderFallbackTab() {
    const activeServices = allServices.filter((s) => s.status !== 'disabled' && s.homeVisible !== false);
    return `
      <div class="adm-panel">
        <div class="adm-panel__header">
          <h2 class="adm-panel__title">Fallback 서비스 목록</h2>
          <span style="font-size:12px;color:var(--adm-text-muted);">JS 비활성 / 로드 실패 시 index.html noscript에 표시됩니다</span>
        </div>
        <div class="adm-panel__body">
          <div style="margin-bottom:14px;font-size:13px;color:var(--adm-text-muted);">
            활성 서비스 기준으로 자동 생성됩니다. 아래 "HTML 복사" 버튼으로 index.html의 noscript 블록을 교체하세요.
          </div>
          <div style="border-radius:8px;overflow:hidden;border:1px solid var(--adm-border);">
            <table class="adm-table">
              <thead><tr><th>노출 순서</th><th>서비스</th><th>링크 경로</th></tr></thead>
              <tbody id="fallback-list">
                ${activeServices.map((s, i) => `
                  <tr>
                    <td style="color:var(--adm-text-muted);">${i+1}</td>
                    <td>${escHtml(s.emoji||'')} <strong>${escHtml(s.name)}</strong></td>
                    <td><code style="font-size:12px;color:var(--adm-accent);">${escHtml(s.route||`/dunsmile/${s.id}/`)}</code></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:14px;">
            <button class="adm-btn adm-btn--ghost" onclick="window.__admPreviewFallback()">HTML 미리보기</button>
            <button class="adm-btn adm-btn--primary" onclick="window.__admCopyFallbackHTML()">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              noscript HTML 복사
            </button>
          </div>
        </div>
      </div>
      <div id="fallback-preview" style="margin-top:16px;"></div>
    `;
  }

  window.__admCopyFallbackHTML = function() {
    const activeServices = allServices.filter((s) => s.status !== 'disabled' && s.homeVisible !== false);
    const html = `<noscript>
      <section class="nflx-noscript">
        <h2 class="nflx-noscript__title">전체 서비스</h2>
        <ul class="nflx-noscript__list">
${activeServices.map((s) => `          <li><a href="${s.route||`/dunsmile/${s.id}/`}" class="nflx-noscript__link">${s.emoji||''} ${s.name}</a></li>`).join('\n')}
        </ul>
      </section>
    </noscript>`;
    navigator.clipboard.writeText(html).then(() => {
      showToast('noscript HTML이 클립보드에 복사됐습니다.\nindex.html의 기존 noscript 블록과 교체하세요.');
    });
  };

  window.__admPreviewFallback = function() {
    const activeServices = allServices.filter((s) => s.status !== 'disabled' && s.homeVisible !== false);
    const preview = document.getElementById('fallback-preview');
    if (!preview) return;
    preview.innerHTML = `
      <div class="adm-panel">
        <div class="adm-panel__header"><h2 class="adm-panel__title">HTML 미리보기</h2></div>
        <div class="adm-panel__body">
          <pre style="font-size:11px;color:var(--adm-text-muted);white-space:pre-wrap;word-break:break-all;">&lt;noscript&gt;
  &lt;section class="nflx-noscript"&gt;
    &lt;h2 class="nflx-noscript__title"&gt;전체 서비스&lt;/h2&gt;
    &lt;ul class="nflx-noscript__list"&gt;
${activeServices.map((s) => `      &lt;li&gt;&lt;a href="${escHtml(s.route||`/dunsmile/${s.id}/`)}"&gt;${escHtml(s.emoji||'')} ${escHtml(s.name)}&lt;/a&gt;&lt;/li&gt;`).join('\n')}
    &lt;/ul&gt;
  &lt;/section&gt;
&lt;/noscript&gt;</pre>
        </div>
      </div>
    `;
  };

  // ── site-settings.json 내보내기 ──
  function exportSettingsToClipboard(toastMsg) {
    const json = JSON.stringify(siteSettings, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      showToast(toastMsg || 'site-settings.json이 클립보드에 복사됐습니다.');
    }).catch(() => {
      showToast('클립보드 접근 실패. 브라우저 권한을 확인해 주세요.');
    });
  }

  // ════════════════════════════════════════
  // 사이트 설정
  // ════════════════════════════════════════
  function renderSettings() {
    contentEl.innerHTML = `

      <div class="adm-panel">
        <div class="adm-panel__header">
          <h2 class="adm-panel__title">데이터 백업</h2>
          <span style="font-size:12px;color:var(--adm-text-muted);">Firestore 현재 데이터를 JSON으로 내보냅니다</span>
        </div>
        <div class="adm-panel__body">
          <div style="display:flex;flex-wrap:wrap;gap:10px;">
            <button class="adm-btn adm-btn--ghost" onclick="window.__admExportServices()">
              services.manifest 백업
            </button>
            <button class="adm-btn adm-btn--ghost" onclick="window.__admExportSettings()">
              site-settings 백업
            </button>
            <button class="adm-btn adm-btn--ghost" onclick="window.__admShowExportModal()">
              전체 보기
            </button>
          </div>
          <div id="export-inline" style="margin-top:12px;"></div>
          <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--adm-border);">
            <button class="adm-btn adm-btn--ghost" onclick="window.__admReloadFromServer()" style="font-size:12px;">
              Firestore에서 재로드
            </button>
          </div>
        </div>
      </div>

      <div class="adm-panel">
        <div class="adm-panel__header"><h2 class="adm-panel__title">사이트 설정</h2></div>
        <div class="adm-panel__body" style="display:grid;gap:16px;">
          ${field('사이트 이름', `<input class="adm-input" id="st-sitename" value="${escHtml(siteSettings.siteName||'도파민 공작소')}">`)}
          <div style="display:flex;justify-content:flex-end;">
            <button class="adm-btn adm-btn--primary" onclick="siteSettings.siteName=document.getElementById('st-sitename').value;persistData();showToast('✓ 사이트 이름 저장 완료');">저장</button>
          </div>
        </div>
      </div>

      <div class="adm-panel">
        <div class="adm-panel__header"><h2 class="adm-panel__title">빌드 커맨드</h2></div>
        <div class="adm-panel__body" style="display:flex;flex-wrap:wrap;gap:10px;">
          ${[
            ['페이지 빌드',  'npm run build:pages'],
            ['CSS 빌드',     'npm run build:tailwind'],
            ['데이터 검증',  'npm run check:service-data'],
            ['전체 빌드',    'npm run build'],
          ].map(([label, cmd]) => `
            <button class="adm-btn adm-btn--ghost" onclick="navigator.clipboard.writeText('${cmd}').then(()=>showToast('클립보드: ${cmd}')).catch(()=>showToast('${cmd}'))">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              ${label}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  window.__admExportServices = function() {
    const manifest = {
      "$schema": "/dunsmile/services.schema.json",
      "version": "1.0.0",
      "updatedAt": new Date().toISOString().slice(0,10),
      "services": allServices,
    };
    const json = JSON.stringify(manifest, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      showToast('✓ services.manifest.json 복사 완료!\nfe/public/dunsmile/services.manifest.json에 붙여넣으세요.');
    }).catch(() => showExportInline('services.manifest.json', json));
  };

  window.__admExportSettings = function() {
    const json = JSON.stringify(siteSettings, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      showToast('✓ site-settings.json 복사 완료!\nfe/public/dunsmile/site-settings.json에 붙여넣으세요.');
    }).catch(() => showExportInline('site-settings.json', json));
  };

  window.__admShowExportModal = function() {
    const inlineEl = document.getElementById('export-inline');
    if (!inlineEl) return;
    inlineEl.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <div style="font-size:12px;font-weight:700;color:var(--adm-text-muted);margin-bottom:6px;">services.manifest.json</div>
          <textarea style="width:100%;height:200px;font-family:monospace;font-size:10px;background:var(--adm-surface-2);color:var(--adm-text);border:1px solid var(--adm-border);border-radius:8px;padding:10px;resize:vertical;box-sizing:border-box;"
            onclick="this.select()" readonly>${escHtml(JSON.stringify({services:allServices},null,2))}</textarea>
        </div>
        <div>
          <div style="font-size:12px;font-weight:700;color:var(--adm-text-muted);margin-bottom:6px;">site-settings.json</div>
          <textarea style="width:100%;height:200px;font-family:monospace;font-size:10px;background:var(--adm-surface-2);color:var(--adm-text);border:1px solid var(--adm-border);border-radius:8px;padding:10px;resize:vertical;box-sizing:border-all;box-sizing:border-box;"
            onclick="this.select()" readonly>${escHtml(JSON.stringify(siteSettings,null,2))}</textarea>
        </div>
      </div>
    `;
  };

  function showExportInline(filename, json) {
    const inlineEl = document.getElementById('export-inline');
    if (!inlineEl) { alert(json); return; }
    inlineEl.innerHTML = `
      <div style="font-size:12px;font-weight:700;color:var(--adm-text-muted);margin-bottom:6px;">${escHtml(filename)}</div>
      <textarea style="width:100%;height:200px;font-family:monospace;font-size:10px;background:var(--adm-surface-2);color:var(--adm-text);border:1px solid var(--adm-border);border-radius:8px;padding:10px;resize:vertical;box-sizing:border-box;"
        onclick="this.select()" readonly>${escHtml(json)}</textarea>
      <p style="font-size:12px;color:var(--adm-text-muted);margin:6px 0 0;">위 텍스트 클릭 → 전체 선택 → 복사 후 파일에 붙여넣으세요.</p>
    `;
  }

  // ── 유틸 ──
  function field(label, inputHtml) {
    return `<div><label style="font-size:12px;color:var(--adm-text-muted);display:block;margin-bottom:6px;">${label}</label>${inputHtml}</div>`;
  }

  function v(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
  }

  function escHtml(val) {
    return String(val||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function showToast(msg) {
    const toast = document.createElement('div');
    toast.textContent = msg;
    Object.assign(toast.style, {
      position:'fixed', bottom:'24px', right:'24px', zIndex:'9999',
      background:'var(--adm-accent)', color:'#fff',
      padding:'12px 18px', borderRadius:'10px', fontSize:'13px', fontWeight:'600',
      boxShadow:'0 8px 24px rgba(0,0,0,0.4)', opacity:'0',
      transition:'opacity 0.2s,transform 0.2s', transform:'translateY(6px)',
      maxWidth:'320px', whiteSpace:'pre-line',
    });
    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity='1'; toast.style.transform='translateY(0)'; });
    setTimeout(() => {
      toast.style.opacity='0'; toast.style.transform='translateY(6px)';
      setTimeout(() => toast.remove(), 250);
    }, 4000);
  }

  window.__admNavigate = navigate;
  window.showToast    = showToast;
  window.persistData  = persistData;

  // ── 초기화 ──
  loadData().then(() => loadServiceStats()).then(() => {
    if (applyAutoTrending()) persistData().catch(() => {});
  }).then(() => {
    const params = new URLSearchParams(location.search);
    const initPage = params.get('page') || 'dashboard';
    const initId   = params.get('id');

    if (initPage === 'services' && initId) {
      navigate('services');
      setTimeout(() => window.__admOpenDetail(initId), 100);
    } else {
      navigate(PAGES[initPage] ? initPage : 'dashboard');
    }
  });
})();
