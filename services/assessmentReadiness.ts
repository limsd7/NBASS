/**
 * 진단 준비도(누락 항목) 산출 (P1-8)
 *
 * - 제출 전/중에 필수 항목 누락 여부를 계산하여 "확정 진단 가능성"을 안내합니다.
 * - 누락 시 진단은 UNASSESSED + 잠정 가이드로 떨어지므로, 그 원인을 사용자에게 명시합니다.
 * - 순수 함수(UI와 분리)로 테스트·재사용이 쉽습니다.
 */

export interface ReadinessItem {
    key: string;
    label: string;
    answered: number;
    total: number;
    /** 필수 여부 (필수 누락 시 확정 진단 불가) */
    required: boolean;
}

export interface IncompleteItem {
    key: string;
    label: string;
    answered: number;
    total: number;
    required: boolean;
    /** 0이면 미입력, 0 < answered < total 이면 일부 입력 */
    partial: boolean;
}

export interface ReadinessStatus {
    ready: boolean;
    /** 0~100 (%) 전체 응답 완성도 평균 */
    completionRate: number;
    incomplete: IncompleteItem[];
    missingRequiredLabels: string[];
}

export const computeReadiness = (items: ReadinessItem[]): ReadinessStatus => {
    const safeTotal = (i: ReadinessItem) => Math.max(1, i.total);
    const ratio = (i: ReadinessItem) => Math.max(0, Math.min(1, i.answered / safeTotal(i)));

    const completionRate = items.length
        ? Math.round((items.reduce((sum, i) => sum + ratio(i), 0) / items.length) * 100)
        : 100;

    const incomplete: IncompleteItem[] = items
        .filter((i) => i.answered < safeTotal(i))
        .map((i) => ({
            key: i.key,
            label: i.label,
            answered: i.answered,
            total: i.total,
            required: i.required,
            partial: i.answered > 0,
        }));

    const missingRequiredLabels = incomplete
        .filter((i) => i.required && i.answered === 0)
        .map((i) => i.label);

    const ready = incomplete.filter((i) => i.required).length === 0;

    return { ready, completionRate, incomplete, missingRequiredLabels };
};