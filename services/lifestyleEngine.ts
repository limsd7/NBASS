import { StudentInfo, CareType } from "../types";
import { getBmiStrategy } from '../data/bmiStrategies';
import { DETAILED_ADVICE } from '../data/detailedAdvice';

// 새로운 상세 BMI 분석 구조에 대한 인터페이스
interface BmiStrategy {
  title: string;
  sections: {
    heading: string;
    content: string;
  }[];
}

// 식단, 운동 등 다른 조언 섹션을 위한 인터페이스
interface AdviceDetail {
    title: string;
    advice: string;
}

// analyzeLifestyle 함수의 최종 반환 타입 정의
export interface LifestyleAnalysis {
    bmi: BmiStrategy; // BMI 분석을 위한 새로운 상세 구조 사용
    diet: AdviceDetail;
    exercise: AdviceDetail;
    learning: AdviceDetail;
}

/**
 * 학생의 정보와 CareType에 따라 상세한 라이프스타일 분석을 생성합니다.
 * 이 함수는 bmiStrategies.ts의 매우 상세한 BMI 분석과
 * detailedAdvice.ts의 다른 조언들을 결합합니다.
 * @param student - 학생 정보 객체
 * @param careType - 12가지 진단 유형 중 하나
 * @returns 상세한 BMI 섹션을 포함하는 구조화된 LifestyleAnalysis 객체
 */
export const analyzeLifestyle = (student: StudentInfo, careType: CareType): LifestyleAnalysis => {
    // 1. 새로운, 매우 상세한 BMI 전략을 가져옵니다.
    const bmiAnalysis = getBmiStrategy(student, careType);
    
    // 2. 기존의 상세 조언 데이터에서 다른 조언 섹션들을 가져옵니다.
    const otherAdvice = DETAILED_ADVICE[careType] || DETAILED_ADVICE[CareType.HEALTHY];

    // 3. 최종 분석 객체로 결합합니다.
    const analysis: LifestyleAnalysis = {
        bmi: bmiAnalysis,
        diet: otherAdvice.diet,
        exercise: otherAdvice.exercise,
        learning: otherAdvice.learning,
    };

    return analysis;
};
