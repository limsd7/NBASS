/**
 * StudentSurveyView
 * 학생 전용 창에서 표시되는 심리 설문 화면
 * - BAI (불안)
 * - ISI (수면)  
 * - 집중력
 * - 피로/기타 증상
 * - 부신피로
 */

import React, { useState, useCallback } from 'react';
import {
    BAI_QUESTIONS,
    ISI_QUESTIONS,
    FATIGUE_SYMPTOMS,
    SYMPATHETIC_SYMPTOMS,
    PARASYMPATHETIC_SYMPTOMS,
    CONCENTRATION_QUESTIONS,
    ADRENAL_QUESTIONS
} from '../../data/questions';
import { StudentSurveyBundle } from '../../services/syncService';

interface StudentSurveyViewProps {
    studentName: string;
    onComplete: (data: StudentSurveyBundle) => void;
    onStepChange?: (step: string) => void;
}

type SurveyStep = 'bai' | 'isi' | 'concentration' | 'fatigue' | 'adrenal' | 'complete';

const STEP_LABELS: Record<SurveyStep, string> = {
    bai: '불안 척도 (BAI)',
    isi: '수면 평가 (ISI)',
    concentration: '집중력 평가',
    fatigue: '피로 증상',
    adrenal: '부신 피로',
    complete: '완료'
};

// BAI 응답 옵션
const BAI_OPTIONS = ['전혀 아니다', '약간', '상당히', '심하게'];

// 집중력 응답 옵션
const CONCENTRATION_OPTIONS = ['전혀 아니다', '드물게', '가끔', '자주', '매우 자주'];

// 부신피로 응답 옵션
const ADRENAL_OPTIONS = ['전혀 아니다', '드물게', '가끔', '자주', '항상'];

export const StudentSurveyView: React.FC<StudentSurveyViewProps> = ({
    studentName,
    onComplete,
    onStepChange
}) => {
    const [currentStep, setCurrentStep] = useState<SurveyStep>('bai');

    // 설문 데이터
    const [baiScores, setBaiScores] = useState<number[]>(Array(BAI_QUESTIONS.length).fill(0));
    const [isiScores, setIsiScores] = useState<number[]>(Array(ISI_QUESTIONS.length).fill(0));
    const [concentrationScores, setConcentrationScores] = useState<number[]>(Array(CONCENTRATION_QUESTIONS.length).fill(0));
    const [fatigueSymptoms, setFatigueSymptoms] = useState<boolean[]>(Array(FATIGUE_SYMPTOMS.length).fill(false));
    const [adrenalScores, setAdrenalScores] = useState<number[]>(Array(15).fill(0)); // 15 questions total
    const [snsSymptoms, setSnsSymptoms] = useState<string[]>([]);
    const [pnsSymptoms, setPnsSymptoms] = useState<string[]>([]);

    // 진행률 계산
    const steps: SurveyStep[] = ['bai', 'isi', 'concentration', 'fatigue', 'adrenal'];
    const currentIndex = steps.indexOf(currentStep);
    const progress = ((currentIndex + 1) / steps.length) * 100;

    // 다음 단계로
    const goToNext = useCallback(() => {
        const nextIndex = currentIndex + 1;
        if (nextIndex < steps.length) {
            const nextStep = steps[nextIndex];
            setCurrentStep(nextStep);
            onStepChange?.(nextStep);
        } else {
            // 완료
            const surveyData: StudentSurveyBundle = {
                baiScores,
                isiScores,
                concentrationScores,
                fatigueSymptoms,
                adrenalScores,
                snsSymptoms,
                pnsSymptoms
            };
            onComplete(surveyData);
            setCurrentStep('complete');
        }
    }, [currentIndex, steps, baiScores, isiScores, concentrationScores, fatigueSymptoms, adrenalScores, snsSymptoms, pnsSymptoms, onComplete, onStepChange]);

    // 이전 단계로
    const goToPrevious = useCallback(() => {
        if (currentIndex > 0) {
            const prevStep = steps[currentIndex - 1];
            setCurrentStep(prevStep);
            onStepChange?.(prevStep);
        }
    }, [currentIndex, steps, onStepChange]);

    // SNS/PNS 증상 토글
    const toggleSnsSymptom = (s: string) => {
        setSnsSymptoms(prev => prev.includes(s) ? prev.filter(i => i !== s) : [...prev, s]);
    };
    const togglePnsSymptom = (s: string) => {
        setPnsSymptoms(prev => prev.includes(s) ? prev.filter(i => i !== s) : [...prev, s]);
    };

    // 완료 화면
    if (currentStep === 'complete') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-8">
                <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-lg">
                    <div className="text-6xl mb-6">✅</div>
                    <h2 className="text-3xl font-black text-emerald-800 mb-4">설문 완료!</h2>
                    <p className="text-lg text-slate-600 mb-2">{studentName}님의 응답이 제출되었습니다.</p>
                    <p className="text-slate-500">상담사의 안내를 기다려 주세요.</p>
                    <div className="mt-8 p-4 bg-emerald-50 rounded-xl">
                        <p className="text-sm text-emerald-700">이 창은 자동으로 닫히지 않습니다.</p>
                        <p className="text-xs text-emerald-600 mt-1">상담사가 분석을 완료하면 안내해 드립니다.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* 헤더 */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-black text-slate-800">🧠 심리 상태 평가</h1>
                            <p className="text-sm text-slate-500">{studentName}님</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400">진행률</p>
                            <p className="text-lg font-bold text-indigo-600">{Math.round(progress)}%</p>
                        </div>
                    </div>

                    {/* 진행 표시바 */}
                    <div className="mt-4 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* 단계 표시 */}
                    <div className="flex justify-between mt-2">
                        {steps.map((step, idx) => (
                            <span
                                key={step}
                                className={`text-xs font-medium ${idx <= currentIndex ? 'text-indigo-600' : 'text-slate-400'}`}
                            >
                                {STEP_LABELS[step]}
                            </span>
                        ))}
                    </div>
                </div>
            </header>

            {/* 메인 컨텐츠 */}
            <main className="max-w-4xl mx-auto px-6 py-8">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    {/* 단계 제목 */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
                        <h2 className="text-2xl font-black">{STEP_LABELS[currentStep]}</h2>
                        <p className="text-indigo-100 mt-1 text-sm">
                            {currentStep === 'bai' && '지난 일주일간 아래 증상을 얼마나 경험했나요?'}
                            {currentStep === 'isi' && '최근 2주간의 수면 상태를 평가해 주세요.'}
                            {currentStep === 'concentration' && '학습 시 집중력에 대해 응답해 주세요.'}
                            {currentStep === 'fatigue' && '현재 경험하는 증상을 모두 선택해 주세요.'}
                            {currentStep === 'adrenal' && '에너지 및 스트레스 관련 증상을 평가해 주세요.'}
                        </p>
                    </div>

                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                        {/* BAI 설문 - BAI_QUESTIONS는 string[] */}
                        {currentStep === 'bai' && (
                            <div className="space-y-4">
                                {BAI_QUESTIONS.map((question, idx) => (
                                    <div key={idx} className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                        <p className="font-medium text-slate-800 mb-3">{idx + 1}. {question}</p>
                                        <div className="grid grid-cols-4 gap-2">
                                            {BAI_OPTIONS.map((opt, optIdx) => (
                                                <button
                                                    key={optIdx}
                                                    onClick={() => setBaiScores(prev => { const n = [...prev]; n[idx] = optIdx; return n; })}
                                                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${baiScores[idx] === optIdx
                                                        ? 'bg-indigo-600 text-white shadow-lg scale-105'
                                                        : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'
                                                        }`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ISI 설문 - ISI_QUESTIONS는 객체 배열 */}
                        {currentStep === 'isi' && (
                            <div className="space-y-4">
                                {ISI_QUESTIONS.map((q, idx) => (
                                    <div key={idx} className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                        <p className="font-medium text-slate-800 mb-3">{idx + 1}. {q.label}</p>
                                        <div className="grid grid-cols-5 gap-2">
                                            {q.options.map((opt, optIdx) => (
                                                <button
                                                    key={optIdx}
                                                    onClick={() => setIsiScores(prev => { const n = [...prev]; n[idx] = optIdx; return n; })}
                                                    className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${isiScores[idx] === optIdx
                                                        ? 'bg-purple-600 text-white shadow-lg scale-105'
                                                        : 'bg-white border border-slate-200 text-slate-600 hover:border-purple-300'
                                                        }`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 집중력 설문 - CONCENTRATION_QUESTIONS는 string[] */}
                        {currentStep === 'concentration' && (
                            <div className="space-y-4">
                                {CONCENTRATION_QUESTIONS.map((question, idx) => (
                                    <div key={idx} className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                        <p className="font-medium text-slate-800 mb-3">{idx + 1}. {question}</p>
                                        <div className="grid grid-cols-5 gap-2">
                                            {CONCENTRATION_OPTIONS.map((opt, optIdx) => (
                                                <button
                                                    key={optIdx}
                                                    onClick={() => setConcentrationScores(prev => { const n = [...prev]; n[idx] = optIdx; return n; })}
                                                    className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${concentrationScores[idx] === optIdx
                                                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                                                        : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
                                                        }`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 피로 증상 */}
                        {currentStep === 'fatigue' && (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-3">만성 피로 증상 (해당 항목 선택)</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {FATIGUE_SYMPTOMS.map((symptom, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setFatigueSymptoms(prev => { const n = [...prev]; n[idx] = !n[idx]; return n; })}
                                                className={`p-3 rounded-xl text-left text-sm font-medium transition-all ${fatigueSymptoms[idx]
                                                    ? 'bg-amber-100 border-2 border-amber-400 text-amber-800'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-300'
                                                    }`}
                                            >
                                                {fatigueSymptoms[idx] && <span className="mr-2">✓</span>}
                                                {symptom}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-800 mb-3">교감신경 관련 증상</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {SYMPATHETIC_SYMPTOMS.map((symptom) => (
                                            <button
                                                key={symptom.label}
                                                onClick={() => toggleSnsSymptom(symptom.label)}
                                                className={`p-3 rounded-xl text-left text-sm font-medium transition-all ${snsSymptoms.includes(symptom.label)
                                                    ? 'bg-red-100 border-2 border-red-400 text-red-800'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-red-300'
                                                    }`}
                                            >
                                                {snsSymptoms.includes(symptom.label) && <span className="mr-2">✓</span>}
                                                {symptom.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-800 mb-3">부교감신경 관련 증상</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {PARASYMPATHETIC_SYMPTOMS.map((symptom) => (
                                            <button
                                                key={symptom.label}
                                                onClick={() => togglePnsSymptom(symptom.label)}
                                                className={`p-3 rounded-xl text-left text-sm font-medium transition-all ${pnsSymptoms.includes(symptom.label)
                                                    ? 'bg-teal-100 border-2 border-teal-400 text-teal-800'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-300'
                                                    }`}
                                            >
                                                {pnsSymptoms.includes(symptom.label) && <span className="mr-2">✓</span>}
                                                {symptom.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 부신피로 설문 - ADRENAL_QUESTIONS는 카테고리별 객체 배열 */}
                        {currentStep === 'adrenal' && (
                            <div className="space-y-6">
                                {(() => {
                                    let questionIndex = 0;
                                    return ADRENAL_QUESTIONS.map((category, catIdx) => (
                                        <div key={catIdx} className="space-y-3">
                                            <h4 className="font-bold text-slate-800 text-lg border-b border-slate-200 pb-2">
                                                {category.category}
                                            </h4>
                                            {category.questions.map((question, qIdx) => {
                                                const currentIdx = questionIndex++;
                                                return (
                                                    <div key={qIdx} className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                                        <p className="font-medium text-slate-800 mb-3">{question}</p>
                                                        <div className="grid grid-cols-5 gap-2">
                                                            {ADRENAL_OPTIONS.map((opt, optIdx) => (
                                                                <button
                                                                    key={optIdx}
                                                                    onClick={() => setAdrenalScores(prev => {
                                                                        const n = [...prev];
                                                                        n[currentIdx] = optIdx;
                                                                        return n;
                                                                    })}
                                                                    className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${adrenalScores[currentIdx] === optIdx
                                                                        ? 'bg-rose-600 text-white shadow-lg scale-105'
                                                                        : 'bg-white border border-slate-200 text-slate-600 hover:border-rose-300'
                                                                        }`}
                                                                >
                                                                    {opt}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ));
                                })()}
                            </div>
                        )}
                    </div>

                    {/* 네비게이션 버튼 */}
                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between">
                        <button
                            onClick={goToPrevious}
                            disabled={currentIndex === 0}
                            className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            ← 이전
                        </button>
                        <button
                            onClick={goToNext}
                            className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                        >
                            {currentIndex === steps.length - 1 ? '설문 완료 →' : '다음 →'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentSurveyView;
