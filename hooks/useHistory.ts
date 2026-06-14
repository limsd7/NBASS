import { useState, useEffect, useCallback } from 'react';
import { AssessmentResult } from '../types';
import DatabaseService, { HistoryRecord } from '../services/database';

export type { HistoryRecord };

export function useHistory() {
    const [history, setHistory] = useState<HistoryRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load History on Mount + Migration from localStorage
    useEffect(() => {
        const initializeDatabase = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // localStorage에서 마이그레이션 시도
                const migrated = await DatabaseService.migrateFromLocalStorage();
                if (migrated) {
                    console.log('✅ Successfully migrated data from localStorage to IndexedDB');
                }

                // IndexedDB에서 히스토리 로드
                const records = await DatabaseService.getAllHistory();
                setHistory(records);
            } catch (e) {
                console.error('Failed to initialize database:', e);
                setError('데이터베이스 초기화 실패');

                // Fallback: localStorage에서 직접 로드
                try {
                    const saved = localStorage.getItem('sn1_history');
                    if (saved) {
                        const parsed = JSON.parse(saved);
                        if (Array.isArray(parsed)) {
                            setHistory(parsed);
                        }
                    }
                } catch (fallbackError) {
                    console.error('Fallback also failed:', fallbackError);
                }
            } finally {
                setIsLoading(false);
            }
        };

        initializeDatabase();
    }, []);

    const addToHistory = useCallback(async (result: AssessmentResult) => {
        try {
            const id = await DatabaseService.addHistory(result);

            if (id) {
                // 새 레코드 추가 후 히스토리 다시 로드
                const updated = await DatabaseService.getAllHistory();
                setHistory(updated);

                // localStorage에도 백업 (호환성 유지)
                localStorage.setItem('sn1_history', JSON.stringify(updated.slice(0, 50)));
            }
        } catch (e) {
            console.error('Failed to add to history:', e);
            setError('히스토리 저장 실패');

            // Fallback: localStorage에 저장
            setHistory(prev => {
                const newEntry: HistoryRecord = {
                    ...result,
                    date: new Date().toISOString()
                };
                const updated = [newEntry, ...prev].slice(0, 50);
                localStorage.setItem('sn1_history', JSON.stringify(updated));
                return updated;
            });
        }
    }, []);

    const deleteFromHistory = useCallback(async (id: number) => {
        try {
            await DatabaseService.deleteHistory(id);
            const updated = await DatabaseService.getAllHistory();
            setHistory(updated);
            localStorage.setItem('sn1_history', JSON.stringify(updated.slice(0, 50)));
        } catch (e) {
            console.error('Failed to delete from history:', e);
            setError('히스토리 삭제 실패');
        }
    }, []);

    const clearHistory = useCallback(async () => {
        try {
            await DatabaseService.clearAllHistory();
            setHistory([]);
            localStorage.removeItem('sn1_history');
        } catch (e) {
            console.error('Failed to clear history:', e);
            setError('히스토리 초기화 실패');
        }
    }, []);

    const importData = useCallback(async (data: HistoryRecord[], merge: boolean) => {
        try {
            await DatabaseService.importHistory(data, merge);
            const updated = await DatabaseService.getAllHistory();
            setHistory(updated);
            localStorage.setItem('sn1_history', JSON.stringify(updated.slice(0, 50)));
        } catch (e) {
            console.error('Failed to import data:', e);
            setError('데이터 가져오기 실패');

            // Fallback: 기존 방식으로 처리
            if (merge) {
                const existingDates = new Set(history.map(h => h.date));
                const newData = data.filter(d => !existingDates.has(d.date));
                const merged = [...history, ...newData].sort((a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                ).slice(0, 50);
                setHistory(merged);
                localStorage.setItem('sn1_history', JSON.stringify(merged));
            } else {
                setHistory(data);
                localStorage.setItem('sn1_history', JSON.stringify(data));
            }
        }
    }, [history]);

    const exportJSON = useCallback(() => {
        const jsonStr = JSON.stringify(history, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `mind-body-history-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [history]);

    const exportCSV = useCallback(() => {
        if (history.length === 0) {
            alert('내보낼 데이터가 없습니다.');
            return;
        }

        const headers = ['날짜', '이름', '나이', '성별', '진단 유형', '점수', 'BAI', 'ISI', '집중력', 'Brain Score', 'SNS', 'PNS', '피로도', '활력도'];
        const rows = history.map(record => [
            new Date(record.date).toLocaleString('ko-KR'),
            record.student.name,
            record.student.age,
            record.student.gender === 'Male' ? '남성' : '여성',
            record.careType,
            record.score,
            record.survey.bai,
            record.survey.isi,
            record.survey.concentrationScore,
            record.hrv.brainScore,
            record.hrv.sns,
            record.hrv.pns,
            record.hrv.fatigue,
            record.hrv.vitality
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `mind-body-history-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [history]);

    const getStats = useCallback(async () => {
        try {
            return await DatabaseService.getStats();
        } catch (e) {
            console.error('Failed to get stats:', e);
            return {
                historyCount: history.length,
                studentsCount: 0,
                oldestRecord: history.length > 0 ? history[history.length - 1].date : null,
                newestRecord: history.length > 0 ? history[0].date : null
            };
        }
    }, [history]);

    return {
        history,
        isLoading,
        error,
        addToHistory,
        deleteFromHistory,
        clearHistory,
        importData,
        exportJSON,
        exportCSV,
        getStats
    };
}
