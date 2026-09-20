import React, { useState } from 'react';
import { ManualModal } from './modals/ManualModal';
import { SubscriptionModal } from './modals/SubscriptionModal';
import { MembershipTier, TIER_INFO } from '../utils/featureGate';

interface LayoutProps {
  children: React.ReactNode;
  activeMenu: string;
  onMenuChange: (menu: 'dashboard' | 'assessment' | 'results' | 'schedule' | 'sleep' | 'grades' | 'history' | 'growth' | 'wrongnotes' | 'resources' | 'solutions' | 'habits') => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onAdminClick?: () => void;
  onAdminPortalClick?: () => void;
  onOwnerClick?: () => void;
  onHomeClick?: () => void;
  expertGuideAction?: () => void;
  isExpertMode?: boolean;
  incompleteModal?: React.ReactNode;
  draftRecoveryBanner?: React.ReactNode;
  studentName?: string;
  studentId?: string;
  membershipTier?: MembershipTier;
  onPricingClick?: () => void;
  isSubscriptionOpen?: boolean;
  onSubscriptionClose?: () => void;
  onSubscriptionSelectTier?: (tier: MembershipTier) => void;
  subscriptionTriggerReason?: string;
  subscriptionInitialTier?: MembershipTier;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeMenu,
  onMenuChange,
  isDarkMode,
  onToggleDarkMode,
  onAdminClick,
  onAdminPortalClick,
  onOwnerClick,
  onHomeClick,
  expertGuideAction,
  isExpertMode,
  incompleteModal,
  draftRecoveryBanner,
  studentName,
  studentId,
  membershipTier,
  onPricingClick,
  isSubscriptionOpen,
  onSubscriptionClose,
  onSubscriptionSelectTier,
  subscriptionTriggerReason,
  subscriptionInitialTier
}) => {
  const [showManual, setShowManual] = useState(false);
  const isOwner = typeof window !== 'undefined' && localStorage.getItem('nbass_current_role') === 'OWNER';

  const menuItems = [
    {
      id: 'dashboard',
      label: '대시보드',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: 'assessment',
      label: '종합진단검사',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      badgeText: 'PRO'
    },
    {
      id: 'results',
      label: '검사결과',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'schedule',
      label: '스케줄 관리',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      badgeText: 'PLUS+'
    },
    {
      id: 'habits',
      label: '공부습관 교정',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      badgeText: 'PLUS+'
    },
    {
      id: 'history',
      label: '이력분석',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'growth',
      label: '성장 타임라인',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17l6-6 4 4 8-8M21 7h-5m5 0v5" />
        </svg>
      )
    },
    {
      id: 'grades',
      label: '성적 관리',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      badgeText: 'PREMIUM'
    },
    {
      id: 'wrongnotes',
      label: '오답노트 처방',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      badgeText: 'VIP'
    },
    {
      id: 'sleep',
      label: '수면 관리',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      badgeText: 'VIP'
    },
    {
      id: 'solutions',
      label: '멘탈 가이드',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      badgeText: 'VIP'
    },
    {
      id: 'resources',
      label: '자료실',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors text-slate-900 dark:text-slate-100">
      <header className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 no-print transition-colors">
        <div className="w-full px-3 md:px-5 xl:px-8 h-16 flex items-center justify-between flex-nowrap overflow-x-auto no-scrollbar gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3 shrink-0 flex-nowrap">
            <div
              className="flex items-center gap-2 md:gap-3 cursor-pointer group shrink-0"
              onClick={() => {
                if (onHomeClick) {
                  onHomeClick();
                } else {
                  try {
                    const url = new URL(window.location.href);
                    url.search = '?view=landing';
                    window.history.pushState({}, '', url.toString());
                  } catch { }
                  window.location.href = '/?view=landing';
                }
              }}
              title="홈페이지 인트로로 이동"
            >
              <div className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 bg-white">
                <img
                  src="./NBASS logo.jpg"
                  alt="NBASS Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col shrink-0">
                <h1 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none flex items-center gap-1.5 whitespace-nowrap">
                  <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">NBASS</span>
                  {onHomeClick && (
                    <span className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-md transition-colors flex items-center gap-1 whitespace-nowrap">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                      수험생 홈
                    </span>
                  )}
                </h1>
                <span className="text-[9px] md:text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-0.5 whitespace-nowrap">Neuro-Bio Academic System</span>
              </div>
            </div>

            {/* Student ID & Membership Tier Badge */}
            {(studentName || studentId) && (
              <div className="hidden lg:flex items-center gap-2 pl-2.5 ml-1 border-l border-slate-200 dark:border-slate-700 shrink-0 flex-nowrap">
                <div className="flex items-center gap-1.5 md:gap-2 bg-slate-100/90 dark:bg-slate-700/60 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm shrink-0 whitespace-nowrap">
                  <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center text-[11px] font-black shadow-sm shrink-0">
                    {studentName ? studentName.slice(0, 1) : '학'}
                  </div>
                  <div className="flex items-center gap-1 leading-tight">
                    <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1 whitespace-nowrap">
                      {studentName || '학생'}
                      {studentId && <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-medium">({studentId})</span>}
                    </span>
                  </div>
                  {/* Membership Tier Badge */}
                  {membershipTier && (
                    <button
                      type="button"
                      onClick={onPricingClick}
                      title="멤버십 등급 확인 및 변경"
                      className={`text-[9.5px] font-black px-2 py-0.5 rounded-full border flex items-center gap-1 shadow-sm shrink-0 whitespace-nowrap transition-all ${onPricingClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''} ${membershipTier === 'expert'
                        ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-300'
                        : membershipTier === 'vip'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-400 font-black'
                          : membershipTier === 'premium_plus'
                            ? 'bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-300'
                            : membershipTier === 'premium'
                              ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-300'
                              : membershipTier === 'pro'
                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300'
                                : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 border-slate-300'
                        }`}>
                      <span>{TIER_INFO[membershipTier]?.icon || '🌱'}</span>
                      <span>{membershipTier.toUpperCase()}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 md:gap-2.5 shrink-0 flex-nowrap">
            <nav className="flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300 flex-nowrap whitespace-nowrap">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => onMenuChange(item.id as any)}
                  className={`px-2.5 md:px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 font-semibold text-[11px] md:text-xs relative whitespace-nowrap shrink-0 ${activeMenu === item.id
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 shadow-sm border border-indigo-200 dark:border-indigo-800/60'
                    : 'hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {(item as any).badgeText && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md font-mono tracking-tight shadow-sm ml-0.5 ${(item as any).badgeText === 'VIP'
                        ? 'bg-amber-400 text-slate-950'
                        : (item as any).badgeText === 'PRO'
                          ? 'bg-blue-600 text-white'
                          : 'bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200'
                      }`}>
                      {(item as any).badgeText}
                    </span>
                  )}
                </button>
              ))}
              <a
                href="/?view=landing"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/?view=landing';
                }}
                className="px-2.5 md:px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm shrink-0 whitespace-nowrap"
                title="NBASS 소개 및 안내 홈페이지로 이동"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                <span>소개 페이지</span>
              </a>
            </nav>

            {/* Admin Mode Portal Button */}
            {onAdminPortalClick && (
              <button
                onClick={onAdminPortalClick}
                className="px-2.5 md:px-3 py-1.5 rounded-xl border border-indigo-500/40 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm hover:shadow shrink-0 whitespace-nowrap"
                title="관리자 포털 진입"
              >
                <svg className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <span>관리자 모드</span>
              </button>
            )}

            {/* Solopreneur Owner AI Center Button */}
            {onOwnerClick && isOwner && (
              <button
                onClick={onOwnerClick}
                className="px-2.5 md:px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm shrink-0 whitespace-nowrap"
                title="오너 전용 관제 센터"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                <span>오너 관제</span>
              </button>
            )}

            {/* Admin Config Button */}
            {onAdminClick && isOwner && (
              <button
                onClick={onAdminClick}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                title="관리자 설정"
              >
                <svg className="w-4 h-4 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
            )}

            {/* Dark Mode Toggle */}
            {onToggleDarkMode && (
              <button
                onClick={onToggleDarkMode}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
              >
                {isDarkMode ? (
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
                ) : (
                  <svg className="w-4 h-4 text-slate-700" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                )}
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="w-full px-4 md:px-6 xl:px-10 py-6">
        {draftRecoveryBanner}
        {children}
      </main>

      {/* Manual Modal */}
      <ManualModal isOpen={showManual} onClose={() => setShowManual(false)} />

      {/* Incomplete Assessment Modal Slot */}
      {incompleteModal}

      {/* Subscription Modal */}
      {isSubscriptionOpen && onSubscriptionClose && onSubscriptionSelectTier && (
        <SubscriptionModal
          isOpen={isSubscriptionOpen}
          onClose={onSubscriptionClose}
          currentTier={membershipTier || 'free'}
          onSelectTier={onSubscriptionSelectTier}
          triggerReason={subscriptionTriggerReason}
          initialTier={subscriptionInitialTier || 'pro'}
        />
      )}
    </div>
  );
};
