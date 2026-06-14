import React from 'react';
import { InputField } from './EditorShared';

interface EditorTab_CognitiveProps {
    data: any; // Using any for cognitive results as strict type might be circular or complex
    onChange: (field: string, value: any) => void;
}

export const EditorTab_Cognitive: React.FC<EditorTab_CognitiveProps> = ({ data, onChange }) => {
    // Helper to safely access nested data
    const getValue = (category: string, field: string) => {
        return data?.[category]?.[field] || 0;
    };

    // This handler will update the specific nested structure of cognitiveResults
    const handleChange = (category: string, field: string, value: any) => {
        // Construct the new state for the parent to merge
        // Note: The parent handler needs to be smart enough to merge this deep object
        // For simplicity here, we assume the parent 'onChange' expects (path, value) or we pass a constructed object
        // Let's assume we pass the category and field separately to a specialized handler in the parent,
        // OR we just use a flat key convention like "category.field" and let the parent parse it.
        onChange(`${category}.${field}`, value);
    };

    if (!data) return <div className="text-slate-400 text-sm">No cognitive test data available.</div>;

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2 mb-4">Memory & Attention</h3>
                <div className="grid grid-cols-2 gap-4">
                    <InputField
                        label="Digit Span (Forward)"
                        value={getValue('memory', 'digitSpanForward')}
                        onChange={(v: any) => handleChange('memory', 'digitSpanForward', v)}
                        type="number"
                    />
                    <InputField
                        label="Digit Span (Backward)"
                        value={getValue('memory', 'digitSpanBackward')}
                        onChange={(v: any) => handleChange('memory', 'digitSpanBackward', v)}
                        type="number"
                    />
                    <InputField
                        label="WPM (Reading Speed)"
                        value={getValue('literacy', 'wpm')}
                        onChange={(v: any) => handleChange('literacy', 'wpm', v)}
                        type="number"
                    />
                    <InputField
                        label="Accuracy (%)"
                        value={getValue('attention', 'accuracy')}
                        onChange={(v: any) => handleChange('attention', 'accuracy', v)}
                        type="number"
                    />
                </div>
            </div>

            <div>
                <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2 mb-4">Reaction & Processing</h3>
                <div className="grid grid-cols-2 gap-4">
                    <InputField
                        label="Reaction Time (ms)"
                        value={getValue('reaction', 'avgTime')}
                        onChange={(v: any) => handleChange('reaction', 'avgTime', v)}
                        type="number"
                    />
                    <InputField
                        label="Processing Speed Score"
                        value={getValue('processing', 'score')}
                        onChange={(v: any) => handleChange('processing', 'score', v)}
                        type="number"
                    />
                </div>
            </div>
        </div>
    );
};
