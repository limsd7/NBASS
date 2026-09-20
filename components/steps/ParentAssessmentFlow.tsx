import React, { memo, useCallback, useMemo, useState } from 'react';
import { GRADE_OPTIONS } from '../../utils/constants';
import {
    PARENT_QUESTIONS,
    calculateParentResult,
    generateChildInviteCode,
    ParentAssessmentResult,
} from '../../data/parentQuestions';
import { logFunnelEvent, getStoredAttribution } from '../../utils/utmTracker';
import { ParentLinkService } from '../../services/parentLinkService';
import { ExamScheduleService } from '../../services/examScheduleService';

/**
 * 학부모 모드 진단 플로우 (단일 컴포넌트 3단계 위저드)
 * 1단계: 자녀 기본 정보 (이름/학년/성별 필수 + 시험일/카카오톡 선택)
 * 2단계: 관찰 기반 설문
 * 3단계: 학부모용 요약 리포트 + 자녀 진단 유도 CTA
 *
 * 법적 안전망: 모든 결과는 "관찰 기반 참고 자료"로만 해석 (의료 진단 아님)
 */

interface ParentAssessmentFlowProps {
    onExit: () => void; // 랜딩/홈으로
}

type Phase = 'register' | 'survey' | 'result';

interface ChildInfo {
    name: string;
    grade: string;
    gender: 'male' | 'female' | '';
    examDate: string;
    kakaoOptIn: boolean;
}

const GRADE_CHOICES = [
    '중등 1학년', '중등 2학년', '중등 3학년',
    '고등 1학년', '고등 2학년', '고등 3학년', 'N수생',
];

export const ParentAssessmentFlow: React.FC<ParentAssessmentFlowProps> = memo(({ onExit }) => {
    const [phase, setPhase] = useState<Phase>('register');
    const [child, setChild] = useState<ChildInfo>({
        name: '',
        grade: '고등 2학년',
        gender: 'male',
        examDate: '',
        kakaoOptIn: false,
    });
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [result, setResult] = useState<ParentAssessmentResult | null>(null);
    const [inviteCode, setInviteCode] = useState<string>('');

    const isRegisterValid = Boolean(child.name.trim());

    // 등록 완료 → 설문 시작
    const handleRegisterNext = useCallback(() => {
        logFunnelEvent('diagnosis_start', getStoredAttribution());
        setPhase('survey');
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    // 설문 응답
    const handleAnswer = useCallback((qid: string, score: number) => {
        setAnswers(prev => ({ ...prev, [qid]: score }));
    }, []);

    // 설문 완료 → 결과 계산 + 부모-자녀 연결 저장 + 시험 일정 등록
    const handleSurveyComplete = useCallback(() => {
        const calculated = calculateParentResult(answers);
        setResult(calculated);
        const code = generateChildInviteCode();
        setInviteCode(code);

        // 부모-자녀 연결 저장 (자녀가 초대 코드로 진단하면 갭 분석에 사용)
        ParentLinkService.saveParentAssessment({
            inviteCode: code,
            childName: child.name.trim(),
            childGrade: child.grade,
            examDate: child.examDate,
            kakaoOptIn: child.kakaoOptIn,
            parentResult: {
                ratio: calculated.ratio,
                grade: calculated.grade,
                gradeLabel: calculated.gradeLabel,
                categoryResults: calculated.categoryResults,
            },
        });

        // 시험일이 입력된 경우 D-주간 알림 스케줄 등록
        if (child.examDate) {
            ExamScheduleService.saveSchedule({
                childName: child.name.trim(),
                childGrade: child.grade,
                examDate: child.examDate,
                kakaoOptIn: child.kakaoOptIn,
            });
        }

        logFunnelEvent('diagnosis_complete', getStoredAttribution());
        setPhase('result');
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [answers, child]);

    const answeredCount = useMemo(
        () => PARENT_QUESTIONS.filter(q => answers[q.id] !== undefined).length,
        [answers]
    );
    const progress = Math.round((answeredCount / PARENT_QUESTIONS.length) * 100);

    // ===== 1단계: 자녀 정보 등록 =====
    if (phase === 'register') {
        return (
            <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-800/95 rounded-[2rem] border border-slate-200/80 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in duration-500">
                <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-7 md:p-9 text-white relative">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-bold mb-2">
                        👨‍👩‍👧 학부모 관찰 진단
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight">우리 아이 관찰 진단</h2>
                    <p className="text-pink-100 text-xs md:text-sm mt-1">
                        부모님이 관찰하신 모습을 바탕으로 자녀의 학습 컨디션을 분석합니다. (약 3분)
                    </p>
                </div>

                <div className="p-7 md:p-9 space-y-5">
                    {/* 자녀 이름 */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">
                            자녀 이름 <span className="text-rose-500">*필수</span>
                        </label>
                        <input
                            type="text"
                            placeholder="자녀 이름을 입력하세요"
                            value={child.name}
                            onChange={e => setChild(c => ({ ...c, name: e.target.value }))}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all"
                        />
                    </div>

                    {/* 학년 */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">학년</label>
                        <div className="grid grid-cols-4 gap-2">
                            {GRADE_CHOICES.map(g => (
                                <button
                                    key={g}
                                    type="button"
                                    onClick={() => setChild(c => ({ ...c, grade: g }))}
                                    className={`px-2 py-2.5 rounded-xl text-xs font-bold transition-all border ${child.grade === g
                                        ? 'bg-pink-600 text-white border-pink-600 shadow-md'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-pink-300'
                                        }`}
                                >
                                    {g.replace('학년', '')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 성별 */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">성별</label>
                        <div className="grid grid-cols-2 gap-2">
                            {([['male', '남성'], ['female', '여성']] as const).map(([val, label]) => (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => setChild(c => ({ ...c, gender: val }))}
                                    className={`px-4 py-3 rounded-xl text-sm font-bold transition-all border ${child.gender === val
                                        ? 'bg-pink-600 text-white border-pink-600 shadow-md'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-pink-300'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 시험일 (선택) */}
                    <div className="space-y-2 bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                            📅 다가오는 시험일 <span className="text-slate-400 font-normal">(선택)</span>
                        </label>
                        <input
                            type="date"
                            value={child.examDate}
                            onChange={e => setChild(c => ({ ...c, examDate: e.target.value }))}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all"
                        />
                        <p className="text-xs text-amber-700">
                            시험일을 입력하면 시험 D-주간 맞춤 케어 알림을 받을 수 있습니다.
                        </p>
                    </div>

                    {/* 카카오톡 수신 (선택) */}
                    <div className="bg-yellow-50/60 p-4 rounded-2xl border border-yellow-200">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={child.kakaoOptIn}
                                onChange={e => setChild(c => ({ ...c, kakaoOptIn: e.target.checked }))}
                                className="mt-1 w-4 h-4 accent-yellow-500"
                            />
                            <div>
                                <span className="text-sm font-bold text-slate-700">
                                    💬 주간 컨디션 요약을 카카오톡으로 받기 (선택)
                                </span>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    자녀의 주간 학습 컨디션 요약을 매주 발송해드립니다. 언제든 해지 가능합니다.
                                </p>
                            </div>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onExit}
                            className="px-5 py-3.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                        >
                            나가기
                        </button>
                        <button
                            type="button"
                            disabled={!isRegisterValid}
                            onClick={handleRegisterNext}
                            className="flex-1 px-5 py-3.5 rounded-xl text-base font-black bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-xl"
                        >
                            관찰 설문 시작하기 →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ===== 2단계: 관찰 설문 =====
    if (phase === 'survey') {
        let lastCategory = '';
        return (
            <div className="w-full max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
                {/* 진행률 헤더 */}
                <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 sticky top-2 z-10 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-black text-slate-800">
                            👨‍👩‍👧 {child.name} 님 관찰 진단
                        </span>
                        <span className="text-xs font-bold text-pink-600">{progress}% 완료</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">
                        {answeredCount} / {PARENT_QUESTIONS.length} 문항 · 자녀를 관찰하신 내용으로 답해주세요
                    </p>
                </div>

                {/* 문항 목록 */}
                {PARENT_QUESTIONS.map(q => {
                    const showCategoryHeader = q.categoryLabel !== lastCategory;
                    lastCategory = q.categoryLabel;
                    return (
                        <div key={q.id}>
                            {showCategoryHeader && (
                                <div className="flex items-center gap-2 pt-4 pb-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                                    <span className="text-xs font-black text-pink-600 uppercase tracking-wider">
                                        {q.categoryLabel}
                                    </span>
                                </div>
                            )}
                            <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                                <p className="text-sm font-bold text-slate-800 mb-3 leading-relaxed">{q.text}</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {q.options.map(opt => (
                                        <button
                                            key={opt.label}
                                            type="button"
                                            onClick={() => handleAnswer(q.id, opt.score)}
                                            className={`px-2 py-2.5 rounded-xl text-xs font-bold transition-all border ${answers[q.id] === opt.score
                                                ? 'bg-pink-600 text-white border-pink-600 shadow-md'
                                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-pink-300'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* 완료 버튼 */}
                <div className="pt-4 pb-8">
                    <button
                        type="button"
                        disabled={answeredCount < PARENT_QUESTIONS.length}
                        onClick={handleSurveyComplete}
                        className="w-full py-4 rounded-2xl text-base font-black bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        {answeredCount < PARENT_QUESTIONS.length
                            ? `${PARENT_QUESTIONS.length - answeredCount}개 문항이 남았습니다`
                            : '분석 결과 보기 →'}
                    </button>
                </div>
            </div>
        );
    }

    // ===== 3단계: 학부모용 결과 리포트 =====
    if (phase === 'result' && result) {
        return (
            <div className="w-full max-w-2xl mx-auto space-y-5 animate-in fade-in duration-500 pb-12">
                {/* 결과 카드 */}
                <div className="bg-white dark:bg-slate-800/95 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
                    <div className="p-7 md:p-9 text-center" style={{ background: `linear-gradient(135deg, ${result.gradeColor}18, transparent)` }}>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-600 dark:text-slate-300 mb-4">
                            👨‍👩‍👧 {child.name} 님 · {child.grade} · 관찰 진단 결과
                        </div>
                        <div className="text-5xl font-black mb-2" style={{ color: result.gradeColor }}>
                            {result.gradeLabel}
                        </div>
                        <p className="text-sm text-slate-500">
                            관찰 주의 신호 지수: <b style={{ color: result.gradeColor }}>{result.ratio}</b> / 100
                        </p>
                    </div>

                    {/* 카테고리별 점수 */}
                    <div className="px-7 md:px-9 pb-6 space-y-3">
                        {result.categoryResults.map(c => {
                            const label = PARENT_QUESTIONS.find(q => q.category === c.category)?.categoryLabel || c.category;
                            return (
                                <div key={c.category}>
                                    <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                                        <span>{label}</span>
                                        <span>{c.ratio}%</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{
                                                width: `${c.ratio}%`,
                                                background: c.ratio >= 50 ? '#f87171' : c.ratio >= 25 ? '#f59e0b' : '#10b981',
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 추천 처방 */}
                <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-base font-black text-slate-800 mb-3">💡 지금 시작할 수 있는 케어</h3>
                    <ul className="space-y-2.5">
                        {result.recommendations.map((r, i) => (
                            <li key={i} className="flex gap-2.5 text-sm text-slate-600">
                                <span className="text-pink-500 font-black shrink-0">{i + 1}.</span>
                                <span>{r}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 갭 힌트 */}
                {result.gapHints.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                        <h3 className="text-sm font-black text-amber-800 mb-2">⚠️ 관찰 소견</h3>
                        <ul className="space-y-1.5">
                            {result.gapHints.map((h, i) => (
                                <li key={i} className="text-xs text-amber-700 leading-relaxed">• {h}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* 자녀 초대 코드 — 이중 퍼널 핵심 */}
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] p-7 text-white text-center shadow-xl">
                    <div className="text-xs font-bold text-blue-200 mb-2">정밀 진단은 자녀 본인이 직접</div>
                    <h3 className="text-xl font-black text-white mb-1">
                        {child.name} 님의 초대 코드
                    </h3>
                    <div className="text-3xl font-black tracking-[0.3em] text-white bg-white/15 border border-white/25 rounded-2xl py-4 my-4 select-all">
                        {inviteCode}
                    </div>
                    <p className="text-xs text-blue-100 leading-relaxed mb-4">
                        자녀가 이 코드로 직접 진단하면, 부모 관찰 결과와 본인 자가 진단이 비교 분석되어
                        훨씬 정밀한 리포트를 받을 수 있습니다.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            const text = `[NBASS] ${child.name}님의 정밀 학습 성향 진단\n초대 코드: ${inviteCode}\n아래 링크에서 3분 진단을 시작해보세요: ${window.location.origin}/?app=true&step=register&invite=${inviteCode}`;
                            if (navigator.share) {
                                navigator.share({ title: 'NBASS 자녀 진단 초대', text }).catch(() => { });
                            } else {
                                navigator.clipboard?.writeText(text).then(() => {
                                    alert('초대 링크가 클립보드에 복사되었습니다. 자녀에게 전달해주세요!');
                                }).catch(() => { });
                            }
                        }}
                        className="w-full py-3.5 rounded-xl bg-white text-indigo-700 font-black text-sm shadow-lg hover:shadow-xl transition-all"
                    >
                        📤 자녀에게 진단 링크 보내기
                    </button>
                </div>

                {/* 카카오톡 알림 유도 (선택 동의 시) */}
                {child.kakaoOptIn && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 text-center">
                        <div className="text-sm font-black text-yellow-800 mb-1">💬 주간 알림 신청 접수됨</div>
                        <p className="text-xs text-yellow-700">
                            {child.name} 님의 주간 학습 컨디션 요약을 카카오톡으로 보내드립니다.
                        </p>
                    </div>
                )}

                {/* 법적 고지 */}
                <p className="text-center text-[11px] text-slate-400 leading-relaxed px-6">
                    본 결과는 보호자의 관찰을 기반으로 한 학습 컨디션 참고 자료이며, 의료 진단이 아닙니다.
                    정밀 분석은 자녀 본인의 직접 진단을 기준으로 합니다.
                </p>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onExit}
                        className="flex-1 py-3.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-all"
                    >
                        홈으로
                    </button>
                </div>
            </div>
        );
    }

    return null;
});

export default ParentAssessmentFlow;
