import React, { useState, useEffect } from 'react';
import { MembershipTier, TIER_INFO } from '../../utils/featureGate';
import {
  LicenseInfo,
  activateLicense,
  getLicenseInfo,
  checkLicenseValidity,
  generateTrialLicense,
  saveLicenseInfo,
} from '../../utils/licenseManager';
import { MembershipBadge } from './MembershipBadge';

interface LicenseActivationProps {
  onActivated: (info: LicenseInfo) => void;
  onSkip?: () => void;
}

/**
 * LicenseActivation
 * 
 * 라이선스 키 입력 및 활성화 화면.
 * 30일 무료 체험 시작 또는 라이선스 키 입력을 선택할 수 있습니다.
 */
export const LicenseActivation: React.FC<LicenseActivationProps> = ({
  onActivated,
  onSkip,
}) => {
  const [mode, setMode] = useState<'choice' | 'key_input' | 'activated'>('choice');
  const [keyInput, setKeyInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activatedInfo, setActivatedInfo] = useState<LicenseInfo | null>(null);

  // Check if already activated on mount
  useEffect(() => {
    const checkExisting = async () => {
      try {
        const existing = await getLicenseInfo();
        if (existing && existing.isValid) {
          const validity = await checkLicenseValidity();
          if (validity.isValid) {
            onActivated(existing);
          }
        }
      } catch (e) {
        // No existing license, show activation screen
      }
    };
    checkExisting();
  }, [onActivated]);

  // Auto-format key input: NBXX-XXXX-XXXX-XXXX
  const handleKeyChange = (value: string) => {
    // Remove all non-alphanumeric characters
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Add dashes after every 4 characters (except prefix which is 4 chars: NBXX)
    let formatted = '';
    for (let i = 0; i < clean.length && i < 16; i++) {
      if (i > 0 && i % 4 === 0) formatted += '-';
      formatted += clean[i];
    }
    setKeyInput(formatted);
    setError('');
  };

  const handleActivateKey = async () => {
    if (keyInput.length < 19) {
      setError('라이선스 키를 완전히 입력해 주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const info = await activateLicense(keyInput);
      setActivatedInfo(info);
      setMode('activated');
      onActivated(info);
    } catch (e: any) {
      setError(e.message || '유효하지 않은 라이선스 키입니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrial = async () => {
    setLoading(true);
    try {
      const trialInfo = generateTrialLicense();
      await saveLicenseInfo(trialInfo);
      setActivatedInfo(trialInfo);
      setMode('activated');
      onActivated(trialInfo);
    } catch (e: any) {
      setError('체험판 활성화 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'activated' && activatedInfo) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      }}>
        <div style={{
          background: 'white', borderRadius: '20px', padding: '48px',
          maxWidth: '480px', width: '90%', textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          animation: 'fadeInUp 0.5s ease-out',
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: '36px',
          }}>
            ✓
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', marginBottom: '12px' }}>
            활성화 완료!
          </h2>
          <div style={{ marginBottom: '16px' }}>
            <MembershipBadge tier={activatedInfo.tier} variant="full" size="lg" />
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
            만료일: {new Date(activatedInfo.expiresAt).toLocaleDateString('ko-KR')}
          </p>
          {activatedInfo.centerName && (
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              센터: {activatedInfo.centerName}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (mode === 'key_input') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      }}>
        <div style={{
          background: 'white', borderRadius: '20px', padding: '40px',
          maxWidth: '480px', width: '90%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          <button
            onClick={() => { setMode('choice'); setError(''); setKeyInput(''); }}
            style={{
              background: 'none', border: 'none', color: '#6366f1',
              fontSize: '14px', cursor: 'pointer', marginBottom: '20px',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}
          >
            ← 뒤로 가기
          </button>

          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
            🔑 라이선스 키 입력
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
            구매 시 제공받은 라이선스 키를 입력해 주세요.
          </p>

          <input
            type="text"
            value={keyInput}
            onChange={(e) => handleKeyChange(e.target.value)}
            placeholder="NBXX-XXXX-XXXX-XXXX"
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '18px',
              fontFamily: 'monospace',
              fontWeight: 700,
              textAlign: 'center',
              letterSpacing: '2px',
              border: error ? '2px solid #ef4444' : '2px solid #e2e8f0',
              borderRadius: '12px',
              outline: 'none',
              marginBottom: '8px',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              if (!error) e.currentTarget.style.borderColor = '#6366f1';
            }}
            onBlur={(e) => {
              if (!error) e.currentTarget.style.borderColor = '#e2e8f0';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleActivateKey();
            }}
            maxLength={19}
          />

          {error && (
            <p style={{ fontSize: '12px', color: '#ef4444', marginBottom: '12px', textAlign: 'center' }}>
              ⚠️ {error}
            </p>
          )}

          <button
            onClick={handleActivateKey}
            disabled={loading || keyInput.length < 19}
            style={{
              width: '100%',
              padding: '14px',
              background: loading || keyInput.length < 19
                ? '#cbd5e1'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: loading || keyInput.length < 19 ? 'not-allowed' : 'pointer',
              marginTop: '8px',
            }}
          >
            {loading ? '확인 중...' : '라이선스 활성화'}
          </button>

          {/* Tier info */}
          <div style={{
            marginTop: '24px', padding: '16px',
            background: '#f8fafc', borderRadius: '12px',
            fontSize: '12px', color: '#64748b',
          }}>
            <p style={{ fontWeight: 600, marginBottom: '8px', color: '#475569' }}>라이선스 키 유형:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span>NB1-XXXX-XXXX-XXXX → ⭐ 베이직</span>
              <span>NB2-XXXX-XXXX-XXXX → 💎 프리미엄</span>
              <span>NB3-XXXX-XXXX-XXXX → 💎 PREMIUM</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default: Choice screen
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)',
    }}>
      <div style={{
        maxWidth: '520px', width: '90%', textAlign: 'center',
      }}>
        {/* Logo area */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            fontSize: '48px', marginBottom: '12px',
            filter: 'drop-shadow(0 4px 8px rgba(99, 102, 241, 0.4))',
          }}>
            🧠
          </div>
          <h1 style={{
            fontSize: '28px', fontWeight: 900, color: 'white', marginBottom: '8px',
            letterSpacing: '-0.5px',
          }}>
            NBASS
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>
            Neuro-Bio Academic Strategy System
          </p>
        </div>

        {/* Option cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Trial button */}
          <button
            onClick={handleStartTrial}
            disabled={loading}
            style={{
              background: 'white', border: 'none', borderRadius: '16px',
              padding: '24px', cursor: 'pointer',
              textAlign: 'left',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(99, 102, 241, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', flexShrink: 0,
              }}>
                🚀
              </div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                  30일 무료 체험 시작
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  모든 프리미엄 기능을 30일간 무료로 이용하세요
                </p>
              </div>
            </div>
          </button>

          {/* License key button */}
          <button
            onClick={() => setMode('key_input')}
            style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '16px', padding: '24px', cursor: 'pointer',
              textAlign: 'left', transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', flexShrink: 0,
              }}>
                🔑
              </div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                  라이선스 키 입력
                </h3>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                  이미 라이선스 키를 구매한 경우 여기에서 활성화
                </p>
              </div>
            </div>
          </button>

          {/* Skip (if allowed) */}
          {onSkip && (
            <button
              onClick={onSkip}
              style={{
                background: 'none', border: 'none', color: '#64748b',
                fontSize: '13px', cursor: 'pointer', padding: '12px',
                marginTop: '8px',
              }}
            >
              나중에 할게요 →
            </button>
          )}
        </div>

        {/* Tier comparison mini */}
        <div style={{
          marginTop: '32px', padding: '20px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>
            구독 플랜 비교
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {(['free', 'pro', 'premium'] as MembershipTier[]).map((t) => (
              <MembershipBadge key={t} tier={t} variant="full" size="sm" />
            ))}
          </div>
        </div>

        {error && (
          <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '12px' }}>
            ⚠️ {error}
          </p>
        )}
      </div>
    </div>
  );
};
