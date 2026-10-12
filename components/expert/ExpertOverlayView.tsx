import React, { useState, useEffect } from 'react';
import { CareType, type AssessmentResult, PredictionResult, RiskPrediction, TrendAnalysis, AIModelConfig } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { generatePrediction } from '../../services/predictionEngine';
import { unifiedSyncService as DatabaseService, db } from '../../services/unifiedSyncService';
import ConsultationHistoryModal from '../modals/ConsultationHistoryModal';
import { SelfCheckModal } from '../resources/SelfCheckModal';
import { DailyRoutineTracker } from '../resources/DailyRoutineTracker';
import { WorksheetModal } from '../resources/WorksheetModal';
import { SELF_CHECK_DATA, DAILY_ROUTINE_DATA, WORKSHEET_DATA } from '../../data/resourceContents';
import { openVisualCleanGuide } from '../guides/VisualCleanGuide';
import { openDigitalDetoxGuide } from '../guides/DigitalDetoxGuide';
import { openMicroGoalGuide } from '../guides/MicroGoalGuide';
import { openWorryDumpGuide } from '../guides/WorryDumpGuide';
import { openGroundingGuide } from '../guides/GroundingGuide';
import { openDetachGuide } from '../guides/DetachGuide';
import { openBoxBreathingGuide } from '../guides/BoxBreathingGuide';
import { AIAssistantPanel } from '../common/AIAssistantPanel';
import type { ExpertOverlayProps, GuideItem, StrategySection, RedFlag, ParentScript, SuccessIndicator, Resource, WeeklyPlan, CommonObjection, CareContent } from './expertTypes';
import { EXPERT_CONTENTS } from './expertContents';
import { RED_FLAGS } from './redFlags';
import { PARENT_SCRIPTS } from './parentScripts';
import { SUCCESS_INDICATORS } from './successIndicators';
import { RESOURCES } from './resources';
import { WEEKLY_PLANS } from './weeklyPlans';
import { COMMON_OBJECTIONS } from './commonObjections';

export const ExpertOverlay: React.FC<ExpertOverlayProps> = ({

    careType = CareType.HEALTHY,

    adrenalFatigueScore = 0,

    currentData,

    studentId,

    score = 0, // score 기본값 0

    aiModels,

    isOpen = false,

    onClose

}) => {

    const [panelWidth, setPanelWidth] = useState(700); // 동적 너비 조절

    const [isResizing, setIsResizing] = useState(false);

    const [activeTab, setActiveTab] = useState<'prestudy' | 'learning' | 'exercise' | 'redflags' | 'parentscripts' | 'kpi' | 'resources' | 'roadmap' | 'faq' | 'prediction' | 'history'>('prestudy');

    const [expandedItem, setExpandedItem] = useState<number | null>(null);

    // Guide mode: 'original' shows the primary careType, 'adrenal' shows Adrenal Recovery

    const [guideMode, setGuideMode] = useState<'original' | 'adrenal'>('original');

    // Copy success message state

    const [copySuccess, setCopySuccess] = useState<string | null>(null);

    // Prediction data

    const [predictionData, setPredictionData] = useState<PredictionResult | null>(null);

    const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);



    // Consultation Save State

    const [showConsultationModal, setShowConsultationModal] = useState(false);

    const [consultationNotes, setConsultationNotes] = useState('');

    const [studentResponse, setStudentResponse] = useState('');

    const [showConsultationHistory, setShowConsultationHistory] = useState(false);



    // Resource Modals State

    const [showSelfCheck, setShowSelfCheck] = useState(false);

    const [showRoutineTracker, setShowRoutineTracker] = useState(false);

    const [showWorksheet, setShowWorksheet] = useState(false);

    const [selectedResourceType, setSelectedResourceType] = useState<CareType | null>(null);



    // Determine if dual-mode is needed (adrenal >= 26 AND careType is not already ADRENAL)

    const showDualMode = adrenalFatigueScore >= 26 && careType !== CareType.ADRENAL;



    // Load prediction data when switching to prediction tab

    useEffect(() => {

        if (activeTab === 'prediction' && currentData) {

            setIsLoadingPrediction(true);



            // Load history from database - using the db method directly

            (async () => {

                try {

                    // Get recent history (last 100 records)

                    const recentHistory = await db.history.orderBy('date').reverse().limit(100).toArray();



                    // Filter history for current student if studentId is provided

                    const relevantHistory = studentId

                        ? recentHistory.filter(h => h.student.name === currentData?.student.name)

                        : recentHistory;



                    // Generate prediction

                    const prediction = generatePrediction(currentData, relevantHistory);

                    setPredictionData(prediction);

                } catch (err) {

                    console.error('Failed to load prediction data:', err);

                    setPredictionData(null);

                } finally {

                    setIsLoadingPrediction(false);

                }

            })();

        }

    }, [activeTab, currentData, studentId]);



    // Multi-select strategy print state

    const [selectedStrategies, setSelectedStrategies] = useState<{

        prestudy: number[];

        learning: number[];

        exercise: number[];

    }>({

        prestudy: [],

        learning: [],

        exercise: []

    });



    // Select content based on guideMode

    const effectiveCareType = (showDualMode && guideMode === 'adrenal') ? CareType.ADRENAL : careType;

    const content = EXPERT_CONTENTS[effectiveCareType] || EXPERT_CONTENTS[CareType.HEALTHY];



    useEffect(() => {

        if (currentData && currentData.completedExpertGuideItems && currentData.completedExpertGuideItems.length > 0) {

            const newSelected: { prestudy: number[], learning: number[], exercise: number[] } = { prestudy: [], learning: [], exercise: [] };

            (['prestudy', 'learning', 'exercise'] as const).forEach(tab => {

                if (content[tab] && content[tab].guides) {

                    content[tab].guides.forEach((g: any, idx: number) => {

                        if (currentData.completedExpertGuideItems!.includes(g.title)) {

                            newSelected[tab].push(idx);

                        }

                    });

                }

            });

            setSelectedStrategies(newSelected);

        }

    }, [currentData, content]);



    // Toggle strategy selection

    const toggleStrategySelection = (tab: 'prestudy' | 'learning' | 'exercise', index: number) => {

        setSelectedStrategies(prev => {

            const isSelected = prev[tab].includes(index);

            const newList = isSelected

                ? prev[tab].filter(i => i !== index)

                : [...prev[tab], index];

            

            // Sync with currentData for history saving

            if (currentData) {

                const itemTitle = content[tab].guides[index]?.title;

                if (itemTitle) {

                    const currentItems = currentData.completedExpertGuideItems || [];

                    if (isSelected) {

                        currentData.completedExpertGuideItems = currentItems.filter(t => t !== itemTitle);

                    } else {

                        currentData.completedExpertGuideItems = [...currentItems, itemTitle];

                    }

                }

            }



            return { ...prev, [tab]: newList };

        });

    };



    // Calculate total selected count

    const totalSelected = selectedStrategies.prestudy.length +

        selectedStrategies.learning.length +

        selectedStrategies.exercise.length;





    // Get Red Flags for current careType

    const currentRedFlags = RED_FLAGS[effectiveCareType] || RED_FLAGS[CareType.HEALTHY] || [];



    // Get Parent Scripts for current careType

    const currentParentScripts = PARENT_SCRIPTS[effectiveCareType] || PARENT_SCRIPTS[CareType.HEALTHY] || [];



    // Get Success Indicators (KPI) for current careType

    const currentSuccessIndicators = SUCCESS_INDICATORS[effectiveCareType] || SUCCESS_INDICATORS[CareType.HEALTHY] || [];



    // Get Resources for current careType

    const currentResources = RESOURCES[effectiveCareType] || RESOURCES[CareType.HEALTHY] || [];



    // Get Weekly Plan for current careType

    const currentWeeklyPlan = WEEKLY_PLANS[effectiveCareType] || WEEKLY_PLANS[CareType.HEALTHY];



    // Get Common Objections for current careType

    const currentObjections = COMMON_OBJECTIONS[effectiveCareType] || COMMON_OBJECTIONS[CareType.HEALTHY] || [];



    // Difficulty filter state

    const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

    const [sortByDifficulty, setSortByDifficulty] = useState(false);



    // Resize handler for panel width

    const handleMouseDown = (e: React.MouseEvent) => {

        e.preventDefault();

        setIsResizing(true);

    };



    useEffect(() => {

        const handleMouseMove = (e: MouseEvent) => {

            if (!isResizing) return;

            const newWidth = window.innerWidth - e.clientX;

            setPanelWidth(Math.max(400, Math.min(1200, newWidth))); // 400px ~ 1200px 범위

        };



        const handleMouseUp = () => {

            setIsResizing(false);

        };



        if (isResizing) {

            document.addEventListener('mousemove', handleMouseMove);

            document.addEventListener('mouseup', handleMouseUp);

        }



        return () => {

            document.removeEventListener('mousemove', handleMouseMove);

            document.removeEventListener('mouseup', handleMouseUp);

        };

    }, [isResizing]);



    const toggleExpand = (idx: number) => {

        setExpandedItem(expandedItem === idx ? null : idx);

    };



    // Get difficulty display text and color

    const getDifficultyDisplay = (difficulty?: 'easy' | 'medium' | 'hard') => {

        switch (difficulty) {

            case 'easy': return { text: '쉬움', color: 'bg-green-100 text-green-700 border-green-200', emoji: '🟢' };

            case 'medium': return { text: '보통', color: 'bg-amber-100 text-amber-700 border-amber-200', emoji: '🟡' };

            case 'hard': return { text: '어려움', color: 'bg-red-100 text-red-700 border-red-200', emoji: '🔴' };

            default: return { text: '미정', color: 'bg-slate-100 text-slate-500 border-slate-200', emoji: '⚪' };

        }

    };



    // Filter and sort guides by difficulty

    const getFilteredGuides = (guides: GuideItem[]) => {

        let filtered = [...guides];



        // Apply filter

        if (difficultyFilter !== 'all') {

            filtered = filtered.filter(g => g.difficulty === difficultyFilter);

        }



        // Apply sort (easy → medium → hard)

        if (sortByDifficulty) {

            const order = { 'easy': 0, 'medium': 1, 'hard': 2, undefined: 3 };

            filtered.sort((a, b) => (order[a.difficulty as keyof typeof order] ?? 3) - (order[b.difficulty as keyof typeof order] ?? 3));

        }



        return filtered;

    };



    // Copy to clipboard function

    const copyToClipboard = async (text: string, label: string) => {

        try {

            await navigator.clipboard.writeText(text);

            setCopySuccess(label);

            setTimeout(() => setCopySuccess(null), 2000);

        } catch (err) {

            console.error('Failed to copy:', err);

        }

    };



    // Print checklist function

    const printChecklist = () => {

        const careTypeName = {

            [CareType.HEALTHY]: '학습 밸런스',

            [CareType.SLEEP]: '수면 케어',

            [CareType.BURNOUT]: '번아웃 회복',

            [CareType.ANXIETY_TENSION]: '불안 완화',

            [CareType.STRESS_OVERLOAD]: '스트레스 해소',

            [CareType.LOW_ENERGY]: '무기력 극복',

            [CareType.DEPRESSION_AMOTIVATION]: '우울 회복',

            [CareType.ADRENAL]: '부신 회복',

            [CareType.BRAIN_FATIGUE]: '뇌 피로 회복',

            [CareType.HYPERSENSITIVE]: '과민감 컨트롤',

            [CareType.ATTENTION_DEFICIT]: '주의력 강화',

            [CareType.CONCENTRATION]: '집중력 강화',

            [CareType.CIRCULATION]: '혈류 순환'

        }[effectiveCareType] || '맞춤 케어';



        const today = new Date().toLocaleDateString('ko-KR', {

            year: 'numeric',

            month: 'long',

            day: 'numeric'

        });



        const selectedPrestudy = selectedStrategies.prestudy || [];

        const selectedLearning = selectedStrategies.learning || [];

        const selectedExercise = selectedStrategies.exercise || [];



        const easyTasks = (currentWeeklyPlan as any)?.weeks?.[0]?.tasks?.easy || [];

        const weeklyTasks = (currentWeeklyPlan as any)?.weeks?.[0]?.tasks?.core || [];

        const priorityKPIs = (currentSuccessIndicators as any[])?.slice(0, 3).map(kpi => kpi.title) || [];



        const printContent = `

<!DOCTYPE html>

<html>

<head>

    <meta charset="UTF-8">

    <title>학습 케어 체크리스트</title>

    <style>

        @page { margin: 1.5cm; }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body { 

            font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; 

            font-size: 12pt;

            line-height: 1.6;

            color: #1a1a1a;

        }

        .header {

            text-align: center;

            border-bottom: 3px solid #4F46E5;

            padding-bottom: 15px;

            margin-bottom: 20px;

        }

        .header h1 {

            font-size: 22pt;

            color: #4F46E5;

            margin-bottom: 5px;

        }

        .header .subtitle {

            font-size: 14pt;

            color: #666;

        }

        .header .date {

            font-size: 10pt;

            color: #999;

            margin-top: 10px;

        }

        .section {

            margin-bottom: 25px;

            page-break-inside: avoid;

        }

        .section-title {

            font-size: 14pt;

            font-weight: bold;

            color: #4F46E5;

            border-left: 4px solid #4F46E5;

            padding-left: 10px;

            margin-bottom: 12px;

        }

        .checklist {

            list-style: none;

        }

        .checklist li {

            display: flex;

            align-items: flex-start;

            gap: 10px;

            margin-bottom: 10px;

            padding: 8px 12px;

            background: #F8F9FA;

            border-radius: 6px;

        }

        .checkbox {

            width: 18px;

            height: 18px;

            border: 2px solid #4F46E5;

            border-radius: 4px;

            flex-shrink: 0;

            margin-top: 2px;

        }

        .task-text {

            flex: 1;

        }

        .goal-box {

            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);

            color: white;

            padding: 15px;

            border-radius: 10px;

            text-align: center;

            margin-bottom: 20px;

        }

        .goal-box .label {

            font-size: 10pt;

            opacity: 0.9;

        }

        .goal-box .goal {

            font-size: 14pt;

            font-weight: bold;

            margin-top: 5px;

        }

        .note-box {

            border: 2px dashed #DDD;

            padding: 15px;

            border-radius: 8px;

            min-height: 80px;

        }

        .note-box .label {

            font-size: 10pt;

            color: #666;

            margin-bottom: 10px;

        }

        .footer {

            text-align: center;

            font-size: 9pt;

            color: #999;

            margin-top: 30px;

            padding-top: 15px;

            border-top: 1px solid #DDD;

        }

        .two-columns {

            display: flex;

            gap: 20px;

        }

        .two-columns > div {

            flex: 1;

        }

        @media print {

            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

        }

    </style>

</head>

<body>

    <div class="header">

        <h1>📋 ${careTypeName} 체크리스트</h1>

        <div class="subtitle">이번 주 실천 과제</div>

        <div class="date">작성일: ${today}</div>

    </div>



    <div class="goal-box">

        <div class="label">🎯 이번 주 목표</div>

        <div class="goal">${currentWeeklyPlan?.weeks[0]?.theme || '건강한 학습 습관 만들기'}</div>

    </div>



    <div class="two-columns">

        <div class="section">

            <div class="section-title">📚 학습 전략</div>

            <ul class="checklist">

                ${easyTasks.length > 0

                ? easyTasks.map(task => `

                        <li>

                            <div class="checkbox"></div>

                            <span class="task-text">${task}</span>

                        </li>

                    `).join('')

                : '<li><div class="checkbox"></div><span class="task-text">오늘의 목표 세우기</span></li>'

            }

            </ul>

        </div>



        <div class="section">

            <div class="section-title">✅ 일일 과제</div>

            <ul class="checklist">

                ${weeklyTasks.map(task => `

                    <li>

                        <div class="checkbox"></div>

                        <span class="task-text">${task}</span>

                    </li>

                `).join('')}

            </ul>

        </div>

    </div>



    ${priorityKPIs.length > 0 ? `

    <div class="section">

        <div class="section-title">📊 성공 지표</div>

        <ul class="checklist">

            ${priorityKPIs.map(kpi => `

                <li>

                    <div class="checkbox"></div>

                    <span class="task-text">${kpi}</span>

                </li>

            `).join('')}

        </ul>

    </div>

    ` : ''}



    <div class="section">

        <div class="section-title">📝 메모 / 다음 상담 시 확인 사항</div>

        <div class="note-box">

            <div class="label">여기에 메모하세요:</div>

        </div>

    </div>



    <div class="footer">

        Mind-Body Connect 학습 케어 시스템 | 다음 상담 때 이 체크리스트를 가져오세요!

    </div>

</body>

</html>

        `;



        const printWindow = window.open('', '_blank', 'width=800,height=600');

        if (printWindow) {

            printWindow.document.write(printContent);

            printWindow.document.close();

            printWindow.focus();

            setTimeout(() => {

                printWindow.print();

            }, 250);

        }

    };







    // Print selected strategies function (Report-style format)

    const printSelectedStrategies = () => {

        const careTypeName = {

            [CareType.HEALTHY]: '학습 밸런스',

            [CareType.SLEEP]: '수면 케어',

            [CareType.BURNOUT]: '번아웃 회복',

            [CareType.ANXIETY_TENSION]: '불안 완화',

            [CareType.STRESS_OVERLOAD]: '스트레스 해소',

            [CareType.LOW_ENERGY]: '무기력 극복',

            [CareType.DEPRESSION_AMOTIVATION]: '우울 회복',

            [CareType.ADRENAL]: '부신 회복',

            [CareType.BRAIN_FATIGUE]: '뇌 피로 회복',

            [CareType.HYPERSENSITIVE]: '과민감 컨트롤',

            [CareType.ATTENTION_DEFICIT]: '주의력 강화',

            [CareType.CONCENTRATION]: '집중력 강화',

            [CareType.CIRCULATION]: '혈류 순환'

        }[effectiveCareType] || '맞춤 케어';



        const today = new Date().toLocaleDateString('ko-KR', {

            year: 'numeric',

            month: 'long',

            day: 'numeric'

        });



        // Collect selected strategies by section

        const sections = [

            {

                key: 'prestudy',

                title: '⚡ 시작전 루틴',

                indices: selectedStrategies.prestudy,

                guides: content.prestudy.guides

            },

            {

                key: 'learning',

                title: '🧠 학습 중 전략 (Study Strategy)',

                indices: selectedStrategies.learning,

                guides: content.learning.guides

            },

            {

                key: 'exercise',

                title: '🏃 신체 활동 가이드 (Exercise Guide)',

                indices: selectedStrategies.exercise,

                guides: content.exercise.guides

            }

        ];



        // Generate HTML for sections

        const headerHTML = `

            <div class="page-header">

                <div class="flex flex-col md:flex-row justify-between items-start border-b-2 border-slate-200 pb-4 mb-6">

                    <div>

                        <div class="text-blue-700 font-bold text-xs tracking-widest uppercase">Neuro-Bio Academic Strategy System</div>

                        <h1 class="text-3xl font-black text-slate-800">전문가 가이드</h1>

                        <p class="text-slate-500 text-sm italic">선택한 학습 전략 - ${careTypeName}</p>

                    </div>

                    <div class="mt-2 md:mt-0 text-right">

                        <div class="inline-block bg-slate-100 px-3 py-1 rounded text-xs font-mono text-slate-600 mb-1">${careTypeName}</div>

                        <div class="text-xs font-medium text-slate-600">작성일: ${today}</div>

                    </div>

                </div>

            </div>

        `;



        let sectionsHTML = '';

        let strategyCount = 0;



        sections.filter(section => section.indices.length > 0).forEach((section, sectionIdx) => {

            // Add page break and header only between sections (not each strategy)

            if (sectionIdx > 0) {

                sectionsHTML += `

                    <div class="page-break"></div>

                    ${headerHTML}

                `;

            }



            section.indices.forEach((idx, strategyNum) => {

                const guide = section.guides[idx];

                const difficulty = getDifficultyDisplay(guide.difficulty);



                sectionsHTML += `

                    <div class="strategy-page mb-4">

                        <h2 class="text-base font-bold flex items-center mb-3 text-slate-700">

                            <span class="w-2 h-4 bg-blue-600 mr-2"></span>

                            ${section.title}

                        </h2>

                        

                        <div class="bg-white border-2 border-slate-200 rounded-xl p-4 shadow-sm">

                            <div class="flex justify-between items-start mb-3 pb-2 border-b-2 border-slate-100">

                                <h3 class="text-base font-bold text-slate-800">${strategyNum + 1}. ${guide.title}</h3>

                                <span class="px-2 py-1 text-xs font-bold rounded-full ${difficulty.color}">

                                    ${difficulty.emoji} ${difficulty.text}

                                </span>

                            </div>

                            

                            <div class="mb-3">

                                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">전문가 설명</p>

                                <p class="text-xs text-slate-700 leading-relaxed">${guide.expertDesc}</p>

                            </div>

                            

                            <div class="mb-3">

                                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">과학적 근거</p>

                                <div class="bg-amber-50 border-l-4 border-amber-500 p-2 rounded text-xs text-amber-900 leading-relaxed">

                                    ${guide.rationale}

                                </div>

                            </div>

                            

                            <div class="mb-3">

                                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">상담사 가이드</p>

                                <div class="bg-indigo-50 border-l-4 border-indigo-600 p-2 rounded text-xs font-semibold text-indigo-900 leading-relaxed">

                                    ${guide.managerGuide}

                                </div>

                            </div>

                            

                            <div>

                                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">실천 방법</p>

                                <div class="bg-emerald-50 border-l-4 border-emerald-500 p-2 rounded flex gap-2 items-start">

                                    <span class="text-emerald-600 text-lg font-bold flex-shrink-0">✓</span>

                                    <p class="text-xs text-emerald-900 leading-relaxed">${guide.action}</p>

                                </div>

                            </div>

                        </div>

                    </div>

                `;



                strategyCount++;

            });

        });



        // Basic print styles to reset page (Same as Medical Report)

        const printStyle = `

            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Roboto+Mono&display=swap');

            @page { 

                size: A4; 

                margin: 15mm 10mm;

            }

            body { 

                margin: 0; 

                padding: 0; 

                background: #f1f5f9; 

                -webkit-print-color-adjust: exact !important; 

                print-color-adjust: exact !important; 

            }

            

            /* Repeating Header on Every Page */

            .page-header {

                display: none;

            }

            

            @media print {

                .page-header {

                    display: block;

                    position: running(header);

                }

                

                @page {

                    @top-center {

                        content: element(header);

                    }

                }

                

                /* Alternative: Use table header approach for better browser support */

                thead { display: table-header-group; }

                tfoot { display: table-footer-group; }

            }

        `;



        // Gather Tailwind styles from current document (Same as Medical Report)

        const tailwindStyles = Array.from(document.styleSheets)

            .map(styleSheet => {

                try {

                    return Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('');

                } catch (e) {

                    return '';

                }

            }).join('');



        const printWindow = window.open('', '_blank', 'width=1200,height=900');

        if (printWindow) {

            printWindow.document.write(`

    <!DOCTYPE html>

    <html lang="ko">

      <head>

        <title>전문가 가이드 - 선택한 학습 전략 - ${careTypeName}</title>

        <script src="https://cdn.tailwindcss.com"></script>

        <style>

          ${tailwindStyles}

          ${printStyle}

          .no-print { display: none !important; }

          body { overflow-y: auto; }

          

          /* Page break styling */

          .page-break {

              page-break-before: always;

              break-before: page;

              height: 0;

              margin: 0;

              padding: 0;

          }

          

          .strategy-page {

              page-break-inside: avoid;

          }

          

          @media print {

              .floating-print-btn { display: none; }

              body { -webkit-print-color-adjust: exact; }

              

              .page-break {

                  page-break-before: always !important;

                  break-before: page !important;

                  display: block;

                  height: 0 !important;

              }

              

              .page-header {

                  page-break-after: avoid !important;

              }

              

              .strategy-page {

                  page-break-inside: avoid !important;

              }

          }

          

          .floating-print-btn {

            position: fixed; top: 20px; right: 20px;

            background: #1e293b; color: white; padding: 12px 24px;

            border-radius: 9999px; font-weight: bold; cursor: pointer;

            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border: none; z-index: 1000;

            transition: all 0.2s;

          }

          .floating-print-btn:hover { transform: scale(1.05); background: #0f172a; }

        </style>

      </head>

      <body>

        <button class="floating-print-btn" onclick="window.print()">🖨️ 인쇄 / PDF 저장</button>

        

        <div class="max-w-[210mm] mx-auto p-10 bg-white my-8 rounded-lg shadow-2xl border-t-8 border-blue-700">

          <!-- First page header -->

          ${headerHTML}

          

          <!-- All strategies with headers repeated on new pages -->

          ${sectionsHTML}

          

          <!-- Footer -->

          <div class="mt-10 pt-6 border-t border-slate-200 flex justify-between text-[10px] text-slate-400 font-medium no-print">

            <p>© 2026 Mind-Body Connect. All strategies are evidence-based.</p>

            <p class="uppercase tracking-widest">LEARNING STRATEGY GUIDE</p>

          </div>

        </div>

      </body>

    </html>

  `);

            printWindow.document.close();

            printWindow.focus();

        }

    };



    return (

        <>

            {/* Sidebar Overlay (Expanded Width for detailed content) */}

            {isOpen && (

                <div

                    style={{ width: `${panelWidth}px` }}

                    className="fixed inset-y-0 right-0 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col border-l border-slate-200 print:hidden"

                >

                    {/* Resize Handle */}

                    <div

                        onMouseDown={handleMouseDown}

                        className={`absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-indigo-400 transition-colors ${isResizing ? 'bg-indigo-500' : 'bg-transparent hover:bg-indigo-200'}`}

                        title="드래그하여 너비 조절"

                    />

                    {/* Header */}

                    <div className="p-5 bg-slate-900 text-white flex justify-between items-center shadow-md shrink-0">

                        <div>

                            <div className="flex items-center gap-2 mb-1">

                                <span className={`w-2 h-2 rounded-full ${careType === CareType.SLEEP ? 'bg-indigo-400' : 'bg-emerald-400'}`}></span>

                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Consultant Scripter</p>

                            </div>

                            <h3 className="font-bold text-xl">{

                                {

                                    [CareType.SLEEP]: '수면 부족 케어 가이드',

                                    [CareType.BURNOUT]: '번아웃 회복 솔루션',

                                    [CareType.CONCENTRATION]: '초몰입 집중 전략',

                                    [CareType.CIRCULATION]: '뇌 혈류 순환 솔루션',

                                    [CareType.HEALTHY]: '학습 밸런스 가이드',

                                    [CareType.ADRENAL]: '부신 기능 회복 가이드',

                                    [CareType.ANXIETY_TENSION]: '불안-긴장 완화 가이드',

                                    [CareType.STRESS_OVERLOAD]: '스트레스 과부하 해소',

                                    [CareType.LOW_ENERGY]: '무기력 극복 솔루션',

                                    [CareType.DEPRESSION_AMOTIVATION]: '우울-무동기 회복',

                                    [CareType.BRAIN_FATIGUE]: '뇌 피로 회복 가이드',

                                    [CareType.HYPERSENSITIVE]: '과민감 학습 컨트롤',

                                    [CareType.ATTENTION_DEFICIT]: '주의력 집중 강화'

                                }[effectiveCareType] || '학습 밸런스 가이드'

                            }</h3>

                        </div>

                        <div className="flex items-center gap-2">

                            <button

                                onClick={printChecklist}

                                className="text-slate-400 hover:text-white transition-colors p-2 flex items-center gap-1"

                                title="체크리스트 인쇄"

                            >

                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">

                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />

                                </svg>

                            </button>

                            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2">

                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>

                            </button>

                        </div>

                    </div>



                    {/* Previous Prescription Banner */}

                    {currentData?.previousResult?.completedExpertGuideItems && currentData.previousResult.completedExpertGuideItems.length > 0 && (

                        <div className="bg-blue-50 border-b border-blue-200 p-3 shrink-0 flex items-center justify-between">

                            <p className="text-xs font-bold text-blue-800 flex items-center gap-2">

                                <span>💡 이전 처방 전략이 있습니다 ({currentData.previousResult.completedExpertGuideItems.length}개)</span>

                            </p>

                            <span className="text-[10px] text-blue-600">체크리스트의 [이전 처방] 뱃지를 확인하세요.</span>

                        </div>

                    )}



                    {/* Dual-Mode Switcher (Original CareType vs Adrenal) */}

                    {showDualMode && (

                        <div className="flex border-b-2 border-slate-300 shrink-0 bg-gradient-to-r from-slate-100 to-slate-50">

                            <button

                                onClick={() => { setGuideMode('original'); setActiveTab('prestudy'); setExpandedItem(null); }}

                                className={`flex-1 py-3 text-xs font-black text-center transition-all ${guideMode === 'original' ? 'bg-white text-slate-800 shadow-sm border-b-2 border-slate-800' : 'text-slate-400 hover:text-slate-600'}`}

                            >

                                📋 {{

                                    [CareType.SLEEP]: '수면 케어',

                                    [CareType.BURNOUT]: '번아웃 회복',

                                    [CareType.CONCENTRATION]: '집중력 강화',

                                    [CareType.CIRCULATION]: '혈류 순환',

                                    [CareType.HEALTHY]: '밸런스 가이드',

                                    [CareType.ADRENAL]: '부신 회복',

                                    [CareType.ANXIETY_TENSION]: '불안 완화',

                                    [CareType.STRESS_OVERLOAD]: '스트레스 해소',

                                    [CareType.LOW_ENERGY]: '무기력 극복',

                                    [CareType.DEPRESSION_AMOTIVATION]: '우울 회복',

                                    [CareType.BRAIN_FATIGUE]: '뇌 피로 회복',

                                    [CareType.HYPERSENSITIVE]: '과민감 컨트롤',

                                    [CareType.ATTENTION_DEFICIT]: '주의력 강화'

                                }[careType] || '기본 가이드'}

                            </button>

                            <button

                                onClick={() => { setGuideMode('adrenal'); setActiveTab('prestudy'); setExpandedItem(null); }}

                                className={`flex-1 py-3 text-xs font-black text-center transition-all ${guideMode === 'adrenal' ? 'bg-amber-50 text-amber-700 shadow-sm border-b-2 border-amber-500' : 'text-slate-400 hover:text-slate-600'}`}

                            >

                                ⚡ 부신 회복 가이드

                            </button>

                        </div>

                    )}



                    {/* Sub-menu Tabs (3x3 Grouped Grid) */}

                    <div className="bg-white border-b border-slate-200 shrink-0">

                        {/* Group 1: Student Strategy */}

                        <div className="px-3 pt-3 flex items-center gap-1.5 overflow-hidden">

                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter whitespace-nowrap bg-slate-100 px-1.5 py-0.5 rounded">Strategy</span>

                            <div className="h-[1px] bg-slate-100 flex-1"></div>

                        </div>

                        <div className="grid grid-cols-3 p-2 gap-1">

                            <button

                                onClick={() => { setActiveTab('prestudy'); setExpandedItem(null); }}

                                className={`py-2 text-[12px] font-bold text-center rounded-lg transition-all ${activeTab === 'prestudy' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}

                            >

                                ⚡ 시작 전

                            </button>

                            <button

                                onClick={() => { setActiveTab('learning'); setExpandedItem(null); }}

                                className={`py-2 text-[12px] font-bold text-center rounded-lg transition-all ${activeTab === 'learning' ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}

                            >

                                🧠 학습 중

                            </button>

                            <button

                                onClick={() => { setActiveTab('exercise'); setExpandedItem(null); }}

                                className={`py-2 text-[12px] font-bold text-center rounded-lg transition-all ${activeTab === 'exercise' ? 'bg-orange-600 text-white shadow-md shadow-orange-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}

                            >

                                🏃 신체

                            </button>

                        </div>



                        {/* Group 2: Management Tools */}

                        <div className="px-3 pt-1 flex items-center gap-1.5">

                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter whitespace-nowrap bg-slate-100 px-1.5 py-0.5 rounded">Management</span>

                            <div className="h-[1px] bg-slate-100 flex-1"></div>

                        </div>

                        <div className="grid grid-cols-3 p-2 gap-1">

                            <button

                                onClick={() => { setActiveTab('roadmap'); setExpandedItem(null); }}

                                className={`py-2 text-[12px] font-bold text-center rounded-lg transition-all ${activeTab === 'roadmap' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}

                            >

                                📅 로드맵

                            </button>

                            <button

                                onClick={() => { setActiveTab('resources'); setExpandedItem(null); }}

                                className={`py-2 text-[12px] font-bold text-center rounded-lg transition-all ${activeTab === 'resources' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}

                            >

                                📚 자료

                            </button>

                            <button

                                onClick={() => { setActiveTab('kpi'); setExpandedItem(null); }}

                                className={`py-2 text-[12px] font-bold text-center rounded-lg transition-all ${activeTab === 'kpi' ? 'bg-teal-600 text-white shadow-md shadow-teal-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}

                            >

                                📊 KPI

                            </button>

                        </div>



                        {/* Group 3: Counseling Support */}

                        <div className="px-3 pt-1 flex items-center gap-1.5">

                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter whitespace-nowrap bg-slate-100 px-1.5 py-0.5 rounded">Counseling</span>

                            <div className="h-[1px] bg-slate-100 flex-1"></div>

                        </div>

                        <div className="grid grid-cols-4 p-2 gap-1 mb-2">

                            <button

                                onClick={() => { setActiveTab('faq'); setExpandedItem(null); }}

                                className={`py-2 text-[12px] font-bold text-center rounded-lg transition-all ${activeTab === 'faq' ? 'bg-rose-600 text-white shadow-md shadow-rose-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>

                                💬 대응

                            </button>

                            <button

                                onClick={() => { setActiveTab('parentscripts'); setExpandedItem(null); }}

                                className={`py-2 text-[12px] font-bold text-center rounded-lg transition-all ${activeTab === 'parentscripts' ? 'bg-purple-600 text-white shadow-md shadow-purple-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}

                            >

                                👪 학부모

                            </button>

                            <button

                                onClick={() => { setActiveTab('redflags'); setExpandedItem(null); }}

                                className={`py-2 text-[12px] font-bold text-center rounded-lg transition-all ${activeTab === 'redflags' ? 'bg-red-600 text-white shadow-md shadow-red-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}

                            >

                                🚨 위험신호

                            </button>

                            <button

                                onClick={() => { setActiveTab('prediction'); setExpandedItem(null); }}

                                className={`py-2 text-[12px] font-bold text-center rounded-lg transition-all ${activeTab === 'prediction' ? 'bg-violet-600 text-white shadow-md shadow-violet-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}

                                disabled={!currentData}

                                title={!currentData ? '진단 데이터가 필요합니다' : ''}

                            >

                                📊 예측

                            </button>

                            <button

                                onClick={() => { setActiveTab('history'); setExpandedItem(null); }}

                                className={`py-2 text-[12px] font-bold text-center rounded-lg transition-all ${activeTab === 'history' ? 'bg-gray-600 text-white shadow-md shadow-gray-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}

                            >

                                🕒 기록

                            </button>

                        </div>

                    </div>



                    {/* Content Area */}

                    <div className="flex-1 overflow-y-auto bg-slate-50/50 custom-scrollbar">

                        <div className="p-6 pb-20 animate-in fade-in slide-in-from-right-4 duration-300">

                            {/* History Content */}

                            {activeTab === 'history' ? (

                                <ConsultationHistoryModal

                                    studentId={studentId || ''}

                                    isOpen={true} // Always open when tab is active

                                    onClose={() => setActiveTab('prestudy')} // Switch tab on close

                                    currentAssessment={currentData}

                                />

                            ) : activeTab === 'redflags' ? (

                                <>

                                    <div className="mb-6">

                                        <h4 className="font-black text-2xl mb-2 text-red-800">

                                            🚨 위험 신호 (Red Flags)

                                        </h4>

                                        <p className="text-sm text-slate-600 leading-relaxed border-l-4 border-red-300 pl-3 italic">

                                            아래 증상이 관찰될 경우 즉시 조치가 필요합니다. 위험 수준에 따라 적절한 전문기관에 연계하십시오.

                                        </p>

                                    </div>



                                    {/* Emergency Contact Info */}

                                    <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4">

                                        <h5 className="font-bold text-red-800 text-sm mb-2">📞 긴급 연락처</h5>

                                        <div className="grid grid-cols-2 gap-2 text-xs">

                                            <div className="bg-white p-2 rounded-lg">

                                                <span className="font-bold text-red-700">자살예방상담전화:</span>

                                                <span className="ml-1 font-mono">1393</span>

                                            </div>

                                            <div className="bg-white p-2 rounded-lg">

                                                <span className="font-bold text-red-700">청소년상담:</span>

                                                <span className="ml-1 font-mono">1388</span>

                                            </div>

                                            <div className="bg-white p-2 rounded-lg">

                                                <span className="font-bold text-red-700">정신건강위기:</span>

                                                <span className="ml-1 font-mono">1577-0199</span>

                                            </div>

                                            <div className="bg-white p-2 rounded-lg">

                                                <span className="font-bold text-red-700">학교폭력신고:</span>

                                                <span className="ml-1 font-mono">117</span>

                                            </div>

                                        </div>

                                    </div>



                                    {/* Red Flags List */}

                                    <div className="space-y-4">

                                        {currentRedFlags.map((flag, idx) => (

                                            <div

                                                key={idx}

                                                className={`rounded-xl border-2 overflow-hidden transition-all duration-300 ${flag.severity === 'emergency'

                                                    ? 'border-red-400 bg-red-50'

                                                    : flag.severity === 'critical'

                                                        ? 'border-orange-400 bg-orange-50'

                                                        : 'border-amber-400 bg-amber-50'

                                                    }`}

                                            >

                                                {/* Severity Header */}

                                                <div className={`px-4 py-2 flex items-center gap-2 ${flag.severity === 'emergency'

                                                    ? 'bg-red-500 text-white'

                                                    : flag.severity === 'critical'

                                                        ? 'bg-orange-500 text-white'

                                                        : 'bg-amber-500 text-white'

                                                    }`}>

                                                    <span className="text-lg">

                                                        {flag.severity === 'emergency' ? '🆘' : flag.severity === 'critical' ? '⚠️' : '⚡'}

                                                    </span>

                                                    <span className="font-bold text-sm uppercase tracking-wider">

                                                        {flag.severity === 'emergency' ? '긴급 (EMERGENCY)' : flag.severity === 'critical' ? '위험 (CRITICAL)' : '주의 (WARNING)'}

                                                    </span>

                                                </div>



                                                {/* Content */}

                                                <div className="p-4 space-y-3">

                                                    {/* Condition */}

                                                    <div>

                                                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">증상/조건</p>

                                                        <p className={`text-sm font-bold leading-relaxed ${flag.severity === 'emergency' ? 'text-red-800' : flag.severity === 'critical' ? 'text-orange-800' : 'text-amber-800'

                                                            }`}>

                                                            {flag.condition}

                                                        </p>

                                                    </div>



                                                    {/* Action */}

                                                    <div>

                                                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">조치 사항</p>

                                                        <div className={`p-3 rounded-lg ${flag.severity === 'emergency' ? 'bg-red-100' : flag.severity === 'critical' ? 'bg-orange-100' : 'bg-amber-100'

                                                            }`}>

                                                            <p className="text-sm text-slate-800 font-medium">

                                                                {flag.action}

                                                            </p>

                                                        </div>

                                                    </div>



                                                    {/* Referral */}

                                                    {flag.referral && (

                                                        <div>

                                                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">연계 기관</p>

                                                            <div className="flex items-center gap-2">

                                                                <span className="text-lg">🏥</span>

                                                                <span className="text-sm font-bold text-slate-700">{flag.referral}</span>

                                                            </div>

                                                        </div>

                                                    )}

                                                </div>

                                            </div>

                                        ))}



                                        {/* If no red flags */}

                                        {currentRedFlags.length === 0 && (

                                            <div className="text-center py-12 text-slate-400">

                                                <span className="text-4xl">✅</span>

                                                <p className="mt-2 font-bold">현재 유형에 대한 특별 위험 신호가 없습니다.</p>

                                            </div>

                                        )}

                                    </div>



                                    {/* General Warning */}

                                    <div className="mt-6 bg-slate-100 border border-slate-200 rounded-xl p-4">

                                        <h5 className="font-bold text-slate-700 text-sm mb-2">💡 상담사 유의사항</h5>

                                        <ul className="text-xs text-slate-600 space-y-1">

                                            <li>• 위험 신호 발견 시 반드시 기록을 남기고 관리자에게 보고하십시오.</li>

                                            <li>• 학생의 동의 없이도 생명이 위험한 경우 보호자 연락이 가능합니다.</li>

                                            <li>• 자해/자살 언급 시 절대 혼자 두지 마시고 즉시 전문 도움을 요청하십시오.</li>

                                            <li>• 모든 상담 내용은 비밀 보장 원칙을 따르되, 생명 위험 상황은 예외입니다.</li>

                                        </ul>

                                    </div>

                                </>

                            ) : activeTab === 'parentscripts' ? (

                                /* Parent Scripts Content */

                                <>

                                    <div className="mb-6">

                                        <h4 className="font-black text-2xl mb-2 text-purple-800">

                                            👪 학부모 전달용 메시지

                                        </h4>

                                        <p className="text-sm text-slate-600 leading-relaxed border-l-4 border-purple-300 pl-3 italic">

                                            상담 후 학부모에게 전달할 맞춤형 메시지입니다. 복사 버튼을 눌러 카톡/문자/이메일로 전송하세요.

                                        </p>

                                    </div>



                                    {/* Copy Success Toast */}

                                    {copySuccess && (

                                        <div className="fixed top-4 right-4 z-[60] bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">

                                            ✅ "{copySuccess}" 복사 완료!

                                        </div>

                                    )}



                                    {/* Message Templates */}

                                    <div className="space-y-6">

                                        {currentParentScripts.map((script, idx) => (

                                            <div key={idx} className="bg-white rounded-xl border-2 border-purple-100 shadow-sm overflow-hidden">

                                                {/* Category Header */}

                                                <div className="bg-purple-50 px-4 py-3 flex items-center gap-2 border-b border-purple-100">

                                                    <span className="text-2xl">{script.icon}</span>

                                                    <span className="font-bold text-purple-800">{script.category}</span>

                                                </div>



                                                <div className="p-4 space-y-4">

                                                    {/* Short Message (카톡용) */}

                                                    <div>

                                                        <div className="flex items-center justify-between mb-2">

                                                            <p className="text-[10px] font-bold text-purple-500 uppercase flex items-center gap-1">

                                                                💬 짧은 메시지 (카톡/문자용)

                                                            </p>

                                                            <button

                                                                onClick={() => copyToClipboard(script.shortMessage, script.category + ' 짧은 메시지')}

                                                                className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-1 rounded-lg transition-colors font-bold"

                                                            >

                                                                📋 복사

                                                            </button>

                                                        </div>

                                                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">

                                                            <p className="text-sm text-purple-900 leading-relaxed font-medium">

                                                                {script.shortMessage}

                                                            </p>

                                                        </div>

                                                    </div>



                                                    {/* Detailed Message (이메일용) */}

                                                    <div>

                                                        <div className="flex items-center justify-between mb-2">

                                                            <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">

                                                                📧 상세 메시지 (이메일용)

                                                            </p>

                                                            <button

                                                                onClick={() => copyToClipboard(script.detailedMessage, script.category + ' 상세 메시지')}

                                                                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg transition-colors font-bold"

                                                            >

                                                                📋 복사

                                                            </button>

                                                        </div>

                                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">

                                                            <p className="text-sm text-slate-700 leading-relaxed">

                                                                {script.detailedMessage}

                                                            </p>

                                                        </div>

                                                    </div>



                                                    {/* Tips */}

                                                    <div>

                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">

                                                            ✅ 실천 팁 (학부모 전달용)

                                                        </p>

                                                        <div className="flex flex-wrap gap-2">

                                                            {script.tips.map((tip, tipIdx) => (

                                                                <span

                                                                    key={tipIdx}

                                                                    className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-100"

                                                                >

                                                                    {tip}

                                                                </span>

                                                            ))}

                                                        </div>

                                                    </div>



                                                    {/* Copy All Button */}

                                                    <button

                                                        onClick={() => copyToClipboard(

                                                            `[${script.category}]\n\n${script.detailedMessage}\n\n📌 실천 팁:\n${script.tips.map(t => '• ' + t).join('\n')}`,

                                                            script.category + ' 전체'

                                                        )}

                                                        className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors text-sm"

                                                    >

                                                        📋 전체 메시지 복사

                                                    </button>

                                                </div>

                                            </div>

                                        ))}

                                    </div>



                                    {/* Quick Message Generator */}

                                    <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">

                                        <h5 className="font-bold text-purple-800 text-sm mb-3">📱 빠른 전송 가이드</h5>

                                        <div className="grid grid-cols-2 gap-3 text-xs">

                                            <div className="bg-white p-3 rounded-lg border border-purple-100">

                                                <p className="font-bold text-purple-700 mb-1">카카오톡</p>

                                                <p className="text-slate-600">짧은 메시지를 복사하여 전송</p>

                                            </div>

                                            <div className="bg-white p-3 rounded-lg border border-purple-100">

                                                <p className="font-bold text-purple-700 mb-1">문자/SMS</p>

                                                <p className="text-slate-600">짧은 메시지 + 핵심 팁 1개</p>

                                            </div>

                                            <div className="bg-white p-3 rounded-lg border border-purple-100">

                                                <p className="font-bold text-purple-700 mb-1">이메일</p>

                                                <p className="text-slate-600">전체 메시지 복사하여 전송</p>

                                            </div>

                                            <div className="bg-white p-3 rounded-lg border border-purple-100">

                                                <p className="font-bold text-purple-700 mb-1">알림장</p>

                                                <p className="text-slate-600">실천 팁 위주로 전달</p>

                                            </div>

                                        </div>

                                    </div>

                                </>

                            ) : activeTab === 'kpi' ? (

                                /* KPI / Success Indicators Content */

                                <>

                                    <div className="mb-6">

                                        <h4 className="font-black text-2xl mb-2 text-teal-800">

                                            📊 성공 지표 (KPI)

                                        </h4>

                                        <p className="text-sm text-slate-600 leading-relaxed border-l-4 border-teal-300 pl-3 italic">

                                            다음 상담 시 확인할 객관적 측정 기준입니다. 우선순위가 높은 항목부터 체크하세요.

                                        </p>

                                    </div>



                                    {/* Priority Legend */}

                                    <div className="mb-4 flex gap-3">

                                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-bold">🔴 높음</span>

                                        <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-bold">🟡 중간</span>

                                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-bold">🟢 낮음</span>

                                    </div>



                                    {/* KPI Cards */}

                                    <div className="space-y-4">

                                        {currentSuccessIndicators

                                            .sort((a, b) => {

                                                const priorityOrder = { high: 0, medium: 1, low: 2 };

                                                return priorityOrder[a.priority] - priorityOrder[b.priority];

                                            })

                                            .map((kpi, idx) => (

                                                <div

                                                    key={idx}

                                                    className={`bg-white rounded-xl border-2 overflow-hidden shadow-sm ${kpi.priority === 'high'

                                                        ? 'border-red-200'

                                                        : kpi.priority === 'medium'

                                                            ? 'border-amber-200'

                                                            : 'border-green-200'

                                                        }`}

                                                >

                                                    {/* Header */}

                                                    <div className={`px-4 py-3 flex items-center justify-between ${kpi.priority === 'high'

                                                        ? 'bg-red-50'

                                                        : kpi.priority === 'medium'

                                                            ? 'bg-amber-50'

                                                            : 'bg-green-50'

                                                        }`}>

                                                        <div className="flex items-center gap-2">

                                                            <span className="text-2xl">{kpi.icon}</span>

                                                            <span className="font-bold text-slate-800">{kpi.category}</span>

                                                        </div>

                                                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${kpi.priority === 'high'

                                                            ? 'bg-red-200 text-red-800'

                                                            : kpi.priority === 'medium'

                                                                ? 'bg-amber-200 text-amber-800'

                                                                : 'bg-green-200 text-green-800'

                                                            }`}>

                                                            {kpi.priority === 'high' ? '높음' : kpi.priority === 'medium' ? '중간' : '낮음'}

                                                        </span>

                                                    </div>



                                                    {/* Content */}

                                                    <div className="p-4 space-y-3">

                                                        {/* Indicator */}

                                                        <div>

                                                            <p className="text-[10px] font-bold text-teal-600 uppercase mb-1">📈 측정 지표</p>

                                                            <p className="text-sm font-bold text-slate-800">{kpi.indicator}</p>

                                                        </div>



                                                        {/* Target & Timeframe */}

                                                        <div className="grid grid-cols-2 gap-3">

                                                            <div className="bg-teal-50 p-3 rounded-lg">

                                                                <p className="text-[10px] font-bold text-teal-600 uppercase mb-1">🎯 목표값</p>

                                                                <p className="text-sm font-bold text-teal-800">{kpi.targetValue}</p>

                                                            </div>

                                                            <div className="bg-slate-50 p-3 rounded-lg">

                                                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">⏱️ 기간</p>

                                                                <p className="text-sm font-bold text-slate-700">{kpi.timeframe}</p>

                                                            </div>

                                                        </div>



                                                        {/* Measure Method */}

                                                        <div>

                                                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">📋 측정 방법</p>

                                                            <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">{kpi.measureMethod}</p>

                                                        </div>



                                                        {/* Check Button */}

                                                        <div className="flex items-center gap-2 pt-2">

                                                            <span className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer ${kpi.priority === 'high' ? 'border-red-400' : kpi.priority === 'medium' ? 'border-amber-400' : 'border-green-400'

                                                                }`}>

                                                            </span>

                                                            <span className="text-xs text-slate-500">다음 상담 시 확인</span>

                                                        </div>

                                                    </div>

                                                </div>

                                            ))}

                                    </div>



                                    {/* Copy Checklist */}

                                    <div className="mt-6">

                                        <button

                                            onClick={() => copyToClipboard(

                                                `📊 [${effectiveCareType}] 성공 지표 체크리스트\n\n${currentSuccessIndicators

                                                    .sort((a, b) => {

                                                        const priorityOrder = { high: 0, medium: 1, low: 2 };

                                                        return priorityOrder[a.priority] - priorityOrder[b.priority];

                                                    })

                                                    .map((kpi, i) => `${i + 1}. [${kpi.priority === 'high' ? '🔴' : kpi.priority === 'medium' ? '🟡' : '🟢'}] ${kpi.indicator}\n   목표: ${kpi.targetValue}\n   기간: ${kpi.timeframe}\n   측정: ${kpi.measureMethod}`)

                                                    .join('\n\n')}`,

                                                'KPI 체크리스트'

                                            )}

                                            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"

                                        >

                                            📋 체크리스트 전체 복사

                                        </button>

                                    </div>



                                    {/* Tips */}

                                    <div className="mt-6 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-4">

                                        <h5 className="font-bold text-teal-800 text-sm mb-2">💡 KPI 활용 가이드</h5>

                                        <ul className="text-xs text-slate-600 space-y-1">

                                            <li>• <strong>높음</strong> 우선순위 항목은 다음 상담 시 반드시 확인하세요.</li>

                                            <li>• 목표 미달 시 원인을 파악하고 전략을 수정하세요.</li>

                                            <li>• 학생과 함께 목표를 공유하면 동기 부여에 효과적입니다.</li>

                                            <li>• 측정 결과를 기록하여 추이를 분석하세요.</li>

                                        </ul>

                                    </div>

                                </>

                            ) : activeTab === 'resources' ? (

                                /* Resources Content */

                                <>

                                    <div className="mb-6">

                                        <h4 className="font-black text-2xl mb-2 text-cyan-800">

                                            📚 보조 자료

                                        </h4>

                                        <p className="text-sm text-slate-600 leading-relaxed border-l-4 border-cyan-300 pl-3 italic">

                                            상담 중 보여주거나 학생에게 공유할 수 있는 자료입니다. 클릭하면 새 창에서 열립니다.

                                        </p>

                                    </div>



                                    {/* Resource Type Legend */}

                                    <div className="mb-4 flex flex-wrap gap-2">

                                        <span className="text-xs px-2 py-1 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center gap-1">🎬 영상</span>

                                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center gap-1">📄 PDF</span>

                                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-bold flex items-center gap-1">📱 앱</span>

                                        <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center gap-1">🔗 링크</span>

                                        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center gap-1">🖼️ 이미지</span>

                                    </div>



                                    {/* Resources Grid */}

                                    <div className="grid grid-cols-1 gap-3">

                                        {currentResources.map((resource, idx) => {

                                            const typeStyles: Record<string, { bg: string, border: string, badge: string }> = {

                                                video: { bg: 'bg-rose-50 hover:bg-rose-100', border: 'border-rose-200', badge: 'bg-rose-500 text-white' },

                                                pdf: { bg: 'bg-blue-50 hover:bg-blue-100', border: 'border-blue-200', badge: 'bg-blue-500 text-white' },

                                                app: { bg: 'bg-green-50 hover:bg-green-100', border: 'border-green-200', badge: 'bg-green-500 text-white' },

                                                link: { bg: 'bg-amber-50 hover:bg-amber-100', border: 'border-amber-200', badge: 'bg-amber-500 text-white' },

                                                image: { bg: 'bg-purple-50 hover:bg-purple-100', border: 'border-purple-200', badge: 'bg-purple-500 text-white' }

                                            };

                                            const style = typeStyles[resource.type];



                                            return (

                                                <a

                                                    key={idx}

                                                    href={resource.url}

                                                    target="_blank"

                                                    rel="noopener noreferrer"

                                                    className={`block rounded-xl border-2 ${style.border} ${style.bg} p-4 transition-all duration-200 transform hover:scale-[1.01] hover:shadow-md`}

                                                >

                                                    <div className="flex items-start gap-3">

                                                        <span className="text-3xl">{resource.icon}</span>

                                                        <div className="flex-1 min-w-0">

                                                            <div className="flex items-center gap-2 mb-1 flex-wrap">

                                                                <h5 className="font-bold text-slate-800">{resource.title}</h5>

                                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${style.badge}`}>

                                                                    {resource.type === 'video' ? '영상' :

                                                                        resource.type === 'pdf' ? 'PDF' :

                                                                            resource.type === 'app' ? '앱' :

                                                                                resource.type === 'link' ? '링크' : '이미지'}

                                                                </span>

                                                                {resource.duration && (

                                                                    <span className="text-[10px] text-slate-500 font-bold">⏱️ {resource.duration}</span>

                                                                )}

                                                            </div>

                                                            <p className="text-xs text-slate-600 line-clamp-2">{resource.description}</p>



                                                            {/* Interactive App Button - Only for specific resources */}

                                                            {(() => {

                                                                const careTypeValue = careType as CareType;

                                                                let interactiveButton = null;



                                                                // Self-check resources

                                                                if (resource.url.includes('adrenal_checklist.pdf') && SELF_CHECK_DATA[CareType.ADRENAL]) {

                                                                    interactiveButton = (

                                                                        <button

                                                                            onClick={(e) => {

                                                                                e.preventDefault();

                                                                                e.stopPropagation();

                                                                                setSelectedResourceType(CareType.ADRENAL);

                                                                                setShowSelfCheck(true);

                                                                            }}

                                                                            className="text-[10px] font-bold px-3 py-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"

                                                                        >

                                                                            📱 앱에서 열기

                                                                        </button>

                                                                    );

                                                                } else if (resource.url.includes('burnout_checklist.pdf') && SELF_CHECK_DATA[CareType.BURNOUT]) {

                                                                    interactiveButton = (

                                                                        <button

                                                                            onClick={(e) => {

                                                                                e.preventDefault();

                                                                                e.stopPropagation();

                                                                                setSelectedResourceType(CareType.BURNOUT);

                                                                                setShowSelfCheck(true);

                                                                            }}

                                                                            className="text-[10px] font-bold px-3 py-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"

                                                                        >

                                                                            📱 앱에서 열기

                                                                        </button>

                                                                    );

                                                                } else if (resource.url.includes('sleep_diary') && WORKSHEET_DATA[CareType.SLEEP]) {

                                                                    interactiveButton = (

                                                                        <button

                                                                            onClick={(e) => {

                                                                                e.preventDefault();

                                                                                e.stopPropagation();

                                                                                setSelectedResourceType(CareType.SLEEP);

                                                                                setShowWorksheet(true);

                                                                            }}

                                                                            className="text-[10px] font-bold px-3 py-1.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition"

                                                                        >

                                                                            📱 앱에서 열기

                                                                        </button>

                                                                    );

                                                                } else if (resource.url.includes('morning_routine.pdf') && DAILY_ROUTINE_DATA[CareType.ADRENAL]) {

                                                                    interactiveButton = (

                                                                        <button

                                                                            onClick={(e) => {

                                                                                e.preventDefault();

                                                                                e.stopPropagation();

                                                                                setSelectedResourceType(CareType.ADRENAL);

                                                                                setShowRoutineTracker(true);

                                                                            }}

                                                                            className="text-[10px] font-bold px-3 py-1.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition"

                                                                        >

                                                                            📱 앱에서 열기

                                                                        </button>

                                                                    );

                                                                } else if (resource.url.includes('gratitude_journal.pdf') && WORKSHEET_DATA[CareType.DEPRESSION_AMOTIVATION]) {

                                                                    interactiveButton = (

                                                                        <button

                                                                            onClick={(e) => {

                                                                                e.preventDefault();

                                                                                e.stopPropagation();

                                                                                setSelectedResourceType(CareType.DEPRESSION_AMOTIVATION);

                                                                                setShowWorksheet(true);

                                                                            }}

                                                                            className="text-[10px] font-bold px-3 py-1.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition"

                                                                        >

                                                                            📱 앱에서 열기

                                                                        </button>

                                                                    );

                                                                } else if (resource.url.includes('anxiety_journal.pdf') && WORKSHEET_DATA[CareType.ANXIETY_TENSION]) {

                                                                    interactiveButton = (

                                                                        <button

                                                                            onClick={(e) => {

                                                                                e.preventDefault();

                                                                                e.stopPropagation();

                                                                                setSelectedResourceType(CareType.ANXIETY_TENSION);

                                                                                setShowWorksheet(true);

                                                                            }}

                                                                            className="text-[10px] font-bold px-3 py-1.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition"

                                                                        >

                                                                            📱 앱에서 열기

                                                                        </button>

                                                                    );

                                                                } else if (resource.url.includes('stress_workbook.pdf') && WORKSHEET_DATA[CareType.STRESS_OVERLOAD]) {

                                                                    interactiveButton = (

                                                                        <button

                                                                            onClick={(e) => {

                                                                                e.preventDefault();

                                                                                e.stopPropagation();

                                                                                setSelectedResourceType(CareType.STRESS_OVERLOAD);

                                                                                setShowWorksheet(true);

                                                                            }}

                                                                            className="text-[10px] font-bold px-3 py-1.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition"

                                                                        >

                                                                            📱 앱에서 열기

                                                                        </button>

                                                                    );

                                                                } else if (resource.url.includes('meal_log.pdf') && WORKSHEET_DATA[CareType.LOW_ENERGY]) {

                                                                    interactiveButton = (

                                                                        <button

                                                                            onClick={(e) => {

                                                                                e.preventDefault();

                                                                                e.stopPropagation();

                                                                                setSelectedResourceType(CareType.LOW_ENERGY);

                                                                                setShowWorksheet(true);

                                                                            }}

                                                                            className="text-[10px] font-bold px-3 py-1.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition"

                                                                        >

                                                                            📱 앱에서 열기

                                                                        </button>

                                                                    );

                                                                } else if (resource.url.includes('adhd_checklist.pdf') && SELF_CHECK_DATA[CareType.ATTENTION_DEFICIT]) {

                                                                    interactiveButton = (

                                                                        <button

                                                                            onClick={(e) => {

                                                                                e.preventDefault();

                                                                                e.stopPropagation();

                                                                                setSelectedResourceType(CareType.ATTENTION_DEFICIT);

                                                                                setShowSelfCheck(true);

                                                                            }}

                                                                            className="text-[10px] font-bold px-3 py-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"

                                                                        >

                                                                            📱 앱에서 열기

                                                                        </button>

                                                                    );

                                                                }



                                                                return interactiveButton;

                                                            })()}



                                                            <div className="flex items-center justify-between mt-2">

                                                                <span className="text-[10px] text-cyan-600 font-bold bg-cyan-100 px-2 py-0.5 rounded-full">

                                                                    #{resource.category}

                                                                </span>

                                                                <span className="text-xs text-cyan-600 font-bold flex items-center gap-1">

                                                                    열기 →

                                                                </span>

                                                            </div>

                                                        </div>

                                                    </div>

                                                </a>

                                            );

                                        })}

                                    </div>



                                    {/* Resource Tips */}

                                    <div className="mt-6 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl p-4">

                                        <h5 className="font-bold text-cyan-800 text-sm mb-3">💡 보조 자료 활용 팁</h5>

                                        <ul className="text-xs text-slate-600 space-y-1">

                                            <li>• <strong>영상 자료</strong>: 상담 중 학생과 함께 시청하거나 과제로 제공</li>

                                            <li>• <strong>PDF 자료</strong>: 출력하여 학생에게 제공하거나 이메일로 전송</li>

                                            <li>• <strong>앱 추천</strong>: 학생/학부모에게 설치 권장</li>

                                            <li>• <strong>참고 링크</strong>: 심화 정보가 필요한 경우 공유</li>

                                        </ul>

                                    </div>

                                </>

                            ) : activeTab === 'roadmap' ? (

                                /* Weekly Roadmap Content */

                                <>

                                    <div className="mb-6">

                                        <h4 className="font-black text-2xl mb-2 text-indigo-800">

                                            📅 주차별 로드맵

                                        </h4>

                                        <p className="text-sm text-slate-600 leading-relaxed border-l-4 border-indigo-300 pl-3 italic">

                                            장기 관리가 필요한 학생을 위한 {currentWeeklyPlan.totalWeeks}주 단계별 계획입니다.

                                        </p>

                                    </div>



                                    {/* Goal Banner */}

                                    <div className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-4">

                                        <div className="flex items-center gap-3">

                                            <span className="text-3xl">🎯</span>

                                            <div>

                                                <p className="text-xs font-bold opacity-80 uppercase">최종 목표</p>

                                                <p className="text-lg font-black">{currentWeeklyPlan.goal}</p>

                                            </div>

                                        </div>

                                        <div className="mt-3 flex items-center gap-2">

                                            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">

                                                📊 총 {currentWeeklyPlan.totalWeeks}주 프로그램

                                            </span>

                                        </div>

                                    </div>



                                    {/* Timeline */}

                                    <div className="relative">

                                        {/* Timeline Line */}

                                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-indigo-200"></div>



                                        {/* Weekly Cards */}

                                        <div className="space-y-4">

                                            {currentWeeklyPlan.weeks.map((week, idx) => (

                                                <div key={idx} className="relative pl-14">

                                                    {/* Week Circle */}

                                                    <div className={`absolute left-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${week.milestone

                                                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'

                                                        : 'bg-indigo-100 text-indigo-700'

                                                        }`}>

                                                        {week.week}

                                                    </div>



                                                    {/* Week Card */}

                                                    <div className={`bg-white rounded-xl border-2 overflow-hidden transition-all ${week.milestone ? 'border-indigo-300 shadow-md' : 'border-slate-200'

                                                        }`}>

                                                        {/* Header */}

                                                        <div className={`px-4 py-3 ${week.milestone ? 'bg-indigo-50' : 'bg-slate-50'

                                                            }`}>

                                                            <div className="flex items-center justify-between">

                                                                <div>

                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Week {week.week}</p>

                                                                    <p className="font-bold text-slate-800">{week.theme}</p>

                                                                </div>

                                                                {week.milestone && (

                                                                    <span className="px-2 py-1 text-[10px] font-bold bg-indigo-600 text-white rounded-full">

                                                                        🏆 마일스톤

                                                                    </span>

                                                                )}

                                                            </div>

                                                        </div>



                                                        {/* Tasks */}

                                                        <div className="p-4">

                                                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">📋 실천 과제</p>

                                                            <ul className="space-y-2">

                                                                {week.tasks.map((task, tidx) => (

                                                                    <li key={tidx} className="flex items-start gap-2 text-sm text-slate-700">

                                                                        <span className="w-5 h-5 rounded border-2 border-indigo-300 flex items-center justify-center shrink-0 mt-0.5"></span>

                                                                        {task}

                                                                    </li>

                                                                ))}

                                                            </ul>



                                                            {/* Milestone */}

                                                            {week.milestone && (

                                                                <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-lg p-3">

                                                                    <p className="text-xs font-bold text-indigo-800 flex items-center gap-1">

                                                                        🎯 목표: {week.milestone}

                                                                    </p>

                                                                </div>

                                                            )}

                                                        </div>

                                                    </div>

                                                </div>

                                            ))}

                                        </div>

                                    </div>



                                    {/* Copy Roadmap */}

                                    <div className="mt-6">

                                        <button

                                            onClick={() => copyToClipboard(

                                                `📅 [${effectiveCareType}] ${currentWeeklyPlan.totalWeeks}주 로드맵\n\n🎯 목표: ${currentWeeklyPlan.goal}\n\n${currentWeeklyPlan.weeks.map(w =>

                                                    `[Week ${w.week}] ${w.theme}\n${w.tasks.map(t => `  ☐ ${t}`).join('\n')}${w.milestone ? `\n  🏆 마일스톤: ${w.milestone}` : ''}`

                                                ).join('\n\n')}`,

                                                '주차별 로드맵'

                                            )}

                                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"

                                        >

                                            📋 로드맵 전체 복사

                                        </button>

                                    </div>



                                    {/* Tips */}

                                    <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">

                                        <h5 className="font-bold text-indigo-800 text-sm mb-2">💡 로드맵 활용 가이드</h5>

                                        <ul className="text-xs text-slate-600 space-y-1">

                                            <li>• 매 상담 시 해당 주차의 <strong>과제 완료 여부</strong>를 확인하세요.</li>

                                            <li>• <strong>마일스톤</strong>이 있는 주차는 특히 중요한 점검 포인트입니다.</li>

                                            <li>• 학생 상태에 따라 주차를 <strong>늘리거나 줄일</strong> 수 있습니다.</li>

                                            <li>• 로드맵을 <strong>학부모와 공유</strong>하면 가정에서의 협조를 얻기 쉽습니다.</li>

                                        </ul>

                                    </div>

                                </>

                            ) : activeTab === 'faq' ? (

                                /* FAQ / Common Objections Content */

                                <>

                                    <div className="mb-6">

                                        <h4 className="font-black text-2xl mb-2 text-rose-800">

                                            💬 학생 반론 대응 (FAQ)

                                        </h4>

                                        <p className="text-sm text-slate-600 leading-relaxed border-l-4 border-rose-300 pl-3 italic">

                                            학생들이 흔히 하는 변명과 거부감에 대한 유연한 대응 가이드입니다. 학생의 저항을 낮추고 동기를 부여하세요.

                                        </p>

                                    </div>



                                    <div className="space-y-6">

                                        {currentObjections.map((obj, idx) => (

                                            <div key={idx} className="bg-white rounded-2xl border-2 border-rose-100 shadow-sm overflow-hidden">

                                                {/* Category Header */}

                                                <div className="bg-rose-50 px-4 py-2 border-b border-rose-100 flex items-center justify-between">

                                                    <div className="flex items-center gap-2">

                                                        <span className="text-sm font-bold text-rose-700 uppercase tracking-wider">{obj.category}</span>

                                                    </div>

                                                    <span className="text-xl">{obj.icon}</span>

                                                </div>



                                                <div className="p-5 space-y-4">

                                                    {/* Objection */}

                                                    <div>

                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">학생의 반박/변명</p>

                                                        <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-200 relative">

                                                            <p className="text-sm font-bold text-slate-700 italic">

                                                                {obj.objection}

                                                            </p>

                                                        </div>

                                                    </div>



                                                    {/* Response */}

                                                    <div>

                                                        <p className="text-[10px] font-bold text-rose-500 uppercase mb-2">상담사 대응 멘트</p>

                                                        <div className="bg-rose-50 p-4 rounded-2xl rounded-tr-none border border-rose-100">

                                                            <p className="text-sm font-bold text-rose-900 leading-relaxed">

                                                                {obj.response}

                                                            </p>

                                                        </div>

                                                    </div>



                                                    {/* Tip */}

                                                    {obj.tip && (

                                                        <div className="flex items-start gap-2 pt-2 border-t border-slate-50">

                                                            <span className="text-sm shadow-sm bg-rose-100 rounded-full w-5 h-5 flex items-center justify-center text-[10px]">💡</span>

                                                            <p className="text-xs text-slate-500 font-medium">

                                                                <span className="font-bold text-rose-600">Tip:</span> {obj.tip}

                                                            </p>

                                                        </div>

                                                    )}

                                                </div>



                                                {/* Copy Button */}

                                                <button

                                                    onClick={() => copyToClipboard(obj.response, obj.objection + ' 대응')}

                                                    className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors border-t border-rose-100"

                                                >

                                                    📋 대응 멘트 복사

                                                </button>

                                            </div>

                                        ))}

                                    </div>



                                    {/* Counseling Tips */}

                                    <div className="mt-8 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl p-5 shadow-lg">

                                        <h5 className="font-bold text-rose-400 text-sm mb-3 flex items-center gap-2">

                                            <span>✨</span> 유연한 상담을 위한 팁

                                        </h5>

                                        <ul className="text-xs space-y-2 opacity-90">

                                            <li className="flex gap-2">

                                                <span className="text-rose-400 font-bold">01.</span>

                                                <p>변명 뒤에 있는 <strong>진짜 두려움</strong>을 공감해 주세요. "맞아, 시간이 부족하다고 느낄 수 있어."</p>

                                            </li>

                                            <li className="flex gap-2">

                                                <span className="text-rose-400 font-bold">02.</span>

                                                <p><strong>작은 실험</strong>으로 제안해 보세요. "일주일만 이 방법으로 해보고 효과 없으면 바로 그만두자."</p>

                                            </li>

                                            <li className="flex gap-2">

                                                <span className="text-rose-400 font-bold">03.</span>

                                                <p>학생이 스스로 <strong>대안</strong>을 찾게 질문하세요. "그럼 너는 어느 시간에 하는 게 가장 편할 것 같아?"</p>

                                            </li>

                                        </ul>

                                    </div>

                                </>

                            ) : activeTab === 'prediction' ? (

                                /* Prediction & Trend Analysis Content */

                                <>

                                    <div className="mb-6">

                                        <h4 className="font-black text-2xl mb-2 text-violet-800">

                                            📊 위험 예측 분석 (Predictive Analytics)

                                        </h4>

                                        <p className="text-sm text-slate-600 leading-relaxed border-l-4 border-violet-300 pl-3 italic">

                                            로직 엔진 기반으로 학생의 현재 상태와 히스토리 데이터를 분석하여 미래 위험을 예측하고 선제적 조언을 제공합니다.

                                        </p>

                                    </div>



                                    {isLoadingPrediction ? (

                                        <div className="text-center py-12">

                                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600"></div>

                                            <p className="mt-4 text-sm text-slate-500">예측 데이터 로딩 중...</p>

                                        </div>

                                    ) : !predictionData ? (

                                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">

                                            <span className="text-4xl mb-2 block">⚠️</span>

                                            <p className="font-bold text-amber-900 mb-2">예측 데이터가 없습니다</p>

                                            <p className="text-sm text-amber-700">진단 데이터가 없거나 데이터 로딩에 실패했습니다.</p>

                                        </div>

                                    ) : (

                                        <>

                                            {/* Overall Summary */}

                                            <div className={`mb-6 rounded-xl p-5 border-2 ${predictionData.overallSeverity === 'critical' ? 'bg-red-50 border-red-300' :

                                                predictionData.overallSeverity === 'warning' ? 'bg-orange-50 border-orange-300' :

                                                    predictionData.overallSeverity === 'caution' ? 'bg-yellow-50 border-yellow-300' :

                                                        'bg-emerald-50 border-emerald-300'

                                                }`}>

                                                <div className="flex items-center gap-2 mb-2">

                                                    <span className="text-2xl">{

                                                        predictionData.overallSeverity === 'critical' ? '🔴' :

                                                            predictionData.overallSeverity === 'warning' ? '⚠️' :

                                                                predictionData.overallSeverity === 'caution' ? '⚡' : '✅'

                                                    }</span>

                                                    <h5 className="font-bold text-slate-800">종합 가이드</h5>

                                                </div>

                                                <p className="text-sm text-slate-700 leading-relaxed">{predictionData.overallGuide}</p>

                                                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">

                                                    <span>📅 데이터 포인트: {predictionData.dataPointsUsed}개</span>

                                                    <span>•</span>

                                                    <span>{predictionData.hasTrendData ? '📈 추세 분석 가능' : '📊 단일 데이터 분석'}</span>

                                                </div>

                                            </div>



                                            {/* Risk Predictions */}

                                            {predictionData.risks.length > 0 && (

                                                <div className="mb-6">

                                                    <h5 className="font-bold text-lg text-slate-800 mb-3">⚠️ 주요 위험 예측</h5>

                                                    <div className="space-y-4">

                                                        {predictionData.risks.map((risk, idx) => (

                                                            <div key={idx} className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden ${risk.severity === 'critical' ? 'border-red-200' :

                                                                risk.severity === 'high' ? 'border-orange-200' :

                                                                    risk.severity === 'medium' ? 'border-yellow-200' :

                                                                        'border-slate-200'

                                                                }`}>

                                                                {/* Risk Header */}

                                                                <div className={`px-4 py-3 flex items-center justify-between ${risk.severity === 'critical' ? 'bg-red-50 border-b border-red-100' :

                                                                    risk.severity === 'high' ? 'bg-orange-50 border-b border-orange-100' :

                                                                        risk.severity === 'medium' ? 'bg-yellow-50 border-b border-yellow-100' :

                                                                            'bg-slate-50 border-b border-slate-100'

                                                                    }`}>

                                                                    <div className="flex items-center gap-2">

                                                                        <span className="text-lg">{

                                                                            risk.severity === 'critical' ? '🔴' :

                                                                                risk.severity === 'high' ? '🔴' :

                                                                                    risk.severity === 'medium' ? '🟡' : '🟢'

                                                                        }</span>

                                                                        <h6 className="font-bold text-slate-800">{risk.ruleNameKr}</h6>

                                                                        {risk.isTrendBased && (

                                                                            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-bold">

                                                                                📈 추세기반

                                                                            </span>

                                                                        )}

                                                                    </div>

                                                                    <div className="text-right">

                                                                        <span className={`text-xs font-bold ${risk.severity === 'critical' ? 'text-red-700' :

                                                                            risk.severity === 'high' ? 'text-orange-700' :

                                                                                risk.severity === 'medium' ? 'text-yellow-700' :

                                                                                    'text-slate-700'

                                                                            }`}>확률: {risk.probability}%</span>

                                                                    </div>

                                                                </div>



                                                                <div className="p-4 space-y-3">

                                                                    {/* Consultation Script */}

                                                                    <div>

                                                                        <p className="text-[10px] font-bold text-violet-500 uppercase mb-2">💬 상담 스크립트</p>

                                                                        <div className="bg-violet-50 p-3 rounded-lg border border-violet-100">

                                                                            <p className="text-sm text-violet-900 font-medium leading-relaxed">

                                                                                {risk.consultScript}

                                                                            </p>

                                                                        </div>

                                                                        <button

                                                                            onClick={() => copyToClipboard(risk.consultScript, risk.ruleNameKr + ' 상담 스크립트')}

                                                                            className="mt-2 text-xs bg-violet-100 hover:bg-violet-200 text-violet-700 px-3 py-1 rounded-lg transition-colors font-bold"

                                                                        >

                                                                            📋 스크립트 복사

                                                                        </button>

                                                                    </div>



                                                                    {/* Recommendations */}

                                                                    <div>

                                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">✅ 권장 조치</p>

                                                                        <ul className="space-y-1">

                                                                            {risk.recommendations.map((rec, recIdx) => (

                                                                                <li key={recIdx} className="text-sm text-slate-700 flex items-start gap-2">

                                                                                    <span className="text-emerald-500 mt-0.5">•</span>

                                                                                    {rec}

                                                                                </li>

                                                                            ))}

                                                                        </ul>

                                                                    </div>



                                                                    {/* Matched Conditions */}

                                                                    <div className="pt-2 border-t border-slate-100">

                                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">📌 매칭된 조건</p>

                                                                        <div className="flex flex-wrap gap-1">

                                                                            {risk.matchedConditions.map((cond, condIdx) => (

                                                                                <span key={condIdx} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">

                                                                                    {cond}

                                                                                </span>

                                                                            ))}

                                                                        </div>

                                                                    </div>



                                                                    {/* Timeframe & Severity */}

                                                                    <div className="flex items-center gap-4 pt-2 text-xs text-slate-500">

                                                                        <span>⏱️ 기간: {risk.timeframe}</span>

                                                                        <span>•</span>

                                                                        <span>⚠️ 심각도: {

                                                                            risk.severity === 'critical' ? '매우 높음' :

                                                                                risk.severity === 'high' ? '높음' :

                                                                                    risk.severity === 'medium' ? '보통' : '낮음'

                                                                        }</span>

                                                                    </div>

                                                                </div>

                                                            </div>

                                                        ))}

                                                    </div>

                                                </div>

                                            )}



                                            {/* Trend Analysis */}

                                            {predictionData.trends.length > 0 && (

                                                <div className="mb-6">

                                                    <h5 className="font-bold text-lg text-slate-800 mb-3">📈 추세 분석</h5>

                                                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">

                                                        <table className="w-full text-sm">

                                                            <thead className="bg-slate-50 border-b border-slate-200">

                                                                <tr>

                                                                    <th className="px-4 py-2 text-left font-bold text-slate-700">지표</th>

                                                                    <th className="px-4 py-2 text-center font-bold text-slate-700">변화</th>

                                                                    <th className="px-4 py-2 text-right font-bold text-slate-700">분석</th>

                                                                </tr>

                                                            </thead>

                                                            <tbody>

                                                                {predictionData.trends.map((trend, idx) => (

                                                                    <tr key={idx} className="border-b border-slate-100 last:border-0">

                                                                        <td className="px-4 py-3 font-medium text-slate-700">{trend.fieldLabel}</td>

                                                                        <td className="px-4 py-3 text-center">

                                                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${trend.direction === 'up' ? 'bg-blue-100 text-blue-700' :

                                                                                trend.direction === 'down' ? 'bg-red-100 text-red-700' :

                                                                                    'bg-slate-100 text-slate-600'

                                                                                }`}>

                                                                                {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}

                                                                                {Math.abs(trend.deltaPercent).toFixed(1)}%

                                                                            </span>

                                                                        </td>

                                                                        <td className="px-4 py-3 text-right text-slate-600">{trend.interpretation}</td>

                                                                    </tr>

                                                                ))}

                                                            </tbody>

                                                        </table>

                                                    </div>



                                                    {/* Trend Chart Visualization */}

                                                    {predictionData.hasTrendData && (

                                                        <div className="mt-6 bg-white rounded-xl border border-slate-200 p-4">

                                                            <h6 className="font-bold text-sm text-slate-700 mb-4">📈 시계열 추세 차트</h6>

                                                            <ResponsiveContainer width="100%" height={250}>

                                                                <LineChart data={(() => {

                                                                    // Prepare chart data from history

                                                                    const historyData = predictionData.trends.length > 0

                                                                        ? Array.from({ length: predictionData.dataPointsUsed }, (_, i) => {

                                                                            const idx = predictionData.dataPointsUsed - 1 - i;

                                                                            return {

                                                                                name: `T-${idx}`,

                                                                                date: idx === 0 ? '현재' : `${idx}회 전`

                                                                            };

                                                                        }).reverse()

                                                                        : [];



                                                                    // Add trend values if available

                                                                    predictionData.trends.forEach(trend => {

                                                                        if (trend.field.includes('sns') || trend.field.includes('pns') ||

                                                                            trend.field.includes('bai') || trend.field.includes('isi') ||

                                                                            trend.field.includes('brainScore')) {

                                                                            const key = trend.fieldLabel;

                                                                            // Simulate historical data (in real implementation, use actual history)

                                                                            historyData.forEach((point, idx) => {

                                                                                if (idx === historyData.length - 1) {

                                                                                    point[key] = trend.currentValue;

                                                                                } else if (idx === historyData.length - 2) {

                                                                                    point[key] = trend.previousValue;

                                                                                }

                                                                            });

                                                                        }

                                                                    });



                                                                    return historyData;

                                                                })()}>

                                                                    <Line type="monotone" dataKey="교감신경(SNS)" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />

                                                                    <Line type="monotone" dataKey="부교감신경(PNS)" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />

                                                                    <Line type="monotone" dataKey="불안지수(BAI)" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} />

                                                                    <Line type="monotone" dataKey="수면장애(ISI)" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />

                                                                    <Line type="monotone" dataKey="뇌건강점수" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} />

                                                                    <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '11px' }} />

                                                                    <YAxis stroke="#64748b" style={{ fontSize: '11px' }} />

                                                                    <Tooltip

                                                                        contentStyle={{

                                                                            backgroundColor: '#fff',

                                                                            border: '1px solid #e2e8f0',

                                                                            borderRadius: '8px',

                                                                            fontSize: '12px'

                                                                        }}

                                                                    />

                                                                    <Legend

                                                                        wrapperStyle={{ fontSize: '11px' }}

                                                                        iconType="line"

                                                                    />

                                                                </LineChart>

                                                            </ResponsiveContainer>

                                                            <p className="text-xs text-slate-500 mt-3 text-center">

                                                                💡 각 지표의 변화 추이를 시각화한 차트입니다

                                                            </p>

                                                        </div>

                                                    )}

                                                </div>

                                            )}



                                            {/* No Risks Message */}

                                            {predictionData.risks.length === 0 && (

                                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">

                                                    <span className="text-4xl mb-2 block">✅</span>

                                                    <p className="font-bold text-emerald-900 mb-2">특별한 위험 신호가 감지되지 않았습니다</p>

                                                    <p className="text-sm text-emerald-700">현재 상태를 유지하면서 꾸준히 관리해 주세요.</p>

                                                </div>

                                            )}



                                            {/* Save Consultation Button */}

                                            {predictionData && currentData && (

                                                <div className="mt-6 grid grid-cols-2 gap-3">

                                                    <button

                                                        onClick={() => setShowConsultationModal(true)}

                                                        className="py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition flex items-center justify-center gap-2"

                                                    >

                                                        <span>📝</span>

                                                        상담 이력 저장

                                                    </button>

                                                    <button

                                                        onClick={() => setShowConsultationHistory(true)}

                                                        className="py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2"

                                                    >

                                                        <span>📋</span>

                                                        상담 이력 보기

                                                    </button>

                                                </div>

                                            )}

                                        </>

                                    )}



                                    {/* Consultation Save Modal */}

                                    {showConsultationModal && predictionData && currentData && (

                                        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">

                                            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">

                                                <div className="p-4 border-b border-slate-200 bg-violet-50">

                                                    <div className="flex justify-between items-center">

                                                        <h3 className="font-bold text-lg text-violet-900">📝 상담 이력 저장</h3>

                                                        <button

                                                            onClick={() => {

                                                                setShowConsultationModal(false);

                                                                setConsultationNotes('');

                                                                setStudentResponse('');

                                                            }}

                                                            className="text-slate-400 hover:text-slate-600 text-xl"

                                                        >

                                                            ✕

                                                        </button>

                                                    </div>

                                                </div>

                                                <div className="p-6 space-y-4">

                                                    <div>

                                                        <label className="text-xs font-bold text-slate-600 block mb-1">관리자 메모</label>

                                                        <textarea

                                                            value={consultationNotes}

                                                            onChange={(e) => setConsultationNotes(e.target.value)}

                                                            placeholder="상담 내용, 특이사항 등을 기록하세요..."

                                                            className="w-full h-24 p-3 border rounded-lg text-sm resize-none focus:ring-2 ring-violet-200 outline-none"

                                                        />

                                                    </div>

                                                    <div>

                                                        <label className="text-xs font-bold text-slate-600 block mb-1">학생 반응</label>

                                                        <textarea

                                                            value={studentResponse}

                                                            onChange={(e) => setStudentResponse(e.target.value)}

                                                            placeholder="학생의 피드백, 반응 등을 기록하세요..."

                                                            className="w-full h-24 p-3 border rounded-lg text-sm resize-none focus:ring-2 ring-violet-200 outline-none"

                                                        />

                                                    </div>

                                                    <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600">

                                                        <p className="font-bold mb-1">자동 저장되는 정보:</p>

                                                        <ul className="list-disc list-inside space-y-1">

                                                            <li>사용된 예측 규칙 ({predictionData.risks.length}개)</li>

                                                            <li>상담 스크립트</li>

                                                            <li>예측 결과 스냅샷</li>

                                                        </ul>

                                                    </div>

                                                </div>

                                                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">

                                                    <button

                                                        onClick={() => {

                                                            setShowConsultationModal(false);

                                                            setConsultationNotes('');

                                                            setStudentResponse('');

                                                        }}

                                                        className="px-6 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium"

                                                    >

                                                        취소

                                                    </button>

                                                    <button

                                                        onClick={async () => {

                                                            try {

                                                                await DatabaseService.addConsultation({

                                                                    studentId: currentData.student.id,

                                                                    studentName: currentData.student.name,

                                                                    date: new Date().toISOString(),

                                                                    usedRules: predictionData.risks.map(r => r.ruleId),

                                                                    usedScripts: predictionData.risks.map(r => r.consultScript),

                                                                    notes: consultationNotes,

                                                                    studentResponse: studentResponse,

                                                                    predictions: predictionData

                                                                });

                                                                alert('상담 이력이 저장되었습니다.');

                                                                setShowConsultationModal(false);

                                                                setConsultationNotes('');

                                                                setStudentResponse('');

                                                            } catch (error) {

                                                                alert('저장 실패: ' + error);

                                                            }

                                                        }}

                                                        className="px-6 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700"

                                                    >

                                                        저장

                                                    </button>

                                                </div>

                                            </div>

                                        </div>

                                    )}

                                </>

                            ) : (

                                /* Original Content for prestudy/learning/exercise */

                                <>

                                    <div className="mb-6">

                                        <h4 className={`font-black text-2xl mb-2 ${activeTab === 'prestudy' ? 'text-emerald-800' :

                                            activeTab === 'learning' ? 'text-blue-800' : 'text-orange-800'

                                            }`}>

                                            {content[activeTab as 'prestudy' | 'learning' | 'exercise'].title}

                                        </h4>

                                        {content[activeTab as 'prestudy' | 'learning' | 'exercise'].intro && (

                                            <p className="text-sm text-slate-600 leading-relaxed border-l-4 border-slate-300 pl-3 italic">

                                                {content[activeTab as 'prestudy' | 'learning' | 'exercise'].intro}

                                            </p>

                                        )}

                                    </div>



                                    {/* Difficulty Filter & Sort Controls */}

                                    <div className="mb-4 bg-white rounded-xl border border-slate-200 p-3">

                                        <div className="flex flex-wrap items-center gap-3">

                                            <span className="text-xs font-bold text-slate-500">난이도:</span>

                                            <div className="flex gap-1">

                                                <button

                                                    onClick={() => setDifficultyFilter('all')}

                                                    className={`px-3 py-1 text-xs rounded-full font-bold transition-colors ${difficultyFilter === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}

                                                >

                                                    전체

                                                </button>

                                                <button

                                                    onClick={() => setDifficultyFilter('easy')}

                                                    className={`px-3 py-1 text-xs rounded-full font-bold transition-colors ${difficultyFilter === 'easy' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}

                                                >

                                                    🟢 쉬움

                                                </button>

                                                <button

                                                    onClick={() => setDifficultyFilter('medium')}

                                                    className={`px-3 py-1 text-xs rounded-full font-bold transition-colors ${difficultyFilter === 'medium' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}

                                                >

                                                    🟡 보통

                                                </button>

                                                <button

                                                    onClick={() => setDifficultyFilter('hard')}

                                                    className={`px-3 py-1 text-xs rounded-full font-bold transition-colors ${difficultyFilter === 'hard' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}

                                                >

                                                    🔴 어려움

                                                </button>

                                            </div>

                                            <div className="border-l border-slate-200 pl-3 ml-auto">

                                                <button

                                                    onClick={() => setSortByDifficulty(!sortByDifficulty)}

                                                    className={`px-3 py-1 text-xs rounded-full font-bold transition-colors flex items-center gap-1 ${sortByDifficulty ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}

                                                >

                                                    ↑↓ {sortByDifficulty ? '난이도순 ON' : '난이도순'}

                                                </button>

                                            </div>

                                        </div>

                                    </div>



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



                                    <div className="space-y-4">

                                        {getFilteredGuides(content[activeTab as 'prestudy' | 'learning' | 'exercise'].guides).map((item, idx) => (

                                            <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">

                                                {/* Card Header (Always Visible) */}

                                                <button

                                                    onClick={() => toggleExpand(idx)}

                                                    className="w-full text-left p-5 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors"

                                                >

                                                    <div className="flex items-start gap-3 flex-1">

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

                                                            }`}>

                                                            {idx + 1}

                                                        </span>

                                                        <div className="flex-1">

                                                            <div className="flex items-center gap-2 mb-1">

                                                                <h5

                                                                    className={`font-bold text-slate-800 text-lg leading-tight ${(item.title === "데스크 셋업 (Visual Clean)" || item.title.includes("4-7-8 호흡") || item.title.includes("디지털 디톡스") || item.title.includes("마이크로 목표") || item.title.includes("걱정 배출") || item.title.includes("그라운딩") || item.title.includes("결과와 과정 분리") || item.title.includes("박스 브리딩"))

                                                                        ? "cursor-pointer hover:text-blue-600 transition-colors underline decoration-dotted decoration-blue-400"

                                                                        : ""

                                                                        }`}

                                                                    onClick={(e) => {

                                                                        if (item.title === "데스크 셋업 (Visual Clean)") {

                                                                            e.stopPropagation();

                                                                            openVisualCleanGuide();

                                                                        } else if (item.title.includes("4-7-8 호흡")) {

                                                                            e.stopPropagation();

                                                                            window.open('/breathing', '_blank');

                                                                        } else if (item.title.includes("디지털 디톡스")) {

                                                                            e.stopPropagation();

                                                                            openDigitalDetoxGuide();

                                                                        } else if (item.title.includes("마이크로 목표")) {

                                                                            e.stopPropagation();

                                                                            openMicroGoalGuide();

                                                                        } else if (item.title.includes("걱정 배출")) {

                                                                            e.stopPropagation();

                                                                            openWorryDumpGuide();

                                                                        } else if (item.title.includes("그라운딩")) {

                                                                            e.stopPropagation();

                                                                            openGroundingGuide();

                                                                        } else if (item.title.includes("결과와 과정 분리")) {

                                                                            e.stopPropagation();

                                                                            openDetachGuide();

                                                                        } else if (item.title.includes("박스 브리딩")) {

                                                                            e.stopPropagation();

                                                                            openBoxBreathingGuide();

                                                                        }

                                                                    }}

                                                                    title={(item.title === "데스크 셋업 (Visual Clean)" || item.title.includes("4-7-8 호흡") || item.title.includes("디지털 디톡스") || item.title.includes("마이크로 목표") || item.title.includes("걱정 배출") || item.title.includes("그라운딩") || item.title.includes("결과와 과정 분리") || item.title.includes("박스 브리딩")) ? "클릭하여 상세 가이드 보기" : ""}

                                                                >

                                                                    {item.title}

                                                                </h5>

                                                                {/* Previous Prescription Badge */}

                                                                {currentData?.previousResult?.completedExpertGuideItems?.includes(item.title) && (

                                                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 rounded-full shrink-0">

                                                                        이전 처방

                                                                    </span>

                                                                )}

                                                                {/* Difficulty Badge */}

                                                                {item.difficulty && (

                                                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getDifficultyDisplay(item.difficulty).color}`}>

                                                                        {getDifficultyDisplay(item.difficulty).emoji} {getDifficultyDisplay(item.difficulty).text}

                                                                    </span>

                                                                )}

                                                            </div>

                                                            <p className="text-xs text-slate-500 line-clamp-1">{item.expertDesc}</p>

                                                        </div>

                                                    </div>

                                                    <span className={`transform transition-transform duration-300 ${expandedItem === idx ? 'rotate-180' : ''}`}>

                                                        ▼

                                                    </span>

                                                </button>



                                                {/* Expanded Content */}

                                                {expandedItem === idx && (

                                                    <div className="px-5 pb-5 pt-0 bg-slate-50/30 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">

                                                        {/* Manager's Script (Highlighted) */}

                                                        <div className="mt-4 bg-indigo-50 border border-indigo-100 p-4 rounded-lg relative">

                                                            <div className="absolute -left-1 top-4 w-1 h-8 bg-indigo-500 rounded-r"></div>

                                                            <p className="text-sm font-bold text-indigo-900 leading-relaxed font-sans">

                                                                {item.managerGuide}

                                                            </p>

                                                        </div>



                                                        {/* Details */}

                                                        <div className="mt-4 space-y-4">

                                                            <div>

                                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Expert Explanation</p>

                                                                <p className="text-sm text-slate-700 leading-relaxed">{item.expertDesc}</p>

                                                            </div>

                                                            <div>

                                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Scientific Rationale</p>

                                                                <p className="text-sm text-slate-600 bg-slate-100 p-3 rounded-lg leading-relaxed text-justify">

                                                                    {item.rationale}

                                                                </p>

                                                            </div>

                                                            <div>

                                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Action Item</p>

                                                                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">

                                                                    <span className="text-red-500">✓</span>

                                                                    {item.action}

                                                                </div>

                                                            </div>

                                                        </div>

                                                    </div>

                                                )}

                                            </div>

                                        ))}

                                    </div>

                                </>

                            )}

                        </div>

                    </div>

                </div >

            )}



            {/* AI Assistant Panel for Strategy Analysis */}

            {currentData && (

                <div className="mt-8 px-6 pb-6">

                    <AIAssistantPanel 

                        contextData={{ careType: effectiveCareType, score, selectedStrategies: currentData.selectedStrategies }}

                        systemPrompt="당신은 NBASS의 전문가 가이드 AI입니다. 현재 학생의 careType과 선택된 전략을 바탕으로 학부모 상담 시 유용한 멘트나 추가 조언을 3문단으로 요약해주세요."

                        aiModels={aiModels || null}

                        buttonLabel="✨ 전략 가이드 AI 통합 요약"

                        membershipTier={currentData?.student?.membershipTier || 'free'}

                    />

                </div>

            )}



            {/* Resource Modals */}

            {selectedResourceType && (

                <>

                    {showSelfCheck && SELF_CHECK_DATA[selectedResourceType] && (

                        <SelfCheckModal

                            isOpen={showSelfCheck}

                            onClose={() => {

                                setShowSelfCheck(false);

                                setSelectedResourceType(null);

                            }}

                            data={SELF_CHECK_DATA[selectedResourceType]!}

                            studentId={studentId}

                            careType={selectedResourceType}

                        />

                    )}



                    {showRoutineTracker && DAILY_ROUTINE_DATA[selectedResourceType] && (

                        <DailyRoutineTracker

                            isOpen={showRoutineTracker}

                            onClose={() => {

                                setShowRoutineTracker(false);

                                setSelectedResourceType(null);

                            }}

                            data={DAILY_ROUTINE_DATA[selectedResourceType]!}

                            studentId={studentId}

                            careType={selectedResourceType}

                        />

                    )}



                    {showWorksheet && WORKSHEET_DATA[selectedResourceType] && (

                        <WorksheetModal

                            isOpen={showWorksheet}

                            onClose={() => {

                                setShowWorksheet(false);

                                setSelectedResourceType(null);

                            }}

                            data={WORKSHEET_DATA[selectedResourceType]!}

                        />

                    )}

                </>

            )}



            {/* Consultation History Modal */}

            <ConsultationHistoryModal

                isOpen={showConsultationHistory}

                studentId={studentId}

                onClose={() => setShowConsultationHistory(false)}

            />

        </>

    );

};

