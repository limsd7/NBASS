export type MembershipTier = 'free' | 'pro' | 'premium' | 'vip';

export type FeatureKey =
    | 'basic_survey'
    | 'simple_tendency_summary'      // 무료: 성향 유형 + 1줄 요약
    | 'single_student_report'        // PRO (1회 ₩9,000): 1회 학생용 풀 리포트
    | 'expert_learning_report'       // PREMIUM (월 ₩9,900): 전문가용 심층 학습 리포트
    | 'kakaotalk_weekly_alert'       // PREMIUM: 카카오톡 주간 알림톡
    | 'grade_simulation'             // PREMIUM: 성적 시뮬레이션
    | 'ai_study_plan'                // PREMIUM: AI 맞춤 공부 시간표
    | 'full_vip_features'            // VIP (월 ₩19,900): 전 기능 무제한
    | 'unlimited_ai_consultation'    // VIP: 실시간 AI 1:1 학습 클리닉
    | 'hrv_eeg_precision_analysis'   // VIP: 뇌파/자율신경 정밀 바이오피드백
    | 'medical_report_pdf';          // VIP: 병의원/센터 연동 정밀 리포트

export const FEATURE_ACCESS: Record<FeatureKey, MembershipTier[]> = {
    basic_survey: ['free', 'pro', 'premium', 'vip'],
    simple_tendency_summary: ['free', 'pro', 'premium', 'vip'],
    single_student_report: ['pro', 'premium', 'vip'],
    expert_learning_report: ['premium', 'vip'],
    kakaotalk_weekly_alert: ['premium', 'vip'],
    grade_simulation: ['premium', 'vip'],
    ai_study_plan: ['premium', 'vip'],
    full_vip_features: ['vip'],
    unlimited_ai_consultation: ['vip'],
    hrv_eeg_precision_analysis: ['vip'],
    medical_report_pdf: ['vip']
};

export function canAccess(tier: MembershipTier, feature: FeatureKey): boolean {
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
        badge: '가장 인기 / 앵커링 플랜',
        color: 'indigo',
        icon: '💎',
        price: '₩9,900 / 월',
        priceNumber: 9900,
        billingType: 'monthly',
        description: '구체적인 전문가용 심층 리포트 + 카카오톡 주간 알림 케어',
        highlightFeatures: [
            '구체적 전문가용 심층 학습 리포트 무제한',
            '🔔 카카오톡 수험생 주간 컨디션/성적 알림톡 발송',
            '주차별 성적 추이 & 모의고사 성적 시뮬레이션',
            'AI 크로노타입 맞춤형 주간 공부 루틴 트래커',
            '1회권(9,000원) 대비 단 900원 차이로 상시 케어'
        ],
        ctaText: '월 9,900원에 정기 케어 구독'
    },
    vip: {
        name: 'VIP 올인원 마스터',
        badge: '상위 1% 입시/클리닉',
        color: 'amber',
        icon: '👑',
        price: '₩19,900 / 월',
        priceNumber: 19900,
        billingType: 'monthly',
        description: 'NBASS 모든 기능 및 실시간 AI 1:1 학습 클리닉 무제한',
        highlightFeatures: [
            '전체 프리미엄 기능 + 카카오톡 주간 리포트',
            '🤖 Claude 3.7 / DeepSeek R1 기반 1:1 실시간 AI 학습 컨설팅',
            'HRV 심박변이도 & 뇌파(EEG) 정밀 바이오피드백',
            '의료/학원 전문가용 심층 소견서 PDF 출력',
            '수능 킬러문항 집중력 유지 골든타임 스케줄러'
        ],
        ctaText: '월 19,900원 VIP 전 기능 시작'
    }
};

export function getNextTier(current: MembershipTier): MembershipTier | null {
    switch (current) {
        case 'free': return 'pro';
        case 'pro': return 'premium';
        case 'premium': return 'vip';
        case 'vip': return null;
        default: return null;
    }
}
