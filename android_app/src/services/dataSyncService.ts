import { supabase } from '../lib/supabase';
import {
  ScheduleItem,
  MobileGradeRecord,
  WrongNoteItem,
  SleepLogItem,
  MobileAssessmentResult,
  GradeGoalItem,
  GamificationProgress
} from '../types';
import { markMobilePushed } from './supabaseRealtime';
import { CARE_TYPE_METADATA } from './careTypeEngine';

// LocalStorage Keys
const KEYS = {
  ASSESSMENT: 'nbass_assessment_',
  ASSESSMENT_HISTORY: 'nbass_assessment_history_',
  SCHEDULES: 'nbass_schedules_',
  GRADES: 'nbass_grades_',
  GRADE_GOALS: 'nbass_grade_goals_',
  WRONG_NOTES: 'nbass_wrong_notes_',
  SLEEP_LOGS: 'nbass_sleep_logs_',
  HABIT_PROGRESS: 'nbass_habit_progress_',
  GAMIFICATION: 'nbass_gamification_',
  BIOSIGNALS: 'nbass_biosignals_',
  BLOODTEST: 'nbass_bloodtest_',
};

// 현재 주차 키 산출 (예: "2026-W41")
export const getCurrentWeekKey = (): string => {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};


export const dataSyncService = {
  // ── 0. 전체 원격 동기화 (앱 시작 및 로그인 시 호출) ──
  async syncAllFromCloud(studentId: string): Promise<boolean> {
    if (!studentId) return false;
    try {
      // 1. assessments 조회
      const { data: asmData } = await supabase
        .from('assessments')
        .select('*')
        .or(`student_name.eq.${studentId},student_info->>id.eq.${studentId}`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (asmData && asmData.length > 0) {
        const raw = asmData[0];
        const sv = (raw.survey_data || {}) as Record<string, any>;
        const num = (v: any, fb: number) => (typeof v === 'number' && !isNaN(v) ? v : fb);
        // PC 행이어도 설문이 있으면 5지표 실측 파생 (없을 때만 중립 폴백 — 기존 하드코딩 70/75 고정값 폐기)
        const hasSurvey = sv && (sv.bai !== undefined || sv.isi !== undefined || sv.concentrationScore !== undefined || sv.concentration !== undefined);
        const bai = num(sv.bai, 0);
        const isi = num(sv.isi, 0);
        const concRaw = sv.concentrationScore ?? sv.concentration;
        const adrRaw = sv.adrenalFatigueScore ?? sv.adrenal;
        const derivedMetrics = hasSurvey
          ? {
              brainVitality: Number(raw.care_score) || 75,
              stressResistance: Math.max(0, Math.min(100, Math.round(100 - (bai / 63) * 100))),
              focusCapacity: typeof concRaw === 'number'
                ? Math.max(0, Math.min(100, Math.round(100 - (concRaw / 28) * 100)))
                : 75,
              sleepEfficiency: Math.max(0, Math.min(100, Math.round(100 - (isi / 28) * 100))),
              coherence: 72,
            }
          : { brainVitality: Number(raw.care_score) || 75, stressResistance: 70, focusCapacity: 75, sleepEfficiency: 70, coherence: 72 };
        derivedMetrics.coherence = hasSurvey
          ? Math.max(0, Math.min(100, Math.round((derivedMetrics.brainVitality + derivedMetrics.stressResistance + derivedMetrics.focusCapacity + derivedMetrics.sleepEfficiency) / 4)))
          : derivedMetrics.coherence;
        const cls = (raw.classification_result || {}) as Record<string, any>;
        // PC classification_result ↔ 모바일 classificationResult 상호 매핑 (키 sobretodo 양식 모두 수용)
        const allScores = Array.isArray(cls.allScores) ? cls.allScores : [];
        const secondaryScores = Array.isArray(cls.secondaryScores) ? cls.secondaryScores : [];
        const secondaryDetails = Array.isArray(cls.secondaryDetails) ? cls.secondaryDetails : [];
        const careTypeKey = raw.care_type || 'Healthy Balance';
        const metaPrescriptions = (CARE_TYPE_METADATA as any)[careTypeKey]?.prescriptions;
        const res: MobileAssessmentResult = {
          id: raw.id,
          student: {
            id: raw.student_info?.id || studentId,
            name: raw.student_name || '수험생',
            school: raw.student_info?.school || '고교생',
            grade: raw.student_info?.grade || '3학년',
            age: raw.student_info?.age || 18,
            gender: raw.student_info?.gender || '남',
            targetUniversity: raw.student_info?.targetUniversity,
            targetMajor: raw.student_info?.targetMajor,
            // PC student_info 실측 그대로 (등록 누락 해소)
            ...(raw.student_info?.birthDate ? { birthDate: raw.student_info.birthDate } : {}),
            ...(raw.student_info?.weakSubject ? { weakSubject: raw.student_info.weakSubject } : {}),
            ...(raw.student_info?.focusSubjects ? { focusSubjects: raw.student_info.focusSubjects } : {}),
            ...(raw.student_info?.region ? { region: raw.student_info.region } : {}),
            ...(raw.student_info?.height !== undefined ? { height: raw.student_info.height } : {}),
            ...(raw.student_info?.weight !== undefined ? { weight: raw.student_info.weight } : {}),
            ...(raw.student_info?.bmi !== undefined ? { bmi: raw.student_info.bmi } : {}),
            ...(raw.student_info?.activityLevel !== undefined ? { activityLevel: raw.student_info.activityLevel } : {}),
            ...(raw.student_info?.testDate ? { testDate: raw.student_info.testDate } : {}),
            ...(raw.student_info?.subjectPriorities ? { subjectPriorities: raw.student_info.subjectPriorities } : {}),
          },
          examDate: raw.student_info?.testDate || raw.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          careType: careTypeKey,
          careTypeName: cls.careTypeName || raw.care_type || '건강 균형형',
          secondaryCareType: cls.secondaryCareType,
          secondaryCareTypeName: cls.secondaryCareTypeName,
          secondaryConfidence: cls.secondaryConfidence,
          ...(Object.keys(cls).length > 0
            ? { classificationResult: { primary: cls.primary ?? careTypeKey, primaryScore: num(cls.primaryScore, 0), secondary: cls.secondary ?? [], secondaryScores, secondaryDetails, allScores } }
            : {}),
          careTypeBadgeColor: (CARE_TYPE_METADATA as any)[careTypeKey]?.badgeColor || 'bg-indigo-100 text-indigo-800 border-indigo-300',
          careTypeSummary: raw.analysis_text || '정밀 진단이 완료되었습니다.',
          metrics: derivedMetrics,
          // PC 행도 케어타입 처방 메타에서 실조언 (기존 고정 문구 3종 폐기)
          keyAdvice: metaPrescriptions
            ? {
                study: metaPrescriptions.study?.[0] || '취약 과목 오전 골든타임 배치',
                circadian: metaPrescriptions.sleep?.[0] || '밤 11시 반 취침 고정',
                stress: metaPrescriptions.mental?.[0] || '4-7-8 복식호흡',
              }
            : { study: '취약 과목 오전 집중 배치', circadian: '밤 11시 반 취침 고정', stress: '4-7-8 복식호흡' },
          ...(metaPrescriptions ? { prescriptions: metaPrescriptions } : {}),
          ...(raw.study_efficiency_data ? { cognitiveProfile: raw.study_efficiency_data } : {}),
          ...(raw.protocol_data && Object.keys(raw.protocol_data).length > 0 ? { protocolData: raw.protocol_data } : {}),
          ...(raw.analytics_data && Object.keys(raw.analytics_data).length > 0 ? { analyticsData: raw.analytics_data } : {}),
          // survey_data → surveyScores (PC 정식 키 + 모바일 구 키 모두 보존)
          ...(raw.survey_data && Object.keys(raw.survey_data).length > 0 ? { surveyScores: raw.survey_data } : {}),
          topCareScores: Array.isArray(cls.topCareScores) ? cls.topCareScores : allScores.slice(0, 5).map((s: any) => ({
            type: s.type,
            name: ((CARE_TYPE_METADATA as any)[s.type]?.nameKr) || String(s.type),
            score: num(s.score, 0),
            description: ((CARE_TYPE_METADATA as any)[s.type]?.summary) || '',
          })),
        };
        localStorage.setItem(KEYS.ASSESSMENT + studentId, JSON.stringify(res));
      }

      // 2. grade_records 조회
      const { data: grData } = await supabase
        .from('grade_records')
        .select('*')
        .eq('student_id', studentId)
        .order('exam_date', { ascending: false });

      if (grData && grData.length > 0) {
        const mappedGrades: MobileGradeRecord[] = grData.map(r => ({
          id: r.id,
          studentId: r.student_id,
          examName: r.exam_name,
          examDate: r.exam_date,
          examType: (r.exam_type as any) || 'MOCK',
          scores: r.subjects || [],
          memo: r.memo,
          createdAt: r.created_at
        }));
        localStorage.setItem(KEYS.GRADES + studentId, JSON.stringify(mappedGrades));
      }

      // 3. sleep_records 조회
      const { data: slpData } = await supabase
        .from('sleep_records')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false });

      if (slpData && slpData.length > 0) {
        const mappedSleep: SleepLogItem[] = slpData.map(s => ({
          id: s.id,
          studentId: s.student_id,
          date: s.date,
          bedTime: s.bed_time || '01:00',
          wakeTime: s.wake_time || '07:00',
          totalHours: Number(s.total_hours) || 6,
          sleepDebtHours: Number(s.sleep_debt_hours) || 1.5,
          quality: s.quality || 'NORMAL',
          memo: s.memo
        }));
        localStorage.setItem(KEYS.SLEEP_LOGS + studentId, JSON.stringify(mappedSleep));
      }

      // 4. student_schedules 조회
      const { data: schData } = await supabase
        .from('student_schedules' as any)
        .select('*')
        .eq('student_id', studentId)
        .maybeSingle();

      if (schData && (schData as any).schedules) {
        localStorage.setItem(KEYS.SCHEDULES + studentId, JSON.stringify((schData as any).schedules));
      }

      // 5. habit_progress 조회
      const { data: hbtData } = await supabase
        .from('habit_progress')
        .select('*')
        .eq('student_id', studentId)
        .maybeSingle();

      if (hbtData && hbtData.fields) {
        localStorage.setItem(KEYS.HABIT_PROGRESS + studentId, JSON.stringify(hbtData.fields));
      }

      // 6. gamification_progress 조회
      const weekKey = getCurrentWeekKey();
      const { data: gmData } = await supabase
        .from('gamification_progress')
        .select('*')
        .eq('student_id', studentId)
        .eq('week_key', weekKey)
        .maybeSingle();

      if (gmData) {
        const gm: GamificationProgress = {
          studentId,
          weekKey,
          exp: gmData.exp || 0,
          level: gmData.level || 1,
          streak: gmData.streak || 0,
          completedTasks: gmData.completed_tasks || [],
          lastCompletedDate: gmData.last_completed_date,
          taskLog: gmData.task_log
        };
        localStorage.setItem(KEYS.GAMIFICATION + studentId, JSON.stringify(gm));
      }

      window.dispatchEvent(new CustomEvent('nbass_data_updated', { detail: { type: 'all' } }));
      return true;
    } catch (err) {
      console.warn('Sync from cloud notice:', err);
      return false;
    }
  },

  // ── 1. 진단 검사 및 결과 관리 ──
  // 기록이 없으면 null (목업 폴백 없음 — 호출 측에서 빈 상태 UI 표시)
  getLatestAssessment(studentId: string): MobileAssessmentResult | null {
    try {
      const data = localStorage.getItem(KEYS.ASSESSMENT + studentId);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return null;
  },

  async saveAssessment(result: MobileAssessmentResult): Promise<void> {
    const studentId = result.student.id;
    localStorage.setItem(KEYS.ASSESSMENT + studentId, JSON.stringify(result));
    // 과거 검사 이력 누적 (최신 50건, id 기준 upsert)
    try {
      const raw = localStorage.getItem(KEYS.ASSESSMENT_HISTORY + studentId);
      const list = raw ? JSON.parse(raw) : [];
      const arr = Array.isArray(list) ? list : [];
      const rid = (result as any).id || `${(result as any).examDate}-${(result as any).careType}`;
      const next = [{ ...result, id: rid }, ...arr.filter((r: any) => (r?.id || `${r?.examDate}-${r?.careType}`) !== rid)].slice(0, 50);
      localStorage.setItem(KEYS.ASSESSMENT_HISTORY + studentId, JSON.stringify(next));
    } catch { /* ignore */ }
    window.dispatchEvent(new CustomEvent('nbass_data_updated', { detail: { type: 'assessment', result } }));

    try {
      await supabase.from('assessments').insert({
        student_name: result.student.name,
        student_info: result.student,
        care_type: result.careType,
        care_score: result.metrics.brainVitality,
        classification_result: {
          careTypeName: result.careTypeName,
          secondaryCareType: result.secondaryCareType,
          secondaryConfidence: result.secondaryConfidence,
          topCareScores: result.topCareScores,
          ...(result.classificationResult
            ? {
                primary: result.classificationResult.primary,
                primaryScore: result.classificationResult.primaryScore,
                secondaryDetails: result.classificationResult.secondaryDetails,
                allScores: result.classificationResult.allScores,
              }
            : {}),
        },
        survey_data: result.surveyScores,
        protocol_data: (result as any).protocolData || {},
        analytics_data: (result as any).analyticsData || {},
        study_efficiency_data: result.cognitiveProfile,
        analysis_text: result.careTypeSummary,
        status: 'completed'
      } as any);
    } catch (err) {
      console.warn('Supabase assessment sync notice:', err);
    }
  },

  // ── 2. 스케줄 관리 ──
  getSchedules(studentId: string): ScheduleItem[] {
    try {
      const data = localStorage.getItem(KEYS.SCHEDULES + studentId);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return [];
  },

  async saveSchedules(studentId: string, items: ScheduleItem[]): Promise<void> {
    localStorage.setItem(KEYS.SCHEDULES + studentId, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('nbass_data_updated', { detail: { type: 'schedule', items } }));

    try {
      await supabase.from('student_schedules' as any).upsert({
        student_id: studentId,
        schedules: items,
        updated_at: new Date().toISOString()
      }, { onConflict: 'student_id' } as any);
      markMobilePushed('student_schedules', `sid:${studentId}`);
    } catch (err) {
      console.warn('Supabase schedule sync notice:', err);
    }
  },

  // ── 3. 성적 기록 관리 ──
  getGradeRecords(studentId: string): MobileGradeRecord[] {
    try {
      const data = localStorage.getItem(KEYS.GRADES + studentId);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return [];
  },

  async saveGradeRecord(record: MobileGradeRecord): Promise<void> {
    const records = this.getGradeRecords(record.studentId);
    const updated = [record, ...records.filter(r => r.id !== record.id)];
    localStorage.setItem(KEYS.GRADES + record.studentId, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('nbass_data_updated', { detail: { type: 'grade', record } }));

    try {
      await supabase.from('grade_records' as any).upsert({
        id: record.id,
        student_id: record.studentId,
        exam_name: record.examName,
        exam_type: record.examType,
        exam_date: record.examDate,
        subjects: record.scores,
        memo: record.memo,
        created_at: record.createdAt,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' } as any);
      markMobilePushed('grade_records', record.id);
    } catch (err) {
      console.warn('Supabase grade sync notice:', err);
    }
  },

  // ── 4. 수면 기록 관리 ──
  getSleepLogs(studentId: string): SleepLogItem[] {
    try {
      const data = localStorage.getItem(KEYS.SLEEP_LOGS + studentId);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return [];
  },

  async saveSleepLog(log: SleepLogItem): Promise<void> {
    const logs = this.getSleepLogs(log.studentId);
    const updated = [log, ...logs.filter(l => l.id !== log.id)];
    localStorage.setItem(KEYS.SLEEP_LOGS + log.studentId, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('nbass_data_updated', { detail: { type: 'sleep', log } }));

    try {
      await supabase.from('sleep_records' as any).upsert({
        id: log.id,
        student_id: log.studentId,
        date: log.date,
        bed_time: log.bedTime,
        wake_time: log.wakeTime,
        total_hours: log.totalHours,
        sleep_debt_hours: log.sleepDebtHours,
        quality: log.quality,
        memo: log.memo,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' } as any);
      markMobilePushed('sleep_records', log.id);
    } catch (err) {
      console.warn('Supabase sleep sync notice:', err);
    }
  },

  async deleteSleepLog(studentId: string, id: string): Promise<void> {
    const logs = this.getSleepLogs(studentId).filter(l => l.id !== id);
    localStorage.setItem(KEYS.SLEEP_LOGS + studentId, JSON.stringify(logs));
    window.dispatchEvent(new CustomEvent('nbass_data_updated', { detail: { type: 'sleep' } }));
  },

  // ── 5. 공부 습관 클리닉 ──
  getHabitProgress(studentId: string): any {
    try {
      const data = localStorage.getItem(KEYS.HABIT_PROGRESS + studentId);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return {};
  },

  async saveHabitProgress(studentId: string, fields: any): Promise<void> {
    localStorage.setItem(KEYS.HABIT_PROGRESS + studentId, JSON.stringify(fields));
    window.dispatchEvent(new CustomEvent('nbass_data_updated', { detail: { type: 'habit', fields } }));

    try {
      await supabase.from('habit_progress').upsert({
        student_id: studentId,
        fields,
        updated_at: new Date().toISOString()
      }, { onConflict: 'student_id' });
    } catch (err) {
      console.warn('Supabase habit sync notice:', err);
    }
  },

  getHabitDiagnosis(studentId: string): any {
    try {
      const data = localStorage.getItem('nbass_habit_diag_' + studentId);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return null;
  },

  async saveHabitDiagnosis(diag: any): Promise<void> {
    localStorage.setItem('nbass_habit_diag_' + diag.studentId, JSON.stringify(diag));
    window.dispatchEvent(new CustomEvent('nbass_data_updated', { detail: { type: 'habit', diag } }));

    try {
      await supabase.from('habit_progress').upsert({
        student_id: diag.studentId,
        fields: {
          checkedHabits: diag.checkedHabitIds,
          shockReport: diag.shockReport,
          updatedAt: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      }, { onConflict: 'student_id' });
    } catch (err) {
      console.warn('Supabase habit diag sync notice:', err);
    }
  },

  // ── 6. 게이미피케이션 액션 플래너 ──
  getGamificationProgress(studentId: string): GamificationProgress {
    const weekKey = getCurrentWeekKey();
    try {
      const data = localStorage.getItem(KEYS.GAMIFICATION + studentId);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.weekKey === weekKey) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return {
      studentId,
      weekKey,
      exp: 0,
      level: 1,
      streak: 0,
      completedTasks: []
    };
  },

  async saveGamificationProgress(progress: GamificationProgress): Promise<void> {
    localStorage.setItem(KEYS.GAMIFICATION + progress.studentId, JSON.stringify(progress));
    window.dispatchEvent(new CustomEvent('nbass_data_updated', { detail: { type: 'gamification', progress } }));

    try {
      await supabase.from('gamification_progress').upsert({
        student_id: progress.studentId,
        week_key: progress.weekKey,
        completed_tasks: progress.completedTasks,
        exp: progress.exp,
        level: progress.level,
        streak: progress.streak,
        last_completed_date: progress.lastCompletedDate,
        task_log: progress.taskLog || {},
        updated_at: new Date().toISOString()
      }, { onConflict: 'student_id,week_key' });
    } catch (err) {
      console.warn('Supabase gamification sync notice:', err);
    }
  },

  // ── 7. 오답노트 관리 ──
  getWrongNotes(studentId: string): WrongNoteItem[] {
    try {
      const data = localStorage.getItem(KEYS.WRONG_NOTES + studentId);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return [];
  },

  async saveWrongNote(note: WrongNoteItem): Promise<void> {
    const notes = this.getWrongNotes(note.studentId);
    const updated = [note, ...notes.filter(n => n.id !== note.id)];
    localStorage.setItem(KEYS.WRONG_NOTES + note.studentId, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('nbass_data_updated', { detail: { type: 'wrongNote', note } }));

    try {
      await supabase.from('wrong_notes' as any).upsert({
        id: note.id,
        student_id: note.studentId,
        subject: note.subject,
        unit_name: note.unitName,
        question_number: note.questionNumber,
        image_url: note.imageUrl,
        error_reason: note.errorReason,
        memo: note.memo,
        ai_prescription: note.aiPrescription,
        is_resolved: note.isResolved,
        created_at: note.createdAt,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' } as any);
      markMobilePushed('wrong_notes', note.id);
    } catch (err) {
      console.warn('Supabase wrongNote sync notice:', err);
    }
  },

  // ── 6. PC 연동 읽기 전용 (목표·검사 요약) ──────────
  // 저장 키는 supabaseRealtime Pull과 동일한 규칙을 사용합니다.
  getGradeGoals(studentId: string): any[] {
    try {
      const data = localStorage.getItem('nbass_grade_goals_' + studentId);
      const arr = data ? JSON.parse(data) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  },

  getSleepGoal(studentId: string): any | null {
    try {
      const data = localStorage.getItem('nbass_sleep_goals_' + studentId);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  getAssessmentSummaries(studentId: string): any[] {
    try {
      const data = localStorage.getItem('nbass_assessments_' + studentId);
      const arr = data ? JSON.parse(data) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  },

  /** 로컬 과거 검사 전체 (최신순, 최대 50건) */
  getAssessmentHistory(studentId: string): MobileAssessmentResult[] {
    try {
      const data = localStorage.getItem(KEYS.ASSESSMENT_HISTORY + studentId);
      const arr = data ? JSON.parse(data) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  },

  /** 클라우드 assessments 1건全文 조회 (이력 상세 보기용) */
  async fetchAssessmentRow(id: string): Promise<any | null> {
    try {
      const { data, error } = await (supabase.from('assessments') as any)
        .select('*')
        .eq('id', id)
        .limit(1)
        .maybeSingle();
      if (error || !data) return null;
      return data;
    } catch {
      return null;
    }
  },

  /** 누적 진단 횟수 (클라우드 요약 + 로컬 최신, 동일 진단 중복 제거) */
  countAssessments(studentId: string): number {
    try {
      const summaries = this.getAssessmentSummaries(studentId);
      const local = this.getLatestAssessment(studentId);
      if (!local) return summaries.length;
      const dup = summaries.some((s: any) => {
        const sameDate = String(s?.createdAt || '').slice(0, 10) === String((local as any)?.examDate || '').slice(0, 10);
        const sameType = (s?.careType || '') === ((local as any)?.careType || '');
        return sameDate && sameType;
      });
      return summaries.length + (dup ? 0 : 1);
    } catch {
      return 0;
    }
  },

  // ── 죽은 데이터 (나중에 구현): HRV/EEG 실측 — 로컬 저장만, 클라우드 전송 없음 ──
  getMobileBiosignals(studentId: string): any | null {
    try {
      const data = localStorage.getItem(KEYS.BIOSIGNALS + studentId);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async saveMobileBiosignals(entry: any): Promise<void> {
    if (!entry?.studentId) return;
    localStorage.setItem(KEYS.BIOSIGNALS + entry.studentId, JSON.stringify({
      ...entry,
      updatedAt: new Date().toISOString()
    }));
    window.dispatchEvent(new CustomEvent('nbass_data_updated', { detail: { type: 'biosignals' } }));
  },

  // ── 죽은 데이터 (나중에 구현): 혈액검사 12종 — 로컬 저장만, 클라우드 전송 없음 ──
  getMobileBloodTest(studentId: string): any | null {
    try {
      const data = localStorage.getItem(KEYS.BLOODTEST + studentId);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async saveMobileBloodTest(entry: any): Promise<void> {
    if (!entry?.studentId) return;
    localStorage.setItem(KEYS.BLOODTEST + entry.studentId, JSON.stringify({
      ...entry,
      updatedAt: new Date().toISOString()
    }));
    window.dispatchEvent(new CustomEvent('nbass_data_updated', { detail: { type: 'bloodtest' } }));
  }
};
