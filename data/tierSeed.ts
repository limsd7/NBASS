import type { UserTierOverride } from '../services/userTierService';

// 테스트/시드 등급은 코드 하드코딩이 아닌 이 파일에서만 관리.
// 프로덕션 기본값은 빈 객체. 필요시 오너 콘솔에서 등록.
export const TIER_SEED_OVERRIDES: Record<string, UserTierOverride> = {};
