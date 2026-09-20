/**
 * 핵심 엔진 자기검증(Self-Check) (P2-16 대안)
 *
 * - 테스트 러너 도입 없이도, 순수 모듈(분류·규준·신뢰도·리마인더·정합성·이행률)의
 *   핵심 불변식을 런타임에 검증하여 회귀를 조기에 감지합니다.
 * - 개발 모드에서만 실행되며, 운영 빌드에는 영향을 주지 않습니다.
 */
import { verifySpacedRepetitionPolicy } from './spacedRepetitionPolicy';
import { getBaiNorm, getIsiNorm } from '../data/assessmentNorms';
import { computeAssessmentConfidence } from './assessmentConfidence';
import { computeFollowUpReminder } from './followUpReminder';
import { checkAIConsistency } from './aiConsistencyGuard';
import { computeAdherence } from './treatmentAdherence';
import { deriveCognitiveIndicators } from './cognitiveGameFeedback';
import { computeReadiness } from './assessmentReadiness';

export interface SelfCheckResult {
    passed: boolean;
    checked: number;
    failures: string[];
}

export const runEngineSelfChecks = (): SelfCheckResult => {
    const failures: string[] = [];
    const check = (name: string, cond: boolean) => {
        if (!cond) failures.push(name);
    };

    // 간격반복 정책 (5단계)
    check('spacedRepetition: 5단계 정책', verifySpacedRepetitionPolicy().policy.length === 5);

    // 규준 백분위 단조성
    check('norms: BAI 백분위 단조 증가', getBaiNorm(0).percentile < getBaiNorm(63).percentile);
    check('norms: ISI 백분위 단조 증가', getIsiNorm(0).percentile < getIsiNorm(28).percentile);

    // 데이터 신뢰도
    check('confidence: 미입력 시 estimated', computeAssessmentConfidence({}).overall === 'estimated');
    check(
        'confidence: 일부 실측 시 mixed/measured',
        ['mixed', 'measured'].includes(computeAssessmentConfidence({ isSensorMeasured: true }).overall),
    );

    // 재검사 리마인더
    const overdue = new Date(Date.now() - 30 * 86_400_000).toISOString();
    check('reminder: 30일 경과 overdue', computeFollowUpReminder(overdue).stage === 'overdue');
    check('reminder: 이력 없음 none', computeFollowUpReminder(null).stage === 'none');

    // AI 정합성 가드
    check('aiConsistency: 빈 본문 경고', checkAIConsistency('', 'BURNOUT').ok === false);

    // 처방 이행률 (1/3 → 33%)
    const adherence = computeAdherence({
        careGuide: ['a', 'b'],
        nutrition: ['c'],
        completedExpertGuideItems: ['a'],
    } as never);
    check('adherence: 1/3 = 33%', adherence.rate === 33);

    // 인지 게임 환류 (digitSpan 10 → 100)
    const indicators = deriveCognitiveIndicators({ digitSpan: 10 });
    check('cognitive: digitSpan 정규화 100', indicators.length === 1 && indicators[0].score === 100);

    // 준비도 (필수 누락 시 not ready)
    const readiness = computeReadiness([{ key: 'bai', label: 'BAI', answered: 0, total: 21, required: true }]);
    check('readiness: 필수 누락 not ready', readiness.ready === false);

    const checked = 12;
    return { passed: failures.length === 0, checked, failures };
};