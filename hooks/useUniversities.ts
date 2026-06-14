import { useState, useEffect } from 'react';
import { UNIVERSITIES as DEFAULT_UNIVERSITIES, University } from '../data/universities';

const CACHE_KEY = 'custom_universities_db';

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
            // Simulate network delay for fetching remote config
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // In a real scenario, we would fetch from a CDN or JSON hosting service
            // const response = await fetch('https://cdn.example.com/data/universities.json');
            // const data = await response.json();
            
            // For now, we simulate receiving updated data (we just use the default + a mocked update flag)
            // Just to show the UI change, let's pretend we successfully fetched the latest DB
            const updatedData = [...DEFAULT_UNIVERSITIES]; 
            // We could modify one entry to prove it's updated, but keeping it safe is better.

            localStorage.setItem(CACHE_KEY, JSON.stringify(updatedData));
            
            const now = new Date().toLocaleString();
            localStorage.setItem(CACHE_KEY + '_timestamp', now);
            
            setUniversities(updatedData);
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
