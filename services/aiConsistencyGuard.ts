/**
 * AI 리포트 ↔ 진단 정합성 검증 (P2-9)
 *
 * - AI가 생성한 텍스트가 진단 결과(CareType)와 어긋나지 않는지 휴리스틱으로 점검합니다.
 * - 실패를 차단하지 않고 "경고"만 남겨, 필요 시 사람이 검토/재생성할 수 있게 합니다.
 * - 다른 모든 진단이 동일하도록, 상호배타적인 케어타입 키워드가 본문에 강하게 등장하면 경고합니다.
 */

export interface ConsistencyCheckResult {
    ok: boolean;
    warnings: string[];
    matchedExpected: boolean;
}

/** 케어타입별 대표 키워드(부분 일치) */
export const CARE_TYPE_KEYWORDS: Record<string, string[]> = {
    BURNOUT: ['번아웃', '과긴장', '소진'],
    ANXIETY_TENSION: ['불안', '긴장', '시험불안'],
    STRESS_OVERLOAD: ['스트레스', '과부하'],
    LOW_ENERGY: ['저활력', '무기력', '활력 저하'],
    DEPRESSION_AMOTIVATION: ['우울', '무동기', '의욕 저하'],
    ADRENAL: ['부신', '부신피로'],
    BRAIN_FATIGUE: ['뇌 피로', '두뇌 피로', '인지 피로'],
    SLEEP_DEPRIVATION: ['수면 부족', '수면부족', '불면'],
    CIRCADIAN: ['서카디안', '일주기'],
    HEALTHY: ['양호', '안정', '건강'],
};

const normalize = (t: string) => (t || '').replace(/\s+/g, '');

const containsAny = (haystack: string, keywords: string[]): boolean =>
    keywords.some((k) => haystack.includes(normalize(k)));

export const checkAIConsistency = (
    text: string,
    careType: string,
    expectedKeywords?: string[],
): ConsistencyCheckResult => {
    const warnings: string[] = [];
    const body = normalize(text);

    if (!body || body.length < 20) {
        warnings.push('AI 본문이 비어 있거나 너무 짧습니다. 재생성을 권장합니다.');
    }

    const own = expectedKeywords && expectedKeywords.length > 0 ? expectedKeywords : CARE_TYPE_KEYWORDS[careType] || [];
    const matchedExpected = own.length > 0 ? containsAny(body, own) : true;
    if (!matchedExpected) {
        warnings.push(`진단(${careType}) 관련 키워드가 본문에서 확인되지 않습니다. 진단과 서술이 어긋났을 수 있습니다.`);
    }

    // 상호배타적 케어타입 키워드가 강하게 등장하면 경고
    for (const [type, keywords] of Object.entries(CARE_TYPE_KEYWORDS)) {
        if (type === careType) continue;
        if (containsAny(body, keywords)) {
            warnings.push(`다른 유형(${type}) 관련 표현이 포함되어 있습니다. 진단과의 정합성을 확인하세요.`);
        }
    }

    return { ok: warnings.length === 0, warnings, matchedExpected };
};