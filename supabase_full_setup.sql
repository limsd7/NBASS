-- ==============================================================================
-- NBASS Supabase 전체 셋업 (순서대로 1회 실행, 멱등)
-- 1부: supabase_schema.sql (기본 + L: 추가 테이블)
-- 2부: supabase_unified_migration.sql (슈퍼셋 컬럼 + 정책/publication)
-- 3부: supabase_id_text_migration.sql (기존 UUID id를 TEXT로, 해당 없으면 no-op)
-- 4부: supabase_tier_sync_migration.sql (user_tiers 등급 동기화)
-- 5부: supabase_analytics_migration.sql (assessments.analytics_data)
-- 6부: supabase_logic_config_migration.sql (app_logic_config 진단 규칙 동기화)
-- v1(supabase_realtime_migration.sql)은 2부에 포함되므로 실행하지 마세요.
-- ==============================================================================

-- ==============================================================================
-- NBASS (Neuro-Bio Academic Strategy System) Supabase DB Schema
-- ==============================================================================
-- 멱등성(idempotent) 보장: 테이블은 IF NOT EXISTS, 정책은 pg_policies 확인 후 생성.
-- 스크립트를 여러 번 실행해도 안전합니다.

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (User Role & Profile)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'parent', 'expert', 'admin', 'owner')),
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Profiles are viewable by users who created them.') THEN
        CREATE POLICY "Profiles are viewable by users who created them."
            ON public.profiles FOR SELECT USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can insert their own profile.') THEN
        CREATE POLICY "Users can insert their own profile."
            ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can update own profile.') THEN
        CREATE POLICY "Users can update own profile."
            ON public.profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- 3. Subscriptions Table (Payments & Tiers)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'pro')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trialing')),
    payment_provider TEXT,
    payment_id TEXT,
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    amount NUMERIC NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'KRW',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'subscriptions' AND policyname = 'Users can view own subscription.') THEN
        CREATE POLICY "Users can view own subscription."
            ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'subscriptions' AND policyname = 'Users can insert own subscription.') THEN
        CREATE POLICY "Users can insert own subscription."
            ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'subscriptions' AND policyname = 'Users can update own subscription.') THEN
        CREATE POLICY "Users can update own subscription."
            ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 4. Assessments Table (Brain-Body & Cognitive Diagnosis Records)
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    survey_data JSONB,
    hrv_data JSONB,
    eeg_data JSONB,
    protocol_data JSONB,
    classification_result JSONB,
    care_type TEXT,
    care_score NUMERIC,
    study_efficiency_data JSONB,
    working_memory_result JSONB,
    cognitive_performance_result JSONB,
    analysis_text TEXT,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('draft', 'survey_only', 'hrv_added', 'full', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 기존 assessments 테이블에 status CHECK 제약 추가 (마이그레이션용)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assessments_status_check') THEN
        ALTER TABLE public.assessments DROP CONSTRAINT assessments_status_check;
    END IF;
    ALTER TABLE public.assessments ADD CONSTRAINT assessments_status_check
        CHECK (status IN ('draft', 'survey_only', 'hrv_added', 'full', 'completed'));
END $$;

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'assessments' AND policyname = 'Users can view own assessments.') THEN
        CREATE POLICY "Users can view own assessments."
            ON public.assessments FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'assessments' AND policyname = 'Users can insert own assessments.') THEN
        CREATE POLICY "Users can insert own assessments."
            ON public.assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'assessments' AND policyname = 'Users can update own assessments.') THEN
        CREATE POLICY "Users can update own assessments."
            ON public.assessments FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'assessments' AND policyname = 'Users can delete own assessments.') THEN
        CREATE POLICY "Users can delete own assessments."
            ON public.assessments FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 5. Content Queue Table (24/7 Autonomous Marketing Agent AEO / GEO Assets)
CREATE TABLE IF NOT EXISTS public.content_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('blog', 'sns', 'email', 'notification')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'published')),
    scheduled_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.content_queue ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'content_queue' AND policyname = 'Allow public read for published content.') THEN
        CREATE POLICY "Allow public read for published content."
            ON public.content_queue FOR SELECT USING (status = 'published');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'content_queue' AND policyname = 'Owners and admins can manage content queue.') THEN
        CREATE POLICY "Owners and admins can manage content queue."
            ON public.content_queue FOR ALL USING (
                EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('owner', 'admin'))
            ) WITH CHECK (
                EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('owner', 'admin'))
            );
    END IF;
END $$;

-- 6. Marketing Daily Budget & Ad Analytics Table (Daily 500,000 KRW Tracking)
CREATE TABLE IF NOT EXISTS public.marketing_campaign_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    daily_budget_krw NUMERIC NOT NULL DEFAULT 500000,
    spent_krw NUMERIC NOT NULL DEFAULT 0,
    conversions INT NOT NULL DEFAULT 0,
    roas NUMERIC NOT NULL DEFAULT 0,
    channel_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    ai_optimization_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.marketing_campaign_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'marketing_campaign_logs' AND policyname = 'Owners and admins can manage marketing logs.') THEN
        CREATE POLICY "Owners and admins can manage marketing logs."
            ON public.marketing_campaign_logs FOR ALL USING (
                EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('owner', 'admin'))
            ) WITH CHECK (
                EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('owner', 'admin'))
            );
    END IF;
END $$;

-- 7. Affiliated Academies Table (Owner-managed partner academies/schools)
CREATE TABLE IF NOT EXISTS public.affiliated_academies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    region TEXT,
    added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.affiliated_academies ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'affiliated_academies' AND policyname = 'Affiliated academies are viewable by everyone.') THEN
        CREATE POLICY "Affiliated academies are viewable by everyone."
            ON public.affiliated_academies FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'affiliated_academies' AND policyname = 'Owners can insert affiliated academies.') THEN
        CREATE POLICY "Owners can insert affiliated academies."
            ON public.affiliated_academies FOR INSERT WITH CHECK (auth.uid() = added_by);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'affiliated_academies' AND policyname = 'Owners can update own affiliated academies.') THEN
        CREATE POLICY "Owners can update own affiliated academies."
            ON public.affiliated_academies FOR UPDATE USING (auth.uid() = added_by);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'affiliated_academies' AND policyname = 'Owners can delete own affiliated academies.') THEN
        CREATE POLICY "Owners can delete own affiliated academies."
            ON public.affiliated_academies FOR DELETE USING (auth.uid() = added_by);
    END IF;
END $$;

-- 8. Grades Table (Student exam grade records)
CREATE TABLE IF NOT EXISTS public.grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exam_type TEXT NOT NULL,
    subject TEXT NOT NULL,
    score NUMERIC NOT NULL,
    grade_rank TEXT,
    exam_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'grades' AND policyname = 'Users can view own grades.') THEN
        CREATE POLICY "Users can view own grades."
            ON public.grades FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'grades' AND policyname = 'Users can insert own grades.') THEN
        CREATE POLICY "Users can insert own grades."
            ON public.grades FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'grades' AND policyname = 'Users can update own grades.') THEN
        CREATE POLICY "Users can update own grades."
            ON public.grades FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'grades' AND policyname = 'Users can delete own grades.') THEN
        CREATE POLICY "Users can delete own grades."
            ON public.grades FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 8b. Grade Records Table (앱 upsert 키와 일치: student_id + exam_name + exam_date)
-- 앱 코드(services/database.ts syncGradeRecordToSupabase)가 이 테이블을 사용한다.
-- user_id는 로그인 세션이 있을 때만 기록된다 (없으면 로컬 전용, RLS에 의해 차단).
CREATE TABLE IF NOT EXISTS public.grade_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,
    exam_name TEXT NOT NULL DEFAULT '',
    exam_type TEXT NOT NULL DEFAULT 'mock_exam',
    exam_date DATE NOT NULL DEFAULT CURRENT_DATE,
    subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
    memo TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, exam_name, exam_date)
);

ALTER TABLE public.grade_records ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'grade_records' AND policyname = 'Users can view own grade records.') THEN
        CREATE POLICY "Users can view own grade records."
            ON public.grade_records FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'grade_records' AND policyname = 'Users can insert own grade records.') THEN
        CREATE POLICY "Users can insert own grade records."
            ON public.grade_records FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'grade_records' AND policyname = 'Users can update own grade records.') THEN
        CREATE POLICY "Users can update own grade records."
            ON public.grade_records FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'grade_records' AND policyname = 'Users can delete own grade records.') THEN
        CREATE POLICY "Users can delete own grade records."
            ON public.grade_records FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 8c. Grade Goals Table (앱 upsert 키와 일치: student_id + subject_id)
CREATE TABLE IF NOT EXISTS public.grade_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
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

ALTER TABLE public.grade_goals ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'grade_goals' AND policyname = 'Users can view own grade goals.') THEN
        CREATE POLICY "Users can view own grade goals."
            ON public.grade_goals FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'grade_goals' AND policyname = 'Users can insert own grade goals.') THEN
        CREATE POLICY "Users can insert own grade goals."
            ON public.grade_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'grade_goals' AND policyname = 'Users can update own grade goals.') THEN
        CREATE POLICY "Users can update own grade goals."
            ON public.grade_goals FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'grade_goals' AND policyname = 'Users can delete own grade goals.') THEN
        CREATE POLICY "Users can delete own grade goals."
            ON public.grade_goals FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 8d. Gamification Progress Table (주간 액션 플래너 기기 간 공유: student_id + week_key)
CREATE TABLE IF NOT EXISTS public.gamification_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,
    week_key TEXT NOT NULL DEFAULT '',
    completed_tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
    exp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    streak INTEGER NOT NULL DEFAULT 0,
    last_completed_date DATE,
    task_log JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, week_key)
);

ALTER TABLE public.gamification_progress ENABLE ROW LEVEL SECURITY;

-- 기존 설치분 task_log 컬럼 추가 (신규 설치는 위 CREATE TABLE에 포함)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'gamification_progress' AND column_name = 'task_log'
    ) THEN
        ALTER TABLE public.gamification_progress ADD COLUMN task_log JSONB NOT NULL DEFAULT '{}'::jsonb;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'gamification_progress' AND policyname = 'Users can view own gamification progress.') THEN
        CREATE POLICY "Users can view own gamification progress."
            ON public.gamification_progress FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'gamification_progress' AND policyname = 'Users can insert own gamification progress.') THEN
        CREATE POLICY "Users can insert own gamification progress."
            ON public.gamification_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'gamification_progress' AND policyname = 'Users can update own gamification progress.') THEN
        CREATE POLICY "Users can update own gamification progress."
            ON public.gamification_progress FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'gamification_progress' AND policyname = 'Users can delete own gamification progress.') THEN
        CREATE POLICY "Users can delete own gamification progress."
            ON public.gamification_progress FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 8e. Habit Progress Table (공부습관 클리닉 기기 간 공유: student_id 단일 행, 필드별 LWW)
CREATE TABLE IF NOT EXISTS public.habit_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL UNIQUE,
    fields JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.habit_progress ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'habit_progress' AND policyname = 'Users can view own habit progress.') THEN
        CREATE POLICY "Users can view own habit progress."
            ON public.habit_progress FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'habit_progress' AND policyname = 'Users can insert own habit progress.') THEN
        CREATE POLICY "Users can insert own habit progress."
            ON public.habit_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'habit_progress' AND policyname = 'Users can update own habit progress.') THEN
        CREATE POLICY "Users can update own habit progress."
            ON public.habit_progress FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'habit_progress' AND policyname = 'Users can delete own habit progress.') THEN
        CREATE POLICY "Users can delete own habit progress."
            ON public.habit_progress FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 9. Daily Briefings Table (Owner/Admin daily operational briefing)
CREATE TABLE IF NOT EXISTS public.daily_briefings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    pending_approvals INT NOT NULL DEFAULT 0,
    pending_exceptions INT NOT NULL DEFAULT 0,
    ai_suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
    content TEXT,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.daily_briefings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'daily_briefings' AND policyname = 'Owners and admins can view daily briefings.') THEN
        CREATE POLICY "Owners and admins can view daily briefings."
            ON public.daily_briefings FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.profiles p
                    WHERE p.id = auth.uid() AND p.role IN ('owner', 'admin')
                )
            );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'daily_briefings' AND policyname = 'Owners and admins can insert daily briefings.') THEN
        CREATE POLICY "Owners and admins can insert daily briefings."
            ON public.daily_briefings FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.profiles p
                    WHERE p.id = auth.uid() AND p.role IN ('owner', 'admin')
                )
            );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'daily_briefings' AND policyname = 'Owners and admins can update daily briefings.') THEN
        CREATE POLICY "Owners and admins can update daily briefings."
            ON public.daily_briefings FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM public.profiles p
                    WHERE p.id = auth.uid() AND p.role IN ('owner', 'admin')
                )
            );
    END IF;
END $$;

-- 10. Exception Queue Table (Refund/error/complaint/escalation handling)
CREATE TABLE IF NOT EXISTS public.exception_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('refund', 'error', 'complaint', 'escalation')),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    ai_recommendation TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.exception_queue ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'exception_queue' AND policyname = 'Owners and admins can view exception queue.') THEN
        CREATE POLICY "Owners and admins can view exception queue."
            ON public.exception_queue FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.profiles p
                    WHERE p.id = auth.uid() AND p.role IN ('owner', 'admin')
                )
            );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'exception_queue' AND policyname = 'Owners and admins can insert exception queue.') THEN
        CREATE POLICY "Owners and admins can insert exception queue."
            ON public.exception_queue FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.profiles p
                    WHERE p.id = auth.uid() AND p.role IN ('owner', 'admin')
                )
            );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'exception_queue' AND policyname = 'Owners and admins can update exception queue.') THEN
        CREATE POLICY "Owners and admins can update exception queue."
            ON public.exception_queue FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM public.profiles p
                    WHERE p.id = auth.uid() AND p.role IN ('owner', 'admin')
                )
            );
    END IF;
END $$;

-- 11. Email Sequences Table (Automated marketing email drip campaigns)
CREATE TABLE IF NOT EXISTS public.email_sequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sequence_name TEXT NOT NULL,
    step INT NOT NULL DEFAULT 1,
    sent_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'opened', 'clicked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'email_sequences' AND policyname = 'Users can view own email sequences.') THEN
        CREATE POLICY "Users can view own email sequences."
            ON public.email_sequences FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'email_sequences' AND policyname = 'Users can insert own email sequences.') THEN
        CREATE POLICY "Users can insert own email sequences."
            ON public.email_sequences FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'email_sequences' AND policyname = 'Users can update own email sequences.') THEN
        CREATE POLICY "Users can update own email sequences."
            ON public.email_sequences FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 12. Analytics Events Table (Product usage & marketing analytics)
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    event_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'analytics_events' AND policyname = 'Owners and admins can view analytics events.') THEN
        CREATE POLICY "Owners and admins can view analytics events."
            ON public.analytics_events FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.profiles p
                    WHERE p.id = auth.uid() AND p.role IN ('owner', 'admin')
                )
            );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'analytics_events' AND policyname = 'Users can insert own analytics events.') THEN
        CREATE POLICY "Users can insert own analytics events."
            ON public.analytics_events FOR INSERT WITH CHECK (
                auth.uid() = user_id OR
                EXISTS (
                    SELECT 1 FROM public.profiles p
                    WHERE p.id = auth.uid() AND p.role IN ('owner', 'admin')
                )
            );
    END IF;
END $$;

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
