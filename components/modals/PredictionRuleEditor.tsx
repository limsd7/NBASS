// 예측 규칙 편집기 모달 (Prediction Rule Editor Modal)
// 관리자가 새로운 예측 규칙을 직접 생성할 수 있는 UI

import React, { useState, useCallback } from 'react';
import { RiskPredictionRule, LogicCondition } from '../../data/predictionRules';
import { AVAILABLE_FIELDS as LOGIC_FIELDS } from '../../logicEngine';
import { CareType } from '../../types';

interface PredictionRuleEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (rule: RiskPredictionRule) => void;
    editingRule?: RiskPredictionRule | null; // null = new rule
}

// 사용 가능한 필드 목록
const AVAILABLE_FIELDS = [
    { value: 'hrv.sns', label: 'SNS (교감신경)', category: 'HRV' },
    { value: 'hrv.pns', label: 'PNS (부교감신경)', category: 'HRV' },
    { value: 'hrv.fatigue', label: '피로도', category: 'HRV' },
    { value: 'hrv.vitality', label: '활력도', category: 'HRV' },
    { value: 'hrv.brainScore', label: '두뇌점수', category: 'HRV' },
    { value: 'hrv.stressIndex', label: '스트레스 지수', category: 'HRV' },
    { value: 'survey.bai', label: 'BAI (불안)', category: '설문' },
    { value: 'survey.isi', label: 'ISI (불면)', category: '설문' },
    { value: 'survey.cfs', label: 'CFS (피로)', category: '설문' },
    { value: 'survey.concentration', label: '집중력', category: '설문' },
    { value: 'survey.adrenalFatigueScore', label: '부신피로점수', category: '설문' },
    { value: 'protocol.sleepHours', label: '수면시간', category: '프로토콜' },
    { value: 'protocol.studyHours', label: '학습시간', category: '프로토콜' },
    { value: 'protocol.stressLevel', label: '스트레스레벨', category: '프로토콜' }
];

const OPERATORS = [
    { value: '>', label: '>' },
    { value: '>=', label: '≥' },
    { value: '<', label: '<' },
    { value: '<=', label: '≤' },
    { value: '==', label: '=' }
];

const SEVERITY_OPTIONS = [
    { value: 'critical', label: '심각', color: 'bg-red-500' },
    { value: 'high', label: '높음', color: 'bg-orange-500' },
    { value: 'medium', label: '보통', color: 'bg-yellow-500' },
    { value: 'low', label: '낮음', color: 'bg-blue-500' }
];

const TIMEFRAME_OPTIONS = [
    { value: '1week', label: '1주 내' },
    { value: '2weeks', label: '2주 내' },
    { value: '1month', label: '1달 내' }
];

const RISK_TYPES: { value: CareType; label: string }[] = [
    { value: CareType.BURNOUT, label: '번아웃' },
    { value: CareType.SLEEP, label: '수면장애' },
    { value: CareType.CONCENTRATION, label: '학습효율저하' },
    { value: CareType.STRESS_OVERLOAD, label: '스트레스과부하' },
    { value: CareType.BRAIN_FATIGUE, label: '뇌피로' },
    { value: CareType.ADRENAL, label: '부신피로' },
    { value: CareType.ANXIETY_TENSION, label: '불안-긴장' },
    { value: CareType.LOW_ENERGY, label: '무기력' },
    { value: CareType.DEPRESSION_AMOTIVATION, label: '우울-무동기' },
    { value: CareType.HYPERSENSITIVE, label: '과민감' }
];

// 새 규칙 기본값
const createDefaultRule = (): Omit<RiskPredictionRule, 'id'> => ({
    name: 'Custom Rule',
    nameKr: '',
    enabled: true,
    trendRequired: false,
    currentConditions: [{ field: 'hrv.sns', operator: '>', value: 60 }],
    currentCombinator: 'AND',
    trendConditions: [],
    prediction: {
        riskType: CareType.BURNOUT,
        probability: 70,
        timeframe: '2weeks',
        severity: 'medium'
    },
    recommendations: [''],
    consultScript: '',
    priority: 10
});

export const PredictionRuleEditor: React.FC<PredictionRuleEditorProps> = ({
    isOpen,
    onClose,
    onSave,
    editingRule
}) => {
    const isNewRule = !editingRule;

    const [rule, setRule] = useState<Omit<RiskPredictionRule, 'id'>>(() => {
        if (editingRule) {
            const { id, ...rest } = editingRule;
            return rest;
        }
        return createDefaultRule();
    });

    // 조건 추가
    const addCondition = (type: 'current' | 'trend') => {
        const newCondition: LogicCondition = { field: 'hrv.sns', operator: '>', value: 50 };
        if (type === 'current') {
            setRule(prev => ({
                ...prev,
                currentConditions: [...prev.currentConditions, newCondition]
            }));
        } else {
            setRule(prev => ({
                ...prev,
                trendConditions: [...(prev.trendConditions || []), { trendType: 'increasing', field: 'hrv.sns', threshold: 10, minDataPoints: 2 }]
            }));
        }
    };

    // 조건 삭제
    const removeCondition = (type: 'current' | 'trend', index: number) => {
        if (type === 'current') {
            setRule(prev => ({
                ...prev,
                currentConditions: prev.currentConditions.filter((_, i) => i !== index)
            }));
        } else {
            setRule(prev => ({
                ...prev,
                trendConditions: (prev.trendConditions || []).filter((_, i) => i !== index)
            }));
        }
    };

    // 조건 업데이트
    const updateCondition = (type: 'current' | 'trend', index: number, updates: Partial<LogicCondition>) => {
        if (type === 'current') {
            setRule(prev => ({
                ...prev,
                currentConditions: prev.currentConditions.map((cond, i) =>
                    i === index ? { ...cond, ...updates } : cond
                )
            }));
        }
    };

    // 권장 조치 추가
    const addRecommendation = () => {
        setRule(prev => ({
            ...prev,
            recommendations: [...prev.recommendations, '']
        }));
    };

    // 권장 조치 업데이트
    const updateRecommendation = (index: number, value: string) => {
        setRule(prev => ({
            ...prev,
            recommendations: prev.recommendations.map((rec, i) => i === index ? value : rec)
        }));
    };

    // 권장 조치 삭제
    const removeRecommendation = (index: number) => {
        setRule(prev => ({
            ...prev,
            recommendations: prev.recommendations.filter((_, i) => i !== index)
        }));
    };

    // 저장
    const handleSave = () => {
        if (!rule.nameKr.trim() || !rule.consultScript.trim()) {
            alert('규칙 이름과 상담 스크립트는 필수입니다.');
            return;
        }

        const ruleId = editingRule?.id || `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        onSave({
            ...rule,
            id: ruleId,
            recommendations: rule.recommendations.filter(r => r.trim())
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-purple-50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🔮</span>
                        <div>
                            <h3 className="font-bold text-violet-900">
                                {isNewRule ? '새 예측 규칙 생성' : '예측 규칙 편집'}
                            </h3>
                            <p className="text-xs text-violet-600">학생의 미래 상태를 예측하는 규칙을 정의합니다</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                    {/* 기본 정보 */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                            <span>📝</span> 기본 정보
                        </h4>

                        <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">규칙 이름 (한글) *</label>
                            <input
                                type="text"
                                value={rule.nameKr}
                                onChange={(e) => setRule(prev => ({ ...prev, nameKr: e.target.value }))}
                                placeholder="예: 고강도 스트레스 번아웃 위험"
                                className="w-full p-2 text-sm border rounded-lg focus:ring-2 ring-violet-200 outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rule.enabled}
                                    onChange={(e) => setRule(prev => ({ ...prev, enabled: e.target.checked }))}
                                    className="w-4 h-4 accent-violet-600"
                                />
                                <span className="text-sm text-slate-700">활성화</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rule.trendRequired}
                                    onChange={(e) => setRule(prev => ({ ...prev, trendRequired: e.target.checked }))}
                                    className="w-4 h-4 accent-violet-600"
                                />
                                <span className="text-sm text-slate-700">추세 분석 필수</span>
                            </label>
                        </div>
                    </div>

                    {/* 트리거 조건 */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                            <span>⚡</span> 트리거 조건 (현재 데이터)
                        </h4>

                        {rule.currentConditions.map((cond, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg">
                                <select
                                    value={cond.field}
                                    onChange={(e) => updateCondition('current', idx, { field: e.target.value })}
                                    className="flex-1 p-2 text-sm border rounded bg-white"
                                >
                                    {AVAILABLE_FIELDS.map(f => (
                                        <option key={f.value} value={f.value}>{f.label}</option>
                                    ))}
                                </select>
                                <select
                                    value={cond.operator}
                                    onChange={(e) => updateCondition('current', idx, { operator: e.target.value as any })}
                                    className="w-16 p-2 text-sm border rounded bg-white text-center"
                                >
                                    {OPERATORS.map(op => (
                                        <option key={op.value} value={op.value}>{op.label}</option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    value={cond.value as (string | number)}
                                    onChange={(e) => updateCondition('current', idx, { value: parseFloat(e.target.value) || 0 })}
                                    className="w-20 p-2 text-sm border rounded bg-white text-center"
                                />
                                {rule.currentConditions.length > 1 && (
                                    <button
                                        onClick={() => removeCondition('current', idx)}
                                        className="text-red-400 hover:text-red-600"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}

                        <button
                            onClick={() => addCondition('current')}
                            className="text-xs text-violet-600 hover:text-violet-800 font-bold"
                        >
                            ➕ 조건 추가
                        </button>
                    </div>

                    {/* 예측 결과 설정 */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                            <span>🎯</span> 예측 결과 설정
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-600 block mb-1">위험 유형</label>
                                <select
                                    value={rule.prediction.riskType}
                                    onChange={(e) => setRule(prev => ({
                                        ...prev,
                                        prediction: { ...prev.prediction, riskType: e.target.value as CareType }
                                    }))}
                                    className="w-full p-2 text-sm border rounded-lg"
                                >
                                    {RISK_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 block mb-1">예측 시간대</label>
                                <select
                                    value={rule.prediction.timeframe}
                                    onChange={(e) => setRule(prev => ({
                                        ...prev,
                                        prediction: { ...prev.prediction, timeframe: e.target.value as any }
                                    }))}
                                    className="w-full p-2 text-sm border rounded-lg"
                                >
                                    {TIMEFRAME_OPTIONS.map(tf => (
                                        <option key={tf.value} value={tf.value}>{tf.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-600 block mb-2">
                                위험 확률: {rule.prediction.probability}%
                            </label>
                            <input
                                type="range"
                                min="10"
                                max="100"
                                step="5"
                                value={rule.prediction.probability}
                                onChange={(e) => setRule(prev => ({
                                    ...prev,
                                    prediction: { ...prev.prediction, probability: parseInt(e.target.value) }
                                }))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-600 block mb-2">심각도</label>
                            <div className="flex gap-2">
                                {SEVERITY_OPTIONS.map(sev => (
                                    <button
                                        key={sev.value}
                                        onClick={() => setRule(prev => ({
                                            ...prev,
                                            prediction: { ...prev.prediction, severity: sev.value as any }
                                        }))}
                                        className={`flex-1 py-2 text-xs rounded-lg font-bold transition ${rule.prediction.severity === sev.value
                                            ? `${sev.color} text-white`
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {sev.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 권장 조치 */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                            <span>✅</span> 권장 조치
                        </h4>

                        {rule.recommendations.map((rec, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={rec}
                                    onChange={(e) => updateRecommendation(idx, e.target.value)}
                                    placeholder="권장 조치 입력..."
                                    className="flex-1 p-2 text-sm border rounded-lg focus:ring-2 ring-violet-200 outline-none"
                                />
                                {rule.recommendations.length > 1 && (
                                    <button
                                        onClick={() => removeRecommendation(idx)}
                                        className="text-red-400 hover:text-red-600"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}

                        <button
                            onClick={addRecommendation}
                            className="text-xs text-violet-600 hover:text-violet-800 font-bold"
                        >
                            ➕ 권장 조치 추가
                        </button>
                    </div>

                    {/* 상담 스크립트 */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                            <span>💬</span> 상담 스크립트 *
                        </h4>
                        <textarea
                            value={rule.consultScript}
                            onChange={(e) => setRule(prev => ({ ...prev, consultScript: e.target.value }))}
                            placeholder="학생/학부모에게 전달할 상담 스크립트를 작성하세요..."
                            className="w-full p-3 text-sm border rounded-lg focus:ring-2 ring-violet-200 outline-none resize-none h-24"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-slate-600 font-bold rounded-lg hover:bg-slate-100 transition"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-violet-600 text-white font-bold rounded-lg hover:bg-violet-700 transition"
                    >
                        {isNewRule ? '규칙 생성' : '변경 저장'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PredictionRuleEditor;
