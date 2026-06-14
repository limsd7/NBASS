const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'components', 'NeuroInsightReport.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Simple replacement - find the parseSection function and add the new parseAnsContent function after it
const searchStr = 'return { items, subItems };\n    };';
const replaceWithStr = `return { items, subItems };
    };

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
    };`;

if (content.includes(searchStr) && !content.includes('parseAnsContent')) {
    content = content.replace(searchStr, replaceWithStr);
    console.log('Added parseAnsContent function');
} else if (content.includes('parseAnsContent')) {
    console.log('parseAnsContent already exists');
} else {
    console.log('Could not find the target string');
}

// Now modify the parseSection function return type and add ANS section handling
const oldParseSectionDecl = 'const parseSection = (text: string, sectionId: string): { items: string[]; subItems: string[] } => {';
const newParseSectionDecl = 'const parseSection = (text: string, sectionId: string): { items: string[]; subItems: string[]; rawContent?: string } => {';

if (content.includes(oldParseSectionDecl)) {
    content = content.replace(oldParseSectionDecl, newParseSectionDecl);
    console.log('Updated parseSection return type');
}

// Add ANS section handling after the match check
const oldReturnCheck = "if (!match) return { items: [], subItems: [] };";
const insertAfterReturnCheck = `if (!match) return { items: [], subItems: [] };

        // For ANS section (id 5), return raw content for special rendering
        if (sectionId === '5') {
            return { items: [], subItems: [], rawContent: match[1].trim() };
        }`;

if (content.includes(oldReturnCheck) && !content.includes("sectionId === '5'")) {
    content = content.replace(oldReturnCheck, insertAfterReturnCheck);
    console.log('Added ANS section handling');
} else if (content.includes("sectionId === '5'")) {
    console.log('ANS handling already exists');
}

// Also fix the regex pattern to include ### for section 5
const oldRegex = "const regex = new RegExp(`## \\\\[${sectionId}\\\\][^\\\\n]*\\\\n([\\\\s\\\\S]*?)(?=## \\\\[|### |---|\\$)`, 'g');";
const newRegex = `const isAnsSection = sectionId === '5';
        const regexPattern = isAnsSection 
            ? \`## \\\\[\${sectionId}\\\\][^\\\\n]*\\\\n([\\\\s\\\\S]*?)(?=## \\\\[|---|\$)\`
            : \`## \\\\[\${sectionId}\\\\][^\\\\n]*\\\\n([\\\\s\\\\S]*?)(?=## \\\\[|### |---|\$)\`;
        const regex = new RegExp(regexPattern, 'g');`;

if (content.includes(oldRegex) && !content.includes('isAnsSection')) {
    content = content.replace(oldRegex, newRegex);
    console.log('Updated regex pattern');
} else if (content.includes('isAnsSection')) {
    console.log('Regex already updated');
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done!');
