import React, { useState, useMemo } from 'react';
import { StudentInfo, GradeRecord, AssessmentResult } from '../../types';
import { GradeSimulationEngine } from '../../services/gradeSimulationEngine';
import { useUniversities } from '../../hooks/useUniversities';
import { SearchableSelect } from '../ui/SearchableSelect';

interface UniversityPredictionViewProps {
    student: StudentInfo;
    records: GradeRecord[];
    currentAssessment?: AssessmentResult;
}

export const UniversityPredictionView: React.FC<UniversityPredictionViewProps> = ({ 
    student, records, currentAssessment 
}) => {
    const { universities } = useUniversities();
    
    // Ensure we have universities before setting default IDs
    const defaultUniId = universities.length > 0 ? universities[0].id : '';
    const defaultDeptId = universities.length > 0 && universities[0].departments.length > 0 
        ? universities[0].departments[0].name 
        : '';

    const [selectedUniId, setSelectedUniId] = useState<string>(defaultUniId);
    const [selectedDeptId, setSelectedDeptId] = useState<string>(defaultDeptId);

    // Get current average grade across all subjects from the latest record
    const currentGradeAvg = useMemo(() => {
        if (!records || records.length === 0) return 0;
        const latest = [...records].sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime())[0];
        const validGrades = latest.subjects.filter(s => s.grade).map(s => s.grade!);
        if (validGrades.length === 0) return 0;
        return validGrades.reduce((sum, g) => sum + g, 0) / validGrades.length;
    }, [records]);

    // Simulate average grade after 3 months (assuming goals are 1 grade better for focus subjects)
    const predictedGradeAvg = useMemo(() => {
        if (currentGradeAvg === 0) return 0;
        
        // Simple heuristic: simulate 0.3 ~ 0.5 grade improvement based on focus subjects
        const focusSubjects = student.focusSubjects || (student.weakSubject ? [student.weakSubject] : []);
        const improvement = Math.min(1.0, focusSubjects.length * 0.15 + 0.2); // max 1.0 improvement
        return Math.max(1.0, currentGradeAvg - improvement);
    }, [currentGradeAvg, student]);

    const selectedUni = universities.find(u => u.id === selectedUniId);
    const selectedDept = selectedUni?.departments.find(d => d.name === selectedDeptId);

    // Calculate Acceptance Probability
    const probability = useMemo(() => {
        if (!selectedDept || currentGradeAvg === 0) return { current: 0, predicted: 0 };
        
        // Calculate average target grade for the department
        const tg = selectedDept.targetGrades;
        const subjects = Object.values(tg).filter(v => typeof v === 'number');
        const cutline = subjects.reduce((sum, val) => sum + val, 0) / (subjects.length || 1);

        const calcProb = (grade: number) => {
            const gap = grade - cutline;
            // if gap is <= 0 (better than cutline), high probability
            if (gap <= -0.5) return 99;
            if (gap <= 0) return 90;
            if (gap <= 0.3) return 70;
            if (gap <= 0.6) return 40;
            if (gap <= 1.0) return 15;
            return 5;
        };

        return {
            current: calcProb(currentGradeAvg),
            predicted: calcProb(predictedGradeAvg),
            cutline
        };
    }, [currentGradeAvg, predictedGradeAvg, selectedDept]);

    const handleUniChange = (val: string) => {
        const uni = universities.find(u => u.id === val);
        if (uni) {
            setSelectedUniId(uni.id);
            if (uni.departments.length > 0) {
                setSelectedDeptId(uni.departments[0].name);
            } else {
                setSelectedDeptId('');
            }
        }
    };

    if (records.length === 0) {
        return (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
                <span className="text-4xl mb-4 block">🎓</span>
                <h3 className="text-xl font-bold text-slate-800 mb-2">성적 데이터가 필요합니다</h3>
                <p className="text-slate-500">합격 예측을 위해 최소 1회 이상의 모의고사 성적을 입력해주세요.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <span className="text-3xl">🏛️</span>
                <div>
                    <h3 className="text-xl font-bold text-slate-800">목표 대학 합격 예측</h3>
                    <p className="text-sm text-slate-500">현재 성적과 예상 향상도를 바탕으로 합격 가능성을 시뮬레이션합니다.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative z-40">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">목표 대학</label>
                    <SearchableSelect 
                        value={selectedUniId}
                        onChange={handleUniChange}
                        options={universities.map(uni => ({ value: uni.id, label: uni.name }))}
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">목표 학과 (모집단위)</label>
                    <SearchableSelect 
                        value={selectedDeptId}
                        onChange={setSelectedDeptId}
                        options={selectedUni?.departments.map(dept => ({ value: dept.name, label: dept.name })) || []}
                        disabled={!selectedUniId}
                    />
                </div>
            </div>

            {selectedDept && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
                        <div className="text-xs font-bold text-slate-500 mb-1">지원 기준선 (합격컷)</div>
                        <div className="text-2xl font-black text-slate-800">
                            평균 {probability.cutline.toFixed(2)}등급
                        </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
                        <div className="text-xs font-bold text-slate-500 mb-1">현재 내 평균 성적</div>
                        <div className="text-2xl font-black text-slate-800">
                            {currentGradeAvg > 0 ? `${currentGradeAvg.toFixed(2)}등급` : '정보 없음'}
                        </div>
                    </div>
                    <div className="bg-indigo-50 rounded-xl p-4 text-center border border-indigo-200">
                        <div className="text-xs font-bold text-indigo-600 mb-1">시뮬레이션 예상 (3개월 후)</div>
                        <div className="text-2xl font-black text-indigo-700">
                            {predictedGradeAvg > 0 ? `${predictedGradeAvg.toFixed(2)}등급` : '정보 없음'}
                        </div>
                    </div>
                </div>
            )}

            {selectedDept && currentGradeAvg > 0 && (
                <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 opacity-10 text-9xl">🎯</div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1">
                            <h4 className="text-lg font-bold mb-2 text-indigo-200">현재 성적 기준 합격 확률</h4>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-5xl font-black">{probability.current}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-3 mb-6">
                                <div 
                                    className={`h-3 rounded-full ${probability.current > 70 ? 'bg-green-500' : probability.current > 30 ? 'bg-yellow-500' : 'bg-rose-500'}`}
                                    style={{ width: `${Math.max(5, probability.current)}%` }}
                                ></div>
                            </div>

                            <h4 className="text-lg font-bold mb-2 text-indigo-200">3개월 후 집중 학습 시 예상 확률</h4>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-5xl font-black text-white">{probability.predicted}%</span>
                                <span className="text-green-400 font-bold mb-1 ml-2">
                                    (▲ {probability.predicted - probability.current}%p 상승 가능)
                                </span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-3">
                                <div 
                                    className="h-3 rounded-full bg-indigo-500"
                                    style={{ width: `${Math.max(5, probability.predicted)}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="w-full md:w-1/3 bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                            <h5 className="font-bold text-yellow-300 mb-2">💡 AI 전략 어드바이스</h5>
                            {probability.current >= 80 ? (
                                <p className="text-sm text-slate-200 leading-relaxed">
                                    현재 성적을 유지한다면 {selectedUni?.name} {selectedDept.name} 합격이 매우 유력합니다! 수능 전까지 컨디션 관리와 실전 감각 유지에 집중하세요.
                                </p>
                            ) : probability.predicted >= 60 ? (
                                <p className="text-sm text-slate-200 leading-relaxed">
                                    현재로서는 불안정하지만, 취약 과목({student.weakSubject ? student.weakSubject : '수학/과학'})을 1등급 정도 끌어올리면 3개월 내에 합격 안정권에 진입할 수 있습니다. 할 수 있습니다!
                                </p>
                            ) : (
                                <p className="text-sm text-slate-200 leading-relaxed">
                                    {selectedUni?.name} {selectedDept.name} 합격을 위해서는 평균 {Math.max(0.5, currentGradeAvg - selectedDept.targetGradeCutline).toFixed(1)}등급 이상의 큰 폭 향상이 필요합니다. 핵심 과목 위주로 뼈대를 다시 세우는 전략이 필요합니다.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
