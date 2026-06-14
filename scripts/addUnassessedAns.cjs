const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'detailedInsights.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Find UNASSESSED and add ANS fields
const unassessedFields = `
        // ANS(자율신경) 활성 상태에 따른 공부법 - 데이터 부족
        ansStudyMethodGeneral: \`📚 **데이터 부족 상태 공부법** - 정확한 분석을 위한 데이터가 불충분합니다. 일반적으로 효과적인 학습법으로 25분 집중-5분 휴식(포모도로), 쓰면서 말하면서 능동적으로 공부하세요. 7-8시간 수면, 규칙적 식사, 적절한 운동을 유지하세요. 💡 루틴: 수면/영양 확인 → 환경 정리 → 25분 집중 → 5분 휴식\`,

        ansStudyMethodMath: \`📐 **데이터 부족 상태 수학 공부법** - 쉬운 문제로 워밍업하고 풀이 과정을 기록하세요. 25분 집중-5분 휴식으로 운영하세요. 💡 루틴: 쉬운 문제 3개 → 중간 난이도 → 25분 후 휴식\`,

        ansStudyMethodKorean: \`📖 **데이터 부족 상태 국어 공부법** - 펜으로 짚으며 읽고 핵심어를 표시하세요. 25분 집중-5분 휴식으로 운영하세요. 💡 루틴: 펜으로 짚으며 읽기 → 표시하기 → 25분 후 휴식\`,

        ansStudyMethodEnglish: \`🌐 **데이터 부족 상태 영어 공부법** - 끊어 읽기와 소리 내어 읽기가 효과적입니다. 25분 집중-5분 휴식으로 운영하세요. 💡 루틴: 끊어 읽기 → 소리 내어 읽기 → 25분 후 휴식\``;

// Find [CareType.UNASSESSED] block and add fields before the closing }
const unassessedPattern = /(\[CareType\.UNASSESSED\]:[\s\S]*?anxietyExplanation:[\s\S]*?[`])(\s*\n\s*\}\s*\n\s*\};)/;
const match = content.match(unassessedPattern);
if (match) {
    const replacement = match[1] + ',' + unassessedFields + match[2];
    content = content.replace(unassessedPattern, replacement);
    console.log('Updated UNASSESSED successfully');
} else {
    console.log('Pattern not found for UNASSESSED');

    // Try simpler pattern - find closing of UNASSESSED before };
    const simplePattern = /(완전한 검사를 완료하시면 맞춤형 불안 관리 전략을 받으실 수 있습니다\.\`)(\s*\n\s*\}\s*\n\s*\};)/;
    const simpleMatch = content.match(simplePattern);
    if (simpleMatch) {
        const replacement = simpleMatch[1] + ',' + unassessedFields + simpleMatch[2];
        content = content.replace(simplePattern, replacement);
        console.log('Updated UNASSESSED with simple pattern');
    } else {
        console.log('Simple pattern also not found');
    }
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done!');
