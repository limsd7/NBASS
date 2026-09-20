import { useState, useCallback, useEffect } from 'react';
import { StudentInfo } from '../types';
import { DatabaseService } from '../services/database';
import { UserTierService } from '../services/userTierService';
import { safeStorage } from '../utils/safeStorage';
import {
    generateSerialID,
    getTodayStr,
    calculateAge,
    estimateGradeByAgeOrBirthDate,
    normalizeGrade,
    initialStudent as defaultStudent,
} from '../utils/constants';

const freshStudent = (): StudentInfo => ({
    ...defaultStudent,
    id: generateSerialID(),
    testDate: getTodayStr(),
    grade: '고등 3학년',
});

export const createFreshStudent = (): StudentInfo => freshStudent();

export const persistStudentProfile = (studentData: StudentInfo, email?: string | null) => {
    try {
        const profileToSave = { ...studentData };
        const cleanEmail = email?.trim().toLowerCase();
        if (cleanEmail) {
            safeStorage.saveJSON(`nbass_student_profile_${cleanEmail}`, profileToSave);
        }
        if (studentData.name?.trim()) {
            safeStorage.saveJSON(`nbass_student_profile_${studentData.name.trim()}`, profileToSave);
        }
        safeStorage.saveJSON('nbass_last_student_profile', profileToSave);
        DatabaseService.updateStudent(studentData).catch((e) => console.warn('DB updateStudent error:', e));
    } catch (err) {
        console.error('Failed to save student profile:', err);
    }
};

export const resolveStudentProfile = async (
    email?: string | null,
): Promise<{ profile: Partial<StudentInfo>; isYearChanged: boolean } | null> => {
    try {
        let savedProfile: Partial<StudentInfo> | null = null;
        const cleanEmail = email?.trim().toLowerCase();

        if (cleanEmail) {
            // 1. 이메일/아이디 전용 로컬 프로필 조회
            const emailSaved =
                localStorage.getItem(`nbass_student_profile_${cleanEmail}`) ||
                (cleanEmail !== email?.trim() ? localStorage.getItem(`nbass_student_profile_${email?.trim()}`) : null);
            if (emailSaved) {
                try {
                    savedProfile = JSON.parse(emailSaved);
                } catch { /* ignore */ }
            }

            // 2. 현재 로그인 사용자(nbass_user)가 동일한 경우
            if (!savedProfile) {
                const rawUser = localStorage.getItem('nbass_user');
                if (rawUser) {
                    try {
                        const u = JSON.parse(rawUser);
                        if (u && (u.email?.toLowerCase() === cleanEmail || u.name?.toLowerCase() === cleanEmail)) {
                            savedProfile = u;
                        }
                    } catch { /* ignore */ }
                }
            }

            // 3. 해당 사용자 고유의 DB 히스토리 조회
            if (!savedProfile) {
                try {
                    const userHistory = await DatabaseService.getHistoryByStudent(cleanEmail);
                    if (userHistory && userHistory.length > 0 && userHistory[0].student) {
                        savedProfile = userHistory[0].student;
                    }
                } catch { /* ignore */ }
            }

            // 4. 신규 계정일 경우: 타인(연습홍길동 등)의 기록을 절대 상속하지 않고 본인 아이디 기반 프로필 생성
            if (!savedProfile) {
                const defaultName = cleanEmail.split('@')[0];
                const defaultId = generateSerialID();
                const effectiveTier = UserTierService.getEffectiveTier(
                    { id: defaultId, name: defaultName, email: cleanEmail },
                    'free'
                );
                return {
                    profile: {
                        ...freshStudent(),
                        id: defaultId,
                        name: defaultName,
                        membershipTier: effectiveTier,
                        testDate: getTodayStr(),
                    },
                    isYearChanged: false,
                };
            }
        } else {
            // 로그인 정보 없는 익명 접속일 때만 마지막 작업 프로필 참조 (단, DB 타인 기록은 조회하지 않음)
            const generalSaved = localStorage.getItem('nbass_last_student_profile');
            if (generalSaved) {
                try {
                    savedProfile = JSON.parse(generalSaved);
                } catch { /* ignore */ }
            }
        }

        if (savedProfile && savedProfile.name) {
            const currentYear = new Date().getFullYear();
            const savedDateStr =
                savedProfile.testDate ||
                (savedProfile as unknown as Record<string, string>).updatedAt ||
                (savedProfile as unknown as Record<string, string>).createdAt ||
                '';
            const savedYear = savedDateStr ? parseInt(savedDateStr.slice(0, 4), 10) : currentYear;
            const isYearChanged = !isNaN(savedYear) && savedYear > 0 && savedYear < currentYear;
            const calculatedAge = savedProfile.birthDate
                ? calculateAge(savedProfile.birthDate)
                : savedProfile.age || 18;
            const rawGrade =
                savedProfile.grade ||
                (savedProfile.birthDate
                    ? estimateGradeByAgeOrBirthDate(savedProfile.birthDate)
                    : estimateGradeByAgeOrBirthDate(calculatedAge));
            const estimatedGrade = normalizeGrade(rawGrade);
            const studentId =
                savedProfile.id ||
                (savedProfile.name === '연습001' ? 'ID-20260820-6RKR' : generateSerialID());
            const studentName = savedProfile.name || (cleanEmail ? cleanEmail.split('@')[0] : '');
            const effectiveTier = UserTierService.getEffectiveTier(
                { id: studentId, name: studentName, email: cleanEmail || savedProfile.email },
                (savedProfile.membershipTier as any) || 'free'
            );
            return {
                profile: {
                    ...savedProfile,
                    id: studentId,
                    name: studentName,
                    membershipTier: effectiveTier,
                    testDate: getTodayStr(),
                    age: calculatedAge,
                    grade: estimatedGrade,
                },
                isYearChanged,
            };
        }
    } catch (err) {
        console.error('Failed to load saved student profile:', err);
    }
    return null;
};

export const useStudentProfile = (currentUserEmail: string | null) => {
    const [student, setStudent] = useState<StudentInfo>(() => freshStudent());
    const [isProfileLoadedFromPrevious, setIsProfileLoadedFromPrevious] = useState(false);

    const saveStudentProfile = useCallback(
        (studentData: StudentInfo, email?: string | null) => {
            persistStudentProfile(studentData, email ?? currentUserEmail);
        },
        [currentUserEmail],
    );

    const loadStudentProfile = useCallback(async (
        email?: string | null,
        overrideName?: string | null,
        overrideFields?: Partial<StudentInfo> | null
    ) => {
        try {
            const resolved = await resolveStudentProfile(email);
            if (resolved) {
                const effectiveName = overrideName || resolved.profile.name || (email ? email.trim().toLowerCase().split('@')[0] : '');
                setStudent((prev) => ({
                    ...prev,
                    ...resolved.profile,
                    ...(effectiveName ? { name: effectiveName } : {}),
                    ...(overrideFields || {}),
                } as StudentInfo));
                setIsProfileLoadedFromPrevious(resolved.isYearChanged);
                return true;
            } else if (overrideName || email) {
                const effectiveName = overrideName || (email ? email.trim().toLowerCase().split('@')[0] : '');
                setStudent((prev) => ({
                    ...prev,
                    id: generateSerialID(),
                    name: effectiveName,
                    testDate: getTodayStr(),
                    ...(overrideFields || {}),
                }));
                setIsProfileLoadedFromPrevious(false);
                return true;
            }
        } catch (err) {
            console.error('Failed to load saved student profile:', err);
        }
        return false;
    }, []);

    useEffect(() => {
        const savedEmail = localStorage.getItem('nbass_current_email');
        const savedRole = localStorage.getItem('nbass_current_role');
        if (savedRole === 'STUDENT' || !savedRole) {
            loadStudentProfile(savedEmail);
        }
    }, [loadStudentProfile]);

    return {
        student,
        setStudent,
        saveStudentProfile,
        loadStudentProfile,
        isProfileLoadedFromPrevious,
        setIsProfileLoadedFromPrevious,
    };
};
