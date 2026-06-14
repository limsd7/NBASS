export interface StrategyOption {
    id: string;
    category: string;
    title: string;
    content: string;
}

export const MATH_OPTIONS: StrategyOption[] = [
    // 1. 심리적 접근
    {
        id: 'math_psy_1',
        category: '1. 수학 공부에 대한 심리적 접근 (Math-Anxiety Relief)',
        title: "'30분 버리기' 전략",
        content: "수학 문제를 풀기 전, 빈 종이에 현재 느끼는 불안감을 그대로 적으세요. '오늘 미적분 안 풀리면 어쩌지?', '기하 개념이 하나도 기억 안 나' 등. 이렇게 적어내는 것만으로도 뇌의 작업 기억 공간이 확보되어 수학적 사고가 가능해집니다."
    },
    {
        id: 'math_psy_2',
        category: '1. 수학 공부에 대한 심리적 접근 (Math-Anxiety Relief)',
        title: "난이도의 강제 하향",
        content: "불안이 심할 때는 킬러 문항을 쳐다보지도 마세요. **'눈으로 보고 3초 안에 풀이법이 떠오르는 문제'**들만 20분 정도 푸세요. 뇌에 '수학은 내가 조절할 수 있는 영역이다'라는 신호를 보내야 합니다."
    },
    {
        id: 'math_psy_3',
        category: '1. 수학 공부에 대한 심리적 접근 (Math-Anxiety Relief)',
        title: "결과가 아닌 '과정'에 보상",
        content: "문제를 맞히는 것이 아니라, '오늘 수학 책상에 앉아 25분간 펜을 움직였다'는 행위 자체에 스스로 높은 점수를 주세요."
    },

    // 2. 신체적 불안 증상 조절
    {
        id: 'math_phy_1',
        category: '2. 신체적 불안 증상 즉각 조절 (Physical Stabilization)',
        title: "미궁 신경(Vagus Nerve) 자극",
        content: "불안이 올라오면 차가운 물로 세수를 하거나, 차가운 물병을 목 뒤나 손목에 대세요. 낮은 온도는 항진된 교감신경을 즉각적으로 낮추는 효과가 있습니다."
    },
    {
        id: 'math_phy_2',
        category: '2. 신체적 불안 증상 즉각 조절 (Physical Stabilization)',
        title: "근육 점진적 이완법",
        content: "수학 문제 풀기 직전, 온몸(어깨, 팔, 다리)에 5초간 꽉 힘을 주었다가 한 번에 '후' 하고 힘을 뺍니다. 몸의 긴장이 풀리면 뇌는 '지금 안전하다'고 착각하게 됩니다."
    },
    {
        id: 'math_phy_3',
        category: '2. 신체적 불안 증상 즉각 조절 (Physical Stabilization)',
        title: "허밍(Humming) 호흡",
        content: "코로 숨을 들이마시고 내뱉을 때 '음~' 하는 소리를 작게 내보세요. 이 진동이 부교감 신경을 자극해 심박수를 안정시킵니다."
    },

    // 3. 공부 루틴 수정
    {
        id: 'math_routine_1',
        category: '3. 수학 공부 루틴 수정 (Study Routine)',
        title: "백지 복습 대신 '색깔 펜 복습'",
        content: "아무것도 없는 상태에서 문제를 풀려 하지 마세요. 해설지를 옆에 두고 **'아이디어의 흐름'**을 색깔 펜으로 표시하며 따라가는 공부부터 시작하세요. (입력 위주의 공부)"
    },
    {
        id: 'math_routine_2',
        category: '3. 수학 공부 루틴 수정 (Study Routine)',
        title: "수학 공부 시간 분산",
        content: "수학을 3~4시간 통으로 잡지 마세요. 불안도가 높을 때는 아침 40분, 오후 40분, 저녁 40분 식으로 잘게 쪼개어 공부하는 것이 심리적 저항감을 줄여줍니다."
    },
    {
        id: 'math_routine_3',
        category: '3. 수학 공부 루틴 수정 (Study Routine)',
        title: "'손맛' 유지하기",
        content: "정 풀기 싫은 날은 아주 단순한 계산 문제(로그 계산, 미분법 공식 적용 등)만 10문제 풀고 수학 공부를 마무리하세요. 감을 잃지 않았다는 사실만으로도 다음 날의 불안이 줄어듭니다."
    }
];

export const KOREAN_OPTIONS: StrategyOption[] = [
    // 1. Nutrition Guide
    {
        id: 'kor_nut_1',
        category: '1. Nutrition Guide: 독해 집중력 유지 및 신경 안정',
        title: "블루베리 및 견과류 (항산화)",
        content: "뇌의 염증을 줄이고 인지 기능을 돕습니다. 국어 공부 전 가벼운 블루베리 섭취는 집중력 유지에 도움을 줍니다."
    },
    {
        id: 'kor_nut_2',
        category: '1. Nutrition Guide: 독해 집중력 유지 및 신경 안정',
        title: "비타민 B12 (신경 보호)",
        content: "신경전달물질 생산을 도와 글을 읽을 때 문장 간의 관계를 파악하는 논리력을 서포트합니다."
    },
    {
        id: 'kor_nut_3',
        category: '1. Nutrition Guide: 독해 집중력 유지 및 신경 안정',
        title: "수분 공급 (Brain Hydration)",
        content: "뇌의 75%는 물입니다. 탈수 상태에서는 독해 속도가 현저히 떨어집니다. 국어 공부 중에는 미지근한 물을 조금씩 자주 마셔 뇌의 회전력을 유지하세요."
    },

    // 2. Study Strategy
    {
        id: 'kor_stu_1',
        category: "2. Study Strategy: '튕겨 나가는 글' 붙잡는 전략",
        title: "'첫 문장 소리 내어 읽기' (Vocalizing)",
        content: "지문이 눈에 들어오지 않을 때는 첫 세 문장 정도만 아주 작게 속삭이듯 소리 내어 읽어보세요. 시각 자극에 청각 자극을 더하면 뇌가 독해 모드로 강제 전환됩니다."
    },
    {
        id: 'kor_stu_2',
        category: "2. Study Strategy: '튕겨 나가는 글' 붙잡는 전략",
        title: "시각화(Visualization) 독해",
        content: "긴 지문을 다 이해하려 하지 말고, 문단별 핵심 단어에 동그라미를 치거나 구조를 그리며 읽으세요. 손을 움직이는 행위는 불안한 뇌를 '현실'에 고정해줍니다."
    },
    {
        id: 'kor_stu_3',
        category: "2. Study Strategy: '튕겨 나가는 글' 붙잡는 전략",
        title: "기출보다는 '좋은 글' 읽기",
        content: "불안이 극심할 때는 어려운 사설 말고 이미 구조를 아는 기출이나 EBS 수특/수완을 가볍게 읽으며 '읽기 감각'만 유지하세요. '나는 글을 읽을 수 있다'는 확신이 우선입니다."
    },

    // 3. Exercise Guide
    {
        id: 'kor_exe_1',
        category: '3. Exercise Guide: 시야 확보 및 상체 이완',
        title: "안구 운동 (Eye Tracking)",
        content: "공부 시작 전, 시선을 멀리/가까이, 크게 원을 그리며 돌려주세요. 안구 긴장을 푸는 것만으로도 독해 부담이 줄어듭니다."
    },
    {
        id: 'kor_exe_2',
        category: '3. Exercise Guide: 시야 확보 및 상체 이완',
        title: "승모근 및 가슴 펴기",
        content: "거북목과 말린 어깨는 뇌 산소 공급을 방해합니다. **'가슴 펴기 스트레칭'**을 통해 호흡을 깊게 하세요. 답답함 완화에 즉효입니다."
    },
    {
        id: 'kor_exe_3',
        category: '3. Exercise Guide: 시야 확보 및 상체 이완',
        title: "적정 조도 유지",
        content: "너무 밝은 조명은 불안한 뇌를 자극합니다. 눈이 편안한 약간 노란빛의 간접 조명을 활용하면 심리적 안정감을 얻을 수 있습니다."
    },

    // 4. Pre-Study Routine
    {
        id: 'kor_pre_1',
        category: '4. Pre-Study Routine: 1교시 트라우마 극복 루틴',
        title: "'3분 브레인 덤프' (국어판)",
        content: "공부 시작 전, 불안 요소를 종이에 딱 세 줄만 적으세요 ('지문이 안 읽히면?'). 적고 나면 그것은 '현실'이 아니라 '종이 위의 글자'가 됩니다."
    },
    {
        id: 'kor_pre_2',
        category: '4. Pre-Study Routine: 1교시 트라우마 극복 루틴',
        title: "긍정적 앵커링 (Positive Anchoring)",
        content: "'이 글의 핵심만 찾으면 된다', '모든 문장을 이해할 필요 없다'고 되뇌세요. 완벽주의를 버리는 것이 핵심입니다."
    },
    {
        id: 'kor_pre_3',
        category: '4. Pre-Study Routine: 1교시 트라우마 극복 루틴',
        title: "호흡과 일체화",
        content: "지문을 읽기 전 깊은 호흡을 3번 하세요. 내뱉을 때 어깨 힘을 빼고, 그 이완된 상태를 유지한 채 첫 줄로 들어갑니다."
    }
];

export const ENGLISH_OPTIONS: StrategyOption[] = [
    // 1. Nutrition Guide
    {
        id: 'eng_nut_1',
        category: '1. Nutrition Guide: 신경 전달 및 집중력 강화',
        title: "다크 초콜릿 (소량)",
        content: "카카오의 플라보노이드 성분은 뇌 혈류를 개선합니다. 영어 지문 읽기 전 한 조각은 긴장 완화와 집중력에 도움이 됩니다."
    },
    {
        id: 'eng_nut_2',
        category: '1. Nutrition Guide: 신경 전달 및 집중력 강화',
        title: "오메가-3 (DHA/EPA)",
        content: "뇌세포 막을 유연하게 하여 정보 처리 속도를 높입니다. 꾸준히 섭취하면 '글자가 튕겨 나가는 현상'을 줄이는 데 도움이 됩니다."
    },
    {
        id: 'eng_nut_3',
        category: '1. Nutrition Guide: 신경 전달 및 집중력 강화',
        title: "허브티 (페퍼민트)",
        content: "페퍼민트 향은 인지적 기민함을 높여줍니다. 공부 중 머리가 멍해질 때 커피 대신 마시면 카페인 없이도 뇌를 깨울 수 있습니다."
    },

    // 2. Study Strategy
    {
        id: 'eng_stu_1',
        category: "2. Study Strategy: '청크(Chunk)' 단위의 가벼운 접근",
        title: "구문 끊어읽기 (Chunking) 집중",
        content: "문장 전체 번역 대신 '누가/무엇을/했다' 단위로 툭툭 끊어 읽으세요. 뇌의 연산 부하를 절반으로 줄여줍니다."
    },
    {
        id: 'eng_stu_2',
        category: "2. Study Strategy: '청크(Chunk)' 단위의 가벼운 접근",
        title: "'듣기'부터 시작하는 워밍업",
        content: "독해가 부담스러울 땐 듣기 파일을 먼저 들으세요. 뇌의 언어 영역이 활성화되어 독해 거부감이 훨씬 줄어듭니다."
    },
    {
        id: 'eng_stu_3',
        category: "2. Study Strategy: '청크(Chunk)' 단위의 가벼운 접근",
        title: "단어 암기 방식의 변화",
        content: "새로운 단어 100개 대신 **'아는 단어 20개의 예문 읽기'**로 목표를 바꾸세요. 익숙한 것을 확인하며 성취감을 쌓는 것이 불안 치료에 효과적입니다."
    },

    // 3. Exercise Guide
    {
        id: 'eng_exe_1',
        category: '3. Exercise Guide: 시각적 피로 및 목 근육 이완',
        title: "20-20-20 룰",
        content: "20분간 지문을 읽었다면, 20초 동안, 20피트(약 6미터) 밖을 보세요. 생소한 외국어에 고정된 눈 근육을 풀면 뇌의 긴장도 풀립니다."
    },
    {
        id: 'eng_exe_2',
        category: '3. Exercise Guide: 시각적 피로 및 목 근육 이완',
        title: "흉쇄유돌근(목 옆) 마사지",
        content: "긴장하면 목 옆이 굳어 두통이 옵니다. 공부 중간중간 고개를 돌려 목 근육을 부드럽게 주물러주세요."
    },
    {
        id: 'eng_exe_3',
        category: '3. Exercise Guide: 시각적 피로 및 목 근육 이완',
        title: "가벼운 제자리걸음",
        content: "단어를 외울 때 서서 읽거나 가볍게 걸으세요. 움직임은 불안 호르몬(코르티솔)을 분산시키는 데 효과적입니다."
    },

    // 4. Pre-Study Routine
    {
        id: 'eng_pre_1',
        category: '4. Pre-Study Routine: 외국어 거부감 완화 루틴',
        title: "5분 영어 자유 글쓰기 (Brain Dump)",
        content: "공부 전, 문법 상관없이 아무 말이나 영어로 적어보세요(Example: I am tired). 언어 회로를 예열하는 효과가 있습니다."
    },
    {
        id: 'eng_pre_2',
        category: '4. Pre-Study Routine: 외국어 거부감 완화 루틴',
        title: "'완벽 해석 포기' 선언",
        content: "'모르는 단어는 문맥으로 대충 파악하겠다'고 다짐하세요. 영어 불안의 핵심인 '완벽주의'를 내려놓으면 가슴 두근거림이 줄어듭니다."
    },
    {
        id: 'eng_pre_3',
        category: '4. Pre-Study Routine: 외국어 거부감 완화 루틴',
        title: "심장 박동 인지 호흡",
        content: "손을 가슴에 대고 심장 박동을 느끼며 깊게 호흡하세요. 박동이 느려지는 것을 확인한 후 첫 문장을 읽기 시작합니다."
    }
];

export const SUBJECT_OPTIONS_MAP = {
    math: MATH_OPTIONS,
    korean: KOREAN_OPTIONS,
    english: ENGLISH_OPTIONS
};
