import React, { useState, useEffect } from 'react';
import {
  getStandardDailyAdBudgetPlan,
  AEO_GEO_TOPICS,
  generateGeoSchema,
  DailyAdBudgetExecution
} from '../../services/marketingAgentEngine';
import { generateAIResponse } from '../../services/aiService';
import { ExpertAccountService } from '../../services/expertAccountService';
import { AffiliatedAcademyService, AffiliatedAcademy } from '../../services/affiliatedAcademyService';
import { ExpertAccount } from '../../types';
import { UserTierService, UserTierOverride } from '../../services/userTierService';
import { MembershipTier, TIER_INFO } from '../../utils/featureGate';
import { unifiedSyncService as DatabaseService } from '../../services/unifiedSyncService';
import {
  supabase,
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  reinitSupabaseClient,
  keyFormat,
  type SyncTableCheck
} from '../../lib/supabase';
import {
  getSupabaseRealtimeStatus,
  pullSupabaseToLocal,
  pushLocalToSupabase,
  type RealtimeStatus
} from '../../services/supabaseRealtimeSync';
import { CareType, StrategyMap, Prescription, Examiner, AIModelConfig } from '../../types';
import { LogicEngineConfig, LogicThresholds, loadLogicConfig, saveLogicConfig, resetLogicConfig } from '../../logicEngine';
import { loadPredictionRules, savePredictionRules, resetPredictionRules } from '../../data/predictionRules';
import { loadProductRecommendations, saveProductRecommendations, resetProductRecommendations } from '../../data/productRecommendations';
import { DEFAULT_STRATEGIES } from '../../data/strategies';
import { MENTAL_PRESCRIPTIONS } from '../../data/prescriptions';
import { ConfigModal } from '../modals/ConfigModal';
import {
  kakaoNotificationService,
  KakaoApiConfig,
  KakaoTemplateType,
  KakaoSendResult
} from '../../services/kakaoNotificationService';
import { GradeCutoffsManager } from './GradeCutoffsManager';

export interface OwnerDashboardViewProps {
  onBack?: () => void;
  onGoToStudentMode?: () => void;
  config?: any;
  onConfigChange?: (config: any) => void;
  strategies?: StrategyMap;
  onStrategiesChange?: (strategies: StrategyMap) => void;
  prescriptions?: Record<string, Prescription>;
  onPrescriptionsChange?: (prescriptions: Record<string, Prescription>) => void;
  editingStrategyType?: CareType;
  onEditingStrategyTypeChange?: (type: CareType) => void;
  selectedSubjectOptions?: Record<string, string[]>;
  onSelectedSubjectOptionsChange?: (options: Record<string, string[]>) => void;
  logicConfig?: LogicEngineConfig;
  onLogicConfigChange?: (config: LogicEngineConfig) => void;
  onResetLogicConfig?: () => void;
  productRecommendations?: Record<string, string[]>;
  onProductRecommendationsChange?: (recs: Record<string, string[]>) => void;
  onResetProductRecommendations?: () => void;
  predictionRules?: any[];
  onPredictionRulesChange?: (rules: any[]) => void;
  onResetPredictionRules?: () => void;
  aiModels?: any;
  onAiModelsChange?: (models: any) => void;
  isAdminUnlocked?: boolean;
}

export const OwnerDashboardView: React.FC<OwnerDashboardViewProps> = (props) => {
  const { onBack, onGoToStudentMode } = props;
  const [activeTab, setActiveTab] = useState<'briefing' | 'approvals' | 'marketing' | 'academies' | 'exceptions' | 'user_tiers' | 'supabase_db' | 'system_config' | 'kakao' | 'cutoffs'>('briefing');
  // 1일 마케팅 예산 (localStorage 영구 저장, 기본 50만원)
  const [dailyBudget, setDailyBudget] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem('nbass_daily_ad_budget'));
      return saved > 0 ? saved : 500000;
    } catch { return 500000; }
  });
  const [budgetInput, setBudgetInput] = useState<string>(() => {
    try {
      const saved = Number(localStorage.getItem('nbass_daily_ad_budget'));
      return String(saved > 0 ? saved : 500000);
    } catch { return '500000'; }
  });
  const [budgetPlan, setBudgetPlan] = useState<DailyAdBudgetExecution>(getStandardDailyAdBudgetPlan(
    (() => { try { const s = Number(localStorage.getItem('nbass_daily_ad_budget')); return s > 0 ? s : 500000; } catch { return 500000; } })()
  ));

  // 예산 변경 핸들러: 채널 분배 비율(40/35/15/10%)은 유지하고 총액만 재계산
  const handleBudgetSave = () => {
    const val = Math.max(0, Math.round(Number(budgetInput.replace(/[^0-9]/g, '')) || 0));
    setDailyBudget(val);
    setBudgetPlan(getStandardDailyAdBudgetPlan(val));
    try { localStorage.setItem('nbass_daily_ad_budget', String(val)); } catch { /* 무시 */ }
  };

  // User Tier Overrides State
  const [tierOverrides, setTierOverrides] = useState<Record<string, UserTierOverride>>(() => UserTierService.getOverrides());
  const [tierSearch, setTierSearch] = useState('');
  const [manualIdInput, setManualIdInput] = useState('');
  const [manualNameInput, setManualNameInput] = useState('');
  const [manualTierInput, setManualTierInput] = useState<MembershipTier>('premium');
  const [historyStudents, setHistoryStudents] = useState<{ id: string; name: string; date?: string; tier: MembershipTier }[]>([]);

  // Supabase State & Migration
  const [supabaseUrl, setSupabaseUrl] = useState(() => getSupabaseConfig().url);
  const [supabaseKey, setSupabaseKey] = useState(() => getSupabaseConfig().key);
  const [supabaseStatus, setSupabaseStatus] = useState<{
    testing: boolean;
    checked: boolean;
    connected: boolean;
    message: string;
    latencyMs?: number;
  }>({
    testing: false,
    checked: false,
    connected: false,
    message: '연결 확인 대기'
  });
  const [migrationRunning, setMigrationRunning] = useState(false);
  const [migrationLog, setMigrationLog] = useState<string[]>([]);
  const [migrationProgress, setMigrationProgress] = useState({ current: 0, total: 0 });
  const [isCopied, setIsCopied] = useState(false);
  // Realtime 동기화 진단 상태
  const [diagTables, setDiagTables] = useState<SyncTableCheck[]>([]);
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>(() => getSupabaseRealtimeStatus());
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  // --- Config Modal & System Settings State ---
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configModalTab, setConfigModalTab] = useState<'general' | 'strategy' | 'subject' | 'prescriptions' | 'logic' | 'products' | 'prediction' | 'manuals' | 'aimodel' | 'patent'>('general');

  const openConfigModalWithTab = (tab: 'general' | 'strategy' | 'subject' | 'prescriptions' | 'logic' | 'products' | 'prediction' | 'manuals' | 'aimodel' | 'patent') => {
    setConfigModalTab(tab);
    setIsConfigModalOpen(true);
  };

  // Internal fallbacks & synchronization
  const [internalConfig, setInternalConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('sn1_config');
      return saved ? JSON.parse(saved) : { isExamMode: true, showDetail: true, expertModePassword: '' };
    } catch {
      return { isExamMode: true, showDetail: true, expertModePassword: '' };
    }
  });
  const currentConfig = props.config || internalConfig;
  const handleConfigUpdate = (newCfg: any) => {
    setInternalConfig(newCfg);
    try { localStorage.setItem('sn1_config', JSON.stringify(newCfg)); } catch {}
    if (props.onConfigChange) props.onConfigChange(newCfg);
  };

  const [internalLogicConfig, setInternalLogicConfig] = useState<LogicEngineConfig>(() => loadLogicConfig());
  const currentLogicConfig = props.logicConfig || internalLogicConfig;
  const handleLogicConfigUpdate = (cfg: LogicEngineConfig) => {
    setInternalLogicConfig(cfg);
    saveLogicConfig(cfg);
    if (props.onLogicConfigChange) props.onLogicConfigChange(cfg);
  };
  const handleResetLogicConfig = () => {
    const res = resetLogicConfig();
    setInternalLogicConfig(res);
    if (props.onResetLogicConfig) props.onResetLogicConfig();
  };

  const [internalStrategies, setInternalStrategies] = useState<StrategyMap>(DEFAULT_STRATEGIES);
  const currentStrategies = props.strategies || internalStrategies;
  const handleStrategiesUpdate = (s: StrategyMap) => {
    setInternalStrategies(s);
    if (props.onStrategiesChange) props.onStrategiesChange(s);
  };

  const [internalPrescriptions, setInternalPrescriptions] = useState<Record<string, Prescription>>(MENTAL_PRESCRIPTIONS);
  const currentPrescriptions = props.prescriptions || internalPrescriptions;
  const handlePrescriptionsUpdate = (p: Record<string, Prescription>) => {
    setInternalPrescriptions(p);
    if (props.onPrescriptionsChange) props.onPrescriptionsChange(p);
  };

  const [internalEditingStrategyType, setInternalEditingStrategyType] = useState<CareType>(CareType.BURNOUT);
  const currentEditingStrategyType = props.editingStrategyType || internalEditingStrategyType;
  const handleEditingStrategyTypeUpdate = (t: CareType) => {
    setInternalEditingStrategyType(t);
    if (props.onEditingStrategyTypeChange) props.onEditingStrategyTypeChange(t);
  };

  const [internalSelectedSubjectOptions, setInternalSelectedSubjectOptions] = useState<Record<string, string[]>>({
    korean: ['kor_1'], math: [], english: ['eng_1'],
  });
  const currentSelectedSubjectOptions = props.selectedSubjectOptions || internalSelectedSubjectOptions;
  const handleSelectedSubjectOptionsUpdate = (opt: Record<string, string[]>) => {
    setInternalSelectedSubjectOptions(opt);
    if (props.onSelectedSubjectOptionsChange) props.onSelectedSubjectOptionsChange(opt);
  };

  const [internalProductRecs, setInternalProductRecs] = useState<Record<string, string[]>>(() => loadProductRecommendations());
  const currentProductRecommendations = props.productRecommendations || internalProductRecs;
  const handleProductRecommendationsUpdate = (r: Record<string, string[]>) => {
    setInternalProductRecs(r);
    saveProductRecommendations(r);
    if (props.onProductRecommendationsChange) props.onProductRecommendationsChange(r);
  };
  const handleResetProductRecommendations = () => {
    const r = resetProductRecommendations();
    setInternalProductRecs(r);
    if (props.onResetProductRecommendations) props.onResetProductRecommendations();
  };

  const [internalPredictionRules, setInternalPredictionRules] = useState<any[]>(() => loadPredictionRules());
  const currentPredictionRules = props.predictionRules || internalPredictionRules;
  const handlePredictionRulesUpdate = (rules: any[]) => {
    setInternalPredictionRules(rules);
    savePredictionRules(rules);
    if (props.onPredictionRulesChange) props.onPredictionRulesChange(rules);
  };
  const handleResetPredictionRules = () => {
    const rules = resetPredictionRules();
    setInternalPredictionRules(rules);
    if (props.onResetPredictionRules) props.onResetPredictionRules();
  };

  const [internalAiModels, setInternalAiModels] = useState<any>(() => {
    try {
      const s = localStorage.getItem('sn1_ai_models');
      return s ? JSON.parse(s) : { geminiKey: '', sonnetKey: '', localModelUrl: '' };
    } catch {
      return { geminiKey: '', sonnetKey: '', localModelUrl: '' };
    }
  });
  const currentAiModels = props.aiModels || internalAiModels;
  const handleAiModelsUpdate = (models: any) => {
    setInternalAiModels(models);
    try { localStorage.setItem('sn1_ai_models', JSON.stringify(models)); } catch {}
    if (props.onAiModelsChange) props.onAiModelsChange(models);
  };

  // Quick Threshold Inputs
  const [quickThresholds, setQuickThresholds] = useState<Partial<LogicThresholds>>(() => {
    return currentLogicConfig.thresholds || {};
  });
  useEffect(() => {
    if (currentLogicConfig.thresholds) {
      setQuickThresholds(currentLogicConfig.thresholds);
    }
  }, [currentLogicConfig.thresholds]);
  const [saveThresholdNotice, setSaveThresholdNotice] = useState<string | null>(null);
  const handleSaveThresholds = () => {
    const updated = {
      ...currentLogicConfig,
      thresholds: {
        ...currentLogicConfig.thresholds,
        ...quickThresholds
      }
    };
    handleLogicConfigUpdate(updated);
    setSaveThresholdNotice('로직 엔진 임계값이 즉시 저장되었습니다.');
    setTimeout(() => setSaveThresholdNotice(null), 3000);
  };

  // Master Password Input
  const [masterPwInput, setMasterPwInput] = useState<string>(() => currentConfig.expertModePassword || '');
  const [savePwNotice, setSavePwNotice] = useState<string | null>(null);
  const handleSaveMasterPassword = () => {
    const updated = { ...currentConfig, expertModePassword: masterPwInput.trim() };
    handleConfigUpdate(updated);
    setSavePwNotice('마스터 비밀번호가 성공적으로 저장되었습니다.');
    setTimeout(() => setSavePwNotice(null), 3000);
  };

  // Quick API Key Inputs
  const [quickAiKeys, setQuickAiKeys] = useState({
    geminiKey: currentAiModels?.geminiKey || '',
    sonnetKey: currentAiModels?.sonnetKey || '',
    openRouterKey: currentAiModels?.openRouterKey || currentAiModels?.localModelUrl || '',
  });
  const [saveAiNotice, setSaveAiNotice] = useState<string | null>(null);
  const handleSaveAiKeys = () => {
    const updated = {
      ...currentAiModels,
      geminiKey: quickAiKeys.geminiKey.trim(),
      sonnetKey: quickAiKeys.sonnetKey.trim(),
      openRouterKey: quickAiKeys.openRouterKey.trim(),
    };
    handleAiModelsUpdate(updated);
    setSaveAiNotice('AI API 키가 성공적으로 저장되었습니다.');
    setTimeout(() => setSaveAiNotice(null), 3000);
  };

  const handleTestConnection = async () => {
    setSupabaseStatus(prev => ({ ...prev, testing: true, message: 'Supabase 클라우드 서버 핑 테스트 중...' }));
    const result = await testSupabaseConnection(supabaseUrl, supabaseKey);
    setSupabaseStatus({
      testing: false,
      checked: true,
      connected: result.success,
      message: result.message,
      latencyMs: result.latencyMs
    });
    setDiagTables(result.tables || []);
    setRealtimeStatus(getSupabaseRealtimeStatus());
  };

  // Realtime 상태 배지 실시간 갱신
  useEffect(() => {
    const handler = (ev: Event) => {
      const detail = (ev as CustomEvent)?.detail;
      setRealtimeStatus(detail?.status || getSupabaseRealtimeStatus());
    };
    window.addEventListener('nbass_supabase_realtime_status', handler);
    setRealtimeStatus(getSupabaseRealtimeStatus());
    return () => window.removeEventListener('nbass_supabase_realtime_status', handler);
  }, []);

  const handleManualPull = async () => {
    setSyncBusy(true);
    setSyncMsg('⬇ Supabase에서 내려받는 중...');
    try {
      const r = await pullSupabaseToLocal();
      setSyncMsg(`⬇ Pull 완료: ${r.pulled}건 병합`);
    } catch (e: any) {
      setSyncMsg(`⬇ Pull 실패: ${e?.message || '오류'}`);
    } finally {
      setSyncBusy(false);
    }
  };

  const handleManualPush = async () => {
    setSyncBusy(true);
    setSyncMsg('⬆ Supabase로 올리는 중...');
    try {
      const r = await pushLocalToSupabase();
      setSyncMsg(`⬆ Push 완료: ${r.pushed}건 업로드`);
    } catch (e: any) {
      setSyncMsg(`⬆ Push 실패: ${e?.message || '오류'}`);
    } finally {
      setSyncBusy(false);
    }
  };

  const handleSaveSupabaseConfig = () => {
    saveSupabaseConfig(supabaseUrl, supabaseKey);
    reinitSupabaseClient(supabaseUrl, supabaseKey);
    handleTestConnection();
    alert('✅ Supabase 설정이 저장 및 적용되었습니다.');
  };

  const handleMigrateToSupabase = async () => {
    if (!confirm('IndexedDB에 저장된 모든 학생 검사 기록과 프로필을 Supabase 클라우드로 일괄 업로드(마이그레이션)하시겠습니까?')) {
      return;
    }
    setMigrationRunning(true);
    setMigrationLog(['🚀 마이그레이션 시작: 로컬 IndexedDB 데이터 로드 중...']);

    try {
      const records = await DatabaseService.getAllHistory();
      setMigrationProgress({ current: 0, total: records.length });
      setMigrationLog(prev => [...prev, `📦 총 ${records.length}건의 검사 기록 발견.`]);

      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < records.length; i++) {
        const r = records[i];
        const studentName = r.student?.name || '미지정';
        try {
          const payload: any = {
            student_name: studentName,
            student_info: r.student || {},
            survey_data: r.survey || {},
            hrv_data: r.hrv || {},
            protocol_data: r.protocol || {},
            classification_result: r.classificationResult || {},
            care_type: r.careType || 'Type-1',
            care_score: r.score || 0,
            study_efficiency_data: r.studyEfficiencyResults || {},
            analysis_text: r.analysisText || '',
            status: 'completed',
            updated_at: new Date().toISOString()
          };

          const { error } = await supabase.from('assessments' as any).insert(payload);
          if (error) {
            throw error;
          }
          successCount++;
          setMigrationLog(prev => [...prev, `✅ [${i + 1}/${records.length}] ${studentName} 업로드 완료`]);
        } catch (err: any) {
          failCount++;
          setMigrationLog(prev => [...prev, `⚠️ [${i + 1}/${records.length}] ${studentName} 실패: ${err?.message || '테이블 미생성 또는 권한 오류'}`]);
        }
        setMigrationProgress({ current: i + 1, total: records.length });
      }

      setMigrationLog(prev => [
        ...prev,
        `🎉 마이그레이션 완료: 성공 ${successCount}건, 실패 ${failCount}건`
      ]);
    } catch (e: any) {
      setMigrationLog(prev => [...prev, `❌ 마이그레이션 중단: ${e?.message || '알 수 없는 오류'}`]);
    } finally {
      setMigrationRunning(false);
    }
  };

  useEffect(() => {
    DatabaseService.getAllHistory().then(records => {
      const studentMap = new Map<string, { id: string; name: string; date?: string; tier: MembershipTier }>();

      // Default insert limsd7 & sample accounts if not present
      studentMap.set('limsd7', {
        id: 'limsd7',
        name: 'limsd7',
        date: '2026-09-22',
        tier: UserTierService.getEffectiveTier('limsd7', 'pro')
      });
      studentMap.set('ID-20260820-6RKR', {
        id: 'ID-20260820-6RKR',
        name: '연습001',
        date: new Date().toISOString().split('T')[0],
        tier: UserTierService.getEffectiveTier('ID-20260820-6RKR', 'premium')
      });
      studentMap.set('TEST_EXPERT_01', {
        id: 'TEST_EXPERT_01',
        name: '오류검증_전문가01',
        date: new Date().toISOString().split('T')[0],
        tier: UserTierService.getEffectiveTier('TEST_EXPERT_01', 'expert')
      });

      records.forEach(r => {
        if (r.student) {
          const sName = (r.student.name || '').trim();
          const sId = (r.student.id || '').trim();
          if (!sName && !sId) return;

          const key = sName ? `NAME_${sName.toLowerCase()}` : sId;
          const effective = UserTierService.getEffectiveTier(r.student.id || r.student.name, r.student.membershipTier || 'free');

          if (!studentMap.has(key)) {
            studentMap.set(key, {
              id: r.student.id || key,
              name: r.student.name || '미입력',
              date: r.date || r.student.testDate,
              tier: effective
            });
          }
        }
      });

      setHistoryStudents(Array.from(studentMap.values()));
    }).catch(e => {
      console.error('Failed to load history students for tier management:', e);
    });
  }, [tierOverrides]);

  const handleGrantTier = async (studentId: string, tier: MembershipTier, name?: string, notes?: string) => {
    UserTierService.setUserTier(studentId, tier, name, notes);
    setTierOverrides(UserTierService.getOverrides());
    // Also sync to DB records
    await DatabaseService.updateStudentMembershipTier(studentId, tier);
    if (name && name !== studentId) {
      await DatabaseService.updateStudentMembershipTier(name, tier);
    }
  };

  // Affiliated Academies State
  const [academies, setAcademies] = useState<AffiliatedAcademy[]>(() => AffiliatedAcademyService.getAcademies());
  const [newAcademyName, setNewAcademyName] = useState('');
  const [newAcademyRegion, setNewAcademyRegion] = useState('');
  const [isAddingAcademy, setIsAddingAcademy] = useState(false);
  const [academyError, setAcademyError] = useState('');

  useEffect(() => {
    AffiliatedAcademyService.fetchFromSupabase().then(list => setAcademies(list));
  }, []);

  const handleAddAcademy = async () => {
    const name = newAcademyName.trim();
    if (!name) { setAcademyError('학원/학교 이름을 입력해 주세요.'); return; }
    if (AffiliatedAcademyService.exists(name)) { setAcademyError('이미 등록된 학원/학교입니다.'); return; }
    setIsAddingAcademy(true);
    setAcademyError('');
    try {
      const added = await AffiliatedAcademyService.addAcademy(name, newAcademyRegion);
      setAcademies(AffiliatedAcademyService.getAcademies());
      setNewAcademyName('');
      setNewAcademyRegion('');
    } catch {
      setAcademyError('추가 중 오류가 발생했습니다.');
    } finally {
      setIsAddingAcademy(false);
    }
  };

  const handleRemoveAcademy = async (id: string) => {
    await AffiliatedAcademyService.removeAcademy(id);
    setAcademies(AffiliatedAcademyService.getAcademies());
  };

  // Expert Accounts State
  const [expertAccounts, setExpertAccounts] = useState<ExpertAccount[]>(() => ExpertAccountService.getAccounts());
  const [expertFilter, setExpertFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [showCreateExpertModal, setShowCreateExpertModal] = useState(false);
  const [newExpRole, setNewExpRole] = useState<'MEDICAL_EXPERT' | 'ACADEMY_EXPERT'>('MEDICAL_EXPERT');
  const [newExpName, setNewExpName] = useState('');
  const [newExpEmail, setNewExpEmail] = useState('');
  const [newExpPhone, setNewExpPhone] = useState('');
  const [newExpOrg, setNewExpOrg] = useState('');
  const [newExpDetail, setNewExpDetail] = useState('');

  // Kakao Talk Notification & Marketing Service State
  const [kakaoConfig, setKakaoConfig] = useState<KakaoApiConfig>(() => kakaoNotificationService.getConfig());
  const [kakaoLogs, setKakaoLogs] = useState(() => kakaoNotificationService.getLogs());
  const [kakaoTestPhone, setKakaoTestPhone] = useState('010-9876-5432');
  const [kakaoTestTemplate, setKakaoTestTemplate] = useState<KakaoTemplateType>('EXPERT_ACCOUNT_ISSUED');
  const [kakaoPreviewTemplate, setKakaoPreviewTemplate] = useState<KakaoTemplateType>('EXPERT_ACCOUNT_ISSUED');
  const [sundayStudentId, setSundayStudentId] = useState('');
  const [sundayPhone, setSundayPhone] = useState('');
  const [sundaySending, setSundaySending] = useState(false);
  const [kakaoStatus, setKakaoStatus] = useState<{ testing: boolean; message: string; success?: boolean }>({
    testing: false,
    message: '연결 확인 대기'
  });
  const [autoSendKakaoOnCreateExp, setAutoSendKakaoOnCreateExp] = useState(true);
  const [kakaoToast, setKakaoToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showKakaoToast = (message: string, type: 'success' | 'error' = 'success') => {
    setKakaoToast({ message, type });
    setTimeout(() => setKakaoToast(null), 4000);
  };

  const handleSaveKakaoConfig = (partial: Partial<KakaoApiConfig>) => {
    const updated = kakaoNotificationService.saveConfig(partial);
    setKakaoConfig(updated);
    showKakaoToast('✅ 카카오톡 서비스 연계 설정이 저장되었습니다.');
  };

  const handleTestKakaoConnection = async () => {
    setKakaoStatus({ testing: true, message: '알림톡 게이트웨이 핑 테스트 중...' });
    const res = await kakaoNotificationService.testConnection();
    setKakaoStatus({
      testing: false,
      message: `${res.message} (${res.latencyMs}ms)`,
      success: res.success
    });
  };

  const handleSendTestKakao = async () => {
    if (!kakaoTestPhone.trim()) {
      alert('수신할 휴대폰 번호를 입력해주세요.');
      return;
    }
    const res = await kakaoNotificationService.sendTestMessage(kakaoTestPhone.trim(), kakaoTestTemplate);
    setKakaoLogs(kakaoNotificationService.getLogs());
    if (res.success) {
      showKakaoToast(`🎉 [${kakaoTestTemplate}] 알림톡 테스트 발송 성공! (${res.isSimulated ? '샌드박스 가상발송' : '실발송 완료'})`);
    } else {
      showKakaoToast(`❌ 발송 실패: ${res.error}`, 'error');
    }
  };

  const handleSendSundayBriefing = async () => {
    if (!sundayStudentId) {
      alert('브리핑을 발송할 학생을 선택해주세요.');
      return;
    }
    if (!sundayPhone.trim()) {
      alert('학부모 수신 번호를 입력해주세요.');
      return;
    }
    const target = historyStudents.find(s => s.id === sundayStudentId);
    if (!target) {
      alert('선택한 학생 정보를 찾을 수 없습니다.');
      return;
    }
    setSundaySending(true);
    try {
      const records = await DatabaseService.getAllHistory();
      const res = await kakaoNotificationService.sendSundayBriefing({
        studentId: target.id,
        tier: target.tier,
        recipientPhone: sundayPhone.trim(),
        recipientName: `${target.name} 학부모님`,
        studentName: target.name,
        history: records as any[],
      });
      setKakaoLogs(kakaoNotificationService.getLogs());
      if (res.success) {
        showKakaoToast(`🎉 주간 브리핑 발송 성공! (${res.isSimulated ? '샌드박스 가상발송' : '실발송 완료'})`);
      } else {
        showKakaoToast(`❌ 발송 실패: ${res.error}`, 'error');
      }
    } catch (e) {
      showKakaoToast('❌ 발송 중 오류가 발생했습니다.', 'error');
    } finally {
      setSundaySending(false);
    }
  };

  const handleApproveExpert = (id: string) => {
    ExpertAccountService.updateStatus(id, 'APPROVED');
    const updatedList = ExpertAccountService.getAccounts();
    setExpertAccounts(updatedList);

    // Kakao Talk Auto Notification on Approval
    const targetExpert = updatedList.find(a => a.id === id);
    if (targetExpert && kakaoConfig.autoSendOnExpertApproved && targetExpert.phone) {
      kakaoNotificationService.sendExpertApprovalNotification({
        name: targetExpert.name,
        email: targetExpert.email,
        phone: targetExpert.phone,
        role: targetExpert.role,
        orgName: targetExpert.clinicName || targetExpert.academyName
      }).then(res => {
        setKakaoLogs(kakaoNotificationService.getLogs());
        if (res.success) {
          showKakaoToast(`💬 [${targetExpert.name}] 가입 심사 승인 알림톡이 자동 발송되었습니다!`);
        }
      });
    }
  };

  const handleRejectExpert = (id: string) => {
    ExpertAccountService.updateStatus(id, 'REJECTED');
    setExpertAccounts(ExpertAccountService.getAccounts());
  };

  const handleCreateExpertAccount = () => {
    if (!newExpName.trim() || !newExpEmail.trim()) {
      alert('이름과 이메일을 입력해주세요.');
      return;
    }

    const orgName = newExpRole === 'MEDICAL_EXPERT' 
      ? (newExpOrg.trim() || '연세마인드 인지학습 클리닉') 
      : (newExpOrg.trim() || '시대인재 (대치)');
    const phone = newExpPhone.trim() || '010-0000-0000';

    ExpertAccountService.createApprovedAccount({
      name: newExpName.trim(),
      email: newExpEmail.trim(),
      phone,
      role: newExpRole,
      clinicName: newExpRole === 'MEDICAL_EXPERT' ? orgName : undefined,
      medicalLicenseNumber: newExpRole === 'MEDICAL_EXPERT' ? (newExpDetail.trim() || 'MD-998821') : undefined,
      medicalSpecialty: newExpRole === 'MEDICAL_EXPERT' ? '소아청소년 / 신경정신과' : undefined,
      academyName: newExpRole === 'ACADEMY_EXPERT' ? orgName : undefined,
      position: newExpRole === 'ACADEMY_EXPERT' ? (newExpDetail.trim() || '입시전략센터장') : undefined,
      academyRegion: newExpRole === 'ACADEMY_EXPERT' ? '서울 강남구 대치동' : undefined
    });

    // Kakao Talk Auto Notification on Expert Direct Issuance
    if (autoSendKakaoOnCreateExp && kakaoConfig.autoSendOnExpertCreated && phone && phone !== '010-0000-0000') {
      kakaoNotificationService.sendExpertIssuanceNotification({
        name: newExpName.trim(),
        email: newExpEmail.trim(),
        phone,
        role: newExpRole,
        orgName,
        tempPassword: 'nbass2026!'
      }).then(res => {
        setKakaoLogs(kakaoNotificationService.getLogs());
        if (res.success) {
          showKakaoToast(`💬 [${newExpName}] 전문가 계정 발급 알림톡이 자동 발송되었습니다!`);
        }
      });
    }

    setExpertAccounts(ExpertAccountService.getAccounts());
    setShowCreateExpertModal(false);
    setNewExpName('');
    setNewExpEmail('');
    setNewExpPhone('');
    setNewExpOrg('');
    setNewExpDetail('');
    alert(`🎉 [${newExpName} (${newExpEmail})] 전문가 계정이 즉시 발급 및 승인되었습니다!`);
  };

  // Pending Marketing Approval Items
  const [approvalList, setApprovalList] = useState([
    {
      id: 'appr-1',
      type: 'AEO / 블로그 포스트',
      title: '수능 D-100 불안증 및 집중력 저하 극복 뇌과학 솔루션',
      target: 'Perplexity, ChatGPT, 네이버 1위 노출 (AEO+SEO)',
      snippet: 'NBASS 인지학습 클리닉 연구에 따르면, 고강도 시험 불안은 자율신경계 교감신경 과항진(SNS > 75%)에서 비롯됩니다...',
      status: 'pending'
    },
    {
      id: 'appr-2',
      type: '메타 릴스 숏폼 광고 스크립트 (일 17.5만원 예산)',
      title: '우리 아이 왜 10분만 앉아있어도 딴짓할까? 3가지 뇌 유형',
      target: '고1~고3 학부모 타겟 전환 광고',
      snippet: '후킹: "공부 의지 문제가 아닙니다. 전두엽 작업기억 용량의 신호입니다." → 솔루션: 3분 무료 진단',
      status: 'pending'
    },
    {
      id: 'appr-3',
      type: 'GEO 지식 그래프 스키마 (Google AI Overviews)',
      title: '자녀 공부 성향 파악 테스트 vs MBTI 차이점 JSON-LD',
      target: 'Google SearchGPT 지식베이스 직접 등록',
      snippet: '{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[...]}',
      status: 'pending'
    }
  ]);

  // AI Content Generator State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    setApprovalList(prev => prev.map(item => item.id === id ? { ...item, status: 'approved' } : item));
  };

  const handleReject = (id: string) => {
    setApprovalList(prev => prev.map(item => item.id === id ? { ...item, status: 'rejected' } : item));
  };

  const handleGenerateFreshAsset = async (topicIndex: number) => {
    setIsGenerating(true);
    const selected = AEO_GEO_TOPICS[topicIndex];
    const prompt = `주제: "${selected.topic}" 에 대한 AEO(Perplexity/ChatGPT 인용용) + GEO(Google AI 요약용) 고전환 블로그 및 광고 카피를 작성해줘. 핵심 인용문구: ${selected.aeoCitation}`;
    const sysPrompt = `당신은 1인 사업(Solopreneur)을 위한 24시간 자율 AI 마케팅 에이전트입니다. 하루 ${dailyBudget.toLocaleString()}원 유료 광고 및 오가닉 검색 유입을 극대화하는 콘텐츠를 작성하세요.`;

    const res = await generateAIResponse(prompt, sysPrompt, null, 'premium');
    setGeneratedOutput(res.text);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {onBack && (
              <button
                onClick={onBack}
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all flex items-center gap-1.5"
                title="이전 화면 (관리자 포털)으로 돌아가기"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                <span>← 관리자 포털 (이전 화면)</span>
              </button>
            )}
            {onGoToStudentMode && (
              <button
                onClick={onGoToStudentMode}
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-sm transition-colors flex items-center gap-1.5"
                title="학생 진단 모드로 이동"
              >
                <span>🎓 학생 진단 모드</span>
              </button>
            )}
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              24시간 자율 에이전트 가동 중
            </span>
            <span className="text-xs text-slate-500">오너 집중 피드백 모드 (1일 1시간)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-2 text-slate-900">
            NBASS Solopreneur AI 오너 대시보드
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Supabase DB 및 OpenRouter Multi-Agent 기반 자동화 관제 센터
          </p>
        </div>

        {/* Action Summary Pill */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-6 shadow-sm">
          <div>
            <div className="text-xs text-slate-500">1일 마케팅 예산 (클릭하여 변경)</div>
            <input
              type="text"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              onBlur={handleBudgetSave}
              onKeyDown={(e) => { if (e.key === 'Enter') handleBudgetSave(); }}
              title="1일 마케팅 예산 (원) — 숫자 입력 후 Enter 또는 포커스 아웃 시 저장"
              className="text-lg font-bold text-indigo-600 bg-transparent border-b-2 border-dashed border-indigo-300 focus:border-indigo-600 focus:outline-none w-32"
            />
            <div className="text-[10px] text-slate-400 mt-0.5">₩{dailyBudget.toLocaleString()} 설정됨</div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <div className="text-xs text-slate-500">승인 대기 건수</div>
            <div className="text-lg font-bold text-amber-600">
              {approvalList.filter(a => a.status === 'pending').length}건
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <div className="text-xs text-slate-500">예상 월 순이익</div>
            <div className="text-lg font-bold text-emerald-600">~₩1,200만</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto mb-6 flex gap-1.5 border-b border-slate-200 overflow-x-auto whitespace-nowrap py-1 scrollbar-thin">
        <button
          onClick={() => setActiveTab('briefing')}
          className={`px-3.5 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${activeTab === 'briefing'
            ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
            : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <span>📊</span> 일일 AI 브리핑
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-3.5 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${activeTab === 'approvals'
            ? 'border-amber-600 text-amber-600 bg-amber-50/50'
            : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <span>✅</span> 승인 큐 ({expertAccounts.filter(a => a.status === 'PENDING').length + approvalList.filter(a => a.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('marketing')}
          className={`px-3.5 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${activeTab === 'marketing'
            ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50'
            : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <span>🚀</span> SEO/AEO & {Math.round(dailyBudget / 10000).toLocaleString()}만원 광고
        </button>
        <button
          onClick={() => setActiveTab('academies')}
          className={`px-3.5 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${activeTab === 'academies'
            ? 'border-cyan-600 text-cyan-600 bg-cyan-50/50'
            : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <span>🏫</span> 제휴 학원 관리 ({academies.length})
        </button>
        <button
          onClick={() => setActiveTab('exceptions')}
          className={`px-3.5 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${activeTab === 'exceptions'
            ? 'border-rose-600 text-rose-600 bg-rose-50/50'
            : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <span>🚨</span> 예외/CS 처리 (0)
        </button>
        <button
          onClick={() => setActiveTab('user_tiers')}
          className={`px-3.5 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${activeTab === 'user_tiers'
            ? 'border-amber-600 text-amber-600 bg-amber-50/50'
            : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <span>👑</span> 무료회원 등급 부여
        </button>
        <button
          onClick={() => setActiveTab('supabase_db')}
          className={`px-3.5 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${activeTab === 'supabase_db'
            ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50'
            : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <span>⚡</span> Supabase 연동
        </button>
        <button
          onClick={() => setActiveTab('system_config')}
          className={`px-3.5 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${activeTab === 'system_config'
            ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
            : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <span>⚙️</span> 시스템 통합 설정 (Config Studio)
        </button>
        <button
          onClick={() => setActiveTab('kakao')}
          className={`px-3.5 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${activeTab === 'kakao'
            ? 'border-amber-500 text-amber-900 bg-amber-50/80 font-black shadow-sm'
            : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <span className="px-1.5 py-0.5 rounded bg-[#FEE500] text-[#3C1E1E] text-[10px] font-black leading-none shadow-sm">TALK</span>
          카카오톡 연계 설정
        </button>
        <button
          onClick={() => setActiveTab('cutoffs')}
          className={`px-3.5 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${activeTab === 'cutoffs'
            ? 'border-blue-600 text-blue-700 bg-blue-50/90 font-black shadow-sm'
            : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <span>📊</span> 연도별 등급컷 & 대입 DB
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto">
        {/* Tab 1: Briefing */}
        {activeTab === 'briefing' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span>🤖</span> 오늘의 1분 종합 리포트
              </h2>
              <div className="space-y-4 text-sm text-slate-700">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">마케팅 & 유입 현황</span>
                  <p className="mt-2 text-slate-700">
                    - 1일 광고 예산 {Math.round(dailyBudget / 10000).toLocaleString()}만원 중 {Math.round(dailyBudget * 0.64 / 10000).toLocaleString()}만원 집행 중 (네이버 검색 {Math.round(dailyBudget * 0.64 * 0.44 / 10000).toLocaleString()}만, 인스타 릴스 {Math.round(dailyBudget * 0.64 * 0.56 / 10000).toLocaleString()}만)<br />
                    - 신규 방문자: 1,420명 / 무료 성향 진단 완료: 382명 (전환율 26.9%)<br />
                    - 유료 프리미엄 구독 결제 전환: 14명 (일 매출 ₩418,600)
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">전문가 가입 승인 현황</span>
                  <p className="mt-2 text-slate-700">
                    - 신규 가입 대기 전문가: <strong className="text-amber-600">{expertAccounts.filter(a => a.status === 'PENDING').length}명</strong> (의료전문가 {expertAccounts.filter(a => a.status === 'PENDING' && a.role === 'MEDICAL_EXPERT').length}명, 학생지도전문가 {expertAccounts.filter(a => a.status === 'PENDING' && a.role === 'ACADEMY_EXPERT').length}명)<br />
                    - 승인 완료 즉시 해당 권한(전체 학생 검색 / 소속 학원 학생 전담)이 실시간 활성화됩니다.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">오너 권장 액션 (약 5분 소요)</span>
                  <p className="mt-2 text-slate-700">
                    1. [승인 큐] 탭에서 의료전문가 면허 및 학원 전문가 소속 확인 후 1-클릭 승인<br />
                    2. 오늘 발행될 AEO 아티클 2건 확인 및 승인
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-700 mb-4">실시간 퍼널 전환율</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>방문 → 무료 진단</span>
                      <span className="font-bold text-slate-900">26.9%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: '26.9%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>무료 진단 → 유료 플랜</span>
                      <span className="font-bold text-emerald-600">3.66%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '18%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-indigo-900 mb-2">💡 AI 자동 최적화 피드백</h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  "학부모 유입이 많은 밤 10시~12시에 '수험생 수면-인지 리포트' 팝업을 띄웠을 때 결제 전환율이 2.4배 높습니다. 이 시간대 자동 타겟팅을 유지합니다."
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Approvals (Experts & Marketing) */}
        {activeTab === 'approvals' && (
          <div className="space-y-8">

            {/* Kakao Talk Expert Approval Integration Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border border-amber-300 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-xl bg-[#FEE500] text-[#3C1E1E] font-black text-xs shadow-sm flex items-center gap-1 shrink-0">
                  <span>💬</span> TALK
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">전문가 계정 발급 &amp; 승인 카카오톡 알림톡 연계</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${kakaoConfig.autoSendOnExpertCreated ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-600'}`}>
                      신규 발급 자동발송 {kakaoConfig.autoSendOnExpertCreated ? 'ON' : 'OFF'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${kakaoConfig.autoSendOnExpertApproved ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-slate-100 text-slate-600'}`}>
                      승인 완료 자동발송 {kakaoConfig.autoSendOnExpertApproved ? 'ON' : 'OFF'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                      {kakaoConfig.isSandbox ? '샌드박스(테스트)' : '실서버 모드'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    의료전문가/학원전문가 계정을 발급하거나 승인 시 접속 URL 및 임시 비밀번호가 카카오톡으로 즉시 전송됩니다.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('kakao')}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all text-xs shrink-0 shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>⚙️</span> 카카오 연계 설정 관리 →
              </button>
            </div>

            {/* Section 1: Expert Registration Approvals */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👨‍⚕️ 🎓</span>
                    <h2 className="text-lg font-bold text-slate-900">전문가 회원가입 승인 심사</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                      대기 {expertAccounts.filter(a => a.status === 'PENDING').length}명
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    • <strong>의료전문가</strong>: 승인 시 모든 학생 검색 및 임상 데이터 열람 권한 부여 <br />
                    • <strong>학생지도전문가</strong>: 승인 시 소속 학원에 가입된 학생 데이터만 전담 조회 권한 부여
                  </p>
                </div>

                {/* Filter Tabs & Issue Button */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowCreateExpertModal(true)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <span>+ 전문가 계정 직접 발급</span>
                  </button>

                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs shrink-0">
                    <button
                      onClick={() => setExpertFilter('pending')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${expertFilter === 'pending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      대기 중 ({expertAccounts.filter(a => a.status === 'PENDING').length})
                    </button>
                    <button
                      onClick={() => setExpertFilter('approved')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${expertFilter === 'approved' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      승인됨 ({expertAccounts.filter(a => a.status === 'APPROVED').length})
                    </button>
                    <button
                      onClick={() => setExpertFilter('all')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${expertFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      전체 ({expertAccounts.length})
                    </button>
                  </div>
                </div>
              </div>

              {/* Expert Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {expertAccounts
                  .filter(exp => expertFilter === 'all' ? true : expertFilter === 'pending' ? exp.status === 'PENDING' : exp.status === 'APPROVED')
                  .map(exp => (
                    <div
                      key={exp.id}
                      className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all ${exp.status === 'PENDING'
                        ? 'bg-amber-50/40 border-amber-300 shadow-sm'
                        : exp.status === 'APPROVED'
                          ? 'bg-white border-slate-200'
                          : 'bg-slate-50 border-rose-200 opacity-70'
                        }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${exp.role === 'MEDICAL_EXPERT'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                            }`}>
                            <span>{exp.role === 'MEDICAL_EXPERT' ? '👨‍⚕️ 의료전문가' : '🎓 학생지도전문가'}</span>
                          </span>

                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${exp.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : exp.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}>
                            {exp.status === 'PENDING' ? '⏳ 승인 대기' : exp.status === 'APPROVED' ? '✅ 승인 완료' : '❌ 반려됨'}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            {exp.name}
                            <span className="text-xs font-normal text-slate-500 font-mono">({exp.email})</span>
                          </h3>
                          <div className="text-xs text-slate-500 mt-0.5">📞 {exp.phone || '연락처 미등록'}</div>
                        </div>

                        {/* Role Details */}
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                          {exp.role === 'MEDICAL_EXPERT' ? (
                            <>
                              <div className="flex justify-between">
                                <span className="text-slate-500">병의원명:</span>
                                <span className="font-bold text-blue-700">{exp.clinicName || '미입력'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">면허번호:</span>
                                <span className="font-mono text-slate-800">{exp.medicalLicenseNumber || '미입력'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">진료과목:</span>
                                <span className="text-slate-700">{exp.medicalSpecialty || '소아청소년/정신건강'}</span>
                              </div>
                              <div className="pt-1 text-[11px] text-blue-700 font-medium">
                                🔓 권한 범위: <strong>전체 학생 검색 및 임상 분석</strong>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex justify-between">
                                <span className="text-slate-500">소속 학원:</span>
                                <span className="font-bold text-cyan-700">{exp.academyName || '미입력'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">직책/역할:</span>
                                <span className="text-slate-800">{exp.position || '원장/지도자'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">학원 소재지:</span>
                                <span className="text-slate-700">{exp.academyRegion || '대치동'}</span>
                              </div>
                              <div className="pt-1 text-[11px] text-cyan-700 font-medium">
                                🔒 권한 범위: <strong>[{exp.academyName || '소속 학원'}] 소속 학생만 열람</strong>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                        <span className="text-[10px] text-slate-400">
                          신청: {new Date(exp.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                        <div className="flex gap-2">
                          {exp.status === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => handleApproveExpert(exp.id)}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                              >
                                ✅ 가입 승인
                              </button>
                              <button
                                onClick={() => handleRejectExpert(exp.id)}
                                className="px-3.5 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 text-xs font-medium rounded-xl transition-all"
                              >
                                반려
                              </button>
                            </>
                          ) : exp.status === 'APPROVED' ? (
                            <button
                              onClick={() => handleRejectExpert(exp.id)}
                              className="px-3 py-1 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 text-xs rounded-lg transition-all"
                            >
                              권한 정지/반려
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApproveExpert(exp.id)}
                              className="px-3 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 border border-slate-200 text-xs rounded-lg transition-all"
                            >
                              재승인
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Modal: Create Approved Expert Account */}
            {showCreateExpertModal && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🔑</span>
                      <h3 className="text-base font-extrabold text-slate-900">전문가 계정 직접 발급 (즉시 승인)</h3>
                    </div>
                    <button
                      onClick={() => setShowCreateExpertModal(false)}
                      className="text-slate-400 hover:text-slate-600 font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    {/* Role Selection */}
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">전문가 유형 *</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setNewExpRole('MEDICAL_EXPERT')}
                          className={`py-2 px-3 rounded-xl font-bold border transition-all text-center ${newExpRole === 'MEDICAL_EXPERT'
                            ? 'bg-blue-50 text-blue-700 border-blue-500 shadow-sm'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                          👨‍⚕️ 의료전문가
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewExpRole('ACADEMY_EXPERT')}
                          className={`py-2 px-3 rounded-xl font-bold border transition-all text-center ${newExpRole === 'ACADEMY_EXPERT'
                            ? 'bg-cyan-50 text-cyan-700 border-cyan-500 shadow-sm'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                          🎓 학원·컨설턴트
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1">전문가 성함 *</label>
                      <input
                        type="text"
                        placeholder="예: 김도현 원장, 박서준 전략소장"
                        value={newExpName}
                        onChange={e => setNewExpName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1">로그인 이메일 (계정 ID) *</label>
                      <input
                        type="email"
                        placeholder="예: doctor.kim@clinic.com"
                        value={newExpEmail}
                        onChange={e => setNewExpEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1">연락처</label>
                      <input
                        type="text"
                        placeholder="예: 010-8888-1234"
                        value={newExpPhone}
                        onChange={e => setNewExpPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1">
                        {newExpRole === 'MEDICAL_EXPERT' ? '소속 병의원명' : '소속 학원명'}
                      </label>
                      <input
                        type="text"
                        placeholder={newExpRole === 'MEDICAL_EXPERT' ? '예: 연세마인드 인지학습 클리닉' : '예: 시대인재 (대치)'}
                        value={newExpOrg}
                        onChange={e => setNewExpOrg(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1">
                        {newExpRole === 'MEDICAL_EXPERT' ? '의사면허번호 / 진료과목' : '직책 / 역할'}
                      </label>
                      <input
                        type="text"
                        placeholder={newExpRole === 'MEDICAL_EXPERT' ? '예: MD-108293' : '예: 입시전략센터장, 원장'}
                        value={newExpDetail}
                        onChange={e => setNewExpDetail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-[11px] text-blue-700">
                      💡 발급 즉시 <strong>[승인 완료 (APPROVED)]</strong> 상태가 되며, 해당 이메일로 전용 대시보드에 즉시 로그인할 수 있습니다.
                    </div>

                    {/* Kakao Auto Send Checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer p-3 bg-amber-50/80 border border-amber-200/90 rounded-2xl hover:bg-amber-100/60 transition-all">
                      <input
                        type="checkbox"
                        checked={autoSendKakaoOnCreateExp}
                        onChange={e => setAutoSendKakaoOnCreateExp(e.target.checked)}
                        className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                      />
                      <div className="flex-1">
                        <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-[#FEE500] text-[#3C1E1E] text-[10px] font-black">TALK</span>
                          카카오톡 알림톡 즉시 발송
                        </span>
                        <div className="text-[10px] text-amber-800/80 mt-0.5">
                          전문가 연락처로 포털 접속 링크 및 임시 비밀번호를 카카오톡으로 자동 전송합니다.
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      onClick={() => setShowCreateExpertModal(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all text-xs"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleCreateExpertAccount}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md text-xs"
                    >
                      계정 즉시 발급 &amp; 승인
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Section 2: Marketing Content Approvals */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">📢 자동 생성 마케팅 콘텐츠 승인 큐</h2>
                  <span className="text-xs text-slate-500">오너의 승인 즉시 네이버 블로그/메타/인스타에 자동 배포됩니다.</span>
                </div>
              </div>

              {approvalList.map(item => (
                <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {item.type}
                      </span>
                      <span className="text-xs text-slate-500">타겟: {item.target}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 font-mono">
                      {item.snippet}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                        >
                          1-클릭 승인 & 배포
                        </button>
                        <button
                          onClick={() => handleReject(item.id)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors border border-slate-200"
                        >
                          거절 / 수정
                        </button>
                      </>
                    ) : (
                      <span className={`px-4 py-2 text-xs font-bold rounded-xl ${item.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                        {item.status === 'approved' ? '✅ 승인 및 자동 발행 완료' : '❌ 반려됨'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* Tab 3: Marketing & Budget */}
        {activeTab === 'marketing' && (
          <div className="space-y-6">

            {/* Kakao Talk Marketing Integration Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border border-amber-300 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-xl bg-[#FEE500] text-[#3C1E1E] font-black text-xs shadow-sm flex items-center gap-1 shrink-0">
                  <span>💬</span> TALK
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">AI 마케팅 &amp; 진단 리드 카카오톡 알림톡 연계</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${kakaoConfig.autoSendOnDiagnosticComplete ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-600'}`}>
                      진단 완료 즉시 발송 {kakaoConfig.autoSendOnDiagnosticComplete ? 'ON' : 'OFF'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${kakaoConfig.autoSendRetentionFunnel ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-600'}`}>
                      2주 리텐션 퍼널 {kakaoConfig.autoSendRetentionFunnel ? 'ON' : 'OFF'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                      {kakaoConfig.isSandbox ? '샌드박스(테스트)' : '실서버 모드'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    성향 진단을 마친 학부모에게 AI 3분 분석 리포트 요약 및 D+7, D+14일 리텐션 알림톡이 자동 발송됩니다.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('kakao')}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all text-xs shrink-0 shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>⚙️</span> 카카오 연계 설정 관리 →
              </button>
            </div>

            {/* 50만원 예산 분배 현황 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">일 {dailyBudget.toLocaleString()}원 광고 & 바이럴 스마트 분배</h2>
                  <p className="text-xs text-slate-500">AI가 성과(ROAS) 기반으로 4개 채널 실시간 비딩을 자동 조율합니다.</p>
                </div>
                <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-700">
                  ROAS 목표: 350%+
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {budgetPlan.channelBreakdown.map((ch, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-500 mb-2">{ch.channel}</div>
                      <div className="text-xl font-black text-slate-900">₩{ch.budget.toLocaleString()}</div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-500">비중</span>
                      <span className="font-bold text-indigo-600">
                        {Math.round((ch.budget / budgetPlan.totalBudgetKRW) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AEO / GEO 즉시 생성기 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-2">⚡ 실시간 AEO / GEO 콘텐츠 AI 생성 테스트</h3>
              <p className="text-xs text-slate-500 mb-4">OpenRouter를 통해 생성형 AI 검색 엔진(Perplexity/SearchGPT) 인용용 원고를 즉시 생성합니다.</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {AEO_GEO_TOPICS.map((topic, i) => (
                  <button
                    key={i}
                    disabled={isGenerating}
                    onClick={() => handleGenerateFreshAsset(i)}
                    className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 transition-colors shadow-sm"
                  >
                    ✨ {topic.topic}
                  </button>
                ))}
              </div>

              {isGenerating && (
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center text-sm text-indigo-600 font-bold animate-pulse">
                  🤖 OpenRouter 멀티 모델을 통해 AEO/GEO 최적화 카피 생성 중...
                </div>
              )}

              {generatedOutput && !isGenerating && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-emerald-700">생성 완료 (AEO 스니펫 포함)</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedOutput);
                        alert('복사되었습니다.');
                      }}
                      className="text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 bg-white border border-slate-200 rounded-md font-medium shadow-sm"
                    >
                      전체 복사
                    </button>
                  </div>
                  <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans max-h-72 overflow-y-auto bg-white p-3 rounded-lg border border-slate-200">
                    {generatedOutput}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Affiliated Academies */}
        {activeTab === 'academies' && (
          <div className="space-y-6">
            {/* Add Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">🏫 제휴 학원 / 학교 등록</h2>
              <p className="text-xs text-slate-500 mb-5">등록된 학원만 학생 등록 화면에서 드롭다운으로 선택됩니다. localStorage + Supabase 이중 저장.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="학원/학교 이름 (예: 시대인재 대치점)"
                  value={newAcademyName}
                  onChange={e => { setNewAcademyName(e.target.value); setAcademyError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleAddAcademy()}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
                />
                <input
                  type="text"
                  placeholder="지역 (예: 대치동, 목동)"
                  value={newAcademyRegion}
                  onChange={e => setNewAcademyRegion(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddAcademy()}
                  className="w-full sm:w-40 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
                />
                <button
                  onClick={handleAddAcademy}
                  disabled={isAddingAcademy || !newAcademyName.trim()}
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-all active:scale-95 shadow-sm"
                >
                  {isAddingAcademy ? '추가 중...' : '+ 추가'}
                </button>
              </div>
              {academyError && (
                <p className="mt-2 text-xs text-rose-600 font-medium">{academyError}</p>
              )}
            </div>

            {/* Academy List */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4">등록된 제휴 학원 목록 ({academies.length}개)</h3>
              {academies.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="text-4xl mb-3">🏫</div>
                  <p className="font-medium text-slate-600">아직 등록된 제휴 학원/학교가 없습니다.</p>
                  <p className="text-xs mt-1">위 입력란에서 추가해 주세요.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {academies
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
                    .map(academy => (
                      <div
                        key={academy.id}
                        className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl group hover:border-cyan-300 transition-colors"
                      >
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{academy.name}</p>
                          {academy.region && (
                            <p className="text-xs text-slate-500 mt-0.5">📍 {academy.region}</p>
                          )}
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            등록일: {new Date(academy.addedAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveAcademy(academy.id)}
                          className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* SQL DDL Hint for Supabase setup */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <h4 className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1.5">
                <span>⚙️</span> Supabase 테이블 생성 SQL (최초 1회)
              </h4>
              <pre className="text-[11px] text-slate-600 overflow-x-auto leading-relaxed whitespace-pre-wrap bg-white p-3 rounded-xl border border-slate-200 font-mono">{`create table affiliated_academies (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  region     text,
  added_by   uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table affiliated_academies enable row level security;
create policy "public read" on affiliated_academies for select using (true);
create policy "owner write" on affiliated_academies for all
  using (auth.uid() = added_by) with check (auth.uid() = added_by);`}</pre>
            </div>
          </div>
        )}

        {/* Tab 4: Exceptions */}
        {activeTab === 'exceptions' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-lg font-bold text-slate-900">현재 대기 중인 예외 및 긴급 CS가 없습니다.</h3>
            <p className="text-xs text-slate-500 mt-1">24시간 고객지원 AI 챗봇이 모든 문의에 자동 응대 중입니다.</p>
          </div>
        )}

        {/* Tab 5: User Tier Management (무료 가입자 등급 부여) */}
        {activeTab === 'user_tiers' && (
          <div className="space-y-6">
            {/* Top Banner */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">👑</span>
                    <h2 className="text-xl font-extrabold text-slate-900">오너 전용: 무료 가입자 등급 & 전 기능 사용 권한 조정</h2>
                    <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                      실시간 즉시 적용
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    • 무료 가입자라도 오너가 그 회원(학생/학부모)의 등급을 <strong className="text-amber-700">PREMIUM(모든 기능 사용 가능)</strong>으로 변경하면 전 기능 잠금이 즉시 해제됩니다.<br />
                    • <strong className="text-emerald-700">연습001 (ID: ID-20260820-6RKR)</strong> 회원 등 아래 목록에서 클릭 한 번으로 등급을 부여할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Featured Highlight Card: 연습001 (ID: ID-20260820-6RKR) */}
            <div className="bg-gradient-to-r from-amber-50/70 via-white to-indigo-50/70 border-2 border-amber-300 rounded-2xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-bl-xl uppercase tracking-wider shadow-sm">
                🎯 지정 요구사항 회원의 설정 상태
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-black">
                      요구사항 지정 ID
                    </span>
                    <span className="text-xs text-slate-500 font-mono">ID: ID-20260820-6RKR</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                    연습001
                    <span className="text-sm font-bold text-amber-800 bg-amber-100 border border-amber-300 px-3 py-0.5 rounded-full">
                      💎 PREMIUM (모든 기능 사용 가능)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600">
                    현재 상태: <span className="text-emerald-700 font-bold">오너 특별 승인 완료</span> — 무료 회원 제한(7일 히스토리 제한, Paywall) 없이 <strong className="text-amber-700">모든 기능</strong>을 사용 가능합니다.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    onClick={() => handleGrantTier('ID-20260820-6RKR', 'premium', '연습001', 'Premium 등급 조정')}
                    className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
                  >
                    💎 Premium
                  </button>
                  <button
                    onClick={() => handleGrantTier('ID-20260820-6RKR', 'free', '연습001', 'Free 등급 전환')}
                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all border border-slate-200"
                  >
                    🌱 Free
                  </button>
                </div>
              </div>
            </div>

            {/* Featured Highlight Card: limsd7 */}
            <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white border-2 border-blue-400 rounded-2xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-bl-xl uppercase tracking-wider shadow-sm">
                ⚡ PRO 정밀 진단 스타터 패스 수험생
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 border border-blue-300 rounded-xl text-xs font-black">
                      개발자/수험생 지정 계정
                    </span>
                    <span className="text-xs text-slate-500 font-mono">ID: limsd7</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                    limsd7
                    <span className="text-sm font-bold text-blue-800 bg-blue-100 border border-blue-300 px-3 py-0.5 rounded-full">
                      ⚡ {tierOverrides['limsd7']?.tier ? tierOverrides['limsd7'].tier.toUpperCase() : 'PRO'} (정밀 진단 스타터 패스)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600">
                    현재 상태: <span className="text-blue-700 font-bold">오너 승인 완료</span> — 뇌피로 집중곤란 신경인지 정밀 진단 2회 기록 보유 및 PRO 맞춤 처방전 사용 중
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    onClick={() => handleGrantTier('limsd7', 'pro', 'limsd7', 'PRO 1회 스타터 패스 (오너 승인)')}
                    className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-xl text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                  >
                    <span>⚡</span> PRO 부여
                  </button>
                  <button
                    onClick={() => handleGrantTier('limsd7', 'premium', 'limsd7', 'Premium 승급')}
                    className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
                  >
                    💎 Premium
                  </button>
                  <button
                    onClick={() => handleGrantTier('limsd7', 'expert', 'limsd7', 'EXPERT 오류검증 모드')}
                    className="px-3.5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
                  >
                    🛠️ Expert
                  </button>
                </div>
              </div>
            </div>

            {/* Manual Quick Grant Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>➕</span> 임의 회원 ID / 이름 직접 지정 등급 부여
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="학생 ID (예: ID-20260820-6RKR)"
                  value={manualIdInput}
                  onChange={e => setManualIdInput(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
                <input
                  type="text"
                  placeholder="학생 이름 (예: 연습001)"
                  value={manualNameInput}
                  onChange={e => setManualNameInput(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
                <select
                  value={manualTierInput}
                  onChange={e => setManualTierInput(e.target.value as MembershipTier)}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                >
                  <option value="premium">💎 PREMIUM (정기구독·전기능)</option>
                  <option value="pro">⚡ PRO (1회 스타터 패스)</option>
                  <option value="free">🌱 FREE (기본 무료 진단)</option>
                </select>
                <button
                  onClick={() => {
                    const idToUse = manualIdInput.trim() || `ID-${Date.now()}`;
                    handleGrantTier(idToUse, manualTierInput, manualNameInput, '오너 수동 입력 승인');
                    setManualIdInput('');
                    setManualNameInput('');
                  }}
                  disabled={!manualIdInput.trim() && !manualNameInput.trim()}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-all active:scale-95 shadow-sm"
                >
                  권한 부여 / 등급 적용
                </button>
              </div>
            </div>

            {/* Searchable Student List */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">등록 회원 및 검사 이력 학생 목록</h3>
                  <p className="text-xs text-slate-500">목록에서 등급을 변경하면 해당 회원에게 전 기능 이용 권한이 부여됩니다.</p>
                </div>
                <input
                  type="text"
                  placeholder="ID 또는 이름 검색..."
                  value={tierSearch}
                  onChange={e => setTierSearch(e.target.value)}
                  className="px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 w-full sm:w-64 focus:bg-white"
                />
              </div>

              <div className="space-y-3">
                {historyStudents
                  .filter(st => !tierSearch.trim() || st.name.toLowerCase().includes(tierSearch.toLowerCase()) || st.id.toLowerCase().includes(tierSearch.toLowerCase()))
                  .map(st => {
                    const currentEffectiveTier = UserTierService.getEffectiveTier(st.id || st.name, st.tier);
                    const isTopTier = currentEffectiveTier === 'premium';
                    const tierKey: string = currentEffectiveTier;
                    return (
                      <div
                        key={st.id}
                        className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${isTopTier
                          ? 'bg-indigo-50/50 border-indigo-300 shadow-sm'
                          : 'bg-white border-slate-200'
                          }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{st.name}</span>
                            <span className="text-xs text-slate-500 font-mono">({st.id})</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${isTopTier
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                              : tierKey === 'expert'
                                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                : tierKey === 'pro'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}>
                              {TIER_INFO[currentEffectiveTier]?.name || currentEffectiveTier.toUpperCase()}
                            </span>
                          </div>
                          {st.date && (
                            <div className="text-[11px] text-slate-400">최근 검사일: {st.date}</div>
                          )}
                        </div>

                        {/* Tier Change Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                          <button
                            onClick={() => handleGrantTier(st.id, 'premium', st.name, '오너 승인 (Premium)')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentEffectiveTier === 'premium'
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-slate-100 hover:bg-indigo-100 text-indigo-800 border border-slate-200'
                              }`}
                          >
                            💎 Premium
                          </button>
                          <button
                            onClick={() => handleGrantTier(st.id, 'pro', st.name, '오너 승인 (Pro)')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentEffectiveTier === 'pro'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-slate-100 hover:bg-blue-100 text-blue-800 border border-slate-200'
                              }`}
                          >
                            ⚡ Pro
                          </button>
                          <button
                            onClick={() => handleGrantTier(st.id, 'free', st.name, '기본 등급')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${currentEffectiveTier === 'free'
                              ? 'bg-slate-200 text-slate-800 font-bold'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                              }`}
                          >
                            🌱 Free
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Supabase Cloud DB & Migration */}
        {activeTab === 'supabase_db' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Overview Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl">
                    ⚡
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      Supabase Cloud DB 실시간 연동 & 마이그레이션 센터
                      {supabaseStatus.checked ? (
                        supabaseStatus.connected ? (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold border border-emerald-300">
                            🟢 연결 성공 {supabaseStatus.latencyMs ? `(${supabaseStatus.latencyMs}ms)` : ''}
                          </span>
                        ) : (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold border border-rose-300">
                            🔴 연결 실패
                          </span>
                        )
                      ) : (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-300">
                          🟡 상태 미확인
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      로컬 IndexedDB에 분산된 학생 바이오마커·검사 기록을 Supabase PostgreSQL 클라우드로 통합 동기화합니다.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleTestConnection}
                    disabled={supabaseStatus.testing}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                  >
                    {supabaseStatus.testing ? '📡 핑 테스트 중...' : '📡 실시간 연결 테스트'}
                  </button>
                  <button
                    onClick={handleSaveSupabaseConfig}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                  >
                    💾 설정 저장
                  </button>
                </div>
              </div>

              {/* Status Message */}
              {supabaseStatus.message && (
                <div className={`mt-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${supabaseStatus.connected
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : supabaseStatus.checked
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-slate-50 text-slate-600 border border-slate-200'
                  }`}>
                  <span>{supabaseStatus.connected ? '✅' : supabaseStatus.checked ? '⚠️' : 'ℹ️'}</span>
                  <span>{supabaseStatus.message}</span>
                </div>
              )}
            </div>

            {/* Connection Credentials Form */}
            {/* Realtime 동기화 상태 진단 패널 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                  <span>🛰️</span> 실시간 동기화 상태
                  {realtimeStatus === 'connected' && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold border border-emerald-300">🟢 Realtime 연결됨</span>
                  )}
                  {realtimeStatus === 'connecting' && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold border border-amber-300">🟡 Realtime 연결 중</span>
                  )}
                  {realtimeStatus === 'disabled' && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-300">⚪ Realtime 꺼짐 (키 미설정)</span>
                  )}
                  {realtimeStatus === 'error' && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold border border-rose-300">🔴 Realtime 오류</span>
                  )}
                  {realtimeStatus === 'closed' && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-300">⚪ Realtime 종료됨</span>
                  )}
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={handleManualPull}
                    disabled={syncBusy}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                  >
                    ⬇ 지금 내려받기
                  </button>
                  <button
                    onClick={handleManualPush}
                    disabled={syncBusy}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                  >
                    ⬆ 지금 올리기
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 font-mono break-all">
                endpoint: {(() => { try { return new URL(getSupabaseConfig().url).host; } catch { return getSupabaseConfig().url || '(미설정)'; } })()}
                {' '}· key: {keyFormat(getSupabaseConfig().key)}
              </div>

              {syncMsg && (
                <div className="p-2.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                  {syncMsg}
                </div>
              )}

              {diagTables.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {diagTables.map(t => (
                    <div
                      key={t.table}
                      title={t.ok ? `${t.latencyMs ?? 0}ms` : t.error}
                      className={`px-2.5 py-2 rounded-xl text-[11px] font-bold border truncate ${t.ok
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'}`}
                    >
                      {t.ok ? '✅' : '❌'} {t.table}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400">
                  테이블 준비 상태 미확인 — 상단의 [📡 실시간 연결 테스트]를 눌러 10개 동기화 테이블을 점검하세요. ❌가 있으면 해당 SQL이 Supabase에 미실행된 것입니다.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>🔐</span> Supabase 자격증명 (Credentials)
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Supabase Project URL</label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={e => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyz.supabase.co"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">프로젝트 엔드포인트 URL</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Supabase Publishable / Anon API Key</label>
                  <input
                    type="text"
                    value={supabaseKey}
                    onChange={e => setSupabaseKey(e.target.value)}
                    placeholder="sb_publishable_..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">클라이언트 공개 API 키 (RLS 보안 적용)</p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSaveSupabaseConfig}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                  >
                    설정 저장 및 즉시 반영
                  </button>
                </div>
              </div>

              {/* Live Migration Engine */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>🚀</span> 로컬 IndexedDB ➔ Supabase 클라우드 일괄 마이그레이션
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    현재 브라우저에 저장된 모든 학생 프로필, 검사 기록, 생체 바이오마커 데이터를 클라우드 `assessments` 테이블로 자동 업로드합니다.
                  </p>
                </div>

                {migrationProgress.total > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>진행률 ({migrationProgress.current}/{migrationProgress.total})</span>
                      <span>{Math.round((migrationProgress.current / migrationProgress.total) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${(migrationProgress.current / migrationProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Log Box */}
                {migrationLog.length > 0 && (
                  <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl text-[11px] font-mono max-h-36 overflow-y-auto space-y-1">
                    {migrationLog.map((log, idx) => (
                      <div key={idx}>{log}</div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleMigrateToSupabase}
                  disabled={migrationRunning}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-emerald-900/20"
                >
                  {migrationRunning ? '⏳ 데이터 일괄 업로드 진행 중...' : '🚀 IndexedDB 데이터 전체 클라우드로 전송 (마이그레이션 시작)'}
                </button>
              </div>
            </div>

            {/* DDL SQL Schema Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <span>📜</span> Supabase SQL Editor 실행용 DDL 스키마 (최초 1회 설정)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Supabase 대시보드 &gt; SQL Editor에 아래 스크립트를 붙여넣고 [Run]을 누르시면 모든 테이블과 RLS 보안 정책이 자동 구축됩니다.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const sql = `-- NBASS Supabase Core Schema
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name TEXT NOT NULL,
    student_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    survey_data JSONB,
    hrv_data JSONB,
    protocol_data JSONB,
    classification_result JSONB,
    care_type TEXT,
    care_score NUMERIC,
    study_efficiency_data JSONB,
    analysis_text TEXT,
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.affiliated_academies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    region TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliated_academies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read academies" ON public.affiliated_academies FOR SELECT USING (true);
CREATE POLICY "Allow public insert assessments" ON public.assessments FOR ALL USING (true);
CREATE POLICY "Allow public read assessments" ON public.assessments FOR SELECT USING (true);`;
                    navigator.clipboard.writeText(sql);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2500);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  {isCopied ? '✅ 복사 완료!' : '📋 SQL 전체 복사'}
                </button>
              </div>

              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-56">
                {`-- 1. Assessments 테이블 (검사 결과 및 바이오마커 저장)
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name TEXT NOT NULL,
    student_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    survey_data JSONB,
    hrv_data JSONB,
    protocol_data JSONB,
    classification_result JSONB,
    care_type TEXT,
    care_score NUMERIC,
    study_efficiency_data JSONB,
    analysis_text TEXT,
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. RLS 활성화 & 정책 생성
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read assessments" ON public.assessments FOR SELECT USING (true);
CREATE POLICY "Allow public insert assessments" ON public.assessments FOR ALL USING (true);`}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 8: System Configuration Studio (⚙️ 시스템 통합 설정) */}
        {activeTab === 'system_config' && (
          <div className="space-y-6">
            {/* Top Studio Hero Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold mb-3">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                    NBASS Master Control Studio
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                    <span>⚙️</span> NBASS 통합 시스템 설정 스튜디오
                  </h2>
                  <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
                    과거 결과 화면 우측 상단에 위치했던 <strong>설정(⚙️)</strong> 버튼의 10대 핵심 기능(로직 엔진 판별 임계값, AI 모델 API 키, 수험생 CareType 학습 전략, 영양 처방 및 PNT 몰 추천, 다차원 위험 예측 규칙, 특허 분석, 매뉴얼)을 오너 대시보드 내부에서 완벽하게 통합 관제하고 실시간 제어합니다.
                  </p>
                </div>
                <div className="shrink-0 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => openConfigModalWithTab('general')}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-sm shadow-xl shadow-indigo-600/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>🚀 전체 설정 팝업(ConfigModal) 열기</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Studio Grid: Major Feature Suites */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Suite 1: 일반 환경 및 보안 관리 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>🛡️</span> 1. 일반 환경 및 보안 관리
                    </h3>
                    <button
                      onClick={() => openConfigModalWithTab('general')}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      전체 관리 팝업 ↗
                    </button>
                  </div>
                  <div className="space-y-4 text-xs">
                    {/* Exam Mode Toggle */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                      <div>
                        <div className="font-bold text-slate-800">시험 대비 모드 (Exam Mode)</div>
                        <div className="text-[11px] text-slate-500">수험생 전용 빠른 진단 및 집중 요약 UI 제공</div>
                      </div>
                      <button
                        onClick={() => handleConfigUpdate({ ...currentConfig, isExamMode: !currentConfig.isExamMode })}
                        className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${currentConfig.isExamMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${currentConfig.isExamMode ? 'translate-x-6' : ''}`} />
                      </button>
                    </div>

                    {/* Show Detail Toggle */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                      <div>
                        <div className="font-bold text-slate-800">상세 설명 모드 (Show Detail)</div>
                        <div className="text-[11px] text-slate-500">생체 바이오마커 및 의학적 해석 상세 문구 표출</div>
                      </div>
                      <button
                        onClick={() => handleConfigUpdate({ ...currentConfig, showDetail: !currentConfig.showDetail })}
                        className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${currentConfig.showDetail ? 'bg-indigo-600' : 'bg-slate-300'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${currentConfig.showDetail ? 'translate-x-6' : ''}`} />
                      </button>
                    </div>

                    {/* Master Password Setting */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">오너 / 관리자 마스터 비밀번호</span>
                        {savePwNotice && <span className="text-[11px] text-emerald-600 font-bold animate-pulse">{savePwNotice}</span>}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          placeholder="새 마스터 비밀번호 입력"
                          value={masterPwInput}
                          onChange={(e) => setMasterPwInput(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
                        />
                        <button
                          onClick={handleSaveMasterPassword}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors shrink-0 cursor-pointer"
                        >
                          저장
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        * 결과 화면의 설정(⚙️) 진입 및 관리자 포털 인증 시 사용됩니다.
                      </p>
                    </div>

                    {/* Registered Examiners */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800">평가자(Examiner) 등록 현황</span>
                        <div className="text-[11px] text-slate-500">
                          총 {currentConfig.examiners?.length || 0}명의 검사관 및 전문의 등록됨
                        </div>
                      </div>
                      <button
                        onClick={() => openConfigModalWithTab('general')}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                      >
                        평가자 관리 👥
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suite 2: 로직 엔진 판별 임계값 (Logic Engine Thresholds) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>🧠</span> 2. 로직 엔진 판별 임계값
                    </h3>
                    <div className="flex items-center gap-2">
                      {saveThresholdNotice && (
                        <span className="text-xs text-emerald-600 font-bold animate-pulse">{saveThresholdNotice}</span>
                      )}
                      <button
                        onClick={() => openConfigModalWithTab('logic')}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        규칙 상세 팝업 ↗
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    {/* snsHigh */}
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-rose-700">SNS High (교감 과활성 / 긴장 기준)</span>
                        <span className="font-mono font-bold text-slate-800">{quickThresholds.snsHigh ?? 60}%</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="80"
                        value={quickThresholds.snsHigh ?? 60}
                        onChange={(e) => setQuickThresholds(prev => ({ ...prev, snsHigh: Number(e.target.value) }))}
                        className="w-full accent-rose-600 cursor-pointer"
                      />
                    </div>

                    {/* snsLow */}
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-amber-700">SNS Low (교감 저활성 / 무기력 기준)</span>
                        <span className="font-mono font-bold text-slate-800">{quickThresholds.snsLow ?? 30}%</span>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="45"
                        value={quickThresholds.snsLow ?? 30}
                        onChange={(e) => setQuickThresholds(prev => ({ ...prev, snsLow: Number(e.target.value) }))}
                        className="w-full accent-amber-600 cursor-pointer"
                      />
                    </div>

                    {/* pnsLow */}
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-indigo-700">PNS Low (부교감 저하 / 회복불량 기준)</span>
                        <span className="font-mono font-bold text-slate-800">{quickThresholds.pnsLow ?? 20}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="40"
                        value={quickThresholds.pnsLow ?? 20}
                        onChange={(e) => setQuickThresholds(prev => ({ ...prev, pnsLow: Number(e.target.value) }))}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>

                    {/* brainScoreLow */}
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-purple-700">두뇌 종합 점수 저하 기준 (Brain Score Low)</span>
                        <span className="font-mono font-bold text-slate-800">{quickThresholds.brainScoreLow ?? 45}점</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="70"
                        value={quickThresholds.brainScoreLow ?? 45}
                        onChange={(e) => setQuickThresholds(prev => ({ ...prev, brainScoreLow: Number(e.target.value) }))}
                        className="w-full accent-purple-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={handleResetLogicConfig}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    기본값 복원
                  </button>
                  <button
                    onClick={handleSaveThresholds}
                    className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    💾 임계값 즉시 저장
                  </button>
                </div>
              </div>

              {/* Suite 3: AI 모델 및 API 키 관제 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>🤖</span> 3. AI 모델 & API 키 관제
                    </h3>
                    <div className="flex items-center gap-2">
                      {saveAiNotice && (
                        <span className="text-xs text-emerald-600 font-bold animate-pulse">{saveAiNotice}</span>
                      )}
                      <button
                        onClick={() => openConfigModalWithTab('aimodel')}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        AI 설정 상세 ↗
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    {/* Gemini Key */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span>✨</span> Google Gemini API Key
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${quickAiKeys.geminiKey ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                          {quickAiKeys.geminiKey ? '연동됨' : '미등록'}
                        </span>
                      </div>
                      <input
                        type="password"
                        placeholder="AIzaSy..."
                        value={quickAiKeys.geminiKey}
                        onChange={(e) => setQuickAiKeys(prev => ({ ...prev, geminiKey: e.target.value }))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Sonnet Key */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span>🟣</span> Anthropic Claude Key
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${quickAiKeys.sonnetKey ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                          {quickAiKeys.sonnetKey ? '연동됨' : '미등록'}
                        </span>
                      </div>
                      <input
                        type="password"
                        placeholder="sk-ant-api..."
                        value={quickAiKeys.sonnetKey}
                        onChange={(e) => setQuickAiKeys(prev => ({ ...prev, sonnetKey: e.target.value }))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* OpenRouter Key */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span>🌐</span> OpenRouter Multi-Agent Key
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${quickAiKeys.openRouterKey ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                          {quickAiKeys.openRouterKey ? '연동됨' : '미등록'}
                        </span>
                      </div>
                      <input
                        type="password"
                        placeholder="sk-or-v1-..."
                        value={quickAiKeys.openRouterKey}
                        onChange={(e) => setQuickAiKeys(prev => ({ ...prev, openRouterKey: e.target.value }))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={handleSaveAiKeys}
                    className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    💾 API 키 일괄 저장
                  </button>
                </div>
              </div>

              {/* Suite 4: 5대 CareType별 맞춤 전략 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>🎯</span> 4. 5대 CareType별 맞춤 전략
                    </h3>
                    <button
                      onClick={() => openConfigModalWithTab('strategy')}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      전략 편집기 ↗
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 mb-3">
                    수험생 유형별 솔루션, 과목별 공부법, 집중력 처방을 맞춤형으로 편집합니다.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { type: CareType.BURNOUT, label: '번아웃 탈진형', color: 'rose' },
                      { type: CareType.ANXIETY_TENSION, label: '불안·긴장형', color: 'amber' },
                      { type: CareType.STRESS_OVERLOAD, label: '스트레스 과부하', color: 'red' },
                      { type: CareType.LOW_ENERGY, label: '무기력형', color: 'blue' },
                      { type: CareType.BRAIN_FATIGUE, label: '뇌피로 집중곤란', color: 'purple' },
                    ].map(item => (
                      <div
                        key={item.type}
                        onClick={() => {
                          handleEditingStrategyTypeUpdate(item.type);
                          openConfigModalWithTab('strategy');
                        }}
                        className="p-3 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 rounded-xl cursor-pointer transition-colors flex items-center justify-between group"
                      >
                        <span className="font-bold text-slate-800 group-hover:text-indigo-600">
                          {item.label}
                        </span>
                        <span className="text-[11px] text-indigo-500 font-bold">수정 ✏️</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>과목별 학습 옵션(국/영/수) 연동 완료</span>
                  <button
                    onClick={() => openConfigModalWithTab('subject')}
                    className="text-indigo-600 hover:underline font-bold cursor-pointer"
                  >
                    과목별 옵션 설정 ↗
                  </button>
                </div>
              </div>

              {/* Suite 5: 영양 처방전 & PNT 몰 제품 추천 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>💊</span> 5. 영양 처방 & PNT 몰 제품 매핑
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openConfigModalWithTab('prescriptions')}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                      >
                        영양 처방전 ↗
                      </button>
                      <button
                        onClick={() => openConfigModalWithTab('products')}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                      >
                        제품 추천 매핑 ↗
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mb-3">
                    CareType 및 바이오마커 결과에 따라 수험생에게 자동 매핑되는 메디컬 영양 처방전과 건강기능식품 목록입니다.
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
                      <span className="font-bold text-slate-800">번아웃 / 만성피로 솔루션</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold text-[11px]">슈퍼 아르기닌 6000 + 비타민 B군</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
                      <span className="font-bold text-slate-800">불안 / 수면장애 솔루션</span>
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-semibold text-[11px]">캄 슬립 + 고함량 킬레이트 마그네슘</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
                      <span className="font-bold text-slate-800">뇌혈류 / 집중력 솔루션</span>
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-semibold text-[11px]">노카디 징코 + rTG 오메가3</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => openConfigModalWithTab('products')}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    PNT 몰 제품 매핑 상세 관리
                  </button>
                </div>
              </div>

              {/* Suite 6: 위험 예측 룰 & 특허/매뉴얼 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>⚠️</span> 6. 다차원 위험 예측 & 특허/매뉴얼
                    </h3>
                    <button
                      onClick={() => openConfigModalWithTab('prediction')}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                    >
                      예측 룰 에디터 ↗
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-800">다차원 위험 예측 규칙 (Prediction Rules)</div>
                        <div className="text-[11px] text-slate-500">
                          {currentPredictionRules.length}개 위험 예측 룰 활성화됨 (과긴장, 집중력 고갈, 수면 붕괴 등)
                        </div>
                      </div>
                      <button
                        onClick={() => openConfigModalWithTab('prediction')}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        룰 편집
                      </button>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-800">NBASS 특허 기술 분석 (Patent Analysis)</div>
                        <div className="text-[11px] text-slate-500">
                          4단계 하이브리드 진단 엔진 및 특허 출원 명세서 검증
                        </div>
                      </div>
                      <button
                        onClick={() => openConfigModalWithTab('patent')}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        특허 뷰어
                      </button>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-800">컨설턴트 표준 상담 매뉴얼 (Manual Manager)</div>
                        <div className="text-[11px] text-slate-500">
                          학원장 및 의료 전문가용 수험생 가이드라인 파일 관리
                        </div>
                      </div>
                      <button
                        onClick={() => openConfigModalWithTab('manuals')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        매뉴얼 관리
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>모든 설정은 실시간 IndexedDB & Supabase에 자동 반영됩니다.</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 9: KakaoTalk Service Integration Settings */}
        {activeTab === 'kakao' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-400 rounded-3xl p-6 sm:p-8 text-slate-950 shadow-lg relative overflow-hidden">
              <div className="absolute right-4 -bottom-6 text-9xl opacity-10 font-black select-none pointer-events-none">
                TALK
              </div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-950/10 backdrop-blur-sm rounded-full text-xs font-black tracking-wide mb-2 text-slate-900 border border-slate-950/10">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                    NBASS 비즈니스 알림톡 &amp; 마케팅 게이트웨이
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 flex items-center gap-2.5">
                    <span className="p-1 px-2.5 rounded-2xl bg-[#FEE500] text-[#3C1E1E] text-lg font-black shadow">TALK</span>
                    카카오톡 서비스 연계 설정
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-800 font-medium mt-1.5 max-w-2xl leading-relaxed">
                    <strong>전문가 계정 발급(의료/학원)</strong> 즉시 안내 및 <strong>24시간 자율 AI 마케팅</strong> 진단 리드 알림톡, 2주 리텐션 퍼널을 실시간 중앙 통제합니다.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm text-xs">
                    <div className="text-[10px] text-slate-600 font-bold">발송 모드</div>
                    <div className="font-extrabold text-amber-900 flex items-center gap-1.5 mt-0.5">
                      <span className={`w-2 h-2 rounded-full ${kakaoConfig.isSandbox ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                      {kakaoConfig.isSandbox ? '샌드박스 (가상 테스트)' : '실서버 Live API'}
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm text-xs">
                    <div className="text-[10px] text-slate-600 font-bold">누적 발송 이력</div>
                    <div className="font-extrabold text-slate-900 mt-0.5">
                      {kakaoLogs.length}건 <span className="text-[10px] font-normal text-slate-500">(단가 ~₩8)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Toast Alert */}
            {kakaoToast && (
              <div className={`p-4 rounded-2xl border shadow-md flex items-center justify-between text-xs font-bold transition-all ${
                kakaoToast.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                <span>{kakaoToast.message}</span>
                <button onClick={() => setKakaoToast(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>
            )}

            {/* Main 2-Column Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* LEFT COLUMN: Configuration & Auto-Rules (7 cols) */}
              <div className="lg:col-span-7 space-y-6">

                {/* 1. API Gateway & Channel Profile */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🔌</span>
                      <h3 className="text-base font-extrabold text-slate-900">1. 알림톡 API &amp; 카카오 비즈니스 채널 연동</h3>
                    </div>
                    <button
                      onClick={handleTestKakaoConnection}
                      disabled={kakaoStatus.testing}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      <span>{kakaoStatus.testing ? '⏳' : '⚡'}</span>
                      {kakaoStatus.testing ? '테스트 중...' : '연결 핑 테스트'}
                    </button>
                  </div>

                  {kakaoStatus.message && kakaoStatus.message !== '연결 확인 대기' && (
                    <div className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between ${
                      kakaoStatus.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-900 border-amber-200'
                    }`}>
                      <span>{kakaoStatus.message}</span>
                      <span className="text-[10px] font-bold opacity-75">{kakaoStatus.success ? '정상 응답' : '확인 필요'}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">알림톡 중계 딜러사 *</label>
                      <select
                        value={kakaoConfig.provider}
                        onChange={e => handleSaveKakaoConfig({ provider: e.target.value as any })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                      >
                        <option value="aligo">알리고 (Aligo 알림톡 API) - 공식 권장</option>
                        <option value="kakao_biz">카카오 비즈메시지 직접 연동 (Kakao Biz)</option>
                        <option value="solapi">솔라피 (Solapi / 구 쿨에스엠에스)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1">카카오톡 채널 ID (@검색용 아이디) *</label>
                      <input
                        type="text"
                        placeholder="@nbass_neuro"
                        value={kakaoConfig.channelId}
                        onChange={e => handleSaveKakaoConfig({ channelId: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1">API Key (인증키) *</label>
                      <input
                        type="password"
                        placeholder="aligo_api_key_xxxxxxxx"
                        value={kakaoConfig.apiKey}
                        onChange={e => handleSaveKakaoConfig({ apiKey: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1">User ID (고유 계정 아이디) *</label>
                      <input
                        type="text"
                        placeholder="nbass_master"
                        value={kakaoConfig.userId}
                        onChange={e => handleSaveKakaoConfig({ userId: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1">발신 프로필 키 (Sender Key / 40자리) *</label>
                      <input
                        type="password"
                        placeholder="kakao_sender_profile_key_40chars..."
                        value={kakaoConfig.senderKey}
                        onChange={e => handleSaveKakaoConfig({ senderKey: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1">발신 대표번호 (사전 등록된 번호) *</label>
                      <input
                        type="text"
                        placeholder="02-1588-0000"
                        value={kakaoConfig.senderPhone}
                        onChange={e => handleSaveKakaoConfig({ senderPhone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Sandbox Mode Toggle */}
                  <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-amber-950 flex items-center gap-1.5 text-xs">
                        <span>🛡️</span> 샌드박스 (가상 시뮬레이션 발송) 모드
                      </div>
                      <div className="text-[11px] text-amber-800/80 mt-0.5">
                        ON 시 실제 알림톡 과금 및 API 호출 없이 가상 전송 및 발송 로그 저장만 안전하게 수행됩니다.
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                      <input
                        type="checkbox"
                        checked={kakaoConfig.isSandbox}
                        onChange={e => handleSaveKakaoConfig({ isSandbox: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                </div>

                {/* 2. Expert Account Issuance Rules */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">👨‍⚕️ 🎓</span>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900">2. 전문가 계정 발급 &amp; 승인 연계 규칙</h3>
                        <p className="text-xs text-slate-500">오너의 전문가 계정 생성 및 승인 큐 심사 시 카카오 알림톡 자동 발송을 제어합니다.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                          <span>🔑 전문가 계정 직접 발급 시 자동 발송</span>
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">임시비번 포함</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          오너가 [전문가 계정 직접 발급] 모달에서 계정을 생성하면, 전문가 휴대폰으로 접속 URL 및 임시 비밀번호가 즉시 발송됩니다.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={kakaoConfig.autoSendOnExpertCreated}
                          onChange={e => handleSaveKakaoConfig({ autoSendOnExpertCreated: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                          <span>✅ 가입 심사 대기 전문가 승인 시 축하 알림 발송</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">권한 활성화</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          [승인 큐] 탭에서 심사 대기 중인 전문가를 1-클릭 승인하면 자격 검증 완료 및 데이터 열람 권한 활성화 알림톡이 전송됩니다.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={kakaoConfig.autoSendOnExpertApproved}
                          onChange={e => handleSaveKakaoConfig({ autoSendOnExpertApproved: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
                    <span className="text-slate-600 font-medium">전문가 템플릿 실시간 미리보기 확인</span>
                    <button
                      onClick={() => setKakaoPreviewTemplate('EXPERT_ACCOUNT_ISSUED')}
                      className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-800 font-bold shadow-sm cursor-pointer"
                    >
                      말풍선 프리뷰 전환 ↗
                    </button>
                  </div>
                </div>

                {/* 3. AI Marketing & Lead Rules */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🚀 📢</span>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900">3. AI 마케팅 &amp; 수험생/학부모 리드 연계 규칙</h3>
                        <p className="text-xs text-slate-500">무료 진단 완료 리드 확보 및 유료 전환율 극대화를 위한 자동 알림톡 트리거입니다.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                          <span>📊 무료 성향 진단 완료 즉시 학부모 AI 3분 요약 리포트 발송</span>
                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold">리드 전환</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          검사를 마친 수험생의 학부모 연락처로 전두엽 인지 상태 및 3-Tier 맞춤 솔루션 링크를 알림톡으로 전송합니다.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={kakaoConfig.autoSendOnDiagnosticComplete}
                          onChange={e => handleSaveKakaoConfig({ autoSendOnDiagnosticComplete: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                          <span>🔄 PRO 미전환 회원 대상 2주 리텐션 퍼널 (맛보기 5회) 자동 가동</span>
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold">D+7 / D+14</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          1회 진단 후 정기구독으로 전환하지 않은 학부모에게 D+7일 주간 리포트 맛보기 및 D+14일 최종 구독 혜택 알림톡을 순차 예약 발송합니다.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={kakaoConfig.autoSendRetentionFunnel}
                          onChange={e => handleSaveKakaoConfig({ autoSendRetentionFunnel: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                      </label>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                          <span>🚨 정기결제 수험생 고위험 번아웃 감지 시 학부모 긴급 SOS Alert</span>
                          <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold">자율신경 이상</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          교감신경 과항진(SNS &gt; 75%) 또는 수면 회복 부전 감지 시 즉시 학부모에게 긴급 리셋 처방 알림톡을 발송합니다.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={kakaoConfig.autoSendBurnoutAlert}
                          onChange={e => handleSaveKakaoConfig({ autoSendBurnoutAlert: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Interactive Bubble Preview & Test Sender (5 cols) */}
              <div className="lg:col-span-5 space-y-6">

                {/* 4. Interactive Kakao Bubble Preview */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📱</span>
                      <h3 className="text-base font-extrabold text-slate-900">카카오톡 말풍선 실시간 프리뷰</h3>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold text-xs mb-1">미리보기 템플릿 선택</label>
                    <select
                      value={kakaoPreviewTemplate}
                      onChange={e => setKakaoPreviewTemplate(e.target.value as KakaoTemplateType)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                    >
                      <optgroup label="👨‍⚕️ 전문가 발급 &amp; 승인">
                        <option value="EXPERT_ACCOUNT_ISSUED">🔑 전문가 계정 직접 발급 (임시비번 안내)</option>
                        <option value="EXPERT_ACCOUNT_APPROVED">✅ 전문가 자격 심사 승인 완료 (권한 활성화)</option>
                      </optgroup>
                      <optgroup label="🚀 AI 마케팅 &amp; 진단 리드">
                        <option value="MARKETING_LEAD_SUMMARY">📊 무료 진단 완료 즉시 리포트 요약</option>
                        <option value="PRO_RETENTION_MOM_WEEKLY_1">🔄 2주 리텐션: 1주차 주간 리포트 맛보기</option>
                        <option value="PREMIUM_MOM_SUNDAY_REPORT">📅 정기 학부모 일요일 주간 브리핑</option>
                        <option value="PLUS_AI_CONSULTATION_MOM_SUMMARY">💬 AI 1:1 상담 직후 학부모 안심 브리핑</option>
                        <option value="VIP_BURNOUT_EMERGENCY_ALERT">🚨 고위험 번아웃 긴급 SOS Alert</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* Kakao Bubble Mockup */}
                  <div className="bg-[#B2C7DA] rounded-3xl p-4 shadow-inner">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/5 text-[11px] text-slate-700 font-bold">
                      <span className="flex items-center gap-1">
                        <span className="w-4 h-4 rounded bg-[#FEE500] text-[#3C1E1E] text-[9px] font-black flex items-center justify-center">TALK</span>
                        NBASS 수험생 뉴로-케어
                      </span>
                      <span className="text-[10px] text-slate-500">알림톡 도착</span>
                    </div>

                    {/* Speech Bubble */}
                    <div className="bg-white rounded-2xl p-4 shadow-md text-xs text-slate-800 space-y-3 leading-relaxed relative border border-slate-100">
                      <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 text-[11px] font-extrabold text-amber-900">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        [카카오 공식 인증 알림톡]
                      </div>

                      <div className="whitespace-pre-wrap font-sans text-xs text-slate-800">
                        {kakaoNotificationService.renderTemplatePreview(kakaoPreviewTemplate)}
                      </div>

                      {/* Interactive Button in Bubble */}
                      <div className="pt-2 border-t border-slate-100">
                        <div className="w-full py-2.5 bg-[#FEE500] hover:bg-[#FDD835] text-[#3C1E1E] font-black text-xs rounded-xl text-center shadow-sm transition-all cursor-pointer">
                          {kakaoPreviewTemplate.startsWith('EXPERT') ? '전문가 관제 포털 바로가기' : '자녀 심층 리포트 즉시 확인'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Direct Test Sender */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">⚡</span>
                      <h3 className="text-base font-extrabold text-slate-900">1-클릭 테스트 알림톡 발송기</h3>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {kakaoConfig.isSandbox ? '샌드박스 가상' : '실제 발송'}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">테스트 수신 번호</label>
                      <input
                        type="text"
                        placeholder="010-1234-5678"
                        value={kakaoTestPhone}
                        onChange={e => setKakaoTestPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1">발송할 템플릿</label>
                      <select
                        value={kakaoTestTemplate}
                        onChange={e => setKakaoTestTemplate(e.target.value as KakaoTemplateType)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                      >
                        <option value="EXPERT_ACCOUNT_ISSUED">🔑 [전문가] 계정 직접 발급 (임시비번)</option>
                        <option value="EXPERT_ACCOUNT_APPROVED">✅ [전문가] 자격 심사 승인 완료</option>
                        <option value="MARKETING_LEAD_SUMMARY">📊 [학부모] AI 무료 진단 3분 요약</option>
                        <option value="PRO_RETENTION_MOM_WEEKLY_1">🔄 [학부모] 2주 리텐션 맛보기 리포트</option>
                        <option value="VIP_BURNOUT_EMERGENCY_ALERT">🚨 [학부모] 고위험 번아웃 긴급 SOS</option>
                      </select>
                    </div>

                    <button
                      onClick={handleSendTestKakao}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>💬</span> 테스트 알림톡 즉시 발송
                    </button>
                  </div>
                </div>

                {/* 5-1. 주간 브리핑 실발송 (실측 델타 연결) */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📅</span>
                      <h3 className="text-base font-extrabold text-slate-900">주간 브리핑 실발송 (변화량 자동 반영)</h3>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      최근 2건 기록 자동 비교
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">대상 학생</label>
                      <select
                        value={sundayStudentId}
                        onChange={e => setSundayStudentId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">학생을 선택하세요</option>
                        {historyStudents.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.id}) · {s.tier}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1">학부모 수신 번호</label>
                      <input
                        type="text"
                        placeholder="010-1234-5678"
                        value={sundayPhone}
                        onChange={e => setSundayPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <button
                      onClick={handleSendSundayBriefing}
                      disabled={sundaySending}
                      className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span>📅</span> {sundaySending ? '발송 중...' : '주간 브리핑 실발송'}
                    </button>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      판정 완료 기록이 없으면 발송되지 않습니다. 자동 주간 스케줄러는 별도 서버 크론이 필요하며, 현재는 수동 발송만 지원합니다.
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* 6. Send Logs & Quotas Table */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📋</span>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">최근 알림톡 전송 이력 및 상태 로그</h3>
                    <p className="text-xs text-slate-500">전문가 발급, 가입 승인, AI 마케팅 리드 발송 내역이 실시간 기록됩니다.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">총 {kakaoLogs.length}건 기록</span>
                  <button
                    onClick={() => {
                      if (confirm('모든 알림톡 전송 로그를 초기화하시겠습니까?')) {
                        kakaoNotificationService.clearLogs();
                        setKakaoLogs([]);
                      }
                    }}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-all cursor-pointer"
                  >
                    로그 비우기
                  </button>
                </div>
              </div>

              {kakaoLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  전송된 알림톡 기록이 없습니다. 상단의 '테스트 알림톡 발송' 또는 '전문가 계정 발급'을 통해 발송을 시작하세요.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">전송 일시</th>
                        <th className="py-2.5 px-3">수신 대상</th>
                        <th className="py-2.5 px-3">수신자 / 연락처</th>
                        <th className="py-2.5 px-3">템플릿 유형</th>
                        <th className="py-2.5 px-3">발송 모드</th>
                        <th className="py-2.5 px-3">상태</th>
                        <th className="py-2.5 px-3 text-right">예상 단가</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {kakaoLogs.slice(0, 20).map((log, i) => (
                        <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-slate-500">
                            {new Date(log.sentAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.recipientType === 'expert'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : log.recipientType === 'parent'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {log.recipientType === 'expert' ? '의료/학원 전문가' : log.recipientType === 'parent' ? '학부모' : '수험생'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-800">{log.recipientName || '미지정'}</span>
                            <span className="text-[11px] text-slate-500 font-mono ml-1.5">({log.recipientPhone})</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-700">
                            {log.template}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.isSimulated
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}>
                              {log.isSimulated ? '샌드박스(가상)' : '실서버 Live'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <span>✓</span> 전송 성공
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                            ₩{log.costWon || 8}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 10: Grade Cutoffs & University Prediction DB Management */}
        {activeTab === 'cutoffs' && (
          <GradeCutoffsManager />
        )}
      </div>

      {/* Universal Config Modal Container */}
      {isConfigModalOpen && (
        <ConfigModal
          isOpen={isConfigModalOpen}
          activeTab={configModalTab}
          onTabChange={setConfigModalTab}
          onClose={() => setIsConfigModalOpen(false)}
          config={currentConfig}
          onConfigChange={handleConfigUpdate}
          strategies={currentStrategies}
          onStrategiesChange={handleStrategiesUpdate}
          prescriptions={currentPrescriptions}
          onPrescriptionsChange={handlePrescriptionsUpdate}
          editingStrategyType={currentEditingStrategyType}
          onEditingStrategyTypeChange={handleEditingStrategyTypeUpdate}
          selectedSubjectOptions={currentSelectedSubjectOptions}
          onSelectedSubjectOptionsChange={handleSelectedSubjectOptionsUpdate}
          isAdminUnlocked={true}
          onViewConsultantManual={() => openConfigModalWithTab('manuals')}
          logicConfig={currentLogicConfig}
          onLogicConfigChange={handleLogicConfigUpdate}
          onResetLogicConfig={handleResetLogicConfig}
          productRecommendations={currentProductRecommendations}
          onProductRecommendationsChange={handleProductRecommendationsUpdate}
          onResetProductRecommendations={handleResetProductRecommendations}
          predictionRules={currentPredictionRules}
          onPredictionRulesChange={handlePredictionRulesUpdate}
          onResetPredictionRules={handleResetPredictionRules}
          aiModels={currentAiModels}
          onAiModelsChange={handleAiModelsUpdate}
        />
      )}
    </div>
  );
};
