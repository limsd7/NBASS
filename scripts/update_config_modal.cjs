const fs = require('fs');
const lines = fs.readFileSync('components/modals/ConfigModal.tsx', 'utf8').split(/\r?\n/);

// Lines 805 to 925 correspond to the Local AI Model block (0-indexed 804 to 925)
const startIdx = lines.findIndex(l => l.includes('Local AI Model 설정 (Ollama 등)')) - 1; // get the `<div className="p-4 border rounded-xl bg-white shadow-sm">`
const endIdx = lines.findIndex(l => l.includes('Ollama 등 로컬 구동 모델의 Endpoint URL을 입력하세요.')) + 3;

console.log('Replacing from line', startIdx + 1, 'to line', endIdx + 1);

const replacementLines = [
`                    <div className="p-5 border-2 border-indigo-200 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-white shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                                <span className="text-xl">🌐</span> OpenRouter API Key (최신 SOTA 멀티 모델)
                            </label>
                            <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                2026 최신 플래그십
                            </span>
                        </div>
                        <input
                            type="password"
                            placeholder="sk-or-v1-..."
                            value={aiModels.openRouterKey || ''}
                            onChange={(e) => onAiModelsChange({ ...aiModels, openRouterKey: e.target.value })}
                            className="w-full p-3 border border-indigo-200 rounded-xl text-sm bg-white focus:ring-2 ring-indigo-200 outline-none font-mono shadow-inner"
                        />
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                            OpenRouter 키 하나로 <strong>Claude Sonnet 4.6, DeepSeek R1 (추론), DeepSeek V3, Gemini 2.5 Flash</strong>를 실시간 스마트 라우팅합니다.
                        </p>

                        <div className="mt-4 pt-3 border-t border-indigo-100">
                            <label className="text-xs font-bold text-slate-700 block mb-2">기본 우선 호출 모델 선택</label>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                {[
                                    { id: 'anthropic/claude-sonnet-4.6', name: 'Claude Sonnet 4.6', tag: '최고 품질 리포트' },
                                    { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', tag: '심층 논리 추론' },
                                    { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', tag: '초고속 챗봇' },
                                    { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', tag: '스마트 분석' }
                                ].map((m) => (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => onAiModelsChange({ ...aiModels, openRouterModel: m.id })}
                                        className={\`p-3 rounded-xl border text-left flex flex-col justify-between transition-all \${
                                            (aiModels.openRouterModel || 'anthropic/claude-sonnet-4.6') === m.id
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                                : 'bg-white border-slate-200 text-slate-700 hover:bg-indigo-50/50'
                                        }\`}
                                    >
                                        <span className="font-bold text-sm">{m.name}</span>
                                        <span className={\`text-[10px] mt-1 \${
                                            (aiModels.openRouterModel || 'anthropic/claude-sonnet-4.6') === m.id ? 'text-indigo-200' : 'text-slate-400'
                                        }\`}>{m.tag}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>`
];

lines.splice(startIdx, (endIdx - startIdx + 1), ...replacementLines);
fs.writeFileSync('components/modals/ConfigModal.tsx', lines.join('\n'), 'utf8');
console.log('REPLACED_SUCCESS');
