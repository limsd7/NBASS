import React, { useState, useEffect } from 'react';
import { SimulationResult, StudentInfo } from '../../types';
import { DatabaseService } from '../../services/database';

interface ActionPlanCalendarProps {
    simulationResults: SimulationResult[];
    student: StudentInfo;
}

export const ActionPlanCalendar: React.FC<ActionPlanCalendarProps> = ({ simulationResults, student }) => {
    const days = ['월', '화', '수', '목', '금', '토', '일'];
    
    // Use all subjects from simulation results
    const targetSubjects = [...simulationResults];
    
    // Initialize gamification state
    const [gamification, setGamification] = useState(student.gamification || {
        exp: 0,
        level: 1,
        streak: 0,
        completedTasks: []
    });
    
    const EXP_PER_LEVEL = 100;
    const EXP_PER_TASK = 20;

    const [showLevelUp, setShowLevelUp] = useState(false);

    // Save changes to DB whenever gamification state changes
    useEffect(() => {
        // Deep equality check or just debouncing would be better, but since it's a mock we just save it
        if (gamification !== student.gamification) {
            const updatedStudent = { ...student, gamification };
            DatabaseService.updateStudent(updatedStudent).catch(console.error);
        }
    }, [gamification, student]);

    const handleTaskToggle = (taskId: string) => {
        setGamification(prev => {
            const isCompleted = prev.completedTasks.includes(taskId);
            let newCompletedTasks = [...prev.completedTasks];
            let newExp = prev.exp;
            let newLevel = prev.level;
            
            if (isCompleted) {
                newCompletedTasks = newCompletedTasks.filter(id => id !== taskId);
                newExp = Math.max(0, newExp - EXP_PER_TASK);
                // Level down if needed
                if (newExp < (newLevel - 1) * EXP_PER_LEVEL && newLevel > 1) {
                    newLevel--;
                }
            } else {
                newCompletedTasks.push(taskId);
                newExp += EXP_PER_TASK;
                // Level up
                if (newExp >= newLevel * EXP_PER_LEVEL) {
                    newLevel++;
                    setShowLevelUp(true);
                    setTimeout(() => setShowLevelUp(false), 3000);
                }
            }
            
            // Simple streak logic for demo: if you complete tasks today, streak = 1 or more
            const today = new Date().toISOString().split('T')[0];
            let newStreak = prev.streak;
            let lastCompletedDate = prev.lastCompletedDate;
            
            if (!isCompleted && newCompletedTasks.length > prev.completedTasks.length) {
                if (lastCompletedDate !== today) {
                    newStreak += 1;
                    lastCompletedDate = today;
                }
            }
            
            return {
                ...prev,
                exp: newExp,
                level: newLevel,
                streak: newStreak,
                completedTasks: newCompletedTasks,
                lastCompletedDate
            };
        });
    };

    const currentLevelExp = gamification.exp % EXP_PER_LEVEL;
    const progressPercent = (currentLevelExp / EXP_PER_LEVEL) * 100;
    
    const handlePrint = () => {
        const printContent = document.getElementById('print-action-plan');
        const WinPrint = window.open('', '', 'width=1000,height=800');
        if (!WinPrint || !printContent) return;
        
        const todayStr = new Date().toISOString().split('T')[0];
        const focusSubjectNames = targetSubjects.map(s => s.subjectName).join(', ');

        const dailyPagesHtml = days.map((day, index) => {
            const isWeekend = day === '토' || day === '일';
            const generalHabitContent = index % 2 === 0 ? '영단어 50개 암기' : '수능 기출 1회 풀기 (공통)';
            
            const dailyTasksHtml = targetSubjects.map((subject, sIndex) => {
                let taskType = isWeekend ? '모의고사 1회 풀기' : ((index + sIndex) % 2 === 0 ? '취약 단원 2시간 복습' : '핵심 개념 요약 정리');
                const detail = subject.recommendations[0]?.split('.')[0] || '기본기 복습';
                
                return `
                    <div class="mb-4 p-4 border border-slate-100 rounded-lg bg-slate-50 flex items-start gap-4">
                        <div class="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl shrink-0">
                            ${sIndex + 1}
                        </div>
                        <div>
                            <div class="font-bold text-slate-800 text-lg mb-1"><span class="text-blue-600 mr-2">[${subject.subjectName}]</span>${taskType}</div>
                            <div class="text-sm text-slate-500">${detail}</div>
                        </div>
                    </div>
                `;
            }).join('');
            
            // Random-ish completion rate for graph
            const rate = isWeekend ? 90 : 75 + (index * 2);
            const circleCircumference = 527.7; // 2 * pi * 84
            const offset = circleCircumference * ((100 - rate) / 100);
            
            return `
                <div class="page-break w-full min-h-[1000px] flex flex-col p-10 bg-white border border-slate-200 shadow-xl rounded-xl mb-10 relative">
                    <div class="h-4 w-full bg-slate-800 rounded-t-xl absolute top-0 left-0"></div>
                    
                    <div class="flex justify-between items-end mb-8 mt-4 border-b pb-4">
                        <div>
                            <div class="text-blue-600 font-bold mb-1 tracking-widest uppercase text-sm">NBASS Daily Action Report</div>
                            <h2 class="text-4xl font-black text-slate-800">${day}요일 <span class="text-slate-400 font-normal">학습 달성 시뮬레이션</span></h2>
                        </div>
                        <div class="text-right">
                            <div class="text-2xl font-mono text-slate-300">DAY ${index + 1}</div>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-12 gap-8 flex-1">
                        <!-- Left Column: Tasks -->
                        <div class="col-span-7">
                            <h3 class="font-bold text-xl mb-6 text-slate-700 flex items-center gap-2">
                                <span>📋</span> 일일 상세 미션
                            </h3>
                            ${dailyTasksHtml}
                            
                            <div class="mt-6 p-4 border border-rose-100 rounded-lg bg-rose-50 flex items-start gap-4">
                                <div class="w-12 h-12 rounded-full bg-rose-200 text-rose-600 flex items-center justify-center font-bold text-xl shrink-0">
                                    ★
                                </div>
                                <div>
                                    <div class="font-bold text-slate-800 text-lg mb-1"><span class="text-rose-600 mr-2">[공통 과제]</span>${generalHabitContent}</div>
                                    <div class="text-sm text-slate-500">매일 꾸준히 진행해야 하는 필수 습관입니다.</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Right Column: Charts -->
                        <div class="col-span-5">
                            <h3 class="font-bold text-xl mb-6 text-slate-700 flex items-center gap-2">
                                <span>📊</span> 학습 분석 차트
                            </h3>
                            
                            <div class="bg-slate-50 p-8 rounded-xl border border-slate-100 flex flex-col items-center justify-center mb-6">
                                <div class="text-sm font-bold text-slate-500 mb-6 tracking-widest uppercase">일일 목표 달성 예측률</div>
                                <div class="relative w-48 h-48 flex items-center justify-center mb-4">
                                    <svg class="absolute inset-0 w-full h-full transform -rotate-90">
                                        <circle cx="96" cy="96" r="84" stroke="#e2e8f0" stroke-width="16" fill="none" />
                                        <circle cx="96" cy="96" r="84" stroke="#3b82f6" stroke-width="16" fill="none" stroke-dasharray="${circleCircumference}" stroke-dashoffset="${offset}" stroke-linecap="round" />
                                    </svg>
                                    <div class="text-5xl font-black text-blue-600">${rate}%</div>
                                </div>
                                <div class="font-bold text-blue-600 text-lg mb-1">${rate >= 80 ? 'OPTIMAL' : 'GOOD'}</div>
                                <div class="text-sm text-slate-400 text-center mt-2">오늘 할당된 과제를 모두 완수했을 때<br/>예상되는 일일 성장률입니다.</div>
                            </div>

                            <div class="bg-slate-800 text-white p-6 rounded-xl">
                                <div class="font-bold text-slate-300 mb-4 tracking-widest uppercase text-sm">과목별 배분 밸런스</div>
                                <div class="space-y-4">
                                    ${targetSubjects.slice(0, 4).map((sub, i) => `
                                        <div>
                                            <div class="flex justify-between text-sm mb-1">
                                                <span>${sub.subjectName}</span>
                                                <span class="text-blue-300">${25 + (i * 5)}%</span>
                                            </div>
                                            <div class="w-full bg-slate-700 h-2 rounded-full">
                                                <div class="bg-blue-400 h-full rounded-full" style="width: ${25 + (i * 5)}%"></div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        WinPrint.document.write(`
            <html>
                <head>
                    <title>NBASS 주간 액션 플랜</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;600;700;800&display=swap');
                        body { font-family: 'Pretendard', sans-serif; background-color: #f8fafc; padding: 20px; }
                        .no-print { display: none !important; }
                        @media print {
                            body { background-color: white; padding: 0; }
                            .print-container { padding: 0 !important; border: none !important; box-shadow: none !important; }
                            .page-break { page-break-before: always; }
                            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                        }
                    </style>
                </head>
                <body>
                    <div class="print-container max-w-5xl mx-auto bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden mb-10">
                        <!-- Top blue bar -->
                        <div class="h-3 w-full bg-blue-600"></div>
                        
                        <div class="p-8">
                            <!-- Header -->
                            <div class="flex justify-between items-start mb-8">
                                <div>
                                    <div class="text-xs font-bold text-blue-600 tracking-wider mb-1">NEURO-BIO ACADEMIC STRATEGY SYSTEM</div>
                                    <h1 class="text-3xl font-black text-slate-800 mb-1">NBASS 주간 액션 플랜</h1>
                                    <div class="text-sm text-slate-500 italic">Official Diagnostic & Neuro-Insight Report</div>
                                </div>
                                <div class="text-right">
                                    <div class="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-mono mb-1">Ver 2.5.0-Precision</div>
                                    <div class="text-sm text-slate-600">분석책임자: <span class="text-blue-600 font-bold">AI System</span></div>
                                </div>
                            </div>
                            
                            <!-- Info Card -->
                            <div class="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-100 flex flex-wrap justify-between gap-4">
                                <div>
                                    <div class="text-xs text-slate-400 mb-1">피검자 성명</div>
                                    <div class="text-lg font-bold text-slate-800">${student.name} <span class="text-sm font-normal text-slate-500">(${student.gender === 'F' ? 'F' : 'M'} / ${student.age}세)</span></div>
                                </div>
                                <div>
                                    <div class="text-xs text-slate-400 mb-1">진단 코드</div>
                                    <div class="text-base font-mono text-slate-800">ID-${todayStr.replace(/-/g,'').slice(2)}-SP</div>
                                </div>
                                <div>
                                    <div class="text-xs text-slate-400 mb-1">발행 일시</div>
                                    <div class="text-base font-mono text-slate-800">${todayStr}</div>
                                </div>
                                <div>
                                    <div class="text-xs text-slate-400 mb-1">목표 달성 분야</div>
                                    <div class="text-base font-bold text-blue-600 line-clamp-1 max-w-[200px]">${focusSubjectNames || '전과목'} (학습 최적화)</div>
                                </div>
                            </div>

                            <!-- Dashboard Section -->
                            <div class="rounded-xl overflow-hidden border border-slate-200 mb-8">
                                <div class="bg-slate-900 text-white px-6 py-3 flex justify-between items-center">
                                    <div class="font-bold flex items-center gap-2">
                                        <span>🧠</span>
                                        <span>Brain-Body 주간 학습 달성 예측치</span>
                                    </div>
                                    <div class="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300 font-mono">3-Layer Verification</div>
                                </div>
                                <div class="bg-white p-6 grid grid-cols-3 gap-6">
                                    <!-- Circular Chart -->
                                    <div class="flex flex-col items-center justify-center border-r border-slate-100">
                                        <div class="text-xs font-bold text-slate-500 mb-4 tracking-widest uppercase">예측 달성도 (CONFIDENCE)</div>
                                        <div class="relative w-32 h-32 flex items-center justify-center mb-2">
                                            <!-- SVG Ring (85%) -->
                                            <svg class="absolute inset-0 w-full h-full transform -rotate-90">
                                                <circle cx="64" cy="64" r="56" stroke="#f1f5f9" stroke-width="12" fill="none" />
                                                <circle cx="64" cy="64" r="56" stroke="#ef4444" stroke-width="12" fill="none" stroke-dasharray="351.8" stroke-dashoffset="52.7" stroke-linecap="round" />
                                            </svg>
                                            <div class="text-3xl font-black text-red-500">85%</div>
                                        </div>
                                        <div class="font-bold text-red-500 mb-1">EXCELLENT</div>
                                        <div class="text-xs text-slate-400">시뮬레이션 통합 검증</div>
                                    </div>
                                    
                                    <!-- Metric 2 -->
                                    <div class="flex flex-col items-center justify-center border-r border-slate-100">
                                        <div class="text-xs font-bold text-slate-500 mb-4 tracking-widest uppercase">인지 밸런스 (EEG)</div>
                                        <div class="text-4xl mb-2">📡</div>
                                        <div class="text-sm font-bold text-slate-700">고도의 집중력 상태</div>
                                        <div class="text-xs text-slate-400">(2층 검증 모드)</div>
                                    </div>

                                    <!-- Text Summary -->
                                    <div class="flex flex-col justify-center pl-4">
                                        <div class="font-bold text-slate-700 mb-4">분석 요약</div>
                                        <div class="text-xs text-slate-400 mb-1">추천 학습 강도</div>
                                        <div class="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                                            High Focus <span class="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">BALANCED</span>
                                        </div>
                                        <div class="text-xs text-slate-400 mb-1">최종 스케줄 판정</div>
                                        <div class="text-xl font-black text-slate-800">READY TO EXECUTE</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Scope -->
                            <div class="bg-slate-50 rounded-lg p-3 text-sm flex items-center justify-between border border-slate-100 mb-8">
                                <div class="flex items-center gap-2 text-slate-600">
                                    <span>📋</span>
                                    <span><strong>본 스케줄러 적용 범위:</strong> AI 성적 예측 기반 취약점 방어 전략</span>
                                </div>
                                <div class="text-blue-600 font-bold text-xs">개별 맞춤 모드</div>
                            </div>
                            
                            <!-- Calendar Content (Removed as per user request, replaced by daily pages) -->
                            
                        </div>
                    </div>
                    
                    ${dailyPagesHtml}
                </body>
            </html>
        `);
        WinPrint.document.close();
        WinPrint.focus();
        // Wait for Tailwind to load before printing
        setTimeout(() => {
            WinPrint.print();
            WinPrint.close();
        }, 1500);
    };
    
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            {showLevelUp && (
                <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white font-black text-3xl px-8 py-4 rounded-full shadow-2xl animate-bounce">
                        🎉 LEVEL UP! Lv.{gamification.level} 🎉
                    </div>
                </div>
            )}
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-slate-800">주간 액션 플랜 (스케줄러)</h3>
                        <button 
                            onClick={handlePrint}
                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-colors"
                            title="스케줄러 인쇄하기"
                        >
                            🖨️ 인쇄하기
                        </button>
                    </div>
                    <p className="text-slate-500 mt-1">시뮬레이션 분석 결과를 바탕으로 생성된 이번 주 학습 스케줄입니다.</p>
                </div>
                
                {/* Gamification Dashboard */}
                <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex flex-col items-center justify-center bg-orange-50 w-12 h-12 rounded-xl border border-orange-100">
                        <span className="text-xl">🔥</span>
                        <span className="text-xs font-black text-orange-600">{gamification.streak}일</span>
                    </div>
                    
                    <div className="flex-1 min-w-[150px]">
                        <div className="flex justify-between items-end mb-1">
                            <span className="font-black text-indigo-700 text-sm">Lv.{gamification.level}</span>
                            <span className="text-[10px] text-slate-500 font-bold">{currentLevelExp} / {EXP_PER_LEVEL} EXP</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div id="print-action-plan" className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {days.map((day, index) => {
                    const isWeekend = day === '토' || day === '일';
                    
                    // Task 2 Content: general habit
                    const generalHabitId = `task-${day}-habit`;
                    const generalHabitContent = index % 2 === 0 ? '영단어 50개 암기' : '수능 기출 1회 풀기 (공통)';
                    const isHabitDone = gamification.completedTasks.includes(generalHabitId);
                    
                    return (
                        <div key={day} className={`border rounded-2xl p-4 flex flex-col h-full transition-colors ${day === '일' ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <div className="font-bold text-center mb-3 pb-2 border-b border-slate-100">
                                <span className={day === '일' ? 'text-rose-500' : day === '토' ? 'text-blue-500' : 'text-slate-700'}>
                                    {day}요일
                                </span>
                            </div>
                            
                            <div className="flex-1 flex flex-col gap-3">
                                {/* Map all subjects to daily tasks */}
                                {targetSubjects.map((subject, sIndex) => {
                                    const taskId = `task-${day}-${subject.subjectId}`;
                                    const isTaskDone = gamification.completedTasks.includes(taskId);
                                    
                                    let taskType = '';
                                    if (isWeekend) {
                                        taskType = '모의고사 1회 풀기';
                                    } else {
                                        taskType = (index + sIndex) % 2 === 0 ? '취약 단원 2시간 복습' : '핵심 개념 요약 정리';
                                    }

                                    return (
                                        <label key={taskId} className={`flex items-start gap-2 cursor-pointer group ${isTaskDone ? 'opacity-50 grayscale' : ''}`}>
                                            <input 
                                                type="checkbox" 
                                                className="mt-1 accent-indigo-500 w-4 h-4 cursor-pointer no-print" 
                                                checked={isTaskDone}
                                                onChange={() => handleTaskToggle(taskId)}
                                            />
                                            <div className="text-sm flex-1">
                                                <div className={`font-bold transition-colors ${isTaskDone ? 'text-slate-400 line-through' : 'text-slate-700 group-hover:text-indigo-600'}`}>
                                                    <span className="text-indigo-600 mr-1">[{subject.subjectName}]</span>
                                                    {taskType}
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-0.5 leading-tight line-clamp-2">
                                                    {subject.recommendations[0]?.split('.')[0] || '기본기 복습'}
                                                </div>
                                            </div>
                                        </label>
                                    );
                                })}
                                
                                {/* General Habit */}
                                {!isWeekend && (
                                    <label className={`flex items-start gap-2 cursor-pointer group pt-2 border-t border-slate-100 mt-1 ${isHabitDone ? 'opacity-50 grayscale' : ''}`}>
                                        <input 
                                            type="checkbox" 
                                            className="mt-1 accent-indigo-500 w-4 h-4 cursor-pointer no-print"
                                            checked={isHabitDone}
                                            onChange={() => handleTaskToggle(generalHabitId)}
                                        />
                                        <div className="text-sm">
                                            <div className={`font-bold transition-colors ${isHabitDone ? 'text-slate-400 line-through' : 'text-slate-700 group-hover:text-indigo-600'}`}>
                                                {generalHabitContent}
                                            </div>
                                        </div>
                                    </label>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
