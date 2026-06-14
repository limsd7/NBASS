export interface UniversityDepartment {
    id: string;
    name: string;
    // 목표로 하는 대략적인 평균 등급컷 (국/수/영/탐 평균치)
    targetGradeCutline: number;
    // 과목별 가중치 (선택)
    weights?: {
        korean: number;
        math: number;
        english: number;
        [key: string]: number;
    };
}

export interface University {
    id: string;
    name: string;
    logo?: string;
    departments: UniversityDepartment[];
}

export const UNIVERSITY_DB: University[] = [
    {
        id: 'seoul_natl',
        name: '서울대학교',
        departments: [
            { id: 'snu_med', name: '의예과', targetGradeCutline: 1.05 },
            { id: 'snu_comp', name: '컴퓨터공학부', targetGradeCutline: 1.15 },
            { id: 'snu_business', name: '경영대학', targetGradeCutline: 1.2 },
            { id: 'snu_humanities', name: '인문계열', targetGradeCutline: 1.3 },
        ]
    },
    {
        id: 'yonsei',
        name: '연세대학교',
        departments: [
            { id: 'yonsei_med', name: '의예과', targetGradeCutline: 1.1 },
            { id: 'yonsei_dent', name: '치의예과', targetGradeCutline: 1.25 },
            { id: 'yonsei_business', name: '경영학과', targetGradeCutline: 1.4 },
            { id: 'yonsei_electronic', name: '전기전자공학부', targetGradeCutline: 1.5 },
        ]
    },
    {
        id: 'korea',
        name: '고려대학교',
        departments: [
            { id: 'ku_med', name: '의과대학', targetGradeCutline: 1.15 },
            { id: 'ku_cyber', name: '사이버국방학과', targetGradeCutline: 1.35 },
            { id: 'ku_business', name: '경영대학', targetGradeCutline: 1.45 },
            { id: 'ku_electronic', name: '전기전자공학부', targetGradeCutline: 1.6 },
        ]
    },
    {
        id: 'sungkyunkwan',
        name: '성균관대학교',
        departments: [
            { id: 'skku_med', name: '의예과', targetGradeCutline: 1.15 },
            { id: 'skku_semi', name: '반도체시스템공학', targetGradeCutline: 1.5 },
            { id: 'skku_global_biz', name: '글로벌경영', targetGradeCutline: 1.6 },
        ]
    },
    {
        id: 'hanyang',
        name: '한양대학교',
        departments: [
            { id: 'hy_med', name: '의예과', targetGradeCutline: 1.2 },
            { id: 'hy_diamond', name: '다이아몬드7학과', targetGradeCutline: 1.6 },
            { id: 'hy_electronic', name: '융합전자공학부', targetGradeCutline: 1.7 },
        ]
    }
];
