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
    scoreValue: document.getElementById("scoreValue"),
    mentionVolume: document.getElementById("mentionVolume"),
    scoreBar: document.getElementById("scoreBar"),
    updatedAt: document.getElementById("updatedAt"),
    keywords: document.getElementById("keywords"),
    historyLine: document.getElementById("historyLine"),
    historyDots: document.getElementById("historyDots"),
    historyLabels: document.getElementById("historyLabels"),
    pointCount: document.getElementById("pointCount"),
    posts: document.getElementById("posts"),
    refreshBtn: document.getElementById("refreshBtn"),
  };

  const statusClassMap = {
    EXTREME_FEAR: "bg-red-100 text-red-700",
    FEAR: "bg-orange-100 text-orange-700",
    NEUTRAL: "bg-gray-100 text-gray-700",
    GREED: "bg-emerald-100 text-emerald-700",
    EXTREME_GREED: "bg-teal-100 text-teal-700",
  };

  async function fetchJson(path) {
    const response = await fetch(`${API_BASE}${path}`);
    if (!response.ok) {
      throw new Error(`API ${response.status}`);
    }
    return response.json();
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

  function renderCurrent(current) {
    const score = Number(current.score || 50);
    const status = current.status || "NEUTRAL";

    el.scoreValue.textContent = String(score);
    el.mentionVolume.textContent = String(current.mentionVolume || 0);
    el.scoreBar.style.width = `${Math.max(0, Math.min(score, 100))}%`;
    el.updatedAt.textContent = `업데이트: ${new Date(current.updatedAt).toLocaleString("ko-KR")}`;

    el.statusBadge.className = "px-2.5 py-1 rounded-full text-xs font-bold";
    el.statusBadge.classList.add(...(statusClassMap[status] || statusClassMap.NEUTRAL).split(" "));
    el.statusBadge.textContent = status;

    const keywords = Array.isArray(current.topKeywords) ? current.topKeywords : [];
    el.keywords.innerHTML = keywords.length
      ? keywords
          .map(
            (keyword) =>
              `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">#${keyword}</span>`
          )
          .join("")
      : '<span class="text-sm text-gray-400">키워드 데이터가 아직 없습니다.</span>';
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
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ");

    el.historyLine.innerHTML = `
      <path d="${line}" fill="none" stroke="#0f766e" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"></path>
    `;

    coords.forEach((p) => {
      const dot = document.createElement("div");
      dot.className = "line-dot";
      dot.style.left = `${(p.x / width) * 100}%`;
      dot.style.top = `${(p.y / height) * 100}%`;
      dot.title = `${p.time} · ${p.score}`;
      el.historyDots.appendChild(dot);
    });

    const labelIndexes = [0, Math.floor(points.length / 2), points.length - 1];
    const uniqueIndexes = [...new Set(labelIndexes)];
    uniqueIndexes.forEach((idx) => {
      const label = document.createElement("span");
      label.textContent = String(points[idx].time || "-").slice(11, 16);
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

  function renderPosts(data) {
    const posts = Array.isArray(data.posts) ? data.posts : [];
    if (!posts.length) {
      el.posts.innerHTML = '<div class="text-sm text-gray-400">아직 수집된 게시글이 없습니다.</div>';
      return;
    }

    el.posts.innerHTML = posts
      .map((post) => {
        const title = escapeHtml(post.title || "제목 없음");
        const body = escapeHtml((post.body || "").slice(0, 180));
        const source = post.source === "dcinside" ? "디씨" : "펨코";
        const time = post.postedAt ? new Date(post.postedAt).toLocaleString("ko-KR") : "시간 미확인";
        const link = post.url ? `<a class="text-xs text-emerald-700 hover:underline" target="_blank" rel="noopener" href="${post.url}">원문 보기</a>` : "";

        return `
          <article class="rounded-xl border border-gray-100 p-3 bg-gray-50/70">
            <div class="flex items-center justify-between gap-3">
              <strong class="text-sm text-gray-900">${title}</strong>
              <span class="text-[11px] px-2 py-0.5 rounded-full bg-white border text-gray-600">${source}</span>
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
    renderHistory(history);
    renderPosts(posts);
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
