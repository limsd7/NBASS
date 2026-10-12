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
import { findExistingStudentId, mintLoginStudentId } from '../utils/studentIdentity';

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
    name?: string | null,
): Promise<{ profile: Partial<StudentInfo>; isYearChanged: boolean } | null> => {
    try {
        let savedProfile: Partial<StudentInfo> | null = null;
        const cleanEmail = email?.trim().toLowerCase();
        const cleanName = name?.trim().toLowerCase();

        if (cleanEmail || cleanName) {
            // 1. 이메일 또는 이름 기반 프로필 키 조회
            const candidateKeys = [
                cleanEmail ? `nbass_student_profile_${cleanEmail}` : null,
                cleanName ? `nbass_student_profile_${cleanName}` : null,
                email?.trim() ? `nbass_student_profile_${email.trim()}` : null,
                name?.trim() ? `nbass_student_profile_${name.trim()}` : null,
            ].filter(Boolean) as string[];

            for (const k of candidateKeys) {
                const raw = localStorage.getItem(k);
                if (raw) {
                    try {
                        const parsed = JSON.parse(raw);
                        if (parsed && typeof parsed === 'object') {
                            savedProfile = parsed;
                            break;
                        }
                    } catch { /* ignore */ }
                }
            }

            // 2. 현재 로그인 사용자(nbass_user)가 동일한 경우
            if (!savedProfile) {
                const rawUser = localStorage.getItem('nbass_user');
                if (rawUser) {
                    try {
                        const u = JSON.parse(rawUser);
                        if (u && (
                            (cleanEmail && u.email?.toLowerCase() === cleanEmail) ||
                            (cleanName && u.name?.toLowerCase() === cleanName) ||
                            (cleanName && u.id?.toLowerCase() === cleanName)
                        )) {
                            savedProfile = u;
                        }
                    } catch { /* ignore */ }
                }
            }

            // 3. nbass_student_profile 또는 nbass_last_student_profile 확인
            if (!savedProfile) {
                for (const sk of ['nbass_student_profile', 'nbass_last_student_profile']) {
                    const rawS = localStorage.getItem(sk);
                    if (rawS) {
                        try {
                            const s = JSON.parse(rawS);
                            if (s && (
                                (cleanEmail && s.email?.toLowerCase() === cleanEmail) ||
                                (cleanName && s.name?.toLowerCase() === cleanName) ||
                                (cleanName && s.id?.toLowerCase() === cleanName)
                            )) {
                                savedProfile = s;
                                break;
                            }
                        } catch { /* ignore */ }
                    }
                }
            }

            // 4. 해당 사용자 고유의 DB 히스토리 조회
            if (!savedProfile) {
                try {
                    const searchId = cleanEmail || cleanName || '';
                    const userHistory = await DatabaseService.getHistoryByStudent(searchId);
                    if (userHistory && userHistory.length > 0 && userHistory[0].student) {
                        savedProfile = userHistory[0].student;
                    }
                } catch { /* ignore */ }
            }

            // 5. 신규 계정일 경우: 기존 ID 재사용 > 로그인 ID(이메일) > Serial 순으로 확정
            if (!savedProfile) {
                const defaultName = name?.trim() || cleanName || (cleanEmail ? cleanEmail.split('@')[0] : '');
                const reusedId = await findExistingStudentId({ name: defaultName, email: cleanEmail });
                const defaultId = reusedId || mintLoginStudentId(cleanEmail);
                const effectiveTier = UserTierService.getEffectiveTier(
                    { id: defaultId, name: defaultName, email: cleanEmail },
                    'free'
                );
                return {
                    profile: {
                        ...freshStudent(),
                        id: defaultId,
                        name: defaultName,
                        // 입력값 없음: 기본값 주입 금지 (빈 값 유지)
                        grade: '',
                        birthDate: '',
                        age: 0,
                        height: undefined,
                        weight: undefined,
                        bmi: undefined,
                        mbti: undefined,
                        activityLevel: undefined,
                        membershipTier: effectiveTier,
                        testDate: getTodayStr(),
                    },
                    isYearChanged: false,
                };
            }
        } else {
            // 로그인 정보 없는 익명 접속: 마지막 작업 프로필을 끌어오지 않는다.
            return null;
        }

        if (savedProfile && (savedProfile.name || cleanName || cleanEmail)) {
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
                : (savedProfile.age || 0);
            // 학년: 저장값 우선, 생년월일이 있으면 추정, 둘 다 없으면 빈 값 (기본값 주입 금지)
            const rawGrade =
                savedProfile.grade ||
                (savedProfile.birthDate
                    ? estimateGradeByAgeOrBirthDate(savedProfile.birthDate)
                    : '');
            const estimatedGrade = rawGrade ? normalizeGrade(rawGrade) : '';
            const studentId =
                savedProfile.id ||
                (await findExistingStudentId({
                    name: savedProfile.name || cleanName,
                    email: cleanEmail || savedProfile.email,
                    birthDate: savedProfile.birthDate,
                })) ||
                (savedProfile.name === '연습001' ? 'ID-20260820-6RKR' : mintLoginStudentId(cleanEmail || savedProfile.email));
            const studentName = savedProfile.name || name?.trim() || cleanName || (cleanEmail ? cleanEmail.split('@')[0] : '');
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
            const resolved = await resolveStudentProfile(email, overrideName);
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
                const stableId = await findExistingStudentId({ name: effectiveName, email }) || mintLoginStudentId(email);
                setStudent((prev) => ({
                    ...prev,
                    id: stableId,
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
