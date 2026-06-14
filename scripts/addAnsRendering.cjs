const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'components', 'NeuroInsightReport.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Fix the condition to also render sections with rawContent
const oldCondition = 'if (section.items.length === 0) return null;';
const newCondition = '// Skip if no items and no rawContent (for ANS section)\n                if (section.items.length === 0 && !section.rawContent) return null;';

if (content.includes(oldCondition)) {
    content = content.replace(oldCondition, newCondition);
    console.log('Updated condition to include rawContent check');
}

// 2. Add ANS section rendering logic in the Section Content area
// Find the section content rendering and add special handling for rawContent
const sectionContentMarker = '{/* Section Content */}';
const sectionContentIdx = content.indexOf(sectionContentMarker);

if (sectionContentIdx > -1) {
    // Find the next div with p-5 class after Section Content
    const afterMarker = content.substring(sectionContentIdx);
    const gridPattern = '<div className="grid grid-cols-1 md:grid-cols-2 gap-3">';
    const gridIdx = afterMarker.indexOf(gridPattern);

    if (gridIdx > -1) {
        const insertPosition = sectionContentIdx + gridIdx;

        // Check if rawContent rendering is already added
        if (!content.includes('section.rawContent &&')) {
            const ansRenderingCode = `{/* Special rendering for ANS section with rawContent */}
                            {section.rawContent && (() => {
                                const ansData = parseAnsContent(section.rawContent);
                                return (
                                    <div className="col-span-full space-y-4">
                                        {/* ANS Intro */}
                                        {ansData.intro && (
                                            <div className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100">
                                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{ansData.intro}</p>
                                            </div>
                                        )}
                                        {/* ANS Subsections */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {ansData.subsections.map((sub, idx) => (
                                                <div key={idx} className="p-4 bg-white/90 backdrop-blur-sm rounded-2xl border border-teal-100 hover:shadow-lg transition-all">
                                                    <h5 className="font-black text-teal-800 text-sm mb-2">{sub.title}</h5>
                                                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{sub.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                            
                            `;

            content = content.slice(0, insertPosition + gridPattern.length + 1) +
                ansRenderingCode +
                content.slice(insertPosition + gridPattern.length + 1);
            console.log('Added ANS section rendering');
        } else {
            console.log('ANS rendering already exists');
        }
    } else {
        console.log('Could not find grid pattern');
    }
} else {
    console.log('Could not find Section Content marker');
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done!');
