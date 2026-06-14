import React, { memo, useRef } from 'react';
import { CareType, StrategyMap, Prescription } from '../../types';
import { SUBJECT_OPTIONS_MAP } from '../../data/subjectOptions';
import { PRODUCTS } from '../../data/products';
import {
    LogicEngineConfig,
    LogicThresholds
} from '../../logicEngine';
import { PredictionRuleEditor } from './PredictionRuleEditor';
import { AnalystSettings } from '../settings/AnalystSettings';
import { AnalystsStorage } from '../../utils/analystConfig';
import { ManualManager } from '../settings/ManualManager';
import { PatentAnalysis } from '../settings/PatentAnalysis';
import { PromptModal } from './PromptModal';

// Tab type definition including logic, products, and prediction tabs
type ConfigTab = 'general' | 'strategy' | 'subject' | 'prescriptions' | 'logic' | 'products' | 'prediction' | 'manuals' | 'aimodel' | 'patent';

interface ConfigModalProps {
    isOpen: boolean;
    activeTab: ConfigTab;
    onTabChange: (tab: ConfigTab) => void;
    onClose: () => void;
    config: {
        isExamMode: boolean;
        showDetail: boolean;
        isMedicalMode?: boolean;
        useBrainBody?: boolean;
        usePortable?: boolean;
        expertModePassword?: string;
        examiners?: import('../../types').Examiner[];
        currentExaminerId?: string | null;
    };
    onConfigChange: (config: {
        isExamMode: boolean;
        showDetail: boolean;
        isMedicalMode?: boolean;
        useBrainBody?: boolean;
        usePortable?: boolean;
        expertModePassword?: string;
        examiners?: import('../../types').Examiner[];
        currentExaminerId?: string | null;
    }) => void;
    strategies: StrategyMap;
    onStrategiesChange: (strategies: StrategyMap) => void;
    prescriptions: Record<string, Prescription>;
    onPrescriptionsChange: (prescriptions: Record<string, Prescription>) => void;
    editingStrategyType: CareType;
    onEditingStrategyTypeChange: (type: CareType) => void;
    selectedSubjectOptions: Record<string, string[]>;
    onSelectedSubjectOptionsChange: (options: Record<string, string[]>) => void;
    isAdminUnlocked: boolean;
    onViewConsultantManual: () => void;
    // Logic Engine Props
    logicConfig?: LogicEngineConfig;
    onLogicConfigChange?: (config: LogicEngineConfig) => void;
    onResetLogicConfig?: () => void;
    // Product Recommendations Props
    productRecommendations?: Record<string, string[]>;
    onProductRecommendationsChange?: (recs: Record<string, string[]>) => void;
    onResetProductRecommendations?: () => void;
    // Prediction Rules Props
    predictionRules?: any[];
    onPredictionRulesChange?: (rules: any[]) => void;
    onResetPredictionRules?: () => void;
    // Analyst Storage Props
    analystStorage?: AnalystsStorage;
    onAnalystStorageChange?: (storage: AnalystsStorage) => void;
    onResetAnalystStorage?: () => void;
    // Previous Result for History tracking
    previousResult?: any;
    // AI Model Settings
    aiModels?: import('../../types').AIModelConfig;
    onAiModelsChange?: (models: import('../../types').AIModelConfig) => void;
}

// 임계값 설정 해설 데이터
const THRESHOLD_DESCRIPTIONS: Record<string, { label: string; description: string; color: string; recommended: string }> = {
    snsHigh: {
        label: 'SNS High (교감신경 과활성 기준)',
        description: '교감신경(SNS) 활성도가 이 값 이상이면 "과긴장/스트레스 상태"로 진단합니다. 높을수록 진단 기준이 엄격해집니다.',
        color: 'rose',
        recommended: '권장: 55~65%'
    },
    snsLow: {
        label: 'SNS Low (교감신경 저활성 기준)',
        description: '교감신경(SNS) 활성도가 이 값 이하이면 "무기력/에너지 부족" 상태로 진단합니다. 낮출수록 무기력 진단 기준이 엄격해집니다.',
        color: 'amber',
        recommended: '권장: 25~35%'
    },
    pnsLow: {
        label: 'PNS Low (부교감신경 저활성 기준)',
        description: '부교감신경(PNS) 활성도가 이 값 이하이면 "회복력 저하/수면 문제"로 진단합니다. 이 값이 높으면 회복력 저하 진단이 많아집니다.',
        color: 'blue',
        recommended: '권장: 25~35%'
    },
    brainScoreLow: {
        label: 'Brain Score Low (두뇌 건강점수 저하 기준)',
        description: '두뇌 건강 점수가 이 값 이하이면 "뇌피로/집중력 저하"로 진단합니다. EEG 측정 시 사용됩니다.',
        color: 'purple',
        recommended: '권장: 65~75점'
    },
    baiHigh: {
        label: 'BAI High (불안 지수 고위험 기준)',
        description: 'Beck 불안 척도(BAI) 점수가 이 값 이상이면 "불안-긴장형"으로 진단합니다. BAI 0-63점 척도 기준입니다.',
        color: 'red',
        recommended: '권장: 경도 10점, 중등도 16점, 고도 26점'
    },
    isiHigh: {
        label: 'ISI High (수면 장애 고위험 기준)',
        description: '불면증 심각도 지수(ISI) 점수가 이 값 이상이면 "수면 장애형"으로 진단합니다. ISI 0-28점 척도 기준입니다.',
        color: 'indigo',
        recommended: '권장: 경도 8점, 중등도 15점, 고도 22점'
    },
    concentrationLow: {
        label: 'Concentration Low (집중력 저하 기준)',
        description: '집중력 설문 점수가 이 값 이하이면 "주의력 산만/집중 곤란"으로 진단합니다. 점수가 높을수록 집중력 저하 진단이 많아집니다.',
        color: 'orange',
        recommended: '권장: 12~16점'
    },
    motivationLow: {
        label: 'Motivation Low (학습 동기 저하 기준)',
        description: '학습 동기 점수(1-5)가 이 값 이하이면 "우울-무동기형"으로 진단합니다. 1=매우낮음, 5=매우높음.',
        color: 'gray',
        recommended: '권장: 2점 이하'
    },
    noiseSensitive: {
        label: 'Noise Sensitive (소음 민감도 기준)',
        description: '학습 환경 소음 레벨(1-10)이 이 값 이상이면 "환경 스트레스"를 가중합니다. 값이 낮을수록 소음에 민감한 것으로 판단합니다.',
        color: 'teal',
        recommended: '권장: 6~8'
    },
    stressHigh: {
        label: 'Stress High (스트레스 과부하 기준)',
        description: '주관적 스트레스 레벨(1-10)이 이 값 이상이면 "스트레스 과부하"로 진단합니다. 값이 낮을수록 스트레스 과부하 진단이 많아집니다.',
        color: 'pink',
        recommended: '권장: 7~8'
    },
    pureStudyLow: {
        label: 'Pure Study Low (순공 비율 저하 기준)',
        description: '순수 학습 시간 비율(%)이 이 값 이하이면 "학습 효율 저하"로 진단합니다. 전체 학습 시간 중 실제 집중한 시간의 비율입니다.',
        color: 'emerald',
        recommended: '권장: 55~65%'
    },
    distractionHigh: {
        label: 'Distraction High (산만도 고위험 기준)',
        description: '시간당 스마트폰 확인 횟수가 이 값 이상이면 "과민성/주의력 산만"으로 진단합니다. 값이 낮을수록 산만도 진단이 엄격해집니다.',
        color: 'yellow',
        recommended: '권장: 5~8회/시간'
    },
    goalLow: {
        label: 'Goal Low (목표 달성률 저하 기준)',
        description: '일일/주간 목표 달성률(%)이 이 값 이하이면 "목표 관리 능력 부족"으로 진단합니다. 값이 높을수록 목표 미달 진단이 많아집니다.',
        color: 'cyan',
        recommended: '권장: 60~75%'
    },
    subjectImbalance: {
        label: 'Subject Imbalance (과목 불균형 기준)',
        description: '특정 과목 학습 비율(%)이 이 값 이상이면 "과목 간 학습 불균형"으로 진단합니다. 한 과목에 과도하게 집중하는 것을 감지합니다.',
        color: 'violet',
        recommended: '권장: 55~65%'
    }
};

const colorMap: Record<string, string> = {
    rose: 'bg-rose-50 border-rose-100 text-rose-800',
    amber: 'bg-amber-50 border-amber-100 text-amber-800',
    blue: 'bg-blue-50 border-blue-100 text-blue-800',
    purple: 'bg-purple-50 border-purple-100 text-purple-800',
    red: 'bg-red-50 border-red-100 text-red-800',
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-800',
    orange: 'bg-orange-50 border-orange-100 text-orange-800',
    gray: 'bg-gray-50 border-gray-200 text-gray-800',
    teal: 'bg-teal-50 border-teal-100 text-teal-800',
    pink: 'bg-pink-50 border-pink-100 text-pink-800',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-800',
    yellow: 'bg-yellow-50 border-yellow-100 text-yellow-800',
    cyan: 'bg-cyan-50 border-cyan-100 text-cyan-800',
    violet: 'bg-violet-50 border-violet-100 text-violet-800'
};

// Module-level variable to persist scroll position across re-renders/remounts
let savedConfigScrollPosition = 0;
let savedThresholdsScroll = 0;
let savedClassificationScroll = 0;
let savedProductRulesScroll = 0;
let savedProductsScroll = 0;
let savedPredictionScroll = 0;

export const ConfigModal: React.FC<ConfigModalProps> = memo(({
    isOpen,
    activeTab,
    onTabChange,
    onClose,
    config,
    onConfigChange,
    strategies,
    onStrategiesChange,
    prescriptions,
    onPrescriptionsChange,
    editingStrategyType,
    onEditingStrategyTypeChange,
    selectedSubjectOptions,
    onSelectedSubjectOptionsChange,
    isAdminUnlocked,
    onViewConsultantManual,
    logicConfig,
    onLogicConfigChange,
    onResetLogicConfig,
    productRecommendations,
    onProductRecommendationsChange,
    onResetProductRecommendations,
    predictionRules,
    onPredictionRulesChange,
    onResetPredictionRules,
    analystStorage,
    onAnalystStorageChange,
    onResetAnalystStorage,
    previousResult,
    aiModels,
    onAiModelsChange
}) => {
    // Scroll area refs to maintain scroll position on re-render
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const thresholdsScrollRef = useRef<HTMLDivElement>(null);
    const classificationScrollRef = useRef<HTMLDivElement>(null);
    const productRulesScrollRef = useRef<HTMLDivElement>(null);
    const productsScrollRef = useRef<HTMLDivElement>(null);
    const predictionScrollRef = useRef<HTMLDivElement>(null);

    // Save scroll position to module-level variable
    const saveScrollPosition = () => {
        if (scrollAreaRef.current) savedConfigScrollPosition = scrollAreaRef.current.scrollTop;
    };
    const saveThresholdsScroll = () => {
        if (thresholdsScrollRef.current) savedThresholdsScroll = thresholdsScrollRef.current.scrollTop;
    };
    const saveClassificationScroll = () => {
        if (classificationScrollRef.current) savedClassificationScroll = classificationScrollRef.current.scrollTop;
    };
    const saveProductRulesScroll = () => {
        if (productRulesScrollRef.current) savedProductRulesScroll = productRulesScrollRef.current.scrollTop;
    };
    const saveProductsScroll = () => {
        if (productsScrollRef.current) savedProductsScroll = productsScrollRef.current.scrollTop;
    };
    const savePredictionScroll = () => {
        if (predictionScrollRef.current) savedPredictionScroll = predictionScrollRef.current.scrollTop;
    };

    // Restore scroll positions after re-render (using module-level variables)
    React.useLayoutEffect(() => {
        if (scrollAreaRef.current && savedConfigScrollPosition > 0) {
            scrollAreaRef.current.scrollTop = savedConfigScrollPosition;
        }
        if (thresholdsScrollRef.current && savedThresholdsScroll > 0) {
            thresholdsScrollRef.current.scrollTop = savedThresholdsScroll;
        }
        if (classificationScrollRef.current && savedClassificationScroll > 0) {
            classificationScrollRef.current.scrollTop = savedClassificationScroll;
        }
        if (productRulesScrollRef.current && savedProductRulesScroll > 0) {
            productRulesScrollRef.current.scrollTop = savedProductRulesScroll;
        }
        if (productsScrollRef.current && savedProductsScroll > 0) {
            productsScrollRef.current.scrollTop = savedProductsScroll;
        }
        if (predictionScrollRef.current && savedPredictionScroll > 0) {
            predictionScrollRef.current.scrollTop = savedPredictionScroll;
        }
    });



    // Prediction Rule Editor State
    const [showRuleEditor, setShowRuleEditor] = React.useState(false);
    const [editingPredictionRule, setEditingPredictionRule] = React.useState<any>(null);

    // Examiner Management State
    const [newExaminerName, setNewExaminerName] = React.useState('');
    const [newExaminerId, setNewExaminerId] = React.useState('');
    const [newExaminerPosition, setNewExaminerPosition] = React.useState('');
    const [newExaminerGender, setNewExaminerGender] = React.useState('');
    const [newExaminerBirthDate, setNewExaminerBirthDate] = React.useState('');
    const [newExaminerRole, setNewExaminerRole] = React.useState('');
    const [newExaminerLicenses, setNewExaminerLicenses] = React.useState(''); // Comma separated

    const [examinerToActivate, setExaminerToActivate] = React.useState<string | null>(null);
    const [examinerToDelete, setExaminerToDelete] = React.useState<string | null>(null);

    const [editingExaminerId, setEditingExaminerId] = React.useState<string | null>(null);
    const [examinerToEdit, setExaminerToEdit] = React.useState<string | null>(null);

    // Auto-calculate age for preview
    const calculateAge = (birthDate: string) => {
        if (!birthDate) return '';
        const today = new Date();
        const birth = new Date(birthDate);
        if (isNaN(birth.getTime())) return '';
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const handleAddExaminer = () => {
        if (!newExaminerName || !newExaminerId) {
            alert("이름과 ID를 모두 입력해주세요.");
            return;
        }
        const currentExaminers = config.examiners || [];
        
        if (editingExaminerId) {
            setExaminerToEdit(editingExaminerId);
            return;
        }

        if (currentExaminers.some(e => e.id === newExaminerId)) {
            alert("이미 존재하는 ID입니다.");
            return;
        }

        const licensesArray = newExaminerLicenses
            .split(',')
            .map(l => l.trim())
            .filter(l => l.length > 0);

        onConfigChange({
            ...config,
            examiners: [...currentExaminers, { 
                id: newExaminerId, 
                name: newExaminerName,
                position: newExaminerPosition || undefined,
                gender: newExaminerGender || undefined,
                birthDate: newExaminerBirthDate || undefined,
                role: newExaminerRole || undefined,
                licenses: licensesArray.length > 0 ? licensesArray : undefined
            }],
        });
        resetExaminerForm();
    };

    const resetExaminerForm = () => {
        setEditingExaminerId(null);
        setNewExaminerName('');
        setNewExaminerId('');
        setNewExaminerPosition('');
        setNewExaminerGender('');
        setNewExaminerBirthDate('');
        setNewExaminerRole('');
        setNewExaminerLicenses('');
    };

    if (!isOpen) return null;

    // Logic Engine Tab Content
    const renderLogicEngineTab = () => {
        if (!logicConfig || !onLogicConfigChange) {
            return (
                <div className="text-center py-8 text-slate-500">
                    <p>로직 엔진 설정이 로드되지 않았습니다.</p>
                </div>
            );
        }

        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-rose-50 to-orange-50 p-4 rounded-xl border border-rose-100">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">🔧</span>
                        <div>
                            <h3 className="font-bold text-rose-900">로직 엔진 설정</h3>
                            <p className="text-xs text-rose-600 mt-1">
                                학생 진단 및 추천 결과를 결정하는 핵심 규칙을 설정합니다.
                            </p>
                            <p className="text-[10px] text-rose-400 mt-2">
                                버전: {logicConfig.version} | 마지막 수정: {new Date(logicConfig.lastModified).toLocaleString('ko-KR')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Thresholds Section with Descriptions */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-100 px-4 py-2 border-b">
                        <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                            <span>📊</span> 임계값 설정 (Thresholds)
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-1">
                            💡 각 설정값은 학생 진단 시 사용되는 기준치입니다. 값을 높이면 해당 조건이 더 엄격해지고, 낮추면 느슨해집니다.
                        </p>
                    </div>
                    <div ref={thresholdsScrollRef} onScroll={saveThresholdsScroll} className="p-4 space-y-3 max-h-96 overflow-y-auto">
                        {Object.entries(logicConfig.thresholds).map(([key, value]) => {
                            const info = THRESHOLD_DESCRIPTIONS[key];
                            const colorClasses = info ? colorMap[info.color] : 'bg-slate-50 border-slate-200 text-slate-800';

                            return (
                                <div key={key} className={`p-3 rounded-lg border ${colorClasses}`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <label className="text-sm font-bold">
                                                {info?.label || key}
                                            </label>
                                            <p className="text-[11px] mt-0.5 opacity-80">
                                                {info?.description || '설명 없음'}
                                            </p>
                                            <p className="text-[10px] mt-1 font-medium opacity-70">
                                                {info?.recommended || ''}
                                            </p>
                                        </div>
                                        <input
                                            type="number"
                                            value={value}
                                            onChange={(e) => {
                                                const newThresholds = {
                                                    ...logicConfig.thresholds,
                                                    [key]: Number(e.target.value)
                                                };
                                                onLogicConfigChange({
                                                    ...logicConfig,
                                                    thresholds: newThresholds as LogicThresholds
                                                });
                                            }}
                                            className="w-20 px-2 py-1 text-sm border rounded text-right font-mono bg-white"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Classification Rules */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-100 px-4 py-2 border-b">
                        <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                            <span>🏷️</span> 진단 분류 규칙 ({logicConfig.classificationRules.filter(r => r.enabled).length}/{logicConfig.classificationRules.length} 활성)
                        </h4>
                    </div>
                    <div ref={classificationScrollRef} onScroll={saveClassificationScroll} className="p-4 space-y-2 max-h-60 overflow-y-auto">
                        {logicConfig.classificationRules.map((rule, idx) => (
                            <div key={rule.id} className={`flex items-center justify-between p-3 rounded-lg border ${rule.enabled ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={rule.enabled}
                                        onChange={(e) => {
                                            const updated = [...logicConfig.classificationRules];
                                            updated[idx] = { ...updated[idx], enabled: e.target.checked };
                                            onLogicConfigChange({ ...logicConfig, classificationRules: updated });
                                        }}
                                        className="w-4 h-4 accent-rose-600"
                                    />
                                    <div>
                                        <p className="font-bold text-sm text-slate-800">{rule.nameKr}</p>
                                        <p className="text-[10px] text-slate-400">
                                            우선순위: {rule.priority} | 조건 {rule.conditions.length}개 ({rule.combinator})
                                        </p>
                                    </div>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded ${rule.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {rule.enabled ? '활성' : '비활성'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Product Rules */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-100 px-4 py-2 border-b">
                        <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                            <span>💊</span> 제품 추천 규칙 ({logicConfig.productRules.filter(r => r.enabled).length}/{logicConfig.productRules.length} 활성)
                        </h4>
                    </div>
                    <div ref={productRulesScrollRef} onScroll={saveProductRulesScroll} className="p-4 space-y-2 max-h-60 overflow-y-auto">
                        {logicConfig.productRules.map((rule, idx) => (
                            <div key={rule.id} className={`flex items-center justify-between p-3 rounded-lg border ${rule.enabled ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={rule.enabled}
                                        onChange={(e) => {
                                            const updated = [...logicConfig.productRules];
                                            updated[idx] = { ...updated[idx], enabled: e.target.checked };
                                            onLogicConfigChange({ ...logicConfig, productRules: updated });
                                        }}
                                        className="w-4 h-4 accent-emerald-600"
                                    />
                                    <div>
                                        <p className="font-bold text-sm text-slate-800">{rule.productName}</p>
                                        <p className="text-[10px] text-slate-400">
                                            조건 {rule.conditions.length}개 ({rule.combinator})
                                        </p>
                                    </div>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded ${rule.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {rule.enabled ? '활성' : '비활성'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reset Button */}
                {onResetLogicConfig && (
                    <button
                        onClick={onResetLogicConfig}
                        className="w-full py-2 text-sm text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-50 transition"
                    >
                        🔄 기본값으로 초기화
                    </button>
                )}
            </div>
        );
    };

    // Products Tab Content
    const renderProductsTab = () => {
        if (!productRecommendations || !onProductRecommendationsChange) {
            return (
                <div className="text-center py-8 text-slate-500">
                    <p>제품 추천 설정이 로드되지 않았습니다.</p>
                </div>
            );
        }

        const productList = Object.entries(PRODUCTS);

        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">🛍️</span>
                        <div>
                            <h3 className="font-bold text-emerald-900">PNT Mall 제품 추천 설정</h3>
                            <p className="text-xs text-emerald-600 mt-1">
                                종합분석 진단 유형별로 추천할 제품을 설정합니다.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CareType Selector */}
                <div className="flex items-center gap-2">
                    <label className="text-sm font-bold text-slate-500">진단 유형:</label>
                    <select
                        value={editingStrategyType}
                        onChange={(e) => onEditingStrategyTypeChange(e.target.value as CareType)}
                        className="flex-1 p-2 border rounded-lg text-sm font-bold text-slate-800 bg-white"
                    >
                        {Object.values(CareType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                {/* Product Selection */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-100 px-4 py-2 border-b">
                        <h4 className="font-bold text-slate-700 text-sm">
                            추천 제품 선택 ({productRecommendations[editingStrategyType]?.length || 0}개 선택됨)
                        </h4>
                    </div>
                    <div ref={productsScrollRef} onScroll={saveProductsScroll} className="p-4 space-y-3 max-h-80 overflow-y-auto">
                        {productList.map(([productId, product]) => {
                            const isSelected = productRecommendations[editingStrategyType]?.includes(productId);
                            return (
                                <label
                                    key={productId}
                                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                                        ? 'bg-emerald-50 border-emerald-200'
                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                            const current = productRecommendations[editingStrategyType] || [];
                                            const updated = e.target.checked
                                                ? [...current, productId]
                                                : current.filter(id => id !== productId);
                                            onProductRecommendationsChange({
                                                ...productRecommendations,
                                                [editingStrategyType]: updated
                                            });
                                        }}
                                        className="mt-1 w-5 h-5 accent-emerald-600"
                                    />
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-800 text-sm">{product.name}</p>
                                        <p className="text-xs text-slate-500">{product.subName}</p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {product.tags.map(tag => (
                                                <span key={tag} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Reset Button */}
                {onResetProductRecommendations && (
                    <button
                        onClick={onResetProductRecommendations}
                        className="w-full py-2 text-sm text-emerald-600 border border-emerald-200 rounded-xl hover:bg-emerald-50 transition"
                    >
                        🔄 기본값으로 초기화
                    </button>
                )}
            </div>
        );
    };

    // Prediction Rules Tab Content
    const renderPredictionTab = () => {
        if (!predictionRules || !onPredictionRulesChange) {
            return (
                <div className="text-center py-8 text-slate-500">
                    <p>예측 규칙 설정이 로드되지 않았습니다.</p>
                </div>
            );
        }

        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-4 rounded-xl border border-violet-100">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">📊</span>
                        <div>
                            <h3 className="font-bold text-violet-900">위험 예측 규칙 설정</h3>
                            <p className="text-xs text-violet-600 mt-1">
                                학생의 미래 위험을 예측하는 규칙을 활성화/비활성화합니다.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Rules List */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-100 px-4 py-2 border-b">
                        <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                            <span>⚠️</span> 예측 규칙 ({predictionRules.filter(r => r.enabled).length}/{predictionRules.length} 활성)
                        </h4>
                    </div>
                    <div ref={predictionScrollRef} onScroll={savePredictionScroll} className="p-4 space-y-2 max-h-96 overflow-y-auto">
                        {predictionRules.map((rule, idx) => (
                            <div key={rule.id} className={`flex items-center justify-between p-3 rounded-lg border ${rule.enabled ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'
                                }`}>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={rule.enabled}
                                        onChange={(e) => {
                                            const updated = [...predictionRules];
                                            updated[idx] = { ...updated[idx], enabled: e.target.checked };
                                            onPredictionRulesChange(updated);
                                        }}
                                        className="w-4 h-4 accent-violet-600"
                                    />
                                    <div>
                                        <p className="font-bold text-sm text-slate-800">{rule.nameKr}</p>
                                        <p className="text-[10px] text-slate-400">
                                            {rule.trendRequired ? '📈 추세 기반' : '📊 단일 데이터'} |
                                            확률: {rule.prediction.probability}% |
                                            심각도: {rule.prediction.severity}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] px-2 py-0.5 rounded ${rule.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                        {rule.enabled ? '활성' : '비활성'}
                                    </span>
                                    <button
                                        onClick={() => {
                                            setEditingPredictionRule(rule);
                                            setShowRuleEditor(true);
                                        }}
                                        className="p-1.5 hover:bg-indigo-100 rounded text-indigo-600 transition"
                                        title="규칙 편집"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm(`"${rule.nameKr || rule.name}" 규칙을 삭제하시겠습니까?`)) {
                                                const updated = (predictionRules || []).filter((r: any) => r.id !== rule.id);
                                                onPredictionRulesChange?.(updated);
                                            }
                                        }}
                                        className="p-1.5 hover:bg-red-100 rounded text-red-600 transition"
                                        title="규칙 삭제"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Add Custom Rule Button */}
                <button
                    onClick={() => {
                        setEditingPredictionRule(null);
                        setShowRuleEditor(true);
                    }}
                    className="w-full py-3 text-sm bg-violet-100 text-violet-700 border border-violet-200 rounded-xl hover:bg-violet-200 transition font-bold"
                >
                    ➕ 새 커스텀 규칙 생성
                </button>

                {/* Reset Button */}
                {onResetPredictionRules && (
                    <button
                        onClick={onResetPredictionRules}
                        className="w-full py-2 text-sm text-violet-600 border border-violet-200 rounded-xl hover:bg-violet-50 transition"
                    >
                        🔄 기본값으로 초기화
                    </button>
                )}

                {/* Prediction Rule Editor Modal */}
                {showRuleEditor && onPredictionRulesChange && (
                    <PredictionRuleEditor
                        isOpen={showRuleEditor}
                        onClose={() => setShowRuleEditor(false)}
                        editingRule={editingPredictionRule}
                        onSave={(newRule) => {
                            const updated = editingPredictionRule
                                ? predictionRules.map(r => r.id === editingPredictionRule.id ? newRule : r)
                                : [...predictionRules, newRule];
                            onPredictionRulesChange(updated);
                        }}
                    />
                )}
            </div>
        );
    };

    // AI Model Tab Content
    const renderAiModelTab = () => {
        if (!aiModels || !onAiModelsChange) {
            return (
                <div className="text-center py-8 text-slate-500">
                    <p>AI 모델 설정이 로드되지 않았습니다.</p>
                </div>
            );
        }

        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">🤖</span>
                        <div>
                            <h3 className="font-bold text-blue-900">AI 모델 및 API 설정</h3>
                            <p className="text-xs text-blue-600 mt-1">
                                시스템에 연동할 AI 모델의 API Key 및 Local Endpoint를 설정합니다.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="p-4 border rounded-xl bg-white shadow-sm">
                        <label className="text-sm font-bold text-slate-800 block mb-2 flex items-center gap-2">
                            <span className="text-lg">✨</span> Gemini 3.5 Flash API Key
                        </label>
                        <input
                            type="password"
                            placeholder="AIzaSy..."
                            value={aiModels.geminiKey || ''}
                            onChange={(e) => onAiModelsChange({ ...aiModels, geminiKey: e.target.value })}
                            className="w-full p-3 border rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 ring-blue-100 outline-none font-mono"
                        />
                        <p className="text-[10px] text-slate-400 mt-2">구글 AI Studio에서 발급받은 API 키를 입력하세요.</p>
                    </div>

                    <div className="p-4 border rounded-xl bg-white shadow-sm">
                        <label className="text-sm font-bold text-slate-800 block mb-2 flex items-center gap-2">
                            <span className="text-lg">🧠</span> Claude Sonnet API Key
                        </label>
                        <input
                            type="password"
                            placeholder="sk-ant-..."
                            value={aiModels.sonnetKey || ''}
                            onChange={(e) => onAiModelsChange({ ...aiModels, sonnetKey: e.target.value })}
                            className="w-full p-3 border rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 ring-indigo-100 outline-none font-mono"
                        />
                        <p className="text-[10px] text-slate-400 mt-2">Anthropic Console에서 발급받은 API 키를 입력하세요.</p>
                    </div>

                    <div className="p-4 border rounded-xl bg-white shadow-sm">
                        <label className="text-sm font-bold text-slate-800 block mb-3 flex items-center gap-2">
                            <span className="text-lg">💻</span> Local AI Model 설정 (Ollama 등)
                        </label>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">PC VRAM 용량 선택</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {['4GB', '8GB', '12GB', '16GB', '32GB'].map(vram => (
                                        <button
                                            key={vram}
                                            onClick={() => {
                                                let modelName = '';
                                                if (vram === '4GB') modelName = 'Phi-3.5 Mini (3.8B)';
                                                if (vram === '8GB') modelName = 'Llama 3.1 8B';
                                                if (vram === '12GB') modelName = 'Gemma 4 12B';
                                                if (vram === '16GB') modelName = 'Qwen 2.5 14B';
                                                if (vram === '32GB') modelName = 'Qwen 2.5 32B';
                                                
                                                onAiModelsChange({ 
                                                    ...aiModels, 
                                                    localModelVram: vram,
                                                    localModelName: modelName
                                                });
                                            }}
                                            className={`p-2 text-sm font-bold rounded-lg border transition-all ${
                                                aiModels.localModelVram === vram 
                                                    ? 'bg-blue-50 border-blue-600 text-blue-700' 
                                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            {vram}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {aiModels.localModelVram && (
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <h4 className="text-sm font-bold text-slate-800 mb-2">추천 로컬 모델 (2026년 기준)</h4>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs text-left">
                                            <thead>
                                                <tr className="border-b text-slate-500">
                                                    <th className="pb-1">추천 모델</th>
                                                    <th className="pb-1">양자화</th>
                                                    <th className="pb-1">파라미터</th>
                                                    <th className="pb-1">특징</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-slate-700">
                                                {aiModels.localModelVram === '4GB' && (
                                                    <tr>
                                                        <td className="py-2 font-bold text-blue-700">Phi-3.5 Mini</td>
                                                        <td>Q4_K_M</td>
                                                        <td>3.8B</td>
                                                        <td>Microsoft 경량 모델, 한국어 지원, 빠른 응답</td>
                                                    </tr>
                                                )}
                                                {aiModels.localModelVram === '8GB' && (
                                                    <tr>
                                                        <td className="py-2 font-bold text-blue-700">Llama 3.1 8B</td>
                                                        <td>Q4_K_M</td>
                                                        <td>8B</td>
                                                        <td>Meta 최신, 다국어 우수, 균형잡힌 성능</td>
                                                    </tr>
                                                )}
                                                {aiModels.localModelVram === '12GB' && (
                                                    <tr>
                                                        <td className="py-2 font-bold text-blue-700">Gemma 4 12B</td>
                                                        <td>Q4_K_M</td>
                                                        <td>12B</td>
                                                        <td>Google 최신, 보안/개인정보 보호 및 논리적 추론 탁월</td>
                                                    </tr>
                                                )}
                                                {aiModels.localModelVram === '16GB' && (
                                                    <tr>
                                                        <td className="py-2 font-bold text-blue-700">Qwen 2.5 14B</td>
                                                        <td>Q4_K_M</td>
                                                        <td>14B</td>
                                                        <td>알리바바, 한국어 성능 최상급, 코딩/분석 강점</td>
                                                    </tr>
                                                )}
                                                {aiModels.localModelVram === '32GB' && (
                                                    <tr>
                                                        <td className="py-2 font-bold text-blue-700">Qwen 2.5 32B</td>
                                                        <td>Q4_K_M</td>
                                                        <td>32B</td>
                                                        <td>GPT-4급 성능, 복잡한 추론/의료 분석 가능</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-3 bg-slate-800 text-green-400 p-2 rounded text-xs font-mono">
                                        $ ollama pull {
                                            aiModels.localModelVram === '4GB' ? 'phi3.5' :
                                            aiModels.localModelVram === '8GB' ? 'llama3.1:8b' :
                                            aiModels.localModelVram === '12GB' ? 'gemma4:12b' :
                                            aiModels.localModelVram === '16GB' ? 'qwen2.5:14b' :
                                            'qwen2.5:32b'
                                        }
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Local Endpoint URL</label>
                                <input
                                    type="text"
                                    placeholder="http://localhost:11434/api/generate"
                                    value={aiModels.localModelUrl || ''}
                                    onChange={(e) => onAiModelsChange({ ...aiModels, localModelUrl: e.target.value })}
                                    className="w-full p-3 border rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 ring-slate-200 outline-none font-mono"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">Ollama 등 로컬 구동 모델의 Endpoint URL을 입력하세요.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex gap-4 flex-wrap">
                        <button onClick={() => onTabChange('general')} className={`text-sm font-bold pb-1 border-b-2 transition-colors ${activeTab === 'general' ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-400'}`}>General</button>
                        <button onClick={() => onTabChange('strategy')} className={`text-sm font-bold pb-1 border-b-2 transition-colors ${activeTab === 'strategy' ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-400'}`}>Type Strategy</button>
                        <button onClick={() => onTabChange('prescriptions')} className={`text-sm font-bold pb-1 border-b-2 transition-colors ${activeTab === 'prescriptions' ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-400'}`}>Prescriptions</button>
                        {isAdminUnlocked && (
                            <>
                                <button onClick={() => onTabChange('subject')} className={`text-sm font-bold pb-1 border-b-2 transition-colors ${activeTab === 'subject' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>Subject Strategy</button>
                                <button onClick={() => onTabChange('logic')} className={`text-sm font-bold pb-1 border-b-2 transition-colors ${activeTab === 'logic' ? 'border-rose-600 text-rose-600' : 'border-transparent text-slate-400'}`}>🔧 Logic Engine</button>
                                <button onClick={() => onTabChange('products')} className={`text-sm font-bold pb-1 border-b-2 transition-colors ${activeTab === 'products' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400'}`}>🛍️ Products</button>
                                <button onClick={() => onTabChange('prediction')} className={`text-sm font-bold pb-1 border-b-2 transition-colors ${activeTab === 'prediction' ? 'border-violet-600 text-violet-600' : 'border-transparent text-slate-400'}`}>📊 Prediction</button>
                                <button onClick={() => onTabChange('manuals')} className={`text-sm font-bold pb-1 border-b-2 transition-colors ${activeTab === 'manuals' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>📚 Manuals</button>
                                <button onClick={() => onTabChange('aimodel')} className={`text-sm font-bold pb-1 border-b-2 transition-colors ${activeTab === 'aimodel' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-400'}`}>🤖 AI Model</button>
                                <div className="w-px h-4 bg-slate-200 self-center mx-2"></div>
                                <button onClick={() => onTabChange('patent')} className={`text-sm font-bold pb-1 border-b-2 transition-colors ${activeTab === 'patent' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400'}`}>📜 특허 분석</button>
                            </>
                        )}
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                <div ref={scrollAreaRef} onScroll={saveScrollPosition} className="p-6 overflow-y-auto custom-scrollbar">
                    {activeTab === 'general' ? (
                        <div className="space-y-4">
                            {/* Current Mode Status Banner */}
                            <div className="bg-slate-900 text-white p-6 rounded-2xl mb-6 shadow-lg">
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Current Operation Mode</h4>
                                <div className="flex items-center gap-4">
                                    <div className={`text-4xl ${config.isMedicalMode ? 'grayscale-0' : 'grayscale text-slate-700'}`}>🩸</div>
                                    <div className={`text-4xl ${config.usePortable ? 'grayscale-0' : 'grayscale text-slate-700'}`}>📱</div>
                                    <div className={`text-4xl ${config.useBrainBody !== false ? 'grayscale-0' : 'grayscale text-slate-700'}`}>🧠</div>
                                    <div className="h-12 w-px bg-slate-700 mx-2"></div>
                                    <div>
                                        <h3 className="text-xl font-black text-white">
                                            {config.isMedicalMode ? 'Medical Expert Mode' : config.usePortable ? 'Portable Lite Mode' : 'Standard Clinical Mode'}
                                        </h3>
                                        <p className="text-sm text-slate-400 font-medium mt-1">
                                            {config.isMedicalMode ? '의학적 정밀 분석 및 혈액검사 연동' : config.usePortable ? '보급형 장비(uBioMacpa) 기반 간편 측정' : '뇌파(EEG) - 심박변이도(HRV) 정밀 통합 분석'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <label className="flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:bg-slate-50">
                                <div className="space-y-1">
                                    <p className="font-bold text-slate-900">시험대비 모드 (Exam Mode)</p>
                                    <p className="text-xs text-slate-500">리포트에 시험 전략 및 시험대비 코멘트 포함</p>
                                </div>
                                <input type="checkbox" checked={config.isExamMode} onChange={e => onConfigChange({ ...config, isExamMode: e.target.checked })} className="toggle accent-blue-600 w-5 h-5" />
                            </label>
                            <label className="flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:bg-slate-50">
                                <div className="space-y-1">
                                    <p className="font-bold text-slate-900">상세 설명 모드 (Verbose)</p>
                                    <p className="text-xs text-slate-500">분석 텍스트 길이 및 문구 언어 설명 강화</p>
                                </div>
                                <input type="checkbox" checked={config.showDetail} onChange={e => onConfigChange({ ...config, showDetail: e.target.checked })} className="toggle accent-blue-600 w-5 h-5" />
                            </label>
                            <label className="flex items-center justify-between p-4 border border-rose-200 rounded-xl cursor-pointer hover:bg-rose-50 bg-rose-50/50">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">🩸</span>
                                        <p className="font-bold text-rose-800">의학전문가용 모드 (Medical Expert)</p>
                                    </div>
                                    <p className="text-xs text-rose-600">혈액검사 결과 입력 및 기존 검사와 Cross-Matching 분석</p>
                                </div>
                                <input type="checkbox" checked={config.isMedicalMode} onChange={e => onConfigChange({ ...config, isMedicalMode: e.target.checked })} className="toggle accent-rose-600 w-5 h-5" />
                            </label>

                            {/* Device Configuration */}
                            <div className="border rounded-xl overflow-hidden mt-4">
                                <div className="bg-slate-100 px-4 py-2 border-b">
                                    <h4 className="font-bold text-slate-700 text-sm">측정 장비 설정</h4>
                                </div>
                                <div className="divide-y">
                                    <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50">
                                        <div className="space-y-1">
                                            <p className="font-bold text-slate-900">BrainBody (HRV+EEG)</p>
                                            <p className="text-xs text-slate-500">전문 장비를 사용하여 정밀 HRV 및 뇌파(EEG) 측정</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={config.useBrainBody !== false}
                                            onChange={e => onConfigChange({ ...config, useBrainBody: e.target.checked })}
                                            className="toggle accent-indigo-600 w-5 h-5"
                                        />
                                    </label>
                                    <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50">
                                        <div className="space-y-1">
                                            <p className="font-bold text-slate-900">Portable (uBioMacpa)</p>
                                            <p className="text-xs text-slate-500">보급형 장비를 사용하여 기본 맥파/스트레스 측정</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={config.usePortable === true}
                                            onChange={e => onConfigChange({ ...config, usePortable: e.target.checked })}
                                            className="toggle accent-indigo-600 w-5 h-5"
                                        />
                                    </label>
                                </div>
                            <div className="border rounded-xl overflow-hidden mt-4">
                                <div className="bg-slate-100 px-4 py-2 border-b">
                                    <h4 className="font-bold text-slate-700 text-sm">보안 설정</h4>
                                </div>
                                <div className="p-4">
                                    <label className="block mb-2 font-bold text-slate-900 text-sm">전문가용 진입 암호</label>
                                    <input
                                        type="text"
                                        value={config.expertModePassword || ''}
                                        onChange={e => onConfigChange({ ...config, expertModePassword: e.target.value })}
                                        className="w-full p-2 border rounded-lg"
                                        placeholder="암호를 입력하세요 (예: 3123)"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">결과 화면에서 '전문가용' 모드를 선택할 때 요구되는 암호입니다.</p>
                                </div>
                            </div>

                            <div className="border rounded-xl overflow-hidden mt-4">
                                <div className="bg-slate-100 px-4 py-2 border-b flex justify-between items-center">
                                    <h4 className="font-bold text-slate-700 text-sm">검사자 관리 (Examiners)</h4>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">현재 검사자 선택 (활성화 시 암호 필요)</label>
                                        <div className="flex flex-wrap gap-2">
                                            <button 
                                                onClick={() => onConfigChange({...config, currentExaminerId: null})}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors ${!config.currentExaminerId ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                            >선택 안함</button>
                                            {config.examiners?.map(ex => (
                                                <div key={ex.id} className={`flex items-stretch rounded-lg border overflow-hidden transition-colors ${config.currentExaminerId === ex.id ? 'border-blue-500' : 'border-slate-200'}`}>
                                                    <button 
                                                        onClick={() => {
                                                            if (config.currentExaminerId !== ex.id) {
                                                                setExaminerToActivate(ex.id);
                                                            }
                                                        }}
                                                        className={`px-3 py-1.5 text-sm font-bold ${config.currentExaminerId === ex.id ? 'bg-blue-100 text-blue-700' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                                                    >
                                                        {ex.name} ({ex.id})
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            setEditingExaminerId(ex.id);
                                                            setNewExaminerName(ex.name);
                                                            setNewExaminerId(ex.id);
                                                            setNewExaminerPosition(ex.position || '');
                                                            setNewExaminerGender(ex.gender || '');
                                                            setNewExaminerBirthDate(ex.birthDate || '');
                                                            setNewExaminerRole(ex.role || '');
                                                            setNewExaminerLicenses((ex.licenses || []).join(', '));
                                                        }}
                                                        className={`px-2 flex items-center justify-center transition-colors bg-white text-slate-400 hover:text-blue-600 hover:bg-blue-50 border-l border-slate-200`}
                                                        title="검사자 편집"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button 
                                                        onClick={() => setExaminerToDelete(ex.id)}
                                                        className={`px-2 flex items-center justify-center transition-colors ${config.currentExaminerId === ex.id ? 'bg-blue-100 text-blue-400 hover:text-blue-700 hover:bg-blue-200' : 'bg-white text-slate-400 hover:text-red-600 hover:bg-red-50'} border-l border-slate-200`}
                                                        title="검사자 삭제"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-slate-100">
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">새 검사자 등록</label>
                                        <div className="space-y-3">
                                            <div className="flex gap-2">
                                                <input type="text" placeholder="이름* (예: Ph Lim)" value={newExaminerName} onChange={e => setNewExaminerName(e.target.value)} className="flex-1 p-2 border rounded-lg text-sm" />
                                                <input type="text" placeholder="ID* (예: lim123)" value={newExaminerId} onChange={e => setNewExaminerId(e.target.value)} className="flex-1 p-2 border rounded-lg text-sm" />
                                            </div>
                                            <div className="flex gap-2">
                                                <input type="text" placeholder="직책 (예: 수석연구원)" value={newExaminerPosition} onChange={e => setNewExaminerPosition(e.target.value)} className="flex-1 p-2 border rounded-lg text-sm" />
                                                <select value={newExaminerGender} onChange={e => setNewExaminerGender(e.target.value)} className="flex-1 p-2 border rounded-lg text-sm text-slate-600">
                                                    <option value="">성별 선택</option>
                                                    <option value="Male">남성 (Male)</option>
                                                    <option value="Female">여성 (Female)</option>
                                                </select>
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                <input type="date" placeholder="생년월일" value={newExaminerBirthDate} onChange={e => setNewExaminerBirthDate(e.target.value)} className="flex-1 p-2 border rounded-lg text-sm" title="생년월일" />
                                                <div className="flex-1 text-sm text-slate-500 pl-2">
                                                    {newExaminerBirthDate ? `나이: 만 ${calculateAge(newExaminerBirthDate)}세` : '생년월일을 입력하면 나이가 자동 계산됩니다.'}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <input type="text" placeholder="담당업무 (예: 종합 심리 평가)" value={newExaminerRole} onChange={e => setNewExaminerRole(e.target.value)} className="flex-1 p-2 border rounded-lg text-sm" />
                                            </div>
                                            <div className="flex gap-2">
                                                <input type="text" placeholder="자격/면허 번호 (쉼표로 구분하여 여러 개 입력 가능)" value={newExaminerLicenses} onChange={e => setNewExaminerLicenses(e.target.value)} className="flex-[3] p-2 border rounded-lg text-sm" />
                                                <button onClick={handleAddExaminer} className={`flex-1 ${editingExaminerId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded-lg font-bold text-sm`}>
                                                    {editingExaminerId ? '수정' : '등록'}
                                                </button>
                                                {editingExaminerId && (
                                                    <button onClick={resetExaminerForm} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm">
                                                        취소
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Prompt Modal for Examiner Activation */}
                        <PromptModal
                            isOpen={examinerToActivate !== null}
                            title="검사자 활성화 암호 입력"
                            isPassword={true}
                            onConfirm={(pwd) => {
                                if (pwd === 'dlatmdeo7') {
                                    onConfigChange({...config, currentExaminerId: examinerToActivate});
                                } else {
                                    alert("암호가 일치하지 않습니다.");
                                }
                                setExaminerToActivate(null);
                            }}
                            onCancel={() => setExaminerToActivate(null)}
                        />

                        {/* Prompt Modal for Examiner Deletion */}
                        <PromptModal
                            isOpen={examinerToDelete !== null}
                            title="검사자 삭제 암호 입력"
                            isPassword={true}
                            onConfirm={(pwd) => {
                                if (pwd === 'dlatmdeo7') {
                                    const currentExaminers = config.examiners || [];
                                    const nextExaminers = currentExaminers.filter(e => e.id !== examinerToDelete);
                                    let nextCurrentId = config.currentExaminerId;
                                    if (nextCurrentId === examinerToDelete) {
                                        nextCurrentId = null;
                                    }
                                    onConfigChange({
                                        ...config,
                                        examiners: nextExaminers,
                                        currentExaminerId: nextCurrentId
                                    });
                                } else {
                                    alert("암호가 일치하지 않습니다.");
                                }
                                setExaminerToDelete(null);
                            }}
                            onCancel={() => setExaminerToDelete(null)}
                        />

                            {analystStorage && onAnalystStorageChange && onResetAnalystStorage && (
                                <div className="mt-4">
                                    <AnalystSettings
                                        storage={analystStorage}
                                        onChange={onAnalystStorageChange}
                                        onReset={onResetAnalystStorage}
                                    />
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'subject' ? (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="bg-indigo-50 p-4 rounded-xl text-indigo-900 text-sm mb-4">
                                <strong>관리자 모드 (Admin)</strong>: 학생에게 적용할 과목별 학습 전략을 체크하십시오.
                            </div>
                            {(['korean', 'math', 'english'] as const).map(subj => {
                                const options = SUBJECT_OPTIONS_MAP[subj] || [];
                                const categories = Array.from(new Set(options.map(o => o.category)));

                                return (
                                    <div key={subj} className="border-b border-slate-100 pb-6 mb-6 last:border-0 last:mb-0">
                                        <h4 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                                            <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
                                            {subj === 'korean' ? '국어 (Korean)' : subj === 'math' ? '수학 (Math)' : '영어 (English)'}
                                        </h4>
                                        <div className="space-y-6">
                                            {categories.map(cat => (
                                                <div key={cat}>
                                                    <h5 className="text-xs font-bold text-slate-400 uppercase mb-3">{cat}</h5>
                                                    <div className="space-y-3">
                                                        {options.filter(o => o.category === cat).map(option => (
                                                            <label key={option.id} className={`flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all ${previousResult?.selectedSubjectOptions?.[subj]?.includes(option.id) ? 'bg-blue-50/30' : ''}`}>
                                                                <input
                                                                    type="checkbox"
                                                                    className="mt-1 w-5 h-5 accent-indigo-600"
                                                                    checked={selectedSubjectOptions[subj]?.includes(option.id)}
                                                                    onChange={e => {
                                                                        const current = selectedSubjectOptions[subj] || [];
                                                                        const next = e.target.checked
                                                                            ? [...current, option.id]
                                                                            : current.filter(id => id !== option.id);
                                                                        onSelectedSubjectOptionsChange({ ...selectedSubjectOptions, [subj]: next });
                                                                    }}
                                                                />
                                                                <div>
                                                                    <p className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                                                        {option.title}
                                                                        {previousResult?.selectedSubjectOptions?.[subj]?.includes(option.id) && (
                                                                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-md">이전 처방</span>
                                                                        )}
                                                                    </p>
                                                                    <p className="text-xs text-slate-500 mt-0.5">{option.content}</p>
                                                                </div>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : activeTab === 'prescriptions' ? (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-bold text-slate-500">CareType (Prescription):</label>
                                <select
                                    value={editingStrategyType}
                                    onChange={(e) => onEditingStrategyTypeChange(e.target.value as CareType)}
                                    className="p-2 border rounded-lg text-sm font-bold text-slate-800 bg-white"
                                >
                                    {Object.values(CareType).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Prescription Title</label>
                                    <input
                                        className="w-full p-3 text-sm border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-indigo-100 outline-none"
                                        value={prescriptions[editingStrategyType]?.title || ''}
                                        onChange={e => onPrescriptionsChange({
                                            ...prescriptions,
                                            [editingStrategyType]: { ...prescriptions[editingStrategyType], title: e.target.value }
                                        })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Prescription Activity</label>
                                    <input
                                        className="w-full p-3 text-sm border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-indigo-100 outline-none"
                                        value={prescriptions[editingStrategyType]?.activity || ''}
                                        onChange={e => onPrescriptionsChange({
                                            ...prescriptions,
                                            [editingStrategyType]: { ...prescriptions[editingStrategyType], activity: e.target.value }
                                        })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Guide Steps (One per line)</label>
                                    <textarea
                                        className="w-full h-32 p-3 text-sm border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-indigo-100 outline-none resize-none"
                                        value={prescriptions[editingStrategyType]?.guide?.join('\n') || ''}
                                        onChange={e => onPrescriptionsChange({
                                            ...prescriptions,
                                            [editingStrategyType]: { ...prescriptions[editingStrategyType], guide: e.target.value.split('\n') }
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'logic' ? (
                        renderLogicEngineTab()
                    ) : activeTab === 'products' ? (
                        renderProductsTab()
                    ) : activeTab === 'prediction' ? (
                        renderPredictionTab()
                    ) : activeTab === 'manuals' ? (
                        <div className="h-[600px] -m-6 rounded-b-2xl overflow-hidden bg-slate-50">
                            <ManualManager />
                        </div>
                    ) : activeTab === 'aimodel' ? (
                        renderAiModelTab()
                    ) : activeTab === 'patent' ? (
                        <PatentAnalysis />
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-bold text-slate-500">CareType (Strategy):</label>
                                <select
                                    value={editingStrategyType}
                                    onChange={(e) => onEditingStrategyTypeChange(e.target.value as CareType)}
                                    className="p-2 border rounded-lg text-sm font-bold text-slate-800 bg-white"
                                >
                                    {Object.values(CareType).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Nutrition Guide</label>
                                    <textarea
                                        className="w-full h-24 p-3 text-sm border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-blue-100 outline-none resize-none"
                                        value={strategies[editingStrategyType]?.nutritionGuide || ''}
                                        onChange={e => onStrategiesChange({
                                            ...strategies,
                                            [editingStrategyType]: { ...strategies[editingStrategyType], nutritionGuide: e.target.value }
                                        })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Study Strategy</label>
                                    <textarea
                                        className="w-full h-24 p-3 text-sm border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-blue-100 outline-none resize-none"
                                        value={strategies[editingStrategyType]?.studyStrategy || ''}
                                        onChange={e => onStrategiesChange({
                                            ...strategies,
                                            [editingStrategyType]: { ...strategies[editingStrategyType], studyStrategy: e.target.value }
                                        })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Exercise Guide</label>
                                    <textarea
                                        className="w-full h-24 p-3 text-sm border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-blue-100 outline-none resize-none"
                                        value={strategies[editingStrategyType]?.exerciseGuide || ''}
                                        onChange={e => onStrategiesChange({
                                            ...strategies,
                                            [editingStrategyType]: { ...strategies[editingStrategyType], exerciseGuide: e.target.value }
                                        })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Pre-Study Routine</label>
                                    <textarea
                                        className="w-full h-24 p-3 text-sm border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-blue-100 outline-none resize-none"
                                        value={strategies[editingStrategyType]?.preStudyRoutine || ''}
                                        onChange={e => onStrategiesChange({
                                            ...strategies,
                                            [editingStrategyType]: { ...strategies[editingStrategyType], preStudyRoutine: e.target.value }
                                        })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Recovery Guide</label>
                                    <textarea
                                        className="w-full h-24 p-3 text-sm border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-blue-100 outline-none resize-none"
                                        value={strategies[editingStrategyType]?.recoveryGuide || ''}
                                        onChange={e => onStrategiesChange({
                                            ...strategies,
                                            [editingStrategyType]: { ...strategies[editingStrategyType], recoveryGuide: e.target.value }
                                        })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Lifestyle Guide</label>
                                    <textarea
                                        className="w-full h-24 p-3 text-sm border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-blue-100 outline-none resize-none"
                                        value={strategies[editingStrategyType]?.lifestyleGuide || ''}
                                        onChange={e => onStrategiesChange({
                                            ...strategies,
                                            [editingStrategyType]: { ...strategies[editingStrategyType], lifestyleGuide: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button onClick={onClose} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition">Close & Apply</button>
                </div>
            </div>
        </div>
    );
});

ConfigModal.displayName = 'ConfigModal';
