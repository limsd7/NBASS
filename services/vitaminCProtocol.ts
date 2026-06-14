import { StudentInfo } from '../types';

export const MEGADOSE_TAG = 'VITAMIN_C_MEGADOSE';
export const MEGADOSE_SENSITIVE_TAG = 'VITAMIN_C_SENSITIVE';

// 1. 메가도스 대상자 판별 로직
export const checkMegadoseEligibility = (tags: string[], student: StudentInfo): string[] => {
    const newTags: string[] = [];

    // 피로/스트레스 관련 태그 감지
    const fatigueTags = [
        'ADRENAL_FATIGUE', // 부신 피로
        'FATIGUE_CHRONIC', // 만성 피로
        'BURNOUT',         // 번아웃
        'PHYSICAL_FATIGUE',// 육체 피로
        'IMMUNITY_LOW'     // 면역 저하 (항산화 필요)
    ];

    // 위장 민감성 태그 감지
    const stomachTags = [
        'GASTRITIS',      // 위염/속쓰림
        'IBS',            // 과민성 대장
        'SENSITIVE_GUT'   // 민감한 장
    ];

    const needsMegadose = tags.some(t => fatigueTags.includes(t));

    if (needsMegadose) {
        newTags.push(MEGADOSE_TAG);

        // 민감성 체크 (위장 질환이 있거나, 60세 이상 고령층)
        const hasStomachIssues = tags.some(t => stomachTags.includes(t));
        const isElderly = student.age >= 60; // 60대 이상은 점막 약화 가능성 고려

        if (hasStomachIssues || isElderly) {
            newTags.push(MEGADOSE_SENSITIVE_TAG);
        }
    }

    return newTags;
};

// 2. 맞춤형 복용 가이드 스크립트 생성
export const generateMegadoseAdvice = (student: StudentInfo): string => {
    // 기본 상수
    const BASE_DOSE = 3000;
    const MAX_DOSE = 6000;

    let advice = `\n\n[비타민C 메가도스 처방] 피로 물질(젖산) 배출과 신진대사 활성화를 위해 고용량 요법을 제안합니다. `;

    // 2-1. 체중별 분석
    const weight = student.weight || 60; // 기본값 60kg 가정
    if (weight >= 75 || (student.bmi && student.bmi > 25)) {
        advice += `체구(${weight}kg)가 건장하시고 대사 요구량이 많아, 기본 ${BASE_DOSE}mg보다 증량된 ${BASE_DOSE}~${MAX_DOSE}mg 섭취를 권장합니다. `;
    } else {
        advice += `표준 체중을 고려하여 하루 ${BASE_DOSE}mg을 목표로 설정합니다. `;
    }

    // 2-2. 복용법 (공통)
    advice += `이를 하루 3회로 나누어 '식사 직후'에 드시는 것이 혈중 농도 유지에 가장 유리합니다. `;

    // 2-3. 연령별 주의사항
    if (student.age >= 50) {
        advice += `특히 연령을 고려해 위장 점막 보호가 중요하므로, 공복 섭취는 피하고 반드시 식후에 드셔야 합니다. `;
    } else {
        advice += `활동량이 많은 청장년층이므로 메가도스 효과를 가장 빠르게 체감하실 수 있습니다. `;
    }

    // 2-4. 성별 특이사항
    if (student.gender === 'Male') {
        advice += `남성의 경우 근육 대사량이 많아 피로 회복을 위해 충분한 수분 섭취와 함께 드시는 것이 좋습니다. `;
    } else if (student.gender === 'Female') {
        advice += `여성의 경우 생리 주기나 빈혈 증상이 있을 때 철분제와 함께 드시면 흡수율이 높아져 회복에 더욱 좋습니다. `;
    }

    // 2-5. 필수 주의사항 (Tips)
    advice += `\n※ 체크포인트: 결석 예방을 위해 물 2L 이상 섭취가 필수이며, 설사가 발생하면 용량을 줄이셔야 합니다. 비타민 B군과 함께 드시면 시너지 효과가 납니다.`;

    return advice;
};
