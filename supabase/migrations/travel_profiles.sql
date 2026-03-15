-- travel_profiles table
-- Created manually during initial setup. This migration documents the schema.
CREATE TABLE IF NOT EXISTS public.travel_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'pro', 'vip')),
    stripe_customer_id TEXT,
    import_token TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
    traits JSONB DEFAULT '{}',
    travel_style TEXT,
    preferred_currency TEXT DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.travel_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.travel_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.travel_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.travel_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS travel_profiles_user_id_idx ON public.travel_profiles(user_id);
CREATE INDEX IF NOT EXISTS travel_profiles_stripe_customer_id_idx ON public.travel_profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS travel_profiles_import_token_idx ON public.travel_profiles(import_token);
