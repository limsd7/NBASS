import React, { useState, useEffect, useRef } from 'react';
import { HRVData, StudentInfo } from '../../types';
import { extractDataFromDocument, ExtractedField, recognizeRegion } from '../../services/ocrEngine';
import { mapExtractedToHRVData, mapExtractedToStudentInfo } from '../../services/ocrDataMapper';
import { saveTemplate, applyTemplateToFields } from '../../services/ocrTemplateService';
import { updateAutoCalculatedFields } from '../../services/ocrAutoCalc';

interface OCRCorrectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (hrvData: Partial<HRVData>, studentInfo: Partial<StudentInfo>) => void;
}

export const OCRCorrectionModal: React.FC<OCRCorrectionModalProps> = ({ isOpen, onClose, onSave }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isMiniProcessing, setIsMiniProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [fields, setFields] = useState<ExtractedField[]>([]);
    
    // UI Interaction states
    const [hoveredField, setHoveredField] = useState<ExtractedField | null>(null);
    const [mappingFieldIdx, setMappingFieldIdx] = useState<number | null>(null);
    const [zoomLevel, setZoomLevel] = useState<number>(1);
    
    // Drag box states
    const [dragStart, setDragStart] = useState<{ x: number, y: number, page: number } | null>(null);
    const [dragCurrent, setDragCurrent] = useState<{ x: number, y: number } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    if (!isOpen) return null;

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setIsProcessing(true);
        setStatusText('파일 읽는 중...');
        setFields([]);

        try {
            const buffer = await selectedFile.arrayBuffer();
            const bytes = new Uint8Array(buffer);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            const base64Data = btoa(binary);

            // 1. Initial OCR & Preprocessing internally in extractDataFromDocument
            const result = await extractDataFromDocument(base64Data, selectedFile.type, (msg) => {
                setStatusText(msg);
            });
            
            const urls = result.previewUrls || [URL.createObjectURL(selectedFile)];
            setPreviewUrls(urls);

            let extractedFields = result.fields;

            // 2. Auto Apply Template
            extractedFields = await applyTemplateToFields(extractedFields, urls);

            // 3. Auto Calculation
            extractedFields = updateAutoCalculatedFields(extractedFields);

            setFields(extractedFields);
            setStatusText('추출 완료! 영역을 지정하거나 값을 교정해 주세요.');
        } catch (error: any) {
            console.error('OCR Error:', error);
            setStatusText(`오류 발생: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFieldChange = (index: number, newValue: string | number) => {
        const newFields = [...fields];
        newFields[index] = {
            ...newFields[index],
            value: newValue,
            description: '수동 교정됨'
        };
        const calculated = updateAutoCalculatedFields(newFields);
        setFields(calculated);
    };

    // --- Drag and Drop Region Extraction ---
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, pageIdx: number) => {
        if (mappingFieldIdx === null || isMiniProcessing) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setDragStart({
            x: ((e.clientX - rect.left) / rect.width) * 1000,
            y: ((e.clientY - rect.top) / rect.height) * 1000,
            page: pageIdx
        });
        setDragCurrent({
            x: ((e.clientX - rect.left) / rect.width) * 1000,
            y: ((e.clientY - rect.top) / rect.height) * 1000
        });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!dragStart || isMiniProcessing) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setDragCurrent({
            x: ((e.clientX - rect.left) / rect.width) * 1000,
            y: ((e.clientY - rect.top) / rect.height) * 1000
        });
    };

    const handleMouseUp = async () => {
        if (!dragStart || !dragCurrent || mappingFieldIdx === null) {
            setDragStart(null);
            setDragCurrent(null);
            return;
        }

        const ymin = Math.min(dragStart.y, dragCurrent.y);
        const xmin = Math.min(dragStart.x, dragCurrent.x);
        const ymax = Math.max(dragStart.y, dragCurrent.y);
        const xmax = Math.max(dragStart.x, dragCurrent.x);

        if (Math.abs(ymax - ymin) < 5 && Math.abs(xmax - xmin) < 5) {
            setDragStart(null);
            setDragCurrent(null);
            return;
        }

        setIsMiniProcessing(true);
        setStatusText(`${fields[mappingFieldIdx].key} 영역 재인식 중...`);
        const box = [ymin, xmin, ymax, xmax];

        try {
            const recognizedText = await recognizeRegion(previewUrls[dragStart.page], box);
            const updatedFields = [...fields];
            
            // Clean up text if it should be a number
            let val: string | number = recognizedText;
            if (updatedFields[mappingFieldIdx].type === 'number') {
                const parsed = parseFloat(recognizedText.replace(/,/g, ''));
                if (!isNaN(parsed)) val = parsed;
            }

            updatedFields[mappingFieldIdx] = {
                ...updatedFields[mappingFieldIdx],
                value: val,
                boundingBox: box,
                confidence: 1.0,
                description: "드래그 영역 텍스트 추출 성공"
            };

            const calculated = updateAutoCalculatedFields(updatedFields);
            setFields(calculated);
            
            // Auto-save template when user manually maps a region
            await saveTemplate(calculated);
            
            setStatusText('영역 재인식 및 템플릿 영구 저장 완료');
        } catch (err) {
            console.error("Region OCR Failed", err);
            setStatusText('영역 인식에 실패했습니다.');
        } finally {
            setIsMiniProcessing(false);
            setMappingFieldIdx(null); // Reset mapping mode
            setDragStart(null);
            setDragCurrent(null);
        }
    };

    const handleRescan = async (idx: number) => {
        const field = fields[idx];
        if (!field.boundingBox || field.boundingBox.length !== 4) return;
        setIsMiniProcessing(true);
        setStatusText(`${field.key} 템플릿 영역 재인식 중...`);
        try {
            const recognizedText = await recognizeRegion(previewUrls[0], field.boundingBox);
            const updatedFields = [...fields];
            let val: string | number = recognizedText;
            if (updatedFields[idx].type === 'number') {
                const parsed = parseFloat(recognizedText.replace(/,/g, ''));
                if (!isNaN(parsed)) val = parsed;
            }
            updatedFields[idx] = { ...updatedFields[idx], value: val, description: '재인식 성공' };
            setFields(updateAutoCalculatedFields(updatedFields));
            setStatusText('재인식 완료');
        } finally {
            setIsMiniProcessing(false);
        }
    };

    const onSaveTemplate = async () => {
        const count = await saveTemplate(fields);
        setStatusText(`템플릿 ${count}개 항목 영구 저장 완료`);
    };

    const handleSave = () => {
        const newHrvData = mapExtractedToHRVData(fields);
        const newStudentInfo = mapExtractedToStudentInfo(fields);
        onSave(newHrvData, newStudentInfo);
        onClose();
    };

    const renderHighlight = () => {
        const activeHighlight = hoveredField?.boundingBox && (
            <div
                className="absolute border-4 border-red-500 bg-red-500/10 z-30 pointer-events-none rounded transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                style={{
                    top: `${hoveredField.boundingBox[0] / 10}%`,
                    left: `${hoveredField.boundingBox[1] / 10}%`,
                    width: `${Math.max(2, (hoveredField.boundingBox[3] - hoveredField.boundingBox[1]) / 10)}%`,
                    height: `${Math.max(2, (hoveredField.boundingBox[2] - hoveredField.boundingBox[0]) / 10)}%`,
                }}
            >
                <div className="absolute -top-8 left-0 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg whitespace-nowrap">
                    {hoveredField.key}
                </div>
            </div>
        );

        const dragBox = dragStart && dragCurrent && (
            <div
                className="absolute border-2 border-dashed border-indigo-600 bg-indigo-600/20 z-40 pointer-events-none rounded shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                style={{
                    top: `${Math.min(dragStart.y, dragCurrent.y) / 10}%`,
                    left: `${Math.min(dragStart.x, dragCurrent.x) / 10}%`,
                    width: `${Math.abs(dragCurrent.x - dragStart.x) / 10}%`,
                    height: `${Math.abs(dragCurrent.y - dragStart.y) / 10}%`,
                }}
            />
        );

        return <>{activeHighlight} {dragBox}</>;
    };

    return (
        <div className="fixed inset-0 z-[100] flex bg-slate-100" ref={containerRef}>
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-50">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🧠</span>
                    <h2 className="text-lg font-bold text-slate-800">BrainBody 결과지 고급 OCR </h2>
                    {(isProcessing || isMiniProcessing) && <span className="ml-4 text-sm text-indigo-600 animate-pulse font-medium">{statusText}</span>}
                    {!(isProcessing || isMiniProcessing) && statusText && <span className="ml-4 text-sm text-emerald-600 font-medium">{statusText}</span>}
                </div>
                <div className="flex gap-3">
                    <button onClick={onSaveTemplate} disabled={fields.length === 0} className="px-4 py-2 rounded-xl text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 disabled:opacity-50">
                        💾 템플릿 덮어쓰기
                    </button>
                    <button onClick={onClose} className="px-6 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 border border-slate-200">
                        취소
                    </button>
                    <button onClick={handleSave} disabled={isProcessing || fields.length === 0} className="px-6 py-2 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
                        결과 저장 (Import)
                    </button>
                </div>
            </div>

            {/* Split Content */}
            <div className="flex w-full pt-16 h-full">
                {/* Left Pane: Document Viewer */}
                <div className="w-1/2 h-full border-r border-slate-200 bg-slate-200 flex flex-col p-4 overflow-auto">
                    {!file ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                                <span className="text-4xl">📄</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">결과지를 업로드해 주세요</h3>
                            <p className="text-slate-500 mb-6 text-center text-sm">
                                <b>PDF</b> 또는 <b>이미지(JPG/PNG)</b> 파일을 지원합니다.<br/>
                                업로드 즉시 AI 전처리와 템플릿 자동 매칭이 시작됩니다.
                            </p>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/jpeg, image/png, application/pdf" className="hidden" />
                            <button onClick={() => fileInputRef.current?.click()} className="px-8 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 shadow-sm flex items-center gap-2">
                                <span>📤</span> 파일 선택
                            </button>
                        </div>
                    ) : (
                        <div className="flex-1 relative bg-white shadow-xl rounded-lg p-4 flex flex-col items-center overflow-auto custom-scrollbar">
                            {/* Zoom Controls */}
                            <div className="sticky top-0 z-50 flex gap-2 mb-4 bg-white/90 p-2 rounded-lg shadow-sm backdrop-blur">
                                <button onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.2))} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-bold">- 축소</button>
                                <button onClick={() => setZoomLevel(1)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-bold">{Math.round(zoomLevel * 100)}%</button>
                                <button onClick={() => setZoomLevel(z => Math.min(3, z + 0.2))} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-bold">+ 확대</button>
                            </div>

                            <div 
                                className="flex flex-col gap-8 transition-transform duration-200 origin-top" 
                                style={{ transform: `scale(${zoomLevel})`, width: '100%' }}
                            >
                                {previewUrls.map((url, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`relative w-full select-none transition-all duration-300 ${mappingFieldIdx !== null ? 'cursor-crosshair ring-4 ring-indigo-500 ring-inset shadow-[0_0_30px_rgba(79,70,229,0.3)]' : ''}`}
                                        onMouseDown={(e) => handleMouseDown(e, idx)}
                                        onMouseMove={handleMouseMove}
                                        onMouseUp={handleMouseUp}
                                        onMouseLeave={handleMouseUp}
                                    >
                                        <img src={url} alt={`Preview Page ${idx + 1}`} className="w-full h-auto block object-contain pointer-events-none rounded border border-slate-200 shadow-sm" draggable={false} />
                                        
                                        {/* Render Drag Box & Hover Overlay over image */}
                                        {renderHighlight()}
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => fileInputRef.current?.click()} className="fixed bottom-10 right-1/2 translate-x-[-1rem] p-4 bg-indigo-600 text-white rounded-full shadow-2xl border border-indigo-700 hover:bg-indigo-700 z-50 tooltip" title="다른 파일 업로드">
                                🔄 교체
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Pane: Editable Fields */}
                <div className="w-1/2 h-full bg-slate-50 overflow-y-auto p-8 pb-24">
                    {fields.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <span className="text-5xl mb-4 opacity-50">✍️</span>
                            <p>파일을 업로드하면 추출된 데이터가 여기에 표시됩니다.</p>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm font-medium border border-blue-100 flex flex-col gap-2 shadow-sm">
                                <div className="flex items-center gap-2 font-bold text-blue-900"><span className="text-lg">💡</span> 고급 교정 가이드</div>
                                <ul className="list-disc pl-8 space-y-1">
                                    <li><b>과녁(🎯) 버튼</b>: 클릭 후 좌측 이미지에서 숫자를 마우스로 드래그하면 그 영역만 다시 정밀하게 읽어옵니다.</li>
                                    <li><b>마우스 오버</b>: 입력 폼 위에 마우스를 올리면 좌측 이미지에서 해당 값이 어디에 있는지 빨간색 박스로 표시해 줍니다.</li>
                                    <li><b>재인식(🔄) 버튼</b>: 지정된 박스가 있다면 클릭 한 번으로 그 영역만 다시 스캔합니다.</li>
                                </ul>
                            </div>

                            {/* Grouping Fields */}
                            {['INFO', 'HRV', 'EEG'].map(groupName => {
                                const groupFields = fields.map((f, i) => ({ ...f, originalIndex: i })).filter(f => f.group === groupName);
                                if (groupFields.length === 0) return null;

                                return (
                                    <div key={groupName} className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
                                            <div className={`w-2 h-5 rounded-full ${groupName === 'INFO' ? 'bg-slate-500' : groupName === 'HRV' ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>
                                            <h3 className="font-extrabold text-slate-800 text-lg tracking-tight">
                                                {groupName === 'INFO' ? '기본 정보' : groupName === 'HRV' ? '자율신경 (HRV) 지표' : '뇌파 (EEG) 지표'}
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            {groupFields.map((field) => (
                                                <div 
                                                    key={field.originalIndex} 
                                                    className={`p-3 rounded-xl border transition-colors ${mappingFieldIdx === field.originalIndex ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
                                                    onMouseEnter={() => setHoveredField(field)}
                                                    onMouseLeave={() => setHoveredField(null)}
                                                >
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <label className="text-xs font-bold text-slate-500">{field.key}</label>
                                                        <div className="flex items-center gap-1">
                                                            {field.boundingBox && field.boundingBox[2] > 0 && (
                                                                <button onClick={() => handleRescan(field.originalIndex)} className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded hover:bg-slate-300 transition" title="지정된 영역 원클릭 재인식">🔄</button>
                                                            )}
                                                            <button 
                                                                onClick={() => setMappingFieldIdx(mappingFieldIdx === field.originalIndex ? null : field.originalIndex)}
                                                                className={`text-[10px] px-1.5 py-0.5 rounded transition font-bold ${mappingFieldIdx === field.originalIndex ? 'bg-indigo-600 text-white shadow-sm' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'}`}
                                                                title="드래그 앤 드롭 영역 지정 모드"
                                                            >
                                                                {mappingFieldIdx === field.originalIndex ? '매핑중...' : '🎯 영역매핑'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {field.key === '성별' ? (
                                                        <select
                                                            value={field.value}
                                                            onChange={(e) => handleFieldChange(field.originalIndex, e.target.value)}
                                                            className={`w-full p-2 bg-white border ${field.confidence === 0 ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'} rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200`}
                                                        >
                                                            <option value="">선택</option>
                                                            <option value="남성">남성</option>
                                                            <option value="여성">여성</option>
                                                        </select>
                                                    ) : field.key === 'APG 유형' ? (
                                                        <select
                                                            value={field.value}
                                                            onChange={(e) => handleFieldChange(field.originalIndex, e.target.value)}
                                                            className={`w-full p-2 bg-white border ${field.confidence === 0 ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'} rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200`}
                                                        >
                                                            <option value="">선택</option>
                                                            {[1, 2, 3, 4, 5, 6, 7].map(lvl => (
                                                                <option key={lvl} value={`Level ${lvl}`}>Level {lvl}</option>
                                                            ))}
                                                        </select>
                                                    ) : ['두뇌스트레스', '집중도', '주의도'].includes(field.key) ? (
                                                        <select
                                                            value={field.value}
                                                            onChange={(e) => handleFieldChange(field.originalIndex, e.target.value)}
                                                            className={`w-full p-2 bg-white border ${field.confidence === 0 ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'} rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200`}
                                                        >
                                                            <option value="">선택</option>
                                                            {['매우 높음', '높음', '적정', '낮음', '매우 낮음'].map(opt => (
                                                                <option key={opt} value={opt}>{opt}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <input
                                                            type={field.type === 'number' ? 'number' : 'text'}
                                                            step={field.type === 'number' ? 'any' : undefined}
                                                            value={field.value}
                                                            onChange={(e) => handleFieldChange(field.originalIndex, field.type === 'number' ? (e.target.value ? parseFloat(e.target.value) : '') : e.target.value)}
                                                            className={`w-full p-2 bg-white border ${field.confidence === 0 ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-200'} rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2`}
                                                        />
                                                    )}
                                                    {field.description && <p className="text-[10px] text-slate-400 mt-1 pl-1">{field.description}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
