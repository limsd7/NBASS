/**
 * 진단 데이터 신뢰도 산출 (P0-3)
 *
 * - HRV/EEG 센서 입력 UI 제거 이후, 일부 지표는 실측이 아니라 설문/프로토콜 기반
 *   "추정치"입니다. 이를 실측처럼 표기하지 않도록 도메인별 실측/추정 상태를 산출합니다.
 * - UI는 기존 내용을 유지하고, 이 결과로 배지/라벨만 붙입니다(제거/간소화 없음).
 */
import { AssessmentConfidence, DataConfidenceDomain, DataConfidenceStatus } from '../types';

export interface ConfidenceInput {
    /** 센서(HRV 또는 포터블) 실측 여부 */
    isSensorMeasured?: boolean;
    isHrvTested?: boolean;
    isEegTested?: boolean;
    /** 포터블 HRV 실제 입력 여부 */
    portableHrvPresent?: boolean;
    /** BAI/ISI 등 심리 설문 응답 수집 여부 */
    surveyCollected?: boolean;
    /** 인지 검사(집중/작업기억) 시행 여부 */
    cognitivePresent?: boolean;
    /** 학습 분석(AnalyticsStep) 실측 여부 */
    analyticsTested?: boolean;
    /** 의학 모드 혈액검사 반영 여부 */
    bloodTestApplied?: boolean;
}

const status = (ok: boolean): DataConfidenceStatus => (ok ? 'measured' : 'estimated');

export const computeAssessmentConfidence = (input: ConfidenceInput): AssessmentConfidence => {
    const ansMeasured = Boolean(input.isSensorMeasured || input.isHrvTested || input.portableHrvPresent);

    const domains: DataConfidenceDomain[] = [
        {
            key: 'ans',
            label: '자율신경(HRV/ANS)',
            status: status(ansMeasured),
            note: ansMeasured ? '센서 실측값 반영' : '설문/프로토콜 기반 추정치',
        },
        {
            key: 'eeg',
            label: '파(EEG)',
            status: status(Boolean(input.isEegTested)),
            note: input.isEegTested ? 'EEG 실측값 반영' : 'EEG 미측정 · 패턴 추정',
        },
        {
            key: 'psych',
            label: '심리 설문(BAI/ISI 등)',
            status: status(Boolean(input.surveyCollected)),
            note: input.surveyCollected ? '표준 도 응답 수집' : '설문 미수집 · 기본값 사용',
        },
        {
            key: 'cognitive',
            label: '인지 검사(집중/작업기억)',
            status: status(Boolean(input.cognitivePresent)),
            note: input.cognitivePresent ? '인지 과제 실측' : '인지 검사 미시행',
        },
        {
            key: 'analytics',
            label: '학습 분석(순공/집중)',
            status: status(Boolean(input.analyticsTested)),
            note: input.analyticsTested ? '학습 분석 실측' : '취약과목/프로필 기반 추정',
        },
    ];

    if (input.bloodTestApplied) {
        domains.push({
            key: 'medical',
            label: '의학 검사(혈액)',
            status: 'measured',
            note: '혈액검사 수치 반영',
        });
    }

    const measuredCount = domains.filter((d) => d.status === 'measured').length;
    const estimatedCount = domains.length - measuredCount;
    const overall: AssessmentConfidence['overall'] =
        estimatedCount === 0 ? 'measured' : measuredCount === 0 ? 'estimated' : 'mixed';

    return { overall, measuredCount, estimatedCount, domains };
};