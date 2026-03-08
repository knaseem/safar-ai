-- Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    date DATE NOT NULL,
    type TEXT NOT NULL, -- 'flight', 'hotel', 'activity', 'food', etc.
    status TEXT DEFAULT 'confirmed',
    reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own expenses" 
ON public.expenses FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" 
ON public.expenses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" 
ON public.expenses FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" 
ON public.expenses FOR DELETE 
USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date);
