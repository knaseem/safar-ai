-- Create travel_budgets table
CREATE TABLE IF NOT EXISTS public.travel_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    trip_id UUID NOT NULL REFERENCES public.saved_trips(id) ON DELETE CASCADE,
    total_budget NUMERIC NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    categories JSONB NOT NULL DEFAULT '{
        "lodging": 0,
        "flights": 0,
        "food": 0,
        "activities": 0,
        "other": 0
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, trip_id)
);

-- Enable RLS
ALTER TABLE public.travel_budgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own budgets"
    ON public.travel_budgets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budgets"
    ON public.travel_budgets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets"
    ON public.travel_budgets FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_travel_budgets_updated_at
    BEFORE UPDATE ON public.travel_budgets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
