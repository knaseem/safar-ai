-- Migration to support persistence for generated trips before they are officially saved
-- This table allows users to refresh the page without losing their generated itinerary.

CREATE TABLE IF NOT EXISTS public.temporary_trips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Optional if not logged in
    trip_data JSONB NOT NULL,
    is_halal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.temporary_trips ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert a temporary trip (anonymous generation)
CREATE POLICY "Anyone can create temporary trips" 
    ON public.temporary_trips FOR INSERT 
    WITH CHECK (true);

-- Allow anyone to view a temporary trip by ID
CREATE POLICY "Anyone can view temporary trips" 
    ON public.temporary_trips FOR SELECT 
    USING (true);

-- Optional: Index for cleanup later
CREATE INDEX IF NOT EXISTS idx_temporary_trips_created_at ON public.temporary_trips(created_at);
