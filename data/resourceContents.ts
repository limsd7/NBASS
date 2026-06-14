import { CareType } from '../types';

// 자가진단 질문 타입
export interface SelfCheckQuestion {
    id: string;
    text: string;
    category?: string;
}

export interface SelfCheckData {
    title: string;
    description: string;
    questions: SelfCheckQuestion[];
    scoring: {
        ranges: { min: number; max: number; level: string; description: string; color: string }[];
    };
}

// 일일 루틴 타입
export interface DailyRoutineItem {
    id: string;
    time: string;
    title: string;
    description: string;
    duration?: string;
}

export interface DailyRoutineData {
    title: string;
    description: string;
    routines: DailyRoutineItem[];
}

// 워크시트 타입
export interface WorksheetData {
    title: string;
    description: string;
    type: 'journal' | 'tracker' | 'planner';
    prompts: string[];
}

// ========== 자가진단 데이터 ==========
export const SELF_CHECK_DATA: Partial<Record<CareType, SelfCheckData>> = {
    [CareType.ADRENAL]: {
        title: '부신 피로 자가진단',
        description: '부신 피로 증상을 체크하여 현재 상태를 확인하세요.',
        questions: [
            { id: '1', text: '아침에 일어나기 힘들고 피곤하다' },
            { id: '2', text: '오후 2-4시에 극심한 피로를 느낀다' },
            { id: '3', text: '단 음식이나 짠 음식이 자주 당긴다' },
            { id: '4', text: '커피나 에너지 음료 없이는 하루를 시작하기 어렵다' },
            { id: '5', text: '스트레스에 쉽게 압도되고 대처하기 어렵다' },
            { id: '6', text: '집중력이 떨어지고 기억력이 감퇴했다' },
            { id: '7', text: '사소한 일에도 짜증이 나고 감정 기복이 심하다' },
            { id: '8', text: '업무나 학습 후 회복하는데 시간이 오래 걸린다' },
            { id: '9', text: '면역력이 약해져 감기에 자주 걸린다' },
            { id: '10', text: '성욕이 감퇴하거나 생리 주기가 불규칙하다' },
            { id: '11', text: '밤에 잠들기 어렵거나 자주 깬다' },
            { id: '12', text: '근육통이나 관절통이 있다' },
            { id: '13', text: '어지럽거나 일어날 때 현기증을 느낀다' },
            { id: '14', text: '소화가 잘 안 되고 복부 팽만감이 있다' },
            { id: '15', text: '체중이 특히 복부에 증가했다' },
        ],
        scoring: {
            ranges: [
                { min: 0, max: 3, level: '정상', description: '부신 기능이 양호합니다', color: 'green' },
                { min: 4, max: 7, level: '경미', description: '가벼운 부신 피로가 있습니다', color: 'yellow' },
                { min: 8, max: 11, level: '중등도', description: '중등도 부신 피로입니다', color: 'orange' },
                { min: 12, max: 15, level: '심각', description: '심각한 부신 피로입니다', color: 'red' },
            ]
        }
    },

    [CareType.BURNOUT]: {
        title: '번아웃 레벨 체크',
        description: '번아웃 증상을 체크하여 현재 상태를 확인하세요.',
        questions: [
            { id: '1', text: '일이나 학습에 대한 의욕이 사라졌다' },
            { id: '2', text: '작은 일에도 압도되고 스트레스를 받는다' },
            { id: '3', text: '만성적인 피로감을 느낀다' },
            { id: '4', text: '성취감이나 만족감을 느끼지 못한다' },
            { id: '5', text: '타인과의 관계에서 거리감을 느낀다' },
            { id: '6', text: '냉소적이거나 부정적인 생각이 많아졌다' },
            { id: '7', text: '집중력과 생산성이 크게 떨어졌다' },
            { id: '8', text: '두통, 근육통 등 신체 증상이 있다' },
            { id: '9', text: '수면 문제(불면 또는 과수면)가 있다' },
            { id: '10', text: '감정 조절이 어렵다' },
        ],
        scoring: {
            ranges: [
                { min: 0, max: 2, level: '정상', description: '번아웃 위험이 낮습니다', color: 'green' },
                { min: 3, max: 5, level: '경미', description: '가벼운 번아웃 징후가 있습니다', color: 'yellow' },
                { min: 6, max: 8, level: '중등도', description: '번아웃 위험이 높습니다', color: 'orange' },
                { min: 9, max: 10, level: '심각', description: '심각한 번아웃 상태입니다', color: 'red' },
            ]
        }
    },

    [CareType.SLEEP]: {
        title: '수면 품질 체크',
        description: '수면 상태를 체크하여 현재 수면 품질을 확인하세요.',
        questions: [
            { id: '1', text: '잠들기까지 30분 이상 걸린다' },
            { id: '2', text: '밤에 자주 깨고 다시 잠들기 어렵다' },
            { id: '3', text: '아침에 일찍 깨서 다시 잠들지 못한다' },
            { id: '4', text: '충분히 잤는데도 피곤하다' },
            { id: '5', text: '낮에 졸리고 집중하기 어렵다' },
            { id: '6', text: '불안하거나 걱정 때문에 잠들기 어렵다' },
            { id: '7', text: '악몽을 자주 꾼다' },
            { id: '8', text: '코골이나 수면 무호흡 증상이 있다' },
        ],
        scoring: {
            ranges: [
                { min: 0, max: 1, level: '양호', description: '수면 품질이 좋습니다', color: 'green' },
                { min: 2, max: 4, level: '보통', description: '약간의 수면 문제가 있습니다', color: 'yellow' },
                { min: 5, max: 6, level: '불량', description: '수면 문제가 있습니다', color: 'orange' },
                { min: 7, max: 8, level: '심각', description: '심각한 수면 장애입니다', color: 'red' },
            ]
        }
    },

    [CareType.ANXIETY_TENSION]: {
        title: '불안 레벨 체크',
        description: '불안 증상을 체크하여 현재 상태를 확인하세요.',
        questions: [
            { id: '1', text: '긴장하거나 불안하게 느낀다' },
            { id: '2', text: '걱정을 멈추거나 조절할 수 없다' },
            { id: '3', text: '여러 가지 것들에 대해 걱정을 너무 많이 한다' },
            { id: '4', text: '편하게 있기가 어렵다' },
            { id: '5', text: '너무 불안해서 가만히 있을 수가 없다' },
            { id: '6', text: '쉽게 짜증이 나거나 쉽게 성을 낸다' },
            { id: '7', text: '마치 끔찍한 일이 생길 것 같아 두렵다' },
        ],
        scoring: {
            ranges: [
                { min: 0, max: 1, level: '정상', description: '불안 수준이 정상입니다', color: 'green' },
                { min: 2, max: 3, level: '경미', description: '가벼운 불안이 있습니다', color: 'yellow' },
                { min: 4, max: 5, level: '중등도', description: '중등도 불안이 있습니다', color: 'orange' },
                { min: 6, max: 7, level: '심각', description: '심각한 불안이 있습니다', color: 'red' },
            ]
        }
    },

    [CareType.BRAIN_FATIGUE]: {
        title: '뇌피로도 체크',
        description: '뇌 피로 증상을 체크하여 현재 상태를 확인하세요.',
        questions: [
            { id: '1', text: '장시간 집중하기 어렵다' },
            { id: '2', text: '머리가 무겁고 멍한 느낌이 든다' },
            { id: '3', text: '새로운 정보를 기억하기 어렵다' },
            { id: '4', text: '멀티태스킹이 힘들어졌다' },
            { id: '5', text: '의사결정이 어렵고 우유부단하다' },
            { id: '6', text: '독서나 학습 후 두통이 생긴다' },
            { id: '7', text: '눈이 쉽게 피로하고 시력이 흐려진다' },
            { id: '8', text: '창의적 사고가 어렵다' },
        ],
        scoring: {
            ranges: [
                { min: 0, max: 2, level: '정상', description: '뇌 상태가 양호합니다', color: 'green' },
                { min: 3, max: 4, level: '경미', description: '가벼운 뇌피로가 있습니다', color: 'yellow' },
                { min: 5, max: 6, level: '중등도', description: '중등도 뇌피로입니다', color: 'orange' },
                { min: 7, max: 8, level: '심각', description: '심각한 뇌피로입니다', color: 'red' },
            ]
        }
    },

    [CareType.STRESS_OVERLOAD]: {
        title: '스트레스 과부하 체크',
        description: '스트레스 수준을 체크하여 현재 상태를 확인하세요.',
        questions: [
            { id: '1', text: '일상적인 일에도 압도되는 느낌이 든다' },
            { id: '2', text: '자주 두통이나 근육 긴장이 있다' },
            { id: '3', text: '잠을 잘 자도 피로가 풀리지 않는다' },
            { id: '4', text: '짜증이 나고 화가 자주 난다' },
            { id: '5', text: '집중하기 어렵고 건망증이 심해졌다' },
            { id: '6', text: '소화 문제나 복통이 자주 있다' },
            { id: '7', text: '긴장을 풀기가 어렵다' },
            { id: '8', text: '사소한 일에도 과민 반응한다' },
        ],
        scoring: {
            ranges: [
                { min: 0, max: 1, level: '정상', description: '스트레스 관리가 잘 되고 있습니다', color: 'green' },
                { min: 2, max: 4, level: '경미', description: '약간의 스트레스가 있습니다', color: 'yellow' },
                { min: 5, max: 6, level: '중등도', description: '스트레스 과부하 상태입니다', color: 'orange' },
                { min: 7, max: 8, level: '심각', description: '심각한 스트레스 과부하입니다', color: 'red' },
            ]
        }
    },

    [CareType.LOW_ENERGY]: {
        title: '무기력 레벨 체크',
        description: '에너지 수준과 무기력 상태를 확인하세요.',
        questions: [
            { id: '1', text: '아침에 일어나는 것이 너무 힘들다' },
            { id: '2', text: '하루 종일 피곤하고 지친다' },
            { id: '3', text: '아무것도 하고 싶지 않다' },
            { id: '4', text: '작은 일도 큰 노력이 필요하게 느껴진다' },
            { id: '5', text: '즐겁던 활동에 흥미가 없어졌다' },
            { id: '6', text: '몸이 무겁고 움직이기 싫다' },
        ],
        scoring: {
            ranges: [
                { min: 0, max: 1, level: '정상', description: '에너지 수준이 양호합니다', color: 'green' },
                { min: 2, max: 3, level: '경미', description: '약간의 무기력이 있습니다', color: 'yellow' },
                { min: 4, max: 5, level: '중등도', description: '중등도 무기력 상태입니다', color: 'orange' },
                { min: 6, max: 6, level: '심각', description: '심각한 무기력 상태입니다', color: 'red' },
            ]
        }
    },

    [CareType.HYPERSENSITIVE]: {
        title: '과민감 체크',
        description: '감각 및 정서적 과민성을 체크하세요.',
        questions: [
            { id: '1', text: '소음이나 밝은 빛에 쉽게 예민해진다' },
            { id: '2', text: '타인의 기분이나 감정에 쉽게 영향받는다' },
            { id: '3', text: '작은 비판에도 상처받는다' },
            { id: '4', text: '여러 일을 동시에 처리하면 압도된다' },
            { id: '5', text: '강한 자극(냄새, 소리 등)을 피하게 된다' },
            { id: '6', text: '환경 변화에 적응하기 어렵다' },
        ],
        scoring: {
            ranges: [
                { min: 0, max: 1, level: '정상', description: '과민성이 정상 범위입니다', color: 'green' },
                { min: 2, max: 3, level: '경미', description: '약간의 과민성이 있습니다', color: 'yellow' },
                { min: 4, max: 5, level: '중등도', description: '중등도 과민성입니다', color: 'orange' },
                { min: 6, max: 6, level: '높음', description: '높은 과민성입니다', color: 'red' },
            ]
        }
    },

    [CareType.ATTENTION_DEFICIT]: {
        title: '주의력 산만 체크',
        description: '집중력과 주의력 상태를 확인하세요.',
        questions: [
            { id: '1', text: '과제나 학습을 시작하기 어렵다' },
            { id: '2', text: '쉽게 산만해지고 다른 생각을 한다' },
            { id: '3', text: '물건을 자주 잃어버린다' },
            { id: '4', text: '지시사항을 끝까지 따르기 어렵다' },
            { id: '5', text: '가만히 앉아 있기 힘들다' },
            { id: '6', text: '순서를 기다리기 어렵다' },
            { id: '7', text: '말을 너무 많이 하거나 충동적으로 행동한다' },
        ],
        scoring: {
            ranges: [
                { min: 0, max: 1, level: '정상', description: '주의력이 양호합니다', color: 'green' },
                { min: 2, max: 3, level: '경미', description: '약간의 주의력 문제가 있습니다', color: 'yellow' },
                { min: 4, max: 5, level: '중등도', description: '중등도 주의력 결핍입니다', color: 'orange' },
                { min: 6, max: 7, level: '심각', description: '심각한 주의력 결핍입니다', color: 'red' },
            ]
        }
    },

    [CareType.CIRCULATION]: {
        title: '혈액순환 체크',
        description: '혈액순환 상태를 확인하세요.',
        questions: [
            { id: '1', text: '손발이 자주 차갑다' },
            { id: '2', text: '손발이 저리거나 감각이 둔하다' },
            { id: '3', text: '오래 앉아있으면 다리가 붓는다' },
            { id: '4', text: '피부색이 창백하거나 푸르스름하다' },
            { id: '5', text: '상처가 잘 낫지 않는다' },
            { id: '6', text: '어지럽거나 현기증이 난다' },
        ],
        scoring: {
            ranges: [
                { min: 0, max: 1, level: '양호', description: '혈액순환이 양호합니다', color: 'green' },
                { min: 2, max: 3, level: '경미', description: '약간의 순환 문제가 있습니다', color: 'yellow' },
                { min: 4, max: 5, level: '중등도', description: '순환 개선이 필요합니다', color: 'orange' },
                { min: 6, max: 6, level: '불량', description: '순환이 불량합니다', color: 'red' },
            ]
        }
    },
};

// ========== 일일 루틴 데이터 ==========
export const DAILY_ROUTINE_DATA: Partial<Record<CareType, DailyRoutineData>> = {
    [CareType.ADRENAL]: {
        title: '부신 회복 아침 루틴',
        description: '부신 피로 회복을 위한 하루를 시작하는 루틴입니다.',
        routines: [
            { id: '1', time: '07:00', title: '일어나기', description: '알람 없이 자연스럽게 일어나기 (가능하면)', duration: '1분' },
            { id: '2', time: '07:05', title: '물 마시기', description: '미지근한 물 500ml 천천히 마시기', duration: '5분' },
            { id: '3', time: '07:10', title: '가벼운 스트레칭', description: '목, 어깨, 등 근육 풀기', duration: '10분' },
            { id: '4', time: '07:20', title: '햇빛 쬐기', description: '창가나 밖에서 10분간 햇빛 쬐기', duration: '10분' },
            { id: '5', time: '07:30', title: '영양 아침식사', description: '단백질+채소 위주 식사', duration: '20분' },
            { id: '6', time: '07:50', title: '비타민 섭취', description: '비타민 B, C, 마그네슘 보충', duration: '1분' },
            { id: '7', time: '08:00', title: '긍정 확언', description: '오늘의 긍정 문장 3번 반복', duration: '2분' },
        ]
    },

    [CareType.BURNOUT]: {
        title: '번아웃 회복 루틴',
        description: '번아웃에서 벗어나기 위한 일일 회복 루틴입니다.',
        routines: [
            { id: '1', time: '아침', title: '감사 일기', description: '감사한 것 3가지 적기', duration: '5분' },
            { id: '2', time: '09:00', title: '우선순위 정하기', description: '오늘 가장 중요한 일 1-3가지만 선택', duration: '10분' },
            { id: '3', time: '점심', title: '마음챙김 식사', description: '천천히 음미하며 식사하기', duration: '20분' },
            { id: '4', time: '14:00', title: '짧은 산책', description: '15분 야외 산책', duration: '15분' },
            { id: '5', time: '18:00', title: '업무 종료', description: '정시에 업무/학습 완전 종료', duration: '1분' },
            { id: '6', time: '저녁', title: '취미 활동', description: '좋아하는 활동 30분', duration: '30분' },
            { id: '7', time: '21:00', title: '디지털 디톡스', description: '스마트폰/PC 끄기', duration: '~취침' },
        ]
    },

    [CareType.SLEEP]: {
        title: '수면 위생 루틴',
        description: '양질의 수면을 위한 저녁 루틴입니다.',
        routines: [
            { id: '1', time: '19:00', title: '가벼운 저녁식사', description: '취침 3시간 전 마지막 식사', duration: '30분' },
            { id: '2', time: '20:00', title: '카페인 중단', description: '커피, 녹차, 초콜릿 금지', duration: '-' },
            { id: '3', time: '21:00', title: '조명 조절', description: '실내 조명 50% 어둡게', duration: '1분' },
            { id: '4', time: '21:30', title: '따뜻한 샤워', description: '미온수로 10분 샤워', duration: '10분' },
            { id: '5', time: '21:45', title: '이완 운동', description: '점진적 근육 이완법', duration: '10분' },
            { id: '6', time: '22:00', title: '독서', description: '가벼운 책 읽기 (스마트폰 X)', duration: '20분' },
            { id: '7', time: '22:30', title: '취침', description: '어두운 방에서 일정한 시간에 잠들기', duration: '-' },
        ]
    },
};

// ========== 워크시트 데이터 ==========
export const WORKSHEET_DATA: Partial<Record<CareType, WorksheetData>> = {
    [CareType.ANXIETY_TENSION]: {
        title: '걱정 관리 워크시트',
        description: '불안한 생각을 정리하고 재구성하는 연습입니다.',
        type: 'journal',
        prompts: [
            '지금 가장 걱정되는 일은 무엇인가요?',
            '이 걱정이 현실화될 확률은 몇 %인가요?',
            '최악의 시나리오는 무엇이고, 그것이 일어나면 어떻게 대처할 수 있나요?',
            '이 걱정을 더 현실적이고 긍정적으로 바꾸면 어떻게 표현할 수 있나요?',
            '지금 당장 통제할 수 있는 것은 무엇인가요?',
        ]
    },

    [CareType.LOW_ENERGY]: {
        title: '에너지 추적 일지',
        description: '하루 중 에너지 변화를 기록하여 패턴을 파악합니다.',
        type: 'tracker',
        prompts: [
            '오전(09:00) 에너지 레벨: 1-10',
            '점심 후(14:00) 에너지 레벨: 1-10',
            '저녁(18:00) 에너지 레벨: 1-10',
            '에너지가 가장 높았던 시간과 활동:',
            '에너지가 가장 낮았던 시간과 원인:',
            '오늘 도움이 된 것 (식사, 운동, 휴식 등):',
        ]
    },

    [CareType.DEPRESSION_AMOTIVATION]: {
        title: '감사 일기',
        description: '긍정적인 것에 집중하여 기분을 개선합니다.',
        type: 'journal',
        prompts: [
            '오늘 감사한 것 3가지:',
            '오늘 나를 웃게 만든 것:',
            '오늘 내가 잘한 것 (아무리 작아도):',
            '오늘 나에게 친절했던 사람이나 순간:',
            '내일 기대되는 것:',
        ]
    },
};
