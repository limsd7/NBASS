import { SurveyData } from '../types';
import {
    ChronotypeResult,
    VARKResult,
    TAIResult,
    DigitalAddictionResult,
    MetacognitionResult
} from '../data/studyEfficiencyAssessments';

/**
 * 공부 효율성 정밀 검사 결과 통합 인터페이스
 * (components/StudyEfficiencyAssessment.tsx에 정의된 것과 동일한 구조)
 */
export interface StudyEfficiencyResults {
    chronotype?: { score: number; result: ChronotypeResult };
    vark?: VARKResult;
    testAnxiety?: TAIResult;
    digitalAddiction?: DigitalAddictionResult;
    metacognition?: MetacognitionResult;
    completedAt: string;
}

/**
 * StudyEfficiencyResults 객체를 SurveyData(DB 저장용 플랫 구조)로 변환
 */
export const mapResultsToSurveyData = (results: Partial<StudyEfficiencyResults>): Partial<SurveyData> => {
    const data: Partial<SurveyData> = {};

    if (results.chronotype) {
        data.chronotypeScore = results.chronotype.score;
        data.chronotypeResult = results.chronotype.result;
    }

    if (results.vark) {
        data.varkPrimary = results.vark.primary;
        data.varkScores = {
            V: results.vark.V,
            A: results.vark.A,
            R: results.vark.R,
            K: results.vark.K
        };
    }

    if (results.testAnxiety) {
        data.testAnxietyCognitive = results.testAnxiety.cognitiveScore;
        data.testAnxietySomatic = results.testAnxiety.somaticScore;
        data.testAnxietyType = results.testAnxiety.dominantType;
    }

    if (results.digitalAddiction) {
        data.digitalAddictionScore = results.digitalAddiction.totalScore;
        data.digitalAddictionLevel = results.digitalAddiction.level;
    }

    if (results.metacognition) {
        data.metacognitionLevel = results.metacognition.learnerLevel;
        data.metacognitionScores = {
            rehearsal: results.metacognition.rehearsalScore,
            elaboration: results.metacognition.elaborationScore,
            organization: results.metacognition.organizationScore,
            metacognitive: results.metacognition.metacognitiveScore
        };
    }

    return data;
};

/**
 * SurveyData(DB 로드 데이터)를 StudyEfficiencyResults 객체로 복원
 */
export const mapSurveyDataToResults = (survey: SurveyData, date: string): Partial<StudyEfficiencyResults> => {
    const results: Partial<StudyEfficiencyResults> = {
        completedAt: date
    };

    // 1. Chronotype 복원
    if (survey.chronotypeScore !== undefined && survey.chronotypeResult) {
        results.chronotype = {
            score: survey.chronotypeScore,
            result: survey.chronotypeResult as ChronotypeResult
        };
    }

    // 2. VARK 복원
    if (survey.varkPrimary && survey.varkScores) {
        results.vark = {
            ...survey.varkScores,
            primary: survey.varkPrimary as any, // Type assertion needed purely for flexible enum matching
            secondary: undefined // DB에는 secondary 저장이 없으므로 undefined (필요시 계산 로직 추가 가능하지만 단순 복원)
        };
    }

    // 3. Test Anxiety 복원
    if (survey.testAnxietyCognitive !== undefined && survey.testAnxietySomatic !== undefined) {
        const total = survey.testAnxietyCognitive + survey.testAnxietySomatic;
        let severity: 'low' | 'moderate' | 'high';
        if (total <= 21) severity = 'low';
        else if (total <= 35) severity = 'moderate';
        else severity = 'high';

        results.testAnxiety = {
            cognitiveScore: survey.testAnxietyCognitive,
            somaticScore: survey.testAnxietySomatic,
            totalScore: total,
            dominantType: survey.testAnxietyType as any || 'balanced',
            severity
        };
    }

    // 4. Digital Addiction 복원
    if (survey.digitalAddictionScore !== undefined && survey.digitalAddictionLevel) {
        // 상세 점수는 DB에 없으므로 총점에서 역산 불가능 -> 0으로 채우거나 approximate
        // 리포트 렌더링에는 level과 totalScore만 주로 사용됨
        results.digitalAddiction = {
            totalScore: survey.digitalAddictionScore,
            level: survey.digitalAddictionLevel as any,
            dopamineStatus: '', // 단순 복원이므로 비워둠, 리포트에서 다시 계산 or 텍스트 생성
            toleranceScore: 0,
            withdrawalScore: 0,
            controlScore: 0,
            impactScore: 0
        };
    }

    // 5. Metacognition 복원
    if (survey.metacognitionLevel && survey.metacognitionScores) {
        results.metacognition = {
            learnerLevel: survey.metacognitionLevel as any,
            rehearsalScore: survey.metacognitionScores.rehearsal,
            elaborationScore: survey.metacognitionScores.elaboration,
            organizationScore: survey.metacognitionScores.organization,
            metacognitiveScore: survey.metacognitionScores.metacognitive,
            dominantStrategy: 'balanced' // 단순 복원
        };
    }

    // 만약 하나라도 복원되었으면 객체 반환, 아니면 빈 객체일 수 있음 (하지만 completedAt은 있음)
    // 실제 데이터가 없으면 empty로 간주
    const hasData = results.chronotype || results.vark || results.testAnxiety || results.digitalAddiction || results.metacognition;

    return hasData ? results : {};
};
