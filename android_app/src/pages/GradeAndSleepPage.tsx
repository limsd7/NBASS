import React, { useState } from 'react';
import { UserProfile } from '../types';
import { GradePage } from './GradePage';
import { SleepMentalPage } from './SleepMentalPage';
import { TrendingUp, Moon } from 'lucide-react';

interface GradeAndSleepPageProps {
  user: UserProfile;
  onUpgradeClick: () => void;
}

export const GradeAndSleepPage: React.FC<GradeAndSleepPageProps> = ({ user, onUpgradeClick }) => {
  const [subTab, setSubTab] = useState<'grade' | 'sleep'>('grade');

  return (
    <div>
      {/* Top Segment Control */}
      <div className="bg-white px-4 pt-3 pb-2 border-b border-slate-200 sticky top-12 z-20">
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl max-w-md mx-auto">
          <button
            onClick={() => setSubTab('grade')}
            className={`py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              subTab === 'grade'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>성적 관리</span>
          </button>
          <button
            onClick={() => setSubTab('sleep')}
            className={`py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              subTab === 'sleep'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>수면·힐링 케어</span>
          </button>
        </div>
      </div>

      {subTab === 'grade' ? (
        <GradePage user={user} onUpgradeClick={onUpgradeClick} />
      ) : (
        <SleepMentalPage user={user} onUpgradeClick={onUpgradeClick} />
      )}
    </div>
  );
};
