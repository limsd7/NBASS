import { ExtractedField } from './ocrEngine';

export const updateAutoCalculatedFields = (fields: ExtractedField[]): ExtractedField[] => {
    const updated = [...fields];

    // Clean up 'number' type fields from raw text like "적정(7.33)" -> "7.33"
    for (let i = 0; i < updated.length; i++) {
        const field = updated[i];
        if (field.type === 'number' && typeof field.value === 'string' && field.value !== '') {
            const match = field.value.match(/([\d,]+(?:\.\d+)?)/);
            if (match) {
                field.value = parseFloat(match[1].replace(/,/g, ''));
            } else {
                field.value = "";
            }
        }
    }

    const getNum = (key: string) => {
        const field = updated.find(f => f.key === key);
        if (!field || field.value === "") return 0;
        const num = typeof field.value === 'string' ? parseFloat(field.value) : field.value as number;
        return isNaN(num) ? 0 : num;
    };

    const updateField = (key: string, value: number) => {
        const idx = updated.findIndex(f => f.key === key);
        if (idx !== -1) {
            updated[idx] = {
                ...updated[idx],
                value: Number.isInteger(value) ? value : parseFloat(value.toFixed(2)),
                confidence: 1.0,
                description: '자동 계산됨'
            };
        } else {
            updated.push({
                key,
                value: Number.isInteger(value) ? value : parseFloat(value.toFixed(2)),
                type: 'number',
                group: 'HRV',
                confidence: 1.0,
                description: '자동 계산됨',
                boundingBox: [0, 0, 0, 0]
            });
        }
    };

    // 1. LF / HF Ratio Calculation
    const lf = getNum('LF');
    const hf = getNum('HF');
    if (lf > 0 && hf > 0) {
        updateField('LF/HF', lf / hf);
    }

    // 2. TP Calculation fallback
    const vlf = getNum('VLF');
    const tp = getNum('TP');
    if (tp === 0 && lf > 0 && hf > 0) {
        updateField('TP', vlf + lf + hf);
    }

    // 3. SNS / PNS Percentage Complement Calculation
    const sns = getNum('SNS');
    const pns = getNum('PNS');
    if (sns > 0 && sns <= 100 && pns === 0) {
        updateField('PNS', 100 - sns);
    } else if (pns > 0 && pns <= 100 && sns === 0) {
        updateField('SNS', 100 - pns);
    }

    return updated;
};
