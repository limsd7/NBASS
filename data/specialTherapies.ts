import type { PntProduct } from './pntProducts';

export const SPECIAL_THERAPIES: Record<string, PntProduct> = {
    'megadose_therapy': {
        id: '9900000001', // Special ID range
        name: '비타민C 메가도스 요법',
        subName: '피로 완전 정복: 하루 3,000mg 고용량 요법 (메가그린산)',
        price: 47000, // 메가그린산 가격 동일
        capacity: '3개월분',
        category: 'Fatigue',
        mainIngredients: ['비타민C 3000mg'],
        targetSymptoms: ['만성피로', '부신고갈', '면역저하', '활성산소 제거'],
        targetConditions: ['VITAMIN_C_MEGADOSE', 'ADRENAL_FATIGUE', 'BURNOUT'],
        dosageMethod: '1일 3회, 식사 직후 분할 섭취',
        timing: '식후 즉시 (공복 금지)',
        caution: '위장 장애 시 감량 필요, 물 2L 필수',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/797b6106-f3ef-4027-8c95-ddbbb8f11f3d.PNG', // 메가그린산 이미지 공유
        url: 'https://www.pntmall.com/product/detail?pno=1000000008'
    }
};
