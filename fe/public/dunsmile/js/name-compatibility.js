const NAME_TYPES = [
  {
    min: 85,
    type: "찰떡 케미 타입",
    desc: "서로의 텐션과 대화 속도가 잘 맞고, 함께 있을수록 시너지가 커지는 조합입니다.",
    tags: ["텐션합", "대화맛집", "합동도파민"]
  },
  {
    min: 70,
    type: "안정 밸런스 타입",
    desc: "한쪽이 흐트러질 때 다른 쪽이 균형을 잡아주는 안정적인 조합입니다.",
    tags: ["균형감", "신뢰감", "장기케미"]
  },
  {
    min: 55,
    type: "성장형 케미 타입",
    desc: "초반에는 다를 수 있지만 서로를 알아갈수록 좋은 합을 만드는 조합입니다.",
    tags: ["발전형", "상호보완", "점진상승"]
  },
  {
    min: 0,
    type: "스파크 챌린저 타입",
    desc: "다름이 강한 조합이라 자극은 크지만, 배려와 룰 설정이 중요합니다.",
    tags: ["강한개성", "자극형", "룰필요"]
  }
];

let latestResult = null;

function showToast(message, duration = 2000) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");
  if (!toast || !toastMessage) return;

  toastMessage.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getTypeByScore(score) {
  return NAME_TYPES.find(item => score >= item.min) || NAME_TYPES[NAME_TYPES.length - 1];
}

function runCompatibility() {
  const nameA = document.getElementById("nameA").value.trim();
  const nameB = document.getElementById("nameB").value.trim();

  if (!nameA || !nameB) {
    showToast("두 이름을 모두 입력해주세요");
    return;
  }
  if (nameA.length < 2 || nameB.length < 2) {
    showToast("이름은 2글자 이상 입력해주세요");
    return;
  }

  const key = `${nameA}:${nameB}`.toLowerCase();
  const base = hashString(key);
  const score = 45 + (base % 56);
  const typeInfo = getTypeByScore(score);

  latestResult = {
    nameA,
    nameB,
    score,
    type: typeInfo.type,
    desc: typeInfo.desc,
    tags: typeInfo.tags
  };

  document.getElementById("resultPair").textContent = `${nameA} ♥ ${nameB}`;
  document.getElementById("resultScore").textContent = String(score);
  document.getElementById("resultType").textContent = typeInfo.type;
  document.getElementById("resultDesc").textContent = typeInfo.desc;

  const tagsHtml = typeInfo.tags.map(tag => {
    return `<span class="text-xs font-semibold px-2 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">#${tag}</span>`;
  }).join("");
  document.getElementById("resultTags").innerHTML = tagsHtml;
  document.getElementById("resultCard").classList.remove("hidden");
}

function shareResult() {
  if (!latestResult) {
    showToast("먼저 궁합 결과를 확인해주세요");
    return;
  }

  const shareUrl = `${window.location.origin}/dunsmile/name-compatibility/`;
  const text = `${latestResult.nameA} ♥ ${latestResult.nameB} 궁합 ${latestResult.score}점! (${latestResult.type})`;

  if (navigator.share) {
    navigator.share({
      title: "이름 궁합 테스트",
      text,
      url: shareUrl
    }).catch(() => {});
    return;
  }

  navigator.clipboard.writeText(`${text} ${shareUrl}`).then(() => {
    showToast("결과 링크가 복사되었습니다!");
  }).catch(() => {
    showToast("공유를 지원하지 않는 브라우저입니다");
  });
}

async function downloadNameShareCard() {
  if (!latestResult) {
    showToast("먼저 궁합 결과를 확인해주세요");
    return;
  }
  if (!window.DopaminShareCard) {
    showToast("공유 카드 기능을 불러오지 못했습니다");
    return;
  }

  await window.DopaminShareCard.download({
    title: "이름 궁합 테스트",
    subtitle: `${latestResult.nameA} ♥ ${latestResult.nameB}`,
    highlight: `${latestResult.score}점 · ${latestResult.type}`,
    tags: latestResult.tags,
    footer: "dopamine-factory.pages.dev/dunsmile/name-compatibility/",
    fromColor: "#0ea5e9",
    toColor: "#06b6d4",
    filePrefix: "name-compatibility"
  });
  showToast("결과 이미지 카드가 저장되었습니다!");
}

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

function openSettings() {
  const modal = document.getElementById("settingsModal");
  if (modal) modal.classList.add("active");
}

function closeSettings() {
  const modal = document.getElementById("settingsModal");
  if (modal) modal.classList.remove("active");
}

window.runCompatibility = runCompatibility;
window.shareResult = shareResult;
window.downloadNameShareCard = downloadNameShareCard;
window.openServiceMenu = openServiceMenu;
window.closeServiceMenu = closeServiceMenu;
window.openSettings = openSettings;
window.closeSettings = closeSettings;
