import re

# Read the file
with open('c:/SN1/components/ExpertOverlay.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add checkbox to strategy card
checkbox_insertion = '''                                                    <div className="flex items-start gap-3 flex-1">
                                                        {/* Checkbox for multi-select */}
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedStrategies[activeTab as 'prestudy' | 'learning' | 'exercise'].includes(idx)}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                toggleStrategySelection(activeTab as 'prestudy' | 'learning' | 'exercise', idx);
                                                            }}
                                                            className="w-5 h-5 mt-1 rounded border-2 border-indigo-300 cursor-pointer accent-indigo-600 shrink-0"
                                                        />
                                                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 mt-0.5 ${activeTab === 'prestudy' ? 'bg-emerald-100 text-emerald-700' :
                                                            activeTab === 'learning' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                                            }`}>'''

find1 = r'''                                                    <div className="flex items-start gap-3 flex-1">
                                                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 mt-0.5 \${activeTab === 'prestudy' \? 'bg-emerald-100 text-emerald-700' :
                                                            activeTab === 'learning' \? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                                            }`}>'''

content = re.sub(re.escape(find1).replace(r'\?', '?').replace(r'\$', '$'), checkbox_insertion, content, count=1)

# 2. Add print button after difficulty filters
print_button = '''                                    </div>

                                    {/* Multi-Select Print Button */}
                                    {totalSelected > 0 && (
                                        <div className="mb-4">
                                            <button
                                                onClick={printSelectedStrategies}
                                                className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                </svg>
                                                <span>선택한 전략 인쇄 ({totalSelected}개)</span>
                                            </button>
                                        </div>
                                    )}

                                    <div className="space-y-4">'''

find2 = r'''                                    </div>

                                    <div className="space-y-4">'''

content = content.replace(find2, print_button, 1)

# Write back
with open('c:/SN1/components/ExpertOverlay.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully added checkbox and print button!")
