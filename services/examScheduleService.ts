/**
 * 시험일 기반 D-주간 알림 스케줄링 서비스
 *
 * - 학부모 모드에서 입력한 시험일을 기준으로 케어 마일스톤 생성
 * - 앱 실행 시 오늘 해당하는 마일스톤을 확인하고 알림 큐에 추가
 * - 카카오톡 실제 발송은 추후 kakaoNotificationService 연동 지점을 준비
 *
 * 저장 위치: localStorage (nbass_exam_schedules)
 */

export interface ExamSchedule {
    id: string;
    childName: string;
    childGrade: string;
    examDate: string; // YYYY-MM-DD
    kakaoOptIn: boolean;
    createdAt: string;
    /** 이미 발송(표시)된 마일스톤 키 목록 */
    firedMilestones: string[];
}

export interface ExamMilestone {
    key: string;
    daysBefore: number;
    title: string;
    message: string;
    action: string;
}

const SCHEDULES_KEY = 'nbass_exam_schedules';

/** 시험 D-day 카운트 기반 케어 마일스톤 정의 */
export const EXAM_MILESTONES: ExamMilestone[] = [
    {
        key: 'd21',
        daysBefore: 21,
        title: '시험 D-21: 수면 리듬 조정 시작',
        message: '시험 3주 전입니다. 이 시점부터 취침 시간을 15분씩 앞당겨 시험 당일 컨디션을 만들어두는 것이 가장 효과적입니다.',
        action: '수면 루틴 점검하기',
    },
    {
        key: 'd14',
        daysBefore: 14,
        title: '시험 D-14: 컨디션 재진단 권장',
        message: '시험 2주 전입니다. 최근 2주간 학습 컨디션이 어떻게 변했는지 재진단으로 확인하고, 약해진 영역의 케어를 강화하세요.',
        action: '재진단 시작하기',
    },
    {
        key: 'd7',
        daysBefore: 7,
        title: '시험 D-7: 마지막 주 컨디션 관리',
        message: '시험 1주 전입니다. 이 시기에는 새로운 공부법보다 수면·식사 루틴 유지가 성적에 더 큰 영향을 줍니다. 카페인은 오후 2시 이후 금지를 권합니다.',
        action: '시험 주간 케어 가이드 보기',
    },
    {
        key: 'd3',
        daysBefore: 3,
        title: '시험 D-3: 불안 관리 집중 구간',
        message: '시험 3일 전입니다. 벼락치기보다 4-7-8 호흡법(4초 들이쉬고, 7초 참고, 8초 내쉬기)을 자기 전 5분씩 연습하면 시험 불안 완화에 도움이 됩니다.',
        action: '호흡 가이드 따라하기',
    },
    {
        key: 'd1',
        daysBefore: 1,
        title: '시험 D-1: 오늘은 컨디션이 우선',
        message: '내일이 시험입니다. 오늘은 늦게까지 공부하는 것보다 평소보다 30분 일찍 자는 것이 내일 집중력에 더 유리합니다.',
        action: '오늘의 루틴 확인',
    },
];

export const ExamScheduleService = {
    /** 시험 일정 등록 (학부모 모드 진단 완료 시 호출) */
    saveSchedule(schedule: Omit<ExamSchedule, 'createdAt' | 'firedMilestones' | 'id'>): void {
        try {
            const schedules = this.getAll();
            // 같은 자녀+시험일이면 갱신
            const existingKey = Object.keys(schedules).find(
                k => schedules[k].childName === schedule.childName && schedules[k].examDate === schedule.examDate
            );
            const id = existingKey || `exam_${Date.now()}`;
            schedules[id] = {
                ...schedule,
                id,
                createdAt: new Date().toISOString(),
                firedMilestones: existingKey ? schedules[existingKey].firedMilestones : [],
            };
            // 최대 100개 유지
            const keys = Object.keys(schedules);
            if (keys.length > 100) delete schedules[keys[0]];
            localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
        } catch (e) {
            console.error('Failed to save exam schedule:', e);
        }
    },

    getAll(): Record<string, ExamSchedule> {
        try {
            return JSON.parse(localStorage.getItem(SCHEDULES_KEY) || '{}');
        } catch {
            return {};
        }
    },

    /** 오늘 기준 시험까지 남은 일수 */
    daysUntil(examDate: string): number {
        try {
            const exam = new Date(examDate + 'T00:00:00');
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return Math.round((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        } catch {
            return -999;
        }
    },

    /**
     * 오늘 발생한(또는 놓친) 마일스톤 조회
     * - 아직 발송되지 않은 마일스톤 중, D-day가 지나지 않은 것
     */
    getDueMilestones(): { schedule: ExamSchedule; milestone: ExamMilestone; daysLeft: number }[] {
        const due: { schedule: ExamSchedule; milestone: ExamMilestone; daysLeft: number }[] = [];
        const all: Record<string, ExamSchedule> = this.getAll();
        for (const schedule of Object.values(all)) {
            const daysLeft = this.daysUntil(schedule.examDate);
            if (daysLeft < 0) continue; // 시험 지남
            for (const m of EXAM_MILESTONES) {
                const fired = schedule.firedMilestones.includes(m.key);
                // 마일스톤 시점에 도달했거나 지났지만 아직 발송 안 된 것
                if (!fired && daysLeft <= m.daysBefore) {
                    due.push({ schedule, milestone: m, daysLeft });
                }
            }
        }
        return due;
    },

    /** 마일스톤 발송 완료 표시 */
    markMilestoneFired(scheduleId: string, milestoneKey: string): void {
        try {
            const schedules = this.getAll();
            if (schedules[scheduleId]) {
                if (!schedules[scheduleId].firedMilestones.includes(milestoneKey)) {
                    schedules[scheduleId].firedMilestones.push(milestoneKey);
                }
                localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
            }
        } catch { }
    },

    /** 지난 시험 일정 정리 */
    cleanupExpired(): void {
        try {
            const schedules: Record<string, ExamSchedule> = this.getAll();
            for (const [id, s] of Object.entries(schedules)) {
                if (this.daysUntil(s.examDate) < -14) {
                    delete schedules[id];
                }
            }
            localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
        } catch { }
    },
};
