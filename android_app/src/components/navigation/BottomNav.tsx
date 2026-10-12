import React from 'react';
import { Activity, Brain, Calendar, Camera, TrendingUp, Moon, Sparkles, GraduationCap } from 'lucide-react';
import { NavTab } from './NavRail';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'result' as NavTab, label: '리포트', icon: Activity },
    { id: 'assessment' as NavTab, label: '진단검사', icon: Sparkles },
    { id: 'subjectClinic' as NavTab, label: '클리닉', icon: GraduationCap },
    { id: 'grade' as NavTab, label: '성적', icon: TrendingUp },
    { id: 'sleep' as NavTab, label: '수면·멘탈', icon: Moon },
    { id: 'schedule' as NavTab, label: '스케줄', icon: Calendar },
    { id: 'habit' as NavTab, label: '습관', icon: Brain },
    { id: 'wrongNotes' as NavTab, label: '오답', icon: Camera },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1 shadow-lg safe-area-bottom select-none">
      <div className="max-w-md mx-auto grid grid-cols-8 gap-0.5">
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
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[9px] mt-0.5 tracking-tighter truncate max-w-[42px] text-center">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
