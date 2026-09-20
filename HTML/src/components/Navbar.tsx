import React, { useState } from 'react';
import { Brain, Activity, Menu, X, User, LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onStartAssessment: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onLogout,
  onStartAssessment
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'intro', label: '소개', sectionId: 'intro-section' },
    { id: 'features', label: '주요 기능', sectionId: 'features-section' },
    { id: 'tests', label: '검사 종류', sectionId: 'tests-section' },
    { id: 'reviews', label: '이용 후기', sectionId: 'reviews-section' },
    { id: 'pricing', label: '가격', sectionId: 'pricing-section' },
    { id: 'faq', label: 'FAQ', sectionId: 'faq-section' },
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveTab('landing');
    setMobileMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => { setActiveTab('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-800">
            NBASS
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.sectionId)}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              {link.label}
            </button>
          ))}
          {user && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'dashboard' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'
              }`}
            >
              <Activity className="w-4 h-4 text-blue-500" />
              내 대시보드
            </button>
          )}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{user.name}</p>
                  <p className="text-[10px] text-slate-500">{user.targetGroup}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                title="로그아웃"
                className="p-2 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-sm font-semibold text-slate-700 hover:text-blue-600 px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <User className="w-4 h-4 text-blue-600" />
              로그인 / 회원가입
            </button>
          )}

          <button
            onClick={onStartAssessment}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-blue-700 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-blue-200 animate-spin" style={{ animationDuration: '4s' }} />
            <span>검사 시작하기</span>
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={onStartAssessment}
            className="bg-blue-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
          >
            검사시작
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-blue-600 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-blue-100 px-4 pt-2 pb-6 space-y-3 shadow-xl animate-fadeIn">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.sectionId)}
              className="block w-full text-left px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
            >
              {link.label}
            </button>
          ))}
          {user && (
            <button
              onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-2.5 text-base font-medium text-blue-600 bg-blue-50 rounded-xl"
            >
              내 대시보드 및 결과 리포트
            </button>
          )}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="text-xs text-rose-600 font-semibold px-3 py-1.5 bg-rose-50 rounded-lg"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAuth(); }}
                className="w-full text-center py-2.5 text-sm font-bold text-blue-600 bg-blue-50 rounded-xl border border-blue-200"
              >
                로그인 / 회원가입
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
