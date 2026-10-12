import React from 'react';
import type { ReadinessStatus } from '../../services/assessmentReadiness';

interface UnassessedNoticeProps {
    studentName: string;
    readiness: ReadinessStatus;
    provisionalGuide: string;
    onContinue: () => void;
    onHome: () => void;
}

// 판정 불가(UNASSESSED) 시 리포트 대신 보여주는 미완료 안내
export const UnassessedNotice: React.FC<UnassessedNoticeProps> = ({
    studentName, readiness, provisionalGuide, onContinue, onHome,
}) => {
    return (
        <div className="max-w-2xl mx-auto my-8 px-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 md:p-8 shadow-xl">
                <div className="text-center mb-6">
                    <div className="text-4xl mb-3">📋</div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                        아직 판정할 수 없습니다
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                        {studentName} 님의 검사 입력이 부족해 유형 판정이 내려지지 않았습니다.
                        판정이 있어야 리포트가 열리는 구조이므로, 아래 부족 항목을 채우고 검사를 이어가 주세요.
                    </p>
                </div>

                <div className="mb-6">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1.5">
                        <span>검사 완성도</span>
                        <span>{readiness.completionRate}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-indigo-500 rounded-full transition-all"
                            style={{ width: `${Math.min(100, Math.max(0, readiness.completionRate))}%` }}
                        />
                    </div>
                </div>

                {readiness.incomplete.length > 0 && (
                    <div className="mb-6">
                        <div className="text-xs font-black text-slate-700 dark:text-slate-200 mb-2">
                            부족한 항목 ({readiness.incomplete.length}개)
                        </div>
                        <ul className="space-y-1.5">
                            {readiness.incomplete.map(item => (
                                <li
                                    key={item.key}
                                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                                >
                                    <span className="font-bold text-slate-700 dark:text-slate-200">
                                        {item.required && <span className="text-rose-500 mr-1">[필수]</span>}
                                        {item.label}
                                    </span>
                                    <span className="text-slate-400 font-mono">
                                        {item.answered}/{item.total}{item.partial ? ' (진행중)' : ''}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-black text-slate-700 dark:text-slate-200 mb-1.5">
                        그 전에 실천할 기초 관리 수칙
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                        {provisionalGuide}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        type="button"
                        onClick={onContinue}
                        className="flex-1 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl transition-colors cursor-pointer"
                    >
                        검사 이어하기 →
                    </button>
                    <button
                        type="button"
                        onClick={onHome}
                        className="flex-1 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-2xl transition-colors cursor-pointer"
                    >
                        처음으로
                    </button>
                </div>
            </div>
        </div>
    );
};
