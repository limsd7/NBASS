import { MembershipTier } from '../types';

export const TIER_HIERARCHY: Record<MembershipTier, number> = {
  free: 0,
  pro: 1,
  premium: 2,
  premium_plus: 3,
  vip: 4,
  expert: 5,
};

export const TIER_NAMES: Record<MembershipTier, string> = {
  free: '무료 회원 (FREE)',
  pro: '1회 리포트 회원 (₩24,900)',
  premium: '정기결제 회원 (월 ₩19,900)',
  premium_plus: '정기결제 플러스 (월 ₩29,900)',
  vip: 'VIP 회원',
  expert: 'EXPERT (관리자 전용)',
};

export const TIER_PRICES: Record<MembershipTier, { price: string; billing: string; desc: string }> = {
  free: {
    price: '₩0',
    billing: '무료',
    desc: '3분 뇌-신체 공부 성향 기본 진단 및 12종 케어타입 분류, 핵심 1줄 진단 소견 무료 열람'
  },
  pro: {
    price: '₩24,900',
    billing: '1회 결제 (영구 소장)',
    desc: '14P 초정밀 신경인지 솔루션 리포트북 PDF 영구 발급, 전두엽 활성도 & 작업기억 분석, 골든타임 시간표 (1회)'
  },
  premium: {
    price: '₩19,900 / 월',
    billing: '정기구독 (첫 달 ₩14,900)',
    desc: '매주 일요일 밤 엄마 카톡 주간 브리핑 + 매주 AI 골든타임 시간표 + 실전 성적 관리/목표 시뮬레이션 + 14P 리포트북 상시 무료'
  },
  premium_plus: {
    price: '₩29,900 / 월',
    billing: '정기구독 플러스',
    desc: '정기결제 전 기능 + 심층 코칭 우선 지원'
  },
  vip: {
    price: '별도 문의',
    billing: 'VIP',
    desc: '전 기능 + 1:1 전담 관리'
  },
  expert: {
    price: '관리자 전용',
    billing: '무제한',
    desc: '전 기능 100% 무제한 해금 및 전체 관제 권한'
  }
};

export const TIER_BADGE_STYLES: Record<MembershipTier, string> = {
  free: 'bg-slate-100 text-slate-700 border-slate-300',
  pro: 'bg-blue-100 text-blue-800 border-blue-300',
  premium: 'bg-indigo-100 text-indigo-800 border-indigo-300 font-black',
  premium_plus: 'bg-purple-100 text-purple-800 border-purple-300 font-black',
  vip: 'bg-amber-100 text-amber-900 border-amber-300 font-black',
  expert: 'bg-rose-100 text-rose-900 border-rose-300 font-bold',
};

export function hasRequiredTier(userTier: MembershipTier, requiredTier: MembershipTier): boolean {
  return (TIER_HIERARCHY[userTier] ?? 0) >= (TIER_HIERARCHY[requiredTier] ?? 0);
}

// ---------------------------------------------------------------------------
// 요금제 중앙 게이트 (무료=리포트 열람만, pro=상세 리포트 열람만, premium+=전체 사용)
// ---------------------------------------------------------------------------
export type FeatureKey =
  | 'report'        // 요약 리포트 열람 — 전 등급
  | 'reportDetail'  // 상세 리포트 (5지표·기질그래프·전체이력) — pro 이상
  | 'assessment'    // 신규 정밀진단 — free 첫 1회, premium 이상 무제한 (pro 불가)
  | 'history'       // 전체 이력 — pro 이상
  | 'letterCopy'    // 소견서 복사 — premium 이상
  | 'clinic' | 'grade' | 'habit' | 'sleep' | 'schedule' | 'wrongNotes'; // 기능 탭 — premium 이상

export function canUseFeature(
  tier: MembershipTier,
  feature: FeatureKey,
  ctx?: { assessmentCount?: number }
): boolean {
  if (tier === 'expert') return true;
  switch (feature) {
    case 'report':
      return true;
    case 'assessment': {
      if (tier === 'premium' || tier === 'premium_plus' || tier === 'vip') return true;
      if (tier === 'free') return (ctx?.assessmentCount ?? 0) === 0;
      return false; // pro(1회권)는 열람 전용
    }
    case 'reportDetail':
    case 'history':
      return tier !== 'free';
    case 'letterCopy':
    case 'clinic':
    case 'grade':
    case 'habit':
    case 'sleep':
    case 'schedule':
    case 'wrongNotes':
      return tier === 'premium' || tier === 'premium_plus' || tier === 'vip';
    default:
      return false;
  }
}

/** 무료 1회 진단 소진 시 표시할 안내 문구 */
export function freeAssessmentExhaustedMessage(): string {
  return '무료 1회 진단을 사용했습니다. 추가 진단은 정기결제 후 이용 가능합니다.';
}
