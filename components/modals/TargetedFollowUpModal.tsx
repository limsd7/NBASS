import React, { useState, useMemo } from 'react';
import { AssessmentResult } from '../../types';
import {
    FollowUpAssessmentService,
    FollowUpTargetArea,
    PrescriptionAdherence,
    FollowUpAnswers,
    FollowUpDeltaReport,
    getCareTypeFollowUpQuestions
} from '../../services/followUpAssessmentService';
import { normalizeCareTypeCode, getCareTypeDetail } from '../../data/careTypesData';
import {
    BAI_QUESTIONS,
    ISI_QUESTIONS,
    FATIGUE_SYMPTOMS,
    SYMPATHETIC_SYMPTOMS,
    PARASYMPATHETIC_SYMPTOMS,
    CONCENTRATION_QUESTIONS,
    ADRENAL_QUESTIONS
} from '../../data/questions';

interface TargetedFollowUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    baselineResult: AssessmentResult;
    onComplete: (newResult: AssessmentResult, deltaReport: FollowUpDeltaReport) => void;
    isDarkMode?: boolean;
}

const GENERAL_WELLNESS_QUESTIONS = [
    { id: 1, text: "지난 2주간 낮 시간대 전반적인 집중력과 학업 몰입도는 어떠했습니까?", options: ["매우 낮음", "다소 낮음", "보통", "양호함", "매우 최상"] },
    { id: 2, text: "아침 기상 시 수면의 질과 두뇌 개운함은 어떠했습니까?", options: ["매우 피곤", "다소 피곤", "보통", "개운함", "매우 상쾌"] },
    { id: 3, text: "수험 스트레스 및 시험 긴장도를 스스로 잘 조절하고 계십니까?", options: ["전혀 못함", "다소 어려움", "보통", "잘 조절함", "완벽히 조절"] },
    { id: 4, text: "식사 후 급격한 졸음이나 식곤증, 혈당 스파이크가 있었습니까?", options: ["매우 심함", "자주 있음", "가끔 있음", "거의 없음", "전혀 없음"] },
    { id: 5, text: "목표한 일일 순공 시간(집중 학습 시간)을 얼마나 달성했습니까?", options: ["50% 미만", "50~70%", "70~85%", "85~95%", "100% 완수"] }
];

export const TargetedFollowUpModal: React.FC<TargetedFollowUpModalProps> = ({
    isOpen,
    onClose,
    baselineResult,
    onComplete,
    isDarkMode = false
}) => {
    // 1. 비정상 영역 추출
    const targetAreas = useMemo(() => {
        if (!baselineResult) return [];
        return FollowUpAssessmentService.extractAbnormalAreas(baselineResult);
    }, [baselineResult]);

    // 경과 일수 계산
    const daysElapsed = useMemo(() => {
        if (!baselineResult) return 14;
        const testDate = new Date(baselineResult.date || baselineResult.student.testDate);
        const now = new Date();
        const diff = Math.abs(now.getTime() - testDate.getTime());
        return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
    }, [baselineResult]);

    // 스텝 상태: 1: 처방 순응도, 2: 비정상 타겟 설문, 3: 신규 이상 게이트
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

    // 처방 실천율 (Step 1)
    const [adherence, setAdherence] = useState<PrescriptionAdherence>({
        nutritionSupplement: 'daily',
        sleepSchedule: 'well_kept',
        preStudyRoutine: 'well_kept',
        userNote: ''
    });

    // 각 설문 응답 상태 (Step 2) - 직전 검사 기록 기반 초기화 (증상이 있던 항목이 의도치 않게 0개/완치로 오인되지 않도록 유지)
    const [baiAnswers, setBaiAnswers] = useState<number[]>(() => new Array(BAI_QUESTIONS.length).fill(0));
    const [isiAnswers, setIsiAnswers] = useState<number[]>(() => new Array(ISI_QUESTIONS.length).fill(0));
    const [fatigueSymptoms, setFatigueSymptoms] = useState<boolean[]>(() => {
        const prevSymptoms = baselineResult.survey?.symptoms || [];
        return FATIGUE_SYMPTOMS.map(s => prevSymptoms.includes(s));
    });
    const [fatigueCore, setFatigueCore] = useState<boolean>(() => baselineResult.survey?.chronicFatigue || false);
    const [snsSymptomSelection, setSnsSymptomSelection] = useState<string[]>(() => baselineResult.survey?.sympatheticSymptoms || []);
    const [pnsSymptomSelection, setPnsSymptomSelection] = useState<string[]>(() => baselineResult.survey?.parasympatheticSymptoms || []);
    const [concentrationAnswers, setConcentrationAnswers] = useState<number[]>(() => new Array(CONCENTRATION_QUESTIONS.length).fill(0));
    const [adrenalAnswers, setAdrenalAnswers] = useState<number[]>(() => new Array(14).fill(0));
    const [wellnessAnswers, setWellnessAnswers] = useState<number[]>(() => new Array(GENERAL_WELLNESS_QUESTIONS.length).fill(3));
    const [careTypeAnswers, setCareTypeAnswers] = useState<number[]>(() => new Array(5).fill(2));

    // 신규 이상 감지 (Step 3)
    const [hasNewSymptoms, setHasNewSymptoms] = useState(false);
    const [newSymptomText, setNewSymptomText] = useState('');

    // 로딩 및 제출 상태
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [batchAlertMsg, setBatchAlertMsg] = useState<string | null>(null);

    if (!isOpen || !baselineResult) return null;

    // ⚡ 전체 문항(1~3단계 전체) '모두 안좋음/최악' 일괄 선택
    const handleSetAllMasterBad = () => {
        // Step 1: 실천율 0% (최악)
        setAdherence({
            nutritionSupplement: 'rarely',
            sleepSchedule: 'not_kept',
            preStudyRoutine: 'not_kept',
            userNote: '바쁜 일정과 극심한 스트레스로 처방을 전혀 실천하지 못함'
        });
        // Step 2: 모든 타겟 문항 최악/최대치 일괄 적용
        setBaiAnswers(new Array(BAI_QUESTIONS.length).fill(3)); // 심함 (63점)
        setIsiAnswers(new Array(ISI_QUESTIONS.length).fill(4)); // 매우 심함 (28점)
        setFatigueSymptoms(new Array(FATIGUE_SYMPTOMS.length).fill(true)); // 만성피로 8개 전체
        setFatigueCore(true);
        setSnsSymptomSelection(SYMPATHETIC_SYMPTOMS.map(s => s.label)); // 교감신경 10개 전체
        setPnsSymptomSelection(PARASYMPATHETIC_SYMPTOMS.map(s => s.label)); // 부교감신경 7개 전체
        setConcentrationAnswers(new Array(CONCENTRATION_QUESTIONS.length).fill(3)); // 매우 심함 (30점)
        setAdrenalAnswers(new Array(14).fill(3)); // 부신피로 항상 (42점)
        setWellnessAnswers(new Array(GENERAL_WELLNESS_QUESTIONS.length).fill(1)); // 매우 낮음 (5점)
        setCareTypeAnswers(new Array(5).fill(0)); // 케어타입 증상 악화 (0점)
        // Step 3: 신규 이상 증상 발생
        setHasNewSymptoms(true);
        setNewSymptomText('최근 수면 부족과 심한 두통, 가슴 답답함 및 신체 피로가 극심해졌습니다.');

        setBatchAlertMsg('🚨 1~3단계 전체 문항이 [모두 안좋음 / 최악(미실천)] 상태로 일괄 변경되었습니다.');
        setTimeout(() => setBatchAlertMsg(null), 3000);
    };

    // ⚡ 전체 문항(1~3단계 전체) '모두 정상/완치' 일괄 선택
    const handleSetAllMasterGood = () => {
        // Step 1: 실천율 100% (성실)
        setAdherence({
            nutritionSupplement: 'daily',
            sleepSchedule: 'well_kept',
            preStudyRoutine: 'well_kept',
            userNote: '처방 루틴을 성실히 준수함'
        });
        // Step 2: 모든 타겟 문항 정상/0점 일괄 적용
        setBaiAnswers(new Array(BAI_QUESTIONS.length).fill(0));
        setIsiAnswers(new Array(ISI_QUESTIONS.length).fill(0));
        setFatigueSymptoms(new Array(FATIGUE_SYMPTOMS.length).fill(false));
        setFatigueCore(false);
        setSnsSymptomSelection([]);
        setPnsSymptomSelection([]);
        setConcentrationAnswers(new Array(CONCENTRATION_QUESTIONS.length).fill(0));
        setAdrenalAnswers(new Array(14).fill(0));
        setWellnessAnswers(new Array(GENERAL_WELLNESS_QUESTIONS.length).fill(5));
        setCareTypeAnswers(new Array(5).fill(4)); // 케어타입 완벽 회복 (4점)
        // Step 3: 신규 이상 증상 없음
        setHasNewSymptoms(false);
        setNewSymptomText('');

        setBatchAlertMsg('🌿 1~3단계 전체 문항이 [모두 정상 / 완치(성실실천)] 상태로 일괄 변경되었습니다.');
        setTimeout(() => setBatchAlertMsg(null), 3000);
    };

    // 일괄 선택 헬퍼들
    const handleSetAllAdherence = (status: 'best' | 'worst') => {
        if (status === 'best') {
            setAdherence({
                nutritionSupplement: 'daily',
                sleepSchedule: 'well_kept',
                preStudyRoutine: 'well_kept',
                userNote: ''
            });
        } else {
            setAdherence({
                nutritionSupplement: 'rarely',
                sleepSchedule: 'not_kept',
                preStudyRoutine: 'not_kept',
                userNote: '바쁜 일정과 스트레스로 처방을 전혀 지키지 못함'
            });
        }
    };

    const handleSetAllTargetBad = (targetId: string) => {
        if (targetId === 'bai') setBaiAnswers(new Array(BAI_QUESTIONS.length).fill(3));
        if (targetId === 'isi') setIsiAnswers(new Array(ISI_QUESTIONS.length).fill(4));
        if (targetId === 'fatigue') {
            setFatigueSymptoms(new Array(FATIGUE_SYMPTOMS.length).fill(true));
            setFatigueCore(true);
        }
        if (targetId === 'sns') setSnsSymptomSelection(SYMPATHETIC_SYMPTOMS.map(s => s.label));
        if (targetId === 'pns') setPnsSymptomSelection(PARASYMPATHETIC_SYMPTOMS.map(s => s.label));
        if (targetId === 'concentration') setConcentrationAnswers(new Array(CONCENTRATION_QUESTIONS.length).fill(3));
        if (targetId === 'adrenal') setAdrenalAnswers(new Array(14).fill(3));
        if (targetId === 'wellness_general') setWellnessAnswers(new Array(GENERAL_WELLNESS_QUESTIONS.length).fill(1));
        if (targetId === 'care_type_specific') setCareTypeAnswers(new Array(5).fill(0));
    };

    const handleSetAllTargetGood = (targetId: string) => {
        if (targetId === 'bai') setBaiAnswers(new Array(BAI_QUESTIONS.length).fill(0));
        if (targetId === 'isi') setIsiAnswers(new Array(ISI_QUESTIONS.length).fill(0));
        if (targetId === 'fatigue') {
            setFatigueSymptoms(new Array(FATIGUE_SYMPTOMS.length).fill(false));
            setFatigueCore(false);
        }
        if (targetId === 'sns') setSnsSymptomSelection([]);
        if (targetId === 'pns') setPnsSymptomSelection([]);
        if (targetId === 'concentration') setConcentrationAnswers(new Array(CONCENTRATION_QUESTIONS.length).fill(0));
        if (targetId === 'adrenal') setAdrenalAnswers(new Array(14).fill(0));
        if (targetId === 'wellness_general') setWellnessAnswers(new Array(GENERAL_WELLNESS_QUESTIONS.length).fill(5));
        if (targetId === 'care_type_specific') setCareTypeAnswers(new Array(5).fill(4));
    };

    // 2주 추적 간격 게이트: 직전 검사일로부터 14일 미만이면 제출 차단
    const isTooEarly = Number.isFinite(daysElapsed) && daysElapsed < 14;
    const remainingDays = isTooEarly ? 14 - daysElapsed : 0;

    // 제출 핸들러
    const handleSubmit = async () => {
        if (isTooEarly) {
            alert(`2주 타겟 추적 검사는 직전 검사일로부터 14일 후부터 가능합니다. (D-${remainingDays}일, 현재 ${daysElapsed}일 경과)`);
            return;
        }
        setIsSubmitting(true);
        try {
            const followUpAnswers: FollowUpAnswers = {
                adherence,
                careTypeAnswers,
                baiAnswers,
                isiAnswers,
                fatigueSymptoms,
                fatigueCore,
                snsSymptomSelection,
                pnsSymptomSelection,
                concentrationAnswers,
                adrenalAnswers,
                wellnessAnswers,
                newSymptomsReported: hasNewSymptoms && newSymptomText.trim() ? [newSymptomText.trim()] : []
            };

            const { newResult, deltaReport } = await FollowUpAssessmentService.processFollowUpAssessment(
                baselineResult,
                followUpAnswers,
                targetAreas
            );

            onComplete(newResult, deltaReport);
        } catch (error) {
            console.error('Failed to process follow-up assessment:', error);
            alert('추적 검사 결과 계산 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
                {/* 상단 헤더 */}
                <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 dark:from-slate-800/80 dark:to-slate-900 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg font-black shadow-md shadow-blue-500/20">
                            ⚡
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                                    2주 타겟 추적 검사 (Targeted Follow-up)
                                </h2>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                                    ⏱️ {daysElapsed}일 경과 정기 추적
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {baselineResult.student.name} 수험생 | 직전 진단: <span className="font-bold text-slate-700 dark:text-slate-200">{baselineResult.careType}</span>
                            </p>
                            {isTooEarly && (
                                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-1">
                                    ⚠️ 직전 검사 후 {daysElapsed}일 경과 — 2주 추적 검사는 D-{remainingDays}일 후 제출 가능합니다.
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer text-sm font-bold"
                    >
                        ✕
                    </button>
                </div>

                {/* 비정상 타겟 추출 안내 배너 */}
                <div className="bg-slate-100/80 dark:bg-slate-800/40 px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                            🎯 집중 재평가 타겟 ({targetAreas.length}개):
                        </span>
                        {targetAreas.map((target) => (
                            <span
                                key={target.id}
                                className={`text-xs px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 border ${
                                    target.severity === 'critical'
                                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900'
                                        : target.severity === 'warning'
                                        ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-900'
                                        : target.severity === 'caution'
                                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900'
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900'
                                }`}
                            >
                                <span>{target.severity === 'critical' ? '🔴' : target.severity === 'warning' ? '🟠' : target.severity === 'caution' ? '🟡' : '🟢'}</span>
                                <span>{target.title}</span>
                                <span className="text-[10px] opacity-80">({target.scoreLabel})</span>
                            </span>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden lg:inline">
                            ⚡ 소요 시간: 약 <strong className="text-blue-600 dark:text-blue-400">2~3분</strong>
                        </span>
                        <button
                            type="button"
                            onClick={handleSetAllMasterBad}
                            className="px-2.5 py-1 text-xs font-black bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1 border border-rose-500"
                            title="1~3단계 전체를 최악(0점/악화/새증상)으로 일괄 선택합니다"
                        >
                            <span>🚨</span>
                            <span>[전체 악화] 모두 안좋음 일괄선택</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleSetAllMasterGood}
                            className="px-2.5 py-1 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1 border border-emerald-500"
                            title="1~3단계 전체를 완치(100점/정상)로 일괄 선택합니다"
                        >
                            <span>🌿</span>
                            <span>[전체 호전] 모두 정상 일괄선택</span>
                        </button>
                    </div>
                </div>

                {batchAlertMsg && (
                    <div className="bg-amber-500 text-white px-6 py-2 text-xs font-bold text-center animate-in fade-in flex items-center justify-center gap-2 shadow-sm">
                        <span>⚡</span>
                        <span>{batchAlertMsg}</span>
                    </div>
                )}

                {/* 3단계 스텝 인디케이터 */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <button
                        onClick={() => setCurrentStep(1)}
                        className={`flex-1 py-3 px-4 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                            currentStep === 1
                                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-950/20'
                                : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 inline-flex items-center justify-center text-[11px]">1</span>
                        <span>1. 처방 실천율 확인</span>
                    </button>

                    <button
                        onClick={() => setCurrentStep(2)}
                        className={`flex-1 py-3 px-4 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                            currentStep === 2
                                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-950/20'
                                : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 inline-flex items-center justify-center text-[11px]">2</span>
                        <span>2. 타겟 영역 집중 설문 ({targetAreas.length}영역)</span>
                    </button>

                    <button
                        onClick={() => setCurrentStep(3)}
                        className={`flex-1 py-3 px-4 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                            currentStep === 3
                                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-950/20'
                                : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 inline-flex items-center justify-center text-[11px]">3</span>
                        <span>3. 신규 이상 점검 & 제출</span>
                    </button>
                </div>

                {/* 메인 설문 컨텐츠 영역 */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* ================= STEP 1: 처방 실천율 (Adherence) ================= */}
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            <div className="bg-blue-50/60 dark:bg-slate-800/60 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/40 flex items-center justify-between flex-wrap gap-2">
                                <div>
                                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                        <span>💊</span> 지난 2주간 처방된 솔루션 실천율 확인
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        처방 실천율은 치료 유효성 및 신경계 회복 속도 평가에 직접 반영됩니다.
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleSetAllAdherence('worst')}
                                        className="px-2.5 py-1 text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                                    >
                                        ⚡ 전체 미실천 (0점/최악)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSetAllAdherence('best')}
                                        className="px-2.5 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                                    >
                                        ⚡ 전체 성실 실천 (100점)
                                    </button>
                                </div>
                            </div>

                            {/* 1. 영양제 복용 */}
                            <div className="bg-white dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                                    1. 맞춤 영양 처방 (영양제/비타민 등) 복용
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    {[
                                        { key: 'daily', label: '매일 꾸준히 복용', desc: '주 5~7회 (실천율 80% 이상)' },
                                        { key: 'often', label: '가끔 챙겨 먹음', desc: '주 3~4회 (실천율 약 50%)' },
                                        { key: 'rarely', label: '거의 챙겨먹지 못함', desc: '주 1~2회 미만 (실천율 0%)' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.key}
                                            type="button"
                                            onClick={() => setAdherence(prev => ({ ...prev, nutritionSupplement: opt.key as any }))}
                                            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                                                adherence.nutritionSupplement === opt.key
                                                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                                                <span>{opt.label}</span>
                                                {adherence.nutritionSupplement === opt.key && <span className="text-blue-600 font-black">✓</span>}
                                            </div>
                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{opt.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 2. 수면 골든타임 */}
                            <div className="bg-white dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                                    2. 수면 및 기상 골든타임 준수
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    {[
                                        { key: 'well_kept', label: '규칙적으로 준수', desc: '권장 취침/기상 시간 준수' },
                                        { key: 'moderate', label: '보통 수준 준수', desc: '주 2~3일 정도 불규칙' },
                                        { key: 'not_kept', label: '자주 새벽 늦게 취침', desc: '수면 부족 및 극심한 불규칙' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.key}
                                            type="button"
                                            onClick={() => setAdherence(prev => ({ ...prev, sleepSchedule: opt.key as any }))}
                                            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                                                adherence.sleepSchedule === opt.key
                                                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                                                <span>{opt.label}</span>
                                                {adherence.sleepSchedule === opt.key && <span className="text-indigo-600 font-black">✓</span>}
                                            </div>
                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{opt.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 3. 사전 루틴 실천 */}
                            <div className="bg-white dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                                    3. 공부 전 이완 호흡 / 집중 사전 루틴
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    {[
                                        { key: 'well_kept', label: '공부 전 실천함', desc: '4-7-8 호흡 또는 스트레칭' },
                                        { key: 'moderate', label: '생각날 때 가끔 실천', desc: '주 2~3회 실천' },
                                        { key: 'not_kept', label: '거의 실천하지 못함', desc: '바빠서 바로 문제풀이 돌입' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.key}
                                            type="button"
                                            onClick={() => setAdherence(prev => ({ ...prev, preStudyRoutine: opt.key as any }))}
                                            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                                                adherence.preStudyRoutine === opt.key
                                                    ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 ring-2 ring-purple-500/20'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                                                <span>{opt.label}</span>
                                                {adherence.preStudyRoutine === opt.key && <span className="text-purple-600 font-black">✓</span>}
                                            </div>
                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{opt.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================= STEP 2: 비정상 타겟 설문 재응시 (전체 타겟 순차 렌더링) ================= */}
                    {currentStep === 2 && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            {/* 상단 원클릭 전체 일괄 선택 바 */}
                            <div className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                                <div>
                                    <div className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                        <span>🎯</span> 집중 재평가 타겟 총 {targetAreas.length}개 영역 설문
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                        아래 각 영역별로 응답하거나, 우측 원클릭 버튼으로 전체 문항을 일괄 설정할 수 있습니다.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleSetAllMasterBad}
                                        className="px-3 py-1.5 text-xs font-black bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1 border border-rose-500"
                                    >
                                        <span>🚨</span>
                                        <span>[전체 악화] 모두 안좋음 일괄선택</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSetAllMasterGood}
                                        className="px-3 py-1.5 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1 border border-emerald-500"
                                    >
                                        <span>🌿</span>
                                        <span>[전체 호전] 모두 정상 일괄선택</span>
                                    </button>
                                </div>
                            </div>

                            {targetAreas.map((target, targetIdx) => (
                                <div
                                    key={target.id}
                                    className="bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4"
                                >
                                    {/* 타겟 헤더 & 일괄 선택 버튼 */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-700/60">
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-xs font-black">
                                                {targetIdx + 1}
                                            </span>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                                    <span>{target.title}</span>
                                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                                        2주 전: {target.scoreLabel}
                                                    </span>
                                                </h4>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {target.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => handleSetAllTargetGood(target.id)}
                                                className="px-2.5 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                                            >
                                                ⚡ 전체 '완치/정상' 일괄선택
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleSetAllTargetBad(target.id)}
                                                className="px-2.5 py-1 text-[11px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 rounded-lg border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
                                            >
                                                ⚡ 전체 '심함/최대' 일괄선택
                                            </button>
                                        </div>
                                    </div>

                                    {/* CareType 특화 5문항 렌더링 */}
                                    {target.id === 'care_type_specific' && (
                                        <div className="space-y-3">
                                            <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex flex-wrap items-center justify-between gap-2">
                                                <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                                                    💡 직전 진단: <strong className="text-blue-700 dark:text-blue-300">{baselineResult.careType}</strong> | 증상 개선도 5단계 평가 (0점: 전혀 개선안됨 ~ 4점: 완벽히 회복)
                                                </span>
                                                <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                                                    회복 점수: {careTypeAnswers.reduce((a, b) => a + b, 0)} / 20점
                                                </span>
                                            </div>
                                            {getCareTypeFollowUpQuestions(baselineResult.careType).map((q, idx) => (
                                                <div key={q.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                                                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                                                        {idx + 1}. {q.text}
                                                    </div>
                                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                                                        {q.options.map((opt, score) => (
                                                            <button
                                                                key={score}
                                                                type="button"
                                                                onClick={() => {
                                                                    const next = [...careTypeAnswers];
                                                                    next[idx] = score;
                                                                    setCareTypeAnswers(next);
                                                                }}
                                                                className={`px-2 py-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                                                                    careTypeAnswers[idx] === score
                                                                        ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/30'
                                                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700'
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

                                    {/* BAI 렌더링 */}
                                    {target.id === 'bai' && (
                                        <div className="space-y-2">
                                            {BAI_QUESTIONS.map((q, idx) => (
                                                <div key={idx} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                        {idx + 1}. {q}
                                                    </span>
                                                    <div className="flex gap-1 shrink-0">
                                                        {["전혀 없음(0)", "약간(1)", "상당히(2)", "심함(3)"].map((optLabel, score) => (
                                                            <button
                                                                key={score}
                                                                type="button"
                                                                onClick={() => {
                                                                    const next = [...baiAnswers];
                                                                    next[idx] = score;
                                                                    setBaiAnswers(next);
                                                                }}
                                                                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                                    baiAnswers[idx] === score
                                                                        ? 'bg-blue-600 text-white shadow-sm'
                                                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700'
                                                                }`}
                                                            >
                                                                {optLabel}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* ISI 렌더링 */}
                                    {target.id === 'isi' && (
                                        <div className="space-y-3">
                                            {ISI_QUESTIONS.map((q, idx) => (
                                                <div key={q.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                                                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                                                        {idx + 1}. {q.label}
                                                    </div>
                                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                                                        {q.options.map((opt, score) => (
                                                            <button
                                                                key={score}
                                                                type="button"
                                                                onClick={() => {
                                                                    const next = [...isiAnswers];
                                                                    next[idx] = score;
                                                                    setIsiAnswers(next);
                                                                }}
                                                                className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                                                                    isiAnswers[idx] === score
                                                                        ? 'bg-indigo-600 text-white shadow-sm'
                                                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700'
                                                                }`}
                                                            >
                                                                {opt} ({score}점)
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* CFS 렌더링 */}
                                    {target.id === 'fatigue' && (
                                        <div className="space-y-3">
                                            <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={fatigueCore}
                                                        onChange={(e) => setFatigueCore(e.target.checked)}
                                                        className="w-4 h-4 rounded text-amber-600"
                                                    />
                                                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                                                        지난 2주간 휴식으로 회복되지 않는 극심한 전신 피로가 계속되었습니까?
                                                    </span>
                                                </label>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {FATIGUE_SYMPTOMS.map((symptom, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => {
                                                            const next = [...fatigueSymptoms];
                                                            next[idx] = !next[idx];
                                                            setFatigueSymptoms(next);
                                                        }}
                                                        className={`p-3 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                                                            fatigueSymptoms[idx]
                                                                ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold'
                                                                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 bg-white dark:bg-slate-800'
                                                        }`}
                                                    >
                                                        <span>{symptom}</span>
                                                        <span>{fatigueSymptoms[idx] ? '✓' : ''}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* SNS 렌더링 */}
                                    {target.id === 'sns' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {SYMPATHETIC_SYMPTOMS.map((sym, idx) => {
                                                const isSelected = snsSymptomSelection.includes(sym.label);
                                                return (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                setSnsSymptomSelection(prev => prev.filter(item => item !== sym.label));
                                                            } else {
                                                                setSnsSymptomSelection(prev => [...prev, sym.label]);
                                                            }
                                                        }}
                                                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                                            isSelected
                                                                ? 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                                                                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 bg-white dark:bg-slate-800'
                                                        }`}
                                                    >
                                                        <div className="text-xs font-bold flex items-center justify-between">
                                                            <span>{sym.label}</span>
                                                            {isSelected && <span className="text-rose-600 font-black">✓</span>}
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{sym.desc}</div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* PNS 렌더링 */}
                                    {target.id === 'pns' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {PARASYMPATHETIC_SYMPTOMS.map((sym, idx) => {
                                                const isSelected = pnsSymptomSelection.includes(sym.label);
                                                return (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                setPnsSymptomSelection(prev => prev.filter(item => item !== sym.label));
                                                            } else {
                                                                setPnsSymptomSelection(prev => [...prev, sym.label]);
                                                            }
                                                        }}
                                                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                                            isSelected
                                                                ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                                                                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 bg-white dark:bg-slate-800'
                                                        }`}
                                                    >
                                                        <div className="text-xs font-bold flex items-center justify-between">
                                                            <span>{sym.label}</span>
                                                            {isSelected && <span className="text-indigo-600 font-black">✓</span>}
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{sym.desc}</div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* 집중력 렌더링 */}
                                    {target.id === 'concentration' && (
                                        <div className="space-y-2">
                                            {CONCENTRATION_QUESTIONS.map((q, idx) => (
                                                <div key={idx} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                        {idx + 1}. {q}
                                                    </span>
                                                    <div className="flex gap-1 shrink-0">
                                                        {["전혀 아님(0)", "약간 그럼(1)", "자주 그럼(2)", "매우 심함(3)"].map((optLabel, score) => (
                                                            <button
                                                                key={score}
                                                                type="button"
                                                                onClick={() => {
                                                                    const next = [...concentrationAnswers];
                                                                    next[idx] = score;
                                                                    setConcentrationAnswers(next);
                                                                }}
                                                                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                                    concentrationAnswers[idx] === score
                                                                        ? 'bg-purple-600 text-white shadow-sm'
                                                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700'
                                                                }`}
                                                            >
                                                                {optLabel}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* 부신 피로 렌더링 */}
                                    {target.id === 'adrenal' && (
                                        <div className="space-y-3">
                                            {ADRENAL_QUESTIONS.map((cat, catIdx) => (
                                                <div key={catIdx} className="space-y-1.5">
                                                    <div className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-lg">
                                                        {cat.category}
                                                    </div>
                                                    {cat.questions.map((q, qIdx) => {
                                                        const globalIdx = catIdx * 4 + qIdx;
                                                        return (
                                                            <div key={qIdx} className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                                    • {q}
                                                                </span>
                                                                <div className="flex gap-1 shrink-0">
                                                                    {["아님(0)", "가끔(1)", "자주(2)", "항상(3)"].map((optLabel, score) => (
                                                                        <button
                                                                            key={score}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const next = [...adrenalAnswers];
                                                                                next[globalIdx] = score;
                                                                                setAdrenalAnswers(next);
                                                                            }}
                                                                            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                                                adrenalAnswers[globalIdx] === score
                                                                                    ? 'bg-amber-600 text-white shadow-sm'
                                                                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700'
                                                                            }`}
                                                                        >
                                                                            {optLabel}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* 웰니스 (정상 유지군) 렌더링 */}
                                    {target.id === 'wellness_general' && (
                                        <div className="space-y-3">
                                            {GENERAL_WELLNESS_QUESTIONS.map((q, idx) => (
                                                <div key={q.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                                                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                                                        {idx + 1}. {q.text}
                                                    </div>
                                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                                                        {q.options.map((opt, score) => (
                                                            <button
                                                                key={score}
                                                                type="button"
                                                                onClick={() => {
                                                                    const next = [...wellnessAnswers];
                                                                    next[idx] = score + 1;
                                                                    setWellnessAnswers(next);
                                                                }}
                                                                className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                                                                    wellnessAnswers[idx] === score + 1
                                                                        ? 'bg-emerald-600 text-white shadow-sm'
                                                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700'
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
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ================= STEP 3: 신규 이상 게이트 & 최종 점검 ================= */}
                    {currentStep === 3 && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
                                <h3 className="text-sm font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                                    <span>🛡️</span> 신규 증상 안전망 게이트 (Safety-Net)
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                    이전 검사에서는 정상이거나 없었으나, <strong>지난 2주 사이에 모의고사, 수면 부족 등으로 새롭게 생겨난 심각한 이상 증상</strong>이 있는지 확인합니다.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                                    지난 2주간 새롭게 나타난 심한 스트레스·신체 이상 증상이 있습니까?
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setHasNewSymptoms(false)}
                                        className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                                            !hasNewSymptoms
                                                ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold ring-2 ring-emerald-500/20'
                                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="text-sm font-black">❌ 전혀 없음</div>
                                        <div className="text-xs text-slate-500 mt-0.5">기존 상태가 유지되거나 호전됨</div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setHasNewSymptoms(true)}
                                        className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                                            hasNewSymptoms
                                                ? 'border-amber-600 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold ring-2 ring-amber-500/20'
                                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="text-sm font-black">⚠️ 새 증상 있음</div>
                                        <div className="text-xs text-slate-500 mt-0.5">새로운 두통, 불면, 시험공포 등 발생</div>
                                    </button>
                                </div>

                                {hasNewSymptoms && (
                                    <div className="pt-3 animate-in fade-in duration-150">
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            새롭게 나타난 증상이나 고민을 간단히 적어주세요 (AI 및 임상 분석에 반영):
                                        </label>
                                        <textarea
                                            value={newSymptomText}
                                            onChange={(e) => setNewSymptomText(e.target.value)}
                                            rows={2}
                                            placeholder="예: 3일 전부터 모의고사 결과 때문에 밤에 자꾸 깨고 가슴이 답답합니다."
                                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* 요약 안내 */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                                <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <span>📋</span> 검사 요약 및 재진단 안내
                                </div>
                                <p className="text-slate-500 dark:text-slate-400">
                                    • 이전 검사의 정상 지표는 유지(Carry-over)되며, 오늘 응답한 타겟 영역({targetAreas.map(t => t.title).join(', ')})의 실측 점수를 기반으로 12대 케어타입과 호전/악화 델타(Delta)가 즉시 재계산됩니다.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* 하단 네비게이션 액션바 */}
                <div className="p-4 sm:px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
                    <div>
                        {currentStep > 1 && (
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                ← 이전 단계
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {currentStep < 3 ? (
                            <button
                                type="button"
                                onClick={() => setCurrentStep((prev) => (prev + 1) as any)}
                                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                                <span>다음 단계로 이동</span>
                                <span>→</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                disabled={isSubmitting || isTooEarly}
                                onClick={handleSubmit}
                                title={isTooEarly ? `D-${remainingDays}일 후 제출 가능` : undefined}
                                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-black shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>2주 추적 결과 분석 중...</span>
                                    </>
                                ) : isTooEarly ? (
                                    <>
                                        <span>⏱️</span>
                                        <span>D-{remainingDays}일 후 제출 가능</span>
                                    </>
                                ) : (
                                    <>
                                        <span>🚀</span>
                                        <span>추적 검사 제출 및 Before & After 결과 확인</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
