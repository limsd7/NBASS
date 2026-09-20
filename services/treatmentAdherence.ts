/**
 * 처방 이행률(Adherence) 산출 (P1-1)
 *
 * - 처방(케어 가이드 + 영양 가이드) 대비 완료 체크(completedExpertGuideItems) 비율을 집계합니다.
 * - 진단→실행→재진단 루프를 하나의 지표로 닫기 위한 순수 로직(UI와 분리).
 */
import { AssessmentResult } from '../types';

export type AdherenceLevel = 'excellent' | 'good' | 'fair' | 'low' | 'unknown';

export interface AdherenceSummary {
    prescribedCount: number;
    completedCount: number;
    /** 0~100 (%) */
    rate: number;
    level: AdherenceLevel;
    label: string;
}

const levelOf = (rate: number): { level: AdherenceLevel; label: string } => {
    if (rate >= 80) return { level: 'excellent', label: '이행 우수 — 처방을 충실히 실천하고 있습니다.' };
    if (rate >= 60) return { level: 'good', label: '이행 양호 — 핵심 처방이 실행되고 있습니다.' };
    if (rate >= 30) return { level: 'fair', label: '이행 보통 — 일부 처방만 실행되고 있습니다.' };
    return { level: 'low', label: '이행 저조 — 핵심 처방 실행을 늘려야 효과가 납니다.' };
};

export const computeAdherence = (result: AssessmentResult | null | undefined): AdherenceSummary => {
    const prescribed = [...(result?.careGuide || []), ...(result?.nutrition || [])];
    const prescribedCount = prescribed.length;
    const completedCount = (result?.completedExpertGuideItems || []).length;

    if (prescribedCount === 0) {
        return {
            prescribedCount: 0,
            completedCount,
            rate: 0,
            level: 'unknown',
            label: '처방 항목이 없습니다.',
        };
    }

    const rate = Math.max(0, Math.min(100, Math.round((completedCount / prescribedCount) * 100)));
    const { level, label } = levelOf(rate);
    return { prescribedCount, completedCount, rate, level, label };
};