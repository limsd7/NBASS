import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { TIER_BADGE_STYLES, TIER_NAMES } from '../../services/featureGate';
import { dataSyncService } from '../../services/dataSyncService';
import {
  Activity,
  Brain,
  Calendar,
  Camera,
  TrendingUp,
  Moon,
  Sparkles,
  RefreshCw,
  LogOut,
  Coffee,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';

export type NavTab =
  | 'result'
  | 'assessment'
  | 'subjectClinic'
  | 'grade'
  | 'sleep'
  | 'schedule'
  | 'habit'
  | 'wrongNotes';

interface NavRailProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  user: UserProfile;
  onLogout: () => void;
  onTierClick: () => void;
  onCoffeeClick: () => void;
}

export const NavRail: React.FC<NavRailProps> = ({
  activeTab,
  onTabChange,
  user,
  onLogout,
  onTierClick,
  onCoffeeClick
}) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const navItems = [
    { id: 'result' as NavTab, label: '종합 결과 리포트', icon: Activity, badge: '처방' },
    { id: 'assessment' as NavTab, label: '정밀 진단 검사', icon: Sparkles, badge: '검사' },
    { id: 'subjectClinic' as NavTab, label: '과목별 뇌인지 클리닉', icon: GraduationCap, badge: '신규' },
    { id: 'grade' as NavTab, label: '성적 관리 & 시뮬레이션', icon: TrendingUp },
    { id: 'sleep' as NavTab, label: '수면 & 멘탈 케어', icon: Moon },
    { id: 'schedule' as NavTab, label: '스마트 스케줄 & 뽀모도로', icon: Calendar },
    { id: 'habit' as NavTab, label: '공부습관 클리닉', icon: Brain },
    { id: 'wrongNotes' as NavTab, label: '3색 오답노트 & 망각곡선', icon: Camera },
  ];

  const handleManualSync = async () => {
    setIsSyncing(true);
    await dataSyncService.syncAllFromCloud(user.studentId);
    setTimeout(() => setIsSyncing(false), 600);
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white border-r border-slate-800 h-screen fixed left-0 top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-base shadow-md">
            N
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white leading-none">
              NBASS Tablet
            </h1>
            <p className="text-[10px] text-indigo-300 font-semibold mt-1">
              Mind-Body Connect PC 연동
            </p>
          </div>
        </div>

        <button
          onClick={handleManualSync}
          title="PC 클라우드 데이터 동기화"
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-amber-300' : ''}`} />
        </button>
      </div>

      {/* Student Profile Card */}
      <div className="p-4 mx-3 my-3 bg-white/5 border border-white/10 rounded-2xl">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-black text-white truncate max-w-[120px]">
            {user.name}
          </span>
          <button
            onClick={onTierClick}
            className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${TIER_BADGE_STYLES[user.tier]}`}
          >
            {TIER_NAMES[user.tier].split(' ')[0]}
          </button>
        </div>
        <div className="text-[10px] text-slate-400 font-medium">
          {user.school || '수험생'} · {user.grade || '고3'}
        </div>
        {user.targetUniversity && (
          <div className="text-[10px] text-amber-300/90 font-bold mt-1 flex items-center gap-1 truncate">
            <GraduationCap className="w-3 h-3 shrink-0" />
            <span className="truncate">{user.targetUniversity} {user.targetMajor}</span>
          </div>
        )}
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-indigo-500/20 text-indigo-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer */}
      <div className="p-3 border-t border-white/10 space-y-2">
        <button
          onClick={onCoffeeClick}
          className="w-full py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-black flex items-center justify-center gap-2 transition"
        >
          <Coffee className="w-4 h-4 text-amber-400" />
          <span>HL 커피 부스터 처방</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full py-2 px-3 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>계정 전환 / 로그아웃</span>
        </button>
      </div>
    </aside>
  );
};
