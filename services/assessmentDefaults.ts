import { AssessmentResult, CareType, StudentInfo } from '../types';
import {
  initialStudent as baseStudent,
  initialHRV,
  initialProtocol,
  initialAnalytics,
  generateSerialID,
  getTodayStr,
} from '../utils/constants';

// App.tsx에서 분리 (UI 변경 없음, 코드 위치만 이동)
export const initialStudent: StudentInfo = {
  ...baseStudent,
  id: generateSerialID(),
  testDate: getTodayStr(),
  grade: '고등 3학년',
};

// 입력 근거가 없을 때의 기본값: 판정 불가(UNASSESSED).
// 결과 화면 게이트가 가로채 미완료 안내를 보여주므로 확정 진단처럼 보이지 않는다.
export const createDefaultAssessmentResult = (
  studentInfo?: Partial<StudentInfo> | null
): AssessmentResult & { date: string } => {
  const effectiveStudent: StudentInfo = {
    ...initialStudent,
    ...(studentInfo || {}),
    name: studentInfo?.name || '수험생',
    testDate: studentInfo?.testDate || getTodayStr(),
  };

  return {
    student: effectiveStudent,
    careType: CareType.UNASSESSED,
    dominantCareType: CareType.UNASSESSED,
    score: 0,
    scoreLevel: '미평가',
    date: effectiveStudent.testDate || getTodayStr(),
    analysisText: '',
    sleepAnalysisText: '',
    hrv: initialHRV,
    survey: {
      bai: 0,
      isi: 0,
      chronicFatigue: false,
      fatigueSymptomsCount: 0,
      symptoms: [],
      sympatheticSymptoms: [],
      parasympatheticSymptoms: [],
      concentrationScore: 0,
    },
    protocol: initialProtocol,
    analytics: initialAnalytics,
    nutrition: [],
    careGuide: [],
  };
};
