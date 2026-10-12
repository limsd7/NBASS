-- ==============================================================================
-- NBASS PC-Android 통합 동기화 마이그레이션 (v2, 단독 실행용)
-- ==============================================================================
-- 목적: PC(웹/일렉트론) 앱과 android_app이 같은 Supabase 프로젝트를 보고
--       양방향 Realtime 동기화가 되도록 스키마를 통합합니다.
--       supabase_realtime_migration.sql(v1)을 대체합니다. v1을 이미 실행했어도
--       이 파일을 실행하면 됩니다(멱등). v1 미실행 상태에서 바로 실행해도 됩니다.
--
-- 전제: supabase_schema.sql의 기본 테이블(assessments, affiliated_academies 등)은
--       먼저 실행되어 있어야 합니다. (없어도 이 파일은 실패하지 않습니다.)
--
-- 핵심 통합 내용:
--   1) grade_records / sleep_records 를 PC+Android 슈퍼셋 컬럼으로 통합
--      - PC: subjects(JSONB), exam_type, sleep_quality(INT), stages ...
--      - Android: scores(JSONB), bed_time, quality(TEXT), total_hours ...
--      - 양쪽이 서로의 컬럼을 NULL 허용으로 공존 (덮어쓰지 않음)
--   2) Android 전용 테이블 생성: student_schedules / wrong_notes / habit_diagnoses
--   3) v1의 UNIQUE(student_id, exam_name, exam_date) / UNIQUE(student_id, date) 제거
--      - 양쪽 기기가 같은 시험/날짜에 각자 row를 만들 수 있으므로 PK(id)만 유지
--   4) 9개 테이블 전체에 anon/authenticated 정책 + Realtime publication 등록
--   5) id는 TEXT PK (PC randomUUID와 Android 구/신 ID 형식을 모두 수용)
--
-- 실행: Supabase Dashboard > SQL Editor에 전체 붙여넣고 실행.
-- 앱 설정: PC lib/supabase.ts 기본값과 android_app/src/lib/supabase.ts가 같은
-- 프로젝트(qnkbekaaxsgenofnmuab)를 가리키도록 코드에 반영되어 있습니다.
-- 동기화 매칭 키는 student_id 문자열이므로, 양쪽에서 같은 ID로 로그인해야
-- 같은 학생의 데이터가 만납니다.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- 0. assessments.user_id NULL 허용 (anon 단독 운용 대응, v1과 동일)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'assessments' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.assessments ALTER COLUMN user_id DROP NOT NULL;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'assessments'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'assessments' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.assessments ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 1. grade_records (PC + Android 슈퍼셋)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.grade_records (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  exam_name TEXT NOT NULL,
  exam_type TEXT NOT NULL DEFAULT 'mock_exam',
  exam_date DATE,
  subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
  scores JSONB NOT NULL DEFAULT '[]'::jsonb,
  memo TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- v1 이후 추가된 Android 공존 컬럼 보장
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='grade_records' AND column_name='scores') THEN
    ALTER TABLE public.grade_records ADD COLUMN scores JSONB NOT NULL DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='grade_records' AND column_name='subjects') THEN
    ALTER TABLE public.grade_records ADD COLUMN subjects JSONB NOT NULL DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='grade_records' AND column_name='exam_type') THEN
    ALTER TABLE public.grade_records ADD COLUMN exam_type TEXT NOT NULL DEFAULT 'mock_exam';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='grade_records' AND column_name='created_at') THEN
    ALTER TABLE public.grade_records ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='grade_records' AND column_name='updated_at') THEN
    ALTER TABLE public.grade_records ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- v1 UNIQUE 제약 제거 (양쪽 기기 각자 row 허용, upsert는 id 기준)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'grade_records_student_id_exam_name_exam_date_key') THEN
    ALTER TABLE public.grade_records DROP CONSTRAINT grade_records_student_id_exam_name_exam_date_key;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'grade_goals_student_id_subject_id_key') THEN
    ALTER TABLE public.grade_goals DROP CONSTRAINT grade_goals_student_id_subject_id_key;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.grade_goals (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  tier1_target NUMERIC,
  tier2_target NUMERIC,
  tier3_target NUMERIC,
  current_grade NUMERIC,
  memo TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_grade_goals_student ON public.grade_goals (student_id);

-- ---------------------------------------------------------------------------
-- 2. sleep_records (PC + Android 슈퍼셋)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sleep_records (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  date DATE,
  bedtime TEXT,
  bed_time TEXT,
  wake_time TEXT,
  sleep_quality INT,
  quality TEXT,
  total_hours NUMERIC,
  sleep_debt_hours NUMERIC,
  memo TEXT NOT NULL DEFAULT '',
  stages JSONB,
  night_hrv NUMERIC,
  screen_time INT,
  sleep_delay INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='sleep_records' AND column_name='bed_time') THEN
    ALTER TABLE public.sleep_records ADD COLUMN bed_time TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='sleep_records' AND column_name='quality') THEN
    ALTER TABLE public.sleep_records ADD COLUMN quality TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='sleep_records' AND column_name='total_hours') THEN
    ALTER TABLE public.sleep_records ADD COLUMN total_hours NUMERIC;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='sleep_records' AND column_name='sleep_debt_hours') THEN
    ALTER TABLE public.sleep_records ADD COLUMN sleep_debt_hours NUMERIC;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='sleep_records' AND column_name='bedtime') THEN
    ALTER TABLE public.sleep_records ADD COLUMN bedtime TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='sleep_records' AND column_name='sleep_quality') THEN
    ALTER TABLE public.sleep_records ADD COLUMN sleep_quality INT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='sleep_records' AND column_name='created_at') THEN
    ALTER TABLE public.sleep_records ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='sleep_records' AND column_name='updated_at') THEN
    ALTER TABLE public.sleep_records ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sleep_records_student_id_date_key') THEN
    ALTER TABLE public.sleep_records DROP CONSTRAINT sleep_records_student_id_date_key;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.sleep_goals (
  id TEXT PRIMARY KEY,
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

-- ---------------------------------------------------------------------------
-- 3. Android 전용 테이블 (PC도 Realtime 수신, 스케줄/오답노트는 PC에 병합)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_schedules (
  student_id TEXT PRIMARY KEY,
  schedules JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wrong_notes (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  subject TEXT,
  unit_name TEXT,
  question_number TEXT,
  image_url TEXT,
  error_reason TEXT,
  memo TEXT NOT NULL DEFAULT '',
  ai_prescription TEXT,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  question_title TEXT,
  wrong_answer TEXT,
  correct_answer TEXT,
  explanation TEXT,
  difficulty TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wrong_notes_student ON public.wrong_notes (student_id);

CREATE TABLE IF NOT EXISTS public.habit_diagnoses (
  student_id TEXT PRIMARY KEY,
  checked_habits JSONB NOT NULL DEFAULT '[]'::jsonb,
  shock_report TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 주의: gamification_progress / habit_progress 의 UNIQUE 제약과 UUID 기본값은
-- L: 앱 코드가 id 없이 upsert하므로 그대로 유지합니다 (id TEXT 전환 대상 제외).

-- 4. updated_at 자동 갱신 트리거
-- ---------------------------------------------------------------------------
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
  FOREACH t IN ARRAY ARRAY['assessments', 'grade_records', 'grade_goals', 'sleep_records', 'sleep_goals', 'affiliated_academies', 'student_schedules', 'wrong_notes', 'habit_diagnoses', 'gamification_progress', 'habit_progress']
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=t)
       AND NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'nbass_touch_updated_at_' || t) THEN
      EXECUTE format(
        'CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.nbass_touch_updated_at()',
        'nbass_touch_updated_at_' || t, t
      );
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 5. RLS + anon/authenticated 정책 (1인-소규모 anon 운용 전제)
-- ---------------------------------------------------------------------------
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['assessments', 'grade_records', 'grade_goals', 'sleep_records', 'sleep_goals', 'affiliated_academies', 'student_schedules', 'wrong_notes', 'habit_diagnoses', 'gamification_progress', 'habit_progress']
  LOOP
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=t) THEN
      CONTINUE;
    END IF;
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

-- ---------------------------------------------------------------------------
-- 6. Realtime publication 등록 (실시간 구독의 핵심)
-- ---------------------------------------------------------------------------
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['assessments', 'grade_records', 'grade_goals', 'sleep_records', 'sleep_goals', 'affiliated_academies', 'student_schedules', 'wrong_notes', 'habit_diagnoses', 'gamification_progress', 'habit_progress']
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=t)
       AND NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 7. REPLICA IDENTITY FULL (UPDATE/DELETE old 레코드 수신 보장)
-- ---------------------------------------------------------------------------
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['assessments', 'grade_records', 'grade_goals', 'sleep_records', 'sleep_goals', 'affiliated_academies', 'student_schedules', 'wrong_notes', 'habit_diagnoses', 'gamification_progress', 'habit_progress']
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=t) THEN
      EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL', t);
    END IF;
  END LOOP;
END $$;
