import React, { useState, useEffect, useMemo } from 'react';
import { AssessmentResult } from '../types';
import { MembershipTier } from '../utils/featureGate';
import { generateDailyTodoPlan, generateTodoCopyText, DailyTodoGroup, DailyTodoItem } from '../services/todoPlanService';
import { 
    CheckSquare, 
    Square, 
    Copy, 
    CheckCircle2, 
    Sparkles, 
    Lock, 
    RotateCcw, 
    Calendar,
    Flame,
    Share2
} from 'lucide-react';

interface Props {
    result: AssessmentResult;
    recommendedProducts?: any[];
    membershipTier?: MembershipTier;
    onUpgradeClick?: () => void;
}

export const DailyActionTodoPlanner: React.FC<Props> = ({
    result,
    recommendedProducts = [],
    membershipTier = 'free',
    onUpgradeClick
}) => {
    const tier = membershipTier || result.student?.membershipTier || 'free';
    const isPro = tier === 'pro';
    const isPremium = tier === 'premium';
    const isPremiumPlusOrAbove = tier === 'premium' || tier === 'expert';
    const isProOrAbove = isPro || isPremium || isPremiumPlusOrAbove;

    // 오늘 날짜 (YYYY-MM-DD)
    const todayStr = useMemo(() => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, []);

    const studentId = result.student?.id || result.student?.name || 'student';
    const storageKey = `nbass_todo_${studentId}_${todayStr}`;

    // 맞춤 To-Do 그룹 생성
    const todoGroups: DailyTodoGroup[] = useMemo(() => {
        return generateDailyTodoPlan(result, recommendedProducts);
    }, [result, recommendedProducts]);

    // 전체 아이템 목록
    const allItems: DailyTodoItem[] = useMemo(() => {
        return todoGroups.flatMap(g => g.items);
    }, [todoGroups]);

    // 완료된 아이템 ID Set 관리 (로컬스토리지에 오늘 날짜별 영속화)
    const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                return new Set(Array.isArray(parsed) ? parsed : []);
            }
        } catch (e) {
            console.error("Failed to load todo state:", e);
        }
        return new Set();
    });

    // 클립보드 복사 알림 토스트
    const [showCopyToast, setShowCopyToast] = useState(false);

    // 상태 변경 시 로컬스토리지 저장
    const toggleItem = (id: string) => {
        setCompletedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            try {
                localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
            } catch (e) {
                console.error("Failed to save todo state:", e);
            }
            return next;
        });
    };

    // 오늘 실천 리셋
    const handleReset = () => {
        if (window.confirm("오늘의 체크리스트를 모두 초기화하시겠습니까?")) {
            setCompletedIds(new Set());
            try {
                localStorage.removeItem(storageKey);
            } catch (e) {
                console.error("Failed to reset todo state:", e);
            }
        }
    };

    // 전체 선택
    const handleSelectAll = () => {
        const next = new Set(allItems.map(item => item.id));
        setCompletedIds(next);
        try {
            localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
        } catch (e) {
            console.error("Failed to save todo state:", e);
        }
    };

    // 📋 원클릭 클립보드 복사
    const handleCopyText = async () => {
        try {
            const studentName = result.student?.name || '학생';
            const textToCopy = generateTodoCopyText(todoGroups, studentName, todayStr);
            await navigator.clipboard.writeText(textToCopy);
            setShowCopyToast(true);
            setTimeout(() => {
                setShowCopyToast(false);
            }, 3500);
        } catch (err) {
            console.error("Failed to copy todo text:", err);
            alert("클립보드 복사에 실패했습니다. 브라우저 권한을 확인해주세요.");
        }
    };

    // 통계 계산
    const totalCount = allItems.length;
    const completedCount = completedIds.size;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // 🔒 FREE 회원 전용 잠금 화면
    if (!isProOrAbove) {
        return (
            <div id="section-daily-todo" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-7 bg-indigo-600 rounded-full shrink-0"></div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-slate-900">
                                📋 데일리 뉴로-루틴 1일 실천 To-Do 플래너
                            </h3>
                            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 border border-blue-200 text-xs font-black rounded-full">
                                ⚡ PRO 이상 전용
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            방대한 보고서 분석 내용을 행동 단위별 체크박스로 정리하여 매일 복사·실천할 수 있는 맞춤 계획서입니다.
                        </p>
                    </div>
                </div>

                {/* 잠금 배너 */}
                <div className="p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl text-white border border-indigo-500/30 flex flex-col items-center text-center space-y-4 shadow-xl">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-3xl">
                        <Lock className="w-7 h-7 text-indigo-300" />
                    </div>
                    <div className="space-y-2 max-w-lg">
                        <h4 className="text-lg font-bold text-white">
                            나만의 1일 맞춤 To-Do 체크리스트가 잠겨 있습니다
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            피검자의 생체리듬(아침·점심·저녁), 두뇌 집중 골든타임, 3-Tier 맞춤 영양제 복용, 멘탈 회복 루틴이 행동 단위별로 1개씩 체크할 수 있도록 정리된 <strong>1일 뉴로 액션 플랜</strong>은 <strong>1회 리포트 및 정기결제 회원</strong>에게 전면 개방됩니다.
                        </p>
                    </div>
                    {onUpgradeClick && (
                        <button
                            onClick={onUpgradeClick}
                            className="mt-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 text-white font-black text-sm rounded-xl shadow-lg transition-all active:scale-95"
                        >
                            ⚡ 리포트 회원 / 정기결제로 플래너 개방하기
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // 🔓 PRO 이상 유료회원 인터랙티브 To-Do 플래너 화면
    return (
        <div id="section-daily-todo" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm print-avoid-break relative overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-7 bg-indigo-600 rounded-full shrink-0"></div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-xl font-bold text-slate-900">
                                📋 데일리 뉴로-루틴 1일 실천 To-Do 플래너
                            </h3>
                            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 border border-blue-200 text-xs font-black rounded-full">
                                ⚡ PRO 실천 케어
                            </span>
                            <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                {todayStr}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            보고서의 복잡한 분석을 단순화하여 <strong>오늘 당장 실행할 행동을 1개씩 체크</strong>하고, 매일 복사해서 쓸 수 있도록 설계된 실천 계획서입니다.
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                    <button
                        onClick={handleCopyText}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0"
                        title="카카오톡이나 플래너에 붙여넣을 수 있도록 전체 텍스트를 복사합니다."
                    >
                        <Copy className="w-3.5 h-3.5" />
                        <span>📋 오늘 To-Do 전체 복사</span>
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 font-bold text-xs rounded-xl transition flex items-center gap-1 shrink-0"
                        title="오늘 체크한 상태를 초기화합니다."
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>초기화</span>
                    </button>
                </div>
            </div>

            {/* 실천 촉진 안내 배너 (매일 복사해서 실행해 주라는 가이드) */}
            <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 border border-indigo-200 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg shrink-0">
                        💡
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-indigo-950">
                            매일 아침 본 To-Do 목록을 복사하여 책상이나 플래너에 두고 실천해보세요!
                        </h4>
                        <p className="text-[11px] text-indigo-700">
                            상단의 <strong>[📋 오늘 To-Do 전체 복사]</strong> 버튼을 누르면 카카오톡(나에게 보내기)이나 메모장에 즉시 붙여넣어 매일 아침 체크할 수 있습니다.
                        </p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-white/80 px-3 py-1.5 rounded-xl border border-indigo-100 shrink-0">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>작은 루틴의 반복 = 성적 향상</span>
                </div>
            </div>

            {/* 실천 달성률 프로그레스 바 */}
            <div className="mb-8 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                            오늘의 뉴로-루틴 실천 달성률
                        </span>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                            {completedCount} / {totalCount}개 완수
                        </span>
                    </div>
                    <div className="text-sm font-black text-indigo-700">
                        {progressPercent}%
                    </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
                    <div 
                        className="bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 h-3 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
                <div className="flex justify-between items-center mt-2 text-[11px] text-slate-500">
                    <span>
                        {progressPercent === 100 ? '🎉 대단합니다! 오늘의 모든 두뇌 루틴을 완수하셨습니다!' : progressPercent >= 50 ? '👏 훌륭한 진행입니다! 남은 루틴도 차근차근 이어가세요.' : '💪 시작이 반입니다! 아침 루틴부터 하나씩 체크해보세요.'}
                    </span>
                    <button 
                        onClick={handleSelectAll}
                        className="text-slate-500 hover:text-indigo-600 underline text-[11px] font-semibold"
                    >
                        모두 완료 처리
                    </button>
                </div>
            </div>

            {/* 4대 To-Do 그룹 그리드 */}
            <div className="space-y-6">
                {todoGroups.map((group) => (
                    <div 
                        key={group.categoryKey}
                        className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition"
                    >
                        {/* 그룹 헤더 */}
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 flex-wrap gap-2">
                            <div className="flex items-center gap-2.5">
                                <span className="text-2xl">{group.icon}</span>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-base font-bold text-slate-900">
                                            {group.categoryTitle}
                                        </h4>
                                        <span className={`text-[11px] px-2 py-0.5 rounded-full border font-bold ${group.badgeColor}`}>
                                            {group.items.filter(i => completedIds.has(i.id)).length} / {group.items.length} 완료
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {group.categorySubtitle}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 아이템 목록: 각각 독립된 체크박스 */}
                        <div className="grid grid-cols-1 gap-2.5">
                            {group.items.map((item) => {
                                const isChecked = completedIds.has(item.id);
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => toggleItem(item.id)}
                                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                                            isChecked
                                                ? 'bg-slate-50/80 border-slate-200 text-slate-400'
                                                : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs text-slate-800'
                                        }`}
                                    >
                                        {/* 체크박스 아이콘 */}
                                        <div className="mt-0.5 shrink-0 text-indigo-600">
                                            {isChecked ? (
                                                <CheckSquare className="w-5 h-5 text-emerald-600" />
                                            ) : (
                                                <Square className="w-5 h-5 text-slate-300 hover:text-indigo-500 transition" />
                                            )}
                                        </div>

                                        {/* 텍스트 내용 */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                                                    isChecked 
                                                        ? 'bg-slate-200 text-slate-500' 
                                                        : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                                }`}>
                                                    {item.timing}
                                                </span>
                                                <h5 className={`text-sm font-bold ${isChecked ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                                    {item.title}
                                                </h5>
                                                {item.isCore && (
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${isChecked ? 'bg-slate-200 text-slate-400' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                                        핵심
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-xs leading-relaxed ${isChecked ? 'text-slate-400' : 'text-slate-600'}`}>
                                                {item.description}
                                            </p>
                                            <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                                                <span className={`font-semibold shrink-0 ${isChecked ? 'text-slate-400' : 'text-emerald-700'}`}>
                                                    기대 효과:
                                                </span>
                                                <span className={isChecked ? 'text-slate-400' : 'text-slate-500'}>
                                                    {item.scientificEffect}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* 토스트 팝업 */}
            {showCopyToast && (
                <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-indigo-400/40 flex items-center gap-3 animate-bounce">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                        <p className="text-xs font-bold text-white">오늘의 To-Do 목록이 복사되었습니다!</p>
                        <p className="text-[11px] text-slate-300">카카오톡이나 플래너에 붙여넣어 매일 실천해보세요.</p>
                    </div>
                </div>
            )}
        </div>
    );
};
