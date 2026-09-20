/**
 * 오답노트 ↔ CareType 공부법 자동 연동 & 에빙하우스 망각곡선 간격반복(Spaced Repetition) 처방 엔진
 */

import { CareType, WrongNote, WrongNoteErrorType } from '../types';
import { DETAILED_CARETYPE_STRATEGIES } from '../data/learningStrategies';

export interface WrongNoteErrorTypeMeta {
    type: WrongNoteErrorType;
    label: string;
    description: string;
    badgeColor: string;
    icon: string;
    rootCauseTip: string;
}

export const ERROR_TYPE_METAS: Record<WrongNoteErrorType, WrongNoteErrorTypeMeta> = {
    CONCEPT: {
        type: 'CONCEPT',
        label: '개념 부족 (Concept Gap)',
        description: '핵심 공식, 용어 정의, 인과관계 이해 부족으로 인한 오답',
        badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        icon: '📚',
        rootCauseTip: '해설지를 보지 않고 백지에 해당 개념을 직접 구조화(Feynman 기법)하는 인출 복습이 필수적입니다.'
    },
    MISTAKE_IMPULSE: {
        type: 'MISTAKE_IMPULSE',
        label: '실수·충동 (Careless/Impulsive)',
        description: '발문 오독, 부호/계산 실수, 조건 누락 등 주의산만형 오답',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: '⚡',
        rootCauseTip: '발문의 부정 표현(옳지 않은 것)에 형광펜을 긋고, 역산 검산 루틴을 통해 의식적으로 작업 브레이크를 거세요.'
    },
    TIME_LIMIT: {
        type: 'TIME_LIMIT',
        label: '시간 부족 (Time Pressure)',
        description: '시험 시간 안배 실패, 긴 지문/풀이에서 속도 지연으로 인한 오답',
        badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: '⏳',
        rootCauseTip: '1문항당 제한시간(수학 3분, 국어 지문당 8분)을 설정하고 타이머 압박 훈련 및 스키밍 훈련을 병행하세요.'
    },
    KILLER_PROBLEM: {
        type: 'KILLER_PROBLEM',
        label: '고난도 킬러 (Complex Killer)',
        description: '2개 이상의 복합 개념 결합, 신유형 추론 문제 오답',
        badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: '👑',
        rootCauseTip: '문제에 주어진 모든 단서를 넘버링(1, 2, 3)하여 해체한 후, 단계별 풀이 알고리즘을 역방향으로 분해 분석하세요.'
    }
};

export interface SubjectWrongNotePrescription {
    subject: string;
    totalCount: number;
    resolvedCount: number;
    dominantErrorType: WrongNoteErrorType;
    errorBreakdown: Record<WrongNoteErrorType, number>;
    careTypeAlignmentMessage: string;
    actionablePrescription: {
        title: string;
        problemSolvingMethod: string;
        killerTips: string;
        recommendedStepRoutine: string[];
    };
}

export interface SpacedRepetitionItem {
    note: WrongNote;
    stage: number; // 0: 등록, 1: 1일후, 2: 3일후, 3: 7일후, 4: 마스터
    daysRemaining: number; // 0 이하이면 오늘 복습 대상
    statusLabel: string;
    isDueToday: boolean;
}

export interface WrongNoteAnalysisReport {
    totalNotes: number;
    unresolvedNotes: number;
    dueTodayNotes: SpacedRepetitionItem[];
    errorTypeCounts: Record<WrongNoteErrorType, number>;
    dominantErrorType: WrongNoteErrorType;
    subjectPrescriptions: SubjectWrongNotePrescription[];
    careTypeAlert?: string;
}

// 망각곡선 주기: 0(당일) -> 1(1일후) -> 2(3일후) -> 3(7일후) -> 4(완전 마스터)
export const SPACED_REPETITION_INTERVALS: Record<number, number> = {
    0: 1, // 0단계 -> 1일 후
    1: 3, // 1단계 -> 3일 후
    2: 7, // 2단계 -> 7일 후
    3: 14 // 3단계 -> 14일 후
};

/**
 * 다음 복습 날짜를 계산하여 YYYY-MM-DD 형식으로 반환합니다.
 */
export const calculateNextReviewDate = (currentStage: number, fromDate?: Date): string => {
    const base = fromDate ? new Date(fromDate) : new Date();
    const daysToAdd = SPACED_REPETITION_INTERVALS[currentStage] || 1;
    base.setDate(base.getDate() + daysToAdd);
    return base.toISOString().split('T')[0];
};

/**
 * 오답 목록과 학생의 CareType을 종합 분석하여 맞춤 공부법 처방 및 망각곡선 큐를 생성합니다.
 */
export const analyzeWrongNotesAndCareType = (
    notes: WrongNote[],
    careType: CareType = CareType.HEALTHY
): WrongNoteAnalysisReport => {
    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date(todayStr);

    const errorCounts: Record<WrongNoteErrorType, number> = {
        CONCEPT: 0,
        MISTAKE_IMPULSE: 0,
        TIME_LIMIT: 0,
        KILLER_PROBLEM: 0
    };

    // 1. 망각곡선 큐 분석
    const dueTodayNotes: SpacedRepetitionItem[] = [];

    notes.forEach(n => {
        const errorType = n.errorType || 'CONCEPT';
        errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;

        if (!n.isResolved) {
            const nextDateStr = n.nextReviewDate || n.createdAt || todayStr;
            const nextDate = new Date(nextDateStr);
            const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            const stage = n.reviewStage || 0;

            const isDueToday = diffDays <= 0;
            let statusLabel = isDueToday 
                ? '오늘 복습 (D-Day)' 
                : `${diffDays}일 후 복습`;

            if (stage >= 4) {
                statusLabel = '마스터 완료 (정복)';
            }

            dueTodayNotes.push({
                note: n,
                stage,
                daysRemaining: diffDays,
                statusLabel,
                isDueToday: isDueToday && stage < 4
            });
        }
    });

    // 2. 가장 높은 비율의 오답 원인 도출
    let dominantErrorType: WrongNoteErrorType = 'CONCEPT';
    let maxCount = -1;
    (Object.keys(errorCounts) as WrongNoteErrorType[]).forEach(k => {
        if (errorCounts[k] > maxCount) {
            maxCount = errorCounts[k];
            dominantErrorType = k;
        }
    });

    // 3. CareType별 오답 취약성 경고 메시지
    let careTypeAlert: string | undefined = undefined;
    if (careType === CareType.HYPERSENSITIVE || careType === CareType.ATTENTION_DEFICIT) {
        if (errorCounts.MISTAKE_IMPULSE > 0) {
            careTypeAlert = `⚠️ [${careType}] 학생은 전두엽 억제 통제력 변동으로 인해 '실수·충동형 오답' 비율이 높을 수 있습니다. 문제를 다 푼 직후 3초 멈춤(Pause) 후 부호와 발문을 재확인하는 브레이크 훈련을 권장합니다.`;
        }
    } else if (careType === CareType.BURNOUT || careType === CareType.BRAIN_FATIGUE) {
        if (errorCounts.TIME_LIMIT > 0) {
            careTypeAlert = `⚠️ [${careType}] 학생은 인지 에너지 피로로 인해 후반부 '시간 부족형 오답'이 잦아집니다. 고난도 문항을 무리하게 붙잡기보다 30초 내 풀이 실마리가 안 보이면 체크 후 즉시 넘어가는 전략적 패스 훈련이 시급합니다.`;
        }
    } else if (careType === CareType.ANXIETY_TENSION || careType === CareType.STRESS_OVERLOAD) {
        careTypeAlert = `💡 [${careType}] 학생은 시험 상황에서의 편도체 과각성으로 평소 아는 문제도 오독할 위험이 있습니다. 착석 직후 3분 심호흡으로 심박수를 낮추고 1번 문항부터 차분히 진입하십시오.`;
    }

    // 4. 과목별 처방 카드 생성
    const strategy = DETAILED_CARETYPE_STRATEGIES[careType] || DETAILED_CARETYPE_STRATEGIES[CareType.HEALTHY];
    const subjects = Array.from(new Set(notes.map(n => n.subject)));
    const subjectPrescriptions: SubjectWrongNotePrescription[] = [];

    subjects.forEach(subj => {
        const subjNotes = notes.filter(n => n.subject === subj);
        const subjErrorCounts: Record<WrongNoteErrorType, number> = {
            CONCEPT: 0,
            MISTAKE_IMPULSE: 0,
            TIME_LIMIT: 0,
            KILLER_PROBLEM: 0
        };

        subjNotes.forEach(n => {
            const et = n.errorType || 'CONCEPT';
            subjErrorCounts[et] = (subjErrorCounts[et] || 0) + 1;
        });

        let subjDominant: WrongNoteErrorType = 'CONCEPT';
        let subjMax = -1;
        (Object.keys(subjErrorCounts) as WrongNoteErrorType[]).forEach(k => {
            if (subjErrorCounts[k] > subjMax) {
                subjMax = subjErrorCounts[k];
                subjDominant = k;
            }
        });

        let mappedKey: 'korean' | 'math' | 'english' | 'inquiry' = 'math';
        if (subj.includes('국어')) mappedKey = 'korean';
        else if (subj.includes('영어')) mappedKey = 'english';
        else if (subj.includes('과학') || subj.includes('사회') || subj.includes('역사')) mappedKey = 'inquiry';

        const protocol = strategy.subjectProtocols[mappedKey] || strategy.subjectProtocols.math;

        subjectPrescriptions.push({
            subject: subj,
            totalCount: subjNotes.length,
            resolvedCount: subjNotes.filter(n => n.isResolved).length,
            dominantErrorType: subjDominant,
            errorBreakdown: subjErrorCounts,
            careTypeAlignmentMessage: `현재 ${subj} 과목은 [${ERROR_TYPE_METAS[subjDominant].label}] 비중이 가장 높습니다. ${strategy.careTypeName}의 신경인지 프로토콜에 맞춘 문제풀이 기법을 적용하세요.`,
            actionablePrescription: {
                title: protocol.strategyTitle,
                problemSolvingMethod: protocol.problemSolvingMethod,
                killerTips: protocol.killerTips,
                recommendedStepRoutine: [
                    `1단계: ${ERROR_TYPE_METAS[subjDominant].rootCauseTip}`,
                    `2단계: ${protocol.readingOrConceptMethod.slice(0, 100)}...`,
                    `3단계: 1일 ➡️ 3일 ➡️ 7일 후 변형 문제로 동일 개념 재인출 검증`
                ]
            }
        });
    });

    return {
        totalNotes: notes.length,
        unresolvedNotes: notes.filter(n => !n.isResolved).length,
        dueTodayNotes: dueTodayNotes.filter(d => d.isDueToday),
        errorTypeCounts: errorCounts,
        dominantErrorType,
        subjectPrescriptions,
        careTypeAlert
    };
};
