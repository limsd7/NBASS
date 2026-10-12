import React from 'react';
import { GradeRecord } from '../../../types';
import { SUNEUNG_SUBJECTS } from '../../../data/suneungSubjects';

type LadderSubjectFilter = 'all' | 'korean' | 'math' | 'english';

interface Props {
    records: GradeRecord[];
    currentCare: { title: string };
    ladderSubjectFilter: LadderSubjectFilter;
    setLadderSubjectFilter: (filter: LadderSubjectFilter) => void;
    onNavigateTab: (tab: string) => void;
    onOpenInputModal: () => void;
    onOpenLadderModal?: (subjectName: string, unitName: string, weakPriority: number) => void;
}

export const LadderTrainingCard: React.FC<Props> = ({
    records,
    currentCare,
    ladderSubjectFilter,
    setLadderSubjectFilter,
    onNavigateTab,
    onOpenInputModal,
    onOpenLadderModal,
}) => {
    // 모든 시험에서 등록된 취약단원을 과목별로 분리 추출 (탐구는 별도 분리, 사다리 문제은행이 국수영이라 표시는 국수영만)
    const koreanCollected: { subjectName: string; unitName: string; priority: number }[] = [];
    const mathCollected: { subjectName: string; unitName: string; priority: number }[] = [];
    const englishCollected: { subjectName: string; unitName: string; priority: number }[] = [];

    const categoryOf = (id: string): string | undefined =>
        SUNEUNG_SUBJECTS.find(s => s.id === id)?.category;

    records.forEach((r) => {
        r.subjects.forEach((s) => {
            const subId = (s.subjectId || '').toLowerCase();
            const cat = categoryOf(s.subjectId || '');
            const isInquiry = cat === 'social' || cat === 'science' || cat === 'required' || cat === 'foreign';
            if (isInquiry) return; // 탐구 취약단원은 로드맵·시뮬레이션에서 활용, 사다리 카드 오염 방지
            if (s.weakUnits && s.weakUnits.length > 0) {
                s.weakUnits.forEach((u, uIdx) => {
                    if (subId.includes('kor') || subId.includes('국어') || u.includes('독서') || u.includes('문학') || u.includes('문법') || u.includes('화작') || u.includes('언매')) {
                        if (!koreanCollected.some((c) => c.unitName === u)) {
                            koreanCollected.push({ subjectName: '국어', unitName: u, priority: uIdx + 1 });
                        }
                    } else if (subId.includes('eng') || subId.includes('영어') || u.includes('빈칸') || u.includes('순서') || u.includes('어법') || u.includes('삽입') || u.includes('대의')) {
                        if (!englishCollected.some((c) => c.unitName === u)) {
                            englishCollected.push({ subjectName: '영어', unitName: u, priority: uIdx + 1 });
                        }
                    } else {
                        if (!mathCollected.some((c) => c.unitName === u)) {
                            mathCollected.push({ subjectName: '수학', unitName: u, priority: uIdx + 1 });
                        }
                    }
                });
            }
        });
    });

    // 학년별 또는 기본 추천 단원 (국·수·영 완비)
    const defaultKoreanUnits = [
        { subjectName: '국어', unitName: '[독서] 과학·기술 복합 지문 인과/비례 추론', priority: 1 },
        { subjectName: '국어', unitName: '[문학] 고전시가 고어 어휘 & 갈래 복합 독해', priority: 2 },
        { subjectName: '국어', unitName: '[언어와매체] 수능 실전 문법 5문항 체계', priority: 3 },
    ];

    const defaultMathUnits = [
        { subjectName: '수학', unitName: '[수학I] 등차수열과 등비수열의 일반항 & 합', priority: 1 },
        { subjectName: '수학', unitName: '[수학II] 도함수의 활용 (접선·극값)', priority: 2 },
        { subjectName: '수학', unitName: '[미적분/수II] 부정적분과 정적분의 계산', priority: 3 },
    ];

    const defaultEnglishUnits = [
        { subjectName: '영어', unitName: '[수능 킬러] 빈칸추론 31~34번', priority: 1 },
        { subjectName: '영어', unitName: '[수능 킬러] 글의 순서 배열 & 문장 삽입', priority: 2 },
        { subjectName: '영어', unitName: '[어법·어휘] 29번 어법 & 30번 밑줄 어휘', priority: 3 },
    ];

    const korList = koreanCollected.length > 0 ? koreanCollected : defaultKoreanUnits;
    const mathList = mathCollected.length > 0 ? mathCollected : defaultMathUnits;
    const engList = englishCollected.length > 0 ? englishCollected : defaultEnglishUnits;

    // 선택된 탭에 따라 표시할 카드 결정
    let displayWeakUnits: { subjectName: string; unitName: string; priority: number; badgeColor: 'rose' | 'blue' | 'amber'; subjectIcon: string }[] = [];

    if (ladderSubjectFilter === 'all') {
        // 국·수·영 밸런스: 각 과목의 1순위 대표 단원 1개씩 3개 나란히 표시!
        displayWeakUnits = [
            { ...korList[0], priority: 1, badgeColor: 'rose', subjectIcon: '📖' },
            { ...mathList[0], priority: 1, badgeColor: 'blue', subjectIcon: '📐' },
            { ...engList[0], priority: 1, badgeColor: 'amber', subjectIcon: '🔤' },
        ];
    } else if (ladderSubjectFilter === 'korean') {
        displayWeakUnits = korList.slice(0, 3).map((item, idx) => ({
            ...item,
            priority: idx + 1,
            badgeColor: 'rose',
            subjectIcon: '📖',
        }));
    } else if (ladderSubjectFilter === 'math') {
        displayWeakUnits = mathList.slice(0, 3).map((item, idx) => ({
            ...item,
            priority: idx + 1,
            badgeColor: 'blue',
            subjectIcon: '📐',
        }));
    } else if (ladderSubjectFilter === 'english') {
        displayWeakUnits = engList.slice(0, 3).map((item, idx) => ({
            ...item,
            priority: idx + 1,
            badgeColor: 'amber',
            subjectIcon: '🔤',
        }));
    }

    return (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 border border-blue-500/30 shadow-xl text-white space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                    <span className="text-3xl">🪜</span>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-bold text-white">
                                12대 CareType 맞춤 <span className="text-blue-300">국·수·영 6단계 AI 문항 사다리 훈련</span>
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                                {currentCare.title} 특화
                            </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                            긴장도 완화 두뇌 프라이밍 ➔ 필수 개념 3문항 메타점검 ➔ A부터 F까지 5문항 사다리 돌파
                        </p>
                    </div>
                </div>

                {/* 과목 필터 탭 & 관리 버튼 */}
                <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
                    <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                        <button
                            type="button"
                            onClick={() => setLadderSubjectFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${ladderSubjectFilter === 'all'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <span>🌟</span>
                            <span>국·수·영 밸런스</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setLadderSubjectFilter('korean')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${ladderSubjectFilter === 'korean'
                                    ? 'bg-rose-600 text-white shadow-sm'
                                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <span>📖</span>
                            <span>국어 TOP 3</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setLadderSubjectFilter('math')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${ladderSubjectFilter === 'math'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <span>📐</span>
                            <span>수학 TOP 3</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setLadderSubjectFilter('english')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${ladderSubjectFilter === 'english'
                                    ? 'bg-amber-600 text-white shadow-sm'
                                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <span>🔤</span>
                            <span>영어 TOP 3</span>
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => onNavigateTab('ladder_training')}
                        className="text-xs font-bold text-indigo-200 hover:text-white bg-indigo-500/20 hover:bg-indigo-500/40 px-3 py-2 rounded-xl border border-indigo-400/30 transition-all cursor-pointer shrink-0 flex items-center gap-1"
                        title="국·수·영 6단계 AI 사다리 훈련 센터로 이동"
                    >
                        <span>전체 훈련 센터</span>
                        <span>➔</span>
                    </button>

                    <button
                        onClick={onOpenInputModal}
                        className="text-xs font-bold text-blue-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl border border-white/15 transition-all cursor-pointer shrink-0"
                    >
                        + 취약단원 관리하기
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {displayWeakUnits.map((item, idx) => (
                    <div
                        key={`${item.subjectName}_${item.unitName}_${idx}`}
                        className="bg-white/10 hover:bg-white/15 border border-white/10 hover:border-blue-400/50 rounded-2xl p-4 flex flex-col justify-between transition-all cursor-pointer group shadow-inner"
                        onClick={() => onOpenLadderModal?.(item.subjectName, item.unitName, item.priority)}
                    >
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-[10.5px] font-black px-2 py-0.5 rounded-md ${item.priority === 1 ? 'bg-rose-500/40 text-rose-200 border border-rose-400/40' :
                                        item.priority === 2 ? 'bg-amber-500/40 text-amber-200 border border-amber-400/40' :
                                            'bg-blue-500/40 text-blue-200 border border-blue-400/40'
                                    }`}>
                                    취약 {item.priority}순위
                                </span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${item.badgeColor === 'rose' ? 'bg-rose-500/30 text-rose-200 border-rose-400/40' :
                                        item.badgeColor === 'amber' ? 'bg-amber-500/30 text-amber-200 border-amber-400/40' :
                                            'bg-blue-500/30 text-blue-200 border-blue-400/40'
                                    }`}>
                                    <span>{item.subjectIcon}</span>
                                    <span>{item.subjectName}</span>
                                </span>
                            </div>
                            <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2 min-h-[40px]">
                                {item.unitName}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-1">
                                A(기본 5문항) ➔ F(수능 킬러 5문항)
                            </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-xs font-bold text-blue-300 group-hover:text-white">
                            <span>사다리 훈련 시작</span>
                            <span>⚡ ➔</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LadderTrainingCard;