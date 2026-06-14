import { CareType, QuickAction } from '../types';

export const QUICK_ACTIONS: Record<CareType, QuickAction[]> = {
    [CareType.UNASSESSED]: [],
    [CareType.HEALTHY]: [
        {
            id: 'healthy_1',
            icon: '🧘‍♂️',
            title: '1분 박스 호흡',
            description: '현재의 최적 상태를 유지하기 위한 4-4-4-4 호흡법',
            duration: 1,
            implementation: '4초간 들이마시고, 4초 참기, 4초 내쉬고, 4초 참기를 반복하세요.',
            results: { expectedCoherenceImprovement: 5, timeToEffect: '즉시' }
        }
    ],
    [CareType.SLEEP]: [
        {
            id: 'sleep_1',
            icon: '💧',
            title: '차가운 물 세안',
            description: '미주신경 자극으로 뇌 각성도 즉시 향상',
            duration: 2,
            implementation: '찬물로 세안 후 눈 주위를 부드럽게 마사지하세요.',
            results: { expectedCoherenceImprovement: 10, timeToEffect: '즉시' }
        }
    ],
    [CareType.BURNOUT]: [
        {
            id: 'burnout_1',
            icon: '🎧',
            title: '도파민 디톡스 휴식',
            description: '모든 시각 자극 차단 및 청각에만 의존한 휴식',
            duration: 5,
            implementation: '눈을 안대로 가리고 자연음(화이트 노이즈)만 들으며 눕거나 앉아계세요.',
            results: { expectedCoherenceImprovement: 12, timeToEffect: '5분 내' }
        }
    ],
    [CareType.ADRENAL]: [
        {
            id: 'adrenal_1',
            icon: '🫁',
            title: '5분 숨 조절 운동 (4-7-8)',
            description: '부교감신경을 즉각적으로 활성화하여 아드레날린 스파이크 진정',
            duration: 5,
            implementation: '4초간 들이마시고, 7초간 숨을 참은 뒤, 8초간 길게 내쉽니다. 4사이클 반복하세요.',
            results: { expectedCoherenceImprovement: 15, timeToEffect: '즉시' }
        }
    ],
    [CareType.CIRCULATION]: [
        {
            id: 'circ_1',
            icon: '🚶‍♂️',
            title: '제자리 걷기 (가벼운 펌핑)',
            description: '하체 혈류량을 늘려 뇌로 가는 혈류 순환 촉진',
            duration: 3,
            implementation: '제자리에서 가볍게 발뒤꿈치를 들었다 놨다 하는 동작을 30회 반복합니다.',
            results: { expectedCoherenceImprovement: 10, timeToEffect: '즉시' }
        }
    ],
    [CareType.ANXIETY_TENSION]: [
        {
            id: 'anx_1',
            icon: '🫁',
            title: '5분 숨 조절 운동',
            description: '4-7-8 호흡법으로 즉시 불안 완화',
            duration: 5,
            implementation: '4초 들이마심 -> 7초 멈춤 -> 8초 내쉬기를 반복하여 심박을 낮춥니다.',
            results: { expectedCoherenceImprovement: 15, timeToEffect: '즉시' }
        }
    ],
    [CareType.STRESS_OVERLOAD]: [
        {
            id: 'stress_1',
            icon: '🌿',
            title: '아로마 호흡',
            description: '스트레스 즉각 완화',
            duration: 2,
            implementation: '깊은 호흡을 통해 스트레스를 이완합니다.',
            results: { expectedCoherenceImprovement: 10, timeToEffect: '즉시' }
        }
    ],
    [CareType.LOW_ENERGY]: [
        {
            id: 'lowen_1',
            icon: '☀️',
            title: '햇빛 노출 스트레칭',
            description: '에너지 부스팅',
            duration: 3,
            implementation: '창가나 야외에서 밝은 빛을 보며 기지개를 켭니다.',
            results: { expectedCoherenceImprovement: 15, timeToEffect: '5분 내' }
        }
    ],
    [CareType.DEPRESSION_AMOTIVATION]: [
        {
            id: 'dep_1',
            icon: '💃',
            title: '빠른 템포 바디 셰이킹',
            description: '신체 진동을 통한 교감신경 및 에너지 각성',
            duration: 2,
            implementation: '자리에서 일어나 전신(팔, 다리, 몸통)을 가볍고 빠르게 털어냅니다.',
            results: { expectedCoherenceImprovement: 10, timeToEffect: '즉시' }
        }
    ],
    [CareType.BRAIN_FATIGUE]: [
        {
            id: 'fatigue_1',
            icon: '👀',
            title: '명암 대비 시각 자극',
            description: '신선한 시각 자극으로 뇌 각성 및 피로 리프레시',
            duration: 3,
            implementation: '매우 어두운 곳을 30초 응시한 뒤, 창밖이나 밝은 풍경을 30초 번갈아 봅니다.',
            results: { expectedCoherenceImprovement: 12, timeToEffect: '3분 내' }
        }
    ],
    [CareType.HYPERSENSITIVE]: [
        {
            id: 'hyper_1',
            icon: '🎧',
            title: '백색 소음 명상',
            description: '외부 자극 차단',
            duration: 5,
            implementation: '조용한 곳에서 백색 소음을 들으며 휴식합니다.',
            results: { expectedCoherenceImprovement: 8, timeToEffect: '즉시' }
        }
    ],
    [CareType.ATTENTION_DEFICIT]: [
        {
            id: 'focus_1',
            icon: '🎯',
            title: '단일 초점 응시 훈련',
            description: '시각적 집중을 통한 뇌파(M-Beta) 정렬',
            duration: 2,
            implementation: '벽면의 점이나 작은 물체 하나를 정해두고 깜빡임을 최소화하며 2분간 응시하세요.',
            results: { expectedCoherenceImprovement: 20, timeToEffect: '즉시' }
        }
    ]
};
