// ==================== 오늘의 운세 로직 ====================

const MARKET_SENTIMENT_ROUTE = '/dunsmile/market-sentiment/';

// 상태 관리
let selectedGender = null;
let fortuneResult = null;

// localStorage 키 상수
const FORTUNE_STORAGE = {
  USER: 'hoxy_fortune_user',
  RESULT: 'hoxy_fortune_result',
  REMEMBER: 'hoxy_fortune_remember'
};

// ==================== 별자리 데이터 ====================

const ZODIAC_SIGNS = [
  { name: '물병자리', symbol: '♒', range: '1/20~2/18', element: '공기', ruling: '천왕성', trait: '독창적이고 자유로운 영혼' },
  { name: '물고기자리', symbol: '♓', range: '2/19~3/20', element: '물', ruling: '해왕성', trait: '감수성이 풍부하고 직감적' },
  { name: '양자리', symbol: '♈', range: '3/21~4/19', element: '불', ruling: '화성', trait: '에너지가 넘치는 개척자' },
  { name: '황소자리', symbol: '♉', range: '4/20~5/20', element: '흙', ruling: '금성', trait: '안정적이고 인내심 강한' },
  { name: '쌍둥이자리', symbol: '♊', range: '5/21~6/21', element: '공기', ruling: '수성', trait: '호기심 많고 소통에 능한' },
  { name: '게자리', symbol: '♋', range: '6/22~7/22', element: '물', ruling: '달', trait: '가정적이고 감성이 깊은' },
  { name: '사자자리', symbol: '♌', range: '7/23~8/22', element: '불', ruling: '태양', trait: '리더십과 존재감이 강한' },
  { name: '처녀자리', symbol: '♍', range: '8/23~9/22', element: '흙', ruling: '수성', trait: '분석적이고 세심한' },
  { name: '천칭자리', symbol: '♎', range: '9/23~10/22', element: '공기', ruling: '금성', trait: '조화롭고 공정한' },
  { name: '전갈자리', symbol: '♏', range: '10/23~11/21', element: '물', ruling: '명왕성', trait: '강렬하고 통찰력 있는' },
  { name: '사수자리', symbol: '♐', range: '11/22~12/21', element: '불', ruling: '목성', trait: '모험적이고 낙관적인' },
  { name: '염소자리', symbol: '♑', range: '12/22~1/19', element: '흙', ruling: '토성', trait: '책임감 있고 야망이 큰' }
];

// ==================== 띠 데이터 ====================

const CHINESE_ZODIAC = [
  { name: '쥐띠', animal: '🐀', element: '수(水)', trait: '영리하고 재치 있는', fortune: '기민한 판단력으로 재물을 모으는 운이 강합니다' },
  { name: '소띠', animal: '🐂', element: '토(土)', trait: '성실하고 인내심 강한', fortune: '꾸준한 노력으로 안정적인 부를 쌓는 운입니다' },
  { name: '호랑이띠', animal: '🐅', element: '목(木)', trait: '용감하고 카리스마 있는', fortune: '과감한 도전이 큰 보상으로 돌아오는 운입니다' },
  { name: '토끼띠', animal: '🐇', element: '목(木)', trait: '온화하고 세심한', fortune: '조용한 전략으로 기회를 잡는 운이 강합니다' },
  { name: '용띠', animal: '🐉', element: '토(土)', trait: '당당하고 야심 찬', fortune: '타고난 리더십으로 큰 일을 이루는 운입니다' },
  { name: '뱀띠', animal: '🐍', element: '화(火)', trait: '지혜롭고 직감적인', fortune: '날카로운 통찰력으로 투자에 강한 운입니다' },
  { name: '말띠', animal: '🐎', element: '화(火)', trait: '활발하고 자유로운', fortune: '빠른 행동력이 기회를 만드는 운입니다' },
  { name: '양띠', animal: '🐑', element: '토(土)', trait: '예술적이고 평화로운', fortune: '창의적 아이디어가 수익으로 연결되는 운입니다' },
  { name: '원숭이띠', animal: '🐒', element: '금(金)', trait: '재치 있고 발명적인', fortune: '다양한 재능으로 여러 수입원을 만드는 운입니다' },
  { name: '닭띠', animal: '🐓', element: '금(金)', trait: '근면하고 정확한', fortune: '꼼꼼한 관리로 재산을 불리는 운입니다' },
  { name: '개띠', animal: '🐕', element: '토(土)', trait: '충직하고 정의로운', fortune: '신뢰를 바탕으로 협력에서 성과를 내는 운입니다' },
  { name: '돼지띠', animal: '🐷', element: '수(水)', trait: '관대하고 낙천적인', fortune: '복이 많아 자연스럽게 재물이 모이는 운입니다' }
];

// ==================== 천간 · 지지 (사주 기초) ====================

const HEAVENLY_STEMS = [
  { name: '갑(甲)', element: '목(木)', yin_yang: '양', desc: '새싹처럼 강한 생명력' },
  { name: '을(乙)', element: '목(木)', yin_yang: '음', desc: '유연하게 뻗어가는 힘' },
  { name: '병(丙)', element: '화(火)', yin_yang: '양', desc: '태양처럼 밝은 에너지' },
  { name: '정(丁)', element: '화(火)', yin_yang: '음', desc: '촛불처럼 따뜻한 빛' },
  { name: '무(戊)', element: '토(土)', yin_yang: '양', desc: '산처럼 묵직한 안정감' },
  { name: '기(己)', element: '토(土)', yin_yang: '음', desc: '대지처럼 포용하는 힘' },
  { name: '경(庚)', element: '금(金)', yin_yang: '양', desc: '칼처럼 날카로운 결단력' },
  { name: '신(辛)', element: '금(金)', yin_yang: '음', desc: '보석처럼 빛나는 재능' },
  { name: '임(壬)', element: '수(水)', yin_yang: '양', desc: '바다처럼 깊은 지혜' },
  { name: '계(癸)', element: '수(水)', yin_yang: '음', desc: '이슬처럼 섬세한 감각' }
];

const EARTHLY_BRANCHES = [
  { name: '자(子)', animal: '쥐' },
  { name: '축(丑)', animal: '소' },
  { name: '인(寅)', animal: '호랑이' },
  { name: '묘(卯)', animal: '토끼' },
  { name: '진(辰)', animal: '용' },
  { name: '사(巳)', animal: '뱀' },
  { name: '오(午)', animal: '말' },
  { name: '미(未)', animal: '양' },
  { name: '신(申)', animal: '원숭이' },
  { name: '유(酉)', animal: '닭' },
  { name: '술(戌)', animal: '개' },
  { name: '해(亥)', animal: '돼지' }
];

// ==================== 오행 상생상극 ====================

const FIVE_ELEMENTS = {
  '목(木)': { color: '#22c55e', emoji: '🌿', generates: '화(火)', overcomes: '토(土)', meaning: '성장과 발전' },
  '화(火)': { color: '#ef4444', emoji: '🔥', generates: '토(土)', overcomes: '금(金)', meaning: '열정과 변화' },
  '토(土)': { color: '#eab308', emoji: '🏔️', generates: '금(金)', overcomes: '수(水)', meaning: '안정과 신뢰' },
  '금(金)': { color: '#a3a3a3', emoji: '⚔️', generates: '수(水)', overcomes: '목(木)', meaning: '결단과 정의' },
  '수(水)': { color: '#3b82f6', emoji: '💧', generates: '목(木)', overcomes: '화(火)', meaning: '지혜와 소통' }
};

// ==================== 운세 텍스트 풀 ====================

// 총운 (30개)
const GENERAL_FORTUNES = [
  { level: 5, text: "오늘은 모든 일이 순조롭게 풀리는 최고의 하루입니다. 자신감을 가지고 도전하세요. 주변 사람들의 도움도 기대할 수 있으며, 오랫동안 기다려온 결과가 나타날 수 있는 날입니다. 적극적으로 행동하면 큰 성과를 거둘 수 있습니다." },
  { level: 5, text: "하늘이 돕는 기운이 강한 날입니다. 새로운 시작이나 중요한 결정에 적합한 타이밍이에요. 직감이 특히 예리해져서 감으로 판단해도 좋은 결과를 얻을 수 있습니다. 망설이지 말고 앞으로 나아가세요." },
  { level: 5, text: "에너지가 충만하고 창의력이 빛나는 날입니다. 새로운 아이디어가 떠오를 수 있으니 메모해두세요. 사람들이 당신의 의견에 귀 기울이는 날이라 프레젠테이션이나 회의에서 좋은 반응을 얻을 수 있습니다." },
  { level: 4, text: "전반적으로 안정적이고 긍정적인 흐름입니다. 계획했던 일을 실행에 옮기기 좋은 날이에요. 다만 오후에는 약간의 피로감이 올 수 있으니 점심 후 가벼운 산책으로 에너지를 충전하세요." },
  { level: 4, text: "대인 관계에서 좋은 소식이 기대되는 날입니다. 오래된 인연에서 뜻밖의 도움이 올 수 있어요. 사교 활동에 적극적으로 참여하면 좋은 기회를 만날 수 있습니다. 미소를 잃지 마세요." },
  { level: 4, text: "꾸준히 해온 일의 성과가 드러나기 시작하는 날입니다. 조급함보다는 인내가 더 큰 보상을 가져다줍니다. 오늘 받는 작은 칭찬이나 인정이 큰 전환점이 될 수 있으니 겸손하게 받아들이세요." },
  { level: 4, text: "집중력이 높아지는 날이라 학습이나 업무 효율이 평소보다 좋습니다. 어려운 과제에 도전하기에 적합합니다. 다만 주변의 부탁은 가능한 범위 내에서만 들어주세요." },
  { level: 3, text: "평범하지만 안정적인 하루가 예상됩니다. 큰 변화보다는 일상의 소소한 행복에 집중하면 좋겠어요. 작은 것에 감사하는 마음이 더 큰 행운을 부를 수 있습니다." },
  { level: 3, text: "오전에는 약간의 혼란이 있을 수 있지만, 오후부터 점차 안정을 찾게 됩니다. 급한 결정보다는 천천히 생각하고 판단하는 것이 좋습니다. 저녁에는 휴식을 충분히 취하세요." },
  { level: 3, text: "생각이 많아질 수 있는 하루입니다. 오버씽킹보다는 몸을 움직이는 활동을 통해 에너지를 전환하세요. 가벼운 운동이나 산책이 기분 전환에 큰 도움이 됩니다." },
  { level: 3, text: "주변에서 여러 가지 제안이 들어올 수 있는 날입니다. 모든 것을 수용하기보다는 자신에게 정말 필요한 것을 선별하는 지혜가 필요합니다. 핵심에 집중하세요." },
  { level: 4, text: "타인과의 소통이 원활한 날입니다. 그동안 미뤄왔던 대화를 나누기에 좋은 시간이에요. 진심을 담아 표현하면 관계가 한층 깊어질 수 있습니다." },
  { level: 4, text: "실행력이 좋은 날입니다. 계획만 세우고 미뤄뒀던 일이 있다면 오늘 시작하세요. 첫 걸음을 내딛으면 놀라운 속도로 진행될 수 있습니다." },
  { level: 5, text: "기다려온 기회가 예고 없이 찾아올 수 있는 날입니다. 열린 마음으로 주변을 살펴보세요. 뜻밖의 만남이나 연락이 인생의 전환점이 될 수도 있습니다." },
  { level: 3, text: "체력 관리가 중요한 하루입니다. 무리하지 않는 선에서 활동하고, 충분한 수분 섭취와 영양 보충을 잊지 마세요. 건강이 최우선입니다." },
  { level: 4, text: "학습운이 강한 날입니다. 새로운 분야에 도전하거나 자격증 공부를 시작하기에 좋은 타이밍이에요. 오늘 시작한 공부가 미래의 큰 자산이 됩니다." },
  { level: 3, text: "예상치 못한 변수가 발생할 수 있지만, 유연하게 대처하면 오히려 좋은 기회로 전환할 수 있습니다. 상황을 당황하지 말고 차분하게 바라보세요." },
  { level: 4, text: "자신의 장점을 발휘할 기회가 오는 날입니다. 겸손하되 당당하게 자신을 표현하세요. 진정성 있는 태도가 주변의 신뢰를 얻는 열쇠입니다." },
  { level: 5, text: "횡재수가 보이는 날입니다. 평소 관심 있던 분야에서 뜻밖의 수익이 발생할 수 있어요. 다만 과욕은 금물이니 분수에 맞게 행동하세요." },
  { level: 3, text: "감정의 기복이 있을 수 있는 날입니다. 즉흥적인 결정보다는 한 박자 쉬고 생각하는 것이 좋습니다. 차 한 잔의 여유가 하루를 바꿀 수 있어요." },
  { level: 4, text: "팀워크가 빛나는 날입니다. 혼자 해결하려 하기보다 주변의 도움을 요청하면 더 좋은 결과를 얻을 수 있습니다. 함께할 때 시너지가 극대화됩니다." },
  { level: 3, text: "정리정돈에 좋은 날입니다. 오래된 물건이나 미뤄둔 서류를 정리하면 마음까지 가벼워집니다. 때로는 비움이 새로운 시작의 출발점이 됩니다." },
  { level: 4, text: "직감이 예리해지는 날입니다. 논리적 판단과 함께 감각적 판단도 신뢰해 보세요. 숫자와 관련된 일에서 좋은 결과가 기대됩니다." },
  { level: 5, text: "인복이 강한 날입니다. 귀인을 만날 확률이 높으니 사교 모임이나 네트워킹에 적극적으로 참여하세요. 오늘 만나는 사람이 미래의 중요한 파트너가 될 수 있습니다." },
  { level: 3, text: "균형이 중요한 하루입니다. 일과 휴식의 밸런스를 맞추세요. 한쪽에 치우치면 효율이 떨어집니다. 적절한 리듬으로 하루를 보내면 충만한 저녁을 맞이할 수 있습니다." },
  { level: 4, text: "오늘은 말보다 행동이 빛나는 날입니다. 묵묵히 실천하는 모습이 주변의 깊은 인상을 남길 수 있어요. 결과로 보여주는 하루를 만들어보세요." },
  { level: 4, text: "재물 흐름이 원활한 날입니다. 합리적인 소비와 저축의 균형을 맞추면 장기적으로 좋은 결과를 얻을 수 있어요. 충동구매만 조심하세요." },
  { level: 3, text: "주변 환경의 영향을 받기 쉬운 날입니다. 긍정적인 사람들과 함께하면 운기가 상승하고, 부정적인 환경에서는 에너지가 소모될 수 있으니 현명하게 선택하세요." },
  { level: 5, text: "오늘은 특별한 행운이 깃든 날입니다. 평소 하지 않던 새로운 시도가 예상 밖의 좋은 결과를 가져올 수 있어요. 두려워하지 말고 과감하게 행동하세요." },
  { level: 4, text: "신뢰가 쌓이는 날입니다. 약속을 지키고 성실하게 임하면 주변의 평판이 한층 높아집니다. 오늘의 작은 신용이 내일의 큰 기회로 연결됩니다." }
];

// 애정운 (20개)
const LOVE_FORTUNES = [
  { level: 5, text: "로맨틱한 에너지가 가득한 날! 연인이 있다면 특별한 데이트를 계획해보세요. 솔로라면 매력이 빛나는 날이니 적극적으로 사람들을 만나보세요." },
  { level: 4, text: "따뜻한 대화가 관계를 더 깊게 만드는 날입니다. 마음속 이야기를 솔직하게 나눠보세요. 상대방도 진심으로 다가올 것입니다." },
  { level: 3, text: "감정보다는 이성적인 판단이 필요한 날입니다. 사소한 오해가 생길 수 있으니 차분하게 대화하세요. 서로를 이해하려는 노력이 중요합니다." },
  { level: 4, text: "뜻밖의 사람에게서 호감을 느낄 수 있는 날입니다. 선입견을 버리고 열린 마음으로 사람을 바라보세요. 인연은 예상치 못한 곳에서 찾아옵니다." },
  { level: 5, text: "사랑 운이 최고조인 날! 커플은 서로에 대한 감사함을 표현하면 관계가 한층 단단해집니다. 솔로는 운명적인 만남의 기회가 올 수 있어요." },
  { level: 3, text: "관계에서 혼자만의 시간이 필요할 수 있는 날입니다. 상대방에게도 공간을 주고 자신을 돌보는 시간을 가져보세요. 건강한 거리감이 오히려 관계를 좋게 만듭니다." },
  { level: 4, text: "소통이 핵심인 날입니다. 말하지 않으면 상대방은 모릅니다. 마음을 용기 있게 표현하면 뜻밖의 좋은 반응을 얻을 수 있습니다." },
  { level: 3, text: "연애보다는 자기 발전에 집중하면 좋은 날입니다. 매력을 키우는 것이 결국 좋은 인연을 부르는 법이에요. 취미 활동이나 자기 관리에 투자하세요." },
  { level: 4, text: "오래된 관계에서 새로운 매력을 발견할 수 있는 날입니다. 함께한 시간의 소중함을 다시 느낄 수 있어요. 감사의 마음을 전해보세요." },
  { level: 5, text: "매력 지수가 최고인 날! 자연스러운 모습이 가장 아름다울 때입니다. 꾸밈없이 솔직한 모습을 보여주면 상대방의 마음을 사로잡을 수 있어요." },
  { level: 3, text: "질투나 의심보다는 믿음이 중요한 날입니다. 불필요한 걱정은 내려놓고, 상대방을 있는 그대로 받아들이세요." },
  { level: 4, text: "작은 배려가 큰 감동을 만드는 날입니다. 따뜻한 문자 한 통, 커피 한 잔의 센스가 관계를 환하게 밝힐 수 있어요." },
  { level: 3, text: "과거의 상처가 떠오를 수 있지만, 그것은 성장의 밑거름입니다. 과거에 얽매이지 말고 지금 이 순간에 집중하세요. 더 좋은 사랑이 기다리고 있습니다." },
  { level: 4, text: "주변 사람들의 중매운이 강한 날입니다. 소개팅이나 모임에 적극적으로 참여하면 좋은 만남이 있을 수 있어요." },
  { level: 5, text: "두 사람의 교감이 깊어지는 날입니다. 눈빛만으로도 마음이 통하는 특별한 순간을 경험할 수 있어요. 이 순간을 소중히 간직하세요." },
  { level: 4, text: "함께하는 활동이 관계에 활력을 불어넣는 날입니다. 새로운 취미를 함께 시작하거나 여행 계획을 세워보세요." },
  { level: 3, text: "감정 표현이 서투른 날일 수 있습니다. 말보다는 행동으로 사랑을 표현해보세요. 작은 선물이나 도움이 마음을 대신 전할 수 있습니다." },
  { level: 4, text: "사랑에 대한 확신이 커지는 날입니다. 흔들렸던 마음도 오늘은 단단해질 수 있어요. 직감을 믿어보세요." },
  { level: 3, text: "다른 사람과 비교하지 마세요. 당신만의 사랑 스토리는 세상에 하나뿐입니다. 자신감을 가지고 자신만의 방식으로 사랑하세요." },
  { level: 4, text: "유머와 웃음이 관계의 윤활유인 날입니다. 너무 심각해지지 말고, 가볍고 즐거운 대화로 분위기를 밝히세요." }
];

// 금전운 (20개)
const MONEY_FORTUNES = [
  { level: 5, text: "재물운이 폭발하는 날! 예상치 못한 수입이 있을 수 있습니다. 투자 관련 정보에 귀를 기울여보세요. 다만 욕심은 금물, 적절한 선에서 멈출 줄 아는 지혜가 필요합니다." },
  { level: 4, text: "금전 흐름이 원활한 날입니다. 합리적인 소비 계획을 세우면 좋은 결과를 얻을 수 있어요. 필요한 것과 원하는 것을 구분하는 안목이 빛날 것입니다." },
  { level: 3, text: "지출이 늘어날 수 있는 날이니 충동구매를 조심하세요. 꼭 필요한 소비인지 한 번 더 생각해보는 것이 좋습니다. 저축 습관을 되새겨보세요." },
  { level: 4, text: "부업이나 사이드 프로젝트에서 좋은 소식이 있을 수 있습니다. 꾸준히 준비해온 것들이 수익으로 연결될 타이밍이에요." },
  { level: 5, text: "대박의 기운이 감지됩니다! 적극적인 투자보다는 직감적인 선택이 좋은 결과를 가져올 수 있어요. 행운의 숫자에 관심을 가져보세요." },
  { level: 3, text: "보수적인 금전 관리가 필요한 날입니다. 큰 투자나 계약은 며칠 후로 미루는 것이 안전합니다. 안정적인 자산 관리에 집중하세요." },
  { level: 4, text: "숨은 수입원을 발견할 수 있는 날입니다. 가지고 있는 자산이나 기술을 다시 점검해보세요. 의외의 곳에서 돈이 될 만한 것을 찾을 수 있습니다." },
  { level: 3, text: "다른 사람과의 금전 거래는 신중하게! 빌려주거나 보증 서는 일은 가능하면 피하세요. 돈 문제로 관계가 틀어질 수 있으니 조심하세요." },
  { level: 4, text: "장기 투자의 관점에서 좋은 기회가 보이는 날입니다. 단기 수익보다는 장기적인 자산 형성에 초점을 맞추면 좋은 결과를 얻을 수 있습니다." },
  { level: 5, text: "금전적 행운이 강한 날! 뜻밖의 보너스, 환급금, 또는 오래전 빌려줬던 돈이 돌아올 수 있습니다. 감사한 마음으로 받아들이세요." },
  { level: 3, text: "절약이 미덕인 날입니다. 화려한 소비보다는 알뜰한 생활이 장기적으로 더 큰 부를 만들어줍니다. 가계부를 작성해보세요." },
  { level: 4, text: "전문가의 조언이 도움이 되는 날입니다. 재테크 관련 책이나 강의를 접하면 좋은 인사이트를 얻을 수 있어요." },
  { level: 4, text: "부동산이나 자산 관련 긍정적인 소식이 있을 수 있습니다. 관심 있던 매물이 있다면 정보를 수집해보세요. 다만 서두르지는 마세요." },
  { level: 3, text: "카드 사용을 줄이고 현금 위주로 생활하면 좋은 날입니다. 지출을 눈으로 확인하면 절약 의식이 높아집니다." },
  { level: 5, text: "재물의 신이 함께하는 날입니다! 평소 관심 있던 분야에서 수익 기회가 올 수 있어요. 준비된 자에게 행운이 찾아옵니다." },
  { level: 4, text: "동료나 지인으로부터 좋은 투자 정보를 들을 수 있는 날입니다. 다만 맹신하지 말고 본인의 분석을 더해 판단하세요." },
  { level: 3, text: "고정 지출을 점검하면 좋은 날입니다. 불필요한 구독이나 멤버십을 정리하면 의외로 큰 절약이 될 수 있어요." },
  { level: 4, text: "자기 개발에 투자하면 미래의 수입으로 돌아오는 날입니다. 교육, 자격증, 스킬 향상에 쓰는 돈은 아깝지 않습니다." },
  { level: 4, text: "사업 아이디어가 떠오를 수 있는 날입니다. 당장 실행하기보다는 아이디어를 잘 메모해두고 가능성을 검토해보세요." },
  { level: 3, text: "공과금이나 세금 등 해야 할 납부를 미리 챙기면 마음이 편안해지는 날입니다. 미루지 말고 정리하세요." }
];

// 건강운 (15개)
const HEALTH_FORTUNES = [
  { level: 5, text: "활력이 넘치는 하루! 운동하기에 최적의 컨디션입니다. 새로운 운동을 시작하거나 평소보다 강도를 높여보세요." },
  { level: 4, text: "심신의 균형이 좋은 날입니다. 요가나 명상으로 내면의 평화를 찾아보세요. 스트레스 관리가 잘 되는 날이에요." },
  { level: 3, text: "수면의 질에 신경 쓰면 좋은 날입니다. 일찍 잠자리에 들고 전자기기 사용을 줄여보세요. 양질의 수면이 내일의 에너지를 만듭니다." },
  { level: 4, text: "소화 기능이 활발한 날이라 영양 섭취가 잘 됩니다. 제철 과일이나 채소를 충분히 먹으면 좋겠어요." },
  { level: 3, text: "눈과 어깨의 피로가 쌓일 수 있는 날입니다. 1시간마다 스트레칭을 하고, 눈의 휴식을 챙기세요. 자세 교정도 중요합니다." },
  { level: 4, text: "야외 활동이 건강에 좋은 날입니다. 점심시간에 잠깐이라도 산책하면 오후 업무 효율이 올라갑니다." },
  { level: 5, text: "체력이 최상인 날! 마라톤이든 등산이든 체력적 도전에 나서보세요. 오늘의 성취가 건강한 습관의 시작이 될 수 있습니다." },
  { level: 3, text: "과식이나 과음을 조심하세요. 절제된 식사가 내일의 컨디션을 좌우합니다. 물을 충분히 마시는 것도 잊지 마세요." },
  { level: 4, text: "면역력이 좋은 날이지만, 갑작스러운 기온 변화에 대비하세요. 옷차림에 신경 쓰고, 따뜻한 차를 가까이하세요." },
  { level: 3, text: "정신 건강이 중요한 날입니다. 스트레스를 받는 상황에서 벗어나 좋아하는 음악을 듣거나 취미 활동을 하세요." },
  { level: 4, text: "가벼운 홈트레이닝으로 하루를 시작하면 좋은 날입니다. 아침 운동이 하루 전체의 에너지 레벨을 높여줍니다." },
  { level: 5, text: "회복력이 좋은 날입니다. 최근 아팠던 부분이 호전되거나, 피로가 빠르게 풀리는 것을 느낄 수 있어요." },
  { level: 3, text: "무리하지 않는 것이 최고의 건강 관리인 날입니다. 완벽하려 하지 말고, 70% 정도의 힘으로 하루를 보내세요." },
  { level: 4, text: "규칙적인 생활이 건강의 비결인 날입니다. 정해진 시간에 식사하고, 정해진 시간에 잠자리에 드세요." },
  { level: 4, text: "비타민과 미네랄 보충이 효과적인 날입니다. 균형 잡힌 식단과 함께 건강 보조제를 챙겨 드세요." }
];

// 직장/학업운 (20개)
const CAREER_FORTUNES = [
  { level: 5, text: "업무 능력이 빛나는 날! 프로젝트에서 좋은 성과를 거둘 수 있습니다. 상사의 눈에 띄는 기회가 올 수 있으니 준비하세요." },
  { level: 4, text: "팀워크가 좋은 날입니다. 동료와의 협업이 순조롭고, 의견 조율이 수월합니다. 함께 이루는 성과가 더 크게 느껴질 거예요." },
  { level: 3, text: "집중력이 흐트러질 수 있는 날이니 중요한 업무는 오전에 처리하세요. 오후에는 단순 작업이나 정리 업무를 하면 효율적입니다." },
  { level: 4, text: "새로운 기회를 탐색하기 좋은 날입니다. 이직이나 승진을 고민하고 있다면 정보를 수집하고 준비하세요." },
  { level: 5, text: "리더십이 빛나는 날! 프레젠테이션이나 미팅에서 인상적인 모습을 보일 수 있습니다. 자신감 있게 의견을 제시하세요." },
  { level: 3, text: "꼼꼼함이 필요한 날입니다. 서류 작성이나 보고서에서 실수가 없는지 한 번 더 확인하세요. 디테일이 전체 인상을 좌우합니다." },
  { level: 4, text: "학습 효율이 높은 날입니다. 새로운 것을 배우거나 자격증 공부를 하기에 최적의 타이밍이에요." },
  { level: 3, text: "직장 내 인간관계에 주의가 필요합니다. 불필요한 갈등을 피하고, 중립적인 입장을 유지하는 것이 현명합니다." },
  { level: 4, text: "창의적 아이디어가 인정받는 날입니다. 기발한 제안을 주저하지 말고 공유하세요. 예상외의 긍정적 반응을 얻을 수 있습니다." },
  { level: 5, text: "승진이나 인사에서 좋은 소식이 기대되는 날입니다. 그동안의 노력이 결실을 맺을 수 있어요. 감사한 마음으로 받아들이세요." },
  { level: 3, text: "멀티태스킹보다는 하나에 집중하는 것이 효과적인 날입니다. 우선순위를 정하고 순서대로 처리하면 생산성이 올라갑니다." },
  { level: 4, text: "네트워킹에 좋은 날입니다. 업계 사람들과의 교류가 미래의 기회로 이어질 수 있어요. 명함을 챙기세요." },
  { level: 4, text: "마감이 다가오는 일이 있다면 오늘 집중해서 마무리하세요. 추진력이 좋은 날이라 예상보다 빨리 끝낼 수 있습니다." },
  { level: 3, text: "회의가 길어질 수 있는 날입니다. 핵심을 먼저 전달하고, 간결하게 소통하면 시간을 절약할 수 있어요." },
  { level: 4, text: "자기 PR이 중요한 날입니다. 겸손도 좋지만, 본인의 성과와 능력을 적절히 어필하는 것도 필요합니다." },
  { level: 5, text: "이직이나 새로운 시작에 행운이 따르는 날입니다. 준비된 기회가 왔다면 망설이지 말고 잡으세요." },
  { level: 3, text: "정보 보안에 신경 쓰면 좋은 날입니다. 중요한 파일은 백업하고, 비밀번호 관리를 점검하세요." },
  { level: 4, text: "멘토나 선배의 조언이 큰 도움이 되는 날입니다. 궁금한 것이 있다면 적극적으로 물어보세요." },
  { level: 4, text: "발표나 면접이 있다면 자신감이 최고의 무기입니다. 준비한 만큼 좋은 결과가 따를 거예요. 파이팅!" },
  { level: 3, text: "야근보다는 효율적인 시간 관리가 중요한 날입니다. 집중할 때 집중하고, 쉴 때 확실히 쉬세요." }
];

// 행운 아이템 & 컬러
const LUCKY_ITEMS = [
  '보라색 액세서리', '나무 소재 시계', '흰색 머그컵', '가죽 지갑', '실버 반지',
  '파란색 펜', '향초', '원목 책상 소품', '미니 화분', '골드 열쇠고리',
  '체크무늬 손수건', '천연 비누', '수정 팔찌', '에코백', '양말 세트',
  '아로마 디퓨저', '네잎클로버 북마크', '터콰이즈 귀걸이', '기호 스티커', '가죽 노트'
];

const LUCKY_COLORS = [
  { name: '레드', hex: '#ef4444', meaning: '열정과 에너지' },
  { name: '블루', hex: '#3b82f6', meaning: '안정과 신뢰' },
  { name: '그린', hex: '#22c55e', meaning: '성장과 치유' },
  { name: '퍼플', hex: '#a855f7', meaning: '영감과 고귀함' },
  { name: '골드', hex: '#eab308', meaning: '풍요와 행운' },
  { name: '핑크', hex: '#ec4899', meaning: '사랑과 행복' },
  { name: '오렌지', hex: '#f97316', meaning: '활력과 창의' },
  { name: '화이트', hex: '#f5f5f5', meaning: '순수와 새 시작' },
  { name: '네이비', hex: '#1e3a5f', meaning: '지혜와 품격' },
  { name: '민트', hex: '#2dd4bf', meaning: '평화와 균형' }
];

const LUCKY_DIRECTIONS = ['동쪽', '서쪽', '남쪽', '북쪽', '동남쪽', '서남쪽', '동북쪽', '서북쪽'];

// 오늘의 조언 (20개)
const DAILY_ADVICE = [
  "오늘 하루 가장 먼저 해야 할 일을 3가지만 정하고 시작하세요.",
  "감사한 일 3가지를 떠올리며 하루를 시작하면 행운이 따릅니다.",
  "오후 3시경 가벼운 간식과 함께 잠깐의 휴식을 가져보세요.",
  "오늘은 평소 가지 않는 길로 걸어보세요. 새로운 발견이 있을 거예요.",
  "중요한 결정은 점심 식사 후에 하면 더 현명한 판단을 내릴 수 있어요.",
  "오늘 만나는 사람에게 진심 어린 칭찬 한 마디를 건네보세요.",
  "잠들기 전 10분간 하루를 돌아보며 좋았던 순간을 기억해보세요.",
  "물을 평소보다 한 잔 더 마시면 컨디션이 좋아질 거예요.",
  "오래 연락하지 못한 사람에게 안부 메시지를 보내보세요.",
  "하루에 5분이라도 조용한 시간을 가져보세요. 마음이 맑아집니다.",
  "오늘은 새로운 음악을 들어보세요. 기분이 전환될 거예요.",
  "점심시간에 창가 자리에 앉아보세요. 햇빛이 에너지를 충전해줍니다.",
  "오늘의 목표를 종이에 적어보세요. 적으면 이루어지는 법이에요.",
  "짧은 스트레칭으로 하루를 시작하면 집중력이 높아집니다.",
  "오늘은 SNS를 줄이고 현실의 순간에 집중해보세요.",
  "가방 속을 정리하면 마음도 가벼워집니다. 시간을 내어 정리해보세요.",
  "오늘은 '아니오'라고 말하는 연습을 해보세요. 경계는 건강한 것입니다.",
  "좋은 향이 나는 핸드크림이나 향수를 사용해보세요. 기분이 좋아집니다.",
  "잠깐이라도 하늘을 올려다보세요. 시야가 넓어지면 생각도 넓어집니다.",
  "오늘 저녁에는 좋아하는 음식으로 자신을 대접해보세요."
];

// ==================== 해시 함수 ====================

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// 두 번째 해시 (다양한 결과용)
function hashCode2(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 7) + hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// ==================== 별자리 계산 ====================

function getZodiacSign(month, day) {
  const m = parseInt(month);
  const d = parseInt(day);
  if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return 0;  // 물병
  if ((m === 2 && d >= 19) || (m === 3 && d <= 20)) return 1;  // 물고기
  if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return 2;  // 양
  if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return 3;  // 황소
  if ((m === 5 && d >= 21) || (m === 6 && d <= 21)) return 4;  // 쌍둥이
  if ((m === 6 && d >= 22) || (m === 7 && d <= 22)) return 5;  // 게
  if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return 6;  // 사자
  if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return 7;  // 처녀
  if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return 8; // 천칭
  if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return 9; // 전갈
  if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return 10; // 사수
  return 11; // 염소
}

// ==================== 띠 계산 ====================

function getChineseZodiac(year) {
  return (parseInt(year) - 4) % 12;
}

// ==================== 사주 천간·지지 계산 ====================

function getHeavenlyStem(year) {
  return (parseInt(year) - 4) % 10;
}

function getEarthlyBranch(year) {
  return (parseInt(year) - 4) % 12;
}

// ==================== 오행 계산 ====================

function getMainElement(year) {
  const stem = getHeavenlyStem(year);
  return HEAVENLY_STEMS[stem].element;
}

// ==================== 오늘의 운세 생성 (핵심 엔진) ====================

function generateFortune(name, gender, birthYear, birthMonth, birthDay) {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  // 유저 고유키 + 오늘 날짜 → 매일 다른 결과
  const baseKey = name + gender + birthYear + birthMonth + birthDay;
  const dailyKey = baseKey + dateStr;

  const h1 = hashCode(dailyKey);
  const h2 = hashCode2(dailyKey);
  const h3 = hashCode(dailyKey + 'extra');
  const h4 = hashCode2(dailyKey + 'more');
  const h5 = hashCode(dailyKey + 'luck');

  // 별자리 / 띠 / 사주
  const zodiacIdx = getZodiacSign(birthMonth, birthDay);
  const chineseIdx = getChineseZodiac(birthYear);
  const stemIdx = getHeavenlyStem(birthYear);
  const branchIdx = getEarthlyBranch(birthYear);
  const mainElement = getMainElement(birthYear);

  // 운세 텍스트 선택
  const general = GENERAL_FORTUNES[h1 % GENERAL_FORTUNES.length];
  const love = LOVE_FORTUNES[h2 % LOVE_FORTUNES.length];
  const money = MONEY_FORTUNES[h3 % MONEY_FORTUNES.length];
  const health = HEALTH_FORTUNES[h4 % HEALTH_FORTUNES.length];
  const career = CAREER_FORTUNES[h5 % CAREER_FORTUNES.length];

  // 행운 요소
  const luckyNumber = (h1 % 45) + 1;
  const luckyNumber2 = (h2 % 45) + 1;
  const luckyItem = LUCKY_ITEMS[h3 % LUCKY_ITEMS.length];
  const luckyColor = LUCKY_COLORS[h4 % LUCKY_COLORS.length];
  const luckyDirection = LUCKY_DIRECTIONS[h5 % LUCKY_DIRECTIONS.length];
  const advice = DAILY_ADVICE[h1 % DAILY_ADVICE.length];

  // 종합 운세 점수 (0~100)
  const scores = [general.level, love.level, money.level, health.level, career.level];
  const avgLevel = scores.reduce((a, b) => a + b, 0) / scores.length;
  const overallScore = Math.round((avgLevel / 5) * 100);

  // 오행 상생 보너스
  const elementInfo = FIVE_ELEMENTS[mainElement];

  return {
    name,
    gender,
    birthYear,
    birthMonth,
    birthDay,
    date: dateStr,
    zodiac: ZODIAC_SIGNS[zodiacIdx],
    chineseZodiac: CHINESE_ZODIAC[chineseIdx],
    heavenlyStem: HEAVENLY_STEMS[stemIdx],
    earthlyBranch: EARTHLY_BRANCHES[branchIdx],
    mainElement: mainElement,
    elementInfo: elementInfo,
    overallScore,
    general,
    love,
    money,
    health,
    career,
    luckyNumbers: [luckyNumber, luckyNumber2 === luckyNumber ? ((luckyNumber2 % 44) + 1) : luckyNumber2],
    luckyItem,
    luckyColor,
    luckyDirection,
    advice
  };
}

// ==================== 점수 → 등급 텍스트 ====================

function getGradeText(level) {
  switch (level) {
    case 5: return '최고';
    case 4: return '좋음';
    case 3: return '보통';
    case 2: return '주의';
    default: return '보통';
  }
}

function getGradeColor(level) {
  switch (level) {
    case 5: return 'text-red-500';
    case 4: return 'text-orange-500';
    case 3: return 'text-yellow-600';
    case 2: return 'text-blue-500';
    default: return 'text-gray-500';
  }
}

function getGradeBg(level) {
  switch (level) {
    case 5: return 'bg-red-50 border-red-200';
    case 4: return 'bg-orange-50 border-orange-200';
    case 3: return 'bg-yellow-50 border-yellow-200';
    case 2: return 'bg-blue-50 border-blue-200';
    default: return 'bg-gray-50 border-gray-200';
  }
}

function getScoreEmoji(score) {
  if (score >= 85) return '🔥';
  if (score >= 70) return '✨';
  if (score >= 55) return '🌤️';
  return '🌥️';
}

// ==================== UI 함수 ====================

function selectGender(gender) {
  selectedGender = gender;
  const maleBtn = document.getElementById('genderMale');
  const femaleBtn = document.getElementById('genderFemale');
  maleBtn.classList.remove('border-amber-500', 'bg-amber-50', 'text-amber-700');
  femaleBtn.classList.remove('border-amber-500', 'bg-amber-50', 'text-amber-700');
  if (gender === 'male') {
    maleBtn.classList.add('border-amber-500', 'bg-amber-50', 'text-amber-700');
  } else {
    femaleBtn.classList.add('border-amber-500', 'bg-amber-50', 'text-amber-700');
  }
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

function autoFocusNext(currentInput, nextId, maxLength) {
  if (currentInput.value.length >= maxLength) {
    const nextInput = document.getElementById(nextId);
    if (nextInput) nextInput.focus();
  }
}

function getBirthDate() {
  const year = document.getElementById('birthYear').value.trim();
  const month = document.getElementById('birthMonth').value.trim().padStart(2, '0');
  const day = document.getElementById('birthDay').value.trim().padStart(2, '0');
  if (!year || !month || !day) return null;
  if (year.length !== 4) return null;
  return { year, month, day, full: `${year}-${month}-${day}` };
}

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

// ==================== localStorage 함수 ====================

function getSavedUserInfo() {
  try {
    const data = localStorage.getItem(FORTUNE_STORAGE.USER);
    return data ? JSON.parse(data) : null;
  } catch (e) { return null; }
}

function getSavedResult() {
  try {
    const data = localStorage.getItem(FORTUNE_STORAGE.RESULT);
    return data ? JSON.parse(data) : null;
  } catch (e) { return null; }
}

function saveUserInfo(name, gender, birthYear, birthMonth, birthDay) {
  localStorage.setItem(FORTUNE_STORAGE.USER, JSON.stringify({ name, gender, birthYear, birthMonth, birthDay }));
  localStorage.setItem(FORTUNE_STORAGE.REMEMBER, 'true');
}

function saveFortuneResult(result) {
  localStorage.setItem(FORTUNE_STORAGE.RESULT, JSON.stringify(result));
}

function clearSavedData() {
  localStorage.removeItem(FORTUNE_STORAGE.USER);
  localStorage.removeItem(FORTUNE_STORAGE.RESULT);
  localStorage.removeItem(FORTUNE_STORAGE.REMEMBER);
}

// ==================== Step 0 초기화 ====================

function getTodayDateStr() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
}

function initDailyFortune() {
  const remember = localStorage.getItem(FORTUNE_STORAGE.REMEMBER);
  const userInfo = getSavedUserInfo();

  if (remember === 'true' && userInfo) {
    const savedResult = getSavedResult();
    const hasResultToday = savedResult && savedResult.date === getTodayDateStr();
    setupWelcomeScreen(userInfo, hasResultToday);
    showStep(0);
  } else {
    showStep(1);
  }
}

function setupWelcomeScreen(userInfo, hasResultToday) {
  const titleEl = document.getElementById('welcomeTitle');
  const subtitleEl = document.getElementById('welcomeSubtitle');
  const ctaBtn = document.getElementById('welcomeCta');

  if (hasResultToday) {
    titleEl.textContent = `${userInfo.name}님! 좋은 하루 보내세요!`;
    subtitleEl.textContent = '오늘의 운세가 준비되어 있어요';
    ctaBtn.textContent = '오늘의 운세 다시 보기';
  } else {
    titleEl.textContent = `${userInfo.name}님! 오늘의 운세가 도착했어요!`;
    subtitleEl.textContent = '별자리 · 띠 · 사주로 보는 나만의 운세 풀이';
    ctaBtn.textContent = '오늘의 운세 풀이 보기';
  }
}

function handleWelcomeCta() {
  const userInfo = getSavedUserInfo();
  if (!userInfo) { showStep(1); return; }

  const savedResult = getSavedResult();
  const hasResultToday = savedResult && savedResult.date === getTodayDateStr();

  if (hasResultToday) {
    // 캐시된 결과 즉시 표시
    fortuneResult = savedResult;
    showStep(3);
    displayResult();
  } else {
    // 새 운세 생성
    selectedGender = userInfo.gender;
    fortuneResult = generateFortune(userInfo.name, userInfo.gender, userInfo.birthYear, userInfo.birthMonth, userInfo.birthDay);
    saveFortuneResult(fortuneResult);
    saveToFirebase(fortuneResult);
    showStep(2);
    startLoadingAnimation();
  }
}

function goToInputForm() {
  // 저장 정보 삭제 + 입력 폼 초기화
  clearSavedData();
  document.getElementById('userName').value = '';
  document.getElementById('birthYear').value = '';
  document.getElementById('birthMonth').value = '';
  document.getElementById('birthDay').value = '';
  const rememberMe = document.getElementById('rememberMe');
  if (rememberMe) rememberMe.checked = false;
  const agreeTerms = document.getElementById('agreeTerms');
  if (agreeTerms) agreeTerms.checked = false;
  selectedGender = null;
  const maleBtn = document.getElementById('genderMale');
  const femaleBtn = document.getElementById('genderFemale');
  if (maleBtn) maleBtn.classList.remove('border-amber-500', 'bg-amber-50', 'text-amber-700');
  if (femaleBtn) femaleBtn.classList.remove('border-amber-500', 'bg-amber-50', 'text-amber-700');
  showStep(1);
}

// ==================== 분석 시작 ====================

function startFortune() {
  const name = document.getElementById('userName').value.trim();
  const agreeTerms = document.getElementById('agreeTerms').checked;

  if (!name) { showToast('이름을 입력해주세요'); return; }
  if (!selectedGender) { showToast('성별을 선택해주세요'); return; }
  if (!validateBirthDate()) return;
  if (!agreeTerms) { showToast('개인정보 수집에 동의해주세요'); return; }

  const birth = getBirthDate();
  fortuneResult = generateFortune(name, selectedGender, birth.year, birth.month, birth.day);

  // 내 정보 기억하기 처리
  const rememberMe = document.getElementById('rememberMe');
  if (rememberMe && rememberMe.checked) {
    saveUserInfo(name, selectedGender, birth.year, birth.month, birth.day);
    saveFortuneResult(fortuneResult);
  } else {
    clearSavedData();
  }

  // Firebase 저장
  saveToFirebase(fortuneResult);

  // Step 2 로딩
  showStep(2);
  startLoadingAnimation();
}

// ==================== 로딩 애니메이션 ====================

function startLoadingAnimation() {
  const messages = [
    '별자리 에너지를 읽고 있어요...',
    '띠별 운세를 확인하고 있어요...',
    '사주 팔자를 분석 중이에요...',
    '오행의 흐름을 파악 중이에요...',
    '오늘의 운세를 종합하고 있어요...'
  ];

  let progress = 0;
  let msgIdx = 0;
  const progressBar = document.getElementById('loadingProgress');
  const percentText = document.getElementById('loadingPercent');
  const msgText = document.getElementById('loadingMessage');

  const interval = setInterval(() => {
    progress += Math.random() * 12 + 3;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        showStep(3);
        displayResult();
      }, 500);
    }

    const newIdx = Math.min(Math.floor(progress / 20), messages.length - 1);
    if (newIdx !== msgIdx) {
      msgIdx = newIdx;
      msgText.textContent = messages[msgIdx];
    }

    progressBar.style.width = progress + '%';
    percentText.textContent = Math.floor(progress);
  }, 250);
}

// ==================== 결과 표시 ====================

function displayResult() {
  const r = fortuneResult;

  // 헤더
  document.getElementById('resultName').textContent = r.name;
  document.getElementById('resultDate').textContent = formatDate(r.date);
  document.getElementById('resultScore').textContent = r.overallScore;
  document.getElementById('resultScoreEmoji').textContent = getScoreEmoji(r.overallScore);

  // 프로필 요약
  document.getElementById('resultZodiac').textContent = `${r.zodiac.symbol} ${r.zodiac.name}`;
  document.getElementById('resultChinese').textContent = `${r.chineseZodiac.animal} ${r.chineseZodiac.name}`;
  document.getElementById('resultSaju').textContent = `${r.heavenlyStem.name} ${r.earthlyBranch.name}`;
  document.getElementById('resultElement').textContent = `${r.elementInfo.emoji} ${r.mainElement}`;

  // 별자리 상세
  document.getElementById('zodiacDetail').textContent = `${r.zodiac.trait} 성향 · ${r.zodiac.element} 원소 · 수호성: ${r.zodiac.ruling}`;
  document.getElementById('chineseDetail').textContent = `${r.chineseZodiac.trait} 성향 · ${r.chineseZodiac.element} · ${r.chineseZodiac.fortune}`;
  document.getElementById('sajuDetail').textContent = `${r.heavenlyStem.desc} · ${r.elementInfo.meaning}의 기운`;

  // 카테고리별 운세
  renderFortuneCategory('general', '총운', '🌟', r.general);
  renderFortuneCategory('love', '애정운', '💕', r.love);
  renderFortuneCategory('money', '금전운', '💰', r.money);
  renderFortuneCategory('health', '건강운', '💪', r.health);
  renderFortuneCategory('career', '직장/학업운', '📈', r.career);

  // 행운 요소
  document.getElementById('luckyNumbers').textContent = r.luckyNumbers.join(', ');
  document.getElementById('luckyItem').textContent = r.luckyItem;
  document.getElementById('luckyColorName').textContent = r.luckyColor.name;
  document.getElementById('luckyColorDot').style.backgroundColor = r.luckyColor.hex;
  document.getElementById('luckyColorMeaning').textContent = r.luckyColor.meaning;
  document.getElementById('luckyDirection').textContent = r.luckyDirection;

  // 오늘의 조언
  document.getElementById('dailyAdvice').textContent = r.advice;

  // 점수 바 애니메이션
  requestAnimationFrame(() => {
    document.getElementById('scoreBar').style.width = r.overallScore + '%';
  });
}

function renderFortuneCategory(id, title, emoji, data) {
  const container = document.getElementById(`fortune-${id}`);
  const gradeText = getGradeText(data.level);
  const gradeColor = getGradeColor(data.level);
  const gradeBg = getGradeBg(data.level);
  const barWidth = (data.level / 5) * 100;

  container.innerHTML = `
    <div class="border rounded-2xl p-4 ${gradeBg}">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <span class="text-lg">${emoji}</span>
          <span class="font-bold text-gray-900">${title}</span>
        </div>
        <span class="text-sm font-bold ${gradeColor}">${gradeText}</span>
      </div>
      <div class="h-2 bg-white/60 rounded-full overflow-hidden mb-3">
        <div class="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700 ease-out" style="width: ${barWidth}%"></div>
      </div>
      <p class="text-sm text-gray-700 leading-relaxed">${data.text}</p>
    </div>
  `;
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일 (${days[date.getDay()]})`;
}

// ==================== Firebase 저장 ====================

async function saveToFirebase(result) {
  try {
    await db.collection('daily_fortune_results').add({
      name: result.name,
      gender: result.gender,
      birthYear: result.birthYear,
      birthMonth: result.birthMonth,
      birthDay: result.birthDay,
      date: result.date,
      zodiac: result.zodiac.name,
      chineseZodiac: result.chineseZodiac.name,
      mainElement: result.mainElement,
      overallScore: result.overallScore,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log('Daily fortune result saved to Firebase');
  } catch (error) {
    console.error('Error saving to Firebase:', error);
  }
}

// ==================== 스텝 전환 ====================

function showStep(stepNumber) {
  document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
  document.getElementById('step' + stepNumber).classList.add('active');
  window.scrollTo(0, 0);
}

// ==================== 공유 & 다시하기 ====================

function shareResult() {
  const shareUrl = window.location.origin + '/dunsmile/daily-fortune/';
  const shareText = `오늘의 운세 종합 점수 ${fortuneResult.overallScore}점! ${getScoreEmoji(fortuneResult.overallScore)} 나의 별자리 ${fortuneResult.zodiac.name}, ${fortuneResult.chineseZodiac.name} 운세를 확인해보세요!`;

  if (navigator.share) {
    navigator.share({
      title: '오늘의 운세 | HOXY',
      text: shareText,
      url: shareUrl
    }).catch(console.error);
  } else {
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('링크가 복사되었습니다!');
    }).catch(() => {
      showToast('공유를 지원하지 않는 브라우저입니다');
    });
  }
}

async function downloadFortuneShareCard() {
  if (!fortuneResult) {
    showToast('먼저 운세 결과를 생성해주세요');
    return;
  }
  if (!window.DopaminShareCard) {
    showToast('공유 카드 기능을 불러오지 못했습니다');
    return;
  }

  await window.DopaminShareCard.download({
    title: '오늘의 운세',
    subtitle: `${fortuneResult.name}님의 결과`,
    highlight: `종합 점수 ${fortuneResult.overallScore}점`,
    tags: [
      fortuneResult.zodiac.name,
      fortuneResult.chineseZodiac.name,
      fortuneResult.mainElement
    ],
    footer: 'dopamine-factory.pages.dev/dunsmile/daily-fortune/',
    fromColor: '#f59e0b',
    toColor: '#f97316',
    filePrefix: 'daily-fortune'
  });
  showToast('결과 이미지 카드가 저장되었습니다!');
}

function retakeFortune() {
  selectedGender = null;
  fortuneResult = null;

  const remember = localStorage.getItem(FORTUNE_STORAGE.REMEMBER);
  const userInfo = getSavedUserInfo();

  if (remember === 'true' && userInfo) {
    const savedResult = getSavedResult();
    const hasResultToday = savedResult && savedResult.date === getTodayDateStr();
    setupWelcomeScreen(userInfo, hasResultToday);
    showStep(0);
  } else {
    document.getElementById('userName').value = '';
    document.getElementById('birthYear').value = '';
    document.getElementById('birthMonth').value = '';
    document.getElementById('birthDay').value = '';
    document.getElementById('agreeTerms').checked = false;
    document.getElementById('genderMale').classList.remove('border-amber-500', 'bg-amber-50', 'text-amber-700');
    document.getElementById('genderFemale').classList.remove('border-amber-500', 'bg-amber-50', 'text-amber-700');
    showStep(1);
  }
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
window.startFortune = startFortune;
window.shareResult = shareResult;
window.downloadFortuneShareCard = downloadFortuneShareCard;
window.retakeFortune = retakeFortune;
window.openServiceMenu = openServiceMenu;
window.closeServiceMenu = closeServiceMenu;
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.autoFocusNext = autoFocusNext;
window.handleWelcomeCta = handleWelcomeCta;
window.goToInputForm = goToInputForm;

// 페이지 로드 시 초기화
initDailyFortune();
