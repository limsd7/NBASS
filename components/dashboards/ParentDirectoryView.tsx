import React, { useState, useEffect, useMemo } from 'react';
import { unifiedSyncService as DatabaseService } from '../../services/unifiedSyncService';
import type { HistoryRecord } from '../../services/database';
import { UserTierService } from '../../services/userTierService';
import { MembershipTier, TIER_INFO } from '../../utils/featureGate';
import { AssessmentResult } from '../../types';

export interface ParentDirectoryItem {
  id: string;
  parentName: string;
  phone: string;
  email?: string;
  registeredDate: string;
  kakaotalkAlertEnabled: boolean;
  studentId: string;
  studentName: string;
  studentGrade?: string;
  studentSchool?: string;
  careType: string;
  tier: MembershipTier;
  latestRecord?: HistoryRecord;
}

interface ParentDirectoryViewProps {
  onBack: () => void;
  onOpenParentMonitor: (record: HistoryRecord) => void;
  onViewReport: (record: HistoryRecord) => void;
}

export const ParentDirectoryView: React.FC<ParentDirectoryViewProps> = ({
  onBack,
  onOpenParentMonitor,
  onViewReport
}) => {
  const [parents, setParents] = useState<ParentDirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlertFilter, setSelectedAlertFilter] = useState<'all' | 'alert_on' | 'alert_off'>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'parent_asc' | 'student_asc'>('date_desc');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State for Adding Parent
  const [showAddModal, setShowAddModal] = useState(false);
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState('고3');
  const [newStudentSchool, setNewStudentSchool] = useState('대치 미래탐구');
  const [newAlertEnabled, setNewAlertEnabled] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const allHistory = await DatabaseService.getAllHistory();
      const parentMap = new Map<string, ParentDirectoryItem>();

      // 1. Default initial samples
      const initialSamples: ParentDirectoryItem[] = [
        {
          id: 'PAR-2026-001',
          parentName: '이선경 학부모님',
          phone: '010-3829-4821',
          email: 'sk.lee@parent.com',
          registeredDate: '2026-08-15',
          kakaotalkAlertEnabled: true,
          studentId: 'TEST_EXPERT_01',
          studentName: '오류검증_전문가01',
          studentGrade: '고3 (N수)',
          studentSchool: 'NBASS 시스템 검증 LAB',
          careType: '전 기능 무제한 검증 모드',
          tier: 'expert'
        },
        {
          id: 'PAR-2026-002',
          parentName: '김민선 학부모님',
          phone: '010-9921-1204',
          email: 'ms.kim@gmail.com',
          registeredDate: '2026-08-18',
          kakaotalkAlertEnabled: true,
          studentId: 'ID-20260820-6RKR',
          studentName: '연습001',
          studentGrade: '고3',
          studentSchool: '대치 미래탐구',
          careType: '몰입저하형',
          tier: 'vip'
        }
      ];

      initialSamples.forEach(p => parentMap.set(p.id, p));

      // 2. Build parents from student assessment histories
      allHistory.forEach(record => {
        if (!record.student) return;
        const student = record.student;
        const studentKey = student.id || `${student.name}_${student.birthDate || ''}`;
        const parentId = `PAR_${studentKey}`;

        const effTier = UserTierService.getEffectiveTier(
          student.id || student.name,
          (student.membershipTier as MembershipTier) || 'free'
        );

        if (!parentMap.has(parentId)) {
          // Generate a representative parent name based on student
          const pName = student.name ? `${student.name} 보호자님` : '학부모님';
          parentMap.set(parentId, {
            id: parentId,
            parentName: pName,
            phone: '010-****-****',
            email: undefined,
            registeredDate: record.date || student.testDate || new Date().toISOString().split('T')[0],
            kakaotalkAlertEnabled: effTier === 'premium' || effTier === 'vip' || effTier === 'expert',
            studentId: student.id || studentKey,
            studentName: student.name || '무명 학생',
            studentGrade: student.grade || '고3',
            studentSchool: student.school || student.affiliatedAcademyId || '일반 수험생',
            careType: (record.careType as any)?.label || record.careType || (record as any).dominantCareType || '정상',
            tier: effTier,
            latestRecord: record
          });
        }
      });

      setParents(Array.from(parentMap.values()));
    } catch (err) {
      console.error('Failed to load parent directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Add new parent & map child
  const handleAddParent = () => {
    if (!newParentName.trim() || !newStudentName.trim()) {
      alert('학부모 이름과 자녀 이름을 입력해주세요.');
      return;
    }

    const newId = `PAR_${Date.now().toString(36).toUpperCase()}`;
    const newStudentId = `STU_${Date.now().toString(36).toUpperCase()}`;

    const newParentItem: ParentDirectoryItem = {
      id: newId,
      parentName: newParentName.trim(),
      phone: newParentPhone.trim() || '010-0000-0000',
      registeredDate: new Date().toISOString().split('T')[0],
      kakaotalkAlertEnabled: newAlertEnabled,
      studentId: newStudentId,
      studentName: newStudentName.trim(),
      studentGrade: newStudentGrade,
      studentSchool: newStudentSchool.trim(),
      careType: '신규 자녀 매핑',
      tier: 'vip'
    };

    setParents(prev => [newParentItem, ...prev]);
    setShowAddModal(false);
    setNewParentName('');
    setNewParentPhone('');
    setNewStudentName('');
    showToast(`🎉 [${newParentItem.parentName} - 자녀: ${newParentItem.studentName}] 연계 등록 완료!`);
  };

  // Filter and Sort
  const filteredParents = useMemo(() => {
    return parents.filter(p => {
      if (selectedAlertFilter === 'alert_on' && !p.kakaotalkAlertEnabled) return false;
      if (selectedAlertFilter === 'alert_off' && p.kakaotalkAlertEnabled) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matchPName = p.parentName.toLowerCase().includes(term);
        const matchPhone = p.phone.includes(term);
        const matchSName = p.studentName.toLowerCase().includes(term);
        const matchSchool = (p.studentSchool || '').toLowerCase().includes(term);
        return matchPName || matchPhone || matchSName || matchSchool;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.registeredDate).getTime() - new Date(a.registeredDate).getTime();
      if (sortBy === 'parent_asc') return a.parentName.localeCompare(b.parentName, 'ko');
      if (sortBy === 'student_asc') return a.studentName.localeCompare(b.studentName, 'ko');
      return 0;
    });
  }, [parents, selectedAlertFilter, searchTerm, sortBy]);

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
                <span className="text-xl md:text-2xl font-black text-white tracking-tight">👨‍👩‍👧‍👦 학부모 회원 통합 DB &amp; 자녀 연계 관제</span>
                <span className="bg-emerald-900/60 text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                  PARENT MONITORING
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                가입된 모든 학부모 회원 목록, 연계 자녀 정보 조회 및 자녀별 안심 모니터링 즉시 열람
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
            >
              <span>+ 신규 학부모 등록 &amp; 자녀 매핑</span>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400">총 등록 학부모</div>
            <div className="text-xl font-black text-white mt-1">{parents.length}명</div>
          </div>
          <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800">
            <div className="text-[11px] font-bold text-emerald-400">연계된 수험생 자녀</div>
            <div className="text-xl font-black text-emerald-300 mt-1">{parents.length}명</div>
          </div>
          <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800">
            <div className="text-[11px] font-bold text-amber-400">🔔 알림톡 수신 학부모</div>
            <div className="text-xl font-black text-amber-300 mt-1">
              {parents.filter(p => p.kakaotalkAlertEnabled).length}명
            </div>
          </div>
          <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800">
            <div className="text-[11px] font-bold text-indigo-400">💎 유료 구독 케어 자녀</div>
            <div className="text-xl font-black text-indigo-300 mt-1">
              {parents.filter(p => p.tier !== 'free').length}명
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: '전체 학부모' },
              { id: 'alert_on', label: '🔔 카톡 알림 수신중' },
              { id: 'alert_off', label: '🔕 미신청' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedAlertFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedAlertFilter === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <input
              type="text"
              placeholder="학부모명, 연락처, 자녀명 검색..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="date_desc">최신 등록순</option>
              <option value="parent_asc">학부모 성함순</option>
              <option value="student_asc">자녀 이름순</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Parent Table (일렬 정렬) */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">학부모 성함 / 연락처</th>
                  <th className="py-3.5 px-4">연계된 수험생 자녀</th>
                  <th className="py-3.5 px-4">자녀 진단 케어타입</th>
                  <th className="py-3.5 px-4 text-center">자녀 회원 등급</th>
                  <th className="py-3.5 px-4 text-center">카카오톡 주간 알림톡</th>
                  <th className="py-3.5 px-4 text-right">자녀 안심 모니터링</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredParents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      검색 조건에 해당하는 학부모 데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredParents.map((item, idx) => {
                    const tierInfo = TIER_INFO[item.tier] || TIER_INFO.free;
                    return (
                      <tr 
                        key={item.id + idx}
                        className="hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* No */}
                        <td className="py-3.5 px-4 text-center text-slate-500 font-mono">
                          {idx + 1}
                        </td>

                        {/* Parent Info */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-sm flex items-center gap-1.5">
                            <span>{item.parentName}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            📞 {item.phone} • 가입: {item.registeredDate}
                          </div>
                        </td>

                        {/* Child Info */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-emerald-400 text-sm">
                            {item.studentName} ({item.studentGrade || '고3'})
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {item.studentSchool || '대치동 제휴학원'} • ID: <span className="font-mono text-slate-300">{item.studentId}</span>
                          </div>
                        </td>

                        {/* Care Type */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                            item.careType?.includes('정서') ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' :
                            item.careType?.includes('몰입') ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                            'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                          }`}>
                            {item.careType || '정상'}
                          </span>
                        </td>

                        {/* Tier Badge */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            item.tier === 'expert' ? 'bg-purple-600/30 text-purple-200 border border-purple-400' :
                            item.tier === 'vip' ? 'bg-amber-500/20 text-amber-300 border border-amber-400' :
                            item.tier === 'premium' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-400' :
                            item.tier === 'pro' ? 'bg-blue-600/20 text-blue-300 border border-blue-400' :
                            'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            <span>{tierInfo.icon}</span>
                            <span>{tierInfo.name.split(' ')[0]}</span>
                          </span>
                        </td>

                        {/* KakaoTalk Alert Status */}
                        <td className="py-3.5 px-4 text-center">
                          {item.kakaotalkAlertEnabled ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                              <span>🔔 매주 일요일 발송중</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-500 text-[11px]">
                              <span>🔕 미신청</span>
                            </span>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Open Parent Monitor View */}
                            <button
                              onClick={() => {
                                const recordToOpen: any = item.latestRecord || {
                                  student: {
                                    id: item.studentId,
                                    name: item.studentName,
                                    grade: item.studentGrade,
                                    school: item.studentSchool,
                                    testDate: item.registeredDate,
                                    membershipTier: item.tier
                                  },
                                  date: item.registeredDate,
                                  careType: { label: item.careType, description: '' },
                                  dominantCareType: item.careType,
                                  hrv: { pns: 50, sns: 50, stressIndex: 35, concentrationLevel: 80 },
                                  analysisText: `${item.studentName} 학생은 ${item.careType} 상태에 맞춘 부모 대화법과 수면 관리가 권장됩니다.`
                                };
                                onOpenParentMonitor(recordToOpen);
                              }}
                              className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-xl border border-emerald-500/30 text-xs font-bold transition-all shadow"
                              title="이 학부모의 자녀 안심 모니터링 화면으로 바로 진입"
                            >
                              👀 자녀 안심 모니터링 열람 →
                            </button>

                            {/* View 24P Report */}
                            {item.latestRecord && (
                              <button
                                onClick={() => onViewReport(item.latestRecord!)}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 text-xs font-bold transition-all"
                                title="24P 리포트 열람"
                              >
                                📄 리포트
                              </button>
                            )}
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

      {/* Modal: Add Parent & Child Mapping */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>👨‍👩‍👧‍👦</span>
                <span>신규 학부모 등록 &amp; 자녀 매핑</span>
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
                <label className="block text-slate-400 font-bold mb-1">학부모 성함 *</label>
                <input
                  type="text"
                  placeholder="예: 이선경 학부모님"
                  value={newParentName}
                  onChange={e => setNewParentName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">학부모 연락처 (알림톡 수신 번호) *</label>
                <input
                  type="text"
                  placeholder="예: 010-1234-5678"
                  value={newParentPhone}
                  onChange={e => setNewParentPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="font-bold text-emerald-400 flex items-center gap-1">
                  <span>🎓 연계할 수험생 자녀 정보</span>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">자녀 이름 *</label>
                  <input
                    type="text"
                    placeholder="예: 김민우, 박서진"
                    value={newStudentName}
                    onChange={e => setNewStudentName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">학년</label>
                    <select
                      value={newStudentGrade}
                      onChange={e => setNewStudentGrade(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="고3">고3</option>
                      <option value="N수생">N수생</option>
                      <option value="고2">고2</option>
                      <option value="고1">고1</option>
                      <option value="중등">중등</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">소속 학원</label>
                    <input
                      type="text"
                      value={newStudentSchool}
                      onChange={e => setNewStudentSchool(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="kakaotalkAlert"
                  checked={newAlertEnabled}
                  onChange={e => setNewAlertEnabled(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="kakaotalkAlert" className="text-slate-300 font-bold cursor-pointer">
                  매주 일요일 카카오톡 주간 안심 리포트 알림톡 발송
                </label>
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
                onClick={handleAddParent}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20"
              >
                등록 및 자녀 매핑
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
