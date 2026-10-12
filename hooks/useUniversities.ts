import { useState, useEffect } from 'react';
import { UNIVERSITIES as DEFAULT_UNIVERSITIES, University } from '../data/universities';

const CACHE_KEY = 'custom_universities_db';

// 원격 갱신 서버가 없으므로 로컬 탑재본만 사용한다 (가짜 성공 금지).
// 원격 JSON이 생기면 이 상수에 URL을 넣어 자동 갱신이 동작한다.
export const UNIVERSITY_DB_REMOTE_URL: string | null = null;

export const useUniversities = () => {
    const [universities, setUniversities] = useState<University[]>(DEFAULT_UNIVERSITIES);
    const [isUpdating, setIsUpdating] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    useEffect(() => {
        // Load from local storage if available
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setUniversities(parsed);
                }
            } catch (e) {
                console.error("Failed to parse cached universities", e);
            }
        }
        
        const timestamp = localStorage.getItem(CACHE_KEY + '_timestamp');
        if (timestamp) {
            setLastUpdated(timestamp);
        }
    }, []);

    const updateUniversities = async () => {
        setIsUpdating(true);
        try {
            // 원격 갱신 서버 미연결 시 거짓 성공을 내지 않고 false를 반환한다
            if (!UNIVERSITY_DB_REMOTE_URL) {
                return false;
            }
            const response = await fetch(UNIVERSITY_DB_REMOTE_URL);
            if (!response.ok) {
                return false;
            }
            const data = await response.json();
            if (!Array.isArray(data) || data.length === 0) {
                return false;
            }

            localStorage.setItem(CACHE_KEY, JSON.stringify(data));

            const now = new Date().toLocaleString();
            localStorage.setItem(CACHE_KEY + '_timestamp', now);

            setUniversities(data);
            setLastUpdated(now);

            return true;
        } catch (error) {
            console.error("Error updating universities:", error);
            return false;
        } finally {
            setIsUpdating(false);
        }
    };

    return {
        universities,
        isUpdating,
        lastUpdated,
        updateUniversities
    };
};
