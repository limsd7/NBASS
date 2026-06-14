import React, { useState, useEffect } from 'react';

interface ManualFile {
    filename: string;
    path: string;
    content: string;
}

export const ManualManager: React.FC = () => {
    const [manuals, setManuals] = useState<ManualFile[]>([]);
    const [selectedManual, setSelectedManual] = useState<ManualFile | null>(null);
    const [editContent, setEditContent] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isBrowserFallback, setIsBrowserFallback] = useState(false);

    // Hardcoded list for browser fallback
    const fallbackFiles = [
        'blood_flow_foods.html',
        'mind_map_guide.html',
        'self_care_guide.html',
        'spending_time_alone_guide.html',
        'vitamin_d_guide.html',
        'standing_desk_guide.html'
    ];

    // Initialize fs
    const getFsAndPath = () => {
        try {
            const fs = (window as any).require('fs');
            const path = (window as any).require('path');
            return { fs, path };
        } catch (err) {
            return null;
        }
    };

    useEffect(() => {
        loadManuals();
    }, []);

    const loadManualsFallback = async () => {
        setIsBrowserFallback(true);
        try {
            const loadedManuals: ManualFile[] = [];
            for (const filename of fallbackFiles) {
                // Try to load from localStorage first
                const savedContent = localStorage.getItem(`manual_${filename}`);
                if (savedContent) {
                    loadedManuals.push({ filename, path: `/resources/${filename}`, content: savedContent });
                } else {
                    // Fetch from dev server
                    try {
                        const res = await fetch(`/resources/${filename}`);
                        if (res.ok) {
                            const content = await res.text();
                            loadedManuals.push({ filename, path: `/resources/${filename}`, content });
                        }
                    } catch (e) {
                        console.warn('Failed to fetch', filename);
                    }
                }
            }
            setManuals(loadedManuals);
        } catch (err: any) {
            setError(`브라우저 폴백 로드 실패: ${err.message}`);
        }
    };

    const loadManuals = () => {
        const node = getFsAndPath();
        if (!node) {
            // Use browser fallback instead of showing an error
            loadManualsFallback();
            return;
        }

        const { fs, path } = node;
        try {
            const baseDir = (window as any).process.cwd();
            const processObj = (window as any).process;
            
            const devPath = path.join(baseDir, 'public', 'resources');
            const prodPath = processObj?.resourcesPath ? path.join(processObj.resourcesPath, 'app.asar', 'dist', 'resources') : '';
            const unpackedProdPath = processObj?.resourcesPath ? path.join(processObj.resourcesPath, 'app', 'dist', 'resources') : '';
            
            let resourcesDir = '';
            
            if (fs.existsSync(devPath)) {
                resourcesDir = devPath;
            } else if (prodPath && fs.existsSync(prodPath)) {
                resourcesDir = prodPath;
            } else if (unpackedProdPath && fs.existsSync(unpackedProdPath)) {
                resourcesDir = unpackedProdPath;
            } else {
                setError(`리소스 폴더를 찾을 수 없습니다: ${devPath} 또는 빌드 경로`);
                return;
            }

            const files = fs.readdirSync(resourcesDir);
            const htmlFiles = files
                .filter((f: string) => f.endsWith('.html'))
                .map((filename: string) => {
                    const filePath = path.join(resourcesDir, filename);
                    let content = fs.readFileSync(filePath, 'utf8');
                    
                    // If running from packaged read-only path, check localStorage for overrides
                    if (resourcesDir.includes('app.asar')) {
                        const savedContent = localStorage.getItem(`manual_${filename}`);
                        if (savedContent) {
                            content = savedContent;
                        }
                    }
                    
                    return { filename, path: filePath, content };
                })
                .sort((a: any, b: any) => a.filename.localeCompare(b.filename));

            setManuals(htmlFiles);
            setError(null);
        } catch (err: any) {
            setError(`매뉴얼 목록을 불러오는 중 오류 발생: ${err.message}`);
        }
    };

    const handleSelect = (manual: ManualFile) => {
        setSelectedManual(manual);
        setEditContent(manual.content);
        setStatusMessage('');
    };

    const handleSave = () => {
        if (!selectedManual) return;
        
        const node = getFsAndPath();
        
        if (!node || isBrowserFallback || selectedManual.path.includes('app.asar')) {
            // Save to localStorage in browser mode or read-only production mode
            localStorage.setItem(`manual_${selectedManual.filename}`, editContent);
            setStatusMessage('✅ 로컬 스토리지에 안전하게 저장되었습니다!');
            setManuals(prev => prev.map(m => 
                m.filename === selectedManual.filename ? { ...m, content: editContent } : m
            ));
            setTimeout(() => setStatusMessage(''), 3000);
            return;
        }

        try {
            node.fs.writeFileSync(selectedManual.path, editContent, 'utf8');
            setStatusMessage('✅ 성공적으로 저장되었습니다!');
            
            setManuals(prev => prev.map(m => 
                m.filename === selectedManual.filename ? { ...m, content: editContent } : m
            ));

            setTimeout(() => setStatusMessage(''), 3000);
        } catch (err: any) {
            setStatusMessage(`❌ 저장 실패: ${err.message}`);
        }
    };

    const handlePreview = () => {
        if (!selectedManual) return;
        
        if (isBrowserFallback || selectedManual.path.includes('app.asar')) {
            // Open in new window and inject content to preview local changes
            const newWin = window.open('', '_blank');
            if (newWin) {
                newWin.document.write(editContent);
                newWin.document.close();
            }
        } else {
            window.open(`resources/${selectedManual.filename}`, '_blank');
        }
    };

    if (error) {
        return (
            <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-200">
                <p className="font-bold">매뉴얼 관리자를 로드할 수 없습니다.</p>
                <p className="text-sm mt-2">{error}</p>
            </div>
        );
    }

    return (
        <div className="flex h-[600px] bg-white rounded-xl border border-slate-200 overflow-hidden relative">
            {isBrowserFallback && (
                <div className="absolute top-0 left-0 right-0 bg-amber-500 text-white text-xs font-bold text-center py-1 z-10">
                    ⚠️ 브라우저 테스트 모드 (로컬 스토리지에 임시 저장됩니다. 정식 저장은 앱을 통해 실행하세요)
                </div>
            )}
            {/* Sidebar List */}
            <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50 mt-6">
                <div className="p-4 border-b border-slate-200 bg-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">📑 내장 매뉴얼 목록</h3>
                    <span className="text-xs text-slate-500">{manuals.length}개</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {manuals.map(manual => (
                        <button
                            key={manual.filename}
                            onClick={() => handleSelect(manual)}
                            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors truncate ${
                                selectedManual?.filename === manual.filename
                                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                                    : 'text-slate-600 hover:bg-blue-50'
                            }`}
                        >
                            {manual.filename}
                        </button>
                    ))}
                </div>
            </div>

            {/* Editor Area */}
            <div className="w-2/3 flex flex-col bg-white mt-6">
                {selectedManual ? (
                    <>
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
                            <div>
                                <h3 className="font-bold text-slate-800">{selectedManual.filename}</h3>
                                <p className="text-[10px] text-slate-400 mt-1">{selectedManual.path}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {statusMessage && (
                                    <span className="text-xs font-bold mr-2 text-emerald-600 animate-in fade-in">
                                        {statusMessage}
                                    </span>
                                )}
                                <button
                                    onClick={handlePreview}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition flex items-center gap-1"
                                >
                                    <span>👁️</span> 미리보기
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition flex items-center gap-1 shadow-sm"
                                >
                                    <span>💾</span> 저장
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 p-0 relative">
                            <textarea
                                value={editContent}
                                onChange={e => setEditContent(e.target.value)}
                                className="absolute inset-0 w-full h-full p-4 resize-none outline-none font-mono text-[13px] bg-slate-50 text-slate-800 focus:bg-white transition-colors"
                                spellCheck="false"
                                placeholder="HTML 코드를 입력하세요..."
                            />
                        </div>
                        <div className="bg-amber-50 p-3 border-t border-amber-100 text-amber-800 text-[11px]">
                            <strong>주의:</strong> HTML 태그 구조를 변경할 때는 화면 깨짐에 주의하세요. 인쇄 양식(의학 전문 템플릿)은 코드 최하단의 <code>&lt;style id="medical-print-style"&gt;</code> 블록에 의해 유지됩니다.
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                        <span className="text-5xl mb-4">📝</span>
                        <h3 className="text-lg font-bold text-slate-600 mb-2">매뉴얼 편집기</h3>
                        <p className="text-sm max-w-sm">
                            왼쪽 목록에서 편집할 매뉴얼을 선택하세요. HTML 코드를 직접 수정하여 자체 매뉴얼의 내용을 즉시 업데이트할 수 있습니다.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
