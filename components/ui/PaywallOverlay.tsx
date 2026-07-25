import React, { useState } from 'react';
import { MembershipTier, FeatureKey, TIER_INFO, getNextTier, canAccess } from '../../utils/featureGate';

interface PaywallOverlayProps {
  currentTier: MembershipTier;
  requiredFeature: FeatureKey;
  children: React.ReactNode;
  /** Optional custom message shown in the paywall */
  customMessage?: string;
  /** If true, renders children with a blur effect instead of hiding them */
  showBlurred?: boolean;
  /** Callback when user clicks the upgrade button */
  onUpgradeClick?: (targetTier: MembershipTier) => void;
}

/**
 * PaywallOverlay
 * 
 * 사용자의 멤버십 등급이 해당 기능에 필요한 등급에 미달할 때
 * 블러 처리된 콘텐츠 위에 업그레이드 유도 오버레이를 표시합니다.
 */
export const PaywallOverlay: React.FC<PaywallOverlayProps> = ({
  currentTier,
  requiredFeature,
  children,
  customMessage,
  showBlurred = true,
  onUpgradeClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // If user has access, render children normally
  if (canAccess(currentTier, requiredFeature)) {
    return <>{children}</>;
  }

  const nextTier = getNextTier(currentTier);
  const nextTierInfo = nextTier ? TIER_INFO[nextTier] : null;
  const currentTierInfo = TIER_INFO[currentTier];

  // Feature display names (Korean)
  const FEATURE_LABELS: Record<FeatureKey, string> = {
    basic_survey: '기본 설문 검사',
    simple_tendency: '간단 성향 분석',
    detailed_classification: '12가지 상세 진단 분류',
    basic_prescription: '기본 처방',
    detailed_prescription: '상세 맞춤 처방',
    grade_tracking: '성적 입력 & 추이',
    grade_simulation: '성적 시뮬레이션 & 예측',
    ai_study_plan: 'AI 맞춤 공부 Plan',
    cognitive_assessment: '인지 수행 평가',
    sleep_analysis: '수면 분석 & 크로노타입',
    hrv_eeg_analysis: 'HRV/EEG 정밀 진단',
    medical_report: '의료급 전문 리포트',
    expert_consultation: '전문가 1:1 상담',
    prediction_engine: '위험 예측 엔진',
    data_export: '데이터 내보내기',
    unlimited_history: '무제한 검사 이력',
  };

  const featureLabel = FEATURE_LABELS[requiredFeature] || requiredFeature;

  return (
    <div className="relative" style={{ position: 'relative' }}>
      {/* Blurred content */}
      {showBlurred ? (
        <div
          style={{
            filter: 'blur(6px)',
            pointerEvents: 'none',
            userSelect: 'none',
            opacity: 0.6,
          }}
        >
          {children}
        </div>
      ) : (
        <div
          style={{
            minHeight: '200px',
            background: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%)',
            borderRadius: '12px',
          }}
        />
      )}

      {/* Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(2px)',
          borderRadius: '12px',
        }}
      >
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '420px',
            width: '90%',
            boxShadow: isHovered
              ? '0 20px 60px rgba(99, 102, 241, 0.25), 0 0 0 2px rgba(99, 102, 241, 0.1)'
              : '0 10px 40px rgba(0, 0, 0, 0.12)',
            textAlign: 'center' as const,
            transition: 'all 0.3s ease',
            transform: isHovered ? 'translateY(-2px)' : 'none',
          }}
        >
          {/* Lock icon */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '28px',
            }}
          >
            🔒
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: '8px',
            }}
          >
            프리미엄 기능입니다
          </h3>

          {/* Feature name */}
          <p
            style={{
              fontSize: '14px',
              color: '#6366f1',
              fontWeight: 600,
              marginBottom: '12px',
              padding: '4px 12px',
              background: '#eef2ff',
              borderRadius: '20px',
              display: 'inline-block',
            }}
          >
            {featureLabel}
          </p>

          {/* Description */}
          <p
            style={{
              fontSize: '13px',
              color: '#64748b',
              lineHeight: 1.6,
              marginBottom: '20px',
            }}
          >
            {customMessage ||
              `이 기능은 ${nextTierInfo?.name || '상위'} 등급 이상에서 사용할 수 있습니다.`}
          </p>

          {/* Current tier badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '20px',
              fontSize: '12px',
              color: '#94a3b8',
            }}
          >
            <span>현재 등급:</span>
            <span
              style={{
                padding: '2px 10px',
                borderRadius: '12px',
                background: '#f1f5f9',
                fontWeight: 600,
                color: '#475569',
              }}
            >
              {currentTierInfo.icon} {currentTierInfo.name}
            </span>
          </div>

          {/* Upgrade button */}
          {nextTier && nextTierInfo && (
            <button
              onClick={() => onUpgradeClick?.(nextTier)}
              style={{
                width: '100%',
                padding: '14px 24px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
              }}
            >
              {nextTierInfo.icon} {nextTierInfo.name}으로 업그레이드 — {nextTierInfo.price}
            </button>
          )}

          {/* Benefits preview */}
          {nextTier && (
            <p
              style={{
                fontSize: '11px',
                color: '#94a3b8',
                marginTop: '12px',
              }}
            >
              🎁 7일 무료 체험 · 언제든지 해지 가능
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * FeatureGate
 * 
 * 간단한 조건부 렌더링 래퍼. 접근 불가 시 children을 렌더링하지 않습니다.
 * Paywall UI 없이 조용히 기능을 숨기고 싶을 때 사용합니다.
 */
export const FeatureGate: React.FC<{
  tier: MembershipTier;
  feature: FeatureKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ tier, feature, children, fallback }) => {
  if (canAccess(tier, feature)) {
    return <>{children}</>;
  }
  return fallback ? <>{fallback}</> : null;
};
