import { CareType, type AssessmentResult } from '../types';
import { evaluateProductRules, evaluateSecretPointRules } from '../logicEngine';

// Logic Engine 평가 (moved verbatim from App.tsx; no logic change)
export const resolveRecommendedProducts = (
    result: AssessmentResult | null,
    productRules: any
) => {
    if (!result) return [];

    // Evaluate logic rules
    const cType = result.careType || CareType.BURNOUT;

    // bloodTest 데이터를 포함하여 제품 추천 규칙 평가
    const products = evaluateProductRules(
        productRules,
        result.hrv,
        result.survey,
        cType,
        result.bloodTest
    );

    // Fallback if needed
    if (!products.some(p => p.productId === 'immune_one')) products.push({ productId: 'immune_one', tier: 'SUPPORTIVE' });

    return products;
};

export const resolveSecretPoints = (
    result: AssessmentResult | null,
    secretPointRules: any
) => {
    if (!result) return [];

    return evaluateSecretPointRules(secretPointRules, result.hrv, result.survey, result.protocol, result.analytics);
};
