/* 도파민 공작소 — 서비스 트래픽 트래킹 */
(function initTracking() {
  'use strict';

  function getTodayKey() {
    return new Date().toISOString().slice(0, 10); // "2025-03-11"
  }

  // Firestore에 클릭 or 뷰 기록 (fire-and-forget)
  function trackEvent(serviceId, type) {
    const db = window.__db;
    if (!db || !serviceId) return;
    const today = getTodayKey();
    const inc   = firebase.firestore.FieldValue.increment(1);
    const ts    = firebase.firestore.FieldValue.serverTimestamp();

    const payload = {
      lastActivity: ts,
    };
    if (type === 'click') {
      payload.totalClicks           = inc;
      payload['daily.' + today]     = inc;
    } else if (type === 'view') {
      payload.totalViews            = inc;
      payload['dailyViews.' + today] = inc;
    }

    db.collection('serviceStats').doc(serviceId).set(payload, { merge: true })
      .catch(function() {}); // 비중요 — 실패해도 무시
  }

  // 1) 홈/어디서든 서비스 링크 클릭 시 카운트
  document.addEventListener('click', function(e) {
    var link = e.target.closest('a[href]');
    if (!link) return;
    var href  = link.getAttribute('href') || '';
    var match = href.match(/\/dunsmile\/([a-z0-9-]+)\//);
    if (match) trackEvent(match[1], 'click');
  });

  // 2) 개별 서비스 페이지 방문 시 뷰 카운트
  //    URL 패턴: /dunsmile/{serviceId}/
  var pageMatch = location.pathname.match(/\/dunsmile\/([a-z0-9-]+)\//);
  if (pageMatch) {
    // DOMContentLoaded 이후 실행 (Firebase 초기화 보장)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        trackEvent(pageMatch[1], 'view');
      });
    } else {
      trackEvent(pageMatch[1], 'view');
    }
  }
})();
