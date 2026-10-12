import type { AssessmentResult } from '../../../types';

// Moved verbatim from ResultsView.tsx sleep auto-generation effect body (no copy change).
// Returns the generated text when missing, otherwise null.
export const buildMissingSleepAnalysisText = (result: AssessmentResult): string | null => {
    if (result.sleepAnalysisText) return null;

    let analysis = `### 🌙 수면 및 학습 패턴 종합 분석\n\n`;

    if (result.studyEfficiencyResults?.chronotype) {
        const rawChrono = result.studyEfficiencyResults.chronotype;
        const chronoStr = typeof rawChrono === 'object' && rawChrono ? (rawChrono.result || '표준') : rawChrono;
        analysis += `**크로노타입 기반 조언**: ${chronoStr}형에 맞는 최적의 수면 및 기상 시간을 권장합니다.\n`;
    }

    analysis += `\n**전문가 코멘트 (${result.careType || '유형 미지정'})**\n`;
    analysis += `- 수면 패턴과 학습 집중도(집중력/스트레스)의 상관관계를 기반으로 맞춤 관리가 필요합니다.\n`;
    analysis += `- 현재 데이터에 기반하여 학생에게 가장 효율적인 수면 시간과 기상 시간을 일정표에 반영하세요.\n`;

    return analysis;
};
