// Final fix script - Rewrite entire THRESHOLD_DESCRIPTIONS section cleanly
const fs = require('fs');

const filePath = 'c:/SN1/components/modals/ConfigModal.tsx';

// Read file content
let content = fs.readFileSync(filePath, 'utf8');

// The complete correct THRESHOLD_DESCRIPTIONS
const correctDescriptions = `// 임계값 설명 정보 (관리자용)
const THRESHOLD_DESCRIPTIONS: Record<string, { label: string; description: string; color: string; recommended: string }> = {
    snsHigh: {
        label: 'SNS High (교감신경 고활성)',
        description: '교감신경(SNS) 활성도가 이 값 이상이면 번아웃 또는 스트레스 유형으로 분류됩니다.',
        color: 'rose',
        recommended: '권장: 55-65%'
    },
    snsLow: {
        label: 'SNS Low (교감신경 저활성 기준)',
        description: '교감신경(SNS) 활성도가 이 값 이하이면 무기력 또는 에너지 저하 유형으로 분류됩니다.',
        color: 'amber',
        recommended: '권장: 25-35%'
    },
    pnsLow: {
        label: 'PNS Low (부교감신경 저활성 기준)',
        description: '부교감신경(PNS) 활성도가 이 값 이하이면 회복력 부족 유형으로 분류됩니다.',
        color: 'blue',
        recommended: '권장: 25-35%'
    },
    brainScoreLow: {
        label: 'Brain Score Low (두뇌 점수 저하 기준)',
        description: '두뇌 건강 점수가 이 값 이하이면 뇌피로 유형으로 분류됩니다.',
        color: 'purple',
        recommended: '권장: 65-75점'
    },
    baiHigh: {
        label: 'BAI High (불안 지수 고위험 기준)',
        description: 'Beck 불안 척도(BAI) 점수가 이 값 이상이면 불안-긴장 유형으로 진단됩니다.',
        color: 'red',
        recommended: '권장: 경도 10점, 중등도 16점, 고도 26점'
    },
    isiHigh: {
        label: 'ISI High (불면 지수 고위험 기준)',
        description: '불면증 심각도 지수(ISI)가 이 값 이상이면 수면장애 유형으로 분류됩니다.',
        color: 'indigo',
        recommended: '권장: 경도 8점, 중등도 15점, 고도 22점'
    },
    adrenalHigh: {
        label: 'Adrenal High (부신피로 고위험 기준)',
        description: '부신피로 설문 점수가 이 값 이상이면 부신피로 유형으로 분류됩니다.',
        color: 'orange',
        recommended: '권장: 중등도 25점, 고도 35점'
    },
    cfsHigh: {
        label: 'CFS High (만성피로 고위험 기준)',
        description: '만성피로 척도(CFS) 점수가 이 값 이상이면 피로 관련 유형으로 분류됩니다.',
        color: 'yellow',
        recommended: '권장: 경도 15점, 중등도 25점'
    },
    concentrationLow: {
        label: 'Concentration Low (집중력 저하 기준)',
        description: '집중력 평가 점수가 이 값 이하이면 집중력 저하 유형으로 분류됩니다.',
        color: 'teal',
        recommended: '권장: 40-50점'
    },
    fatigueHigh: {
        label: 'Fatigue High (피로도 고위험 기준)',
        description: 'HRV 기반 피로도 지표가 이 값 이상이면 높은 피로 상태로 간주됩니다.',
        color: 'slate',
        recommended: '권장: 65-75%'
    },
    vitalityLow: {
        label: 'Vitality Low (활력도 저하 기준)',
        description: 'HRV 기반 활력도 지표가 이 값 이하이면 에너지 저하 상태로 간주됩니다.',
        color: 'emerald',
        recommended: '권장: 35-45%'
    },
    stressIndexHigh: {
        label: 'Stress Index High (스트레스 지수 고위험 기준)',
        description: '스트레스 지수가 이 값 이상이면 높은 스트레스 상태로 간주됩니다.',
        color: 'pink',
        recommended: '권장: 60-70'
    }
};`;

// Find the pattern for THRESHOLD_DESCRIPTIONS - more flexible regex
// Looking for: // comment line + const THRESHOLD_DESCRIPTIONS ... until }; on its own line
const startPattern = /\/\/[^\n]*\n\s*const THRESHOLD_DESCRIPTIONS/;
const match = content.match(startPattern);

if (match) {
    const startIndex = content.indexOf(match[0]);

    // Find the closing }; by counting braces
    let braceCount = 0;
    let inString = false;
    let stringChar = '';
    let endIndex = -1;

    for (let i = startIndex; i < content.length; i++) {
        const char = content[i];
        const prevChar = content[i - 1];

        // Track string state
        if ((char === '"' || char === "'") && prevChar !== '\\') {
            if (!inString) {
                inString = true;
                stringChar = char;
            } else if (char === stringChar) {
                inString = false;
            }
        }

        if (!inString) {
            if (char === '{') braceCount++;
            if (char === '}') {
                braceCount--;
                if (braceCount === 0) {
                    // Found the closing brace, look for semicolon
                    endIndex = i + 1;
                    if (content[i + 1] === ';') endIndex = i + 2;
                    break;
                }
            }
        }
    }

    if (endIndex > startIndex) {
        content = content.substring(0, startIndex) + correctDescriptions + content.substring(endIndex);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('SUCCESS: THRESHOLD_DESCRIPTIONS completely rewritten.');
    } else {
        console.log('ERROR: Could not find end of THRESHOLD_DESCRIPTIONS');
    }
} else {
    console.log('ERROR: Could not find start of THRESHOLD_DESCRIPTIONS');
}
