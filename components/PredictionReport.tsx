// 예측 보고서 컴포넌트 (Prediction Report)
// Expert Guide에서 사용되는 위험 예측 분석 UI

import React, { useState, useMemo } from 'react';
import { AssessmentResult } from '../types';
import { generatePrediction } from '../services/predictionEngine';
import { PredictionResult, RiskPrediction, TrendAnalysis } from '../types';
import { TrendChart } from './TrendChart';
import { PaywallOverlay } from './ui/PaywallOverlay';
import { MembershipTier } from '../utils/featureGate';

interface PredictionReportProps {
    currentResult: AssessmentResult;
    history?: AssessmentResult[];
    membershipTier?: MembershipTier;
}

const severityColors = {
    critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', badge: 'bg-red-500' },
    high: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', badge: 'bg-orange-500' },
    medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', badge: 'bg-yellow-500' },
    low: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', badge: 'bg-blue-500' }
};

const overallColors = {
    critical: { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-900', icon: '🚨' },
    warning: { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-900', icon: '⚠️' },
    caution: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-900', icon: '⚡' },
    healthy: { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-900', icon: '✅' }
};

export const PredictionReport: React.FC<PredictionReportProps> = ({ currentResult, history = [], membershipTier }) => {
    const [expandedRisk, setExpandedRisk] = useState<string | null>(null);
    const [copiedScript, setCopiedScript] = useState<string | null>(null);

    // 예측 결과 생성
    const prediction: PredictionResult = useMemo(() => {
        return generatePrediction(currentResult, history);
    }, [currentResult, history]);

    // 클립보드 복사
    const copyToClipboard = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedScript(id);
            setTimeout(() => setCopiedScript(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const toggleExpand = (ruleId: string) => {
        setExpandedRisk(expandedRisk === ruleId ? null : ruleId);
    };

    const overallStyle = overallColors[prediction.overallSeverity];

    return (
        <PaywallOverlay currentTier={membershipTier || 'free'} requiredFeature="prediction_engine">
        <div className="space-y-6">
            {/* 헤더 */}
            <div className={`p-5 rounded-xl border-2 ${overallStyle.bg} ${overallStyle.border}`}>
                <div className="flex items-start gap-3">
                    <span className="text-3xl">{overallStyle.icon}</span>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className={`font-bold text-lg ${overallStyle.text}`}>
                                🔮 위험 예측 분석
                            </h3>
                            <span className="text-xs text-slate-500">
                                분석 데이터: {prediction.dataPointsUsed}개
                                {prediction.hasTrendData && ' (추세 포함)'}
                            </span>
                        </div>
                        <p className={`text-sm mt-2 ${overallStyle.text}`}>
                            {prediction.overallGuide}
                        </p>
                    </div>
                </div>
            </div>

            {/* 위험 예측 목록 */}
            {prediction.risks.length > 0 ? (
                <div className="space-y-3">
                    <h4 className="font-bold text-slate-700 flex items-center gap-2">
                        <span>🎯</span> 감지된 위험 신호 ({prediction.risks.length}건)
                    </h4>

                    {prediction.risks.map((risk) => {
                        const colors = severityColors[risk.severity];
                        const isExpanded = expandedRisk === risk.ruleId;

                        return (
                            <div
                                key={risk.ruleId}
                                className={`rounded-xl border-2 ${colors.bg} ${colors.border} overflow-hidden`}
                            >
                                {/* 요약 헤더 */}
                                <div
                                    className="p-4 cursor-pointer hover:brightness-95 transition"
                                    onClick={() => toggleExpand(risk.ruleId)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs font-bold text-white px-2 py-0.5 rounded ${colors.badge}`}>
                                                {risk.probability}%
                                            </span>
                                            <div>
                                                <p className={`font-bold ${colors.text}`}>
                                                    {risk.ruleNameKr}
                                                    {risk.isTrendBased && (
                                                        <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
                                                            추세 기반
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {risk.timeframe} · {risk.riskType}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-slate-400 text-lg">
                                            {isExpanded ? '▼' : '▶'}
                                        </span>
                                    </div>
                                </div>

                                {/* 상세 내용 */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 space-y-4 border-t border-slate-200/50">
                                        {/* 매칭된 조건 */}
                                        <div className="pt-3">
                                            <p className="text-xs font-bold text-slate-600 mb-2">📊 트리거 조건</p>
                                            <div className="flex flex-wrap gap-2">
                                                {risk.matchedConditions.map((cond, idx) => (
                                                    <span key={idx} className="text-xs px-2 py-1 bg-white/70 rounded border border-slate-200">
                                                        {cond}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 권장 조치 */}
                                        <div>
                                            <p className="text-xs font-bold text-slate-600 mb-2">✅ 권장 조치</p>
                                            <ul className="space-y-1">
                                                {risk.recommendations.map((rec, idx) => (
                                                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                                        <span className="text-green-500">•</span>
                                                        {rec}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* 상담 스크립트 */}
                                        <div className="bg-white/80 p-3 rounded-lg border border-slate-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-xs font-bold text-indigo-700">💬 상담 스크립트</p>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        copyToClipboard(risk.consultScript, risk.ruleId);
                                                    }}
                                                    className={`text-xs px-2 py-1 rounded transition ${copiedScript === risk.ruleId
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                                        }`}
                                                >
                                                    {copiedScript === risk.ruleId ? '✓ 복사됨' : '📋 복사'}
                                                </button>
                                            </div>
                                            <p className="text-sm text-slate-700 italic leading-relaxed">
                                                "{risk.consultScript}"
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-8 bg-green-50 rounded-xl border border-green-200">
                    <span className="text-4xl">✨</span>
                    <p className="text-green-800 font-bold mt-2">위험 신호 없음</p>
                    <p className="text-green-600 text-sm">현재 상태가 양호합니다</p>
                </div>
            )}

            {/* 추세 차트 (히스토리 2개 이상일 때) */}
            {history.length >= 2 && (
                <TrendChart history={[...history, currentResult]} />
            )}

            {/* 추세 분석 (텍스트) */}
            {prediction.trends.length > 0 && (
                <div className="space-y-3">
                    <h4 className="font-bold text-slate-700 flex items-center gap-2">
                        <span>📊</span> 상세 추세 데이터 (최근 {prediction.dataPointsUsed}회)
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {prediction.trends.map((trend) => {
                            const directionIcon = trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→';
                            const directionColor =
                                trend.field.includes('sns') || trend.field.includes('bai') || trend.field.includes('isi') || trend.field.includes('fatigue')
                                    ? (trend.direction === 'up' ? 'text-red-600' : trend.direction === 'down' ? 'text-green-600' : 'text-slate-500')
                                    : (trend.direction === 'up' ? 'text-green-600' : trend.direction === 'down' ? 'text-red-600' : 'text-slate-500');

                            return (
                                <div key={trend.field} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-700">{trend.fieldLabel}</span>
                                        <span className={`text-sm font-bold ${directionColor}`}>
                                            {trend.previousValue.toFixed(0)} → {trend.currentValue.toFixed(0)} {directionIcon}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {Math.abs(trend.deltaPercent).toFixed(1)}% {trend.direction === 'up' ? '상승' : trend.direction === 'down' ? '하락' : '유지'}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 데이터 부족 안내 */}
            {!prediction.hasTrendData && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <p className="text-sm text-slate-600">
                        💡 <strong>추세 분석</strong>을 위해서는 2회 이상의 측정 기록이 필요합니다.
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        정기적인 측정을 통해 더 정확한 예측이 가능합니다.
                    </p>
                </div>
            )}
        </div>
        </PaywallOverlay>
    );
};

export default PredictionReport;
