export type MembershipTier = 'free' | 'pro' | 'premium' | 'expert';

// 레거시 호환: 기존 저장값 'vip'·'premium_plus'는 'premium', 'basic'은 'free'로 정규화
export function normalizeTier(tier: unknown): MembershipTier {
    const t = typeof tier === 'string' ? tier.toLowerCase().trim() : '';
    if (t === 'vip' || t === 'premium_plus') return 'premium';
    if (t === 'basic') return 'free';
    if (t === 'pro' || t === 'premium' || t === 'expert') return t as MembershipTier;
    return 'free';
}

export type FeatureKey =
    | 'basic_survey'
    | 'simple_tendency_summary'      // 무료: 성향 유형 + 1줄 요약
    | 'single_student_report'        // 1회 리포트 (24,900원): 1회 학생용 풀 리포트
    | 'medical_report_pdf'           // 1회 리포트 & 정기결제: 14P 초정밀 솔루션 리포트북 PDF
    | 'expert_learning_report'       // 정기결제 (월 19,900원): 전문가용 심층 학습 리포트
    | 'kakaotalk_weekly_alert'       // 정기결제: 카카오톡 주간 안심 알림톡 (엄마 전용 브리핑)
    | 'grade_simulation'             // 정기결제: 성적 시뮬레이션 & 목표 대학 예측
    | 'grade_management'             // 정기결제: 성적 관리 (전체 기능)
    | 'nutritional_prescription'     // 정기결제: 1:1 맞춤 수험생 영양 섭취 가이드 발급
    | 'ai_study_plan'                // 정기결제: AI 맞춤 골든타임 공부 시간표 (주간 갱신)
    | 'unlimited_ai_consultation'    // 정기결제: 실시간 AI 1:1 학습 클리닉 & 심층 컨설팅
    | 'habit_clinic'                 // 정기결제: 수험생 공부습관 교정 클리닉 (Habit Clinic)
    | 'full_vip_features'            // 정기결제: 전 기능 무제한 + 심층 신경인지 & 멘탈 케어
    | 'hrv_eeg_precision_analysis'   // 정기결제: 심층 신경인지 & 멘탈 바이오리듬 정밀 분석
    | 'sleep_management'             // 정기결제: 심층 맞춤형 수면 관리 & 서카디안 리듬
    | 'sleep_analysis'               // 정기결제: 수면 분석 & 크로노타입
    | 'mental_management'            // 정기결제: 심층 멘탈 관리 및 마인드셋 케어
    | 'prediction_engine';           // 정기결제: 뇌-신체 위험 예측 분석 엔진

// 모든 지속 케어 기능은 정기결제(premium) 회원이 100% 누리도록 통합
export const FEATURE_ACCESS: Record<FeatureKey, MembershipTier[]> = {    basic_survey: ['free', 'pro', 'premium', 'expert'],
    simple_tendency_summary: ['free', 'pro', 'premium', 'expert'],
    single_student_report: ['pro', 'premium', 'expert'],
    medical_report_pdf: ['pro', 'premium', 'expert'],
    expert_learning_report: ['premium', 'expert'],
    kakaotalk_weekly_alert: ['premium', 'expert'],
    grade_simulation: ['premium', 'expert'],
    grade_management: ['premium', 'expert'],
    nutritional_prescription: ['premium', 'expert'],
    habit_clinic: ['premium', 'expert'],
    ai_study_plan: ['premium', 'expert'],
    unlimited_ai_consultation: ['premium', 'expert'],
    full_vip_features: ['premium', 'expert'],
    hrv_eeg_precision_analysis: ['premium', 'expert'],
    sleep_management: ['premium', 'expert'],
    sleep_analysis: ['premium', 'expert'],
    mental_management: ['premium', 'expert'],
    prediction_engine: ['premium', 'expert']
};

export const TIER_RANK: Record<MembershipTier, number> = {
    free: 0,
    pro: 1,
    premium: 2,
    expert: 5
};

export function getMinimumRequiredTier(feature: FeatureKey): MembershipTier {
    const allowed = FEATURE_ACCESS[feature];
    if (!allowed || allowed.length === 0) return 'premium';
    const valid = allowed.filter(t => t !== 'free');
    if (valid.length === 0) return 'free';
    valid.sort((a, b) => (TIER_RANK[a] ?? 0) - (TIER_RANK[b] ?? 0));
    return valid[0];
}

export function canAccess(tier: MembershipTier, feature: FeatureKey): boolean {
    const norm = normalizeTier(tier);
    if (norm === 'expert') return true; // 전문가/오너 등급은 전 기능 100% 무제한 해금
    return FEATURE_ACCESS[feature]?.includes(norm) ?? false;
}

export const TIER_INFO: Record<MembershipTier, {
    name: string;
    badge: string;
    color: string;
    icon: string;
    price: string;
    priceNumber: number;
    transitionPrice?: string;
    transitionPriceNumber?: number;
    billingType: 'free' | 'once' | 'monthly';
    description: string;
    highlightFeatures: string[];
    ctaText: string;
}> = {
    free: {
        name: '무료 회원 (FREE)',
        badge: 'FREE',
        color: 'slate',
        icon: '🌱',
        price: '0원',
        priceNumber: 0,
        billingType: 'free',
        description: '3분 뇌-신체 공부 성향 진단 및 12종 케어타입 분류를 즉시 확인합니다.',
        highlightFeatures: [
            '3분 뇌-신체 공부 성향 기본 진단',
            '12종 케어타입(정서불안/뇌피로/집중저하 등) 분류',
            '핵심 1줄 진단 소견 무료 열람'
        ],
        ctaText: '무료 진단 시작하기'
    },
    pro: {
        name: '1회 리포트 회원',
        badge: '1회 영구 소장',
        color: 'blue',
        icon: '⚡',
        price: '₩24,900',
        priceNumber: 24900,
        billingType: 'once',
        description: '14P 초정밀 전두엽 활성 & 두뇌 케어 솔루션 리포트북 1회 영구 발급 및 평생 소장.',
        highlightFeatures: [
            '📄 14페이지 초정밀 신경인지 솔루션 리포트북 PDF 영구 발급',
            '🧠 전두엽 활성도 & 작업기억(Working Memory) 인지 분석',
            '⏱️ 생체 바이오리듬 기반 골든타임 맞춤 공부 시간표 (1회)',
            '💊 수험생 맞춤 영양·수면·미주신경 긴급 이완 1회 케어 가이드'
        ],
        ctaText: '₩24,900원에 정밀 리포트 열기'
    },
    premium: {
        name: '정기결제 회원 (주간 케어)',
        badge: '🔥 학부모 87% 선택 / 강력 추천',
        color: 'indigo',
        icon: '💎',
        price: '₩19,900 / 월',
        priceNumber: 19900,
        transitionPrice: '첫 달 ₩14,900 (5,000원 즉시 할인)',
        transitionPriceNumber: 14900,
        billingType: 'monthly',
        description: '매주 엄마 카톡 브리핑 + AI 골든타임 시간표 + 14P 리포트북 상시 무료.',
        highlightFeatures: [
            '[엄마 안심] 매주 일요일 밤 카톡 주간 브리핑',
            '📅 매주 월요일 아침 "AI 맞춤형 골든타임 시간표" 자동 갱신',
            '📊 실전 성적 관리 & 목표 대학 합격 시뮬레이션 무제한',
            '🤖 1:1 실시간 AI 수험생 학습 클리닉 & 취약점 집중 솔루션',
            '🌙 수면 관리(서카디안 리듬) & D-Day 멘탈 마인드셋 케어',
            '🎁 14P 신경인지 솔루션 리포트북 무제한 열람 & 상시 업데이트'
        ],
        ctaText: '월 19,900원에 정기 케어 구독하기'
    },
    expert: {
        name: 'EXPERT (관리자/오너 전용)',
        badge: '관리자 전용',
        color: 'rose',
        icon: '🛠️',
        price: '관리자 전용',
        priceNumber: 0,
        billingType: 'free',
        description: '취약점 및 기능적 오류 탐색을 위한 전 기능 해금 & 디버깅 등급',
        highlightFeatures: [
            '모든 리포트 및 정기구독 기능 100% 무제한 완전 해금',
            '전체 학생/학부모 DB 및 관제 포털 접근 권한'
        ],
        ctaText: '관리자 모드'
    }
};

export function getNextTier(current: MembershipTier): MembershipTier | null {
    switch (normalizeTier(current)) {
        case 'free': return 'pro';
        case 'pro': return 'premium';
        case 'premium': return null;
        default: return null;
    }
}
