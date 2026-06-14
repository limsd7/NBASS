
import { AssessmentResult, CareType } from '../types';

// Helper: Generate Logic-based Consultation Letter (Feature 1)
export const generateConsultationLetter = (res: AssessmentResult) => {
    const name = res.student.name;
    const score = res.hrv.brainScore;
    const level = res.scoreLevel;

    let intro = `[NBASS] ${name} 학생 정밀 분석 결과 요약 리포트\n\n`;

    let brainStatus = `■ 두뇌 분석: 현재 학습 효율 점수는 ${score}점(${level})입니다. `;
    if (score >= 80) brainStatus += "두뇌 에너지가 매우 활발한 상태로, 고난도 과제 해결에 최적화된 골든타임 구간입니다.";
    else if (score >= 60) brainStatus += "정상 범주의 집중력을 보이나, 장시간 학습 시 짧은 휴식 루틴을 적용하면 효율이 극대화됩니다.";
    else brainStatus += "현재 두뇌 피로도가 상당히 누적되어 정보를 처리하는 속도가 떨어져 있습니다. 즉각적인 에너지 회복 솔루션이 우선입니다.";

    let stressStatus = `\n\n■ 상태 진단: 교감신경(긴장도)이 ${res.hrv.sns >= 7 ? '높게' : '적절하게'} 유지되고 있으며, `;
    stressStatus += `수면 및 일상 피로도 분석 결과 ${res.survey.isi >= 15 ? '불규칙한 회복 패턴' : '양호한 회복 상태'}를 보여주고 있습니다.`;

    if (res.survey.adrenalFatigueScore && res.survey.adrenalFatigueScore >= 26) {
        stressStatus += ` 또한 부신 피로도가 심각한 수준으로 측정되어 전문적인 영양 관리와 휴식이 필수적입니다.`;
    } else if (res.survey.adrenalFatigueScore && res.survey.adrenalFatigueScore >= 10) {
        stressStatus += ` 또한 초기 부신 피로 증상이 관찰되므로 생활 습관 교정이 필요합니다.`;
    }

    let actionPlan = `\n\n■ 핵심 처방: 현재 학생에게는 '${res.careType}' 맞춤 솔루션을 적용하였습니다. 또한 '${res.student.weakSubject}' 과목 공부 시 바이오리듬에 맞춘 스케줄링을 통해 학업 스트레스를 최소화할 것을 권장합니다.`;

    let footer = `\n\n본 분석은 뉴로바이오 학습전략시스템(NBASS)의 데이터 분석 알고리즘에 의해 자동 생성된 전문 소견입니다.`;

    return intro + brainStatus + stressStatus + actionPlan + footer;
};
