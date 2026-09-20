/**
 * 동기화 충돌 해결 정책 (P2-14)
 *
 * - 로컬(IndexedDB/localStorage)과 원격(Supabase) 데이터가 모두 있을 때,
 *   수정 시각(updatedAt)을 기준으로 승자를 결정하고 병합 필요 여부를 반환합니다.
 * - 순수 로직으로 분리하여 화면 밖에서도 정책을 테스트/재사용할 수 있습니다.
 */

export type ConflictResolution = 'local-wins' | 'remote-wins' | 'merge-required';

export interface ConflictDecision<T> {
    resolution: ConflictResolution;
    winner?: 'local' | 'remote';
    chosen?: T;
    reason: string;
}

export const resolveConflict = <T extends { updatedAt?: string }>(
    local: T | null | undefined,
    remote: T | null | undefined,
): ConflictDecision<T> => {
    if (!local && !remote) {
        return { resolution: 'merge-required', reason: '양쪽 모두 데이터가 없습니다.' };
    }
    if (!local) {
        return { resolution: 'remote-wins', winner: 'remote', chosen: remote as T, reason: '로컬 데이터가 없어 원격을 채택합니다.' };
    }
    if (!remote) {
        return { resolution: 'local-wins', winner: 'local', chosen: local, reason: '원격 데이터가 없어 로컬을 채택합니다.' };
    }

    const localTime = Date.parse(local.updatedAt || '') || 0;
    const remoteTime = Date.parse(remote.updatedAt || '') || 0;

    if (localTime === remoteTime) {
        return { resolution: 'merge-required', reason: '수정 시각이 동일하여 병합(사용자 확인)이 필요합니다.' };
    }

    return localTime > remoteTime
        ? { resolution: 'local-wins', winner: 'local', chosen: local, reason: '로컬 데이터가 더 최신입니다.' }
        : { resolution: 'remote-wins', winner: 'remote', chosen: remote, reason: '원격 데이터가 더 최신입니다.' };
};