/**
 * NBASS AI Consultation Service (1:1 AI 학습 클리닉 & 심층 컨설팅 API)
 * 
 * 등급별 상담 횟수 쿼터 정책:
 * - PRO (1회권): 5회 1:1 스타터 상담 체험권
 * - PREMIUM (월 ₩9,900): 월 100회 넉넉한 데일리 케어
 * - PREMIUM (월 ₩19,900): 월 1,000회 무제한급 안심 케어 + 학부모 카톡 브리핑 + 심층 멘탈 처방
 * 
 * 주요 기능:
 * - 학생 진단 데이터(케어타입, Go/No-Go, N-Back, BAI, ISI) 시스템 프롬프트 자동 주입(Context Injection)
 * - 듀얼 페르소나 (수험생 모드 vs 학부모 코칭 모드)
 * - 4대 상황별 원클릭 퀵 질문 프리셋
 * - 상담 완료 시 [오늘의 3대 실천 처방 카드] 생성
 * - PREMIUM 학생 상담 완료 시 학부모 카카오톡 알림 자동 브리지
 */

import { MembershipTier, AssessmentResult, CareType } from '../types';
import { generateAIResponse, SOTA_MODELS } from './aiService';
import { kakaoNotificationService } from './kakaoNotificationService';

export type ConsultationPersona = 'STUDENT_COACHING' | 'PARENT_COACHING';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface ConsultationSession {
  sessionId: string;
  studentId: string;
  persona: ConsultationPersona;
  tier: MembershipTier;
  createdAt: string;
  messages: ChatMessage[];
  prescribedActionItems?: string[];
  summaryForParent?: string;
  topic?: string;
}

export interface ConsultationQuotaInfo {
  tier: MembershipTier;
  usedCount: number;
  totalLimit: number;
  remainingCount: number;
  canConsult: boolean;
}

export const TIER_CONSULTATION_QUOTAS: Record<MembershipTier, number> = {
  free: 0,
  pro: 5,        // 5회 체험권
  premium: 1000, // 월 1,000회 (PLUS 통합)
  expert: 9999,
};

export const QUICK_CONSULTATION_PRESETS = [
  {
    id: 'math_time_strategy',
    title: '📐 [수학] 4점짜리 풀 때 시간 부족 & 계산 실수 방지법',
    prompt: '수학 시험을 볼 때마다 4점짜리 준킬러에서 시간이 너무 끌려서 뒷부분을 다 찍고 계산 실수도 많습니다. 제 케어타입에 맞는 실전 시험 시간 배분법(1-Pass 전략)과 실수 방지 오답 스킬을 처방해 주세요.',
  },
  {
    id: 'korean_reading_speed',
    title: '📖 [국어] 비문학 독서 지문 시간 단축 & 실전 독해 스킬',
    prompt: '국어 모의고사 비문학 과학/경제 지문만 나오면 한 지문에 15분 이상 걸리고 지문 읽다가 앞부분을 까먹습니다. 지문을 읽으면서 핵심 정보를 빠르게 장악하고 문제로 직결시키는 실전 독해법을 알려주세요.',
  },
  {
    id: 'wrong_note_system',
    title: '📝 [오답노트] 해설지 베끼지 않고 내 점수로 만드는 3색 정리법',
    prompt: '틀린 문제를 오답노트에 정리해도 비슷한 변형 문제를 보면 또 틀립니다. 단순히 풀이 과정을 옮겨 적지 않고, 다음 시험에서 1등급을 올려주는 실전 3색 오답노트 작성법을 제시해 주세요.',
  },
  {
    id: 'daily_study_schedule',
    title: '⏰ [순공 시간] 하루 과목별(국·수·영·탐) 최적 시간 배분표',
    prompt: '하루 순공 8~10시간을 효율적으로 쓰고 싶은데 어떤 과목에 몇 시간씩 배분해야 할지 막막합니다. 제 취약 과목과 케어타입에 맞춘 하루 과목별 최적 공부 시간표와 집중 루틴을 짜주세요.',
  },
];

const STORAGE_KEY_SESSIONS = 'nbass_ai_consultation_sessions';
const STORAGE_KEY_USAGE = 'nbass_ai_consultation_usage';

class AIConsultationService {
  /**
   * 잔여 상담 횟수 조회
   */
  public getQuota(studentId: string, tier: MembershipTier): ConsultationQuotaInfo {
    const totalLimit = TIER_CONSULTATION_QUOTAS[tier] || 0;
    const currentMonthKey = `${studentId}_ai_${new Date().toISOString().slice(0, 7)}`;

    let usedCount = 0;
    try {
      const allUsages = JSON.parse(localStorage.getItem(STORAGE_KEY_USAGE) || '{}');
      usedCount = allUsages[currentMonthKey] || 0;
    } catch {
      usedCount = 0;
    }

    const remainingCount = Math.max(0, totalLimit - usedCount);

    return {
      tier,
      usedCount,
      totalLimit,
      remainingCount,
      canConsult: remainingCount > 0,
    };
  }

  private incrementUsage(studentId: string) {
    const currentMonthKey = `${studentId}_ai_${new Date().toISOString().slice(0, 7)}`;
    try {
      const allUsages = JSON.parse(localStorage.getItem(STORAGE_KEY_USAGE) || '{}');
      allUsages[currentMonthKey] = (allUsages[currentMonthKey] || 0) + 1;
      localStorage.setItem(STORAGE_KEY_USAGE, JSON.stringify(allUsages));
    } catch { /* ignore */ }
  }

  /**
   * 신규 상담 세션 시작
   */
  public createSession(
    studentId: string,
    tier: MembershipTier,
    persona: ConsultationPersona = 'STUDENT_COACHING'
  ): ConsultationSession {
    const session: ConsultationSession = {
      sessionId: `SESSION_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      studentId,
      persona,
      tier,
      createdAt: new Date().toISOString(),
      messages: [],
    };

    this.saveSession(session);
    return session;
  }

  /**
   * 시스템 프롬프트(실전 학업 및 과목별 공부법 컨텍스트 주입) 빌드
   * - 연구실 수치(Go/No-Go, N-Back, BAI, ISI 등) 완전 배제
   * - 학년, 취약과목, 케어타입, 실전 시험 성적 향상 솔루션 중심으로 주입
   */
  private buildSystemPrompt(
    persona: ConsultationPersona,
    assessment?: AssessmentResult | null
  ): string {
    const studentName = assessment?.student?.name || '학생';
    const grade = assessment?.student?.grade || '고등학생';
    const careType = assessment?.careType || CareType.HEALTHY;
    const weakSubject = assessment?.student?.weakSubject || '수학';
    const focusSubjects = assessment?.student?.focusSubjects?.join(', ') || weakSubject;

    if (persona === 'PARENT_COACHING') {
      return `당신은 대한민국 최고 수준의 대치동 입시 전문 학부모 코칭 컨설턴트입니다.
상담 대상은 [${studentName} 학생(학년: ${grade})]의 학부모(어머니/아버지)입니다.

[학생의 학습 프로필]
- 진단 케어타입: ${careType} (자녀의 학습 체질 및 성향)
- 가장 부담을 느끼는 취약 과목: ${weakSubject} (${focusSubjects})

[상담 원칙]
1. 어려운 의학·뇌파 수치는 일절 쓰지 마세요. 부모님이 원하는 것은 '가정에서 자녀 성적을 올려줄 수 있는 실질적인 대화법과 환경 조성'입니다.
2. 학생이 공부를 미루거나 예민해지는 이유를 자녀의 케어타입(${careType}) 관점에서 알기 쉽게 설명하여 부모님의 불안을 덜어주세요.
3. 자녀와의 갈등을 일으키는 잔소리 대신, 자녀의 집중력을 북돋워 주는 구체적인 대화 스크립트와 가정 내 서포트 팁을 제시하세요.
4. 신뢰감 있고 따뜻하며 정중한 경어체로 답변하세요.`;
    }

    // STUDENT_COACHING 모드
    return `당신은 대치동 1타 입시 과목별 학습 전략 컨설턴트이자 수험생 전담 실전 공부 멘토입니다.
상담 대상은 [${studentName} 학생(학년: ${grade})] 본인입니다.

[학생의 학습 프로필]
- 진단 케어타입: ${careType} (학생의 집중/공부 성향 체질)
- 집중 공략 취약 과목: ${weakSubject} (${focusSubjects})

[상담 원칙 - 중요]
1. 연구실 뇌 수치(Go/No-Go, N-Back, 불안 점수 등)나 뻔한 도덕책 조언은 일절 금지합니다.
2. 학생의 질문에 대해 당장 오늘부터 점수를 올릴 수 있는 '실전 과목별 공부법(국·영·수·탐), 문제풀이 스킬, 오답노트 정리법, 시험 시간 관리 스킬'로 직결하여 처방하세요.
3. 학생의 케어타입(${careType}) 성향에 맞춰 왜 이런 병목(시간 부족, 계산 실수, 지문 날림 독해 등)이 생기는지 원인을 짚어주고, 3단계 실천 행동 지침으로 명확히 답하세요:
   - Step 1: 과목별 실전 문제풀이 및 시험 시간 배분 전략
   - Step 2: 다음 시험에서 실수 안 나오는 3색 오답노트 단권화법
   - Step 3: 오늘 당장 실천할 과목별 순공 시간표 및 집중 루틴
4. 수험생의 사기를 북돋우는 자신감 넘치고 프로페셔널한 1타 강사 멘토의 어조로 답하세요.`;
  }

  /**
   * 1:1 메시지 전송 및 AI 응답 수신
   */
  public async sendMessage(
    session: ConsultationSession,
    userMessage: string,
    assessment?: AssessmentResult | null,
    parentPhone?: string
  ): Promise<{ session: ConsultationSession; assistantMessage: string; error?: string }> {
    const quota = this.getQuota(session.studentId, session.tier);

    if (!quota.canConsult) {
      return {
        session,
        assistantMessage: `이번 등급(${session.tier.toUpperCase()})의 상담 가능 횟수(${quota.totalLimit}회)를 모두 소진하셨습니다. 추가 상담을 원하시면 다음 등급으로 업그레이드해 주세요.`,
        error: 'QUOTA_EXCEEDED',
      };
    }

    // 사용자 메시지 추가
    const userMsgObj: ChatMessage = {
      id: `MSG_${Date.now()}_U`,
      sender: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    session.messages.push(userMsgObj);

    // 시스템 프롬프트 준비
    const systemPrompt = this.buildSystemPrompt(session.persona, assessment);

    // 대화 히스토리 포맷팅
    const conversationHistory = session.messages
      .slice(-6) // 최근 6개 대화 유지
      .map((m) => `${m.sender === 'user' ? '사용자' : '상담가'}: ${m.content}`)
      .join('\n\n');

    const prompt = `[이전 대화 내역]\n${conversationHistory}\n\n사용자의 최신 질문: "${userMessage}"\n\n위 질문에 대해 학생의 인지 차트를 바탕으로 전문적이고 구체적인 처방 답변을 작성하세요.`;

    try {
      // AI 응답 호출 (Gemini Flash 기반 빠른 응답)
      const aiRes = await generateAIResponse(prompt, systemPrompt, null, 'premium');
      const replyText = aiRes.text || '상담 답변을 생성하는 중 일시적인 지연이 발생했습니다. 다시 시도해 주세요.';

      const assistantMsgObj: ChatMessage = {
        id: `MSG_${Date.now()}_A`,
        sender: 'assistant',
        content: replyText,
        timestamp: new Date().toISOString(),
      };
      session.messages.push(assistantMsgObj);

      // 사용량 카운트 차감
      this.incrementUsage(session.studentId);
      this.saveSession(session);

      // 세션에 3회 이상 대화가 쌓였거나 세션 종료 느낌일 때 자동으로 요약 처방 카드 생성 시도
      if (session.messages.length >= 4 && !session.prescribedActionItems) {
        this.extractActionSummary(session).then((summary) => {
          if (summary && parentPhone && (session.tier === 'premium' || (session.tier as string) === 'premium_plus')) {
            kakaoNotificationService.triggerAiConsultationSummary(
              session.studentId,
              session.tier,
              assessment?.student?.name || '학생',
              parentPhone,
              userMessage.slice(0, 30),
              summary.join(' / ')
            );
          }
        });
      }

      return { session, assistantMessage: replyText };
    } catch (e: any) {
      console.error('[AIConsultationService] Error:', e);
      return {
        session,
        assistantMessage: 'AI 상담 엔진 연결 중 네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
        error: e.message || 'AI_ERROR',
      };
    }
  }

  /**
   * 상담 종료 시 [오늘의 3대 실천 처방 카드] 생성
   */
  public async extractActionSummary(session: ConsultationSession): Promise<string[]> {
    if (session.messages.length < 2) return [];

    const fullChat = session.messages.map((m) => `${m.sender}: ${m.content}`).join('\n');
    const prompt = `다음 상담 대화에서 학생이 오늘 즉시 실천해야 할 [핵심 행동 처방 3가지]를 각 1줄의 짧고 명확한 문장으로 추출해 주세요.
반드시 아래 JSON 배열 형식으로만 응답하세요:
["처방 1", "처방 2", "처방 3"]

대화 내용:
${fullChat.slice(-2000)}`;

    try {
      const res = await generateAIResponse(prompt, '행동 처방 요약 추출기', null, 'fast');
      const match = res.text.match(/\[[\s\S]*\]/);
      if (match) {
        const items = JSON.parse(match[0]);
        session.prescribedActionItems = items;
        this.saveSession(session);
        return items;
      }
    } catch { /* ignore */ }

    const fallback = ['4-7-8 자율신경 이완 호흡 3분 실천', '오후 골든타임에 취약 과목 35분 집중', '취침 1시간 전 스마트폰 블루라이트 차단'];
    session.prescribedActionItems = fallback;
    this.saveSession(session);
    return fallback;
  }

  private saveSession(session: ConsultationSession) {
    try {
      const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY_SESSIONS) || '{}');
      sessions[session.sessionId] = session;
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    } catch { /* ignore */ }
  }

  public getSession(sessionId: string): ConsultationSession | null {
    try {
      const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY_SESSIONS) || '{}');
      return sessions[sessionId] || null;
    } catch {
      return null;
    }
  }

  public getStudentSessions(studentId: string): ConsultationSession[] {
    try {
      const sessions: Record<string, ConsultationSession> = JSON.parse(localStorage.getItem(STORAGE_KEY_SESSIONS) || '{}');
      return Object.values(sessions).filter((s: ConsultationSession) => s.studentId === studentId);
    } catch {
      return [];
    }
  }
}

export const aiConsultationService = new AIConsultationService();
