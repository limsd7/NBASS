import type { GradeRecord } from '../types';
import { SUNEUNG_SUBJECTS } from '../data/suneungSubjects';

// 성적 기록 취약단원 수집 (NeuroStudyLadderCenter에서 분리, 순수 로직)
// - 최신 회차 우선, 동일 단원은 최신 순위 유지
// - 표시 전 우선순위 정렬 (표시 순번 == 우선순위)
// - 과목 키워드 판정은 과목 ID로 식별되지 않을 때만 보조로 사용 (오분류 방지)
export interface WeakUnitEntry {
    subjectName: '국어' | '수학' | '영어' | '탐구';
    unitName: string;
    priority: number;
}

export interface WeakUnitBuckets {
    korean: WeakUnitEntry[];
    math: WeakUnitEntry[];
    english: WeakUnitEntry[];
    inquiry: WeakUnitEntry[]; // 탐구/한국사/제2외국어 (사다리 문제은행이 국수영이라 표시는 호출측 판단)
}

const isKorId = (id: string) => id.includes('korean') || id.includes('kor') || id.includes('국어');
const isEngId = (id: string) => id.includes('english') || id.includes('eng') || id.includes('영어');
const hasKorKw = (u: string) =>
    u.includes('독서') || u.includes('문학') || u.includes('문법') || u.includes('화작') || u.includes('언매');
const hasEngKw = (u: string) =>
    u.includes('빈칸') || u.includes('순서') || u.includes('어법') || u.includes('삽입') || u.includes('대의');

export const collectWeakUnits = (records: GradeRecord[]): WeakUnitBuckets => {
    const korean: WeakUnitEntry[] = [];
    const math: WeakUnitEntry[] = [];
    const english: WeakUnitEntry[] = [];
    const inquiry: WeakUnitEntry[] = [];

    const categoryOf = (id: string): string | undefined =>
        SUNEUNG_SUBJECTS.find(s => s.id === id)?.category;

    const sortedByDate = [...records].sort(
        (a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime()
    );
    sortedByDate.forEach((r) => {
        r.subjects.forEach((s) => {
            const subId = (s.subjectId || '').toLowerCase();
            if (s.weakUnits && s.weakUnits.length > 0) {
                const recognized = isKorId(subId) || isEngId(subId) || subId.includes('math') || subId.includes('수학');
                const cat = categoryOf(s.subjectId || '');
                const isInquiry = cat === 'social' || cat === 'science' || cat === 'required' || cat === 'foreign';
                s.weakUnits.forEach((u, uIdx) => {
                    if (isKorId(subId) || (!recognized && !isInquiry && hasKorKw(u))) {
                        if (!korean.some((c) => c.unitName === u)) {
                            korean.push({ subjectName: '국어', unitName: u, priority: uIdx + 1 });
                        }
                    } else if (isEngId(subId) || (!recognized && !isInquiry && hasEngKw(u))) {
                        if (!english.some((c) => c.unitName === u)) {
                            english.push({ subjectName: '영어', unitName: u, priority: uIdx + 1 });
                        }
                    } else if (isInquiry) {
                        if (!inquiry.some((c) => c.unitName === u)) {
                            inquiry.push({ subjectName: '탐구', unitName: u, priority: uIdx + 1 });
                        }
                    } else {
                        if (!math.some((c) => c.unitName === u)) {
                            math.push({ subjectName: '수학', unitName: u, priority: uIdx + 1 });
                        }
                    }
                });
            }
        });
    });

    const byPriority = (list: WeakUnitEntry[]): WeakUnitEntry[] =>
        [...list].sort((a, b) => a.priority - b.priority);

    return { korean: byPriority(korean), math: byPriority(math), english: byPriority(english), inquiry: byPriority(inquiry) };
};
