import { CareType, EEGPatternType } from '../types';

export interface EEGStrategy {
    pattern: EEGPatternType;
    characteristics: string;
    careTypes: CareType[];
    immediateActions: string[];
    workingMemoryTraining: string;
}

export const EEG_BASED_STRATEGIES: Record<EEGPatternType, EEGStrategy> = {
    'HIGH_BETA_PATTERN': {
        pattern: 'HIGH_BETA_PATTERN',
        characteristics: '인지적 과부하, 과각성, 뇌 스트레스 심각',
        careTypes: [CareType.ANXIETY_TENSION, CareType.STRESS_OVERLOAD],
        immediateActions: [
            '4-7-8 호흡법 실시 (교감신경 이완)',
            '뇌파 정상화 음악 (40Hz Binaural Beats) 청취',
            '학습 중단 및 뇌 휴식 시간 강제 설정'
        ],
        workingMemoryTraining: '이완 중심 훈련 (긴장도 하강 유도)'
    },
    'HIGH_THETA_PATTERN': {
        pattern: 'HIGH_THETA_PATTERN',
        characteristics: '뇌 피로 상태, 수면 부족, 주의력 결핍',
        careTypes: [CareType.SLEEP, CareType.BRAIN_FATIGUE, CareType.ATTENTION_DEFICIT],
        immediateActions: [
            '서 있는 자세로 변화 (스탠딩 책상 활용)',
            '밝은 조명 아래 10분 이상 노출',
            '찬물로 세안 또는 가벼운 스트레칭'
        ],
        workingMemoryTraining: '각성 중심 훈련 (주의력 끌어올리기)'
    },
    'BALANCED_ALPHA': {
        pattern: 'BALANCED_ALPHA',
        characteristics: '최적 학습 상태, 안정, 창의적 영감',
        careTypes: [CareType.HEALTHY],
        immediateActions: [
            '현재 상태 유지 (Deep Work 돌입)',
            '고난도 수학 및 논리 문제 집중',
            '장기 기억을 위한 암기 수행'
        ],
        workingMemoryTraining: '고난도 작업기억 훈련 도전'
    },
    'MIXED_PATTERN': {
        pattern: 'MIXED_PATTERN',
        characteristics: '복합적 상태 (긴장과 이완 혼재)',
        careTypes: [],
        immediateActions: [
            '가벼운 명상으로 뇌파 정돈',
            '쉬운 난이도의 워밍업 과제 시작'
        ],
        workingMemoryTraining: '균형 맞춤형 기본 훈련'
    },
    'UNKNOWN': {
        pattern: 'UNKNOWN',
        characteristics: '데이터 불충분',
        careTypes: [],
        immediateActions: [],
        workingMemoryTraining: '표준 훈련'
    }
};
