// ==================== ONE DAY MY CARD 타로 리딩 로직 ====================

// 상태 관리
let selectedGender = null;
let selectedSpread = 'one'; // 'one' or 'three'
let selectedCategory = null; // 'love', 'money', 'career', 'health'
let tarotResult = null;

// localStorage 키 상수
const TAROT_STORAGE = {
  USER: 'hoxy_tarot_user',
  RESULT: 'hoxy_tarot_result',
  REMEMBER: 'hoxy_tarot_remember'
};

// ==================== 메이저 아르카나 22장 ====================

const MAJOR_ARCANA = [
  {
    id: 0, name: '바보', nameEn: 'The Fool', symbol: '🃏',
    upKeywords: ['새로운 시작', '자유', '모험'],
    reversedKeywords: ['무모함', '부주의', '방황'],
    upMeaning: {
      love: '새로운 인연이 찾아올 수 있는 시기입니다. 열린 마음으로 다가오는 사람을 받아들여보세요.',
      money: '새로운 투자 기회가 보입니다. 너무 큰 금액보다는 소액으로 시작해보세요.',
      career: '새로운 프로젝트나 직무에 도전할 좋은 타이밍입니다. 두려워하지 마세요.',
      health: '새로운 운동이나 건강 습관을 시작하기에 좋은 때입니다.'
    },
    reversedMeaning: {
      love: '성급한 판단을 조심하세요. 상대를 충분히 알아가는 시간이 필요합니다.',
      money: '충동적인 소비나 투자를 조심하세요. 신중한 판단이 필요합니다.',
      career: '준비 없이 새로운 일을 시작하면 어려움이 있을 수 있습니다.',
      health: '무리한 운동을 삼가세요. 몸의 신호에 귀를 기울이세요.'
    }
  },
  {
    id: 1, name: '마법사', nameEn: 'The Magician', symbol: '🪄',
    upKeywords: ['창조력', '의지력', '재능'],
    reversedKeywords: ['속임수', '미숙함', '의지 부족'],
    upMeaning: {
      love: '당신의 매력이 빛나는 시기입니다. 자신감을 가지고 다가가면 좋은 결과가 있을 거예요.',
      money: '당신의 능력으로 새로운 수입원을 만들 수 있습니다. 재능을 활용하세요.',
      career: '업무에서 창의적인 아이디어가 빛날 때입니다. 적극적으로 제안하세요.',
      health: '의지력으로 건강 목표를 달성할 수 있습니다. 마음먹은 것을 실행하세요.'
    },
    reversedMeaning: {
      love: '진심이 아닌 말이나 행동을 조심하세요. 솔직함이 최선입니다.',
      money: '사기나 과대광고에 주의하세요. 너무 좋은 조건은 의심해보세요.',
      career: '능력을 과시하려 하지 마세요. 실력으로 증명하는 것이 중요합니다.',
      health: '건강 관련 잘못된 정보에 주의하세요. 전문가의 조언을 따르세요.'
    }
  },
  {
    id: 2, name: '여사제', nameEn: 'The High Priestess', symbol: '🌙',
    upKeywords: ['직관', '지혜', '내면의 소리'],
    reversedKeywords: ['비밀', '소통 부족', '혼란'],
    upMeaning: {
      love: '직감을 믿으세요. 마음 깊은 곳의 느낌이 올바른 방향을 알려줄 것입니다.',
      money: '섣부른 행동보다 관찰하고 기다리는 것이 이득입니다.',
      career: '조용히 실력을 쌓는 시기입니다. 때가 되면 빛을 발할 것입니다.',
      health: '명상이나 요가 등 내면을 다스리는 활동이 도움이 됩니다.'
    },
    reversedMeaning: {
      love: '상대방과의 소통이 부족할 수 있습니다. 마음을 열고 대화하세요.',
      money: '숨겨진 비용이나 조건을 꼼꼼히 확인하세요.',
      career: '정보를 독점하기보다 공유하면 더 좋은 결과를 얻을 수 있습니다.',
      health: '몸의 이상 신호를 무시하지 마세요. 검진을 받아보세요.'
    }
  },
  {
    id: 3, name: '여황제', nameEn: 'The Empress', symbol: '👑',
    upKeywords: ['풍요', '모성', '창조'],
    reversedKeywords: ['의존', '과잉보호', '정체'],
    upMeaning: {
      love: '사랑이 풍요로운 시기입니다. 따뜻한 감정이 관계를 더 깊게 만들어줍니다.',
      money: '재물운이 좋습니다. 투자한 것에서 풍성한 결실을 거둘 수 있어요.',
      career: '창의적인 프로젝트에서 좋은 성과를 낼 수 있습니다.',
      health: '전반적으로 건강 상태가 양호합니다. 자연 속에서 활력을 얻으세요.'
    },
    reversedMeaning: {
      love: '상대방에게 너무 집착하거나 의존하지 마세요. 독립적인 모습이 매력적입니다.',
      money: '사치스러운 소비를 줄이세요. 꼭 필요한 것에만 투자하세요.',
      career: '창의성이 막힌 느낌이라면 잠시 쉬어가세요. 재충전이 필요합니다.',
      health: '과식이나 불규칙한 생활을 조심하세요.'
    }
  },
  {
    id: 4, name: '황제', nameEn: 'The Emperor', symbol: '🏛️',
    upKeywords: ['권위', '안정', '리더십'],
    reversedKeywords: ['독재', '경직', '통제'],
    upMeaning: {
      love: '안정적이고 든든한 관계가 기대됩니다. 리더십 있는 모습이 매력 포인트입니다.',
      money: '체계적인 재무 관리가 부를 가져옵니다. 계획을 세우고 실행하세요.',
      career: '리더로서의 역량이 인정받는 시기입니다. 책임감을 가지고 이끌어가세요.',
      health: '규칙적인 생활 습관이 건강의 열쇠입니다. 규칙을 지키세요.'
    },
    reversedMeaning: {
      love: '상대방을 통제하려 하면 관계가 멀어질 수 있습니다. 유연함이 필요합니다.',
      money: '너무 보수적인 투자 전략은 기회를 놓칠 수 있습니다.',
      career: '독단적인 결정은 팀의 반발을 살 수 있습니다. 의견을 경청하세요.',
      health: '스트레스로 인한 긴장이 높을 수 있습니다. 릴랙스 타임을 가지세요.'
    }
  },
  {
    id: 5, name: '교황', nameEn: 'The Hierophant', symbol: '⛪',
    upKeywords: ['전통', '가르침', '신뢰'],
    reversedKeywords: ['고정관념', '반항', '비전통'],
    upMeaning: {
      love: '진지하고 전통적인 관계로 발전할 가능성이 높습니다. 결혼이나 약속의 신호일 수 있어요.',
      money: '검증된 방식으로 투자하면 안정적인 수익을 기대할 수 있습니다.',
      career: '멘토의 조언이 큰 도움이 됩니다. 배움의 자세를 잃지 마세요.',
      health: '전문가의 조언을 따르면 건강 회복에 도움이 됩니다.'
    },
    reversedMeaning: {
      love: '관습에 얽매이지 마세요. 두 사람만의 방식을 찾아보세요.',
      money: '기존 방식에서 벗어난 새로운 투자처를 탐색해보세요.',
      career: '틀에 박힌 업무 방식에서 벗어나 혁신을 시도하세요.',
      health: '대안적인 건강법을 시도해보는 것도 좋습니다.'
    }
  },
  {
    id: 6, name: '연인', nameEn: 'The Lovers', symbol: '💕',
    upKeywords: ['사랑', '조화', '선택'],
    reversedKeywords: ['불화', '갈등', '잘못된 선택'],
    upMeaning: {
      love: '진정한 사랑이 찾아오거나 관계가 한층 깊어지는 시기입니다. 마음을 열어두세요.',
      money: '파트너십을 통한 수익이 기대됩니다. 협업의 기회를 살려보세요.',
      career: '좋은 파트너를 만날 수 있습니다. 함께 일하면 시너지가 납니다.',
      health: '마음의 안정이 몸의 건강으로 이어집니다. 사랑하는 사람과 함께하세요.'
    },
    reversedMeaning: {
      love: '관계에서 갈등이 있을 수 있습니다. 솔직한 대화로 풀어나가세요.',
      money: '공동 투자에서 의견 차이가 생길 수 있습니다. 신중하세요.',
      career: '동료와의 마찰을 조심하세요. 타협점을 찾는 것이 중요합니다.',
      health: '스트레스로 인한 심리적 불안감에 주의하세요.'
    }
  },
  {
    id: 7, name: '전차', nameEn: 'The Chariot', symbol: '🏇',
    upKeywords: ['승리', '의지', '전진'],
    reversedKeywords: ['좌절', '방향 상실', '통제 불능'],
    upMeaning: {
      love: '적극적으로 다가가면 좋은 결과를 얻을 수 있습니다. 행동으로 보여주세요.',
      money: '결단력 있는 투자가 좋은 성과를 가져옵니다. 목표를 향해 전진하세요.',
      career: '프로젝트에서 빠른 성과를 낼 수 있습니다. 추진력을 발휘하세요.',
      health: '활동적인 운동이 에너지를 높여줍니다. 도전적인 운동을 시도해보세요.'
    },
    reversedMeaning: {
      love: '너무 급하게 밀어붙이면 역효과가 날 수 있습니다. 속도를 조절하세요.',
      money: '무리한 투자를 피하세요. 현재의 상황을 먼저 안정시키세요.',
      career: '방향을 잃은 느낌이라면 잠시 멈추고 계획을 재정비하세요.',
      health: '과도한 활동으로 인한 부상을 조심하세요.'
    }
  },
  {
    id: 8, name: '힘', nameEn: 'Strength', symbol: '🦁',
    upKeywords: ['용기', '인내', '내면의 힘'],
    reversedKeywords: ['나약함', '자기의심', '포기'],
    upMeaning: {
      love: '인내와 이해로 관계를 더 단단하게 만들 수 있습니다. 믿음을 가지세요.',
      money: '꾸준한 노력이 재물운을 높여줍니다. 포기하지 마세요.',
      career: '어려운 상황에서도 포기하지 않으면 인정받게 됩니다.',
      health: '정신적 강인함이 신체 건강에도 긍정적 영향을 미칩니다.'
    },
    reversedMeaning: {
      love: '자신감이 부족한 상태입니다. 자기 사랑이 먼저 필요합니다.',
      money: '재정적 어려움 앞에서 포기하지 마세요. 도움을 구하세요.',
      career: '번아웃을 조심하세요. 무리하지 말고 도움을 요청하세요.',
      health: '체력이 떨어질 수 있습니다. 충분한 휴식을 취하세요.'
    }
  },
  {
    id: 9, name: '은둔자', nameEn: 'The Hermit', symbol: '🏔️',
    upKeywords: ['성찰', '지혜', '내면 탐구'],
    reversedKeywords: ['고립', '외로움', '과도한 경계'],
    upMeaning: {
      love: '혼자만의 시간이 관계에 대한 깊은 이해를 줄 수 있습니다.',
      money: '조용히 분석하고 공부하면 좋은 투자처를 찾을 수 있습니다.',
      career: '전문성을 깊이 있게 쌓을 시기입니다. 집중하세요.',
      health: '명상과 휴식으로 내면의 평화를 찾으세요.'
    },
    reversedMeaning: {
      love: '지나친 혼자만의 시간은 외로움을 키울 수 있습니다. 사람들과 교류하세요.',
      money: '너무 신중한 나머지 기회를 놓치지 마세요.',
      career: '고립되지 마세요. 동료들과의 소통이 중요합니다.',
      health: '사회적 활동이 정신 건강에 도움이 됩니다.'
    }
  },
  {
    id: 10, name: '운명의 수레바퀴', nameEn: 'Wheel of Fortune', symbol: '🎡',
    upKeywords: ['변화', '행운', '전환점'],
    reversedKeywords: ['불운', '저항', '반복'],
    upMeaning: {
      love: '운명적인 만남이 기다리고 있을 수 있습니다. 변화를 두려워하지 마세요.',
      money: '횡재수가 있습니다! 기회가 오면 놓치지 마세요.',
      career: '커리어에 전환점이 올 수 있습니다. 긍정적으로 받아들이세요.',
      health: '건강 상태가 호전되는 시기입니다. 좋은 흐름을 이어가세요.'
    },
    reversedMeaning: {
      love: '관계에 변화가 있을 수 있지만, 이것도 지나갈 것입니다.',
      money: '재정적 변동이 있을 수 있습니다. 대비하세요.',
      career: '예상치 못한 변화에 유연하게 대처하세요.',
      health: '컨디션 기복이 있을 수 있습니다. 규칙적인 생활이 도움됩니다.'
    }
  },
  {
    id: 11, name: '정의', nameEn: 'Justice', symbol: '⚖️',
    upKeywords: ['공정', '균형', '진실'],
    reversedKeywords: ['불공정', '편견', '불균형'],
    upMeaning: {
      love: '공정하고 균형 잡힌 관계가 유지됩니다. 서로를 존중하세요.',
      money: '정당한 노력에 대한 보상이 따릅니다. 공정한 거래가 이득입니다.',
      career: '실력대로 평가받는 시기입니다. 정직하게 일하세요.',
      health: '생활의 균형이 건강의 비결입니다. 일과 휴식의 밸런스를 맞추세요.'
    },
    reversedMeaning: {
      love: '관계에서 불공평함을 느낄 수 있습니다. 솔직하게 이야기하세요.',
      money: '부당한 대우를 받고 있다면 목소리를 내세요.',
      career: '불공정한 상황이 있을 수 있습니다. 원칙을 지키세요.',
      health: '생활 패턴의 불균형을 바로잡으세요.'
    }
  },
  {
    id: 12, name: '매달린 사람', nameEn: 'The Hanged Man', symbol: '🙃',
    upKeywords: ['희생', '새로운 시각', '인내'],
    reversedKeywords: ['지연', '무의미한 희생', '고집'],
    upMeaning: {
      love: '다른 시각으로 상대를 바라보면 새로운 매력을 발견할 수 있습니다.',
      money: '잠시 기다리는 것이 더 큰 이익을 가져옵니다.',
      career: '관점을 바꾸면 문제의 해결책이 보입니다.',
      health: '휴식을 통해 몸과 마음을 재충전하세요.'
    },
    reversedMeaning: {
      love: '무의미한 기다림은 그만하세요. 행동할 때입니다.',
      money: '손해를 보고 있다면 빨리 손절하세요.',
      career: '의미 없는 일에 시간을 낭비하지 마세요.',
      health: '오래된 습관을 과감히 바꿔보세요.'
    }
  },
  {
    id: 13, name: '죽음', nameEn: 'Death', symbol: '🦋',
    upKeywords: ['변환', '끝과 시작', '재탄생'],
    reversedKeywords: ['변화 거부', '정체', '미련'],
    upMeaning: {
      love: '오래된 패턴이 끝나고 새로운 사랑의 형태가 시작됩니다.',
      money: '낡은 투자 방식을 버리고 새로운 전략을 세우세요.',
      career: '한 단계의 끝은 다음 단계의 시작입니다. 변화를 받아들이세요.',
      health: '나쁜 습관을 끊을 수 있는 최적의 시기입니다.'
    },
    reversedMeaning: {
      love: '과거의 관계에 미련을 갖지 마세요. 새로운 시작이 필요합니다.',
      money: '변화를 거부하면 손실이 커질 수 있습니다.',
      career: '변화를 두려워하지 마세요. 정체가 더 위험합니다.',
      health: '나쁜 생활 습관을 고집하면 건강이 악화될 수 있습니다.'
    }
  },
  {
    id: 14, name: '절제', nameEn: 'Temperance', symbol: '🏺',
    upKeywords: ['균형', '조화', '인내'],
    reversedKeywords: ['과잉', '불균형', '조급함'],
    upMeaning: {
      love: '조화롭고 평화로운 관계가 이어집니다. 서로를 배려하세요.',
      money: '균형 잡힌 재정 관리가 장기적으로 이익입니다.',
      career: '급하지 않게 차근차근 진행하면 좋은 결과를 얻습니다.',
      health: '절제된 식단과 규칙적인 운동이 건강의 비결입니다.'
    },
    reversedMeaning: {
      love: '감정의 과잉이 관계를 힘들게 할 수 있습니다. 차분하세요.',
      money: '과소비를 조심하세요. 예산을 세우고 지키세요.',
      career: '조급하면 실수합니다. 천천히 하세요.',
      health: '폭식이나 과음을 주의하세요.'
    }
  },
  {
    id: 15, name: '악마', nameEn: 'The Devil', symbol: '😈',
    upKeywords: ['유혹', '속박', '욕망'],
    reversedKeywords: ['해방', '자유', '극복'],
    upMeaning: {
      love: '강한 끌림이 있지만 건강한 관계인지 돌아보세요.',
      money: '쉽게 돈을 벌 수 있다는 유혹에 빠지지 마세요.',
      career: '워커홀릭이 되고 있진 않은지 돌아보세요.',
      health: '중독적인 습관을 점검하세요. 절제가 필요합니다.'
    },
    reversedMeaning: {
      love: '불건전한 관계에서 벗어날 수 있는 시기입니다. 용기를 내세요.',
      money: '나쁜 재정 습관에서 벗어날 수 있습니다.',
      career: '속박에서 벗어나 자유를 찾을 수 있습니다.',
      health: '나쁜 습관을 끊을 힘이 생기는 때입니다.'
    }
  },
  {
    id: 16, name: '탑', nameEn: 'The Tower', symbol: '⚡',
    upKeywords: ['급변', '깨달음', '해체'],
    reversedKeywords: ['저항', '피할 수 없는 변화', '두려움'],
    upMeaning: {
      love: '관계의 진실이 드러나는 시기입니다. 이것이 더 나은 미래로 이끕니다.',
      money: '예상치 못한 변동이 있을 수 있지만, 이를 통해 더 나은 전략을 세울 수 있습니다.',
      career: '갑작스러운 변화가 오히려 성장의 기회가 됩니다.',
      health: '몸이 보내는 경고 신호를 무시하지 마세요.'
    },
    reversedMeaning: {
      love: '피할 수 없는 변화를 받아들이세요. 저항할수록 힘들어집니다.',
      money: '재정 위기를 예방하기 위해 미리 대비하세요.',
      career: '구조 변화에 저항하기보다 적응하세요.',
      health: '건강 문제를 미루지 말고 빨리 대처하세요.'
    }
  },
  {
    id: 17, name: '별', nameEn: 'The Star', symbol: '⭐',
    upKeywords: ['희망', '영감', '치유'],
    reversedKeywords: ['절망', '불신', '비관'],
    upMeaning: {
      love: '희망적인 관계가 기다리고 있습니다. 꿈꾸던 사랑이 현실이 될 수 있어요.',
      money: '밝은 재정적 전망이 보입니다. 희망을 가지세요.',
      career: '영감이 넘치는 시기입니다. 꿈을 향해 나아가세요.',
      health: '치유와 회복의 에너지가 강합니다. 긍정적인 마음을 가지세요.'
    },
    reversedMeaning: {
      love: '희망을 잃지 마세요. 지금은 힘들지만 좋은 날이 올 것입니다.',
      money: '재정적 불안감이 있지만 서서히 나아질 것입니다.',
      career: '좌절하지 마세요. 작은 성과부터 쌓아가세요.',
      health: '마음의 건강을 챙기세요. 긍정적인 사고가 중요합니다.'
    }
  },
  {
    id: 18, name: '달', nameEn: 'The Moon', symbol: '🌕',
    upKeywords: ['직감', '무의식', '꿈'],
    reversedKeywords: ['혼란', '착각', '불안'],
    upMeaning: {
      love: '직감이 이끄는 대로 따라가 보세요. 숨겨진 감정이 드러날 수 있습니다.',
      money: '직감적인 판단이 도움이 됩니다. 감이 좋을 때 행동하세요.',
      career: '창의적인 영감이 떠오르는 시기입니다. 메모해두세요.',
      health: '수면의 질에 신경 쓰세요. 꿈이 메시지를 전할 수 있습니다.'
    },
    reversedMeaning: {
      love: '착각이나 오해가 있을 수 있습니다. 사실을 확인하세요.',
      money: '불확실한 투자는 피하세요. 확실한 정보만 믿으세요.',
      career: '혼란스러운 상황에서 명확한 판단을 내리기 어려울 수 있습니다.',
      health: '불안이나 불면증에 주의하세요. 전문가의 도움을 받으세요.'
    }
  },
  {
    id: 19, name: '태양', nameEn: 'The Sun', symbol: '☀️',
    upKeywords: ['성공', '기쁨', '활력'],
    reversedKeywords: ['지연된 성공', '과시', '피로'],
    upMeaning: {
      love: '밝고 행복한 사랑이 함께합니다. 즐거운 시간을 보내세요.',
      money: '재정적 풍요로움이 찾아옵니다. 노력의 결실을 즐기세요.',
      career: '성공이 보장되는 시기입니다. 자신감을 가지고 도전하세요.',
      health: '활력이 넘치는 시기입니다. 야외 활동을 즐기세요.'
    },
    reversedMeaning: {
      love: '행복은 오지만 조금 지연될 수 있습니다. 인내심을 가지세요.',
      money: '성과가 기대보다 늦을 수 있지만 결국 좋은 결과가 있습니다.',
      career: '과시보다는 실질적인 성과에 집중하세요.',
      health: '에너지 소모가 클 수 있습니다. 충분히 쉬세요.'
    }
  },
  {
    id: 20, name: '심판', nameEn: 'Judgement', symbol: '📯',
    upKeywords: ['각성', '부활', '결단'],
    reversedKeywords: ['자기비판', '후회', '우유부단'],
    upMeaning: {
      love: '관계에 대한 중요한 깨달음이 찾아옵니다. 진심을 따르세요.',
      money: '과거의 투자가 결실을 맺는 시기입니다.',
      career: '중요한 결정을 내릴 때입니다. 소명을 따르세요.',
      health: '건강에 대한 새로운 각성이 있을 수 있습니다. 생활을 개선하세요.'
    },
    reversedMeaning: {
      love: '과거의 후회에 매달리지 마세요. 앞을 보세요.',
      money: '결정을 미루면 기회를 놓칩니다. 과감하게 행동하세요.',
      career: '자기 비판보다는 자기 발전에 집중하세요.',
      health: '건강 관리를 미루지 마세요. 지금 시작하세요.'
    }
  },
  {
    id: 21, name: '세계', nameEn: 'The World', symbol: '🌍',
    upKeywords: ['완성', '달성', '통합'],
    reversedKeywords: ['미완성', '지연', '아쉬움'],
    upMeaning: {
      love: '완벽한 조화를 이루는 관계입니다. 축하할 일이 있을 수 있어요.',
      money: '목표했던 재정적 성과를 달성합니다. 축하하세요!',
      career: '프로젝트가 성공적으로 마무리됩니다. 다음 단계로 나아가세요.',
      health: '전체적으로 균형 잡힌 건강 상태입니다.'
    },
    reversedMeaning: {
      love: '관계의 완성을 위해 조금 더 노력이 필요합니다.',
      money: '목표 달성이 지연될 수 있지만 포기하지 마세요.',
      career: '마무리가 아쉬울 수 있습니다. 디테일을 챙기세요.',
      health: '전반적인 건강 점검이 필요한 시기입니다.'
    }
  }
];

// ==================== 마이너 아르카나 56장 ====================

const SUITS = [
  { name: '완드', nameEn: 'Wands', symbol: '🔥', element: '불', theme: '열정·행동·창의' },
  { name: '컵', nameEn: 'Cups', symbol: '💧', element: '물', theme: '감정·관계·직감' },
  { name: '소드', nameEn: 'Swords', symbol: '⚔️', element: '공기', theme: '지성·갈등·진실' },
  { name: '펜타클', nameEn: 'Pentacles', symbol: '💰', element: '흙', theme: '물질·안정·현실' }
];

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', '시종', '기사', '여왕', '왕'];

// 슈트별 × 랭크별 해석 데이터 (정방향/역방향, 카테고리별)
const MINOR_DATA = {
  // ---- 완드 (Wands) ----
  완드: {
    A: { upKw: ['새로운 열정', '시작', '영감'], revKw: ['지연', '동기 부족', '공허'],
      up: { love: '새로운 열정적인 만남이 기대됩니다.', money: '새로운 수입원이 열립니다.', career: '창의적 프로젝트를 시작하기 좋습니다.', health: '새로운 운동을 시작하세요.' },
      rev: { love: '열정이 식어가고 있습니다. 노력이 필요해요.', money: '새로운 기회가 지연될 수 있습니다.', career: '의욕이 떨어지는 시기입니다.', health: '운동 의욕이 떨어질 수 있어요.' } },
    '2': { upKw: ['계획', '결정', '미래 비전'], revKw: ['우유부단', '두려움', '잘못된 계획'],
      up: { love: '관계의 미래를 함께 계획할 시기입니다.', money: '장기적 투자 계획을 세우세요.', career: '미래 계획을 구체화하세요.', health: '건강 계획을 세우기 좋은 때입니다.' },
      rev: { love: '관계의 방향이 불확실합니다.', money: '계획 없는 지출을 조심하세요.', career: '결정을 미루고 있진 않나요?', health: '건강 계획을 실행에 옮기세요.' } },
    '3': { upKw: ['확장', '탐험', '성장'], revKw: ['장애물', '지연', '좌절'],
      up: { love: '관계가 새로운 단계로 발전합니다.', money: '사업 확장의 기회가 보입니다.', career: '새로운 분야로의 확장이 유리합니다.', health: '활동 범위를 넓혀보세요.' },
      rev: { love: '진전이 더딘 느낌입니다. 인내하세요.', money: '확장을 서두르지 마세요.', career: '장애물이 있지만 극복 가능합니다.', health: '무리한 확장은 부상을 부릅니다.' } },
    '4': { upKw: ['축하', '안정', '화합'], revKw: ['불안정', '과도기', '분열'],
      up: { love: '기쁜 소식이 있을 수 있습니다. 축하할 일이 생깁니다.', money: '안정적인 재정 상태입니다.', career: '팀과 함께 성과를 축하하세요.', health: '안정적인 건강 상태를 유지하세요.' },
      rev: { love: '관계에서 불안감이 있을 수 있습니다.', money: '재정적 불안정이 올 수 있습니다.', career: '팀 내 갈등에 주의하세요.', health: '생활의 안정이 흔들릴 수 있어요.' } },
    '5': { upKw: ['경쟁', '갈등', '도전'], revKw: ['타협', '해결', '화해'],
      up: { love: '의견 차이가 있을 수 있습니다. 건설적인 토론이 필요합니다.', money: '경쟁적인 시장에서 우위를 점할 수 있습니다.', career: '경쟁을 통해 성장합니다.', health: '경쟁심이 운동 동기가 될 수 있어요.' },
      rev: { love: '갈등이 해소되는 시기입니다.', money: '경쟁에서 물러서는 것이 현명합니다.', career: '타협점을 찾으세요.', health: '과도한 경쟁심은 스트레스의 원인이에요.' } },
    '6': { upKw: ['승리', '인정', '성과'], revKw: ['실패', '좌절', '자만'],
      up: { love: '관계에서 인정받고 사랑받는 느낌입니다.', money: '노력의 결실을 맺습니다.', career: '성과를 인정받는 시기입니다.', health: '건강 목표를 달성합니다.' },
      rev: { love: '자만하면 관계가 흔들릴 수 있어요.', money: '기대만큼 성과가 나오지 않을 수 있어요.', career: '겸손한 자세가 필요합니다.', health: '목표를 너무 높게 잡지 마세요.' } },
    '7': { upKw: ['방어', '입장 고수', '용기'], revKw: ['포기', '압도당함', '타협'],
      up: { love: '관계를 지키기 위해 용기가 필요합니다.', money: '경쟁에서 자신의 입장을 지키세요.', career: '자신의 의견을 당당히 표현하세요.', health: '건강을 지키려는 의지가 중요합니다.' },
      rev: { love: '모든 것을 혼자 해결하려 하지 마세요.', money: '무리한 방어보다 전략적 후퇴가 나을 수 있어요.', career: '때로는 양보도 필요합니다.', health: '도움을 요청하는 것도 용기입니다.' } },
    '8': { upKw: ['신속', '변화', '에너지'], revKw: ['지연', '좌절', '혼란'],
      up: { love: '관계가 빠르게 발전합니다.', money: '빠른 수익 실현이 가능합니다.', career: '일이 빠르게 진행됩니다.', health: '에너지가 넘칩니다.' },
      rev: { love: '너무 서두르지 마세요.', money: '급한 결정은 손실을 부릅니다.', career: '업무가 지연될 수 있습니다.', health: '체력 소모에 주의하세요.' } },
    '9': { upKw: ['인내', '끈기', '경계'], revKw: ['피로', '포기 직전', '방심'],
      up: { love: '인내가 아름다운 결실을 맺습니다.', money: '끈기 있게 투자를 유지하세요.', career: '마지막까지 포기하지 마세요.', health: '끈기 있는 운동이 효과를 봅니다.' },
      rev: { love: '지치지 않도록 자신을 돌보세요.', money: '지나친 인내는 오히려 손해일 수 있어요.', career: '번아웃에 주의하세요.', health: '피로가 쌓이고 있습니다. 쉬세요.' } },
    '10': { upKw: ['부담', '책임', '압박'], revKw: ['짐 덜기', '위임', '해방'],
      up: { love: '책임감이 관계를 단단하게 합니다.', money: '재정적 부담이 있지만 감당 가능합니다.', career: '많은 업무가 있지만 성장의 기회입니다.', health: '스트레스 관리가 필요합니다.' },
      rev: { love: '짐을 나눠지세요. 혼자 감당하지 마세요.', money: '불필요한 지출을 줄이세요.', career: '업무를 위임하는 법을 배우세요.', health: '부담을 줄이면 건강이 좋아집니다.' } },
    시종: { upKw: ['열정', '탐험', '호기심'], revKw: ['성급함', '산만함', '미숙'],
      up: { love: '새로운 만남에 대한 설렘이 있습니다.', money: '새로운 기회를 탐색하세요.', career: '배움의 기회를 잡으세요.', health: '새로운 운동에 도전하세요.' },
      rev: { love: '가벼운 만남을 조심하세요.', money: '충분히 알아보지 않고 투자하지 마세요.', career: '집중력이 필요합니다.', health: '시작만 하고 끝맺지 못하는 패턴을 주의하세요.' } },
    기사: { upKw: ['모험', '추진력', '열정'], revKw: ['성급함', '무모함', '분노'],
      up: { love: '적극적인 구애가 좋은 결과를 가져옵니다.', money: '과감한 투자가 빛을 발합니다.', career: '추진력으로 프로젝트를 완성하세요.', health: '활동적인 운동이 잘 맞는 시기입니다.' },
      rev: { love: '너무 급하면 상대가 부담을 느낄 수 있어요.', money: '무모한 투자를 조심하세요.', career: '성급한 행동이 문제를 일으킬 수 있어요.', health: '부상을 조심하세요.' } },
    여왕: { upKw: ['자신감', '매력', '독립'], revKw: ['질투', '강요', '자기중심'],
      up: { love: '매력이 빛나는 시기입니다. 자신감을 가지세요.', money: '독립적인 재정 관리가 좋은 결과를 냅니다.', career: '자신만의 방식으로 성공합니다.', health: '자신감이 건강에도 긍정적입니다.' },
      rev: { love: '질투나 집착은 관계를 해칩니다.', money: '다른 사람과 비교하지 마세요.', career: '협력의 자세가 필요합니다.', health: '감정적 스트레스에 주의하세요.' } },
    왕: { upKw: ['리더십', '비전', '용기'], revKw: ['독재', '조급', '횡포'],
      up: { love: '든든하고 리더십 있는 파트너를 만날 수 있습니다.', money: '대범한 결정이 큰 수익으로 이어집니다.', career: '리더로서 빛나는 시기입니다.', health: '자신감 있는 태도가 건강에 좋습니다.' },
      rev: { love: '상대를 지배하려 하면 안 됩니다.', money: '과욕은 금물입니다.', career: '독선적이면 팀이 흔들립니다.', health: '무리하지 마세요.' } }
  },
  // ---- 컵 (Cups) ----
  컵: {
    A: { upKw: ['새로운 감정', '사랑의 시작', '기쁨'], revKw: ['감정 억압', '공허', '슬픔'],
      up: { love: '새로운 사랑의 시작이 임박했습니다.', money: '감사하는 마음이 풍요를 부릅니다.', career: '감성적인 프로젝트가 빛을 발합니다.', health: '감정적 안정이 건강에 좋습니다.' },
      rev: { love: '감정을 억누르지 마세요. 표현이 필요합니다.', money: '마음이 허전한 소비를 조심하세요.', career: '감정적으로 지친 상태입니다.', health: '감정적 스트레스가 건강에 영향을 줍니다.' } },
    '2': { upKw: ['파트너십', '조화', '교류'], revKw: ['불화', '단절', '오해'],
      up: { love: '깊은 교감이 이루어지는 시기입니다.', money: '파트너와의 협력이 이익을 줍니다.', career: '좋은 파트너를 만납니다.', health: '함께하는 활동이 건강에 좋습니다.' },
      rev: { love: '소통의 단절을 조심하세요.', money: '파트너십에 문제가 생길 수 있어요.', career: '동료와의 오해를 풀어야 합니다.', health: '혼자 있는 시간이 필요합니다.' } },
    '3': { upKw: ['축하', '우정', '사교'], revKw: ['과음', '과잉', '피상적 관계'],
      up: { love: '즐거운 사교 활동에서 인연을 만날 수 있어요.', money: '네트워킹이 수익으로 이어집니다.', career: '팀과의 화합이 좋은 성과를 냅니다.', health: '사회적 활동이 정신 건강에 좋습니다.' },
      rev: { love: '표면적인 관계에 주의하세요.', money: '접대비 지출을 줄이세요.', career: '놀기보다 일에 집중하세요.', health: '과음·과식에 주의하세요.' } },
    '4': { upKw: ['무감각', '권태', '내면 탐구'], revKw: ['새로운 동기', '자각', '행동'],
      up: { love: '관계에 권태감이 올 수 있습니다. 새로운 자극이 필요해요.', money: '현재에 만족하고 내면을 돌아보세요.', career: '의욕이 떨어질 수 있습니다. 동기를 찾으세요.', health: '무기력함을 느낄 수 있습니다.' },
      rev: { love: '권태에서 벗어나 새로운 시도를 해보세요.', money: '새로운 투자 의욕이 생깁니다.', career: '동기 부여가 되는 계기가 생깁니다.', health: '새로운 활동으로 활력을 찾으세요.' } },
    '5': { upKw: ['상실', '슬픔', '후회'], revKw: ['치유', '회복', '수용'],
      up: { love: '아픔이 있지만 성장의 밑거름이 됩니다.', money: '손실이 있을 수 있으니 조심하세요.', career: '실망스러운 일이 있을 수 있습니다.', health: '감정적 스트레스에 주의하세요.' },
      rev: { love: '상처가 치유되고 있습니다. 희망을 가지세요.', money: '손실에서 회복할 수 있습니다.', career: '실패에서 교훈을 얻어 성장합니다.', health: '마음의 회복이 몸의 회복으로 이어집니다.' } },
    '6': { upKw: ['추억', '향수', '순수함'], revKw: ['과거 집착', '비현실', '후퇴'],
      up: { love: '아름다운 추억이 관계를 따뜻하게 합니다.', money: '과거의 인연이 재물운을 가져옵니다.', career: '과거의 경험이 현재에 도움이 됩니다.', health: '마음의 평화가 건강에 좋습니다.' },
      rev: { love: '과거에 집착하지 마세요. 현재에 집중하세요.', money: '과거의 방식을 고집하지 마세요.', career: '새로운 방법을 시도해보세요.', health: '과거의 생활 습관을 반성하세요.' } },
    '7': { upKw: ['환상', '선택', '꿈'], revKw: ['현실 직시', '결단', '명확'],
      up: { love: '이상적인 사랑을 꿈꾸는 시기입니다.', money: '여러 선택지 중 현명하게 고르세요.', career: '비전이 있는 프로젝트를 선택하세요.', health: '이상적인 건강 목표를 세우세요.' },
      rev: { love: '현실적인 사랑을 추구하세요.', money: '환상에서 벗어나 현실적으로 판단하세요.', career: '현실적인 목표를 세우세요.', health: '실현 가능한 건강 계획을 세우세요.' } },
    '8': { upKw: ['이별', '떠남', '포기'], revKw: ['머무름', '두려움', '미련'],
      up: { love: '때로는 떠나는 것이 서로를 위한 선택입니다.', money: '손실을 줄이기 위해 과감히 정리하세요.', career: '맞지 않는 일은 과감히 떠나세요.', health: '나쁜 습관을 버릴 때입니다.' },
      rev: { love: '미련을 버리지 못하고 있습니다.', money: '손절해야 할 때 주저하지 마세요.', career: '떠나야 할 때인데 두려워하고 있나요?', health: '변화를 두려워하지 마세요.' } },
    '9': { upKw: ['소원 성취', '만족', '행복'], revKw: ['불만족', '욕심', '과욕'],
      up: { love: '소원하던 사랑이 이루어집니다.', money: '재정적 소원이 이루어질 수 있어요.', career: '원하던 결과를 얻습니다.', health: '건강이 좋아지는 것을 느낍니다.' },
      rev: { love: '너무 많은 것을 바라지 마세요.', money: '과욕이 손실을 부릅니다.', career: '완벽을 추구하면 지칩니다.', health: '현재 상태에 감사하세요.' } },
    '10': { upKw: ['가정 행복', '조화', '완성'], revKw: ['가정 불화', '불안정', '깨진 꿈'],
      up: { love: '가정에 행복한 기운이 감돕니다.', money: '가정의 재정이 안정됩니다.', career: '일과 가정의 균형을 잘 맞출 수 있습니다.', health: '가족과 함께하는 시간이 건강에 좋습니다.' },
      rev: { love: '가정 내 갈등에 주의하세요.', money: '가정 관련 지출이 늘 수 있어요.', career: '일과 가정의 균형이 흔들릴 수 있어요.', health: '가족 간 스트레스에 주의하세요.' } },
    시종: { upKw: ['감성', '직감', '상상력'], revKw: ['감정 기복', '비현실', '미성숙'],
      up: { love: '순수한 감정으로 다가가면 좋은 반응을 얻습니다.', money: '직감적인 판단이 도움이 됩니다.', career: '창의적 감각을 발휘하세요.', health: '감성적인 활동이 힐링이 됩니다.' },
      rev: { love: '감정 기복을 조절하세요.', money: '감정적인 소비를 조심하세요.', career: '현실적인 판단이 필요합니다.', health: '감정 조절이 건강에 중요합니다.' } },
    기사: { upKw: ['로맨스', '매력', '이상주의'], revKw: ['변덕', '실망', '속임'],
      up: { love: '로맨틱한 만남이나 이벤트가 기대됩니다.', money: '감성적 가치를 지닌 투자가 좋습니다.', career: '열정을 가지고 일하면 좋은 결과를 얻습니다.', health: '마음이 편안한 활동을 하세요.' },
      rev: { love: '겉모습에 속지 마세요.', money: '감정에 휘둘린 소비를 주의하세요.', career: '이상과 현실의 갭을 인지하세요.', health: '기분에 따라 건강 관리가 흔들리지 않도록 하세요.' } },
    여왕: { upKw: ['공감', '직관', '돌봄'], revKw: ['감정과잉', '의존', '기분파'],
      up: { love: '깊은 공감으로 관계가 돈독해집니다.', money: '직관을 믿고 투자하세요.', career: '팀원들을 잘 돌보면 좋은 성과를 냅니다.', health: '자기 돌봄이 최우선입니다.' },
      rev: { love: '감정에 너무 빠지지 마세요.', money: '감정적 판단은 재정에 독입니다.', career: '다른 사람에게 너무 의존하지 마세요.', health: '감정적 과식을 주의하세요.' } },
    왕: { upKw: ['관대', '지혜', '균형'], revKw: ['냉담', '조종', '감정 억압'],
      up: { love: '성숙하고 관대한 사랑이 함께합니다.', money: '현명한 재정 관리를 합니다.', career: '지혜로운 리더십을 발휘합니다.', health: '감정적으로 균형 잡힌 상태입니다.' },
      rev: { love: '감정을 억누르지 마세요.', money: '냉정함이 지나치면 기회를 놓칩니다.', career: '팀원의 감정을 이해하려 노력하세요.', health: '감정 표현이 건강에 도움이 됩니다.' } }
  },
  // ---- 소드 (Swords) ----
  소드: {
    A: { upKw: ['명확함', '돌파구', '진실'], revKw: ['혼란', '잘못된 판단', '공격'],
      up: { love: '관계의 진실이 밝혀집니다.', money: '명확한 전략이 수익을 냅니다.', career: '문제의 돌파구를 찾습니다.', health: '건강 문제의 원인을 파악합니다.' },
      rev: { love: '진실을 직시하기 어려울 수 있습니다.', money: '잘못된 정보에 주의하세요.', career: '판단력이 흐려지고 있습니다.', health: '잘못된 건강 정보에 주의하세요.' } },
    '2': { upKw: ['균형', '결정 보류', '직감'], revKw: ['우유부단', '정보 과부하', '거짓'],
      up: { love: '지금은 결정을 서두르지 마세요.', money: '신중한 판단을 위해 기다리세요.', career: '충분한 정보를 모은 후 결정하세요.', health: '몸의 신호에 귀 기울이세요.' },
      rev: { love: '결정을 계속 미루면 좋지 않습니다.', money: '너무 많은 분석이 오히려 방해됩니다.', career: '결단이 필요한 시기입니다.', health: '검진을 미루지 마세요.' } },
    '3': { upKw: ['마음의 아픔', '이별', '슬픔'], revKw: ['치유', '회복', '용서'],
      up: { love: '마음의 상처를 받을 수 있습니다. 시간이 약입니다.', money: '감정적 손실에 주의하세요.', career: '실망스러운 소식이 있을 수 있어요.', health: '마음의 아픔이 몸에 영향을 줄 수 있어요.' },
      rev: { love: '상처가 아물기 시작합니다.', money: '손실에서 회복되는 시기입니다.', career: '실패에서 교훈을 얻습니다.', health: '마음의 치유가 시작됩니다.' } },
    '4': { upKw: ['휴식', '회복', '명상'], revKw: ['불안', '불면', '강제 휴식'],
      up: { love: '잠시 쉬면서 관계를 돌아보세요.', money: '재정적 결정을 잠시 보류하세요.', career: '재충전의 시간이 필요합니다.', health: '충분한 휴식을 취하세요.' },
      rev: { love: '불안이 관계에 영향을 줄 수 있어요.', money: '쉴 틈 없이 바쁠 수 있습니다.', career: '번아웃 직전입니다. 쉬어가세요.', health: '불면이나 불안에 주의하세요.' } },
    '5': { upKw: ['갈등', '패배감', '의견 충돌'], revKw: ['화해', '평화', '타협'],
      up: { love: '의견 충돌이 있을 수 있습니다.', money: '경쟁에서 불리한 위치일 수 있어요.', career: '직장 내 갈등에 주의하세요.', health: '스트레스가 높은 시기입니다.' },
      rev: { love: '갈등이 해결되는 시기입니다.', money: '공정한 해결책을 찾을 수 있어요.', career: '화해와 타협으로 문제를 해결하세요.', health: '스트레스가 줄어들고 있습니다.' } },
    '6': { upKw: ['이동', '전환', '회복'], revKw: ['정체', '미완의 문제', '저항'],
      up: { love: '새로운 환경에서 새 인연을 만날 수 있어요.', money: '재정적 전환이 이루어집니다.', career: '이직이나 부서 이동이 좋은 결과를 냅니다.', health: '환경 변화가 건강에 도움이 됩니다.' },
      rev: { love: '변화를 거부하면 관계가 정체됩니다.', money: '재정적 변화에 저항하지 마세요.', career: '변화를 받아들이세요.', health: '환경을 바꾸면 건강이 좋아집니다.' } },
    '7': { upKw: ['전략', '계획', '외교'], revKw: ['속임수', '배신', '부정직'],
      up: { love: '전략적인 접근이 좋은 결과를 냅니다.', money: '스마트한 투자 전략을 세우세요.', career: '계획적으로 움직이면 성과를 냅니다.', health: '건강 관리에 전략적으로 접근하세요.' },
      rev: { love: '속임수나 거짓에 주의하세요.', money: '사기를 조심하세요.', career: '부정직한 사람을 주의하세요.', health: '건강 관련 허위 정보에 주의하세요.' } },
    '8': { upKw: ['제한', '속박', '무력감'], revKw: ['해방', '자유', '새로운 시각'],
      up: { love: '관계에서 답답함을 느낄 수 있습니다.', money: '재정적 제약이 있을 수 있어요.', career: '업무에서 제한을 느끼는 시기입니다.', health: '스트레스에 속박된 느낌이 들 수 있어요.' },
      rev: { love: '제한에서 벗어나 자유를 찾습니다.', money: '재정적 속박에서 벗어납니다.', career: '새로운 가능성을 발견합니다.', health: '마음이 가벼워지는 것을 느낍니다.' } },
    '9': { upKw: ['불안', '걱정', '두려움'], revKw: ['희망', '극복', '안도'],
      up: { love: '과도한 걱정이 관계를 해칠 수 있어요.', money: '재정 걱정이 있을 수 있습니다.', career: '압박감을 느끼는 시기입니다.', health: '불안으로 인한 건강 문제에 주의하세요.' },
      rev: { love: '걱정이 해소되고 안도감을 느낍니다.', money: '재정 걱정에서 벗어나기 시작합니다.', career: '불안을 극복하고 자신감을 되찾습니다.', health: '마음의 평화를 되찾습니다.' } },
    '10': { upKw: ['끝', '바닥', '완전한 종료'], revKw: ['재생', '새벽', '회복'],
      up: { love: '어려운 시기의 끝이 보입니다. 버텨내세요.', money: '바닥을 찍고 올라갈 일만 남았습니다.', career: '힘든 시기지만 곧 끝납니다.', health: '가장 힘든 시기가 지나가고 있습니다.' },
      rev: { love: '어둠이 지나고 새벽이 옵니다.', money: '재정적 회복이 시작됩니다.', career: '새로운 기회가 열립니다.', health: '회복의 기운이 느껴집니다.' } },
    시종: { upKw: ['호기심', '분석', '관찰'], revKw: ['냉소', '험담', '스파이'],
      up: { love: '상대를 관찰하고 알아가는 시기입니다.', money: '분석적 접근이 도움이 됩니다.', career: '학습과 연구에 좋은 시기입니다.', health: '건강 정보를 꼼꼼히 확인하세요.' },
      rev: { love: '상대를 의심하기보다 믿어보세요.', money: '남의 투자 실적에 냉소적이지 마세요.', career: '험담에 주의하세요.', health: '부정적 생각을 줄이세요.' } },
    기사: { upKw: ['결단', '속도', '직진'], revKw: ['충동', '공격', '무모'],
      up: { love: '빠른 진전이 있을 수 있습니다.', money: '빠른 결단이 이익을 가져옵니다.', career: '신속한 행동이 성과를 냅니다.', health: '활발한 활동이 좋습니다.' },
      rev: { love: '너무 급하면 실수합니다.', money: '충동적 투자를 피하세요.', career: '말을 조심하세요.', health: '과격한 운동을 주의하세요.' } },
    여왕: { upKw: ['지적 능력', '독립', '명석함'], revKw: ['냉정', '고립', '편견'],
      up: { love: '지적인 대화가 관계를 깊게 합니다.', money: '냉철한 분석이 좋은 투자 결정을 이끕니다.', career: '분석력과 판단력이 빛납니다.', health: '명확한 건강 계획을 세우세요.' },
      rev: { love: '너무 냉정하면 상대가 멀어질 수 있어요.', money: '감정도 고려한 판단이 필요합니다.', career: '소통 부족에 주의하세요.', health: '마음도 돌보세요.' } },
    왕: { upKw: ['권위', '논리', '명석한 판단'], revKw: ['독재', '편협', '냉혹'],
      up: { love: '논리적이고 명확한 소통이 관계에 도움이 됩니다.', money: '현명하고 논리적인 투자 판단을 합니다.', career: '공정하고 합리적인 리더십을 발휘합니다.', health: '체계적인 건강 관리가 효과적입니다.' },
      rev: { love: '감정을 무시하지 마세요.', money: '너무 엄격한 기준이 기회를 놓칠 수 있어요.', career: '팀원의 의견을 경청하세요.', health: '감정 건강도 중요합니다.' } }
  },
  // ---- 펜타클 (Pentacles) ----
  펜타클: {
    A: { upKw: ['새로운 기회', '번영', '물질적 시작'], revKw: ['놓친 기회', '재정 문제', '계획 부재'],
      up: { love: '안정적인 관계의 시작이 기대됩니다.', money: '새로운 수입원이 생깁니다.', career: '좋은 직업 기회가 찾아옵니다.', health: '건강한 생활의 시작입니다.' },
      rev: { love: '물질적 조건에 너무 집착하지 마세요.', money: '좋은 기회를 놓치지 않도록 주의하세요.', career: '준비 부족으로 기회를 놓칠 수 있어요.', health: '건강 관리를 미루지 마세요.' } },
    '2': { upKw: ['균형', '유연성', '멀티태스킹'], revKw: ['불균형', '과부하', '무질서'],
      up: { love: '여러 관계의 균형을 잘 맞출 수 있습니다.', money: '수입과 지출의 균형을 잡으세요.', career: '여러 프로젝트를 동시에 잘 처리합니다.', health: '일과 휴식의 균형이 중요합니다.' },
      rev: { love: '관계와 일의 균형이 무너질 수 있어요.', money: '수입이 불안정합니다.', career: '너무 많은 일을 벌이지 마세요.', health: '스케줄 과부하에 주의하세요.' } },
    '3': { upKw: ['장인정신', '팀워크', '기술'], revKw: ['미숙함', '품질 저하', '협업 문제'],
      up: { love: '함께 무언가를 만들어가는 기쁨이 있습니다.', money: '전문 기술로 수익을 올립니다.', career: '팀워크로 뛰어난 결과를 냅니다.', health: '전문가의 도움을 받으면 좋습니다.' },
      rev: { love: '관계에 더 많은 노력을 기울이세요.', money: '품질에 투자하세요.', career: '협업에 문제가 있을 수 있어요.', health: '전문가 상담을 받아보세요.' } },
    '4': { upKw: ['안정', '절약', '보존'], revKw: ['인색', '물질 집착', '고립'],
      up: { love: '안정적인 관계를 유지합니다.', money: '저축과 절약이 미래를 밝혀줍니다.', career: '안정적인 직장 생활이 이어집니다.', health: '규칙적인 생활이 건강의 기본입니다.' },
      rev: { love: '물질에 집착하면 사랑을 놓칩니다.', money: '너무 인색하면 기회를 놓칩니다.', career: '변화를 두려워하지 마세요.', health: '돈을 아끼려 건강을 무시하지 마세요.' } },
    '5': { upKw: ['어려움', '결핍', '시련'], revKw: ['회복', '도움', '극복'],
      up: { love: '어려운 시기를 함께 이겨내면 관계가 강해집니다.', money: '재정적 어려움이 있을 수 있습니다.', career: '직업적 불안이 있을 수 있어요.', health: '건강에 더 신경 쓰세요.' },
      rev: { love: '어려운 시기가 지나가고 있습니다.', money: '재정적 도움을 받을 수 있어요.', career: '위기를 극복할 수 있습니다.', health: '건강이 회복되고 있습니다.' } },
    '6': { upKw: ['관대함', '나눔', '균형'], revKw: ['빚', '불평등', '이기심'],
      up: { love: '주고받는 균형이 좋은 관계입니다.', money: '나누면 더 돌아옵니다.', career: '공정한 대우를 받습니다.', health: '봉사 활동이 마음에 기쁨을 줍니다.' },
      rev: { love: '관계에서 불균형을 느낄 수 있어요.', money: '빚을 조심하세요.', career: '공정하지 못한 상황에 처할 수 있어요.', health: '자기만 위하는 건강 관리는 지속되지 않습니다.' } },
    '7': { upKw: ['인내', '투자', '장기적 성과'], revKw: ['조급함', '성과 부족', '좌절'],
      up: { love: '인내하면 좋은 관계로 발전합니다.', money: '장기 투자가 결실을 맺습니다.', career: '꾸준한 노력이 성과로 나타납니다.', health: '꾸준한 건강 관리가 효과를 봅니다.' },
      rev: { love: '결과를 서두르지 마세요.', money: '성과가 늦어 좌절할 수 있지만 포기하지 마세요.', career: '노력이 바로 보상받지 못할 수 있어요.', health: '꾸준함이 부족합니다.' } },
    '8': { upKw: ['장인정신', '노력', '집중'], revKw: ['완벽주의', '무의미', '반복'],
      up: { love: '관계에 정성을 쏟으면 보답받습니다.', money: '성실한 노력이 수입으로 이어집니다.', career: '전문성을 갈고닦는 시기입니다.', health: '꾸준한 운동이 효과를 봅니다.' },
      rev: { love: '완벽한 관계를 추구하지 마세요.', money: '같은 방법만 고집하지 마세요.', career: '의미 없는 반복 업무에서 벗어나세요.', health: '운동 루틴을 바꿔보세요.' } },
    '9': { upKw: ['풍요', '독립', '자수성가'], revKw: ['물질 만능주의', '외로움', '손실'],
      up: { love: '독립적이면서도 풍요로운 관계입니다.', money: '재정적 독립과 풍요를 누립니다.', career: '자수성가형 성공이 기대됩니다.', health: '좋은 건강 상태를 유지합니다.' },
      rev: { love: '물질보다 마음이 중요합니다.', money: '과도한 사치를 조심하세요.', career: '성공에 도취되지 마세요.', health: '물질적 풍요가 건강을 보장하지 않습니다.' } },
    '10': { upKw: ['유산', '가문', '영속적 부'], revKw: ['가족 갈등', '유산 분쟁', '짐'],
      up: { love: '가족의 축복을 받는 관계입니다.', money: '대대로 이어지는 부가 기대됩니다.', career: '오래 지속되는 성과를 만듭니다.', health: '가문의 건강 이력을 확인하세요.' },
      rev: { love: '가족 간 갈등이 있을 수 있어요.', money: '유산이나 상속 관련 문제에 주의하세요.', career: '후계 문제에 주의하세요.', health: '가족력 질환을 점검하세요.' } },
    시종: { upKw: ['학습', '기회', '성실'], revKw: ['게으름', '비현실', '놓친 기회'],
      up: { love: '진지한 만남이 기대됩니다.', money: '새로운 투자 공부를 시작하세요.', career: '배움의 기회를 놓치지 마세요.', health: '건강 지식을 쌓으세요.' },
      rev: { love: '게으른 태도는 관계를 해칩니다.', money: '공부 없이 투자하지 마세요.', career: '나태함을 주의하세요.', health: '건강 관리를 게을리하지 마세요.' } },
    기사: { upKw: ['근면', '책임', '신뢰'], revKw: ['나태', '무책임', '정체'],
      up: { love: '신뢰할 수 있는 파트너입니다.', money: '꾸준한 노력이 수입을 만듭니다.', career: '책임감 있는 모습이 인정받습니다.', health: '규칙적인 운동이 효과적입니다.' },
      rev: { love: '책임감 부족이 관계를 흔듭니다.', money: '게으름이 재정을 악화시킵니다.', career: '동기 부여가 필요합니다.', health: '운동을 게을리하지 마세요.' } },
    여왕: { upKw: ['풍요', '실용', '안정'], revKw: ['불안', '의존', '과소비'],
      up: { love: '안정적이고 풍요로운 사랑입니다.', money: '실용적인 재정 관리로 풍요를 누립니다.', career: '실용적 능력이 인정받습니다.', health: '자연 친화적인 활동이 건강에 좋습니다.' },
      rev: { love: '물질에 의존한 관계는 오래가지 않습니다.', money: '과소비를 주의하세요.', career: '안정에 안주하지 마세요.', health: '자연과 접하면 건강이 좋아집니다.' } },
    왕: { upKw: ['부', '성공', '경영 능력'], revKw: ['물질 만능', '탐욕', '독점'],
      up: { love: '물질적으로 안정된 관계입니다.', money: '재물운이 최고조입니다.', career: '경영 능력이 빛나는 시기입니다.', health: '안정된 생활이 건강의 기본입니다.' },
      rev: { love: '돈으로 사랑을 살 수 없습니다.', money: '탐욕이 화를 부릅니다.', career: '독점적 태도는 반발을 삽니다.', health: '스트레스성 질환에 주의하세요.' } }
  }
};

// ==================== 전체 카드 배열 생성 (78장) ====================

function buildAllCards() {
  const cards = [...MAJOR_ARCANA];
  let id = 22;
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      const data = MINOR_DATA[suit.name][rank];
      cards.push({
        id: id++,
        name: `${suit.name} ${rank}`,
        nameEn: `${rank} of ${suit.nameEn}`,
        symbol: suit.symbol,
        suitSymbol: suit.symbol,
        suit: suit.name,
        rank: rank,
        upKeywords: data.upKw,
        reversedKeywords: data.revKw,
        upMeaning: data.up,
        reversedMeaning: data.rev
      });
    }
  }
  return cards;
}

const ALL_CARDS = buildAllCards();

// ==================== 카드 이미지 경로 ====================

const MAJOR_IMAGE_NAMES = [
  '00-fool', '01-magician', '02-high-priestess', '03-empress', '04-emperor',
  '05-hierophant', '06-lovers', '07-chariot', '08-strength', '09-hermit',
  '10-wheel-of-fortune', '11-justice', '12-hanged-man', '13-death',
  '14-temperance', '15-devil', '16-tower', '17-star', '18-moon',
  '19-sun', '20-judgement', '21-world'
];

const RANK_IMAGE_MAP = {
  'A': 'ace', '2': '02', '3': '03', '4': '04', '5': '05',
  '6': '06', '7': '07', '8': '08', '9': '09', '10': '10',
  '시종': 'page', '기사': 'knight', '여왕': 'queen', '왕': 'king'
};

const SUIT_IMAGE_MAP = {
  '완드': 'wands', '컵': 'cups', '소드': 'swords', '펜타클': 'pentacles'
};

const CARD_IMAGE_BASE = '/dunsmile/tarot-reading/images';

function getCardImagePath(card) {
  if (card.id < 22) {
    return `${CARD_IMAGE_BASE}/major/${MAJOR_IMAGE_NAMES[card.id]}.png`;
  }
  const suitDir = SUIT_IMAGE_MAP[card.suit];
  const rankFile = RANK_IMAGE_MAP[card.rank];
  return `${CARD_IMAGE_BASE}/${suitDir}/${rankFile}.png`;
}

// ==================== 행운 요소 데이터 ====================

const LUCKY_COLORS_TAROT = [
  { name: '퍼플', hex: '#7c3aed', meaning: '영감과 신비' },
  { name: '인디고', hex: '#4338ca', meaning: '직관과 지혜' },
  { name: '골드', hex: '#d97706', meaning: '풍요와 행운' },
  { name: '실버', hex: '#9ca3af', meaning: '명석함과 직감' },
  { name: '로즈', hex: '#e11d48', meaning: '사랑과 치유' },
  { name: '에메랄드', hex: '#059669', meaning: '성장과 재생' },
  { name: '사파이어', hex: '#2563eb', meaning: '진실과 신뢰' },
  { name: '루비', hex: '#dc2626', meaning: '열정과 용기' },
  { name: '문스톤', hex: '#e2e8f0', meaning: '직감과 보호' },
  { name: '앰버', hex: '#f59e0b', meaning: '치유와 활력' }
];

const LUCKY_DIRECTIONS_TAROT = ['동쪽', '서쪽', '남쪽', '북쪽', '동남쪽', '서남쪽', '동북쪽', '서북쪽'];

const TAROT_ADVICE = [
  "오늘은 직감을 믿어보세요. 마음이 이끄는 대로 따라가면 좋은 결과가 있을 거예요.",
  "작은 변화가 큰 행운을 부릅니다. 평소와 다른 선택을 해보세요.",
  "감사하는 마음으로 하루를 시작하면 우주가 응답합니다.",
  "오늘 만나는 사람에게 진심으로 미소 지어보세요. 예상치 못한 인연이 될 수 있어요.",
  "잠들기 전 내일의 좋은 일을 상상하면 현실이 됩니다.",
  "물을 한 잔 마시며 잠시 멈추세요. 그 순간 필요한 답이 떠오를 거예요.",
  "오늘은 보라색 아이템이 행운을 가져다줍니다.",
  "하루에 5분, 조용히 자신의 마음에 귀 기울여보세요.",
  "매듭짓지 못한 일이 있다면 오늘 마무리해보세요. 마음이 가벼워집니다.",
  "오늘은 창문을 열고 신선한 공기를 마시세요. 새로운 에너지가 들어옵니다.",
  "좋아하는 음악을 들으며 걸어보세요. 영감이 찾아올 거예요.",
  "오래된 물건을 정리하면 새로운 에너지가 흐릅니다.",
  "달빛 아래 소원을 빌어보세요. 우주가 듣고 있습니다.",
  "오늘은 왼손으로 무언가를 해보세요. 직감이 깨어납니다.",
  "향기로운 차 한 잔이 하루의 방향을 바꿀 수 있어요.",
  "거울을 보며 자신에게 격려의 말을 건네보세요.",
  "자연 속에서 시간을 보내면 에너지가 충전됩니다.",
  "오늘은 보라색이나 파란색 옷을 입으면 행운이 따릅니다.",
  "일기를 써보세요. 생각을 정리하면 길이 보입니다.",
  "별을 올려다보세요. 우주의 에너지가 당신을 응원하고 있어요."
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

function hashCode2(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 7) + hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function hashCode3(str) {
  let hash = 7919;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 3) + hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// ==================== 카드 선택 로직 ====================

function getTodayDateStr() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
}

function generateReading(name, gender, birthYear, birthMonth, birthDay, spread, category) {
  const dateStr = getTodayDateStr();
  const baseKey = name + gender + birthYear + birthMonth + birthDay + dateStr + category;

  const h1 = hashCode(baseKey);
  const h2 = hashCode2(baseKey);
  const h3 = hashCode3(baseKey);

  // 카드 선택
  const cardIdx1 = h1 % 78;
  const isReversed1 = (h1 % 2) === 1;
  const card1 = ALL_CARDS[cardIdx1];

  let cards = [{
    card: card1,
    reversed: isReversed1,
    position: '현재'
  }];

  if (spread === 'three') {
    // 3카드: 중복 없이 선택
    let cardIdx2 = h2 % 78;
    if (cardIdx2 === cardIdx1) cardIdx2 = (cardIdx2 + 1) % 78;
    const isReversed2 = (h2 % 2) === 1;

    let cardIdx3 = h3 % 78;
    while (cardIdx3 === cardIdx1 || cardIdx3 === cardIdx2) {
      cardIdx3 = (cardIdx3 + 1) % 78;
    }
    const isReversed3 = (h3 % 2) === 1;

    cards = [
      { card: ALL_CARDS[cardIdx2], reversed: isReversed2, position: '과거' },
      { card: ALL_CARDS[cardIdx1], reversed: isReversed1, position: '현재' },
      { card: ALL_CARDS[cardIdx3], reversed: isReversed3, position: '미래' }
    ];
  }

  // 행운 요소
  const luckyNumber1 = (h1 % 45) + 1;
  let luckyNumber2 = (h2 % 45) + 1;
  if (luckyNumber2 === luckyNumber1) luckyNumber2 = (luckyNumber2 % 44) + 1;
  const luckyColor = LUCKY_COLORS_TAROT[h1 % LUCKY_COLORS_TAROT.length];
  const luckyDirection = LUCKY_DIRECTIONS_TAROT[h2 % LUCKY_DIRECTIONS_TAROT.length];
  const advice = TAROT_ADVICE[h3 % TAROT_ADVICE.length];

  return {
    name,
    gender,
    birthYear,
    birthMonth,
    birthDay,
    date: dateStr,
    spread,
    category,
    cards,
    luckyNumbers: [luckyNumber1, luckyNumber2],
    luckyColor,
    luckyDirection,
    advice
  };
}

// ==================== UI 함수 ====================

function selectGender(gender) {
  selectedGender = gender;
  document.getElementById('genderMale').classList.remove('border-purple-500', 'bg-purple-50', 'text-purple-700');
  document.getElementById('genderFemale').classList.remove('border-purple-500', 'bg-purple-50', 'text-purple-700');
  if (gender === 'male') {
    document.getElementById('genderMale').classList.add('border-purple-500', 'bg-purple-50', 'text-purple-700');
  } else {
    document.getElementById('genderFemale').classList.add('border-purple-500', 'bg-purple-50', 'text-purple-700');
  }
}

function selectSpread(spread) {
  selectedSpread = spread;
  document.getElementById('spreadOne').classList.remove('border-purple-500', 'bg-purple-50', 'text-purple-700');
  document.getElementById('spreadThree').classList.remove('border-purple-500', 'bg-purple-50', 'text-purple-700');
  if (spread === 'one') {
    document.getElementById('spreadOne').classList.add('border-purple-500', 'bg-purple-50', 'text-purple-700');
  } else {
    document.getElementById('spreadThree').classList.add('border-purple-500', 'bg-purple-50', 'text-purple-700');
  }
}

function selectCategory(cat) {
  selectedCategory = cat;
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.classList.remove('border-purple-500', 'bg-purple-50', 'text-purple-700');
  });
  document.getElementById('cat-' + cat).classList.add('border-purple-500', 'bg-purple-50', 'text-purple-700');
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

function validateBirthDate() {
  const year = document.getElementById('birthYear').value.trim();
  const month = document.getElementById('birthMonth').value.trim();
  const day = document.getElementById('birthDay').value.trim();
  if (!year || year.length !== 4) { showToast('생년(4자리)을 입력해주세요'); document.getElementById('birthYear').focus(); return false; }
  if (!month || parseInt(month) < 1 || parseInt(month) > 12) { showToast('월(1~12)을 입력해주세요'); document.getElementById('birthMonth').focus(); return false; }
  if (!day || parseInt(day) < 1 || parseInt(day) > 31) { showToast('일(1~31)을 입력해주세요'); document.getElementById('birthDay').focus(); return false; }
  return true;
}

// ==================== localStorage ====================

function getSavedUserInfo() {
  try { const d = localStorage.getItem(TAROT_STORAGE.USER); return d ? JSON.parse(d) : null; } catch(e) { return null; }
}

function getSavedResult() {
  try { const d = localStorage.getItem(TAROT_STORAGE.RESULT); return d ? JSON.parse(d) : null; } catch(e) { return null; }
}

function saveUserInfo(name, gender, birthYear, birthMonth, birthDay) {
  localStorage.setItem(TAROT_STORAGE.USER, JSON.stringify({ name, gender, birthYear, birthMonth, birthDay }));
  localStorage.setItem(TAROT_STORAGE.REMEMBER, 'true');
}

function saveTarotResult(result) {
  localStorage.setItem(TAROT_STORAGE.RESULT, JSON.stringify(result));
}

function clearSavedData() {
  localStorage.removeItem(TAROT_STORAGE.USER);
  localStorage.removeItem(TAROT_STORAGE.RESULT);
  localStorage.removeItem(TAROT_STORAGE.REMEMBER);
}

// ==================== 초기화 ====================

function initTarot() {
  const remember = localStorage.getItem(TAROT_STORAGE.REMEMBER);
  const userInfo = getSavedUserInfo();

  if (remember === 'true' && userInfo) {
    const savedResult = getSavedResult();
    const hasResultToday = savedResult && savedResult.date === getTodayDateStr();
    setupWelcomeScreen(userInfo, hasResultToday);
    showStep(0);
  } else {
    showStep(1);
  }

  // 기본 스프레드 선택
  selectSpread('one');
}

function setupWelcomeScreen(userInfo, hasResultToday) {
  const titleEl = document.getElementById('welcomeTitle');
  const subtitleEl = document.getElementById('welcomeSubtitle');
  const ctaBtn = document.getElementById('welcomeCta');

  if (hasResultToday) {
    titleEl.textContent = `${userInfo.name}님! 오늘의 카드가 기다리고 있어요`;
    subtitleEl.textContent = '이미 뽑은 카드를 다시 확인해보세요';
    ctaBtn.textContent = '오늘의 카드 다시 보기';
  } else {
    titleEl.textContent = `${userInfo.name}님! 오늘의 카드를 뽑아보세요`;
    subtitleEl.textContent = '타로 카드가 전하는 오늘의 메시지';
    ctaBtn.textContent = '오늘의 카드 뽑기';
  }
}

function handleWelcomeCta() {
  const userInfo = getSavedUserInfo();
  if (!userInfo) { showStep(1); return; }

  const savedResult = getSavedResult();
  const hasResultToday = savedResult && savedResult.date === getTodayDateStr();

  if (hasResultToday) {
    tarotResult = savedResult;
    showStep(3);
    displayResult();
  } else {
    // 입력 폼으로 이동 (스프레드/카테고리 선택 필요)
    document.getElementById('userName').value = userInfo.name;
    selectedGender = userInfo.gender;
    selectGender(userInfo.gender);
    document.getElementById('birthYear').value = userInfo.birthYear;
    document.getElementById('birthMonth').value = userInfo.birthMonth;
    document.getElementById('birthDay').value = userInfo.birthDay;
    document.getElementById('agreeTerms').checked = true;
    document.getElementById('rememberMe').checked = true;
    showStep(1);
  }
}

function goToInputForm() {
  clearSavedData();
  document.getElementById('userName').value = '';
  document.getElementById('birthYear').value = '';
  document.getElementById('birthMonth').value = '';
  document.getElementById('birthDay').value = '';
  document.getElementById('rememberMe').checked = false;
  document.getElementById('agreeTerms').checked = false;
  selectedGender = null;
  selectedCategory = null;
  document.getElementById('genderMale').classList.remove('border-purple-500', 'bg-purple-50', 'text-purple-700');
  document.getElementById('genderFemale').classList.remove('border-purple-500', 'bg-purple-50', 'text-purple-700');
  document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('border-purple-500', 'bg-purple-50', 'text-purple-700'));
  showStep(1);
}

// ==================== 리딩 시작 ====================

function startReading() {
  const name = document.getElementById('userName').value.trim();
  const agreeTerms = document.getElementById('agreeTerms').checked;

  if (!name) { showToast('이름을 입력해주세요'); return; }
  if (!selectedGender) { showToast('성별을 선택해주세요'); return; }
  if (!validateBirthDate()) return;
  if (!selectedCategory) { showToast('질문 카테고리를 선택해주세요'); return; }
  if (!agreeTerms) { showToast('개인정보 수집에 동의해주세요'); return; }

  const year = document.getElementById('birthYear').value.trim();
  const month = document.getElementById('birthMonth').value.trim().padStart(2, '0');
  const day = document.getElementById('birthDay').value.trim().padStart(2, '0');

  tarotResult = generateReading(name, selectedGender, year, month, day, selectedSpread, selectedCategory);

  const rememberMe = document.getElementById('rememberMe');
  if (rememberMe && rememberMe.checked) {
    saveUserInfo(name, selectedGender, year, month, day);
    saveTarotResult(tarotResult);
  } else {
    clearSavedData();
  }

  saveToFirebase(tarotResult);

  showStep(2);
  startLoadingAnimation();
}

// ==================== 로딩 애니메이션 ====================

function startLoadingAnimation() {
  const messages = [
    '카드를 섞고 있습니다...',
    '우주의 에너지를 모으고 있어요...',
    '당신의 기운을 읽고 있습니다...',
    '카드가 메시지를 전하고 있어요...',
    '오늘의 카드를 선택하고 있습니다...'
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
    if (newIdx !== msgIdx) { msgIdx = newIdx; msgText.textContent = messages[msgIdx]; }
    progressBar.style.width = progress + '%';
    percentText.textContent = Math.floor(progress);
  }, 250);
}

// ==================== 결과 표시 ====================

const CATEGORY_LABELS = { love: '연애 💕', money: '금전 💰', career: '직장 💼', health: '건강 🏃' };
const CATEGORY_KEYS = { love: 'love', money: 'money', career: 'career', health: 'health' };

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일 (${days[date.getDay()]})`;
}

function displayResult() {
  const r = tarotResult;

  // 헤더
  document.getElementById('resultDate').textContent = formatDate(r.date);
  document.getElementById('resultName').textContent = r.name;
  document.getElementById('resultCategory').textContent = CATEGORY_LABELS[r.category];
  document.getElementById('resultSpread').textContent = r.spread === 'one' ? '1카드 스프레드' : '3카드 스프레드 (과거-현재-미래)';

  // 카드 렌더링
  const cardsContainer = document.getElementById('cardsContainer');
  cardsContainer.innerHTML = '';

  if (r.spread === 'one') {
    cardsContainer.className = 'flex justify-center';
    cardsContainer.innerHTML = renderCardHTML(r.cards[0], true);
  } else {
    cardsContainer.className = '';
    r.cards.forEach(c => {
      cardsContainer.innerHTML += renderCardHTML(c, false);
    });
  }

  // 카드 해석
  const interpretationContainer = document.getElementById('interpretationContainer');
  interpretationContainer.innerHTML = '';
  r.cards.forEach(c => {
    interpretationContainer.innerHTML += renderInterpretation(c, r.category);
  });

  // 오늘의 한마디
  document.getElementById('dailyAdvice').textContent = `"${r.advice}"`;

  // 카드 뒤집기 애니메이션 (약간의 딜레이)
  setTimeout(() => {
    document.querySelectorAll('.tarot-card').forEach((card, i) => {
      setTimeout(() => card.classList.add('flipped'), i * 400);
    });
  }, 300);
}

function renderCardHTML(cardData, isSingle) {
  const { card, reversed, position } = cardData;
  const sizeClass = isSingle ? 'tarot-card-single' : 'tarot-card-multi';
  const imgSrc = getCardImagePath(card);
  const backSrc = `${CARD_IMAGE_BASE}/back.png`;

  return `
    <div class="flex flex-col items-center">
      <div class="text-xs font-bold text-purple-400 mb-2 uppercase tracking-wider">${position}</div>
      <div class="tarot-card ${sizeClass} cursor-pointer" onclick="this.classList.toggle('flipped')">
        <div class="tarot-card-inner" style="transform-style:preserve-3d;transition:transform 0.8s ease">
          <!-- 뒷면 -->
          <div class="tarot-card-back absolute inset-0 rounded-xl shadow-lg border-2 border-purple-300 overflow-hidden" style="backface-visibility:hidden">
            <img src="${backSrc}" alt="카드 뒷면" class="w-full h-full object-cover rounded-xl">
          </div>
          <!-- 앞면 -->
          <div class="tarot-card-front absolute inset-0 rounded-xl shadow-lg border-2 ${reversed ? 'border-red-300' : 'border-purple-300'} overflow-hidden" style="backface-visibility:hidden;transform:rotateY(180deg)">
            <img src="${imgSrc}" alt="${card.name}" class="w-full h-full object-cover rounded-xl ${reversed ? 'rotate-180' : ''}">
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t ${reversed ? 'from-red-900/80' : 'from-purple-900/80'} to-transparent p-2 pt-6">
              <div class="text-center">
                <div class="text-xs font-bold text-white">${card.name}</div>
                <div class="text-xs text-white/70">${card.nameEn}</div>
                <span class="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold ${reversed ? 'bg-red-500/80 text-white' : 'bg-purple-500/80 text-white'}">
                  ${reversed ? '역방향 ↓' : '정방향 ↑'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderInterpretation(cardData, category) {
  const { card, reversed, position } = cardData;
  const meaning = reversed ? card.reversedMeaning[category] : card.upMeaning[category];
  const keywords = reversed ? card.reversedKeywords : card.upKeywords;
  const dirLabel = reversed ? '역방향' : '정방향';
  const dirColor = reversed ? 'text-red-500' : 'text-purple-600';
  const borderColor = reversed ? 'border-red-200 bg-red-50' : 'border-purple-200 bg-purple-50';

  return `
    <div class="border rounded-2xl p-4 ${borderColor} mb-3">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">${card.symbol}</span>
        <div>
          <div class="font-bold text-gray-900">${card.name} <span class="text-sm ${dirColor}">(${dirLabel})</span></div>
          <div class="text-xs text-gray-500">${position} · ${card.nameEn}</div>
        </div>
      </div>
      <div class="flex flex-wrap gap-1 mb-3">
        ${keywords.map(kw => `<span class="text-xs px-2 py-0.5 rounded-full bg-white/60 text-gray-600">${kw}</span>`).join('')}
      </div>
      <p class="text-sm text-gray-700 leading-relaxed">${meaning}</p>
    </div>
  `;
}

// ==================== 스텝 전환 ====================

function showStep(stepNumber) {
  document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
  document.getElementById('step' + stepNumber).classList.add('active');
  window.scrollTo(0, 0);
}

// ==================== Firebase ====================

async function saveToFirebase(result) {
  try {
    await db.collection('tarot_reading_results').add({
      name: result.name,
      gender: result.gender,
      birthYear: result.birthYear,
      birthMonth: result.birthMonth,
      birthDay: result.birthDay,
      date: result.date,
      spread: result.spread,
      category: result.category,
      cards: result.cards.map(c => ({
        name: c.card.name,
        reversed: c.reversed,
        position: c.position
      })),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log('Tarot reading saved to Firebase');
  } catch (error) {
    console.error('Error saving to Firebase:', error);
  }
}

// ==================== 공유 & 다시하기 ====================

function shareResult() {
  const shareUrl = window.location.origin + '/dunsmile/tarot-reading/';
  const mainCard = tarotResult.cards[tarotResult.spread === 'one' ? 0 : 1];
  const dirLabel = mainCard.reversed ? '역방향' : '정방향';
  const shareText = `오늘의 타로 카드: ${mainCard.card.name} (${dirLabel}) ${mainCard.card.symbol}\n${CATEGORY_LABELS[tarotResult.category]} 리딩 결과를 확인해보세요!`;

  if (navigator.share) {
    navigator.share({ title: 'ONE DAY MY CARD | 도파민 공작소', text: shareText, url: shareUrl }).catch(console.error);
  } else {
    navigator.clipboard.writeText(shareUrl).then(() => showToast('링크가 복사되었습니다!')).catch(() => showToast('공유를 지원하지 않는 브라우저입니다'));
  }
}

async function downloadTarotShareCard() {
  if (!tarotResult) { showToast('먼저 카드를 뽑아주세요'); return; }
  if (!window.DopaminShareCard) { showToast('공유 카드 기능을 불러오지 못했습니다'); return; }

  const mainCard = tarotResult.cards[tarotResult.spread === 'one' ? 0 : 1];
  await window.DopaminShareCard.download({
    title: 'ONE DAY MY CARD',
    subtitle: `${tarotResult.name}님의 타로 리딩`,
    highlight: `${mainCard.card.name} ${mainCard.card.symbol}`,
    tags: [
      mainCard.reversed ? '역방향' : '정방향',
      CATEGORY_LABELS[tarotResult.category],
      tarotResult.spread === 'one' ? '1카드' : '3카드'
    ],
    footer: 'dopamine-factory.pages.dev/dunsmile/tarot-reading/',
    fromColor: '#7c3aed',
    toColor: '#4338ca',
    filePrefix: 'tarot-reading'
  });
  showToast('결과 이미지 카드가 저장되었습니다!');
}

function retakeReading() {
  selectedCategory = null;
  tarotResult = null;

  const remember = localStorage.getItem(TAROT_STORAGE.REMEMBER);
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
    document.getElementById('genderMale').classList.remove('border-purple-500', 'bg-purple-50', 'text-purple-700');
    document.getElementById('genderFemale').classList.remove('border-purple-500', 'bg-purple-50', 'text-purple-700');
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('border-purple-500', 'bg-purple-50', 'text-purple-700'));
    showStep(1);
  }
}

// ==================== 서비스 메뉴 / 설정 ====================

function openServiceMenu() {
  const backdrop = document.getElementById('serviceMenuBackdrop');
  const sidebar = document.getElementById('serviceMenuSidebar');
  if (backdrop && sidebar) { backdrop.classList.add('open'); sidebar.classList.add('open'); }
}
function closeServiceMenu() {
  const backdrop = document.getElementById('serviceMenuBackdrop');
  const sidebar = document.getElementById('serviceMenuSidebar');
  if (backdrop && sidebar) { backdrop.classList.remove('open'); sidebar.classList.remove('open'); }
}
function openSettings() { const m = document.getElementById('settingsModal'); if (m) m.classList.add('active'); }
function closeSettings() { const m = document.getElementById('settingsModal'); if (m) m.classList.remove('active'); }

// ==================== 전역 함수 노출 ====================

window.selectGender = selectGender;
window.selectSpread = selectSpread;
window.selectCategory = selectCategory;
window.startReading = startReading;
window.shareResult = shareResult;
window.downloadTarotShareCard = downloadTarotShareCard;
window.retakeReading = retakeReading;
window.openServiceMenu = openServiceMenu;
window.closeServiceMenu = closeServiceMenu;
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.autoFocusNext = autoFocusNext;
window.handleWelcomeCta = handleWelcomeCta;
window.goToInputForm = goToInputForm;

// 페이지 로드 시 초기화
initTarot();
