/* 신규 테스트 러너 데이터 */
(function initServiceLabRunners(global) {
  function q(title, a, b) {
    return { title, options: [{ label: a, value: 0 }, { label: b, value: 1 }] };
  }

  function pq(title, left, right) {
    return { title, options: [left, right] };
  }

  function makeRunner(title, subtitle, questions, results, insight, guide, related) {
    return { title, subtitle, questions, results, insight, guide, related };
  }

  function makeProfileRunner(title, subtitle, questions, profiles, related) {
    return { title, subtitle, questions, profiles, related };
  }

  const SERVICE_RUNNERS = {
    "mbti-wealth-dna": makeProfileRunner("내 DNA 속 부자력", "의사결정 패턴 기반으로 자산 성향을 진단합니다.", [
      pq("보너스가 생기면?", { label: "바로 기회에 투입", value: 1, dimension: "risk", weight: 2 }, { label: "분배 비율부터 정리", value: 0, dimension: "plan", weight: 2 }),
      pq("월급날 루틴은?", { label: "목표 투자 먼저", value: 1, dimension: "execution", weight: 1 }, { label: "고정비/저축 먼저", value: 0, dimension: "safety", weight: 1 }),
      pq("새 프로젝트 제안이 오면?", { label: "빠르게 테스트", value: 1, dimension: "risk", weight: 1 }, { label: "자료 검토 후 진입", value: 0, dimension: "plan", weight: 1 }),
      pq("소비 습관은?", { label: "경험 중심", value: 1, dimension: "impulse", weight: 1 }, { label: "내구재 중심", value: 0, dimension: "safety", weight: 1 }),
      pq("성과 관리 방식은?", { label: "월 성과 숫자 추적", value: 1, dimension: "execution", weight: 2 }, { label: "분기 흐름 점검", value: 0, dimension: "plan", weight: 1 }),
      pq("리스크 인식은?", { label: "손실 감수 가능", value: 1, dimension: "risk", weight: 2 }, { label: "원금 보전 우선", value: 0, dimension: "safety", weight: 2 }),
      pq("새 도구 도입은?", { label: "먼저 써보며 최적화", value: 1, dimension: "execution", weight: 1 }, { label: "사례 확인 후 도입", value: 0, dimension: "plan", weight: 1 }),
      pq("장기 목표는?", { label: "수익률 성장", value: 1, dimension: "risk", weight: 1 }, { label: "현금흐름 안정", value: 0, dimension: "safety", weight: 1 }),
    ], [
      { title: "공격형 성장자", match: { risk: 4, execution: 3 }, insight: "기회 포착 속도가 빠른 타입입니다. 손실 한도를 먼저 정하면 성과 변동을 줄일 수 있습니다.", guide: ["손실 한도 %를 선설정", "월별 성과/실패 요인 분리 기록", "고위험 비중 상한 고정"] },
      { title: "균형형 설계자", match: { plan: 4, execution: 2 }, insight: "분배와 구조 설계가 강점입니다. 실행 속도를 보완하면 성장 기회를 더 살릴 수 있습니다.", guide: ["실행 마감일을 숫자로 명시", "의사결정 체크리스트 3개 유지", "분기별 자산 비율 리밸런싱"] },
      { title: "안정형 관리자", match: { safety: 4, plan: 2 }, insight: "리스크 관리에 탁월합니다. 안전 자산 기반 위에 소규모 실험을 병행하면 효율이 올라갑니다.", guide: ["실험 자금은 고정 한도 내 운영", "고정비/변동비 월 1회 점검", "안정 자산 비중 기준치 유지"] },
      { title: "직감형 소비자", match: { impulse: 2, risk: 2 }, insight: "감정 기반 의사결정 비중이 높은 편입니다. 구매 전 대기 규칙을 붙이면 자산 유지력이 올라갑니다.", guide: ["구매 전 24시간 보류", "카테고리별 월 상한 설정", "충동 지출 트리거 메모 작성"] },
    ], ["spending-impulse", "side-hustle-fit"]),
    "past-life-mbti": makeProfileRunner("전생 테스트 MBTI", "스토리형 질문으로 전생 캐릭터 성향을 분석합니다.", [
      pq("낯선 도시에 도착하면?", { label: "바로 탐험 시작", value: 1, dimension: "action", weight: 2 }, { label: "지도/정보부터 확인", value: 0, dimension: "analysis", weight: 2 }),
      pq("팀 위기 상황에서?", { label: "앞에서 돌파", value: 1, dimension: "lead", weight: 2 }, { label: "역할 재배치", value: 0, dimension: "strategy", weight: 2 }),
      pq("휴식 방식은?", { label: "사람과 교류", value: 1, dimension: "social", weight: 1 }, { label: "혼자 정리", value: 0, dimension: "analysis", weight: 1 }),
      pq("선호 퀘스트는?", { label: "모험형", value: 1, dimension: "action", weight: 1 }, { label: "추리형", value: 0, dimension: "strategy", weight: 1 }),
      pq("갈등 해결 방식은?", { label: "즉시 대면", value: 1, dimension: "lead", weight: 1 }, { label: "근거 정리 후 대화", value: 0, dimension: "analysis", weight: 1 }),
      pq("성과 기준은?", { label: "속도와 임팩트", value: 1, dimension: "action", weight: 1 }, { label: "정확성과 안정", value: 0, dimension: "strategy", weight: 1 }),
      pq("새 규칙이 생기면?", { label: "유연하게 적용", value: 1, dimension: "social", weight: 1 }, { label: "기준부터 점검", value: 0, dimension: "analysis", weight: 1 }),
      pq("내 포지션은?", { label: "선봉대", value: 1, dimension: "lead", weight: 1 }, { label: "참모", value: 0, dimension: "strategy", weight: 1 }),
    ], [
      { title: "모험형 지휘관", match: { action: 4, lead: 3 }, insight: "빠른 결단과 추진력이 두드러집니다. 리스크 관리 파트를 보완하면 팀 성과가 더 안정됩니다.", guide: ["핵심 결정 전 리스크 1줄 점검", "의사결정 후 회고 10분", "속도/품질 담당 분리 운영"] },
      { title: "분석형 기록자", match: { analysis: 4, strategy: 3 }, insight: "정확성과 구조 설계가 강점입니다. 실행 타이밍 기준을 정하면 지연을 줄일 수 있습니다.", guide: ["정보 수집 시간 상한 설정", "결정 기준 3개만 유지", "주 1회 실행률 점검"] },
      { title: "관계형 중재자", match: { social: 3, strategy: 2 }, insight: "협업과 분위기 조율에 강합니다. 결정권자와의 합의 프레임을 고정하면 리더십이 강화됩니다.", guide: ["회의 종료 전 합의문 1줄 작성", "갈등 이슈 우선순위 표준화", "피드백 채널 1개로 통일"] },
      { title: "전략형 설계자", match: { strategy: 4, analysis: 2 }, insight: "판을 읽고 구조화하는 능력이 뛰어납니다. 실행 파트너와의 역할 분리로 속도를 확보하세요.", guide: ["전략/실행 담당 이원화", "단계별 체크포인트 정의", "리뷰 주기 고정"] },
    ], ["habit-starter", "procrastination-type"]),
    "love-chat-style": makeProfileRunner("연애 대화톤 테스트", "대화 리듬/표현 강도/갈등 처리 성향을 분석합니다.", [
      pq("답장이 늦으면?", { label: "먼저 안부를 보낸다", value: 1, dimension: "direct", weight: 2 }, { label: "상대 템포를 본다", value: 0, dimension: "pace", weight: 2 }),
      pq("갈등 상황에서?", { label: "즉시 대화한다", value: 1, dimension: "direct", weight: 1 }, { label: "시간 두고 정리한다", value: 0, dimension: "calm", weight: 1 }),
      pq("감정 표현은?", { label: "자주 공유한다", value: 1, dimension: "express", weight: 2 }, { label: "핵심만 공유한다", value: 0, dimension: "calm", weight: 1 }),
      pq("데이트 제안 방식은?", { label: "한 가지를 빠르게 확정", value: 1, dimension: "direct", weight: 1 }, { label: "여러 옵션으로 조율", value: 0, dimension: "pace", weight: 1 }),
      pq("칭찬 스타일은?", { label: "직설적으로 말한다", value: 1, dimension: "express", weight: 1 }, { label: "은근하게 표현한다", value: 0, dimension: "calm", weight: 1 }),
    ], [
      { title: "직진형 커뮤니케이터", match: { direct: 3, express: 2 }, insight: "감정/의사를 빠르게 공유하는 강점이 있습니다. 속도보다 합의 포맷을 맞추면 갈등이 줄어듭니다.", guide: ["갈등 주제는 1문장 요약 후 시작", "답장 기대 템포를 먼저 합의", "감정/요청 문장을 분리해 전달"] },
      { title: "리듬형 조율자", match: { pace: 3, calm: 2 }, insight: "관계 템포를 안정적으로 맞추는 타입입니다. 중요한 순간에는 명확한 요청 문장을 덧붙이세요.", guide: ["중요 요청은 명확히 문장화", "관찰 기간을 길게 끌지 않기", "대화 종료 전에 결론 1개 확인"] },
      { title: "균형형 대화가", match: { direct: 2, calm: 2 }, insight: "직설과 배려를 함께 쓰는 균형형입니다. 상황별 채널(문자/통화) 선택 기준을 세우면 효율이 올라갑니다.", guide: ["논쟁 주제는 통화 우선", "좋은 피드백 빈도 고정", "오해 문장은 즉시 재확인"] },
    ], ["breakup-recovery", "balance-game-love"]),
    "breakup-recovery": makeRunner("이별 회복력 테스트", "회복 루틴과 감정 처리 방식으로 회복 프로필을 제공합니다.", [q("힘들 때 먼저 찾는 건?", "친구 대화", "혼자 기록"), q("추억 정리 방식은?", "빠르게 정리", "천천히 정리"), q("일상 회복 속도는?", "빠른 편", "점진적"), q("새로운 만남은?", "열려 있음", "충분한 시간 필요"), q("감정 표현은?", "자주 표출", "내부 정리")], ["리바운드 빠른형", "딥케어 회복형"], "회복력은 속도보다 방향이 중요합니다. 감정 소모를 줄이는 루틴을 만들수록 재발 피로가 감소합니다.", ["수면/식사 루틴 먼저 복구", "관계 기록은 10분 제한", "주 1회 감정 점수 체크"], ["love-chat-style", "past-life-mbti"]),
    "habit-starter": makeProfileRunner("습관 스타터 테스트", "실행 스타일과 유지 패턴을 기반으로 시작 전략을 제안합니다.", [
      pq("아침 시작 방식은?", { label: "강하게 시작", value: 1, dimension: "sprint", weight: 2 }, { label: "작게 시작", value: 0, dimension: "consistency", weight: 2 }),
      pq("체크 방식은?", { label: "숫자/지표 기록", value: 1, dimension: "measure", weight: 1 }, { label: "기분/메모 기록", value: 0, dimension: "reflection", weight: 1 }),
      pq("동기 유지법은?", { label: "보상 기준 세팅", value: 1, dimension: "sprint", weight: 1 }, { label: "루틴 시간 고정", value: 0, dimension: "consistency", weight: 1 }),
      pq("실패했을 때?", { label: "즉시 재시작", value: 1, dimension: "restart", weight: 2 }, { label: "원인 분석 후 재개", value: 0, dimension: "reflection", weight: 2 }),
      pq("목표 기간은?", { label: "단기 스프린트", value: 1, dimension: "sprint", weight: 1 }, { label: "장기 누적", value: 0, dimension: "consistency", weight: 1 }),
    ], [
      { title: "스프린트 실행형", match: { sprint: 4, restart: 2 }, insight: "시작 에너지가 높은 실행형입니다. 번아웃 방지를 위한 회복 루틴이 핵심입니다.", guide: ["주 1회 강도 낮은 회복일 지정", "완료 기준을 숫자로 고정", "실패 시 즉시 5분 재시작"] },
      { title: "누적 루틴형", match: { consistency: 4, reflection: 2 }, insight: "지속성과 누적 관리에 강점이 있습니다. 시작 지연을 줄이는 트리거를 함께 두세요.", guide: ["시작 트리거 1개 고정", "매일 같은 시간 슬롯 확보", "주간 누적 달성률 시각화"] },
      { title: "데이터 추적형", match: { measure: 2, sprint: 2 }, insight: "수치 기반으로 동기화되는 타입입니다. 지표 수를 최소화하면 유지율이 올라갑니다.", guide: ["핵심 지표 2개만 추적", "리포트 작성 시간 10분 제한", "지표 미달 시 대체 루틴 적용"] },
    ], ["procrastination-type", "mbti-wealth-dna"]),
    "spending-impulse": makeRunner("충동구매 경보 테스트", "충동구매 트리거를 찾아 지출 제어 팁을 안내합니다.", [q("할인 알림을 보면?", "바로 확인", "필요성 점검"), q("장바구니 보관 기간은?", "짧다", "길다"), q("리뷰 읽는 시간은?", "짧다", "충분히 읽음"), q("예산표 사용 여부?", "거의 없음", "자주 사용"), q("후회 소비 빈도는?", "가끔 있다", "거의 없다")], ["즉시반응 소비형", "계획관리 소비형"], "구매 전 감정 상태를 분리하면 불필요 지출이 줄어듭니다. 가격보다 필요성 점검 순서가 효과적입니다.", ["장바구니 24시간 보류", "월간 소비 카테고리 상한 설정", "할인 알림 채널 정리"], ["mbti-wealth-dna", "monthly-money-fortune"]),
    "weekly-opportunity": makeRunner("주간 기회 운세", "이번 주 집중할 기회 포인트를 짚어보는 주간 테스트입니다.", [q("이번 주 에너지는?", "새로운 시도", "기존 루틴 강화"), q("관계에서 중요한 건?", "확장", "신뢰 유지"), q("업무 선택 기준은?", "성장 가능성", "실행 안정성"), q("시간 배분은?", "몰입 작업", "협업 소통"), q("이번 주 목표는?", "성과 도전", "리듬 회복")], ["확장 집중 주간", "안정 정비 주간"], "주간 운세형 테스트는 행동 우선순위 정리에 초점이 있습니다. 실행 가능한 1~2개 목표만 잡는 것이 효과적입니다.", ["주간 목표 2개만 고정", "관계/업무 일정 분리", "금요일 15분 회고"], ["daily-fortune", "habit-starter"]),
    "monthly-money-fortune": makeRunner("월간 재물 운세", "지출/저축/기회 흐름을 가볍게 점검하는 월간 리포트입니다.", [q("이번 달 소비 성향은?", "경험 투자", "절약 중심"), q("수입 활용 우선순위는?", "재투자", "비상금"), q("새 기회가 오면?", "즉시 검토", "조건 확인"), q("지출 점검 주기는?", "주 단위", "월 단위"), q("가장 중요한 건?", "현금흐름", "자산 비율")], ["공격적 운영형", "보수적 안정형"], "재물 흐름은 수입보다 지출 구조에서 먼저 개선됩니다. 반복 지출을 줄이면 현금흐름이 즉시 좋아집니다.", ["고정비 항목 1개 절감", "월 1회 결제내역 분류", "비상금 비율 먼저 확보"], ["spending-impulse", "side-hustle-fit"]),
    "balance-game-love": makeRunner("밸런스 게임 연애편", "연애 상황형 밸런스 문항으로 취향을 분석합니다.", [q("데이트 스타일?", "즉흥 여행", "계획 데이트"), q("연락 빈도?", "자주", "필요할 때"), q("갈등 해결?", "바로 대화", "시간 두고 대화"), q("기념일 선호?", "크게 챙김", "소소하게 챙김"), q("표현 방식?", "말로 표현", "행동으로 표현")], ["직관 몰입형", "안정 조율형"], "관계 선택은 정답보다 합의 방식이 중요합니다. 서로의 우선순위를 명확히 말할수록 만족도가 높아집니다.", ["갈등 주제는 문장 1개로 요약", "선호/비선호를 따로 기록", "선택 이유를 함께 공유"], ["love-chat-style", "breakup-recovery"]),
    "balance-game-work": makeRunner("밸런스 게임 직장편", "직장 상황형 문항으로 일의 우선순위를 확인합니다.", [q("선호하는 과제는?", "빠른 실행", "깊은 분석"), q("회의 방식은?", "짧고 자주", "길고 집중"), q("일정 운영은?", "멀티 태스킹", "싱글 태스킹"), q("피드백은?", "즉시", "정리 후"), q("성과 기준은?", "속도", "완성도")], ["스피드 실행형", "완성도 집중형"], "업무 효율은 개인 성향과 팀 규칙의 정렬에서 결정됩니다. 속도형은 검수 지점, 완성형은 마감 지점이 필요합니다.", ["업무 시작 전 완료 기준 명시", "중간 검수 타임 고정", "회의는 결론/담당/기한으로 종료"], ["procrastination-type", "habit-starter"]),
    "procrastination-type": makeRunner("미루기 유형 진단", "미루는 패턴의 원인을 찾고 개선 방향을 제시합니다.", [q("마감이 멀면?", "일단 미룸", "조금씩 시작"), q("큰 일은?", "작게 쪼갬", "한 번에 끝냄"), q("집중 방해요소는?", "알림", "생각 과부하"), q("재시작 방식은?", "타이머", "환경 정리"), q("동기 부여는?", "외부 보상", "내부 목표")], ["회피형 미루기", "과부하형 미루기"], "미루기는 게으름보다 부담 설계의 문제입니다. 태스크를 작게 나누고 시작 트리거를 고정하면 개선 속도가 빨라집니다.", ["첫 작업 단위를 10분으로", "알림 차단 시간 블록 운영", "완료 후 즉시 다음 시작점 기록"], ["habit-starter", "balance-game-work"]),
    "side-hustle-fit": makeProfileRunner("부업 적합도 테스트", "가용 시간/리스크/작업 선호도를 기반으로 부업 유형을 추천합니다.", [
      pq("가용 시간은?", { label: "짧지만 자주", value: 1, dimension: "micro", weight: 2 }, { label: "길게 몰아서", value: 0, dimension: "batch", weight: 2 }),
      pq("수익 기대는?", { label: "안정 수익", value: 0, dimension: "stable", weight: 2 }, { label: "고변동 고수익", value: 1, dimension: "growth", weight: 2 }),
      pq("업무 방식은?", { label: "혼자 완결", value: 1, dimension: "solo", weight: 1 }, { label: "협업 선호", value: 0, dimension: "team", weight: 1 }),
      pq("강점은?", { label: "실행 속도", value: 1, dimension: "growth", weight: 1 }, { label: "기획 설계", value: 0, dimension: "stable", weight: 1 }),
      pq("선호 분야는?", { label: "콘텐츠", value: 1, dimension: "solo", weight: 1 }, { label: "데이터/분석", value: 0, dimension: "stable", weight: 1 }),
    ], [
      { title: "성장형 부업러", match: { growth: 3, solo: 2 }, insight: "실행력 기반의 확장형 모델에 적합합니다. 리스크 한도만 명확하면 성과를 빠르게 낼 수 있습니다.", guide: ["월 손실 허용 범위 선설정", "주간 실험 KPI 2개 고정", "본업 시간과 충돌 금지 룰 적용"] },
      { title: "안정형 부업러", match: { stable: 3, batch: 2 }, insight: "안정적 흐름과 품질 관리에 강합니다. 꾸준한 납품형/정기형 모델이 잘 맞습니다.", guide: ["정기 반복 과업부터 시작", "주간 투입 시간 상한 설정", "분기 목표는 보수적으로 설정"] },
      { title: "하이브리드 운영형", match: { micro: 2, team: 1 }, insight: "짧은 시간 분산 운영이 가능한 타입입니다. 자동화/템플릿 기반 운영이 핵심입니다.", guide: ["업무 템플릿 3개 표준화", "마이크로 작업 단위로 분할", "협업 채널 1개로 통합"] },
    ], ["mbti-wealth-dna", "monthly-money-fortune"]),
  };

  global.SERVICE_RUNNERS = SERVICE_RUNNERS;
})(window);
