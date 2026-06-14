
import { DatabaseService } from './database';
import { StudyEfficiencyResults } from './studyEfficiencyService';

/**
 * Service to handle persistence of Study Efficiency Assessment Results.
 * Separated to avoid cluttering App.tsx or Context files with direct DB logic.
 */
export const StudyEfficiencyPersistenceService = {
    /**
     * Save the current state of study efficiency results to the database.
     * This is intended to be called whenever the assessment is completed or updated.
     */
    async saveResults(studentId: string, results: StudyEfficiencyResults) {
        if (!studentId) {
            console.warn('[StudyEfficiencyPersistence] No student ID provided, skipping save.');
            return;
        }

        if (!results || Object.keys(results).length === 0) {
            console.warn('[StudyEfficiencyPersistence] No results provided, skipping save.');
            return;
        }

        try {
            console.log(`[StudyEfficiencyPersistence] Saving results for student ${studentId}...`);
            await DatabaseService.addStudyEfficiencyResult({
                studentId,
                date: new Date().toISOString(),
                results,
                createdAt: new Date().toISOString()
            });
            console.log('[StudyEfficiencyPersistence] Results saved successfully.');
        } catch (error) {
            console.error('[StudyEfficiencyPersistence] Failed to save results:', error);
        }
    },

    /**
     * Load the most recent study efficiency results for a student.
     */
    async loadResults(studentId: string): Promise<StudyEfficiencyResults | null> {
        if (!studentId) return null;

        try {
            const record = await DatabaseService.getStudyEfficiencyResult(studentId);
            if (record) {
                console.log(`[StudyEfficiencyPersistence] Loaded results for student ${studentId} from ${record.date}`);
                return record.results;
            }
            return null;
        } catch (error) {
            console.error('[StudyEfficiencyPersistence] Failed to load results:', error);
            return null;
        }
    }
};
