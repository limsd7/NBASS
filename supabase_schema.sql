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
