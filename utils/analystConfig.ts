/**
 * Analyst Configuration Management
 * Handles multiple analyst/doctor profiles with active analyst selection
 */

export interface AnalystConfig {
    id: string; // Unique ID for each analyst
    analystId: string; // Display ID (e.g., "DR001")
    analystName: string;
    analystTitle: string;
    analystDisplayText: string;
    signatureImage?: string; // Base64 data URL or path to image
}

export interface AnalystsStorage {
    analysts: AnalystConfig[];
    activeAnalystId: string; // ID of currently active analyst
}

const STORAGE_KEY = 'nbass_analysts_storage';
const OLD_STORAGE_KEY = 'nbass_analyst_config'; // For migration

const DEFAULT_ANALYST: AnalystConfig = {
    id: 'default-analyst-1',
    analystId: 'DR001',
    analystName: 'Dr. Lim',
    analystTitle: '분석 책임자',
    analystDisplayText: 'Dr. Lim',
    signatureImage: '/default_stamp.png'
};

const DEFAULT_STORAGE: AnalystsStorage = {
    analysts: [DEFAULT_ANALYST],
    activeAnalystId: DEFAULT_ANALYST.id
};

/**
 * Generate unique ID for new analyst
 */
const generateAnalystId = (): string => {
    return `analyst-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Migrate old single-analyst data to new multi-analyst format
 */
const migrateOldData = (): AnalystsStorage | null => {
    try {
        const oldData = localStorage.getItem(OLD_STORAGE_KEY);
        if (oldData) {
            const parsed = JSON.parse(oldData);
            const migratedAnalyst: AnalystConfig = {
                id: generateAnalystId(),
                ...parsed
            };

            // Remove old data
            localStorage.removeItem(OLD_STORAGE_KEY);

            return {
                analysts: [migratedAnalyst],
                activeAnalystId: migratedAnalyst.id
            };
        }
    } catch (error) {
        console.error('Failed to migrate old analyst data:', error);
    }
    return null;
};

/**
 * Load analysts storage from localStorage
 */
export const loadAnalystsStorage = (): AnalystsStorage => {
    try {
        // Try migration first
        const migrated = migrateOldData();
        if (migrated) {
            saveAnalystsStorage(migrated);
            return migrated;
        }

        // Load new format
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Validate structure
            if (parsed.analysts && Array.isArray(parsed.analysts) && parsed.activeAnalystId) {
                return parsed;
            }
        }
    } catch (error) {
        console.error('Failed to load analysts storage:', error);
    }
    return DEFAULT_STORAGE;
};

/**
 * Save analysts storage to localStorage
 */
export const saveAnalystsStorage = (storage: AnalystsStorage): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
    } catch (error) {
        console.error('Failed to save analysts storage:', error);
    }
};

/**
 * Get active analyst
 */
export const getActiveAnalyst = (storage: AnalystsStorage): AnalystConfig => {
    const active = storage.analysts.find(a => a.id === storage.activeAnalystId);
    return active || storage.analysts[0] || DEFAULT_ANALYST;
};

/**
 * Set active analyst
 */
export const setActiveAnalyst = (storage: AnalystsStorage, analystId: string): AnalystsStorage => {
    const analyst = storage.analysts.find(a => a.id === analystId);
    if (!analyst) {
        console.error('Analyst not found:', analystId);
        return storage;
    }

    return {
        ...storage,
        activeAnalystId: analystId
    };
};

/**
 * Add new analyst
 */
export const addAnalyst = (storage: AnalystsStorage, analyst: Omit<AnalystConfig, 'id'>): AnalystsStorage => {
    const newAnalyst: AnalystConfig = {
        ...analyst,
        id: generateAnalystId()
    };

    return {
        ...storage,
        analysts: [...storage.analysts, newAnalyst]
    };
};

/**
 * Update existing analyst
 */
export const updateAnalyst = (storage: AnalystsStorage, analystId: string, updates: Partial<Omit<AnalystConfig, 'id'>>): AnalystsStorage => {
    const analysts = storage.analysts.map(a =>
        a.id === analystId ? { ...a, ...updates } : a
    );

    return {
        ...storage,
        analysts
    };
};

/**
 * Delete analyst
 */
export const deleteAnalyst = (storage: AnalystsStorage, analystId: string): AnalystsStorage => {
    // Prevent deleting the last analyst
    if (storage.analysts.length <= 1) {
        console.error('Cannot delete the last analyst');
        return storage;
    }

    const analysts = storage.analysts.filter(a => a.id !== analystId);

    // If deleting active analyst, set first one as active
    const activeAnalystId = storage.activeAnalystId === analystId
        ? analysts[0].id
        : storage.activeAnalystId;

    return {
        analysts,
        activeAnalystId
    };
};

/**
 * Reset to default storage
 */
export const resetAnalystsStorage = (): AnalystsStorage => {
    saveAnalystsStorage(DEFAULT_STORAGE);
    return DEFAULT_STORAGE;
};

/**
 * Convert uploaded image file to Base64 data URL
 */
export const imageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('Failed to read file as data URL'));
            }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
};

/**
 * Get display text for analyst (for use in reports)
 */
export const getAnalystDisplayText = (analyst: AnalystConfig): string => {
    return analyst.analystDisplayText || `${analyst.analystTitle} ${analyst.analystName}`;
};

/**
 * Get signature image URL (falls back to default if not set)
 */
export const getSignatureImage = (analyst: AnalystConfig): string => {
    return analyst.signatureImage || DEFAULT_ANALYST.signatureImage || '';
};
