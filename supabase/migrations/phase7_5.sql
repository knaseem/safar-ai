-- Phase 7.5: Booking Requests Table
-- Run this migration in Supabase SQL Editor

-- Create the booking_requests table
CREATE TABLE IF NOT EXISTS public.booking_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Trip reference
    trip_id UUID REFERENCES public.saved_trips(id) ON DELETE SET NULL,
    trip_name TEXT NOT NULL,
    destination TEXT NOT NULL,
    is_halal BOOLEAN DEFAULT FALSE,
    
    -- Travel details
    departure_city TEXT NOT NULL,
    departure_code TEXT NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    travelers JSONB NOT NULL DEFAULT '{"adults": 2, "children": 0, "infants": 0}',
    
    -- Preferences
    room_type TEXT DEFAULT 'double' CHECK (room_type IN ('single', 'double', 'suite')),
    flight_class TEXT DEFAULT 'economy' CHECK (flight_class IN ('economy', 'business', 'first')),
    seat_preference TEXT DEFAULT 'no_preference' CHECK (seat_preference IN ('aisle', 'window', 'no_preference')),
    baggage TEXT DEFAULT 'checked' CHECK (baggage IN ('carry_on', 'checked')),
    
    -- Contact info
    contact_first_name TEXT NOT NULL,
    contact_last_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    
    -- Add-ons
    travel_insurance BOOLEAN DEFAULT FALSE,
    special_requests TEXT,
    
    -- Pricing
    estimated_price NUMERIC(10,2) NOT NULL,
    insurance_price NUMERIC(10,2) DEFAULT 0,
    
    -- Status tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'booked', 'cancelled')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only manage their own booking requests
CREATE POLICY "Users can view own booking requests"
    ON public.booking_requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own booking requests"
    ON public.booking_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own booking requests"
    ON public.booking_requests FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own booking requests"
    ON public.booking_requests FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_booking_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_booking_requests_updated_at
    BEFORE UPDATE ON public.booking_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_booking_requests_updated_at();

-- Create index for faster user queries
CREATE INDEX IF NOT EXISTS idx_booking_requests_user_id ON public.booking_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON public.booking_requests(status);
