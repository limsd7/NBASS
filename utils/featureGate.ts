export type MembershipTier = 'free' | 'pro' | 'premium' | 'premium_plus' | 'vip' | 'expert' | 'basic';

export type FeatureKey =
    | 'basic_survey'
    | 'simple_tendency_summary'      // 무료: 성향 유형 + 1줄 요약
    | 'single_student_report'        // PRO (1회 ₩9,000): 1회 학생용 풀 리포트
    | 'expert_learning_report'       // PREMIUM (월 ₩9,900): 전문가용 심층 학습 리포트
    | 'kakaotalk_weekly_alert'       // PREMIUM: 카카오톡 주간 알림톡
    | 'grade_simulation'             // PREMIUM: 성적 시뮬레이션
    | 'grade_management'             // PREMIUM: 성적 관리 (전체 기능)
    | 'nutritional_prescription'     // PREMIUM: 1:1 맞춤 영양제 처방 발급
    | 'ai_study_plan'                // PREMIUM PLUS: AI 맞춤 공부 시간표
    | 'unlimited_ai_consultation'    // PREMIUM PLUS (월 ₩19,900): 실시간 AI 1:1 학습 클리닉 & 심층 컨설팅
    | 'habit_clinic'                 // PREMIUM PLUS: 공부습관 교정 클리닉
    | 'medical_report_pdf'           // PREMIUM PLUS: 14P 초정밀 의학 리포트북 PDF
    | 'full_vip_features'            // VIP (월 ₩29,900): 전 기능 무제한 + 심층 신경인지 & 멘탈 케어
    | 'hrv_eeg_precision_analysis'   // VIP: 심층 신경인지 & 멘탈 바이오리듬 정밀 분석
    | 'sleep_management'             // VIP: 심층 맞춤형 수면 관리 & 서카디안 리듬
    | 'sleep_analysis'               // VIP: 수면 분석 & 크로노타입
    | 'mental_management'            // VIP: 심층 멘탈 관리 및 마인드셋 케어
    | 'prediction_engine';           // VIP: 뇌-신체 위험 예측 분석 엔진

export const FEATURE_ACCESS: Record<FeatureKey, MembershipTier[]> = {
    basic_survey: ['free', 'pro', 'premium', 'premium_plus', 'vip', 'expert'],
    simple_tendency_summary: ['free', 'pro', 'premium', 'premium_plus', 'vip', 'expert'],
    single_student_report: ['pro', 'premium', 'premium_plus', 'vip', 'expert'],
    expert_learning_report: ['premium', 'premium_plus', 'vip', 'expert'],
    kakaotalk_weekly_alert: ['premium', 'premium_plus', 'vip', 'expert'],
    grade_simulation: ['premium', 'premium_plus', 'vip', 'expert'],
    grade_management: ['premium', 'premium_plus', 'vip', 'expert'],
    nutritional_prescription: ['premium', 'premium_plus', 'vip', 'expert'],
    ai_study_plan: ['premium_plus', 'vip', 'expert'],
    unlimited_ai_consultation: ['premium_plus', 'vip', 'expert'],
    habit_clinic: ['premium_plus', 'vip', 'expert'],
    medical_report_pdf: ['premium_plus', 'vip', 'expert'],
    full_vip_features: ['vip', 'expert'],
    hrv_eeg_precision_analysis: ['vip', 'expert'],
    sleep_management: ['vip', 'expert'],
    sleep_analysis: ['vip', 'expert'],
    mental_management: ['vip', 'expert'],
    prediction_engine: ['vip', 'expert']
};

export const TIER_RANK: Record<MembershipTier, number> = {
    free: 0,
    basic: 0,
    pro: 1,
    premium: 2,
    premium_plus: 3,
    vip: 4,
    expert: 5
};

export function getMinimumRequiredTier(feature: FeatureKey): MembershipTier {
    const allowed = FEATURE_ACCESS[feature];
    if (!allowed || allowed.length === 0) return 'premium';
    const valid = allowed.filter(t => t !== 'basic' && t !== 'free');
    if (valid.length === 0) return 'free';
    valid.sort((a, b) => (TIER_RANK[a] ?? 0) - (TIER_RANK[b] ?? 0));
    return valid[0];
}

export function canAccess(tier: MembershipTier, feature: FeatureKey): boolean {
    if (tier === 'expert') return true; // 전문가 등급은 취약점/오류 검증을 위해 전 기능 100% 무제한 해금
    return FEATURE_ACCESS[feature]?.includes(tier) ?? false;
}

export const TIER_INFO: Record<MembershipTier, {
    name: string;
    badge: string;
    color: string;
    icon: string;
    price: string;
    priceNumber: number;
    billingType: 'free' | 'once' | 'monthly';
    description: string;
    highlightFeatures: string[];
    ctaText: string;
}> = {
    free: {
        name: 'FREE (무료 진단)',
        badge: '무료 체험',
        color: 'slate',
        icon: '🌱',
        price: '₩0',
        priceNumber: 0,
        billingType: 'free',
        description: '3분 뇌-신체 학습 성향 진단 및 유형 요약',
        highlightFeatures: [
            '뇌-신체 공부 성향 기본 진단',
            '4대 케어타입(정서불안/몰입저하 등) 분류',
            '핵심 1줄 요약 진단 확인'
        ],
        ctaText: '무료 진단 시작'
    },
    pro: {
        name: '1회 스타터 패스 (PRO)',
        badge: '부담 없는 1회권',
        color: 'blue',
        icon: '⚡',
        price: '₩9,000 (1회)',
        priceNumber: 9000,
        billingType: 'once',
        description: '학부모를 위한 1회 학생용 정밀 진단 리포트 즉시 열람',
        highlightFeatures: [
            '학생용 맞춤 학습 솔루션 전체 열람',
            '골든타임 공부 시간표 및 취약 과목 분석',
            '시험불안·작업기억 인지 분석 상세표',
            '영양·수면·미주신경 이완 1회 처방전'
        ],
        ctaText: '₩9,000원에 1회 리포트 열기'
    },
    premium: {
        name: 'PREMIUM 정기구독',
        badge: '가장 인기 / 베이직 구독',
        color: 'indigo',
        icon: '💎',
        price: '₩9,900 / 월',
        priceNumber: 9900,
        billingType: 'monthly',
        description: '구체적인 전문가용 심층 리포트 + 카카오톡 주간 알림 케어',
        highlightFeatures: [
            '구체적 전문가용 심층 학습 리포트 무제한',
            '📊 성적 관리 & 실전 성적 시뮬레이션 및 대학 예측',
            '💊 1:1 맞춤 영양제 처방전 정밀 발급',
            '🔔 카카오톡 수험생 주간 컨디션/성적 알림톡 발송',
            'AI 크로노타입 맞춤형 주간 공부 루틴 트래커'
        ],
        ctaText: '월 9,900원에 정기 케어 구독'
    },
    premium_plus: {
        name: 'PREMIUM PLUS (AI 클리닉 & 스케줄)',
        badge: '추천 / AI 컨설팅 & 스케줄',
        color: 'purple',
        icon: '✨',
        price: '₩19,900 / 월',
        priceNumber: 19900,
        billingType: 'monthly',
        description: '프리미엄 전 기능 + 스마트 케어 스케줄러 + 1:1 AI 학습 클리닉',
        highlightFeatures: [
            '📅 스마트 케어 스케줄 관리 (서큘러 24시간 시간표 & 뽀모도로)',
            '🎯 D-Day 시험 모드 플래너 & 과목별 목표 시간 트래커',
            '🤖 Claude / DeepSeek 기반 1:1 실시간 AI 심층 학습 클리닉',
            '📄 14페이지 초정밀 의학 리포트북 PDF 무제한 인쇄/발급',
            '전체 PREMIUM 기능(성적 시뮬레이션/알림톡) 100% 무제한 포함'
        ],
        ctaText: '월 19,900원에 AI 클리닉 & 스케줄 구독'
    },
    vip: {
        name: 'VIP 수면·멘탈 & 센서 마스터',
        badge: '최고급 VIP 솔루션',
        color: 'amber',
        icon: '👑',
        price: '₩29,900 / 월',
        priceNumber: 29900,
        billingType: 'monthly',
        description: '1:1 맞춤형 수면 관리 & 심층 멘탈 케어 + VIP 인지신경 정밀 처방',
        highlightFeatures: [
            '🌙 1:1 맞춤형 수면관리 & 서카디안 리듬 솔루션',
            '🧠 심층 멘탈관리 & 마인드셋 Zen 케어',
            '전체 PREMIUM PLUS 기능 100% 무제한 포함',
            '병원 EMR 연동형 전문의/전문가용 심층 소견서 출력',
            '수능 킬러문항 집중력 유지 골든타임 스케줄러'
        ],
        ctaText: '월 29,900원에 VIP 멤버십 신청'
    },
    basic: {
        name: 'BASIC (기본)',
        badge: '기본',
        color: 'gray',
        icon: '📘',
        price: '₩0',
        priceNumber: 0,
        billingType: 'free',
        description: '기본 기능 이용',
        highlightFeatures: ['기본 진단 및 리포트'],
        ctaText: '기본 모드'
    },
    expert: {
        name: 'EXPERT (오너 전권 / 오류 검증용)',
        badge: '오너 오류 검증 전용',
        color: 'rose',
        icon: '🛠️',
        price: '관리자 전용',
        priceNumber: 0,
        billingType: 'free',
        description: '취약점 및 기능적 오류 탐색을 위한 전 기능 해금 & 디버깅 등급',
        highlightFeatures: [
            '모든 PRO, PREMIUM, PLUS, VIP 기능 무제한 완전 해금',
            '페이월 및 모듈 잠금 완전 우회 (Bypass all paywalls)',
            '앱 취약점 및 기능 오류 실시간 디버그 검증 권한',
            '생체·인지·학습 원시 데이터 전체 열람 및 수정'
        ],
        ctaText: '전문가 등급 활성'
    }
};

export function getNextTier(current: MembershipTier): MembershipTier | null {
    switch (current) {
        case 'free': return 'pro';
        case 'pro': return 'premium';
        case 'premium': return 'premium_plus';
        case 'premium_plus': return 'vip';
        case 'vip': return 'expert';
        case 'expert': return null;
        default: return null;
    }
}
