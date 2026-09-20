import React, { useMemo } from 'react';
import { safeStorage } from '../../utils/safeStorage';
import { computeFollowUpReminder } from '../../services/followUpReminder';

interface FollowUpReminderBannerProps {
    /** 재검사 시작 콜백 (선택). 없으면 안내만 표시합니다. */
    onStart?: () => void;
    className?: string;
}

/**
 * 정밀 재검사(2주 추적) 인앱 리마인더 배너 (P1-2)
 *
 * - 기존 화면 레이아웃을 변경하지 않도록 화면 우측 하단에 고정(fixed)으로 "추가"만 합니다.
 * - 최근 진단일은 localStorage 'sn1_history' 미러(최신순)에서 읽습니다. 이력이 없으면 아무것도 렌더하지 않습니다.
 * - 재검사 임박(D-3 이내) 또는 기한 도래/경과일 때만 표시되어 평상시에는 보이지 않습니다.
 */
export const FollowUpReminderBanner: React.FC<FollowUpReminderBannerProps> = ({ onStart, className }) => {
    const status = useMemo(() => {
        const history = safeStorage.getJSON<Array<{ date?: string }>>('sn1_history', []);
        const lastDate = Array.isArray(history) && history[0]?.date ? history[0].date : null;
        return computeFollowUpReminder(lastDate);
    }, []);

    if (!status.hasBaseline || status.stage === 'none') return null;
    // 임박(D-3 이내) 또는 도래/경과일 때만 노출
    if (status.stage === 'upcoming' && status.daysRemaining > 3) return null;

    const isUrgent = status.stage === 'due' || status.stage === 'overdue';

    return (
        <div
            role="status"
            aria-live="polite"
            className={`fixed right-4 bottom-4 z-[60] w-[calc(100vw-2rem)] sm:w-auto sm:max-w-sm no-print ${className || ''}`}
        >
            <div
                className={`rounded-2xl shadow-lg px-4 py-3 flex items-start gap-3 border ${isUrgent ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
                    }`}
            >
                <span className="text-xl leading-none">🔁</span>
                <div className="flex-1">
                    <p className="text-xs font-black">정밀 재검사 리마인더</p>
                    <p className="text-[11px] mt-0.5 leading-relaxed">{status.label}</p>
                    {onStart && (
                        <button
                            onClick={onStart}
                            className="mt-2 text-[11px] font-bold bg-amber-600 text-white px-3 py-1 rounded-lg hover:bg-amber-700 transition-colors"
                        >
                            지금 재검사 시작
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};