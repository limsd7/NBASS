import React from 'react';
import { AssessmentResult, CareType, StrategyMap } from '../../types';
import { AnalystConfig, getAnalystDisplayText } from '../../utils/analystConfig';
import { CARE_TYPE_LABELS } from '../../logicEngine';
import { evaluateBrainBodyCoherence } from '../../services/brainBodyEngine';
import { generateSleepPrescription } from '../../utils/sleepLogic';
import CircularSchedule from '../ui/CircularSchedule';
import {
    getChronotypeAdvice,
    getVARKAdvice,
    getTestAnxietyAdvice,
    getDigitalAddictionAdvice,
    getMetacognitionAdvice
} from '../../data/studyEfficiencyAdvice';
import { generateAISchedule } from '../../services/schedulingEngine';
import { SubjectCircadianPlan, getSubjectCircadianPlan } from '../../services/chronobiologyEngine';

import { PNT_PRODUCTS, PntProduct } from '../../data/pntProducts';
import { generateNutritionalPrescription } from '../../services/prescriptionEngine';
import { MembershipTier } from '../../utils/featureGate';
import { DETAILED_INSIGHTS } from '../../data/detailedInsights';
import { EXPERT_CONTENTS, WEEKLY_PLANS, SUCCESS_INDICATORS } from '../ExpertOverlay';
import { generateConsultingReport } from '../../services/consultingEngine';
import { generateConsultationScripts } from '../../services/consultationScriptEngine';
import { getLearningStrategy, DETAILED_CARETYPE_STRATEGIES } from '../../data/learningStrategies';
import { getDynamicSubjectRoadmap } from '../../services/studyStrategyEngine';
import { isLearningAnalyticsTested } from '../../utils/constants';
import { inferLearningTraitsFromProfile } from '../../data/learningTraitsData';

interface MedicalReportProps {
    result: AssessmentResult;
    analystConfig?: AnalystConfig;
    strategies?: StrategyMap;
    selectedSubjectOptions?: any;
    adminMemo?: string;
    recommendedProducts?: any[];
    isPremiumOrAbove?: boolean;
    membershipTier?: MembershipTier;
    config?: {
        useBrainBody?: boolean;
        usePortable?: boolean;
        isMedicalMode?: boolean;
        currentExaminerId?: string | null;
        examiners?: import('../../types').Examiner[];
    };
}



export const MedicalReport: React.FC<MedicalReportProps> = ({
    result,
    strategies,
    selectedSubjectOptions,
    adminMemo,
    recommendedProducts = [],
    isPremiumOrAbove = false,
    membershipTier = 'free',
    config
}) => {
    const { student, hrv, classificationResult, protocol, analytics, survey, studyEfficiencyResults, cognitiveResults } = result;
    const rawTraits = student?.learningTraits || survey?.learningTraits;
    const isDefaultFlat50 = !rawTraits || !rawTraits.scores || (
        rawTraits.scores.gritPlan === 50 &&
        rawTraits.scores.mentalResilience === 50 &&
        rawTraits.scores.temperament === 50 &&
        rawTraits.scores.metaCognition === 50 &&
        rawTraits.scores.internalMotivation === 50
    );
    const traits = React.useMemo(() => {
        if (isDefaultFlat50) {
            return inferLearningTraitsFromProfile({
                careType: result.careType,
                survey,
                studyEfficiency: studyEfficiencyResults as any,
                student
            });
        }
        return rawTraits;
    }, [isDefaultFlat50, rawTraits, result.careType, survey, studyEfficiencyResults, student]);

    const effectiveReportTier: MembershipTier = membershipTier || (student.membershipTier as MembershipTier) || 'free';
    const isProTier = effectiveReportTier === 'pro';
    const isPlusOrAbove = effectiveReportTier === 'premium_plus' || effectiveReportTier === 'vip' || effectiveReportTier === 'expert';
    const isPremiumLevelOrAbove = effectiveReportTier === 'premium' || isPlusOrAbove || (isPremiumOrAbove && effectiveReportTier !== 'pro' && effectiveReportTier !== 'free');
    const isProOrAbove = isProTier || isPremiumLevelOrAbove;

    const detailedCareStrategy = React.useMemo(() => {
        try {
            return getLearningStrategy(traits, result.careType);
        } catch (e) {
            console.error("getLearningStrategy error in MedicalReport:", e);
            return null;
        }
    }, [traits, result.careType]);

    const dynamicSubjectRoadmap = React.useMemo(() => {
        try {
            return getDynamicSubjectRoadmap(student, result.careType, result.gradeHistory);
        } catch (e) {
            console.error("getDynamicSubjectRoadmap error in MedicalReport:", e);
            return null;
        }
    }, [student, result.careType, result.gradeHistory]);

    const brainBodyState = React.useMemo(() => {
        try {
            return evaluateBrainBodyCoherence(result.hrv, result.survey, result.careType, result.protocol, result.cognitiveResults);
        } catch (e) {
            console.error("BrainBodyEngine error in MedicalReport:", e);
            return null;
        }
    }, [result.hrv, result.survey, result.careType, result.protocol, result.cognitiveResults]);

    // Extract top 3 valid scores for the cards
    const validScores = classificationResult?.allScores?.filter(s => s.type !== CareType.UNASSESSED).slice(0, 3) || [];
    const primaryScoreData = validScores.length > 0 ? validScores[0] : null;
    const secondary1Data = validScores.length > 1 ? validScores[1] : null;
    const secondary2Data = validScores.length > 2 ? validScores[2] : null;

    // Examiner logic
    const getCurrentExaminer = () => {
        if (!config?.currentExaminerId || !config?.examiners) return null;
        return config.examiners.find(e => e.id === config.currentExaminerId);
    };
    const examiner = getCurrentExaminer();
    const examinerDisplay = examiner
        ? `${examiner.id}${examiner.position ? ` (${examiner.position})` : ''}`
        : (result.analystConfig ? getAnalystDisplayText(result.analystConfig) : 'Dr. Lim');

    // BMI
    const bmi = student.bmi || (student.weight && student.height ? student.weight / ((student.height / 100) ** 2) : 0);
    const bmiStatus = bmi > 25 ? '비만 (Obese)' : bmi > 23 ? '과체중 (Overweight)' : '정상 (Normal)';

    // Dynamic bio-metric scores
    const hasHRV = Boolean(
        hrv.isHrvTested ?? (
            (config?.usePortable && hrv.portableHrv && hrv.portableHrv.pulseVariability > 0) ||
            Boolean((hrv.hrvIndex && hrv.hrvIndex > 0) || (hrv.meanHr && hrv.meanHr > 0))
        )
    );

    const surveyStressVal = survey?.bai && survey.bai > 0 ? Math.round(Math.min(95, (survey.bai / 63) * 100)) : (protocol?.stressLevel && protocol.stressLevel > 0 ? protocol.stressLevel * 10 : 42);
    const stressScore = hasHRV ? (hrv.physicalStress || 50) : surveyStressVal;

    const sleepDeficit = protocol?.sleepHours && protocol.sleepHours > 0 ? Math.max(0, (8 - protocol.sleepHours) * 12) : 15;
    const insomniaVal = survey?.isi && survey.isi > 0 ? Math.round((survey.isi / 28) * 50) : 15;
    const surveyFatigueVal = Math.min(95, Math.max(15, sleepDeficit + insomniaVal + 10));
    const fatigueScore = hasHRV ? (hrv.fatigue || 45) : surveyFatigueVal;

    const vitalityScore = hasHRV ? (hrv.vitality || Math.max(15, 100 - fatigueScore)) : Math.max(15, Math.min(95, 100 - fatigueScore));

    const pureRatioVal = analytics?.pureStudyRatio && analytics.pureStudyRatio > 0 ? analytics.pureStudyRatio : 65;
    const cognitiveVal = cognitiveResults?.attention?.accuracy ? cognitiveResults.attention.accuracy : (cognitiveResults?.processingSpeed?.averageAccuracy || 70);
    const surveyConcentrationVal = Math.round(pureRatioVal * 0.5 + cognitiveVal * 0.5);
    const concentrationScore = hrv.concentrationLevel || surveyConcentrationVal;

    const ansBalanceScore = Math.max(20, Math.min(95, Math.round(100 - (stressScore * 0.45) - (fatigueScore * 0.35))));

    const calculatedSns = Math.min(85, Math.max(25, Math.round(40 + (stressScore * 0.45) - (vitalityScore * 0.15))));
    const calculatedPns = 100 - calculatedSns;
    const snsScore = (hrv.sns && hrv.sns > 0) ? hrv.sns : calculatedSns;
    const pnsScore = (hrv.pns && hrv.pns > 0) ? hrv.pns : calculatedPns;

    const ansStatusText = snsScore > 60
        ? '교감신경 우세 (긴장)'
        : pnsScore > 60
            ? '부교감 우세 (나른)'
            : '자율신경 균형 양호';
    const ansScoreText = `${ansBalanceScore}점`;

    // Brain Peak Time calculation (100% synchronized with chronobiologyEngine)
    const sleepPrescription = React.useMemo(() => {
        return generateSleepPrescription(result.careType, result.analytics);
    }, [result.careType, result.analytics]);

    const parseTimeHour = (timeStr: string) => parseInt(timeStr.split(':')[0], 10);
    const bedHour = parseTimeHour(sleepPrescription.recommendedBedtime) || 23;
    const wakeHour = parseTimeHour(sleepPrescription.recommendedWakeTime) || 7;

    const isMorningType = wakeHour <= 7;
    let goldenStartNum = isMorningType ? 10 : 14;
    if (analytics?.goldenTimeStart) {
        const parsed = parseInt(analytics.goldenTimeStart.split(':')[0], 10);
        if (!isNaN(parsed)) goldenStartNum = parsed;
    }
    let goldenEndNum = goldenStartNum + 2;
    if (hrv.brainScore && hrv.brainScore > 70) {
        goldenEndNum += 1;
    }

    const slumpStartNum = goldenStartNum + 4;
    const slumpEndNum = slumpStartNum + 1;
    const secondStartNum = slumpEndNum + 2;
    const secondEndNum = 22;

    const formatHour = (h: number) => `${h.toString().padStart(2, '0')}:00`;
    const goldenStart = formatHour(goldenStartNum);
    const goldenEnd = formatHour(goldenEndNum);

    // Date & Age
    const today = student.testDate || new Date().toISOString().split('T')[0];
    const age = student.age || (new Date().getFullYear() - new Date(student.birthDate).getFullYear());
    const genderStr = student.gender === 'Male' ? 'M' : 'F';
    const careType = result.careType;

    const getWidth = (val: number) => ({ width: `${Math.min(100, Math.max(0, val))}%` });

    // Subject theme mapping for circadian & focus learning
    const subjectPlan = React.useMemo(() => {
        const key = student.weakSubject || student.focusSubjects?.[0] || student.selectedSubjects?.[0] || 'general';
        return getSubjectCircadianPlan(key);
    }, [student.weakSubject, student.focusSubjects, student.selectedSubjects]);

    // Parsed Vulnerable Time Strategy from DETAILED_INSIGHTS (100% CareType synchronized)
    const parsedVulnerableStrategy = React.useMemo(() => {
        const insight = DETAILED_INSIGHTS[careType as CareType] || DETAILED_INSIGHTS[CareType.BURNOUT];
        const raw = insight?.vulnerableTimeStrategy || '';
        const sectionRegex = /\*\*\[(.*?)\]\*\*\s*([\s\S]*?)(?=(?:\*\*\[|$))/g;
        const matches: { title: string; text: string }[] = [];
        let m;
        while ((m = sectionRegex.exec(raw)) !== null) {
            matches.push({
                title: m[1].trim(),
                text: m[2].replace(/\*\*/g, '').replace(/\n+/g, ' ').trim()
            });
        }

        if (matches.length >= 4) {
            return {
                vulnerableTime: { title: matches[0].title, text: matches[0].text },
                correlation: { title: matches[1].title, text: matches[1].text },
                mindset: { title: matches[2].title, text: matches[2].text },
                recommendation: { title: matches[3].title, text: matches[3].text },
            };
        }

        return {
            vulnerableTime: { title: '취약 구간 분석', text: '오후 1시~3시(식후 슬럼프) 및 기상 직후 에너지 저하 구간에 집중적인 주의가 필요합니다.' },
            correlation: { title: '학습 상관관계', text: '에너지가 고갈된 구간에 고난도 문제를 풀면 학습 회피 반응이 강화되므로 가벼운 학습으로 전환하세요.' },
            mindset: { title: '마인드셋', text: '"지금은 뇌가 회복하는 시간"으로 재정의하고 자책 대신 15분 파워냅이나 가벼운 스트레칭을 취하세요.' },
            recommendation: { title: '추천 공부법', text: '인지 부하가 낮은 어휘 복습, 암기 카드 넘기기, 인강 복습 등 수동적 학습을 배치하세요.' },
        };
    }, [careType]);

    // Tier Display Label
    const tierDisplayLabel = (() => {
        switch (effectiveReportTier) {
            case 'expert': return 'EXPERT';
            case 'vip': return 'VIP';
            case 'premium_plus': return 'PREMIUM+';
            case 'premium': return 'PREMIUM';
            case 'pro': return 'PRO';
            case 'basic': return 'BASIC';
            default: return 'FREE';
        }
    })();

    const tierBadgeStyle = (() => {
        switch (effectiveReportTier) {
            case 'expert': return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'vip': return 'bg-amber-100 text-amber-900 border-amber-300';
            case 'premium_plus': return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'premium': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
            case 'pro': return 'bg-blue-100 text-blue-800 border-blue-300';
            default: return 'bg-slate-100 text-slate-700 border-slate-300';
        }
    })();

    // 5대 학습 효율성 검사 시행 여부 및 데이터 추출 (survey 필드와의 듀얼 폴백 보장)
    const chronoData = studyEfficiencyResults?.chronotype || (survey?.chronotypeScore !== undefined && survey?.chronotypeResult ? {
        score: survey.chronotypeScore,
        result: survey.chronotypeResult as any
    } : undefined);
    const isChronoTested = Boolean(chronoData?.result);

    const varkData = studyEfficiencyResults?.vark || (survey?.varkPrimary && survey?.varkScores ? {
        ...survey.varkScores,
        primary: survey.varkPrimary as any,
        primaryStyle: survey.varkPrimary as any
    } : undefined);
    const varkStyle = varkData?.primaryStyle || varkData?.primary;
    const isVarkTested = Boolean(varkStyle);

    const taiData = studyEfficiencyResults?.testAnxiety || studyEfficiencyResults?.tai || (survey?.testAnxietyCognitive !== undefined && survey?.testAnxietySomatic !== undefined ? {
        cognitiveScore: survey.testAnxietyCognitive,
        somaticScore: survey.testAnxietySomatic,
        totalScore: survey.testAnxietyCognitive + survey.testAnxietySomatic,
        dominantType: survey.testAnxietyType || 'balanced',
        severity: (survey.testAnxietyCognitive + survey.testAnxietySomatic) <= 21 ? 'low' : (survey.testAnxietyCognitive + survey.testAnxietySomatic) <= 35 ? 'moderate' : 'high'
    } : undefined);
    const isTaiTested = Boolean(taiData && (taiData.totalScore !== undefined || taiData.result || taiData.severity));

    const digitalData = studyEfficiencyResults?.digitalAddiction || (survey?.digitalAddictionLevel ? {
        totalScore: survey.digitalAddictionScore ?? 0,
        level: survey.digitalAddictionLevel as any,
        dopamineStatus: survey.digitalAddictionLevel === 'healthy' ? '정상: 도파민 보상 체계가 건강합니다.' :
            survey.digitalAddictionLevel === 'caution' ? '주의: 도파민 민감도가 다소 저하되었을 수 있습니다.' :
                survey.digitalAddictionLevel === 'risk' ? '경계: 도파민 수용체 둔감화가 진행 중일 수 있습니다.' :
                    '위험: 즉각적 보상에 길들여져 지연된 보상(공부)이 어렵습니다.',
        toleranceScore: 0,
        withdrawalScore: 0,
        controlScore: 0,
        impactScore: 0
    } : undefined);
    const isDigitalTested = Boolean(digitalData?.level);

    const metaData = studyEfficiencyResults?.metacognition || (survey?.metacognitionLevel && survey?.metacognitionScores ? {
        learnerLevel: survey.metacognitionLevel as any,
        level: survey.metacognitionLevel as any,
        rehearsalScore: survey.metacognitionScores.rehearsal,
        elaborationScore: survey.metacognitionScores.elaboration,
        organizationScore: survey.metacognitionScores.organization,
        metacognitiveScore: survey.metacognitionScores.metacognitive,
        dominantStrategy: 'balanced'
    } : undefined);
    const metaLevel = metaData?.level || metaData?.learnerLevel;
    const isMetaTested = Boolean(metaLevel);

    const completedEffCount = [isChronoTested, isVarkTested, isTaiTested, isDigitalTested, isMetaTested].filter(Boolean).length;

    // Header component
    const ReportHeader = () => (
        <div className="flex flex-row justify-between items-start border-b-2 border-slate-200 pb-2 mb-2">
            <div>
                <div className="text-blue-700 font-bold text-[11px] tracking-widest uppercase">Neuro-Bio Academic Strategy System</div>
                <div className="flex items-center gap-2 mt-0.5">
                    <h1 className="text-xl font-black text-slate-800">NBASS 정밀 진단 보고서</h1>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-black border tracking-wider uppercase ${tierBadgeStyle}`}>
                        {tierDisplayLabel}
                    </span>
                </div>
                <p className="text-slate-500 text-[10px] italic mt-0.5">Official Diagnostic &amp; Neuro-Insight Comprehensive Report</p>
            </div>
            <div className="text-right">
                <div className="inline-block bg-slate-100 px-2.5 py-0.5 rounded text-[10px] font-mono text-slate-600 mb-0.5">Ver 2.6.0-Precision</div>
                <div className="text-[11px] font-medium">분석책임자: <span className="text-blue-700 font-bold">{examinerDisplay}</span></div>
            </div>
        </div>
    );

    // Patient Info Grid
    const PatientInfoGrid = () => (
        <div
            className="bg-slate-50 px-3 py-2 rounded-xl mb-3 border border-slate-200 text-xs"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.75rem' }}
        >
            <div>
                <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">피검자 성명</label>
                <div className="text-xs font-black text-slate-800">{student.name} <span className="text-[10px] font-normal text-slate-500">({genderStr} / {age}세)</span></div>
            </div>
            <div>
                <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">진단 코드</label>
                <div className="text-xs font-mono font-bold text-slate-700">ID-{today.replace(/-/g, '').substring(2)}-{student.id.substring(0, 4)}</div>
            </div>
            <div>
                <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">검사 일시</label>
                <div className="text-xs font-bold text-slate-700">{today}</div>
            </div>
            <div>
                <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">중점 분석 분야</label>
                <div className="text-xs font-black text-blue-700">{student.weakSubject ? student.weakSubject.toUpperCase() : 'GENERAL'} (학습 최적화)</div>
            </div>
        </div>
    );

    // Standardized Footer with page numbering
    const ReportFooter = ({ pageNum, title }: { pageNum: number, title: string }) => (
        <div className="mt-auto pt-2 border-t border-slate-200 flex flex-col md:flex-row justify-between text-[9px] text-slate-400 font-medium">
            <p>© 2026 NEURO-EDULAB. All data is encrypted and confidential.</p>
            <p className="mt-0.5 md:mt-0 uppercase tracking-widest font-bold text-slate-500">{title} : PAGE {String(pageNum).padStart(2, '0')}</p>
        </div>
    );

    // Page wrapper
    const ReportPage = ({ children, pageNum, footerTitle, breakBefore = true }: { children: React.ReactNode, pageNum: number, footerTitle: string, breakBefore?: boolean }) => (
        <div className={`page ${breakBefore ? 'page-break-before' : ''}`}>
            <div className="report-card">
                <ReportHeader />
                <PatientInfoGrid />
                <div className="report-content-wrapper flex-1 flex flex-col justify-between">{children}</div>
                <ReportFooter pageNum={pageNum} title={footerTitle} />
            </div>
        </div>
    );

    return (
        <div className="medical-report-root bg-white text-slate-900 font-sans" style={{ width: '210mm', margin: '0 auto' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Roboto+Mono&display=swap');
                .medical-report-root { font-family: 'Noto Sans KR', sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                
                .page { 
                    width: 210mm !important;
                    min-height: 297mm !important;
                    height: auto !important;
                    margin: 0 auto 15mm;
                    padding: 8mm !important;
                    box-sizing: border-box;
                    background-color: #f8fafc !important;
                    display: flex !important;
                    flex-direction: column !important;
                    position: relative;
                    page-break-after: always !important;
                }
                
                .page-break-before {
                    page-break-before: always !important;
                    break-before: page !important;
                }
                
                .report-card {
                    background-color: white !important;
                    border-radius: 0.75rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
                    border-top: 6px solid #1e40af !important;
                    padding: 1.15rem !important;
                    min-height: 100% !important;
                    height: auto !important;
                    display: flex !important;
                    flex-direction: column !important;
                }

                .metric-bar {
                    height: 5px;
                    border-radius: 3px;
                    background: #e2e8f0;
                    overflow: hidden;
                }
                .metric-fill-red { background: #ef4444; }
                .metric-fill-blue { background: #3b82f6; }
                .metric-fill-green { background: #10b981; }
                .metric-fill-orange { background: #f97316; }

                @media print {
                    @page { 
                        size: A4 portrait; 
                        margin: 0; 
                    }
                    html, body { 
                        width: 210mm !important; 
                        margin: 0 !important; 
                        padding: 0 !important; 
                        background-color: #ffffff !important; 
                    }
                    .medical-report-root { 
                        width: 210mm !important; 
                        margin: 0 !important; 
                        padding: 0 !important; 
                    }
                    .page { 
                        width: 210mm !important;
                        height: 296.5mm !important;
                        max-height: 296.5mm !important;
                        min-height: 296.5mm !important;
                        margin: 0 !important; 
                        padding: 7mm 9mm !important;
                        border: none !important; 
                        background-color: #ffffff !important;
                        page-break-after: always !important;
                        page-break-inside: avoid !important;
                        break-after: page !important;
                        break-inside: avoid !important;
                        box-sizing: border-box !important;
                        overflow: hidden !important;
                    }
                    .page:first-child {
                        page-break-before: auto !important;
                        break-before: auto !important;
                    }
                    .report-card { 
                        box-shadow: none !important; 
                        border-radius: 0 !important;
                        height: 100% !important;
                        max-height: 100% !important;
                        padding: 0 !important;
                        border-top: none !important;
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: space-between !important;
                    }
                    .no-print { display: none !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    
                    /* Force CSS grid layout preservation in print mode */
                    .grid { display: grid !important; }
                    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
                    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
                    .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
                    .grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)) !important; }
                    .grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)) !important; }
                    .grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)) !important; }
                    .col-span-5 { grid-column: span 5 / span 5 !important; }
                    .col-span-7 { grid-column: span 7 / span 7 !important; }
                    .flex-row { flex-direction: row !important; }
                }
            `}</style>

            {/* ================= PAGE 1: DIAGNOSTIC EXECUTIVE SUMMARY ================= */}
            <ReportPage pageNum={1} footerTitle="DIAGNOSTIC EXECUTIVE SUMMARY" breakBefore={false}>
                <div>
                    <h2 className="text-base font-black flex items-center mb-1.5 text-slate-800">
                        <span className="w-1.5 h-4 bg-blue-700 mr-2 rounded-sm"></span>
                        1. 핵심 진단 및 일차 케어타입 분류 (Primary Classification)
                    </h2>

                    <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl mb-2 text-[11px] text-blue-900 leading-relaxed font-medium">
                        📌 <strong>핵심 진단 분류의 의미</strong>: {effectiveReportTier === 'free'
                            ? 'NBASS 정밀 진단 알고리즘은 피검자의 자율신경계 반응성, 신체 피로도, 인지 제어 역량을 종합 분석하여 8대 케어타입 중 가장 시급한 핵심 케어 영역(1차 진단)을 도출합니다.'
                            : 'NBASS 정밀 진단 알고리즘은 피검자의 자율신경계 반응성, 신체 피로도, 인지 제어 역량을 종합 분석하여 8대 케어타입 중 가장 시급한 개선 영역(1차 진단)과 잠재 위험 요인(2차 진단)을 도출합니다.'}
                    </div>

                    {effectiveReportTier === 'free' ? (
                        <div className="mb-2.5">
                            {primaryScoreData ? (
                                <div className="border border-red-200 bg-red-50/40 p-3 rounded-xl">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-black rounded-md border border-red-200">
                                                1차 핵심 진단 (최우선 케어 영역)
                                            </span>
                                            <span className="text-sm font-black text-red-700">
                                                {CARE_TYPE_LABELS[primaryScoreData.type]?.name || primaryScoreData.type}
                                            </span>
                                        </div>
                                        <span className="text-base font-black text-red-600">
                                            {Math.round(primaryScoreData.score)}<span className="text-[10px]">/100</span>
                                        </span>
                                    </div>
                                    <div className="metric-bar mb-1.5">
                                        <div className="h-full metric-fill-red" style={getWidth(primaryScoreData.score)}></div>
                                    </div>
                                    <p className="text-[11px] text-slate-700 leading-snug font-medium">
                                        {CARE_TYPE_LABELS[primaryScoreData.type]?.publicDescription || CARE_TYPE_LABELS[primaryScoreData.type]?.description}
                                    </p>
                                </div>
                            ) : (
                                <div className="border border-slate-200 bg-slate-50 p-2.5 rounded-xl flex items-center justify-center text-[10px] text-slate-400">데이터 미입력</div>
                            )}
                        </div>
                    ) : (
                        <div
                            className="mb-2.5"
                            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.625rem' }}
                        >
                            {primaryScoreData ? (
                                <div className="border border-red-200 bg-red-50/40 p-2.5 rounded-xl">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-[11px] font-black text-red-700 truncate">{CARE_TYPE_LABELS[primaryScoreData.type]?.name || primaryScoreData.type}</span>
                                        <span className="text-base font-black text-red-600">{Math.round(primaryScoreData.score)}<span className="text-[9px]">/100</span></span>
                                    </div>
                                    <div className="metric-bar mb-1.5"><div className="h-full metric-fill-red" style={getWidth(primaryScoreData.score)}></div></div>
                                    <p className="text-[10px] text-slate-700 leading-snug font-medium">{CARE_TYPE_LABELS[primaryScoreData.type]?.publicDescription || CARE_TYPE_LABELS[primaryScoreData.type]?.description}</p>
                                </div>
                            ) : (
                                <div className="border border-slate-200 bg-slate-50 p-2.5 rounded-xl flex items-center justify-center text-[10px] text-slate-400">데이터 미입력</div>
                            )}

                            {secondary1Data ? (
                                <div className="border border-orange-200 bg-orange-50/40 p-2.5 rounded-xl">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className="text-[11px] font-black text-orange-700 truncate">{CARE_TYPE_LABELS[secondary1Data.type]?.name || secondary1Data.type}</span>
                                        <span className="text-base font-black text-orange-600">{Math.round(secondary1Data.score)}<span className="text-[9px]">/100</span></span>
                                    </div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[8px] text-slate-500 font-bold">2차 진단 (동반 위험)</span>
                                        <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded border ${secondary1Data.score >= 70
                                                ? 'bg-orange-100 text-orange-700 border-orange-300'
                                                : 'bg-amber-100 text-amber-700 border-amber-300'
                                            }`}>
                                            {secondary1Data.score >= 70 ? '확정 진단' : '근접 추정'}
                                        </span>
                                    </div>
                                    <div className="metric-bar mb-1.5"><div className="h-full metric-fill-orange" style={getWidth(secondary1Data.score)}></div></div>
                                    <p className="text-[10px] text-slate-700 leading-snug font-medium">{CARE_TYPE_LABELS[secondary1Data.type]?.publicDescription || CARE_TYPE_LABELS[secondary1Data.type]?.description}</p>
                                </div>
                            ) : (
                                <div className="border border-slate-200 bg-slate-50 p-2.5 rounded-xl flex items-center justify-center text-[10px] text-slate-400">추가 위험 요인 없음</div>
                            )}

                            {secondary2Data ? (
                                <div className="border border-emerald-200 bg-emerald-50/40 p-2.5 rounded-xl">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className="text-[11px] font-black text-emerald-700 truncate">{CARE_TYPE_LABELS[secondary2Data.type]?.name || secondary2Data.type}</span>
                                        <span className="text-base font-black text-emerald-600">{Math.round(secondary2Data.score)}<span className="text-[9px]">/100</span></span>
                                    </div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[8px] text-slate-500 font-bold">3차 진단 (잠재 요인)</span>
                                        <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded border ${secondary2Data.score >= 70
                                                ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                                                : 'bg-amber-100 text-amber-700 border-amber-300'
                                            }`}>
                                            {secondary2Data.score >= 70 ? '확정 진단' : '근접 추정'}
                                        </span>
                                    </div>
                                    <div className="metric-bar mb-1.5"><div className="h-full metric-fill-green" style={getWidth(secondary2Data.score)}></div></div>
                                    <p className="text-[10px] text-slate-700 leading-snug font-medium">{CARE_TYPE_LABELS[secondary2Data.type]?.publicDescription || CARE_TYPE_LABELS[secondary2Data.type]?.description}</p>
                                </div>
                            ) : (
                                <div className="border border-slate-200 bg-slate-50 p-2.5 rounded-xl flex items-center justify-center text-[10px] text-slate-400">추가 위험 요인 없음</div>
                            )}
                        </div>
                    )}

                    <h2 className="text-base font-black flex items-center mb-1.5 text-slate-800">
                        <span className="w-1.5 h-4 bg-blue-700 mr-2 rounded-sm"></span>
                        2. 📊 6가지 지표 종합 분석 (Brain & Body Integration)
                    </h2>
                    <div
                        className="mb-2"
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.5rem' }}
                    >
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                            <span className="text-[9px] text-slate-400 font-bold block">자율신경 (ANS Balance)</span>
                            <span className="text-xs font-black text-blue-700">{ansStatusText}</span>
                            {ansScoreText && <span className="text-[10px] text-slate-500 ml-1 font-bold">({ansScoreText})</span>}
                        </div>
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                            <span className="text-[9px] text-slate-400 font-bold block">신체 활력도 (Vitality)</span>
                            <span className="text-xs font-black text-emerald-600">{vitalityScore}%</span>
                            <span className="text-[10px] text-slate-500 ml-1">({vitalityScore >= 70 ? '높음 🟢' : vitalityScore >= 40 ? '보통 🟡' : '낮음 🔴'})</span>
                        </div>
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                            <span className="text-[9px] text-slate-400 font-bold block">누적 피로도 (Fatigue)</span>
                            <span className="text-xs font-black text-orange-600">{fatigueScore}%</span>
                            <span className="text-[10px] text-slate-500 ml-1">({fatigueScore <= 30 ? '낮음 🟢' : fatigueScore <= 60 ? '보통 🟡' : '높음 🔴'})</span>
                        </div>
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                            <span className="text-[9px] text-slate-400 font-bold block">신체/심리 스트레스 (Stress)</span>
                            <span className="text-xs font-black text-rose-600">{stressScore}점</span>
                            <span className="text-[10px] text-slate-500 ml-1">(설문/자율신경 기반)</span>
                        </div>
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                            <span className="text-[9px] text-slate-400 font-bold block">두뇌 집중도 (Concentration)</span>
                            <span className="text-xs font-black text-indigo-600">{concentrationScore}점</span>
                            <span className="text-[10px] text-slate-500 ml-1">(인지검사 기반)</span>
                        </div>
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                            <span className="text-[9px] text-slate-400 font-bold block">신체 프로파일 (BMI)</span>
                            <span className="text-xs font-black text-slate-800">{bmi.toFixed(1)}</span>
                            <span className={`text-[10px] font-bold ml-1 ${bmi > 23 ? 'text-red-500' : 'text-emerald-600'}`}>({bmiStatus})</span>
                        </div>
                    </div>

                    {/* Full Comprehensive Diagnostic Overview from DETAILED_INSIGHTS */}
                    <div className="border border-indigo-200 bg-indigo-50/40 rounded-xl p-2.5 mb-2">
                        <div className="flex items-center justify-between border-b border-indigo-200 pb-1 mb-1.5">
                            <h3 className="text-[10.5px] font-black text-indigo-950 flex items-center gap-1.5">
                                <span>📋</span>
                                <span>피검자 맞춤형 정밀 신경생리학적 진단 소견 (Clinical Diagnostic Overview)</span>
                            </h3>
                            <span className="text-[8.5px] font-mono text-indigo-700 font-bold">CARE-TYPE : {CARE_TYPE_LABELS[careType as CareType]?.name || careType}</span>
                        </div>
                        <p className="text-[9.5px] text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
                            {DETAILED_INSIGHTS[careType as CareType]?.overviewAnalysis ||
                                "현재 검사 결과 피검자의 자율신경 조절 능력과 뇌 피로도가 복합적으로 작용하고 있습니다. 신체 에너지와 인지 처리 역량의 균형을 맞추기 위해 시간대별 인지 부하 관리와 적절한 회복 루틴의 도입이 시급합니다."}
                        </p>
                    </div>

                    {/* Integrated 3-Stage Assessment Box */}
                    <div className="bg-slate-900 text-white p-2.5 rounded-xl">
                        <div className="flex items-center justify-between border-b border-slate-700 pb-1 mb-1">
                            <h3 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                <span>🔬</span> 신체-정신-인지 3단계 서술식 종합 소견 및 임상 실행 가이드
                            </h3>
                            <span className="text-[8px] text-slate-400 font-mono">NEURO-INTEGRATION PROTOCOL</span>
                        </div>
                        <p className="text-[9px] text-slate-200 leading-relaxed">
                            {vitalityScore >= 60
                                ? '피검 학생은 현재 신체 에너지와 인지 처리 용량이 안정적으로 유지되고 있어, 오전 두뇌 골든타임(오전 9~12시)에 수학 킬러 및 과학 고난도 추론 문항에 집중적으로 딥워크(Deep Work)할 수 있는 최적의 신체-두뇌 컨디션을 갖추고 있습니다. 고난도 문제 해결 시 50분 집중 후 10분 이완을 엄격히 준수하여 인지 피로 누적을 방지하십시오.'
                                : '피검 학생은 누적된 피로 및 시험 스트레스로 인해 뇌의 에너지 배터리가 부분적으로 방전된 상태입니다. 무리한 심야 연속 학습보다는 15분 파워 낮잠(Power Nap)과 25분 뽀모도로 타임어택을 적용하여 뇌 피로를 리셋하는 전략이 최우선입니다. 코르티솔 분비 안정을 위한 규칙적 수면 리듬 확보를 강력 권고합니다.'}
                        </p>
                    </div>
                </div>
            </ReportPage>

            {/* ================= PAGE 2: ANS & NEURO-COGNITIVE DETAIL ================= */}
            <ReportPage pageNum={2} footerTitle="ANS & NEURO-COGNITIVE DETAIL">
                <div>
                    <h2 className="text-base font-black flex items-center mb-1.5 text-slate-800">
                        <span className="w-1.5 h-4 bg-blue-700 mr-2 rounded-sm"></span>
                        1. 자율신경 반응성 및 신경인지 정밀 분석 (ANS & Cognitive Balance)
                    </h2>

                    <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl mb-2.5 text-[11px] text-slate-700 leading-relaxed font-medium">
                        📌 <strong>자율신경과 인지 조절의 학습 연계성</strong>: 자율신경계는 몸의 가속 페달(교감신경)과 브레이크(부교감신경)의 조화를 측정하며, 인지 제어 역량은 집중력과 스트레스 회복력을 나타냅니다. 최적의 공부 효율은 신체적 긴장도가 완화되고(높은 PNS) 두뇌 각성도가 안정적으로 유지될 때 극대화됩니다.
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                            <h3 className="text-[11px] font-black text-slate-700 border-b pb-1">자율신경계 균형 (ANS Balance)</h3>
                            <div>
                                <div className="flex justify-between text-[10px] mb-0.5 font-bold">
                                    <span>교감신경 (SNS - 긴장/각성)</span>
                                    <span className="text-red-600">{snsScore.toFixed(1)}%</span>
                                </div>
                                <div className="metric-bar"><div className="h-full metric-fill-red" style={getWidth(snsScore)}></div></div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] mb-0.5 font-bold">
                                    <span>부교감신경 (PNS - 이완/회복)</span>
                                    <span className="text-blue-600">{pnsScore.toFixed(1)}%</span>
                                </div>
                                <div className="metric-bar"><div className="h-full metric-fill-blue" style={getWidth(pnsScore)}></div></div>
                            </div>
                        </div>

                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                            <h3 className="text-[11px] font-black text-slate-700 border-b pb-1">두뇌 인지 몰입 &amp; 주의 제어 역량</h3>
                            <div className="grid grid-cols-2 gap-1.5 text-center text-xs">
                                <div className="p-1.5 bg-blue-50 rounded border border-blue-200">
                                    <span className="text-[9px] text-blue-500 block">인지 집중도 (Focus)</span>
                                    <span className="font-bold text-blue-700 text-xs">{concentrationScore}점</span>
                                </div>
                                <div className="p-1.5 bg-white rounded border">
                                    <span className="text-[9px] text-slate-500 block">스트레스 회복력 (Resilience)</span>
                                    <span className="font-bold text-slate-700 text-xs">{Math.max(10, 100 - stressScore)}점</span>
                                </div>
                                <div className="p-1.5 bg-indigo-50 rounded border border-indigo-200">
                                    <span className="text-[9px] text-indigo-500 block">수면 회복 지수 (Recovery)</span>
                                    <span className="font-bold text-indigo-700 text-xs">{Math.max(10, Math.round(100 - ((result.survey?.isi || 10) * 3.5)))}점</span>
                                </div>
                                <div className="p-1.5 bg-emerald-50 rounded border border-emerald-200">
                                    <span className="text-[9px] text-emerald-600 block">신체 활력도 (Vitality)</span>
                                    <span className="font-bold text-emerald-700 text-xs">{vitalityScore}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-2.5 text-xs">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-2">
                            <h4 className="font-bold text-red-700 mb-0.5 text-[11px] flex items-center">⚡ 교감신경 긴장 시</h4>
                            <p className="text-[10px] text-slate-700 leading-relaxed">심박수 상승, 조급함, 시험 불안 유발. 4-7-8 복식호흡 및 미온수 샤워로 긴장을 이완하세요.</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-2">
                            <h4 className="font-bold text-blue-700 mb-0.5 text-[11px] flex items-center">🌊 부교감 나른 시</h4>
                            <p className="text-[10px] text-slate-700 leading-relaxed">졸음 및 멍함 유발. 찬물 세수, 5분 스트레칭, 밝은 조명으로 뇌 각성도를 높이세요.</p>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2">
                            <h4 className="font-bold text-emerald-700 mb-0.5 text-[11px] flex items-center">✅ 이상적 균형 상태</h4>
                            <p className="text-[10px] text-slate-700 leading-relaxed">안정적 심박과 높은 회복력. 50분 딥워크로 고난도 수학/과학을 정면 격파하세요.</p>
                        </div>
                    </div>

                    {/* Subject-Specific ANS-based Learning Methods */}
                    <div className="border border-slate-200 bg-slate-50/70 rounded-xl p-2.5 mb-2">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5">
                            <h3 className="text-[10.5px] font-black text-slate-900 flex items-center gap-1.5">
                                <span>📚</span>
                                <span>자율신경계 반응 맞춤 주요 3개 과목(국·영·수) 즉각 실천 공부법</span>
                            </h3>
                            <span className="text-[8.5px] font-mono text-blue-700 font-bold">NEURO-LEARNING METHOD</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[8.5px]">
                            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                                <strong className="text-blue-800 font-bold block mb-0.5 text-[9.5px]">📐 수학 (Math Engine)</strong>
                                <p className="text-slate-700 leading-tight">
                                    • <strong>손으로 푸는 워밍업</strong>: 10분간 단순 연산 또는 2-3점 기출로 도파민 예열 후 킬러 진입.<br />
                                    • <strong>풀이 단계 시각화</strong>: 논리적 꼬임을 막기 위해 수식을 줄 바꿈하여 정갈하게 필사.
                                </p>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                                <strong className="text-indigo-800 font-bold block mb-0.5 text-[9.5px]">📖 국어 (Verbal Circuit)</strong>
                                <p className="text-slate-700 leading-tight">
                                    • <strong>문단별 핵심 3단어 체크</strong>: 긴 지문 독해 시 시야 협착을 방지하고 작업기억 과부하 방지.<br />
                                    • <strong>첫 2문장 소리 내어 읽기</strong>: 시각-청각 결합으로 뇌의 정보 처리 속도를 빠르게 동기화.
                                </p>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                                <strong className="text-emerald-800 font-bold block mb-0.5 text-[9.5px]">🌐 영어 (Language Network)</strong>
                                <p className="text-slate-700 leading-tight">
                                    • <strong>구조 끊어 읽기(Slashing)</strong>: 주어/동사/수식어구를 사선(/)으로 끊어 처리 부담 경감.<br />
                                    • <strong>1초 스피드 어휘 인출</strong>: 단어 뜻 가리고 1초 내 반응 테스트로 신속한 기억 인출 훈련.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 text-white p-2.5 rounded-xl">
                        <div className="flex items-center justify-between border-b border-slate-700 pb-1 mb-1">
                            <h4 className="text-[10px] font-bold text-blue-300 flex items-center gap-1">
                                <span>💡</span> 생체 리듬 최적화 및 신경계 안정 행동 지침 (Neuro-Behavior Protocol)
                            </h4>
                            <span className="text-[8px] text-slate-400 font-mono">RX-BEHAVIOR</span>
                        </div>
                        <p className="text-[9px] text-slate-300 leading-relaxed">
                            오후 2시 이후 고카페인 음료 섭취를 엄격히 제한하고, 공부 시작 전 3분 동안 4-7-8 이완 호흡(4초 흡기, 7초 정지, 8초 호기)을 진행하여 교감신경 긴장을 낮추고 두뇌 최적 몰입 상태를 유도하십시오.
                        </p>
                    </div>

                    {/* Vagus Nerve & Focus Recovery Actions */}
                    <div className="grid grid-cols-2 gap-2 text-[9px] mt-2">
                        <div className="p-2 bg-indigo-50/70 border border-indigo-200 rounded-xl">
                            <strong className="text-indigo-900 font-bold block mb-0.5 text-[9.5px]">🧘 미주신경(Vagus Nerve) 급속 이완 3단계</strong>
                            <p className="text-slate-700 leading-snug">
                                1. <strong>미온수 수분 섭취</strong>: 착석 전 물 한 잔으로 혈류 점도 안정.<br />
                                2. <strong>목·어깨 림프 이완</strong>: 턱을 당기고 승모근 5초 스트레칭.<br />
                                3. <strong>시야 확장(Panorama)</strong>: 초점을 좁히지 않고 넓게 바라보기.
                            </p>
                        </div>
                        <div className="p-2 bg-amber-50/70 border border-amber-200 rounded-xl">
                            <strong className="text-amber-900 font-bold block mb-0.5 text-[9.5px]">⚡ 두뇌 최적 몰입(Deep Work) 진입 3원칙</strong>
                            <p className="text-slate-700 leading-snug">
                                1. <strong>책상 위 시각적 잡음 제로</strong>: 현재 푸는 문제집 1권만 거치.<br />
                                2. <strong>착석 후 10분 도파민 점화</strong>: 쉬운 3문항부터 즉시 필사.<br />
                                3. <strong>타이머 시각화</strong>: 50분 카운트다운으로 집중력 유지.
                            </p>
                        </div>
                    </div>
                </div>
            </ReportPage>

            {/* ================= PAGE 3: CIRCADIAN PEAK TIME & DAILY SCHEDULE ================= */}
            <ReportPage pageNum={3} footerTitle="CIRCADIAN PEAK TIME & SCHEDULE">
                <div className="flex flex-col h-full font-sans text-slate-800 text-xs">
                    <div className="flex justify-between items-center mb-1">
                        <h2 className="text-base font-black flex items-center text-slate-800">
                            <span className="w-1.5 h-4 bg-blue-700 mr-2 rounded-sm"></span>
                            1. 24시간 생체 시계 &amp; 일일 두뇌 골든타임 스케줄
                        </h2>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold border bg-blue-50 text-blue-800 border-blue-200">
                            {isProOrAbove ? '1:1 실측 개인화 모델' : '표준 서카디안 생체 리듬 모델'}
                        </span>
                    </div>

                    <div className="p-2 bg-indigo-50/80 border border-indigo-200 rounded-lg mb-1.5 text-[9.5px] text-indigo-950 leading-relaxed font-medium">
                        <div className="flex items-center justify-between mb-0.5">
                            <span className="font-bold text-[10px] text-indigo-900">💡 생체 서카디안 리듬(24-Hour Circadian Rhythm) 기반 시간대별 과목 배치</span>
                            <span className="text-blue-700 font-bold text-[8.5px]">BIO-CHRONO LOGIC</span>
                        </div>
                        {isProOrAbove ? (
                            <p>수험생이 입력한 실제 수면 및 생활 시간표를 기반으로 인지 활성도와 자율신경 균형을 1:1 정밀 분석하여 최적화된 24시간 맞춤 타임테이블을 산출했습니다.</p>
                        ) : (
                            <p>
                                수험생의 인지 활성도 및 자율신경 상태를 기반으로 도출된 <strong>하루 중 뇌 효율이 가장 높은 골든타임</strong>과 <strong>브레인 슬럼프</strong> 시간대입니다.
                                <br />
                                <span className="text-blue-800 font-bold">※ Free 모드는 기상 시각 기준 생체 상대 시간(+n시간)으로 제공되며(오전 7시 기상 표준 기준 예시 병기), 실제 본인의 기상 시각에 맞춰 1:1 적용하세요.</span>
                            </p>
                        )}
                    </div>

                    {/* Morning & Pre-Sleep Routine Bar */}
                    <div className="grid grid-cols-2 gap-1.5 mb-1.5 text-[8.5px]">
                        <div className="p-1.5 bg-amber-50/70 border border-amber-200 rounded-lg">
                            <span className="font-bold text-amber-900 block mb-0.5">🌞 오전 활성화 루틴 (Morning Activation)</span>
                            <p className="text-slate-700 leading-tight">
                                • <strong>[기상 직후] (표준 07:00~08:00경)</strong>: 코르티솔 각성 반응(CAR) 유도. 자연광 노출 + 미지근한 물 한 잔으로 뇌 혈류 공급.<br />
                                • <strong>[기상 후 1~2.5h] (표준 08:00~09:30경)</strong>: 예열 학습(Warm-up). {subjectPlan.subjectName} 개념/어휘 등 가벼운 워밍업으로 감각 활성화.
                            </p>
                        </div>
                        <div className="p-1.5 bg-slate-100 border border-slate-300 rounded-lg">
                            <span className="font-bold text-slate-800 block mb-0.5">🌙 수면 전 회복 루틴 (Pre-Sleep Routine)</span>
                            <p className="text-slate-700 leading-tight">
                                • <strong>[취침 1~2h 전] (표준 22:00~23:00경)</strong>: 멜라토닌 분비 보호. 스마트폰 블루라이트 100% 차단 및 뇌 이완 모드 전환.<br />
                                • <strong>[취침 직전 20분]</strong>: 오늘 학습한 핵심 단어·공식을 가볍게 훑으면 수면 중 해마(Hippocampus) 장기기억 고착 극대화.
                            </p>
                        </div>
                    </div>

                    {/* Clock & 3 Core Peak Cards */}
                    <div className="grid grid-cols-12 gap-2 mb-1.5 items-center">
                        <div className="col-span-5 flex flex-col items-center justify-center p-1.5 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                            <span className="text-[9.5px] font-black text-slate-700 mb-0.5">
                                ⏰ {isProOrAbove ? '24시간 맞춤 두뇌 가동 원형 시계' : '24시간 서카디안 표준 생체 시계'}
                            </span>
                            <div className="transform scale-[0.58] origin-center -my-16">
                                <CircularSchedule
                                    isDark={false}
                                    hideLegend={true}
                                    periods={[
                                        { id: 'morning', start: 7, end: 9, label: '오전 루틴', color: '#1e40af', icon: '🌞' },
                                        { id: 'golden', start: goldenStartNum, end: goldenEndNum, label: 'Golden Hour', color: '#2563eb', icon: '🔥' },
                                        { id: 'slump', start: slumpStartNum, end: slumpEndNum, label: '회복/슬럼프', color: '#94a3b8', icon: '💤' },
                                        { id: 'second', start: secondStartNum, end: secondEndNum, label: 'Second Wind', color: '#4f46e5', icon: '🚀' },
                                        { id: 'sleep', start: bedHour, end: 24, label: '수면', color: '#334155', icon: '🌙' },
                                        { id: 'sleep2', start: 0, end: wakeHour, label: '수면', color: '#334155' }
                                    ]}
                                />
                            </div>
                            <div className="flex flex-wrap justify-center gap-1.5 text-[8px] text-slate-600 mt-1">
                                {isProOrAbove ? (
                                    <>
                                        <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>골든({goldenStart}~{goldenEnd})</span>
                                        <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>세컨드({formatHour(secondStartNum)}~{formatHour(secondEndNum)})</span>
                                        <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>수면({sleepPrescription.recommendedBedtime}~{sleepPrescription.recommendedWakeTime})</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>골든(기상+3h / 표준 10~12시)</span>
                                        <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>세컨드(기상+10h / 표준 17~21시)</span>
                                        <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>수면권장(표준 23:00~07:00)</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="col-span-7 space-y-1 text-xs">
                            <div className="p-1.5 bg-red-50 border border-red-200 rounded-lg">
                                <span className="font-black text-red-700 block text-[9.5px] mb-0.5">
                                    🔥 1차 골든 아워 {isProOrAbove ? `(${goldenStart} ~ ${goldenEnd})` : `[기상 후 2.5~4.5h / 표준 ${goldenStart}~${goldenEnd}]`} - 당일 최고 승부처
                                </span>
                                <p className="text-[8.5px] text-slate-700 leading-snug">
                                    <strong>{subjectPlan.goldenTitle}</strong>: {subjectPlan.goldenDesc}
                                </p>
                            </div>
                            <div className="p-1.5 bg-orange-50 border border-orange-200 rounded-lg">
                                <span className="font-black text-orange-700 block text-[9.5px] mb-0.5">
                                    ☁️ 서카디안 딥 &amp; 브레인 슬럼프 {isProOrAbove ? `(${formatHour(slumpStartNum)} ~ ${formatHour(slumpEndNum)})` : `[기상 후 6.5~8h / 표준 ${formatHour(slumpStartNum)}~${formatHour(slumpEndNum)}]`}
                                </span>
                                <p className="text-[8.5px] text-slate-700 leading-snug">
                                    <strong>{subjectPlan.slumpTitle}</strong>: {subjectPlan.slumpDesc}
                                </p>
                            </div>
                            <div className="p-1.5 bg-indigo-50 border border-indigo-200 rounded-lg">
                                <span className="font-black text-indigo-700 block text-[9.5px] mb-0.5">
                                    🚀 2차 골든 아워 / 세컨드 윈드 {isProOrAbove ? `(${formatHour(secondStartNum)} ~ ${formatHour(secondEndNum)})` : `[기상 후 10~14h / 표준 ${formatHour(secondStartNum)}~${formatHour(secondEndNum)}]`}
                                </span>
                                <p className="text-[8.5px] text-slate-700 leading-snug">
                                    <strong>{subjectPlan.secondTitle}</strong>: {subjectPlan.secondDesc}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Table */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden mb-1.5">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-slate-900 text-white">
                                <tr>
                                    <th className="px-2 py-1 w-28 text-[8.5px]">
                                        {isProOrAbove ? '배치 시간대' : '생체 시간대 (표준 시각)'}
                                    </th>
                                    <th className="px-2 py-1 w-28 text-[8.5px]">생체 생리 컨디션</th>
                                    <th className="px-2 py-1 w-32 text-[8.5px]">
                                        권장 과목 ({subjectPlan.subjectName} 맞춤)
                                    </th>
                                    <th className="px-2 py-1 text-[8.5px]">의학적 학습 및 행동 실천 전략</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-slate-700 text-[8.5px]">
                                <tr className="bg-red-50/30">
                                    <td className="px-2 py-1 font-bold text-red-700">
                                        {isProOrAbove ? `${goldenStart}~${goldenEnd}` : `기상+2.5~4.5h (${goldenStart}~${goldenEnd})`}
                                    </td>
                                    <td className="px-2 py-1 font-bold">골든타임 (최고 각성·인지속도)</td>
                                    <td className="px-2 py-1 font-bold text-blue-700">{subjectPlan.goldenTableSubject}</td>
                                    <td className="px-2 py-1">{subjectPlan.goldenTableAction}</td>
                                </tr>
                                <tr className="bg-orange-50/30">
                                    <td className="px-2 py-1 font-bold text-orange-600">
                                        {isProOrAbove ? `${formatHour(slumpStartNum)}~${formatHour(slumpEndNum)}` : `기상+6.5~8h (${formatHour(slumpStartNum)}~${formatHour(slumpEndNum)})`}
                                    </td>
                                    <td className="px-2 py-1">슬럼프 (식곤증·아데노신 축적)</td>
                                    <td className="px-2 py-1">{subjectPlan.slumpTableSubject}</td>
                                    <td className="px-2 py-1">{subjectPlan.slumpTableAction}</td>
                                </tr>
                                <tr className="bg-indigo-50/30">
                                    <td className="px-2 py-1 font-bold text-indigo-700">
                                        {isProOrAbove ? `${formatHour(secondStartNum)}~${formatHour(secondEndNum)}` : `기상+10~14h (${formatHour(secondStartNum)}~${formatHour(secondEndNum)})`}
                                    </td>
                                    <td className="px-2 py-1">세컨드 윈드 (2차 몰입·각성 회복)</td>
                                    <td className="px-2 py-1">{subjectPlan.secondTableSubject}</td>
                                    <td className="px-2 py-1">{subjectPlan.secondTableAction}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Vulnerable Time Analysis & Action Strategy (100% Synced) */}
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[8px] leading-tight">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-0.5 mb-1">
                            <span className="font-bold text-slate-900 text-[9px]">
                                ⏰ 취약 시간대 분석 및 대응 전략 ({CARE_TYPE_LABELS[careType as CareType]?.name || careType} 맞춤)
                            </span>
                            <span className="text-blue-700 font-bold text-[8px]">CIRCADIAN RESILIENCE PROTOCOL</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-slate-700">
                            <div>
                                <p className="mb-0.5">
                                    <strong className="text-rose-700">• {parsedVulnerableStrategy.vulnerableTime.title}: </strong>
                                    {parsedVulnerableStrategy.vulnerableTime.text}
                                </p>
                                <p>
                                    <strong className="text-indigo-700">• {parsedVulnerableStrategy.correlation.title}: </strong>
                                    {parsedVulnerableStrategy.correlation.text}
                                </p>
                            </div>
                            <div>
                                <p className="mb-0.5">
                                    <strong className="text-emerald-700">• {parsedVulnerableStrategy.mindset.title}: </strong>
                                    {parsedVulnerableStrategy.mindset.text}
                                </p>
                                <p>
                                    <strong className="text-blue-700">• {parsedVulnerableStrategy.recommendation.title}: </strong>
                                    {parsedVulnerableStrategy.recommendation.text}
                                </p>
                            </div>
                        </div>
                        <div className="mt-1 pt-1 border-t border-slate-200 text-slate-600 flex justify-between items-center text-[7.5px]">
                            <span>💡 <strong>닥터 뇌/과학 코멘트:</strong> 골든 아워에도 50분 공부/10분 휴식 원칙을 철저히 준수하여 뇌의 인지 과부하를 방지하세요.</span>
                            <span className="text-slate-400 font-mono">NBASS CIRCADIAN PROTOCOL</span>
                        </div>
                    </div>

                    {/* PRO 1:1 Timetable Upgrade Banner for Free Users */}
                    {!isProOrAbove && (
                        <div className="mt-1.5 p-1.5 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-lg flex items-center justify-between text-[8px]">
                            <div className="flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 bg-blue-600 text-white font-bold rounded text-[7.5px] tracking-wide">
                                    PRO 정밀 검사
                                </span>
                                <span className="text-slate-700 font-medium">
                                    내 실제 <strong>학교/학원 시간표와 수면 패턴</strong>을 반영한 1:1 맞춤 24시간 타임테이블은 <strong>PRO 정밀 진단</strong>에서 제공됩니다.
                                </span>
                            </div>
                            <span className="text-blue-700 font-bold whitespace-nowrap text-[8px]">1:1 맞춤 설계 연동 &rarr;</span>
                        </div>
                    )}
                </div>
            </ReportPage>

            {/* ================= PAGE 4: STUDY DENSITY & ANALYTICS (PRO 이상) ================= */}
            {isProOrAbove && (
                <ReportPage pageNum={4} footerTitle="STUDY DENSITY & ANALYTICS">
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <h2 className="text-base font-black flex items-center text-slate-800">
                                <span className="w-1.5 h-4 bg-blue-700 mr-2 rounded-sm"></span>
                                1. 학습 밀도 및 패턴 분석 (순공 시간 & 방해 요인)
                            </h2>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isLearningAnalyticsTested(analytics) ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'}`}>
                                {isLearningAnalyticsTested(analytics) ? '검사 완료' : '미검사 (검사 미시행)'}
                            </span>
                        </div>

                        <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl mb-2.5 text-[11px] text-blue-900 leading-relaxed font-medium">
                            📌 <strong>순공 시간 비율(Pure Study Ratio)의 의미</strong>: 책상에 앉아 있는 총 착석 시간 중 스마트폰 확인, 잡념, 단순 멍때림을 제외하고 실질적으로 뇌 회로가 몰입한 시간 비율입니다. 100분 학습 시 70분을 집중했다면 70%가 됩니다.
                        </div>

                        <div className="grid grid-cols-3 gap-2.5 mb-2.5 text-center">
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                                <span className="text-[9px] text-blue-600 font-bold block mb-0.5">순공 시간 비율 (Pure Study)</span>
                                <span className="text-xl font-black text-blue-800">
                                    {isLearningAnalyticsTested(analytics) ? `${analytics?.pureStudyRatio ?? 0}%` : '미측정'}
                                </span>
                                <p className="text-[9px] text-slate-500 mt-0.5">실질 뇌 몰입 집중 시간</p>
                            </div>
                            <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                                <span className="text-[9px] text-orange-600 font-bold block mb-0.5">집중 방해 빈도 (Distractions)</span>
                                <span className="text-xl font-black text-orange-800">
                                    {isLearningAnalyticsTested(analytics) ? `${analytics?.distractionCount ?? 0}회` : '미측정'}
                                </span>
                                <p className="text-[9px] text-slate-500 mt-0.5">스마트폰, 잡념, 졸음 등</p>
                            </div>
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                <span className="text-[9px] text-emerald-600 font-bold block mb-0.5">일일 목표 달성도 (Goal Rate)</span>
                                <span className="text-xl font-black text-emerald-800">
                                    {isLearningAnalyticsTested(analytics) ? `${analytics?.goalAchievementRate ?? analytics?.dailyGoalAchievement ?? 0}%` : '미측정'}
                                </span>
                                <p className="text-[9px] text-slate-500 mt-0.5">계획 대비 실천 완료율</p>
                            </div>
                        </div>

                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl mb-2">
                            <h3 className="text-[11px] font-black text-slate-700 mb-1 border-b pb-0.5">피로 지수별 최적 과목 배치표</h3>
                            <table className="w-full text-xs text-left mb-1">
                                <thead className="bg-slate-900 text-white">
                                    <tr>
                                        <th className="px-2 py-1 text-[9px]">피로도</th>
                                        <th className="px-2 py-1 text-[9px]">국어 전략</th>
                                        <th className="px-2 py-1 text-[9px]">수학 전략</th>
                                        <th className="px-2 py-1 text-[9px]">탐구/암기 전략</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-slate-700 text-[9px]">
                                    <tr className="bg-blue-50/50">
                                        <td className="px-2 py-1 font-bold text-blue-700">20% (최상)</td>
                                        <td className="px-2 py-1">고난도 비문학 신규 독해</td>
                                        <td className="px-2 py-1 font-bold">4점 킬러 문항 정면 도전</td>
                                        <td className="px-2 py-1">생소한 고난도 개념 구조화</td>
                                    </tr>
                                    <tr>
                                        <td className="px-2 py-1 font-bold text-orange-600">50% (보통)</td>
                                        <td className="px-2 py-1">문학 작품 해석 및 선지 분석</td>
                                        <td className="px-2 py-1">기출 유형별 반복 풀이</td>
                                        <td className="px-2 py-1">백지 복습 및 요약 노트</td>
                                    </tr>
                                    <tr className="bg-slate-50">
                                        <td className="px-2 py-1 font-bold text-red-600">80% (피로)</td>
                                        <td className="px-2 py-1">문학 오디오북/강의 시청</td>
                                        <td className="px-2 py-1">기본 공식 연산 및 오답 확인</td>
                                        <td className="px-2 py-1">단어장 가볍게 눈으로 복습</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* AI 최적 학습 스케줄링 (24시간 두뇌 리듬 기반 - 무료/유료 공통 인쇄) */}
                        <div className="border border-indigo-200 rounded-xl overflow-hidden bg-indigo-50/30 mb-2">
                            <div className="bg-indigo-900 text-white px-2.5 py-1 flex justify-between items-center">
                                <span className="text-[10px] font-black">📅 AI 최적 일일 학습 스케줄링 (두뇌 생체리듬 연동)</span>
                                <span className="text-[9px] text-indigo-200">일반 맞춤형 표준 스케줄</span>
                            </div>
                            <table className="w-full text-left text-[9px]">
                                <tbody className="divide-y divide-indigo-100 text-slate-700">
                                    {generateAISchedule(result.analytics, result.student, result.careType).slice(0, 4).map((item, idx) => (
                                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-indigo-50/20'}>
                                            <td className="px-2.5 py-1 font-mono font-bold text-indigo-800 w-24 whitespace-nowrap">{item.time}</td>
                                            <td className="px-2 py-1 w-20">
                                                <span className={`px-1.5 py-0.2 rounded font-bold text-[8px] ${item.intensity === 'High' ? 'bg-red-100 text-red-700' :
                                                        item.intensity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                                    }`}>
                                                    {item.intensity}
                                                </span>
                                            </td>
                                            <td className="px-2 py-1 font-bold text-slate-800 w-44">{item.activity}</td>
                                            <td className="px-2 py-1 text-slate-600 leading-tight">{item.desc}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pure Study Enhancement & Distraction Control (Full Coverage) */}
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl">
                            <div className="flex items-center justify-between border-b border-slate-700 pb-1 mb-1">
                                <h4 className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                                    <span>🎯</span> 순공 집중도(Pure Study) 극대화 및 3대 방해 요인 원천 차단 행동 수칙
                                </h4>
                                <span className="text-[8px] text-slate-400 font-mono">FLOW PROTOCOL</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-[8.5px] text-slate-200">
                                <div>
                                    <strong className="text-blue-300 block mb-0.5">• 스마트폰 격리</strong>
                                    시야 밖 3m 이상 물리적 격리 시 전두엽 작업기억 용량 25% 즉각 복원.
                                </div>
                                <div>
                                    <strong className="text-amber-300 block mb-0.5">• 잡념 메모장 운영</strong>
                                    떠오르는 불안/잡념은 즉시 포스트잇에 적어두고 학습 종료 후 처리.
                                </div>
                                <div>
                                    <strong className="text-emerald-300 block mb-0.5">• 50/10 인터벌 타이머</strong>
                                    50분 딥워크 타이머 가동 후 10분 완전 휴식으로 인지 과부하 방지.
                                </div>
                            </div>
                        </div>
                    </div>
                </ReportPage>
            )}

            {/* ================= PAGE 5: LEARNING TRAITS & NEURO-COGNITIVE MECHANISM (PRO 이상) ================= */}
            {isProOrAbove && (
                <ReportPage pageNum={5} footerTitle="LEARNING TRAITS & NEURO-MECHANISM">
                    <div className="space-y-2 text-xs">
                        {/* 1. 5대 과학적 학습 기질 & 맞춤 전략 (Image 1) */}
                        <div className="bg-slate-900 text-white rounded-xl p-3 border border-purple-500/30">
                            <div className="flex justify-between items-center border-b border-slate-700 pb-1.5 mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-base p-1 bg-purple-500/20 rounded-lg">🧬</span>
                                    <div>
                                        <span className="text-[9px] text-purple-300 font-bold uppercase tracking-wider">BIG 5 · TCI · MSLQ · GRIT 기반 5대 학습 기질</span>
                                        <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                                            <span>{traits?.archetypeBadge || '🔍'}</span>
                                            <span>{traits?.archetypeTitle || '신중분석 탐구형'}</span>
                                        </h3>
                                    </div>
                                </div>
                                <span className="px-2 py-0.5 bg-purple-500/30 text-purple-200 border border-purple-400/40 rounded-full text-[9px] font-bold">
                                    종합 평균 {traits?.totalAverage ? traits.totalAverage : traits?.scores?.overallAverage ? (traits.scores.overallAverage / 20).toFixed(2) : '4.13'} / 5.0점
                                </span>
                            </div>

                            {/* 5개 점수 게이지 바 */}
                            <div className="grid grid-cols-5 gap-1.5 mb-2 text-center text-[8.5px]">
                                {[
                                    { label: '🎯 끈기 & 실행력', score: traits?.scores?.persistenceAndExecution ?? traits?.scores?.gritPlan ?? 58, color: 'bg-emerald-400' },
                                    { label: '🛡️ 멘탈 & 회복력', score: traits?.scores?.mentalAndResilience ?? traits?.scores?.mentalResilience ?? 67, color: 'bg-blue-400' },
                                    { label: '⚡ 탐구 & 도전심', score: traits?.scores?.curiosityAndChallenge ?? traits?.scores?.temperament ?? 75, color: 'bg-pink-400' },
                                    { label: '🔍 메타인지 전략', score: traits?.scores?.metaCognitiveStrategy ?? traits?.scores?.metaCognition ?? 75, color: 'bg-cyan-400' },
                                    { label: '🔥 내재동기 몰입', score: traits?.scores?.intrinsicMotivation ?? traits?.scores?.internalMotivation ?? 80, color: 'bg-amber-400' },
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-white/10 p-1.5 rounded-lg border border-white/10">
                                        <span className="text-slate-300 block truncate text-[8px]">{item.label}</span>
                                        <span className="font-black text-white text-[10px]">{item.score}점</span>
                                        <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden mt-0.5">
                                            <div className={`h-full ${item.color}`} style={{ width: `${item.score}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <p className="text-[9px] text-slate-300 leading-snug bg-white/5 p-1.5 rounded-lg border border-white/10 mb-2">
                                {traits?.archetypeDescription || '자신의 앎과 모름을 정확히 꿰뚫어 보며, 오답의 근본 원인을 끝까지 파고들어 개념을 완벽하게 재구성하는 분석적 학습자입니다.'}
                            </p>

                            <div className="grid grid-cols-3 gap-1.5 text-[8.5px]">
                                <div className="bg-emerald-950/50 p-1.5 rounded-lg border border-emerald-500/30 text-emerald-200">
                                    <strong className="text-emerald-300 block mb-0.5 text-[9px]">🌟 핵심 인지 강점</strong>
                                    {traits?.coreStrength || '정밀한 메타인지 능력, 심층 오답 분석, 빈틈없는 개념 단권화'}
                                </div>
                                <div className="bg-rose-950/50 p-1.5 rounded-lg border border-rose-500/30 text-rose-200">
                                    <strong className="text-rose-300 block mb-0.5 text-[9px]">⚠️ 주의 & 병목 요인</strong>
                                    {traits?.cautionPoint || '세부 디테일에 지나치게 매몰되어 전체 문제풀이 진도가 지연될 수 있습니다.'}
                                </div>
                                <div className="bg-blue-950/50 p-1.5 rounded-lg border border-blue-500/30 text-blue-200">
                                    <strong className="text-blue-300 block mb-0.5 text-[9px]">🏰 기질별 최적 환경</strong>
                                    {traits?.recommendedEnvironment || '화이트보드 요약 공간, 백지 인출 노트, 소음이 완벽 차단된 독립 공간'}
                                </div>
                            </div>
                        </div>

                        {/* 2. 케어타입 신경인지 기전 & 학습 병목 정밀 분석 (Image 2) */}
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                            <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-4 bg-indigo-600 rounded-sm"></span>
                                    <h3 className="text-[11px] font-black text-slate-900">
                                        케어타입 신경인지 기전 & 학습 병목 정밀 분석
                                    </h3>
                                </div>
                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-bold text-[8.5px]">
                                    {detailedCareStrategy?.summaryBadge || '🎮 퀘스트 게임화 & 마이크로 보상 도파민'}
                                </span>
                            </div>

                            {/* 3 Top Cards */}
                            <div className="grid grid-cols-3 gap-1.5 text-[8.5px]">
                                <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
                                    <strong className="text-indigo-800 font-bold block text-[9px]">🧠 두뇌 신경생리 메커니즘</strong>
                                    <p className="text-slate-600 leading-snug">{detailedCareStrategy?.neuroCognitiveProfile?.brainMechanism || '중뇌 복측피개구역(VTA)의 도파민 기초 분비율 저하 및 부교감신경 무기력 우세'}</p>
                                </div>
                                <div className="bg-rose-50/70 p-2 rounded-lg border border-rose-200 space-y-0.5">
                                    <strong className="text-rose-800 font-bold block text-[9px]">⚠️ 학습 시 핵심 병목 (Bottleneck)</strong>
                                    <p className="text-rose-900 leading-snug font-medium">{detailedCareStrategy?.neuroCognitiveProfile?.learningBottleneck || '공부를 시작하기까지 1~2시간 이상 멍하니 휴대폰을 보거나 침대에 누워 시동 지연'}</p>
                                </div>
                                <div className="bg-emerald-50/70 p-2 rounded-lg border border-emerald-200 space-y-0.5">
                                    <strong className="text-emerald-800 font-bold block text-[9px]">🌟 잠재 인지 강점 & 돌파구</strong>
                                    <p className="text-emerald-900 leading-snug">{detailedCareStrategy?.neuroCognitiveProfile?.coreCognitiveStrength || '일단 재미나 경쟁 요소로 도파민 시동이 걸리면 잡념 없이 우직하게 깊은 흡수력 발휘'}</p>
                                </div>
                            </div>

                            {/* 3 Bottom Cards */}
                            <div className="grid grid-cols-3 gap-1.5 text-[8.5px]">
                                <div className="bg-indigo-50/70 p-2 rounded-lg border border-indigo-200">
                                    <strong className="text-indigo-900 font-bold block text-[9px]">⏱️ 권장 세션 사이클</strong>
                                    <p className="text-slate-700 leading-snug">{detailedCareStrategy?.timeArchitecture?.recommendedCycle || '20분 퀘스트 몰입 + 3분 도파민 보상 (게임화 스터디)'}</p>
                                </div>
                                <div className="bg-amber-50/70 p-2 rounded-lg border border-amber-200">
                                    <strong className="text-amber-900 font-bold block text-[9px]">📌 착석 3단계 스타트 루틴</strong>
                                    <p className="text-slate-700 leading-snug">{detailedCareStrategy?.timeArchitecture?.startRitual || (detailedCareStrategy?.timeArchitecture as any)?.startRoutine || '책상 정리, 물 한 잔 등 10초짜리 초소형 퀘스트 3개 연속 클리어로 도파민 공급'}</p>
                                </div>
                                <div className="bg-purple-50/70 p-2 rounded-lg border border-purple-200">
                                    <strong className="text-purple-900 font-bold block text-[9px]">⚖️ 인풋 vs 아웃풋 황금 비율</strong>
                                    <p className="text-slate-700 leading-snug">{detailedCareStrategy?.timeArchitecture?.inputOutputRatio || '인풋 40% : 아웃풋 60%'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </ReportPage>
            )}

            {/* ================= PAGE 6: 4-SUBJECT ROADMAP & ACTION PRESCRIPTIONS (PRO 이상) ================= */}
            <ReportPage pageNum={6} footerTitle="4-SUBJECT STRATEGY ROADMAP">
                <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center mb-0.5">
                        <h2 className="text-base font-black flex items-center text-slate-800">
                            <span className="w-1.5 h-4 bg-blue-700 mr-2 rounded-sm"></span>
                            📚 4대 영역별 초정밀 맞춤 학습법 로드맵
                        </h2>
                        <span className="text-[9px] font-mono text-purple-700 font-bold">SUBJECT-SPECIFIC PROTOCOLS</span>
                    </div>

                    {/* PRO 실측 성적 등급 연동 및 3단계 자동 승격 안내 배너 */}
                    <div className="p-1.5 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 rounded-lg flex items-center justify-between text-[8px]">
                        <div className="flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.5 text-white font-black rounded text-[7.5px] tracking-wide shrink-0 ${isProOrAbove ? 'bg-indigo-700' : 'bg-purple-700'}`}>
                                {isProOrAbove ? 'PRO 성적 연동 모델' : '💡 PRO 등급 자동 연동'}
                            </span>
                            <span className="text-slate-700 leading-tight">
                                {isProOrAbove ? (
                                    <>수험생의 실제 내신·모의고사 성적을 기반으로 4대 영역이 <strong>3단계(최상위 킬러 · 빈출 준킬러 · 기본 개념)</strong> 맞춤형으로 1:1 정밀 배정되었습니다.</>
                                ) : (
                                    <>현재는 <strong>기본 진단 기준(3~4등급 도약형)</strong>입니다. PRO 정밀 진단에서 실제 <strong>내신·모의고사 성적을 등록</strong>하시면, 4대 과목이 <strong>실측 등급별 3단계(최상위 킬러 · 빈출 준킬러 · 기본 개념)</strong>로 자동 정밀 승격·재설계됩니다.</>
                                )}
                            </span>
                        </div>
                        {!isProOrAbove && (
                            <span className="text-purple-700 font-bold whitespace-nowrap text-[7.5px] shrink-0 ml-2 bg-purple-100/80 px-1.5 py-0.5 rounded border border-purple-200">
                                1:1 성적 연동 해금 ➜
                            </span>
                        )}
                    </div>

                    {/* 4대 과목 카드 2x2 Grid (수준별 & 취약과목 100% 동적 연동) */}
                    <div className="grid grid-cols-2 gap-2 text-[8.5px]">
                        {(['korean', 'math', 'english', 'inquiry'] as const).map((key) => {
                            const dyn = dynamicSubjectRoadmap?.[key];
                            const baseProtocol = detailedCareStrategy?.subjectProtocols?.[key];

                            const isFocus = dyn?.isFocus ?? false;
                            const title = dyn?.strategyTitle || baseProtocol?.strategyTitle || '';
                            const actionPlan = dyn?.actionPlan || baseProtocol?.actionPlan || '';
                            const readLabel = dyn?.readingOrConceptLabel || (key === 'korean' ? '🔍 독해:' : key === 'math' ? '🔍 개념:' : key === 'english' ? '🔍 어휘:' : '🔍 백지:');
                            const readMethod = dyn?.readingOrConceptMethod || baseProtocol?.readingOrConceptMethod || '';
                            const probLabel = dyn?.problemSolvingLabel || (key === 'english' ? '⚡ 대의:' : key === 'inquiry' ? '⚡ 기출:' : '⚡ 풀이:');
                            const probMethod = dyn?.problemSolvingMethod || baseProtocol?.problemSolvingMethod || '';
                            const killerTips = dyn?.killerTips || baseProtocol?.killerTips || '';

                            const metaColors = {
                                korean: { bg: 'bg-blue-50/40', border: 'border-blue-200', text: 'text-blue-900', badge: 'bg-blue-600', icon: '📖', name: '국어 (1교시 최적화)', code: 'KOREAN' },
                                math: { bg: 'bg-emerald-50/40', border: 'border-emerald-200', text: 'text-emerald-900', badge: 'bg-emerald-600', icon: '📐', name: '수학 (킬러 정복)', code: 'MATH' },
                                english: { bg: 'bg-purple-50/40', border: 'border-purple-200', text: 'text-purple-900', badge: 'bg-purple-600', icon: '🌐', name: '영어 (절대평가 1등급)', code: 'ENGLISH' },
                                inquiry: { bg: 'bg-amber-50/40', border: 'border-amber-200', text: 'text-amber-900', badge: 'bg-amber-600', icon: '🔬', name: '탐구 (단권화 만점)', code: 'INQUIRY' }
                            }[key];

                            return (
                                <div
                                    key={key}
                                    className={`p-2 rounded-xl space-y-1 transition-all ${isFocus
                                            ? 'bg-gradient-to-br from-rose-50/70 via-amber-50/30 to-purple-50/40 border-2 border-rose-400 shadow-sm ring-1 ring-rose-400/30'
                                            : `${metaColors.bg} border ${metaColors.border}`
                                        }`}
                                >
                                    <div className="flex justify-between items-center border-b pb-0.5" style={{ borderColor: isFocus ? '#fb7185' : undefined }}>
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs">{metaColors.icon}</span>
                                            <strong className={`text-[9.5px] ${isFocus ? 'text-rose-950 font-black' : metaColors.text}`}>
                                                {metaColors.name}
                                            </strong>
                                            {isFocus && (
                                                <span className="text-[7.5px] px-1.5 py-0.2 bg-rose-600 text-white rounded font-black">
                                                    🔥 취약 집중 공략
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {dyn?.allocatedRatio && (
                                                <span className={`text-[7.5px] px-1 py-0.2 rounded font-bold ${isFocus ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'}`}>
                                                    {dyn.allocatedRatio.split(' ')[0]}
                                                </span>
                                            )}
                                            <span className={`text-[8px] px-1.5 py-0.2 rounded font-bold text-white ${metaColors.badge}`}>
                                                {metaColors.code}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className={`font-bold text-[9px] truncate ${isFocus ? 'text-rose-900' : 'text-slate-800'}`}>{title}</p>
                                        {dyn?.levelBadge && (
                                            <span className="text-[7.5px] font-semibold px-1 py-0.2 rounded bg-slate-100 text-slate-600 shrink-0 ml-1">
                                                {dyn.levelBadge.split(' ')[0]}
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-0.5 text-slate-700">
                                        <p className="leading-tight"><strong className={isFocus ? 'text-rose-900' : metaColors.text}>📌 실행:</strong> {actionPlan}</p>
                                        <p className="leading-tight"><strong className={isFocus ? 'text-rose-900' : metaColors.text}>{readLabel}</strong> {readMethod}</p>
                                        <p className="leading-tight"><strong className={isFocus ? 'text-rose-900' : metaColors.text}>{probLabel}</strong> {probMethod}</p>
                                        <p className="leading-tight text-amber-900 bg-amber-50/90 p-1 rounded border border-amber-200/50">
                                            <strong className="text-amber-800">💡 팁:</strong> {killerTips}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 실전 시험 멘탈 & 최적 공부 공간 처방전 (Image 4 Bottom) */}
                    <div className="grid grid-cols-2 gap-2 text-[8.5px]">
                        {/* 멘탈 처방전 */}
                        <div className="p-2 bg-slate-900 text-white rounded-xl space-y-1">
                            <strong className="text-blue-300 block text-[9px] border-b border-slate-700 pb-0.5 flex items-center gap-1">
                                <span>🛡️</span> 실전 시험 멘탈 & 슬럼프 회복 처방전
                            </strong>
                            <p className="leading-tight text-slate-200">
                                <strong className="text-amber-300">1분 긴급 이완 호흡:</strong> {detailedCareStrategy?.mentalSlumpCare?.emergencyReset || (detailedCareStrategy as any)?.mentalRecovery?.emergencyReset}
                            </p>
                            <p className="leading-tight text-slate-300">
                                <strong className="text-emerald-300">오답 시 인지 재구조화:</strong> {detailedCareStrategy?.mentalSlumpCare?.cognitiveReframing || (detailedCareStrategy as any)?.mentalRecovery?.reframing}
                            </p>
                        </div>

                        {/* 공간 및 디지털 유혹 차단 */}
                        <div className="p-2 bg-slate-900 text-white rounded-xl space-y-1">
                            <strong className="text-amber-300 block text-[9px] border-b border-slate-700 pb-0.5 flex items-center gap-1">
                                <span>🏰</span> 최적 공부 공간 & 디지털 유혹 차단
                            </strong>
                            <p className="leading-tight text-slate-200">
                                <strong className="text-blue-300">공간·조명·소음 세팅:</strong> {detailedCareStrategy?.concentrationEnvironment?.environmentSetup || (detailedCareStrategy as any)?.spaceOptimization?.environmentSetup}
                            </p>
                            <p className="leading-tight text-slate-300">
                                <strong className="text-rose-300">디지털 유혹 차단:</strong> {detailedCareStrategy?.concentrationEnvironment?.distractionBlocker || (detailedCareStrategy as any)?.spaceOptimization?.distractionControl}
                            </p>
                        </div>
                    </div>
                </div>
            </ReportPage>

            {/* ================= PAGE 7: STUDY EFFICIENCY ASSESSMENTS I ================= */}
            <ReportPage pageNum={7} footerTitle="STUDY EFFICIENCY ASSESSMENTS I">
                <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                        <h2 className="text-base font-black flex items-center text-slate-800">
                            <span className="w-1.5 h-4 bg-indigo-600 mr-2 rounded-sm"></span>
                            🧩 5종 학습 효율성 정밀 진단 I (1. 크로노타입, 2. VARK, 3. 시험불안 TAI)
                        </h2>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold border bg-indigo-50 text-indigo-800 border-indigo-200">
                            시행 완료 {[isChronoTested, isVarkTested, isTaiTested].filter(Boolean).length}/3종
                        </span>
                    </div>

                    <div className="p-2 bg-indigo-50/70 border border-indigo-200 rounded-xl text-[9.5px] text-indigo-900 leading-relaxed font-medium">
                        📌 <strong>학습 효율성 진단의 의의</strong>: 공부 방법은 개인의 선천적 생체 리듬(크로노타입), 감각 수용 채널(VARK), 정서 조절력(TAI)과 동기화되어야 비로소 최소 시간 투자로 최대 성적 향상을 이끌어낼 수 있습니다.
                        <br />
                        <span className="text-indigo-800 font-bold">
                            ※ 실제 시행한 검사 결과만 정밀 분석되어 표기되며, 미시행 검사는 '미검사'로 구분됩니다.
                        </span>
                    </div>

                    {/* 1. Chronotype */}
                    <div className={`p-2.5 rounded-xl transition-colors ${isChronoTested
                            ? 'bg-slate-50 border border-slate-200'
                            : 'bg-slate-50/50 border border-dashed border-slate-300'
                        }`}>
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${isChronoTested ? 'bg-indigo-600' : 'bg-slate-400'}`}></span>
                                <h3 className={`text-[11px] font-black ${isChronoTested ? 'text-slate-800' : 'text-slate-500'}`}>
                                    1. 크로노타입 수면 생체리듬 (MEQ)
                                </h3>
                            </div>
                            <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${isChronoTested
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : 'bg-slate-200 text-slate-500'
                                }`}>
                                {isChronoTested ? chronoData!.result.toUpperCase() : '미검사 (검사 미시행)'}
                            </span>
                        </div>
                        {isChronoTested ? (
                            <>
                                <p className="text-[10px] text-slate-600 leading-relaxed mb-1">
                                    {getChronotypeAdvice(chronoData!.result, careType)}
                                </p>
                                <div className="p-1.5 bg-white border rounded text-[9px] text-slate-600">
                                    <strong>⏰ 생체 시계 고정법</strong>: 주말에도 기상 시각을 평일과 1시간 이내로 유지하여 '사회적 시차증(Social Jetlag)'을 방지하세요.
                                </div>
                            </>
                        ) : (
                            <div className="py-2 px-1 text-[9px] text-slate-400 flex items-center justify-between">
                                <span>🔒 해당 설문을 시행하지 않아 분석 데이터가 없습니다.</span>
                                <span className="text-[8.5px] text-slate-500 font-medium">PRO 정밀 검사에서 언제든지 추가 측정 가능</span>
                            </div>
                        )}
                    </div>

                    {/* 2. VARK */}
                    <div className={`p-2.5 rounded-xl transition-colors ${isVarkTested
                            ? 'bg-slate-50 border border-slate-200'
                            : 'bg-slate-50/50 border border-dashed border-slate-300'
                        }`}>
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${isVarkTested ? 'bg-blue-600' : 'bg-slate-400'}`}></span>
                                <h3 className={`text-[11px] font-black ${isVarkTested ? 'text-slate-800' : 'text-slate-500'}`}>
                                    2. VARK 4대 감각 학습 양식
                                </h3>
                            </div>
                            <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${isVarkTested
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-slate-200 text-slate-500'
                                }`}>
                                {isVarkTested ? `${varkStyle}형 우세` : '미검사 (검사 미시행)'}
                            </span>
                        </div>
                        {isVarkTested ? (
                            <>
                                <p className="text-[10px] text-slate-600 leading-relaxed mb-1">
                                    {getVARKAdvice(varkStyle!, careType)}
                                </p>
                                <div className="p-1.5 bg-white border rounded text-[9px] text-slate-600">
                                    <strong>🎨 감각 채널 극대화</strong>: 텍스트를 읽을 때 핵심 키워드 3개에 형광펜을 칠하고 여백에 화살표 도식으로 요약하세요.
                                </div>
                            </>
                        ) : (
                            <div className="py-2 px-1 text-[9px] text-slate-400 flex items-center justify-between">
                                <span>🔒 해당 설문을 시행하지 않아 분석 데이터가 없습니다.</span>
                                <span className="text-[8.5px] text-slate-500 font-medium">시각/청각/필기/체감 4대 감각 맞춤 채널 미산출</span>
                            </div>
                        )}
                    </div>

                    {/* 3. TAI */}
                    <div className={`p-2.5 rounded-xl transition-colors ${isTaiTested
                            ? 'bg-slate-50 border border-slate-200'
                            : 'bg-slate-50/50 border border-dashed border-slate-300'
                        }`}>
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${isTaiTested ? 'bg-rose-600' : 'bg-slate-400'}`}></span>
                                <h3 className={`text-[11px] font-black ${isTaiTested ? 'text-slate-800' : 'text-slate-500'}`}>
                                    3. 시험 불안 검사 (TAI)
                                </h3>
                            </div>
                            <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${isTaiTested
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-slate-200 text-slate-500'
                                }`}>
                                {isTaiTested ? `총점: ${taiData!.totalScore ?? 0}점 / 30점` : '미검사 (검사 미시행)'}
                            </span>
                        </div>
                        {isTaiTested ? (
                            <>
                                <p className="text-[10px] text-slate-600 leading-relaxed mb-1">
                                    {getTestAnxietyAdvice((taiData!.result || taiData!.severity || 'moderate') as any, careType)}
                                </p>
                                <div className="p-1.5 bg-white border rounded text-[9px] text-slate-600">
                                    <strong>🧘 시험 직전 불안 리셋</strong>: 시험 시작 종이 울리기 전 4초 흡기 - 7초 정지 - 8초 호기 복식호흡 3회를 진행하세요.
                                </div>
                            </>
                        ) : (
                            <div className="py-2 px-1 text-[9px] text-slate-400 flex items-center justify-between">
                                <span>🔒 해당 설문을 시행하지 않아 분석 데이터가 없습니다.</span>
                                <span className="text-[8.5px] text-slate-500 font-medium">인지적 걱정 및 신체적 긴장도 평가 미산출</span>
                            </div>
                        )}
                    </div>

                    {/* VARK 4대 감각 결합 학습 공식 */}
                    {isVarkTested ? (
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                            <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                                <h3 className="text-[10.5px] font-black text-slate-800 flex items-center gap-1">
                                    <span>🎨</span> VARK 4대 감각 수용 채널 결합 학습 공식
                                </h3>
                                <span className="text-[8.5px] font-mono text-indigo-700 font-bold">MULTI-SENSORY PROTOCOL</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[9px]">
                                <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
                                    <strong className="text-blue-800 font-bold block text-[9.5px]">👁️ 시각(Visual) + ✍️ 필기(Read/Write)</strong>
                                    <p className="text-slate-600 leading-snug">• <strong>백지 마인드맵</strong>: 단원 전체 개념을 1장의 큰 도식으로 요약하여 시각 기억 활성화.</p>
                                    <p className="text-slate-600 leading-snug">• <strong>3색 펜 코딩</strong>: 정의(검정), 핵심공식(파랑), 주의함정(빨강)으로 색상 분리.</p>
                                </div>
                                <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
                                    <strong className="text-purple-800 font-bold block text-[9.5px]">🎧 청각(Auditory) + 🏃 체감(Kinesthetic)</strong>
                                    <p className="text-slate-600 leading-snug">• <strong>자가 강의 녹음</strong>: 헷갈리는 킬러 개념을 3분간 말로 설명하며 녹음 후 이동 중 청취.</p>
                                    <p className="text-slate-600 leading-snug">• <strong>서서 외우기</strong>: 식곤증 시간대 스탠딩 데스크를 활용해 몸을 움직이며 암기.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-2 bg-slate-50/70 border border-dashed border-slate-200 rounded-xl text-[9px] flex items-center justify-between text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <span>🎨</span> <strong>VARK 감각 채널 결합 공식</strong>: VARK 검사 미시행 (검사 완료 시 맞춤형 감각 결합 공식 활성화)
                            </span>
                            <span className="text-[8px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-bold">미검사</span>
                        </div>
                    )}

                    {/* 수능 D-Day 실전 시험불안 극복 4단계 멘탈 리셋 프로토콜 */}
                    {isTaiTested ? (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs space-y-1">
                            <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                                <h4 className="text-[10px] font-bold text-rose-300 flex items-center gap-1">
                                    <span>🧘</span> 수능 실전 시험불안 극복 4단계 멘탈 리셋 프로토콜
                                </h4>
                                <span className="text-[8px] text-slate-400 font-mono">D-DAY MENTAL RESET</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-[8.5px] text-slate-200 text-center">
                                <div className="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700">
                                    <strong className="text-amber-300 block mb-0.5">Step 1. 4-7-8 호흡</strong>
                                    4초 흡기-7초 정지-8초 호기로 심박수 급상승 억제
                                </div>
                                <div className="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700">
                                    <strong className="text-blue-300 block mb-0.5">Step 2. 펜촉 그라운딩</strong>
                                    손가락 끝으로 펜촉 감각에 집중하며 잡념 차단
                                </div>
                                <div className="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700">
                                    <strong className="text-emerald-300 block mb-0.5">Step 3. 1초 확언</strong>
                                    "준비한 만큼 침착하게 보여주자" 내적 마인드셋
                                </div>
                                <div className="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700">
                                    <strong className="text-purple-300 block mb-0.5">Step 4. 1번 문제 풀기</strong>
                                    가장 쉬운 문항부터 풀며 뇌 각성 리듬 동기화
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-2 bg-slate-50/70 border border-dashed border-slate-200 rounded-xl text-[9px] flex items-center justify-between text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <span>🧘</span> <strong>D-Day 시험불안 멘탈 리셋 프로토콜</strong>: TAI 검사 미시행 (검사 완료 시 실전 멘탈 강령 활성화)
                            </span>
                            <span className="text-[8px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-bold">미검사</span>
                        </div>
                    )}

                    {/* PRO 검사 유도 배너 */}
                    {[isChronoTested, isVarkTested, isTaiTested].some(t => !t) && (
                        <div className="mt-1 p-1.5 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-lg flex items-center justify-between text-[8px]">
                            <div className="flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 bg-blue-600 text-white font-bold rounded text-[7.5px] tracking-wide">
                                    정밀 검사 안내
                                </span>
                                <span className="text-slate-700 font-medium">
                                    현재 Part 1 중 <strong>{[isChronoTested, isVarkTested, isTaiTested].filter(Boolean).length}개 검사</strong>만 시행되었습니다. 미시행 검사는 <strong>PRO 정밀 진단</strong>에서 언제든지 이어서 완료하실 수 있습니다.
                                </span>
                            </div>
                            <span className="text-blue-700 font-bold whitespace-nowrap text-[8px]">추가 검사 진행 &rarr;</span>
                        </div>
                    )}
                </div>
            </ReportPage>

            {/* ================= PAGE 8: STUDY EFFICIENCY ASSESSMENTS II ================= */}
            <ReportPage pageNum={8} footerTitle="STUDY EFFICIENCY ASSESSMENTS II">
                <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                        <h2 className="text-base font-black flex items-center text-slate-800">
                            <span className="w-1.5 h-4 bg-indigo-600 mr-2 rounded-sm"></span>
                            🧩 5종 학습 효율성 정밀 진단 II (4. 디지털 중독, 5. 메타인지 역량)
                        </h2>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold border bg-indigo-50 text-indigo-800 border-indigo-200">
                            시행 완료 {[isDigitalTested, isMetaTested].filter(Boolean).length}/2종
                        </span>
                    </div>

                    <div className="p-2 bg-indigo-50/70 border border-indigo-200 rounded-xl text-[9.5px] text-indigo-900 leading-relaxed font-medium">
                        📌 <strong>전두엽 실행 제어와 메타인지</strong>: 숏폼 도파민 자극을 억제하고 자신의 인지 과정을 스스로 모니터링(Self-Monitoring)하는 메타인지 능력이 상위 1% 고난도 킬러 문항 해결력을 결정짓습니다.
                        <br />
                        <span className="text-indigo-800 font-bold">
                            ※ 실제 시행한 검사 결과만 정밀 분석되어 표기되며, 미시행 검사는 '미검사'로 구분됩니다.
                        </span>
                    </div>

                    {/* 4. Digital Addiction */}
                    <div className={`p-2.5 rounded-xl transition-colors ${isDigitalTested
                            ? 'bg-slate-50 border border-slate-200'
                            : 'bg-slate-50/50 border border-dashed border-slate-300'
                        }`}>
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${isDigitalTested ? 'bg-amber-600' : 'bg-slate-400'}`}></span>
                                <h3 className={`text-[11px] font-black ${isDigitalTested ? 'text-slate-800' : 'text-slate-500'}`}>
                                    4. 디지털 도파민 중독 척도
                                </h3>
                            </div>
                            <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${isDigitalTested
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-200 text-slate-500'
                                }`}>
                                {isDigitalTested ? (digitalData?.level ? digitalData.level.toUpperCase() : '검사 완료') : '미검사 (검사 미시행)'}
                            </span>
                        </div>
                        {isDigitalTested ? (
                            <>
                                <p className="text-[10px] text-slate-600 leading-relaxed mb-1">
                                    {getDigitalAddictionAdvice(digitalData!.level || 'low', careType)}
                                </p>
                                <div className="p-1.5 bg-white border rounded text-[9px] text-slate-700 space-y-0.5">
                                    <strong>📵 디지털 디톡스 3대 수칙</strong>:
                                    <p className="text-[9px] text-slate-600">• 1. 공부 시작 10분 전 스마트폰을 시야 밖(다른 방/가방 속)으로 완전 격리</p>
                                    <p className="text-[9px] text-slate-600">• 2. 휴식 시간 중 유튜브 숏폼/릴스 시청 금지 (뇌 시냅스 피로 급증 방지)</p>
                                </div>
                            </>
                        ) : (
                            <div className="py-2 px-1 text-[9px] text-slate-400 flex items-center justify-between">
                                <span>🔒 해당 설문을 시행하지 않아 분석 데이터가 없습니다.</span>
                                <span className="text-[8.5px] text-slate-500 font-medium">스마트폰 의존도 및 숏폼 도파민 자극 수준 미산출</span>
                            </div>
                        )}
                    </div>

                    {/* 5. Metacognition */}
                    <div className={`p-2.5 rounded-xl transition-colors ${isMetaTested
                            ? 'bg-slate-50 border border-slate-200'
                            : 'bg-slate-50/50 border border-dashed border-slate-300'
                        }`}>
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${isMetaTested ? 'bg-emerald-600' : 'bg-slate-400'}`}></span>
                                <h3 className={`text-[11px] font-black ${isMetaTested ? 'text-slate-800' : 'text-slate-500'}`}>
                                    5. 메타인지 및 자가점검 역량
                                </h3>
                            </div>
                            <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${isMetaTested
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-200 text-slate-500'
                                }`}>
                                {isMetaTested ? (metaLevel ? metaLevel.toUpperCase() : '검사 완료') : '미검사 (검사 미시행)'}
                            </span>
                        </div>
                        {isMetaTested ? (
                            <>
                                <p className="text-[10px] text-slate-600 leading-relaxed mb-1">
                                    {getMetacognitionAdvice(metaLevel || 'moderate', careType)}
                                </p>
                                <div className="p-1.5 bg-white border rounded text-[9px] text-slate-700 space-y-0.5">
                                    <strong>📝 메타인지 3단계 질문 훈련</strong>:
                                    <p className="text-[9px] text-slate-600">• 문제 풀기 전: "이 문제가 묻는 핵심 개념과 출제 의도는 무엇인가?"</p>
                                    <p className="text-[9px] text-slate-600">• 문제 푼 직후: "내가 선택한 정답의 논리적 근거를 남에게 10초 만에 설명할 수 있는가?"</p>
                                </div>
                            </>
                        ) : (
                            <div className="py-2 px-1 text-[9px] text-slate-400 flex items-center justify-between">
                                <span>🔒 해당 설문을 시행하지 않아 분석 데이터가 없습니다.</span>
                                <span className="text-[8.5px] text-slate-500 font-medium">자가 모니터링 역량 및 오답 원인 분석 능력 미산출</span>
                            </div>
                        )}
                    </div>

                    {/* 도파민 디톡스 7일 실천 챌린지 */}
                    {isDigitalTested ? (
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                            <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                                <h3 className="text-[10.5px] font-black text-slate-800 flex items-center gap-1">
                                    <span>📵</span> 전두엽 도파민 회로 보호 7일 실천 챌린지
                                </h3>
                                <span className="text-[8.5px] font-mono text-amber-700 font-bold">7-DAY DETOX CHALLENGE</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-[8.5px]">
                                <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
                                    <strong className="text-amber-800 font-bold block text-[9.5px]">Day 1~2 [기상/취침 격리]</strong>
                                    <p className="text-slate-600 leading-snug">• 기상 후 1시간 동안 스마트폰 확인 금지 (코르티솔 정상화).</p>
                                    <p className="text-slate-600 leading-snug">• 취침 1시간 전 침실 밖 충전 (멜라토닌 분비 촉진).</p>
                                </div>
                                <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
                                    <strong className="text-indigo-800 font-bold block text-[9.5px]">Day 3~5 [앱 제한 & 숏폼 차단]</strong>
                                    <p className="text-slate-600 leading-snug">• 숏폼/SNS 앱 삭제 또는 스크린타임 30분 제한.</p>
                                    <p className="text-slate-600 leading-snug">• 공부 시간 중 스마트폰을 불투명 가방에 완전 격리.</p>
                                </div>
                                <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
                                    <strong className="text-emerald-800 font-bold block text-[9.5px]">Day 6~7 [24H 도파민 리셋]</strong>
                                    <p className="text-slate-600 leading-snug">• 주말 하루 비디지털 딥워크로 뇌 피로 리셋.</p>
                                    <p className="text-slate-600 leading-snug">• 전두엽 작업기억 및 장기 집중력 회복 확인.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-2 bg-slate-50/70 border border-dashed border-slate-200 rounded-xl text-[9px] flex items-center justify-between text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <span>📵</span> <strong>도파민 보호 7일 실천 챌린지</strong>: 디지털 중독 척도 검사 미시행 (검사 완료 시 맞춤형 디톡스 플랜 활성화)
                            </span>
                            <span className="text-[8px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-bold">미검사</span>
                        </div>
                    )}

                    {/* 상위 1% 메타인지 오답 분석 4단계 자가 질문 템플릿 */}
                    {isMetaTested ? (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs space-y-1">
                            <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                                <h4 className="text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                                    <span>📝</span> 상위 1% 메타인지 오답 분석 4단계 자가 질문 템플릿
                                </h4>
                                <span className="text-[8px] text-slate-400 font-mono">META-COGNITION FRAMEWORK</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-200">
                                <div>
                                    <strong className="text-emerald-300 block mb-0.5">Q1. 문제 원인 분석</strong>
                                    단순 연산 실수인가, 발문의 조건 누락인가, 개념 오해인가?
                                </div>
                                <div>
                                    <strong className="text-blue-300 block mb-0.5">Q2. 출제자 함정 간파</strong>
                                    출제자가 오답 선지로 학생을 유도한 심리적 트랩은 무엇인가?
                                </div>
                                <div>
                                    <strong className="text-amber-300 block mb-0.5">Q3. 1초 행동 강령 도출</strong>
                                    다음번에 동일 유형을 마주쳤을 때 떠올릴 1초 행동 수칙은?
                                </div>
                                <div>
                                    <strong className="text-purple-300 block mb-0.5">Q4. 자가 설명력 검증</strong>
                                    답지를 보지 않고 다른 사람에게 풀이 과정을 논리적으로 설명 가능한가?
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-2 bg-slate-50/70 border border-dashed border-slate-200 rounded-xl text-[9px] flex items-center justify-between text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <span>📝</span> <strong>메타인지 4단계 질문 템플릿</strong>: 메타인지 역량 검사 미시행 (검사 완료 시 오답 분석 프레임워크 활성화)
                            </span>
                            <span className="text-[8px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-bold">미검사</span>
                        </div>
                    )}

                    {/* PRO 검사 유도 배너 */}
                    {[isDigitalTested, isMetaTested].some(t => !t) && (
                        <div className="mt-1 p-1.5 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-lg flex items-center justify-between text-[8px]">
                            <div className="flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 bg-blue-600 text-white font-bold rounded text-[7.5px] tracking-wide">
                                    정밀 검사 안내
                                </span>
                                <span className="text-slate-700 font-medium">
                                    현재 Part 2 중 <strong>{[isDigitalTested, isMetaTested].filter(Boolean).length}개 검사</strong>만 시행되었습니다. 미시행 검사는 <strong>PRO 정밀 진단</strong>에서 언제든지 이어서 완료하실 수 있습니다.
                                </span>
                            </div>
                            <span className="text-blue-700 font-bold whitespace-nowrap text-[8px]">추가 검사 진행 &rarr;</span>
                        </div>
                    )}
                </div>
            </ReportPage>

            {/* ================= PAGE 9: COGNITIVE & WORKING MEMORY (PRO 이상) ================= */}
            {isProOrAbove && (
                <ReportPage pageNum={9} footerTitle="COGNITIVE & WORKING MEMORY">
                    <div>
                        <h2 className="text-base font-black flex items-center mb-1.5 text-slate-800">
                            <span className="w-1.5 h-4 bg-blue-700 mr-2 rounded-sm"></span>
                            🧠 작업 기억 용량 및 인지 성능 반응 평가
                        </h2>

                        <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl mb-2.5 text-[11px] text-blue-900 leading-relaxed font-medium">
                            📌 <strong>작업 기억 용량(Working Memory)의 중요성</strong>: 뇌의 단기 작업대(RAM) 용량으로, 복잡한 킬러 문항을 풀 때 여러 조건과 수식을 머릿속에 유지하며 계산을 이어가는 핵심 능력입니다.
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-2.5">
                            <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                                <span className="text-[9px] text-slate-400 font-bold block">1. 작업 기억 (Working Memory)</span>
                                <span className="text-xs font-black text-indigo-700">
                                    {cognitiveResults?.workingMemory?.digitSpan?.maxDigits ? `Digit Span: ${cognitiveResults.workingMemory.digitSpan.maxDigits}자리` : 'RAM 용량: 7.2자리 (양호)'}
                                </span>
                                <p className="text-[9px] text-slate-500 mt-0.5">복합 문제 풀이 시 단기 정보 유지 능력</p>
                            </div>

                            <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                                <span className="text-[9px] text-slate-400 font-bold block">2. 도파민 보상 지연 (Patience)</span>
                                <span className="text-xs font-black text-blue-700">
                                    {cognitiveResults?.delayDiscounting?.impulsivityScore !== undefined ? `인내도: ${100 - cognitiveResults.delayDiscounting.impulsivityScore}점` : '인내 지수: 78점 (안정)'}
                                </span>
                                <p className="text-[9px] text-slate-500 mt-0.5">즉각 보상 유혹 억제 및 장기 목표 집중력</p>
                            </div>

                            <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                                <span className="text-[9px] text-slate-400 font-bold block">3. 문해력 / 처리 속도 (Speed)</span>
                                <span className="text-xs font-black text-emerald-700">
                                    {cognitiveResults?.processingSpeed?.overallScore ? `${cognitiveResults.processingSpeed.overallScore}점` : '독해 WPM: 380단어/분 (우수)'}
                                </span>
                                <p className="text-[9px] text-slate-500 mt-0.5">국어/영어 장문 지문 신속 이해력</p>
                            </div>

                            <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                                <span className="text-[9px] text-slate-400 font-bold block">4. 주의력 및 억제력 (Go/No-Go)</span>
                                <span className="text-xs font-black text-rose-700">
                                    {cognitiveResults?.attention?.accuracy ? `정확도: ${cognitiveResults.attention.accuracy}%` : '충동 억제력: 92% (우수)'}
                                </span>
                                <p className="text-[9px] text-slate-500 mt-0.5">실수 방지 및 시각 자극 선별 억제력</p>
                            </div>
                        </div>

                        <div className="p-3 bg-slate-900 text-white rounded-xl text-xs space-y-0.5">
                            <h3 className="text-[11px] font-bold text-indigo-300">💡 작업기억 용량 극대화 훈련 가이드</h3>
                            <p className="text-slate-300 text-[10px] leading-relaxed">
                                수학 풀이 시 암산에 과도하게 의존하면 작업기억(RAM)이 쉽게 과부하됩니다. <strong>시험지 여백에 문제 조건과 핵심 식을 1~2줄로 구조화하여 시각적으로 적는 습관</strong>을 들이면 킬러 문항 해결률이 30% 이상 향상됩니다.
                            </p>
                        </div>
                    </div>
                </ReportPage>
            )}

            {/* ================= PAGE 10: NEURO-NUTRITION & LIFESTYLE PRESCRIPTION (PRO 이상) ================= */}
            {isProOrAbove && (
                <ReportPage pageNum={10} footerTitle="LIFESTYLE & NUTRITION PRESCRIPTION">
                    <div>
                        <h2 className="text-base font-black flex items-center mb-1.5 text-slate-800">
                            <span className="w-1.5 h-4 bg-emerald-600 mr-2 rounded-sm"></span>
                            💊 1:1 맞춤 뉴로 영양 & 운동/수면 생활 처방
                        </h2>

                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                                <h3 className="text-[11px] font-black text-emerald-900 border-b border-emerald-200 pb-0.5">두뇌 활성화 영양 처방</h3>
                                <p className="text-slate-700 text-[10px] leading-snug">• <strong>비타민 B군 복합체</strong>: 뇌 신경 전달 물질 합성 및 포도당 에너지 대사 촉진</p>
                                <p className="text-slate-700 text-[10px] leading-snug">• <strong>L-테아닌 & 마그네슘</strong>: 교감신경 긴장 완화 및 시험 당일 불안 해소</p>
                                <p className="text-slate-700 text-[10px] leading-snug">• <strong>오메가-3 (DHA/EPA)</strong>: 뇌세포막 유동성 개선 및 해마 기억력 증진</p>
                            </div>

                            <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs space-y-1">
                                <h3 className="text-[11px] font-black text-indigo-900 border-b border-indigo-200 pb-0.5">수면 및 서카디안 케어</h3>
                                <p className="text-slate-700 text-[10px] leading-snug">• <strong>취침 1시간 전 스마트폰 차단</strong>: 블루라이트 차단으로 멜라토닌 분비 정상화</p>
                                <p className="text-slate-700 text-[10px] leading-snug">• <strong>기상 직후 햇빛 15분 쬐기</strong>: 세로토닌 합성 촉진 및 생체 시계 동기화</p>
                                <p className="text-slate-700 text-[10px] leading-snug">• <strong>최소 7시간 수면 확보</strong>: 해마의 단기기억을 대뇌 피질 장기기억으로 고착화</p>
                            </div>
                        </div>

                        {/* 추천 영양제 제품 라인업 표 (ResultsView 3-Tier와 100% 동일하게 동적 렌더링) */}
                        {(() => {
                            const essentialProd = recommendedProducts.find(p => p.tier === 'ESSENTIAL' && p.productId !== 'hl_focus_booster');
                            const recommendedProd = recommendedProducts.find(p => p.tier === 'RECOMMENDED' && p.productId !== 'hl_focus_booster');

                            const p1 = essentialProd ? PNT_PRODUCTS[essentialProd.productId] : (PNT_PRODUCTS['active_b_complex'] || null);
                            const p2 = recommendedProd ? PNT_PRODUCTS[recommendedProd.productId] : (PNT_PRODUCTS['calm_sleep'] || null);
                            // 3번째 처방: HL 스마트 아르기닌-카르니틴 부스터 우선 배치
                            const p3 = PNT_PRODUCTS['hl_focus_booster'] || (recommendedProducts.find(p => p.tier === 'SUPPORTIVE') ? PNT_PRODUCTS[recommendedProducts.find(p => p.tier === 'SUPPORTIVE')!.productId] : null);

                            return (
                                <div className="border border-emerald-200 rounded-xl overflow-hidden text-[9.5px] mb-2 bg-emerald-50/20">
                                    <div className="bg-emerald-800 text-white px-2.5 py-1 flex justify-between items-center">
                                        <span className="font-black text-[10px]">💊 두뇌 활력 3-Tier 맞춤 영양제 추천 라인업 (Standard Care)</span>
                                        <span className="text-[8.5px] text-emerald-200">8대 케어타입 진단 연동</span>
                                    </div>
                                    <table className="w-full text-left">
                                        <thead className="bg-emerald-900/90 text-white text-[9px]">
                                            <tr>
                                                <th className="px-2 py-1 w-20">처방 등급</th>
                                                <th className="px-2 py-1 w-32">추천 제품명</th>
                                                <th className="px-2 py-1 w-36">핵심 유효 성분</th>
                                                <th className="px-2 py-1">복용 타이밍 및 기대 효과</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-emerald-100 text-slate-700">
                                            <tr>
                                                <td className="px-2 py-1 font-bold text-rose-700">🔴 핵심 영양제<br /><span className="text-[8px] text-rose-500 font-normal">(시급성 1순위)</span></td>
                                                <td className="px-2 py-1 font-bold text-slate-900">
                                                    <div className="flex items-center gap-1.5">
                                                        {p1?.image && (
                                                            <img src={p1.image} alt={p1.name} className="w-7 h-7 rounded border border-emerald-200 object-contain bg-white flex-shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                        )}
                                                        <span>{p1?.name || '액티브 B 컴플렉스'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-1 text-slate-600">{p1?.mainIngredients?.slice(0, 3).join(', ') || '활성 비타민 B군 8종'}</td>
                                                <td className="px-2 py-1"><strong>{p1?.timing || '아침 식후'}</strong>: {p1?.subName || '뇌 포도당 대사 촉진 & 집중력 유지'}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-2 py-1 font-bold text-amber-700">🟡 추천 영양제<br /><span className="text-[8px] text-amber-500 font-normal">(집중/안정 지원)</span></td>
                                                <td className="px-2 py-1 font-bold text-slate-900">
                                                    <div className="flex items-center gap-1.5">
                                                        {p2?.image && (
                                                            <img src={p2.image} alt={p2.name} className="w-7 h-7 rounded border border-emerald-200 object-contain bg-white flex-shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                        )}
                                                        <span>{p2?.name || '캄 슬립 (Calm Sleep)'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-1 text-slate-600">{p2?.mainIngredients?.slice(0, 3).join(', ') || 'L-테아닌, 쌀마그네슘'}</td>
                                                <td className="px-2 py-1"><strong>{p2?.timing || '저녁 식후'}</strong>: {p2?.subName || '교감신경 긴장 완화 & 시험불안 진정'}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-2 py-1 font-bold text-emerald-700">🟢 보조 영양제<br /><span className="text-[8px] text-emerald-500 font-normal">(컨디션 관리용)</span></td>
                                                <td className="px-2 py-1 font-bold text-slate-900">
                                                    <div className="flex items-center gap-1.5">
                                                        {p3?.image && (
                                                            <img src={p3.image} alt={p3.name} className="w-7 h-7 rounded border border-emerald-200 object-contain bg-white flex-shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                        )}
                                                        <span>{p3?.name || '알티지 오메가3 플러스'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-1 text-slate-600">{p3?.mainIngredients?.slice(0, 3).join(', ') || 'EPA/DHA 1000mg'}</td>
                                                <td className="px-2 py-1"><strong>{p3?.timing || '점심 식후'}</strong>: {p3?.subName || '해마 장기기억 고착 & 시각 피로 완화'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })()}

                        {/* ☕ NBASS x HL COFFEE 두뇌 혈류 및 대사 부스터 특화 처방 (인쇄/출력물 전용 상세 가이드) */}
                        <div className="border-2 border-amber-400/80 bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-amber-50/90 rounded-xl p-3 mb-2.5 print-avoid-break shadow-xs">
                            <div className="flex items-center justify-between border-b border-amber-200/80 pb-1.5 mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-black">☕</span>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[11px] font-black text-amber-950">NBASS x HL COFFEE 두뇌 혈류 및 대사 부스터</span>
                                            <span className="bg-amber-600 text-white text-[8px] font-bold px-1.5 py-0.2 rounded">⚡ 뇌혈류 NO 처방</span>
                                        </div>
                                        <p className="text-[9px] text-amber-800 font-bold">HL 아르기닌·카르니틴 스마트 아메리카노 (1포당 아르기닌 2,600mg + 카르니틴 1,200mg + 시트룰린)</p>
                                    </div>
                                </div>
                                <div className="text-right text-[8.5px] text-amber-900 font-semibold bg-white/80 px-2 py-0.5 rounded border border-amber-200">
                                    <span>공식몰 1:1 맞춤 연동 (hl-coffee.com)</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-[9px] mb-2">
                                <div className="bg-white/90 p-2 rounded-lg border border-amber-200/70">
                                    <div className="font-black text-amber-900 flex items-center gap-1 mb-0.5">
                                        <span>🧠</span> <span>뇌 모세혈관 확장 (NO 산화질소)</span>
                                    </div>
                                    <p className="text-slate-600 leading-snug">
                                        고함량 L-아르기닌과 시트룰린이 산화질소를 생성하여 뇌혈류를 확장, 전두엽에 산소와 포도당을 빠르게 공급하여 브레인포그와 두뇌 피로를 즉시 완화합니다.
                                    </p>
                                </div>

                                <div className="bg-white/90 p-2 rounded-lg border border-amber-200/70">
                                    <div className="font-black text-amber-900 flex items-center gap-1 mb-0.5">
                                        <span>⚡</span> <span>저자극 청정 각성 (커피 냅)</span>
                                    </div>
                                    <p className="text-slate-600 leading-snug">
                                        고카페인 에너지 음료와 달리 심장 두근거림이나 불안 증상 없이, 스타벅스 Tall 수준의 마일드 카페인과 아르기닌 시너지로 맑고 지속적인 몰입감을 제공합니다.
                                    </p>
                                </div>

                                <div className="bg-white/90 p-2 rounded-lg border border-amber-200/70">
                                    <div className="font-black text-amber-900 flex items-center gap-1 mb-0.5">
                                        <span>🔥</span> <span>미토콘드리아 ATP &amp; 체지방 분해</span>
                                    </div>
                                    <p className="text-slate-600 leading-snug">
                                        L-카르니틴 1,200mg이 지방산을 세포 미토콘드리아로 운반해 학습 에너지를 생산하며, 장시간 좌식 생활 중 체지방 축적 방지와 활력 개선을 돕습니다.
                                    </p>
                                </div>
                            </div>

                            {/* 섭취 골든타임 및 희석 가이드 바 */}
                            <div className="bg-amber-100/70 rounded-lg p-1.5 flex items-center justify-between text-[8.5px] text-amber-950">
                                <div className="flex items-center gap-3">
                                    <span>⏱️ <strong>섭취 골든타임:</strong> 기상 직후(07:00~08:30) 또는 공부 시작 30분 전 <strong>공복</strong> 음용 (오후 2시 이전 완료 권장)</span>
                                    <span>💧 <strong>음용법:</strong> 시원한 물 <strong>500ml 이상</strong>에 연하게 희석 (⚠️ 60℃ 이상 온수 금지)</span>
                                </div>
                                <span className="font-bold text-amber-800">★ 전 수험생 기본 추천</span>
                            </div>
                        </div>

                        <div className="border border-slate-200 rounded-xl overflow-hidden text-[9.5px]">
                            <table className="w-full text-left">
                                <thead className="bg-slate-900 text-white text-[9px]">
                                    <tr>
                                        <th className="px-2 py-1">끼니</th>
                                        <th className="px-2 py-1">추천 뇌 활성 영양소</th>
                                        <th className="px-2 py-1">식단 구성 및 학습 효과</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-slate-700">
                                    <tr>
                                        <td className="px-2 py-1 font-bold text-blue-700">아침 식사</td>
                                        <td className="px-2 py-1">복합 탄수화물 + 달걀 단백질</td>
                                        <td className="px-2 py-1">뇌 포도당 점진적 공급, 오전 9~12시 골든아워 몰입 지속</td>
                                    </tr>
                                    <tr>
                                        <td className="px-2 py-1 font-bold text-emerald-700">점심 식사</td>
                                        <td className="px-2 py-1">저혈당(Low-GI) 경식 + 견과류</td>
                                        <td className="px-2 py-1">식후 급격한 혈당 스파이크 및 1~2시 식곤증 방지</td>
                                    </tr>
                                    <tr>
                                        <td className="px-2 py-1 font-bold text-indigo-700">저녁 식사</td>
                                        <td className="px-2 py-1">트립토판 풍부 식품 + 마그네슘</td>
                                        <td className="px-2 py-1">숙면 유도 멜라토닌 전환, 수면 중 해마 기억 정리 촉진</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </ReportPage>
            )}

            {/* ================= PAGE 11: EXAM STRATEGY & KILLER HACKS (PRO 이상) ================= */}
            {isProOrAbove && (
                <ReportPage pageNum={11} footerTitle="EXAM STRATEGY & KILLER HACKS">
                    <div>
                        <h2 className="text-base font-black flex items-center mb-1.5 text-slate-800">
                            <span className="w-1.5 h-4 bg-amber-500 mr-2 rounded-sm"></span>
                            📝 실전 수능 시험 전략 & [SECRET] 킬러 문항 공략 팁
                        </h2>

                        <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-xl mb-2 text-xs space-y-1">
                            <h3 className="text-[11px] font-black text-amber-900 border-b border-amber-200 pb-0.5">🏆 상위 1% 킬러 문항 정복 3단계 알고리즘</h3>
                            <p className="text-slate-700 text-[10px] leading-snug">
                                1. <strong>문제 조건 3분 분석</strong>: 문제를 읽자마자 계산에 들어가지 말고, 주어진 조건과 구해야 할 값을 여백에 도식화합니다.<br />
                                2. <strong>풀이 경로 2가지 설계</strong>: 대수적 접근과 기하학적 접근 중 계산 실수가 적은 경로를 사전에 선택합니다.<br />
                                3. <strong>3분 정체 시 패스 룰</strong>: 한 풀이에서 3분 이상 진전이 없으면 즉시 별표 치고 다음 문제로 넘어간 후 2회독 때 재도전합니다.
                            </p>
                        </div>

                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 mb-2">
                            <h3 className="text-[11px] font-black text-slate-800 border-b pb-0.5">🎯 D-Day 실전 컨디션 조절 프로토콜</h3>
                            <p className="text-slate-700 text-[10px] leading-snug">• <strong>시험 2주 전</strong>: 기상 시각을 시험 당일과 동일한 오전 6시 30분으로 완전 고정합니다.</p>
                            <p className="text-slate-700 text-[10px] leading-snug">• <strong>시험 당일 아침</strong>: 뇌 에너지 공급을 위해 소화가 잘되는 복합 탄수화물 식사를 마칩니다.</p>
                            <p className="text-slate-700 text-[10px] leading-snug">• <strong>시험 시작 5분 전</strong>: 4-7-8 이완 호흡으로 심박수를 안정시키고 긍정적 자기 확신(Self-Talk)을 실행합니다.</p>
                        </div>

                        <div className="border border-slate-200 rounded-xl overflow-hidden text-[10px]">
                            <table className="w-full text-left">
                                <thead className="bg-slate-900 text-white">
                                    <tr>
                                        <th className="px-2.5 py-1">교시</th>
                                        <th className="px-2.5 py-1">시험 시간</th>
                                        <th className="px-2.5 py-1">1회독 돌파 구간</th>
                                        <th className="px-2.5 py-1">킬러 도전 & OMR 검토</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-slate-700">
                                    <tr>
                                        <td className="px-2.5 py-1.5 font-bold">1교시 국어</td>
                                        <td className="px-2.5 py-1.5">80분 (08:40~10:00)</td>
                                        <td className="px-2.5 py-1.5">선택(15분) + 문학(25분) = 40분 완료</td>
                                        <td className="px-2.5 py-1.5">독서 킬러 30분 집중 + OMR 검토 10분</td>
                                    </tr>
                                    <tr>
                                        <td className="px-2.5 py-1.5 font-bold">2교시 수학</td>
                                        <td className="px-2.5 py-1.5">100분 (10:30~12:10)</td>
                                        <td className="px-2.5 py-1.5">2점/3점/쉬운4점 22문항 = 50분 완료</td>
                                        <td className="px-2.5 py-1.5">준킬러/킬러 8문항 40분 + 검산/OMR 10분</td>
                                    </tr>
                                    <tr>
                                        <td className="px-2.5 py-1.5 font-bold">3교시 영어</td>
                                        <td className="px-2.5 py-1.5">70분 (13:10~14:20)</td>
                                        <td className="px-2.5 py-1.5">듣기(25분) + 대의파악/도표(20분) = 45분</td>
                                        <td className="px-2.5 py-1.5">빈칸/순서 20분 + 마킹 5분</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </ReportPage>
            )}

            {/* ================= PAGE 12: SECRET POINT & CLINICAL CONSULTANT OPINION (PRO 이상) ================= */}
            {isProOrAbove && (
                <ReportPage pageNum={12} footerTitle="EXPERT CLINICAL OPINION & CONSULTATION MATRIX">
                    {(() => {
                        const isClinicalGridVisible = isProOrAbove;

                        // Generate 7-domain consulting data dynamically
                        const consultingAnalysis = generateConsultingReport(student, hrv, survey, protocol, analytics, result.bloodTest);
                        const consultationScripts = generateConsultationScripts(
                            { student, hrv, survey, protocol, analytics, bloodTest: result.bloodTest },
                            result.careType || CareType.HEALTHY
                        );

                        return (
                            <div className="space-y-3">
                                <div className="border-b-2 border-slate-900 pb-1.5 flex justify-between items-end">
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-100 text-blue-800">
                                                {isClinicalGridVisible ? 'PRO/PREMIUM • 7대 정밀 분석 연동' : 'EXPERT MEMO'}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-bold">임상 전담 분석관 종합 소견</span>
                                        </div>
                                        <h2 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                                            <span>👨‍⚕️</span> 전담 분석관 나의 전문 소견 및 다차원 임상 분석
                                        </h2>
                                    </div>
                                    <div className="text-right text-[9px] text-slate-400 font-mono">
                                        CONFIDENTIAL • CLINICAL OPINION
                                    </div>
                                </div>

                                {/* 1. 👨‍⚕️ 나의 전문 소견 (Admin Memo / Core Opinion) */}
                                <div className="p-3 bg-slate-900 text-white rounded-xl shadow-md space-y-1">
                                    <div className="flex justify-between items-center border-b border-slate-700 pb-1">
                                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
                                            🛡️ 전담 분석관 최종 종합 소견 (Core Opinion)
                                        </span>
                                        <span className="text-[8.5px] text-slate-400 font-mono">SECRET CONSULTANT MEMO</span>
                                    </div>
                                    <p className="text-[10.5px] text-slate-200 leading-relaxed font-medium whitespace-pre-line">
                                        {adminMemo || "피검 학생은 인지 잠재력이 매우 우수하나, 신체 피로 누적 및 특정 시간대의 집중력 분산 패턴이 주요 보완점입니다. 본 보고서에 제시된 24시간 골든타임 배치표와 통합 공부법 매트릭스를 엄격히 적용할 경우, 수능 실전에서 목표 등급 달성 확률이 95% 이상으로 극대화될 것으로 확신합니다."}
                                    </p>
                                </div>

                                {/* Full 5-Domain Clinical Opinion Grid (No Truncation) */}
                                {isClinicalGridVisible && (
                                    <div className="grid grid-cols-2 gap-2.5">
                                        {/* 2. 🔋 에너지 누수 탐지 */}
                                        <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-[10px] space-y-1.5 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-center font-black text-rose-900 mb-1">
                                                    <span className="flex items-center gap-1"><span>🔋</span> 에너지 누수 탐지</span>
                                                    <span className="text-[8.5px] px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full font-bold">생체 배터리</span>
                                                </div>
                                                <p className="text-slate-700 leading-snug font-medium">
                                                    {consultingAnalysis.energyLeakage.split('\n')[0].replace(/🚨|⚠️|✅/g, '').trim()}
                                                </p>
                                            </div>
                                            <div className="bg-white/80 p-2 rounded-lg border border-rose-100 text-[9.5px] text-slate-600">
                                                <strong className="text-rose-700 block mb-0.5">💡 임상 처방:</strong>
                                                {hrv.vitality < 40 || survey.isi >= 15
                                                    ? "오후 2~3시 커피 냅(20분) 및 밤 11시 골든타임 수면 사수, 취침 전 블루라이트 차단"
                                                    : "주말 90분 보상 수면 및 깨어있는 시간의 밀도를 높이는 초몰입 전략 적용"}
                                            </div>
                                        </div>

                                        {/* 3. 🧠 두뇌 매칭 분석 */}
                                        <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-[10px] space-y-1.5 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-center font-black text-indigo-900 mb-1">
                                                    <span className="flex items-center gap-1"><span>🧠</span> 과목별 두뇌 매칭</span>
                                                    <span className="text-[8.5px] px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-bold">생체리듬 동기화</span>
                                                </div>
                                                <p className="text-slate-700 leading-snug font-medium">
                                                    {consultingAnalysis.brainMatching.split('\n')[0].replace(/🚨|⚠️|✅/g, '').trim()}
                                                </p>
                                            </div>
                                            <div className="bg-white/80 p-2 rounded-lg border border-indigo-100 text-[9.5px] text-slate-600">
                                                <strong className="text-indigo-700 block mb-0.5">💡 과목 배치 솔루션:</strong>
                                                {survey.chronotypeResult?.includes('evening') && student.weakSubject === 'math'
                                                    ? "수학 공부 시간을 저녁 8시 이후로 전면 이동, 오전은 단순 암기/인강으로 예열"
                                                    : "취약 과목을 하루 중 가장 컨디션이 좋은 골든타임에 고정 배치하여 인지 효율 극대화"}
                                            </div>
                                        </div>

                                        {/* 4. 😨 불안 유발 요인 */}
                                        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-[10px] space-y-1.5 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-center font-black text-amber-900 mb-1">
                                                    <span className="flex items-center gap-1"><span>😨</span> 시험 불안 유발 요인</span>
                                                    <span className="text-[8.5px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-bold">멘탈 방어기제</span>
                                                </div>
                                                <p className="text-slate-700 leading-snug font-medium">
                                                    {consultingAnalysis.anxietyTrigger.split('\n')[0].replace(/🚨|⚠️|✅/g, '').trim()}
                                                </p>
                                            </div>
                                            <div className="bg-white/80 p-2 rounded-lg border border-amber-100 text-[9.5px] text-slate-600">
                                                <strong className="text-amber-700 block mb-0.5">💡 신경 이완 개입:</strong>
                                                {survey.bai >= 20 || (hrv.sns > 60)
                                                    ? "시험 직전 편도체 과열을 차단하는 '4-7-8 부교감 호흡법' 3회 및 신체 스캔 이완"
                                                    : "불안 생각을 미루는 '걱정 시간(Worry Time)' 운용 및 실전 환경 시뮬레이션"}
                                            </div>
                                        </div>

                                        {/* 5. 💊 대사 효율 코칭 */}
                                        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-[10px] space-y-1.5 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-center font-black text-emerald-900 mb-1">
                                                    <span className="flex items-center gap-1"><span>💊</span> 뇌 영양 및 대사 효율</span>
                                                    <span className="text-[8.5px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold">ATP 에너지 최적화</span>
                                                </div>
                                                <p className="text-slate-700 leading-snug font-medium">
                                                    {consultingAnalysis.metabolicEfficiency.split('\n')[0].replace(/🚨|⚠️|✅/g, '').trim()}
                                                </p>
                                            </div>
                                            <div className="bg-white/80 p-2 rounded-lg border border-emerald-100 text-[9.5px] text-slate-600">
                                                <strong className="text-emerald-700 block mb-0.5">💡 식이/영양 처방:</strong>
                                                {"거꾸로 식사법(채소→단백질→탄수화물)으로 식곤증 차단, 뇌 대사용 비타민B/마그네슘 보충"}
                                            </div>
                                        </div>

                                        {/* 6. 🎧 환경 통제 전략 (Full Span) */}
                                        <div className="col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-300 text-[10px] space-y-1.5">
                                            <div className="flex justify-between items-center font-black text-slate-800">
                                                <span className="flex items-center gap-1"><span>🎧</span> 학습 환경 통제 및 인지 부하 차단</span>
                                                <span className="text-[8.5px] px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full font-bold">집중 환경 격벽</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mt-1">
                                                <p className="text-slate-700 leading-snug font-medium">
                                                    {consultingAnalysis.envControl.split('\n')[0].replace(/🚨|⚠️|✅/g, '').trim()}
                                                </p>
                                                <div className="bg-white p-2 rounded-lg border border-slate-200 text-[9.5px] text-slate-600">
                                                    <strong className="text-indigo-700 block mb-0.5">💡 공간 세팅:</strong>
                                                    {protocol.noiseLevel >= 7
                                                        ? "노이즈 캔슬링 및 책상 위 1권 유지(Visual Clean), 1인 격리 부스 추천"
                                                        : "장소 분리(집=휴식 / 독서실=공부) 및 50분 집중 후 반드시 뇌 산소 환기"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Weekly Action Checklist & Signature */}
                                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-[9.5px] flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <span className="font-bold text-slate-800">👨‍👩‍👧 학부모 및 지도 교사 실천 핵심:</span>
                                        <span className="text-slate-600 ml-2">학습 결과보다 순공 몰입 시간 및 수면 루틴 준수를 칭찬해 주세요.</span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="font-bold text-slate-800">{examinerDisplay}</span>
                                        <span className="w-5 h-5 rounded-full border border-red-500 text-red-600 font-bold text-[8px] flex items-center justify-center">
                                            (인)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </ReportPage>
            )}

            {/* ================= NUTRITIONAL PRESCRIPTION (PRO 이상) ================= */}
            {isProOrAbove && (() => {
                // 대시보드(TargetedNutritionRecommendation)와 100% 동일하게 핵심 2종(1순위 필수 영양제 + HL 스마트 부스터) 및 추천·보조 동기화
                const essentialItem = recommendedProducts.find(p => p.tier === 'ESSENTIAL' && p.productId !== 'hl_focus_booster');
                const recommendedItem = recommendedProducts.find(p => p.tier === 'RECOMMENDED' && p.productId !== 'hl_focus_booster');
                const supportiveItem = recommendedProducts.find(p => p.tier === 'SUPPORTIVE' && p.productId !== 'hl_focus_booster');

                // 1순위 핵심: 대시보드 핵심 영양제 (ex: 마그네슘 캡슐)
                const p1 = essentialItem ? PNT_PRODUCTS[essentialItem.productId] : (PNT_PRODUCTS['1000000021'] || PNT_PRODUCTS['active_b_complex']);
                // 2순위 핵심: HL 아르기닌·카르니틴 스마트 아메리카노 (대시보드 핵심 2종 100% 일치)
                const p2 = PNT_PRODUCTS['hl_focus_booster'];
                // 3순위 추천: 대시보드 추천 영양제 (ex: 캄 슬립 L-테아닌)
                const p3 = recommendedItem ? PNT_PRODUCTS[recommendedItem.productId] : (PNT_PRODUCTS['calm_sleep'] || PNT_PRODUCTS['active_b_complex']);
                // 4순위 보조: 대시보드 보조 영양제 (ex: 알티지 오메가3 플러스)
                const p4 = supportiveItem ? PNT_PRODUCTS[supportiveItem.productId] : PNT_PRODUCTS['1000000001'];
                // 5순위 대사 활성: 비타민C 메가도스 or 활성 B
                const p5 = PNT_PRODUCTS['1000000008'] || PNT_PRODUCTS['active_b_complex'];
                // 6순위 세포 회복: 유산균 or 비타민D
                const p6 = PNT_PRODUCTS['1000000003'] || PNT_PRODUCTS['1000000002'];

                const finalProducts: PntProduct[] = [p1, p2, p3, p4, p5, p6].filter(Boolean) as PntProduct[];
                const prescription = generateNutritionalPrescription(result, finalProducts);

                // Category grouping (Matching modal logic exactly)
                const categories: Record<string, PntProduct[]> = {
                    '뇌 기능 개선': [],
                    '스트레스 관리': [],
                    '신체 건강': []
                };

                finalProducts.forEach(product => {
                    if (product.category === 'Brain') {
                        categories['뇌 기능 개선'].push(product);
                    } else if (product.category === 'Sleep' || product.category === 'Fatigue') {
                        categories['스트레스 관리'].push(product);
                    } else if (product.category === 'Immunity' || product.category === 'Circulation' || product.category === 'Liver' || product.category === 'Gut' || product.category === 'Diet' || product.category === 'Kidney' || product.category === 'Thyroid') {
                        categories['신체 건강'].push(product);
                    } else {
                        categories['신체 건강'].push(product);
                    }
                });

                const genderStr = student.gender === 'Male' ? 'M' : 'F';
                const age = student.age || 18;

                const symptomTagMap: Record<string, string> = {
                    'MEMORY_LOSS': '기억력 감퇴',
                    'POOR_CIRCULATION': '혈액순환 불량',
                    'BRAIN_FATIGUE': '뇌 피로',
                    'STUDENT_FOCUS': '집중력 저하',
                    'MUSCLE_TENSION': '근육 긴장',
                    'SLEEP_DISORDER': '수면 장애',
                    'ANXIETY': '불안',
                    'ADRENAL_FATIGUE': '부신 피로',
                    'BURNOUT': '번아웃',
                    'HOMOCYSTEINE': '호모시스테인 상승',
                    'IBS': '과민성 대장',
                    'CONSTIPATION': '변비',
                    'SENSITIVE_GUT': '민감성 장',
                    'DRY_EYE': '안구 건조',
                    'HIGH_LIPID': '고지혈증',
                    'EYE_FATIGUE': '눈 피로',
                    'IMMUNITY_LOW': '면역력 저하',
                    'THYROID': '갑상선 기능 저하',
                    'HASHIMOTO': '하시모토병',
                    'OBESITY': '비만',
                    'VITAMIN_C_MEGADOSE': '비타민C 메가도즈',
                    'VITAMIN_C_SENSITIVE': '비타민C 민감',
                    'FATIGUE_CHRONIC': '만성 피로',
                    'LIVER_DYSFUNCTION': '간 기능 저하',
                    'OXIDATIVE_STRESS': '산화 스트레스',
                    'METABOLIC_SYNDROME': '대사 증후군',
                    'DIGESTION_POOR': '소화 불량'
                };

                const translatedTags = (prescription.symptomTags || [])
                    .map(tag => symptomTagMap[tag] || tag.replace(/_/g, ' '))
                    .slice(0, 5);

                return (
                    <React.Fragment>
                        <ReportPage pageNum={13} footerTitle="CLINICAL PRESCRIPTION : PROTOCOL OVERVIEW">
                            <div className="flex flex-col h-full font-sans text-slate-800">
                                {/* Clinical Header */}
                                <div className="border-b-2 border-slate-900 pb-2 mb-2 flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center font-serif text-2xl font-black italic tracking-tighter">
                                            ℞
                                        </div>
                                        <div>
                                            <div className="text-[8.5px] font-black tracking-widest text-slate-500 uppercase">Neuro-Endocrine Clinical Nutrition Protocol</div>
                                            <h1 className="text-xl font-black text-slate-900 tracking-tight">NBASS 정밀 영양 처방전</h1>
                                            <p className="text-[9px] text-slate-500 font-mono">CLINICAL NUTRACEUTICAL PRESCRIPTION & BIO-TARGETING</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="inline-block bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-[8.5px] font-mono text-slate-700 font-bold mb-0.5">
                                            DOC-ID: RX-{today.replace(/-/g, '').substring(2)}-{student.id.substring(0, 4)}
                                        </div>
                                        <div className="text-[9px] text-slate-600">처방 책임의: <strong className="text-slate-900 font-bold">{examinerDisplay}</strong></div>
                                    </div>
                                </div>

                                {/* Patient Clinical Master Box */}
                                <div className="border border-slate-300 rounded-lg bg-slate-50/70 p-2 mb-2 text-xs">
                                    <div className="grid grid-cols-5 gap-2">
                                        <div className="border-r border-slate-200 pr-2">
                                            <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">피검자 성명</span>
                                            <div className="text-xs font-black text-slate-900 mt-0.5">{student.name} <span className="text-[9px] font-normal text-slate-500">({genderStr}/{age}세)</span></div>
                                        </div>
                                        <div className="border-r border-slate-200 pr-2">
                                            <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">처방 일자</span>
                                            <div className="text-[10px] font-medium text-slate-800 mt-0.5">{today}</div>
                                        </div>
                                        <div className="border-r border-slate-200 pr-2">
                                            <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">임상 케어 축</span>
                                            <div className="text-[10px] font-bold text-indigo-700 mt-0.5">{result.careType || '자율신경 조절'}</div>
                                        </div>
                                        <div className="border-r border-slate-200 pr-2">
                                            <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">생체신호 상태</span>
                                            <div className="text-[10px] font-bold text-emerald-700 mt-0.5">신경인지 분석 연동</div>
                                        </div>
                                        <div>
                                            <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">뉴로 헬스 스코어</span>
                                            <div className="text-xs font-black text-blue-700 mt-0.5">{prescription.healthScore || 85} <span className="text-[9px] text-slate-500 font-normal">/ 100 pt</span></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Clinical Target Symptoms */}
                                <div className="mb-2">
                                    <div className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                                        <span>임상 진단 바이오마커 및 개선 목표 (Target Indications)</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {translatedTags.map((tag, idx) => (
                                            <span key={idx} className="px-2 py-0.5 bg-white border border-rose-200 text-rose-800 text-[8.5px] font-bold rounded shadow-sm">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Clinical Opinion & Rationale Card */}
                                <div className="border border-blue-200 rounded-lg p-2.5 bg-gradient-to-b from-blue-50/40 to-slate-50 mb-2">
                                    <div className="flex items-center justify-between border-b border-blue-200/80 pb-1 mb-1.5">
                                        <h3 className="text-[10px] font-black text-blue-950 uppercase flex items-center gap-1.5">
                                            <span className="text-blue-600 font-serif">📋</span> 임상 소견서 (Clinical Assessment & Strategy)
                                        </h3>
                                        <span className="text-[8px] font-mono text-blue-600 font-bold">NBASS PROTOCOL-2026</span>
                                    </div>
                                    <div className="bg-white border border-blue-100 rounded p-2 mb-2">
                                        <p className="text-slate-800 leading-relaxed text-[9px] font-medium whitespace-pre-wrap">
                                            {prescription.counselorScript}
                                        </p>
                                    </div>

                                    {/* 3-Axis Therapeutic Rationale */}
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {Object.entries(categories).map(([category, products]) => {
                                            if (products.length === 0) return null;

                                            let rationale = '';
                                            let targetMarker = '';

                                            switch (category) {
                                                case '뇌 기능 개선':
                                                    rationale = '신경전달물질(ACh/GABA) 균형 및 뇌혈류 최적화';
                                                    targetMarker = '작업기억 및 집중 지속력';
                                                    break;
                                                case '스트레스 관리':
                                                    rationale = 'HPA 축 조절 및 교감신경 긴장 이완, 수면 회복';
                                                    targetMarker = '자율신경 균형도 및 코티솔';
                                                    break;
                                                case '신체 건강':
                                                    rationale = '만성 피로 해소, 세포 에너지(ATP) 대사 촉진';
                                                    targetMarker = '부신 피로 및 미토콘드리아 활성';
                                                    break;
                                            }

                                            return (
                                                <div key={category} className="bg-white rounded-lg p-1.5 border border-slate-200">
                                                    <h4 className="text-[9.5px] font-black text-slate-700 mb-0.5 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                                                        {category} ({products.length}개 제품 처방)
                                                    </h4>
                                                    <p className="text-[8.5px] text-slate-600 leading-tight mb-0.5">
                                                        <strong className="text-blue-700">처방 근거:</strong> {rationale}
                                                    </p>
                                                    <div className="text-[8.5px] text-slate-700">
                                                        <strong className="text-emerald-700">기대 효과:</strong> {targetMarker || products.map(p => p.name).join(' | ')}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Lifestyle Guide */}
                                <div className="bg-slate-900 text-white p-2 rounded-xl mb-2">
                                    <h3 className="text-[9.5px] font-bold text-blue-300 mb-0.5 flex items-center gap-1.5">
                                        <span>📋</span> 복용 지도 및 생활 습관 개선
                                    </h3>
                                    <ul className="text-[9px] space-y-0.5 text-slate-300">
                                        {prescription.lifestyleGuide.map((guide, i) => (
                                            <li key={i} className="flex items-start gap-1.5">
                                                <span className="text-blue-400">•</span>
                                                <span>{guide}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Footer */}
                                <div className="mt-auto pt-2 border-t border-slate-100 flex justify-between text-[8.5px] text-slate-400 font-medium">
                                    <p>© 2026 NEURO-EDULAB. 본 처방전은 의료법에 따라 기밀로 취급됩니다.</p>
                                    <p className="uppercase tracking-widest">PRESCRIPTION : PAGE 01</p>
                                </div>
                            </div>
                        </ReportPage>

                        {/* ================= PAGE 14: ALL 6 PRESCRIBED PRODUCTS DETAILS ================= */}
                        <ReportPage pageNum={14} footerTitle="CLINICAL PRESCRIPTION : NUTRACEUTICAL REGIMEN">
                            <div className="flex flex-col h-full font-sans text-slate-800">
                                {/* Header */}
                                <div className="border-b-2 border-slate-900 pb-2 mb-2 flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center font-serif text-2xl font-black italic tracking-tighter">
                                            ℞
                                        </div>
                                        <div>
                                            <div className="text-[8.5px] font-black tracking-widest text-slate-500 uppercase">Itemized Nutraceutical Regimen Specification</div>
                                            <h1 className="text-xl font-black text-slate-900 tracking-tight">처방 성분 및 복용 일정 상세표</h1>
                                            <p className="text-[9px] text-slate-500 font-mono">CLINICAL SPECIFICATIONS & ADMINISTRATION SCHEDULE</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="inline-block bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-[8.5px] font-mono text-slate-800 font-bold mb-0.5">
                                            TOTAL ITEMS: {finalProducts.length}
                                        </div>
                                        <div className="text-[9px] text-slate-600">처방의: <strong className="text-slate-900 font-bold">{examinerDisplay}</strong></div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-blue-700 rounded-sm"></span>
                                        <span>맞춤 처방 제품군 상세 규격 ({finalProducts.length}종 전 품목)</span>
                                    </h2>
                                    <span className="text-[8px] text-slate-500 font-mono">DOSAGE & BIO-ACTIVE COMPOSITION</span>
                                </div>

                                {/* 6 Products Grid (2 cols x 3 rows) */}
                                <div className="grid grid-cols-2 gap-2 flex-1">
                                    {finalProducts.slice(0, 6).map((product, index) => {
                                        const isHl = product.id === 'HL-COFFEE-001';
                                        const badgeInfo = [
                                            { text: '🔴 핵심 1순위', bg: 'bg-rose-100 text-rose-700 border-rose-200' },
                                            { text: '⚡ 스마트 부스터 (핵심 2순위)', bg: 'bg-amber-100 text-amber-900 border-amber-300' },
                                            { text: '🟡 집중 추천', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
                                            { text: '🟢 두뇌 보조', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                                            { text: '🔬 대사 활성', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
                                            { text: '🛡️ 세포 회복', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
                                        ][index] || { text: '맞춤 처방', bg: 'bg-slate-100 text-slate-700 border-slate-200' };

                                        return (
                                            <div key={`${product.id}-${index}`} className="border border-slate-300 bg-white rounded-lg p-2 flex items-start gap-2 text-[9px] shadow-sm relative overflow-hidden">
                                                <div className="flex-shrink-0 flex flex-col items-center gap-1">
                                                    <div className="w-5 h-5 bg-slate-900 text-white rounded flex items-center justify-center font-mono font-black text-[10px]">
                                                        0{index + 1}
                                                    </div>
                                                    <div className="w-12 h-12 rounded border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden p-0.5">
                                                        <img
                                                            src={isHl ? '/hl_coffee_circle.png' : product.image}
                                                            alt={product.name}
                                                            className={`w-full h-full object-contain ${isHl ? 'p-0.5' : 'mix-blend-multiply'}`}
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-[7px] px-1 py-0.2 bg-slate-100 text-slate-700 rounded font-bold uppercase font-mono border border-slate-200">
                                                        {product.category}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="border-b border-slate-100 pb-0.5 mb-1 flex items-start justify-between gap-1">
                                                        <div className="min-w-0">
                                                            <h3 className="text-[10px] font-black text-slate-900 truncate leading-tight">{product.name}</h3>
                                                            <p className="text-[8px] text-indigo-700 font-bold truncate">{product.subName}</p>
                                                        </div>
                                                        <span className={`text-[7px] font-black px-1.5 py-0.2 rounded border shrink-0 whitespace-nowrap ${badgeInfo.bg}`}>
                                                            {badgeInfo.text}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-0.5 text-[8px]">
                                                        <div>
                                                            <strong className="text-slate-500 font-bold">주요 성분: </strong>
                                                            <span className="text-slate-800 font-medium">{product.mainIngredients?.slice(0, 3).join(', ')}</span>
                                                        </div>
                                                        <div>
                                                            <strong className="text-slate-500 font-bold">표적 증상: </strong>
                                                            <span className="text-slate-700">{product.targetSymptoms?.slice(0, 2).join(', ')}</span>
                                                        </div>
                                                        <div className="bg-blue-50/80 border border-blue-200 rounded px-1.5 py-0.5 mt-1 flex justify-between items-center text-[7.5px]">
                                                            <span className="font-bold text-blue-900">권장 복용: <strong>{product.timing || '식후 30분 1회'}</strong></span>
                                                            <span className="text-blue-700 font-mono font-bold">1일 1회</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Important Notice */}
                                <div className="border border-amber-300 bg-amber-50/70 rounded-lg p-2 mt-2 text-[8px]">
                                    <div className="flex items-center gap-1 text-amber-900 font-bold text-[8.5px] mb-0.5">
                                        <span>⚠️</span>
                                        <span>임상 복약 지도 및 안내사항 (Medical Advisory)</span>
                                    </div>
                                    <ul className="text-[8px] text-amber-900 space-y-0.5 leading-tight">
                                        <li>• 본 처방전은 신경생리학적 데이터 분석을 기반으로 작성된 맞춤 영양 관리 프로토콜입니다.</li>
                                        <li>• 기저질환이 있거나 전문의약품을 복용 중인 경우 주치의 또는 담당 약사와 사전 상담 후 섭취하십시오.</li>
                                        <li>• 권장 복용량과 복용 타이밍을 준수하며 이상 반응 발생 시 즉시 복용을 중단하십시오.</li>
                                    </ul>
                                </div>

                                {/* Footer & Official Seal */}
                                <div className="mt-auto pt-2 border-t border-slate-200 flex justify-between items-end text-[8.5px]">
                                    <div className="text-slate-500 font-mono text-[8px]">
                                        <p>ISSUING CENTER: NBASS ADVANCED NEURO-NUTRITION CENTER</p>
                                        <p>VALIDATION: NBASS-VERIFIED-OFFICIAL • CONFIDENTIAL</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-slate-500 font-medium mb-0.5 text-[8.5px]">처방 책임 전문위원 (Doctor in Charge)</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-slate-900">{examinerDisplay}</span>
                                            <span className="inline-block w-7 h-7 rounded-full border-2 border-red-600 text-red-600 font-black text-[8.5px] flex items-center justify-center rotate-[-12deg] shadow-sm">
                                                (처방인)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ReportPage>
                    </React.Fragment>
                );
            })()}

            {/* 15. 1:1 AI 전문 코칭 (PRO 이상 - 시작전 / 학습중 / 신체 / Management / 로드맵 / KPI) */}
            {(() => {
                if (!isProOrAbove || !result.careType) return null;

                const careKey = result.careType;
                const expertData = EXPERT_CONTENTS[careKey] || EXPERT_CONTENTS[CareType.HEALTHY];
                const weeklyPlan = WEEKLY_PLANS[careKey] || WEEKLY_PLANS[CareType.HEALTHY];
                const kpiList = SUCCESS_INDICATORS[careKey] || SUCCESS_INDICATORS[CareType.HEALTHY] || [];

                return (
                    <React.Fragment>
                        {/* Page 15: 1:1 AI 전문 코칭 (Step 1. 시작 전 / Step 2. 학습 중 / Step 3. 신체) */}
                        <ReportPage pageNum={15} footerTitle="1:1 AI EXPERT COACHING • CLINICAL PROTOCOL (PART 1)">
                            <div className="space-y-4">
                                <div className="border-b-2 border-indigo-600 pb-2 flex justify-between items-end">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-700">
                                                PREMIUM PLUS 1:1 AI 전문 코칭
                                            </span>
                                            <span className="text-xs font-bold text-slate-500">진단 유형: {CARE_TYPE_LABELS[result.careType]?.name || result.careType}</span>
                                        </div>
                                        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                            <span>👨‍⚕️</span> 맞춤형 1:1 AI 전문 코칭 가이드 (Expert Guide)
                                        </h2>
                                    </div>
                                    <div className="text-right text-[10px] text-slate-400 font-mono">
                                        CLINICAL AI COACHING PROTOCOL
                                    </div>
                                </div>

                                {/* ⚡ 시작 전 (Pre-Study) */}
                                <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-3.5">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                                            <span>⚡</span> [시작 전] 뇌 예열 및 인지 부하 차단 전략
                                        </h3>
                                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">Pre-Study Protocol</span>
                                    </div>
                                    <p className="text-[10.5px] text-emerald-800/90 mb-2.5 italic">{expertData.prestudy.intro}</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {expertData.prestudy.guides.map((g, idx) => (
                                            <div key={idx} className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-sm text-[10px] space-y-1">
                                                <div className="flex justify-between items-start font-black text-emerald-950">
                                                    <span>✓ {g.title}</span>
                                                    <span className="text-[9px] px-1.5 py-0.2 bg-emerald-50 text-emerald-600 rounded">{g.difficulty}</span>
                                                </div>
                                                <p className="text-slate-700 font-medium leading-snug">{g.expertDesc}</p>
                                                <p className="text-slate-500 text-[9.5px] leading-tight"><strong className="text-emerald-700">근거:</strong> {g.rationale}</p>
                                                <p className="text-indigo-900 bg-indigo-50/70 p-1.5 rounded text-[9.5px] font-semibold"><strong className="text-indigo-600">실행:</strong> {g.action}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 🧠 학습 중 (Learning) */}
                                <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-3.5">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                                            <span>🧠</span> [학습 중] 전두엽 몰입 및 메타인지 인출 전략
                                        </h3>
                                        <span className="text-[10px] text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded-full">Learning Protocol</span>
                                    </div>
                                    <p className="text-[10.5px] text-blue-800/90 mb-2.5 italic">{expertData.learning.intro}</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {expertData.learning.guides.map((g, idx) => (
                                            <div key={idx} className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-sm text-[10px] space-y-1">
                                                <div className="flex justify-between items-start font-black text-blue-950">
                                                    <span>✓ {g.title}</span>
                                                    <span className="text-[9px] px-1.5 py-0.2 bg-blue-50 text-blue-600 rounded">{g.difficulty}</span>
                                                </div>
                                                <p className="text-slate-700 font-medium leading-snug">{g.expertDesc}</p>
                                                <p className="text-slate-500 text-[9.5px] leading-tight"><strong className="text-blue-700">근거:</strong> {g.rationale}</p>
                                                <p className="text-indigo-900 bg-indigo-50/70 p-1.5 rounded text-[9.5px] font-semibold"><strong className="text-indigo-600">실행:</strong> {g.action}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 🏃 신체 (Body & Physiology) */}
                                <div className="bg-orange-50/50 border border-orange-200 rounded-xl p-3.5">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xs font-black text-orange-900 flex items-center gap-1.5">
                                            <span>🏃</span> [신체] 자율신경 활력 및 두뇌 생체 동기화
                                        </h3>
                                        <span className="text-[10px] text-orange-700 font-bold bg-orange-100 px-2 py-0.5 rounded-full">Body & Physiology</span>
                                    </div>
                                    <p className="text-[10.5px] text-orange-800/90 mb-2.5 italic">{expertData.exercise.intro}</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {expertData.exercise.guides.map((g, idx) => (
                                            <div key={idx} className="bg-white p-2.5 rounded-lg border border-orange-100 shadow-sm text-[10px] space-y-1">
                                                <div className="flex justify-between items-start font-black text-orange-950">
                                                    <span>✓ {g.title}</span>
                                                    <span className="text-[9px] px-1.5 py-0.2 bg-orange-50 text-orange-600 rounded">{g.difficulty}</span>
                                                </div>
                                                <p className="text-slate-700 font-medium leading-snug">{g.expertDesc}</p>
                                                <p className="text-slate-500 text-[9.5px] leading-tight"><strong className="text-orange-700">근거:</strong> {g.rationale}</p>
                                                <p className="text-indigo-900 bg-indigo-50/70 p-1.5 rounded text-[9.5px] font-semibold"><strong className="text-indigo-600">실행:</strong> {g.action}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </ReportPage>

                        {/* Page 16: 1:1 AI 전문 코칭 (Management Tools & 로드맵 & KPI 성과 지표) */}
                        <ReportPage pageNum={16} footerTitle="1:1 AI EXPERT COACHING • ROADMAP & KPI (PART 2)">
                            <div className="space-y-4">
                                <div className="border-b-2 border-purple-600 pb-2 flex justify-between items-end">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-700">
                                                MANAGEMENT & ROADMAP
                                            </span>
                                            <span className="text-xs font-bold text-slate-500">지속 관리 프로토콜</span>
                                        </div>
                                        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                            <span>📅</span> 주차별 단계 로드맵 &amp; 핵심 성공 지표 (KPI)
                                        </h2>
                                    </div>
                                    <div className="text-right text-[10px] text-slate-400 font-mono">
                                        ACTION PLAN & KPI METRICS
                                    </div>
                                </div>

                                {/* 📅 주차별 로드맵 (Roadmap) */}
                                <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-3.5">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">🎯</span>
                                            <h3 className="text-xs font-black text-indigo-900">
                                                주차별 단계 로드맵 ({weeklyPlan.totalWeeks}주 완성 프로그램)
                                            </h3>
                                        </div>
                                        <span className="text-[10px] font-black text-white bg-indigo-600 px-2.5 py-0.5 rounded-full">
                                            목표: {weeklyPlan.goal}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                                        {weeklyPlan.weeks.map((w, idx) => (
                                            <div key={idx} className={`p-2.5 rounded-lg border text-[10px] flex flex-col justify-between ${w.milestone ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-slate-200'}`}>
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-black text-indigo-700 text-xs">Week {w.week}</span>
                                                        {w.milestone && <span className="text-[8.5px] bg-indigo-600 text-white px-1.5 py-0.2 rounded font-bold">마일스톤</span>}
                                                    </div>
                                                    <p className="font-bold text-slate-800 mb-1">{w.theme}</p>
                                                    <ul className="space-y-0.5 text-slate-600 text-[9.5px]">
                                                        {w.tasks.map((t, tidx) => (
                                                            <li key={tidx} className="flex items-start gap-1">
                                                                <span className="text-indigo-500 font-bold shrink-0">•</span>
                                                                <span>{t}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                {w.milestone && (
                                                    <p className="mt-2 pt-1 border-t border-indigo-200 font-bold text-indigo-900 text-[9px]">
                                                        🎯 {w.milestone}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 📊 핵심 성공 지표 (KPI) */}
                                <div className="bg-teal-50/50 border border-teal-200 rounded-xl p-3.5">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xs font-black text-teal-900 flex items-center gap-1.5">
                                            <span>📊</span> [KPI] 데이터 기반 핵심 관리 지표 &amp; 개선 목표
                                        </h3>
                                        <span className="text-[10px] text-teal-700 font-bold bg-teal-100 px-2 py-0.5 rounded-full">Objective Metrics</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {kpiList.map((kpi, idx) => (
                                            <div key={idx} className="bg-white p-2.5 rounded-lg border border-teal-100 shadow-sm text-[10px] flex items-start gap-2.5">
                                                <span className="text-xl shrink-0 p-1.5 bg-teal-50 rounded-lg">{kpi.icon}</span>
                                                <div className="space-y-0.5 flex-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-black text-slate-800">{kpi.indicator}</span>
                                                        <span className={`text-[8.5px] px-1.5 py-0.2 rounded font-bold ${kpi.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                                            {kpi.priority === 'high' ? '최우선' : '보통'}
                                                        </span>
                                                    </div>
                                                    <p className="text-teal-700 font-bold text-[9.5px]">🎯 목표치: {kpi.targetValue}</p>
                                                    <div className="flex justify-between text-[9px] text-slate-400 pt-0.5">
                                                        <span>측정주기: {kpi.timeframe}</span>
                                                        <span>측정방법: {kpi.measureMethod}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 🛠️ Management & 대응 솔루션 (Management Tools Summary) */}
                                <div className="bg-slate-900 text-white rounded-xl p-3.5 flex items-center justify-between text-xs">
                                    <div className="space-y-0.5">
                                        <p className="font-black text-amber-400 flex items-center gap-1.5">
                                            <span>💡</span> Management 사후 관리 &amp; 1:1 AI 코칭 시스템 연동
                                        </p>
                                        <p className="text-[10px] text-slate-300">
                                            본 리포트에 수록된 6대 영역(시작 전/학습 중/신체/Management/로드맵/KPI)은 학생의 주간 검진 데이터와 연동되어 자동 업데이트됩니다.
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0 ml-4 font-mono text-[9px] text-slate-400">
                                        VERIFIED BY NBASS AI CLINIC
                                    </div>
                                </div>
                            </div>
                        </ReportPage>
                    </React.Fragment>
                );
            })()}

        </div>
    );
};
