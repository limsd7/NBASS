import { useState, useEffect, useCallback } from 'react';

export interface GamificationStats {
  exp: number;
  level: number;
  streak: number;
  breathing: number;
  stretching: number;
  pomodoro: number;
  completedTasks: string[];
}

const GAMIFICATION_STORAGE_KEY = 'nbass_wellness_gamification';

export const useWellnessGamification = () => {
  const [stats, setStats] = useState<GamificationStats>(() => {
    try {
      const saved = localStorage.getItem(GAMIFICATION_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load gamification stats', e);
    }
    return {
      exp: 150,
      level: 2,
      streak: 3,
      breathing: 2,
      stretching: 1,
      pomodoro: 4,
      completedTasks: []
    };
  });

  const [showConfetti, setShowConfetti] = useState(false);
  const [recentAchievement, setRecentAchievement] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(GAMIFICATION_STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
      console.warn('Failed to save gamification stats', e);
    }
  }, [stats]);

  const triggerAchievement = (title: string) => {
    setRecentAchievement(title);
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      setRecentAchievement('');
    }, 3500);
  };

  const completeActivity = useCallback((type: 'breathing' | 'stretching' | 'pomodoro' | 'routine', expReward = 50) => {
    setStats(prev => {
      const newExp = prev.exp + expReward;
      const newLevel = Math.floor(newExp / 200) + 1;
      const leveledUp = newLevel > prev.level;

      const newStats = {
        ...prev,
        exp: newExp,
        level: newLevel,
        breathing: type === 'breathing' ? prev.breathing + 1 : prev.breathing,
        stretching: type === 'stretching' ? prev.stretching + 1 : prev.stretching,
        pomodoro: type === 'pomodoro' ? prev.pomodoro + 1 : prev.pomodoro,
      };

      if (leveledUp) {
        triggerAchievement(`🎉 레벨 업! Lv.${newLevel} 달성 (+${expReward} EXP)`);
      } else {
        triggerAchievement(`🌟 미션 완료! (+${expReward} EXP)`);
      }

      return newStats;
    });
  }, []);

  return {
    stats,
    showConfetti,
    recentAchievement,
    completeActivity
  };
};
