const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'components', 'NeuroInsightReport.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Add parseAnsContent function after parseSection
if (!content.includes('parseAnsContent')) {
    const parseAnsContentFunc = `

    // Parse ANS section content into subsections
    const parseAnsContent = (rawContent: string): { intro: string; subsections: { title: string; content: string }[] } => {
        const lines = rawContent.split('\\n');
        let intro = '';
        const subsections: { title: string; content: string }[] = [];
        let currentSubsection: { title: string; content: string[] } | null = null;

        for (const line of lines) {
            if (line.startsWith('### ')) {
                if (currentSubsection) {
                    subsections.push({ title: currentSubsection.title, content: currentSubsection.content.join('\\n').trim() });
                }
                currentSubsection = { title: line.substring(4).trim(), content: [] };
            } else if (currentSubsection) {
                currentSubsection.content.push(line);
            } else {
                intro += line + '\\n';
            }
        }

        if (currentSubsection) {
            subsections.push({ title: currentSubsection.title, content: currentSubsection.content.join('\\n').trim() });
        }

        return { intro: intro.trim(), subsections };
    };

`;

    // Find where to insert - after the parseSection closing brace
    const insertPoint = content.indexOf('// Section configurations');
    if (insertPoint > -1) {
        content = content.slice(0, insertPoint) + parseAnsContentFunc + content.slice(insertPoint);
        console.log('Added parseAnsContent function');
    } else {
        console.log('Could not find insertion point');
    }
} else {
    console.log('parseAnsContent already exists');
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done!');
