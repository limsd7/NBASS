/**
 * AffiliatedAcademyService
 * ──────────────────────────────────────────────────────────────────
 * 오너(Owner)만 관리할 수 있는 제휴 학원/학교 목록 서비스
 *
 * 저장 전략 (이중화):
 *  1차: localStorage  → 즉시 반영, 오프라인/Supabase 미설정 시 fallback
 *  2차: Supabase DB   → isSupabaseConfigured 일 때 백그라운드 동기화
 *
 * Supabase 테이블 DDL (한 번만 실행):
 * ──────────────────────────────────────────────────────────────────
 * create table affiliated_academies (
 *   id          uuid primary key default gen_random_uuid(),
 *   name        text not null,
 *   region      text,
 *   added_by    uuid references auth.users(id),
 *   created_at  timestamptz not null default now(),
 *   updated_at  timestamptz not null default now()
 * );
 * alter table affiliated_academies enable row level security;
 * -- 오너만 insert/delete 가능, 모두 select 가능
 * create policy "public read" on affiliated_academies for select using (true);
 * create policy "owner write" on affiliated_academies for all
 *   using (auth.uid() = added_by)
 *   with check (auth.uid() = added_by);
 * ──────────────────────────────────────────────────────────────────
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LS_KEY = 'nbass_affiliated_academies';

export interface AffiliatedAcademy {
  id: string;
  name: string;
  region?: string;
  addedAt: string;       // ISO string (localStorage)
  addedBy?: string;      // owner user_id
}

// ─── localStorage 헬퍼 ──────────────────────────────────────────────

function lsGet(): AffiliatedAcademy[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as AffiliatedAcademy[]) : [];
  } catch {
    return [];
  }
}

function lsSet(list: AffiliatedAcademy[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

// ─── Supabase → localStorage 동기화 (읽기 방향) ─────────────────────

/** Supabase에서 최신 목록을 내려받아 localStorage에 덮어씁니다. */
async function syncFromSupabase(): Promise<AffiliatedAcademy[]> {
  if (!isSupabaseConfigured) return lsGet();
  try {
    const { data, error } = await (supabase.from('affiliated_academies' as any) as any)
      .select('*')
      .order('name', { ascending: true });

    if (error || !data) return lsGet();

    const mapped: AffiliatedAcademy[] = (data as any[]).map((row: any) => ({
      id: row.id,
      name: row.name,
      region: row.region ?? undefined,
      addedAt: row.created_at,
      addedBy: row.added_by ?? undefined,
    }));

    lsSet(mapped);
    return mapped;
  } catch {
    return lsGet();
  }
}

// ─── Public API ─────────────────────────────────────────────────────

export const AffiliatedAcademyService = {
  /**
   * 전체 제휴 학원 목록 조회 (동기 — localStorage 기반)
   * 화면 렌더링 시 즉시 사용.
   * 최신 데이터가 필요하면 fetchFromSupabase()를 별도 호출.
   */
  getAcademies(): AffiliatedAcademy[] {
    return lsGet();
  },

  /**
   * Supabase에서 최신 목록 fetch 후 localStorage 갱신 (비동기)
   * 컴포넌트 mount 시 useEffect에서 호출 권장.
   */
  async fetchFromSupabase(): Promise<AffiliatedAcademy[]> {
    return syncFromSupabase();
  },

  /**
   * 제휴 학원 추가 (오너 전용)
   * localStorage에 즉시 반영 + Supabase에 백그라운드 upsert
   */
  async addAcademy(name: string, region?: string): Promise<AffiliatedAcademy> {
    const localId = `academy_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const newEntry: AffiliatedAcademy = {
      id: localId,
      name: name.trim(),
      region: region?.trim(),
      addedAt: now,
    };

    // 1) localStorage 즉시 저장
    const list = lsGet();
    list.push(newEntry);
    lsSet(list);

    // 2) Supabase 백그라운드 저장
    if (isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await (supabase.from('affiliated_academies' as any) as any)
          .insert({
            name: name.trim(),
            region: region?.trim() ?? null,
            added_by: user?.id ?? null,
          })
          .select()
          .single();

        if (!error && data) {
          const row = data as any;
          // Supabase가 발급한 UUID로 localStorage id를 교체
          const updated = lsGet().map(a =>
            a.id === localId
              ? { ...a, id: row.id, addedAt: row.created_at }
              : a
          );
          lsSet(updated);
          return { ...newEntry, id: row.id, addedAt: row.created_at };
        }
      } catch {
        // Supabase 실패 시 localStorage 결과만 반환
      }
    }

    return newEntry;
  },

  /**
   * 제휴 학원 삭제 (오너 전용)
   * localStorage에서 즉시 제거 + Supabase 백그라운드 삭제
   */
  async removeAcademy(id: string): Promise<void> {
    // 1) localStorage 즉시 삭제
    lsSet(lsGet().filter(a => a.id !== id));

    // 2) Supabase 백그라운드 삭제
    if (isSupabaseConfigured) {
      try {
        await (supabase.from('affiliated_academies' as any) as any).delete().eq('id', id);
      } catch {
        // 실패 시 무시 (localStorage는 이미 삭제됨)
      }
    }
  },

  /** 이름으로 중복 여부 확인 */
  exists(name: string): boolean {
    return lsGet().some(
      a => a.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
  },

  /** 드롭다운용 이름 목록 (가나다 정렬) */
  getNames(): string[] {
    return lsGet()
      .map(a => a.name)
      .sort((a, b) => a.localeCompare(b, 'ko'));
  },
};
