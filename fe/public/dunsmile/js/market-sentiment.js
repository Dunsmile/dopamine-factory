(function marketSentimentPage() {
  const API_BASE = window.MARKET_API_BASE || "";

  const state = {
    asset: "BTC",
    assets: [],
    timer: null,
  };

  const el = {
    assetSelect: document.getElementById("assetSelect"),
    statusBadge: document.getElementById("statusBadge"),
    marketHeartbeat: document.getElementById("marketHeartbeat"),
    heartbeatMeta: document.getElementById("heartbeatMeta"),
    scoreValue: document.getElementById("scoreValue"),
    mentionVolume: document.getElementById("mentionVolume"),
    scoreBar: document.getElementById("scoreBar"),
    updatedAt: document.getElementById("updatedAt"),
    momentumValue: document.getElementById("momentumValue"),
    momentumLabel: document.getElementById("momentumLabel"),
    momentumVolume: document.getElementById("momentumVolume"),
    keywords: document.getElementById("keywords"),
    keywordWar: document.getElementById("keywordWar"),
    pumpAlert: document.getElementById("pumpAlert"),
    historyLine: document.getElementById("historyLine"),
    historyDots: document.getElementById("historyDots"),
    historyLabels: document.getElementById("historyLabels"),
    pointCount: document.getElementById("pointCount"),
    posts: document.getElementById("posts"),
    feedMeta: document.getElementById("feedMeta"),
    refreshBtn: document.getElementById("refreshBtn"),
  };

  const statusClassMap = {
    EXTREME_FEAR: "bg-red-100 text-red-700",
    FEAR: "bg-orange-100 text-orange-700",
    NEUTRAL: "bg-gray-100 text-gray-700",
    GREED: "bg-emerald-100 text-emerald-700",
    EXTREME_GREED: "bg-teal-100 text-teal-700",
  };

  const sourceLabelMap = {
    dcinside: "디씨",
    fmkorea: "펨코",
    reddit: "레딧",
    youtube: "유튜브",
  };

  const sourceBadgeMap = {
    dcinside: "bg-indigo-50 border-indigo-200 text-indigo-700",
    fmkorea: "bg-sky-50 border-sky-200 text-sky-700",
    reddit: "bg-orange-50 border-orange-200 text-orange-700",
    youtube: "bg-rose-50 border-rose-200 text-rose-700",
  };

  async function fetchJson(path) {
    const response = await fetch(`${API_BASE}${path}`);
    if (!response.ok) {
      throw new Error(`API ${response.status}`);
    }
    return response.json();
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function formatKoreanDate(value) {
    const date = new Date(value || "");
    if (Number.isNaN(date.getTime())) {
      return "-";
    }
    return date.toLocaleString("ko-KR");
  }

  function formatSign(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return "--";
    }
    if (numeric > 0) {
      return `+${numeric.toFixed(1)}`;
    }
    return numeric.toFixed(1);
  }

  function formatRelativeTime(value) {
    const date = new Date(value || "");
    if (Number.isNaN(date.getTime())) {
      return "시간 미확인";
    }
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / (60 * 1000));
    if (diffMin < 1) {
      return "방금 전";
    }
    if (diffMin < 60) {
      return `${diffMin}분 전`;
    }
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) {
      return `${diffHour}시간 전`;
    }
    return `${Math.floor(diffHour / 24)}일 전`;
  }

  function parseTimeMs(value) {
    const ms = new Date(value || "").getTime();
    return Number.isFinite(ms) ? ms : null;
  }

  function renderAssets(assets) {
    el.assetSelect.innerHTML = "";
    assets.forEach((asset) => {
      const option = document.createElement("option");
      option.value = asset.symbol;
      option.textContent = `${asset.symbol} · ${asset.name}`;
      el.assetSelect.appendChild(option);
    });
    el.assetSelect.value = state.asset;
  }

  function buildSourceSummary(sourceBreakdown) {
    const entries = Object.entries(sourceBreakdown || {})
      .map(([source, count]) => ({ source, count: Number(count || 0) }))
      .filter((entry) => entry.count > 0)
      .sort((a, b) => b.count - a.count);

    if (!entries.length) {
      return "수집 소스 없음";
    }

    return entries
      .slice(0, 3)
      .map((entry) => `${sourceLabelMap[entry.source] || entry.source} ${entry.count}`)
      .join(" · ");
  }

  function renderCurrent(current) {
    const score = Number(current.score || 50);
    const status = current.status || "NEUTRAL";
    const mentionVolume = Number(current.mentionVolume || 0);

    el.marketHeartbeat.textContent = String(Math.round(score));
    el.scoreValue.textContent = `감성 점수: ${Math.round(score)}`;
    el.mentionVolume.textContent = String(mentionVolume);
    el.scoreBar.style.width = `${clamp(score, 0, 100)}%`;
    el.updatedAt.textContent = `업데이트: ${formatKoreanDate(current.updatedAt)}`;
    el.heartbeatMeta.textContent = `${status} · ${buildSourceSummary(current.sourceBreakdown)}`;

    el.statusBadge.className = "px-2.5 py-1 rounded-full text-xs font-bold";
    el.statusBadge.classList.add(...(statusClassMap[status] || statusClassMap.NEUTRAL).split(" "));
    el.statusBadge.textContent = status;

    const keywords = Array.isArray(current.topKeywords) ? current.topKeywords : [];
    el.keywords.innerHTML = keywords.length
      ? keywords
          .map(
            (keyword) =>
              `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">#${escapeHtml(keyword)}</span>`
          )
          .join("")
      : '<span class="text-sm text-gray-400">키워드 데이터가 아직 없습니다.</span>';
  }

  function renderMomentum(history) {
    const points = Array.isArray(history.points) ? history.points : [];
    if (points.length < 2) {
      el.momentumValue.textContent = "--";
      el.momentumValue.className = "text-4xl font-black text-gray-900";
      el.momentumLabel.textContent = "비교 데이터 부족";
      el.momentumVolume.textContent = "언급량 변화: -";
      return { delta: null, volumeDelta: null, latestVolume: 0 };
    }

    const latest = points[points.length - 1];
    const latestMs = parseTimeMs(latest.time);
    if (!latestMs) {
      el.momentumValue.textContent = "--";
      el.momentumLabel.textContent = "비교 데이터 부족";
      el.momentumVolume.textContent = "언급량 변화: -";
      return { delta: null, volumeDelta: null, latestVolume: Number(latest.volume || 0) };
    }

    const thresholdMs = latestMs - 15 * 60 * 1000;
    let baseline = null;
    for (let index = points.length - 2; index >= 0; index -= 1) {
      const candidate = points[index];
      const candidateMs = parseTimeMs(candidate.time);
      if (!candidateMs) {
        continue;
      }
      baseline = candidate;
      if (candidateMs <= thresholdMs) {
        break;
      }
    }

    baseline = baseline || points[Math.max(0, points.length - 2)];
    const delta = Number(latest.score || 50) - Number(baseline.score || 50);
    const volumeDelta = Number(latest.volume || 0) - Number(baseline.volume || 0);

    el.momentumValue.textContent = `${formatSign(delta)}p`;
    el.momentumValue.className = `text-4xl font-black ${
      delta >= 4 ? "text-red-600" : delta <= -4 ? "text-blue-600" : "text-gray-900"
    }`;

    if (delta >= 4) {
      el.momentumLabel.textContent = "단기 급등 구간";
    } else if (delta <= -4) {
      el.momentumLabel.textContent = "단기 급락 구간";
    } else {
      el.momentumLabel.textContent = "변화 미미";
    }

    el.momentumVolume.textContent = `언급량 변화: ${formatSign(volumeDelta)}`;
    return { delta, volumeDelta, latestVolume: Number(latest.volume || 0) };
  }

  function renderHistory(history) {
    const points = Array.isArray(history.points) ? history.points : [];
    el.pointCount.textContent = `${points.length} points`;
    el.historyDots.innerHTML = "";
    el.historyLine.innerHTML = "";
    el.historyLabels.innerHTML = "";

    if (!points.length) {
      el.historyLabels.innerHTML = '<span class="text-xs text-gray-400">데이터가 없습니다.</span>';
      return;
    }

    const width = 1000;
    const height = 240;
    const padX = 28;
    const padY = 22;
    const spanX = width - padX * 2;
    const spanY = height - padY * 2;

    const coords = points.map((point, index) => {
      const x = points.length === 1 ? width / 2 : padX + (index / (points.length - 1)) * spanX;
      const score = Number(point.score || 50);
      const y = padY + ((100 - score) / 100) * spanY;
      return { x, y, score, time: point.time };
    });

    const line = coords
      .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
      .join(" ");

    el.historyLine.innerHTML = `<path d="${line}" fill="none" stroke="#0f766e" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"></path>`;

    coords.forEach((point) => {
      const dot = document.createElement("div");
      dot.className = "line-dot";
      dot.style.left = `${(point.x / width) * 100}%`;
      dot.style.top = `${(point.y / height) * 100}%`;
      dot.title = `${point.time} · ${point.score}`;
      el.historyDots.appendChild(dot);
    });

    const labelIndexes = [0, Math.floor(points.length / 2), points.length - 1];
    const uniqueIndexes = [...new Set(labelIndexes)];
    uniqueIndexes.forEach((index) => {
      const label = document.createElement("span");
      label.textContent = String(points[index].time || "-").slice(11, 16);
      el.historyLabels.appendChild(label);
    });
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function buildKeywordWarData(current, posts) {
    const keywordCandidates = Array.isArray(current.topKeywords) ? current.topKeywords.filter(Boolean) : [];
    const fallback = ["반등", "나락", "롱", "숏"];
    const keywords = (keywordCandidates.length ? keywordCandidates : fallback).slice(0, 6);
    const textPool = (posts || []).map((post) => `${post.title || ""} ${post.body || ""}`.toLowerCase());

    const weighted = keywords.map((keyword) => {
      const normalized = String(keyword).toLowerCase();
      const score = textPool.reduce((acc, text) => acc + (text.includes(normalized) ? 1 : 0), 0);
      return { keyword, score: score || 1 };
    });

    weighted.sort((a, b) => b.score - a.score);
    const left = weighted[0] || { keyword: "반등", score: 1 };
    const right = weighted[1] || { keyword: "나락", score: 1 };
    const total = left.score + right.score || 1;

    return {
      left,
      right,
      leftPct: Math.round((left.score / total) * 100),
      rightPct: Math.round((right.score / total) * 100),
    };
  }

  function renderKeywordWar(data) {
    if (!data) {
      el.keywordWar.innerHTML = '<div class="text-sm text-gray-400">키워드 데이터가 아직 없습니다.</div>';
      return;
    }

    el.keywordWar.innerHTML = `
      <div class="flex items-center justify-between text-sm font-bold text-gray-800">
        <span>#${escapeHtml(data.left.keyword)}</span>
        <span class="text-xs text-gray-500">VS</span>
        <span>#${escapeHtml(data.right.keyword)}</span>
      </div>
      <div class="h-3 rounded-full bg-gray-100 overflow-hidden flex">
        <div class="h-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all duration-500" style="width:${data.leftPct}%"></div>
        <div class="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500" style="width:${data.rightPct}%"></div>
      </div>
      <div class="flex items-center justify-between text-xs text-gray-500">
        <span>${data.left.score} vote</span>
        <span>${data.right.score} vote</span>
      </div>
    `;
  }

  function buildPumpAlertData(current, momentum, history) {
    const mention = Number(current.mentionVolume || 0);
    const score = Number(current.score || 50);
    const delta = Number(momentum.delta || 0);
    const points = Array.isArray(history.points) ? history.points : [];

    const recentVolumes = points.slice(-7, -1).map((point) => Number(point.volume || 0)).filter((v) => Number.isFinite(v));
    const avgRecentVolume = recentVolumes.length
      ? recentVolumes.reduce((sum, value) => sum + value, 0) / recentVolumes.length
      : 0;
    const volumeJump = avgRecentVolume > 0 ? mention / avgRecentVolume : mention >= 6 ? 2 : 1;

    if (delta >= 8 && mention >= 4 && volumeJump >= 1.3) {
      return {
        active: true,
        className: "bg-rose-50 border-rose-200 text-rose-700",
        title: "펌프 감지",
        message: `15분 +${delta.toFixed(1)}p · 언급량 급증(${mention})`,
      };
    }

    if (score >= 75 && delta >= 5 && mention >= 6) {
      return {
        active: true,
        className: "bg-amber-50 border-amber-200 text-amber-700",
        title: "과열 경보",
        message: `탐욕 구간 진입 · 변동성 확대(${mention})`,
      };
    }

    if (delta <= -8 && mention >= 4) {
      return {
        active: true,
        className: "bg-sky-50 border-sky-200 text-sky-700",
        title: "역방향 급락 경보",
        message: `15분 ${delta.toFixed(1)}p · 공포 반응 증가(${mention})`,
      };
    }

    return { active: false };
  }

  function renderPumpAlert(data) {
    if (!data || !data.active) {
      el.pumpAlert.className = "hidden rounded-2xl border px-4 py-3 text-sm font-semibold";
      el.pumpAlert.textContent = "";
      return;
    }

    el.pumpAlert.className = `rounded-2xl border px-4 py-3 text-sm font-semibold ${data.className}`;
    el.pumpAlert.textContent = `${data.title} · ${data.message}`;
  }

  function renderPosts(data, sourceBreakdown) {
    const posts = Array.isArray(data.posts) ? data.posts : [];
    const activeSources = Object.entries(sourceBreakdown || {})
      .filter(([, count]) => Number(count || 0) > 0)
      .map(([source]) => sourceLabelMap[source] || source);

    el.feedMeta.textContent = activeSources.length
      ? `활성 소스: ${activeSources.join(" · ")}`
      : "수집 소스 준비 중";

    if (!posts.length) {
      el.posts.innerHTML = '<div class="text-sm text-gray-400">아직 수집된 게시글이 없습니다.</div>';
      return;
    }

    el.posts.innerHTML = posts
      .map((post, index) => {
        const title = escapeHtml(post.title || "제목 없음");
        const body = escapeHtml((post.body || "").slice(0, 180));
        const source = sourceLabelMap[post.source] || post.source || "커뮤니티";
        const badgeClass = sourceBadgeMap[post.source] || "bg-gray-50 border-gray-200 text-gray-700";
        const postedAt = post.postedAt || post.collectedAt;
        const time = formatRelativeTime(postedAt);
        const link = post.url
          ? `<a class="text-xs text-emerald-700 hover:underline" target="_blank" rel="noopener" href="${post.url}">원문 보기</a>`
          : "";
        const liveFlag = index < 2 ? '<span class="text-[10px] font-black text-rose-600">LIVE</span>' : "";

        return `
          <article class="feed-card rounded-xl border border-gray-100 p-3 bg-gray-50/70" style="animation-delay:${Math.min(index * 0.05, 0.35)}s">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2 min-w-0">
                ${liveFlag}
                <strong class="text-sm text-gray-900 truncate">${title}</strong>
              </div>
              <span class="text-[11px] px-2 py-0.5 rounded-full border ${badgeClass}">${source}</span>
            </div>
            <p class="mt-1 text-xs text-gray-600 leading-relaxed">${body || "본문 없음"}</p>
            <div class="mt-2 flex items-center justify-between">
              <span class="text-[11px] text-gray-500">${time}</span>
              ${link}
            </div>
          </article>
        `;
      })
      .join("");
  }

  async function loadAll() {
    const symbol = state.asset;
    const [current, history, posts] = await Promise.all([
      fetchJson(`/api/market/sentiment/current?asset=${encodeURIComponent(symbol)}`),
      fetchJson(`/api/market/sentiment/history?asset=${encodeURIComponent(symbol)}&period=24h`),
      fetchJson(`/api/market/posts?asset=${encodeURIComponent(symbol)}&limit=30`),
    ]);

    renderCurrent(current);
    const momentum = renderMomentum(history);
    renderHistory(history);
    renderKeywordWar(buildKeywordWarData(current, posts.posts || []));
    renderPumpAlert(buildPumpAlertData(current, momentum, history));
    renderPosts(posts, current.sourceBreakdown || {});
  }

  async function init() {
    try {
      const assetsResponse = await fetchJson("/api/market/assets");
      state.assets = assetsResponse.assets || [];

      if (state.assets.length > 0) {
        const hasDefault = state.assets.some((asset) => asset.symbol === state.asset);
        if (!hasDefault) {
          state.asset = state.assets[0].symbol;
        }
      }

      renderAssets(state.assets);
      await loadAll();

      if (state.timer) {
        clearInterval(state.timer);
      }
      state.timer = setInterval(loadAll, 60 * 1000);
    } catch (error) {
      el.posts.innerHTML = `<div class="text-sm text-red-500">데이터를 불러오지 못했습니다: ${String(error)}</div>`;
      renderPumpAlert({ active: false });
    }
  }

  el.assetSelect.addEventListener("change", async (event) => {
    const target = event.target;
    state.asset = target.value;
    await loadAll();
  });

  el.refreshBtn.addEventListener("click", loadAll);

  function openServiceMenu() {
    const backdrop = document.getElementById("serviceMenuBackdrop");
    const sidebar = document.getElementById("serviceMenuSidebar");
    if (backdrop && sidebar) {
      backdrop.classList.remove("hidden");
      sidebar.classList.remove("-translate-x-full");
    }
  }

  function closeServiceMenu() {
    const backdrop = document.getElementById("serviceMenuBackdrop");
    const sidebar = document.getElementById("serviceMenuSidebar");
    if (backdrop && sidebar) {
      backdrop.classList.add("hidden");
      sidebar.classList.add("-translate-x-full");
    }
  }

  window.openServiceMenu = openServiceMenu;
  window.closeServiceMenu = closeServiceMenu;

  init();
})();
