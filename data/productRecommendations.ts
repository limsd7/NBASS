// CareType별 기본 추천 제품 목록
// 관리자가 UI에서 수정 가능

import { CareType } from '../types';

export interface ProductRecommendation {
    careType: CareType;
    productIds: string[];
    description: string;
}

// 기본 제품 추천 설정 (CareType별)
export const DEFAULT_PRODUCT_RECOMMENDATIONS: Record<string, string[]> = {
    [CareType.BURNOUT]: ['ad_up', 'energy_bal', 'magnesium'],
    [CareType.ANXIETY_TENSION]: ['energy_bal', 'calm_sleep', 'magnesium'],
    [CareType.STRESS_OVERLOAD]: ['ad_up', 'energy_bal', 'immune_one'],
    [CareType.LOW_ENERGY]: ['ad_up', 'no_cardi', 'immune_one'],
    [CareType.DEPRESSION_AMOTIVATION]: ['ad_up', 'no_cardi', 'vitamin_d3'],
    [CareType.ADRENAL]: ['ad_up', 'immune_one', 'vitamin_d3'],
    [CareType.BRAIN_FATIGUE]: ['no_cardi', 'omega3_plus', 'magnesium'],
    [CareType.HYPERSENSITIVE]: ['energy_bal', 'calm_sleep', 'magnesium'],
    [CareType.ATTENTION_DEFICIT]: ['no_cardi', 'omega3_plus', 'energy_bal'],
    [CareType.SLEEP]: ['calm_sleep', 'magnesium', 'energy_bal'],
    [CareType.CIRCULATION]: ['omega3_plus', 'iron_plus', 'vitamin_d3'],
    [CareType.HEALTHY]: ['immune_one', 'vitamin_d3', 'omega3_plus'],
    [CareType.CONCENTRATION]: ['no_cardi', 'ad_up', 'omega3_plus'],
};

// 로컬 스토리지 저장/불러오기
export const loadProductRecommendations = (): Record<string, string[]> => {
    try {
        const saved = localStorage.getItem('sn1_product_recommendations');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load product recommendations:', e);
    }
    return { ...DEFAULT_PRODUCT_RECOMMENDATIONS };
};

export const saveProductRecommendations = (recommendations: Record<string, string[]>): void => {
    localStorage.setItem('sn1_product_recommendations', JSON.stringify(recommendations));
};

export const resetProductRecommendations = (): Record<string, string[]> => {
    const defaults = { ...DEFAULT_PRODUCT_RECOMMENDATIONS };
    localStorage.setItem('sn1_product_recommendations', JSON.stringify(defaults));
    return defaults;
};
