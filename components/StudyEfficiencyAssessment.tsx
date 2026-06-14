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

import React, { useState } from 'react';
import { useStudyEfficiency, AssessmentType } from '../contexts/StudyEfficiencyContext';
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

interface StudyEfficiencyAssessmentProps {
    careType?: CareType;
    isPortableMode?: boolean;
    isInline?: boolean;  // Step 모드에서는 모달 오버레이 없이 인라인 렌더링
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
    onComplete,
    onClose
}) => {
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

    // 추천 검사 목록 (CareType 기반)
    const recommendedAssessments = careType
        ? CARETYPE_ASSESSMENT_RECOMMENDATIONS[careType]?.priority || []
        : ['chronotype', 'vark', 'metacognition'];

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
        setCurrentAssessment(null);
    };

    const handleFinish = () => {
        onComplete({
            ...results,
            completedAt: new Date().toISOString()
        } as StudyEfficiencyResults);
    };

    // 선택 화면 렌더링
    const renderSelectionScreen = () => (
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    📊 공부 효율성 정밀 검사
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                    아래 검사들을 통해 나만의 최적 학습 전략을 파악하세요.
                </p>
                {careType && careType !== CareType.UNASSESSED && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            💡 <strong>{careType}</strong> 유형에게 권장되는 검사: {' '}
                            {recommendedAssessments.map((a, i) => (
                                <span key={a}>
                                    {ASSESSMENT_INFO[a as AssessmentType]?.title.split(' ')[0]}
                                    {i < recommendedAssessments.length - 1 ? ', ' : ''}
                                </span>
                            ))}
                        </p>
                    </div>
                )}

                {/* 상단 완료 버튼 - 항상 보이도록 */}
                <div className="mt-4">
                    <button
                        onClick={handleFinish}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${completedAssessments.size > 0
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:shadow-xl animate-pulse'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        disabled={completedAssessments.size === 0}
                    >
                        {completedAssessments.size > 0
                            ? `✅ ${completedAssessments.size}개 검사 완료! 다음 단계로 →`
                            : '검사를 시작해 주세요'}
                    </button>
                    {completedAssessments.size > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                            ({completedAssessments.size}/{Object.keys(ASSESSMENT_INFO).length} 검사 완료 - 선택적으로 더 진행하거나 다음으로 넘어가세요)
                        </p>
                    )}
                </div>
            </div>

            <div className="grid gap-4">
                {(Object.keys(ASSESSMENT_INFO) as AssessmentType[]).map(type => {
                    const info = ASSESSMENT_INFO[type];
                    const isCompleted = completedAssessments.has(type);
                    const isRecommended = recommendedAssessments.includes(type);

                    return (
                        <div
                            key={type}
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${isCompleted
                                ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                                : isRecommended
                                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:shadow-lg'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
                                }`}
                            onClick={() => !isCompleted && setCurrentAssessment(type)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{info.icon}</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                            {info.title}
                                            {isRecommended && !isCompleted && (
                                                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">추천</span>
                                            )}
                                            {isCompleted && (
                                                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">완료</span>
                                            )}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{info.description}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-gray-400">{info.time}</span>
                                    {!isCompleted && (
                                        <div className="mt-1 text-blue-500">
                                            <span className="text-sm">시작 →</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 완료된 검사 결과 미리보기 */}
                            {isCompleted && renderResultPreview(type)}
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t dark:border-gray-700">
                <div className="flex justify-between">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300"
                    >
                        ← 이전 단계
                    </button>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        완료: {completedAssessments.size}/{Object.keys(ASSESSMENT_INFO).length} 검사
                    </div>
                </div>
                <button
                    onClick={handleFinish}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${completedAssessments.size > 0
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-xl'
                        : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                        }`}
                >
                    {completedAssessments.size > 0
                        ? `🧠 인지 성능 테스트로 이동`
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
                    <div className="flex gap-2">
                        {[0, 1, 2, 3].map(score => (
                            <button
                                key={score}
                                onClick={() => {
                                    const newAnswers = [...taiAnswers];
                                    newAnswers[idx] = score;
                                    setTaiAnswers(newAnswers);
                                }}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${taiAnswers[idx] === score
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-orange-100'
                                    }`}
                            >
                                {score}
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
                    <div className="flex gap-2">
                        {[0, 1, 2, 3, 4].map(score => (
                            <button
                                key={score}
                                onClick={() => {
                                    const newAnswers = [...digitalAnswers];
                                    newAnswers[idx] = score;
                                    setDigitalAnswers(newAnswers);
                                }}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${digitalAnswers[idx] === score
                                    ? 'bg-pink-500 text-white'
                                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-pink-100'
                                    }`}
                            >
                                {score}
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
                    0: 전혀 아니다 ~ 4: 매우 그렇다
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
                    <div className="flex gap-2">
                        {[0, 1, 2, 3, 4].map(score => (
                            <button
                                key={score}
                                onClick={() => {
                                    const newAnswers = [...metacognitionAnswers];
                                    newAnswers[idx] = score;
                                    setMetacognitionAnswers(newAnswers);
                                }}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${metacognitionAnswers[idx] === score
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-100'
                                    }`}
                            >
                                {score}
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

    // 메인 렌더링
    // isInline=true이면 모달 오버레이 없이 렌더링
    if (isInline) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full">
                {currentAssessment === null && renderSelectionScreen()}
                {currentAssessment === 'chronotype' && renderChronotypeAssessment()}
                {currentAssessment === 'vark' && renderVARKAssessment()}
                {currentAssessment === 'testAnxiety' && renderTAIAssessment()}
                {currentAssessment === 'digitalAddiction' && renderDigitalAddictionAssessment()}
                {currentAssessment === 'metacognition' && renderMetacognitionAssessment()}
            </div>
        );
    }

    // 모달 모드 (기존)
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {currentAssessment === null && renderSelectionScreen()}
                {currentAssessment === 'chronotype' && renderChronotypeAssessment()}
                {currentAssessment === 'vark' && renderVARKAssessment()}
                {currentAssessment === 'testAnxiety' && renderTAIAssessment()}
                {currentAssessment === 'digitalAddiction' && renderDigitalAddictionAssessment()}
                {currentAssessment === 'metacognition' && renderMetacognitionAssessment()}
            </div>
        </div>
    );
};

export default StudyEfficiencyAssessment;
