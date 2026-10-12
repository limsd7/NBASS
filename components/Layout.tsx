import React, { useState } from 'react';
import { ManualModal } from './modals/ManualModal';
import { SubscriptionModal } from './modals/SubscriptionModal';
import { MembershipTier, TIER_INFO, normalizeTier } from '../utils/featureGate';

interface LayoutProps {
  children: React.ReactNode;
  activeMenu: string;
  onMenuChange: (menu: 'dashboard' | 'assessment' | 'results' | 'schedule' | 'sleep' | 'grades' | 'history' | 'growth' | 'wrongnotes' | 'resources' | 'solutions' | 'habits' | 'subjects' | 'subject_korean' | 'subject_math' | 'subject_english') => void;
  currentClinicSubject?: 'korean' | 'math' | 'english' | null;
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
  subscriptionOnlyTier?: MembershipTier;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeMenu,
  onMenuChange,
  currentClinicSubject,
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
  subscriptionInitialTier,
  subscriptionOnlyTier
}) => {
  const [showManual, setShowManual] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'diagnosis' | 'subjects' | 'academics' | 'mind' | 'membership' | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const isOwner = typeof window !== 'undefined' && localStorage.getItem('nbass_current_role') === 'OWNER';

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handlePrintReport = () => {
    // 정밀 종합 리포트(16P 전문) 인쇄: App의 리포트 인쇄 핸들러로 위임
    // (클릭 태스크 내 동기 실행이라 팝업 차단에 걸리지 않음)
    window.dispatchEvent(new CustomEvent('nbass_print_report'));
  };

  // Big category menus configuration (기능 중심형 5대 메인 메뉴 체계)
  const menuCategories = [
    {
      id: 'diagnosis' as const,
      label: '진단·리포트',
      badge: 'DIAGNOSIS',
      badgeStyle: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
      icon: '📊',
      items: [
        {
          id: 'dashboard',
          label: '수험생 홈 (대시보드)',
          desc: '진단 요약 및 전반적인 학습·인지 컨디션 메인 화면',
          icon: '🏠',
          onClick: () => {
            if (onHomeClick) onHomeClick();
            else onMenuChange('dashboard');
            setOpenDropdown(null);
          },
          isActive: activeMenu === 'dashboard'
        },
        {
          id: 'new_test',
          label: '새 진단검사 시작 (8단계)',
          desc: '수험생 기본 정보 등록 및 기초 인지·심리 스크리닝',
          icon: '📝',
          badge: 'FREE',
          badgeColor: 'bg-emerald-600 text-white',
          onClick: () => {
            onMenuChange('assessment');
            setOpenDropdown(null);
          },
          isActive: activeMenu === 'assessment'
        },
        {
          id: 'results',
          label: '최근 검사결과 열람',
          desc: '가장 최근에 완료된 정밀 신경인지 진단 결과지',
          icon: '📊',
          onClick: () => {
            onMenuChange('results');
            setOpenDropdown(null);
          },
          isActive: activeMenu === 'results'
        },
        {
          id: 'pro_report',
          label: '14P 초정밀 신경인지 리포트북',
          desc: '임상 데이터 기반 14페이지 정밀 심층 솔루션 (영구 소장)',
          icon: '📋',
          badge: '1회/구독',
          badgeColor: 'bg-indigo-600 text-white',
          onClick: () => {
            onMenuChange('results');
            setOpenDropdown(null);
          },
          isActive: activeMenu === 'results'
        },
        {
          id: 'pro_cognitive',
          label: '신경인지 심층 정밀분석',
          desc: '작업기억 용량, 정보처리속도, 시공간 주의집중 정밀 측정',
          icon: '🎯',
          onClick: () => {
            onMenuChange('results');
            setOpenDropdown(null);
          }
        },
        {
          id: 'pro_history',
          label: '이력 & 성장 추이 분석',
          desc: '회차별 검사 누적 데이터 및 종합 성장 트렌드 곡선',
          icon: '📈',
          badge: 'PRO',
          badgeColor: 'bg-blue-600 text-white',
          onClick: () => {
            onMenuChange('history');
            setOpenDropdown(null);
          },
          isActive: activeMenu === 'history' || (activeMenu as string) === 'growth'
        },
        {
          id: 'print_pdf',
          label: '보고서 인쇄 / PDF 저장',
          desc: '14P 초정밀 신경인지 솔루션 리포트북을 A4 규격 또는 PDF로 저장·출력',
          icon: '🖨️',
          badge: 'PDF',
          badgeColor: 'bg-rose-500 text-white',
          onClick: () => {
            handlePrintReport();
            setOpenDropdown(null);
          }
        },
        {
          id: 'resources',
          label: '수험생 자료실 & 도구',
          desc: '수면 계산기, 뽀모도로 타이머, 화이트노이즈',
          icon: '📚',
          onClick: () => {
            onMenuChange('resources');
            setOpenDropdown(null);
          },
          isActive: activeMenu === 'resources'
        },
        {
          id: 'manual',
          label: '시스템 사용 매뉴얼',
          desc: 'NBASS 정밀 진단 시스템 기능별 상세 설명서',
          icon: '📖',
          onClick: () => {
            setShowManual(true);
            setOpenDropdown(null);
          }
        }
      ]
    },
    {
      id: 'subjects' as const,
      label: '과목 AI 클리닉',
      badge: 'AI STUDIO',
      badgeStyle: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300',
      icon: '📘',
      items: [
        {
          id: 'subject_korean',
          label: '수능 국어 AI 클리닉',
          desc: '1분 실전 문제, 30초 인지 메모 훈련, AI 문제은행, 함정 DNA',
          icon: '📘',
          badge: '가동 중',
          badgeColor: 'bg-blue-600 text-white',
          onClick: () => {
            onMenuChange('subject_korean');
            setOpenDropdown(null);
          },
          isActive: activeMenu === 'subjects' && (currentClinicSubject === 'korean' || !currentClinicSubject)
        },
        {
          id: 'subject_math',
          label: '수능 수학 AI 클리닉',
          desc: '4점 준킬러 발문 조건 분해 드릴, 줄맞춤 계산 실수 방지',
          icon: '📐',
          badge: '가동 중',
          badgeColor: 'bg-purple-600 text-white',
          onClick: () => {
            onMenuChange('subject_math');
            setOpenDropdown(null);
          },
          isActive: activeMenu === 'subjects' && currentClinicSubject === 'math'
        },
        {
          id: 'subject_english',
          label: '수능 영어 AI 클리닉',
          desc: '빈칸 추론 논리 전개도 훈련, 순서 배열/문장 삽입 단서 포착',
          icon: '🌍',
          badge: '가동 중',
          badgeColor: 'bg-amber-600 text-white',
          onClick: () => {
            onMenuChange('subject_english');
            setOpenDropdown(null);
          },
          isActive: activeMenu === 'subjects' && currentClinicSubject === 'english'
        },
        {
          id: 'wrongnotes',
          label: '취약 유형 오답노트',
          desc: '문항 풀이 시 인지 과부하 오류 원인 분석 및 오답 교정 솔루션',
          icon: '📋',
          badge: '월구독',
          badgeColor: 'bg-indigo-600 text-white',
          onClick: () => {
            onMenuChange('wrongnotes');
            setOpenDropdown(null);
          },
          isActive: activeMenu === 'wrongnotes'
        }
      ]
    },
    {
      id: 'academics' as const,
      label: '성적·학습관리',
      badge: 'ACADEMICS',
      badgeStyle: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
      icon: '📈',
      items: [
        {
          id: 'prem_grades',
          label: '수험생 성적 관리 (등급·내신)',
          desc: '내신·모의고사 등급 추이 및 목표 대학 시뮬레이션',
          icon: '📊',
          badge: '월구독',
          badgeColor: 'bg-indigo-600 text-white',
          onClick: () => {
            onMenuChange('grades');
            setOpenDropdown(null);
          },
          isActive: activeMenu === 'grades'
        },
        {
          id: 'prem_habits',
          label: '공부습관 교정 (루틴·타임라인)',
          desc: '집중 저하 시간대 분석 및 맞춤형 신경학적 학습 사이클',
          icon: '💡',
          badge: '월구독',
          badgeColor: 'bg-indigo-600 text-white',
          onClick: () => {
            onMenuChange('habits');
            setOpenDropdown(null);
          },
          isActive: activeMenu === 'habits'
        },
        {
          id: 'prem_schedule',
          label: '스케줄 & 순공시간 관리',
          desc: '두뇌 골든타임 기반 일일 순공 플래너 & 시간표 최적화',
          icon: '📅',
          badge: '월구독',
          badgeColor: 'bg-indigo-600 text-white',
          onClick: () => {
            onMenuChange('schedule');
            setOpenDropdown(null);
          },
          isActive: activeMenu === 'schedule'
        },
        {
          id: 'prem_followup',
          label: '2주 주기 추적 검사 (3분)',
          desc: '교정 솔루션 적용 후 뇌기능 및 집중력 델타 변화 측정',
          icon: '⚡',
          badge: '3분 완성',
          badgeColor: 'bg-emerald-600 text-white',
          onClick: () => {
            onMenuChange('results');
            setOpenDropdown(null);
          }
        }
      ]
    },
    {
      id: 'mind' as const,
      label: '수면·멘탈케어',
      badge: 'BIO & MIND',
      badgeStyle: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-300',
      icon: '🌙',
      items: [
        {
          id: 'plus_sleep',
          label: '수면 & 생체리듬 케어',
          desc: '서카디안 리듬 기반 수면 주기 설계 및 시험 당일 각성도 케어',
          icon: '🌙',
          badge: '월구독',
          badgeColor: 'bg-purple-600 text-white',
          onClick: () => {
            onMenuChange('sleep');
            setOpenDropdown(null);
          },
          isActive: activeMenu === 'sleep'
        },
        {
          id: 'plus_zen',
          label: '오늘의 마음 케어 (Zen 명상/호흡)',
          desc: '알파파 유도 사운드테라피 및 맞춤형 Zen 호흡/명상 루틴',
          icon: '🧘',
          badge: '월구독',
          badgeColor: 'bg-purple-600 text-white',
          onClick: () => {
            onMenuChange('solutions');
            setOpenDropdown(null);
          },
          isActive: activeMenu === 'solutions'
        },
        {
          id: 'plus_solutions',
          label: '시험 불안 & 슬럼프 멘탈 코칭',
          desc: '시험 불안 조절을 위한 박스호흡, 그라운딩, 멘탈 회복 가이드',
          icon: '💡',
          badge: '월구독',
          badgeColor: 'bg-amber-600 text-white',
          onClick: () => {
            onMenuChange('solutions');
            setOpenDropdown(null);
          },
          isActive: activeMenu === 'solutions'
        },
        {
          id: 'hl_coffee_care',
          label: 'HL 스마트 커피 & 두뇌 혈류',
          desc: '아르기닌·카르니틴 NO 부스터 섭취 골든타임 및 공식 직영몰 주문',
          icon: '☕',
          badge: '공식몰',
          badgeColor: 'bg-orange-500 text-white',
          onClick: () => {
            window.open('https://www.hl-coffee.com/category/coffee/29/', '_blank');
            setOpenDropdown(null);
          }
        }
      ]
    },
    {
      id: 'membership' as const,
      label: '멤버십 안내',
      badge: '1회 ₩24,900 / 월 ₩19,900',
      badgeStyle: 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-amber-400 font-black',
      icon: '💎',
      items: [
        {
          id: 'mem_pro',
          label: '1회 정밀 리포트 소장권 (₩24,900)',
          desc: '14P 초정밀 신경인지 솔루션 리포트북 열람 및 평생 소장용 PDF 영구 발급',
          icon: '📄',
          badge: '단건 소장',
          badgeColor: 'bg-blue-600 text-white',
          onClick: () => {
            if (onPricingClick) onPricingClick();
            setOpenDropdown(null);
          }
        },
        {
          id: 'mem_sub',
          label: '월 정기구독 멤버십 (월 ₩19,900)',
          desc: '매주 엄마 카톡 브리핑 + AI 골든타임 시간표 + 14P 리포트북 상시 무료 + 성적/습관/스케줄/과목클리닉 무제한',
          icon: '👑',
          badge: '🔥 강력 추천',
          badgeColor: 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white',
          onClick: () => {
            if (onPricingClick) onPricingClick();
            setOpenDropdown(null);
          }
        },
        {
          id: 'mem_discount',
          label: '1회 결제 고객 첫 달 5,000원 공제',
          desc: '1회 리포트 구매자 대상 첫 달 ₩14,900 특별 우대 전환 혜택',
          icon: '🎁',
          badge: '5,000원 할인',
          badgeColor: 'bg-emerald-600 text-white',
          onClick: () => {
            if (onPricingClick) onPricingClick();
            setOpenDropdown(null);
          }
        }
      ]
    }
  ];

  // 지연 로딩 청크 사전 프리패칭 헬퍼 (마우스 호버 또는 포커스 시 즉시 번들 다운로드하여 첫 클릭 시 0초 렌더링 보장)
  const preloadMenuChunk = (menuId: string) => {
    switch (menuId) {
      case 'habits':
        import('./HabitClinicView');
        break;
      case 'grades':
        import('./grade-management/GradeManagementView');
        break;
      case 'subjects':
        import('./subject-apps/SubjectHubView');
        break;
      case 'schedule':
        import('./schedule-management/ScheduleManagementView');
        break;
      case 'sleep':
        import('./sleep-management/SleepManagementView');
        break;
      case 'solutions':
        import('./StressCareLabView');
        break;
      case 'wrongnotes':
        import('./WrongNotes');
        break;
      default:
        break;
    }
  };

  // Quick Action Icons Toolbar (두 번째 첨부 이미지 에디터 툴바 스타일의 컴팩트 바로가기)
  const quickToolbarItems = [
    { id: 'dashboard', label: '홈', icon: '🏠', onClick: () => onHomeClick ? onHomeClick() : onMenuChange('dashboard'), isActive: activeMenu === 'dashboard' },
    { id: 'assessment', label: '새검사', icon: '📝', onClick: () => onMenuChange('assessment'), isActive: activeMenu === 'assessment' },
    { id: 'results', label: '검사결과', icon: '📊', onClick: () => onMenuChange('results'), isActive: activeMenu === 'results' },
    { id: 'print', label: '인쇄/PDF', icon: '🖨️', onClick: handlePrintReport, highlight: true },
    { id: 'divider-1', isDivider: true },
    { id: 'history', label: '이력·성장', icon: '📈', onClick: () => onMenuChange('history'), isActive: activeMenu === 'history' || (activeMenu as string) === 'growth' },
    { id: 'habits', label: '습관교정', icon: '💡', onClick: () => onMenuChange('habits'), isActive: activeMenu === 'habits' },
    { id: 'grades', label: '성적관리', icon: '🎯', onClick: () => onMenuChange('grades'), isActive: activeMenu === 'grades' },
    { id: 'subjects', label: '과목클리닉', icon: '📘', onClick: () => onMenuChange('subjects'), isActive: activeMenu === 'subjects', highlight: true },
    { id: 'schedule', label: '스케줄', icon: '📅', onClick: () => onMenuChange('schedule'), isActive: activeMenu === 'schedule' },
    { id: 'divider-2', isDivider: true },
    { id: 'wrongnotes', label: '오답노트', icon: '📋', onClick: () => onMenuChange('wrongnotes'), isActive: activeMenu === 'wrongnotes' },
    { id: 'sleep', label: '수면관리', icon: '🌙', onClick: () => onMenuChange('sleep'), isActive: activeMenu === 'sleep' },
    { id: 'solutions', label: '멘탈가이드', icon: '🧘', onClick: () => onMenuChange('solutions'), isActive: activeMenu === 'solutions' },
    { id: 'resources', label: '자료실', icon: '📚', onClick: () => onMenuChange('resources'), isActive: activeMenu === 'resources' },
    { id: 'manual', label: '매뉴얼', icon: '📖', onClick: () => setShowManual(true) },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors text-slate-900 dark:text-slate-100">
      <header className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-[1000] no-print transition-colors shadow-xs">
        {/* ROW 1: Logo + Big Category Dropdowns + Student Info + System Buttons */}
        <div className="w-full px-3 md:px-5 xl:px-8 h-15 flex items-center justify-between flex-nowrap gap-2 md:gap-4 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-2 md:gap-4 shrink-0 flex-nowrap">
            {/* Logo */}
            <div
              className="flex items-center gap-2 md:gap-2.5 cursor-pointer group shrink-0"
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
              <div className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 bg-white">
                <img
                  src="./NBASS logo.jpg"
                  alt="NBASS Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col shrink-0">
                <h1 className="text-base md:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none flex items-center gap-1.5 whitespace-nowrap">
                  <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">NBASS</span>
                </h1>
                <span className="text-[8.5px] md:text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-0.5 whitespace-nowrap">Neuro-Bio Academic</span>
              </div>
            </div>

            {/* BIG MENU BUTTONS (Dropdowns) */}
            <div ref={dropdownRef} className="relative flex items-center gap-1 md:gap-1.5 pl-2 md:pl-3 border-l border-slate-200 dark:border-slate-700">
              {menuCategories.map((cat) => {
                const isOpen = openDropdown === cat.id;
                const isCatActive = cat.items.some(it => it.isActive);

                return (
                  <div key={cat.id} className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        if (cat.id === 'subjects') {
                          onMenuChange('subjects');
                        }
                        setOpenDropdown(isOpen ? null : cat.id);
                      }}
                      className={`px-2.5 md:px-3.5 py-1.5 rounded-xl font-bold text-xs md:text-sm flex items-center gap-1.5 transition-all cursor-pointer border ${
                        isOpen
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                          : isCatActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span className="text-xs">{cat.icon}</span>
                      <span>{cat.label}</span>
                      <span className={`hidden sm:inline-block text-[9.5px] px-1.5 py-0.2 rounded-full font-black border uppercase tracking-wider ${
                        isOpen ? 'bg-white/20 text-white border-white/30' : cat.badgeStyle
                      }`}>
                        {cat.badge}
                      </span>
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : 'text-slate-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* DROPDOWN MENU PANEL */}
                    {isOpen && (
                      <div className={`absolute ${cat.id === 'membership' ? 'right-0 left-auto' : 'left-0'} top-full mt-1.5 w-72 sm:w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2.5 z-[1100] animate-in fade-in slide-in-from-top-2 duration-150`}>
                        <div className="px-3.5 py-1.5 mb-1.5 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{cat.icon}</span>
                            <span>{cat.label} 메뉴</span>
                          </span>
                          <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${cat.badgeStyle}`}>
                            {cat.badge}
                          </span>
                        </div>

                        <div className="space-y-0.5 px-1.5">
                          {cat.items.map((subItem) => (
                            <button
                              key={subItem.id}
                              type="button"
                              onMouseEnter={() => {
                                if (subItem.id.includes('habits')) preloadMenuChunk('habits');
                                else if (subItem.id.includes('grades')) preloadMenuChunk('grades');
                                else if (subItem.id.includes('schedule')) preloadMenuChunk('schedule');
                                else if (subItem.id.includes('sleep')) preloadMenuChunk('sleep');
                                else if (subItem.id.includes('solutions') || subItem.id.includes('zen')) preloadMenuChunk('solutions');
                                else if (subItem.id.includes('subject')) preloadMenuChunk('subjects');
                              }}
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={subItem.onClick}
                              className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-start gap-2.5 group cursor-pointer ${
                                subItem.isActive
                                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/80 dark:border-indigo-800/80'
                                  : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <span className="text-base shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                                {subItem.icon}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="text-xs font-bold truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                    {subItem.label}
                                  </span>
                                  {subItem.badge && (
                                    <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-md shrink-0 shadow-2xs ${subItem.badgeColor || 'bg-slate-200 text-slate-700'}`}>
                                      {subItem.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-400 dark:text-slate-400 truncate mt-0.5 font-normal">
                                  {subItem.desc}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Area: Student Badge + Membership + Mode Switchers */}
          <div className="flex items-center gap-1.5 md:gap-2.5 shrink-0 flex-nowrap">
            {/* Student ID & Membership Tier Badge */}
            {(studentName || studentId) && (
              <div className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-700/60 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-600 shadow-xs shrink-0 whitespace-nowrap">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center text-[10px] font-black shadow-xs shrink-0">
                  {studentName ? studentName.slice(0, 1) : '학'}
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1 whitespace-nowrap">
                  {studentName || '학생'}
                </span>
                {membershipTier && (
                  <button
                    type="button"
                    onClick={onPricingClick}
                    title="멤버십 등급 확인 및 변경"
                    className={`text-[9.5px] font-black px-2 py-0.5 rounded-full border flex items-center gap-1 shadow-xs shrink-0 whitespace-nowrap transition-all ${onPricingClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''} ${
                      membershipTier === 'expert'
                        ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-300'
                        : membershipTier === 'premium'
                        ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-300'
                        : membershipTier === 'pro'
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300'
                        : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 border-slate-300'
                    }`}
                  >
                    <span>{TIER_INFO[normalizeTier(membershipTier)]?.icon || '🌱'}</span>
                    <span>{normalizeTier(membershipTier).toUpperCase()}</span>
                  </button>
                )}
              </div>
            )}

            {/* Admin Mode Portal Button */}
            {onAdminPortalClick && (
              <button
                onClick={onAdminPortalClick}
                className="px-2.5 py-1.2 rounded-xl border border-indigo-500/40 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs shrink-0 whitespace-nowrap"
                title="관리자 포털 진입"
              >
                <svg className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <span className="hidden sm:inline">관리자 모드</span>
              </button>
            )}

            {/* Solopreneur Owner AI Center Button */}
            {onOwnerClick && isOwner && (
              <button
                onClick={onOwnerClick}
                className="px-2.5 py-1.2 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs shrink-0 whitespace-nowrap"
                title="오너 전용 관제 센터"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                <span className="hidden sm:inline">오너 관제</span>
              </button>
            )}

            {/* Admin Config Button */}
            {onAdminClick && isOwner && (
              <button
                onClick={onAdminClick}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                title="관리자 설정"
              >
                <svg className="w-4 h-4 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
            )}

            {/* Dark Mode Toggle */}
            {onToggleDarkMode && (
              <button
                onClick={onToggleDarkMode}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
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

        {/* ROW 2: Compact Quick Icon Shortcut Toolbar (사용자 첨부 이미지 형태의 툴바) */}
        <div className="w-full px-3 md:px-5 xl:px-8 py-1.5 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-between overflow-x-auto no-scrollbar gap-1.5 text-xs">
          <div className="flex items-center gap-1 md:gap-1.5 shrink-0 flex-nowrap">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider pr-1 hidden sm:inline">QUICK:</span>
            {quickToolbarItems.map((item, idx) => {
              if (item.isDivider) {
                return (
                  <div key={item.id || idx} className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1 shrink-0" />
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => preloadMenuChunk(item.id)}
                  onFocus={() => preloadMenuChunk(item.id)}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    preloadMenuChunk(item.id);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdown(null);
                    item.onClick();
                  }}
                  title={item.label}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    item.isActive
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : item.highlight
                      ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 hover:bg-blue-200'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-sm leading-none">{item.icon}</span>
                  <span className="text-[11px] whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick link to Landing Intro */}
          <div className="shrink-0 pl-2">
            <a
              href="/?view=landing"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/?view=landing';
              }}
              className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
              title="소개 페이지로 이동"
            >
              <span>🌐</span>
              <span className="hidden md:inline">소개 페이지</span>
            </a>
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
          onlyTier={subscriptionOnlyTier}
        />
      )}
    </div>
  );
};
