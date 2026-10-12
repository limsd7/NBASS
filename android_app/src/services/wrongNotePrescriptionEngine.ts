import { WrongNote, WrongNoteErrorType } from '../types';

export interface WrongNoteErrorTypeMeta {
  type: WrongNoteErrorType;
  label: string;
  description: string;
  badgeColor: string;
  icon: string;
  rootCauseTip: string;
}

export const ERROR_TYPE_METAS: Record<WrongNoteErrorType, WrongNoteErrorTypeMeta> = {
  CONCEPT: {
    type: 'CONCEPT',
    label: '개념 부족 (Concept Gap)',
    description: '핵심 공식, 용어 정의, 인과관계 이해 부족으로 인한 오답',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: '📚',
    rootCauseTip: '해설지를 보지 않고 백지에 해당 개념을 직접 구조화(Feynman 기법)하는 인출 복습이 필수적입니다.'
  },
  MISTAKE_IMPULSE: {
    type: 'MISTAKE_IMPULSE',
    label: '실수·충동 (Careless/Impulsive)',
    description: '발문 오독, 부호/계산 실수, 조건 누락 등 주의산만형 오답',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: '⚡',
    rootCauseTip: '발문의 부정 표현(옳지 않은 것)에 형광펜을 긋고, 역산 검산 루틴을 통해 의식적으로 작업 브레이크를 거세요.'
  },
  TIME_LIMIT: {
    type: 'TIME_LIMIT',
    label: '시간 부족 (Time Pressure)',
    description: '시험 시간 안배 실패, 긴 지문/풀이에서 속도 지연으로 인한 오답',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: '⏳',
    rootCauseTip: '1문항당 제한시간(수학 3분, 국어 지문당 8분)을 설정하고 타이머 압박 훈련 및 스키밍 훈련을 병행하세요.'
  },
  KILLER_PROBLEM: {
    type: 'KILLER_PROBLEM',
    label: '고난도 킬러 (Complex Killer)',
    description: '2개 이상의 복합 개념 결합, 신유형 추론 문제 오답',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: '👑',
    rootCauseTip: '문제에 주어진 모든 단서를 넘버링(1, 2, 3)하여 해체한 후, 단계별 풀이 알고리즘을 역방향으로 분해 분석하세요.'
  }
};

// 에빙하우스 망각곡선 간격반복 일수 (D+1 -> D+3 -> D+7 -> D+14)
export const SPACED_INTERVALS: Record<number, number> = {
  0: 1,  // D+1
  1: 3,  // D+3
  2: 7,  // D+7
  3: 14, // D+14
  4: 30  // 마스터
};

export const wrongNotePrescriptionEngine = {
  // 오늘 복습해야 할 오답인지 계산
  isDueToday(note: WrongNote): boolean {
    if (note.isResolved) return false;
    const today = new Date().toISOString().split('T')[0];
    return note.nextReviewDate <= today;
  },

  // 다음 복습 일자 계산
  getNextReviewDate(currentStage: number): string {
    const daysToAdd = SPACED_INTERVALS[currentStage] || 1;
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    return nextDate.toISOString().split('T')[0];
  },

  // 오답 분석 리포트 생성
  generateReport(notes: WrongNote[]) {
    const total = notes.length;
    const resolved = notes.filter(n => n.isResolved).length;
    const dueToday = notes.filter(n => this.isDueToday(n));

    const counts: Record<WrongNoteErrorType, number> = {
      CONCEPT: 0,
      MISTAKE_IMPULSE: 0,
      TIME_LIMIT: 0,
      KILLER_PROBLEM: 0
    };

    notes.forEach(n => {
      if (counts[n.errorType] !== undefined) {
        counts[n.errorType]++;
      }
    });

    // 가장 취약한 오답 원인
    let dominant: WrongNoteErrorType = 'CONCEPT';
    let max = -1;
    (Object.keys(counts) as WrongNoteErrorType[]).forEach(k => {
      if (counts[k] > max) {
        max = counts[k];
        dominant = k;
      }
    });

    return {
      total,
      resolved,
      dueTodayCount: dueToday.length,
      counts,
      dominantMeta: ERROR_TYPE_METAS[dominant]
    };
  }
};
