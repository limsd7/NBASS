/**
 * Safe LocalStorage Utility with automatic QuotaExceededError recovery
 * 
 * Prevents application crashes when localStorage exceeds its ~5MB quota.
 * Automatically cleans up oversized mirror keys (e.g. sn1_history) since IndexedDB
 * serves as the primary persistent storage layer.
 */

export const safeStorage = {
  /**
   * Get an item safely from localStorage
   */
  getItem(key: string): string | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      return window.localStorage.getItem(key);
    } catch (e) {
      console.warn(`[safeStorage] Failed to read key "${key}":`, e);
      return null;
    }
  },

  /**
   * Set an item safely in localStorage.
   * If a QuotaExceededError occurs, it automatically attempts to free up quota
   * by trimming large history mirrors and retrying before gracefully failing.
   */
  setItem(key: string, value: string): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      window.localStorage.setItem(key, value);
      return true;
    } catch (error: any) {
      const isQuotaError =
        error?.name === 'QuotaExceededError' ||
        error?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        error?.code === 22 ||
        error?.code === 1014;

      if (isQuotaError) {
        console.warn(`[safeStorage] Quota exceeded while saving "${key}". Attempting automated cleanup...`);
        this.cleanupQuota(key);

        // Retry saving after cleanup
        try {
          window.localStorage.setItem(key, value);
          console.log(`[safeStorage] Successfully saved "${key}" after quota cleanup.`);
          return true;
        } catch (retryError) {
          console.warn(`[safeStorage] Save failed after cleanup for "${key}". Data safely skipped from localStorage (IndexedDB retains full data).`, retryError);
          return false;
        }
      }

      console.warn(`[safeStorage] Unexpected error setting "${key}":`, error);
      return false;
    }
  },

  /**
   * Remove an item safely
   */
  removeItem(key: string): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[safeStorage] Failed to remove "${key}":`, e);
    }
  },

  /**
   * Parse JSON safely from localStorage with fallback
   */
  getJSON<T>(key: string, fallback: T): T {
    try {
      const item = this.getItem(key);
      if (!item) return fallback;
      return JSON.parse(item) as T;
    } catch (e) {
      console.warn(`[safeStorage] Failed to parse JSON for "${key}":`, e);
      return fallback;
    }
  },

  /**
   * Save JSON safely to localStorage
   */
  saveJSON(key: string, data: any): boolean {
    try {
      return this.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn(`[safeStorage] Failed to stringify JSON for "${key}":`, e);
      return false;
    }
  },

  /**
   * Free up storage quota when limit is reached
   */
  cleanupQuota(targetKeyToKeep?: string): void {
    try {
      // 1. 히스토리 미러는 단일 상수로 절삭 (분산된 3/5/50 문제 해소)
      const { HISTORY_MIRROR_KEY, HISTORY_MIRROR_MAX } = { HISTORY_MIRROR_KEY: 'sn1_history', HISTORY_MIRROR_MAX: 10 };
      if (targetKeyToKeep !== HISTORY_MIRROR_KEY) {
        const rawHistory = window.localStorage.getItem(HISTORY_MIRROR_KEY);
        if (rawHistory) {
          try {
            const parsed = JSON.parse(rawHistory);
            if (Array.isArray(parsed) && parsed.length > HISTORY_MIRROR_MAX) {
              window.localStorage.setItem(HISTORY_MIRROR_KEY, JSON.stringify(parsed.slice(0, HISTORY_MIRROR_MAX)));
            }
          } catch {
            window.localStorage.removeItem(HISTORY_MIRROR_KEY);
          }
        }
      }

      // 2. Remove temporary or non-essential cache keys
      const keysToRemove = [
        'nbass_nback_logs_cache',
        'edugrade_temp',
        'surveyFormData'
      ];
      for (const k of keysToRemove) {
        if (k !== targetKeyToKeep) {
          window.localStorage.removeItem(k);
        }
      }
    } catch (e) {
      console.error('[safeStorage] Cleanup error:', e);
    }
  }
};
