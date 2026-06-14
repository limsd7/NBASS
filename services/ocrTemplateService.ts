import { ExtractedField } from './ocrEngine';
import { recognizeRegion } from './ocrEngine';
import DatabaseService from './database';

const STORAGE_KEY_TEMPLATE = 'sn1_ocr_coord_template';

export const saveTemplate = async (fields: ExtractedField[]) => {
    const template: Record<string, number[]> = {};
    fields.forEach(f => {
        if (f.boundingBox && f.boundingBox.length === 4 && f.boundingBox[2] > 0) {
            template[f.key] = f.boundingBox;
        }
    });
    await DatabaseService.setSetting(STORAGE_KEY_TEMPLATE, JSON.stringify(template));
    return Object.keys(template).length;
};

export const applyTemplateToFields = async (
    currentFields: ExtractedField[],
    previewUrls: string[]
): Promise<ExtractedField[]> => {
    let savedTemplate = await DatabaseService.getSetting(STORAGE_KEY_TEMPLATE);
    
    // Fallback migration from localStorage if exists
    if (!savedTemplate) {
        savedTemplate = localStorage.getItem(STORAGE_KEY_TEMPLATE);
        if (savedTemplate) {
            await DatabaseService.setSetting(STORAGE_KEY_TEMPLATE, savedTemplate);
        }
    }
    
    if (!savedTemplate) return currentFields;

    const template: Record<string, number[]> = JSON.parse(savedTemplate);
    const updatedFields = [...currentFields];
    let processedCount = 0;

    for (let i = 0; i < updatedFields.length; i++) {
        const field = updatedFields[i];
        if (template[field.key]) {
            const box = template[field.key];
            if (box.length === 4) {
                try {
                    let pageIndex = 0;
                    if (field.group === 'EEG') pageIndex = 1;
                    if (!previewUrls[pageIndex]) pageIndex = 0; // Fallback

                    if (previewUrls[pageIndex]) {
                        const text = await recognizeRegion(previewUrls[pageIndex], box);
                        updatedFields[i] = {
                            ...field,
                            value: text || field.value, // Keep old if OCR fails completely, but empty string is possible
                            boundingBox: box,
                            confidence: 1.0,
                            description: "템플릿 기반 자동 추출됨"
                        };
                        processedCount++;
                    }
                } catch (e) {
                    console.error(`Template OCR failed for ${field.key}`, e);
                }
            }
        }
    }
    console.log(`템플릿 자동 적용 완료: ${processedCount}개 항목`);
    return updatedFields;
};
