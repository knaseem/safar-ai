-- Phase 8: Advanced Booking Preferences
-- Adds support for seat preferences, baggage counts, dietary requirements, and special occasions.

-- Update seat_preference check constraint
ALTER TABLE public.booking_requests 
DROP CONSTRAINT IF EXISTS booking_requests_seat_preference_check;

ALTER TABLE public.booking_requests 
ADD CONSTRAINT booking_requests_seat_preference_check 
CHECK (seat_preference IN ('aisle', 'window', 'no-preference'));

-- Add new columns
ALTER TABLE public.booking_requests 
ADD COLUMN IF NOT EXISTS baggage_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS dietary_requirements TEXT,
ADD COLUMN IF NOT EXISTS is_special_occasion BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS occasion_type TEXT;

-- Rename baggage to baggage_legacy (optional, to keep it clean)
-- ALTER TABLE public.booking_requests RENAME COLUMN baggage TO baggage_legacy;
