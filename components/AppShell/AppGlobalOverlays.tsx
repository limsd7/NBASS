import React from 'react';
import { AssessmentResult, CareType, MembershipTier, Prescription } from '../../types';
import { LogicEngineConfig, saveLogicConfig } from '../../logicEngine';
import { resetLogicConfig } from '../../logicEngine';
import { resetProductRecommendations } from '../../data/productRecommendations';
import { resetPredictionRules } from '../../data/predictionRules';
import { AdminPasswordModal } from '../modals/AdminPasswordModal';
import { RuleEditor } from '../modals/RuleEditor';
import { PrescriptionZenMode } from '../PrescriptionZenMode';
import { DataEditorModal } from '../modals/DataEditorModal';
import { StudyEfficiencyAssessment } from '../StudyEfficiencyAssessment';
import { PomodoroTimer } from '../PomodoroTimer';
import { FollowUpReminderBanner } from '../common/FollowUpReminderBanner';
import { inferLearningTraitsFromProfile } from '../../data/learningTraitsData';

export const mergeStudyEfficiencyIntoResult = (
    result: AssessmentResult,
    assessmentResults: {
        chronotype?: { score?: number; result?: string };
        vark?: { primary?: string; V?: number; A?: number; R?: number; K?: number };
        testAnxiety?: { cognitiveScore?: number; somaticScore?: number; dominantType?: string };
        digitalAddiction?: { totalScore?: number; level?: string };
        metacognition?: {
            learnerLevel?: string;
            rehearsalScore?: number;
            elaborationScore?: number;
            organizationScore?: number;
            metacognitiveScore?: number;
        };
    },
): AssessmentResult => {
    const updatedSurvey = {
        ...result.survey,
        chronotypeScore: assessmentResults.chronotype?.score ?? result.survey?.chronotypeScore,
        chronotypeResult: assessmentResults.chronotype?.result ?? result.survey?.chronotypeResult,
        varkPrimary: assessmentResults.vark?.primary ?? result.survey?.varkPrimary,
        varkScores: assessmentResults.vark
            ? {
                V: assessmentResults.vark.V,
                A: assessmentResults.vark.A,
                R: assessmentResults.vark.R,
                K: assessmentResults.vark.K,
            }
            : result.survey?.varkScores,
        testAnxietyCognitive: assessmentResults.testAnxiety?.cognitiveScore ?? result.survey?.testAnxietyCognitive,
        testAnxietySomatic: assessmentResults.testAnxiety?.somaticScore ?? result.survey?.testAnxietySomatic,
        testAnxietyType: (assessmentResults.testAnxiety?.dominantType as "cognitive" | "somatic" | "balanced" | undefined) ?? result.survey?.testAnxietyType,
        digitalAddictionScore: assessmentResults.digitalAddiction?.totalScore ?? result.survey?.digitalAddictionScore,
        digitalAddictionLevel: assessmentResults.digitalAddiction?.level ?? result.survey?.digitalAddictionLevel,
        metacognitionLevel: assessmentResults.metacognition?.learnerLevel ?? result.survey?.metacognitionLevel,
        metacognitionScores: assessmentResults.metacognition
            ? {
                rehearsal: assessmentResults.metacognition.rehearsalScore,
                elaboration: assessmentResults.metacognition.elaborationScore,
                organization: assessmentResults.metacognition.organizationScore,
                metacognitive: assessmentResults.metacognition.metacognitiveScore,
            }
            : result.survey?.metacognitionScores,
    };

    const hasExplicitTraits = Boolean(
        result.student?.learningTraits &&
        result.student.learningTraits.rawAnswers &&
        Array.isArray(result.student.learningTraits.rawAnswers) &&
        result.student.learningTraits.rawAnswers.some((a: number) => a !== 3 && a !== undefined && a !== null)
    );

    let updatedTraits = result.student?.learningTraits || result.survey?.learningTraits;
    if (!hasExplicitTraits) {
        updatedTraits = inferLearningTraitsFromProfile({
            careType: result.careType,
            survey: updatedSurvey,
            studyEfficiency: assessmentResults as any,
            student: result.student
        });
        updatedSurvey.learningTraits = updatedTraits;
    }

    return {
        ...result,
        student: {
            ...result.student,
            learningTraits: updatedTraits,
        },
        survey: updatedSurvey,
        studyEfficiencyResults: assessmentResults,
    } as AssessmentResult;
};

interface AppGlobalOverlaysProps {
    showAdminPassword: boolean;
    adminPasswordInput: string;
    setAdminPasswordInput: (v: string) => void;
    handleAdminUnlock: () => void;
    setShowAdminPassword: (v: boolean) => void;
    showClassificationEditor: boolean;
    setShowClassificationEditor: (v: boolean) => void;
    showProductRuleEditor: boolean;
    setShowProductRuleEditor: (v: boolean) => void;
    logicConfig: LogicEngineConfig;
    setLogicConfig: (c: LogicEngineConfig) => void;
    showZenMode: boolean;
    setShowZenMode: (v: boolean) => void;
    result: AssessmentResult | null;
    prescriptions: Record<string, Prescription>;
    showDataEditor: boolean;
    setShowDataEditor: (v: boolean) => void;
    handleDataUpdate: (d: AssessmentResult) => void;
    showStudyEfficiencyModal: boolean;
    setShowStudyEfficiencyModal: (v: boolean) => void;
    setStudyEfficiencyResults: (r: never) => void;
    setResult: (r: AssessmentResult) => void;
    usePortable: boolean;
    useBrainBody: boolean;
    membershipTier?: MembershipTier;
    isFreeMode?: boolean;
    onUpgrade?: () => void;
}

export const AppGlobalOverlays: React.FC<AppGlobalOverlaysProps> = (props) => {
    const {
        showAdminPassword,
        adminPasswordInput,
        setAdminPasswordInput,
        handleAdminUnlock,
        setShowAdminPassword,
        showClassificationEditor,
        setShowClassificationEditor,
        showProductRuleEditor,
        setShowProductRuleEditor,
        logicConfig,
        setLogicConfig,
        showZenMode,
        setShowZenMode,
        result,
        prescriptions,
        showDataEditor,
        setShowDataEditor,
        handleDataUpdate,
        showStudyEfficiencyModal,
        setShowStudyEfficiencyModal,
        setStudyEfficiencyResults,
        setResult,
        usePortable,
        useBrainBody,
        membershipTier,
        isFreeMode,
        onUpgrade,
    } = props;

    return (
        <>
            <AdminPasswordModal
                isOpen={showAdminPassword}
                password={adminPasswordInput}
                onPasswordChange={setAdminPasswordInput}
                onConfirm={handleAdminUnlock}
                onCancel={() => {
                    setShowAdminPassword(false);
                    setAdminPasswordInput('');
                }}
            />
            {showClassificationEditor && (
                <RuleEditor
                    type="classification"
                    rules={logicConfig.classificationRules}
                    onSave={(rules) => {
                        const newConfig = { ...logicConfig, classificationRules: rules };
                        setLogicConfig(newConfig);
                        saveLogicConfig(newConfig);
                    }}
                    onClose={() => setShowClassificationEditor(false)}
                />
            )}
            {showProductRuleEditor && (
                <RuleEditor
                    type="product"
                    rules={logicConfig.productRules}
                    onSave={(rules) => {
                        const newConfig = { ...logicConfig, productRules: rules };
                        setLogicConfig(newConfig);
                        saveLogicConfig(newConfig);
                    }}
                    onClose={() => setShowProductRuleEditor(false)}
                />
            )}
            {showZenMode && result && (
                <PrescriptionZenMode
                    careType={result.careType}
                    prescription={prescriptions[result.careType] || prescriptions[CareType.BURNOUT]}
                    onClose={() => setShowZenMode(false)}
                />
            )}
            {result && (
                <DataEditorModal
                    isOpen={showDataEditor}
                    onClose={() => setShowDataEditor(false)}
                    initialData={result}
                    onSave={handleDataUpdate}
                />
            )}
            {showStudyEfficiencyModal && result && (
                <StudyEfficiencyAssessment
                    careType={result.careType}
                    isPortableMode={usePortable && !useBrainBody}
                    isFreeMode={isFreeMode}
                    membershipTier={membershipTier}
                    onUpgrade={onUpgrade}
                    onComplete={(results) => {
                        setStudyEfficiencyResults(results as never);
                        setShowStudyEfficiencyModal(false);
                        const updatedResult = mergeStudyEfficiencyIntoResult(result, results);
                        setResult(updatedResult);
                        alert('공부 효율성 검사가 완료되었습니다! 결과가 리포트에 반영됩니다.');
                    }}
                    onClose={() => setShowStudyEfficiencyModal(false)}
                />
            )}
            <PomodoroTimer careType={result?.careType} />
            {/* [P1-2] 정밀 재검사(2주 추적) 인앱 리마인더 — 기존 오버레이에 추가만 반영 */}
            <FollowUpReminderBanner />
        </>
    );
};

export const __resetHelpers = {
    resetLogicConfig,
    resetProductRecommendations,
    resetPredictionRules,
};
