import React, { useMemo } from 'react';
import { StudentInfo } from '../../types';

interface DDayRoadmapProps {
    student: StudentInfo;
}

export const DDayRoadmap: React.FC<DDayRoadmapProps> = ({ student }) => {
    // 수능 날짜 계산 (매년 11월 3번째 목요일)
    const suneungDate = useMemo(() => {
        const now = new Date();
        let year = now.getFullYear();
        
        const getSuneungDate = (y: number) => {
            const date = new Date(y, 10, 1); // 11월 1일
            let thursdayCount = 0;
            while (thursdayCount < 3) {
                if (date.getDay() === 4) thursdayCount++;
                if (thursdayCount < 3) date.setDate(date.getDate() + 1);
            }
            return date;
        };

        let targetDate = getSuneungDate(year);
        // 만약 올해 수능이 지났다면 내년 수능
        if (now.getTime() > targetDate.getTime()) {
            targetDate = getSuneungDate(year + 1);
        }
        return targetDate;
    }, []);

    const daysLeft = useMemo(() => {
        const now = new Date();
        const diff = suneungDate.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }, [suneungDate]);

    const weeksLeft = Math.floor(daysLeft / 7);

    const getRoadmapPhase = () => {
        if (daysLeft > 200) return { title: '개념 완성과 기출 분석', desc: '전 과목 핵심 개념을 1회독하고 기출문제를 분석하는 시기입니다.', color: 'emerald' };
        if (daysLeft > 100) return { title: '취약점 보완과 심화 학습', desc: '약점 과목을 집중 공략하고 고난도 문항에 도전하는 시기입니다.', color: 'blue' };
        if (daysLeft > 30) return { title: '실전 모의고사 훈련', desc: '실제 시험 시간표에 맞춰 모의고사를 풀며 실전 감각을 극대화하세요.', color: 'indigo' };
        if (daysLeft > 7) return { title: '파이널 점검', desc: '오답노트를 복습하고 컨디션을 수능 당일에 맞추어 조절하세요.', color: 'rose' };
        return { title: '컨디션 관리 최우선', desc: '새로운 것을 학습하기보다는 지금까지 한 것을 잊지 않도록 가볍게 복습하세요.', color: 'red' };
    };

    const phase = getRoadmapPhase();

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-100 to-transparent rounded-bl-full -z-0 opacity-50"></div>
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">D-Day 로드맵</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            목표 수능일: {suneungDate.getFullYear()}년 {suneungDate.getMonth() + 1}월 {suneungDate.getDate()}일
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-black text-blue-600 tracking-tighter">
                            D-{daysLeft}
                        </div>
                        <div className="text-xs font-bold text-slate-400 mt-1">
                            약 {weeksLeft}주 남음
                        </div>
                    </div>
                </div>

                <div className={`bg-${phase.color}-50 border border-${phase.color}-100 p-4 rounded-xl mb-6`}>
                    <h3 className={`font-bold text-${phase.color}-800 flex items-center gap-2 mb-2`}>
                        <span>🚩</span> 현재 페이즈: {phase.title}
                    </h3>
                    <p className={`text-sm text-${phase.color}-700`}>{phase.desc}</p>
                </div>

                <div className="space-y-4">
                    <h4 className="font-bold text-slate-700 text-sm">이번 주 필수 체크리스트</h4>
                    <ul className="space-y-2">
                        <li className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                            <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300" />
                            <div className="text-sm">
                                <p className="font-bold text-slate-700">취약 과목 ({student.weakSubject || '선택 안됨'}) 주간 목표 달성</p>
                                <p className="text-slate-500 text-xs mt-0.5">Focus Subject에 할당된 추가 학습 시간 15% 이행하기</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                            <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300" />
                            <div className="text-sm">
                                <p className="font-bold text-slate-700">모의고사 오답노트 작성</p>
                                <p className="text-slate-500 text-xs mt-0.5">틀린 이유(개념 부족/실수/시간 부족)를 명확히 기록하기</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                            <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300" />
                            <div className="text-sm">
                                <p className="font-bold text-slate-700">수면 패턴 정상화</p>
                                <p className="text-slate-500 text-xs mt-0.5">매일 밤 11시 30분 이전 취침, 최소 7시간 수면 확보</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
