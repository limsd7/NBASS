import { StudentInfo, CareType } from "../types";
import { 
    getLearningStrategy, 
    DetailedCareTypeStrategy, 
    DETAILED_CARETYPE_STRATEGIES,
    NeuroCognitiveProfile,
    TimeAndSessionArchitecture,
    SubjectSpecificProtocols,
    ConcentrationAndEnvironment,
    MentalAndSlumpCare
} from '../data/learningStrategies';

export interface SubjectPriorityStrategy {
    rankInfo: string;
    allocatedRatio: string;
    strategyTitle: string;
    actionPlan: string;
    goldenHourFit: string;
}

export interface StudyStrategyAnalysis {
    detailedStrategy: DetailedCareTypeStrategy;
    neuroCognitiveProfile: NeuroCognitiveProfile;
    timeArchitecture: TimeAndSessionArchitecture;
    subjectProtocols: SubjectSpecificProtocols;
    concentrationEnvironment: ConcentrationAndEnvironment;
    mentalSlumpCare: MentalAndSlumpCare;
    learningStyle: string;
    subjectStrategy: {
        korean: string;
        math: string;
        english: string;
        inquiry?: string;
        korean_history?: string;
    };
    subjectPriorityStrategies?: {
        korean: SubjectPriorityStrategy;
        math: SubjectPriorityStrategy;
        english: SubjectPriorityStrategy;
        korean_history: SubjectPriorityStrategy;
    };
    concentration: string;
    mentalCare: string;
}

export const analyzeStudyStrategy = (student: StudentInfo, careType: CareType): StudyStrategyAnalysis => {
    const detailedStrategy = getLearningStrategy(student.learningTraits || student.mbti, careType);
    const priorities = student.subjectPriorities;

    // 과목별 기본 랭크 (동일 2위 중복 방지 및 차별화)
    const defaultRanks: Record<'korean' | 'math' | 'english' | 'korean_history', { imp: number; grd: number; foc: number }> = {
        math: { imp: 1, grd: 2, foc: 1 },
        korean: { imp: 2, grd: 2, foc: 2 },
        english: { imp: 3, grd: 3, foc: 3 },
        korean_history: { imp: 4, grd: 1, foc: 4 }
    };

    // 3대 기준 우선순위 매트릭스 기반 과목별 전략 분석
    const generatePriorityStrategy = (subjectKey: 'korean' | 'math' | 'english' | 'korean_history', defaultRatio: string) => {
        const imp = priorities?.importanceRank?.[subjectKey] ?? defaultRanks[subjectKey].imp;
        const grd = priorities?.gradeRank?.[subjectKey] ?? defaultRanks[subjectKey].grd;
        const foc = priorities?.currentFocusRank?.[subjectKey] ?? defaultRanks[subjectKey].foc;

        let strategyTitle = detailedStrategy.subjectProtocols[subjectKey === 'korean_history' ? 'inquiry' : subjectKey]?.strategyTitle || '기본 균형 학습';
        let actionPlan = detailedStrategy.subjectProtocols[subjectKey === 'korean_history' ? 'inquiry' : subjectKey]?.actionPlan || '개념과 문제풀이를 5:5 비율로 일정하게 유지합니다.';
        let goldenHourFit = '오후 복습 세션 권장';
        let allocatedRatio = defaultRatio;

        if (foc === 1) {
            allocatedRatio = '35~40% (집중 몰입)';
            goldenHourFit = '🔥 골든타임 (최고 집중 시간대) 최우선 배치';
            if (grd >= 3) {
                strategyTitle = `🎯 ${detailedStrategy.careTypeName.split(' ')[0]} 맞춤 킬러 약점 극복 & 점수 점프`;
                actionPlan = `${detailedStrategy.subjectProtocols[subjectKey === 'korean_history' ? 'inquiry' : subjectKey]?.readingOrConceptMethod || ''} 킬러 문항 오답 분석과 개념 메타인지 점검에 일일 학습 시간의 40%를 집중 투자하세요.`;
            } else {
                strategyTitle = `👑 ${detailedStrategy.careTypeName.split(' ')[0]} 맞춤 최상위권 굳히기 & 만점 방어`;
                actionPlan = `${detailedStrategy.subjectProtocols[subjectKey === 'korean_history' ? 'inquiry' : subjectKey]?.killerTips || ''} 고난도 실전 모의고사와 시간 단축 훈련으로 절대적 만점을 확보하세요.`;
            }
        } else if (foc === 2) {
            allocatedRatio = '25~30% (안정 유지)';
            goldenHourFit = '오전 또는 저녁 골든 세션 배치';
            if (grd <= 2) {
                strategyTitle = '⚡ 실력 유지 & 고난도 유형 정복';
                actionPlan = '안정적인 1~2등급 유지를 위해 매일 정해진 분량의 고난도 기출 및 변형 문제를 규칙적으로 해결합니다.';
            } else {
                strategyTitle = '📈 점진적 성적 상승 보완 전략';
                actionPlan = '취약 단원 중심으로 오답 노트를 누적 관리하며 주 3회 집중 개념 인출을 실시합니다.';
            }
        } else if (foc === 3) {
            allocatedRatio = '15~20% (효율 관리)';
            goldenHourFit = '점심 식후 또는 저녁 2세션 배치';
            strategyTitle = '💡 가성비 중심 효율 유지 학습';
            actionPlan = '과도한 시간을 쓰지 않고 매일 30~45분 핵심 유형 문제풀이로 감각을 유지하는 스마트 압축 학습을 진행합니다.';
        } else {
            allocatedRatio = '5~10% (압축 정리)';
            goldenHourFit = '취침 전 또는 주말 압축 정리';
            strategyTitle = '📚 단기 압축 & 핵심 개념 점검';
            actionPlan = '주말 1~2회 개념 요약 및 기출 단권화 노트 복습으로 최적의 등급 컷을 효율적으로 방어합니다.';
        }

        return {
            rankInfo: `[중요도 ${imp}위 | 성적 ${grd}위 | 당장집중 ${foc}위]`,
            allocatedRatio,
            strategyTitle,
            actionPlan,
            goldenHourFit
        };
    };

    const subjectPriorityStrategies = {
        korean: generatePriorityStrategy('korean', '30%'),
        math: generatePriorityStrategy('math', '35%'),
        english: generatePriorityStrategy('english', '20%'),
        korean_history: generatePriorityStrategy('korean_history', '10%')
    };

    return {
        detailedStrategy,
        neuroCognitiveProfile: detailedStrategy.neuroCognitiveProfile,
        timeArchitecture: detailedStrategy.timeArchitecture,
        subjectProtocols: detailedStrategy.subjectProtocols,
        concentrationEnvironment: detailedStrategy.concentrationEnvironment,
        mentalSlumpCare: detailedStrategy.mentalSlumpCare,
        learningStyle: detailedStrategy.learningStyle,
        subjectStrategy: {
            ...detailedStrategy.subjectStrategy,
            korean_history: detailedStrategy.subjectProtocols.inquiry?.actionPlan || '한국사는 핵심 연표 및 기출 압축 노트를 활용하여 주 1~2회 단기 복습으로 절대평가 1등급 컷을 확보합니다.'
        },
        subjectPriorityStrategies,
        concentration: detailedStrategy.concentration,
        mentalCare: detailedStrategy.mentalCare,
    };
};

// =========================================================================================
// 4대 영역별 초정밀 맞춤 학습법 로드맵 동적 엔진 (Dynamic 4-Subject Cognitive Roadmap)
// =========================================================================================

export interface DynamicSubjectRoadmapItem {
    subjectKey: 'korean' | 'math' | 'english' | 'inquiry';
    subjectNameKr: string;
    subBadgeKr: string;
    englishCode: string;
    icon: string;
    isFocus: boolean;
    levelTier: 'advanced' | 'intermediate' | 'foundation';
    levelBadge: string;
    allocatedRatio: string;
    goldenHourFit: string;
    strategyTitle: string;
    actionPlan: string;
    readingOrConceptLabel: string;
    readingOrConceptMethod: string;
    problemSolvingLabel: string;
    problemSolvingMethod: string;
    killerTipsLabel: string;
    killerTips: string;
}

export type DynamicSubjectRoadmap = Record<'korean' | 'math' | 'english' | 'inquiry', DynamicSubjectRoadmapItem>;

interface SubjectLevelPreset {
    strategyTitle: string;
    actionPlan: string;
    readingOrConceptMethod: string;
    problemSolvingMethod: string;
    killerTips: string;
}

const SUBJECT_PRESETS: Record<'korean' | 'math' | 'english' | 'inquiry', Record<'advanced' | 'intermediate' | 'foundation', SubjectLevelPreset>> = {
    korean: {
        advanced: {
            strategyTitle: '리트(LEET)/고난도 제재 정복 & 시간 단축',
            actionPlan: '수능 기출을 넘어 LEET/MEET 고난도 철학, 경제, 양자역학 제재를 매일 2지문씩 논리 독해합니다.',
            readingOrConceptMethod: '지문의 모든 논리적 비약과 숨겨진 전제를 찾아내는 비판적 독해(Critical Reading)를 훈련합니다.',
            problemSolvingMethod: '45문항을 65분 안에 만점으로 풀어내는 극한의 실전 타임어택 시뮬레이션을 실행합니다.',
            killerTips: '오답 선지의 출제 원리를 역으로 분석하여 내가 직접 평가원식 함정 문제를 출제해봅니다.'
        },
        intermediate: {
            strategyTitle: '평가원 기출 구조 독해 & 문학/화작 시간 단축',
            actionPlan: 'EBS 연계 문학을 100% 장악하고, 최근 5개년 평가원 독서 기출 제재별 3회독 정밀 분석을 실시합니다.',
            readingOrConceptMethod: '문단마다 핵심 문장에 밑줄 치고 여백에 1줄 요약 메모를 남기는 구조 독해 습관을 정착합니다.',
            problemSolvingMethod: '문학+선택과목(화작/언매)을 35분 컷으로 해결하여 비문학 독서에 최소 45분을 확보합니다.',
            killerTips: '틀린 문제는 지문 속 근거 문장에 형광펜 매칭을 하고, "왜 이 선지가 오답인가"를 스스로 증명합니다.'
        },
        foundation: {
            strategyTitle: '국어 필수 개념어 완성 & 문단 중심 기본기 확립',
            actionPlan: '수능 국어 필수 개념어 100선 체화 및 하루 1~2개 기본 지문을 시간제한 없이 정독합니다.',
            readingOrConceptMethod: '문장 단위로 끊어 읽고, 한 문단을 다 읽은 후 "이 문단에서 말한 핵심"을 입으로 말해봅니다.',
            problemSolvingMethod: '시간 압박을 받지 말고, 지문 속에서 정답의 명확한 문장 근거를 찾는 1:1 매칭 훈련을 합니다.',
            killerTips: '모르는 어휘는 문맥으로 유추 후 별도 어휘 수첩에 기록하여 주말마다 누적 복습합니다.'
        }
    },
    math: {
        advanced: {
            strategyTitle: '킬러 문항(22/30번) 30분 깊은 생각 & 다각적 풀이',
            actionPlan: '해설지를 절대 보지 않고 최고난도 킬러 1문제를 20~30분 이상 깊이 고민하여 자력으로 뚫어냅니다.',
            readingOrConceptMethod: '하나의 문제를 기하적 접근, 대수적 접근, 미적분적 접근 등 2~3가지 다른 방식으로 풀어냅니다.',
            problemSolvingMethod: '나만의 수학 개념 체계도와 킬러 알고리즘 공책을 완성하여 만점 방어벽을 구축합니다.',
            killerTips: '친구들에게 고난도 문제를 논리정연하게 설명해주는 티칭 학습으로 개념의 완벽한 100% 체화를 이룹니다.'
        },
        intermediate: {
            strategyTitle: '4점 준킬러 유형 마스터 & 3점 전 문항 무결점 검산',
            actionPlan: '2·3점 기본 문항 48점 완벽 확보 + 자주 출제되는 4점 준킬러 빈출 유형(수열, 미적 등)을 집중 공략합니다.',
            readingOrConceptMethod: '공식 암기에 그치지 않고, 공식 유도 과정과 성립 조건(분모≠0, 정의역 범위 등)을 꼼꼼히 확인합니다.',
            problemSolvingMethod: '풀이 과정을 연습장에 번호(①, ②, ③) 매기며 질서정연하게 써내려가 계산 실수를 완벽 차단합니다.',
            killerTips: '자주 틀리는 단원의 대표 기출 10문제를 해설지 없이 100% 손으로 재현하는 백지 복습을 실행합니다.'
        },
        foundation: {
            strategyTitle: '교과서 기본 개념 백지 유도 & 2·3점 문항 100% 정복',
            actionPlan: '기본 개념서(개념원리/수학의 바이블 등) 예제와 유제를 막힘없이 풀 때까지 3회 반복 훈련합니다.',
            readingOrConceptMethod: '단원별 핵심 공식과 정의를 빈 종이에 스스로 유도하고 소리 내어 원리를 설명합니다.',
            problemSolvingMethod: '과도한 4점 고난도 문항은 잠시 미뤄두고, 2점·3점 문항 16개를 100% 맞히는 기초 체력을 완성합니다.',
            killerTips: '해설지를 보고 이해한 문제는 30분 뒤 해설지를 덮고 백지에 처음부터 끝까지 자력으로 다시 풉니다.'
        }
    },
    english: {
        advanced: {
            strategyTitle: '원서 에세이/철학 원문 독해 & 빈칸 만점 굳히기',
            actionPlan: 'EBS 연계를 넘어 인문/사회 철학 원서 지문을 독해하며 어휘력과 구문 해석력을 대학 수준으로 올립니다.',
            readingOrConceptMethod: '빈칸 추론 31~34번을 6분 안에 모두 정답 처리하는 절대적 독해 속도를 완성합니다.',
            problemSolvingMethod: '모든 오답 선지의 매력적 함정 포인트를 1초 만에 분석하여 완벽 소거합니다.',
            killerTips: '안정적인 100점을 위해 수능 당일 어떤 돌발 난이도가 나와도 흔들리지 않는 멘탈을 유지합니다.'
        },
        intermediate: {
            strategyTitle: '수능 빈출 구문 마스터 & 대의 파악 100% 정답률 달성',
            actionPlan: '매일 수능 필수 어휘 50개(다의어 포함) 암기 및 하루 5지문 핵심 문장 구조 분석을 진행합니다.',
            readingOrConceptMethod: '복잡한 수식어구에 괄호를 치고 주어(S)-동사(V)-목적어(O) 뼈대 문장을 1초 만에 찾아내는 구문 독해를 체화합니다.',
            problemSolvingMethod: '듣기 17문항 만점 + 18~28번(대의/안내문/도표) 무결점 정답으로 기본 65점을 확실히 확보합니다.',
            killerTips: 'However, But, Therefore 등 역접/결론 연결사 뒤에 오는 문장에 형광펜을 긋고 주제문으로 직결합니다.'
        },
        foundation: {
            strategyTitle: '수능 듣기 17문항 올킬(37점) & 중고 필수 기초 어휘 2,000개',
            actionPlan: '매일 영어 듣기 1세트(1.2배속 청취 훈련)와 기초 어휘 40개를 매일 암기하여 듣기와 기본 해석을 정복합니다.',
            readingOrConceptMethod: '단어를 눈으로만 보지 않고 음원을 들으며 입으로 소리 내어 말하는 다중 감각 암기를 실행합니다.',
            problemSolvingMethod: '어려운 빈칸 추론은 과감히 뒤로 넘기고, 듣기(37점)와 일치/불일치/실용문(20점)을 먼저 공략합니다.',
            killerTips: '아는 단어 조합으로 짐작하지 말고, 문장의 주어와 본동사를 정확히 찾아 해석하는 습관을 들입니다.'
        }
    },
    inquiry: {
        advanced: {
            strategyTitle: '신유형 킬러 도표 자체 제작 & 전 단원 만점 굳히기',
            actionPlan: '시중 모든 고난도 N제와 사설 모의고사를 섭렵하며 신유형 자료 해석 킬러를 완벽 정복합니다.',
            readingOrConceptMethod: '개념의 사소한 예외 사항과 각주까지 완벽히 숙지하여 지엽 낚시 가능성을 0%로 만듭니다.',
            problemSolvingMethod: '30분 시험을 18분 컷으로 풀고 남은 12분 동안 2번 전수 검산하는 무결점 루틴을 체화합니다.',
            killerTips: '내가 약한 0.1%의 빈틈을 찾아내어 메타인지 오답 바인더에 누적 관리합니다.'
        },
        intermediate: {
            strategyTitle: '전 단원 개념 단권화 완성 & 평가원 5개년 기출 N회독',
            actionPlan: '대단원별 마인드맵을 백지에 스스로 구조화하고, 기출 킬러 유형(유전/역학 등)을 유형별로 분석합니다.',
            readingOrConceptMethod: '개념서와 수능특강을 단권화 노트 한 권에 압축 정리하여 시험 직전까지 반복 회독합니다.',
            problemSolvingMethod: '비킬러 16문항을 13분 안에 실수 없이 풀고, 킬러 4문항에 최소 15분을 분배합니다.',
            killerTips: '선지 분석 시 틀린 이유를 여백에 펜으로 직접 고쳐 쓰고, 함정 키워드를 형광펜으로 체크합니다.'
        },
        foundation: {
            strategyTitle: '탐구 핵심 개념 80선 체화 & 2점 기본 문항 100% 정답',
            actionPlan: 'EBS 개념 기본 강의를 완강하고, 단원별 2점짜리 기본 개념 확인 문제를 3회 반복 풀이합니다.',
            readingOrConceptMethod: '전문 용어와 정의, 주요 실험 과정과 결과를 소리 내어 설명할 수 있을 때까지 암기합니다.',
            problemSolvingMethod: '복잡한 계산형 킬러는 과감히 넘기고, 개념 확인형 2~3점 기본 문항을 100% 맞히는 전략을 취합니다.',
            killerTips: '매일 취침 전 15분 동안 당일 공부한 개념 요약 노트를 가볍게 훑어보고 잠드는 수면 연동 복습을 합니다.'
        }
    }
};

/**
 * 학생의 취약 과목, 우선순위, 성적대, 그리고 CareType 생체 피로도를 결합하여
 * 4대 영역별 초정밀 맞춤 로드맵을 완전히 동적으로 생성합니다.
 */
export const getDynamicSubjectRoadmap = (
    student: StudentInfo,
    careType: CareType,
    gradeHistory?: any[]
): DynamicSubjectRoadmap => {
    const weakSubj = (student.weakSubject || '').toLowerCase();
    const focusList = (student.focusSubjects || []).map(s => s.toLowerCase());

    const subjects: Array<'korean' | 'math' | 'english' | 'inquiry'> = ['korean', 'math', 'english', 'inquiry'];

    const getSubjectLevel = (subj: 'korean' | 'math' | 'english' | 'inquiry', isFocus: boolean): 'advanced' | 'intermediate' | 'foundation' => {
        // 1. 성적 이력 기반 판별
        if (gradeHistory && Array.isArray(gradeHistory) && gradeHistory.length > 0) {
            const latest = gradeHistory[0];
            const matchingSubject = (latest.subjects || []).find((s: any) => {
                const sid = (s.subjectId || '').toLowerCase();
                return sid === subj || (subj === 'inquiry' && (sid.includes('inquiry') || sid.includes('science') || sid.includes('social') || sid.includes('history')));
            });
            if (matchingSubject && typeof matchingSubject.grade === 'number') {
                if (matchingSubject.grade <= 2) return 'advanced';
                if (matchingSubject.grade <= 4) return 'intermediate';
                return 'foundation';
            }
        }

        // 2. 과목 우선순위(gradeRank) 기반 판별
        const pKey = subj === 'inquiry' ? 'korean_history' : subj;
        const gradeRank = student.subjectPriorities?.gradeRank?.[pKey];
        if (gradeRank) {
            if (gradeRank === 1) return isFocus ? 'intermediate' : 'advanced';
            if (gradeRank === 2) return 'intermediate';
            return isFocus ? 'foundation' : 'intermediate';
        }

        // 3. 기본 폴백: 취약 과목으로 선택된 경우 무리한 킬러를 피하고 중위권 실전 도약 배정
        if (isFocus) {
            return 'intermediate';
        }

        // 건강형인 경우 일반 과목은 고난도 만점 굳히기, 그 외 케어타입은 중위권 유지
        return careType === CareType.HEALTHY ? 'advanced' : 'intermediate';
    };

    const getCareTypeNuance = (careType: CareType): string => {
        switch (careType) {
            case CareType.BURNOUT:
            case CareType.STRESS_OVERLOAD:
                return ' (※ 과긴장 번아웃 두뇌 케어: 세션당 25분 초과 금지, 피로 시 3분 암흑 이완)';
            case CareType.ATTENTION_DEFICIT:
                return ' (※ 도파민 집중 케어: 시작 전 스마트폰 물리 격리 & 20분 퀘스트 달성 보상)';
            case CareType.BRAIN_FATIGUE:
            case CareType.LOW_ENERGY:
            case CareType.ADRENAL:
                return ' (※ 뇌피로·저에너지 완화: 식후 졸림 방지 스탠딩 모드 & 15분 파워낮잠 준수)';
            case CareType.ANXIETY_TENSION:
                return ' (※ 시험불안 안정: 문제 풀이 전 1분 4-7-8 생체 이완 호흡으로 교감신경 안정화)';
            default:
                return '';
        }
    };

    const careNuance = getCareTypeNuance(careType);

    const result: Partial<DynamicSubjectRoadmap> = {};

    const metaInfo: Record<'korean' | 'math' | 'english' | 'inquiry', { name: string; subBadge: string; code: string; icon: string; readLabel: string; probLabel: string }> = {
        korean: { name: '국어', subBadge: '1교시 최적화', code: 'KOREAN', icon: '📖', readLabel: '🔍 독해:', probLabel: '⚡ 풀이:' },
        math: { name: '수학', subBadge: '킬러 정복', code: 'MATH', icon: '📐', readLabel: '🔍 개념:', probLabel: '⚡ 풀이:' },
        english: { name: '영어', subBadge: '절대평가 1등급', code: 'ENGLISH', icon: '🌐', readLabel: '🔍 어휘:', probLabel: '⚡ 대의:' },
        inquiry: { name: '탐구', subBadge: '단권화 만점', code: 'INQUIRY', icon: '🔬', readLabel: '🔍 백지:', probLabel: '⚡ 기출:' },
    };

    // 단일 최우선 집중 과목 결정: weakSubject > focusList[0] > currentFocusRank 1위
    const primaryFocusSubj = (weakSubj && subjects.includes(weakSubj as any))
        ? weakSubj
        : (focusList.find(f => subjects.includes(f as any)))
            ? focusList.find(f => subjects.includes(f as any))
            : subjects.find(s => {
                const pKey = s === 'inquiry' ? 'korean_history' : s;
                return student.subjectPriorities?.currentFocusRank?.[pKey] === 1;
            }) || 'math';

    subjects.forEach((subj) => {
        const pKey = subj === 'inquiry' ? 'korean_history' : subj;
        const isFocus = subj === primaryFocusSubj;
        const levelTier = getSubjectLevel(subj, isFocus);
        const preset = SUBJECT_PRESETS[subj][levelTier];
        const meta = metaInfo[subj];

        const levelBadge = levelTier === 'advanced' 
            ? '최상위 킬러 정복 (1~2등급)'
            : levelTier === 'intermediate'
                ? '빈출 유형 도약 (3~4등급)'
                : '기본 개념 완성 (5등급 이하)';

        const allocatedRatio = isFocus
            ? '35~40% (최우선 집중)'
            : subj === 'math'
                ? '25~30% (안정 유지)'
                : subj === 'korean'
                    ? '20~25% (균형 유지)'
                    : '15~20% (가성비 압축)';

        const goldenHourFit = isFocus
            ? '🔥 1차 골든아워(최고 인지력 시간대) 최우선 배치'
            : '2차 골든아워 또는 오후 복습 세션 권장';

        result[subj] = {
            subjectKey: subj,
            subjectNameKr: meta.name,
            subBadgeKr: meta.subBadge,
            englishCode: meta.code,
            icon: meta.icon,
            isFocus,
            levelTier,
            levelBadge,
            allocatedRatio,
            goldenHourFit,
            strategyTitle: preset.strategyTitle,
            actionPlan: preset.actionPlan,
            readingOrConceptLabel: meta.readLabel,
            readingOrConceptMethod: preset.readingOrConceptMethod,
            problemSolvingLabel: meta.probLabel,
            problemSolvingMethod: preset.problemSolvingMethod,
            killerTipsLabel: '💡 팁:',
            killerTips: `${preset.killerTips}${isFocus ? careNuance : ''}`
        };
    });

    return result as DynamicSubjectRoadmap;
};

/**
 * 학생의 등록 프로필(취약 과목, 3대 우선순위 랭크, 선택 탐구 과목)을 기반으로
 * 과목별 권장 학습시간 배분율(%)을 동적으로 산출하는 함수.
 * Free 모드 및 학습 밀도 검사 미시행 상태에서 하드코딩 더미값 대신 맞춤 AI 추천값으로 사용됩니다.
 */
export const calculateRecommendedSubjectRatios = (
    student?: Partial<StudentInfo> | null
): {
    korean: number;
    math: number;
    english: number;
    science: number;
    social: number;
    other: number;
} => {
    // 1. 1순위 집중 과목 선정 (currentFocusRank 1위 > weakSubject > focusSubjects[0] > 기본값 'math')
    const priorities = student?.subjectPriorities;
    const focusRank = priorities?.currentFocusRank;

    let primary: 'korean' | 'math' | 'english' = 'math';
    let secondary: 'korean' | 'math' | 'english' = 'korean';
    let tertiary: 'korean' | 'math' | 'english' = 'english';

    if (focusRank) {
        const sorted = (['korean', 'math', 'english'] as const).slice().sort(
            (a, b) => (focusRank[a] ?? 99) - (focusRank[b] ?? 99)
        );
        primary = sorted[0];
        secondary = sorted[1];
        tertiary = sorted[2];
    } else if (student?.weakSubject && ['korean', 'math', 'english'].includes(student.weakSubject)) {
        primary = student.weakSubject as 'korean' | 'math' | 'english';
        if (primary === 'math') {
            secondary = 'korean';
            tertiary = 'english';
        } else if (primary === 'korean') {
            secondary = 'math';
            tertiary = 'english';
        } else {
            secondary = 'math';
            tertiary = 'korean';
        }
    } else if (student?.focusSubjects && student.focusSubjects.length > 0) {
        const firstFocus = student.focusSubjects[0];
        if (firstFocus === 'korean' || firstFocus === 'math' || firstFocus === 'english') {
            primary = firstFocus;
            if (primary === 'math') {
                secondary = 'korean';
                tertiary = 'english';
            } else if (primary === 'korean') {
                secondary = 'math';
                tertiary = 'english';
            } else {
                secondary = 'math';
                tertiary = 'korean';
            }
        }
    }

    // 2. 탐구 과목 선택 분석 (과학탐구 vs 사회탐구)
    const selected = student?.selectedSubjects || [];
    const scienceKeywords = ['physics', 'chemistry', 'life_science', 'earth_science', 'bio', 'earth'];
    const socialKeywords = ['ethics', 'geography', 'history', 'economics', 'politics', 'social'];

    const hasScience = selected.some(s => scienceKeywords.some(k => s.toLowerCase().includes(k))) ||
        (student?.focusSubjects || []).some(s => scienceKeywords.some(k => s.toLowerCase().includes(k)));
    const hasSocial = selected.some(s => socialKeywords.some(k => s.toLowerCase().includes(k))) ||
        (student?.focusSubjects || []).some(s => socialKeywords.some(k => s.toLowerCase().includes(k)));

    // 탐구 15% 배분
    let scienceRatio = 10;
    let socialRatio = 5;

    if (hasScience && !hasSocial) {
        scienceRatio = 15;
        socialRatio = 0;
    } else if (!hasScience && hasSocial) {
        scienceRatio = 0;
        socialRatio = 15;
    } else if (hasScience && hasSocial) {
        scienceRatio = 8;
        socialRatio = 7;
    } else {
        // 둘 다 선택하지 않은 경우(Free 모드 기본 등): 국영수 중심 및 기본 탐구 배분
        scienceRatio = 10;
        socialRatio = 5;
    }

    // 3. 국영수 배분 (합산 80%, 전체 합산 100%)
    let primaryRatio = 35;
    let secondaryRatio = 30;
    let tertiaryRatio = 15;

    if (primary === 'math') {
        primaryRatio = 40;
        secondaryRatio = 25;
        tertiaryRatio = 15;
    } else {
        // 국어 또는 영어가 1순위 집중 과목인 경우
        primaryRatio = 35;
        secondaryRatio = 30;
        tertiaryRatio = 15;
    }

    const ratios: {
        korean: number;
        math: number;
        english: number;
        science: number;
        social: number;
        other: number;
    } = {
        korean: 0,
        math: 0,
        english: 0,
        science: scienceRatio,
        social: socialRatio,
        other: 5
    };

    ratios[primary] = primaryRatio;
    ratios[secondary] = secondaryRatio;
    ratios[tertiary] = tertiaryRatio;

    return ratios;
};

