const BALANCE_QUESTIONS = [
  { id: "q1", question: "평생 야식 먹기 vs 평생 디저트 먹기", optionA: "평생 야식", optionB: "평생 디저트" },
  { id: "q2", question: "연봉 2배 vs 휴가 2배", optionA: "연봉 2배", optionB: "휴가 2배" },
  { id: "q3", question: "평생 여름 vs 평생 겨울", optionA: "평생 여름", optionB: "평생 겨울" },
  { id: "q4", question: "카페인 무제한 vs 당분 무제한", optionA: "카페인 무제한", optionB: "당분 무제한" },
  { id: "q5", question: "주 4일 근무 vs 매일 6시간 근무", optionA: "주 4일 근무", optionB: "매일 6시간 근무" },
  { id: "q6", question: "SNS 1년 금지 vs 배달음식 1년 금지", optionA: "SNS 1년 금지", optionB: "배달음식 1년 금지" }
];

const BALANCE_STORAGE_KEY = "hoxy_balance_votes";
let currentQuestion = null;
let selectedOption = null;

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

function getVoteStore() {
  try {
    return JSON.parse(localStorage.getItem(BALANCE_STORAGE_KEY) || "{}");
  } catch (error) {
    return {};
  }
}

function saveVoteStore(store) {
  localStorage.setItem(BALANCE_STORAGE_KEY, JSON.stringify(store));
}

function ensureQuestionBucket(questionId) {
  const store = getVoteStore();
  if (!store[questionId]) {
    store[questionId] = { A: 12, B: 12 };
  }
  saveVoteStore(store);
  return store[questionId];
}

function loadQuestion(nextIndex = null) {
  const index = typeof nextIndex === "number"
    ? nextIndex
    : Math.floor(Math.random() * BALANCE_QUESTIONS.length);
  currentQuestion = BALANCE_QUESTIONS[index];
  selectedOption = null;

  document.getElementById("questionText").textContent = currentQuestion.question;
  document.getElementById("optionAText").textContent = currentQuestion.optionA;
  document.getElementById("optionBText").textContent = currentQuestion.optionB;

  document.getElementById("optionAButton").classList.remove("ring-2", "ring-orange-400");
  document.getElementById("optionBButton").classList.remove("ring-2", "ring-rose-400");
  document.getElementById("resultCard").classList.add("hidden");
}

function updateResultView() {
  if (!currentQuestion || !selectedOption) return;
  const bucket = ensureQuestionBucket(currentQuestion.id);
  const total = bucket.A + bucket.B;
  const aPercent = Math.round((bucket.A / total) * 100);
  const bPercent = 100 - aPercent;

  document.getElementById("resultALabel").textContent = currentQuestion.optionA;
  document.getElementById("resultBLabel").textContent = currentQuestion.optionB;
  document.getElementById("resultAPercent").textContent = `${aPercent}%`;
  document.getElementById("resultBPercent").textContent = `${bPercent}%`;
  document.getElementById("resultABar").style.width = `${aPercent}%`;
  document.getElementById("resultBBar").style.width = `${bPercent}%`;
  document.getElementById("selectedBadge").textContent = selectedOption === "A"
    ? `내 선택: ${currentQuestion.optionA}`
    : `내 선택: ${currentQuestion.optionB}`;
  document.getElementById("resultCard").classList.remove("hidden");
}

function chooseOption(option) {
  if (!currentQuestion) return;
  selectedOption = option;

  const store = getVoteStore();
  if (!store[currentQuestion.id]) {
    store[currentQuestion.id] = { A: 12, B: 12 };
  }
  store[currentQuestion.id][option] += 1;
  saveVoteStore(store);

  document.getElementById("optionAButton").classList.toggle("ring-2", option === "A");
  document.getElementById("optionAButton").classList.toggle("ring-orange-400", option === "A");
  document.getElementById("optionBButton").classList.toggle("ring-2", option === "B");
  document.getElementById("optionBButton").classList.toggle("ring-rose-400", option === "B");

  updateResultView();
}

function nextQuestion() {
  if (!currentQuestion) {
    loadQuestion();
    return;
  }
  const currentIndex = BALANCE_QUESTIONS.findIndex(item => item.id === currentQuestion.id);
  loadQuestion((currentIndex + 1) % BALANCE_QUESTIONS.length);
}

function shareResult() {
  if (!currentQuestion || !selectedOption) {
    showToast("먼저 하나를 선택해주세요!");
    return;
  }

  const picked = selectedOption === "A" ? currentQuestion.optionA : currentQuestion.optionB;
  const shareUrl = `${window.location.origin}/dunsmile/balance-game/`;
  const text = `오늘의 밸런스 게임: "${currentQuestion.question}" 나는 "${picked}" 선택! 너는 뭐야?`;

  if (navigator.share) {
    navigator.share({
      title: "오늘의 밸런스 게임",
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

async function downloadBalanceShareCard() {
  if (!currentQuestion || !selectedOption) {
    showToast("먼저 하나를 선택해주세요!");
    return;
  }
  if (!window.DopaminShareCard) {
    showToast("공유 카드 기능을 불러오지 못했습니다");
    return;
  }

  const bucket = ensureQuestionBucket(currentQuestion.id);
  const total = bucket.A + bucket.B;
  const aPercent = Math.round((bucket.A / total) * 100);
  const bPercent = 100 - aPercent;

  await window.DopaminShareCard.download({
    title: "오늘의 밸런스 게임",
    subtitle: currentQuestion.question,
    highlight: selectedOption === "A"
      ? `${currentQuestion.optionA} (${aPercent}%)`
      : `${currentQuestion.optionB} (${bPercent}%)`,
    tags: [
      "도파민선택",
      selectedOption === "A" ? currentQuestion.optionA : currentQuestion.optionB
    ],
    footer: "dopamine-factory.pages.dev/dunsmile/balance-game/",
    fromColor: "#fb923c",
    toColor: "#f43f5e",
    filePrefix: "balance-game"
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

window.chooseOption = chooseOption;
window.nextQuestion = nextQuestion;
window.shareResult = shareResult;
window.downloadBalanceShareCard = downloadBalanceShareCard;
window.openServiceMenu = openServiceMenu;
window.closeServiceMenu = closeServiceMenu;
window.openSettings = openSettings;
window.closeSettings = closeSettings;

loadQuestion(0);
