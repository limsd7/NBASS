-- ==============================================================================
-- NBASS Supabase Realtime 동기화 마이그레이션
-- ==============================================================================
-- 목적: 앱 ↔ Supabase 양방향 실시간 동기화(Realtime postgres_changes) 활성화
--
-- 배경:
--   - 앱 코드(database.ts)는 grade_records / grade_goals / sleep_records /
--     sleep_goals 테이블에 upsert 하지만, supabase_schema.sql에는 해당 테이블이
--     없어 푸시가 항상 실패합니다.
--   - assessments.user_id 가 NOT NULL 이지만 앱은 user_id 없이 insert 하므로
--     푸시가 실패합니다 (anon 키 단독 사용 가정).
--   - 어떤 테이블도 supabase_realtime publication에 등록되어 있지 않아
--     Realtime 구독이 동작하지 않습니다.
--
-- 실행: Supabase Dashboard → SQL Editor에 이 파일 전체를 붙여넣고 실행.
--       멱등(idempotent)하므로 여러 번 실행해도 안전합니다.
-- ==============================================================================

-- 0. UUID 확장
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. assessments.user_id 를 NULL 허용으로 완화 (anon 단독 운용 대응)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'assessments' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.assessments ALTER COLUMN user_id DROP NOT NULL;
  END IF;
END $$;

-- updated_at 컬럼 보장
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'assessments' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.assessments ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- 2. 성적/수면 테이블 생성 (앱 페이로드와 1:1 대응)
CREATE TABLE IF NOT EXISTS public.grade_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id TEXT NOT NULL,
  exam_name TEXT NOT NULL,
  exam_type TEXT NOT NULL DEFAULT 'mock_exam',
  exam_date DATE NOT NULL,
  subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
  memo TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, exam_name, exam_date)
);

CREATE TABLE IF NOT EXISTS public.grade_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  tier1_target NUMERIC,
  tier2_target NUMERIC,
  tier3_target NUMERIC,
  current_grade NUMERIC,
  memo TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, subject_id)
);

CREATE TABLE IF NOT EXISTS public.sleep_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id TEXT NOT NULL,
  date DATE NOT NULL,
  bedtime TEXT,
  wake_time TEXT,
  sleep_quality INT,
  memo TEXT NOT NULL DEFAULT '',
  stages JSONB,
  night_hrv NUMERIC,
  screen_time INT,
  sleep_delay INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, date)
);

CREATE TABLE IF NOT EXISTS public.sleep_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id TEXT NOT NULL UNIQUE,
  target_bedtime TEXT,
  target_wake_time TEXT,
  target_duration NUMERIC,
  memo TEXT NOT NULL DEFAULT '',
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  condition_score NUMERIC NOT NULL DEFAULT 0,
  is_dday_mode BOOLEAN NOT NULL DEFAULT false,
  dday_date DATE,
  dday_target_wake_time TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION public.nbass_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['assessments', 'grade_records', 'grade_goals', 'sleep_records', 'sleep_goals', 'affiliated_academies']
  LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'nbass_touch_updated_at_' || t) THEN
      EXECUTE format(
        'CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.nbass_touch_updated_at()',
        'nbass_touch_updated_at_' || t, t
      );
    END IF;
  END LOOP;
END $$;

-- 4. RLS + anon 정책 (단일 사용자 데스크톱 앱의 anon 키 운용 대응)
-- 주의: anon 전체 허용은 1인/소규모 운용 전제입니다. 다중 사용자 서비스로 전환 시
-- auth 기반 정책으로 교체하세요.
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['assessments', 'grade_records', 'grade_goals', 'sleep_records', 'sleep_goals', 'affiliated_academies']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = t AND policyname = 'nbass anon full access ' || t
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL TO anon USING (true) WITH CHECK (true)',
        'nbass anon full access ' || t, t
      );
    END IF;
    -- 로그인 사용자(authenticated)도 동일하게 허용 (향후 Auth 도입 대비)
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = t AND policyname = 'nbass authenticated full access ' || t
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
        'nbass authenticated full access ' || t, t
      );
    END IF;
  END LOOP;
END $$;

-- 5. Realtime publication 등록 (핵심 — 없으면 실시간 구독이 동작하지 않음)
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['assessments', 'grade_records', 'grade_goals', 'sleep_records', 'sleep_goals', 'affiliated_academies']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

-- 6. REPLICA IDENTITY FULL (UPDATE/DELETE의 old 레코드 수신 보장)
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['assessments', 'grade_records', 'grade_goals', 'sleep_records', 'sleep_goals', 'affiliated_academies']
  LOOP
    EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL', t);
  END LOOP;
END $$;
