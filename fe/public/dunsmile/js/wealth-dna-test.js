const WEALTH_DNA_QUESTIONS = [
  {
    id: 'q1',
    text: '보너스 500만원이 생기면 먼저 무엇을 하나요?',
    optionA: { text: '새 투자 기회를 바로 찾는다', letter: 'R' },
    optionB: { text: '안전 자산으로 먼저 분산한다', letter: 'S' },
  },
  {
    id: 'q2',
    text: '새로운 수익 아이디어가 떠오르면?',
    optionA: { text: '작게라도 바로 실행해본다', letter: 'A' },
    optionB: { text: '충분히 검토한 뒤 시작한다', letter: 'C' },
  },
  {
    id: 'q3',
    text: '재테크 정보는 주로 어디서 얻나요?',
    optionA: { text: '사람들과 대화/커뮤니티로 얻는다', letter: 'N' },
    optionB: { text: '리포트/책/데이터를 깊게 본다', letter: 'D' },
  },
  {
    id: 'q4',
    text: '자산 운용의 핵심 목표는?',
    optionA: { text: '크게 성장할 가능성 확보', letter: 'G' },
    optionB: { text: '원금 보존과 안정성 유지', letter: 'P' },
  },
  {
    id: 'q5',
    text: '시장 하락장이 오면 어떤가요?',
    optionA: { text: '기회를 찾아 추가 매수한다', letter: 'R' },
    optionB: { text: '현금 비중을 먼저 높인다', letter: 'S' },
  },
  {
    id: 'q6',
    text: '월급이 들어오면 자산관리 방식은?',
    optionA: { text: '자동 투자/자동 실행을 돌린다', letter: 'A' },
    optionB: { text: '매달 계획표를 점검 후 배분한다', letter: 'C' },
  },
  {
    id: 'q7',
    text: '새 사업 아이디어를 평가할 때는?',
    optionA: { text: '사람의 역량과 팀 시너지를 본다', letter: 'N' },
    optionB: { text: '숫자와 손익 구조를 먼저 본다', letter: 'D' },
  },
  {
    id: 'q8',
    text: '10년 뒤 목표 자산 계획은?',
    optionA: { text: '공격적 성장 시나리오로 설계', letter: 'G' },
    optionB: { text: '안정적 복리 시나리오로 설계', letter: 'P' },
  },
];

const WEALTH_DIMENSIONS = [
  ['R', 'S'],
  ['A', 'C'],
  ['N', 'D'],
  ['G', 'P'],
];

const WEALTH_PROFILE_MAP = {
  RANG: { title: '스케일업 창업가형', desc: '기회를 빠르게 실행하고 크게 키우는 타입입니다. 공격적 성장에 강합니다.', traits: ['고속 실행', '기회 포착', '성장 중심'] },
  RANP: { title: '리스크 컨트롤러형', desc: '도전하되 방어 전략을 함께 챙기는 균형형입니다.', traits: ['공격/방어 균형', '플랜 B', '유연성'] },
  RCDG: { title: '전략 투자자형', desc: '검증된 전략 위에 성장 베팅을 얹는 타입입니다.', traits: ['전략 사고', '분석력', '중장기 시야'] },
  SCDP: { title: '복리 자산가형', desc: '안정성과 규칙을 바탕으로 꾸준히 부를 만드는 타입입니다.', traits: ['리스크 관리', '꾸준함', '규칙 기반'] },
};

let wealthIndex = 0;
let wealthAnswers = [];

function wealthShowToast(message, duration = 2000) {
  if (window.DunsmileUI && typeof window.DunsmileUI.showToast === 'function') {
    window.DunsmileUI.showToast(message, duration);
  }
}

function wealthTrack(eventName, detail) {
  if (typeof window.trackServiceEvent === 'function') {
    window.trackServiceEvent(eventName, detail || {});
  }
}

function updateWealthProgress() {
  const total = WEALTH_DNA_QUESTIONS.length;
  const current = Math.min(wealthIndex + 1, total);
  const percent = Math.round((wealthIndex / total) * 100);

  const progressBar = document.getElementById('wealthProgressBar');
  const progressText = document.getElementById('wealthProgressText');
  if (progressBar) progressBar.style.width = `${percent}%`;
  if (progressText) progressText.textContent = `${current} / ${total}`;
}

function renderWealthQuestion() {
  const question = WEALTH_DNA_QUESTIONS[wealthIndex];
  if (!question) return;

  const questionText = document.getElementById('wealthQuestionText');
  const aText = document.getElementById('wealthOptionAText');
  const bText = document.getElementById('wealthOptionBText');

  if (questionText) questionText.textContent = question.text;
  if (aText) aText.textContent = question.optionA.text;
  if (bText) bText.textContent = question.optionB.text;

  updateWealthProgress();
}

function buildWealthType() {
  const count = { R: 0, S: 0, A: 0, C: 0, N: 0, D: 0, G: 0, P: 0 };
  wealthAnswers.forEach((letter) => {
    if (count[letter] != null) count[letter] += 1;
  });

  const letters = WEALTH_DIMENSIONS.map(([left, right]) => (count[left] >= count[right] ? left : right));
  const type = letters.join('');
  const profile = WEALTH_PROFILE_MAP[type] || {
    title: '밸런스 자산가형',
    desc: '성장과 안정을 상황에 맞게 조합하는 실전형 타입입니다.',
    traits: ['균형 감각', '현실적 판단', '지속 가능성'],
  };

  const growthScoreLetters = ['R', 'A', 'N', 'G'];
  const growthHits = letters.filter((letter) => growthScoreLetters.includes(letter)).length;
  const potentialScore = 55 + growthHits * 10;

  return { type, profile, potentialScore };
}

function showWealthResult() {
  const questionCard = document.getElementById('wealthQuestionCard');
  const resultCard = document.getElementById('wealthResultCard');
  const resultActions = document.getElementById('wealthResultActions');

  const { type, profile, potentialScore } = buildWealthType();

  const typeBadge = document.getElementById('wealthTypeBadge');
  const title = document.getElementById('wealthResultTitle');
  const desc = document.getElementById('wealthResultDesc');
  const score = document.getElementById('wealthPotentialScore');
  const traits = document.getElementById('wealthTraits');

  if (typeBadge) typeBadge.textContent = `TYPE ${type}`;
  if (title) title.textContent = profile.title;
  if (desc) desc.textContent = profile.desc;
  if (score) score.innerHTML = `${potentialScore}<span class="svc-result-score-unit">점</span>`;

  if (traits) {
    traits.innerHTML = profile.traits.map((trait) => `<span class="svc-tag">${trait}</span>`).join('');
  }

  if (questionCard) questionCard.classList.add('svc-hidden');
  if (resultCard) resultCard.classList.remove('svc-hidden');
  if (resultActions) resultActions.classList.remove('svc-hidden');
  if (window.DunsmileUI && typeof window.DunsmileUI.focusRelatedCarousel === 'function') {
    window.DunsmileUI.focusRelatedCarousel({ selector: '#wealthResultCard .svc-related-section', delay: 160 });
  }

  const progressBar = document.getElementById('wealthProgressBar');
  const progressText = document.getElementById('wealthProgressText');
  if (progressBar) progressBar.style.width = '100%';
  if (progressText) progressText.textContent = `${WEALTH_DNA_QUESTIONS.length} / ${WEALTH_DNA_QUESTIONS.length}`;

  wealthTrack('complete', { type, potentialScore });
}

function chooseWealthOption(option) {
  const question = WEALTH_DNA_QUESTIONS[wealthIndex];
  if (!question) return;

  const picked = option === 'A' ? question.optionA : question.optionB;
  wealthAnswers.push(picked.letter);

  wealthIndex += 1;
  if (wealthIndex >= WEALTH_DNA_QUESTIONS.length) {
    showWealthResult();
    return;
  }

  renderWealthQuestion();
}

function restartWealthDnaTest() {
  wealthIndex = 0;
  wealthAnswers = [];

  const questionCard = document.getElementById('wealthQuestionCard');
  const resultCard = document.getElementById('wealthResultCard');
  const resultActions = document.getElementById('wealthResultActions');

  if (questionCard) questionCard.classList.remove('svc-hidden');
  if (resultCard) resultCard.classList.add('svc-hidden');
  if (resultActions) resultActions.classList.add('svc-hidden');

  renderWealthQuestion();
}

function shareWealthDnaResult() {
  const typeBadge = document.getElementById('wealthTypeBadge');
  const title = document.getElementById('wealthResultTitle');
  if (!typeBadge || !title || typeBadge.textContent === 'TYPE') {
    wealthShowToast('먼저 결과를 확인해주세요!');
    return;
  }

  const shareUrl = `${window.location.origin}/dunsmile/wealth-dna-test/`;
  const text = `나의 부자 DNA 결과는 ${typeBadge.textContent} (${title.textContent})! 너도 테스트해볼래?`;

  if (navigator.share) {
    wealthTrack('share', { method: 'navigator' });
    navigator.share({ title: '부자 DNA 테스트', text, url: shareUrl }).catch(() => {});
    return;
  }

  navigator.clipboard.writeText(`${text} ${shareUrl}`).then(() => {
    wealthTrack('share', { method: 'clipboard' });
    wealthShowToast('결과 링크가 복사되었습니다!');
  }).catch(() => {
    wealthShowToast('공유를 지원하지 않는 브라우저입니다');
  });
}

async function downloadWealthDnaShareCard() {
  const typeBadge = document.getElementById('wealthTypeBadge');
  const title = document.getElementById('wealthResultTitle');
  const score = document.getElementById('wealthPotentialScore');
  if (!typeBadge || !title || !score || typeBadge.textContent === 'TYPE') {
    wealthShowToast('먼저 결과를 확인해주세요!');
    return;
  }

  if (!window.DopaminShareCard) {
    wealthShowToast('공유 카드 기능을 불러오지 못했습니다');
    return;
  }

  await window.DopaminShareCard.download({
    title: '부자 DNA 테스트',
    subtitle: typeBadge.textContent,
    highlight: title.textContent,
    numbers: [Number((score.textContent || '0').replace(/[^0-9]/g, ''))],
    tags: ['부자DNA', 'MBTI', '자산성향'],
    footer: 'dopamine-factory.pages.dev/dunsmile/wealth-dna-test/',
    fromColor: '#10b981',
    toColor: '#f59e0b',
    filePrefix: 'wealth-dna-test',
  });

  wealthTrack('share', { method: 'download-card' });
  wealthShowToast('결과 이미지 카드가 저장되었습니다!');
}

window.chooseWealthOption = chooseWealthOption;
window.restartWealthDnaTest = restartWealthDnaTest;
window.shareWealthDnaResult = shareWealthDnaResult;
window.downloadWealthDnaShareCard = downloadWealthDnaShareCard;

restartWealthDnaTest();
wealthTrack('impression');
