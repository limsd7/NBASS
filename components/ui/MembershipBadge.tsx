import React from 'react';
import { MembershipTier, TIER_INFO, normalizeTier } from '../../utils/featureGate';

interface MembershipBadgeProps {
  tier: MembershipTier;
  /** Show full tier info (name + price) or just icon + name */
  variant?: 'compact' | 'full';
  /** Size of the badge */
  size?: 'sm' | 'md' | 'lg';
  /** Optional click handler */
  onClick?: () => void;
}

const TIER_STYLES: Record<MembershipTier, {
  bg: string;
  text: string;
  border: string;
  glow: string;
}> = {
  free: {
    bg: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
    text: '#475569',
    border: '#cbd5e1',
    glow: 'none',
  },
  pro: {
    bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
    text: '#1d4ed8',
    border: '#93c5fd',
    glow: 'none',
  },
  premium: {
    bg: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
    text: '#6d28d9',
    border: '#a78bfa',
    glow: '0 0 12px rgba(139, 92, 246, 0.25)',
  },
  expert: {
    bg: 'linear-gradient(135deg, #fae8ff, #f0abfc)',
    text: '#86198f',
    border: '#d946ef',
    glow: '0 0 16px rgba(217, 70, 239, 0.4)',
  },
};

const TIER_SHORT_NAMES: Record<MembershipTier, string> = {
  free: 'FREE (무료)',
  pro: 'PRO (1회권)',
  premium: 'PREMIUM (구독)',
  expert: 'EXPERT (전권)',
};

const SIZE_STYLES = {
  sm: { padding: '2px 8px', fontSize: '11px', iconSize: '12px', gap: '4px' },
  md: { padding: '4px 12px', fontSize: '13px', iconSize: '14px', gap: '6px' },
  lg: { padding: '6px 16px', fontSize: '15px', iconSize: '18px', gap: '8px' },
};

/**
 * MembershipBadge
 * 
 * 사용자의 멤버십 등급을 시각적으로 표시하는 배지 컴포넌트.
 * Premium 등급에는 글로우 애니메이션 효과가 적용됩니다.
 */
export const MembershipBadge: React.FC<MembershipBadgeProps> = ({
  tier,
  variant = 'compact',
  size = 'md',
  onClick,
}) => {
  const norm = normalizeTier(tier);
  const info = TIER_INFO[norm] || TIER_INFO.free;
  const styles = TIER_STYLES[norm] || TIER_STYLES.free;
  const sizeStyle = SIZE_STYLES[size] || SIZE_STYLES.md;
  const displayName = size === 'sm' && variant === 'compact'
    ? (TIER_SHORT_NAMES[norm] || info.name)
    : info.name;

  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: sizeStyle.gap,
        padding: sizeStyle.padding,
        background: styles.bg,
        color: styles.text,
        border: `1px solid ${styles.border}`,
        borderRadius: '20px',
        fontSize: sizeStyle.fontSize,
        fontWeight: 700,
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: styles.glow,
        transition: 'all 0.2s ease',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.filter = 'brightness(1.05)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.filter = 'brightness(1)';
      }}
      title={variant === 'compact' ? `${info.name} (${info.price}) - 클릭하여 플랜 관리` : undefined}
    >
      <span style={{ fontSize: sizeStyle.iconSize }}>{info.icon}</span>
      <span>{displayName}</span>
      {variant === 'full' && (
        <span style={{ fontWeight: 500, opacity: 0.8 }}>
          {info.price}
        </span>
      )}
    </span>
  );
};
