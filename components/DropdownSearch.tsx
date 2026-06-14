import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

interface StudentData {
    id: string;
    name: string;
    assessmentCount?: number;
    lastAssessmentDate?: string;
}

interface DropdownSearchProps {
    uniqueStudents: StudentData[];
    selectedStudentId?: string | null;
    onSelectStudent?: (id: string | null) => void;
    historyData?: { student: { id: string; name: string }; date: string }[];
}

type SortOption = 'name' | 'recent' | 'count';

export const DropdownSearch: React.FC<DropdownSearchProps> = ({
    uniqueStudents,
    selectedStudentId,
    onSelectStudent,
    historyData = []
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [sortOption, setSortOption] = useState<SortOption>('name');
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Enrich students with assessment counts and last date
    const enrichedStudents = useMemo(() => {
        return uniqueStudents.map(student => {
            const studentHistory = historyData.filter(h => h.student.id === student.id);
            const sortedHistory = [...studentHistory].sort((a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            return {
                ...student,
                assessmentCount: studentHistory.length,
                lastAssessmentDate: sortedHistory[0]?.date || null
            };
        });
    }, [uniqueStudents, historyData]);

    // Sync search term with selected ID
    useEffect(() => {
        if (selectedStudentId) {
            const student = enrichedStudents.find(s => s.id === selectedStudentId);
            if (student) setSearchTerm(student.name);
        } else {
            setSearchTerm('');
        }
    }, [selectedStudentId, enrichedStudents]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
                setHighlightedIndex(-1);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter and sort students
    const filteredStudents = useMemo(() => {
        let result = enrichedStudents.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.id.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Sort based on selected option
        switch (sortOption) {
            case 'name':
                result.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
                break;
            case 'recent':
                result.sort((a, b) => {
                    if (!a.lastAssessmentDate && !b.lastAssessmentDate) return 0;
                    if (!a.lastAssessmentDate) return 1;
                    if (!b.lastAssessmentDate) return -1;
                    return new Date(b.lastAssessmentDate).getTime() - new Date(a.lastAssessmentDate).getTime();
                });
                break;
            case 'count':
                result.sort((a, b) => (b.assessmentCount || 0) - (a.assessmentCount || 0));
                break;
        }

        return result;
    }, [enrichedStudents, searchTerm, sortOption]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!isDropdownOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                setIsDropdownOpen(true);
                setHighlightedIndex(0);
                e.preventDefault();
            }
            return;
        }

        const totalItems = filteredStudents.length + 1; // +1 for "전체 보기"

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => (prev + 1) % totalItems);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => (prev - 1 + totalItems) % totalItems);
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex === 0) {
                    // "전체 보기" selected
                    handleSelectAll();
                } else if (highlightedIndex > 0) {
                    const selectedStudent = filteredStudents[highlightedIndex - 1];
                    if (selectedStudent) {
                        handleSelectStudent(selectedStudent);
                    }
                }
                break;
            case 'Escape':
                setIsDropdownOpen(false);
                setHighlightedIndex(-1);
                inputRef.current?.blur();
                break;
        }
    }, [isDropdownOpen, filteredStudents, highlightedIndex]);

    // Scroll highlighted item into view
    useEffect(() => {
        if (highlightedIndex >= 0 && listRef.current) {
            const items = listRef.current.querySelectorAll('[data-dropdown-item]');
            if (items[highlightedIndex]) {
                items[highlightedIndex].scrollIntoView({ block: 'nearest' });
            }
        }
    }, [highlightedIndex]);

    const handleSelectAll = () => {
        onSelectStudent?.(null);
        setSearchTerm('');
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
    };

    const handleSelectStudent = (student: StudentData) => {
        onSelectStudent?.(student.id);
        setSearchTerm(student.name);
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
    };

    const handleClear = () => {
        setSearchTerm('');
        onSelectStudent?.(null);
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.focus();
    };

    // Get selected student info
    const selectedStudent = selectedStudentId
        ? enrichedStudents.find(s => s.id === selectedStudentId)
        : null;

    return (
        <div className="relative" ref={searchRef}>
            {/* Search Input */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                <span className="pl-2 text-slate-400 text-lg">🔍</span>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="학생 검색 (이름 또는 ID)..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsDropdownOpen(true);
                        setHighlightedIndex(0);
                        if (e.target.value === '') {
                            onSelectStudent?.(null);
                        }
                    }}
                    onFocus={() => {
                        setIsDropdownOpen(true);
                        setHighlightedIndex(-1);
                    }}
                    onKeyDown={handleKeyDown}
                    className="bg-transparent border-none outline-none text-sm p-2 w-56 text-slate-900 dark:text-white placeholder:text-slate-400"
                />
                {searchTerm && (
                    <button
                        onClick={handleClear}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="검색 초기화"
                    >
                        ✕
                    </button>
                )}
                {/* Student count badge */}
                <div className="pr-2 text-xs text-slate-400 font-medium whitespace-nowrap">
                    {enrichedStudents.length}명
                </div>
            </div>

            {/* Selected Student Info */}
            {selectedStudent && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg font-medium">
                        {selectedStudent.name}
                    </span>
                    <span>검사 {selectedStudent.assessmentCount || 0}회</span>
                    {selectedStudent.lastAssessmentDate && (
                        <span>| 마지막: {new Date(selectedStudent.lastAssessmentDate).toLocaleDateString('ko-KR')}</span>
                    )}
                </div>
            )}

            {/* Dropdown */}
            {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-full min-w-[320px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Sort Options */}
                    <div className="p-2 border-b border-slate-100 dark:border-slate-700 flex items-center gap-1 bg-slate-50 dark:bg-slate-900/50">
                        <span className="text-xs text-slate-400 px-2">정렬:</span>
                        {[
                            { key: 'name', label: '이름순', icon: '📝' },
                            { key: 'recent', label: '최근순', icon: '🕐' },
                            { key: 'count', label: '검사횟수', icon: '📊' }
                        ].map(option => (
                            <button
                                key={option.key}
                                onClick={() => setSortOption(option.key as SortOption)}
                                className={`px-2 py-1 text-xs rounded-lg transition-colors ${sortOption === option.key
                                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold'
                                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {option.icon} {option.label}
                            </button>
                        ))}
                    </div>

                    {/* List */}
                    <div ref={listRef} className="max-h-80 overflow-y-auto">
                        {/* "전체 보기" option */}
                        <button
                            data-dropdown-item
                            onClick={handleSelectAll}
                            className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors flex items-center gap-3 ${highlightedIndex === 0
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700'
                                } border-b border-slate-100 dark:border-slate-700`}
                        >
                            <span className="w-8 h-8 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center text-lg">
                                👥
                            </span>
                            <div>
                                <div>전체 보기</div>
                                <div className="text-xs font-normal text-slate-400">
                                    총 {enrichedStudents.length}명의 학생 기록
                                </div>
                            </div>
                        </button>

                        {/* Student list */}
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student, index) => (
                                <button
                                    key={student.id}
                                    data-dropdown-item
                                    onClick={() => handleSelectStudent(student)}
                                    className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-3 ${highlightedIndex === index + 1
                                            ? 'bg-blue-50 dark:bg-blue-900/30'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                                        } ${selectedStudentId === student.id
                                            ? 'border-l-4 border-l-blue-500'
                                            : ''
                                        }`}
                                >
                                    {/* Avatar */}
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                        {student.name.charAt(0)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900 dark:text-white truncate">
                                                {student.name}
                                            </span>
                                            {selectedStudentId === student.id && (
                                                <span className="text-blue-500 text-xs">✓</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-400 truncate">
                                            ID: {student.id.substring(0, 12)}...
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="text-right flex-shrink-0">
                                        <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                            {student.assessmentCount || 0}회
                                        </div>
                                        {student.lastAssessmentDate && (
                                            <div className="text-[10px] text-slate-400">
                                                {new Date(student.lastAssessmentDate).toLocaleDateString('ko-KR', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-6 text-center">
                                <div className="text-4xl mb-2">🔍</div>
                                <p className="text-sm text-slate-400">
                                    "{searchTerm}"에 해당하는 학생이 없습니다.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer with keyboard hints */}
                    <div className="p-2 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <div className="flex items-center gap-3">
                                <span><kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-[10px]">↑↓</kbd> 이동</span>
                                <span><kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-[10px]">Enter</kbd> 선택</span>
                                <span><kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-[10px]">Esc</kbd> 닫기</span>
                            </div>
                            <span>검색결과 {filteredStudents.length}명</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
