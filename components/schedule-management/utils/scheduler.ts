import { RoutineInput, CareType, ScheduleBlock, DayKey, DayScheduleConfig } from '../types';
import { DEFAULT_DAY_CONFIGS, DEFAULT_VACATION_DAY_CONFIGS } from '../data/defaultSchedules';

// Helper to convert "HH:MM" to total minutes from midnight
export function timeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

// Helper to convert minutes from midnight to "HH:MM"
export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const mins = Math.floor(totalMinutes % 60);
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function generateSchedule(
  input: RoutineInput,
  careType: CareType,
  targetDayKey?: DayKey,
  isVacationOverride?: boolean
): ScheduleBlock[] {
  const activeDay = targetDayKey || input.activeDay || 'mon';
  const isVacation = isVacationOverride !== undefined ? isVacationOverride : Boolean(input.isVacationMode);

  // Retrieve matching day config
  let dayConfig: DayScheduleConfig;
  if (isVacation) {
    dayConfig = input.vacationDayConfigs?.[activeDay] || DEFAULT_VACATION_DAY_CONFIGS[activeDay] || DEFAULT_VACATION_DAY_CONFIGS.mon;
  } else {
    dayConfig = input.dayConfigs?.[activeDay] || DEFAULT_DAY_CONFIGS[activeDay] || DEFAULT_DAY_CONFIGS.mon;
  }

  const blocks: ScheduleBlock[] = [];
  let idCounter = 1;

  const wakeMin = timeToMinutes(dayConfig.wakeUpTime || input.wakeUpTime || '07:00');
  const sleepMin = timeToMinutes(dayConfig.sleepTime || input.sleepTime || '23:30');
  const hasSchool = Boolean(dayConfig.hasSchool && !isVacation && activeDay !== 'sat' && activeDay !== 'sun' && activeDay !== 'holiday');

  // Sorted subjects by priority
  const sortedSubjects = [...(input.subjects || [])].sort((a, b) => a.priority - b.priority);
  if (sortedSubjects.length === 0) {
    sortedSubjects.push(
      { id: 'sub-1', name: '국어', priority: 1, weeklyTargetHours: 5, currentMastery: 70, color: 'bg-rose-500' },
      { id: 'sub-2', name: '수학', priority: 1, weeklyTargetHours: 8, currentMastery: 65, color: 'bg-blue-500' },
      { id: 'sub-3', name: '영어', priority: 2, weeklyTargetHours: 5, currentMastery: 75, color: 'bg-emerald-500' }
    );
  }

  let subjectIndex = 0;
  const workDuration = careType.pomodoroWork || 25;
  const breakDuration = careType.pomodoroBreak || 10;

  // Find active exam mode
  const activeExamMode = input.examModesList?.find(m => m.id === input.examMode) ||
    (input.examMode === 'mock'
      ? { name: '모의고사 타임어택', strategyBadge: '타임어택 훈련' }
      : input.examMode === 'final'
      ? { name: `${input.examName || '기말고사'} 암기`, strategyBadge: '교과서 백지복습' }
      : null);

  let examPrefix = '';
  let examStrategyNote = '';
  if (activeExamMode && input.examMode !== 'normal') {
    const modeLabel = activeExamMode.strategyBadge || activeExamMode.name;
    examPrefix = `[${activeExamMode.name.replace(/[^\w\sㄱ-힣]/g, '').trim() || '시험 대비'}] `;
    examStrategyNote = ` (${modeLabel})`;
  }

  const helperAddStudyBlocks = (startMin: number, endMin: number, sectionName: string) => {
    let currentBlockStart = startMin;
    let remainingMinutes = endMin - startMin;

    while (currentBlockStart < endMin && remainingMinutes > 15) {
      const activeSubject = sortedSubjects[subjectIndex % sortedSubjects.length];
      const actualWorkTime = Math.min(workDuration, remainingMinutes, endMin - currentBlockStart);

      if (actualWorkTime <= 10) break;

      const workEndMin = currentBlockStart + actualWorkTime;

      blocks.push({
        id: `block-${idCounter++}`,
        title: `${examPrefix}${activeSubject.name} (${sectionName})`,
        type: 'study',
        startTime: minutesToTime(currentBlockStart),
        endTime: minutesToTime(workEndMin),
        subjectName: activeSubject.name,
        completed: false,
        priority: activeSubject.priority,
        description: `${careType.title} 최적화: ${activeSubject.name} 우선순위 몰입${examStrategyNote}`
      });

      currentBlockStart = workEndMin;
      remainingMinutes -= actualWorkTime;
      subjectIndex++;

      // Add Break Block if enough time remains
      if (currentBlockStart < endMin && remainingMinutes >= 10) {
        const actualBreakTime = Math.min(breakDuration, endMin - currentBlockStart);
        const breakEndMin = currentBlockStart + actualBreakTime;

        blocks.push({
          id: `block-${idCounter++}`,
          title: `맞춤 휴식: ${careType.breakGuide.title}`,
          type: 'break',
          startTime: minutesToTime(currentBlockStart),
          endTime: minutesToTime(breakEndMin),
          completed: false,
          breakGuide: careType.breakGuide,
          description: careType.breakGuide.description
        });

        currentBlockStart = breakEndMin;
        remainingMinutes -= actualBreakTime;
      }
    }
  };

  // 1. Morning Routine (기상 및 아침 뇌 깨우기)
  blocks.push({
    id: `block-${idCounter++}`,
    title: `기상 및 활력 아침 루틴 (${careType.title} 맞춤)`,
    type: 'routine',
    startTime: dayConfig.wakeUpTime,
    endTime: minutesToTime(wakeMin + 45),
    completed: true,
    description: careType.id === 'sleep_disorder' || careType.id === 'adrenal_fatigue'
      ? '기상 직후 햇빛 15분 쬐기 및 따뜻한 미네랄 워터로 두뇌 각성'
      : '물 한 잔 마시기, 가벼운 스트레칭 및 오늘 목표 설정'
  });

  if (hasSchool) {
    // --- 평일 등교 스케줄 ---
    const schoolStartMin = timeToMinutes(dayConfig.schoolStartTime || '08:40');
    const schoolEndMin = timeToMinutes(dayConfig.schoolEndTime || '16:30');

    if (wakeMin + 45 < schoolStartMin) {
      blocks.push({
        id: `block-${idCounter++}`,
        title: '등교 및 뇌 워밍업 이동',
        type: 'routine',
        startTime: minutesToTime(wakeMin + 45),
        endTime: dayConfig.schoolStartTime,
        completed: true,
        description: '이동 중 가벼운 단어 암기 또는 차분한 뇌파 사운드 청취'
      });
    }

    blocks.push({
      id: `block-${idCounter++}`,
      title: '정규 학교 수업',
      type: 'school',
      startTime: dayConfig.schoolStartTime,
      endTime: dayConfig.schoolEndTime,
      completed: true,
      description: '선생님 필기 핵심 체크 및 쉬는 시간 눈 피로 회복'
    });

    let currentTime = schoolEndMin;

    // Academies
    if (dayConfig.academies && dayConfig.academies.length > 0) {
      dayConfig.academies.forEach(acad => {
        const acadStart = timeToMinutes(acad.startTime);
        const acadEnd = timeToMinutes(acad.endTime);
        if (acadStart >= currentTime) {
          if (acadStart > currentTime) {
            blocks.push({
              id: `block-${idCounter++}`,
              title: '방과 후 이동 및 간식 충전',
              type: 'meal',
              startTime: minutesToTime(currentTime),
              endTime: acad.startTime,
              completed: false,
              description: '가벼운 견과류 및 당 충전으로 두뇌 에너지 보충'
            });
          }
          blocks.push({
            id: `block-${idCounter++}`,
            title: `학원 수업: ${acad.name}`,
            type: 'academy',
            startTime: acad.startTime,
            endTime: acad.endTime,
            completed: false,
            description: '학원 수업 집중 및 핵심 질문 해결'
          });
          currentTime = Math.max(currentTime, acadEnd);
        }
      });
    }

    // Dinner
    const selfStartMin = timeToMinutes(dayConfig.selfStudyStartTime || '20:00');
    const selfEndMin = timeToMinutes(dayConfig.selfStudyEndTime || '23:00');

    if (selfStartMin > currentTime) {
      blocks.push({
        id: `block-${idCounter++}`,
        title: '저녁 식사 및 힐링 산책',
        type: 'meal',
        startTime: minutesToTime(currentTime),
        endTime: dayConfig.selfStudyStartTime,
        completed: false,
        description: '편안한 저녁 식사 및 10분 가벼운 산책'
      });
    }

    // Evening self-study
    if (selfEndMin > selfStartMin) {
      helperAddStudyBlocks(selfStartMin, selfEndMin, '야간 심화');
    }
  } else {
    // --- 주말 / 공휴일 / 방학 스케줄 (비등교일 특화) ---
    const morningStart = timeToMinutes(dayConfig.morningStudyStartTime || '09:00');
    const morningEnd = timeToMinutes(dayConfig.morningStudyEndTime || '12:00');

    // Morning prep
    if (morningStart > wakeMin + 45) {
      blocks.push({
        id: `block-${idCounter++}`,
        title: '아침 식사 및 학습 준비',
        type: 'meal',
        startTime: minutesToTime(wakeMin + 45),
        endTime: minutesToTime(morningStart),
        completed: true,
        description: '균형 잡힌 아침 식사 및 오늘 플래너 점검'
      });
    }

    // Morning study
    if (morningEnd > morningStart) {
      helperAddStudyBlocks(morningStart, morningEnd, isVacation ? '방학 오전 개념' : '오전 집중');
    }

    // Lunch
    const afternoonStart = timeToMinutes(dayConfig.afternoonStudyStartTime || '13:30');
    const afternoonEnd = timeToMinutes(dayConfig.afternoonStudyEndTime || '17:30');

    blocks.push({
      id: `block-${idCounter++}`,
      title: '점심 식사 및 햇빛 산책',
      type: 'meal',
      startTime: minutesToTime(morningEnd),
      endTime: minutesToTime(afternoonStart),
      completed: false,
      description: '점심 식사 후 15분 햇빛 쬐기로 세로토닌 합성'
    });

    // Afternoon Study or Academies
    let afternoonCurrentTime = afternoonStart;
    if (dayConfig.academies && dayConfig.academies.length > 0) {
      dayConfig.academies.forEach(acad => {
        const acadStart = timeToMinutes(acad.startTime);
        const acadEnd = timeToMinutes(acad.endTime);
        if (acadStart > afternoonCurrentTime) {
          helperAddStudyBlocks(afternoonCurrentTime, acadStart, '오후 자습');
        }
        blocks.push({
          id: `block-${idCounter++}`,
          title: `특강/학원: ${acad.name}`,
          type: 'academy',
          startTime: acad.startTime,
          endTime: acad.endTime,
          completed: false,
          description: '학원 수업 및 과제 해결'
        });
        afternoonCurrentTime = Math.max(afternoonCurrentTime, acadEnd);
      });
    }

    if (afternoonEnd > afternoonCurrentTime) {
      helperAddStudyBlocks(afternoonCurrentTime, afternoonEnd, isVacation ? '방학 오후 탐구' : '오후 실전 문제');
    }

    // Dinner
    const selfStartMin = timeToMinutes(dayConfig.selfStudyStartTime || '19:00');
    const selfEndMin = timeToMinutes(dayConfig.selfStudyEndTime || '22:30');

    blocks.push({
      id: `block-${idCounter++}`,
      title: '저녁 식사 및 뇌 리셋 휴식',
      type: 'meal',
      startTime: minutesToTime(Math.max(afternoonEnd, afternoonCurrentTime)),
      endTime: minutesToTime(selfStartMin),
      completed: false,
      description: '저녁 식사 및 가벼운 힐링 스트레칭'
    });

    // Evening study
    if (selfEndMin > selfStartMin) {
      helperAddStudyBlocks(selfStartMin, selfEndMin, isVacation ? '방학 심화 복습' : '야간 취약 클리닉');
    }
  }

  // Bedtime Routine
  const lastStudyEnd = timeToMinutes(dayConfig.selfStudyEndTime || '22:30');
  blocks.push({
    id: `block-${idCounter++}`,
    title: '취침 준비 및 디지털 디톡스',
    type: 'sleep',
    startTime: minutesToTime(lastStudyEnd),
    endTime: minutesToTime(Math.min(1439, lastStudyEnd + 60)),
    completed: false,
    description: '취침 1시간 전 스마트폰 블루라이트 차단, 하루 피드백 및 숙면 유도'
  });

  return blocks;
}

