import { HRVData } from '../types';
import { ExtractedField } from './ocrEngine';

const TEXT_TO_SCORE_MAP: Record<string, number> = {
    '매우좋음': 90, '매우 좋음': 90, 'very good': 90, '최상': 90,
    '좋음': 75, 'good': 75, '상': 75,
    '보통': 50, 'normal': 50, '중': 50, '평균': 50,
    '나쁨': 30, 'bad': 30, '하': 30, '경고': 30,
    '매우나쁨': 10, '매우 나쁨': 10, 'very bad': 10, '최하': 10, '위험': 10
};

const mapTextToScore = (text: string | number): number => {
    if (typeof text === 'number') return text;
    const cleanText = text.replace(/[^가-힣a-zA-Z]/g, '').toLowerCase();
    
    // Check direct mapping
    for (const [key, value] of Object.entries(TEXT_TO_SCORE_MAP)) {
        if (cleanText.includes(key.replace(/\s/g, ''))) return value;
    }
    
    // Parse float if it contains numbers
    const num = parseFloat(text);
    if (!isNaN(num)) return num;

    return 50; // Default
};

export const mapExtractedToHRVData = (fields: ExtractedField[], currentData?: Partial<HRVData>): Partial<HRVData> => {
    const data: Partial<HRVData> = { ...currentData };
    
    const getVal = (key: string) => {
        const field = fields.find(f => f.key === key);
        return field && field.value !== "" ? field.value : undefined;
    };

    const getNum = (key: string) => {
        const val = getVal(key);
        let num: number | undefined;
        if (typeof val === 'number') num = val;
        else if (typeof val === 'string') num = parseFloat(val);
        
        if (num === undefined || isNaN(num)) return undefined;

        // Auto-correction for common OCR missing decimal errors
        if (key === 'SNS' || key === 'PNS' || key.includes('Gamma') || key.includes('Beta') || key === 'Alpha' || key === 'Theta') {
            // These are percentages or ratios, usually under 100
            if (num > 100 && num <= 1000) num = num / 10;
            if (num > 1000) num = num / 100;
            if (num > 100) num = 100; // Cap at 100%
        }
        if (key === 'Heart Rate' || key === 'Mean RR') {
            if (num > 300 && num < 2000) num = Math.round(num / 10);
        }

        return num;
    };

    // HRV Basic
    data.meanHr = getNum('Heart Rate') ?? data.meanHr;
    data.tp = getNum('TP') ?? data.tp;
    data.vlf = getNum('VLF') ?? data.vlf;
    data.lf = getNum('LF') ?? data.lf;
    data.hf = getNum('HF') ?? data.hf;
    data.sns = getNum('SNS') ?? data.sns;
    data.pns = getNum('PNS') ?? data.pns;
    
    // HRV Detailed
    data.hrvIndex = getNum('HRV-index') ?? data.hrvIndex;
    data.ansAge = getNum('ANS age') ?? data.ansAge;
    
    const apgType = getVal('APG 유형');
    if (typeof apgType === 'string') {
        const match = apgType.match(/\d/);
        if (match) data.ppgLevel = parseInt(match[0]);
    }
    
    // Text to score mappings
    const physicalStress = getVal('신체스트레스');
    if (physicalStress) data.physicalStress = mapTextToScore(physicalStress);
    
    const vitality = getVal('신체활력도');
    if (vitality) data.vitality = mapTextToScore(vitality);
    
    const fatigue = getVal('누적피로');
    if (fatigue) data.fatigue = mapTextToScore(fatigue);

    // EEG
    data.brainScore = getNum('두뇌건강점수') ?? data.brainScore;
    data.eegGamma = getNum('Gamma') ?? data.eegGamma;
    data.eegHBeta = getNum('H-beta') ?? data.eegHBeta;
    data.eegMBeta = getNum('M-beta') ?? data.eegMBeta;
    data.eegLBeta = getNum('L-beta') ?? data.eegLBeta;
    data.eegAlpha = getNum('Alpha') ?? data.eegAlpha;
    data.eegTheta = getNum('Theta') ?? data.eegTheta;

    const leftActivity = getNum('좌뇌활성도');
    if (leftActivity) data.brainBalanceL = leftActivity;
    
    const rightActivity = getNum('우뇌활성도');
    if (rightActivity) data.brainBalanceR = rightActivity;

    const brainStress = getVal('두뇌스트레스');
    if (brainStress) data.brainStressCategory = String(brainStress);

    const concentration = getVal('집중도');
    if (concentration) data.concentrationCategory = String(concentration);
    
    const attention = getVal('주의도');
    if (attention) data.attentionCategory = String(attention);

    return data;
};

export const mapExtractedToStudentInfo = (fields: ExtractedField[]) => {
    const getVal = (key: string) => {
        const field = fields.find(f => f.key === key);
        return field && field.value !== "" ? String(field.value) : undefined;
    };

    const info: any = {};
    const name = getVal('성명');
    if (name) info.name = name;
    
    const age = getVal('연령');
    if (age) info.age = parseInt(age);
    
    const gender = getVal('성별');
    if (gender) {
        if (gender.includes('남') || gender.toLowerCase() === 'male') info.gender = 'Male';
        if (gender.includes('여') || gender.toLowerCase() === 'female') info.gender = 'Female';
    }

    const date = getVal('검사일시');
    if (date) {
        info.testDate = date.replace(/[-./]/g, '-');
    }

    return info;
};
