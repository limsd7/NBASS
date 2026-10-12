/**
 * 공부 효율성 정밀 검사 컴포넌트
 * - 크로노타입(MEQ): 아침형/저녁형 판별
 * - 학습 감각 유형(VARK): Visual/Auditory/Read-Write/Kinesthetic
 * - 시험 불안(TAI): 인지적 걱정 vs 신체적 긴장
 * - 디지털 중독: 스마트폰/숏폼 의존도
 * - 메타인지(MSLQ): 학습 전략 (시연/정교화/조직화)
 * 
 * HRV 모드, 의학 전문가 모드에서 모두 사용 가능
 * Portable 모드에서는 EEG 관련 항목 제외
 */

import React, { useState, useEffect } from 'react';
import { useStudyEfficiency, AssessmentType } from '../contexts/StudyEfficiencyContext';
import { SurveyData } from '../types';
import { mapSurveyDataToResults } from '../services/studyEfficiencyService';
import {
    CHRONOTYPE_QUESTIONS,
    CHRONOTYPE_DESCRIPTIONS,
    getChronotypeResult,
    ChronotypeResult,
    VARK_QUESTIONS,
    VARK_DESCRIPTIONS,
    calculateVARKResult,
    VARKResult,
    TAI_QUESTIONS,
    TAI_INTERVENTIONS,
    calculateTAIResult,
    TAIResult,
    DIGITAL_ADDICTION_QUESTIONS,
    DIGITAL_DETOX_PROTOCOLS,
    calculateDigitalAddictionResult,
    DigitalAddictionResult,
    METACOGNITION_QUESTIONS,
    METACOGNITION_RECOMMENDATIONS,
    calculateMetacognitionResult,
    MetacognitionResult,
    CARETYPE_ASSESSMENT_RECOMMENDATIONS
} from '../data/studyEfficiencyAssessments';
import { CareType } from '../types';
import { MembershipTier } from '../utils/featureGate';

interface StudyEfficiencyAssessmentProps {
    careType?: CareType;
    isPortableMode?: boolean;
    isInline?: boolean;  // Step 모드에서는 모달 오버레이 없이 인라인 렌더링
    isFreeMode?: boolean;
    membershipTier?: MembershipTier;
    initialSurveyData?: Partial<SurveyData> | null;
    initialData?: Partial<StudyEfficiencyResults> | null;
    onUpgrade?: () => void;
    onComplete: (results: StudyEfficiencyResults) => void;
    onClose?: () => void;  // isInline=true일 때는 선택적
}

// AssessmentType and StudyEfficiencyResults are now imported/managed via context or compatible types
// Retaining local export for backward compatibility if needed by other components, but ideally should use Context types
export interface StudyEfficiencyResults {
    chronotype?: { score: number; result: ChronotypeResult };
    vark?: VARKResult;
    testAnxiety?: TAIResult;
    digitalAddiction?: DigitalAddictionResult;
    metacognition?: MetacognitionResult;
    completedAt: string;
}

// AssessmentType definition removed as it is imported from Context

const ASSESSMENT_INFO: Record<AssessmentType, { title: string; description: string; icon: string; time: string }> = {
    chronotype: {
        title: '크로노타입 검사 (MEQ)',
        description: '"언제 공부할 때 가장 집중이 잘 되는가?"를 과학적으로 분석합니다.',
        icon: '🌅',
        time: '약 2분'
    },
    vark: {
        title: '학습 감각 유형 검사 (VARK)',
        description: '시각/청각/읽기쓰기/운동감각 중 어떤 방식이 효과적인지 파악합니다.',
        icon: '🎯',
        time: '약 3분'
    },
    testAnxiety: {
        title: '시험 불안 검사 (TAI)',
        description: '인지적 걱정 vs 신체적 긴장을 구분하여 맞춤 솔루션을 제공합니다.',
        icon: '😰',
        time: '약 3분'
    },
    digitalAddiction: {
        title: '디지털 의존도 검사',
        description: '스마트폰/숏폼 중독 여부와 도파민 민감도를 측정합니다.',
        icon: '📱',
        time: '약 2분'
    },
    metacognition: {
        title: '메타인지 학습 전략 검사',
        description: '"어떻게 공부하는가?"를 분석하여 학습법 업그레이드를 안내합니다.',
        icon: '🧠',
        time: '약 3분'
    }
};

export const StudyEfficiencyAssessment: React.FC<StudyEfficiencyAssessmentProps> = ({
    careType,
    isPortableMode = false,
    isInline = false,
    isFreeMode,
    membershipTier = 'free',
    initialSurveyData,
    initialData,
    onUpgrade,
    onComplete,
    onClose
}) => {
    const isFree = isFreeMode !== undefined ? isFreeMode : (membershipTier === 'free');
    // FREE/유료 모두 5종 전체 수행 가능. 결과 표시만 등급 게이트 (FREE: TAI만 표시)
    const [currentAssessment, setCurrentAssessment] = useState<AssessmentType | null>(null);

    // Global State from Context
    const {
        chronotypeAnswers, setChronotypeAnswers,
        varkAnswers, setVarkAnswers,
        taiAnswers, setTaiAnswers,
        digitalAnswers, setDigitalAnswers,
        metacognitionAnswers, setMetacognitionAnswers,
        results, setResults,
        completedAssessments, setCompletedAssessments
    } = useStudyEfficiency();

    // 기존에 완료된 검사 데이터 복원 및 완료 상태 세팅
    useEffect(() => {
        let restored: Partial<StudyEfficiencyResults> = {};
        if (initialData) {
            restored = { ...initialData };
        } else if (initialSurveyData) {
            restored = mapSurveyDataToResults(initialSurveyData as SurveyData, new Date().toISOString());
        }

        if (restored && Object.keys(restored).length > 0) {
            setResults({ ...results, ...restored });
            setCompletedAssessments(prev => {
                const updated = new Set(prev);
                if (restored.chronotype || initialSurveyData?.chronotypeResult || (initialSurveyData?.chronotypeScore !== undefined && initialSurveyData.chronotypeScore !== null)) {
                    updated.add('chronotype');
                }
                if (restored.vark || initialSurveyData?.varkPrimary || initialSurveyData?.varkScores) {
                    updated.add('vark');
                }
                if (restored.testAnxiety || initialSurveyData?.testAnxietyType || (initialSurveyData?.testAnxietyCognitive !== undefined && initialSurveyData.testAnxietyCognitive !== null)) {
                    updated.add('testAnxiety');
                }
                if (restored.digitalAddiction || initialSurveyData?.digitalAddictionLevel || (initialSurveyData?.digitalAddictionScore !== undefined && initialSurveyData.digitalAddictionScore !== null)) {
                    updated.add('digitalAddiction');
                }
                if (restored.metacognition || initialSurveyData?.metacognitionLevel || initialSurveyData?.metacognitionScores) {
                    updated.add('metacognition');
                }
                return updated;
            });
        }
    }, [initialSurveyData, initialData]);

    // 추천 검사 목록 (CareType 기반)
    const recommendedAssessments = careType
        ? CARETYPE_ASSESSMENT_RECOMMENDATIONS[careType]?.priority || []
        : ['chronotype', 'vark', 'metacognition'];

    const handleStartAssessment = (type: AssessmentType) => {
        // FREE 포함 전 등급 5종 모두 수행 가능 (결과 표시만 TAI 게이트)
        setCurrentAssessment(type);
    };

    const handleCompleteAssessment = (type: AssessmentType) => {
        let newResult: Partial<StudyEfficiencyResults> = { ...results };

        switch (type) {
            case 'chronotype':
                const chronoScore = chronotypeAnswers.reduce((a, b) => a + b, 0);
                newResult.chronotype = { score: chronoScore, result: getChronotypeResult(chronoScore) };
                break;
            case 'vark':
                newResult.vark = calculateVARKResult(varkAnswers);
                break;
            case 'testAnxiety':
                newResult.testAnxiety = calculateTAIResult(taiAnswers);
                break;
            case 'digitalAddiction':
                newResult.digitalAddiction = calculateDigitalAddictionResult(digitalAnswers);
                break;
            case 'metacognition':
                newResult.metacognition = calculateMetacognitionResult(metacognitionAnswers);
                break;
        }

        setResults(newResult);
        setCompletedAssessments(prev => new Set([...prev, type]));

        // 완료 후 검사 선택 목록으로 복귀 (FREE/유료 동일)
        setCurrentAssessment(null);
    };

    const handleFinish = () => {
        const digResult = results.digitalAddiction || ((digitalAnswers.some(a => a > 0) || isFree) ? calculateDigitalAddictionResult(digitalAnswers) : undefined);
        const finalResults: StudyEfficiencyResults = {
            ...results,
            ...(digResult ? { digitalAddiction: digResult } : {}),
            completedAt: new Date().toISOString()
        } as StudyEfficiencyResults;
        onComplete(finalResults);
    };

    // 선택 화면 렌더링
    const renderSelectionScreen = () => (
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    📊 공부 효율성 정밀 검사
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                    {isFree
                        ? 'FREE 모드: 5종 검사를 모두 수행할 수 있으며, 결과는 시험불안(TAI)만 표시됩니다.'
                        : '아래 검사들을 통해 나만의 최적 학습 전략을 파악하세요.'}
                </p>

                {/* 전체 설문 참여 / 무료 모드 안내 배너 */}
                {isFree ? (
                    <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/40 dark:to-purple-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl text-left shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">🌱</span>
                                <span className="text-xs font-black px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200">
                                    FREE 무료 체험 모드
                                </span>
                            </div>
                            {onUpgrade && (
                                <button
                                    onClick={onUpgrade}
                                    className="text-xs font-bold px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-sm transition-all"
                                >
                                    ⚡ PRO 업그레이드 (전체 5종 해금)
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                            FREE 모드에서는 <strong>5종 검사(크로노타입, VARK, TAI, 디지털 의존도, 메타인지)를 모두 수행</strong>할 수 있습니다.
                            <br />
                            검사 <strong>결과 표시</strong>는 <strong>시험불안(TAI)만 제공</strong>되며, 나머지 4종 결과는 <strong>PRO 이상 유료 멤버십</strong> 결제 시 전체 해금됩니다.
                        </p>
                    </div>
                ) : (
                    <div className="mt-3 p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-left flex items-start gap-2.5 shadow-sm">
                        <span className="text-xl shrink-0">👑</span>
                        <div className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                            <strong className="font-bold text-emerald-800 dark:text-emerald-300 block mb-0.5">📢 PRO 정밀 진단: 5종 전체 검사 해금 완료</strong>
                            5가지 모든 설문 검사(크로노타입, 학습감각 VARK, 시험불안 TAI, 디지털 의존도, 메타인지)가 모두 활성화되어 있습니다. <strong>모든 검사를 완료하실수록 가장 정밀하고 신뢰도 높은 맞춤 처방 진단</strong>을 산출하는 데 도움이 됩니다.
                        </div>
                    </div>
                )}

                {careType && careType !== CareType.UNASSESSED && (
                    <div className="mt-2.5 p-3 bg-blue-50/70 dark:bg-blue-900/30 rounded-xl">
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                            🎯 <strong>{careType}</strong> 맞춤 우선 추천 검사: {' '}
                            {recommendedAssessments.map((a, i) => (
                                <span key={a} className="font-bold">
                                    {ASSESSMENT_INFO[a as AssessmentType]?.title.split(' ')[0]}
                                    {i < recommendedAssessments.length - 1 ? ', ' : ''}
                                </span>
                            ))}
                        </p>
                    </div>
                )}

                {/* 상단 완료 버튼 - 항상 보이도록 (FREE/유료 동일: 1개 이상 완료 시 리포트 반영) */}
                <div className="mt-4">
                    <button
                        onClick={handleFinish}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${completedAssessments.size > 0
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:shadow-xl animate-pulse'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        disabled={completedAssessments.size === 0}
                    >
                        {completedAssessments.size >= 5
                            ? '✅ 5개 전체 검사 완료! 결과 리포트에 즉시 반영하기 →'
                            : completedAssessments.size > 0
                                ? `✅ ${completedAssessments.size}개 검사 완료! 결과 리포트에 반영하기 (남은 ${5 - completedAssessments.size}개) →`
                                : '검사를 시작해 주세요'}
                    </button>
                    {completedAssessments.size > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                            ({completedAssessments.size}/5 검사 완료{isFree
                                ? ' - FREE 모드에서는 TAI 결과만 리포트에 표시됩니다'
                                : completedAssessments.size < 5 ? `- 더 자세한 분석을 위해 남은 ${5 - completedAssessments.size}개 검사를 완료하거나 바로 리포트에 반영할 수 있습니다` : '- 5종 모든 정밀 검사가 완료되어 결과 리포트에 100% 반영됩니다'})
                        </p>
                    )}
                </div>
            </div>

            <div className="grid gap-4">
                {(Object.keys(ASSESSMENT_INFO) as AssessmentType[]).map(type => {
                    const info = ASSESSMENT_INFO[type];
                    const isCompleted = completedAssessments.has(type);
                    const isRecommended = recommendedAssessments.includes(type);
                    // FREE도 5종 모두 수행 가능. 결과 표시만 TAI 제외 잠금.
                    const isResultLocked = isFree && type !== 'testAnxiety';

                    return (
                        <div
                            key={type}
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                isCompleted
                                        ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                                        : isRecommended
                                            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:shadow-lg'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
                            }`}
                            onClick={() => handleStartAssessment(type)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{info.icon}</span>
                                    <div>
                                        <h3 className="font-semibold flex items-center gap-2 text-gray-800 dark:text-white">
                                            {info.title}
                                            {isCompleted && isResultLocked && (
                                                <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                                    🔒 결과 PRO 전용
                                                </span>
                                            )}
                                            {isRecommended && !isCompleted && (
                                                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">추천</span>
                                            )}
                                            {isCompleted && (
                                                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">완료 ✓</span>
                                            )}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {info.description}
                                        </p>
                                        {isResultLocked && (
                                            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                                                ※ 검사는 수행 가능하며, 결과는 PRO 이상 결제 시 확인 가능합니다. (TAI 결과는 FREE 제공)
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right shrink-0 ml-3">
                                    <span className="text-xs text-gray-400">{info.time}</span>
                                    {!isCompleted ? (
                                        <div className="mt-1 text-blue-500 font-bold">
                                            <span className="text-sm">시작 →</span>
                                        </div>
                                    ) : isResultLocked ? (
                                        <div
                                            className="mt-1 text-indigo-600 dark:text-indigo-400 font-bold text-xs bg-indigo-50 dark:bg-indigo-900/40 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800"
                                            onClick={(e) => { e.stopPropagation(); if (onUpgrade) onUpgrade(); }}
                                        >
                                            결과 잠금 🔒
                                        </div>
                                    ) : (
                                        <div className="mt-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs hover:underline">
                                            <span className="text-xs">재검사 / 수정 ↺</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 완료된 검사 결과 미리보기 (FREE는 TAI만 표시) */}
                            {isCompleted && !isResultLocked && renderResultPreview(type)}
                            {isCompleted && isResultLocked && (
                                <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); if (onUpgrade) onUpgrade(); }}
                                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        🔒 검사 완료됨 — 결과 확인은 PRO 업그레이드 후 가능 →
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t dark:border-gray-700">
                <div className="flex justify-between items-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300"
                    >
                        ← 이전 단계
                    </button>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        {isFree
                            ? `완료: ${completedAssessments.size}/${Object.keys(ASSESSMENT_INFO).length} 검사 (FREE · TAI 결과만 표시)`
                            : `완료: ${completedAssessments.size}/${Object.keys(ASSESSMENT_INFO).length} 검사`}
                    </div>
                </div>
                <button
                    onClick={handleFinish}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${completedAssessments.size > 0
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-xl'
                        : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                        }`}
                    disabled={completedAssessments.size === 0}
                >
                    {completedAssessments.size >= 5
                        ? '✅ 5종 전체 정밀 검사 완료! 결과 리포트에 즉시 반영하기 →'
                        : completedAssessments.size > 0
                            ? `✅ ${completedAssessments.size}개 완료! 결과 리포트에 즉시 반영하기 (남은 ${5 - completedAssessments.size}개) →`
                            : '⚠️ 최소 1개 이상의 검사를 완료해 주세요'}
                </button>
            </div>
        </div>
    );

    // 결과 미리보기
    const renderResultPreview = (type: AssessmentType) => {
        switch (type) {
            case 'chronotype':
                if (results.chronotype) {
                    const desc = CHRONOTYPE_DESCRIPTIONS[results.chronotype.result];
                    return (
                        <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                            <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                {desc.label} • 골든타임: {desc.goldenTime}
                            </p>
                        </div>
                    );
                }
                break;
            case 'vark':
                if (results.vark) {
                    const desc = VARK_DESCRIPTIONS[results.vark.primary];
                    return (
                        <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                            <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                {desc.label}
                            </p>
                        </div>
                    );
                }
                break;
            case 'testAnxiety':
                if (results.testAnxiety) {
                    const desc = TAI_INTERVENTIONS[results.testAnxiety.dominantType];
                    return (
                        <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                            <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                {desc.label} • {results.testAnxiety.severity === 'high' ? '높음' : results.testAnxiety.severity === 'moderate' ? '중등도' : '낮음'}
                            </p>
                        </div>
                    );
                }
                break;
            case 'digitalAddiction':
                if (results.digitalAddiction) {
                    const desc = DIGITAL_DETOX_PROTOCOLS[results.digitalAddiction.level];
                    return (
                        <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                            <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                {desc.label}
                            </p>
                        </div>
                    );
                }
                break;
            case 'metacognition':
                if (results.metacognition) {
                    const desc = METACOGNITION_RECOMMENDATIONS[results.metacognition.learnerLevel];
                    return (
                        <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                            <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                {desc.label}
                            </p>
                        </div>
                    );
                }
                break;
        }
        return null;
    };

    // 크로노타입 검사 렌더링
    const renderChronotypeAssessment = () => (
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    🌅 크로노타입 검사 (MEQ)
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    당신의 생체 리듬과 최적 학습 시간대를 파악합니다.
                </p>
            </div>

            {CHRONOTYPE_QUESTIONS.map((q, idx) => (
                <div key={q.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="font-medium text-gray-700 dark:text-gray-200 mb-3">
                        {idx + 1}. {q.question}
                    </p>
                    <div className="space-y-2">
                        {q.options.map((opt, optIdx) => (
                            <label
                                key={optIdx}
                                className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${chronotypeAnswers[idx] === opt.score
                                    ? 'bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-400'
                                    : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-blue-300'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name={q.id}
                                    checked={chronotypeAnswers[idx] === opt.score}
                                    onChange={() => {
                                        const newAnswers = [...chronotypeAnswers];
                                        newAnswers[idx] = opt.score;
                                        setChronotypeAnswers(newAnswers);
                                    }}
                                    className="mr-3"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{opt.text}</span>
                            </label>
                        ))}
                    </div>
                </div>
            ))}

            <div className="flex justify-between pt-4 border-t dark:border-gray-700">
                <button
                    onClick={() => setCurrentAssessment(null)}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
                >
                    ← 돌아가기
                </button>
                <button
                    onClick={() => handleCompleteAssessment('chronotype')}
                    disabled={chronotypeAnswers.includes(-1)}
                    className={`px-6 py-2 rounded-lg font-semibold ${!chronotypeAnswers.includes(-1)
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    검사 완료
                </button>
            </div>
        </div>
    );

    // VARK 검사 렌더링
    const renderVARKAssessment = () => (
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    🎯 학습 감각 유형 검사 (VARK)
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    가장 효과적인 학습 방식을 찾아드립니다.
                </p>
            </div>

            {VARK_QUESTIONS.map((q, idx) => (
                <div key={q.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="font-medium text-gray-700 dark:text-gray-200 mb-3">
                        {idx + 1}. {q.situation}
                    </p>
                    <div className="space-y-2">
                        {q.options.map((opt, optIdx) => (
                            <label
                                key={optIdx}
                                className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${varkAnswers[q.id] === opt.type
                                    ? 'bg-purple-100 dark:bg-purple-900/50 border-2 border-purple-400'
                                    : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-purple-300'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name={q.id}
                                    checked={varkAnswers[q.id] === opt.type}
                                    onChange={() => setVarkAnswers({ ...varkAnswers, [q.id]: opt.type })}
                                    className="mr-3"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{opt.text}</span>
                            </label>
                        ))}
                    </div>
                </div>
            ))}

            <div className="flex justify-between pt-4 border-t dark:border-gray-700">
                <button
                    onClick={() => setCurrentAssessment(null)}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
                >
                    ← 돌아가기
                </button>
                <button
                    onClick={() => handleCompleteAssessment('vark')}
                    disabled={Object.keys(varkAnswers).length < VARK_QUESTIONS.length}
                    className={`px-6 py-2 rounded-lg font-semibold ${Object.keys(varkAnswers).length >= VARK_QUESTIONS.length
                        ? 'bg-purple-500 text-white hover:bg-purple-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    검사 완료
                </button>
            </div>
        </div>
    );

    // 시험 불안 검사 렌더링
    const renderTAIAssessment = () => (
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    😰 시험 불안 검사 (TAI)
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    0: 전혀 아니다 ~ 3: 매우 그렇다
                </p>
            </div>

            {TAI_QUESTIONS.map((q, idx) => (
                <div key={q.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-start gap-2 mb-3">
                        <span className={`text-xs px-2 py-0.5 rounded ${q.dimension === 'cognitive'
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                            }`}>
                            {q.dimension === 'cognitive' ? '인지' : '신체'}
                        </span>
                        <p className="font-medium text-gray-700 dark:text-gray-200 flex-1">
                            {idx + 1}. {q.question}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                            { score: 0, label: '0점', title: '전혀 아님', desc: '거의 느끼지 않음' },
                            { score: 1, label: '1점', title: '가끔 그럼', desc: '경미한 긴장/불안' },
                            { score: 2, label: '2점', title: '자주 그럼', desc: '집중에 방해됨' },
                            { score: 3, label: '3점', title: '항상 그럼', desc: '극심한 불안/신체반응' },
                        ].map(opt => (
                            <button
                                key={opt.score}
                                onClick={() => {
                                    const newAnswers = [...taiAnswers];
                                    newAnswers[idx] = opt.score;
                                    setTaiAnswers(newAnswers);
                                }}
                                className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between ${taiAnswers[idx] === opt.score
                                    ? 'bg-orange-500 text-white border-orange-600 shadow-md scale-[1.02]'
                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-orange-300 hover:bg-orange-50/50'
                                    }`}
                            >
                                <div className="flex items-center justify-between w-full mb-1">
                                    <span className="font-bold text-xs">{opt.label}</span>
                                    <span className={`text-[11px] font-extrabold ${taiAnswers[idx] === opt.score ? 'text-orange-100' : 'text-orange-600 dark:text-orange-400'}`}>
                                        {opt.title}
                                    </span>
                                </div>
                                <span className={`text-[10px] leading-tight block ${taiAnswers[idx] === opt.score ? 'text-orange-100' : 'text-gray-400 dark:text-gray-400'}`}>
                                    {opt.desc}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            <div className="flex justify-between pt-4 border-t dark:border-gray-700">
                <button
                    onClick={() => setCurrentAssessment(null)}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
                >
                    ← 돌아가기
                </button>
                <button
                    onClick={() => handleCompleteAssessment('testAnxiety')}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600"
                >
                    검사 완료
                </button>
            </div>
        </div>
    );

    // 디지털 중독 검사 렌더링
    const renderDigitalAddictionAssessment = () => (
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    📱 디지털 의존도 검사
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    0: 전혀 아니다 ~ 4: 매우 그렇다
                </p>
            </div>

            {DIGITAL_ADDICTION_QUESTIONS.map((q, idx) => (
                <div key={q.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-start gap-2 mb-3">
                        <span className={`text-xs px-2 py-0.5 rounded ${q.category === 'tolerance' ? 'bg-yellow-100 text-yellow-700' :
                            q.category === 'withdrawal' ? 'bg-red-100 text-red-700' :
                                q.category === 'control' ? 'bg-purple-100 text-purple-700' :
                                    'bg-blue-100 text-blue-700'
                            }`}>
                            {q.category === 'tolerance' ? '내성' :
                                q.category === 'withdrawal' ? '금단' :
                                    q.category === 'control' ? '조절' : '영향'}
                        </span>
                        <p className="font-medium text-gray-700 dark:text-gray-200 flex-1">
                            {idx + 1}. {q.question}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                            { score: 1, label: '전혀 아님', desc: '주 0회 (거의 없음)' },
                            { score: 2, label: '가끔', desc: '주 1~2회 경험' },
                            { score: 3, label: '자주', desc: '주 3~4회 경험' },
                            { score: 4, label: '매우 자주', desc: '매일 / 항상 발생' }
                        ].map(item => (
                            <button
                                key={item.score}
                                onClick={() => {
                                    const newAnswers = [...digitalAnswers];
                                    newAnswers[idx] = item.score;
                                    setDigitalAnswers(newAnswers);
                                }}
                                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${digitalAnswers[idx] === item.score
                                    ? 'bg-pink-500 text-white border-pink-500 shadow-md scale-[1.02]'
                                    : 'bg-white dark:bg-gray-700 text-slate-700 dark:text-gray-200 border-slate-200 hover:bg-pink-50 hover:border-pink-300'
                                    }`}
                            >
                                <span className="text-base font-black">{item.score}점</span>
                                <span className={`text-xs font-bold ${digitalAnswers[idx] === item.score ? 'text-white' : 'text-pink-600'}`}>{item.label}</span>
                                <span className={`text-[10px] mt-0.5 ${digitalAnswers[idx] === item.score ? 'text-pink-100' : 'text-slate-400'}`}>{item.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
                <button
                    onClick={() => setCurrentAssessment(null)}
                    className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-300 transition-colors"
                >
                    ← 검사 목록으로
                </button>
                <button
                    onClick={() => handleCompleteAssessment('digitalAddiction')}
                    className="px-6 py-2 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600"
                >
                    검사 완료
                </button>
            </div>
        </div>
    );

    // 메타인지 검사 렌더링
    const renderMetacognitionAssessment = () => (
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    🧠 메타인지 학습 전략 검사
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    1점(전혀 안 함) ~ 4점(항상 실천) 중 나의 실제 공부 습관에 맞는 항목을 선택하세요.
                </p>
            </div>

            {METACOGNITION_QUESTIONS.map((q, idx) => (
                <div key={q.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-start gap-2 mb-3">
                        <span className={`text-xs px-2 py-0.5 rounded ${q.strategy === 'rehearsal' ? 'bg-gray-100 text-gray-700' :
                            q.strategy === 'elaboration' ? 'bg-green-100 text-green-700' :
                                q.strategy === 'organization' ? 'bg-blue-100 text-blue-700' :
                                    'bg-purple-100 text-purple-700'
                            }`}>
                            {q.strategy === 'rehearsal' ? '시연' :
                                q.strategy === 'elaboration' ? '정교화' :
                                    q.strategy === 'organization' ? '조직화' : '메타인지'}
                        </span>
                        <p className="font-medium text-gray-700 dark:text-gray-200 flex-1">
                            {idx + 1}. {q.question}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                            { score: 1, label: '거의 안 함', desc: '전혀 실천하지 않음' },
                            { score: 2, label: '가끔 실천', desc: '생각날 때 가끔 함' },
                            { score: 3, label: '자주 실천', desc: '주 3~4회 이상 활용' },
                            { score: 4, label: '항상 실천', desc: '매 공부마다 습관화' }
                        ].map(item => (
                            <button
                                key={item.score}
                                onClick={() => {
                                    const newAnswers = [...metacognitionAnswers];
                                    newAnswers[idx] = item.score;
                                    setMetacognitionAnswers(newAnswers);
                                }}
                                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${metacognitionAnswers[idx] === item.score
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-[1.02]'
                                    : 'bg-white dark:bg-gray-700 text-slate-700 dark:text-gray-200 border-slate-200 hover:bg-indigo-50 hover:border-indigo-300'
                                    }`}
                            >
                                <span className="text-base font-black">{item.score}점</span>
                                <span className={`text-xs font-bold ${metacognitionAnswers[idx] === item.score ? 'text-white' : 'text-indigo-600'}`}>{item.label}</span>
                                <span className={`text-[10px] mt-0.5 ${metacognitionAnswers[idx] === item.score ? 'text-indigo-100' : 'text-slate-400'}`}>{item.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            <div className="flex justify-between pt-4 border-t dark:border-gray-700">
                <button
                    onClick={() => setCurrentAssessment(null)}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
                >
                    ← 돌아가기
                </button>
                <button
                    onClick={() => handleCompleteAssessment('metacognition')}
                    className="px-6 py-2 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600"
                >
                    검사 완료
                </button>
            </div>
        </div>
    );

    // FREE는 결과 표시만 게이트(TAI 제외 잠금)하고 수행은 5종 모두 허용하므로 별도 강제 복귀 없음
    const activeAssessment = currentAssessment;

    // 메인 렌더링
    // isInline=true이면 모달 오버레이 없이 렌더링
    if (isInline) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full">
                {activeAssessment === null && renderSelectionScreen()}
                {activeAssessment === 'chronotype' && renderChronotypeAssessment()}
                {activeAssessment === 'vark' && renderVARKAssessment()}
                {activeAssessment === 'testAnxiety' && renderTAIAssessment()}
                {activeAssessment === 'digitalAddiction' && renderDigitalAddictionAssessment()}
                {activeAssessment === 'metacognition' && renderMetacognitionAssessment()}
            </div>
        );
    }

    // 모달 모드 (기존)
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {activeAssessment === null && renderSelectionScreen()}
                {activeAssessment === 'chronotype' && renderChronotypeAssessment()}
                {activeAssessment === 'vark' && renderVARKAssessment()}
                {activeAssessment === 'testAnxiety' && renderTAIAssessment()}
                {activeAssessment === 'digitalAddiction' && renderDigitalAddictionAssessment()}
                {activeAssessment === 'metacognition' && renderMetacognitionAssessment()}
            </div>
        </div>
    );
};

export default StudyEfficiencyAssessment;
