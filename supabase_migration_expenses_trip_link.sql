-- Add trip_id column to expenses table
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS trip_id UUID REFERENCES public.saved_trips(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON public.expenses(trip_id);
