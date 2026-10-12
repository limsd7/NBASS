-- ==============================================================================
-- NBASS id 타입 통합 마이그레이션 (v3 — UUID → TEXT)
-- ==============================================================================
-- 배경: grade_records / wrong_notes / sleep_records 의 id가 UUID였으나,
-- 안드로이드가 'grd-...', 'wn-...', 'slp-...' 형식 ID를 보내 upsert가
-- 'invalid input syntax for type uuid'로 거부되었습니다.
-- 5개 테이블(grade_records, grade_goals, sleep_records, sleep_goals,
-- wrong_notes)의 id를 TEXT로 바꿔 양쪽 ID 형식을 모두 받습니다.
-- (PC의 randomUUID 문자열도 TEXT에 그대로 저장됩니다.)
--
-- 적용: supabase_unified_migration.sql(v2) 실행 여부와 무관하게 단독 실행 가능.
-- 멱등이므로 여러 번 실행해도 안전합니다.
-- 신규 설치는 v2 파일 자체가 TEXT로 생성하므로 이 파일이 필요 없습니다.
-- ==============================================================================

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['grade_records', 'grade_goals', 'sleep_records', 'sleep_goals', 'wrong_notes']
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = t
        AND column_name = 'id' AND data_type = 'uuid'
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN id DROP DEFAULT', t);
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN id TYPE TEXT USING id::text', t);
    END IF;
  END LOOP;
END $$;
