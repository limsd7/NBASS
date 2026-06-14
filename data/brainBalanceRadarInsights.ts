/**
 * Brain Balance Radar 설명자료
 * 뇌파 항목별 특성 및 CareType별 맞춤형 공부법 전략
 * 
 * HRV 모드 및 의학적 모드에서 적용 (Portable 모드는 EEG 미사용으로 제외)
 * 모든 12가지 CareType과 매칭
 */

import { CareType } from '../types';

// ========== 뇌파 항목별 특성 ==========
export interface EEGCharacteristic {
    name: string;           // 뇌파 이름
    nameKr: string;         // 한글명
    frequency: string;      // 주파수 범위
    studyState: string;     // 학습 시 상태
    analysis: string;       // 분석 및 의미
    color: string;          // 차트 색상
}

export const EEG_CHARACTERISTICS: Record<string, EEGCharacteristic> = {
    gamma: {
        name: 'Gamma',
        nameKr: '인지',
        frequency: '30Hz 이상',
        studyState: '초고도 집중, 통합적 사고',
        analysis: '복잡한 정보를 결합하거나 고난도 문제를 풀 때 활성화됩니다. 서로 다른 영역의 정보를 하나로 통합하거나, 찰나의 영감이 필요한 고차원적 인지 기능이 활발할 때 나타납니다.',
        color: '#8b5cf6'
    },
    hBeta: {
        name: 'H-Beta',
        nameKr: '긴장',
        frequency: '20~30Hz',
        studyState: '과각성, 불안, 스트레스',
        analysis: '마감 임박이나 시험 직전의 긴박한 상태입니다. 수치가 너무 높으면 실수가 잦아지고, 불안으로 인해 작업 기억 용량이 감소합니다.',
        color: '#ef4444'
    },
    mBeta: {
        name: 'M-Beta',
        nameKr: '몰입',
        frequency: '15~20Hz',
        studyState: '능동적 집중, 논리적 사고',
        analysis: '수학 풀이, 독해 등 본격적인 학습에 가장 이상적인 집중 상태입니다. 고도의 집중력을 발휘하여 외부의 방해를 무시하고 눈앞의 과제에 깊이 침잠할 수 있는 상태입니다.',
        color: '#3b82f6'
    },
    lBeta: {
        name: 'L-Beta',
        nameKr: '주의',
        frequency: '12~15Hz',
        studyState: '외적 주의집중, 준비 상태',
        analysis: '인강 시청이나 단순 암기 등 외부 정보를 받아들일 준비가 된 상태입니다. 눈과 귀가 열려 있어 데이터 입력(Input)에 유리합니다.',
        color: '#06b6d4'
    },
    alpha: {
        name: 'Alpha',
        nameKr: '이완',
        frequency: '8~12Hz',
        studyState: '안정, 창의적 영감',
        analysis: '긴장이 풀린 상태로, 암기한 내용을 명상하듯 떠올리거나 아이디어를 낼 때 좋습니다. 의식과 무의식의 다리 역할을 하며, 정보가 해마(기억 저장소)로 이동하기 가장 좋은 환경을 만듭니다.',
        color: '#22c55e'
    },
    theta: {
        name: 'Theta',
        nameKr: '졸음',
        frequency: '4~8Hz',
        studyState: '멍함, 얕은 잠, 무의식',
        analysis: '집중력이 고갈된 상태입니다. 이때 공부를 지속하면 효율이 매우 낮습니다. 뇌가 정보를 처리할 데이터 대역폭을 닫았다는 신호입니다.',
        color: '#f59e0b'
    }
};

// ========== 뇌파 우세 유형별 공부법 ==========
export type DominantEEGType = 'M_BETA_GAMMA' | 'L_BETA_H_BETA' | 'ALPHA' | 'THETA';

export interface EEGStudyStrategy {
    type: DominantEEGType;
    title: string;
    titleKr: string;
    scientificMeaning: string;
    recommendedMode: string;
    subjectStrategies: {
        math: string;
        korean: string;
        science: string;
    };
    additionalStrategies: string[];
    summary: string[];
}

export const EEG_STUDY_STRATEGIES: Record<DominantEEGType, EEGStudyStrategy> = {
    M_BETA_GAMMA: {
        type: 'M_BETA_GAMMA',
        title: 'Deep Work Mode',
        titleKr: 'M-Beta & Gamma 우세형: 딥 워크 모드',
        scientificMeaning: `M-Beta(15~20Hz, 몰입)와 Gamma(30Hz 이상, 인지)가 동시에 높다는 것은 뇌가 **'최고 성능 모드'**에 진입했음을 의미합니다. 논리적 사고와 문제 해결을 담당하는 뇌파와 고차원적 인지 기능이 동시에 활발해, 복잡한 논리 구조를 가진 최고 난도 문항을 정복하기에 가장 완벽한 타이밍입니다.`,
        recommendedMode: '딥 워크 (Deep Work)',
        subjectStrategies: {
            math: `**수학: 킬러 문항 및 고난도 추론**
• 문제 풀이 과정을 '생각의 흐름' 단위로 쪼개어 기록하세요
• 한 문제에 최소 20~30분 이상 투자하며 '사고의 임계점' 돌파 훈련
• 답지를 보기 전까지 본인의 모든 논리를 쏟아붓기`,
            korean: `**국어: 초고난도 비문학(독서) 지문**
• 지문의 구조도(Structure Map)를 그리며 읽으세요
• Gamma파의 통합 능력을 활용하여 문단 간 유기적 연결 고리 찾기
• 법학, 경제, 과학 기술 등 정보 밀도가 높은 지문의 인과관계 도해화`,
            science: `**과학탐구: 자료 해석 및 고난도 추론**
• 데이터(도표, 그래프)의 숨겨진 함정을 찾아내고 여러 가설 검증
• '유전', '화학 반응식', '역학적 에너지' 등 복잡한 계산과 추론 집중 공략`
        },
        additionalStrategies: [
            '**외부 자극의 완전 차단**: 백색 소음이나 노이즈 캔슬링 이어폰 사용, 스마트폰 시야에서 제거',
            '**싱글 태스킹**: 한 주제에만 최소 90분 정도 깊게 빠져드는 울트라디안 리듬 적용',
            '**진입 의식(Ritual)**: 딥 워크 시작 전 항상 같은 차나 음악으로 뇌를 트리거',
            '**메타인지 피드백**: 공부 후 문제 해결 과정을 거꾸로 되짚는 복기 수행'
        ],
        summary: ['어려운 문제 정면 돌파', '한 주제에 90분 이상 몰입', '외부 자극 완전 차단']
    },
    L_BETA_H_BETA: {
        type: 'L_BETA_H_BETA',
        title: 'Strategic Retrieval Mode',
        titleKr: 'L-Beta & H-Beta 우세형: 전략적 인출 모드',
        scientificMeaning: `L-Beta(주의)와 H-Beta(긴장)가 우세한 상태는 뇌가 외부 자극에 매우 민감하게 반응하고, 다소 날카롭게 깨어 있는 상태입니다. 에너지는 넘치는데 한곳에 고이지 못하고 흩어지는 상태이므로, 정적인 독해보다는 빠르고 리드미컬한 과제를 수행하여 긴장감을 '성취감'으로 치환해야 합니다.`,
        recommendedMode: '전략적 인출 (Strategic Retrieval)',
        subjectStrategies: {
            math: `**수학: 빠른 연산 및 유형 연습**
• 타이머를 활용한 스프린트 문제 풀이
• 계산 실수 방지를 위한 물리적 기록 강제`,
            korean: `**국어: 문법 및 빠른 독해**
• 문법 문제는 이론보다 '오답 지우기'에 집중
• 날카로운 신경으로 문장의 틀린 부분 검열`,
            science: `**사회/역사: 백지 복습 및 마인드맵 인출**
• 교과서 덮고 핵심 키워드 5개 종이에 적기
• 화살표로 관계 그리며 뇌에 쌓인 고압 전기 방전`
        },
        additionalStrategies: [
            '**뽀모도로 변형 (25-5-25)**: 25분 타이머를 시각적으로 설정, 보상 체계 활용',
            '**신체적 브레이크**: 휴식 5분 동안 무조건 자리에서 일어나기',
            '**쓰기의 도구화**: 이면지에 낙서하듯 빠르게 키워드 적어 내려가기',
            '**스피드 퀴즈 방식**: 단어 하나당 1초 내로 뜻 인출, 모르면 바로 넘기기'
        ],
        summary: ['손을 움직이며 빠른 암기', '25분 집중-5분 휴식 사이클', '능동적 출력(Output) 활동']
    },
    ALPHA: {
        type: 'ALPHA',
        title: 'Review & Creative Mode',
        titleKr: 'Alpha 우세형: 복습 및 창의 모드',
        scientificMeaning: `Alpha(이완) 뇌파가 우세한 상태는 뇌가 아주 편안하면서도 집중의 문이 활짝 열려 있는 **'가장 효율적인 학습 대기 상태'**입니다. 자율신경균형도가 이상적일 때 나타나기 쉽고, 지식을 억지로 밀어넣기보다 이미 배운 내용을 연결하고 장기 기억으로 전환하는 활동이 극대화됩니다.`,
        recommendedMode: '복습 및 창의 (Review & Creative)',
        subjectStrategies: {
            math: `**수학: 개념 연결 및 복습**
• 서로 다른 단원 간 공통점 찾아 연결하기
• 큰 흐름 잡으며 공식의 의미 이해`,
            korean: `**문학: 장면의 내면화**
• 시의 운율을 느끼거나 소설 속 인물의 심리에 공감
• 지문을 읽으며 '영화 한 장면'을 감독하듯 상상`,
            science: `**암기 과목: 백지 복습 및 마인드맵**
• 핵심 키워드를 종이 중앙에 적고 연관 내용 사방으로 뻗어 나가며 적기
• 기억 안 나는 부분은 비워두고 나중에 확인 (강한 각인 효과)`
        },
        additionalStrategies: [
            '**멘탈 리허설**: 눈 감고 오늘 배운 내용을 머릿속으로 빠르게 훑어보기',
            '**낮은 볼륨의 클래식/자연음**: BPM 60~70 음악으로 Alpha파 유지',
            '**호흡법**: 들숨보다 날숨을 길게 (부교감 활성화)',
            '**색깔 펜 활용**: 시각적 자극으로 정보를 더 오래 기억'
        ],
        summary: ['전체 흐름 파악 및 이미지 복습', '창의적 연결과 통합', '이완된 집중 상태 유지']
    },
    THETA: {
        type: 'THETA',
        title: 'Activation & Recovery Mode',
        titleKr: 'Theta 우세형: 각성 또는 회복 모드',
        scientificMeaning: `Theta(졸음) 뇌파가 우세한 상태는 뇌가 극도로 지쳐 있거나 각성도가 낮아 무의식과 수면의 경계에 머물러 있는 상태입니다. 뇌가 정보를 처리할 데이터 대역폭을 닫은 신호이며, 이 상태에서 고난도 문제를 풀면 기억 저장 효율이 0에 수렴합니다.`,
        recommendedMode: '강제 각성 또는 회복 (Activation/Recovery)',
        subjectStrategies: {
            math: `**수학: 단순 연산 또는 휴식**
• 고난도 문제 대신 기본 연산으로 뇌 예열
• 또는 15분 파워냅 후 재시도`,
            korean: `**국어: 낮은 인지 부하 작업**
• 단순 필사 및 정리, 오답 정리
• 눈을 감고 듣기 학습으로 뇌 재활성화`,
            science: `**과학: 영상 학습**
• 인강을 소리만 들으며 뇌가 다시 정보 처리하도록 유도
• 이해 위주의 가벼운 복습`
        },
        additionalStrategies: [
            '**신체적 충격 요법**: 서서 공부하기, 찬물 세수, 껌 씹기(저작 운동)',
            '**파워 냅 15분**: 20분 이상 넘기지 말 것, 카페인 냅 활용',
            '**빛 자극**: 태양광이나 밝은 LED 스탠드 아래로 이동',
            '**타임 어택**: 딱 10분만이라는 극단적으로 짧은 목표 설정'
        ],
        summary: ['스트레칭, 낮잠, 단순 정리', '신체 각성 후 학습', '무리하지 않고 전략적 후퇴']
    }
};

// ========== CareType별 Brain Balance Radar 해석 ==========
export interface BrainBalanceInsight {
    dominantType: DominantEEGType;      // 해당 CareType에서 주로 나타나는 뇌파 패턴
    interpretation: string;              // CareType과 뇌파의 연관성 해석
    studyRecommendation: string;        // 맞춤형 공부법 추천
    warningPatterns: string[];          // 주의해야 할 뇌파 패턴
    optimizationTips: string[];         // 뇌파 최적화 팁
}

export const BRAIN_BALANCE_INSIGHTS: Record<CareType, BrainBalanceInsight> = {
    [CareType.BURNOUT]: {
        dominantType: 'THETA',
        interpretation: `번아웃 상태에서는 Theta파가 증가하고 M-Beta파가 불안정합니다. 뇌가 에너지 고갈로 '셧다운 모드'에 진입하여 집중이 어렵고, H-Beta파가 간헐적으로 높아져 불안과 피로가 공존합니다.`,
        studyRecommendation: `**딥 워크보다 회복 우선**: 현재 상태에서 억지로 집중하면 뇌에 더 큰 부담을 줍니다. 파워냅 15분 후 Alpha파 상태에서 가벼운 복습만 진행하세요. 새로운 내용 학습은 회복 후로 미루세요.`,
        warningPatterns: ['H-Beta 급상승 (불안 동반)', 'Theta 지속적 우세 (집중 불가)'],
        optimizationTips: ['4-7-8 호흡으로 Alpha파 유도', '학습 시간 50% 축소', '15분 파워냅 적극 활용']
    },
    [CareType.ADRENAL]: {
        dominantType: 'THETA',
        interpretation: `부신피로 상태에서는 코르티솔 리듬 교란으로 아침에 Theta파가 높고, 오후에 불규칙한 Beta파 변동이 나타납니다. 에너지 리듬이 불안정하여 학습 효율의 편차가 큽니다.`,
        studyRecommendation: `**에너지 있을 때만 집중**: 뇌파가 M-Beta나 Gamma로 전환되는 순간(보통 오전 10-12시, 오후 5-7시)에만 핵심 학습을 배치하세요. 그 외 시간은 복습과 휴식에 할애하세요.`,
        warningPatterns: ['아침 Theta 지속 (기상 후 2시간)', '오후 불규칙한 H-Beta 급등'],
        optimizationTips: ['햇빛 노출로 각성 유도', '혈당 안정화 식사', '에너지 리듬에 맞춘 유연한 스케줄']
    },
    [CareType.STRESS_OVERLOAD]: {
        dominantType: 'L_BETA_H_BETA',
        interpretation: `스트레스 과부하 상태에서는 H-Beta파가 과도하게 높아 과각성 상태가 됩니다. 집중은 되지만 불안과 함께하여 실수가 잦고, M-Beta파가 불안정하여 깊은 몰입이 어렵습니다.`,
        studyRecommendation: `**전략적 인출로 에너지 배출**: 고조된 긴장감을 '빠른 암기'와 '문제 풀이'로 전환하세요. 정적인 독해보다 손을 움직이는 능동적 학습이 효과적입니다. 25분 뽀모도로로 시간을 구조화하세요.`,
        warningPatterns: ['H-Beta 지속적 과활성 (30% 이상)', 'Alpha파 현저히 부족'],
        optimizationTips: ['4-7-8 호흡으로 H-Beta 낮추기', '백색소음으로 외부 자극 차단', '카페인 제한']
    },
    [CareType.SLEEP]: {
        dominantType: 'THETA',
        interpretation: `수면 부족 상태에서는 낮 시간에도 Theta파가 지속적으로 높게 나타납니다. REM 수면 부족으로 기억 고정이 방해받으며, Beta파가 약해 각성 수준이 낮습니다.`,
        studyRecommendation: `**각성 유도 학습**: 서서 공부하거나 걸으며 학습하세요. 능동적 학습(문제 풀기, 소리내어 읽기)이 졸음 방지에 효과적입니다. 파워냅 15-20분이 2시간 멍하게 앉아있는 것보다 효율적입니다.`,
        warningPatterns: ['낮 시간 Theta 우세', 'Beta파 전반적 약화'],
        optimizationTips: ['찬물 자극으로 교감신경 활성화', '밝은 조명에서 학습', '카페인 냅 활용']
    },
    [CareType.ANXIETY_TENSION]: {
        dominantType: 'L_BETA_H_BETA',
        interpretation: `불안-긴장 상태에서는 H-Beta파가 과도하게 높아 과각성 상태입니다. 편도체 과활성으로 작은 자극도 위협으로 해석하며, Alpha파가 부족하여 이완된 집중이 어렵습니다.`,
        studyRecommendation: `**자신감 회복 우선**: 모르는 문제부터 풀면 불안이 급증합니다. 자신 있는 부분부터 시작하여 Alpha파를 높이세요. 4-7-8 호흡으로 H-Beta를 낮추고 시작하세요.`,
        warningPatterns: ['H-Beta 30% 이상 지속', 'Alpha파 현저히 낮음'],
        optimizationTips: ['그라운딩 기법 활용', '걱정 시간 10분 제한', '익숙한 환경에서 학습']
    },
    [CareType.LOW_ENERGY]: {
        dominantType: 'THETA',
        interpretation: `저에너지 상태에서는 Theta파가 높고 Beta파가 전반적으로 약합니다. 뇌의 보상 시스템이 둔해져 성취감이 느껴지지 않으며, 각성 수준이 낮아 집중 유지가 어렵습니다.`,
        studyRecommendation: `**작은 시작, 큰 인정**: 10분만 해보기로 시작 부담을 낮추세요. 단순한 워밍업 과제(단어 암기, 오답 정리)로 Beta파를 높인 후 본 학습에 진입하세요.`,
        warningPatterns: ['Theta 지속적 우세', 'Gamma/M-Beta 거의 없음'],
        optimizationTips: ['시원한 물로 각성 유도', '서서 공부하기', '빠른 템포 음악으로 기분 전환']
    },
    [CareType.DEPRESSION_AMOTIVATION]: {
        dominantType: 'THETA',
        interpretation: `우울-무동기 상태에서는 전반적 뇌파 활성이 저하되며, 좌측 전두엽 Alpha파 비대칭이 나타날 수 있습니다. 동기 시스템 약화로 학습 시작 자체가 어렵습니다.`,
        studyRecommendation: `**함께하는 학습**: 혼자 공부보다 스터디 그룹이나 카페에서 사람들 사이에서 공부하세요. 외부 동기를 활용하고, 오늘 딱 하나만 완료해도 스스로 크게 인정하세요.`,
        warningPatterns: ['전반적 뇌파 활성 저하', '좌측 전두엽 Alpha 비대칭'],
        optimizationTips: ['햇빛 노출', '규칙적 운동', '사회적 연결', '작은 성공 경험 쌓기']
    },
    [CareType.BRAIN_FATIGUE]: {
        dominantType: 'THETA',
        interpretation: `뇌피로 상태에서는 Theta파가 높고 M-Beta파가 불안정합니다. 디지털 기기 과다 사용으로 시각 피질이 과부하되어 정보 처리 속도가 느려집니다.`,
        studyRecommendation: `**디지털 디톡스**: 화면 없는 종이 교재 활용, 휴식 시간에 절대 스마트폰 보지 않기. 오전 시간대가 Golden Time이므로 핵심 학습은 오전에 배치하세요.`,
        warningPatterns: ['Theta 지속 증가', 'Alpha파 불안정'],
        optimizationTips: ['20-20-20 법칙 (20분마다 20초 먼 곳 응시)', '종이 교재 활용', '자연 속 휴식']
    },
    [CareType.HYPERSENSITIVE]: {
        dominantType: 'L_BETA_H_BETA',
        interpretation: `과민성 상태에서는 H-Beta파가 높고 외부 자극에 민감하게 반응합니다. 작은 소음에도 집중이 깨지며, Alpha파 유지가 어려워 안정된 학습이 힘듭니다.`,
        studyRecommendation: `**환경 통제가 최우선**: 소음 차단 이어폰 필수, 백색 소음으로 불규칙 소음 차단. 같은 장소에서 90% 이상 공부하여 환경 일관성을 유지하세요.`,
        warningPatterns: ['외부 자극 시 H-Beta 급등', 'Alpha파 유지 실패'],
        optimizationTips: ['노이즈 캔슬링 이어폰', '자연음/백색소음 활용', '환경 변화 최소화']
    },
    [CareType.ATTENTION_DEFICIT]: {
        dominantType: 'THETA',
        interpretation: `주의력 산만형에서는 Theta파가 높고 L-Beta파가 불안정합니다. 주의 지속 시간이 짧아 25분 집중도 어려울 수 있으며, 외부 자극에 쉽게 분산됩니다.`,
        studyRecommendation: `**짧은 사이클, 능동적 학습**: 15분 집중-5분 휴식으로 시작하세요. 손을 움직이며 공부(쓰기, 그리기)하고, 외부 구조화 도구(타이머, 체크리스트)를 활용하세요.`,
        warningPatterns: ['Theta 높음', 'L-Beta/M-Beta 불안정'],
        optimizationTips: ['15분 단위 학습', '손 움직이는 능동적 활동', '타이머 필수 사용']
    },
    [CareType.CONCENTRATION]: {
        dominantType: 'L_BETA_H_BETA',
        interpretation: `집중력 저하형에서는 M-Beta파가 약하고 L-Beta와 H-Beta 사이를 오갑니다. 집중이 시작되어도 유지가 어렵고, 잡념에 쉽게 휩쓸립니다.`,
        studyRecommendation: `**환경 최적화부터**: 스마트폰을 다른 방에 두는 것만으로 20% 향상됩니다. 수면, 영양, 운동 중 가장 문제되는 영역부터 우선 개선하세요.`,
        warningPatterns: ['M-Beta 유지 실패', '잦은 뇌파 패턴 변동'],
        optimizationTips: ['스마트폰 격리', '규칙적 수면', '25분 뽀모도로 기법']
    },
    [CareType.CIRCULATION]: {
        dominantType: 'THETA',
        interpretation: `순환 저하형에서는 장시간 앉은 뒤 Theta파가 증가합니다. 뇌혈류 감소로 산소 공급이 줄어들어 전반적인 뇌파 활성이 저하됩니다.`,
        studyRecommendation: `**50분 룰**: 50분 이상 연속 앉아있지 말 것. 휴식 시간에 반드시 일어나서 스트레칭하고, 가능하면 서서 공부하거나 걸으며 암기하세요.`,
        warningPatterns: ['장시간 좌식 후 Theta 급증', '전반적 뇌파 활성 저하'],
        optimizationTips: ['50분마다 기립 스트레칭', '서서 공부하기', '물 자주 마시기']
    },
    [CareType.HEALTHY]: {
        dominantType: 'M_BETA_GAMMA',
        interpretation: `건강 균형형에서는 M-Beta와 Alpha가 적절히 균형을 이루고, 필요시 Gamma까지 올라갑니다. 학습 상황에 맞게 뇌파를 자연스럽게 전환할 수 있는 이상적인 상태입니다.`,
        studyRecommendation: `**현재 상태 유지**: 딥 워크 시 M-Beta/Gamma 활용, 복습 시 Alpha 모드 활용으로 상황에 맞는 학습을 진행하세요. 과신하여 무리하지 말고 지속가능성에 집중하세요.`,
        warningPatterns: ['과도한 학습 시 H-Beta 상승 주의'],
        optimizationTips: ['상황별 뇌파 전환 활용', '규칙적 생활 유지', '간격 반복으로 더 높은 도약']
    },
    [CareType.UNASSESSED]: {
        dominantType: 'ALPHA',
        interpretation: `데이터가 불완전하여 정확한 뇌파 패턴 분석이 어렵습니다. 완전한 검사 완료 시 정밀한 맞춤형 분석이 가능합니다.`,
        studyRecommendation: `**일반적 권장사항**: 25분 집중-5분 휴식의 뽀모도로 기법이 효과적입니다. 피곤할 때는 무리하지 말고, 에너지가 있을 때 핵심 학습을 배치하세요.`,
        warningPatterns: ['추가 검사 필요'],
        optimizationTips: ['규칙적 수면', '25분 뽀모도로 기법', '능동적 학습 전략']
    }
};

// ========== 우세 뇌파 판별 함수 ==========
export const determineDominantEEGType = (
    gamma: number, hBeta: number, mBeta: number, lBeta: number, alpha: number, theta: number
): DominantEEGType => {
    // M-Beta와 Gamma가 동시에 높으면 딥워크 모드
    if (mBeta >= 25 && gamma >= 20) return 'M_BETA_GAMMA';

    // L-Beta와 H-Beta가 높으면 전략적 인출 모드
    if (lBeta >= 25 && hBeta >= 20) return 'L_BETA_H_BETA';

    // Alpha가 가장 높으면 복습/창의 모드
    if (alpha >= 30 && alpha > theta && alpha > hBeta) return 'ALPHA';

    // Theta가 높거나 전반적으로 저에너지면 각성/회복 모드
    if (theta >= 25 || (gamma < 10 && mBeta < 15)) return 'THETA';

    // 기본값: Alpha 모드
    return 'ALPHA';
};

// ========== Brain Balance Radar 가이드 생성 함수 ==========
export const getBrainBalanceGuide = (
    careType: CareType,
    eegData: { gamma: number; hBeta: number; mBeta: number; lBeta: number; alpha: number; theta: number }
): string => {
    const insight = BRAIN_BALANCE_INSIGHTS[careType];
    const currentType = determineDominantEEGType(
        eegData.gamma, eegData.hBeta, eegData.mBeta, eegData.lBeta, eegData.alpha, eegData.theta
    );
    const strategy = EEG_STUDY_STRATEGIES[currentType];

    return `## 🧠 Brain Balance Radar 분석

### 현재 뇌파 패턴
${insight.interpretation}

### 추천 학습 모드: ${strategy.titleKr}
${insight.studyRecommendation}

### ${strategy.recommendedMode} 상세 전략
${strategy.subjectStrategies.math}

${strategy.subjectStrategies.korean}

${strategy.subjectStrategies.science}

### 추가 최적화 전략
${strategy.additionalStrategies.map(s => `• ${s}`).join('\n')}

### 주의해야 할 패턴
${insight.warningPatterns.map(p => `⚠️ ${p}`).join('\n')}

### 뇌파 최적화 팁
${insight.optimizationTips.map(t => `💡 ${t}`).join('\n')}

---
**요약**: ${strategy.summary.join(' | ')}`;
};
