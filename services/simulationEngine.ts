
import { AssessmentResult, CareType } from '../types';

export interface EfficiencySimulationResult {
    currentRatio: number;
    targetRatio: number; // usually 80%
    predictedEfficiencyGain: number; // percentage
    effectiveTimeGain: number; // hours
    adviceTitle: string;
    adviceContent: string;
    strategyCategory: 'RELAXATION' | 'ENERGY_MANAGEMENT' | 'DENSITY' | 'RECOVERY' | 'PEAK_PERFORMANCE';
    showSimulation: boolean; // true if ratio < 80%
}

export const generateStudyEfficiencyAnalysis = (result: AssessmentResult): EfficiencySimulationResult => {
    const { analytics, careType, protocol, hrv } = result;
    const currentRatio = analytics.pureStudyRatio;
    const targetRatio = 80;

    // Default values
    let predictedEfficiencyGain = 0;
    let effectiveTimeGain = 0;
    let multiplier = 1.0;
    let adviceTitle = '';
    let adviceContent = '';
    let strategyCategory: EfficiencySimulationResult['strategyCategory'] = 'PEAK_PERFORMANCE';
    const showSimulation = currentRatio < targetRatio;

    // Grouping 12 CareTypes into 5 Categories

    // 1. SNS Overload (Relaxation Paradox)
    // 과긴장 번아웃, 불안-긴장형, 스트레스 과부하
    if (
        careType === CareType.BURNOUT ||
        careType === CareType.ANXIETY_TENSION ||
        careType === CareType.STRESS_OVERLOAD
    ) {
        strategyCategory = 'RELAXATION';
        multiplier = 0.8; // Efficiency gain is lower if just pushing harder without rest

        adviceTitle = "이완 역설 (Relaxation Paradox)";
        if (showSimulation) {
            adviceContent = `현재 뇌 과열 상태로, 뇌가 정보를 튕겨내고 있습니다. 지금은 무조건 순공 시간을 늘리는 것이 아니라 '이완'이 핵심입니다. 순공 비율을 ${targetRatio}%까지 올리려면 오히려 학습 중간 10분의 '멍 때리기(DMN 활성화)'가 필수적입니다. 이를 통해 정보 처리 속도가 빨라져 학습 효율이 상승합니다.`;
        } else {
            adviceContent = "높은 순공 비율을 유지하고 있으나, 뇌 과열을 주의해야 합니다. 의도적인 휴식이 없으면 번아웃으로 급격히 효율이 떨어질 수 있습니다.";
        }
    }

    // 2. PNS Fatigue (Energy Management)
    // 무기력형, 우울-무동기형, 부신피로 증후군
    else if (
        careType === CareType.LOW_ENERGY ||
        careType === CareType.DEPRESSION_AMOTIVATION ||
        careType === CareType.ADRENAL
    ) {
        strategyCategory = 'ENERGY_MANAGEMENT';
        multiplier = 1.2; // High gain if managed correctly (Golden Time)

        adviceTitle = "골든타임 집중 전략 (Energy Focus)";
        if (showSimulation) {
            adviceContent = `에너지 총량이 부족하여 오후/저녁 공부 효율이 급격히 떨어지는 패턴입니다. 저녁 시간 3시간을 억지로 버티는 것보다, 에너지가 남아있는 오전/낮 시간의 순공 밀도를 ${targetRatio}%까지 높이는 것이 훨씬 유리합니다. '양'보다 '타이밍'이 중요한 유형입니다.`;
        } else {
            adviceContent = "현재 에너지 관리가 매우 효율적입니다. 다만 에너지가 고갈되는 오후 4시 이후에는 고난도 학습을 피하고 기계적인 학습(단어 암기 등)으로 전환하세요.";
        }
    }

    // 3. Brain & Attention (Density Compression)
    // 뇌피로 집중곤란, 과민성 학습장애, 주의력 산만형, (Legacy) Concentration Deficit
    else if (
        careType === CareType.BRAIN_FATIGUE ||
        careType === CareType.HYPERSENSITIVE ||
        careType === CareType.ATTENTION_DEFICIT ||
        careType === CareType.CONCENTRATION
    ) {
        strategyCategory = 'DENSITY';
        multiplier = 1.5; // Huge gain from fixing leaks

        adviceTitle = "밀도 압축 (Density Compression)";
        if (showSimulation) {
            adviceContent = `책상에 앉아있는 시간 중 상당 부분이 '멍하니 있는 시간'으로 소실되고 있습니다. 현재 60분 연속 학습은 효율이 떨어집니다. 이를 20분씩 3세트로 쪼개는 '뽀모도로' 방식 등을 도입하여 밀도를 ${targetRatio}%까지 올리면, 성적 상승폭이 가장 큰 유형입니다.`;
        } else {
            adviceContent = "집중력 관리에 성공했습니다. 현재의 짧고 굵게 끊어가는 전략을 유지하세요. 주변 소음이나 환경 변화에 민감하므로 환경 통제에 신경 써야 합니다.";
        }
    }

    // 4. Physical (Recovery)
    // 수면 장애형, 혈액순환 저하형
    else if (
        careType === CareType.SLEEP ||
        careType === CareType.CIRCULATION
    ) {
        strategyCategory = 'RECOVERY';
        multiplier = 1.0; // Linear gain but capped by physical state

        adviceTitle = "신체 회복 (Physical Recovery)";
        if (showSimulation) {
            adviceContent = `신체적 컨디션(수면/혈행)이 뇌 효율의 발목을 잡고 있습니다. 잠을 줄여서 순공 비율을 높이는 건 '밑 빠진 독에 물 붓기'입니다. 수면 시간 확보와 가벼운 스트레칭이 선행되어야 순공 비율 ${targetRatio}% 도달 시 온전한 학습 효과(Lock-in)를 얻을 수 있습니다.`;
        } else {
            adviceContent = "신체 컨디션 관리가 잘 되고 있어 학습 효율이 안정적입니다. 시험 기간에도 수면 시간을 줄이지 않는 것이 장기 기억 저장에 유리합니다.";
        }
    }

    // 5. Default or Healthy (Peak Performance)
    else {
        strategyCategory = 'PEAK_PERFORMANCE';
        multiplier = 1.1; // Steady gain

        if (!careType) {
            adviceTitle = "기본 분석 모드 (사전 진단 필요)";
            if (showSimulation) {
                adviceContent = `종합 심리/신체 진단(CareType) 데이터가 없어 기본 상태로 시뮬레이션됩니다. 순공 비율을 ${targetRatio}%까지 끌어올리면 성적 향상에 도움이 됩니다. 종합 진단을 진행하시면 훨씬 더 정밀한 개인 맞춤형 분석을 받아보실 수 있습니다.`;
            } else {
                adviceContent = "순공 비율이 양호합니다. 하지만 종합 심리/신체 진단(CareType) 데이터가 없어 '완벽한 최적화 상태'로 임시 간주되었습니다. 정확한 분석을 위해 종합 진단을 진행해 주세요.";
            }
        } else {
            adviceTitle = "초격차 가속 (Peak Performance)";
            if (showSimulation) {
                adviceContent = `기본 밸런스가 훌륭합니다. 현재 상태에서 순공 비율을 ${targetRatio}%까지 끌어올리면, 방해 요인이 없기에 투입한 시간만큼 정직하게 성적 향상으로 이어집니다. 경쟁자들과 격차를 벌릴 수 있는 최적의 기회입니다.`;
            } else {
                adviceContent = "완벽한 학습 최적화 상태입니다. 현재의 리듬을 유지하며 고난도 킬러 문항 정복 등 최상위권 도약을 위한 질적 학습에 집중하십시오.";
            }
        }
    }

    // Calculate potential gains if Simulation is active
    if (showSimulation) {
        const gap = targetRatio - currentRatio;
        // Base Calculation: 
        // Gap(%) * Multiplier * Scaling Factor (to make numbers realistic)
        // Assume 1 hour of 'Real Deep Work' is worth ~10 efficiency points roughly in this model context

        predictedEfficiencyGain = Math.round(gap * 0.8 * multiplier);

        // Effective Time Gain logic:
        // If you study 10 hours with 50% ratio = 5 hours effective
        // If you study 10 hours with 80% ratio = 8 hours effective
        // Gain = 3 hours.
        // However, we adjust this by multiplier to reflect "Quality" of that time.
        // Normalized to a standard 10-hour study day for easy visualization, or use actual avg focus duration?
        // Let's use a standard hypothetical 'Day' metric or just relative gain.
        // Let's assume standard Daily Study Time involves getting to that ratio.

        const standardStudyHours = 10; // Hypothethical base
        const currentEffective = standardStudyHours * (currentRatio / 100);
        const targetEffective = standardStudyHours * (targetRatio / 100);
        const rawTimeGain = targetEffective - currentEffective;

        effectiveTimeGain = parseFloat((rawTimeGain * multiplier).toFixed(1));
    }

    return {
        currentRatio,
        targetRatio,
        predictedEfficiencyGain,
        effectiveTimeGain,
        adviceTitle,
        adviceContent,
        strategyCategory,
        showSimulation
    };
};
