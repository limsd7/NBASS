// 예측 엔진 (Prediction Engine)
// 로직 기반 위험 예측 및 추세 분석

import { CareType, AssessmentResult, HRVData, SurveyData, ProtocolData, LearningAnalyticsData, PredictionResult, RiskPrediction, TrendAnalysis } from '../types';
import { evaluateCondition, LogicCondition } from '../logicEngine';
import { RiskPredictionRule, TrendCondition, loadPredictionRules } from '../data/predictionRules';

// ========== 필드 라벨 맵 ==========

const FIELD_LABELS: Record<string, string> = {
    'hrv.sns': '교감신경(SNS)',
    'hrv.pns': '부교감신경(PNS)',
    'hrv.fatigue': '누적 피로도',
    'hrv.vitality': '신체 활력도',
    'hrv.brainScore': '두뇌 건강점수',
    'hrv.concentrationLevel': '집중력 레벨',
    'survey.bai': '불안 지수(BAI)',
    'survey.isi': '수면 문제(ISI)',
    'survey.adrenalFatigueScore': '부신피로 점수',
    'protocol.motivationalFactor': '학습 동기',
    'protocol.stressLevel': '스트레스 레벨',
    'analytics.pureStudyRatio': '순공 비율',
    'cognitive.workingMemory.overallLevel': '작업기억 레벨',
    'cognitive.workingMemory.forwardSpan': '정순향 기억 한도',
    'cognitive.attention.reactionTime': '평균 반응속도',
    'cognitive.attention.mistakes.commission': '충동적 오답 수',
    'cognitive.delayDiscounting.impulsivityLevel': '충동성 레벨',
    'cognitive.processingSpeed.averageWPM': '처리 속도(WPM)'
};

// ========== 유틸리티 함수 ==========

function getFieldValue(data: { hrv: any; survey: any; protocol?: any; analytics?: any; cognitive?: any }, field: string): number | null {
    const parts = field.split('.');
    const category = parts[0];
    
    let rootValue: any;
    if (category === 'hrv') rootValue = data.hrv;
    else if (category === 'survey') rootValue = data.survey;
    else if (category === 'protocol') rootValue = data.protocol;
    else if (category === 'analytics') rootValue = data.analytics;
    else if (category === 'cognitive') rootValue = data.cognitive;
    else return null;

    if (rootValue === undefined || rootValue === null) return null;

    let value: any = rootValue;
    for (let i = 1; i < parts.length; i++) {
        if (value === undefined || value === null) return null;
        value = value[parts[i]];
    }

    return typeof value === 'number' ? value : null;
}

function formatCondition(cond: LogicCondition): string {
    const label = FIELD_LABELS[cond.field] || cond.field;
    const opMap: Record<string, string> = {
        '>=': '≥',
        '<=': '≤',
        '>': '>',
        '<': '<',
        '==': '=',
        '!=': '≠'
    };
    return `${label} ${opMap[cond.operator] || cond.operator} ${cond.value}`;
}

// ========== 추세 분석 ==========

export function analyzeTrends(
    history: AssessmentResult[],
    fields: string[] = ['hrv.sns', 'hrv.pns', 'hrv.brainScore', 'survey.bai', 'survey.isi', 'cognitive.processingSpeed.averageWPM', 'cognitive.workingMemory.forwardSpan', 'cognitive.attention.reactionTime']
): TrendAnalysis[] {
    if (history.length < 2) return [];

    // 시간순 정렬 (오래된 것 먼저)
    const sorted = [...history].sort((a, b) =>
        new Date(a.student.testDate).getTime() - new Date(b.student.testDate).getTime()
    );

    const results: TrendAnalysis[] = [];

    for (const field of fields) {
        const values: number[] = [];

        for (const record of sorted) {
            const val = getFieldValue({
                hrv: record.hrv,
                survey: record.survey,
                protocol: record.protocol,
                analytics: record.analytics,
                cognitive: record.cognitiveResults
            }, field);

            if (val !== null) values.push(val);
        }

        if (values.length < 2) continue;

        const currentValue = values[values.length - 1];
        const previousValue = values[values.length - 2];
        const delta = currentValue - previousValue;
        const deltaPercent = previousValue !== 0 ? (delta / previousValue) * 100 : 0;

        let direction: 'up' | 'down' | 'stable';
        if (Math.abs(deltaPercent) < 3) direction = 'stable';
        else direction = delta > 0 ? 'up' : 'down';

        const label = FIELD_LABELS[field] || field;
        let interpretation: string;

        if (direction === 'stable') {
            interpretation = `${label}이(가) 유지되고 있습니다 (${currentValue.toFixed(0)})`;
        } else {
            const arrow = direction === 'up' ? '↑' : '↓';
            const change = direction === 'up' ? '상승' : '하락';
            interpretation = `${label} ${previousValue.toFixed(0)} → ${currentValue.toFixed(0)} (${arrow} ${Math.abs(deltaPercent).toFixed(1)}% ${change})`;
        }

        results.push({
            field,
            fieldLabel: label,
            currentValue,
            previousValue,
            delta,
            deltaPercent,
            direction,
            interpretation
        });
    }

    return results;
}

// ========== 추세 조건 평가 ==========

function evaluateTrendCondition(
    condition: TrendCondition,
    history: AssessmentResult[]
): boolean {
    if (history.length < condition.minDataPoints) return false;

    const sorted = [...history].sort((a, b) =>
        new Date(a.student.testDate).getTime() - new Date(b.student.testDate).getTime()
    );

    const values: number[] = [];
    for (const record of sorted.slice(-condition.minDataPoints)) {
        const val = getFieldValue({
            hrv: record.hrv,
            survey: record.survey,
            protocol: record.protocol,
            analytics: record.analytics,
            cognitive: record.cognitiveResults
        }, condition.field);

        if (val !== null) values.push(val);
    }

    if (values.length < condition.minDataPoints) return false;

    // 평균 변화율 계산
    let totalChange = 0;
    for (let i = 1; i < values.length; i++) {
        totalChange += values[i] - values[i - 1];
    }
    const avgChange = totalChange / (values.length - 1);

    switch (condition.trendType) {
        case 'increasing':
            return avgChange >= condition.threshold;
        case 'decreasing':
            return avgChange <= -condition.threshold;
        case 'stable':
            return Math.abs(avgChange) < condition.threshold;
        case 'volatile':
            // 변동성 체크: 연속된 변화 방향이 다름
            let directionChanges = 0;
            for (let i = 2; i < values.length; i++) {
                const prev = values[i - 1] - values[i - 2];
                const curr = values[i] - values[i - 1];
                if ((prev > 0 && curr < 0) || (prev < 0 && curr > 0)) {
                    directionChanges++;
                }
            }
            return directionChanges >= values.length / 2;
        default:
            return false;
    }
}

// ========== 단일 데이터 예측 ==========

export function predictFromSingleData(
    hrv: HRVData,
    survey: SurveyData,
    protocol?: ProtocolData,
    analytics?: LearningAnalyticsData,
    cognitive?: any,
    rules?: RiskPredictionRule[]
): RiskPrediction[] {
    const rulesSet = rules || loadPredictionRules();
    const data = { hrv, survey, protocol, analytics, cognitive };
    const predictions: RiskPrediction[] = [];

    for (const rule of rulesSet) {
        if (!rule.enabled) continue;
        if (rule.trendRequired) continue; // 추세 필수 규칙은 스킵

        // 조건 평가
        const results = rule.currentConditions.map(cond =>
            evaluateCondition(cond, data)
        );

        const passed = rule.currentCombinator === 'AND'
            ? results.every(r => r)
            : results.some(r => r);

        if (passed) {
            predictions.push({
                ruleId: rule.id,
                ruleName: rule.name,
                ruleNameKr: rule.nameKr,
                riskType: rule.prediction.riskType,
                probability: rule.prediction.probability,
                timeframe: rule.prediction.timeframe === '1week' ? '1주 내'
                    : rule.prediction.timeframe === '2weeks' ? '2주 내' : '1달 내',
                severity: rule.prediction.severity,
                recommendations: rule.recommendations,
                consultScript: rule.consultScript,
                matchedConditions: rule.currentConditions.map(formatCondition),
                isTrendBased: false
            });
        }
    }

    // 우선순위 + 확률 순 정렬
    return predictions.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
        if (sevDiff !== 0) return sevDiff;
        return b.probability - a.probability;
    });
}

// ========== 추세 기반 예측 ==========

export function predictFromTrends(
    currentData: AssessmentResult,
    history: AssessmentResult[],
    rules?: RiskPredictionRule[]
): RiskPrediction[] {
    if (history.length < 2) return [];

    const rulesSet = rules || loadPredictionRules();
    const data = {
        hrv: currentData.hrv,
        survey: currentData.survey,
        protocol: currentData.protocol,
        analytics: currentData.analytics,
        cognitive: currentData.cognitiveResults
    };
    const predictions: RiskPrediction[] = [];

    for (const rule of rulesSet) {
        if (!rule.enabled) continue;
        if (!rule.trendConditions || rule.trendConditions.length === 0) continue;

        // 현재 조건 평가
        const currentResults = rule.currentConditions.map(cond =>
            evaluateCondition(cond, data)
        );

        const currentPassed = rule.currentCombinator === 'AND'
            ? currentResults.every(r => r)
            : currentResults.some(r => r);

        if (!currentPassed) continue;

        // 추세 조건 평가
        const trendResults = rule.trendConditions.map(cond =>
            evaluateTrendCondition(cond, history)
        );

        const trendPassed = trendResults.every(r => r); // 추세 조건은 항상 AND

        if (trendPassed) {
            predictions.push({
                ruleId: rule.id,
                ruleName: rule.name,
                ruleNameKr: rule.nameKr,
                riskType: rule.prediction.riskType,
                probability: rule.prediction.probability,
                timeframe: rule.prediction.timeframe === '1week' ? '1주 내'
                    : rule.prediction.timeframe === '2weeks' ? '2주 내' : '1달 내',
                severity: rule.prediction.severity,
                recommendations: rule.recommendations,
                consultScript: rule.consultScript,
                matchedConditions: rule.currentConditions.map(formatCondition),
                isTrendBased: true
            });
        }
    }

    return predictions.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
        if (sevDiff !== 0) return sevDiff;
        return b.probability - a.probability;
    });
}

// ========== 종합 예측 생성 ==========

export function generatePrediction(
    currentData: AssessmentResult,
    history: AssessmentResult[] = [],
    rules?: RiskPredictionRule[]
): PredictionResult {
    // 단일 데이터 예측
    const singlePredictions = predictFromSingleData(
        currentData.hrv,
        currentData.survey,
        currentData.protocol,
        currentData.analytics,
        currentData.cognitiveResults,
        rules
    );

    // 추세 기반 예측 (히스토리가 있을 때만)
    const trendPredictions = history.length >= 2
        ? predictFromTrends(currentData, history, rules)
        : [];

    // 추세 분석
    const trends = analyzeTrends(history);

    // 중복 제거 및 병합 (추세 기반이 우선)
    const allPredictions = [...trendPredictions];
    for (const pred of singlePredictions) {
        if (!allPredictions.some(p => p.ruleId === pred.ruleId)) {
            allPredictions.push(pred);
        }
    }

    // 전체 심각도 결정
    let overallSeverity: 'healthy' | 'caution' | 'warning' | 'critical' = 'healthy';
    if (allPredictions.some(p => p.severity === 'critical')) {
        overallSeverity = 'critical';
    } else if (allPredictions.some(p => p.severity === 'high')) {
        overallSeverity = 'warning';
    } else if (allPredictions.some(p => p.severity === 'medium')) {
        overallSeverity = 'caution';
    }

    // 종합 가이드 생성
    let overallGuide: string;
    if (allPredictions.length === 0) {
        overallGuide = '현재 특별한 위험 신호가 감지되지 않았습니다. 현재 상태를 유지하면서 꾸준히 관리해 주세요.';
    } else if (overallSeverity === 'critical') {
        overallGuide = '⚠️ 즉각적인 조치가 필요합니다. 학습보다 건강 회복을 최우선으로 해주세요. 아래 권장 사항을 반드시 따라주세요.';
    } else if (overallSeverity === 'warning') {
        overallGuide = '주의가 필요한 상태입니다. 지금 조치를 취하면 악화를 예방할 수 있습니다. 아래 권장 사항을 참고해 주세요.';
    } else {
        overallGuide = '경미한 위험 신호가 있습니다. 크게 걱정할 수준은 아니지만, 예방 차원에서 관리해 주세요.';
    }

    return {
        studentId: currentData.student.id,
        studentName: currentData.student.name,
        generatedAt: new Date().toISOString(),
        risks: allPredictions,
        trends,
        overallGuide,
        overallSeverity,
        dataPointsUsed: history.length + 1,
        hasTrendData: history.length >= 2
    };
}

// ========== Burnout Risk Calculation (Phase 2) ==========
import { evaluateBrainBodyCoherence } from './brainBodyEngine';

export interface BurnoutRiskAssessment {
    riskLevel: number; // 0 to 100
    riskCategory: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    trend: 'IMPROVING' | 'STABLE' | 'WORSENING' | 'RAPID_DECLINE';
    warnings: string[];
    isAlert: boolean;
}

export function calculateBurnoutRisk(
    currentResult: AssessmentResult,
    history: AssessmentResult[]
): BurnoutRiskAssessment {
    // Sort history by date descending (newest first)
    const sortedHistory = [...history].sort((a, b) => new Date(b.student.testDate).getTime() - new Date(a.student.testDate).getTime());
    
    // Get up to 3 most recent results
    const recentPast = sortedHistory.slice(0, 3);
    
    const currentState = evaluateBrainBodyCoherence(currentResult.hrv, currentResult.survey, currentResult.careType);
    
    let riskScore = 0;
    const warnings: string[] = [];

    // 1. Current State Baseline Risk
    if (currentState.pnsLevel && currentState.snsLevel) {
        if (currentState.pnsLevel > 70) riskScore += 30; // High PNS (exhaustion)
        if (currentState.snsLevel < 30 && currentState.pnsLevel < 30) riskScore += 40; // Severe depletion
    }
    
    if (currentResult.survey.adrenalFatigueScore && currentResult.survey.adrenalFatigueScore > 15) {
        riskScore += 20;
    }

    if (currentState.coherence < 40) {
        riskScore += 20;
    }

    // 2. Trend Analysis
    let trend: 'IMPROVING' | 'STABLE' | 'WORSENING' | 'RAPID_DECLINE' = 'STABLE';
    
    if (recentPast.length >= 1) { // Compare with most recent past
        const pastState1 = evaluateBrainBodyCoherence(recentPast[0].hrv, recentPast[0].survey, recentPast[0].careType);
        
        const coherenceDrop = pastState1.coherence - currentState.coherence;
        
        if (coherenceDrop > 20) {
            trend = 'RAPID_DECLINE';
            riskScore += 25;
            warnings.push('단기간 내 진단 일치도 및 자율신경 밸런스가 급격히 무너졌습니다.');
        } else if (coherenceDrop > 5) {
            trend = 'WORSENING';
            riskScore += 10;
        } else if (coherenceDrop < -5) {
            trend = 'IMPROVING';
            riskScore -= 10;
        }

        if (pastState1.snsLevel && currentState.snsLevel && pastState1.snsLevel < 40 && currentState.snsLevel < 40) {
            warnings.push('만성적인 교감신경 저하(무기력) 패턴이 지속되고 있습니다.');
            riskScore += 15;
        }
    }

    // Cap the score
    const finalRiskLevel = Math.max(0, Math.min(100, riskScore));
    
    let riskCategory: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    let isAlert = false;

    if (finalRiskLevel >= 80) {
        riskCategory = 'CRITICAL';
        isAlert = true;
        warnings.unshift('🚨 [경고] 심각한 번아웃 징후가 포착되었습니다. 즉각적인 개입과 휴식이 필요합니다.');
    } else if (finalRiskLevel >= 60) {
        riskCategory = 'HIGH';
        isAlert = true;
        warnings.unshift('⚠️ 번아웃 위험군입니다. 피로도 관리가 시급합니다.');
    } else if (finalRiskLevel >= 40) {
        riskCategory = 'MODERATE';
        isAlert = true;
        warnings.unshift('💡 경미한 번아웃 징후가 보입니다. 휴식을 권장합니다.');
    }

    return {
        riskLevel: finalRiskLevel,
        riskCategory,
        trend,
        warnings,
        isAlert
    };
}
