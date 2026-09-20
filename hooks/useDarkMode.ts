import { useState, useEffect, useCallback } from 'react';

export function useDarkMode() {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        if (saved !== null) return saved === 'true';
        return false; // Default to bright/light mode
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', isDarkMode.toString());
    }, [isDarkMode]);

    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prev => !prev);
    }, []);

    return { isDarkMode, setIsDarkMode, toggleDarkMode };
}
