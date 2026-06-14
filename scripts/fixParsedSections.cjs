const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'components', 'NeuroInsightReport.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Use a simpler approach - replace the exact line
const oldLine = 'const { items, subItems } = parseSection(analysisText, section.id);';
const newLine = 'const { items, subItems, rawContent } = parseSection(analysisText, section.id);';

if (content.includes(oldLine)) {
    content = content.replace(oldLine, newLine);
    console.log('Fixed: Added rawContent to destructuring');
}

const oldReturn = 'return { ...section, items, subItems };';
const newReturn = 'return { ...section, items, subItems, rawContent };';

if (content.includes(oldReturn)) {
    content = content.replace(oldReturn, newReturn);
    console.log('Fixed: Added rawContent to return statement');
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done!');
