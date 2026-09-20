
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

// 2. 제품 매칭 로직 (Logic Engine 3-Tier 제품을 100% 1순위 보존)
export const matchProducts = (tags: string[], existingProducts: PntProduct[] = [], hasBioSignals: boolean = false): PntProduct[] => {
    // Logic Engine에서 넘어온 제품 리스트(핵심, 추천, 보조)를 순서대로 최우선 유지
    const matched: PntProduct[] = [...existingProducts];
    const productList = Object.values(PNT_PRODUCTS);

    // 생체 신호 미측정 시: 3-Tier 기본 3개 제품만 엄격하게 반환
    if (!hasBioSignals) {
        return matched.slice(0, 3);
    }

    // 생체 신호(HRV/EEG) 정밀 측정 시: 메가도스 및 3대 영역 보완 제품을 추가하여 총 6개까지 확장
    if (tags.includes(MEGADOSE_TAG)) {
        const megadoseId = '1000000008';
        const lipoId = '1000000082';

        if (tags.includes(MEGADOSE_SENSITIVE_TAG)) {
            const lipoProduct = productList.find(p => p.id === lipoId);
            if (lipoProduct && !matched.find(m => m.id === lipoId)) {
                matched.push(lipoProduct);
            }
        } else {
            const megaProduct = productList.find(p => p.id === megadoseId);
            if (megaProduct && !matched.find(m => m.id === megadoseId)) {
                matched.push(megaProduct);
            }
        }
    }

    // 6개가 안 될 경우 보완 카테고리에서 우선순위 순으로 채움
    if (matched.length < 6) {
        const currentIds = new Set(matched.map(p => p.id));
        for (const prod of productList) {
            if (matched.length >= 6) break;
            if (!currentIds.has(prod.id)) {
                matched.push(prod);
                currentIds.add(prod.id);
            }
        }
    }

    return matched.slice(0, 6);
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
    // 0. 생체 신호(HRV/EEG) 측정 여부 판별
    const hasHRV = Boolean(
        data.hrv?.isHrvTested ?? (
            (data.hrv?.portableHrv && data.hrv.portableHrv.pulseVariability > 0) ||
            Boolean((data.hrv?.hrvIndex && data.hrv.hrvIndex > 0) || (data.hrv?.meanHr && data.hrv.meanHr > 0))
        )
    );
    const hasEEG = Boolean(
        data.hrv?.isEegTested ?? (
            (data.hrv?.eegGamma || 0) > 0 || (data.hrv?.eegAlpha || 0) > 0 || (data.hrv?.dominantEEG && data.hrv.dominantEEG.length > 0)
        )
    );
    const hasBioSignals = Boolean(data.hrv?.isSensorMeasured ?? (hasHRV || hasEEG));

    // 1. Logic Engine에서 넘어온 제품들의 태그를 추출 (Prescription Tag에 반영하기 위함)
    const productConditionTags = Array.from(new Set(
        matchedProducts.flatMap(p => p.targetConditions)
    ));

    // 2. 태그 추출 (Logic Engine 태그 + CareType + 설문 증상 종합)
    const tags = extractHealthTags(data, productConditionTags);

    // 3. 제품 확정 (Logic Engine 제품을 100% 1순위로 유지하며 생체신호 여부에 따라 3개/6개 분기)
    const finalProducts = matchProducts(tags, matchedProducts, hasBioSignals);

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
