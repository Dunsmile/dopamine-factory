const BALANCE_QUESTIONS = buildBalanceQuestions();

function buildBalanceQuestions() {
  const fixed = [
    pair("평생 야식 먹기", "평생 디저트 먹기"),
    pair("연봉 2배", "휴가 2배"),
    pair("평생 여름", "평생 겨울"),
    pair("카페인 무제한", "당분 무제한"),
    pair("주 4일 근무", "매일 6시간 근무"),
    pair("SNS 1년 금지", "배달음식 1년 금지"),
    pair("주식 단타", "장기 적립식"),
    pair("집순이/집돌이", "밖순이/밖돌이"),
    pair("메신저 장문", "통화 10분"),
    pair("아침 운동", "저녁 운동"),
  ];

  const scenarioPairs = [
    pair("퇴근 후 약속", "퇴근 후 혼자 충전"),
    pair("주말은 외출", "주말은 집콕"),
    pair("여행은 즉흥", "여행은 계획형"),
    pair("회의는 짧고 자주", "회의는 길고 집중"),
    pair("SNS로 소통", "직접 만나 소통"),
    pair("한 번에 몰입", "짧게 자주 분할"),
    pair("완성도 우선", "속도 우선"),
    pair("혼자 결정", "주변 의견 반영"),
    pair("도전형 투자", "안정형 저축"),
    pair("아침형 루틴", "야행형 루틴"),
    pair("운동 먼저", "식단 먼저"),
    pair("메모로 정리", "대화로 정리"),
    pair("큰 목표 1개", "작은 목표 여러 개"),
    pair("새로운 사람 만나기", "기존 관계 깊게"),
    pair("영상으로 학습", "문서로 학습"),
  ];
  const deepScenarioPairs = [
    pair("목표를 공개 선언", "조용히 실행"),
    pair("아이디어 먼저 공유", "초안 완성 후 공유"),
    pair("한 분야 깊게", "여러 분야 넓게"),
    pair("즉시 피드백 요청", "스스로 점검 후 요청"),
    pair("도시 여행", "자연 여행"),
    pair("취미를 수집", "취미를 집중"),
    pair("아침 뉴스 확인", "저녁 요약 확인"),
    pair("할 일 앱 관리", "노트 수기 관리"),
    pair("선택은 직감", "선택은 데이터"),
    pair("주도적으로 리드", "보조로 완성"),
    pair("대형 프로젝트 선호", "단기 프로젝트 선호"),
    pair("상세 계획부터", "일단 실행부터"),
    pair("문제는 즉시 해결", "원인 분석 후 해결"),
    pair("경험에 투자", "자산에 투자"),
    pair("혼밥 선호", "함께 식사 선호"),
    pair("새 앱 바로 설치", "검증 후 설치"),
    pair("콘텐츠 소비", "콘텐츠 제작"),
    pair("운동은 강도 중심", "운동은 꾸준함 중심"),
    pair("기록은 숫자 중심", "기록은 감정 중심"),
    pair("성공 사례 참고", "실패 사례 참고"),
    pair("협업 먼저", "개인 작업 먼저"),
    pair("새로운 툴 빠르게 도입", "기존 툴 최적화"),
    pair("의견 충돌을 환영", "의견 조율을 우선"),
    pair("오늘 할 일 3개", "이번 주 목표 1개"),
    pair("작게 자주 휴식", "길게 한 번 휴식"),
  ];
  const topicPairs = buildTopicPairs();
  const all = [...fixed, ...topicPairs, ...scenarioPairs, ...deepScenarioPairs].slice(0, 100);
  return all.map((item, index) => ({ id: `q${index + 1}`, ...item }));
}

function pair(optionA, optionB) {
  return {
    question: `${optionA} vs ${optionB}`,
    optionA,
    optionB,
  };
}

function pairByContext(question, optionA, optionB) {
  return {
    question,
    optionA,
    optionB,
  };
}

function buildTopicPairs() {
  const topics = ["커피", "영화", "게임", "여행", "식단", "운동", "연애", "직장", "쇼핑", "공부"];
  const choices = [
    { suffix: "시작 방식은?", a: "바로 시작하기", b: "미리 계획 세우기" },
    { suffix: "진행 스타일은?", a: "혼자 깊게 즐기기", b: "함께 즐기기" },
    { suffix: "시간 배분은?", a: "짧게 자주 하기", b: "길게 몰아서 하기" },
    { suffix: "기록 습관은?", a: "기록 남기기", b: "기억에 맡기기" },
    { suffix: "선호 루틴은?", a: "새로운 방식 시도", b: "익숙한 방식 유지" },
  ];

  const pairs = [];
  topics.forEach((topic) => {
    choices.forEach((choice) => {
      pairs.push(pairByContext(`${topic} ${choice.suffix}`, choice.a, choice.b));
    });
  });
  return pairs;
}

const MARKET_SENTIMENT_ROUTE = "/dunsmile/market-sentiment/";
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
  if (backdrop && sidebar) { backdrop.classList.add("open"); sidebar.classList.add("open"); }
}

function closeServiceMenu() {
  const backdrop = document.getElementById("serviceMenuBackdrop");
  const sidebar = document.getElementById("serviceMenuSidebar");
  if (backdrop && sidebar) { backdrop.classList.remove("open"); sidebar.classList.remove("open"); }
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
