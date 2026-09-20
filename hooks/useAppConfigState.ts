import { useState, useEffect, useCallback } from 'react';
import { AssessmentResult, StrategyMap } from '../types';
import { DEFAULT_STRATEGIES } from '../data/strategies';
import { safeStorage } from '../utils/safeStorage';
import { LicenseInfo } from '../utils/licenseManager';
import { MembershipTier } from '../utils/featureGate';

export const useAppConfigState = () => {
    const [showConfig, setShowConfig] = useState(false);
    const [showNutritionalPrescription, setShowNutritionalPrescription] = useState(false);
    const [showDataEditor, setShowDataEditor] = useState(false);
    const [config, setConfig] = useState(() => {
        const defaultCfg = {
            isExamMode: true,
            showDetail: true,
            isMedicalMode: false,
            useBrainBody: false,
            usePortable: false,
            // [보안] 하드코딩 기본 비밀번호 제거: 오너가 설정에서 직접 지정해야 함(미설정 시 관리자 진입 불가)
            expertModePassword: '',
            examiners: [] as import('../types').Examiner[],
            currentExaminerId: '',
        };
        try {
            const saved = localStorage.getItem('sn1_config');
            if (saved) {
                const parsed = JSON.parse(saved);
                parsed.useBrainBody = false;
                parsed.usePortable = false;
                parsed.isMedicalMode = false;
                return { ...defaultCfg, ...parsed };
            }
        } catch { /* ignore */ }
        return defaultCfg;
    });

    useEffect(() => {
        safeStorage.saveJSON('sn1_config', config);
    }, [config]);

    const [aiModels, setAiModels] = useState<import('../types').AIModelConfig>(() => {
        return safeStorage.getJSON<import('../types').AIModelConfig>('sn1_ai_models', {
            geminiKey: '',
            sonnetKey: '',
            localModelUrl: '',
        });
    });

    const handleAiModelsChange = useCallback((models: import('../types').AIModelConfig) => {
        setAiModels(models);
        safeStorage.saveJSON('sn1_ai_models', models);
    }, []);

    const [strategies, setStrategies] = useState<StrategyMap>(DEFAULT_STRATEGIES);
    const [selectedSubjectOptions, setSelectedSubjectOptions] = useState<Record<string, string[]>>({
        korean: ['kor_1'],
        math: [],
        english: ['eng_1'],
    });
    const [completedItems, setCompletedItems] = useState<string[]>([]);
    const [showSecretPoint, setShowSecretPoint] = useState(false);
    const [adminMemo, setAdminMemo] = useState('');

    const [history, setHistory] = useState<(AssessmentResult & { date: string })[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    const [licenseChecked, setLicenseChecked] = useState(false);
    const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
    const [currentTier, setCurrentTier] = useState<MembershipTier>('free');
    const [showLicenseScreen, setShowLicenseScreen] = useState(false);
    const [tierVersion, setTierVersion] = useState(0);
    const [showPricingModal, setShowPricingModal] = useState(false);

    const [isRegistrationSaved, setIsRegistrationSaved] = useState<boolean>(false);
    const [justSaved, setJustSaved] = useState<boolean>(false);
    const [showSaveRequiredModal, setShowSaveRequiredModal] = useState<boolean>(false);
    const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = useCallback((msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    }, []);

    useEffect(() => {
        const handleTierUpdate = () => {
            setTierVersion((v) => v + 1);
        };
        window.addEventListener('nbass_tier_changed', handleTierUpdate);
        window.addEventListener('storage', handleTierUpdate);
        return () => {
            window.removeEventListener('nbass_tier_changed', handleTierUpdate);
            window.removeEventListener('storage', handleTierUpdate);
        };
    }, []);

    return {
        showConfig, setShowConfig,
        showNutritionalPrescription, setShowNutritionalPrescription,
        showDataEditor, setShowDataEditor,
        config, setConfig,
        aiModels, setAiModels, handleAiModelsChange,
        strategies, setStrategies,
        selectedSubjectOptions, setSelectedSubjectOptions,
        completedItems, setCompletedItems,
        showSecretPoint, setShowSecretPoint,
        adminMemo, setAdminMemo,
        history, setHistory,
        selectedStudentId, setSelectedStudentId,
        licenseChecked, setLicenseChecked,
        licenseInfo, setLicenseInfo,
        currentTier, setCurrentTier,
        showLicenseScreen, setShowLicenseScreen,
        tierVersion, setTierVersion,
        showPricingModal, setShowPricingModal,
        isRegistrationSaved, setIsRegistrationSaved,
        justSaved, setJustSaved,
        showSaveRequiredModal, setShowSaveRequiredModal,
        saveSuccessNotice, setSaveSuccessNotice,
        toastMessage, setToastMessage, showToast,
    };
};
