-- Migration: Add Duffel specific fields to booking_requests and saved_trips
-- This ensures we can link local records to Duffel Orders

-- 1. Update 'booking_requests' to store Duffel IDs and Details
ALTER TABLE public.booking_requests
ADD COLUMN IF NOT EXISTS duffel_order_id TEXT,
ADD COLUMN IF NOT EXISTS details JSONB,
ADD COLUMN IF NOT EXISTS trip_type TEXT DEFAULT 'trip'; -- 'flight', 'stay', 'trip'

-- Add index for looking up by Duffel ID (for webhooks/success page)
CREATE INDEX IF NOT EXISTS idx_booking_requests_duffel_id ON public.booking_requests(duffel_order_id);

-- 2. Update 'saved_trips' to ensure it can store rich data
ALTER TABLE public.saved_trips
ADD COLUMN IF NOT EXISTS trip_data JSONB, -- Stores full JSON object of the booking
ADD COLUMN IF NOT EXISTS is_halal BOOLEAN DEFAULT false;

-- 3. Ensure 'orders' table exists (from previous migration, just in case)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    duffel_order_id TEXT NOT NULL,
    type TEXT NOT NULL, -- 'flight', 'stay'
    status TEXT NOT NULL DEFAULT 'confirmed',
    total_amount DECIMAL(10, 2) NOT NULL,
    markup_amount DECIMAL(10, 2),
    currency TEXT NOT NULL DEFAULT 'USD',
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
