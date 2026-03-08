-- Phase 8: Unified Bookings & Trip Linking
-- Run this in Supabase SQL Editor

-- 1. Create imported_bookings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.imported_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    parsed_data JSONB, -- Stores the raw JSON from email parser
    booking_type TEXT, -- 'flight', 'hotel', etc.
    confirmation_number TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add labeling and linking columns to existing tables

-- imported_bookings
ALTER TABLE public.imported_bookings 
ADD COLUMN IF NOT EXISTS trip_id UUID REFERENCES public.saved_trips(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS booking_label TEXT; -- Custom name for the booking

-- orders (Duffel)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS trip_id UUID REFERENCES public.saved_trips(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS booking_label TEXT;

-- booking_requests (Concierge)
ALTER TABLE public.booking_requests 
ADD COLUMN IF NOT EXISTS booking_label TEXT;

-- 3. Enable RLS for imported_bookings
ALTER TABLE public.imported_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own imported bookings" 
ON public.imported_bookings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own imported bookings" 
ON public.imported_bookings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own imported bookings" 
ON public.imported_bookings FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own imported bookings" 
ON public.imported_bookings FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_imported_bookings_user_id ON public.imported_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_imported_bookings_trip_id ON public.imported_bookings(trip_id);
CREATE INDEX IF NOT EXISTS idx_orders_trip_id ON public.orders(trip_id);
