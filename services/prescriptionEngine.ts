
import { AssessmentResult, CareType, StudentInfo } from '../types';
import { PNT_PRODUCTS, PntProduct } from '../data/pntProducts';
import { checkMegadoseEligibility, generateMegadoseAdvice, MEGADOSE_TAG, MEGADOSE_SENSITIVE_TAG } from './vitaminCProtocol';

// 처방 결과 인터페이스
export interface PrescriptionResult {
    recommendedProducts: PntProduct[];
    symptomTags: string[];
    healthScore: number;
    counselorScript: string; // 300자 내외 설명
    lifestyleGuide: string[];
}

// 1. 상태 진단 태그 추출기 (Updated to use Logic Engine Results)
const extractHealthTags = (data: AssessmentResult, logicCurrentTags: string[] = []): string[] => {
    // Logic Engine에서 넘어온 태그들을 우선 사용
    // 만약 logicCurrentTags(추천된 제품들의 targetCondition 등)가 있다면 그것을 base로 함
    const tags: string[] = [...logicCurrentTags];
    const { student, careType, survey } = data;

    // 1-1. CareType 기반 태그 매핑 (Logic Engine의 CareType 결과를 Prescription 태그로 변환)
    switch (careType) {
        case CareType.ADRENAL:
        case CareType.BURNOUT:
            tags.push('ADRENAL_FATIGUE');
            tags.push('PHYSICAL_FATIGUE');
            break;
        case CareType.SLEEP:
            tags.push('SLEEP_DISORDER');
            break;
        case CareType.CIRCULATION:
            tags.push('POOR_CIRCULATION');
            tags.push('BRAIN_FATIGUE');
            break;
        case CareType.LOW_ENERGY:
        case CareType.DEPRESSION_AMOTIVATION:
            tags.push('FATIGUE_CHRONIC');
            tags.push('MEMORY_LOSS');
            break;
        case CareType.BRAIN_FATIGUE:
            tags.push('BRAIN_FATIGUE');
            tags.push('MEMORY_LOSS');
            break;
        case CareType.HYPERSENSITIVE:
            tags.push('SENSITIVE_GUT');
            break;
        case CareType.ATTENTION_DEFICIT:
            tags.push('BRAIN_FATIGUE');
            break;
    }

    // 1-2. 설문 및 신체 정보 기반 보조 태그 (스크립트 풍부화를 위해 유지)
    // 단, Logic Engine과 충돌하지 않는 선에서 '증상' 위주로만 추가
    const symptoms = survey.symptoms || [];
    if (symptoms.includes('소화불량') || symptoms.includes('속쓰림')) tags.push('GASTRITIS');
    if (symptoms.includes('변비') || symptoms.includes('설사')) tags.push('IBS');
    if (symptoms.includes('비만') || (student.bmi && student.bmi > 25)) tags.push('OBESITY');
    if (symptoms.includes('생리불순') || symptoms.includes('생리통')) tags.push('HORMONAL_IMBALANCE');
    if (symptoms.includes('건망증') || symptoms.includes('기억력')) tags.push('MEMORY_LOSS');
    if (symptoms.includes('두통') || symptoms.includes('멍함')) tags.push('BRAIN_FATIGUE');
    if (symptoms.includes('눈') || symptoms.includes('안구건조')) tags.push('EYE_FATIGUE');
    if (symptoms.includes('긴장') || symptoms.includes('불안')) tags.push('EXAM_STRESS');

    // 신체 정보
    if (student.bmi && student.bmi >= 25) tags.push('OBESITY');

    // 1-3. 비타민C 메가도스 (Logic Engine 결과와 무관하게 유지해야 하는 프로토콜)
    const megadoseTags = checkMegadoseEligibility(tags, student);
    tags.push(...megadoseTags);

    return Array.from(new Set(tags));
};

// 2. 제품 매칭 로직 (Logic Engine 결과를 그대로 수용)
export const matchProducts = (tags: string[], existingProducts: PntProduct[] = []): PntProduct[] => {
    // Logic Engine에서 이미 제품을 선정해서 existingProducts로 넘겨주므로
    // 여기서는 태그 기반으로 추가 제품을 찾기보다는, 
    // 넘겨받은 제품 리스트를 정렬하고 메가도스 같은 특수 로직만 적용하면 됨.

    const matched: PntProduct[] = [...existingProducts];
    const productList = Object.values(PNT_PRODUCTS);

    // 메가도스 제품 자동 추가 로직 (Logic Engine에 없을 수 있으므로 여기서 처리)
    if (tags.includes(MEGADOSE_TAG)) {
        const megadoseId = '1000000008';
        const lipoId = '1000000082';

        if (tags.includes(MEGADOSE_SENSITIVE_TAG)) {
            const lipoProduct = productList.find(p => p.id === lipoId);
            if (lipoProduct && !matched.find(m => m.id === lipoId)) {
                matched.unshift(lipoProduct);
            }
        } else {
            const megaProduct = productList.find(p => p.id === megadoseId);
            if (megaProduct && !matched.find(m => m.id === megadoseId)) {
                matched.unshift(megaProduct);
            }
        }
    }

    // 최대 7개 및 우선순위 정렬
    const priorityOrder = ['BRAIN', 'FATIGUE', 'LIVER', 'IMMUNITY', 'KIDNEY', 'THYROID', 'GASTRITIS', 'ADRENAL'];

    return matched.sort((a, b) => {
        const catA = a.targetConditions[0]?.split('_')[0] || '';
        const catB = b.targetConditions[0]?.split('_')[0] || '';
        const scoreA = priorityOrder.indexOf(catA) !== -1 ? priorityOrder.indexOf(catA) : 99;
        const scoreB = priorityOrder.indexOf(catB) !== -1 ? priorityOrder.indexOf(catB) : 99;
        return scoreA - scoreB;
    }).slice(0, 7);
};

// 3. 상담 스크립트 생성기 (300자 내외) - Student 객체 전체를 받도록 수정 (for Megadose Logic)
const generateCounselorScript = (student: StudentInfo, tags: string[], products: PntProduct[]): string => {
    const mainCondition = tags[0] || '건강 관리';
    const productNames = products.slice(0, 3).map(p => p.name).join(', ');
    const studentName = student.name;

    let script = `${studentName}님, 현재 검사 결과를 종합해보면 '${translateTag(tags[0])}' 개선이 최우선 과제입니다. `;

    if (tags.includes('BRAIN_FATIGUE') || tags.includes('MEMORY_LOSS')) {
        script += `학업 집중력과 기억력 유지를 위해 뇌 혈류를 개선하고 신경 세포막을 보호하는 [엔오카디/오메가3] 처방을 구성했습니다. `;
    } else if (tags.includes('LIVER_DYSFUNCTION') || tags.includes('FATIGUE_CHRONIC')) {
        script += `간 기능 저하로 인한 피로 누적이 관찰되어, 해독과 에너지 대사를 돕는 [리버마린/아르기닌]을 추천드립니다. `;
    } else if (tags.includes('ADRENAL_FATIGUE')) {
        script += `번아웃 및 부신 고갈 신호가 있어, 고함량 비타민 보충을 통해 빠른 컨디션 회복을 돕고자 합니다. `;
    } else if (tags.includes('GASTRITIS')) {
        script += `소화 기능 안정화가 선행되어야 영양 흡수가 가능하므로, 위장 점막 재생을 위한 솔루션을 포함했습니다. `;
    } else if (tags.includes('EYE_FATIGUE')) {
        script += `장시간 학습으로 인한 눈 피로는 집중력을 떨어뜨리므로, [아이케어]를 통해 건조감과 피로도를 개선해야 합니다. `;
    } else if (tags.includes('EXAM_STRESS')) {
        script += `시험 긴장도가 높아 실력 발휘가 어렵다면, 긴장을 완화하고 차분한 몰입을 돕는 [테아닌] 섭취가 큰 도움이 됩니다. `;
    }

    // 메가도스 추가 코멘트 (Script Injection)
    if (tags.includes(MEGADOSE_TAG)) {
        script += generateMegadoseAdvice(student);
    }

    script += `추천드린 [${productNames}${products.length > 3 ? ' 등' : ''}]을(를) 꾸준히 섭취하시면 ${translateTag(tags[0])} 개선과 함께 학습 효율 향상을 기대할 수 있습니다.`;

    return script;
};

// 태그 한글 변환 헬퍼
const translateTag = (tag: string): string => {
    const map: Record<string, string> = {
        'LIVER_DYSFUNCTION': '간 기능',
        'ADRENAL_FATIGUE': '부신 피로',
        'GASTRITIS': '위장 건강',
        'IBS': '장 건강',
        'IMMUNITY_LOW': '면역력',
        'OBESITY': '체중/대사',
        'SLEEP_DISORDER': '수면 질',
        'POOR_CIRCULATION': '혈액 순환',
        'VITAMIN_D_DEFICIENCY': '비타민D',
        'HORMONAL_IMBALANCE': '호르몬 균형',
        'BRAIN_FATIGUE': '두뇌 피로',
        'MEMORY_LOSS': '기억력',
        'PHYSICAL_FATIGUE': '체력 회복',
        'ANEMIA': '빈혈 관리',
        'EYE_FATIGUE': '눈 피로/건조',
        'EXAM_STRESS': '시험 긴장/불안',
        'STUDENT_FOCUS': '수험생 집중력'
    };
    return map[tag] || '전반적인 건강';
};

// 메인 함수
export const generateNutritionalPrescription = (data: AssessmentResult, matchedProducts: PntProduct[] = []): PrescriptionResult => {
    // 1. Logic Engine에서 넘어온 제품들의 태그를 추출 (Prescription Tag에 반영하기 위함)
    const productConditionTags = Array.from(new Set(
        matchedProducts.flatMap(p => p.targetConditions)
    ));

    // 2. 태그 추출 (Logic Engine 태그 + CareType + 설문 증상 종합)
    const tags = extractHealthTags(data, productConditionTags);

    // 3. 제품 확정 (Logic Engine 제품 우선 + 메가도스 등 추가 제품)
    const finalProducts = matchProducts(tags, matchedProducts);

    // 4. 스크립트 생성
    const script = generateCounselorScript(data.student, tags, finalProducts);

    return {
        recommendedProducts: finalProducts,
        symptomTags: tags,
        healthScore: data.score || 70, // 기본값
        counselorScript: script,
        lifestyleGuide: [
            '처방된 영양제는 물과 함께 섭취하며, 차나 커피와 함께 드시지 마세요.',
            '위장 장애 발생 시 식사 직후 섭취로 변경하세요.',
            '3개월 섭취 후 재검사를 통해 용량을 조절하는 것이 좋습니다.'
        ]
    };
};
