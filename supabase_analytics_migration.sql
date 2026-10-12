-- ==============================================================================
-- NBASS 분석 데이터 컬럼 추가 (v5 — analytics_data)
-- ==============================================================================
-- 목적: 모바일 정밀진단의 학습 분석(LearningAnalyticsData)을 assessments에 저장.
--       protocol_data는 기반 스키마에 이미 존재합니다.
-- 실행: Supabase Dashboard > SQL Editor에 전체 붙여넣고 실행. 멱등.
-- ==============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='assessments')
     AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='assessments' AND column_name='analytics_data'
  ) THEN
    ALTER TABLE public.assessments ADD COLUMN analytics_data JSONB;
  END IF;
END $$;
