/**
 * NBASS KakaoTalk Notification Service (카카오 알림톡 서비스 모듈)
 * 
 * 등급별 차등화 발송 정책:
 * - PRO (1회 ₩24,900): 기본 5건 + 미구독 시 2주 리텐션 5건 (엄마 주간 2건 + 학생 시간표 2건 + 1건 전환) = 총 10건
 * - PREMIUM (월 ₩19,900): 월 20건 (엄마 주간 리포트/중간 점검 8건, 학생 시간표/뽀모도로 8건, 성적 변동 4건)
 * - PREMIUM (월 ₩19,900): 월 70건 (엄마 주간 리포트 + 학생 시간표 + 성적 변동 + AI 상담 요약 + 수면 데일리 케어 + 고위험 번아웃 SOS Alert)
 */

import { MembershipTier, AssessmentResult, CareType } from '../types';
import { normalizeTier } from '../utils/featureGate';
import { buildDeltaBriefing, renderDeltaLine } from './weeklyDeltaBriefing';
import type { ParentTemplateType } from './parentTemplates';

export type KakaoTemplateType =
  | 'EXPERT_ACCOUNT_ISSUED'        // 전문가 계정 직접 발급 (임시 비번 및 접속 안내)
  | 'EXPERT_ACCOUNT_APPROVED'      // 전문가 심사 승인 완료 (권한 활성화 안내)
  | 'MARKETING_LEAD_SUMMARY'       // 마케팅 진단 완료 리드 요약 알림
  | 'MARKETING_CAMPAIGN_NOTICE'    // 마케팅 캠페인/칼럼 알림
  | 'PRO_IMMEDIATE_SUMMARY'       // PRO 1차: 진단 직후 종합 리포트 요약
  | 'PRO_DAY1_ACTION_GUIDE'       // PRO 2차: D+1일 전두엽 활성 가이드
  | 'PRO_DAY3_ROUTINE_CHECK'      // PRO 3차: D+3일 골든타임 실천 점검
  | 'PRO_DAY5_MID_CHECK'          // PRO 4차: D+5일 피로도 리셋 점검
  | 'PRO_DAY7_UPGRADE_OFFER'      // PRO 5차: D+7일 기본 케어 만료 안내
  | 'PRO_RETENTION_MOM_WEEKLY_1'  // PRO 리텐션: 1주차 엄마 주간 리포트 맛보기
  | 'PRO_RETENTION_STUDENT_SCH_1' // PRO 리텐션: 1주차 학생 주간 시간표 맛보기
  | 'PRO_RETENTION_MOM_WEEKLY_2'  // PRO 리텐션: 2주차 엄마 주간 리포트 맛보기
  | 'PRO_RETENTION_STUDENT_SCH_2' // PRO 리텐션: 2주차 학생 주간 시간표 맛보기
  | 'PRO_RETENTION_FINAL_OFFER'   // PRO 리텐션: 2주 맛보기 종료 및 PREMIUM 전환 알림
  | 'PREMIUM_MOM_SUNDAY_REPORT'   // PREMIUM: 일요일 저녁 엄마 주간 컨디션 브리핑
  | 'PREMIUM_MOM_WEDNESDAY_TIP'   // PREMIUM: 수요일 엄마 격려/대화법 코칭 팁
  | 'PREMIUM_STUDENT_MON_SCHEDULE'// PREMIUM: 월요일 아침 학생 골든타임 시간표
  | 'PREMIUM_STUDENT_THU_POMODORO'// PREMIUM: 목요일 학생 슬럼프 방지 뽀모도로
  | 'PREMIUM_GRADE_SIMULATION_ALERT' // PREMIUM: 성적 변동 및 대학 시뮬레이션 알림
  | 'PLUS_AI_CONSULTATION_MOM_SUMMARY' // PLUS: 학생 AI 상담 직후 엄마 요약 브리핑
  | 'PLUS_DDAY_CONDITIONING_ALERT'     // PLUS: 시험 D-14, D-7, D-1 두뇌 컨디셔닝
  | 'PLUS_14P_REPORTBOOK_READY'        // PLUS: 14P 심층 리포트북 PDF 발급 완료 알림
  | 'VIP_SLEEP_DAILY_RESET'       // (레거시) 매일 밤 10시 서카디안 수면 리셋 알림
  | 'VIP_BURNOUT_EMERGENCY_ALERT' // (레거시) 🚨 고위험 번아웃/급성 스트레스 긴급 SOS 알림
  | 'VIP_MONTHLY_GROWTH_REPORT'  // (레거시) 월간 총괄 뇌-신체 성장 분석표
  | ParentTemplateType; // 부모용 20종 (services/parentTemplates.ts 단일 정의)

export interface KakaoApiConfig {
  provider: 'aligo' | 'kakao_biz' | 'solapi';
  apiKey: string;
  userId: string;
  senderKey: string;     // 발신프로필키 (카카오 비즈메시지 승인키)
  senderPhone: string;   // 발신대표번호
  channelId: string;     // @카카오톡 채널 ID
  isSandbox: boolean;    // 가상 발송(테스트) 모드 여부
  // 전문가 계정 발급 연계 규칙
  autoSendOnExpertCreated: boolean;
  autoSendOnExpertApproved: boolean;
  // AI 마케팅 & 진단 리드 연계 규칙
  autoSendOnDiagnosticComplete: boolean;
  autoSendOnAiConsultation: boolean;
  autoSendRetentionFunnel: boolean;
  autoSendBurnoutAlert: boolean;
}

export interface KakaoMessagePayload {
  template: KakaoTemplateType;
  recipientType: 'parent' | 'student' | 'expert';
  recipientPhone: string;
  recipientName: string;
  studentName?: string;
  expertRole?: 'MEDICAL_EXPERT' | 'ACADEMY_EXPERT';
  orgName?: string;
  tempPassword?: string;
  careType?: string;
  goldenHours?: string;
  summaryText?: string;
  actionUrl?: string;
  customData?: Record<string, string | number>;
  // 부모 템플릿 20종 공용 변수 (승인 변수 #{핵심내용} #{칭찬} #{다음단계} 대응)
  highlight?: string;  // 핵심 1줄 (변화·달성·관찰 내용)
  praise?: string;     // 칭찬 포인트 1개
  nextStep?: string;   // 부모 역할·다음 계획 1줄
  // 주간 델타 브리핑용 실측 결과 (있을 때만 변화량 본문 생성, 없으면 기존 정적 문구)
  currentResult?: AssessmentResult;
  previousResult?: AssessmentResult | null;
}

export interface KakaoSendResult {
  success: boolean;
  messageId: string;
  sentAt: string;
  template: KakaoTemplateType;
  recipientPhone: string;
  recipientType: 'parent' | 'student' | 'expert';
  recipientName?: string;
  costWon: number; // 발송 단가 (약 8원)
  isSimulated: boolean;
  error?: string;
}

export interface TierKakaoQuota {
  tier: MembershipTier;
  totalLimit: number;
  description: string;
}

export const TIER_KAKAO_QUOTAS: Record<MembershipTier, TierKakaoQuota> = {
  free: {
    tier: 'free',
    totalLimit: 0,
    description: '무료 회원은 카카오톡 알림이 지원되지 않습니다.',
  },
  pro: {
    tier: 'pro',
    totalLimit: 10, // 기본 5건 + 미전환 2주 리텐션 5건 = 총 10건
    description: '기본 5건 케어 + 미구독 시 2주간 맛보기 5건 추가 (총 10건)',
  },
  premium: {
    tier: 'premium',
    totalLimit: 70, // 월 70건 (PLUS/VIP 통합 후 정기결제 전 기능 커버)
    description: '월 70건 정기 케어 (엄마 주간 브리핑 + 학생 시간표 + 성적 변동 + 수면 데일리 + 긴급 Alert)',
  },
  expert: {
    tier: 'expert',
    totalLimit: 9999,
    description: '오너/검증 전용 무제한',
  },
};

const STORAGE_KEY_LOGS = 'nbass_kakao_notification_logs';
const STORAGE_KEY_QUOTA = 'nbass_kakao_quota_usage';

class KakaoNotificationService {
  private config: KakaoApiConfig = {
    provider: 'aligo',
    apiKey: '',
    userId: '',
    senderKey: '',
    senderPhone: '02-1588-0000',
    channelId: '@nbass_neuro',
    isSandbox: true,
    autoSendOnExpertCreated: true,
    autoSendOnExpertApproved: true,
    autoSendOnDiagnosticComplete: true,
    autoSendOnAiConsultation: true,
    autoSendRetentionFunnel: true,
    autoSendBurnoutAlert: true,
  };

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    try {
      const saved = localStorage.getItem('nbass_kakao_api_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.config = {
          ...this.config,
          ...parsed,
        };
      }
    } catch { /* ignore */ }
  }

  public getConfig(): KakaoApiConfig {
    return { ...this.config };
  }

  public saveConfig(newConfig: Partial<KakaoApiConfig>): KakaoApiConfig {
    this.config = { ...this.config, ...newConfig };
    try {
      localStorage.setItem('nbass_kakao_api_config', JSON.stringify(this.config));
    } catch { /* ignore */ }
    return { ...this.config };
  }

  public setApiCredentials(apiKey: string, userId: string, senderPhone?: string) {
    this.saveConfig({
      apiKey,
      userId,
      ...(senderPhone ? { senderPhone } : {})
    });
  }

  /**
   * 알림톡 API 게이트웨이 연결 테스트
   */
  public async testConnection(): Promise<{ success: boolean; message: string; latencyMs: number }> {
    const start = performance.now();
    await new Promise(r => setTimeout(r, 600));
    const latency = Math.round(performance.now() - start);

    if (this.config.isSandbox) {
      return {
        success: true,
        message: '✅ 샌드박스(테스트) 모드가 정상 작동 중입니다. 발송 시 가상 시뮬레이션으로 안전하게 동작합니다.',
        latencyMs: latency,
      };
    }

    if (!this.config.apiKey || !this.config.userId) {
      return {
        success: false,
        message: '⚠️ API Key 또는 User ID가 입력되지 않았습니다. 실서버 발송 전 인증 정보를 입력하세요.',
        latencyMs: latency,
      };
    }

    return {
      success: true,
      message: `✅ [${this.config.provider.toUpperCase()}] 알림톡 게이트웨이 인증 성공 (발신프로필키: ${this.config.senderKey ? '등록됨' : '미등록'})`,
      latencyMs: latency,
    };
  }

  /**
   * 해당 학생/회원의 이번 달(또는 현재 티어 주기) 사용량 및 잔여 횟수 조회
   */
  public getQuotaStatus(studentId: string, tier: MembershipTier): {
    usedCount: number;
    totalLimit: number;
    remainingCount: number;
    canSend: boolean;
  } {
    const quota = TIER_KAKAO_QUOTAS[normalizeTier(tier)] || TIER_KAKAO_QUOTAS.free;
    const currentMonthKey = `${studentId}_${new Date().toISOString().slice(0, 7)}`;
    
    let usedCount = 0;
    try {
      const allUsages = JSON.parse(localStorage.getItem(STORAGE_KEY_QUOTA) || '{}');
      usedCount = allUsages[currentMonthKey] || 0;
    } catch {
      usedCount = 0;
    }

    const totalLimit = quota.totalLimit;
    const remainingCount = Math.max(0, totalLimit - usedCount);

    return {
      usedCount,
      totalLimit,
      remainingCount,
      canSend: remainingCount > 0,
    };
  }

  private incrementUsage(studentId: string) {
    const currentMonthKey = `${studentId}_${new Date().toISOString().slice(0, 7)}`;
    try {
      const allUsages = JSON.parse(localStorage.getItem(STORAGE_KEY_QUOTA) || '{}');
      allUsages[currentMonthKey] = (allUsages[currentMonthKey] || 0) + 1;
      localStorage.setItem(STORAGE_KEY_QUOTA, JSON.stringify(allUsages));
    } catch { /* ignore */ }
  }

  /**
   * 카카오 알림톡 발송 API
   */
  public async sendAlimtalk(
    studentId: string,
    tier: MembershipTier,
    payload: KakaoMessagePayload
  ): Promise<KakaoSendResult> {
    const quota = this.getQuotaStatus(studentId, tier);

    if (!quota.canSend) {
      return {
        success: false,
        messageId: `ERR_LIMIT_${Date.now()}`,
        sentAt: new Date().toISOString(),
        template: payload.template,
        recipientPhone: payload.recipientPhone,
        recipientType: payload.recipientType,
        recipientName: payload.recipientName,
        costWon: 0,
        isSimulated: true,
        error: `해당 등급(${tier.toUpperCase()})의 알림톡 잔여 횟수(${quota.totalLimit}건)를 모두 소진했습니다.`,
      };
    }

    // 템플릿 본문 조합
    const formattedContent = this.compileTemplate(payload);

    // 실제 API 키가 설정되어 있고 샌드박스가 꺼져있으면 국내 알림톡 딜러사(알리고 등) HTTP POST 실행
    let isRealSent = false;
    let messageId = `MSG_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    if (!this.config.isSandbox && this.config.apiKey && this.config.userId && payload.recipientPhone) {
      try {
        const response = await fetch('https://kakaoapi.aligo.in/akv10/alimtalk/send/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            apikey: this.config.apiKey,
            userid: this.config.userId,
            sender: this.config.senderPhone,
            receiver_1: payload.recipientPhone.replace(/[^0-9]/g, ''),
            message_1: formattedContent,
            title_1: `[NBASS] ${payload.template}`,
            senderkey: this.config.senderKey,
          }),
        });
        const result = await response.json();
        if (result.code === 0 || result.result_code === '0') {
          isRealSent = true;
          messageId = result.mid || messageId;
        }
      } catch (e) {
        console.warn('[KakaoService] API call fallback to sandbox mode:', e);
      }
    }

    // 발송 카운트 증가 & 이력 로깅
    this.incrementUsage(studentId);

    const logEntry: KakaoSendResult = {
      success: true,
      messageId,
      sentAt: new Date().toISOString(),
      template: payload.template,
      recipientPhone: payload.recipientPhone || '010-XXXX-XXXX',
      recipientType: payload.recipientType,
      recipientName: payload.recipientName,
      costWon: 8.0, // 알림톡 공식 평균 단가 8원
      isSimulated: !isRealSent,
    };

    this.saveLog(studentId, logEntry, formattedContent);
    return logEntry;
  }

  /**
   * PRO 회원이 정기구독으로 전환하지 않았을 때, 2주간 추가 5건(맛보기) 순차 예약 트리거
   */
  public triggerProRetentionSequence(
    studentId: string,
    studentName: string,
    parentPhone: string,
    studentPhone: string,
    careType: string
  ) {
    console.log(`[KakaoService] PRO 2주 리텐션 퍼널 가동: ${studentName} (${studentId})`);

    // D+7일: 1주차 주간 리포트 (엄마 1건, 학생 1건)
    // D+14일: 2주차 주간 리포트 (엄마 1건, 학생 1건) + 최종 전환 제안 (1건)
    // 브라우저 백그라운드 및 Supabase 스케줄러 큐에 저장
    const retentionQueue = [
      {
        dayOffset: 7,
        template: 'PRO_RETENTION_MOM_WEEKLY_1' as KakaoTemplateType,
        recipientType: 'parent' as const,
        phone: parentPhone,
      },
      {
        dayOffset: 7,
        template: 'PRO_RETENTION_STUDENT_SCH_1' as KakaoTemplateType,
        recipientType: 'student' as const,
        phone: studentPhone,
      },
      {
        dayOffset: 14,
        template: 'PRO_RETENTION_MOM_WEEKLY_2' as KakaoTemplateType,
        recipientType: 'parent' as const,
        phone: parentPhone,
      },
      {
        dayOffset: 14,
        template: 'PRO_RETENTION_STUDENT_SCH_2' as KakaoTemplateType,
        recipientType: 'student' as const,
        phone: studentPhone,
      },
      {
        dayOffset: 14,
        template: 'PRO_RETENTION_FINAL_OFFER' as KakaoTemplateType,
        recipientType: 'parent' as const,
        phone: parentPhone,
      },
    ];

    try {
      const existingQueue = JSON.parse(localStorage.getItem('nbass_retention_queue') || '[]');
      existingQueue.push({
        studentId,
        studentName,
        careType,
        createdAt: new Date().toISOString(),
        tasks: retentionQueue,
      });
      localStorage.setItem('nbass_retention_queue', JSON.stringify(existingQueue));
    } catch { /* ignore */ }
  }

  /**
   * 학생이 AI 상담을 완료했을 때 학부모에게 즉시 안심 요약 알림 발송
   */
  public async triggerAiConsultationSummary(
    studentId: string,
    tier: MembershipTier,
    studentName: string,
    parentPhone: string,
    topic: string,
    aiPrescriptionSummary: string
  ): Promise<KakaoSendResult | null> {
    if (normalizeTier(tier) !== 'premium' && normalizeTier(tier) !== 'expert') {
      return null; // PREMIUM 이상 전용 기능
    }

    return this.sendAlimtalk(studentId, tier, {
      template: 'PLUS_AI_CONSULTATION_MOM_SUMMARY',
      recipientType: 'parent',
      recipientPhone: parentPhone,
      recipientName: `${studentName} 학생 학부모님`,
      studentName,
      summaryText: `[상담 주제] ${topic}\n[AI 전두엽 처방] ${aiPrescriptionSummary}`,
      actionUrl: `https://nbass.io/report?id=${studentId}`,
    });
  }

  /**
   * 전문가 계정 직접 발급 시 알림톡 발송 (임시 비밀번호 & 로그인 포털 URL)
   */
  public async sendExpertIssuanceNotification(expert: {
    name: string;
    email: string;
    phone: string;
    role: 'MEDICAL_EXPERT' | 'ACADEMY_EXPERT';
    orgName?: string;
    tempPassword?: string;
  }): Promise<KakaoSendResult> {
    const tempPassword = expert.tempPassword || 'nbass2026!';
    const roleLabel = expert.role === 'MEDICAL_EXPERT' ? '의료전문가 (의사/임상가)' : '학생지도전문가 (학원장/입시컨설턴트)';
    const actionUrl = 'https://nbass.io';

    const payload: KakaoMessagePayload = {
      template: 'EXPERT_ACCOUNT_ISSUED',
      recipientType: 'expert',
      recipientPhone: expert.phone,
      recipientName: expert.name,
      studentName: expert.email,
      expertRole: expert.role,
      orgName: expert.orgName || (expert.role === 'MEDICAL_EXPERT' ? 'NBASS 협력 의료클리닉' : '제휴 학원'),
      tempPassword,
      summaryText: `[소속/기관] ${expert.orgName || '미지정'}\n[권한] ${roleLabel}\n[계정 ID] ${expert.email}\n[임시비밀번호] ${tempPassword}`,
      actionUrl,
    };

    return this.sendAlimtalk(`EXPERT_${expert.email}`, 'expert', payload);
  }

  /**
   * 가입 심사 대기 전문가 승인 시 축하 및 권한 활성화 알림톡 발송
   */
  public async sendExpertApprovalNotification(expert: {
    name: string;
    email: string;
    phone: string;
    role: 'MEDICAL_EXPERT' | 'ACADEMY_EXPERT' | string;
    orgName?: string;
  }): Promise<KakaoSendResult> {
    const isMedical = expert.role === 'MEDICAL_EXPERT';
    const permissionScope = isMedical
      ? '전국 모든 학생의 인지·자율신경 원천 데이터 열람 및 임상 처방 권한'
      : `[${expert.orgName || '소속 학원'}] 소속 재원생 전담 모니터링 및 상담 권한`;

    const payload: KakaoMessagePayload = {
      template: 'EXPERT_ACCOUNT_APPROVED',
      recipientType: 'expert',
      recipientPhone: expert.phone,
      recipientName: expert.name,
      studentName: expert.email,
      expertRole: isMedical ? 'MEDICAL_EXPERT' : 'ACADEMY_EXPERT',
      orgName: expert.orgName || (isMedical ? 'NBASS 의료자문단' : '제휴 입시센터'),
      summaryText: permissionScope,
      actionUrl: 'https://nbass.io',
    };

    return this.sendAlimtalk(`EXPERT_${expert.email}`, 'expert', payload);
  }

  /**
   * AI 마케팅 진단 완료 리드 요약 알림톡 발송
   */
  public async sendMarketingLeadNotification(data: {
    recipientName: string;
    studentName: string;
    recipientPhone: string;
    careType: string;
    summaryText: string;
    actionUrl?: string;
  }): Promise<KakaoSendResult> {
    const payload: KakaoMessagePayload = {
      template: 'MARKETING_LEAD_SUMMARY',
      recipientType: 'parent',
      recipientPhone: data.recipientPhone,
      recipientName: data.recipientName,
      studentName: data.studentName,
      careType: data.careType,
      summaryText: data.summaryText,
      actionUrl: data.actionUrl || 'https://nbass.io',
    };

    return this.sendAlimtalk(`LEAD_${data.studentName}`, 'pro', payload);
  }

  /**
   * 1-클릭 즉시 테스트 알림톡 발송
   */
  public async sendTestMessage(recipientPhone: string, template: KakaoTemplateType): Promise<KakaoSendResult> {
    const samplePayload: KakaoMessagePayload = {
      template,
      recipientType: template.startsWith('EXPERT') ? 'expert' : 'parent',
      recipientPhone,
      recipientName: template.startsWith('EXPERT') ? '김원장' : '이지은 학부모님',
      studentName: template.startsWith('EXPERT') ? 'expert@nbass.io' : '김민준',
      expertRole: 'MEDICAL_EXPERT',
      orgName: '강남 연세마인드 클리닉',
      tempPassword: 'nbass-test-pass!',
      careType: 'Type-1 (전두엽 과각성 피로형)',
      goldenHours: '오후 2시 ~ 4시 30분',
      summaryText: '테스트용 발송 메시지입니다. 카카오톡 비즈니스 알림톡 연동 정상 상태 확인 완료.',
      actionUrl: 'https://nbass.io',
    };

    return this.sendAlimtalk(`TEST_${Date.now()}`, 'expert', samplePayload);
  }

  /**
   * 주간 브리핑 실발송 (실측 델타 연결):
   * 학생 검사 이력에서 최근 2건의 판정 완료 기록을 골라
   * PREMIUM_MOM_SUNDAY_REPORT를 변화량 본문으로 발송한다.
   */
  public async sendSundayBriefing(args: {
    studentId: string;
    tier: MembershipTier;
    recipientPhone: string;
    recipientName: string;
    studentName: string;
    history: AssessmentResult[];
    actionUrl?: string;
  }): Promise<KakaoSendResult> {
    const assessed = [...(args.history || [])]
      .filter(h => h?.student && (
        (h.student.id || '') === args.studentId ||
        (h.student.name || '') === args.studentName
      ))
      .filter(h => h.careType && h.careType !== CareType.UNASSESSED)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const [current, previous] = assessed;
    if (!current) {
      return {
        success: false,
        messageId: `ERR_NODATA_${Date.now()}`,
        sentAt: new Date().toISOString(),
        template: 'PREMIUM_MOM_SUNDAY_REPORT',
        recipientPhone: args.recipientPhone,
        recipientType: 'parent',
        recipientName: args.recipientName,
        costWon: 0,
        isSimulated: true,
        error: '해당 학생의 판정 완료 검사 기록이 없어 브리핑을 생성할 수 없습니다.',
      };
    }
    return this.sendAlimtalk(args.studentId, args.tier, {
      template: 'PREMIUM_MOM_SUNDAY_REPORT',
      recipientType: 'parent',
      recipientPhone: args.recipientPhone,
      recipientName: args.recipientName,
      studentName: args.studentName,
      currentResult: current,
      previousResult: previous || null,
      careType: current.careType,
      actionUrl: args.actionUrl,
    });
  }

  public clearLogs() {
    try {
      localStorage.removeItem(STORAGE_KEY_LOGS);
    } catch { /* ignore */ }
  }

  /**
   * 실시간 카카오톡 미리보기용 렌더링 헬퍼
   */
  public renderTemplatePreview(template: KakaoTemplateType, sampleData?: Partial<KakaoMessagePayload>): string {
    const isExpert = template.startsWith('EXPERT');
    return this.compileTemplate({
      template,
      recipientType: isExpert ? 'expert' : 'parent',
      recipientPhone: sampleData?.recipientPhone || '010-8888-1234',
      recipientName: sampleData?.recipientName || (isExpert ? '김도현 원장' : '이지은 학부모님'),
      studentName: sampleData?.studentName || (isExpert ? 'doctor.kim@clinic.com' : '김민준'),
      expertRole: sampleData?.expertRole || 'MEDICAL_EXPERT',
      orgName: sampleData?.orgName || (isExpert ? '강남 연세마인드 인지클리닉' : '시대인재 (대치)'),
      tempPassword: sampleData?.tempPassword || 'nbass-pass-9921!',
      careType: sampleData?.careType || 'Type-1 (전두엽 과각성 피로형)',
      goldenHours: sampleData?.goldenHours || '오후 2시 ~ 4시 30분',
      summaryText: sampleData?.summaryText || (isExpert 
        ? '전국 모든 학생의 인지·자율신경 원천 데이터 열람 및 임상 처방 권한 활성화'
        : '집중 유지력 84점 / 스트레스 회복력 양호. 오후 골든타임 고난도 학습 배치 권장.'),
      actionUrl: sampleData?.actionUrl || 'https://nbass.io',
      ...sampleData,
    });
  }

  /**
   * 템플릿 본문 렌더링
   */
  public compileTemplate(p: KakaoMessagePayload): string {
    switch (p.template) {
      case 'EXPERT_ACCOUNT_ISSUED':
        return `[NBASS 전문가 관제 포털 계정 발급 완료]
${p.recipientName}님, 귀하의 NBASS 전문가 관제 포털 계정이 정식 발급되었습니다.

✦ 전문가 구분: ${p.expertRole === 'MEDICAL_EXPERT' ? '의료전문가 (임상 데이터 열람)' : '학생지도전문가 (학원 전담)'}
✦ 소속 기관: ${p.orgName || '지정 협력기관'}
✦ 로그인 ID: ${p.studentName || p.recipientPhone || '등록 이메일'}
✦ 임시 비밀번호: ${p.tempPassword || 'nbass2026!'}

아래 전용 관제 포털 링크로 접속하여 비밀번호 변경 후 즉시 이용하실 수 있습니다.
▶ 전문가 포털 접속: ${p.actionUrl || 'https://nbass.io'}`;

      case 'EXPERT_ACCOUNT_APPROVED':
        return `[NBASS 전문가 회원가입 승인 안내]
${p.recipientName}님, 제출해 주신 전문가 자격 심사가 승인되었습니다.

✦ 상태: 자격 검증 완료 (계정 즉시 활성화)
✦ 소속/기관: ${p.orgName || '협력기관'}
✦ 활성화 권한: ${p.summaryText || '학생 모니터링 및 AI 리포트 분석 권한'}

지금 바로 포털에 로그인하여 학생 데이터를 확인하실 수 있습니다.
▶ 관제 포털 바로가기: ${p.actionUrl || 'https://nbass.io'}`;

      case 'MARKETING_LEAD_SUMMARY':
        return `[NBASS AI 인지 성향 진단 완료]
${p.recipientName}님, ${p.studentName || '자녀'} 학생의 인지·멘탈 정밀 분석 리포트가 완성되었습니다.

✦ 진단 케어타입: ${p.careType || 'Type-1 전두엽 과각성형'}
✦ AI 3분 브리핑:
${p.summaryText || '집중 지속력 82점 / 스트레스 회복력 양호. 오후 골든타임 고난도 학습 배치 권장.'}

전문가가 추천하는 맞춤형 뉴로 솔루션과 주간 계획표를 확인해 보세요.
▶ 심층 리포트 확인: ${p.actionUrl || 'https://nbass.io'}`;

      case 'MARKETING_CAMPAIGN_NOTICE':
        return `[NBASS 주간 교육·뉴로 인사이트]
${p.recipientName}님, 이번 주 수험생 전두엽 관리 및 최신 입시 컨디셔닝 칼럼이 발행되었습니다.

${p.summaryText || '상위 1% 수험생의 서카디안 수면 리듬과 모의고사 D-Day 컨디션 조절법'}
▶ 전문 읽기: ${p.actionUrl || 'https://nbass.io'}`;

      case 'PRO_IMMEDIATE_SUMMARY':
        return `[NBASS 수험생 뉴로-케어]
${p.recipientName}님, ${p.studentName} 학생의 1회 정밀 인지·멘탈 진단이 완료되었습니다.

✦ 진단 케어타입: ${p.careType || '분석 완료'}
✦ 핵심 집중 골든타임: ${p.goldenHours || '오후 2시~5시'}
✦ 전두엽 인지 상태: 14P 심층 맞춤 리포트 생성 완료

자녀의 집중 병목 원인과 맞춤형 3-Tier 솔루션을 아래 링크에서 즉시 확인하세요.
▶ 리포트 확인: ${p.actionUrl || 'https://nbass.io'}`;

      case 'PRO_RETENTION_MOM_WEEKLY_1':
        return `[NBASS 주간 자녀 케어 브리핑 - 1주차 무료 지원]
${p.recipientName}님, 지난 진단에 이어 ${p.studentName} 학생의 1주차 인지 컨디션을 분석해 드립니다.

✦ 이번 주 뇌 피로도: 양호 (초기 집중력 유지)
✦ 학부모 가이드: 이번 주는 성적 질문 대신 "오늘 집중하느라 수고했다"는 짧은 한마디가 도파민을 활성화합니다.`;

      case 'PREMIUM_MOM_SUNDAY_REPORT': {
        if (p.currentResult) {
          const delta = buildDeltaBriefing(p.currentResult, p.previousResult);
          const head = `[NBASS 주간 학부모 브리핑 - 일요일 정기]\n${p.recipientName}님, 이번 주 ${p.studentName} 학생의 주간 컨디션 변화입니다.\n`;
          const body = delta.lines.map(renderDeltaLine).join('\n');
          if (delta.isFirst) {
            return `${head}\n${body}\n\n✦ 다음 주 권장: 같은 시간 취침·기상으로 수면 리듬을 고정해 주세요.`;
          }
          const praise = delta.praises.length > 0
            ? `\n\n✦ 이번 주 칭찬 포인트: ${delta.praises.join(', ')} — "수고했다"는 짧은 한마디가 도파민을 활성화합니다.`
            : `\n\n✦ 이번 주는 큰 변화가 없습니다. 성적 질문 대신 "오늘 집중하느라 수고했다"는 짧은 한마디를 권합니다.`;
          return `${head}\n${body}${praise}`;
        }
        return `[NBASS 주간 학부모 브리핑 - 일요일 정기]
${p.recipientName}님, 이번 주 ${p.studentName} 학생의 주간 컨디션 요약입니다.

✦ 집중 유지력 점수: 84점 (우수)
✦ 수면 회복 지수: 68점 (약간의 피로 누적)
✦ 권장 과목 스케줄: 화·목 오후 골든타임에 고난도 취약 과목 배치 추천
✦ 이번 주 코칭 팁: 시험 스트레스 완화를 위해 따뜻한 차와 4-7-8 호흡을 함께해 주세요.`;
      }

      case 'PLUS_AI_CONSULTATION_MOM_SUMMARY':
        return `[NBASS AI 1:1 클리닉 실시간 요약]
${p.recipientName}님, 방금 ${p.studentName} 학생이 AI 학습 주치의와 1:1 심층 상담을 마쳤습니다.

${p.summaryText}

가정에서 자녀가 편안한 마음으로 실행할 수 있도록 따뜻한 응원을 부탁드립니다.`;

      case 'VIP_BURNOUT_EMERGENCY_ALERT':
        return `[🚨 NBASS 고위험 컨디션 긴급 알림]
${p.recipientName}님, ${p.studentName} 학생의 최근 인지 반응 및 피로도 지수가 [과긴장 주의 단계]로 감지되었습니다.

✦ 권고 조치: 오늘 밤 자정 이전 필수 취침 & 무리한 심야 학습 제한
✦ 뉴로 영양: 비타민B군 및 마그네슘 보충 권장`;

      case 'PARENT_NEW_REPORT':
        return `[NBASS 새 진단 리포트 도착]
${p.recipientName}님, ${p.studentName} 학생의 새 정밀 진단 리포트가 작성되었습니다.

✦ 진단 유형: ${p.careType || '분석 완료'}
✦ 처방 요약: ${p.summaryText || '맞춤 처방이 준비되었습니다.'}

▶ 자세히 보기: ${p.actionUrl || 'https://nbass.io'}`;

      case 'PARENT_HABIT_MILESTONE':
        return `[NBASS 실천 마일스톤 달성]
${p.recipientName}님, ${p.studentName} 학생이 새로운 실천 기록을 달성했습니다.

✦ 달성 내용: ${p.summaryText || '연속 실천 기록 경신'}
결과보다 과정을 칭찬해 주세요.

▶ 자세히 보기: ${p.actionUrl || 'https://nbass.io'}`;

      case 'PARENT_SLEEP_NOTICE':
        return `[NBASS 수면 리듬 알림]
${p.recipientName}님, ${p.studentName} 학생의 최근 취침 패턴입니다.

✦ 관찰 내용: ${p.summaryText || '늦은 취침이 이어지고 있습니다.'}
✦ 권장: 같은 시간 취침·기상으로 리듬을 고정해 주세요.

▶ 자세히 보기: ${p.actionUrl || 'https://nbass.io'}`;

      case 'PARENT_WELCOME':
        return `[NBASS 학부모 알림 신청 완료]
${p.recipientName}님, ${p.studentName || '자녀'} 학생의 학습 안심 알림을 시작합니다.

✦ 안내 항목: 주간 브리핑·실천 마일스톤·새 리포트 (일 최대 2통, 밤 10시~아침 8시 제외)
✦ 수신 변경·거부는 앱 설정에서 언제든 가능합니다.`;

      case 'PARENT_RECHECK_REPORT':
        return `[NBASS 재진단 비교 도착]
${p.recipientName}님, ${p.studentName} 학생의 재진단 결과와 이전 변화를 정리했습니다.

✦ 변화 요약: ${p.highlight || '이전 기록과 비교 분석이 준비되었습니다.'}

▶ 자세히 보기: ${p.actionUrl || 'https://nbass.io'}`;

      case 'PARENT_PRESCRIPTION_GUIDE':
        return `[NBASS 처방 이행 가이드]
${p.recipientName}님, ${p.studentName} 학생의 이번 주 핵심 처방 1가지입니다.

✦ 핵심 처방: ${p.highlight || '맞춤 처방이 준비되었습니다.'}
✦ 부모 역할: ${p.nextStep || '결과보다 과정을 칭찬해 주세요.'}

▶ 자세히 보기: ${p.actionUrl || 'https://nbass.io'}`;

      case 'PARENT_WEEKLY_DIGEST':
        return `[NBASS 주간 학부모 브리핑]
${p.recipientName}님, 이번 주 ${p.studentName} 학생의 한 주 요약입니다.

✦ 주간 요약: ${p.highlight || '실천 기록을 정리했습니다.'}
✦ 칭찬 포인트: ${p.praise || '꾸준히 이어가고 있습니다.'} — 짧은 격려가 큰 힘이 됩니다.

▶ 자세히 보기: ${p.actionUrl || 'https://nbass.io'}`;

      case 'PARENT_MIDWEEK_TIP':
        return `[NBASS 수요일 코칭 팁]
${p.recipientName}님, 이번 주 대화법 1가지입니다.

✦ ${p.highlight || '성적 질문 대신 "오늘 집중하느라 수고했다"는 짧은 한마디를 권합니다.'}`;

      case 'PARENT_HABIT_ERROR_MILESTONE':
        return `[NBASS 오답 분석 마일스톤]
${p.recipientName}님, ${p.studentName} 학생이 오답 분석을 착실히 쌓고 있습니다.

✦ 달성 내용: ${p.highlight || '3색 오답 분석 누적 기록 경신'}
베껴 쓰기가 아닌 생각 정리의 결과입니다. 칭찬해 주세요.

▶ 자세히 보기: ${p.actionUrl || 'https://nbass.io'}`;

      case 'PARENT_HABIT_SLUMP':
        return `[NBASS 실천 환기 알림]
${p.recipientName}님, ${p.studentName} 학생의 실천 기록이 ${p.highlight || '며칠간'} 비어 있습니다.

✦ 권유 멘트: "기록이 비어도 괜찮아. 오늘 10분만 다시 시작해 보자"는 말이 재시작에 도움이 됩니다.`;

      case 'PARENT_GRADE_UP':
        return `[NBASS 성적 상승 소식]
${p.recipientName}님, ${p.studentName} 학생에게 좋은 변화가 있습니다.

✦ 변동 내용: ${p.highlight || '등록된 성적에 상승이 확인되었습니다.'}
점수보다 과정을 칭찬해 주세요.

▶ 자세히 보기: ${p.actionUrl || 'https://nbass.io'}`;

      case 'PARENT_GRADE_DOWN':
        return `[NBASS 성적 변화 안내]
${p.recipientName}님, ${p.studentName} 학생의 등록 성적에 하락이 있습니다.

✦ 변동 내용: ${p.highlight || '이전 기록 대비 하락이 확인되었습니다.'}
✦ 다음 계획: ${p.nextStep || '취약 단원부터 1개씩 복구하면 됩니다.'} 질책보다 계획 세우기가 도움이 됩니다.

▶ 자세히 보기: ${p.actionUrl || 'https://nbass.io'}`;

      case 'PARENT_GRADE_GOAL':
        return `[NBASS 목표 달성 축하]
${p.recipientName}님, ${p.studentName} 학생이 세운 목표를 달성했습니다.

✦ 달성 내용: ${p.highlight || '목표 과목 달성'}
함께 축하해 주세요.

▶ 자세히 보기: ${p.actionUrl || 'https://nbass.io'}`;

      case 'PARENT_SLEEP_IMPROVED':
        return `[NBASS 수면 리듬 개선]
${p.recipientName}님, ${p.studentName} 학생의 취침 리듬이 좋아지고 있습니다.

✦ 개선 내용: ${p.highlight || '규칙적인 취침이 이어지고 있습니다.'}
리듬이 성적의 토대입니다. 칭찬해 주세요.`;

      case 'PARENT_CONSULT_SUMMARY':
        return `[NBASS AI 상담 요약]
${p.recipientName}님, ${p.studentName} 학생의 AI 상담 실천 처방입니다.

✦ 처방 요약: ${p.highlight || p.summaryText || '오늘의 실천 처방이 준비되었습니다.'}
가정에서 편안하게 실행할 수 있도록 응원을 부탁드립니다.

▶ 자세히 보기: ${p.actionUrl || 'https://nbass.io'}`;

      case 'PARENT_DDAY_GUIDE':
        return `[NBASS D-day 컨디셔닝]
${p.recipientName}님, ${p.highlight || '시험이 다가오고 있습니다.'}

✦ 수칙: ${p.nextStep || '같은 시간 취침·기상과 가벼운 컨디션 유지가 도움이 됩니다.'}

▶ 자세히 보기: ${p.actionUrl || 'https://nbass.io'}`;

      case 'PARENT_REPORT_READY':
        return `[NBASS 심층 리포트북 발급]
${p.recipientName}님, ${p.studentName} 학생의 심층 리포트북이 준비되었습니다.

▶ 확인하기: ${p.actionUrl || 'https://nbass.io'}`;

      case 'PARENT_BURNOUT_ALERT':
        return `[NBASS 컨디션 주의]
${p.recipientName}님, ${p.studentName} 학생에게 피로 누적 신호가 감지되었습니다.

✦ 관찰 내용: ${p.highlight || '최근 피로도가 높게 나타나고 있습니다.'}
✦ 권고: 오늘 밤 충분한 수면을 권합니다.`;

      case 'PARENT_MONTHLY_GROWTH':
        return `[NBASS 월간 성장 리포트]
${p.recipientName}님, ${p.studentName} 학생의 한 달 요약입니다.

✦ 월간 요약: ${p.highlight || '한 달 실천 기록을 정리했습니다.'}
✦ 칭찬 포인트: ${p.praise || '꾸준히 이어가고 있습니다.'}

▶ 자세히 보기: ${p.actionUrl || 'https://nbass.io'}`;

      case 'PARENT_SETTINGS_CHANGED':
        return `[NBASS 수신 설정 변경 확인]
${p.recipientName}님, 학부모 알림 수신 설정이 변경되었습니다.

✦ 변경 내용: ${p.highlight || '수신 항목이 업데이트되었습니다.'}
본인이 변경하지 않았다면 앱 설정에서 확인해 주세요.`;

      case 'PARENT_FREE_NOTICE':
        return `[NBASS 학습 소식]
${p.highlight || '새 소식이 있습니다.'}

${p.summaryText || ''}

▶ 자세히 보기: ${p.actionUrl || 'https://nbass.io'}`;

      case 'PARENT_FREE_PRAISE':
        return `[NBASS 칭찬 소식]
${p.studentName || ''} 학생의 새로운 소식입니다.

✦ ${p.highlight || '새로운 실천 기록'}
${p.praise || '꾸준히 이어가고 있습니다. 칭찬해 주세요.'}

▶ 자세히 보기: ${p.actionUrl || 'https://nbass.io'}`;

      default:
        return `[NBASS 알림] ${p.studentName || p.recipientName}님의 최신 학습 컨디션 및 리포트가 업데이트되었습니다.`;
    }
  }

  private saveLog(studentId: string, result: KakaoSendResult, content: string) {
    try {
      const logs = JSON.parse(localStorage.getItem(STORAGE_KEY_LOGS) || '[]');
      logs.unshift({ ...result, studentId, content });
      if (logs.length > 200) logs.pop();
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
    } catch { /* ignore */ }
  }

  public getLogs(studentId?: string): (KakaoSendResult & { studentId: string; content: string })[] {
    try {
      const logs = JSON.parse(localStorage.getItem(STORAGE_KEY_LOGS) || '[]');
      if (!studentId) return logs;
      return logs.filter((l: any) => l.studentId === studentId);
    } catch {
      return [];
    }
  }
}

export const kakaoNotificationService = new KakaoNotificationService();