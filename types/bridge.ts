/**
 * 플랫폼간 타입 브리지 (단일 진실 공급원 연결)
 * - 루트 types.ts가 정식이며, src/android/schedule 타입은 표시용으로만 씁니다.
 * - 직접 캐스팅 대신 아래 변환 함수를 경유해야 데이터 정합성이 유지됩니다.
 */
import type { WrongNote as CanonicalWrongNote, WrongNoteErrorType as CanonicalErrorType } from '../types';
import type { WrongNote as LightWrongNote } from '../src/types';

const toCanonicalError = (e: LightWrongNote['errorType']): CanonicalErrorType | undefined => {
    if (!e) return undefined;
    if (e === 'CONCEPT' || e === 'MISTAKE_IMPULSE' || e === 'TIME_LIMIT' || e === 'KILLER_PROBLEM') return e;
    return undefined;
};

export const lightToCanonicalWrongNote = (w: LightWrongNote): CanonicalWrongNote => ({
    id: w.id,
    subject: w.subject,
    questionTitle: w.questionTitle,
    questionNumber: '',
    wrongAnswer: w.wrongAnswer,
    correctAnswer: w.correctAnswer,
    explanation: w.explanation,
    difficulty: w.difficulty,
    errorType: toCanonicalError(w.errorType),
    reviewStage: w.reviewStage ?? 0,
    nextReviewDate: w.nextReviewDate ?? '',
    lastReviewedAt: w.lastReviewedAt ?? '',
    reviewHistory: (w.reviewHistory ?? []).map((r) => ({ date: r.date, result: r.passed ? 'correct' as const : 'wrong' as const })),
    isResolved: w.isResolved,
    createdAt: w.createdAt,
    studentId: '',
    subjectCategory: w.subject,
} as unknown as CanonicalWrongNote);

export const canonicalToLightWrongNote = (w: CanonicalWrongNote): LightWrongNote => ({
    id: String((w as { id: unknown }).id ?? ''),
    subject: String((w as { subject: unknown }).subject ?? ''),
    questionTitle: String((w as { questionTitle: unknown }).questionTitle ?? ''),
    wrongAnswer: String((w as { wrongAnswer: unknown }).wrongAnswer ?? ''),
    correctAnswer: String((w as { correctAnswer: unknown }).correctAnswer ?? ''),
    explanation: String((w as { explanation: unknown }).explanation ?? ''),
    difficulty: ((w as { difficulty: unknown }).difficulty as LightWrongNote['difficulty']) || '중',
    errorType: ((w as { errorType: unknown }).errorType as LightWrongNote['errorType']) || undefined,
    reviewStage: Number((w as { reviewStage: unknown }).reviewStage ?? 0),
    nextReviewDate: String((w as { nextReviewDate: unknown }).nextReviewDate ?? ''),
    lastReviewedAt: String((w as { lastReviewedAt: unknown }).lastReviewedAt ?? ''),
    reviewHistory: [],
    isResolved: Boolean((w as { isResolved: unknown }).isResolved),
    createdAt: String((w as { createdAt: unknown }).createdAt ?? new Date().toISOString()),
});

/** 모바일 WrongNoteItem(안드로이드)과 정식 타입의 최소 변환 */
export interface MobileWrongNoteLike {
    id: string;
    subject: string;
    unitName?: string;
    questionNumber?: string;
    memo?: string;
    aiPrescription?: string;
    isResolved: boolean;
    createdAt: string;
}

export const mobileToCanonicalWrongNote = (w: MobileWrongNoteLike): CanonicalWrongNote =>
({
    id: w.id,
    subject: w.subject,
    questionTitle: w.unitName || w.questionNumber || w.subject,
    questionNumber: w.questionNumber || '',
    wrongAnswer: w.memo || '',
    correctAnswer: w.aiPrescription || '',
    explanation: w.aiPrescription || w.memo || '',
    difficulty: '중',
    isResolved: w.isResolved,
    createdAt: w.createdAt,
    studentId: '',
} as unknown as CanonicalWrongNote);
