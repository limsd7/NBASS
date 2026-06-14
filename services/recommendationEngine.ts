import { BrainBodyState, CareType, PersonalizedRecommendation, HRVData, SurveyData } from '../types';

export const generateMultiLayerRecommendation = (
    careType: CareType,
    brainBodyState: BrainBodyState,
    hrv: HRVData,
    survey: SurveyData
): PersonalizedRecommendation => {
    
    const layer1: string[] = [];
    const layer2: string[] = [];
    const layer3: string[] = [];
    const consensus: string[] = [];
    
    let priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    
    const details = {
        nutrition: [] as string[],
        supplement: [] as string[],
        exercise: '',
        timing: '',
        avoidance: [] as string[]
    };

    // 1. Survey Analysis (Layer 1)
    if (survey.bai && survey.bai > 15) {
        layer1.push('심한 불안 호소');
        details.avoidance.push('고카페인 음료');
    }
    if (survey.isi && survey.isi > 14) {
        layer1.push('수면 장애 호소');
    }
    if (survey.fatigueSymptomsCount && survey.fatigueSymptomsCount > 3) {
        layer1.push('만성 피로감');
    }

    // 2. HRV Analysis (Layer 2)
    if (brainBodyState.ansBalance === 'SNS_DOMINANT') {
        layer2.push('교감신경(SNS) 과활성');
        details.supplement.push('Magnesium');
        details.exercise = '요가, 걷기, 스트레칭 (고강도 무산소 운동 금지)';
    } else if (brainBodyState.ansBalance === 'PNS_DOMINANT') {
        layer2.push('부교감신경(PNS) 우세 (무기력)');
        details.exercise = '가벼운 조깅, 활동적인 동적 운동';
    }

    // 3. EEG Analysis (Layer 3)
    if (brainBodyState.pattern === 'HIGH_BETA_PATTERN') {
        layer3.push('High-Beta 과도 (뇌 과각성)');
        details.supplement.push('GABA', 'L-Theanine');
        details.avoidance.push('스마트폰 블루라이트', '격렬한 경쟁 게임');
    } else if (brainBodyState.pattern === 'HIGH_THETA_PATTERN') {
        layer3.push('Theta 과도 (뇌 피로/졸음)');
        details.nutrition.push('복합 탄수화물', '단백질 위주 식사');
    }

    // 4. Consensus & Priority
    if (layer1.includes('심한 불안 호소') && layer2.includes('교감신경(SNS) 과활성') && layer3.includes('High-Beta 과도 (뇌 과각성)')) {
        consensus.push('3계층 모두 [극도의 불안/긴장] 상태를 지시함');
        priority = 'URGENT';
        details.timing = '저녁 7-9시 (부교감 활성 시간에 이완 훈련 집중)';
        details.avoidance.push('모든 형태의 과도한 자극 (청각, 시각)');
    } 
    else if (layer1.includes('수면 장애 호소') && layer3.includes('High-Beta 과도 (뇌 과각성)')) {
        consensus.push('수면 부족과 뇌 과각성 동반 (수면 방해 사이클)');
        priority = 'HIGH';
        details.timing = '취침 2시간 전 모든 디지털 기기 차단';
    }
    else if (brainBodyState.coherence >= 80) {
        // High coherence generally implies strong consensus on whatever the careType is
        consensus.push(`설문과 생체 데이터가 [${careType}] 진단에 80% 이상 강하게 일치함`);
        priority = careType === CareType.HEALTHY ? 'LOW' : 'HIGH';
        if (!details.timing) details.timing = '일과 중 1-2회 규칙적인 루틴 적용';
    } else {
        priority = 'MEDIUM';
        if (!details.timing) details.timing = '증상 발현 시 즉시 대처';
    }

    // Fallbacks if empty
    if (details.nutrition.length === 0) details.nutrition.push('균형 잡힌 일반식');
    if (details.supplement.length === 0) details.supplement.push('종합 비타민');
    if (!details.exercise) details.exercise = '가벼운 유산소 운동 (주 3회)';

    return {
        layer1_survey: layer1.length ? layer1 : ['특이사항 없음'],
        layer2_hrv: layer2.length ? layer2 : ['정상 자율신경'],
        layer3_eeg: layer3.length ? layer3 : ['정상 뇌파'],
        consensus: consensus.length ? consensus : ['각 지표가 복합적인 상태를 나타냄 (부분 일치)'],
        priority,
        details
    };
};
