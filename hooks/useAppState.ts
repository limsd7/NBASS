import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  StudentInfo, HRVData, ProtocolData, LearningAnalyticsData, AssessmentResult, 
  BloodTestData, PortableHRVData, CareType 
} from '../types';
import { 
  initialStudent as defaultStudent, initialHRV, initialProtocol, initialAnalytics, getTodayStr, generateSerialID 
} from '../utils/constants';

const initialStudent: StudentInfo = {
  ...defaultStudent,
  id: generateSerialID(),
  testDate: getTodayStr()
};

export const useAppState = () => {
  const [step, setStep] = useState<string>('register');
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');
  const [student, setStudent] = useState<StudentInfo>(initialStudent);
  const [hrv, setHrv] = useState<HRVData>(initialHRV);
  const [protocol, setProtocol] = useState<ProtocolData>(initialProtocol);
  const [analytics, setAnalytics] = useState<LearningAnalyticsData>(initialAnalytics);
  const [bloodTest, setBloodTest] = useState<BloodTestData>({
    wbc: 0, hemoglobin: 0, hematocrit: 0, mcv: 0, nkActivity: 0,
    vitaminD: 0, crp: 0, hba1c: 0,
    ast: 0, alt: 0, creatinine: 0, bun: 0,
    fastingHours: 0
  });

  return {
    step, setStep,
    activeMenu, setActiveMenu,
    student, setStudent,
    hrv, setHrv,
    protocol, setProtocol,
    analytics, setAnalytics,
    bloodTest, setBloodTest
  };
};
