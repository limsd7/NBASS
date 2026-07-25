import React, { memo, useCallback } from 'react';
import { StudentInfo } from '../../types';
import { GRADE_OPTIONS, MBTI_OPTIONS, calculateAge } from '../../utils/constants';
import { SUNEUNG_SUBJECTS } from '../../data/suneungSubjects';

interface RegisterStepProps {
    student: StudentInfo;
    onStudentChange: (student: StudentInfo) => void;
    onNext: () => void;
}

export const RegisterStep: React.FC<RegisterStepProps> = memo(({
    student,
    onStudentChange,
    onNext
}) => {
    const handleBirthDateChange = useCallback((date: string) => {
        onStudentChange({
            ...student,
            birthDate: date,
            age: calculateAge(date)
        });
    }, [student, onStudentChange]);

    return (
        <div className="w-full max-w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-blue-600 p-8 text-white">
                <h2 className="text-2xl font-bold">Student Registration</h2>
                <p className="text-blue-100 mt-1">기본 정보를 입력하여 진단을 시작하십시오.</p>
            </div>
            <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Serial ID (자동 생성)</label>
                        <div className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono text-sm">{student.id}</div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">검사일자 (Test Date)</label>
                        <input type="date" value={student.testDate} onChange={e => onStudentChange({ ...student, testDate: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">이름 (Full Name)</label>
                        <input type="text" placeholder="이름을 입력하세요" value={student.name} onChange={e => onStudentChange({ ...student, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">학년 (Grade)</label>
                        <select value={student.grade} onChange={e => onStudentChange({ ...student, grade: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all">
                            {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">생년월일 (Birthdate)</label>
                        <input type="date" value={student.birthDate} onChange={e => handleBirthDateChange(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">나이 (Age)</label>
                        <div className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold">{student.age} 세</div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-slate-700">성별 (Gender)</label>
                        <div className="flex gap-4">
                            {['Male', 'Female'].map((g) => (
                                <button
                                    key={g}
                                    onClick={() => onStudentChange({ ...student, gender: g as 'Male' | 'Female' })}
                                    className={`flex-1 py-3 rounded-xl font-bold transition-all border ${student.gender === g ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-400 border-slate-200'}`}
                                >
                                    {g === 'Male' ? '남성' : '여성'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 md:col-span-2 bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h3 className="text-sm font-black text-indigo-600 uppercase tracking-wider mb-2">수능 과목 선택 (Subject Selection)</h3>
                        
                        <div className="space-y-6">
                            {/* 공통 과목 */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">공통/필수 (국어, 수학, 영어, 한국사)</label>
                                <div className="flex flex-wrap gap-2">
                                    {SUNEUNG_SUBJECTS.filter(s => s.category === 'common' || s.category === 'required').map(subj => {
                                        const isSelected = (student.selectedSubjects || []).includes(subj.id);
                                        const isFocused = (student.focusSubjects || []).includes(subj.id) || student.weakSubject === subj.id;
                                        return (
                                            <div key={subj.id} className="relative group">
                                                <button
                                                    onClick={() => {
                                                        const newSelected = isSelected 
                                                            ? (student.selectedSubjects || []).filter(id => id !== subj.id)
                                                            : [...(student.selectedSubjects || []), subj.id];
                                                        
                                                        // Update weakSubject for backward compatibility if it's one of the main 3
                                                        const isMain3 = ['korean', 'math', 'english'].includes(subj.id);
                                                        
                                                        onStudentChange({ 
                                                            ...student, 
                                                            selectedSubjects: newSelected
                                                        });
                                                    }}
                                                    className={`px-4 py-2 rounded-lg font-bold border transition-all text-sm ${isSelected ? 'bg-white border-blue-400 text-blue-700 shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:border-blue-300'}`}
                                                >
                                                    {subj.name}
                                                </button>
                                                {/* Focus (부담 과목) 뱃지 토글 버튼 */}
                                                {isSelected && (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const newFocus = isFocused
                                                                ? (student.focusSubjects || []).filter(id => id !== subj.id)
                                                                : [...(student.focusSubjects || []), subj.id];
                                                            
                                                            // Backward compatibility
                                                            let newWeakSubject = student.weakSubject;
                                                            if (!isFocused && ['korean', 'math', 'english'].includes(subj.id)) {
                                                                newWeakSubject = subj.id as 'korean' | 'math' | 'english';
                                                            } else if (isFocused && student.weakSubject === subj.id) {
                                                                newWeakSubject = undefined;
                                                            }
                                                                
                                                            onStudentChange({
                                                                ...student,
                                                                focusSubjects: newFocus,
                                                                weakSubject: newWeakSubject
                                                            });
                                                        }}
                                                        className={`absolute -top-2 -right-2 w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black shadow-sm transition-all z-10 ${isFocused ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-400 hover:bg-rose-200'}`}
                                                        title="가장 부담되는 과목(Focus Subject)으로 지정"
                                                    >
                                                        !
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 선택 과목 (탐구/제2외국어) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">사회/과학탐구 (Social/Science)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {SUNEUNG_SUBJECTS.filter(s => s.category === 'social' || s.category === 'science').map(subj => {
                                            const isSelected = (student.selectedSubjects || []).includes(subj.id);
                                            const isFocused = (student.focusSubjects || []).includes(subj.id);
                                            return (
                                                <div key={subj.id} className="relative">
                                                    <button
                                                        onClick={() => {
                                                            const newSelected = isSelected 
                                                                ? (student.selectedSubjects || []).filter(id => id !== subj.id)
                                                                : [...(student.selectedSubjects || []), subj.id];
                                                            onStudentChange({ ...student, selectedSubjects: newSelected });
                                                        }}
                                                        className={`px-3 py-1.5 rounded-lg border transition-all text-[11px] font-bold ${isSelected ? 'bg-white border-blue-400 text-blue-700 shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:border-blue-300'}`}
                                                    >
                                                        {subj.name}
                                                    </button>
                                                    {isSelected && (
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const newFocus = isFocused
                                                                    ? (student.focusSubjects || []).filter(id => id !== subj.id)
                                                                    : [...(student.focusSubjects || []), subj.id];
                                                                onStudentChange({ ...student, focusSubjects: newFocus });
                                                            }}
                                                            className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] flex items-center justify-center font-black shadow-sm transition-all z-10 ${isFocused ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-400 hover:bg-rose-200'}`}
                                                        >
                                                            !
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">제2외국어/한문 (Foreign)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {SUNEUNG_SUBJECTS.filter(s => s.category === 'foreign').map(subj => {
                                            const isSelected = (student.selectedSubjects || []).includes(subj.id);
                                            const isFocused = (student.focusSubjects || []).includes(subj.id);
                                            return (
                                                <div key={subj.id} className="relative">
                                                    <button
                                                        onClick={() => {
                                                            const newSelected = isSelected 
                                                                ? (student.selectedSubjects || []).filter(id => id !== subj.id)
                                                                : [...(student.selectedSubjects || []), subj.id];
                                                            onStudentChange({ ...student, selectedSubjects: newSelected });
                                                        }}
                                                        className={`px-3 py-1.5 rounded-lg border transition-all text-[11px] font-bold ${isSelected ? 'bg-white border-blue-400 text-blue-700 shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:border-blue-300'}`}
                                                    >
                                                        {subj.name}
                                                    </button>
                                                    {isSelected && (
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const newFocus = isFocused
                                                                    ? (student.focusSubjects || []).filter(id => id !== subj.id)
                                                                    : [...(student.focusSubjects || []), subj.id];
                                                                onStudentChange({ ...student, focusSubjects: newFocus });
                                                            }}
                                                            className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] flex items-center justify-center font-black shadow-sm transition-all z-10 ${isFocused ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-400 hover:bg-rose-200'}`}
                                                        >
                                                            !
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-100/50 rounded-lg text-xs text-blue-800 flex items-start gap-2">
                            <span>💡</span>
                            <p>과목을 클릭하여 응시 과목으로 선택하고, 선택된 과목 우측 상단의 <span className="inline-block w-4 h-4 rounded-full bg-slate-200 text-slate-400 text-center font-bold text-[8px] leading-4">!</span> 버튼을 눌러 <strong>가장 부담되는 과목 (Focus Subject)</strong>으로 지정하세요. (다중 지정 가능)</p>
                        </div>
                    </div>

                    {/* Physical & Personality Section */}
                    <div className="md:col-span-2 pt-4 border-t border-slate-100 mt-2">
                        <h3 className="text-sm font-black text-blue-600 uppercase tracking-wider mb-4">신체 및 성향 정보 (Physical & Personality)</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">키 (Height cm)</label>
                                <input type="number" value={student.height} onChange={e => onStudentChange({ ...student, height: Number(e.target.value) })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">몸무게 (Weight kg)</label>
                                <input type="number" value={student.weight} onChange={e => onStudentChange({ ...student, weight: Number(e.target.value) })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">BMI (자동계산)</label>
                                <div className="w-full px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-sm font-bold text-blue-700">{student.bmi}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">MBTI</label>
                                    <a href="https://www.16personalities.com/ko/%EB%AC%B4%EB%A3%8C-%EC%84%B1%EA%B2%A9-%EC%9C%A0%ED%98%95-%EA%B2%80%EC%82%AC" target="_blank" rel="noreferrer" className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 hover:underline">
                                        모르시나요? 검사하기 ↗
                                    </a>
                                </div>
                                <select value={student.mbti} onChange={e => onStudentChange({ ...student, mbti: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                                    {MBTI_OPTIONS.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">평소 활동량 (Activity Level)</label>
                            <div className="flex gap-4">
                                {/* Activity Level Buttons */}
                                <div className="flex gap-2 flex-1">
                                    {[1, 2, 3, 4].map(level => (
                                        <button
                                            key={level}
                                            onClick={() => onStudentChange({ ...student, activityLevel: level })}
                                            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${student.activityLevel === level ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                                        >
                                            <span className="text-base">
                                                {level === 1 ? '🪑' : level === 2 ? '🚶' : level === 3 ? '🏃' : '🏋️'}
                                            </span>
                                            <span className="block">Level {level}</span>
                                            <span className="block text-[8px] font-normal opacity-70">
                                                {level === 1 ? '최소' : level === 2 ? '보통' : level === 3 ? '활발' : '매우 활발'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                {/* Activity Level Description Card */}
                                <div className="w-48 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl text-xs transition-all">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xl">
                                            {student.activityLevel === 1 ? '🪑' : student.activityLevel === 2 ? '🚶' : student.activityLevel === 3 ? '🏃' : '🏋️'}
                                        </span>
                                        <span className="font-bold text-blue-700">
                                            Level {student.activityLevel || 1}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed">
                                        {student.activityLevel === 1 && (
                                            <>
                                                <span className="font-semibold text-slate-700">하루 대부분 앉아서 생활</span>
                                                <br />
                                                학생, 사무직 등. 주당 운동 거의 없음. 이동 외 신체 활동 최소.
                                            </>
                                        )}
                                        {student.activityLevel === 2 && (
                                            <>
                                                <span className="font-semibold text-slate-700">가벼운 일상 활동</span>
                                                <br />
                                                가벼운 산책, 스트레칭 수준. 주 1-2회 30분 이하 가벼운 운동.
                                            </>
                                        )}
                                        {student.activityLevel === 3 && (
                                            <>
                                                <span className="font-semibold text-slate-700">정기적인 운동</span>
                                                <br />
                                                주 3-5회 중강도 운동. 조깅, 수영, 자전거 등 30분-1시간.
                                            </>
                                        )}
                                        {student.activityLevel === 4 && (
                                            <>
                                                <span className="font-semibold text-slate-700">고강도 활동</span>
                                                <br />
                                                주 6회 이상 운동 또는 육체노동. 운동선수, 체력 훈련 수준.
                                            </>
                                        )}
                                        {!student.activityLevel && (
                                            <>
                                                <span className="font-semibold text-slate-700">하루 대부분 앉아서 생활</span>
                                                <br />
                                                학생, 사무직 등. 주당 운동 거의 없음. 이동 외 신체 활동 최소.
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-2 pt-4 border-t border-slate-100 mt-2">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl">
                            <div>
                                <h3 className="text-sm font-black text-amber-700">멤버십 등급 (Membership Tier)</h3>
                                <p className="text-xs text-amber-600/80 mt-0.5">프리미엄 이상 등급은 클라우드 LLM 기반의 최고급 분석 엔진을 사용합니다.</p>
                            </div>
                            <select 
                                value={student.membershipTier || 'free'} 
                                onChange={(e) => onStudentChange({ ...student, membershipTier: e.target.value as any })}
                                className="bg-white border border-amber-200 text-amber-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2 outline-none font-medium"
                            >
                                <option value="free">Free</option>
                                <option value="basic">Basic</option>
                                <option value="premium">Premium</option>
                                <option value="vip">VIP</option>
                            </select>
                        </div>
                    </div>
                </div>
                <button onClick={onNext} disabled={!student.name} className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all mt-4">검사 시작 (Start Assessment)</button>
            </div>
        </div>
    );
});

RegisterStep.displayName = 'RegisterStep';
