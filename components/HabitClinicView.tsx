import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AssessmentResult, CareType, WrongNote } from '../types';
import { unifiedSyncService } from '../services/unifiedSyncService';
import { MembershipTier, normalizeTier, canAccess } from '../utils/featureGate';
import { Brain, AlertOctagon, Sparkles, CheckCircle2, Play, Pause, Flame, Clock, RotateCcw, ArrowRight, Lock, Check, Printer, X, FileText, ShieldAlert, Award, Download, Wind, Mic, Zap, HeartPulse, Send, BookOpen, CheckSquare, Bell, EyeOff, Moon, Coffee, ShieldCheck, Smartphone } from 'lucide-react';
import {
    BAD_HABITS_LIST,
    HABIT_SCIENCE_SOURCES,
    PROTOCOL_META,
    PATTERN_BY_CARETYPE,
    pipelineMap,
    HABIT_PATTERN_MAP,
} from './habit/habitClinicData';
import type { ClinicalPattern, ProtocolId } from './habit/habitClinicData';
import { useHabitToasts, HabitToastStack } from './habit/HabitToasts';
import { shareHabitToKakao, buildHabitShareText, copyTextToClipboard } from './habit/kakaoShare';

interface HabitClinicViewProps {
    student?: { id?: string; name?: string; grade?: string };
    history?: AssessmentResult[];
    membershipTier?: MembershipTier;
    onUpgradeClick?: () => void;
    onBack?: () => void;
    onSaveWrongNote?: (note: WrongNote) => void;
    isPrivileged?: boolean; // 오너·전문가 등 등급 우회 권한 (App의 currentUserRole 기반)
}


export const HabitClinicView: React.FC<HabitClinicViewProps> = ({
    student,
    history,
    membershipTier = 'free',
    onUpgradeClick,
    onBack,
    onSaveWrongNote,
    isPrivileged = false
}) => {
    const tier = membershipTier || 'free';
    // habit_clinic 접근 판정 단일화 (레거시 등급 정규화 포함)
    const isPremiumOrAbove = canAccess(normalizeTier(tier), 'habit_clinic') || isPrivileged;

    // Habit 진행 상태 영속화 (학생별 localStorage, 새로고침·기기 변경 대비는 계정 동기화와 별도)
    const progressKey = `nbass_habit_progress_${student?.id || student?.name || 'default'}`;
    // 서버 동기화 키 (unifiedSyncService 경유, student_id 단일 행)
    const habitServerId = student?.id || student?.name || '';
    // 필드별 LWW 기준 시각 보관 (pull 병합 결과, push 시 변경분만 at 갱신)
    const habitFieldsRef = useRef<Record<string, { v: unknown; at: string }>>({});
    const [habitPulled, setHabitPulled] = useState(false);
    // 블로킹 alert() 대체용 인라인 토스트
    const { toasts, pushToast, dismissToast } = useHabitToasts();
    // SOS 자동 해제 타이머 (언마운트 시 정리)
    const sosTimeoutRef = useRef<any>(null);
    useEffect(() => () => { if (sosTimeoutRef.current) clearTimeout(sosTimeoutRef.current); }, []);
    const todayStr = new Date().toISOString().slice(0, 10);
    const loadStored = <T,>(k: string, fallback: T): T => {
        try {
            const raw = localStorage.getItem(progressKey);
            if (!raw) return fallback;
            const v = (JSON.parse(raw) as any)?.[k];
            return v === undefined ? fallback : v as T;
        } catch { return fallback; }
    };
    const storedLastActiveDate: string = (() => {
        try {
            return (JSON.parse(localStorage.getItem(progressKey) || '{}') as any)?.lastActiveDate || '';
        } catch { return ''; }
    })();

    // 체크된 습관 목록
    const [checkedIds, setCheckedIds] = useState<string[]>(() => loadStored('checkedIds', []));
    const [showReportModal, setShowReportModal] = useState(false);

    // 실시간 행동 교정기 (PLUS+ 전용) 10대 뇌신경 프로토콜 상태

    const [protocolCategory, setProtocolCategory] = useState<'all' | 'core' | 'boost'>('all');
    const [activeProtocolTab, setActiveProtocolTab] = useState<ProtocolId>('p1');
    const [selectedTargetHabit, setSelectedTargetHabit] = useState<string>('habit-01');
    const [isRoutineRunning, setIsRoutineRunning] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(25 * 60);
    const [successStreak, setSuccessStreak] = useState(() => loadStored('successStreak', 0));
    const [todayCompleted, setTodayCompleted] = useState(
        () => loadStored('todayCompleted', false) && storedLastActiveDate === todayStr
    );

    // [프로토콜 1] 물리 차단 & 점진 힌트
    const [pledgeChecked, setPledgeChecked] = useState(() => loadStored('pledgeChecked', false));
    const [distanceChecked, setDistanceChecked] = useState(() => loadStored('distanceChecked', false));
    const [hintLevel, setHintLevel] = useState<1 | 2 | 3>(1);

    // [프로토콜 2] IF-THEN 조건반사 스위치
    const [ifSituation, setIfSituation] = useState('');
    const [thenReaction, setThenReaction] = useState('');
    const [sosTriggered, setSosTriggered] = useState(false);

    // [프로토콜 3] 60초 마이크로 리콜 & 파인만 인출기
    const [recallInput, setRecallInput] = useState('');
    const [recallScore, setRecallScore] = useState<number | null>(null);
    const [isAnalyzingRecall, setIsAnalyzingRecall] = useState(false);

    // [프로토콜 4] 도파민 연속 스트릭 & 손실 회피 금고
    const [dopamineStreak, setDopamineStreak] = useState(() => loadStored('dopamineStreak', 0));
    const [dopaminePoints, setDopaminePoints] = useState(() => loadStored('dopaminePoints', 0));
    const [isStreakProtected, setIsStreakProtected] = useState(() => loadStored('isStreakProtected', false));
    const [streakFrozen, setStreakFrozen] = useState(() => loadStored('streakFrozen', false));
    const [streakNotice, setStreakNotice] = useState(false);

    // [프로토콜 5] 학부모 실시간 안심 동기화 루프
    const [parentSyncSent, setParentSyncSent] = useState(() => loadStored('parentSyncSent', false));
    const [parentSyncLog, setParentSyncLog] = useState<{ at: string; text: string }[]>(() => loadStored('parentSyncLog', []));
    const [parentNoticeToast, setParentNoticeToast] = useState(false);

    // [프로토콜 6] 3분 생리학적 한숨 & HRV 리셋
    const [isSighRunning, setIsSighRunning] = useState(false);
    const [sighSeconds, setSighSeconds] = useState(180);
    const [sighPhase, setSighPhase] = useState<'inhale1' | 'inhale2' | 'exhale'>('inhale1');
    const [hrvStatus, setHrvStatus] = useState<number>(0); // 타이머 진행률 표시용 (생체 측정값 아님)

    // [프로토콜 7] 3색 뇌신경 오답 분해기
    const [redTrap, setRedTrap] = useState('');
    const [yellowMissing, setYellowMissing] = useState('');
    const [greenAction, setGreenAction] = useState('');
    const [p7Subject, setP7Subject] = useState('공통');
    const [savedErrorCount, setSavedErrorCount] = useState(() => loadStored('savedErrorCount', 0));
    const [errorSavedNotice, setErrorSavedNotice] = useState(false);

    // [프로토콜 8] 시각 터널링 & 모노태스킹 블랙아웃
    const [isBlackoutActive, setIsBlackoutActive] = useState(false);
    const [blackoutDeskChecked, setBlackoutDeskChecked] = useState(() => loadStored('blackoutDeskChecked', false));
    const [blackoutTimer, setBlackoutTimer] = useState(25 * 60);
    const [isBlackoutRunning, setIsBlackoutRunning] = useState(false);
    const [blackoutConcept, setBlackoutConcept] = useState('');

    // [프로토콜 9] 울트라디안 90분 피크-딥 과목 매칭
    const [chronotype, setChronotype] = useState<'LARK' | 'OWL'>(() => loadStored('chronotype', 'LARK'));
    const [isUltradianApplied, setIsUltradianApplied] = useState(() => loadStored('isUltradianApplied', false));

    // [프로토콜 10] 취침 직전 15분 해마 수면 고착
    const [sleepPledgeChecked, setSleepPledgeChecked] = useState(() => loadStored('sleepPledgeChecked', false));
    const [sleepReplayActive, setSleepReplayActive] = useState(false);
    const [replayCardIndex, setReplayCardIndex] = useState(0);
    // p10 리플레이: 저장된 오답노트 최신순 (없으면 일반 가이드 카드)
    const [replayNotes, setReplayNotes] = useState<{ title: string; text: string }[]>([]);
    useEffect(() => {
        try {
            const notes = unifiedSyncService.getWrongNotes<any>([], student?.id) || [];
            const mapped = notes.slice(0, 5).map((n: any) => ({
                title: `[${n.subject || '공통'}] ${n.questionTitle || '오답 복습'}`,
                text: n.metacognitiveNote?.actionRule || n.explanation || '핵심 조건을 다시 확인하고 백지에서 재풀이해보세요.'
            }));
            setReplayNotes(mapped);
            setReplayCardIndex(0);
        } catch { /* 조회 실패 무시 */ }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [student?.id]);

    // Habit 진행 상태 저장 (학생별, 새로고침·재방문 연속성 보장)
    useEffect(() => {
        try {
            const raw = localStorage.getItem(progressKey);
            const prev = raw ? (JSON.parse(raw) as any) : {};
            localStorage.setItem(progressKey, JSON.stringify({
                checkedIds,
                successStreak,
                todayCompleted,
                pledgeChecked,
                distanceChecked,
                dopamineStreak,
                dopaminePoints,
                isStreakProtected,
                parentSyncSent,
                savedErrorCount,
                blackoutDeskChecked,
                chronotype,
                isUltradianApplied,
                sleepPledgeChecked,
                lastActiveDate: todayStr,
                adherenceRecorded: prev?.adherenceRecorded || [],
                parentSyncLog,
                streakFrozen,
                savedAt: new Date().toISOString()
            }));
        } catch { /* 저장 실패 무시 */ }
    }, [progressKey, checkedIds, successStreak, todayCompleted, pledgeChecked, distanceChecked, dopamineStreak, dopaminePoints, isStreakProtected, streakFrozen, parentSyncSent, parentSyncLog, savedErrorCount, blackoutDeskChecked, chronotype, isUltradianApplied, sleepPledgeChecked]);

    // 학생 전환 시 해당 학생의 저장 상태로 재로드
    useEffect(() => {
        try {
            const raw = localStorage.getItem(progressKey);
            const s = raw ? JSON.parse(raw) : {};
            const isToday = (s.lastActiveDate || '') === todayStr;
            if (Array.isArray(s.checkedIds)) setCheckedIds(s.checkedIds);
            if (typeof s.successStreak === 'number') setSuccessStreak(s.successStreak);
            setTodayCompleted(s.todayCompleted === true && isToday);
            if (typeof s.pledgeChecked === 'boolean') setPledgeChecked(s.pledgeChecked);
            if (typeof s.distanceChecked === 'boolean') setDistanceChecked(s.distanceChecked);
            if (typeof s.dopamineStreak === 'number') setDopamineStreak(s.dopamineStreak);
            if (typeof s.dopaminePoints === 'number') setDopaminePoints(s.dopaminePoints);
            if (typeof s.isStreakProtected === 'boolean') setIsStreakProtected(s.isStreakProtected);
            if (typeof s.streakFrozen === 'boolean') setStreakFrozen(s.streakFrozen);
            if (typeof s.parentSyncSent === 'boolean') setParentSyncSent(s.parentSyncSent);
            if (typeof s.savedErrorCount === 'number') setSavedErrorCount(s.savedErrorCount);
            if (typeof s.blackoutDeskChecked === 'boolean') setBlackoutDeskChecked(s.blackoutDeskChecked);
            if (s.chronotype === 'LARK' || s.chronotype === 'OWL') setChronotype(s.chronotype);
            if (Array.isArray(s.parentSyncLog)) setParentSyncLog(s.parentSyncLog.filter((e: any) => e && typeof e.at === 'string').slice(-30));
            if (typeof s.isUltradianApplied === 'boolean') setIsUltradianApplied(s.isUltradianApplied);
            if (typeof s.sleepPledgeChecked === 'boolean') setSleepPledgeChecked(s.sleepPledgeChecked);
        } catch { /* 저장 읽기 실패 무시 */ }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [progressKey]);

    // Habit 서버 동기화 (게이미피케이션 패턴 재사용: 서버 우선·로컬 미러 폴백 + 필드별 LWW)
    // - 진입 시 pull 1회, 변경 시 push (Realtime 제외)
    // - 페이로드는 {값, 시각} 형태, pull 시 필드별 최신 승리
    useEffect(() => {
        let cancelled = false;
        setHabitPulled(false);
        if (!habitServerId) { setHabitPulled(true); return; }
        (async () => {
            try {
                const remote = await unifiedSyncService.getHabitProgress(habitServerId);
                if (cancelled) return;
                let localRaw: any = {};
                try { localRaw = JSON.parse(localStorage.getItem(progressKey) || '{}'); } catch { localRaw = {}; }
                const savedAt = typeof localRaw.savedAt === 'string' ? localRaw.savedAt : new Date(0).toISOString();
                const stamp = (v: unknown): { v: unknown; at: string } => ({ v, at: savedAt });
                const localFields: Record<string, { v: unknown; at: string }> = {
                    checkedIds: stamp(Array.isArray(localRaw.checkedIds) ? localRaw.checkedIds : []),
                    successStreak: stamp(typeof localRaw.successStreak === 'number' ? localRaw.successStreak : 0),
                    todayCompleted: stamp(localRaw.todayCompleted === true),
                    pledgeChecked: stamp(localRaw.pledgeChecked === true),
                    distanceChecked: stamp(localRaw.distanceChecked === true),
                    dopamineStreak: stamp(typeof localRaw.dopamineStreak === 'number' ? localRaw.dopamineStreak : 0),
                    dopaminePoints: stamp(typeof localRaw.dopaminePoints === 'number' ? localRaw.dopaminePoints : 0),
                    isStreakProtected: stamp(localRaw.isStreakProtected === true),
                    streakFrozen: stamp(localRaw.streakFrozen === true),
                    parentSyncSent: stamp(localRaw.parentSyncSent === true),
                    parentSyncLog: stamp(Array.isArray(localRaw.parentSyncLog) ? localRaw.parentSyncLog : []),
                    savedErrorCount: stamp(typeof localRaw.savedErrorCount === 'number' ? localRaw.savedErrorCount : 0),
                    blackoutDeskChecked: stamp(localRaw.blackoutDeskChecked === true),
                    chronotype: stamp(localRaw.chronotype === 'OWL' ? 'OWL' : 'LARK'),
                    isUltradianApplied: stamp(localRaw.isUltradianApplied === true),
                    sleepPledgeChecked: stamp(localRaw.sleepPledgeChecked === true),
                    lastActiveDate: stamp(typeof localRaw.lastActiveDate === 'string' ? localRaw.lastActiveDate : ''),
                    adherenceRecorded: stamp(Array.isArray(localRaw.adherenceRecorded) ? localRaw.adherenceRecorded : []),
                };
                const merged = unifiedSyncService.mergeHabitProgress(localFields, remote || {});
                habitFieldsRef.current = merged;
                const val = <T,>(k: string, fallback: T): T => {
                    const e = merged[k];
                    return (e && 'v' in e && e.v !== undefined ? e.v : fallback) as T;
                };
                const mergedLastActive = val<string>('lastActiveDate', '');
                const isToday = mergedLastActive === todayStr;
                setCheckedIds(val<string[]>('checkedIds', []));
                setSuccessStreak(val<number>('successStreak', 0));
                setTodayCompleted(val<boolean>('todayCompleted', false) && isToday);
                setPledgeChecked(val<boolean>('pledgeChecked', false));
                setDistanceChecked(val<boolean>('distanceChecked', false));
                setDopamineStreak(val<number>('dopamineStreak', 0));
                setDopaminePoints(val<number>('dopaminePoints', 0));
                setIsStreakProtected(val<boolean>('isStreakProtected', false));
                setStreakFrozen(val<boolean>('streakFrozen', false));
                setParentSyncSent(val<boolean>('parentSyncSent', false));
                const logs = val<{ at: string; text: string }[]>('parentSyncLog', []);
                setParentSyncLog(Array.isArray(logs) ? logs.filter(e => e && typeof e.at === 'string').slice(-30) : []);
                setSavedErrorCount(val<number>('savedErrorCount', 0));
                setBlackoutDeskChecked(val<boolean>('blackoutDeskChecked', false));
                const chrono = val<string>('chronotype', 'LARK');
                setChronotype(chrono === 'OWL' ? 'OWL' : 'LARK');
                setIsUltradianApplied(val<boolean>('isUltradianApplied', false));
                setSleepPledgeChecked(val<boolean>('sleepPledgeChecked', false));
                try {
                    const raw = localStorage.getItem(progressKey);
                    const prev = raw ? (JSON.parse(raw) as any) : {};
                    localStorage.setItem(progressKey, JSON.stringify({
                        ...prev,
                        checkedIds: val('checkedIds', prev.checkedIds || []),
                        successStreak: val('successStreak', prev.successStreak || 0),
                        todayCompleted: val('todayCompleted', prev.todayCompleted || false) && isToday,
                        pledgeChecked: val('pledgeChecked', prev.pledgeChecked || false),
                        distanceChecked: val('distanceChecked', prev.distanceChecked || false),
                        dopamineStreak: val('dopamineStreak', prev.dopamineStreak || 0),
                        dopaminePoints: val('dopaminePoints', prev.dopaminePoints || 0),
                        isStreakProtected: val('isStreakProtected', prev.isStreakProtected || false),
                        streakFrozen: val('streakFrozen', prev.streakFrozen || false),
                        parentSyncSent: val('parentSyncSent', prev.parentSyncSent || false),
                        parentSyncLog: val('parentSyncLog', prev.parentSyncLog || []),
                        savedErrorCount: val('savedErrorCount', prev.savedErrorCount || 0),
                        blackoutDeskChecked: val('blackoutDeskChecked', prev.blackoutDeskChecked || false),
                        chronotype: val('chronotype', prev.chronotype || 'LARK'),
                        isUltradianApplied: val('isUltradianApplied', prev.isUltradianApplied || false),
                        sleepPledgeChecked: val('sleepPledgeChecked', prev.sleepPledgeChecked || false),
                        adherenceRecorded: val('adherenceRecorded', prev.adherenceRecorded || []),
                    }));
                } catch { /* 미러 갱신 실패 무시 */ }
            } catch { /* pull 실패 시 로컬 유지 */ }
            if (!cancelled) setHabitPulled(true);
        })();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [progressKey, habitServerId]);

    // Habit 변경 시 push (pull 완료 후, 800ms 디바운스, 변경 필드만 at 갱신)
    useEffect(() => {
        if (!habitPulled || !habitServerId) return;
        const same = (a: unknown, b: unknown): boolean => {
            try { return JSON.stringify(a) === JSON.stringify(b); } catch { return a === b; }
        };
        const timer = setTimeout(() => {
            try {
                const now = new Date().toISOString();
                const prev = habitFieldsRef.current || {};
                const next: Record<string, { v: unknown; at: string }> = {};
                const put = (k: string, v: unknown) => {
                    const old = prev[k];
                    next[k] = (old && 'v' in old && same(old.v, v)) ? old : { v, at: now };
                };
                let rawAdherence: unknown = [];
                try { rawAdherence = (JSON.parse(localStorage.getItem(progressKey) || '{}') as any)?.adherenceRecorded || []; } catch { rawAdherence = []; }
                put('checkedIds', checkedIds);
                put('successStreak', successStreak);
                put('todayCompleted', todayCompleted);
                put('pledgeChecked', pledgeChecked);
                put('distanceChecked', distanceChecked);
                put('dopamineStreak', dopamineStreak);
                put('dopaminePoints', dopaminePoints);
                put('isStreakProtected', isStreakProtected);
                put('streakFrozen', streakFrozen);
                put('parentSyncSent', parentSyncSent);
                put('parentSyncLog', parentSyncLog);
                put('savedErrorCount', savedErrorCount);
                put('blackoutDeskChecked', blackoutDeskChecked);
                put('chronotype', chronotype);
                put('isUltradianApplied', isUltradianApplied);
                put('sleepPledgeChecked', sleepPledgeChecked);
                put('lastActiveDate', todayStr);
                put('adherenceRecorded', rawAdherence);
                let changed = false;
                for (const k of Object.keys(next)) {
                    if (next[k] !== prev[k]) { changed = true; break; }
                }
                if (!changed) return;
                habitFieldsRef.current = next;
                unifiedSyncService.saveHabitProgress(habitServerId, next).catch(() => {});
            } catch { /* push 실패 무시 (로컬 유지) */ }
        }, 800);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [habitPulled, habitServerId, progressKey, checkedIds, successStreak, todayCompleted, pledgeChecked, distanceChecked, dopamineStreak, dopaminePoints, isStreakProtected, streakFrozen, parentSyncSent, parentSyncLog, savedErrorCount, blackoutDeskChecked, chronotype, isUltradianApplied, sleepPledgeChecked]);

    // Habit 실천 → 진단 이행률(completedExpertGuideItems) 기록 (대시보드 %와 연결)
    // - 최신 진단 1건에만 'habit:pN' 태그 추가, 중복 방지 (새로고침·재방문 시 1회만)
    const recordHabitAdherence = (key: string) => {
        try {
            if (!history || history.length === 0) return;
            const sorted = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const latest: any = sorted[0];
            if (!latest) return;
            const items: string[] = Array.isArray(latest.completedExpertGuideItems) ? [...latest.completedExpertGuideItems] : [];
            const tag = `habit:${key}`;
            if (items.includes(tag)) return false;
            items.push(tag);
            unifiedSyncService.updateHistory({ ...latest, completedExpertGuideItems: items }).catch(() => {});
            return true;
        } catch { return false; }
    };

    const habitCompletionKeys = useMemo(() => {
        const keys: string[] = [];
        if (pledgeChecked || distanceChecked) keys.push('p1');
        if (sosTriggered) keys.push('p2');
        if (recallScore !== null) keys.push('p3');
        if (todayCompleted) keys.push('p4');
        if (parentSyncSent) keys.push('p5');
        if (sighSeconds < 180) keys.push('p6');
        if (savedErrorCount > 0) keys.push('p7');
        if (blackoutDeskChecked || isBlackoutActive) keys.push('p8');
        if (isUltradianApplied) keys.push('p9');
        if (sleepPledgeChecked) keys.push('p10');
        return keys;
    }, [pledgeChecked, distanceChecked, sosTriggered, recallScore, todayCompleted, parentSyncSent, sighSeconds, savedErrorCount, blackoutDeskChecked, isBlackoutActive, isUltradianApplied, sleepPledgeChecked]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(progressKey);
            const recorded: string[] = (raw ? (JSON.parse(raw) as any)?.adherenceRecorded : undefined) || [];
            const pending = habitCompletionKeys.filter(k => !recorded.includes(k));
            if (pending.length === 0) return;
            let wrote = false;
            for (const k of pending) {
                if (recordHabitAdherence(k)) {
                    recorded.push(k);
                    wrote = true;
                }
            }
            if (wrote && raw) {
                localStorage.setItem(progressKey, JSON.stringify({ ...(JSON.parse(raw) as any), adherenceRecorded: recorded }));
            }
        } catch { /* 기록 실패 무시 */ }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [habitCompletionKeys]);

    // 10대 프로토콜 가동 개수 및 기대 점수 계산
    const activeProtocolsCount = 
        (pledgeChecked || distanceChecked || isRoutineRunning ? 1 : 0) +
        (ifSituation ? 1 : 0) +
        (recallScore !== null ? 1 : 0) +
        (isStreakProtected ? 1 : 0) +
        (parentSyncSent ? 1 : 0) +
        (isSighRunning || sighSeconds < 180 ? 1 : 0) +
        (savedErrorCount > 0 ? 1 : 0) +
        (isBlackoutActive || blackoutDeskChecked ? 1 : 0) +
        (isUltradianApplied ? 1 : 0) +
        (sleepPledgeChecked ? 1 : 0);

    const boostMap: Record<number, { score: string; hours: string; tierBenefit: string }> = {
        0: { score: '+4~6점 목표', hours: '+1.5시간', tierBenefit: '1개 등급 상승 기반 마련' },
        1: { score: '+6~8점 목표', hours: '+1.8시간', tierBenefit: '가짜 공부 줄이기, 1개 등급 상승 기대' },
        2: { score: '+10~13점 목표', hours: '+2.2시간', tierBenefit: '시험장 당황 줄이기, 등급 향상 기대' },
        3: { score: '+14~17점 목표', hours: '+2.6시간', tierBenefit: '장기기억 고착 돕기, 등급 향상 기대' },
        4: { score: '+18~21점 목표', hours: '+3.0시간', tierBenefit: '작심삼일 줄이기, 등급 향상 기대' },
        5: { score: '+22~25점 목표', hours: '+3.4시간', tierBenefit: '시험 불안 완화 돕기, 준킬러 도전' },
        6: { score: '+25~28점 목표', hours: '+3.7시간', tierBenefit: '자율신경 안정 돕기, 킬러 추가 정답 기대' },
        7: { score: '+28~31점 목표', hours: '+4.0시간', tierBenefit: '오답 변형 줄이기, 상위권 안정 기대' },
        8: { score: '+30~33점 목표', hours: '+4.2시간', tierBenefit: '시각 노이즈 줄이기, 독해 속도 개선 기대' },
        9: { score: '+32~35점 목표', hours: '+4.5시간', tierBenefit: '두뇌 생체리듬 돕기, 전 과목 1등급 기대' },
        10: { score: '+35~38점 목표', hours: '+5.0시간 이상', tierBenefit: '전 과목 고득점 기대' }
    };
    const currentBoost = boostMap[activeProtocolsCount] || boostMap[10];


    // 12대 CareType 종합진단 연계 + 1단계 체크 습관 반영 추천
    // - 최신 진단 1건 선택 (날짜 내림차순, classificationResult.primary 우선)
    const latestAssessment = useMemo(() => {
        if (!history || history.length === 0) return null;
        const sorted = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return sorted.find(r => r.classificationResult?.primary && r.classificationResult.primary !== CareType.UNASSESSED)
            || sorted.find(r => r.careType && (r.careType as string) !== CareType.UNASSESSED)
            || sorted[0];
    }, [history]);
    const resolvedCareType: string =
        latestAssessment?.classificationResult?.primary?.toString()
        || latestAssessment?.careType?.toString()
        || latestAssessment?.dominantCareType?.toString()
        || 'Brain Fatigue';
    const carePattern: ClinicalPattern = PATTERN_BY_CARETYPE[resolvedCareType] || 'FATIGUE';
    // 1단계에서 체크한 나쁜 습관의 다수결 패턴 (체크가 있으면 진단 패턴보다 우선)
    const habitVotedPattern = useMemo<ClinicalPattern | null>(() => {
        if (checkedIds.length === 0) return null;
        const votes: Record<ClinicalPattern, number> = { FATIGUE: 0, DISTRACTION: 0, ANXIETY: 0, SURFACE_STUDY: 0 };
        for (const id of checkedIds) {
            const p = HABIT_PATTERN_MAP[id];
            if (p) votes[p] += 1;
        }
        let best: ClinicalPattern = carePattern;
        let bestCount = 0;
        (Object.keys(votes) as ClinicalPattern[]).forEach(k => {
            if (votes[k] > bestCount) { bestCount = votes[k]; best = k; }
        });
        return bestCount > 0 ? best : null;
    }, [checkedIds, carePattern]);
    const pattern: ClinicalPattern = habitVotedPattern || carePattern;
    const habitBased = habitVotedPattern !== null;
    const careTypeDisplay = pattern === 'DISTRACTION'
        ? '주의력 산만 & 도파민 갈망형'
        : pattern === 'ANXIETY'
            ? '불안-긴장 과민형 (Anxiety-Tension)'
            : pattern === 'SURFACE_STUDY'
                ? '가짜 공부 & 표면 처리형 (Surface Study)'
                : '두뇌 피로 & 에너지 방전형 (Brain Fatigue)';

    const currentRec = pipelineMap[pattern];

    useEffect(() => {
        if (currentRec?.primaryId) {
            setActiveProtocolTab(currentRec.primaryId);
        }
    }, [pattern]);

    // 생리학적 한숨 (Physiological Sigh) 3분 타이머 (종료시각 기준, 백그라운드 throttle 영향 없음)
    const sighEndRef = useRef<number>(0);
    useEffect(() => {
        if (!isSighRunning) return;
        if (sighSeconds <= 0) { setIsSighRunning(false); return; }
        sighEndRef.current = Date.now() + sighSeconds * 1000;
        const iv = setInterval(() => {
            const left = Math.max(0, Math.round((sighEndRef.current - Date.now()) / 1000));
            const elapsed = 180 - left;
            const cycleSec = elapsed % 9;
            setSighPhase(cycleSec < 2 ? 'inhale1' : cycleSec < 3 ? 'inhale2' : 'exhale');
            setHrvStatus(Math.min(100, Math.round((elapsed / 180) * 1000) / 10));
            setSighSeconds(left);
            if (left <= 0) {
                clearInterval(iv);
                setIsSighRunning(false);
                setHrvStatus(100);
                pushToast('🫁 3분 생리학적 한숨 리셋 완료! 수고하셨습니다.');
            }
        }, 500);
        return () => clearInterval(iv);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSighRunning]);

    // [프로토콜 8] 시각 터널링 블랙아웃 타이머 (종료시각 기준)
    const blackoutEndRef = useRef<number>(0);
    useEffect(() => {
        if (!isBlackoutRunning) return;
        if (blackoutTimer <= 0) { setIsBlackoutRunning(false); return; }
        blackoutEndRef.current = Date.now() + blackoutTimer * 1000;
        const iv = setInterval(() => {
            const left = Math.max(0, Math.round((blackoutEndRef.current - Date.now()) / 1000));
            setBlackoutTimer(left);
            if (left <= 0) {
                clearInterval(iv);
                setIsBlackoutRunning(false);
                pushToast('🌑 시각 터널링 25분 초집중 완료! 수고하셨습니다.');
            }
        }, 500);
        return () => clearInterval(iv);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isBlackoutRunning]);

    const handleAnalyzeRecall = () => {
        if (!recallInput.trim()) {
            pushToast('인출할 핵심 개념이나 요약 내용을 작성해주세요.');
            return;
        }
        setIsAnalyzingRecall(true);
        setTimeout(() => {
            setIsAnalyzingRecall(false);
            const words = recallInput.trim().split(/\s+/).filter(Boolean).length;
            // 단어 수 기반 정확도 산출 금지 — 작성 완료 여부와 분량만 기록
            setRecallScore(words);
        }, 600);
    };

    const handleSaveErrorNote = () => {
        if (!redTrap.trim() || !yellowMissing.trim() || !greenAction.trim()) {
            pushToast('착각 지점(Red), 인출 실패(Yellow), 초동 조치(Green) 3가지를 모두 입력해주세요.');
            return;
        }
        // p7 → 정식 오답노트 연계 (복습 스케줄·AI플랜 파이프라인에 편입)
        if (onSaveWrongNote) {
            try {
                const now = new Date();
                const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
                onSaveWrongNote({
                    id: `habit_p7_${Date.now()}`,
                    subject: p7Subject,
                    questionTitle: `[Habit 3색 분석] ${redTrap.trim().slice(0, 40)}`,
                    wrongAnswer: redTrap.trim(),
                    correctAnswer: greenAction.trim(),
                    explanation: `[착각] ${redTrap.trim()}\n[놓친 단서] ${yellowMissing.trim()}\n[다음 행동] ${greenAction.trim()}`,
                    difficulty: '중',
                    errorType: 'CONCEPT',
                    reviewStage: 0,
                    nextReviewDate: tomorrow,
                    isResolved: false,
                    createdAt: now.toISOString(),
                    metacognitiveNote: {
                        misconception: redTrap.trim(),
                        trapKeyword: yellowMissing.trim(),
                        actionRule: greenAction.trim()
                    }
                });
            } catch { /* 오답노트 저장 실패해도 카운터는 유지 */ }
        }
        setErrorSavedNotice(true);
        setTimeout(() => setErrorSavedNotice(false), 3000);
        setSavedErrorCount(prev => prev + 1);
        // 동결 구제 티켓: 오답 1건 작성 시 동결 해제
        if (streakFrozen) setStreakFrozen(false);
        setRedTrap('');
        setYellowMissing('');
        setGreenAction('');
    };

    const toggleHabitCheck = (id: string) => {
        setCheckedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // 총 낭비 시간 계산
    const totalWastedMinutes = checkedIds.reduce((sum, id) => {
        const found = BAD_HABITS_LIST.find(h => h.id === id);
        return sum + (found?.wastedMinutesPerDay || 0);
    }, 0);

    // 뽀모도로 타이머 카운트다운 (25분, 종료시각 기준)
    const pomEndRef = useRef<number>(0);
    useEffect(() => {
        if (!isRoutineRunning) return;
        if (timerSeconds <= 0) { setIsRoutineRunning(false); return; }
        pomEndRef.current = Date.now() + timerSeconds * 1000;
        const iv = setInterval(() => {
            const left = Math.max(0, Math.round((pomEndRef.current - Date.now()) / 1000));
            setTimerSeconds(left);
            if (left <= 0) {
                clearInterval(iv);
                setIsRoutineRunning(false);
                pushToast('🎉 25분 집중 교정 세션 완료! 나쁜 습관을 성공적으로 참아내셨나요?');
            }
        }, 500);
        return () => clearInterval(iv);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRoutineRunning]);

    const handleRunDiagnosis = () => {
        if (checkedIds.length === 0) {
            pushToast('최소 1개 이상의 나쁜 습관을 선택해주세요.');
            return;
        }
        setShowReportModal(true);
    };

    const handleSuccessCheck = () => {
        // 일자별 1회 (중복 클릭·재호출 방어)
        if (todayCompleted) return;
        if (streakFrozen) {
            pushToast('❄️ 현재 스트릭이 동결 중입니다. p7에서 오답 분석 1건을 저장하면 해제됩니다.');
            return;
        }
        // 최소 1개 프로토콜 실천 검증 (보상-행동 일치)
        if (activeProtocolsCount < 1) {
            pushToast('먼저 10대 프로토콜 중 1개 이상을 실천한 뒤 완료를 기록해 주세요.');
            return;
        }
        setSuccessStreak(prev => prev + 1);
        setTodayCompleted(true);
        pushToast('🏆 오늘의 실천을 기록했습니다. 내일도 이어가 보세요!');
    };

    const handlePrintReport = () => {
        const studentName = student?.name || '수험생';
        const studentId = student?.id || 'NBASS-2026-ST01';
        const dateStr = new Date().toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        const monthlyWastedHours = Math.round((totalWastedMinutes * 30) / 60);

        const habitsHtml = checkedIds.map(id => {
            const h = BAD_HABITS_LIST.find(item => item.id === id);
            if (!h) return '';
            return `
                <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; margin-bottom: 10px; background: #f8fafc; page-break-inside: avoid; break-inside: avoid;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <div>
                            <span style="font-size: 10px; font-weight: 800; background: #fee2e2; color: #b91c1c; padding: 2px 7px; border-radius: 4px;">${h.category}</span>
                            <span style="font-size: 12px; font-weight: 800; color: #0f172a; margin-left: 6px;">${h.title}</span>
                        </div>
                        <span style="font-size: 11px; font-weight: 800; color: #e11d48; font-family: monospace;">일일 -${h.wastedMinutesPerDay}분 손실</span>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1.2fr; gap: 8px; font-size: 10.5px;">
                        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 7px;">
                            <div style="font-size: 10px; font-weight: 800; color: #4338ca; margin-bottom: 2px;">🧠 뇌과학적 원인</div>
                            <div style="color: #475569; line-height: 1.4;">${h.brainCause}</div>
                            ${(HABIT_SCIENCE_SOURCES[h.id] || []).length > 0 ? `<div style="font-size: 9px; color: #94a3b8; margin-top: 3px;">📚 관련 대표 연구: ${HABIT_SCIENCE_SOURCES[h.id].join(' · ')}</div>` : ''}
                        </div>
                        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 7px;">
                            <div style="font-size: 10px; font-weight: 800; color: #e11d48; margin-bottom: 2px;">⚡ 수능/성적 악영향</div>
                            <div style="color: #475569; line-height: 1.4; margin-bottom: 4px;">${h.impact}</div>
                            ${h.expectedScoreBoost ? `<div style="font-size: 9.5px; font-weight: 800; color: #d97706; background: #fef3c7; padding: 3px 6px; border-radius: 4px; border: 1px solid #fde68a;">${h.expectedScoreBoost}</div>` : ''}
                        </div>
                        <div style="background: ${isPremiumOrAbove ? '#f0fdf4' : '#fdf4ff'}; border: 1px solid ${isPremiumOrAbove ? '#bbf7d0' : '#f0abfc'}; border-radius: 8px; padding: 7px;">
                            <div style="font-size: 10px; font-weight: 800; color: ${isPremiumOrAbove ? '#15803d' : '#86198f'}; margin-bottom: 2px;">💊 임상 교정 처방 (Rx) ${isPremiumOrAbove ? '' : '[PREMIUM 전용]'}</div>
                            <div style="color: ${isPremiumOrAbove ? '#166534' : '#701a75'}; line-height: 1.4;">
                                ${isPremiumOrAbove ? h.prescription : '🔒 본 습관의 정밀 임상 처방전(Rx) 및 3단계 힌트 프로토콜은 PREMIUM 등급 전용입니다.'}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        const printWindow = window.open('', '_blank', 'width=850,height=1000');
        if (!printWindow) {
            window.print();
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="ko">
            <head>
                <meta charset="UTF-8">
                <title>수험생 나쁜 공부습관 뇌과학 정밀 진단 소견서 - ${studentName}</title>
                <style>
                    @page { size: A4 portrait; margin: 12mm 15mm; }
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Pretendard", sans-serif; color: #0f172a; margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .page-container { width: 100%; max-width: 780px; margin: 0 auto; padding: 10px; }
                    .avoid-break { page-break-inside: avoid; break-inside: avoid; }
                </style>
            </head>
            <body>
                <div class="page-container">
                    <!-- 공식 헤더 -->
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 12px;">
                        <div>
                            <div style="font-size: 10px; font-weight: 900; letter-spacing: 1.5px; color: #e11d48; text-transform: uppercase;">NBASS Cognitive &amp; Behavioral Clinic</div>
                            <h1 style="font-size: 18px; font-weight: 900; color: #0f172a; margin: 2px 0 0 0;">수험생 나쁜 공부습관 뇌과학 정밀 진단 소견서</h1>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 9px; color: #64748b; font-weight: bold;">등록번호: <span style="color: #4338ca; font-family: monospace;">DOC-2026-HB8821</span></div>
                            <div style="font-size: 9px; color: #64748b; font-weight: bold;">열람 등급: <span style="color: #e11d48; font-weight: 900;">${tier.toUpperCase()} TIER</span></div>
                        </div>
                    </div>

                    <!-- 수험생 메타 스트립 -->
                    <div class="avoid-break" style="display: flex; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; margin-bottom: 12px; font-size: 11px;">
                        <div><span style="color: #64748b;">수험생 성명 / ID:</span> <strong style="color: #0f172a;">${studentName}</strong> (${studentId})</div>
                        <div><span style="color: #64748b;">진단 발급 일시:</span> <strong style="color: #334155;">${dateStr}</strong></div>
                        <div><span style="color: #64748b;">분석 기관:</span> <strong>NBASS 뇌인지행동 임상연구소</strong></div>
                    </div>

                    <!-- 3대 팩트폭행 지표 -->
                    <div class="avoid-break" style="background: linear-gradient(135deg, #4c0519 0%, #0f172a 50%, #1e1b4b 100%); color: white; border-radius: 12px; padding: 12px 16px; margin-bottom: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 6px; margin-bottom: 8px;">
                            <span style="font-size: 11px; font-weight: 800; color: #fda4af;">⚠️ 팩트 폭행: 진단된 하루 '가짜 공부' 시간 누적 피해</span>
                            <span style="font-size: 9px; background: rgba(255,255,255,0.15); padding: 2px 7px; border-radius: 10px; color: #fde047; font-weight: bold;">집중력 임계치 붕괴 경고</span>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; text-align: center;">
                            <div style="background: rgba(255,255,255,0.06); padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                                <div style="font-size: 9.5px; color: #cbd5e1;">하루 낭비 시간</div>
                                <div style="font-size: 20px; font-weight: 900; color: #fb7185; font-family: monospace; margin: 2px 0;">${totalWastedMinutes}분</div>
                                <div style="font-size: 8.5px; color: #94a3b8;">공부 중 딴짓/가짜공부</div>
                            </div>
                            <div style="background: rgba(255,255,255,0.06); padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                                <div style="font-size: 9.5px; color: #cbd5e1;">30일 누적 유실</div>
                                <div style="font-size: 20px; font-weight: 900; color: #fde047; font-family: monospace; margin: 2px 0;">약 ${monthlyWastedHours}시간</div>
                                <div style="font-size: 8.5px; color: #94a3b8;">한 달에 3~4일치 순공 증발</div>
                            </div>
                            <div style="background: rgba(255,255,255,0.06); padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                                <div style="font-size: 9.5px; color: #cbd5e1;">수능 예측 등급 영향</div>
                                <div style="font-size: 20px; font-weight: 900; color: #ef4444; font-family: monospace; margin: 2px 0;">하락 위험</div>
                                <div style="font-size: 8.5px; color: #94a3b8;">교정 실천으로 개선 기대 (개인차 있음)</div>
                            </div>
                        </div>
                    </div>

                    <!-- 12대 케어타입 분석 -->
                    <div class="avoid-break" style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 10px; padding: 10px 12px; margin-bottom: 12px; font-size: 11px;">
                        <div style="font-size: 11px; font-weight: 900; color: #312e81; margin-bottom: 3px;">✨ 12대 Care Type 신경계 메커니즘 연계 정밀 분석</div>
                        <p style="margin: 0; color: #334155; line-height: 1.45;">
                            현재 수험생의 신경계는 <strong>[두뇌 피로형 &amp; 도파민 갈망 루프]</strong>에 진입해 있을 수 있습니다.
                            전두엽 배외측피질(DLPFC)의 에너지가 떨어지면, 뇌는 사고의 부담을 피하려는 방어 기제로
                            <strong>"즉각적인 답지 열람"</strong>이나 <strong>"책상 정리 회피"</strong>, <strong>"숏폼·음악 멀티태스킹"</strong>을 택할 수 있습니다.
                            이는 단순한 의지 부족이 아닌 <strong>신체·인지 피로 신호일 수 있습니다.</strong>
                        </p>
                    </div>

                    <!-- 습관별 소견 카드 목록 -->
                    <div style="margin-bottom: 12px;">
                        <div style="font-size: 11.5px; font-weight: 900; color: #0f172a; margin-bottom: 6px;">📄 진단된 나쁜 공부습관별 뇌과학 소견 및 긴급 처방 (Rx)</div>
                        ${habitsHtml}
                    </div>

                    <!-- 소견서 공식 푸터 -->
                    <div class="avoid-break" style="border-top: 1px solid #cbd5e1; padding-top: 8px; margin-top: 12px; display: flex; justify-content: space-between; align-items: center; font-size: 9.5px; color: #64748b;">
                        <div>본 소견서는 NBASS 인지신경과학 연구소의 알고리즘에 의해 자동 생성된 맞춤형 처방 리포트입니다.</div>
                        <div style="font-weight: 900; color: #0f172a;">NBASS 의학 인지행동 클리닉 [인]</div>
                    </div>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 py-6 px-4 sm:px-6">
            <HabitToastStack toasts={toasts} onDismiss={dismissToast} />
            {/* 인쇄 최적화 전용 스타일: 인쇄 시 모달 외 모든 요소 숨김 및 다중 페이지 중복 방지 */}
            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 10mm 12mm;
                    }
                    body * {
                        visibility: hidden !important;
                    }
                    #habit-printable-report, #habit-printable-report * {
                        visibility: visible !important;
                    }
                    .habit-modal-overlay {
                        position: static !important;
                        background: none !important;
                        padding: 0 !important;
                        display: block !important;
                        width: 100% !important;
                        height: auto !important;
                        inset: auto !important;
                    }
                    #habit-printable-report {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        height: auto !important;
                        max-height: none !important;
                        overflow: visible !important;
                        border-radius: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                        background: white !important;
                        color: #0f172a !important;
                    }
                    .habit-modal-scrollable {
                        overflow: visible !important;
                        max-height: none !important;
                        height: auto !important;
                        padding: 0 !important;
                    }
                    .habit-print-hidden {
                        display: none !important;
                        visibility: hidden !important;
                    }
                    .habit-print-avoid-break {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

            {/* 1. Header Hero Banner (인쇄 시 숨김) */}
            <div className="print:hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-10 rounded-[2.5rem] border border-indigo-500/20 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 relative z-10 max-w-3xl">
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="px-3 py-1 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-full text-xs font-black flex items-center gap-1.5">
                            <Brain className="w-3.5 h-3.5" />
                            <span>12대 Care Type 신경계 연동 클리닉</span>
                        </span>
                        <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-full text-xs font-black">
                            진단 + 실천 2단계 프로그램
                        </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                        수험생 공부습관 교정 클리닉 (Habit Clinic)
                    </h2>
                    <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                        의지력 탓이 아닙니다. 학생의 신경계 피로도와 도파민 패턴을 뇌과학적으로 진단하고,
                        <strong> [PREMIUM: 충격 진단 리포트]</strong>와 <strong> [PLUS+: 실전 3단계 행동 교정기]</strong>로 나쁜 공부습관을 뿌리뽑습니다.
                    </p>
                </div>

                <div className="shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-right w-full md:w-auto">
                    <span className="text-xs text-slate-300 block">현재 멤버십 등급</span>
                    <span className="text-lg font-black text-amber-300 uppercase block font-mono">
                        {tier.toUpperCase()} TIER
                    </span>
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="mt-2 text-xs text-slate-400 hover:text-white underline transition"
                        >
                            ← 검사 결과로 돌아가기
                        </button>
                    )}
                </div>
            </div>

            {/* 2. Grid Layout: Left (설문 & 충격 리포트) / Right (실전 3단계 행동 교정기) (인쇄 시 완벽 숨김) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:hidden">
                {/* ── LEFT COLUMN: 설문 진단 & PREMIUM 충격 리포트 (7 cols) ── */}
                <div className="lg:col-span-7 space-y-6">
                    {/* 1단계: 수험생 12대 나쁜 공부습관 퀵 설문 */}
                    <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <AlertOctagon className="w-5 h-5 text-amber-500" />
                                <span>1단계: 수험생 12대 나쁜 공부습관 정밀 자가 진단</span>
                            </h3>
                            <span className="text-xs text-slate-400 font-bold">복수 선택 가능</span>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                            평소 공부할 때 자주 반복되는 비효율적인 나쁜 습관을 모두 체크하세요:
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {BAD_HABITS_LIST.map(habit => {
                                const isChecked = checkedIds.includes(habit.id);
                                return (
                                    <button
                                        key={habit.id}
                                        type="button"
                                        onClick={() => toggleHabitCheck(habit.id)}
                                        aria-pressed={isChecked}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-left w-full ${
                                            isChecked
                                                ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 shadow-sm'
                                                : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                                <span className="text-xs font-black text-rose-700 dark:text-rose-400 bg-rose-100/80 dark:bg-rose-900/40 px-2 py-0.5 rounded-md">
                                                    {habit.category}
                                                </span>
                                                <span
                                                    aria-hidden="true"
                                                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                                        isChecked ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                                                    }`}
                                                >
                                                    {isChecked && <Check className="w-3 h-3" />}
                                                </span>
                                            </div>
                                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                                                {habit.title}
                                            </h4>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                                {habit.description}
                                            </p>
                                        </div>
                                        <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                            <span>하루 낭비 손실:</span>
                                            <span>-{habit.wastedMinutesPerDay}분 / 일</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={handleRunDiagnosis}
                            className="w-full py-3.5 rounded-2xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-black text-sm shadow-md active:scale-95 transition flex items-center justify-center gap-2"
                        >
                            <Brain className="w-4 h-4 text-amber-400" />
                            <span>나쁜 습관 뇌과학 진단 리포트 생성하기</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* [PREMIUM 등급 분기]: ⚠️ 팩트 폭행 충격 리포트 */}
                    {isPremiumOrAbove ? (
                        <div className="bg-gradient-to-br from-rose-950 via-slate-900 to-indigo-950 text-white p-6 md:p-8 rounded-3xl border border-rose-800/40 shadow-xl space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black rounded-full flex items-center gap-1.5">
                                    <span>⚠️</span>
                                    <span>PREMIUM 팩트 폭행 충격 진단 리포트</span>
                                </span>
                                <span className="text-xs text-amber-300 font-bold bg-white/10 px-2.5 py-0.5 rounded-md">
                                    12대 케어타입 연계
                                </span>
                            </div>

                            <div className="py-3 border-y border-white/10">
                                <span className="text-xs text-slate-300 block">진단된 하루 '가짜 공부(Fake Study)' 낭비 시간</span>
                                <div className="flex items-baseline gap-3 mt-1.5 flex-wrap">
                                    <span className="text-3xl sm:text-4xl font-black text-rose-400 font-mono">
                                        매일 약 {totalWastedMinutes}분 낭비
                                    </span>
                                    <span className="text-xs sm:text-sm text-slate-400 font-bold">
                                        (한 달 누적 약 {Math.round((totalWastedMinutes * 30) / 60)}시간 손실 / 수능 2등급 하락 위험!)
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-xs sm:text-sm space-y-2">
                                <p className="font-black text-amber-300 flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-amber-400" />
                                    <span>왜 이런 나쁜 습관이 반복될까요? (뇌과학적 원인)</span>
                                </p>
                                <p className="text-slate-200 text-xs leading-relaxed">
                                    학생의 <strong>[두뇌 피로형 &amp; 도파민 갈망]</strong> 신경계 패턴으로 인해, 전두엽 포도당 대사가 25분 이상 소모되면 뇌가 사고를 회피하기 위해 <strong>"해설지 바로 슬쩍 보기"</strong>나 <strong>"책상 정리 회피 행동"</strong>으로 무의식적인 도피를 감행하는 것입니다.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 md:p-8 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl text-white border border-amber-400/30 text-center space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center mx-auto text-xl border border-amber-400/30">
                                <Lock className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-amber-300">
                                    나쁜 습관 충격 진단 &amp; 낭비 시간 분석 잠금
                                </h4>
                                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
                                    내가 하루에 몇 분의 '가짜 공부'를 하며 시간을 버리고 있는지 정밀 팩트폭행 리포트를 확인하려면 <strong>정기결제 회원</strong> 등록이 필요합니다.
                                </p>
                            </div>
                            {onUpgradeClick && (
                                <button
                                    onClick={onUpgradeClick}
                                    className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition active:scale-95"
                                >
                                    정기결제(월 ₩19,900)로 충격 리포트 열기
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* ── RIGHT COLUMN: PLUS+ 전용 5대 뇌신경 행동 교정 스위트 (5 cols) ── */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-5 sm:p-7 rounded-3xl border-2 border-purple-300 dark:border-purple-800 shadow-xl space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                            <div className="flex items-center gap-2">
                                <Flame className="w-5 h-5 text-purple-600 animate-pulse" />
                                <div>
                                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                                        2단계: PLUS+ 5대 뇌신경 행동 교정 스위트
                                    </h3>
                                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold block">
                                        Neuro-Action Behavioral Clinic Suite
                                    </span>
                                </div>
                            </div>
                            <span className="text-xs bg-indigo-100 text-indigo-800 font-black px-2.5 py-0.5 rounded-full border border-indigo-300">
                                💎 PREMIUM 전용
                            </span>
                        </div>

                        {isPremiumOrAbove ? (
                            <div className="space-y-4">
                                {/* 1. 상단: 📈 5대 행동 교정 시너지 & 기대 성적 향상 시뮬레이터 */}
                                <div className="bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 text-white p-4 rounded-2xl border border-purple-500/30 space-y-2.5 shadow-md">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-black text-purple-300 flex items-center gap-1.5">
                                            <Zap className="w-4 h-4 text-amber-400" />
                                            <span>프로토콜 시너지 기대 성적 예측기</span>
                                        </span>
                                        <span className="text-[11px] font-black bg-white/10 px-2 py-0.5 rounded-md text-amber-300 font-mono">
                                            {activeProtocolsCount}/10 프로토콜 가동
                                        </span>
                                    </div>
                                    <div className="flex items-baseline justify-between pt-0.5">
                                        <div>
                                            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                                                {currentBoost.score}
                                            </span>
                                            <span className="text-[11px] text-slate-300 font-bold ml-2">
                                                (순공 {currentBoost.hours} 회복)
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                                            {currentBoost.tierBenefit}
                                        </span>
                                    </div>
                                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 h-full transition-all duration-500 rounded-full"
                                            style={{ width: `${Math.max(10, (activeProtocolsCount / 10) * 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 leading-relaxed">
                                        ※ 표시 수치는 꾸준히 실천했을 때의 목표치이며 개인차가 있습니다.
                                    </p>
                                </div>

                                {/* 2. Streak Badge */}
                                <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-950/40 p-3 rounded-2xl border border-purple-200 dark:border-purple-800">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                                            🔥
                                        </div>
                                        <div>
                                            <span className="text-xs font-black text-purple-950 dark:text-purple-200 block">연속 습관 교정 스트릭</span>
                                            <span className="text-[11px] text-purple-700 dark:text-purple-300 font-bold">{successStreak}일 연속 나쁜 습관 참아내는 중!</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black text-purple-700 dark:text-purple-300 font-mono bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-purple-200">
                                        누적 {successStreak}일 실천
                                    </span>
                                </div>

                                {/* 2-1. 🤖 12대 종합진단 연계: AI 신경계 맞춤 처방 파이프라인 브리핑 카드 */}
                                <div className="p-4 bg-gradient-to-br from-purple-900/40 via-indigo-950/60 to-slate-900 text-white rounded-2xl border border-purple-400/40 space-y-3 shadow-md">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <Sparkles className="w-4 h-4 text-amber-400" />
                                            <span className="text-xs font-black text-white">
                                                AI 신경계 종합진단 연계 처방 파이프라인
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full">
                                            {careTypeDisplay}
                                        </span>
                                    </div>
                                    {habitBased && (
                                        <p className="text-[10px] text-indigo-300 leading-relaxed">
                                            🎯 1단계에서 체크한 습관 {checkedIds.length}개 기반 맞춤 추천입니다.
                                        </p>
                                    )}

                                    {/* Step 1: AI 1순위 핵심 1가지 완수 시 실질적 도움 */}
                                    <div className="p-3 bg-amber-400/10 rounded-xl border border-amber-400/30 space-y-1.5">
                                        <div className="flex items-center justify-between flex-wrap gap-1">
                                            <span className="text-[11px] font-black text-amber-300 flex items-center gap-1">
                                                <span>🥇 [Step 1] AI 1순위 최우선:</span>
                                                <strong className="text-white underline">{currentRec.primaryTitle}</strong>
                                            </span>
                                            <span className="text-[10px] font-black text-amber-300 font-mono bg-amber-950/80 px-2 py-0.5 rounded border border-amber-400/30">
                                                {currentRec.primaryScore}
                                            </span>
                                        </div>
                                        <p className="text-[10.5px] text-slate-200 leading-snug">
                                            👉 <strong>이 1가지만 7일간 완수해도</strong>: {currentRec.primaryGain}
                                        </p>
                                        <button
                                            onClick={() => setActiveProtocolTab(currentRec.primaryId)}
                                            className="mt-1 w-full py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-[11px] flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
                                        >
                                            <span>👉 지금 바로 AI 1순위 프로토콜 실행하기</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Step 2: AI 1차 추천 3종 추가 가동 시 누적 추가 이득 */}
                                    <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-400/30 space-y-1">
                                        <div className="flex items-center justify-between flex-wrap gap-1">
                                            <span className="text-[11px] font-black text-purple-300">
                                                ✨ [Step 2] AI 1차 추천 3종 병행: <span className="text-slate-200 font-normal">{currentRec.secondaryTitle}</span>
                                            </span>
                                            <span className="text-[10px] font-black text-purple-300 font-mono bg-purple-950/80 px-2 py-0.5 rounded border border-purple-400/30">
                                                {currentRec.secondaryScore}
                                            </span>
                                        </div>
                                        <p className="text-[10.5px] text-slate-300 leading-snug">
                                            👉 <strong>1차 추천 세트를 함께 가동하면</strong>: {currentRec.secondaryCumulativeGain}
                                        </p>
                                    </div>
                                </div>

                                {/* 3. 10대 프로토콜 탭 셀렉터 (AI 뱃지 동적 점등 & 카테고리 필터) */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 px-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-base">{PROTOCOL_META[activeProtocolTab].icon}</span>
                                            <span className="font-black text-purple-700 dark:text-purple-300">
                                                [{PROTOCOL_META[activeProtocolTab].step}] {PROTOCOL_META[activeProtocolTab].fullTitle}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10.5px]">
                                            <button
                                                type="button"
                                                onClick={() => setProtocolCategory('all')}
                                                className={`px-2 py-0.5 rounded-lg transition cursor-pointer font-bold ${
                                                    protocolCategory === 'all'
                                                        ? 'bg-purple-600 text-white shadow-xs'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                                }`}
                                            >
                                                전체 10대
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setProtocolCategory('core')}
                                                className={`px-2 py-0.5 rounded-lg transition cursor-pointer font-bold ${
                                                    protocolCategory === 'core'
                                                        ? 'bg-purple-600 text-white shadow-xs'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                                }`}
                                            >
                                                핵심 행동 5대
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setProtocolCategory('boost')}
                                                className={`px-2 py-0.5 rounded-lg transition cursor-pointer font-bold ${
                                                    protocolCategory === 'boost'
                                                        ? 'bg-purple-600 text-white shadow-xs'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                                }`}
                                            >
                                                환경·생체 5대
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-5 gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                                        {(Object.keys(PROTOCOL_META) as ProtocolId[])
                                            .filter(id => protocolCategory === 'all' || PROTOCOL_META[id].group === protocolCategory)
                                            .map(pId => {
                                                const isPrimary = pId === currentRec.primaryId;
                                                const isSecondary = currentRec.secondaryIds.includes(pId);
                                                const info = PROTOCOL_META[pId];
                                                return (
                                                    <button
                                                        key={pId}
                                                        type="button"
                                                        onClick={() => setActiveProtocolTab(pId)}
                                                        className={`py-2 px-1 text-[10.5px] font-black rounded-xl transition flex flex-col items-center gap-0.5 cursor-pointer relative ${
                                                            activeProtocolTab === pId
                                                                ? 'bg-purple-600 text-white shadow-sm'
                                                                : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/50 dark:border-slate-700/50'
                                                        }`}
                                                    >
                                                        {isPrimary && (
                                                            <span className="text-[7.5px] font-black text-amber-300 bg-amber-950 px-1 py-0.2 rounded border border-amber-400/60 leading-tight">
                                                                🥇 1순위
                                                            </span>
                                                        )}
                                                        {isSecondary && (
                                                            <span className="text-[7.5px] font-bold text-purple-300 bg-purple-950 px-1 py-0.2 rounded border border-purple-400/40 leading-tight">
                                                                ✨ 1차추천
                                                            </span>
                                                        )}
                                                        {!isPrimary && !isSecondary && (
                                                            <span className="text-[7.5px] font-normal text-slate-400 dark:text-slate-500 leading-tight">
                                                                🎯 마스터
                                                            </span>
                                                        )}
                                                        <span className="mt-0.5 text-xs">{info.icon} {info.step}</span>
                                                        <span className="text-[9.5px] font-normal truncate max-w-[65px]">{info.name}</span>
                                                    </button>
                                                );
                                            })}
                                    </div>
                                </div>

                                {/* 4. 10대 프로토콜별 상세 인터랙티브 패널 */}
                                {/* [방법 1] 물리 차단 & 점진 힌트 */}
                                {activeProtocolTab === 'p1' && (
                                    <div className="space-y-3.5 animate-in fade-in duration-200">
                                        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                                            <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1 text-xs">
                                                <Brain className="w-3.5 h-3.5 text-indigo-600" />
                                                <span>뇌과학적 원리: 자극 제어(Stimulus Control) &amp; 인지적 진입 장벽 구축</span>
                                            </span>
                                            <p className="leading-snug">
                                                자극원(답지·스마트폰)이 3m 이상 떨어지면 충동적인 확인 욕구를 다스리는 데 도움이 됩니다. 3단계 점진적 힌트로 스스로의 인출 회로를 보존합니다.
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black text-slate-800 dark:text-slate-200 mb-1">
                                                ① 오늘 봉인(Lock)할 나쁜 습관
                                            </label>
                                            <select
                                                value={selectedTargetHabit}
                                                onChange={(e) => setSelectedTargetHabit(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200"
                                            >
                                                {BAD_HABITS_LIST.map(h => (
                                                    <option key={h.id} value={h.id}>🚫 {h.title}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2 text-xs">
                                            <label className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={pledgeChecked}
                                                    onChange={(e) => setPledgeChecked(e.target.checked)}
                                                    className="accent-purple-600 rounded w-4 h-4"
                                                />
                                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                                    1단계 서약: 오늘 해설지 즉시 확인을 자제한다.
                                                </span>
                                            </label>
                                            <label className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={distanceChecked}
                                                    onChange={(e) => setDistanceChecked(e.target.checked)}
                                                    className="accent-purple-600 rounded w-4 h-4"
                                                />
                                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                                    2단계 격리: 답지 및 스마트폰을 책상에서 3m 이상 물리적으로 격리했다.
                                                </span>
                                            </label>
                                        </div>

                                        {/* 3단계 힌트 오픈제 */}
                                        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 space-y-2">
                                            <span className="text-xs font-black text-amber-900 dark:text-amber-200 block">
                                                3단계: 점진적 힌트 오픈 프로토콜 (5분 간격 해제)
                                            </span>
                                            <div className="grid grid-cols-3 gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => setHintLevel(1)}
                                                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border cursor-pointer ${
                                                        hintLevel === 1 ? 'bg-amber-500 text-slate-950 border-amber-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-amber-200'
                                                    }`}
                                                >
                                                    1단계: 키워드 힌트
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setHintLevel(2)}
                                                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border cursor-pointer ${
                                                        hintLevel === 2 ? 'bg-amber-500 text-slate-950 border-amber-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-amber-200'
                                                    }`}
                                                >
                                                    2단계: 공식 단서
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setHintLevel(3)}
                                                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border cursor-pointer ${
                                                        hintLevel === 3 ? 'bg-amber-500 text-slate-950 border-amber-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-amber-200'
                                                    }`}
                                                >
                                                    3단계: 최종 풀이
                                                </button>
                                            </div>
                                            <div className="text-[11px] text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-lg border border-amber-200/60 leading-relaxed">
                                                {hintLevel === 1 && '💡 [1단계 힌트]: 문제의 출제 단원과 핵심 키워드 1가지만 메모하고, 5분간 추가 사유를 진행하세요.'}
                                                {hintLevel === 2 && '📐 [2단계 단서]: 필요한 정리/공식의 시작 형태만 확인하고, 풀이 전개는 끝까지 혼자 작성하세요.'}
                                                {hintLevel === 3 && '📖 [3단계 최종 풀이]: 10분 이상 고민 후 오답 원인을 파악하기 위해 해설의 첫 줄 시작 아이디어만 체크하세요.'}
                                            </div>
                                        </div>

                                        {/* 25분 뽀모도로 타이머 */}
                                        <div className="bg-slate-900 text-white p-4 rounded-2xl text-center space-y-2">
                                            <span className="text-[10px] text-slate-400 font-bold block">
                                                25분 동안 위 습관 줄이기 (단독 교정 시 점수 개선 기대)
                                            </span>
                                            <div className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-emerald-400">
                                                {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:{String(timerSeconds % 60).padStart(2, '0')}
                                            </div>
                                            <div className="flex items-center justify-center gap-2 pt-0.5">
                                                <button
                                                    type="button"
                                                    onClick={() => { if (!isRoutineRunning && timerSeconds <= 0) setTimerSeconds(25 * 60); setIsRoutineRunning(!isRoutineRunning); }}
                                                    className={`px-5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
                                                        isRoutineRunning ? 'bg-amber-400 text-slate-950' : 'bg-emerald-500 text-white'
                                                    }`}
                                                >
                                                    {isRoutineRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                                    <span>{isRoutineRunning ? '일시정지' : '세션 시작'}</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => { setIsRoutineRunning(false); setTimerSeconds(25 * 60); }}
                                                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 cursor-pointer"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* [방법 2] IF-THEN 조건반사 스위치 */}
                                {activeProtocolTab === 'p2' && (
                                    <div className="space-y-3.5 animate-in fade-in duration-200">
                                        <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                                            <span className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1 text-xs">
                                                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                                                <span>뇌과학적 원리: 뉴욕대 골위처 교수 '실행 의도(Implementation Intentions)'</span>
                                            </span>
                                            <p className="leading-snug">
                                                의지력만으로는 흔들리기 쉬우나, 뇌 기저핵(Basal Ganglia)에 '만약(IF) ➡️ 그때(THEN)'의 조건반사를 새겨두면 무의식적으로 행동이 전환되어 뇌 정지(Brain Freeze) 완화에 도움이 됩니다.
                                            </p>
                                        </div>

                                        <div className="space-y-2.5 text-xs">
                                            <div>
                                                <span className="font-black text-rose-600 dark:text-rose-400 block mb-1">
                                                    🚨 만약 위기 상황이 닥치면 (IF):
                                                </span>
                                                <select
                                                    value={ifSituation}
                                                    onChange={(e) => setIfSituation(e.target.value)}
                                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200"
                                                >
                                                    <option value="">위기 상황을 선택하세요</option>
                                                    <option value="수학/과탐 난문에서 3분간 막혀 답지를 열고 싶을 때">수학/과탐 난문에서 3분간 막혀 답지를 열고 싶을 때</option>
                                                    <option value="공부 도중 스마트폰을 집어 들고 싶을 때">공부 도중 스마트폰을 집어 들고 싶을 때</option>
                                                    <option value="집중이 풀리고 잡생각(DMN)으로 멍때릴 때">집중이 풀리고 잡생각(DMN)으로 멍때릴 때</option>
                                                    <option value="계획이 밀려 짜증나고 자포자기하고 싶을 때">계획이 밀려 짜증나고 자포자기하고 싶을 때</option>
                                                </select>
                                            </div>

                                            <div>
                                                <span className="font-black text-emerald-600 dark:text-emerald-400 block mb-1">
                                                    ⚡ 그때 1초 만에 실행할 뇌과학 대체 행동 (THEN):
                                                </span>
                                                <input
                                                    type="text"
                                                    value={thenReaction}
                                                    onChange={(e) => setThenReaction(e.target.value)}
                                                    placeholder="예: 샤프를 내려놓고 문제 조건 3가지를 동그라미 치며 2분간 말로 설명한다"
                                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 placeholder:text-slate-400 placeholder:font-normal"
                                                />
                                            </div>
                                        </div>

                                        <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-800 text-center space-y-2">
                                            <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 block">
                                                지금 충동이 일어났나요? SOS 브레이크를 발동하세요!
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSosTriggered(true);
                                                    if (sosTimeoutRef.current) clearTimeout(sosTimeoutRef.current);
                                                    sosTimeoutRef.current = setTimeout(() => setSosTriggered(false), 6000);
                                                }}
                                                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
                                            >
                                                <ShieldAlert className="w-4 h-4" />
                                                <span>🚨 [SOS 골든 브레이크] 발동하기</span>
                                            </button>
                                            {sosTriggered && (
                                                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border-2 border-rose-500 animate-bounce text-left text-xs font-bold text-rose-600 space-y-1">
                                                    <div>⚡ <strong>긴급 조건반사 처방 발동!</strong></div>
                                                    <div className="text-slate-800 dark:text-slate-200 font-normal">
                                                        👉 지금 즉시: "{thenReaction}"
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* [방법 3] 60초 마이크로 리콜 & 파인만 보이스 인출기 */}
                                {activeProtocolTab === 'p3' && (
                                    <div className="space-y-3.5 animate-in fade-in duration-200">
                                        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                                            <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1 text-xs">
                                                <Mic className="w-3.5 h-3.5 text-amber-600" />
                                                <span>뇌과학적 원리: '가짜 숙달 효과(Fluency Illusion)' 박멸 &amp; 해마 LTP 장기기억화</span>
                                            </span>
                                            <p className="leading-snug">
                                                눈으로 훑는 것만으로는 오래 기억되기 어렵습니다. 스스로 소리 내어 설명하거나 요약하면 핵심이 오래 남는 데 도움이 될 수 있습니다.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-xs font-black text-slate-800 dark:text-slate-200">
                                                방금 공부한 핵심 개념 1가지 / 오답 착각 지점 60초 셀프 티칭:
                                            </label>
                                            <textarea
                                                value={recallInput}
                                                onChange={(e) => setRecallInput(e.target.value)}
                                                rows={3}
                                                placeholder="예: '등차수열 합 공식에서 n/2 대신 공차 d를 곱하는 착각을 했다. 핵심은 첫항과 끝항의 평균에 항수를 곱하는 원리다.'"
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-800 dark:text-slate-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAnalyzeRecall}
                                                disabled={isAnalyzingRecall}
                                                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50"
                                            >
                                                <Sparkles className="w-3.5 h-3.5" />
                                                <span>{isAnalyzingRecall ? '기록 저장 중...' : '인출 기록 저장하기'}</span>
                                            </button>
                                        </div>

                                        {recallScore !== null && (
                                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                                                <div className="flex justify-between items-center font-black">
                                                    <span className="text-emerald-900 dark:text-emerald-200">🧠 인출 기록 완료</span>
                                                    <span className="text-base text-emerald-600 font-mono">{recallScore}단어 작성</span>
                                                </div>
                                                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                                                    핵심 내용을 말로 풀어썼습니다. 정확한지는 해설지와 직접 대조해 확인하세요.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* [방법 4] 도파민 연속 스트릭 & 손실 회피 금고 */}
                                {activeProtocolTab === 'p4' && (
                                    <div className="space-y-3.5 animate-in fade-in duration-200">
                                        <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-xl border border-orange-200 dark:border-orange-800 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                                            <span className="font-bold text-orange-900 dark:text-orange-200 flex items-center gap-1 text-xs">
                                                <Flame className="w-3.5 h-3.5 text-orange-600" />
                                                <span>뇌과학적 원리: 행동경제학 '손실 회피 편향(Loss Aversion)'</span>
                                            </span>
                                            <p className="leading-snug">
                                                인간은 얻는 이익보다 '이미 쌓아둔 것을 잃는 고통'에 더 강하게 반응합니다. 누적 스트릭을 볼모로 삼아 나쁜 습관 타협을 줄여봅니다.
                                            </p>
                                        </div>

                                        {/* 스트릭 & 도파민 마일리지 현황판 */}
                                        <div className="p-4 bg-gradient-to-r from-orange-900/60 to-slate-900 rounded-2xl border border-orange-400/40 text-white space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-[10px] text-orange-300 font-bold block">불꽃 연속 실천 스트릭</span>
                                                    <div className="text-2xl font-black text-orange-400 flex items-center gap-1">
                                                        <span>🔥 Day {dopamineStreak} 달성 중!</span>
                                                        <span className="text-xs text-slate-300 font-normal">/ 목표 Day 30</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] text-amber-300 font-bold block">적립 도파민 마일리지</span>
                                                    <span className="text-xl font-mono font-black text-amber-300">{dopaminePoints.toLocaleString()} DP</span>
                                                </div>
                                            </div>

                                            {/* 손실 회피 금고 경고문 */}
                                            <div className="p-2.5 bg-black/40 rounded-xl border border-orange-500/30 text-xs space-y-1">
                                                <span className="text-rose-400 font-black flex items-center gap-1">
                                                    <AlertOctagon className="w-3.5 h-3.5" />
                                                    <span>손실 회피 금고 경고:</span>
                                                </span>
                                                <p className="text-[11px] text-slate-300 leading-snug">
                                                    오늘 나쁜 습관에 타협한 날로 기록하면 누적 <strong>{dopamineStreak}일 연속 스트릭과 {dopaminePoints} DP가 동결</strong>됩니다.
                                                    동결 중에는 서약·완료 체크가 잠기며, 「3색 오답 재구성」 1건 작성 시 해제됩니다.
                                                </p>
                                                <div className="pt-1 text-[10.5px] text-amber-300">
                                                    🛡️ <strong>동결 구제 티켓</strong>: 「3색 뇌신경 오답 재구성」 1건 작성 시 복구를 시작합니다
                                                </div>
                                                {streakFrozen && (
                                                    <div className="p-2 bg-rose-500/20 border border-rose-400/50 rounded-lg text-rose-200 font-bold text-[11px]">
                                                        ❄️ 현재 동결 중입니다. p7에서 오답 분석 1건을 저장하면 해제됩니다.
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsStreakProtected(true);
                                                        setStreakNotice(true);
                                                        setTimeout(() => setStreakNotice(false), 3500);
                                                    }}
                                                    disabled={streakFrozen}
                                                    className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:bg-slate-700 disabled:text-slate-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                                                >
                                                    <ShieldCheck className="w-4 h-4" />
                                                    <span>{streakFrozen ? '동결 중 (p7 오답 작성 시 해제)' : '오늘 나쁜 습관 타협 0건 수호 서약 (스트릭 잠금)'}</span>
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (!streakFrozen) {
                                                            setStreakFrozen(true);
                                                            setIsStreakProtected(false);
                                                        }
                                                    }}
                                                    disabled={streakFrozen}
                                                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/50 disabled:text-slate-500 text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:cursor-not-allowed"
                                                >
                                                    <span>😞 오늘 타협했어요 (스트릭 동결 기록)</span>
                                                </button>
                                            </div>

                                            {streakNotice && !streakFrozen && (
                                                <div className="p-2 bg-emerald-500/20 border border-emerald-400 text-emerald-300 rounded-lg text-center text-xs font-bold">
                                                    🎉 오늘 스트릭이 금고에 봉인되었습니다!
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* [방법 5] 학부모 실시간 안심 동기화 & 잔소리 제로 세이프가드 */}
                                {activeProtocolTab === 'p5' && (
                                    <div className="space-y-3.5 animate-in fade-in duration-200">
                                        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                                            <span className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1 text-xs">
                                                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                                                <span>뇌과학적 원리: 사회적 책임감(Social Accountability) &amp; 심리적 안전지대 구축</span>
                                            </span>
                                            <p className="leading-snug">
                                                부모의 의심과 잔소리는 수험생의 불안을 키워 공부 기억에 방해가 될 수 있습니다. 노력 지표를 공유하면 가정 내 잔소리를 줄이는 데 도움이 될 수 있습니다.
                                            </p>
                                        </div>

                                        {/* 스마트 알림톡 프리뷰 카드 */}
                                        <div className="p-3.5 bg-amber-50 dark:bg-slate-900 rounded-2xl border-2 border-amber-300 dark:border-amber-600/60 text-slate-900 dark:text-slate-100 space-y-2.5">
                                            <div className="flex items-center justify-between pb-2 border-b border-amber-200 dark:border-slate-800 text-xs">
                                                <span className="font-black text-amber-900 dark:text-amber-400 flex items-center gap-1">
                                                    <span>🔔 [학부모 공유 미리보기]</span>
                                                </span>
                                                <span className="text-[10px] text-slate-500">실천 기록</span>
                                            </div>

                                            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-xs space-y-2 border border-slate-200 dark:border-slate-700">
                                                <div className="font-bold text-slate-900 dark:text-slate-100">
                                                    [NBASS 노력 리포트]
                                                </div>
                                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                                                    "{student?.name || '학생'} 님이 {successStreak > 0 ? `연속 ${successStreak}일` : '오늘'} 실천을 기록했습니다.
                                                    {savedErrorCount > 0 ? ` 오답 분석 ${savedErrorCount}건을 누적했습니다.` : ''} 결과보다 과정을 칭찬해 주세요."
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    const content = {
                                                        studentName: student?.name || '학생',
                                                        dateLabel: new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }),
                                                        streakDays: successStreak,
                                                        protocolCount: activeProtocolsCount,
                                                        errorCount: savedErrorCount,
                                                    };
                                                    setParentSyncSent(true);
                                                    setParentSyncLog(prev => [...prev.slice(-29), {
                                                        at: new Date().toISOString(),
                                                        text: `${content.studentName} 연속 ${successStreak}일 실천, 오답 분석 ${savedErrorCount}건 누적`
                                                    }]);
                                                    // Phase 0: 학생 주도 카카오 공유 (SDK 미준비 시 복사 폴백)
                                                    const res = shareHabitToKakao(content);
                                                    if (res === 'shared') {
                                                        pushToast('📲 카카오톡 공유 화면을 열었습니다.');
                                                    } else {
                                                        const ok = await copyTextToClipboard(buildHabitShareText(content));
                                                        pushToast(ok ? '📋 공유 내용이 복사되었습니다. 카톡에 붙여넣으세요.' : '공유에 실패했습니다. 다시 시도해 주세요.');
                                                    }
                                                    setParentNoticeToast(true);
                                                    setTimeout(() => setParentNoticeToast(false), 4000);
                                                }}
                                                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                                            >
                                                <Send className="w-3.5 h-3.5" />
                                                <span>📲 오늘 실천 내용 공유하기</span>
                                            </button>

                                            {parentNoticeToast && (
                                                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 rounded-xl text-center text-xs font-bold">
                                                    ✅ 노력 리포트가 기록되었습니다 (누적 {parentSyncLog.length}건)
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* [방법 6] 3분 생리학적 한숨 & 자율신경 리셋 */}
                                {activeProtocolTab === 'p6' && (
                                    <div className="space-y-3.5 animate-in fade-in duration-200">
                                        <div className="p-3 bg-teal-50 dark:bg-teal-950/30 rounded-xl border border-teal-200 dark:border-teal-800 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                                            <span className="font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1 text-xs">
                                                <Wind className="w-3.5 h-3.5 text-teal-600" />
                                                <span>뇌과학적 원리: 생리학적 한숨(Physiological Sigh) &amp; 미주신경 자율신경 리셋</span>
                                            </span>
                                            <p className="leading-snug">
                                                '두 번 연속 들이마시고 길게 내쉬는 한숨'은 실시간 진정에 활용되는 호흡 기법으로, 짧은 시간에 마음을 가라앉히는 데 도움이 될 수 있다는 연구 보고가 있습니다.
                                            </p>
                                        </div>

                                        <div className="p-4 bg-slate-900 text-white rounded-2xl text-center space-y-3">
                                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                                                <span>세션 진행률:</span>
                                                <span className="font-mono font-bold text-teal-400">{hrvStatus}%</span>
                                            </div>

                                            {/* 호흡 가이드 서클 애니메이션 */}
                                            <div className="w-24 h-24 mx-auto rounded-full bg-teal-500/20 border-2 border-teal-400 flex items-center justify-center transition-all duration-700 transform">
                                                <span className="text-xs font-black text-teal-300 text-center px-2 whitespace-pre-line">
                                                    {sighPhase === 'inhale1' && '들숨 ①\n(코로 깊게)'}
                                                    {sighPhase === 'inhale2' && '들숨 ②\n(한번더 팽창)'}
                                                    {sighPhase === 'exhale' && '날숨\n(천천히 길게)'}
                                                </span>
                                            </div>

                                            <div className="text-2xl font-black font-mono tracking-wider text-teal-400">
                                                {String(Math.floor(sighSeconds / 60)).padStart(2, '0')}:{String(sighSeconds % 60).padStart(2, '0')}
                                            </div>

                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => { if (!isSighRunning && sighSeconds <= 0) setSighSeconds(180); setIsSighRunning(!isSighRunning); }}
                                                    className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                                                        isSighRunning ? 'bg-amber-400 text-slate-950' : 'bg-teal-500 text-white'
                                                    }`}
                                                >
                                                    {isSighRunning ? '일시정지' : '3분 신경계 리셋 시작'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => { setIsSighRunning(false); setSighSeconds(180); setHrvStatus(0); }}
                                                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 cursor-pointer"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* [방법 7] 3색 뇌신경 오답 메타인지 분해기 */}
                                {activeProtocolTab === 'p7' && (
                                    <div className="space-y-3.5 animate-in fade-in duration-200">
                                        <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                                            <span className="font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1 text-xs">
                                                <BookOpen className="w-3.5 h-3.5 text-rose-600" />
                                                <span>뇌과학적 원리: 전대상피질(dACC) 오류 감지 회로 자극 (오답 베껴 쓰기 박멸)</span>
                                            </span>
                                            <p className="leading-snug">
                                                해설지를 베끼는 단순 노동을 중단하고 [착각-누락-초동행동]의 3색 메타인지로 분석하면 동일 유형 오답이 줄어드는 데 도움이 됩니다.
                                            </p>
                                        </div>

                                        <div className="space-y-2 text-xs">
                                            <div>
                                                <span className="font-black text-slate-600 dark:text-slate-300 block mb-0.5">
                                                    📚 관련 과목 (오답노트 분류용):
                                                </span>
                                                <select
                                                    value={p7Subject}
                                                    onChange={(e) => setP7Subject(e.target.value)}
                                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200"
                                                >
                                                    {['공통', '국어', '수학', '영어', '탐구'].map(s => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <span className="font-black text-rose-600 block mb-0.5">
                                                    🔴 Red (나의 착각 지점):
                                                </span>
                                                <input
                                                    type="text"
                                                    value={redTrap}
                                                    onChange={(e) => setRedTrap(e.target.value)}
                                                    placeholder="예: 문제 조건의 '서로 다른'을 놓치고 중복 조합으로 풂"
                                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium"
                                                />
                                            </div>
                                            <div>
                                                <span className="font-black text-amber-600 block mb-0.5">
                                                    🟡 Yellow (인출 누락 개념):
                                                </span>
                                                <input
                                                    type="text"
                                                    value={yellowMissing}
                                                    onChange={(e) => setYellowMissing(e.target.value)}
                                                    placeholder="예: 여사건의 확률 적용 공식 및 경계값 검증"
                                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium"
                                                />
                                            </div>
                                            <div>
                                                <span className="font-black text-emerald-600 block mb-0.5">
                                                    🟢 Green (10초 초동 행동 처방):
                                                </span>
                                                <input
                                                    type="text"
                                                    value={greenAction}
                                                    onChange={(e) => setGreenAction(e.target.value)}
                                                    placeholder="예: 문제 첫 단어에 네모 박스 치고 반대 경우 1줄 적기"
                                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleSaveErrorNote}
                                            className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                                        >
                                            <Check className="w-3.5 h-3.5" />
                                            <span>💾 3색 뇌신경 오답 처방 저장하기 (누적 {savedErrorCount}건)</span>
                                        </button>

                                        {errorSavedNotice && (
                                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-center text-xs font-bold text-emerald-700 dark:text-emerald-300">
                                                ✅ 뇌신경 오답 처방이 저장되었습니다! 다음 모평 변형 문항 대비에 활용해 보세요.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* [방법 8] 시각 터널링 & 모노태스킹 블랙아웃 */}
                                {activeProtocolTab === 'p8' && (
                                    <div className="space-y-3.5 animate-in fade-in duration-200">
                                        <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-300 dark:border-zinc-700 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                                            <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1 text-xs">
                                                <EyeOff className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                                                <span>뇌과학적 원리: 시각 주의 분산 줄이기</span>
                                            </span>
                                            <p className="leading-snug">
                                                뇌 정보 수용의 상당 부분은 시각을 거칩니다. 책상 주변 물건과 잡다한 화면 메뉴는 무의식적 시선 분산을 유발할 수 있습니다. 화면과 책상을 정리하면 몰입에 도움이 될 수 있습니다.
                                            </p>
                                        </div>

                                        <div className="p-4 bg-slate-950 text-white rounded-2xl border border-slate-800 space-y-3">
                                            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                                                <span className="text-xs font-black text-slate-200 flex items-center gap-1">
                                                    <span>🌑 [블랙아웃 Zen 모노태스킹 모드]</span>
                                                </span>
                                                <span className="text-[10px] text-emerald-400 font-mono">시각 노이즈 줄이기</span>
                                            </div>

                                            <label className="flex items-center gap-2 p-2.5 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer text-xs">
                                                <input
                                                    type="checkbox"
                                                    checked={blackoutDeskChecked}
                                                    onChange={(e) => setBlackoutDeskChecked(e.target.checked)}
                                                    className="accent-purple-500 rounded w-4 h-4"
                                                />
                                                <span className="text-slate-300 font-bold">
                                                    책상 위에는 오직 지금 풀 1문제와 샤프 1자루 외에 모두 바닥으로 내렸습니다.
                                                </span>
                                            </label>

                                            <div className="text-center py-2">
                                                <div className="text-4xl font-black font-mono tracking-widest text-slate-100">
                                                    {String(Math.floor(blackoutTimer / 60)).padStart(2, '0')}:{String(blackoutTimer % 60).padStart(2, '0')}
                                                </div>
                                                <span className="text-[10px] text-slate-400 mt-1 block">모노태스킹 25분 단일 문제 사유</span>
                                            </div>

                                            <div>
                                                <span className="text-[11px] text-slate-400 block mb-1">
                                                    지금 풀고 있는 문제의 단 1가지 핵심 발상:
                                                </span>
                                                <input
                                                    type="text"
                                                    value={blackoutConcept}
                                                    onChange={(e) => setBlackoutConcept(e.target.value)}
                                                    placeholder="예: x=2에서 미분계수가 0이라는 점을 그래프 접선으로 해석"
                                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                                                />
                                            </div>

                                            <div className="flex items-center justify-center gap-2 pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => { if (!isBlackoutRunning && blackoutTimer <= 0) setBlackoutTimer(25 * 60); setIsBlackoutRunning(!isBlackoutRunning); }}
                                                    className={`flex-1 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
                                                        isBlackoutRunning ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-950 hover:bg-white'
                                                    }`}
                                                >
                                                    {isBlackoutRunning ? '일시정지' : '🌑 시각 터널링 시작 (25분 집중)'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => { setIsBlackoutRunning(false); setBlackoutTimer(25 * 60); }}
                                                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* [방법 9] 울트라디안 90분 피크-딥 과목 매칭 */}
                                {activeProtocolTab === 'p9' && (
                                    <div className="space-y-3.5 animate-in fade-in duration-200">
                                        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                                            <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1 text-xs">
                                                <Zap className="w-3.5 h-3.5 text-amber-600" />
                                                <span>뇌과학적 원리: 뇌의 90분 생체 바이오리듬 '울트라디안(Ultradian Rhythm)'</span>
                                            </span>
                                            <p className="leading-snug">
                                                뇌는 90분 집중 후 20분의 회복이 필수적입니다. 전두엽 에너지가 바닥난 Dip 구간에 킬러를 풀면 좌절감만 쌓입니다. 바이오리듬에 맞추어 과목을 스위칭합니다.
                                            </p>
                                        </div>

                                        <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                                            <div className="flex items-center justify-between">
                                                <span className="font-black text-slate-800 dark:text-slate-200">
                                                    나의 크로노타입(생체 리듬) 선택:
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setChronotype('LARK')}
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                                            chronotype === 'LARK' ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                                                        }`}
                                                    >
                                                        🌅 아침형 (Lark)
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setChronotype('OWL')}
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                                            chronotype === 'OWL' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                                                        }`}
                                                    >
                                                        🦉 올빼미형 (Owl)
                                                    </button>
                                                </div>
                                            </div>

                                            {/* 피크-딥 시간표 시각화 */}
                                            <div className="space-y-1.5 pt-1">
                                                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                                                    <div>
                                                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300 block">🚀 Peak 1 (전두엽 최상 집중 구간)</span>
                                                        <span className="font-black text-slate-800 dark:text-slate-100 text-xs">
                                                            {chronotype === 'LARK' ? '09:00 ~ 10:30' : '10:30 ~ 12:00'} : 수학 킬러 / 국어 고난도 독서
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">인지부하 100%</span>
                                                </div>

                                                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                                                    <div>
                                                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block">☕ Dip 1 (아데노신 누적 저하 구간)</span>
                                                        <span className="font-black text-slate-800 dark:text-slate-100 text-xs">
                                                            {chronotype === 'LARK' ? '13:30 ~ 14:00' : '14:30 ~ 15:00'} : 20분 커피 냅 &amp; 영단어 리스닝
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-bold">뇌 리프레시</span>
                                                </div>

                                                <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 flex items-center justify-between">
                                                    <div>
                                                        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-300 block">🚀 Peak 2 (오후 2차 각성 구간)</span>
                                                        <span className="font-black text-slate-800 dark:text-slate-100 text-xs">
                                                            {chronotype === 'LARK' ? '14:30 ~ 16:30' : '16:00 ~ 18:00'} : 과탐/사탐 킬러 기출 심층 분석
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-bold">LTP 시냅스</span>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setIsUltradianApplied(true)}
                                                disabled={isUltradianApplied}
                                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/60 disabled:text-indigo-300 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer disabled:cursor-default"
                                            >
                                                <Zap className="w-3.5 h-3.5" />
                                                <span>{isUltradianApplied ? `✓ 울트라디안 리듬 적용됨 (${chronotype === 'LARK' ? '아침형' : '올빼미형'})` : '⚡ 내 하루 공부 계획에 울트라디안 리듬 즉시 동조하기'}</span>
                                            </button>
                                            {isUltradianApplied && (
                                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                                    적용 상태가 저장되었습니다. 휴식 주기를 지키면 집중 유지에 도움이 될 수 있습니다.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* [방법 10] 취침 직전 15분 해마 수면 고착 */}
                                {activeProtocolTab === 'p10' && (
                                    <div className="space-y-3.5 animate-in fade-in duration-200">
                                        <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                                            <span className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1 text-xs">
                                                <Moon className="w-3.5 h-3.5 text-purple-600" />
                                                <span>뇌과학적 원리: 서파 수면(SWS) 중 해마 ➡️ 대뇌피질 기억 전이(Consolidation)</span>
                                            </span>
                                            <p className="leading-snug">
                                                낮 동안 공부한 지식은 잠자는 동안 장기기억으로 정리될 수 있습니다. 취침 직전 스마트폰 사용을 줄이면 다음 날 기억 인출에 도움이 될 수 있습니다.
                                            </p>
                                        </div>

                                        <div className="p-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white rounded-2xl border border-indigo-700/50 space-y-3">
                                            <div className="flex items-center justify-between pb-2 border-b border-indigo-800/60 text-xs">
                                                <span className="font-black text-indigo-200 flex items-center gap-1">
                                                    <span>🌙 [취침 직전 15분 골든 리플레이 큐]</span>
                                                </span>
                                                <span className="text-[10px] text-indigo-400 font-mono">오늘의 오답 리플레이</span>
                                            </div>

                                            {/* 리플레이 슬라이드 카드 (저장된 오답노트 기반, 없으면 일반 가이드) */}
                                            <div className="p-3.5 bg-indigo-900/40 rounded-xl border border-indigo-500/30 text-xs space-y-2">
                                                <span className="text-[10px] text-indigo-300 font-bold block">
                                                    {replayNotes.length > 0
                                                        ? `오늘 기록된 오답 리플레이 (${replayCardIndex + 1}/${replayNotes.length}):`
                                                        : '기본 리플레이 가이드:'}
                                                </span>
                                                <div className="font-bold text-sm text-amber-200 leading-snug">
                                                    {replayNotes.length > 0 ? (
                                                        <>📌 {replayNotes[replayCardIndex % replayNotes.length].title}: "{replayNotes[replayCardIndex % replayNotes.length].text}"</>
                                                    ) : (
                                                        <>📌 오늘 배운 내용 중 가장 어려웠던 1개념을 떠올려보세요: "핵심 조건 3가지를 말로 설명할 수 있는가?"</>
                                                    )}
                                                </div>
                                                {replayNotes.length > 1 && (
                                                    <div className="flex items-center justify-between pt-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => setReplayCardIndex(prev => (prev > 0 ? prev - 1 : replayNotes.length - 1))}
                                                            className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] text-slate-300 cursor-pointer"
                                                        >
                                                            ◀ 이전 카드
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setReplayCardIndex(prev => (prev < replayNotes.length - 1 ? prev + 1 : 0))}
                                                            className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] text-slate-300 cursor-pointer"
                                                        >
                                                            다음 카드 ▶
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <label className="flex items-center gap-2 p-2.5 bg-black/40 rounded-xl border border-indigo-500/30 cursor-pointer text-xs">
                                                <input
                                                    type="checkbox"
                                                    checked={sleepPledgeChecked}
                                                    onChange={(e) => setSleepPledgeChecked(e.target.checked)}
                                                    className="accent-indigo-500 rounded w-4 h-4"
                                                />
                                                <span className="text-slate-200 font-bold">
                                                    취침 직전 스마트폰 SNS 절대 금지 서약 (블루라이트 차단 완료)
                                                </span>
                                            </label>

                                            <button
                                                type="button"
                                                onClick={() => setSleepReplayActive(true)}
                                                className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
                                            >
                                                <Moon className="w-3.5 h-3.5" />
                                                <span>🌙 15분 수면 기억 고착 모드 가동</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* [p10] 수면 리플레이 오버레이 (화면을 덮고 오늘 오답 1장씩 복습) */}
                                {sleepReplayActive && (
                                    <div className="print:hidden fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
                                        <div className="w-full max-w-md bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/40 rounded-3xl p-6 text-white space-y-4 shadow-2xl">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-black text-indigo-200">🌙 수면 리플레이 진행 중</span>
                                                <span className="text-indigo-400 font-mono">
                                                    {replayNotes.length > 0 ? `${(replayCardIndex % replayNotes.length) + 1}/${replayNotes.length}` : '가이드'}
                                                </span>
                                            </div>
                                            <div className="p-4 bg-indigo-900/40 rounded-2xl border border-indigo-500/30 space-y-2">
                                                <div className="font-bold text-sm text-amber-200 leading-snug">
                                                    {replayNotes.length > 0 ? (
                                                        <>📌 {replayNotes[replayCardIndex % replayNotes.length].title}</>
                                                    ) : (
                                                        <>📌 오늘 가장 어려웠던 1개념을 떠올려보세요</>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-200 leading-relaxed">
                                                    {replayNotes.length > 0
                                                        ? `"${replayNotes[replayCardIndex % replayNotes.length].text}"`
                                                        : '"핵심 조건 3가지를 말로 설명할 수 있는가?"'}
                                                </p>
                                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                                    화면을 보지 말고 눈을 감고 1분간 떠올려 보세요.
                                                </p>
                                            </div>
                                            {replayNotes.length > 1 && (
                                                <div className="flex items-center justify-between">
                                                    <button
                                                        type="button"
                                                        onClick={() => setReplayCardIndex(prev => (prev > 0 ? prev - 1 : replayNotes.length - 1))}
                                                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs text-slate-200 cursor-pointer"
                                                    >
                                                        ◀ 이전 카드
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setReplayCardIndex(prev => (prev < replayNotes.length - 1 ? prev + 1 : 0))}
                                                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs text-slate-200 cursor-pointer"
                                                    >
                                                        다음 카드 ▶
                                                    </button>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSleepPledgeChecked(true);
                                                        setSleepReplayActive(false);
                                                        pushToast('🌙 오늘의 수면 리플레이를 마쳤습니다. 편안한 밤 되세요.');
                                                    }}
                                                    className="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-black rounded-xl text-xs cursor-pointer"
                                                >
                                                    복습 완료
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setSleepReplayActive(false)}
                                                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                                                >
                                                    나중에
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Check Success Button */}
                                {!todayCompleted ? (
                                    <button
                                        type="button"
                                        onClick={handleSuccessCheck}
                                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition cursor-pointer"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>오늘 10대 뇌신경 행동 교정 마스터 완수! (도파민 보상 &amp; 학부모 안심 리포트)</span>
                                    </button>
                                ) : (
                                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-center text-xs font-bold text-emerald-800 dark:text-emerald-300">
                                        🎉 오늘 10대 뇌신경 행동 교정을 목표로 달성했습니다! 학부모 안심 리포트가 전송되었습니다.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-6 bg-gradient-to-br from-slate-900 to-purple-950 rounded-2xl text-white text-center space-y-4">
                                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center mx-auto text-xl border border-purple-400/30">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-base font-black text-purple-200">
                                        5대 뇌신경 행동 교정 스위트 잠금
                                    </h4>
                                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                        물리 차단, IF-THEN 조건반사, 60초 파인만 인출기, 3분 생리학적 한숨, 3색 오답 분해기 등 전두엽을 개조하는 5대 실전 교정기는 <strong>PREMIUM 등급 전용</strong>입니다.
                                    </p>
                                </div>
                                {onUpgradeClick && (
                                    <button
                                        onClick={onUpgradeClick}
                                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-black text-xs rounded-xl shadow-md transition active:scale-95 cursor-pointer"
                                    >
                                        정기결제(월 ₩19,900)로 5대 행동 교정기 풀버전 열기
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. 📄 나쁜 습관 뇌과학 정밀 진단 소견서 전용 모달 (독립 리포트 창) */}
            {showReportModal && (
                <div className="habit-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div id="habit-printable-report" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full max-w-4xl max-h-[92vh] rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
                        {/* Modal Header Bar */}
                        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                                    <Brain className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 block">
                                        NBASS Cognitive & Behavioral Clinic
                                    </span>
                                    <h3 className="text-base sm:text-lg font-black text-white">
                                        수험생 나쁜 공부습관 뇌과학 정밀 진단 소견서
                                    </h3>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 habit-print-hidden">
                                <button
                                    onClick={handlePrintReport}
                                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                                    title="인쇄 또는 PDF 저장"
                                >
                                    <Printer className="w-4 h-4" />
                                    <span className="hidden sm:inline">소견서 인쇄/PDF</span>
                                </button>
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="p-2 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
                                    aria-label="닫기"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body: Scrollable Report Paper */}
                        <div className="habit-modal-scrollable p-6 sm:p-8 overflow-y-auto space-y-6 text-sm">
                            {/* Paper Meta Strip */}
                            <div className="habit-print-avoid-break p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4 text-xs">
                                <div>
                                    <span className="text-slate-400 block font-bold text-[10px]">수험생 성명 / ID</span>
                                    <span className="font-black text-slate-800 dark:text-white text-sm">
                                        {student?.name || '익명 수험생'} <span className="text-xs text-slate-400 font-normal">({student?.id || 'NBASS-2026-ST01'})</span>
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block font-bold text-[10px]">진단 발급 일시</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-300">
                                        {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block font-bold text-[10px]">진단 고유 등록번호</span>
                                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                        DOC-2026-HB8821
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block font-bold text-[10px]">열람 등급</span>
                                    <span className="font-black uppercase px-2.5 py-0.5 rounded-full text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300">
                                        {tier.toUpperCase()} TIER
                                    </span>
                                </div>
                            </div>

                            {/* Shock Summary Metrics Box */}
                            <div className="habit-print-avoid-break bg-gradient-to-br from-rose-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-7 rounded-3xl border border-rose-800/40 shadow-xl space-y-4">
                                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                    <div className="flex items-center gap-2">
                                        <AlertOctagon className="w-5 h-5 text-rose-400" />
                                        <h4 className="font-black text-base text-rose-300">
                                            ⚠️ 팩트 폭행: 진단된 하루 '가짜 공부' 시간 누적 피해
                                        </h4>
                                    </div>
                                    <span className="text-xs text-amber-300 font-bold bg-white/10 px-2.5 py-1 rounded-full">
                                        집중력 임계치 붕괴 경고
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <span className="text-xs text-slate-300 block">하루 낭비 시간</span>
                                        <span className="text-3xl font-black text-rose-400 font-mono mt-1 block">
                                            {totalWastedMinutes}분
                                        </span>
                                        <span className="text-[10px] text-slate-400">공부 중 딴짓/가짜공부</span>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <span className="text-xs text-slate-300 block">30일 누적 유실</span>
                                        <span className="text-3xl font-black text-amber-400 font-mono mt-1 block">
                                            약 {Math.round((totalWastedMinutes * 30) / 60)}시간
                                        </span>
                                        <span className="text-[10px] text-slate-400">한 달에 3~4일치 순공 증발</span>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <span className="text-xs text-slate-300 block">수능 예측 등급 손실</span>
                                        <span className="text-3xl font-black text-red-500 font-mono mt-1 block">
                                            하락 위험
                                        </span>
                                        <span className="text-[10px] text-slate-400">교정 실천으로 개선 기대</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                    ※ 낭비 시간은 선택한 습관의 추정치이며, 등급 영향은 개인차가 있습니다.
                                </p>
                            </div>

                            {/* PREMIUM 전용 심층 뇌과학 원인 및 습관별 상세 진단서 */}
                            {isPremiumOrAbove ? (
                                <div className="space-y-6">
                                    {/* 12대 Care Type 신경계 연계 분석 */}
                                    <div className="habit-print-avoid-break p-5 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-800 space-y-2">
                                        <div className="flex items-center gap-2 font-black text-indigo-950 dark:text-indigo-200 text-sm">
                                            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                            <span>12대 Care Type 신경계 메커니즘 연계 정밀 분석</span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                            현재 수험생의 신경계는 <strong>[두뇌 피로형 &amp; 도파민 갈망 루프]</strong>에 진입해 있을 수 있습니다.
                                            주의 자원이 고갈되면, 뇌는 사고의 고통을 피하려는 방어 기제로
                                            <strong>"즉각적인 답지 열람"</strong>이나 <strong>"책상 정리 회피"</strong>, <strong>"숏폼·음악 멀티태스킹"</strong>을 택할 수 있습니다.
                                            이는 단순한 의지 부족이 아닌 <strong>신체·인지 피로 신호일 수 있습니다.</strong>
                                        </p>
                                    </div>

                                    {/* 체크된 각 나쁜 습관별 정밀 진단서 카드 */}
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                                            <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                                                <FileText className="w-4 h-4 text-rose-500" />
                                                <span>진단된 나쁜 공부습관별 뇌과학 소견 및 긴급 처방 (Rx)</span>
                                            </h4>
                                            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 w-fit">
                                                💎 PREMIUM 이상 열람
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
                                            ※ 인용 연구는 해당 현상에 대한 일반적 학술 배경이며, 본 프로그램의 효과를 직접 검증한 것은 아닙니다. 뇌과학 소견은 가능성 설명으로 받아들여 주세요.
                                        </p>

                                        {isPremiumOrAbove ? (
                                            <div className="space-y-3.5">
                                                {checkedIds.map(id => {
                                                    const habit = BAD_HABITS_LIST.find(h => h.id === id);
                                                    if (!habit) return null;
                                                    return (
                                                        <div
                                                            key={habit.id}
                                                            className="habit-print-avoid-break p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs"
                                                        >
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div>
                                                                    <span className="text-[10px] font-black text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-2.5 py-0.5 rounded-md">
                                                                        {habit.category}
                                                                    </span>
                                                                    <h5 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mt-1.5">
                                                                        {habit.title}
                                                                    </h5>
                                                                </div>
                                                                <span className="text-xs font-black text-rose-600 dark:text-rose-400 font-mono shrink-0 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-rose-200 dark:border-rose-900/50">
                                                                    일일 -{habit.wastedMinutesPerDay}분 손실
                                                                </span>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                                                                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-2">
                                                                    <div>
                                                                        <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mb-1.5">
                                                                            <span>🧠</span>
                                                                            <span>뇌과학적 원인</span>
                                                                        </span>
                                                                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                                                                            {habit.brainCause}
                                                                        </p>
                                                                        {(HABIT_SCIENCE_SOURCES[habit.id]?.length ?? 0) > 0 && (
                                                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed mt-1.5">
                                                                                📚 관련 대표 연구: {HABIT_SCIENCE_SOURCES[habit.id].join(' · ')}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-2.5">
                                                                    <div>
                                                                        <span className="text-[11px] font-black text-rose-600 dark:text-rose-400 flex items-center gap-1 mb-1.5">
                                                                            <span>⚡</span>
                                                                            <span>수능/성적 악영향</span>
                                                                        </span>
                                                                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                                                                            {habit.impact}
                                                                        </p>
                                                                    </div>
                                                                    {habit.expectedScoreBoost && (
                                                                        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl">
                                                                            <span className="text-[10px] font-black text-amber-800 dark:text-amber-300 block mb-0.5">
                                                                                🎯 교정 시 기대 성적 향상
                                                                            </span>
                                                                            <p className="text-xs font-black text-amber-950 dark:text-amber-100 leading-snug">
                                                                                {habit.expectedScoreBoost}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/50 flex flex-col justify-between space-y-2">
                                                                    <div>
                                                                        <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mb-1.5">
                                                                            <span>💊</span>
                                                                            <span>임상 교정 처방 (Rx)</span>
                                                                        </span>
                                                                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px] font-medium">
                                                                            {habit.prescription}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            /* PLUS+ 전용 잠금 안내 및 4대 킬러 기능 & 종합 시스템 소개 */
                                            <div className="space-y-4">
                                                <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-2xl relative overflow-hidden space-y-6">
                                                    <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 text-purple-300 flex items-center justify-center text-xl shrink-0">
                                                                <Lock className="w-6 h-6" />
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 block">
                                                                    SUBSCRIBER EXCLUSIVE
                                                                </span>
                                                                <h4 className="text-base sm:text-lg font-black text-white">
                                                                    진단된 나쁜 공부습관별 뇌과학 소견 및 긴급 처방 (Rx)은 정기결제 회원 전용입니다
                                                                </h4>
                                                            </div>
                                                        </div>
                                                        <span className="px-3 py-1 bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-xs font-black rounded-full w-fit">
                                                            월 ₩19,900
                                                        </span>
                                                    </div>

                                                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                                                        수험생의 나쁜 공부습관은 단순한 의지력 문제가 아닌 <strong>전두엽 피질(DLPFC) 글루코스 고갈</strong> 및 <strong>도파민 보상 회로 왜곡</strong>에서 비롯됩니다.
                                                        <strong> 정기결제</strong> 회원으로 등록하시면 신경회로를 재건축하는 정밀 소견서와 함께 학원·과외가 해결하지 못하는 <strong>4대 킬러 인터랙티브 교정 시스템</strong>이 즉시 활성화됩니다.
                                                    </p>

                                                    {/* PLUS+ 4대 킬러 기능 안내 카드 */}
                                                    <div className="space-y-2.5">
                                                        <span className="text-xs font-black text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                                                            <Sparkles className="w-3.5 h-3.5" />
                                                            <span>PREMIUM 전용 4대 킬러 인터랙티브 기능</span>
                                                        </span>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                                            <div className="p-4 bg-white/5 hover:bg-white/10 transition rounded-2xl border border-white/10 space-y-1.5">
                                                                <div className="flex items-center gap-2 font-black text-purple-300">
                                                                    <span>🧠</span>
                                                                    <span>1. 12대 습관별 심층 뇌과학 소견서 &amp; 긴급 처방전 (Rx) 발급</span>
                                                                </div>
                                                                <p className="text-[11px] text-slate-300 leading-relaxed">
                                                                    습관별 병인 기제 해설, 수능 등급 악영향 및 <strong>🎯 교정 시 기대 점수 상승치(+8~15점)</strong>, 실전 행동 수칙을 담은 평생 소장용 A4 리포트 무제한 인쇄/PDF 다운로드.
                                                                </p>
                                                            </div>

                                                            <div className="p-4 bg-white/5 hover:bg-white/10 transition rounded-2xl border border-white/10 space-y-1.5">
                                                                <div className="flex items-center gap-2 font-black text-amber-300">
                                                                    <span>🎯</span>
                                                                    <span>2. 실전 3단계 행동 교정기 (3-Stage Action Corrector)</span>
                                                                </div>
                                                                <p className="text-[11px] text-slate-300 leading-relaxed">
                                                                    ①오늘 봉인할 습관 1개 선언 ➡️ ②답지 3m 격리 및 3단계 점진적 힌트 오픈 룰 ➡️ ③타이머 연동으로 가짜 공부(Fake Study) 원천 박멸.
                                                                </p>
                                                            </div>

                                                            <div className="p-4 bg-white/5 hover:bg-white/10 transition rounded-2xl border border-white/10 space-y-1.5">
                                                                <div className="flex items-center gap-2 font-black text-emerald-300">
                                                                    <span>⏱️</span>
                                                                    <span>3. 골든 서카디안 뽀모도로 타이머</span>
                                                                </div>
                                                                <p className="text-[11px] text-slate-300 leading-relaxed">
                                                                    두뇌 피로도를 고려하여 25분 초집중 + 5분 회복 세션을 운용하며 공부 페이스 유지에 도움을 줍니다.
                                                                </p>
                                                            </div>

                                                            <div className="p-4 bg-white/5 hover:bg-white/10 transition rounded-2xl border border-white/10 space-y-1.5">
                                                                <div className="flex items-center gap-2 font-black text-rose-300">
                                                                    <span>📈</span>
                                                                    <span>4. 연속 습관 봉인 스트릭(Streak) &amp; 학부모 안심 리포트</span>
                                                                </div>
                                                                <p className="text-[11px] text-slate-300 leading-relaxed">
                                                                    매일 성공 여부를 기록하여 연속 성공 보상을 지급하고, 유실된 순공 시간 회복률 및 취약 습관 교정 추이를 학부모 전용 리포트로 공유.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 기타 시스템 연계 기능 소개 */}
                                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                                                        <div className="flex items-center gap-2">
                                                            <span className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg font-bold text-[11px]">시스템 연동</span>
                                                            <span className="text-slate-300 text-[11px]">
                                                                ☕ <strong>수험생 맞춤 영양 솔루션</strong> (HL 커피 &amp; 뉴트리션 처방) 및 📊 <strong>12대 Care Type 신경계 종합진단 파이프라인</strong> 무제한 자동 연계
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] text-amber-300 font-bold bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
                                                            모바일 앱 &amp; PC 100% 동기화
                                                        </span>
                                                    </div>

                                                    {onUpgradeClick && (
                                                        <button
                                                            onClick={() => { setShowReportModal(false); onUpgradeClick(); }}
                                                            className="w-full py-4 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 hover:from-purple-400 hover:to-indigo-400 text-white font-black text-sm rounded-2xl shadow-xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                                                        >
                                                            <Sparkles className="w-4 h-4" />
                                                            <span>정기결제(월 ₩19,900)로 긴급 처방(Rx) 및 4대 킬러 기능 풀버전 열기</span>
                                                            <ArrowRight className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* 미리보기 블러 티저 카드: 사용자가 선택한 습관이 이미 정밀 진단되었음을 보여줌 */}
                                                <div className="space-y-2 opacity-60 select-none pointer-events-none">
                                                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                                                        🔒 진단된 습관 처방전 미리보기 (정기결제 구독 즉시 잠금 해제):
                                                    </span>
                                                    {checkedIds.slice(0, 2).map(id => {
                                                        const h = BAD_HABITS_LIST.find(item => item.id === id);
                                                        if (!h) return null;
                                                        return (
                                                            <div key={h.id} className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 filter blur-[2px]">
                                                                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                                                                    <span>🚫 {h.title}</span>
                                                                    <span className="text-rose-500">-{h.wastedMinutesPerDay}분/일</span>
                                                                </div>
                                                                <div className="mt-2 text-[10px] text-slate-400">
                                                                    [뇌과학적 원인 및 임상 긴급 처방(Rx) 3단계 프로토콜 암호화 보관 중]
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {/* Modal Footer Actions (인쇄 시 완벽 숨김) */}
                        <div className="habit-print-hidden px-6 py-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                            <span className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
                                💡 진단 리포트를 확인한 뒤 실전 교정 타이머(PLUS+)로 습관을 봉인하세요.
                            </span>
                            <div className="flex items-center gap-2.5 w-full sm:w-auto">
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition cursor-pointer"
                                >
                                    닫기
                                </button>
                                {isPremiumOrAbove ? (
                                    <button
                                        onClick={() => {
                                            setShowReportModal(false);
                                            window.scrollTo({ top: 300, behavior: 'smooth' });
                                        }}
                                        className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-black rounded-xl text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <Flame className="w-3.5 h-3.5" />
                                        <span>3단계 실전 교정 시작하기</span>
                                    </button>
                                ) : (
                                    onUpgradeClick && (
                                        <button
                                            onClick={() => { setShowReportModal(false); onUpgradeClick(); }}
                                            className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-black rounded-xl text-xs shadow-md transition active:scale-95 cursor-pointer"
                                        >
                                            PLUS+ 실전 교정기 열기
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
