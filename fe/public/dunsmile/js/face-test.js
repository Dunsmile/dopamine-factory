// ==================== 관상 테스트 로직 ====================

// 상태 관리
let selectedGender = null;
let uploadedPhotoData = null;
let testResult = null;

// ==================== 유명인 & 텍스트 데이터 ====================

const CELEBRITIES_MALE = [
  { name: '정주영', desc: '현대그룹 창업주' },
  { name: '이병철', desc: '삼성그룹 창업주' },
  { name: '빌 게이츠', desc: '마이크로소프트 창업자' },
  { name: '워렌 버핏', desc: '버크셔 해서웨이 투자자' },
  { name: '잭 마', desc: '알리바바 창업자' },
  { name: '일론 머스크', desc: '테슬라·스페이스X' },
  { name: '스티브 잡스', desc: '애플 창업자' },
  { name: '손정의', desc: '소프트뱅크 회장' },
  { name: '김범수', desc: '카카오 창업자' },
  { name: '이해진', desc: '네이버 창업자' },
  { name: '제프 베이조스', desc: '아마존 창업자' },
  { name: '버나드 아르노', desc: 'LVMH 회장' },
  { name: '마이클 블룸버그', desc: '블룸버그 창업자' },
  { name: '래리 엘리슨', desc: '오라클 창업자' },
  { name: '래리 페이지', desc: '구글 공동 창업자' },
  { name: '세르게이 브린', desc: '구글 공동 창업자' },
  { name: '마크 저커버그', desc: '메타 창업자' },
  { name: '젠슨 황', desc: '엔비디아 CEO' },
  { name: '카를로스 슬림', desc: '통신 기업가' },
  { name: '무케시 암바니', desc: '릴라이언스 회장' },
  { name: '아만시오 오르테가', desc: '인디텍스 창업자' }
];

const CELEBRITIES_FEMALE = [
  { name: '오프라 윈프리', desc: '미디어 기업가' },
  { name: '사라 블레이클리', desc: '스팽스 창업자' },
  { name: '멜린다 프렌치 게이츠', desc: '필란트로피 리더' },
  { name: '매켄지 스콧', desc: '작가·투자자' },
  { name: '수잔 보이치키', desc: '전 유튜브 CEO' },
  { name: '인드라 누이', desc: '전 펩시코 CEO' },
  { name: '메리 바라', desc: 'GM CEO' },
  { name: '지니 로메티', desc: '전 IBM CEO' },
  { name: '애비게일 존슨', desc: '피델리티 CEO' },
  { name: '로린 파월 잡스', desc: '에머슨 콜렉티브' },
  { name: '리사 수', desc: 'AMD CEO' },
  { name: '휘트니 울프 허드', desc: '범블 창업자' },
  { name: '카트리나 레이크', desc: '스티치 픽스 창업자' },
  { name: '토리 버치', desc: '패션 기업가' },
  { name: '아리아나 허핑턴', desc: '미디어 기업가' },
  { name: '줄리아 코크', desc: '투자자' },
  { name: '앨리스 월턴', desc: '월마트 상속인' },
  { name: '지나 라인하트', desc: '자원 기업가' },
  { name: '수잔 클라텐', desc: '산업 투자자' },
  { name: '재클린 마스', desc: '식품 기업가' },
  { name: '에스티 로더', desc: '뷰티 브랜드 창업자' },
  { name: '메리 케이 애쉬', desc: '화장품 기업가' }
];

const LUCK_MESSAGES = [
  "오늘 뭔가 좋은 일이 생길 것 같은 느낌이에요!",
  "이런 관상은 운이 정말 좋더라고요...",
  "올해 큰 행운이 찾아올 것 같아요!",
  "혹시... 오늘 복권 사보셨어요?",
  "당신의 기운이 아주 좋아 보여요!",
  "뭔가 대박의 기운이 느껴지는데요?",
  "이 관상... 예사롭지 않네요!",
  "행운의 여신이 당신을 주목하고 있어요",
  "오늘 숫자 6이 행운을 가져다줄 거예요",
  "당신에겐 숨겨진 금전운이 있어요!",
  "이번 주가 특별한 주가 될 것 같아요",
  "우연한 행운이 당신을 기다리고 있어요",
  "지금 이 순간, 운세가 상승 중이에요!",
  "뭔가 특별한 일이 일어날 징조가 보여요",
  "당신의 재물운이 활짝 열리고 있어요!",
  "이런 관상은 대박 징조라던데...",
  "오늘 행운의 숫자를 받아보세요!",
  "당신에게 필요한 건 딱 하나, 행운의 번호!",
  "이 기운 그대로 행운을 잡아보세요",
  "별들이 당신의 행운을 예고하고 있어요!"
];

const ANALYSIS_TEXTS = [
  "당신은 중요한 순간에 결단을 내릴 줄 아는 타입입니다. 목표를 향해 흔들림 없이 나아가며, 짧은 기회도 놓치지 않습니다. 이런 관상은 추진력과 안정감을 동시에 보여줍니다.",
  "부드러움 속에 강한 중심이 느껴집니다. 사람을 편안하게 만드는 인상과 빠른 실행력이 함께 보여, 신뢰와 성과를 동시에 얻기 좋은 관상입니다.",
  "끈기와 인내가 강점인 타입입니다. 단기 성과보다 꾸준한 누적을 선호해 장기 프로젝트에서 특히 빛납니다. 시간이 지날수록 안정적인 성장 곡선을 만들 수 있습니다.",
  "창의성과 도전성이 뚜렷합니다. 새로운 관점을 제시하고 변화를 받아들이는 데 강점이 있어, 신사업이나 혁신 프로젝트에서 운이 따라옵니다.",
  "리더십과 책임감이 드러납니다. 조직의 중심을 잡아주고, 위기 상황에서도 침착하게 방향을 제시할 수 있는 타입입니다.",
  "섬세함과 대담함의 균형형입니다. 위험 신호를 감지하면서도, 확신이 서면 과감하게 움직이는 강점을 가지고 있습니다.",
  "인덕형 관상입니다. 사람 사이에서 신뢰를 쌓고 도움을 받는 타입이라, 협업과 네트워크가 성장의 열쇠가 됩니다.",
  "분석형 관상입니다. 숫자와 흐름을 읽는 능력이 좋아, 전략·기획·투자 분야에서 두각을 나타낼 가능성이 높습니다.",
  "장기형 관상입니다. 큰 그림을 보며 꾸준히 축적하는 성향이라, 시간이 지날수록 안정적으로 부를 쌓는 타입입니다.",
  "모험가형 관상입니다. 변화와 도전을 즐기며, 시장의 흐름이 바뀌는 순간 기회를 잘 포착합니다.",
  "신뢰형 관상입니다. 말보다 행동으로 보여주는 스타일이라, 안정적 파트너십과 장기 협업에서 강점이 있습니다.",
  "성과 집중형 관상입니다. 목표를 세우고 집중해 단기간에 성과를 만드는 데 능하며, 프로젝트형 업무에 특히 강합니다.",
  "현실 감각형 관상입니다. 리스크를 키우기보다 균형을 중시해 안정적인 자산 흐름을 만들 수 있습니다.",
  "자기 통제형 관상입니다. 감정에 휘둘리지 않고 일관된 의사결정으로 목표에 도달하는 힘이 있습니다."
];

const QUOTES = [
  { title: '결국 남는 건 실행', quote: '생각은 누구나 하지만, 결과는 실행한 사람에게만 남습니다.' },
  { title: '기회는 흐름 속에', quote: '흐름을 읽는 사람이 기회를 가장 먼저 잡습니다.' },
  { title: '작은 습관의 힘', quote: '하루의 작은 선택이 결국 큰 차이를 만듭니다.' },
  { title: '신뢰가 자산', quote: '신뢰는 쌓일수록 더 큰 기회를 불러옵니다.' },
  { title: '타이밍의 감각', quote: '빠름보다 중요한 건, 정확한 타이밍입니다.' },
  { title: '꾸준함이 이긴다', quote: '끝까지 남는 건 꾸준함입니다.' },
  { title: '확신은 힘이 된다', quote: '확신은 주변을 설득하고 길을 열어줍니다.' },
  { title: '균형이 성과다', quote: '균형 잡힌 판단이 장기 성과를 만듭니다.' }
];

const POINT_LABELS = [
  '카리스마',
  '분석가 기질',
  '타고난 운',
  '리더십',
  '집중력',
  '결단력',
  '협업 능력',
  '창의성',
  '신뢰감',
  '실행력'
];

const STORYLINES = [
  {
    points: ['열정', '실행력', '대인관계'],
    match: { name: '리더형', desc: '결단과 추진력이 강해 팀을 이끄는 역할과 잘 맞습니다.' },
    mismatch: { name: '우유부단형', desc: '과도한 망설임은 당신의 강점인 실행력을 약화시킬 수 있습니다.' }
  },
  {
    points: ['분석력', '지속력', '안정감'],
    match: { name: '축적형', desc: '장기 관점에서 자산을 쌓는 성향과 잘 맞습니다.' },
    mismatch: { name: '단기 과열형', desc: '단기 성과에만 몰입하면 본래의 안정감이 흔들릴 수 있습니다.' }
  },
  {
    points: ['창의력', '도전성', '직감'],
    match: { name: '도전형', desc: '빠른 시도와 실행이 필요한 환경에서 강점이 극대화됩니다.' },
    mismatch: { name: '변화거부형', desc: '변화를 피하면 당신의 창의성이 제한될 수 있습니다.' }
  },
  {
    points: ['통찰력', '판단력', '신뢰감'],
    match: { name: '전략형', desc: '큰 그림을 그리고 방향을 제시하는 역할과 잘 맞습니다.' },
    mismatch: { name: '충동형', desc: '즉흥적인 선택은 당신의 신뢰도를 떨어뜨릴 수 있습니다.' }
  },
  {
    points: ['집중력', '몰입', '완성도'],
    match: { name: '몰입형', desc: '집중과 완성도가 높은 환경에서 최고의 성과를 냅니다.' },
    mismatch: { name: '분산형', desc: '여러 일을 동시에 벌이면 강점이 분산될 수 있습니다.' }
  },
  {
    points: ['균형감', '조율력', '설득력'],
    match: { name: '조율형', desc: '협업이 중요한 환경에서 신뢰를 빠르게 구축합니다.' },
    mismatch: { name: '독단형', desc: '독단적 접근은 본래의 강점과 충돌합니다.' }
  },
  {
    points: ['속도', '결단', '기회감지'],
    match: { name: '스피드형', desc: '빠른 의사결정과 실행이 필요한 환경에서 강합니다.' },
    mismatch: { name: '지나친 신중형', desc: '과도한 검토는 기회를 놓치게 할 수 있습니다.' }
  },
  {
    points: ['신념', '일관성', '책임감'],
    match: { name: '원칙형', desc: '신뢰 기반의 장기 프로젝트와 잘 맞습니다.' },
    mismatch: { name: '무계획형', desc: '즉흥적인 흐름은 당신의 강점을 약화시킬 수 있습니다.' }
  }
];

function pickStoryline(hash) {
  return STORYLINES[hash % STORYLINES.length];
}

function pickQuote(hash) {
  return QUOTES[hash % QUOTES.length];
}

function pickPoints(hash) {
  const labels = POINT_LABELS.slice();
  const points = [];
  let seed = hash;
  for (let i = 0; i < 3; i++) {
    const idx = seed % labels.length;
    const label = labels.splice(idx, 1)[0];
    const score = (seed % 6) + 3; // 3~8칸
    points.push({ label, score });
    seed = Math.floor(seed / 7) + i * 11 + 3;
  }
  return points;
}

function renderBarWidth(score, max = 8) {
  const clamped = Math.max(0, Math.min(score, max));
  return Math.round((clamped / max) * 100);
}

function buildAnalysisText(result) {
  const lines = [];
  lines.push(`${result.analysis} 표정의 균형과 시선의 응집력이 함께 보이며, 감정에 휘둘리기보다 일관된 판단을 내리는 경향이 강합니다. 이런 흐름은 장기 목표를 세우고 구조를 쌓아가는 데 유리한 신호로 읽힙니다.`);
  lines.push('');
  lines.push(`${result.celebrity.name}은(는) ${result.celebrity.desc}로서 자신만의 흐름을 만들며 성과를 쌓아왔고, 당신의 관상에서도 유사한 집중력과 추진력이 느껴져 비슷한 성장 스토리를 그릴 가능성이 큽니다. 중요한 순간에 타이밍을 잡는 감각이 있으며, 주변의 신뢰를 얻을 때 성과가 더 크게 확장되는 타입입니다.`);
  lines.push('');
  lines.push('긍정적인 신호가 이어집니다. 지금의 선택과 실행이 차곡차곡 쌓이면 큰 전환점으로 이어질 수 있으니, 오늘의 작은 시도가 내일의 결과를 만드는 흐름을 기억해보세요.');
  lines.push('');
  lines.push(`관상 핵심 키워드 ${result.storyline.points.map(p => `#${p}`).join(' ')}`);
  return lines.join('\n');
}

const MATCH_TYPES = [
  "리더형·결단형",
  "전략형·분석형",
  "창의형·도전형",
  "협업형·인맥형",
  "실행형·속도형",
  "안정형·축적형",
  "직감형·타이밍형",
  "장기형·비전형"
];

const MISMATCH_TYPES = [
  "우유부단·미루기형",
  "충동형·과소비형",
  "과도한 완벽주의형",
  "비관형·위축형",
  "단기 과열형",
  "무계획·즉흥형",
  "고집형·변화거부형",
  "과도한 의존형"
];

// ==================== 해시 함수 ====================

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32비트 정수로 변환
  }
  return Math.abs(hash);
}

// ==================== UI 함수 ====================

function selectGender(gender) {
  selectedGender = gender;

  const maleBtn = document.getElementById('genderMale');
  const femaleBtn = document.getElementById('genderFemale');

  maleBtn.classList.remove('border-purple-500', 'bg-purple-50', 'text-purple-700');
  femaleBtn.classList.remove('border-purple-500', 'bg-purple-50', 'text-purple-700');

  if (gender === 'male') {
    maleBtn.classList.add('border-purple-500', 'bg-purple-50', 'text-purple-700');
  } else {
    femaleBtn.classList.add('border-purple-500', 'bg-purple-50', 'text-purple-700');
  }
}

function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // 파일 크기 체크 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast('5MB 이하의 이미지만 업로드 가능합니다', 2000);
    return;
  }

  // 이미지 파일 체크
  if (!file.type.startsWith('image/')) {
    showToast('이미지 파일만 업로드 가능합니다', 2000);
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    uploadedPhotoData = e.target.result;

    const placeholder = document.getElementById('photoPlaceholder');
    const preview = document.getElementById('photoPreview');
    const previewImage = document.getElementById('previewImage');
    const uploadBox = document.getElementById('photoUpload');

    previewImage.src = uploadedPhotoData;
    placeholder.classList.add('hidden');
    preview.classList.remove('hidden');
    uploadBox.classList.add('has-photo');
  };
  reader.readAsDataURL(file);
}

function showToast(message, duration = 2000) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  if (toast && toastMessage) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
  }
}

// ==================== 생년월일 입력 자동 포커스 ====================

function autoFocusNext(currentInput, nextId, maxLength) {
  if (currentInput.value.length >= maxLength) {
    const nextInput = document.getElementById(nextId);
    if (nextInput) nextInput.focus();
  }
}

// 생년월일 값 조합
function getBirthDate() {
  const year = document.getElementById('birthYear').value.trim();
  const month = document.getElementById('birthMonth').value.trim().padStart(2, '0');
  const day = document.getElementById('birthDay').value.trim().padStart(2, '0');

  if (!year || !month || !day) return null;
  if (year.length !== 4) return null;

  return `${year}-${month}-${day}`;
}

// 생년월일 유효성 검사
function validateBirthDate() {
  const year = document.getElementById('birthYear').value.trim();
  const month = document.getElementById('birthMonth').value.trim();
  const day = document.getElementById('birthDay').value.trim();

  if (!year || year.length !== 4) {
    showToast('생년(4자리)을 입력해주세요', 2000);
    document.getElementById('birthYear').focus();
    return false;
  }
  if (!month || parseInt(month) < 1 || parseInt(month) > 12) {
    showToast('월(1~12)을 입력해주세요', 2000);
    document.getElementById('birthMonth').focus();
    return false;
  }
  if (!day || parseInt(day) < 1 || parseInt(day) > 31) {
    showToast('일(1~31)을 입력해주세요', 2000);
    document.getElementById('birthDay').focus();
    return false;
  }
  return true;
}

// ==================== 분석 시작 ====================

function startAnalysis() {
  // 유효성 검사
  const name = document.getElementById('userName').value.trim();
  const agreeTerms = document.getElementById('agreeTerms').checked;

  if (!name) {
    showToast('이름을 입력해주세요', 2000);
    return;
  }
  if (!selectedGender) {
    showToast('성별을 선택해주세요', 2000);
    return;
  }
  if (!validateBirthDate()) {
    return;
  }
  const birthDate = getBirthDate();
  if (!uploadedPhotoData) {
    showToast('사진을 업로드해주세요', 2000);
    return;
  }
  if (!agreeTerms) {
    showToast('개인정보 수집에 동의해주세요', 2000);
    return;
  }

  // 결과 생성 (해시 기반 - 사진 무관)
  const uniqueKey = name + birthDate + selectedGender;
  const hash = hashCode(uniqueKey);

  const celebrityPool = selectedGender === 'female' ? CELEBRITIES_FEMALE : CELEBRITIES_MALE;
  const story = pickStoryline(hash);
  const quote = pickQuote(hash);
  const points = pickPoints(hash);

  testResult = {
    name: name,
    gender: selectedGender,
    birthDate: birthDate,
    hash: hash,
    richPercent: (hash % 30) + 65,        // 65~94%
    luckPercent: (hash % 40) + 50,        // 50~89%
    celebrity: celebrityPool[hash % celebrityPool.length],
    analysis: ANALYSIS_TEXTS[hash % ANALYSIS_TEXTS.length],
    storyline: story,
    quote: quote,
    points: points,
    luckMessage: LUCK_MESSAGES[hash % LUCK_MESSAGES.length],
    photo: uploadedPhotoData
  };

  // Firebase에 저장 (사진 제외)
  saveToFirebase(testResult);

  // Step 2로 이동 (분석 중)
  showStep(2);
  startAnalysisAnimation();
}

// ==================== 분석 애니메이션 ====================

function startAnalysisAnimation() {
  // 분석 중 사진 표시
  document.getElementById('analyzingPhoto').src = testResult.photo;

  let progress = 0;
  const progressBar = document.getElementById('analysisProgress');
  const percentText = document.getElementById('analysisPercent');

  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);

      setTimeout(() => {
        showStep(3);
        displayResult();
      }, 500);
    }

    progressBar.style.width = progress + '%';
    percentText.textContent = Math.floor(progress);
  }, 300);
}

// ==================== 결과 표시 ====================

function displayResult() {
  document.getElementById('resultUserName').textContent = testResult.name;
  document.getElementById('resultPercent').textContent = testResult.richPercent;
  document.getElementById('resultPhoto').src = testResult.photo;
  document.getElementById('resultCelebrity').textContent = testResult.celebrity.name;
  document.getElementById('resultCelebrityDesc').textContent = testResult.celebrity.desc;
  document.getElementById('resultQuoteTitle').textContent = testResult.quote.title;
  document.getElementById('resultQuoteText').textContent = testResult.quote.quote;

  document.getElementById('pointLabel1').textContent = `#결단`;
  document.getElementById('pointLabel2').textContent = `#협업 능력`;
  document.getElementById('pointLabel3').textContent = `#타고난 운`;
  const bar1 = document.getElementById('pointBar1');
  const bar2 = document.getElementById('pointBar2');
  const bar3 = document.getElementById('pointBar3');
  bar1.style.width = '0%';
  bar2.style.width = '0%';
  bar3.style.width = '0%';
  requestAnimationFrame(() => {
    bar1.style.width = `${renderBarWidth(testResult.points[0].score)}%`;
    bar2.style.width = `${renderBarWidth(testResult.points[1].score)}%`;
    bar3.style.width = `${renderBarWidth(testResult.points[2].score)}%`;
  });

  document.getElementById('resultAnalysis').textContent = buildAnalysisText(testResult);
  document.getElementById('resultMatchType').textContent = `${testResult.storyline.match.name} · ${testResult.storyline.match.desc}`;
  document.getElementById('resultMismatchType').textContent = `${testResult.storyline.mismatch.name} · ${testResult.storyline.mismatch.desc}`;
  document.getElementById('luckPercent').textContent = testResult.luckPercent;
  document.getElementById('luckBar').style.width = testResult.luckPercent + '%';
  document.getElementById('luckMessage').textContent = `"${testResult.luckMessage}"`;

  // 사진 데이터 메모리에서 삭제 (보안)
  // uploadedPhotoData = null; // 결과 표시용으로 유지, 페이지 이탈 시 자동 삭제
}

// ==================== Firebase 저장 ====================

async function saveToFirebase(result) {
  try {
    await db.collection('face_test_results').add({
      name: result.name,
      gender: result.gender,
      birthDate: result.birthDate,
      resultHash: result.hash,
      richPercent: result.richPercent,
      luckPercent: result.luckPercent,
      celebrity: result.celebrity.name,
      celebrityDesc: result.celebrity.desc,
      storylinePoints: result.storyline.points,
      quoteTitle: result.quote.title,
      quoteText: result.quote.quote,
      points: result.points,
      matchType: result.storyline.match.name,
      matchDesc: result.storyline.match.desc,
      mismatchType: result.storyline.mismatch.name,
      mismatchDesc: result.storyline.mismatch.desc,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log('Face test result saved to Firebase');
  } catch (error) {
    console.error('Error saving to Firebase:', error);
  }
}

// ==================== 스텝 전환 ====================

function showStep(stepNumber) {
  document.querySelectorAll('.step').forEach(step => {
    step.classList.remove('active');
  });
  document.getElementById('step' + stepNumber).classList.add('active');

  // 스크롤 맨 위로
  window.scrollTo(0, 0);
}

// ==================== 공유 & 다시하기 ====================

function shareResult() {
  const shareUrl = window.location.origin + '/dunsmile/rich-face/';
  const shareText = `나의 부자 관상 테스트 결과! 💰 ${testResult.richPercent}%의 확률로 부자가 될 상이래요! 당신도 테스트해보세요!`;

  if (navigator.share) {
    navigator.share({
      title: '부자가 될 상인가? - AI 관상 테스트',
      text: shareText,
      url: shareUrl
    }).catch(console.error);
  } else {
    // 클립보드 복사 폴백
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('링크가 복사되었습니다!', 2000);
    }).catch(() => {
      showToast('공유하기를 지원하지 않는 브라우저입니다', 2000);
    });
  }
}

async function downloadFaceShareCard() {
  if (!testResult) {
    showToast('먼저 관상 분석을 완료해주세요', 2000);
    return;
  }
  if (!window.DopaminShareCard) {
    showToast('공유 카드 기능을 불러오지 못했습니다', 2000);
    return;
  }

  await window.DopaminShareCard.download({
    title: '부자가 될 상인가?',
    subtitle: `${testResult.name}님의 관상 결과`,
    highlight: `부자 기운 ${testResult.richPercent}%`,
    tags: testResult.storyline.points || ['관상분석', '도파민공작소'],
    footer: 'dopamine-factory.pages.dev/dunsmile/rich-face/',
    fromColor: '#9333ea',
    toColor: '#ec4899',
    filePrefix: 'rich-face'
  });
  showToast('결과 이미지 카드가 저장되었습니다!', 2000);
}

function retakeTest() {
  // 상태 초기화
  selectedGender = null;
  uploadedPhotoData = null;
  testResult = null;

  // 폼 초기화
  document.getElementById('userName').value = '';
  document.getElementById('birthYear').value = '';
  document.getElementById('birthMonth').value = '';
  document.getElementById('birthDay').value = '';
  document.getElementById('photoInput').value = '';
  document.getElementById('agreeTerms').checked = false;

  // 사진 미리보기 초기화
  document.getElementById('photoPlaceholder').classList.remove('hidden');
  document.getElementById('photoPreview').classList.add('hidden');
  document.getElementById('photoUpload').classList.remove('has-photo');

  // 성별 버튼 초기화
  document.getElementById('genderMale').classList.remove('border-purple-500', 'bg-purple-50', 'text-purple-700');
  document.getElementById('genderFemale').classList.remove('border-purple-500', 'bg-purple-50', 'text-purple-700');

  // Step 1로 이동
  showStep(1);
}

// ==================== 서비스 메뉴 ====================

function openServiceMenu() {
  const backdrop = document.getElementById('serviceMenuBackdrop');
  const sidebar = document.getElementById('serviceMenuSidebar');
  if (backdrop && sidebar) {
    backdrop.classList.remove('hidden');
    sidebar.classList.remove('-translate-x-full');
  }
}

function closeServiceMenu() {
  const backdrop = document.getElementById('serviceMenuBackdrop');
  const sidebar = document.getElementById('serviceMenuSidebar');
  if (backdrop && sidebar) {
    backdrop.classList.add('hidden');
    sidebar.classList.add('-translate-x-full');
  }
}

// ==================== 설정 ====================

function openSettings() {
  const modalEl = document.getElementById('settingsModal');
  if (modalEl) modalEl.classList.add('active');
}

function closeSettings() {
  const modalEl = document.getElementById('settingsModal');
  if (modalEl) modalEl.classList.remove('active');
}

// ==================== 전역 함수 노출 ====================

window.selectGender = selectGender;
window.handlePhotoUpload = handlePhotoUpload;
window.startAnalysis = startAnalysis;
window.shareResult = shareResult;
window.downloadFaceShareCard = downloadFaceShareCard;
window.retakeTest = retakeTest;
window.openServiceMenu = openServiceMenu;
window.closeServiceMenu = closeServiceMenu;
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.autoFocusNext = autoFocusNext;
