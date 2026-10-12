import React, { useState, useEffect, useMemo } from 'react';
import { unifiedSyncService as DatabaseService } from '../../services/unifiedSyncService';
import { pullAssessmentsByStudentCode } from '../../services/supabaseRealtimeSync';
import type { HistoryRecord } from '../../services/database';
import { UserTierService, UserTierOverride } from '../../services/userTierService';
import { MembershipTier, TIER_INFO, normalizeTier } from '../../utils/featureGate';
import { StudentInfo, AssessmentResult } from '../../types';
import { getLimsd7Records, getPractice001Records, getTestExpert01Records } from '../../services/defaultStudentRecords';

interface StudentDirectoryItem {
  id: string;
  name: string;
  email?: string;
  grade?: string;
  gender?: string;
  school?: string;
  birthDate?: string;
  careType?: string;
  examCount: number;
  latestDate: string;
  tier: MembershipTier;
  latestRecord?: HistoryRecord;
  records: HistoryRecord[];
}

interface StudentDirectoryViewProps {
  onBack: () => void;
  onViewReport: (record: HistoryRecord) => void;
  onTestWithStudent: (student: StudentInfo) => void;
  onFollowUpTest?: (record: HistoryRecord) => void;
}

export const StudentDirectoryView: React.FC<StudentDirectoryViewProps> = ({
  onBack,
  onViewReport,
  onTestWithStudent,
  onFollowUpTest
}) => {
  const [students, setStudents] = useState<StudentDirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTierFilter, setSelectedTierFilter] = useState<'all' | MembershipTier>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'name_asc' | 'count_desc' | 'tier_desc'>('date_desc');
  const [tierOverrides, setTierOverrides] = useState<Record<string, UserTierOverride>>(() => UserTierService.getOverrides());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // History detail modal state
  const [selectedHistoryStudent, setSelectedHistoryStudent] = useState<StudentDirectoryItem | null>(null);

  // Add new student modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState('고3');
  const [newStudentGender, setNewStudentGender] = useState<'male' | 'female'>('male');
  const [newStudentSchool, setNewStudentSchool] = useState('');
  const [newStudentTier, setNewStudentTier] = useState<MembershipTier>('expert');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 관제에서 삭제한 하드코딩 샘플 계정의 재생성 방지 플래그 (UI 없음, localStorage)
  const HIDDEN_SAMPLES_KEY = 'nbass_hidden_sample_ids';
  const KNOWN_SAMPLE_KEYS = new Set(['limsd7', 'test_expert_01', 'id-20260820-6rkr', '연습001', '오류검증_전문가01']);

  const getHiddenSampleIds = (): Set<string> => {
    try {
      const raw = localStorage.getItem(HIDDEN_SAMPLES_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return new Set((Array.isArray(arr) ? arr : []).map((s: unknown) => String(s).toLowerCase()));
    } catch {
      return new Set();
    }
  };

  const hideSampleId = (id?: string | null, name?: string | null): void => {
    try {
      const targets = [id, name].filter(Boolean).map(s => String(s).trim().toLowerCase());
      if (!targets.some(t => KNOWN_SAMPLE_KEYS.has(t))) return;
      const set = getHiddenSampleIds();
      targets.forEach(t => set.add(t));
      localStorage.setItem(HIDDEN_SAMPLES_KEY, JSON.stringify([...set].slice(0, 100)));
    } catch { /* ignore */ }
  };

  // Load and consolidate student data
  const loadData = async () => {
    setLoading(true);
    try {
      const allHistory = await DatabaseService.getAllHistory();
      const overrides = UserTierService.getOverrides();
      setTierOverrides(overrides);
      const hiddenSamples = getHiddenSampleIds();

      const studentMap = new Map<string, StudentDirectoryItem>();

      // 1. Initialize sample/default test accounts with realistic assessment records
      // (관제에서 🗑️ 삭제한 샘플은 다시 주입하지 않음 — 삭제 존중)
      const limsd7Records = getLimsd7Records();
      const practiceRecords = getPractice001Records();
      const expertRecords = getTestExpert01Records();

      const defaultSamples: StudentDirectoryItem[] = [
        {
          id: 'limsd7',
          name: 'limsd7',
          email: 'limsd7@naver.com',
          grade: '고3',
          gender: '남성',
          school: '대치 미래탐구 (PRO 집중케어반)',
          birthDate: '2008-07-15',
          careType: '뇌피로 집중곤란 (Brain Fatigue)',
          examCount: limsd7Records.length,
          latestDate: limsd7Records[0]?.date || new Date().toISOString().split('T')[0],
          tier: 'pro',
          latestRecord: limsd7Records[0],
          records: limsd7Records
        },
        {
          id: 'TEST_EXPERT_01',
          name: '오류검증_전문가01',
          email: 'expert01@nbass.io',
          grade: '고3 (N수)',
          gender: '남성',
          school: 'NBASS 시스템 검증 연구팀',
          birthDate: '2007-11-10',
          careType: '전 기능 무제한 검증 모드',
          examCount: expertRecords.length,
          latestDate: expertRecords[0]?.date || new Date().toISOString().split('T')[0],
          tier: 'expert',
          latestRecord: expertRecords[0],
          records: expertRecords
        },
        {
          id: 'ID-20260820-6RKR',
          name: '연습001',
          email: 'practice001@nbass.io',
          grade: '고3',
          gender: '남성',
          school: '대치 미래탐구',
          birthDate: '2008-03-20',
          careType: '과긴장 번아웃 (Burnout)',
          examCount: practiceRecords.length,
          latestDate: practiceRecords[0]?.date || new Date().toISOString().split('T')[0],
          tier: 'premium',
          latestRecord: practiceRecords[0],
          records: practiceRecords
        }
      ];

      defaultSamples.forEach(item => {
        if (hiddenSamples.has(item.id.toLowerCase()) || hiddenSamples.has(item.name.toLowerCase())) return;
        const effTier = UserTierService.getEffectiveTier(item.id || item.name, item.tier);
        studentMap.set(item.id.toLowerCase(), { ...item, tier: effTier });
      });

      // 2. Consolidate records from IndexedDB History
      allHistory.forEach(record => {
        if (!record.student) return;
        const student = record.student;
        const sName = (student.name || '').trim();
        const sId = (student.id || '').trim();
        if (!sName && !sId) return;

        // 학생 매칭 키: ID 우선, 이름 차선
        const canonicalKey = sId ? sId.toLowerCase() : `name_${sName.toLowerCase()}`;
        
        // Find if this student already exists in studentMap (by id, email, or name)
        // 이메일 병합: 구 Serial ID 행과 신 로그인 ID 행을 동일인으로 묶어 표시
        let existingKey: string | null = null;
        const sEmail = ((student as any).email || '').trim().toLowerCase();
        for (const [k, s] of studentMap.entries()) {
          const sidMatch = sId && s.id.toLowerCase() === sId.toLowerCase();
          const nameMatch = sName && s.name.toLowerCase() === sName.toLowerCase();
          const emailMatch = sEmail && ((s.email || '').toLowerCase() === sEmail);
          if (sidMatch || nameMatch || emailMatch) {
            existingKey = k;
            break;
          }
        }

        const effectiveTier = UserTierService.getEffectiveTier(
          student.id || student.name, 
          (student.membershipTier as MembershipTier) || 'free'
        );

        if (!existingKey) {
          studentMap.set(canonicalKey, {
            id: student.id || canonicalKey,
            name: student.name || '무명 수험생',
            email: student.email || record.student?.email,
            grade: student.grade || '고3',
            gender: (student.gender === 'Male' || (student.gender as any) === 'male') ? '남성' : (student.gender === 'Female' || (student.gender as any) === 'female') ? '여성' : undefined,
            school: student.school || student.affiliatedAcademyId || '일반 수험생',
            birthDate: student.birthDate,
            careType: (record.careType as any)?.label || record.careType || (record as any).dominantCareType || '정상',
            examCount: 1,
            latestDate: record.date || student.testDate || new Date().toISOString().split('T')[0],
            tier: effectiveTier,
            latestRecord: record,
            records: [record]
          });
        } else {
          const item = studentMap.get(existingKey)!;
          if (student.id && (!item.id || item.id.startsWith('name_'))) {
            item.id = student.id;
          }
          if (student.email && !item.email) {
            item.email = student.email;
          }
          // 중복 레코드 방지 (동일 날짜 및 케어타입 확인)
          const isDuplicate = item.records.some(r => r.date === record.date && r.careType === record.careType);
          if (!isDuplicate) {
            item.records.push(record);
          }
          item.examCount = item.records.length;
          
          const recordDate = new Date(record.date || '').getTime();
          const currentDate = new Date(item.latestDate || '').getTime();
          if (recordDate >= currentDate || !item.latestRecord) {
            item.latestDate = record.date;
            item.latestRecord = record;
            if ((record.careType as any)?.label || record.careType) item.careType = (record.careType as any)?.label || record.careType;
          }
        }
      });

      // 3. Ensure all accounts with active overrides in UserTierService are present
      // (삭제된 샘플의 오버라이드 유령 항목은 재생성하지 않음)
      Object.entries(overrides).forEach(([key, override]) => {
        const oId = override.studentId || key;
        const oName = override.name || oId;
        if (hiddenSamples.has(oId.toLowerCase()) || hiddenSamples.has(oName.toLowerCase())) return;
        const alreadyExists = Array.from(studentMap.values()).some(s => 
          s.id.toLowerCase() === oId.toLowerCase() || 
          s.name.toLowerCase() === oName.toLowerCase()
        );
        if (!alreadyExists) {
          studentMap.set(oId.toLowerCase(), {
            id: oId,
            name: oName,
            grade: '고3',
            gender: '남성',
            school: 'NBASS 회원 수험생',
            careType: '신규 등록 대기',
            examCount: 0,
            latestDate: override.updatedAt ? override.updatedAt.split('T')[0] : new Date().toISOString().split('T')[0],
            tier: override.tier || 'free',
            records: []
          });
        }
      });

      // Sort records for each student
      studentMap.forEach(item => {
        item.records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (item.records.length > 0 && !item.latestRecord) {
          item.latestRecord = item.records[0];
        }
      });

      setStudents(Array.from(studentMap.values()));
    } catch (err) {
      console.error('Failed to load student directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle tier change by Owner
  const handleTierChange = async (student: StudentDirectoryItem, newTier: MembershipTier) => {
    const studentEmail = student.email || student.records.find(r => r.student?.email)?.student?.email;
    UserTierService.setUserTier(
      student.id, 
      newTier, 
      student.name, 
      `오너 실시간 등급 변경 (${newTier.toUpperCase()})`,
      studentEmail
    );
    
    // Also sync to DB
    await DatabaseService.updateStudentMembershipTier(student.id, newTier);
    if (student.name && student.name !== student.id) {
      await DatabaseService.updateStudentMembershipTier(student.name, newTier);
    }
    if (studentEmail && studentEmail !== student.id && studentEmail !== student.name) {
      await DatabaseService.updateStudentMembershipTier(studentEmail, newTier);
    }

    // Update local state
    setStudents(prev => prev.map(s => {
      if (s.id === student.id || s.name === student.name || (studentEmail && s.email === studentEmail)) {
        return { ...s, tier: newTier };
      }
      return s;
    }));

    showToast(`✅ [${student.name}] 학생의 등급이 [${TIER_INFO[newTier].name}] (으)로 변경되었습니다!`);
  };

  // Add new test student
  const handleCreateTestStudent = () => {
    if (!newStudentName.trim()) {
      alert('학생 이름을 입력해주세요.');
      return;
    }

    const randomId = `TEST_${Date.now().toString(36).toUpperCase()}`;
    const newStudent: StudentDirectoryItem = {
      id: randomId,
      name: newStudentName.trim(),
      grade: newStudentGrade,
      gender: newStudentGender === 'male' ? '남성' : '여성',
      school: newStudentSchool.trim() || '오너 테스트 연구소',
      careType: '신규 등록 대기',
      examCount: 0,
      latestDate: new Date().toISOString().split('T')[0],
      tier: newStudentTier,
      records: []
    };

    UserTierService.setUserTier(
      randomId, 
      newStudentTier, 
      newStudent.name, 
      '오너 신규 테스트 계정 생성'
    );

    setStudents(prev => [newStudent, ...prev]);
    setShowAddModal(false);
    setNewStudentName('');
    setNewStudentSchool('');
    showToast(`🎉 [${newStudent.name}] (${TIER_INFO[newStudentTier].name}) 테스트 학생이 생성되었습니다!`);
  };

  // Filter & Sort
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      // Tier filter (레거시 vip는 premium으로 간주)
      if (selectedTierFilter !== 'all' && normalizeTier(s.tier) !== selectedTierFilter) {
        return false;
      }
      // Search filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matchName = s.name.toLowerCase().includes(term);
        const matchId = s.id.toLowerCase().includes(term);
        const matchSchool = (s.school || '').toLowerCase().includes(term);
        const matchCare = (s.careType || '').toLowerCase().includes(term);
        return matchName || matchId || matchSchool || matchCare;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime();
      if (sortBy === 'date_asc') return new Date(a.latestDate).getTime() - new Date(b.latestDate).getTime();
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name, 'ko');
      if (sortBy === 'count_desc') return b.examCount - a.examCount;
      if (sortBy === 'tier_desc') {
        const order: Record<string, number> = { expert: 6, premium: 3, pro: 2, free: 0 };
        return (order[b.tier] ?? 0) - (order[a.tier] ?? 0);
      }
      return 0;
    });
  }, [students, selectedTierFilter, searchTerm, sortBy]);

  // Tier Counts for Stats
  const counts = useMemo(() => {
    const res: Record<string, number> = { all: students.length, free: 0, pro: 0, premium: 0, expert: 0 };
    students.forEach(s => {
      const k = normalizeTier(s.tier);
      if (res[k] !== undefined) res[k]++;
    });
    return res;
  }, [students]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400 animate-in fade-in slide-in-from-top-4 duration-300">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 hover:border-slate-700 text-xs font-bold transition-all flex items-center gap-2 shadow"
              title="관리자 포털로 돌아가기"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              <span>← 관리자 포털</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl font-black text-white tracking-tight">🎓 수험생 회원 데이터베이스 &amp; 등급 관제 시스템</span>
                <span className="bg-purple-900/60 text-purple-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-purple-500/40">
                  OWNER CONTROL
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                회원가입된 모든 수험생의 진단 자료, 히스토리, 24P 처방전 열람 및 실시간 회원 등급(무료/PRO/PREMIUM/EXPERT) 제어
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                if (confirm('전체 학생 DB에서 중복된 검사 기록을 자동으로 정리(Deduplication)하시겠습니까?')) {
                  const count = await DatabaseService.deduplicateHistory();
                  showToast(`🧹 중복 기록 ${count}건이 성공적으로 정리되었습니다!`);
                  loadData();
                }
              }}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shadow"
              title="동일 학생의 중복 레코드 정리"
            >
              <span>🧹 중복 기록 정리</span>
            </button>
            <button
              onClick={async () => {
                const code = prompt('모바일에서 검사한 학생 코드 또는 이름을 입력하세요 (예: STD-2026-001 또는 김민준)');
                if (!code || !code.trim()) return;
                showToast('☁️ 클라우드에서 모바일 진단을 가져오는 중...');
                const res = await pullAssessmentsByStudentCode(code.trim());
                if (res.matched === 0) {
                  showToast(`⚠️ [${code.trim()}] 일치하는 클라우드 진단이 없습니다. 모바일에서 저장 + SQL 동기화를 확인하세요.`);
                } else {
                  showToast(`✅ [${code.trim()}] ${res.matched}건 중 ${res.added}건을 가져왔습니다.`);
                  loadData();
                }
              }}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-xl border border-sky-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shadow"
              title="모바일 앱에서 저장된 진단을 학생코드/이름으로 직접 가져오기 (목록에 없는 신규학생용)"
            >
              <span>☁️ 모바일 진단 가져오기</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-purple-600/20"
            >
              <span>+ 신규 테스트 학생 등록</span>
            </button>
            <button
              onClick={loadData}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 text-xs font-bold transition-all"
              title="새로고침"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>
        </div>

        {/* EXPERT Debug Info Banner */}
        <div className="mt-4 bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-slate-900/60 border border-purple-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xl flex-shrink-0">
              🛠️
            </div>
            <div>
              <h4 className="text-sm font-bold text-purple-200">
                전문가(EXPERT) 등급 특수 권한 및 시스템 취약점/오류 검증 모드
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                오너가 앱의 취약점이나 기능적 오류를 찾기 위해 모든 페이월/기능 제한을 완전히 해제하고, 원시 생체 데이터 및 전체 24P 리포트 파이프라인을 자유롭게 테스트할 수 있는 최고 권한 등급입니다.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const expertStudent = students.find(s => s.tier === 'expert') || students[0];
              if (expertStudent) {
                const fullStudent: StudentInfo = expertStudent.latestRecord?.student ? {
                  ...expertStudent.latestRecord.student,
                  id: expertStudent.id || expertStudent.latestRecord.student.id,
                  name: expertStudent.name || expertStudent.latestRecord.student.name,
                  membershipTier: 'expert'
                } : {
                  id: expertStudent.id,
                  name: expertStudent.name,
                  testDate: new Date().toISOString().split('T')[0],
                  birthDate: expertStudent.birthDate || '2008-03-01',
                  age: 18,
                  grade: expertStudent.grade || '고등 3학년',
                  gender: (expertStudent.gender === '남성' ? 'male' : 'female') as any,
                  school: expertStudent.school || '시스템 검증',
                  membershipTier: 'expert'
                };
                onTestWithStudent(fullStudent);
              }
            }}
            className="px-3.5 py-1.5 bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white rounded-xl border border-purple-500/40 text-xs font-bold transition-all whitespace-nowrap shadow"
          >
            ⚡ EXPERT 모드로 즉시 앱 테스트 실행
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mt-4">
          <div 
            onClick={() => setSelectedTierFilter('all')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${selectedTierFilter === 'all' ? 'bg-blue-600/20 border-blue-500 shadow-md shadow-blue-500/10' : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'}`}
          >
            <div className="text-[11px] font-bold text-slate-400">전체 수험생</div>
            <div className="text-xl font-black text-white mt-1">{counts.all}명</div>
          </div>

          <div 
            onClick={() => setSelectedTierFilter('free')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${selectedTierFilter === 'free' ? 'bg-slate-700/40 border-slate-400 shadow-md' : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'}`}
          >
            <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <span>🌱 무료 (FREE)</span>
            </div>
            <div className="text-xl font-black text-slate-300 mt-1">{counts.free}명</div>
          </div>

          <div 
            onClick={() => setSelectedTierFilter('pro')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${selectedTierFilter === 'pro' ? 'bg-blue-600/20 border-blue-400 shadow-md shadow-blue-500/10' : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'}`}
          >
            <div className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
              <span>⚡ PRO (1회)</span>
            </div>
            <div className="text-xl font-black text-blue-300 mt-1">{counts.pro}명</div>
          </div>

          <div 
            onClick={() => setSelectedTierFilter('premium')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${selectedTierFilter === 'premium' ? 'bg-indigo-600/20 border-indigo-400 shadow-md shadow-indigo-500/10' : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'}`}
          >
            <div className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
              <span>💎 PREMIUM</span>
            </div>
            <div className="text-xl font-black text-indigo-300 mt-1">{counts.premium}명</div>
          </div>

          <div
            onClick={() => setSelectedTierFilter('expert')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${selectedTierFilter === 'expert' ? 'bg-purple-600/20 border-purple-400 shadow-md shadow-purple-500/10' : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'}`}
          >
            <div className="text-[11px] font-bold text-purple-400 flex items-center gap-1">
              <span>🛠️ EXPERT</span>
            </div>
            <div className="text-xl font-black text-purple-300 mt-1">{counts.expert}명</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
          {/* Tier Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: '전체' },
              { id: 'free', label: '🌱 무료' },
              { id: 'pro', label: '⚡ PRO' },
              { id: 'premium', label: '💎 PREMIUM' },
              { id: 'expert', label: '🛠️ EXPERT' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTierFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedTierFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search and Sort */}
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="학생명, ID, 학교, 케어타입 검색..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <svg className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1.5 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 text-slate-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
            >
              <option value="date_desc">최근 검사일순</option>
              <option value="date_asc">오래된 검사일순</option>
              <option value="name_asc">이름순 (가나다)</option>
              <option value="count_desc">검사 횟수 많은순</option>
              <option value="tier_desc">회원 등급 높은순</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Student Directory Table (일렬 정렬) */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">수험생 정보</th>
                  <th className="py-3.5 px-4">학생 식별 ID</th>
                  <th className="py-3.5 px-4">진단 케어타입</th>
                  <th className="py-3.5 px-4">검사 이력 / 최근 검사일</th>
                  <th className="py-3.5 px-4 text-center">현재 회원 등급</th>
                  <th className="py-3.5 px-4 text-center">오너 등급 즉시 승급/변경</th>
                  <th className="py-3.5 px-4 text-right">자료 열람 및 테스트</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      검색 조건에 해당하는 수험생 데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, idx) => {
                    const tierInfo = TIER_INFO[normalizeTier(student.tier)] || TIER_INFO.free;
                    return (
                      <tr 
                        key={student.id + idx}
                        className="hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* No */}
                        <td className="py-3.5 px-4 text-center text-slate-500 font-mono">
                          {idx + 1}
                        </td>

                        {/* Student Info */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-sm flex items-center gap-1.5">
                            <span>{student.name}</span>
                            {student.gender && (
                              <span className="text-[10px] text-slate-400 font-normal">
                                ({student.gender}, {student.grade || '고3'})
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[180px]">
                            {student.school || '일반 수험생'}
                          </div>
                        </td>

                        {/* Student ID */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(student.id);
                              showToast(`📋 ID 복사 완료: ${student.id}`);
                            }}
                            className="font-mono text-[11px] text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 px-2 py-1 rounded-md border border-indigo-800/40 hover:border-indigo-600 transition-all flex items-center gap-1"
                            title="클릭 시 ID 복사"
                          >
                            <span>{student.id}</span>
                            <span className="text-[9px] text-slate-500">복사</span>
                          </button>
                        </td>

                        {/* Care Type */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                            student.careType?.includes('정서') ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' :
                            student.careType?.includes('몰입') ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                            student.careType?.includes('과각성') ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' :
                            'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                          }`}>
                            {student.careType || '정상'}
                          </span>
                        </td>

                        {/* Exam Status */}
                        <td className="py-3.5 px-4">
                          <div className="text-slate-300 font-semibold">
                            총 <span className="text-white font-bold">{student.examCount}회</span> 검사
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            최근: {student.latestDate}
                          </div>
                        </td>

                        {/* Current Tier Badge */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black shadow-sm ${
                            normalizeTier(student.tier) === 'expert' ? 'bg-purple-600/30 text-purple-200 border border-purple-400' :
                            normalizeTier(student.tier) === 'premium' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-400' :
                            normalizeTier(student.tier) === 'pro' ? 'bg-blue-600/20 text-blue-300 border border-blue-400' :
                            'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            <span>{tierInfo.icon}</span>
                            <span>{tierInfo.name.split(' ')[0]}</span>
                          </span>
                        </td>

                        {/* Owner Instant Tier Adjustment Dropdown */}
                        <td className="py-3.5 px-4 text-center">
                          <select
                            value={student.tier}
                            onChange={(e) => handleTierChange(student, e.target.value as MembershipTier)}
                            className="bg-slate-950 border border-slate-700 hover:border-indigo-500 text-white rounded-xl px-2.5 py-1 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                          >
                            <option value="free">🌱 FREE (무료체험)</option>
                            <option value="pro">⚡ PRO (1회권)</option>
                            <option value="premium">💎 PREMIUM (정기구독)</option>
                            <option value="expert">🛠️ EXPERT (오류검증/전권)</option>
                          </select>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* 24P Report Button */}
                            {student.latestRecord ? (
                              <button
                                onClick={() => onViewReport(student.latestRecord!)}
                                className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg border border-blue-500/30 text-[11px] font-bold transition-all"
                                title="24P 정밀 처방전 리포트 열람"
                              >
                                📄 24P 리포트
                              </button>
                            ) : (
                              <button
                                disabled
                                className="px-2.5 py-1 bg-slate-800/40 text-slate-600 rounded-lg text-[11px] font-medium cursor-not-allowed"
                              >
                                기록 없음
                              </button>
                            )}

                            {/* History Modal Button */}
                            <button
                              onClick={() => setSelectedHistoryStudent(student)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 text-[11px] font-bold transition-all"
                              title="누적 검사 이력 보기"
                            >
                              📊 히스토리
                            </button>

                            {/* Test Execution with this student */}
                            <button
                              onClick={() => {
                                const fullStudent: StudentInfo = student.latestRecord?.student ? {
                                  ...student.latestRecord.student,
                                  id: student.id || student.latestRecord.student.id,
                                  name: student.name || student.latestRecord.student.name,
                                  membershipTier: student.tier || student.latestRecord.student.membershipTier
                                } : {
                                  id: student.id,
                                  name: student.name,
                                  testDate: new Date().toISOString().split('T')[0],
                                  birthDate: student.birthDate || '2008-03-01',
                                  age: 18,
                                  grade: student.grade || '고등 3학년',
                                  gender: (student.gender === '남성' ? 'male' : 'female') as any,
                                  school: student.school || '시스템 검증',
                                  membershipTier: student.tier
                                };
                                onTestWithStudent(fullStudent);
                              }}
                              className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white rounded-lg border border-purple-500/30 text-[11px] font-bold transition-all"
                              title="이 학생의 저장된 프로필 정보로 앱 검사 파이프라인 진입"
                            >
                              ⚡ 테스트 실행
                            </button>

                            {/* 2-Week Follow-Up Assessment */}
                            {student.latestRecord && onFollowUpTest && (
                              <button
                                onClick={() => onFollowUpTest(student.latestRecord!)}
                                className="px-2.5 py-1 bg-teal-600/20 hover:bg-teal-600 text-teal-300 hover:text-white rounded-lg border border-teal-500/30 text-[11px] font-bold transition-all"
                                title="직전 검사의 비정상 항목만 추출하여 3분 내 재진단"
                              >
                                ⚡ 2주 추적
                              </button>
                            )}

                            {/* Delete Student & Records */}
                            <button
                              onClick={async () => {
                                if (confirm(`[${student.name}] 학생의 전체 진단 기록 및 데이터를 DB에서 영구 삭제하시겠습니까?`)) {
                                  try {
                                    const delRes: any = await DatabaseService.deleteStudentRecords(student.id || student.name);
                                    hideSampleId(student.id, student.name);
                                    try {
                                      window.dispatchEvent(new CustomEvent('nbass_student_deleted', {
                                        detail: { id: student.id, name: student.name, email: (student as any).email }
                                      }));
                                    } catch { /* ignore */ }
                                    const localN = delRes?.deleted ?? 0;
                                    const remoteN = delRes?.supabaseDeleted ?? 0;
                                    if (delRes?.supabaseError) {
                                      showToast(`⚠️ [${student.name}] PC ${localN}건 삭제, Supabase 실패: ${delRes.supabaseError}`);
                                    } else {
                                      showToast(`🗑️ [${student.name}] 삭제됨 (PC ${localN}건 · Supabase ${remoteN}건)`);
                                    }
                                    loadData();
                                  } catch (err) {
                                    console.error('Delete failed:', err);
                                    showToast(`❌ [${student.name}] 삭제 실패: ${err instanceof Error ? err.message : String(err)}`);
                                  }
                                }
                              }}
                              className="px-2 py-1 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg border border-rose-500/30 text-[11px] font-bold transition-all"
                              title="학생 및 전체 검사 데이터 삭제"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal 1: Student History Detail Modal */}
      {selectedHistoryStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xl">
                  📊
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {selectedHistoryStudent.name} 수험생 진단 히스토리
                  </h3>
                  <p className="text-xs text-slate-400">
                    ID: {selectedHistoryStudent.id} • 총 {selectedHistoryStudent.records.length}회 검사 내역
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedHistoryStudent(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3">
              {selectedHistoryStudent.records.length === 0 ? (
                <div className="py-10 text-center text-slate-500">
                  저장된 검사 기록이 없습니다. (신규 등록 계정)
                </div>
              ) : (
                selectedHistoryStudent.records.map((rec, i) => (
                  <div 
                    key={rec.id || i}
                    className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {i + 1}회차 진단 리포트
                        </span>
                        <span className="text-xs text-blue-400 font-medium">
                          {rec.date}
                        </span>
                        {rec.dominantCareType && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {rec.dominantCareType}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        스트레스: {rec.hrv?.stressIndex || '미측정'} • 집중도: {rec.hrv?.concentrationLevel || '미측정'}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedHistoryStudent(null);
                        onViewReport(rec);
                      }}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow"
                    >
                      📄 리포트 열기
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
              <button
                onClick={() => setSelectedHistoryStudent(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Add New Test Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>🛠️</span>
                <span>신규 테스트 수험생 생성 &amp; 등급 부여</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">수험생 이름 *</label>
                <input
                  type="text"
                  placeholder="예: 김테스터, 오류검증02"
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">학년</label>
                  <select
                    value={newStudentGrade}
                    onChange={e => setNewStudentGrade(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="고3">고3 (수험생)</option>
                    <option value="N수생">N수생 (재수/삼수)</option>
                    <option value="고2">고2</option>
                    <option value="고1">고1</option>
                    <option value="중등">중등</option>
                    <option value="성인">성인/고시생</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">성별</label>
                  <select
                    value={newStudentGender}
                    onChange={e => setNewStudentGender(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">소속 학교 / 제휴 학원</label>
                <input
                  type="text"
                  placeholder="예: 대치 미래탐구, 오류검증 LAB"
                  value={newStudentSchool}
                  onChange={e => setNewStudentSchool(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">초기 회원 등급 선택 *</label>
                <select
                  value={newStudentTier}
                  onChange={e => setNewStudentTier(e.target.value as MembershipTier)}
                  className="w-full bg-slate-950 border border-purple-500/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-bold"
                >
                  <option value="expert">🛠️ EXPERT (전문가 전권 / 오류 검증용 - 권장)</option>
                  <option value="premium">💎 PREMIUM (정기구독)</option>
                  <option value="pro">⚡ PRO (1회권)</option>
                  <option value="free">🌱 FREE (무료체험)</option>
                </select>
                <p className="text-[11px] text-purple-300/80 mt-1">
                  * EXPERT 등급으로 설정 시 모든 페이월이 해제되며 시스템 검증 모드가 활성화됩니다.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
              >
                취소
              </button>
              <button
                onClick={handleCreateTestStudent}
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-600/20"
              >
                생성 및 등급 부여
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
