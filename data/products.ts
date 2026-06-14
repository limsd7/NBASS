
export interface Product {
    id: string;
    name: string;
    subName: string;
    ingredients: string[];
    image: string;
    link?: string; // Optional now
    tags: string[];
}

// 요청된 6개 핵심 제품 데이터 (PNT Mall 상세 기능 반영)
export const PRODUCTS: Record<string, Product> = {
    'calm_sleep': {
        id: 'p_sleep',
        name: '캄 슬립 (Calm Sleep)',
        subName: '수면 입면 시간 단축 & 수면의 질 개선',
        ingredients: ['락티움 (유단백가수분해물)', 'L-테아닌'],
        image: 'https://placehold.co/200x200/f5f3ff/7c3aed?text=Calm+Sleep',
        tags: ['#입면장애', '#새벽깰', '#깊은잠']
    },
    'ad_up': {
        id: 'p_adup',
        name: '에이디업 (AD-UP)',
        subName: '스트레스 피로 개선 & 기초 체력 증진',
        ingredients: ['홍경천추출물', '비타민B군 복합체'],
        image: 'https://placehold.co/200x200/ecfdf5/047857?text=AD+UP',
        tags: ['#수험생피로', '#번아웃', '#지구력']
    },
    'energy_bal': {
        id: 'p_ebal',
        name: '에너지 밸런스 (Energy Balance)',
        subName: '과도한 신경 흥분 억제 & 심신 안정',
        ingredients: ['L-테아닌', '마그네슘', '비타민B6'],
        image: 'https://placehold.co/200x200/fff7ed/c2410c?text=Energy+Balance',
        tags: ['#시험긴장', '#가슴두근거림', '#불안케어']
    },
    'magnesium': {
        id: 'p_mg',
        name: '프리미엄 마그네슘',
        subName: '근육 이완 및 신경 과민 반응 조절',
        ingredients: ['마그네슘', '비타민D'],
        image: 'https://placehold.co/200x200/f8fafc/475569?text=Magnesium',
        tags: ['#눈떨림', '#근육뭉침', '#신경예민']
    },
    'immune_one': {
        id: 'p_immune',
        name: '이뮨원 (Immune One)',
        subName: '정상적인 면역 기능 & 세포 분열',
        ingredients: ['아연', '프로폴리스', '셀레늄'],
        image: 'https://placehold.co/200x200/f0f9ff/0284c7?text=Immune+One',
        tags: ['#환절기', '#컨디션저하', '#기초면역']
    },
    'no_cardi': {
        id: 'p_noca',
        name: '엔오카디 (NO-Cardi)',
        subName: '두뇌 인지력 개선 & 기억력 유지',
        ingredients: ['포스파티딜세린', '은행잎추출물'],
        image: 'https://placehold.co/200x200/eff6ff/1d4ed8?text=NO+Cardi',
        tags: ['#암기력', '#집중력', '#두뇌회전']
    },
    // ========== 혈액검사 기반 추천 제품 ==========
    'iron_plus': {
        id: 'p_iron',
        name: '아이언 플러스 (Iron Plus)',
        subName: '철분 보충 & 빈혈 개선 지원',
        ingredients: ['킬레이트화 철분', '비타민C', '엽산', '비타민B12'],
        image: 'https://placehold.co/200x200/fef2f2/dc2626?text=Iron+Plus',
        tags: ['#빈혈', '#피로감', '#헤모글로빈']
    },
    'vitamin_d3': {
        id: 'p_vitd',
        name: '비타민D3 5000IU',
        subName: '뼈 건강 & 면역 기능 강화',
        ingredients: ['콜레칼시페롤(D3)', '코코넛오일(흡수촉진)'],
        image: 'https://placehold.co/200x200/fef9c3/ca8a04?text=Vitamin+D3',
        tags: ['#비타민D부족', '#면역력', '#뼈건강']
    },
    'omega3_plus': {
        id: 'p_omega',
        name: '오메가-3 플러스 (Omega-3 Plus)',
        subName: '항염증 & 혈관 건강 지원',
        ingredients: ['EPA', 'DHA', '비타민E(산화방지)'],
        image: 'https://placehold.co/200x200/dbeafe/2563eb?text=Omega-3',
        tags: ['#염증관리', '#혈관건강', '#두뇌영양']
    },
    'liver_care': {
        id: 'p_liver',
        name: '리버케어 (Liver Care)',
        subName: '간 해독 & 피로 회복 지원',
        ingredients: ['밀크씨슬(실리마린)', 'NAC', '비타민B군'],
        image: 'https://placehold.co/200x200/dcfce7/16a34a?text=Liver+Care',
        tags: ['#간기능', '#해독', '#피로회복']
    },
    'blood_sugar_bal': {
        id: 'p_bsbal',
        name: '블러드슈거 밸런스',
        subName: '혈당 조절 & 대사 기능 개선',
        ingredients: ['크롬', '바나바잎추출물', '알파리포산'],
        image: 'https://placehold.co/200x200/fef3c7/d97706?text=BS+Balance',
        tags: ['#혈당관리', '#당뇨전단계', '#대사건강']
    }
};

