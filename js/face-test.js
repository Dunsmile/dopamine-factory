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
  { name: '워렌 버핏', desc: '투자의 귀재' },
  { name: '잭 마', desc: '알리바바 창업자' },
  { name: '일론 머스크', desc: '테슬라 CEO' },
  { name: '스티브 잡스', desc: '애플 창업자' },
  { name: '손정의', desc: '소프트뱅크 회장' },
  { name: '김범수', desc: '카카오 창업자' },
  { name: '이해진', desc: '네이버 창업자' }
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
  "당신의 얼굴에서 강한 의지와 결단력이 느껴집니다. 특히 눈매에서 성공을 향한 열정이 보이며, 이마의 형태는 지혜로운 판단력을 암시합니다. 재물을 모으는 데 타고난 감각이 있는 상입니다.",
  "부드러우면서도 날카로운 인상이 조화를 이루고 있습니다. 이런 관상은 대인관계에서 신뢰를 쌓기 좋고, 사업적 성공의 기회가 많습니다. 특히 40대 이후 크게 발복할 상입니다.",
  "당신의 관상에서 끈기와 인내의 기운이 강하게 느껴집니다. 한 번 시작한 일은 끝까지 해내는 성향으로, 장기적인 투자에서 큰 수익을 올릴 가능성이 높습니다.",
  "창의적이고 독창적인 아이디어가 넘치는 상입니다. 기존에 없던 새로운 것을 만들어 성공하는 타입으로, 스타트업이나 신사업에서 대박을 칠 운명입니다.",
  "타인을 이끄는 리더십이 관상에서 드러납니다. 조직을 이끌며 함께 성장하는 타입으로, 큰 사업체를 운영할 그릇을 가지고 있습니다.",
  "섬세하면서도 대담한 기질이 공존하는 특이한 상입니다. 위험과 기회를 동시에 포착하는 능력이 있어, 투자에서 높은 수익률을 기록할 확률이 높습니다.",
  "복을 끌어당기는 인덕이 있는 상입니다. 주변 사람들의 도움으로 예상치 못한 횡재수가 따르며, 인맥을 통한 기회가 많이 찾아올 것입니다.",
  "분석력과 직감이 뛰어난 상입니다. 숫자와 데이터를 다루는 데 재능이 있어, 금융이나 투자 분야에서 성공할 가능성이 높습니다.",
  "인내심과 끈기의 상입니다. 당장의 이익보다 장기적인 안목으로 부를 축적하는 타입으로, 꾸준한 저축과 투자로 큰 부자가 될 운명입니다.",
  "변화와 도전을 즐기는 모험가의 상입니다. 새로운 기회를 포착하는 능력이 뛰어나 여러 번의 성공을 경험할 것이며, 특히 해외에서 큰 재물운이 있습니다."
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

// ==================== 분석 시작 ====================

function startAnalysis() {
  // 유효성 검사
  const name = document.getElementById('userName').value.trim();
  const birthDate = document.getElementById('birthDate').value;
  const agreeTerms = document.getElementById('agreeTerms').checked;

  if (!name) {
    showToast('이름을 입력해주세요', 2000);
    return;
  }
  if (!selectedGender) {
    showToast('성별을 선택해주세요', 2000);
    return;
  }
  if (!birthDate) {
    showToast('생년월일을 입력해주세요', 2000);
    return;
  }
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
  document.getElementById('resultAnalysis').textContent = testResult.analysis;
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
  document.getElementById('birthDate').value = '';
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

// ==================== 전역 함수 노출 ====================

window.selectGender = selectGender;
window.handlePhotoUpload = handlePhotoUpload;
window.startAnalysis = startAnalysis;
window.shareResult = shareResult;
window.retakeTest = retakeTest;
window.openServiceMenu = openServiceMenu;
window.closeServiceMenu = closeServiceMenu;
