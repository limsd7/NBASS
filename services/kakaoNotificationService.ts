/**
 * NBASS KakaoTalk Notification Service (카카오 알림톡 서비스 모듈)
 * 
 * 등급별 차등화 발송 정책:
 * - PRO (1회 ₩9,000): 기본 5건 + 미구독 시 2주 리텐션 5건 (엄마 주간 2건 + 학생 시간표 2건 + 1건 전환) = 총 10건
 * - PREMIUM (월 ₩9,900): 월 20건 (엄마 주간 리포트/중간 점검 8건, 학생 시간표/뽀모도로 8건, 성적 변동 4건)
 * - PREMIUM PLUS (월 ₩19,900): 월 40건 (PREMIUM 전량 + AI 상담 요약 10건 + 시험 D-Day 6건 + 심층 리포트 4건)
 * - VIP (월 ₩29,900): 월 70건 (PLUS 전량 + 수면 데일리 케어 24건 + 고위험 번아웃 SOS Alert 6건)
 */

import { MembershipTier } from '../types';

export type KakaoTemplateType =
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
  | 'VIP_SLEEP_DAILY_RESET'       // VIP: 매일 밤 10시 서카디안 수면 리셋 알림
  | 'VIP_BURNOUT_EMERGENCY_ALERT' // VIP: 🚨 고위험 번아웃/급성 스트레스 긴급 SOS 알림
  | 'VIP_MONTHLY_GROWTH_REPORT';  // VIP: 월간 총괄 뇌-신체 성장 분석표

export interface KakaoMessagePayload {
  template: KakaoTemplateType;
  recipientType: 'parent' | 'student';
  recipientPhone: string;
  recipientName: string;
  studentName: string;
  careType?: string;
  goldenHours?: string;
  summaryText?: string;
  actionUrl?: string;
  customData?: Record<string, string | number>;
}

export interface KakaoSendResult {
  success: boolean;
  messageId: string;
  sentAt: string;
  template: KakaoTemplateType;
  recipientPhone: string;
  recipientType: 'parent' | 'student';
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
  basic: {
    tier: 'basic',
    totalLimit: 0,
    description: '기본 모드 알림 없음',
  },
  pro: {
    tier: 'pro',
    totalLimit: 10, // 기본 5건 + 미전환 2주 리텐션 5건 = 총 10건
    description: '기본 5건 케어 + 미구독 시 2주간 맛보기 5건 추가 (총 10건)',
  },
  premium: {
    tier: 'premium',
    totalLimit: 20, // 월 20건
    description: '월 20건 정기 케어 (엄마 주 2회 + 학생 주 2회 + 성적 변동)',
  },
  premium_plus: {
    tier: 'premium_plus',
    totalLimit: 40, // 월 40건
    description: '월 40건 정밀 케어 (PREMIUM 전량 + AI 상담 요약 + 시험 D-Day)',
  },
  vip: {
    tier: 'vip',
    totalLimit: 70, // 월 70건
    description: '월 70건 밀착 케어 (PLUS 전량 + 수면 데일리 24건 + 긴급 Alert)',
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
  private aligoApiKey: string = '';
  private aligoUserId: string = '';
  private senderPhone: string = '02-1588-0000'; // 발신자 대표 번호

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    try {
      const saved = localStorage.getItem('nbass_kakao_api_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.aligoApiKey = parsed.apiKey || '';
        this.aligoUserId = parsed.userId || '';
        this.senderPhone = parsed.senderPhone || this.senderPhone;
      }
    } catch { /* ignore */ }
  }

  public setApiCredentials(apiKey: string, userId: string, senderPhone?: string) {
    this.aligoApiKey = apiKey;
    this.aligoUserId = userId;
    if (senderPhone) this.senderPhone = senderPhone;
    localStorage.setItem(
      'nbass_kakao_api_config',
      JSON.stringify({ apiKey, userId, senderPhone: this.senderPhone })
    );
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
    const quota = TIER_KAKAO_QUOTAS[tier] || TIER_KAKAO_QUOTAS.free;
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
        costWon: 0,
        isSimulated: true,
        error: `해당 등급(${tier.toUpperCase()})의 알림톡 잔여 횟수(${quota.totalLimit}건)를 모두 소진했습니다.`,
      };
    }

    // 템플릿 본문 조합
    const formattedContent = this.compileTemplate(payload);

    // 실제 API 키가 설정되어 있으면 국내 알림톡 딜러사(알리고 등) HTTP POST 실행
    let isRealSent = false;
    let messageId = `MSG_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    if (this.aligoApiKey && this.aligoUserId && payload.recipientPhone) {
      try {
        // Aligo / Bizm API 호출 연동 포맷
        const response = await fetch('https://kakaoapi.aligo.in/akv10/alimtalk/send/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            apikey: this.aligoApiKey,
            userid: this.aligoUserId,
            sender: this.senderPhone,
            receiver_1: payload.recipientPhone.replace(/[^0-9]/g, ''),
            message_1: formattedContent,
            title_1: `[NBASS] ${payload.template}`,
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
    if (tier !== 'premium_plus' && tier !== 'vip' && tier !== 'expert') {
      return null; // PLUS 이상 전용 기능
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
   * 템플릿 본문 렌더링
   */
  private compileTemplate(p: KakaoMessagePayload): string {
    switch (p.template) {
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

      case 'PREMIUM_MOM_SUNDAY_REPORT':
        return `[NBASS 주간 학부모 브리핑 - 일요일 정기]
${p.recipientName}님, 이번 주 ${p.studentName} 학생의 주간 컨디션 요약입니다.

✦ 집중 유지력 점수: 84점 (우수)
✦ 수면 회복 지수: 68점 (약간의 피로 누적)
✦ 권장 과목 스케줄: 화·목 오후 골든타임에 고난도 취약 과목 배치 추천
✦ 이번 주 코칭 팁: 시험 스트레스 완화를 위해 따뜻한 차와 4-7-8 호흡을 함께해 주세요.`;

      case 'PLUS_AI_CONSULTATION_MOM_SUMMARY':
        return `[NBASS AI 1:1 클리닉 실시간 요약]
${p.recipientName}님, 방금 ${p.studentName} 학생이 AI 학습 주치의와 1:1 심층 상담을 마쳤습니다.

${p.summaryText}

가정에서 자녀가 편안한 마음으로 실행할 수 있도록 따뜻한 응원을 부탁드립니다.`;

      case 'VIP_BURNOUT_EMERGENCY_ALERT':
        return `[🚨 NBASS VIP 고위험 컨디션 긴급 알림]
${p.recipientName}님, ${p.studentName} 학생의 최근 인지 반응 및 피로도 지수가 [과긴장 주의 단계]로 감지되었습니다.

✦ 권고 조치: 오늘 밤 자정 이전 필수 취침 & 무리한 심야 학습 제한
✦ 뉴로 영양: 비타민B군 및 마그네슘 보충 권장`;

      default:
        return `[NBASS 알림] ${p.studentName} 학생의 최신 학습 컨디션 및 리포트가 업데이트되었습니다.`;
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
