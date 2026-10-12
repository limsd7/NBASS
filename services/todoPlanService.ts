import { AssessmentResult } from '../types';
import { PNT_PRODUCTS, getStandard6ProductLineup } from '../data/pntProducts';

export interface DailyTodoItem {
    id: string;
    category: 'circadian' | 'study' | 'nutrition' | 'mental';
    timing: string; // e.g., '기상 직후', '점심 식후', '공부 시작 5분 전'
    title: string;
    description: string;
    scientificEffect: string; // 과학적 근거/효과
    isCore?: boolean;
}

export interface DailyTodoGroup {
    categoryKey: 'circadian' | 'study' | 'nutrition' | 'mental';
    categoryTitle: string;
    categorySubtitle: string;
    icon: string;
    badgeColor: string;
    items: DailyTodoItem[];
}

/**
 * 피검자의 AssessmentResult 및 영양제 처방 데이터를 기반으로
 * 100% 맞춤형 1일 실행 To-Do 체크리스트를 생성합니다.
 */
export const generateDailyTodoPlan = (
    result: AssessmentResult,
    recommendedProducts: any[] = []
): DailyTodoGroup[] => {
    const student: any = result.student || {};
    const analytics: any = result.analytics || {};
    const hrv: any = result.hrv || {};

    // 1. 골든타임 계산 (ResultsView와 100% 동기화)
    let goldenStartNum = 14;
    if (analytics?.goldenTimeStart) {
        const parsed = parseInt(analytics.goldenTimeStart.split(':')[0], 10);
        if (!isNaN(parsed)) goldenStartNum = parsed;
    }
    let goldenEndNum = goldenStartNum + 2;
    if (hrv?.brainScore && hrv.brainScore > 70) {
        goldenEndNum += 1;
    }
    const goldenTimeStr = `${String(goldenStartNum).padStart(2, '0')}:00 ~ ${String(goldenEndNum).padStart(2, '0')}:00`;

    // 2. 취약 과목 또는 중점 과목
    const weakSubject = student.weakSubject ? student.weakSubject.toUpperCase() : '취약 과목';

    // 3. 영양제 처방 아이템 추출 (대시보드 및 보고서와 100% 동기화)
    const standardLineup = getStandard6ProductLineup(recommendedProducts, result.careType);
    const { p1, p2, p3, p4 } = standardLineup;

    // --- 그룹 1: 🌅 생체리듬 시간대별 루틴 (각각 독립된 행동 단위) ---
    const circadianItems: DailyTodoItem[] = [
        {
            id: 'circadian-morning-sun',
            category: 'circadian',
            timing: '아침 기상 직후',
            title: '10분 자연 햇빛 쬐기',
            description: '창문을 열거나 가벼운 바깥 산책으로 자연광을 망막에 전달합니다.',
            scientificEffect: '세로토닌 합성 촉진 및 코르티솔 정상 분비로 뇌 각성',
            isCore: true
        },
        {
            id: 'circadian-morning-water',
            category: 'circadian',
            timing: '아침 기상 직후',
            title: '미온수 300ml 한 잔 천천히 마시기',
            description: '찬물 대신 체온과 비슷한 미온수를 1~2분에 걸쳐 음용합니다.',
            scientificEffect: '수면 중 탈수 해소, 뇌 혈류 순환 개시 및 위장 연동 활성화',
            isCore: true
        },
        {
            id: 'circadian-lunch-walk',
            category: 'circadian',
            timing: '점심 식후',
            title: '15분 가벼운 햇빛 산책하기',
            description: '식후 바로 앉아있지 않고 완만한 보폭으로 15분간 야외를 걷습니다.',
            scientificEffect: '혈당 스파이크 차단, 오후 식곤증 예방 및 두뇌 혈류 산소 공급',
            isCore: true
        },
        {
            id: 'circadian-night-blue-block',
            category: 'circadian',
            timing: '취침 1시간 전',
            title: '스마트폰 및 블루라이트 전면 차단',
            description: '취침 전 휴대폰을 침대 밖 3m 이상 먼 곳에 두고 화면을 보지 않습니다.',
            scientificEffect: '수면 유도 호르몬인 멜라토닌 분비 억제 방지',
            isCore: true
        },
        {
            id: 'circadian-night-dark-env',
            category: 'circadian',
            timing: '취침 30분 전',
            title: '침실 완전 암막 & 실내 온도 20~22℃ 조성',
            description: '미세 조명을 끄고 암막 커튼을 치며 쾌적한 수면 환경을 만듭니다.',
            scientificEffect: '심부 체온 하강 유도로 델타파(서파 깊은 수면) 진입 가속',
            isCore: false
        }
    ];

    // --- 그룹 2: 🧠 인지 학습 & 골든타임 루틴 (각각 독립된 행동 단위) ---
    const studyItems: DailyTodoItem[] = [
        {
            id: 'study-pre-declutter',
            category: 'study',
            timing: '공부 시작 5분 전',
            title: '책상 위 시각적 방해물 치우기 & 스마트폰 격리',
            description: '당장 공부할 과목의 책 1권만 남기고 주변 시각 자극을 모두 제거합니다.',
            scientificEffect: '전두엽의 주의 분산 억제 및 작업기억 용량(Working Memory) 보호',
            isCore: true
        },
        {
            id: 'study-pre-breathing',
            category: 'study',
            timing: '공부 시작 직전',
            title: '3분 알파파 복식 호흡 & 뇌 예열',
            description: '눈을 감고 4초 들이쉬고 6초 천천히 내쉬며 뇌에 산소를 공급합니다.',
            scientificEffect: '교감신경 긴장 완화 및 인지 몰입에 최적화된 알파파(8~12Hz) 유도',
            isCore: true
        },
        {
            id: 'study-golden-focus',
            category: 'study',
            timing: `피크 골든타임 (${goldenTimeStr})`,
            title: `최고 집중 구간에 [${weakSubject}] 킬러/고난도 과목 배치`,
            description: '두뇌 가동력이 최고조에 달하는 골든타임에 가장 어려운 핵심 과제를 수행합니다.',
            scientificEffect: '주의집중 유지력 40% 향상 및 복합 추론 신경망 최대 활성화',
            isCore: true
        },
        {
            id: 'study-pomodoro-relax',
            category: 'study',
            timing: '공부 중 (매 50분 후)',
            title: '50분 몰입 후 10분 완전 이완 (스마트폰 금지)',
            description: '쉬는 시간 스마트폰을 보지 않고 눈을 감거나 먼 곳을 바라보며 멍때립니다.',
            scientificEffect: '디폴트 모드 네트워크(DMN) 활성화로 방금 학습한 단기기억의 장기 부호화',
            isCore: false
        }
    ];

    // --- 그룹 3: 💊 맞춤 영양제 복용 루틴 (처방전과 100% 동기화) ---
    const nutritionItems: DailyTodoItem[] = [];

    // 1. HL 스마트 부스터 (공부 시작 전 / 기상 후)
    if (p2) {
        nutritionItems.push({
            id: 'nutrition-hl-booster',
            category: 'nutrition',
            timing: '기상 직후 또는 공부 시작 30분 전',
            title: `${p2.name} 1포 복용`,
            description: '물에 타서 시원하게 음용합니다. (아르기닌 2,600mg + 카르니틴 1,200mg)',
            scientificEffect: '산화질소(NO) 생성 촉진으로 뇌 혈류 확장 및 저자극 두뇌 각성',
            isCore: true
        });
    }

    // 2. 추천 영양제 (엔오카디징코 등 - 오전/점심 식후)
    if (p3) {
        nutritionItems.push({
            id: 'nutrition-recommended',
            category: 'nutrition',
            timing: p3.timing || '오전 식후',
            title: `${p3.name} 1정 복용`,
            description: `${p3.subName || '기억력 개선 & 혈행 개선 (은행잎추출물)'}`,
            scientificEffect: '미세 뇌혈류 순환 강화 및 해마 장기기억 고착 지원',
            isCore: true
        });
    }

    // 3. 핵심 필수 영양제 (마그네슘 캡슐 등 - 저녁 식후)
    if (p1 && p1.id !== p2?.id) {
        nutritionItems.push({
            id: 'nutrition-essential',
            category: 'nutrition',
            timing: p1.timing || '저녁 식후',
            title: `${p1.name} 1회 복용`,
            description: `${p1.subName || '신경/근육 기능 유지 & 에너지 이용'}`,
            scientificEffect: '신경전달물질 GABA 수용체 안정화, 근육 긴장 이완 및 수면 질 개선',
            isCore: true
        });
    }

    // 4. 보조 영양제 (알티지 오메가3 또는 종합 비타민)
    if (p4 && p4.id !== p1?.id && p4.id !== p3?.id) {
        nutritionItems.push({
            id: 'nutrition-supportive',
            category: 'nutrition',
            timing: p4.timing || '점심 식후',
            title: `${p4.name} 1회 복용`,
            description: `${p4.subName || '두뇌 세포막 보호 및 인지 건강 지원'}`,
            scientificEffect: '신경 세포막 유연성 유지 및 시각/신경계 항산화 보호',
            isCore: false
        });
    }

    // --- 그룹 4: 🌿 멘탈 회복 & 마인드셋 루틴 ---
    const mentalItems: DailyTodoItem[] = [
        {
            id: 'mental-reset-breathing',
            category: 'mental',
            timing: '불안/집중 저하 발생 시',
            title: '4-7-8 이완 호흡 3세트 진행하기',
            description: '4초 코로 흡기, 7초 숨 멈춤, 8초 입으로 서서히 호기 (3회 반복)',
            scientificEffect: '미주신경 자극을 통한 심박수 안정화 및 과도한 교감신경 억제',
            isCore: true
        },
        {
            id: 'mental-daily-closure',
            category: 'mental',
            timing: '하루 공부 종료 직후 / 취침 전',
            title: '오늘 완수한 "가장 의미 있는 공부 1가지" 셀프 칭찬 기록',
            description: '플래너나 메모장에 오늘 잘 해낸 점 1가지를 적고 스스로를 격려합니다.',
            scientificEffect: '도파민 보상 회로 작동으로 학습 효능감 고취 및 번아웃 예방',
            isCore: true
        }
    ];

    return [
        {
            categoryKey: 'circadian',
            categoryTitle: '생체리듬 시간대별 루틴',
            categorySubtitle: '빛·수분·온도를 이용한 자연적 두뇌 각성 및 숙면 사이클',
            icon: '🌅',
            badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
            items: circadianItems
        },
        {
            categoryKey: 'study',
            categoryTitle: '인지 학습 & 골든타임 루틴',
            categorySubtitle: '두뇌 최적 가동 시간대 집중 및 작업기억 보호 전략',
            icon: '🧠',
            badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
            items: studyItems
        },
        {
            categoryKey: 'nutrition',
            categoryTitle: '1:1 맞춤 영양제 복용 루틴',
            categorySubtitle: '정밀 진단 처방과 100% 동기화된 두뇌 대사 & 수면 영양 프로토콜',
            icon: '💊',
            badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
            items: nutritionItems
        },
        {
            categoryKey: 'mental',
            categoryTitle: '자율신경 회복 & 멘탈 리셋 루틴',
            categorySubtitle: '시험 불안·뇌피로 급증 시 신속 이완 및 지속적 학습 동기 관리',
            icon: '🌿',
            badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
            items: mentalItems
        }
    ];
};

/**
 * 플래너, 카카오톡(나에게 보내기), 메모장 등에 매일 복사해서 쓸 수 있도록
 * 깔끔한 텍스트 포맷으로 변환합니다.
 */
export const generateTodoCopyText = (
    groups: DailyTodoGroup[],
    studentName: string = '학생',
    dateStr: string = new Date().toISOString().split('T')[0]
): string => {
    let text = `📋 [NBASS 1일 뉴로-실천 To-Do 플래너]\n`;
    text += `👤 피검자: ${studentName} | 📅 일시: ${dateStr}\n`;
    text += `💡 매일 아침 본 목록을 복사하여 체크하며 실천해보세요!\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    groups.forEach((group) => {
        text += `${group.icon} ${group.categoryTitle}\n`;
        group.items.forEach(item => {
            text += `[ ] [${item.timing}] ${item.title}\n`;
            text += `    └ 팁: ${item.description}\n`;
        });
        text += `\n`;
    });

    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🎯 "작은 루틴의 꾸준한 실천이 뇌의 구조와 성적을 변화시킵니다."\n`;
    text += `Official NBASS Neuro-Academic Strategy System`;

    return text;
};
