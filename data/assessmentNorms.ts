/**
 * 진단 척도 규준(norm) 유틸 (P0-4)
 *
 * - BAI/ISI 등 표준 척도 점수를 연령/학년 규준 분포에 대입하여 백분위·임상 구분을 제공합니다.
 * - 본 유틸의 모집단 파라미터(평균/표준편차)는 공개된 임상 컷오프를 참고한
 *   "근사 규준 모델"입니다. 실제 규준표 데이터가 확보되면 파라미터만 교체하면 됩니다.
 */

export type NormSeverity = 'minimal' | 'mild' | 'moderate' | 'severe';

export interface NormResult {
    score: number;
    /** 증상 심각도 백분위 (0~100, 높을수록 증상 수준이 높음) */
    percentile: number;
    /** 임상 구분 라벨 */
    band: string;
    severity: NormSeverity;
    /** 결과 카드에 덧붙일 또래 비교 문구 */
    peerLabel: string;
}

interface NormModel {
    mean: number;
    sd: number;
    bands: { max: number; label: string; severity: NormSeverity }[];
}

// 오차함수 근사 (Abramowitz & Stegun 7.1.26)
const erf = (x: number): number => {
    const sign = x >= 0 ? 1 : -1;
    const ax = Math.abs(x);
    const t = 1 / (1 + 0.3275911 * ax);
    const y =
        1 -
        ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
        t *
        Math.exp(-ax * ax);
    return sign * y;
};

// 정규분포 누적확률 (%)
const percentileFromScore = (score: number, model: NormModel): number => {
    const z = (score - model.mean) / model.sd;
    const cdf = 0.5 * (1 + erf(z / Math.SQRT2));
    return Math.max(1, Math.min(99, Math.round(cdf * 100)));
};

const resolveBand = (score: number, model: NormModel) => {
    for (const b of model.bands) {
        if (score <= b.max) return b;
    }
    return model.bands[model.bands.length - 1];
};

const build = (score: number, model: NormModel): NormResult => {
    const safe = Math.max(0, Number.isFinite(score) ? score : 0);
    const band = resolveBand(safe, model);
    const percentile = percentileFromScore(safe, model);
    return {
        score: safe,
        percentile,
        band: band.label,
        severity: band.severity,
        peerLabel: `또래 분포 기준 증상 백분위 ${percentile}% (${band.label})`,
    };
};

/** BAI (Beck Anxiety Inventory, 0~63) 규준 — 표준 임상 컷오프 기반 */
const BAI_MODEL: NormModel = {
    mean: 10,
    sd: 9,
    bands: [
        { max: 7, label: '최소 수준', severity: 'minimal' },
        { max: 15, label: '경미 수준', severity: 'mild' },
        { max: 25, label: '중등도 수준', severity: 'moderate' },
        { max: 63, label: '심한 수준', severity: 'severe' },
    ],
};

/** ISI (Insomnia Severity Index, 0~28) 규준 — 표준 임상 컷오프 기반 */
const ISI_MODEL: NormModel = {
    mean: 8,
    sd: 6,
    bands: [
        { max: 7, label: '임상적 불면 없음', severity: 'minimal' },
        { max: 14, label: '역치하 불면', severity: 'mild' },
        { max: 21, label: '중등도 불면', severity: 'moderate' },
        { max: 28, label: '심한 불면', severity: 'severe' },
    ],
};

export const getBaiNorm = (score: number): NormResult => build(score, BAI_MODEL);
export const getIsiNorm = (score: number): NormResult => build(score, ISI_MODEL);