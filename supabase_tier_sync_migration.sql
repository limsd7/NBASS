-- ==============================================================================
-- NBASS 등급 동기화 마이그레이션 (v4 — user_tiers)
-- ==============================================================================
-- 목적: PC 오너 화면의 등급 오버라이드(UserTierService)를 Supabase에 저장해
--       Android와 실시간으로 공유합니다.
--       PC에서 등급을 바꾸면 user_tiers에 upsert → Realtime으로 Android에 전파,
--       Android는 로그인한 student_id(대소문자 무시)와 일치하는 row를 적용합니다.
--
-- 실행: Supabase Dashboard > SQL Editor에 전체 붙여넣고 실행. 멱등.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.user_tiers (
  student_id TEXT PRIMARY KEY,
  tier TEXT NOT NULL DEFAULT 'free',
  name TEXT,
  granted_by TEXT,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.nbass_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_tiers')
     AND NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'nbass_touch_updated_at_user_tiers') THEN
    CREATE TRIGGER nbass_touch_updated_at_user_tiers
      BEFORE UPDATE ON public.user_tiers
      FOR EACH ROW EXECUTE FUNCTION public.nbass_touch_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_tiers') THEN
    RETURN;
  END IF;
  EXECUTE 'ALTER TABLE public.user_tiers ENABLE ROW LEVEL SECURITY';
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_tiers' AND policyname = 'nbass anon full access user_tiers'
  ) THEN
    CREATE POLICY "nbass anon full access user_tiers"
      ON public.user_tiers FOR ALL TO anon USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_tiers' AND policyname = 'nbass authenticated full access user_tiers'
  ) THEN
    CREATE POLICY "nbass authenticated full access user_tiers"
      ON public.user_tiers FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_tiers')
     AND NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'user_tiers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_tiers;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_tiers') THEN
    ALTER TABLE public.user_tiers REPLICA IDENTITY FULL;
  END IF;
END $$;
