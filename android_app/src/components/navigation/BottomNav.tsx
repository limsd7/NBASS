import React from 'react';
import { Activity, Brain, Calendar, Camera, TrendingUp } from 'lucide-react';

export type NavTab = 'result' | 'habit' | 'schedule' | 'wrongNotes' | 'more';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'result' as NavTab, label: '진단 결과', icon: Activity },
    { id: 'habit' as NavTab, label: '습관클리닉', icon: Brain },
    { id: 'schedule' as NavTab, label: '스케줄', icon: Calendar },
    { id: 'wrongNotes' as NavTab, label: '오답노트', icon: Camera },
    { id: 'more' as NavTab, label: '성적·수면', icon: TrendingUp },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg safe-area-bottom">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-indigo-600 font-black scale-105'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-indigo-50' : 'bg-transparent'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tighter">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
