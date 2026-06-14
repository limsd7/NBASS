import React from 'react';
import { SurveyData } from '../../types';

interface SmartSchedulerProps {
    survey: SurveyData;
}

export const SmartScheduler: React.FC<SmartSchedulerProps> = ({ survey }) => {
    const chronotypeResult = survey.chronotypeResult || 'intermediate';

    // Mock data based on chronotype
    const getSchedule = () => {
        if (chronotypeResult.includes('morning')) {
            return [
                { time: '07:00', activity: '기상 및 스트레칭', type: 'lifestyle' },
                { time: '09:00', activity: '⚡ [GOLDEN] 논리/수학 집중 학습', type: 'golden' },
                { time: '12:00', activity: '점심 식사 및 산책', type: 'lifestyle' },
                { time: '14:00', activity: '어학/암기 학습', type: 'study' },
                { time: '22:00', activity: '수면 준비 (멜라토닌 타임)', type: 'rest' }
            ];
        } else if (chronotypeResult.includes('evening')) {
            return [
                { time: '09:00', activity: '기상 및 가벼운 아침', type: 'lifestyle' },
                { time: '11:00', activity: '워밍업 (단어 암기)', type: 'study' },
                { time: '14:00', activity: '강의 수강 / 인강', type: 'study' },
                { time: '20:00', activity: '⚡ [GOLDEN] 심화 문제 풀이', type: 'golden' },
                { time: '01:00', activity: '수면 준비', type: 'rest' }
            ];
        } else {
            return [
                { time: '08:00', activity: '기상', type: 'lifestyle' },
                { time: '10:00', activity: '오전 집중 학습', type: 'study' },
                { time: '14:00', activity: '오후 집중 학습', type: 'study' },
                { time: '19:00', activity: '⚡ [GOLDEN] 복습 및 정리', type: 'golden' },
                { time: '23:00', activity: '수면 준비', type: 'rest' }
            ];
        }
    };

    const schedule = getSchedule();

    return (
        <div className="p-8 h-full overflow-y-auto">
            <div className="mb-8">
                <h3 className="text-2xl font-black text-slate-800 mb-2">Smart Routine Scheduler</h3>
                <p className="text-sm text-slate-500">
                    <span className="font-bold text-indigo-600 uppercase">{chronotypeResult.replace('_', ' ')}</span> 유형에 최적화된 하루 일과표입니다.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Timeline */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span>📅</span> Daily Timeline
                    </h4>
                    <div className="space-y-0 relative">
                        <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-100"></div>
                        {schedule.map((item, idx) => (
                            <div key={idx} className="relative pl-10 pb-8 last:pb-0">
                                <div className={`absolute left-0 w-6 h-6 rounded-full border-4 border-white shadow-sm z-10 
                                    ${item.type === 'golden' ? 'bg-amber-400 ring-4 ring-amber-100' :
                                        item.type === 'rest' ? 'bg-purple-400' : 'bg-slate-300'}`}></div>
                                <span className="text-xs font-bold text-slate-400 block mb-1">{item.time}</span>
                                <h5 className={`font-bold ${item.type === 'golden' ? 'text-amber-600 text-lg' : 'text-slate-700'}`}>
                                    {item.activity}
                                </h5>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hydration & Tips */}
                <div className="space-y-6">
                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                        <h4 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                            <span>💧</span> Hydration Guide
                        </h4>
                        <p className="text-sm text-blue-700 mb-4 leading-relaxed">
                            뇌는 2%만 수분이 부족해도 인지 능력이 급격히 저하됩니다. 공부 시작 전, 그리고 휴식 시간마다 물을 한 잔씩 섭취하세요.
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(cup => (
                                <button key={cup} className="aspect-square rounded-xl bg-white/50 border border-blue-200 text-blue-300 hover:bg-blue-500 hover:text-white transition-colors flex items-center justify-center text-xl font-bold">
                                    🥛
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                        <h4 className="font-bold text-indigo-800 mb-2">💡 Tips for You</h4>
                        <ul className="space-y-2 text-sm text-indigo-700">
                            <li>• 기상 직후 30분 이내에 햇빛을 보세요.</li>
                            <li>• 커피는 기상 2시간 이후에 마시는 것이 좋습니다.</li>
                            <li>• 저녁 9시 이후에는 블루라이트를 차단하세요.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
