/**
 * LocalSyncService
 * 단일 PC, 다중 창(모니터) 간 동기화 서비스
 * - BroadcastChannel: 실시간 메시지 통신
 * - localStorage: 데이터 영속성 및 백업
 * 
 * 향후 ServerSyncService로 교체 시 이 파일만 교체하면 됨
 */

import {
    SyncService,
    SyncMessage,
    SyncMessageType,
    SessionState,
    StudentSurveyBundle,
    ProtocolBundle,
    AnalyticsBundle
} from './syncService';

// 스토리지 키 접두사
const STORAGE_PREFIX = 'sn1_sync_';
const SESSION_PREFIX = `${STORAGE_PREFIX}session_`;
const DATA_PREFIX = `${STORAGE_PREFIX}data_`;

class LocalSyncService implements SyncService {
    private channels: Map<string, BroadcastChannel> = new Map();
    private callbacks: Map<string, Set<(message: SyncMessage) => void>> = new Map();
    private connected: boolean = true;

    constructor() {
        // 페이지 언로드 시 정리
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', () => {
                this.cleanup();
            });
        }
    }

    // 유틸: UUID 생성
    private generateId(): string {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        // 폴백: 간단한 UUID 생성
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // 세션 생성 (관리자용)
    async createSession(studentId: string, studentName: string): Promise<string> {
        const sessionId = this.generateId();

        const sessionState: SessionState = {
            id: sessionId,
            studentId,
            studentName,
            status: 'pending',
            createdAt: Date.now(),
            currentStep: 'waiting'
        };

        // localStorage에 세션 저장
        localStorage.setItem(`${SESSION_PREFIX}${sessionId}`, JSON.stringify(sessionState));

        // BroadcastChannel 생성
        this.initChannel(sessionId);

        console.log(`[LocalSync] Session created: ${sessionId}`);
        return sessionId;
    }

    // 세션 참여 (학생용)
    async joinSession(sessionId: string): Promise<SessionState | null> {
        const stored = localStorage.getItem(`${SESSION_PREFIX}${sessionId}`);
        if (!stored) {
            console.warn(`[LocalSync] Session not found: ${sessionId}`);
            return null;
        }

        const session: SessionState = JSON.parse(stored);

        // 채널 연결
        this.initChannel(sessionId);

        // 상태 업데이트
        session.status = 'in_progress';
        session.currentStep = 'survey_bai';
        localStorage.setItem(`${SESSION_PREFIX}${sessionId}`, JSON.stringify(session));

        // 관리자에게 알림
        await this.send(sessionId, 'ADMIN_READY', { joined: true });

        console.log(`[LocalSync] Joined session: ${sessionId}`);
        return session;
    }

    // 세션 상태 조회
    getSessionState(sessionId: string): SessionState | null {
        const stored = localStorage.getItem(`${SESSION_PREFIX}${sessionId}`);
        return stored ? JSON.parse(stored) : null;
    }

    // 채널 초기화
    private initChannel(sessionId: string) {
        if (this.channels.has(sessionId)) return;

        const channel = new BroadcastChannel(`sn1_session_${sessionId}`);

        channel.onmessage = (event: MessageEvent<SyncMessage>) => {
            const message = event.data;
            console.log(`[LocalSync] Received:`, message.type, message.data);

            // 콜백 호출
            const cbs = this.callbacks.get(sessionId);
            if (cbs) {
                cbs.forEach(cb => cb(message));
            }

            // localStorage에 백업
            this.backupToStorage(sessionId, message);
        };

        this.channels.set(sessionId, channel);
    }

    // localStorage 백업
    private backupToStorage(sessionId: string, message: SyncMessage) {
        const key = `${DATA_PREFIX}${sessionId}_${message.type}`;
        localStorage.setItem(key, JSON.stringify(message));
    }

    // 저장된 데이터 조회
    getStoredData<T>(sessionId: string, type: SyncMessageType): T | null {
        const key = `${DATA_PREFIX}${sessionId}_${type}`;
        const stored = localStorage.getItem(key);
        if (!stored) return null;
        const message: SyncMessage<T> = JSON.parse(stored);
        return message.data;
    }

    // 메시지 전송
    async send<T>(sessionId: string, type: SyncMessageType, data: T): Promise<void> {
        const channel = this.channels.get(sessionId);
        if (!channel) {
            console.warn(`[LocalSync] No channel for session: ${sessionId}`);
            return;
        }

        const message: SyncMessage<T> = {
            type,
            data,
            timestamp: Date.now(),
            sessionId,
            sender: this.isAdminWindow() ? 'admin' : 'student'
        };

        channel.postMessage(message);

        // 자신의 localStorage에도 백업
        this.backupToStorage(sessionId, message);

        console.log(`[LocalSync] Sent:`, type, data);
    }

    // 메시지 구독
    subscribe(sessionId: string, callback: (message: SyncMessage) => void): () => void {
        if (!this.callbacks.has(sessionId)) {
            this.callbacks.set(sessionId, new Set());
        }

        this.callbacks.get(sessionId)!.add(callback);

        // 채널이 없으면 초기화
        if (!this.channels.has(sessionId)) {
            this.initChannel(sessionId);
        }

        // 구독 해제 함수 반환
        return () => {
            const cbs = this.callbacks.get(sessionId);
            if (cbs) {
                cbs.delete(callback);
            }
        };
    }

    // 세션 종료
    async closeSession(sessionId: string): Promise<void> {
        // 종료 메시지 전송
        await this.send(sessionId, 'SESSION_CLOSED', { closedAt: Date.now() });

        // 세션 상태 업데이트
        const session = this.getSessionState(sessionId);
        if (session) {
            session.status = 'completed';
            session.completedAt = Date.now();
            localStorage.setItem(`${SESSION_PREFIX}${sessionId}`, JSON.stringify(session));
        }

        // 채널 정리
        const channel = this.channels.get(sessionId);
        if (channel) {
            channel.close();
            this.channels.delete(sessionId);
        }

        this.callbacks.delete(sessionId);

        console.log(`[LocalSync] Session closed: ${sessionId}`);
    }

    // 연결 상태
    isConnected(): boolean {
        return this.connected;
    }

    // 관리자 창인지 확인 (URL 기반)
    private isAdminWindow(): boolean {
        if (typeof window === 'undefined') return true;
        return !window.location.pathname.includes('/student');
    }

    // 정리
    private cleanup() {
        this.channels.forEach((channel, id) => {
            channel.close();
        });
        this.channels.clear();
        this.callbacks.clear();
    }

    // 세션 데이터 전체 조회 (결과 생성용)
    getAllSessionData(sessionId: string): {
        survey?: StudentSurveyBundle;
        protocol?: ProtocolBundle;
        analytics?: AnalyticsBundle;
    } {
        return {
            survey: this.getStoredData(sessionId, 'STUDENT_COMPLETE') || undefined,
            protocol: this.getStoredData(sessionId, 'PROTOCOL_DATA') || undefined,
            analytics: this.getStoredData(sessionId, 'ANALYTICS_DATA') || undefined
        };
    }
}

// 싱글톤 인스턴스
let instance: LocalSyncService | null = null;

export const getLocalSyncService = (): LocalSyncService => {
    if (!instance) {
        instance = new LocalSyncService();
    }
    return instance;
};

export default LocalSyncService;
