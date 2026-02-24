-- ============================================
-- Fix: Resolve 4 Supabase Security Advisor warnings
-- 1. Function Search Path Mutable (x2)
-- 2. RLS Policy Always True on temporary_trips
-- 3. Leaked Password Protection (dashboard setting)
-- ============================================

-- -----------------------------------------------
-- FIX 1 & 2: Set search_path on trigger functions
-- Prevents schema search path attacks
-- -----------------------------------------------

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_booking_requests_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- -----------------------------------------------
-- FIX 3: Tighten RLS on temporary_trips
-- INSERT: require authenticated user (chat route already enforces auth)
-- SELECT: keep open (trips are shareable by UUID link)
-- -----------------------------------------------

-- Drop overly permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can create temporary trips" ON public.temporary_trips;

-- New INSERT policy: only authenticated users can create
CREATE POLICY "Authenticated users can create temporary trips"
    ON public.temporary_trips FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- SELECT stays as-is (read by UUID for sharing is intentional)
-- The "Anyone can view temporary trips" policy is kept.

-- -----------------------------------------------
-- FIX 4: Leaked Password Protection
-- This CANNOT be fixed via SQL. You must enable it in the Supabase dashboard:
--   Auth > Settings > Security > Enable "Leaked Password Protection"
-- -----------------------------------------------
