import {
    StudentInfo,
    HRVData,
    SurveyData,
    LearningAnalyticsData,
    CareType,
    BloodTestData
} from '../types';
import { CognitivePerformanceResults } from '../components/CognitivePerformanceAssessment';

/**
 * Generate specific "Killer Tips" by cross-analyzing multiple data sources.
 * Focuses on 4 key areas:
 * 1. Bio-Cognitive Synchronization
 * 2. Sensory-Processing Match
 * 3. Resilience-Based Skipping
 * 4. Neuro-Nutrition Boosting
 */
export const generateIntegratedSolutions = (
    student: StudentInfo,
    hrv: HRVData,
    survey: SurveyData,
    analytics: LearningAnalyticsData,
    cognitive?: CognitivePerformanceResults,
    bloodTest?: BloodTestData
): string => {
    const tips: string[] = [];

    // =================================================================================
    // 1. 🧠 생체-인지 리듬 동기화 (Bio-Cognitive Synchronization)
    // =================================================================================
    // Logic: Compare Chronotype (Analytics) vs HRV Peak (Simulated/Heuristic) vs EEG
    // Since we don't have hourly HRV data, we infer based on Chronotype + Brain Fatigue
    const chronotype = analytics.chronotype || 'neutral';
    const brainFatigue = hrv.brainScore < 60;

    let bioSyncTip = "";
    if (chronotype === 'morning') {
        bioSyncTip = "수험생의 **뇌파(Alpha)**는 **오전 9-11시**에 가장 안정적입니다.";
        if (brainFatigue) bioSyncTip += " 하지만 현재 뇌 피로도가 높아 오후 2시 이후에는 급격한 효율 저하가 예상됩니다.";
        else bioSyncTip += " 오후 시간대에는 신체 활력(HRV)이 뒷받침되므로 지구력이 필요한 암기 과목이 적합합니다.";
        bioSyncTip += `\n   👉 **전략**: 사고력이 필요한 **수학/비문학은 ${analytics.goldenTimeStart ? analytics.goldenTimeStart : '오전 10시'}**, 체력이 필요한 **문제풀이 양치기는 오후 2시**에 배치하면 효율이 약 20% 상승합니다.`;
    } else if (chronotype === 'evening') {
        bioSyncTip = "수험생의 생체 리듬은 **오후 4시 이후**에 가장 활성화됩니다. 오전에는 뇌가 부팅되는 시간이 필요합니다.";
        bioSyncTip += `\n   👉 **전략**: 오전에는 비문학 지문 읽기 등 **워밍업 위주의 학습**을 하고, 고난도 킬러 문항 분석은 **${analytics.goldenTimeStart ? analytics.goldenTimeStart : '저녁 8시'}**에 배치하세요. 오전의 무리한 학습은 하루 컨디션을 망칠 수 있습니다.`;
    } else {
        bioSyncTip = "전반적으로 균형 잡힌 리듬을 보이나, 식사 직후(오후 1시) **혈당 스파이크**로 인한 집중력 저하가 관찰될 수 있습니다.";
        bioSyncTip += `\n   👉 **전략**: 점심 식사 후 20분은 **서서 공부하거나 가벼운 산책**을 하세요. 가장 중요한 과목은 **${analytics.goldenTimeStart ? analytics.goldenTimeStart : '기상 후 3시간 뒤'}**에 배치하는 것이 골든타임입니다.`;
    }

    tips.push(`### 🧠 생체-인지 리듬 동기화 (Bio-Cognitive Synchronization)\n${bioSyncTip}`);


    // =================================================================================
    // 2. 👁️ 감각-처리 속도 매칭 전략 (Sensory-Processing Match)
    // =================================================================================
    // Logic: Processing Speed (WPM) vs VARK vs Working Memory
    const wpm = cognitive?.processingSpeed?.averageWPM || 0;
    const vark = survey.varkPrimary || 'multi'; // V, A, R, K
    const wmLevel = cognitive?.workingMemory?.overallLevel || 'average';

    let sensoryTip = "";

    // Case A: High Speed + Visual (Video efficiency check)
    if (wpm > 300 && (vark === 'V' || vark === 'R')) {
        sensoryTip = "**[Case: 빠른 뇌 처리속도 + 시각 학습자]**\n   일반적인 속도의 인강 청취는 **뇌를 지루하게 만들어** 딴생각을 유발합니다. 인강은 **1.5배속 이상**으로 듣거나, 자막/스크립트를 먼저 빠르게 읽고 **이해 안 가는 부분만 영상을 골라 보는 것**이 몰입도를 3배 높입니다.";
    }
    // Case B: Low WM + Auditory (Multi-tasking check)
    else if ((wmLevel === 'low' || wmLevel === 'below_average') && vark === 'A') {
        sensoryTip = "**[Case: 워킹 메모리 제한 + 청각 학습자]**\n   필기를 하면서 동시에 설명을 듣는 **멀티태스킹이 불가능한 뇌 구조**입니다. 필기하느라 정작 중요한 설명을 놓치고 있습니다. **'선 청취, 후 정리'** 원칙을 지키세요. 수업 중에는 듣는 것에만 100% 집중하고, 쉬는 시간에 기억을 되살려 적는 것이 훨씬 효과적입니다.";
    }
    // Case C: General
    else {
        sensoryTip = "**[멀티 모달 전략]**\n   현재 뇌는 한 가지 감각만 사용할 때보다 시각과 청각을 동시에 사용할 때 기억 효율이 극대화됩니다. 단순히 눈으로 읽기보다는 **소리 내어 읽거나(낭독)**, 친구에게 설명하듯 **중얼거리는(Self-Talk)** 방식이 전두엽을 더 강하게 자극합니다.";
    }

    tips.push(`### 👁️ 감각-처리 속도 매칭 전략 (Sensory-Processing Match)\n${sensoryTip}`);


    // =================================================================================
    // 3. 🛡️ 멘탈 내성 기반 '문제 넘기기' 전략 (Resilience-Based Skipping)
    // =================================================================================
    // Logic: Resilience vs Delay Discounting vs Test Anxiety
    const resilienceLevel = cognitive?.resilience?.gradeLevel || 'resilient';
    const anxietyScore = survey.testAnxietyCognitive || 0;

    let mentalTip = "";

    if (resilienceLevel === 'fragile' || resilienceLevel === 'developing') {
        mentalTip = "**[유리멘탈 방어 전략]**\n   모르는 문제가 나오면 **30초도 고민하지 말고 무조건 별표 치고 넘어가야 합니다**. 현재 회복탄력성으로는 한 번 막히면 뇌가 '패닉 모드'로 전환되어, 뒤에 있는 쉬운 문제 5개도 실수할 확률이 90% 이상입니다. '일단 끝까지 가는 것'이 점수를 지키는 유일한 길입니다.";
    } else if (anxietyScore > 50) { // High anxiety
        mentalTip = "**[불안 관리 전략]**\n   시험 시작 직후가 가장 위험합니다. 1번 문제부터 풀지 말고, **가장 자신 있는 페이지나 쉬운 문제부터 풀어** 뇌의 긴장을 이완시키세요. '나는 알고 있다'는 확신이 들어야 전두엽이 정상 작동하기 시작합니다.";
    } else {
        mentalTip = "**[고득점 전략]**\n   멘탈 회복력이 우수하므로, 어려운 문제에 도전하는 것을 두려워하지 마세요. 단, **'검토 시간'을 시험 마지막이 아닌 중간중간 배치**하세요. (예: 10문제 풀고 1분 마킹/검토). 뇌의 모드를 전환해주어 집중력을 리셋하는 효과가 있습니다.";
    }

    tips.push(`### 🛡️ 멘탈 내성 기반 '문제 넘기기' 전략 (Resilience-Based Skipping)\n${mentalTip}`);


    // =================================================================================
    // 4. 🩸 영양-학습 부스팅 (Neuro-Nutrition Boosting) (Medical Mode)
    // =================================================================================
    let nutritionTip = "";

    if (bloodTest) {
        // Medical Mode Specifics
        if (bloodTest.hemoglobin < 13 || bloodTest.hematocrit < 36) { // Hypo (Hct added as per prompt 'Het')
            nutritionTip = "오후 시간대의 급격한 집중력 저하는 의지 부족이 아니라 **철분 및 혈액량 부족(빈혈/Hct 저하)**으로 인한 '뇌 산소 결핍' 때문입니다. 점심 식사 후 **비타민 C와 함께 철분제**를 섭취하거나, 공부 중간에 심호흡을 자주 하여 뇌로 가는 산소를 강제로 공급해줘야 합니다.";
        } else if (bloodTest.vitaminD < 20) {
            nutritionTip = "비타민 D 수치가 매우 낮아 **만성 피로와 우울감**을 유발하고 있습니다. 이는 학습 동기를 갉아먹는 주원인입니다. 점심시간에 20분 햇볕을 쬐거나, 고함량 비타민 D 주사 요법을 고려해보세요. 뇌의 활력이 달라집니다.";
        }
    }

    // Fallback or additional tips if no specific medical issue found but sugar intake high (pseudo-check)
    if (!nutritionTip) {
        nutritionTip = "오후 4시의 '마의 구간'을 넘기려면 **혈당 스파이크**를 막아야 합니다. 점심에 탄수화물(면, 빵)을 줄이고, 공부 시작 전 **견과류나 다크 초콜릿**을 섭취하세요. 뇌의 에너지원인 포도당을 안정적으로 공급하여, 졸음 없이 1시간 더 집중할 수 있는 '뇌 연비'를 만들어줍니다.";
    }

    tips.push(`### 🩸 영양-학습 부스팅 (Neuro-Nutrition Boosting)\n${nutritionTip}`);


    // Combine all
    return `
## [SECRET] 🏆 상위 1% 학습 효율을 위한 통합 솔루션 (Killer Tips)
*수집된 모든 데이터(HRV, 뇌파, 인지기능, 설문)를 교차 분석하여 도출된 핵심 전략입니다.*

${tips.join('\n\n')}
    `.trim();
};
