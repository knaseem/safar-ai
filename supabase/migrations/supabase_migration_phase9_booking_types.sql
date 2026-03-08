-- Phase 9: Booking Types & Budget
-- Adds support for defining "Flight + Hotel", "Flight Only", or "Hotel Only" and specifying a budget.

-- Create booking_type enum
DO $$ BEGIN
    CREATE TYPE booking_type_enum AS ENUM ('all', 'flight', 'hotel');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns
ALTER TABLE public.booking_requests 
ADD COLUMN IF NOT EXISTS booking_type booking_type_enum DEFAULT 'all',
ADD COLUMN IF NOT EXISTS budget TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update constraint if room_type is expected to be null for 'flight' only?
-- The current check constraint allows nulls if the column is nullable, but let's check if they are NOT NULL.
-- Looking at phase7_5.sql, room_type has a CHECK but no NOT NULL constraint.
-- departure_city IS NOT NULL. If it's "Hotel Only", do we need departure city? 
-- Migration might need to relax some NOT NULL constraints if they exist.

-- Relax NOT NULL constraints for flexible booking types
ALTER TABLE public.booking_requests 
ALTER COLUMN departure_city DROP NOT NULL,
ALTER COLUMN departure_code DROP NOT NULL,
ALTER COLUMN check_in DROP NOT NULL, -- Maybe keep dates? But Flight Only might just be one date?
ALTER COLUMN check_out DROP NOT NULL;

-- If 'Flight Only', check_out might be null (one way)? For now let's assume round trip standard.
