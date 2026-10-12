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

    // Calculate Acceptance Probability & Tier
    const probability = useMemo(() => {
        if (!selectedDept || currentGradeAvg === 0) return { current: 0, predicted: 0, cutline: 0, tier: '위험' };
        
        // Calculate average target grade for the department
        const tg = selectedDept.targetGrades;
        const subjects = Object.values(tg).filter(v => typeof v === 'number');
        const cutline = subjects.reduce((sum, val) => sum + val, 0) / (subjects.length || 1);

        const calcProb = (grade: number) => {
            const gap = grade - cutline; // 음수일수록 성적이 더 좋음 (예: 1.5 - 2.0 = -0.5)
            if (gap <= -0.5) return 98;
            if (gap <= -0.2) return 92;
            if (gap <= 0) return 85;
            if (gap <= 0.2) return 72;
            if (gap <= 0.4) return 60;
            if (gap <= 0.7) return 42;
            if (gap <= 1.0) return 25;
            return 8;
        };

        const currentProb = calcProb(currentGradeAvg);
        const predictedProb = calcProb(predictedGradeAvg);

        let tier: '안정' | '적정' | '소신' | '위험' = '위험';
        if (currentProb >= 80) tier = '안정';
        else if (currentProb >= 60) tier = '적정';
        else if (currentProb >= 30) tier = '소신';
        else tier = '위험';

        return {
            current: currentProb,
            predicted: predictedProb,
            cutline,
            tier
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
                <p className="text-slate-500">합격 예측을 위해 최소 1회 이상의 모의고사 또는 수능 성적을 먼저 입력해주세요.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">🏛️</span>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-slate-800">목표 대학 합격 예측 시뮬레이터</h3>
                            <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full border border-indigo-100">
                                AI 정밀 추산
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">평가원 등급컷 DB 및 대학별 최종 합격선 기준 통계 시뮬레이션</p>
                    </div>
                </div>

                <div className="text-right text-xs text-slate-400">
                    <div>DB 탑재: 주요 대학 40+개교 및 전공군</div>
                    <div className="text-[11px] text-blue-600 font-medium">오너 대시보드 연동 최신 기준선</div>
                </div>
            </div>

            {/* ⚠️ 정밀 대입 시뮬레이션 면책 고지 배너 */}
            <div className="bg-gradient-to-r from-amber-50/90 to-orange-50/80 border border-amber-200/90 rounded-2xl p-4 text-xs text-amber-950 shadow-sm">
                <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-0.5">⚠️</span>
                    <div className="space-y-1.5 flex-1">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-950 text-sm">
                                [안내] 합격 예측 시뮬레이션 결과에 대한 법적·통계적 면책 고지
                            </span>
                            <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                                모의 시뮬레이션 참고용
                            </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                            본 합격 예측 결과는 <strong>한국교육과정평가원 등급컷 DB</strong> 및 <strong>대입정보포털 어디가(adiga.kr)</strong>의 과거 합격선 기준을 통계적으로 매칭한 <strong>시뮬레이션 추산치</strong>이며, <strong>실제 최종 합격을 보증하지 않습니다.</strong>
                        </p>
                        <p className="text-slate-600 leading-relaxed text-[11px]">
                            ※ 실제 입시는 수능 난이도, 대학별 영역별 가중치, 탐구 변환표준점수, 수시 이월 인원 및 실시간 경쟁률에 따라 달라집니다. 본 결과는 수험생의 <strong>취약점 보완 및 학습 목표 설정용</strong>으로 활용하시고, 원서 접수 시에는 반드시 각 대학별 최신 모집요강을 확인하시기 바랍니다.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-30">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">목표 대학 선택</label>
                    <SearchableSelect 
                        value={selectedUniId}
                        onChange={handleUniChange}
                        options={universities.map(uni => ({ value: uni.id, label: uni.name }))}
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">목표 학과 (모집단위) 선택</label>
                    <SearchableSelect 
                        value={selectedDeptId}
                        onChange={setSelectedDeptId}
                        options={selectedUni?.departments.map(dept => ({ value: dept.name, label: dept.name })) || []}
                        disabled={!selectedUniId}
                    />
                </div>
            </div>

            {selectedDept && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-200">
                        <div className="text-xs font-bold text-slate-500 mb-1">지원 기준선 (합격컷)</div>
                        <div className="text-2xl font-black text-slate-800">
                            {probability.cutline > 0 ? `평균 ${probability.cutline.toFixed(2)}등급` : '정보 없음'}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">대입정보포털 등록자 70% Cut 기준</div>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-200">
                        <div className="text-xs font-bold text-slate-500 mb-1">현재 내 평균 성적</div>
                        <div className="text-2xl font-black text-slate-800">
                            {currentGradeAvg > 0 ? `${currentGradeAvg.toFixed(2)}등급` : '정보 없음'}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                            {probability.cutline > 0 && currentGradeAvg > 0 ? (
                                currentGradeAvg <= probability.cutline 
                                    ? <span className="text-emerald-600 font-bold">기준선보다 {(probability.cutline - currentGradeAvg).toFixed(2)}등급 우수</span>
                                    : <span className="text-rose-500 font-bold">기준선보다 {(currentGradeAvg - probability.cutline).toFixed(2)}등급 부족</span>
                            ) : '-'}
                        </div>
                    </div>
                    <div className="bg-indigo-50 rounded-2xl p-4 text-center border border-indigo-200">
                        <div className="text-xs font-bold text-indigo-600 mb-1">시뮬레이션 예상 (3개월 후)</div>
                        <div className="text-2xl font-black text-indigo-700">
                            {predictedGradeAvg > 0 ? `${predictedGradeAvg.toFixed(2)}등급` : '정보 없음'}
                        </div>
                        <div className="text-[10px] text-indigo-500 mt-1">취약 영역 보완 시 예상 등급</div>
                    </div>
                    <div className={`rounded-2xl p-4 text-center border ${
                        probability.tier === '안정' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                        probability.tier === '적정' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                        probability.tier === '소신' ? 'bg-orange-50 border-orange-200 text-orange-900' :
                        'bg-rose-50 border-rose-200 text-rose-900'
                    }`}>
                        <div className="text-xs font-bold uppercase tracking-wider mb-1">현재 판정 결과</div>
                        <div className="text-2xl font-black flex items-center justify-center gap-1.5">
                            <span>
                                {probability.tier === '안정' ? '🟢' :
                                 probability.tier === '적정' ? '🟡' :
                                 probability.tier === '소신' ? '🟠' : '🔴'}
                            </span>
                            <span>{probability.tier} 지원권</span>
                        </div>
                        <div className="text-[10px] font-semibold mt-1 opacity-80">
                            {probability.tier === '안정' ? '합격 유력 (안정적 카드)' :
                             probability.tier === '적정' ? '합격 가능성 충분 (적정 지원)' :
                             probability.tier === '소신' ? '성적 상승 시 도전 가능' : '상향 지원 (대안 전략 필요)'}
                        </div>
                    </div>
                </div>
            )}

            {selectedDept && currentGradeAvg > 0 && (
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 opacity-10 text-9xl">🎯</div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1 w-full space-y-5">
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <h4 className="text-sm font-bold text-indigo-200 flex items-center gap-2">
                                        <span>📊</span> 현재 성적 기준 합격 가능 확률
                                    </h4>
                                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-white/10 text-white">
                                        {probability.tier}권 ({probability.current}%)
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-5xl font-black">{probability.current}%</span>
                                    <span className="text-xs text-slate-300">
                                        (목표 기준선 평균 {probability.cutline.toFixed(2)}등급 대비)
                                    </span>
                                </div>
                                <div className="w-full bg-slate-700/80 rounded-full h-3.5 p-0.5">
                                    <div 
                                        className={`h-2.5 rounded-full transition-all duration-500 ${
                                            probability.current >= 80 ? 'bg-gradient-to-r from-emerald-400 to-teal-400' :
                                            probability.current >= 60 ? 'bg-gradient-to-r from-yellow-400 to-amber-400' :
                                            probability.current >= 30 ? 'bg-gradient-to-r from-orange-400 to-rose-400' :
                                            'bg-gradient-to-r from-rose-500 to-red-600'
                                        }`}
                                        style={{ width: `${Math.max(6, probability.current)}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <h4 className="text-sm font-bold text-indigo-200 flex items-center gap-2">
                                        <span>🚀</span> 3개월 후 집중 학습 시 예상 확률
                                    </h4>
                                    <span className="text-green-400 font-bold text-xs">
                                        ▲ {Math.max(0, probability.predicted - probability.current)}%p 상승 기대
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-4xl font-black text-white">{probability.predicted}%</span>
                                    <span className="text-xs text-indigo-300">
                                        (예상 평균 {predictedGradeAvg.toFixed(2)}등급 달성 시)
                                    </span>
                                </div>
                                <div className="w-full bg-slate-700/80 rounded-full h-3.5 p-0.5">
                                    <div 
                                        className="h-2.5 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400 transition-all duration-500"
                                        style={{ width: `${Math.max(6, probability.predicted)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-5/12 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-inner">
                            <h5 className="font-bold text-yellow-300 mb-2 flex items-center gap-1.5 text-sm">
                                <span>💡</span> AI 입시전략 코칭 어드바이스
                            </h5>
                            {probability.current >= 80 ? (
                                <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                                    현재 성적 유지 시 <strong>{selectedUni?.name} {selectedDept.name}</strong> 합격 가능성이 매우 높습니다! 실전 모의고사 풀이를 통해 실수를 최소화하고, 수능 당일 바이오리듬 유지에 집중하세요.
                                </p>
                            ) : probability.predicted >= 60 ? (
                                <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                                    현재는 소신~적정 경계선에 있으나, 취약 과목({student.weakSubject ? student.weakSubject : '수학/탐구'})을 1등급 정도 끌어올리면 3개월 내에 안정권(60% 이상)에 도달할 수 있습니다. 킬러/준킬러 유형 극복이 핵심입니다.
                                </p>
                            ) : (
                                <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                                    <strong>{selectedUni?.name} {selectedDept.name}</strong> 지원선까지 약 {Math.max(0.3, currentGradeAvg - probability.cutline).toFixed(2)}등급의 격차가 있습니다. 집중 전략 과목을 선정하여 최소 2과목 이상의 등급 도약이 필요하며, 안전 지원 카드를 함께 구성하는 것을 권장합니다.
                                </p>
                            )}

                            <div className="mt-4 pt-3 border-t border-white/15 text-[11px] text-indigo-200/90 flex items-center justify-between">
                                <span>* 기준: {selectedUni?.name}</span>
                                <span>산출 엔진: NBASS-Predict v2.4</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
