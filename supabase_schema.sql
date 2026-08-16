-- ==============================================================================
-- NBASS (Neuro-Bio Academic Strategy System) Supabase DB Schema
-- ==============================================================================

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

CREATE POLICY "Profiles are viewable by users who created them." 
    ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile." 
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

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

CREATE POLICY "Users can view own subscription." 
    ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

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
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assessments." 
    ON public.assessments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments." 
    ON public.assessments FOR INSERT WITH CHECK (auth.uid() = user_id);

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

CREATE POLICY "Allow public read for published content." 
    ON public.content_queue FOR SELECT USING (status = 'published');

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
