// ==================== 관상 테스트 로직 ====================

// 상태 관리
let selectedGender = null;
let uploadedPhotoData = null;
let testResult = null;

// ==================== 유명인 & 텍스트 데이터 ====================

const CELEBRITIES = [
  { name: '정주영', desc: '현대그룹 창업주' },
  { name: '이병철', desc: '삼성그룹 창업주' },
  { name: '빌 게이츠', desc: '마이크로소프트 창업자' },
  { name: '워렌 버핏', desc: '버크셔 해서웨이' },
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
  { name: '카를로스 슬림', desc: '텔멕스 회장' },
  { name: '무케시 암바니', desc: '릴라이언스 회장' },
  { name: '아만시오 오르테가', desc: '인디텍스 창업자' }
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
  "당신의 얼굴에서 강한 의지와 결단력이 느껴집니다. 특히 눈빛이 흔들림 없이 목표를 향해 가는 타입이라, 중요한 순간에 큰 결정을 잘 내리는 편입니다. 꾸준함과 추진력이 결합되어 장기적으로 자산을 키우는 상입니다.",
  "부드러우면서도 날카로운 인상이 균형을 이루고 있습니다. 사람을 편하게 만드는 친화력과 일 처리를 빠르게 끝내는 실행력이 함께 보여, 사업·프로젝트에서 신뢰를 얻기 좋은 관상입니다.",
  "끈기와 인내의 기운이 강하게 느껴집니다. 한 번 시작한 일은 끝까지 해내는 성향이라 장기 투자나 누적형 성과에서 강점을 보입니다. 시간이 지날수록 안정적으로 성장하는 타입입니다.",
  "독창적인 발상이 돋보이는 상입니다. 남들이 하지 않는 방법을 먼저 시도하는 감각이 있어, 신규 서비스나 신사업에서 기회를 잡기 쉽습니다. 변화에 대한 두려움이 적은 편입니다.",
  "리더십의 기운이 드러납니다. 조직 안에서 중심을 잡고 사람을 모으는 타입으로, 팀을 꾸려 성과를 내기 좋습니다. 책임을 지는 성향이 강해 위기 상황에도 중심을 유지합니다.",
  "섬세함과 대담함이 공존합니다. 위험을 감지하는 직감이 있고, 타이밍이 맞을 때는 과감한 선택을 할 수 있어 투자나 사업에서 수익 구간을 잘 포착합니다.",
  "인덕이 있는 상입니다. 주변 사람들과의 관계가 기회를 만들어주는 타입이라 협업이나 소개를 통해 좋은 흐름이 생깁니다. 인맥이 곧 자산이 되는 경우가 많습니다.",
  "분석력과 직감이 균형 있게 발달했습니다. 숫자와 데이터 흐름을 읽는 능력이 있어 금융, 전략, 기획 분야에서 강점을 가질 가능성이 높습니다.",
  "장기적 관점이 강한 타입입니다. 단기 이익보다 큰 흐름을 보며 꾸준히 축적하는 경향이 있어, 시간이 지날수록 안정적인 부를 만드는 상입니다.",
  "도전과 변화를 즐기는 모험가의 기운이 있습니다. 새로운 기회를 빠르게 캐치하는 편이라 여러 번의 성장 기회를 경험할 가능성이 높습니다.",
  "균형 잡힌 인상으로 신뢰를 얻는 상입니다. 말보다 행동으로 증명하는 성향이 있어, 장기 파트너십과 안정적 사업 운영에 유리합니다.",
  "결과 지향적인 성향이 강합니다. 목표를 세우고 단기간 집중해 성과를 만드는 데 강점이 있어, 프로젝트형 업무에서 두각을 나타냅니다.",
  "현실 감각이 뛰어난 타입입니다. 수입과 지출의 균형을 잘 잡아, 리스크를 크게 늘리지 않고도 안정적인 성장을 만들어냅니다.",
  "자기 통제력이 돋보입니다. 감정에 휘둘리지 않는 편이라 의사결정이 일관되고, 장기 목표를 향해 안정적으로 전진할 수 있습니다."
];

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

  testResult = {
    name: name,
    gender: selectedGender,
    birthDate: birthDate,
    hash: hash,
    richPercent: (hash % 30) + 65,        // 65~94%
    luckPercent: (hash % 40) + 50,        // 50~89%
    celebrity: CELEBRITIES[hash % CELEBRITIES.length],
    analysis: ANALYSIS_TEXTS[hash % ANALYSIS_TEXTS.length],
    matchType: MATCH_TYPES[hash % MATCH_TYPES.length],
    mismatchType: MISMATCH_TYPES[(hash * 7) % MISMATCH_TYPES.length],
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
  document.getElementById('resultAnalysis').textContent = testResult.analysis;
  document.getElementById('resultMatchType').textContent = testResult.matchType;
  document.getElementById('resultMismatchType').textContent = testResult.mismatchType;
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
      matchType: result.matchType,
      mismatchType: result.mismatchType,
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
  const shareUrl = window.location.origin + '/face-test.html';
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

// ==================== 기타 정보 모달 ====================

function openAboutModal() {
  const modalEl = document.getElementById('aboutModal');
  if (modalEl) modalEl.classList.add('active');
}

function closeAboutModal() {
  const modalEl = document.getElementById('aboutModal');
  if (modalEl) modalEl.classList.remove('active');
}

function openPrivacyModal() {
  const modalEl = document.getElementById('privacyModal');
  if (modalEl) modalEl.classList.add('active');
}

function closePrivacyModal() {
  const modalEl = document.getElementById('privacyModal');
  if (modalEl) modalEl.classList.remove('active');
}

function openTermsModal() {
  const modalEl = document.getElementById('termsModal');
  if (modalEl) modalEl.classList.add('active');
}

function closeTermsModal() {
  const modalEl = document.getElementById('termsModal');
  if (modalEl) modalEl.classList.remove('active');
}

// ==================== 전역 함수 노출 ====================

window.selectGender = selectGender;
window.handlePhotoUpload = handlePhotoUpload;
window.startAnalysis = startAnalysis;
window.shareResult = shareResult;
window.retakeTest = retakeTest;
window.openServiceMenu = openServiceMenu;
window.closeServiceMenu = closeServiceMenu;
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.openAboutModal = openAboutModal;
window.closeAboutModal = closeAboutModal;
window.openPrivacyModal = openPrivacyModal;
window.closePrivacyModal = closePrivacyModal;
window.openTermsModal = openTermsModal;
window.closeTermsModal = closeTermsModal;
window.autoFocusNext = autoFocusNext;
