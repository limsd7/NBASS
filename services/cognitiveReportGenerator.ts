import { CareType } from '../types';
import { CognitivePerformanceResults } from '../components/CognitivePerformanceAssessment';
import { INTEGRATED_COGNITIVE_DIAGNOSIS, IntegratedCognitiveDiagnosisContent } from '../data/integratedCognitiveDiagnosis';
import { WORKING_MEMORY_DESCRIPTIONS } from '../data/workingMemoryAssessments';
import { RESILIENCE_DESCRIPTIONS } from '../data/resilienceAssessments';

/**
 * Generate a dynamic, personalized cognitive diagnosis based on actual test results.
 * Falls back to the generic CareType-based content if results are missing.
 * 
 * STRICT RULE: Content must be as detailed and rich as the static definition.
 * Do not simplify or shorten the text.
 */
export const generateCognitiveDiagnosis = (
    careType: CareType,
    results?: CognitivePerformanceResults
): IntegratedCognitiveDiagnosisContent => {
    // 1. Fallback if no results (or Unassessed/Healthy as base)
    const staticContent = INTEGRATED_COGNITIVE_DIAGNOSIS[careType] || INTEGRATED_COGNITIVE_DIAGNOSIS[CareType.HEALTHY];

    if (!results || !results.workingMemory) {
        return staticContent;
    }

    const { workingMemory, resilience, processingSpeed } = results;
    const wmLevel = workingMemory.overallLevel;
    const wmDesc = WORKING_MEMORY_DESCRIPTIONS[wmLevel];

    // 2. Efficiency Improvement (Study Method based on WM Capacity & Processing Speed)
    // Combine the specific advice from WM descriptions with the general tone of the CareType
    let dynamicEfficiency = `현재 워킹 메모리(Working Memory) 용량은 **'${wmDesc.label}'** 수준입니다. ${wmDesc.description}\n\n`;

    // Add Processing Speed Context if available
    if (processingSpeed) {
        if (processingSpeed.averageWPM > 500) {
            dynamicEfficiency += `특히 정보 처리 속도가 매우 빨라(WPM ${processingSpeed.averageWPM}) 습득력이 우수하나, '속독'으로 인한 정확도 저하를 주의해야 합니다. `;
        } else if (processingSpeed.averageWPM < 300) {
            dynamicEfficiency += `정보 처리 속도가 다소 느려(WPM ${processingSpeed.averageWPM}) 학습 시간이 더 필요할 수 있습니다. 정확도 위주의 학습 전략이 필수적입니다. `;
        }
    }

    // Add specific study advice from WM data
    dynamicEfficiency += `\n**[맞춤형 효율 전략]**\n`;
    dynamicEfficiency += wmDesc.studyAdvice.map(advice => `- ${advice}`).join('\n');

    // Merge with some of the static wisdom (to keep the "richness")
    // We only take the generic advice part if it's not contradictory
    if (staticContent.efficiencyImprovement.length > 50) {
        dynamicEfficiency += `\n\n**[전문가 제언]**\n${staticContent.efficiencyImprovement.split('. ').slice(0, 2).join('. ')}.`; // Take first 2 sentences of static advice
    }


    // 3. Weakness Analysis (Deep Dive into deficits)
    let dynamicWeakness = "";

    // a) Resilience Analysis (Mental Strength)
    if (resilience) {
        const resilienceDesc = RESILIENCE_DESCRIPTIONS[resilience.gradeLevel];
        dynamicWeakness += `**멘탈 회복력(Resilience): ${resilienceDesc.label}**\n${resilienceDesc.description} `;
        if (resilience.gradeLevel === 'fragile' || resilience.gradeLevel === 'developing') {
            dynamicWeakness += `어려운 문제에 직면했을 때 포기가 빠르거나, 실수 후 집중력이 저하되는 경향이 데이터로 관찰되었습니다.\n`;
        } else {
            dynamicWeakness += `실패나 오답에도 흔들리지 않고 다시 도전하는 강인한 멘탈을 보유하고 있습니다.\n`;
        }
    }

    // b) Attention / WM Analysis
    dynamicWeakness += `\n**인지적 병목 현상(Cognitive Bottleneck)**\n`;
    dynamicWeakness += `${wmDesc.challenges.join(', ')} 등의 어려움이 발생할 수 있습니다. `;

    // Add N-Back specific detail if score is low
    if (workingMemory.nBack1 && workingMemory.nBack1.accuracy < 60) {
        dynamicWeakness += `특히 N-Back 테스트 결과, 지속적인 주의 집중과 정보 갱신(Updating) 능력에서 뚜렷한 저하가 보입니다. 이는 공부 중 딴생각으로 빠지기 쉽다는 신호입니다.`;
    } else if (workingMemory.digitSpan && workingMemory.digitSpan.totalSpan < 9) {
        dynamicWeakness += `숫자 따라하기(Digit Span) 결과, 청각적 정보 유지 능력이 약하여 수업 내용을 듣고 바로 기억하는 데 어려움이 있습니다.`;
    } else {
        dynamicWeakness += `전반적인 인지 기능의 균형은 양호하나, 장시간 고강도 학습 시의 피로 관리가 관건입니다.`;
    }


    // 4. Expected Improvement Rate
    // Calculate based on the gap between current score and "Perfect" (100)
    // If score is low, potential improvement is high.
    // Base formula: (100 - IntegratedScore) * 0.5 + CareType Bonus
    const currentScore = workingMemory.overallScore;
    let potentialGain = Math.round((100 - currentScore) * 0.4);
    if (potentialGain < 10) potentialGain = 10; // Min guarantee
    if (potentialGain > 60) potentialGain = 60; // Max realistic cap


    // 5. Training (Prescription)
    // Select the best exercise based on the weakest point
    let dynamicTraining = "";

    // a) Mental Training (from Resilience)
    if (resilience && (resilience.gradeLevel === 'fragile' || resilience.gradeLevel === 'developing')) {
        const mentalTip = RESILIENCE_DESCRIPTIONS[resilience.gradeLevel].mentalTraining[0];
        dynamicTraining += `**🧠 멘탈 강화 훈련 (우선순위)**\n- ${mentalTip}\n- ${RESILIENCE_DESCRIPTIONS[resilience.gradeLevel].warning}\n\n`;
    }

    // b) Cognitive Training (from WM)
    dynamicTraining += `**🧩 인지 기능 최적화 훈련**\n`;
    if (workingMemory.overallLevel === 'low' || workingMemory.overallLevel === 'below_average') {
        dynamicTraining += `- **기초 용량 확장**: '숫자 거꾸로 말하기' 연습을 매일 5분간 수행하세요. 전두엽의 혈류량을 직접적으로 늘려줍니다.\n`;
        dynamicTraining += `- **주의력 강화**: ${staticContent.workingMemoryTraining.split('\n')[0]}`; // Reuse context-specific training from static
    } else {
        dynamicTraining += `- **Dual N-Back 챌린지**: 컴퓨터 화면의 위치와 소리를 동시에 기억하는 고난도 훈련으로 전두엽 효율을 극대화하세요.\n`;
        dynamicTraining += `- **메타인지 강화**: 공부 후 백지에 마인드맵 그리기 (인출 연습)를 반드시 수행하세요.`;
    }

    return {
        efficiencyImprovement: dynamicEfficiency,
        weaknessAnalysis: dynamicWeakness,
        expectedImprovementRate: potentialGain,
        workingMemoryTraining: dynamicTraining
    };
};
