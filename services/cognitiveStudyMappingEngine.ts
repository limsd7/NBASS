/**
 * 인지검사 결과(작업기억/억제통제/인지유연성) ↔ 과목별 초정밀 맞춤 공부법 매핑 엔진
 */

import { CareType, CognitiveSubjectAdaptation } from '../types';
import { CognitivePerformanceResults } from '../components/CognitivePerformanceAssessment';

export interface CognitiveAnalysisSummary {
    workingMemory: {
        score: number;
        level: 'OPTIMAL' | 'MODERATE' | 'VULNERABLE';
        statusText: string;
    };
    inhibitoryControl: {
        score: number;
        level: 'OPTIMAL' | 'MODERATE' | 'VULNERABLE';
        statusText: string;
    };
    cognitiveFlexibility: {
        score: number;
        level: 'OPTIMAL' | 'MODERATE' | 'VULNERABLE';
        statusText: string;
    };
    subjectAdaptations: CognitiveSubjectAdaptation[];
    examVerificationRoutine: string[];
    interventionGuide: string;
}

/**
 * 인지검사 데이터를 바탕으로 과목별 맞춤 공부법 조정 지침을 동적으로 생성합니다.
 */
export const generateCognitiveStudyAdaptations = (
    cognitiveResults?: CognitivePerformanceResults,
    careType: CareType = CareType.HEALTHY,
    baselineResults?: CognitivePerformanceResults // 4주 전 사전 검사 데이터
): CognitiveAnalysisSummary => {
    // 기본 인지 점수 추출 (미검사 시 75점 기본값)
    const wmScore = Math.round(
        cognitiveResults?.workingMemory?.overallScore ?? 
        (cognitiveResults?.workingMemory?.nBack1?.accuracy ?? 75)
    );

    const stroopScore = Math.round(
        cognitiveResults?.attention?.accuracy ?? 75
    );

    const speedScore = Math.round(
        cognitiveResults?.processingSpeed?.averageAccuracy ?? 75
    );

    const getLevel = (s: number): 'OPTIMAL' | 'MODERATE' | 'VULNERABLE' => {
        if (s >= 80) return 'OPTIMAL';
        if (s >= 65) return 'MODERATE';
        return 'VULNERABLE';
    };

    const wmLevel = getLevel(wmScore);
    const stroopLevel = getLevel(stroopScore);
    const flexLevel = getLevel(speedScore);

    const subjectAdaptations: CognitiveSubjectAdaptation[] = [];

    // 1. 작업기억(Working Memory) 기반 과목 공부법 매핑
    subjectAdaptations.push({
        cognitiveDomain: 'workingMemory',
        domainScore: wmScore,
        level: wmLevel,
        subjectProtocols: {
            math: {
                actionName: wmLevel === 'VULNERABLE' ? 'Working Memory Offload (단계별 중간식 필사법)' : '복합 연산 암산 고속화',
                technique: wmLevel === 'VULNERABLE' 
                    ? '암산으로 두 단계를 한 번에 처리하려 하지 말고, 수식의 중간 전개 과정을 줄바꿈하여 반드시 여백에 기록하세요. 뇌의 작업기억 부하를 펜 끝으로 덜어내야 계산 실수를 방지할 수 있습니다.'
                    : '조건을 정리한 후 핵심 알고리즘 2단계를 머릿속으로 시뮬레이션하고 간결하게 전개하세요.',
                caution: '머릿속으로 식을 암산하다가 조건을 누락하는 행위 절대 금지'
            },
            korean: {
                actionName: wmLevel === 'VULNERABLE' ? 'Chunking 3단어 키워드 독해법' : '문맥 구조화 통독법',
                technique: wmLevel === 'VULNERABLE'
                    ? '긴 지문을 읽을 때 정보 과부하가 오므로, 각 문단을 읽고 [핵심 명사 3개]에 네모 박스를 치며 정보를 묶음(Chunking)으로 기억하세요.'
                    : '문단 간 유기적 연결고리(접속사, 반전)를 파악하며 거시적 구조를 스케치하세요.',
                caution: '지문 전체를 암기하려 하지 말고 핵심어 3개 앵커를 활용할 것'
            },
            english: {
                actionName: wmLevel === 'VULNERABLE' ? 'Syntactic Slashing (구문 분절 독해)' : '속독 직독직해',
                technique: wmLevel === 'VULNERABLE'
                    ? '3줄 이상의 장문은 주어(/), 본동사(//), 관계사절([])로 빗금을 그어 작업기억의 단기 저장 공간을 단계별로 비워가며 해석하세요.'
                    : '문장 단위의 의미 덩어리를 눈으로 스캔하며 실전 리듬을 유지하세요.',
                caution: '뒤에서부터 거꾸로 번역하여 작업기억을 과부하시키지 말 것'
            },
            inquiry: {
                actionName: wmLevel === 'VULNERABLE' ? 'Feynman 백지 인출 도표화' : '핵심 개념 마인드맵',
                technique: wmLevel === 'VULNERABLE'
                    ? '용어와 정의를 단순 암기하지 말고, 2개 개념의 [공통점 vs 차이점]을 2열 표로 직접 그려 정리하세요.'
                    : '단원 전체의 연계 관계를 단권화 노트에 유기적으로 연결하세요.',
                caution: '눈으로만 읽는 수동적 복습 지양'
            }
        },
        examRoutineAdvice: wmLevel === 'VULNERABLE'
            ? '시험 시작 전, 잊기 쉬운 공식이나 키워드를 시험지 여백에 즉시 적어두는 "Brain Dump"를 실행하세요.'
            : '시험 시작 1분간 전체 문제 구성을 훑어보며 난이도별 순서를 머릿속으로 전략화하세요.'
    });

    // 2. 억제 통제(Inhibitory Control) 기반 과목 공부법 매핑
    subjectAdaptations.push({
        cognitiveDomain: 'inhibitoryControl',
        domainScore: stroopScore,
        level: stroopLevel,
        subjectProtocols: {
            math: {
                actionName: stroopLevel === 'VULNERABLE' ? 'Reverse Verification (역산 검산 루틴)' : '풀이 경로 최적화',
                technique: stroopLevel === 'VULNERABLE'
                    ? '구한 정답 x를 원래 방정식에 즉시 대입하는 역산 검산을 정답 마킹 직전 5초간 필수 실행하세요.'
                    : '대안적 풀이법이 있는지 빠르게 크로스 체크하세요.',
                caution: '충동적으로 정답을 확신하고 바로 넘어가지 말 것'
            },
            korean: {
                actionName: stroopLevel === 'VULNERABLE' ? 'Negative Prompt Highlighter (부정 발문 형광펜 체크)' : '선지 매력 오답 소거',
                technique: stroopLevel === 'VULNERABLE'
                    ? '"적절하지 않은 것은", "모두 고르면"과 같은 함정 발문에 반드시 굵게 형광펜 동그라미를 치고 선지를 읽으세요.'
                    : '매력적인 오답 선지의 근거 불충분 요소를 신속히 지워나가세요.',
                caution: '질문이 "옳은 것"인지 "옳지 않은 것"인지 착각하는 충동 오답 주의'
            },
            english: {
                actionName: stroopLevel === 'VULNERABLE' ? 'Contradiction Check (역접 연결사 주의 경보)' : '논리 전개 추론',
                technique: stroopLevel === 'VULNERABLE'
                    ? 'However, But, Instead 등 역접 연결사가 나오면 형광펜 표시 후 글의 방향성이 180도 바뀌었음을 의식적으로 인지하세요.'
                    : '빈칸 전후 문장의 뉘앙스(Positive vs Negative)를 신속 판별하세요.',
                caution: '앞부분만 읽고 성급하게 주제를 단정 짓는 실수 금지'
            },
            inquiry: {
                actionName: stroopLevel === 'VULNERABLE' ? 'Exception & Unit Blocker (예외 조항 및 단위 함정 필터)' : '조건 정밀 분석',
                technique: stroopLevel === 'VULNERABLE'
                    ? '보기의 그래프 축 단위(cm, m, ℃)와 예외 조항(단, ~는 제외한다)에 밑줄을 긋고 문제를 푸세요.'
                    : '도표의 기울기와 변곡점을 정확히 판독하세요.',
                caution: '단위 착오로 인한 아쉬운 실점 원천 차단'
            }
        },
        examRoutineAdvice: stroopLevel === 'VULNERABLE'
            ? '마킹 종료 5분 전 "오답 검산 골든타임"을 의무 확보하고, 1번부터 헷갈렸던 문제의 발문 부정 여부만 훑으세요.'
            : '까다로운 킬러 문항에 멘탈이 흔들리지 않도록 심호흡 후 다음 세트로 이행하세요.'
    });

    // 3. 인지 유연성(Cognitive Flexibility) 기반 과목 공부법 매핑
    subjectAdaptations.push({
        cognitiveDomain: 'cognitiveFlexibility',
        domainScore: speedScore,
        level: flexLevel,
        subjectProtocols: {
            math: {
                actionName: flexLevel === 'VULNERABLE' ? 'Single-Topic Deep Block (90분 단일 유형 집중)' : '모의고사 랜덤 세트',
                technique: flexLevel === 'VULNERABLE'
                    ? '여러 단원을 섞어 풀기보다, 오늘은 [삼각함수 활용]만 15문제 연속으로 풀어 뇌의 연산 회로를 일관되게 정렬하세요.'
                    : '단원 융합형 복합 기출을 풀며 풀이 도구를 자유자재로 교체하세요.',
                caution: '짧은 시간에 수학-영어-국어를 번갈아 바꾸는 잦은 과목 스위칭 지양'
            },
            korean: {
                actionName: flexLevel === 'VULNERABLE' ? 'Genre-Specific Immersion (갈래별 연속 학습)' : '실전 세트 풀이',
                technique: flexLevel === 'VULNERABLE'
                    ? '비문학 과학 지문 3개를 연속으로 푼 뒤 문학으로 넘어가는 블록 방식을 취하세요.'
                    : '실제 시험 순서대로 독서-문학-선택과목을 전환하며 리듬을 훈련하세요.',
                caution: '한 지문 풀고 바로 다른 과목으로 전환하는 산만한 루틴 배제'
            },
            english: {
                actionName: flexLevel === 'VULNERABLE' ? 'Type Clustering (유형별 몰입 풀이)' : '실전 모의고사',
                technique: flexLevel === 'VULNERABLE'
                    ? '빈칸 추론 5문항 몰입 후 순서 배열 5문항 몰입하는 방식으로 뇌의 문제 해결 모드를 고정하세요.'
                    : '듣기 평가와 병행하여 독해 3문항을 빠르게 해결하는 멀티 스피드 훈련을 수행하세요.',
                caution: '문제 유형을 무작위로 섞을 때 발생하는 뇌 피로도 경계'
            },
            inquiry: {
                actionName: flexLevel === 'VULNERABLE' ? 'Concept-to-Problem Mapping (개념-문제 1:1 직결)' : '통합 기출 분석',
                technique: flexLevel === 'VULNERABLE'
                    ? '1개 소단원 개념 학습 즉시 해당 단원 기출을 풀어 개념이 문제화되는 경로를 직관적으로 체화하세요.'
                    : '대단원 간 융합 문제를 통해 다각도 접근법을 훈련하세요.',
                caution: '개념 전체를 끝내고 한참 뒤에 문제를 푸는 분리 학습 금지'
            }
        },
        examRoutineAdvice: flexLevel === 'VULNERABLE'
            ? '과목 시험 사이 쉬는 시간 20분 동안 직전 시험 과목의 답을 맞춰보지 말고, 다음 과목 요약 노트를 보며 뇌파를 다음 과목 모드로 셋업하세요.'
            : '매 교시 시작 전 1분간 스트레칭으로 뇌의 주의력을 신속 리셋하세요.'
    });

    const examVerificationRoutine = [
        '1. 시험 착석 직후 3분: 4-7-8 복식호흡으로 두뇌 Alpha파 유도',
        '2. 시험 시작 30초: 잊기 쉬운 공식/핵심 키워드를 시험지 여백에 Brain Dump',
        '3. 문제 풀이 중: 발문의 부정 표현("적절하지 않은 것") 형광펜 체크',
        '4. 종료 5분 전: 역산 검산 루틴 및 마킹 밀림 체크'
    ];

    let interventionGuide = `현재 학생의 인지검사 결과, 작업기억(${wmScore}점), 억제통제(${stroopScore}점), 인지속도(${speedScore}점)를 기록했습니다. `;
    if (wmLevel === 'VULNERABLE') {
        interventionGuide += `작업기억 부하를 줄이기 위해 암산 대신 **'Working Memory Offload(중간식 필사)'**가 강력히 권장됩니다. `;
    }
    if (stroopLevel === 'VULNERABLE') {
        interventionGuide += `충동 실수를 방지하기 위해 **'Reverse Verification(역산 검산)'**과 **'부정 발문 형광펜 체크'**를 반드시 습관화하세요. `;
    }

    return {
        workingMemory: {
            score: wmScore,
            level: wmLevel,
            statusText: wmLevel === 'OPTIMAL' ? '우수 (High Capacity)' : wmLevel === 'MODERATE' ? '보통 (Stable)' : '취약 (Working Memory Overload)'
        },
        inhibitoryControl: {
            score: stroopScore,
            level: stroopLevel,
            statusText: stroopLevel === 'OPTIMAL' ? '우수 (High Focus)' : stroopLevel === 'MODERATE' ? '보통 (Adequate)' : '주의 (Impulsive/Distraction Risk)'
        },
        cognitiveFlexibility: {
            score: speedScore,
            level: flexLevel,
            statusText: flexLevel === 'OPTIMAL' ? '우수 (Quick Switch)' : flexLevel === 'MODERATE' ? '보통 (Average)' : '보완 필요 (Needs Deep Block)'
        },
        subjectAdaptations,
        examVerificationRoutine,
        interventionGuide
    };
};
