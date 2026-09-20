/**
 * 부모-자녀 진단 연결 서비스
 *
 * - 학부모가 관찰 진단을 완료하면 자녀 초대 코드와 함께 결과 저장
 * - 자녀가 초대 코드(?invite=XXXXXX)로 진단하면 학부모 결과와 자동 매칭
 * - 갭 분석: 학부모 관찰 vs 학생 자가 보고의 불일치 지점 도출
 *
 * 저장 위치: localStorage (nbass_parent_links)
 */

import { ParentAssessmentResult } from '../data/parentQuestions';

export interface ParentLinkRecord {
    inviteCode: string;
    childName: string;
    childGrade: string;
    examDate: string;
    kakaoOptIn: boolean;
    parentResult: {
        ratio: number;
        grade: string;
        gradeLabel: string;
        categoryResults: { category: string; score: number; max: number; ratio: number }[];
    };
    createdAt: string;
    /** 자녀가 진단을 완료하면 기록됨 */
    childCompletedAt?: string;
    childRatio?: number; // 학생 자가 진단 종합 위험 비율 (0~100)
}

const LINKS_KEY = 'nbass_parent_links';

export const ParentLinkService = {
    /** 학부모 진단 완료 시 저장 (초대 코드 발급과 동시에) */
    saveParentAssessment(record: Omit<ParentLinkRecord, 'createdAt'>): void {
        try {
            const links = this.getAll();
            links[record.inviteCode] = { ...record, createdAt: new Date().toISOString() };
            // 최대 200개 유지
            const keys = Object.keys(links);
            if (keys.length > 200) {
                delete links[keys[0]];
            }
            localStorage.setItem(LINKS_KEY, JSON.stringify(links));
        } catch (e) {
            console.error('Failed to save parent link:', e);
        }
    },

    getAll(): Record<string, ParentLinkRecord> {
        try {
            return JSON.parse(localStorage.getItem(LINKS_KEY) || '{}');
        } catch {
            return {};
        }
    },

    /** 초대 코드로 학부모 결과 조회 */
    findByInviteCode(code: string): ParentLinkRecord | null {
        if (!code) return null;
        try {
            const links = this.getAll();
            return links[code.trim().toUpperCase()] || null;
        } catch {
            return null;
        }
    },

    /** 자녀 진단 완료 시 학부모 결과에 자녀 데이터 매칭 */
    attachChildResult(code: string, childRatio: number): ParentLinkRecord | null {
        try {
            const links = this.getAll();
            const key = code.trim().toUpperCase();
            if (!links[key]) return null;
            links[key].childCompletedAt = new Date().toISOString();
            links[key].childRatio = childRatio;
            localStorage.setItem(LINKS_KEY, JSON.stringify(links));
            return links[key];
        } catch {
            return null;
        }
    },
};

/** 카테고리 한글 라벨 */
const CATEGORY_LABELS: Record<string, string> = {
    anxiety: '불안·긴장',
    sleep: '수면',
    fatigue: '피로·활력',
    concentration: '집중력',
    appetite: '식습관·생활',
};

export interface GapAnalysisItem {
    category: string;
    label: string;
    parentRatio: number;
    childRatio: number;
    gap: number; // parentRatio - childRatio
    severity: 'high' | 'medium' | 'low';
    message: string;
}

export interface GapAnalysisReport {
    hasParentData: boolean;
    parentGradeLabel?: string;
    items: GapAnalysisItem[];
    summary: string;
    parentRecommendations: string[];
}

/**
 * 갭 분석 수행
 * @param parentCategoryResults 학부모 관찰 카테고리 점수
 * @param childCategoryRatios 학생 자가 진단 카테고리 비율 (0~100)
 */
export function analyzeGap(
    parentRecord: ParentLinkRecord,
    childCategoryRatios: Record<string, number>
): GapAnalysisReport {
    if (!parentRecord) {
        return { hasParentData: false, items: [], summary: '', parentRecommendations: [] };
    }

    const items: GapAnalysisItem[] = [];
    for (const pc of parentRecord.parentResult.categoryResults) {
        const childRatio = childCategoryRatios[pc.category] ?? 0;
        const gap = pc.ratio - childRatio;
        const label = CATEGORY_LABELS[pc.category] || pc.category;

        let severity: GapAnalysisItem['severity'] = 'low';
        let message = '';
        if (pc.ratio >= 50 && childRatio < 30) {
            severity = 'high';
            message = `부모님은 ${label} 영역에서 뚜렷한 신호를 관찰하셨지만, 본인은 상대적으로 여유 있다고 응답했습니다. 자기 보고가 실제보다 낮게 나오는 경우가 많으므로 이 영역을 우선 점검해보세요.`;
        } else if (pc.ratio >= 50 && childRatio >= 50) {
            severity = 'high';
            message = `${label} 영역에서 부모 관찰과 본인 느낌이 모두 높게 나왔습니다. 두 데이터가 일치하는 영역은 우선 케어 대상입니다.`;
        } else if (Math.abs(gap) >= 25) {
            severity = 'medium';
            message = gap > 0
                ? `부모님이 관찰하신 ${label} 부담이 본인이 느끼는 것보다 큽니다. 본인이 과소평가하고 있을 가능성을 열어두고 대화해보세요.`
                : `본인이 느끼는 ${label} 부담이 부모 관찰보다 큽니다. 부모님께 직접 말씀하기 어려운 부분이 있을 수 있으니 상담에서 다뤄보세요.`;
        } else {
            message = `${label} 영역에서 부모 관찰과 본인 느낌이 대체로 일치합니다.`;
        }

        items.push({ category: pc.category, label, parentRatio: pc.ratio, childRatio, gap, severity, message });
    }

    items.sort((a, b) => b.severity.localeCompare(a.severity) || Math.abs(b.gap) - Math.abs(a.gap));

    const highCount = items.filter(i => i.severity === 'high').length;
    const summary = highCount > 0
        ? `${highCount}개 영역에서 부모 관찰과 본인 진단 사이 중요한 차이가 발견되었습니다. 아래 내용을 확인해보세요.`
        : '부모 관찰과 본인 진단이 대체로 일치하는 안정적인 패턴입니다.';

    return {
        hasParentData: true,
        parentGradeLabel: parentRecord.parentResult.gradeLabel,
        items,
        summary,
        parentRecommendations: [],
    };
}
