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
  free: 'FREE (기본회원)',
  pro: 'PRO (스마트)',
  premium: 'PREMIUM (프리미엄)',
  premium_plus: 'PREMIUM+ (플러스)',
  vip: 'VIP (최고급)',
  expert: 'EXPERT (전문가)',
};

export const TIER_BADGE_STYLES: Record<MembershipTier, string> = {
  free: 'bg-slate-100 text-slate-700 border-slate-300',
  pro: 'bg-blue-100 text-blue-800 border-blue-300',
  premium: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  premium_plus: 'bg-purple-100 text-purple-800 border-purple-300',
  vip: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
  expert: 'bg-rose-100 text-rose-900 border-rose-300 font-bold',
};

export function hasRequiredTier(userTier: MembershipTier, requiredTier: MembershipTier): boolean {
  return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];
}
