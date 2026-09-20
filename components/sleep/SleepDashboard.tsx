import React, { useState, useEffect, useMemo } from 'react';
import { CareType, LearningAnalyticsData, SleepPrescription, SleepRecord } from '../../types';
import { generateSleepPrescription } from '../../utils/sleepLogic';
import { unifiedSyncService as DatabaseService } from '../../services/unifiedSyncService';

interface SleepDashboardProps {
  careType: CareType;
  analytics: LearningAnalyticsData;
  studentId?: string;
  sleepRecords?: SleepRecord[];
}

export const SleepDashboard: React.FC<SleepDashboardProps> = ({ careType, analytics, studentId, sleepRecords: propRecords }) => {
  const [loadedRecords, setLoadedRecords] = useState<SleepRecord[]>(propRecords || []);

  useEffect(() => {
    if (propRecords) {
      setLoadedRecords(propRecords);
    } else if (studentId) {
      DatabaseService.getSleepRecords(studentId).then(records => {
        if (records && records.length > 0) {
          setLoadedRecords(records);
        }
      }).catch(err => console.error('Failed to load sleep records in SleepDashboard:', err));
    }
  }, [studentId, propRecords]);

  const prescription: SleepPrescription = useMemo(() => 
    generateSleepPrescription(careType, analytics, loadedRecords), 
  [careType, analytics, loadedRecords]);

  const styles = {
    container: {
      backgroundColor: 'rgba(25, 25, 30, 0.95)',
      borderRadius: '16px',
      padding: '24px',
      color: '#fff',
      fontFamily: '"Inter", "Roboto", sans-serif',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      marginTop: '20px'
    },
    header: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '16px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      paddingBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '20px'
    },
    card: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      padding: '16px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      transition: 'transform 0.2s',
    },
    cardTitle: {
      fontSize: '14px',
      color: '#aaa',
      textTransform: 'uppercase' as const,
      letterSpacing: '1px',
      marginBottom: '8px'
    },
    cardValue: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#4db8ff'
    },
    routineList: {
      listStyleType: 'none',
      padding: 0,
      margin: 0
    },
    routineItem: {
      padding: '8px 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      fontSize: '15px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    highlight: {
      color: '#ffd43b',
      fontWeight: 'bold'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>
        🌙 맞춤형 수면 관리 프로그램
      </h2>
      
      <p style={{ marginBottom: '24px', lineHeight: '1.6', color: '#ccc' }}>
        <strong>Care Type ({careType})</strong>와 <strong>공부 패턴</strong>을 분석한 결과입니다.<br/>
        {prescription.sleepStrategy}
      </p>

      {/* [NEW] 실측 수면 데이터 역피드백 배너 */}
      {prescription.feedbackFromRecords && (
        <div className="mb-6 p-4 bg-indigo-950/70 border border-indigo-500/40 rounded-xl flex items-start gap-3">
          <span className="text-2xl">📊</span>
          <div className="text-sm leading-relaxed text-indigo-100">
            <strong className="text-amber-300 font-bold block mb-1">실시간 수면 기록 피드백 연동</strong>
            {prescription.feedbackFromRecords}
          </div>
        </div>
      )}

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>권장 취침 시간</div>
          <div style={styles.cardValue}>{prescription.recommendedBedtime}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>권장 기상 시간</div>
          <div style={styles.cardValue}>{prescription.recommendedWakeTime}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>목표 수면 시간</div>
          <div style={styles.cardValue}>
            {prescription.targetSleepDuration} 시간
            {prescription.actualSleepAvg && (
              <span className="text-xs text-indigo-300 font-normal ml-2">
                (실측: {prescription.actualSleepAvg}h)
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>수면 전 루틴 (Pre-sleep Routine)</div>
          <ul style={styles.routineList}>
            {prescription.preSleepRoutine.map((routine, idx) => (
              <li key={idx} style={styles.routineItem}>
                <span style={{color: '#4db8ff'}}>✓</span> {routine}
              </li>
            ))}
          </ul>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>공부 패턴 및 크로노타입</div>
          <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#eee' }}>
            {prescription.chronotypeNotes}
          </p>
          {prescription.powerNap?.recommended && (
            <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'rgba(255, 212, 59, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 212, 59, 0.3)' }}>
              <strong style={styles.highlight}>💡 파워 냅(Power Nap) 권장</strong><br/>
              시간: {prescription.powerNap.timing} ({prescription.powerNap.duration}분)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
