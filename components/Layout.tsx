
import React, { useState } from 'react';
import { ManualModal } from './modals/ManualModal';

interface LayoutProps {
  children: React.ReactNode;
  activeMenu: string;
  onMenuChange: (menu: 'dashboard' | 'assessment' | 'history' | 'progress' | 'resources' | 'solutions') => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onAdminClick?: () => void;
  expertGuideAction?: () => void;
  isExpertMode?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeMenu, onMenuChange, isDarkMode, onToggleDarkMode, onAdminClick, expertGuideAction, isExpertMode }) => {
  const [showManual, setShowManual] = useState(false);
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'assessment', label: 'Assessment', icon: '📝' },
    { id: 'history', label: 'History', icon: '📅' },
    { id: 'resources', label: 'Resources', icon: '📚' },
    ...(isExpertMode ? [{ id: 'solutions', label: 'Solutions', icon: '💡' } as const] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 no-print transition-colors">
        <div className="w-full max-w-[1800px] mx-auto px-4 md:px-8 xl:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onMenuChange('dashboard')}>
            <div className="w-10 h-10 flex items-center justify-center shrink-0">
              <img
                src="./NBASS logo.jpg"
                alt="NBASS Logo"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">NBASS</h1>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-0.5">Neuro-Bio Lab</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-1 text-sm font-medium text-slate-600 dark:text-slate-300">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => onMenuChange(item.id as any)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${activeMenu === item.id
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                    : 'hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => setShowManual(true)}
                className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold"
              >
                <span>📖</span>
                Manual
              </button>
            </nav>
            {/* Admin Config Button */}
            {onAdminClick && (
              <button
                onClick={onAdminClick}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                title="관리자 설정"
              >
                <span className="text-xl">🔒</span>
              </button>
            )}
            
            {/* Expert Guide Button */}
            {expertGuideAction && (
              <button
                onClick={expertGuideAction}
                className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2 hover:bg-indigo-700 bg-indigo-600 text-white font-bold shadow-md shadow-indigo-200 dark:shadow-none animate-in slide-in-from-top-4"
                title="전문가 가이드 열기"
              >
                <span className="text-xl">👨‍⚕️</span>
                <span className="hidden sm:inline">Expert Guide</span>
              </button>
            )}

            {onToggleDarkMode && (
              <button
                onClick={onToggleDarkMode}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
              >
                {isDarkMode ? (
                  <span className="text-xl">☀️</span>
                ) : (
                  <span className="text-xl">🌙</span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="w-full max-w-[1800px] mx-auto p-4 md:p-8 xl:p-12">
        {children}
      </main>

      {/* Manual Modal */}
      <ManualModal isOpen={showManual} onClose={() => setShowManual(false)} />
    </div>
  );
};
