-- ==============================================================================
-- NBASS 진단 규칙 동기화 마이그레이션 (v6 — app_logic_config)
-- ==============================================================================
-- 목적: PC 오너의 진단 규칙 커스텀(임계값·분류규칙 수정)을 Supabase에 저장해
--       모바일 이식 엔진이 같은 규칙으로 판정하도록 공유합니다.
--       단일 row(id='default') + lastModified 비교로 최신본이 이깁니다.
--       모바일은 읽기 전용입니다 (쓰기는 PC 오너 화면에서만).
--
-- 실행: Supabase Dashboard > SQL Editor에 전체 붙여넣고 실행. 멱등.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.app_logic_config (
  id TEXT PRIMARY KEY,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
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
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='app_logic_config')
     AND NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'nbass_touch_updated_at_app_logic_config') THEN
    CREATE TRIGGER nbass_touch_updated_at_app_logic_config
      BEFORE UPDATE ON public.app_logic_config
      FOR EACH ROW EXECUTE FUNCTION public.nbass_touch_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='app_logic_config') THEN
    RETURN;
  END IF;
  EXECUTE 'ALTER TABLE public.app_logic_config ENABLE ROW LEVEL SECURITY';
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'app_logic_config' AND policyname = 'nbass anon full access app_logic_config'
  ) THEN
    CREATE POLICY "nbass anon full access app_logic_config"
      ON public.app_logic_config FOR ALL TO anon USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'app_logic_config' AND policyname = 'nbass authenticated full access app_logic_config'
  ) THEN
    CREATE POLICY "nbass authenticated full access app_logic_config"
      ON public.app_logic_config FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='app_logic_config')
     AND NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'app_logic_config'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.app_logic_config;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='app_logic_config') THEN
    ALTER TABLE public.app_logic_config REPLICA IDENTITY FULL;
  END IF;
END $$;
