-- Migration to add admin roles to travel profiles

-- Add is_admin column, defaulting to false
ALTER TABLE public.travel_profiles
ADD COLUMN is_admin BOOLEAN DEFAULT false;

-- Create an index to quickly filter admins if needed
CREATE INDEX IF NOT EXISTS idx_travel_profiles_is_admin ON public.travel_profiles(is_admin);

-- (Optional) Update existing specific users to be admins based on the previous env var list
-- This is a one-time migration to ensure continuity
UPDATE public.travel_profiles
SET is_admin = true
WHERE user_id IN (
    SELECT id FROM auth.users WHERE email IN ('knaseem22@gmail.com')
);
