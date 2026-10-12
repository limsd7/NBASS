import React from 'react';
import { StudentInfo, AIModelConfig } from '../../../types';
import { KoreanClinicApp } from '../../subject-apps/KoreanClinicApp';
import { MathClinicApp } from '../../subject-apps/MathClinicApp';
import { EnglishClinicApp } from '../../subject-apps/EnglishClinicApp';

interface ClinicSubjectState {
    subjectId: string;
    strategyTag?: string;
    strategyType?: 'grade_strategy' | 'cognitive_tip';
    currentGrade?: number;
    targetGrade?: number;
}

interface Props {
    openClinicSubject: ClinicSubjectState | null;
    student: StudentInfo;
    aiModels?: AIModelConfig | null;
    onClose: () => void;
}

export const ClinicFullscreenModals: React.FC<Props> = ({ openClinicSubject, student, aiModels, onClose }) => {
    return (
        <>
            {/* 국어 과목 전용 AI 클리닉 앱 풀스크린 모달 (새 창 팝업 차단 시 또는 직접 열기) */}
            {openClinicSubject && openClinicSubject.subjectId === 'korean' && (
                <div className="fixed inset-0 z-[200] bg-slate-950 overflow-y-auto animate-in fade-in duration-200">
                    <KoreanClinicApp
                        student={student}
                        aiConfig={aiModels}
                        initialStrategyTag={openClinicSubject.strategyTag}
                        initialStrategyType={openClinicSubject.strategyType}
                        currentGrade={openClinicSubject.currentGrade}
                        targetGrade={openClinicSubject.targetGrade}
                        onClose={onClose}
                        isStandalone={false}
                    />
                </div>
            )}

            {/* 수학 과목 전용 AI 클리닉 앱 풀스크린 모달 */}
            {openClinicSubject && openClinicSubject.subjectId === 'math' && (
                <div className="fixed inset-0 z-[200] bg-slate-950 overflow-y-auto animate-in fade-in duration-200">
                    <MathClinicApp
                        student={student}
                        aiConfig={aiModels}
                        initialStrategyTag={openClinicSubject.strategyTag}
                        initialStrategyType={openClinicSubject.strategyType}
                        currentGrade={openClinicSubject.currentGrade}
                        targetGrade={openClinicSubject.targetGrade}
                        onClose={onClose}
                        isStandalone={false}
                    />
                </div>
            )}

            {/* 영어 과목 전용 AI 클리닉 앱 풀스크린 모달 */}
            {openClinicSubject && openClinicSubject.subjectId === 'english' && (
                <div className="fixed inset-0 z-[200] bg-slate-950 overflow-y-auto animate-in fade-in duration-200">
                    <EnglishClinicApp
                        student={student}
                        aiConfig={aiModels}
                        initialStrategyTag={openClinicSubject.strategyTag}
                        initialStrategyType={openClinicSubject.strategyType}
                        currentGrade={openClinicSubject.currentGrade}
                        targetGrade={openClinicSubject.targetGrade}
                        onClose={onClose}
                        isStandalone={false}
                    />
                </div>
            )}
        </>
    );
};

export default ClinicFullscreenModals;