import React, { useState } from 'react';
import { GradeGoal, SubjectGrade } from '../../types';
import { SUNEUNG_SUBJECTS } from '../../data/suneungSubjects';
import { UNIVERSITIES } from '../../data/universities';

interface GradeGoalSettingProps {
    studentId: string;
    subjectId: string;
    currentGoal?: GradeGoal;
    currentGrade?: number;
    onSave: (goal: GradeGoal) => void;
    onDelete?: (id: string) => void;
    onCancel: () => void;
}

export const GradeGoalSetting: React.FC<GradeGoalSettingProps> = ({ 
    studentId, subjectId, currentGoal, currentGrade, onSave, onDelete, onCancel 
}) => {
    const subjectInfo = SUNEUNG_SUBJECTS.find(s => s.id === subjectId);
    
    const [tier1Target, setTier1Target] = useState(currentGoal?.tier1Target || currentGrade || 5);
    const [tier2Target, setTier2Target] = useState(currentGoal?.tier2Target || Math.max(1, (currentGrade || 5) - 1));
    const [tier3Target, setTier3Target] = useState(currentGoal?.tier3Target || Math.max(1, (currentGrade || 5) - 2));
    const [memo, setMemo] = useState(currentGoal?.memo || '');



    const handleSave = () => {
        if (tier3Target > tier2Target || tier2Target > tier1Target) {
            alert('목표 등급은 [1차 목표 ≥ 2차 목표 ≥ 최종 목표] 순으로 설정해야 합니다. (낮은 숫자가 높은 등급)');
            return;
        }

        onSave({
            id: currentGoal?.id || crypto.randomUUID(),
            studentId,
            subjectId,
            tier1Target,
            tier2Target,
            tier3Target,
            currentGrade,
            memo
        });
    };

    if (!subjectInfo) return null;

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">
                    <span className="text-blue-600 mr-2">{subjectInfo.name}</span> 목표 설정
                </h3>
                {currentGrade && (
                    <div className="text-sm font-bold bg-slate-100 px-3 py-1 rounded-lg text-slate-600">
                        현재 등급: {currentGrade}등급
                    </div>
                )}
            </div>

            <div className="space-y-8">
                {/* Tier 1 */}
                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <label className="font-bold text-slate-700">1차 목표 (현실적)</label>
                        <span className="text-xl font-black text-blue-600">{tier1Target}등급</span>
                    </div>
                    <input 
                        type="range" min="1" max="9" step="1"
                        value={tier1Target} onChange={e => setTier1Target(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>1등급</span><span>9등급</span>
                    </div>
                </div>

                {/* Tier 2 */}
                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <label className="font-bold text-slate-700">2차 목표 (도전적)</label>
                        <span className="text-xl font-black text-indigo-600">{tier2Target}등급</span>
                    </div>
                    <input 
                        type="range" min="1" max="9" step="1"
                        value={tier2Target} onChange={e => setTier2Target(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>1등급</span><span>9등급</span>
                    </div>
                </div>

                {/* Tier 3 */}
                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <label className="font-bold text-slate-700">최종 목표 (궁극적)</label>
                        <span className="text-xl font-black text-emerald-600">{tier3Target}등급</span>
                    </div>
                    <input 
                        type="range" min="1" max="9" step="1"
                        value={tier3Target} onChange={e => setTier3Target(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>1등급</span><span>9등급</span>
                    </div>
                </div>

                {/* Memo */}
                <div className="space-y-2 pt-4 border-t border-slate-100">
                    <label className="text-sm font-bold text-slate-700">다짐 / 메모</label>
                    <input 
                        type="text" 
                        value={memo} onChange={e => setMemo(e.target.value)}
                        placeholder="이 목표를 달성하기 위한 나의 다짐..."
                        className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                {currentGoal && onDelete && (
                    <button onClick={() => onDelete(currentGoal.id)} className="px-4 py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-bold hover:bg-rose-100 transition-colors">
                        삭제
                    </button>
                )}
                <button onClick={onCancel} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                    취소
                </button>
                <button onClick={handleSave} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md">
                    저장하기
                </button>
            </div>
        </div>
    );
};
