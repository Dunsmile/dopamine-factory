/* 신규 테스트 러너 엔진 */
(function initServiceLab() {
  const app = document.getElementById("serviceApp");
  const titleEl = document.getElementById("aboutTitle");
  const defaultContent = document.getElementById("aboutDefaultContent");
  if (!app || !titleEl || !defaultContent) return;

  const serviceId = new URLSearchParams(window.location.search).get("service");
  const runner = (window.SERVICE_RUNNERS || {})[serviceId || ""];
  if (!runner) return;

  defaultContent.classList.add("hidden");
  app.classList.remove("hidden");
  titleEl.textContent = runner.title;
  renderStart(app, runner);
})();

function createInitialState() {
  return { score: 0, dimensions: {} };
}

function normalizeOption(option, index) {
  if (typeof option === "string") return { label: option, value: index };
  return {
    label: option.label || `선택 ${index + 1}`,
    value: Number.isFinite(option.value) ? option.value : index,
    dimension: option.dimension || "",
    weight: Number.isFinite(option.weight) ? option.weight : 1,
  };
}

function nextState(current, option) {
  const state = { score: current.score + option.value, dimensions: { ...current.dimensions } };
  if (option.dimension) {
    state.dimensions[option.dimension] = (state.dimensions[option.dimension] || 0) + option.weight;
  }
  return state;
}

function resolveRunnerResult(runner, state) {
  if (Array.isArray(runner.profiles) && runner.profiles.length) {
    const scored = runner.profiles.map((profile) => {
      const match = profile.match || {};
      const profileScore = Object.keys(match).reduce((sum, key) => {
        const current = state.dimensions[key] || 0;
        return sum + Math.min(current, match[key]);
      }, 0);
      return { profile, score: profileScore };
    });
    scored.sort((a, b) => b.score - a.score);
    const selected = scored[0]?.profile || null;
    if (selected) {
      return {
        title: selected.title,
        insight: selected.insight || runner.insight,
        guide: Array.isArray(selected.guide) ? selected.guide : runner.guide || [],
      };
    }
  }

  const threshold = Math.floor((runner.questions || []).length / 2);
  const fallbackTitle = state.score > threshold ? runner.results?.[1] : runner.results?.[0];
  return { title: fallbackTitle || runner.title, insight: runner.insight, guide: runner.guide || [] };
}

function renderStart(root, runner) {
  root.innerHTML = `
    <section class="hoxy-lab-card hoxy-lab-card-start">
      <div class="hoxy-lab-copy">
        <p class="hoxy-lab-kicker">DOPAMINE LAB</p>
        <h2 class="hoxy-lab-title">${runner.title}</h2>
        <p class="hoxy-lab-subtitle">${runner.subtitle}</p>
      </div>
      <div class="hoxy-lab-meta">문항 ${(runner.questions || []).length}개 · 약 2분</div>
      <button id="labStartBtn" class="hoxy-lab-cta hoxy-lab-cta-primary">테스트 시작</button>
    </section>
  `;
  document.getElementById("labStartBtn")?.addEventListener("click", () => {
    renderQuestion(root, runner, 0, createInitialState());
  });
}

function renderQuestion(root, runner, index, state) {
  const item = runner.questions?.[index];
  if (!item) {
    renderResult(root, runner, state);
    return;
  }

  const options = (item.options || []).map((option, i) => normalizeOption(option, i));
  root.innerHTML = `
    <section class="hoxy-lab-card hoxy-lab-card-question">
      <p class="hoxy-lab-progress">문항 ${index + 1} / ${runner.questions.length}</p>
      <h2 class="hoxy-lab-question-title">${item.title}</h2>
      <div class="hoxy-lab-answer-list">
        ${options.map((option, i) => `<button data-index="${i}" class="hoxy-lab-answer">${option.label}</button>`).join("")}
      </div>
    </section>
  `;

  root.querySelectorAll(".hoxy-lab-answer").forEach((button) => {
    button.addEventListener("click", () => {
      const option = options[Number(button.dataset.index || 0)];
      renderQuestion(root, runner, index + 1, nextState(state, option));
    });
  });
}

function renderResult(root, runner, state) {
  const result = resolveRunnerResult(runner, state);
  const guideItems = (result.guide || []).map((item) => `<li>${item}</li>`).join("");
  const relatedLinks = (runner.related || []).map((id) => {
    const label = window.SERVICE_RUNNERS?.[id]?.title || (id || "").replaceAll("-", " ");
    return `<a href="/?play=${encodeURIComponent(id)}" class="hoxy-lab-related-link">${label}</a>`;
  }).join(" · ");

  root.innerHTML = `
    <section class="hoxy-lab-card hoxy-lab-result">
      <p class="hoxy-lab-kicker">결과 리포트</p>
      <h2 class="hoxy-lab-title">${result.title}</h2>
      <p class="hoxy-lab-subtitle">${result.insight || `${runner.title} 결과입니다. 선택 흐름을 기준으로 행동 패턴을 요약했어요.`}</p>
      <section class="hoxy-lab-guide">
        <h3 class="hoxy-lab-block-title">활용 가이드</h3>
        <ul class="hoxy-lab-guide-list">${guideItems}</ul>
      </section>
      <section class="hoxy-lab-related">
        <h3 class="hoxy-lab-block-title">관련 테스트</h3>
        <p class="hoxy-lab-related-text">${relatedLinks}</p>
      </section>
      <div class="hoxy-lab-cta-list">
        <a href="/" class="hoxy-lab-cta hoxy-lab-cta-primary">홈으로 이동</a>
        <button id="retryBtn" class="hoxy-lab-cta hoxy-lab-cta-outline">다시 테스트</button>
      </div>
    </section>
  `;
  document.getElementById("retryBtn")?.addEventListener("click", () => renderStart(root, runner));
}
