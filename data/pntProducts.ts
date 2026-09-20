
import { SPECIAL_THERAPIES } from './specialTherapies';

export interface PntProduct {
    id: string;
    name: string;
    subName: string; // One-line description
    price: number;
    capacity: string; // e.g. "1개월분"
    category: 'Liver' | 'Gut' | 'Thyroid' | 'Diet' | 'Kidney' | 'Immunity' | 'Fatigue' | 'Brain' | 'Sleep' | 'Circulation' | 'Other' | 'Bone' | 'Men' | 'Women' | 'Joint' | 'Skin';

    // 처방 로직용 메타데이터
    mainIngredients: string[];
    targetSymptoms: string[]; // e.g., "소화불량", "만성피로"
    targetConditions: string[]; // e.g., "LIVER_DYSFUNCTION", "GASTRITIS"

    // 복용 가이드
    dosageMethod: string; // e.g. "1일 1회, 1정"
    timing: string; // e.g. "식후 30분"
    caution?: string; // 주의사항

    image: string; // Local path or Remote URL
    url: string; // Pntmall URL
}

export const ALL_PNT_PRODUCTS: Record<string, PntProduct> = {
    ...SPECIAL_THERAPIES, // 스페셜 처방 제일 호단에 추가 (검색 시 노출)
    // 1. 활력 & 피로 (Energy & Fatigue)
    'super_arginine_6000': {
        id: '1000000077',
        name: '슈퍼 아르기닌 6000',
        subName: '고함량 아르기닌 6,000mg & 활력 부스터',
        price: 68000,
        capacity: '1개월분',
        category: 'Fatigue',
        mainIngredients: ['L-아르기닌 6000mg', '타우린', '비타민C'],
        targetSymptoms: ['만성 피로', '에너지 방전', '운동 능력 저하'],
        targetConditions: ['BURNOUT', 'ADRENAL_FATIGUE', 'PHYSICAL_FATIGUE'],
        dosageMethod: '1일 1회, 1포',
        timing: '공복 또는 운동 전',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/5261364c-bdd3-4964-8455-d859eac425be.png',
        url: 'https://www.pntmall.com/product/detail?pno=1000000077'
    },
    'active_b_complex': {
        id: '1000000044',
        name: '액티브 B 컴플렉스',
        subName: '지친 당신을 위한 고함량 비타민B군 8종',
        price: 35000,
        capacity: '2개월분',
        category: 'Fatigue',
        mainIngredients: ['비타민B1', '비타민B2', '비타민B6', '비타민B12', '엽산', '비오틴'],
        targetSymptoms: ['만성피로', '구내염', '에너지 부족'],
        targetConditions: ['ADRENAL_FATIGUE', 'BURNOUT', 'HOMOCYSTEINE'],
        dosageMethod: '1일 1회, 1정',
        timing: '아침 식후',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/91e9f9cd-1a0d-4188-86eb-0bfdaf2059fd.png',
        url: 'https://www.pntmall.com/product/detail?pno=1000000044'
    },
    'liposomal_glutathione': {
        id: '1000000087',
        name: '리포좀글루타치온',
        subName: '순도 70% 미국산 글루타치온 & 리포좀 공법',
        price: 55000,
        capacity: '1개월분',
        category: 'Fatigue',
        mainIngredients: ['L-글루타치온 300mg'],
        targetSymptoms: ['피부 칙칙함', '독소 누적', '면역 저하'],
        targetConditions: ['LIVER_DYSFUNCTION', 'OXIDATIVE_STRESS', 'IMMUNITY_LOW'],
        dosageMethod: '1일 1회, 1포',
        timing: '취침 전 또는 공복',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/d51b3b7b-065f-4ce3-b80e-1337cbfe3a50.png',
        url: 'https://www.pntmall.com/product/detail?pno=1000000087'
    },
    'mito_up': {
        id: '1000000099',
        name: '미토업',
        subName: '활력 맞춤 설계 7가지 비타민 & 부원료 6종',
        price: 70000,
        capacity: '1개월분',
        category: 'Fatigue',
        mainIngredients: ['비타민B군', '비타민C', '비타민E'],
        targetSymptoms: ['만성피로', '대사 저하'],
        targetConditions: ['ADRENAL_FATIGUE', 'METABOLIC_SYNDROME'],
        dosageMethod: '1일 1회',
        timing: '식후',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/2c466e93-7eea-4be3-8b71-03117f159ef6.png',
        url: 'https://www.pntmall.com/product/detail?pno=1000000099'
    },
    'myers_water_mix': {
        id: '1000000073',
        name: '마이어스',
        subName: '맛있게 채우는 에너지! 레몬맛 활력 충전 워터믹스',
        price: 40000,
        capacity: '1개월분',
        category: 'Fatigue',
        mainIngredients: ['비타민', '미네랄'],
        targetSymptoms: ['수분 부족', '피로'],
        targetConditions: ['DEHYDRATION', 'FATIGUE_CHRONIC'],
        dosageMethod: '1일 1포',
        timing: '물에 타서 수시로',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/e167c3cd-f13f-4d6c-bff1-acc6cf30c38a.png',
        url: 'https://www.pntmall.com/product/detail?pno=1000000073'
    },
    'megagreen_acid': {
        id: '1000000008',
        name: '메가그린산',
        subName: '순수 비타민C 3000mg 파우더',
        price: 47000,
        capacity: '3개월분',
        category: 'Fatigue',
        mainIngredients: ['비타민C 3000mg'],
        targetSymptoms: ['만성피로', '활성산소 제거'],
        targetConditions: ['ADRENAL_FATIGUE', 'OXIDATIVE_STRESS'],
        dosageMethod: '1일 1회, 1포',
        timing: '식후 (필히 식후)',
        caution: '위장이 약한 경우 주의',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/797b6106-f3ef-4027-8c95-ddbbb8f11f3d.PNG',
        url: 'https://www.pntmall.com/product/detail?pno=1000000008'
    },

    // 2. 면역 & 항산화 (Immunity)
    'liposomal_vitamin_c': {
        id: '1000000082',
        name: '리포좀비타민C 1000',
        subName: '체내 흡수율 높은 리포좀 제형 비타민C',
        price: 40000,
        capacity: '1개월분',
        category: 'Immunity',
        mainIngredients: ['비타민C 1000mg'],
        targetSymptoms: ['피로', '면역 저하', '활성산소'],
        targetConditions: ['IMMUNITY_LOW', 'ADRENAL_FATIGUE', 'OXIDATIVE_STRESS'],
        dosageMethod: '1일 1회, 1포',
        timing: '식후',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/2704d1a6-7ac5-4aca-8d9c-09de998ff509.png',
        url: 'https://www.pntmall.com/product/detail?pno=1000000082'
    },
    'immune_one': {
        id: '1000000102',
        name: '이뮨원',
        subName: '정상적인 면역기능 & 항산화 (아연/셀렌)',
        price: 65000,
        capacity: '1개월분',
        category: 'Immunity',
        mainIngredients: ['아연', '셀레늄', '수용성커큐민'],
        targetSymptoms: ['면역저하', '잦은 감기', '염증성 질환'],
        targetConditions: ['IMMUNITY_LOW', 'THYROID', 'HASHIMOTO'],
        dosageMethod: '1일 1회, 1정',
        timing: '식후',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/684d6e1f-6d40-4b83-872c-69c71fd089db.png',
        url: 'https://www.pntmall.com/product/detail?pno=1000000102'
    },
    'allermagen': {
        id: '1000000030',
        name: '알르마젠',
        subName: '면역반응 개선을 위한, 복합 면역 솔루션!',
        price: 45000,
        capacity: '1개월분',
        category: 'Immunity',
        mainIngredients: ['다래추출물', '아연'],
        targetSymptoms: ['알레르기', '비염', '아토피', '과민반응'],
        targetConditions: ['ALLERGY', 'RHINITIS', 'IMMUNITY_IMBALANCE'],
        dosageMethod: '1일 2회, 2캡슐',
        timing: '식후',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/c1a0063e-01a6-40fa-b84b-ec6a2355a2d0.png',
        url: 'https://www.pntmall.com/product/detail?pno=1000000030'
    },
    'coq10': {
        id: '1000000011',
        name: '코큐텐',
        subName: '코엔자임Q10 항산화 성분 함유, 활기찬 하루를 위해',
        price: 35000,
        capacity: '1개월분',
        category: 'Immunity',
        mainIngredients: ['코엔자임Q10'],
        targetSymptoms: ['항산화', '혈압 관리'],
        targetConditions: ['OXIDATIVE_STRESS', 'HIGH_BLOOD_PRESSURE'],
        dosageMethod: '1일 1캡슐',
        timing: '식후',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/a2a9993b-a059-4025-b958-3bbaa084cbee.png',
        url: 'https://www.pntmall.com/product/detail?pno=1000000011'
    },
    'coq_b': {
        id: '1000000015',
        name: '코큐비',
        subName: '세포와 혈압 건강을 위한 코엔자임Q10 & 비타민 B군',
        price: 43000,
        capacity: '1개월분',
        category: 'Immunity',
        mainIngredients: ['코엔자임Q10', '비타민B군'],
        targetSymptoms: ['항산화', '활력'],
        targetConditions: ['OXIDATIVE_STRESS', 'FATIGUE_CHRONIC'],
        dosageMethod: '1일 1캡슐',
        timing: '식후',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/b0d2e763-3d39-4c9b-971e-697ffd969242.png',
        url: 'https://www.pntmall.com/product/detail?pno=1000000015'
    },

    // 3. 간 & 장 (Liver & Gut)
    'livermarin': {
        id: '1000000014',
        name: '리버마린',
        subName: '간 건강 도움 밀크씨슬 & 셀레늄',
        price: 35000,
        capacity: '1개월분',
        category: 'Liver',
        mainIngredients: ['밀크씨슬(실리마린)', '셀레늄', '비타민B군'],
        targetSymptoms: ['만성피로', '숙취', '소화불량'],
        targetConditions: ['LIVER_DYSFUNCTION', 'FATIGUE_CHRONIC', 'ALCOHOL_INTAKE'],
        dosageMethod: '1일 1회, 1정',
        timing: '저녁 식후',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/9473fd56-38e5-446d-b2b5-686917279471.png',
        url: 'https://www.pntmall.com/product/detail?pno=1000000014'
    },
    'probiotics_complete': {
        id: '1000000092',
        name: '프로바이오틱스 컴플리트 프리미엄',
        subName: '100억 보장 클레어랩스 직수입 유산균',
        price: 68000,
        capacity: '2개월분',
        category: 'Gut',
        mainIngredients: ['락토바실러스', '비피도박테리움', '12종 균주'],
        targetSymptoms: ['배변활동 원활', '더부룩함', '가스참'],
        targetConditions: ['IBS', 'CONSTIPATION', 'SENSITIVE_GUT'],
        dosageMethod: '1일 1회, 1캡슐',
        timing: '공복 (기상 직후 또는 취침 전)',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/ba27eede-b941-4ccc-b407-85920c3675ab.png',
        url: 'https://www.pntmall.com/product/detail?pno=1000000092'
    },
    'probiotics_meta_f': {
        id: '1000000037',
        name: '프로바이오틱스 메타에프 캡슐',
        subName: '7종 균주, 100억마리 보장, 락토바실러스 가세리균 포함',
        price: 34000,
        capacity: '1개월분',
        category: 'Gut',
        mainIngredients: ['락토바실러스', '가세리', '7종 복합'],
        targetSymptoms: ['다이어트', '장 건강'],
        targetConditions: ['OBESITY', 'IBS'],
        dosageMethod: '1일 1캡슐',
        timing: '공복',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/6cb04f7c-39c8-4a0d-b57b-b49cab1f2b24.png',
        url: 'https://www.pntmall.com/product/detail?pno=1000000037'
    },
    'probiotics_ib': {
        id: '1000000076',
        name: '프로바이오틱스 아이비 서포트',
        subName: '3종 균주와 부원료 PHGG 함유 신바이오틱스!',
        price: 49000,
        capacity: '3주분',
        category: 'Gut',
        mainIngredients: ['프로바이오틱스 3종', 'PHGG'],
        targetSymptoms: ['과민성 대장', '설사', '변비'],
        targetConditions: ['IBS', 'SENSITIVE_GUT'],
        dosageMethod: '1일 1포',
        timing: '공복',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/646a15ca-877b-4a3b-be97-12e4b140937c.png',
        url: 'https://www.pntmall.com/product/detail?pno=1000000076'
    },
    'childrens_chewable': {
        id: '1000000020',
        name: '프로바이오틱스 칠드런스 츄어블',
        subName: '아이의 장환경 개선을 위한 씹어먹는 8종 유산균',
        price: 45000,
        capacity: '2개월분',
        category: 'Gut',
        mainIngredients: ['프로바이오틱스 8종'],
        targetSymptoms: ['소아 변비', '편식', '면역'],
        targetConditions: ['CONSTIPATION', 'IMMUNITY_LOW'],
        dosageMethod: '1일 1정',
        timing: '식후',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/9f09ab1c-bbb7-4aee-b8dd-1c2c5ceb0077.png',
        url: 'https://www.pntmall.com/product/detail?pno=1000000020'
    },
    'biofree_xo': {
        id: '1000000055',
        name: '비오프리 엑스오 XO',
        subName: '장내 유익균 증식에 효과적인 자일로 올리고당',
        price: 31000,
        capacity: '1개월분',
        category: 'Gut',
        mainIngredients: ['자일로올리고당'],
        targetSymptoms: ['배변활동', '유익균 증식'],
        targetConditions: ['CONSTIPATION', 'DYSBIOSIS'],
        dosageMethod: '1일 1포',
        timing: '식후',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/894e972c-7f21-4378-9b6e-85698cdf762d.png',
        url: 'https://www.pntmall.com/product/detail?pno=1000000055'
    },
    'dpp_plus': {
        id: '1000000091',
        name: '디피피 플러스',
        subName: '소화효소 & 판토텐산 함유 (세레네이드 리뉴얼)',
        price: 60000,
        capacity: '1개월분',
        category: 'Gut',
        mainIngredients: ['비타민B(판토텐산)', '브로멜라인', '파파인', '미강분말'],
        targetSymptoms: ['소화불량', '염증 완화', '부종'],
        targetConditions: ['GASTRITIS', 'EDEMA', 'DIGESTION_POOR'],
        dosageMethod: '1일 1회, 1캡슐',
        timing: '식사 직전 또는 식후 즉시',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/fa2a0efa-b54f-4a91-beaf-3ea325fb735f.png',
        url: 'https://www.pntmall.com/product/detail?pno=1000000091'
    },
    'berberine': {
        id: '1000000101',
        name: '베르베린',
        subName: '고함량 베르베린 1,000mg 및 락토페린 함유',
        price: 60000,
        capacity: '1개월분',
        category: 'Gut', // or Diet
        mainIngredients: ['베르베린', '락토페린'],
        targetSymptoms: ['장내 유해균', '혈당 관리'],
        targetConditions: ['DYSBIOSIS', 'SIBO', 'DIABETES'],
        dosageMethod: '1일 1회',
        timing: '식후',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/d7c647d1-4fe8-4192-9f79-a40fa28b0ac3.png',
        url: 'https://www.pntmall.com/product/detail?pno=1000000101'
    },
    'glutamine_pro': {
        id: '1000000056',
        name: '글루타민 프로 5000',
        subName: '균형 잡힌 건강 유지를 위한 아미노산 영양 요법',
        price: 60000,
        capacity: '1개월분',
        category: 'Gut',
        mainIngredients: ['L-글루타민 5000mg'],
        targetSymptoms: ['장 점막 재생', '근손실 방지'],
        targetConditions: ['LEAKY_GUT', 'GASTRITIS', 'MUSCLE_LOSS'],
        dosageMethod: '1일 1포',
        timing: '공복',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/7d4f96b3-ddde-4e6b-aa57-dc0bb371d5ab.png',
        url: 'https://www.pntmall.com/product/detail?pno=1000000056'
    },

    // 4. 뇌 & 신경 & 스트레스 (Brain & Stress & Sleep)
    'calm_sleep': {
        id: '1000000100',
        name: '캄 슬립',
        subName: '스트레스 완화 & 수면 건강 (아쉬아간다/테아닌)',
        price: 55000,
        capacity: '1개월분',
        category: 'Sleep',
        mainIngredients: ['아쉬아간다', 'L-테아닌', '마그네슘', '비타민B6'],
        targetSymptoms: ['불면증', '스트레스', '예민함', '수면 질 저하'],
        targetConditions: ['SLEEP_DISORDER', 'ANXIETY', 'ADRENAL_FATIGUE', 'EXAM_STRESS'],
        dosageMethod: '1일 1회, 2정',
        timing: '취침 1시간 전',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/68477061-05a2-4bd4-a6f6-7046e0fa6d65.png',
        url: 'https://www.pntmall.com/product/detail?pno=1000000100'
    },
    'no_cardi_ginkgo': {
        id: '1000000035',
        name: '엔오카디징코',
        subName: '기억력 개선 & 혈행 개선 (은행잎추출물)',
        price: 25000,
        capacity: '1개월분',
        category: 'Brain',
        mainIngredients: ['은행잎추출물', '비타민E'],
        targetSymptoms: ['기억력 감퇴', '집중력 저하', '손발 차가움'],
        targetConditions: ['MEMORY_LOSS', 'POOR_CIRCULATION', 'BRAIN_FATIGUE', 'STUDENT_FOCUS'],
        dosageMethod: '1일 1회, 1정',
        timing: '오전 식후',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/c123f3ef-b447-4324-a450-7846c8348e21.png',
        url: 'https://www.pntmall.com/product/detail?pno=1000000035'
    },
    'magnesium_capsule': {
        id: '1000000095',
        name: '마그네슘 캡슐',
        subName: '신경/근육 기능 유지 & 에너지 이용',
        price: 33000,
        capacity: '50회분',
        category: 'Sleep', // or Relax
        mainIngredients: ['마그네슘 400mg'],
        targetSymptoms: ['눈떨림', '근육경련', '신경과민', '수면장애'],
        targetConditions: ['MUSCLE_TENSION', 'SLEEP_DISORDER', 'ANXIETY'],
        dosageMethod: '1일 1회, 2캡슐',
        timing: '저녁 식후',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/849845b9-b3eb-4957-844d-6ec744e32e4e.jpg',
        url: 'https://www.pntmall.com/product/detail?pno=1000000095'
    },

    // 5. 기타 (Circulation, Bone, Women, Eye)
    'rtg_omega3_plus': {
        id: '1000000047',
        name: '알티지 오메가3 플러스',
        subName: '혈행 개선 & 건조한 눈 & 기억력 개선',
        price: 39000,
        capacity: '1개월분',
        category: 'Circulation',
        mainIngredients: ['EPA', 'DHA', '비타민E'],
        targetSymptoms: ['안구건조', '혈액순환', '중성지질'],
        targetConditions: ['DRY_EYE', 'POOR_CIRCULATION', 'HIGH_LIPID', 'EYE_FATIGUE'],
        dosageMethod: '1일 1회, 2캡슐',
        timing: '식후 (지방식과 함께)',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/0298a485-ff7a-4011-8497-8eaefa92aa97.png',
        url: 'https://www.pntmall.com/product/detail?pno=1000000047'
    },
    'eyecare': {
        id: '1000000029',
        name: '아이케어',
        subName: '루테인, 지아잔틴을 한번에! 눈 건강 케어',
        price: 33000,
        capacity: '1개월분',
        category: 'Circulation', // or Eye
        mainIngredients: ['루테인', '지아잔틴', '오메가3', '비타민E'],
        targetSymptoms: ['눈 침침함', '노화', '청색광 노출'],
        targetConditions: ['EYE_FATIGUE', 'DRY_EYE'],
        dosageMethod: '1일 1회',
        timing: '식후',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/f46a5c0f-b491-43a6-9317-f7b1fe48e87b.png',
        url: 'https://www.pntmall.com/product/detail?pno=1000000029'
    },
    'climagen_plus': {
        id: '1000000050',
        name: '클리마젠 플러스',
        subName: '갱년기 여성건강에 도움 피크노제놀 함유',
        price: 80000,
        capacity: '1개월분',
        category: 'Women',
        mainIngredients: ['피크노제놀', '비타민D', '이소플라본'],
        targetSymptoms: ['안면홍조', '갱년기', '뼈 건강'],
        targetConditions: ['MENOPAUSE', 'HORMONAL_IMBALANCE'],
        dosageMethod: '1일 2정',
        timing: '식후',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/5b334f7f-73ce-4e6a-b654-c40872d50da2.png',
        url: 'https://www.pntmall.com/product/detail?pno=1000000050'
    },
    'bone_health': {
        id: '1000000039',
        name: '뼈건강',
        subName: '7중 복합 기능성, 칼슘/마그네슘/비타민D',
        price: 40000,
        capacity: '1개월분',
        category: 'Bone',
        mainIngredients: ['칼슘', '마그네슘', '비타민D'],
        targetSymptoms: ['골다공증 위험', '뼈 약함'],
        targetConditions: ['BONE_HEALTH', 'OSTEOPOROSIS'],
        dosageMethod: '1일 1회',
        timing: '식후',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/aade0d6d-014e-49d2-bb8c-c4a4a324b746.png',
        url: 'https://www.pntmall.com/product/detail?pno=1000000039'
    },
    'joint_health': {
        id: '1000000042',
        name: '관절건강',
        subName: '관절건강+항산화까지 한번에 케어',
        price: 50000,
        capacity: '1개월분',
        category: 'Joint',
        mainIngredients: ['터마신(강황추출물)'],
        targetSymptoms: ['관절 통증', '뻣뻣함'],
        targetConditions: ['JOINT_PAIN', 'ARTHRITIS'],
        dosageMethod: '1일 1회',
        timing: '식후',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/ace9b52e-2172-4895-930d-715a59b89c26.png',
        url: 'https://www.pntmall.com/product/detail?pno=1000000042'
    },
    'every_d_plus': {
        id: '1000000040',
        name: '에브리D플러스',
        subName: '뿌리는 비타민D 스프레이 (5개월분)',
        price: 39000,
        capacity: '5개월분',
        category: 'Immunity',
        mainIngredients: ['비타민D3'],
        targetSymptoms: ['비타민D 결핍', '면역 저하'],
        targetConditions: ['VITAMIN_D_DEFICIENCY', 'IMMUNITY_LOW'],
        dosageMethod: '1일 1회 1분사',
        timing: '식사 중',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/549c42b5-bbca-4e72-b2e7-79d4407880ab.png',
        url: 'https://www.pntmall.com/product/detail?pno=1000000040'
    },
    'd_and_k2': {
        id: '1000000098',
        name: 'D&K2',
        subName: '뼈건강을 위한 고함량 비타민D3 & K2',
        price: 40000,
        capacity: '2개월분',
        category: 'Bone',
        mainIngredients: ['비타민D3', '비타민K2'],
        targetSymptoms: ['석회화 예방', '골다공증'],
        targetConditions: ['BONE_HEALTH', 'VITAMIN_D_DEFICIENCY'],
        dosageMethod: '1일 1회',
        timing: '식후',
        image: 'https://gcwbstoacc.blob.core.windows.net/gcwbdata/product/f769be42-0235-4523-9940-34a602c8a177.png',
        url: 'https://www.pntmall.com/product/detail?pno=1000000098'
    },
    // 16. 수험생 스마트 두뇌 & 대사 부스터 (HL Coffee x NBASS 특화 처방)
    'hl_focus_booster': {
        id: 'HL-COFFEE-001',
        name: 'HL 아르기닌·카르니틴 스마트 아메리카노',
        subName: '아르기닌 2,600mg · 카르니틴 1,200mg · 시트룰린(수박추출물) · 마일드 카페인',
        price: 32000,
        capacity: '1개월분 (30포)',
        category: 'Brain',
        mainIngredients: ['L-아르기닌 2,600mg', 'L-카르니틴 1,200mg', '시트룰린 (수박추출물)', '마일드 카페인 (스타벅스 Tall 수준)'],
        targetSymptoms: ['기상 슬럼프', '식곤증/Brain Fog', '두뇌 피로', '만성 집중력 저하', '운동 부족/체지방'],
        targetConditions: ['LOW_ENERGY', 'BRAIN_FATIGUE', 'BURNOUT', 'ADRENAL', 'CONCENTRATION'],
        dosageMethod: '1일 1회, 1포를 미온수 또는 냉수 500ml 이상에 연하게 희석',
        timing: '아침 기상 직후 또는 공부 시작 30분 전 공복',
        caution: '⚠️ 아르기닌 열 변성 방지를 위해 뜨거운 물은 피하시고, 특유의 향을 완화하기 위해 반드시 500ml 이상 시원한 물에 희석해 드세요.',
        image: '/hl_coffee_circle.png',
        url: 'https://www.hl-coffee.com/category/coffee/29/'
    }
};

export const PNT_PRODUCTS = ALL_PNT_PRODUCTS;
