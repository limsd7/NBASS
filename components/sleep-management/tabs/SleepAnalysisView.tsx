import React from 'react';
import { SleepRecord, AssessmentResult, CareType } from '../../../types';

interface SleepAnalysisViewProps {
  records: SleepRecord[];
  currentAssessment?: AssessmentResult;
  aiModels: any; // Assuming it will be used for LLM interaction
}

export const SleepAnalysisView: React.FC<SleepAnalysisViewProps> = ({ records, currentAssessment }) => {
  // Mock analysis logic based on careType and basic records
  const careType = currentAssessment?.careType || CareType.BURNOUT;
  
  // Calculate sleep debt if records exist
  const averageSleep = records.length > 0 
    ? records.reduce((acc, r) => {
        const bParts = r.bedtime.split(':').map(Number);
        const wParts = r.wakeTime.split(':').map(Number);
        let bMins = bParts[0] * 60 + bParts[1];
        let wMins = wParts[0] * 60 + wParts[1];
        if (bMins > 12 * 60 && wMins < 12 * 60) wMins += 24 * 60;
        return acc + Math.max(0, (wMins - bMins) / 60);
      }, 0) / records.length
    : 0;

  const targetHours = careType === CareType.BURNOUT ? 8 : 7;
  const sleepDebt = records.length > 0 ? (targetHours - averageSleep) * 7 : 0; // Weekly debt

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <span>🔬</span> 수면 패턴 심층 분석
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-800 dark:text-white mb-2">누적 수면 부채 (최근 7일 기준)</h4>
              <div className="flex items-end gap-2">
                <span className={`text-4xl font-black ${sleepDebt > 5 ? 'text-red-500' : sleepDebt > 0 ? 'text-amber-500' : 'text-green-500'}`}>
                  {sleepDebt > 0 ? sleepDebt.toFixed(1) : 0}
                </span>
                <span className="text-slate-500 font-medium mb-1">시간</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                {sleepDebt > 5 
                  ? '수면 부채가 심각한 수준입니다. 주말에 1~2시간의 보충 수면이 필요합니다.' 
                  : sleepDebt > 0 
                    ? '약간의 수면 부족 상태입니다. 오늘 밤은 30분 일찍 취침하세요.' 
                    : '수면 시간이 충분합니다. 현재 패턴을 유지하세요.'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-800 dark:text-white mb-2">현재 상태 맞춤 분석</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                진단 결과(<span className="font-bold text-indigo-600 dark:text-indigo-400">{careType}</span>)를 기반으로 한 분석입니다.다.
              </p>
              <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                {careType === CareType.BURNOUT && '번아웃 상태에서는 수면이 최우선입니다.'}
                {careType === CareType.STRESS_OVERLOAD && '스트레스로 인해 교감신경이 항진되어 수면의 질이 떨어질 수 있습니다.'}
                {careType === CareType.ATTENTION_DEFICIT && '주의력 향상을 위해 수면의 규칙성이 중요합니다.'}
                {careType === CareType.BRAIN_FATIGUE && '브레인 포그 증상은 깊은 수면 부족과 연관이 있습니다.'}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span>🧠</span> 학습 효율-수면 상관관계 AI 분석
            </h4>
            <div className="p-4 border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl">
              <div className="font-bold text-lg text-indigo-800 dark:text-indigo-300 mb-2">Deep Sleep & Memory</div>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                최근 7일간 <span className="font-bold text-indigo-600">깊은 수면(Deep Sleep) 비율이 15% 미만</span>이었을 때, 다음 날의 <strong>인지 기능(Cognitive Function) 점수가 평균 20% 하락</strong>하는 패턴이 감지되었습니다.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm items-center">
                  <span className="text-slate-500">깊은 수면 정상 (20%+)</span>
                  <div className="flex-1 ml-4 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '92%' }}></div>
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-white w-10 text-right">92점</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-slate-500">깊은 수면 부족 (15%-)</span>
                  <div className="flex-1 ml-4 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400" style={{ width: '74%' }}></div>
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-white w-10 text-right">74점</span>
                </div>
              </div>
            </div>

            <div className="p-4 border border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl">
              <div className="font-bold text-lg text-blue-800 dark:text-blue-300 mb-2 flex justify-between items-center">
                <span>Screen Time & Sleep Latency</span>
                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-md">상관계수 r = 0.82</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                취침 전 스크린타임과 수면 잠복기(침대에 누워 잠들기까지 걸리는 시간)의 높은 양의 상관관계가 발견되었습니다.
              </p>
              
              <div className="relative h-32 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-2 overflow-hidden mb-4">
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: 'linear-gradient(to top right, transparent 40%, rgba(59, 130, 246, 0.2) 50%, transparent 60%)' }}></div>
                {/* Mock Scatter Plot */}
                <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-blue-500" title="스크린타임 10분, 잠복기 15분"></div>
                <div className="absolute bottom-6 left-12 w-2 h-2 rounded-full bg-blue-500" title="스크린타임 25분, 잠복기 20분"></div>
                <div className="absolute bottom-10 left-20 w-2 h-2 rounded-full bg-blue-500" title="스크린타임 45분, 잠복기 35분"></div>
                <div className="absolute bottom-16 left-32 w-2 h-2 rounded-full bg-blue-600" title="스크린타임 70분, 잠복기 50분"></div>
                <div className="absolute bottom-20 left-48 w-2 h-2 rounded-full bg-blue-600" title="스크린타임 100분, 잠복기 70분"></div>
                <div className="absolute bottom-24 left-64 w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" title="어제: 스크린타임 130분, 잠복기 90분"></div>
                
                {/* Trend line */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <line x1="10" y1="110" x2="280" y2="20" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="2" strokeDasharray="4 4" />
                </svg>

                <div className="absolute bottom-1 left-2 text-[10px] text-slate-400">스크린타임(분) →</div>
                <div className="absolute top-2 left-2 text-[10px] text-slate-400 -rotate-90 origin-left">← 잠복기(분)</div>
              </div>

              <div className="pt-3 border-t border-blue-100 dark:border-blue-800/50">
                <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                  💡 AI 인사이트: 야간 스마트폰 사용이 수면 지연의 주원인입니다. 특히 어제는 취침 전 2시간 이상 폰을 사용하여 잠드는 데 1시간 반이 걸렸습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-2xl shadow-md text-white">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>✨</span> 수면 환경 개선 솔루션
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/10 p-4 rounded-xl">
            <div className="font-bold mb-1">온도와 습도</div>
            <p className="text-xs text-slate-300 leading-relaxed">방 온도는 18-20도, 습도는 50-60%를 유지하세요. 수면 중에는 체온이 약간 떨어지는 것이 깊은 수면을 유도합니다.</p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl">
            <div className="font-bold mb-1">빛 통제</div>
            <p className="text-xs text-slate-300 leading-relaxed">암막 커튼을 사용하여 외부 빛을 완전히 차단하세요. 작은 불빛 하나도 멜라토닌 분비를 억제할 수 있습니다.</p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl">
            <div className="font-bold mb-1">소음 관리</div>
            <p className="text-xs text-slate-300 leading-relaxed">백색 소음기나 귀마개를 활용하세요. 규칙적이고 낮은 주파수의 백색 소음은 깊은 수면을 돕습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
