import React from 'react';
import { Layout } from '../Layout';
import { StepProgressBar } from '../ui/StepProgressBar';
import { BreathingGuide } from '../BreathingGuide';
import { HRVData, StudentInfo, ANSBalanceType, PortableHRVData, ANS_BALANCE_DESCRIPTIONS, STRESS_LEVEL_DESCRIPTIONS, getStressLevel } from '../../types';
import { OCRImportButton } from '../OCRImportButton';

interface HRVStepProps {
    // Navigation
    onNext: () => void;
    onBack: () => void;
    handleFinalAssessment: () => void;

    // Layout props
    activeMenu: 'dashboard' | 'assessment' | 'history' | 'progress' | 'resources';
    onMenuChange: (menu: any) => void;
    isDarkMode: boolean;
    onToggleDarkMode: () => void;

    // Config
    config: {
        isMedicalMode: boolean;
        useBrainBody: boolean;
        usePortable: boolean;
    };

    // Student Info
    student: StudentInfo;

    // HRV State
    hrv: HRVData;
    setHrv: React.Dispatch<React.SetStateAction<HRVData>>;

    // Portable HRV State
    portableHrv: PortableHRVData;
    setPortableHrv: React.Dispatch<React.SetStateAction<PortableHRVData>>;

    // Breathing Guide
    showBreathingGuide: boolean;
    setShowBreathingGuide: React.Dispatch<React.SetStateAction<boolean>>;

    // Multi-Monitor Sync
    isMultiMonitorMode: boolean;
    syncSessionId: string | null;
    syncStudentReady: boolean;
    syncStudentData: any;
    syncOpenStudentWindow: () => Window | null;
    setStudentWindowRef: (ref: Window | null) => void;

    // Progress Bar
    onStepClick?: (stepId: any) => void;
}

export const HRVStep: React.FC<HRVStepProps> = ({
    onNext,
    onBack,
    handleFinalAssessment,
    activeMenu,
    onMenuChange,
    isDarkMode,
    onToggleDarkMode,
    config,
    student,
    hrv,
    setHrv,
    portableHrv,
    setPortableHrv,
    showBreathingGuide,
    setShowBreathingGuide,
    isMultiMonitorMode,
    syncSessionId,
    syncStudentReady,
    syncStudentData,
    syncOpenStudentWindow,
    setStudentWindowRef,
    onStepClick
}) => {
    const handleImportComplete = (newHrvData: Partial<HRVData>, newStudentInfo: Partial<StudentInfo>) => {
        setHrv(prev => ({ ...prev, ...newHrvData }));
        // Note: In a full implementation, we might also want to lift student info up 
        // to a global state or parent component, but for now we focus on HRV.
    };

    return (
        <Layout activeMenu={activeMenu} onMenuChange={onMenuChange} isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode}>
            <StepProgressBar currentStep="hrv" isMedicalMode={config.isMedicalMode} isPortableMode={config.usePortable} onStepClick={onStepClick} />
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 mt-4">
                <div className="flex flex-col items-center text-center gap-4">
                    <img src="./HRV logo.JPG" alt="HRV Logo" className="w-24 h-24 object-contain" />
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900">Step 4: {config.useBrainBody ? 'Clinical Biometrics (HRV)' : 'Portable Biometrics'}</h2>
                        <p className="text-slate-500 mt-2">{config.useBrainBody ? 'PPG/HRV 결과 분석 리포트의 데이터를 입력하십시오.' : 'Portable 장비(uBioMacpa) 측정 결과를 입력하십시오.'}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
                        <button
                            onClick={() => setShowBreathingGuide(true)}
                            className="px-6 py-3 bg-emerald-100 text-emerald-800 font-bold rounded-full text-sm hover:bg-emerald-200 transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <span>🌬️</span> 측정 전 호흡 가이드 실행
                        </button>
                        
                        {(config.useBrainBody || !config.usePortable) && (
                            <OCRImportButton onImportComplete={handleImportComplete} />
                        )}
                    </div>
                </div>

                {showBreathingGuide && <BreathingGuide onClose={() => setShowBreathingGuide(false)} />}

                {/* 멀티모니터 상태 패널 */}
                {isMultiMonitorMode && syncSessionId && (
                    <div className={`p-6 rounded-2xl border-2 transition-all ${syncStudentData.survey
                        ? 'bg-emerald-50 border-emerald-300'
                        : syncStudentReady
                            ? 'bg-cyan-50 border-cyan-300'
                            : 'bg-amber-50 border-amber-300'
                        }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${syncStudentData.survey
                                    ? 'bg-emerald-100'
                                    : syncStudentReady
                                        ? 'bg-cyan-100'
                                        : 'bg-amber-100'
                                    }`}>
                                    {syncStudentData.survey ? '✅' : syncStudentReady ? '👤' : '⏳'}
                                </div>
                                <div>
                                    <h3 className={`text-lg font-black ${syncStudentData.survey
                                        ? 'text-emerald-900'
                                        : syncStudentReady
                                            ? 'text-cyan-900'
                                            : 'text-amber-900'
                                        }`}>
                                        {syncStudentData.survey
                                            ? '학생 설문 완료!'
                                            : syncStudentReady
                                                ? '학생 설문 진행 중...'
                                                : '학생 창 연결 대기 중'}
                                    </h3>
                                    <p className={`text-xs ${syncStudentData.survey
                                        ? 'text-emerald-600'
                                        : syncStudentReady
                                            ? 'text-cyan-600'
                                            : 'text-amber-600'
                                        }`}>
                                        세션: {syncSessionId.substring(0, 8)}... | {student.name}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {syncStudentData.survey && (
                                    <div className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold">
                                        📊 BAI: {syncStudentData.survey?.baiScores?.reduce((a: number, b: number) => a + b, 0)}점
                                    </div>
                                )}
                                <button
                                    onClick={() => {
                                        const studentWin = syncOpenStudentWindow();
                                        setStudentWindowRef(studentWin);
                                    }}
                                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50"
                                >
                                    🖥️ 학생 창 다시 열기
                                </button>
                            </div>
                        </div>

                        {/* 수신 데이터 미리보기 */}
                        {syncStudentData.survey && (
                            <div className="mt-4 grid grid-cols-3 gap-3">
                                <div className="p-3 bg-white rounded-xl border border-emerald-100">
                                    <p className="text-xs text-slate-500">BAI (불안)</p>
                                    <p className="text-lg font-bold text-slate-800">{syncStudentData.survey?.baiScores?.reduce((a: number, b: number) => a + b, 0) || 0}점</p>
                                </div>
                                <div className="p-3 bg-white rounded-xl border border-emerald-100">
                                    <p className="text-xs text-slate-500">ISI (수면)</p>
                                    <p className="text-lg font-bold text-slate-800">{syncStudentData.survey?.isiScores?.reduce((a: number, b: number) => a + b, 0) || 0}점</p>
                                </div>
                                <div className="p-3 bg-white rounded-xl border border-emerald-100">
                                    <p className="text-xs text-slate-500">집중력</p>
                                    <p className="text-lg font-bold text-slate-800">{syncStudentData.survey?.concentrationScores?.reduce((a: number, b: number) => a + b, 0) || 0}점</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ========== Portable (uBioMacpa) 전용 입력 섹션 ========== */}
                {(!config.useBrainBody && config.usePortable) && (
                    <div className="space-y-6">
                        {/* 스트레스 지수 및 맥박 변화도 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* 스트레스 지수 */}
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                    <div className="w-1.5 h-4 bg-red-500 rounded-full"></div>
                                    <h3 className="font-bold text-slate-800 text-lg">📊 스트레스 지수</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500">스트레스 지수</label>
                                            <input
                                                type="number"
                                                value={portableHrv.stressIndex || ''}
                                                onChange={e => setPortableHrv({ ...portableHrv, stressIndex: e.target.value ? parseInt(e.target.value, 10) || 0 : 0 })}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center text-2xl"
                                                placeholder="27"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500">백분율 (%)</label>
                                            <input
                                                type="number"
                                                value={portableHrv.stressPercent || ''}
                                                onChange={e => setPortableHrv({ ...portableHrv, stressPercent: e.target.value ? parseInt(e.target.value, 10) || 0 : 0 })}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center text-2xl"
                                                placeholder="43"
                                            />
                                        </div>
                                    </div>
                                    {/* 스트레스 등급 표시 */}
                                    {portableHrv.stressIndex > 0 && (() => {
                                        const level = getStressLevel(portableHrv.stressIndex);
                                        const info = STRESS_LEVEL_DESCRIPTIONS[level];
                                        const colorMap: Record<string, string> = {
                                            emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
                                            green: 'bg-green-50 border-green-200 text-green-700',
                                            yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
                                            orange: 'bg-orange-50 border-orange-200 text-orange-700',
                                            red: 'bg-red-50 border-red-200 text-red-700'
                                        };
                                        return (
                                            <div className={`p-4 rounded-xl border ${colorMap[info.color]}`}>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{level === 'chronic' ? '🚨' : level === 'weakening' ? '⚠️' : level === 'early' ? '😐' : '😊'}</span>
                                                    <div>
                                                        <p className="font-bold">{info.label}</p>
                                                        <p className="text-xs opacity-80">{info.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                    <p className="text-[10px] text-slate-400">
                                        📌 기준: 0-25 정상 / 26-34 일시적 / 35-44 초기 / 45-59 내성약화 / 60+ 만성진행
                                    </p>
                                </div>
                            </div>

                            {/* 맥박 변화도 */}
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                    <div className="w-1.5 h-4 bg-purple-500 rounded-full"></div>
                                    <h3 className="font-bold text-slate-800 text-lg">💓 맥박 변화도</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500">맥박 변화도 (성인평균 30-40)</label>
                                        <input
                                            type="number"
                                            value={portableHrv.pulseVariability || ''}
                                            onChange={e => setPortableHrv({ ...portableHrv, pulseVariability: e.target.value ? parseInt(e.target.value, 10) || 0 : 0 })}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center text-2xl"
                                            placeholder="57"
                                        />
                                    </div>
                                    {/* 맥박 변화도 해석 */}
                                    {portableHrv.pulseVariability > 0 && (
                                        <div className={`p-4 rounded-xl border ${portableHrv.pulseVariability <= 20 ? 'bg-red-50 border-red-200 text-red-700' :
                                            portableHrv.pulseVariability <= 30 ? 'bg-orange-50 border-orange-200 text-orange-700' :
                                                portableHrv.pulseVariability <= 50 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                                    'bg-blue-50 border-blue-200 text-blue-700'
                                            }`}>
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">
                                                    {portableHrv.pulseVariability <= 20 ? '🚨' :
                                                        portableHrv.pulseVariability <= 30 ? '⚠️' :
                                                            portableHrv.pulseVariability <= 50 ? '✅' : '💪'}
                                                </span>
                                                <div>
                                                    <p className="font-bold">
                                                        {portableHrv.pulseVariability <= 20 ? '만성스트레스 의심' :
                                                            portableHrv.pulseVariability <= 30 ? '스트레스 누적' :
                                                                portableHrv.pulseVariability <= 50 ? '정상 범위' : '양호한 자율신경 기능'}
                                                    </p>
                                                    <p className="text-xs opacity-80">
                                                        {portableHrv.pulseVariability <= 20 ? '자율신경 기능 저하, 전문의 상담 권장' :
                                                            portableHrv.pulseVariability <= 30 ? '휴식과 스트레스 관리 필요' :
                                                                portableHrv.pulseVariability <= 50 ? '정상적인 자율신경 기능' : '우수한 스트레스 대응력'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <p className="text-[10px] text-slate-400">
                                        📌 20 이하: 만성스트레스 / 20-30: 주의 / 30-50: 정상 / 50+: 양호
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 자율신경균형도 유형 선택 */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                                <h3 className="font-bold text-slate-800 text-lg">🧠 자율신경균형도 유형</h3>
                            </div>
                            <p className="text-[10px] text-indigo-600 bg-indigo-50 p-2 rounded-lg">
                                💡 uBioMacpa 결과지의 '자율신경균형도' 분석에서 해당하는 유형을 선택하세요.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {Object.entries(ANS_BALANCE_DESCRIPTIONS).map(([type, info]) => (
                                    <button
                                        key={type}
                                        onClick={() => setPortableHrv({ ...portableHrv, ansBalanceType: type as ANSBalanceType })}
                                        className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${portableHrv.ansBalanceType === type
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200'
                                            }`}
                                    >
                                        <span className="text-xl mb-1">
                                            {type === ANSBalanceType.OVERWORK_CHRONIC ? '😰' :
                                                type === ANSBalanceType.ACUTE ? '😤' :
                                                    type === ANSBalanceType.DISEASE_CHRONIC ? '🏥' :
                                                        type === ANSBalanceType.CHRONIC ? '😓' : '😊'}
                                        </span>
                                        <span className="text-xs font-bold text-center">{info.label}</span>
                                    </button>
                                ))}
                            </div>
                            {/* 선택된 유형 해석 */}
                            {portableHrv.ansBalanceType && (
                                <div className={`p-4 rounded-xl border ${portableHrv.ansBalanceType === ANSBalanceType.NORMAL ? 'bg-emerald-50 border-emerald-200' :
                                    portableHrv.ansBalanceType === ANSBalanceType.ACUTE ? 'bg-yellow-50 border-yellow-200' :
                                        'bg-red-50 border-red-200'
                                    }`}>
                                    <p className={`text-sm ${portableHrv.ansBalanceType === ANSBalanceType.NORMAL ? 'text-emerald-700' :
                                        portableHrv.ansBalanceType === ANSBalanceType.ACUTE ? 'text-yellow-700' :
                                            'text-red-700'
                                        }`}>
                                        <strong>{ANS_BALANCE_DESCRIPTIONS[portableHrv.ansBalanceType].label}</strong>: {ANS_BALANCE_DESCRIPTIONS[portableHrv.ansBalanceType].description}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* HRV 상세 데이터 */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                <div className="w-1.5 h-4 bg-teal-500 rounded-full"></div>
                                <h3 className="font-bold text-slate-800 text-lg">📈 HRV 상세 데이터</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">LF</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={portableHrv.lf || ''}
                                        onChange={e => setPortableHrv({ ...portableHrv, lf: e.target.value ? parseFloat(e.target.value) || 0 : 0 })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">HF</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={portableHrv.hf || ''}
                                        onChange={e => setPortableHrv({ ...portableHrv, hf: e.target.value ? parseFloat(e.target.value) || 0 : 0 })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">LF/HF 비율</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={portableHrv.lfHfRatio || ''}
                                        onChange={e => setPortableHrv({ ...portableHrv, lfHfRatio: e.target.value ? parseFloat(e.target.value) || 0 : 0 })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                                    />
                                    {portableHrv.lfHfRatio > 0 && (
                                        <p className={`text-[10px] ${portableHrv.lfHfRatio > 2.0 ? 'text-red-500' :
                                            portableHrv.lfHfRatio < 0.5 ? 'text-blue-500' :
                                                'text-emerald-500'
                                            }`}>
                                            {portableHrv.lfHfRatio > 2.0 ? '⚠️ 교감신경 과활성' :
                                                portableHrv.lfHfRatio < 0.5 ? '💤 부교감 우세 (피로/무기력)' :
                                                    '✅ 자율신경 균형'}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">Mean BPM</label>
                                    <input
                                        type="number"
                                        value={portableHrv.meanBpm || ''}
                                        onChange={e => setPortableHrv({ ...portableHrv, meanBpm: e.target.value ? parseInt(e.target.value, 10) || 0 : 0 })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">SDNN</label>
                                    <input
                                        type="number"
                                        value={portableHrv.sdnn || ''}
                                        onChange={e => setPortableHrv({ ...portableHrv, sdnn: e.target.value ? parseInt(e.target.value, 10) || 0 : 0 })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                                    />
                                    {portableHrv.sdnn > 0 && (
                                        <p className={`text-[10px] ${portableHrv.sdnn < 30 ? 'text-red-500' :
                                            portableHrv.sdnn < 50 ? 'text-orange-500' :
                                                'text-emerald-500'
                                            }`}>
                                            {portableHrv.sdnn < 30 ? '🚨 HRV 매우 낮음' :
                                                portableHrv.sdnn < 50 ? '⚠️ 스트레스 주의' :
                                                    '✅ 양호'}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">RMSSD</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={portableHrv.rmssd || ''}
                                        onChange={e => setPortableHrv({ ...portableHrv, rmssd: e.target.value ? parseFloat(e.target.value) || 0 : 0 })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                                    />
                                    {portableHrv.rmssd > 0 && (
                                        <p className={`text-[10px] ${portableHrv.rmssd < 20 ? 'text-red-500' :
                                            portableHrv.rmssd < 40 ? 'text-yellow-500' :
                                                'text-emerald-500'
                                            }`}>
                                            {portableHrv.rmssd < 20 ? '🚨 회복력 부족' :
                                                portableHrv.rmssd < 40 ? '😐 보통' :
                                                    '✅ 우수한 회복력'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 혈관 건강 지수 */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                <div className="w-1.5 h-4 bg-rose-500 rounded-full"></div>
                                <h3 className="font-bold text-slate-800 text-lg">🩸 혈관 건강 지수</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">혈관 건강 지수 (Vascular Health Index)</label>
                                    <input
                                        type="number"
                                        value={portableHrv.vascularHealthIndex}
                                        onChange={e => setPortableHrv({ ...portableHrv, vascularHealthIndex: e.target.value ? parseInt(e.target.value, 10) : 0 })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center text-2xl"
                                        placeholder="+29"
                                    />
                                </div>
                                {/* 혈관 건강 지수 해석 */}
                                <div className={`p-4 rounded-xl border ${portableHrv.vascularHealthIndex <= 5 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                    portableHrv.vascularHealthIndex <= 20 ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                        'bg-red-50 border-red-200 text-red-700'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">
                                            {portableHrv.vascularHealthIndex <= 5 ? '✅' :
                                                portableHrv.vascularHealthIndex <= 20 ? '⚠️' : '🚨'}
                                        </span>
                                        <div>
                                            <p className="font-bold">
                                                {portableHrv.vascularHealthIndex <= 5 ? '안전 (Safe)' :
                                                    portableHrv.vascularHealthIndex <= 20 ? '경계 (Caution)' : '위험 (Danger)'}
                                            </p>
                                            <p className="text-xs opacity-80">
                                                {portableHrv.vascularHealthIndex <= 5 ? '건강한 생활습관을 유지하고 있습니다.' :
                                                    portableHrv.vascularHealthIndex <= 20 ? '생활습관에 주의가 필요합니다. 규칙적인 운동과 식단 관리를 권장합니다.' :
                                                        '전문가의 진단이 필요합니다. 즉시 의료 상담을 권장합니다.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400">
                                    📌 기준: -30~+5 안전 / +6~+20 경계 / +20 이상 위험
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========== 기존 BrainBody HRV UI (Portable 모드에서는 숨김) ========== */}
                {(config.useBrainBody || !config.usePortable) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                                <h3 className="font-bold text-slate-800 text-lg">자율신경(ANS) 분석</h3>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-sm font-bold text-slate-700">SNS (교감신경) %</label>
                                        <span className="text-red-600 font-bold">{hrv.sns}%</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-bold text-slate-400">PNS</span>
                                        <input
                                            type="range" min="0" max="100" step="0.1" value={hrv.sns}
                                            onChange={(e) => setHrv({ ...hrv, sns: Number(e.target.value), pns: Number((100 - Number(e.target.value)).toFixed(1)) })}
                                            className="flex-1 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-red-600"
                                        />
                                        <span className="text-[10px] font-bold text-red-400">SNS</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500">평균 심박수(HR)</label>
                                        <input type="number" value={hrv.meanHr || ''} onChange={e => setHrv({ ...hrv, meanHr: e.target.value ? parseInt(e.target.value, 10) || 0 : 0 })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500">HRV-Index</label>
                                        <input type="number" step="0.01" value={hrv.hrvIndex || ''} onChange={e => setHrv({ ...hrv, hrvIndex: e.target.value ? parseFloat(e.target.value) || 0 : 0 })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                <div className="w-1.5 h-4 bg-amber-500 rounded-full"></div>
                                <h3 className="font-bold text-slate-800 text-lg">주파수 영역 분석</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {["tp", "vlf", "lf", "hf"].map(k => (
                                    <div key={k} className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">{k}</label>
                                        <input type="number" step="0.01" value={(hrv[k as keyof HRVData] as number) || ''} onChange={e => setHrv({ ...hrv, [k]: e.target.value ? parseFloat(e.target.value) || 0 : 0 })} className="w-full p-2 bg-slate-50 border rounded-xl" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 혈관 건강 분석 (PPG Level) */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 md:col-span-2">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                <div className="w-1.5 h-4 bg-rose-500 rounded-full"></div>
                                <h3 className="font-bold text-slate-800 text-lg">혈관 건강 분석 (APG 유형)</h3>
                            </div>
                            <p className="text-[10px] text-rose-600 bg-rose-50 p-2 rounded-lg">💡 PPG 검사 결과에서 혈관 건강 레벨을 선택하세요. 혈관 상태는 뇌 기능과 집중력에 영향을 미칩니다.</p>
                            <div className="space-y-4">
                                <div className="grid grid-cols-7 gap-2">
                                    {[
                                        { level: 1, label: 'Lev.1', status: '매우좋음', color: 'emerald', emoji: '💚' },
                                        { level: 2, label: 'Lev.2', status: '좋음', color: 'green', emoji: '💚' },
                                        { level: 3, label: 'Lev.3', status: '보통', color: 'lime', emoji: '💛' },
                                        { level: 4, label: 'Lev.4', status: '다소나쁨', color: 'yellow', emoji: '🧡' },
                                        { level: 5, label: 'Lev.5', status: '나쁨', color: 'orange', emoji: '🧡' },
                                        { level: 6, label: 'Lev.6', status: '꽤 나쁨', color: 'red', emoji: '❤️' },
                                        { level: 7, label: 'Lev.7', status: '매우나쁨', color: 'rose', emoji: '❤️' }
                                    ].map(item => (
                                        <button
                                            key={item.level}
                                            onClick={() => setHrv({ ...hrv, ppgLevel: item.level })}
                                            className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${hrv.ppgLevel === item.level
                                                ? 'bg-rose-600 text-white border-rose-600 shadow-lg scale-105'
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-rose-200'
                                                }`}
                                        >
                                            <span className="text-lg">{item.emoji}</span>
                                            <span className="text-[10px] font-bold mt-1">{item.label}</span>
                                            <span className={`text-[8px] ${hrv.ppgLevel === item.level ? 'text-white/80' : 'text-slate-400'}`}>{item.status}</span>
                                        </button>
                                    ))}
                                </div>
                                {hrv.ppgLevel && (
                                    <div className={`p-4 rounded-xl border ${hrv.ppgLevel <= 2 ? 'bg-emerald-50 border-emerald-200' :
                                        hrv.ppgLevel <= 4 ? 'bg-yellow-50 border-yellow-200' :
                                            'bg-rose-50 border-rose-200'
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`text-3xl font-black ${hrv.ppgLevel <= 2 ? 'text-emerald-600' :
                                                hrv.ppgLevel <= 4 ? 'text-yellow-600' :
                                                    'text-rose-600'
                                                }`}>Lev.{hrv.ppgLevel}</div>
                                            <div>
                                                <p className={`text-sm font-bold ${hrv.ppgLevel <= 2 ? 'text-emerald-700' :
                                                    hrv.ppgLevel <= 4 ? 'text-yellow-700' :
                                                        'text-rose-700'
                                                    }`}>
                                                    {hrv.ppgLevel === 1 ? '혈관 상태: 매우 좋음' :
                                                        hrv.ppgLevel === 2 ? '혈관 상태: 좋음' :
                                                            hrv.ppgLevel === 3 ? '혈관 상태: 보통' :
                                                                hrv.ppgLevel === 4 ? '혈관 상태: 다소 나쁨' :
                                                                    hrv.ppgLevel === 5 ? '혈관 상태: 나쁨' :
                                                                        hrv.ppgLevel === 6 ? '혈관 상태: 꽤 나쁨' :
                                                                            '혈관 상태: 매우 나쁨'}
                                                </p>
                                                <p className={`text-[10px] mt-1 ${hrv.ppgLevel <= 2 ? 'text-emerald-600' :
                                                    hrv.ppgLevel <= 4 ? 'text-yellow-600' :
                                                        'text-rose-600'
                                                    }`}>
                                                    {hrv.ppgLevel === 1 ? '혈관 탄력성이 매우 우수합니다. 혈액 순환이 원활하여 뇌 기능에 최적의 환경입니다.' :
                                                        hrv.ppgLevel === 2 ? '혈관 상태가 양호합니다. 현재 생활 습관을 유지하세요.' :
                                                            hrv.ppgLevel === 3 ? '평균적인 혈관 상태입니다. 규칙적인 운동을 권장합니다.' :
                                                                hrv.ppgLevel === 4 ? '혈관 탄력성이 다소 저하되었습니다. 스트레칭과 가벼운 운동을 권장합니다.' :
                                                                    hrv.ppgLevel === 5 ? '혈관 건강에 주의가 필요합니다. 생활 습관 개선이 필요합니다.' :
                                                                        hrv.ppgLevel === 6 ? '혈관 건강이 저하되었습니다. 전문가 상담을 권장합니다.' :
                                                                            '혈관 건강이 매우 나쁘니다. 의료 전문가 상담이 필요합니다.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex gap-4">
                    <button onClick={onBack} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all">Back</button>
                    <button
                        onClick={onNext}
                        className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-all"
                    >
                        {(config.usePortable && !config.useBrainBody) ? (config.isMedicalMode ? 'Next: Blood Test' : 'Generate Report') : 'Next: EEG Analysis'}
                    </button>
                </div>
            </div>
        </Layout>
    );
};
