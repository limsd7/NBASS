/**
 * 진단 규칙(logicConfig) 버전 각인 (P0-2)
 *
 * - 진단 결과는 관리자가 UI에서 편집 가능한 분류 규칙(logicEngine)에 의존합니다.
 * - 규칙이 나중에 변경되면 과거 리포트를 재현할 수 없으므로, 결과 저장 시점의
 *   규칙 버전/해시를 스냅샷으로 함께 각인합니다.
 * - 해시는 "활성화된 분류 규칙"만 대상으로 하며, 규칙 ID 기준 정렬로 순서 독립적입니다.
 */
import { LogicEngineConfig } from '../logicEngine';
import { LogicConfigSnapshot } from '../types';

/** 활성 분류 규칙 집합의 결정적 해시 (djb2 변형) */
export const hashClassificationRules = (config: LogicEngineConfig | null | undefined): string => {
    const rules = [...(config?.classificationRules || [])]
        .filter((r) => r.enabled)
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((r) =>
            `${r.id}:${r.result}:${r.priority}:${r.combinator}:${[...(r.conditions || [])]
                .map((c) => `${c.field}${c.operator}${c.value}`)
                .sort()
                .join(',')}`,
        )
        .join('|');

    let h = 5381;
    for (let i = 0; i < rules.length; i++) {
        h = ((h << 5) + h + rules.charCodeAt(i)) | 0;
    }
    return `lcfg_${(h >>> 0).toString(16)}`;
};

/** 결과에 각인할 규칙 스샷 생성 */
export const createLogicConfigSnapshot = (config: LogicEngineConfig | null | undefined): LogicConfigSnapshot => ({
    version: config?.version || 'unknown',
    lastModified: config?.lastModified || '',
    capturedAt: new Date().toISOString(),
    rulesHash: hashClassificationRules(config),
    classificationRuleCount: (config?.classificationRules || []).filter((r) => r.enabled).length,
});