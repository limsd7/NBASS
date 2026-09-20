import { useState, useEffect, useCallback } from 'react';

/** [P1-3] 웰니스 활동 유형 확장: 웰니스(호흡/스트레칭/뽀모도로) + 학습/수면/멘탈/오답복습 */
export type WellnessActivityType =
  | 'breathing'
  | 'stretching'
  | 'pomodoro'
  | 'study'
  | 'sleep'
  | 'mental'
  | 'wrongnote';

export interface GamificationStats {
  exp: number;
  level: number;
  streak: number;
  breathing: number;
  stretching: number;
  pomodoro: number;
  // [P1-3] 확장 활동 카운터 (기존 데이터와 하위 호환)
  study: number;
  sleep: number;
  mental: number;
  wrongnote: number;
  completedTasks: string[];
}

const GAMIFICATION_STORAGE_KEY = 'nbass_wellness_gamification';
export const EXP_PER_LEVEL = 200;

const DEFAULT_STATS: GamificationStats = {
  exp: 150,
  level: 2,
  streak: 3,
  breathing: 2,
  stretching: 1,
  pomodoro: 4,
  study: 0,
  sleep: 0,
  mental: 0,
  wrongnote: 0,
  completedTasks: []
};

export const useWellnessGamification = () => {
  const [stats, setStats] = useState<GamificationStats>(() => {
    try {
      const saved = localStorage.getItem(GAMIFICATION_STORAGE_KEY);
      // 저장된 구버전 데이터에 신규 카운터가 없을 수 있으므로 기본값과 병합합니다.
      if (saved) return { ...DEFAULT_STATS, ...(JSON.parse(saved) as Partial<GamificationStats>) };
    } catch (e) {
      console.warn('Failed to load gamification stats', e);
    }
    return { ...DEFAULT_STATS };
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

  const completeActivity = useCallback((type: WellnessActivityType, expReward = 50) => {
    setStats(prev => {
      const newExp = prev.exp + expReward;
      const newLevel = Math.floor(newExp / EXP_PER_LEVEL) + 1;
      const leveledUp = newLevel > prev.level;

      const bump = (key: WellnessActivityType, value: number) => (type === key ? value + 1 : value);

      const newStats: GamificationStats = {
        ...prev,
        exp: newExp,
        level: newLevel,
        breathing: bump('breathing', prev.breathing),
        stretching: bump('stretching', prev.stretching),
        pomodoro: bump('pomodoro', prev.pomodoro),
        study: bump('study', prev.study),
        sleep: bump('sleep', prev.sleep),
        mental: bump('mental', prev.mental),
        wrongnote: bump('wrongnote', prev.wrongnote),
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
