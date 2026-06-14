import React from 'react';
import { AssessmentResult } from '../types';
import { DropdownSearch } from './DropdownSearch';

interface ProgressViewProps {
    history: (AssessmentResult & { date: string })[];
    selectedStudentId?: string | null;
    onSelectStudent?: (id: string | null) => void;
    onStartClick: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ history, selectedStudentId, onSelectStudent, onStartClick }) => {
    // Extract unique students
    const uniqueStudents = Array.from(new Map(history.map(h => [h.student.id, h.student])).values()) as any[];

    // Filtered history
    const filteredHistory = selectedStudentId
        ? history.filter(h => h.student.id === selectedStudentId)
        : history;

    if (filteredHistory.length === 0) {
        return (
            <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <span className="text-3xl">📈</span> 나의 성장
                    </h2>

                    {/* Patient Selector (Search & Dropdown) */}
                    <DropdownSearch
                        uniqueStudents={uniqueStudents}
                        selectedStudentId={selectedStudentId}
                        onSelectStudent={onSelectStudent}
                        historyData={history}
                    />
                </div>

                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                    <p className="text-slate-400 mb-4">아직 데이터가 충분하지 않습니다.</p>
                    <p className="text-sm text-slate-500 mb-6">최소 2회 이상의 검사가 필요합니다.</p>
                    <button onClick={onStartClick} className="text-blue-600 font-bold hover:underline">
                        지금 검사 시작하기
                    </button>
                </div>
            </div >
        );
    }

    // 데이터 분석
    const sortedHistory = [...filteredHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstRecord = sortedHistory[0];
    const latestRecord = sortedHistory[sortedHistory.length - 1];

    // 개선율 계산
    const calculateImprovement = (first: number, latest: number) => {
        const change = first - latest; // 점수가 낮을수록 좋음
        const percentage = first > 0 ? ((change / first) * 100).toFixed(1) : '0';
        return { change, percentage: parseFloat(percentage) };
    };

    const baiImprovement = calculateImprovement(firstRecord.survey.bai, latestRecord.survey.bai);
    const isiImprovement = calculateImprovement(firstRecord.survey.isi, latestRecord.survey.isi);
    const brainScoreChange = latestRecord.hrv.brainScore - firstRecord.hrv.brainScore;

    // 연속 개선 일수 계산
    const consecutiveImprovements = sortedHistory.reduce((count, record, idx) => {
        if (idx === 0) return 0;
        const prev = sortedHistory[idx - 1];
        return record.survey.bai < prev.survey.bai ? count + 1 : 0;
    }, 0);

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-300 space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-3xl">📈</span> 나의 성장
                </h2>

                {/* Patient Selector */}
                {/* Patient Selector (Search & Dropdown) */}
                <DropdownSearch
                    uniqueStudents={uniqueStudents}
                    selectedStudentId={selectedStudentId}
                    onSelectStudent={onSelectStudent}
                    historyData={history}
                />
            </div>

            {/* 요약 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100 shadow-sm">
                    <p className="text-xs font-bold text-blue-600 uppercase mb-2">BAI 불안도</p>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-3xl font-black text-slate-900">{latestRecord.survey.bai}</span>
                        <span className="text-sm text-slate-400">/ 63</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {baiImprovement.percentage > 0 ? (
                            <>
                                <span className="text-emerald-600 font-bold text-sm">↓ {Math.abs(baiImprovement.percentage)}% 개선</span>
                                <span className="text-xs text-slate-400">({firstRecord.survey.bai} → {latestRecord.survey.bai})</span>
                            </>
                        ) : baiImprovement.percentage < 0 ? (
                            <>
                                <span className="text-red-600 font-bold text-sm">↑ {Math.abs(baiImprovement.percentage)}% 악화</span>
                                <span className="text-xs text-slate-400">({firstRecord.survey.bai} → {latestRecord.survey.bai})</span>
                            </>
                        ) : (
                            <span className="text-slate-500 font-bold text-sm">변화 없음</span>
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border border-purple-100 shadow-sm">
                    <p className="text-xs font-bold text-purple-600 uppercase mb-2">ISI 수면 품질</p>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-3xl font-black text-slate-900">{latestRecord.survey.isi}</span>
                        <span className="text-sm text-slate-400">/ 28</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {isiImprovement.percentage > 0 ? (
                            <>
                                <span className="text-emerald-600 font-bold text-sm">↓ {Math.abs(isiImprovement.percentage)}% 개선</span>
                                <span className="text-xs text-slate-400">({firstRecord.survey.isi} → {latestRecord.survey.isi})</span>
                            </>
                        ) : isiImprovement.percentage < 0 ? (
                            <>
                                <span className="text-red-600 font-bold text-sm">↑ {Math.abs(isiImprovement.percentage)}% 악화</span>
                                <span className="text-xs text-slate-400">({firstRecord.survey.isi} → {latestRecord.survey.isi})</span>
                            </>
                        ) : (
                            <span className="text-slate-500 font-bold text-sm">변화 없음</span>
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 shadow-sm">
                    <p className="text-xs font-bold text-indigo-600 uppercase mb-2">Brain Health Score</p>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-3xl font-black text-slate-900">{latestRecord.hrv.brainScore}</span>
                        <span className="text-sm text-slate-400">pts</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {brainScoreChange > 0 ? (
                            <>
                                <span className="text-emerald-600 font-bold text-sm">↑ +{brainScoreChange} 향상</span>
                                <span className="text-xs text-slate-400">({firstRecord.hrv.brainScore} → {latestRecord.hrv.brainScore})</span>
                            </>
                        ) : brainScoreChange < 0 ? (
                            <>
                                <span className="text-red-600 font-bold text-sm">↓ {brainScoreChange} 하락</span>
                                <span className="text-xs text-slate-400">({firstRecord.hrv.brainScore} → {latestRecord.hrv.brainScore})</span>
                            </>
                        ) : (
                            <span className="text-slate-500 font-bold text-sm">변화 없음</span>
                        )}
                    </div>
                </div>
            </div>

            {/* 인사이트 메시지 */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl text-white shadow-lg">
                <div className="flex items-start gap-4">
                    <span className="text-4xl">🎉</span>
                    <div>
                        <h3 className="font-bold text-lg mb-2">AI 분석 인사이트</h3>
                        {baiImprovement.percentage > 10 ? (
                            <p className="text-blue-100">
                                축하합니다! 불안도(BAI)가 <strong>{Math.abs(baiImprovement.percentage)}%</strong> 개선되었습니다.
                                현재 관리 방법을 계속 유지하세요!
                            </p>
                        ) : baiImprovement.percentage < -10 ? (
                            <p className="text-blue-100">
                                ⚠️ 불안도가 <strong>{Math.abs(baiImprovement.percentage)}%</strong> 악화되었습니다.
                                휴식과 전문가 상담을 고려해보세요.
                            </p>
                        ) : consecutiveImprovements >= 2 ? (
                            <p className="text-blue-100">
                                🔥 {consecutiveImprovements}회 연속 개선 중입니다! 훌륭한 진전입니다.
                            </p>
                        ) : (
                            <p className="text-blue-100">
                                현재 상태를 잘 유지하고 있습니다. 꾸준한 관리가 중요합니다.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* 트렌드 차트 (간단한 라인 차트) */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-lg mb-6 text-slate-900">BAI 불안도 추이</h3>
                <div className="relative h-64">
                    <svg className="w-full h-full" viewBox="0 0 800 250" preserveAspectRatio="none">
                        {/* 그리드 라인 */}
                        {[0, 1, 2, 3, 4].map(i => (
                            <line
                                key={i}
                                x1="0"
                                y1={i * 50}
                                x2="800"
                                y2={i * 50}
                                stroke="#e2e8f0"
                                strokeWidth="1"
                            />
                        ))}

                        {/* 데이터 라인 */}
                        <polyline
                            points={sortedHistory.map((record, idx) => {
                                const x = (idx / (sortedHistory.length - 1)) * 800;
                                const y = 250 - ((record.survey.bai / 63) * 250);
                                return `${x},${y}`;
                            }).join(' ')}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* 데이터 포인트 */}
                        {sortedHistory.map((record, idx) => {
                            const x = (idx / (sortedHistory.length - 1)) * 800;
                            const y = 250 - ((record.survey.bai / 63) * 250);
                            return (
                                <circle
                                    key={idx}
                                    cx={x}
                                    cy={y}
                                    r="5"
                                    fill="#3b82f6"
                                    stroke="white"
                                    strokeWidth="2"
                                />
                            );
                        })}
                    </svg>

                    {/* X축 레이블 */}
                    <div className="flex justify-between mt-4 text-xs text-slate-400">
                        <span>{new Date(sortedHistory[0].date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</span>
                        <span>{new Date(sortedHistory[sortedHistory.length - 1].date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            {/* 최고/최저 기록 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">🏆</span>
                        <h3 className="font-bold text-emerald-900">최고 기록</h3>
                    </div>
                    <p className="text-sm text-emerald-700">
                        BAI: <strong>{Math.min(...sortedHistory.map(h => h.survey.bai))}</strong> 점
                        ({new Date(sortedHistory.find(h => h.survey.bai === Math.min(...sortedHistory.map(r => r.survey.bai)))!.date).toLocaleDateString('ko-KR')})
                    </p>
                </div>

                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">📊</span>
                        <h3 className="font-bold text-amber-900">총 검사 횟수</h3>
                    </div>
                    <p className="text-sm text-amber-700">
                        <strong>{filteredHistory.length}</strong>회 검사 완료
                    </p>
                </div>
            </div>
        </div>
    );
};
